import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container-medq">
        <div className="flex items-center h-16 gap-4">
          <Link className="flex items-center gap-2 shrink-0" href="/">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5F8B8B, #3A6B6B)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                {/* Nest bowl */}
                <path d="M4 17c2.5-2.5 5.5-3.5 8-3.5s5.5 1 8 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="#FFFFFF20"/>
                <path d="M5.5 15.5c2-2 4.5-3 6.5-3s4.5 1 6.5 3" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
                {/* Pill resting in nest */}
                <rect x="8" y="9" width="8" height="5.5" rx="2.75" stroke="white" strokeWidth="1.8" fill="white" fillOpacity="0.15"/>
                <line x1="12" y1="9" x2="12" y2="14.5" stroke="white" strokeWidth="1" opacity="0.8"/>
              </svg>
            </div>
            <div className="leading-tight">
              <span className="text-2xl font-bold text-[--primary]">Med-Nest</span>
              <div className="text-xs text-gray-500 hidden sm:block">Learn more. Live better.</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-12">
            {[
              { name: 'Drugs A-Z', href: '/drugs', icon: 'M10.5 20.5 20.5 10.5a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z M8.5 8.5 15.5 15.5' },
              { name: 'Interactions', href: '#', icon: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z' },
              { name: 'Compare', href: '#', icon: 'M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z' },
              { name: 'AI Assistant', href: '#', icon: 'M12 8V4H8 M4 8h16v12H4z M2 14h2 M20 14h2 M15 13v2 M9 13v2' },
              { name: 'News', href: '#', icon: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z M14 2v4a2 2 0 0 0 2 2h4 M10 9H8 M16 13H8 M16 17H8' },
              { name: 'Bookmarks', href: '#', icon: 'm19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z' },
            ].map((item) => (
              <Link
                key={item.name}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-primary rounded-lg hover:bg-red-50 transition-colors font-medium"
                href={item.href}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d={item.icon}></path>
                </svg>
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3 ml-auto">
            <Link className="text-sm text-gray-600 hover:text-gray-800 transition-colors ml-10" href="#">
              Register
            </Link>
            <Link
              className="text-sm text-gray-700 hover:text-gray-900 border border-gray-300 px-4 py-1.5 rounded-lg font-medium transition-colors"
              href="#"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
