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
const slug = value => String(value ?? '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function ensureDir(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}
function write(rel, content) {
  const file = path.join(root, rel);
  ensureDir(file);
  fs.writeFileSync(file, content);
}

function coinPage(item) {
  const rel = `pieces/${item.id}.html`;
  const url = site + rel;
  const subject = item.nom || `${item.valeur} ${item.pays}`;
  const title = short(`${subject} ${item.pays} ${item.annees} : valeur et rareté | EuroRare`, 68);
  const desc = short(`${subject} ${item.pays} ${item.annees} : ${txt(item.tirage)}. Valeur estimée, critères d'identification et visuels de référence.`, 158);
  const img = item.photo?.recto || '';
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type':'WebSite', '@id':site + '#website', url:site, name:'EuroRare', inLanguage:'fr-FR' },
      { '@type':'WebPage', '@id':url, url, name:title, description:desc, inLanguage:'fr-FR', isPartOf:{'@id':site + '#website'} },
      { '@type':'BreadcrumbList', itemListElement:[
        {'@type':'ListItem', position:1, name:'EuroRare', item:site},
        {'@type':'ListItem', position:2, name:'Pièces', item:site + 'pieces.html'},
        {'@type':'ListItem', position:3, name:`${item.pays} ${item.annees}`, item:url}
      ]}
    ]
  };
  return `<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${url}">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<meta property="og:type" content="article"><meta property="og:site_name" content="EuroRare"><meta property="og:locale" content="fr_FR">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}">
${img ? `<meta property="og:image" content="${esc(img)}"><meta name="twitter:card" content="summary_large_image">` : '<meta name="twitter:card" content="summary">'}
<link rel="stylesheet" href="../assets/css/style.css"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>
</head><body data-base="../" data-type="piece" data-id="${esc(item.id)}">
<div id="hud-root"></div><main class="wrap detail-hero"><div id="detail-root"><article class="seo-fallback card">
<h1>${esc(item.pays)} — ${esc(item.valeur)} · ${esc(item.annees)}</h1>
${item.nom ? `<p><strong>${esc(item.nom)}</strong></p>` : ''}
<p>${esc(short(item.explication, 450))}</p><p><strong>Tirage :</strong> ${esc(item.tirage)}</p>
</article></div></main><div id="footer-root"></div>
<script src="../assets/js/main.js"></script><script src="../assets/js/detail.js"></script>
</body></html>`;
}

function banknotePage(item) {
  const rel = `billets/${item.id}.html`;
  const url = site + rel;
  const label = item.serie || item.pays;
  const title = short(`${item.valeur} ${label} : valeur, rareté et identification | EuroRare`, 68);
  const desc = short(`${item.valeur}, ${label}, ${item.annees}. Critères d'identification, rareté, estimation de revente et références de marché.`, 158);
  const img = item.photo?.recto || '';
  const schema = {
    '@context':'https://schema.org',
    '@graph':[
      {'@type':'WebSite','@id':site+'#website',url:site,name:'EuroRare',inLanguage:'fr-FR'},
      {'@type':'WebPage','@id':url,url,name:title,description:desc,inLanguage:'fr-FR',isPartOf:{'@id':site+'#website'}},
      {'@type':'BreadcrumbList',itemListElement:[
        {'@type':'ListItem',position:1,name:'EuroRare',item:site},
        {'@type':'ListItem',position:2,name:'Billets',item:site+'billets.html'},
        {'@type':'ListItem',position:3,name:`${item.valeur} ${item.annees}`,item:url}
      ]}
    ]
  };
  return `<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${url}">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<meta property="og:type" content="article"><meta property="og:site_name" content="EuroRare"><meta property="og:locale" content="fr_FR">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}">
${img ? `<meta property="og:image" content="${esc(img)}"><meta name="twitter:card" content="summary_large_image">` : '<meta name="twitter:card" content="summary">'}
<link rel="stylesheet" href="../assets/css/style.css"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>
</head><body data-base="../" data-type="billet" data-id="${esc(item.id)}">
<div id="hud-root"></div><main class="wrap detail-hero"><div id="detail-root"><article class="seo-fallback card">
<h1>${esc(item.valeur)} — ${esc(label)}</h1><p><strong>${esc(item.annees)}</strong></p><p>${esc(short(item.explication,450))}</p>
</article></div></main><div id="footer-root"></div>
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

function syncCatalogueShells(countries) {
  const countryLinks = '<nav class="country-links" aria-label="Parcourir par pays">' +
    countries.map(country => '<a class="chip" href="pays/' + slug(country) + '.html">' + esc(country) + '</a>').join('') +
    '</nav>';

  let piecesHtml = fs.readFileSync(path.join(root, 'pieces.html'), 'utf8');
  piecesHtml = piecesHtml.replace(
    /<meta name="description" content="Parcourez \d+ fiches de pièces en euro[^"]*">/,
    '<meta name="description" content="Parcourez ' + pieces.length + ' fiches de pièces en euro avec photos, tirages, rareté, critères d’identification et estimations de revente.">'
  );
  if (/<nav class="country-links"[\s\S]*?<\/nav>/.test(piecesHtml)) {
    piecesHtml = piecesHtml.replace(/<nav class="country-links"[\s\S]*?<\/nav>/, countryLinks);
  }
  write('pieces.html', piecesHtml);

  let billetsHtml = fs.readFileSync(path.join(root, 'billets.html'), 'utf8');
  billetsHtml = billetsHtml.replace(
    /<meta name="description" content="Parcourez \d+ fiches de billets euro[^"]*">/,
    '<meta name="description" content="Parcourez ' + billets.length + ' fiches de billets euro : coupures des deux séries, signatures, numéros, codes imprimeur, erreurs et estimations.">'
  );
  write('billets.html', billetsHtml);
}

for (const item of pieces) write(`pieces/${item.id}.html`, coinPage(item));
for (const item of billets) write(`billets/${item.id}.html`, banknotePage(item));

const countries = [...new Set(pieces.map(x => x.pays))].sort((a,b) => a.localeCompare(b, 'fr'));
for (const country of countries) write(`pays/${slug(country)}.html`, countryPage(country));
syncCatalogueShells(countries);

const fixed = [
  '', 'pieces.html', 'billets.html', 'methodologie.html', 'sources.html', 'confidentialite.html',
  'guides/', 'guides/pieces-2-euros-rares.html', 'guides/piece-2-euros-rare.html', 'guides/billet-euro-rare.html',
  'guides/etat-conservation.html', 'guides/vendre-piece-rare.html'
];
const urls = [
  ...fixed.map(x => site + x),
  ...countries.map(c => site + 'pays/' + slug(c) + '.html'),
  ...pieces.map(i => site + 'pieces/' + i.id + '.html'),
  ...billets.map(i => site + 'billets/' + i.id + '.html')
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${esc(u)}</loc><lastmod>${buildDate}</lastmod></url>`).join('\n') +
  '\n</urlset>\n';
write('sitemap.xml', sitemap);

console.log(`Generated ${pieces.length} coin pages, ${billets.length} banknote pages, ${countries.length} country pages and ${urls.length} sitemap URLs.`);
