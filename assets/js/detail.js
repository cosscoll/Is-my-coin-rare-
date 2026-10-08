/* =========================================================
   EuroRare — logique de la page de détail
   ========================================================= */

const CATEGORIE_LABELS = {
  'commemorative': 'Commémorative',
  'premiere-frappe': 'Première frappe',
  'erreur-de-frappe': 'Erreur de frappe',
  'petit-pays': 'Petit tirage national',
  'signature': 'Signature BCE',
  'numero-de-serie': 'Numéro de série',
  'code-imprimeur': 'Code imprimeur',
  'coupure-retiree': 'Coupure retirée',
  'erreur-impression': "Erreur d'impression",
  'premiere-emission': 'Première émission',
};

function renderPhotoCredit(item) {
  const p = item.photo || {};
  const bits = [];
  if (p.credit) bits.push(p.credit);
  if (p.licence) bits.push(p.licence);
  if (p.source_name) bits.push(`Source : ${p.source_name}`);
  const label = bits.join(' · ') || 'Source du visuel';
  return p.source_url
    ? `<a target="_blank" rel="noopener" href="${p.source_url}">${label}</a>`
    : label;
}
function renderMarketPanel(item) {
  if (item.valeur_marche) {
    const m = item.valeur_marche;
    return `
      <div class="card market-panel">
        <div class="market-row"><span class="k">Prix de lancement</span><span class="v">${m.prix_lancement}</span></div>
        <div class="market-row"><span class="k">Observation sur le marché secondaire</span><span class="v">${m.observation}</span></div>
        <div class="market-row"><span class="k">Point de vigilance</span><span class="v">${m.avertissement}</span></div>
        <p class="source-line">Recherche effectuée : ${m.date_recherche} — les prix évoluent constamment, ceci n'est qu'un repère observé à un instant donné.</p>
      </div>`;
  }
  return `
    <div class="card market-panel">
      <p class="market-empty">Nous n'avons pas encore de données de prix vérifiées pour cette fiche précise. Comme repère général : le niveau de rareté ci-dessus (basé sur le tirage officiel) donne une indication d'ordre de grandeur, mais la cote réelle dépend fortement de l'état de conservation, de la présence du coffret d'origine et de la demande du moment.</p>
      <div class="identify-links">
        <a class="chip" target="_blank" rel="noopener" href="https://en.numista.com/catalogue/themes/euro-coins.php">📖 Chercher une cote sur Numista</a>
        <a class="chip" target="_blank" rel="noopener" href="https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent((item.nom || '') + ' ' + item.pays + ' ' + item.annees + ' 2 euro')}">💶 Voir des ventes récentes (eBay)</a>
      </div>
    </div>`;
}

function renderSpecimenFrame(item) {
  const initial = (item.pays || '?').charAt(0);
  if (item.photo) {
    return `
      <div class="specimen-frame" id="specimen-frame">
        <span class="specimen-badge real">✓ ${item.photo.representative ? "Visuel réel représentatif" : "Photo réelle"}</span>
        <div class="specimen-flip" id="specimen-flip">
          <div class="specimen-face front"><img src="${item.photo.recto}" alt="${item.nom || item.pays} — avers" loading="lazy"></div>
          <div class="specimen-face back"><img src="${item.photo.verso}" alt="${item.nom || item.pays} — revers" loading="lazy"></div>
        </div>
      </div>
      <p class="specimen-hint">Cliquez pour voir le revers</p>
      <p class="inspector-credit" style="text-align:center;">${renderPhotoCredit(item)}</p>`;
  }
  return `
    <div class="specimen-frame">
      <span class="specimen-badge stylised-badge">Photo à venir</span>
      <div class="specimen-face placeholder">
        <span class="monogram">${initial}</span>
        <span class="placeholder-label">Référence en cours de constitution</span>
      </div>
    </div>
    <p class="specimen-hint">Aucune photo vérifiée pour cette fiche</p>`;
}

