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

  await page.goto('https://zameon.vercel.app/product/atlas-power-bank', { waitUntil: 'networkidle0' });
  
  const bodyHandle = await page.$('body');
  const html = await page.evaluate(body => body.innerHTML, bodyHandle);
  console.log('HTML CONTENT:');
  console.log(html.substring(0, 500)); // print first 500 chars to see if it crashed
  
  await browser.close();
})();
