import { $ } from './utils';

/** Persistent DOM nodes shared across modules. */
export const ring = $('#ring');
export const L = $<HTMLCanvasElement>('#l'); // lit canvas
export const W = $<HTMLCanvasElement>('#w'); // wireframe canvas
