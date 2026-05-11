"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const TABS = ["Browse Trade", "Browse Generics", "Browse Class", "Dosage Form"];

function AZBrowseContent({ showAdvancedSearch = true }: { showAdvancedSearch?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLetter = searchParams.get("letter");
  const [activeTab, setActiveTab] = useState("");
  const [showTradeDropdown, setShowTradeDropdown] = useState(false);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setShowTradeDropdown(false);
    if (tab === "Browse Trade") {
      setShowTradeDropdown(true);
    } else if (tab === "Browse Generics") {
      router.push("/generics");
    } else if (tab === "Browse Class") {
      router.push("/class");
    } else if (tab === "Dosage Form") {
      router.push("/dosage-forms");
    }
  };

  return (
    <div className="w-full max-w-4xl my-8">
      {/* Tabs */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 flex-nowrap overflow-x-auto">
          {TABS.map((tab) =>
            tab === "Browse Trade" ? (
              <div key={tab} className="relative">
                <button
                  onClick={() => handleTabClick(tab)}
                  onBlur={() => setTimeout(() => setShowTradeDropdown(false), 200)}
                  className={`px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors cursor-pointer shadow-lg flex items-center gap-1.5 ${
                    showTradeDropdown
                      ? "bg-[#0D261E] text-white"
                      : "bg-white text-blue-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {tab}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                {showTradeDropdown && (
                  <div className="absolute top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[160px]">
                    <Link href="/drugs?type=allopathic" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors" onClick={() => setShowTradeDropdown(false)}>Pharmaceutical</Link>
                    <Link href="/drugs?type=herbal" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors" onClick={() => setShowTradeDropdown(false)}>Herbal / Traditional</Link>
                  </div>
                )}
              </div>
            ) : (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors cursor-pointer shadow-lg ${
                  activeTab === tab
                    ? "bg-[#0D261E] text-white"
                    : "bg-white text-blue-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {tab}
              </button>
            )
          )}
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
