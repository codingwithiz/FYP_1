// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFc6cmVUpu_zLHh2yCUfkF_Tvpa5uCqg4",
  authDomain: "fyp-gis-24a89.firebaseapp.com",
  projectId: "fyp-gis-24a89",
  storageBucket: "fyp-gis-24a89.firebasestorage.app",
  messagingSenderId: "1005803855552",
  appId: "1:1005803855552:web:08ee9b5907e3d2e0261725",
  measurementId: "G-D3LE0RL4FC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Auth and Provider
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, googleProvider };