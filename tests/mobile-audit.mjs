import { chromium } from '/Users/yashjha/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs';
import * as fs from 'fs';
import * as path from 'path';

const ARTIFACT_DIR = '/Users/yashjha/.gemini/antigravity/brain/c46f6341-2af9-4387-a231-e73ce860780b';
const BASE_URL = 'http://localhost:4173';

const VIEWPORTS = [
  { name: '320px_iphone_se1', width: 320, height: 640, category: 'mobile' },
  { name: '360px_android_compact', width: 360, height: 780, category: 'mobile' },
  { name: '375px_iphone_mini', width: 375, height: 812, category: 'mobile' },
  { name: '390px_iphone_14', width: 390, height: 844, category: 'mobile' },
  { name: '414px_iphone_plus', width: 414, height: 896, category: 'mobile' },
  { name: '430px_iphone_15_max', width: 430, height: 932, category: 'mobile' },
  { name: '768px_ipad_portrait', width: 768, height: 1024, category: 'tablet' },
  { name: '1024px_ipad_pro', width: 1024, height: 1366, category: 'tablet' },
  { name: '1280px_desktop_laptop', width: 1280, height: 800, category: 'desktop' },
  { name: '1440px_desktop_widescreen', width: 1440, height: 900, category: 'desktop' },
];

