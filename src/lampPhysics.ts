/**
 * Buildora — Physically Coherent Pendant Lamp & Flexible Cord Physics Engine
 *
 * Architecture:
 * 1. Geometric Anchor:
 *    - Pull cord starts at exact switch eyelet center (anchorX = 152.0, anchorY = 80.0)
 *    - Terminates exactly at bead center (beadX, beadY)
 * 2. Multi-Degree-of-Freedom Dynamics:
 *    - Pendulum sway driven by continuous non-repeating multi-harmonic air currents
 *    - Vertical underdamped elastic spring for pull displacement & snappy recoil
 *    - Dynamic cubic Bezier rope curvature with inertial wave lag (cord flexes & ripples)
 * 3. Interactive Robustness:
 *    - Supports rapid repeated pulls by accumulating downward impulse rather than resetting
 *    - Post-pull kinetic excitation imparts subtle natural lateral sway that gradually settles
 * 4. Resource Efficiency:
 *    - rAF loop strictly stopped when settings overlay is hidden (0 CPU/GPU waste)
 *    - Honors prefers-reduced-motion
 */

import { sound } from './audio';

export interface LampPhysicsOptions {
  svgEl: SVGSVGElement;
  cordPathEl: SVGPathElement;
  beadEl: SVGCircleElement;
  beadHighlightEl: SVGCircleElement;
  beadHitboxEl: SVGElement;
  coneEl: SVGElement;
  bulbGlowEl: SVGElement;
  onThemeCycle?: () => void;
}

export class LampPhysics {
  private svg: SVGSVGElement;
  private cordPath: SVGPathElement;
  private bead: SVGCircleElement;
  private beadHighlight: SVGCircleElement;
  private beadHitbox: SVGElement;
  private cone: SVGElement;
  private bulbGlow: SVGElement;
  private onThemeCycle?: () => void;

  private isRunning = false;
  private rafId: number | null = null;
  private lastTime = 0;

  // Exact coordinates of the brass pull-switch eyelet on underside rim of lampshade
  private readonly anchorX = 152.0;
  private readonly anchorY = 80.0;

  // Cord rest dimensions
  private readonly restLength = 54.0;
  private readonly naturalRestSag = 2.4; // natural relaxed curve bias in px

  // Pendulum sway state (radians)
  private beadAngle = 0.04;
  private beadAngularVel = 0.0;

  // Vertical spring pull & recoil state (px)
  private pullDisplacement = 0.0;
  private pullVelocity = 0.0;
  private isPulled = false;

  // Cord body curvature / wave flex state (px)
  private cordFlex = 2.4;
  private cordFlexVel = 0.0;

  // Accessibility
  private reducedMotion = false;

  // Cleanup references
  private cleanupFns: Array<() => void> = [];

  constructor(options: LampPhysicsOptions) {
    this.svg = options.svgEl;
    this.cordPath = options.cordPathEl;
    this.bead = options.beadEl;
    this.beadHighlight = options.beadHighlightEl;
    this.beadHitbox = options.beadHitboxEl;
    this.cone = options.coneEl;
    this.bulbGlow = options.bulbGlowEl;
    this.onThemeCycle = options.onThemeCycle;

    this.checkReducedMotion();
    this.bindEvents();
    this.renderFrame(0, 0.016);
  }

