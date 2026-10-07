import { readFileSync, existsSync } from 'node:fs';
const h = readFileSync('./dist/index.html', 'utf8');
const refs = [...h.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]);
console.log('refs:', refs);
for (const r of refs) console.log(r, existsSync('./dist' + r) ? 'OK' : 'FALTANDO');
