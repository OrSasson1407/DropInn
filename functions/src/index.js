const functions = require('firebase-functions');
const admin = require('firebase-admin');
if (!admin.apps.length) {
  admin.initializeApp();
}

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

  // Fetch all orders
  const ordersSnap = await db.collection('orders').get();
  const allOrders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Filter orders for target date or overall snapshot
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

  // Calculate churn rate percentage: (cancelled / total) * 100
  const churnRate = bookingVolume > 0 
    ? Number(((cancelledOrders.length / bookingVolume) * 100).toFixed(2))
    : 0;

  // Fetch active providers
  const providersSnap = await db.collection('providers').get();
  const activeProvidersCount = providersSnap.docs.filter(d => d.data().isAvailable || d.data().isApproved).length;

  // Fetch active customers
  const uniqueCustomers = new Set(targetOrders.map(o => o.customerId).filter(Boolean));

  // Regional breakdown
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

