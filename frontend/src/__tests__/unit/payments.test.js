import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processPayment } from '../../shared/services/payments';

vi.mock('../../firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'mock-payments-col'),
  addDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'MOCK_TS')
}));

import { addDoc } from 'firebase/firestore';

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

    it('falls back to local success when Firestore addDoc fails', async () => {
      addDoc.mockRejectedValueOnce(new Error('Network error'));

      const res = await processPayment(100, 'p1', 'c1');
      expect(res.success).toBe(true);
      expect(res.amount).toBe(100);
      expect(res.commission).toBe(15);
      expect(res.providerPayout).toBe(85);
    });
  });
});
