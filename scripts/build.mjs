import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = 'https://cosscoll.github.io/Is-my-coin-rare-/';
const pieces = JSON.parse(fs.readFileSync(path.join(root, 'data/pieces.json'), 'utf8'));
const billets = JSON.parse(fs.readFileSync(path.join(root, 'data/billets.json'), 'utf8'));
const buildDate = new Date().toISOString().slice(0, 10);

const esc = value => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const txt = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const short = (value, max) => txt(value).length <= max
  ? txt(value)
  : txt(value).slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
const rareLabel = r => ({'commune':'Commune','peu-commune':'Peu commune','recherchee':'Recherchée','rare':'Rare','tres-rare':'Très rare'}[r] || r || 'Non classée');
function yearsFor(item) {
  const nums = [...String(item.annees || '').matchAll(/(19|20)\d{2}/g)].map(m => Number(m[0]));
  if (!nums.length) return [];
  const start = nums[0];
  const end = /en cours/i.test(item.annees || '') ? 2026 : (nums[1] || start);
  const out = [];
  for (let y = start; y <= Math.min(end, 2026); y++) out.push(y);
  return out;
}

const slug = value => String(value ?? '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function stableCompare(a, b) {
  const aa = slug(a);
  const bb = slug(b);
  return aa < bb ? -1 : aa > bb ? 1 : 0;
}

function ensureDir(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}
function write(rel, content) {
  const file = path.join(root, rel);
  ensureDir(file);
  fs.writeFileSync(file, content);
}

function compactRelated(x) {
  return { id:x.id, pays:x.pays, nom:x.nom || null, valeur:x.valeur, annees:x.annees, rarete:x.rarete };
}

function coinPage(item){
  const rel=`pieces/${item.id}.html`,url=site+rel,subject=item.nom||`${item.valeur} ${item.pays}`;
  const title=short(`${subject} ${item.pays} ${item.annees} : valeur et rareté | EuroRare`,68);
  const desc=short(`${subject} ${item.pays} ${item.annees} : ${txt(item.tirage)}. Valeur estimée, critères d'identification et visuels de référence.`,158);
  const img=item.photo?.recto||'',sourceHref=item.source_url||item.photo?.source_url||'';
  const criteria=(item.criteres||[]).map(c=>`<li><strong>${esc(c.titre)}</strong> — ${esc(c.detail)}</li>`).join('');
  const itemYears=yearsFor(item);
  const yearLinks=itemYears.length<=8?itemYears.map(y=>`<a href="../annees/${y}.html">${y}</a>`).join(' · '):`${itemYears[0]}–${itemYears[itemYears.length-1]}`;
  const related=pieces.filter(x=>x.id!==item.id&&x.pays===item.pays).slice(0,4).map(compactRelated);
  const pageData=JSON.stringify({item,related}).replace(/</g,'\\u003c');
  const schema={'@context':'https://schema.org','@graph':[
    {'@type':'WebSite','@id':site+'#website',url:site,name:'EuroRare',inLanguage:'fr-FR'},
    {'@type':'WebPage','@id':url,url,name:title,description:desc,inLanguage:'fr-FR',isPartOf:{'@id':site+'#website'}},
    {'@type':'BreadcrumbList',itemListElement:[
      {'@type':'ListItem',position:1,name:'EuroRare',item:site},{'@type':'ListItem',position:2,name:'Pièces',item:site+'pieces.html'},{'@type':'ListItem',position:3,name:`${item.pays} ${item.annees}`,item:url}
    ]}
  ]};
  return `<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${url}">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<meta property="og:type" content="article"><meta property="og:site_name" content="EuroRare"><meta property="og:locale" content="fr_FR">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}">
${img?`<meta property="og:image" content="${esc(img)}"><meta name="twitter:card" content="summary_large_image">`:'<meta name="twitter:card" content="summary">'}
<link rel="stylesheet" href="../assets/css/style.css"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>
</head><body data-base="../" data-type="piece" data-id="${esc(item.id)}">
<div id="hud-root"></div><main class="wrap detail-hero"><div id="detail-root"><article class="seo-fallback card">
<h1>${esc(item.pays)} — ${esc(item.valeur)} · ${esc(item.annees)}</h1>${item.nom?`<p><strong>${esc(item.nom)}</strong></p>`:''}
<p>${esc(item.explication)}</p>
<dl class="seo-facts"><div><dt>Rareté</dt><dd>${esc(rareLabel(item.rarete))}</dd></div><div><dt>Tirage</dt><dd>${esc(item.tirage)}</dd></div><div><dt>Catégorie</dt><dd>${esc(item.categorie)}</dd></div>${item.date_emission?`<div><dt>Date d’émission</dt><dd>${esc(item.date_emission)}</dd></div>`:''}</dl>
${criteria?`<h2>Critères d’identification</h2><ul>${criteria}</ul>`:''}
<p><strong>Parcourir :</strong> <a href="../pays/${slug(item.pays)}.html">${esc(item.pays)}</a>${itemYears.length?' · '+yearLinks:''}</p>
<p><strong>Source :</strong> ${sourceHref?`<a href="${esc(sourceHref)}" target="_blank" rel="noopener">${esc(item.source||'Source de référence')}</a>`:esc(item.source||'Source de référence')}</p>
</article></div></main><div id="footer-root"></div>
<script type="application/json" id="page-data">${pageData}</script>
<script src="../assets/js/main.js"></script><script src="../assets/js/detail.js"></script>
</body></html>`;
}

