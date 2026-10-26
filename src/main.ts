import { sound } from './audio';
import { initThemeWatcher } from './preferences';
import { initSettingsPanel } from './settingsPanel';
import { updateChapters } from './chapters';
import { holdAfterPlan, remapSideways } from './chapters/plan';
import { initCursor, updateCursor } from './cursor';
import { L, W, ring } from './dom';
import { initInput } from './input';
import { seekIntroClock, startIntro } from './intro';
import { initRouter, setRouterSceneApi } from './router';
import { loadScene, type SceneApi } from './scene';
import { S, classic, debugDraw, debugFront, debugT, reduce, st, touch, type Progress } from './state';
import { idle, introClock, scroll, smooth } from './tokens/motion';
import { $, clamp } from './utils';
import { initTypographyEngine, revealHeroTypography } from './typography';

// Three.js is loaded lazily; until it resolves `gl` is null and frames skip drawing (like the original no-WebGL path).
let gl: SceneApi | null = null;

function setStudio(open: boolean) {
  st.studioOpen = open;
  const studioEl = $('#studio');
  studioEl.classList.toggle('open', open);
  studioEl.setAttribute('aria-hidden', String(!open));
  const backdrop = document.getElementById('studio-backdrop');
  if (backdrop) {
    backdrop.classList.toggle('active', open);
  }
  document.body.classList.toggle('studio-drawer-open', open);
}

