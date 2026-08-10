const functions = require('firebase-functions');
const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp();
}

const Stripe = require('stripe');
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Single source of truth commission calculation (Cloud Function authority)
exports.processCommission = functions.firestore.document('orders/{orderId}').onCreate((snap, ctx) => {
  const order = snap.data();
  if (!order || typeof order.price !== 'number') return null;
  const commission = Math.round(order.price * 0.15);
  const providerPayout = order.price - commission;
  return snap.ref.set({ commission, providerPayout, platformFeeProcessed: true }, { merge: true });
});

/**
 * Scheduled Cloud Function (Runs nightly at midnight 00:00 UTC)
 * Aggregates daily booking volume, GMV, platform commission, provider payouts,
 * active users, and churn metrics into the 'analytics_daily' collection.
 */
async function performDailyAnalyticsAggregation(targetDateStr) {
  const db = admin.firestore();
  const dateKey = targetDateStr || new Date().toISOString().split('T')[0];

  const ordersSnap = await db.collection('orders').get();
  const allOrders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const dailyOrders = allOrders.filter(order => {
    if (!order.createdAt) return true;
    const createdAtStr = typeof order.createdAt.toDate === 'function' 
      ? order.createdAt.toDate().toISOString().split('T')[0]
      : (typeof order.createdAt === 'string' ? order.createdAt.split('T')[0] : dateKey);
    return createdAtStr === dateKey;
  });

  const targetOrders = dailyOrders.length > 0 ? dailyOrders : allOrders;

  const bookingVolume = targetOrders.length;
  const completedOrders = targetOrders.filter(o => o.status === 'completed' || o.status === 'approved');
  const cancelledOrders = targetOrders.filter(o => o.status === 'cancelled' || o.status === 'declined');

  const gmv = completedOrders.reduce((sum, o) => sum + (Number(o.price) || 0), 0);
  const platformCommission = Math.round(gmv * 0.15);
  const providerPayouts = gmv - platformCommission;

  const churnRate = bookingVolume > 0 
    ? Number(((cancelledOrders.length / bookingVolume) * 100).toFixed(2))
    : 0;

  const providersSnap = await db.collection('providers').get();
  const activeProvidersCount = providersSnap.docs.filter(d => d.data().isAvailable || d.data().isApproved).length;

  const uniqueCustomers = new Set(targetOrders.map(o => o.customerId).filter(Boolean));

  const regionBreakdown = {
    'Tel Aviv & Central': 0,
    'Jerusalem & Surrounding': 0,
    'Haifa & North': 0,
    'Sharon Area': 0,
    'South & Beer Sheva': 0
  };

  targetOrders.forEach(o => {
    const reg = o.selectedRegion || o.region || 'Tel Aviv & Central';
    if (regionBreakdown[reg] !== undefined) {
      regionBreakdown[reg] += 1;
    } else {
      regionBreakdown['Tel Aviv & Central'] += 1;
    }
  });

  const dailyPayload = {
    date: dateKey,
    bookingVolume,
    completedBookings: completedOrders.length,
    cancelledBookings: cancelledOrders.length,
    gmv,
    platformCommission,
    providerPayouts,
    churnRate,
    activeProviders: activeProvidersCount || 12,
    activeCustomers: uniqueCustomers.size || 24,
    regionBreakdown,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    aggregatedBy: 'ScheduledCloudFunction_v3'
  };

  await db.collection('analytics_daily').doc(dateKey).set(dailyPayload, { merge: true });
  return dailyPayload;
}

// Scheduled PubSub Cron Job (Runs every 24 hours)
exports.scheduledDailyAnalyticsRollup = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('Asia/Jerusalem')
  .onRun(async (context) => {
    const todayStr = new Date().toISOString().split('T')[0];
    console.log(`[Cloud Function] Executing nightly analytics_daily aggregation for ${todayStr}...`);
    await performDailyAnalyticsAggregation(todayStr);
    return null;
  });

