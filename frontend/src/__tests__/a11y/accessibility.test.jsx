// @vitest-environment jsdom
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import Home from '../../customer/pages/Home';
import ProtectedRoute from '../../shared/components/ProtectedRoute';
import * as AuthContextModule from '../../shared/context/AuthContext';

expect.extend(toHaveNoViolations);

vi.mock('../../firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn((q, onNext) => {
    onNext({ docs: [] });
    return vi.fn();
  })
}));

describe('Accessibility (a11y) Automated Audits', () => {
  it('Home page has zero critical or serious WCAG accessibility violations', async () => {
    const { container } = render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ProtectedRoute component renders accessible loading/fallback HTML structure', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      currentUser: { uid: 'u1' },
      loading: false,
      isAdmin: false
    });

    const { container } = render(
      <BrowserRouter>
        <ProtectedRoute>
          <div role="main">Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
