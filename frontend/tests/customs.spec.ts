import { test, expect } from '@playwright/test';

test('Customs Reviewer Login & Dashboard Check', async ({ page }) => {
    // 1. Go to Login Page
    await page.goto('http://localhost:3000/login');

    // 2. Fill Credentials
    await page.fill('input[type="email"]', 'reviewer@customs.gov.gr');
    await page.fill('input[type="password"]', 'password123');

    // 3. Click Login
    await page.click('button[type="submit"]');

    // 4. Verify Redirection
    await expect(page).toHaveURL(/.*(dashboard|customs).*/);

    // 5. Check for Dashboard Content
    // Based on CustomsDashboard.tsx, the title is "National Oversight Center"
    const heading = page.locator('h1', { hasText: 'National Oversight Center' });
    await expect(heading).toBeVisible();

    // 6. Check for Risk Map element
    const riskMap = page.locator('text=Live Risk Map');
    await expect(riskMap).toBeVisible();

    // 7. Capture Proof
    await page.screenshot({ path: 'customs-success-proof.png', fullPage: true });
});
