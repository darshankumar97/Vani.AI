import React, { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, Sparkles, User, ShieldAlert, Cpu } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const NATIVE_SUGGESTION_PROMPTS = [
  "How can I compile Piper for Windows using C++ instead of Python?",
  "What parameters minimize CPU latency (RTF) in ONNX pipelines?",
  "Explain Dravidian gemination Rules to a non-linguist."
];

export default function AiAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Greetings! I am the Principal Systems & ML Architect for this Multi-lingual TTS blueprint. Ask me any advanced engineering queries about Windows CPU optimizations, G2P phonology, Piper/XTTS integration, or offline deployment."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    setErrorText("");
    setInput("");
    setLoading(true);

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("/api/query-architecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-8) // Send recent context limits
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Internal Server requested is stale.");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || "No response received." }
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Failed to contact full-stack Gemini API routing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-assistant-section" className="space-y-6">
      <div className="border-b border-zinc-100 pb-5">
        <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">AI Architecture Assistant</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Consult the Principal Systems Architect regarding offline compiling, benchmark matrices, or specific Dravidian script behaviors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Column */}
        <div className="space-y-4">
          <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-zinc-400" />
              Windows CPU Tweaks
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              When implementing local servers, achieve sub-100ms speeds on modern Windows CPUs by optimizing the backend threads count:
            </p>
            <ul className="text-xs text-zinc-500 space-y-1.5 list-disc list-inside">
              <li>Bind inference threads to physical cores: <code className="bg-zinc-100 px-1 font-mono text-[10px]">intra_op_num_threads</code>.</li>
              <li>Utilize float16 (FP16) model branches.</li>
              <li>Initialize models at load-time (lazy cached sessions).</li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider font-semibold block">Suggested Queries:</span>
            <div className="flex flex-col gap-2">
              {NATIVE_SUGGESTION_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  type="button"
                  disabled={loading}
                  className="w-full text-left p-2.5 bg-white border border-zinc-200/60 hover:bg-zinc-50 text-xs text-zinc-700 rounded-lg hover:border-zinc-300 transition-all font-sans leading-normal disabled:opacity-50 disabled:pointer-events-none"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Column */}
        <div className="lg:col-span-2 bg-white border border-zinc-100 rounded-xl shadow-xs overflow-hidden h-[500px] flex flex-col justify-between">
          
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-50/10">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${
                  m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    m.role === "user" ? "bg-zinc-900 text-white" : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                </div>

                <div className="space-y-1">
                  <div
                    className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-zinc-900 text-white rounded-tr-none"
                        : "bg-white border border-zinc-100 rounded-tl-none text-zinc-800 shadow-3xs"
                    }`}
                  >
                    <div className="whitespace-pre-line font-sans prose prose-neutral max-w-none">
                      {m.content}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 max-w-[80%] mr-auto">
                <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-zinc-150 p-3.5 rounded-xl rounded-tl-none shadow-3xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  <span className="text-xs text-zinc-400 italic ml-1">Analyzing architectures...</span>
                </div>
              </div>
            )}
            {errorText && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-xs flex items-center gap-2 font-mono">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorText}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form input */}
          <div className="border-t border-zinc-100 p-4 bg-white flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask about DirectML wrappers, Windows services setup, translation pipelines..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage(input);
              }}
              disabled={loading}
              className="flex-1 px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400 text-zinc-900 placeholder-zinc-400 disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage(input)}
              type="button"
              disabled={loading || !input.trim()}
              className="p-2 bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg disabled:opacity-40 transition-all cursor-pointer shrink-0"
              title="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
