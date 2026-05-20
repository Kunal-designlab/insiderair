"use client";
import { useState, useEffect } from "react";

const DESTINATIONS = [
  { id: 1, city: "Paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80" },
  { id: 2, city: "Tokyo", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80" },
  { id: 3, city: "New York", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1600&q=80" }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [tripType, setTripType] = useState("return");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % DESTINATIONS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 pb-10">
      {/* NAVIGATION BAR - Now White with Black Text */}
      <nav className="bg-white text-black p-4 md:p-5 shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center gap-3 md:gap-4">
          <img src="/logo.png" alt="Insider Air Logo" className="h-8 md:h-10 w-auto" />
          <div className="font-black text-xl md:text-2xl tracking-wider">
            INSIDER AIR
          </div>
        </div>
      </nav>

      {/* HERO SLIDER */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        {DESTINATIONS.map((dest, index) => (
          <div
            key={dest.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${dest.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <h1 className="text-white text-4xl md:text-6xl lg:text-8xl font-black tracking-widest uppercase drop-shadow-2xl text-center">
                {dest.city}
              </h1>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH FLIGHT FORM OVERLAY */}
      <div className="max-w-5xl mx-auto -mt-10 md:-mt-20 relative z-10 bg-white rounded-t-3xl md:rounded-xl shadow-2xl p-5 md:p-8 mx-0 md:mx-4 border border-gray-100">
        <h2 className="text-2xl md:text-3xl font-black text-black mb-6 md:mb-8">Where are we flying?</h2>
        
        {/* Trip Type Selector */}
        <div className="flex gap-6 mb-6 md:mb-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="tripType" 
              value="return" 
              checked={tripType === "return"}
              onChange={() => setTripType("return")}
              className="w-5 h-5 accent-[#f5482b]"
            />
            <span className="font-bold text-black text-base md:text-lg">Return</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="tripType" 
              value="one-way" 
              checked={tripType === "one-way"}
              onChange={() => setTripType("one-way")}
              className="w-5 h-5 accent-[#f5482b]"
            />
            <span className="font-bold text-black text-base md:text-lg">One Way</span>
          </label>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="flex flex-col">
            <label className="text-xs md:text-sm font-bold text-gray-500 mb-1 md:mb-2 uppercase">From</label>
            <input type="text" placeholder="Origin Airport" className="border-2 border-gray-200 p-3 md:p-4 rounded-lg focus:outline-none focus:border-[#f5482b] transition-colors text-black font-medium w-full" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs md:text-sm font-bold text-gray-500 mb-1 md:mb-2 uppercase">To</label>
            <input type="text" placeholder="Destination Airport" className="border-2 border-gray-200 p-3 md:p-4 rounded-lg focus:outline-none focus:border-[#f5482b] transition-colors text-black font-medium w-full" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs md:text-sm font-bold text-gray-500 mb-1 md:mb-2 uppercase">Departure</label>
            <input type="date" className="border-2 border-gray-200 p-3 md:p-4 rounded-lg focus:outline-none focus:border-[#f5482b] transition-colors text-black font-medium w-full" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs md:text-sm font-bold text-gray-500 mb-1 md:mb-2 uppercase">Return</label>
            <input 
              type="date" 
              disabled={tripType === "one-way"} 
              className={`border-2 border-gray-200 p-3 md:p-4 rounded-lg transition-colors text-black font-medium w-full ${tripType === "one-way" ? "bg-gray-100 cursor-not-allowed opacity-50" : "focus:outline-none focus:border-[#f5482b]"}`} 
            />
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-6 md:mt-8 flex justify-end">
          <button className="w-full md:w-auto bg-[#f5482b] hover:bg-[#d83c20] text-white font-black py-4 px-10 rounded-lg text-lg transition-colors shadow-lg active:scale-95">
            Search Flights
          </button>
        </div>
      </div>
    </main>
  );
}