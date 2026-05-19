"use client";

import { useState } from "react";
import Link from "next/link";

const ARTICLES = [
  {
    id: "breakthrough-blood-test",
    category: "Research",
    title: "Breakthrough Blood Test Could Revolutionize Early Disease Detection",
    description: "Researchers at the University of Bristol have developed a groundbreaking blood test capable of detecting multiple diseases at their earliest stages, potentially transforming preventive medicine worldwide.",
    author: "University of Bristol",
    date: "May 18, 2026",
    href: "https://www.bristol.ac.uk/news/2026/may/breakthrough-blood-test.html",
    source: "University of Bristol",
  },
  {
    id: "global-health-gains",
    category: "Public Health",
    title: "Global Health Gains Face Threat of Reversal, WHO Warns",
    description: "The World Health Organization warns that decades of progress in global health could be reversed due to climate change, conflict, and funding shortfalls, urging immediate international action.",
    author: "World Health Organization",
    date: "May 13, 2026",
    href: "https://www.who.int/news/item/13-05-2026-global-health-gains-face-threat-of-reversal",
    source: "WHO",
  },
  {
    id: "hiv-vaccine-awareness",
    category: "Vaccines",
    title: "IAVI HIV Vaccine Awareness Day 2026: African Research Leading the Charge",
    description: "African researchers are at the forefront of HIV vaccine development in 2026, with several promising candidates in clinical trials and new community-based approaches accelerating progress.",
    author: "IAVI / EATG",
    date: "May 17, 2026",
    href: "https://www.eatg.org/hiv-news/iavi-hiv-vaccine-awareness-day-2026-african-research-leading-the-charge/",
    source: "EATG",
  },
  {
    id: "medical-trends-2026",
    category: "Technology",
    title: "7 Medical Science Trends Shaping Healthcare in 2026",
    description: "From AI-powered diagnostics to personalized gene therapies, seven transformative trends are reshaping the healthcare landscape and promising better outcomes for patients worldwide.",
    author: "UF Physiology",
    date: "May 15, 2026",
    href: "https://distance.physiology.med.ufl.edu/about/articles/7-medical-sciences-trends-shaping-healthcare-in-2026/",
    source: "University of Florida",
  },
  {
    id: "medtech-breakthrough-awards",
    category: "Technology",
    title: "Syneos Health Wins Best Mobile App for Patient Engagement in 2026 MedTech Breakthrough Awards",
    description: "The 2026 MedTech Breakthrough Awards recognize Syneos Health's innovative mobile application that is transforming how patients engage with their healthcare providers and treatment plans.",
    author: "BioSpace",
    date: "May 16, 2026",
    href: "https://www.biospace.com/press-releases/syneos-health-wins-best-mobile-app-for-patient-engagement-in-2026-medtech-breakthrough-awards",
    source: "BioSpace",
  },
  {
    id: "cancer-breakthroughs-2026",
    category: "Cancer Research",
    title: "Introducing 2026 Breakthroughs: New Hope for Cancer Patients",
    description: "Duke Cancer Institute unveils groundbreaking advances in immunotherapy, targeted treatments, and early detection methods that are changing the landscape of cancer care in 2026.",
    author: "Duke Cancer Institute",
    date: "May 14, 2026",
    href: "https://www.dukecancerinstitute.org/blogs/introducing-2026-breakthroughs",
    source: "Duke Cancer Institute",
  },
  {
    id: "stem-cell-breakthroughs",
    category: "Research",
    title: "Top Medical Breakthroughs of 2026: Stem Cell Therapies Leading the Way",
    description: "Stem cell research continues to deliver remarkable breakthroughs in 2026, with new treatments for degenerative diseases, spinal cord injuries, and organ regeneration showing unprecedented results.",
    author: "Stem Cell Thailand",
    date: "May 12, 2026",
    href: "https://stemcellthailand.org/top-medical-breakthroughs/",
    source: "Stem Cell Thailand",
  },
  {
    id: "sciencedaily-discovery-1",
    category: "Research",
    title: "Scientists Make Major Discovery in Understanding Brain Disorders",
    description: "New research published in ScienceDaily reveals a previously unknown mechanism behind neurodegenerative diseases, opening doors to potential treatments for Alzheimer's and Parkinson's.",
    author: "ScienceDaily",
    date: "May 17, 2026",
    href: "https://www.sciencedaily.com/releases/2026/05/260517211427.htm",
    source: "ScienceDaily",
  },
  {
    id: "sciencedaily-discovery-2",
    category: "Research",
    title: "New Study Reveals Surprising Link Between Gut Health and Immunity",
    description: "Researchers have discovered a direct connection between gut microbiome composition and immune system response, paving the way for microbiome-based therapies for autoimmune conditions.",
    author: "ScienceDaily",
    date: "May 17, 2026",
    href: "https://www.sciencedaily.com/releases/2026/05/260517030326.htm",
    source: "ScienceDaily",
  },
  {
    id: "health-medicine-roundup",
    category: "Public Health",
    title: "Health & Medicine Roundup: Latest Breakthroughs and Discoveries",
    description: "A comprehensive roundup of the latest developments in health and medicine, covering new drug approvals, treatment guidelines, and emerging health threats from around the world.",
    author: "ScienceDaily",
    date: "May 16, 2026",
    href: "https://www.sciencedaily.com/news/health_medicine/",
    source: "ScienceDaily",
  },
];

