import type { Progress } from '../state';
import { updateBuild } from './build';
import { updateHero } from './hero';
import { updatePlan } from './plan';

/** Runs every chapter for the current frame, in the original order: hero → plan → build. */
export function updateChapters(p: Progress) {
  updateHero(p);
  updatePlan(p);
  updateBuild(p.bq, p.cb);
}
