"use client";

import Link from "next/link";

interface ClassCardProps {
  name: string;
  brandCount: number;
  genericCount: number;
  avgRating: number;
}

export default function ClassCard({ name, brandCount, genericCount, avgRating }: ClassCardProps) {
  const slug = encodeURIComponent(name);

  return (
    <div className="group relative h-full bg-white rounded-2xl border border-gray-200 hover:border-teal-300 shadow-sm hover:shadow-[0_12px_35px_-8px_rgba(0,0,0,0.12),0_4px_10px_-4px_rgba(0,150,136,0.15)] transition-all duration-300 hover:-translate-y-0.5 overflow-hidden before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-r before:bg-teal-500 before:opacity-0 before:transition-all before:duration-300 group-hover:before:opacity-100">
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-800 group-hover:text-teal-700 transition-colors text-lg leading-snug truncate" title={name}>
            {name}
          </h3>
          <span className="shrink-0 text-teal-600 mt-0.5" title="Verified class">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-3">
          <Link
            href={`/drugs?drug_class=${slug}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 hover:border-teal-300 transition-all group/link cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600 shrink-0">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            </svg>
            <span className="text-xs font-bold text-teal-700 group-hover/link:text-teal-800">
              {brandCount} brand{brandCount !== 1 ? 's' : ''}
            </span>
          </Link>

          <Link
            href={`/generics?class=${slug}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-300 transition-all group/link cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 shrink-0">
              <path d="M19.428 15.428a2 2 0 0 0-1.022-.547l-2.387-.477a6 6 0 0 0-3.86.517l-.318.158a6 6 0 0 1-3.86.517L6.05 15.21a2 2 0 0 0-1.806.547M8 4h8l-1 1v5.172a2 2 0 0 0 .586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 0 0 9 10.172V5L8 4z"/>
            </svg>
            <span className="text-xs font-bold text-amber-700 group-hover/link:text-amber-800">
              {genericCount} generic{genericCount !== 1 ? 's' : ''}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
