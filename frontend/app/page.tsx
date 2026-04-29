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
  const searchRef = useRef<HTMLFormElement>(null);

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
      return;
    }

    const fetchFuzzySuggestions = async () => {
      try {
        const { results } = await drugService.searchDrugs(query);
        setSuggestions(results.slice(0, 10));
        setShowSuggestions(true);
      } catch (error) {
        console.error("Failed to fetch fuzzy suggestions:", error);
      }
    };

    const timer = setTimeout(fetchFuzzySuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/drugs?search=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (drug: DrugSummary) => {
    setQuery(drug.brandName);
    setShowSuggestions(false);
    router.push(`/drugs/${drug.slug}`);
  };

  const handleFocus = async () => {
    if (query.trim().length === 0) {
      try {
        const { drugs } = await drugService.getDrugs();
        setSuggestions(drugs.slice(0, 5));
        setShowSuggestions(true);
      } catch (error) {
        console.error("Failed to fetch featured suggestions:", error);
      }
    } else {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* Hero Section */}
      <section className="py-4 text-gray-900 bg-white">
        {/* Outer Container with Mint Background and Symmetric 24px Padding */}
        <div 
          className="container-medq relative overflow-hidden mx-auto" 
          style={{ 
            backgroundColor: '#D5E9E7', 
            borderRadius: '2rem', 
            maxWidth: '80rem',
            padding: '24px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Glass Hero Box - Symmetric 24px padding with soft highlight border */}
          <div
            className="relative overflow-hidden flex flex-col items-center justify-center text-center"
            style={{
              padding: '24px',
              borderRadius: '2rem',
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(180, 210, 225, 0.6)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
            }}
          >
            <div className="relative z-10 max-w-3xl text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/65 border border-gray-300 rounded-full px-4 py-2 text-sm mb-2 mt-1 text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-yellow-400" aria-hidden="true">
                  <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                </svg>
                Trusted by millions of patients & caregivers
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-gray-900">
                Learn more. <span style={{ color: 'var(--primary)' }}>Live better.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto font-normal">
                Your comprehensive source for drug information, interaction checking, and personalized medication guidance.
              </p>

              {/* Search Bar - Centered */}
              <form ref={searchRef} onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-4 relative">
                <div className="flex gap-2 bg-white rounded-2xl py-1.5 pl-1.5 pr-4 shadow-2xl border border-gray-100">
                  <div className="flex-1 relative flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 h-5 w-5 text-gray-400" aria-hidden="true">
                      <path d="m21 21-4.34-4.34"></path>
                      <circle cx="11" cy="11" r="8"></circle>
                    </svg>
                    <Input 
                      type="text" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={handleFocus}
                      placeholder="Search any drug name, ingredient, or condition..." 
                      className="pl-12 h-14 text-base border-none shadow-none focus-visible:ring-0" 
                    />
                  </div>
                  <Button type="submit" className="h-14 px-8 rounded-xl font-semibold text-base cursor-pointer transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: 'var(--primary)' }}>
                    Search
                  </Button>
                </div>
                <SearchSuggestions 
                  suggestions={suggestions} 
                  isVisible={showSuggestions} 
                  onSelect={handleSuggestionSelect} 
                  isFeatured={query.trim().length === 0}
                  query={query}
                />
              </form>

              {/* Trending Searches */}
              <div className="text-base text-gray-600 mb-12">
                <span className="font-semibold text-gray-800 mr-3">Trending searches:</span>
                {['Napa', 'Ace', 'Seclo', 'Sergel', 'Fexo', 'Monas', 'Orsaline-N'].map((term) => (
                  <Link key={term} href={`/drugs?search=${term}`} className="hover:text-primary transition-colors underline decoration-gray-400 decoration-dotted underline-offset-4 font-medium mr-4">
                    {term}
                  </Link>
                ))}
              </div>

              {/* AZBrowse included directly in hero for maximum visibility */}
              <div className="max-w-4xl mx-auto">
                <AZBrowse showAdvancedSearch={true} />
                <p className="text-sm text-gray-700 font-semibold mt-2 italic">
                  Can't remember? Just type what you can remember to{" "}
                  <button 
                    onClick={() => searchRef.current?.querySelector('input')?.focus()} 
                    className="text-blue-600 hover:text-blue-800 underline underline-offset-2 cursor-pointer font-bold"
                  >
                    try our phonetic search.
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-3 relative bg-gray-50">
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, var(--primary) 0%, transparent 50%, var(--primary) 100%)' }}></div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, var(--primary) 0%, transparent 50%, var(--primary) 100%)' }}></div>
        <div className="container-medq">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Drugs Listed', value: '20' },
              { label: 'Drug Classes', value: '19' },
              { label: 'Companies', value: '9' },
              { label: 'Patient Reviews', value: '6' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-gray-600 text-sm mt-1">{stat.label}</div>
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
