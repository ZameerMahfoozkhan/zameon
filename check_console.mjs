import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`BROWSER CONSOLE: ${msg.type()} - ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`BROWSER ERROR: ${error.message}`);
  });

  await page.goto('https://zameon.vercel.app/', { waitUntil: 'domcontentloaded' });
  
  await new Promise(r => setTimeout(r, 5000));
  
  await browser.close();
})();
