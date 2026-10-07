import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

export interface AppVersionInfo {
  versionCode: number;
  versionName: string;
  file: string;
  size: number;
  notes: string;
  date: string;
}

export interface AppUpdate {
  available: boolean;
  current: string;
  remote: AppVersionInfo;
  apkUrl: string;
}

// Pura e testável.
export function isNewer(remoteCode: number, currentCode: number): boolean {
  return remoteCode > currentCode;
}

export async function currentBuild(): Promise<number> {
  if (!Capacitor.isNativePlatform()) return 0;
  try {
    const info = await App.getInfo();
    return Number(info.build) || 0;
  } catch {
    return 0;
  }
}

// baseUrl: use a mesma origem do sync de conteúdo (ex.: https://x.netlify.app/)
export async function checkAppUpdate(baseUrl: string): Promise<AppUpdate | null> {
  if (!Capacitor.isNativePlatform() || !baseUrl) return null;
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  let remote: AppVersionInfo;
  try {
    const res = await fetch(`${base}apk/version.json`);
    if (!res.ok) return null; // sem releases publicados ainda
    remote = (await res.json()) as AppVersionInfo;
  } catch {
    return null;
  }
  if (!remote || typeof remote.versionCode !== 'number') return null;
  const build = await currentBuild();
  const info = await App.getInfo().catch(() => ({ version: '', build: '0' }));
  return {
    available: isNewer(remote.versionCode, build),
    current: `${info.version} (${info.build})`,
    remote,
    apkUrl: `${base}apk/${remote.file}`,
  };
}

export async function downloadUpdate(apkUrl: string): Promise<void> {
  // Abre no navegador do sistema: baixa e o instalador do Android assume.
  await Browser.open({ url: apkUrl });
}
