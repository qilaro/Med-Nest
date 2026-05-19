"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const TABS = ["Browse Trade", "Browse Generics", "Browse Class", "Companies"];
const TYPE_ITEMS = [
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
  "Companies": "/companies",
};

function AZBrowseContent({ showTabs = true, simple }: { showTabs?: boolean; simple?: boolean }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const letterBase = pathname === '/' ? '/drugs' : pathname;
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
    <div className="w-full max-w-4xl my-8 mx-auto" ref={containerRef}>
      {showTabs && (
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2">
          {TABS.map((tab) => (
            <div key={tab} className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === tab ? null : tab)}
                className={`relative w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer shadow-md inline-flex items-center gap-1.5 justify-center overflow-hidden ${
                  openDropdown === tab
                    ? "bg-[#0D261E] text-white shadow-lg"
                    : "bg-white text-teal-700 border-2 border-teal-200 hover:border-teal-400 hover:shadow-[0_4px_14px_-4px_rgba(13,38,30,0.2)] hover:-translate-y-0.5 before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-r before:bg-teal-500 before:opacity-0 before:transition-all before:duration-200 hover:before:opacity-100 before:scale-y-0 hover:before:scale-y-100"
                }`}
              >
                {tab}
                <svg className={`transition-transform ${openDropdown === tab ? 'rotate-180' : ''}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              {openDropdown === tab && (
                <div className="absolute top-full mt-1.5 bg-white rounded-xl shadow-[0_8px_30px_-8px_rgba(0,0,0,0.2)] border border-teal-100 py-1 z-50 left-1/2 -translate-x-1/2 min-w-[140px] overflow-hidden">
                  {TYPE_ITEMS.map((item, idx) => {
                    const base = BASE_PATHS[tab];
                    return (
                      <Link
                        key={item.name}
                        href={item.type ? `${base}?type=${item.type}` : base}
                        className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 hover:pl-5 transition-all whitespace-nowrap border-b border-gray-50 last:border-0"
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
          </div>
        </div>
      )}

      {/* A-Z Grid */}
      <div className="bg-teal-50/50 p-3 sm:p-4 rounded-xl border border-teal-100 shadow-sm">
        {!simple && expandedLetter ? (
          <div>
            <button
              onClick={() => setExpandedLetter(null)}
              className="flex items-center gap-1 text-xs sm:text-sm text-teal-600 font-semibold mb-2 sm:mb-3 hover:text-teal-800 cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back
            </button>
            <div className="grid grid-cols-[repeat(9,1fr)] sm:grid-cols-[repeat(auto-fill,minmax(50px,1fr))] gap-1.5 sm:gap-2">
              {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((second) => (
                <Link
                  key={second}
                  href={`${letterBase}?letter=${expandedLetter}${second.toLowerCase()}`}
                  className={`flex items-center justify-center h-9 sm:h-12 rounded-lg font-semibold text-xs sm:text-sm border transition-all cursor-pointer ${
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
        <div className="grid grid-cols-[repeat(9,1fr)] sm:grid-cols-[repeat(auto-fill,minmax(50px,1fr))] gap-1.5 sm:gap-2">
          {LETTERS.map((letter) => {
            const href = simple ? `${letterBase}?letter=${letter}` : undefined;
            const isActive = simple ? currentLetter === letter : currentLetter?.startsWith(letter);
            return simple ? (
              <Link
                key={letter}
                href={href!}
                className={`flex items-center justify-center h-9 sm:h-12 rounded-lg font-semibold text-xs sm:text-sm border transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white text-teal-700 border-teal-200 hover:bg-teal-100 hover:border-teal-400 hover:text-teal-900"
                }`}
              >
                {letter}
              </Link>
            ) : (
              <button
                key={letter}
                onClick={() => setExpandedLetter(letter)}
                className={`flex items-center justify-center h-9 sm:h-12 rounded-lg font-semibold text-xs sm:text-sm border transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white text-teal-700 border-teal-200 hover:bg-teal-100 hover:border-teal-400 hover:text-teal-900"
                }`}
              >
                {letter}
              </button>
            );
          })}
          <Link
            href={`${letterBase}?letter=0-9`}
            className={`flex items-center justify-center h-9 sm:h-12 rounded-lg font-semibold text-xs sm:text-sm border transition-all cursor-pointer ${
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

export default function AZBrowse({ showTabs, simple }: { showTabs?: boolean; simple?: boolean }) {
  return (
    <Suspense fallback={<div className="h-40 w-full animate-pulse bg-gray-100 rounded-2xl" />}>
      <AZBrowseContent showTabs={showTabs} simple={simple} />
    </Suspense>
  );
}
