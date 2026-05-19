import React from "react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Health Assistant - Coming Soon | Med-Nest Bangladesh",
  description: "Med-Nest is building a specialized AI healthcare assistant for Bangladesh. Get personalized medication guidance, drug interaction analysis, and health advice powered by advanced AI.",
};

export default function AiAssistantPage() {
  return (
    <div className="bg-gradient-to-b from-[#e8dff5] via-[#f0e8fa] to-[#f5f0fa] min-h-screen">
      <div className="max-w-[1024px] mx-auto px-3 sm:px-0 py-6">
        <div className="bg-white rounded-2xl border border-purple-200 shadow-[8px_16px_40px_rgba(0,0,0,0.12),0_20px_60px_-12px_rgba(147,51,234,0.15)] p-6 sm:p-8">

          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
              </svg>
            </div>
            <h1 className="text-[32px] sm:text-[40px] font-bold text-gray-900 leading-tight mb-3">
              AI Health Assistant
            </h1>
            <p className="text-[16px] sm:text-[18px] text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Your intelligent healthcare companion — powered by advanced artificial intelligence, designed specifically for Bangladesh.
            </p>
          </div>

          {/* Search bar — top, like any AI model */}
          <div className="mb-10">
            <div className="flex items-stretch bg-white rounded-full border-2 border-purple-200 focus-within:border-purple-400 focus-within:shadow-[0_0_0_4px_rgba(147,51,234,0.15)] focus-within:ring-2 focus-within:ring-purple-200 transition-all duration-200 overflow-hidden max-w-xl sm:max-w-2xl mx-auto">
              <div className="relative flex items-center flex-1 min-w-0">
                <svg className="absolute left-3 sm:left-5 h-4 w-4 sm:h-5 sm:w-5 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input
                  type="text"
                  placeholder="Ask about your medication..."
                  className="w-full bg-transparent border-0 pl-8 sm:pl-12 pr-2 sm:pr-4 py-3.5 sm:py-4 text-[14px] sm:text-[16px] outline-none text-gray-800 placeholder:text-gray-500 placeholder:truncate"
                />
              </div>
              <button type="button" className="shrink-0 px-5 sm:px-7 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold text-[14px] transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                Ask
              </button>
            </div>
            <p className="text-[12px] sm:text-[13px] text-gray-600 font-medium text-center mt-3">Try: &ldquo;What is Napa used for?&rdquo; or &ldquo;Metformin side effects&rdquo;</p>
          </div>

          {/* Status banner */}
          <div className="mb-10 p-5 rounded-xl bg-purple-50 border border-purple-200 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-[11px] font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              Coming Soon
            </div>
            <p className="text-[15px] text-purple-800 font-medium">We&apos;re building a specialized AI model for Bangladesh healthcare.</p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {[
              {
                icon: <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2zm0 0"/>, // clipboard
                title: "Smart Drug Information",
                desc: "Ask about any medication in natural language. Get instant, accurate information about uses, dosages, side effects, and interactions."
              },
              {
                icon: <g><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></g>, // search
                title: "Symptom Checker",
                desc: "Describe your symptoms and our AI will suggest possible conditions and recommend appropriate medications available in Bangladesh."
              },
              {
                icon: <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>, // zap
                title: "Interaction Analysis",
                desc: "Check multiple medications at once for potential interactions. Our AI cross-references drug data to flag risky combinations."
              },
              {
                icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>, // shield
                title: "Personalized Health Insights",
                desc: "Get medication recommendations tailored to your health profile, allergies, and existing conditions — all stored privately and securely."
              },
              {
                icon: <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>, // cloud
                title: "Bangladesh-Specific Data",
                desc: "Trained on Bangladesh drug databases, DGDA regulations, and local medical practices. Knows about every brand available in the country."
              },
              {
                icon: <g><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></g>, // user
                title: "24/7 Health Companion",
                desc: "Available anytime, anywhere in Bangladesh. Ask questions in Bengali or English — our AI understands both languages fluently."
              },
            ].map((feature, i) => (
              <div key={i} className="p-5 rounded-xl bg-white border border-purple-100 hover:border-purple-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-3 group-hover:bg-purple-100 group-hover:scale-105 transition-all">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{feature.icon}</svg>
                </div>
                <h3 className="text-[15px] font-bold text-gray-900 mb-1.5">{feature.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Technology roadmap */}
          <div className="mb-10 p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200">
            <h2 className="text-[18px] font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Our AI Roadmap
            </h2>
            <div className="space-y-4">
              {[
                { phase: "Phase 1", title: "Medical Knowledge Base", desc: "Complete ingestion of Bangladesh drug database, medical guidelines, and pharmaceutical data.", done: true },
                { phase: "Phase 2", title: "Natural Language Interface", desc: "Bengali and English conversational AI for drug information, dosage queries, and interaction checks.", done: false },
                { phase: "Phase 3", title: "Personalized Health Model", desc: "Patient-specific recommendations based on medical history, allergies, and concurrent medications.", done: false },
                { phase: "Phase 4", title: "Clinical Decision Support", desc: "AI-powered diagnostic suggestions and treatment pathway recommendations for healthcare providers.", done: false },
              ].map((phase, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${phase.done ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-400"}`}>
                    {phase.done ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <span className="text-[12px] font-bold">{i + 1}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${phase.done ? "text-purple-600" : "text-purple-400"}`}>{phase.phase}</span>
                      {phase.done && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Complete</span>}
                    </div>
                    <h3 className="text-[14px] font-bold text-gray-800">{phase.title}</h3>
                    <p className="text-[13px] text-gray-500">{phase.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="mb-10">
            <div className="flex items-stretch bg-white rounded-full border-2 border-purple-200 focus-within:border-purple-400 focus-within:shadow-[0_0_0_4px_rgba(147,51,234,0.15)] transition-all duration-200 overflow-hidden max-w-2xl mx-auto">
              <div className="relative flex items-center flex-1 min-w-0">
                <svg className="absolute left-5 h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input
                  type="text"
                  placeholder="Ask anything about your medication..."
                  className="w-full bg-transparent border-0 pl-12 pr-4 py-3.5 text-[15px] outline-none text-gray-800 placeholder:text-purple-300"
                />
              </div>
              <button type="button" className="shrink-0 px-6 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold text-[14px] transition-all cursor-pointer flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                Ask
              </button>
            </div>
            <p className="text-[12px] text-purple-400 text-center mt-2">Try: &ldquo;What is Napa used for?&rdquo; or &ldquo;Side effects of Metformin&rdquo;</p>
          </div>

          {/* Early access CTA */}
          <div className="text-center p-8 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 shadow-xl">
            <h2 className="text-[22px] sm:text-[26px] font-bold text-white mb-2">Be the First to Experience It</h2>
            <p className="text-[14px] text-purple-200 mb-6 max-w-lg mx-auto">Join our early access list and get notified when the AI Health Assistant launches.</p>
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/20 text-white text-[14px] font-semibold mx-auto">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Early access signup opening soon
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-[12px] text-gray-400">This feature is under development. The AI Health Assistant is not a substitute for professional medical advice.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
