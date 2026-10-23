import gsap from 'gsap';
import { reduce } from './state';

let rotatorTimer: number | null = null;
let observer: IntersectionObserver | null = null;
let isEngineInitialized = false;

export interface SplitResult {
  chars: HTMLElement[];
  words: HTMLElement[];
  revert: () => void;
}

/**
 * Accessible Text Splitting Utility
 * Wraps words in non-breaking inline-blocks and chars in 3D-ready spans.
 * Preserves screen reader access with aria-label on parent and aria-hidden on split containers.
 */
export function splitTextIntoChars(el: HTMLElement): SplitResult {
  if (!el) return { chars: [], words: [], revert: () => {} };

  // If already split, return existing elements
  const existingChars = Array.from(el.querySelectorAll<HTMLElement>('.kt-char'));
  const existingWords = Array.from(el.querySelectorAll<HTMLElement>('.kt-word'));
  if (existingChars.length > 0) {
    return {
      chars: existingChars,
      words: existingWords,
      revert: () => {
        const raw = el.getAttribute('aria-label') || el.textContent || '';
        el.textContent = raw;
        el.removeAttribute('aria-label');
        if (el.getAttribute('role') === 'text') {
          el.removeAttribute('role');
        }
      },
    };
  }

  const rawText = el.textContent || '';
  if (!el.getAttribute('aria-label')) {
    el.setAttribute('aria-label', rawText.trim());
  }
  if (!el.getAttribute('role')) {
    el.setAttribute('role', 'text');
  }

  const chars: HTMLElement[] = [];
  const words: HTMLElement[] = [];
  const originalHTML = el.innerHTML;

  const fragment = document.createDocumentFragment();
  const wordTokens = rawText.trim().split(/\s+/);

  wordTokens.forEach((wToken, wIdx) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'kt-word';
    wordSpan.setAttribute('aria-hidden', 'true');
    wordSpan.style.display = 'inline-block';
    wordSpan.style.whiteSpace = 'nowrap';
    wordSpan.style.verticalAlign = 'baseline';

    for (let i = 0; i < wToken.length; i++) {
      const charSpan = document.createElement('span');
      charSpan.className = 'kt-char';
      charSpan.setAttribute('aria-hidden', 'true');
      charSpan.dataset.char = wToken[i];
      charSpan.textContent = wToken[i];
      charSpan.style.display = 'inline-block';
      charSpan.style.willChange = 'transform, opacity';
      charSpan.style.transformStyle = 'preserve-3d';
      charSpan.style.backfaceVisibility = 'hidden';

      wordSpan.appendChild(charSpan);
      chars.push(charSpan);
    }

    words.push(wordSpan);
    fragment.appendChild(wordSpan);

    if (wIdx < wordTokens.length - 1) {
      const spaceSpan = document.createElement('span');
      spaceSpan.className = 'kt-space';
      spaceSpan.setAttribute('aria-hidden', 'true');
      spaceSpan.innerHTML = '&nbsp;';
      spaceSpan.style.display = 'inline-block';
      fragment.appendChild(spaceSpan);
    }
  });

  el.innerHTML = '';
  el.appendChild(fragment);

  return {
    chars,
    words,
    revert: () => {
      el.innerHTML = originalHTML;
      el.removeAttribute('aria-label');
    },
  };
}

/**
 * Pre-splits all hero words into persistent character spans once.
 * Ensures zero DOM destruction, zero garbage collection, and zero layout shift during rotations.
 */
export function prepareHeroWords() {
  if (typeof document === 'undefined') return;

  const wordFrom = document.getElementById('hero-word-from');
  const wordTo = document.getElementById('hero-word-to');
  const rotOrigin = document.getElementById('rotator-origin');
  const rotDest = document.getElementById('rotator-dest');

  if (wordFrom) splitTextIntoChars(wordFrom);
  if (wordTo) splitTextIntoChars(wordTo);

  if (rotOrigin) {
    const originItems = Array.from(rotOrigin.querySelectorAll<HTMLElement>('.rot-item'));
    originItems.forEach((item) => splitTextIntoChars(item));
  }

  if (rotDest) {
    const destItems = Array.from(rotDest.querySelectorAll<HTMLElement>('.rot-item'));
    destItems.forEach((item) => {
      const em = item.querySelector<HTMLElement>('.built-chars') || item;
      splitTextIntoChars(em);
    });
  }
}

/**
 * 1. HERO: SPECTACULAR ARCHITECTURAL KINETIC ASSEMBLY
 * - "From": 3D perspective letter assembly rotating around Y and X axes.
 * - "plan": Blueprint drafting geometry (cyan datum tag, technical underline with end ticks, tracking condensation).
 * - "to": Angled shear mask entrance.
 * - "built.": Monolithic dimensional drop with 3D perspective rotation, heavy mass, and champagne gold bevels.
 * - Amber dot "." drops like a plumb bob with rebound.
 */
