"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ALL_ITEMS: { group: string; items: { name: string; href: string; icon: string }[] }[] = [
  { group: 'Browse', items: [
    { name: 'Home', href: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Drugs Directory', href: '/drugs', icon: 'M10.5 20.5 20.5 10.5a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z M8.5 8.5 15.5 15.5' },
    { name: 'Interactions', href: '#', icon: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z' },
    { name: 'Compare', href: '#', icon: 'M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z' },
    { name: 'Indications', href: '/indications', icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2zm0 0 M9 12h6 M9 16h6' },
  ]},
  { group: 'Tools', items: [
    { name: 'AI Assistant', href: '#', icon: 'M12 8V4H8 M4 8h16v12H4z M2 14h2 M20 14h2 M15 13v2 M9 13v2' },
    { name: 'Health News', href: '#', icon: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z M14 2v4a2 2 0 0 0 2 2h4 M10 9H8 M16 13H8 M16 17H8' },
    { name: 'Bookmarks', href: '#', icon: 'm19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z' },
  ]},
];

const TabIcon = ({ d, className = "h-5 w-5" }: { d: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navExpanded, setNavExpanded] = useState(false);
  const [ripple, setRipple] = useState(false);
  const pathname = usePathname();

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleExpand = () => {
    setMenuOpen(false);
    setRipple(true);
    setTimeout(() => {
      setNavExpanded(true);
      setRipple(false);
    }, 150);
  };

  // Collapse expanded nav on scroll
  useEffect(() => {
    if (!navExpanded) return;
    let timer: ReturnType<typeof setTimeout>;
    const handler = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setNavExpanded(false), 150);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => {
      window.removeEventListener('scroll', handler);
      clearTimeout(timer);
    };
  }, [navExpanded]);

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
                { name: 'Drugs A-Z', href: '/drugs', icon: 'img' },
                { name: 'Interactions', href: '#', icon: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z' },
                { name: 'Compare', href: '#', icon: 'M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z' },
                { name: 'AI Assistant', href: '#', icon: 'M12 8V4H8 M4 8h16v12H4z M2 14h2 M20 14h2 M15 13v2 M9 13v2' },
                { name: 'News', href: '#', icon: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z M14 2v4a2 2 0 0 0 2 2h4 M10 9H8 M16 13H8 M16 17H8' },
                { name: 'Bookmarks', href: '#', icon: 'm19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z' },
              ].map((item) => (
                <Link key={item.name} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-primary rounded-lg hover:bg-red-50 transition-colors font-medium" href={item.href}>
                  {item.icon === 'img' ? (
                    <img src="/icons/medicine-9.svg" alt="" className="h-4 w-4" />
                  ) : (
                    <TabIcon d={item.icon} className="h-4 w-4" />
                  )}
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Desktop auth */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <Link className="text-sm text-gray-600 hover:text-gray-800 transition-colors font-medium" href="#">Register</Link>
              <Link className="text-sm text-gray-700 hover:text-gray-900 border border-gray-300 px-4 py-1.5 rounded-lg font-semibold transition-colors" href="#">Sign in</Link>
            </div>

            {/* Mobile: Register/Sign in */}
            <div className="flex lg:hidden items-center gap-2 ml-auto">
              <Link className="text-xs text-gray-600 hover:text-gray-800 font-medium shrink-0" href="#">Register</Link>
              <Link className="text-xs text-white bg-primary hover:bg-primary-dark px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors" href="#">Sign in</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile: 3D Ball — tap to expand */}
      <div className="fixed bottom-3 left-0 right-0 flex justify-center z-[60] lg:hidden">
        {/* Outside-tap overlay collapses pill */}
        <div
          className={`fixed inset-0 -z-10 transition-opacity duration-200 ${navExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setNavExpanded(false)}
        />

        <div className="relative flex flex-col items-center">
          {/* Expanded Pill Navbar */}
          <div className={`flex items-center gap-1 bg-white/95 border border-gray-200/70 rounded-2xl px-2 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 ease-[cubic-bezier(0.34,1.78,0.64,1)] overflow-hidden ${navExpanded ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-0 pointer-events-none'}`}>
            <Link
              href="/"
              style={{ animationDelay: '30ms' }}
              className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 transition-all duration-200 animate-stagger-in ${pathname === '/' ? 'bg-teal-50 text-teal-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            </Link>
            <Link
              href="/drugs"
              style={{ animationDelay: '60ms' }}
              className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 transition-all duration-200 animate-stagger-in ${pathname === '/drugs' ? 'bg-teal-50 text-teal-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
            >
              <img src="/icons/medicine-9.svg" alt="" className="h-5 w-5" />
            </Link>
            <div
              role="button"
              tabIndex={0}
              style={{ animationDelay: '90ms' }}
              onTouchEnd={(e) => { e.preventDefault(); setNavExpanded(false); setMenuOpen(v => !v); }}
              onClick={(e) => { e.preventDefault(); setNavExpanded(false); setMenuOpen(v => !v); }}
              className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0 bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-md cursor-pointer select-none touch-manipulation animate-stagger-in"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </div>
          </div>

          {/* Ripple burst */}
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${ripple ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`rounded-full border-2 border-teal-400/60 ${ripple ? 'animate-ripple-burst' : ''}`}
              style={{ width: '56px', height: '56px' }}
            />
          </div>

          {/* 3D Ball */}
          <button
            onClick={handleExpand}
            className={`relative flex items-center justify-center w-14 h-14 rounded-full cursor-pointer select-none touch-manipulation transition-all duration-300 ease-out active:scale-90 ${navExpanded ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100 pointer-events-auto'}`}
            aria-label="Open navigation"
          >
            <div className="absolute inset-0 rounded-full bg-teal-400/20 animate-pulse-slow" style={{ filter: 'blur(8px)', transform: 'scale(1.2)' }} />
            <div className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle at 35% 30%, #5EEAD4 0%, #0D9488 35%, #0F766E 65%, #0F5E58 100%)',
                boxShadow: '0 8px 28px -4px rgba(13,148,136,0.5), inset 0 -6px 12px rgba(0,0,0,0.3), inset 0 4px 8px rgba(255,255,255,0.25)',
              }}
            />
            <div className="absolute rounded-full pointer-events-none"
              style={{
                width: '65%', height: '40%', top: '14%', left: '17%',
                background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.1) 50%, transparent 70%)',
              }}
            />
            <div className="absolute rounded-full pointer-events-none"
              style={{
                width: '75%', height: '18%', bottom: '5%', left: '12%',
                background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.12) 0%, transparent 70%)',
              }}
            />
          </button>
        </div>
      </div>

      {/* Full-screen Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto pb-10 animate-slide-up">
            {/* Header with close button */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-xl z-10 border-b border-gray-100">
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Menu</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all active:scale-90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            <div className="px-5 pt-2 pb-2">
              {ALL_ITEMS.map((group, gi) => (
                <div key={group.group} className="mb-5">
                  <div className="flex items-center gap-3 mb-2.5 px-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{group.group}</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <div className="flex flex-col gap-1">
                    {group.items.map((item, ii) => {
                      const delay = gi * group.items.length + ii;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          style={{ animationDelay: `${delay * 35}ms` }}
                          className="group flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all duration-200 hover:bg-teal-50 hover:pl-4 animate-stagger-in"
                        >
                          <span className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-white group-hover:shadow-sm border border-gray-100 group-hover:border-teal-200 flex items-center justify-center text-gray-500 group-hover:text-teal-600 transition-all duration-200 shrink-0">
                            <TabIcon d={item.icon} className="h-5 w-5" />
                          </span>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800 group-hover:text-teal-700 transition-colors">{item.name}</span>
                            <span className="text-[11px] text-gray-400 group-hover:text-teal-400 transition-colors">
                              {item.href === '#' ? 'Coming soon' : 'Explore now'}
                            </span>
                          </div>
                          <svg className="w-4 h-4 text-gray-300 group-hover:text-teal-400 ml-auto transition-all duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </Link>
                      );
                    })}
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