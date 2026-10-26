import { PROJECTS, type ProjectItem } from '../data/content';
import { triggerWordAnimation, activateContinuousTypography } from '../utils';
import { sound } from '../audio';
import { triggerHammerStrike } from '../cursor';
import { navigateTo } from '../router';
import {
  animatePortfolioHeading,
  setupProjectCardTitleKinetic,
  setupCaseStudyHeadings,
  initTypographyEngine,
} from '../typography';

/** Generate high-detail, authentic, procedurally distinct architectural SVG visuals for each project card */
function renderProjectSvg(p: ProjectItem, idx: number): string {
  if (idx === 0) {
    // 01 · The Nordic Pavilion (Orthographic Floor Plan + Interior Spatial Layout + Solar Ray)
    return `
      <svg viewBox="0 0 720 460" class="card-art-svg" aria-hidden="true" role="img">
        <defs>
          <linearGradient id="solar-nordic-beam" x1="0%" y1="0%" x2="100%" y2="85%">
            <stop offset="0%" stop-color="#dfba73" stop-opacity="0.38"/>
            <stop offset="55%" stop-color="#dfba73" stop-opacity="0.14"/>
            <stop offset="100%" stop-color="#dfba73" stop-opacity="0.0"/>
          </linearGradient>
          <pattern id="oak-planks-pat" width="16" height="12" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="16" y2="0" stroke="rgba(223,186,115,0.18)" stroke-width="1" />
            <line x1="0" y1="6" x2="16" y2="6" stroke="rgba(223,186,115,0.10)" stroke-width="0.8" />
            <line x1="8" y1="0" x2="8" y2="6" stroke="rgba(223,186,115,0.14)" stroke-width="0.8" />
            <line x1="0" y1="6" x2="0" y2="12" stroke="rgba(223,186,115,0.14)" stroke-width="0.8" />
          </pattern>
          <pattern id="terrace-deck-pat" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(247, 243, 237,0.12)" stroke-width="1.2" />
          </pattern>
        </defs>

        <rect x="0" y="0" width="720" height="460" fill="#181512" />
        <g stroke="rgba(223,186,115,0.06)" stroke-width="1">
          <line x1="60" y1="0" x2="60" y2="460" /><line x1="180" y1="0" x2="180" y2="460" />
          <line x1="300" y1="0" x2="300" y2="460" /><line x1="420" y1="0" x2="420" y2="460" />
          <line x1="540" y1="0" x2="540" y2="460" /><line x1="660" y1="0" x2="660" y2="460" />
          <line x1="0" y1="70" x2="720" y2="70" /><line x1="0" y1="170" x2="720" y2="170" />
          <line x1="0" y1="270" x2="720" y2="270" /><line x1="0" y1="370" x2="720" y2="370" />
        </g>

        <!-- Archipelago Coastal Granite Bedrock Contours -->
        <path d="M 0 50 Q 140 30 220 85 T 440 40 Q 560 30 720 60" fill="none" stroke="rgba(247, 243, 237,0.10)" stroke-width="1.2" stroke-dasharray="4 4" />
        <path d="M 0 95 Q 160 70 260 115 T 480 75 Q 600 65 720 90" fill="none" stroke="rgba(247, 243, 237,0.07)" stroke-width="1.0" stroke-dasharray="6 6" />

        <!-- Exterior Timber Terrace Decking -->
        <polygon points="60,110 580,110 580,400 390,400 390,260 60,260" fill="url(#terrace-deck-pat)" stroke="rgba(223,186,115,0.25)" stroke-width="1.2" />

        <!-- Solar Vector Beam (14:30 Arc · Azimuth 194°) -->
        <polygon points="90,70 230,70 460,390 200,390" fill="url(#solar-nordic-beam)" />
        <line x1="90" y1="70" x2="200" y2="390" stroke="#dfba73" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.85" />
        <line x1="230" y1="70" x2="460" y2="390" stroke="#dfba73" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.85" />
        <circle cx="90" cy="70" r="14" fill="none" stroke="#dfba73" stroke-width="1.4" />
        <circle cx="90" cy="70" r="3.5" fill="#dfba73" />
        <text x="114" y="74" fill="#dfba73" font-family="Manrope, sans-serif" font-size="10.5" letter-spacing="0.18em">SOLAR VECTOR 14:30 · AZIMUTH 194°</text>

        <!-- Primary Enclosure Boundary & Quarter-Sawn Oak Living Bay -->
        <rect x="80" y="130" width="490" height="250" fill="url(#oak-planks-pat)" stroke="#f7f3ed" stroke-width="2.2" />

        <!-- Wrap-Around Corner Triple Low-E Glazing -->
        <rect x="80" y="130" width="180" height="14" fill="rgba(223,186,115,0.35)" stroke="#dfba73" stroke-width="2.2" />
        <rect x="80" y="130" width="14" height="120" fill="rgba(223,186,115,0.35)" stroke="#dfba73" stroke-width="2.2" />
        <rect x="76" y="126" width="18" height="18" fill="#100e0c" stroke="#dfba73" stroke-width="1.8" />
        <text x="185" y="122" fill="#dfba73" font-family="Manrope, sans-serif" font-size="10" letter-spacing="0.16em">CORNER GLAZING 2.40 × 1.70 M</text>

        <!-- Modular Low-Profile Bouclé Sofa Configuration -->
        <g stroke="#f7f3ed" stroke-width="1.6" fill="rgba(247, 243, 237,0.14)">
          <rect x="220" y="230" width="160" height="90" rx="8" />
          <rect x="232" y="240" width="136" height="26" rx="4" fill="none" stroke="#dfba73" stroke-width="1.2" />
          <rect x="232" y="272" width="64" height="38" rx="4" fill="none" stroke="rgba(247, 243, 237,0.5)" stroke-width="1" />
          <rect x="304" y="272" width="64" height="38" rx="4" fill="none" stroke="rgba(247, 243, 237,0.5)" stroke-width="1" />
        </g>
        <text x="300" y="340" text-anchor="middle" fill="rgba(247, 243, 237,0.75)" font-family="Manrope, sans-serif" font-size="9.5" letter-spacing="0.16em">MODULAR BOUCLÉ SOFA</text>

        <!-- Turned Solid Oak Coffee Table -->
        <circle cx="440" cy="265" r="30" fill="rgba(223,186,115,0.12)" stroke="#dfba73" stroke-width="1.6" />
        <circle cx="440" cy="265" r="18" fill="none" stroke="rgba(223,186,115,0.6)" stroke-width="1.0" />
        <circle cx="440" cy="265" r="4" fill="#dfba73" />

        <!-- Hearth Plinth -->
        <rect x="495" y="145" width="46" height="46" rx="4" fill="#12100e" stroke="#f7f3ed" stroke-width="1.6" />
        <circle cx="518" cy="168" r="12" fill="none" stroke="#dfba73" stroke-width="1.4" />
        <circle cx="518" cy="168" r="4" fill="#dfba73" />
        <text x="518" y="205" text-anchor="middle" fill="#f7f3ed" font-family="Manrope, sans-serif" font-size="9" letter-spacing="0.14em">HEARTH</text>

        <!-- Dimension Strings -->
        <path d="M 80 410 L 570 410 M 80 402 L 80 418 M 570 402 L 570 418" stroke="#dfba73" stroke-width="1.3" />
        <text x="325" y="428" text-anchor="middle" fill="#dfba73" font-family="Manrope, sans-serif" font-size="10.5" letter-spacing="0.2em">8.40 M LIVING BAY CLEARANCE</text>

        <path d="M 598 130 L 598 380 M 590 130 L 606 130 M 590 380 L 606 380" stroke="#f7f3ed" stroke-width="1.3" />
        <text x="620" y="260" text-anchor="middle" fill="#f7f3ed" font-family="Manrope, sans-serif" font-size="10" letter-spacing="0.2em" transform="rotate(90 620 260)">6.20 M DEPTH</text>

        <!-- Compass Rose -->
        <g transform="translate(660, 80)">
          <circle cx="0" cy="0" r="18" fill="none" stroke="rgba(247, 243, 237,0.3)" stroke-width="1" />
          <polygon points="0,-16 4,0 -4,0" fill="#dfba73" />
          <polygon points="0,16 4,0 -4,0" fill="rgba(247, 243, 237,0.4)" />
          <text x="0" y="-21" text-anchor="middle" fill="#dfba73" font-family="Manrope, sans-serif" font-size="9" font-weight="700">N</text>
        </g>

        <!-- Title Block -->
        <rect x="420" y="325" width="140" height="42" rx="3" fill="rgba(18,16,14,0.92)" stroke="rgba(223,186,115,0.4)" stroke-width="1" />
        <text x="430" y="342" fill="#dfba73" font-family="Manrope, sans-serif" font-size="9" letter-spacing="0.16em" font-weight="600">PLAN VIEW · 1:50</text>
        <text x="430" y="356" fill="rgba(247, 243, 237,0.7)" font-family="Manrope, sans-serif" font-size="8.5" letter-spacing="0.12em">25°35'N 85°08'E</text>
      </svg>
    `;
  }

  if (idx === 1) {
    // 02 · The Smoked Atelier (Transverse Section Cut + Acoustic Diffusers + Sound Decay)
    return `
      <svg viewBox="0 0 720 460" class="card-art-svg" aria-hidden="true" role="img">
        <defs>
          <linearGradient id="golden-hour-beam" x1="0%" y1="0%" x2="100%" y2="40%">
            <stop offset="0%" stop-color="#d89658" stop-opacity="0.45"/>
            <stop offset="50%" stop-color="#d89658" stop-opacity="0.16"/>
            <stop offset="100%" stop-color="#d89658" stop-opacity="0.0"/>
          </linearGradient>
          <linearGradient id="downlight-cone" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#f6d5a8" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#f6d5a8" stop-opacity="0.0"/>
          </linearGradient>
          <pattern id="concrete-cut-hatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(216,150,88,0.22)" stroke-width="1.1" />
          </pattern>
        </defs>

        <rect x="0" y="0" width="720" height="460" fill="#14110e" />
        <g stroke="rgba(216,150,88,0.06)" stroke-width="1">
          <line x1="70" y1="0" x2="70" y2="460" /><line x1="190" y1="0" x2="190" y2="460" />
          <line x1="310" y1="0" x2="310" y2="460" /><line x1="430" y1="0" x2="430" y2="460" />
          <line x1="550" y1="0" x2="550" y2="460" /><line x1="670" y1="0" x2="670" y2="460" />
          <line x1="0" y1="80" x2="720" y2="80" /><line x1="0" y1="180" x2="720" y2="180" />
          <line x1="0" y1="280" x2="720" y2="280" /><line x1="0" y1="380" x2="720" y2="380" />
        </g>

        <!-- Ground Slab Cut -->
        <rect x="50" y="370" width="620" height="35" fill="url(#concrete-cut-hatch)" stroke="#ece6db" stroke-width="1.8" />
        <line x1="50" y1="370" x2="670" y2="370" stroke="#d89658" stroke-width="2.5" />
        <text x="70" y="394" fill="rgba(236,230,219,0.5)" font-family="Manrope, sans-serif" font-size="9" letter-spacing="0.14em">FLOATING ACOUSTIC SCREED</text>

        <!-- Ceiling Soffit -->
        <rect x="50" y="80" width="620" height="30" fill="url(#concrete-cut-hatch)" stroke="#ece6db" stroke-width="1.8" />
        <line x1="50" y1="110" x2="670" y2="110" stroke="#ece6db" stroke-width="2.0" />

        <!-- Wall Cuts -->
        <rect x="50" y="80" width="40" height="325" fill="#1b1612" stroke="#ece6db" stroke-width="2.0" />
        <rect x="630" y="80" width="40" height="325" fill="#1b1612" stroke="#ece6db" stroke-width="2.0" />

        <!-- Suspended Acoustic Baffle Clouds -->
        <g stroke="#d89658" stroke-width="1.4">
          <line x1="160" y1="110" x2="160" y2="135" stroke="rgba(236,230,219,0.4)" stroke-dasharray="2 2" />
          <line x1="240" y1="110" x2="240" y2="132" stroke="rgba(236,230,219,0.4)" stroke-dasharray="2 2" />
          <line x1="320" y1="110" x2="320" y2="135" stroke="rgba(236,230,219,0.4)" stroke-dasharray="2 2" />
          <line x1="400" y1="110" x2="400" y2="132" stroke="rgba(236,230,219,0.4)" stroke-dasharray="2 2" />
          <line x1="480" y1="110" x2="480" y2="135" stroke="rgba(236,230,219,0.4)" stroke-dasharray="2 2" />
          <line x1="560" y1="110" x2="560" y2="132" stroke="rgba(236,230,219,0.4)" stroke-dasharray="2 2" />
          <rect x="130" y="135" width="70" height="12" rx="2" fill="#2a1f17" transform="rotate(-3 165 141)" />
          <rect x="210" y="132" width="70" height="12" rx="2" fill="#2a1f17" transform="rotate(2 245 138)" />
          <rect x="290" y="135" width="70" height="12" rx="2" fill="#2a1f17" transform="rotate(-3 325 141)" />
          <rect x="370" y="132" width="70" height="12" rx="2" fill="#2a1f17" transform="rotate(2 405 138)" />
          <rect x="450" y="135" width="70" height="12" rx="2" fill="#2a1f17" transform="rotate(-3 485 141)" />
          <rect x="530" y="132" width="70" height="12" rx="2" fill="#2a1f17" transform="rotate(2 565 138)" />
        </g>
        <text x="360" y="165" text-anchor="middle" fill="#d89658" font-family="Manrope, sans-serif" font-size="9.5" letter-spacing="0.18em">SUSPENDED ACOUSTIC BAFFLE CLOUDS</text>

        <!-- Right Wall: Staggered Micro-Perforated Smoked Walnut Diffusers -->
        <g fill="#241a13" stroke="#d89658" stroke-width="1.2">
          <rect x="575" y="180" width="12" height="190" />
          <rect x="589" y="180" width="16" height="190" fill="#35261c" />
          <rect x="607" y="180" width="10" height="190" />
          <rect x="619" y="180" width="18" height="190" fill="#35261c" />
        </g>
        <text x="600" y="172" text-anchor="middle" fill="#d89658" font-family="Manrope, sans-serif" font-size="9" letter-spacing="0.14em">DIFFUSERS</text>

        <!-- Left Wall Window & Golden Hour Wedge -->
        <rect x="80" y="175" width="14" height="145" fill="rgba(216,150,88,0.4)" stroke="#d89658" stroke-width="2.2" />
        <polygon points="94,185 94,305 480,370 320,370" fill="url(#golden-hour-beam)" />
        <line x1="94" y1="185" x2="480" y2="370" stroke="#d89658" stroke-width="1.4" stroke-dasharray="6 4" />
        <line x1="94" y1="305" x2="320" y2="370" stroke="#d89658" stroke-width="1.4" stroke-dasharray="6 4" />
        <text x="110" y="168" fill="#d89658" font-family="Manrope, sans-serif" font-size="10" letter-spacing="0.18em">RAKING GOLDEN HOUR 17:45 · 18°</text>

        <!-- Monolithic Honed Basalt Plinth -->
        <rect x="230" y="275" width="260" height="95" rx="3" fill="#1b1816" stroke="#ece6db" stroke-width="2" />
        <rect x="215" y="275" width="290" height="18" rx="2" fill="#2d2722" stroke="#d89658" stroke-width="1.6" />
        <text x="360" y="315" text-anchor="middle" fill="#ece6db" font-family="Manrope, sans-serif" font-size="10.5" letter-spacing="0.16em">HONED SWISS BASALT PLINTH</text>
        <text x="360" y="332" text-anchor="middle" fill="rgba(236,230,219,0.6)" font-family="Manrope, sans-serif" font-size="9" letter-spacing="0.14em">120 MM CANTILEVERED WORKPLANE</text>

        <!-- Suspended Brass Luminaire -->
        <line x1="360" y1="110" x2="360" y2="215" stroke="#d89658" stroke-width="1.5" />
        <line x1="280" y1="215" x2="440" y2="215" stroke="#f6d5a8" stroke-width="2.8" stroke-linecap="round" />
        <polygon points="280,215 440,215 500,275 220,275" fill="url(#downlight-cone)" />

        <!-- Acoustic Reverb Waveform -->
        <path d="M 120 220 Q 180 195 240 220 T 360 220 T 480 220 T 600 220" fill="none" stroke="rgba(216,150,88,0.35)" stroke-width="1.2" stroke-dasharray="3 3" />
        <path d="M 120 220 Q 200 170 300 215 T 480 220 T 600 220" fill="none" stroke="rgba(216,150,88,0.5)" stroke-width="1.4" />
        <text x="470" y="240" fill="#d89658" font-family="Manrope, sans-serif" font-size="9" letter-spacing="0.14em">RT60 = 0.32S CONTROLLED DECAY</text>

        <!-- Dimension Strings -->
        <path d="M 680 110 L 680 370 M 672 110 L 688 110 M 672 370 L 688 370" stroke="#d89658" stroke-width="1.3" />
        <text x="702" y="240" text-anchor="middle" fill="#d89658" font-family="Manrope, sans-serif" font-size="10" letter-spacing="0.18em" transform="rotate(90 702 240)">3.40 M CLEARANCE</text>

        <path d="M 90 425 L 630 425 M 90 417 L 90 433 M 630 417 L 630 433" stroke="#ece6db" stroke-width="1.3" />
        <text x="360" y="442" text-anchor="middle" fill="#ece6db" font-family="Manrope, sans-serif" font-size="10.5" letter-spacing="0.2em">7.80 M INTERNAL CLEAR SPAN</text>

        <!-- Title Block -->
        <rect x="100" y="325" width="120" height="38" rx="3" fill="rgba(18,14,11,0.92)" stroke="rgba(216,150,88,0.4)" stroke-width="1" />
        <text x="110" y="340" fill="#d89658" font-family="Manrope, sans-serif" font-size="9" letter-spacing="0.14em" font-weight="600">SECTION A-A · 1:25</text>
        <text x="110" y="353" fill="rgba(236,230,219,0.7)" font-family="Manrope, sans-serif" font-size="8.5" letter-spacing="0.12em">ZURICH ENGE · 42 dB NC</text>
      </svg>
    `;
  }

  // 03 · The Monolithic Cloister (True 3D Isometric / Axonometric Architectural Projection)
  return `
    <svg viewBox="0 0 720 460" class="card-art-svg" aria-hidden="true" role="img">
      <defs>
        <linearGradient id="concrete-shadow-iso" x1="0%" y1="0%" x2="60%" y2="80%">
          <stop offset="0%" stop-color="#cbd5e1" stop-opacity="0.32"/>
          <stop offset="60%" stop-color="#cbd5e1" stop-opacity="0.10"/>
          <stop offset="100%" stop-color="#cbd5e1" stop-opacity="0.0"/>
        </linearGradient>
        <pattern id="iso-floor-grid" width="24" height="14" patternUnits="userSpaceOnUse">
          <line x1="0" y1="7" x2="12" y2="0" stroke="rgba(203,213,225,0.12)" stroke-width="1" />
          <line x1="12" y1="0" x2="24" y2="7" stroke="rgba(203,213,225,0.12)" stroke-width="1" />
          <line x1="24" y1="7" x2="12" y2="14" stroke="rgba(203,213,225,0.12)" stroke-width="1" />
          <line x1="12" y1="14" x2="0" y2="7" stroke="rgba(203,213,225,0.12)" stroke-width="1" />
        </pattern>
      </defs>

      <rect x="0" y="0" width="720" height="460" fill="#121417" />
      <g stroke="rgba(203,213,225,0.06)" stroke-width="1">
        <line x1="0" y1="100" x2="720" y2="400" /><line x1="0" y1="20" x2="720" y2="320" />
        <line x1="0" y1="180" x2="720" y2="480" />
        <line x1="720" y1="100" x2="0" y2="400" /><line x1="720" y1="20" x2="0" y2="320" />
        <line x1="720" y1="180" x2="0" y2="480" />
        <line x1="180" y1="0" x2="180" y2="460" /><line x1="360" y1="0" x2="360" y2="460" /><line x1="540" y1="0" x2="540" y2="460" />
      </g>

      <!-- Isometric Floor -->
      <polygon points="360,180 630,270 360,390 90,270" fill="url(#iso-floor-grid)" stroke="rgba(203,213,225,0.3)" stroke-width="1.4" />

      <!-- High Raking Morning Sun Shadows -->
      <polygon points="360,180 540,240 450,350 240,290" fill="url(#concrete-shadow-iso)" />
      <line x1="360" y1="180" x2="450" y2="350" stroke="#cbd5e1" stroke-width="1.4" stroke-dasharray="5 4" opacity="0.8" />
      <text x="390" y="225" fill="#cbd5e1" font-family="Manrope, sans-serif" font-size="9.5" letter-spacing="0.18em">RAKING MORNING SUN · 11:30</text>

      <!-- Concrete Back Wall -->
      <polygon points="90,130 360,40 360,180 90,270" fill="#181b20" stroke="#ece6db" stroke-width="1.8" />
      <line x1="90" y1="165" x2="360" y2="75" stroke="rgba(203,213,225,0.18)" stroke-width="1" />
      <line x1="90" y1="200" x2="360" y2="110" stroke="rgba(203,213,225,0.18)" stroke-width="1" />
      <line x1="90" y1="235" x2="360" y2="145" stroke="rgba(203,213,225,0.18)" stroke-width="1" />
      <circle cx="180" cy="180" r="2.5" fill="#0d0e10" stroke="rgba(203,213,225,0.4)" stroke-width="0.8" />
      <circle cx="270" cy="150" r="2.5" fill="#0d0e10" stroke="rgba(203,213,225,0.4)" stroke-width="0.8" />

      <!-- Concrete Right Wall -->
      <polygon points="360,40 630,130 630,270 360,180" fill="#20242b" stroke="#ece6db" stroke-width="1.8" />
      <line x1="360" y1="75" x2="630" y2="165" stroke="rgba(203,213,225,0.18)" stroke-width="1" />
      <line x1="360" y1="110" x2="630" y2="200" stroke="rgba(203,213,225,0.18)" stroke-width="1" />
      <line x1="360" y1="145" x2="630" y2="235" stroke="rgba(203,213,225,0.18)" stroke-width="1" />
      <circle cx="450" cy="150" r="2.5" fill="#0d0e10" stroke="rgba(203,213,225,0.4)" stroke-width="0.8" />
      <circle cx="540" cy="180" r="2.5" fill="#0d0e10" stroke="rgba(203,213,225,0.4)" stroke-width="0.8" />

      <!-- 360° Continuous Clerestory Glass Ribbon Slot -->
      <polygon points="90,122 360,32 630,122 630,130 360,40 90,130" fill="rgba(203,213,225,0.4)" stroke="#cbd5e1" stroke-width="1.6" />
      <text x="360" y="24" text-anchor="middle" fill="#cbd5e1" font-family="Manrope, sans-serif" font-size="10" letter-spacing="0.18em">CONTINUOUS CLERESTORY RIBBON APERTURE</text>

      <!-- Concrete Roof Canopy in 3D -->
      <polygon points="360,6 648,102 648,118 360,22 72,118 72,102" fill="#272d36" stroke="#ece6db" stroke-width="2.2" />
      <polygon points="360,6 648,102 360,198 72,102" fill="#323a45" stroke="#ece6db" stroke-width="1.8" opacity="0.4" />

      <!-- Travertine Monolith (Floating Altar) -->
      <polygon points="360,296 460,328 360,360 260,328" fill="#0a0c0e" opacity="0.8" />
      <polygon points="260,305 360,337 360,355 260,323" fill="#cbd5e1" stroke="#ece6db" stroke-width="1.4" opacity="0.75" />
      <polygon points="360,337 460,305 460,323 360,355" fill="#94a3b8" stroke="#ece6db" stroke-width="1.4" />
      <polygon points="360,287 460,305 360,337 260,305" fill="#f1f5f9" stroke="#ece6db" stroke-width="1.8" />
      <text x="360" y="375" text-anchor="middle" fill="#ece6db" font-family="Manrope, sans-serif" font-size="10" letter-spacing="0.16em">SILVER NAVONA TRAVERTINE MONOLITH</text>

      <!-- Isometric Axes -->
      <g transform="translate(110, 360)">
        <line x1="0" y1="0" x2="36" y2="12" stroke="#cbd5e1" stroke-width="1.6" />
        <line x1="0" y1="0" x2="-36" y2="12" stroke="#cbd5e1" stroke-width="1.6" />
        <line x1="0" y1="0" x2="0" y2="-36" stroke="#cbd5e1" stroke-width="1.6" />
        <text x="42" y="16" fill="#cbd5e1" font-family="Manrope, sans-serif" font-size="9" font-weight="700">X (12.0M)</text>
        <text x="-78" y="16" fill="#cbd5e1" font-family="Manrope, sans-serif" font-size="9" font-weight="700">Y (7.5M)</text>
        <text x="0" y="-42" text-anchor="middle" fill="#cbd5e1" font-family="Manrope, sans-serif" font-size="9" font-weight="700">Z (3.8M)</text>
      </g>

      <!-- Dimension Strings -->
      <path d="M 645 140 L 645 280 M 637 140 L 653 140 M 637 280 L 653 280" stroke="#cbd5e1" stroke-width="1.3" />
      <text x="668" y="210" text-anchor="middle" fill="#cbd5e1" font-family="Manrope, sans-serif" font-size="10" letter-spacing="0.18em" transform="rotate(90 668 210)">3.80 M DATUM</text>

      <!-- Title Block -->
      <rect x="490" y="380" width="170" height="42" rx="3" fill="rgba(18,20,23,0.92)" stroke="rgba(203,213,225,0.4)" stroke-width="1" />
      <text x="500" y="397" fill="#cbd5e1" font-family="Manrope, sans-serif" font-size="9" letter-spacing="0.14em" font-weight="600">AXONOMETRIC · 30° ISO</text>
      <text x="500" y="411" fill="rgba(236,230,219,0.7)" font-family="Manrope, sans-serif" font-size="8.5" letter-spacing="0.12em">WHITE PORTLAND CONCRETE</text>
    </svg>
  `;
}

