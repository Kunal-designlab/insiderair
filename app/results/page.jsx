"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// REUSED AIRPORT DATABASE
const AIRPORTS = [
  { code: "DEL", city: "New Delhi", country: "India" },
  { code: "BOM", city: "Mumbai", country: "India" },
  { code: "BLR", city: "Bengaluru", country: "India" },
  { code: "HND", city: "Tokyo", country: "Japan" },
  { code: "KIX", city: "Osaka", country: "Japan" },
  { code: "MNL", city: "Manila", country: "Philippines" },
  { code: "CEB", city: "Cebu", country: "Philippines" },
  { code: "KUL", city: "Kuala Lumpur", country: "Malaysia" },
  { code: "PEN", city: "Penang", country: "Malaysia" },
  { code: "SIN", city: "Singapore", country: "Singapore" },
  { code: "HAN", city: "Hanoi", country: "Vietnam" },
  { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
  { code: "BKK", city: "Bangkok", country: "Thailand" },
  { code: "CNX", city: "Chiang Mai", country: "Thailand" },
  { code: "ICN", city: "Seoul", country: "South Korea" },
  { code: "PUS", city: "Busan", country: "South Korea" },
  { code: "TPE", city: "Taipei", country: "Taiwan" },
  { code: "PEK", city: "Beijing", country: "China" },
  { code: "CGK", city: "Jakarta", country: "Indonesia" },
  { code: "DPS", city: "Denpasar (Bali)", country: "Indonesia" },
  { code: "SYD", city: "Sydney", country: "Australia" },
  { code: "MEL", city: "Melbourne", country: "Australia" },
];

const CompactAirportAutocomplete = ({ label, value, onChange, excludeCode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value ? `${value.city} (${value.code})` : "");
  const wrapperRef = useRef(null);

  const filteredAirports = AIRPORTS.filter(
    (airport) =>
      airport.code !== excludeCode &&
      (airport.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      airport.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    // Keep the search term synced if the value changes from the URL load
    if (value) {
      setSearchTerm(`${value.city} (${value.code})`);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        if (value) setSearchTerm(`${value.city} (${value.code})`);
        else setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  return (
    <div className="relative flex-1" ref={wrapperRef}>
      <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">{label}</div>
      <input
        type="text"
        placeholder="Select Airport"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsOpen(true);
          onChange(null);
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full bg-transparent border-b-2 border-gray-200 py-1 focus:outline-none focus:border-[#f5482b] text-black font-bold text-sm"
      />
      {isOpen && (
        <ul className="absolute z-50 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto left-0">
          {filteredAirports.map((airport) => (
            <li
              key={airport.code}
              onClick={() => {
                onChange(airport);
                setSearchTerm(`${airport.city} (${airport.code})`);
                setIsOpen(false);
              }}
              className="px-4 py-3 hover:bg-[#f5482b] hover:text-white cursor-pointer border-b border-gray-100 last:border-none group text-sm"
            >
              <div className="font-bold text-black group-hover:text-white">{airport.city} ({airport.code})</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const PassengerDropdown = ({ adults, setAdults, childrenCount, setChildrenCount, infants, setInfants }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const totalPassengers = adults + childrenCount + infants;
  const maxReached = totalPassengers >= 20;

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1" ref={wrapperRef}>
      <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Passengers</div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left bg-transparent border-b-2 border-gray-200 py-1 focus:outline-none focus:border-[#f5482b] text-black font-bold text-sm flex items-center justify-between"
      >
        <span>{totalPassengers} Flyer{totalPassengers > 1 ? 's' : ''}</span>
        <span className="text-gray-400 text-xs">▼</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 right-0 md:left-0 md:right-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-bold text-black text-sm">Adults</div>
              <div className="text-xs text-gray-400">12+ years</div>
            </div>
            <div className="flex items-center gap-3">
              <button disabled={adults <= 1} onClick={() => setAdults(adults - 1)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-black font-bold disabled:opacity-30 hover:border-[#f5482b] hover:text-[#f5482b]">-</button>
              <span className="w-4 text-center font-bold text-black">{adults}</span>
              <button disabled={maxReached} onClick={() => setAdults(adults + 1)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-black font-bold disabled:opacity-30 hover:border-[#f5482b] hover:text-[#f5482b]">+</button>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-bold text-black text-sm">Children</div>
              <div className="text-xs text-gray-400">2-11 years</div>
            </div>
            <div className="flex items-center gap-3">
              <button disabled={childrenCount <= 0} onClick={() => setChildrenCount(childrenCount - 1)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-black font-bold disabled:opacity-30 hover:border-[#f5482b] hover:text-[#f5482b]">-</button>
              <span className="w-4 text-center font-bold text-black">{childrenCount}</span>
              <button disabled={maxReached} onClick={() => setChildrenCount(childrenCount + 1)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-black font-bold disabled:opacity-30 hover:border-[#f5482b] hover:text-[#f5482b]">+</button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-black text-sm">Infants</div>
              <div className="text-xs text-gray-400">Under 2 years</div>
            </div>
            <div className="flex items-center gap-3">
              <button disabled={infants <= 0} onClick={() => setInfants(infants - 1)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-black font-bold disabled:opacity-30 hover:border-[#f5482b] hover:text-[#f5482b]">-</button>
              <span className="w-4 text-center font-bold text-black">{infants}</span>
              <button disabled={maxReached || infants >= adults} onClick={() => setInfants(infants + 1)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-black font-bold disabled:opacity-30 hover:border-[#f5482b] hover:text-[#f5482b]">+</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DUMMY_FLIGHTS = [
  { id: 1, airline: "Insider Air", flightNo: "IA-101", depTime: "08:00", arrTime: "11:30", price: "$250", type: "Single Hop", meals: true, baggage: "7kg Cabin, 20kg Check-in" },
  { id: 2, airline: "Partner Air", flightNo: "PA-205", depTime: "14:15", arrTime: "19:00", price: "$180", type: "Multi-hop", meals: false, baggage: "7kg Cabin, No Check-in" },
  { id: 3, airline: "Insider Air", flightNo: "IA-992", depTime: "22:30", arrTime: "02:15", price: "$310", type: "Single Hop", meals: true, baggage: "7kg Cabin, 30kg Check-in" }
];

// INNER CONTENT THAT READS THE URL
function ResultsContent() {
  const searchParams = useSearchParams();
  const [expandedFlight, setExpandedFlight] = useState(null);

  const [tripType, setTripType] = useState("return");
  const [fromAirport, setFromAirport] = useState(null);
  const [toAirport, setToAirport] = useState(null);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infants, setInfants] = useState(0);

  // Read URL parameters when the page loads!
  useEffect(() => {
    const fromCode = searchParams.get("from");
    const toCode = searchParams.get("to");
    const dep = searchParams.get("dep");
    const ret = searchParams.get("ret");
    const type = searchParams.get("type");

    if (type) setTripType(type);
    if (dep) setDepartureDate(dep);
    if (ret) setReturnDate(ret);
    
    if (fromCode) {
      const foundFrom = AIRPORTS.find(a => a.code === fromCode);
      if (foundFrom) setFromAirport(foundFrom);
    }
    if (toCode) {
      const foundTo = AIRPORTS.find(a => a.code === toCode);
      if (foundTo) setToAirport(foundTo);
    }
  }, [searchParams]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd = String(tomorrow.getDate()).padStart(2, '0');
  const tomorrowStr = `${yyyy}-${mm}-${dd}`;

  const handleSearch = () => {
    if(!fromAirport || !toAirport || !departureDate || (tripType === "return" && !returnDate)) {
      alert("Please fill out all search fields.");
      return;
    }
    alert("Searching for flights... (Database connection coming soon!)");
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-[72px] z-40">
        <div className="max-w-6xl mx-auto p-4 md:p-5">
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="resTripType" value="return" checked={tripType === "return"} onChange={() => setTripType("return")} className="w-4 h-4 accent-[#f5482b]" />
              <span className="font-bold text-black text-sm">Return</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="resTripType" value="one-way" checked={tripType === "one-way"} onChange={() => { setTripType("one-way"); setReturnDate(""); }} className="w-4 h-4 accent-[#f5482b]" />
              <span className="font-bold text-black text-sm">One Way</span>
            </label>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex gap-4 w-full md:w-auto md:flex-1">
              <CompactAirportAutocomplete label="From" value={fromAirport} onChange={setFromAirport} excludeCode={toAirport?.code} />
              <CompactAirportAutocomplete label="To" value={toAirport} onChange={setToAirport} excludeCode={fromAirport?.code} />
            </div>
            <div className="flex gap-4 w-full md:w-auto md:flex-1">
              <div className="flex-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Departure</div>
                <input type="date" min={tomorrowStr} value={departureDate} onChange={(e) => { setDepartureDate(e.target.value); if (returnDate && e.target.value > returnDate) setReturnDate(""); }} className="w-full bg-transparent border-b-2 border-gray-200 py-1 focus:outline-none focus:border-[#f5482b] text-black font-bold text-sm" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Return</div>
                <input type="date" min={departureDate || tomorrowStr} value={returnDate} onChange={(e) => setReturnDate(e.target.value)} disabled={tripType === "one-way"} className={`w-full bg-transparent border-b-2 py-1 text-sm font-bold ${tripType === "one-way" ? "border-gray-100 text-gray-300 cursor-not-allowed" : "border-gray-200 text-black focus:outline-none focus:border-[#f5482b]"}`} />
              </div>
            </div>
            <div className="w-full md:w-auto md:min-w-[150px]">
              <PassengerDropdown adults={adults} setAdults={setAdults} childrenCount={childrenCount} setChildrenCount={setChildrenCount} infants={infants} setInfants={setInfants} />
            </div>
            <button onClick={handleSearch} className="w-full md:w-auto bg-black hover:bg-gray-800 text-white font-black py-3 px-8 rounded-lg text-sm transition-colors active:scale-95 shadow-md">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 px-4 flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-1/4 bg-white p-5 rounded-xl shadow-md border border-gray-100 h-fit">
          <h3 className="font-black text-lg mb-4 text-black border-b border-gray-200 pb-2">Filters</h3>
          <div className="mb-6">
            <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Stops</h4>
            <label className="flex items-center gap-3 mb-3 cursor-pointer"><input type="checkbox" className="w-5 h-5 accent-[#f5482b]" defaultChecked /><span className="text-gray-800 font-medium text-sm">Single Hop (Direct)</span></label>
            <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" className="w-5 h-5 accent-[#f5482b]" defaultChecked /><span className="text-gray-800 font-medium text-sm">Multi-hop</span></label>
          </div>
        </aside>

        <section className="w-full md:w-3/4 flex flex-col gap-4">
          <h2 className="text-2xl font-black text-black mb-2">Available Flights</h2>
          {DUMMY_FLIGHTS.map((flight) => (
            <div key={flight.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all hover:border-[#f5482b]">
              <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 flex items-center justify-between w-full">
                  <div className="text-center md:text-left">
                    <div className="font-black text-2xl text-black">{flight.depTime}</div>
                    <div className="text-xs text-gray-500 font-bold uppercase">{fromAirport ? fromAirport.code : "Origin"}</div>
                  </div>
                  <div className="flex-1 px-4 flex flex-col items-center">
                    <div className="text-xs text-gray-400 font-bold mb-1">{flight.type}</div>
                    <div className="w-full h-[2px] bg-gray-200 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[#f5482b] text-lg">✈</div>
                    </div>
                    <div className="text-xs text-gray-400 font-bold mt-1">{flight.airline} ({flight.flightNo})</div>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="font-black text-2xl text-black">{flight.arrTime}</div>
                    <div className="text-xs text-gray-500 font-bold uppercase">{toAirport ? toAirport.code : "Dest"}</div>
                  </div>
                </div>
                <div className="flex flex-col items-center md:items-end w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  <div className="font-black text-3xl text-[#f5482b] mb-3">{flight.price}</div>
                  <button onClick={() => setExpandedFlight(expandedFlight === flight.id ? null : flight.id)} className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg transition-colors w-full md:w-auto active:scale-95">Select</button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

// MAIN PAGE EXPORT WRAPPED IN SUSPENSE FOR VERCEL
export default function Results() {
  return (
    <main className="min-h-screen bg-gray-50 pb-10">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-2xl text-gray-400">Loading Search...</div>}>
        <ResultsContent />
      </Suspense>
    </main>
  );
}