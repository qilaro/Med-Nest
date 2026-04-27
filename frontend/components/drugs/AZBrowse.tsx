"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * AZBrowse Component
 * Refined A-Z navigation with a solid, high-contrast professional aesthetic.
 */
export default function AZBrowse() {
  const searchParams = useSearchParams();
  const currentLetter = searchParams.get("letter");

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm shadow-gray-200/50 my-8">
      <h2 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-primary rounded-full" />
        Browse Medications A-Z
      </h2>
      <div className="flex flex-wrap gap-2">
        {LETTERS.map((letter) => (
          <Button
            key={letter}
            variant={currentLetter === letter ? "default" : "secondary"}
            className={`w-10 h-10 p-0 font-bold border transition-all duration-200 ${
              currentLetter === letter 
                ? "bg-primary hover:bg-primary-dark border-primary text-white shadow-md shadow-primary/20" 
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-primary hover:text-primary"
            }`}
            asChild
          >
            <Link href={`/drugs?letter=${letter}`}>{letter}</Link>
          </Button>
        ))}
        <Button
          variant={currentLetter === "0-9" ? "default" : "secondary"}
          className={`w-16 h-10 p-0 font-bold border transition-all duration-200 ${
            currentLetter === "0-9" 
              ? "bg-primary hover:bg-primary-dark border-primary text-white shadow-md shadow-primary/20" 
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-primary hover:text-primary"
          }`}
          asChild
        >
          <Link href="/drugs?letter=0-9">0-9</Link>
        </Button>
      </div>
    </div>
  );
}
