import { L, ring } from '../dom';
import { S, classic, debugFront, reduce, st, type Progress } from '../state';
import { introClock, smooth } from '../tokens/motion';
import { $, clamp } from '../utils';
import { updateHeroTypographyScroll } from '../typography';

const hero = $('main'),
  vig = $('.vig'),
  cap = $('#cap'),
  prog = $('#prog'),
  wFrom = document.querySelector<HTMLElement>('.w-from'),
  wPlan = document.querySelector<HTMLElement>('.w-plan'),
  wTo = document.querySelector<HTMLElement>('.w-to'),
  wBuilt = document.querySelector<HTMLElement>('.w-built'),
  subEl = document.querySelector<HTMLElement>('.sub');

// Cached lazily on first frame (header / stepper nodes exist by then) so the loop never queries the DOM
let siteHeaderEl: HTMLElement | null = null;
let hcsEls: HTMLElement[] | null = null;
let lastHcs = -1;
let lastHeroOpacity = -1;
let lastVigOpacity = -1;
let lastProgP = -1;
let lastCapOpacity = -1;
let lastSubP = -1;

if (!classic) {
  L.style.clipPath = 'none';
}

/** Hero: reveal lens (clip-path in classic, shader soft lens + front in 0B), ring, headline fade, vignette, caption and progress bar. */
export function updateHero({ t, P, e, q }: Progress) {
  const { w, h, R0 } = st;
  const isMobile = w < 768;
  if (classic) {
    st.lr += ((R0 + Math.sin(t * 1.2) * 5) * S.intro + e * Math.hypot(w, h) - st.lr) * smooth.radius;
    const r = Math.max(st.lr, 0);
    L.style.clipPath = `circle(${r.toFixed(1)}px at ${st.lx.toFixed(1)}px ${st.ly.toFixed(1)}px)`;
    ring.style.transform = `translate(${st.lx - R0}px,${st.ly - R0}px) scale(${(r / R0).toFixed(3)})`;
    ring.style.opacity = String(clamp(1 - e * 2.5, 0, 1) * (S.intro > 0.05 ? 1 : 0));
    hero.style.opacity = String(clamp(1 - (P - 0.25) * 2, 0, 1));
  } else {
    const targetR = S.intro <= 0.005 ? 0 : (R0 + Math.sin(t * 1.2) * 5) * S.intro;
    st.lr += (targetR - st.lr) * smooth.radius;
    const r = S.intro <= 0.005 ? 0 : Math.max(st.lr, 0);
    const ringScale = (r / R0).toFixed(3);
    ring.style.transform = `translate(${st.lx - R0}px,${st.ly - R0}px) scale(${ringScale})`;
    const ringFade = clamp((S.intro - 0.05) / 0.35, 0, 1) * clamp(1 - e * 2.5, 0, 1);
    ring.style.opacity = String(ringFade);
    const scrollFade = clamp(1 - (P - 0.25) * 2, 0, 1);
    const introTextGate = debugFront !== null ? 1 : clamp((S.T - introClock.headlineAt) / 0.5, 0, 1);
    const heroOpacity = scrollFade * introTextGate;
    if (
      Math.abs(heroOpacity - lastHeroOpacity) > 0.005 ||
      (heroOpacity <= 0.001 && lastHeroOpacity > 0.001) ||
      (heroOpacity > 0.001 && lastHeroOpacity <= 0.001)
    ) {
      lastHeroOpacity = heroOpacity;
      hero.style.opacity = String(heroOpacity);
      hero.style.visibility = heroOpacity <= 0.001 ? 'hidden' : 'visible';
      hero.style.display = heroOpacity <= 0.001 ? 'none' : 'flex';
      hero.style.pointerEvents = heroOpacity <= 0.05 ? 'none' : 'auto';
    }

    // Header adapts color strictly when paper transitions to obsidian drafting table (q > 0.05)
    if (!siteHeaderEl) siteHeaderEl = document.getElementById('site-header');
    const headerDark = q > 0.05;
    if (siteHeaderEl && siteHeaderEl.classList.contains('header-dark-table') !== headerDark) {
      siteHeaderEl.classList.toggle('header-dark-table', headerDark);
    }

    // Ambient vignette remains stable and dark throughout intro and hero; only fades on scroll into Chapter 1
    if (Math.abs(scrollFade - lastVigOpacity) > 0.005) {
      lastVigOpacity = scrollFade;
      vig.style.opacity = String(scrollFade);
    }
  }
  hero.style.transform = isMobile ? '' : `translateY(${-P * 32}px)`;

  // Hero kinetic typography: physical 3D dispersion along orthogonal trajectories on scroll (desktop only)
  if (st.ready && !reduce && !isMobile) {
    updateHeroTypographyScroll(P);
    if (subEl && Math.abs(P - lastSubP) > 0.002) {
      lastSubP = P;
      subEl.style.transform = P > 0.001 ? `translateY(${(P * 14).toFixed(1)}px)` : '';
    }
  }

  // On mobile, hide #cap completely to prevent superimposing over headline words
  if (st.w < 768) {
    if (lastCapOpacity !== 0) {
      lastCapOpacity = 0;
      cap.style.opacity = '0';
      cap.style.visibility = 'hidden';
    }
  } else {
    const capOp = clamp((P - 0.65) * 3, 0, 1) * (1 - clamp(q * 6, 0, 1));
    if (Math.abs(capOp - lastCapOpacity) > 0.005) {
      lastCapOpacity = capOp;
      cap.style.opacity = String(capOp);
      cap.style.visibility = capOp <= 0.001 ? 'hidden' : '';
    }
  }
  if (Math.abs(P - lastProgP) > 0.002) {
    lastProgP = P;
    prog.style.transform = `scaleX(${P / 3})`;
  }

  if (!hcsEls) {
    const a = document.getElementById('hcs-01');
    const b = document.getElementById('hcs-02');
    const c = document.getElementById('hcs-03');
    if (a && b && c) hcsEls = [a, b, c];
  }
  if (hcsEls) {
    const active = P < 0.9 ? 0 : P < 1.9 ? 1 : 2;
    if (active !== lastHcs) {
      lastHcs = active;
      for (let i = 0; i < 3; i++) hcsEls[i].classList.toggle('is-active', i === active);
    }
  }
}

