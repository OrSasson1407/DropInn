import { describe, it, expect } from 'vitest';

/**
 * Provider Teams & CRM Logic (Pillar 4 Unit Tests)
 */

export function calculateTeamPayoutSplit(totalPrice, platformCommissionRate = 0.15, leadShareRate = 0.70) {
  if (totalPrice <= 0) return { platformCommission: 0, leadPayout: 0, assistantPayout: 0 };
  const platformCommission = Math.round(totalPrice * platformCommissionRate);
  const netEarnings = totalPrice - platformCommission;
  const leadPayout = Math.round(netEarnings * leadShareRate);
  const assistantPayout = netEarnings - leadPayout;

  return {
    totalPrice,
    platformCommission,
    netEarnings,
    leadPayout,
    assistantPayout
  };
}

export function formatClientCRMNote(clientName, noteText, authorName) {
  if (!clientName || !noteText) throw new Error('Client name and note text are required');
  return {
    clientName,
    noteText: noteText.trim(),
    authorName: authorName || 'Lead Provider',
    timestamp: '2026-08-07'
  };
}

export function optimizeMultiStopRoute(stops) {
  if (!Array.isArray(stops) || stops.length === 0) return [];
  // Sort stops by scheduled priority / distance score
  return [...stops].sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
}

describe('Provider Teams & Client CRM (Unit Tests)', () => {
  describe('calculateTeamPayoutSplit()', () => {
    it('splits payout correctly between lead provider (70%) and assistant (30%)', () => {
      const split = calculateTeamPayoutSplit(200, 0.15, 0.70);
      expect(split.totalPrice).toBe(200);
      expect(split.platformCommission).toBe(30); // 15% of 200
      expect(split.netEarnings).toBe(170);
      expect(split.leadPayout).toBe(119); // 70% of 170
      expect(split.assistantPayout).toBe(51); // 30% of 170
    });

    it('returns zero payouts for zero or negative job price', () => {
      const split = calculateTeamPayoutSplit(0);
      expect(split.leadPayout).toBe(0);
      expect(split.assistantPayout).toBe(0);
    });
  });

  describe('formatClientCRMNote()', () => {
    it('creates structured client CRM note entry', () => {
      const note = formatClientCRMNote('Rachel Levi', 'Prefers organic beard oil and quiet environment', 'Eli Barber');
      expect(note.clientName).toBe('Rachel Levi');
      expect(note.noteText).toBe('Prefers organic beard oil and quiet environment');
      expect(note.authorName).toBe('Eli Barber');
    });

    it('throws error if client name or note text is missing', () => {
      expect(() => formatClientCRMNote('', 'Test note')).toThrow();
      expect(() => formatClientCRMNote('Rachel', '')).toThrow();
    });
  });

  describe('optimizeMultiStopRoute()', () => {
    it('orders multi-stop bookings sequentially by scheduled time', () => {
      const stops = [
        { id: 'stop_3', scheduledTime: '15:00', address: 'Rothschild 10' },
        { id: 'stop_1', scheduledTime: '09:00', address: 'King George 5' },
        { id: 'stop_2', scheduledTime: '11:30', address: 'Dizengoff 88' }
      ];

      const optimized = optimizeMultiStopRoute(stops);
      expect(optimized[0].id).toBe('stop_1');
      expect(optimized[1].id).toBe('stop_2');
      expect(optimized[2].id).toBe('stop_3');
    });

    it('returns empty array if stops is empty', () => {
      expect(optimizeMultiStopRoute([])).toEqual([]);
    });
  });
});
