"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { getDosageIcon } from "@/components/dosage-icons";

type DosageForm = { name: string; count: number };

const TYPE_OPTIONS = [
  ["", "All Types"],
  ["allopathic", "Pharmaceutical"],
  ["herbal", "Herbal"],
  ["unani", "Unani"],
  ["homeopathic", "Homeopathic"],
  ["ayurvedic", "Ayurvedic"],
];

const TYPE_LABELS: Record<string, string> = {
  allopathic: "Pharmaceutical",
  herbal: "Herbal",
  unani: "Unani",
  homeopathic: "Homeopathic",
  ayurvedic: "Ayurvedic",
};

function DosageFormsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const typeFilter = searchParams.get("type") || "";

  const [forms, setForms] = useState<DosageForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(typeFilter);
  const [animatedCount, setAnimatedCount] = useState(0);
  const countAnimRef = useRef(0);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const from = countAnimRef.current;
    const to = totalResults;
    if (from === to) return;
    const duration = 300;
    const start = performance.now();
    const raf = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(from + (to - from) * progress);
      setAnimatedCount(current);
      if (progress < 1) requestAnimationFrame(raf);
      else countAnimRef.current = to;
    };
    requestAnimationFrame(raf);
  }, [totalResults]);

  useEffect(() => {
    setSelectedType(typeFilter);
  }, [typeFilter]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/dosage-forms${typeFilter ? `?medicine_type=${typeFilter}` : ""}`
        );
        const data = await res.json();
        setForms(data);
        setTotalResults(data.length || 0);
      } catch {
        setForms([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [typeFilter]);

  return (
    <div className="bg-gradient-to-b from-[#c5e0db] via-[#d5e9e7] to-[#e5f2ef] py-6 min-h-screen">
      <div className="max-w-[1024px] mx-auto px-3 sm:px-0">
        <div className="bg-white rounded-2xl border border-sky-200 shadow-[8px_16px_40px_rgba(0,0,0,0.15),0_20px_60px_-12px_rgba(0,0,0,0.25)] p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-navy mb-1">
              Dosage Forms
            </h1>
            <p className="text-sm text-gray-500">
              Browse all medication formats available in Bangladesh
            </p>
          </div>

          {/* Type Filter */}
          <div className="flex justify-center mb-8">
            <div className="relative inline-block">
              <select
                value={selectedType}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedType(val);
                  router.push(val ? `/dosage-forms?type=${val}` : "/dosage-forms");
                }}
                className="appearance-none rounded-full px-5 py-2 pr-8 text-sm font-semibold text-center shadow-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-300 border-2 bg-gray-50 text-gray-700 border-sky-200 hover:border-teal-400 hover:bg-teal-50 [&>option]:cursor-pointer min-w-[140px]"
              >
                {TYPE_OPTIONS.map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>

          {/* Results heading */}
          {!loading && forms.length > 0 && (
            <div className="flex items-center gap-2 mb-6 flex-wrap justify-center">
              <h2 className="text-base sm:text-lg font-bold text-navy">
                {typeFilter ? (
                  <>Showing <span className="text-teal-600">{animatedCount}</span> Dosage forms for <span className="text-teal-600">{TYPE_LABELS[typeFilter] || typeFilter}</span></>
                ) : (
                  <>All <span className="text-teal-600">{animatedCount}</span> dosage forms</>
                )}
              </h2>
              {typeFilter && (
                <button
                  onClick={() => router.push("/dosage-forms")}
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
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 animate-pulse">
                  <div className="w-14 h-14 bg-gray-200 rounded-2xl mx-auto mb-3" />
                  <div className="h-4 bg-gray-200 rounded-full w-3/4 mx-auto mb-2" />
                  <div className="h-3 bg-gray-100 rounded-full w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : forms.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg font-semibold">No dosage forms found</p>
              <p className="text-gray-400 text-sm mt-1">Try a different type filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {forms.map((form) => {
                const Icon = getDosageIcon(form.name);
                return (
                  <Link
                    key={form.name}
                    href={`/drugs?dosage_form=${encodeURIComponent(form.name)}`}
                    className="group relative flex flex-col items-center p-5 rounded-xl border-2 border-gray-100 bg-white hover:border-teal-300 hover:shadow-[0_8px_25px_-8px_rgba(0,0,0,0.1),0_4px_10px_-4px_rgba(0,150,136,0.12)] hover:-translate-y-1 transition-all duration-300 before:absolute before:inset-x-4 before:top-0 before:h-0.5 before:rounded-b before:bg-teal-500 before:opacity-0 before:transition-all before:duration-300 group-hover:before:opacity-100"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center text-teal-600 group-hover:from-teal-100 group-hover:to-teal-200 group-hover:text-teal-700 group-hover:shadow-md group-hover:scale-105 transition-all duration-300 mb-3">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 group-hover:text-teal-700 transition-colors text-center leading-snap line-clamp-2 mb-1.5">
                      {form.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 group-hover:bg-teal-100 group-hover:border-teal-300 transition-colors">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                      </svg>
                      {form.count} brand{form.count !== 1 ? "s" : ""}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DosageFormsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[1024px] mx-auto py-20 text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
      </div>
    }>
      <DosageFormsContent />
    </Suspense>
  );
}
