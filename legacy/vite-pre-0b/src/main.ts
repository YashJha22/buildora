import { updateChapters } from './chapters';
import { holdAfterPlan, remapSideways } from './chapters/plan';
import { ring } from './dom';
import { initInput } from './input';
import { startIntro } from './intro';
import { loadScene, type SceneApi } from './scene';
import { S, st, reduce, touch, type Progress } from './state';
import { idle, scroll, smooth } from './tokens/motion';
import { clamp } from './utils';

// Three.js is loaded lazily; until it resolves `gl` is null and frames skip drawing (like the original no-WebGL path).
let gl: SceneApi | null = null;

function layout() {
  st.w = innerWidth;
  st.h = innerHeight;
  st.R0 = Math.min(st.w, st.h) * 0.38;
  ring.style.width = ring.style.height = st.R0 * 2 + 'px';
  gl && gl.size();
}
addEventListener('resize', layout);
layout();

loadScene().then((api) => {
  gl = api;
  if (gl) gl.size();
});

initInput();

function frame(ms: number) {
  const t = ms * 0.001,
    isIdle = reduce || touch || t - st.last > idle.after;
  if (isIdle) {
    st.tx = st.w * (0.66 + 0.06 * Math.sin(t * 0.5));
    st.ty = st.h * (0.5 + 0.05 * Math.cos(t * 0.7));
  }
  st.lx += (st.tx - st.lx) * smooth.lens;
  st.ly += (st.ty - st.ly) * smooth.lens;
  st.P += (Math.max(0, S.p - scroll.lead) * scroll.span - st.P) * smooth.progress;
  st.mL += (st.mx - st.mL) * smooth.tilt;
  st.nL += (st.my - st.nL) * smooth.tilt;
  const P = holdAfterPlan(st.P),
    P1 = Math.min(P, 1),
    e = P1 * P1 * (3 - 2 * P1),
    q = clamp(P - 1, 0, 1),
    c0 = clamp(q / 0.3, 0, 1),
    cs = c0 * c0 * (3 - 2 * c0),
    q2 = remapSideways(clamp((q - 0.3) / 0.7, 0, 1)),
    bq = clamp(P - 2, 0, 1),
    cb0 = clamp(bq / 0.15, 0, 1),
    cb = cb0 * cb0 * (3 - 2 * cb0);
  const p: Progress = { t, P, e, q, cs, q2, bq, cb };
  updateChapters(p);
  gl && gl.draw(t, e, q, cs * (1 - cb), q2, bq, cb);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

startIntro();
