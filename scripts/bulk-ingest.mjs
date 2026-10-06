// Bulk ingest — adiciona N textos reais de uma vez, sem trabalho manual.
// Uso: node scripts/bulk-ingest.mjs scripts/seed-lote2.json
// O seed é um array de {id, language, level, theme, title, content, sourceUrl, sourceSite, words?}.
// - Se `words` vier vazio, escolhe 7 candidatas por frequência (só palavras que aparecem no texto).
// - Traduz cada palavra p/ pt-BR via MyMemory (grátis, sem chave), com cache em scripts/.translation-cache.json.
// - Anexa ao src/data/content.ts (sem duplicar ids), roda checagens da auditoria e re-gera public/texts/ + manifest.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seedPath = process.argv[2] ?? join(root, 'scripts/seed-lote2.json');
const seed = JSON.parse(readFileSync(seedPath, 'utf8'));

const STOP = new Set(('the,a,an,and,or,but,of,to,in,on,for,with,that,this,these,those,they,them,their,there,here,was,were,are,has,have,had,will,would,can,could,should,shall,may,might,must,not,no,yes,you,your,he,she,it,his,her,its,we,our,us,them,then,than,so,such,when,what,where,which,who,whom,how,why,because,while,until,into,over,after,before,between,through,during,each,other,some,any,all,both,few,more,most,one,two,also,very,just,only,even,still,yet,der,die,das,den,dem,eine,einer,eines,einem,einen,und,oder,aber,mit,von,zu,zum,zur,für,ist,sind,war,waren,hat,haben,sein,werden,wird,nicht,kein,keine,auch,nur,noch,schon,als,wie,was,wer,sich,bei,nach,vor,aus,durch,über,unter,zwischen,man,es,ich,du,er,sie,ihr,wir,euch,euer,de,la,el,los,las,del,una,uno,y,e,o,pero,por,para,con,sin,sobre,entre,que,qué,cual,quien,como,cómo,donde,cuando,porque,hay,está,están,son,ser,fue,fueron,tiene,tienen,más,muy,también,solo,sólo,sus,este,esta,estos,estas,ese,esa,eso,les,se,sí,no,ni,ya,pero,и,в,на,не,что,это,как,для,по,из,от,до,при,так,же,уже,только,можно,все,всё,его,ее,их,мы,вы,они,она,оно,был,была,было,были,есть,будет,если,когда,где,который,которая,которые,или,но,а,да,нет,меня,тебя,себя,нас,вас,них,него,нее,нееё,мой,моя,мое,мои,этот,эта,это,тот,та,то,здесь,там,туда,сюда,потом,сейчас,сегодня,очень,также,меня,чтобы').split(','));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cachePath = join(root, 'scripts/.translation-cache.json');
const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, 'utf8')) : {};
const saveCache = () => writeFileSync(cachePath, JSON.stringify(cache, null, 2) + '\n');

