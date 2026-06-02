"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { auth, db } from "../../firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState({ membershipId: "" });
  const [loading, setLoading] = useState(true);
  const hasFiredCartEvent = useRef(false);

  const adults = parseInt(searchParams.get("adults")) || 1;
  const children = parseInt(searchParams.get("children")) || 0;
  const infants = parseInt(searchParams.get("infants")) || 0;
  const totalSeatsRequired = adults + children;

  const [itinerary, setItinerary] = useState({
    outboundFlight: null,
    returnFlight: null,
    meals: [],
    baggage: [],
    seats: [],
    insurance: false
  });

  // 1. Load active data records from state streams
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserProfile({
              membershipId: userDocSnap.data().membershipId || ""
            });
          }
        } catch (err) {
          console.error("Error reading data collection values:", err);
        }
      }
    });

    try {
      const outboundData = localStorage.getItem("selectedOutboundFlight");
      const returnData = localStorage.getItem("selectedReturnFlight");
      
      let mealsArr = [];
      let baggageArr = [];
      let seatsArr = [];
      let insuranceBool = false;

      const combinedAddons = localStorage.getItem("selectedAddons");
      if (combinedAddons) {
        const parsedAddons = JSON.parse(combinedAddons);
        mealsArr = parsedAddons.meals || [];
        baggageArr = parsedAddons.baggage || [];
        seatsArr = parsedAddons.seats || [];
        insuranceBool = parsedAddons.insurance || false;
      } else {
        mealsArr = JSON.parse(localStorage.getItem("selectedMeals")) || [];
        baggageArr = JSON.parse(localStorage.getItem("selectedBaggage")) || [];
        seatsArr = JSON.parse(localStorage.getItem("selectedSeats")) || [];
        insuranceBool = localStorage.getItem("selectedInsurance") === "true";
      }

      setItinerary({
        outboundFlight: outboundData ? JSON.parse(outboundData) : null,
        returnFlight: returnData ? JSON.parse(returnData) : null,
        meals: mealsArr,
        baggage: baggageArr,
        seats: seatsArr,
        insurance: insuranceBool
      });

    } catch (error) {
      console.error("Failed to recover active state vectors:", error);
    }

    setLoading(false);
    return () => unsubscribe();
  }, [searchParams]);

  const formatPrice = (rawVal) => {
    if (!rawVal) return 0;
    return typeof rawVal === "number" ? rawVal : parseFloat(rawVal.replace(/[^0-9.]/g, ""));
  };

  const outboundTotalCost = itinerary.outboundFlight ? formatPrice(itinerary.outboundFlight.price) * totalSeatsRequired : 0;
  const returnTotalCost = itinerary.returnFlight ? formatPrice(itinerary.returnFlight.price) * totalSeatsRequired : 0;
  
  const mealsTotalCost = itinerary.meals.reduce((acc, m) => acc + formatPrice(m.price), 0);
  const baggageTotalCost = itinerary.baggage.reduce((acc, b) => acc + formatPrice(b.price), 0);
  const seatsTotalCost = itinerary.seats.reduce((acc, s) => acc + formatPrice(s.price), 0);
  const insuranceTotalCost = itinerary.insurance ? 29 : 0;

  const orderGrandTotal = outboundTotalCost + returnTotalCost + mealsTotalCost + baggageTotalCost + seatsTotalCost + insuranceTotalCost;

  // 2. AUTOMATIC GTM PUSH: final_cart Event
  useEffect(() => {
    if (!loading && itinerary.outboundFlight && !hasFiredCartEvent.current) {
      const lineItems = [];

      if (itinerary.outboundFlight) {
        lineItems.push({
          product_id: `${itinerary.outboundFlight.originCode}-${itinerary.outboundFlight.destCode}-OUT`,
          name: `Outbound Flight: ${itinerary.outboundFlight.flightNo}`,
          taxonomy: ["Flights", "Outbound"],
          price: formatPrice(itinerary.outboundFlight.price),
          quantity: totalSeatsRequired
        });
      }

      if (itinerary.returnFlight) {
        lineItems.push({
          product_id: `${itinerary.returnFlight.originCode}-${itinerary.returnFlight.destCode}-RET`,
          name: `Return Flight: ${itinerary.returnFlight.flightNo}`,
          taxonomy: ["Flights", "Return"],
          price: formatPrice(itinerary.returnFlight.price),
          quantity: totalSeatsRequired
        });
      }

      itinerary.seats.forEach((seat) => {
        lineItems.push({
          product_id: `SEAT-${seat.number || seat}`,
          name: `Seat Assignment: ${seat.number || seat}`,
          taxonomy: ["Ancillaries", "Seats"],
          price: formatPrice(seat.price) || 10,
          quantity: 1
        });
      });

      itinerary.baggage.forEach((bag, idx) => {
        lineItems.push({
          product_id: `BAG-${idx}`,
          name: bag.name || "Checked Baggage",
          taxonomy: ["Ancillaries", "Baggage"],
          price: formatPrice(bag.price),
          quantity: 1
        });
      });

      itinerary.meals.forEach((meal, idx) => {
        lineItems.push({
          product_id: `MEAL-${idx}`,
          name: meal.name || "Inflight Meal Selection",
          taxonomy: ["Ancillaries", "Meals"],
          price: formatPrice(meal.price),
          quantity: 1
        });
      });

      if (itinerary.insurance) {
        lineItems.push({
          product_id: "INS-TRAVEL",
          name: "Flight Protection Plan",
          taxonomy: ["Ancillaries", "Insurance"],
          price: 29,
          quantity: 1
        });
      }

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "final_cart",
        value: orderGrandTotal,
        currency: "USD",
        email: user?.email || "anonymous-flyer@insiderair.com",
        flyer_id: userProfile.membershipId || "Guest_Account",
        items: lineItems
      });

      console.log("Fired GTM: final_cart mapping deployed:", lineItems);
      hasFiredCartEvent.current = true;
    }
  }, [loading, itinerary, user, userProfile, orderGrandTotal, totalSeatsRequired]);

  // 3. Forward User to Success Page
  const handlePaymentSubmit = () => {
    window.location.href = `/success?${searchParams.toString()}`;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-black text-2xl text-gray-400">Syncing Engine Core...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-black mb-2">Review Your Itinerary</h1>
        <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-8">Live session confirmation desk</p>

        {!itinerary.outboundFlight ? (
          <div className="bg-white rounded-xl shadow-md p-8 border-2 border-dashed border-gray-200 text-center">
            <div className="text-5xl mb-4">🎟️</div>
            <h2 className="text-xl font-black text-black mb-2">No Active Booking Session Found</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">Your checkout desk is currently empty because no flight parameters were saved from the selection screen.</p>
            <a href="/" className="inline-block bg-black text-white font-black px-6 py-3 rounded-lg text-sm uppercase transition-transform active:scale-95">Go To Search Engine</a>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-black text-white p-4 px-6 flex justify-between items-center text-xs font-black tracking-wide uppercase">
              <div>Passenger Configuration</div>
              <div className="text-[#f5482b]">
                {adults} Adult{adults > 1 && "s"}
                {children > 0 && ` • ${children} Child${children > 1 ? "ren" : ""}`}
                {infants > 0 && ` • ${infants} Infant${infants > 1 ? "s" : ""}`}
              </div>
            </div>

            <div className="p-6 md:p-8 flex flex-col gap-6">
              {/* Outbound Leg */}
              <div className="border-b border-gray-100 pb-4">
                <div className="text-xs font-black text-[#f5482b] uppercase tracking-wider mb-2">Outbound Flight Details</div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-lg text-black">{itinerary.outboundFlight.originCode} ➔ {itinerary.outboundFlight.destCode}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase mt-1">{itinerary.outboundFlight.airline} • {itinerary.outboundFlight.flightNo} • ({itinerary.outboundFlight.depTime} - {itinerary.outboundFlight.arrTime})</p>
                  </div>
                  <div className="text-right font-black text-black text-base">
                    {itinerary.outboundFlight.price} <span className="text-xs font-bold text-gray-400 block mt-0.5">x{totalSeatsRequired} Passenger{totalSeatsRequired > 1 && "s"}</span>
                  </div>
                </div>
              </div>

              {/* Return Leg */}
              {itinerary.returnFlight && (
                <div className="border-b border-gray-100 pb-4">
                  <div className="text-xs font-black text-[#f5482b] uppercase tracking-wider mb-2">Return Flight Details</div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-lg text-black">{itinerary.returnFlight.originCode} ➔ {itinerary.returnFlight.destCode}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase mt-1">{itinerary.returnFlight.airline} • {itinerary.returnFlight.flightNo} • ({itinerary.returnFlight.depTime} - {itinerary.returnFlight.arrTime})</p>
                    </div>
                    <div className="text-right font-black text-black text-base">
                      {itinerary.returnFlight.price} <span className="text-xs font-bold text-gray-400 block mt-0.5">x{totalSeatsRequired} Passenger{totalSeatsRequired > 1 && "s"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Ancillaries / Add-ons Summary */}
              {(mealsTotalCost > 0 || baggageTotalCost > 0 || seatsTotalCost > 0 || itinerary.insurance) && (
                <div className="border-b border-gray-100 pb-4">
                  <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Selected Baggage, Seats & Meals</div>
                  <div className="flex flex-col gap-2.5">
                    {itinerary.seats.map((seat, i) => (
                      <div key={`s-${i}`} className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">Seat Selection ({seat.number || seat})</span>
                        <span className="font-bold text-black">{seat.price || "$10.00"}</span>
                      </div>
                    ))}
                    {itinerary.baggage.map((bag, i) => (
                      <div key={`b-${i}`} className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">{bag.name || "Checked Luggage Allocation"}</span>
                        <span className="font-bold text-black">{bag.price}</span>
                      </div>
                    ))}
                    {itinerary.meals.map((meal, i) => (
                      <div key={`m-${i}`} className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">{meal.name || "Inflight Hot Meal Order"}</span>
                        <span className="font-bold text-black">{meal.price}</span>
                      </div>
                    ))}
                    {itinerary.insurance && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">Flight Protection Travel Insurance</span>
                        <span className="font-bold text-black">$29.00</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Price Calculations */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex flex-col gap-2 text-sm font-bold text-gray-500 mt-2">
                <div className="flex justify-between"><span>Base Airfare Subtotal</span><span className="text-gray-900">${(outboundTotalCost + returnTotalCost).toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Ancillaries Subtotal</span><span className="text-gray-900">${(mealsTotalCost + baggageTotalCost + seatsTotalCost + insuranceTotalCost).toFixed(2)}</span></div>
                <div className="flex justify-between items-center text-black font-black text-2xl border-t border-gray-200 pt-4 mt-2">
                  <span>Grand Total</span>
                  <span className="text-[#f5482b]">${orderGrandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* CHANGED: BUTTON ATTRIBUTES AS REQUESTED */}
              <button 
                onClick={handlePaymentSubmit}
                className="w-full bg-[#f5482b] hover:bg-[#d83c20] text-white font-black py-4 rounded-xl text-lg transition-transform shadow-lg mt-4 active:scale-[0.99]"
              >
                Pay with a Smile ➔
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-2xl text-gray-400">Loading Checkout Session Configuration...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}