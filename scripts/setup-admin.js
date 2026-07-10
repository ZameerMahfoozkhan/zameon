const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');
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
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = 'zameermahfoozkhan@gmail.com';
const ADMIN_PASSWORD = 'E-com@2709';

async function setupAdmin() {
  console.log(`Setting up admin user: ${ADMIN_EMAIL}`);
  let userUid;
  
  try {
    const result = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const user = result.user;
    userUid = user.uid;
    await updateProfile(user, { displayName: 'Admin' });
    console.log('✅ Admin user created in Auth.');
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('⚠️ Admin user already exists in Auth. Fetching user info...');
      const { signInWithEmailAndPassword } = require('firebase/auth');
      const result = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      userUid = result.user.uid;
    } else {
      console.error('❌ Error creating admin:', error.message);
      process.exit(1);
    }
  }

  try {
    await setDoc(doc(db, 'users', userUid), {
      email: ADMIN_EMAIL,
      name: 'Admin',
      role: 'admin',
      createdAt: serverTimestamp(),
      cart: [],
      wishlist: []
    });
    console.log('✅ Admin user document created/updated in Firestore.');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    
    // Force exit after a short delay to avoid UV_HANDLE_CLOSING assertion error in Node 18+
    setTimeout(() => process.exit(0), 1000);
  } catch (error) {
    console.error('❌ Error writing to Firestore:', error.message);
    process.exit(1);
  }
}

setupAdmin();
