export const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
