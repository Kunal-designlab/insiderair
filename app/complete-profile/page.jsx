"use client";
import { useState, useEffect } from "react";
import { doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export default function CompleteProfile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    nationality: "",
    birthdate: "",
    gender: "",
  });

  // Catch the logged-in Google user when the page loads
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        // Pre-fill their name from Google if available
        setFormData((prev) => ({ ...prev, name: user.displayName || "" }));
      } else {
        // If they somehow got here without logging in, send them back
        window.location.href = "/login";
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.nationality || !formData.birthdate || !formData.gender) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      // Generate the Membership ID
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      const membershipId = `IA-${randomDigits}`;

      // Save everything to Firestore
      await setDoc(doc(db, "users", currentUser.uid), {
        uid: currentUser.uid,
        name: formData.name,
        email: currentUser.email,
        nationality: formData.nationality,
        birthdate: formData.birthdate,
        gender: formData.gender,
        membershipId: membershipId,
        createdAt: new Date().toISOString()
      });

      alert(`Profile completed!\nYour Membership ID is: ${membershipId}`);
      window.location.href = "/";
      
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    }
  };

  // Show a simple loading state while waiting for Firebase to confirm who is logged in
  if (!currentUser) return <div className="min-h-screen flex items-center justify-center font-bold">Loading...</div>;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 w-full max-w-md">
        <h1 className="text-3xl font-black text-black mb-2 text-center">Almost There!</h1>
        <p className="text-gray-500 font-bold text-sm text-center mb-8 uppercase tracking-wide">
          Please complete your passenger profile
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 mb-2 uppercase">Full Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-[#f5482b] text-black font-medium" required />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 mb-2 uppercase">Citizen Of *</label>
            <select name="nationality" value={formData.nationality} onChange={handleChange} className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-[#f5482b] text-black font-medium bg-white" required>
              <option value="">Select Country...</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 mb-2 uppercase">Birthdate *</label>
              <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-[#f5482b] text-black font-medium text-sm" required />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 mb-2 uppercase">Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-[#f5482b] text-black font-medium text-sm bg-white" required>
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <button type="submit" className="w-full bg-[#f5482b] hover:bg-[#d83c20] text-white font-black py-4 rounded-lg text-lg transition-colors shadow-lg active:scale-95 mt-4">
            Save & Enter
          </button>
        </form>
      </div>
    </main>
  );
}