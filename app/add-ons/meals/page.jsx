"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const MENU = {
  veg: [
    { id: "v1", name: "Paneer Tikka Masala", desc: "Served with bread, rice and yogurt", price: 12, img: "/meals/paneer.png" },
    { id: "v2", name: "Veg Hakka Noodles", desc: "Classic wok-tossed noodles with manchurian", price: 10, img: "/meals/hakka.png" },
    { id: "v3", name: "Spinach & Ricotta Pasta", desc: "Creamy tomato basil sauce", price: 14, img: "/meals/pasta.png" },
  ],
  nonVeg: [
    { id: "nv1", name: "Chicken Biryani", desc: "Aromatic rice with boneless chicken", price: 15, img: "/meals/biryani.png" },
    { id: "nv2", name: "Grilled Lemon Chicken", desc: "With roasted veggies and mash", price: 16, img: "/meals/chicken.png" },
    { id: "nv3", name: "Spicy Mutton Curry", desc: "Served with steamed rice", price: 18, img: "/meals/mutton.png" },
  ],
  vegan: [
    { id: "vg1", name: "Vegan Buddha Bowl", desc: "Quinoa, avocado, and roasted chickpeas", price: 14, img: "/meals/buddha.png" },
    { id: "vg2", name: "Tofu Stir-fry", desc: "With broccoli and brown rice", price: 13, img: "/meals/tofu.png" },
    { id: "vg3", name: "Vegan Black Bean Burger", desc: "Served with baked sweet potato fries", price: 12, img: "/meals/beanburger.png" },
  ],
  extras: [
    { id: "ex1", name: "Veg Sandwich", price: 6, img: "/meals/vegsandwitch.png" },
    { id: "ex2", name: "Non-Veg Sandwich", price: 7, img: "/meals/nonvegs.png" },
    { id: "ex3", name: "Veg Cheeseburger", price: 8, img: "/meals/vegb.png" },
    { id: "ex4", name: "Non-Veg Cheeseburger", price: 9, img: "/meals/nonvegb.png" },
    { id: "ex5", name: "Coca Cola Can", price: 3, img: "/meals/cocacola.png" },
    { id: "ex6", name: "Tetra Juice (Apple/Orange)", price: 4, img: "/meals/juice.png" },
    { id: "ex7", name: "Red Bull Energy", price: 5, img: "/meals/redbull.png" },
    { id: "ex8", name: "Toblerone Chocolate", price: 4, img: "/meals/toberlone.png" },
    { id: "ex9", name: "Skittles", price: 3, img: "/meals/skittles.png" },
  ]
};

const TAXONOMY_MAP = {
  veg: "Vegetarian Meals",
  nonVeg: "Non-Veg Meals",
  vegan: "Vegan Meals",
  extras: "Snacks & Beverages"
};

function MealsContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("veg");
  const [cart, setCart] = useState({});

  const updateCart = (item, delta, category) => {
    setCart(prev => {
      const currentQty = prev[item.id]?.quantity || 0;
      const newQty = Math.max(0, currentQty + delta);
      
      if (newQty === 0) {
        const newCart = { ...prev };
        delete newCart[item.id];
        return newCart;
      }
      
      return {
        ...prev,
        [item.id]: { ...item, quantity: newQty }
      };
    });

    const eventName = delta > 0 ? "item_added_to_cart" : "item_removed_from_cart";
    const actionType = delta > 0 ? "add_to_cart" : "remove_from_cart";
    const salePrice = Number((item.price * 0.85).toFixed(2));
    const absQty = Math.abs(delta);

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      action_type: actionType,
      product_id: item.name,     
      name: item.name,
      taxonomy: [TAXONOMY_MAP[category]],
      price: item.price,
      sale_price: salePrice,
      quantity: absQty,
      image_url: window.location.origin + item.img, 
      url: window.location.origin + "/"             
    });

    console.log(`Fired GTM: ${eventName}`, item.name);
  };

  const subtotal = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = subtotal > 0 ? subtotal * 0.15 : 0;
  const total = subtotal - discount;

  // --- UPDATED: CONVERTING CART QUANTITIES AND FLUSHING TO STORAGE ---
  const handleNext = () => {
    const serializedMeals = Object.values(cart).flatMap(item => 
      Array.from({ length: item.quantity }, () => ({
        name: item.name,
        price: `$${item.price}`
      }))
    );
    
    localStorage.setItem("selectedMeals", JSON.stringify(serializedMeals));
    alert("Meals saved to your booking!");
    window.location.href = `/add-ons/baggage?${searchParams.toString()}`;
  };

  const MenuCard = ({ item, category }) => {
    const qty = cart[item.id]?.quantity || 0;
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:border-[#f5482b] transition-colors">
        <div className="h-40 bg-gray-200 relative">
          <img src={item.img} alt={item.name} className="w-full h-full object-cover fallback-bg" onError={(e) => e.target.style.display = 'none'} />
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-bold text-xs"></div>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-black text-black text-lg leading-tight">{item.name}</h3>
          {item.desc && <p className="text-xs text-gray-500 mt-1 font-medium">{item.desc}</p>}
          
          <div className="mt-auto pt-4 flex items-center justify-between">
            <div className="font-black text-[#f5482b] text-xl">${item.price}</div>
            
            {qty === 0 ? (
              <button onClick={() => updateCart(item, 1, category)} className="bg-black text-white font-bold text-xs py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors">
                ADD
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                <button onClick={() => updateCart(item, -1, category)} className="w-6 h-6 flex items-center justify-center font-black text-black hover:text-[#f5482b]">-</button>
                <span className="font-black text-sm w-4 text-center">{qty}</span>
                <button onClick={() => updateCart(item, 1, category)} className="w-6 h-6 flex items-center justify-center font-black text-black hover:text-[#f5482b]">+</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-2/3">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-black text-black">In-Flight Dining</h1>
          <p className="text-gray-500 font-bold uppercase text-sm mt-1 tracking-wide">Select meals for your journey</p>
        </div>

        <div className="bg-gradient-to-r from-[#f5482b] to-[#ff7e67] p-4 rounded-xl shadow-md text-white flex items-center justify-between mb-8">
          <div>
            <div className="font-black text-lg">✈️ Pre-order & Save 15%</div>
            <div className="text-sm font-medium mt-1">Pre-book your meals now to avoid higher airport fees and guarantee your choice!</div>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar border-b border-gray-200">
          {[
            { id: 'veg', label: 'Vegetarian Meals' },
            { id: 'nonVeg', label: 'Non-Veg Meals' },
            { id: 'vegan', label: 'Vegan Meals' },
            { id: 'extras', label: 'Snacks & Beverages' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap px-6 py-3 font-black text-sm rounded-t-lg transition-colors ${activeTab === tab.id ? 'bg-black text-white' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}>{tab.label}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {MENU[activeTab].map(item => (
            <MenuCard key={item.id} item={item} category={activeTab} />
          ))}
        </div>
      </div>

      <div className="w-full lg:w-1/3">
        <div className="sticky top-[100px] bg-white p-6 rounded-xl shadow-xl border border-gray-100 flex flex-col h-fit">
          <h2 className="font-black text-xl border-b border-gray-100 pb-4 mb-4">Your Meal Cart</h2>
          
          {Object.keys(cart).length === 0 ? (
            <div className="text-center py-10 text-gray-400 font-medium text-sm">Your cart is empty.<br/>Add some meals for the flight!</div>
          ) : (
            <div className="flex flex-col gap-4 mb-6 flex-1 overflow-y-auto max-h-[40vh]">
              {Object.values(cart).map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-gray-500">{item.quantity}x</span>
                    <span className="font-bold text-black">{item.name}</span>
                  </div>
                  <div className="font-black text-black">${item.price * item.quantity}</div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-gray-200 pt-4 mt-auto">
            <div className="flex justify-between items-center text-sm font-bold text-gray-500 mb-2">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-green-600 mb-4">
              <span>Pre-book Discount (15%)</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-black text-black mb-6">
              <span>Total</span>
              <span className="text-[#f5482b]">${total.toFixed(2)}</span>
            </div>

            <button onClick={handleNext} className="w-full bg-[#f5482b] hover:bg-[#d83c20] text-white font-black py-4 rounded-xl text-lg transition-colors shadow-lg active:scale-95">
              {Object.keys(cart).length > 0 ? "Confirm & Next ➔" : "Skip Meals ➔"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MealsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-2xl text-gray-400">Loading Menu...</div>}>
        <MealsContent />
      </Suspense>
    </main>
  );
}