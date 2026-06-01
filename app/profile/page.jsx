"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../../firebase"; // ⚠️ Adjust to your firebase config path
import { onAuthStateChanged, updateEmail } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const COUNTRY_CODES = [
  { code: "+1", country: "US/CA" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "IN" },
  { code: "+61", country: "AU" },
  { code: "+65", country: "SG" },
  { code: "+63", country: "PH" },
];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [userUid, setUserUid] = useState(null);
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+1",
    tier: "Swift Tier"
  });

  // Form States
  const [emailForm, setEmailForm] = useState({ old: "", new: "" });
  const [phoneForm, setPhoneForm] = useState({ old: "", code: "+1", new: "" });

  // 1. Fetch Real User Data from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUserUid(currentUser.uid);
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUser({
              name: data.name || currentUser.displayName || "Valued Flyer",
              email: data.email || currentUser.email || "",
              phone: data.phone || "",
              countryCode: data.countryCode || "+1",
              tier: data.tier || "Swift Tier"
            });
            setPhoneForm(prev => ({ ...prev, code: data.countryCode || "+1" }));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        // Not logged in -> kick them to login
        window.location.href = "/login";
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Handle Firestore & Auth Email Update
  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    if (emailForm.old !== user.email) {
      return alert("Old email does not match our records!");
    }
    if (!emailForm.new) return alert("Please enter a new email.");
    
    try {
      // Update Firebase Auth Email (Requires recent login)
      if (auth.currentUser) {
        await updateEmail(auth.currentUser, emailForm.new);
      }
      
      // Update Firestore Document
      const userRef = doc(db, "users", userUid);
      await updateDoc(userRef, { email: emailForm.new });

      setUser(prev => ({ ...prev, email: emailForm.new }));
      setEmailForm({ old: "", new: "" });
      alert("Email updated successfully!");
      
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "profile_updated", update_type: "email" });
    } catch (error) {
      console.error("Error updating email:", error);
      if (error.code === 'auth/requires-recent-login') {
        alert("For security reasons, please log out and log back in to change your email.");
      } else {
        alert("Failed to update email. " + error.message);
      }
    }
  };

  // 3. Handle Firestore Phone Update
  const handlePhoneUpdate = async (e) => {
    e.preventDefault();
    if (user.phone && phoneForm.old !== user.phone) {
      return alert("Old phone number does not match our records!");
    }
    if (!phoneForm.new) return alert("Please enter a new phone number.");

    try {
      const userRef = doc(db, "users", userUid);
      await updateDoc(userRef, { 
        phone: phoneForm.new, 
        countryCode: phoneForm.code 
      });

      setUser(prev => ({ ...prev, phone: phoneForm.new, countryCode: phoneForm.code }));
      setPhoneForm({ old: "", code: "+1", new: "" });
      alert("Phone number updated successfully!");

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "profile_updated", update_type: "phone" });
    } catch (error) {
      console.error("Error updating phone:", error);
      alert("Failed to update phone number.");
    }
  };

  // 4. Handle Firestore Tier Upgrade
  const handleUpgrade = async (newTier, price) => {
    const confirmMsg = `Upgrade to ${newTier} for $${price}?`;
    if (confirm(confirmMsg)) {
      try {
        const userRef = doc(db, "users", userUid);
        await updateDoc(userRef, { tier: newTier });

        setUser(prev => ({ ...prev, tier: newTier }));
        alert(`Congratulations! You are now flying in the ${newTier}! 🦅`);
        
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "membership_upgraded",
          tier: newTier,
          value: price,
          currency: "USD"
        });
      } catch (error) {
        console.error("Error upgrading tier:", error);
        alert("Failed to process upgrade.");
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-black text-2xl text-gray-400">Loading Profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-black mb-8">My Profile</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: PERSONAL INFO & UPDATES */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            
            {/* Display Info */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="font-black text-xl border-b border-gray-100 pb-4 mb-4 text-[#f5482b]">Personal Details</h2>
              <div className="flex flex-col gap-4 text-sm">
                <div>
                  <span className="font-bold text-gray-400 uppercase text-xs block mb-1">Full Name</span>
                  <span className="font-black text-lg text-black">{user.name}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-400 uppercase text-xs block mb-1">Email Address</span>
                  <span className="font-bold text-gray-800">{user.email}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-400 uppercase text-xs block mb-1">Mobile Number</span>
                  <span className="font-bold text-gray-800">
                    {user.phone ? `${user.countryCode} ${user.phone}` : "Not Added"}
                  </span>
                </div>
              </div>
            </div>

            {/* Update Email Form */}
            <form onSubmit={handleEmailUpdate} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-black text-lg mb-4 text-black">Update Email</h3>
              <div className="flex flex-col gap-3">
                <input 
                  type="email" placeholder="Old Email Address" required
                  value={emailForm.old} onChange={e => setEmailForm({...emailForm, old: e.target.value})}
                  className="w-full p-3 rounded-lg border-2 border-gray-100 focus:outline-none focus:border-[#f5482b] font-medium text-sm"
                />
                <input 
                  type="email" placeholder="New Email Address" required
                  value={emailForm.new} onChange={e => setEmailForm({...emailForm, new: e.target.value})}
                  className="w-full p-3 rounded-lg border-2 border-gray-100 focus:outline-none focus:border-[#f5482b] font-medium text-sm"
                />
                <button type="submit" className="bg-black hover:bg-gray-800 text-white font-black py-3 rounded-lg mt-2 transition-colors">
                  Save New Email
                </button>
              </div>
            </form>

            {/* Update Phone Form */}
            <form onSubmit={handlePhoneUpdate} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-black text-lg mb-4 text-black">{user.phone ? "Update" : "Add"} Mobile Number</h3>
              <div className="flex flex-col gap-3">
                {user.phone && (
                  <input 
                    type="tel" placeholder="Old Mobile Number" required
                    value={phoneForm.old} onChange={e => setPhoneForm({...phoneForm, old: e.target.value})}
                    className="w-full p-3 rounded-lg border-2 border-gray-100 focus:outline-none focus:border-[#f5482b] font-medium text-sm"
                  />
                )}
                <div className="flex gap-2">
                  <select 
                    value={phoneForm.code} onChange={e => setPhoneForm({...phoneForm, code: e.target.value})}
                    className="p-3 rounded-lg border-2 border-gray-100 focus:outline-none focus:border-[#f5482b] font-bold text-sm bg-white"
                  >
                    {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.country})</option>)}
                  </select>
                  <input 
                    type="tel" placeholder="New Mobile Number" required
                    value={phoneForm.new} onChange={e => setPhoneForm({...phoneForm, new: e.target.value})}
                    className="flex-1 p-3 rounded-lg border-2 border-gray-100 focus:outline-none focus:border-[#f5482b] font-medium text-sm"
                  />
                </div>
                <button type="submit" className="bg-black hover:bg-gray-800 text-white font-black py-3 rounded-lg mt-2 transition-colors">
                  Save New Phone
                </button>
              </div>
            </form>

          </div>

          {/* RIGHT COLUMN: MEMBERSHIP STATUS */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            
            <div className="bg-black text-white p-8 rounded-xl shadow-xl flex flex-col justify-center relative overflow-hidden">
              <div className="absolute -right-10 -top-10 opacity-10 text-9xl">✈️</div>
              <span className="font-bold text-gray-400 uppercase text-xs tracking-widest mb-2">Current Status</span>
              <h2 className="text-3xl font-black text-[#f5482b]">{user.tier}</h2>
              <p className="mt-2 text-sm font-medium text-gray-300">
                {user.tier === "Swift Tier" && "Earning 2 miles per booking."}
                {user.tier === "Albatross Tier" && "Priority Check-in • 5 miles per booking."}
                {user.tier === "Arctic Tern Tier" && "Priority Check-in • Lounge Access • 10 miles per booking."}
              </p>
            </div>

            <h3 className="font-black text-2xl text-black mt-4">Available Upgrades</h3>

            {/* UPGRADE 1: Albatross Tier */}
            <div className={`p-6 rounded-xl border-2 transition-all ${user.tier === "Albatross Tier" || user.tier === "Arctic Tern Tier" ? 'opacity-50 border-gray-200 bg-gray-50' : 'border-[#f5482b] bg-white shadow-md hover:scale-[1.02]'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-black text-xl text-black">Albatross Tier</h4>
                  <p className="text-sm font-bold text-gray-500 mt-1">Upgrade Fee: $50</p>
                </div>
              </div>
              <ul className="text-sm font-medium text-gray-700 mb-6 flex flex-col gap-2">
                <li>✨ Priority Check-in always</li>
                <li>✨ Earn 5 miles per booking</li>
                <li className="text-xs text-gray-400 italic mt-2">Named after the ocean gliders that effortlessly fly thousands of miles.</li>
              </ul>
              <button 
                disabled={user.tier === "Albatross Tier" || user.tier === "Arctic Tern Tier"}
                onClick={() => handleUpgrade("Albatross Tier", 50)}
                className="w-full py-3 rounded-lg font-black bg-[#f5482b] text-white disabled:bg-gray-200 disabled:text-gray-400"
              >
                {user.tier === "Albatross Tier" || user.tier === "Arctic Tern Tier" ? "Unlocked" : "Upgrade Now"}
              </button>
            </div>

            {/* UPGRADE 2: Arctic Tern Tier */}
            <div className={`p-6 rounded-xl border-2 transition-all ${user.tier === "Arctic Tern Tier" ? 'opacity-50 border-gray-200 bg-gray-50' : 'border-[#f5482b] bg-white shadow-md hover:scale-[1.02]'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-black text-xl text-black">Arctic Tern Tier</h4>
                  <p className="text-sm font-bold text-gray-500 mt-1">Upgrade Fee: $100</p>
                </div>
              </div>
              <ul className="text-sm font-medium text-gray-700 mb-6 flex flex-col gap-2">
                <li>👑 Priority Check-in always</li>
                <li>👑 Premium Free Access Lounge Card</li>
                <li>👑 Earn 10 miles per flight</li>
                <li className="text-xs text-gray-400 italic mt-2">Named after the bird with the longest migration on Earth. The ultimate traveler.</li>
              </ul>
              <button 
                disabled={user.tier === "Arctic Tern Tier"}
                onClick={() => handleUpgrade("Arctic Tern Tier", 100)}
                className="w-full py-3 rounded-lg font-black bg-black text-white disabled:bg-gray-200 disabled:text-gray-400 hover:bg-gray-800"
              >
                {user.tier === "Arctic Tern Tier" ? "Max Level Reached" : "Upgrade Now"}
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}