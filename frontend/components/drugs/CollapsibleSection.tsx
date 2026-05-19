"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

export default function CollapsibleSection({ title, children, defaultOpen = false, icon }: { title: string; children: ReactNode; defaultOpen?: boolean; icon?: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showBtn, setShowBtn] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (el && el.scrollHeight > el.clientHeight + 2) {
      setShowBtn(true);
    }
  }, []);

  return (
    <div>
      <h2 className="text-[20px] lg:text-[21px] font-bold text-gray-900 mb-3 pl-3 relative before:absolute before:left-0 before:top-0.5 before:bottom-0.5 before:w-1 before:rounded-r before:bg-teal-500 flex items-center gap-2">{icon}{title}</h2>
      <div
        ref={contentRef}
        className={`text-[14px] lg:text-[15px] text-gray-700 leading-[1.55] overflow-hidden transition-all duration-300 ${open ? "" : "line-clamp-3"}`}
      >
        {children}
      </div>
      {showBtn && (
        <button
          onClick={() => setOpen(!open)}
          className="mt-1.5 text-[13px] lg:text-[14px] font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1 cursor-pointer"
        >
          {open ? "Show less" : "View more"}
          <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      )}
    </div>
  );
}
