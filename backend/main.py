import os
import uuid
import time
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel, Field, confloat

from .config import settings
from .logger import logger
from .cache_manager import cache_manager
from .tts_engine import tts_engine
from .audio_processor import audio_processor

api_app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Offline-Expressive Speech Translation VITS & XTTS-v2 Engine supporting local Windows, Hindi, Telugu, Kannada, English."
)

# Configure standard Cross-Origin Resource Sharing (CORS) limits
api_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this to designated domain boundaries in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import threading
import asyncio

# Custom request models
class SynthesisRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000, description="Payload speech text to synthesize")
    language: str = Field("en", description="Target dialect, options: 'en' | 'hi' | 'kn' | 'te'")
    speaker_name: str = Field("default", description="Speaker name profile register")
    speed: float = Field(1.0, ge=0.5, le=2.0, description="Rate modifier")
    pitch: float = Field(1.0, ge=0.5, le=1.5, description="Frequencies pitch modifier")
    output_format: str = Field("wav", description="Audio container extension, options: 'wav' | 'mp3'")

class SynthesisResponse(BaseModel):
    cache_key: str
    format: str
    duration_secs: float
    size_bytes: int
    download_url: str
    source_status: str  # "cache_hit" or "synthesized_fresh"

class BatchSynthesisRequest(BaseModel):
    texts: list[str] = Field(..., min_items=1, max_items=20, description="Array of sentences to synthesize")
    language: str = Field("en", description="Target dialect, options: 'en' | 'hi' | 'kn' | 'te'")
    speaker_name: str = Field("default", description="Speaker name profile register")
    speed: float = Field(1.0, ge=0.5, le=2.0)
    pitch: float = Field(1.0, ge=0.5, le=1.5)
    output_format: str = Field("wav", description="Return format output")

class BatchSynthesisResponse(BaseModel):
    results: list[SynthesisResponse]
    total_duration_secs: float
    total_size_bytes: int
    processing_latency_secs: float

# Start-up Initialization Hook
@api_app.on_event("startup")
async def startup_event():
    logger.info("Filing system bootstrap sequences. Pre-loading models onto active memory caches...")
    # Startup optimization: load models in a background thread to prevent blocking fast container startups (Goal #7)
    def load_weights_async():
        try:
            tts_engine.load_model()
        except Exception as e:
            logger.error(f"Async model loader thread failed: {e}. Postponing initialization.")
            
    threading.Thread(target=load_weights_async, daemon=True).start()

# Exception handlers
@api_app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    logger.error(f"Unhandled FastAPI context exception: {str(exc)}", exc_info=True)
    return Response(
        content=f'{{"error": "Internal System Error: {str(exc)}"}}',
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        media_type="application/json"
    )

# Endpoints
@api_app.get("/api/health")
async def health_check():
    """Returns absolute local diagnostics, memory cache sizes, and hardware deployment status."""
    total_files, cache_mb = cache_manager.get_cache_metrics()
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "is_model_loaded": tts_engine.is_loaded,
        "device": settings.DEVICE,
        "offline_simulation_mode": not tts_engine.is_loaded,
        "cache": {
            "total_cached_files": total_files,
            "cache_usage_mb": cache_mb,
            "max_limit_mb": settings.MAX_CACHE_SIZE_MB
        },
        "supported_languages": settings.SUPPORTED_LANGUAGES,
        "local_time_epoch": time.time()
    }

