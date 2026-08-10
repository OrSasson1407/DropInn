import { db, functions } from '../../firebase';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { loadStripe } from '@stripe/stripe-js';

// Lazy-loaded Stripe.js instance (singleton)
let stripePromise = null;

export const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (key) {
      stripePromise = loadStripe(key);
    } else {
      console.error('VITE_STRIPE_PUBLISHABLE_KEY is not set - Stripe cannot be initialized.');
    }
  }
  return stripePromise;
};

/**
 * Requests a real Stripe PaymentIntent from the createPaymentIntent Cloud Function.
 * The order MUST already exist in Firestore before calling this - the Cloud
 * Function looks up the order's authoritative price server-side, so the
 * amount actually charged can never be tampered with on the client.
 *
 * Returns { clientSecret, paymentId, amount, commission, providerPayout }
 */
export const createPaymentIntentForOrder = async (orderId, amount, providerId) => {
  if (!functions) {
    throw new Error('Firebase Functions is not initialized.');
  }
  if (!orderId) {
    throw new Error('orderId is required to create a payment intent.');
  }
  const callable = httpsCallable(functions, 'createPaymentIntent');
  const result = await callable({ orderId, amount, providerId });
  return result.data;
};

/**
 * Refund flow. NOTE: this currently only updates Firestore records - it does
 * NOT yet call Stripe's real refund API. A follow-up Cloud Function
 * (e.g. `refundPayment`) is needed to actually reverse the charge with
 * Stripe before this can be considered production-ready.
 */
export const processRefund = async (paymentId, orderId, refundAmount = null, reason = 'Order cancelled') => {
  if (!paymentId && !orderId) {
    throw new Error('Payment ID or Order ID is required for refund processing');
  }

  const refundTxnId = `re_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  try {
    if (paymentId) {
      const paymentRef = doc(db, 'payments', paymentId);
      const paymentSnap = await getDoc(paymentRef);
      if (paymentSnap.exists()) {
        const pData = paymentSnap.data();
        const actualRefund = refundAmount || pData.amount;

        await updateDoc(paymentRef, {
          status: 'refund_requested',
          refundTxnId,
          refundAmount: actualRefund,
          refundReason: reason,
          refundRequestedAt: serverTimestamp()
        });
      }
    }

    if (orderId) {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'cancelled',
        paymentStatus: 'REFUND_REQUESTED',
        cancellationReason: reason,
        updatedAt: serverTimestamp()
      });
    }

    return {
      success: true,
      refundTxnId,
      status: 'refund_requested',
      reason
    };
  } catch (err) {
    console.error('Refund processing error:', err);
    throw new Error(`Refund failed: ${err.message}`);
  }
};