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
  addEventListener(
    'pointermove',
    (e) => {
      move(e.clientX, e.clientY);
    },
    { passive: true },
  );
  addEventListener(
    'pointerdown',
    (e) => {
      move(e.clientX, e.clientY);
    },
    { passive: true },
  );
}
