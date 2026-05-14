import Link from "next/link"

const newsItems = [
  {
    category: "Research",
    title: "The Future of Personalized Medicine: Pharmacogenomics",
    description: "How genetic testing is revolutionizing drug prescribing, moving toward truly personalized medication plans.",
    author: "Dr. Michael Torres",
    date: "Apr 19, 2026",
    href: "#",
  },
  {
    category: "Patient Guide",
    title: "Blood Pressure Medications: A Complete Guide to the Different Classes",
    description: "Understanding the different classes of blood pressure medications can help patients have more informed discussions with their doctors.",
    author: "Dr. Emily Chen",
    date: "Apr 19, 2026",
    href: "#",
  },
  {
    category: "Patient Guide",
    title: "Generic Medications: Are They as Effective as Brand Names?",
    description: "FDA-approved generic medications are therapeutically equivalent to brand-name drugs and provide affordable treatment options.",
    author: "Dr. Robert Kim",
    date: "Apr 19, 2026",
    href: "#",
  },
]

export function HealthNews() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto px-4 max-w-[1024px]">
        {/* Header */}
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-[0.15em]">Stay Informed</span>
            <h2 className="text-2xl sm:text-4xl md:text-[2.75rem] font-bold leading-tight text-gray-900 mt-1 sm:mt-2">
              Latest Health News
            </h2>
          </div>
          <Link
            href="#"
            className="group flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:text-teal-600 hover:border-teal-300 hover:bg-teal-50/50 transition-all duration-200 shrink-0"
          >
            <span>View all</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {newsItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="group bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 transition-all duration-300 hover:border-teal-200 hover:shadow-[0_12px_35px_-12px_rgba(0,0,0,0.1)] flex flex-col"
            >
              <span className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-100/60 mb-4">
                {item.category === "Research" && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                )}
                {item.category === "Patient Guide" && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>
                )}
                {item.category}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 leading-snug group-hover:text-teal-700 transition-colors mb-2 line-clamp-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
                {item.description}
              </p>
              <div className="mt-auto flex items-center gap-2 text-xs text-gray-400 font-medium pt-3 border-t border-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>{item.author}</span>
                <span className="text-gray-300">·</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                <span>{item.date}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}