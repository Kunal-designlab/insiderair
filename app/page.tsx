"use client";
import { useState, useEffect } from "react";

// Dummy data for our top destination slider
const DESTINATIONS = [
  { id: 1, city: "Paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80" },
  { id: 2, city: "Tokyo", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80" },
  { id: 3, city: "New York", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1600&q=80" }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [tripType, setTripType] = useState("return");

  // Auto-slider effect that changes the image every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % DESTINATIONS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">
      {/* NAVIGATION BAR */}
      <nav className="bg-blue-900 text-white p-5 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          {/* LOGO IMAGE */}
          <img src="/logo.png" alt="Insider Air Logo" className="h-10 w-auto" />
          
          <div className="font-bold text-2xl tracking-wider">
            Insider Air
          </div>
        </div>
      </nav>

      {/* HERO SLIDER */}
      <div className="relative h-[60vh] w-full overflow-hidden">
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
            {/* Dark overlay to make text readable */}
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-white text-6xl md:text-8xl font-bold tracking-widest uppercase drop-shadow-2xl">
                {dest.city}
              </h1>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH FLIGHT FORM OVERLAY */}
      <div className="max-w-5xl mx-auto -mt-20 relative z-10 bg-white rounded-xl shadow-2xl p-8 mb-20 border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Where are we flying?</h2>
        
        {/* Trip Type Selector */}
        <div className="flex gap-6 mb-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="tripType" 
              value="return" 
              checked={tripType === "return"}
              onChange={() => setTripType("return")}
              className="w-5 h-5 accent-blue-600"
            />
            <span className="font-semibold text-gray-700 text-lg">Return</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="tripType" 
              value="one-way" 
              checked={tripType === "one-way"}
              onChange={() => setTripType("one-way")}
              className="w-5 h-5 accent-blue-600"
            />
            <span className="font-semibold text-gray-700 text-lg">One Way</span>
          </label>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col">
            <label className="text-sm font-bold text-gray-500 mb-2 uppercase">From</label>
            <input type="text" placeholder="Origin Airport" className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-blue-600 transition-colors text-black" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-bold text-gray-500 mb-2 uppercase">To</label>
            <input type="text" placeholder="Destination Airport" className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-blue-600 transition-colors text-black" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-bold text-gray-500 mb-2 uppercase">Departure</label>
            <input type="date" className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-blue-600 transition-colors text-black" />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-bold text-gray-500 mb-2 uppercase">Return</label>
            <input 
              type="date" 
              disabled={tripType === "one-way"} 
              className={`border-2 border-gray-200 p-4 rounded-lg transition-colors text-black ${tripType === "one-way" ? "bg-gray-100 cursor-not-allowed opacity-50" : "focus:outline-none focus:border-blue-600"}`} 
            />
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-8 flex justify-end">
          <button className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-4 px-10 rounded-lg text-lg transition-colors shadow-lg">
            Search Flights
          </button>
        </div>
      </div>
    </main>
  );
}