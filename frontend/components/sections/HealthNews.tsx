import Link from "next/link";

const newsItems = [
  {
    category: "Cancer Research",
    title: "Introducing 2026 Breakthroughs: New Hope for Cancer Patients",
    description: "Duke Cancer Institute unveils groundbreaking advances in immunotherapy, targeted treatments, and early detection methods transforming cancer care.",
    date: "May 14, 2026",
    href: "https://www.dukecancerinstitute.org/blogs/introducing-2026-breakthroughs",
  },
  {
    category: "Research",
    title: "Breakthrough Blood Test Could Revolutionize Early Disease Detection",
    description: "University of Bristol researchers develop a groundbreaking blood test capable of detecting multiple diseases at their earliest stages.",
    date: "May 18, 2026",
    href: "https://www.bristol.ac.uk/news/2026/may/breakthrough-blood-test.html",
  },
  {
    category: "Public Health",
    title: "Global Health Gains Face Threat of Reversal, WHO Warns",
    description: "The WHO warns that decades of progress in global health could be reversed due to climate change, conflict, and funding shortfalls.",
    date: "May 13, 2026",
    href: "https://www.who.int/news/item/13-05-2026-global-health-gains-face-threat-of-reversal",
  },
];

export function HealthNews() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto px-4 max-w-[1024px]">
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-[0.15em]">Stay Informed</span>
            <h2 className="text-2xl sm:text-4xl md:text-[2.75rem] font-bold leading-tight text-gray-900 mt-1 sm:mt-2">
              Latest Health News
            </h2>
          </div>
          <Link
            href="/news"
            className="group flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:text-teal-600 hover:border-teal-300 hover:bg-teal-50/50 transition-all duration-200 shrink-0"
          >
            <span>View all</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {newsItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 transition-all duration-300 hover:border-teal-200 hover:shadow-[0_12px_35px_-12px_rgba(0,0,0,0.1)] flex flex-col"
            >
              <span className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-100/60 mb-4">
                {item.category}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 leading-snug group-hover:text-teal-700 transition-colors mb-2 line-clamp-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
                {item.description}
              </p>
              <div className="mt-auto flex items-center gap-2 text-xs text-gray-400 font-medium pt-3 border-t border-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                <span>{item.date}</span>
                <svg className="h-3.5 w-3.5 ml-auto text-gray-300 group-hover:text-teal-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
