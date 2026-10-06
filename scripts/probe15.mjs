const r = await fetch('https://cuentosparadormir.com/infantiles/cuento/el-elefante-fotografo', { headers: { 'user-agent': 'Mozilla/5.0' } });
let h = await r.text();
h = h.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
const divs = [...h.matchAll(/<div[^>]*class="([^"]+)"[^>]*>([\s\S]{300,3000}?)<\/div>/gi)]
  .map((m) => ({ cls: m[1], t: m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() }))
  .filter((x) => x.t.split(' ').length > 30);
console.log('divs:', divs.length);
const seen = new Set();
for (const d of divs) {
  const k = d.t.slice(0, 60);
  if (seen.has(k)) continue;
  seen.add(k);
  console.log(`\n[${d.cls}]\n${d.t.slice(0, 200)}`);
  if (seen.size > 8) break;
}
