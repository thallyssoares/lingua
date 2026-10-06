// Probe7: DW langsam link, tagesschau extração, BBC títulos, OWID slugs.
async function get(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Lingua personal reader)' } });
  return { status: r.status, h: await r.text() };
}
try {
  const { status, h } = await get('https://www.dw.com/de/deutsch-lernen/s-9095');
  const links = [...new Set([...h.matchAll(/href="([^"]+)"/gi)].map((m) => m[1]).filter((x) => /langsam|nachrichten/i.test(x)))].slice(0, 10);
  console.log(`\n### DW overview [${status}]\n` + JSON.stringify(links, null, 1).slice(0, 1000));
} catch (e) { console.log('\nDW ERRO: ' + e.message); }
try {
  const { status, h } = await get('https://www.tagesschau.de/inland/kriegsdienstverweigerer-124.html');
  const zone = h.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1] ?? h;
  const ps = [...zone.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).filter((p) => p.split(' ').length >= 10);
  console.log(`\n### tagesschau artigo [${status}] paras=${ps.length} palavras~${ps.join(' ').split(' ').length}`);
  ps.slice(0, 3).forEach((p, i) => console.log(`${i}: ${p.slice(0, 150)}`));
} catch (e) { console.log('\nTS ERRO: ' + e.message); }
for (const ep of ['ep-260625', 'ep-260521', 'ep-260518', 'ep-260514', 'ep-260507', 'ep-251110']) {
  try {
    const { status, h } = await get(`https://www.bbc.co.uk/learningenglish/features/the_reading_room/${ep}`);
    const title = (h.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '').replace(/\s+/g, ' ').trim().slice(0, 120);
    console.log(`\n### BBC ${ep} [${status}] ${title}`);
  } catch (e) { console.log(`\n### BBC ${ep} ERRO: ` + e.message); }
}
for (const slug of ['literacy', 'democracy', 'life-expectancy', 'co2-and-greenhouse-gas-emissions', 'global-education', 'artificial-intelligence']) {
  try {
    const r = await fetch(`https://ourworldindata.org/${slug}`, { method: 'HEAD', headers: { 'user-agent': 'Mozilla/5.0' } });
    console.log(`OWID /${slug}: ${r.status}`);
  } catch (e) { console.log(`OWID /${slug}: ERRO`); }
}
