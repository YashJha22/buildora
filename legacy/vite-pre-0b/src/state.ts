/** Shared mutable runtime state (was closure variables in the original script). */
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const touch = matchMedia('(pointer: coarse)').matches;

/** Scroll progress `p`, intro reveal and build timeline value, tweened by GSAP. */
export const S = { p: 0, intro: 0, build: 0 };

const w0 = innerWidth;
const h0 = innerHeight;

export const st = {
  ready: false,
  w: w0,
  h: h0,
  tx: w0 * 0.64,
  ty: h0 * 0.5,
  lx: w0 * 0.64,
  ly: h0 * 0.5,
  lr: 0,
  P: 0,
  mx: 0.5,
  my: 0.5,
  mL: 0.5,
  nL: 0.5,
  last: -9,
  R0: 200,
};

/** Per-frame derived progress values handed to chapters and the scene. */
export interface Progress {
  t: number;
  P: number;
  e: number;
  q: number;
  cs: number;
  q2: number;
  bq: number;
  cb: number;
}
