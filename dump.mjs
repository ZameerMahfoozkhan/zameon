import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCNWlqhNg9vP-VqONxWE7nFhTvVErqAyEM",
  authDomain: "zameon-3d5e3.firebaseapp.com",
  projectId: "zameon-3d5e3",
  storageBucket: "zameon-3d5e3.firebasestorage.app",
  messagingSenderId: "899582880465",
  appId: "1:899582880465:web:eb2b4e162a845e0b03f3f0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function dump() {
  const snapshot = await getDocs(collection(db, 'products'));
  const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log(JSON.stringify(products, null, 2));
}

dump().catch(console.error);