function banknotePage(item){
  const rel=`billets/${item.id}.html`,url=site+rel,label=item.serie||item.pays;
  const title=short(`${item.valeur} ${label} : valeur, rareté et identification | EuroRare`,68);
  const desc=short(`${item.valeur}, ${label}, ${item.annees}. Critères d'identification, rareté, estimation de revente et références de marché.`,158);
  const img=item.photo?.recto||'',sourceHref=item.source_url||item.photo?.source_url||'';
  const criteria=(item.criteres||[]).map(c=>`<li><strong>${esc(c.titre)}</strong> — ${esc(c.detail)}</li>`).join('');
  const related=billets.filter(x=>x.id!==item.id&&(x.serie===item.serie||x.pays===item.pays)).slice(0,4).map(compactRelated);
  const pageData=JSON.stringify({item,related}).replace(/</g,'\\u003c');
  const schema={'@context':'https://schema.org','@graph':[
    {'@type':'WebSite','@id':site+'#website',url:site,name:'EuroRare',inLanguage:'fr-FR'},
    {'@type':'WebPage','@id':url,url,name:title,description:desc,inLanguage:'fr-FR',isPartOf:{'@id':site+'#website'}},
    {'@type':'BreadcrumbList',itemListElement:[
      {'@type':'ListItem',position:1,name:'EuroRare',item:site},{'@type':'ListItem',position:2,name:'Billets',item:site+'billets.html'},{'@type':'ListItem',position:3,name:`${item.valeur} ${item.annees}`,item:url}
    ]}
  ]};
  return `<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${url}">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<meta property="og:type" content="article"><meta property="og:site_name" content="EuroRare"><meta property="og:locale" content="fr_FR">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}">
${img?`<meta property="og:image" content="${esc(img)}"><meta name="twitter:card" content="summary_large_image">`:'<meta name="twitter:card" content="summary">'}
<link rel="stylesheet" href="../assets/css/style.css"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>
</head><body data-base="../" data-type="billet" data-id="${esc(item.id)}">
<div id="hud-root"></div><main class="wrap detail-hero"><div id="detail-root"><article class="seo-fallback card">
<h1>${esc(item.valeur)} — ${esc(label)}</h1><p><strong>${esc(item.annees)}</strong></p><p>${esc(item.explication)}</p>
<dl class="seo-facts"><div><dt>Rareté</dt><dd>${esc(rareLabel(item.rarete))}</dd></div><div><dt>Repère de tirage</dt><dd>${esc(item.tirage)}</dd></div></dl>
${criteria?`<h2>Critères d’identification</h2><ul>${criteria}</ul>`:''}
<p><strong>Source :</strong> ${sourceHref?`<a href="${esc(sourceHref)}" target="_blank" rel="noopener">${esc(item.source||'Source de référence')}</a>`:esc(item.source||'Source de référence')}</p>
</article></div></main><div id="footer-root"></div>
<script type="application/json" id="page-data">${pageData}</script>
<script src="../assets/js/main.js"></script><script src="../assets/js/detail.js"></script>
</body></html>`;
}

