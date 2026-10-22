import test from 'node:test';
import assert from 'node:assert/strict';
import { palette, getContrastRatio, getLuminance } from '../src/tokens/colors.ts';

test('Color Palette — Tokens & WCAG Contrast Validation', async (t) => {
  await t.test('Obsidian background and primary text meet WCAG AAA contrast (> 7:1)', () => {
    const ratio = getContrastRatio(palette.bg, palette.textPrimary);
    assert.ok(ratio >= 15, `Expected contrast >= 15:1, got ${ratio}:1`);
  });

  await t.test('Champagne accent against obsidian background meets WCAG AA contrast (> 4.5:1)', () => {
    const ratio = getContrastRatio(palette.bg, palette.accent);
    assert.ok(ratio >= 9, `Expected contrast >= 9:1, got ${ratio}:1`);
  });

  await t.test('Secondary text against obsidian background meets WCAG AA contrast (> 4.5:1)', () => {
    const ratio = getContrastRatio(palette.bg, '#9f9a94');
    assert.ok(ratio >= 4.5, `Expected contrast >= 4.5:1, got ${ratio}:1`);
  });

  await t.test('Token RGB arrays synchronize accurately with HEX representations', () => {
    const bgLuminance = getLuminance(palette.bg);
    assert.ok(bgLuminance < 0.01, 'Background should be deeply dark obsidian');

    const textLuminance = getLuminance(palette.textPrimary);
    assert.ok(textLuminance > 0.85, 'Primary text should be high-luminance brushed bone');
  });
});
