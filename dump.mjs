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

async function dumpProducts() {
  const querySnapshot = await getDocs(collection(db, "products"));
  console.log(`Found ${querySnapshot.size} products.`);
  querySnapshot.forEach((doc) => {
    console.log(`\nID: "${doc.id}"`);
    console.log(JSON.stringify(doc.data(), null, 2));
  });
  process.exit(0);
}

dumpProducts().catch(console.error);
