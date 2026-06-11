import React, { useState } from "react";
import { ARCH_NODES } from "../data";
import { ArchNode } from "../types";
import { ArrowRight, Info, HardDrive, Bolt, ChevronRight } from "lucide-react";

export default function ArchitectureGraph() {
  const [selectedNode, setSelectedNode] = useState<ArchNode>(ARCH_NODES[0]);

  return (
    <div id="architecture-section" className="space-y-6">
      <div className="border-b border-zinc-100 pb-5">
        <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">System Pipeline Architecture</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Interactive neural network diagram of an offline multilingual TTS engine. Click any block to inspect Windows configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle Column: Graphic Node graph */}
        <div className="lg:col-span-2 bg-zinc-50 border border-zinc-100 rounded-xl p-6 relative flex flex-col justify-between overflow-x-auto min-w-[340px]">
          {/* Horizontal Connection lines wrapper */}
          <div className="space-y-6 lg:space-y-8 my-auto py-2">
            
            {/* Row 1: Inputs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
              <div 
                onClick={() => setSelectedNode(ARCH_NODES[0])}
                className={`flex-1 p-4 rounded-xl cursor-pointer transition-all border text-center ${
                  selectedNode.id === ARCH_NODES[0].id
                    ? "bg-sky-50 border-sky-400 shadow-sm"
                    : "bg-white border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider font-mono text-sky-600">Stage 1: Clean</div>
                <h4 className="text-xs font-semibold text-zinc-800 mt-1">{ARCH_NODES[0].label}</h4>
                <p className="text-[10px] text-zinc-400 mt-1">Cleans raw script & expands digits</p>
              </div>

              <div className="flex justify-center shrink-0">
                <ArrowRight className="w-5 h-5 text-zinc-300 transform rotate-90 sm:rotate-0" />
              </div>

              <div 
                onClick={() => setSelectedNode(ARCH_NODES[1])}
                className={`flex-1 p-4 rounded-xl cursor-pointer transition-all border text-center ${
                  selectedNode.id === ARCH_NODES[1].id
                    ? "bg-violet-50 border-violet-400 shadow-sm"
                    : "bg-white border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider font-mono text-violet-600">Stage 2: G2P</div>
                <h4 className="text-xs font-semibold text-zinc-800 mt-1">{ARCH_NODES[1].label}</h4>
                <p className="text-[10px] text-zinc-400 mt-1">Resolves phonology and syllables</p>
              </div>
            </div>

            {/* Down Arrow / Split indicator */}
            <div className="flex justify-center h-2 relative">
              <div className="absolute w-[2px] h-6 bg-zinc-200 -top-2"></div>
            </div>

            {/* Row 2: Synthesis Engine + Style Embedding */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 mt-2">
              <div 
                onClick={() => setSelectedNode(ARCH_NODES[2])}
                className={`flex-1 p-4 rounded-xl cursor-pointer transition-all border text-center ${
                  selectedNode.id === ARCH_NODES[2].id
                    ? "bg-amber-50 border-amber-400 shadow-sm"
                    : "bg-white border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider font-mono text-amber-600 text-center flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Speaker Vector
                </div>
                <h4 className="text-xs font-semibold text-zinc-800 mt-1">{ARCH_NODES[2].label}</h4>
                <p className="text-[10px] text-zinc-400 mt-1">Extracts voice clone features</p>
              </div>

              <div className="flex justify-center shrink-0">
                <span className="text-zinc-300 font-bold font-mono text-xs">+</span>
              </div>

              <div 
                onClick={() => setSelectedNode(ARCH_NODES[3])}
                className={`flex-1 p-4 rounded-xl cursor-pointer transition-all border text-center ${
                  selectedNode.id === ARCH_NODES[3].id
                    ? "bg-emerald-50 border-emerald-400 shadow-sm"
                    : "bg-white border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider font-mono text-emerald-600">Stage 3: Acoustic</div>
                <h4 className="text-xs font-semibold text-zinc-800 mt-1">{ARCH_NODES[3].label}</h4>
                <p className="text-[10px] text-zinc-400 mt-1">VITS predicts Mel-Spectrograms</p>
              </div>
            </div>

            {/* Connection down */}
            <div className="flex justify-center h-2 relative">
              <div className="absolute w-[2px] h-6 bg-zinc-200 -top-2"></div>
            </div>

            {/* Row 3: Vocoder to Output */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 mt-2">
              <div 
                onClick={() => setSelectedNode(ARCH_NODES[4])}
                className={`flex-1 p-4 rounded-xl cursor-pointer transition-all border text-center ${
                  selectedNode.id === ARCH_NODES[4].id
                    ? "bg-rose-50 border-rose-400 shadow-sm"
                    : "bg-white border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider font-mono text-rose-600">Stage 4: Vocode</div>
                <h4 className="text-xs font-semibold text-zinc-800 mt-1">{ARCH_NODES[4].label}</h4>
                <p className="text-[10px] text-zinc-400 mt-1">HiFi-GAN reconstructs waveform</p>
              </div>

              <div className="flex justify-center shrink-0">
                <ArrowRight className="w-5 h-5 text-zinc-300 transform rotate-90 sm:rotate-0" />
              </div>

              <div 
                onClick={() => setSelectedNode(ARCH_NODES[5])}
                className={`flex-1 p-4 rounded-xl cursor-pointer transition-all border text-center ${
                  selectedNode.id === ARCH_NODES[5].id
                    ? "bg-indigo-50 border-indigo-400 shadow-sm"
                    : "bg-white border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="text-[10px] uppercase font-bold tracking-wider font-mono text-indigo-600">Local Out</div>
                <h4 className="text-xs font-semibold text-zinc-800 mt-1">{ARCH_NODES[5].label}</h4>
                <p className="text-[10px] text-zinc-400 mt-1">Fluid rendering, control, and save</p>
              </div>
            </div>

          </div>

          <div className="text-[10px] text-zinc-400 font-mono text-center mt-3 border-t border-zinc-200/50 pt-2 shrink-0">
            ▲ High-Performance End-to-End Deep Learning Pipeline
          </div>
        </div>

        {/* Right Column: Node Details Inspector */}
        <div className="bg-white border border-zinc-100 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-400 uppercase font-mono tracking-wider">Node Inspector</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono px-2 py-0.5 roundedbg-zinc-100 text-zinc-600">
                Category: {selectedNode.category}
              </span>
              <h3 className="text-lg font-bold text-zinc-900 mt-2 tracking-tight">{selectedNode.label}</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{selectedNode.description}</p>
            </div>

            <div className="space-y-2.5 border-t border-zinc-100 pt-4">
              <p className="text-xs text-zinc-400 font-medium font-mono">Neural Mechanics</p>
              <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50/50 p-3.5 rounded-lg border border-zinc-100">
                {selectedNode.detailedExplanation}
              </p>
            </div>

            <div className="space-y-2.5 border-t border-zinc-100 pt-4">
              <p className="text-xs text-zinc-400 font-medium font-mono flex items-center gap-1">
                <Bolt className="w-3.5 h-3.5" /> Windows Implementation Detail
              </p>
              <div className="text-xs text-zinc-600 font-mono bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                {selectedNode.winConfig}
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => {
              const nextIndex = (ARCH_NODES.findIndex(n => n.id === selectedNode.id) + 1) % ARCH_NODES.length;
              setSelectedNode(ARCH_NODES[nextIndex]);
            }}
            className="w-full mt-6 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all"
          >
            Next Pipeline Block <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
