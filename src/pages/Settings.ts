/**
 * Buildora — Lamp-Inspired Settings Interface
 * Recreating the hanging vintage green lampshade with brass accents,
 * pull cord with tactile snap, profile card, and switches for:
 * 1) Theme: Dark mode, Light mode, and System default
 * 2) Notifications
 * 3) Sounds (synchronized with Buildora spatial audio engine)
 * 4) Message previews
 */

import { preferences, getResolvedTheme, type ThemeMode, type UserPreferences } from '../preferences';
import { sound } from '../audio';
import { navigateTo } from '../router';

export function renderSettingsPage(container: HTMLElement): () => void {
  container.innerHTML = `
    <div class="settings-page-wrapper" id="settings-page-wrapper">
      <div class="settings-backdrop-cone" id="settings-backdrop-cone" aria-hidden="true"></div>

      <div class="settings-inner">
        <!-- Top Bar: Settings Title + Close Navigation -->
        <header class="settings-top-bar">
          <h1 class="settings-title">Settings</h1>
          <button type="button" class="settings-close-btn" id="settings-close-btn" aria-label="Close settings">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
              <line x1="5" y1="5" x2="15" y2="15"/>
              <line x1="15" y1="5" x2="5" y2="15"/>
            </svg>
            <span class="scb-text">Close</span>
          </button>
        </header>

        <!-- Interactive Hanging Architectural Lamp -->
        <div class="settings-lamp-stage" id="settings-lamp-stage" role="region" aria-label="Interactive Pendant Lamp">
          <div class="settings-lamp-wrap">
            <!-- Suspension Cable -->
            <div class="lamp-suspension-cord" aria-hidden="true"></div>

            <!-- Conical Green Lampshade with Brass Accents -->
            <div class="lamp-shade-assembly" aria-hidden="true">
              <div class="lamp-brass-socket"></div>
              <svg class="lamp-shade-svg" viewBox="0 0 160 88" width="160" height="88">
                <defs>
                  <linearGradient id="shade-green-dark" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#2a5243"/>
                    <stop offset="45%" stop-color="#1d3d30"/>
                    <stop offset="100%" stop-color="#142b22"/>
                  </linearGradient>
                  <linearGradient id="shade-green-light" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#3b725c"/>
                    <stop offset="50%" stop-color="#2a5745"/>
                    <stop offset="100%" stop-color="#1e4133"/>
                  </linearGradient>
                  <linearGradient id="brass-accent" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#caa45a"/>
                    <stop offset="50%" stop-color="#f5d78e"/>
                    <stop offset="100%" stop-color="#a47d33"/>
                  </linearGradient>
                  <radialGradient id="bulb-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="40%" stop-color="#ffeed1"/>
                    <stop offset="85%" stop-color="#f5c26b"/>
                    <stop offset="100%" stop-color="rgba(245, 194, 107, 0)"/>
                  </radialGradient>
                </defs>

                <!-- Flared Lampshade Body -->
                <path class="shade-body" d="M 62 14 L 98 14 L 148 76 L 12 76 Z" />
                <!-- Top Brass Fitting Rim -->
                <rect x="61" y="10" width="38" height="5" rx="1.5" fill="url(#brass-accent)"/>
                <!-- Bottom Flanged Rim -->
                <ellipse cx="80" cy="76" rx="68" ry="8" fill="url(#brass-accent)"/>
                <!-- Shade Inner Recess -->
                <ellipse cx="80" cy="75" rx="64" ry="7" class="shade-interior"/>
              </svg>

              <!-- Exposed Incandescent Bulb -->
              <div class="lamp-bulb-wrap">
                <div class="lamp-bulb"></div>
                <div class="lamp-bulb-halo"></div>
              </div>
            </div>

            <!-- Hanging Pull Cord with Interactive Snap Bead -->
            <button type="button" class="lamp-pull-cord-btn" id="lamp-pull-cord" aria-label="Pull lamp cord to cycle theme mode">
              <svg class="pull-cord-svg" viewBox="0 0 40 160" width="40" height="160">
                <path id="pull-cord-line" d="M 12 0 C 12 40, 24 85, 20 135" fill="none" stroke="currentColor" stroke-width="2"/>
                <circle id="pull-cord-bead" cx="20" cy="142" r="7.5" fill="url(#brass-accent)"/>
                <circle cx="18" cy="139.5" r="2.2" fill="#fff" opacity="0.6"/>
              </svg>
              <span class="sr-only">Pull cord to toggle light</span>
            </button>
          </div>
        </div>

        <!-- Section 1: User Profile Card -->
        <section class="settings-card profile-card" aria-label="Profile">
          <div class="profile-avatar" id="profile-avatar" aria-hidden="true">
            <span class="profile-initials" id="profile-initials">AM</span>
          </div>
          <div class="profile-info">
            <h2 class="profile-name" id="profile-name">Alex Morgan</h2>
            <p class="profile-handle" id="profile-handle">@alex.morgan.lab</p>
          </div>
        </section>

        <!-- Section 2: Functional Settings List Card -->
        <section class="settings-card controls-card" aria-label="Preferences">
          <!-- Row 1: Dark theme (with Dark / Light / System Mode Segment) -->
          <div class="setting-row theme-setting-row">
            <div class="setting-meta">
              <span class="setting-label">Dark theme</span>
              <span class="setting-status-caption" id="theme-status-caption">Dark mode active</span>
            </div>
            <div class="setting-controls-group">
              <!-- Screenshot-matched toggle switch -->
              <button
                type="button"
                role="switch"
                class="settings-switch"
                id="switch-dark-theme"
                aria-checked="true"
                aria-label="Toggle dark theme"
              >
                <span class="switch-track">
                  <span class="switch-thumb"></span>
                </span>
              </button>
            </div>
          </div>

          <!-- Mode Segment: Dark / Light / System default (as requested by user) -->
          <div class="theme-segment-container">
            <div class="theme-segment-pills" role="radiogroup" aria-label="Select theme mode">
              <button
                type="button"
                role="radio"
                class="theme-pill-btn"
                data-theme-mode="dark"
                id="pill-mode-dark"
                aria-checked="true"
              >
                <span class="pill-dot"></span>
                <span>Dark</span>
              </button>
              <button
                type="button"
                role="radio"
                class="theme-pill-btn"
                data-theme-mode="light"
                id="pill-mode-light"
                aria-checked="false"
              >
                <span class="pill-dot"></span>
                <span>Light</span>
              </button>
              <button
                type="button"
                role="radio"
                class="theme-pill-btn"
                data-theme-mode="system"
                id="pill-mode-system"
                aria-checked="false"
              >
                <span class="pill-dot"></span>
                <span>System</span>
              </button>
            </div>
          </div>

          <div class="setting-divider" aria-hidden="true"></div>

          <!-- Row 2: Notifications -->
          <div class="setting-row">
            <div class="setting-meta">
              <span class="setting-label">Notifications</span>
            </div>
            <button
              type="button"
              role="switch"
              class="settings-switch"
              id="switch-notifications"
              aria-checked="true"
              aria-label="Toggle notifications"
            >
              <span class="switch-track">
                <span class="switch-thumb"></span>
              </span>
            </button>
          </div>

          <div class="setting-divider" aria-hidden="true"></div>

          <!-- Row 3: Sounds (Connected to Buildora Audio Engine) -->
          <div class="setting-row">
            <div class="setting-meta">
              <span class="setting-label">Sounds</span>
            </div>
            <button
              type="button"
              role="switch"
              class="settings-switch"
              id="switch-sounds"
              aria-checked="false"
              aria-label="Toggle spatial and interface sounds"
            >
              <span class="switch-track">
                <span class="switch-thumb"></span>
              </span>
            </button>
          </div>

          <div class="setting-divider" aria-hidden="true"></div>

          <!-- Row 4: Message previews -->
          <div class="setting-row">
            <div class="setting-meta">
              <span class="setting-label">Message previews</span>
            </div>
            <button
              type="button"
              role="switch"
              class="settings-switch"
              id="switch-message-previews"
              aria-checked="true"
              aria-label="Toggle message previews"
            >
              <span class="switch-track">
                <span class="switch-thumb"></span>
              </span>
            </button>
          </div>
        </section>

        <!-- Subtle Colophon / Return Footer -->
        <footer class="settings-bottom-note">
          <p>Buildora Atelier Spatial Studio · Preferences automatically saved</p>
        </footer>
      </div>
    </div>
  `;

  // Bind DOM Elements
  const closeBtn = document.getElementById('settings-close-btn');
  const pullCordBtn = document.getElementById('lamp-pull-cord');
  const switchDarkTheme = document.getElementById('switch-dark-theme');
  const switchNotifications = document.getElementById('switch-notifications');
  const switchSounds = document.getElementById('switch-sounds');
  const switchMessagePreviews = document.getElementById('switch-message-previews');
  const themeStatusCaption = document.getElementById('theme-status-caption');
  const pillDark = document.getElementById('pill-mode-dark');
  const pillLight = document.getElementById('pill-mode-light');
  const pillSystem = document.getElementById('pill-mode-system');

  // Close Navigation Action
  closeBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo('/');
    }
  });

  // Pull Cord Interactive Animation & Sound Click
  let cordPulling = false;
  const triggerPullCordCycle = () => {
    if (cordPulling) return;
    cordPulling = true;
    pullCordBtn?.classList.add('is-pulled');

    // Cycle: dark -> light -> system -> dark
    const currentMode = preferences.get().theme;
    const nextMode: ThemeMode =
      currentMode === 'dark' ? 'light' : currentMode === 'light' ? 'system' : 'dark';

    sound.playPullCord(nextMode === 'dark');
    preferences.setTheme(nextMode);

    setTimeout(() => {
      pullCordBtn?.classList.remove('is-pulled');
      cordPulling = false;
    }, 320);
  };

  pullCordBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    triggerPullCordCycle();
  });

  // Dark Theme Switch Toggle (toggles between dark and light)
  switchDarkTheme?.addEventListener('click', (e) => {
    e.preventDefault();
    const currentMode = preferences.get().theme;
    const resolved = getResolvedTheme(currentMode);
    const newMode: ThemeMode = resolved === 'dark' ? 'light' : 'dark';
    sound.playMeasureSnap(resolved === 'dark' ? 1400 : 1800);
    preferences.setTheme(newMode);
  });

  // 3-Way Mode Segment Buttons (Dark, Light, System)
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

  // Notifications Toggle
  switchNotifications?.addEventListener('click', (e) => {
    e.preventDefault();
    const current = preferences.get().notifications;
    sound.playMeasureSnap(!current ? 2200 : 1200);
    preferences.setNotifications(!current);
  });

  // Sounds Toggle (Connected to spatial audio engine)
  switchSounds?.addEventListener('click', (e) => {
    e.preventDefault();
    const current = preferences.get().sound;
    preferences.setSound(!current);
  });

  // Message Previews Toggle
  switchMessagePreviews?.addEventListener('click', (e) => {
    e.preventDefault();
    const current = preferences.get().messagePreviews;
    sound.playMeasureSnap(!current ? 2200 : 1200);
    preferences.setMessagePreviews(!current);
  });

  // Reactive UI update based on current preferences
  const updateUI = (prefs: UserPreferences) => {
    const resolved = getResolvedTheme(prefs.theme);
    const isDark = resolved === 'dark';

    // Update Switch states
    switchDarkTheme?.setAttribute('aria-checked', String(isDark));
    switchDarkTheme?.classList.toggle('is-active', isDark);

    switchNotifications?.setAttribute('aria-checked', String(prefs.notifications));
    switchNotifications?.classList.toggle('is-active', prefs.notifications);

    switchSounds?.setAttribute('aria-checked', String(prefs.sound));
    switchSounds?.classList.toggle('is-active', prefs.sound);

    switchMessagePreviews?.setAttribute('aria-checked', String(prefs.messagePreviews));
    switchMessagePreviews?.classList.toggle('is-active', prefs.messagePreviews);

    // Update Segment Pills
    pillDark?.setAttribute('aria-checked', String(prefs.theme === 'dark'));
    pillDark?.classList.toggle('is-selected', prefs.theme === 'dark');

    pillLight?.setAttribute('aria-checked', String(prefs.theme === 'light'));
    pillLight?.classList.toggle('is-selected', prefs.theme === 'light');

    pillSystem?.setAttribute('aria-checked', String(prefs.theme === 'system'));
    pillSystem?.classList.toggle('is-selected', prefs.theme === 'system');

    // Update Caption text
    if (themeStatusCaption) {
      if (prefs.theme === 'system') {
        themeStatusCaption.textContent = `System default (${isDark ? 'Dark' : 'Light'})`;
      } else {
        themeStatusCaption.textContent = isDark ? 'Dark mode active' : 'Light mode active';
      }
    }
  };

  const unsubscribe = preferences.subscribe(updateUI);

  // Return cleanup callback
  return () => {
    unsubscribe();
  };
}
