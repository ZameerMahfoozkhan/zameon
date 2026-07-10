import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // I need to get this from .env.local
  authDomain: "zameon-3d5e3.firebaseapp.com",
  projectId: "zameon-3d5e3",
  storageBucket: "zameon-3d5e3.firebasestorage.app",
  messagingSenderId: "899582880465",
  appId: "1:899582880465:web:eb2b4e162a845e0b03f3f0"
};