function initStudioControls() {
  const openBtn = document.getElementById('open-studio');
  const openMatBtn = document.getElementById('open-materials');
  const fcardMatBtn = document.getElementById('fcard-open-materials');
  const navStudioBtn = document.getElementById('nav-studio');
  const closeBtn = document.getElementById('close-studio');
  const solarRange = document.getElementById('solar-range') as HTMLInputElement | null;
  const solarAutoBtn = document.getElementById('solar-auto');
  const sndBtn = document.getElementById('snd');

  const openHandler = (e: Event) => {
    e.preventDefault();
    setStudio(!st.studioOpen);
  };
  openBtn?.addEventListener('click', openHandler);
  
  const openMaterialsAction = (e: Event) => {
    e.preventDefault();
    S.p = 0;
    setStudio(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  openMatBtn?.addEventListener('click', openMaterialsAction);
  fcardMatBtn?.addEventListener('click', openMaterialsAction);
  closeBtn?.addEventListener('click', () => setStudio(false));
  document.getElementById('studio-backdrop')?.addEventListener('click', () => setStudio(false));

  const markManualSolar = () => {
    st.solarAuto = false;
    solarAutoBtn?.classList.remove('on');
    solarAutoBtn?.setAttribute('aria-pressed', 'false');
  };

  solarAutoBtn?.addEventListener('click', () => {
    st.solarAuto = !st.solarAuto;
    solarAutoBtn.classList.toggle('on', st.solarAuto);
    solarAutoBtn.setAttribute('aria-pressed', String(st.solarAuto));
    gl?.setSolarAuto(st.solarAuto);
  });

  solarRange?.addEventListener('pointerdown', markManualSolar);
  solarRange?.addEventListener('input', () => {
    markManualSolar();
    gl?.setSolarHour(Number(solarRange.value), true);
  });
  solarRange?.addEventListener('change', markManualSolar);

  document.querySelectorAll<HTMLButtonElement>('.st-beats button[data-hour]').forEach((btn) => {
    btn.addEventListener('click', () => {
      markManualSolar();
      gl?.setSolarHour(Number(btn.dataset.hour), true);
    });
  });

  document.querySelectorAll<HTMLButtonElement>('.st-pals button').forEach((btn) => {
    btn.addEventListener('click', () => {
      gl?.setPalette(Number(btn.dataset.pal));
    });
  });

  sndBtn?.addEventListener('click', () => {
    const on = sound.toggle();
    sndBtn.classList.toggle('on', on);
    sndBtn.setAttribute('aria-pressed', String(on));
    sndBtn.textContent = on ? 'Sound On' : 'Sound Off';
  });

  initPullCordLight();
  initMobileNav();
  initApproachInteractions();
  initLegalModal();
  initThemeWatcher();
  initSettingsPanel();
}

function initLegalModal() {
  const modal = document.getElementById('legal-modal') as HTMLDialogElement | null;
  const closeBtn = document.getElementById('close-legal-modal');
  const titleEl = document.getElementById('legal-modal-title');
  const bodyEl = document.getElementById('legal-modal-body');
  if (!modal || !titleEl || !bodyEl) return;

  const LEGAL_CONTENT: Record<string, { title: string; html: string }> = {
    about: {
      title: 'About Buildora & Build with Yash',
      html: `
        <p><strong>Buildora</strong> is an interactive architectural design and 3D spatial visualization studio created by <strong>Yash Jha (Build with Yash)</strong>, based in Patna, Bihar, India and working with clients worldwide.</p>
        <p>We bridge the gap between two-dimensional floor plans and lived architectural spaces. Using real-time WebGL daylight simulation, physical material palettes, and exact orthographic geometry, we let homeowners, architects, and cultural institutions experience and refine every room before construction begins.</p>
        <p><strong>Direct Atelier Contact:</strong> <a href="mailto:iyashjha@gmail.com">iyashjha@gmail.com</a></p>
      `,
    },
    privacy: {
      title: 'Privacy Policy',
      html: `
        <p><strong>Effective Date:</strong> January 2026</p>
        <p>Buildora (operated by Build with Yash) respects your privacy. We do not sell, rent, or trade any personal information.</p>
        <p><strong>Information We Collect:</strong> When you submit a project enquiry through our contact form or email us directly at <code>iyashjha@gmail.com</code>, we receive only the contact details and project brief you choose to share so we can respond to your commission enquiry.</p>
        <p><strong>Cookies &amp; Local Storage:</strong> Buildora does not use third-party advertising trackers. Any client-side state (such as theme, lighting, or studio preferences) stays locally in your browser session.</p>
      `,
    },
    terms: {
      title: 'Terms of Service',
      html: `
        <p><strong>Effective Date:</strong> January 2026</p>
        <p>All architectural drawings, 3D spatial models, custom shaders, and case study visualizations on Buildora are the intellectual property of <strong>Build with Yash (Yash Jha)</strong> unless otherwise noted in a client commission agreement.</p>
        <p><strong>Use of Interactive Studio:</strong> You may freely explore the interactive 3D studio and case studies for personal evaluation and project inspiration. Commercial redistribution or reproduction of the 3D assets, code, or architectural drawings requires prior written permission.</p>
      `,
    },
  };

  document.querySelectorAll<HTMLButtonElement>('[data-legal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.legal || 'privacy';
      const entry = LEGAL_CONTENT[key] || LEGAL_CONTENT.privacy;
      titleEl.textContent = entry.title;
      bodyEl.innerHTML = entry.html;
      if (typeof modal.showModal === 'function') {
        modal.showModal();
      } else {
        modal.setAttribute('open', 'true');
      }
    });
  });

  const closeModal = () => {
    if (typeof modal.close === 'function' && modal.open) {
      modal.close();
    } else {
      modal.removeAttribute('open');
    }
  };

  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

