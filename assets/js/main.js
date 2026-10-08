/* =========================================================
   EuroRare — utilitaires partagés
   ========================================================= */

const RARETE_LABELS = {
  'commune':       'Commune',
  'peu-commune':   'Peu commune',
  'recherchee':    'Recherchée',
  'rare':          'Rare',
  'tres-rare':     'Très rare'
};

const RARETE_ORDER = ['commune', 'peu-commune', 'recherchee', 'rare', 'tres-rare'];

function raretyLabel(level) {
  return RARETE_LABELS[level] || level;
}

function raretyBadge(level, size) {
  const s = size === 'sm' ? ' style="font-size:11.5px;padding:4px 10px;"' : '';
  return `<span class="rarete" data-level="${level}"${s}><span class="pip"></span>${raretyLabel(level)}</span>`;
}

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error('Impossible de charger ' + path);
  return res.json();
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Basic query-string helpers
function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function siteBase() {
  return (document.body && document.body.dataset && document.body.dataset.base) || '';
}

function countrySlug(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function countryHref(country) {
  return `${siteBase()}pays/${countrySlug(country)}.html`;
}

function detailHref(type, item) {
  const folder = type === 'billet' ? 'billets' : 'pieces';
  return `${siteBase()}${folder}/${item.id}.html`;
}

// Injects the floating HUD nav bar. `back` = {label, href} or null.
function renderHUD(active, back) {
  const root = document.getElementById('hud-root');
  if (!root) return;
  const mainEl = document.querySelector('main');
  if (mainEl && !mainEl.id) mainEl.id = 'main-content';
  const backHtml = back
    ? `<a class="hud-back" href="${back.href}">&larr; ${back.label}</a>`
    : `<span></span>`;
  root.innerHTML = `
    <a class="skip-link" href="#main-content">Aller au contenu</a>
    <div class="hud">
      <div class="wrap">
        <div class="hud-inner">
          <a class="hud-brand" href="${siteBase()}index.html"><span class="dot"></span>EuroRare</a>
          ${backHtml}
          <nav class="hud-nav" aria-label="Navigation principale">
            <a href="${siteBase()}pieces.html" class="${active === 'pieces' ? 'active' : ''}"${active === 'pieces' ? ' aria-current="page"' : ''}>Pièces</a>
            <a href="${siteBase()}billets.html" class="${active === 'billets' ? 'active' : ''}"${active === 'billets' ? ' aria-current="page"' : ''}>Billets</a>
          </nav>
        </div>
      </div>
    </div>`;
}

function renderFooter() {
  const root = document.getElementById('footer-root');
  if (!root) return;
  root.innerHTML = `
    <footer>
      <div class="wrap">
        <nav class="footer-nav" aria-label="Informations EuroRare">
          <a href="${siteBase()}methodologie.html">Méthodologie</a>
          <a href="${siteBase()}sources.html">Sources</a>
          <a href="${siteBase()}guides/">Guides</a>
          <a href="${siteBase()}confidentialite.html">Confidentialité</a>
        </nav>
        <p>EuroRare est un projet pédagogique indépendant. Les niveaux de rareté et fourchettes de valeur sont indicatifs et ne remplacent pas l'expertise d'un professionnel de la numismatique.</p>
      </div>
    </footer>`;
}

/* =========================================================
   Effets visuels partagés
   ========================================================= */

const RARETE_INDEX = { 'commune': 1, 'peu-commune': 2, 'recherchee': 3, 'rare': 4, 'tres-rare': 5 };

function raretyMeter(level, withLabel) {
  const idx = RARETE_INDEX[level] || 1;
  let pips = '';
  for (let i = 1; i <= 5; i++) {
    pips += i <= idx ? `<span class="seg on" data-level="${level}"></span>` : `<span class="seg"></span>`;
  }
  const label = withLabel === false ? '' : raretyBadge(level);
  return `<div class="rarete-meter">${label}<div class="rarete-meter-pips">${pips}</div></div>`;
}

function countUp(el, target, duration) {
  if (!el) return;
  if (prefersReducedMotion()) { el.textContent = target; return; }
  const start = performance.now();
  const dur = duration || 1200;
  function tick(now) {
    const p = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function staggerIn(selector, root) {
  (root || document).querySelectorAll(selector).forEach((el, i) => {
    el.style.animationDelay = Math.min(i * 45, 500) + 'ms';
  });
}

document.addEventListener('DOMContentLoaded', () => { initMyCoinWidget(); });

/* =========================================================
   "Ma pièce" — comparaison visuelle 100% locale (sessionStorage)
   ========================================================= */

const MY_COIN_KEY = 'eurorare_my_coin_photo';

function getMyCoinPhoto() {
  try { return sessionStorage.getItem(MY_COIN_KEY); } catch (e) { return null; }
}
function setMyCoinPhoto(dataUrl) {
  try { sessionStorage.setItem(MY_COIN_KEY, dataUrl); } catch (e) {}
}
function clearMyCoinPhoto() {
  try { sessionStorage.removeItem(MY_COIN_KEY); } catch (e) {}
}

function processImageFile(file, callback) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 900;
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w >= h) { h = Math.round(h * (maxDim / w)); w = maxDim; }
        else { w = Math.round(w * (maxDim / h)); h = maxDim; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function initMyCoinWidget() {
  const path = window.location.pathname.toLowerCase();
  const isBanknoteSurface = path.endsWith('/billets.html') || path.includes('/billets/') || document.body?.dataset?.type === 'billet';
  if (isBanknoteSurface) return;
  if (document.getElementById('my-coin-widget')) return;
  const el = document.createElement('div');
  el.id = 'my-coin-widget';
  document.body.appendChild(el);
  renderMyCoinWidget();
}

function renderMyCoinWidget() {
  const el = document.getElementById('my-coin-widget');
  if (!el) return;
  const photo = getMyCoinPhoto();
  el.innerHTML = photo ? `
    <div class="mycoin-card">
      <button class="mycoin-close" id="mycoin-close" aria-label="Retirer ma photo">&times;</button>
      <img src="${photo}" alt="Photo de votre pièce" class="mycoin-img" id="mycoin-zoom">
      <p class="mycoin-label">📷 Ma pièce</p>
      <button class="mycoin-find-btn" id="mycoin-find">🔍 Trouver la correspondance</button>
      <label class="mycoin-change" for="mycoin-input">Changer la photo</label>
      <input type="file" accept="image/*" capture="environment" id="mycoin-input" style="display:none;">
    </div>
  ` : `
    <label class="mycoin-fab" for="mycoin-input" title="Importer une photo de votre pièce pour la comparer visuellement au catalogue">
      <span class="ico">📷</span><span>Comparer ma pièce</span>
    </label>
    <input type="file" accept="image/*" capture="environment" id="mycoin-input" style="display:none;">
  `;

  const input = document.getElementById('mycoin-input');
  if (input) {
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      processImageFile(file, (dataUrl) => { setMyCoinPhoto(dataUrl); renderMyCoinWidget(); });
    });
  }
  const closeBtn = document.getElementById('mycoin-close');
  if (closeBtn) closeBtn.addEventListener('click', () => { clearMyCoinPhoto(); renderMyCoinWidget(); });
  const zoomImg = document.getElementById('mycoin-zoom');
  if (zoomImg) zoomImg.addEventListener('click', () => openMyCoinLightbox(photo));
  const findBtn = document.getElementById('mycoin-find');
  if (findBtn) findBtn.addEventListener('click', () => runCoinAnalysis(photo, findBtn));
}

function openMyCoinLightbox(photo) {
  const box = document.createElement('div');
  box.className = 'mycoin-lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Photo agrandie');
  box.innerHTML = `<img src="${photo}" alt="Photo de votre pièce, agrandie">`;
  const close = () => box.remove();
  box.addEventListener('click', close);
  const onKey = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } };
  document.addEventListener('keydown', onKey);
  document.body.appendChild(box);
}

