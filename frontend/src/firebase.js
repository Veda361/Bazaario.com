import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA_OzTWAOhIYo2b674LniW0x4rDGF5CEw4",
  authDomain: "bazario-72c6f.firebaseapp.com",
  projectId: "bazario-72c6f",
  storageBucket: "bazario-72c6f.appspot.com",
  messagingSenderId: "450216767854",
  appId: "1:450216767854:web:d2bada4586834ec532d17f",
  measurementId: "G-3RM59RT7S2"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;