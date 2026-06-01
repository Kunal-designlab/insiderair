"use client";
import { useState } from "react";
import Link from "next/link";
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // NEW: State to manage the Success UI
  const [isSuccess, setIsSuccess] = useState(false);
  const [userName, setUserName] = useState("");

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

        <div className="mt-6 flex flex-col items-center">
          <div className="w-full flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className="text-xs font-bold text-gray-400 uppercase">Or</div>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          
          <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:bg-gray-50 text-black font-bold py-3.5 rounded-lg transition-colors active:scale-95">
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="mt-8 text-center text-sm font-bold text-gray-600">
          Don't have an account? <Link href="/register" className="text-[#f5482b] hover:underline ml-1">Register here</Link>
        </div>
      </div>
    </main>
  );
}