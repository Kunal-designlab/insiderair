"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// 1. AIRPORT DATABASE
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

// 2. COMPACT AUTOCOMPLETE
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
    if (value) setSearchTerm(`${value.city} (${value.code})`);
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

// 3. PASSENGER DROPDOWN
const PassengerDropdown = ({ adults, setAdults, childrenCount, setChildrenCount, infants, setInfants, disabled }) => {
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
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full text-left bg-transparent border-b-2 py-1 focus:outline-none font-bold text-sm flex items-center justify-between ${disabled ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-black focus:border-[#f5482b]'}`}
      >
        <span>{totalPassengers} Flyer{totalPassengers > 1 ? 's' : ''}</span>
        <span className="text-gray-400 text-xs">▼</span>
      </button>

      {isOpen && !disabled && (
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

// 4. DUMMY DATA 
const DUMMY_FLIGHTS = [
  { id: 1, airline: "Insider Air", flightNo: "IA-101", depTime: "04:30", arrTime: "08:30", price: "$250", type: "Direct", meals: true, baggage: "7kg Cabin, 20kg Check-in" },
  { id: 2, airline: "Partner Air", flightNo: "PA-205", depTime: "10:15", arrTime: "19:00", price: "$180", type: "Hop Flight", meals: false, baggage: "7kg Cabin", layover: "2h 00m", layoverCity: "Bangkok (BKK)", segments: [{ flightNo: "PA-205", depTime: "10:15", arrTime: "15:00" }, { flightNo: "PA-206", depTime: "17:00", arrTime: "19:00" }] },
  { id: 3, airline: "Insider Air", flightNo: "IA-992", depTime: "14:30", arrTime: "19:15", price: "$310", type: "Direct", meals: true, baggage: "7kg Cabin, 30kg Check-in" },
  { id: 4, airline: "Cloud Nine", flightNo: "CN-404", depTime: "21:45", arrTime: "01:20", price: "$195", type: "Hop Flight", meals: true, baggage: "7kg Cabin", layover: "1h 15m", layoverCity: "Kuala Lumpur (KUL)", segments: [{ flightNo: "CN-404", depTime: "21:45", arrTime: "23:15" }, { flightNo: "CN-405", depTime: "00:30", arrTime: "01:20" }] },
];

const TIME_SLOTS = ["00:00 - 06:00", "06:01 - 12:00", "12:01 - 18:00", "18:01 - 23:59"];
const STOP_TYPES = ["Direct", "Hop Flight"];

// 5. REUSABLE FLIGHT CARD COMPONENT
const FlightCard = ({ flight, isExpanded, onExpand, originCode, destCode, continueText, onContinue }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md border overflow-hidden transition-all ${isExpanded ? 'border-[#f5482b]' : 'border-gray-100 hover:border-[#f5482b]'}`}>
      <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 flex items-center justify-between w-full">
          <div className="text-center md:text-left">
            <div className="font-black text-2xl text-black">{flight.depTime}</div>
            <div className="text-xs text-gray-500 font-bold uppercase">{originCode}</div>
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
            <div className="text-xs text-gray-500 font-bold uppercase">{destCode}</div>
          </div>
        </div>
        <div className="flex flex-col items-center md:items-end w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
          <div className="font-black text-3xl text-[#f5482b] mb-3">{flight.price}</div>
          <button 
            onClick={onExpand} 
            className={`font-bold py-3 px-8 rounded-lg transition-colors w-full md:w-auto active:scale-95 ${isExpanded ? 'bg-[#f5482b] text-white shadow-lg' : 'bg-black hover:bg-gray-800 text-white'}`}
          >
            {isExpanded ? "Selected ✓" : "Select"}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="bg-gray-100 p-6 border-t border-gray-200">
          {flight.type === "Hop Flight" && flight.segments && (
            <div className="mb-6 bg-white rounded-lg border border-gray-200 p-5">
              <h4 className="text-xs font-black text-gray-500 uppercase tracking-wide mb-4">Connecting Flight Details</h4>
              <div className="flex justify-between items-center mb-1">
                <div className="w-16">
                  <div className="font-bold text-black">{flight.segments[0].depTime}</div>
                  <div className="text-xs text-gray-500 uppercase font-bold">{originCode}</div>
                </div>
                <div className="flex-1 px-4 flex flex-col items-center">
                  <div className="w-full h-[1px] border-t-2 border-dashed border-gray-200 relative">
                     <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-gray-400 text-[10px] font-bold tracking-wide">
                       ✈ {flight.segments[0].flightNo}
                     </span>
                  </div>
                </div>
                <div className="w-16 text-right">
                  <div className="font-bold text-black">{flight.segments[0].arrTime}</div>
                  <div className="text-xs text-gray-500 font-bold">{flight.layoverCity.split(' ')[0]}</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded py-2 text-center text-xs font-bold text-gray-500 my-4 border border-gray-100 uppercase tracking-wide">
                Layover: {flight.layover} in {flight.layoverCity}
              </div>
              <div className="flex justify-between items-center mt-1">
                <div className="w-16">
                  <div className="font-bold text-black">{flight.segments[1].depTime}</div>
                  <div className="text-xs text-gray-500 font-bold">{flight.layoverCity.split(' ')[0]}</div>
                </div>
                <div className="flex-1 px-4 flex flex-col items-center">
                  <div className="w-full h-[1px] border-t-2 border-dashed border-gray-200 relative">
                     <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-gray-400 text-[10px] font-bold tracking-wide">
                       ✈ {flight.segments[1].flightNo}
                     </span>
                  </div>
                </div>
                <div className="w-16 text-right">
                  <div className="font-bold text-black">{flight.segments[1].arrTime}</div>
                  <div className="text-xs text-gray-500 uppercase font-bold">{destCode}</div>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-black text-gray-800 uppercase tracking-wide text-xs">Baggage Allowance</span>
              <span className="text-black block mt-1 font-medium">{flight.baggage}</span>
            </div>
            <div>
              <span className="font-black text-gray-800 uppercase tracking-wide text-xs">In-Flight Meals</span>
              <span className="text-black block mt-1 font-medium">{flight.meals ? "Included" : "Not Included"}</span>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button 
              onClick={onContinue}
              className="bg-[#f5482b] hover:bg-[#d83c20] text-white font-black py-3 px-8 rounded-lg transition-colors shadow-lg active:scale-95 w-full md:w-auto"
            >
              {continueText}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 6. MAIN CONTENT COMPONENT
function ResultsContent() {
  const searchParams = useSearchParams();

  const [passengersConfirmed, setPassengersConfirmed] = useState(false);
  const [expandedOutbound, setExpandedOutbound] = useState(null);
  const [expandedReturn, setExpandedReturn] = useState(null);

  const [tripType, setTripType] = useState("return");
  const [fromAirport, setFromAirport] = useState(null);
  const [toAirport, setToAirport] = useState(null);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infants, setInfants] = useState(0);

  const [stopsFilter, setStopsFilter] = useState(STOP_TYPES);
  const [timeFilter, setTimeFilter] = useState(TIME_SLOTS);

  useEffect(() => {
    const fromCode = searchParams.get("from");
    const toCode = searchParams.get("to");
    const dep = searchParams.get("dep");
    const ret = searchParams.get("ret");
    const type = searchParams.get("type");

    if (type) setTripType(type);
    if (dep) setDepartureDate(dep);
    if (ret) setReturnDate(ret);
    
    // Setup States & DataLayer Push
    const foundFrom = AIRPORTS.find(a => a.code === fromCode);
    const foundTo = AIRPORTS.find(a => a.code === toCode);
    
    if (foundFrom) setFromAirport(foundFrom);
    if (foundTo) setToAirport(foundTo);

    // --- DATALAYER: Category Page View Event ---
    if (foundFrom && foundTo) {
      const flightType = type === "return" ? "RT" : "OW";
      const routeString = flightType === "RT" 
        ? `${foundFrom.code}-${foundTo.code}-${foundTo.code}-${foundFrom.code}` 
        : `${foundFrom.code}-${foundTo.code}`;

      // Create human readable and RFC dates from the URL 'dep' param
      let humanDate = "";
      let rfcDate = "";
      if (dep) {
        const [y, m, d] = dep.split('-');
        const dateObj = new Date(Date.UTC(y, m - 1, d));
        humanDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
        rfcDate = `${dep}T00:00:00Z`; // Defaulting to midnight for the general search
      }

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "category_page_view",
        destination_iata: foundTo.code,
        origin_iata: foundFrom.code,
        product_id: routeString,
        destination_city: foundTo.city,
        taxonomy: [routeString],
        origin_city: foundFrom.city,
        name: routeString,
        flight_type: flightType,
        departure_date: humanDate,
        departure_date_rfc: rfcDate
      });
      console.log("Fired GTM Category View:", routeString);
    }
  }, [searchParams]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd = String(tomorrow.getDate()).padStart(2, '0');
  const tomorrowStr = `${yyyy}-${mm}-${dd}`;

  const toggleStopFilter = (stopType) => setStopsFilter(prev => prev.includes(stopType) ? prev.filter(t => t !== stopType) : [...prev, stopType]);
  const toggleTimeFilter = (timeSlot) => setTimeFilter(prev => prev.includes(timeSlot) ? prev.filter(t => t !== timeSlot) : [...prev, timeSlot]);

  const filteredFlights = DUMMY_FLIGHTS.filter(flight => {
    const matchesStops = stopsFilter.includes(flight.type);
    const hour = parseInt(flight.depTime.split(":")[0], 10);
    let flightTimeSlot = "";
    if (hour >= 0 && hour <= 6) flightTimeSlot = "00:00 - 06:00";
    else if (hour > 6 && hour <= 12) flightTimeSlot = "06:01 - 12:00";
    else if (hour > 12 && hour <= 18) flightTimeSlot = "12:01 - 18:00";
    else flightTimeSlot = "18:01 - 23:59";
    const matchesTime = timeFilter.includes(flightTimeSlot);
    return matchesStops && matchesTime;
  });

  // --- NEW: DATALAYER PRODUCT PAGE VIEW EVENT ON SELECTION ---
  const handleExpandFlight = (flight, isReturnLeg) => {
    const isCurrentlyExpanded = isReturnLeg ? (expandedReturn === flight.id) : (expandedOutbound === flight.id);

    // 1. Define these OUTSIDE the if-block so both Add and Remove tracking can see them
    const originObj = isReturnLeg ? toAirport : fromAirport;
    const destObj = isReturnLeg ? fromAirport : toAirport;
    const legRouteString = `${originObj.code}-${destObj.code}`;
    const parsedPrice = parseFloat(flight.price.replace('$', ''));

    // 2. If we are OPENING/SELECTING the flight
    if (!isCurrentlyExpanded) {
      const flightDateStr = isReturnLeg ? returnDate : departureDate;
      const flightType = tripType === "return" ? "RT" : "OW";

      let humanDate = "";
      let rfcDate = "";

      if (flightDateStr) {
        const [y, m, d] = flightDateStr.split('-');
        const dateObj = new Date(Date.UTC(y, m - 1, d));
        humanDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

        const depTimeStr = flight.depTime || "00:00";
        rfcDate = `${flightDateStr}T${depTimeStr}:00Z`;
      }

      window.dataLayer = window.dataLayer || [];
      
      // A. PRODUCT PAGE VIEW
      window.dataLayer.push({
        event: "product_page_view",
        destination_iata: destObj.code,
        origin_iata: originObj.code,
        product_id: legRouteString,
        destination_city: destObj.city,
        taxonomy: [legRouteString],
        origin_city: originObj.city,
        name: legRouteString,
        flight_type: flightType,
        departure_date: humanDate,
        departure_date_rfc: rfcDate
      });

      // B. ADD TO CART
      window.dataLayer.push({
        event: "item_added_to_cart",
        action_type: "add_to_cart",
        product_id: legRouteString,
        name: legRouteString, 
        taxonomy: [legRouteString],
        price: parsedPrice,
        sale_price: parsedPrice,
        quantity: 1, 
        image_url: "https://insiderair.vercel.app/destinations/tokyo.png",
        url: window.location.href
      });

      console.log("Fired GTM: Product View & Add to Cart", legRouteString);
    } 
    // 3. If we are CLOSING/DESELECTING the flight
    else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "item_removed_from_cart",
        action_type: "remove_from_cart",
        product_id: legRouteString,
        name: legRouteString, 
        taxonomy: [legRouteString],
        price: parsedPrice,
        sale_price: parsedPrice,
        quantity: 1, 
        image_url: "https://insiderair.vercel.app/destinations/tokyo.png",
        url: window.location.href
      });
      
      console.log("Fired GTM: item_removed_from_cart", legRouteString);
    }

    // 4. Toggle the UI expansion safely
    if (isReturnLeg) {
      setExpandedReturn(isCurrentlyExpanded ? null : flight.id);
    } else {
      setExpandedOutbound(isCurrentlyExpanded ? null : flight.id);
    }
  };

  const handleCheckout = () => {
    if (tripType === "return" && (!expandedOutbound || !expandedReturn)) {
      alert("Almost there! Please make sure you have selected BOTH an Outbound and a Return flight.");
      return;
    }
    const queryParams = new URLSearchParams({ adults, children: childrenCount, infants }).toString();
    window.location.href = `/passenger-details?${queryParams}`;
  };

  const getContinueText = (isReturnLeg) => {
    if (tripType === "one-way") return "Continue to Passenger Details";
    if (isReturnLeg && !expandedOutbound) return "Select an Outbound Flight Above ↑";
    if (!isReturnLeg && !expandedReturn) return "Select a Return Flight Below ↓";
    return "Continue to Passenger Details";
  };

  const originCode = fromAirport ? fromAirport.code : "Origin";
  const destCode = toAirport ? toAirport.code : "Dest";

  return (
    <>
      {/* TOP SEARCH ENGINE BAR */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-[72px] z-40">
        <div className="max-w-6xl mx-auto p-4 md:p-5">
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="resTripType" value="return" checked={tripType === "return"} onChange={() => setTripType("return")} disabled={!passengersConfirmed} className="w-4 h-4 accent-[#f5482b] disabled:opacity-50" />
              <span className={`font-bold text-sm ${!passengersConfirmed ? 'text-gray-400' : 'text-black'}`}>Return</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="resTripType" value="one-way" checked={tripType === "one-way"} onChange={() => { setTripType("one-way"); setReturnDate(""); }} disabled={!passengersConfirmed} className="w-4 h-4 accent-[#f5482b] disabled:opacity-50" />
              <span className={`font-bold text-sm ${!passengersConfirmed ? 'text-gray-400' : 'text-black'}`}>One Way</span>
            </label>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex gap-4 w-full md:w-auto md:flex-1 opacity-100">
              <CompactAirportAutocomplete label="From" value={fromAirport} onChange={setFromAirport} excludeCode={toAirport?.code} />
              <CompactAirportAutocomplete label="To" value={toAirport} onChange={setToAirport} excludeCode={fromAirport?.code} />
            </div>
            <div className="flex gap-4 w-full md:w-auto md:flex-1">
              <div className="flex-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Departure</div>
                <input type="date" min={tomorrowStr} value={departureDate} onChange={(e) => { setDepartureDate(e.target.value); if (returnDate && e.target.value > returnDate) setReturnDate(""); }} disabled={!passengersConfirmed} className={`w-full bg-transparent border-b-2 py-1 text-sm font-bold ${!passengersConfirmed ? 'border-gray-100 text-gray-300' : 'border-gray-200 text-black focus:outline-none focus:border-[#f5482b]'}`} />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Return</div>
                <input type="date" min={departureDate || tomorrowStr} value={returnDate} onChange={(e) => setReturnDate(e.target.value)} disabled={tripType === "one-way" || !passengersConfirmed} className={`w-full bg-transparent border-b-2 py-1 text-sm font-bold ${tripType === "one-way" || !passengersConfirmed ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-black focus:outline-none focus:border-[#f5482b]'}`} />
              </div>
            </div>
            <div className="w-full md:w-auto md:min-w-[150px]">
              <PassengerDropdown adults={adults} setAdults={setAdults} childrenCount={childrenCount} setChildrenCount={setChildrenCount} infants={infants} setInfants={setInfants} disabled={!passengersConfirmed} />
            </div>
          </div>
        </div>
      </div>

      {/* CONDITIONAL RENDER: GATEKEEPER VS FLIGHTS */}
      {!passengersConfirmed ? (
        
        <div className="max-w-2xl mx-auto mt-12 md:mt-20 px-4">
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-black mb-2">Who is flying?</h2>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-wide mb-10">Confirm passenger count to unlock flights</p>
            
            <div className="flex flex-col gap-8 text-left mb-10 max-w-sm mx-auto">
              <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <div><div className="font-black text-black text-lg">Adults</div><div className="text-sm text-gray-400 font-bold">12+ years</div></div>
                <div className="flex items-center gap-4"><button disabled={adults <= 1} onClick={() => setAdults(adults - 1)} className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-black font-black text-xl disabled:opacity-30 hover:border-[#f5482b] hover:text-[#f5482b] transition-colors">-</button><span className="w-6 text-center font-black text-2xl text-black">{adults}</span><button disabled={adults + childrenCount + infants >= 20} onClick={() => setAdults(adults + 1)} className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-black font-black text-xl disabled:opacity-30 hover:border-[#f5482b] hover:text-[#f5482b] transition-colors">+</button></div>
              </div>
              <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <div><div className="font-black text-black text-lg">Children</div><div className="text-sm text-gray-400 font-bold">2-11 years</div></div>
                <div className="flex items-center gap-4"><button disabled={childrenCount <= 0} onClick={() => setChildrenCount(childrenCount - 1)} className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-black font-black text-xl disabled:opacity-30 hover:border-[#f5482b] hover:text-[#f5482b] transition-colors">-</button><span className="w-6 text-center font-black text-2xl text-black">{childrenCount}</span><button disabled={adults + childrenCount + infants >= 20} onClick={() => setChildrenCount(childrenCount + 1)} className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-black font-black text-xl disabled:opacity-30 hover:border-[#f5482b] hover:text-[#f5482b] transition-colors">+</button></div>
              </div>
              <div className="flex items-center justify-between">
                <div><div className="font-black text-black text-lg">Infants</div><div className="text-sm text-gray-400 font-bold">Under 2 years</div></div>
                <div className="flex items-center gap-4"><button disabled={infants <= 0} onClick={() => setInfants(infants - 1)} className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-black font-black text-xl disabled:opacity-30 hover:border-[#f5482b] hover:text-[#f5482b] transition-colors">-</button><span className="w-6 text-center font-black text-2xl text-black">{infants}</span><button disabled={adults + childrenCount + infants >= 20 || infants >= adults} onClick={() => setInfants(infants + 1)} className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-black font-black text-xl disabled:opacity-30 hover:border-[#f5482b] hover:text-[#f5482b] transition-colors">+</button></div>
              </div>
            </div>
            <button onClick={() => setPassengersConfirmed(true)} className="w-full bg-[#f5482b] hover:bg-[#d83c20] text-white font-black py-4 px-10 rounded-xl text-lg transition-colors shadow-lg active:scale-95">
              Unlock Flights
            </button>
          </div>
        </div>

      ) : (

        <div className="max-w-6xl mx-auto mt-8 px-4 flex flex-col md:flex-row gap-6 animate-fade-in">
          
          <aside className="w-full md:w-1/4 bg-white p-5 rounded-xl shadow-md border border-gray-100 h-fit sticky top-[250px]">
            <h3 className="font-black text-lg mb-4 text-black border-b border-gray-200 pb-2">Filters</h3>
            <div className="mb-6">
              <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Stops</h4>
              {STOP_TYPES.map((stop) => (
                <label key={stop} className="flex items-center gap-3 mb-3 cursor-pointer">
                  <input type="checkbox" checked={stopsFilter.includes(stop)} onChange={() => toggleStopFilter(stop)} className="w-5 h-5 accent-[#f5482b]" />
                  <span className="text-gray-800 font-medium text-sm">{stop}</span>
                </label>
              ))}
            </div>
            <div>
              <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Departure Time</h4>
              {TIME_SLOTS.map((time) => (
                <label key={time} className="flex items-center gap-3 mb-3 cursor-pointer">
                  <input type="checkbox" checked={timeFilter.includes(time)} onChange={() => toggleTimeFilter(time)} className="w-5 h-5 accent-[#f5482b]" />
                  <span className="text-gray-800 font-medium text-sm">{time}</span>
                </label>
              ))}
            </div>
          </aside>

          <section className="w-full md:w-3/4 flex flex-col gap-4">
            
            <div className="mb-2">
              <h2 className="text-2xl font-black text-black">Outbound Flights</h2>
              <p className="text-gray-500 font-bold uppercase text-xs mt-1">
                {fromAirport?.city || "Origin"} ➔ {toAirport?.city || "Destination"} | {departureDate || "Select Date"}
              </p>
            </div>
            
            {filteredFlights.length > 0 ? (
              filteredFlights.map((flight) => (
                <FlightCard 
                  key={`out-${flight.id}`} flight={flight} isExpanded={expandedOutbound === flight.id}
                  onExpand={() => handleExpandFlight(flight, false)}
                  originCode={originCode} destCode={destCode} continueText={getContinueText(false)} onContinue={handleCheckout}
                />
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500 font-medium">No outbound flights match your filters.</div>
            )}

            {tripType === "return" && (
              <div className="mt-8 pt-8 border-t-2 border-dashed border-gray-200 flex flex-col gap-4">
                <div className="mb-2">
                  <h2 className="text-2xl font-black text-black">Return Flights</h2>
                  <p className="text-gray-500 font-bold uppercase text-xs mt-1">
                    {toAirport?.city || "Destination"} ➔ {fromAirport?.city || "Origin"} | {returnDate || "Select Date"}
                  </p>
                </div>
                {filteredFlights.length > 0 ? (
                  filteredFlights.map((flight) => (
                    <FlightCard 
                      key={`ret-${flight.id}`} flight={flight} isExpanded={expandedReturn === flight.id}
                      onExpand={() => handleExpandFlight(flight, true)}
                      originCode={destCode} destCode={originCode} continueText={getContinueText(true)} onContinue={handleCheckout}
                    />
                  ))
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500 font-medium">No return flights match your filters.</div>
                )}
              </div>
            )}

          </section>
        </div>
      )}
    </>
  );
}

// 7. MAIN PAGE EXPORT WRAPPED IN SUSPENSE
export default function Results() {
  return (
    <main className="min-h-screen bg-gray-50 pb-10">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-2xl text-gray-400">Loading Search...</div>}>
        <ResultsContent />
      </Suspense>
    </main>
  );
}