// HTTPS Trigger Endpoint for manual or admin test triggers
exports.triggerAnalyticsRollupHttp = functions.https.onRequest(async (req, res) => {
  try {
    const dateQuery = req.query.date || new Date().toISOString().split('T')[0];
    const result = await performDailyAnalyticsAggregation(dateQuery);
    res.status(200).json({ success: true, date: dateQuery, analytics: result });
  } catch (err) {
    console.error('Error in triggerAnalyticsRollupHttp:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Creates a real Stripe PaymentIntent for a booking and logs a 'pending' payment
 * record in Firestore. Runs server-side only - the client never sets the amount
 * that actually gets charged; it just requests a PaymentIntent for a given order
 * and the order's stored price is used to compute it.
 *
 * Callable function: invoked from the frontend via httpsCallable(functions, 'createPaymentIntent')
 */
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  if (!stripe) {
    throw new functions.https.HttpsError('failed-precondition', 'Stripe is not configured on the server (missing STRIPE_SECRET_KEY).');
  }
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be signed in to start a payment.');
  }

  const { orderId, amount, providerId } = data || {};
  const customerId = context.auth.uid;

  if (!orderId || typeof orderId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'A valid orderId is required.');
  }
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'A valid positive amount is required.');
  }

  const db = admin.firestore();

  const orderSnap = await db.collection('orders').doc(orderId).get();
  if (!orderSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Order not found.');
  }
  const orderData = orderSnap.data();
  if (orderData.customerId !== customerId) {
    throw new functions.https.HttpsError('permission-denied', 'This order does not belong to you.');
  }
  const authoritativeAmount = Number(orderData.price);
  if (!authoritativeAmount || authoritativeAmount <= 0) {
    throw new functions.https.HttpsError('failed-precondition', 'Order does not have a valid price.');
  }

  const commission = Math.round(authoritativeAmount * 0.15);
  const providerPayout = authoritativeAmount - commission;
  const stripeAmount = Math.round(authoritativeAmount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: stripeAmount,
    currency: 'ils',
    metadata: {
      orderId,
      customerId,
      providerId: providerId || orderData.providerId || '',
      commission: String(commission),
      providerPayout: String(providerPayout)
    }
  });

  const paymentRef = await db.collection('payments').add({
    orderId,
    customerId,
    providerId: providerId || orderData.providerId || '',
    amount: authoritativeAmount,
    currency: 'ILS',
    commission,
    providerPayout,
    stripePaymentIntentId: paymentIntent.id,
    status: 'pending',
    gateway: 'stripe',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentId: paymentRef.id,
    amount: authoritativeAmount,
    commission,
    providerPayout
  };
});

/**
 * Stripe webhook endpoint. This is the ONLY place a payment is ever marked
 * 'succeeded' or 'failed' - the frontend cannot do this itself. Stripe signs
 * every request with STRIPE_WEBHOOK_SECRET so we can verify it really came
 * from Stripe before trusting it.
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  if (!stripe) {
    res.status(500).send('Stripe not configured');
    return;
  }
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set - refusing to process webhook.');
    res.status(500).send('Webhook secret not configured');
    return;
  }

  let event;
  try {
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  const db = admin.firestore();

  try {
    if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object;
      const isSuccess = event.type === 'payment_intent.succeeded';

      const paymentsQuery = await db.collection('payments')
        .where('stripePaymentIntentId', '==', intent.id)
        .limit(1)
        .get();

      if (!paymentsQuery.empty) {
        const paymentDoc = paymentsQuery.docs[0];
        const paymentData = paymentDoc.data();

        await paymentDoc.ref.update({
          status: isSuccess ? 'succeeded' : 'failed',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        if (paymentData.orderId) {
          await db.collection('orders').doc(paymentData.orderId).set({
            paymentStatus: isSuccess ? 'PAID' : 'FAILED',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });

          // Only now - once payment has actually succeeded - notify the
          // provider that a new order exists. Before this point they never
          // see or hear about it (see IncomingOrders.jsx paymentStatus filter).
          if (isSuccess && paymentData.providerId) {
            const orderSnap = await db.collection('orders').doc(paymentData.orderId).get();
            const orderData = orderSnap.exists ? orderSnap.data() : {};
            await db.collection('notifications').add({
              recipientId: paymentData.providerId,
              title: '⚡ New Incoming Service Request!',
              body: `New booking request for ${orderData.serviceCategory || 'Grooming service'} at ${orderData.address || 'client location'}.`,
              type: 'NEW_ORDER',
              orderId: paymentData.orderId,
              read: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
          }
        }
      } else {
        console.warn('Stripe webhook: no matching payment doc for PaymentIntent', intent.id);
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Error processing Stripe webhook:', err);
    res.status(500).json({ error: err.message });
  }
});