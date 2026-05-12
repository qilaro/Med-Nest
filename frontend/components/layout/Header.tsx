"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ALL_ITEMS: { group: string; items: { name: string; href: string; icon: string; accent?: boolean; filled?: boolean }[] }[] = [
  { group: 'Browse', items: [
    { name: 'Home', href: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Drugs Directory', href: '/drugs', icon: 'M10.5 20.5 20.5 10.5a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z M8.5 8.5 15.5 15.5' },
    { name: 'Interactions', href: '#', icon: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z' },
    { name: 'Compare', href: '#', icon: 'M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z' },
  ]},
  { group: 'Tools', items: [
    { name: 'AI Assistant', href: '#', icon: 'M12 8V4H8 M4 8h16v12H4z M2 14h2 M20 14h2 M15 13v2 M9 13v2' },
    { name: 'Health News', href: '#', icon: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z M14 2v4a2 2 0 0 0 2 2h4 M10 9H8 M16 13H8 M16 17H8' },
    { name: 'Bookmarks', href: '#', icon: 'm19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z' },
  ]},
  { group: 'Account', items: [
    { name: 'Register', href: '#', icon: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', accent: true },
    { name: 'Sign In', href: '#', icon: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4 M10 17l5-5-5-5 M15 12H3', filled: true },
  ]},
];

const TabIcon = ({ d, className = "h-5 w-5" }: { d: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {d.split(' ').map((p, i) => <path key={i} d={p} />)}
  </svg>
);

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

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
              {ALL_ITEMS.flatMap(g => g.items.filter(i => !i.accent && !i.filled)).map((item) => (
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

      {/* Mobile: Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] lg:hidden">
        <div className="flex items-center gap-1 bg-white/95 border border-gray-200/70 rounded-2xl px-2 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <Link href="/" className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 ${pathname === '/' ? 'bg-teal-50 text-teal-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          </Link>
          <Link href="/drugs" className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 ${pathname === '/drugs' ? 'bg-teal-50 text-teal-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M10.5 20.5 20.5 10.5a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z M8.5 8.5 15.5 15.5"/></svg>
          </Link>
          <div
            role="button"
            tabIndex={0}
            onTouchEnd={(e) => { e.preventDefault(); setMenuOpen(true); }}
            onClick={(e) => { e.preventDefault(); setMenuOpen(true); }}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 hover:from-teal-500 hover:to-teal-700 cursor-pointer select-none touch-manipulation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </div>
        </div>
      </div>

      {/* Full-screen Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-slide-up">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMenuOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto pb-8">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white z-10">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            <div className="px-5 pb-2">
              {/* Search bar at top of menu */}
              <Link href="/drugs" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm text-gray-400 hover:text-gray-600 hover:border-teal-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                Search medications...
              </Link>

              {/* Menu groups */}
              {ALL_ITEMS.map((group) => (
                <div key={group.group} className="mb-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">{group.group}</h3>
                  <div className="flex flex-col gap-0.5">
                    {group.items.map((item) => (
                      item.filled ? (
                        <Link key={item.name} href={item.href} onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3.5 px-4 py-3.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors"
                        >
                          <TabIcon d={item.icon} className="h-4 w-4" />
                          {item.name}
                        </Link>
                      ) : item.accent ? (
                        <Link key={item.name} href={item.href} onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3.5 px-4 py-3.5 text-sm font-medium text-teal-700 hover:bg-teal-50 rounded-xl transition-colors"
                        >
                          <span className="text-teal-500"><TabIcon d={item.icon} className="h-4 w-4" /></span>
                          {item.name}
                        </Link>
                      ) : (
                        <Link key={item.name} href={item.href} onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3.5 px-4 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                          <span className="text-gray-400"><TabIcon d={item.icon} className="h-4 w-4" /></span>
                          {item.name}
                        </Link>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;