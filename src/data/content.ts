export interface ProjectSpecItem {
  label: string;
  value: string;
}

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: 'Residential' | 'Commercial' | 'Pavilion';
  year: string;
  location: string;
  area: string;
  drawingType: string;
  accentColor: string;
  accentRgb: string;
  specs: {
    dimensions: string;
    ceiling: string;
    primaryTimber: string;
    glazing: string;
    items: ProjectSpecItem[];
  };
  paletteIdx: number;
  solarHour: number;
  concept: string;
  challenges: string;
  solution: string;
  materialsUsed: string[];
}

export const PROJECTS: ProjectItem[] = [
  {
    id: 'p-01',
    slug: 'nordic-pavilion',
    title: 'The Courtyard Pavilion',
    tagline: 'Seasoned teak, mineral lime plaster, and low raking solar geometry.',
    category: 'Residential',
    year: '2025',
    location: 'Patna Riverfront, Bihar, India',
    area: '240 m²',
    drawingType: 'Orthographic Plan · Solar Azimuth 194°',
    accentColor: '#dfba73',
    accentRgb: '223, 186, 115',
    specs: {
      dimensions: '8.40 × 6.20 M (Living Pavilion)',
      ceiling: '3.20 M Exposed Timber Joists',
      primaryTimber: 'Quarter-Sawn Seasoned Teak',
      glazing: 'Triple Low-E (2.40 × 1.70 M)',
      items: [
        { label: 'Living Pavilion', value: '8.40 × 6.20 M' },
        { label: 'Vertical Datum', value: '3.20 M Exposed Joists' },
        { label: 'Primary Timber', value: 'Quarter-Sawn Seasoned Teak' },
        { label: 'Fenestration', value: 'Triple Low-E (2.40 × 1.70 M)' },
      ],
    },
    paletteIdx: 0,
    solarHour: 14.5,
    concept: 'A low-slung residential pavilion organized around an open central courtyard along a raking noon-to-dusk solar axis. Framed in seasoned Indian teak timber and hand-trowelled mineral plaster, the living volume dissolves into landscape bedrock through deep shaded verandas and corner glass apertures.',
    challenges: 'Balancing intense monsoon precipitation and high summer heat while keeping 40% of the south-west perimeter open to natural cross-ventilation and unobstructed river views.',
    solution: 'Deep thermal mass in mineral lime perimeter walls, triple-pane argon perimeter glazing, and an insulated timber raft floating over radiant cooling screed.',
    materialsUsed: ['Seasoned Indian Teak', 'Hand-Trowelled Lime Plaster', 'Cold-Blackened Steel', 'Handloom Cotton Bouclé'],
  },
  {
    id: 'p-02',
    slug: 'walnut-atelier',
    title: 'The Smoked Atelier',
    tagline: 'Thermo-treated walnut grain, monolithic basalt, and golden-hour light modulation.',
    category: 'Commercial',
    year: '2024',
    location: 'Patna, Bihar, India',
    area: '185 m²',
    drawingType: 'Transverse Wall Section · Decibel Profile',
    accentColor: '#d89658',
    accentRgb: '216, 150, 88',
    specs: {
      dimensions: '7.80 × 5.80 M Studio Envelope',
      ceiling: '3.40 M Acoustic Baffle Clouds',
      primaryTimber: 'American Smoked Walnut',
      glazing: 'Acoustic Double Casement (3.10 × 2.10 M)',
      items: [
        { label: 'Studio Envelope', value: '7.80 × 5.80 M Clear' },
        { label: 'Acoustic Clearance', value: '3.40 M Baffle Clouds' },
        { label: 'Primary Medium', value: 'Thermo-Treated Smoked Walnut' },
        { label: 'Reverb Decay', value: 'RT60 = 0.32s Controlled' },
      ],
    },
    paletteIdx: 1,
    solarHour: 17.75,
    concept: 'A high-precision listening laboratory and executive design atelier carved from deep walnut millwork. Micro-perforated acoustic blades absorb early reflections while warm bronze hardware catches 17:45 golden-hour raking light.',
    challenges: 'Attenuating external urban street traffic rumble and high ambient noise along city avenues without dropped drywall ceilings or visible commercial foam acoustic panels.',
    solution: 'Decoupled floating structural timber shell with continuous concealed air cavities behind staggered walnut baffle blades, preserving uninterrupted architectural planes.',
    materialsUsed: ['Smoked Walnut Millwork', 'Honed Indian Basalt Plinth', 'Burnished Architectural Bronze', 'Handloom Bouclé Textile'],
  },
  {
    id: 'p-03',
    slug: 'concrete-cloister',
    title: 'The Monolithic Cloister',
    tagline: 'Board-formed concrete, Dholpur silver sandstone planes, and cast raking morning shadows.',
    category: 'Pavilion',
    year: '2024',
    location: 'Bodh Gaya, Bihar, India',
    area: '320 m²',
    drawingType: 'Isometric 3D Projection · Solar Cut',
    accentColor: '#cbd5e1',
    accentRgb: '203, 213, 225',
    specs: {
      dimensions: '12.00 × 7.50 M Column-Free Hall',
      ceiling: '3.80 M Cast Waffle Coffer',
      primaryTimber: 'Charred Timber Elements',
      glazing: 'Structural Clerestory Ribbon',
      items: [
        { label: 'Column-Free Span', value: '12.00 × 7.50 M Hall' },
        { label: 'Coffer Clearance', value: '3.80 M Cast Coffer Void' },
        { label: 'Structural Medium', value: 'Board-Formed White Concrete' },
        { label: 'Daylighting', value: '360° Continuous Clerestory' },
      ],
    },
    paletteIdx: 2,
    solarHour: 11.5,
    concept: 'A monumental contemplation pavilion cast in monolithic white Portland concrete. A continuous 360° clerestory light well separates roof from walls, washing raking morning light across textured aggregate and a floating Dholpur sandstone hearth.',
    challenges: 'Pouring a 12-meter seamless unreinforced cantilevered roof slab resilient across severe sub-continental temperature swings.',
    solution: 'Self-compacting aggregate with post-tensioned tendon cables and internal radiant core tempering cast directly into the structural slab.',
    materialsUsed: ['Board-Marked Concrete', 'Dholpur Sandstone Plinth', 'Cast Iron Detailing', 'Bleached Heavy Linen'],
  },
];