function initApproachInteractions() {
  const words = document.querySelectorAll<HTMLButtonElement>('.ap-word[data-stage]');
  const cards = document.querySelectorAll<HTMLElement>('.approach-strip .strip-card');

  const setStage = (stage: string) => {
    words.forEach((w) => {
      const active = w.dataset.stage === stage;
      w.classList.toggle('is-active', active);
      w.setAttribute('aria-pressed', String(active));
    });
    cards.forEach((c) => {
      const highlight = c.dataset.stage === stage;
      c.classList.toggle('is-highlighted', highlight);
    });
  };

  words.forEach((btn) => {
    const stage = btn.dataset.stage || '01';
    btn.addEventListener('mouseenter', () => {
      setStage(stage);
      if (stage === '03') {
        sound.playWordShimmer(2);
      } else {
        sound.playDraftingStroke();
      }
    });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setStage(stage);
      const targetCard = document.getElementById(`stage-card-${stage}`);
      if (targetCard && window.innerWidth <= 900) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  cards.forEach((card) => {
    const stage = card.dataset.stage || '01';
    card.addEventListener('mouseenter', () => {
      setStage(stage);
    });
  });
}

function initPullCordLight() {
  const pullCordWrap = document.getElementById('pull-cord-wrap');
  const cordHandle = document.getElementById('cord-handle') as HTMLButtonElement | null;
  const ciState = document.getElementById('ci-state');
  const roomLightBtn = document.getElementById('room-light-btn');
  const slbText = roomLightBtn?.querySelector('.slb-text');

  if (!cordHandle) return;

  const updateLightUI = (isRoomLightOn: boolean) => {
    pullCordWrap?.classList.toggle('light-on', isRoomLightOn);
    cordHandle.setAttribute('aria-checked', String(isRoomLightOn));
    cordHandle.setAttribute(
      'aria-label',
      isRoomLightOn
        ? 'Switch to Table Lamp (Main Room Light currently ON)'
        : 'Switch to Main Room Light (Table Lamp currently ON)'
    );
    if (ciState) {
      ciState.textContent = isRoomLightOn ? 'MAIN ON' : 'LAMP ON';
    }

    if (roomLightBtn) {
      roomLightBtn.classList.toggle('on', isRoomLightOn);
      roomLightBtn.setAttribute('aria-pressed', String(isRoomLightOn));
      if (slbText) {
        slbText.textContent = isRoomLightOn ? 'Main Light · ON' : 'Table Lamp · ON';
      }
    }
  };

  const toggleLightingState = () => {
    st.roomLightOn = !st.roomLightOn;
    gl?.setRoomLight(st.roomLightOn);
    sound.playPullCord(st.roomLightOn);
    updateLightUI(st.roomLightOn);
  };

  // Coalesced single-trigger coordinator to prevent double-firing
  let lastToggleMs = 0;
  const TOGGLE_COOLDOWN = 180; // ms

  const handleUserToggle = () => {
    const now = performance.now();
    if (now - lastToggleMs < TOGGLE_COOLDOWN) return;
    lastToggleMs = now;
    toggleLightingState();
  };

  // Click handler (handles mouse click and touch tap)
  cordHandle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleUserToggle();
  });

  // Dedicated keyboard handler for Enter and Space
  cordHandle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleUserToggle();
    }
  });

  // Global hotkey 'L' / 'l' to toggle light (except in editable inputs)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'l' || e.key === 'L') {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.hasAttribute('contenteditable'))) {
        return;
      }
      handleUserToggle();
    }
  });

  // Studio Drawer Button sync
  roomLightBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    handleUserToggle();
  });

  // Set initial state matching state.ts (Main Light ON, Table Lamp OFF)
  updateLightUI(st.roomLightOn);
}

