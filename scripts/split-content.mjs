// Gera public/texts/*.json + src/data/manifest.ts a partir de src/data/content.ts.
// Tudo continua embutido/offline — só sai do bundle inicial (lazy load).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'src/data/content.ts'), 'utf8');

const marker = 'export const texts:TextItem[]=';
const start = src.indexOf(marker);
if (start === -1) throw new Error('texts array not found in content.ts');
let raw = src.slice(start + marker.length);
const endMarker = '] as TextItem[]';
const end = raw.indexOf(endMarker);
if (end === -1) throw new Error('end of texts array not found');
raw = raw.slice(0, end + 1).trim();
const texts = JSON.parse(raw);

mkdirSync(join(root, 'public/texts'), { recursive: true });
for (const t of texts) {
  writeFileSync(join(root, 'public/texts', `${t.id}.json`), JSON.stringify(t, null, 2) + '\n');
}

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

const out = `// Gerado por scripts/split-content.mjs — não editar à mão.
import type { Language, LanguageCode, Level, Theme } from '../types';
export const languages: Language[] = [{id:'en',name:'English',nativeName:'English',flag:'🇺🇸',targetLevel:'B1'},{id:'de',name:'German',nativeName:'Deutsch',flag:'🇩🇪',targetLevel:'A2'},{id:'es',name:'Spanish',nativeName:'Español',flag:'🇪🇸',targetLevel:'A2'},{id:'ru',name:'Russian',nativeName:'Русский',flag:'🇷🇺',targetLevel:'A1'}];
export const levels: Level[] = ['A1','A2','B1','B2','C1'];
export const themes: Theme[] = ['Tecnologia','AI Engineering','Futebol','Investigação','Cotidiano'];
export interface TextMeta { id: string; language: LanguageCode; level: Level; theme: Theme; title: string; wordCount: number; chapter: number; seriesId?: string; sourceUrl?: string; sourceSite?: string; createdAt: string; audioAvailable: boolean; vocabCount: number; excerpt: string }
export const textMetas: TextMeta[] = ${JSON.stringify(metas, null, 2)};
export const cyrillic: [string, string][] = [["а","a"],["б","b"],["в","v"],["г","g"],["д","d"],["е","e"],["ё","yo"],["ж","zh"],["з","z"],["и","i"],["й","j"],["к","k"],["л","l"],["м","m"],["н","n"],["о","o"],["п","p"],["р","r"],["с","s"],["т","t"],["у","u"],["ф","f"],["х","h"],["ц","c"],["ч","ch"],["ш","sh"],["щ","shch"],["ъ",""],["ы","y"],["ь",""],["э","e"],["ю","yu"],["я","ya"]];
`;
writeFileSync(join(root, 'src/data/manifest.ts'), out);
console.log(`split ok: ${texts.length} texts -> public/texts/ + manifest.ts`);
