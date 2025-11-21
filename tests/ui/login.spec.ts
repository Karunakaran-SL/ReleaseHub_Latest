import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test
    await page.goto('/login');
  });

  /**
   * UI Layout & Visual Regression Test
   * This test captures a screenshot of the login page and compares it to a baseline.
   * If the layout changes, the test will fail, alerting you to unintended UI modifications.
   */
  test('should match the saved screenshot for layout integrity', async ({ page }) => {
    // Wait for the form to be visible to ensure the page has loaded
    await expect(page.locator('form')).toBeVisible();
    
    // Take a screenshot and compare it with the golden master
    await expect(page).toHaveScreenshot('login-page.png');
  });

  /**
   * Functional End-to-End Test for User Login
   * This test simulates a user logging in for the first time.
   * Since the backend creates a user on the first login attempt, we expect a successful login.
   */
  test('should allow a new user to sign in and be redirected', async ({ page }) => {
    // Use a unique username for each test run to ensure it's a "new" user
    const username = `testuser_${Date.now()}`;
    const password = 'password123';

    // Fill in the login form
    await page.getByLabel('Username *').fill(username);
    await page.getByLabel('Password *').fill(password);

    // Click the sign-in button
    await page.getByRole('button', { name: 'SIGN IN' }).click();

    // After a successful login, the user should be redirected to the dashboard page.
    // We wait for the URL to change to the base URL.
    await expect(page).toHaveURL('/');

    // As a final check, we can verify that some dashboard content is visible.
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  /**
   * Functional Test for Invalid Input
   * This test ensures that appropriate validation messages are shown for empty fields.
   */
  test('should show validation errors for empty fields', async ({ page }) => {
    // Click the sign-in button without filling out the form
    await page.getByRole('button', { name: 'SIGN IN' }).click();

    // Check for the presence of validation error messages
    await expect(page.getByText('Please enter a valid username.')).toBeVisible();
    await expect(page.getByText('Password is required.')).toBeVisible();
  });
});
