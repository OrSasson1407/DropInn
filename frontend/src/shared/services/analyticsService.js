import { db } from '../../firebase';
import {
  collection, getDocs, doc, setDoc, query, orderBy, limit
} from 'firebase/firestore';

/**
 * Service layer for interacting with the 'analytics_daily' Firestore collection
 * populated by scheduled Cloud Functions tracking booking volume, GMV, and churn.
 */

function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Fetch daily analytics rollups from 'analytics_daily' collection.
 * Returns whatever real rollups exist - an empty array if none have been
 * generated yet (the UI is responsible for showing an empty state).
 */
export async function fetchDailyAnalytics(limitDays = 30) {
  const q = query(
    collection(db, 'analytics_daily'),
    orderBy('date', 'desc'),
    limit(limitDays)
  );
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return docs.sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Manually trigger or recalculate today's daily rollup from real orders/providers data.
 * All figures are computed from live Firestore data - no placeholder numbers.
 */
export async function triggerManualAnalyticsRollup() {
  const todayStr = formatDate(new Date());

  const [ordersSnap, providersSnap] = await Promise.all([
    getDocs(collection(db, 'orders')),
    getDocs(collection(db, 'providers'))
  ]);
  const allOrders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const allProviders = providersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const bookingVolume = allOrders.length;
  const completedOrders = allOrders.filter(o => o.status === 'completed' || o.status === 'approved');
  const cancelledOrders = allOrders.filter(o => o.status === 'cancelled' || o.status === 'declined');

  const gmv = completedOrders.reduce((sum, o) => sum + (Number(o.price) || 0), 0);
  const platformCommission = Math.round(gmv * 0.15);
  const providerPayouts = gmv - platformCommission;

  const churnRate = bookingVolume > 0
    ? Number(((cancelledOrders.length / bookingVolume) * 100).toFixed(2))
    : 0;

  const activeProviders = allProviders.filter(p => p.isApproved).length;

  const customerIds = new Set(allOrders.map(o => o.customerId).filter(Boolean));
  const activeCustomers = customerIds.size;

  const regionBreakdown = {};
  for (const o of allOrders) {
    const region = o.region || 'Unspecified';
    regionBreakdown[region] = (regionBreakdown[region] || 0) + 1;
  }

  const payload = {
    date: todayStr,
    bookingVolume,
    completedBookings: completedOrders.length,
    cancelledBookings: cancelledOrders.length,
    gmv,
    platformCommission,
    providerPayouts,
    churnRate,
    activeProviders,
    activeCustomers,
    regionBreakdown,
    updatedAt: new Date().toISOString(),
    aggregatedBy: 'AdminManualRollup'
  };

  await setDoc(doc(db, 'analytics_daily', todayStr), payload, { merge: true });
  return payload;
}