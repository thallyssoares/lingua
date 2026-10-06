// Probe10: AulaProfe tag, DELEAhora A1/A2 + extração, DW langsam extração.
async function get(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Lingua personal reader)' } });
  return { status: r.status, h: await r.text() };
}
try {
  const { status, h } = await get('https://aulaprofe.com/tag/lecturas-ele/');
  const links = [...new Set([...h.matchAll(/href="(https:\/\/aulaprofe\.com\/[^"]+\/)"/gi)].map((m) => m[1]).filter((x) => !x.includes('/category/') && !x.includes('/tag/') && !x.includes('/author/')))];
  console.log(`\n### aulaprofe tag [${status}] n=${links.length}\n` + links.slice(0, 30).join('\n'));
} catch (e) { console.log('\nAP ERRO: ' + e.message); }
try {
  const { status, h } = await get('https://deleahora.com/actividades/a1-a2');
  const links = [...new Set([...h.matchAll(/href="(\/actividades\/comprension-de-lectura\/[^"]+)"/gi)].map((m) => 'https://deleahora.com' + m[1]))];
  console.log(`\n### deleahora a1-a2 [${status}] n=${links.length}\n` + links.slice(0, 30).join('\n'));
} catch (e) { console.log('\nDA ERRO: ' + e.message); }
try {
  const { status, h } = await get('https://deleahora.com/actividades/comprension-de-lectura/las-cuatro-estaciones');
  const z = h.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  const ps = [...z.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).filter((p) => p.split(' ').length >= 8);
  console.log(`\n### deleahora artigo [${status}] paras=${ps.length}`);
  ps.slice(0, 5).forEach((p, i) => console.log(`${i}: ${p.slice(0, 140)}`));
} catch (e) { console.log('\nDA-art ERRO: ' + e.message); }
try {
  const { status, h } = await get('https://learngerman.dw.com/de/09-06-2026-langsam-gesprochene-nachrichten/a-77469460');
  const z = h.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  const ps = [...z.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).filter((p) => p.split(' ').length >= 8);
  console.log(`\n### DW langsam [${status}] bytes=${h.length} paras=${ps.length}`);
  ps.slice(0, 5).forEach((p, i) => console.log(`${i}: ${p.slice(0, 140)}`));
} catch (e) { console.log('\nDW ERRO: ' + e.message); }
