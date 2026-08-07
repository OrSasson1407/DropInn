import { getAnalytics, logEvent as firebaseLogEvent } from 'firebase/analytics';
import { app } from '../../firebase';

let analyticsInstance = null;

try {
  if (typeof window !== 'undefined') {
    analyticsInstance = getAnalytics(app);
  }
} catch (err) {
  // Analytics optional fallback for sandboxed iframe
}

export const logAnalyticsEvent = (eventName, eventParams = {}) => {
  const payload = {
    timestamp: new Date().toISOString(),
    ...eventParams
  };

  if (process.env.NODE_ENV !== 'test') {
    console.log(`[Analytics Event]: ${eventName}`, payload);
  }

  if (analyticsInstance) {
    try {
      firebaseLogEvent(analyticsInstance, eventName, payload);
    } catch (e) {
      // Ignored
    }
  }
};

// Convenience helpers for DropIn v2 events
export const trackProviderSearch = (query, category, region) => {
  logAnalyticsEvent('provider_search', { query, category, region });
};

export const trackBookingStarted = (providerId, serviceName, price) => {
  logAnalyticsEvent('booking_started', { providerId, serviceName, price });
};

export const trackBookingCompleted = (orderId, amount, currency = 'ILS') => {
  logAnalyticsEvent('booking_completed', { orderId, amount, currency });
};

export const trackProviderApproved = (providerId) => {
  logAnalyticsEvent('provider_approved', { providerId });
};

export const trackSOSTriggered = (orderId, location) => {
  logAnalyticsEvent('sos_triggered', { orderId, location });
};
