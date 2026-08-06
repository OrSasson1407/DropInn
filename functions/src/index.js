const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Calculate commission for the platform automatically on order creation[cite: 2]
exports.processCommission = functions.firestore.document('orders/{orderId}').onCreate((snap, ctx) => {
  const order = snap.data();
  if(!order.price) return null;
  const commission = order.price * 0.15;
  return snap.ref.set({ commission, platformFeeProcessed: true }, { merge: true });
});
