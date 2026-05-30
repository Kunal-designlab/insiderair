"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// Bringing the mock data over to the receipt
const detailedAddons = {
  seats: [
    { pax: "Passenger 1", code: "4A", type: "Extra Legroom" },
    { pax: "Passenger 2", code: "4B", type: "Extra Legroom" }
  ],
  meals: [
    { name: "Paneer Tikka Masala", qty: 1 },
    { name: "Vegan Buddha Bowl", qty: 1 },
    { name: "Coca Cola Can", qty: 2 }
  ],
  baggage: [
    { pax: "Passenger 1", type: "20 kg Flexi Pass" },
    { pax: "Passenger 2", type: "7 kg Medium Pack" }
  ]
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const pnr = searchParams.get("pnr") || "IA3013XY";
  const fromCode = searchParams.get("from") || "DEL";
  const toCode = searchParams.get("to") || "SIN";
  const total = searchParams.get("total") || "0.00";

  // --- DATALAYER E-COMMERCE PUSH ---
  useEffect(() => {
    setMounted(true);

    // Initialize dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];
    
    // Push the purchase event
    window.dataLayer.push({
      event: "purchase",
      ecommerce: {
        transaction_id: pnr,
        value: parseFloat(total),
        currency: "USD",
        items: [
          { item_name: "Flight Ticket", item_category: "Flight", price: 250, quantity: 2 },
          { item_name: "Seat: Extra Legroom", item_category: "Add-on: Seat", quantity: 2 },
          { item_name: "Paneer Tikka Masala", item_category: "Add-on: Meal", quantity: 1 },
          { item_name: "Vegan Buddha Bowl", item_category: "Add-on: Meal", quantity: 1 },
          { item_name: "Coca Cola Can", item_category: "Add-on: Meal", quantity: 2 },
          { item_name: "20 kg Flexi Pass", item_category: "Add-on: Baggage", quantity: 1 },
          { item_name: "7 kg Medium Pack", item_category: "Add-on: Baggage", quantity: 1 }
        ]
      }
    });
    
    console.log("Fired dataLayer push event!", window.dataLayer);
  }, [pnr, total]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      
      <div className={`max-w-3xl w-full transition-all duration-700 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* SUCCESS HEADER */}
        <div className="bg-[#f5482b] rounded-t-2xl p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-[#f5482b] text-4xl">✓</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2 relative z-10">Booking Confirmed!</h1>
          <p className="text-white/80 font-bold uppercase tracking-widest text-sm relative z-10">Have a safe and wonderful flight</p>
        </div>

        {/* TICKET BODY */}
        <div className="bg-white rounded-b-2xl shadow-2xl p-8 border border-gray-100 relative">
          
          <div className="absolute top-0 left-0 right-0 h-4 flex gap-2 justify-around -mt-2 overflow-hidden px-4">
             {[...Array(20)].map((_, i) => <div key={i} className="w-4 h-4 bg-gray-50 rounded-full"></div>)}
          </div>

          <div className="text-center mb-10 pt-4 border-b border-gray-100 pb-10">
            <div className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Your Booking Reference (PNR)</div>
            <div className="text-5xl font-black tracking-widest text-black bg-gray-100 py-4 rounded-xl border-2 border-dashed border-gray-300 inline-block px-10">
              {pnr}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-3">Total Paid: <span className="font-black text-[#f5482b]">${total}</span></p>
          </div>

          {/* ADD-ONS RECEIPT */}
          <div className="mb-10">
            <h3 className="font-black text-black border-b border-gray-200 pb-3 mb-6 uppercase tracking-wide text-sm">Receipt Breakdown</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-black text-gray-400 text-xs uppercase mb-3 flex items-center gap-2"><span className="text-lg">💺</span> Reserved Seats</h4>
                <ul className="text-sm font-bold text-black flex flex-col gap-2">
                  {detailedAddons.seats.map((seat, i) => (
                    <li key={i}>{seat.code} <span className="text-gray-400 font-medium text-xs ml-1">({seat.type})</span></li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-black text-gray-400 text-xs uppercase mb-3 flex items-center gap-2"><span className="text-lg">🧳</span> Extra Baggage</h4>
                <ul className="text-sm font-bold text-black flex flex-col gap-2">
                  {detailedAddons.baggage.map((bag, i) => (
                    <li key={i}>{bag.type}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-black text-gray-400 text-xs uppercase mb-3 flex items-center gap-2"><span className="text-lg">🍲</span> Meals & Extras</h4>
                <ul className="text-sm font-bold text-black flex flex-col gap-2">
                  {detailedAddons.meals.map((meal, i) => (
                    <li key={i}>{meal.qty}x {meal.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button className="flex-1 border-2 border-gray-200 bg-white text-black font-black py-4 rounded-xl hover:bg-gray-50 transition-colors">
              Download E-Ticket
            </button>
            <Link href="/" className="flex-1 bg-black text-white font-black py-4 rounded-xl hover:bg-gray-800 transition-colors text-center inline-block">
              Return to Home
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-2xl text-gray-400">Loading Confirmation...</div>}>
      <SuccessContent />
    </Suspense>
  );
}