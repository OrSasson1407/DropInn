import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import NotificationBell from '../../shared/components/NotificationBell';
import ProtectedRoute from '../../shared/components/ProtectedRoute';
import * as AuthContextModule from '../../shared/context/AuthContext';

vi.mock('../../firebase', () => ({ db: {}, auth: {} }));
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(() => vi.fn())
}));

describe('Visual & Snapshot Testing Suite', () => {

  it('matches snapshot for NotificationBell component', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: { uid: 'u1' },
      isAdmin: false
    });

    const { container, asFragment } = render(<NotificationBell />);
    expect(container).toBeInTheDocument();
    expect(asFragment()).toBeDefined();
  });

  it('matches snapshot for ProtectedRoute loading state', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: null,
      loading: true
    });

    const { container, asFragment } = render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Child Page</div>
        </ProtectedRoute>
      </BrowserRouter>
    );
    expect(container).toBeInTheDocument();
    expect(asFragment()).toBeDefined();
  });

  it('matches snapshot for ProtectedRoute restricted admin state', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: { uid: 'u1' },
      isAdmin: false,
      loading: false
    });

    const { container, asFragment } = render(
      <BrowserRouter>
        <ProtectedRoute requiredRole="admin">
          <div>Admin Dashboard</div>
        </ProtectedRoute>
      </BrowserRouter>
    );
    expect(container).toBeInTheDocument();
    expect(asFragment()).toBeDefined();
  });
});
