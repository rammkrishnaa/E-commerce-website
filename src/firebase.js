// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCf3oW-FPBF35FM1ZzH7Hp5gmAaEOSMfo",
  authDomain: "nimadi-namkeen-store.firebaseapp.com",
  projectId: "nimadi-namkeen-store",
  storageBucket: "nimadi-namkeen-store.firebasestorage.app",
  messagingSenderId: "167238494200",
  appId: "1:167238494200:web:76f5a9af538561f23e980d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();