import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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

async function check() {
  const docSnap = await getDoc(doc(db, "products", "atlas-power-bank"));
  console.log(JSON.stringify(docSnap.data(), null, 2));
  process.exit(0);
}

check().catch(console.error);
