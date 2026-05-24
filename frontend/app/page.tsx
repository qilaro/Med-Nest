"use client";

import { useState, useEffect, useRef, lazy, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { SearchSuggestions } from "@/components/drugs/SearchSuggestions";
import { drugService } from "@/lib/services/drugService";
import { DrugSummary } from "@/types/drug";
const AZBrowse = lazy(() => import("@/components/drugs/AZBrowse"));

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

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </div>
  );
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
  const searchCache = useRef<Map<string, { results: DrugSummary[]; total: number }>>(new Map());

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

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

    const cached = searchCache.current.get(query.trim().toLowerCase());
    if (cached) {
      setSuggestions(cached.results.slice(0, 10));
      setSearchTotal(cached.total);
      setShowSuggestions(true);
    }

    const fetchFuzzySuggestions = async () => {
      try {
        const { results, total } = await drugService.searchDrugs(query.trim());
        searchCache.current.set(query.trim().toLowerCase(), { results, total });
        if (searchCache.current.size > 50) {
          const first = searchCache.current.keys().next().value;
          if (first) searchCache.current.delete(first);
        }
        setSuggestions(results.slice(0, 10));
        setSearchTotal(total);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Failed to fetch fuzzy suggestions:", error);
      }
    };

    const timer = setTimeout(fetchFuzzySuggestions, 100);
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

  const handleFocus = async () => {
    interactedRef.current = true;
    if (window.innerWidth < 1024) {
      savedScrollY.current = window.scrollY;
      const rect = searchRef.current?.getBoundingClientRect();
      if (rect) window.scrollBy({ top: rect.top - 80, behavior: 'smooth' });
    }
    if (query.trim().length === 0) {
      try {
        setIsSearching(true);
        const res = await fetch('/api/popular');
        const data = await res.json();
        setSuggestions((data.results || []).slice(0, 5));
        setShowSuggestions(true);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setShowSuggestions(true);
    }
  };

  const benefits = [
    { title: "Complete Drug Database", desc: "32,000+ DGDA verified medicines with pricing, ratings, and complete medical information from trusted sources across Bangladesh.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { title: "Verified Pricing", desc: "Real-time prices from MedEx, Arogga, and MedEasy — updated daily so you always know the cost.", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { title: "AI-Powered Help", desc: "Get instant answers about your medications in Bengali or English — powered by Google Gemini.", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  ];

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-b from-[#c5e0db] via-[#d5e9e7] to-[#e5f2ef]">
      {/* Hero Section */}
      <section className="py-6">
        <div className="mx-auto max-w-[1024px] px-3 sm:px-0">
          <div className="bg-white rounded-2xl border border-sky-200 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] p-3 sm:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50/40 via-white to-emerald-50/20 animate-hero-gradient pointer-events-none" />
            <div className="relative flex flex-col items-center justify-center text-center">
              <div className="w-full max-w-3xl sm:px-0">
              <div className="inline-flex items-center gap-2 bg-white/80 border border-teal-200/60 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm -mt-1 mb-1.5 text-teal-800 shadow-sm">
                <svg className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>
                <span className="hidden sm:inline">Trusted by millions of patients & caregivers</span>
                <span className="sm:hidden">Trusted by millions</span>
              </div>

              <h1 className="text-xl sm:text-4xl md:text-6xl font-bold mb-1 sm:mb-3 leading-tight whitespace-nowrap">
                <span className="text-gray-900">Learn more.</span>{' '}
                <span className="bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">Live better.</span>
              </h1>

              <p className="text-sm sm:text-base md:text-xl text-gray-700 mb-3 sm:mb-5 max-w-2xl mx-auto font-normal px-2 sm:px-0">
                Most comprehensive source for drug information you can trust in Bangladesh.
              </p>

              <form ref={searchRef} onSubmit={handleSearchSubmit} className="max-w-4xl mx-auto mb-6 relative">
                <div className="flex items-stretch bg-white rounded-full border-2 border-sky-200 focus-within:border-teal-400 focus-within:shadow-[0_0_0_4px_rgba(45,138,120,0.2)] transition-all duration-200 overflow-hidden">
                  <div className="relative flex items-center flex-1 min-w-0">
                    <svg className="absolute left-5 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
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
                      onBlur={(e) => { if (!query.trim() && !searchRef.current?.contains(e.relatedTarget as Node)) setShowSuggestions(false); }}
                      placeholder="Search your drugs here" 
                      className="pl-12 h-12 sm:h-14 text-sm sm:text-base border-none shadow-none focus-visible:ring-0 rounded-full bg-transparent" 
                    />
                  </div>
                  <button type="submit" className="h-12 sm:h-14 shrink-0 px-5 sm:px-6 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold text-sm sm:text-base transition-all duration-200 cursor-pointer flex items-center gap-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    <span className="hidden sm:inline">Search</span>
                  </button>
                </div>
                <SearchSuggestions 
                  suggestions={suggestions} 
                  isVisible={showSuggestions} 
                  isFeatured={query.trim().length === 0}
                  query={query}
                  isLoading={isSearching}
                  total={searchTotal}
                />
              </form>

              <div className="text-sm sm:text-base text-gray-600 mb-8 sm:mb-12 px-2 sm:px-0 flex flex-wrap justify-center gap-x-1.5 sm:gap-x-2">
                <span className="font-semibold text-gray-800 shrink-0">Trending:</span>
                {['Napa', 'Ace', 'Seclo', 'Sergel', 'Fexo', 'Monas', 'Orsaline-N'].map((term) => (
                  <Link key={term} href={`/drugs?search=${term}`} className="hover:text-teal-600 transition-colors underline decoration-gray-400 decoration-dotted underline-offset-4 font-medium leading-relaxed">
                    {term}
                  </Link>
                ))}
              </div>

              <div className="max-w-4xl mx-auto">
                <Suspense fallback={<div className="h-8 w-full bg-gray-100 rounded-lg animate-pulse" />}>
                  <AZBrowse />
                </Suspense>
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
      <AnimatedSection>
        <section className="py-6 sm:py-8">
          <div className="mx-auto max-w-[1024px] px-3 sm:px-0">
            <div className="bg-white rounded-2xl border border-sky-200 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] p-6 sm:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { label: 'Drugs Listed', value: stats.drugs, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
                  { label: 'Generics', value: stats.generics, icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
                  { label: 'Drug Classes', value: stats.classes, icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
                  { label: 'Companies', value: stats.companies, icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-teal-200 hover:shadow-sm transition-all">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={stat.icon}/></svg>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900"><CountUp value={stat.value} /></div>
                    <div className="text-gray-500 text-xs sm:text-sm font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>



      {/* Why Med-Nest */}
      <AnimatedSection>
        <section className="py-6 sm:py-8">
          <div className="mx-auto max-w-[1024px] px-3 sm:px-0">
            <div className="bg-white rounded-2xl border border-sky-200 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] p-6 sm:p-8">
              <div className="h-1 w-16 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full mb-6 mx-auto" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">Why Med-Nest?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-8 sm:mb-10">
                {benefits.map((benefit, i) => (
                  <div key={i} className="group p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-teal-200 hover:shadow-[0_8px_25px_-8px_rgba(0,0,0,0.08)] transition-all duration-200">
                    <div className="w-11 h-11 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-100 group-hover:scale-105 transition-all mb-4">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={benefit.icon}/></svg>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Features Carousel Section */}
      <AnimatedSection>
        <Suspense fallback={<div className="h-40 sm:h-80" />}><FeaturesCarousel /></Suspense>
      </AnimatedSection>

      {/* Latest Health News Section */}
      <AnimatedSection>
        <Suspense fallback={<div className="h-40" />}><HealthNews /></Suspense>
      </AnimatedSection>

      {/* AI Assistant CTA Section */}
      <Suspense fallback={<div className="h-40" />}><AiAssistantCTA /></Suspense>

      {/* Back to top */}
      <BackToTop />
    </div>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-900/30 flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Back to top"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m18 15-6-6-6 6"/>
      </svg>
    </button>
  );
}
