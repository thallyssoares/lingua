// Release do APK com self-update: bump de versão -> build -> publica em sync/apk/.
// Uso: npm run apk:release [-- notas da versão]
// O app verifica sync/apk/version.json e se atualiza sozinho (sem WhatsApp).
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const gradlePath = join(root, 'android/app/build.gradle');
let gradle = readFileSync(gradlePath, 'utf8');
const code = Number(gradle.match(/versionCode\s+(\d+)/)?.[1] ?? 1) + 1;
gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${code}`).replace(/versionName\s+"[^"]+"/, `versionName "1.${code}"`);
writeFileSync(gradlePath, gradle);
console.log(`versão: code=${code} name=1.${code}`);

console.log('buildando APK (pode levar alguns minutos na primeira vez)...');
execSync('cmd /c ".\\android\\gradlew.bat -p android assembleDebug --console=plain"', { cwd: root, stdio: 'inherit' });

const apk = join(root, 'android/app/build/outputs/apk/debug/app-debug.apk');
const outDir = join(root, 'sync/apk');
mkdirSync(outDir, { recursive: true });
const file = `lingua-${code}.apk`;
copyFileSync(apk, join(outDir, file));
const notes = process.argv.slice(2).join(' ') || `Versão 1.${code}`;
writeFileSync(
  join(outDir, 'version.json'),
  JSON.stringify({ versionCode: code, versionName: `1.${code}`, file, size: statSync(apk).size, notes, date: new Date().toISOString().slice(0, 10) }, null, 2) + '\n',
);
console.log(`publicado: sync/apk/${file} — commit + push para a Netlify distribuir`);
