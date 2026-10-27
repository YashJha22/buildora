/**
 * Buildora — Contextual In-Page Settings Panel
 * Replaces the standalone /settings route with an integrated in-page popover (desktop)
 * and bottom sheet (mobile), keeping the 3D scene and page context fully visible.
 */

import { preferences, getResolvedTheme, type ThemeMode, type UserPreferences } from './preferences';
import { sound } from './audio';
import { LampPhysics } from './lampPhysics';

let panelOverlay: HTMLElement | null = null;
let panel: HTMLElement | null = null;
let headerBtn: HTMLElement | null = null;
let lampPhysics: LampPhysics | null = null;
let isOpen = false;
let previousActiveElement: HTMLElement | null = null;

export function isSettingsPanelOpen(): boolean {
  return isOpen;
}

export function openSettingsPanel() {
  if (isOpen || !panelOverlay || !panel) return;
  isOpen = true;
  previousActiveElement = document.activeElement as HTMLElement | null;

  panelOverlay.style.display = 'block';
  document.body.classList.add('settings-open');
  requestAnimationFrame(() => {
    panelOverlay?.classList.add('is-open');
    panelOverlay?.setAttribute('aria-hidden', 'false');
    panel?.classList.add('is-open');
  });
  headerBtn?.setAttribute('aria-expanded', 'true');

  // Prevent background touch scrolling on mobile while open
  if (window.innerWidth <= 768) {
    document.body.classList.add('settings-sheet-open');
  }

  // Resume continuous lamp physics simulation
  lampPhysics?.start();

  // Focus close button or panel for accessibility
  const closeBtn = document.getElementById('close-settings-btn');
  closeBtn?.focus();

  sound.playChapterSlide();
}

export function closeSettingsPanel() {
  if (!isOpen || !panelOverlay || !panel) return;
  isOpen = false;

  panelOverlay.classList.remove('is-open');
  panelOverlay.setAttribute('aria-hidden', 'true');
  panel.classList.remove('is-open');
  headerBtn?.setAttribute('aria-expanded', 'false');

  document.body.classList.remove('settings-sheet-open');
  document.body.classList.remove('settings-open');

  // Pause lamp physics simulation while panel is hidden to save CPU/GPU
  lampPhysics?.stop();

  setTimeout(() => {
    if (!isOpen && panelOverlay) {
      panelOverlay.style.display = 'none';
    }
  }, 280);

  // Restore focus to header button
  if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
    previousActiveElement.focus();
  } else {
    headerBtn?.focus();
  }
}

export function toggleSettingsPanel() {
  if (isOpen) {
    closeSettingsPanel();
  } else {
    openSettingsPanel();
  }
}

