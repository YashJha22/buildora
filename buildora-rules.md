# Buildora project rules

## Look (locked)
- Colors: ink #0D0D0C, bone #ECE6DB, warm #E9B97A. No other colors.
- Fonts: Instrument Serif for display, Manrope for UI. No other fonts.
- Mood: warm, architectural, restrained. Lots of empty space. Warm accent means finished or interactive only.

## Motion (locked)
- One easing for entrances: cubic-bezier(0.16, 1, 0.3, 1). Durations come from 0.2 / 0.4 / 0.8 / 1.4 seconds only.
- Scene motion is scroll-scrubbed and fully reversible. Scrolling up undoes it.
- Every motion has a reduced-motion twin. Never skip this.
- The hero build must finish before scrolling unlocks. Do not remove that lock.

## Architecture
- Two persistent full-screen canvases (wireframe and lit). Scenes are pure functions of scroll progress and state.
- GSAP is the only animation library. No Framer Motion. Lenis may be added for smooth scroll, driven from the GSAP ticker.
- No per-section canvases. No remote assets. Fonts self-hosted when the project moves off the CDN.
- Pin dependency versions exactly.

## Performance budget
- 60fps on mid-range desktop, 30fps or better on mid-range phones.
- LCP under 2.5s, initial JavaScript under 300 KB gzipped, heavy 3D code lazy-loaded.
- Pixel ratio capped (1.75 desktop, 1.25 mobile). Pause rendering when the tab is hidden.

## Accessibility
- Full keyboard operation with visible focus. Essential content readable without WebGL or animation.
- Readable contrast on every text and background pairing.

## Process
- For any large change, write an implementation plan first and wait for approval.
- After every visual change, open the page in the browser, record a session and list what looks wrong (timing, clipping, jank) before saying it is done.
- Never invent copy or numbers. Keep placeholders obvious.