function countryPage(country) {
  const items = pieces.filter(x => x.pays === country);
  const rel = `pays/${slug(country)}.html`;
  const url = site + rel;
  const title = `Pièces euro ${country} : rareté, valeurs et millésimes | EuroRare`;
  const desc = short(`Catalogue EuroRare des pièces en euro de ${country} : ${items.length} fiches avec tirages, visuels, critères d'identification, rareté et estimations.`, 158);
  const list = items.map(i => `<li><a href="../pieces/${esc(i.id)}.html">${esc(i.nom || `${i.valeur} ${i.annees}`)}</a> — ${esc(i.annees)} · ${esc(i.tirage)}</li>`).join('\n');
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><meta name="robots" content="index,follow">
<link rel="canonical" href="${url}"><link rel="icon" href="../favicon.svg" type="image/svg+xml">
<meta property="og:type" content="website"><meta property="og:site_name" content="EuroRare"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}">
<link rel="stylesheet" href="../assets/css/style.css"></head>
<body data-base="../"><div id="hud-root"></div><main class="wrap country-page"><div class="page-head"><h1>Pièces euro — ${esc(country)}</h1><p>${esc(desc)}</p></div>
<section class="card country-catalogue"><h2>${items.length} fiche${items.length > 1 ? 's' : ''}</h2><ul>${list}</ul></section>
<p class="country-back"><a class="btn btn-ghost" href="../pieces.html">← Retour au catalogue complet</a></p></main>
<div id="footer-root"></div><script src="../assets/js/main.js"></script><script>renderHUD('pieces',{label:'Pièces',href:'../pieces.html'});renderFooter();</script>
</body></html>`;
}


function yearPage(year){
  const items=pieces.filter(x=>yearsFor(x).includes(year)).sort((a,b)=>slug(a.pays).localeCompare(slug(b.pays))||slug(a.nom||a.id).localeCompare(slug(b.nom||b.id)));
  const rel=`annees/${year}.html`,url=site+rel;
  const title=`Pièces euro ${year} : émissions, rareté et valeurs | EuroRare`;
  const desc=short(`Catalogue EuroRare des pièces en euro liées à ${year} : ${items.length} fiches avec pays, tirages, rareté, visuels et liens vers les fiches détaillées.`,158);
  const list=items.map(i=>`<li><a href="../pieces/${esc(i.id)}.html">${esc(i.nom||`${i.valeur} ${i.pays}`)}</a> — ${esc(i.pays)} · ${esc(i.tirage)}</li>`).join('\n');
  const schema={'@context':'https://schema.org','@type':'CollectionPage',url,name:title,description:desc,inLanguage:'fr-FR'};
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><meta name="robots" content="index,follow">
<link rel="canonical" href="${url}"><link rel="icon" href="../favicon.svg"><link rel="stylesheet" href="../assets/css/style.css">
<meta property="og:type" content="website"><meta property="og:site_name" content="EuroRare"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}">
<script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script></head>
<body data-base="../"><div id="hud-root"></div><main class="wrap country-page"><div class="page-head"><h1>Pièces euro — ${year}</h1><p>${esc(desc)}</p></div>
<section class="card country-catalogue"><h2>${items.length} fiche${items.length>1?'s':''}</h2><ul>${list}</ul></section>
<p class="country-back"><a class="btn btn-ghost" href="../pieces.html?annee=${year}">Voir ${year} dans le catalogue filtrable →</a></p>
</main><div id="footer-root"></div><script src="../assets/js/main.js"></script><script>renderHUD('pieces',{label:'Pièces',href:'../pieces.html'});renderFooter();</script></body></html>`;
}

