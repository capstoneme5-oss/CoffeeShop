const admin = require('firebase-admin');

let initialized = false;

function initFirebase() {
  if (initialized) return;

  // Prefer service account JSON provided in env var for server environments
  const saJson = process.env.FIREBASE_SERVICE_ACCOUNT || null;

  try {
    if (saJson) {
      const serviceAccount = JSON.parse(saJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      initialized = true;
      return;
    }

    // Fallback to default app if running locally with GOOGLE_APPLICATION_CREDENTIALS
    if (!admin.apps.length) {
      admin.initializeApp();
      initialized = true;
      return;
    }
  } catch (err) {
    console.warn('Firebase init failed:', err && err.message ? err.message : err);
    initialized = false;
  }
}

function getFirestore() {
  initFirebase();
  if (!initialized) return null;
  return admin.firestore();
}

async function getMenuItems() {
  const db = getFirestore();
  if (!db) return [];
  try {
    const snapshot = await db.collection('menu').where('available', '==', true).get();
    const items = [];
    snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    return items;
  } catch (err) {
    console.warn('Firebase getMenuItems error:', err && err.message ? err.message : err);
    return [];
  }
}

async function getBestsellers(limit = 6) {
  const db = getFirestore();
  if (!db) return [];
  try {
    const snapshot = await db.collection('menu')
      .where('available', '==', true)
      .where('isBestseller', '==', true)
      .orderBy('salesCount', 'desc')
      .limit(parseInt(limit))
      .get();
    const items = [];
    snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    return items;
  } catch (err) {
    console.warn('Firebase getBestsellers error:', err && err.message ? err.message : err);
    return [];
  }
}

async function getMessages() {
  const db = getFirestore();
  if (!db) return [];
  try {
    const snapshot = await db.collection('messages').orderBy('createdAt', 'asc').get();
    const messages = [];
    snapshot.forEach(doc => messages.push({ id: doc.id, ...doc.data() }));
    return messages;
  } catch (err) {
    console.warn('Firebase getMessages error:', err && err.message ? err.message : err);
    return [];
  }
}

async function createMessage(data) {
  const db = getFirestore();
  if (!db) return null;
  try {
    const docRef = await db.collection('messages').add({
      content: data.content,
      sender: data.sender || 'user',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      ...data._meta
    });
    const created = await docRef.get();
    return { id: created.id, ...created.data() };
  } catch (err) {
    console.warn('Firebase createMessage error:', err && err.message ? err.message : err);
    return null;
  }
}

async function createOrder(data) {
  const db = getFirestore();
  if (!db) return null;
  try {
    const docRef = await db.collection('orders').add({
      customerName: data.customerName,
      items: data.items,
      totalPrice: data.totalPrice,
      notes: data.notes || '',
      status: data.status || 'Pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    const created = await docRef.get();
    return { id: created.id, ...created.data() };
  } catch (err) {
    console.warn('Firebase createOrder error:', err && err.message ? err.message : err);
    return null;
  }
}

module.exports = {
  getMenuItems,
  getBestsellers,
  getMessages,
  createMessage,
  createOrder,
};
