// Auditoria legível do banco: distribuição, vocabulário, fallbacks de tradução.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'src/data/content.ts'), 'utf8');
const marker = 'export const texts:TextItem[]=';
const start = src.indexOf(marker) + marker.length;
const end = src.indexOf('] as TextItem[]', start) + 1;
const texts = JSON.parse(src.slice(start, end));
console.log(`TOTAL: ${texts.length}`);
const dist = {};
for (const t of texts) {
  const k = `${t.language}-${t.level}`;
  dist[k] = (dist[k] ?? 0) + 1;
}
console.log('distribuição:', JSON.stringify(dist));
let thin = [], fallback = 0, noSrc = 0;
for (const t of texts) {
  if (Object.keys(t.vocab).length < 7) thin.push(`${t.id} (${Object.keys(t.vocab).length})`);
  for (const v of Object.values(t.vocab)) if (v.translation === v.word || !v.translation) fallback++;
  if (!t.sourceUrl) noSrc++;
}
console.log('vocab<7:', thin.length ? thin : 'nenhum');
console.log('traduções fallback:', fallback);
console.log('sem fonte:', noSrc);
const wc = texts.map((t) => t.content.split(/\s+/).length);
console.log(`palavras: min=${Math.min(...wc)} max=${Math.max(...wc)} média=${Math.round(wc.reduce((a, b) => a + b, 0) / wc.length)}`);
