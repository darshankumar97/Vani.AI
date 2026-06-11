import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Deployment Profiling (development / production)
    ENV: str = os.getenv("ENV", "development")
    
    # API Settings
    APP_NAME: str = os.getenv("APP_NAME", "Multilingual Expressive TTS Core")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Model Configuration
    # Storage for pre-trained offline XTTS-v2 files
    MODEL_DIR: str = os.getenv("MODEL_DIR", "./models")
    XTTS_MODEL_NAME: str = os.getenv("XTTS_MODEL_NAME", "tts_models/multilingual/multi-dataset/xtts_v2")
    
    # CPU / GPU execution tuning
    # Auto-detects device, can be forced to "cpu" for local Windows execution or "cuda" for production GPUs
    DEVICE: str = os.getenv("TTS_DEVICE", "cuda") 
    USE_FP16: bool = os.getenv("USE_FP16", "True").lower() in ("true", "1", "t")
    
    # Threading optimizations for custom CPU scaling (Intra-op and Inter-op controls)
    INTRA_OP_THREADS: int = int(os.getenv("INTRA_OP_THREADS", "4"))
    INTER_OP_THREADS: int = int(os.getenv("INTER_OP_THREADS", "2"))
    
    # Cache optimization limits
    # In-memory hot cache limit (stores hot audio assets metadata directly in RAM)
    MEM_CACHE_MAX_ITEMS: int = int(os.getenv("MEM_CACHE_MAX_ITEMS", "120"))
    # Audio caching folder limit (stores audio assets on disk)
    CACHE_DIR: str = os.getenv("CACHE_DIR", "./audio_cache")
    MAX_CACHE_SIZE_MB: int = int(os.getenv("MAX_CACHE_SIZE_MB", "1024"))  # 1GB Cache limit
    
    # Languages requested by assignment
    SUPPORTED_LANGUAGES: List[str] = ["en", "hi", "kn", "te"]
    
    # Reference voices directory (for cloning samples)
    VOICEOVER_DIR: str = os.getenv("VOICEOVER_DIR", "./voices")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()

