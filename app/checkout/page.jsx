"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const INSURANCE_PLANS = [
  {
    id: "premium",
    name: "Comprehensive Peace of Mind",
    price: 29,
    features: ["Trip Cancellation (100% refund)", "Medical Emergency up to $100,000", "Baggage Loss up to $2,000", "Flight Delay Compensation"],
    recommended: true
  },
  {
    id: "basic",
    name: "Basic Protection",
    price: 14,
    features: ["Trip Cancellation (50% refund)", "Medical Emergency up to $25,000", "Baggage Loss up to $500"],
    recommended: false
  }
];

function CheckoutContent() {
  const searchParams = useSearchParams();
  
  // Passenger Counts
  const adults = parseInt(searchParams.get("adults")) || 1;
  const children = parseInt(searchParams.get("children")) || 0;
  const infants = parseInt(searchParams.get("infants")) || 0;
  const totalFlyers = adults + children; // Infants usually fly free/cheap on laps
  
  // Trip Details
  const fromCode = searchParams.get("from") || "DEL";
  const toCode = searchParams.get("to") || "SIN";
  const depDate = searchParams.get("dep") || "2026-06-15";
  const retDate = searchParams.get("ret");
  const tripType = searchParams.get("type") || "one-way";

  // Dummy Pricing Logic based on pax
  const baseFlightPrice = 250; 
  const totalFlightsCost = baseFlightPrice * totalFlyers * (tripType === "return" ? 2 : 1);
  const estimatedAddons = 85 * totalFlyers; // Mocking the meals/bags/seats selected previously

  // Insurance State
  const [selectedInsurance, setSelectedInsurance] = useState("premium");

  // Calculate Final Totals
  const insuranceCost = selectedInsurance === "none" ? 0 
    : (INSURANCE_PLANS.find(p => p.id === selectedInsurance)?.price * totalFlyers);
  
  const finalTotal = totalFlightsCost + estimatedAddons + insuranceCost;

  // Custom PNR Generator Logic
  const generatePNR = () => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const random1 = chars.charAt(Math.floor(Math.random() * chars.length));
    const random2 = chars.charAt(Math.floor(Math.random() * chars.length));
    
    // IA + 2 digits (Date) + 2 digits (Hour) + 2 Random Letters
    return `IA${dd}${hh}${random1}${random2}`;
  };

  const handlePayment = () => {
    const pnr = generatePNR();
    
    // Bundle the final data to send to the Success page
    const finalParams = new URLSearchParams({
      pnr,
      from: fromCode,
      to: toCode,
      dep: depDate,
      type: tripType,
      pax: totalFlyers + infants,
      total: finalTotal.toFixed(2)
    }).toString();

    // Proceed to Success Page!
    window.location.href = `/success?${finalParams}`;
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 flex flex-col lg:flex-row gap-8">
      
      {/* LEFT COLUMN: SUMMARY & INSURANCE */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-black">Review & Pay</h1>
          <p className="text-gray-500 font-bold uppercase text-sm mt-2 tracking-wide">You're almost there! Review your booking details.</p>
        </div>

        {/* FLIGHT SUMMARY CARD */}
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

            {tripType === "return" && (
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Return • {retDate}</div>
                  <div className="font-black text-2xl text-black">{toCode} <span className="text-[#f5482b] mx-2">➔</span> {fromCode}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-black">Insider Air</div>
                  <div className="text-xs text-gray-500 font-medium">Direct • 4h 45m</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100 flex gap-6 text-sm">
            <div className="flex flex-col">
              <span className="text-gray-400 font-bold uppercase text-xs">Passengers</span>
              <span className="font-black text-black">{totalFlyers + infants} Total</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 font-bold uppercase text-xs">Add-ons Included</span>
              <span className="font-black text-black">Meals, Bags, Seats</span>
            </div>
          </div>
        </div>

        {/* TRAVEL INSURANCE SELECTION */}
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
                  onClick={() => setSelectedInsurance(plan.id)}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all relative ${isSelected ? 'border-[#f5482b] bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                >
                  {plan.recommended && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f5482b] text-white text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full">
                      Recommended
                    </span>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className={`font-black text-lg ${isSelected ? 'text-[#f5482b]' : 'text-black'}`}>{plan.name}</h3>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-[#f5482b] border-[#f5482b]' : 'border-gray-300'}`}>
                      {isSelected && <span className="text-white text-xs">✓</span>}
                    </div>
                  </div>
                  <div className="font-black text-2xl text-black mb-4">${plan.price} <span className="text-xs text-gray-400 font-medium">/person</span></div>
                  <ul className="flex flex-col gap-2 text-xs font-bold text-gray-600">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-500">✓</span> {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => setSelectedInsurance("none")}
            className={`mt-4 text-xs font-bold w-full p-3 rounded-lg border-2 transition-colors ${selectedInsurance === "none" ? 'border-gray-400 bg-gray-100 text-gray-800' : 'border-gray-100 text-gray-400 hover:bg-gray-50'}`}
          >
            No thanks, I will risk traveling without insurance.
          </button>
        </div>

      </div>

      {/* RIGHT COLUMN: PAYMENT SUMMARY */}
      <div className="w-full lg:w-1/3">
        <div className="sticky top-[100px] bg-white p-6 rounded-xl shadow-xl border border-gray-100 flex flex-col h-fit">
          
          <h2 className="font-black text-xl border-b border-gray-100 pb-4 mb-4">Price Breakdown</h2>
          
          <div className="flex flex-col gap-4 mb-6 text-sm border-b border-gray-100 pb-6">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-500">Flight Fares ({totalFlyers}x)</span>
              <span className="font-black text-black">${totalFlightsCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-500">Taxes & Fees</span>
              <span className="font-black text-black">Included</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-500">Selected Add-ons</span>
              <span className="font-black text-black">${estimatedAddons.toFixed(2)}</span>
            </div>
            {insuranceCost > 0 && (
              <div className="flex justify-between items-center text-[#f5482b]">
                <span className="font-bold">Travel Insurance</span>
                <span className="font-black">${insuranceCost.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-end mb-8">
            <span className="font-black text-gray-400 uppercase text-xs tracking-widest">Total to Pay</span>
            <span className="text-4xl font-black text-black">${finalTotal.toFixed(2)}</span>
          </div>

          <button 
            onClick={handlePayment}
            className="w-full bg-black hover:bg-gray-800 text-white font-black py-5 rounded-xl text-lg transition-colors shadow-2xl active:scale-95 flex justify-center items-center gap-3 overflow-hidden relative group"
          >
            <span className="relative z-10">Pay with a smile 😊</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
          </button>
          
          <div className="text-center mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            100% Secure Transaction
          </div>

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