export function playHeroKineticIntro(tl?: gsap.core.Timeline, atTime: number | string = 0): gsap.core.Timeline {
  const masterTl = tl || gsap.timeline();
  const subTl = gsap.timeline();

  if (typeof document === 'undefined') return masterTl;

  prepareHeroWords();

  const heroMain = document.querySelector<HTMLElement>('main.studio-hero-main');
  const heroH1 = document.querySelector<HTMLElement>('.hero-h1');
  const wordFrom = document.getElementById('hero-word-from');
  const wordTo = document.getElementById('hero-word-to');
  const rotOrigin = document.getElementById('rotator-origin');
  const rotDest = document.getElementById('rotator-dest');
  const activeOrigin = rotOrigin?.querySelector<HTMLElement>('.rot-item.is-active');
  const activeDest = rotDest?.querySelector<HTMLElement>('.rot-item.is-active');
  const bpLine = document.querySelector<HTMLElement>('.bp-line');
  const bpDatum = document.querySelector<HTMLElement>('.bp-datum');

  if (heroMain) heroMain.classList.add('hero-revealed');
  if (heroH1) {
    heroH1.style.perspective = '1200px';
    heroH1.style.transformStyle = 'preserve-3d';
  }

  // Set initial width to active items to prevent layout shift
  if (activeOrigin && rotOrigin) {
    const ow = activeOrigin.offsetWidth || activeOrigin.getBoundingClientRect().width;
    if (ow > 0) rotOrigin.style.width = `${Math.ceil(ow)}px`;
  }
  if (activeDest && rotDest) {
    const dw = activeDest.offsetWidth || activeDest.getBoundingClientRect().width;
    if (dw > 0) rotDest.style.width = `${Math.ceil(dw)}px`;
  }

  // Fallback for reduced motion
  if (reduce) {
    if (wordFrom) wordFrom.style.opacity = '1';
    if (wordTo) wordTo.style.opacity = '1';
    if (activeOrigin) {
      activeOrigin.style.opacity = '1';
      activeOrigin.style.visibility = 'visible';
    }
    if (activeDest) {
      activeDest.style.opacity = '1';
      activeDest.style.visibility = 'visible';
    }
    if (bpLine) bpLine.style.transform = 'scaleX(1)';
    return masterTl;
  }

  const fromChars = wordFrom ? Array.from(wordFrom.querySelectorAll<HTMLElement>('.kt-char')) : [];
  const originChars = activeOrigin ? Array.from(activeOrigin.querySelectorAll<HTMLElement>('.kt-char')) : [];
  const toChars = wordTo ? Array.from(wordTo.querySelectorAll<HTMLElement>('.kt-char')) : [];
  const allDestChars = activeDest ? Array.from(activeDest.querySelectorAll<HTMLElement>('.kt-char')) : [];
  const periodDot = allDestChars.find((c) => c.textContent === '.') || null;
  const destChars = allDestChars.filter((c) => c !== periodDot);

  // Phase A: Set initial 3D assembly states
  if (fromChars.length > 0) {
    gsap.set(fromChars, {
      opacity: 0,
      rotateY: (i) => 75 - i * 15,
      rotateX: 25,
      z: 90,
      y: 40,
      transformOrigin: '50% 100% -40px',
    });
  }

  if (originChars.length > 0) {
    gsap.set(originChars, {
      opacity: 0,
      y: -22,
      letterSpacing: '0.35em',
      filter: 'blur(6px)',
    });
  }

  if (bpLine) gsap.set(bpLine, { scaleX: 0, opacity: 0 });
  if (bpDatum) gsap.set(bpDatum, { y: -8, opacity: 0 });

  if (toChars.length > 0) {
    gsap.set(toChars, {
      opacity: 0,
      x: -30,
      skewX: -14,
    });
  }

  if (destChars.length > 0) {
    gsap.set(destChars, {
      opacity: 0,
      rotateX: -85,
      y: 75,
      z: -50,
      scale: 0.9,
      transformOrigin: 'top center',
    });
  }

  if (periodDot) {
    gsap.set(periodDot, {
      opacity: 0,
      y: -100,
      scale: 0.2,
    });
  }

  // Phase B: Orchestrate Master Entrance Timeline
  // 1. "From" 3D tumbling perspective snap
  if (fromChars.length > 0) {
    subTl.to(
      fromChars,
      {
        opacity: 1,
        rotateY: 0,
        rotateX: 0,
        z: 0,
        y: 0,
        duration: 1.05,
        stagger: 0.06,
        ease: 'expo.out',
        clearProps: 'transformOrigin',
      },
      0
    );
  }

  // 2. "plan" technical blueprint drafting assembly
  const planStart = 0.15;
  if (bpDatum) {
    subTl.to(bpDatum, { opacity: 0.85, y: 0, duration: 0.7, ease: 'power3.out' }, planStart);
  }
  if (bpLine) {
    subTl.to(bpLine, { scaleX: 1, opacity: 1, duration: 0.95, ease: 'power4.out' }, planStart + 0.05);
  }
  if (originChars.length > 0) {
    subTl.to(
      originChars,
      {
        opacity: 1,
        y: 0,
        letterSpacing: '0.01em',
        filter: 'blur(0px)',
        duration: 0.95,
        stagger: 0.05,
        ease: 'power4.out',
        clearProps: 'filter',
      },
      planStart + 0.08
    );
  }

  // 3. "to" angled shear slide
  const toStart = 0.24;
  if (toChars.length > 0) {
    subTl.to(
      toChars,
      {
        opacity: 1,
        x: 0,
        skewX: 0,
        duration: 0.85,
        stagger: 0.04,
        ease: 'expo.out',
      },
      toStart
    );
  }

  // 4. "built" monolithic physical drop with champagne bevels
  const builtStart = 0.32;
  if (destChars.length > 0) {
    subTl.to(
      destChars,
      {
        opacity: 1,
        rotateX: 0,
        y: 0,
        z: 0,
        scale: 1,
        duration: 1.15,
        stagger: 0.05,
        ease: 'back.out(1.5)',
      },
      builtStart
    );
  }

  // 5. Period "." drops like a plumb bob with micro-rebound
  if (periodDot) {
    subTl.to(
      periodDot,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: 'bounce.out',
      },
      builtStart + 0.25
    );
  }

  masterTl.add(subTl, atTime);

  return masterTl;
}

