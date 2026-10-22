import { S, st, touch } from './state';
import { clamp } from './utils';
import { scroll } from './tokens/motion';

function move(x: number, y: number) {
  st.tx = x;
  st.ty = y;
  st.mx = x / st.w;
  st.my = y / st.h;
  st.last = performance.now() / 1000;
}

export function initInput() {
  addEventListener('pointermove', (e) => {
    if (!touch) move(e.clientX, e.clientY);
  });
  addEventListener(
    'wheel',
    (e) => {
      if (!st.ready) return;
      S.p = clamp(S.p + e.deltaY / scroll.wheelDivisor, 0, scroll.max);
    },
    { passive: true },
  );
  let ty0 = 0;
  addEventListener('touchstart', (e) => {
    ty0 = e.touches[0].clientY;
  });
  addEventListener('touchmove', (e) => {
    if (!st.ready) return;
    const y = e.touches[0].clientY;
    S.p = clamp(S.p + (ty0 - y) / (st.h * scroll.touchDivisor), 0, scroll.max);
    ty0 = y;
  });
  addEventListener('keydown', (e) => {
    if (!st.ready) return;
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) S.p = clamp(S.p + scroll.keyStep, 0, scroll.max);
    if (['ArrowUp', 'PageUp'].includes(e.key)) S.p = clamp(S.p - scroll.keyStep, 0, scroll.max);
  });
}