async function runMobileAudit() {
  console.log('======================================================');
  console.log('BUILDORA — COMPREHENSIVE RESPONSIVE & MOBILE AUDIT');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('======================================================\n');

  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });

  const auditReport = [];
  let totalIssues = 0;

  for (const vp of VIEWPORTS) {
    console.log(`\n------------------------------------------------------`);
    console.log(`Testing: ${vp.name} (${vp.width}x${vp.height} · ${vp.category})`);
    console.log(`------------------------------------------------------`);

    const isMobile = vp.category === 'mobile';
    const isTouch = vp.category !== 'desktop';

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      isMobile,
      hasTouch: isTouch,
    });

    const page = await context.newPage();
    const consoleErrors = [];
    const failedRequests = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    page.on('requestfailed', req => {
      failedRequests.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
    });

    // 1. Load Homepage
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2800); // Allow intro animation to resolve

    // Overflow check helper
    const checkOverflow = async (stepName) => {
      return await page.evaluate((step) => {
        const docW = document.documentElement.scrollWidth;
        const winW = window.innerWidth;
        const bodyW = document.body.scrollWidth;
        const overflowPx = Math.max(0, docW - winW, bodyW - winW);

        let offending = [];
        if (overflowPx > 0) {
          const all = document.querySelectorAll('*');
          for (const el of all) {
            const rect = el.getBoundingClientRect();
            if (rect.right > winW + 1) {
              offending.push({
                tag: el.tagName,
                id: el.id,
                className: typeof el.className === 'string' ? el.className.slice(0, 40) : '',
                right: Math.round(rect.right),
                width: Math.round(rect.width),
              });
            }
          }
        }
        return { step, docW, winW, bodyW, overflowPx, offending: offending.slice(0, 5) };
      }, stepName);
    };

    const initialOverflow = await checkOverflow('Hero Initial');

    // Screenshot Hero
    const heroShotPath = path.join(ARTIFACT_DIR, `audit_${vp.name}_hero.png`);
    await page.screenshot({ path: heroShotPath });

    // 2. Test Mobile Menu / Navigation
    let menuOpenOverflow = null;
    if (isMobile || vp.width <= 768) {
      const toggle = await page.$('#mobile-nav-toggle');
      if (toggle) {
        await toggle.click();
        await page.waitForTimeout(400);
        menuOpenOverflow = await checkOverflow('Navigation Menu Open');
        const menuShotPath = path.join(ARTIFACT_DIR, `audit_${vp.name}_menu.png`);
        await page.screenshot({ path: menuShotPath });

        // Close menu via backdrop or toggle
        const backdrop = await page.$('#mobile-nav-backdrop');
        if (backdrop) {
          await backdrop.click({ position: { x: 20, y: 20 }, force: true });
        } else {
          await toggle.click();
        }
        await page.waitForTimeout(300);
      }
    }

    // 3. Test Studio Drawer / Bottom Sheet
    const studioToggle = await page.$('#studio-toggle');
    let studioOpenOverflow = null;
    if (studioToggle) {
      await studioToggle.click();
      await page.waitForTimeout(400);
      studioOpenOverflow = await checkOverflow('Studio Drawer Open');
      const studioShotPath = path.join(ARTIFACT_DIR, `audit_${vp.name}_studio.png`);
      await page.screenshot({ path: studioShotPath });

      // Close studio
      const closeBtn = await page.$('#close-studio');
      if (closeBtn) {
        await closeBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(300);
    }

    // 4. Scroll to Approach Section
    await page.evaluate(() => {
      document.querySelector('#approach-section')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(500);
    const approachOverflow = await checkOverflow('Approach Section');
    const approachShotPath = path.join(ARTIFACT_DIR, `audit_${vp.name}_approach.png`);
    await page.screenshot({ path: approachShotPath });

    // 5. Scroll to Projects Section
    await page.evaluate(() => {
      document.querySelector('#projects-section')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(500);
    const projectsOverflow = await checkOverflow('Projects Section');
    const projectsShotPath = path.join(ARTIFACT_DIR, `audit_${vp.name}_projects.png`);
    await page.screenshot({ path: projectsShotPath });

    // 6. Scroll to Contact Section
    await page.evaluate(() => {
      document.querySelector('#contact-section')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(500);
    const contactOverflow = await checkOverflow('Contact Section');
    const contactShotPath = path.join(ARTIFACT_DIR, `audit_${vp.name}_contact.png`);
    await page.screenshot({ path: contactShotPath });

    // 7. Check Subpages: /projects/nordic-pavilion, /contact, /404
    await page.goto(`${BASE_URL}/projects/nordic-pavilion`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    const caseStudyOverflow = await checkOverflow('Case Study Subpage');
    const caseStudyShotPath = path.join(ARTIFACT_DIR, `audit_${vp.name}_subpage_nordic.png`);
    await page.screenshot({ path: caseStudyShotPath });

    await page.goto(`${BASE_URL}/contact`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    const contactRouteOverflow = await checkOverflow('Contact Route Subpage');

    await page.goto(`${BASE_URL}/404`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    const notFoundOverflow = await checkOverflow('404 Route Subpage');

    // 8. Touch targets audit (check interactive element bounding boxes)
    const touchTargetAudit = await page.evaluate(() => {
      const interactive = Array.from(document.querySelectorAll('button, a[href], input, select, textarea'));
      const smallTargets = [];
      interactive.forEach(el => {
        // Skip hidden elements
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        // Check if both dimensions are below 44px and element is not inline text link
        const isInlineText = el.tagName === 'A' && style.display.includes('inline') && !style.display.includes('block') && !style.display.includes('flex');
        if (!isInlineText && (rect.width < 40 || rect.height < 40)) {
          smallTargets.push({
            tag: el.tagName,
            text: el.innerText?.slice(0, 25) || el.getAttribute('aria-label')?.slice(0, 25) || '',
            id: el.id,
            className: typeof el.className === 'string' ? el.className.slice(0, 30) : '',
            w: Math.round(rect.width),
            h: Math.round(rect.height),
          });
        }
      });
      return { totalInteractive: interactive.length, smallCount: smallTargets.length, smallTargets: smallTargets.slice(0, 5) };
    });

    const maxOverflow = Math.max(
      initialOverflow.overflowPx,
      menuOpenOverflow ? menuOpenOverflow.overflowPx : 0,
      studioOpenOverflow ? studioOpenOverflow.overflowPx : 0,
      approachOverflow.overflowPx,
      projectsOverflow.overflowPx,
      contactOverflow.overflowPx,
      caseStudyOverflow.overflowPx,
      contactRouteOverflow.overflowPx,
      notFoundOverflow.overflowPx
    );

    const vpStatus = maxOverflow === 0 && consoleErrors.length === 0;
    if (!vpStatus) totalIssues++;

    auditReport.push({
      viewport: vp.name,
      width: vp.width,
      category: vp.category,
      maxOverflow,
      consoleErrors: consoleErrors.length,
      failedRequests: failedRequests.length,
      smallTargets: touchTargetAudit.smallCount,
      passed: vpStatus,
    });

    console.log(`  Max Horizontal Overflow: ${maxOverflow} px (${maxOverflow === 0 ? 'PASS' : 'FAIL'})`);
    console.log(`  Console Errors: ${consoleErrors.length}`);
    console.log(`  Failed Requests: ${failedRequests.length}`);
    console.log(`  Touch Targets < 40px: ${touchTargetAudit.smallCount}`);
    console.log(`  Status: ${vpStatus ? '🟢 PASS' : '🔴 ISSUES FOUND'}`);

    await context.close();
  }

  await browser.close();

  console.log('\n======================================================');
  console.log('MOBILE & RESPONSIVE AUDIT SUMMARY MATRIX');
  console.log('======================================================');
  console.table(auditReport);

  console.log(`\nTotal Viewports Evaluated: ${VIEWPORTS.length}`);
  console.log(`Total Issues Detected: ${totalIssues}`);

  if (totalIssues > 0) {
    console.error('Audit completed with issues.');
    process.exit(1);
  } else {
    console.log('All viewports passed with 0px overflow and 0 console errors!');
  }
}

runMobileAudit().catch(err => {
  console.error('Audit failed with fatal error:', err);
  process.exit(1);
});
