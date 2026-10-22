import gsap from 'gsap';
import { S, classic, debugDraw, debugFront, debugT, reduce, st } from './state';
import { intro as T, introClock, lockedEase } from './tokens/motion';
import { $, clamp } from './utils';
import { playHeroKineticIntro } from './typography';

let activeTimeline: gsap.core.Timeline | null = null;

export function syncIntroFromClock() {
  const d = clamp((S.T - introClock.drawStart) / (introClock.drawEnd - introClock.drawStart), 0, 1);
  S.draw = d;
  const u = clamp((S.T - introClock.lensStart) / introClock.lensDuration, 0, 1);
  S.intro = u * u * (3 - 2 * u);
}

export function seekIntroClock(sec: number) {
  if (!activeTimeline) return;
  const clamped = clamp(sec, 0, introClock.total);
  activeTimeline.pause(clamped, false);
  S.T = sec;
  syncIntroFromClock();
  st.lr = S.intro <= 0.005 ? 0 : (st.R0 + Math.sin(clamped * 1.2) * 5) * S.intro;
  st.ready = sec >= introClock.total;
  $('#pre').style.display = st.ready ? 'none' : 'flex';

  const dbg = (window as unknown as { __buildora?: { setFront?: (v: number | null) => void } }).__buildora;
  if (dbg) {
    if (sec >= 8.4) {
      dbg.setFront?.(1.0);
    } else if (sec <= introClock.total) {
      dbg.setFront?.(null);
    }
  }
}