function rareGuidePage() {
  const rank = { 'tres-rare': 2, rare: 1 };
  const rare = pieces.filter(x => x.valeur === '2€' && ['rare','tres-rare'].includes(x.rarete))
    .sort((a,b) => (rank[b.rarete] - rank[a.rarete]) ||
      ((a.tirage_nombre ?? Number.MAX_SAFE_INTEGER) - (b.tirage_nombre ?? Number.MAX_SAFE_INTEGER)) ||
      stableCompare(a.pays, b.pays));
  const cards = rare.map(x => `<article class="rare-list-item card">
<div><strong><a href="../pieces/${esc(x.id)}.html">${esc(x.nom || `${x.valeur} ${x.pays} ${x.annees}`)}</a></strong>
<p>${esc(x.pays)} · ${esc(x.annees)} · ${esc(x.tirage)}</p></div>
<span class="rarete-badge ${esc(x.rarete)}">${x.rarete === 'tres-rare' ? 'Très rare' : 'Rare'}</span>
</article>`).join('\n');
  return `<!DOCTYPE html><html lang="fr"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pièces de 2 euros rares : sélection du catalogue | EuroRare</title>
<meta name="description" content="Découvrez les pièces de 2 euros classées rares ou très rares dans le catalogue EuroRare, avec tirage, année, pays et fiche détaillée.">
<meta name="robots" content="index,follow"><link rel="canonical" href="${site}guides/pieces-2-euros-rares.html">
<link rel="icon" href="../favicon.svg"><link rel="stylesheet" href="../assets/css/style.css">
</head><body data-base="../"><div id="hud-root"></div>
<main class="wrap editorial-page"><article class="editorial-prose">
<h1>Pièces de 2 euros rares dans le catalogue EuroRare</h1>
<p>Cette sélection est générée automatiquement depuis les fiches actuellement classées <strong>Rare</strong> ou <strong>Très rare</strong> dans EuroRare. Elle reflète le catalogue vérifié disponible, sans prétendre qu’un faible tirage suffit à déterminer le prix.</p>
<div class="editorial-note">Un faible tirage n’est pas synonyme de prix élevé. L’état, la demande, la présentation officielle et les transactions réellement conclues doivent toujours être vérifiés.</div>
<h2>${rare.length} fiches actuellement classées Rare ou Très rare</h2>
<div class="rare-list">${cards}</div>
</article></main><div id="footer-root"></div>
<script src="../assets/js/main.js"></script><script>renderHUD(null,{label:'Guides',href:'index.html'});renderFooter();</script>
</body></html>`;
}

