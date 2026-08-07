import { describe, it, expect } from 'vitest';

/**
 * Chat & WhatsApp Messaging Logic (Pillar 3 Unit Tests)
 */

export function canAccessChat(userId, userRole, order) {
  if (!order || !userId) return false;
  if (userRole === 'admin') return true;
  const status = String(order.status || '').toLowerCase();
  if (status === 'completed' || status === 'cancelled') return false; // Closed post-completion
  return order.customerId === userId || order.providerId === userId;
}

export function formatWhatsAppMessage(eventType, data) {
  switch (eventType) {
    case 'ORDER_CONFIRMED':
      return `[DropIn] Order #${data.orderId} confirmed! Provider ${data.providerName} will arrive at ${data.scheduledTime}.`;
    case 'PROVIDER_EN_ROUTE':
      return `[DropIn] Provider ${data.providerName} is en route to ${data.address}! ETA ~${data.etaMinutes} mins.`;
    case 'REMINDER_15MIN':
      return `[DropIn] Reminder: Your grooming service #${data.orderId} starts in 15 minutes!`;
    default:
      return `[DropIn] Update regarding order #${data.orderId || ''}`;
  }
}

export function validateChatMessage(text) {
  if (!text || typeof text !== 'string') return { valid: false, reason: 'Empty text' };
  const trimmed = text.trim();
  if (trimmed.length === 0) return { valid: false, reason: 'Whitespace only' };
  if (trimmed.length > 500) return { valid: false, reason: 'Message exceeds 500 character limit' };
  return { valid: true, text: trimmed };
}

describe('Order Chat & WhatsApp Messaging System (Unit Tests)', () => {
  const mockOrder = {
    id: 'ord_100',
    customerId: 'cust_1',
    providerId: 'prov_1',
    status: 'in_progress'
  };

  describe('canAccessChat() Security Policy', () => {
    it('allows customer assigned to the order to chat', () => {
      expect(canAccessChat('cust_1', 'customer', mockOrder)).toBe(true);
    });

    it('allows provider assigned to the order to chat', () => {
      expect(canAccessChat('prov_1', 'provider', mockOrder)).toBe(true);
    });

    it('allows admin to access order chat', () => {
      expect(canAccessChat('admin_99', 'admin', mockOrder)).toBe(true);
    });

    it('denies unrelated user access to chat', () => {
      expect(canAccessChat('cust_stranger', 'customer', mockOrder)).toBe(false);
    });

    it('closes chat when order is completed', () => {
      const completedOrder = { ...mockOrder, status: 'completed' };
      expect(canAccessChat('cust_1', 'customer', completedOrder)).toBe(false);
    });

    it('closes chat when order is cancelled', () => {
      const cancelledOrder = { ...mockOrder, status: 'cancelled' };
      expect(canAccessChat('prov_1', 'provider', cancelledOrder)).toBe(false);
    });

    it('denies access if order is null or undefined', () => {
      expect(canAccessChat('cust_1', 'customer', null)).toBe(false);
    });
  });

  describe('formatWhatsAppMessage()', () => {
    it('formats ORDER_CONFIRMED notification correctly', () => {
      const msg = formatWhatsAppMessage('ORDER_CONFIRMED', {
        orderId: '101',
        providerName: 'Dan B.',
        scheduledTime: '14:00'
      });
      expect(msg).toContain('Order #101 confirmed!');
      expect(msg).toContain('Provider Dan B.');
      expect(msg).toContain('14:00');
    });

    it('formats PROVIDER_EN_ROUTE notification correctly', () => {
      const msg = formatWhatsAppMessage('PROVIDER_EN_ROUTE', {
        orderId: '102',
        providerName: 'Maya K.',
        address: 'Rothschild 45',
        etaMinutes: 12
      });
      expect(msg).toContain('Maya K. is en route');
      expect(msg).toContain('ETA ~12 mins');
    });

    it('formats REMINDER_15MIN notification correctly', () => {
      const msg = formatWhatsAppMessage('REMINDER_15MIN', { orderId: '103' });
      expect(msg).toContain('starts in 15 minutes');
    });
  });

  describe('validateChatMessage()', () => {
    it('accepts valid concise chat messages', () => {
      const res = validateChatMessage('I am waiting near the front gate');
      expect(res.valid).toBe(true);
      expect(res.text).toBe('I am waiting near the front gate');
    });

    it('rejects empty or null messages', () => {
      expect(validateChatMessage('').valid).toBe(false);
      expect(validateChatMessage(null).valid).toBe(false);
    });

    it('rejects messages longer than 500 characters', () => {
      const longMsg = 'a'.repeat(501);
      expect(validateChatMessage(longMsg).valid).toBe(false);
    });
  });
});
