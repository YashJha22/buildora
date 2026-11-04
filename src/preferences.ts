/**
 * Buildora — Atelier Client Preferences & Theme Management System
 * Handles theme (dark / light / system default), audio synchronization,
 * notifications, and message previews with localStorage persistence.
 */

import { sound } from './audio';
import {
  DEFAULT_PREFERENCES,
  sanitizePreferences,
  type ThemeMode,
  type UserPreferences,
} from './validation';

export { sanitizePreferences, type ThemeMode, type UserPreferences };

const STORAGE_KEY = 'buildora_preferences_v1';
const VALID_THEMES: ReadonlySet<ThemeMode> = new Set(['dark', 'light', 'system']);

type PreferenceChangeListener = (prefs: UserPreferences) => void;
const listeners = new Set<PreferenceChangeListener>();

let currentPrefs: UserPreferences = loadStoredPreferences();

function loadStoredPreferences(): UserPreferences {
  try {
    if (typeof localStorage === 'undefined') {
      return { ...DEFAULT_PREFERENCES };
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return sanitizePreferences(parsed);
    }
  } catch (err) {
    console.warn('[Preferences] Failed to load from localStorage:', err);
  }
  return { ...DEFAULT_PREFERENCES };
}

function savePreferences() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPrefs));
  } catch (err) {
    console.warn('[Preferences] Failed to save to localStorage:', err);
  }
}

/** Resolves 'system' mode to actual 'dark' or 'light' based on device OS */
export function getResolvedTheme(mode: ThemeMode = currentPrefs.theme): 'dark' | 'light' {
  if (mode === 'dark' || mode === 'light') {
    return mode;
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/** Apply theme attribute to documentElement */
export function applyTheme(mode: ThemeMode = currentPrefs.theme) {
  const resolved = getResolvedTheme(mode);
  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.setAttribute('data-theme-setting', mode);

  // Sync site-header dark-table class
  const siteHeader = document.getElementById('site-header');
  if (siteHeader) {
    siteHeader.classList.toggle('header-dark-table', resolved === 'dark');
  }
}

/** Initialize OS prefers-color-scheme watcher */
export function initThemeWatcher() {
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', () => {
      if (currentPrefs.theme === 'system') {
        applyTheme('system');
        notifyListeners();
      }
    });
  }
  applyTheme(currentPrefs.theme);
}

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener({ ...currentPrefs });
    } catch (e) {
      console.error('[Preferences] Error in listener callback:', e);
    }
  });
}

export const preferences = {
  get(): UserPreferences {
    return { ...currentPrefs };
  },

  setTheme(mode: ThemeMode) {
    const safeMode: ThemeMode = VALID_THEMES.has(mode) ? mode : 'system';
    currentPrefs.theme = safeMode;
    savePreferences();
    applyTheme(safeMode);
    notifyListeners();
  },

  setNotifications(enabled: boolean) {
    currentPrefs.notifications = enabled;
    savePreferences();
    notifyListeners();
  },

  setSound(enabled: boolean) {
    currentPrefs.sound = enabled;
    savePreferences();
    // Synchronize with audio engine
    if (sound.isEnabled() !== enabled) {
      sound.toggle();
    }
    const sndBtn = document.getElementById('snd');
    if (sndBtn) {
      sndBtn.classList.toggle('on', enabled);
      sndBtn.setAttribute('aria-pressed', String(enabled));
      sndBtn.textContent = enabled ? 'Sound On' : 'Sound Off';
    }
    notifyListeners();
  },

  setMessagePreviews(enabled: boolean) {
    currentPrefs.messagePreviews = enabled;
    savePreferences();
    notifyListeners();
  },

  subscribe(listener: PreferenceChangeListener): () => void {
    listeners.add(listener);
    listener({ ...currentPrefs });
    return () => listeners.delete(listener);
  },
};
