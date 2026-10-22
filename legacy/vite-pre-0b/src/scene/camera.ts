import type * as THREE_T from 'three';
import { st } from '../state';
import { lerp } from '../utils';

/** Camera path as a pure function of scroll-derived progress (plus pointer parallax). */
export function placeCamera(
  cam: THREE_T.PerspectiveCamera,
  e: number,
  c: number,
  q2: number,
  bq: number,
  cb: number,
  k: number,
  a: number,
) {
  const { mL, nL } = st;
  let px = (lerp(8.2, 3.6, e) + (mL - 0.5) * 2.4) * k * a,
    py = (lerp(4.2, 2, e) - (nL - 0.5) * 1.2) * k,
    pz = lerp(11, 5.6, e) * k * a,
    ax = lerp(0, -0.4, e),
    ay = lerp(1.2, 1.3, e),
    az = lerp(-0.6, -1.2, e);
  const cx = -3.6 + q2 * 3.6;
  const oa = lerp(-0.9, 0.7, bq),
    orr = lerp(10.5, 8.2, bq);
  px = lerp(px, Math.sin(oa) * orr + (mL - 0.5), cb);
  py = lerp(py, lerp(5.4, 3.3, bq), cb);
  pz = lerp(pz, Math.cos(oa) * orr - 0.5, cb);
  ax = lerp(ax, 0, cb);
  ay = lerp(ay, 1.1, cb);
  az = lerp(az, -0.8, cb);
  cam.up.set(0, 1 - c, -c);
  cam.position.set(lerp(px, cx, c), lerp(py, 14, c), lerp(pz, 0.001, c));
  cam.lookAt(lerp(ax, cx, c), lerp(ay, 0, c), lerp(az, 0, c));
}
