import type * as THREE_T from 'three';
import type { ThreeNS } from './textures';

/**
 * World-space "construction front" + Velocity-Reactive Liquid Metaball Lens +
 * 3D Material Shockwave Ring + 3D Laser Section-Cut Slicer.
 */
export interface Front {
  uniforms: {
    uFront: { value: number };
    uOrigin: { value: THREE_T.Vector3 };
    uBand: { value: number };
    uMaxD: { value: number };
    uTime: { value: number };
    uLens: { value: THREE_T.Vector3 };
    uTrail0: { value: THREE_T.Vector3 };
    uTrail1: { value: THREE_T.Vector3 };
    uTrail2: { value: THREE_T.Vector3 };
    uTrail3: { value: THREE_T.Vector3 };
    uFeather: { value: number };
    uWaveOrigin: { value: THREE_T.Vector3 };
    uWaveRadius: { value: number };
    uSectionZ: { value: number };
    uSectionActive: { value: number };
  };
  patch(m: THREE_T.Material): void;
  depth: THREE_T.MeshDepthMaterial;
}

const VERT_COMMON = /* glsl */ `
varying vec3 vFrontW;
`;
const VERT_BODY = /* glsl */ `
vFrontW = (modelMatrix * vec4(transformed, 1.0)).xyz;
`;

