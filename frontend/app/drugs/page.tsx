"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle, Star } from "lucide-react";
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
  const companyFilter = searchParams.get("company") || "";
  const genericFilter = searchParams.get("generic") || "";
  const dosageFilter = searchParams.get("dosage_form") || "";
  const ratingFilter = searchParams.get("rating") || "";
  const letterFilter = searchParams.get("letter") || "";
  const isFiltered = !!(searchQ || drugClassFilter || companyFilter || genericFilter || dosageFilter || ratingFilter || letterFilter);

  const [drugs, setDrugs] = useState<DrugSummary[]>([]);
  const [classes, setClasses] = useState<DrugClass[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [generics, setGenerics] = useState<string[]>([]);
  const [dosageForms, setDosageForms] = useState<string[]>([]);
  const [query, setQuery] = useState(searchQ);
  const [selectedClass, setSelectedClass] = useState(drugClassFilter);
  const [selectedCompany, setSelectedCompany] = useState(companyFilter);
  const [selectedGeneric, setSelectedGeneric] = useState(genericFilter);
  const [selectedDosageForm, setSelectedDosageForm] = useState(dosageFilter);
  const [selectedRating, setSelectedRating] = useState(ratingFilter);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState<string | null>(null);
  
  // Suggestion state
  const [suggestions, setSuggestions] = useState<DrugSummary[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
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
        const [drugsData, classesData, companiesData, formsData] = await Promise.all([
          drugService.getDrugs({ 
            drug_class: drugClassFilter || undefined,
            letter: letterFilter || undefined
          }),
          drugService.getDrugClasses(),
          drugService.getCompanies(),
          drugService.getDosageForms(),
        ]);

        let filteredDrugs = drugsData.drugs;
        
        // Extract unique generic names for filter
        const uniqueGenerics: string[] = Array.from(new Set(drugsData.drugs.map((d: DrugSummary) => d.genericName))).filter((g): g is string => typeof g === 'string').sort();
        setGenerics(uniqueGenerics);
        
        const uniqueForms: string[] = formsData.map((f: any) => f.name).filter(Boolean).sort();
        setDosageForms(uniqueForms);
        
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
        
        if (dosageFilter) {
          filteredDrugs = filteredDrugs.filter((dr: DrugSummary) => dr.dosageForm === dosageFilter);
        }
        
        if (ratingFilter) {
          const minRating = parseFloat(ratingFilter);
          filteredDrugs = filteredDrugs.filter((dr: DrugSummary) => (dr.averageRating || 0) >= minRating);
        }

        setDrugs(filteredDrugs);
        setClasses(classesData);
        setCompanies(companiesData);
        setDosageForms(uniqueForms);
      } catch (error) {
        console.error("Failed to fetch drugs:", error);
        setWarning("Failed to load medicines. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [searchQ, drugClassFilter, companyFilter, genericFilter, dosageFilter, ratingFilter, letterFilter]);

  // Handle suggestion filtering
  useEffect(() => {
    if (query.trim().length === 0) {
      setShowSuggestions(false);
      return;
    }

    const fetchFuzzySuggestions = async () => {
      try {
        setIsSearching(true);
        const { results } = await drugService.searchDrugs(query.trim());
        setSuggestions(results.slice(0, 10));
        setShowSuggestions(true);
      } catch (error) {
        console.error("Failed to fetch fuzzy suggestions:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchFuzzySuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      setWarning("No medicine searched");
      setTimeout(() => setWarning(null), 3000);
      return;
    }

    const params = new URLSearchParams();
    if (query) { params.set("search", query); fetch('/api/search/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: query.trim() }) }).catch(() => {}); }
    if (selectedClass) params.set("drug_class", selectedClass);
    if (selectedCompany) params.set("company", selectedCompany);
    if (selectedGeneric) params.set("generic", selectedGeneric);
    if (selectedDosageForm) params.set("dosage_form", selectedDosageForm);
    if (selectedRating) params.set("rating", selectedRating);
    router.push(`/drugs?${params.toString()}`);
    setShowSuggestions(false);
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
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setIsSearching(false);
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
    setSelectedDosageForm("");
    setSelectedRating("");
    router.push("/drugs");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#D5E9E7] via-white to-white py-6">
      <div className="max-w-[800px] mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.08),0_8px_24px_-6px_rgba(0,0,0,0.05)] p-6 md:p-8">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-navy mb-1">Drug Directory</h1>
            <p className="text-sm text-gray-500">
              Browse our complete database of medications, verified by pharmacists.
            </p>
          </header>

          {warning && (
            <div className="flex items-center gap-2 p-4 mb-6 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
              <AlertCircle className="h-5 w-5" />
              <p className="font-semibold">{warning}</p>
            </div>
          )}

          <form ref={searchRef} onSubmit={(e) => handleSearch(e)} className="flex flex-wrap gap-4 mb-6 items-start">
            <div className="relative flex-1 min-w-[280px]">
              <img src="/icons/pill.svg" alt="search" className="absolute left-4 top-1/2 -translate-y-1/2 h-9 w-9" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={handleFocus}
                placeholder="Search medications..."
                className="pl-16 h-14 rounded-xl text-base shadow-sm border-2 border-sky-200 focus-visible:border-sky-400"
              />
              <SearchSuggestions 
                suggestions={suggestions} 
                isVisible={showSuggestions} 
                onSelect={handleSuggestionSelect} 
                isFeatured={query.trim().length === 0}
                query={query}
                isLoading={isSearching}
              />
            </div>

            <Button type="submit" className="h-14 px-8 rounded-xl font-bold bg-primary hover:bg-primary-dark cursor-pointer">
              Find Medicine
            </Button>
          </form>

          {/* Inline Filter Bar */}
          <div className="flex items-center gap-1 mb-5 flex-nowrap">
            {[
              { value: selectedClass, set: setSelectedClass, label: "Class", options: classes.map((c: any) => c.name), param: "drug_class" },
              { value: selectedCompany, set: setSelectedCompany, label: "Company", options: companies, param: "company" },
              { value: selectedGeneric, set: setSelectedGeneric, label: "Generic", options: generics, param: "generic" },
              { value: selectedDosageForm, set: setSelectedDosageForm, label: "Form", options: dosageForms, param: "dosage_form" },
              { value: selectedRating, set: setSelectedRating, label: "Rating", options: ["5 ★★★★★", "4 ★★★★☆", "3 ★★★☆☆", "2 ★★☆☆☆"], param: "rating" },
            ].map((filter) => (
              <div key={filter.label} className="relative min-w-0 shrink-0">
                <select
                  value={filter.value}
                  onChange={(e) => {
                    filter.set(e.target.value);
                    if (e.target.value) {
                      const p = new URLSearchParams();
                      p.set(filter.param, encodeURIComponent(e.target.value));
                      router.push(`/drugs?${p.toString()}`);
                    } else clearFilters();
                  }}
                  className="appearance-none bg-white border border-gray-200 rounded-full px-1.5 py-0.5 pr-2.5 text-[10px] font-medium text-gray-600 cursor-pointer hover:border-teal-300 hover:bg-teal-50 transition-colors focus:outline-none focus:ring-1 focus:ring-teal-200 min-w-0 max-w-[120px] truncate"
                >
                  <option value="">{filter.label}</option>
                  {filter.options.map((opt: string) => (
                    <option key={opt} value={filter.label === "Rating" ? opt.charAt(0) : opt} className="text-[10px]">{opt}</option>
                  ))}
                </select>
                <svg className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            ))}

            {isFiltered && (
              <button onClick={clearFilters} className="text-[11px] text-gray-400 hover:text-red-500 font-medium transition-colors shrink-0">✕</button>
            )}
          </div>

          <AZBrowse showTabs={false} />

          <div className="mt-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p>Scanning database...</p>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-navy mb-6">Popular Drug Searches</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isFiltered ? drugs.map((drug) => <DrugCard key={drug.id} drug={drug} />) : drugs.slice(0, 12).map((drug) => <DrugCard key={drug.id} drug={drug} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
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
