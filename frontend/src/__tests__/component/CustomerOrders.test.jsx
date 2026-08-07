import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CustomerOrders from '../../customer/pages/CustomerOrders';
import * as AuthContextModule from '../../shared/context/AuthContext';
import * as ToastContextModule from '../../shared/context/ToastContext';

vi.mock('../../firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn((q, onNext) => {
    onNext({
      docs: [
        {
          id: 'ord_100',
          data: () => ({
            customerId: 'c1',
            providerId: 'p1',
            serviceCategory: "Men's Haircuts",
            status: 'pending',
            price: 110,
            address: 'Dizengoff 50, Tel Aviv',
            createdAt: { toMillis: () => 1000 }
          })
        },
        {
          id: 'ord_200',
          data: () => ({
            customerId: 'c1',
            providerId: 'p2',
            serviceCategory: 'Manicure & Pedicure',
            status: 'completed',
            price: 140,
            address: 'Herzl 10, Ramat Gan',
            createdAt: { toMillis: () => 500 }
          })
        }
      ]
    });
    return vi.fn();
  }),
  doc: vi.fn(),
  getDoc: vi.fn().mockResolvedValue({
    exists: () => true,
    data: () => ({ name: 'Pro Specialist' })
  }),
  updateDoc: vi.fn().mockResolvedValue()
}));

const renderWithProviders = (ui) => {
  return render(
    <ToastContextModule.ToastProvider>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </ToastContextModule.ToastProvider>
  );
};

describe('CustomerOrders Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders prompt to sign in when currentUser is null', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: null
    });

    renderWithProviders(<CustomerOrders />);
    expect(screen.getByText('Track Your Service Orders')).toBeInTheDocument();
    expect(screen.getByText('Sign In to Customer Account')).toBeInTheDocument();
  });

  it('renders customer orders list when logged in', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: { uid: 'c1' }
    });

    renderWithProviders(<CustomerOrders />);

    await waitFor(() => {
      expect(screen.getByText('My Orders & Dispatch Tracker')).toBeInTheDocument();
      expect(screen.getByText('ORDER #ord_100')).toBeInTheDocument();
      expect(screen.getByText('ORDER #ord_200')).toBeInTheDocument();
    });
  });

  it('renders review form for completed orders that have not yet been rated', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: { uid: 'c1' }
    });

    renderWithProviders(<CustomerOrders />);

    await waitFor(() => {
      expect(screen.getByText('Rate Your Experience')).toBeInTheDocument();
      expect(screen.getByText('Publish Review')).toBeInTheDocument();
    });
  });

  it('renders cancel booking request button for pending orders', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: { uid: 'c1' }
    });

    renderWithProviders(<CustomerOrders />);

    await waitFor(() => {
      expect(screen.getByText('Cancel Booking Request')).toBeInTheDocument();
    });
  });
});
