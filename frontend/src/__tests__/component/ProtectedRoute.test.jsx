import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../shared/components/ProtectedRoute';
import * as AuthContextModule from '../../shared/context/AuthContext';

vi.mock('../../shared/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

const renderWithRouter = (ui, initialRoute = '/protected') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/protected" element={ui} />
        <Route path="/customer/login" element={<div>Login Page</div>} />
        <Route path="/provider/login" element={<div>Provider Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute Component', () => {
  it('renders loading spin indicator when auth state is loading', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: null,
      loading: true
    });

    renderWithRouter(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
    expect(screen.getByText('Verifying session...')).toBeInTheDocument();
  });

  it('redirects unauthenticated user to customer login', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: null,
      loading: false
    });

    renderWithRouter(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children when authenticated user accesses general protected route', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: { uid: 'u1' },
      userRole: 'customer',
      isAdmin: false,
      loading: false
    });

    renderWithRouter(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders restricted access box when non-admin accesses admin-required route', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: { uid: 'u1' },
      userRole: 'customer',
      isAdmin: false,
      loading: false
    });

    renderWithRouter(<ProtectedRoute requiredRole="admin"><div>Admin Dashboard</div></ProtectedRoute>);
    expect(screen.getByText('Admin Access Restricted')).toBeInTheDocument();
  });

  it('renders admin content when admin user accesses admin-required route', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: { uid: 'admin_1' },
      userRole: 'admin',
      isAdmin: true,
      loading: false
    });

    renderWithRouter(<ProtectedRoute requiredRole="admin"><div>Admin Dashboard</div></ProtectedRoute>);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('redirects customer user attempting to access provider route to provider login', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: { uid: 'u1' },
      userRole: 'customer',
      isAdmin: false,
      loading: false
    });

    renderWithRouter(<ProtectedRoute requiredRole="provider"><div>Provider Dashboard</div></ProtectedRoute>);
    expect(screen.getByText('Provider Login Page')).toBeInTheDocument();
  });
});