/** Render the Projects index / selected works overview page */
export function renderProjectsPage(targetEl: HTMLElement): () => void {
  targetEl.innerHTML = `
    <div class="projects-cinematic-wrap">
      <!-- Section A: Cinematic Portfolio Introduction -->
      <section class="proj-intro-section" aria-labelledby="portfolio-heading">
        <div class="proj-intro-inner">
          <div class="proj-eyebrow-row">
            <span class="proj-mark-glyph" aria-hidden="true">
              <svg viewBox="0 0 24 16" width="22" height="15" fill="none">
                <rect x="0" y="10" width="6" height="6" fill="#dfba73" />
                <rect x="9" y="5" width="6" height="11" fill="#dfba73" opacity="0.85" />
                <rect x="18" y="0" width="6" height="16" fill="#dfba73" opacity="0.65" />
              </svg>
            </span>
            <span class="eyebrow-draft">PORTFOLIO · ARCHITECTURAL WORKS</span>
            <span class="proj-eyebrow-divider" aria-hidden="true">/</span>
            <span class="proj-studio-label">BUILD WITH YASH</span>
          </div>

          <h2 id="portfolio-heading" class="proj-hero-heading">
            <span class="reveal-mask"><span class="reveal-inner">SELECTED</span></span>
            <span class="reveal-mask"><span class="reveal-inner">WORKS<em>.</em></span></span>
          </h2>

          <div class="proj-hero-desc-block">
            <p class="proj-hero-sub">
              Buildora transforms orthographic architectural linework into living, light-responsive spaces. Each commission explores solar geometry, material honesty, and tactile enclosure by <strong>Build with Yash</strong>.
            </p>
          </div>

          <nav class="proj-quick-jumps" aria-label="Jump to project">
            ${PROJECTS.map(
              (p, i) => `
              <button type="button" class="quick-jump-btn qj-pal-${p.paletteIdx}" data-target="${p.slug}">
                <span class="qj-idx">0${i + 1}</span>
                <span class="qj-title">${p.title}</span>
                <span class="qj-type">${p.drawingType.split('·')[0].trim()}</span>
                <span class="qj-arrow">↓</span>
              </button>
            `,
            ).join('')}
          </nav>
        </div>
      </section>

      <!-- Section B: Oversized Editorial Project Stacking Sequence -->
      <section class="editorial-projects-stack" aria-label="Selected architectural projects">
        ${PROJECTS.map(
          (p, idx) => `
          <article class="editorial-card pal-${p.paletteIdx}" id="${p.slug}" data-project-idx="${idx}" data-slug="${p.slug}">
            <div class="card-shine-flow" aria-hidden="true"></div>
            <div class="card-watermark" aria-hidden="true">0${idx + 1}</div>

            <div class="card-top-row">
              <div class="card-top-meta">
                <span class="card-idx-tag">COMMISSION 0${idx + 1}</span>
                <span class="card-sep" aria-hidden="true">/</span>
                <span class="card-loc-tag">${p.location.toUpperCase()}</span>
                <span class="card-sep" aria-hidden="true">/</span>
                <span class="card-year-tag">${p.year}</span>
              </div>
              <div class="card-pills-row">
                <span class="card-pill pill-cat pill-cat-${p.paletteIdx}">${p.category.toUpperCase()}</span>
                <span class="card-pill pill-drawing">${p.drawingType.split('·')[0].trim().toUpperCase()}</span>
                <span class="card-pill pill-area">${p.area}</span>
                <span class="card-pill pill-mat">${p.materialsUsed[0].toUpperCase()}</span>
              </div>
            </div>

            <div class="card-main-grid">
              <div class="card-content-col">
                <h2 class="card-project-title">
                  <a href="/projects/${p.slug}" data-link title="View case study for ${p.title}">${p.title
                    .split(' ')
                    .map((w) => `<span class="word">${w}</span>`)
                    .join(' ')}</a>
                </h2>
                <p class="card-tagline">${p.tagline}</p>
                <p class="card-concept">${p.concept}</p>

                <div class="card-specs-matrix">
                  ${p.specs.items
                    .map(
                      (item) => `
                    <div class="csm-item">
                      <span class="csm-label">${item.label}</span>
                      <strong class="csm-val">${item.value}</strong>
                    </div>
                  `,
                    )
                    .join('')}
                </div>

                <div class="card-actions-row">
                  <a href="/projects/${p.slug}" class="cta card-cta-primary" data-link>
                    Explore Case Study →
                  </a>
                  <a href="/studio?pal=${p.paletteIdx}&hour=${p.solarHour}" class="card-cta-secondary" data-link>
                    Launch in 3D Studio ↗
                  </a>
                </div>
              </div>

              <div class="card-visual-col">
                <div class="card-visual-frame">
                  ${renderProjectSvg(p, idx)}
                  <a href="/projects/${p.slug}" class="card-visual-lens" data-link aria-label="Open Full Case Study ↗ — ${p.title}">
                    <span class="lens-label">Open Full Case Study ↗</span>
                  </a>
                </div>
              </div>
            </div>
          </article>
        `,
        ).join('')}
      </section>

      <!-- Section C: Closing Transition -->
      <section class="proj-closing-section">
        <div class="closing-card">
          <div class="closing-main-grid">
            <div class="closing-text-col">
              <p class="eyebrow"><span class="eyebrow-draft">Spatial Enquiries · Direct Atelier</span></p>
              <h2 class="closing-title reveal-mask"><span class="reveal-inner">Have a project in <em>mind?</em></span></h2>
              <p class="closing-desc">
                Build with Yash collaborates with private clients, architects, and institutions on bespoke living spaces, residential renovations, and interactive spatial experiences.
              </p>
              <div class="closing-actions">
                <a href="#contact-section" class="cta" data-scroll="contact">Enquire with Atelier Direct ↓</a>
                <a href="#studio-section" class="btn-return-home" data-scroll="studio">Return to 3D Studio ↑</a>
              </div>
            </div>

            <div class="closing-specs-col">
              <div class="closing-spec-panel">
                <div class="csp-row">
                  <span class="csp-label">Discipline</span>
                  <span class="csp-value">Architecture & Interior Craft</span>
                </div>
                <div class="csp-row">
                  <span class="csp-label">Offices</span>
                  <span class="csp-value">Patna, Bihar</span>
                </div>
                <div class="csp-row">
                  <span class="csp-label">Direct Line</span>
                  <span class="csp-value"><a href="mailto:iyashjha@gmail.com" class="csp-link">iyashjha@gmail.com ↗</a></span>
                </div>
                <div class="csp-row">
                  <span class="csp-label">Capacity</span>
                  <span class="csp-value csp-active"><span class="csp-dot"></span> Accepting 2026/27 Commissions</span>
                </div>
              </div>
            </div>
          </div>

          <div class="closing-brand-bar">
            <div class="cbb-brand">
              <svg class="bwy-monogram" viewBox="0 0 20 20" width="15" height="15" aria-hidden="true">
                <path d="M10 2L17 6V14L10 18L3 14V6L10 2Z" stroke="#dfba73" stroke-width="1.3" stroke-linejoin="round"/>
                <path d="M10 2V10M10 10L17 6M10 10L3 6" stroke="#f7f3ed" stroke-width="1.1" stroke-linecap="round"/>
                <path d="M10 10V18" stroke="#dfba73" stroke-width="1.3" stroke-linecap="round"/>
              </svg>
              <span>Build with Yash · Architectural Atelier</span>
            </div>
            <p class="cbb-meta">Patna, Bihar · Response within 24–48h</p>
          </div>
        </div>
      </section>
    </div>
  `;

  // Attach smooth scroll listeners for closing card buttons
  targetEl.querySelectorAll<HTMLAnchorElement>('.closing-actions a[data-scroll]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetType = link.dataset.scroll;
      if (targetType === 'contact') {
        const contactSec = document.getElementById('contact-section');
        if (contactSec) {
          contactSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => {
            const briefInput = document.getElementById('brief-input') || contactSec.querySelector<HTMLElement>('input, textarea');
            briefInput?.focus();
          }, 650);
        }
      } else if (targetType === 'studio') {
        const studioSec = document.getElementById('studio-section') || document.body;
        studioSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Trigger kinetic typography animation for Projects heading
  const portfolioHeading = targetEl.querySelector<HTMLElement>('#portfolio-heading');
  if (portfolioHeading) animatePortfolioHeading(portfolioHeading);
  setupProjectCardTitleKinetic(targetEl);

  // Attach quick-jump smooth scroll listeners
  targetEl.querySelectorAll<HTMLButtonElement>('.quick-jump-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const slug = btn.dataset.target;
      if (!slug) return;
      const card = targetEl.querySelector<HTMLElement>(`#${slug}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Setup scroll-driven reveal observer
  const cards = targetEl.querySelectorAll<HTMLElement>('.editorial-card');
  let observer: IntersectionObserver | null = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      {
        root: null,
        threshold: 0.15,
      },
    );

    cards.forEach((card) => observer!.observe(card));
  } else {
    cards.forEach((card) => card.classList.add('in-view'));
  }

  // Interactive Glass Shattering & Fracture Navigation
  let isTransitioning = false;

  const triggerCardShatter = (card: HTMLElement, slug: string, clientX: number, clientY: number) => {
    if (isTransitioning) return;
    isTransitioning = true;
    card.classList.add('is-shattering');

    // Play crystalline glass shattering sound
    sound.playGlassShatter();

    // Trigger physical hammer strike at impact location
    triggerHammerStrike(clientX, clientY);

    const rect = card.getBoundingClientRect();
    const originX = Math.max(12, Math.min(rect.width - 12, clientX - rect.left));
    const originY = Math.max(12, Math.min(rect.height - 12, clientY - rect.top));

    // Create glass shatter explosion overlay
    const shardContainer = document.createElement('div');
    shardContainer.className = 'glass-shatter-stage';
    shardContainer.setAttribute('aria-hidden', 'true');
    card.appendChild(shardContainer);

    // Spiderweb fracture crack lines radiating from impact point
    const crackSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    crackSvg.setAttribute('class', 'glass-crack-spider');
    crackSvg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    crackSvg.style.width = '100%';
    crackSvg.style.height = '100%';

    let paths = '';
    const numCracks = 16;
    for (let k = 0; k < numCracks; k++) {
      const angle = (k / numCracks) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
      const len = 140 + Math.random() * 260;
      const midDist = len * 0.45;
      const midX = originX + Math.cos(angle) * midDist + (Math.random() - 0.5) * 25;
      const midY = originY + Math.sin(angle) * midDist + (Math.random() - 0.5) * 25;
      const endX = originX + Math.cos(angle) * len;
      const endY = originY + Math.sin(angle) * len;
      paths += `<path d="M ${originX.toFixed(1)} ${originY.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}" stroke="rgba(255,250,235,0.92)" stroke-width="${(1.2 + Math.random() * 1.5).toFixed(1)}" stroke-linecap="round" fill="none"/>`;

      if (k % 2 === 0) {
        const branchAngle = angle + (Math.random() > 0.5 ? 0.6 : -0.6);
        const branchLen = 50 + Math.random() * 70;
        const bEndX = midX + Math.cos(branchAngle) * branchLen;
        const bEndY = midY + Math.sin(branchAngle) * branchLen;
        paths += `<path d="M ${midX.toFixed(1)} ${midY.toFixed(1)} L ${bEndX.toFixed(1)} ${bEndY.toFixed(1)}" stroke="rgba(255,250,235,0.7)" stroke-width="1.0" fill="none"/>`;
      }
    }
    crackSvg.innerHTML = paths;
    shardContainer.appendChild(crackSvg);

    // Physical fractured glass shards that fly outward
    const numRays = 16;
    const numRings = 3;
    const clipVariations = [
      'polygon(50% 0%, 100% 70%, 15% 100%)',
      'polygon(15% 0%, 95% 25%, 75% 100%, 0% 80%)',
      'polygon(0% 20%, 80% 0%, 100% 90%, 25% 100%)',
      'polygon(35% 0%, 100% 50%, 65% 100%, 0% 60%)',
      'polygon(10% 0%, 100% 15%, 85% 100%, 5% 90%)',
      'polygon(45% 0%, 100% 30%, 80% 100%, 10% 70%)'
    ];

    for (let r = 0; r < numRings; r++) {
      const rInner = (r / numRings) * Math.max(rect.width, rect.height) * 0.4;
      const rOuter = ((r + 1) / numRings) * Math.max(rect.width, rect.height) * 0.5;

      for (let i = 0; i < numRays; i++) {
        const a1 = (i / numRays) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
        const a2 = ((i + 1) / numRays) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
        const midAngle = (a1 + a2) * 0.5;
        const midDist = (rInner + rOuter) * 0.5;

        const pX = originX + Math.cos(midAngle) * midDist;
        const pY = originY + Math.sin(midAngle) * midDist;

        if (pX < -30 || pX > rect.width + 30 || pY < -30 || pY > rect.height + 30) continue;

        const shard = document.createElement('div');
        shard.className = 'glass-shard';

        const shardW = Math.max(26, (rOuter - rInner) * (0.85 + Math.random() * 0.5));
        const shardH = Math.max(20, ((a2 - a1) * midDist) * (0.85 + Math.random() * 0.5));

        shard.style.width = `${shardW.toFixed(1)}px`;
        shard.style.height = `${shardH.toFixed(1)}px`;
        shard.style.left = `${(pX - shardW * 0.5).toFixed(1)}px`;
        shard.style.top = `${(pY - shardH * 0.5).toFixed(1)}px`;
        shard.style.clipPath = clipVariations[(i + r) % clipVariations.length];

        const blastDist = 70 + Math.random() * 240 + (numRings - r) * 30;
        const blastX = Math.cos(midAngle) * blastDist;
        const blastY = Math.sin(midAngle) * blastDist + 110;
        const rotX = (Math.random() - 0.5) * 480;
        const rotY = (Math.random() - 0.5) * 480;
        const rotZ = (Math.random() - 0.5) * 360;

        shard.style.setProperty('--bx', `${blastX.toFixed(1)}px`);
        shard.style.setProperty('--by', `${blastY.toFixed(1)}px`);
        shard.style.setProperty('--rx', `${rotX.toFixed(1)}deg`);
        shard.style.setProperty('--ry', `${rotY.toFixed(1)}deg`);
        shard.style.setProperty('--rz', `${rotZ.toFixed(1)}deg`);
        shard.style.animationDelay = `${(Math.random() * 0.04).toFixed(3)}s`;

        shardContainer.appendChild(shard);
      }
    }

    // Smooth page transition after shattering animation completes
    setTimeout(() => {
      navigateTo(`/projects/${slug}`);
    }, 380);
  };

  cards.forEach((card) => {
    const slug = card.id;
    if (!slug) return;

    card.addEventListener('click', (e) => {
      const target = e.target as HTMLElement | null;

      // Allow "Launch in 3D Studio" secondary action to work without shattering card
      if (target?.closest('.card-cta-secondary')) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const rect = card.getBoundingClientRect();
      const clientX = e.clientX || rect.left + rect.width / 2;
      const clientY = e.clientY || rect.top + rect.height / 2;

      triggerCardShatter(card, slug, clientX, clientY);
    });
  });

  // Layered plank progression & watermark parallax (supports both window scroll on `/` and subpage scroll on `/projects`)
  let ticking = false;
  let rafId: number | null = null;
  const stickyTops = [82, 108, 134];
  const updatePlanksAndWatermarks = () => {
    const vh = window.innerHeight || 900;
    const isDesktop = window.innerWidth > 960;
    const rects = Array.from(cards, (c) => c.getBoundingClientRect());

    cards.forEach((card, idx) => {
      const rect = rects[idx];
      if (!rect) return;

      // Watermark parallax when in or near viewport
      if (rect.bottom > -200 && rect.top < vh + 200) {
        const offset = (rect.top - vh * 0.35) * 0.1;
        const watermark = card.querySelector<HTMLElement>('.card-watermark');
        if (watermark) {
          watermark.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
        }
      }

      if (!isDesktop) {
        card.style.removeProperty('--plank-scale');
        card.style.removeProperty('--plank-rot-x');
        card.style.removeProperty('--plank-bright');
        return;
      }

      // 1. Entry roll-down into sticky slot
      const targetTop = stickyTops[idx] ?? 82;
      const entryRange = Math.max(240, vh - targetTop);
      const entryDist = Math.max(0, Math.min(1, (rect.top - targetTop) / entryRange));
      const rotX = (-5.5 * entryDist).toFixed(2);

      // 2. Depth recession as subsequent planks slide over this pinned plank
      let overlapSum = 0;
      for (let j = idx + 1; j < cards.length; j++) {
        const nextRect = rects[j];
        const nextTargetTop = stickyTops[j] ?? 108;
        const startY = Math.max(nextTargetTop + 260, rect.bottom);
        const progress = Math.max(0, Math.min(1, (startY - nextRect.top) / Math.max(180, startY - nextTargetTop)));
        overlapSum += progress;
      }

      const scale = Math.max(0.92, 1 - overlapSum * 0.032).toFixed(4);
      const bright = Math.max(0.68, 1 - overlapSum * 0.15).toFixed(3);

      card.style.setProperty('--plank-rot-x', `${rotX}deg`);
      card.style.setProperty('--plank-scale', scale);
      card.style.setProperty('--plank-bright', bright);
    });
  };

  const onScroll = () => {
    if (!ticking) {
      rafId = requestAnimationFrame(() => {
        updatePlanksAndWatermarks();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  targetEl.addEventListener('scroll', onScroll, { passive: true });
  updatePlanksAndWatermarks();
  activateContinuousTypography(targetEl);

  return () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    window.removeEventListener('scroll', onScroll);
    targetEl.removeEventListener('scroll', onScroll);
    if (observer) observer.disconnect();
  };
}

/* ========================================================================= */
/* ARCHITECTURAL FINISHED REALIZATION RENDERS (Side B of Sliders)            */
/* ========================================================================= */

/** Nordic Pavilion: Finished Daylight Architectural Realization */
function renderNordicBuiltSvg(): string {
  return `
    <svg viewBox="0 0 720 460" class="slider-svg-full" aria-label="Architectural daylight realization of The Nordic Pavilion">
      <defs>
        <linearGradient id="nb-sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#cfdbe2" />
          <stop offset="65%" stop-color="#e3ebed" />
          <stop offset="100%" stop-color="#eedfcb" />
        </linearGradient>
        <linearGradient id="nb-sunbeam" x1="0%" y1="0%" x2="100%" y2="85%">
          <stop offset="0%" stop-color="#fff1d6" stop-opacity="0.55" />
          <stop offset="40%" stop-color="#e9b97a" stop-opacity="0.32" />
          <stop offset="100%" stop-color="#e9b97a" stop-opacity="0.0" />
        </linearGradient>
        <linearGradient id="nb-oak-floor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#dfcfb7" />
          <stop offset="50%" stop-color="#d1be9e" />
          <stop offset="100%" stop-color="#beaa88" />
        </linearGradient>
        <pattern id="nb-oak-grain" width="120" height="20" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="120" y2="0" stroke="rgba(120,95,65,0.18)" stroke-width="1.2" />
          <line x1="0" y1="10" x2="120" y2="10" stroke="rgba(120,95,65,0.12)" stroke-width="0.8" />
          <line x1="40" y1="0" x2="40" y2="10" stroke="rgba(120,95,65,0.15)" stroke-width="0.8" />
          <line x1="90" y1="10" x2="90" y2="20" stroke="rgba(120,95,65,0.15)" stroke-width="0.8" />
        </pattern>
        <linearGradient id="nb-plaster-wall" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ebe5dc" />
          <stop offset="60%" stop-color="#ded6c9" />
          <stop offset="100%" stop-color="#cfc5b4" />
        </linearGradient>
      </defs>

      <!-- Room Enclosure Background -->
      <rect x="0" y="0" width="720" height="460" fill="#201b17" />

      <!-- Exterior Landscape (Through Large Corner Glazing: x=0..380, y=40..280) -->
      <rect x="40" y="40" width="340" height="240" fill="url(#nb-sky)" />
      <!-- Distant Baltic Water Inlet -->
      <path d="M 40 180 Q 140 175 220 184 T 380 178 L 380 230 L 40 230 Z" fill="#6a7d8d" opacity="0.65" />
      <path d="M 40 195 Q 160 190 280 198 T 380 192 L 380 230 L 40 230 Z" fill="#586b7b" opacity="0.8" />
      <!-- Wave-Smoothed Archipelago Granite Bedrock -->
      <path d="M 40 215 Q 120 190 200 210 T 380 205 L 380 280 L 40 280 Z" fill="#6d655f" />
      <path d="M 60 228 Q 150 205 240 225 T 380 218 L 380 280 L 40 280 Z" fill="#554e48" />
      <!-- Scandinavian Pine Silhouettes on Horizon -->
      <polygon points="110,140 115,185 105,185" fill="#2c3a32" opacity="0.85" />
      <polygon points="122,130 128,185 116,185" fill="#233029" opacity="0.9" />
      <polygon points="135,145 140,185 130,185" fill="#2c3a32" opacity="0.8" />
      <polygon points="260,150 265,200 255,200" fill="#2c3a32" opacity="0.75" />
      <polygon points="275,138 281,200 269,200" fill="#233029" opacity="0.85" />

      <!-- Corner Glass Mullion Framing -->
      <rect x="36" y="36" width="348" height="248" fill="none" stroke="#2a241f" stroke-width="6" />
      <line x1="380" y1="36" x2="380" y2="284" stroke="#e9b97a" stroke-width="2.5" />
      <line x1="36" y1="284" x2="380" y2="284" stroke="#2a241f" stroke-width="6" />

      <!-- Natural Mineral Lime Plaster Interior Walls -->
      <polygon points="380,36 720,36 720,284 380,284" fill="url(#nb-plaster-wall)" />
      <rect x="380" y="36" width="28" height="248" fill="rgba(0,0,0,0.18)" />

      <!-- Exposed Pale Pine Joists Overhead -->
      <g fill="#c9b99e" stroke="#221c17" stroke-width="1">
        <rect x="40" y="16" width="680" height="20" fill="#8f7e69" />
        <line x1="120" y1="16" x2="120" y2="36" stroke="#221c17" stroke-width="3" />
        <line x1="220" y1="16" x2="220" y2="36" stroke="#221c17" stroke-width="3" />
        <line x1="320" y1="16" x2="320" y2="36" stroke="#221c17" stroke-width="3" />
        <line x1="420" y1="16" x2="420" y2="36" stroke="#221c17" stroke-width="3" />
        <line x1="520" y1="16" x2="520" y2="36" stroke="#221c17" stroke-width="3" />
        <line x1="620" y1="16" x2="620" y2="36" stroke="#221c17" stroke-width="3" />
      </g>

      <!-- Finished Quarter-Sawn Seasoned Teak Flooring -->
      <polygon points="0,284 720,284 720,460 0,460" fill="url(#nb-oak-floor)" />
      <polygon points="0,284 720,284 720,460 0,460" fill="url(#nb-oak-grain)" opacity="0.75" />

      <!-- Raking 14:30 Sunbeam Ray entering from Left Aperture -->
      <polygon points="40,40 40,284 560,460 280,460" fill="url(#nb-sunbeam)" />

      <!-- Oatmeal Bouclé Modular Sofa (Finished Furniture) -->
      <ellipse cx="440" cy="385" rx="140" ry="24" fill="rgba(30,22,16,0.4)" />
      <rect x="310" y="310" width="260" height="70" rx="14" fill="#ebe4d8" stroke="#d5cbbe" stroke-width="2" />
      <rect x="310" y="275" width="110" height="105" rx="12" fill="#f0ebe0" stroke="#d5cbbe" stroke-width="2" />
      <rect x="318" y="260" width="94" height="26" rx="8" fill="#e2dad0" stroke="#c8bea8" stroke-width="1.5" />
      <rect x="424" y="295" width="138" height="24" rx="8" fill="#e2dad0" stroke="#c8bea8" stroke-width="1.5" />
      
      <!-- Turned Solid Oak Coffee Table -->
      <ellipse cx="260" cy="390" rx="46" ry="18" fill="rgba(30,22,16,0.35)" />
      <ellipse cx="260" cy="384" rx="44" ry="16" fill="#c4ad8f" stroke="#e9b97a" stroke-width="1.8" />
      <ellipse cx="260" cy="384" rx="18" ry="7" fill="#8f7657" opacity="0.4" />
      <ellipse cx="254" cy="380" rx="7" ry="5" fill="#f4efe6" stroke="#4a3e35" stroke-width="1" />

      <!-- Minimalist Built-in Limestone Hearth (Right) -->
      <rect x="620" y="220" width="80" height="90" rx="3" fill="#25211c" stroke="#cfc5b4" stroke-width="2" />
      <rect x="635" y="250" width="50" height="45" rx="3" fill="#0d0c0a" />
      <ellipse cx="660" cy="288" rx="16" ry="4" fill="#e9b97a" opacity="0.8" />

      <!-- Architectural Callout Badges inside the frame -->
      <rect x="24" y="20" width="210" height="26" rx="99" fill="rgba(18,15,12,0.85)" stroke="rgba(233,185,122,0.4)" stroke-width="1" />
      <text x="36" y="37" fill="#e9b97a" font-family="Manrope, sans-serif" font-size="9" letter-spacing="0.16em" font-weight="600">ARCHIPELAGO DAYLIGHT · 14:30</text>
    </svg>
  `;
}

/** Smoked Atelier: Finished Crafted Architectural Realization */
function renderSmokedAtelierBuiltSvg(): string {
  return `
    <svg viewBox="0 0 720 460" class="slider-svg-full" aria-label="Crafted interior realization of The Smoked Atelier">
      <defs>
        <linearGradient id="sa-walnut-wall" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#2a1e16" />
          <stop offset="50%" stop-color="#36251a" />
          <stop offset="100%" stop-color="#1e150f" />
        </linearGradient>
        <pattern id="sa-walnut-slats" width="18" height="20" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="14" height="20" fill="#38251b" />
          <line x1="14" y1="0" x2="14" y2="20" stroke="#d89658" stroke-width="1" opacity="0.65" />
          <rect x="15" y="0" width="3" height="20" fill="#140e0a" />
        </pattern>
        <linearGradient id="sa-golden-ray" x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%" stop-color="#f6be7b" stop-opacity="0.6" />
          <stop offset="45%" stop-color="#d89658" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#d89658" stop-opacity="0.0" />
        </linearGradient>
        <linearGradient id="sa-pendant-glow" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#fff0d0" stop-opacity="0.75" />
          <stop offset="35%" stop-color="#f6be7b" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#d89658" stop-opacity="0.0" />
        </linearGradient>
        <linearGradient id="sa-basalt-plinth" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#221e1a" />
          <stop offset="100%" stop-color="#14110e" />
        </linearGradient>
      </defs>

      <!-- Deep Espresso Atelier Room Background -->
      <rect x="0" y="0" width="720" height="460" fill="#110d0a" />

      <!-- Back Wall: Vertical Micro-Perforated Smoked Walnut Slats -->
      <rect x="0" y="0" width="720" height="300" fill="url(#sa-walnut-wall)" />
      <rect x="0" y="0" width="720" height="300" fill="url(#sa-walnut-slats)" />

      <!-- Left High Vertical Narrow Glazing Slot -->
      <rect x="40" y="40" width="32" height="210" fill="#fcdba8" stroke="#d89658" stroke-width="2" />
      <!-- 17:45 Raking Low Golden-Hour Sunbeam -->
      <polygon points="72,50 72,250 560,370 340,370" fill="url(#sa-golden-ray)" />

      <!-- Suspended Acoustic Baffle Ceiling Clouds -->
      <g fill="#1a140f" stroke="#d89658" stroke-width="1.2">
        <rect x="60" y="12" width="130" height="18" rx="2" />
        <rect x="220" y="16" width="130" height="18" rx="2" />
        <rect x="380" y="12" width="130" height="18" rx="2" />
        <rect x="540" y="16" width="130" height="18" rx="2" />
      </g>

      <!-- Honed Dark Oak / Basalt Floor Plane -->
      <polygon points="0,300 720,300 720,460 0,460" fill="#181310" />
      <line x1="0" y1="300" x2="720" y2="300" stroke="#d89658" stroke-width="1.6" opacity="0.4" />
      <line x1="0" y1="360" x2="720" y2="360" stroke="rgba(216,150,88,0.08)" stroke-width="1" />
      <line x1="0" y1="410" x2="720" y2="410" stroke="rgba(216,150,88,0.06)" stroke-width="1" />

      <!-- Suspended Architectural Bronze Luminaire & Cone of 2400K Downlight -->
      <line x1="360" y1="20" x2="360" y2="150" stroke="#d89658" stroke-width="1.8" />
      <polygon points="320,150 400,150 415,165 305,165" fill="#54371f" stroke="#d89658" stroke-width="1.5" />
      <line x1="310" y1="165" x2="410" y2="165" stroke="#ffe8c2" stroke-width="2.5" />
      <polygon points="310,165 410,165 540,340 180,340" fill="url(#sa-pendant-glow)" />

      <!-- Honed Swiss Basalt Workplane / Plinth (Centered) -->
      <rect x="180" y="325" width="360" height="15" rx="3" fill="rgba(0,0,0,0.7)" />
      <rect x="170" y="260" width="380" height="65" rx="4" fill="url(#sa-basalt-plinth)" stroke="#ece6db" stroke-width="1.8" />
      <line x1="170" y1="260" x2="550" y2="260" stroke="#f6be7b" stroke-width="3" />
      <line x1="170" y1="272" x2="550" y2="272" stroke="#d89658" stroke-width="1" opacity="0.6" />
      <rect x="220" y="325" width="280" height="10" fill="#0d0a08" />

      <!-- Tactile Artifacts on Basalt Table -->
      <rect x="230" y="270" width="130" height="42" rx="2" fill="#322216" stroke="#d89658" stroke-width="1" />
      <rect x="245" y="276" width="60" height="30" rx="1" fill="#ede5d8" />
      <line x1="380" y1="285" x2="470" y2="285" stroke="#d89658" stroke-width="2" />
      <circle cx="500" cy="285" r="8" fill="#1b140e" stroke="#d89658" stroke-width="1.2" />

      <!-- Corner Callout Badge -->
      <rect x="24" y="20" width="220" height="26" rx="99" fill="rgba(18,14,10,0.88)" stroke="rgba(216,150,88,0.5)" stroke-width="1" />
      <text x="36" y="37" fill="#ecc395" font-family="Manrope, sans-serif" font-size="9" letter-spacing="0.16em" font-weight="600">SMOKED WALNUT & BASALT · 17:45</text>
    </svg>
  `;
}

/** Monolithic Cloister: Finished Monumental Chiaroscuro Realization */
function renderMonolithicCloisterBuiltSvg(): string {
  return `
    <svg viewBox="0 0 720 460" class="slider-svg-full" aria-label="Monumental chiaroscuro realization of The Monolithic Cloister">
      <defs>
        <linearGradient id="mc-clerestory-light" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
          <stop offset="25%" stop-color="#dce4ec" stop-opacity="0.5" />
          <stop offset="100%" stop-color="#222730" stop-opacity="0.0" />
        </linearGradient>
        <pattern id="mc-board-grain" width="120" height="24" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="120" y2="0" stroke="rgba(203,213,225,0.18)" stroke-width="1.4" />
          <line x1="0" y1="12" x2="120" y2="12" stroke="rgba(203,213,225,0.08)" stroke-width="0.8" />
          <line x1="60" y1="0" x2="60" y2="12" stroke="rgba(0,0,0,0.3)" stroke-width="1" />
          <circle cx="30" cy="18" r="1.5" fill="#0d0f12" />
          <circle cx="90" cy="18" r="1.5" fill="#0d0f12" />
        </pattern>
        <linearGradient id="mc-terrazzo-floor" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#181c22" />
          <stop offset="50%" stop-color="#242b34" />
          <stop offset="100%" stop-color="#121519" />
        </linearGradient>
        <linearGradient id="mc-deep-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0a0c0e" stop-opacity="0.88" />
          <stop offset="100%" stop-color="#0a0c0e" stop-opacity="0.95" />
        </linearGradient>
      </defs>

      <!-- Monumental Chamber Background -->
      <rect x="0" y="0" width="720" height="460" fill="#0f1114" />

      <!-- Concrete Walls with Rough-Sawn Pine Board Impression -->
      <rect x="0" y="30" width="720" height="270" fill="#222730" />
      <rect x="0" y="30" width="720" height="270" fill="url(#mc-board-grain)" />

      <!-- Horizontal Board-Form Cast Construction Seams -->
      <line x1="0" y1="78" x2="720" y2="78" stroke="#12151a" stroke-width="2" />
      <line x1="0" y1="126" x2="720" y2="126" stroke="#12151a" stroke-width="2" />
      <line x1="0" y1="174" x2="720" y2="174" stroke="#12151a" stroke-width="2" />
      <line x1="0" y1="222" x2="720" y2="222" stroke="#12151a" stroke-width="2" />
      <line x1="0" y1="270" x2="720" y2="270" stroke="#12151a" stroke-width="2" />

      <!-- Continuous 360° Clerestory Daylight Ribbon Slot -->
      <rect x="0" y="20" width="720" height="22" fill="#f0f5fa" />
      <rect x="0" y="20" width="720" height="22" stroke="#cbd5e1" stroke-width="1.5" />
      <rect x="0" y="42" width="720" height="150" fill="url(#mc-clerestory-light)" />

      <!-- Monolithic Concrete Ceiling Canopy with Recessed Waffle Coffers -->
      <rect x="0" y="0" width="720" height="20" fill="#2d3440" stroke="#ece6db" stroke-width="1.8" />
      <line x1="140" y1="0" x2="140" y2="20" stroke="#12151a" stroke-width="3" />
      <line x1="280" y1="0" x2="280" y2="20" stroke="#12151a" stroke-width="3" />
      <line x1="420" y1="0" x2="420" y2="20" stroke="#12151a" stroke-width="3" />
      <line x1="560" y1="0" x2="560" y2="20" stroke="#12151a" stroke-width="3" />

      <!-- Quartz Terrazzo Ground Floor Slab -->
      <polygon points="0,300 720,300 720,460 0,460" fill="url(#mc-terrazzo-floor)" />
      <line x1="0" y1="300" x2="720" y2="300" stroke="#cbd5e1" stroke-width="2" />
      <line x1="180" y1="300" x2="90" y2="460" stroke="#cbd5e1" stroke-width="1.4" opacity="0.4" />
      <line x1="360" y1="300" x2="360" y2="460" stroke="#cbd5e1" stroke-width="1.4" opacity="0.4" />
      <line x1="540" y1="300" x2="630" y2="460" stroke="#cbd5e1" stroke-width="1.4" opacity="0.4" />
      <line x1="0" y1="380" x2="720" y2="380" stroke="#cbd5e1" stroke-width="1.4" opacity="0.4" />

      <!-- Dramatic High-Contrast Chiaroscuro Morning Shadow Slicing Through Space -->
      <polygon points="260,20 720,20 720,460 480,460 160,240 160,20" fill="url(#mc-deep-shadow)" />

      <!-- Central Floating Silver Navona Travertine Monolith (Altar) -->
      <polygon points="220,380 500,380 480,410 200,410" fill="rgba(0,0,0,0.8)" />
      <polygon points="220,320 500,320 500,375 220,375" fill="#e2e8f0" stroke="#ece6db" stroke-width="1.6" />
      <ellipse cx="280" cy="340" rx="14" ry="4" fill="#cbd5e1" opacity="0.7" />
      <ellipse cx="380" cy="355" rx="22" ry="5" fill="#cbd5e1" opacity="0.6" />
      <ellipse cx="440" cy="336" rx="16" ry="4" fill="#cbd5e1" opacity="0.7" />
      <polygon points="500,320 520,310 520,365 500,375" fill="#94a3b8" />
      <polygon points="220,320 240,310 520,310 500,320" fill="#ffffff" />

      <!-- Corner Callout Badge -->
      <rect x="24" y="20" width="230" height="26" rx="99" fill="rgba(16,18,21,0.92)" stroke="rgba(203,213,225,0.4)" stroke-width="1" />
      <text x="36" y="37" fill="#f1f5f9" font-family="Manrope, sans-serif" font-size="9" letter-spacing="0.16em" font-weight="600">WHITE PORTLAND CONCRETE · 11:30</text>
    </svg>
  `;
}

/** Kinetic Typography Word Wrapping Helper */
function splitHeadingWords(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .map((word) => `<span class="heading-word">${word}</span>`)
    .join(' ');
}

/** Setup Shared Word Animations for Case Study Pages */
function setupCaseStudyAnimations(targetEl: HTMLElement, heroTitleId: string): () => void {
  // Case study headings deliberate kinetic typography
  setupCaseStudyHeadings(targetEl);

  // Activate continuous fluid moving words and audit all headings across the entire case study
  initTypographyEngine(targetEl);

  return () => {};
}

/** Rich Shared Case Study Footer Connecting to Next Work, All Works, and Contact */
function renderCaseStudyFooter(prevProject: ProjectItem, nextProject: ProjectItem): string {
  return `
    <section class="cs-footer-connect" aria-label="Project navigation and enquiry">
      <div class="csf-inner">
        <div class="csf-prompt">
          <span class="csf-eyebrow">CONTINUOUS PRACTICE · SPATIAL COMMISSIONS</span>
          <h3 class="csf-headline">Transforming your architectural vision into built reality.</h3>
          <p class="csf-desc">Build with Yash accepts a limited number of residential renovations, spatial installations, and bespoke commissions annually.</p>
          <div class="csf-actions">
            <a href="/contact" class="cta csf-cta-primary" data-link>Begin Your Space (Contact Yash) →</a>
            <a href="/projects" class="csf-cta-secondary" data-link>← View All Works</a>
            <a href="/studio" class="csf-cta-secondary" data-link>Interactive 3D Studio ↗</a>
          </div>
        </div>

        <!-- Adjacent Works Pagination -->
        <nav class="pd-pagination" aria-label="Adjacent projects">
          <a href="/projects/${prevProject.slug}" class="pd-pag-link pd-prev" data-link>
            <small>Previous Work</small>
            <strong>← ${prevProject.title}</strong>
          </a>
          <a href="/projects/${nextProject.slug}" class="pd-pag-link pd-next" data-link>
            <small>Next Work</small>
            <strong>${nextProject.title} →</strong>
          </a>
        </nav>

        <div class="csf-bottom-bar">
          <div class="csf-brand">
            <span class="csf-logo">Buildora<i>.</i></span>
            <span>An architectural experience by <strong>Build with Yash</strong></span>
          </div>
          <div class="csf-coords">
            <span>Patna, Bihar, India</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

/** Setup Draggable Drawing-to-Render Comparison Slider */
function setupComparisonSlider(
  targetEl: HTMLElement,
  wrapId: string,
  revealId: string,
  handleId: string,
  statusId: string,
  planLabel: string,
  builtLabel: string,
  rangeInputId?: string
): () => void {
  const wrap = targetEl.querySelector<HTMLElement>(`#${wrapId}`);
  const reveal = targetEl.querySelector<HTMLElement>(`#${revealId}`);
  const handle = targetEl.querySelector<HTMLElement>(`#${handleId}`);
  const statusText = targetEl.querySelector<HTMLElement>(`#${statusId}`);
  const rangeInput = rangeInputId ? targetEl.querySelector<HTMLInputElement>(`#${rangeInputId}`) : null;
  const knob = handle?.querySelector<HTMLElement>('.handle-knob');

  if (!wrap || !reveal || !handle) return () => {};

  let isDragging = false;
  let cachedRect: DOMRect | null = null;

  const setPosPct = (pct: number) => {
    const clampedPct = Math.max(0, Math.min(100, Math.round(pct)));
    handle.style.left = `${clampedPct}%`;
    reveal.style.clipPath = `inset(0 ${100 - clampedPct}% 0 0)`;
    if (knob) {
      knob.setAttribute('aria-valuenow', String(clampedPct));
      knob.setAttribute('aria-valuemin', '0');
      knob.setAttribute('aria-valuemax', '100');
    }
    if (rangeInput && Math.abs(Number(rangeInput.value) - clampedPct) > 0.5) {
      rangeInput.value = String(clampedPct);
    }
    if (statusText) {
      statusText.textContent = `Revealing ${clampedPct}% ${planLabel} against ${100 - clampedPct}% ${builtLabel}.`;
    }
  };

  const setPosFromClientX = (clientX: number) => {
    const rect = cachedRect || wrap.getBoundingClientRect();
    if (rect.width <= 0) return;
    const offset = Math.max(0, Math.min(rect.width, clientX - rect.left));
    setPosPct((offset / rect.width) * 100);
  };

  const onPointerDown = (e: PointerEvent) => {
    isDragging = true;
    cachedRect = wrap.getBoundingClientRect();
    try {
      wrap.setPointerCapture(e.pointerId);
    } catch (_) {}
    setPosFromClientX(e.clientX);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    setPosFromClientX(e.clientX);
  };

  const onPointerUp = (e: PointerEvent) => {
    if (isDragging) {
      isDragging = false;
      cachedRect = null;
      try {
        wrap.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  wrap.addEventListener('pointerdown', onPointerDown);
  wrap.addEventListener('pointermove', onPointerMove);
  wrap.addEventListener('pointerup', onPointerUp);
  wrap.addEventListener('pointercancel', onPointerUp);

  const onKeyDown = (e: KeyboardEvent) => {
    const currentVal = parseInt(knob?.getAttribute('aria-valuenow') || '50', 10);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      setPosPct(currentVal - 5);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      setPosPct(currentVal + 5);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setPosPct(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setPosPct(100);
    }
  };

  // Keyboard accessibility on handle knob
  if (knob) {
    knob.setAttribute('tabindex', '0');
    knob.setAttribute('role', 'slider');
    knob.setAttribute('aria-label', `Comparison slider between ${planLabel} and ${builtLabel}`);
    knob.addEventListener('keydown', onKeyDown);
  }

  const onRangeInput = () => {
    if (rangeInput) setPosPct(Number(rangeInput.value));
  };

  // Fallback accessible range scrubber
  if (rangeInput) {
    rangeInput.addEventListener('input', onRangeInput);
  }

  // Set initial 50% position
  setPosPct(50);

  return () => {
    wrap.removeEventListener('pointerdown', onPointerDown);
    wrap.removeEventListener('pointermove', onPointerMove);
    wrap.removeEventListener('pointerup', onPointerUp);
    wrap.removeEventListener('pointercancel', onPointerUp);
    if (knob) knob.removeEventListener('keydown', onKeyDown);
    if (rangeInput) rangeInput.removeEventListener('input', onRangeInput);
  };
}

/* ========================================================================= */
/* CASE STUDY 1: THE NORDIC PAVILION (Light & Landscape)                     */
/* ========================================================================= */
function renderNordicPavilionCaseStudy(targetEl: HTMLElement, project: ProjectItem, prevProject: ProjectItem, nextProject: ProjectItem): () => void {
  targetEl.innerHTML = `
    <div class="project-detail-container cs-nordic">
      <nav class="pd-top-nav">
        <a href="/projects" class="pd-back-link" data-link>← Back to Selected Works</a>
        <div class="pd-top-meta">
          <span class="coord-tag">PATNA RIVERFRONT · 25°35'N 85°08'E</span>
          <span class="sep">/</span>
          <span>${project.category}</span>
          <span class="sep">/</span>
          <span>${project.area}</span>
        </div>
      </nav>

      <!-- Nordic Airy Hero -->
      <section class="cs-hero cs-hero-nordic" aria-labelledby="nordic-title">
        <div class="cs-eyebrow-pill">CASE STUDY 01 · LIGHT & LANDSCAPE</div>
        <h1 class="cs-title" id="nordic-title">${splitHeadingWords(project.title)}</h1>
        <p class="cs-tagline">${project.tagline}</p>
        <p class="cs-lead-desc">
          Perched along the serene riverbank in Patna, Bihar, this residential pavilion dissolves the boundary between orthographic drawing and finished enclosure. Every wall responds to the sub-continental solar arc.
        </p>

        <div class="cs-metric-pills">
          <div class="cs-metric-pill"><b>8.40 × 6.20 M</b><span>Living Bay</span></div>
          <div class="cs-metric-pill"><b>3.20 M</b><span>Exposed Joists</span></div>
          <div class="cs-metric-pill"><b>14:30</b><span>Noon Azimuth</span></div>
          <div class="cs-metric-pill"><b>0.78 W/m²K</b><span>Thermal Value</span></div>
        </div>
      </section>

      <!-- Signature Interaction 1: Split Drawing/Render Comparison Slider -->
      <section class="cs-section" aria-label="Split drawing to finished pavilion comparison">
        <div class="cs-section-header">
          <span class="cs-section-num">01 · ARCHITECTURAL COMPARISON</span>
          <h2 class="cs-section-title" data-animate-words>${splitHeadingWords("Orthographic Plan Resolving into Finished Enclosure")}</h2>
          <p class="cs-section-sub">Drag the divider to observe how the structural drafting linework translates directly into flush quarter-sawn oak, mineral lime plaster, and finished living space.</p>
        </div>

        <div class="pd-slider-wrap nordic-split-wrap" id="nordic-slider-wrap">
          <!-- Rendered Finished State (Bottom Layer) -->
          <div class="slider-layer built-layer">
            ${renderNordicBuiltSvg()}
            <span class="slider-badge sb-right">Finished Pavilion · Daylight Realization</span>
          </div>

          <!-- Orthographic Plan (Top Layer, Clipped) -->
          <div class="slider-layer plan-layer" id="nordic-reveal" style="clip-path: inset(0 50% 0 0);">
            ${renderProjectSvg(project, 0)}
            <span class="slider-badge sb-left">Orthographic Plan · 1:50</span>
          </div>

          <!-- Draggable Handle -->
          <div class="slider-handle" id="nordic-handle" style="left: 50%;">
            <div class="handle-bar"></div>
            <div class="handle-knob" aria-label="Drag comparison slider" role="slider" aria-valuenow="50">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M8 7l-5 5 5 5V7zm8 0v10l5-5-5-5z"/>
              </svg>
            </div>
          </div>
        </div>
        <p class="slider-instruction" id="nordic-slider-status">Drag horizontally · Revealing 50% technical linework against 50% finished daylight rendering.</p>
        <div class="pd-slider-range-row">
          <label for="nordic-slider-range" class="pd-slider-range-lbl">Touch / Keyboard Scrubber:</label>
          <input type="range" id="nordic-slider-range" class="pd-slider-range-input" min="0" max="100" value="50" step="1" aria-label="Compare orthographic plan with daylight realization" />
        </div>
      </section>

      <!-- Signature Interaction 2: Interactive Daylight Movement & Solar Scrubber -->
      <section class="cs-section" aria-label="Interactive daylight geometry simulation">
        <div class="cs-section-header">
          <span class="cs-section-num">02 · SOLAR SIMULATION</span>
          <h2 class="cs-section-title" data-animate-words>${splitHeadingWords("Daylight Arc Scrubbing across Seasoned Indian Teak")}</h2>
          <p class="cs-section-sub">Adjust the solar hour to simulate raking sunbeam depth, azimuth angle, and daylight penetration across the continuous living bay.</p>
        </div>

        <div class="solar-scrubber-card">
          <div class="ssc-top-row">
            <div class="ssc-time-display">
              <span class="ssc-label">Solar Time</span>
              <strong id="nordic-hour-text">14:30 · High Noon Arc</strong>
            </div>
            <div class="ssc-vector-display">
              <span class="ssc-label">Sun Vector</span>
              <strong id="nordic-azimuth-text">Azimuth 194° · Altitude 48°</strong>
            </div>
            <div class="ssc-pen-display">
              <span class="ssc-label">Floor Penetration</span>
              <strong id="nordic-penetration-text">3.85 M Depth</strong>
            </div>
          </div>

          <div class="ssc-slider-row">
            <input type="range" id="nordic-solar-range" min="7" max="21.5" step="0.25" value="14.5" aria-label="Simulate solar hour">
            <div class="ssc-presets">
              <button type="button" class="ssc-btn" data-hour="7.0">07:00 Dawn</button>
              <button type="button" class="ssc-btn" data-hour="13.5">13:30 Solar Noon</button>
              <button type="button" class="ssc-btn active" data-hour="14.5">14:30 Living Bay Peak</button>
              <button type="button" class="ssc-btn" data-hour="17.75">17:45 Golden Hour</button>
              <button type="button" class="ssc-btn" data-hour="21.5">21:30 Baltic Dusk</button>
            </div>
          </div>

          <!-- Dynamic Solar Vector Diagram -->
          <div class="ssc-visual-box">
            <svg viewBox="0 0 700 240" class="ssc-svg" id="nordic-solar-svg" aria-hidden="true">
              <defs>
                <linearGradient id="ssc-beam-grad" x1="0%" y1="0%" x2="100%" y2="80%">
                  <stop offset="0%" stop-color="#e9b97a" stop-opacity="0.45"/>
                  <stop offset="100%" stop-color="#e9b97a" stop-opacity="0.05"/>
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="700" height="240" fill="#151311" />
              <!-- Room perimeter -->
              <rect x="60" y="40" width="580" height="160" fill="none" stroke="rgba(236,230,219,0.3)" stroke-width="1.5" />
              <!-- Glazed aperture on left -->
              <line x1="60" y1="60" x2="60" y2="180" stroke="#e9b97a" stroke-width="4" />
              <text x="35" y="125" text-anchor="middle" fill="#e9b97a" font-size="9.5" font-family="Manrope, sans-serif" transform="rotate(-90 35 125)">TRIPLE GLAZED APERTURE</text>
              <!-- Sun source and beam -->
              <polygon points="60,60 60,180 440,200 320,40" fill="url(#ssc-beam-grad)" id="nordic-svg-beam" />
              <circle cx="20" cy="120" r="12" fill="none" stroke="#e9b97a" stroke-width="1.4" id="nordic-sun-disc" />
              <circle cx="20" cy="120" r="4" fill="#e9b97a" id="nordic-sun-core" />
              <line x1="60" y1="120" x2="380" y2="120" stroke="#e9b97a" stroke-width="1.2" stroke-dasharray="4 4" id="nordic-sun-axis" />
              <text x="360" y="225" text-anchor="middle" fill="rgba(236,230,219,0.6)" font-size="10" font-family="Manrope, sans-serif" letter-spacing="0.16em">CONTINUOUS QUARTER-SAWN OAK WORKED FLOORING</text>
            </svg>
          </div>
        </div>
      </section>

      <!-- Section 03: Progressive Construction Reveal Phases -->
      <section class="cs-section" aria-label="Progressive construction sequence">
        <div class="cs-section-header">
          <span class="cs-section-num">03 · CHRONOLOGY</span>
          <h2 class="cs-section-title" data-animate-words>${splitHeadingWords("Progressive Construction Assembly")}</h2>
        </div>

        <div class="nordic-phases-grid">
          <div class="n-phase-card">
            <span class="npc-step">01</span>
            <h4>Bedrock Anchorage</h4>
            <p>Post-tensioned stainless steel pins anchored 1.4 meters into solid granite ledge. The raft slab incorporates hydronic heating tubes beneath mineral lime screed.</p>
          </div>
          <div class="n-phase-card">
            <span class="npc-step">02</span>
            <h4>Timber Post-and-Beam</h4>
            <p>Solid posts formed from seasoned Indian Teak with concealed steel knife-plate moment connections. Sourced responsibly from certified timber reserves.</p>
          </div>
          <div class="n-phase-card">
            <span class="npc-step">03</span>
            <h4>Zero-Post Corner Glazing</h4>
            <p>Triple-pane structural glass panels mitred at the south-west corner with structural silicone joints, eliminating visual corner posts.</p>
          </div>
          <div class="n-phase-card">
            <span class="npc-step">04</span>
            <h4>Mineral Lime Enclosure</h4>
            <p>Three coats of lime plaster trowelled onto autoclaved aerated blocks, diffusing maritime raking light with an organic, velvety sheen.</p>
          </div>
        </div>
      </section>

      <!-- Section 04: Specifications & 3D Launch -->
      <section class="cs-section cs-specs-section">
        <div class="pd-content-grid">
          <div class="pd-narrative-col">
            <div class="pd-narrative-block">
              <h3>Architectural Resolution</h3>
              <p>${project.solution}</p>
            </div>
            <div class="pd-narrative-block">
              <h3>Environmental Performance</h3>
              <p>Passive solar gains through the south-west triple glazing offset up to 34% of winter heating demand, with thermal mass in lime walls moderating nocturnal drop.</p>
            </div>
          </div>

          <aside class="pd-sidebar-col">
            <div class="pd-card">
              <h4>Technical Tolerances</h4>
              <dl class="pd-specs-dl">
                ${project.specs.items
                  .map(
                    (it) => `
                  <div><dt>${it.label}</dt><dd>${it.value}</dd></div>
                `,
                  )
                  .join('')}
              </dl>
            </div>

            <div class="pd-card">
              <h4>Materials Palette</h4>
              <ul class="pd-mat-list">
                ${project.materialsUsed.map((m) => `<li><span class="bullet">▪</span> ${m}</li>`).join('')}
              </ul>
              <a href="/studio?pal=0&hour=14.5" class="cta pd-launch-btn" data-link>Launch Nordic Pavilion in 3D Studio →</a>
            </div>
          </aside>
        </div>
      </section>

      ${renderCaseStudyFooter(prevProject, nextProject)}
    </div>
  `;

  // Initialize Comparison Slider
  const cleanupSlider = setupComparisonSlider(
    targetEl,
    'nordic-slider-wrap',
    'nordic-reveal',
    'nordic-handle',
    'nordic-slider-status',
    'technical linework',
    'daylight realization',
    'nordic-slider-range'
  );

  // Initialize Word Animations
  const cleanupAnimations = setupCaseStudyAnimations(targetEl, 'nordic-title');

  // Solar scrubber interactive logic
  const solarSlider = document.getElementById('nordic-solar-range') as HTMLInputElement | null;
  const hourText = document.getElementById('nordic-hour-text');
  const azimuthText = document.getElementById('nordic-azimuth-text');
  const penetrationText = document.getElementById('nordic-penetration-text');
  const svgBeam = document.getElementById('nordic-svg-beam');
  const presetBtns = targetEl.querySelectorAll<HTMLButtonElement>('.ssc-btn');

  const updateSolarDisplay = (hour: number) => {
    const azimuth = Math.round(92 + (hour - 7) * 13.2);
    const alt = Math.round(Math.max(8, Math.sin(((hour - 6) / 14) * Math.PI) * 52));
    const pen = (Math.max(1.2, 5.2 - (alt / 52) * 2.8)).toFixed(2);

    if (hourText) hourText.textContent = `${hour.toFixed(1)}:00 · Solar Arc`;
    if (azimuthText) azimuthText.textContent = `Azimuth ${azimuth}° · Altitude ${alt}°`;
    if (penetrationText) penetrationText.textContent = `${pen} M Depth`;

    if (svgBeam) {
      const xEnd = Math.round(200 + (alt / 52) * 260);
      svgBeam.setAttribute('points', `60,60 60,180 ${xEnd},200 ${xEnd - 120},40`);
    }

    presetBtns.forEach((btn) => {
      const bHour = parseFloat(btn.dataset.hour || '0');
      btn.classList.toggle('active', Math.abs(bHour - hour) < 0.3);
    });
  };

  const onSolarInput = () => {
    if (solarSlider) updateSolarDisplay(parseFloat(solarSlider.value));
  };
  solarSlider?.addEventListener('input', onSolarInput);

  const presetHandlers: Array<{ btn: HTMLButtonElement; fn: () => void }> = [];
  presetBtns.forEach((btn) => {
    const fn = () => {
      const h = parseFloat(btn.dataset.hour || '14.5');
      if (solarSlider) solarSlider.value = String(h);
      updateSolarDisplay(h);
    };
    btn.addEventListener('click', fn);
    presetHandlers.push({ btn, fn });
  });

  return () => {
    cleanupSlider();
    cleanupAnimations();
    solarSlider?.removeEventListener('input', onSolarInput);
    presetHandlers.forEach(({ btn, fn }) => btn.removeEventListener('click', fn));
  };
}

/* ========================================================================= */
/* CASE STUDY 2: THE SMOKED ATELIER (Material & Craft)                       */
/* ========================================================================= */
function renderSmokedAtelierCaseStudy(targetEl: HTMLElement, project: ProjectItem, prevProject: ProjectItem, nextProject: ProjectItem): () => void {
  targetEl.innerHTML = `
    <div class="project-detail-container cs-atelier">
      <nav class="pd-top-nav">
        <a href="/projects" class="pd-back-link" data-link>← Back to Selected Works</a>
        <div class="pd-top-meta">
          <span class="coord-tag">ZURICH ENGE · 47°21'N 8°31'E</span>
          <span class="sep">/</span>
          <span>${project.category}</span>
          <span class="sep">/</span>
          <span>${project.area}</span>
        </div>
      </nav>

      <!-- Atelier Dark Staccato Hero -->
      <section class="cs-hero cs-hero-atelier" aria-labelledby="atelier-title">
        <div class="cs-eyebrow-pill cs-eyebrow-atelier">CASE STUDY 02 · MATERIAL & CRAFT</div>
        <h1 class="cs-title cs-title-atelier" id="atelier-title">${splitHeadingWords(project.title)}</h1>
        <p class="cs-tagline cs-tagline-atelier">${project.tagline}</p>
        <p class="cs-lead-desc cs-lead-atelier">
          An acoustic design laboratory designed around intimate golden-hour reflection and tactile timber joinery. Internal wall surfaces absorb street tramway decibels while maintaining the visual continuity of dark American walnut millwork.
        </p>

        <div class="cs-metric-pills cs-metric-atelier">
          <div class="cs-metric-pill"><b>154 m³</b><span>Acoustic Volume</span></div>
          <div class="cs-metric-pill"><b>0.32s</b><span>RT60 Reverb Decay</span></div>
          <div class="cs-metric-pill"><b>NC 22</b><span>Noise Criteria</span></div>
          <div class="cs-metric-pill"><b>17:45</b><span>Golden Hour</span></div>
        </div>
      </section>

      <!-- Signature Interaction 1: Split Drawing/Render Comparison Slider -->
      <section class="cs-section" aria-label="Split section cut to crafted atelier comparison">
        <div class="cs-section-header">
          <span class="cs-section-num">01 · ARCHITECTURAL COMPARISON</span>
          <h2 class="cs-section-title" data-animate-words>${splitHeadingWords("Transverse Section Resolving into Crafted Atelier")}</h2>
          <p class="cs-section-sub">Drag the divider to observe how the acoustic section cut translates into micro-perforated smoked walnut joinery, suspended bronze luminaire, and honed Swiss basalt.</p>
        </div>

        <div class="pd-slider-wrap atelier-split-wrap" id="atelier-slider-wrap">
          <!-- Rendered Finished State (Bottom Layer) -->
          <div class="slider-layer built-layer">
            ${renderSmokedAtelierBuiltSvg()}
            <span class="slider-badge sb-right">Crafted Realization · Smoked Walnut & Basalt</span>
          </div>

          <!-- Transverse Section Cut (Top Layer, Clipped) -->
          <div class="slider-layer plan-layer" id="atelier-reveal" style="clip-path: inset(0 50% 0 0);">
            ${renderProjectSvg(project, 1)}
            <span class="slider-badge sb-left">Section Cut A-A · 1:25</span>
          </div>

          <!-- Draggable Handle -->
          <div class="slider-handle" id="atelier-handle" style="left: 50%;">
            <div class="handle-bar"></div>
            <div class="handle-knob" aria-label="Drag comparison slider" role="slider" aria-valuenow="50">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M8 7l-5 5 5 5V7zm8 0v10l5-5-5-5z"/>
              </svg>
            </div>
          </div>
        </div>
        <p class="slider-instruction" id="atelier-slider-status">Drag horizontally · Revealing 50% technical section linework against 50% crafted interior realization.</p>
        <div class="pd-slider-range-row">
          <label for="atelier-slider-range" class="pd-slider-range-lbl">Touch / Keyboard Scrubber:</label>
          <input type="range" id="atelier-slider-range" class="pd-slider-range-input" min="0" max="100" value="50" step="1" aria-label="Compare section cut with crafted realization" />
        </div>
      </section>

      <!-- Signature Interaction 2: Exploded Architectural Joinery & Acoustic Layer Inspector -->
      <section class="cs-section" aria-label="Exploded acoustic layer inspector">
        <div class="cs-section-header">
          <span class="cs-section-num">02 · EXPLODED JOINERY INSPECTOR</span>
          <h2 class="cs-section-title" data-animate-words>${splitHeadingWords("Multi-Layer Acoustic Wall & Plinth Interface")}</h2>
          <p class="cs-section-sub">Select each architectural strata below to inspect how sound attenuation and monolithic timber joinery are engineered behind uninterrupted surfaces.</p>
        </div>

        <div class="layer-inspector-card">
          <!-- Layer Selector Tabs -->
          <div class="lic-tabs-row" role="tablist">
            <button type="button" class="lic-tab active" data-layer="0">Layer 01 · Decoupled Substrate</button>
            <button type="button" class="lic-tab" data-layer="1">Layer 02 · Resilient Channels</button>
            <button type="button" class="lic-tab" data-layer="2">Layer 03 · Perforated Diffusers</button>
            <button type="button" class="lic-tab" data-layer="3">Layer 04 · Basalt Plinth Interface</button>
          </div>

          <!-- Dynamic Detail Display -->
          <div class="lic-display-grid">
            <!-- Left: Graphic Diagram -->
            <div class="lic-graphic-box">
              <svg viewBox="0 0 540 320" class="lic-svg" id="lic-svg-display" aria-hidden="true">
                <rect x="0" y="0" width="540" height="320" fill="#110e0c" />
                <!-- Base wall background -->
                <rect x="40" y="40" width="60" height="240" fill="#1f1813" stroke="#d89658" stroke-width="1.2" id="lic-layer-0" />
                <rect x="110" y="40" width="30" height="240" fill="#2d1f16" stroke="#d89658" stroke-width="1.2" id="lic-layer-1" />
                <rect x="150" y="40" width="120" height="240" fill="#3a271b" stroke="#d89658" stroke-width="1.5" id="lic-layer-2" />
                <rect x="280" y="160" width="220" height="120" rx="4" fill="#221e1a" stroke="#ece6db" stroke-width="1.8" id="lic-layer-3" />
                <line x1="280" y1="160" x2="500" y2="160" stroke="#d89658" stroke-width="3" />

                <!-- Callout Marker -->
                <g id="lic-marker" transform="translate(70, 160)">
                  <circle cx="0" cy="0" r="16" fill="rgba(216,150,88,0.25)" stroke="#d89658" stroke-width="1.6" />
                  <circle cx="0" cy="0" r="4" fill="#d89658" />
                  <line x1="0" y1="0" x2="50" y2="-40" stroke="#d89658" stroke-width="1.2" stroke-dasharray="3 3" />
                </g>
              </svg>
            </div>

            <!-- Right: Technical Data Card -->
            <div class="lic-info-col">
              <span class="lic-tag" id="lic-info-tag">STRATA 01 / 04</span>
              <h3 class="lic-title" id="lic-info-title">Decoupled Substrate & Vibration Void</h3>
              <p class="lic-desc" id="lic-info-desc">
                An isolated 50mm air cavity separated from the external building shell by elastomeric mounting pads. This completely cancels urban street traffic vibrations in the sub-20 Hz frequency spectrum.
              </p>
              <div class="lic-metrics-grid">
                <div><span>Decoupling</span><strong id="lic-metric-1">-28 dB @ 16 Hz</strong></div>
                <div><span>Cavity Depth</span><strong id="lic-metric-2">50 mm Air Cavity</strong></div>
                <div><span>Acoustic Alpha</span><strong id="lic-metric-3">α = 0.92</strong></div>
                <div><span>Tolerances</span><strong id="lic-metric-4">± 0.5 mm CNC</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Signature Interaction 3: Directional Lighting & Golden Hour Modulator -->
      <section class="cs-section" aria-label="Acoustic lighting modulator">
        <div class="cs-section-header">
          <span class="cs-section-num">03 · DIRECTIONAL ILLUMINATION</span>
          <h2 class="cs-section-title" data-animate-words>${splitHeadingWords("17:45 Raking Golden Hour & Bronze Luminaire")}</h2>
          <p class="cs-section-sub">Switch between the three curated lighting scenarios to observe how shadow depth transforms the smoked walnut grain texture.</p>
        </div>

        <div class="atelier-lighting-card">
          <div class="alc-controls">
            <button type="button" class="alc-btn active" data-mode="golden">Scenario A · 17:45 Raking Golden Hour</button>
            <button type="button" class="alc-btn" data-mode="pendant">Scenario B · Focused Downlight Pendant</button>
            <button type="button" class="alc-btn" data-mode="ambient">Scenario C · Diffuse Atelier Twilight</button>
          </div>

          <div class="alc-stage" id="atelier-stage">
            <div class="alc-beam alc-beam-golden" id="alc-beam-golden"></div>
            <div class="alc-beam alc-beam-pendant" id="alc-beam-pendant" style="display:none;"></div>
            <div class="alc-desk-mock">
              <span class="adm-label">Honed Swiss Basalt Workplane</span>
            </div>
            <span class="alc-status-tag" id="alc-status-tag">ACTIVE: 17:45 LOW RAKING SUNBEAM (18° GRAZE)</span>
          </div>
        </div>
      </section>

      <!-- Section 04: Tactile Joinery & Material Craft Sequence -->
      <section class="cs-section" aria-label="Joinery craft details">
        <div class="cs-section-header">
          <span class="cs-section-num">04 · TACTILE DETAILS</span>
          <h2 class="cs-section-title" data-animate-words>${splitHeadingWords("Joinery Details & Material Tolerances")}</h2>
        </div>

        <div class="atelier-craft-grid">
          <div class="acg-card">
            <h4>Concealed Butterfly Splines</h4>
            <p>Solid cold-blackened bronze splines stabilize walnut end-grain seams, creating a hairline joint that expands organically with seasonal humidity.</p>
            <span class="acg-spec">0.8 mm Joint Tolerance</span>
          </div>
          <div class="acg-card">
            <h4>Micro-Perforated Timber</h4>
            <p>Over 14,000 laser-drilled 0.6mm micro-apertures per panel convert acoustic vibration into viscous heat loss without visible speaker-grille aesthetics.</p>
            <span class="acg-spec">0.6 mm Hole Dia · 8 mm Pitch</span>
          </div>
          <div class="acg-card">
            <h4>Water-Jet Cut Basalt Edge</h4>
            <p>Swiss basalt slabs extracted from Graubünden quarry, honed with fine diamond pads to create an ultra-low-reflectance, tactile writing desk.</p>
            <span class="acg-spec">120 mm Cantilevered Bullnose</span>
          </div>
        </div>
      </section>

      <!-- Section 05: Specifications & 3D Launch -->
      <section class="cs-section cs-specs-section">
        <div class="pd-content-grid">
          <div class="pd-narrative-col">
            <div class="pd-narrative-block">
              <h3>Acoustic Resolution</h3>
              <p>${project.solution}</p>
            </div>
            <div class="pd-narrative-block">
              <h3>Thermo-Treated Walnut Process</h3>
              <p>Natural American walnut undergoes vacuum pyrolysis at 180°C, polymerizing natural hemicellulose and deepening the heartwood colour into an espresso bronze patina that will never fade.</p>
            </div>
          </div>

          <aside class="pd-sidebar-col">
            <div class="pd-card">
              <h4>Acoustic Parameters</h4>
              <dl class="pd-specs-dl">
                ${project.specs.items
                  .map(
                    (it) => `
                  <div><dt>${it.label}</dt><dd>${it.value}</dd></div>
                `,
                  )
                  .join('')}
              </dl>
            </div>

            <div class="pd-card">
              <h4>Materiality</h4>
              <ul class="pd-mat-list">
                ${project.materialsUsed.map((m) => `<li><span class="bullet">▪</span> ${m}</li>`).join('')}
              </ul>
              <a href="/studio?pal=1&hour=17.75" class="cta pd-launch-btn" data-link>Launch Smoked Atelier in 3D Studio →</a>
            </div>
          </aside>
        </div>
      </section>

      ${renderCaseStudyFooter(prevProject, nextProject)}
    </div>
  `;

  // Initialize Comparison Slider
  const cleanupSlider = setupComparisonSlider(
    targetEl,
    'atelier-slider-wrap',
    'atelier-reveal',
    'atelier-handle',
    'atelier-slider-status',
    'technical section linework',
    'crafted realization',
    'atelier-slider-range'
  );

  // Initialize Word Animations
  const cleanupAnimations = setupCaseStudyAnimations(targetEl, 'atelier-title');

  // Exploded joinery interactive tabs
  const tabBtns = targetEl.querySelectorAll<HTMLButtonElement>('.lic-tab');
  const infoTag = document.getElementById('lic-info-tag');
  const infoTitle = document.getElementById('lic-info-title');
  const infoDesc = document.getElementById('lic-info-desc');
  const m1 = document.getElementById('lic-metric-1');
  const m2 = document.getElementById('lic-metric-2');
  const m3 = document.getElementById('lic-metric-3');
  const m4 = document.getElementById('lic-metric-4');
  const marker = document.getElementById('lic-marker');

  const layersData = [
    {
      tag: 'STRATA 01 / 04',
      title: 'Decoupled Substrate & Vibration Void',
      desc: 'An isolated 50mm air cavity separated from the external masonry shell by elastomeric mounting pads. This completely cancels urban street traffic vibrations in the sub-20 Hz frequency spectrum.',
      m1: '-28 dB @ 16 Hz',
      m2: '50 mm Air Cavity',
      m3: 'α = 0.92',
      m4: '± 0.5 mm CNC',
      x: 70,
      y: 160,
    },
    {
      tag: 'STRATA 02 / 04',
      title: 'Resilient Channels & Acoustic Fleece',
      desc: 'Cold-rolled zinc steel channels suspended on acoustic neoprene hangers with 40mm recycled textile fleece. Converts airborne pressure waves into thermal friction.',
      m1: 'NRC 0.95',
      m2: '40 mm Mineral Fleece',
      m3: 'α = 0.88 @ 500 Hz',
      m4: 'Flame Retardant B1',
      x: 125,
      y: 160,
    },
    {
      tag: 'STRATA 03 / 04',
      title: 'Micro-Perforated Smoked Walnut Diffusers',
      desc: 'Variable-depth architectural timber blades staggered at 20mm, 45mm, and 80mm intervals. Designed to diffuse flutter echoes and provide intimate acoustic warmth without deadening spoken voice.',
      m1: '14,000 Micro-Holes',
      m2: '20–80 mm Slat Depth',
      m3: 'RT60 = 0.32s',
      m4: 'Vacuum Pyrolysis 180°C',
      x: 210,
      y: 160,
    },
    {
      tag: 'STRATA 04 / 04',
      title: 'Honed Swiss Basalt & Bronze Interface',
      desc: 'Monolithic Graubünden basalt plinth with a 120mm cantilevered bullnose edge. Incorporates an architectural bronze shadow gap with recessed low-voltage LED task illumination.',
      m1: '2,800 kg/m³ Density',
      m2: '120 mm Cantilever',
      m3: 'Zero Reverb Resonance',
      m4: 'Hand-Rubbed Liver of Sulphur',
      x: 390,
      y: 180,
    },
  ];

  const tabHandlers: Array<{ btn: HTMLButtonElement; fn: () => void }> = [];
  tabBtns.forEach((btn) => {
    const fn = () => {
      const idx = parseInt(btn.dataset.layer || '0', 10);
      tabBtns.forEach((b) => b.classList.toggle('active', b === btn));
      const data = layersData[idx];
      if (data) {
        if (infoTag) infoTag.textContent = data.tag;
        if (infoTitle) infoTitle.textContent = data.title;
        if (infoDesc) infoDesc.textContent = data.desc;
        if (m1) m1.textContent = data.m1;
        if (m2) m2.textContent = data.m2;
        if (m3) m3.textContent = data.m3;
        if (m4) m4.textContent = data.m4;
        if (marker) marker.setAttribute('transform', `translate(${data.x}, ${data.y})`);
      }
    };
    btn.addEventListener('click', fn);
    tabHandlers.push({ btn, fn });
  });

  // Lighting scenario toggles
  const alcBtns = targetEl.querySelectorAll<HTMLButtonElement>('.alc-btn');
  const beamGolden = document.getElementById('alc-beam-golden');
  const beamPendant = document.getElementById('alc-beam-pendant');
  const statusTag = document.getElementById('alc-status-tag');

  const alcHandlers: Array<{ btn: HTMLButtonElement; fn: () => void }> = [];
  alcBtns.forEach((btn) => {
    const fn = () => {
      alcBtns.forEach((b) => b.classList.toggle('active', b === btn));
      const mode = btn.dataset.mode;
      if (mode === 'golden') {
        if (beamGolden) beamGolden.style.display = 'block';
        if (beamPendant) beamPendant.style.display = 'none';
        if (statusTag) statusTag.textContent = 'ACTIVE: 17:45 LOW RAKING SUNBEAM (18° GRAZE)';
      } else if (mode === 'pendant') {
        if (beamGolden) beamGolden.style.display = 'none';
        if (beamPendant) beamPendant.style.display = 'block';
        if (statusTag) statusTag.textContent = 'ACTIVE: FOCUSED ARCHITECTURAL BRONZE DOWNLIGHT';
      } else {
        if (beamGolden) beamGolden.style.display = 'none';
        if (beamPendant) beamPendant.style.display = 'none';
        if (statusTag) statusTag.textContent = 'ACTIVE: DIFFUSE SOFT ATELIER TWILIGHT';
      }
    };
    btn.addEventListener('click', fn);
    alcHandlers.push({ btn, fn });
  });

  return () => {
    cleanupSlider();
    cleanupAnimations();
    tabHandlers.forEach(({ btn, fn }) => btn.removeEventListener('click', fn));
    alcHandlers.forEach(({ btn, fn }) => btn.removeEventListener('click', fn));
  };
}

/* ========================================================================= */
/* CASE STUDY 3: THE MONOLITHIC CLOISTER (Mass & Shadow)                     */
/* ========================================================================= */
function renderMonolithicCloisterCaseStudy(targetEl: HTMLElement, project: ProjectItem, prevProject: ProjectItem, nextProject: ProjectItem): () => void {
  targetEl.innerHTML = `
    <div class="project-detail-container cs-cloister">
      <nav class="pd-top-nav">
        <a href="/projects" class="pd-back-link" data-link>← Back to Selected Works</a>
        <div class="pd-top-meta">
          <span class="coord-tag">BASEL BORDERLANDS · 47°33'N 7°35'E</span>
          <span class="sep">/</span>
          <span>${project.category}</span>
          <span class="sep">/</span>
          <span>${project.area}</span>
        </div>
      </nav>

      <!-- Monumental Concrete & Shadow Hero -->
      <section class="cs-hero cs-hero-cloister" aria-labelledby="cloister-title">
        <div class="cs-eyebrow-pill cs-eyebrow-cloister">CASE STUDY 03 · MASS & SHADOW</div>
        <h1 class="cs-title cs-title-cloister" id="cloister-title">${splitHeadingWords(project.title)}</h1>
        <p class="cs-tagline cs-tagline-cloister">${project.tagline}</p>
        <p class="cs-lead-desc cs-lead-cloister">
          A monumental contemplation pavilion cast in board-formed white Portland concrete. A continuous 360° clerestory light well separates roof from walls, washing raking morning light across textured aggregate and a floating silver travertine hearth.
        </p>

        <div class="cs-metric-pills cs-metric-cloister">
          <div class="cs-metric-pill"><b>12.00 × 7.50 M</b><span>Column-Free Span</span></div>
          <div class="cs-metric-pill"><b>3.80 M</b><span>Cast Coffer Void</span></div>
          <div class="cs-metric-pill"><b>480 Tonnes</b><span>Monolithic Mass</span></div>
          <div class="cs-metric-pill"><b>360° Slot</b><span>Continuous Clerestory</span></div>
        </div>
      </section>

      <!-- Signature Interaction 1: Split Drawing/Render Comparison Slider -->
      <section class="cs-section" aria-label="Split axonometric projection to monumental cloister comparison">
        <div class="cs-section-header">
          <span class="cs-section-num">01 · ARCHITECTURAL COMPARISON</span>
          <h2 class="cs-section-title" data-animate-words>${splitHeadingWords("Structural Axonometric Resolving into Chiaroscuro Chamber")}</h2>
          <p class="cs-section-sub">Drag the divider to observe how the 3D isometric structural geometry translates into board-formed white Portland concrete, 360° clerestory light well, and a monolithic travertine altar.</p>
        </div>

        <div class="pd-slider-wrap cloister-split-wrap" id="cloister-slider-wrap">
          <!-- Rendered Finished State (Bottom Layer) -->
          <div class="slider-layer built-layer">
            ${renderMonolithicCloisterBuiltSvg()}
            <span class="slider-badge sb-right">Monolithic Realization · Concrete & Travertine</span>
          </div>

          <!-- Structural Axonometric (Top Layer, Clipped) -->
          <div class="slider-layer plan-layer" id="cloister-reveal" style="clip-path: inset(0 50% 0 0);">
            ${renderProjectSvg(project, 2)}
            <span class="slider-badge sb-left">Axonometric Projection · 30° ISO</span>
          </div>

          <!-- Draggable Handle -->
          <div class="slider-handle" id="cloister-handle" style="left: 50%;">
            <div class="handle-bar"></div>
            <div class="handle-knob" aria-label="Drag comparison slider" role="slider" aria-valuenow="50">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M8 7l-5 5 5 5V7zm8 0v10l5-5-5-5z"/>
              </svg>
            </div>
          </div>
        </div>
        <p class="slider-instruction" id="cloister-slider-status">Drag horizontally · Revealing 50% structural axonometric linework against 50% chiaroscuro realization.</p>
        <div class="pd-slider-range-row">
          <label for="cloister-slider-range" class="pd-slider-range-lbl">Touch / Keyboard Scrubber:</label>
          <input type="range" id="cloister-slider-range" class="pd-slider-range-input" min="0" max="100" value="50" step="1" aria-label="Compare structural axonometric with chiaroscuro realization" />
        </div>
      </section>

      <!-- Signature Interaction 2: Progressive Volumetric Massing Reveal -->
      <section class="cs-section" aria-label="Progressive volumetric massing chamber">
        <div class="cs-section-header">
          <span class="cs-section-num">02 · VOLUMETRIC MASS ASSEMBLY</span>
          <h2 class="cs-section-title" data-animate-words>${splitHeadingWords("Vertical Progressive Volumetric Decomposition")}</h2>
          <p class="cs-section-sub">Step through each architectural volume below to understand the monumental casting sequence and structural cantilever tolerances.</p>
        </div>

        <div class="volumetric-chamber-card">
          <div class="vcc-stepper-row">
            <button type="button" class="vcc-step-btn active" data-step="0">Mass 01 · Plinth & Joints</button>
            <button type="button" class="vcc-step-btn" data-step="1">Mass 02 · Board-Marked Walls</button>
            <button type="button" class="vcc-step-btn" data-step="2">Mass 03 · 360° Clerestory Ribbon</button>
            <button type="button" class="vcc-step-btn" data-step="3">Mass 04 · Cantilevered Canopy</button>
          </div>

          <div class="vcc-viewport-box">
            ${renderProjectSvg(project, 2)}
          </div>

          <div class="vcc-readout-bar">
            <span class="vcc-readout-badge" id="vcc-readout-badge">STAGE 01: MONOLITHIC GROUND PLINTH</span>
            <p class="vcc-readout-text" id="vcc-readout-text">
              Cast-in-place terrazzo floor slab incorporating ground quartz aggregate and a 2.0 × 2.0 meter brass expansion joint grid. Radiant underfloor heating maintains continuous 18°C surface temperature.
            </p>
          </div>
        </div>
      </section>

      <!-- Signature Interaction 3: Dynamic Moving Shadow Line Controller -->
      <section class="cs-section" aria-label="Moving shadow line controller">
        <div class="cs-section-header">
          <span class="cs-section-num">03 · SHADOW KINEMATICS</span>
          <h2 class="cs-section-title" data-animate-words>${splitHeadingWords("High-Contrast Morning Shadow Line Simulation")}</h2>
          <p class="cs-section-sub">Scrub the sun dial to witness sharp geometric shadow edges moving across the board-marked concrete wall and terrazzo floor plane.</p>
        </div>

        <div class="shadow-controller-card">
          <div class="scc-top-controls">
            <div class="scc-knob-box">
              <span class="scc-label">Morning Sun Angle</span>
              <strong id="scc-angle-val">11:30 AM · 62° Elevation</strong>
            </div>
            <input type="range" id="cloister-shadow-slider" min="9" max="14" step="0.25" value="11.5" aria-label="Adjust morning solar shadow">
            <div class="scc-knob-box">
              <span class="scc-label">Shadow Contrast</span>
              <strong>100% Direct Crisp Edge</strong>
            </div>
          </div>

          <div class="scc-stage" id="cloister-shadow-stage">
            <div class="scc-shadow-polygon" id="scc-shadow-poly"></div>
            <div class="scc-travertine-hearth">
              <span>Silver Navona Travertine Monolith (3.20 × 1.20 M)</span>
            </div>
            <div class="scc-clerestory-ribbon">
              <span>Continuous 360° Clerestory Daylight Slot</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 04: Monumental Concrete Engineering -->
      <section class="cs-section" aria-label="Concrete structural engineering">
        <div class="cs-section-header">
          <span class="cs-section-num">04 · STRUCTURAL MASS</span>
          <h2 class="cs-section-title" data-animate-words>${splitHeadingWords("White Portland Concrete & Jointless Pouring")}</h2>
        </div>

        <div class="cloister-engineering-grid">
          <div class="ceg-card">
            <h4>Post-Tensioned Tendons</h4>
            <p>12-meter column-free roof slab held in equilibrium with 16 post-tensioned steel cable bundles cast directly inside self-compacting white concrete.</p>
            <span class="ceg-metric">1,200 kN Post-Tension Force</span>
          </div>
          <div class="ceg-card">
            <h4>Pine Board Formwork</h4>
            <p>Rough-sawn Swiss pine boards wire-brushed before pouring. Transfers organic grain ridges and knots permanently into the cured aggregate face.</p>
            <span class="ceg-metric">120 mm Board Width · 1.5 mm Relief</span>
          </div>
          <div class="ceg-card">
            <h4>Core Radiant Tempering</h4>
            <p>Cross-linked polyethylene loops embedded in the core aggregate prevent freeze-thaw micro-cracking across severe -15°C alpine winter cycles.</p>
            <span class="ceg-metric">Zero Expansion Joints Required</span>
          </div>
        </div>
      </section>

      <!-- Section 05: Specifications & 3D Launch -->
      <section class="cs-section cs-specs-section">
        <div class="pd-content-grid">
          <div class="pd-narrative-col">
            <div class="pd-narrative-block">
              <h3>Architectural Monumentality</h3>
              <p>${project.solution}</p>
            </div>
            <div class="pd-narrative-block">
              <h3>Travertine Quarry Extraction</h3>
              <p>The central altar monolith was cut from a single 8-tonne block of Silver Navona Travertine in Tivoli, dry-honed to preserve natural open vugs and fossil voids.</p>
            </div>
          </div>

          <aside class="pd-sidebar-col">
            <div class="pd-card">
              <h4>Monumental Specifications</h4>
              <dl class="pd-specs-dl">
                ${project.specs.items
                  .map(
                    (it) => `
                  <div><dt>${it.label}</dt><dd>${it.value}</dd></div>
                `,
                  )
                  .join('')}
              </dl>
            </div>

            <div class="pd-card">
              <h4>Heavy Mineral Palette</h4>
              <ul class="pd-mat-list">
                ${project.materialsUsed.map((m) => `<li><span class="bullet">▪</span> ${m}</li>`).join('')}
              </ul>
              <a href="/studio?pal=2&hour=11.5" class="cta pd-launch-btn" data-link>Launch Monolithic Cloister in 3D Studio →</a>
            </div>
          </aside>
        </div>
      </section>

      ${renderCaseStudyFooter(prevProject, nextProject)}
    </div>
  `;

  // Initialize Comparison Slider
  const cleanupSlider = setupComparisonSlider(
    targetEl,
    'cloister-slider-wrap',
    'cloister-reveal',
    'cloister-handle',
    'cloister-slider-status',
    'structural axonometric linework',
    'monolithic realization',
    'cloister-slider-range'
  );

  // Initialize Word Animations
  const cleanupAnimations = setupCaseStudyAnimations(targetEl, 'cloister-title');

  // Volumetric step buttons
  const stepBtns = targetEl.querySelectorAll<HTMLButtonElement>('.vcc-step-btn');
  const rBadge = document.getElementById('vcc-readout-badge');
  const rText = document.getElementById('vcc-readout-text');

  const stepData = [
    {
      badge: 'STAGE 01: MONOLITHIC GROUND PLINTH',
      text: 'Cast-in-place terrazzo floor slab incorporating ground quartz aggregate and a 2.0 × 2.0 meter brass expansion joint grid. Radiant underfloor heating maintains continuous 18°C surface temperature.',
    },
    {
      badge: 'STAGE 02: BOARD-MARKED WALL MASSES',
      text: 'Three intersecting structural concrete perimeter shear walls with rough-sawn timber grain impression. Cast tie-rod holes plugged with burnished lead caps.',
    },
    {
      badge: 'STAGE 03: 360° CONTINUOUS CLERESTORY VOID',
      text: 'A 600mm structural aperture separating the ceiling slab from all vertical load-bearing walls. High-performance structural silicone glazing creates the illusion of a floating roof.',
    },
    {
      badge: 'STAGE 04: CANTILEVERED COFFER CANOPY',
      text: 'Unreinforced 12-meter cantilever canopy with internal waffle coffer recesses. Center features the single 8-tonne block of Silver Navona Travertine with shadow reveal.',
    },
  ];

  const stepHandlers: Array<{ btn: HTMLButtonElement; fn: () => void }> = [];
  stepBtns.forEach((btn) => {
    const fn = () => {
      stepBtns.forEach((b) => b.classList.toggle('active', b === btn));
      const s = parseInt(btn.dataset.step || '0', 10);
      const d = stepData[s];
      if (d) {
        if (rBadge) rBadge.textContent = d.badge;
        if (rText) rText.textContent = d.text;
      }
    };
    btn.addEventListener('click', fn);
    stepHandlers.push({ btn, fn });
  });

  // Shadow kinematics slider
  const shadowSlider = document.getElementById('cloister-shadow-slider') as HTMLInputElement | null;
  const angleVal = document.getElementById('scc-angle-val');
  const shadowPoly = document.getElementById('scc-shadow-poly');

  const onShadowInput = () => {
    if (!shadowSlider) return;
    const val = parseFloat(shadowSlider.value);
    const elev = Math.round(35 + (val - 9) * 9.5);
    if (angleVal) angleVal.textContent = `${val.toFixed(2)} AM · ${elev}° Elevation`;

    if (shadowPoly) {
      // Animate skew and polygon width based on solar altitude
      const widthPct = Math.round(75 - (val - 9) * 9);
      const skewDeg = Math.round(-35 + (val - 9) * 14);
      shadowPoly.style.width = `${widthPct}%`;
      shadowPoly.style.transform = `skewX(${skewDeg}deg)`;
    }
  };
  shadowSlider?.addEventListener('input', onShadowInput);

  return () => {
    cleanupSlider();
    cleanupAnimations();
    shadowSlider?.removeEventListener('input', onShadowInput);
    stepHandlers.forEach(({ btn, fn }) => btn.removeEventListener('click', fn));
  };
}

/** Master Router for Project Detail Pages */
export function renderProjectDetail(targetEl: HTMLElement, slug: string): () => void {
  const project = PROJECTS.find((p) => p.slug === slug) || PROJECTS[0];
  const idx = PROJECTS.indexOf(project);
  const prevProject = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
  const nextProject = PROJECTS[(idx + 1) % PROJECTS.length];

  if (project.slug === 'nordic-pavilion') {
    return renderNordicPavilionCaseStudy(targetEl, project, prevProject, nextProject);
  } else if (project.slug === 'walnut-atelier') {
    return renderSmokedAtelierCaseStudy(targetEl, project, prevProject, nextProject);
  } else if (project.slug === 'concrete-cloister') {
    return renderMonolithicCloisterCaseStudy(targetEl, project, prevProject, nextProject);
  } else {
    return renderNordicPavilionCaseStudy(targetEl, project, prevProject, nextProject);
  }
}
