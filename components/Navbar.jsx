"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const authStatus = localStorage.getItem("isLoggedIn");
    if (authStatus === "true") setIsLoggedIn(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setShowDropdown(false);
    window.location.href = "/"; // Redirect to home
  };

  // Mock Login Function (Attach this to your actual login flow later)
  const handleMockLogin = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };

  return (
    <nav className="bg-black text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
      <Link href="/" className="font-black text-2xl tracking-tighter">
        INSIDER<span className="text-[#f5482b]">AIR</span>
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/" className="font-bold text-sm hover:text-[#f5482b] transition-colors hidden md:block">Flights</Link>
        <Link href="/destinations" className="font-bold text-sm hover:text-[#f5482b] transition-colors hidden md:block">Destinations</Link>
        
        {!isLoggedIn ? (
          <button 
            onClick={handleMockLogin} 
            className="bg-[#f5482b] hover:bg-[#d83c20] text-white font-bold py-2 px-6 rounded-full text-sm transition-colors"
          >
            Log In
          </button>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 rounded-full bg-[#f5482b] flex items-center justify-center font-black text-white hover:ring-4 ring-white/20 transition-all"
            >
              👤
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 text-left overflow-hidden">
                <Link 
                  href="/profile" 
                  onClick={() => setShowDropdown(false)}
                  className="block px-5 py-3 text-sm font-bold text-gray-700 hover:bg-red-50 hover:text-[#f5482b]"
                >
                  View Profile
                </Link>
                <Link 
                  href="/bookings" 
                  onClick={() => setShowDropdown(false)}
                  className="block px-5 py-3 text-sm font-bold text-gray-700 hover:bg-red-50 hover:text-[#f5482b]"
                >
                  View Bookings
                </Link>
                <div className="h-[1px] bg-gray-100 my-1"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-5 py-3 text-sm font-black text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}