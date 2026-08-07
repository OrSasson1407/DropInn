const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Single source of truth commission calculation (Cloud Function authority)
exports.processCommission = functions.firestore.document('orders/{orderId}').onCreate((snap, ctx) => {
  const order = snap.data();
  if (!order || typeof order.price !== 'number') return null;
  const commission = Math.round(order.price * 0.15);
  const providerPayout = order.price - commission;
  return snap.ref.set({ commission, providerPayout, platformFeeProcessed: true }, { merge: true });
});
