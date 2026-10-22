# Buildora · Build with Yash

> Transforming orthographic architectural drawings into physical, light-responsive spaces.

[![Vite](https://img.shields.io/badge/Vite-6.4.5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r128-000000?logo=three.js&logoColor=white)](https://threejs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-3.12-88CE02?logo=greensock&logoColor=white)](https://greensock.com/)
[![License](https://img.shields.io/badge/License-MIT-dfba73)](LICENSE)

**Buildora** is an interactive, spatial web experience crafted by **Build with Yash** (Founder: **Yash Jha**). It explores the transition from raw blueprint drawings and technical datum lines into living, material-rich architectural spaces.

---

## ✨ Features

- **Architectural WebGL Engine:** Dynamic Three.js (r128) room model with volumetric light-shaft shaders, real-time daylight/golden-hour/dusk/night cycles, and atmospheric presets.
- **Warm Obsidian & Brushed Champagne Design:** Refined architectural editorial palette (`#0a0908` obsidian, `#dfba73` brushed champagne, `#f7f3ed` bone text) achieving WCAG AAA contrast (19.3:1).
- **Kinetic Typography:** Accessible, hardware-accelerated text reveals and kinetic typography powered by GSAP.
- **Deep Routing & Case Studies:** Zero-dependency client-side SPA history router with instant deep links to projects (*The Courtyard Pavilion*, *The Smoked Atelier*, *The Monolithic Cloister*), 3D studio material launch shortcuts, and interactive 404 recovery.
- **Zero-Dependency Automated Testing:** Comprehensive unit tests for tokens, portfolio schemas, and mathematical interpolation via native Node.js 24 `--experimental-strip-types`.
- **Production Hardened:** 0 audit vulnerabilities, strict CSP and HTTP security headers, 1-year immutable static asset caching, and verified cross-browser compatibility across Chromium, Firefox, and WebKit.

---

## 🚀 Performance & Lighthouse Scores

Audited against the production build:

| Metric / Category | Target | Desktop Score | Mobile Score (4x Throttle) |
|---|---|---|---|
| **Performance** | 90+ | **96 / 100** | **79 / 100** |
| **Accessibility** | 95+ | **96 / 100** | **96 / 100** |
| **Best Practices** | 95+ | **100 / 100** | **100 / 100** |
| **SEO** | 95+ | **100 / 100** | **100 / 100** |
| **First Contentful Paint (FCP)** | < 1.8s | **0.9 s** | **2.9 s** |
| **Largest Contentful Paint (LCP)** | ≤ 2.5s | **0.9 s** | **3.7 s** |
| **Cumulative Layout Shift (CLS)** | ≤ 0.10 | **0.014** | **0.010** |
| **Total Blocking Time (TBT)** | ≤ 200ms | **0 ms** | **190 ms** |

---

## 🛠️ Tech Stack

- **Framework & Build:** [Vite 6](https://vitejs.dev/) with optimized vendor chunking
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **3D Graphics & Shaders:** [Three.js r128](https://threejs.org/)
- **Motion & Timelines:** [GSAP 3](https://greensock.com/gsap/)
- **Testing:** Native Node.js 24 Test Runner (`node:test`, `node:assert/strict`) + Playwright
- **Deployment:** Vercel / Netlify / Cloudflare Pages

---

## 🏁 Getting Started

### Prerequisites

- Node.js `v20.x` or higher (Recommended: Node `v24.x`)
- npm `v10.x` or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/YashJha22/buildora.git
cd buildora

# Install dependencies
npm install
```

### Development

```bash
# Start Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Automated Testing

```bash
# Run unit & integration test suite (WCAG contrast, content schemas, math utilities)
npm test

# Run type checking
npm run typecheck
```

### Production Build

```bash
# Compile and bundle for production
npm run build

# Preview production build locally
npm run preview
```

---

## 📦 Deployment

### Vercel
Deploy with zero configuration. Buildora includes a preconfigured [`vercel.json`](vercel.json) with SPA fallback rewrites, strict Content-Security-Policy, anti-clickjacking, and 1-year immutable caching for static assets.

```bash
vercel deploy --prod
```

### Netlify
Buildora includes [`netlify.toml`](netlify.toml) and [`public/_redirects`](public/_redirects) for single-command deployment:

```bash
netlify deploy --prod --build
```

### Environment Variables

See [`.env.example`](.env.example):
```bash
# Optional: External form submission endpoint URL (Formspree, Resend, etc.)
# When omitted, brief verification operates locally with prefilled mailto client dispatch.
VITE_CONTACT_ENDPOINT=
```

---

## 📬 Contact & Studio

- **Atelier:** Build with Yash
- **Founder:** Yash Jha
- **Email:** [iyashjha@gmail.com](mailto:iyashjha@gmail.com)
- **Location:** Patna, Bihar (Independent digital studio working remotely)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
