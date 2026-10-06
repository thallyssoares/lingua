async function get(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Lingua personal reader)' } });
  return { status: r.status, h: await r.text() };
}
for (const u of ['https://www.ohrenbaer.de/', 'https://www.vorleser.net/kindergeschichten/']) {
  try {
    const { status, h } = await get(u);
    const links = [...new Set([...h.matchAll(/href="([^"]+)"/gi)].map((m) => m[1]).filter((x) => /geschicht|story|maerchen|ohrenbaer.*\/[a-z-]+$|kindergeschichten\//i.test(x) && !/\.(css|js|png|jpg|ico)/i.test(x)))].slice(0, 20);
    console.log(`\n### ${u} [${status}] bytes=${h.length}\n` + links.join('\n'));
  } catch (e) { console.log(`\n### ${u} ERRO: ` + e.message); }
}
