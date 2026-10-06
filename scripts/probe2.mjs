// Probe2: descobre padrões de links das listagens.
const J = (arr) => console.log(JSON.stringify([...new Set(arr)].slice(0, 30), null, 1).slice(0, 2000));
async function get(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Lingua personal reader)' } });
  return r.text();
}
let h = await get('https://deutsch.lingolia.com/de/leseverstehen');
console.log('\n### DE base');
J([...h.matchAll(/href="([^"]+)"/gi)].map((m) => m[1]).filter((x) => /lese|verstehen|artikel|article/i.test(x)));
h = await get('https://english.lingolia.com/en/reading');
console.log('\n### EN base');
J([...h.matchAll(/href="([^"]+)"/gi)].map((m) => m[1]).filter((x) => /reading|article/i.test(x)));
h = await get('https://www.nachrichtenleicht.de/');
console.log('\n### NL home');
J([...h.matchAll(/href="(\/[^"]*?)"/gi)].map((m) => m[1]).filter((x) => !x.startsWith('/static') && !x.includes('.ico') && !x.includes('.png') && x.length > 3));
h = await get('https://www.catalogue.irlc.msu.ru/media-texts-catalogue/all/texts/b1');
console.log('\n### MSU b1');
J([...h.matchAll(/href="([^"]+)"/gi)].map((m) => m[1]).filter((x) => /texts/i.test(x)));
