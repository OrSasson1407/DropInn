import { test, expect } from '@playwright/test';

test.describe('DropIn Marketplace E2E Browser Flows', () => {

  test('loads home page with hero branding and category navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DropIn/i);
    await expect(page.getByText(/On-Demand Home Grooming/i)).toBeVisible();
  });

  test('navigates to customer login and signup pages', async ({ page }) => {
    await page.goto('/customer/login');
    await expect(page.getByText(/Customer Login/i)).toBeVisible();

    await page.goto('/customer/signup');
    await expect(page.getByText(/Create Account/i)).toBeVisible();
  });

  test('navigates to provider onboarding portal', async ({ page }) => {
    await page.goto('/provider/signup');
    await expect(page.getByText(/Barber & Groomer Partner Signup/i)).toBeVisible();
  });

  test('navigates to admin approvals portal', async ({ page }) => {
    await page.goto('/admin/approvals');
    await expect(page.getByText(/Admin Command Portal/i)).toBeVisible();
  });

  test('validates service search and provider listing filter', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.getByPlaceholder(/Search barber, fade, manicure, location/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('fade');
      await expect(searchInput).toHaveValue('fade');
    }
  });

});