/* =========================================================
   Recherche de correspondance par OCR (Tesseract.js, 100% local)
   Lit le texte visible sur la photo (pays, année) et le compare
   à la base de données — ce n'est PAS de la reconnaissance
   visuelle du dessin, seulement de la lecture de texte.
   ========================================================= */

const COUNTRY_KEYWORDS = {
  'Andorre': ['ANDORRA', 'ANDORRE'],
  'Autriche': ['OSTERREICH', 'AUTRICHE', 'REPUBLIK'],
  'Belgique': ['BELGIE', 'BELGIQUE', 'BELGIEN'],
  'Bulgarie': ['BULGARIA', 'BALGARIYA', 'БЪЛГАРИЯ'],
  'Chypre': ['KYPROS', 'KIBRIS', 'CHYPRE'],
  'Croatie': ['HRVATSKA', 'CROATIA', 'CROATIE'],
  'Estonie': ['EESTI', 'ESTONIE'],
  'Finlande': ['SUOMI', 'FINLAND'],
  'France': ['FRANCE', 'REPUBLIQUE FRANCAISE'],
  'Allemagne': ['DEUTSCHLAND', 'ALLEMAGNE', 'BUNDESREPUBLIK'],
  'Grèce': ['HELLAS', 'GRECE', 'ELLINIKI'],
  'Irlande': ['EIRE', 'IRLANDE', 'IRELAND'],
  'Italie': ['ITALIA', 'ITALIE', 'REPUBBLICA'],
  'Lettonie': ['LATVIJA', 'LETTONIE'],
  'Lituanie': ['LIETUVA', 'LITUANIE'],
  'Luxembourg': ['LETZEBUERG', 'LUXEMBOURG'],
  'Malte': ['MALTA', 'MALTE'],
  'Monaco': ['MONACO'],
  'Pays-Bas': ['NEDERLAND', 'NEDERLANDEN', 'PAYS-BAS', 'NETHERLANDS'],
  'Portugal': ['PORTUGAL'],
  'Saint-Marin': ['SAN MARINO', 'SAINT-MARIN', 'SAINT MARIN'],
  'Slovaquie': ['SLOVENSKO', 'SLOVAKIA', 'SLOVAQUIE'],
  'Slovénie': ['SLOVENIJA', 'SLOVENIE'],
  'Espagne': ['ESPANA', 'ESPAÑA', 'SPAIN', 'ESPAGNE'],
  'Vatican': ['VATICANO', 'VATICAN'],
};

