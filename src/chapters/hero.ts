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

if (!classic) {
  L.style.clipPath = 'none';
}

/** Hero: reveal lens (clip-path in classic, shader soft lens + front in 0B), ring, headline fade, vignette, caption and progress bar. */
export function updateHero({ t, P, e, q }: Progress) {
  const { w, h, R0 } = st;
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
    const isMobile = st.w < 768;
    const scrollFade = isMobile ? clamp(1 - P * 2.5, 0, 1) : clamp(1 - (P - 0.25) * 2, 0, 1);
    const introTextGate = debugFront !== null ? 1 : clamp((S.T - introClock.headlineAt) / 0.4, 0, 1);
    const heroOpacity = scrollFade * introTextGate;
    hero.style.opacity = String(heroOpacity);
    hero.style.visibility = heroOpacity <= 0.001 ? 'hidden' : 'visible';
    hero.style.pointerEvents = heroOpacity <= 0.05 ? 'none' : (isMobile ? 'none' : 'auto');
    // Ambient vignette remains stable and dark throughout intro and hero; only fades on scroll into Chapter 1
    vig.style.opacity = String(scrollFade);
    const exitBlur = clamp((P - 0.2) * 8, 0, 4);
    hero.style.filter = !isMobile && exitBlur > 0.1 ? `blur(${exitBlur.toFixed(1)}px)` : 'none';
  }
  hero.style.transform = `translateY(${-P * 32}px)`;

  // Hero kinetic typography: physical 3D dispersion along orthogonal trajectories on scroll
  if (st.ready && !reduce) {
    updateHeroTypographyScroll(P);
    if (subEl) subEl.style.transform = P > 0.001 ? `translateY(${(P * 14).toFixed(1)}px)` : '';
  }

  cap.style.opacity = String(clamp((P - 0.65) * 3, 0, 1) * (1 - clamp(q * 6, 0, 1)));
  prog.style.transform = `scaleX(${P / 3})`;

  const hcs01 = document.getElementById('hcs-01');
  const hcs02 = document.getElementById('hcs-02');
  const hcs03 = document.getElementById('hcs-03');
  if (hcs01 && hcs02 && hcs03) {
    const is01 = P < 0.9;
    const is02 = P >= 0.9 && P < 1.9;
    const is03 = P >= 1.9;
    hcs01.classList.toggle('is-active', is01);
    hcs02.classList.toggle('is-active', is02);
    hcs03.classList.toggle('is-active', is03);
  }
}

