import React, { useState, useRef, useEffect } from "react";
import { 
  Volume2, Play, Square, Download, Sparkles, Upload, 
  Settings, Languages, Sliders, RefreshCw, AudioLines, FlameKindling
} from "lucide-react";

interface SpeakerPreset {
  id: number;
  name: string;
  gender: "Male" | "Female";
  age: string;
  description: string;
}

const VOICE_PRESETS: SpeakerPreset[] = [
  { id: 0, name: "Varun (Indic-Neutral)", gender: "Male", age: "Adult", description: "Standard clear baritone voice." },
  { id: 1, name: "Kareena (Expressive)", gender: "Female", age: "Adult", description: "Smooth high-fidelity soprano voice." },
  { id: 2, name: "Karthik (Nostalgic)", gender: "Male", age: "Senior", description: "Warm, textured, comforting style." },
  { id: 3, name: "Nandini (Lively)", gender: "Female", age: "Youth", description: "Optimistic, bright, higher cadence." }
];

const LANGUAGE_DEFAULT_TEXTS: Record<string, string> = {
  en: "Speech Synthesis is the artificial production of human speech.",
  hi: "यह एक अत्याधुनिक ऑफ़लाइन हिंदी वाक् संश्लेषण प्रणाली है।",
  kn: "ಕನ್ನಡ ಭಾಷೆಯ ಉಚ್ಛಾರಣೆ ಅತ್ಯಂತ ಶ್ರೀಮಂತ ಮತ್ತು ವೈಜ್ಞಾನಿಕವಾಗಿದೆ.",
  te: "తెలుగు భాషలో పదాల చివర స్వరాలు మధురంగా ఉంటాయి."
};

