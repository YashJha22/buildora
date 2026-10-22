import type * as THREE_T from 'three';
import { classic, st } from '../state';
import { clamp, lerp } from '../utils';

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
    orr = lerp(10.5, 8.2, bq) * (1 + (a - 1) * 0.38);
  px = lerp(px, Math.sin(oa) * orr + (mL - 0.5), cb);
  py = lerp(py, lerp(5.4, 3.3, bq) * (1 + (a - 1) * 0.22), cb);
  pz = lerp(pz, Math.cos(oa) * orr - 0.5, cb);
  ax = lerp(ax, 0, cb);
  ay = lerp(ay, 1.1, cb);
  az = lerp(az, -0.8, cb);

  if (classic) {
    cam.up.set(0, 1 - c, -c);
    cam.position.set(lerp(px, cx, c), lerp(py, 14 * a, c), lerp(pz, 0.001, c));
    cam.lookAt(lerp(ax, cx, c), lerp(ay, 0, c), lerp(az, 0, c));
    return;
  }

  // In 0B mode: q2=0 is top-down Plan; q2=0.5 tilts into Elevation; q2=1.0 frames the 3D Laser Section Cut.
  const isMobile = st.w < 768;
  const elevBlend = clamp((q2 - 0.15) / 0.35, 0, 1) * c;
  const secBlend = clamp((q2 - 0.5) / 0.5, 0, 1) * c;
  const planY = isMobile
    ? lerp(14 * a, lerp(3.6, 2.7, secBlend) * a, elevBlend)
    : lerp(14 * a, lerp(3.4, 3.25, secBlend) * (1 + (a - 1) * 0.4), elevBlend);
  const planZ = isMobile
    ? lerp(0.001, lerp(12.0, 13.5, secBlend) * a, elevBlend)
    : lerp(0.001, lerp(10.2, 10.4, secBlend) * (1 + (a - 1) * 0.35), elevBlend);
  // On desktop: room is on the right (-2.8). On mobile: room is horizontally centered (0) in the bottom half.
  const planX = isMobile ? lerp(cx, 0, elevBlend) : lerp(cx, -2.8, elevBlend);
  const lookY = isMobile
    ? lerp(0, lerp(0.8, 0.4, secBlend), elevBlend)
    : lerp(0, lerp(1.35, 1.4, secBlend), elevBlend);
  const lookZ = lerp(0, -0.9, elevBlend);
  const upAmt = c * (1 - elevBlend);

  cam.up.set(0, 1 - upAmt, -upAmt);
  cam.position.set(lerp(px, planX, c), lerp(py, planY, c), lerp(pz, planZ, c));
  cam.lookAt(lerp(ax, planX, c), lerp(ay, lookY, c), lerp(az, lookZ, c));
}
