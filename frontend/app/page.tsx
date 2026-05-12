"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FeaturesCarousel } from "@/components/sections/FeaturesCarousel";
import { HealthNews } from "@/components/sections/HealthNews";
import { AiAssistantCTA } from "@/components/sections/AiAssistantCTA";
import AZBrowse from "@/components/drugs/AZBrowse";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchSuggestions } from "@/components/drugs/SearchSuggestions";
import { drugService } from "@/lib/services/drugService";
import { DrugSummary } from "@/types/drug";

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

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search input changes with fuzzy search
  useEffect(() => {
    if (query.trim().length === 0) {
      setShowSuggestions(false);
      setSearchTotal(0);
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
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="py-2 sm:py-4 text-gray-900">
        {/* Outer Container with Mint Background */}
        <div 
        className="container-medq relative z-10 mx-auto p-4 sm:p-6" 
        style={{ 
          backgroundColor: '#D5E9E7', 
          borderRadius: 'clamp(1rem, 4vw, 2rem)', 
          maxWidth: '80rem',
          boxShadow: '20px 50px 80px -20px rgba(0, 0, 0, 0.25), 10px 30px 40px -15px rgba(0, 0, 0, 0.15)'
        }}
        >
          {/* Glass Hero Box */}
          <div
            className="relative flex flex-col items-center justify-center text-center p-4 sm:p-6 pt-4 sm:pt-4 pb-8 sm:pb-8"
            style={{
              borderRadius: 'clamp(1rem, 3vw, 1.5rem)',
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(180, 210, 225, 0.6)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
            }}
          >
            <div className="relative w-full max-w-3xl text-center px-2 sm:px-0">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/65 border border-gray-300 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm mb-2 mt-1 text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" aria-hidden="true">
                  <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                </svg>
                <span className="hidden sm:inline">Trusted by millions of patients & caregivers</span>
                <span className="sm:hidden">Trusted by millions</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-3 leading-tight text-gray-900">
                Learn more. <span style={{ color: 'var(--primary)' }}>Live better.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base md:text-xl text-gray-700 mb-5 max-w-2xl mx-auto font-normal px-2 sm:px-0">
                Your comprehensive source for drug information you can trust.
              </p>

              {/* Search Bar */}
              <form ref={searchRef} onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-4 relative px-0">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:bg-white sm:rounded-2xl sm:py-1.5 sm:pl-1.5 sm:pr-4 sm:shadow-sm sm:border-2 sm:border-sky-200">
                  <div className="relative flex items-center flex-1 bg-white rounded-2xl sm:rounded-none border-2 sm:border-0 border-sky-200 sm:shadow-none focus-within:shadow-[0_0_0_3px_rgba(45,138,120,0.3)] transition-shadow duration-200">
                    <img src="/icons/pill.svg" alt="search" className="absolute left-4 h-7 w-7 sm:h-9 sm:w-9" />
                    <Input 
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={handleFocus}
                      placeholder="Search drugs, ingredients, conditions..." 
                      className="pl-12 sm:pl-16 h-12 sm:h-14 text-sm sm:text-base border-none shadow-none focus-visible:ring-0 rounded-2xl sm:rounded-none" 
                    />
                  </div>
                  <Button type="submit" className="h-12 sm:h-14 w-full sm:w-auto sm:px-8 rounded-2xl sm:rounded-xl font-semibold text-sm sm:text-base cursor-pointer transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: 'var(--primary)' }}>
                    Search
                  </Button>
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
              <div className="text-sm sm:text-base text-gray-600 mb-8 sm:mb-12 px-2 sm:px-0 text-center">
                <span className="font-semibold text-gray-800">Trending: </span>
                {['Napa', 'Ace', 'Seclo', 'Sergel', 'Fexo', 'Monas', 'Orsaline-N'].map((term) => (
                  <Link key={term} href={`/drugs?search=${term}`} className="inline-block hover:text-primary transition-colors underline decoration-gray-400 decoration-dotted underline-offset-4 font-medium mx-1 sm:mx-1.5 leading-relaxed">
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
      </section>

      {/* Stats Section */}
      <section className="py-2 sm:py-3 relative bg-gray-50 mt-6 sm:mt-10">
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, var(--primary) 0%, transparent 50%, var(--primary) 100%)' }}></div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, var(--primary) 0%, transparent 50%, var(--primary) 100%)' }}></div>
        <div className="container-medq px-3 sm:px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            {[
              { label: 'Drugs Listed', value: stats.drugs.toLocaleString() },
              { label: 'Generics', value: stats.generics.toLocaleString() },
              { label: 'Drug Classes', value: stats.classes.toLocaleString() },
              { label: 'Companies', value: stats.companies.toLocaleString() },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-gray-600 text-xs sm:text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Carousel Section */}
      <FeaturesCarousel />

      {/* Latest Health News Section */}
      <HealthNews />

      {/* AI Assistant CTA Section */}
      <AiAssistantCTA />
    </div>
  );
}
