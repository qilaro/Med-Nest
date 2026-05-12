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
  const typeFilter = searchParams.get("type") || "";
  const drugClassFilter = searchParams.get("drug_class") || "";
  const companyFilter = searchParams.get("company") || "";
  const genericFilter = searchParams.get("generic") || "";
  const dosageFilter = searchParams.get("dosage_form") || "";
  const ratingFilter = searchParams.get("rating") || "";
  const letterFilter = searchParams.get("letter") || "";
  const isFiltered = !!(searchQ || typeFilter || drugClassFilter || companyFilter || genericFilter || dosageFilter || ratingFilter || letterFilter);

  const [drugs, setDrugs] = useState<DrugSummary[]>([]);
  const [classes, setClasses] = useState<DrugClass[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [generics, setGenerics] = useState<string[]>([]);
  const [dosageForms, setDosageForms] = useState<string[]>([]);
  const [query, setQuery] = useState(searchQ);
  const [selectedType, setSelectedType] = useState(typeFilter);
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
            medicine_type: typeFilter || undefined,
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
  }, [searchQ, typeFilter, drugClassFilter, companyFilter, genericFilter, dosageFilter, ratingFilter, letterFilter]);

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
    if (selectedType) params.set("type", selectedType);
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
    setSelectedType("");
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
        <div className="bg-white rounded-2xl border border-sky-200 shadow-[8px_16px_40px_rgba(0,0,0,0.15),0_20px_60px_-12px_rgba(0,0,0,0.25)] p-6 md:p-8">
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
          <div className="flex items-center gap-1.5 mb-5 flex-nowrap justify-center">
            <div className="relative w-[130px]">
              <select
                value={selectedType}
                onChange={(e) => { setSelectedType(e.target.value); if (e.target.value) router.push(`/drugs?type=${e.target.value}`); else clearFilters(); }}
                className="appearance-none bg-gray-50 border-2 border-sky-300 rounded-full px-3 py-1.5 pr-4 text-xs font-semibold text-gray-800 cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-300 w-full text-center shadow-md"
              >
                <option value="">Type</option>
                <option value="allopathic">Pharmaceutical</option>
                <option value="herbal">Herbal</option>
                <option value="unani">Unani</option>
                <option value="homeopathic">Homeopathic</option>
                <option value="ayurvedic">Ayurvedic</option>
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>

            <div className="relative w-[130px]">
              <select
                value={selectedClass}
                onChange={(e) => { setSelectedClass(e.target.value); if (e.target.value) router.push(`/drugs?drug_class=${encodeURIComponent(e.target.value)}`); else clearFilters(); }}
                className="appearance-none bg-gray-50 border-2 border-sky-300 rounded-full px-3 py-1.5 pr-4 text-xs font-semibold text-gray-800 cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-300 w-full text-center shadow-md"
              >
                <option value="">Class</option>
                {classes.map((c: any) => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>

            <div className="relative w-[130px]">
              <select
                value={selectedCompany}
                onChange={(e) => { setSelectedCompany(e.target.value); if (e.target.value) router.push(`/drugs?company=${encodeURIComponent(e.target.value)}`); else clearFilters(); }}
                className="appearance-none bg-gray-50 border-2 border-sky-300 rounded-full px-3 py-1.5 pr-4 text-xs font-semibold text-gray-800 cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-300 w-full text-center shadow-md"
              >
                <option value="">Company</option>
                {companies.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>

            <div className="relative w-[130px]">
              <select
                value={selectedGeneric}
                onChange={(e) => { setSelectedGeneric(e.target.value); if (e.target.value) router.push(`/drugs?generic=${encodeURIComponent(e.target.value)}`); else clearFilters(); }}
                className="appearance-none bg-gray-50 border-2 border-sky-300 rounded-full px-3 py-1.5 pr-4 text-xs font-semibold text-gray-800 cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-300 w-full text-center shadow-md"
              >
                <option value="">Generic</option>
                {generics.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>

            <div className="relative w-[130px]">
              <select
                value={selectedDosageForm}
                onChange={(e) => { setSelectedDosageForm(e.target.value); if (e.target.value) router.push(`/drugs?dosage_form=${encodeURIComponent(e.target.value)}`); else clearFilters(); }}
                className="appearance-none bg-gray-50 border-2 border-sky-300 rounded-full px-3 py-1.5 pr-4 text-xs font-semibold text-gray-800 cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-300 w-full text-center shadow-md"
              >
                <option value="">Form</option>
                {dosageForms.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>

            <div className="relative w-[130px]">
              <select
                value={selectedRating}
                onChange={(e) => { setSelectedRating(e.target.value); if (e.target.value) router.push(`/drugs?rating=${e.target.value}`); else clearFilters(); }}
                className="appearance-none bg-gray-50 border-2 border-sky-300 rounded-full px-3 py-1.5 pr-4 text-xs font-semibold text-gray-800 cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-300 w-full text-center shadow-md"
              >
                <option value="">Rating</option>
                <option value="5">5 ★★★★★</option>
                <option value="4">4 ★★★★☆</option>
                <option value="3">3 ★★★☆☆</option>
                <option value="2">2 ★★☆☆☆</option>
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>

            {isFiltered && (
              <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-red-600 font-semibold transition-colors shrink-0 ml-1">✕</button>
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
