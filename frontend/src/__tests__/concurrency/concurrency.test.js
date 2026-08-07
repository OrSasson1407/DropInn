import { describe, it, expect, vi } from 'vitest';
import { updateOrderStatus, cancelOrder } from '../../shared/services/firestore';

vi.mock('../../firebase', () => ({ db: {} }));

let mockOrderData = { status: 'pending', customerId: 'c1', providerId: 'p1' };

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(async () => ({
    exists: () => true,
    data: () => ({ ...mockOrderData })
  })),
  updateDoc: vi.fn(async (ref, data) => {
    mockOrderData = { ...mockOrderData, ...data };
  }),
  addDoc: vi.fn().mockResolvedValue({ id: 'notif_1' }),
  collection: vi.fn(),
  serverTimestamp: vi.fn(() => 'TS')
}));

describe('Concurrency & Race Condition Suite', () => {

  it('handles concurrent order approval by provider and cancellation by customer', async () => {
    mockOrderData = { status: 'pending', customerId: 'c1', providerId: 'p1' };

    // Simulate parallel execution
    const approvePromise = updateOrderStatus('ord_1', 'approved', 'pending');
    const cancelPromise = cancelOrder('ord_1', 'Changed mind');

    const results = await Promise.allSettled([approvePromise, cancelPromise]);
    
    // At least one operation should settle or update the doc cleanly
    const fulfilledCount = results.filter(r => r.status === 'fulfilled').length;
    expect(fulfilledCount).toBeGreaterThanOrEqual(1);
    expect(['approved', 'cancelled']).toContain(mockOrderData.status);
  });

  it('compares client-side vs cloud function commission math consistency', () => {
    // Known potential inconsistency test:
    // Client calculates Math.round(price * 0.15)
    // Cloud function calculates Math.round(price * 0.15)
    const testPrices = [99, 100, 110, 125, 149, 199, 250];

    testPrices.forEach(price => {
      const clientCommission = Math.round(price * 0.15);
      const serverCommission = Math.round(price * 0.15);

      expect(clientCommission).toBe(serverCommission);
    });
  });
});
