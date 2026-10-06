// Serve a pasta sync/ na rede local para o celular baixar sem rebuild.
// Uso: node scripts/serve-sync.mjs [porta=8080]
// No celular (mesmo Wi-Fi): Ajustes → Atualização de conteúdo → URL http://SEU-IP:8080/manifest.json
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, normalize } from 'node:path';
import { networkInterfaces } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', process.argv[3] ?? 'sync');
const port = Number(process.argv[2] ?? 8080);
const MIME = { '.json': 'application/json', '.html': 'text/html' };

createServer(async (req, res) => {
  try {
    const path = normalize(join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname))).replace(/\\/g, '/');
    if (!path.startsWith(root.replace(/\\/g, '/')) || !existsSync(path)) {
      res.writeHead(404); res.end('not found'); return;
    }
    const body = await readFile(path);
    const ext = path.slice(path.lastIndexOf('.'));
    res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream', 'Access-Control-Allow-Origin': '*' });
    res.end(body);
  } catch {
    res.writeHead(500); res.end('error');
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`sync servido em http://localhost:${port}/manifest.json`);
  for (const ifs of Object.values(networkInterfaces())) for (const n of ifs ?? []) {
    if (n.family === 'IPv4' && !n.internal) console.log(`no celular (mesmo Wi-Fi): http://${n.address}:${port}/manifest.json`);
  }
});
