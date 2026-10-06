import { describe, it, expect } from 'vitest';
import { diffManifest, validatePack, type RemoteManifest } from './contentSync';

const remote = (ids: string[]): RemoteManifest => ({
  version: '3-abc',
  count: ids.length,
  metas: ids.map((id) => ({
    id, language: 'de', level: 'A1', theme: 'Cotidiano', title: id,
    wordCount: 100, chapter: 1, createdAt: '', audioAvailable: true, vocabCount: 7, excerpt: '',
  })),
});

describe('sync OTA', () => {
  it('baixa só o que falta', () => {
    expect(diffManifest(remote(['a', 'b', 'c']), new Set(['a', 'b'])).map((m) => m.id)).toEqual(['c']);
  });
  it('nada novo quando tudo sincronizado', () => {
    expect(diffManifest(remote(['a']), new Set(['a']))).toEqual([]);
  });
  it('banco vazio baixa tudo', () => {
    expect(diffManifest(remote(['a', 'b']), new Set()).map((m) => m.id)).toEqual(['a', 'b']);
  });
});

describe('validatePack', () => {
  const good = { version: '1', count: 1, metas: [], texts: [{ id: 'x', content: 'abc', vocab: { a: {} } }] };
  it('aceita pacote válido', () => {
    expect(validatePack(good)).toBe(true);
  });
  it('rejeita pacote sem textos', () => {
    expect(validatePack({ version: '1', count: 0, metas: [] })).toBe(false);
  });
  it('rejeita lixo', () => {
    expect(validatePack(null)).toBe(false);
    expect(validatePack('abc')).toBe(false);
    expect(validatePack({ version: '1', metas: [], texts: [{ id: 'x' }] })).toBe(false);
  });
});
