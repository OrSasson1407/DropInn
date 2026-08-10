// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Home, { SERVICE_CATEGORIES } from '../../customer/pages/Home';

// Mock Firebase
vi.mock('../../firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn((q, onNext) => {
    // Return mock un-subscribe function
    onNext({ docs: [] }); // Simulate empty Firestore list to force fallback to DEMO_PROVIDERS
    return vi.fn();
  })
}));

const renderHome = () => {
  return render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  );
};

describe('Home Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hero title and search input field', () => {
    renderHome();
    expect(screen.getByText(/Delivered To Your Home/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search haircuts, manicures/i)).toBeInTheDocument();
  });

  it('renders category filter buttons from SERVICE_CATEGORIES', () => {
    renderHome();
    SERVICE_CATEGORIES.forEach(cat => {
      expect(screen.getByText(cat.label)).toBeInTheDocument();
    });
  });

  it('renders DEMO_PROVIDERS when Firestore returns no live documents', async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText('Avi Cohen (Master Barber)')).toBeInTheDocument();
      expect(screen.getByText('Maya Lin (Nail Artist & Esthetician)')).toBeInTheDocument();
    });
  });

  it('filters providers when user types in search query', async () => {
    renderHome();
    const searchInput = screen.getByPlaceholderText(/Search haircuts, manicures/i);

    fireEvent.change(searchInput, { target: { value: 'Avi Cohen' } });

    await waitFor(() => {
      expect(screen.getByText('Avi Cohen (Master Barber)')).toBeInTheDocument();
      expect(screen.queryByText('Maya Lin (Nail Artist & Esthetician)')).not.toBeInTheDocument();
    });
  });

  it('filters providers when user selects category button', async () => {
    renderHome();
    
    // Click on Manicure & Pedicure category
    const categoryButton = screen.getAllByText("Manicure & Pedicure")[0];
    fireEvent.click(categoryButton);

    await waitFor(() => {
      expect(screen.getByText('Maya Lin (Nail Artist & Esthetician)')).toBeInTheDocument();
      expect(screen.queryByText('Avi Cohen (Master Barber)')).not.toBeInTheDocument();
    });
  });

  it('toggles booking mode filters (All Pros, Available Now, Schedule for Later)', () => {
    renderHome();
    const instantBtn = screen.getByText('Available Now (Instant Delivery)');
    const scheduledBtn = screen.getByText('Schedule for Later');
    const allBtn = screen.getByText('All Pros');

    fireEvent.click(instantBtn);
    expect(instantBtn.parentElement).toHaveClass('bg-amber-500', { exact: false });

    fireEvent.click(scheduledBtn);
    expect(scheduledBtn.parentElement).toHaveClass('bg-amber-500', { exact: false });

    fireEvent.click(allBtn);
    expect(allBtn).toHaveClass('bg-amber-500');
  });

  it('displays empty state when no providers match query', async () => {
    renderHome();
    const searchInput = screen.getByPlaceholderText(/Search haircuts, manicures/i);

    fireEvent.change(searchInput, { target: { value: 'NON_EXISTENT_BARBER_SEARCH_12345' } });

    await waitFor(() => {
      expect(screen.getByText('No Pros Found in this Category')).toBeInTheDocument();
    });

    // Reset filters button
    const resetBtn = screen.getByText('Reset Filters');
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(screen.getByText('Avi Cohen (Master Barber)')).toBeInTheDocument();
    });
  });
});

