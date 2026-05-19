"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { drugService } from "@/lib/services/drugService";
import ClassCard from "@/components/drugs/ClassCard";
import AZBrowse from "@/components/drugs/AZBrowse";
import Link from "next/link";

function ClassContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const searchQ = searchParams.get("search") || "";
  const typeFilter = searchParams.get("type") || "";
  const classFilter = searchParams.get("drug_class") || "";
  const ratingFilter = searchParams.get("rating") || "";
  const letterFilter = searchParams.get("letter") || "";

  const [classes, setClasses] = useState<{ name: string; brandCount: number; genericCount: number; avgRating: number }[]>([]);
  const [classNames, setClassNames] = useState<string[]>([]);
  const [query, setQuery] = useState(searchQ);
  const [activeSearch, setActiveSearch] = useState("");

  const [selectedType, setSelectedType] = useState(typeFilter);
  const [selectedClass, setSelectedClass] = useState(classFilter);
  const [selectedRating, setSelectedRating] = useState(ratingFilter);

  useEffect(() => {
    setSelectedType(typeFilter);
    setSelectedClass(classFilter);
    setSelectedRating(ratingFilter);
    setCurrentPage(1);
  }, [typeFilter, classFilter, ratingFilter, letterFilter]);

  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Suggestion state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const interactedRef = useRef(false);
  const [animatedCount, setAnimatedCount] = useState(0);
  const countAnimRef = useRef(0);
  const firstLoad = useRef(true);

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
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!data.results) return;
        const classResults = data.results.filter((r: any) => r.type === 'class' || r.type === 'generic');
        setSuggestions(classResults.slice(0, 8));
        setShowSuggestions(classResults.length > 0);
      } catch {}
    }, 150);
    return () => clearTimeout(timer);
  }, [query, activeSearch, searchQ]);

  const isFiltered = !!(activeSearch || searchQ || typeFilter || classFilter || ratingFilter || letterFilter);

  // Fetch classes data
  useEffect(() => {
    async function fetchData() {
      const isFirst = firstLoad.current;
      if (isFirst) setLoading(true);
      firstLoad.current = false;
      try {
        const [classesData, classList] = await Promise.all([
          drugService.getClasses({
            page: currentPage,
            limit: 24,
            search: (activeSearch || searchQ) || undefined,
            medicine_type: typeFilter || undefined,
            drug_class: classFilter || undefined,
            letter: letterFilter || undefined,
          }),
          drugService.getDrugClasses(),
        ]);

        let filtered = classesData.classes;
        setTotalResults(classesData.total);
        setCurrentPage(classesData.page || 1);
        setTotalPages(classesData.totalPages || 1);
        
        if (ratingFilter) {
          const minRating = parseInt(ratingFilter);
          filtered = filtered.filter((c) => c.avgRating >= minRating);
        }

        if (searchQ && !activeSearch) {
          const q = searchQ.trim().toLowerCase();
          filtered = filtered.filter((c) => c.name.toLowerCase().includes(q));
        }

        setClasses(filtered);
        setClassNames(classList.map((c: any) => c.name).filter(Boolean).sort());
      } catch (error) {
        console.error("Failed to fetch classes:", error);
        setWarning("Failed to load drug classes. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeSearch, searchQ, currentPage, typeFilter, classFilter, ratingFilter, letterFilter]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      setWarning("Search for a drug class");
      setTimeout(() => setWarning(null), 3000);
      return;
    }
    if (typeFilter || classFilter || ratingFilter || letterFilter) {
      const p = new URLSearchParams();
      p.set('search', query.trim());
      router.push(`/class?${p.toString()}`);
    } else {
      setActiveSearch(query.trim());
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setQuery("");
    setActiveSearch("");
    setCurrentPage(1);
    setSelectedType("");
    setSelectedClass("");
    setSelectedRating("");
    router.push("/class");
  };

  const canonicalUrl = (() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete('page');
    const qs = p.toString();
    return `https://mednest.com.bd/class${qs ? `?${qs}` : ''}`;
  })();

  return (
    <>
      <link rel="canonical" href={canonicalUrl} />
      <div className="bg-gradient-to-b from-[#c5e0db] via-[#d5e9e7] to-[#e5f2ef] py-6">
      <div className="max-w-[1024px] mx-auto px-3 sm:px-0">
        <div className="bg-white rounded-2xl border border-sky-200 shadow-[8px_16px_40px_rgba(0,0,0,0.15),0_20px_60px_-12px_rgba(0,0,0,0.25)] p-6 md:p-8">
          <header className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-1">Browse Drug Classes</h1>
            <p className="text-sm text-gray-500">
              Browse medications organized by therapeutic classification.
            </p>
          </header>

          {warning && (
            <div className="flex items-center gap-2 p-4 mb-6 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
              <AlertCircle className="h-5 w-5" />
              <p className="font-semibold">{warning}</p>
            </div>
          )}

          {/* Search */}
          <form ref={searchRef} onSubmit={(e) => handleSearch(e)} className="mb-6 max-w-4xl mx-auto relative">
            <div className="flex items-stretch rounded-full border-2 border-sky-200 bg-white focus-within:border-teal-400 focus-within:shadow-[0_0_0_4px_rgba(45,138,120,0.2)] transition-shadow duration-200 overflow-hidden">
              <div className="relative flex-1 min-w-0 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-5 h-5 w-5 text-gray-400 shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (searchQ) router.replace('/class');
                    else if (activeSearch) setActiveSearch("");
                  }}
                  onFocus={() => { if (!activeSearch && !searchQ) { setShowSuggestions(true); } }}
                  placeholder="Search drug classes..."
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
                    key={s.slug || s.brandName}
                    href={s.type === 'generic' ? `/generics/${s.slug}` : `/class?name=${encodeURIComponent(s.brandName || s.genericName || s.name)}`}
                    className="w-full flex items-center gap-3 px-3 sm:px-5 py-2 sm:py-3 transition-colors text-left border-b border-gray-100 last:border-0 hover:bg-teal-100"
                    onClick={() => setShowSuggestions(false)}
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-50 flex items-center justify-center shrink-0 border border-teal-100">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm sm:text-base font-semibold text-gray-800 truncate block">
                        {s.brandName || s.name}
                      </span>
                      <span className="text-xs text-gray-500">{s.type === 'generic' ? 'Generic Ingredient' : 'Drug Class'}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </form>

          {/* Filters */}
          <div className="flex items-center gap-1.5 mb-5 flex-wrap sm:flex-nowrap justify-center">
            {[
              { value: selectedType, set: setSelectedType, param: "type", label: "Type", opts: [["allopathic","Pharma"],["herbal","Herbal"],["unani","Unani"],["homeopathic","Homeopathic"],["ayurvedic","Ayurvedic"]] },
              { value: selectedClass, set: setSelectedClass, param: "drug_class", label: "Class", opts: classNames.map((c: string) => [c, c.length > 24 ? c.slice(0, 23) + '…' : c]) },
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
                      if (f.param === 'drug_class' ? val : selectedClass) p.set('drug_class', f.param === 'drug_class' ? val : selectedClass);
                      if (selectedRating) p.set('rating', selectedRating);
                      const qs = p.toString();
                      router.push(qs ? `/class?${qs}` : '/class');
                    }}
                    className={`appearance-none rounded-full px-3 py-1.5 pr-4 text-xs font-semibold w-full text-center shadow-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-300 border-2 [&>option]:cursor-pointer ${
                      isActive
                        ? 'bg-teal-500 text-white border-teal-500'
                        : 'bg-gray-50 text-gray-700 border-sky-200 hover:border-teal-400 hover:bg-teal-50'
                    }`}
                  >
                    <option value="" hidden>{f.label}</option>
                    {f.opts.map(([val, display]: string[]) => <option key={val} value={val} title={display}>{display}</option>)}
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
                  if (selectedClass) p.set('drug_class', selectedClass);
                  if (val) p.set('rating', val);
                  router.push(p.toString() ? `/class?${p.toString()}` : '/class');
                }}
                className={`appearance-none rounded-full px-3 py-1.5 pr-4 text-xs font-semibold text-center shadow-sm border-2 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-300 [&>option]:cursor-pointer ${
                  selectedRating ? 'bg-teal-500 text-white border-teal-500' : 'bg-gray-50 text-gray-700 border-sky-200 hover:border-teal-400 hover:bg-teal-50'
                }`}
              >
                <option value="" hidden>Rating</option>
                {[5, 4, 3, 2, 1].map(r => (
                  <option key={r} value={r}>{r}★ & up</option>
                ))}
              </select>
              <svg className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${selectedRating ? 'text-white' : 'text-gray-500'}`} width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>

          {!searchQ && !isFiltered && <AZBrowse showTabs={false} simple />}

          {/* Results */}
          <div className="mt-8">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                    <div className="h-5 bg-gray-200 rounded-full w-2/3 mb-4" />
                    <div className="flex gap-3 mb-3">
                      <div className="h-8 bg-gray-100 rounded-lg w-24" />
                      <div className="h-8 bg-gray-100 rounded-lg w-24" />
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full w-1/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-6 flex-wrap">
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
                        ? <>Showing <span className="text-teal-600">{animatedCount}</span> classes for <span className="text-teal-600">{allFilters.join(', ')}</span></>
                        : <>All Drug Classes</>;
                    })()}
                  </h2>
                  {isFiltered && (
                    <button onClick={clearFilters} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 hover:text-red-600 hover:border-red-300 active:scale-95 transition-colors duration-150 cursor-pointer align-middle shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      Clear
                    </button>
                  )}
                </div>

                {classes.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-gray-400 text-lg font-semibold">
                      No classes found{[typeFilter, classFilter, ...(selectedRating ? [`${selectedRating}★`] : []), ...(activeSearch || searchQ ? [`"${activeSearch || searchQ}"`] : []), ...(letterFilter ? [letterFilter] : [])].filter(Boolean).length > 0 && (
                        <> for <span className="text-teal-600">{[typeFilter, classFilter, ...(selectedRating ? [`${selectedRating}★`] : []), ...(activeSearch || searchQ ? [`"${activeSearch || searchQ}"`] : []), ...(letterFilter ? [letterFilter] : [])].filter(Boolean).join(', ')}</span></>
                      )}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search term</p>
                    {isFiltered && (
                      <button onClick={clearFilters} className="mt-4 px-4 py-2 text-sm font-bold text-teal-600 bg-teal-50 rounded-full hover:bg-teal-100 transition-colors cursor-pointer">Clear all filters</button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map((c) => (
                      <ClassCard key={c.name} name={c.name} brandCount={c.brandCount} genericCount={c.genericCount} avgRating={c.avgRating} />
                    ))}
                  </div>
                )}

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
      </div>
    </>
  );
}

export default function ClassPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[1024px] mx-auto py-20 text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
      </div>
    }>
      <ClassContent />
    </Suspense>
  );
}
