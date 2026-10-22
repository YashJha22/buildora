import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp, lerp } from '../src/math.ts';

test('Core Math & Utility Functions', async (t) => {
  await t.test('clamp() correctly restricts values within bounds', () => {
    assert.strictEqual(clamp(5, 0, 10), 5, 'Within range should be unchanged');
    assert.strictEqual(clamp(-5, 0, 10), 0, 'Below min should clamp to min');
    assert.strictEqual(clamp(15, 0, 10), 10, 'Above max should clamp to max');
    assert.strictEqual(clamp(0, 0, 0), 0, 'Identical bounds should clamp to bound');
    assert.strictEqual(clamp(0.5, 0, 1), 0.5, 'Float within bounds should be unchanged');
  });

  await t.test('lerp() linearly interpolates between points', () => {
    assert.strictEqual(lerp(0, 100, 0.5), 50, 'Midpoint lerp should be 50');
    assert.strictEqual(lerp(10, 20, 0), 10, 'Lerp at t=0 should return start value');
    assert.strictEqual(lerp(10, 20, 1), 20, 'Lerp at t=1 should return end value');
    assert.strictEqual(lerp(0, 10, 0.25), 2.5, 'Lerp at t=0.25 should return 2.5');
  });

  await t.test('Solar hour formatting correctly calculates hours and minutes', () => {
    const formatSolar = (hr: number) => {
      const hInt = Math.floor(hr);
      const mInt = Math.round((hr - hInt) * 60);
      const mAdj = mInt === 60 ? 0 : mInt;
      const hAdj = mInt === 60 ? hInt + 1 : hInt;
      return `${hAdj < 10 ? '0' : ''}${hAdj}:${mAdj < 10 ? '0' : ''}${mAdj}`;
    };

    assert.strictEqual(formatSolar(17.75), '17:45', '17.75 hr should format to 17:45');
    assert.strictEqual(formatSolar(9.0), '09:00', '9.0 hr should format to 09:00');
    assert.strictEqual(formatSolar(13.5), '13:30', '13.5 hr should format to 13:30');
    assert.strictEqual(formatSolar(21.99), '21:59', '21.99 hr should format to 21:59');
    assert.strictEqual(formatSolar(21.995), '22:00', '21.995 hr should roll over to 22:00');
  });
});
