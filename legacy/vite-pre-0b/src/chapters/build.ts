import gsap from 'gsap';
import { buildSwap } from '../tokens/motion';
import { $, clamp } from '../utils';

const bld = $('#bld'),
  bhd = $('#bhd'),
  bpp = $('#bpp'),
  sts = [...document.querySelectorAll('#bld .st span')],
  ST = [
    ['Structure.', 'Walls, openings and a floor that can carry a life.'],
    ['Finishes.', 'Surface and texture decide how a room feels before anything is in it.'],
    ['Furniture.', 'Every piece placed to the centimetre, then checked against the light.'],
    ['Light.', 'And then the day comes through the window.'],
  ];
let stg = -1;

/** Build stages (structure → finishes → furniture → light) and the headline swap. */
export function updateBuild(bq: number, cb: number) {
  const on = clamp((cb - 0.5) * 2, 0, 1);
  bld.style.opacity = String(on);
  bld.style.visibility = on > 0 ? 'visible' : 'hidden';
  const g = bq < 0.18 ? 0 : bq < 0.38 ? 1 : bq < 0.78 ? 2 : 3;
  sts.forEach((a, i) => a.classList.toggle('on', i === g));
  if (g !== stg) {
    stg = g;
    bhd.innerHTML = '<em>' + ST[g][0] + '</em>';
    bpp.textContent = ST[g][1];
    gsap.fromTo('#bhd,#bpp', buildSwap.from, buildSwap.to);
  }
}
