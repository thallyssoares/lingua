// Probe11: nachrichtenleicht sitemap+artigo, AulaProfe categoria, Grimm.
async function get(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Lingua personal reader)' } });
  return { status: r.status, h: await r.text() };
}
for (const u of ['https://www.nachrichtenleicht.de/sitemap.xml', 'https://www.nachrichtenleicht.de/robots.txt']) {
  try {
    const { status, h } = await get(u);
    console.log(`\n### ${u} [${status}] bytes=${h.length}\n` + h.slice(0, 800));
  } catch (e) { console.log(`\n### ${u} ERRO: ` + e.message); }
}
try {
  const { status, h } = await get('https://aulaprofe.com/category/aula-profe/recursos-para-el-aula/lecturas/');
  const links = [...new Set([...h.matchAll(/href="(https:\/\/aulaprofe\.com\/[^"]+\/)"/gi)].map((m) => m[1]).filter((x) => !x.includes('/category/') && !x.includes('/tag/') && !x.includes('/author/') && !x.includes('feed') && !x.includes('wp-json')))];
  console.log(`\n### AP categoria [${status}] n=${links.length}\n` + links.join('\n'));
} catch (e) { console.log('\nAP ERRO: ' + e.message); }
for (const u of ['https://www.grimmstories.com/de/grimm_maerchen/index', 'https://www.grimmstories.com/de/grimm_maerchen/rotkappchen']) {
  try {
    const { status, h } = await get(u);
    const z = h.replace(/<script[\s\S]*?<\/script>/gi, ' ');
    const links = [...new Set([...z.matchAll(/href="([^"]*grimm_maerchen\/[^"]+)"/gi)].map((m) => m[1]))].slice(0, 25);
    const ps = [...z.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).filter((p) => p.split(' ').length >= 8);
    console.log(`\n### ${u} [${status}] links=${links.length} paras=${ps.length}`);
    console.log(links.slice(0, 12).join(' | ').slice(0, 600));
    ps.slice(0, 3).forEach((p, i) => console.log(`${i}: ${p.slice(0, 130)}`));
  } catch (e) { console.log(`\n### ${u} ERRO: ` + e.message); }
}
