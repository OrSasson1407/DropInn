/**
 * DropIn Order State Machine & Pricing Module
 * Decoupled from React DOM specifics for seamless React Native reuse (Pillar 6 Groundwork)
 */

export const ORDER_STATES = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  EN_ROUTE: 'EN_ROUTE',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const ALLOWED_TRANSITIONS = {
  [ORDER_STATES.PENDING]: [ORDER_STATES.ACCEPTED, ORDER_STATES.CANCELLED],
  [ORDER_STATES.ACCEPTED]: [ORDER_STATES.EN_ROUTE, ORDER_STATES.CANCELLED],
  [ORDER_STATES.EN_ROUTE]: [ORDER_STATES.IN_PROGRESS, ORDER_STATES.CANCELLED],
  [ORDER_STATES.IN_PROGRESS]: [ORDER_STATES.COMPLETED, ORDER_STATES.CANCELLED],
  [ORDER_STATES.COMPLETED]: [],
  [ORDER_STATES.CANCELLED]: []
};

/**
 * Validates state transition safety
 */
export function canTransitionOrder(currentState, nextState) {
  const allowed = ALLOWED_TRANSITIONS[currentState] || [];
  return allowed.includes(nextState);
}

/**
 * Bounded Dynamic/Surge Pricing Calculation (Pillar 4)
 * Hard-capped at 1.5x surge multiplier to preserve brand trust
 */
export function calculateDynamicPrice(basePrice, demandFactor = 1.0, distanceKm = 0) {
  if (basePrice <= 0) return 0;

  // Cap surge multiplier between 1.0x and 1.5x max
  const boundedSurge = Math.min(1.5, Math.max(1.0, demandFactor));
  
  // Distance travel surcharge: 3 ILS per km beyond 5km base
  const travelSurcharge = distanceKm > 5 ? Math.round((distanceKm - 5) * 3) : 0;
  
  const subtotal = Math.round(basePrice * boundedSurge) + travelSurcharge;
  const platformCommission = Math.round(subtotal * 0.15); // Single source 15% commission rule
  const providerEarnings = subtotal - platformCommission;

  return {
    basePrice,
    surgeMultiplier: Number(boundedSurge.toFixed(2)),
    travelSurcharge,
    totalPrice: subtotal,
    platformCommission,
    providerEarnings,
    isSurgeApplied: boundedSurge > 1.0
  };
}