function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const header = document.getElementById('site-header');
  const nav = document.getElementById('site-nav');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  if (!toggleBtn || !header || !nav) return;

  const setOpen = (open: boolean) => {
    header.classList.toggle('nav-open', open);
    toggleBtn.setAttribute('aria-expanded', String(open));
    toggleBtn.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    if (backdrop) backdrop.classList.toggle('active', open);
    document.body.classList.toggle('nav-menu-open', open);
  };

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = header.classList.contains('nav-open');
    setOpen(!isOpen);
  });

  backdrop?.addEventListener('click', () => setOpen(false));

  nav.querySelectorAll('a, button').forEach((el) => {
    el.addEventListener('click', () => {
      setOpen(false);
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (header.classList.contains('nav-open')) {
        setOpen(false);
        toggleBtn.focus();
      } else if (st.studioOpen) {
        setStudio(false);
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (header.classList.contains('nav-open')) {
      const target = e.target as HTMLElement | null;
      if (!target?.closest('#site-header') && !target?.closest('#mobile-nav-backdrop')) {
        setOpen(false);
      }
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && header.classList.contains('nav-open')) {
      setOpen(false);
    }
  });
}

let layoutW = 0;
let stableH = 0;
/** Height of the *large* viewport (address bar collapsed) so the canvas never needs to grow mid-scroll. */
function largeViewportHeight() {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none';
  document.body.appendChild(probe);
  const h = probe.getBoundingClientRect().height;
  probe.remove();
  return Math.max(innerHeight, Math.round(h));
}
function layout() {
  const nextW = innerWidth;
  const nextIsMobile = nextW < 768;
  if (nextIsMobile) {
    // iOS Safari fires `resize` (height-only) whenever the address bar collapses/expands. Re-laying out the
    // canvas + camera + scene targets on each of those makes the scene stretch, blur and jitter mid-scroll.
    // Lock to the large-viewport height for this width (reset on rotation) and ignore height-only changes.
    if (nextW === layoutW && stableH) {
      stableH = Math.max(stableH, innerHeight);
      if (stableH === st.h) return;
    } else {
      stableH = largeViewportHeight();
    }
    layoutW = nextW;
    st.w = nextW;
    st.h = stableH;
    document.documentElement.style.setProperty('--stable-vh', stableH + 'px');
  } else {
    layoutW = nextW;
    stableH = 0;
    st.w = nextW;
    st.h = innerHeight;
    document.documentElement.style.removeProperty('--stable-vh');
  }
  const isMobile = st.w < 768;
  if (isMobile) {
    st.tx = st.w * 0.54;
    st.ty = st.h * 0.36;
    st.R0 = Math.min(st.w, st.h) * 0.21;
  } else {
    st.R0 = Math.min(st.w, st.h) * 0.15;
  }
  ring.style.width = ring.style.height = st.R0 * 2 + 'px';
  gl && gl.size();
}
addEventListener('resize', layout);
layout();

if (classic) {
  startIntro();
}

loadScene().then((api) => {
  gl = api;
  setRouterSceneApi(api);
  if (gl) {
    gl.size();
  } else {
    const webglNotice = document.createElement('div');
    webglNotice.id = 'webgl-fallback-banner';
    webglNotice.setAttribute('role', 'status');
    webglNotice.style.cssText =
      'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);z-index:9000;background:rgba(18,15,13,0.92);border:1px solid rgba(223,186,115,0.35);color:#f7f3ed;padding:0.6rem 1.2rem;border-radius:6px;font-family:Manrope,sans-serif;font-size:0.75rem;letter-spacing:0.04em;backdrop-filter:blur(10px);pointer-events:none;';
    webglNotice.textContent = 'WebGL acceleration is unavailable in this environment. Showing architectural plan view.';
    document.body.appendChild(webglNotice);
  }
  if (!classic) {
    startIntro();
  }
  const dbg = (
    window as unknown as {
      __buildora?: { setFront?: (v: number | null) => void; setDraw?: (v: number | null) => void; setT?: (sec: number) => void };
    }
  ).__buildora;
  if (dbg) {
    dbg.setT = (sec: number) => {
      if (sec >= 8.4) {
        dbg.setFront?.(1.0);
      } else {
        dbg.setFront?.(null);
      }
      dbg.setDraw?.(null);
      seekIntroClock(sec);
    };
  }
});

initInput();
initStudioControls();
initCursor();
initRouter();
initTypographyEngine();

// Synchronize virtual 3D progress S.p with natural page scroll through the complete architectural build journey
let cachedJH = 2400;
let lastMeasuredWidth = 0;
let scrollTicking = false;

export function getJourneyHeight(): number {
  return cachedJH;
}

function measureJourneyHeight(force = false) {
  const currentWidth = window.innerWidth;
  // Stop track-height drift: ignore height-only resize events (such as iOS Safari address bar collapsing/expanding)
  if (!force && lastMeasuredWidth > 0 && Math.abs(currentWidth - lastMeasuredWidth) < 2) {
    return;
  }
  lastMeasuredWidth = currentWidth;

  const studioSec = document.getElementById('studio-section');
  // Use stable viewport height for mobile calculation
  const baseH = typeof window !== 'undefined' && 'innerHeight' in window ? window.innerHeight : 844;
  cachedJH = studioSec ? Math.max(studioSec.offsetHeight - baseH, 1600) : 2400;
}
window.addEventListener('resize', () => measureJourneyHeight(false), { passive: true });
measureJourneyHeight(true);

const cachedFootEl = document.querySelector<HTMLElement>('.foot');
const cachedBldEl = document.getElementById('bld');
const cachedCapEl = document.getElementById('cap');
const cachedHeroEl = document.querySelector<HTMLElement>('main');
const cachedPullCordWrap = document.getElementById('pull-cord-wrap');
const cachedHeroTelemetry = document.getElementById('hero-telemetry');
let studioCanvasesCulled = false;

function updateScrollProgress() {
  const scrollY = window.scrollY || window.pageYOffset;
  if (!st.ready) {
    if (scrollY <= 4) return;
    // If the visitor actively scrolls while the intro clock is still running, unlock immediately so touch scroll never feels stuck
    if (debugT === null && debugDraw === null && debugFront === null) {
      st.ready = true;
      const pre = document.getElementById('pre');
      if (pre) {
        pre.style.pointerEvents = 'none';
        pre.style.display = 'none';
      }
      seekIntroClock(introClock.total);
    } else {
      return;
    }
  }
  const jH = cachedJH;

  // Map scroll through studio section (0..jH) smoothly into S.p = 0..3.0
  S.p = clamp((scrollY / jH) * 3.0, 0, 3.0);

  // Transition UI elements as user scrolls past the completed build journey into Selected Works
  const exitProgress = clamp((scrollY - jH) / 250, 0, 1);

  if (exitProgress > 0) {
    if (cachedFootEl) cachedFootEl.style.opacity = String(Math.max(0, 1 - exitProgress));
    if (cachedBldEl) {
      cachedBldEl.style.opacity = String(Math.max(0, 1 - exitProgress));
      if (exitProgress >= 1) cachedBldEl.style.visibility = 'hidden';
    }
    if (cachedCapEl) cachedCapEl.style.opacity = String(Math.max(0, 1 - exitProgress));
    if (cachedHeroEl) {
      cachedHeroEl.style.opacity = '0';
      cachedHeroEl.style.visibility = 'hidden';
    }
    if (cachedPullCordWrap) {
      cachedPullCordWrap.style.opacity = String(Math.max(0, 1 - exitProgress * 2));
      cachedPullCordWrap.style.pointerEvents = exitProgress > 0.5 ? 'none' : 'auto';
    }
    if (cachedHeroTelemetry) {
      cachedHeroTelemetry.style.opacity = String(Math.max(0, 1 - exitProgress * 2));
      cachedHeroTelemetry.style.pointerEvents = exitProgress > 0.5 ? 'none' : 'auto';
    }
  } else {
    if (cachedFootEl) cachedFootEl.style.opacity = '';
    if (cachedBldEl) {
      cachedBldEl.style.opacity = '';
      cachedBldEl.style.visibility = '';
    }
    if (cachedHeroEl) cachedHeroEl.style.visibility = '';
    if (cachedPullCordWrap) {
      cachedPullCordWrap.style.opacity = '';
      cachedPullCordWrap.style.pointerEvents = '';
    }
    if (cachedHeroTelemetry) {
      cachedHeroTelemetry.style.opacity = '';
      cachedHeroTelemetry.style.pointerEvents = '';
    }
  }
}

window.addEventListener(
  'scroll',
  () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(() => {
        updateScrollProgress();
        scrollTicking = false;
      });
    }
  },
  { passive: true },
);
updateScrollProgress();

