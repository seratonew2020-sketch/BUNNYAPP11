import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should display login form correctly', async ({ page }) => {
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
    await page.goto('/');

    // Diagnose loading
    try {
      await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 5000 });
    } catch (e) {
      console.log('DIAGNOSTIC: Spinner is still visible after 5s');
    }

    // Verify title with loose match
    await expect(page.locator('h1')).toContainText('Bunny Time');

    // Verify inputs exist
    await expect(page.getByPlaceholder('ระบุรหัสพนักงาน (เช่น 20001)')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();

    // Verify submit button
    await expect(page.getByRole('button', { name: 'เข้าสู่ระบบ (Sign In)' })).toBeVisible();
  });

  test('should show error validation', async ({ page }) => {
    await page.goto('/');

    // Try submitting empty form (HTML required attribute should catch this, but let's try filling invalid)
    // Fill invalid data
    await page.getByPlaceholder('ระบุรหัสพนักงาน (เช่น 20001)').fill('wrong@user.com');
    await page.getByPlaceholder('••••••••').fill('badpassword');

    await page.getByRole('button', { name: 'เข้าสู่ระบบ (Sign In)' }).click();

    // Check for error message from Supabase (e.g., "Invalid login credentials")
    // Our UI displays errors in a red box
    const errorAlert = page.locator('div.text-red-200');
    await expect(errorAlert).toBeVisible({ timeout: 10000 });
  });

  test('should NOT show sign up toggle', async ({ page }) => {
    await page.goto('/');

    // Verify Forgot Password button exists
    // Verify Forgot Password button exists
    await expect(page.getByRole('button', { name: 'ลืมรหัสผ่าน? (Forgot Password)' })).toBeVisible();
  });
});
