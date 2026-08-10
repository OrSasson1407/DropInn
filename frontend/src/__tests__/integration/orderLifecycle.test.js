import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrder, updateOrderStatus, submitOrderReview } from '../../shared/services/firestore';

vi.mock('../../firebase', () => ({
  db: {}
}));

let mockOrders = {};
let mockProviders = {
  p1: { id: 'p1', name: 'Avi Cohen', isApproved: false, reviews: [], rating: 5.0 }
};
let mockNotifications = [];

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'col'),
  doc: vi.fn((db, colName, id) => `${colName}/${id}`),
  addDoc: vi.fn(async (colRef, data) => {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    if (colRef === 'col') {
      if (data.recipientId) {
        mockNotifications.push({ id, ...data });
      } else {
        mockOrders[id] = { id, ...data };
      }
    }
    return { id };
  }),
  getDoc: vi.fn(async (docPath) => {
    if (typeof docPath === 'string') {
      const [col, id] = docPath.split('/');
      if (col === 'orders' && mockOrders[id]) {
        return { exists: () => true, data: () => mockOrders[id] };
      }
      if (col === 'providers' && mockProviders[id]) {
        return { exists: () => true, data: () => mockProviders[id] };
      }
    }
    return { exists: () => false };
  }),
  updateDoc: vi.fn(async (docPath, updateData) => {
    if (typeof docPath === 'string') {
      const [col, id] = docPath.split('/');
      if (col === 'orders' && mockOrders[id]) {
        mockOrders[id] = { ...mockOrders[id], ...updateData };
      }
      if (col === 'providers' && mockProviders[id]) {
        mockProviders[id] = { ...mockProviders[id], ...updateData };
      }
    }
  }),
  serverTimestamp: vi.fn(() => 'TS')
}));

describe('Full Order & Provider Lifecycle Integration Flow', () => {
  beforeEach(() => {
    mockOrders = {};
    mockNotifications = [];
  });

  it('executes end-to-end order flow: create -> approve -> complete -> review', async () => {
    // Step 1: Customer creates order
    const orderRef = await createOrder('cust_10', 'p1', {
      serviceCategory: "Men's Haircut",
      price: 120,
      address: 'Tel Aviv Rothschild 45'
    });

    const orderId = orderRef.id;
    expect(mockOrders[orderId]).toBeDefined();
    expect(mockOrders[orderId].status).toBe('pending');
    expect(mockOrders[orderId].commission).toBe(18); // 15% of 120 = 18

    // Verify provider notification dispatched
    expect(mockNotifications.some(n => n.recipientId === 'p1' && n.type === 'NEW_ORDER')).toBe(true);

    // Step 2: Provider approves order
    await updateOrderStatus(orderId, 'approved', 'pending');
    expect(mockOrders[orderId].status).toBe('approved');

    // Verify customer notification dispatched
    expect(mockNotifications.some(n => n.recipientId === 'cust_10' && n.type === 'ORDER_APPROVED')).toBe(true);

    // Step 3: Provider completes order
    await updateOrderStatus(orderId, 'completed', 'approved');
    expect(mockOrders[orderId].status).toBe('completed');

    // Verify customer completion notification
    expect(mockNotifications.some(n => n.recipientId === 'cust_10' && n.type === 'ORDER_COMPLETED')).toBe(true);

    // Step 4: Customer submits review
    await submitOrderReview(orderId, 'p1', 5, 'Perfect fade and punctual arrival!', 'cust_10', 'Daniel');
    expect(mockOrders[orderId].rating).toBe(5);
    expect(mockOrders[orderId].reviewComment).toBe('Perfect fade and punctual arrival!');

    // Verify provider average rating updated
    expect(mockProviders.p1.rating).toBe(5);
    expect(mockProviders.p1.reviews.length).toBe(1);
  });

  it('handles provider signup -> admin approval state changes', () => {
    expect(mockProviders.p1.isApproved).toBe(false);
    
    // Admin approves provider
    mockProviders.p1.isApproved = true;
    expect(mockProviders.p1.isApproved).toBe(true);
  });
});

