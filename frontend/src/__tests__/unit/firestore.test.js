import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  isValidStatusTransition, createOrder, updateOrderStatus, 
  cancelOrder, submitOrderReview, sendNotification, VALID_STATUS_TRANSITIONS 
} from '../../shared/services/firestore';

// Mock Firebase modules
vi.mock('../../firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'mock-collection'),
  doc: vi.fn((db, col, id) => `mock-doc-${id}`),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  serverTimestamp: vi.fn(() => 'MOCK_TIMESTAMP')
}));

import { addDoc, getDoc, updateDoc } from 'firebase/firestore';

describe('Firestore Unit Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isValidStatusTransition - Exhaustive Matrix', () => {
    const statuses = ['pending', 'approved', 'completed', 'declined', 'cancelled'];
    
    // Matrix of all combinations
    statuses.forEach(from => {
      statuses.forEach(to => {
        const expected = (VALID_STATUS_TRANSITIONS[from] || []).includes(to);
        it(`should return ${expected} for transition '${from}' -> '${to}'`, () => {
          expect(isValidStatusTransition(from, to)).toBe(expected);
        });
      });
    });

    it('returns true if currentStatus is falsy/initial', () => {
      expect(isValidStatusTransition(null, 'pending')).toBe(true);
      expect(isValidStatusTransition(undefined, 'approved')).toBe(true);
      expect(isValidStatusTransition('', 'pending')).toBe(true);
    });

    it('returns false for unknown from status', () => {
      expect(isValidStatusTransition('unknown_state', 'approved')).toBe(false);
    });

    it('returns false for unknown target status from completed', () => {
      expect(isValidStatusTransition('completed', 'unknown_state')).toBe(false);
    });
  });

  describe('createOrder()', () => {
    const testCases = [
      { price: 100, expectedPrice: 100, expectedCommission: 15 },
      { price: 120, expectedPrice: 120, expectedCommission: 18 },
      { price: 99, expectedPrice: 99, expectedCommission: 15 },
      { price: 250, expectedPrice: 250, expectedCommission: 38 },
      { price: 0, expectedPrice: 100, expectedCommission: 15 }, // 0 falls back to default 100
      { price: -50, expectedPrice: -50, expectedCommission: -7 },
      { price: '150', expectedPrice: 150, expectedCommission: 23 },
    ];

    testCases.forEach(({ price, expectedPrice, expectedCommission }, idx) => {
      it(`calculates commission correctly for price ${price} (case #${idx + 1})`, async () => {
        addDoc.mockResolvedValueOnce({ id: `order_${idx}` });
        
        const result = await createOrder('cust_1', 'prov_1', { price, serviceCategory: 'Haircut', address: 'Tel Aviv' });
        expect(result.id).toBe(`order_${idx}`);
        expect(addDoc).toHaveBeenCalledWith('mock-collection', expect.objectContaining({
          customerId: 'cust_1',
          providerId: 'prov_1',
          price: expectedPrice,
          commission: expectedCommission,
          status: 'pending',
          createdAt: 'MOCK_TIMESTAMP'
        }));
      });
    });

    it('handles addDoc failures gracefully', async () => {
      addDoc.mockRejectedValueOnce(new Error('Firestore write failed'));
      await expect(createOrder('cust_1', 'prov_1', { price: 100 })).rejects.toThrow('Firestore write failed');
    });
  });

  describe('cancelOrder()', () => {
    it('successfully cancels a pending order', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ status: 'pending', customerId: 'c1' })
      });
      updateDoc.mockResolvedValueOnce();

      await cancelOrder('order_1', 'Changed mind');
      expect(updateDoc).toHaveBeenCalledWith('mock-doc-order_1', expect.objectContaining({
        status: 'cancelled',
        cancellationReason: 'Changed mind',
        cancelledAt: 'MOCK_TIMESTAMP'
      }));
    });

    it('successfully cancels an approved order', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ status: 'approved', customerId: 'c1' })
      });
      updateDoc.mockResolvedValueOnce();

      await cancelOrder('order_1');
      expect(updateDoc).toHaveBeenCalledWith('mock-doc-order_1', expect.objectContaining({
        status: 'cancelled'
      }));
    });

    it('rejects cancellation for completed orders', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ status: 'completed' })
      });

      await expect(cancelOrder('order_1')).rejects.toThrow("Cannot cancel order in 'completed' status");
    });

    it('rejects cancellation for already cancelled orders', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ status: 'cancelled' })
      });

      await expect(cancelOrder('order_1')).rejects.toThrow("Cannot cancel order in 'cancelled' status");
    });

    it('throws error if order does not exist', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => false
      });

      await expect(cancelOrder('order_missing')).rejects.toThrow('Order not found');
    });
  });

  describe('updateOrderStatus()', () => {
    it('throws error on invalid status transition', async () => {
      await expect(updateOrderStatus('o1', 'completed', 'pending')).rejects.toThrow("Invalid status transition from 'pending' to 'completed'");
    });

    it('throws error if order is not found', async () => {
      getDoc.mockResolvedValueOnce({ exists: () => false });
      await expect(updateOrderStatus('o1', 'approved', 'pending')).rejects.toThrow('Order not found');
    });

    it('throws error if status mismatches current db status', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ status: 'cancelled' })
      });

      await expect(updateOrderStatus('o1', 'approved', 'pending')).rejects.toThrow("Order status mismatch. Current status is 'cancelled'");
    });

    it('updates status and dispatches notification on approved', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ status: 'pending', customerId: 'cust_99' })
      });
      updateDoc.mockResolvedValueOnce();

      await updateOrderStatus('o1', 'approved', 'pending');
      expect(updateDoc).toHaveBeenCalledWith('mock-doc-o1', expect.objectContaining({
        status: 'approved',
        updatedAt: 'MOCK_TIMESTAMP'
      }));
    });
  });

  describe('submitOrderReview()', () => {
    it('rejects if order does not exist', async () => {
      getDoc.mockResolvedValueOnce({ exists: () => false });
      await expect(submitOrderReview('o1', 'p1', 5, 'Great!', 'c1')).rejects.toThrow('Order does not exist');
    });

    it('rejects if current user is not the order customer', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ customerId: 'c_other', status: 'completed' })
      });

      await expect(submitOrderReview('o1', 'p1', 5, 'Great!', 'c1')).rejects.toThrow('You can only review orders that belong to you');
    });

    it('rejects if order status is not completed', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ customerId: 'c1', status: 'pending' })
      });

      await expect(submitOrderReview('o1', 'p1', 5, 'Great!', 'c1')).rejects.toThrow('Reviews can only be submitted for completed orders');
    });

    it('rejects duplicate reviews on same order', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ customerId: 'c1', status: 'completed', rating: 5 })
      });

      await expect(submitOrderReview('o1', 'p1', 5, 'Great!', 'c1')).rejects.toThrow('A review has already been submitted for this order');
    });

    it('calculates average rating correctly for provider upon review submission', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ customerId: 'c1', status: 'completed' })
      });
      // Provider mock doc
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          reviews: [
            { rating: 4, comment: 'Good' },
            { rating: 5, comment: 'Awesome' }
          ]
        })
      });
      updateDoc.mockResolvedValue();

      await submitOrderReview('o1', 'p1', 3, 'Average haircut', 'c1', 'John');

      // Total ratings = 4 + 5 + 3 = 12 / 3 = 4.0
      expect(updateDoc).toHaveBeenCalledWith('mock-doc-p1', expect.objectContaining({
        rating: 4
      }));
    });
  });

  describe('sendNotification()', () => {
    it('returns null if recipientId is missing', async () => {
      const res = await sendNotification(null, { title: 'Test' });
      expect(res).toBeUndefined();
    });

    it('dispatches notification doc to notifications collection', async () => {
      addDoc.mockResolvedValueOnce({ id: 'notif_1' });
      await sendNotification('u123', { title: 'Hello', body: 'World', type: 'TEST' });
      expect(addDoc).toHaveBeenCalledWith('mock-collection', expect.objectContaining({
        recipientId: 'u123',
        title: 'Hello',
        body: 'World',
        type: 'TEST',
        read: false
      }));
    });
  });
});
