#!/usr/bin/env node
/**
 * Buildora CI/CD Mobile Quality Gate
 * Programmatic check to detect element clipping, overflow, and element overlap on screens < 430px.
 * Run directly in GitHub Actions or pre-commit hooks: `node tests/ci-mobile-check.mjs`
 */

import { chromium } from '/Users/yashjha/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs';

const TARGET_VIEWPORTS = [
  { width: 320, height: 640, label: '320px Compact Mobile' },
  { width: 375, height: 812, label: '375px iPhone Mini' },
  { width: 390, height: 844, label: '390px iPhone 14' },
  { width: 428, height: 926, label: '428px iPhone Max (<430px)' },
];

const BASE_URL = process.env.BASE_URL || 'http://localhost:4173';

async function runCiCheck() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  CI/CD PROGRAMMATIC MOBILE QUALITY GATE (<430px)');
  console.log(`  Target: ${BASE_URL}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });

  let totalFailures = 0;

  for (const vp of TARGET_VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });

    const page = await context.newPage();

    try {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2500); // Allow GSAP intro to finish

      const diagnostics = await page.evaluate((vpWidth) => {
        const issues = [];

        // 1. Root and Document Overflow Check
        const docScrollW = document.documentElement.scrollWidth;
        const bodyScrollW = document.body.scrollWidth;
        const winW = window.innerWidth;
        const maxScroll = Math.max(docScrollW, bodyScrollW);

        if (maxScroll > winW) {
          issues.push({
            type: 'HORIZONTAL_OVERFLOW',
            severity: 'CRITICAL',
            details: `Page scroll width (${maxScroll}px) exceeds viewport width (${winW}px) by ${maxScroll - winW}px.`,
          });
        }

        // 2. Element Boundary & Clipping Check
        // Finds any visible DOM element extending beyond the viewport right edge
        const allElements = document.querySelectorAll('body *');
        for (const el of allElements) {
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;

          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;

          // Check if element spills past the viewport right boundary by more than 1px
          if (rect.right > winW + 1.5) {
            // Filter out SVG defs / markers
            if (el.tagName.toLowerCase() === 'defs' || el.tagName.toLowerCase() === 'clippath') continue;

            // Check if element is safely contained by an overflow: hidden ancestor within viewport
            let isContained = false;
            let ancestor = el.parentElement;
            while (ancestor && ancestor !== document.body) {
              const aStyle = window.getComputedStyle(ancestor);
              if (aStyle.overflow === 'hidden' || aStyle.overflowX === 'hidden') {
                const aRect = ancestor.getBoundingClientRect();
                if (aRect.right <= winW + 1.5) {
                  isContained = true;
                  break;
                }
              }
              ancestor = ancestor.parentElement;
            }

            if (isContained) continue; // Safely clipped by a container that fits the screen

            issues.push({
              type: 'ELEMENT_CLIPPING',
              severity: 'HIGH',
              selector: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''}`,
              details: `Element right edge (${Math.round(rect.right)}px) clips past viewport width (${winW}px) by ${Math.round(rect.right - winW)}px without an overflow:hidden boundary.`,
            });
            if (issues.length >= 8) break; // cap report items
          }
        }

        // 3. Collision / Unintended Overlap Detection
        // Tests critical floating elements against headline typography
        const heroHeading = document.querySelector('.hero-h1');
        const pullCord = document.querySelector('#pull-cord-wrap, .pull-cord-wrap');

        if (heroHeading && pullCord) {
          const cordStyle = window.getComputedStyle(pullCord);
          if (cordStyle.display !== 'none' && cordStyle.visibility !== 'hidden') {
            const hRect = heroHeading.getBoundingClientRect();
            const cRect = pullCord.getBoundingClientRect();

            // Collision condition: overlapping bounding boxes
            const hasCollision = !(
              cRect.right < hRect.left ||
              cRect.left > hRect.right ||
              cRect.bottom < hRect.top ||
              cRect.top > hRect.bottom
            );

            if (hasCollision) {
              issues.push({
                type: 'ELEMENT_COLLISION',
                severity: 'CRITICAL',
                details: 'Floating light switch cord collides with hero headline typography.',
              });
            }
          }
        }

        return issues;
      }, vp.width);

      if (diagnostics.length === 0) {
        console.log(`✔ [${vp.label}] 0 overflow, 0 clipping, 0 collisions detected.`);
      } else {
        totalFailures += diagnostics.length;
        console.error(`✖ [${vp.label}] ${diagnostics.length} issue(s) detected:`);
        diagnostics.forEach(issue => {
          console.error(`    - [${issue.severity}] ${issue.type}: ${issue.details} ${issue.selector ? '(' + issue.selector + ')' : ''}`);
        });
      }
    } catch (err) {
      totalFailures++;
      console.error(`✖ [${vp.label}] Fatal check error: ${err.message}`);
    } finally {
      await context.close();
    }
  }

  await browser.close();

  console.log('\n═══════════════════════════════════════════════════════════════');
  if (totalFailures === 0) {
    console.log('  CI QUALITY GATE: PASSED (All screen widths <430px verified)');
    console.log('═══════════════════════════════════════════════════════════════\n');
    process.exit(0);
  } else {
    console.error(`  CI QUALITY GATE: FAILED (${totalFailures} defect(s) detected)`);
    console.log('═══════════════════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

runCiCheck();
