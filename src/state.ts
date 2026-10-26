/** Shared mutable runtime state (was closure variables in the original script). */
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const touch = matchMedia('(pointer: coarse)').matches;

const params = new URLSearchParams(location.search);
/** `?intro=classic` preserves the pre-0B circular clip-path lens baseline. */
export const classic = params.get('intro') === 'classic';
/** Optional deterministic clock override (`?t=4.5`) for repeatable frame inspection. */
export const debugT = params.has('t') ? Number(params.get('t')) : null;
/** Optional deterministic front override (`?front=0.5`) for direct front testing. */
export const debugFront = params.has('front') ? Number(params.get('front')) : null;
/** Optional deterministic draw override (`?draw=0.5`) for direct sketch stroke testing. */
export const debugDraw = params.has('draw') ? Number(params.get('draw')) : null;

/** Scroll progress `p`, sketch draw progress `draw`, intro lens reveal `intro`, build value, and master clock `T`. */
export const S = { p: 0, draw: classic ? 1 : 0, intro: 0, build: classic ? 0 : 1, T: 0 };

const w0 = innerWidth;
const h0 = innerHeight;
const isMob0 = w0 < 768;

export const st = {
  ready: false,
  w: w0,
  h: h0,
  tx: isMob0 ? w0 * 0.54 : w0 * 0.64,
  ty: isMob0 ? h0 * 0.36 : h0 * 0.5,
  lx: isMob0 ? w0 * 0.54 : w0 * 0.64,
  ly: isMob0 ? h0 * 0.36 : h0 * 0.5,
  lr: 0,
  P: 0,
  mx: 0.5,
  my: 0.5,
  mL: 0.5,
  nL: 0.5,
  last: -9,
  R0: 200,
  pointerSpeed: 0,
  solarHour: 14.5,
  solarAuto: true,
  paletteIdx: 0,
  studioOpen: false,
  waveRadius: 0,
  solarManual: false,
  solarManualUntil: 0,
  roomLightOn: true,
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
