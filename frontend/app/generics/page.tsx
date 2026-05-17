"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { genericService } from "@/lib/services/genericService";
import { GenericSummary } from "@/types/generic";
import GenericCard from "@/components/generics/GenericCard";
import AZBrowse from "@/components/drugs/AZBrowse";
import Link from "next/link";

function GenericsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const searchQ = searchParams.get("search") || "";
  const typeFilter = searchParams.get("type") || "";
  const classFilter = searchParams.get("class") || "";
  const ratingFilter = searchParams.get("rating") || "";
  const letterFilter = searchParams.get("letter") || "";

  const [generics, setGenerics] = useState<GenericSummary[]>([]);
  const [classes, setClasses] = useState<{ name: string; count: number }[]>([]);
  const [query, setQuery] = useState(searchQ);
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedType, setSelectedType] = useState(typeFilter);
  const [selectedClass, setSelectedClass] = useState(classFilter);
  const [selectedRating, setSelectedRating] = useState(ratingFilter);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [animatedCount, setAnimatedCount] = useState(0);
  const countAnimRef = useRef(0);
  const [warning, setWarning] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{ name: string; slug: string; brandCount: number }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);
  const interactedRef = useRef(false);
  const savedScrollY = useRef(0);
  const searchCache = useRef<Map<string, { name: string; slug: string; brandCount: number; medicineType: string | null; therapeuticClass: string | null }[]>>(new Map());
  const firstLoad = useRef(true);

  // Animate totalResults count — smooth spin-up on every filter change
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

  const isFiltered = !!(activeSearch || searchQ || typeFilter || classFilter || ratingFilter || letterFilter);

  // Debounced suggestion fetch with optimistic cache
  useEffect(() => {
    if (query.trim().length === 0) {
      if (activeSearch) setActiveSearch("");
      if (interactedRef.current) {
        fetch('/api/popular-generics').then(r => r.json()).then(data => {
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        }).catch(() => {});
      }
      return;
    }
    if (activeSearch && query.trim() === activeSearch) {
      setShowSuggestions(false);
      return;
    }
    // Optimistic: check local cache → show instantly
    const cached = searchCache.current.get(query.trim().toLowerCase());
    if (cached) {
      setSuggestions(cached);
      setShowSuggestions(cached.length > 0);
    }
    // Fresh fetch in background
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/generics?q=${encodeURIComponent(query.trim())}`);
        if (!res.ok) return;
        const data = await res.json();
        searchCache.current.set(query.trim().toLowerCase(), data);
        if (searchCache.current.size > 50) {
          const first = searchCache.current.keys().next().value;
          if (first) searchCache.current.delete(first);
        }
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch {}
    }, 100);
    return () => clearTimeout(timer);
  }, [query, activeSearch, searchQ]);

  // Fetch generics data
  useEffect(() => {
    async function fetchData() {
      const isFirst = firstLoad.current;
      if (isFirst) setLoading(true);
      firstLoad.current = false;
      try {
        const [genericsData, classesData] = await Promise.all([
          genericService.getGenerics({
            page: currentPage,
            medicine_type: typeFilter || undefined,
            drug_class: classFilter || undefined,
            rating: ratingFilter || undefined,
            letter: letterFilter || undefined,
            search: (activeSearch || searchQ) || undefined,
          }),
          genericService.getGenericClasses(),
        ]);

        setGenerics(genericsData.generics);
        setTotalResults(genericsData.total);
        setCurrentPage(genericsData.page || 1);
        setTotalPages(genericsData.totalPages || 1);
        setClasses(classesData);
      } catch (error) {
        console.error("Failed to fetch generics:", error);
        setWarning("Failed to load generics. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeSearch, searchQ, currentPage, typeFilter, classFilter, ratingFilter, letterFilter]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      setWarning("Search for a generic ingredient");
      setTimeout(() => setWarning(null), 3000);
      return;
    }
    setShowSuggestions(false);
    if (typeFilter || classFilter || ratingFilter || letterFilter) {
      const p = new URLSearchParams();
      p.set('search', query.trim());
      router.push(`/generics?${p.toString()}`);
    } else {
      setActiveSearch(query.trim());
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedType("");
    setSelectedClass("");
    setSelectedRating("");
    setActiveSearch("");
    setQuery("");
    router.push("/generics");
  };

  const canonicalUrl = (() => {
    const p = new URLSearchParams(searchParams.toString());
    const qs = p.toString();
    return `https://mednest.com.bd/generics${qs ? `?${qs}` : ''}`;
  })();

  return (
    <>
      <link rel="canonical" href={canonicalUrl} />
      <div className="bg-gradient-to-b from-[#c5e0db] via-[#d5e9e7] to-[#e5f2ef] py-6">
        <div className="max-w-[1024px] mx-auto px-3 sm:px-0">
          <div className="bg-white rounded-2xl border border-sky-200 shadow-[8px_16px_40px_rgba(0,0,0,0.15),0_20px_60px_-12px_rgba(0,0,0,0.25)] p-6 md:p-8">
            {/* Heading */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-navy tracking-tight">Generic Ingredients</h1>
              <p className="text-sm text-gray-500 mt-1">Browse active pharmaceutical ingredients available in Bangladesh</p>
            </div>

            {/* Warning */}
            {warning && (
              <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="font-semibold">{warning}</p>
              </div>
            )}

            {/* Search */}
            <form ref={searchRef} onSubmit={handleSearch} className="mb-6 max-w-4xl mx-auto relative">
              <div className="flex items-stretch rounded-full border-2 border-sky-200 bg-white focus-within:border-teal-400 focus-within:shadow-[0_0_0_4px_rgba(45,138,120,0.2)] transition-shadow duration-200 overflow-hidden">
                <div className="relative flex-1 min-w-0 flex items-center">
                  <svg className="absolute left-5 h-5 w-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.34-4.34M11 5a6 6 0 100 12 6 6 0 000-12z"/></svg>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        savedScrollY.current = window.scrollY;
                        const rect = searchRef.current?.getBoundingClientRect();
                        if (rect) window.scrollBy({ top: rect.top - 80, behavior: 'smooth' });
                      }
                    }}
                    onFocus={async () => {
                      interactedRef.current = true;
                      if (activeSearch || searchQ) return;
                      if (query.trim().length === 0) {
                        try {
                          const res = await fetch('/api/popular-generics');
                          const data = await res.json();
                          setSuggestions(data);
                          setShowSuggestions(data.length > 0);
                        } catch {}
                      }
                    }}
                    onBlur={() => {}}
                    placeholder="Search generic ingredients..."
                    className="w-full bg-transparent border-0 pl-14 pr-4 py-3 sm:py-3.5 text-sm sm:text-base outline-none text-gray-800 placeholder:text-gray-400"
                  />
                </div>
                <button type="submit" className="h-12 sm:h-14 shrink-0 px-5 sm:px-6 bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm sm:text-base transition-colors cursor-pointer flex items-center gap-2">
                  Search
                </button>
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {suggestions.map((s: any) => (
                    <Link
                      key={s.slug || s.name}
                      href={`/generics/${s.slug || s.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="w-full flex items-center gap-3 px-3 sm:px-5 py-2 sm:py-3 transition-colors text-left border-b border-gray-100 last:border-0 hover:bg-teal-100"
                    >
                      <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-teal-50 flex items-center justify-center shrink-0 border border-teal-100">
                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                          <span className="text-sm sm:text-base font-semibold text-gray-800 truncate min-w-0 max-w-[55%] sm:max-w-none">
                            {(() => {
                              const q = query.trim();
                              if (!q) return s.name;
                              const idx = s.name.toLowerCase().indexOf(q.toLowerCase());
                              if (idx === -1) return s.name;
                              return <>
                                {s.name.slice(0, idx)}
                                <span className="text-teal-700 font-bold">{s.name.slice(idx, idx + q.length)}</span>
                                {s.name.slice(idx + q.length)}
                              </>;
                            })()}
                          </span>
                          {s.medicineType && s.medicineType !== 'Allopathic' && (
                            <span className="inline-flex text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: ({
                                  Herbal: '#d1fae5', Homeopathic: '#ede9fe', Ayurvedic: '#fef3c7',
                                  Unani: '#ffe4e6', Veterinary: '#dbeafe', Supplement: '#ffedd5',
                                  Device: '#f3f4f6', PersonalCare: '#fce7f3', Vaccine: '#cffafe',
                                } as Record<string, string>)[String(s.medicineType)] || '#e2e8f0',
                                color: ({
                                  Herbal: '#065f46', Homeopathic: '#5b21b6', Ayurvedic: '#92400e',
                                  Unani: '#9f1239', Veterinary: '#1e40af', Supplement: '#9a3412',
                                  Device: '#374151', PersonalCare: '#9d174d', Vaccine: '#0e7490',
                                } as Record<string, string>)[String(s.medicineType)] || '#374151',
                              }}
                            >
                              {s.medicineType}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 font-medium truncate mt-0.5">
                          {s.therapeuticClass || 'Active Ingredient'} — {s.brandCount} brand{s.brandCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </form>

            {/* Filter Bar */}
            <div className="flex items-center gap-1.5 mb-5 flex-wrap sm:flex-nowrap justify-center">
              {[
                { value: selectedType, set: setSelectedType, param: "type", label: "Type", opts: [["allopathic","Pharma"],["herbal","Herbal"],["unani","Unani"],["homeopathic","Homeopathic"],["ayurvedic","Ayurvedic"]] },
                { value: selectedClass, set: setSelectedClass, param: "class", label: "Class", opts: classes.map((c: any) => [c.name, c.name.length > 24 ? c.name.slice(0, 23) + '…' : c.name]) },
              ].map((f: any) => {
                const isActive = !!f.value;
                return (
                  <div key={f.label} className="relative shrink-0" style={{ width: 'calc(50% - 6px)', maxWidth: '120px' }}>
                    <select
                      value={f.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        f.set(val);
                        setCurrentPage(1);
                        const p = new URLSearchParams();
                        const s = activeSearch || searchQ;
                        if (s) p.set('search', s);
                        if (f.param === 'type' ? val : selectedType) p.set('type', f.param === 'type' ? val : selectedType);
                        if (f.param === 'class' ? val : selectedClass) p.set('class', f.param === 'class' ? val : selectedClass);
                        if (selectedRating) p.set('rating', selectedRating);
                        if (letterFilter) p.set('letter', letterFilter);
                        const qs = p.toString();
                        router.push(qs ? `/generics?${qs}` : '/generics');
                      }}
                      className={`appearance-none rounded-full px-3 py-1.5 pr-4 text-xs font-semibold w-full text-center shadow-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-300 border-2 [&>option]:cursor-pointer ${
                        isActive
                          ? 'bg-teal-500 text-white border-teal-500'
                          : 'bg-gray-50 text-gray-700 border-sky-200 hover:border-teal-400 hover:bg-teal-50'
                      }`}
                    >
                      <option value="" hidden>{f.label}</option>
                      {f.opts.map(([val, display]: string[]) => <option key={val} value={val}>{display}</option>)}
                    </select>
                    <svg className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${isActive ? 'text-white' : 'text-gray-500'}`} width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                );
              })}

              {/* Rating filter */}
              <div className="relative shrink-0">
                <select
                  value={selectedRating}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedRating(val);
                    setCurrentPage(1);
                    const p = new URLSearchParams();
                    const s = activeSearch || searchQ;
                    if (s) p.set('search', s);
                    if (selectedType) p.set('type', selectedType);
                    if (selectedClass) p.set('class', selectedClass);
                    if (val) p.set('rating', val);
                    if (letterFilter) p.set('letter', letterFilter);
                    router.push(p.toString() ? `/generics?${p.toString()}` : '/generics');
                  }}
                  className={`appearance-none rounded-full px-3 py-1.5 pr-4 text-xs font-semibold text-center shadow-sm border-2 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-300 [&>option]:cursor-pointer ${
                    selectedRating ? 'bg-teal-500 text-white border-teal-500' : 'bg-gray-50 text-gray-700 border-sky-200 hover:border-teal-400 hover:bg-teal-50'
                  }`}
                >
                  <option value="" hidden>Rating</option>
                  {[9, 8, 7, 6, 5, 4, 3, 2, 1].map(r => (
                    <option key={r} value={r}>{r}★ & up</option>
                  ))}
                </select>
                <svg className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${selectedRating ? 'text-white' : 'text-gray-500'}`} width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>

            {/* A-Z Browse */}
            <div className="mb-6">
              <AZBrowse showTabs={false} />
            </div>

            {/* Results */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
              </div>
            ) : generics.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg font-semibold">
                  No generics found{[typeFilter, classFilter, ...(selectedRating ? [`${selectedRating}★`] : []), ...(activeSearch || searchQ ? [`"${activeSearch || searchQ}"`] : []), ...(letterFilter ? [letterFilter] : [])].filter(Boolean).length > 0 && (
                    <> for <span className="text-teal-600">{[typeFilter, classFilter, ...(selectedRating ? [`${selectedRating}★`] : []), ...(activeSearch || searchQ ? [`"${activeSearch || searchQ}"`] : []), ...(letterFilter ? [letterFilter] : [])].filter(Boolean).join(', ')}</span></>
                  )}
                </p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search term</p>
                {isFiltered && (
                  <button onClick={clearFilters} className="mt-4 px-4 py-2 text-sm font-bold text-teal-600 bg-teal-50 rounded-full hover:bg-teal-100 transition-colors cursor-pointer">Clear all filters</button>
                )}
              </div>
            ) : (
              <div>
                {/* Results heading */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-navy">
                    {(() => {
                      const allFilters = [
                        ...(activeSearch || searchQ ? [`"${activeSearch || searchQ}"`] : []),
                        ...(typeFilter ? [typeFilter] : []),
                        ...(classFilter ? [classFilter] : []),
                        ...(selectedRating ? [`${selectedRating}★`] : []),
                        ...(letterFilter ? [letterFilter] : []),
                      ].filter(Boolean);
                      return allFilters.length > 0
                        ? <>Showing <span className="text-teal-600">{animatedCount}</span> results for <span className="text-teal-600">{allFilters.join(', ')}</span></>
                        : <>Most Popular Generic Ingredients</>;
                    })()}
                  </h2>
                  {isFiltered && (
                    <button onClick={clearFilters} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 hover:text-red-600 hover:border-red-300 active:scale-95 transition-colors duration-150 cursor-pointer align-middle shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      Clear
                    </button>
                  )}
                </div>

                {/* Generic cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                  {generics.map((g) => (
                    <GenericCard key={g.id} generic={g} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10 mb-4">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage <= 1}
                      className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
                    >Prev</button>
                    {(() => {
                      const pages: (number | string)[] = [];
                      for (let i = 1; i <= totalPages; i++) {
                        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                          pages.push(i);
                        } else if (pages[pages.length - 1] !== '...') {
                          pages.push('...');
                        }
                      }
                      return pages.map((p, idx) =>
                        p === '...' ? (
                          <span key={`e${idx}`} className="px-1 text-gray-400 text-sm">...</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setCurrentPage(p as number)}
                            className={`w-8 h-8 text-sm font-semibold rounded-lg cursor-pointer ${p === currentPage ? 'bg-teal-500 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}
                          >{p}</button>
                        )
                      );
                    })()}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage >= totalPages}
                      className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
                    >Next</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function GenericsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[1024px] mx-auto py-20 text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
      </div>
    }>
      <GenericsContent />
    </Suspense>
  );
}
