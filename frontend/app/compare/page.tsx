"use client";

import { useState, useEffect, useRef } from "react";
import { drugService } from "@/lib/services/drugService";
import { DrugSummary } from "@/types/drug";

interface DrugInfo {
  brandName: string;
  slug: string;
  strength: string | null;
  dosageForm: string | null;
  company: string | null;
  unitPrice: number | null;
  stripPrice: number | null;
  boxPrice: number | null;
  rating: number | null;
  reviewCount: number;
  drugClass: string | null;
  genericName: string | null;
  indications: string | null;
  sideEffects: string | null;
  interactions: string | null;
  warnings: string | null;
  pregnancyCategory: string | null;
  halfLife: string | null;
  csaSchedule: string | null;
  alcoholWarning: string | null;
  medicineType: string | null;
  darNumber: string | null;
}

function TruncatedText({ text, maxLen = 120 }: { text: string | null | undefined; maxLen?: number }) {
  const [showAll, setShowAll] = useState(false);
  if (!text) return null;
  if (text.length <= maxLen) return <span className="text-[13px] sm:text-[14px] text-gray-700 leading-relaxed">{text}</span>;
  return (
    <div>
      <span className="text-[13px] sm:text-[14px] text-gray-700 leading-relaxed">{showAll ? text : text.slice(0, maxLen) + "..."}</span>
      <button onClick={() => setShowAll(!showAll)} className="block text-[11px] font-semibold text-teal-600 hover:text-teal-700 mt-0.5 cursor-pointer bg-transparent border-0 p-0">
        {showAll ? "View less ↑" : "View more →"}
      </button>
    </div>
  );
}

