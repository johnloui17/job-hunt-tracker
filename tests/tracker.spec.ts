import { test, expect } from '@playwright/test';

test.describe('Job Hunt Tracker', () => {
  test('should load the dashboard and display tasks', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');

    // Wait for the page to load
    await page.waitForSelector('h1:has-text("Job Hunt Tracker")');

    // Check if the title is correct
    const title = await page.textContent('h1');
    expect(title).toBe('Job Hunt Tracker');

    // Take a screenshot of the dashboard
    await page.screenshot({ path: 'playwright-report/dashboard.png', fullPage: true });

    // Check if at least one task section exists
    const sections = await page.locator('section').count();
    expect(sections).toBeGreaterThan(0);

    // Check for the "Download Excel" button
    const downloadBtn = page.locator('button:has-text("Download Excel")');
    await expect(downloadBtn).toBeVisible();
  });

  test('should be able to toggle a task status', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Find the first task toggle button
    const firstTaskRow = page.locator('section').first().locator('div.flex.items-start').first();
    const toggleButton = firstTaskRow.locator('button');
    
    // Get initial state (check if it's done or not)
    const isDoneInitial = await firstTaskRow.evaluate(node => node.classList.contains('opacity-60'));
    
    // Click the toggle button
    await toggleButton.click();
    
    // Wait for the UI to update (the row should change opacity)
    if (isDoneInitial) {
        await expect(firstTaskRow).not.toHaveClass(/opacity-60/);
    } else {
        await expect(firstTaskRow).toHaveClass(/opacity-60/);
    }

    // Take a screenshot after toggling
    await page.screenshot({ path: 'playwright-report/after-toggle.png' });

    // Toggle back to restore state
    await toggleButton.click();
  });
});
