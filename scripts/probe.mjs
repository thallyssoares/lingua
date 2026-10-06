// Probe: testa extração de candidatos a fonte bulk. Uso: node scripts/probe.mjs
const URLS = [
  'https://deutsch.lingolia.com/de/leseverstehen/a2',
  'https://english.lingolia.com/en/reading-c1',
  'https://www.nachrichtenleicht.de/',
  'https://www.catalogue.irlc.msu.ru/media-texts-catalogue/all/texts/b1',
  'https://ourworldindata.org/scaling-up-ai',
];
for (const url of URLS) {
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Lingua personal reader)' } });
    const html = await res.text();
    console.log(`\n### ${url}\nstatus=${res.status} bytes=${html.length}`);
    // links de artigos na página
    const links = [...html.matchAll(/href="([^"]*(?:articles|leseverstehen|reading|meldung|nachricht)[^"]*)"/gi)]
      .map((m) => m[1]).filter((h) => !h.includes('#')).slice(0, 12);
    console.log('links:', JSON.stringify(links, null, 1).slice(0, 1200));
  } catch (e) { console.log(`\n### ${url}\nERRO: ${e.message}`); }
}
// inspeciona markup do corpo num artigo Lingolia conhecido
try {
  const res = await fetch('https://espanol.lingolia.com/es/comprension-lectora/a2/articles/la-navidad-en-espana', { headers: { 'user-agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const i = html.indexOf('Misa');
  console.log('\n### contexto "Misa":\n' + html.slice(Math.max(0, i - 600), i + 300));
} catch (e) { console.log('ERRO navidad: ' + e.message); }
