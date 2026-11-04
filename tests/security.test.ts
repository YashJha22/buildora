import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseFiniteParam,
  sanitizePreferences,
  isValidProjectRoute,
  DEFAULT_PREFERENCES,
} from '../src/validation.ts';

test('Security & Input Hardening Validation', async (t) => {
  await t.test('parseFiniteParam() handles NaN, Infinity, empty strings, and valid floats', () => {
    const params = new URLSearchParams(
      't=4.5&front=0.75&draw=1.8&neg=-5&nan=abc&inf=Infinity&neginf=-Infinity&empty=&spaces=%20%20',
    );

    assert.strictEqual(parseFiniteParam(params, 't', 0, 60), 4.5, 'Valid float within range');
    assert.strictEqual(parseFiniteParam(params, 'front', 0, 1), 0.75, 'Valid float in [0, 1]');
    assert.strictEqual(parseFiniteParam(params, 'draw', 0, 1), 1, 'Clamps float above max');
    assert.strictEqual(parseFiniteParam(params, 'neg', 0, 1), 0, 'Clamps float below min');
    assert.strictEqual(parseFiniteParam(params, 'nan', 0, 60), null, 'Rejects NaN strings');
    assert.strictEqual(parseFiniteParam(params, 'inf', 0, 60), null, 'Rejects +Infinity');
    assert.strictEqual(parseFiniteParam(params, 'neginf', 0, 60), null, 'Rejects -Infinity');
    assert.strictEqual(parseFiniteParam(params, 'empty', 0, 60), null, 'Rejects empty string');
    assert.strictEqual(parseFiniteParam(params, 'spaces', 0, 60), null, 'Rejects whitespace-only string');
    assert.strictEqual(parseFiniteParam(params, 'missing', 0, 60), null, 'Returns null for missing key');
  });

  await t.test('sanitizePreferences() guards against corrupted JSON and invalid theme enums', () => {
    assert.deepStrictEqual(
      sanitizePreferences(null),
      DEFAULT_PREFERENCES,
      'Null input falls back to defaults',
    );
    assert.deepStrictEqual(
      sanitizePreferences('corrupted-string'),
      DEFAULT_PREFERENCES,
      'Primitive string falls back to defaults',
    );
    assert.deepStrictEqual(
      sanitizePreferences(['dark']),
      DEFAULT_PREFERENCES,
      'Array input falls back to defaults',
    );
    assert.deepStrictEqual(
      sanitizePreferences({
        theme: 'invalid-theme',
        notifications: 'yes',
        sound: 123,
        messagePreviews: null,
      }),
      DEFAULT_PREFERENCES,
      'Invalid enum/boolean types fall back to defaults',
    );
    assert.deepStrictEqual(
      sanitizePreferences({
        theme: 'light',
        notifications: false,
        sound: true,
        messagePreviews: false,
      }),
      {
        theme: 'light',
        notifications: false,
        sound: true,
        messagePreviews: false,
      },
      'Valid preferences are preserved',
    );
  });

  await t.test('isValidProjectRoute() validates /projects/:slug paths and rejects unknown or nested slugs', () => {
    assert.strictEqual(isValidProjectRoute('/projects/nordic-pavilion'), true);
    assert.strictEqual(isValidProjectRoute('/projects/walnut-atelier/'), true);
    assert.strictEqual(isValidProjectRoute('/project/concrete-cloister'), true);

    assert.strictEqual(isValidProjectRoute('/projects/non-existent-slug'), false);
    assert.strictEqual(isValidProjectRoute('/projects/nordic-pavilion/extra'), false);
    assert.strictEqual(isValidProjectRoute('/projects/'), false);
    assert.strictEqual(isValidProjectRoute('/projects'), false);
    assert.strictEqual(isValidProjectRoute('/status'), false);
  });
});
