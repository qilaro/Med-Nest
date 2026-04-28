"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const TABS = ["Browse Drugs", "Conditions", "Symptoms"];

/**
 * AZBrowse Content Component
 */
function AZBrowseContent() {
  const searchParams = useSearchParams();
  const currentLetter = searchParams.get("letter");
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <div className="w-full max-w-4xl my-8">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
              activeTab === tab
                ? "bg-[#0D261E] text-white"
                : "bg-white text-blue-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* A-Z Grid */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(50px,1fr))] gap-2">
          {LETTERS.map((letter) => (
            <Link
              key={letter}
              href={`/drugs?letter=${letter}`}
              className={`flex items-center justify-center h-12 rounded-lg font-semibold border transition-all cursor-pointer ${
                currentLetter === letter
                  ? "bg-primary text-white border-primary shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
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
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
            }`}
          >
            0-9
          </Link>
          <Link
            href="#"
            className="flex items-center justify-center col-span-3 h-12 rounded-lg font-semibold bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all cursor-pointer px-4 whitespace-nowrap"
          >
            Advanced Search
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AZBrowse() {
  return (
    <Suspense fallback={<div className="h-40 w-full animate-pulse bg-gray-100 rounded-2xl" />}>
      <AZBrowseContent />
    </Suspense>
  );
}
