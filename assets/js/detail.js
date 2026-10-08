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
const MARKET_ESTIMATE_OVERRIDES = {
  'cy-2e-2024-20-ans-d-adh-sion-de-chypre-': {
    headline: '650–900 €',
    circulated: 'Non concerné — émission Proof uniquement',
    unc: '650–900 € avec coffret et certificat',
    collector: 'Une offre boutique peut être nettement plus haute sans correspondre au prix de revente réel.',
    basis: 'Cote Numista et comparables spécialisés, octobre 2026.'
  },
  'mc-2e-2007-25e-anniversaire-de-la-mort-': {
    headline: '2 400–3 000 €',
    circulated: 'Pièce normalement conservée en BU ; hors coffret, décote importante',
    unc: '2 400–3 000 € si authentique, BU et complète',
    collector: 'Transactions Numista documentées autour de 2 710–2 800 €.',
    basis: 'Transactions réalisées et cote Numista, octobre 2026.'
  },
  'mc-2e-2015-800-ans-de-la-forteresse-de-': {
    headline: '1 100–2 200 €',
    circulated: 'Non concerné — émission collector',
    unc: '1 100–2 200 € avec coffret / certificat',
    collector: 'Transactions documentées jusqu’à environ 2 200 €.',
    basis: 'Transactions réalisées et cote Numista, octobre 2026.'
  },
  'mc-2e-2019-200e-anniversaire-de-l-acces': {
    headline: '190–260 €',
    circulated: 'Non concerné — émission Proof',
    unc: '190–260 € avec coffret / certificat',
    collector: 'Repère Numista autour de 240 USD pour l’exemplaire Proof.',
    basis: 'Cote Numista, octobre 2026.'
  },
  'vatican-2e-commemoratives': {
    headline: '20–120 € selon millésime',
    circulated: 'Peu pertinent : la majorité des émissions sont conservées en qualité collection',
    unc: 'Environ 20–120 € selon année, thème et conditionnement',
    collector: 'Certaines années ou présentations peuvent dépasser cette fourchette.',
    basis: 'Fourchette volontairement large : cette fiche regroupe plusieurs émissions.'
  },
  'saint-marin-2e-commemoratives': {
    headline: '20–140 € selon millésime',
    circulated: 'Peu pertinent : nombreuses émissions vendues en BU / coincard',
    unc: 'Environ 20–140 € selon année et conditionnement',
    collector: 'Exemple : la 2€ Bartolomeo Borghesi 2004 se situe nettement au-dessus d’une 2€ courante.',
    basis: 'Numista et ventes réalisées ; fiche multi-millésimes.'
  },
  'andorre-premieres-frappes': {
    headline: '20–60 € la série selon état',
    circulated: 'Valeur proche de la faciale pour les exemplaires réellement circulés',
    unc: 'Environ 20–60 € pour une série propre / UNC selon millésime',
    collector: 'Les coincards et présentations officielles se négocient davantage.',
    basis: 'Comparables Andorre 2014–2015.'
  },
  'finlande-1999-2001-premiere-serie': {
    headline: '5–15 € la série',
    circulated: 'Valeur proche de la faciale pour les pièces isolées',
    unc: 'Environ 5–15 € pour un ensemble propre',
    collector: 'Le conditionnement officiel peut créer une prime.',
    basis: 'Cette fiche représente plusieurs petites coupures.'
  },
  'slovenie-2007-premiere-annee': {
    headline: '5–15 € la série',
    circulated: 'Valeur proche de la faciale pour les pièces isolées',
    unc: 'Environ 5–15 € pour une série 2007 propre',
    collector: 'Un coffret officiel ou une qualité supérieure peut valoir davantage.',
    basis: 'Fourchette prudente pour la première série slovène.'
  },
  'luxembourg-2e-courantes': {
    headline: '2–6 € par 2€ courante',
    circulated: 'En général 2–3 €',
    unc: 'Environ 3–6 € selon millésime',
    collector: 'Les versions BU / Proof et certains millésimes de coffret sont à traiter séparément.',
    basis: 'Repères Numista sur les séries courantes luxembourgeoises.'
  },
  'allemagne-fehlpragung-fautees': {
    headline: '20–250 €+ après authentification',
    circulated: 'Impossible à estimer sans identifier précisément l’erreur',
    unc: 'La prime dépend entièrement du type d’erreur et de sa rareté',
    collector: 'Ne jamais valoriser une “erreur” uniquement à partir d’une annonce active.',
    basis: 'Catégorie d’erreurs : expertise ou comparables strictement identiques indispensables.'
  },
  'france-fautees-1999-2002': {
    headline: '20–250 €+ après authentification',
    circulated: 'Impossible à estimer sans identifier précisément l’erreur',
    unc: 'La prime dépend entièrement du défaut de frappe authentifié',
    collector: 'Une simple usure, rayure ou détérioration après frappe n’est pas une erreur de monnaie.',
    basis: 'Catégorie d’erreurs : transactions comparables et expertise recommandées.'
  },
  'de-2008-hambourg-erreur-carte-ancienne': {
    headline: '5–25 €',
    circulated: 'Environ 5–12 € si la variante est confirmée',
    unc: 'Environ 10–25 € selon état',
    collector: 'Sans atelier / variante correctement identifiés : valeur proche de 2 €.',
    basis: 'Fourchette prudente pour la variante ancienne carte.'
  }
};