async function boot() {
  const type = qs('type') === 'billet' ? 'billet' : 'piece';
  const id = qs('id');
  const dataPath = type === 'piece' ? 'data/pieces.json' : 'data/billets.json';
  const listPage = type === 'piece' ? 'pieces.html' : 'billets.html';
  const listLabel = type === 'piece' ? 'Pièces' : 'Billets';

  renderHUD(type === 'piece' ? 'pieces' : 'billets', { label: listLabel, href: listPage });
  renderFooter();

  let items = [];
  try {
    items = await loadJSON(dataPath);
  } catch (e) {
    document.getElementById('detail-root').innerHTML = `<div class="empty-state">Impossible de charger cette fiche pour le moment.</div>`;
    return;
  }

  const item = items.find(i => i.id === id) || items[0];
  if (!item) {
    document.getElementById('detail-root').innerHTML = `<div class="empty-state">Fiche introuvable.</div>`;
    return;
  }

  document.title = `${item.pays} — ${item.valeur} (${item.annees}) · EuroRare`;

  const root = document.getElementById('detail-root');
  const hasPhoto = !!item.photo;
  root.innerHTML = `
    <div class="detail-grid">
      <div class="stage">
        ${renderSpecimenFrame(item)}
        <div class="stage-rarete-row">${raretyMeter(item.rarete)}</div>
      </div>
      <div class="detail-info">
        <div class="detail-title-row">
          <h1>${item.pays} — ${item.valeur}</h1>
        </div>
        ${item.nom ? `<p style="font-size:16px;color:var(--ink);margin-bottom:6px;font-style:italic;">${item.nom}</p>` : ''}
        <div class="detail-meta-line">${item.annees} &middot; ${CATEGORIE_LABELS[item.categorie] || item.categorie}</div>

        <div class="section-block">
          <h2>01 — Identification pas à pas</h2>
          <div class="progress-bar"><div class="progress-bar-fill" id="progress-fill"></div></div>
          <div class="steps" id="steps"></div>
        </div>

        <div class="section-block">
          <h2>02 — Pourquoi ce niveau de rareté</h2>
          <div class="card rarete-panel">
            <div class="rarete-panel-top">
              ${raretyMeter(item.rarete)}
              <span class="chip">${item.categorie ? (CATEGORIE_LABELS[item.categorie] || item.categorie) : ''}</span>
            </div>
            <p class="tirage">${item.tirage}</p>
            <p class="explication">${item.explication}</p>
            <p class="source-line">Source / repères : ${item.source}</p>
          </div>
        </div>

        <div class="section-block">
          <h2>03 — Voir une vraie photo</h2>
          ${hasPhoto ? `
            <p style="font-size:14px;">${item.photo.representative ? "Le visuel affiché ci-contre est un exemplaire réel représentatif de cette fiche. La fiche couvre plusieurs millésimes ou variantes : vérifiez aussi les critères et l’année de votre pièce." : "Les visuels affichés ci-contre correspondent aux faces de cette pièce. Vous pouvez comparer directement votre exemplaire avec eux."}</p><p class="source-line">${renderPhotoCredit(item)}</p>
          ` : `
            <p style="font-size:14px;margin-bottom:10px;">Aucune photo vérifiée n'est encore disponible pour cette fiche. Pour comparer avec un exemplaire authentique :</p>
            <div class="identify-links">
              <a class="chip" target="_blank" rel="noopener" href="https://www.google.com/search?tbm=isch&q=${encodeURIComponent((item.nom || item.pays) + ' ' + item.pays + ' ' + item.annees + ' euro coin')}">🔍 Rechercher des photos (Google Images)</a>
              <a class="chip" target="_blank" rel="noopener" href="https://en.numista.com/catalogue/themes/euro-coins.php">📖 Catalogue Numista (référence numismatique)</a>
            </div>
          `}
        </div>

        <div class="section-block">
          <h2>04 — Valeur indicative sur le marché</h2>
          ${renderMarketPanel(item)}
        </div>

        <div class="section-block">
          <h2>05 — Estimation &amp; vérification</h2>
          <div class="disclaimer-box">
            <span class="ico">&#9888;</span>
            <div>
              <h4>Ceci n'est pas une expertise</h4>
              <p>Le niveau de rareté affiché ici est une indication pédagogique générale, basée sur des tendances documentées par la communauté numismatique — pas sur une cotation individuelle de votre exemplaire. L'état de conservation, une éventuelle variante non répertoriée ou une contrefaçon peuvent changer radicalement la valeur réelle d'une pièce ou d'un billet. Pour toute estimation fiable, en particulier si votre exemplaire semble correspondre à un cas rare, faites-le examiner par un professionnel de la numismatique ou une maison de vente spécialisée.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Steps
  const stepsEl = document.getElementById('steps');
  const fillEl = document.getElementById('progress-fill');
  let doneCount = 0;
  item.criteres.forEach((c, idx) => {
    const el = document.createElement('div');
    el.className = 'step card';
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-pressed', 'false');
    el.innerHTML = `
      <div class="step-num">${idx + 1}</div>
      <div class="step-body">
        <h4>${c.titre}</h4>
        <p>${c.detail}</p>
      </div>
      <div class="step-check">Vérifier</div>
    `;
    const toggle = () => {
      const nowDone = el.classList.toggle('done');
      el.setAttribute('aria-pressed', String(nowDone));
      el.querySelector('.step-check').textContent = nowDone ? 'Vérifié ✓' : 'Vérifier';
      doneCount += nowDone ? 1 : -1;
      fillEl.style.width = `${Math.round((doneCount / item.criteres.length) * 100)}%`;
    };
    el.addEventListener('click', toggle);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
    stepsEl.appendChild(el);
  });

  // Real-photo flip (click the frame to see the reverse)
  if (hasPhoto) {
    const frame = document.getElementById('specimen-frame');
    const flipEl = document.getElementById('specimen-flip');
    frame.addEventListener('click', () => flipEl.classList.toggle('flipped'));
  }
}

boot();
