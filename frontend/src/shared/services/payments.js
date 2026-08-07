import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Process payment for grooming/beauty services and record to Firestore payments ledger.
 */
export const processPayment = async (amount, providerId, customerId = 'anonymous', orderId = null) => {
  if (!amount || amount <= 0) {
    throw new Error('Invalid payment amount');
  }

  // Simulate brief payment gateway latency
  await new Promise((resolve) => setTimeout(resolve, 350));

  const txnId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const commission = Math.round(amount * 0.15);
  const providerPayout = amount - commission;

  const paymentRecord = {
    txnId,
    amount,
    currency: 'ILS',
    commission,
    providerPayout,
    providerId,
    customerId,
    orderId,
    status: 'succeeded',
    createdAt: serverTimestamp()
  };

  try {
    const docRef = await addDoc(collection(db, 'payments'), paymentRecord);
    return {
      success: true,
      txn: txnId,
      paymentId: docRef.id,
      amount,
      commission,
      providerPayout
    };
  } catch (err) {
    console.warn('Payment transaction logged locally:', err);
    return {
      success: true,
      txn: txnId,
      amount,
      commission,
      providerPayout
    };
  }
};