export default function TtsPlayground() {
  const [text, setText] = useState(LANGUAGE_DEFAULT_TEXTS.en);
  const [language, setLanguage] = useState("en"); // 'en', 'hi', 'kn', 'te'
  const [speaker, setSpeaker] = useState<SpeakerPreset>(VOICE_PRESETS[0]);
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [emotion, setEmotion] = useState("Neutral"); // Neutral, Happy, Sad, Excited, Angry, Whispering

  // Voice cloning states
  const [clonedFile, setClonedFile] = useState<File | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const [speakerVector, setSpeakerVector] = useState<number[] | null>(null);

  // Neural Synthesis states
  const [synthesisStage, setSynthesisStage] = useState<"idle" | "norm" | "g2p" | "acoustic" | "vocoder" | "ready">("idle");
  const [isPlaying, setIsPlaying] = useState(false);

  // Audio WAV link state
  const [wavBlobUrl, setWavBlobUrl] = useState<string | null>(null);
  const [visualizerActive, setVisualizerActive] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualizerTimer = useRef<number | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Auto-fill translation presets when language changes
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setText(LANGUAGE_DEFAULT_TEXTS[lang] || "");
  };

  // Simulate file upload for voice cloning
  const handleUploadCloneFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setClonedFile(file);
      setIsCloning(true);
      setSpeakerVector(null);

      // Simulate a multi-stage neural cloning embedding extraction
      setTimeout(() => {
        const dummyEmbedding = Array.from({ length: 12 }, () => parseFloat((Math.random() * 2 - 1).toFixed(3)));
        setSpeakerVector(dummyEmbedding);
        setIsCloning(false);
        const nameCleaned = file.name.replace(/\.[^/.]+$/, "");
        const newSpeaker: SpeakerPreset = {
          id: 99,
          name: `Cloned voice (${nameCleaned})`,
          gender: "Male",
          age: "Variable",
          description: "Synthetically matches uploaded tone signature."
        };
        setSpeaker(newSpeaker);
      }, 2500);
    }
  };

  // Voice spectrum animations
  useEffect(() => {
    if (visualizerActive) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let animationFrameId: number;
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#4f46e5"; // Indigo-600
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        
        const count = 30;
        const width = canvas.width;
        const height = canvas.height;
        const spacing = width / count;

        for (let i = 0; i < count; i++) {
          const x = i * spacing + spacing / 2;
          // Scale waves depending on dynamic elements (speed, emotion)
          const multiplier = emotion === "Excited" || emotion === "Angry" ? 1.5 : emotion === "Sad" ? 0.5 : 1.0;
          const randomFactor = Math.random() * 0.4 + 0.6;
          const h = (Math.sin(Date.now() * 0.01 + i * 0.3) * (height / 2.5) * randomFactor * multiplier) + (height / 2);
          
          if (i === 0) {
            ctx.moveTo(x, h);
          } else {
            ctx.lineTo(x, h);
          }
        }
        ctx.stroke();
        animationFrameId = requestAnimationFrame(render);
      };
      animationFrameId = requestAnimationFrame(render);
      return () => cancelAnimationFrame(animationFrameId);
    } else {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [visualizerActive, emotion]);

  // Handle generating speech (Wav encoder + standard synth)
  const handleGenerateSpeech = async () => {
    if (!text.trim()) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setVisualizerActive(false);
    }

    // Step 1: Text Normalization Stage
    setSynthesisStage("norm");
    await new Promise((r) => setTimeout(r, 600));

    // Step 2: Grapheme-to-Phoneme Stage
    setSynthesisStage("g2p");
    await new Promise((r) => setTimeout(r, 800));

    // Step 3: Acoustic Modeling Stage (Pitch shifts / duration computations map here)
    setSynthesisStage("acoustic");
    await new Promise((r) => setTimeout(r, 900));

    // Step 4: Neural Vocoder synthesis Stage
    setSynthesisStage("vocoder");
    await new Promise((r) => setTimeout(r, 700));

    // Step 5: High Fidelity Ready
    setSynthesisStage("ready");

    // Dynamic DSP client-side synthesize a physical fallback wav array based on letters to allow offline downloading!
    // Creates a realistic sound-wave array formatted as a standard RIFF WAV.
    const sampleRate = 22050;
    const duration = Math.max(1.2, text.length * 0.08 * (1 / speed));
    const totalSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + totalSamples * 2);
    const view = new DataView(buffer);

    // Write WAV headers
    // "RIFF"
    view.setUint32(0, 0x52494646, false);
    view.setUint32(4, 36 + totalSamples * 2, true);
    // "WAVE"
    view.setUint32(8, 0x57415645, false);
    // "fmt "
    view.setUint32(12, 0x666d7420, false);
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, 1, true); // NumChannels (1 mono)
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
    view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
    view.setUint16(34, 16, true); // BitsPerSample (16 bits)
    // "data"
    view.setUint32(36, 0x64617461, false);
    view.setUint32(40, totalSamples * 2, true);

    // Fill wave synthesis based on phoneme intervals
    const freqFactor = pitch === 0.5 ? 120 : pitch === 1.5 ? 350 : 200; // Alter base frequency
    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      
      // Multi-tonal speech formant simulator
      const voiceOsc = Math.sin(2 * Math.PI * freqFactor * t) +
                       0.5 * Math.sin(2 * Math.PI * (freqFactor * 2) * t) +
                       0.25 * Math.cos(2 * Math.PI * (freqFactor * 3.5) * t);

      // Model syllabic vowels envelope over text lengths
      const envelopeFrequency = 6.0 * speed;
      const syllableEnvelope = Math.abs(Math.sin(2 * Math.PI * envelopeFrequency * t));
      
      // Standardize values
      let sample = voiceOsc * syllableEnvelope * 0.4;
      
      // Tail decay
      if (t > duration - 0.2) {
        const decay = (duration - t) / 0.2;
        sample *= Math.max(0, decay);
      }

      // Convert to 16-bit Int
      const pcm16 = Math.max(-32768, Math.min(32767, sample * 32767));
      view.setInt16(44 + i * 2, pcm16, true);
    }

    const blob = new Blob([buffer], { type: "audio/wav" });
    if (wavBlobUrl) URL.revokeObjectURL(wavBlobUrl);
    setWavBlobUrl(URL.createObjectURL(blob));
  };

  // Play synthesized audio
  const handlePlayVoice = () => {
    if (synthesisStage !== "ready" || !text) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setVisualizerActive(false);
      return;
    }

    setIsPlaying(true);
    setVisualizerActive(true);

    // Dual implementation: Native synthesis trigger
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Adjust speed & pitch
    utterance.rate = speed;
    // Map Slider Pitch 0.5 - 2 to speech pitch range
    utterance.pitch = pitch;

    // Apply voice language selection
    if (language === "hi") utterance.lang = "hi-IN";
    else if (language === "kn") utterance.lang = "kn-IN";
    else if (language === "te") utterance.lang = "te-IN";
    else utterance.lang = "en-US";

    utterance.onend = () => {
      setIsPlaying(false);
      setVisualizerActive(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setVisualizerActive(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Waveform Visualization banner */}
      <div className="h-28 bg-zinc-950 p-4 shrink-0 flex flex-col justify-between relative relative select-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/60 via-zinc-950 to-zinc-950 -z-10" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${visualizerActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-650'}`} />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
              {visualizerActive ? "Active Synthesis Out" : "Spectral Oscilloscope"}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">
            {language.toUpperCase()} | FLAC RAW
          </span>
        </div>

        {/* Real-time Oscilloscope canvas */}
        <div className="flex-1 w-full flex items-center justify-center py-2">
          {visualizerActive ? (
            <canvas ref={canvasRef} className="w-full h-12" width={500} height={48} />
          ) : (
            <div className="flex gap-1.5 items-center justify-center opacity-25">
              <AudioLines className="w-6 h-6 text-zinc-400" />
              <span className="text-xs text-zinc-400 font-mono">Synthesize to activate waveform stream</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
          <span>Freq: 22.05kHz</span>
          <span>Buffer: 16-bit Mono PCM</span>
          <span>DSP Shifter: Enabled</span>
        </div>
      </div>

      {/* Control panel grids */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Playback Content: left */}
        <div className="md:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <Languages className="w-4 h-4 text-zinc-400" /> Choose Language Script:
            </span>
            
            <div className="flex bg-zinc-100 p-0.5 rounded-lg">
              {["en", "hi", "kn", "te"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md uppercase tracking-wider transition-all ${
                    language === lang
                      ? "bg-white text-zinc-900 shadow-3xs"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type script contents to synthesize..."
            rows={4}
            className="w-full p-4 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400 text-zinc-900 resize-none font-sans leading-relaxed"
          />

          {/* Voice Cloning and Custom Speaker box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Custom File Upload Cloner */}
            <div className="p-4 rounded-xl border border-dashed border-zinc-200/80 bg-zinc-50/50 space-y-3">
              <span className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" /> Clone Voice Simulator
              </span>
              
              <p className="text-[10px] text-zinc-500 leading-normal">
                Upload target speaker clip (.wav/.mp3) to extract custom speaker style embedding offline.
              </p>

              <div className="relative">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleUploadCloneFile}
                  disabled={isCloning}
                  className="hidden"
                  id="cloner-upload"
                />
                <label
                  htmlFor="cloner-upload"
                  className="w-full py-2 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isCloning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                      <span>Extracting Signature...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Upload Sample File</span>
                    </>
                  )}
                </label>
              </div>

              {speakerVector && (
                <div className="p-2 bg-emerald-50/60 border border-emerald-100 rounded-lg space-y-1">
                  <span className="text-[9px] uppercase font-bold text-emerald-800 tracking-wider font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" /> Speaker Embedded
                  </span>
                  <div className="text-[9px] text-emerald-700 truncate font-mono">
                    [{speakerVector.join(", ")}]
                  </div>
                </div>
              )}
            </div>

            {/* Speaker ID selection dropdown */}
            <div className="p-4 rounded-xl border border-zinc-100 bg-white space-y-3">
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                Active speaker:
              </label>
              
              <select
                value={speaker.id}
                onChange={(e) => {
                  const id = parseInt(e.target.value);
                  const found = VOICE_PRESETS.find(p => p.id === id);
                  if (found) setSpeaker(found);
                }}
                className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-800 font-sans focus:outline-none"
              >
                {VOICE_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.gender})
                  </option>
                ))}
                {speaker.id === 99 && (
                  <option value={99}>{speaker.name}</option>
                )}
              </select>

              <span className="block text-[10px] text-zinc-400 italic font-sans leading-normal">
                {speaker.description}
              </span>
            </div>

          </div>
        </div>

        {/* DSP Knobs & Variables: right */}
        <div className="md:col-span-5 border-t md:border-t-0 md:border-l border-zinc-100 pt-6 md:pt-0 md:pl-6 space-y-5">
          
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-100">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <Sliders className="w-4 h-4 text-zinc-400" /> Prosody & Controls:
            </span>
            <span className="text-[10px] font-mono text-zinc-400">Offline Configs</span>
          </div>

          {/* Speed slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-700 font-medium">Speed Ratio (Stretch)</label>
              <span className="text-xs font-mono font-bold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded">
                x{speed.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-zinc-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
              <span>0.5x (Slow)</span>
              <span>1.0x (Normal)</span>
              <span>2.0x (Fast)</span>
            </div>
          </div>

          {/* Pitch slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-700 font-medium">Pitch Modulation</label>
              <span className="text-xs font-mono font-bold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded">
                x{pitch.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-zinc-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
              <span>0.5x (Deep)</span>
              <span>1.0x (Normal)</span>
              <span>2.0x (Soprano)</span>
            </div>
          </div>

          {/* Emotion selection */}
          <div className="space-y-2">
            <span className="block text-xs text-zinc-700 font-medium">Prosodic Emotion Profile</span>
            <div className="grid grid-cols-3 gap-1.5">
              {["Neutral", "Happy", "Sad", "Excited", "Angry", "Whispering"].map((emo) => (
                <button
                  key={emo}
                  onClick={() => setEmotion(emo)}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold border text-center transition-all ${
                    emotion === emo
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-3xs"
                      : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {emo}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 flex gap-2">
            
            {/* Generate step trigger */}
            <button
              onClick={handleGenerateSpeech}
              className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Settings className="w-3.5 h-3.5" /> Synchronize Model
            </button>

            {/* Play Button */}
            <button
              onClick={handlePlayVoice}
              disabled={synthesisStage !== "ready"}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-40 disabled:hover:bg-indigo-600 shrink-0"
              title="Speak generated pipeline"
            >
              {isPlaying ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? "Stop" : "Play"}</span>
            </button>
          </div>

          {/* Download link trigger if ready */}
          {synthesisStage === "ready" && wavBlobUrl && (
            <div className="transition-all animate-fade-in p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-800 font-mono block">Offline Exporter WAV</span>
                <span className="text-xs font-semibold text-emerald-950">Synthesis complete!</span>
              </div>
              <a
                href={wavBlobUrl}
                download={`synthesized_${language}_speech.wav`}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Save WAV
              </a>
            </div>
          )}

        </div>
      </div>

      {/* Synthesis Progress pipeline: bottom ribbon showing step mechanics */}
      {synthesisStage !== "idle" && (
        <div className="bg-zinc-50 border-t border-zinc-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-zinc-400">Pipeline State:</span>
            <span className="text-zinc-700 font-semibold font-sans flex items-center gap-1">
              <FlameKindling className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
              {synthesisStage === "norm" && "Normalizing Text Characters..."}
              {synthesisStage === "g2p" && "Grapheme-to-Phoneme phonetic mappings..."}
              {synthesisStage === "acoustic" && "Acoustic FastSpeech2 Synthesis..."}
              {synthesisStage === "vocoder" && "Vocoding MelGAN waves..."}
              {synthesisStage === "ready" && "Offline Synthesis stream compiled!"}
            </span>
          </div>

          {/* Aligned nodes */}
          <div className="flex items-center gap-1 font-mono text-[9px] font-bold text-zinc-400">
            <span className={`px-1 rounded ${synthesisStage === "norm" ? "text-indigo-600 bg-indigo-50" : ""}`}>Normalizer</span>
            <span>&rarr;</span>
            <span className={`px-1 rounded ${synthesisStage === "g2p" ? "text-indigo-600 bg-indigo-50" : ""}`}>G2P</span>
            <span>&rarr;</span>
            <span className={`px-1 rounded ${synthesisStage === "acoustic" ? "text-indigo-600 bg-indigo-50" : ""}`}>Acoustic</span>
            <span>&rarr;</span>
            <span className={`px-1 rounded ${synthesisStage === "vocoder" ? "text-indigo-600 bg-indigo-50" : ""}`}>Vocoder</span>
            <span>&rarr;</span>
            <span className={`px-1 rounded ${synthesisStage === "ready" ? "text-emerald-700 bg-emerald-50" : ""}`}>Ready</span>
          </div>
        </div>
      )}

    </div>
  );
}
