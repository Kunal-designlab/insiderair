"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const BAGGAGE_OPTIONS = [
  { id: "bag-4", name: "4 kg Light Pack", desc: "1 Small personal item (Under seat)", price: 0, icon: "🎒" },
  { id: "bag-7", name: "7 kg Medium Pack", desc: "1 Cabin bag + 1 Personal item", price: 25, icon: "🧳" },
  { id: "bag-20", name: "20 kg Flexi Pass", desc: "1 Checked bag + Cabin + Personal", price: 60, icon: "⚖️" }
];

function BaggageContent() {
  const searchParams = useSearchParams();
  const [passengers, setPassengers] = useState([]);
  const [baggageSelections, setBaggageSelections] = useState({});

  useEffect(() => {
    const adults = parseInt(searchParams.get("adults")) || 1;
    const childrenCount = parseInt(searchParams.get("children")) || 0;
    const flyerCount = adults + childrenCount; 
    
    const initialPassengers = [];
    const defaultSelections = {};

    for(let i = 1; i <= flyerCount; i++) {
      const pId = `flyer-${i}`;
      initialPassengers.push({ id: pId, label: `Passenger ${i}` });
      defaultSelections[pId] = BAGGAGE_OPTIONS[0]; 
    }
    setPassengers(initialPassengers);
    setBaggageSelections(defaultSelections);
  }, [searchParams]);

  const handleBagSelect = (passengerId, newBag) => {
    const oldBag = baggageSelections[passengerId];
    if (oldBag && oldBag.id === newBag.id) return;

    setBaggageSelections(prev => ({ ...prev, [passengerId]: newBag }));
    window.dataLayer = window.dataLayer || [];

    if (oldBag && oldBag.price > 0) {
      window.dataLayer.push({
        event: "item_removed_from_cart",
        action_type: "remove_from_cart",
        product_id: oldBag.name,
        name: oldBag.name,
        taxonomy: ["Baggage Add-ons"],
        price: oldBag.price,
        sale_price: oldBag.price,
        quantity: 1,
        image_url: window.location.origin + "/baggage-icon.png",
        url: window.location.origin + window.location.pathname
      });
    }

    if (newBag.price > 0) {
      window.dataLayer.push({
        event: "item_added_to_cart",
        action_type: "add_to_cart",
        product_id: newBag.name,
        name: newBag.name,
        taxonomy: ["Baggage Add-ons"],
        price: newBag.price,
        sale_price: newBag.price,
        quantity: 1,
        image_url: window.location.origin + "/baggage-icon.png",
        url: window.location.origin + window.location.pathname
      });
    }
  };

  const totalBaggageCost = Object.values(baggageSelections).reduce((sum, bag) => sum + bag.price, 0);

  // --- UPDATED: WRITE CONFIGURATIONS TO STORAGE ON NAVIGATION ---
  const handleNext = () => {
    const premiumBaggageItems = Object.values(baggageSelections)
      .filter(bag => bag.price > 0)
      .map(bag => ({
        name: bag.name,
        price: `$${bag.price}`
      }));

    localStorage.setItem("selectedBaggage", JSON.stringify(premiumBaggageItems));
    alert("Baggage confirmed! Moving to Seat Selection...");
    window.location.href = `/add-ons/seats?${searchParams.toString()}`;
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-2/3">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-black">Baggage Allowance</h1>
          <p className="text-gray-500 font-bold uppercase text-sm mt-1 tracking-wide">Select baggage for each passenger</p>
        </div>

        <div className="flex flex-col gap-8">
          {passengers.map((passenger) => {
            const selectedBagId = baggageSelections[passenger.id]?.id;
            return (
              <div key={passenger.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="font-black text-xl text-black border-b border-gray-100 pb-4 mb-4">{passenger.label}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {BAGGAGE_OPTIONS.map((bag) => {
                    const isSelected = selectedBagId === bag.id;
                    return (
                      <div 
                        key={bag.id} onClick={() => handleBagSelect(passenger.id, bag)}
                        className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-start ${isSelected ? 'border-[#f5482b] bg-red-50' : 'border-gray-200 hover:border-[#f5482b] bg-white'}`}
                      >
                        {isSelected && <div className="absolute top-3 right-3 bg-[#f5482b] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-black">✓</div>}
                        <div className="text-3xl mb-3">{bag.icon}</div>
                        <h3 className={`font-black text-lg leading-tight mb-1 ${isSelected ? 'text-[#f5482b]' : 'text-black'}`}>{bag.name}</h3>
                        <p className="text-xs text-gray-500 font-medium mb-4 flex-1">{bag.desc}</p>
                        <div className="font-black text-xl text-black mt-auto w-full text-left">{bag.price === 0 ? "Included" : `+$${bag.price}`}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full lg:w-1/3">
        <div className="sticky top-[100px] bg-white p-6 rounded-xl shadow-xl border border-gray-100 flex flex-col h-fit">
          <h2 className="font-black text-xl border-b border-gray-100 pb-4 mb-4">Baggage Summary</h2>
          <div className="flex flex-col gap-4 mb-6 flex-1">
            {passengers.map(p => {
              const bag = baggageSelections[p.id];
              return (
                <div key={p.id} className="flex justify-between items-start text-sm border-b border-gray-50 pb-3 last:border-0">
                  <div>
                    <div className="font-bold text-black">{p.label}</div>
                    <div className="text-xs text-gray-500 font-medium">{bag ? bag.name : "Pending"}</div>
                  </div>
                  <div className="font-black text-black">{bag && bag.price > 0 ? `+$${bag.price}` : "Free"}</div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-gray-200 pt-4 mt-auto">
            <div className="flex justify-between items-center text-xl font-black text-black mb-6">
              <span>Baggage Total</span>
              <span className="text-[#f5482b]">${totalBaggageCost.toFixed(2)}</span>
            </div>
            <button onClick={handleNext} className="w-full bg-[#f5482b] hover:bg-[#d83c20] text-white font-black py-4 rounded-xl text-lg transition-colors shadow-lg active:scale-95">Confirm & Next ➔</button>
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