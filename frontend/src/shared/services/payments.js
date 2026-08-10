import { functions } from '../../firebase';
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
 * Real refund flow. Calls the `refundPayment` Cloud Function, which issues an
 * actual Stripe refund via stripe.refunds.create(). Firestore is only ever
 * updated server-side (first to 'refund_requested' by this callable, then to
 * 'refunded' by the stripeWebhook once Stripe confirms via 'charge.refunded') -
 * the client never marks a refund as complete itself.
 */
export const processRefund = async (paymentId, orderId, refundAmount = null, reason = 'Order cancelled') => {
  if (!functions) {
    throw new Error('Firebase Functions is not initialized.');
  }
  if (!paymentId && !orderId) {
    throw new Error('Payment ID or Order ID is required for refund processing');
  }

  const callable = httpsCallable(functions, 'refundPayment');
  const result = await callable({ paymentId, orderId, reason });
  return result.data;
};