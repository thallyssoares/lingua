// Completa vocabulário (<7) e retenta traduções fallback. Idempotente.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const STOP = new Set((readFileSync(join(root, 'scripts/bulk-ingest.mjs'), 'utf8').match(/new Set\(\('(.*?)'\)/)?.[1] ?? '').split(','));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cachePath = join(root, 'scripts/.translation-cache.json');
const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, 'utf8')) : {};
const saveCache = () => writeFileSync(cachePath, JSON.stringify(cache, null, 2) + '\n');
const PAIR = { en: 'en|pt', de: 'de|pt', es: 'es|pt', ru: 'ru|pt' };
async function translateGoogle(word, lang) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${lang}&tl=pt-BR&dt=t&q=${encodeURIComponent(word)}`;
    const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
    const data = await res.json();
    const t = (data?.[0]?.map((x) => x[0]).join(' ') ?? '').trim();
    await sleep(400);
    if (t && t.toLowerCase() !== word.toLowerCase()) return t;
  } catch {}
  return null;
}
async function translatePt(word, lang, force = false) {
  const key = `${lang}:${word.toLowerCase()}`;
  if (!force && cache[key] && cache[key] !== word) return cache[key];
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${PAIR[lang]}`, { headers: { 'user-agent': 'Mozilla/5.0' } });
    const data = await res.json();
    const t = (data?.responseData?.translatedText ?? '').trim();
    if (t && t.toLowerCase() !== word.toLowerCase() && !/query length limit|invalid|mymemory|usage|limit.*hour/i.test(t)) {
      cache[key] = t; saveCache(); await sleep(350); return t;
    }
  } catch {}
  // MyMemory falhou/cota esgotada → tenta Google gtx (grátis, sem chave)
  const g = await translateGoogle(word, lang);
  if (g) { cache[key] = g; saveCache(); return g; }
  await sleep(350);
  return null;
}
function candidates(content, lang, have, n) {
  const freq = new Map();
  for (const tok of content.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}\s-]/gu, ' ').split(/\s+/).filter(Boolean)) {
    const t = tok.replace(/^-+|-+$/g, '');
    if (t.length < (lang === 'ru' ? 4 : 5) || STOP.has(t) || /^\d+$/.test(t) || have.has(t)) continue;
    freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  return [...freq.entries()].sort((a, b) => b[1] * b[0].length - a[1] * a[0].length).slice(0, n).map(([w]) => w);
}
const path = join(root, 'src/data/content.ts');
const file = readFileSync(path, 'utf8');
const marker = 'export const texts:TextItem[]=';
const a = file.indexOf(marker) + marker.length;
const b = file.indexOf('] as TextItem[]', a) + 1;
const texts = JSON.parse(file.slice(a, b));
for (const t of texts) {
  const haveForms = new Set(Object.keys(t.vocab).map((k) => k.toLowerCase()));
  const haveLemmas = new Set(Object.values(t.vocab).map((v) => v.lemma.toLowerCase()));
  const sents = t.content.split(/(?<=[.!?。！？…])\s+/).map((s) => s.trim()).filter(Boolean);
  // 1) retenta fallbacks
  for (const [form, v] of Object.entries(t.vocab)) {
    if (v.translation === v.word || !v.translation) {
      const tr = await translatePt(v.lemma, t.language, true);
      if (tr) { v.translation = tr; console.log(`traduzido ${t.id}: ${v.word} = ${tr}`); }
      else console.log(`segue fallback ${t.id}: ${v.word}`);
    }
  }
  // 2) completa até 7
  const need = 7 - Object.keys(t.vocab).length;
  if (need > 0) {
    for (const w of candidates(t.content, t.language, new Set([...haveForms, ...haveLemmas]), need + 3)) {
      if (Object.keys(t.vocab).length >= 7) break;
      const m = t.content.match(new RegExp(`[\\p{L}]*${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\p{L}]*`, 'iu'));
      const form = m ? m[0] : w;
      if (haveForms.has(form.toLowerCase())) continue;
      const tr = (await translatePt(w, t.language)) ?? w;
      t.vocab[form] = { word: form, lemma: w, translation: tr, partOfSpeech: 'other', example: sents.find((s) => s.toLowerCase().includes(w.toLowerCase())) ?? sents[0], pronunciation: '' };
      haveForms.add(form.toLowerCase());
      console.log(`completado ${t.id}: ${form} = ${tr}`);
    }
  }
}
writeFileSync(path, file.slice(0, a) + JSON.stringify(texts, null, 2) + file.slice(b));
execSync('node scripts/split-content.mjs', { cwd: root, stdio: 'inherit' });
console.log('fill ok');
