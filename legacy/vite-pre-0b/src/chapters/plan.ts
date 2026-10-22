import { L, W } from '../dom';
import type { Progress } from '../state';
import { plan } from '../tokens/motion';
import { $, clamp } from '../utils';

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
  foot = $('.foot span');
let chap = '';

// prime SVG draw-on
panels.forEach((p) =>
  p.querySelectorAll<SVGPathElement>('.drw path').forEach((a) => {
    a.setAttribute('pathLength', '1');
    a.style.strokeDasharray = '1';
    a.style.strokeDashoffset = '1';
  }),
);

/** Plan / elevation / section panels, canvas crossfade and footer chapter label. */
export function updatePlan({ q, cs: c, q2, bq, cb }: Progress) {
  const on = clamp((q - 0.26) * 7, 0, 1) * (1 - clamp(bq * 10, 0, 1)),
    sm = q2 * q2 * (3 - 2 * q2);
  planEl.style.opacity = String(on);
  planEl.style.visibility = on > 0 ? 'visible' : 'hidden';
  L.style.opacity = String(Math.max(1 - clamp((q - 0.1) / 0.26, 0, 1), cb));
  W.style.opacity = String((1 - 0.78 * sm) * (1 - 0.7 * cb));
  track.style.transform = `translate3d(${-q2 * 200}vw,0,0)`;
  panels.forEach((p, i) => {
    const d = Math.abs(q2 * 2 - i),
      dr = clamp(1.7 - d * 1.25, 0, 1),
      ps = p.querySelectorAll<SVGPathElement>('.drw path');
    ps.forEach((a, k) => {
      a.style.strokeDashoffset = String(1 - clamp(dr * 1.6 - (k / ps.length) * 0.6, 0, 1));
    });
    p.querySelectorAll<SVGTextElement>('.drw text').forEach((a) => {
      a.style.opacity = String(clamp(dr * 2 - 1, 0, 1));
    });
    [...p.querySelector('.txt')!.children].forEach((a, k) => {
      const o = clamp(dr * 1.7 - k * 0.2, 0, 1);
      (a as HTMLElement).style.opacity = String(o);
      (a as HTMLElement).style.transform = `translateY(${(1 - o) * 36}px)`;
    });
    p.querySelector<HTMLElement>('.big')!.style.transform = `translateX(${-(q2 * 2 - i) * 22}vw)`;
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
