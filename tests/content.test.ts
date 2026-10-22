import test from 'node:test';
import assert from 'node:assert/strict';
import { PROJECTS } from '../src/data/content.ts';

test('Architectural Portfolio Data Integrity', async (t) => {
  await t.test('All case study projects have required metadata fields', () => {
    assert.strictEqual(PROJECTS.length, 3, 'Should have 3 architectural case studies');

    for (const project of PROJECTS) {
      assert.ok(project.id, `Project missing id`);
      assert.ok(project.slug, `Project ${project.id} missing slug`);
      assert.ok(project.title, `Project ${project.id} missing title`);
      assert.ok(project.tagline, `Project ${project.id} missing tagline`);
      assert.ok(project.location, `Project ${project.id} missing location`);
      assert.ok(project.area, `Project ${project.id} missing area`);
      assert.ok(project.drawingType, `Project ${project.id} missing drawingType`);
      assert.ok(project.concept, `Project ${project.id} missing concept`);
      assert.ok(project.challenges, `Project ${project.id} missing challenges`);
      assert.ok(project.solution, `Project ${project.id} missing solution`);
      assert.ok(Array.isArray(project.materialsUsed), `Project ${project.id} materialsUsed must be array`);
      assert.ok(project.materialsUsed.length >= 3, `Project ${project.id} must list at least 3 materials`);
    }
  });

  await t.test('Project slugs are valid URL path segments', () => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    for (const project of PROJECTS) {
      assert.match(project.slug, slugRegex, `Slug "${project.slug}" must be lowercase kebab-case`);
    }
  });

  await t.test('Solar hours and 3D palette indices are within bounded engine constraints', () => {
    for (const project of PROJECTS) {
      assert.ok(project.paletteIdx >= 0 && project.paletteIdx <= 2, `Palette index ${project.paletteIdx} out of bounds`);
      assert.ok(project.solarHour >= 6 && project.solarHour <= 22, `Solar hour ${project.solarHour} out of 6-22 daylight bounds`);
    }
  });
});