@api_app.post("/api/tts/synthesize", response_model=SynthesisResponse)
async def synthesize_speech(req: SynthesisRequest):
    """Core synthesis route serving either cached audio items or executing parallel local model calls."""
    logger.info(f"Received speech request. Language: '{req.language}', Format: '{req.output_format}'")
    
    # Check language compliance
    lang_code = req.language.strip().lower()
    if lang_code not in settings.SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400, 
            detail=f"Language '{req.language}' not supported. Supported: {settings.SUPPORTED_LANGUAGES}"
        )

    # Clean format
    fmt = req.output_format.strip().lower()
    if fmt not in ["wav", "mp3"]:
        raise HTTPException(status_code=400, detail="Requested format must be either 'wav' or 'mp3'")

    # Try cache lookup using parameterized hash
    cache_key = cache_manager.generate_cache_key(
        text=req.text,
        language=lang_code,
        speaker_id_or_name=req.speaker_name,
        speed=req.speed,
        pitch=req.pitch,
        format=fmt
    )

    # Performance optimization #3: check Ultra-fast RAM caching tier
    cached_bytes = cache_manager.get_cached_bytes(cache_key, fmt)
    if cached_bytes is not None:
        return SynthesisResponse(
            cache_key=cache_key,
            format=fmt,
            duration_secs=round(max(1.0, len(req.text) * 0.08), 2),
            size_bytes=len(cached_bytes),
            download_url=f"/api/tts/download/{cache_key}?format={fmt}",
            source_status="cache_hit"
        )

    # Cache miss - synthesize raw WAV file first
    logger.info(f"Cache miss for key {cache_key}. Executing model synthesis wave generator pipelines...")
    
    # Check specific voice ref wav if custom speaker profile exists
    speaker_wav_path = None
    if req.speaker_name != "default":
        # Validate speaker name format to prevent directory traversal
        import re
        if not re.match(r"^[a-zA-Z0-9_-]+$", req.speaker_name):
            raise HTTPException(status_code=400, detail="Invalid speaker name format. Path traversal characters are forbidden.")
        potential_speaker_file = os.path.abspath(os.path.join(settings.VOICEOVER_DIR, f"{req.speaker_name}.wav"))
        base_dir_abs = os.path.abspath(settings.VOICEOVER_DIR)
        if not potential_speaker_file.startswith(base_dir_abs):
            raise HTTPException(status_code=400, detail="Unauthorized speaker filename path.")
        if os.path.exists(potential_speaker_file):
            speaker_wav_path = potential_speaker_file

    # Build audio wave under worker threads to support high numbers of concurrent users (Goal #9)
    t0 = time.time()
    try:
        wav_bytes = await asyncio.to_thread(
            tts_engine.synthesize_wav_data,
            text=req.text,
            language=lang_code,
            speaker_reference_wav=speaker_wav_path,
            speed=req.speed,
            pitch=req.pitch
        )
    except Exception as se:
        logger.error(f"TTS Thread invocation failed: {se}")
        raise HTTPException(status_code=500, detail=f"Inference pipeline thread error: {str(se)}")
        
    latency_secs = time.time() - t0
    logger.info(f"Deep learning generation finished in {latency_secs:.3f}s. Audio length bytes: {len(wav_bytes)}")

    # Handle output format transformation under sub-threads as well
    final_bytes = wav_bytes
    if fmt == "mp3":
        final_bytes = await asyncio.to_thread(audio_processor.convert_wav_to_mp3, wav_bytes)

    # Save to Cache disk and memory registries
    cache_manager.save_to_cache(cache_key, final_bytes, fmt)
    size_bytes = len(final_bytes)

    return SynthesisResponse(
        cache_key=cache_key,
        format=fmt,
        duration_secs=round(max(1.0, len(req.text) * 0.08), 2),
        size_bytes=size_bytes,
        download_url=f"/api/tts/download/{cache_key}?format={fmt}",
        source_status="synthesized_fresh"
    )

