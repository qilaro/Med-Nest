"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Pill, Loader2, X, AlertCircle, Star } from "lucide-react";
import { drugService } from "@/lib/services/drugService";
import { DrugClass, DrugSummary } from "@/types/drug";
import DrugCard from "@/components/drugs/DrugCard";
import AZBrowse from "@/components/drugs/AZBrowse";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchSuggestions } from "@/components/drugs/SearchSuggestions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * The core content of the Drugs page.
 */
function DrugsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const searchQ = searchParams.get("search") || "";
  const drugClassFilter = searchParams.get("drug_class") || "";
  const companyFilter = searchParams.get("company") || "";
  const genericFilter = searchParams.get("generic") || "";
  const ratingFilter = searchParams.get("rating") || "";
  const letterFilter = searchParams.get("letter") || "";
  const isFiltered = !!(searchQ || drugClassFilter || companyFilter || genericFilter || ratingFilter || letterFilter);

  const [drugs, setDrugs] = useState<DrugSummary[]>([]);
  const [classes, setClasses] = useState<DrugClass[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [generics, setGenerics] = useState<string[]>([]);
  const [query, setQuery] = useState(searchQ);
  const [selectedClass, setSelectedClass] = useState(drugClassFilter);
  const [selectedCompany, setSelectedCompany] = useState(companyFilter);
  const [selectedGeneric, setSelectedGeneric] = useState(genericFilter);
  const [selectedRating, setSelectedRating] = useState(ratingFilter);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  
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
        const [drugsData, classesData, companiesData] = await Promise.all([
          drugService.getDrugs({ 
            drug_class: drugClassFilter || undefined,
            letter: letterFilter || undefined
          }),
          drugService.getDrugClasses(),
          drugService.getCompanies()
        ]);

        let filteredDrugs = drugsData.drugs;
        
        // Extract unique generic names for filter
        const uniqueGenerics: string[] = Array.from(new Set(drugsData.drugs.map((d: DrugSummary) => d.genericName))).filter((g): g is string => typeof g === 'string').sort();
        setGenerics(uniqueGenerics);
        
        // Local filtering
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

        if (companyFilter) {
          filteredDrugs = filteredDrugs.filter((dr: DrugSummary) => dr.company === companyFilter);
        }
        
        if (genericFilter) {
          filteredDrugs = filteredDrugs.filter((dr: DrugSummary) => dr.genericName === genericFilter);
        }
        
        if (ratingFilter) {
          const minRating = parseFloat(ratingFilter);
          filteredDrugs = filteredDrugs.filter((dr: DrugSummary) => (dr.averageRating || 0) >= minRating);
        }

        setDrugs(filteredDrugs);
        setClasses(classesData);
        setCompanies(companiesData);
      } catch (error) {
        console.error("Failed to fetch drugs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [searchQ, drugClassFilter, companyFilter, genericFilter, ratingFilter, letterFilter]);

  // Handle suggestion filtering
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

  const handleSearch = (e?: React.FormEvent, isFilterAction = false) => {
    if (e) e.preventDefault();

    if (isFilterAction && !selectedClass && !selectedCompany && !selectedGeneric && !selectedRating) {
      setWarning("No filter selected");
      setTimeout(() => setWarning(null), 3000);
      return;
    }

    if (!isFilterAction && !query.trim()) {
      setWarning("No medicine searched");
      setTimeout(() => setWarning(null), 3000);
      return;
    }

    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (selectedClass) params.set("drug_class", selectedClass);
    if (selectedCompany) params.set("company", selectedCompany);
    if (selectedGeneric) params.set("generic", selectedGeneric);
    if (selectedRating) params.set("rating", selectedRating);
    router.push(`/drugs?${params.toString()}`);
    setShowSuggestions(false);
    setIsFilterOpen(false);
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

  const clearFilters = () => {
    setQuery("");
    setSelectedClass("");
    setSelectedCompany("");
    setSelectedGeneric("");
    setSelectedRating("");
    router.push("/drugs");
  };

  return (
    <div className="container-medq py-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Drug Directory</h1>
          <p className="text-muted-foreground">
            Browse our complete database of medications, verified by pharmacists.
          </p>
        </header>

        {warning && (
          <div className="flex items-center gap-2 p-4 mb-4 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
            <AlertCircle className="h-5 w-5" />
            <p className="font-semibold">{warning}</p>
          </div>
        )}

        <form ref={searchRef} onSubmit={(e) => handleSearch(e)} className="flex flex-wrap gap-4 mb-10 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleFocus}
              placeholder="Search medications..."
              className="pl-10 h-14 rounded-xl text-base shadow-sm"
            />
            <SearchSuggestions 
              suggestions={suggestions} 
              isVisible={showSuggestions} 
              onSelect={handleSuggestionSelect} 
              isFeatured={query.trim().length === 0}
              query={query}
            />
          </div>

          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-14 px-6 rounded-xl gap-2 font-semibold text-base border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                <SlidersHorizontal className="h-5 w-5" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-6 space-y-6 bg-white opacity-100 min-h-[400px]" side="bottom" align="start" sideOffset={8}>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Drug Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full h-12 rounded-lg border border-gray-200 px-3 cursor-pointer [&>option]:cursor-pointer"
                >
                  <option value="">All Classes</option>
                  {classes.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Company</label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full h-12 rounded-lg border border-gray-200 px-3 cursor-pointer [&>option]:cursor-pointer"
                >
                  <option value="">All Companies</option>
                  {companies.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Generic Name</label>
                <select
                  value={selectedGeneric}
                  onChange={(e) => setSelectedGeneric(e.target.value)}
                  className="w-full h-12 rounded-lg border border-gray-200 px-3 cursor-pointer [&>option]:cursor-pointer"
                >
                  <option value="">All Generics</option>
                  {generics.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Minimum Rating</label>
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="w-full h-12 rounded-lg border border-gray-200 px-3 cursor-pointer [&>option]:cursor-pointer"
                >
                  <option value="">All Ratings</option>
                  <option value="5">5.0 ★★★★★</option>
                  <option value="4">4.0+ ★★★★☆</option>
                  <option value="3">3.0+ ★★★☆☆</option>
                  <option value="2">2.0+ ★★☆☆☆</option>
                </select>
              </div>
              <Button className="w-full h-12 font-bold bg-primary cursor-pointer" onClick={() => handleSearch(undefined, true)}>Apply Filters</Button>
            </PopoverContent>
          </Popover>

          <Button type="submit" className="h-14 px-8 rounded-xl font-bold bg-primary hover:bg-primary-dark cursor-pointer">
            Find Medicine
          </Button>

          {isFiltered && (
            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground h-14 cursor-pointer">
              <X className="h-5 w-5 mr-1" /> Clear
            </Button>
          )}
        </form>

        <AZBrowse showAdvancedSearch={false} />
        <hr className="my-8 border-t border-gray-200" />
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p>Scanning database...</p>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl">
          <h2 className="text-xl font-bold text-navy mb-6">Popular Drug Searches</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isFiltered ? drugs.map((drug) => <DrugCard key={drug.id} drug={drug} />) : drugs.slice(0, 12).map((drug) => <DrugCard key={drug.id} drug={drug} />)}
          </div>
        </div>
      )}
    </div>
  );
}

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
