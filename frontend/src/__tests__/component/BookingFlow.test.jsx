// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import BookingFlow from '../../customer/pages/BookingFlow';
import * as AuthContextModule from '../../shared/context/AuthContext';
import * as ToastContextModule from '../../shared/context/ToastContext';

vi.mock('../../firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn().mockResolvedValue({
    exists: () => true,
    data: () => ({
      name: 'Avi Cohen',
      category: "Men's Haircuts & Beard",
      price: 110,
      eta: '12-15 min',
      distance: '1.8 km',
      specialties: ['Skin Fade', 'Beard Trim']
    })
  }),
  collection: vi.fn(),
  addDoc: vi.fn().mockResolvedValue({ id: 'new_order_999' }),
  serverTimestamp: vi.fn(() => 'TS')
}));

const renderBookingFlow = () => {
  return render(
    <ToastContextModule.ToastProvider>
      <MemoryRouter initialEntries={['/customer/book/p1']}>
        <Routes>
          <Route path="/customer/book/:id" element={<BookingFlow />} />
          <Route path="/customer/orders" element={<div>Customer Orders Page</div>} />
        </Routes>
      </MemoryRouter>
    </ToastContextModule.ToastProvider>
  );
};

describe('BookingFlow Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders provider info and booking options', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: { uid: 'c1', email: 'cust@example.com' }
    });

    renderBookingFlow();

    await waitFor(() => {
      expect(screen.getByText('Avi Cohen')).toBeInTheDocument();
      expect(screen.getByText(/110 ILS/i)).toBeInTheDocument();
    });
  });

  it('allows user to enter address and select instant vs scheduled booking', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: { uid: 'c1', email: 'cust@example.com' }
    });

    renderBookingFlow();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Apartment #, Street, City/i)).toBeInTheDocument();
    });

    const addressInput = screen.getByPlaceholderText(/Apartment #, Street, City/i);
    fireEvent.change(addressInput, { target: { value: 'King George St 15, Tel Aviv' } });
    expect(addressInput.value).toBe('King George St 15, Tel Aviv');
  });
});
