/**
 * Pure Mathematical & Interpolation Utilities
 * Safe for execution across both browser and headless environments.
 */

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const clamp = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));
