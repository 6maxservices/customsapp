import { test, expect } from '@playwright/test';

test('Company Admin Login & Dashboard Check', async ({ page }) => {
    // 1. Go to Login Page
    await page.goto('http://localhost:3000/login');

    // 2. Fill Credentials
    await page.fill('input[type="email"]', 'admin@alpha.gr');
    await page.fill('input[type="password"]', 'password123');

    // 3. Click Login
    await page.click('button[type="submit"]');

    // 4. Verify Redirection (allow for dynamic company ID in URL)
    // Expect URL to contain /dashboard or /company/
    await expect(page).toHaveURL(/.*(dashboard|company).*/);

    // 5. Check for Dashboard Content
    // "Company Compliance Overview" is the H1 on CompanyDashboard.tsx
    // Actual text is Greek: "Πίνακας Ελέγχου Εταιρείας"
    const heading = page.locator('h1', { hasText: 'Πίνακας Ελέγχου Εταιρείας' });
    await expect(heading).toBeVisible();

    // 6. Navigate to Review Queue
    // Since we don't know the exact company ID easily without scraping,
    // we'll try to find the Review Queue link/button if it exists on the dashboard
    // or construct the URL if we can get the ID from local storage/URL.
    // For now, let's just assert the dashboard loaded successfully.
    console.log('Login successful, Dashboard loaded.');

    // 7. Capture Proof
    await page.screenshot({ path: 'auth-success-proof.png', fullPage: true });
});
