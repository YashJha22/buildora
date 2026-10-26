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
    tagline: 'Seasoned teak, warm lime plaster, and natural afternoon light.',
    category: 'Residential',
    year: '2025',
    location: 'Patna Riverfront, Bihar, India',
    area: '240 m²',
    drawingType: 'Floor Plan · Solar Azimuth 194°',
    accentColor: '#dfba73',
    accentRgb: '223, 186, 115',
    specs: {
      dimensions: '8.40 × 6.20 M (Living Pavilion)',
      ceiling: '3.20 M Exposed Timber Joists',
      primaryTimber: 'Quarter-Sawn Seasoned Teak',
      glazing: 'Triple Low-E (2.40 × 1.70 M)',
      items: [
        { label: 'Living Pavilion', value: '8.40 × 6.20 M' },
        { label: 'Ceiling Height', value: '3.20 M Exposed Joists' },
        { label: 'Primary Timber', value: 'Quarter-Sawn Seasoned Teak' },
        { label: 'Corner Window', value: 'Triple Low-E (2.40 × 1.70 M)' },
      ],
    },
    paletteIdx: 0,
    solarHour: 14.5,
    concept: 'A quiet riverside home built around an open central courtyard. Framed in seasoned Indian teak and hand-finished lime plaster, the main living room opens onto shaded verandas and wide river views.',
    challenges: 'Keeping the home cool during summer heat and heavy monsoons while leaving the southwest walls open to fresh breezes and river views.',
    solution: 'Thick lime-plaster walls, triple-pane insulated glass, and a raised timber floor over a cooled stone slab.',
    materialsUsed: ['Seasoned Indian Teak', 'Hand-Trowelled Lime Plaster', 'Cold-Blackened Steel', 'Handloom Cotton Bouclé'],
  },
  {
    id: 'p-02',
    slug: 'walnut-atelier',
    title: 'The Smoked Atelier',
    tagline: 'Smoked walnut woodwork, honed basalt stone, and warm golden-hour light.',
    category: 'Commercial',
    year: '2024',
    location: 'Patna, Bihar, India',
    area: '185 m²',
    drawingType: 'Wall Section · Acoustic Profile',
    accentColor: '#d89658',
    accentRgb: '216, 150, 88',
    specs: {
      dimensions: '7.80 × 5.80 M Studio Envelope',
      ceiling: '3.40 M Acoustic Baffle Clouds',
      primaryTimber: 'American Smoked Walnut',
      glazing: 'Acoustic Double Casement (3.10 × 2.10 M)',
      items: [
        { label: 'Studio Room', value: '7.80 × 5.80 M Clear' },
        { label: 'Ceiling Height', value: '3.40 M Baffle Clouds' },
        { label: 'Primary Wood', value: 'Smoked Walnut Millwork' },
        { label: 'Sound Decay', value: 'RT60 = 0.32s Controlled' },
      ],
    },
    paletteIdx: 1,
    solarHour: 17.75,
    concept: 'A quiet listening room and private design studio crafted from deep walnut timber. Slatted wood panels absorb echo naturally while warm bronze details catch the 5:45 PM sunset light.',
    challenges: 'Blocking outside street traffic noise without using dropped ceilings or exposed foam panels.',
    solution: 'A sound-isolated timber shell with hidden air chambers behind custom walnut slats, keeping every wall clean and seamless.',
    materialsUsed: ['Smoked Walnut Millwork', 'Honed Indian Basalt Plinth', 'Burnished Architectural Bronze', 'Handloom Bouclé Textile'],
  },
  {
    id: 'p-03',
    slug: 'concrete-cloister',
    title: 'The Monolithic Cloister',
    tagline: 'Board-formed white concrete, Dholpur sandstone, and soft morning shadows.',
    category: 'Pavilion',
    year: '2024',
    location: 'Bodh Gaya, Bihar, India',
    area: '320 m²',
    drawingType: '3D Isometric · Solar Cut',
    accentColor: '#cbd5e1',
    accentRgb: '203, 213, 225',
    specs: {
      dimensions: '12.00 × 7.50 M Column-Free Hall',
      ceiling: '3.80 M Cast Waffle Coffer',
      primaryTimber: 'Charred Timber Elements',
      glazing: 'Structural Clerestory Ribbon',
      items: [
        { label: 'Open Hall Span', value: '12.00 × 7.50 M Hall' },
        { label: 'Ceiling Height', value: '3.80 M Cast Coffer' },
        { label: 'Primary Structure', value: 'Board-Formed White Concrete' },
        { label: 'Natural Light', value: '360° Wrap-Around Skylight' },
      ],
    },
    paletteIdx: 2,
    solarHour: 11.5,
    concept: 'A peaceful contemplation pavilion cast in textured white concrete. A continuous wrap-around skylight separates the roof from the walls, washing morning sun across the stone hearth.',
    challenges: 'Pouring a 12-meter column-free roof slab that withstands extreme seasonal temperature shifts.',
    solution: 'High-strength tensioned concrete with built-in thermal cooling pipes cast directly inside the structural roof slab.',
    materialsUsed: ['Board-Marked Concrete', 'Dholpur Sandstone Plinth', 'Cast Iron Detailing', 'Bleached Heavy Linen'],
  },
];
