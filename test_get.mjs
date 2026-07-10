import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const app = initializeApp({
  apiKey: "AIzaSyCNWlqhNg9vP-VqONxWE7nFhTvVErqAyEM",
  authDomain: "zameon-3d5e3.firebaseapp.com",
  projectId: "zameon-3d5e3"
});
const db = getFirestore(app);

async function run() {
  const snap = await getDoc(doc(db, 'products', 'atlas-power-bank'));
  if (snap.exists()) {
    console.log("FOUND:", snap.data().name);
  } else {
    console.log("NOT FOUND");
  }
}
run();
