import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="py-12 relative bg-[#f6f9f8] text-[#527a6d]">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-[linear-gradient(90deg,transparent_0%,#3b82f6_50%,transparent_100%)]"></div>
      <div className="container-medq">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link className="flex items-center gap-2 mb-4" href="/">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="h-6 w-6 text-white" aria-hidden="true">
                  <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
                  <path d="m8.5 8.5 7 7"></path>
                </svg>
              </div>
              <span className="text-3xl font-bold text-navy">Med-Nest</span>
            </Link>
            <p className="leading-relaxed">
              Learn more. Live better. Your trusted source for comprehensive drug information and medication guidance.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-[#2f554b]">Drug Tools</h3>
            <div className="space-y-3">
              <Link href="#" className="block hover:opacity-80 transition-opacity">Drug Directory</Link>
              <Link href="#" className="block hover:opacity-80 transition-opacity">Interaction Checker</Link>
              <Link href="#" className="block hover:opacity-80 transition-opacity">Drug Comparison</Link>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-[#2f554b]">Resources</h3>
            <div className="space-y-3">
              <Link href="#" className="block hover:opacity-80 transition-opacity">AI Health Assistant</Link>
              <Link href="#" className="block hover:opacity-80 transition-opacity">Health News</Link>
              <Link href="#" className="block hover:opacity-80 transition-opacity">My Bookmarks</Link>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-[#2f554b]">Disclaimer</h3>
            <p className="leading-relaxed">
              Med-Nest provides information for educational purposes only. Always consult a qualified healthcare professional before making any medical decisions. In an emergency, call 911.
            </p>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-sm flex flex-col md:flex-row justify-between gap-4 border-[#e0ebe7]">
          <p>&copy; 2025 Med-Nest. All rights reserved.</p>
          <p>Made with <span className="text-primary">♡</span> for better health</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
