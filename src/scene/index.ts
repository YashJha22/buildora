import { sound } from '../audio';
import { L, W } from '../dom';
import { S, classic, debugDraw, debugFront, debugT, st } from '../state';
import { colors } from '../tokens/colors';
import { introClock } from '../tokens/motion';
import { $, clamp } from '../utils';
import { placeCamera } from './camera';
import { makeFront } from './front';
import { buildRoom, type CadInfo } from './room';
import { PALETTES, type ThreeNS } from './textures';

export interface SceneApi {
  size(): void;
  draw(t: number, e: number, q: number, c: number, q2: number, bq: number, cb: number): void;
  setPalette(idx: number, origin?: { x: number; y: number; z: number }): void;
  setSolarHour(hr: number, isManual?: boolean): void;
  setSolarAuto(auto: boolean): void;
  setRoomLight(on: boolean): void;
  getRoomLight(): boolean;
  getLampLight(): boolean;
}

function makeRoomEnv(THREE: ThreeNS, renderer: InstanceType<ThreeNS['WebGLRenderer']>) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0xd8cfc0);
  const sky = new THREE.Mesh(
    new THREE.BoxGeometry(12, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xefe7da, side: THREE.BackSide }),
  );
  // Overhead diffused studio softbox bank
  const softbox = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.MeshBasicMaterial({ color: 0xfff3e2, side: THREE.DoubleSide }),
  );
  softbox.position.set(0, 5.2, 0);
  softbox.rotation.x = Math.PI / 2;

  // Keylight window aperture daylight bank (left)
  const windowBank = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 4),
    new THREE.MeshBasicMaterial({ color: 0xffe8cc, side: THREE.DoubleSide }),
  );
  windowBank.position.set(-5.2, 2.2, -0.2);
  windowBank.rotation.y = Math.PI / 2;

  // Warm floor bounce plane
  const floorBounce = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 8),
    new THREE.MeshBasicMaterial({ color: 0xd9b382, side: THREE.DoubleSide }),
  );
  floorBounce.position.set(0, -0.1, 0);
  floorBounce.rotation.x = -Math.PI / 2;

  // Dark negative-fill contrast flat (right)
  const negFill = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 5),
    new THREE.MeshBasicMaterial({ color: 0x1a1816, side: THREE.DoubleSide }),
  );
  negFill.position.set(5.2, 2.0, 0);
  negFill.rotation.y = -Math.PI / 2;

  envScene.add(sky, softbox, windowBank, floorBounce, negFill);
  const rt = pmrem.fromScene(envScene, 0.04);
  pmrem.dispose();
  return rt.texture;
}

