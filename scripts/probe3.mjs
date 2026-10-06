// Probe3: lista todos os artigos por listagem.
const PAGES = [
  'https://deutsch.lingolia.com/de/leseverstehen',
  'https://english.lingolia.com/en/reading',
  'https://espanol.lingolia.com/es/comprension-lectora',
  'https://espanol.lingolia.com/es/comprension-lectora/a1',
  'https://www.catalogue.irlc.msu.ru/media-texts-catalogue/all/texts/a1',
  'https://www.catalogue.irlc.msu.ru/media-texts-catalogue/all/texts/a2',
  'https://www.catalogue.irlc.msu.ru/media-texts-catalogue/all/texts/b1?page=2',
  'https://www.catalogue.irlc.msu.ru/media-texts-catalogue/all/texts/b2',
  'https://www.catalogue.irlc.msu.ru/media-texts-catalogue/all/texts/c1',
];
for (const url of PAGES) {
  try {
    const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Lingua personal reader)' } });
    const h = await r.text();
    const arts = [...new Set([...h.matchAll(/href="([^"]*\/articles\/[^"]+)"/gi)].map((m) => m[1]))];
    const msu = [...new Set([...h.matchAll(/href="([^"]*all\/texts\/[a-z0-9]+[a-z0-9\-,\._\/]*?)"/gi)].map((m) => m[1]).filter((x) => !/all\/texts\/?([?]|$)/.test(x) && !/\?page/.test(x) && (x.match(/\//g) || []).length >= 2))];
    console.log(`\n### ${url} [${r.status}]`);
    console.log('articles: ' + arts.length, JSON.stringify(arts).slice(0, 3000));
    if (msu.length) console.log('msu: ' + msu.length, JSON.stringify(msu).slice(0, 3000));
  } catch (e) { console.log(`\n### ${url}\nERRO: ${e.message}`); }
}
