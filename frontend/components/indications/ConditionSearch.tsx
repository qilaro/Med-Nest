"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const conditions = [
  { name: "Acne", slug: "acne" },
  { name: "Allergies", slug: "allergies" },
  { name: "Anemia", slug: "anemia" },
  { name: "Angina", slug: "angina" },
  { name: "Anxiety", slug: "anxiety" },
  { name: "Arthritis", slug: "arthritis" },
  { name: "Asthma", slug: "asthma" },
  { name: "Back Pain", slug: "back-pain" },
  { name: "Bacterial Infection", slug: "bacterial-infection" },
  { name: "Bronchitis", slug: "bronchitis" },
  { name: "Cancer", slug: "cancer" },
  { name: "Chickenpox", slug: "chickenpox" },
  { name: "Common Cold", slug: "common-cold" },
  { name: "Constipation", slug: "constipation" },
  { name: "COPD", slug: "copd" },
  { name: "Depression", slug: "depression" },
  { name: "Diabetes Type 1", slug: "diabetes-type-1" },
  { name: "Diabetes Type 2", slug: "diabetes-type-2" },
  { name: "Diarrhea", slug: "diarrhea" },
  { name: "Eczema", slug: "eczema" },
  { name: "Epilepsy", slug: "epilepsy" },
  { name: "Fever", slug: "fever" },
  { name: "Flu", slug: "flu" },
  { name: "Fungal Infection", slug: "fungal-infection" },
  { name: "GERD", slug: "gerd" },
  { name: "Glaucoma", slug: "glaucoma" },
  { name: "Gout", slug: "gout" },
  { name: "Headache", slug: "headache" },
  { name: "High Blood Pressure", slug: "high-blood-pressure" },
  { name: "High Cholesterol", slug: "high-cholesterol" },
  { name: "Insomnia", slug: "insomnia" },
  { name: "Malaria", slug: "malaria" },
  { name: "Migraine", slug: "migraine" },
  { name: "Nausea", slug: "nausea" },
  { name: "Osteoporosis", slug: "osteoporosis" },
  { name: "Pain", slug: "pain" },
  { name: "Pneumonia", slug: "pneumonia" },
  { name: "Psoriasis", slug: "psoriasis" },
  { name: "Sinusitis", slug: "sinusitis" },
  { name: "Tuberculosis", slug: "tuberculosis" },
  { name: "Thyroid Disorders", slug: "thyroid-disorders" },
  { name: "Ulcer", slug: "ulcer" },
  { name: "Urinary Tract Infection", slug: "uti" },
  { name: "Vitamin Deficiency", slug: "vitamin-deficiency" },
  { name: "Weight Loss", slug: "weight-loss" },
];

export default function ConditionSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof conditions>([]);
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setResults([]); setShow(false); return; }
    const filtered = conditions.filter(c => c.name.toLowerCase().includes(q)).slice(0, 8);
    setResults(filtered);
    setShow(filtered.length > 0);
  }, [query]);

  return (
    <div ref={ref} className="mb-8 relative">
      <form role="search" onSubmit={e => { e.preventDefault(); if (results.length > 0) { window.location.href = `/indications/${results[0].slug}`; } }}>
        <div className="flex items-stretch rounded-xl border-2 border-gray-200 bg-white focus-within:border-teal-400 transition-shadow duration-200 shadow-sm overflow-hidden">
          <div className="relative flex-1 min-w-0 flex items-center">
            <svg className="absolute left-4 h-5 w-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.34-4.34M11 5a6 6 0 100 12 6 6 0 000-12z"/></svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => {
                if (window.innerWidth < 1024) {
                  setTimeout(() => {
                    const rect = inputRef.current?.getBoundingClientRect();
                    if (rect) window.scrollBy({ top: rect.top - 80, behavior: 'smooth' });
                  }, 300);
                }
              }}
              placeholder="Search conditions..."
              className="w-full bg-transparent border-0 pl-12 pr-4 py-3.5 text-[15px] outline-none text-gray-800 placeholder:text-gray-400"
            />
          </div>
          <button type="submit" className="shrink-0 px-6 bg-teal-500 hover:bg-teal-600 text-white font-semibold text-[14px] transition-colors cursor-pointer flex items-center gap-2">
            Search
          </button>
        </div>
      </form>
      {show && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1.5 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[300px] overflow-y-auto">
          {results.map(c => (
            <Link key={c.slug} href={`/indications/${c.slug}`} className="block px-4 py-3 text-[14px] text-gray-700 hover:bg-teal-50 hover:text-teal-700 border-b border-gray-100 last:border-0 font-medium" onClick={() => { setShow(false); setQuery(""); }}>
              {c.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
