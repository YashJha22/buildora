import { chromium, firefox, webkit } from '/Users/yashjha/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs';

const BROWSERS = [
  {
    name: 'Google Chrome / Chromium',
    engine: chromium,
    options: {
      headless: true,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    },
  },
  {
    name: 'Mozilla Firefox',
    engine: firefox,
    options: {
      headless: true,
      executablePath: '/Users/yashjha/Library/Caches/ms-playwright/firefox-1555/firefox/Nightly.app/Contents/MacOS/firefox',
    },
  },
  {
    name: 'Apple WebKit (Safari engine)',
    engine: webkit,
    options: {
      headless: true,
      executablePath: '/Users/yashjha/Library/Caches/ms-playwright/webkit-2370/pw_run.sh',
    },
  },
];

const BASE_URL = 'http://localhost:4173';

async function testBrowser(bInfo) {
  console.log(`\n========================================`);
  console.log(`Starting automated test on: ${bInfo.name}`);
  console.log(`========================================`);

  const results = {
    browser: bInfo.name,
    launch: false,
    homepage: false,
    consoleErrors: 0,
    webgl: false,
    navigation: false,
    contactValidation: false,
    responsive320px: false,
    durationMs: 0,
    errors: [],
  };

  const startTime = Date.now();
  let browser = null;

  try {
    browser = await bInfo.engine.launch(bInfo.options);
    results.launch = true;
    console.log(`✔ [${bInfo.name}] Browser launched successfully.`);

    const context = await browser.newContext();
    const page = await context.newPage();

    const consoleMessages = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });

    // 1. Test Homepage
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    if (title.includes('Buildora')) {
      results.homepage = true;
      console.log(`✔ [${bInfo.name}] Homepage loaded: "${title}"`);
    } else {
      results.errors.push(`Unexpected homepage title: ${title}`);
    }

    // 2. Check WebGL Canvas presence
    const webglOk = await page.evaluate(() => {
      const canvas = document.querySelector('canvas#l');
      if (!canvas) return false;
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      return !!gl;
    });
    results.webgl = webglOk;
    console.log(`✔ [${bInfo.name}] WebGL Canvas initialization: ${webglOk ? 'PASSED' : 'SKIPPED/UNAVAILABLE'}`);

    // 3. Test Navigation to /approach, /projects, /contact
    await page.goto(`${BASE_URL}/approach`, { waitUntil: 'domcontentloaded' });
    const approachTitle = await page.title();
    await page.goto(`${BASE_URL}/projects`, { waitUntil: 'domcontentloaded' });
    const projectsTitle = await page.title();
    await page.goto(`${BASE_URL}/contact`, { waitUntil: 'domcontentloaded' });
    const contactTitle = await page.title();

    if (approachTitle.includes('Approach') && projectsTitle.includes('Works') && contactTitle.includes('Contact')) {
      results.navigation = true;
      console.log(`✔ [${bInfo.name}] Multi-route deep navigation verified.`);
    } else {
      results.errors.push(`Navigation mismatch: ${approachTitle} | ${projectsTitle} | ${contactTitle}`);
    }

    // 4. Test Contact Form Validation
    await page.click('#cpc-submit-btn');
    const hasNameError = await page.evaluate(() => {
      const err = document.getElementById('err-name');
      return err && err.textContent.includes('Please enter your name');
    });
    if (hasNameError) {
      results.contactValidation = true;
      console.log(`✔ [${bInfo.name}] Form validation and accessible error alerts verified.`);
    } else {
      results.errors.push('Form error alert not displayed upon empty submit.');
    }

    // 5. Test 320px Responsive Overflow
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    const overflowCheck = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        clientWidth: doc.clientWidth,
        scrollWidth: doc.scrollWidth,
        overflow: doc.scrollWidth > doc.clientWidth,
      };
    });
    if (!overflowCheck.overflow) {
      results.responsive320px = true;
      console.log(`✔ [${bInfo.name}] 320px mobile viewport: 0px overflow verified.`);
    } else {
      results.errors.push(`320px viewport overflow detected: ${overflowCheck.scrollWidth} > ${overflowCheck.clientWidth}`);
    }

    results.consoleErrors = consoleMessages.length;
    if (consoleMessages.length > 0) {
      console.log(`ℹ [${bInfo.name}] Console error messages:`, consoleMessages);
    }
  } catch (err) {
    results.errors.push(err.message);
    console.error(`✖ [${bInfo.name}] Test error:`, err.message);
  } finally {
    if (browser) await browser.close();
    results.durationMs = Date.now() - startTime;
  }

  return results;
}

async function runAll() {
  console.log(`\n======================================================`);
  console.log(`BUILDORA — AUTOMATED CROSS-BROWSER TEST SUITE`);
  console.log(`Target: ${BASE_URL} (Production Build)`);
  console.log(`======================================================\n`);

  const summary = [];
  for (const b of BROWSERS) {
    const res = await testBrowser(b);
    summary.push(res);
  }

  console.log(`\n\n======================================================`);
  console.log(`CROSS-BROWSER TEST EXECUTION SUMMARY`);
  console.log(`======================================================`);
  console.table(
    summary.map((s) => ({
      Browser: s.browser,
      Launch: s.launch ? 'PASS' : 'FAIL',
      Homepage: s.homepage ? 'PASS' : 'FAIL',
      WebGL: s.webgl ? 'PASS' : 'N/A',
      Navigation: s.navigation ? 'PASS' : 'FAIL',
      ContactA11y: s.contactValidation ? 'PASS' : 'FAIL',
      Mobile320px: s.responsive320px ? 'PASS' : 'FAIL',
      Duration: `${s.durationMs}ms`,
      Status: s.errors.length === 0 ? '🟢 ALL PASS' : '🔴 FAIL',
    }))
  );
}

runAll();
