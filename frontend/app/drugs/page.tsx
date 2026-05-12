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
  const [selectedRatings, setSelectedRatings] = useState<string[]>(ratingFilter ? ratingFilter.split(',') : []);
  const [showRatingDropdown, setShowRatingDropdown] = useState(false);
  const ratingRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState<string | null>(null);
  
  // Suggestion state
  const [suggestions, setSuggestions] = useState<DrugSummary[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTotal, setSearchTotal] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);
  const hasUrlQuery = useRef(!!searchQ);

  // Handle suggestion filtering
  useEffect(() => {
    if (hasUrlQuery.current) { hasUrlQuery.current = false; return; }
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
    if (selectedRatings.length) params.set("rating", selectedRatings.join(','));
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
    setSelectedRatings([]);
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
                total={searchTotal}
              />
            </div>

            <Button type="submit" className="h-14 px-8 rounded-xl font-bold bg-primary hover:bg-primary-dark cursor-pointer">
              Find Medicine
            </Button>
          </form>

          {/* Inline Filter Bar */}
          <div className="flex items-center gap-1.5 mb-5 flex-nowrap justify-center">
            {[
              { value: selectedType, set: setSelectedType, param: "type", label: "Type", opts: [["allopathic","Pharmaceutical"],["herbal","Herbal"],["unani","Unani"],["homeopathic","Homeopathic"],["ayurvedic","Ayurvedic"]] },
              { value: selectedClass, set: setSelectedClass, param: "drug_class", label: "Class", opts: classes.map((c: any) => [c.name, c.name]) },
              { value: selectedCompany, set: setSelectedCompany, param: "company", label: "Company", opts: companies.map((c: string) => [c, c]) },
              { value: selectedGeneric, set: setSelectedGeneric, param: "generic", label: "Generic", opts: generics.map((g: string) => [g, g]) },
              { value: selectedDosageForm, set: setSelectedDosageForm, param: "dosage_form", label: "Form", opts: dosageForms.map((f: string) => [f, f]) },
            ].map((f: any) => {
              const isActive = !!f.value;
              return (
                <div key={f.label} className="relative shrink-0" style={{ width: '120px' }}>
                  <select
                    value={f.value}
                    onChange={(e) => { f.set(e.target.value); if (e.target.value) { const p = new URLSearchParams(); p.set(f.param, e.target.value); router.push(`/drugs?${p.toString()}`); } else clearFilters(); }}
                    className={`appearance-none rounded-full px-3 py-1.5 pr-4 text-xs font-semibold w-full text-center shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-300 border-2 [&>option]:cursor-pointer ${
                      isActive
                        ? 'bg-teal-500 text-white border-teal-500'
                        : 'bg-gray-50 text-gray-700 border-sky-200 hover:border-teal-400 hover:bg-teal-50'
                    }`}
                  >
                    <option value="" hidden>{f.label}</option>
                    <option value="">All</option>
                    {f.opts.map(([val, display]: string[]) => <option key={val} value={val}>{display}</option>)}
                  </select>
                  <svg className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${isActive ? 'text-white' : 'text-gray-500'}`} width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              );
            })}

            {/* Rating checkbox dropdown */}
            <div className="relative shrink-0" ref={ratingRef}>
              <button
                onClick={() => setShowRatingDropdown(!showRatingDropdown)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition-all border-2 flex items-center gap-1 ${
                  selectedRatings.length
                    ? 'bg-teal-500 text-white border-teal-500'
                    : 'bg-gray-50 text-gray-700 border-sky-200 hover:border-teal-400 hover:bg-teal-50'
                }`}
              >
                ★
                {selectedRatings.length > 0 && <span className="text-[10px]">({selectedRatings.join(',')})</span>}
                <svg className={`transition-colors ${selectedRatings.length ? 'text-white' : 'text-gray-500'}`} width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              {showRatingDropdown && (
                <div className="absolute top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[140px] right-0">
                  {[["5","5 ★★★★★"],["4","4 ★★★★"],["3","3 ★★★"],["2","2 ★★"]].map(([val, display]) => {
                    const checked = selectedRatings.includes(val);
                    return (
                      <label key={val} className="flex items-center gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-teal-50 whitespace-nowrap">
                        <input type="checkbox" checked={checked} onChange={() => {
                          const next = checked ? selectedRatings.filter(r => r !== val) : [...selectedRatings, val];
                          setSelectedRatings(next);
                          if (next.length) router.push(`/drugs?rating=${next.join(',')}`); else clearFilters();
                          setShowRatingDropdown(false);
                        }} className="accent-teal-500" />
                        {display}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {isFiltered && (
              <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-red-600 font-semibold transition-colors shrink-0 ml-1 cursor-pointer">✕</button>
            )}
          </div>

          <AZBrowse showTabs={false} />

          <div className="mt-8">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-200" />
                      <div className="flex-1 space-y-2.5">
                        <div className="h-4 bg-gray-200 rounded-full w-3/4" />
                        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-3 bg-gray-100 rounded-full w-full" />
                      <div className="h-3 bg-gray-100 rounded-full w-2/3" />
                    </div>
                  </div>
                ))}
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
