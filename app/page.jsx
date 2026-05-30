"use client";
import { useState, useEffect, useRef } from "react";

// 1. TOP DESTINATION SLIDER DATA
const DESTINATIONS = [
  { id: 1, city: "Singapore", image: "/destinations/singapore.png" },
  { id: 2, city: "Tokyo", image: "/destinations/tokyo.png" },
  { id: 3, city: "Ho chi Minh", image: "/destinations/hochiminh.png" }
];

// 2. OUR AIRPORT DATABASE
const AIRPORTS = [
  { code: "HND", city: "Tokyo", country: "Japan" },
  { code: "KIX", city: "Osaka", country: "Japan" },
  { code: "MNL", city: "Manila", country: "Philippines" },
  { code: "CEB", city: "Cebu", country: "Philippines" }, // NEW
  // Malaysia
  { code: "KUL", city: "Kuala Lumpur", country: "Malaysia" },
  { code: "PEN", city: "Penang", country: "Malaysia" }, // NEW
  // Singapore
  { code: "SIN", city: "Singapore", country: "Singapore" },
  // Vietnam
  { code: "HAN", city: "Hanoi", country: "Vietnam" },
  { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" }, // NEW
  // Thailand
  { code: "BKK", city: "Bangkok", country: "Thailand" },
  { code: "CNX", city: "Chiang Mai", country: "Thailand" }, // NEW
  // South Korea
  { code: "ICN", city: "Seoul", country: "South Korea" },
  { code: "PUS", city: "Busan", country: "South Korea" }, // NEW
  // Taiwan
  { code: "TPE", city: "Taipei", country: "Taiwan" },
  // China
  { code: "PEK", city: "Beijing", country: "China" },
  // Indonesia
  { code: "CGK", city: "Jakarta", country: "Indonesia" },
  { code: "DPS", city: "Denpasar (Bali)", country: "Indonesia" },
  // Australia (NEW)
  { code: "SYD", city: "Sydney", country: "Australia" },
  { code: "MEL", city: "Melbourne", country: "Australia" },
  { code: "DEL", city: "New Delhi", country: "India" },
  { code: "BOM", city: "Mumbai", country: "India" },
];

// 3. SMART AUTOCOMPLETE (Now with Exclude Logic!)
const AirportAutocomplete = ({ label, placeholder, value, onChange, excludeCode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value ? `${value.city} (${value.code})` : "");
  const wrapperRef = useRef(null);

  // Filter airports, hiding the one that is currently excluded
  const filteredAirports = AIRPORTS.filter(
    (airport) =>
      airport.code !== excludeCode && // THIS PREVENTS DUPLICATE ORIGIN/DESTINATION
      (airport.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airport.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airport.country.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          onChange(null);
        }}
        onFocus={() => setIsOpen(true)}
        className="border-2 border-gray-200 p-3 md:p-4 rounded-lg focus:outline-none focus:border-[#f5482b] transition-colors text-black font-medium w-full"
      />
      
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
  
  // Search Form State
  const [fromAirport, setFromAirport] = useState(null);
  const [toAirport, setToAirport] = useState(null);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // Calculate Tomorrow's Date for the Minimum Departure Date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd = String(tomorrow.getDate()).padStart(2, '0');
  const tomorrowStr = `${yyyy}-${mm}-${dd}`;

  // Image Slider Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % DESTINATIONS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 pb-10">
  {/* HERO SLIDER */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden bg-gray-900">
        {DESTINATIONS.map((dest, index) => (
          <div
            key={dest.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* 1. The Physical Image */}
            <img 
              src={dest.image} 
              alt={dest.city} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* 2. The Dark Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            
            {/* 3. The City Text */}
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <h1 className="text-white text-4xl md:text-6xl lg:text-8xl font-black tracking-widest uppercase drop-shadow-2xl text-center z-10">
                {dest.city}
              </h1>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH FLIGHT FORM OVERLAY */}
      <div className="max-w-5xl mx-auto -mt-10 md:-mt-20 relative z-10 bg-white rounded-t-3xl md:rounded-xl shadow-2xl p-5 md:p-8 md:mx-4 mx-0 border border-gray-100">
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
              onChange={() => {
                setTripType("one-way");
                setReturnDate(""); // Clear return date if they switch to one-way
              }}
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
            excludeCode={toAirport?.code} // Don't show whatever is in 'To'
          />

          <AirportAutocomplete 
            label="To" 
            placeholder="Type city or code" 
            value={toAirport} 
            onChange={setToAirport} 
            excludeCode={fromAirport?.code} // Don't show whatever is in 'From'
          />

          <div className="flex flex-col">
            <label className="text-xs md:text-sm font-bold text-gray-500 mb-1 md:mb-2 uppercase">Departure</label>
            <input 
              type="date" 
              min={tomorrowStr} // Cannot be before tomorrow
              value={departureDate}
              onChange={(e) => {
                setDepartureDate(e.target.value);
                // If they change departure to a date AFTER their selected return date, reset the return date
                if (returnDate && e.target.value > returnDate) {
                  setReturnDate(""); 
                }
              }}
              className="border-2 border-gray-200 p-3 md:p-4 rounded-lg focus:outline-none focus:border-[#f5482b] transition-colors text-black font-medium w-full" 
            />
          </div>
          
          <div className="flex flex-col">
            <label className="text-xs md:text-sm font-bold text-gray-500 mb-1 md:mb-2 uppercase">Return</label>
            <input 
              type="date" 
              min={departureDate || tomorrowStr} // Cannot be before departure date
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              disabled={tripType === "one-way"} 
              className={`border-2 border-gray-200 p-3 md:p-4 rounded-lg transition-colors text-black font-medium w-full ${tripType === "one-way" ? "bg-gray-100 cursor-not-allowed opacity-50" : "focus:outline-none focus:border-[#f5482b]"}`} 
            />
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-6 md:mt-8 flex justify-end">
          <button 
            onClick={() => {
              if(!fromAirport || !toAirport || !departureDate || (tripType === "return" && !returnDate)) {
                alert("Please fill out all search fields before continuing.");
                return;
              }
              
              // 1. Bundle up the search data into a URL Query String
              const queryParams = new URLSearchParams({
                type: tripType,
                from: fromAirport.code,
                to: toAirport.code,
                dep: departureDate,
                ret: tripType === "return" ? returnDate : "",
              }).toString();
              
              // 2. Shoot the user over to the results page with the data attached!
              window.location.href = `/results?${queryParams}`;
            }}
            className="w-full md:w-auto bg-[#f5482b] hover:bg-[#d83c20] text-white font-black py-4 px-10 rounded-lg text-lg transition-colors shadow-lg active:scale-95"
          >
            Search Flights
          </button>
        </div>
      </div>
    </main>
  );
}