"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const TABS = ["Browse Trade", "Browse Generics", "Browse Class", "Dosage Form"];
const TYPE_ITEMS = [
  { name: "All", href: "/drugs" },
  { name: "Pharmaceutical", href: "/drugs?type=allopathic" },
  { name: "Herbal", href: "/drugs?type=herbal" },
  { name: "Unani", href: "/drugs?type=unani" },
  { name: "Homeopathic", href: "/drugs?type=homeopathic" },
  { name: "Ayurvedic", href: "/drugs?type=ayurvedic" },
];

function AZBrowseContent({ showAdvancedSearch = true }: { showAdvancedSearch?: boolean }) {
  const searchParams = useSearchParams();
  const currentLetter = searchParams.get("letter");
  const [activeTab, setActiveTab] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <div className="w-full max-w-4xl my-8">
      {/* Tabs */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 flex-nowrap">
          {TABS.map((tab) => (
            <div key={tab} className="relative">
              <button
                onClick={() => { setActiveTab(tab); setOpenDropdown(openDropdown === tab ? null : tab); }}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors cursor-pointer shadow-lg inline-flex items-center gap-1 ${
                  openDropdown === tab
                    ? "bg-[#0D261E] text-white"
                    : "bg-white text-blue-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {tab}
                <svg className={`transition-transform ${openDropdown === tab ? 'rotate-180' : ''}`} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              {openDropdown === tab && (
                <div className="absolute top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 left-1/2 -translate-x-1/2">
                  {TYPE_ITEMS.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 whitespace-nowrap"
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
