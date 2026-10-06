// Remove textos por id (ex.: lote dtogo poluído). Uso: node scripts/remove-ids.mjs <seed> [keep-substring]
import { readFileSync, writeFileSync } from 'node:fs';
const seed = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const keep = new Set((process.argv[3] ?? '').split(',').filter(Boolean));
const ids = new Set(seed.map((e) => e.id).filter((id) => !keep.has(id)));
const p = './src/data/content.ts';
const s = readFileSync(p, 'utf8');
const marker = 'export const texts:TextItem[]=';
const a = s.indexOf(marker) + marker.length;
const b = s.indexOf('] as TextItem[]', a) + 1;
const arr = JSON.parse(s.slice(a, b));
const kept = arr.filter((t) => !ids.has(t.id));
writeFileSync(p, s.slice(0, a) + JSON.stringify(kept, null, 2) + s.slice(b));
console.log(`${arr.length} -> ${kept.length} (removidos: ${arr.length - kept.length})`);
