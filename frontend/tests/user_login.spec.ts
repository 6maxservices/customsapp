import { test, expect } from '@playwright/test';

test('Station Operator Login via Quick Button', async ({ page }) => {
    // 1. Go to Login Page
    await page.goto('http://localhost:3000/login');

    // 2. Click "Station Operator" Quick Fill Button
    // Assuming the button contains text "Station Operator" or similar
    await page.click('text=Station Operator');

    // 3. Click Login Button
    await page.click('button[type="submit"]');

    // 4. Verify Redirection
    // Station Dashboard is at /dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // 5. Verify Dashboard Content
    // Look for text relevant to Station Dashboard
    // E.g. "Station Overview" or Greek equivalent
    await expect(page.locator('h1')).toBeVisible();

    // 6. Capture Proof
    await page.screenshot({ path: 'station-operator-success.png', fullPage: true });
});
