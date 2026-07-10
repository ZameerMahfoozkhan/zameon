const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedProducts() {
  console.log('Reading products.json...');
  const dataPath = path.join(__dirname, '../src/data/products.json');
  const products = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  console.log(`Found ${products.length} products. Uploading to Firestore...`);

  let count = 0;
  for (const product of products) {
    try {
      // Use the existing ID from JSON as the document ID
      await setDoc(doc(db, 'products', product.id), product);
      count++;
      console.log(`Uploaded: ${product.name}`);
    } catch (error) {
      console.error(`Failed to upload ${product.id}:`, error);
    }
  }

  console.log(`✅ Finished uploading ${count}/${products.length} products to Firestore.`);
  setTimeout(() => process.exit(0), 1000);
}

seedProducts();
