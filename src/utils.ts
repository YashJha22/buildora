import gsap from 'gsap';
import { initTypographyEngine } from './typography';
export { lerp, clamp } from './math';

export const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T;

export interface WordAnimationOptions {
  delay?: number;
  stagger?: number;
  fromY?: number;
  duration?: number;
}

/**
 * Activates refined kinetic typography and fluid text animations across all scoped elements.
 */
export function activateContinuousTypography(container?: HTMLElement | Document | null) {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  initTypographyEngine(container);
}

/**
 * Shared Kinetic Text Reveal Trigger
 * Animates text with a confident, polished upward slide from below its clipping mask.
 */
export function triggerWordAnimation(
  target: Element | string,
  options: WordAnimationOptions = {}
) {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const container = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : (target as HTMLElement);
  if (!container) return;

  const elements = container.querySelectorAll<HTMLElement>('.reveal-inner, .word, .heading-word');
  if (elements.length === 0) return;

  const {
    delay = 0,
    stagger = 0.08,
    fromY = 28,
    duration = 0.95,
  } = options;

  gsap.killTweensOf(elements);

  gsap.fromTo(
    elements,
    {
      y: fromY,
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      duration,
      delay,
      stagger,
      ease: 'power4.out',
      onComplete() {
        gsap.set(elements, { clearProps: 'transform,opacity' });
        initTypographyEngine(container);
      },
    }
  );
}
