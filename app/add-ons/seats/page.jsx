"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// --- SEAT PRICING & LOGIC ---
const SEAT_PRICING = {
  business: { price: 150, label: "Business Upgrade", color: "bg-amber-100 border-amber-400 text-amber-800 hover:bg-amber-200" },
  legroom: { price: 35, label: "Extra Legroom", color: "bg-purple-100 border-purple-400 text-purple-800 hover:bg-purple-200" },
  windowAisle: { price: 15, label: "Window / Aisle", color: "bg-blue-100 border-blue-400 text-blue-800 hover:bg-blue-200" },
  middle: { price: 0, label: "Standard Middle", color: "bg-white border-gray-300 text-gray-600 hover:bg-gray-100" },
};

// Heavily booked flight to create urgency!
const OCCUPIED_SEATS = [
  "1A", "1C", "2F", "2J", "3A", "3D", 
  "4A", "4B", "4C", "5D", "5E", "5F", "5H",
  "6A", "6J", "7C", "7D", "8A", "8B", "8C", 
  "9E", "9F", "10A", "10D", "10E", "10F", 
  "11J", "12A", "12B", "14F", "14G", "14H", "14J", 
  "15A", "15C", "15E"
];

const getSeatDetails = (row, letter) => {
  if (row <= 3) return SEAT_PRICING.business;
  if (row <= 5) return SEAT_PRICING.legroom;
  const isWindow = letter === 'A' || letter === 'J';
  const isAisle = ['C', 'D', 'F', 'G'].includes(letter);
  if (isWindow || isAisle) return SEAT_PRICING.windowAisle;
  return SEAT_PRICING.middle;
};

