import { describe, it, expect } from 'vitest';

/**
 * Subscription & Loyalty Rules Logic Unit Tests (Pillar 4)
 */

export function calculateSubscriptionDiscount(planType, basePrice) {
  const discounts = {
    monthly_basic: 0.10,    // 10% off
    monthly_pro: 0.20,      // 20% off
    annual_vip: 0.30        // 30% off
  };
  const discountRate = discounts[planType] || 0;
  const discountAmount = Math.round(basePrice * discountRate);
  return {
    discountRate,
    discountAmount,
    finalPrice: basePrice - discountAmount
  };
}

export function generateReferralCode(userId) {
  if (!userId) throw new Error('UserId is required');
  const cleanId = userId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
  return `DROPIN-${cleanId}-2026`;
}

export function calculateLoyaltyPoints(orderAmount) {
  if (orderAmount <= 0) return 0;
  // 1 point per 10 ILS spent
  return Math.floor(orderAmount / 10);
}

export function getLoyaltyTier(totalPoints) {
  if (totalPoints >= 500) return { tier: 'VIP Gold', perk: 'Free Express Travel + 30% off' };
  if (totalPoints >= 200) return { tier: 'Silver Groomer', perk: '15% off repeat bookings' };
  if (totalPoints >= 50) return { tier: 'Bronze Member', perk: '5% off next booking' };
  return { tier: 'Starter', perk: 'Standard Member' };
}

describe('Subscription & Loyalty System (Unit Tests)', () => {
  describe('calculateSubscriptionDiscount()', () => {
    it('applies 10% discount for monthly basic plan', () => {
      const res = calculateSubscriptionDiscount('monthly_basic', 150);
      expect(res.discountAmount).toBe(15);
      expect(res.finalPrice).toBe(135);
    });

    it('applies 20% discount for monthly pro plan', () => {
      const res = calculateSubscriptionDiscount('monthly_pro', 200);
      expect(res.discountAmount).toBe(40);
      expect(res.finalPrice).toBe(160);
    });

    it('applies 30% discount for annual VIP plan', () => {
      const res = calculateSubscriptionDiscount('annual_vip', 300);
      expect(res.discountAmount).toBe(90);
      expect(res.finalPrice).toBe(210);
    });

    it('returns 0 discount for invalid plan type', () => {
      const res = calculateSubscriptionDiscount('unknown_plan', 100);
      expect(res.discountAmount).toBe(0);
      expect(res.finalPrice).toBe(100);
    });
  });

  describe('generateReferralCode()', () => {
    it('generates unique structured referral code', () => {
      const code = generateReferralCode('user_abc123');
      expect(code).toBe('DROPIN-USER-2026');
    });

    it('throws error if userId is missing', () => {
      expect(() => generateReferralCode(null)).toThrow('UserId is required');
    });
  });

  describe('calculateLoyaltyPoints()', () => {
    it('awards 1 point per 10 ILS spent', () => {
      expect(calculateLoyaltyPoints(150)).toBe(15);
      expect(calculateLoyaltyPoints(99)).toBe(9);
      expect(calculateLoyaltyPoints(0)).toBe(0);
      expect(calculateLoyaltyPoints(-50)).toBe(0);
    });
  });

  describe('getLoyaltyTier()', () => {
    it('assigns Starter tier for 0 points', () => {
      expect(getLoyaltyTier(0).tier).toBe('Starter');
    });

    it('assigns Bronze Member for 50 points', () => {
      expect(getLoyaltyTier(50).tier).toBe('Bronze Member');
    });

    it('assigns Silver Groomer for 200 points', () => {
      expect(getLoyaltyTier(200).tier).toBe('Silver Groomer');
    });

    it('assigns VIP Gold for 500+ points', () => {
      expect(getLoyaltyTier(750).tier).toBe('VIP Gold');
    });
  });
});
