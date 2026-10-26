import { sound } from '../audio';
import { L, W } from '../dom';
import { st, type Progress } from '../state';
import { plan } from '../tokens/motion';
import { $, clamp, triggerWordAnimation } from '../utils';
import { animatePlanPanelHeading } from '../typography';

const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * Remaps the plan chapter's linear sideways progress (0..1) so it rests on the three panel
 * centres (0, 0.5, 1). Each rest covers `plan.flat` of the chapter; smoothstep in between.
 */
export function remapSideways(r: number) {
  const f = plan.flat,
    a = f, // end of rest at panel 1
    b = 0.5 - f / 2, // start of rest at panel 2
    c = 0.5 + f / 2, // end of rest at panel 2
    d = 1 - f; // start of rest at panel 3
  if (r <= a) return 0;
  if (r < b) return 0.5 * smoothstep((r - a) / (b - a));
  if (r <= c) return 0.5;
  if (r < d) return 0.5 + 0.5 * smoothstep((r - c) / (d - c));
  return 1;
}

/** Holds chapter progress at 2 (end of the plan) for `plan.hold` before the build chapter starts. */
export const holdAfterPlan = (P: number) => (P <= 2 ? P : P <= 2 + plan.hold ? 2 : P - plan.hold);

const planEl = $('#plan'),
  track = $('.track'),
  panels = [...document.querySelectorAll<HTMLElement>('.panel')],
  foot = $('#foot-status') || $('.foot span');
let chap = '';
let lastPanelIdx = -1;
const panelDrawn = [false, false, false];
const panelSnapped = [false, false, false];
const panelWordsAnimated = [false, false, false];

// prime SVG draw-on
panels.forEach((p) =>
  p.querySelectorAll<SVGPathElement>('.drw path').forEach((a) => {
    a.setAttribute('pathLength', '1');
    a.style.strokeDasharray = '1';
    a.style.strokeDashoffset = '1';
  }),
);

