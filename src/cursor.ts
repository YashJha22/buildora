import { sound } from './audio';
import { reduce, st, touch } from './state';
import { clamp } from './utils';

let curWrap: HTMLElement | null = null;
let curDot: HTMLElement | null = null;
let curHammer: HTMLElement | null = null;
let curRipple: HTMLElement | null = null;
let curSpark: HTMLElement | null = null;

let mouseX = innerWidth * 0.5;
let mouseY = innerHeight * 0.5;
let curX = mouseX;
let curY = mouseY;
let prevX = mouseX;
let hammerAngle = 0;
let hammerTargetAngle = 0;
let hammerOffsetX = 0;
let hammerOffsetY = 0;
let isStriking = false;
let strikeStartMs = 0;
let hasImpacted = false;
let isHoveringInteractive = false;
let hasMovedPointer = false;

function applyCursorTransform() {
  if (curWrap) {
    curWrap.style.transform = `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0)`;
  }
  if (curHammer) {
    // Base offset (-1.5px, -24.5px) places the flat striking face at (+4.9px, -2.8px), aimed dead-center at the (0,0) 3px dot
    curHammer.style.transform = `translate3d(${(-1.5 + hammerOffsetX).toFixed(1)}px, ${(-24.5 + hammerOffsetY).toFixed(1)}px, 0) rotate(${hammerAngle.toFixed(1)}deg)`;
  }
}

function fireImpactVisuals() {
  if (hasImpacted) return;
  hasImpacted = true;
  if (curRipple && curSpark) {
    const rAnims = curRipple.getAnimations();
    const sAnims = curSpark.getAnimations();
    if (rAnims.length > 0 && sAnims.length > 0) {
      rAnims.forEach((a) => {
        a.currentTime = 0;
        a.play();
      });
      sAnims.forEach((a) => {
        a.currentTime = 0;
        a.play();
      });
    } else {
      curRipple.classList.remove('active');
      curSpark.classList.remove('active');
      // Use microtask instead of forced synchronous layout reflow
      queueMicrotask(() => {
        curRipple?.classList.add('active');
        curSpark?.classList.add('active');
      });
    }
  }
}

export function initCursor() {
  const isPointerFine = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!isPointerFine || touch) return;

  curWrap = document.getElementById('cur-wrap');
  curDot = document.getElementById('cur-dot');
  curHammer = document.getElementById('cur-hammer');
  curRipple = document.getElementById('cur-ripple');
  curSpark = document.getElementById('cur-spark');

  if (!curWrap) return;

  let lastHoverTarget: Element | null = null;

  const onPointerMove = (e: PointerEvent) => {
    hasMovedPointer = true;
    mouseX = e.clientX;
    mouseY = e.clientY;
    const target = e.target instanceof Element ? e.target : null;
    if (target === lastHoverTarget) return;
    lastHoverTarget = target;

    const isInsideSettings =
      !!target?.closest('#settings-panel, #settings-panel-overlay, .header-settings-btn') ||
      document.body.classList.contains('settings-open') ||
      document.body.classList.contains('settings-sheet-open');

    isHoveringInteractive =
      isInsideSettings ||
      !!target?.closest(
        'a, button, input, textarea, select, [role="button"], [role="slider"], label, .slider-knob, .handle-knob, .ssc-btn, .lic-tab, .alc-btn, .vcc-step-btn, .quick-jump-btn, .st-beats button, .st-pals button, [data-link]'
      );
    const isHoveringText =
      !isHoveringInteractive &&
      !!target?.closest(
        'h1, h2, h3, h4, h5, h6, p, dl, dt, dd, li, blockquote, .cs-title, .cs-tagline, .cs-lead-desc, .cs-section-title, .cs-section-sub, .sub, .card-tagline, .card-concept, .card-project-title, .lic-title, .lic-desc, .closing-title, .closing-desc, .contact-manifesto-sub, .contact-hero-display, .heading-word, .word'
      );

    if (curDot) {
      curDot.classList.toggle('hover', isHoveringInteractive);
    }
    if (curHammer) {
      curHammer.classList.toggle('ui-hover', isHoveringInteractive);
      curHammer.classList.toggle('text-hover', isHoveringText);
    }
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return; // Primary click only
    const target = e.target instanceof Element ? e.target : null;
    if (
      target?.closest('input[type="range"]') ||
      target?.closest('#settings-panel, #settings-panel-overlay, .header-settings-btn') ||
      document.body.classList.contains('settings-open') ||
      document.body.classList.contains('settings-sheet-open')
    ) {
      return;
    }
    triggerHammerStrike(e.clientX, e.clientY);
  };

  addEventListener('pointermove', onPointerMove, { passive: true });
  addEventListener('pointerdown', onPointerDown);

  document.body.classList.add('custom-cursor-active');
}

