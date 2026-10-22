export type ThreeNS = typeof import('three');

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
        for (let k = 0; k < 70; k++) {
          x.strokeStyle = `rgba(60,35,15,${Math.random() * 0.13})`;
          x.beginPath();
          const y = i * 64 + Math.random() * 64;
          x.moveTo(0, y);
          x.lineTo(512, y + (Math.random() - 0.5) * 6);
          x.stroke();
        }
        x.fillStyle = 'rgba(30,18,8,.4)';
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
      for (let i = 0; i < 5000; i++) {
        x.fillStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '80,70,60'},${Math.random() * 0.05})`;
        x.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
      }
    },
    3,
    2,
  );
