"use client";
import { useState } from "react";
import Link from "next/link";

// Complete alphabetical list of countries
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nationality: "", // This will now store the country they pick from the "Citizen Of" dropdown
    birthdate: "",
    gender: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    // Check to make sure no fields are blank
    if (!formData.name || !formData.email || !formData.nationality || !formData.birthdate || !formData.gender || !formData.password) {
      alert("Please fill out all mandatory fields.");
      return;
    }

    // Generate a unique 6-digit Membership ID
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const membershipId = `IA-${randomDigits}`;

    console.log("Creating user with Membership ID:", membershipId);
    console.log("User Data:", formData);
    
    alert(`Account created successfully!\nYour Membership ID is: ${membershipId}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 w-full max-w-md">
        <h1 className="text-3xl font-black text-black mb-2 text-center">Join the Club</h1>
        <p className="text-gray-500 font-bold text-sm text-center mb-8 uppercase tracking-wide">Create your Insider Account</p>
        
        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          {/* Full Name */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 mb-2 uppercase">Full Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-[#f5482b] transition-colors text-black font-medium" required />
          </div>

          {/* Email Address */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 mb-2 uppercase">Email Address *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="hello@example.com" className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-[#f5482b] transition-colors text-black font-medium" required />
          </div>

          {/* Citizen Of (Dropdown) */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 mb-2 uppercase">Citizen Of *</label>
            <select 
              name="nationality" 
              value={formData.nationality} 
              onChange={handleChange} 
              className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-[#f5482b] transition-colors text-black font-medium bg-white" 
              required
            >
              <option value="">Select Country...</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* Grid for Birthdate and Gender */}
          <div className="grid grid-cols-2 gap-4">
            {/* Birthdate */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 mb-2 uppercase">Birthdate *</label>
              <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-[#f5482b] transition-colors text-black font-medium text-sm" required />
            </div>

            {/* Gender */}
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 mb-2 uppercase">Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-[#f5482b] transition-colors text-black font-medium text-sm bg-white" required>
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 mb-2 uppercase">Password *</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-[#f5482b] transition-colors text-black font-medium" required />
          </div>
          
          <button type="submit" className="w-full bg-black hover:bg-gray-800 text-white font-black py-4 rounded-lg text-lg transition-colors shadow-lg active:scale-95 mt-4">
            Create Account & Get ID
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-bold text-gray-600">
          Already have an account? <Link href="/login" className="text-[#f5482b] hover:underline ml-1">Sign in</Link>
        </div>
      </div>
    </main>
  );
}"use client";
import { useState } from "react";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase"; // Importing our connection

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nationality: "",
    birthdate: "",
    gender: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.nationality || !formData.birthdate || !formData.gender || !formData.password) {
      alert("Please fill out all mandatory fields.");
      return;
    }

    try {
      // 1. Create the user securely in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Generate the unique Membership ID
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      const membershipId = `IA-${randomDigits}`;

      // 3. Save the full profile to Firestore Database (excluding password!)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        nationality: formData.nationality,
        birthdate: formData.birthdate,
        gender: formData.gender,
        membershipId: membershipId,
        createdAt: new Date().toISOString()
      });

      alert(`Account created!\nWelcome to the club, your Membership ID is: ${membershipId}`);
      window.location.href = "/"; // Send them to the homepage
      
    } catch (error) {
      console.error("Error registering:", error);
      alert(error.message); // This will tell the user if the password is too weak or email exists
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 w-full max-w-md">
        <h1 className="text-3xl font-black text-black mb-2 text-center">Join the Club</h1>
        <p className="text-gray-500 font-bold text-sm text-center mb-8 uppercase tracking-wide">Create your Insider Account</p>
        
        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 mb-2 uppercase">Full Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-[#f5482b] text-black font-medium" required />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 mb-2 uppercase">Email Address *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-[#f5482b] text-black font-medium" required />
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

          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 mb-2 uppercase">Password *</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-[#f5482b] text-black font-medium" required />
          </div>
          
          <button type="submit" className="w-full bg-black hover:bg-gray-800 text-white font-black py-4 rounded-lg text-lg transition-colors shadow-lg active:scale-95 mt-4">
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-bold text-gray-600">
          Already have an account? <Link href="/login" className="text-[#f5482b] hover:underline ml-1">Sign in</Link>
        </div>
      </div>
    </main>
  );
}