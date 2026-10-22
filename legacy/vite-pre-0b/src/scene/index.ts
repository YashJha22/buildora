import { W, L } from '../dom';
import { S, st } from '../state';
import { colors } from '../tokens/colors';
import { clamp } from '../utils';
import { placeCamera } from './camera';
import { buildRoom } from './room';
import type { ThreeNS } from './textures';

export interface SceneApi {
  size(): void;
  draw(t: number, e: number, q: number, c: number, q2: number, bq: number, cb: number): void;
}

function create(THREE: ThreeNS): SceneApi | null {
  let rW: InstanceType<ThreeNS['WebGLRenderer']>, rL: InstanceType<ThreeNS['WebGLRenderer']>;
  try {
    rW = new THREE.WebGLRenderer({ canvas: W, antialias: true });
    rL = new THREE.WebGLRenderer({ canvas: L, antialias: true });
  } catch (e) {
    return null;
  }
  rW.setClearColor(colors.ink, 1);
  rL.setClearColor(colors.litClear, 1);
  rL.outputEncoding = THREE.sRGBEncoding;
  rL.toneMapping = THREE.ACESFilmicToneMapping;
  rL.shadowMap.enabled = true;
  rL.shadowMap.type = THREE.PCFSoftShadowMap;
  const sw = new THREE.Scene(),
    sl = new THREE.Scene();
  sl.fog = new THREE.Fog(colors.litClear, 16, 34);
  const cam = new THREE.PerspectiveCamera(38, st.w / st.h, 0.1, 60);

  const { parts, fl, gr, hemi, sun, lamp, dust, N, pa, pg } = buildRoom(THREE, sw, sl);

  const size = () => {
    const d = Math.min(devicePixelRatio || 1, st.w < 700 ? 1.25 : 1.75);
    [rW, rL].forEach((r) => {
      r.setPixelRatio(d);
      r.setSize(st.w, st.h, false);
    });
    cam.aspect = st.w / st.h;
    cam.updateProjectionMatrix();
  };
  size();

  return {
    size,
    draw(t, e, _q, c, q2, bq, cb) {
      const k = (1 - S.intro) * 0.35 + 1,
        a = st.w / st.h < 1 ? 1.45 : 1,
        bt = S.build,
        eo = (v: number) => 1 - Math.pow(1 - v, 3),
        lf = eo(clamp(bt * 2.5, 0, 1)),
        rl = eo(clamp((bt - 0.55) / 0.45, 0, 1));
      fl.scale.set(lf, lf, 1);
      gr.scale.set(lf, 1, 0.75 * lf);
      parts.forEach((p, i) => {
        const s = Math.max(eo(clamp(bt * 1.7 - (i / parts.length) * 0.7, 0, 1)), 0.001),
          ly = i <= 6 ? 0 : i <= 8 ? 1 : 2,
          l0 = ly == 0 ? 1 : eo(clamp((bq - (ly == 1 ? 0.18 : 0.38) - (i - (ly == 1 ? 7 : 9)) * 0.012) / 0.14, 0, 1)),
          dp = (1 - l0) * clamp(bq / 0.04, 0, 1);
        if (p.flat) {
          p.o.scale.setScalar(s);
          p.o.position.y = p.by;
        } else {
          p.o.scale.y = s;
          p.o.position.y = p.by - (1 - s) * p.hh;
        }
        p.o.position.y += dp * 7;
        if (!p.flat) p.o.rotation.y = p.ry + dp * 1.3;
        if (p.e) {
          p.e.scale.copy(p.o.scale);
          p.e.position.copy(p.o.position);
          p.e.rotation.copy(p.o.rotation);
        }
      });
      const dm = clamp(bq / 0.04, 0, 1),
        dw = clamp((bq - 0.78) / 0.2, 0, 1),
        lq = 1 - dm * (1 - dw * dw * (3 - 2 * dw)) * 0.7;
      sun.intensity = 2 * rl * lq;
      hemi.intensity = 0.08 + 0.47 * rl * lq;
      lamp.intensity = (0.9 + Math.sin(t * 3) * 0.03) * rl * lq;
      (dust.material as InstanceType<ThreeNS['PointsMaterial']>).opacity = 0.7 * rl * lq;
      placeCamera(cam, e, c, q2, bq, cb, k, a);
      for (let i = 0; i < N; i++) {
        pa[i * 3 + 1] += 0.0014 * (1 + (i % 3));
        if (pa[i * 3 + 1] > 3) pa[i * 3 + 1] = 0;
        pa[i * 3] += Math.sin(t + i) * 0.0008;
      }
      pg.attributes.position.needsUpdate = true;
      rW.render(sw, cam);
      rL.render(sl, cam);
    },
  };
}

/**
 * Loads Three.js on demand. Resolves to null if the chunk fails to load or WebGL is unavailable;
 * the page then runs without the scene, exactly like the original `window.THREE` guard.
 */
export async function loadScene(): Promise<SceneApi | null> {
  try {
    const THREE = await import('three');
    return create(THREE);
  } catch (err) {
    console.error('[buildora] Failed to load the 3D scene:', err);
    return null;
  }
}
