export type ThreeNS = typeof import('three');

export interface MaterialPalette {
  id: number;
  code: string;
  name: string;
  floorTint: number;
  floorRough: number;
  wallTint: number;
  wallRough: number;
  rugColor: number;
  sofaColor: number;
  cushionColor: number;
  accentColor: number;
  tableTopColor: number;
  potColor: number;
  leafColor: number;
}

export const PALETTES: MaterialPalette[] = [
  {
    id: 0,
    code: '01',
    name: 'Nordic Oak & Plaster',
    floorTint: 0xffffff,
    floorRough: 0.44,
    wallTint: 0xffffff,
    wallRough: 0.9,
    rugColor: 0x2f3b48,
    sofaColor: 0x8d8372,
    cushionColor: 0x9a9080,
    accentColor: 0xa95d3c,
    tableTopColor: 0x5b3d28,
    potColor: 0xcfc6b6,
    leafColor: 0x3f5c3d,
  },
  {
    id: 1,
    code: '02',
    name: 'Smoked Walnut & Travertine',
    floorTint: 0x9e7b60,
    floorRough: 0.36,
    wallTint: 0xeae0d0,
    wallRough: 0.82,
    rugColor: 0x23211f,
    sofaColor: 0x704932,
    cushionColor: 0x825940,
    accentColor: 0xc89d54,
    tableTopColor: 0xd8cebe,
    potColor: 0x3a3530,
    leafColor: 0x364f35,
  },
  {
    id: 2,
    code: '03',
    name: 'Architectural Concrete & Slate',
    floorTint: 0xd4cfc7,
    floorRough: 0.52,
    wallTint: 0xc8c3ba,
    wallRough: 0.88,
    rugColor: 0x354238,
    sofaColor: 0xc4bdb0,
    cushionColor: 0xd2cbc0,
    accentColor: 0x7d4e38,
    tableTopColor: 0x2b2927,
    potColor: 0xded8cc,
    leafColor: 0x456343,
  },
];

const tex = (THREE: ThreeNS, draw: (x: CanvasRenderingContext2D) => void, rx: number, ry: number) => {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const x = c.getContext('2d')!;
  draw(x);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = 8;
  t.encoding = THREE.sRGBEncoding;
  return t;
};

export const makeWood = (THREE: ThreeNS) =>
  tex(
    THREE,
    (x) => {
      for (let i = 0; i < 8; i++) {
        x.fillStyle = `hsl(28,${38 + Math.random() * 8}%,${46 + Math.random() * 10}%)`;
        x.fillRect(0, i * 64, 512, 64);
        for (let k = 0; k < 85; k++) {
          x.strokeStyle = `rgba(60,35,15,${Math.random() * 0.14})`;
          x.beginPath();
          const y = i * 64 + Math.random() * 64;
          x.moveTo(0, y);
          x.lineTo(512, y + (Math.random() - 0.5) * 6);
          x.stroke();
        }
        x.fillStyle = 'rgba(30,18,8,.42)';
        x.fillRect(0, i * 64, 512, 2);
        x.fillRect(Math.random() * 512, i * 64, 2, 64);
      }
    },
    2,
    1.5,
  );

export const makePlaster = (THREE: ThreeNS) =>
  tex(
    THREE,
    (x) => {
      x.fillStyle = '#d9d1c3';
      x.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 5500; i++) {
        x.fillStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '80,70,60'},${Math.random() * 0.05})`;
        x.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
      }
    },
    3,
    2,
  );
