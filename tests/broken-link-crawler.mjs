import { chromium } from '/Users/yashjha/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs';

const BASE_URL = 'http://localhost:4173';

const ROUTES_TO_CRAWL = [
  '/',
  '/approach',
  '/projects',
  '/projects/nordic-pavilion',
  '/projects/walnut-atelier',
  '/projects/concrete-cloister',
  '/contact',
  '/studio',
  '/404',
];

async function crawl() {
  console.log('====================================================');
  console.log('BUILDORA — BROKEN LINK & ASSET INTEGRITY CRAWLER');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('====================================================\n');

  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });

  const page = await browser.newPage();
  const brokenAssets = [];
  const visitedLinks = new Set();
  const checkedHrefs = new Map();

  // Listen to response errors
  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();
    if (url.startsWith(BASE_URL) && status >= 400 && !url.includes('/404')) {
      brokenAssets.push({ url, status, type: response.request().resourceType() });
    }
  });

  for (const route of ROUTES_TO_CRAWL) {
    const fullUrl = `${BASE_URL}${route}`;
    console.log(`Crawling route: ${route} ...`);
    const res = await page.goto(fullUrl, { waitUntil: 'domcontentloaded' });
    console.log(`  -> Status: ${res.status()}`);

    // Extract all links
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href]')).map(a => ({
        href: a.getAttribute('href'),
        text: a.innerText.trim() || a.getAttribute('aria-label') || '',
      }));
    });

    for (const link of links) {
      if (!link.href) continue;
      const href = link.href;

      if (checkedHrefs.has(href)) continue;

      if (href.startsWith('mailto:')) {
        const isValidMailto = href === 'mailto:iyashjha@gmail.com';
        checkedHrefs.set(href, { status: isValidMailto ? 200 : 400, note: isValidMailto ? 'Correct mailto' : 'INVALID mailto recipient' });
        console.log(`  [MAILTO] ${href} -> ${isValidMailto ? 'VALID' : 'INVALID'}`);
      } else if (href.startsWith('#')) {
        // Test anchor existence on page
        const exists = await page.evaluate((selector) => {
          try {
            return !!document.querySelector(selector);
          } catch {
            return false;
          }
        }, href);
        checkedHrefs.set(href, { status: exists ? 200 : 404, note: exists ? 'Anchor target exists in DOM' : 'Anchor target MISSING' });
        console.log(`  [ANCHOR] ${href} -> ${exists ? 'EXISTS' : 'BROKEN'}`);
      } else if (href.startsWith('/') || href.startsWith(BASE_URL)) {
        // Internal page check
        const targetUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;
        try {
          const checkRes = await page.request.get(targetUrl);
          const ok = checkRes.status() === 200 || (href.includes('/404') && checkRes.status() === 404);
          checkedHrefs.set(href, { status: checkRes.status(), note: `HTTP ${checkRes.status()}` });
          console.log(`  [INTERNAL] ${href} -> ${checkRes.status()}`);
        } catch (err) {
          checkedHrefs.set(href, { status: 500, note: err.message });
          console.log(`  [INTERNAL] ${href} -> ERROR: ${err.message}`);
        }
      }
    }
  }

  await browser.close();

  console.log('\n====================================================');
  console.log('SUMMARY OF CRAWL:');
  console.log(`Routes crawled: ${ROUTES_TO_CRAWL.length}`);
  console.log(`Unique hrefs checked: ${checkedHrefs.size}`);
  console.log(`Broken asset requests: ${brokenAssets.length}`);

  let brokenCount = 0;
  for (const [href, data] of checkedHrefs.entries()) {
    if (data.status >= 400 && !href.includes('/404')) {
      brokenCount++;
      console.log(`BROKEN LINK: ${href} (${data.note})`);
    }
  }

  if (brokenAssets.length > 0) {
    brokenAssets.forEach(b => console.log(`BROKEN ASSET: ${b.url} (${b.status})`));
  }

  console.log(`TOTAL BROKEN LINKS: ${brokenCount}`);
  console.log(`TOTAL BROKEN ASSETS: ${brokenAssets.length}`);
  console.log('====================================================');

  if (brokenCount > 0 || brokenAssets.length > 0) {
    process.exit(1);
  }
}

crawl().catch(err => {
  console.error(err);
  process.exit(1);
});