function create(
  THREE: ThreeNS,
  RoundedBoxGeo?: typeof import('three/examples/jsm/geometries/RoundedBoxGeometry.js').RoundedBoxGeometry,
): SceneApi | null {
  let rW: InstanceType<ThreeNS['WebGLRenderer']>, rL: InstanceType<ThreeNS['WebGLRenderer']>;
  const isMobileDevice = st.w < 768;
  try {
    rW = new THREE.WebGLRenderer({
      canvas: W,
      antialias: !isMobileDevice,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    rL = new THREE.WebGLRenderer({
      canvas: L,
      antialias: classic && !isMobileDevice,
      alpha: !classic,
      premultipliedAlpha: classic,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
  } catch (e) {
    return null;
  }
  rW.setClearColor(classic ? colors.ink : colors.bone, 1);
  rL.setClearColor(classic ? colors.litClear : colors.bone, classic ? 1 : 0);
  rL.outputEncoding = THREE.sRGBEncoding;
  rL.toneMapping = THREE.ACESFilmicToneMapping;
  rL.shadowMap.enabled = true;
  rL.shadowMap.type = st.w < 768 ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
  const sw = new THREE.Scene(),
    sl = new THREE.Scene();
  if (!classic) {
    sl.environment = makeRoomEnv(THREE, rL);
  }
  const fogColor = new THREE.Color(classic ? colors.litClear : colors.bone);
  const clearColorW = new THREE.Color(colors.bone);
  const inkColor = new THREE.Color(colors.ink);
  const boneColor = new THREE.Color(colors.bone);
  const litClearColor = new THREE.Color(colors.litClear);
  const nightClearColor = new THREE.Color(colors.ink);
  const sunNoonColor = new THREE.Color(0xffe4be);
  const sunGoldenColor = new THREE.Color(0xff9e58);
  const sunDuskColor = new THREE.Color(0xb06c78);
  const sunNightColor = new THREE.Color(0x4b5c82);
  const sunDawnColor = new THREE.Color(0xffbe96);

  const paneDayColor = new THREE.Color(0xfff1d6);
  const paneGoldenColor = new THREE.Color(0xf6b879);
  const paneDuskColor = new THREE.Color(0x483a54);
  const paneNightColor = new THREE.Color(0x141822);
  const paneDawnColor = new THREE.Color(0xffdfc4);

  const hemiDaySky = new THREE.Color(0xcfd8ff);
  const hemiGoldenSky = new THREE.Color(0xffc285);
  const hemiNightSky = new THREE.Color(0x26334d);
  const hemiDawnSky = new THREE.Color(0xffd8c0);

  const hemiDayGnd = new THREE.Color(0x6b4a2b);
  const hemiGoldenGnd = new THREE.Color(0x5b3318);
  const hemiNightGnd = new THREE.Color(0x12100e);

  const shaftNoonColor = new THREE.Color(0xffeed0);
  const shaftGoldenColor = new THREE.Color(0xffa854);
  const shaftDawnColor = new THREE.Color(0xffcba0);

  sl.fog = new THREE.Fog(fogColor.getHex(), st.w < 768 ? 24 : 14, st.w < 768 ? 52 : 32);
  const cam = new THREE.PerspectiveCamera(38, st.w / st.h, 0.1, 60);

  const front = classic ? null : makeFront(THREE);
  const {
    parts,
    raycastTargets,
    applyPalette,
    fl,
    flW,
    flEdge,
    gr,
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
  } = buildRoom(THREE, sw, sl, front, RoundedBoxGeo);

  const introPartLanded = new Array(parts.length).fill(false);
  const buildPartLanded = new Array(parts.length).fill(false);

  const size = () => {
    const isMobile = st.w < 768;
    const d = Math.min(devicePixelRatio || 1, isMobile ? 1.25 : 1.75);
    rL.shadowMap.type = isMobile ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
    [rW, rL].forEach((r) => {
      r.setPixelRatio(d);
      r.setSize(st.w, st.h, false);
    });
    cam.aspect = st.w / st.h;
    cam.updateProjectionMatrix();
  };
  size();

  // Pre-compile shaders upfront so the front transition has no runtime compile hitch (P3).
  rW.compile(sw, cam);
  rL.compile(sl, cam);

  let frontOverride: number | null = debugFront !== null ? debugFront : (debugT !== null && debugT >= 8.4 ? 1.0 : null);
  let drawOverride: number | null = debugDraw;
  let roomLightCurrent = st.roomLightOn ? 1.0 : 0.0;
  let lampCurrent = st.roomLightOn ? 0.0 : 1.0;
  let lastRaycastX = -999;
  let lastRaycastY = -999;
  let cadFrameCount = 0;

  // Cursor velocity metaball wake history
  const trailPts = Array.from({ length: 4 }, () => ({ x: st.lx, y: st.ly, r: 0 }));
  let prevLx = st.lx;
  let prevLy = st.ly;
  let studioReveal = 0;

  // 3D CAD Raycaster & DOM elements
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const cadEl = document.getElementById('cad');
  const cadCodeEl = document.getElementById('cad-code');
  const cadNameEl = document.getElementById('cad-name');
  const cadMetaEl = document.getElementById('cad-meta');
  const cadXyzEl = document.getElementById('cad-xyz');
  let activeCad: CadInfo | null = null;
  let lastHitPoint = new THREE.Vector3(0.2, 0.42, -0.5);

  const triggerPalette = (idx: number, origin?: { x: number; y: number; z: number }) => {
    st.paletteIdx = ((idx % PALETTES.length) + PALETTES.length) % PALETTES.length;
    applyPalette(st.paletteIdx);
    if (front) {
      if (origin) {
        front.uniforms.uWaveOrigin.value.set(origin.x, origin.y, origin.z);
      } else {
        front.uniforms.uWaveOrigin.value.copy(lastHitPoint);
      }
      st.waveRadius = 0.05;
      front.uniforms.uWaveRadius.value = st.waveRadius;
    }
    sound.playShockwave(st.paletteIdx);
    document.querySelectorAll<HTMLButtonElement>('.st-pals button').forEach((b) => {
      b.classList.toggle('on', Number(b.dataset.pal) === st.paletteIdx);
    });
  };

  let lastFormattedHour = '';
  const setSolarHour = (hr: number, isManual = false) => {
    st.solarHour = clamp(hr, 6, 22);
    if (isManual) {
      st.solarAuto = false;
    }
    const valEl = document.getElementById('solar-val');
    const rangeEl = document.getElementById('solar-range') as HTMLInputElement | null;
    const autoBtn = document.getElementById('solar-auto');
    const hInt = Math.floor(st.solarHour);
    const mInt = Math.round((st.solarHour - hInt) * 60);
    const mAdj = mInt === 60 ? 0 : mInt;
    const hAdj = mInt === 60 ? hInt + 1 : hInt;
    const formatted = `${hAdj < 10 ? '0' : ''}${hAdj}:${mAdj < 10 ? '0' : ''}${mAdj}`;
    if (formatted !== lastFormattedHour) {
      lastFormattedHour = formatted;
      if (valEl) valEl.textContent = formatted;
      const htTimeEl = document.getElementById('ht-time');
      if (htTimeEl) {
        let phase = 'GOLDEN HOUR';
        if (st.solarHour < 10.5) phase = 'MORNING';
        else if (st.solarHour < 15.5) phase = 'NOON';
        else if (st.solarHour < 19.5) phase = 'GOLDEN HOUR';
        else phase = 'NIGHT';
        htTimeEl.textContent = `${formatted} · ${phase}`;
      }
      const compassEl = document.querySelector<SVGElement>('.ht-compass');
      if (compassEl) {
        const rot = ((st.solarHour - 6) / 16) * 180 - 45;
        compassEl.style.transform = `rotate(${rot.toFixed(1)}deg)`;
      }
    }
    if (rangeEl && Math.abs(Number(rangeEl.value) - st.solarHour) > 0.05) {
      rangeEl.value = String(st.solarHour);
    }
    if (autoBtn) {
      autoBtn.classList.toggle('on', st.solarAuto);
      autoBtn.setAttribute('aria-pressed', String(st.solarAuto));
    }
    document.querySelectorAll<HTMLButtonElement>('.st-beats button[data-hour]').forEach((b) => {
      const match = Math.abs(Number(b.dataset.hour) - st.solarHour) < 1.1;
      b.classList.toggle('on', !st.solarAuto && match);
    });
    if (isManual) {
      sound.playSolarTick(st.solarHour);
    }
  };

  const setSolarAuto = (auto: boolean) => {
    st.solarAuto = auto;
    setSolarHour(st.solarHour, false);
  };

  // Interactive click on 3D canvas when Studio Mode is open ripples the next material palette from that 3D point
  addEventListener('pointerdown', (ev) => {
    if (!st.studioOpen || !st.ready) return;
    const target = ev.target as HTMLElement | null;
    if (target && (target.closest('#studio') || target.closest('header') || target.closest('main'))) return;
    ndc.set((ev.clientX / st.w) * 2 - 1, -(ev.clientY / st.h) * 2 + 1);
    raycaster.setFromCamera(ndc, cam);
    const hits = raycaster.intersectObjects(raycastTargets, false);
    if (hits.length > 0) {
      lastHitPoint.copy(hits[0].point);
      triggerPalette((st.paletteIdx + 1) % PALETTES.length, hits[0].point);
    }
  });

  const api: SceneApi = {
    size,
    setPalette: triggerPalette,
    setSolarHour,
    setSolarAuto,
    setRoomLight(on: boolean) {
      st.roomLightOn = on;
    },
    getRoomLight() {
      return st.roomLightOn;
    },
    getLampLight() {
      return !st.roomLightOn;
    },
    draw(t, e, _q, c, q2, bq, cb) {
      const introProgress = classic ? S.intro : clamp(S.T / introClock.total, 0, 1);
      const aspect = st.w / st.h;
      const k = classic ? (1 - S.intro) * 0.35 + 1 : (1 - introProgress) * 0.04 + 1,
        a = aspect < 1 ? Math.min(2.25, Math.max(1.35, 0.95 / aspect)) : 1,
        bt = S.build,
        eo = (v: number) => 1 - Math.pow(1 - v, 3),
        lf = eo(clamp(bt * 2.5, 0, 1)),
        rl = classic ? eo(clamp((bt - 0.55) / 0.45, 0, 1)) : 1;

      const drawVal = drawOverride !== null ? clamp(drawOverride, 0, 1) : classic ? 1 : clamp(S.draw, 0, 1);
      sketch.uniforms.uDraw.value = drawVal;

      fl.scale.set(lf, lf, 1);
      if (flW) {
        flW.scale.copy(fl.scale);
        flW.visible = drawVal >= 0.22;
      }
      if (flEdge) flEdge.scale.copy(fl.scale);
      gr.scale.set(lf, 1, isFrontGridScale(classic) * lf);

      const isMobile = st.w < 768;
      const dropHeight = isMobile ? 32 : 12;

      parts.forEach((p, i) => {
        const s = Math.max(eo(clamp(bt * 1.7 - (i / parts.length) * 0.7, 0, 1)), 0.001),
          ly = i <= 6 ? 0 : i <= 8 ? 1 : 2,
          l0 = ly == 0 ? 1 : eo(clamp((bq - (ly == 1 ? 0.18 : 0.38) - (i - (ly == 1 ? 7 : 9)) * 0.012) / 0.14, 0, 1)),
          dp = (1 - l0) * clamp(bq / 0.04, 0, 1);

        // In Build Chapter, unlanded furniture pieces must remain completely hidden until their stage activates.
        const isPartActiveInBuild = cb < 0.01 || ly === 0 || l0 > 0.001;
        p.o.visible = isPartActiveInBuild;
        if (p.e) p.e.visible = isPartActiveInBuild;
        if (p.w) p.w.visible = isPartActiveInBuild && drawVal >= p.drawAt;

        if (!isPartActiveInBuild) return;

        if (p.flat) {
          p.o.scale.setScalar(s);
          p.o.position.y = p.by;
        } else {
          p.o.scale.y = s;
          p.o.position.y = p.by - (1 - s) * p.hh;
        }
        p.o.position.y += dp * dropHeight;
        if (!p.flat) p.o.rotation.y = p.ry + dp * 1.3;
        if (p.e) {
          p.e.scale.copy(p.o.scale);
          p.e.position.copy(p.o.position);
          if (!p.flat) p.e.rotation.copy(p.o.rotation);
        }
        if (p.w) {
          p.w.scale.copy(p.o.scale);
          p.w.position.copy(p.o.position);
          p.w.rotation.copy(p.o.rotation);
        }

        // Spatial Audio: physical impact sounds when objects land onto surfaces (with directional hysteresis)
        if (p.soundType) {
          if (bt > 0.05 && bt < 0.999 && !st.ready) {
            if (s >= 0.96 && !introPartLanded[i]) {
              introPartLanded[i] = true;
              sound.playPartImpact(p.soundType);
            } else if (s < 0.65) {
              introPartLanded[i] = false;
            }
          }
          if (bq > 0.01 && cb > 0.05) {
            if (dp <= 0.025 && !buildPartLanded[i]) {
              buildPartLanded[i] = true;
              sound.playPartImpact(p.soundType);
            } else if (dp > 0.35) {
              buildPartLanded[i] = false;
            }
          }
        }
      });

      const dm = clamp(bq / 0.04, 0, 1),
        dw = clamp((bq - 0.78) / 0.2, 0, 1),
        lq = 1 - dm * (1 - dw * dw * (3 - 2 * dw)) * 0.7;

      // Update pointer speed and metaball wake trail
      const stepSpeed = Math.hypot(st.lx - prevLx, st.ly - prevLy);
      st.pointerSpeed += (stepSpeed - st.pointerSpeed) * 0.25;
      prevLx = st.lx;
      prevLy = st.ly;
      sound.update(drawVal, st.pointerSpeed, t);

      if (front) {
        // 3D Laser Section-Cut Slicer during Chapter 2 (03 — The section, q2 > 0.45)
        const sectionAct = clamp((q2 - 0.45) / 0.35, 0, 1) * c * (1 - cb);
        front.uniforms.uSectionActive.value = sectionAct;
        front.uniforms.uSectionZ.value = 3.2 - sectionAct * 3.8;

        // Scroll (e: 0 -> 1) advances the 3D construction front independently of cursor movement; scrolling backwards reverses it.
        const scrollBuild = clamp(e * 1.04, 0, 1) * clamp(1 - c * 1.4, 0, 1);
        const frontVal =
          frontOverride !== null
            ? clamp(frontOverride, 0, 1)
            : clamp(Math.max(scrollBuild, sectionAct * 0.92, cb), 0, 1);
        front.uniforms.uFront.value = frontVal;
        front.uniforms.uTime.value = t;

        const dpr = rL.getPixelRatio();
        const lensR = S.intro <= 0.005 ? 0 : Math.max(st.lr, 0) * clamp(1 - _q * 4, 0, 1);
        front.uniforms.uLens.value.set(st.lx * dpr, (st.h - st.ly) * dpr, lensR * dpr);
        const currentFeather = Math.min(38, Math.max(2, lensR * 0.22)) * dpr;
        front.uniforms.uFeather.value = currentFeather;

        // Update 4-point velocity metaball wake
        const wakeScale = clamp((st.pointerSpeed - 1.5) / 18, 0, 1) * (1 - clamp(e * 2, 0, 1));
        for (let i = 0; i < 4; i++) {
          const targetX = i === 0 ? st.lx : trailPts[i - 1].x;
          const targetY = i === 0 ? st.ly : trailPts[i - 1].y;
          const follow = 0.28 - i * 0.045;
          trailPts[i].x += (targetX - trailPts[i].x) * follow;
          trailPts[i].y += (targetY - trailPts[i].y) * follow;
          trailPts[i].r = lensR * wakeScale * (0.76 - i * 0.14);
        }
        front.uniforms.uTrail0.value.set(trailPts[0].x * dpr, (st.h - trailPts[0].y) * dpr, trailPts[0].r * dpr);
        front.uniforms.uTrail1.value.set(trailPts[1].x * dpr, (st.h - trailPts[1].y) * dpr, trailPts[1].r * dpr);
        front.uniforms.uTrail2.value.set(trailPts[2].x * dpr, (st.h - trailPts[2].y) * dpr, trailPts[2].r * dpr);
        front.uniforms.uTrail3.value.set(trailPts[3].x * dpr, (st.h - trailPts[3].y) * dpr, trailPts[3].r * dpr);

        // Advance 3D Material Shockwave ring if active
        if (st.waveRadius > 0.01 && st.waveRadius < 12.0) {
          st.waveRadius += 0.22;
          if (st.waveRadius >= 12.0) st.waveRadius = 0;
          front.uniforms.uWaveRadius.value = st.waveRadius;
        }

        // Construction guides are spatially consumed by the construction front and lens, and fade out when entering the Plan chapter (c: 0 -> 1).
        sketch.uniforms.uGuideOpacity.value = 1 - c;
        sketch.uniforms.uBuildChapter.value = clamp(c + bq * 5, 0, 1);
        sketch.uniforms.uPlanBlend.value = c;

        // Smoothly transition W paper/ink to dark blueprint table during Plan chapter (c: 0 -> 1) so white Plan text/SVGs stay high-contrast.
        // On both desktop and mobile, c=0 starts with bone paper + deep forged graphite lines and grid.
        clearColorW.copy(boneColor).lerp(inkColor, c);
        rW.setClearColor(clearColorW, 1);
        sketchMat.color.copy(clearColorW);
        lineMat.color.copy(inkColor).lerp(boneColor, c);
        lineMat.opacity = 0.82 * (1 - c) + 0.5 * c;
        gridMat.color.copy(inkColor).lerp(boneColor, c);
        gridMat.opacity = 0.08 * (1 - c) + 0.16 * c;
        guideMat.color.copy(inkColor).lerp(boneColor, c);

        // Solar Path calculation (default st.solarHour = 14.5 reproduces exact baseline sun pose (-9, 5.5, 1.5))
        const hr = st.solarHour;
        const dayArc = Math.sin(clamp((hr - 6) / 14, 0, 1) * Math.PI);
        const dawnAmt = clamp(1 - Math.abs(hr - 7.0) / 1.5, 0, 1);
        const goldenAmt = clamp(1 - Math.abs(hr - 17.75) / 1.5, 0, 1);
        const duskAmt = clamp(1 - Math.abs(hr - 19.3) / 1.0, 0, 1);
        const nightAmt = clamp(clamp((hr - 19.8) / 1.5, 0, 1) + clamp((6.8 - hr) / 0.8, 0, 1), 0, 1);

        const sunY = 1.2 + 4.3 * dayArc;
        const sunZ = 1.5 + (hr - 14.5) * 0.65;
        sun.position.set(-9, sunY, sunZ);
        sketch.uniforms.uSunDir.value.copy(sun.position).normalize();

        sun.color
          .copy(sunNoonColor)
          .lerp(sunDawnColor, dawnAmt)
          .lerp(sunGoldenColor, goldenAmt)
          .lerp(sunDuskColor, duskAmt)
          .lerp(sunNightColor, nightAmt);

        winPaneMat.color
          .copy(paneDayColor)
          .lerp(paneDawnColor, dawnAmt)
          .lerp(paneGoldenColor, goldenAmt)
          .lerp(paneDuskColor, duskAmt)
          .lerp(paneNightColor, nightAmt);

        hemi.color
          .copy(hemiDaySky)
          .lerp(hemiDawnSky, dawnAmt)
          .lerp(hemiGoldenSky, goldenAmt)
          .lerp(hemiNightSky, nightAmt);

        hemi.groundColor
          .copy(hemiDayGnd)
          .lerp(hemiGoldenGnd, goldenAmt)
          .lerp(hemiNightGnd, nightAmt);

        shaftMat.color
          .copy(shaftNoonColor)
          .lerp(shaftDawnColor, dawnAmt)
          .lerp(shaftGoldenColor, goldenAmt);

        const sceneLit = frontOverride !== null ? 1 : clamp(Math.max(S.intro, frontVal * 2), 0, 1);
        (sl.fog as InstanceType<ThreeNS['Fog']>).color
          .copy(boneColor)
          .lerp(inkColor, c)
          .lerp(litClearColor, Math.max(sceneLit * (1 - c), c))
          .lerp(nightClearColor, clamp(nightAmt * 0.65, 0, 1));

        sun.intensity = 2 * sceneLit * (0.15 + 0.85 * dayArc) * (1 - nightAmt * 0.75) * lq;
        hemi.intensity = (0.08 + 0.47 * sceneLit * (0.25 + 0.75 * dayArc)) * (1 - nightAmt * 0.6) * lq;
        const nightLampBoost = 1 + nightAmt * 1.45 + duskAmt * 0.6;

        // Volumetric window light-shaft: physically anchored to the window frame (-4.0, 1.75, -0.20)
        // Rays emanate from window aperture and track the solar vector into the room
        const sunRayDx = 5.0; // vector from sun (-9.0) to window aperture (-4.0)
        const sunRayDy = 1.75 - sunY;
        const sunRayDz = -0.20 - sunZ;
        const shaftPitchZ = Math.atan2(sunRayDy, sunRayDx);
        const shaftYawY = Math.atan2(sunRayDz, sunRayDx);

        lightShaft.position.set(-4.0, 1.75, -0.20);
        lightShaft.rotation.set(0, shaftYawY, shaftPitchZ, 'ZYX');

        const shaftAlpha = 0.65 * sceneLit * dayArc * (1 + goldenAmt * 0.35 + dawnAmt * 0.2) * (1 - nightAmt) * (1 - c) * lq;
        lightShaft.visible = shaftAlpha > 0.01;
        shaftMat.opacity = shaftAlpha;

        const dustAlpha = 0.7 * sceneLit * lq;
        dust.visible = dustAlpha > 0.01;
        (dust.material as InstanceType<ThreeNS['PointsMaterial']>).opacity = dustAlpha;
      } else {
        sun.intensity = 2 * rl * lq;
        hemi.intensity = 0.08 + 0.47 * rl * lq;
        (dust.material as InstanceType<ThreeNS['PointsMaterial']>).opacity = 0.7 * rl * lq;
      }

      // Predictable Two-State Lighting System (Synchronized via pull cord / studio button / hotkey 'L')
      // State A: Main room light ON, table lamp OFF
      // State B: Main room light OFF, table lamp ON
      const roomLightTarget = st.roomLightOn ? 1.0 : 0.0;
      const lampTarget = st.roomLightOn ? 0.0 : 1.0;
      roomLightCurrent += (roomLightTarget - roomLightCurrent) * 0.16;
      lampCurrent += (lampTarget - lampCurrent) * 0.16;

      if (roomLight) {
        roomLight.intensity = roomLightCurrent * 2.6 * rl * lq;
      }
      if (roomLightCurrent > 0.001) {
        hemi.intensity += roomLightCurrent * 0.38 * rl * lq;
      }

      const activeLampBoost = !classic ? (1 + clamp((clamp((st.solarHour - 19.8) / 1.5, 0, 1) + clamp((6.8 - st.solarHour) / 0.8, 0, 1)), 0, 1) * 1.45 + clamp(1 - Math.abs(st.solarHour - 19.3) / 1.0, 0, 1) * 0.6) : 1;
      if (lamp) {
        lamp.intensity = lampCurrent * (2.8 + Math.sin(t * 3.5) * 0.05) * activeLampBoost * rl * lq;
      }
      if (lampShadeMat) {
        lampShadeMat.emissiveIntensity = (0.04 + lampCurrent * 1.6) * activeLampBoost;
      }
      if (lampCurrent > 0.001) {
        hemi.intensity += lampCurrent * 0.09 * rl * lq;
      }

      placeCamera(cam, e, c, q2, bq, cb, k, a);
      cam.updateMatrixWorld();

      // Raycast 3D CAD Telemetry HUD when cursor lens is active in Hero
      if (!classic && cadEl) {
        const showCad = S.intro > 0.35 && e < 0.55 && _q < 0.05;
        if (showCad) {
          cadFrameCount++;
          const pointerMoved = Math.hypot(st.lx - lastRaycastX, st.ly - lastRaycastY) > 2.5;
          if (pointerMoved || cadFrameCount % 4 === 0) {
            lastRaycastX = st.lx;
            lastRaycastY = st.ly;
            ndc.set((st.lx / st.w) * 2 - 1, -(st.ly / st.h) * 2 + 1);
            raycaster.setFromCamera(ndc, cam);
            const hits = raycaster.intersectObjects(raycastTargets, false);
            if (hits.length > 0) {
              const hit = hits[0];
              const cad = hit.object.userData.cad as CadInfo | undefined;
              lastHitPoint.copy(hit.point);
              if (cad) {
                if (activeCad?.code !== cad.code) {
                  activeCad = cad;
                  if (cadCodeEl) cadCodeEl.textContent = `${cad.code} · ELEV ${cad.elev}`;
                  if (cadNameEl) cadNameEl.textContent = cad.name;
                  if (cadMetaEl) cadMetaEl.textContent = `${cad.dims} · ${cad.material}`;
                  sound.playCadTick();
                }
                if (cadXyzEl) {
                  const p = hit.point;
                  cadXyzEl.textContent = `X ${p.x >= 0 ? '+' : ''}${p.x.toFixed(2)} · Y +${Math.max(0, p.y).toFixed(2)} · Z ${p.z >= 0 ? '+' : ''}${p.z.toFixed(2)}`;
                }
                cadEl.style.opacity = '1';
                const dockInside = st.lx + st.R0 + 235 > st.w;
                cadEl.style.right = dockInside ? '24px' : '-14px';
                cadEl.style.left = 'auto';
                cadEl.style.transform = dockInside ? 'translateX(0)' : 'translateX(100%)';
              }
            } else {
              cadEl.style.opacity = '0';
            }
          }
        } else {
          cadEl.style.opacity = '0';
        }
      }

      if (dust.visible && (dust.material as InstanceType<ThreeNS['PointsMaterial']>).opacity > 0.01) {
        const windBoost = 1 + Math.min(3.5, st.pointerSpeed * 0.08);
        for (let i = 0; i < N; i++) {
          pa[i * 3 + 1] += 0.0014 * (1 + (i % 3)) * windBoost;
          if (pa[i * 3 + 1] > 3) pa[i * 3 + 1] = 0;
          pa[i * 3] += Math.sin(t + i) * 0.0008 * windBoost;
        }
        pg.attributes.position.needsUpdate = true;
      }
      // In Plan and Build chapters (c > 0.05 or cb > 0), ensure rL uses the deep obsidian drafting table clear color
      if (c > 0.05 || cb > 0) {
        rL.setClearColor(colors.ink, 1);
      } else {
        rL.setClearColor(classic ? colors.litClear : colors.bone, classic ? 1 : 0);
      }

      // On mobile: intelligently cull occluded or invisible scenes to eliminate redundant draw calls and halve GPU fillrate
      const needW = !isMobile || S.intro < 0.95 || c < 0.95;
      const needL = !isMobile || S.intro > 0.005;

      if (needW) {
        rW.render(sw, cam);
      }
      if (needL) {
        rL.render(sl, cam);
      }
    },
  };

  // Expose verification hook for M0 + Upgrade acceptance tests.
  (window as unknown as Record<string, unknown>).__buildora = {
    get state() {
      return {
        T: S.T,
        draw: S.draw,
        intro: S.intro,
        build: S.build,
        p: S.p,
        P: st.P,
        ready: st.ready,
        lx: st.lx,
        ly: st.ly,
        lr: st.lr,
        R0: st.R0,
        solarHour: st.solarHour,
        solarAuto: st.solarAuto,
        paletteIdx: st.paletteIdx,
        studioOpen: st.studioOpen,
        activeCad: activeCad ? activeCad.code : null,
        uDraw: sketch.uniforms.uDraw.value,
        uFront: front?.uniforms.uFront.value ?? null,
        uSectionActive: front?.uniforms.uSectionActive.value ?? 0,
      };
    },
    setFront(v: number | null) {
      frontOverride = v;
    },
    setDraw(v: number | null) {
      drawOverride = v;
    },
    setSolarHour(hr: number, isManual = false) {
      setSolarHour(hr, isManual);
    },
    setSolarAuto(auto: boolean) {
      setSolarAuto(auto);
    },
    setRoomLight(on: boolean) {
      st.roomLightOn = on;
    },
    getRoomLight() {
      return st.roomLightOn;
    },
    getLampLight() {
      return !st.roomLightOn;
    },
    setPalette(idx: number) {
      triggerPalette(idx);
    },
    setStudioOpen(open: boolean) {
      st.studioOpen = open;
      const el = $('#studio');
      el.classList.toggle('open', open);
      el.setAttribute('aria-hidden', String(!open));
    },
    setScroll(targetP: number) {
      st.P = targetP;
      S.p = targetP <= 0 ? 0 : targetP / (3 / 2.88) + 0.12;
    },
    setCursor(x: number, y: number, snap = false) {
      st.tx = x;
      st.ty = y;
      st.mx = x / st.w;
      st.my = y / st.h;
      st.last = performance.now() / 1000;
      if (snap) {
        st.lx = x;
        st.ly = y;
        st.mL = st.mx;
        st.nL = st.my;
      }
    },
    getRendererInfo() {
      return {
        w: { calls: rW.info.render.calls, triangles: rW.info.render.triangles, lines: rW.info.render.lines },
        l: { calls: rL.info.render.calls, triangles: rL.info.render.triangles },
      };
    },
    getCameraPose() {
      return {
        position: cam.position.toArray(),
        up: cam.up.toArray(),
        quaternion: cam.quaternion.toArray(),
      };
    },
    checkRegistration() {
      cam.updateMatrixWorld(true);
      let maxDeltaPx = 0;
      let count = 0;
      const vO = new THREE.Vector3();
      const vE = new THREE.Vector3();
      for (const p of parts) {
        if (!p.e) continue;
        p.o.updateMatrixWorld(true);
        p.e.updateMatrixWorld(true);
        const posAttr = p.o.geometry.getAttribute('position');
        const step = Math.max(1, Math.floor(posAttr.count / 16));
        for (let i = 0; i < posAttr.count; i += step) {
          vO.fromBufferAttribute(posAttr, i).applyMatrix4(p.o.matrixWorld).project(cam);
          vE.fromBufferAttribute(posAttr, i).applyMatrix4(p.e.matrixWorld).project(cam);
          const dx = (vO.x - vE.x) * 0.5 * st.w;
          const dy = (vO.y - vE.y) * 0.5 * st.h;
          const d = Math.hypot(dx, dy);
          if (d > maxDeltaPx) maxDeltaPx = d;
          count++;
        }
      }
      return { maxDeltaPx, sampledVertices: count };
    },
    measureCanvases() {
      const glW = rW.getContext();
      const glL = rL.getContext();
      const width = W.width;
      const height = W.height;
      const total = width * height;
      const bufW = new Uint8Array(total * 4);
      const bufL = new Uint8Array(total * 4);
      glW.readPixels(0, 0, width, height, glW.RGBA, glW.UNSIGNED_BYTE, bufW);
      glL.readPixels(0, 0, width, height, glL.RGBA, glL.UNSIGNED_BYTE, bufL);
      let paperPixels = 0;
      let linePixels = 0;
      let solidPixels = 0;
      let partialPixels = 0;
      let zeroPixels = 0;
      for (let i = 0; i < total; i++) {
        const idx = i * 4;
        const r = bufW[idx] / 255;
        const g = bufW[idx + 1] / 255;
        const b = bufW[idx + 2] / 255;
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if (lum >= 0.85) paperPixels++;
        else linePixels++;

        const a = bufL[idx + 3];
        if (a === 255) solidPixels++;
        else if (a === 0) zeroPixels++;
        else partialPixels++;
      }
      return {
        width,
        height,
        total,
        w: {
          paperPixels,
          linePixels,
          paperShare: paperPixels / total,
          lineShare: linePixels / total,
        },
        l: {
          solidPixels,
          partialPixels,
          zeroPixels,
          solidViewportShare: solidPixels / total,
          partialViewportShare: partialPixels / total,
        },
      };
    },
  };

  return api;
}

function isFrontGridScale(classicMode: boolean) {
  return classicMode ? 0.75 : 1;
}

export async function loadScene(): Promise<SceneApi | null> {
  try {
    const [THREE, { RoundedBoxGeometry }] = await Promise.all([
      import('three'),
      import('three/examples/jsm/geometries/RoundedBoxGeometry.js'),
    ]);
    // Yield to main thread to permit initial browser paint and unblock FCP
    await new Promise((resolve) => setTimeout(resolve, 0));
    return create(THREE, RoundedBoxGeometry);
  } catch (err) {
    console.error('[buildora] Failed to load the 3D scene:', err);
    return null;
  }
}
