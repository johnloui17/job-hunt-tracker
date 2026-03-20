import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  console.log('Navigating to http://localhost:3000...');
  try {
    const response = await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    console.log('Response Status:', response.status());
    console.log('Response Headers:', response.headers());
    await page.screenshot({ path: 'browser-check.png', fullPage: true });
    console.log('Screenshot saved to browser-check.png');
    const content = await page.textContent('body');
    console.log('Body Content (first 200 chars):', content?.substring(0, 200));
  } catch (err) {
    console.error('Navigation failed:', err);
  }
  await browser.close();
})();
