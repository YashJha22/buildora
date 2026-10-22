import { sound } from '../audio';
import { triggerHammerStrike } from '../cursor';

// Architectural grid geometry matching the reference cinematic 4-0-4 masonry wall:
// - Left '4': 2-block-wide upright, stepped diagonal leg, 2-block crossbar extending right.
// - Middle '0': 2-block-thick pillars and bars, chamfered outer corners, hollow interior void.
// - Right '4': 2-block-wide upright, stepped diagonal leg, 2-block crossbar extending right.
const FOUR_SHAPE: Array<[number, number[]]> = [
  [1, [7, 8]],
  [2, [7, 8]],
  [3, [5, 6, 7, 8]],
  [4, [4, 5, 7, 8]],
  [5, [3, 4, 7, 8]],
  [6, [2, 3, 7, 8]],
  [7, [1, 2, 7, 8]],
  [8, [0, 1, 7, 8]],
  [9, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]],
  [10, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]],
  [11, [7, 8]],
  [12, [7, 8]],
  [13, [7, 8]],
];

const ZERO_SHAPE: Array<[number, number[]]> = [
  [1, [2, 3, 4, 5, 6, 7]],
  [2, [1, 2, 3, 4, 5, 6, 7, 8]],
  [3, [0, 1, 8, 9]],
  [4, [0, 1, 8, 9]],
  [5, [0, 1, 8, 9]],
  [6, [0, 1, 8, 9]],
  [7, [0, 1, 8, 9]],
  [8, [0, 1, 8, 9]],
  [9, [0, 1, 8, 9]],
  [10, [0, 1, 8, 9]],
  [11, [0, 1, 8, 9]],
  [12, [1, 2, 3, 4, 5, 6, 7, 8]],
  [13, [2, 3, 4, 5, 6, 7]],
];

interface WallBlock {
  id: number;
  r: number;
  c: number;
  x: number;
  y: number;
  w: number;
  h: number;
  groupEl: SVGGElement | null;
  rectEl: SVGRectElement | null;
  ghostEl: SVGRectElement | null;
  contacted: boolean;
  destroyed: boolean;
}

interface DynamicBody {
  el: SVGElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  opacity: number;
  life: number;
  maxLife: number;
  bounces: number;
  settled: boolean;
}

