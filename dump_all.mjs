import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const app = initializeApp({
  apiKey: "AIzaSyCNWlqhNg9vP-VqONxWE7nFhTvVErqAyEM",
  authDomain: "zameon-3d5e3.firebaseapp.com",
  projectId: "zameon-3d5e3"
});
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, 'products'));
  const docs = snap.docs.map(d => JSON.stringify(d.data()));
  for (const doc of docs) {
    if (doc.includes('Unknown API key')) {
      console.log('FOUND IT:', doc);
    }
  }
  console.log('Done searching ' + docs.length + ' products');
}
run();
