"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const COUNTRY_CODES = [
  { code: "+61", country: "Australia" },
  { code: "+91", country: "India" },
  { code: "+62", country: "Indonesia" },
  { code: "+81", country: "Japan" },
  { code: "+60", country: "Malaysia" },
  { code: "+63", country: "Philippines" },
  { code: "+65", country: "Singapore" },
  { code: "+82", country: "South Korea" },
  { code: "+66", country: "Thailand" },
  { code: "+44", country: "UK" },
  { code: "+1",  country: "US" },
  { code: "+84", country: "Vietnam" },
];

function PassengerDetailsContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  
  // Passenger Count Metrics
  const adults = parseInt(searchParams.get("adults")) || 1;
  const childrenCount = parseInt(searchParams.get("children")) || 0;
  const infants = parseInt(searchParams.get("infants")) || 0;
  const totalFlyers = adults + childrenCount;

  // Form State: Dynamic Passenger Array
  const [flyers, setFlyers] = useState([]);

  // Form State: Booking Contact Section
  const [contact, setContact] = useState({
    title: "Mr",
    firstName: "",
    surname: "",
    countryCode: "+1",
    phone: "",
    email: ""
  });

  useEffect(() => {
    // 1. Build blank input rows for every traveler in the manifest
    const structuralArray = [];
    for (let i = 1; i <= totalFlyers; i++) {
      structuralArray.push({
        id: i,
        title: "Mr",
        firstName: "",
        lastName: ""
      });
    }
    setFlyers(structuralArray);

    // 2. Pre-fill Contact fields automatically if a Firebase user is logged in
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          let parsedFirstName = "";
          let parsedSurname = "";
          
          if (currentUser.displayName) {
            const splitName = currentUser.displayName.split(" ");
            parsedFirstName = splitName[0] || "";
            parsedSurname = splitName.slice(1).join(" ") || "";
          }

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setContact({
              title: "Mr",
              firstName: data.name?.split(" ")[0] || parsedFirstName,
              surname: data.name?.split(" ").slice(1).join(" ") || parsedSurname,
              countryCode: data.countryCode || "+1",
              phone: data.phone || "",
              email: data.email || currentUser.email || ""
            });
          } else {
            setContact(prev => ({
              ...prev,
              firstName: parsedFirstName,
              surname: parsedSurname,
              email: currentUser.email || ""
            }));
          }
        } catch (error) {
          console.error("Error pulling profile data for pre-fill:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [totalFlyers]);

  // Handle passenger input adjustments dynamically
  const handlePassengerChange = (index, field, value) => {
    setFlyers(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f));
  };

  // Form Validation and Submission Engine
  const handleSubmitDetails = (e) => {
    e.preventDefault();

    const cleanPhone = contact.phone.replace(/\s+/g, "");
    const completePhoneNumber = `${contact.countryCode}${cleanPhone}`;

    // --- DATALAYER: USER ATTRIBUTES IDENTIFICATION SYNC (NO UUID) ---
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "user_contact_identified",
      email: contact.email.trim().toLowerCase(),
      phone_number: completePhoneNumber,
      first_name: contact.firstName.trim(),
      last_name: contact.surname.trim(),
      title: contact.title,
      gdpr_consent: "true"
    });

    console.log("Fired GTM User Contact Data Layer Identification payload:", contact.email);

    // Advance smoothly to the In-Flight Dining selection step while passing along parameter strings
    window.location.href = `/add-ons/meals?${searchParams.toString()}`;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-black text-2xl text-gray-400">Loading Manifest Registry...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <form onSubmit={handleSubmitDetails} className="max-w-3xl mx-auto flex flex-col gap-8">
        
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-black">Passenger Details</h1>
          <p className="text-gray-500 font-bold uppercase text-xs tracking-wider mt-1">Please enter names exactly as they appear on legal passports</p>
        </div>

        {/* SECTION A: INDIVIDUAL PASSENGER FORMS */}
        <div className="flex flex-col gap-6">
          {flyers.map((flyer, index) => (
            <div key={flyer.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="font-black text-lg text-black border-b border-gray-100 pb-3 mb-4 uppercase tracking-wide flex items-center gap-2">
                <span className="bg-black text-white text-xs px-2.5 py-1 rounded-md">P{flyer.id}</span>
                Passenger {flyer.id} {index === 0 && <span className="text-xs font-bold text-gray-400 normal-case">(Primary Traveler)</span>}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col md:col-span-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5">Title</label>
                  <select 
                    value={flyer.title} onChange={e => handlePassengerChange(index, "title", e.target.value)}
                    className="p-3 border-2 border-gray-100 rounded-lg focus:outline-none focus:border-[#f5482b] font-bold text-sm bg-white text-black"
                  >
                    <option value="Mr">Mr.</option>
                    <option value="Ms">Ms.</option>
                    <option value="Mrs">Mrs.</option>
                    <option value="Dr">Dr.</option>
                  </select>
                </div>
                <div className="flex flex-col md:col-span-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5">First / Given Name</label>
                  <input 
                    type="text" required placeholder="John" value={flyer.firstName} onChange={e => handlePassengerChange(index, "firstName", e.target.value)}
                    className="p-3 border-2 border-gray-100 rounded-lg focus:outline-none focus:border-[#f5482b] font-medium text-sm text-black bg-white"
                  />
                </div>
                <div className="flex flex-col md:col-span-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5">Surname / Last Name</label>
                  <input 
                    type="text" required placeholder="Doe" value={flyer.lastName} onChange={e => handlePassengerChange(index, "lastName", e.target.value)}
                    className="p-3 border-2 border-gray-100 rounded-lg focus:outline-none focus:border-[#f5482b] font-medium text-sm text-black bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SECTION B: BOOKING CONTACT DETAILS */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="font-black text-xl border-b border-gray-100 pb-3 mb-4 text-[#f5482b] uppercase tracking-wide">
            Booking Contact Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="flex flex-col md:col-span-1">
              <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5">Title</label>
              <select 
                value={contact.title} onChange={e => setContact({ ...contact, title: e.target.value })}
                className="p-3 border-2 border-gray-100 rounded-lg focus:outline-none focus:border-[#f5482b] font-bold text-sm bg-white text-black"
              >
                <option value="Mr">Mr.</option>
                <option value="Ms">Ms.</option>
                <option value="Mrs">Mrs.</option>
                <option value="Dr">Dr.</option>
              </select>
            </div>
            
            <div className="flex flex-col md:col-span-2.5">
              <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5">First Name</label>
              <input 
                type="text" required placeholder="Contact First Name" value={contact.firstName} onChange={e => setContact({ ...contact, firstName: e.target.value })}
                className="p-3 border-2 border-gray-100 rounded-lg focus:outline-none focus:border-[#f5482b] font-medium text-sm text-black bg-white"
              />
            </div>
            
            <div className="flex flex-col md:col-span-2.5">
              <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5">Surname</label>
              <input 
                type="text" required placeholder="Contact Last Name" value={contact.surname} onChange={e => setContact({ ...contact, surname: e.target.value })}
                className="p-3 border-2 border-gray-100 rounded-lg focus:outline-none focus:border-[#f5482b] font-medium text-sm text-black bg-white"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5">Country Code</label>
              <select 
                value={contact.countryCode} onChange={e => setContact({ ...contact, countryCode: e.target.value })}
                className="p-3 border-2 border-gray-100 rounded-lg focus:outline-none focus:border-[#f5482b] font-bold text-sm bg-white text-black"
              >
                {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.country})</option>)}
              </select>
            </div>

            <div className="flex flex-col md:col-span-4">
              <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5">Mobile Number</label>
              <input 
                type="tel" required placeholder="5551234567" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })}
                className="p-3 border-2 border-gray-100 rounded-lg focus:outline-none focus:border-[#f5482b] font-medium text-sm text-black bg-white"
              />
            </div>

            <div className="flex flex-col md:col-span-6">
              <label className="text-[10px] font-black text-gray-400 uppercase mb-1.5">Email Address</label>
              <input 
                type="email" required placeholder="contact@email.com" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })}
                className="p-3 border-2 border-gray-100 rounded-lg focus:outline-none focus:border-[#f5482b] font-medium text-sm text-black bg-white"
              />
            </div>
          </div>

          {/* Short Legal Disclaimer Component */}
          <div className="mt-5 bg-gray-50 border border-gray-100 rounded-lg p-3 text-[11px] font-medium text-gray-400 flex items-start gap-2">
            <span className="text-xs">🔔</span>
            <p><strong>Notice:</strong> Booking updates, operational change variables, and flight notifications will be transmitted directly to these specified contact coordinates.</p>
          </div>
        </div>

        {/* Submit Anchor Button */}
        <button 
          type="submit"
          className="w-full bg-[#f5482b] hover:bg-[#d83c20] text-white font-black py-4 rounded-xl text-lg transition-transform shadow-lg active:scale-[0.99] text-center"
        >
          Confirm Travelers & Continue ➔
        </button>

      </form>
    </div>
  );
}

export default function PassengerDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-2xl text-gray-400">Loading Configuration Streams...</div>}>
      <PassengerDetailsContent />
    </Suspense>
  );
}