import { db } from '../../firebase';
import { 
  collection, getDocs, doc, setDoc, addDoc, updateDoc, 
  serverTimestamp, query, where, getDoc 
} from 'firebase/firestore';

export const VALID_STATUS_TRANSITIONS = {
  'pending': ['approved', 'declined', 'cancelled'],
  'approved': ['completed', 'cancelled'],
  'completed': [],
  'declined': [],
  'cancelled': []
};

export const isValidStatusTransition = (currentStatus, newStatus) => {
  if (!currentStatus) return true;
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
};

export const getAvailableProviders = async () => {
  const q = query(collection(db, 'providers'), where('isAvailable', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const setProviderAvailability = async (providerId, isAvailable) => {
  await setDoc(doc(db, 'providers', providerId), { isAvailable }, { merge: true });
};

export const updateProviderProfile = async (providerId, profileData) => {
  const cleanData = { ...profileData };
  delete cleanData.isApproved; // Prevent unauthorized self-approval

  await setDoc(doc(db, 'providers', providerId), {
    ...cleanData,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const createOrder = async (customerId, providerId, details) => {
  const price = Number(details.price) || 100;
  const commission = Math.round(price * 0.15); // Single source of truth 15% platform commission

  const orderRef = await addDoc(collection(db, 'orders'), {
    customerId,
    providerId,
    ...details,
    price,
    commission,
    status: 'pending',
    // Defaults to UNPAID unless the caller explicitly overrides it (e.g. BookingFlow
    // sets this while the order awaits Stripe payment confirmation). The provider
    // is not notified and does not see this order until stripeWebhook marks it PAID.
    paymentStatus: details.paymentStatus || 'UNPAID',
    createdAt: serverTimestamp()
  });

  // NOTE: the "new order" notification to the provider is intentionally NOT sent
  // here anymore. It's dispatched by the stripeWebhook Cloud Function once payment
  // actually succeeds, so a provider is never notified of (or shown) an order that
  // was never paid for. See functions/src/index.js.

  return orderRef;
};

export const updateOrderStatus = async (orderId, newStatus, currentStatus = null) => {
  if (currentStatus && !isValidStatusTransition(currentStatus, newStatus)) {
    throw new Error(`Invalid status transition from '${currentStatus}' to '${newStatus}'`);
  }

  const orderRef = doc(db, 'orders', orderId);
  const snap = await getDoc(orderRef);
  if (!snap.exists()) throw new Error('Order not found');

  const orderData = snap.data();
  if (currentStatus && orderData.status !== currentStatus) {
    throw new Error(`Order status mismatch. Current status is '${orderData.status}'`);
  }

  await updateDoc(orderRef, {
    status: newStatus,
    updatedAt: serverTimestamp()
  });

  try {
    let title = 'Order Update';
    let body = `Your order status changed to ${newStatus}.`;
    if (newStatus === 'approved') {
      title = 'ג… Order Confirmed!';
      body = 'Your provider has accepted the booking and is preparing for dispatch.';
    } else if (newStatus === 'completed') {
      title = 'נ‰ Service Completed!';
      body = 'Your service is complete. Please rate your experience!';
    } else if (newStatus === 'declined' || newStatus === 'cancelled') {
      title = 'Order Cancelled';
      body = 'Your service request was declined or cancelled.';
    }

    await sendNotification(orderData.customerId, {
      title,
      body,
      type: `ORDER_${newStatus.toUpperCase()}`,
      orderId
    });
  } catch (e) {
    console.warn('Could not dispatch customer notification:', e);
  }
};

export const updateProviderLocation = async (orderId, locationData) => {
  const orderRef = doc(db, 'orders', orderId);
  const locPayload = {
    lat: Number(locationData.lat) || 32.0711,
    lng: Number(locationData.lng) || 34.7871,
    address: locationData.address || 'En Route Location',
    heading: locationData.heading || 0,
    speed: locationData.speed || '25 km/h',
    updatedAt: new Date().toISOString()
  };
  await updateDoc(orderRef, {
    providerLocation: locPayload,
    updatedAt: serverTimestamp()
  });
  return locPayload;
};

export const cancelOrder = async (orderId, reason = 'Cancelled by user') => {
  const orderRef = doc(db, 'orders', orderId);
  const snap = await getDoc(orderRef);
  if (!snap.exists()) throw new Error('Order not found');

  const orderData = snap.data();
  if (['completed', 'cancelled'].includes(orderData.status)) {
    throw new Error(`Cannot cancel order in '${orderData.status}' status`);
  }

  await updateDoc(orderRef, {
    status: 'cancelled',
    cancellationReason: reason,
    cancelledAt: serverTimestamp()
  });
};

export const submitOrderReview = async (orderId, providerId, rating, comment, currentUserId = null, authorName = 'Customer') => {
  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) {
    throw new Error('Order does not exist');
  }

  const orderData = orderSnap.data();

  if (currentUserId && orderData.customerId !== currentUserId) {
    throw new Error('You can only review orders that belong to you');
  }

  if (orderData.status !== 'completed') {
    throw new Error('Reviews can only be submitted for completed orders');
  }

  if (orderData.rating) {
    throw new Error('A review has already been submitted for this order');
  }

  await updateDoc(orderRef, {
    rating: Number(rating),
    reviewComment: comment,
    reviewedAt: serverTimestamp()
  });

  const newReview = {
    id: `rev_${Date.now()}`,
    author: authorName,
    rating: Number(rating),
    comment,
    date: new Date().toISOString().split('T')[0]
  };

  const providerRef = doc(db, 'providers', providerId);
  const providerSnap = await getDoc(providerRef);
  if (providerSnap.exists()) {
    const data = providerSnap.data();
    const existingReviews = data.reviews || [];
    const updatedReviews = [newReview, ...existingReviews];
    
    const totalRating = updatedReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
    const avgRating = Number((totalRating / updatedReviews.length).toFixed(2));

    await updateDoc(providerRef, {
      reviews: updatedReviews,
      rating: avgRating
    });
  }
};

export const sendNotification = async (recipientId, { title, body, type = 'GENERAL', orderId = null }) => {
  if (!recipientId) return;
  return await addDoc(collection(db, 'notifications'), {
    recipientId,
    title,
    body,
    type,
    orderId,
    read: false,
    createdAt: serverTimestamp()
  });
};