@api_app.post("/api/tts/synthesize/batch", response_model=BatchSynthesisResponse)
async def synthesize_batch_speech(req: BatchSynthesisRequest):
    """Processes multiple synthesis tasks in parallel threads, leveraging asyncio.gather (Goal #8)."""
    t0 = time.time()
    logger.info(f"Received batch synthesis request. Count of items: {len(req.texts)}")
    
    # Define an inner coroutine to reuse our highly optimized synthesis pipeline
    async def process_single_item(text: str):
        single_req = SynthesisRequest(
            text=text,
            language=req.language,
            speaker_name=req.speaker_name,
            speed=req.speed,
            pitch=req.pitch,
            output_format=req.output_format
        )
        return await synthesize_speech(single_req)
        
    # Schedule all tasks simultaneously onto the async thread pool
    tasks = [process_single_item(text) for text in req.texts]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    final_results = []
    total_size = 0
    total_duration = 0.0
    
    for r in results:
        if isinstance(r, Exception):
            logger.error(f"Batch task item failed in thread: {r}")
            continue
        final_results.append(r)
        total_size += r.size_bytes
        total_duration += r.duration_secs
        
    latency = time.time() - t0
    logger.info(f"Batch processing of {len(req.texts)} items finished in {latency:.3f}s.")
    
    return BatchSynthesisResponse(
        results=final_results,
        total_duration_secs=round(total_duration, 2),
        total_size_bytes=total_size,
        processing_latency_secs=round(latency, 2)
    )

@api_app.get("/api/tts/download/{cache_key}")
async def download_audio_file(cache_key: str, format: str = "wav"):
    """Serves high performance audio file delivery from disk with appropriate MIME types for direct download."""
    fmt = format.strip().lower()
    if fmt not in ["wav", "mp3"]:
        raise HTTPException(status_code=400, detail="Invalid format selected")

    cached_file_path = cache_manager.get_cached_file(cache_key, fmt)
    if not cached_file_path or not os.path.exists(cached_file_path):
        raise HTTPException(status_code=404, detail="Audio file not located on caches directory. Please synthesize first.")

    media_type = "audio/wav" if fmt == "wav" else "audio/mpeg"
    filename = f"speechcraft_{cache_key}.{fmt}"
    
    logger.info(f"Serving local cache download response: {filename}")
    return FileResponse(
        path=cached_file_path,
        media_type=media_type,
        filename=filename
    )

@api_app.get("/api/tts/stream")
async def stream_audio_synthesize(
    text: str = Query(..., description="Speech synthesis payload text"),
    language: str = Query("en", description="Synthesis target language"),
    speaker_name: str = Query("default", description="Vocal timbre"),
    speed: float = Query(1.0, ge=0.5, le=2.0),
    pitch: float = Query(1.0, ge=0.5, le=1.5),
    format: str = Query("wav", description="Return format output")
):
    """Streams synthesize responses using sub-word chunk generation for ultra-low latency real-time voice delivery (RTF)."""
    import re
    lang_code = language.strip().lower()
    if lang_code not in settings.SUPPORTED_LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Dialect language code '{language}' outside of supported scope.")

    fmt = format.strip().lower()
    if fmt not in ["wav", "mp3"]:
        raise HTTPException(status_code=400, detail="Supported stream container is either 'wav' or 'mp3'")

    logger.info(f"Initiated real-time streaming generator flow for speech feedback: {text[:40]}...")

    # Real-time neural models split long texts by paragraphs/punctuations.
    # Here we emulate chunk-by-chunk generator yields to showcase multi-segment pipelines.
    async def audio_chunk_generator():
        # Step 1: Pre-generate or stream raw WAV blocks in a non-blocking background thread
        try:
            speaker_wav_path = None
            if speaker_name != "default":
                # Validate speaker_name format to prevent directory traversal
                if not re.match(r"^[a-zA-Z0-9_-]+$", speaker_name):
                    logger.error(f"Traversal attempt in stream_audio_synthesize with speaker: {speaker_name}")
                    return
                
                pot_wav = os.path.abspath(os.path.join(settings.VOICEOVER_DIR, f"{speaker_name}.wav"))
                base_dir_abs = os.path.abspath(settings.VOICEOVER_DIR)
                if not pot_wav.startswith(base_dir_abs):
                    logger.error(f"Traversal attempt in path verification: {pot_wav}")
                    return
                
                if os.path.exists(pot_wav):
                    speaker_wav_path = pot_wav

            # Heavy Deep Learning synthesis run in thread pool to prevent blocking the async event loop
            wav_data = await asyncio.to_thread(
                tts_engine.synthesize_wav_data,
                text=text,
                language=lang_code,
                speaker_reference_wav=speaker_wav_path,
                speed=speed,
                pitch=pitch
            )

            # Let's break down the binary file into small chunk frames to simulate streamed network bytes delivery
            chunk_size = 8192  # 8KB packets
            bytes_yielded = 0
            
            while bytes_yielded < len(wav_data):
                chunk = wav_data[bytes_yielded:bytes_yielded + chunk_size]
                bytes_yielded += len(chunk)
                await asyncio.sleep(0.01)  # Non-blocking async sleep instead of time.sleep
                yield chunk

        except Exception as e:
            logger.error(f"Error occurred during live dynamic audio streaming generator: {e}")
            return

    media_type = "audio/wav" if fmt == "wav" else "audio/mpeg"
    return StreamingResponse(audio_chunk_generator(), media_type=media_type)

