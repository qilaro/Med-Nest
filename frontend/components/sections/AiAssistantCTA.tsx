import Link from "next/link"

export function AiAssistantCTA() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-0">
      <div className="mx-auto max-w-[1024px] bg-white rounded-2xl border border-purple-200 shadow-[8px_16px_40px_rgba(0,0,0,0.12),0_20px_60px_-12px_rgba(147,51,234,0.12)] overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600" />

        <div className="p-8 sm:p-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-[0_0_30px_-8px_rgba(147,51,234,0.3)] mb-5">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
            </svg>
          </div>

          <h2 className="text-[24px] sm:text-[30px] font-bold text-gray-900 leading-tight mb-3">
            Have a question about your medication?
          </h2>
          <p className="text-[15px] sm:text-[17px] text-gray-600 max-w-xl mx-auto leading-relaxed mb-7">
            Our AI assistant, powered by Google Gemini, can help answer your medication questions 24/7.
          </p>

          <Link
            href="/ai-assistant"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold text-[15px] shadow-md hover:shadow-lg hover:from-purple-600 hover:to-purple-700 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.97]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Chat with Med-Nest AI
          </Link>
        </div>
      </div>
    </section>
  )
}
