// Probe4: fontes restantes (DE fabulang/dtogo, ES b1/b2, EN OWID/BBC).
const PAGES = [
  'https://www.fabulang.com/en/de/stories',
  'https://www.deutsch-to-go.de/',
  'https://espanol.lingolia.com/es/comprension-lectora/b1',
  'https://espanol.lingolia.com/es/comprension-lectora/b2',
  'https://www.bbc.co.uk/learningenglish/features/the_reading_room',
];
for (const url of PAGES) {
  try {
    const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Lingua personal reader)' } });
    const h = await r.text();
    const hrefs = [...new Set([...h.matchAll(/href="([^"]+)"/gi)].map((m) => m[1]))];
    const arts = hrefs.filter((x) => /stor|artikel|article|hoertext|horc|ep-|the_reading_room\/ep/i.test(x) && !x.includes('#'));
    console.log(`\n### ${url} [${r.status}] bytes=${h.length}\narticles: ${arts.length}\n` + JSON.stringify(arts.slice(0, 30), null, 1).slice(0, 2500));
  } catch (e) { console.log(`\n### ${url}\nERRO: ${e.message}`); }
}
// teste de extração no OWID (outro artigo C1)
try {
  const r = await fetch('https://ourworldindata.org/literacy', { headers: { 'user-agent': 'Mozilla/5.0' } });
  const h = await r.text();
  const zone = h.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1] ?? h;
  const paras = [...zone.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    .filter((p) => p.split(' ').length >= 10);
  console.log(`\n### OWID literacy: ${paras.length} parágrafos, palavras ~${paras.join(' ').split(' ').length}`);
  console.log('P1:', paras[0]?.slice(0, 250));
} catch (e) { console.log('ERRO owid: ' + e.message); }
