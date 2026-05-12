"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const BOTTOM_TABS = [
  { name: 'Home', href: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Drugs', href: '/drugs', icon: 'M10.5 20.5 20.5 10.5a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z M8.5 8.5 15.5 15.5' },
  { name: 'Search', href: '/drugs', icon: 'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z', search: true },
  { name: 'AI', href: '#', icon: 'M12 8V4H8 M4 8h16v12H4z M2 14h2 M20 14h2 M15 13v2 M9 13v2' },
  { name: 'More', href: '#', icon: 'M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2z', more: true },
];

const MORE_ITEMS = [
  { name: 'Drug Interactions', href: '#', icon: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z' },
  { name: 'Compare Drugs', href: '#', icon: 'M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z' },
  { name: 'Health News', href: '#', icon: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z M14 2v4a2 2 0 0 0 2 2h4 M10 9H8 M16 13H8 M16 17H8' },
  { name: 'Bookmarks', href: '#', icon: 'm19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z' },
  { name: 'Register', href: '#', icon: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', accent: true },
  { name: 'Sign In', href: '#', icon: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M10 17l5-5-5-5 M15 12H3', filled: true },
];

const TabIcon = ({ d, className = "h-5 w-5" }: { d: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {d.split(' ').map((p, i) => <path key={i} d={p} />)}
  </svg>
);

const Header = () => {
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container-medq">
          <div className="flex items-center h-16 gap-4">
            <Link className="flex items-center gap-2 shrink-0" href="/">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
                <img src="/logo.svg" alt="Med-Nest" className="w-full h-full object-contain" />
              </div>
              <div className="leading-tight">
                <span className="text-2xl font-bold text-[--primary]">Med-Nest</span>
                <div className="text-xs text-gray-500 hidden sm:block">Learn more. Live better.</div>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 ml-12 flex-1">
              {[
                { name: 'Drugs A-Z', href: '/drugs', icon: 'M10.5 20.5 20.5 10.5a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z M8.5 8.5 15.5 15.5' },
                { name: 'Interactions', href: '#', icon: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z' },
                { name: 'Compare', href: '#', icon: 'M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z' },
                { name: 'AI Assistant', href: '#', icon: 'M12 8V4H8 M4 8h16v12H4z M2 14h2 M20 14h2 M15 13v2 M9 13v2' },
                { name: 'News', href: '#', icon: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z M14 2v4a2 2 0 0 0 2 2h4 M10 9H8 M16 13H8 M16 17H8' },
                { name: 'Bookmarks', href: '#', icon: 'm19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z' },
              ].map((item) => (
                <Link key={item.name} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-primary rounded-lg hover:bg-red-50 transition-colors font-medium" href={item.href}>
                  <TabIcon d={item.icon} className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Desktop auth */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <Link className="text-sm text-gray-600 hover:text-gray-800 transition-colors font-medium" href="#">Register</Link>
              <Link className="text-sm text-gray-700 hover:text-gray-900 border border-gray-300 px-4 py-1.5 rounded-lg font-semibold transition-colors" href="#">Sign in</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.07)] safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
          {BOTTOM_TABS.map((tab) => {
            const isActive = tab.search
              ? false
              : tab.more
              ? moreOpen
              : pathname === tab.href;
            const isSearch = tab.search;

            return isSearch ? (
              <Link
                key={tab.name}
                href={tab.href}
                className="relative -mt-3"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform">
                  <TabIcon d={tab.icon} className="h-5 w-5" />
                </div>
              </Link>
            ) : (
              <button
                key={tab.name}
                onClick={() => {
                  if (tab.more) { setMoreOpen(!moreOpen); return; }
                  setMoreOpen(false);
                  if (tab.href !== '#') router.push(tab.href);
                }}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${isActive ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <TabIcon d={tab.icon} className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className={`text-[10px] font-semibold ${isActive ? 'text-teal-600' : 'text-gray-400'}`}>{tab.name}</span>
                {isActive && <div className="absolute bottom-1 w-4 h-0.5 rounded-full bg-teal-500" />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* More Bottom Sheet */}
      {moreOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setMoreOpen(false)} />
          <div className="fixed bottom-16 left-0 right-0 z-50 lg:hidden animate-slide-up">
            <div className="bg-white rounded-t-2xl shadow-2xl border-t border-gray-100 pb-4 max-w-lg mx-auto">
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-gray-300" />
              </div>
              <div className="px-4 pb-3 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Menu</span>
              </div>
              <div className="px-2 pt-1 flex flex-col">
                {MORE_ITEMS.map((item) => (
                  item.filled ? (
                    <Link key={item.name} href={item.href} onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl mx-2 mt-2 transition-colors"
                    >
                      <TabIcon d={item.icon} className="h-4 w-4" />
                      {item.name}
                    </Link>
                  ) : (
                    <Link key={item.name} href={item.href} onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-colors ${item.accent ? 'text-teal-700 hover:bg-teal-50' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <span className={`${item.accent ? 'text-teal-500' : 'text-gray-400'}`}>
                        <TabIcon d={item.icon} className="h-4 w-4" />
                      </span>
                      {item.name}
                    </Link>
                  )
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;