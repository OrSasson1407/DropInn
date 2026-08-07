// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';

expect.extend(matchers);
import SafetyAssistSOS from '../../shared/components/SafetyAssistSOS';
import { ToastProvider } from '../../shared/context/ToastContext';

vi.mock('../../firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'u1', email: 'cust@example.com' } }
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ id: 'mock_col' })),
  addDoc: vi.fn().mockResolvedValue({ id: 'sos_123' }),
  serverTimestamp: vi.fn(() => 'TS')
}));

const renderSOS = (props) => {
  return render(
    <ToastProvider>
      <SafetyAssistSOS {...props} />
    </ToastProvider>
  );
};

describe('SafetyAssistSOS Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders trigger button', () => {
    renderSOS({ activeOrderId: 'ord_1', providerId: 'prov_1' });
    expect(screen.getByText('Safety SOS')).toBeInTheDocument();
  });

  it('opens SOS modal when button clicked', () => {
    renderSOS({ activeOrderId: 'ord_1', providerId: 'prov_1' });
    const triggerBtn = screen.getByText('Safety SOS').closest('button');
    fireEvent.click(triggerBtn);

    expect(screen.getByText('Emergency Safety Assist')).toBeInTheDocument();
    expect(screen.getByText(/Police \(100\)/i)).toBeInTheDocument();
    expect(screen.getByText(/TRIGGER EMERGENCY SOS ALERT/i)).toBeInTheDocument();
  });

  it('dispatches SOS alert doc to firestore on emergency alert trigger', async () => {
    renderSOS({ activeOrderId: 'ord_1', providerId: 'prov_1' });
    const triggerBtn = screen.getByText('Safety SOS').closest('button');
    fireEvent.click(triggerBtn);

    const sosAlertBtn = screen.getByText(/TRIGGER EMERGENCY SOS ALERT/i).closest('button');
    fireEvent.click(sosAlertBtn);

    await waitFor(() => {
      expect(screen.getByText(/SOS Incident Logged & Dispatched!/i)).toBeInTheDocument();
    });
  });
});
