import { cyrillic } from '../data/manifest';

export function splitSentences(content: string): string[] {
  return content.split(/(?<=[.!?…])\s+/).map((s) => s.trim()).filter(Boolean);
}

export function sentenceContaining(content: string, word: string): string {
  const sents = splitSentences(content);
  const lower = word.toLowerCase();
  return sents.find((s) => s.toLowerCase().includes(lower)) ?? sents[0] ?? content;
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function clozeSentence(sentence: string, word: string): string {
  if (!word || word.toLowerCase() === 'frase') return sentence;
  const re = new RegExp(esc(word), 'i');
  return re.test(sentence) ? sentence.replace(re, '___') : sentence;
}

const translitMap = new Map<string, string>(cyrillic);

export function translitRu(text: string): string {
  return [...text]
    .map((ch) => {
      const lower = ch.toLowerCase();
      const t = translitMap.get(lower);
      if (!t) return ch;
      return ch !== lower ? t.charAt(0).toUpperCase() + t.slice(1) : t;
    })
    .join('');
}
