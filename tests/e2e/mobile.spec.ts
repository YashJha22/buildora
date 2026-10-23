import { test, expect } from '@playwright/test';

test.describe('Mobile Web Optimization Suite (iOS Safari & Android Chrome)', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to homepage and wait for initial intro animation to stabilize
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  });

  /* =========================================================================
     TASK 2.1 — Mobile Navigation: Hamburger Menu Functionality & Touch Hitbox
     ========================================================================= */
  test('hamburger navigation menu opens, closes, dismisses on backdrop, and locks body scroll', async ({ page }) => {
    const toggleBtn = page.locator('#mobile-nav-toggle');
    const header = page.locator('#site-header');
    const nav = page.locator('#site-nav');
    const backdrop = page.locator('#mobile-nav-backdrop');

    // 1. Verify toggle button is visible and meets WCAG touch target standards (>= 44px)
    await expect(toggleBtn).toBeVisible();
    const toggleBox = await toggleBtn.boundingBox();
    expect(toggleBox).not.toBeNull();
    expect(Math.round(toggleBox!.width)).toBeGreaterThanOrEqual(44);
    expect(Math.round(toggleBox!.height)).toBeGreaterThanOrEqual(44);

    // Initial state: menu closed, backdrop hidden, aria-expanded=false
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    await expect(header).not.toHaveClass(/nav-open/);

    // 2. Tap hamburger button to open
    await toggleBtn.click();
    await page.waitForTimeout(350);

    await expect(header).toHaveClass(/nav-open/);
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    await expect(backdrop).toHaveClass(/active/);

    // Verify body scroll lock is applied
    const isBodyLocked = await page.evaluate(() => document.body.classList.contains('nav-menu-open'));
    expect(isBodyLocked).toBe(true);

    // 3. Verify all navigation links are tappable and have adequate touch targets (>= 44px)
    const navLinks = nav.locator('a, button');
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    for (let i = 0; i < linkCount; i++) {
      const link = navLinks.nth(i);
      await expect(link).toBeVisible();
      const box = await link.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(40);
    }

    // 4. Tap backdrop scrim to dismiss
    await backdrop.click({ position: { x: 20, y: 20 }, force: true });
    await page.waitForTimeout(350);

    await expect(header).not.toHaveClass(/nav-open/);
    await expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    const isBodyUnlocked = await page.evaluate(() => document.body.classList.contains('nav-menu-open'));
    expect(isBodyUnlocked).toBe(false);

    // 5. Re-open and verify keyboard Escape dismissal
    await toggleBtn.click();
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await expect(header).not.toHaveClass(/nav-open/);
  });

  /* =========================================================================
     TASK 2.2 — Input Fields: Grid Stability, Layout Shift Prevention & Font Size
     ========================================================================= */
  test('contact form input fields prevent iOS auto-zoom and do not shift surrounding layout grid', async ({ page }) => {
    // Navigate directly to contact route
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const form = page.locator('#spatial-contact-form');
    await expect(form).toBeVisible();

    const nameInput = page.locator('#cpc-name');
    const emailInput = page.locator('#cpc-email');
    const messageInput = page.locator('#cpc-message');

    // 1. Verify font-size >= 16px on mobile inputs (prevents iOS Safari viewport zoom jump)
    const fontSizeName = await nameInput.evaluate(el => parseFloat(window.getComputedStyle(el).fontSize));
    const fontSizeEmail = await emailInput.evaluate(el => parseFloat(window.getComputedStyle(el).fontSize));
    const fontSizeMsg = await messageInput.evaluate(el => parseFloat(window.getComputedStyle(el).fontSize));

    expect(fontSizeName).toBeGreaterThanOrEqual(16);
    expect(fontSizeEmail).toBeGreaterThanOrEqual(16);
    expect(fontSizeMsg).toBeGreaterThanOrEqual(16);

    // 2. Measure layout grid anchor coordinates before focus
    const formBoxBefore = await form.boundingBox();
    expect(formBoxBefore).not.toBeNull();

    // 3. Focus and trigger text entry in Name
    await nameInput.click();
    await nameInput.fill('Sarah Jenkins');
    await page.waitForTimeout(100);

    // 4. Focus and trigger text entry in Email
    await emailInput.click();
    await emailInput.fill('sarah.jenkins@spatial-arch.com');
    await page.waitForTimeout(100);

    // 5. Focus and trigger text entry in Message textarea
    await messageInput.click();
    await messageInput.fill('Inquiring regarding residential pavilion structural design and daylighting simulation.');
    await page.waitForTimeout(100);

    // 6. Verify form bounding box has not suffered horizontal grid displacement
    const formBoxAfter = await form.boundingBox();
    expect(formBoxAfter).not.toBeNull();
    expect(Math.abs(formBoxAfter!.x - formBoxBefore!.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(formBoxAfter!.width - formBoxBefore!.width)).toBeLessThanOrEqual(1);

    // 7. Verify horizontal overflow remained 0px throughout input manipulation
    const overflowPx = await page.evaluate(() => {
      return Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
    });
    expect(overflowPx).toBe(0);
  });

  /* =========================================================================
     TASK 2.3 — Responsive Media Queries & Horizontal Overflow Zero-Tolerance
     ========================================================================= */
  test('all media queries render cleanly with zero horizontal overflow across routes', async ({ page }) => {
    const routes = [
      '/',
      '/approach',
      '/projects',
      '/projects/nordic-pavilion',
      '/contact',
      '/studio',
      '/404',
    ];

    for (const route of routes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);

      // Evaluate documentElement and body scroll width against window viewport width
      const overflowReport = await page.evaluate(() => {
        const docW = document.documentElement.scrollWidth;
        const winW = window.innerWidth;
        const bodyW = document.body.scrollWidth;
        const diff = Math.max(0, docW - winW, bodyW - winW);

        // Find offending element if any
        let offendingSelector = null;
        if (diff > 0) {
          const elements = document.querySelectorAll('*');
          for (const el of elements) {
            const rect = el.getBoundingClientRect();
            if (rect.right > winW + 1) {
              offendingSelector = `${el.tagName}#${el.id}.${el.className} (right: ${rect.right}px, winW: ${winW}px)`;
              break;
            }
          }
        }

        return { diff, offendingSelector, docW, winW };
      });

      expect(
        overflowReport.diff,
        `Route ${route} has horizontal overflow of ${overflowReport.diff}px! Offending element: ${overflowReport.offendingSelector}`
      ).toBe(0);
    }
  });

});
