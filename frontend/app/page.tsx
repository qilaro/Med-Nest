"use client";

import { useState, useEffect, useRef, lazy, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AZBrowse from "@/components/drugs/AZBrowse";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchSuggestions } from "@/components/drugs/SearchSuggestions";
import { drugService } from "@/lib/services/drugService";
import { DrugSummary } from "@/types/drug";

function CountUp({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || value === 0) return;
    started.current = true;
    const start = performance.now();
    const raf = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setDisplay(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [value, duration]);

  return <>{value === 0 ? 0 : display.toLocaleString()}</>;
}

const FeaturesCarousel = lazy(() => import("@/components/sections/FeaturesCarousel").then(m => ({ default: m.FeaturesCarousel })));
const HealthNews = lazy(() => import("@/components/sections/HealthNews").then(m => ({ default: m.HealthNews })));
const AiAssistantCTA = lazy(() => import("@/components/sections/AiAssistantCTA").then(m => ({ default: m.AiAssistantCTA })));

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<DrugSummary[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTotal, setSearchTotal] = useState(0);
  const [stats, setStats] = useState({ drugs: 0, generics: 0, classes: 0, companies: 0 });
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const interactedRef = useRef(false);
  const savedScrollY = useRef(0);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, []);

  // Handle search input changes with fuzzy search
  useEffect(() => {
    if (query.trim().length === 0) {
      if (interactedRef.current) {
        fetch('/api/popular').then(r => r.json()).then(data => {
          setSuggestions((data.results || []).slice(0, 5));
          setSearchTotal(0);
          setShowSuggestions(true);
        }).catch(() => {});
      }
      return;
    }

    const fetchFuzzySuggestions = async () => {
      try {
        setIsSearching(true);
        const { results, total } = await drugService.searchDrugs(query.trim());
        setSuggestions(results.slice(0, 10));
        setSearchTotal(total);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Failed to fetch fuzzy suggestions:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchFuzzySuggestions, 300);
    debounceRef.current = timer;
    return () => { clearTimeout(timer); debounceRef.current = null; };
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      setSuggestions([]);
      setSearchTotal(0);
      setIsSearching(false);
      if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null; }
      fetch('/api/search/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: query.trim() }) }).catch(() => {});
      router.push(`/drugs?search=${encodeURIComponent(query)}`);
    }
  };

  const handleSuggestionSelect = (drug: DrugSummary) => {
    fetch('/api/search/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: drug.brandName }) }).catch(() => {});
    setQuery(drug.brandName);
    setShowSuggestions(false);
    if (drug.type === 'generic') router.push(`/generics/${drug.slug}`);
    else if (drug.type === 'class') router.push(`/class?name=${encodeURIComponent(drug.brandName)}`);
    else router.push(`/drugs/${drug.slug}`);
  };

  const handleFocus = async () => {
    interactedRef.current = true;
    if (query.trim().length === 0) {
      try {
        setIsSearching(true);
        const res = await fetch('/api/popular');
        const data = await res.json();
        setSuggestions((data.results || []).slice(0, 5));
        setShowSuggestions(true);
      } catch (error) {
        console.error("Failed to fetch featured suggestions:", error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-b from-[#c5e0db] via-[#d5e9e7] to-[#e5f2ef]">
      {/* Hero Section */}
      <section className="py-6">
        <div className="mx-auto max-w-[1024px] px-3 sm:px-0">
          <div className="bg-white rounded-2xl border border-sky-200 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] p-3 sm:p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-full max-w-3xl sm:px-0">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/65 border border-gray-300 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm -mt-1 mb-1.5 text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" aria-hidden="true">
                  <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                </svg>
                <span className="hidden sm:inline">Trusted by millions of patients & caregivers</span>
                <span className="sm:hidden">Trusted by millions</span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-4xl md:text-6xl font-bold mb-1 sm:mb-3 leading-tight text-gray-900 whitespace-nowrap">
                Learn more. <span style={{ color: 'var(--primary)' }}>Live better.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base md:text-xl text-gray-700 mb-3 sm:mb-5 max-w-2xl mx-auto font-normal px-2 sm:px-0">
                Most comprehensive source for drug information you can trust in Bangladesh.
              </p>

              {/* Search Bar */}
              <form ref={searchRef} onSubmit={handleSearchSubmit} className="max-w-4xl mx-auto mb-6 relative">
                <div className="flex items-stretch bg-white rounded-full border-2 border-sky-200 focus-within:border-teal-400 focus-within:shadow-[0_0_0_4px_rgba(45,138,120,0.2)] transition-shadow duration-200 overflow-hidden">
                  <div className="relative flex items-center flex-1 min-w-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-5 h-5 w-5 text-gray-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <Input 
                      type="text" 
                      value={query}
                      onChange={(e) => { setQuery(e.target.value); interactedRef.current = true; }}
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          savedScrollY.current = window.scrollY;
                          const rect = searchRef.current?.getBoundingClientRect();
                          if (rect) window.scrollBy({ top: rect.top - 80, behavior: 'smooth' });
                        }
                      }}
                      onFocus={handleFocus}
                      onBlur={() => { if (!query.trim()) setShowSuggestions(false); }}
                      placeholder="Search your drugs here" 
                      className="pl-12 h-12 sm:h-14 text-sm sm:text-base border-none shadow-none focus-visible:ring-0 rounded-full bg-transparent" 
                    />
                  </div>
                  <button type="submit" className="h-12 sm:h-14 shrink-0 px-5 sm:px-6 bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm sm:text-base transition-colors cursor-pointer flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    <span className="hidden sm:inline">Search</span>
                  </button>
                </div>
                <SearchSuggestions 
                  suggestions={suggestions} 
                  isVisible={showSuggestions} 
                  onSelect={handleSuggestionSelect} 
                  isFeatured={query.trim().length === 0}
                  query={query}
                  isLoading={isSearching}
                  total={searchTotal}
                />
              </form>

              {/* Trending Searches */}
              <div className="text-sm sm:text-base text-gray-600 mb-8 sm:mb-12 px-2 sm:px-0 flex flex-wrap justify-center gap-x-1.5 sm:gap-x-2">
                <span className="font-semibold text-gray-800 shrink-0">Trending:</span>
                {['Napa', 'Ace', 'Seclo', 'Sergel', 'Fexo', 'Monas', 'Orsaline-N'].map((term) => (
                  <Link key={term} href={`/drugs?search=${term}`} className="hover:text-primary transition-colors underline decoration-gray-400 decoration-dotted underline-offset-4 font-medium leading-relaxed">
                    {term}
                  </Link>
                ))}
              </div>

              {/* AZBrowse */}
              <div className="max-w-4xl mx-auto">
                <AZBrowse />
                <p className="text-xs sm:text-sm text-gray-700 font-semibold italic mt-2 sm:mt-0">
                  Can't remember? Just type what you can remember with our phonetic search.
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-6 sm:py-8">
        <div className="mx-auto max-w-[1024px] px-3 sm:px-0">
          <div className="bg-white rounded-2xl border border-sky-200 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] p-6 sm:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
              {[
                { label: 'Drugs Listed', value: stats.drugs },
                { label: 'Generics', value: stats.generics },
                { label: 'Drug Classes', value: stats.classes },
                { label: 'Companies', value: stats.companies },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl sm:text-3xl font-bold text-primary"><CountUp value={stat.value} /></div>
                  <div className="text-gray-600 text-xs sm:text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Carousel Section */}
      <Suspense fallback={<div className="h-40 sm:h-80" />}><FeaturesCarousel /></Suspense>

      {/* Latest Health News Section */}
      <Suspense fallback={<div className="h-40" />}><HealthNews /></Suspense>

      {/* AI Assistant CTA Section */}
      <Suspense fallback={<div className="h-40" />}><AiAssistantCTA /></Suspense>
    </div>
  );
}
