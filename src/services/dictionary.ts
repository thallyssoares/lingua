// Tradução sob demanda para palavras sem entrada editorial.
// MyMemory (grátis) -> Google gtx (fallback), com cache em memória.
const mem = new Map<string, string>();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const PAIR: Record<string, string> = { en: 'en|pt', de: 'de|pt', es: 'es|pt', ru: 'ru|pt' };
type Lang = 'en' | 'de' | 'es' | 'ru';

async function viaMyMemory(word: string, lang: Lang): Promise<string | null> {
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${PAIR[lang]}`);
    const data = await res.json();
    const t = String(data?.responseData?.translatedText ?? '').trim();
    if (t && t.toLowerCase() !== word.toLowerCase() && !/mymemory|warning|usage|limit.*hour|invalid/i.test(t)) return t;
  } catch {
    /* tenta o próximo */
  }
  return null;
}

async function viaGoogle(word: string, lang: Lang): Promise<string | null> {
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${lang}&tl=pt-BR&dt=t&q=${encodeURIComponent(word)}`);
    const data = await res.json();
    const t = String(data?.[0]?.map((x: string[]) => x[0]).join(' ') ?? '').trim();
    if (t && t.toLowerCase() !== word.toLowerCase()) return t;
  } catch {
    /* sem tradução */
  }
  return null;
}

export async function translateWord(word: string, language: Lang): Promise<string | null> {
  const key = `${language}:${word.toLowerCase()}`;
  const hit = mem.get(key);
  if (hit) return hit;
  const t = (await viaMyMemory(word, language)) ?? (await viaGoogle(word, language));
  await sleep(300);
  if (t) mem.set(key, t);
  return t;
}