const CATEGORIES = [...new Set(ARTICLES.map(a => a.category))];

export default function NewsPage() {
  const [activeCat, setActiveCat] = useState("All");
  const filtered = activeCat === "All" ? ARTICLES : ARTICLES.filter(a => a.category === activeCat);

  return (
    <div className="bg-gradient-to-b from-[#c5e0db] via-[#d5e9e7] to-[#e5f2ef] min-h-screen">
      <div className="max-w-[1024px] mx-auto px-3 sm:px-0 py-6">
        <div className="bg-white rounded-2xl border border-sky-200 shadow-[8px_16px_40px_rgba(0,0,0,0.15),0_20px_60px_-12px_rgba(0,0,0,0.25)] p-6 sm:p-8">

          {/* Header */}
          <div className="mb-8 pb-7 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-md">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
              </div>
              <div>
                <span className="text-[11px] font-bold text-teal-600 uppercase tracking-[0.2em]">Stay Informed</span>
                <h1 className="text-[28px] sm:text-[34px] font-bold text-gray-900 leading-tight -mt-0.5">Latest Health News</h1>
              </div>
            </div>
            <p className="text-[15px] text-gray-500 ml-[52px]">The latest medical breakthroughs, health research, and healthcare news from trusted sources worldwide.</p>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-7 pb-6 border-b border-gray-100">
            {["All", ...CATEGORIES].map(cat => (
              <button key={cat} onClick={() => setActiveCat(cat)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all uppercase tracking-wider cursor-pointer ${
                  activeCat === cat
                    ? "bg-teal-600 text-white shadow-sm border border-teal-600"
                    : "bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 hover:border-teal-400"
                }`}>
                {cat} {cat !== "All" && `(${ARTICLES.filter(a => a.category === cat).length})`}
              </button>
            ))}
          </div>

          {/* Results count */}
          <p className="text-[13px] text-gray-400 mb-4">{filtered.length} article{filtered.length !== 1 ? "s" : ""}</p>

          {/* Articles */}
          <div className="space-y-4">
            {filtered.map((article, i) => (
              <a key={article.id}
                href={article.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block group bg-white rounded-xl border border-gray-200 shadow-sm hover:border-teal-300 hover:shadow-[0_8px_25px_-8px_rgba(13,148,136,0.2)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-500 items-center justify-center shrink-0 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all">
                      <span className="text-[14px] font-bold text-white">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 shadow-sm">
                          {article.category}
                        </span>
                        <span className="text-[12px] font-medium text-gray-500 flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                          {article.source}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-[12px] font-medium text-gray-500 flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                          {article.date}
                        </span>
                      </div>
                      <h2 className="text-[16px] sm:text-[18px] font-bold text-gray-900 group-hover:text-teal-700 transition-colors leading-snug mb-1.5">
                        {article.title}
                      </h2>
                      <p className="text-[13px] sm:text-[14px] text-gray-500 leading-relaxed line-clamp-2">
                        {article.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-3 text-[12px] font-semibold text-teal-600 group-hover:text-teal-700 transition-colors">
                        <span>Read full article</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform"><path d="M7 7h10v10"/><path d="M7 17 21 3"/></svg>
                      </div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 group-hover:text-teal-500 shrink-0 mt-1 transition-colors">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </div>
                </div>
              </a>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-[14px]">No articles found in this category.</div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-[12px] text-gray-400 leading-relaxed">News articles are sourced from reputable medical and scientific organizations. Med-Nest does not endorse any specific research or claims.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
