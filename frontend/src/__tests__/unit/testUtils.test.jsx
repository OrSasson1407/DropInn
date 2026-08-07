// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { 
  setupFirebaseEmulators, 
  createMockAuthContextValue, 
  FirebaseEmulatorProvider, 
  renderWithProviders, 
  TEST_MOCK_USER, 
  TEST_MOCK_ADMIN, 
  TEST_MOCK_PROVIDER,
  screen
} from '../test-utils';
import { useAuth } from '../../shared/context/AuthContext';

describe('test-utils helper suite', () => {
  it('exports default mock user fixtures', () => {
    expect(TEST_MOCK_USER.email).toBe('customer@dropinn.com');
    expect(TEST_MOCK_ADMIN.email).toBe('orsasson140701@gmail.com');
    expect(TEST_MOCK_PROVIDER.email).toBe('barber_pro@dropinn.com');
  });

  it('creates mock auth context value with defaults and overrides', () => {
    const defaultAuth = createMockAuthContextValue();
    expect(defaultAuth.currentUser.email).toBe('customer@dropinn.com');
    expect(defaultAuth.isAdmin).toBe(false);
    expect(defaultAuth.isProvider).toBe(false);

    const adminAuth = createMockAuthContextValue({ isAdmin: true, userRole: 'admin' });
    expect(adminAuth.isAdmin).toBe(true);
    expect(adminAuth.userRole).toBe('admin');
  });

  it('connects firebase emulators safely without errors', () => {
    expect(() => setupFirebaseEmulators()).not.toThrow();
  });

  it('renders components with custom renderWithProviders helper', () => {
    function TestConsumer() {
      const auth = useAuth();
      return <div>User: {auth.currentUser?.email || 'Logged Out'}</div>;
    }

    renderWithProviders(<TestConsumer />, {
      authOptions: { currentUser: { email: 'custom@example.com' } }
    });

    expect(screen.getByText('User: custom@example.com')).toBeInTheDocument();
  });
});
