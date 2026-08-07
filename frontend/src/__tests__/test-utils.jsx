import React from 'react';
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { render } from '@testing-library/react';

expect.extend(matchers);
import { MemoryRouter } from 'react-router-dom';
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { ToastProvider } from '../shared/context/ToastContext';
import { ThemeProvider } from '../shared/context/ThemeContext';
import { AuthContext } from '../shared/context/AuthContext';

/**
 * Firebase Emulator Setup Helpers
 */
let emulatorsConnected = false;

export function setupFirebaseEmulators(config = {}) {
  const { 
    authPort = 9099, 
    firestorePort = 8080, 
    host = '127.0.0.1',
    disableWarnings = true 
  } = config;

  if (!emulatorsConnected) {
    try {
      connectAuthEmulator(auth, `http://${host}:${authPort}`, { disableWarnings });
      connectFirestoreEmulator(db, host, firestorePort);
      emulatorsConnected = true;
      console.log(`[Firebase Emulators] Connected Auth (${host}:${authPort}) & Firestore (${host}:${firestorePort})`);
    } catch (err) {
      console.warn('[Firebase Emulators] Connection skipped or already initialized:', err.message);
    }
  }
}

/**
 * Common Mock Data Fixtures
 */
export const TEST_MOCK_USER = {
  uid: 'test_user_cust_1',
  email: 'customer@dropinn.com',
  displayName: 'Test Customer'
};

export const TEST_MOCK_ADMIN = {
  uid: 'test_admin_1',
  email: 'orsasson140701@gmail.com',
  displayName: 'Admin User'
};

export const TEST_MOCK_PROVIDER = {
  uid: 'test_prov_1',
  email: 'barber_pro@dropinn.com',
  displayName: 'Pro Groomer'
};

export function createMockAuthContextValue(overrides = {}) {
  const defaultUser = TEST_MOCK_USER;
  const userRole = overrides.userRole || (overrides.isAdmin ? 'admin' : (overrides.isProvider ? 'provider' : 'customer'));
  const isAdmin = overrides.isAdmin !== undefined ? overrides.isAdmin : userRole === 'admin';
  const isProvider = overrides.isProvider !== undefined ? overrides.isProvider : (userRole === 'provider' || isAdmin);

  return {
    currentUser: overrides.currentUser !== undefined ? overrides.currentUser : defaultUser,
    userProfile: overrides.userProfile !== undefined ? overrides.userProfile : {
      uid: defaultUser.uid,
      email: defaultUser.email,
      displayName: defaultUser.displayName,
      role: userRole
    },
    userRole,
    isAdmin,
    isProvider,
    loading: overrides.loading !== undefined ? overrides.loading : false,
    updateUserRole: overrides.updateUserRole || (async () => {}),
    ...overrides
  };
}

/**
 * Mock Firebase & Context Provider Wrapper
 */
export function FirebaseEmulatorProvider({ children, authValue = {}, initialEntries = ['/'] }) {
  const mockAuth = createMockAuthContextValue(authValue);

  return (
    <MemoryRouter initialEntries={initialEntries}>
      <ThemeProvider>
        <ToastProvider>
          <AuthContext.Provider value={mockAuth}>
            {children}
          </AuthContext.Provider>
        </ToastProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

/**
 * Custom Render Function
 * Wraps components in Firebase, Router, Theme & Toast providers.
 */
export function renderWithProviders(ui, options = {}) {
  const {
    authOptions = {},
    initialEntries = ['/'],
    ...renderOptions
  } = options;

  function Wrapper({ children }) {
    return (
      <FirebaseEmulatorProvider authValue={authOptions} initialEntries={initialEntries}>
        {children}
      </FirebaseEmulatorProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
