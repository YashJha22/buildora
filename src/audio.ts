import { reduce } from './state';

export type MaterialSoundType = 'sofa' | 'cushion' | 'wood' | 'metal' | 'ceramic';

class ArchitecturalAudio {
  private ctx: AudioContext | null = null;
  private enabled = false;
  private noiseGain: GainNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private humGain: GainNode | null = null;
  private humOsc: OscillatorNode | null = null;
  private lastDraw = 0;
  private lastSolarBucket = -1;
  private lastImpactTime = 0;
  private lastDraftTime = 0;
  private lastSnapTime = 0;
  private lastSlideTime = 0;

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;

    // 1. Filtered pink/white noise generator for graphite pencil drawing texture
    const bufSize = ctx.sampleRate * 2;
    const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    let b0 = 0,
      b1 = 0,
      b2 = 0;
    for (let i = 0; i < bufSize; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + w * 0.099046;
      b1 = 0.963 * b1 + w * 0.2965164;
      b2 = 0.57 * b2 + w * 1.0526913;
      data[i] = (b0 + b1 + b2 + w * 0.1848) * 0.08;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1850;
    filter.Q.value = 2.4;

    const nGain = ctx.createGain();
    nGain.gain.value = 0;

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(ctx.destination);
    noise.start();

    this.noiseFilter = filter;
    this.noiseGain = nGain;

    // 2. Warm low-pass architectural lens hum
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 110;

    const humFilter = ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.value = 240;

    const hGain = ctx.createGain();
    hGain.gain.value = 0;

    osc.connect(humFilter);
    humFilter.connect(hGain);
    hGain.connect(ctx.destination);
    osc.start();

    this.humOsc = osc;
    this.humGain = hGain;
  }

  toggle(): boolean {
    if (!this.ctx) this.init();
    if (!this.ctx) return false;
    this.enabled = !this.enabled;
    if (this.enabled && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.enabled && this.noiseGain && this.humGain && this.ctx) {
      this.noiseGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.04);
      this.humGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    } else if (this.enabled) {
      this.playCadTick(880);
    }
    return this.enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  update(uDraw: number, pointerSpeedPx: number, t: number) {
    if (!this.enabled || !this.ctx || reduce) return;
    const now = this.ctx.currentTime;

    // Graphite pencil grain while sketch is actively drawing
    const dDraw = Math.max(0, uDraw - this.lastDraw);
    this.lastDraw = uDraw;
    const drawActive = uDraw > 0.01 && uDraw < 0.995 && dDraw > 0.0001;
    const targetNoise = drawActive ? Math.min(0.18, dDraw * 28) : 0;
    if (this.noiseGain && this.noiseFilter) {
      this.noiseGain.gain.setTargetAtTime(targetNoise, now, 0.03);
      this.noiseFilter.frequency.setTargetAtTime(1500 + Math.sin(t * 19) * 450, now, 0.04);
    }

    // Spatial lens hum modulated by pointer velocity
    if (this.humGain && this.humOsc) {
      const speedNorm = Math.min(1, pointerSpeedPx / 42);
      const targetHum = uDraw >= 0.98 ? 0.012 + speedNorm * 0.045 : 0;
      this.humGain.gain.setTargetAtTime(targetHum, now, 0.06);
      this.humOsc.frequency.setTargetAtTime(108 + speedNorm * 54, now, 0.06);
    }
  }

