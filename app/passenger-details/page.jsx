"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// REUSED COUNTRY DATABASE
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const TITLES = ["Mr", "Mrs", "Ms", "Miss", "Mstr", "Dr", "Other"];
const GENDERS = ["Male", "Female", "Other"];

function CheckoutContent() {
  const searchParams = useSearchParams();
  const [passengers, setPassengers] = useState([]);

  // Generate the blank forms based on the URL data
  useEffect(() => {
    const adults = parseInt(searchParams.get("adults")) || 1;
    const childrenCount = parseInt(searchParams.get("children")) || 0;
    const infants = parseInt(searchParams.get("infants")) || 0;

    const initialPassengers = [];
    
    for(let i = 1; i <= adults; i++) {
      initialPassengers.push({ id: `adult-${i}`, type: 'Adult', index: i, title: '', name: '', surname: '', birthdate: '', gender: '', nationality: '' });
    }
    for(let i = 1; i <= childrenCount; i++) {
      initialPassengers.push({ id: `child-${i}`, type: 'Child', index: i, title: '', name: '', surname: '', birthdate: '', gender: '', nationality: '' });
    }
    for(let i = 1; i <= infants; i++) {
      initialPassengers.push({ id: `infant-${i}`, type: 'Infant', index: i, title: '', name: '', surname: '', birthdate: '', gender: '', nationality: '' });
    }

    setPassengers(initialPassengers);
  }, [searchParams]);

  const handleChange = (id, field, value) => {
    setPassengers(prev => 
      prev.map(p => p.id === id ? { ...p, [field]: value } : p)
    );
  };

  const handleProceedToAddons = () => {
    // Check if any field is blank in ANY passenger object
    const isIncomplete = passengers.some(p => 
      !p.title || !p.name || !p.surname || !p.birthdate || !p.gender || !p.nationality
    );

    if (isIncomplete) {
      alert("Please fill out all passenger details before continuing.");
      return;
    }

    console.log("Verified Passenger Data:", passengers);
    alert("Passenger Details saved! Proceeding to Add-ons...");
    window.location.href = `/add-ons?${searchParams.toString()}`; 
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-black">Passenger Details</h1>
        <p className="text-gray-500 font-bold uppercase text-sm mt-2 tracking-wide">Enter names exactly as they appear on your government ID</p>
      </div>

      <div className="flex flex-col gap-6">
        {passengers.map((passenger) => (
          <div key={passenger.id} className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-100">
            <h2 className="font-black text-xl text-[#f5482b] mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {passenger.type} {passenger.index}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* TITLE */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-xs font-bold text-gray-500 mb-2 uppercase">Title *</label>
                <select 
                  value={passenger.title} 
                  onChange={(e) => handleChange(passenger.id, 'title', e.target.value)}
                  className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-[#f5482b] text-black font-medium bg-white"
                >
                  <option value="">...</option>
                  {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* FIRST NAME */}
              <div className="flex flex-col md:col-span-5">
                <label className="text-xs font-bold text-gray-500 mb-2 uppercase">First Name *</label>
                <input 
                  type="text" 
                  placeholder="John"
                  value={passenger.name} 
                  onChange={(e) => handleChange(passenger.id, 'name', e.target.value)}
                  className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-[#f5482b] text-black font-medium"
                />
              </div>

              {/* SURNAME */}
              <div className="flex flex-col md:col-span-5">
                <label className="text-xs font-bold text-gray-500 mb-2 uppercase">Surname *</label>
                <input 
                  type="text" 
                  placeholder="Doe"
                  value={passenger.surname} 
                  onChange={(e) => handleChange(passenger.id, 'surname', e.target.value)}
                  className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-[#f5482b] text-black font-medium"
                />
              </div>

              {/* BIRTHDATE */}
              <div className="flex flex-col md:col-span-4">
                <label className="text-xs font-bold text-gray-500 mb-2 uppercase">Date of Birth *</label>
                <input 
                  type="date" 
                  value={passenger.birthdate} 
                  onChange={(e) => handleChange(passenger.id, 'birthdate', e.target.value)}
                  className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-[#f5482b] text-black font-medium"
                />
              </div>

              {/* GENDER */}
              <div className="flex flex-col md:col-span-4">
                <label className="text-xs font-bold text-gray-500 mb-2 uppercase">Gender *</label>
                <select 
                  value={passenger.gender} 
                  onChange={(e) => handleChange(passenger.id, 'gender', e.target.value)}
                  className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-[#f5482b] text-black font-medium bg-white"
                >
                  <option value="">Select...</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* NATIONALITY */}
              <div className="flex flex-col md:col-span-4">
                <label className="text-xs font-bold text-gray-500 mb-2 uppercase">Nationality *</label>
                <select 
                  value={passenger.nationality} 
                  onChange={(e) => handleChange(passenger.id, 'nationality', e.target.value)}
                  className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-[#f5482b] text-black font-medium bg-white"
                >
                  <option value="">Select Country...</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleProceedToAddons}
          className="w-full md:w-auto bg-black hover:bg-gray-800 text-white font-black py-4 px-12 rounded-xl text-lg transition-colors shadow-lg active:scale-95"
        >
          Proceed to Add-ons
        </button>
      </div>

    </div>
  );
}

export default function Checkout() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-2xl text-gray-400">Loading Checkout...</div>}>
        <CheckoutContent />
      </Suspense>
    </main>
  );
}