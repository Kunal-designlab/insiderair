"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [bookingData, setBookingData] = useState({
    outboundFlight: null,
    returnFlight: null,
    passengers: { adults: 1, children: 0, infants: 0 },
    addons: { meals: [], baggage: [], seats: [], insurance: false }
  });

  // 1. Pull Context from previous funnel steps via localStorage
  useEffect(() => {
    // Sync active Firebase user session
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
    });

    try {
      // Parse active session states
      const outbound = JSON.parse(localStorage.getItem("selectedOutboundFlight")) || null;
      const returning = JSON.parse(localStorage.getItem("selectedReturnFlight")) || null;
      const passengerConfig = JSON.parse(localStorage.getItem("passengerCounts")) || { adults: 1, children: 0, infants: 0 };
      const selectedAddons = JSON.parse(localStorage.getItem("selectedAddons")) || { meals: [], baggage: [], seats: [], insurance: false };

      setBookingData({
        outboundFlight: outbound,
        returnFlight: returning,
        passengers: passengerConfig,
        addons: selectedAddons
      });
    } catch (error) {
      console.error("Error reading checkout session cache:", error);
    }
    
    setLoading(false);
    return () => unsubscribe();
  }, []);

  // 2. Math Calculations for pricing blocks
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    return typeof priceStr === "number" ? priceStr : parseFloat(priceStr.replace(/[^0-9.]/g, ""));
  };

  const totalPassengers = bookingData.passengers.adults + bookingData.passengers.children;
  
  const outboundCost = bookingData.outboundFlight ? parsePrice(bookingData.outboundFlight.price) * totalPassengers : 0;
  const returnCost = bookingData.returnFlight ? parsePrice(bookingData.returnFlight.price) * totalPassengers : 0;

  // Calculate Addon Subtotals
  const mealsCost = bookingData.addons.meals.reduce((sum, item) => sum + parsePrice(item.price), 0);
  const baggageCost = bookingData.addons.baggage.reduce((sum, item) => sum + parsePrice(item.price), 0);
  const seatsCost = bookingData.addons.seats.reduce((sum, item) => sum + parsePrice(item.price), 0);
  const insuranceCost = bookingData.addons.insurance ? 29 : 0;

  const orderTotal = outboundCost + returnCost + mealsCost + baggageCost + seatsCost + insuranceCost;

  // 3. Execution Function for Final Purchase Handshake
  const handlePaymentSubmit = (e) => {
    e.preventDefault();

    const transactionId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Construct individual line items using your established naming guidelines
    const purchaseItems = [];

    if (bookingData.outboundFlight) {
      purchaseItems.push({
        product_id: `${bookingData.outboundFlight.originCode || "OUT"}-${bookingData.outboundFlight.destCode || "DEST"}`,
        name: `Outbound Flight: ${bookingData.outboundFlight.flightNo}`,
        taxonomy: ["Flights", "Outbound"],
        price: parsePrice(bookingData.outboundFlight.price),
        quantity: totalPassengers
      });
    }

    if (bookingData.returnFlight) {
      purchaseItems.push({
        product_id: `${bookingData.returnFlight.originCode || "RET"}-${bookingData.returnFlight.destCode || "DEST"}`,
        name: `Return Flight: ${bookingData.returnFlight.flightNo}`,
        taxonomy: ["Flights", "Return"],
        price: parsePrice(bookingData.returnFlight.price),
        quantity: totalPassengers
      });
    }

    bookingData.addons.meals.forEach((meal, i) => {
      purchaseItems.push({
        product_id: `MEAL-${i}`,
        name: meal.name,
        taxonomy: ["Ancillaries", "Meals"],
        price: parsePrice(meal.price),
        quantity: 1
      });
    });

    bookingData.addons.baggage.forEach((bag, i) => {
      purchaseItems.push({
        product_id: `BAG-${i}`,
        name: bag.name,
        taxonomy: ["Ancillaries", "Baggage"],
        price: parsePrice(bag.price),
        quantity: 1
      });
    });

    bookingData.addons.seats.forEach((seat) => {
      purchaseItems.push({
        product_id: `SEAT-${seat.number}`,
        name: `Seat Assignment: ${seat.number}`,
        taxonomy: ["Ancillaries", "Seats"],
        price: parsePrice(seat.price),
        quantity: 1
      });
    });

    if (bookingData.addons.insurance) {
      purchaseItems.push({
        product_id: "INS-TRAVEL",
        name: "Flight Protection Insurance",
        taxonomy: ["Ancillaries", "Insurance"],
        price: 29,
        quantity: 1
      });
    }

    // --- ENHANCED DATALAYER PURCHASE EVENT ---
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "purchase",
      transaction_id: transactionId,
      value: orderTotal,
      currency: "USD",
      email: user?.email || "guest@insiderair.com",
      items: purchaseItems
    });

    console.log("Fired GTM: purchase event dropped into stream", transactionId);

    // Wipe cached flight details to avoid multi-submits
    localStorage.removeItem("selectedOutboundFlight");
    localStorage.removeItem("selectedReturnFlight");
    localStorage.removeItem("selectedAddons");

    alert(`Payment Successful!\nYour Transaction ID is ${transactionId}. Blue skies ahead!`);
    window.location.href = "/bookings";
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-black text-2xl text-gray-400">Loading Checkout...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-black mb-8">Secure Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: PAYMENT ENTRY FORM */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            <form onSubmit={handlePaymentSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-100">
              <h2 className="text-xl font-black text-black mb-6 uppercase tracking-wide">Payment Details</h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-400 mb-2 uppercase">Name on Credit Card</label>
                  <input type="text" required defaultValue={user?.displayName || ""} className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f5482b] font-medium text-sm text-black bg-white" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-gray-400 mb-2 uppercase">Card Number</label>
                  <input type="text" required placeholder="0000 0000 0000 0000" maxLength="16" className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f5482b] font-medium text-sm text-black bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-400 mb-2 uppercase">Expiration Date</label>
                    <input type="text" required placeholder="MM/YY" maxLength="5" className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f5482b] font-medium text-sm text-black bg-white text-center" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-gray-400 mb-2 uppercase">Security Code (CVV)</label>
                    <input type="password" required placeholder="***" maxLength="3" className="w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#f5482b] font-medium text-sm text-black bg-white text-center" />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-[#f5482b] hover:bg-[#d83c20] text-white font-black py-4 rounded-xl text-lg transition-all shadow-lg mt-8 active:scale-[0.99]">
                Authorize Payment — ${orderTotal.toFixed(2)}
              </button>
            </form>
          </div>

          {/* RIGHT: DYNAMIC SUMMARY CARD BLOCK */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h2 className="text-lg font-black text-black border-b border-gray-100 pb-3 mb-4 uppercase tracking-wide">Itinerary Review</h2>

              {/* Passenger Split Description */}
              <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 flex justify-between">
                <span>PASSENGERS:</span>
                <span>{bookingData.passengers.adults} ADT {bookingData.passengers.children > 0 && `• ${bookingData.passengers.children} CHD`} {bookingData.passengers.infants > 0 && `• ${bookingData.passengers.infants} INF`}</span>
              </div>

              {/* Outbound Section */}
              {bookingData.outboundFlight ? (
                <div className="mb-4 border-b border-gray-100 pb-4">
                  <div className="text-xs font-black text-[#f5482b] uppercase tracking-wider mb-1">Outbound Leg</div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-black text-black">{bookingData.outboundFlight.airline} ({bookingData.outboundFlight.flightNo})</span>
                    <span className="font-bold text-gray-900">{bookingData.outboundFlight.price} x {totalPassengers}</span>
                  </div>
                  <div className="text-xs text-gray-400 font-bold uppercase mt-0.5">{bookingData.outboundFlight.depTime} ➔ {bookingData.outboundFlight.arrTime}</div>
                </div>
              ) : (
                <div className="text-xs text-red-500 font-bold mb-4">⚠️ No Outbound Flight Selected</div>
              )}

              {/* Return Leg Section */}
              {bookingData.returnFlight && (
                <div className="mb-4 border-b border-gray-100 pb-4">
                  <div className="text-xs font-black text-[#f5482b] uppercase tracking-wider mb-1">Return Leg</div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-black text-black">{bookingData.returnFlight.airline} ({bookingData.returnFlight.flightNo})</span>
                    <span className="font-bold text-gray-900">{bookingData.returnFlight.price} x {totalPassengers}</span>
                  </div>
                  <div className="text-xs text-gray-400 font-bold uppercase mt-0.5">{bookingData.returnFlight.depTime} ➔ {bookingData.returnFlight.arrTime}</div>
                </div>
              )}

              {/* Dynamic Ancillaries Itemization Mapping */}
              {(mealsCost > 0 || baggageCost > 0 || seatsCost > 0 || bookingData.addons.insurance) && (
                <div className="mb-4 border-b border-gray-100 pb-4">
                  <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Selected Addons</div>
                  <div className="flex flex-col gap-2 text-xs font-bold text-gray-700">
                    {bookingData.addons.seats.map((seat, i) => (
                      <div key={`s-${i}`} className="flex justify-between"><span>Seat assignment ({seat.number})</span><span>{seat.price}</span></div>
                    ))}
                    {bookingData.addons.baggage.map((bag, i) => (
                      <div key={`b-${i}`} className="flex justify-between"><span>{bag.name}</span><span>{bag.price}</span></div>
                    ))}
                    {bookingData.addons.meals.map((meal, i) => (
                      <div key={`m-${i}`} className="flex justify-between"><span>{meal.name}</span><span>{meal.price}</span></div>
                    ))}
                    {bookingData.addons.insurance && (
                      <div className="flex justify-between"><span>Flight protection insurance</span><span>$29.00</span></div>
                    )}
                  </div>
                </div>
              )}

              {/* Total Summary Pricing Blocks */}
              <div className="flex flex-col gap-2 pt-2 text-sm">
                <div className="flex justify-between font-bold text-gray-500"><span>Subtotal Airfare</span><span>${(outboundCost + returnCost).toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-gray-500"><span>Subtotal Addons</span><span>${(mealsCost + baggageCost + seatsCost + insuranceCost).toFixed(2)}</span></div>
                <div className="flex justify-between font-black text-xl text-black border-t-2 border-gray-100 pt-4 mt-2">
                  <span>Grand Total</span>
                  <span className="text-[#f5482b]">${orderTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}