  private checkReducedMotion() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion = mq.matches;
      const handler = (e: MediaQueryListEvent) => {
        this.reducedMotion = e.matches;
      };
      mq.addEventListener('change', handler);
      this.cleanupFns.push(() => mq.removeEventListener('change', handler));
    }
  }

  private bindEvents() {
    const hitbox = this.beadHitbox;

    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      this.initiatePull();
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (this.isPulled) {
        e.preventDefault();
        this.releasePull();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        this.initiatePull();
        setTimeout(() => this.releasePull(), 160);
      }
    };

    hitbox.addEventListener('pointerdown', handlePointerDown as EventListener);
    window.addEventListener('pointerup', handlePointerUp as EventListener);
    hitbox.addEventListener('keydown', handleKeyDown as EventListener);

    this.cleanupFns.push(() => {
      hitbox.removeEventListener('pointerdown', handlePointerDown as EventListener);
      window.removeEventListener('pointerup', handlePointerUp as EventListener);
      hitbox.removeEventListener('keydown', handleKeyDown as EventListener);
    });
  }

  /**
   * Triggers a pull on the cord.
   * If already pulled or recoiling, adds kinetic impulse without teleporting.
   */
  public initiatePull() {
    this.isPulled = true;
    // Add downward velocity impulse (supports rapid repeated clicks smoothly)
    this.pullVelocity = Math.max(this.pullVelocity, 0) + 140.0;

    // Flex cord visibly outward under finger tension
    this.cordFlexVel += 35.0;

    if (this.bead) {
      this.bead.style.filter = 'drop-shadow(0 3px 10px rgba(223, 186, 115, 0.9))';
    }
  }

  /**
   * Releases the cord pull, firing audio and cycling theme, then recoiling elastically.
   */
  public releasePull() {
    if (!this.isPulled) return;
    this.isPulled = false;

    // Tactile pull-cord click audio
    sound.playPullCord(true);

    // Subtle lateral kick so releasing the cord produces a natural decaying pendulum sway
    const kickDir = Math.sin(performance.now() * 0.005) > 0 ? 0.35 : -0.35;
    this.beadAngularVel += kickDir;

    // Fire theme switch callback
    if (this.onThemeCycle) {
      this.onThemeCycle();
    }

    if (this.bead) {
      this.bead.style.filter = '';
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.tick(this.lastTime);
  }

  public stop() {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick = (time: number) => {
    if (!this.isRunning) return;

    // Clamp delta time to avoid large jumps if tab was backgrounded
    const dt = Math.min((time - this.lastTime) * 0.001, 0.04);
    this.lastTime = time;

    this.updatePhysics(time * 0.001, dt);
    this.renderFrame(time * 0.001, dt);

    this.rafId = requestAnimationFrame(this.tick);
  };

  private updatePhysics(t: number, dt: number) {
    if (this.reducedMotion) {
      this.beadAngle = 0.03;
      this.cordFlex = 2.0;
      this.pullDisplacement = this.isPulled ? 14.0 : 0.0;
      return;
    }

    // 1. Natural Non-Repeating Pendulum Idle Sway
    // Multi-frequency air draft harmonic driving torque
    const airCurrentTorque =
      0.09 * Math.sin(1.85 * t + 0.3) +
      0.045 * Math.sin(0.95 * t + 1.4) +
      0.02 * Math.sin(3.4 * t + 2.7);

    const swayDamping = 0.72;
    const gravityFactor = 5.8; // (g/L)
    const angularAccel = airCurrentTorque - swayDamping * this.beadAngularVel - gravityFactor * this.beadAngle;

    this.beadAngularVel += angularAccel * dt;
    this.beadAngle += this.beadAngularVel * dt;

    // 2. Vertical Spring Pull and Damped Elastic Recoil
    const targetPull = this.isPulled ? 20.0 : 0.0;
    const springK = this.isPulled ? 160.0 : 210.0; // stiffer snap-back on release
    const springDamp = this.isPulled ? 18.0 : 12.0; // underdamped recoil for natural bounce
    const springForce = springK * (targetPull - this.pullDisplacement) - springDamp * this.pullVelocity;

    this.pullVelocity += springForce * dt;
    this.pullDisplacement += this.pullVelocity * dt;

    // Prevent extreme downward overstretch while allowing elastic recoil bounce
    if (this.pullDisplacement > 32.0) {
      this.pullDisplacement = 32.0;
      this.pullVelocity = 0.0;
    }

    // 3. Cord Body Dynamic Flexibility / Wave Curvature
    // Cord bows outward with natural resting sag, trails bead velocity, and flexes during vertical recoil
    const targetFlex =
      this.naturalRestSag -
      this.beadAngularVel * 12.0 +
      (this.isPulled ? 5.5 : 0.0) -
      this.pullVelocity * 0.03;

    const flexK = 180.0;
    const flexDamp = 14.0;
    const flexForce = flexK * (targetFlex - this.cordFlex) - flexDamp * this.cordFlexVel;

    this.cordFlexVel += flexForce * dt;
    this.cordFlex += this.cordFlexVel * dt;
  }

  private renderFrame(_t: number, _dt: number) {
    const totalLength = this.restLength + this.pullDisplacement;

    // Calculate moving bead center (endpoint of the cord)
    const beadX = this.anchorX + totalLength * Math.sin(this.beadAngle);
    const beadY = this.anchorY + totalLength * Math.cos(this.beadAngle);

    // Compute smooth cubic Bezier control points for a truly flexible rope:
    // Control point 1 sits ~32% down the cord; Control point 2 sits ~68% down the cord.
    // They both incorporate the dynamic cord flexibility offset, creating natural rope inertia.
    const deltaX = beadX - this.anchorX;
    const deltaY = beadY - this.anchorY;

    const cp1x = this.anchorX + deltaX * 0.32 + this.cordFlex * 0.75;
    const cp1y = this.anchorY + deltaY * 0.36;

    const cp2x = this.anchorX + deltaX * 0.68 + this.cordFlex * 1.1;
    const cp2y = this.anchorY + deltaY * 0.72;

    // Generate dynamic cubic Bezier path:
    // M anchorX anchorY C cp1x cp1y, cp2x cp2y, beadX beadY
    const d = `M ${this.anchorX.toFixed(1)} ${this.anchorY.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${beadX.toFixed(1)} ${beadY.toFixed(1)}`;
    this.cordPath.setAttribute('d', d);

    // Update bead circle position to exactly track the cord endpoint
    this.bead.setAttribute('cx', beadX.toFixed(1));
    this.bead.setAttribute('cy', beadY.toFixed(1));

    // Update bead metallic specular highlight
    this.beadHighlight.setAttribute('cx', (beadX - 1.6).toFixed(1));
    this.beadHighlight.setAttribute('cy', (beadY - 1.6).toFixed(1));

    // Update interactive hitbox position
    this.beadHitbox.setAttribute('cx', beadX.toFixed(1));
    this.beadHitbox.setAttribute('cy', beadY.toFixed(1));
  }

  public destroy() {
    this.stop();
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns = [];
  }
}
