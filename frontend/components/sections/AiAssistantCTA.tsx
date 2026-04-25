import Link from "next/link"

export function AiAssistantCTA() {
  return (
    <section className="py-16 bg-white">
      <div 
        className="container-medq py-16 px-4 text-center text-gray-900 mx-auto" 
        style={{ 
          backgroundColor: '#efdcf2', 
          borderRadius: '3rem', 
          maxWidth: '80rem',
          boxShadow: '0 40px 60px -15px rgba(0, 0, 0, 0.15), 0 20px 30px -10px rgba(0, 0, 0, 0.1)' 
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 mx-auto mb-4 opacity-90 text-navy" aria-hidden="true">
          <path d="M12 8V4H8"></path>
          <rect width="16" height="12" x="4" y="8" rx="2"></rect>
          <path d="M2 14h2"></path>
          <path d="M20 14h2"></path>
          <path d="M15 13v2"></path>
          <path d="M9 13v2"></path>
        </svg>
        <h2 className="text-3xl font-bold mb-4 text-navy">Have a question about your medication?</h2>
        <p className="text-gray-700 mb-8 max-w-xl mx-auto text-lg leading-relaxed">
          Our AI assistant, powered by Google Gemini, can help answer your medication questions 24/7.
        </p>
        <Link 
          href="#" 
          className="inline-flex items-center gap-2 bg-white font-semibold px-8 py-4 rounded-xl transition-all duration-150 hover:opacity-90 hover:scale-105 text-lg shadow-sm border border-white/50" 
          style={{ color: 'var(--primary)' }}
        >
          Chat with Med-Nest AI
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </Link>
      </div>
    </section>
  )
}
