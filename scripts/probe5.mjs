// Probe5: Fabulang hub, dtogo B1 archive, MSU estrutura, BBC extração.
async function get(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Lingua personal reader)' } });
  return { status: r.status, h: await r.text() };
}
let { status, h } = await get('https://www.fabulang.com/en/de');
console.log(`\n### fabulang hub [${status}] bytes=${h.length}`);
const faba = [...new Set([...h.matchAll(/href="([^"]+)"/gi)].map((m) => m[1]).filter((x) => /stor/i.test(x)))].slice(0, 25);
console.log(JSON.stringify(faba, null, 1).slice(0, 2000));
({ status, h } = await get('https://www.deutsch-to-go.de/lernen/hoertexte-mittel/hoertexte-mittel-b1/'));
console.log(`\n### dtogo b1 [${status}] bytes=${h.length}`);
const dtgo = [...new Set([...h.matchAll(/href="([^"]+)"/gi)].map((m) => m[1]).filter((x) => /deutsch-to-go\.de\/[^"]+\/$/.test(x) && !x.includes('/lernen/')))].slice(0, 25);
console.log(JSON.stringify(dtgo, null, 1).slice(0, 2000));
({ status, h } = await get('https://www.catalogue.irlc.msu.ru/media-texts-catalogue/all/texts/b1/vstrecha-v-samolyote'));
console.log(`\n### MSU sample [${status}] bytes=${h.length}`);
const ps = [...h.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).filter(Boolean);
console.log(`parágrafos: ${ps.length}`);
ps.slice(0, 14).forEach((p, i) => console.log(`${i}: ${p.slice(0, 130)}`));
({ status, h } = await get('https://www.bbc.co.uk/learningenglish/features/the_reading_room/ep-260625'));
console.log(`\n### BBC sample [${status}] bytes=${h.length}`);
const zone = h.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1] ?? h;
const bp = [...zone.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).filter((p) => p.split(' ').length >= 10);
console.log(`parágrafos>=10w: ${bp.length}, palavras~${bp.join(' ').split(' ').length}`);
bp.slice(0, 4).forEach((p, i) => console.log(`${i}: ${p.slice(0, 160)}`));
