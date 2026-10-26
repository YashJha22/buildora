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
  const isMobile = st.w < 768;
  const oa = lerp(-0.9, 0.7, bq);
  const mobileScale = isMobile ? 1.06 : 1.0;
  const orr = lerp(10.5, 8.2, bq) * (1 + (a - 1) * 0.25) * mobileScale;
  px = lerp(px, Math.sin(oa) * orr + (mL - 0.5), cb);
  py = lerp(py, lerp(isMobile ? 4.5 : 5.4, isMobile ? 3.0 : 3.3, bq) * (1 + (a - 1) * 0.18), cb);
  pz = lerp(pz, Math.cos(oa) * orr - 0.5, cb);
  ax = lerp(ax, 0, cb);
  ay = lerp(ay, isMobile ? 1.05 : 1.1, cb);
  az = lerp(az, -0.8, cb);

  if (classic) {
    cam.up.set(0, 1 - c, -c);
    cam.position.set(lerp(px, cx, c), lerp(py, 14 * a, c), lerp(pz, 0.001, c));
    cam.lookAt(lerp(ax, cx, c), lerp(ay, 0, c), lerp(az, 0, c));
    return;
  }

  // In 0B mode: q2=0 is top-down Plan; q2=0.5 tilts into Elevation; q2=1.0 frames the 3D Laser Section Cut.
  const elevBlend = clamp((q2 - 0.15) / 0.35, 0, 1) * c;
  const secBlend = clamp((q2 - 0.5) / 0.5, 0, 1) * c;
  let deskCamX = -3.32, deskCamY = 1.41, deskCamZ = 17.27;
  if (!isMobile) {
    const W = st.w, H = st.h;
    const txtWidth = Math.min(430, W * 0.36);
    const pad = Math.max(20, Math.min(96, W * 0.06));
    const gap = W * 0.05;
    const drwLeft = pad + txtWidth + gap;
    const availW = Math.max(200, W - drwLeft - pad);
    const drwW = Math.min(780, Math.min(availW, W * 0.52));
    const drwH = drwW * (400 / 640);
    const drwTop = (H - drwH) * 0.5;

    const boxLeft = drwLeft + drwW * (70 / 640);
    const boxRight = drwLeft + drwW * (570 / 640);
    const boxTop = drwTop + drwH * (88 / 400);
    const boxBottom = drwTop + drwH * (288 / 400);
    const boxHeight = boxBottom - boxTop;
    const boxCenterX = (boxLeft + boxRight) * 0.5;
    const boxCenterY = (boxTop + boxBottom) * 0.5;

    const ndcCenterX = (boxCenterX / W) * 2 - 1;
    const ndcCenterY = -(boxCenterY / H) * 2 + 1;
    const ndcHeight = (boxHeight / H) * 2;

    const visHeight = 6.4 / ndcHeight;
    const D = visHeight / (2 * Math.tan((38 * Math.PI) / 360));
    const visWidth = visHeight * (W / H);
    deskCamX = -(ndcCenterX * visWidth * 0.5);
    deskCamY = 1.6 - (ndcCenterY * visHeight * 0.5);
    deskCamZ = -0.6 + D;
  }

  const planY = isMobile
    ? lerp(16 * a, lerp(3.2, 2.5, secBlend) * a, elevBlend)
    : lerp(14 * a, deskCamY, elevBlend);
  const planZ = isMobile
    ? lerp(0.001, lerp(10.5, 12.0, secBlend) * a, elevBlend)
    : lerp(0.001, deskCamZ, elevBlend);
  // On desktop: room aligns with .drw SVG blueprint frame. On mobile: room is horizontally centered.
  const planX = isMobile ? 0 : lerp(cx, deskCamX, elevBlend);
  const lookY = isMobile
    ? lerp(0, lerp(0.6, 0.3, secBlend), elevBlend)
    : lerp(0, deskCamY, elevBlend);
  const lookZ = isMobile ? lerp(0, -0.7, elevBlend) : lerp(0, -0.6, elevBlend);
  const upAmt = c * (1 - elevBlend);

  cam.up.set(0, 1 - upAmt, -upAmt);
  cam.position.set(lerp(px, planX, c), lerp(py, planY, c), lerp(pz, planZ, c));
  cam.lookAt(lerp(ax, planX, c), lerp(ay, lookY, c), lerp(az, lookZ, c));

  // On mobile: allow the 3D room to occupy the entire viewport naturally with full-bleed freedom.
  if (cam.view && cam.view.enabled) {
    cam.clearViewOffset();
  }
}
