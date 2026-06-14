"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [isMobileApp, setIsMobileApp] = useState(false);

  useEffect(() => {
    // Check if running in a client browser and looks for our custom mobile application tag
    if (typeof window !== "undefined" && navigator.userAgent.includes("InsiderAirMobileApp")) {
      setIsMobileApp(true);
    }
  }, []);

  // 💡 THE FIX: If true, instantly delete the footer from the screen layout inside the mobile application
  if (isMobileApp) return null;

  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t border-gray-900 mt-20">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Top Grid Area */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-gray-900">
          
          {/* Brand & App Download CTA Block */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h2 className="text-2xl font-black tracking-wider text-white uppercase">
              INSIDER<span className="text-[#f5482b]">AIR</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-sm font-medium leading-relaxed">
              Experience frictionless booking, live itinerary syncing, and elite rewards across your web and native mobile devices.
            </p>
            
            {/* Download Link Block */}
            <div className="mt-2">
              <a 
                href="https://expo.dev/artifacts/eas/dXuQbF2nMYXolxhbIYAI3IsGLJ8GPgvXzrYjt9GTjqI.apk" 
                download="InsiderAir.apk"
                className="inline-flex items-center gap-2 bg-[#f5482b] hover:bg-[#d83c20] text-white font-black text-xs uppercase tracking-wider py-3.5 px-6 rounded-lg transition-transform active:scale-95 shadow-lg"
              >
                <span>📥</span> Download Android App (APK)
              </a>
              <span className="block text-[10px] text-gray-500 font-bold uppercase mt-2 tracking-wide">
                *Sideload build version for certified internal flight testing
              </span>
            </div>
          </div>

          {/* Quick Airline Travel Utilities */}
          <div>
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Book & Manage</h4>
            <ul className="flex flex-col gap-2.5 text-sm font-bold text-gray-300">
              <li><Link href="/" className="hover:text-[#f5482b] transition-colors">Search Flights</Link></li>
              <li><Link href="/destinations" className="hover:text-[#f5482b] transition-colors">Explore Routes</Link></li>
              <li><Link href="#" className="hover:text-[#f5482b] transition-colors">Travel Requirements</Link></li>
            </ul>
          </div>

          {/* Corporate / Support Blocks */}
          <div>
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Support Center</h4>
            <ul className="flex flex-col gap-2.5 text-sm font-bold text-gray-300">
              <li><Link href="#" className="hover:text-[#f5482b] transition-colors">Help HelpDesk</Link></li>
              <li><Link href="#" className="hover:text-[#f5482b] transition-colors">Baggage Guidelines</Link></li>
              <li><Link href="#" className="hover:text-[#f5482b] transition-colors">Privacy Charter</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Meta Banner */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <div>&copy; {new Date().getFullYear()} Insider Air Inc. All Rights Reserved.</div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}