import { test, expect } from '@playwright/test';

test.describe('Specification Studio Type Selection', () => {
  test('should allow creating a Managed K8s specification', async ({ page }) => {
    await page.goto('/specifications/builder');
    await page.click('button:has-text("+ Add Specification")');

    // Select K8s Type
    await page.click('text=Managed Kubernetes');
    await page.selectOption('select[name="k8sDistro"]', 'EKS');
    await page.fill('input[name="k8sVersion"]', '1.30');

    await page.click('button:has-text("Save Specification")');
    await expect(page.locator('text=EKS')).toBeVisible();
  });
});