function stripAccents(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function detectCountryAndYear(ocrText) {
  const clean = stripAccents(ocrText.toUpperCase());
  const years = [...clean.matchAll(/(19[9][0-9]|20[0-2][0-9])/g)].map(m => m[0]);
  let country = null;
  for (const [pays, keywords] of Object.entries(COUNTRY_KEYWORDS)) {
    if (keywords.some(k => clean.includes(k))) { country = pays; break; }
  }
  return { country, years: [...new Set(years)] };
}

let tesseractLoadPromise = null;
function loadTesseract() {
  if (window.Tesseract) return Promise.resolve();
  if (tesseractLoadPromise) return tesseractLoadPromise;
  tesseractLoadPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.5/dist/tesseract.min.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return tesseractLoadPromise;
}

function openAnalysisModal() {
  const box = document.createElement('div');
  box.className = 'analysis-modal';
  box.id = 'analysis-modal';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-labelledby', 'analysis-title');
  box.innerHTML = `
    <div class="analysis-panel">
      <button class="analysis-close" id="analysis-close" aria-label="Fermer">&times;</button>
      <h3 id="analysis-title">Recherche de correspondance</h3>
      <div id="analysis-body">
        <div class="analysis-loading">
          <div class="analysis-spinner"></div>
          <p style="font-size:13.5px;color:var(--ink-dim);">Lecture du texte visible sur la photo (pays, année)…</p>
        </div>
      </div>
    </div>`;
  document.body.appendChild(box);
  box.addEventListener('click', (e) => { if (e.target === box) box.remove(); });
  const closeBtn = document.getElementById('analysis-close');
  closeBtn.addEventListener('click', () => box.remove());
  const onKey = (e) => {
    if (e.key === 'Escape' && document.body.contains(box)) {
      box.remove();
      document.removeEventListener('keydown', onKey);
    }
  };
  document.addEventListener('keydown', onKey);
  closeBtn.focus();
  return box;
}

async function fetchAllItems() {
  // Multi-page site: PIECES/BILLETS aren't preloaded globally, so fetch them.
  if (typeof PIECES !== 'undefined' && typeof BILLETS !== 'undefined') {
    return [...PIECES.map(i => ({ ...i, _type: 'piece' })), ...BILLETS.map(i => ({ ...i, _type: 'billet' }))];
  }
  try {
    const [p, b] = await Promise.all([
      fetch(siteBase() + 'data/pieces.json').then(r => r.json()),
      fetch(siteBase() + 'data/billets.json').then(r => r.json())
    ]);
    return [...p.map(i => ({ ...i, _type: 'piece' })), ...b.map(i => ({ ...i, _type: 'billet' }))];
  } catch (e) {
    return [];
  }
}

async function runCoinAnalysis(photoDataUrl, triggerBtn) {
  if (triggerBtn) { triggerBtn.disabled = true; triggerBtn.textContent = 'Analyse…'; }
  const modal = openAnalysisModal();
  const bodyEl = () => document.getElementById('analysis-body');

  try {
    await loadTesseract();
    const worker = await Tesseract.createWorker('eng');
    const { data } = await worker.recognize(photoDataUrl);
    await worker.terminate();

    if (!document.getElementById('analysis-modal')) return; // user closed it meanwhile

    const { country, years } = detectCountryAndYear(data.text || '');
    const allItems = await fetchAllItems();

    let matches = allItems.filter(i => i._type === 'piece');
    if (country) matches = matches.filter(i => i.pays === country);
    if (years.length) matches = matches.filter(i => years.some(y => (i.annees || '').includes(y)));

    const chips = [];
    if (country) chips.push(`<span class="chip">Pays détecté : ${country}</span>`);
    if (years.length) chips.push(`<span class="chip">Année détectée : ${years.join(', ')}</span>`);
    if (!country && !years.length) chips.push(`<span class="chip">Aucun texte exploitable détecté</span>`);

    if (matches.length && matches.length <= 40) {
      bodyEl().innerHTML = `
        <p class="sub">Basé sur le texte lu automatiquement sur votre photo (OCR) — pas sur le dessin lui-même. Vérifiez visuellement avant de conclure.</p>
        <div class="analysis-detected">${chips.join('')}</div>
        <p style="font-size:13px;color:var(--ink-dim);margin-bottom:10px;">${matches.length} correspondance${matches.length > 1 ? 's' : ''} possible${matches.length > 1 ? 's' : ''} :</p>
        ${matches.map(m => `
          <a class="analysis-result-item" href="${detailHref(m._type, m)}">
            <span>${m.nom || (m.pays + ' — ' + m.valeur)} <span style="color:var(--ink-faint)">(${m.annees})</span></span>
            ${raretyBadge(m.rarete, 'sm')}
          </a>`).join('')}
      `;
    } else {
      bodyEl().innerHTML = `
        <p class="sub">Basé sur le texte lu automatiquement sur votre photo (OCR) — pas sur le dessin lui-même.</p>
        <div class="analysis-detected">${chips.join('')}</div>
        <p class="analysis-empty">${matches.length > 40
          ? `Trop de résultats (${matches.length}) pour être utiles ici — affinez en prenant une photo plus nette et bien cadrée sur le texte, ou parcourez le catalogue filtré manuellement.`
          : `Aucune correspondance directe trouvée dans notre base. Cela peut venir d'une photo peu lisible (angle, reflet, usure) plutôt que d'une absence réelle dans le catalogue — essayez une photo plus nette du texte gravé, ou parcourez le catalogue manuellement.`}</p>
        <div class="identify-links">
          <a class="chip" href="${siteBase()}pieces.html">Parcourir toutes les pièces</a>
          <a class="chip" href="${siteBase()}billets.html">Parcourir tous les billets</a>
        </div>
      `;
    }
  } catch (err) {
    if (document.getElementById('analysis-modal')) {
      bodyEl().innerHTML = `<p class="analysis-empty">La lecture automatique a échoué (${err && err.message ? err.message : 'erreur inconnue'}). Réessayez avec une photo plus nette, ou parcourez le catalogue manuellement.</p>`;
    }
  } finally {
    if (triggerBtn) { triggerBtn.disabled = false; triggerBtn.textContent = '🔍 Trouver la correspondance'; }
  }
}

function initExternalImageFallbacks() {
  document.addEventListener('error', (event) => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || !img.closest('.specimen-face')) return;
    const face = img.closest('.specimen-face');
    if (face.dataset.imageFailed === '1') return;
    face.dataset.imageFailed = '1';
    img.remove();
    const fallback = document.createElement('span');
    fallback.className = 'image-fallback-label';
    fallback.textContent = 'Visuel temporairement indisponible';
    face.appendChild(fallback);
  }, true);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExternalImageFallbacks, { once: true });
} else {
  initExternalImageFallbacks();
}
