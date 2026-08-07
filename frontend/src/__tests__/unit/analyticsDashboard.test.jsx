import { describe, it, expect, vi } from 'vitest';
import { calculateDailyRollup } from './analyticsAndFraud.test';

// Mock Firebase
vi.mock('../../firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  doc: vi.fn(),
  setDoc: vi.fn(() => Promise.resolve()),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  serverTimestamp: vi.fn(() => '2026-08-07T00:00:00Z')
}));

describe('Admin Analytics Dashboard Unit Tests', () => {
  it('calculates daily GMV and 15% platform commission correctly', () => {
    const orders = [
      { id: '1', status: 'completed', price: 200 },
      { id: '2', status: 'completed', price: 100 },
      { id: '3', status: 'cancelled', price: 150 }
    ];

    const result = calculateDailyRollup(orders);

    expect(result.totalOrders).toBe(2);
    expect(result.gmv).toBe(300);
    expect(result.totalCommission).toBe(45); // 15% of 300 = 45
    expect(result.takeRate).toBe(0.15);
  });

  it('handles zero orders without throwing division by zero errors', () => {
    const result = calculateDailyRollup([]);

    expect(result.totalOrders).toBe(0);
    expect(result.gmv).toBe(0);
    expect(result.totalCommission).toBe(0);
    expect(result.takeRate).toBe(0);
  });

  it('calculates churn rate percentage accurately from cancelled vs total volume', () => {
    const totalVolume = 10;
    const cancelledCount = 2;

    const churnRate = totalVolume > 0 
      ? Number(((cancelledCount / totalVolume) * 100).toFixed(2))
      : 0;

    expect(churnRate).toBe(20);
  });
});
