import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: "new"
  });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  
  // Navigate and don't wait for networkidle
  await page.goto('https://zameon.vercel.app/product/atlas-power-bank', { waitUntil: 'domcontentloaded' });
  
  // wait 5 seconds for hydration and data fetching
  await new Promise(r => setTimeout(r, 5000));
  
  await page.screenshot({ path: 'screenshot.png', fullPage: true });
  
  await browser.close();
  console.log('Screenshot saved as screenshot.png');
})();
