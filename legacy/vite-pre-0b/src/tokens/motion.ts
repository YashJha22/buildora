/**
 * Motion tokens, extracted verbatim from the original inline script.
 * Migration only: values intentionally NOT aligned with buildora-rules.md
 * (see MIGRATION_NOTES.md for the list of deviations).
 */

const span = 3 / 2.88;
const lead = 0.12;
/** Plan chapter resting points */
export const plan = {
  flat: 0.12, // share of the plan chapter's scroll held flat at each panel centre (0, 0.5, 1)
  hold: 0.12, // extra progress held after panel 3 before the build chapter starts
};

/** Scroll / input mapping */
export const scroll = {
  // 3 chapters of progress plus the hold, converted back to input units
  max: (3 + plan.hold) / span + lead,
  wheelDivisor: 2300,
  touchDivisor: 1.6, // multiplied by viewport height
  keyStep: 0.15,
  lead, // progress dead zone before the scene starts moving
  span,
};

/** Per-frame smoothing factors */
export const smooth = {
  lens: 0.1,
  progress: 0.07,
  tilt: 0.05,
  radius: 0.12,
};

/** Idle cursor behaviour */
export const idle = { after: 3 };

/** Preloader + hero intro GSAP timeline */
export const intro = {
  defaultEase: 'expo.out',
  count: { duration: 2.4, ease: 'power2.inOut' },
  fade: { duration: 0.6, ease: 'power3.in', stagger: 0.05, y: -20 },
  curtain: { duration: 1.1, ease: 'expo.inOut', at: '<.2' },
  headline: { duration: 1.4, stagger: 0.14, at: '-=.7' },
  chrome: { duration: 1.1, stagger: 0.08, y: 14, at: '<.3' },
  build: { duration: 8.5, ease: 'power1.inOut', at: '<-.2' },
  reveal: { duration: 2.6, ease: 'expo.out', at: '<6' },
  foot: { duration: 1, ease: 'power2.out', at: '>-.4' },
  skipTimeScale: 6,
  footOpacity: 0.8,
};

/** Build-chapter headline/paragraph swap */
export const buildSwap = {
  from: { y: 32, opacity: 0 },
  to: { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.08, overwrite: true as const },
};
