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
  else for (const k of ['recto','verso','source_url']) if (!item.photo[k]) errors.push(`piece ${item.id}: photo.${k} absent`);
}

for (const file of ['index.html','pieces.html','billets.html','robots.txt','sitemap.xml','404.html','favicon.svg','methodologie.html','sources.html','confidentialite.html']) {
  if (!fs.existsSync(path.join(root,file))) errors.push(`fichier obligatoire absent: ${file}`);
}

const sitemap = fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
for (const item of pieces) if (!sitemap.includes('/pieces/' + item.id + '.html')) errors.push(`sitemap: pièce absente ${item.id}`);
for (const item of billets) if (!sitemap.includes('/billets/' + item.id + '.html')) errors.push(`sitemap: billet absent ${item.id}`);

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
