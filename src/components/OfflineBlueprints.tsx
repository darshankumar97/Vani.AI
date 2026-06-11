import React, { useState } from "react";
import { INTERNSHIP_CODE_FILES } from "../data";
import { CodeFile } from "../types";
import { Folder, File, FileText, Download, Copy, Check, ChevronRight, Terminal } from "lucide-react";

export default function OfflineBlueprints() {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(INTERNSHIP_CODE_FILES[0]);
  const [copied, setCopied] = useState(false);

  // Trigger file downloading directly in the client browser
  const handleDownloadFile = (file: CodeFile) => {
    const blob = new Blob([file.code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="blueprints-section" className="space-y-6">
      <div className="border-b border-zinc-100 pb-5">
        <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Offline execution & Codebase Blueprints</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Explore and download the actual production-ready code files to deploy this native multilingual TTS engine locally on Windows.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Folder Structure & Files Selector */}
        <div className="space-y-5 lg:col-span-1">
          {/* Visual Folder Tree */}
          <div className="bg-white border border-zinc-100 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono mb-4">Codebase Directory</h3>
            
            <div className="space-y-2.5 font-mono text-xs text-zinc-700">
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                <Folder className="w-4 h-4 text-zinc-400" />
                <span>multilingual-tts-windows/</span>
              </div>
              
              <div className="pl-4 space-y-2 border-l border-zinc-100 ml-2">
                <div className="flex items-center gap-2 font-bold text-zinc-900 mt-1">
                  <Folder className="w-4 h-4 text-zinc-400" />
                  <span>backend/</span>
                </div>
                
                <div className="pl-4 space-y-1.5 border-l border-zinc-100 ml-2">
                  <button
                    onClick={() => setSelectedFile(INTERNSHIP_CODE_FILES[0])}
                    className={`flex items-center gap-2 w-full text-left p-1 rounded hover:bg-zinc-50 ${
                      selectedFile.filename === "app_run.py" ? "text-indigo-600 font-bold" : ""
                    }`}
                  >
                    <File className="w-3.5 h-3.5 text-zinc-400" />
                    <span>app_run.py</span>
                  </button>
                  <button
                    onClick={() => setSelectedFile(INTERNSHIP_CODE_FILES[1])}
                    className={`flex items-center gap-2 w-full text-left p-1 rounded hover:bg-zinc-50 ${
                      selectedFile.filename === "tts_g2p_optimizer.py" ? "text-indigo-600 font-bold" : ""
                    }`}
                  >
                    <File className="w-3.5 h-3.5 text-zinc-400" />
                    <span>tts_g2p_optimizer.py</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-zinc-400 italic">
                  <Folder className="w-4 h-4 text-zinc-300" />
                  <span>models/ <span className="font-sans text-[10px] text-zinc-400">(Local ONNX cache)</span></span>
                </div>

                <button
                  onClick={() => setSelectedFile(INTERNSHIP_CODE_FILES[2])}
                  className={`flex items-center gap-2 w-full text-left p-1 rounded hover:bg-zinc-50 ${
                    selectedFile.filename === "windows-setup.bat" ? "text-indigo-600 font-bold" : ""
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                  <span>windows-setup.bat</span>
                </button>

                <div className="flex items-center gap-2 text-zinc-400/80">
                  <FileText className="w-3.5 h-3.5 text-zinc-300" />
                  <span>README.md</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick-Download card */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 space-y-3.5">
            <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-indigo-800">Direct Local Exporter</h4>
            <p className="text-xs text-indigo-700 leading-relaxed">
              Click below to download the executable Batch automation script which automatically provisions Python virtual environment, PIP dependencies, and downloads official ONNX files on Windows.
            </p>
            <button
              onClick={() => handleDownloadFile(INTERNSHIP_CODE_FILES[2])}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" /> Download Windows Installer (.bat)
            </button>
          </div>
        </div>

        {/* Right Columns: Code Display Box */}
        <div className="lg:col-span-2 bg-zinc-950 rounded-xl p-5 flex flex-col justify-between overflow-hidden shadow-md max-h-[550px] border border-zinc-800">
          <div className="space-y-4 h-full flex flex-col justify-between">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] text-zinc-500 font-mono block">Path: /{selectedFile.filepath}</span>
                <span className="text-xs text-zinc-300 font-semibold uppercase font-mono tracking-wider">{selectedFile.filename}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCode(selectedFile.code)}
                  className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-855 text-zinc-400 hover:text-white rounded text-xs flex items-center gap-1.5 transition-all"
                  title="Copy path content"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={() => handleDownloadFile(selectedFile.selected || selectedFile)}
                  className="px-2.5 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 rounded text-xs flex items-center gap-1.5 transition-all"
                  title="Download raw file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 italic font-mono leading-normal">
              // {selectedFile.description}
            </p>

            {/* Code Body */}
            <div className="flex-1 overflow-auto mt-2 bg-zinc-900/60 p-3.5 rounded-lg border border-zinc-900/40 text-xs text-zinc-200 font-mono whitespace-pre leading-relaxed scrollbar-thin">
              <code>{selectedFile.code}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
