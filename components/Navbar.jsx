"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white text-black p-4 md:p-5 shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* LOGO & TITLE */}
        <Link href="/" className="flex items-center gap-3 md:gap-4 cursor-pointer">
          <img src="/logo.png" alt="Insider Air Logo" className="h-8 md:h-10 w-auto" />
          <div className="font-black text-xl md:text-2xl tracking-wider">INSIDER AIR</div>
        </Link>

        {/* LOGIN ICON */}
        <Link href="/login" className="flex items-center gap-2 hover:text-[#f5482b] transition-colors group">
          <div className="hidden md:block font-bold text-sm uppercase tracking-wide text-gray-600 group-hover:text-[#f5482b]">Login / Register</div>
          {/* SVG User Profile Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-black group-hover:text-[#f5482b] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </Link>

      </div>
    </nav>
  );
}