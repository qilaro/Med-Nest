"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const TABS = ["Browse Trade", "Browse Generics", "Browse Class", "Dosage Form"];
const TYPE_ITEMS = [
  { name: "All", type: "" },
  { name: "Pharmaceutical", type: "allopathic" },
  { name: "Herbal", type: "herbal" },
  { name: "Unani", type: "unani" },
  { name: "Homeopathic", type: "homeopathic" },
  { name: "Ayurvedic", type: "ayurvedic" },
];
const BASE_PATHS: Record<string, string> = {
  "Browse Trade": "/drugs",
  "Browse Generics": "/generics",
  "Browse Class": "/class",
  "Dosage Form": "/dosage-forms",
};

function AZBrowseContent({ showTabs = true }: { showTabs?: boolean }) {
  const searchParams = useSearchParams();
  const currentLetter = searchParams.get("letter");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [expandedLetter, setExpandedLetter] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openDropdown && !expandedLetter) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setExpandedLetter(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openDropdown, expandedLetter]);

  return (
    <div className="w-full max-w-4xl my-8" ref={containerRef}>
      {showTabs && (
        <div className="flex justify-center items-center mb-6">
          <div className="flex gap-2 flex-wrap justify-center">
          {TABS.map((tab) => (
            <div key={tab} className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === tab ? null : tab)}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-colors cursor-pointer shadow-lg inline-flex items-center gap-1 ${
                  openDropdown === tab
                    ? "bg-[#0D261E] text-white"
                    : "bg-white text-blue-600 hover:bg-gray-100 border border-sky-200"
                }`}
              >
                {tab}
                <svg className={`transition-transform ${openDropdown === tab ? 'rotate-180' : ''}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              {openDropdown === tab && (
                <div className="absolute top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 left-1/2 -translate-x-1/2">
                  {TYPE_ITEMS.map((item) => {
                    const base = BASE_PATHS[tab];
                    return (
                      <Link
                        key={item.name}
                        href={item.type ? `${base}?type=${item.type}` : base}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 whitespace-nowrap"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          <Link
            href="/indications"
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-colors cursor-pointer shadow-lg bg-white text-blue-600 hover:bg-gray-100 border border-sky-200 inline-flex items-center"
          >
            Indications
          </Link>
        </div>
      </div>
      )}

      {/* A-Z Grid */}
      <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 shadow-sm">
        {expandedLetter ? (
          <div>
            <button
              onClick={() => setExpandedLetter(null)}
              className="flex items-center gap-1 text-sm text-teal-600 font-semibold mb-3 hover:text-teal-800 cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back
            </button>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(50px,1fr))] gap-2">
              {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((second) => (
                <Link
                  key={second}
                  href={`/drugs?letter=${expandedLetter}${second.toLowerCase()}`}
                  className={`flex items-center justify-center h-12 rounded-lg font-semibold border transition-all cursor-pointer ${
                    currentLetter === `${expandedLetter}${second.toLowerCase()}`
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-white text-teal-700 border-teal-200 hover:bg-teal-100 hover:border-teal-400 hover:text-teal-900"
                  }`}
                >
                  {expandedLetter}{second.toLowerCase()}
                </Link>
              ))}
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(50px,1fr))] gap-2">
          {LETTERS.map((letter) => (
            <button
              key={letter}
              onClick={() => setExpandedLetter(letter)}
              className={`flex items-center justify-center h-12 rounded-lg font-semibold border transition-all cursor-pointer ${
                currentLetter?.startsWith(letter)
                  ? "bg-primary text-white border-primary shadow-md"
                  : "bg-white text-teal-700 border-teal-200 hover:bg-teal-100 hover:border-teal-400 hover:text-teal-900"
              }`}
            >
              {letter}
            </button>
          ))}
          <Link
            href="/drugs?letter=0-9"
            className={`flex items-center justify-center h-12 rounded-lg font-semibold border transition-all cursor-pointer ${
              currentLetter === "0-9"
                ? "bg-primary text-white border-primary shadow-md"
                : "bg-white text-teal-700 border-teal-200 hover:bg-teal-100 hover:border-teal-400 hover:text-teal-900"
            }`}
          >
            0-9
          </Link>
        </div>
        )}
      </div>
    </div>
  );
}

export default function AZBrowse({ showTabs }: { showTabs?: boolean }) {
  return (
    <Suspense fallback={<div className="h-40 w-full animate-pulse bg-gray-100 rounded-2xl" />}>
      <AZBrowseContent showTabs={showTabs} />
    </Suspense>
  );
}
