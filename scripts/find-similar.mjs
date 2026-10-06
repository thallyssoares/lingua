import { readFileSync } from 'node:fs';
const s = readFileSync('./src/data/content.ts', 'utf8');
const a = s.indexOf('export const texts:TextItem[]=') + 30;
const b = s.indexOf('] as TextItem[]', a) + 1;
const T = JSON.parse(s.slice(a, b));
const W = (x) => new Set(x.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean));
const S = (x, y) => { const A = W(x), B = W(y); let n = 0; for (const w of A) if (B.has(w)) n++; return n / Math.max(1, Math.min(A.size, B.size)); };
for (let i = 0; i < T.length; i++)
  for (let j = i + 1; j < T.length; j++) {
    const v = S(T[i].content, T[j].content);
    if (v >= 0.9) console.log(v.toFixed(3), T[i].id, T[i].content.split(' ').length, '|', T[j].id, T[j].content.split(' ').length);
  }
