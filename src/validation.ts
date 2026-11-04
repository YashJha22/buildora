import { PROJECTS } from './data/content.ts';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface UserPreferences {
  theme: ThemeMode;
  notifications: boolean;
  sound: boolean;
  messagePreviews: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  notifications: true,
  sound: false,
  messagePreviews: true,
};

const VALID_THEMES: ReadonlySet<ThemeMode> = new Set(['dark', 'light', 'system']);

/**
 * Safely parses a finite numeric URL query parameter and clamps it to [min, max].
 * Returns `null` if the parameter is absent, empty/whitespace, `NaN`, or `±Infinity`.
 */
export function parseFiniteParam(
  searchParams: URLSearchParams,
  key: string,
  min: number,
  max: number,
): number | null {
  const raw = searchParams.get(key);
  if (raw === null || raw.trim() === '') return null;
  const num = Number(raw);
  if (!Number.isFinite(num)) return null;
  return Math.min(max, Math.max(min, num));
}

/**
 * Validates and sanitizes untrusted/corrupted localStorage preference objects.
 */
export function sanitizePreferences(input: unknown): UserPreferences {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ...DEFAULT_PREFERENCES };
  }
  const obj = input as Record<string, unknown>;
  return {
    theme:
      typeof obj.theme === 'string' && VALID_THEMES.has(obj.theme as ThemeMode)
        ? (obj.theme as ThemeMode)
        : DEFAULT_PREFERENCES.theme,
    notifications:
      typeof obj.notifications === 'boolean'
        ? obj.notifications
        : DEFAULT_PREFERENCES.notifications,
    sound:
      typeof obj.sound === 'boolean' ? obj.sound : DEFAULT_PREFERENCES.sound,
    messagePreviews:
      typeof obj.messagePreviews === 'boolean'
        ? obj.messagePreviews
        : DEFAULT_PREFERENCES.messagePreviews,
  };
}

/**
 * Validates whether a pathname matches an existing `/projects/:slug` or `/project/:slug` case study.
 */
export function isValidProjectRoute(rawPath: string): boolean {
  const path = rawPath.replace(/\/+$/, '') || '/';
  if (!path.startsWith('/projects/') && !path.startsWith('/project/')) {
    return false;
  }
  const parts = path.split('/');
  if (parts.length !== 3 || !parts[2]) {
    return false;
  }
  return PROJECTS.some((p) => p.slug === parts[2]);
}
