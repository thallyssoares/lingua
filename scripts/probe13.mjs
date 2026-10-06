// Probe13: HSA activities, MovaReader, cuentosparadormir.
async function get(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Lingua personal reader)' } });
  return { status: r.status, h: await r.text() };
}
try {
  const { status, h } = await get('https://hspanishacademy.com/es/activities/');
  const links = [...new Set([...h.matchAll(/href="(https:\/\/hspanishacademy\.com\/es\/activity\/[^"]+)"/gi)].map((m) => m[1]))];
  console.log(`\n### HSA [${status}] n=${links.length}\n` + links.slice(0, 20).join('\n'));
} catch (e) { console.log('\nHSA ERRO: ' + e.message); }
for (const u of ['https://movareader.com/es/blog/7-short-stories-spanish-beginners-read-day-one']) {
  try {
    const { status, h } = await get(u);
    const links = [...new Set([...h.matchAll(/href="([^"]+)"/gi)].map((m) => m[1]).filter((x) => /a1|a2|lector|cuento|relato|muestra|sample/i.test(x)))].slice(0, 15);
    console.log(`\n### mova [${status}]\n` + links.join('\n'));
  } catch (e) { console.log('\nMOVA ERRO: ' + e.message); }
}
try {
  const { status, h } = await get('https://cuentosparadormir.com/');
  const links = [...new Set([...h.matchAll(/href="([^"]*cuentos?[^"]*)"/gi)].map((m) => m[1]).filter((x) => x.length > 5))].slice(0, 15);
  console.log(`\n### cpd [${status}]\n` + links.join('\n'));
} catch (e) { console.log('\nCPD ERRO: ' + e.message); }
