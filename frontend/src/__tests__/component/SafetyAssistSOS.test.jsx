import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SafetyAssistSOS from '../../shared/components/SafetyAssistSOS';
import * as AuthContextModule from '../../shared/context/AuthContext';
import { ToastProvider } from '../../shared/context/ToastContext';

vi.mock('../../firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
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

  it('renders trigger button', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: { uid: 'u1', email: 'user@example.com' }
    });

    renderSOS({ activeOrderId: 'ord_1', providerId: 'prov_1' });
    expect(screen.getByText('Safety SOS')).toBeInTheDocument();
  });

  it('opens SOS modal when button clicked', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: { uid: 'u1', email: 'user@example.com' }
    });

    renderSOS({ activeOrderId: 'ord_1', providerId: 'prov_1' });
    fireEvent.click(screen.getByText('Safety SOS'));

    expect(screen.getByText('Emergency Safety Assist')).toBeInTheDocument();
    expect(screen.getByText(/Police \(100\)/i)).toBeInTheDocument();
    expect(screen.getByText(/TRIGGER EMERGENCY SOS ALERT/i)).toBeInTheDocument();
  });

  it('dispatches SOS alert doc to firestore on emergency alert trigger', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: { uid: 'cust_100', email: 'cust@example.com' }
    });

    renderSOS({ activeOrderId: 'ord_1', providerId: 'prov_1' });
    fireEvent.click(screen.getByText('Safety SOS'));

    const sosAlertBtn = screen.getByText(/TRIGGER EMERGENCY SOS ALERT/i);
    fireEvent.click(sosAlertBtn);

    await waitFor(() => {
      expect(screen.getByText('SOS Incident Logged & Dispatched!')).toBeInTheDocument();
    });
  });
});
