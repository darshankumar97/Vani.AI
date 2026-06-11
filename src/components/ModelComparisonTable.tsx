import React, { useState } from "react";
import { MODEL_COMPARISONS } from "../data";
import { ModelComparison } from "../types";
import { Check, X, ShieldAlert, Cpu, Sparkles, Award } from "lucide-react";

export default function ModelComparisonTable() {
  const [selectedModel, setSelectedModel] = useState<ModelComparison>(MODEL_COMPARISONS[0]);

  return (
    <div id="comparison-section" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Open-Source Neural Models</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Analyzing offline-capable TTS architectures for Windows environment deployment.
          </p>
        </div>
        <div className="flex bg-zinc-100 p-1 rounded-lg self-start">
          {MODEL_COMPARISONS.map((m) => (
            <button
              key={m.name}
              onClick={() => setSelectedModel(m)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                selectedModel.name === m.name
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metrics & Scorecard */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-100 p-6 shadow-xs space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-mono font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {selectedModel.type}
              </span>
              <h3 className="text-2xl font-semibold text-zinc-900 mt-2 tracking-tight">{selectedModel.name}</h3>
              <p className="text-zinc-500 text-sm mt-1">{selectedModel.tagline}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-100">
              <span className="text-xs text-amber-800 font-medium block">Est. MOS Score</span>
              <span className="text-3xl font-bold text-amber-900 font-mono flex items-center justify-center gap-1">
                {selectedModel.mosScore}
                <span className="text-sm text-amber-600">/5</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 pt-5">
            <div className="bg-zinc-50/50 rounded-lg p-3.5">
              <span className="text-xs text-zinc-400 font-mono block">CPU Real-Time Factor (RTF)</span>
              <span className="text-sm font-semibold text-zinc-800 mt-1 block font-mono">
                {selectedModel.latencyCPU}
              </span>
              <p className="text-[10px] text-zinc-400 mt-1">Windows standard i5. Multi-threaded.</p>
            </div>
            <div className="bg-zinc-50/50 rounded-lg p-3.5">
              <span className="text-xs text-zinc-400 font-mono block">GPU Real-Time Factor (RTF)</span>
              <span className="text-sm font-semibold text-zinc-800 mt-1 block font-mono">
                {selectedModel.latencyGPU}
              </span>
              <p className="text-[10px] text-zinc-400 mt-1">Nvidia RTX 3060 CUDA pipeline.</p>
            </div>
            <div className="bg-zinc-50/50 rounded-lg p-3.5">
              <span className="text-xs text-zinc-400 font-mono block">Host Memory Footprint</span>
              <span className="text-sm font-semibold text-zinc-800 mt-1 block font-mono">
                {selectedModel.memoryFootprint}
              </span>
              <p className="text-[10px] text-zinc-400 mt-1">RAM requirement during core inference.</p>
            </div>
            <div className="bg-zinc-50/50 rounded-lg p-3.5">
              <span className="text-xs text-zinc-400 font-mono block">Voice Cloning Capable</span>
              <span className="text-sm font-semibold text-zinc-800 mt-1 block">
                {selectedModel.voiceCloning}
              </span>
              <p className="text-[10px] text-zinc-400 mt-12 sm:mt-1 font-mono">Zero-shot vs explicit model tuning.</p>
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-5 space-y-3">
            <h4 className="text-sm font-medium text-zinc-900 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-zinc-400" />
              Windows-Specific Setup Strategy
            </h4>
            <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg text-xs text-zinc-600 font-mono leading-relaxed">
              {selectedModel.bestUse}
            </div>
          </div>
        </div>

        {/* Right Column: Pros/Cons & Verification */}
        <div className="bg-zinc-50 rounded-xl border border-zinc-100 p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono text-zinc-400">License Verification</span>
              <h4 className="text-sm font-semibold text-zinc-900 mt-0.5">{selectedModel.license}</h4>
            </div>

            <div className="space-y-3">
              <span className="text-xs text-zinc-400 block font-mono font-medium">Linguistic Capabilities (KA, TE, HI)</span>
              <p className="text-xs text-zinc-600 leading-relaxed bg-white rounded-lg p-3 border border-zinc-100">
                {selectedModel.multilingualHindiTeluguKannada}
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-xs text-zinc-400 block font-mono font-medium">Key Tradeoffs</span>
              <div className="space-y-2">
                {selectedModel.pros.map((p) => (
                  <div key={p} className="flex items-start gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                    </div>
                    <span className="text-zinc-600 leading-relaxed">{p}</span>
                  </div>
                ))}
                {selectedModel.cons.map((c) => (
                  <div key={c} className="flex items-start gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                      <X className="w-2.5 h-2.5 text-rose-600" />
                    </div>
                    <span className="text-zinc-500 leading-relaxed">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200/60 flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
            <ShieldAlert className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            Runs 100% offline with zero commercial APIs.
          </div>
        </div>
      </div>
    </div>
  );
}