function getResaleEstimate(item) {
  if (MARKET_ESTIMATE_OVERRIDES[item.id]) return MARKET_ESTIMATE_OVERRIDES[item.id];

  const base = {
    'commune': {
      headline: '2–6 €',
      circulated: 'Environ 2–3 €',
      unc: 'Environ 3–6 € en UNC / FDC',
      collector: 'BU / coincard : souvent 5–10 € selon présentation'
    },
    'peu-commune': {
      headline: '3–9 €',
      circulated: 'Environ 2,50–5 €',
      unc: 'Environ 4–9 € en UNC / FDC',
      collector: 'BU / coincard : souvent 7–15 €'
    },
    'recherchee': {
      headline: '5–18 €',
      circulated: 'Environ 3–8 €',
      unc: 'Environ 6–18 € en UNC / FDC',
      collector: 'Coincard / BU : souvent 10–25 €'
    },
    'rare': {
      headline: '15–50 €',
      circulated: 'Environ 10–25 € lorsqu’elle existe réellement en circulation',
      unc: 'Environ 20–50 € en UNC / FDC',
      collector: 'Coincard / Proof : souvent 30–70 € selon émission'
    },
    'tres-rare': {
      headline: '50–300 €+',
      circulated: 'À expertiser : forte dispersion selon l’émission',
      unc: 'Souvent 70–300 €+, hors cas exceptionnels',
      collector: 'Le coffret, certificat et l’authenticité peuvent représenter une grande partie de la valeur'
    }
  };

  const estimate = { ...(base[item.rarete] || base['commune']) };

  if (item.pays === 'Andorre' && item.rarete === 'rare') {
    estimate.headline = '25–50 €';
    estimate.circulated = 'Environ 15–30 € si vendue hors présentation';
    estimate.unc = 'Environ 25–50 € en BU / coincard';
    estimate.collector = 'Les versions Proof officielles peuvent dépasser cette fourchette.';
  }

  estimate.basis = 'Estimation prudente calibrée sur les cotes Numista et transactions observées ; vérification recommandée via les liens ci-dessous.';
  return estimate;
}

function buildMarketLinks(item) {
  const raw = [item.pays, item.annees, item.nom || item.valeur, '2 euro'].filter(Boolean).join(' ');
  const q = encodeURIComponent(raw.replace(/[«»]/g, ''));
  const directNumista = item.photo && item.photo.source_url && /numista\.com/i.test(item.photo.source_url)
    ? item.photo.source_url
    : \`https://fr.numista.com/catalogue/index.php?r=\${q}&ct=coin\`;

  return {
    numista: directNumista,
    ebaySold: \`https://www.ebay.fr/sch/i.html?_nkw=\${q}&LH_Sold=1&LH_Complete=1\`,
    maShops: \`https://www.ma-shops.com/shops/search.php?searchstr=\${q}&catid=0&submitBtn=Search\`
  };
}

function renderMarketPanel(item) {
  const e = getResaleEstimate(item);
  const links = buildMarketLinks(item);
  const m = item.valeur_marche;

  return \`
    <div class="card market-panel">
      <div class="market-estimate-head">
        <div>
          <span class="market-kicker">Estimation de revente prudente</span>
          <strong class="market-price">\${e.headline}</strong>
        </div>
        <span class="market-date">Vérifié : 8 oct. 2026</span>
      </div>

      <div class="market-grid">
        <div class="market-row"><span class="k">Pièce circulée</span><span class="v">\${e.circulated}</span></div>
        <div class="market-row"><span class="k">UNC / BU / FDC</span><span class="v">\${e.unc}</span></div>
        <div class="market-row"><span class="k">Conditionnement collection</span><span class="v">\${e.collector}</span></div>
      </div>

      \${m ? \`
        <div class="market-detail">
          <div class="market-row"><span class="k">Repère historique / prix d’émission</span><span class="v">\${m.prix_lancement}</span></div>
          <div class="market-row"><span class="k">Marché secondaire documenté</span><span class="v">\${m.observation}</span></div>
          <div class="market-row"><span class="k">Point de vigilance</span><span class="v">\${m.avertissement}</span></div>
        </div>
      \` : ''}

      <p class="market-basis">\${e.basis}</p>

      <div class="market-proof">
        <h4>Comparer avec des prix crédibles</h4>
        <p>Le site privilégie les <strong>transactions réellement conclues</strong>. Une annonce encore en ligne, même à 10 000 €, ne prouve pas qu’une pièce vaut ce prix.</p>
        <div class="identify-links market-links">
          <a class="chip" target="_blank" rel="noopener" href="\${links.numista}">Numista · cote & ventes réalisées</a>
          <a class="chip" target="_blank" rel="noopener" href="\${links.ebaySold}">eBay · objets réellement vendus</a>
          <a class="chip" target="_blank" rel="noopener" href="\${links.maShops}">MA-Shops · vendeurs numismatiques pros</a>
        </div>
      </div>

      <p class="source-line">Les frais de port, commissions, état exact, variante, coffret et certificat peuvent modifier le prix net réellement récupéré par le vendeur.</p>
    </div>\`;
}
function renderSpecimenFrame(item) {
  const initial = (item.pays || '?').charAt(0);
  if (item.photo) {
    if (item.photo.combined) {
      return `
        <div class="specimen-frame">
          <span class="specimen-badge real">✓ ${item.photo.representative ? "Visuel réel représentatif" : "Photo réelle"}</span>
          <div class="specimen-face front"><img src="${item.photo.recto}" alt="${item.nom || item.pays} — avers et revers" loading="lazy"></div>
        </div>
        <p class="specimen-hint">Avers et revers sur le même visuel</p>
        <p class="inspector-credit" style="text-align:center;">${renderPhotoCredit(item)}</p>`;
    }
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
          <h2>04 — Valeur de revente & transactions vérifiées</h2>
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
  if (hasPhoto && !item.photo.combined) {
    const frame = document.getElementById('specimen-frame');
    const flipEl = document.getElementById('specimen-flip');
    frame.addEventListener('click', () => flipEl.classList.toggle('flipped'));
  }
}

boot();
