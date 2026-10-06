// Gera sync/lingua-pack.json: banco inteiro num arquivo só.
// Transfira ao celular (USB/WhatsApp/Drive) e importe em
// Ajustes → Atualização de conteúdo → Importar pacote. 100% offline.
// Uso: node scripts/pack-content.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(root, 'sync/manifest.json'), 'utf8'));
const src = readFileSync(join(root, 'src/data/content.ts'), 'utf8');
const marker = 'export const texts:TextItem[]=';
const start = src.indexOf(marker) + marker.length;
const end = src.indexOf('] as TextItem[]', start) + 1;
const texts = JSON.parse(src.slice(start, end).trim());
writeFileSync(join(root, 'sync/lingua-pack.json'), JSON.stringify({ ...manifest, texts }) + '\n');
console.log(`pack ok: ${texts.length} textos em sync/lingua-pack.json`);
