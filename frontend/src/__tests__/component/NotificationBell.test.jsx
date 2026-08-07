// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotificationBell from '../../shared/components/NotificationBell';
import * as AuthContextModule from '../../shared/context/AuthContext';

vi.mock('../../firebase', () => ({
  db: {},
  auth: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn((q, onNext) => {
    onNext({
      docs: [
        {
          id: 'n1',
          data: () => ({
            recipientId: 'u1',
            title: 'New Booking',
            body: 'You have a new order',
            type: 'NEW_ORDER',
            read: false,
            createdAt: { toMillis: () => 1000 }
          })
        },
        {
          id: 'n2',
          data: () => ({
            recipientId: 'u1',
            title: 'Service Completed',
            body: 'Your service is complete',
            type: 'ORDER_COMPLETED',
            read: true,
            createdAt: { toMillis: () => 500 }
          })
        }
      ]
    });
    return vi.fn();
  }),
  doc: vi.fn(),
  updateDoc: vi.fn().mockResolvedValue()
}));

describe('NotificationBell Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when currentUser is null', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: null,
      isAdmin: false
    });

    const { container } = render(<NotificationBell />);
    expect(container.firstChild).toBeNull();
  });

  it('renders notification icon and unread count badge when user is logged in', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: { uid: 'u1' },
      isAdmin: false
    });

    render(<NotificationBell />);
    expect(screen.getByTitle('Notifications')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // 1 unread notification
  });

  it('opens notification panel on button click and displays items', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: { uid: 'u1' },
      isAdmin: false
    });

    render(<NotificationBell />);
    const bellBtn = screen.getByTitle('Notifications');
    fireEvent.click(bellBtn);

    expect(screen.getByText('New Booking')).toBeInTheDocument();
    expect(screen.getByText('You have a new order')).toBeInTheDocument();
    expect(screen.getByText('Service Completed')).toBeInTheDocument();
  });

  it('closes notification dropdown when close button is clicked', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: { uid: 'u1' },
      isAdmin: false
    });

    render(<NotificationBell />);
    fireEvent.click(screen.getByTitle('Notifications'));
    expect(screen.getByText('Notifications')).toBeInTheDocument();

    const closeBtns = screen.getAllByRole('button');
    const closeBtn = closeBtns[closeBtns.length - 1]; // X button
    fireEvent.click(closeBtn);

    expect(screen.queryByText('New Booking')).not.toBeInTheDocument();
  });
});
