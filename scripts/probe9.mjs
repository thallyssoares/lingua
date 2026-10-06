// Probe9: links completos tagesschau, Conversation seções, OWID extras.
async function get(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Lingua personal reader)' } });
  return { status: r.status, h: await r.text() };
}
for (const sec of ['inland', 'ausland/europa', 'wirtschaft', 'wissen']) {
  try {
    const { status, h } = await get(`https://www.tagesschau.de/${sec}/`);
    const links = [...new Set([...h.matchAll(/href="((?:\/[a-z-]+\/)+[^"]+\.html)"/gi)].map((m) => 'https://www.tagesschau.de' + m[1]).filter((x) => /\d{3}\.html$/.test(x)))];
    console.log(`\n### TS/${sec} [${status}] n=${links.length}\n` + links.join('\n'));
  } catch (e) { console.log(`\n### TS/${sec} ERRO: ` + e.message); }
}
for (const sec of ['ciencia', 'sociedad']) {
  try {
    const { status, h } = await get(`https://theconversation.com/es/${sec}`);
    const links = [...new Set([...h.matchAll(/href="(https:\/\/theconversation\.com\/[^"]+-\d+)"/gi)].map((m) => m[1]))];
    console.log(`\n### conv/${sec} [${status}] n=${links.length}\n` + links.slice(0, 25).join('\n'));
  } catch (e) { console.log(`\n### conv/${sec} ERRO: ` + e.message); }
}
for (const slug of ['global-poverty', 'mental-health', 'happiness-and-life-satisfaction', 'smoking', 'alcohol-consumption', 'suicides', 'homicides', 'war-and-peace']) {
  try {
    const r = await fetch(`https://ourworldindata.org/${slug}`, { method: 'HEAD', headers: { 'user-agent': 'Mozilla/5.0' } });
    if (r.status === 200) console.log(`OWID ok: ${slug}`);
  } catch {}
}