let lastFrameMs = 0;

function frame(ms: number) {
  requestAnimationFrame(frame);
  if (document.hidden) return;

  if (lastFrameMs === 0) lastFrameMs = ms;
  const dt = Math.min((ms - lastFrameMs) * 0.001, 0.1);
  lastFrameMs = ms;

  const t = ms * 0.001,
    isIdle = reduce || t - st.last > idle.after;
  if (isIdle) {
    if (st.w < 768) {
      st.tx = st.w * (0.54 + 0.08 * Math.sin(t * 0.5));
      st.ty = st.h * (0.36 + 0.04 * Math.cos(t * 0.7));
    } else {
      st.tx = st.w * (0.66 + 0.06 * Math.sin(t * 0.5));
      st.ty = st.h * (0.5 + 0.05 * Math.cos(t * 0.7));
    }
  }
  st.lx += (st.tx - st.lx) * smooth.lens;
  st.ly += (st.ty - st.ly) * smooth.lens;
  updateCursor(t, dt);

  // If user is currently browsing a dedicated case study overlay or 404, canvases are hidden
  const isModalActive = window.location.pathname.startsWith('/projects/') || window.location.pathname === '/404' || window.location.pathname === '/status';
  if (isModalActive) {
    return;
  }

  // When scrolled past the Studio into Approach / Projects / Contact / Footer, canvases are hidden behind solid background.
  // Skipping WebGL draw calls AND setting visibility:hidden eliminates GPU fillrate and compositor overhead under backdrop-filter cards.
  const isStudioVisible = (window.scrollY || window.pageYOffset) <= cachedJH + 350;
  if (!isStudioVisible) {
    if (!studioCanvasesCulled) {
      studioCanvasesCulled = true;
      W.style.visibility = 'hidden';
      L.style.visibility = 'hidden';
      ring.style.visibility = 'hidden';
      if (cachedHeroEl) {
        cachedHeroEl.style.opacity = '0';
        cachedHeroEl.style.visibility = 'hidden';
        cachedHeroEl.style.pointerEvents = 'none';
      }
    }
    return;
  } else if (studioCanvasesCulled) {
    studioCanvasesCulled = false;
    W.style.visibility = '';
    L.style.visibility = '';
    ring.style.visibility = '';
  }

  const progressSmoothing = st.w < 768 ? 0.12 : smooth.progress;
  st.P += (Math.max(0, S.p - scroll.lead) * scroll.span - st.P) * progressSmoothing;
  st.mL += (st.mx - st.mL) * smooth.tilt;
  st.nL += (st.my - st.nL) * smooth.tilt;
  const P = holdAfterPlan(st.P),
    P1 = Math.min(P, 1),
    e = P1 * P1 * (3 - 2 * P1),
    q = clamp(P - 1, 0, 1),
    c0 = clamp(q / 0.3, 0, 1),
    cs = c0 * c0 * (3 - 2 * c0),
    q2 = remapSideways(clamp((q - 0.3) / 0.7, 0, 1)),
    bq = clamp(P - 2, 0, 1),
    cb0 = clamp(bq / 0.15, 0, 1),
    cb = cb0 * cb0 * (3 - 2 * cb0);
  const p: Progress = { t, P, e, q, cs, q2, bq, cb };
  updateChapters(p);

  // Smooth automatic solar progression through daylight, golden hour, dusk, night, and dawn
  if (st.ready && st.solarAuto && !reduce && gl) {
    if (cb > 0.6 && bq >= 0.75) {
      const targetHour = 17.5;
      st.solarHour += (targetHour - st.solarHour) * Math.min(dt * 1.8, 0.08);
    } else {
      st.solarHour += dt * 0.22;
      if (st.solarHour > 22.0) {
        st.solarHour = 6.0 + (st.solarHour - 22.0);
      }
    }
    gl.setSolarHour(st.solarHour, false);
  }

  gl && gl.draw(t, e, q, cs * (1 - cb), q2, bq, cb);
}
requestAnimationFrame(frame);