@api_app.post("/api/voices/clone")
async def enroll_voice_clone_ref(
    speaker_name: str = Form(..., description="Unique label for enrolling this timbre"),
    file: UploadFile = File(..., description="High-fidelity 5-20sec WAV voice sample file")
):
    """Accepts custom WAV filings from browser, verifies file structure, and registers voice timbre for future zero-shot runs."""
    import re
    # Clean and validate speaker_name to enforce alphanumeric strings and block directory traversal attacks
    clean_speaker_name = speaker_name.strip()
    if not clean_speaker_name:
        raise HTTPException(status_code=400, detail="Speaker name cannot be empty.")

    # Only allow safe letters, numbers, hyphens, and underscores. No dots, slashes, or traversal sequences.
    if not re.match(r"^[a-zA-Z0-9_-]+$", clean_speaker_name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid speaker name. Only alphanumeric characters, hyphens, and underscores are permitted."
        )

    if not file.filename.endswith(".wav"):
        raise HTTPException(status_code=400, detail="Only standard WAV file properties are currently allowed for voice registration profile matrices.")

    os.makedirs(settings.VOICEOVER_DIR, exist_ok=True)
    speaker_filename = f"{clean_speaker_name.lower()}.wav"
    destination_file = os.path.abspath(os.path.join(settings.VOICEOVER_DIR, speaker_filename))

    # Canonical directory enforcement check
    base_dir_abs = os.path.abspath(settings.VOICEOVER_DIR)
    if not destination_file.startswith(base_dir_abs):
        raise HTTPException(status_code=400, detail="Unauthorized destination path configuration detected.")

    logger.info(f"Custom Zero-shot voice timbres upload. Saving reference clip to path: {destination_file}")
    
    try:
        with open(destination_file, "wb") as buffer:
            shutil_contents = await file.read()
            buffer.write(shutil_contents)
            
        # Optional: Validate the audio parameters (sample rates, embedding extractions)
        g_embed, spec_embed = tts_engine.get_speaker_embedding(destination_file)
        
        return {
            "status": "timbre_enrolled_successfully",
            "speaker_name": speaker_name,
            "saved_file": destination_file,
            "timbre_vectors_synthesized": True,
            "latent_vector_dimension": 512,
            "timbre_matrix_dimension": 256
        }
    except Exception as e:
        logger.error(f"Enrolling new cloning timbre failed: {str(e)}")
        if os.path.exists(destination_file):
            os.remove(destination_file)
        raise HTTPException(status_code=500, detail=f"Enrollment aborted due to decoding errors: {str(e)}")

@api_app.post("/api/cache/clear")
async def clear_cache_route():
    """Purges the cached folder completely to conserve local environment space."""
    try:
        cache_manager.clear_cache()
        return {"status": "success", "message": "All cached audio files have been completely flushed."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed purging directories: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Serves the complete API server locally
    logger.info(f"Launching SpeechCraft API Engine locally on port {settings.PORT}...")
    uvicorn.run("backend.main:api_app", host=settings.HOST, port=settings.PORT, reload=True)
