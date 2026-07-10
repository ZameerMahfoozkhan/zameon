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

async function checkAtlas() {
  const querySnapshot = await getDocs(collection(db, "products"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.name && data.name.toLowerCase().includes('atlas')) {
      console.log(`FOUND ATLAS PRODUCT! ID: "${doc.id}"`);
      console.log('ID length:', doc.id.length);
      console.log('Characters in ID:');
      for (let i = 0; i < doc.id.length; i++) {
        console.log(`[${i}] ${doc.id[i]} (charCode: ${doc.id.charCodeAt(i)})`);
      }
    }
  });
  process.exit(0);
}

checkAtlas().catch(console.error);
