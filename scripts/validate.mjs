import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const readJSON = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const pieces = readJSON('data/pieces.json');
const billets = readJSON('data/billets.json');
const errors = [];

function checkItems(items, type) {
  const ids = new Set();
  for (const item of items) {
    for (const key of ['id','pays','valeur','annees','categorie','tirage','criteres','rarete','explication','source']) {
      if (item[key] === undefined || item[key] === null || item[key] === '') errors.push(`${type} ${item.id || '?'}: champ manquant ${key}`);
    }
    if (ids.has(item.id)) errors.push(`${type}: id dupliqué ${item.id}`);
    ids.add(item.id);
    if (!Array.isArray(item.criteres) || !item.criteres.length) errors.push(`${type} ${item.id}: critères absents`);
    const staticPath = path.join(root, type === 'piece' ? 'pieces' : 'billets', item.id + '.html');
    if (!fs.existsSync(staticPath)) errors.push(`${type} ${item.id}: page SEO absente`);
  }
}
checkItems(pieces, 'piece');
checkItems(billets, 'billet');

for (const item of pieces) {
  if (!item.photo) errors.push(`piece ${item.id}: photo absente`);
  else for (const k of ['recto','verso','source_url']) {
    if (!item.photo[k]) errors.push(`piece ${item.id}: photo.${k} absent`);
    else if (!/^https:\/\//.test(item.photo[k])) errors.push(`piece ${item.id}: photo.${k} doit être HTTPS`);
  }
  if (item.source_url && !/^https:\/\//.test(item.source_url)) errors.push(`piece ${item.id}: source_url doit être HTTPS`);
}
for (const item of billets) {
  if (item.source_url && !/^https:\/\//.test(item.source_url)) errors.push(`billet ${item.id}: source_url doit être HTTPS`);
  if (item.photo) for (const k of ['recto','verso','source_url']) {
    if (item.photo[k] && !/^https:\/\//.test(item.photo[k])) errors.push(`billet ${item.id}: photo.${k} doit être HTTPS`);
  }
}

for (const file of ['index.html','pieces.html','billets.html','robots.txt','sitemap.xml','404.html','favicon.svg','methodologie.html','sources.html','confidentialite.html']) {
  if (!fs.existsSync(path.join(root,file))) errors.push(`fichier obligatoire absent: ${file}`);
}

const sitemap = fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const robots = fs.readFileSync(path.join(root,'robots.txt'),'utf8');
if (!robots.includes('Sitemap: https://cosscoll.github.io/Is-my-coin-rare-/sitemap.xml')) errors.push('robots: sitemap absent ou incorrect');
for (const item of pieces) {
  if (!sitemap.includes('/pieces/' + item.id + '.html')) errors.push(`sitemap: pièce absente ${item.id}`);
  const file = path.join(root, 'pieces', item.id + '.html');
  if (fs.existsSync(file)) {
    const html = fs.readFileSync(file, 'utf8');
    const expected = 'https://cosscoll.github.io/Is-my-coin-rare-/pieces/' + item.id + '.html';
    if (!html.includes('<link rel="canonical" href="' + expected + '">')) errors.push(`piece ${item.id}: canonical absent ou incorrect`);
    if (!html.includes('<meta name="description"')) errors.push(`piece ${item.id}: meta description absente`);
    const embedded = html.match(/<script type="application\/json" id="page-data">([\s\S]*?)<\/script>/);
    if (!embedded) errors.push(`piece ${item.id}: page-data absent`);
    else {
      try {
        const payload = JSON.parse(embedded[1]);
        if (payload.item?.id !== item.id) errors.push(`piece ${item.id}: page-data incohérent`);
        if (!Array.isArray(payload.related) || payload.related.length > 4) errors.push(`piece ${item.id}: recommandations embarquées invalides`);
      } catch (_) { errors.push(`piece ${item.id}: page-data JSON invalide`); }
    }
  }
}
for (const item of billets) {
  if (!sitemap.includes('/billets/' + item.id + '.html')) errors.push(`sitemap: billet absent ${item.id}`);
  const file = path.join(root, 'billets', item.id + '.html');
  if (fs.existsSync(file)) {
    const html = fs.readFileSync(file, 'utf8');
    const expected = 'https://cosscoll.github.io/Is-my-coin-rare-/billets/' + item.id + '.html';
    if (!html.includes('<link rel="canonical" href="' + expected + '">')) errors.push(`billet ${item.id}: canonical absent ou incorrect`);
    if (!html.includes('<meta name="description"')) errors.push(`billet ${item.id}: meta description absente`);
    const embedded = html.match(/<script type="application\/json" id="page-data">([\s\S]*?)<\/script>/);
    if (!embedded) errors.push(`billet ${item.id}: page-data absent`);
    else {
      try {
        const payload = JSON.parse(embedded[1]);
        if (payload.item?.id !== item.id) errors.push(`billet ${item.id}: page-data incohérent`);
        if (!Array.isArray(payload.related) || payload.related.length > 4) errors.push(`billet ${item.id}: recommandations embarquées invalides`);
      } catch (_) { errors.push(`billet ${item.id}: page-data JSON invalide`); }
    }
  }
}


const piecesHtml = fs.readFileSync(path.join(root,'pieces.html'),'utf8');
const billetsHtml = fs.readFileSync(path.join(root,'billets.html'),'utf8');
const rareGuide = fs.readFileSync(path.join(root,'guides/pieces-2-euros-rares.html'),'utf8');
const countryCount = new Set(pieces.map(x => x.pays)).size;
const requiredCountryCount = 25;
const yearsFor = item => {
  const nums = [...String(item.annees || '').matchAll(/(19|20)\d{2}/g)].map(m => Number(m[0]));
  if (!nums.length) return [];
  const start = nums[0];
  const end = /en cours/i.test(item.annees || '') ? 2026 : (nums[1] || start);
  const out = [];
  for (let y = start; y <= Math.min(end, 2026); y++) out.push(y);
  return out;
};
const catalogueYears = [...new Set(pieces.flatMap(yearsFor))].sort((a,b) => a-b);
const countrySlug = value => String(value || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
if (countryCount < requiredCountryCount) errors.push(`catalogue: ${countryCount} juridictions couvertes, attendu au moins ${requiredCountryCount}`);
for (const country of new Set(pieces.map(x => x.pays))) {
  const rel = path.join('pays', countrySlug(country) + '.html');
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) errors.push(`page pays absente: ${rel}`);
  else {
    const html = fs.readFileSync(file, 'utf8');
    const expected = 'https://cosscoll.github.io/Is-my-coin-rare-/pays/' + countrySlug(country) + '.html';
    if (!html.includes('<link rel="canonical" href="' + expected + '">')) errors.push(`page pays ${country}: canonical absent ou incorrect`);
  }
}
for (const year of catalogueYears) {
  const rel = path.join('annees', year + '.html');
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) errors.push(`page année absente: ${rel}`);
  else {
    const html = fs.readFileSync(file, 'utf8');
    const expected = 'https://cosscoll.github.io/Is-my-coin-rare-/annees/' + year + '.html';
    if (!html.includes('<link rel="canonical" href="' + expected + '">')) errors.push(`page année ${year}: canonical absent ou incorrect`);
  }
  if (!sitemap.includes('/annees/' + year + '.html')) errors.push(`sitemap: année absente ${year}`);
}
const expectedSitemapUrls = 12 + countryCount + catalogueYears.length + pieces.length + billets.length;
const sitemapUrlCount = (sitemap.match(/<url>/g) || []).length;
const rareCount = pieces.filter(x => x.valeur === '2€' && ['rare','tres-rare'].includes(x.rarete)).length;

if (!piecesHtml.includes(`Parcourez ${pieces.length} fiches de pièces`)) errors.push(`pieces.html: compteur SEO obsolète (attendu ${pieces.length})`);
if (!billetsHtml.includes(`Parcourez ${billets.length} fiches de billets`)) errors.push(`billets.html: compteur SEO obsolète (attendu ${billets.length})`);
if (!piecesHtml.includes(`<meta property="og:description" content="Parcourez ${pieces.length} fiches`)) errors.push('og:description pièces obsolète');
if (!billetsHtml.includes(`<meta property="og:description" content="Parcourez ${billets.length} fiches`)) errors.push('og:description billets obsolète');
const indexHtml = fs.readFileSync(path.join(root,'index.html'),'utf8');
if (!indexHtml.includes(`id="stat-pieces">${pieces.length}</div>`)) errors.push('index: compteur pièces statique obsolète');
if (!indexHtml.includes(`id="stat-billets">${billets.length}</div>`)) errors.push('index: compteur billets statique obsolète');
if (!indexHtml.includes(`id="stat-pays">${countryCount}</div>`)) errors.push('index: compteur pays statique obsolète');
if (!rareGuide.includes(`<h2>${rareCount} fiches actuellement classées Rare ou Très rare</h2>`)) errors.push(`guide rareté: compteur obsolète (attendu ${rareCount})`);
for (const item of pieces.filter(x => x.valeur === '2€' && ['rare','tres-rare'].includes(x.rarete))) {
  if (!rareGuide.includes('../pieces/' + item.id + '.html')) errors.push(`guide rareté: lien cassé ou absent ${item.id}`);
}
if (sitemapUrlCount !== expectedSitemapUrls) errors.push(`sitemap: ${sitemapUrlCount} URL, attendu ${expectedSitemapUrls}`);

for (const item of pieces) {
  if (item.tirage_nombre !== undefined && (!Number.isInteger(item.tirage_nombre) || item.tirage_nombre < 0)) {
    errors.push(`piece ${item.id}: tirage_nombre invalide`);
  }
  if (/^Commission européenne/.test(item.source || '') && !item.source_url) {
    errors.push(`piece ${item.id}: source_url officielle absente`);
  }
  const p = item.photo || {};
  for (const field of ['recto','verso','source_url']) {
    if (p[field] && !/^https:\/\//.test(p[field])) errors.push(`piece ${item.id}: photo.${field} doit utiliser HTTPS`);
  }
  if (p.source_name === 'Commission européenne' && p.verso?.includes('numista.com') && (!p.credit || !p.licence)) {
    errors.push(`piece ${item.id}: crédit/licence du revers Numista manquant`);
  }
}

const jsFiles=['assets/js/main.js','assets/js/list.js','assets/js/detail.js'];
for(const f of jsFiles){
  const source=fs.readFileSync(path.join(root,f),'utf8');
  try { new Function(source); } catch (e) { errors.push(`${f}: syntaxe JS invalide — ${e.message}`); }
}

if (errors.length) {
  console.error('\nEuroRare validation failed:\n' + errors.map(x=>' - '+x).join('\n'));
  process.exit(1);
}
console.log(`EuroRare OK: ${pieces.length} pièces, ${billets.length} billets, pages SEO et sitemap présents.`);
