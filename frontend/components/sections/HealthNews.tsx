import Link from "next/link"

const newsItems = [
  {
    category: "Research",
    title: "The Future of Personalized Medicine: Pharmacogenomics",
    description: "How genetic testing is revolutionizing drug prescribing, moving toward truly personalized medication plans.",
    author: "Dr. Michael Torres",
    date: "4/19/2026",
    href: "#",
  },
  {
    category: "Patient Guide",
    title: "Blood Pressure Medications: A Complete Guide to the Different Classes",
    description: "Understanding the different classes of blood pressure medications can help patients have more informed discussions with their doctors.",
    author: "Dr. Emily Chen",
    date: "4/19/2026",
    href: "#",
  },
  {
    category: "Patient Guide",
    title: "Generic Medications: Are They as Effective as Brand Names?",
    description: "FDA-approved generic medications are therapeutically equivalent to brand-name drugs and provide affordable treatment options.",
    author: "Dr. Robert Kim",
    date: "4/19/2026",
    href: "#",
  },
]

export function HealthNews() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-medq mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl md:text-[3.5rem] font-bold leading-tight">Latest Health News</h2>
          <Link href="#" className="text-sm font-medium flex items-center gap-1 text-primary hover:opacity-80 transition-opacity">
            View all
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {newsItems.map((item, index) => (
            <Link key={index} href={item.href} className="bg-white rounded-2xl p-10 border border-gray-200 shadow-sm transition-all duration-150 hover:border-primary hover:shadow-lg group">
              <span className="inline-block rounded-full px-3 py-1 text-sm font-semibold font-serif bg-[#E4F1F0] text-[#0A5C55] mb-3">
                {item.category}
              </span>
              <h3 className="text-2xl font-semibold text-navy mb-2 leading-snug group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                {item.description}
              </p>
              <div className="text-sm text-gray-800 mt-3 font-semibold">
                {item.author} · {item.date}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
