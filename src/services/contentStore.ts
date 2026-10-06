import type { TextItem } from '../types';
import { getSyncedText } from '../db/database';

const mem = new Map<string, TextItem>();

export async function loadText(id: string): Promise<TextItem> {
  const hit = mem.get(id);
  if (hit) return hit;
  // 1) textos sincronizados via OTA (IndexedDB) têm prioridade — permite
  // atualizar o banco sem rebuild: mesma id, conteúdo novo vence o bundle.
  try {
    const synced = await getSyncedText(id);
    if (synced) {
      mem.set(id, synced);
      return synced;
    }
  } catch {
    /* IndexedDB indisponível: segue para o bundle */
  }
  // 2) bundle embutido (offline, APK/PWA)
  const base = import.meta.env.BASE_URL || '/';
  const res = await fetch(`${base}texts/${id}.json`);
  if (!res.ok) throw new Error(`Texto não encontrado: ${id}`);
  const text = (await res.json()) as TextItem;
  mem.set(id, text);
  return text;
}

export function prefetchTexts(ids: string[]): void {
  for (const id of ids) loadText(id).catch(() => {});
}

export function forgetText(id: string): void {
  mem.delete(id);
}
