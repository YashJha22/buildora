import { L, ring } from '../dom';
import { S, st, type Progress } from '../state';
import { smooth } from '../tokens/motion';
import { $, clamp } from '../utils';

const hero = $('main'),
  cap = $('#cap'),
  prog = $('#prog');

/** Hero: reveal lens (clip-path + ring), headline fade, caption and progress bar. */
export function updateHero({ t, P, e, q }: Progress) {
  const { w, h, R0 } = st;
  st.lr += ((R0 + Math.sin(t * 1.2) * 5) * S.intro + e * Math.hypot(w, h) - st.lr) * smooth.radius;
  const r = Math.max(st.lr, 0);
  L.style.clipPath = `circle(${r.toFixed(1)}px at ${st.lx.toFixed(1)}px ${st.ly.toFixed(1)}px)`;
  ring.style.transform = `translate(${st.lx - R0}px,${st.ly - R0}px) scale(${(r / R0).toFixed(3)})`;
  ring.style.opacity = String(clamp(1 - e * 2.5, 0, 1) * (S.intro > 0.05 ? 1 : 0));
  hero.style.opacity = String(clamp(1 - (P - 0.25) * 2, 0, 1));
  hero.style.transform = `translateY(${-P * 30}px)`;
  cap.style.opacity = String(clamp((P - 0.65) * 3, 0, 1) * (1 - clamp(q * 6, 0, 1)));
  prog.style.transform = `scaleX(${P / 3})`;
}