function SearchBox({ onSelect, placeholder, side }: { onSelect: (d: DrugSummary) => void; placeholder: string; side: "A" | "B" }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<DrugSummary[]>([]);
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const justSelected = useRef(false);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (justSelected.current) { justSelected.current = false; return; }
    if (!query.trim()) { setSuggestions([]); setShow(false); return; }
    const timer = setTimeout(async () => {
      try {
        const { results } = await drugService.searchDrugs(query.trim());
        setSuggestions(results.slice(0, 8));
        setShow(results.length > 0);
      } catch {}
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={ref} className="relative flex-1">
      <div className="flex items-stretch rounded-xl border-2 border-gray-200 bg-white focus-within:border-teal-400 transition-all overflow-hidden">
        <div className="relative flex items-center flex-1 min-w-0">
          <svg className="absolute left-3 h-4 w-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            ref={inputRef}
            type="text" value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (window.innerWidth < 1024) {
                setTimeout(() => {
                  const rect = ref.current?.getBoundingClientRect();
                  if (rect) window.scrollBy({ top: rect.top - 80, behavior: 'smooth' });
                }, 300);
              }
            }}
            placeholder={placeholder}
            className="w-full bg-transparent border-0 pl-9 pr-3 py-3 text-[14px] outline-none text-gray-800 placeholder:text-gray-400"
          />
        </div>
      </div>
      {show && suggestions.length > 0 && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[250px] overflow-y-auto">
          {suggestions.map((d) => (
            <button key={d.slug} type="button"
              onClick={() => { justSelected.current = true; setQuery(d.brandName); setShow(false); onSelect(d); }}
              className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-teal-50 hover:text-teal-700 border-b border-gray-100 last:border-0 font-medium cursor-pointer"
            >
              {d.brandName}
              {d.strength && <span className="text-gray-400 ml-1 text-[12px]">{d.strength}</span>}
              <span className="text-gray-400 text-[11px] ml-1">{d.company}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Section({ label, a }: { label: string; a: string | null | undefined }) {
  if (!a) return null;
  return (
    <tr className="border-b border-gray-50">
      <td className="py-2 px-3 sm:px-4 text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[70px] sm:w-[90px] align-top whitespace-nowrap">{label}</td>
      <td colSpan={2} className="py-2 pl-4 sm:pl-6 pr-3 sm:pr-4 align-top border-l border-gray-100">
        <TruncatedText text={a} />
      </td>
    </tr>
  );
}

function SideBySide({ label, a, b }: { label: string; a: string | null | undefined; b: string | null | undefined }) {
  if (!a && !b) return null;
  return (
    <tr className="border-b border-gray-50">
      <td className="py-2 px-3 sm:px-4 text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[70px] sm:w-[90px] align-top whitespace-nowrap">{label}</td>
      <td className="py-2 pl-4 sm:pl-6 pr-3 sm:pr-4 w-1/2 align-top border-l border-gray-100">{a ? <TruncatedText text={a} /> : <span className="text-gray-200 italic text-[13px]">—</span>}</td>
      <td className="py-2 pl-4 sm:pl-6 pr-3 sm:pr-4 w-1/2 align-top border-l border-gray-100 bg-gray-50/30">{b ? <TruncatedText text={b} /> : <span className="text-gray-200 italic text-[13px]">—</span>}</td>
    </tr>
  );
}

function GroupHeader({ label }: { label: string }) {
  return (
    <tr>
      <td colSpan={3} className="py-2 px-3 sm:px-4 text-[10px] font-bold text-teal-700 uppercase tracking-[0.15em] bg-teal-50/80 border-b border-teal-100">{label}</td>
    </tr>
  );
}

export default function ComparePage() {
  const [drugA, setDrugA] = useState<DrugInfo | null>(null);
  const [drugB, setDrugB] = useState<DrugInfo | null>(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  const fetchDrug = async (slug: string, side: "A" | "B") => {
    const setLoading = side === "A" ? setLoadingA : setLoadingB;
    const setData = side === "A" ? setDrugA : setDrugB;
    setLoading(true);
    try {
      const res = await fetch(`/api/compare?slug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        const data = await res.json();
        setData(data);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#c5e0db] via-[#d5e9e7] to-[#e5f2ef] min-h-screen">
      <div className="max-w-[1024px] mx-auto px-3 sm:px-0 py-6">
        <div className="bg-white rounded-2xl border border-sky-200 shadow-[8px_16px_40px_rgba(0,0,0,0.15),0_20px_60px_-12px_rgba(0,0,0,0.25)] p-6 sm:p-8">

          <h1 className="text-[28px] sm:text-[34px] font-bold text-gray-900 leading-tight mb-2">Compare Drugs</h1>
          <p className="text-[15px] text-gray-600 mb-6">Select two medications to compare their uses, ratings, pricing, side effects, and more side by side.</p>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <SearchBox onSelect={(d) => fetchDrug(d.slug, "A")} placeholder="First drug..." side="A" />
            <div className="flex items-center justify-center shrink-0">
              <span className="text-[13px] font-bold text-gray-400 px-2">vs</span>
            </div>
            <SearchBox onSelect={(d) => fetchDrug(d.slug, "B")} placeholder="Second drug..." side="B" />
          </div>

          {(drugA || drugB) && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-teal-500 to-teal-600">
                      <th className="py-3.5 px-3 sm:px-4 text-[10px] sm:text-[11px] font-bold text-white/80 uppercase tracking-wider text-left w-[70px] sm:w-[90px]">Field</th>
                      <th className="py-3.5 pl-4 sm:pl-6 pr-3 sm:pr-4 text-[14px] sm:text-[15px] font-bold text-white text-left w-1/2 border-l border-teal-400/30">
                        {drugA ? drugA.brandName : <span className="opacity-50">Select</span>}
                        {loadingA && <span className="ml-2 text-[11px] opacity-70">...</span>}
                      </th>
                      <th className="py-3.5 pl-4 sm:pl-6 pr-3 sm:pr-4 text-[14px] sm:text-[15px] font-bold text-white text-left w-1/2 border-l border-teal-400/30 bg-black/10">
                        {drugB ? drugB.brandName : <span className="opacity-50">Select</span>}
                        {loadingB && <span className="ml-2 text-[11px] opacity-70">...</span>}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <GroupHeader label="Basics" />
                    <SideBySide label="Generic" a={drugA?.genericName} b={drugB?.genericName} />
                    <SideBySide label="Company" a={drugA?.company} b={drugB?.company} />
                    <SideBySide label="Strength" a={drugA?.strength} b={drugB?.strength} />
                    <SideBySide label="Form" a={drugA?.dosageForm} b={drugB?.dosageForm} />
                    <SideBySide label="Class" a={drugA?.drugClass} b={drugB?.drugClass} />
                    <SideBySide label="Type" a={drugA?.medicineType} b={drugB?.medicineType} />

                    <GroupHeader label="Pricing &amp; Ratings" />
                    <SideBySide label="Rating" a={drugA?.rating ? `★ ${drugA.rating.toFixed(1)} (${drugA.reviewCount})` : null} b={drugB?.rating ? `★ ${drugB.rating.toFixed(1)} (${drugB.reviewCount})` : null} />
                    <SideBySide label="Unit" a={drugA?.unitPrice ? `৳${drugA.unitPrice.toFixed(2)}` : null} b={drugB?.unitPrice ? `৳${drugB.unitPrice.toFixed(2)}` : null} />
                    <SideBySide label="Strip" a={drugA?.stripPrice ? `৳${drugA.stripPrice.toFixed(2)}` : null} b={drugB?.stripPrice ? `৳${drugB.stripPrice.toFixed(2)}` : null} />
                    <SideBySide label="DAR" a={drugA?.darNumber} b={drugB?.darNumber} />

                    <GroupHeader label="Safety" />
                    <SideBySide label="Pregnancy" a={drugA?.pregnancyCategory ? `Cat ${drugA.pregnancyCategory}` : null} b={drugB?.pregnancyCategory ? `Cat ${drugB.pregnancyCategory}` : null} />
                    <SideBySide label="Half-Life" a={drugA?.halfLife} b={drugB?.halfLife} />
                    <SideBySide label="CSA" a={drugA?.csaSchedule} b={drugB?.csaSchedule} />
                    <SideBySide label="Alcohol" a={drugA?.alcoholWarning || null} b={drugB?.alcoholWarning || null} />

                    <GroupHeader label="Medical Info" />
                    <Section label="Uses" a={drugA?.indications || drugB?.indications} />
                    <Section label="Side Effects" a={drugA?.sideEffects || drugB?.sideEffects} />
                    <Section label="Interactions" a={drugA?.interactions || drugB?.interactions} />
                    <Section label="Warnings" a={drugA?.warnings || drugB?.warnings} />
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!drugA && !drugB && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border-2 border-teal-100 flex items-center justify-center mb-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <p className="text-[15px] text-gray-500 font-medium">Search and select two drugs above to compare side by side.</p>
            </div>
          )}

          <div className="mt-8 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-[13px] text-amber-800 leading-relaxed">
              <strong>⚠ Important:</strong> This comparison is for reference only. Always consult your healthcare provider before making any decisions about your medication.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
