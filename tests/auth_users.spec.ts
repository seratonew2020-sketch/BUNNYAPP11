import { test, expect } from '@playwright/test';

const TEST_USERS = [
  '20001',
  '20040',
  '91003'
];
const PASSWORD = '123456';

test.describe('Bulk User Login Verification', () => {

  for (const userId of TEST_USERS) {
    test(`should successfully login user ${userId}`, async ({ page }) => {
      await page.goto('/');

      // Wait for login form
      await expect(page.getByRole('heading', { name: 'Bunny Time' })).toBeVisible();

      // Fill credentials
      await page.getByPlaceholder('ระบุรหัสพนักงาน (เช่น 20001)').fill(userId);
      await page.getByPlaceholder('••••••••').fill(PASSWORD);
      await page.getByRole('button', { name: 'เข้าสู่ระบบ (Sign In)' }).click();

      // Assert successful login by checking for main app elements
      // e.g., Navigation bar or Header
      await expect(page.locator('nav')).toBeVisible({ timeout: 15000 });

      // Optionally logout to clean up state for next test if sharing context (but Playwright isolates usually)
    });
  }

  test('should fail with incorrect password', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('ระบุรหัสพนักงาน (เช่น 20001)').fill('20001');
    await page.getByPlaceholder('••••••••').fill('wrongpass');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ (Sign In)' }).click();

    await expect(page.getByText('รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง')).toBeVisible();
  });

});
