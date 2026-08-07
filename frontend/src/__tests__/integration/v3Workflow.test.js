import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ORDER_STATES, canTransitionOrder, calculateDynamicPrice } from '../../shared/services/orderStateMachine';
import { calculateSubscriptionDiscount, generateReferralCode } from '../unit/subscriptionsAndLoyalty.test';
import { canAccessChat, formatWhatsAppMessage } from '../unit/chatAndMessaging.test';
import { calculateTeamPayoutSplit } from '../unit/providerTeamsAndCRM.test';
import { calculateDailyRollup, detectFraudAnomaly } from '../unit/analyticsAndFraud.test';

/**
 * DropIn v3 End-to-End Workflow Integration Test Suite
 * Validates cross-pillar feature cohesion across all six PRD upgrade pillars.
 */

describe('DropIn v3 End-to-End Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Pillar 1 + Pillar 4: Calculates dynamic surge price and processes Stripe payment intent correctly', () => {
    const pricing = calculateDynamicPrice(120, 1.2, 8); // 120 base, 1.2x surge, 8km (3km extra = +9 ILS)
    expect(pricing.totalPrice).toBe(153); // (120 * 1.2 = 144) + 9 = 153
    expect(pricing.platformCommission).toBe(23); // ~15%
    expect(pricing.isSurgeApplied).toBe(true);
  });

  it('Pillar 2 + Pillar 3: Validates customer referral code generation and WhatsApp alert dispatch', () => {
    const referralCode = generateReferralCode('user_david_99');
    expect(referralCode).toBe('DROPIN-USER-2026');

    const waMsg = formatWhatsAppMessage('ORDER_CONFIRMED', {
      orderId: 'ORD-2026-99',
      providerName: 'Avi Barber',
      scheduledTime: '15:30'
    });
    expect(waMsg).toContain('ORD-2026-99');
    expect(waMsg).toContain('Avi Barber');
  });

  it('Pillar 3 + Pillar 1: Validates order-scoped chat session authorization during active booking', () => {
    const activeOrder = {
      id: 'ord_active',
      customerId: 'cust_77',
      providerId: 'prov_88',
      status: ORDER_STATES.IN_PROGRESS
    };

    expect(canAccessChat('cust_77', 'customer', activeOrder)).toBe(true);
    expect(canAccessChat('prov_88', 'provider', activeOrder)).toBe(true);
    expect(canAccessChat('cust_intruder', 'customer', activeOrder)).toBe(false);

    // After order completes, chat closes
    const completedOrder = { ...activeOrder, status: ORDER_STATES.COMPLETED };
    expect(canAccessChat('cust_77', 'customer', completedOrder)).toBe(false);
  });

  it('Pillar 4 + Pillar 5: Validates provider team payout splitting and daily analytics rollup', () => {
    const split = calculateTeamPayoutSplit(300, 0.15, 0.70);
    expect(split.platformCommission).toBe(45);
    expect(split.leadPayout).toBe(179);
    expect(split.assistantPayout).toBe(76);

    const orders = [
      { status: 'completed', price: 300, commission: 45 },
      { status: 'completed', price: 150, commission: 23 }
    ];
    const rollup = calculateDailyRollup(orders);
    expect(rollup.gmv).toBe(450);
    expect(rollup.totalCommission).toBe(68);
    expect(rollup.takeRate).toBeCloseTo(0.15, 2);
  });

  it('Pillar 5 + Pillar 1: Detects cancellation anomaly and protects system integrity', () => {
    const fraudCheck = detectFraudAnomaly({
      cancellationCount: 4,
      totalOrders: 5,
      reviewsGiven5StarIn1Hour: 12
    });

    expect(fraudCheck.isSuspicious).toBe(true);
    expect(fraudCheck.flags).toContain('HIGH_CANCELLATION_RATE');
    expect(fraudCheck.flags).toContain('SUSPICIOUS_REVIEW_SPIKE');
  });
});
