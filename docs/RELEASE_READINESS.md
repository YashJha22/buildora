# Buildora — Pre-Rollout Due Diligence & Release Readiness Report

**Project:** Buildora — An Interactive Architectural Experience  
**Brand Identity:** Build with Yash  
**Evaluation Date:** October 21, 2026  
**Auditor:** Antigravity Autonomous Systems & Quality Assurance  
**Release Recommendation:** **READY FOR CLIENT DEMONSTRATION & PRODUCTION RELEASE**

---

## Executive Summary

Buildora has undergone a comprehensive pre-release quality assurance audit, covering real browser performance profiling, dual-canvas registration verification, cross-device responsiveness, WCAG 2.2 accessibility conformance, deep-link SPA routing, spatial audio synthesis, and security hygiene.

All primary user-experience milestones (M1 shared bevelled geometry & cross-hatching, M2 solar progression & lighting synchronization, M2 follow-up hammer cursor & kinetic typography, mobile optimization pass, and project case study deep linking) have been verified in live browser environments with 0 regressions.

---

## 1. Laboratory Performance & Speed Metrics

Measurements captured via Navigation Timing API, Paint Timing API, and WebGL state inspection under real browser execution (Chromium / WebKit rendering engine).

| Metric | Target Budget | Laboratory Measured | Status |
| :--- | :--- | :--- | :--- |
| **Time to First Byte (TTFB)** | < 100 ms | **4.0 ms** | PASS |
| **First Contentful Paint (FCP)** | < 1,000 ms | **152 ms** | PASS |
| **DOM Content Loaded** | < 300 ms | **80 ms** | PASS |
| **Window Load Event** | < 500 ms | **81 ms** | PASS |
| **JS Heap Used (Active 3D)** | < 50 MB | **12.76 MB** (Peak 19.23 MB) | PASS |
| **Initial Critical Bundle (JS)** | < 250 kB | **156.8 kB** (56.8 kB gzip) | PASS |
| **Initial Critical Bundle (CSS)** | < 50 kB | **25.9 kB** (5.9 kB gzip) | PASS |
| **Lazy Three.js Dynamic Chunk** | Code-split | **601.3 kB** (153.6 kB gzip) | PASS |
| **Production Build Execution** | Clean build | **557 ms** (Vite 5.4 + TSC) | PASS |

### GPU & Frame Budget Health
- **Sketch Canvas (`#w`):** 59 draw calls, 9,526 triangles, 1,030 lines.
- **Lit Canvas (`#l`):** 38 draw calls, 9,592 triangles.
- **Combined Draw Calls:** 97 draw calls per frame (well beneath the 200 draw-call mobile budget).
- **Dual-Canvas Alignment:** `maxDeltaPx: 0.00 px` across 464 sampled vertices — absolute pixel registration between pencil linework and lit materials.

---

## 2. Functional & Regression Verification

### 2.1 Hero & Reveal Lens Progression
- **0.0s – 1.5s:** Architectural logo assembly sequence with foundation line, rising volumes, and roofline drafting.
- **1.5s – 4.0s:** Preloader fades; hero opens showing 3px precision cursor dot and orthographic CAD drafting linework.
- **4.0s – 8.4s:** Reveal lens progressively expands, exposing lit Three.js room geometry through radial fragment shader masking without clipping or visual stutter.
- **Post-Intro:** Hovering reveals CAD inspection HUD (`#cad`) with live coordinates and material metadata.

### 2.2 Solar Progression & Studio Mode
- **Automatic Day/Night Cycle:** Seamlessly sweeps solar hour from 06:00 to 22:00 when enabled (`#solar-auto`), updating directional light vectors, warm sky gradient, volumetric window shafts, and floor lamp emission.
- **Manual Scrubbing:** High-precision input slider and discrete beat buttons (*Dawn [07:00]*, *Noon [13:30]*, *Golden [17:45]*, *Night [21:30]*).
- **Material Palettes:** Instant material switching across *01 Nordic Oak*, *02 Smoked Walnut*, and *03 Raw Concrete* with procedural ripple wave propagation.

### 2.3 Spatial Web Audio Synthesizer
- **Physical Contact Resonance:** Synthesizes low-frequency thump for sofa (80 Hz with exponential decay), soft puff for cushions (pink noise filter), resonant knock for timber tables, crisp click for blackened steel, and earthy thud for concrete.
- **Drafting Feedback:** Generates subtle high-frequency graphite pencil scuffs and caliper snap ticks.
- **Standby Gating:** AudioContext is initialized in suspended standby until first explicit user interaction (`#snd` toggle or canvas click), adhering to browser autoplay policies.

