import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  orderBy,
  setDoc,
  writeBatch,
  onSnapshot
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

export const getProductByIdFromFirestore = async (id) => {
  try {
    let docRef = doc(db, 'products', id);
    let docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      // Fallback: if id contains spaces, try replacing with dashes
      const dashedId = id.toLowerCase().replace(/[^a-z0-9]/g, '-');
      if (dashedId !== id) {
        docRef = doc(db, 'products', dashedId);
        docSnap = await getDoc(docRef);
      }
    }
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching product by id:', error);
    return null;
  }
};

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
  
  // Notify admin
  await createNotification('admin', 'new_order', `New order placed: #${docRef.id.slice(0, 8)}`, { orderId: docRef.id });
  
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
      shippedAt: docSnap.data().shippedAt?.toDate?.()?.toISOString() || null,
      deliveredAt: docSnap.data().deliveredAt?.toDate?.()?.toISOString() || null,
      cancelledAt: docSnap.data().cancelledAt?.toDate?.()?.toISOString() || null,
    };
  }
  return null;
}

export function listenToOrder(orderId, callback) {
  const docRef = doc(db, 'orders', orderId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || null,
        shippedAt: docSnap.data().shippedAt?.toDate?.()?.toISOString() || null,
        deliveredAt: docSnap.data().deliveredAt?.toDate?.()?.toISOString() || null,
        cancelledAt: docSnap.data().cancelledAt?.toDate?.()?.toISOString() || null,
      });
    } else {
      callback(null);
    }
  });
}

export async function updateOrderStatus(orderId, status, userId) {
  const docRef = doc(db, 'orders', orderId);
  const updates = { status };
  
  if (status.toLowerCase() === 'shipped') updates.shippedAt = serverTimestamp();
  if (status.toLowerCase() === 'delivered') updates.deliveredAt = serverTimestamp();
  if (status.toLowerCase() === 'cancelled') updates.cancelledAt = serverTimestamp();
  
  await updateDoc(docRef, updates);
  
  // Notify user if status is cancelled, shipped, or delivered
  if (['cancelled', 'delivered', 'shipped'].includes(status.toLowerCase()) && userId) {
    await createNotification(
      userId, 
      'order_status', 
      `Your order #${orderId.slice(0, 8)} has been ${status.toLowerCase()}.`, 
      { orderId, status }
    );
  }
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
    shippedAt: doc.data().shippedAt?.toDate?.()?.toISOString() || null,
    deliveredAt: doc.data().deliveredAt?.toDate?.()?.toISOString() || null,
    cancelledAt: doc.data().cancelledAt?.toDate?.()?.toISOString() || null,
  }));
}

export function listenToUserOrders(userId, callback) {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      shippedAt: doc.data().shippedAt?.toDate?.()?.toISOString() || null,
      deliveredAt: doc.data().deliveredAt?.toDate?.()?.toISOString() || null,
      cancelledAt: doc.data().cancelledAt?.toDate?.()?.toISOString() || null,
    }));
    callback(orders);
  });
}

export async function getAllOrders() {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    shippedAt: doc.data().shippedAt?.toDate?.()?.toISOString() || null,
    deliveredAt: doc.data().deliveredAt?.toDate?.()?.toISOString() || null,
    cancelledAt: doc.data().cancelledAt?.toDate?.()?.toISOString() || null,
  }));
}

export async function deleteAllOrders() {
  const snapshot = await getDocs(collection(db, 'orders'));
  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

export async function deleteOrder(orderId) {
  const docRef = doc(db, 'orders', orderId);
  await deleteDoc(docRef);
}

// ======================== NOTIFICATIONS ========================

export async function createNotification(userId, type, message, data = {}) {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      type,
      message,
      data,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating notification", error);
  }
}

export async function getNotifications(userId) {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }));
  } catch (error) {
    console.error("Error fetching notifications", error);
    return [];
  }
}

export function subscribeToNotifications(userId, callback) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }));
    callback(notifications);
  }, (error) => {
    console.error("Error subscribing to notifications:", error);
  });
}

export async function markNotificationsAsRead(userId) {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });
    await batch.commit();
  } catch (error) {
    console.error("Error marking notifications as read", error);
  }
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
