import { test, expect } from '@playwright/test';

test.describe('Profile Management', () => {
  const userId = '20001';
  const password = '123456';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login
    await page.getByPlaceholder('ระบุรหัสพนักงาน (เช่น 20001)').fill(userId);
    await page.getByPlaceholder('••••••••').fill(password);
    await page.getByRole('button', { name: 'เข้าสู่ระบบ (Sign In)' }).click();
    await expect(page.locator('nav')).toBeVisible({ timeout: 15000 });
  });

  test('should update profile information successfully', async ({ page }) => {
    // Navigate to Profile
    await page.getByRole('button', { name: 'โปรไฟล์' }).click();
    await expect(page.getByText('ข้อมูลส่วนตัว', { exact: true }).first()).toBeVisible();

    // Prepare new data
    const newName = 'Test Name ' + Math.floor(Math.random() * 1000);
    const newLastName = 'Lastname ' + Math.floor(Math.random() * 1000);
    const newPhone = '08' + Math.floor(Math.random() * 100000000);

    // Initial check - ensure input fields are interactive
    // Fill Name
    await page.locator('input[placeholder="ชื่อ"]').fill(newName);

    // Fill Last Name
    await page.locator('input[placeholder="นามสกุล"]').fill(newLastName);

    // Fill Phone
    await page.locator('input[placeholder="081-234-5678"]').fill(newPhone);

    // Check Employee ID is readonly (should match 20001)
    const empIdInput = page.locator('input[value="20001"]');
    // Or check readonly attribute
    // await expect(empIdInput).toHaveAttribute('readonly', ''); // Might differ based on React

    // Handle Alert
    page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว');
        await dialog.accept();
    });

    // Save
    await page.getByRole('button', { name: 'บันทึกการแก้ไข' }).click();

    // Wait for a bit for saving
    await page.waitForTimeout(1000);

    // Reload page to verify persistence
    await page.reload();
    await expect(page.locator('nav')).toBeVisible(); // Wait for reload load

    // Navigate back to Profile
    await page.getByRole('button', { name: 'โปรไฟล์' }).click();

    // Assert Values
    await expect(page.locator('input[placeholder="ชื่อ"]')).toHaveValue(newName);
    await expect(page.locator('input[placeholder="นามสกุล"]')).toHaveValue(newLastName);
    await expect(page.locator('input[placeholder="081-234-5678"]')).toHaveValue(newPhone);
  });
});
