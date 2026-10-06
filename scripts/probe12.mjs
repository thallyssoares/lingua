// Probe12: NL sitemaps + 1 artigo, Grimm markup.
async function get(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Lingua personal reader)' } });
  return { status: r.status, h: await r.text() };
}
const arts = [];
for (const sm of ['nachrichtenleicht-nachrichten-filter-100.sitemap', 'nachrichtenleicht-sport-filter-100.sitemap', 'nachrichtenleicht-vermischtes-filter-100.sitemap', 'nachrichtenleicht-kultur-filter-100.sitemap']) {
  try {
    const { status, h } = await get(`https://www.nachrichtenleicht.de/${sm}`);
    const urls = [...new Set([...h.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => m[1]))];
    console.log(`### ${sm} [${status}] n=${urls.length}`);
    console.log(urls.slice(0, 12).join('\n'));
    arts.push(...urls);
  } catch (e) { console.log(`### ${sm} ERRO`); }
}
const test = arts.find((u) => /\.html/.test(u));
if (test) {
  const { status, h } = await get(test);
  const z = h.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const ps = [...z.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).filter((p) => p.split(' ').length >= 8);
  console.log(`\n### NL artigo [${status}] ${test}\nparas=${ps.length}`);
  ps.slice(0, 6).forEach((p, i) => console.log(`${i}: ${p.slice(0, 140)}`));
}
try {
  const { h } = await get('https://www.grimmstories.com/de/grimm_maerchen/rotkappchen');
  const i = h.indexOf('Rotk');
  console.log('\n### Grimm ctx:\n' + h.slice(Math.max(0, i - 500), i + 400).replace(/\s+/g, ' ').slice(0, 1200));
} catch (e) { console.log('\nGrimm ERRO'); }
