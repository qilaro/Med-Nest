"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  text: string;
  sources?: { name: string; slug: string }[];
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi! I'm your Med-Nest AI assistant. Ask me anything about medications available in Bangladesh." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;

    setInput("");
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        { role: "assistant", text: data.answer || "Sorry, I couldn't process that.", sources: data.sources },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "assistant", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#e8dff5] via-[#f0e8fa] to-[#f5f0fa] min-h-screen">
      <div className="max-w-[1024px] mx-auto px-3 sm:px-0 py-6 flex flex-col min-h-screen">
        <div className="bg-white rounded-2xl border border-purple-200 shadow-[8px_16px_40px_rgba(0,0,0,0.12),0_20px_60px_-12px_rgba(147,51,234,0.15)] overflow-hidden flex-1 flex flex-col">
          <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600" />

          {/* Header */}
          <div className="px-5 sm:px-8 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
              </svg>
            </div>
            <div>
              <h1 className="text-[16px] font-bold text-gray-900">Med-Nest AI</h1>
              <p className="text-[11px] text-gray-400">Ask about any medication</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white rounded-br-md"
                    : "bg-gray-50 border border-gray-100 text-gray-800 rounded-bl-md"
                }`}>
                  <p className="text-[14px] sm:text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200/50">
                      <p className="text-[11px] font-semibold text-gray-500 mb-1">Sources:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((s) => (
                          <Link key={s.slug}
                            href={`/generics/${s.slug}`}
                            className="text-[11px] text-purple-600 hover:text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 font-medium"
                          >
                            {s.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Disclaimer */}
          <div className="px-5 sm:px-8 py-2 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 text-center">
              This AI provides information for educational purposes only. Always consult a doctor.
            </p>
          </div>

          {/* Input */}
          <div className="px-5 sm:px-8 py-4 border-t border-gray-100">
            <form onSubmit={handleSubmit} className="flex items-stretch gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about a medication..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-[14px] outline-none focus:border-purple-400 transition-colors placeholder:text-gray-400"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="shrink-0 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold text-[14px] hover:from-purple-600 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
