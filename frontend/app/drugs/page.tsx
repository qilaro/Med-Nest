"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, Pill, Loader2 } from "lucide-react";
import { drugService, DrugsResponse } from "@/lib/services/drugService";
import { DrugClass, DrugSummary } from "@/types/drug";
import DrugCard from "@/components/drugs/DrugCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * The core content of the Drugs page.
 * Wrapped in Suspense to handle URL search parameters correctly in Next.js.
 */
function DrugsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get current filters from URL
  const searchQ = searchParams.get("search") || "";
  const drugClassFilter = searchParams.get("drug_class") || "";

  const [drugs, setDrugs] = useState<DrugSummary[]>([]);
  const [classes, setClasses] = useState<DrugClass[]>([]);
  const [query, setQuery] = useState(searchQ);
  const [selectedClass, setSelectedClass] = useState(drugClassFilter);
  const [loading, setLoading] = useState(true);

  // Fetch data when filters change
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [drugsData, classesData] = await Promise.all([
          drugService.getDrugs({ 
            drug_class: drugClassFilter || undefined 
          }),
          drugService.getDrugClasses()
        ]);

        let filteredDrugs = drugsData.drugs;
        
        // Local filtering for search (Standard for MVP)
        if (searchQ) {
          filteredDrugs = filteredDrugs.filter(
            (dr) =>
              dr.brandName.toLowerCase().includes(searchQ.toLowerCase()) ||
              dr.genericName.toLowerCase().includes(searchQ.toLowerCase())
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
  }, [searchQ, drugClassFilter]);

  // Update URL when search form is submitted
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (selectedClass) params.set("drug_class", selectedClass);
    router.push(`/drugs?${params.toString()}`);
  };

  return (
    <div className="container-medq py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">Drug Directory</h1>
        <p className="text-muted-foreground">
          Browse our complete database of medications, verified by pharmacists.
        </p>
      </header>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-4 mb-10 items-end">
        <div className="flex-1 min-w-[280px] space-y-2">
          <label className="text-sm font-semibold text-navy ml-1">Search Medication</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Paracetamol, Nexium..."
              className="pl-10 h-12"
            />
          </div>
        </div>

        <div className="min-w-[200px] space-y-2">
          <label className="text-sm font-semibold text-navy ml-1">Drug Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" className="h-12 px-8 bg-primary hover:bg-primary-dark">
          Find Medicine
        </Button>

        {(searchQ || drugClassFilter) && (
          <Button 
            variant="ghost" 
            onClick={() => {
              setQuery("");
              setSelectedClass("");
              router.push("/drugs");
            }}
            className="h-12 text-muted-foreground hover:text-primary"
          >
            Clear Filters
          </Button>
        )}
      </form>

      {/* Results Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p>Scanning medical database...</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-medium text-muted-foreground">
              Showing <span className="text-navy">{drugs.length}</span> results
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {drugs.map((drug) => (
              <DrugCard key={drug.id} drug={drug} />
            ))}
          </div>

          {drugs.length === 0 && (
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