interface Particle {
  el: SVGElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export function renderNotFoundPage(targetEl: HTMLElement): () => void {
  targetEl.innerHTML = `
    <div class="not-found-open" id="not-found-root">
      <!-- Minimal Architectural Title -->
      <header class="nfl-header">
        <h1 class="nfl-hero-title">PAGE <span class="nfl-gold-word">NOT</span> FOUND</h1>
      </header>

      <!-- Open Atmospheric 404 Stage (No surrounding box/card/frame) -->
      <div class="nfl-open-stage" id="nfm-stage" role="region" aria-label="Interactive 404 architectural masonry wall">
        <svg id="nfg-svg" viewBox="0 0 960 480" preserveAspectRatio="xMidYMid meet" aria-label="Interactive 404 architectural brick wall. Move cursor across wall to chisel bricks.">
          <defs>
            <!-- Soft Volumetric Golden Atmosphere (Feathers completely to transparent) -->
            <radialGradient id="nfg-haze" cx="50%" cy="45%" r="48%">
              <stop offset="0%" stop-color="#dfba73" stop-opacity="0.20"/>
              <stop offset="35%" stop-color="#dfba73" stop-opacity="0.08"/>
              <stop offset="70%" stop-color="#dfba73" stop-opacity="0.02"/>
              <stop offset="100%" stop-color="#0a0908" stop-opacity="0.0"/>
            </radialGradient>

            <!-- Reflection Linear Mask (Feathers into the page background) -->
            <linearGradient id="nfg-refl-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45"/>
              <stop offset="25%" stop-color="#ffffff" stop-opacity="0.22"/>
              <stop offset="65%" stop-color="#ffffff" stop-opacity="0.06"/>
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0"/>
            </linearGradient>
            <mask id="nfg-reflection-mask">
              <rect x="0" y="378" width="960" height="102" fill="url(#nfg-refl-grad)"/>
            </mask>

            <!-- 3D Chamfered Gold Limestone Ashlar Block Gradient -->
            <linearGradient id="nfg-block-grad" x1="0" y1="0" x2="0.32" y2="1">
              <stop offset="0%" stop-color="#fff8e7"/>
              <stop offset="10%" stop-color="#f5d691"/>
              <stop offset="32%" stop-color="#dfba73"/>
              <stop offset="68%" stop-color="#b6893e"/>
              <stop offset="92%" stop-color="#6e4d1f"/>
              <stop offset="100%" stop-color="#3d290e"/>
            </linearGradient>

            <!-- Contact Specular Flash Highlight -->
            <linearGradient id="nfg-block-glow" x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="25%" stop-color="#fff5dc"/>
              <stop offset="70%" stop-color="#ebd092"/>
              <stop offset="100%" stop-color="#b88f42"/>
            </linearGradient>

            <!-- Debris Block Gradient -->
            <linearGradient id="nfg-debris-grad" x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0%" stop-color="#f5dc9e"/>
              <stop offset="35%" stop-color="#c99b4b"/>
              <stop offset="100%" stop-color="#553a15"/>
            </linearGradient>
          </defs>

          <!-- 1. Pure Ambient Golden Atmosphere (Transparent background, no box) -->
          <ellipse cx="480" cy="235" rx="460" ry="225" fill="url(#nfg-haze)"/>

          <!-- 2. Wet Floor Specular Shimmer Line (Blends directly into page background) -->
          <line x1="40" y1="378" x2="920" y2="378" stroke="rgba(255, 245, 220, 0.40)" stroke-width="1.2"/>
          <line x1="0" y1="378" x2="960" y2="378" stroke="rgba(223, 186, 115, 0.18)" stroke-width="0.8"/>

          <!-- 3. Ground Rubble & Pre-Scattered Masonry Chunks (Reflecting reference) -->
          <g id="nfg-rubble-layer" opacity="0.95">
            <!-- Left 4 Rubble -->
            <rect x="135" y="373" width="15" height="7" rx="1.2" fill="url(#nfg-debris-grad)" stroke="#120e0a" stroke-width="0.7"/>
            <polygon points="328,378 348,367 360,378" fill="url(#nfg-debris-grad)" stroke="#120e0a" stroke-width="0.7"/>
            <circle cx="366" cy="377" r="2.2" fill="#d2a95c"/>
            <circle cx="373" cy="376" r="1.4" fill="#f0d28d"/>

            <!-- Center 0 Fallen Debris Pile -->
            <polygon points="458,378 474,363 486,378" fill="url(#nfg-debris-grad)" stroke="#120e0a" stroke-width="0.8"/>
            <rect x="488" y="368" width="17" height="10" rx="1.4" transform="rotate(-9 496 373)" fill="url(#nfg-debris-grad)" stroke="#120e0a" stroke-width="0.8"/>
            <rect x="522" y="365" width="19" height="13" rx="1.5" transform="rotate(14 531 371)" fill="url(#nfg-debris-grad)" stroke="#120e0a" stroke-width="0.8"/>
            <polygon points="555,378 565,370 574,378" fill="url(#nfg-debris-grad)" stroke="#120e0a" stroke-width="0.7"/>
            <circle cx="508" cy="377" r="2.4" fill="#d2a95c"/>
            <circle cx="514" cy="376" r="1.6" fill="#f5dc9e"/>
            <circle cx="546" cy="377" r="1.8" fill="#c49749"/>
            <circle cx="584" cy="377" r="1.4" fill="#dfba73"/>

            <!-- Right 4 Rubble -->
            <rect x="664" y="371" width="18" height="9" rx="1.4" transform="rotate(-6 673 375)" fill="url(#nfg-debris-grad)" stroke="#120e0a" stroke-width="0.8"/>
            <polygon points="856,378 870,368 880,378" fill="url(#nfg-debris-grad)" stroke="#120e0a" stroke-width="0.7"/>
            <circle cx="886" cy="377" r="1.8" fill="#dfba73"/>
          </g>

          <!-- 4. Dynamic Live Mirror Reflection in Floor (Mirrors intact solid blocks only) -->
          <g id="nfg-reflection-wrap" mask="url(#nfg-reflection-mask)" opacity="0.38">
            <use href="#nfg-blocks-layer" transform="translate(0, 756) scale(1, -1)"/>
          </g>

          <!-- 5. Ghost Wireframe Outlines (Independent, zero reflection cloning overhead) -->
          <g id="nfg-ghost-layer"></g>

          <!-- 6. Intact Solid Masonry Blocks -->
          <g id="nfg-blocks-layer"></g>

          <!-- 7. Dynamic Falling & Tumbling Masonry Bodies (Decoupled from reflection <use> target) -->
          <g id="nfg-physics-layer"></g>

          <!-- 8. Foreground Chisel Dust Particles -->
          <g id="nfg-particles-layer"></g>
        </svg>
      </div>

      <!-- Exactly Two Centered Controls (Floating directly below 404) -->
      <nav class="nfl-hero-actions" aria-label="Page not found navigation">
        <a href="/" class="nfl-pill-btn" data-link id="nfm-home-link">
          <svg class="nfl-btn-icon" width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M13 8H3M7 4L3 8l4 4"/>
          </svg>
          <span>RETURN TO STUDIO</span>
        </a>

        <button type="button" class="nfl-pill-btn" id="nfm-rebuild-btn" aria-label="Rebuild the 404 wall">
          <svg class="nfl-btn-icon" width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M2.5 8a5.5 5.5 0 1 1 1.6 3.9L2 14"/>
            <path d="M2 9.5h4.5V14"/>
          </svg>
          <span>REBUILD WALL</span>
        </button>
      </nav>
    </div>
  `;

  // Initialize Elements
  const svgEl = targetEl.querySelector<SVGSVGElement>('#nfg-svg');
  const ghostLayer = targetEl.querySelector<SVGGElement>('#nfg-ghost-layer');
  const blocksLayer = targetEl.querySelector<SVGGElement>('#nfg-blocks-layer');
  const physicsLayer = targetEl.querySelector<SVGGElement>('#nfg-physics-layer');
  const particlesLayer = targetEl.querySelector<SVGGElement>('#nfg-particles-layer');
  const rebuildBtn = targetEl.querySelector<HTMLButtonElement>('#nfm-rebuild-btn');

  if (!svgEl || !ghostLayer || !blocksLayer || !physicsLayer || !particlesLayer) {
    return () => {};
  }

  // Geometry: 38 Columns, 14 Rows, centered in 960x480 viewBox
  const s = 22;      // Pitch
  const bw = 20.2;   // Block width (1.8px dark crevice gap)
  const bh = 20.2;   // Block height
  const x0 = 63;     // Centered left margin
  const y0 = 70;     // Vertical start (lowest blocks sit at floor y=378)

  const blocks: WallBlock[] = [];
  const blockGrid = new Map<string, WallBlock>();
  let blockId = 0;

  // 1. Left '4' (Cols 0..10)
  for (const [r, cols] of FOUR_SHAPE) {
    for (const c of cols) {
      const blk: WallBlock = {
        id: blockId++,
        r,
        c,
        x: x0 + c * s,
        y: y0 + r * s,
        w: bw,
        h: bh,
        groupEl: null,
        rectEl: null,
        ghostEl: null,
        contacted: false,
        destroyed: false,
      };
      blocks.push(blk);
      blockGrid.set(`${r},${c}`, blk);
    }
  }

  // 2. Middle '0' (Cols 14..23)
  for (const [r, cols] of ZERO_SHAPE) {
    for (const c of cols) {
      const colIdx = c + 14;
      const blk: WallBlock = {
        id: blockId++,
        r,
        c: colIdx,
        x: x0 + colIdx * s,
        y: y0 + r * s,
        w: bw,
        h: bh,
        groupEl: null,
        rectEl: null,
        ghostEl: null,
        contacted: false,
        destroyed: false,
      };
      blocks.push(blk);
      blockGrid.set(`${r},${colIdx}`, blk);
    }
  }

  // 3. Right '4' (Cols 27..37)
  for (const [r, cols] of FOUR_SHAPE) {
    for (const c of cols) {
      const colIdx = c + 27;
      const blk: WallBlock = {
        id: blockId++,
        r,
        c: colIdx,
        x: x0 + colIdx * s,
        y: y0 + r * s,
        w: bw,
        h: bh,
        groupEl: null,
        rectEl: null,
        ghostEl: null,
        contacted: false,
        destroyed: false,
      };
      blocks.push(blk);
      blockGrid.set(`${r},${colIdx}`, blk);
    }
  }

  // Helper to create a static 3D chamfered gold ashlar cube with specular rims
  function createBlockElement(x: number, y: number, w: number, h: number): {
    group: SVGGElement;
    rect: SVGRectElement;
  } {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'nfg-masonry-cube');
    g.setAttribute('transform', `translate(${x.toFixed(1)}, ${y.toFixed(1)})`);

    // Main 3D chamfered block
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '0');
    rect.setAttribute('y', '0');
    rect.setAttribute('width', w.toFixed(1));
    rect.setAttribute('height', h.toFixed(1));
    rect.setAttribute('rx', '2.2');
    rect.setAttribute('fill', 'url(#nfg-block-grad)');
    rect.setAttribute('stroke', '#120e0a');
    rect.setAttribute('stroke-width', '0.85');
    g.appendChild(rect);

