import { db } from '../../firebase';
import { 
  collection, getDocs, doc, setDoc, addDoc, updateDoc, 
  serverTimestamp, query, where, getDoc, arrayUnion 
} from 'firebase/firestore';

export const getAvailableProviders = async () => {
  const q = query(collection(db, 'providers'), where('isAvailable', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const setProviderAvailability = async (providerId, isAvailable) => {
  await setDoc(doc(db, 'providers', providerId), { isAvailable }, { merge: true });
};

export const updateProviderProfile = async (providerId, profileData) => {
  await setDoc(doc(db, 'providers', providerId), {
    ...profileData,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const createOrder = async (customerId, providerId, details) => {
  return await addDoc(collection(db, 'orders'), {
    customerId,
    providerId,
    ...details,
    commission: Math.round((details.price || 100) * 0.15), // 15% platform commission
    status: 'pending',
    createdAt: serverTimestamp()
  });
};

export const submitOrderReview = async (orderId, providerId, rating, comment, authorName = 'Customer') => {
  // Update order with rating
  await updateDoc(doc(db, 'orders', orderId), {
    rating,
    reviewComment: comment,
    reviewedAt: serverTimestamp()
  });

  // Append review to provider collection
  const newReview = {
    id: `r_${Date.now()}`,
    author: authorName,
    rating,
    comment,
    date: 'Just now'
  };

  const providerRef = doc(db, 'providers', providerId);
  const snap = await getDoc(providerRef);
  if (snap.exists()) {
    const data = snap.data();
    const existingReviews = data.reviews || [];
    const updatedReviews = [newReview, ...existingReviews];
    
    // Recalculate average rating
    const totalRating = updatedReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
    const avgRating = Number((totalRating / updatedReviews.length).toFixed(1));

    await updateDoc(providerRef, {
      reviews: updatedReviews,
      rating: avgRating
    });
  }
};