/** Plan / elevation / section panels, canvas crossfade and footer chapter label. */
export function updatePlan({ P, q, cs: c, q2, bq, cb }: Progress) {
  const isMobile = st.w < 768;
  // On mobile: seamlessly cross-fade Plan in as Hero tilts into top-down (P >= 0.55)
  const on = isMobile
    ? (P >= 0.55 && cb < 0.1
        ? clamp((P - 0.55) * 3.5, 0, 1) * (1 - clamp(cb / 0.1, 0, 1))
        : 0)
    : clamp((q - 0.26) * 7, 0, 1) * (1 - clamp(bq * 10, 0, 1)),
    sm = q2 * q2 * (3 - 2 * q2),
    secShow = clamp((q2 - 0.45) / 0.35, 0, 1) * clamp(c * 1.5, 0, 1) * (1 - cb);
  planEl.style.opacity = String(on);
  planEl.style.visibility = on > 0.001 ? 'visible' : 'hidden';
  planEl.style.pointerEvents = on > 0.05 ? 'auto' : 'none';
  L.style.opacity = String(Math.max(1 - clamp((q - 0.1) / 0.26, 0, 1), secShow * 0.78, cb));
  W.style.opacity = String((1 - 0.32 * sm) * (1 - 0.7 * cb));
  if (isMobile) {
    track.style.transform = 'none';
    const op0 = clamp(1 - q2 * 3.5, 0, 1);
    const op1 = clamp(1 - Math.abs(q2 - 0.5) * 4.0, 0, 1);
    const op2 = clamp((q2 - 0.6) * 3.5, 0, 1);
    const ops = [op0, op1, op2];

    panels.forEach((p, i) => {
      const op = ops[i];
      p.style.opacity = op.toFixed(3);
      p.style.visibility = op > 0.01 ? 'visible' : 'hidden';
      p.style.pointerEvents = op > 0.4 ? 'auto' : 'none';
    });
  } else {
    track.style.transform = `translate3d(${-q2 * 200}vw,0,0)`;
    panels.forEach((p) => {
      p.style.visibility = '';
      p.style.opacity = '';
      p.style.pointerEvents = '';
    });
  }

  // Subtle chapter slide sound when transitioning between panels
  if (on > 0.35) {
    const currentPanel = Math.round(q2 * 2);
    if (currentPanel !== lastPanelIdx) {
      if (lastPanelIdx !== -1) {
        sound.playChapterSlide();
      }
      lastPanelIdx = currentPanel;
    }
  }

  panels.forEach((p, i) => {
    const d = Math.abs(q2 * 2 - i),
      dr = clamp(1.7 - d * 1.25, 0, 1),
      ps = p.querySelectorAll<SVGPathElement>('.drw path');

    // Drafting sound as lines sketch on
    if (on > 0.25) {
      if (dr > 0.42 && !panelDrawn[i]) {
        panelDrawn[i] = true;
        sound.playDraftingStroke();
      } else if (dr < 0.2) {
        panelDrawn[i] = false;
      }

      // Measurement snap tick when dimensions appear
      if (dr > 0.72 && !panelSnapped[i]) {
        panelSnapped[i] = true;
        sound.playMeasureSnap(i === 1 ? 2100 : 1850);
      } else if (dr < 0.4) {
        panelSnapped[i] = false;
      }

      // Heading kinetic drafting construction when panel enters
      if (dr > 0.38 && !panelWordsAnimated[i]) {
        panelWordsAnimated[i] = true;
        animatePlanPanelHeading(i, p);
      } else if (dr < 0.15) {
        panelWordsAnimated[i] = false;
        const h2El = p.querySelector<HTMLElement>('h2');
        if (h2El) delete h2El.dataset.animated;
      }
    }

    ps.forEach((a, k) => {
      a.style.strokeDashoffset = String(1 - clamp(dr * 1.6 - (k / ps.length) * 0.6, 0, 1));
    });
    p.querySelectorAll<SVGTextElement>('.drw text').forEach((a) => {
      a.style.opacity = String(clamp(dr * 2 - 1, 0, 1));
    });
    const txtEl = p.querySelector<HTMLElement>('.txt');
    if (txtEl && !isMobile) {
      const eyebrow = txtEl.querySelector<HTMLElement>('.eyebrow');
      if (eyebrow) {
        const eo = clamp(dr * 1.95 - 0.05, 0, 1);
        const ey = (1 - eo) * 14;
        eyebrow.style.opacity = String(eo);
        eyebrow.style.transform = `translateY(${ey.toFixed(1)}px)`;
      }
      const h2 = txtEl.querySelector<HTMLHeadingElement>('h2');
      if (h2) {
        const h2o = clamp(dr * 1.82 - 0.1, 0, 1);
        const h2y = (1 - h2o) * 26;
        const h2b = (1 - h2o) * 6;
        h2.style.opacity = String(h2o);
        h2.style.transform = `translateY(${h2y.toFixed(1)}px)`;
        h2.style.filter = h2b > 0.15 ? `blur(${h2b.toFixed(1)}px)` : 'none';
      }
      const desc = txtEl.querySelector<HTMLParagraphElement>('p:not(.eyebrow)');
      if (desc) {
        const po = clamp(dr * 1.65 - 0.18, 0, 1);
        const py = (1 - po) * 20;
        const pb = (1 - po) * 4;
        desc.style.opacity = String(po * 0.85);
        desc.style.transform = `translateY(${py.toFixed(1)}px)`;
        desc.style.filter = pb > 0.15 ? `blur(${pb.toFixed(1)}px)` : 'none';
      }
      const dl = txtEl.querySelector<HTMLElement>('dl');
      if (dl) {
        const dlo = clamp(dr * 1.5 - 0.25, 0, 1);
        const dly = (1 - dlo) * 18;
        dl.style.opacity = String(dlo);
        dl.style.transform = `translateY(${dly.toFixed(1)}px)`;
      }
      const cta = txtEl.querySelector<HTMLElement>('.cta');
      if (cta) {
        const ctao = clamp(dr * 1.6 - 0.2, 0, 1);
        const ctay = (1 - ctao) * 18;
        cta.style.opacity = String(ctao);
        cta.style.transform = `translateY(${ctay.toFixed(1)}px)`;
        cta.style.pointerEvents = ctao > 0.4 ? 'auto' : 'none';
      }
    }
    const big = p.querySelector<HTMLElement>('.big');
    if (big) {
      big.style.transform = `translateX(${-(q2 * 2 - i) * 22}vw)`;
      big.style.opacity = String(clamp(1.2 - d * 0.9, 0, 0.22));
    }
  });
  const n =
    bq > 0.1
      ? '03 — The build'
      : c < 0.5
        ? 'Scroll to explore'
        : q2 < 0.25
          ? '01 — The plan'
          : q2 < 0.75
            ? '02 — The elevation'
            : '03 — The section';
  if (n !== chap) {
    chap = n;
    foot.textContent = n;
  }
}
