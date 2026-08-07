import { describe, it, expect } from 'vitest';

/**
 * Analytics & Fraud Anomaly Detection Logic (Pillar 5 Unit Tests)
 */

export function calculateDailyRollup(orders) {
  if (!Array.isArray(orders) || orders.length === 0) {
    return { totalOrders: 0, gmv: 0, totalCommission: 0, takeRate: 0 };
  }

  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalOrders = completedOrders.length;
  const gmv = completedOrders.reduce((acc, o) => acc + (o.price || 0), 0);
  const totalCommission = completedOrders.reduce((acc, o) => acc + (o.commission || Math.round((o.price || 0) * 0.15)), 0);
  const takeRate = gmv > 0 ? Number((totalCommission / gmv).toFixed(4)) : 0;

  return {
    totalOrders,
    gmv,
    totalCommission,
    takeRate
  };
}

export function isRateLimitExceeded(userRequestCount, windowMinutes = 1, maxAllowed = 10) {
  return userRequestCount > maxAllowed;
}

export function detectFraudAnomaly(userActivity) {
  const flags = [];
  if (userActivity.cancellationCount >= 3 && userActivity.totalOrders <= 5) {
    flags.push('HIGH_CANCELLATION_RATE');
  }
  if (userActivity.reviewsGiven5StarIn1Hour >= 10) {
    flags.push('SUSPICIOUS_REVIEW_SPIKE');
  }
  if (userActivity.payoutAmountMismatch) {
    flags.push('PAYOUT_MISMATCH_ALERT');
  }
  return {
    isSuspicious: flags.length > 0,
    flags
  };
}

describe('Analytics & Fraud Detection Engine (Unit Tests)', () => {
  describe('calculateDailyRollup()', () => {
    it('calculates GMV, total commission, and take rate accurately', () => {
      const orders = [
        { status: 'completed', price: 100, commission: 15 },
        { status: 'completed', price: 200, commission: 30 },
        { status: 'cancelled', price: 150, commission: 22 } // Excluded
      ];

      const rollup = calculateDailyRollup(orders);
      expect(rollup.totalOrders).toBe(2);
      expect(rollup.gmv).toBe(300);
      expect(rollup.totalCommission).toBe(45);
      expect(rollup.takeRate).toBe(0.15); // 15%
    });

    it('returns zeroes for empty order list', () => {
      const rollup = calculateDailyRollup([]);
      expect(rollup.totalOrders).toBe(0);
      expect(rollup.gmv).toBe(0);
      expect(rollup.takeRate).toBe(0);
    });
  });

  describe('isRateLimitExceeded()', () => {
    it('allows requests within threshold limit', () => {
      expect(isRateLimitExceeded(5, 1, 10)).toBe(false);
    });

    it('flags rate limit exceeded when threshold is breached', () => {
      expect(isRateLimitExceeded(12, 1, 10)).toBe(true);
    });
  });

  describe('detectFraudAnomaly()', () => {
    it('flags high cancellation rate anomaly', () => {
      const res = detectFraudAnomaly({ cancellationCount: 4, totalOrders: 5 });
      expect(res.isSuspicious).toBe(true);
      expect(res.flags).toContain('HIGH_CANCELLATION_RATE');
    });

    it('flags suspicious review spike anomaly', () => {
      const res = detectFraudAnomaly({ reviewsGiven5StarIn1Hour: 15 });
      expect(res.isSuspicious).toBe(true);
      expect(res.flags).toContain('SUSPICIOUS_REVIEW_SPIKE');
    });

    it('returns clean status for normal user activity', () => {
      const res = detectFraudAnomaly({ cancellationCount: 0, totalOrders: 10, reviewsGiven5StarIn1Hour: 1 });
      expect(res.isSuspicious).toBe(false);
      expect(res.flags).toHaveLength(0);
    });
  });
});