function SeatsContent() {
  const searchParams = useSearchParams();
  const [passengers, setPassengers] = useState([]);
  const [seatCart, setSeatCart] = useState({});
  const [activePassengerId, setActivePassengerId] = useState(null);

  useEffect(() => {
    const adults = parseInt(searchParams.get("adults")) || 1;
    const childrenCount = parseInt(searchParams.get("children")) || 0;
    const flyerCount = adults + childrenCount; 
    
    const initialPassengers = [];
    for(let i = 1; i <= flyerCount; i++) {
      initialPassengers.push({ id: `flyer-${i}`, label: `Passenger ${i}` });
    }
    setPassengers(initialPassengers);
    if (initialPassengers.length > 0) setActivePassengerId(initialPassengers[0].id);
  }, [searchParams]);

  // --- GTM PUSH HELPER FUNCTION ---
  const pushSeatToGTM = (eventName, actionType, seatCode, seatDetails) => {
    // Only fire if the seat actually costs money
    if (seatDetails.price > 0) {
      const seatName = `Seat ${seatCode} (${seatDetails.label})`;
      
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: eventName,
        action_type: actionType,
        product_id: seatName,
        name: seatName,
        taxonomy: ["paid seats"],
        price: seatDetails.price,
        sale_price: seatDetails.price,
        quantity: 1,
        image_url: window.location.origin + "/seat-icon.png",
        url: window.location.origin + window.location.pathname
      });
      console.log(`Fired GTM: ${eventName}`, seatName);
    }
  };

  const handleSeatClick = (code, seatDetails) => {
    if (OCCUPIED_SEATS.includes(code)) return;

    const alreadyAssignedTo = Object.keys(seatCart).find(pId => seatCart[pId]?.code === code);
    
    if (alreadyAssignedTo) {
      // If ACTIVE passenger clicks their own seat -> UNSELECT
      if (alreadyAssignedTo === activePassengerId) {
        const removedSeat = seatCart[activePassengerId];
        
        // GTM PUSH: Remove the seat
        pushSeatToGTM("item_removed_from_cart", "remove_from_cart", removedSeat.code, { price: removedSeat.price, label: removedSeat.type });

        const newCart = { ...seatCart };
        delete newCart[activePassengerId];
        setSeatCart(newCart);
      } else {
        alert("This seat is already selected by another passenger in your group.");
      }
      return;
    }

    // CHECK IF SWAPPING SEATS: Active passenger already has a seat
    const oldSeat = seatCart[activePassengerId];
    if (oldSeat) {
      // GTM PUSH: Remove the old seat they are replacing
      pushSeatToGTM("item_removed_from_cart", "remove_from_cart", oldSeat.code, { price: oldSeat.price, label: oldSeat.type });
    }

    // GTM PUSH: Add the new seat
    pushSeatToGTM("item_added_to_cart", "add_to_cart", code, seatDetails);

    // Assign new seat to active passenger
    setSeatCart(prev => ({
      ...prev,
      [activePassengerId]: { code, price: seatDetails.price, type: seatDetails.label }
    }));

    // Auto-advance
    const currentIndex = passengers.findIndex(p => p.id === activePassengerId);
    const nextUnassigned = passengers.find((p, index) => index > currentIndex && !seatCart[p.id]);
    
    if (nextUnassigned) setActivePassengerId(nextUnassigned.id);
  };

  const totalSeatCost = Object.values(seatCart).reduce((sum, item) => sum + item.price, 0);

  const handleNext = () => {
    if (Object.keys(seatCart).length < passengers.length) {
      const confirmSkip = confirm("Not all passengers have seats assigned. They will be randomly assigned at check-in. Continue?");
      if (!confirmSkip) return;
    }
    alert("Seats confirmed! Proceeding to Checkout...");
    window.location.href = `/checkout?${searchParams.toString()}`;
  };

  const SeatButton = ({ row, letter }) => {
    const code = `${row}${letter}`;
    const isOccupied = OCCUPIED_SEATS.includes(code);
    const assignedPassengerId = Object.keys(seatCart).find(pId => seatCart[pId]?.code === code);
    const details = getSeatDetails(row, letter);
    
    let buttonClass = `w-10 h-10 md:w-12 md:h-12 rounded-t-xl rounded-b-md border-2 flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 ${details.color}`;
    
    if (isOccupied) {
      buttonClass = "w-10 h-10 md:w-12 md:h-12 rounded-t-xl rounded-b-md border-2 bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-50";
    } else if (assignedPassengerId) {
      buttonClass = "w-10 h-10 md:w-12 md:h-12 rounded-t-xl rounded-b-md border-2 bg-[#f5482b] border-[#d83c20] text-white shadow-lg scale-110 z-10";
    }

    return (
      <div onClick={() => handleSeatClick(code, details)} className={buttonClass} title={`${code} - ${details.label} (+$${details.price})`}>
        <span className="text-xs font-black">{code}</span>
        {assignedPassengerId && <span className="text-[10px] font-bold">P{assignedPassengerId.split('-')[1]}</span>}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col lg:flex-row gap-8">
      {/* LEFT COLUMN: SEAT MAP */}
      <div className="w-full lg:w-2/3">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-black">Select your seats</h1>
          <p className="text-gray-500 font-bold uppercase text-sm mt-1 tracking-wide">Widebody Aircraft (3-3-3 Configuration)</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 md:gap-8 mb-8 text-xs font-bold text-gray-700">
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-amber-100 border-2 border-amber-400"></div> Business (+$150)</div>
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-purple-100 border-2 border-purple-400"></div> Legroom (+$35)</div>
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-blue-100 border-2 border-blue-400"></div> Window/Aisle (+$15)</div>
          <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-white border-2 border-gray-300"></div> Middle (Free)</div>
        </div>

        <div className="bg-gray-100 rounded-t-[100px] border-4 border-gray-300 p-4 md:p-8 overflow-x-auto">
          <div className="min-w-[600px] flex flex-col gap-6 mx-auto">
            
            <div className="text-center pb-8 border-b-2 border-dashed border-gray-300">
              <span className="font-black text-gray-400 tracking-widest uppercase text-sm">Cockpit / Lavatory</span>
            </div>

            {/* BUSINESS CLASS (Rows 1-3) */}
            <div className="flex flex-col gap-4 pb-8 border-b-2 border-dashed border-gray-300 relative">
              <div className="absolute -left-2 top-0 bottom-0 flex items-center"><span className="origin-center -rotate-90 text-amber-500 font-black tracking-widest uppercase text-xs">Business Class</span></div>
              {[1, 2, 3].map(row => (
                <div key={`biz-${row}`} className="flex justify-center items-center gap-6">
                  <div className="flex gap-2"><SeatButton row={row} letter="A" /><SeatButton row={row} letter="C" /></div>
                  <div className="w-8 font-black text-gray-400 text-center">{row}</div>
                  <div className="flex gap-2"><SeatButton row={row} letter="D" /><SeatButton row={row} letter="F" /></div>
                  <div className="w-8"></div>
                  <div className="flex gap-2"><SeatButton row={row} letter="G" /><SeatButton row={row} letter="J" /></div>
                </div>
              ))}
            </div>

            {/* EXTRA LEGROOM (Rows 4-5) */}
            <div className="flex flex-col gap-3 pb-8 border-b-2 border-dashed border-gray-300 relative mt-4">
               <div className="absolute -left-2 top-0 bottom-0 flex items-center"><span className="origin-center -rotate-90 text-purple-500 font-black tracking-widest uppercase text-xs">Extra Legroom</span></div>
              {[4, 5].map(row => (
                <div key={`leg-${row}`} className="flex justify-center items-center gap-4">
                  <div className="flex gap-1"><SeatButton row={row} letter="A" /><SeatButton row={row} letter="B" /><SeatButton row={row} letter="C" /></div>
                  <div className="w-8 font-black text-gray-400 text-center">{row}</div>
                  <div className="flex gap-1"><SeatButton row={row} letter="D" /><SeatButton row={row} letter="E" /><SeatButton row={row} letter="F" /></div>
                  <div className="w-8"></div>
                  <div className="flex gap-1"><SeatButton row={row} letter="G" /><SeatButton row={row} letter="H" /><SeatButton row={row} letter="J" /></div>
                </div>
              ))}
            </div>

            {/* STANDARD ECONOMY (Rows 6-15) */}
            <div className="flex flex-col gap-3 relative mt-4">
              <div className="absolute -left-2 top-10 bottom-0 flex items-center"><span className="origin-center -rotate-90 text-blue-500 font-black tracking-widest uppercase text-xs">Standard Economy</span></div>
              {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(row => (
                <div key={`eco-${row}`} className="flex justify-center items-center gap-4">
                  <div className="flex gap-1"><SeatButton row={row} letter="A" /><SeatButton row={row} letter="B" /><SeatButton row={row} letter="C" /></div>
                  <div className="w-8 font-black text-gray-400 text-center">{row}</div>
                  <div className="flex gap-1"><SeatButton row={row} letter="D" /><SeatButton row={row} letter="E" /><SeatButton row={row} letter="F" /></div>
                  <div className="w-8"></div>
                  <div className="flex gap-1"><SeatButton row={row} letter="G" /><SeatButton row={row} letter="H" /><SeatButton row={row} letter="J" /></div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: PASSENGER TRACKER & CART */}
      <div className="w-full lg:w-1/3">
        <div className="sticky top-[100px] bg-white p-6 rounded-xl shadow-xl border border-gray-100 flex flex-col h-fit">
          <h2 className="font-black text-xl border-b border-gray-100 pb-4 mb-4">Seat Assignments</h2>
          
          <div className="flex flex-col gap-3 mb-6 flex-1">
            {passengers.map(p => {
              const seat = seatCart[p.id];
              const isActive = activePassengerId === p.id;
              
              return (
                <div key={p.id} onClick={() => setActivePassengerId(p.id)} className={`p-3 rounded-lg border-2 flex justify-between items-center cursor-pointer transition-all ${isActive ? 'border-[#f5482b] bg-red-50' : 'border-gray-100 hover:border-gray-300'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#f5482b] animate-pulse' : 'bg-transparent'}`}></div>
                      <span className={`font-black ${isActive ? 'text-[#f5482b]' : 'text-black'}`}>{p.label}</span>
                    </div>
                    <div className="text-xs text-gray-500 font-bold ml-4">{seat ? `${seat.type} (${seat.code})` : "Selecting..."}</div>
                  </div>
                  <div className="font-black text-black">{seat && seat.price > 0 ? `+$${seat.price}` : (seat ? "Free" : "-")}</div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 pt-4 mt-auto">
            <div className="flex justify-between items-center text-xl font-black text-black mb-6">
              <span>Seats Total</span>
              <span className="text-[#f5482b]">${totalSeatCost.toFixed(2)}</span>
            </div>
            <button onClick={handleNext} className="w-full bg-[#f5482b] hover:bg-[#d83c20] text-white font-black py-4 rounded-xl text-lg transition-colors shadow-lg active:scale-95">
              Continue to Payment ➔
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function SeatsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-2xl text-gray-400">Loading Seat Map...</div>}>
        <SeatsContent />
      </Suspense>
    </main>
  );
}