/** Preloader + hero intro. Unlocks scrolling (`st.ready`) when the timeline completes. */
export function startIntro() {
  const pre = $('#pre'),
    n = $('#n'),
    bar = $('#bar'),
    skip = $('#skip');

  if (reduce) {
    pre.style.display = 'none';
    S.draw = 1;
    S.intro = 1;
    S.build = 1;
    S.T = introClock.total;
    st.ready = true;
    $('.foot').style.opacity = String(T.footOpacity);
    return;
  }

  if (classic) {
    const c = { v: 0 },
      tl = gsap.timeline({
        defaults: { ease: T.defaultEase },
        onComplete() {
          st.ready = true;
        },
      });
    tl.to(c, {
      v: 100,
      duration: T.count.duration,
      ease: T.count.ease,
      onUpdate() {
        n.textContent = String(Math.round(c.v));
        bar.style.transform = `scaleX(${c.v / 100})`;
      },
    })
      .to('#pre .pw,#pre .pc,#pre .pbar,#pre .pre-by', { opacity: 0, y: T.fade.y, duration: T.fade.duration, ease: T.fade.ease, stagger: T.fade.stagger })
      .to('#pre', { yPercent: -100, duration: T.curtain.duration, ease: T.curtain.ease }, T.curtain.at)
      .set(pre, { display: 'none' })
      .set('.hero-h1 .ln-inner', { yPercent: 0, opacity: 1 });
    playHeroKineticIntro(tl, T.headline.at);
    tl.from('.eyebrow-draft', { clipPath: 'inset(0 100% 0 0)', opacity: 0, duration: 0.85, ease: lockedEase, clearProps: 'clipPath' }, T.chrome.at)
      .from('header,.sub,.cta', { opacity: 0, y: T.chrome.y, duration: T.chrome.duration, stagger: T.chrome.stagger }, T.chrome.at)
      .to(S, { build: 1, duration: T.build.duration, ease: T.build.ease }, T.build.at)
      .to(S, { intro: 1, duration: T.reveal.duration, ease: T.reveal.ease }, T.reveal.at)
      .to('.foot', { opacity: T.footOpacity, duration: T.foot.duration, ease: T.foot.ease }, T.foot.at);
    skip.onclick = () => {
      tl.timeScale(T.skipTimeScale);
    };
    activeTimeline = tl;
    return;
  }

  // If navigating directly to any subpage (e.g. /projects, /contact, /status), dismiss preloader immediately without delay
  const isDirectSubpage = window.location.pathname !== '/' && window.location.pathname !== '' && window.location.pathname !== '/studio';
  if (isDirectSubpage) {
    pre.style.display = 'none';
    st.ready = true;
    S.T = introClock.total;
    syncIntroFromClock();
    return;
  }

  // Phase 0B master clock + Animated Architectural Logo Preloader (~1.5s)
  const tl = gsap.timeline({
    defaults: { ease: lockedEase },
    onComplete() {
      st.ready = true;
      pre.style.display = 'none';
    },
  });

  // 1. Foundation line draws in
  tl.fromTo(
    '#pre-foundation',
    { strokeDashoffset: 130 },
    { strokeDashoffset: 0, duration: 0.38, ease: 'power2.out' },
    0.05
  );

  // 2. The 3 geometric building shapes rise in sequence
  tl.fromTo(
    '#pre-vol-a',
    { scaleY: 0, transformOrigin: 'bottom', opacity: 0 },
    { scaleY: 1, opacity: 1, duration: 0.48, ease: lockedEase },
    0.22
  );
  tl.fromTo(
    '#pre-vol-b',
    { scaleY: 0, transformOrigin: 'bottom', opacity: 0 },
    { scaleY: 1, opacity: 1, duration: 0.52, ease: lockedEase },
    0.32
  );
  tl.fromTo(
    '#pre-vol-c',
    { scaleY: 0, transformOrigin: 'bottom', opacity: 0 },
    { scaleY: 1, opacity: 1, duration: 0.54, ease: lockedEase },
    0.42
  );

  // 3. Roofline, spire, and amber dot draw in
  tl.fromTo(
    '#pre-roof',
    { strokeDashoffset: 65 },
    { strokeDashoffset: 0, duration: 0.35, ease: 'power2.out' },
    0.58
  );
  tl.fromTo(
    '#pre-spire',
    { strokeDashoffset: 14 },
    { strokeDashoffset: 0, duration: 0.25, ease: 'power2.out' },
    0.68
  );
  tl.fromTo(
    '#pre-spire-dot',
    { scale: 0, transformOrigin: 'center', opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.22, ease: 'back.out(2)' },
    0.80
  );

  // 4. Wordmark 'Buildora.' and 'A project by Build with Yash' fade up with subtle settling
  tl.fromTo(
    '.pre-wordmark',
    { y: 16, opacity: 0, filter: 'blur(6px)' },
    { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.45, ease: lockedEase, clearProps: 'filter' },
    0.82
  );
  tl.fromTo(
    '.pre-byline',
    { y: 10, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.4, ease: lockedEase },
    0.92
  );

  // 5. Preloader completes its architectural settle, then curtains up smoothly
  tl.to(
    '#pre',
    {
      yPercent: -100,
      opacity: 0.98,
      duration: 0.65,
      ease: 'expo.inOut',
      onComplete() {
        pre.style.display = 'none';
      },
    },
    1.42
  );

  tl.to(
    S,
    {
      T: introClock.total,
      duration: introClock.total,
      ease: 'none',
      onUpdate: syncIntroFromClock,
    },
    0,
  );

  tl.set('.hero-h1 .ln-inner', { yPercent: 0, opacity: 1 }, 1.70);
  playHeroKineticIntro(tl, 1.72);
  tl.from('.eyebrow-draft', {
      clipPath: 'inset(0 100% 0 0)',
      opacity: 0,
      duration: 0.85,
      ease: lockedEase,
      clearProps: 'clipPath',
    }, introClock.chromeAt)
    .from('header', { opacity: 0, y: -16, duration: 0.85, ease: lockedEase }, introClock.chromeAt)
    .from('.sub', { opacity: 0, y: 16, filter: 'blur(4px)', duration: 0.9, ease: lockedEase, clearProps: 'filter' }, introClock.chromeAt + 0.12)
    .from('#hero .cta, .hero-actions .cta', { opacity: 0, y: 16, duration: 0.85, ease: lockedEase }, introClock.chromeAt + 0.22)
    .to('.foot', { opacity: T.footOpacity, duration: introClock.footDuration }, introClock.footAt);

  skip.onclick = () => {
    tl.timeScale(introClock.skipTimeScale);
  };

  activeTimeline = tl;

  if (debugT !== null && !Number.isNaN(debugT)) {
    seekIntroClock(debugT);
  } else if (debugDraw !== null && !Number.isNaN(debugDraw)) {
    const mappedT = introClock.drawStart + clamp(debugDraw, 0, 1) * (introClock.drawEnd - introClock.drawStart);
    seekIntroClock(mappedT);
  } else if (debugFront !== null && !Number.isNaN(debugFront)) {
    seekIntroClock(introClock.total);
  }
}


