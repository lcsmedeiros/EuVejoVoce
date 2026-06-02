// Gera os PNGs de icone/splash a partir dos SVGs em /assets usando sharp.
// Uso: node scripts/gen-assets.mjs
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const A = (f) => join(root, 'assets', f);

const jobs = [
  { src: 'icon.svg',          out: 'icon.png',          w: 1024, h: 1024 },
  { src: 'adaptive-icon.svg', out: 'adaptive-icon.png', w: 1024, h: 1024 },
  { src: 'splash-icon.svg',   out: 'splash-icon.png',   w: 760,  h: 940  },
  // favicon web (opcional)
  { src: 'icon.svg',          out: 'favicon.png',       w: 48,   h: 48   },
];

for (const j of jobs) {
  const svg = readFileSync(A(j.src));
  await sharp(svg, { density: 384 })
    .resize(j.w, j.h, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(A(j.out));
  console.log(`OK  ${j.src} -> ${j.out}  (${j.w}x${j.h})`);
}
console.log('Concluido.');
