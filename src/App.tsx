/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import TtsPlayground from "./components/TtsPlayground";
import ModelComparisonTable from "./components/ModelComparisonTable";
import ArchitectureGraph from "./components/ArchitectureGraph";
import LinguisticOptimizerView from "./components/LinguisticOptimizerView";
import OfflineBlueprints from "./components/OfflineBlueprints";
import AiAssistant from "./components/AiAssistant";
import { 
  Volume2, Cpu, HelpCircle, HardDrive, 
  Layers, Settings, Code, Sparkles, BookOpen 
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"playground" | "comparison" | "pipeline" | "linguistics" | "codebase" | "consultant">("playground");

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Premium minimal header */}
      <header className="border-b border-zinc-200/80 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Volume2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-zinc-950 font-sans">SpeechCraft</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">Internship Project Blueprint</span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">Multilingual Expressive offline-capable TTS System</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Windows Production Ready
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">VITS & Piper Deep Architectures</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Short Executive Summary Banner */}
        <div className="bg-zinc-900 text-zinc-100 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden select-none shadow-md">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-indigo-950/40 via-zinc-900 to-zinc-900 -z-10" />
          
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-indigo-300 font-mono text-xs">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span>OFFLINE OPEN SOURCE ARCHITECTURE</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Expressive Speech Synthesis Sandbox</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This system demonstrates a highly optimized, fully localized deep learning TTS architecture designed for deployment on Windows without commercial APIs. Leveraging parallel modeling cascades and specialized Dravidian phonetic G2P layers, it enables natural, offline speech generation across English, Hindi, Kannada, and Telugu.
            </p>
          </div>

          <div className="bg-zinc-800/80 border border-zinc-750 p-4 rounded-xl shrink-0 space-y-2.5 w-full md:w-auto">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">System Parameters</h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-zinc-300">
              <span className="text-zinc-500">Target Platforms:</span>
              <span className="font-mono text-right font-medium">Win 10/11 x64</span>
              
              <span className="text-zinc-500">Inference Core:</span>
              <span className="font-mono text-right font-medium text-indigo-300">ONNX FP16</span>
              
              <span className="text-zinc-500">Local Latency (RTF):</span>
              <span className="font-mono text-right font-medium text-emerald-400">&lt; 0.20 CPU</span>
            </div>
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="flex bg-white p-1 rounded-xl border border-zinc-200/80 shadow-3xs overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => setActiveTab("playground")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "playground"
                ? "bg-zinc-950 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Interactive Playground</span>
          </button>

          <button
            onClick={() => setActiveTab("comparison")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "comparison"
                ? "bg-zinc-950 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Model Comparison Grid</span>
          </button>

          <button
            onClick={() => setActiveTab("pipeline")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "pipeline"
                ? "bg-zinc-950 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>System Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab("linguistics")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "linguistics"
                ? "bg-zinc-950 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Dravidian Phonetics</span>
          </button>

          <button
            onClick={() => setActiveTab("codebase")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "codebase"
                ? "bg-zinc-950 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Offline Local Files</span>
          </button>

          <button
            onClick={() => setActiveTab("consultant")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "consultant"
                ? "bg-zinc-950 text-white shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <HelpCircle className="w-4 h-4 text-indigo-500 fill-indigo-100" />
            <span>AI Principal Consultant</span>
          </button>
        </div>

        {/* Tab Contents Frame */}
        <div className="transition-all duration-200">
          {activeTab === "playground" && <TtsPlayground />}
          {activeTab === "comparison" && <ModelComparisonTable />}
          {activeTab === "pipeline" && <ArchitectureGraph />}
          {activeTab === "linguistics" && <LinguisticOptimizerView />}
          {activeTab === "codebase" && <OfflineBlueprints />}
          {activeTab === "consultant" && <AiAssistant />}
        </div>

        {/* Dynamic Project Verification Steps */}
        <div className="bg-white border border-zinc-150 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-400" />
            Internship Submission Checklist & Deployment Step
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-xl space-y-2">
              <span className="font-bold text-zinc-900 block font-mono">1. Read Systems Blueprint</span>
              <p className="text-zinc-500 leading-relaxed">
                Review the model comparison grids, trade-offs, pipeline diagrams, and phonetic rules to master the oral viva explanations.
              </p>
            </div>
            <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-xl space-y-2">
              <span className="font-bold text-zinc-900 block font-mono">2. Download setup.bat script</span>
              <p className="text-zinc-500 leading-relaxed">
                Head to the "Offline Local Files" tab, click the download button, or copy path files into a local folder on your Windows PC.
              </p>
            </div>
            <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-xl space-y-2">
              <span className="font-bold text-zinc-900 block font-mono">3. Run local server</span>
              <p className="text-zinc-500 leading-relaxed">
                Launch code locally using <code className="bg-zinc-150 px-1 font-mono text-[10px]">windows-setup.bat</code>, placing pre-trained libraries into directory, providing 100% offline runs.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Styled Footer */}
      <footer className="border-t border-zinc-200/80 bg-white py-8 mt-12 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 font-mono">
          <span>&copy; {new Date().getFullYear()} Multilingual SpeechCraft System. 100% Offline-Friendly architecture.</span>
          <span>Submitted in partial fulfillment of AI Research internship requirements.</span>
        </div>
      </footer>

    </div>
  );
}
