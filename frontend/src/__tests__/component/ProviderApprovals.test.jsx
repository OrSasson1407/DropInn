import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProviderApprovals from '../../admin/pages/ProviderApprovals';

vi.mock('../../firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({
    docs: [
      {
        id: 'p1',
        data: () => ({
          name: 'Pending Barber',
          category: "Men's Haircuts",
          price: 120,
          isApproved: false,
          idDocumentSubmitted: true,
          idDocumentUrl: 'data:image/png;base64,mock'
        })
      },
      {
        id: 'p2',
        data: () => ({
          name: 'Active Stylist',
          category: "Women's Hair",
          price: 180,
          isApproved: true,
          idDocumentSubmitted: false
        })
      }
    ]
  }),
  doc: vi.fn(),
  updateDoc: vi.fn().mockResolvedValue()
}));

describe('ProviderApprovals Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders provider approvals title and applicants count', async () => {
    render(<ProviderApprovals />);

    await waitFor(() => {
      expect(screen.getByText('Barber Partner Applications')).toBeInTheDocument();
      expect(screen.getByText('2 Applicants')).toBeInTheDocument();
    });
  });

  it('displays pending provider card details and active provider card', async () => {
    render(<ProviderApprovals />);

    await waitFor(() => {
      expect(screen.getByText('Pending Barber')).toBeInTheDocument();
      expect(screen.getByText('Pending Verification')).toBeInTheDocument();
      expect(screen.getByText('Active Stylist')).toBeInTheDocument();
      expect(screen.getByText('Approved & Active')).toBeInTheDocument();
      expect(screen.getByText('View ID Document')).toBeInTheDocument();
    });
  });

  it('opens ID document preview modal on View ID Document click', async () => {
    render(<ProviderApprovals />);

    await waitFor(() => {
      expect(screen.getByText('View ID Document')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View ID Document'));

    expect(screen.getByText('Govt ID & License Verification Document')).toBeInTheDocument();
    expect(screen.getByAltText('Submitted ID Proof')).toBeInTheDocument();
  });

  it('switches to Transaction Monitor tab', async () => {
    render(<ProviderApprovals />);

    await waitFor(() => {
      expect(screen.getByText('Transaction Monitor')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Transaction Monitor'));

    await waitFor(() => {
      expect(screen.getByText('Transaction Monitor')).toBeInTheDocument();
    });
  });
});
