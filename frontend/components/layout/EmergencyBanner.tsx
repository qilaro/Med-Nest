"use client";

import React, { useState } from 'react';

const EmergencyBanner = () => {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (dismissed) return null;

  return (
    <>
      {/* Desktop - full banner */}
      <div className="hidden sm:flex bg-gradient-to-r from-red-600 via-red-500 to-rose-600 text-white text-center relative z-50 shadow-md">
        <div className="flex items-center justify-center gap-2.5 py-2.5 px-10 text-sm w-full">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/20 animate-pulse shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
              <path d="M12 9v4"></path>
              <path d="M12 17h.01"></path>
            </svg>
          </span>
          <span className="font-semibold">Medical Emergency?</span>
          <span className="text-white/90">Call</span>
          <a href="tel:999" className="inline-flex items-center gap-1 bg-white text-red-600 font-bold px-3 py-0.5 rounded-full text-sm hover:bg-red-50 transition-colors" style={{ textDecoration: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            999
          </a>
          <span className="text-white/70 text-xs">Med-Nest provides information only, not emergency advice.</span>
          <button onClick={() => setDismissed(true)} className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors cursor-pointer" aria-label="Dismiss">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
          </button>
        </div>
      </div>

      {/* Mobile - collapsible tortoise banner */}
      <div className="sm:hidden">
        {/* Collapsed: thin red indicator bar */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full bg-gradient-to-r from-red-600 via-red-500 to-rose-600 text-white flex items-center justify-center gap-2 py-1.5 text-[11px] font-semibold cursor-pointer hover:from-red-700 hover:via-red-600 transition-all duration-200 z-50 shadow-sm"
          aria-label={expanded ? 'Hide emergency info' : 'Show emergency info'}
        >
          <span className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center animate-pulse shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
          </span>
          <span>Medical Emergency?</span>
          <span className="text-white/80">999</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-3 w-3 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
        </button>

        {/* Expanded content */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-600 text-white px-4 pb-3 pt-1">
            <div className="flex items-center justify-center gap-3 text-sm">
              <a href="tel:999" className="inline-flex items-center gap-1.5 bg-white text-red-600 font-bold px-4 py-2 rounded-full text-sm hover:bg-red-50 transition-colors shadow-md active:scale-95" style={{ textDecoration: 'none' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                Call 999
              </a>
              <span className="text-white/70 text-[11px] leading-tight max-w-[180px]">We provide info only, not emergency advice.</span>
              <button onClick={() => setDismissed(true)} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors cursor-pointer" aria-label="Dismiss permanently">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmergencyBanner;