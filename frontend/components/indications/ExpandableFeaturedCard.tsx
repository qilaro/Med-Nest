"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function ExpandableFeaturedCard({ name, slug, desc, highlighted }: { name: string; slug: string; desc: string; highlighted?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [clamped, setClamped] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      setClamped(textRef.current.scrollHeight > textRef.current.clientHeight);
    }
  }, []);

  return (
    <div className={`p-4 sm:p-5 rounded-xl border transition-colors ${highlighted ? "bg-teal-50 border-teal-300 ring-1 ring-teal-400" : "bg-gray-50 border-gray-100 hover:border-teal-200"}`}>
      <h3 className="text-[15px] sm:text-[17px] font-bold text-gray-900 mb-1.5">
        <Link href={`/indications/${slug}`} className="text-teal-700 hover:text-teal-800 hover:underline">
          {name}
        </Link>
      </h3>
      <div className="relative">
        <p
          ref={textRef}
          className={`text-[13px] sm:text-[14px] text-gray-600 leading-[1.6] ${expanded ? "" : "line-clamp-3 sm:line-clamp-none"}`}
        >
          {desc}
        </p>
        {clamped && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1 text-[12px] font-semibold text-teal-600 hover:text-teal-700 cursor-pointer bg-transparent border-0 p-0"
          >
            {expanded ? "View less ↑" : "View more →"}
          </button>
        )}
      </div>
    </div>
  );
}