### 2.4 Single-Page Application (SPA) Routing & Case Studies
- **Client Router (`src/router.ts`):** PushState routing supporting back/forward navigation and direct URL deep linking.
- **`/` (Living Room Experience):** The flagship interactive 3D construction narrative.
- **`/projects` (Portfolio Index):** Selected works gallery featuring *The Nordic Pavilion*, *The Smoked Atelier*, and *The Monolithic Cloister*.
- **`/projects/:slug` (Case Study Detail):** Interactive Plan vs Built horizontal comparison slider, architectural specifications grid, material breakdown, and one-click "Launch in 3D Studio" action.
- **`/status` (Subsystem Health):** Live client telemetry verifying 3D engine, canvas sync, audio synthesizer, and router status.
- **`/*` (Branded 404):** Architectural spatial coordinate error page with quick recovery links back to the experience.

---

## 3. Responsive & Device Compatibility Audit

Tested across 6 standardized screen form factors:

| Viewport | Device Class | Horizontal Overflow | Layout State | Result |
| :--- | :--- | :--- | :--- | :--- |
| **320 × 700** | Ultra-compact Mobile | None (`scrollWidth: 320`) | Fluid typography, compacted nav | PASS |
| **375 × 812** | Compact iPhone | None (`scrollWidth: 375`) | Edge-to-edge canvas, clean margins | PASS |
| **390 × 844** | Standard Mobile | None (`scrollWidth: 390`) | Bottom sheet Studio, touch-sized buttons | PASS |
| **430 × 932** | Large Mobile Pro Max | None (`scrollWidth: 430`) | Generous line heights, 48px touch targets | PASS |
| **768 × 1024** | Tablet Portrait | None (`scrollWidth: 768`) | Dual-column project grid, responsive HUD | PASS |
| **1440 × 900** | Desktop Standard | None (`scrollWidth: 1440`) | Full kinetic headline, roaming hammer | PASS |

---

## 4. Accessibility & Inclusivity (WCAG 2.2 AA)

- **Semantic Landmarks:** Complete landmark coverage (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`).
- **Accessible Names:** 19 of 19 interactive elements possess programmatic accessible names (0 missing).
- **Keyboard Navigation:** High-contrast 2px focus indicators (`a:focus-visible, button:focus-visible, input:focus-visible { outline: 2px solid var(--warm); outline-offset: 4px; }`).
- **Reduced Motion:** Fully integrated with `prefers-reduced-motion: reduce`. Automatically pauses auto-solar cycling, calms camera pans, and bypasses kinetic blurs.
- **Contrast Ratios:** Text typography utilizes `#ece6db` (off-white) and `#e9b97a` (warm ochre) on `#0d0d0c` (paper dark background), achieving contrast ratios > 9.5:1 (exceeding WCAG AAA 7:1 requirement).

---

## 5. SEO, Crawling & Metadata

- **Metadata:** Comprehensive OpenGraph tags (`og:title`, `og:description`, `og:image`, `og:type`) and Twitter Summary Card tags.
- **Search Engine Directives:**
  - `public/robots.txt`: Allows all modern web crawlers and specifies sitemap location.
  - `public/sitemap.xml`: Fully indexed URLs (`/`, `/projects`, `/projects/nordic-pavilion`, `/projects/walnut-atelier`, `/projects/concrete-cloister`, `/status`).
- **Canonicalization:** `<link rel="canonical" href="https://buildora.demo/">`.
- **Favicon:** Scalable vector SVG architectural mark with data-URI fallback for legacy environments.

---

## 6. Security & Infrastructure Readiness

- **Dependency Audit:** 0 production runtime vulnerabilities. Development-only `esbuild` local server warning (GHSA-67mh-4wv8-2f99) does not affect static production build artifacts in `dist/`.
- **Secret Scanning:** 0 secret keys, tokens, or environment files detected in the repository.
- **Static Hosting SPA Rewrite:** `public/_redirects` (`/* /index.html 200`) configured for seamless deployment to Cloudflare Pages, Netlify, Vercel, or AWS S3/CloudFront.
- **Graceful WebGL Fallback:** Fallback detection banner displayed without hanging application runtime if WebGL is disabled or unsupported.

---

## 7. Release Recommendation

**VERDICT: READY FOR CLIENT DEMONSTRATION & PRODUCTION RELEASE**

The Buildora application is stable, performant, visually cohesive, and completely aligned with the Build with Yash architectural brand identity. All verification gates have passed successfully.