function syncCatalogueShells(countries, years) {
  const countryLinks = '<nav class="country-links" aria-label="Parcourir par pays">' +
    countries.map(country => '<a class="chip" href="pays/' + slug(country) + '.html">' + esc(country) + '</a>').join('') +
    '</nav>';
  const yearLinks = '<nav class="country-links year-links" aria-label="Parcourir par année">' +
    years.slice().reverse().map(year => '<a class="chip" href="annees/' + year + '.html">' + year + '</a>').join('') +
    '</nav>';

  let piecesHtml = fs.readFileSync(path.join(root, 'pieces.html'), 'utf8');
  piecesHtml = piecesHtml.replace(
    /<meta name="description" content="Parcourez \d+ fiches de pièces en euro[^"]*">/,
    '<meta name="description" content="Parcourez ' + pieces.length + ' fiches de pièces en euro avec photos, tirages, rareté, critères d’identification et estimations de revente.">'
  );
  if (/<nav class="country-links"[^>]*aria-label="Parcourir par pays"[\s\S]*?<\/nav>/.test(piecesHtml)) {
    piecesHtml = piecesHtml.replace(/<nav class="country-links"[^>]*aria-label="Parcourir par pays"[\s\S]*?<\/nav>/, countryLinks);
  }
  if (/<nav class="country-links year-links"[\s\S]*?<\/nav>/.test(piecesHtml)) {
    piecesHtml = piecesHtml.replace(/<nav class="country-links year-links"[\s\S]*?<\/nav>/, yearLinks);
  } else {
    piecesHtml = piecesHtml.replace(countryLinks, countryLinks + '\n' + yearLinks);
  }
  const pieceDesc = 'Parcourez ' + pieces.length + ' fiches de pièces en euro avec photos, tirages, rareté, critères d’identification et estimations de revente.';
  piecesHtml = piecesHtml.replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="' + pieceDesc + '">');
  write('pieces.html', piecesHtml); // og:description synchronisé

  let billetsHtml = fs.readFileSync(path.join(root, 'billets.html'), 'utf8');
  billetsHtml = billetsHtml.replace(
    /<meta name="description" content="Parcourez \d+ fiches de billets euro[^"]*">/,
    '<meta name="description" content="Parcourez ' + billets.length + ' fiches de billets euro : coupures des deux séries, signatures, numéros, codes imprimeur, erreurs et estimations.">'
  );
  const billetDesc = 'Parcourez ' + billets.length + ' fiches de billets euro : coupures des deux séries, signatures, numéros, codes imprimeur, erreurs et estimations.';
  billetsHtml = billetsHtml.replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="' + billetDesc + '">');
  write('billets.html', billetsHtml);

  let indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  indexHtml = indexHtml
    .replace(/(<div class="stat-num" id="stat-pieces">)\d+(<\/div>)/, '$1' + pieces.length + '$2')
    .replace(/(<div class="stat-num" id="stat-billets">)\d+(<\/div>)/, '$1' + billets.length + '$2')
    .replace(/(<div class="stat-num" id="stat-pays">)\d+(<\/div>)/, '$1' + countries.length + '$2');
  write('index.html', indexHtml);
}

for (const item of pieces) write(`pieces/${item.id}.html`, coinPage(item));
for (const item of billets) write(`billets/${item.id}.html`, banknotePage(item));

const countries = [...new Set(pieces.map(x => x.pays))].sort(stableCompare);
const years = [...new Set(pieces.flatMap(yearsFor))].sort((a,b) => a-b);
for (const country of countries) write(`pays/${slug(country)}.html`, countryPage(country));
for (const year of years) write(`annees/${year}.html`, yearPage(year));
syncCatalogueShells(countries, years);
write('guides/pieces-2-euros-rares.html', rareGuidePage());

const fixed = [
  '', 'pieces.html', 'billets.html', 'methodologie.html', 'sources.html', 'confidentialite.html',
  'guides/', 'guides/pieces-2-euros-rares.html', 'guides/piece-2-euros-rare.html', 'guides/billet-euro-rare.html',
  'guides/etat-conservation.html', 'guides/vendre-piece-rare.html'
];
const urls = [
  ...fixed.map(x => site + x),
  ...countries.map(c => site + 'pays/' + slug(c) + '.html'),
  ...years.map(y => site + 'annees/' + y + '.html'),
  ...pieces.map(i => site + 'pieces/' + i.id + '.html'),
  ...billets.map(i => site + 'billets/' + i.id + '.html')
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${esc(u)}</loc><lastmod>${buildDate}</lastmod></url>`).join('\n') +
  '\n</urlset>\n';
write('sitemap.xml', sitemap);

console.log(`Generated ${pieces.length} coin pages, ${billets.length} banknote pages, ${countries.length} country pages, ${years.length} year pages and ${urls.length} sitemap URLs.`);
