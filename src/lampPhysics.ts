/**
 * Buildora — Physically Coherent Animated Hanging Lamp
 * Features:
 * - Fixed ceiling attachment & suspension cable running into lampshade top
 * - Flared vintage atelier green lampshade with brass collar and lip
 * - Centered incandescent bulb beneath shade with downward illumination cone
 * - Genuine flexible electrical pull-cord attached to shade anchor
 * - Continuous, natural pendulum idle sway with variable amplitude & phase
 * - Bead lagging behind cord with inertia (dynamic quadratic Bezier curve)
 * - Interactive spring pull and damped elastic recoil
 * - Lifecycle management (rAF loop pauses when panel is closed to save CPU/GPU)
 * - Respects prefers-reduced-motion
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

  // Fixed Anchor on the bottom-right rim of the lampshade
  private readonly anchorX = 158;
  private readonly anchorY = 78;

  // Rest position of bead relative to anchor
  private readonly restLength = 54;
  private readonly restAngle = 0.05; // slight natural angle in radians

  // Motion state
  private angle = 0.05;
  private angularVelocity = 0;
  private pullDisplacement = 0;
  private pullVelocity = 0;
  private isPulled = false;

  // Reduced motion preference
  private reducedMotion = false;

  // Cleanup listeners
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
    if (window.matchMedia) {
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
      e.preventDefault();
      if (this.isPulled) {
        this.releasePull();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        this.initiatePull();
        setTimeout(() => this.releasePull(), 180);
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

  public initiatePull() {
    if (this.isPulled) return;
    this.isPulled = true;
    this.pullVelocity = 120; // downward initial impulse
    if (this.bead) {
      this.bead.style.filter = 'drop-shadow(0 4px 12px rgba(223, 186, 115, 0.85))';
    }
  }

  public releasePull() {
    if (!this.isPulled) return;
    this.isPulled = false;

    // Trigger mechanical click sound
    sound.playPullCord(true);

    // Call theme cycle if requested
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

    const dt = Math.min((time - this.lastTime) * 0.001, 0.05); // cap delta-time at 50ms
    this.lastTime = time;

    this.updatePhysics(time * 0.001, dt);
    this.renderFrame(time * 0.001, dt);

    this.rafId = requestAnimationFrame(this.tick);
  };

  private updatePhysics(t: number, dt: number) {
    if (this.reducedMotion) {
      this.angle = 0.04;
      this.pullDisplacement = this.isPulled ? 14 : 0;
      return;
    }

    // 1. Idle Natural Pendulum Sway Simulation with Variable Harmonics
    // Multi-frequency driving function creates continuous organic sway that never repeats mechanically
    const driveTorque =
      0.08 * Math.sin(2.2 * t + 0.4) +
      0.035 * Math.sin(1.15 * t + 1.8) +
      0.015 * Math.sin(4.1 * t + 2.7);

    // Damped physical pendulum equation: theta'' + c*theta' + (g/L)*sin(theta) = torque
    const damping = 0.85;
    const gravityFrequency = 6.2; // (g/L) factor
    const angularAccel = driveTorque - damping * this.angularVelocity - gravityFrequency * this.angle;

    this.angularVelocity += angularAccel * dt;
    this.angle += this.angularVelocity * dt;

    // 2. Vertical Spring Pull and Damped Recoil
    const targetPull = this.isPulled ? 18.0 : 0.0;
    const springConstant = 180.0;
    const springDamping = 14.0;
    const springForce = springConstant * (targetPull - this.pullDisplacement) - springDamping * this.pullVelocity;

    this.pullVelocity += springForce * dt;
    this.pullDisplacement += this.pullVelocity * dt;
  }

  private renderFrame(t: number, _dt: number) {
    const totalLength = this.restLength + this.pullDisplacement;

    // Calculate moving bead endpoint from current angle and length
    const beadX = this.anchorX + totalLength * Math.sin(this.angle);
    const beadY = this.anchorY + totalLength * Math.cos(this.angle);

    // The cord is a flexible rope: its midpoint bows due to inertial lag
    // Quadratic Bezier control point lags behind the bead's angular velocity
    const curvatureBias = this.reducedMotion ? 0 : this.angularVelocity * 14.0;
    const ctrlX = (this.anchorX + beadX) * 0.5 - curvatureBias;
    const ctrlY = (this.anchorY + beadY) * 0.5 + 4.0;

    // Update dynamic SVG quadratic curve: M anchor Q ctrl bead
    const d = `M ${this.anchorX.toFixed(1)} ${this.anchorY.toFixed(1)} Q ${ctrlX.toFixed(1)} ${ctrlY.toFixed(1)} ${beadX.toFixed(1)} ${beadY.toFixed(1)}`;
    this.cordPath.setAttribute('d', d);

    // Update bead circle position to exact endpoint of the cord
    this.bead.setAttribute('cx', beadX.toFixed(1));
    this.bead.setAttribute('cy', beadY.toFixed(1));

    // Update bead highlight reflection
    this.beadHighlight.setAttribute('cx', (beadX - 1.8).toFixed(1));
    this.beadHighlight.setAttribute('cy', (beadY - 1.8).toFixed(1));

    // Update interactive hitbox
    this.beadHitbox.setAttribute('cx', beadX.toFixed(1));
    this.beadHitbox.setAttribute('cy', beadY.toFixed(1));
  }

  public destroy() {
    this.stop();
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns = [];
  }
}
