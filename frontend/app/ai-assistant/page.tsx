"use client";

import { useState, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const suggestions = [
  "What is Napa used for?",
  "Side effects of Metformin",
  "What are symptoms of diabetes?",
  "Can I take Fexo and Napa together?",
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setLoading(true);
    setStreaming("");

    try {
      const history = messages.map(m => ({ role: m.role, content: m.text }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, history }),
      });

      if (!res.ok) {
        setMessages(prev => [...prev, { role: "assistant", text: "Something went wrong. Please try again." }]);
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let buf = "", full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: [DONE]")) break;
          if (!line.startsWith("data: ")) continue;
          try {
            const json = JSON.parse(line.slice(6));
            if (json.token) { full += json.token; setStreaming(full); }
          } catch {}
        }
      }

      if (full) setMessages(prev => [...prev, { role: "assistant", text: full }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Something went wrong." }]);
    } finally {
      setLoading(false);
      setStreaming("");
      inputRef.current?.focus();
    }
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "linear-gradient(180deg, #f5f0ff 0%, #faf7ff 40%, #ffffff 100%)" }}>
      <div className="w-full max-w-[700px] mx-auto flex flex-col flex-1 px-4">

        {/* Zero state */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-200">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <h1 className="text-xl text-gray-800 font-semibold mb-1.5">How can I help you today?</h1>
            <p className="text-[13px] text-gray-400 mb-6">Ask about medications, side effects, or drug information</p>

            <div className="grid grid-cols-2 gap-2.5 max-w-md w-full mb-6">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(s)}
                  className="text-[13px] px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50 transition-all cursor-pointer text-left shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-md">
                <div className="flex items-center bg-white border-2 border-purple-200 rounded-2xl focus-within:border-purple-400 focus-within:ring-4 focus-within:ring-purple-100 transition-all overflow-hidden shadow-lg shadow-purple-100">
                <input
                  ref={inputRef}
                  type="text" value={input} onChange={e => setInput(e.target.value)}
                  placeholder="Ask about a medication..."
                  className="flex-1 bg-transparent border-0 py-4 px-5 text-[15px] outline-none text-gray-800 placeholder:text-gray-400"
                  disabled={loading}
                />
                <button type="submit" disabled={loading}
                  className="shrink-0 w-10 h-10 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:opacity-30 transition-all flex items-center justify-center cursor-pointer mr-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                </button>
              </div>
              <p className="text-[12px] text-gray-400 text-center mt-3">Med-Nest AI can make mistakes. Consult a Health Care Professional.</p>
            </form>
          </div>
        )}

        {/* Chat mode */}
        {messages.length > 0 && (
          <>
            {/* Header */}
            <div className="shrink-0 flex items-center gap-2 py-3">
              <button onClick={() => setMessages([])} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
                </svg>
              </button>
              <span className="text-[14px] font-medium text-gray-700">Med-Nest AI</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-2 space-y-4 scroll-container" style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-purple-500 text-white rounded-2xl rounded-tr-sm px-4 py-2.5"
                      : "text-gray-700"
                  }`}>
                    <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}

              {/* Streaming */}
              {(loading || streaming) && (
                <div className="flex justify-start">
                  <div className="max-w-[85%]">
                    {streaming ? (
                      <p className="text-[14px] leading-relaxed whitespace-pre-wrap text-gray-500">
                        {streaming}
                        <span className="inline-block w-1.5 h-4 bg-purple-400 ml-0.5 animate-pulse rounded-sm align-middle" />
                      </p>
                    ) : (
                      <div className="flex gap-1.5 pt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "200ms" }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "400ms" }} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            {/* Chat input */}
            <div className="shrink-0 py-3 mb-32 lg:mb-64">
              <form onSubmit={handleSubmit}>
              <div className="flex items-center bg-white border-2 border-purple-200 rounded-2xl focus-within:border-purple-400 focus-within:ring-4 focus-within:ring-purple-100 transition-all overflow-hidden shadow-lg shadow-purple-100">
                  <input
                    ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
                    placeholder="Ask about a medication..."
                    className="flex-1 bg-transparent border-0 py-4 px-5 text-[15px] outline-none text-gray-800 placeholder:text-gray-400"
                    disabled={loading}
                  />
                  <button type="submit" disabled={loading}
                    className="shrink-0 w-10 h-10 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:opacity-30 transition-all flex items-center justify-center cursor-pointer mr-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </form>
              <p className="text-[11px] text-gray-400 text-center mt-2.5">Med-Nest AI can make mistakes. Consult a Health Care Professional.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
