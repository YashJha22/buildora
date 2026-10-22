import type * as THREE_T from 'three';
import { colors } from '../tokens/colors';
import type { Front } from './front';
import type { ThreeNS } from './textures';

export interface SketchSystem {
  uniforms: {
    uDraw: { value: number };
    uGuideOpacity: { value: number };
    uBuildChapter: { value: number };
    uSunDir: { value: THREE_T.Vector3 };
    uPlanBlend: { value: number };
  };
  lineMat: THREE_T.LineBasicMaterial;
  gridMat: THREE_T.LineBasicMaterial;
  guideMat: THREE_T.LineBasicMaterial;
  patchSketchSurface(mat: THREE_T.MeshBasicMaterial): THREE_T.MeshBasicMaterial;
  makeLineSegments(
    geo: THREE_T.BufferGeometry,
    pos: THREE_T.Vector3,
    rotX: number,
    rotY: number,
    tStart: number,
    tEnd: number,
    mat?: THREE_T.LineBasicMaterial,
  ): THREE_T.LineSegments;
  buildGuides(sw: THREE_T.Scene): THREE_T.LineSegments;
  buildFloorGrid(sw: THREE_T.Scene): THREE_T.LineSegments;
}

const VERT_SKETCH = /* glsl */ `
attribute float aDraw;
varying float vDraw;
varying vec3 vFrontW;
`;

const VERT_SKETCH_BODY = /* glsl */ `
vDraw = aDraw;
vFrontW = (modelMatrix * vec4(transformed, 1.0)).xyz;
`;

const GLSL_NOISE = /* glsl */ `
float fhash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float fnoise(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(fhash(i + vec3(0,0,0)), fhash(i + vec3(1,0,0)), f.x), mix(fhash(i + vec3(0,1,0)), fhash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(fhash(i + vec3(0,0,1)), fhash(i + vec3(1,0,1)), f.x), mix(fhash(i + vec3(0,1,1)), fhash(i + vec3(1,1,1)), f.x), f.y),
    f.z);
}
`;

const FRAG_SKETCH = /* glsl */ `
uniform float uDraw;
uniform float uBuildChapter;
uniform float uFront;
uniform vec3 uOrigin;
uniform float uMaxD;
uniform vec3 uLens;
uniform vec3 uTrail0;
uniform vec3 uTrail1;
uniform vec3 uTrail2;
uniform vec3 uTrail3;
uniform float uFeather;
uniform float uSectionZ;
uniform float uSectionActive;
varying float vDraw;
varying vec3 vFrontW;
` + GLSL_NOISE + /* glsl */ `
float frontField(){
  float n = fnoise(vFrontW * 1.4) * 0.65 + fnoise(vFrontW * 4.2) * 0.25;
  return length(vFrontW - uOrigin) + (n - 0.45) * 1.35;
}
float frontThr(){
  return mix(-0.45, uMaxD, uFront);
}
float smin(float a, float b, float k){
  float h = clamp(0.5 + 0.5 * (b - a) / max(k, 0.001), 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}
float lensMetaballSdf(vec2 fragXY){
  if (uLens.z <= 0.5) return 1e5;
  float d = length(fragXY - uLens.xy) - uLens.z;
  float k = uFeather * 1.15;
  if (uTrail0.z > 1.0) d = smin(d, length(fragXY - uTrail0.xy) - uTrail0.z, k);
  if (uTrail1.z > 1.0) d = smin(d, length(fragXY - uTrail1.xy) - uTrail1.z, k);
  if (uTrail2.z > 1.0) d = smin(d, length(fragXY - uTrail2.xy) - uTrail2.z, k);
  if (uTrail3.z > 1.0) d = smin(d, length(fragXY - uTrail3.xy) - uTrail3.z, k);
  return d;
}
`;

const FRAG_SKETCH_CLIP = /* glsl */ `
if (uDraw <= vDraw) discard;
if (uSectionActive > 0.01 && vFrontW.z > uSectionZ) discard;
float strokeTip = clamp((uDraw - vDraw) / 0.014, 0.0, 1.0);
float builtDelta = (frontThr() - frontField()) * (1.0 - uBuildChapter);
float frontInside = uFront > 0.001 ? smoothstep(0.04, 0.22, builtDelta) : 0.0;
float lSdf = lensMetaballSdf(gl_FragCoord.xy);
float lensCore = -uFeather * 0.65;
float lensInside = (uLens.z > 0.5 ? (1.0 - smoothstep(lensCore - uFeather * 0.35, lensCore, lSdf)) : 0.0) * (1.0 - uBuildChapter);
float unbuiltFade = 1.0 - max(frontInside, lensInside);
if (unbuiltFade <= 0.01) discard;
`;

