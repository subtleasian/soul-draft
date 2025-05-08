// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBKjjulZZxd9eRAZ5ypJG0_MKxeIxZY98A",
  authDomain: "soul-draft.firebaseapp.com",
  projectId: "soul-draft",
  storageBucket: "soul-draft.firebasestorage.app",
  messagingSenderId: "570969329703",
  appId: "1:570969329703:web:09b4d8212ab906dc23fe02",
  measurementId: "G-4TYDQEHMP2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);