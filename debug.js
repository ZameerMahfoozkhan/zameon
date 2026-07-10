const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Users\\zamee\\.cache\\puppeteer\\chrome\\win64-150.0.7871.24\\chrome-win64\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to http://localhost:3000/product/atlas-power-bank ...');
  try {
    await page.goto('http://localhost:3000/product/atlas-power-bank', { waitUntil: 'networkidle0' });
    console.log('Navigation successful');
  } catch (err) {
    console.error('Navigation error:', err.message);
  }

  await browser.close();
})();
