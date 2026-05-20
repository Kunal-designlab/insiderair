"use client";
import { useState, useEffect, useRef } from "react";

// 1. TOP DESTINATION SLIDER DATA
const DESTINATIONS = [
  { id: 1, city: "Paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80" },
  { id: 2, city: "Tokyo", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80" },
  { id: 3, city: "New York", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1600&q=80" }
];

// 2. OUR NEW AIRPORT DATABASE
const AIRPORTS = [
  // India
  { code: "DEL", city: "New Delhi", country: "India" },
  { code: "BOM", city: "Mumbai", country: "India" },
  { code: "BLR", city: "Bengaluru", country: "India" },
  // Japan
  { code: "HND", city: "Tokyo", country: "Japan" },
  { code: "KIX", city: "Osaka", country: "Japan" },
  { code: "CTS", city: "Sapporo", country: "Japan" },
  // Philippines
  { code: "MNL", city: "Manila", country: "Philippines" },
  { code: "CEB", city: "Cebu", country: "Philippines" },
  { code: "KLO", city: "Kalibo (Boracay)", country: "Philippines" },
  // Malaysia
  { code: "KUL", city: "Kuala Lumpur", country: "Malaysia" },
  { code: "PEN", city: "Penang", country: "Malaysia" },
  { code: "LGK", city: "Langkawi", country: "Malaysia" },
  // Singapore
  { code: "SIN", city: "Singapore", country: "Singapore" },
  // Vietnam
  { code: "HAN", city: "Hanoi", country: "Vietnam" },
  { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
  { code: "DAD", city: "Da Nang", country: "Vietnam" },
  // Thailand
  { code: "BKK", city: "Bangkok", country: "Thailand" },
  { code: "HKT", city: "Phuket", country: "Thailand" },
  { code: "CNX", city: "Chiang Mai", country: "Thailand" },
  // South Korea
  { code: "ICN", city: "Seoul", country: "South Korea" },
  { code: "PUS", city: "Busan", country: "South Korea" },
  { code: "CJU", city: "Jeju", country: "South Korea" },
  // Taiwan
  { code: "TPE", city: "Taipei", country: "Taiwan" },
  { code: "KHH", city: "Kaohsiung", country: "Taiwan" },
  // China
  { code: "PEK", city: "Beijing", country: "China" },
  { code: "PVG", city: "Shanghai", country: "China" },
  { code: "CAN", city: "Guangzhou", country: "China" },
  // Indonesia
  { code: "CGK", city: "Jakarta", country: "Indonesia" },
  { code: "DPS", city: "Denpasar (Bali)", country: "Indonesia" },
  { code: "SUB", city: "Surabaya", country: "Indonesia" },
];

// 3. SMART AUTOCOMPLETE COMPONENT
const AirportAutocomplete = ({ label, placeholder, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value ? `${value.city} (${value.code})` : "");
  const wrapperRef = useRef(null);

  // Filter airports based on what the user types (checks city, code, or country)
  const filteredAirports = AIRPORTS.filter(
    (airport) =>
      airport.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airport.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airport.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown if user clicks outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        if (value) {
          setSearchTerm(`${value.city} (${value.code})`);
        } else {
          setSearchTerm("");
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  return (
    <div className="flex flex-col relative" ref={wrapperRef}>
      <label className="text-xs md:text-sm font-bold text-gray-500 mb-1 md:mb-2 uppercase">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
          onChange(null); // Clear actual selection while typing new search
        }}
        onFocus={() => setIsOpen(true)}
        className="border-2 border-gray-200 p-3 md:p-4 rounded-lg focus:outline-none focus:border-[#f5482b] transition-colors text-black font-medium w-full"
      />
      
      {/* DROPDOWN MENU */}
      {isOpen && (
        <ul className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {filteredAirports.length > 0 ? (
            filteredAirports.map((airport) => (
              <li
                key={airport.code}
                onClick={() => {
                  onChange(airport);
                  setSearchTerm(`${airport.city} (${airport.code})`);
                  setIsOpen(false);
                }}
                className="px-4 py-3 hover:bg-[#f5482b] hover:text-white cursor-pointer border-b border-gray-100 last:border-none transition-colors group"
              >
                <div className="font-bold text-black group-hover:text-white">{airport.city} ({airport.code})</div>
                <div className="text-xs text-gray-500 group-hover:text-gray-200">{airport.country}</div>
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-gray-500 text-sm">No airports found.</li>
          )}
        </ul>
      )}
    </div>
  );
};

// 4. MAIN PAGE COMPONENT
export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [tripType, setTripType] = useState("return");
  
  const [fromAirport, setFromAirport] = useState(null);
  const [toAirport, setToAirport] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % DESTINATIONS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 pb-10">
      {/* NAVIGATION BAR */}
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
          
          <AirportAutocomplete 
            label="From" 
            placeholder="Type city or code" 
            value={fromAirport} 
            onChange={setFromAirport} 
          />

          <AirportAutocomplete 
            label="To" 
            placeholder="Type city or code" 
            value={toAirport} 
            onChange={setToAirport} 
          />

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