export function initSettingsPanel() {
  panelOverlay = document.getElementById('settings-panel-overlay');
  panel = document.getElementById('settings-panel');
  headerBtn = document.getElementById('header-settings-btn');

  if (!panelOverlay || !panel) return;

  const closeBtn = document.getElementById('close-settings-btn');
  const pillDark = document.getElementById('sp-pill-dark');
  const pillLight = document.getElementById('sp-pill-light');
  const pillSystem = document.getElementById('sp-pill-system');
  const captionEl = document.getElementById('sp-appearance-caption');
  const switchNotif = document.getElementById('sp-switch-notifications');
  const switchSounds = document.getElementById('sp-switch-sounds');
  const switchPreviews = document.getElementById('sp-switch-previews');

  // Initialize Lamp Physics with unified SVG elements
  const lampSvg = document.querySelector<SVGSVGElement>('.sp-lamp-svg');
  const cordPath = document.getElementById('sp-cord-curve') as SVGPathElement | null;
  const bead = document.getElementById('sp-cord-bead') as SVGCircleElement | null;
  const beadHighlight = document.getElementById('sp-cord-bead-hl') as SVGCircleElement | null;
  const beadHitbox = document.getElementById('sp-cord-hitbox') as SVGElement | null;
  const cone = document.querySelector<SVGElement>('.sp-cone-shape');
  const bulbGlow = document.querySelector<SVGElement>('.sp-bulb-glow-core');

  if (lampSvg && cordPath && bead && beadHighlight && beadHitbox && cone && bulbGlow) {
    lampPhysics = new LampPhysics({
      svgEl: lampSvg,
      cordPathEl: cordPath,
      beadEl: bead,
      beadHighlightEl: beadHighlight,
      beadHitboxEl: beadHitbox,
      coneEl: cone,
      bulbGlowEl: bulbGlow,
      onThemeCycle: () => {
        const currentMode = preferences.get().theme;
        const nextMode: ThemeMode =
          currentMode === 'dark' ? 'light' : currentMode === 'light' ? 'system' : 'dark';
        preferences.setTheme(nextMode);
      },
    });
  }

  // Open/Close triggers
  headerBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSettingsPanel();
  });

  closeBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    closeSettingsPanel();
  });

  // Close on outside/backdrop click
  panelOverlay.addEventListener('click', (e) => {
    if (e.target === panelOverlay) {
      closeSettingsPanel();
    }
  });

  // Close with Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      closeSettingsPanel();
    }
  });

  // Appearance 3-way segment buttons (Single source of truth)
  [
    { btn: pillDark, mode: 'dark' as ThemeMode },
    { btn: pillLight, mode: 'light' as ThemeMode },
    { btn: pillSystem, mode: 'system' as ThemeMode },
  ].forEach(({ btn, mode }) => {
    btn?.addEventListener('click', (e) => {
      e.preventDefault();
      sound.playMeasureSnap(mode === 'dark' ? 1600 : 2000);
      preferences.setTheme(mode);
    });
  });

  // Notifications toggle
  switchNotif?.addEventListener('click', (e) => {
    e.preventDefault();
    const current = preferences.get().notifications;
    sound.playMeasureSnap(!current ? 2200 : 1200);
    preferences.setNotifications(!current);
  });

  // Sounds toggle (synchronized with audio engine & #snd)
  switchSounds?.addEventListener('click', (e) => {
    e.preventDefault();
    const current = preferences.get().sound;
    preferences.setSound(!current);
  });

  // Message previews toggle
  switchPreviews?.addEventListener('click', (e) => {
    e.preventDefault();
    const current = preferences.get().messagePreviews;
    sound.playMeasureSnap(!current ? 2200 : 1200);
    preferences.setMessagePreviews(!current);
  });

  // Sync UI with preferences
  const updatePanelUI = (prefs: UserPreferences) => {
    const resolved = getResolvedTheme(prefs.theme);
    const isDark = resolved === 'dark';

    // Appearance Segment Pills
    pillDark?.setAttribute('aria-checked', String(prefs.theme === 'dark'));
    pillDark?.classList.toggle('is-selected', prefs.theme === 'dark');

    pillLight?.setAttribute('aria-checked', String(prefs.theme === 'light'));
    pillLight?.classList.toggle('is-selected', prefs.theme === 'light');

    pillSystem?.setAttribute('aria-checked', String(prefs.theme === 'system'));
    pillSystem?.classList.toggle('is-selected', prefs.theme === 'system');

    if (captionEl) {
      if (prefs.theme === 'system') {
        captionEl.textContent = `System default (${isDark ? 'Dark' : 'Light'})`;
      } else {
        captionEl.textContent = isDark ? 'Dark mode active' : 'Light mode active';
      }
    }

    // Switches
    switchNotif?.setAttribute('aria-checked', String(prefs.notifications));
    switchNotif?.classList.toggle('is-active', prefs.notifications);

    switchSounds?.setAttribute('aria-checked', String(prefs.sound));
    switchSounds?.classList.toggle('is-active', prefs.sound);

    switchPreviews?.setAttribute('aria-checked', String(prefs.messagePreviews));
    switchPreviews?.classList.toggle('is-active', prefs.messagePreviews);
  };

  preferences.subscribe(updatePanelUI);
}
