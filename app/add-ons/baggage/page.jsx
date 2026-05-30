"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// --- PRICING LOGIC ---
const AIRPORT_RATE_PER_KG = 10; 
const FLEXI_RATE_UP_TO_12 = 8; // 20% discount from $10
const FLEXI_RATE_ABOVE_12 = 6; // Lower straight amount for 13-30kg

const FIXED_PACKAGES = [
  { id: "pkg-4", weight: 4, price: 30, label: "4 kg Light Pack" },
  { id: "pkg-7", weight: 7, price: 50, label: "7 kg Medium Pack" },
  { id: "pkg-10", weight: 10, price: 70, label: "10 kg Heavy Pack" },
];

function BaggageContent() {
  const searchParams = useSearchParams();
  const [passengers, setPassengers] = useState([]);
  
  // Cart state storing baggage data per passenger ID
  const [baggageCart, setBaggageCart] = useState({});

  useEffect(() => {
    const adults = parseInt(searchParams.get("adults")) || 1;
    const childrenCount = parseInt(searchParams.get("children")) || 0;
    const flyerCount = adults + childrenCount; 
    
    const initialPassengers = [];
    for(let i = 1; i <= flyerCount; i++) {
      initialPassengers.push({ id: `flyer-${i}`, label: `Passenger ${i}` });
    }
    setPassengers(initialPassengers);
  }, [searchParams]);

  // Calculate Flexi Pass Price dynamically
  const calculateFlexiPrice = (kg) => {
    if (kg === 0) return 0;
    if (kg <= 12) return kg * FLEXI_RATE_UP_TO_12;
    return (12 * FLEXI_RATE_UP_TO_12) + ((kg - 12) * FLEXI_RATE_ABOVE_12);
  };

  const handleFixedSelect = (passId, pkg) => {
    setBaggageCart(prev => ({
      ...prev,
      [passId]: { type: "Fixed", weight: pkg.weight, price: pkg.price, name: pkg.label }
    }));
  };

  const handleFlexiChange = (passId, kg) => {
    if (kg === 0) {
      const newCart = { ...baggageCart };
      delete newCart[passId];
      setBaggageCart(newCart);
      return;
    }
    setBaggageCart(prev => ({
      ...prev,
      [passId]: { type: "Flexi", weight: kg, price: calculateFlexiPrice(kg), name: `${kg} kg Flexi Pass` }
    }));
  };

  const removeBaggage = (passId) => {
    const newCart = { ...baggageCart };
    delete newCart[passId];
    setBaggageCart(newCart);
  };

  const totalBaggageCost = Object.values(baggageCart).reduce((sum, item) => sum + item.price, 0);

  const handleNext = () => {
    alert("Baggage saved to your booking!");
    // Move to the final Add-ons step: Seats!
    window.location.href = `/add-ons/seats?${searchParams.toString()}`;
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col lg:flex-row gap-8">
      
      {/* LEFT COLUMN: BAGGAGE SELECTION */}
      <div className="w-full lg:w-2/3">
        
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-black">Extra Baggage</h1>
          <p className="text-gray-500 font-bold uppercase text-sm mt-1 tracking-wide">Don't pack light, pack smart.</p>
        </div>

        {/* DISCOUNT BANNER */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-5 rounded-xl shadow-md text-white flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="font-black text-lg flex items-center gap-2">
              <span>🧳</span> Pre-book & Save 20%
            </div>
            <div className="text-sm font-medium mt-1">
              Airport flat rates are <span className="font-black underline">${AIRPORT_RATE_PER_KG}/kg</span>. Pre-book now to unlock our discounted Flexi rates and Fixed packages!
            </div>
          </div>
        </div>

        {/* PASSENGER BAGGAGE CARDS */}
        <div className="flex flex-col gap-6 mb-10">
          {passengers.map((p) => {
            const currentSelection = baggageCart[p.id];
            const isFlexi = currentSelection?.type === "Flexi";
            const flexiValue = isFlexi ? currentSelection.weight : 0;

            return (
              <div key={p.id} className={`bg-white rounded-xl shadow-sm border p-6 transition-colors ${currentSelection ? 'border-blue-500' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                  <h3 className="font-black text-black text-xl">{p.label}</h3>
                  {currentSelection && (
                    <button onClick={() => removeBaggage(p.id)} className="text-xs font-bold text-red-500 hover:underline">
                      Remove Bag
                    </button>
                  )}
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                  {/* Fixed Packages */}
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-wide mb-3">Quick Add Packages</h4>
                    <div className="flex flex-col gap-3">
                      {FIXED_PACKAGES.map(pkg => {
                        const isSelected = currentSelection?.name === pkg.label;
                        return (
                          <button 
                            key={pkg.id}
                            onClick={() => handleFixedSelect(p.id, pkg)}
                            className={`flex justify-between items-center p-3 rounded-lg border-2 transition-all font-bold text-sm ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-blue-300'}`}
                          >
                            <span>{pkg.label}</span>
                            <span>${pkg.price}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className="hidden md:block w-px bg-gray-100"></div>

                  {/* Flexi Pass Slider */}
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-wide mb-3">Flexi Pass (1 - 30 kg)</h4>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 h-full flex flex-col justify-center">
                      
                      <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                        <span>0 kg</span>
                        <span className="text-blue-600">Selected: {flexiValue} kg</span>
                        <span>30 kg</span>
                      </div>
                      
                      <input 
                        type="range" 
                        min="0" 
                        max="30" 
                        value={flexiValue}
                        onChange={(e) => handleFlexiChange(p.id, parseInt(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none"
                      />
                      
                      <div className="mt-4 text-xs font-medium text-gray-500 text-center">
                        <span className="font-bold text-black">${FLEXI_RATE_UP_TO_12}/kg</span> up to 12kg • <span className="font-bold text-black">${FLEXI_RATE_ABOVE_12}/kg</span> thereafter
                      </div>

                      {isFlexi && flexiValue > 0 && (
                        <div className="mt-4 text-center font-black text-2xl text-blue-600">
                          ${calculateFlexiPrice(flexiValue)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* RIGHT COLUMN: CART */}
      <div className="w-full lg:w-1/3">
        <div className="sticky top-[100px] bg-white p-6 rounded-xl shadow-xl border border-gray-100 flex flex-col h-fit">
          
          <h2 className="font-black text-xl border-b border-gray-100 pb-4 mb-4">Baggage Summary</h2>
          
          {Object.keys(baggageCart).length === 0 ? (
            <div className="text-center py-10 text-gray-400 font-medium text-sm">
              No extra baggage selected.<br/>You only have your cabin allowance.
            </div>
          ) : (
            <div className="flex flex-col gap-4 mb-6 flex-1">
              {passengers.map(p => {
                const bag = baggageCart[p.id];
                if (!bag) return null;
                return (
                  <div key={p.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                    <div>
                      <div className="font-bold text-black">{p.label}</div>
                      <div className="text-xs text-blue-600 font-bold">{bag.name}</div>
                    </div>
                    <div className="font-black text-black">${bag.price}</div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t border-gray-200 pt-4 mt-auto">
            <div className="flex justify-between items-center text-xl font-black text-black mb-6">
              <span>Total</span>
              <span className="text-blue-600">${totalBaggageCost.toFixed(2)}</span>
            </div>

            <button 
              onClick={handleNext}
              className="w-full bg-[#f5482b] hover:bg-[#d83c20] text-white font-black py-4 rounded-xl text-lg transition-colors shadow-lg active:scale-95"
            >
              {Object.keys(baggageCart).length > 0 ? "Confirm & Next ➔" : "Skip Baggage ➔"}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}

export default function BaggagePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-2xl text-gray-400">Loading Baggage...</div>}>
        <BaggageContent />
      </Suspense>
    </main>
  );
}