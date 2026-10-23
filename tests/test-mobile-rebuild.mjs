import { chromium } from '/Users/yashjha/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs';

const ARTIFACT_DIR = '/Users/yashjha/.gemini/antigravity/brain/c46f6341-2af9-4387-a231-e73ce860780b';
const BASE_URL = 'http://localhost:5173'; // Vite dev server

async function run() {
  console.log('--- Starting Mobile Rebuild Verification ---');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });

  // Test 1: 390x844 (iPhone 14) with Touch Emulation
  console.log('\nTesting 390x844 (iPhone 14)...');
  const ctx390 = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page390 = await ctx390.newPage();
  const consoleErrors390 = [];
  page390.on('console', msg => {
    if (msg.type() === 'error') consoleErrors390.push(msg.text());
  });

  await page390.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page390.click('#skip');
  await page390.waitForTimeout(600);

  // Screenshot 1: Hero (settled)
  await page390.screenshot({ path: `${ARTIFACT_DIR}/mobile_rebuild_hero_390px.png` });
  console.log('✓ Captured Hero 390px');

  // Verify natural touch scroll works via CDP touch gesture synthesis:
  console.log('Executing real touch scroll gesture via CDP...');
  const client390 = await page390.context().newCDPSession(page390);
  const startY = await page390.evaluate(() => window.scrollY);
  await client390.send('Input.synthesizeScrollGesture', {
    x: 200,
    y: 600,
    yDistance: -350,
    speed: 1000,
    gestureSourceType: 'touch',
  });
  await page390.waitForTimeout(500);

  const afterTouchY = await page390.evaluate(() => window.scrollY);
  console.log(`Scroll position before touch: ${startY}, after touch drag: ${afterTouchY}`);
  const touchScrollWorked = afterTouchY > 0;
  console.log(`✓ Real touch scroll working: ${touchScrollWorked}`);

  // Test address-bar height change simulation:
  console.log('Simulating iOS address-bar collapse / expansion (height change 844 -> 780)...');
  await page390.setViewportSize({ width: 390, height: 780 });
  await page390.waitForTimeout(100);
  const layoutShiftCheck = await page390.evaluate(() => {
    return {
      docWidth: document.documentElement.scrollWidth,
      windowWidth: window.innerWidth,
      scrollY: window.scrollY
    };
  });
  console.log('Layout check after address bar change:', layoutShiftCheck);
  await page390.setViewportSize({ width: 390, height: 844 }); // restore

  // Plan Chapter Check
  const jh = await page390.evaluate(() => {
    const s = document.getElementById('studio-section');
    return s ? s.offsetHeight - window.innerHeight : 2400;
  });

  // Scroll to Plan Panel 1 (P ~ 1.25)
  console.log('\nNavigating to Plan Chapter (P ~ 1.25)...');
  await page390.evaluate((h) => window.scrollTo(0, Math.round((1.25 / 3) * h)), jh);
  await page390.waitForTimeout(800);
  await page390.screenshot({ path: `${ARTIFACT_DIR}/mobile_rebuild_plan_390px.png` });
  console.log('✓ Captured Plan 390px');

  // Scroll to Solar Section (Plan Panel 3: P ~ 2.00)
  console.log('\nNavigating to Solar Section (Plan Panel 3: P ~ 2.00)...');
  await page390.evaluate((h) => window.scrollTo(0, Math.round((2.00 / 3) * h)), jh);
  await page390.waitForTimeout(800);
  await page390.screenshot({ path: `${ARTIFACT_DIR}/mobile_rebuild_solar_390px.png` });
  console.log('✓ Captured Solar 390px');

  // Check each Build stage (Structure, Finishes, Furniture, Light)
  console.log('\nNavigating to Build Stages...');
  
  // Build Stage 01: Structure (targetP ~ 2.20)
  await page390.evaluate((h) => window.scrollTo(0, Math.round((2.20 / 3) * h)), jh);
  await page390.waitForTimeout(800);
  await page390.screenshot({ path: `${ARTIFACT_DIR}/mobile_rebuild_build_01_structure_390px.png` });
  console.log('✓ Captured Build 01 Structure 390px');

  // Build Stage 02: Finishes (targetP ~ 2.40)
  await page390.evaluate((h) => window.scrollTo(0, Math.round((2.40 / 3) * h)), jh);
  await page390.waitForTimeout(800);
  await page390.screenshot({ path: `${ARTIFACT_DIR}/mobile_rebuild_build_02_finishes_390px.png` });
  console.log('✓ Captured Build 02 Finishes 390px');

  // Build Stage 03: Furniture (targetP ~ 2.70)
  await page390.evaluate((h) => window.scrollTo(0, Math.round((2.70 / 3) * h)), jh);
  await page390.waitForTimeout(800);
  await page390.screenshot({ path: `${ARTIFACT_DIR}/mobile_rebuild_build_03_furniture_390px.png` });
  console.log('✓ Captured Build 03 Furniture 390px');

  // Build Stage 04: Light (targetP ~ 2.95)
  await page390.evaluate((h) => window.scrollTo(0, Math.round((2.95 / 3) * h)), jh);
  await page390.waitForTimeout(800);
  await page390.screenshot({ path: `${ARTIFACT_DIR}/mobile_rebuild_build_04_light_390px.png` });
  console.log('✓ Captured Build 04 Light 390px');

  // Test tap on stage stepper button (e.g. tap step 01 Structure):
  console.log('\nTesting Tap on Stage Stepper Button...');
  const step0Btn = page390.locator('.st-step-btn[data-step="0"]');
  await step0Btn.click();
  await page390.waitForTimeout(800);
  const tappedTitle = await page390.evaluate(() => document.getElementById('bhd')?.textContent);
  console.log('✓ After tapping step 0 button, headline is:', tappedTitle?.trim());

  // Test horizontal swipe gesture on mobile text card:
  console.log('\nTesting horizontal swipe gesture on mobile text card...');
  const cardBox = await page390.locator('#bld .lt').boundingBox();
  if (cardBox) {
    const midX = cardBox.x + cardBox.width / 2;
    const midY = cardBox.y + cardBox.height / 2;
    await client390.send('Input.synthesizeScrollGesture', {
      x: midX,
      y: midY,
      xDistance: -140, // swipe left -> next step
      yDistance: 0,
      speed: 1000,
      gestureSourceType: 'touch',
    });
    await page390.waitForTimeout(800);
    const swipedTitle = await page390.evaluate(() => document.getElementById('bhd')?.textContent);
    console.log('✓ After swiping left on card, headline is:', swipedTitle?.trim());
  }

  // Test 2: 375x667 (iPhone SE) with Touch Emulation
  console.log('\nTesting 375x667 (iPhone SE)...');
  const ctx375 = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page375 = await ctx375.newPage();
  await page375.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page375.click('#skip');
  await page375.waitForTimeout(600);
  await page375.screenshot({ path: `${ARTIFACT_DIR}/mobile_rebuild_hero_375px.png` });
  
  // Build on 375px
  const jh375 = await page375.evaluate(() => {
    const s = document.getElementById('studio-section');
    return s ? s.offsetHeight - window.innerHeight : 2400;
  });
  await page375.evaluate((h) => window.scrollTo(0, Math.round((2.70 / 3) * h)), jh375);
  await page375.waitForTimeout(800);
  await page375.screenshot({ path: `${ARTIFACT_DIR}/mobile_rebuild_build_furniture_375px.png` });
  console.log('✓ Captured 375px Hero & Build Furniture');

  // Test additional required viewports: 320, 414, 430 px
  for (const [w, h, label] of [
    [320, 568, '320px_iphone_se1'],
    [414, 896, '414px_iphone_xr'],
    [430, 932, '430px_iphone_14_pro_max']
  ]) {
    console.log(`\nTesting ${w}x${h} (${label})...`);
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const p = await ctx.newPage();
    await p.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await p.click('#skip');
    await p.waitForTimeout(600);
    await p.screenshot({ path: `${ARTIFACT_DIR}/mobile_rebuild_hero_${w}px.png` });
    
    // Check Build stage on this viewport
    const curJh = await p.evaluate(() => {
      const s = document.getElementById('studio-section');
      return s ? s.offsetHeight - window.innerHeight : 2400;
    });
    await p.evaluate((h) => window.scrollTo(0, Math.round((2.70 / 3) * h)), curJh);
    await p.waitForTimeout(800);
    await p.screenshot({ path: `${ARTIFACT_DIR}/mobile_rebuild_build_${w}px.png` });
    console.log(`✓ Captured ${w}px Hero & Build`);
    await ctx.close();
  }

  // Test Desktop: 1440x900 (Confirm Visually Unchanged)
  console.log('\nTesting Desktop 1440x900...');
  const ctxDesktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  });
  const pageDesktop = await ctxDesktop.newPage();
  await pageDesktop.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await pageDesktop.click('#skip');
  await pageDesktop.waitForTimeout(600);
  await pageDesktop.screenshot({ path: `${ARTIFACT_DIR}/desktop_1440px_verified.png` });

  // Desktop Build
  const jhDesk = await pageDesktop.evaluate(() => {
    const s = document.getElementById('studio-section');
    return s ? s.offsetHeight - window.innerHeight : 2400;
  });
  await pageDesktop.evaluate((h) => window.scrollTo(0, Math.round((2.70 / 3) * h)), jhDesk);
  await pageDesktop.waitForTimeout(800);
  await pageDesktop.screenshot({ path: `${ARTIFACT_DIR}/desktop_1440px_build_verified.png` });
  console.log('✓ Captured Desktop 1440px Hero & Build');

  // Check Overflows and Overlaps on 390px
  const overflowAndOverlap = await page390.evaluate(() => {
    const docW = document.documentElement.scrollWidth;
    const bodyW = document.body.scrollWidth;
    const winW = window.innerWidth;
    return {
      hasHorizontalOverflow: docW > winW || bodyW > winW,
      docW,
      winW
    };
  });
  console.log('\nHorizontal Overflow Check (390px):', overflowAndOverlap);
  console.log('Console Errors (390px):', consoleErrors390.length);

  await browser.close();
  console.log('\n--- Verification Run Completed Successfully ---');
}

run().catch(err => {
  console.error('Error running verification:', err);
  process.exit(1);
});