export function triggerHammerStrike(_x: number, _y: number) {
  if (touch || !curHammer || !curRipple) return;

  if (reduce) {
    sound.playHammerStrike();
    hasImpacted = false;
    fireImpactVisuals();
    return;
  }

  // Prevent interrupting an ongoing hammer strike animation (takes ~190ms)
  if (isStriking && performance.now() - strikeStartMs < 180) {
    return;
  }

  isStriking = true;
  hasImpacted = false;
  strikeStartMs = performance.now();

  // Audio tap (if unmuted)
  sound.playHammerStrike();
}

export function updateCursor(_t: number, dt: number) {
  if (touch || !curWrap) return;

  // If the user hasn't physically moved their pointer yet, follow the idle roam position
  const targetX = hasMovedPointer ? mouseX : st.lx;
  const targetY = hasMovedPointer ? mouseY : st.ly;

  // Smooth responsive sub-pixel tracking for the cursor wrapper without lag or jitter
  const follow = Math.min(1, dt * 75);
  curX += (targetX - curX) * follow;
  curY += (targetY - curY) * follow;
  if (Math.abs(targetX - curX) < 0.25) curX = targetX;
  if (Math.abs(targetY - curY) < 0.25) curY = targetY;

  const vx = curX - prevX;
  prevX = curX;

  if (isStriking) {
    const elapsed = performance.now() - strikeStartMs;

    if (elapsed < 55) {
      // Phase 1: Short wind-up (0-55ms) — cock hammer head back around wrist grip (+15deg)
      const p = clamp(elapsed / 55, 0, 1);
      const easeOut = 1 - (1 - p) * (1 - p);
      hammerAngle = 15 * easeOut;
      hammerTargetAngle = hammerAngle;
      hammerOffsetX = 1.8 * easeOut;
      hammerOffsetY = -1.8 * easeOut;
    } else if (elapsed < 100) {
      // Phase 2: Decisive downward strike (55-100ms) — drive flat striking face onto the 3px hotspot (-9deg)
      const p = clamp((elapsed - 55) / 45, 0, 1);
      const easeIn = p * p;
      hammerAngle = 15 - 24 * easeIn;
      hammerTargetAngle = hammerAngle;
      hammerOffsetX = 1.8 - 4.0 * easeIn;
      hammerOffsetY = -1.8 + 3.4 * easeIn;
      if (p >= 0.65) {
        fireImpactVisuals();
      }
    } else if (elapsed < 135) {
      // Phase 3: Crisp impact contact at the pointer hotspot (100-135ms)
      fireImpactVisuals();
      hammerAngle = -9;
      hammerTargetAngle = -9;
      hammerOffsetX = -2.2;
      hammerOffsetY = 1.6;
    } else if (elapsed < 260) {
      // Phase 4: Quick recovery back to poised idle angle (135-260ms)
      fireImpactVisuals();
      const p = clamp((elapsed - 135) / 125, 0, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      const rest = isHoveringInteractive ? 4 : 0;
      hammerAngle = -9 + (rest - -9) * ease;
      hammerTargetAngle = hammerAngle;
      hammerOffsetX = -2.2 * (1 - ease);
      hammerOffsetY = 1.6 * (1 - ease);
    } else {
      isStriking = false;
      hammerTargetAngle = isHoveringInteractive ? 4 : 0;
      hammerAngle = hammerTargetAngle;
      hammerOffsetX = 0;
      hammerOffsetY = 0;
    }
  } else {
    // Stable when idle; restrained, non-wobbling lag only on deliberate pointer movement
    const baseAngle = isHoveringInteractive ? 4 : 0;
    const moveTilt = Math.abs(vx) < 0.45 ? 0 : clamp(vx * 0.035, -3.5, 3.5);
    hammerTargetAngle = baseAngle + moveTilt;
    const angleFollow = Math.min(1, dt * 16);
    hammerAngle += (hammerTargetAngle - hammerAngle) * angleFollow;
    if (Math.abs(hammerAngle - baseAngle) < 0.05) {
      hammerAngle = baseAngle;
    }
  }

  applyCursorTransform();
}
