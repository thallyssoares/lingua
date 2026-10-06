const r = await fetch('https://cuentosparadormir.com/cuentos-cortos', { headers: { 'user-agent': 'Mozilla/5.0' } });
const h = await r.text();
const links = [...new Set([...h.matchAll(/href="([^"]+)"/gi)].map((m) => m[1]).filter((x) => /infantiles|valores/i.test(x)))];
console.log('n=' + links.length);
console.log(links.slice(0, 30).join('\n'));
