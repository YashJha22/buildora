# Migration notes (Vite + TypeScript stage)

Baseline: [`legacy/index.html`](legacy/index.html) is the untouched original. Compare with `npm run dev`, then open `/` and `/legacy/index.html`.

## What changed (structure only)
- CSS and markup moved verbatim (`src/styles/main.css`, `index.html`). No copy, number or style edits.
- `three@0.128.0` and `gsap@3.12.5` come from npm, pinned exactly, instead of the CDN.
- Three.js is loaded with dynamic `import()` in `src/scene/index.ts`. On load failure or no WebGL it logs an error and the page runs without the scene.
- Motion constants now live in `src/tokens/motion.ts` and `src/tokens/colors.ts`, with the same values.

## Behavioral differences caused by the migration
1. Three.js arrives asynchronously, so for the first moments `gl` is null and frames skip the 3D draw. The preloader covers this.
2. GSAP is bundled, so the original `!window.gsap` fallback can no longer trigger. The reduced-motion path is unchanged.
3. The original `!window.THREE` guard is replaced by the load/WebGL failure path above.

## Existing violations of buildora-rules.md (NOT fixed in this stage)
**Entrance easing** (rule: `cubic-bezier(0.16, 1, 0.3, 1)` only). The code uses these GSAP eases instead: `expo.out`, `power2.inOut`, `power3.in`, `expo.inOut`, `power1.inOut`, `power2.out`. CSS also has a `.5s` opacity/color transition on `#bld .st span`.

**Durations** (rule: 0.2 / 0.4 / 0.8 / 1.4 s only). The code uses 2.4, 0.6, 1.1, 8.5, 2.6, 1 and 0.9 s. Only 1.4 s (headline) is allowed.

**Reduced-motion twin** (rule: every motion has one).
- The intro has a twin.
- These still animate under reduced motion: the lens idle drift, the ring pulse, the dust, the lamp flicker, and the scroll-scrubbed camera and SVG drawing.
- `.ln>span` slide-up and the preloader are skipped.

**Remote assets** (rule: no remote assets, self-host fonts). Fonts still load from Google Fonts. This was deferred in the plan.

**Performance rules.**
- Rendering pauses in hidden tabs only through the browser's `requestAnimationFrame` throttling. There is no explicit pause.
- Three.js is not preloaded, so LCP and first-3D-frame times are unmeasured.

**Other.**
- Hero lock: kept. `st.ready` unlocks scrolling only when the intro timeline completes (Skip fast-forwards it).
- Dependency pinning: done. `npm audit` reports 2 dev-tool advisories, left untouched.
