import { chromium } from '/Users/yashjha/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs';
import fs from 'fs';

const AXE_PATH = '/Users/yashjha/.npm/_npx/0f94ee7615faf582/node_modules/axe-core/axe.min.js';
const axeSource = fs.readFileSync(AXE_PATH, 'utf8');

const BASE_URL = 'http://localhost:4173';

const ROUTES_AND_STATES = [
  { name: 'Homepage (Desktop)', url: `${BASE_URL}/`, viewport: { width: 1440, height: 900 } },
  { name: 'Approach Route', url: `${BASE_URL}/approach`, viewport: { width: 1440, height: 900 } },
  { name: 'Projects Route', url: `${BASE_URL}/projects`, viewport: { width: 1440, height: 900 } },
  { name: 'Contact Route', url: `${BASE_URL}/contact`, viewport: { width: 1440, height: 900 } },
  { name: 'Homepage (Mobile 390px)', url: `${BASE_URL}/`, viewport: { width: 390, height: 844 } },
  {
    name: 'Mobile Nav Open (390px)',
    url: `${BASE_URL}/`,
    viewport: { width: 390, height: 844 },
    action: async (page) => {
      const toggle = await page.$('#nav-toggle');
      if (toggle) await toggle.click();
      await page.waitForTimeout(300);
    }
  },
  {
    name: 'Studio Drawer Open (390px)',
    url: `${BASE_URL}/`,
    viewport: { width: 390, height: 844 },
    action: async (page) => {
      const toggle = await page.$('#studio-toggle');
      if (toggle) await toggle.click();
      await page.waitForTimeout(300);
    }
  }
];

async function runAudit() {
  console.log('====================================================');
  console.log('BUILDORA — AUTOMATED AXE-CORE ACCESSIBILITY AUDIT');
  console.log('Standards: WCAG 2.0 / 2.1 Level A & AA, Best Practices');
  console.log('====================================================\n');

  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });

  const allResults = [];
  let totalViolations = 0;

  for (const item of ROUTES_AND_STATES) {
    const context = await browser.newContext({ viewport: item.viewport });
    const page = await context.newPage();

    try {
      await page.goto(item.url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);

      if (item.action) {
        await item.action(page);
      }

      // Inject Axe
      await page.evaluate(axeSource);

      // Run Axe
      const axeResults = await page.evaluate(async () => {
        return await window.axe.run(document, {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
          }
        });
      });

      const violations = axeResults.violations || [];
      totalViolations += violations.length;

      allResults.push({
        state: item.name,
        url: item.url,
        passes: axeResults.passes.length,
        violations: violations.map(v => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.length,
          target: v.nodes.map(n => n.target.join(' ')).slice(0, 3)
        }))
      });

      if (violations.length === 0) {
        console.log(`PASS [0 violations] ${item.name} (${axeResults.passes.length} rules passed)`);
      } else {
        console.log(`WARN [${violations.length} violations] ${item.name}`);
        violations.forEach(v => {
          console.log(`   - [${v.impact?.toUpperCase()}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`);
          v.nodes.slice(0, 2).forEach(n => console.log(`       Target: ${n.target.join(' ')}`));
        });
      }
    } catch (err) {
      console.error(`ERROR running a11y audit on ${item.name}:`, err);
    } finally {
      await context.close();
    }
  }

  await browser.close();

  console.log('\n====================================================');
  console.log(`TOTAL WCAG VIOLATIONS: ${totalViolations}`);
  console.log('====================================================');

  fs.writeFileSync('axe-audit-results.json', JSON.stringify(allResults, null, 2));
  console.log('Saved detailed results to axe-audit-results.json');
}

runAudit().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
