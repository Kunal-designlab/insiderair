"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function AddOnsContent() {
  const searchParams = useSearchParams();
  const [passengers, setPassengers] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [priorityPass, setPriorityPass] = useState(false);

  // Generate the passenger list from the URL to map add-ons per person
  useEffect(() => {
    const adults = parseInt(searchParams.get("adults")) || 1;
    const childrenCount = parseInt(searchParams.get("children")) || 0;
    // Infants don't get seats or meals, so we only map Adults + Children
    const flyerCount = adults + childrenCount; 
    
    const initialPassengers = [];
    for(let i = 1; i <= flyerCount; i++) {
      initialPassengers.push({ 
        id: `flyer-${i}`, 
        label: `Passenger ${i}`, 
        meal: "Standard (Included)", 
        baggage: 0 
      });
    }
    setPassengers(initialPassengers);
  }, [searchParams]);

  const handleMealChange = (id, meal) => {
    setPassengers(prev => prev.map(p => p.id === id ? { ...p, meal } : p));
  };

  const handleBaggageChange = (id, increment) => {
    setPassengers(prev => prev.map(p => {
      if (p.id === id) {
        const newBag = Math.max(0, p.baggage + increment);
        return { ...p, baggage: newBag };
      }
      return p;
    }));
  };

  const toggleSeat = (seatCode) => {
    // If already selected, deselect it
    if (selectedSeats.includes(seatCode)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatCode));
      return;
    }
    // Prevent selecting more seats than passengers
    if (selectedSeats.length >= passengers.length) {
      alert(`You can only select ${passengers.length} seat(s) for this booking.`);
      return;
    }
    setSelectedSeats(prev => [...prev, seatCode]);
  };

  const handleProceedToCheckout = () => {
    console.log("Finalizing Add-ons:");
    console.log("Seats:", selectedSeats);
    console.log("Passenger Addons:", passengers);
    console.log("Priority Pass:", priorityPass);
    
    alert("Add-ons saved! Proceeding to Payment/Checkout...");
    // window.location.href = `/checkout?${searchParams.toString()}`;
  };

  // Mock occupied seats for the visual map
  const occupiedSeats = ["2A", "2B", "4C", "4D", "4E", "7A", "7F", "9B", "9C"];

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 flex flex-col lg:flex-row gap-8">
      
      {/* LEFT COLUMN: MAIN ADD-ONS */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-black">Customize your journey</h1>
          <p className="text-gray-500 font-bold uppercase text-sm mt-2 tracking-wide">Enhance your flight with our premium add-ons</p>
        </div>

        {/* 1. SEAT SELECTION MAP */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <h2 className="font-black text-2xl text-black flex items-center gap-2">
              <span className="text-[#f5482b]">💺</span> Seat Selection
            </h2>
            <div className="text-sm font-bold text-gray-500">
              <span className="text-black">{selectedSeats.length}</span> / {passengers.length} Selected
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Airplane Visual */}
            <div className="bg-gray-50 p-6 rounded-full border-4 border-gray-200 min-w-[260px]">
              <div className="text-center font-black text-gray-300 uppercase tracking-widest text-xs mb-8">Front</div>
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                  <div key={`row-${row}`} className="flex justify-center gap-4">
                    {/* Left Side: A, B, C */}
                    <div className="flex gap-1">
                      {["A", "B", "C"].map(seat => {
                        const code = `${row}${seat}`;
                        const isOccupied = occupiedSeats.includes(code);
                        const isSelected = selectedSeats.includes(code);
                        return (
                          <button 
                            key={code}
                            disabled={isOccupied}
                            onClick={() => toggleSeat(code)}
                            className={`w-8 h-8 rounded text-[10px] font-bold flex items-center justify-center transition-colors ${isOccupied ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : isSelected ? 'bg-[#f5482b] text-white shadow-md scale-110' : 'bg-white border-2 border-[#f5482b] text-[#f5482b] hover:bg-red-50'}`}
                          >
                            {code}
                          </button>
                        );
                      })}
                    </div>
                    {/* Aisle */}
                    <div className="w-4"></div>
                    {/* Right Side: D, E, F */}
                    <div className="flex gap-1">
                      {["D", "E", "F"].map(seat => {
                        const code = `${row}${seat}`;
                        const isOccupied = occupiedSeats.includes(code);
                        const isSelected = selectedSeats.includes(code);
                        return (
                          <button 
                            key={code}
                            disabled={isOccupied}
                            onClick={() => toggleSeat(code)}
                            className={`w-8 h-8 rounded text-[10px] font-bold flex items-center justify-center transition-colors ${isOccupied ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : isSelected ? 'bg-[#f5482b] text-white shadow-md scale-110' : 'bg-white border-2 border-[#f5482b] text-[#f5482b] hover:bg-red-50'}`}
                          >
                            {code}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center font-black text-gray-300 uppercase tracking-widest text-xs mt-8">Rear</div>
            </div>

            {/* Legend & Selected */}
            <div className="flex-1 w-full">
              <div className="flex gap-4 mb-6 text-xs font-bold text-gray-600">
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border-2 border-[#f5482b] rounded"></div> Available</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#f5482b] rounded"></div> Selected</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-200 rounded"></div> Occupied</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-black text-black mb-2 uppercase tracking-wide text-xs">Your Seats</h4>
                {selectedSeats.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map(seat => (
                      <span key={seat} className="bg-[#f5482b] text-white px-3 py-1 rounded font-bold text-sm shadow-sm">{seat}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 font-medium">No seats selected yet. (We will assign them randomly if skipped).</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. MEALS & BAGGAGE PER PASSENGER */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-100">
          <h2 className="font-black text-2xl text-black flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
            <span className="text-[#f5482b]">🍲</span> Meals & Baggage
          </h2>
          
          <div className="flex flex-col gap-6">
            {passengers.map((p) => (
              <div key={p.id} className="bg-gray-50 p-5 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                
                <div className="font-black text-lg text-black min-w-[120px]">{p.label}</div>
                
                {/* Meal Dropdown */}
                <div className="flex-1 w-full">
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">In-flight Meal</label>
                  <select 
                    value={p.meal}
                    onChange={(e) => handleMealChange(p.id, e.target.value)}
                    className="w-full bg-white border-2 border-gray-200 p-2.5 rounded-lg focus:outline-none focus:border-[#f5482b] text-black font-bold text-sm"
                  >
                    <option value="Standard (Included)">Standard (Included)</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Gluten-Free">Gluten-Free</option>
                    <option value="Halal">Halal</option>
                    <option value="Kosher">Kosher</option>
                  </select>
                </div>

                {/* Extra Baggage Counter */}
                <div className="w-full md:w-auto">
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Extra Checked Bag</label>
                  <div className="flex items-center gap-3 bg-white border-2 border-gray-200 rounded-lg p-1.5 w-fit">
                    <button onClick={() => handleBaggageChange(p.id, -15)} className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-black font-bold hover:border-[#f5482b] hover:text-[#f5482b]">-</button>
                    <span className="w-12 text-center font-bold text-black text-sm">+{p.baggage}kg</span>
                    <button onClick={() => handleBaggageChange(p.id, 15)} className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-black font-bold hover:border-[#f5482b] hover:text-[#f5482b]">+</button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: PRIORITY PASS & SUMMARY */}
      <div className="w-full lg:w-1/3">
        <div className="sticky top-[100px] flex flex-col gap-6">
          
          {/* Priority Pass */}
          <div className="bg-black p-6 md:p-8 rounded-xl shadow-2xl relative overflow-hidden group cursor-pointer" onClick={() => setPriorityPass(!priorityPass)}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f5482b] rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <h2 className="font-black text-2xl text-white flex items-center gap-2">
                Priority Pass
              </h2>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${priorityPass ? 'bg-[#f5482b] border-[#f5482b]' : 'border-gray-500'}`}>
                {priorityPass && <span className="text-white text-sm font-bold">✓</span>}
              </div>
            </div>
            
            <p className="text-gray-400 text-sm font-medium mb-6 relative z-10">
              Skip the queues! Get Fast Track security clearance, priority boarding, and complimentary lounge access.
            </p>
            <div className="font-black text-white text-xl relative z-10">+$45 <span className="text-sm text-gray-500 font-bold tracking-wide uppercase">/person</span></div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleProceedToCheckout}
            className="w-full bg-[#f5482b] hover:bg-[#d83c20] text-white font-black py-5 rounded-xl text-lg transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-3"
          >
            Continue to Checkout ➔
          </button>
          
        </div>
      </div>

    </div>
  );
}

export default function AddOns() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-2xl text-gray-400">Loading Add-ons...</div>}>
        <AddOnsContent />
      </Suspense>
    </main>
  );
}