/**
 * 2. SCROLL-DRIVEN KINETIC TYPOGRAPHY (HERO DISPERSION NARRATIVE)
 * As the user scrolls from plan towards the built space, the hero letters
 * physically disperse along 3D orthogonal trajectories, opening up the room.
 */
export function updateHeroTypographyScroll(progress: number) {
  if (reduce) return;

  const p = Math.max(0, Math.min(1.2, progress));

  const wordFrom = document.getElementById('hero-word-from');
  const wordTo = document.getElementById('hero-word-to');
  const fromChars = wordFrom ? Array.from(wordFrom.querySelectorAll<HTMLElement>('.kt-char')) : [];
  const toChars = wordTo ? Array.from(wordTo.querySelectorAll<HTMLElement>('.kt-char')) : [];

  const activeOrigin = document.querySelector('#rotator-origin .rot-item.is-active') as HTMLElement | null;
  const activeDest = document.querySelector('#rotator-dest .rot-item.is-active') as HTMLElement | null;
  const originChars = activeOrigin ? Array.from(activeOrigin.querySelectorAll<HTMLElement>('.kt-char')) : [];
  const allDestChars = activeDest ? Array.from(activeDest.querySelectorAll<HTMLElement>('.kt-char')) : [];
  const destPeriod = allDestChars.find((c) => c.textContent === '.') || null;
  const destChars = allDestChars.filter((c) => c !== destPeriod);

  const bpLine = document.querySelector<HTMLElement>('.bp-line');
  const bpDatum = document.querySelector<HTMLElement>('.bp-datum');

  if (p <= 0.001) {
    // Perfect monolithic alignment
    if (fromChars.length > 0 && fromChars[0].style.transform) {
      fromChars.forEach((c) => {
        c.style.transform = '';
        c.style.opacity = '1';
      });
    }
    if (originChars.length > 0 && originChars[0].style.transform) {
      originChars.forEach((c) => {
        c.style.transform = '';
        c.style.opacity = '1';
      });
    }
    if (toChars.length > 0 && toChars[0].style.transform) {
      toChars.forEach((c) => {
        c.style.transform = '';
        c.style.opacity = '1';
      });
    }
    if (destChars.length > 0 && destChars[0].style.transform) {
      destChars.forEach((c) => {
        c.style.transform = '';
        c.style.opacity = '1';
      });
    }
    if (destPeriod && destPeriod.style.transform) {
      destPeriod.style.transform = '';
      destPeriod.style.opacity = '1';
    }
    if (bpLine) {
      bpLine.style.transform = 'scaleX(1)';
      bpLine.style.opacity = '1';
    }
    if (bpDatum) {
      bpDatum.style.transform = '';
      bpDatum.style.opacity = '0.85';
    }
    return;
  }

  // 1. "From" drifts leftward with progressive Y-rotation
  fromChars.forEach((char, idx) => {
    const factor = (idx + 1) * 0.28;
    const x = -p * 85 * factor;
    const y = -p * 25 * factor;
    const rotY = -p * 35 * factor;
    const op = Math.max(0, 1 - p * 1.6);
    char.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0px) rotateY(${rotY.toFixed(1)}deg)`;
    char.style.opacity = op.toFixed(2);
  });

  // 2. Active origin word (plan, sketch, concept, line) pushes back into Z-space
  originChars.forEach((char, idx) => {
    const z = -p * 260;
    const y = -p * 20;
    const x = (idx - 1.5) * p * 22;
    const op = Math.max(0, 1 - p * 1.5);
    char.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px)`;
    char.style.opacity = op.toFixed(2);
  });
  if (bpLine) {
    bpLine.style.transform = `scaleX(${Math.max(0, 1 - p * 2.2).toFixed(2)})`;
    bpLine.style.opacity = Math.max(0, 1 - p * 2.0).toFixed(2);
  }
  if (bpDatum) {
    bpDatum.style.transform = `translateY(${-p * 25}px)`;
    bpDatum.style.opacity = Math.max(0, 1 - p * 2.0).toFixed(2);
  }

  // 3. "to" shears away along diagonal
  toChars.forEach((char) => {
    const x = -p * 45;
    const skew = p * 18;
    const op = Math.max(0, 1 - p * 1.8);
    char.style.transform = `translateX(${x.toFixed(1)}px) skewX(${skew.toFixed(1)}deg)`;
    char.style.opacity = op.toFixed(2);
  });

  // 4. Active destination word (built., dwelling., etc.) separates like solid stone blocks
  const blockVectors = [
    { x: -35, y: 48, rz: -10 },
    { x: -16, y: 62, rz: -5 },
    { x: 10, y: 72, rz: 4 },
    { x: 28, y: 56, rz: 8 },
    { x: 44, y: 42, rz: 14 },
    { x: 55, y: 32, rz: 18 },
    { x: 65, y: 24, rz: 22 },
    { x: 75, y: 18, rz: 26 },
  ];
  destChars.forEach((char, idx) => {
    const v = blockVectors[idx % blockVectors.length];
    const x = p * v.x;
    const y = p * v.y;
    const rz = p * v.rz;
    const z = p * 40;
    const op = Math.max(0, 1 - p * 1.5);
    char.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateZ(${rz.toFixed(1)}deg)`;
    char.style.opacity = op.toFixed(2);
  });

  if (destPeriod) {
    const y = p * 95;
    const op = Math.max(0, 1 - p * 1.5);
    destPeriod.style.transform = `translateY(${y.toFixed(1)}px)`;
    destPeriod.style.opacity = op.toFixed(2);
  }
}

let activeRotTimeline: gsap.core.Timeline | null = null;

/**
 * 3. HERO WORD-FLOW KEYWORD ROTATOR WITH CHAR-LEVEL MORPHING
 * Transitions rotating keywords dynamically:
 * - Clean sequential hand-off guarantees ZERO overlapping letters or ghost words.
 * - Outgoing chars exit completely before incoming chars enter.
 * - Font loading detection guarantees mathematically exact container widths.
 * - Absolute positioning inside overflow:hidden guarantees zero layout shift.
 */
export function initHeroKeywordRotator() {
  if (typeof document === 'undefined' || reduce) return;

  const rotOrigin = document.getElementById('rotator-origin');
  const rotDest = document.getElementById('rotator-dest');
  if (!rotOrigin || !rotDest) return;

  prepareHeroWords();

  const originItems = Array.from(rotOrigin.querySelectorAll<HTMLElement>('.rot-item'));
  const destItems = Array.from(rotDest.querySelectorAll<HTMLElement>('.rot-item'));
  if (originItems.length <= 1 || destItems.length <= 1) return;

  const activeOrigin = rotOrigin.querySelector<HTMLElement>('.rot-item.is-active') || originItems[0];
  const activeDest = rotDest.querySelector<HTMLElement>('.rot-item.is-active') || destItems[0];

  let currentIdx = originItems.indexOf(activeOrigin);
  if (currentIdx === -1) currentIdx = 0;

  const setInitialWidth = (container: HTMLElement, activeItem: HTMLElement) => {
    const w = activeItem.offsetWidth || activeItem.getBoundingClientRect().width;
    if (w > 0) container.style.width = `${Math.ceil(w)}px`;
  };

  setInitialWidth(rotOrigin, activeOrigin);
  setInitialWidth(rotDest, activeDest);

  // Recalculate accurately once web fonts (Instrument Serif) have fully finished loading
  if (typeof document !== 'undefined' && 'fonts' in document) {
    document.fonts.ready.then(() => {
      const curActiveOrigin = rotOrigin.querySelector<HTMLElement>('.rot-item.is-active') || originItems[currentIdx];
      const curActiveDest = rotDest.querySelector<HTMLElement>('.rot-item.is-active') || destItems[currentIdx];
      if (curActiveOrigin) setInitialWidth(rotOrigin, curActiveOrigin);
      if (curActiveDest) setInitialWidth(rotDest, curActiveDest);
    });
  }

  window.addEventListener('resize', () => {
    const curActiveOrigin = rotOrigin.querySelector<HTMLElement>('.rot-item.is-active') || originItems[currentIdx];
    const curActiveDest = rotDest.querySelector<HTMLElement>('.rot-item.is-active') || destItems[currentIdx];
    if (curActiveOrigin) setInitialWidth(rotOrigin, curActiveOrigin);
    if (curActiveDest) setInitialWidth(rotDest, curActiveDest);
  }, { passive: true });

  const executeRotation = () => {
    if (document.hidden) return;

    // Do not rotate while preloader is active
    const pre = document.getElementById('pre');
    if (pre && pre.style.display !== 'none') return;

    const nextIdx = (currentIdx + 1) % originItems.length;

    const curOrigin = originItems[currentIdx];
    const nextOrigin = originItems[nextIdx];
    const curDest = destItems[currentIdx];
    const nextDest = destItems[nextIdx];

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;
    if (isMobile) {
      if (activeRotTimeline) {
        activeRotTimeline.kill();
        activeRotTimeline = null;
      }
      gsap.killTweensOf([curOrigin, curDest, nextOrigin, nextDest]);

      const nextOriginWidth = nextOrigin.offsetWidth || nextOrigin.getBoundingClientRect().width;
      const nextDestWidth = nextDest.offsetWidth || nextDest.getBoundingClientRect().width;

      const tl = gsap.timeline({
        onComplete() {
          curOrigin.classList.remove('is-active');
          curOrigin.style.visibility = 'hidden';
          curDest.classList.remove('is-active');
          curDest.style.visibility = 'hidden';

          nextOrigin.classList.add('is-active');
          nextOrigin.style.visibility = 'visible';
          nextDest.classList.add('is-active');
          nextDest.style.visibility = 'visible';

          currentIdx = nextIdx;
          activeRotTimeline = null;
        },
      });
      activeRotTimeline = tl;

      // 1. Fade out current outgoing words completely before incoming starts
      tl.to([curOrigin, curDest], {
        opacity: 0,
        y: -10,
        duration: 0.28,
        ease: 'power2.in',
        onComplete() {
          curOrigin.classList.remove('is-active');
          curOrigin.style.visibility = 'hidden';
          curDest.classList.remove('is-active');
          curDest.style.visibility = 'hidden';

          gsap.set([nextOrigin, nextDest], { opacity: 0, y: 12, visibility: 'visible' });
        },
      });

      // 2. Adjust container widths smoothly
      if (nextOriginWidth > 0) tl.to(rotOrigin, { width: Math.ceil(nextOriginWidth), duration: 0.22, ease: 'power2.out' }, '+=0.02');
      if (nextDestWidth > 0) tl.to(rotDest, { width: Math.ceil(nextDestWidth), duration: 0.22, ease: 'power2.out' }, '<');

      // 3. Clean fade-up of incoming words
      tl.to(
        [nextOrigin, nextDest],
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out',
        },
        '+=0.04',
      );

      return;
    }

    // Kill any existing rotation timeline to prevent overlapping transitions
    if (activeRotTimeline) {
      activeRotTimeline.kill();
      activeRotTimeline = null;
    }

    const curOriginChars = Array.from(curOrigin.querySelectorAll<HTMLElement>('.kt-char'));
    const nextOriginChars = Array.from(nextOrigin.querySelectorAll<HTMLElement>('.kt-char'));
    const curDestChars = Array.from(curDest.querySelectorAll<HTMLElement>('.kt-char'));
    const nextDestChars = Array.from(nextDest.querySelectorAll<HTMLElement>('.kt-char'));

    gsap.killTweensOf(curOriginChars);
    gsap.killTweensOf(nextOriginChars);
    gsap.killTweensOf(curDestChars);
    gsap.killTweensOf(nextDestChars);

    // Measure target widths
    const nextOriginWidth = nextOrigin.offsetWidth || nextOrigin.getBoundingClientRect().width;
    const nextDestWidth = nextDest.offsetWidth || nextDest.getBoundingClientRect().width;

    const tl = gsap.timeline({
      onComplete() {
        // Complete deactivation of outgoing items
        curOrigin.classList.remove('is-active');
        curOrigin.style.visibility = 'hidden';
        curDest.classList.remove('is-active');
        curDest.style.visibility = 'hidden';
        gsap.set(curOriginChars, { y: 0, opacity: 0 });
        gsap.set(curDestChars, { y: 0, opacity: 0, rotateX: 0 });

        // Ensure incoming items are solidly settled and active
        nextOrigin.classList.add('is-active');
        nextOrigin.style.visibility = 'visible';
        nextDest.classList.add('is-active');
        nextDest.style.visibility = 'visible';

        activeRotTimeline = null;
      },
    });

    activeRotTimeline = tl;

    // Smooth container width transition
    if (nextOriginWidth > 0) {
      tl.to(rotOrigin, { width: Math.ceil(nextOriginWidth), duration: 0.45, ease: 'power3.inOut' }, 0);
    }
    if (nextDestWidth > 0) {
      tl.to(rotDest, { width: Math.ceil(nextDestWidth), duration: 0.45, ease: 'power3.inOut' }, 0);
    }

    // Phase 1 (0 -> 0.26s): Outgoing words exit upwards and fade to zero
    tl.to(curOriginChars, {
      y: -24,
      opacity: 0,
      duration: 0.24,
      stagger: 0.015,
      ease: 'power2.in',
    }, 0);

    tl.to(curDestChars, {
      y: -24,
      opacity: 0,
      rotateX: 40,
      duration: 0.24,
      stagger: 0.015,
      ease: 'power2.in',
    }, 0);

    // Hand-off at 0.26s: Clean state swap so outgoing and incoming NEVER overlap in the DOM
    tl.add(() => {
      curOrigin.classList.remove('is-active');
      curOrigin.style.visibility = 'hidden';
      curDest.classList.remove('is-active');
      curDest.style.visibility = 'hidden';

      nextOrigin.style.visibility = 'visible';
      nextOrigin.classList.add('is-active');
      nextDest.style.visibility = 'visible';
      nextDest.classList.add('is-active');
    }, 0.26);

    // Phase 2 (0.26s -> 0.68s): Incoming words enter smoothly from below
    tl.fromTo(
      nextOriginChars,
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.40,
        stagger: 0.02,
        ease: 'power3.out',
      },
      0.26
    );

    tl.fromTo(
      nextDestChars,
      { y: 26, opacity: 0, rotateX: -60, scale: 0.94 },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        scale: 1,
        duration: 0.44,
        stagger: 0.02,
        ease: 'back.out(1.3)',
      },
      0.28
    );

    currentIdx = nextIdx;
  };

  const startRotatorLoop = () => {
    if (rotatorTimer) clearInterval(rotatorTimer);
    rotatorTimer = window.setInterval(executeRotation, 4000);
  };

  startRotatorLoop();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rotatorTimer) {
        clearInterval(rotatorTimer);
        rotatorTimer = null;
      }
    } else {
      if (!rotatorTimer) {
        startRotatorLoop();
      }
    }
  });
}

/**
 * 4. PROCESS STAGE HEADINGS: THE PLAN CHAPTER
 */
export function animatePlanPanelHeading(panelIdx: number, panelEl: HTMLElement) {
  if (reduce || !panelEl) return;

  const h2 = panelEl.querySelector<HTMLElement>('h2');
  if (!h2 || h2.dataset.animated === 'true') return;
  h2.dataset.animated = 'true';

  const { chars } = splitTextIntoChars(h2);
  if (chars.length === 0) return;

  h2.style.perspective = '800px';

  gsap.fromTo(
    chars,
    {
      opacity: 0,
      y: 18,
      skewX: -16,
      filter: 'blur(4px)',
    },
    {
      opacity: 1,
      y: 0,
      skewX: 0,
      filter: 'blur(0px)',
      duration: 0.75,
      stagger: {
        each: 0.022,
        from: 'start',
      },
      ease: 'power4.out',
      clearProps: 'filter',
    }
  );
}

/**
 * 5. THE BUILD CHAPTER: MONOLITHIC DIMENSIONAL SLABS
 */
export function animateBuildStageHeading(word: string, subtitle: string, stageIdx: number) {
  const bhd = document.getElementById('bhd');
  const bpp = document.getElementById('bpp');
  if (!bhd || !bpp) return;

  const STAGE_LABELS = [
    '01 · LOAD-BEARING FRAMEWORK',
    '02 · TACTILE SURFACE & TEXTURE',
    '03 · CENTIMETRE PROPORTION',
    '04 · DIURNAL SOLAR INCIDENCE',
  ];

  const stageTag = `<span class="build-stage-badge">${STAGE_LABELS[stageIdx] || ''}</span>`;
  bhd.innerHTML = `${stageTag}<em class="word w-built">${word}</em>`;
  bpp.textContent = subtitle;

  if (reduce) return;

  const emEl = bhd.querySelector<HTMLElement>('em.w-built');
  if (emEl) {
    emEl.style.perspective = '800px';
    const { chars } = splitTextIntoChars(emEl);
    gsap.fromTo(
      chars,
      {
        opacity: 0,
        rotateX: -90,
        y: 28,
        z: -35,
        filter: 'blur(6px)',
      },
      {
        opacity: 1,
        rotateX: 0,
        y: 0,
        z: 0,
        filter: 'blur(0px)',
        duration: 0.85,
        stagger: 0.04,
        ease: 'expo.out',
        clearProps: 'filter',
      }
    );
  }

  const badgeEl = bhd.querySelector<HTMLElement>('.build-stage-badge');
  if (badgeEl) {
    gsap.fromTo(
      badgeEl,
      { opacity: 0, y: -8, letterSpacing: '0.3em' },
      { opacity: 0.85, y: 0, letterSpacing: '0.2em', duration: 0.65, ease: 'power3.out' }
    );
  }

  gsap.fromTo(
    bpp,
    { y: 12, opacity: 0, filter: 'blur(3px)' },
    { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.65, delay: 0.1, ease: 'expo.out', clearProps: 'filter' }
  );
}

/**
 * 6. MAJOR SECTION HEADING: SELECTED WORKS
 */
export function animatePortfolioHeading(headingEl: HTMLElement) {
  if (!headingEl || headingEl.dataset.animated === 'true') return;
  headingEl.dataset.animated = 'true';

  if (reduce) return;

  headingEl.innerHTML = `
    <span class="proj-line proj-line-1"><span class="proj-word-selected">SELECTED</span></span>
    <div class="proj-datum-line" aria-hidden="true"><span class="proj-datum-coords">LAT 25°35'N · LONG 85°08'E</span></div>
    <span class="proj-line proj-line-2"><span class="proj-word-works">WORKS<em>.</em></span></span>
  `;

  const wordSelected = headingEl.querySelector<HTMLElement>('.proj-word-selected');
  const wordWorks = headingEl.querySelector<HTMLElement>('.proj-word-works');
  const datumLine = headingEl.querySelector<HTMLElement>('.proj-datum-line');

  if (wordSelected) {
    const { chars } = splitTextIntoChars(wordSelected);
    gsap.fromTo(
      chars,
      {
        opacity: 0,
        x: -45,
        letterSpacing: '0.35em',
        filter: 'blur(8px)',
      },
      {
        opacity: 1,
        x: 0,
        letterSpacing: '-0.02em',
        filter: 'blur(0px)',
        duration: 1.1,
        stagger: 0.04,
        ease: 'power4.out',
        clearProps: 'filter',
      }
    );
  }

  if (datumLine) {
    gsap.fromTo(
      datumLine,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 1.0, delay: 0.2, ease: 'expo.out' }
    );
  }

  if (wordWorks) {
    const { chars } = splitTextIntoChars(wordWorks);
    gsap.fromTo(
      chars,
      {
        opacity: 0,
        x: 45,
        rotateY: 45,
        filter: 'blur(6px)',
      },
      {
        opacity: 1,
        x: 0,
        rotateY: 0,
        filter: 'blur(0px)',
        duration: 1.05,
        delay: 0.12,
        stagger: 0.04,
        ease: 'power4.out',
        clearProps: 'filter',
      }
    );
  }
}

/**
 * 7. PROJECT TITLES: MASKED 3D REVEALS & TACTILE HOVER SPRING
 */
export function setupProjectCardTitleKinetic(container: HTMLElement) {
  if (reduce || !container) return;

  const titleEls = container.querySelectorAll<HTMLElement>('.card-project-title');
  titleEls.forEach((titleEl) => {
    if (titleEl.dataset.kineticReady === 'true') return;
    titleEl.dataset.kineticReady = 'true';

    const link = titleEl.querySelector<HTMLAnchorElement>('a');
    if (!link) return;

    const { chars } = splitTextIntoChars(link);
    if (chars.length === 0) return;

    link.addEventListener('mouseenter', () => {
      gsap.to(chars, {
        y: -4,
        color: '#dfba73',
        duration: 0.25,
        stagger: 0.02,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      });
    });
  });
}

/**
 * 8. FINAL CTA HEADING: DRAMATIC CINEMATIC CLOSING REVEAL
 */
export function animateClosingCtaHeading(ctaHeading: HTMLElement) {
  if (reduce || !ctaHeading || ctaHeading.dataset.animated === 'true') return;
  ctaHeading.dataset.animated = 'true';

  const em = ctaHeading.querySelector<HTMLElement>('em');
  const inner = ctaHeading.querySelector<HTMLElement>('.reveal-inner');
  if (!inner) return;

  ctaHeading.style.perspective = '1000px';

  gsap.fromTo(
    inner,
    { y: 55, opacity: 0, rotateX: 20 },
    { y: 0, opacity: 1, rotateX: 0, duration: 1.15, ease: 'power4.out' }
  );

  if (em) {
    gsap.fromTo(
      em,
      { opacity: 0, scale: 0.85, filter: 'blur(8px)' },
      {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1.25,
        delay: 0.25,
        ease: 'back.out(1.6)',
        clearProps: 'filter',
      }
    );
  }
}

/**
 * 9. CONTACT HERO DISPLAY: OVERSIZED CONTOUR + MONOLITHIC 3D TILT
 */
export function initContactKineticTypography(targetEl: HTMLElement) {
  const contactHeadline = targetEl.querySelector<HTMLElement>('.contact-hero-display');
  if (!contactHeadline) return;

  const svgDraw = contactHeadline.querySelector<HTMLElement>('.contour-draw-svg');
  if (svgDraw) {
    svgDraw.classList.add('is-drawn');
  }

  const spaceMask = contactHeadline.querySelector<HTMLElement>('.line-solid .reveal-inner');
  if (spaceMask && !reduce) {
    spaceMask.style.perspective = '1000px';
    const { chars } = splitTextIntoChars(spaceMask);
    gsap.fromTo(
      chars,
      {
        opacity: 0,
        rotateX: -80,
        y: 60,
        z: -60,
      },
      {
        opacity: 1,
        rotateX: 0,
        y: 0,
        z: 0,
        duration: 1.2,
        stagger: 0.06,
        ease: 'expo.out',
      }
    );

    const onMouseMove = (e: MouseEvent) => {
      const rect = contactHeadline.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(chars, {
        rotateY: relX * 16,
        rotateX: -relY * 16,
        duration: 0.6,
        stagger: 0.015,
        ease: 'power2.out',
      });
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
  }
}

/**
 * 10. CASE STUDY & SECTION HEADINGS KINETIC REVEALS
 */
export function setupCaseStudyHeadings(targetEl: HTMLElement) {
  if (reduce || !targetEl) return;

  const heroTitle = targetEl.querySelector<HTMLElement>('.cs-title');
  if (heroTitle && heroTitle.dataset.animated !== 'true') {
    heroTitle.dataset.animated = 'true';
    heroTitle.style.perspective = '1000px';
    const { chars } = splitTextIntoChars(heroTitle);
    gsap.fromTo(
      chars,
      { opacity: 0, y: 35, rotateX: -60, filter: 'blur(6px)' },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        filter: 'blur(0px)',
        duration: 1.05,
        stagger: 0.03,
        ease: 'power4.out',
        clearProps: 'filter',
      }
    );
  }

  const sectionTitles = targetEl.querySelectorAll<HTMLElement>('.cs-section-title');
  sectionTitles.forEach((secTitle) => {
    if (secTitle.dataset.kineticReady === 'true') return;
    secTitle.dataset.kineticReady = 'true';
    const { chars } = splitTextIntoChars(secTitle);
    if (chars.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              chars,
              { opacity: 0, y: 22, skewX: -10 },
              {
                opacity: 1,
                y: 0,
                skewX: 0,
                duration: 0.85,
                stagger: 0.02,
                ease: 'power4.out',
              }
            );
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    obs.observe(secTitle);
  });
}

/**
 * 11. GLOBAL HEADING AUDIT & AUTO-BINDING (SITE-WIDE REQUIREMENT)
 */
export function initAllHeadingsSiteWide(rootEl?: HTMLElement | Document | null) {
  if (reduce) return;

  const scope = rootEl || document;
  const headings = scope.querySelectorAll<HTMLElement>('h1, h2, h3, h4');

  headings.forEach((heading) => {
    if (
      heading.classList.contains('hero-h1') ||
      heading.id === 'bhd' ||
      heading.id === 'portfolio-heading' ||
      heading.id === 'approach-heading' ||
      heading.classList.contains('cs-title') ||
      heading.classList.contains('cs-section-title') ||
      heading.classList.contains('card-project-title') ||
      heading.dataset.kineticAudited === 'true'
    ) {
      return;
    }

    heading.dataset.kineticAudited = 'true';

    if (heading.classList.contains('closing-title')) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateClosingCtaHeading(heading);
              obs.unobserve(heading);
            }
          });
        },
        { threshold: 0.2 }
      );
      obs.observe(heading);
      return;
    }

    const { chars } = splitTextIntoChars(heading);
    if (chars.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              chars,
              { opacity: 0, y: 20, filter: 'blur(4px)' },
              {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 0.8,
                stagger: 0.025,
                ease: 'power4.out',
                clearProps: 'filter',
              }
            );
            obs.unobserve(heading);
          }
        });
      },
      { threshold: 0.15 }
    );
    obs.observe(heading);
  });
}

/**
 * 12. SCROLL-TRIGGERED TEXT REVEALS & CONTINUOUS DRIFT
 */
export function initScrollTextReveals(rootEl?: HTMLElement | Document | null) {
  if (typeof window === 'undefined') return;

  const scope = rootEl || document;
  const elements = scope.querySelectorAll<HTMLElement>(
    '.reveal-mask, .reveal-fade-up, .contour-draw-svg, .editorial-card, .closing-card'
  );

  if (reduce) {
    elements.forEach((el) => {
      el.classList.add('is-revealed', 'is-drawn');
    });
    return;
  }

  if (!observer) {
    observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.classList.add('is-revealed');
            if (target.classList.contains('contour-draw-svg')) {
              target.classList.add('is-drawn');
            }
            obs.unobserve(target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );
  }

  elements.forEach((el) => {
    if (!el.classList.contains('is-revealed')) {
      observer?.observe(el);
    }
  });

  initAllHeadingsSiteWide(scope);
}

/**
 * 13. KINETIC ACCENTS (WATERMARKS & MONUMENTAL NUMERALS)
 */
export function initKineticTypography() {
  if (typeof window === 'undefined' || reduce) return;

  let ticking = false;

  const updateKineticDrift = () => {
    const vh = window.innerHeight;

    const bigNumerals = document.querySelectorAll<HTMLElement>('.panel .big');
    bigNumerals.forEach((el) => {
      const parent = el.closest('.panel') as HTMLElement | null;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < vh) {
        const drift = ((rect.top / vh) * -45).toFixed(1);
        el.style.setProperty('--num-drift', `${drift}px`);
      }
    });

    const cards = document.querySelectorAll<HTMLElement>('.editorial-card');
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < vh) {
        const factor = (rect.top - vh * 0.5) / vh;
        const drift = (factor * -28).toFixed(1);
        const wm = card.querySelector<HTMLElement>('.card-watermark');
        if (wm) {
          wm.style.setProperty('--wm-drift', `${drift}px`);
        }
      }
    });
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          updateKineticDrift();
          ticking = false;
        });
      }
    },
    { passive: true }
  );

  updateKineticDrift();
}

/**
 * 14. LEGACY / EXTERNAL HELPER REVEAL
 */
export function revealHeroTypography() {
  if (typeof document === 'undefined') return;
  const main = document.querySelector<HTMLElement>('main.studio-hero-main');
  if (!main) return;
  main.classList.add('hero-revealed');
}

/**
 * MASTER INITIALIZER FOR TYPOGRAPHY ENGINE
 */
export function initTypographyEngine(container?: HTMLElement | Document | null) {
  prepareHeroWords();
  revealHeroTypography();
  initHeroKeywordRotator();
  initScrollTextReveals(container);
  if (!isEngineInitialized) {
    isEngineInitialized = true;
    initKineticTypography();
  }
}
