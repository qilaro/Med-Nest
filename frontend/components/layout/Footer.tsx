import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="pt-12 pb-6 relative bg-gradient-to-b from-[#f6f9f8] to-white text-[#527a6d] border-t border-gray-100">
      <div className="max-w-[1024px] mx-auto px-4 sm:px-0">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link className="flex items-center gap-2 mb-4" href="/">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-gray-100">
                <img src="/logo.svg" alt="Med-Nest" className="w-full h-full object-contain" />
              </div>
              <div className="leading-tight">
                <span className="text-xl font-bold text-gray-900">Med-Nest</span>
                <div className="text-[11px] text-gray-400">Learn more. Live better.</div>
              </div>
            </Link>
            <p className="text-[13px] text-gray-500 leading-relaxed max-w-xs">
              Bangladesh&apos;s most comprehensive medicine information platform — trusted by patients and healthcare professionals.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <a href="tel:999" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red-50 border border-red-200 text-[12px] font-bold text-red-700 hover:bg-red-100 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Emergency: 999
              </a>
            </div>
          </div>

          {/* Drug Tools */}
          <div>
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-4">Drug Tools</h3>
            <ul className="space-y-2.5">
              <li><Link href="/drugs" className="text-[13px] text-gray-600 hover:text-teal-600 transition-colors font-medium">Drug Directory</Link></li>
              <li><Link href="/interactions" className="text-[13px] text-gray-600 hover:text-teal-600 transition-colors font-medium">Interaction Checker</Link></li>
              <li><Link href="/compare" className="text-[13px] text-gray-600 hover:text-teal-600 transition-colors font-medium">Compare Drugs</Link></li>
              <li><Link href="/dosage-forms" className="text-[13px] text-gray-600 hover:text-teal-600 transition-colors font-medium">Dosage Forms</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-4">Resources</h3>
            <ul className="space-y-2.5">
              <li><Link href="/ai-assistant" className="text-[13px] text-gray-600 hover:text-teal-600 transition-colors font-medium">AI Assistant</Link></li>
              <li><Link href="/news" className="text-[13px] text-gray-600 hover:text-teal-600 transition-colors font-medium">Health News</Link></li>
              <li><Link href="/indications" className="text-[13px] text-gray-600 hover:text-teal-600 transition-colors font-medium">Conditions</Link></li>
              <li><Link href="/companies" className="text-[13px] text-gray-600 hover:text-teal-600 transition-colors font-medium">Companies</Link></li>
            </ul>
          </div>

          {/* Generics + Class */}
          <div>
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-4">More</h3>
            <ul className="space-y-2.5">
              <li><Link href="/generics" className="text-[13px] text-gray-600 hover:text-teal-600 transition-colors font-medium">Generic Ingredients</Link></li>
              <li><Link href="/class" className="text-[13px] text-gray-600 hover:text-teal-600 transition-colors font-medium">Drug Classes</Link></li>
              <li><Link href="/drugs" className="text-[13px] text-gray-600 hover:text-teal-600 transition-colors font-medium">Drugs A-Z</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-gray-400">&copy; {new Date().getFullYear()} Med-Nest. All rights reserved.</p>
          <p className="text-[12px] text-gray-400">
            <span className="text-teal-500">♡</span> Made for better health in Bangladesh
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-[11px] text-gray-400 leading-relaxed text-center">
            Med-Nest provides information for educational purposes only. Always consult a qualified healthcare professional before making any medical decisions. In an emergency, call <strong className="text-gray-500">999</strong>.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
