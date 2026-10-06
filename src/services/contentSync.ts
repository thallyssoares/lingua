import type { TextMeta } from '../data/manifest';
import { getSyncedTextIds, saveSyncedText, saveSyncManifest } from '../db/database';
import { forgetText } from './contentStore';

export interface RemoteManifest {
  version: string;
  count: number;
  metas: TextMeta[];
}

export interface SyncResult {
  version: string;
  added: number;
  updated: number;
  total: number;
}

// Pura e testável: quais ids remotos ainda não temos localmente.
export function diffManifest(remote: RemoteManifest, knownIds: Set<string>): TextMeta[] {
  return remote.metas.filter((m) => !knownIds.has(m.id));
}

function baseUrlOf(manifestUrl: string): string {
  const clean = manifestUrl.trim().replace(/\/manifest\.json\/?$/, '');
  return clean.endsWith('/') ? clean : `${clean}/`;
}

export async function syncContent(manifestUrl: string, bundledIds: string[]): Promise<SyncResult> {
  const base = baseUrlOf(manifestUrl);
  let remote: RemoteManifest;
  try {
    const res = await fetch(`${base}manifest.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    remote = (await res.json()) as RemoteManifest;
  } catch (e) {
    throw new Error(`Não consegui ler o manifest (${e instanceof Error ? e.message : e}). Confira a URL e a internet.`);
  }
  if (!remote || !Array.isArray(remote.metas)) throw new Error('Manifest inválido: esperado { version, count, metas[] }.');
  const known = new Set<string>([...bundledIds, ...(await getSyncedTextIds())]);
  const missing = diffManifest(remote, known);
  let added = 0;
  for (const meta of missing) {
    const res = await fetch(`${base}texts/${meta.id}.json`);
    if (!res.ok) throw new Error(`Falhou ao baixar ${meta.id} (HTTP ${res.status}).`);
    const text = (await res.json()) as import('../types').TextItem;
    await saveSyncedText(text);
    forgetText(meta.id);
    added++;
  }
  await saveSyncManifest({ version: remote.version, count: remote.count, checkedAt: Date.now(), metas: remote.metas });
  return { version: remote.version, added, updated: 0, total: remote.count };
}

export interface ContentPack extends RemoteManifest {
  texts: import('../types').TextItem[];
}

// Pura e testável: valida um pacote importado de arquivo.
export function validatePack(data: unknown): data is ContentPack {
  if (!data || typeof data !== 'object') return false;
  const p = data as Partial<ContentPack>;
  return typeof p.version === 'string' && Array.isArray(p.metas) && Array.isArray(p.texts)
    && p.texts.every((t) => t && typeof t.id === 'string' && typeof t.content === 'string' && t.vocab && typeof t.vocab === 'object');
}

// Importa um pacote lingua-pack.json (100% offline: USB, WhatsApp, Drive).
export async function importPack(data: unknown): Promise<SyncResult> {
  if (!validatePack(data)) throw new Error('Arquivo inválido: esperado um lingua-pack.json gerado por scripts/pack-content.mjs.');
  let added = 0;
  for (const text of data.texts) {
    await saveSyncedText(text);
    forgetText(text.id);
    added++;
  }
  await saveSyncManifest({ version: data.version, count: data.count, checkedAt: Date.now(), metas: data.metas });
  return { version: data.version, added, updated: 0, total: data.count };
}

export function getSyncUrl(): string {
  try {
    return localStorage.getItem('lingua-sync-url') || '';
  } catch {
    return '';
  }
}

export function setSyncUrl(url: string): void {
  try {
    localStorage.setItem('lingua-sync-url', url);
  } catch {
    /* armazenamento indisponível */
  }
}
