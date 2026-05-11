"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const TABS = [
  { label: "Browse Trade", items: [
    { name: "Pharmaceutical", href: "/drugs?type=allopathic" },
    { name: "Herbal / Traditional", href: "/drugs?type=herbal" },
  ]},
  { label: "Browse Generics", items: [
    { name: "All Generics", href: "/generics" },
    { name: "Allopathic Generics", href: "/generics?type=allopathic" },
    { name: "Herbal Generics", href: "/generics?type=herbal" },
  ]},
  { label: "Browse Class", items: [
    { name: "Drug Classes", href: "/class" },
  ]},
  { label: "Dosage Form", items: [
    { name: "Dosage Forms", href: "/dosage-forms" },
  ]},
];

function AZBrowseContent({ showAdvancedSearch = true }: { showAdvancedSearch?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLetter = searchParams.get("letter");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="w-full max-w-4xl my-8" ref={dropdownRef}>
      {/* Tabs */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 flex-wrap">
          {TABS.map((tab) => (
            <div key={tab.label} className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === tab.label ? null : tab.label)}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors cursor-pointer shadow-lg flex items-center gap-1 ${
                  openDropdown === tab.label
                    ? "bg-[#0D261E] text-white"
                    : "bg-white text-blue-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {tab.label}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              {openDropdown === tab.label && (
                <div className="absolute top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[180px]">
                  {tab.items.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                      onClick={() => setOpenDropdown(null)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {showAdvancedSearch && (
          <Link 
            href="/drugs"
            className="px-6 py-2.5 rounded-lg font-medium text-sm transition-colors cursor-pointer bg-white text-blue-600 hover:bg-gray-100 border border-gray-200"
          >
            Advanced Search
          </Link>
        )}
      </div>

      {/* A-Z Grid */}
      <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 shadow-sm">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(50px,1fr))] gap-2">
          {LETTERS.map((letter) => (
            <Link
              key={letter}
              href={`/drugs?letter=${letter}`}
              className={`flex items-center justify-center h-12 rounded-lg font-semibold border transition-all cursor-pointer ${
                currentLetter === letter
                  ? "bg-primary text-white border-primary shadow-md"
                  : "bg-white text-teal-700 border-teal-200 hover:bg-teal-100 hover:border-teal-400 hover:text-teal-900"
              }`}
            >
              {letter}
            </Link>
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
      </div>
    </div>
  );
}

export default function AZBrowse({ showAdvancedSearch }: { showAdvancedSearch?: boolean }) {
  return (
    <Suspense fallback={<div className="h-40 w-full animate-pulse bg-gray-100 rounded-2xl" />}>
      <AZBrowseContent showAdvancedSearch={showAdvancedSearch} />
    </Suspense>
  );
}
