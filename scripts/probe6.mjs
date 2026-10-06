// Probe6: Fabulang ES/RU, DW langsam, tagesschau, MSU corpo da história.
async function get(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Lingua personal reader)' } });
  return { status: r.status, h: await r.text() };
}
for (const url of ['https://www.fabulang.com/en/es', 'https://www.fabulang.com/en/ru', 'https://www.dw.com/de/deutsch-lernen/langsam-gesprochene-nachrichten/s-60084132']) {
  try {
    const { status, h } = await get(url);
    const links = [...new Set([...h.matchAll(/href="([^"]+)"/gi)].map((m) => m[1]).filter((x) => /stor|l-|nachricht/i.test(x)))].slice(0, 20);
    console.log(`\n### ${url} [${status}] bytes=${h.length}\n` + JSON.stringify(links, null, 1).slice(0, 1500));
  } catch (e) { console.log(`\n### ${url}\nERRO: ${e.message}`); }
}
try {
  const { status, h } = await get('https://www.tagesschau.de/inland/');
  const links = [...new Set([...h.matchAll(/href="(\/inland\/[^"]+\.html)"/gi)].map((m) => 'https://www.tagesschau.de' + m[1]))].slice(0, 12);
  console.log(`\n### tagesschau [${status}]\n` + JSON.stringify(links, null, 1).slice(0, 1500));
} catch (e) { console.log('\n### tagesschau\nERRO: ' + e.message); }
try {
  const { status, h } = await get('https://www.catalogue.irlc.msu.ru/media-texts-catalogue/all/texts/b1/vstrecha-v-samolyote');
  const ps = [...h.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean);
  console.log(`\n### MSU corpo [${status}] total p=${ps.length}`);
  ps.slice(13, 30).forEach((p, i) => console.log(`${i + 13}: ${p.slice(0, 150)}`));
} catch (e) { console.log('\nMSU ERRO: ' + e.message); }
