import { db } from '../../firebase';
import { collection, getDocs, doc, setDoc, addDoc, serverTimestamp, query, where } from 'firebase/firestore';

export const getAvailableProviders = async () => {
  const q = query(collection(db, 'providers'), where('isAvailable', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const setProviderAvailability = async (providerId, isAvailable) => {
  await setDoc(doc(db, 'providers', providerId), { isAvailable }, { merge: true });
};

export const createOrder = async (customerId, providerId, details) => {
  return await addDoc(collection(db, 'orders'), { customerId, providerId, ...details, status: 'pending', createdAt: serverTimestamp() });
};
