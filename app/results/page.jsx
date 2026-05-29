"use client";
import { useState } from "react";
import Link from "next/link";

// DUMMY FLIGHT DATA
const DUMMY_FLIGHTS = [
  { id: 1, airline: "Insider Air", flightNo: "IA-101", depTime: "08:00", arrTime: "11:30", price: "$250", type: "Single Hop", meals: true, baggage: "7kg Cabin, 20kg Check-in" },
  { id: 2, airline: "Partner Air", flightNo: "PA-205", depTime: "14:15", arrTime: "19:00", price: "$180", type: "Multi-hop", meals: false, baggage: "7kg Cabin, No Check-in" },
  { id: 3, airline: "Insider Air", flightNo: "IA-992", depTime: "22:30", arrTime: "02:15", price: "$310", type: "Single Hop", meals: true, baggage: "7kg Cabin, 30kg Check-in" }
];

export default function Results() {
  // State to track which flight's details are currently expanded
  const [expandedFlight, setExpandedFlight] = useState(null);

  return (
    <main className="min-h-screen bg-gray-50 pb-10">

      <div className="max-w-6xl mx-auto mt-8 px-4 flex flex-col md:flex-row gap-6">
        
        {/* LEFT SIDEBAR: FILTERS */}
        <aside className="w-full md:w-1/4 bg-white p-5 rounded-xl shadow-md border border-gray-100 h-fit">
          <h3 className="font-black text-lg mb-4 text-black border-b border-gray-200 pb-2">Filters</h3>

          {/* Hop Filter */}
          <div className="mb-6">
            <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Stops</h4>
            <label className="flex items-center gap-3 mb-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 accent-[#f5482b]" defaultChecked />
              <span className="text-gray-800 font-medium text-sm">Single Hop (Direct)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 accent-[#f5482b]" defaultChecked />
              <span className="text-gray-800 font-medium text-sm">Multi-hop</span>
            </label>
          </div>

          {/* Meals Filter */}
          <div className="mb-6">
            <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Meals</h4>
            <label className="flex items-center gap-3 mb-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 accent-[#f5482b]" defaultChecked />
              <span className="text-gray-800 font-medium text-sm">With Meals</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 accent-[#f5482b]" defaultChecked />
              <span className="text-gray-800 font-medium text-sm">Without Meals</span>
            </label>
          </div>

          {/* Time Filter */}
          <div>
            <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Departure Time</h4>
            {["00:00 - 06:00", "06:01 - 12:00", "12:01 - 18:00", "18:01 - 23:59"].map((time) => (
              <label key={time} className="flex items-center gap-3 mb-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 accent-[#f5482b]" defaultChecked />
                <span className="text-gray-800 font-medium text-sm">{time}</span>
              </label>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT: FLIGHT RESULTS */}
        <section className="w-full md:w-3/4 flex flex-col gap-4">
          <h2 className="text-2xl font-black text-black mb-2">Available Flights</h2>
          
          {DUMMY_FLIGHTS.map((flight) => (
            <div key={flight.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all hover:border-[#f5482b]">
              <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Airline & Times */}
                <div className="flex-1 flex items-center justify-between w-full">
                  <div className="text-center md:text-left">
                    <div className="font-black text-2xl text-black">{flight.depTime}</div>
                    <div className="text-xs text-gray-500 font-bold uppercase">Origin</div>
                  </div>
                  
                  {/* Flight Line */}
                  <div className="flex-1 px-4 flex flex-col items-center">
                    <div className="text-xs text-gray-400 font-bold mb-1">{flight.type}</div>
                    <div className="w-full h-[2px] bg-gray-200 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[#f5482b] text-lg">
                        ✈
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 font-bold mt-1">{flight.airline} ({flight.flightNo})</div>
                  </div>

                  <div className="text-center md:text-right">
                    <div className="font-black text-2xl text-black">{flight.arrTime}</div>
                    <div className="text-xs text-gray-500 font-bold uppercase">Dest</div>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="flex flex-col items-center md:items-end w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  <div className="font-black text-3xl text-[#f5482b] mb-3">{flight.price}</div>
                  <button 
                    onClick={() => setExpandedFlight(expandedFlight === flight.id ? null : flight.id)}
                    className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg transition-colors w-full md:w-auto active:scale-95"
                  >
                    Select
                  </button>
                </div>
              </div>

              {/* EXPANDABLE DETAILS SECTION */}
              {expandedFlight === flight.id && (
                <div className="bg-gray-100 p-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-black text-gray-800 uppercase tracking-wide text-xs">Baggage Allowance</span>
                      <span className="text-black block mt-1 font-medium">{flight.baggage}</span>
                    </div>
                    <div>
                      <span className="font-black text-gray-800 uppercase tracking-wide text-xs">In-Flight Meals</span>
                      <span className="text-black block mt-1 font-medium">{flight.meals ? "Included" : "Not Included (Purchase Onboard)"}</span>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button className="bg-[#f5482b] hover:bg-[#d83c20] text-white font-black py-3 px-8 rounded-lg transition-colors shadow-lg active:scale-95 w-full md:w-auto">
                      Continue to Passenger Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}