"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, Pill, Loader2 } from "lucide-react";
import { drugService } from "@/lib/services/drugService";
import { DrugClass, DrugSummary } from "@/types/drug";
import DrugCard from "@/components/drugs/DrugCard";
import AZBrowse from "@/components/drugs/AZBrowse";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchSuggestions } from "@/components/drugs/SearchSuggestions";

/**
 * The core content of the Drugs page.
 */
function DrugsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const searchQ = searchParams.get("search") || "";
  const drugClassFilter = searchParams.get("drug_class") || "";
  const letterFilter = searchParams.get("letter") || "";
  const isFiltered = !!(searchQ || drugClassFilter || letterFilter);

  const [drugs, setDrugs] = useState<DrugSummary[]>([]);
  const [classes, setClasses] = useState<DrugClass[]>([]);
  const [query, setQuery] = useState(searchQ);
  const [selectedClass, setSelectedClass] = useState(drugClassFilter);
  const [loading, setLoading] = useState(true);
  
  // Suggestion state
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

  // Fetch data when filters change
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [drugsData, classesData] = await Promise.all([
          drugService.getDrugs({ 
            drug_class: drugClassFilter || undefined,
            letter: letterFilter || undefined
          }),
          drugService.getDrugClasses()
        ]);

        let filteredDrugs = drugsData.drugs;
        
        // Local filtering for search (Standard for MVP)
        if (searchQ) {
          const trimmedLowerQuery = query.trim().toLowerCase();
          filteredDrugs = filteredDrugs.filter(
            (dr: DrugSummary) =>
              dr.brandName.toLowerCase().includes(trimmedLowerQuery) ||
              dr.genericName.toLowerCase().includes(trimmedLowerQuery) ||
              dr.drugClass.toLowerCase().includes(trimmedLowerQuery) ||
              (dr.company?.toLowerCase()?.includes(trimmedLowerQuery) ?? false)
          );
        }

        setDrugs(filteredDrugs);
        setClasses(classesData);
      } catch (error) {
        console.error("Failed to fetch drugs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [searchQ, drugClassFilter, letterFilter]);

  // Handle suggestion filtering
  useEffect(() => {
    if (query.trim().length === 0) {
      // Do not clear suggestions automatically, let handleFocus manage featured state
      return;
    }

    const lowerQuery = query.trim().toLowerCase();
    const filtered = drugs.filter(
      (d: DrugSummary) =>
        d.brandName.toLowerCase().includes(lowerQuery) ||
        d.genericName.toLowerCase().includes(lowerQuery) ||
        d.drugClass.toLowerCase().includes(lowerQuery) ||
        (d.company?.toLowerCase()?.includes(lowerQuery) ?? false)
    ).slice(0, 10);
    setSuggestions(filtered);
    setShowSuggestions(true);
  }, [query, drugs]);

  // Update URL when search form is submitted
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (selectedClass) params.set("drug_class", selectedClass);
    router.push(`/drugs?${params.toString()}`);
    setShowSuggestions(false);
  };

  const handleSuggestionSelect = (drug: DrugSummary) => {
    setQuery(drug.brandName);
    setShowSuggestions(false);
    router.push(`/drugs/${drug.slug}`);
  };

  const handleFocus = async () => {
    if (query.trim().length === 0) {
      try {
        const { drugs: allDrugs } = await drugService.getDrugs();
        setSuggestions(allDrugs.slice(0, 5));
        setShowSuggestions(true);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      }
    } else {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="container-medq py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Drug Directory</h1>
        <p className="text-muted-foreground">
          Browse our complete database of medications, verified by pharmacists.
        </p>
      </header>

      {/* Search & Filter Bar - Now Above A-Z */}
      <form ref={searchRef} onSubmit={handleSearch} className="flex flex-wrap gap-4 mb-10 items-end">
        <div className="flex-1 min-w-[280px] space-y-2 relative">
          <label className="text-sm font-semibold text-navy ml-1">Search Medication</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleFocus}
              placeholder="e.g. Paracetamol, Nexium..."
              className="pl-10 h-12"
            />
          </div>
          <SearchSuggestions 
            suggestions={suggestions} 
            isVisible={showSuggestions} 
            onSelect={handleSuggestionSelect} 
            isFeatured={query.trim().length === 0}
            query={query}
          />
        </div>

        <div className="w-[180px] space-y-2">
          <label className="text-sm font-semibold text-navy ml-1">Drug Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" className="h-12 px-5 bg-primary hover:bg-primary-dark cursor-pointer font-bold uppercase tracking-wide">
          Find Medicine
        </Button>

        {isFiltered && (
          <Button 
            variant="ghost" 
            onClick={() => {
              setQuery("");
              setSelectedClass("");
              router.push("/drugs");
            }}
            className="h-12 text-muted-foreground hover:text-primary cursor-pointer"
          >
            Clear Filters
          </Button>
        )}
      </form>

      {/* A-Z Browse Navigation - Now Below Search */}
      <AZBrowse />

      {/* Results Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p>Scanning medical database...</p>
        </div>
      ) : (
        <>
          {letterFilter ? (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-navy mb-1">
                Most Common '{letterFilter.toUpperCase()}' Drugs
              </h2>
              <p className="text-muted-foreground">
                Common medications that begin with the letter '{letterFilter.toUpperCase()}'
              </p>
            </div>
          ) : !isFiltered && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-navy mb-1">Popular Drug Searches</h2>
              <p className="text-muted-foreground">Frequently searched medications and medical treatments.</p>
            </div>
          )}

          {isFiltered && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-medium text-muted-foreground">
                Showing <span className="text-navy">{drugs.length}</span> results
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isFiltered ? (
              drugs.map((drug) => <DrugCard key={drug.id} drug={drug} />)
            ) : (
              drugs.slice(0, 12).map((drug) => <DrugCard key={drug.id} drug={drug} />)
            )}
          </div>

          {drugs.length === 0 && isFiltered && (
            <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed">
              <Pill className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <h3 className="text-xl font-bold text-navy mb-1">No Medications Found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                We couldn't find any results matching your search. Try adjusting your filters.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Main Page Export
 */
export default function DrugsPage() {
  return (
    <Suspense fallback={
      <div className="container-medq py-20 text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
      </div>
    }>
      <DrugsContent />
    </Suspense>
  );
}
