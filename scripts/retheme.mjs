// Retematização: paleta CIANO -> VERDE HUD TÁTICO (igual ao icone/splash).
// Mantém cores semânticas (vermelho de erro, amarelo/laranja dos marcadores do mapa).
// Uso: node scripts/retheme.mjs
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const files = [
  'src/styles/globalStyles.js',
  'src/screens/HomeScreen.js',
  'src/screens/GpsScreen.js',
  'src/screens/HistoricoScreen.js',
  'src/screens/MapaScreen.js',
  'src/screens/TodoScreen.js',
  'src/screens/PerfilScreen.js',
  'src/components/Header.js',
  'src/map/mapTemplate.js',
];

// Mapeamento hex (case-insensitive). Valores semânticos NÃO entram aqui.
const map = {
  '#00e5ff': '#00FF66', // accent primario (ciano -> verde HUD)
  '#00b4cc': '#00C24E', // accent escuro
  '#07090f': '#0B0F0C', // fundo / texto escuro sobre botao claro
  '#0a0f1a': '#0E1411', // fundo de input
  '#0b1019': '#12181A', // fundo de card
  '#2a4060': '#2E6B45', // borda/texto dim
  '#3a5268': '#356B49', // texto dim secundario
  '#2a5070': '#2E6B45', // borda
  '#2a3a4a': '#23502F', // muted
  '#4a6a7a': '#356B49', // muted
  '#c5dce8': '#C2E8CE', // texto claro
  '#a2a8d3': '#7FB89A', // texto muted (telas antigas)
  '#6b7aa1': '#5C8C6E', // texto muted (telas antigas)
  '#1a1a1a': '#0B0F0C', // fundo do mapa
  '#e94560': '#00FF66', // titulo antigo (Header)
};

let totalFiles = 0, totalReps = 0;
for (const rel of files) {
  const p = join(root, rel);
  let src;
  try { src = readFileSync(p, 'utf8'); } catch { console.log('skip (nao existe):', rel); continue; }
  let out = src;
  let reps = 0;

  // rgba ciano translucido -> rgba verde translucido (preserva alpha)
  out = out.replace(/rgba\(\s*0\s*,\s*229\s*,\s*255/gi, (m) => { reps++; return 'rgba(0, 255, 102'; });

  // hex
  for (const [from, to] of Object.entries(map)) {
    const re = new RegExp(from.replace('#', '#'), 'gi');
    out = out.replace(re, () => { reps++; return to; });
  }

  if (out !== src) {
    writeFileSync(p, out, 'utf8');
    totalFiles++; totalReps += reps;
    console.log(`OK  ${rel}  (${reps} substituicoes)`);
  } else {
    console.log(`--  ${rel}  (sem mudancas)`);
  }
}
console.log(`\nConcluido: ${totalReps} substituicoes em ${totalFiles} arquivos.`);