const FRAG_COMMON = /* glsl */ `
uniform float uFront;
uniform vec3 uOrigin;
uniform float uBand;
uniform float uMaxD;
uniform float uTime;
uniform vec3 uLens;
uniform vec3 uTrail0;
uniform vec3 uTrail1;
uniform vec3 uTrail2;
uniform vec3 uTrail3;
uniform float uFeather;
uniform vec3 uWaveOrigin;
uniform float uWaveRadius;
uniform float uSectionZ;
uniform float uSectionActive;
varying vec3 vFrontW;
float fhash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float fnoise(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(fhash(i + vec3(0,0,0)), fhash(i + vec3(1,0,0)), f.x), mix(fhash(i + vec3(0,1,0)), fhash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(fhash(i + vec3(0,0,1)), fhash(i + vec3(1,0,1)), f.x), mix(fhash(i + vec3(0,1,1)), fhash(i + vec3(1,1,1)), f.x), f.y),
    f.z);
}
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

const FRAG_DISCARD = /* glsl */ `
if (uSectionActive > 0.01 && vFrontW.z > uSectionZ) discard;
float fDist = frontField();
float fFw = clamp(fwidth(fDist), 0.012, 0.06);
float fPx = (frontThr() - fDist) / fFw;
float frontAlpha = uFront > 0.001 ? clamp(fPx / 1.5, 0.0, 1.0) : 0.0;
float lSdf = lensMetaballSdf(gl_FragCoord.xy);
float lensAlpha = uLens.z > 0.5 ? (1.0 - smoothstep(-uFeather * 0.65, uFeather * 0.35, lSdf)) : 0.0;
float revealAlpha = uFront >= 0.98 ? 1.0 : max(lensAlpha, frontAlpha);
if (revealAlpha <= 0.004) discard;
`;

const FRAG_DISCARD_POINTS = /* glsl */ `
if (uSectionActive > 0.01 && vFrontW.z > uSectionZ) discard;
float frontAlpha = (uFront > 0.001 && frontThr() - frontField() > 0.0) ? 1.0 : 0.0;
float lSdf = lensMetaballSdf(gl_FragCoord.xy);
float lensAlpha = uLens.z > 0.5 ? (1.0 - smoothstep(-uFeather * 0.65, uFeather * 0.35, lSdf)) : 0.0;
float revealAlpha = uFront >= 0.98 ? 1.0 : max(lensAlpha, frontAlpha);
if (revealAlpha <= 0.004) discard;
`;

const FRAG_DISCARD_DEPTH = /* glsl */ `
if (uFront < 0.98 && frontThr() - frontField() <= 0.0) discard;
`;

// Construction front warm section line + liquid lens rim glow + 3D material shockwave ring + 3D laser section cut.
const FRAG_EDGE = /* glsl */ `
if (uFront > 0.001 && uFront < 0.98 && fPx > 0.0 && fPx < 6.5 && lensAlpha < 0.85) {
  vec3 paper = vec3(0.925, 0.902, 0.859);
  vec3 w = vec3(
    smoothstep(0.8, 3.6, fPx),
    smoothstep(1.8, 4.8, fPx),
    smoothstep(2.8, 6.0, fPx)
  );
  gl_FragColor.rgb = mix(paper, vec3(gl_FragColor.rgb), mix(w, vec3(1.0), lensAlpha));
  float line = smoothstep(0.4, 1.3, fPx) * (1.0 - smoothstep(3.8, 4.9, fPx));
  gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.914, 0.725, 0.478), line * (1.0 - lensAlpha) * 0.96);
}
if (uWaveRadius > 0.01 && uWaveRadius < 11.5) {
  float wDist = abs(length(vFrontW - uWaveOrigin) - uWaveRadius);
  float wBand = (1.0 - smoothstep(0.0, 0.22, wDist)) * (1.0 - smoothstep(8.5, 11.5, uWaveRadius));
  gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.914, 0.725, 0.478), wBand * 0.92);
}
if (uSectionActive > 0.01) {
  float sDist = abs(vFrontW.z - uSectionZ);
  float sBand = (1.0 - smoothstep(0.0, 0.08, sDist)) * uSectionActive;
  gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.914, 0.725, 0.478), sBand);
}
gl_FragColor.a *= revealAlpha;
`;

const FRAG_EDGE_POINTS = /* glsl */ `
gl_FragColor.a *= revealAlpha;
`;

export function makeFront(THREE: ThreeNS): Front {
  const uniforms = {
    uFront: { value: 0 },
    uOrigin: { value: new THREE.Vector3(-4.0, 1.75, -0.2) }, // centre of the window
    uBand: { value: 0.35 },
    uMaxD: { value: 24.0 },
    uTime: { value: 0 },
    uLens: { value: new THREE.Vector3(0, 0, 0) },
    uTrail0: { value: new THREE.Vector3(0, 0, 0) },
    uTrail1: { value: new THREE.Vector3(0, 0, 0) },
    uTrail2: { value: new THREE.Vector3(0, 0, 0) },
    uTrail3: { value: new THREE.Vector3(0, 0, 0) },
    uFeather: { value: 38 },
    uWaveOrigin: { value: new THREE.Vector3(0, 0.5, -1.0) },
    uWaveRadius: { value: 0 },
    uSectionZ: { value: 3.5 },
    uSectionActive: { value: 0 },
  };
  const done = new WeakSet<THREE_T.Material>();

  const wire = (m: THREE_T.Material, isDepth: boolean) => {
    const isLine = m.type === 'LineBasicMaterial';
    const isPoints = m.type === 'PointsMaterial';
    if (!isDepth && !isLine && !isPoints) {
      (m as THREE_T.Material & { extensions?: { derivatives?: boolean } }).extensions = {
        ...((m as THREE_T.Material & { extensions?: { derivatives?: boolean } }).extensions || {}),
        derivatives: true,
      };
    }
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\n' + VERT_COMMON)
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + VERT_BODY);
      let f = shader.fragmentShader.replace('#include <common>', '#include <common>\n' + FRAG_COMMON);
      if (isLine) {
        f = f.replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n' + FRAG_DISCARD_DEPTH);
      } else if (isPoints) {
        f = f.replace('#include <alphatest_fragment>', '#include <alphatest_fragment>\n' + FRAG_DISCARD_POINTS);
        f = f.replace('#include <dithering_fragment>', '#include <dithering_fragment>\n' + FRAG_EDGE_POINTS);
      } else {
        f = f.replace('#include <alphatest_fragment>', '#include <alphatest_fragment>\n' + (isDepth ? FRAG_DISCARD_DEPTH : FRAG_DISCARD));
        if (!isDepth) f = f.replace('#include <dithering_fragment>', '#include <dithering_fragment>\n' + FRAG_EDGE);
      }
      shader.fragmentShader = f;
    };
    m.customProgramCacheKey = () => (isDepth ? 'front-depth' : 'front-' + m.type);
    m.needsUpdate = true;
  };

  const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  wire(depth, true);

  return {
    uniforms,
    depth,
    patch(m) {
      if (done.has(m)) return;
      done.add(m);
      wire(m, false);
    },
  };
}
