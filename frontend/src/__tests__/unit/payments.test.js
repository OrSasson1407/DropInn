import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processPayment, processRefund } from '../../shared/services/payments';

vi.mock('../../firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'mock-payments-col'),
  addDoc: vi.fn(),
  doc: vi.fn((db, col, id) => `mock-doc-${col}-${id}`),
  getDoc: vi.fn().mockResolvedValue({
    exists: () => true,
    data: () => ({ amount: 120, status: 'succeeded' })
  }),
  updateDoc: vi.fn().mockResolvedValue(),
  serverTimestamp: vi.fn(() => 'MOCK_TS')
}));

import { addDoc, updateDoc } from 'firebase/firestore';

describe('Payments Unit Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processPayment()', () => {
    const invalidAmounts = [0, -10, -0.01, null, undefined, NaN];

    invalidAmounts.forEach((amt, idx) => {
      it(`rejects invalid payment amount (${amt}) (case #${idx + 1})`, async () => {
        await expect(processPayment(amt, 'p1')).rejects.toThrow('Invalid payment amount');
      });
    });

    const paymentTestCases = [
      { amount: 100, expectedCommission: 15, expectedPayout: 85 },
      { amount: 120, expectedCommission: 18, expectedPayout: 102 },
      { amount: 200, expectedCommission: 30, expectedPayout: 170 },
      { amount: 150, expectedCommission: 23, expectedPayout: 127 },
      { amount: 90, expectedCommission: 14, expectedPayout: 76 },
    ];

    paymentTestCases.forEach(({ amount, expectedCommission, expectedPayout }, idx) => {
      it(`calculates 15% platform commission and provider payout correctly for amount ${amount} (case #${idx + 1})`, async () => {
        addDoc.mockResolvedValueOnce({ id: `pay_doc_${idx}` });

        const res = await processPayment(amount, 'prov_10', 'cust_20', 'order_30');

        expect(res.success).toBe(true);
        expect(res.amount).toBe(amount);
        expect(res.commission).toBe(expectedCommission);
        expect(res.providerPayout).toBe(expectedPayout);
        expect(res.txn).toMatch(/^txn_\d+_[a-z0-9]+$/);

        expect(addDoc).toHaveBeenCalledWith('mock-payments-col', expect.objectContaining({
          amount,
          commission: expectedCommission,
          providerPayout: expectedPayout,
          currency: 'ILS',
          providerId: 'prov_10',
          customerId: 'cust_20',
          orderId: 'order_30',
          status: 'succeeded'
        }));
      });
    });
  });

  describe('processRefund()', () => {
    it('throws error if neither paymentId nor orderId is provided', async () => {
      await expect(processRefund(null, null)).rejects.toThrow(/Payment ID or Order ID is required/);
    });

    it('reverses payment and updates Firestore payment record to refunded status', async () => {
      const res = await processRefund('pay_123', 'order_456', 120, 'Customer cancelled before dispatch');
      
      expect(res.success).toBe(true);
      expect(res.status).toBe('refunded');
      expect(res.refundTxnId).toMatch(/^re_\d+_[a-z0-9]+$/);
      expect(updateDoc).toHaveBeenCalled();
    });
  });
});