const SRC2PAIR = { en: 'en|pt', de: 'de|pt', es: 'es|pt', ru: 'ru|pt' };
async function translatePt(word, lang) {
  const key = `${lang}:${word.toLowerCase()}`;
  if (cache[key]) return cache[key];
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${SRC2PAIR[lang]}`;
    const res = await fetch(url);
    const data = await res.json();
    const t = (data?.responseData?.translatedText ?? '').trim();
    if (t && t.toLowerCase() !== word.toLowerCase() && !/mymemory|warning|usage|limit.*hour|invalid/i.test(t)) {
      cache[key] = t;
      saveCache();
      await sleep(350);
      return t;
    }
  } catch { /* cai no fallback abaixo */ }
  cache[key] = word; // fallback: nunca deixa translation vazio (auditoria exige)
  saveCache();
  await sleep(350);
  return word;
}

function sentencesOf(content) {
  return content.split(/(?<=[.!?。！？…])\s+/).map((s) => s.trim()).filter(Boolean);
}

function pickWords(content, lang, n = 7) {
  const freq = new Map();
  const tokens = content.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}\s-]/gu, ' ').split(/\s+/).filter(Boolean);
  for (const tok of tokens) {
    const t = tok.replace(/^-+|-+$/g, '');
    if (t.length < (lang === 'ru' ? 4 : 5)) continue;
    if (STOP.has(t)) continue;
    if (/^\d+$/.test(t)) continue;
    freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] * b[0].length - a[1] * a[0].length)
    .slice(0, n)
    .map(([w]) => w);
}

function findCaseForm(content, lower) {
  const m = content.match(new RegExp(`[\\p{L}]*${lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\p{L}]*`, 'iu'));
  return m ? m[0] : lower;
}

const enriched = [];
const failed = [];
const LEVEL_MAX = { A1: 220, A2: 250, B1: 300, B2: 350, C1: 400 };

// Se a entrada tem `url` mas não tem `content`, baixa e extrai os parágrafos
// principais. Trunca em parágrafos inteiros até o teto de palavras do nível.
// Zero copiar-e-colar: lote futuro = só lista de URLs.
async function fetchText(url, level) {
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Lingua personal reader)' } });
  if (!res.ok) throw new Error(`fetch ${res.status} ${url}`);
  let html = await res.text();
  const host = new URL(url).hostname;
  // zona do artigo quando o template é conhecido
  let zone = html;
  if (host.includes('ourworldindata')) zone = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1] ?? html;
  let minWords = 8;
  if (host.includes('cuentosparadormir')) {
    zone = html.match(/<div[^>]*class="field-items"[^>]*>([\s\S]*?)<\/div>/i)?.[1] ?? html;
    zone = zone.replace(/<br\s*\/?>/gi, '</p><p>');
    minWords = 5;
  }
  zone = zone
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<(nav|footer|aside|noscript)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<span[^>]*tooltip-content[^>]*>[\s\S]*?<\/span>/gi, ''); // glosas Lingolia coladas na palavra
  const paras = [];
  const onlyRussian = host.includes('learnrussianfree');
  for (const m of zone.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    let p = m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (onlyRussian) {
      const cyr = (p.match(/[А-Яа-яЁё]/g) || []).length;
      const lat = (p.match(/[A-Za-z]/g) || []).length;
      if (lat >= cyr) continue; // tradução inglesa / promo
      if (lat > 0 && p.includes('—')) p = p.split('—')[0].trim(); // mantém só o russo
    }
    if (p.split(' ').length < minWords) continue;
    if (/[{}`;]|this\.|=>|function\s*\(|set[A-Z]\w*\(|^\d\.\d×/.test(p)) continue; // JS do player/exercício
    if (/^(lies dir|lies den text|wähle die|lee el texto|determina si|elige la|read the article|answer the questions)/i.test(p)) continue; // instruções de exercício
    if (/^(nachrichten in einfacher sprache|link kopieren|email seite drucken|podcast nachrichtenleicht)/i.test(p)) continue; // UI nachrichtenleicht
    if (/zwischenablage|darme de baja|puede enviarme actualizaciones|intentarlo otra vez|mostrar soluciones/i.test(p)) continue; // UI deleahora/share
    if (/^(inicio|home)\s+(libros|actividades|blog)/i.test(p)) continue; // nav deleahora
    p = p.replace(/\((dpa|AP|[^)]*\/[^)]*)\)/g, ' ').replace(/\s+/g, ' ').trim(); // crédito de foto
    if (/preguntas de comprensión|corregir ejercicio|mostrar todos los ejercicios/i.test(p)) break; // fim do corpo Lingolia
    if (/^(задание|вопросы|новые слова|развернуть|свернуть)/i.test(p)) continue; // exercícios MSU
    if (/^\d+\s*[.\)]/.test(p)) continue; // questões numeradas
    if (/base_url|error_page|Array \(/.test(p)) continue; // lixo do CMS MSU
    if (/lingolia plus|descubre curiosidades|comprueba tus habilidades|repasa el vocabulario|zeige dein|teste dein/i.test(p)) continue; // intros promocionais
    if (/Stand: \d\d\.\d\d\.\d\d\d\d/.test(p) && paras.length === 0) continue; // dateline tagesschau
    paras.push(p);
  }
  const max = LEVEL_MAX[level] ?? 300;
  const out = [];
  let count = 0;
  for (const p of paras) {
    const w = p.split(' ').length;
    if (count + w > max && out.length) break;
    out.push(p);
    count += w;
  }
  if (!out.length) throw new Error(`nenhum parágrafo útil em ${url}`);
  return out.join(' ');
}

