"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const INSURANCE_PLANS = [
  { id: "premium", name: "Comprehensive Peace of Mind", price: 29, features: ["Trip Cancellation (100% refund)", "Medical Emergency up to $100,000", "Baggage Loss up to $2,000", "Flight Delay Compensation"], recommended: true },
  { id: "basic", name: "Basic Protection", price: 14, features: ["Trip Cancellation (50% refund)", "Medical Emergency up to $25,000", "Baggage Loss up to $500"], recommended: false }
];

// MOCK DATA for Receipt
const detailedAddons = {
  seats: [{ pax: "Passenger 1", code: "4A", type: "Extra Legroom" }, { pax: "Passenger 2", code: "4B", type: "Extra Legroom" }],
  meals: [{ name: "Paneer Tikka Masala", qty: 1 }, { name: "Vegan Buddha Bowl", qty: 1 }, { name: "Coca Cola Can", qty: 2 }],
  baggage: [{ pax: "Passenger 1", type: "20 kg Flexi Pass" }, { pax: "Passenger 2", type: "7 kg Medium Pack" }]
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  
  const adults = parseInt(searchParams.get("adults")) || 1;
  const children = parseInt(searchParams.get("children")) || 0;
  const infants = parseInt(searchParams.get("infants")) || 0;
  const totalFlyers = adults + children; 
  
  const fromCode = searchParams.get("from") || "DEL";
  const toCode = searchParams.get("to") || "SIN";
  const depDate = searchParams.get("dep") || "2026-06-15";
  const retDate = searchParams.get("ret");
  const tripType = searchParams.get("type") || "one-way";

  const baseFlightPrice = 250; 
  const totalFlightsCost = baseFlightPrice * totalFlyers * (tripType === "return" ? 2 : 1);
  const estimatedAddons = 125; 

  const [selectedInsurance, setSelectedInsurance] = useState("premium");
  const hasFiredInit = useRef(false);

  // --- 1. FIRE AUTO-SELECTED GTM EVENT ON LOAD ---
  useEffect(() => {
    // Only fire once in React Strict Mode
    if (!hasFiredInit.current) {
      const defaultPlan = INSURANCE_PLANS.find(p => p.id === "premium");
      
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "item_added_to_cart",
        action_type: "add_to_cart",
        product_id: defaultPlan.name,
        name: defaultPlan.name,
        taxonomy: ["Travel Insurance"],
        price: defaultPlan.price,
        sale_price: defaultPlan.price,
        quantity: totalFlyers, // Multiplied by passenger count
        image_url: window.location.origin + "/insurance-icon.png",
        url: window.location.origin + window.location.pathname
      });
      
      console.log("Fired GTM: item_added_to_cart (Auto-Selected)", defaultPlan.name);
      hasFiredInit.current = true;
    }
  }, [totalFlyers]);

  // --- 2. HANDLE INSURANCE CHANGES FOR GTM ---
  const handleInsuranceChange = (newPlanId) => {
    if (selectedInsurance === newPlanId) return;

    const oldPlan = INSURANCE_PLANS.find(p => p.id === selectedInsurance);
    const newPlan = INSURANCE_PLANS.find(p => p.id === newPlanId);

    window.dataLayer = window.dataLayer || [];

    // REMOVE OLD PLAN
    if (oldPlan) {
      window.dataLayer.push({
        event: "item_removed_from_cart",
        action_type: "remove_from_cart",
        product_id: oldPlan.name,
        name: oldPlan.name,
        taxonomy: ["Travel Insurance"],
        price: oldPlan.price,
        sale_price: oldPlan.price,
        quantity: totalFlyers,
        image_url: window.location.origin + "/insurance-icon.png",
        url: window.location.origin + window.location.pathname
      });
      console.log("Fired GTM: item_removed_from_cart", oldPlan.name);
    }

    // ADD NEW PLAN (If it's not "none")
    if (newPlan) {
      window.dataLayer.push({
        event: "item_added_to_cart",
        action_type: "add_to_cart",
        product_id: newPlan.name,
        name: newPlan.name,
        taxonomy: ["Travel Insurance"],
        price: newPlan.price,
        sale_price: newPlan.price,
        quantity: totalFlyers,
        image_url: window.location.origin + "/insurance-icon.png",
        url: window.location.origin + window.location.pathname
      });
      console.log("Fired GTM: item_added_to_cart", newPlan.name);
    }

    setSelectedInsurance(newPlanId);
  };

  const insuranceCost = selectedInsurance === "none" ? 0 : (INSURANCE_PLANS.find(p => p.id === selectedInsurance)?.price * totalFlyers);
  const finalTotal = totalFlightsCost + estimatedAddons + insuranceCost;

  const generatePNR = () => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const random1 = chars.charAt(Math.floor(Math.random() * chars.length));
    const random2 = chars.charAt(Math.floor(Math.random() * chars.length));
    return `IA${dd}${hh}${random1}${random2}`;
  };

  const handlePayment = () => {
    const pnr = generatePNR();
    const finalParams = new URLSearchParams({
      pnr, from: fromCode, to: toCode, dep: depDate, type: tripType, pax: totalFlyers + infants, total: finalTotal.toFixed(2)
    }).toString();
    window.location.href = `/success?${finalParams}`;
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 flex flex-col lg:flex-row gap-8">
      
      {/* LEFT COLUMN */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-black">Review & Pay</h1>
          <p className="text-gray-500 font-bold uppercase text-sm mt-2 tracking-wide">You're almost there! Review your booking details.</p>
        </div>

        {/* FLIGHT SUMMARY */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-black text-xl border-b border-gray-100 pb-4 mb-6">Flight Itinerary</h2>
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Outbound • {depDate}</div>
                <div className="font-black text-2xl text-black">{fromCode} <span className="text-[#f5482b] mx-2">➔</span> {toCode}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-black">Insider Air</div>
                <div className="text-xs text-gray-500 font-medium">Direct • 4h 30m</div>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILED ADD-ONS SUMMARY */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-black text-xl border-b border-gray-100 pb-4 mb-6 flex items-center gap-2">
            <span className="text-[#f5482b]">⭐</span> Selected Add-ons
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="font-black text-black text-sm uppercase tracking-wide mb-3">💺 Seats</h3>
              <ul className="flex flex-col gap-2 text-sm text-gray-700">
                {detailedAddons.seats.map((seat, i) => (
                  <li key={i} className="flex justify-between items-start">
                    <span className="font-bold text-black">{seat.code}</span>
                    <span className="text-xs text-gray-500 text-right">{seat.pax}<br/>({seat.type})</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="font-black text-black text-sm uppercase tracking-wide mb-3">🧳 Baggage</h3>
              <ul className="flex flex-col gap-2 text-sm text-gray-700">
                {detailedAddons.baggage.map((bag, i) => (
                  <li key={i} className="flex justify-between items-start">
                    <span className="font-bold text-black">{bag.type}</span>
                    <span className="text-xs text-gray-500 text-right">{bag.pax}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="font-black text-black text-sm uppercase tracking-wide mb-3">🍲 Meals & Extras</h3>
              <ul className="flex flex-col gap-2 text-sm text-gray-700">
                {detailedAddons.meals.map((meal, i) => (
                  <li key={i} className="flex justify-between items-start">
                    <span className="font-bold text-black">{meal.qty}x {meal.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* TRAVEL INSURANCE */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-black text-xl border-b border-gray-100 pb-4 mb-2 flex items-center gap-2">
            <span className="text-[#f5482b]">🛡️</span> Travel Insurance
          </h2>
          <p className="text-sm text-gray-500 font-medium mb-6">Protect your trip from unexpected cancellations, medical emergencies, and lost baggage.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INSURANCE_PLANS.map(plan => {
              const isSelected = selectedInsurance === plan.id;
              return (
                <div 
                  key={plan.id} 
                  onClick={() => handleInsuranceChange(plan.id)} 
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all relative ${isSelected ? 'border-[#f5482b] bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                >
                  {plan.recommended && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f5482b] text-white text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full">Recommended</span>}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className={`font-black text-lg ${isSelected ? 'text-[#f5482b]' : 'text-black'}`}>{plan.name}</h3>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-[#f5482b] border-[#f5482b]' : 'border-gray-300'}`}>
                      {isSelected && <span className="text-white text-xs">✓</span>}
                    </div>
                  </div>
                  <div className="font-black text-2xl text-black mb-4">${plan.price} <span className="text-xs text-gray-400 font-medium">/person</span></div>
                </div>
              );
            })}
          </div>
          <button 
            onClick={() => handleInsuranceChange("none")} 
            className={`mt-4 text-xs font-bold w-full p-3 rounded-lg border-2 transition-colors ${selectedInsurance === "none" ? 'border-gray-400 bg-gray-100 text-gray-800' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}
          >
            No thanks, I will risk traveling without insurance.
          </button>
        </div>

      </div>

      {/* RIGHT COLUMN: PRICE BREAKDOWN */}
      <div className="w-full lg:w-1/3">
        <div className="sticky top-[100px] bg-white p-6 rounded-xl shadow-xl border border-gray-100 flex flex-col h-fit">
          <h2 className="font-black text-xl border-b border-gray-100 pb-4 mb-4">Price Breakdown</h2>
          <div className="flex flex-col gap-4 mb-6 text-sm border-b border-gray-100 pb-6">
            <div className="flex justify-between items-center"><span className="font-bold text-gray-500">Flight Fares ({totalFlyers}x)</span><span className="font-black text-black">${totalFlightsCost.toFixed(2)}</span></div>
            <div className="flex justify-between items-center"><span className="font-bold text-gray-500">Taxes & Fees</span><span className="font-black text-black">Included</span></div>
            <div className="flex justify-between items-center"><span className="font-bold text-gray-500">Selected Add-ons</span><span className="font-black text-black">${estimatedAddons.toFixed(2)}</span></div>
            {insuranceCost > 0 && <div className="flex justify-between items-center text-[#f5482b]"><span className="font-bold">Travel Insurance</span><span className="font-black">${insuranceCost.toFixed(2)}</span></div>}
          </div>
          <div className="flex justify-between items-end mb-8">
            <span className="font-black text-gray-400 uppercase text-xs tracking-widest">Total to Pay</span>
            <span className="text-4xl font-black text-black">${finalTotal.toFixed(2)}</span>
          </div>
          <button onClick={handlePayment} className="w-full bg-black hover:bg-gray-800 text-white font-black py-5 rounded-xl text-lg transition-colors shadow-2xl active:scale-95 flex justify-center items-center gap-3 overflow-hidden relative group">
            <span className="relative z-10">Pay with a smile 😊</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
          </button>
        </div>
      </div>

    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-2xl text-gray-400">Loading Checkout...</div>}>
        <CheckoutContent />
      </Suspense>
    </main>
  );
}