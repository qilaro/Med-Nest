"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import AZBrowse from "@/components/drugs/AZBrowse";

type Company = { name: string; brand_count: number };

const TYPE_OPTIONS = [
  ["", "All Types"],
  ["allopathic", "Pharmaceutical"],
  ["herbal", "Herbal"],
  ["unani", "Unani"],
  ["homeopathic", "Homeopathic"],
  ["ayurvedic", "Ayurvedic"],
];

const TYPE_LABELS: Record<string, string> = {
  allopathic: "Pharmaceutical",
  herbal: "Herbal",
  unani: "Unani",
  homeopathic: "Homeopathic",
  ayurvedic: "Ayurvedic",
};

function CompaniesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQ = searchParams.get("search") || "";
  const typeFilter = searchParams.get("type") || "";
  const letterFilter = searchParams.get("letter") || "";

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchQ);
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedType, setSelectedType] = useState(typeFilter);
  const [animatedCount, setAnimatedCount] = useState(0);
  const countAnimRef = useRef(0);
  const [totalResults, setTotalResults] = useState(0);
  const firstLoad = useRef(true);

  // Suggestion state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  // Debounced suggestion fetch
  useEffect(() => {
    if (query.trim().length === 0 || activeSearch || searchQ) {
      setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/companies?q=${encodeURIComponent(query.trim())}`);
        if (!res.ok) return;
        const data = await res.json();
        setSuggestions(data.slice(0, 8));
        setShowSuggestions(data.length > 0);
      } catch {}
    }, 150);
    return () => clearTimeout(timer);
  }, [query, activeSearch, searchQ]);

  useEffect(() => {
    const from = countAnimRef.current;
    const to = totalResults;
    if (from === to) return;
    const duration = 300;
    const start = performance.now();
    const raf = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(from + (to - from) * progress);
      setAnimatedCount(current);
      if (progress < 1) requestAnimationFrame(raf);
      else countAnimRef.current = to;
    };
    requestAnimationFrame(raf);
  }, [totalResults]);

  useEffect(() => {
    setSelectedType(typeFilter);
    setCurrentPage(1);
  }, [typeFilter, letterFilter]);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchData() {
      const isFirst = firstLoad.current;
      if (isFirst) setLoading(true);
      firstLoad.current = false;
      try {
        const params = new URLSearchParams();
        const s = activeSearch || searchQ;
        if (s) params.set("search", s);
        if (typeFilter) params.set("medicine_type", typeFilter);
        if (letterFilter) params.set("letter", letterFilter);

        const res = await fetch(`/api/companies?${params}`);
        const data = await res.json();
        setCompanies(data);
        setTotalResults(data.length || 0);
      } catch {
        setCompanies([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeSearch, searchQ, typeFilter, letterFilter]);

  const isFiltered = !!(activeSearch || searchQ || typeFilter || letterFilter);

  return (
    <div className="bg-gradient-to-b from-[#c5e0db] via-[#d5e9e7] to-[#e5f2ef] py-6 min-h-screen">
      <div className="max-w-[1024px] mx-auto px-3 sm:px-0">
        <div className="bg-white rounded-2xl border border-sky-200 shadow-[8px_16px_40px_rgba(0,0,0,0.15),0_20px_60px_-12px_rgba(0,0,0,0.25)] p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-1">
              Pharmaceutical Companies
            </h1>
            <p className="text-sm text-gray-500">
              Browse all pharmaceutical companies in Bangladesh
            </p>
          </div>

          {/* Search */}
          <form ref={searchRef} onSubmit={(e) => { e.preventDefault(); setShowSuggestions(false); if (query.trim()) { if (typeFilter || letterFilter) { const p = new URLSearchParams(); p.set('search', query.trim()); if (typeFilter) p.set('type', typeFilter); if (letterFilter) p.set('letter', letterFilter); router.push(`/companies?${p}`); } else { setActiveSearch(query.trim()); } } }} className="mb-6 max-w-4xl mx-auto relative">
            <div className="flex items-stretch rounded-full border-2 border-sky-200 bg-white focus-within:border-teal-400 focus-within:shadow-[0_0_0_4px_rgba(45,138,120,0.2)] transition-shadow duration-200 overflow-hidden">
              <div className="relative flex-1 min-w-0 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-5 h-5 w-5 text-gray-400 shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (searchQ) router.replace('/companies');
                    else if (activeSearch) setActiveSearch("");
                  }}
                  onFocus={() => { if (!activeSearch && !searchQ) setShowSuggestions(true); }}
                  placeholder="Search pharmaceutical companies..."
                  className="w-full bg-transparent border-0 pl-14 pr-4 h-12 sm:h-14 text-sm sm:text-base outline-none text-gray-800 placeholder:text-gray-400"
                />
              </div>
              <button type="submit" className="h-12 sm:h-14 shrink-0 px-5 sm:px-6 bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm sm:text-base transition-colors cursor-pointer flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {suggestions.map((s: any) => (
                  <Link
                    key={s.name}
                    href={`/companies/${s.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="w-full flex items-center gap-3 px-3 sm:px-5 py-2 sm:py-3 transition-colors text-left border-b border-gray-100 last:border-0 hover:bg-teal-100"
                    onClick={() => setShowSuggestions(false)}
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-50 flex items-center justify-center shrink-0 border border-teal-100">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm sm:text-base font-semibold text-gray-800 truncate block">
                        {s.name}
                      </span>
                      <span className="text-xs text-gray-500">{s.brandCount} brand{s.brandCount !== 1 ? 's' : ''}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </form>

          {/* Type Filter + Clear */}
          <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
            <div className="relative inline-block">
              <select
                value={selectedType}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedType(val);
                  const p = new URLSearchParams();
                  const s = activeSearch || searchQ;
                  if (s) p.set('search', s);
                  if (val) p.set('type', val);
                  if (letterFilter) p.set('letter', letterFilter);
                  router.push(p.toString() ? `/companies?${p}` : "/companies");
                }}
                className="appearance-none rounded-full px-5 py-2 pr-8 text-sm font-semibold text-center shadow-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-300 border-2 bg-gray-50 text-gray-700 border-sky-200 hover:border-teal-400 hover:bg-teal-50 [&>option]:cursor-pointer min-w-[140px]"
              >
                {TYPE_OPTIONS.map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
            {isFiltered && (
              <button
                onClick={() => { setQuery(""); setActiveSearch(""); setSelectedType(""); router.push("/companies"); }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 hover:text-red-600 hover:border-red-300 active:scale-95 transition-colors duration-150 cursor-pointer align-middle shrink-0"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Clear
              </button>
            )}
          </div>

          {/* A-Z Keyboard */}
          {!searchQ && !isFiltered && <AZBrowse showTabs={false} simple />}

          {/* Results heading */}
          {!loading && companies.length > 0 && (
            <div className="flex items-center gap-2 mb-6 flex-wrap justify-center mt-4">
              <h2 className="text-base sm:text-lg font-bold text-navy">
                {(() => {
                  const filters = [
                    ...(activeSearch || searchQ ? [`"${activeSearch || searchQ}"`] : []),
                    ...(typeFilter ? [TYPE_LABELS[typeFilter] || typeFilter] : []),
                    ...(letterFilter ? [letterFilter] : []),
                  ].filter(Boolean);
                  return filters.length > 0
                    ? <>Showing <span className="text-teal-600">{animatedCount}</span> results for <span className="text-teal-600">{filters.join(', ')}</span></>
                    : <>All <span className="text-teal-600">{animatedCount}</span> companies</>;
                })()}
              </h2>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 animate-pulse">
                  <div className="w-14 h-14 bg-gray-200 rounded-2xl mx-auto mb-3" />
                  <div className="h-4 bg-gray-200 rounded-full w-3/4 mx-auto mb-2" />
                  <div className="h-3 bg-gray-100 rounded-full w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg font-semibold">No companies found</p>
              <p className="text-gray-400 text-sm mt-1">Try a different type filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {companies.map((company) => {
                const slug = company.name.toLowerCase().replace(/\s+/g, '-');
                return (
                <div
                  key={company.name}
                  onClick={() => router.push(`/companies/${slug}`)}
                  className="group relative flex flex-col items-center p-5 rounded-xl border-2 border-gray-100 bg-white hover:border-teal-300 hover:shadow-[0_8px_25px_-8px_rgba(0,0,0,0.1),0_4px_10px_-4px_rgba(0,150,136,0.12)] hover:-translate-y-1 transition-all duration-300 before:absolute before:inset-x-4 before:top-0 before:h-0.5 before:rounded-b before:bg-teal-500 before:opacity-0 before:transition-all before:duration-300 group-hover:before:opacity-100 cursor-pointer"
                >
                  {/* Verified badge */}
                  <span className="absolute top-2 right-2 z-10 text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" title="DGDA Verified Company">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center text-teal-600 group-hover:from-teal-100 group-hover:to-teal-200 group-hover:text-teal-700 group-hover:shadow-md group-hover:scale-105 transition-all duration-300 mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21h18"/>
                      <path d="M5 21V7l8-4v18"/>
                      <path d="M19 21V11l-6-4"/>
                      <path d="M9 9h1"/>
                      <path d="M9 13h1"/>
                      <path d="M14 9h1"/>
                      <path d="M14 13h1"/>
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 group-hover:text-teal-700 transition-colors text-center leading-snug line-clamp-2 mb-2">
                    {company.name}
                  </h3>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/drugs?company=${encodeURIComponent(company.name)}`);
                    }}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 hover:bg-teal-100 hover:border-teal-300 hover:shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer select-none"
                    title="View brands by this company"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                    </svg>
                    {company.brand_count} brand{company.brand_count !== 1 ? "s" : ""}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <path d="M7 17l9.2-9.2M17 17V7H7"/>
                    </svg>
                  </span>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[1024px] mx-auto py-20 text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
      </div>
    }>
      <CompaniesContent />
    </Suspense>
  );
}