  /**
   * Tactile physical placement contact sound when furniture and room objects land into place.
   * Tailored frequency, envelope, and body resonance per material type.
   */
  playPartImpact(type: MaterialSoundType, intensity = 1) {
    if (!this.enabled || !this.ctx || reduce) return;
    const now = this.ctx.currentTime;
    if (now - this.lastImpactTime < 0.038) return; // Voice limiting: max 1 impact per ~40ms
    this.lastImpactTime = now;

    const ctx = this.ctx;

    if (type === 'sofa') {
      // Sofa: deep, muted upholstered impact with subtle low-frequency body and short room resonance
      const osc = ctx.createOscillator();
      const oscSub = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.18);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(68, now);
      osc.frequency.exponentialRampToValueAtTime(36, now + 0.18);

      oscSub.type = 'triangle';
      oscSub.frequency.setValueAtTime(45, now);
      oscSub.frequency.exponentialRampToValueAtTime(28, now + 0.16);

      const amp = Math.min(0.09, 0.075 * intensity);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(filter);
      oscSub.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      oscSub.start(now);
      osc.stop(now + 0.23);
      oscSub.stop(now + 0.23);
    } else if (type === 'cushion') {
      // Cushions: soft, light fabric impacts
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, now);
      filter.Q.value = 2.5;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.08);

      const amp = Math.min(0.035, 0.03 * intensity);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.095);
    } else if (type === 'wood') {
      // Coffee table and rigid furniture: restrained solid-wood contact sounds
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(420, now);
      filter.Q.value = 3.2;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(115, now + 0.09);

      const amp = Math.min(0.065, 0.055 * intensity);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.115);
    } else if (type === 'metal') {
      // Lamp and small objects: lighter, sharper placement sounds
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2100, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);

      const amp = Math.min(0.045, 0.035 * intensity);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.048);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'ceramic') {
      // Planter: heavier, dull contact with subtle ceramic/earthy resonance
      const osc = ctx.createOscillator();
      const oscRing = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(280, now);
      filter.Q.value = 4.0;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.13);

      oscRing.type = 'sine';
      oscRing.frequency.setValueAtTime(420, now);
      oscRing.frequency.exponentialRampToValueAtTime(320, now + 0.11);

      const amp = Math.min(0.06, 0.05 * intensity);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      osc.connect(filter);
      oscRing.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      oscRing.start(now);
      osc.stop(now + 0.145);
      oscRing.stop(now + 0.145);
    }
  }

  /** Pen or pencil stroke when architectural lines are drawn in Plan, Elevation, or Section */
  playDraftingStroke() {
    if (!this.enabled || !this.ctx || reduce) return;
    const now = this.ctx.currentTime;
    if (now - this.lastDraftTime < 0.14) return;
    this.lastDraftTime = now;

    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(1600, now + 0.1);
    filter.Q.value = 3.5;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.1);

    gain.gain.setValueAtTime(0.015, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.115);
  }

  /** Measuring-tool extension, movement or click when measurement graphics appear */
  playMeasureSnap(freq = 1920) {
    if (!this.enabled || !this.ctx || reduce) return;
    const now = this.ctx.currentTime;
    if (now - this.lastSnapTime < 0.12) return;
    this.lastSnapTime = now;

    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.024);

    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  /** Quiet transition sound when moving between Plan, Elevation and Section */
  playChapterSlide() {
    if (!this.enabled || !this.ctx || reduce) return;
    const now = this.ctx.currentTime;
    if (now - this.lastSlideTime < 0.45) return;
    this.lastSlideTime = now;

    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, now);
    filter.frequency.exponentialRampToValueAtTime(540, now + 0.18);
    filter.Q.value = 1.8;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(95, now + 0.18);

    gain.gain.setValueAtTime(0.022, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.21);
  }

  /** Crisp architectural caliper micro-tick when locking onto a 3D CAD element */
  playCadTick(freq = 1640) {
    if (!this.enabled || !this.ctx || reduce) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.45, now + 0.035);
    g.gain.setValueAtTime(0.05, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  /** Tactile mechanical pull-cord switch snap & spring rebound */
  playPullCord(lightOn: boolean) {
    if (!this.enabled || !this.ctx || reduce) return;
    const now = this.ctx.currentTime;
    // Primary mechanical snap transient
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = 'triangle';
    const baseFreq = lightOn ? 1420 : 1180;
    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.3, now + 0.045);
    g1.gain.setValueAtTime(0.14, now);
    g1.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    osc1.connect(g1);
    g1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.055);

    // Subtle metallic spring release ping
    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(lightOn ? 880 : 720, now + 0.02);
    osc2.frequency.exponentialRampToValueAtTime(440, now + 0.12);
    g2.gain.setValueAtTime(0.06, now + 0.02);
    g2.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
    osc2.connect(g2);
    g2.connect(this.ctx.destination);
    osc2.start(now + 0.02);
    osc2.stop(now + 0.14);
  }

  /** Warm resonant chord when triggering a 3D Material Shockwave */
  playShockwave(presetIdx: number) {
    if (!this.enabled || !this.ctx || reduce) return;
    const now = this.ctx.currentTime;
    const roots = [220, 196, 246.94];
    const base = roots[presetIdx % roots.length];
    [base, base * 1.5, base * 2].forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f * 0.98, now);
      osc.frequency.exponentialRampToValueAtTime(f, now + 0.45);
      g.gain.setValueAtTime(0.04 / (i + 1), now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      osc.connect(g);
      g.connect(this.ctx!.destination);
      osc.start(now);
      osc.stop(now + 0.58);
    });
  }

  /** Subtle mechanical tick when scrubbing the Solar Dial */
  playSolarTick(hour: number) {
    const bucket = Math.round(hour * 2);
    if (bucket === this.lastSolarBucket) return;
    this.lastSolarBucket = bucket;
    this.playCadTick(980 + (bucket - 12) * 28);
  }

  /** Subtle wooden-mallet / metal tap when craftsman hammer strikes */
  playHammerStrike() {
    if (!this.enabled || !this.ctx || reduce) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);
    g.gain.setValueAtTime(0.08, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.075);
  }

  /** Authentic masonry / stone fracture and chisel strike when dismantling 404 wall blocks */
  playMasonryImpact(pitchVariation = 1) {
    if (!this.enabled || !this.ctx || reduce) return;
    const now = this.ctx.currentTime;
    const ctx = this.ctx;

    // 1. Heavy low-frequency concrete thud
    const osc = ctx.createOscillator();
    const gOsc = ctx.createGain();
    osc.type = 'triangle';
    const baseFreq = (160 + Math.random() * 40) * pitchVariation;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.08);
    gOsc.gain.setValueAtTime(0.18, now);
    gOsc.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    osc.connect(gOsc);
    gOsc.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.095);

    // 2. High-frequency crisp stone fracture click (chisel transient)
    const bufSize = Math.floor(ctx.sampleRate * 0.04);
    const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.25));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = (2800 + Math.random() * 800) * pitchVariation;
    filter.Q.value = 3.2;

    const gNoise = ctx.createGain();
    gNoise.gain.setValueAtTime(0.12, now);
    gNoise.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    noise.connect(filter);
    filter.connect(gNoise);
    gNoise.connect(ctx.destination);
    noise.start(now);

    // 3. Resonant travertine / stone clatter ring
    const ping = ctx.createOscillator();
    const gPing = ctx.createGain();
    ping.type = 'sine';
    const pingFreq = (640 + Math.random() * 220) * pitchVariation;
    ping.frequency.setValueAtTime(pingFreq, now + 0.01);
    ping.frequency.exponentialRampToValueAtTime(pingFreq * 0.7, now + 0.12);
    gPing.gain.setValueAtTime(0.05, now + 0.01);
    gPing.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
    ping.connect(gPing);
    gPing.connect(ctx.destination);
    ping.start(now + 0.01);
    ping.stop(now + 0.14);
  }

  /** Authentic crystalline glass shatter, fracture cracks & falling shard tinkles */
  playGlassShatter() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // 1. Initial sharp glass fracture impact (high-velocity crack transient)
    const bufSize = Math.floor(ctx.sampleRate * 0.08);
    const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.15));
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuf;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(3200, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(1400, now + 0.07);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.24, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(now);

    // 2. Heavy physical impact punch
    const impactOsc = ctx.createOscillator();
    const impactGain = ctx.createGain();
    impactOsc.type = 'triangle';
    impactOsc.frequency.setValueAtTime(380, now);
    impactOsc.frequency.exponentialRampToValueAtTime(50, now + 0.06);
    impactGain.gain.setValueAtTime(0.18, now);
    impactGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);
    impactOsc.connect(impactGain);
    impactGain.connect(ctx.destination);
    impactOsc.start(now);
    impactOsc.stop(now + 0.07);

    // 3. Shimmering crystalline shard harmonic pings (glass bell frequencies)
    const shardFrequencies = [1980, 2740, 3620, 4850, 6100, 7800];
    shardFrequencies.forEach((freq, idx) => {
      const delay = idx * 0.015 + Math.random() * 0.012;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * (0.85 + Math.random() * 0.1), now + delay + 0.28);

      const shardVol = 0.065 / (1 + idx * 0.4);
      g.gain.setValueAtTime(shardVol, now + delay);
      g.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.32);

      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.34);
    });

    // 4. Cascading micro-fragment tinkles (scatter clatter)
    for (let i = 0; i < 4; i++) {
      const scatterTime = now + 0.05 + i * 0.045 + Math.random() * 0.02;
      const scOsc = ctx.createOscillator();
      const scGain = ctx.createGain();
      scOsc.type = 'triangle';
      const scFreq = 3400 + Math.random() * 2600;
      scOsc.frequency.setValueAtTime(scFreq, scatterTime);
      scOsc.frequency.exponentialRampToValueAtTime(scFreq * 0.7, scatterTime + 0.05);
      scGain.gain.setValueAtTime(0.04, scatterTime);
      scGain.gain.exponentialRampToValueAtTime(0.0001, scatterTime + 0.055);
      scOsc.connect(scGain);
      scGain.connect(ctx.destination);
      scOsc.start(scatterTime);
      scOsc.stop(scatterTime + 0.06);
    }
  }

  /**
   * Crystalline pentatonic bell chime when interacting with magical words and titles.
   * Cycles harmonically across C6, D6, E6, G6, A6, C7.
   */
  playWordShimmer(noteIndex = 0) {
    if (!this.enabled || !this.ctx || reduce) return;
    const now = this.ctx.currentTime;
    const ctx = this.ctx;
    const scale = [1046.5, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0];
    const baseFreq = scale[Math.abs(noteIndex) % scale.length];

    // Primary bell tone
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.99, now + 0.35);
    g1.gain.setValueAtTime(0.08, now);
    g1.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
    osc1.connect(g1);
    g1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Harmonic sparkle overtone
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 2.01, now + 0.008);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 1.98, now + 0.22);
    g2.gain.setValueAtTime(0.03, now + 0.008);
    g2.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
    osc2.connect(g2);
    g2.connect(ctx.destination);
    osc2.start(now + 0.008);
    osc2.stop(now + 0.25);
  }
}

export const sound = new ArchitecturalAudio();