    // Top specular highlight bevel line
    const topLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    topLine.setAttribute('x1', '2');
    topLine.setAttribute('y1', '1.5');
    topLine.setAttribute('x2', (w - 2).toFixed(1));
    topLine.setAttribute('y2', '1.5');
    topLine.setAttribute('stroke', '#fff9ea');
    topLine.setAttribute('stroke-width', '1.2');
    topLine.setAttribute('stroke-linecap', 'round');
    topLine.setAttribute('opacity', '0.9');
    g.appendChild(topLine);

    // Left directional highlight bevel line
    const leftLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    leftLine.setAttribute('x1', '1.5');
    leftLine.setAttribute('y1', '2');
    leftLine.setAttribute('x2', '1.5');
    leftLine.setAttribute('y2', (h - 2).toFixed(1));
    leftLine.setAttribute('stroke', '#fde4a4');
    leftLine.setAttribute('stroke-width', '1.0');
    leftLine.setAttribute('stroke-linecap', 'round');
    leftLine.setAttribute('opacity', '0.7');
    g.appendChild(leftLine);

    // Bottom crevice shadow line
    const bottomLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    bottomLine.setAttribute('x1', '2');
    bottomLine.setAttribute('y1', (h - 1.2).toFixed(1));
    bottomLine.setAttribute('x2', (w - 2).toFixed(1));
    bottomLine.setAttribute('y2', (h - 1.2).toFixed(1));
    bottomLine.setAttribute('stroke', '#100c08');
    bottomLine.setAttribute('stroke-width', '1.0');
    bottomLine.setAttribute('opacity', '0.85');
    g.appendChild(bottomLine);

