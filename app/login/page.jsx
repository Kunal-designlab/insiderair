"use client";
import { useState } from "react";
import Link from "next/link";
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // State to manage the Success UI
  const [isSuccess, setIsSuccess] = useState(false);
  const [userName, setUserName] = useState("");

  // Helper to dispatch credentials cleanly to the native app frame wrapper
  const syncWithNativeApp = (userEmail, flyerId) => {
    if (typeof window !== "undefined" && window.ReactNativeWebView) {
      const messagePayload = {
        type: "USER_AUTHENTICATED",
        email: userEmail
      };
      
      // 💡 Only attach flyerId if it physically exists in Firestore profile database
      if (flyerId) {
        messagePayload.flyerId = flyerId;
      }

      window.ReactNativeWebView.postMessage(JSON.stringify(messagePayload));
      console.log("Native Web-Bridge: Successfully synchronized login event packet.", messagePayload);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        setUserName(data.name || "Flyer");

        // FIRE GTM SAFELY
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "login",
          email: user.email,
          flyer_id: data.membershipId
        });
        console.log("Fired GTM: login", user.email);

        // 🚀 SYNC TO MOBILE APP
        syncWithNativeApp(user.email, data.membershipId);
      }
      
      setIsSuccess(true); // Swap UI to the Success Screen
    } catch (error) {
      console.error("Login error:", error);
      alert("Invalid email or password.");
    }
  };
  
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        window.location.href = "/complete-profile"; 
      } else {
        const data = userDocSnap.data();
        setUserName(data.name || "Flyer");

        // FIRE GTM SAFELY
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "login",
          email: user.email,
          flyer_id: data.membershipId
        });
        console.log("Fired GTM: login (Google)", user.email);

        // 🚀 SYNC TO MOBILE APP
        syncWithNativeApp(user.email, data.membershipId);

        setIsSuccess(true); // Swap UI to the Success Screen
      }
      
    } catch (error) {
      console.error("Google sign in error:", error);
      alert("Failed to sign in with Google.");
    }
  };

  // --- THE SUCCESS SCREEN ---
  if (isSuccess) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 w-full max-w-md -mt-20 text-center animate-fade-in">
          <div className="text-6xl mb-6">✈️</div>
          <h1 className="text-3xl font-black text-black mb-2">Welcome Back, {userName.split(' ')[0]}!</h1>
          <p className="text-gray-500 font-bold text-sm mb-8 uppercase tracking-wide">You are securely logged in.</p>
          
          <Link href="/">
            <button className="w-full bg-[#f5482b] hover:bg-[#d83c20] text-white font-black py-4 rounded-lg text-lg transition-colors shadow-lg active:scale-95">
              Book your Flights ➔
            </button>
          </Link>
        </div>
      </main>
    );
  }

  // --- THE LOGIN FORM ---
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100 w-full max-w-md -mt-20">
        <h1 className="text-3xl font-black text-black mb-2 text-center">Welcome Back</h1>
        <p className="text-gray-500 font-bold text-sm text-center mb-8 uppercase tracking-wide">Login to Insider Air</p>
        
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-5">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 mb-2 uppercase">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-[#f5482b] text-black font-medium" required />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 mb-2 uppercase">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border-2 border-gray-200 p-4 rounded-lg focus:outline-none focus:border-[#f5482b] text-black font-medium" required />
          </div>
          
          <button type="submit" className="w-full bg-[#f5482b] hover:bg-[#d83c20] text-white font-black py-4 rounded-lg text-lg transition-colors shadow-lg active:scale-95 mt-4">
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-bold text-gray-600">
          Don't have an account? <Link href="/register" className="text-[#f5482b] hover:underline ml-1">Register here</Link>
        </div>
      </div>
    </main>
  );
}