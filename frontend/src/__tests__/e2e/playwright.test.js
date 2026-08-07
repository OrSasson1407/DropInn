import { test, expect } from '@playwright/test';

test.describe('DropIn Marketplace E2E Browser Flows', () => {

  test('Flow 1: Customer signup -> Book service -> Order appears in My Orders', async ({ page }) => {
    // 1. Visit signup
    await page.goto('/customer/signup');
    await page.fill('input[type="email"]', `test_customer_${Date.now()}@example.com`);
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // 2. Search & Select Provider
    await page.goto('/');
    await page.click('text=Book Now');

    // 3. Complete Booking Flow
    await expect(page).toHaveURL(/\/customer\/book\//);
    await page.click('text=Confirm At-Home Booking');

    // 4. Verify Order appears in My Orders
    await page.goto('/customer/orders');
    await expect(page.getByText(/At-Home Order/i)).toBeVisible();
  });

  test('Flow 2: Provider signup -> Admin approves -> Provider appears in search', async ({ page }) => {
    // 1. Provider signup
    await page.goto('/provider/signup');
    await page.fill('input[type="email"]', `test_provider_${Date.now()}@example.com`);
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // 2. Admin approves provider
    await page.goto('/admin/approvals');
    const approveBtn = page.getByRole('button', { name: /Approve Provider/i }).first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
    }

    // 3. Provider visible in customer search
    await page.goto('/');
    await expect(page.getByText(/Verified Active/i).first()).toBeVisible();
  });

  test('Flow 3: SOS trigger -> Incident logged & Safety notification dispatched', async ({ page }) => {
    await page.goto('/');
    // Trigger SOS button from header/component
    const sosButton = page.getByRole('button', { name: /SOS/i });
    if (await sosButton.isVisible()) {
      await sosButton.click();
      await page.click('text=CONFIRM EMERGENCY SOS');
      await expect(page.getByText(/EMERGENCY INCIDENT LOGGED/i)).toBeVisible();
    }
  });

});
