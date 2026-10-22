import type * as THREE_T from 'three';
import { colors } from '../tokens/colors';
import { makePlaster, makeWood, type ThreeNS } from './textures';

export interface Part {
  o: THREE_T.Mesh;
  e: THREE_T.LineSegments | null;
  by: number;
  hh: number;
  flat: boolean;
  ry: number;
}

/** Builds the room (lit scene `sl` + wireframe twin `sw`), lights and dust. Order of parts is significant. */
export function buildRoom(THREE: ThreeNS, sw: THREE_T.Scene, sl: THREE_T.Scene) {
  const lineMat = new THREE.LineBasicMaterial({ color: colors.bone, transparent: true, opacity: 0.5 });
  const wood = makeWood(THREE);
  const plaster = makePlaster(THREE);
  const M = (c: number, r: number, o?: THREE_T.MeshStandardMaterialParameters) =>
    new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r, metalness: 0 }, o || {}));

  const parts: Part[] = [];
  const mk = (
    g: THREE_T.BufferGeometry,
    m: THREE_T.Material,
    x: number,
    y: number,
    z: number,
    ry = 0,
    cast = true,
    wire = true,
  ) => {
    const o = new THREE.Mesh(g, m);
    o.position.set(x, y, z);
    o.rotation.y = ry;
    o.castShadow = cast;
    o.receiveShadow = true;
    sl.add(o);
    let e: THREE_T.LineSegments | null = null;
    if (wire) {
      e = new THREE.LineSegments(new THREE.EdgesGeometry(g, 25), lineMat);
      e.position.copy(o.position);
      e.rotation.copy(o.rotation);
      sw.add(e);
    }
    g.computeBoundingBox();
    parts.push({ o, e, by: y, hh: (g.boundingBox!.max.y - g.boundingBox!.min.y) / 2, flat: !wire, ry });
    return o;
  };
  const B = (a: number, b: number, c: number) => new THREE.BoxGeometry(a, b, c);
  const C = (a: number, b: number, c: number, d: number, e?: number, f?: boolean) =>
    new THREE.CylinderGeometry(a, b, c, d, e, f);

  const fl = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), M(0xffffff, 0.5, { map: wood }));
  fl.rotation.x = -Math.PI / 2;
  fl.receiveShadow = true;
  sl.add(fl);
  const gr = new THREE.GridHelper(8, 16, colors.bone, colors.bone);
  gr.scale.z = 0.75;
  (gr.material as THREE_T.Material).transparent = true;
  (gr.material as THREE_T.Material).opacity = 0.16;
  sw.add(gr);

  const wm = M(0xffffff, 0.95, { map: plaster }),
    dk = M(0x1a1816, 0.5),
    oak = M(0x5b3d28, 0.45),
    lin = M(0x8d8372, 0.95),
    cl = M(0xa95d3c, 0.8),
    pot = M(0xcfc6b6, 0.7),
    leaf = M(0x3f5c3d, 0.9);

  // structure (0..6)
  mk(B(8.4, 3.2, 0.2), wm, 0, 1.6, -3.1);
  mk(B(0.2, 0.9, 6.4), wm, -4.1, 0.45, 0);
  mk(B(0.2, 0.6, 6.4), wm, -4.1, 2.9, 0);
  mk(B(0.2, 1.7, 1.8), wm, -4.1, 1.75, -2.3);
  mk(B(0.2, 1.7, 2.2), wm, -4.1, 1.75, 2.1);
  mk(B(0.06, 1.7, 0.06), dk, -4, 1.75, -0.2);
  mk(B(0.06, 0.05, 2.4), dk, -4, 1.75, -0.2);
  mk(new THREE.PlaneGeometry(2.4, 1.7), new THREE.MeshBasicMaterial({ color: 0xfff1d6 }), -4.4, 1.75, -0.2, Math.PI / 2, false, false);
  const rug = mk(new THREE.PlaneGeometry(3.8, 2.6), M(0x2f3b48, 1), 0.2, 0.012, -0.4, 0, false, false);
  rug.rotation.x = -Math.PI / 2;

  // furniture
  mk(B(3.1, 0.42, 1.05), lin, 0.2, 0.42, -2.3);
  mk(B(3.1, 0.75, 0.28), lin, 0.2, 0.95, -2.7);
  mk(B(0.3, 0.7, 1.05), lin, -1.45, 0.55, -2.3);
  mk(B(0.3, 0.7, 1.05), lin, 1.85, 0.55, -2.3);
  mk(B(1.4, 0.18, 0.8), M(0x9a9080, 0.95), -0.5, 0.72, -2.25);
  mk(B(1.4, 0.18, 0.8), M(0x9a9080, 0.95), 0.9, 0.72, -2.25);
  mk(B(0.5, 0.5, 0.14), cl, 1.3, 1, -2.35, 0.3);
  mk(C(0.75, 0.75, 0.07, 40), oak, 0.2, 0.42, -0.5);
  mk(C(0.12, 0.3, 0.38, 24), dk, 0.2, 0.19, -0.5);
  mk(C(0.22, 0.25, 0.05, 24), dk, -3.1, 0.03, -2.3);
  mk(C(0.02, 0.02, 1.6, 12), dk, -3.1, 0.85, -2.3);
  mk(
    C(0.28, 0.38, 0.42, 28, 1, true),
    M(0xf3dcb4, 0.9, { emissive: 0xffb36a, emissiveIntensity: 0.8, side: THREE.DoubleSide }),
    -3.1,
    1.75,
    -2.3,
    0,
    false,
  );
  mk(C(0.32, 0.25, 0.5, 24), pot, 3.1, 0.25, -2.3);
  [
    [3.1, 1, -2.3, 0.5],
    [3.35, 1.38, -2.2, 0.38],
    [2.85, 1.3, -2.4, 0.34],
  ].forEach((a) => mk(new THREE.IcosahedronGeometry(a[3], 1), leaf, a[0], a[1], a[2]));
  mk(B(1.7, 1.15, 0.05), dk, 1.6, 1.75, -2.95);
  mk(B(1.5, 0.95, 0.02), cl, 1.6, 1.75, -2.92, 0, false, false);
  mk(new THREE.CircleGeometry(0.3, 40), M(0xeadfc8, 0.8), 1.6, 1.8, -2.9, 0, false, false);

  // lights
  const hemi = new THREE.HemisphereLight(0xcfd8ff, 0x6b4a2b, 0.55);
  sl.add(hemi);
  const sun = new THREE.DirectionalLight(0xffd7a0, 2);
  sun.position.set(-9, 5.5, 1.5);
  sun.target.position.set(0, 0, -0.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -7;
  sc.right = 7;
  sc.top = 7;
  sc.bottom = -7;
  sc.near = 1;
  sc.far = 25;
  sun.shadow.bias = -0.0004;
  sl.add(sun, sun.target);
  const lamp = new THREE.PointLight(0xffb36a, 0.9, 7, 2);
  lamp.position.set(-3.1, 1.5, -2.2);
  sl.add(lamp);

  // dust
  const N = 260,
    pa = new Float32Array(N * 3),
    pg = new THREE.BufferGeometry();
  for (let i = 0; i < N; i++) {
    pa[i * 3] = -4 + Math.random() * 8;
    pa[i * 3 + 1] = Math.random() * 3;
    pa[i * 3 + 2] = -3 + Math.random() * 6;
  }
  pg.setAttribute('position', new THREE.BufferAttribute(pa, 3));
  const dust = new THREE.Points(
    pg,
    new THREE.PointsMaterial({
      color: 0xffe2b0,
      size: 0.035,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  sl.add(dust);

  return { parts, fl, gr, hemi, sun, lamp, dust, N, pa, pg };
}
