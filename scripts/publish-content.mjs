// Gera o pacote de atualização OTA em sync/: manifest.json + texts/*.json.
// Hospede o conteúdo de sync/ em qualquer arquivo estático HTTPS
// (ex.: GitHub Pages, Cloudflare R2, Netlify) e aponte o app para
// https://seu-host/lingua/manifest.json em Ajustes → Atualização de conteúdo.
// Uso: node scripts/publish-content.mjs [outDir=sync]
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, process.argv[2] ?? 'sync');
const src = readFileSync(join(root, 'src/data/content.ts'), 'utf8');
const marker = 'export const texts:TextItem[]=';
const start = src.indexOf(marker) + marker.length;
const end = src.indexOf('] as TextItem[]', start) + 1;
const texts = JSON.parse(src.slice(start, end).trim());

rmSync(outDir, { recursive: true, force: true });
mkdirSync(join(outDir, 'texts'), { recursive: true });
const metas = texts.map((t) => ({
  id: t.id,
  language: t.language,
  level: t.level,
  theme: t.theme,
  title: t.title,
  wordCount: t.wordCount,
  chapter: t.chapter,
  seriesId: t.seriesId,
  sourceUrl: t.sourceUrl,
  sourceSite: t.sourceSite,
  createdAt: t.createdAt,
  audioAvailable: t.audioAvailable,
  vocabCount: Object.keys(t.vocab ?? {}).length,
  excerpt: t.content.slice(0, 132),
}));
for (const t of texts) writeFileSync(join(outDir, 'texts', `${t.id}.json`), JSON.stringify(t) + '\n');
const version = `${texts.length}-${createHash('sha1').update(JSON.stringify(texts.map((t) => t.id))).digest('hex').slice(0, 8)}`;
writeFileSync(join(outDir, 'manifest.json'), JSON.stringify({ version, count: texts.length, metas }, null, 2) + '\n');
// CORS aberto: o WebView do app (origin capacitor://localhost) precisa disso
// para buscar o manifest em hosts como Netlify Drop. GitHub Pages já envia.
writeFileSync(join(outDir, '_headers'), '/*\n  Access-Control-Allow-Origin: *\n');
console.log(`sync ok: ${texts.length} textos, version=${version} -> ${outDir}`);