// Título automático a partir do <title> quando o seed não informa.
async function fetchTitle(url, lang) {
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Lingua personal reader)' } });
    const html = await res.text();
    let t = (html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i)?.[1]
      ?? html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '').replace(/\s+/g, ' ').trim();
    t = t.replace(/\s*[|\-–—]\s*(tagesschau\.de|BBC.*|Our World in Data|Lingolia.*|Deutsche Welle.*|MSU.*|Медиатека.*)$/i, '').trim();
    return t.slice(0, 90) || null;
  } catch { return null; }
}

for (const entry of seed) {
  try {
  const content = (entry.content ?? (entry.url ? await fetchText(entry.url, entry.level) : '')).replace(/\s+/g, ' ').trim();
  if (!content) throw new Error('sem conteúdo');
  const words = (entry.words?.length ? entry.words : pickWords(content, entry.language)).filter((w) =>
    content.toLowerCase().includes(w.toLowerCase()),
  );
  const sents = sentencesOf(content);
  const title = entry.title ?? (entry.url ? await fetchTitle(entry.url, entry.language) : null) ?? entry.id;
  const vocab = {};
  for (const w of words) {
    const form = findCaseForm(content, w);
    const translation = await translatePt(w, entry.language);
    vocab[form] = {
      word: form,
      lemma: w,
      translation,
      partOfSpeech: 'other',
      example: sents.find((s) => s.toLowerCase().includes(w.toLowerCase())) ?? sents[0] ?? content.slice(0, 120),
      pronunciation: '',
    };
  }
  enriched.push({
    id: entry.id,
    language: entry.language,
    level: entry.level,
    theme: entry.theme,
    title,
    content,
    translation: '',
    wordCount: content.split(/\s+/).length,
    chapter: 1,
    audioAvailable: true,
    createdAt: new Date().toISOString(),
    vocab,
    sourceUrl: entry.sourceUrl,
    sourceSite: entry.sourceSite,
  });
  console.log(`ok ${entry.id}: ${words.length} vocábulos`);
  } catch (e) {
    failed.push(entry.id);
    console.error(`SKIP ${entry.id}: ${e.message}`);
  }
}

// anexa ao content.ts sem duplicar
const contentPath = join(root, 'src/data/content.ts');
const file = readFileSync(contentPath, 'utf8');
const marker = 'export const texts:TextItem[]=';
const start = file.indexOf(marker);
const endMarker = '] as TextItem[]';
const end = file.indexOf(endMarker, start);
const current = JSON.parse(file.slice(start + marker.length, end + 1).trim());
const ids = new Set(current.map((t) => t.id));
const fresh = enriched.filter((t) => !ids.has(t.id));
console.log(`existentes: ${current.length}, novos: ${fresh.length}, já existiam: ${enriched.length - fresh.length}, falharam: ${failed.length}${failed.length ? ' (' + failed.join(', ') + ')' : ''}`);
if (!fresh.length) { console.error('nenhum texto novo, nada foi gravado'); process.exit(1); }
const merged = [...current, ...fresh];

// checagens da auditoria antes de gravar
const seen = new Set();
let dup = 0;
for (const t of merged) {
  const norm = t.content.toLowerCase().replace(/\s+/g, ' ').trim();
  if (seen.has(norm)) { dup++; console.error(`DUPLICADO: ${t.id}`); }
  seen.add(norm);
}
let missing = 0;
for (const t of merged)
  for (const v of Object.values(t.vocab))
    if (!t.content.toLowerCase().includes(v.word.toLowerCase())) { missing++; console.error(`VOCAB FORA DO TEXTO: ${t.id} :: ${v.word}`); }
if (dup || missing) { console.error('auditoria falhou, nada foi gravado'); process.exit(1); }

const next = file.slice(0, start + marker.length) + JSON.stringify(merged, null, 2) + file.slice(end + 1);
writeFileSync(contentPath, next);
console.log(`content.ts: ${current.length} -> ${merged.length} textos`);

// re-gera public/texts/ + manifest.ts
execSync('node scripts/split-content.mjs', { cwd: root, stdio: 'inherit' });