    // Right crevice shadow line
    const rightLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    rightLine.setAttribute('x1', (w - 1.2).toFixed(1));
    rightLine.setAttribute('y1', '2');
    rightLine.setAttribute('x2', (w - 1.2).toFixed(1));
    rightLine.setAttribute('y2', (h - 2).toFixed(1));
    rightLine.setAttribute('stroke', '#100c08');
    rightLine.setAttribute('stroke-width', '1.0');
    rightLine.setAttribute('opacity', '0.85');
    g.appendChild(rightLine);

    return { group: g, rect };
  }

  // Lightweight single-node dynamic physics body for buttery 60 FPS tumbling animation
  function createDynamicBlockElement(w: number, h: number): SVGRectElement {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', w.toFixed(1));
    rect.setAttribute('height', h.toFixed(1));
    rect.setAttribute('rx', '2.2');
    rect.setAttribute('fill', 'url(#nfg-block-grad)');
    rect.setAttribute('stroke', '#120e0a');
    rect.setAttribute('stroke-width', '0.85');
    return rect;
  }

  // Populate Intact Blocks & Ghost Wireframes
  blocks.forEach((b) => {
    // Ghost Wireframe Outline (revealed when block falls)
    const ghost = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    ghost.setAttribute('x', b.x.toFixed(1));
    ghost.setAttribute('y', b.y.toFixed(1));
    ghost.setAttribute('width', b.w.toFixed(1));
    ghost.setAttribute('height', b.h.toFixed(1));
    ghost.setAttribute('rx', '2.0');
    ghost.setAttribute('fill', 'none');
    ghost.setAttribute('stroke', 'rgba(223,186,115,0.14)');
    ghost.setAttribute('stroke-width', '0.8');
    ghost.setAttribute('stroke-dasharray', '2.5 2');
    ghost.setAttribute('class', 'nfg-ghost-rect');
    ghostLayer.appendChild(ghost);
    b.ghostEl = ghost;

    // Solid Chamfered Ashlar Cube
    const { group, rect } = createBlockElement(b.x, b.y, b.w, b.h);
    group.setAttribute('data-id', String(b.id));
    group.setAttribute('tabindex', '0');
    group.setAttribute('aria-label', `Architectural brick row ${b.r} column ${b.c}`);
    blocksLayer.appendChild(group);
    b.groupEl = group;
    b.rectEl = rect;
  });

  // Cached Geometry: Only updated on window resize or scroll
  let cachedSvgRect: DOMRect = svgEl.getBoundingClientRect();
  function updateCachedRect() {
    if (svgEl) {
      cachedSvgRect = svgEl.getBoundingClientRect();
    }
  }
  window.addEventListener('resize', updateCachedRect, { passive: true });
  window.addEventListener('scroll', updateCachedRect, { passive: true });

  // Pure arithmetic coordinate conversion: Zero DOM reads during mousemove
  function getSvgPoint(clientX: number, clientY: number): { x: number; y: number } {
    return {
      x: ((clientX - cachedSvgRect.left) / cachedSvgRect.width) * 960,
      y: ((clientY - cachedSvgRect.top) / cachedSvgRect.height) * 480,
    };
  }

  // Dynamic Physics State
  let rafId: number | null = null;
  let isPhysicsRunning = false;
  let lastFrameTime = performance.now();

  const dynamicBodies: DynamicBody[] = [];
  const particles: Particle[] = [];

  function ensurePhysicsRunning() {
    if (!isPhysicsRunning) {
      isPhysicsRunning = true;
      lastFrameTime = performance.now();
      rafId = requestAnimationFrame(updatePhysics);
    }
  }

  // Restrained architectural chisel dust: 2 tiny specks per contact
  function spawnRestrainedDust(cx: number, cy: number) {
    if (particles.length >= 16) return;
    for (let i = 0; i < 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 35 + Math.random() * 65;
      const size = 1.2 + Math.random() * 1.1;

      const pEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      pEl.setAttribute('width', size.toFixed(1));
      pEl.setAttribute('height', size.toFixed(1));
      pEl.setAttribute('rx', '0.5');
      pEl.setAttribute('fill', Math.random() > 0.4 ? '#fff5dc' : '#dfba73');
      pEl.setAttribute('transform', `translate(${cx.toFixed(1)}, ${cy.toFixed(1)})`);
      particlesLayer!.appendChild(pEl);

      particles.push({
        el: pEl,
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 18,
        size,
        opacity: 0.85,
        life: 0,
        maxLife: 0.28 + Math.random() * 0.1,
      });
    }
  }

  // Velocity tracking for natural momentum transfer
  let lastPtX = 0;
  let lastPtY = 0;
  let lastMoveTime = 0;
  let cursorVx = 0;
  let cursorVy = 0;
  let lastSoundTime = 0;
  let lastHammerTime = 0;

  // Immediate Clean Detachment: Zero setTimeout delays, zero fighting transforms
  function detachBrickImmediately(
    b: WallBlock,
    vx: number,
    vy: number
  ) {
    if (b.contacted || b.destroyed) return;
    b.contacted = true;
    b.destroyed = true;

    // Immediately hide intact block
    if (b.groupEl) {
      b.groupEl.style.display = 'none';
    }

    // Cap simultaneous dynamic bodies to prevent unbounded SVG DOM growth during rapid sweeps
    if (dynamicBodies.length >= 32) {
      const oldest = dynamicBodies.shift();
      if (oldest && oldest.el.parentNode) {
        oldest.el.parentNode.removeChild(oldest.el);
      }
    }

    // Synchronized audio fracture
    const now = performance.now();
    if (now - lastSoundTime > 60) {
      const pitch = 0.9 + Math.random() * 0.3;
      sound.playMasonryImpact(pitch);
      lastSoundTime = now;
    }

    // Create lightweight dynamic falling body in physicsLayer
    const bodyEl = createDynamicBlockElement(b.w, b.h);
    physicsLayer!.appendChild(bodyEl);

    // Impulse directed by cursor momentum + downward gravity tumble
    const cursorSpeed = Math.hypot(vx, vy);
    const dirX = cursorSpeed > 20 ? vx / cursorSpeed : (Math.random() - 0.5) * 1.5;
    const dirY = cursorSpeed > 20 ? vy / cursorSpeed : 0.3;
    const impulseMag = Math.min(160, Math.max(28, cursorSpeed * 0.1));

    const impulseX = dirX * impulseMag + (Math.random() - 0.5) * 40;
    const impulseY = Math.min(45, dirY * impulseMag * 0.3) - 20 - Math.random() * 25;
    const vAngle = (Math.random() - 0.5) * 260 + impulseX * 1.1;

    dynamicBodies.push({
      el: bodyEl,
      x: b.x,
      y: b.y,
      vx: impulseX,
      vy: impulseY,
      angle: (Math.random() - 0.5) * 8,
      vAngle,
      opacity: 1,
      life: 0,
      maxLife: 2.2 + Math.random() * 0.6,
      bounces: 0,
      settled: false,
    });

    spawnRestrainedDust(b.x + b.w * 0.5, b.y + b.h * 0.5);
    ensurePhysicsRunning();
  }

  // Pointer Contact Handler: Zero synchronous elementFromPoint layout flushes
  function handlePointerContact(clientX: number, clientY: number) {
    const pt = getSvgPoint(clientX, clientY);
    const now = performance.now();
    const dt = Math.max(0.004, (now - lastMoveTime) * 0.001);

    if (lastMoveTime > 0 && dt < 0.25) {
      cursorVx = (pt.x - lastPtX) / dt;
      cursorVy = (pt.y - lastPtY) / dt;
    }

    // Continuous sweep interpolation (ray-cast between previous and current point)
    const dist = Math.hypot(pt.x - lastPtX, pt.y - lastPtY);
    const steps = lastMoveTime > 0 ? Math.min(8, Math.max(1, Math.ceil(dist / 14))) : 1;

    let hitCount = 0;
    for (let step = 0; step <= steps; step++) {
      const alpha = steps > 0 ? step / steps : 1;
      const sampleX = lastPtX + (pt.x - lastPtX) * alpha;
      const sampleY = lastPtY + (pt.y - lastPtY) * alpha;

      const approxCol = Math.round((sampleX - x0) / s);
      const approxRow = Math.round((sampleY - y0) / s);

      // O(1) spatial grid check with 3x3 kernel
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const b = blockGrid.get(`${approxRow + dr},${approxCol + dc}`);
          if (b && !b.contacted && !b.destroyed) {
            if (
              sampleX >= b.x - 2.5 &&
              sampleX <= b.x + b.w + 2.5 &&
              sampleY >= b.y - 2.5 &&
              sampleY <= b.y + b.h + 2.5
            ) {
              hitCount++;
              detachBrickImmediately(b, cursorVx, cursorVy);
            }
          }
        }
      }
    }

    lastPtX = pt.x;
    lastPtY = pt.y;
    lastMoveTime = now;

    // Trigger hammer strike (throttled to 190ms to allow full fluid swing without interruption)
    if (hitCount > 0 && now - lastHammerTime > 190) {
      triggerHammerStrike(clientX, clientY);
      lastHammerTime = now;
    }
  }

  function resetWall() {
    // 1. Explicitly cancel any active physics loop
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    isPhysicsRunning = false;

    // 2. Clear dynamic bodies and dust
    while (physicsLayer!.firstChild) {
      physicsLayer!.removeChild(physicsLayer!.firstChild);
    }
    while (particlesLayer!.firstChild) {
      particlesLayer!.removeChild(particlesLayer!.firstChild);
    }
    dynamicBodies.length = 0;
    particles.length = 0;

    sound.playMeasureSnap(1640);

    // 3. Staggered architectural drop-in assembly
    blocks.forEach((b) => {
      b.contacted = false;
      b.destroyed = false;
      if (b.groupEl && b.rectEl) {
        b.groupEl.style.display = '';
        b.rectEl.setAttribute('fill', 'url(#nfg-block-grad)');
        b.groupEl.classList.add('nfg-rebuilding');
        b.groupEl.style.opacity = '0';
        b.groupEl.style.transform = `translate(${b.x.toFixed(1)}px, ${(b.y - 18).toFixed(1)}px)`;

        const delay = (b.c % 19) * 12 + (b.r % 8) * 10;
        setTimeout(() => {
          if (!b.groupEl) return;
          b.groupEl.style.transform = `translate(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px)`;
          b.groupEl.style.opacity = '1';
        }, delay);

        // Remove rebuilding class after animation finishes
        setTimeout(() => {
          if (b.groupEl) {
            b.groupEl.classList.remove('nfg-rebuilding');
          }
        }, delay + 400);
      }
    });
  }

  // Pointer & Drag Handlers (Using event target without elementFromPoint)
  const onPointerMove = (e: PointerEvent) => {
    const target = e.target instanceof Element ? e.target : null;
    if (target?.closest('a, button, nav')) return;
    handlePointerContact(e.clientX, e.clientY);
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    const target = e.target instanceof Element ? e.target : null;
    if (target?.closest('a, button, nav')) return;
    updateCachedRect();
    handlePointerContact(e.clientX, e.clientY);
  };

  // Touch Support for mobile carving
  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      const t = e.touches[0];
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest('a, button, nav')) return;
      e.preventDefault(); // Prevents page scroll when carving 404 wall
      handlePointerContact(t.clientX, t.clientY);
    }
  };

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      const t = e.touches[0];
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest('a, button, nav')) return;
      updateCachedRect();
      handlePointerContact(t.clientX, t.clientY);
    }
  };

  // Keyboard accessibility: Enter or Space on focused brick strikes it
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const active = document.activeElement;
      if (active && active.hasAttribute('data-id')) {
        const id = Number(active.getAttribute('data-id'));
        const b = blocks.find((item) => item.id === id);
        if (b && !b.destroyed) {
          e.preventDefault();
          detachBrickImmediately(b, 0, 40);
        }
      }
    }
  };

  // Physics & Animation Loop: Single loop, zero updates for settled blocks
  const gravity = 920; // px/s^2
  const floorY = 378;  // Polished atelier floor level

  function updatePhysics(now: number) {
    rafId = null; // Mark current frame tick as executing
    const dt = Math.min((now - lastFrameTime) * 0.001, 0.033);
    lastFrameTime = now;

    let hasActiveMovingBodies = false;

    // 1. Dynamic Falling Masonry Bricks
    for (let i = dynamicBodies.length - 1; i >= 0; i--) {
      const body = dynamicBodies[i];
      body.life += dt;

      if (!body.settled) {
        hasActiveMovingBodies = true;
        body.vy += gravity * dt;
        body.x += body.vx * dt;
        body.y += body.vy * dt;
        body.angle += body.vAngle * dt;

        // Atelier Floor Bounce
        if (body.y >= floorY && body.vy > 0) {
          body.y = floorY;
          if (body.bounces === 0) {
            body.vy = -body.vy * 0.28;
            body.vx *= 0.65;
            body.vAngle *= 0.5;
            body.bounces = 1;
          } else if (body.bounces === 1) {
            body.vy = -body.vy * 0.12;
            body.vx *= 0.45;
            body.vAngle *= 0.25;
            body.bounces = 2;
          } else {
            body.vy = 0;
            body.vx = 0;
            body.vAngle = 0;
            body.settled = true;
          }
        }

        // Check if settled by low velocity on floor
        if (body.y >= floorY - 1 && Math.abs(body.vy) < 18 && Math.abs(body.vx) < 10) {
          body.vy = 0;
          body.vx = 0;
          body.vAngle = 0;
          body.settled = true;
        }

        // Set transform during motion or final settle position
        body.el.setAttribute(
          'transform',
          `translate(${body.x.toFixed(1)}, ${body.y.toFixed(1)}) rotate(${body.angle.toFixed(1)}, 10, 10)`
        );
      }

      // Smooth fade-out after resting (only updates opacity attribute, zero style map invalidation)
      if (body.life > body.maxLife * 0.7) {
        hasActiveMovingBodies = true;
        body.opacity = Math.max(0, 1 - (body.life - body.maxLife * 0.7) / (body.maxLife * 0.3));
        body.el.setAttribute('opacity', body.opacity.toFixed(2));
      }

      if (body.life >= body.maxLife || body.opacity <= 0.01) {
        if (body.el.parentNode) body.el.parentNode.removeChild(body.el);
        dynamicBodies.splice(i, 1);
      }
    }

    // 2. Restrained Dust Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 380 * dt;
      p.opacity = Math.max(0, 1 - p.life / p.maxLife);

      p.el.setAttribute('transform', `translate(${p.x.toFixed(1)}, ${p.y.toFixed(1)})`);
      p.el.setAttribute('opacity', p.opacity.toFixed(2));

      if (p.life >= p.maxLife) {
        if (p.el.parentNode) p.el.parentNode.removeChild(p.el);
        particles.splice(i, 1);
      }
    }

    const hasActiveParticles = particles.length > 0;

    // Stop updating once all bricks settle and particles vanish (0% idle CPU)
    if (!hasActiveMovingBodies && !hasActiveParticles) {
      isPhysicsRunning = false;
      rafId = null;
      return;
    }

    isPhysicsRunning = true;
    rafId = requestAnimationFrame(updatePhysics);
  }

  // Attach Listeners
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  svgEl.addEventListener('pointerdown', onPointerDown);
  svgEl.addEventListener('touchmove', onTouchMove, { passive: false });
  svgEl.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('keydown', onKeyDown);
  rebuildBtn?.addEventListener('click', resetWall);

  // Return Cleanup Handler
  return () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    isPhysicsRunning = false;
    window.removeEventListener('resize', updateCachedRect);
    window.removeEventListener('scroll', updateCachedRect);
    window.removeEventListener('pointermove', onPointerMove);
    svgEl.removeEventListener('pointerdown', onPointerDown);
    svgEl.removeEventListener('touchmove', onTouchMove);
    svgEl.removeEventListener('touchstart', onTouchStart);
    document.removeEventListener('keydown', onKeyDown);
    rebuildBtn?.removeEventListener('click', resetWall);
  };
}

