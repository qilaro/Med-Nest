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

  const [drugs, setDrugs] = useState<DrugSummary[]>([]);
  const [classes, setClasses] = useState<DrugClass[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [generics, setGenerics] = useState<string[]>([]);
  const [dosageForms, setDosageForms] = useState<string[]>([]);
  const [query, setQuery] = useState(searchQ);
  const [activeSearch, setActiveSearch] = useState("");

  // Sync filter state from URL params (handles back/forward and direct URL changes)
  const [selectedType, setSelectedType] = useState(typeFilter);
  const [selectedClass, setSelectedClass] = useState(drugClassFilter);
  const [selectedCompany, setSelectedCompany] = useState(companyFilter);
  const [selectedGeneric, setSelectedGeneric] = useState(genericFilter);
  const [selectedDosageForm, setSelectedDosageForm] = useState(dosageFilter);
  const [selectedRating, setSelectedRating] = useState(ratingFilter);
  const [selectedRatings, setSelectedRatings] = useState<string[]>(ratingFilter ? ratingFilter.split(',') : []);

  // Sync local filter state from URL — handles back/forward, direct nav, duplicate pushes
  useEffect(() => {
    setSelectedType(typeFilter);
    setSelectedClass(drugClassFilter);
    setSelectedCompany(companyFilter);
    setSelectedGeneric(genericFilter);
    setSelectedDosageForm(dosageFilter);
    setSelectedRating(ratingFilter);
    setSelectedRatings(ratingFilter ? ratingFilter.split(',') : []);
    setCurrentPage(1);
  }, [typeFilter, drugClassFilter, companyFilter, genericFilter, dosageFilter, ratingFilter]);
  const [showRatingDropdown, setShowRatingDropdown] = useState(false);
  const ratingRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState<string | null>(null);
  
  // Suggestion state
  const [suggestions, setSuggestions] = useState<DrugSummary[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTotal, setSearchTotal] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);
  const hasUrlQuery = useRef(!!searchQ);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const submittedRef = useRef(false);
  const reqIdRef = useRef(0);
  const interactedRef = useRef(false);

  const isFiltered = !!(activeSearch || searchQ || typeFilter || drugClassFilter || companyFilter || genericFilter || dosageFilter || ratingFilter || letterFilter);

  // Close suggestions when clicking outside
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

  // Fetch main drug data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [drugsData, classesData, companiesData, formsData] = await Promise.all([
          drugService.getDrugs({ 
            page: currentPage,
            limit: 20,
            drug_class: drugClassFilter || undefined,
            medicine_type: typeFilter || undefined,
            letter: letterFilter || undefined,
            search: (activeSearch || searchQ) || undefined,
            company: companyFilter || undefined,
            generic: genericFilter || undefined,
            dosage_form: dosageFilter || undefined,
          }),
          drugService.getDrugClasses(),
          drugService.getCompanies(),
          drugService.getDosageForms(),
        ]);

        let filteredDrugs = drugsData.drugs;
        setTotalResults(drugsData.total);
        setCurrentPage(drugsData.page || 1);
        setTotalPages(drugsData.totalPages || 1);
        
        const uniqueGenerics: string[] = Array.from(new Set(drugsData.drugs.map((d: DrugSummary) => d.genericName))).filter((g): g is string => typeof g === 'string').sort();
        setGenerics(uniqueGenerics);
        
        const uniqueForms: string[] = formsData.map((f: any) => f.name).filter(Boolean).sort();
        setDosageForms(uniqueForms);
        
        if (searchQ) {
          const q = searchQ.trim().toLowerCase();
          filteredDrugs = filteredDrugs.filter(
            (dr: DrugSummary) =>
              dr.brandName.toLowerCase().includes(q) ||
              dr.genericName.toLowerCase().includes(q) ||
              dr.company?.toLowerCase().includes(q) ||
              dr.drugClass?.toLowerCase()?.includes(q)
          );
        }

        if (companyFilter) {
          const comps = companyFilter.split(',');
          filteredDrugs = filteredDrugs.filter((dr: DrugSummary) => dr.company && comps.includes(dr.company));
        }
        
        if (dosageFilter) {
          const dForms = dosageFilter.split(',');
          filteredDrugs = filteredDrugs.filter((dr: DrugSummary) => dForms.includes(dr.dosageForm));
        }
        
        if (ratingFilter) {
          const ratings = ratingFilter.split(',').map(Number);
          filteredDrugs = filteredDrugs.filter((dr: DrugSummary) => {
            const drugRating = dr.averageRating || 0;
            return ratings.some((r: number) => drugRating >= r);
          });
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
  }, [activeSearch, searchQ, currentPage, typeFilter, drugClassFilter, companyFilter, genericFilter, dosageFilter, ratingFilter, letterFilter]);

  // Reset suggestions when URL has active search (e.g. from homepage navigation)
  useEffect(() => {
    if (searchQ) {
      setShowSuggestions(false);
      setSuggestions([]);
      setSearchTotal(0);
    }
  }, [searchQ]);

  // Handle suggestion filtering
  useEffect(() => {
    if (hasUrlQuery.current) { hasUrlQuery.current = false; return; }
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
      const myReqId = ++reqIdRef.current;
      try {
        setIsSearching(true);
        const { results, total } = await drugService.searchDrugs(query.trim());
        if (reqIdRef.current !== myReqId) return;
        if (searchQ && query.trim() === searchQ) return;
        if (activeSearch && query.trim() === activeSearch) return;
        setSuggestions(results.slice(0, 10));
        setSearchTotal(total);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Failed to fetch fuzzy suggestions:", error);
      } finally {
        if (reqIdRef.current === myReqId) setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchFuzzySuggestions, 300);
    debounceRef.current = timer;
    return () => { clearTimeout(timer); debounceRef.current = null; };
  }, [query]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    reqIdRef.current++;
    if (!query.trim()) {
      setWarning("No medicine searched");
      setTimeout(() => setWarning(null), 3000);
      return;
    }

    setShowSuggestions(false);
    setSuggestions([]);
    setSearchTotal(0);
    setIsSearching(false);
    submittedRef.current = true;
    if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null; }

    // If other filters are active, navigate to clear them
    if (typeFilter || drugClassFilter || companyFilter || genericFilter || dosageFilter || ratingFilter || letterFilter) {
      const p = new URLSearchParams();
      p.set('search', query.trim());
      router.push(`/drugs?${p.toString()}`);
    } else {
      setActiveSearch(query.trim());
    }
    setCurrentPage(1);
    fetch('/api/search/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: query.trim() }) }).catch(() => {});
  };

  const handleSuggestionSelect = (drug: DrugSummary) => {
    fetch('/api/search/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: drug.brandName }) }).catch(() => {});
    setQuery(drug.brandName);
    setShowSuggestions(false);
    if (drug.type === 'generic') router.push(`/generics/${drug.slug}`);
    else if (drug.type === 'class') router.push(`/class?name=${encodeURIComponent(drug.brandName)}`);
    else router.push(`/drugs/${drug.slug}`);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const handleFocus = async () => {
    interactedRef.current = true;
    if (activeSearch || searchQ || submittedRef.current) { submittedRef.current = false; return; }
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
    setActiveSearch("");
    setCurrentPage(1);
    setSelectedType("");
    setSelectedClass("");
    setSelectedCompany("");
    setSelectedGeneric("");
    setSelectedDosageForm("");
    setSelectedRatings([]);
    setSelectedRating("");
    router.push("/drugs");
  };

  const canonicalUrl = (() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete('page');
    const qs = p.toString();
    return `https://mednest.com.bd/drugs${qs ? `?${qs}` : ''}`;
  })();

  return (
    <>
      <link rel="canonical" href={canonicalUrl} />
      <div className="bg-gradient-to-b from-[#D5E9E7] via-white to-white py-6">
      <div className="max-w-[1024px] mx-auto px-3 sm:px-0">
        <div className="bg-white rounded-2xl border border-sky-200 shadow-[8px_16px_40px_rgba(0,0,0,0.15),0_20px_60px_-12px_rgba(0,0,0,0.25)] p-6 md:p-8">
          <header className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-1">Drug Directory</h1>
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

          <form ref={searchRef} onSubmit={(e) => handleSearch(e)} className="mb-6 max-w-4xl mx-auto relative">
            <div className="flex items-stretch rounded-full border-2 border-sky-200 bg-white focus-within:border-teal-400 focus-within:shadow-[0_0_0_4px_rgba(45,138,120,0.2)] transition-shadow duration-200 overflow-hidden">
              <div className="relative flex-1 min-w-0 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-5 h-5 w-5 text-gray-400 shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    interactedRef.current = true;
                    setQuery(e.target.value);
                    submittedRef.current = false;
                    if (searchQ) { router.replace('/drugs'); }
                    else if (activeSearch) { setActiveSearch(""); }
                  }}
                  onFocus={handleFocus}
                  onBlur={() => { if (!query.trim() && !activeSearch && !searchQ) setShowSuggestions(false); }}
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
              onViewAll={() => setShowSuggestions(false)}
            />
          </form>

          {/* Inline Filter Bar */}
          <div className="flex items-center gap-1.5 mb-5 flex-wrap sm:flex-nowrap justify-center">
            {[
              { value: selectedType, set: setSelectedType, param: "type", label: "Type", opts: [["allopathic","Pharma"],["herbal","Herbal"],["unani","Unani"],["homeopathic","Homeopathic"],["ayurvedic","Ayurvedic"]] },
              { value: selectedClass, set: setSelectedClass, param: "drug_class", label: "Class", opts: classes.map((c: any) => [c.name, c.name]) },
              { value: selectedCompany, set: setSelectedCompany, param: "company", label: "Company", opts: companies.map((c: string) => [c, c]) },
              { value: selectedGeneric, set: setSelectedGeneric, param: "generic", label: "Generic", opts: generics.map((g: string) => [g, g]) },
              { value: selectedDosageForm, set: setSelectedDosageForm, param: "dosage_form", label: "Form", opts: dosageForms.map((f: string) => [f, f]) },
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
                      if (f.param === 'company' ? val : selectedCompany) p.set('company', f.param === 'company' ? val : selectedCompany);
                      if (f.param === 'generic' ? val : selectedGeneric) p.set('generic', f.param === 'generic' ? val : selectedGeneric);
                      if (f.param === 'dosage_form' ? val : selectedDosageForm) p.set('dosage_form', f.param === 'dosage_form' ? val : selectedDosageForm);
                      if (selectedRatings.length) p.set('rating', selectedRatings.join(','));
                      if (letterFilter) p.set('letter', letterFilter);
                      const qs = p.toString();
                      router.push(qs ? `/drugs?${qs}` : '/drugs');
                    }}
                    className={`appearance-none rounded-full px-3 py-1.5 pr-4 text-xs font-semibold w-full text-center shadow-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-300 border-2 [&>option]:cursor-pointer ${
                      isActive
                        ? 'bg-teal-500 text-white border-teal-500'
                        : 'bg-gray-50 text-gray-700 border-sky-200 hover:border-teal-400 hover:bg-teal-50'
                    }`}
                  >
                    <option value="" hidden>{f.label}</option>
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
                className={`rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors border-2 flex items-center gap-1 ${
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
          </div>

          {!searchQ && !isFiltered && <AZBrowse showTabs={false} />}

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
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-navy">
                    {(() => {
                      const allFilters = [
                        ...(activeSearch || searchQ ? [`"${activeSearch || searchQ}"`] : []),
                        ...(typeFilter ? [typeFilter] : []),
                        ...(drugClassFilter ? [drugClassFilter] : []),
                        ...(companyFilter ? [companyFilter] : []),
                        ...(genericFilter ? [genericFilter] : []),
                        ...(dosageFilter ? [dosageFilter] : []),
                        ...(selectedRatings.length ? [`${selectedRatings.join(',')}★`] : []),
                        ...(letterFilter ? [letterFilter] : []),
                      ].filter(Boolean);
                      return allFilters.length > 0
                        ? <>Showing <span className="text-teal-600">{totalResults}</span> results for <span className="text-teal-600">{allFilters.join(', ')}</span></>
                        : <>Popular Drug Searches</>;
                    })()}
                  </h2>
                  {isFiltered && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 hover:text-red-600 hover:border-red-300 active:scale-95 transition-colors duration-150 cursor-pointer align-middle shrink-0"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Clear
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isFiltered ? drugs.map((drug) => <DrugCard key={drug.id} drug={drug} />) : drugs.slice(0, 12).map((drug) => <DrugCard key={drug.id} drug={drug} />)}
                </div>
                {isFiltered && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8 flex-wrap">
                    <button
                      onClick={() => goToPage(Math.max(1, currentPage - 1))}
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
                            onClick={() => goToPage(p as number)}
                            className={`w-8 h-8 text-sm font-semibold rounded-lg cursor-pointer ${
                              p === currentPage ? 'bg-teal-500 text-white' : 'border border-gray-200 hover:bg-gray-50'
                            }`}
                          >{p}</button>
                        )
                      );
                    })()}
                    <button
                      onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
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
