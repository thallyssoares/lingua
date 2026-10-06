// Probe8: fontes p/ 300 — tagesschau seções, dtogo arquivos, VeinteMundos, OWID.
async function get(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Lingua personal reader)' } });
  return { status: r.status, h: await r.text() };
}
for (const sec of ['ausland', 'wirtschaft', 'wissen']) {
  try {
    const { status, h } = await get(`https://www.tagesschau.de/${sec}/`);
    const links = [...new Set([...h.matchAll(/href="(\/(?:ausland|wirtschaft|wissen)[^"]+\.html)"/gi)].map((m) => 'https://www.tagesschau.de' + m[1]))].slice(0, 15);
    console.log(`\n### tagesschau/${sec} [${status}] n=${links.length}\n` + links.slice(0, 8).join('\n'));
  } catch (e) { console.log(`\n### tagesschau/${sec} ERRO: ` + e.message); }
}
for (const [lvl, slug] of [['A2', 'hoertexte-einfach-a2'], ['B2', 'hoertexte-mittel-b2'], ['C1', 'hoertexte-schwer-c1']]) {
  try {
    const base = lvl === 'A2' ? 'hoertexte-einfach' : lvl === 'B2' ? 'hoertexte-mittel' : 'hoertexte-schwer';
    const { status, h } = await get(`https://www.deutsch-to-go.de/lernen/${base}/${slug}/`);
    const links = [...new Set([...h.matchAll(/href="(https:\/\/www\.deutsch-to-go\.de\/[^"\/]+\/)"/gi)].map((m) => m[1]).filter((x) => !x.includes('/lernen/') && !x.includes('feed') && !x.includes('themen')))];
    console.log(`\n### dtogo ${lvl} [${status}] n=${links.length}\n` + links.slice(0, 25).join('\n'));
  } catch (e) { console.log(`\n### dtogo ${lvl} ERRO: ` + e.message); }
}
try {
  const { status, h } = await get('https://veintemundos.com/');
  console.log(`\n### veintemundos [${status}] bytes=${h.length}`);
  const links = [...new Set([...h.matchAll(/href="([^"]+)"/gi)].map((m) => m[1]).filter((x) => /articulo|nivel|b1|b2|c1|a1|a2/i.test(x)))].slice(0, 20);
  console.log(links.join('\n') || '(sem links padronizados)');
} catch (e) { console.log('\nVM ERRO: ' + e.message); }
for (const slug of ['hunger-and-undernourishment', 'global-poverty', 'child-mortality', 'energy-access', 'clean-water', 'sanitation', 'maternal-mortality', 'financing-healthcare', 'literacy-already-used', 'democracy-already-used', 'economic-growth', 'trade-and-globalization', 'coronavirus-pandemic', 'climate-change', 'biodiversity', 'plastic-pollution', 'air-pollution', 'food-supply', 'employment-in-agriculture', 'urbanization']) {
  try {
    const r = await fetch(`https://ourworldindata.org/${slug}`, { method: 'HEAD', headers: { 'user-agent': 'Mozilla/5.0' } });
    if (r.status === 200) console.log(`OWID ok: ${slug}`);
  } catch {}
}