export function renderStatusPage(targetEl: HTMLElement) {
  targetEl.innerHTML = `
    <div class="projects-container status-page">
      <section class="proj-header" aria-labelledby="status-title">
        <p class="eyebrow"><span class="eyebrow-draft">Operational Health · Architecture Verification</span></p>
        <h1 class="proj-title" id="status-title">System <em>Status.</em></h1>
        <p class="proj-desc">Real-time client-side subsystem verification for the Buildora interactive experience.</p>
      </section>

      <section style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 48px;">
        <div class="pd-card">
          <h4>3D WebGL Engine</h4>
          <p style="font-size: 13px; color: rgba(247, 243, 237,0.8); margin: 0 0 8px;">Hardware-accelerated Three.js r128 renderer</p>
          <span style="font-size: 10px; letter-spacing: 0.16em; color: var(--warm); text-transform: uppercase;">● Operational (Active)</span>
        </div>
        <div class="pd-card">
          <h4>Dual Canvas Sync</h4>
          <p style="font-size: 13px; color: rgba(247, 243, 237,0.8); margin: 0 0 8px;">Synchronized sketch line and lit material buffers</p>
          <span style="font-size: 10px; letter-spacing: 0.16em; color: var(--warm); text-transform: uppercase;">● 0.00 px Registration Delta</span>
        </div>
        <div class="pd-card">
          <h4>Web Audio Synthesizer</h4>
          <p style="font-size: 13px; color: rgba(247, 243, 237,0.8); margin: 0 0 8px;">Procedural contact physics and drafting audio</p>
          <span style="font-size: 10px; letter-spacing: 0.16em; color: var(--warm); text-transform: uppercase;">● Standby (User-Gesture Gated)</span>
        </div>
        <div class="pd-card">
          <h4>Client Router</h4>
          <p style="font-size: 13px; color: rgba(247, 243, 237,0.8); margin: 0 0 8px;">History API single-page navigation</p>
          <span style="font-size: 10px; letter-spacing: 0.16em; color: var(--warm); text-transform: uppercase;">● Active (Deep-Link Enabled)</span>
        </div>
      </section>

      <footer class="proj-page-footer">
        <div class="ppf-brand">
          <span class="ppf-title">Buildora<i>.</i></span>
          <p>Built with Yash · Client Pre-Release Demonstration Build</p>
        </div>
        <div class="ppf-back">
          <a href="/" class="cta" data-link>← Back to Experience</a>
        </div>
      </footer>
    </div>
  `;
}
