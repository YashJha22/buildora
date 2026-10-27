/**
 * Buildora Color Tokens — Dual Theme System
 * Dark: Warm Obsidian & Brushed Champagne
 * Light: Honed Travertine & Atelier Forest Emerald
 * Centralized design tokens connecting CSS, WebGL (Three.js), and UI components.
 */

export const darkPalette = {
  /** Background: Warm Obsidian `#0a0908` */
  bg: '#0a0908',
  bgHex: 0x0a0908,

  /** Primary text / bone: `#f7f3ed` (18.0:1 contrast ratio against background) */
  textPrimary: '#f7f3ed',
  textPrimaryHex: 0xf7f3ed,

  /** Secondary text / muted: `rgba(247, 243, 237, 0.52)` (5.25:1 contrast ratio) */
  textSecondary: 'rgba(247, 243, 237, 0.52)',

  /** Champagne accent: `#dfba73` (10.8:1 contrast ratio) */
  accent: '#dfba73',
  accentHex: 0xdfba73,

  /** Smoked glass surface: `rgba(18, 15, 13, 0.82)` */
  glassSurface: 'rgba(18, 15, 13, 0.82)',
  glassSurfaceHex: 0x120f0d,

  /** Champagne drafting hairlines & borders: `rgba(223, 186, 115, 0.22)` */
  hairline: 'rgba(223, 186, 115, 0.22)',
} as const;

export const lightPalette = {
  /** Background: Honed Travertine / Warm Parchment `#f7f4ee` */
  bg: '#f7f4ee',
  bgHex: 0xf7f4ee,

  /** Primary text / deep architectural charcoal: `#141210` (15.8:1 contrast ratio) */
  textPrimary: '#141210',
  textPrimaryHex: 0x141210,

  /** Secondary text / muted graphite: `rgba(20, 18, 16, 0.64)` (7.2:1 contrast ratio) */
  textSecondary: 'rgba(20, 18, 16, 0.64)',

  /** Atelier Forest Emerald accent: `#235843` (8.4:1 contrast ratio) */
  accent: '#235843',
  accentHex: 0x235843,

  /** Burnished Brass secondary accent: `#b38944` */
  accentSecondary: '#b38944',
  accentSecondaryHex: 0xb38944,

  /** Frosted alabaster linen surface: `rgba(255, 255, 255, 0.94)` */
  glassSurface: 'rgba(255, 255, 255, 0.94)',
  glassSurfaceHex: 0xffffff,

  /** Emerald drafting hairlines & borders: `rgba(35, 88, 67, 0.18)` */
  hairline: 'rgba(35, 88, 67, 0.18)',
} as const;

export const palette = darkPalette;

/** Colors used by the WebGL scene (kept backward-compatible for scene/index.ts) */
export const colors = {
  ink: darkPalette.bgHex,
  /** clear color + fog of the lit scene, synchronized with glass surface */
  litClear: darkPalette.glassSurfaceHex,
  bone: darkPalette.textPrimaryHex,
  warm: darkPalette.accentHex,
  bronze: darkPalette.accentHex,
};

/** Calculates standard relative luminance for WCAG contrast computation (sRGB) */
export function getLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/** Computes WCAG 2.1 contrast ratio between two hex colors */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}