const FRAG_SKETCH_ALPHA = /* glsl */ `
if (uSectionActive > 0.01) {
  float sBand = (1.0 - smoothstep(0.0, 0.12, abs(vFrontW.z - uSectionZ))) * uSectionActive;
  outgoingLight = mix(outgoingLight, vec3(0.914, 0.725, 0.478), sBand);
}
float graphiteVar = 0.94 + 0.12 * fnoise(vFrontW * 12.0);
gl_FragColor = vec4( outgoingLight, clamp(diffuseColor.a * strokeTip * unbuiltFade * graphiteVar, 0.0, 1.0) );
`;

export function makeSketchSystem(THREE: ThreeNS, front: Front | null): SketchSystem {
  const isFront = front !== null;
  const uniforms = {
    uDraw: { value: isFront ? 0 : 1 },
    uGuideOpacity: { value: 1 },
    uBuildChapter: { value: 0 },
    uSunDir: { value: new THREE.Vector3(-0.78, 0.52, 0.2) },
    uPlanBlend: { value: 0 },
  };

  const patchLineMat = (mat: THREE_T.LineBasicMaterial, key: string, useGuideFade = false) => {
    if (!front) return mat;
    mat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms, front.uniforms);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\n' + VERT_SKETCH)
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + VERT_SKETCH_BODY);
      let f = shader.fragmentShader
        .replace('#include <common>', '#include <common>\n' + FRAG_SKETCH + (useGuideFade ? '\nuniform float uGuideOpacity;\n' : ''))
        .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n' + FRAG_SKETCH_CLIP);
      if (useGuideFade) {
        f = f.replace(
          'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
          'float graphiteVar = 0.94 + 0.12 * fnoise(vFrontW * 12.0);\ngl_FragColor = vec4( outgoingLight, clamp(diffuseColor.a * strokeTip * unbuiltFade * uGuideOpacity * graphiteVar, 0.0, 1.0) );',
        );
      } else {
        f = f.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );', FRAG_SKETCH_ALPHA);
      }
      shader.fragmentShader = f;
    };
    mat.customProgramCacheKey = () => key;
    mat.needsUpdate = true;
    return mat;
  };

  const patchSketchSurface = (mat: THREE_T.MeshBasicMaterial) => {
    if (!front) return mat;
    (mat as THREE_T.Material & { extensions?: { derivatives?: boolean } }).extensions = {
      ...((mat as THREE_T.Material & { extensions?: { derivatives?: boolean } }).extensions || {}),
      derivatives: true,
    };
    mat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms, front.uniforms);
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          '#include <common>\nvarying vec3 vSurfW;\nvarying vec3 vSurfN;\n',
        )
        .replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\nvSurfW = (modelMatrix * vec4(transformed, 1.0)).xyz;\nvSurfN = normalize(mat3(modelMatrix) * normal);\n',
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          '#include <common>\n' +
            GLSL_NOISE +
            '\nuniform float uDraw;\nuniform vec3 uSunDir;\nuniform float uPlanBlend;\nuniform float uSectionZ;\nuniform float uSectionActive;\nvarying vec3 vSurfW;\nvarying vec3 vSurfN;\n',
        )
        .replace(
          '#include <clipping_planes_fragment>',
          '#include <clipping_planes_fragment>\nif (uSectionActive > 0.01 && vSurfW.z > uSectionZ) discard;\n',
        )
        .replace(
          'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
          /* glsl */ `
          float ndl = dot(normalize(vSurfN), normalize(uSunDir));
          float shade = clamp((0.32 - ndl) * 1.6, 0.0, 1.0) * smoothstep(0.45, 0.95, uDraw) * (1.0 - uPlanBlend);

          // Sun-responsive rotation in screen-space
          float sunAzimuth = atan(uSunDir.z, uSunDir.x);
          float ca = cos(sunAzimuth * 0.45 + 0.785);
          float sa = sin(sunAzimuth * 0.45 + 0.785);
          mat2 hRot = mat2(ca, -sa, sa, ca);
          vec2 hCoord = hRot * (gl_FragCoord.xy * 0.95);

          float s1 = sin(hCoord.x + hCoord.y);
          float fw1 = max(fwidth(s1), 0.001);
          float h1 = smoothstep(0.74 - fw1 * 0.85, 0.74, s1);

          float s2 = sin(hCoord.x - hCoord.y * 1.25);
          float fw2 = max(fwidth(s2), 0.001);
          float h2 = smoothstep(0.82 - fw2 * 0.85, 0.82, s2) * step(0.48, shade);

          // Hand-drafted graphite tooth variation
          float tooth = 0.92 + 0.16 * fnoise(vSurfW * 14.0);
          float hatch = max(h1, h2) * shade * tooth * 0.065;
          vec3 col = mix(outgoingLight, vec3(0.08, 0.07, 0.06), hatch);
          if (uSectionActive > 0.01) {
            float sBand = (1.0 - smoothstep(0.0, 0.08, abs(vSurfW.z - uSectionZ))) * uSectionActive;
            col = mix(col, vec3(0.914, 0.725, 0.478), sBand);
          }
          gl_FragColor = vec4(col, diffuseColor.a);
          `,
        );
    };
    mat.customProgramCacheKey = () => 'sketch-surface-hatch';
    mat.needsUpdate = true;
    return mat;
  };

  const lineMat = patchLineMat(
    new THREE.LineBasicMaterial({
      color: isFront ? colors.ink : colors.bone,
      transparent: true,
      opacity: isFront ? 0.78 : 0.5,
    }),
    'sketch-line-main',
  );

  const gridMat = patchLineMat(
    new THREE.LineBasicMaterial({
      color: isFront ? colors.ink : colors.bone,
      transparent: true,
      opacity: isFront ? 0.14 : 0.16,
    }),
    'sketch-line-grid',
  );

  const guideMat = patchLineMat(
    new THREE.LineBasicMaterial({
      color: colors.ink,
      transparent: true,
      opacity: 0.52,
    }),
    'sketch-line-guide',
    true,
  );

  const annotateStrokeOrder = (
    srcGeo: THREE_T.BufferGeometry,
    pos: THREE_T.Vector3,
    rotX: number,
    rotY: number,
    tStart: number,
    tEnd: number,
  ): THREE_T.BufferGeometry => {
    const geo = srcGeo.clone();
    const posAttr = geo.getAttribute('position');
    const segCount = Math.floor(posAttr.count / 2);
    if (segCount === 0) return geo;

    const euler = new THREE.Euler(rotX, rotY, 0, 'XYZ');
    const vA = new THREE.Vector3();
    const vB = new THREE.Vector3();
    const wA = new THREE.Vector3();
    const wB = new THREE.Vector3();

    interface SegInfo {
      idx: number;
      swap: boolean;
      sortKey: number;
    }
    const segs: SegInfo[] = [];

    for (let i = 0; i < segCount; i++) {
      vA.fromBufferAttribute(posAttr, i * 2);
      vB.fromBufferAttribute(posAttr, i * 2 + 1);
      wA.copy(vA).applyEuler(euler).add(pos);
      wB.copy(vB).applyEuler(euler).add(pos);

      const dy = Math.abs(wA.y - wB.y);
      let swap = false;
      if (dy > 0.04) {
        if (wA.y > wB.y) swap = true;
      } else {
        const dA = wA.x * 1.2 + wA.z * 0.5;
        const dB = wB.x * 1.2 + wB.z * 0.5;
        if (dA > dB) swap = true;
      }

      const minY = Math.min(wA.y, wB.y);
      const midX = 0.5 * (wA.x + wB.x);
      const midZ = 0.5 * (wA.z + wB.z);
      const distOrigin = Math.hypot(midX + 4.0, midZ + 2.5);
      const sortKey = minY * 1.5 + distOrigin * 0.35;
      segs.push({ idx: i, swap, sortKey });
    }

    segs.sort((a, b) => a.sortKey - b.sortKey);

    const newPositions = new Float32Array(segCount * 6);
    const aDraw = new Float32Array(segCount * 2);
    const span = Math.max(0.001, tEnd - tStart);
    const strokeDuration = span * 0.42;

    for (let rank = 0; rank < segCount; rank++) {
      const { idx, swap } = segs[rank];
      const i0 = swap ? idx * 2 + 1 : idx * 2;
      const i1 = swap ? idx * 2 : idx * 2 + 1;

      vA.fromBufferAttribute(posAttr, i0);
      vB.fromBufferAttribute(posAttr, i1);

      newPositions[rank * 6] = vA.x;
      newPositions[rank * 6 + 1] = vA.y;
      newPositions[rank * 6 + 2] = vA.z;
      newPositions[rank * 6 + 3] = vB.x;
      newPositions[rank * 6 + 4] = vB.y;
      newPositions[rank * 6 + 5] = vB.z;

      const u = segCount > 1 ? rank / (segCount - 1) : 0;
      const s0 = tStart + u * (span - strokeDuration);
      const s1 = s0 + strokeDuration;
      aDraw[rank * 2] = s0;
      aDraw[rank * 2 + 1] = s1;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
    geo.setAttribute('aDraw', new THREE.BufferAttribute(aDraw, 1));
    return geo;
  };

  return {
    uniforms,
    lineMat,
    gridMat,
    guideMat,
    patchSketchSurface,
    makeLineSegments(geo, pos, rotX, rotY, tStart, tEnd, mat = lineMat) {
      const prepared = isFront ? annotateStrokeOrder(geo, pos, rotX, rotY, tStart, tEnd) : geo;
      const ls = new THREE.LineSegments(prepared, mat);
      ls.position.copy(pos);
      ls.rotation.set(rotX, rotY, 0);
      return ls;
    },
    buildGuides(sw) {
      const pts: number[] = [];
      const addSeg = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) => {
        pts.push(x0, y0, z0, x1, y1, z1);
      };

      // Primary floor & wall axes extending beyond the room slab
      addSeg(-4.1, 0, -3.1, 5.4, 0, -3.1);
      addSeg(-4.1, 0, -3.1, -4.1, 0, 4.2);
      addSeg(-4.1, 0, -3.1, -4.1, 4.0, -3.1);
      addSeg(-4.1, 3.2, -3.1, 5.0, 3.2, -3.1);
      addSeg(-4.1, 3.2, -3.1, -4.1, 3.2, 3.8);
      addSeg(4.0, 0, -3.8, 4.0, 0, 3.8);
      addSeg(-4.8, 0, 3.0, 4.8, 0, 3.0);

      // Window construction crosshairs & sill/head projection lines on left wall
      addSeg(-4.0, 0.9, -3.5, -4.0, 0.9, 3.2);
      addSeg(-4.0, 2.6, -3.5, -4.0, 2.6, 3.2);
      addSeg(-4.0, -0.2, -1.4, -4.0, 3.5, -1.4);
      addSeg(-4.0, -0.2, 1.0, -4.0, 3.5, 1.0);

      // Architectural dimension lines and ticks outside the floor slab
      addSeg(-4.5, 0, -3.0, -4.5, 0, 3.0);
      addSeg(-4.65, 0, -3.0, -4.35, 0, -3.0);
      addSeg(-4.65, 0, 3.0, -4.35, 0, 3.0);
      addSeg(-4.0, 0, 3.45, 4.0, 0, 3.45);
      addSeg(-4.0, 0, 3.3, -4.0, 0, 3.6);
      addSeg(4.0, 0, 3.3, 4.0, 0, 3.6);
      addSeg(4.45, 0, -3.1, 4.45, 3.2, -3.1);
      addSeg(4.3, 0, -3.1, 4.6, 0, -3.1);
      addSeg(4.3, 3.2, -3.1, 4.6, 3.2, -3.1);

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
      const ls = this.makeLineSegments(geo, new THREE.Vector3(0, 0, 0), 0, 0, 0.01, 0.22, guideMat);
      sw.add(ls);
      return ls;
    },
    buildFloorGrid(sw) {
      if (!isFront) {
        const gr = new THREE.GridHelper(8, 16, colors.bone, colors.bone);
        gr.scale.z = 0.75;
        (gr.material as THREE_T.Material).transparent = true;
        (gr.material as THREE_T.Material).opacity = 0.16;
        sw.add(gr);
        return gr as unknown as THREE_T.LineSegments;
      }
      const pts: number[] = [];
      for (let i = 0; i <= 16; i++) {
        const u = i / 16;
        const x = -4 + u * 8;
        const z = -3 + u * 6;
        pts.push(x, 0.002, -3, x, 0.002, 3);
        pts.push(-4, 0.002, z, 4, 0.002, z);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
      const ls = this.makeLineSegments(geo, new THREE.Vector3(0, 0, 0), 0, 0, 0.18, 0.38, gridMat);
      sw.add(ls);
      return ls;
    },
  };
}
