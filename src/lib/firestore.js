import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export async function uploadImageToStorage(file, path) {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
}

// ======================== PRODUCTS ========================

export async function getProductsFromFirestore() {
  const snapshot = await getDocs(collection(db, 'products'));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getProductByIdFromFirestore(id) {
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function addProductToFirestore(productData) {
  const docRef = doc(db, 'products', productData.id);
  await setDoc(docRef, productData);
  return productData.id;
}

export async function updateProductInFirestore(id, data) {
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, data);
}

// ======================== ORDERS ========================

export async function createOrder(orderData) {
  const docRef = await addDoc(collection(db, 'orders'), {
    ...orderData,
    createdAt: serverTimestamp(),
    status: 'processing',
  });
  return docRef.id;
}

export async function getOrderById(orderId) {
  const docRef = doc(db, 'orders', orderId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || null,
    };
  }
  return null;
}

export async function updateOrderStatus(orderId, status) {
  const docRef = doc(db, 'orders', orderId);
  await updateDoc(docRef, { status });
}

export async function getUserOrders(userId) {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
  }));
}

export async function getAllOrders() {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
  }));
}

// ======================== USER CART & WISHLIST ========================

export async function saveCartToFirestore(userId, cart) {
  const docRef = doc(db, 'users', userId);
  await setDoc(docRef, { cart }, { merge: true });
}

export async function getCartFromFirestore(userId) {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().cart || [];
  }
  return [];
}

export async function saveWishlistToFirestore(userId, wishlist) {
  const docRef = doc(db, 'users', userId);
  await setDoc(docRef, { wishlist }, { merge: true });
}

export async function getWishlistFromFirestore(userId) {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().wishlist || [];
  }
  return [];
}

// ======================== CUSTOMERS (Admin) ========================

export async function getAllCustomers() {
  const q = query(collection(db, 'users'), where('role', '==', 'customer'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getUserById(userId) {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function updateUserProfile(userId, data) {
  const docRef = doc(db, 'users', userId);
  await setDoc(docRef, data, { merge: true });
}
