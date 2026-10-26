import type * as THREE_T from 'three';
import type { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { MaterialSoundType } from '../audio';
import { colors } from '../tokens/colors';
import type { Front } from './front';
import { makeSketchSystem } from './sketch';
import { PALETTES, makePlaster, makeWood, type ThreeNS } from './textures';

export interface CadInfo {
  code: string;
  name: string;
  dims: string;
  material: string;
  elev: string;
}

export interface Part {
  o: THREE_T.Mesh;
  e: THREE_T.LineSegments | null;
  w: THREE_T.Mesh | null;
  drawAt: number;
  by: number;
  hh: number;
  flat: boolean;
  ry: number;
  soundType?: MaterialSoundType;
}

/** Builds the room (lit scene `sl` + progressive sketch twin `sw`), volumetric light shafts, lights and dust. */
export function buildRoom(
  THREE: ThreeNS,
  sw: THREE_T.Scene,
  sl: THREE_T.Scene,
  front: Front | null = null,
  RoundedBoxGeo?: typeof RoundedBoxGeometry,
) {
  const isFront = front !== null;
  const sketch = makeSketchSystem(THREE, front);
  const { lineMat, gridMat, guideMat } = sketch;

  const sketchMat = sketch.patchSketchSurface(
    new THREE.MeshBasicMaterial({
      color: colors.bone,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }),
  );
  const wood = makeWood(THREE);
  const plaster = makePlaster(THREE);
  const M = (c: number, r: number, o?: THREE_T.MeshStandardMaterialParameters) => {
    const mat = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r, metalness: 0 }, o || {}));
    if (front) front.patch(mat);
    return mat;
  };

  const parts: Part[] = [];
  const raycastTargets: THREE_T.Mesh[] = [];

  const tagCad = (mesh: THREE_T.Mesh, cad: CadInfo) => {
    mesh.userData.cad = cad;
    raycastTargets.push(mesh);
  };

  const mk = (
    g: THREE_T.BufferGeometry,
    m: THREE_T.Material,
    x: number,
    y: number,
    z: number,
    ry = 0,
    cast = true,
    wire = true,
    tStart = 0.3,
    tEnd = 0.6,
    sketchEdgeOverride?: THREE_T.BufferGeometry | false,
    rotX = 0,
    cad?: CadInfo,
    soundType: MaterialSoundType = 'wood',
  ) => {
    if (front) front.patch(m);
    const o = new THREE.Mesh(g, m);
    o.position.set(x, y, z);
    o.rotation.set(rotX, ry, 0);
    o.castShadow = cast;
    o.receiveShadow = true;
    if (cad) tagCad(o, cad);
    sl.add(o);
    let e: THREE_T.LineSegments | null = null;
    let w: THREE_T.Mesh | null = null;
    const wantEdges = !isFront ? wire : sketchEdgeOverride === false ? false : wire || sketchEdgeOverride !== undefined;
    if (wantEdges) {
      const rawEdges = new THREE.EdgesGeometry(sketchEdgeOverride || g, 15);
      e = sketch.makeLineSegments(rawEdges, o.position, rotX, ry, tStart, tEnd, lineMat);
      sw.add(e);
    }
    if (isFront && wire) {
      w = new THREE.Mesh(g, sketchMat);
      w.position.copy(o.position);
      w.rotation.copy(o.rotation);
      sw.add(w);
    }
    g.computeBoundingBox();
    parts.push({
      o,
      e,
      w,
      drawAt: (tStart + tEnd) * 0.5,
      by: y,
      hh: (g.boundingBox!.max.y - g.boundingBox!.min.y) / 2,
      flat: !wire,
      ry,
      soundType,
    });
    return o;
  };
  const B = (a: number, b: number, c: number) => new THREE.BoxGeometry(a, b, c);
  const RB = (w: number, h: number, d: number, seg = 4, r = 0.04) =>
    RoundedBoxGeo ? new RoundedBoxGeo(w, h, d, seg, r) : new THREE.BoxGeometry(w, h, d);
  const makeBevelBox = (w: number, h: number, d: number, r = 0.04, seg = 4) => ({
    mesh: RB(w, h, d, seg, r),
    edge: B(w, h, d),
  });
  const mkBevel = (
    w: number,
    h: number,
    d: number,
    r: number,
    seg: number,
    m: THREE_T.Material,
    x: number,
    y: number,
    z: number,
    ry: number,
    tStart: number,
    tEnd: number,
    cad?: CadInfo,
    soundType: MaterialSoundType = 'wood',
  ) => {
    const box = makeBevelBox(w, h, d, r, seg);
    return mk(box.mesh, m, x, y, z, ry, true, true, tStart, tEnd, box.edge, 0, cad, soundType);
  };
  const C = (a: number, b: number, c: number, d: number, e?: number, f?: boolean) =>
    new THREE.CylinderGeometry(a, b, c, d, e, f);

  // 1. Construction guides ([0.01, 0.22])
  const guides = isFront ? sketch.buildGuides(sw) : null;

  // 2. Floor ([0.14, 0.38])
  const flGeo = new THREE.PlaneGeometry(8, 6);
  const flMat = M(0xffffff, 0.44, { map: wood });
  const fl = new THREE.Mesh(flGeo, flMat);
  fl.rotation.x = -Math.PI / 2;
  fl.receiveShadow = true;
  tagCad(fl, {
    code: 'EL-01',
    name: 'Wide-Plank Timber Floor',
    dims: '8.00 × 6.00 M',
    material: 'Quarter-Sawn Nordic Oak',
    elev: '±0.00 M',
  });
  sl.add(fl);

  let flW: THREE_T.Mesh | null = null;
  let flEdge: THREE_T.LineSegments | null = null;
  if (isFront) {
    flW = new THREE.Mesh(flGeo, sketchMat);
    flW.rotation.x = -Math.PI / 2;
    sw.add(flW);
    flEdge = sketch.makeLineSegments(
      new THREE.EdgesGeometry(flGeo, 15),
      new THREE.Vector3(0, 0, 0),
      -Math.PI / 2,
      0,
      0.14,
      0.3,
      lineMat,
    );
    sw.add(flEdge);
  }

  const gr = sketch.buildFloorGrid(sw);

  // 3. Clean outer left-wall ([0.30, 0.46]) + window aperture reveal ([0.48, 0.62])
  if (isFront) {
    const leftWallOutline = sketch.makeLineSegments(
      new THREE.EdgesGeometry(B(0.2, 3.2, 6.4), 15),
      new THREE.Vector3(-4.1, 1.6, 0),
      0,
      0,
      0.3,
      0.46,
      lineMat,
    );
    sw.add(leftWallOutline);
    const winRevealOutline = sketch.makeLineSegments(
      new THREE.EdgesGeometry(B(0.2, 1.7, 2.4), 15),
      new THREE.Vector3(-4.1, 1.75, -0.2),
      0,
      0,
      0.48,
      0.62,
      lineMat,
    );
    sw.add(winRevealOutline);
  }

  const wm = M(0xffffff, 0.9, { map: plaster }),
    dk = M(0x1a1816, 0.32, { metalness: 0.65 }),
    oak = M(0x5b3d28, 0.36),
    lin = M(0x8d8372, 0.92),
    cushMat = M(0x9a9080, 0.95),
    cl = M(0xa95d3c, 0.78),
    pot = M(0xcfc6b6, 0.58),
    leaf = M(0x3f5c3d, 0.84),
    rugMat = M(0x2f3b48, 0.98);

  const wallCad: CadInfo = {
    code: 'EL-02',
    name: 'Load-Bearing Perimeter Wall',
    dims: '8.40 × 3.20 × 0.20 M',
    material: 'Hand-Trowelled Mineral Plaster',
    elev: '+3.20 M',
  };
  const winCad: CadInfo = {
    code: 'EL-03',
    name: 'Casement Window Aperture',
    dims: '2.40 × 1.70 M (Sill +0.90 M)',
    material: 'Blackened Steel Mullions',
    elev: '+0.90 M',
  };

  // 3 & 4. Structure: walls ([0.34, 0.52]) & window mullions ([0.54, 0.68])
  mk(B(8.4, 3.2, 0.2), wm, 0, 1.6, -3.1, 0, true, true, 0.34, 0.52, undefined, 0, wallCad);
  mk(B(0.2, 0.9, 6.4), wm, -4.1, 0.45, 0, 0, true, true, 0.32, 0.46, false, 0, wallCad);
  mk(B(0.2, 0.6, 6.4), wm, -4.1, 2.9, 0, 0, true, true, 0.36, 0.48, false, 0, wallCad);
  mk(B(0.2, 1.7, 1.8), wm, -4.1, 1.75, -2.3, 0, true, true, 0.34, 0.48, false, 0, wallCad);
  mk(B(0.2, 1.7, 2.2), wm, -4.1, 1.75, 2.1, 0, true, true, 0.34, 0.48, false, 0, wallCad);

  // Architectural window sill ledge & blackened steel mullions
  const sillBox = makeBevelBox(0.28, 0.05, 2.44, 0.012, 3);
  mk(sillBox.mesh, oak, -4.06, 0.9, -0.2, 0, true, true, 0.52, 0.64, sillBox.edge, 0, winCad);
  mk(B(0.06, 1.7, 0.06), dk, -4, 1.75, -0.2, 0, true, true, 0.54, 0.66, undefined, 0, winCad);
  mk(B(0.06, 0.05, 2.4), dk, -4, 1.75, -0.2, 0, true, true, 0.56, 0.68, undefined, 0, winCad);
  // Window pane sky aperture gradient (zenith atmosphere down to warm horizon)
  const skyCan = document.createElement('canvas');
  skyCan.width = 64;
  skyCan.height = 128;
  const sCtxSky = skyCan.getContext('2d')!;
  const sGrad = sCtxSky.createLinearGradient(0, 128, 0, 0);
  sGrad.addColorStop(0, '#ffffff'); // Horizon glow
  sGrad.addColorStop(0.48, '#eae5dc');
  sGrad.addColorStop(1, '#c0cbd8'); // Zenith atmospheric tint
  sCtxSky.fillStyle = sGrad;
  sCtxSky.fillRect(0, 0, 64, 128);
  const skyTex = new THREE.CanvasTexture(skyCan);
  const winPaneMat = new THREE.MeshBasicMaterial({ color: 0xfff1d6, map: skyTex });
  mk(new THREE.PlaneGeometry(3.2, 2.2), winPaneMat, -4.4, 1.75, -0.2, Math.PI / 2, false, false, 0.58, 0.68, undefined, 0, winCad);

  // 5. Furniture, rug, lamp, plant & art ([0.62, 0.99])
  const rugGeo = new THREE.PlaneGeometry(3.8, 2.6);
  mk(rugGeo, rugMat, 0.2, 0.012, -0.4, 0, false, false, 0.62, 0.72, rugGeo, -Math.PI / 2, {
    code: 'EL-04',
    name: 'Flatweave Architectural Rug',
    dims: '3.80 × 2.60 M',
    material: 'Hand-Loomed Slate Wool',
    elev: '+0.01 M',
  });

  // Grounding soft contact shadows under furniture (alpha fade to floor)
  const shadowCan = document.createElement('canvas');
  shadowCan.width = shadowCan.height = 128;
  const sCtx2 = shadowCan.getContext('2d')!;
  const rGrad = sCtx2.createRadialGradient(64, 64, 8, 64, 64, 64);
  rGrad.addColorStop(0, 'rgba(10, 9, 8, 0.48)');
  rGrad.addColorStop(0.55, 'rgba(10, 9, 8, 0.22)');
  rGrad.addColorStop(1, 'rgba(10, 9, 8, 0)');
  sCtx2.fillStyle = rGrad;
  sCtx2.fillRect(0, 0, 128, 128);
  const contactTex = new THREE.CanvasTexture(shadowCan);

  const contactMat = new THREE.MeshBasicMaterial({
    map: contactTex,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  if (front) front.patch(contactMat);

  const sofaShadow = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.6), contactMat);
  sofaShadow.rotation.x = -Math.PI / 2;
  sofaShadow.position.set(0.2, 0.015, -2.3);
  sl.add(sofaShadow);

  const tableShadow = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), contactMat);
  tableShadow.rotation.x = -Math.PI / 2;
  tableShadow.position.set(0.2, 0.015, -0.5);
  sl.add(tableShadow);

  const lampShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), contactMat);
  lampShadow.rotation.x = -Math.PI / 2;
  lampShadow.position.set(-3.1, 0.015, -2.3);
  sl.add(lampShadow);

  const plantShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), contactMat);
  plantShadow.rotation.x = -Math.PI / 2;
  plantShadow.position.set(3.1, 0.015, -2.3);
  sl.add(plantShadow);

  // Sofa & cushions ([0.66, 0.85])
  const sofaCad: CadInfo = {
    code: 'EL-05',
    name: 'Modular Low-Profile Sofa',
    dims: '3.10 × 1.05 × 0.75 M',
    material: 'Belgian Oatmeal Bouclé',
    elev: '+0.75 M',
  };
  mkBevel(3.1, 0.42, 1.05, 0.04, 4, lin, 0.2, 0.42, -2.3, 0, 0.66, 0.75, sofaCad, 'sofa');
  mkBevel(3.1, 0.75, 0.28, 0.04, 4, lin, 0.2, 0.95, -2.7, 0, 0.69, 0.78, sofaCad, 'sofa');
  mkBevel(0.3, 0.7, 1.05, 0.04, 4, lin, -1.45, 0.55, -2.3, 0, 0.71, 0.79, sofaCad, 'sofa');
  mkBevel(0.3, 0.7, 1.05, 0.04, 4, lin, 1.85, 0.55, -2.3, 0, 0.73, 0.81, sofaCad, 'sofa');
  mkBevel(1.4, 0.18, 0.8, 0.04, 4, cushMat, -0.5, 0.72, -2.25, 0, 0.74, 0.82, sofaCad, 'cushion');
  mkBevel(1.4, 0.18, 0.8, 0.04, 4, cushMat, 0.9, 0.72, -2.25, 0, 0.76, 0.83, sofaCad, 'cushion');
  mkBevel(0.5, 0.5, 0.14, 0.05, 4, cl, 1.3, 1, -2.35, 0.3, 0.78, 0.85, sofaCad, 'cushion');

  // Coffee table + architectural monograph book stack & ceramic vessel ([0.78, 0.89])
  const tableCad: CadInfo = {
    code: 'EL-06',
    name: 'Pedestal Coffee Table',
    dims: 'Ø 1.50 × 0.42 M',
    material: 'Turned Oak & Blackened Steel',
    elev: '+0.42 M',
  };
  mk(C(0.75, 0.75, 0.07, 40), oak, 0.2, 0.42, -0.5, 0, true, true, 0.8, 0.88, undefined, 0, tableCad, 'wood');
  mk(C(0.12, 0.3, 0.38, 24), dk, 0.2, 0.19, -0.5, 0, true, true, 0.78, 0.85, undefined, 0, tableCad, 'wood');
  const bookBox = makeBevelBox(0.36, 0.045, 0.26, 0.01, 3);
  mk(bookBox.mesh, pot, -0.02, 0.478, -0.46, 0.22, true, true, 0.82, 0.89, bookBox.edge, 0, tableCad, 'ceramic');
  mk(C(0.08, 0.06, 0.16, 20), cl, 0.42, 0.535, -0.54, 0, true, true, 0.83, 0.89, undefined, 0, tableCad, 'ceramic');

  // Floor lamp ([0.82, 0.92])
  const lampCad: CadInfo = {
    code: 'EL-07',
    name: 'Atelier Column Floor Lamp',
    dims: 'Ø 0.38 × 1.96 M',
    material: 'Brushed Steel & Warm Parchment',
    elev: '+1.96 M',
  };
  mk(C(0.22, 0.25, 0.05, 24), dk, -3.1, 0.03, -2.3, 0, true, true, 0.82, 0.88, undefined, 0, lampCad, 'metal');
  mk(C(0.02, 0.02, 1.6, 12), dk, -3.1, 0.85, -2.3, 0, true, true, 0.84, 0.9, undefined, 0, lampCad, 'metal');
  const lampShadeMat = M(0xf7f3ed, 0.9, { emissive: 0xdfba73, emissiveIntensity: 0.85, side: THREE.DoubleSide });
  mk(C(0.28, 0.38, 0.42, 28, 1, true), lampShadeMat, -3.1, 1.75, -2.3, 0, false, true, 0.86, 0.92, undefined, 0, lampCad, 'metal');

  // Plant ([0.86, 0.96])
  const plantCad: CadInfo = {
    code: 'EL-08',
    name: 'Sculpted Ficus & Planter',
    dims: 'Ø 0.64 × 1.75 M',
    material: 'Fluted Stoneware & Foliage',
    elev: '+1.75 M',
  };
  mk(C(0.32, 0.25, 0.5, 24), pot, 3.1, 0.25, -2.3, 0, true, true, 0.86, 0.92, undefined, 0, plantCad, 'ceramic');
  [
    [3.1, 1, -2.3, 0.5],
    [3.35, 1.38, -2.2, 0.38],
    [2.85, 1.3, -2.4, 0.34],
  ].forEach((a, idx) =>
    mk(
      new THREE.IcosahedronGeometry(a[3], 1),
      leaf,
      a[0],
      a[1],
      a[2],
      0,
      true,
      true,
      0.88 + idx * 0.015,
      0.96,
      undefined,
      0,
      plantCad,
    ),
  );

  // Framed wall art ([0.90, 0.99])
  const artCad: CadInfo = {
    code: 'EL-09',
    name: 'Framed Relief Study No. 04',
    dims: '1.70 × 1.15 M',
    material: 'Terracotta Ground & Bone Disc',
    elev: '+1.75 M',
  };
  const frameBox = makeBevelBox(1.7, 1.15, 0.05, 0.015, 3);
  mk(frameBox.mesh, dk, 1.6, 1.75, -2.95, 0, true, true, 0.9, 0.96, frameBox.edge, 0, artCad);
  const artInner = B(1.5, 0.95, 0.02);
  mk(artInner, cl, 1.6, 1.75, -2.92, 0, false, false, 0.92, 0.98, artInner, 0, artCad);
  const artCircle = new THREE.CircleGeometry(0.3, 40);
  mk(artCircle, M(0xeadfc8, 0.8), 1.6, 1.8, -2.9, 0, false, false, 0.94, 0.99, artCircle, 0, artCad);

  // Volumetric window light-shaft (anchored directly to the window frame: X=-4.0, Y=1.75, Z=-0.20)
  // Window aperture dimensions: Width=2.40m (along Z), Height=1.70m (from Sill Y=0.90m to Lintel Y=2.60m)
  const shaftCan = document.createElement('canvas');
  shaftCan.width = 256;
  shaftCan.height = 128;
  const sCtx = shaftCan.getContext('2d')!;
  const imgData = sCtx.createImageData(256, 128);
  const data = imgData.data;

  // Generate smooth horizontal distance falloff and soft vertical edge feathering
  for (let y = 0; y < 128; y++) {
    const v = y / 127;
    const vFeather = Math.sin(v * Math.PI);
    const vFactor = Math.pow(vFeather, 0.62); // gentle edge falloff to avoid razor cuts

    for (let x = 0; x < 256; x++) {
      const u = x / 255;
      const uFalloff = Math.pow(1 - u, 1.35); // luminous near window, soft falloff across room
      const alpha = Math.min(255, Math.floor(uFalloff * vFactor * 135));

      const idx = (y * 256 + x) * 4;
      data[idx] = 255;     // R
      data[idx + 1] = 238; // G
      data[idx + 2] = 205; // B
      data[idx + 3] = alpha;
    }
  }
  sCtx.putImageData(imgData, 0, 0);
  const shaftTex = new THREE.CanvasTexture(shaftCan);

  const shaftMat = new THREE.MeshBasicMaterial({
    map: shaftTex,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: isFront ? THREE.CustomBlending : THREE.AdditiveBlending,
  });
  if (front) {
    shaftMat.blendSrc = THREE.SrcAlphaFactor;
    shaftMat.blendDst = THREE.OneFactor;
    shaftMat.blendSrcAlpha = THREE.ZeroFactor;
    shaftMat.blendDstAlpha = THREE.OneFactor;
    front.patch(shaftMat);
  }

  // Anchor Group placed exactly at window aperture center
  const lightShaft = new THREE.Group();
  lightShaft.position.set(-4.0, 1.75, -0.2);

  const BEAM_LEN = 6.2;
  const WIN_H = 1.66;
  const WIN_W = 2.36;

  // 1. Central vertical plane (height matches window reveal 1.66m)
  const gVert = new THREE.PlaneGeometry(BEAM_LEN, WIN_H);
  gVert.translate(BEAM_LEN / 2, 0, 0);
  const mVert = new THREE.Mesh(gVert, shaftMat);

  // 2. Central horizontal plane (width matches window reveal 2.36m)
  const gHoriz = new THREE.PlaneGeometry(BEAM_LEN, WIN_W);
  gHoriz.rotateX(Math.PI / 2);
  gHoriz.translate(BEAM_LEN / 2, 0, 0);
  const mHoriz = new THREE.Mesh(gHoriz, shaftMat);

  // 3. Top boundary sheet (anchored to top of window frame at Y = +WIN_H/2)
  const gTop = new THREE.PlaneGeometry(BEAM_LEN, WIN_W);
  gTop.rotateX(Math.PI / 2);
  gTop.translate(BEAM_LEN / 2, WIN_H * 0.48, 0);
  const mTop = new THREE.Mesh(gTop, shaftMat);

  // 4. Bottom boundary sheet (anchored to window sill at Y = -WIN_H/2)
  const gBot = new THREE.PlaneGeometry(BEAM_LEN, WIN_W);
  gBot.rotateX(Math.PI / 2);
  gBot.translate(BEAM_LEN / 2, -WIN_H * 0.48, 0);
  const mBot = new THREE.Mesh(gBot, shaftMat);

  // 5 & 6. Crossed internal diagonal slices for rich volumetric fullness from any camera perspective
  const gDiag1 = new THREE.PlaneGeometry(BEAM_LEN, WIN_H * 1.15);
  gDiag1.rotateX(Math.PI / 4);
  gDiag1.translate(BEAM_LEN / 2, 0, 0);
  const mDiag1 = new THREE.Mesh(gDiag1, shaftMat);

  const gDiag2 = new THREE.PlaneGeometry(BEAM_LEN, WIN_H * 1.15);
  gDiag2.rotateX(-Math.PI / 4);
  gDiag2.translate(BEAM_LEN / 2, 0, 0);
  const mDiag2 = new THREE.Mesh(gDiag2, shaftMat);

  lightShaft.add(mVert, mHoriz, mTop, mBot, mDiag1, mDiag2);
  sl.add(lightShaft);

  // Lights
  const hemi = new THREE.HemisphereLight(0xcfd8ff, 0x6b4a2b, 0.55);
  sl.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe4be, 2);
  sun.position.set(-9, 5.5, 1.5);
  sun.target.position.set(0, 0, -0.2);
  sun.castShadow = true;
  const isLowEndCpu = typeof navigator !== 'undefined' && navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4;
  const shadowDim = typeof window !== 'undefined' && window.innerWidth <= 640 ? 512 : isLowEndCpu ? 1024 : 1536;
  sun.shadow.mapSize.set(shadowDim, shadowDim);
  const sc = sun.shadow.camera;
  sc.left = -7;
  sc.right = 7;
  sc.top = 7;
  sc.bottom = -7;
  sc.near = 1;
  sc.far = 25;
  sun.shadow.bias = -0.0004;
  sl.add(sun, sun.target);
  const lamp = new THREE.PointLight(0xffc88a, 0, 9.5, 1.9);
  lamp.position.set(-3.1, 1.5, -2.2);
  sl.add(lamp);

  // Overhead Architectural Pendant Room Light (Connected to Pull-Cord Switch)
  const roomLight = new THREE.PointLight(0xfff4e6, 2.6, 15, 1.8);
  roomLight.position.set(0.2, 2.85, -1.1);
  sl.add(roomLight);

  // Dust
  const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 768;
  const N = isMobileScreen ? 120 : 260,
    pa = new Float32Array(N * 3),
    pg = new THREE.BufferGeometry();
  for (let i = 0; i < N; i++) {
    pa[i * 3] = -4 + Math.random() * 8;
    pa[i * 3 + 1] = Math.random() * 3;
    pa[i * 3 + 2] = -3 + Math.random() * 6;
  }
  pg.setAttribute('position', new THREE.BufferAttribute(pa, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xdfba73,
    size: 0.035,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    blending: isFront ? THREE.CustomBlending : THREE.AdditiveBlending,
  });
  if (front) {
    dustMat.blendSrc = THREE.SrcAlphaFactor;
    dustMat.blendDst = THREE.OneFactor;
    dustMat.blendSrcAlpha = THREE.ZeroFactor;
    dustMat.blendDstAlpha = THREE.OneFactor;
    front.patch(dustMat);
  }
  const dust = new THREE.Points(pg, dustMat);
  sl.add(dust);

  const applyPalette = (idx: number) => {
    const pal = PALETTES[idx % PALETTES.length];
    flMat.color.setHex(pal.floorTint);
    flMat.roughness = pal.floorRough;
    wm.color.setHex(pal.wallTint);
    wm.roughness = pal.wallRough;
    rugMat.color.setHex(pal.rugColor);
    lin.color.setHex(pal.sofaColor);
    cushMat.color.setHex(pal.cushionColor);
    cl.color.setHex(pal.accentColor);
    oak.color.setHex(pal.tableTopColor);
    pot.color.setHex(pal.potColor);
    leaf.color.setHex(pal.leafColor);
    return pal;
  };

  return {
    parts,
    raycastTargets,
    applyPalette,
    fl,
    flW,
    flEdge,
    gr,
    guides,
    sketch,
    lineMat,
    gridMat,
    guideMat,
    sketchMat,
    winPaneMat,
    lampShadeMat,
    lightShaft,
    shaftMat,
    hemi,
    sun,
    lamp,
    roomLight,
    dust,
    N,
    pa,
    pg,
  };
}
