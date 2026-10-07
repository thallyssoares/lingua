import { describe, it, expect } from 'vitest';
import { clozeSentence, sentenceContaining, splitSentences, translitRu } from './textUtils';

describe('textUtils', () => {
  it('divide em frases', () => {
    expect(splitSentences('Olá. Tudo bem? Sim!')).toEqual(['Olá.', 'Tudo bem?', 'Sim!']);
  });
  it('acha a frase exata da palavra', () => {
    expect(sentenceContaining('O gato dorme. O cachorro corre.', 'cachorro')).toBe('O cachorro corre.');
  });
  it('faz cloze da palavra', () => {
    expect(clozeSentence('O cachorro corre.', 'cachorro')).toBe('O ___ corre.');
  });
  it('translitera russo', () => {
    expect(translitRu('Привет')).toBe('Privet');
    expect(translitRu('Москва')).toBe('Moskva');
    expect(translitRu('спасибо!')).toBe('spasibo!');
  });
});
