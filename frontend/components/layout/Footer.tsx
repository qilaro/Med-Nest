"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Footer = () => {
  const pathname = usePathname();
  if (pathname === '/ai-assistant') return null;
  return (
    <footer className="relative bg-gradient-to-b from-[#0D261E] to-[#0a1f18] text-gray-300 overflow-hidden">
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />

      <div className="relative max-w-[1024px] mx-auto px-4 sm:px-0 pt-14 pb-8">
        {/* Top section */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand — spans 2 cols */}
          <div className="col-span-2">
            <Link className="flex items-center gap-3 mb-4" href="/">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-900/30">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div className="leading-tight">
                <span className="text-xl font-bold text-white">Med-Nest</span>
                <div className="text-[11px] text-teal-400/80 font-medium tracking-wider">Learn more. Live better.</div>
              </div>
            </Link>
            <p className="text-[13px] text-gray-400 leading-relaxed max-w-xs mb-5">
              Bangladesh&apos;s most comprehensive medicine information platform — trusted by patients and healthcare professionals nationwide.
            </p>
            <div className="flex items-center gap-3">
              <a href="tel:999" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-[12px] font-bold text-white hover:from-red-700 hover:to-red-600 transition-all shadow-lg shadow-red-900/30 hover:shadow-red-900/40 hover:-translate-y-0.5 active:scale-[0.97]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Emergency: 999
              </a>
            </div>
          </div>

          {/* Drug Tools */}
          <div>
            <h3 className="text-[11px] font-bold text-teal-400 uppercase tracking-[0.15em] mb-5">Drug Tools</h3>
            <ul className="space-y-3">
              <li><Link href="/drugs" className="text-[13px] text-gray-400 hover:text-teal-300 transition-colors font-medium flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-teal-500/50 group-hover:bg-teal-400 transition-colors" />Drug Directory</Link></li>
              <li><Link href="/interactions" className="text-[13px] text-gray-400 hover:text-teal-300 transition-colors font-medium flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-teal-500/50 group-hover:bg-teal-400 transition-colors" />Interaction Checker</Link></li>
              <li><Link href="/compare" className="text-[13px] text-gray-400 hover:text-teal-300 transition-colors font-medium flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-teal-500/50 group-hover:bg-teal-400 transition-colors" />Compare Drugs</Link></li>
              <li><Link href="/dosage-forms" className="text-[13px] text-gray-400 hover:text-teal-300 transition-colors font-medium flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-teal-500/50 group-hover:bg-teal-400 transition-colors" />Dosage Forms</Link></li>
              <li><Link href="/drugs" className="text-[13px] text-gray-400 hover:text-teal-300 transition-colors font-medium flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-teal-500/50 group-hover:bg-teal-400 transition-colors" />Drugs A-Z</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-[11px] font-bold text-teal-400 uppercase tracking-[0.15em] mb-5">Resources</h3>
            <ul className="space-y-3">
              <li><Link href="/ai-assistant" className="text-[13px] text-gray-400 hover:text-teal-300 transition-colors font-medium flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-teal-500/50 group-hover:bg-teal-400 transition-colors" />AI Assistant</Link></li>
              <li><Link href="/news" className="text-[13px] text-gray-400 hover:text-teal-300 transition-colors font-medium flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-teal-500/50 group-hover:bg-teal-400 transition-colors" />Health News</Link></li>
              <li><Link href="/indications" className="text-[13px] text-gray-400 hover:text-teal-300 transition-colors font-medium flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-teal-500/50 group-hover:bg-teal-400 transition-colors" />Conditions</Link></li>
              <li><Link href="/companies" className="text-[13px] text-gray-400 hover:text-teal-300 transition-colors font-medium flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-teal-500/50 group-hover:bg-teal-400 transition-colors" />Companies</Link></li>
            </ul>
          </div>

          {/* More */}
          <div>
            <h3 className="text-[11px] font-bold text-teal-400 uppercase tracking-[0.15em] mb-5">More</h3>
            <ul className="space-y-3">
              <li><Link href="/generics" className="text-[13px] text-gray-400 hover:text-teal-300 transition-colors font-medium flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-teal-500/50 group-hover:bg-teal-400 transition-colors" />Generic Ingredients</Link></li>
              <li><Link href="/class" className="text-[13px] text-gray-400 hover:text-teal-300 transition-colors font-medium flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-teal-500/50 group-hover:bg-teal-400 transition-colors" />Drug Classes</Link></li>
              <li><Link href="/dosage-forms" className="text-[13px] text-gray-400 hover:text-teal-300 transition-colors font-medium flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-teal-500/50 group-hover:bg-teal-400 transition-colors" />Dosage Forms</Link></li>
              <li><Link href="/drugs" className="text-[13px] text-gray-400 hover:text-teal-300 transition-colors font-medium flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-teal-500/50 group-hover:bg-teal-400 transition-colors" />Drugs A-Z</Link></li>
            </ul>
          </div>

          {/* Connect — new social column */}
          <div>
            <h3 className="text-[11px] font-bold text-teal-400 uppercase tracking-[0.15em] mb-5">Connect</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-[13px] text-gray-400 hover:text-teal-300 transition-colors font-medium flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-teal-500/50 group-hover:bg-teal-400 transition-colors" />Facebook</a></li>
              <li><a href="#" className="text-[13px] text-gray-400 hover:text-teal-300 transition-colors font-medium flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-teal-500/50 group-hover:bg-teal-400 transition-colors" />YouTube</a></li>
              <li><a href="#" className="text-[13px] text-gray-400 hover:text-teal-300 transition-colors font-medium flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-teal-500/50 group-hover:bg-teal-400 transition-colors" />Contact Us</a></li>
              <li><a href="#" className="text-[13px] text-gray-400 hover:text-teal-300 transition-colors font-medium flex items-center gap-2 group"><span className="w-1 h-1 rounded-full bg-teal-500/50 group-hover:bg-teal-400 transition-colors" />About Us</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-teal-900/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-gray-500">&copy; {new Date().getFullYear()} Med-Nest. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-gray-500">Made with</span>
            <span className="text-red-400 animate-pulse">&#9829;</span>
            <span className="text-[12px] text-gray-500">for better health in Bangladesh</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 pt-5 border-t border-teal-900/30">
          <p className="text-[11px] text-gray-600 leading-relaxed text-center">
            Med-Nest provides information for educational purposes only. Always consult a qualified healthcare professional before making any medical decisions. In an emergency, call <strong className="text-teal-400">999</strong>.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
