// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// REPLACE THESE WITH YOUR ACTUAL KEYS FROM FIREBASE
const firebaseConfig = {
apiKey: "AIzaSyBwWu1JWr_ZIZEFWcgGZIgCGjBMkNmfmLo",
authDomain: "insiderair.firebaseapp.com",
projectId: "insiderair",
storageBucket: "insiderair.firebasestorage.app",
messagingSenderId: "668775978854",
appId: "1:668775978854:web:9e2540d4405005a13bdaa7",
measurementId: "G-BMX7LP0GDD"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Database so other files can use them
export const auth = getAuth(app);
export const db = getFirestore(app);