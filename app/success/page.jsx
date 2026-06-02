"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { auth, db } from "../../firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const getMealTaxonomy = (name) => {
  if (["Paneer Tikka Masala", "Veg Hakka Noodles", "Spinach & Ricotta Pasta"].includes(name)) return ["Vegetarian Meals"];
  if (["Chicken Biryani", "Grilled Lemon Chicken", "Spicy Mutton Curry"].includes(name)) return ["Non-Veg Meals"];
  if (["Vegan Buddha Bowl", "Tofu Stir-fry", "Vegan Black Bean Burger"].includes(name)) return ["Vegan Meals"];
  return ["Snacks & Beverages"];
};

const getSeatTracking = (seatCode) => {
  if (!seatCode) return { id: "Seat", name: "Seat", taxonomy: ["paid seats"] };
  const row = parseInt(seatCode.replace(/[^0-9]/g, ""), 10);
  const letter = seatCode.replace(/[0-9]/g, "");
  
  let label = "Standard Middle";
  if (row <= 3) label = "Business Upgrade";
  else if (row <= 5) label = "Extra Legroom";
  else if (["A", "J", "C", "D", "F", "G"].includes(letter)) label = "Window / Aisle";
  
  const seatName = `Seat ${seatCode} (${label})`;
  return {
    product_id: seatName,
    name: seatName,
    taxonomy: ["paid seats"]
  };
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [flyerId, setFlyerId] = useState("Guest_Account");
  const [authLoaded, setAuthLoaded] = useState(false);
  const [txnId, setTxnId] = useState("");
  const hasFiredPurchase = useRef(false);

  const adults = parseInt(searchParams.get("adults")) || 1;
  const children = parseInt(searchParams.get("children")) || 0;
  const infants = parseInt(searchParams.get("infants")) || 0;
  const totalSeatsRequired = adults + children;

  const [confirmedItinerary, setConfirmedItinerary] = useState({
    outboundFlight: null,
    returnFlight: null,
    meals: [],
    baggage: [],
    seats: [],
    insurance: false
  });

  useEffect(() => {
    setTxnId(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);

    try {
      const outboundData = localStorage.getItem("selectedOutboundFlight");
      const returnData = localStorage.getItem("selectedReturnFlight");
      
      const mealsArr = JSON.parse(localStorage.getItem("selectedMeals")) || [];
      const baggageArr = JSON.parse(localStorage.getItem("selectedBaggage")) || [];
      const seatsArr = JSON.parse(localStorage.getItem("selectedSeats")) || [];
      const insuranceBool = localStorage.getItem("selectedInsurance") === "true";

      setConfirmedItinerary({
        outboundFlight: outboundData ? JSON.parse(outboundData) : null,
        returnFlight: returnData ? JSON.parse(returnData) : null,
        meals: mealsArr,
        baggage: baggageArr,
        seats: seatsArr,
        insurance: insuranceBool
      });
    } catch (error) {
      console.error("Failed to parse localized session arrays:", error);
    }
  }, [searchParams]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setFlyerId(userDocSnap.data().membershipId || "Guest_Account");
          }
        } catch (err) {
          console.error("Firestore loading error:", err);
        }
      }
      setAuthLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  const parseNumPrice = (v) => {
    if (!v) return 0;
    return typeof v === "number" ? v : parseFloat(v.replace(/[^0-9.]/g, ""));
  };

  const outboundPrice = confirmedItinerary.outboundFlight ? parseNumPrice(confirmedItinerary.outboundFlight.price) * totalSeatsRequired : 0;
  const returnPrice = confirmedItinerary.returnFlight ? parseNumPrice(confirmedItinerary.returnFlight.price) * totalSeatsRequired : 0;
  const mealsPrice = confirmedItinerary.meals.reduce((sum, m) => sum + parseNumPrice(m.price), 0);
  const baggagePrice = confirmedItinerary.baggage.reduce((sum, b) => sum + parseNumPrice(b.price), 0);
  const seatsPrice = confirmedItinerary.seats.reduce((sum, s) => sum + parseNumPrice(s.price), 0);
  const insurancePrice = confirmedItinerary.insurance ? 29 : 0;

  const summaryGrandTotal = outboundPrice + returnPrice + mealsPrice + baggagePrice + seatsPrice + insurancePrice;

  // Llifecycle Fire Logic
  useEffect(() => {
    if (authLoaded && confirmedItinerary.outboundFlight && !hasFiredPurchase.current && txnId) {
      const purchaseItems = [];

      if (confirmedItinerary.outboundFlight) {
        const route = `${confirmedItinerary.outboundFlight.originCode}-${confirmedItinerary.outboundFlight.destCode}`;
        purchaseItems.push({
          product_id: route,
          name: route,
          taxonomy: [route],
          price: parseNumPrice(confirmedItinerary.outboundFlight.price),
          quantity: totalSeatsRequired
        });
      }

      if (confirmedItinerary.returnFlight) {
        const route = `${confirmedItinerary.returnFlight.originCode}-${confirmedItinerary.returnFlight.destCode}`;
        purchaseItems.push({
          product_id: route,
          name: route,
          taxonomy: [route],
          price: parseNumPrice(confirmedItinerary.returnFlight.price),
          quantity: totalSeatsRequired
        });
      }

      confirmedItinerary.meals.forEach((meal) => {
        purchaseItems.push({
          product_id: meal.name,
          name: meal.name,
          taxonomy: getMealTaxonomy(meal.name),
          price: parseNumPrice(meal.price),
          quantity: 1
        });
      });

      confirmedItinerary.baggage.forEach((bag) => {
        purchaseItems.push({
          product_id: bag.name,
          name: bag.name,
          taxonomy: ["Baggage Add-ons"],
          price: parseNumPrice(bag.price),
          quantity: 1
        });
      });

      confirmedItinerary.seats.forEach((seat) => {
        const seatTrack = getSeatTracking(seat.number);
        purchaseItems.push({
          product_id: seatTrack.product_id,
          name: seatTrack.name,
          taxonomy: seatTrack.taxonomy,
          price: parseNumPrice(seat.price),
          quantity: 1
        });
      });

      if (confirmedItinerary.insurance) {
        purchaseItems.push({
          product_id: "Flight Protection Plan",
          name: "Flight Protection Plan",
          taxonomy: ["Insurance Plan"],
          price: 29,
          quantity: 1
        });
      }

      // --- THE OFFICIAL PURCHASE EVENT ---
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "purchase",
        transaction_id: txnId,
        value: summaryGrandTotal, 
        currency: "USD",
        email: user?.email || "anonymous-flyer@insiderair.com",
        flyer_id: flyerId,
        items: purchaseItems
      });

      console.log("Fired GTM: purchase", txnId, summaryGrandTotal);
      hasFiredPurchase.current = true;

      // Flush cache keys completely
      localStorage.removeItem("selectedOutboundFlight");
      localStorage.removeItem("selectedReturnFlight");
      localStorage.removeItem("selectedAddons");
      localStorage.removeItem("selectedMeals");
      localStorage.removeItem("selectedBaggage");
      localStorage.removeItem("selectedSeats");
      localStorage.removeItem("selectedInsurance");
    }
  }, [authLoaded, confirmedItinerary, txnId, user, flyerId, summaryGrandTotal, totalSeatsRequired]);

  if (authLoaded && !confirmedItinerary.outboundFlight) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-8 border-2 border-dashed border-gray-200 text-center max-w-md">
          <div className="text-5xl mb-4">🎟️</div>
          <h2 className="text-xl font-black text-black mb-2">No Confirmation Session Found</h2>
          <a href="/" className="inline-block bg-black text-white font-black px-6 py-3 rounded-lg text-sm uppercase">Go To Search Engine</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-7xl mb-4">🎉</div>
          <h1 className="text-4xl font-black text-black mb-2">Booking Confirmed!</h1>
          <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Thank you for flying with Insider Air</p>
          <div className="inline-block bg-green-100 text-green-800 text-xs font-black px-4 py-1.5 rounded-full uppercase mt-4 border border-green-200">Receipt Reference: {txnId}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-black text-white p-4 px-6 flex justify-between items-center text-xs font-black tracking-wide uppercase">
            <div>Confirmed Passenger Manifest</div>
            <div className="text-[#f5482b]">{adults} Adult{adults > 1 && "s"}{children > 0 && ` • ${children} Children`}{infants > 0 && ` • ${infants} Infant`}</div>
          </div>

          <div className="p-6 md:p-8 flex flex-col gap-6">
            {confirmedItinerary.outboundFlight && (
              <div className="border-b border-gray-100 pb-4">
                <div className="text-xs font-black text-green-600 uppercase tracking-wider mb-2">✓ Confirmed Outbound</div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-lg text-black">{confirmedItinerary.outboundFlight.originCode} ➔ {confirmedItinerary.outboundFlight.destCode}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase mt-1">{confirmedItinerary.outboundFlight.airline} • {confirmedItinerary.outboundFlight.flightNo}</p>
                  </div>
                  <div className="text-right font-black text-black text-base">${(parseNumPrice(confirmedItinerary.outboundFlight.price) * totalSeatsRequired).toFixed(2)}</div>
                </div>
              </div>
            )}

            {confirmedItinerary.returnFlight && (
              <div className="border-b border-gray-100 pb-4">
                <div className="text-xs font-black text-green-600 uppercase tracking-wider mb-2">✓ Confirmed Return</div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-lg text-black">{confirmedItinerary.returnFlight.originCode} ➔ {confirmedItinerary.returnFlight.destCode}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase mt-1">{confirmedItinerary.returnFlight.airline} • {confirmedItinerary.returnFlight.flightNo}</p>
                  </div>
                  <div className="text-right font-black text-black text-base">${(parseNumPrice(confirmedItinerary.returnFlight.price) * totalSeatsRequired).toFixed(2)}</div>
                </div>
              </div>
            )}

            {(mealsPrice > 0 || baggagePrice > 0 || seatsPrice > 0 || confirmedItinerary.insurance) && (
              <div className="border-b border-gray-100 pb-4">
                <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Allocated Add-ons & Services</div>
                <div className="flex flex-col gap-2.5">
                  {confirmedItinerary.seats.map((seat, i) => (
                    <div key={`s-${i}`} className="flex justify-between text-sm"><span className="text-gray-600 font-medium">Seat allocation ({seat.number})</span><span className="font-bold text-black">{seat.price}</span></div>
                  ))}
                  {confirmedItinerary.baggage.map((bag, i) => (
                    <div key={`b-${i}`} className="flex justify-between text-sm"><span className="text-gray-600 font-medium">{bag.name}</span><span className="font-bold text-black">{bag.price}</span></div>
                  ))}
                  {confirmedItinerary.meals.map((meal, i) => (
                    <div key={`m-${i}`} className="flex justify-between text-sm"><span className="text-gray-600 font-medium">{meal.name}</span><span className="font-bold text-black">{meal.price}</span></div>
                  ))}
                  {confirmedItinerary.insurance && <div className="flex justify-between text-sm"><span className="text-gray-600 font-medium">Flight Protection Travel Insurance</span><span className="font-bold text-black">$29.00</span></div>}
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex flex-col gap-2 text-sm font-bold text-gray-500 mt-2">
              <div className="flex justify-between"><span>Airfare Ledger Base</span><span className="text-gray-900">${(outboundPrice + returnPrice).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Ancillaries Ledger Subtotal</span><span className="text-gray-900">${(mealsPrice + baggagePrice + seatsPrice + insurancePrice).toFixed(2)}</span></div>
              <div className="flex justify-between items-center text-black font-black text-2xl border-t border-gray-200 pt-4 mt-2">
                <span>Total Amount Charged</span>
                <span className="text-green-600">${summaryGrandTotal.toFixed(2)}</span>
              </div>
            </div>

            <a href="/" className="w-full">
              <button className="w-full bg-black hover:bg-gray-800 text-white font-black py-4 rounded-xl text-lg mt-4 text-center">Return to Search Dashboard</button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-2xl text-gray-400">Loading Secure Manifest Token...</div>}>
      <SuccessContent />
    </Suspense>
  );
}