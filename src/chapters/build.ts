import gsap from 'gsap';
import { buildSwap } from '../tokens/motion';
import { $, clamp, activateContinuousTypography } from '../utils';
import { animateBuildStageHeading } from '../typography';
import { st } from '../state';

const bld = $('#bld'),
  bhd = $('#bhd'),
  bpp = $('#bpp'),
  blt = document.querySelector<HTMLElement>('#bld .lt'),
  sts = [...document.querySelectorAll<HTMLElement>('#bld .st .st-step-btn, #bld .st span')],
  ST = [
    ['Structure.', 'Walls, openings and a floor that can carry a life.'],
    ['Finishes.', 'Surface and texture decide how a room feels before anything is in it.'],
    ['Furniture.', 'Every piece placed to the centimetre, then checked against the light.'],
    ['Light.', 'And then the day comes through the window.'],
  ];
let stg = -1;

function goToStep(index: number) {
  const clamped = clamp(index, 0, 3);
  const targetOffsets = [0.08, 0.28, 0.58, 0.88];
  const targetP = 2.12 + targetOffsets[clamped];
  const studioSec = document.getElementById('studio-section');
  const baseH = typeof window !== 'undefined' ? window.innerHeight : 844;
  const jH = studioSec ? Math.max(studioSec.offsetHeight - baseH, 1600) : 2400;
  const targetScrollY = (targetP / 3.0) * jH;
  window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
}

// Enable tap/click on step buttons
sts.forEach((btn, idx) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    goToStep(idx);
  });
});

// Enable swipe gestures on mobile card
let touchStartX = 0;
let touchStartY = 0;
if (blt) {
  blt.addEventListener(
    'touchstart',
    (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    },
    { passive: true },
  );

  blt.addEventListener(
    'touchend',
    (e: TouchEvent) => {
      if (e.changedTouches.length === 1) {
        const diffX = e.changedTouches[0].clientX - touchStartX;
        const diffY = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
          if (diffX < 0) {
            goToStep(stg + 1);
          } else {
            goToStep(stg - 1);
          }
        }
      }
    },
    { passive: true },
  );
}

/** Build stages (structure → finishes → furniture → light) and the headline swap. */
export function updateBuild(bq: number, cb: number) {
  const isMobile = st.w <= 640;
  // On mobile: Shorten cross-fade window. Strictly active when cb >= 0.04. Never overlap with Plan chapter!
  const on = isMobile
    ? (cb < 0.04 ? 0 : clamp((cb - 0.04) * 2.8, 0, 1))
    : clamp((cb - 0.35) * 1.8, 0, 1);
  bld.style.opacity = String(on);
  bld.style.visibility = on > 0.001 ? 'visible' : 'hidden';
  bld.style.pointerEvents = on > 0.05 ? 'auto' : 'none';
  if (blt && !isMobile) {
    blt.style.transform = `translateY(${((1 - on) * 20).toFixed(1)}px)`;
  }

  // Reset stage tracker when scrolled back into prior chapters so forward entrance re-triggers cleanly
  if (cb < 0.04) {
    stg = -1;
    return;
  }

  const g = bq < 0.18 ? 0 : bq < 0.38 ? 1 : bq < 0.78 ? 2 : 3;
  sts.forEach((a, i) => {
    a.classList.toggle('on', i === g);
    if (a.hasAttribute('aria-selected')) {
      a.setAttribute('aria-selected', String(i === g));
    }
  });
  if (g !== stg) {
    stg = g;
    animateBuildStageHeading(ST[g][0], ST[g][1], g);
  }
}
