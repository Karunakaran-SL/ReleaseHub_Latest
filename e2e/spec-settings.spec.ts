import { test, expect } from '@playwright/test';

test.describe('Admin Specification Option Management', () => {
  test('should add a new HW Form Factor and reflect it in Specification Studio', async ({ page }) => {
    // 1. Go to Settings and add a new HW Form Factor
    await page.goto('/settings/specifications');
    await page.click('text=HW Form Factors');
    await page.click('button:has-text("Add Option")');
    await page.fill('input[name="key"]', 'QUANTUM_BLADE');
    await page.fill('input[name="label"]', 'Quantum Compute Blade');
    await page.click('button:has-text("Save Option")');

    await expect(page.locator('text=Quantum Compute Blade')).toBeVisible();

    // 2. Verify in Specification Studio
    await page.goto('/specifications/builder');
    await page.click('button:has-text("+ Add Specification")');
    await page.click('text=Hardware (On-Prem)');
    const options = await page.locator('select[name="formFactor"] option').allTextContents();
    expect(options).toContain('Quantum Compute Blade');
  });
});

