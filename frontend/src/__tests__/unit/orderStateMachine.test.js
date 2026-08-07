import { describe, it, expect } from 'vitest';
import { 
  ORDER_STATES, 
  ALLOWED_TRANSITIONS, 
  canTransitionOrder, 
  calculateDynamicPrice 
} from '../../shared/services/orderStateMachine';

describe('Order State Machine & Dynamic Pricing (Unit Tests)', () => {
  describe('canTransitionOrder()', () => {
    it('allows transition from PENDING to ACCEPTED', () => {
      expect(canTransitionOrder(ORDER_STATES.PENDING, ORDER_STATES.ACCEPTED)).toBe(true);
    });

    it('allows transition from PENDING to CANCELLED', () => {
      expect(canTransitionOrder(ORDER_STATES.PENDING, ORDER_STATES.CANCELLED)).toBe(true);
    });

    it('allows transition from ACCEPTED to EN_ROUTE', () => {
      expect(canTransitionOrder(ORDER_STATES.ACCEPTED, ORDER_STATES.EN_ROUTE)).toBe(true);
    });

    it('allows transition from ACCEPTED to CANCELLED', () => {
      expect(canTransitionOrder(ORDER_STATES.ACCEPTED, ORDER_STATES.CANCELLED)).toBe(true);
    });

    it('allows transition from EN_ROUTE to IN_PROGRESS', () => {
      expect(canTransitionOrder(ORDER_STATES.EN_ROUTE, ORDER_STATES.IN_PROGRESS)).toBe(true);
    });

    it('allows transition from IN_PROGRESS to COMPLETED', () => {
      expect(canTransitionOrder(ORDER_STATES.IN_PROGRESS, ORDER_STATES.COMPLETED)).toBe(true);
    });

    it('disallows transition from PENDING directly to COMPLETED', () => {
      expect(canTransitionOrder(ORDER_STATES.PENDING, ORDER_STATES.COMPLETED)).toBe(false);
    });

    it('disallows transition from COMPLETED to CANCELLED', () => {
      expect(canTransitionOrder(ORDER_STATES.COMPLETED, ORDER_STATES.CANCELLED)).toBe(false);
    });

    it('disallows transition from CANCELLED to IN_PROGRESS', () => {
      expect(canTransitionOrder(ORDER_STATES.CANCELLED, ORDER_STATES.IN_PROGRESS)).toBe(false);
    });

    it('handles unknown current state gracefully', () => {
      expect(canTransitionOrder('INVALID_STATE', ORDER_STATES.ACCEPTED)).toBe(false);
    });
  });

  describe('calculateDynamicPrice()', () => {
    it('calculates standard base price without surge or distance surcharge', () => {
      const result = calculateDynamicPrice(100, 1.0, 0);
      expect(result.totalPrice).toBe(100);
      expect(result.surgeMultiplier).toBe(1.0);
      expect(result.travelSurcharge).toBe(0);
      expect(result.platformCommission).toBe(15);
      expect(result.providerEarnings).toBe(85);
      expect(result.isSurgeApplied).toBe(false);
    });

    it('applies modest surge pricing up to 1.25x', () => {
      const result = calculateDynamicPrice(100, 1.25, 0);
      expect(result.totalPrice).toBe(125);
      expect(result.surgeMultiplier).toBe(1.25);
      expect(result.isSurgeApplied).toBe(true);
    });

    it('strictly caps surge multiplier at 1.5x max', () => {
      const result = calculateDynamicPrice(100, 2.5, 0); // Attempt 2.5x
      expect(result.surgeMultiplier).toBe(1.5);
      expect(result.totalPrice).toBe(150);
    });

    it('does not apply surge below 1.0x', () => {
      const result = calculateDynamicPrice(100, 0.8, 0);
      expect(result.surgeMultiplier).toBe(1.0);
      expect(result.totalPrice).toBe(100);
    });

    it('calculates travel surcharge for distances over 5km', () => {
      const result = calculateDynamicPrice(100, 1.0, 10); // 10km = 5km extra * 3 ILS = 15 ILS
      expect(result.travelSurcharge).toBe(15);
      expect(result.totalPrice).toBe(115);
    });

    it('combines surge and distance surcharge correctly', () => {
      const result = calculateDynamicPrice(100, 1.2, 10); // (100 * 1.2) + 15 = 135
      expect(result.totalPrice).toBe(135);
      expect(result.platformCommission).toBe(20); // 135 * 0.15 = 20.25 -> 20
      expect(result.providerEarnings).toBe(115);
    });

    it('returns 0 total price for 0 base price', () => {
      const result = calculateDynamicPrice(0, 1.5, 10);
      expect(result.totalPrice).toBe(0);
    });
  });
});
