import { test, expect } from '@playwright/test';

test.describe('Specification Studio Lifecycle', () => {
  test('should display Specification Studio and duplicate an existing spec', async ({ page }) => {
    await page.goto('/specifications');
    await expect(page.locator('a:has-text("SPECIFICATION STUDIO")')).toBeVisible();

    // Test Duplication
    await page.click('button:has-text("Duplicate")');
    await expect(page.locator('dialog')).toBeVisible();
    await page.fill('input[name="name"]', 'Duplicated Pipeline Spec');
    await page.click('button:has-text("Confirm Duplicate")');
    await expect(page.locator('text=Duplicated Pipeline Spec')).toBeVisible();
  });

  test('should validate and reject invalid YAML during import', async ({ page }) => {
    await page.goto('/specifications/builder');
    await expect(page.locator('h1')).toContainText('Specification Studio');
    await page.click('button:has-text("Import Specification")');

    // Upload/Paste invalid file
    await page.fill('textarea[name="specPreview"]', 'invalid_key: true');
    await page.click('button:has-text("Next: Validate Schema")');

    // Verify error & suggestion box
    await expect(page.locator('.validation-error-box')).toBeVisible();
    await expect(page.locator('.validation-error-box')).toContainText('Suggestion');
  });
});

