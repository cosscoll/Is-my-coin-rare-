/* =========================================================
   EuroRare — logique de la page de détail
   ========================================================= */

const CATEGORIE_LABELS = {
  'commemorative': 'Commémorative',
  'premiere-frappe': 'Première frappe',
  'erreur-de-frappe': 'Erreur de frappe',
  'petit-pays': 'Petit tirage national',
  'serie-courante': 'Série courante',
  'signature': 'Signature BCE',
  'numero-de-serie': 'Numéro de série',
  'code-imprimeur': 'Code imprimeur',
  'coupure-retiree': 'Coupure retirée',
  'erreur-impression': "Erreur d'impression",
  'premiere-emission': 'Première émission',
  'serie-billet': 'Série de billets',
};

function detailPhotoBadgeLabel(item) {
  const source = String(item.photo?.source_name || '');
  if (item.photo?.representative) return 'Visuel représentatif';
  if (/Banque centrale européenne|Commission européenne/i.test(source)) return 'Visuel officiel';
  return 'Photo réelle';
}

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
  'fi-2e-2004-largissement-de-l-union-euro': {
    headline: '15–45 €',
    circulated: 'Environ 12–20 € selon usure réelle',
    unc: 'Environ 30–45 € en UNC / FDC',
    collector: 'BU / Proof : souvent autour de 25–40 € selon présentation',
    basis: 'Numista valorise actuellement cette émission nettement au-dessus des autres pièces finlandaises de tirage comparable.'
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

const BANKNOTE_MARKET_ESTIMATE_OVERRIDES = {
  "serie-2002-signature-duisenberg": {
    "headline": "Valeur faciale à +70% env. pour les cas courants",
    "circulated": "Souvent proche de la valeur faciale, surtout sur les coupures courantes et usées",
    "unc": "Une prime apparaît surtout en UNC, selon la coupure, le préfixe pays et le code imprimeur",
    "collector": "Certaines combinaisons rares peuvent valoir plusieurs fois la faciale ; un lot 5/10/20/50€ Duisenberg de 85€ faciaux a été adjugé 145€ en 2026.",
    "basis": "Numista + adjudications Catawiki. Estimation volontairement large car cette fiche couvre toutes les coupures."
  },
  "numeros-serie-particuliers": {
    "headline": "Faciale + 5–50 € de prime dans beaucoup de cas",
    "circulated": "Un radar ou répétiteur modeste ne garantit pas une forte prime, surtout sur un billet usé",
    "unc": "Les numéros très bas, solides, radars parfaits ou répétiteurs nets peuvent dépasser largement cette fourchette",
    "collector": "La valeur dépend davantage du motif exact du numéro que de la coupure elle-même.",
    "basis": "Marché des numéros spéciaux : comparer uniquement avec des numéros de structure réellement équivalente."
  },
  "code-imprimeur-pays-emetteur": {
    "headline": "Souvent valeur faciale ; prime seulement pour combinaison rare",
    "circulated": "Dans la majorité des cas : valeur faciale",
    "unc": "En UNC, certaines combinaisons préfixe + imprimeur + signature peuvent obtenir une prime de quelques euros à plusieurs dizaines",
    "collector": "Une lettre peu fréquente n’est pas suffisante : il faut identifier la combinaison complète.",
    "basis": "Numista et catalogues spécialisés : la rareté se juge combinaison par combinaison."
  },
  "capacite-numerotation-par-lettre": {
    "headline": "Pas de prime intrinsèque : valeur faciale",
    "circulated": "Valeur faciale",
    "unc": "Valeur faciale, sauf autre particularité collectionnable indépendante",
    "collector": "La capacité théorique d’un système de numérotation n’est pas un critère de cote à elle seule.",
    "basis": "Cette fiche décrit une caractéristique technique, pas une variété monnayable."
  },
  "billet-500e-retire": {
    "headline": "500–600 € pour un exemplaire courant",
    "circulated": "Environ 500–550 € pour un exemplaire authentique courant",
    "unc": "Environ 550–600 € pour les variantes courantes en très bel état ; certains Duisenberg/préfixes rares peuvent monter vers 800–1 000 €+",
    "collector": "Un lot de 6 billets de 500 € a été adjugé 3 300 € en 2026, soit environ 550 € par billet.",
    "basis": "Adjudications Catawiki et cote Numista. Les offres à plusieurs milliers d’euros ne sont pas retenues sans vente réalisée comparable."
  },
  "erreurs-impression-billets": {
    "headline": "À expertiser — souvent 50 € à plusieurs centaines d’euros",
    "circulated": "Aucune estimation fiable sans identifier et authentifier précisément l’erreur",
    "unc": "Les erreurs nettes, d’origine et documentées peuvent être fortement primées",
    "collector": "Un dommage créé après impression, une découpe volontaire ou une altération n’est pas une erreur de fabrication.",
    "basis": "Les erreurs sont évaluées individuellement ; priorité aux adjudications et aux exemplaires certifiés."
  },
  "premiers-billets-serie-europa": {
    "headline": "Valeur faciale à +20% env. pour les cas courants",
    "circulated": "Le plus souvent valeur faciale",
    "unc": "Petite prime possible en UNC pour un premier tirage, un préfixe moins courant ou un numéro intéressant",
    "collector": "Une année de lancement seule ne rend pas automatiquement le billet rare.",
    "basis": "Numista : les premières émissions Europa courantes restent généralement proches de la valeur faciale."
  },
  "petits-pays-lettres-rares": {
    "headline": "Souvent faciale à +30% ; davantage pour combinaisons rares",
    "circulated": "La plupart restent proches de la valeur faciale",
    "unc": "Une prime peut apparaître en UNC lorsque préfixe, imprimeur et signature forment une combinaison peu commune",
    "collector": "Ne pas valoriser un billet uniquement parce qu’il provient d’un petit pays.",
    "basis": "Numista et marché spécialisé ; comparaison indispensable avec le même préfixe, imprimeur, signature et état."
  }
};

function isBanknoteItem(item) {
  return ['signature','numero-de-serie','code-imprimeur','coupure-retiree','erreur-impression','premiere-emission','serie-billet'].includes(item.categorie)
    || Object.prototype.hasOwnProperty.call(BANKNOTE_MARKET_ESTIMATE_OVERRIDES, item.id);
}

function getResaleEstimate(item) {
  if (item.categorie === 'serie-billet') {
    const face = Number(String(item.valeur || '').replace(/[^0-9]/g, '')) || 0;
    const firstSeries = item.serie === 'Première série';
    return {
      headline: firstSeries ? `En général ${face}–${Math.ceil(face * 1.15)} €` : `En général proche de ${face} €`,
      circulated: firstSeries ? `Souvent ${face}–${Math.ceil(face * 1.05)} € selon état et variante` : `Le plus souvent autour de la valeur faciale (${face} €)`,
      unc: firstSeries ? `Une prime est possible en UNC, surtout selon signature/préfixe/imprimeur` : `Faible prime possible en UNC selon numéro et combinaison d’impression`,
      collector: 'Un numéro spécial, une combinaison rare ou une erreur authentifiée doit être évalué séparément.',
      basis: 'Billet standard : estimation prudente. Comparer une variante strictement identique avant de conclure.'
    };
  }
  if (BANKNOTE_MARKET_ESTIMATE_OVERRIDES[item.id]) return BANKNOTE_MARKET_ESTIMATE_OVERRIDES[item.id];
  if (isBanknoteItem(item)) {
    const face = Number(String(item.valeur || '').replace(/[^0-9]/g, '')) || 0;
    if (face > 0) {
      return {
        headline: `En général proche de ${face} €`,
        circulated: `Le plus souvent autour de la valeur faciale (${face} €), sauf variante identifiable`,
        unc: 'Une prime peut apparaître en UNC selon signature, préfixe, imprimeur ou numéro de série',
        collector: 'Une combinaison rare, un numéro spécial ou une erreur authentifiée doit être évalué séparément.',
        basis: 'Estimation générique d’un billet standard : comparer une variante strictement identique avant de conclure.'
      };
    }
    return {
      headline: 'Valeur faciale + prime éventuelle',
      circulated: 'Le plus souvent proche de la valeur faciale de la coupure concernée',
      unc: 'Une prime peut apparaître en UNC selon signature, préfixe, imprimeur ou numéro de série',
      collector: 'La valeur dépend de la coupure et de la combinaison exacte des caractéristiques.',
      basis: 'Estimation générique : la coupure et la variante exacte doivent être identifiées avant toute cote.'
    };
  }
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
      headline: '3–10 €',
      circulated: 'Environ 2,50–5 €',
      unc: 'Environ 4–10 € en UNC / FDC',
      collector: 'Coincard / BU : souvent 8–20 €'
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
  if (item.categorie === 'serie-courante') {
    estimate.headline = '2–4 €';
    estimate.circulated = 'En général proche de la valeur faciale (2 €)';
    estimate.unc = 'Environ 2,50–4 € selon millésime et état';
    estimate.collector = 'Un coffret officiel, une qualité Proof ou un millésime particulier doit être évalué séparément';
  }

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
  const banknote = isBanknoteItem(item);
  const raw = banknote
    ? [item.pays, item.annees, item.valeur, item.nom || '', 'billet euro banknote'].filter(Boolean).join(' ')
    : [item.pays, item.annees, item.nom || item.valeur, '2 euro'].filter(Boolean).join(' ');
  const q = encodeURIComponent(raw.replace(/[«»]/g, ''));

  let directNumista = item.photo && item.photo.source_url && /numista\.com/i.test(item.photo.source_url)
    ? item.photo.source_url
    : banknote
      ? 'https://fr.numista.com/catalogue/index.php?r=' + q + '&ct=banknote'
      : 'https://fr.numista.com/catalogue/index.php?r=' + q + '&ct=coin';

  if (item.id === 'billet-500e-retire') directNumista = 'https://en.numista.com/207104';
  if (item.id === 'premiers-billets-serie-europa') directNumista = 'https://en.numista.com/201658';
  if (item.id === 'serie-2002-signature-duisenberg') directNumista = 'https://en.numista.com/201655';

  let specialist = 'https://www.catawiki.com/fr/s?q=' + q;
  let specialistLabel = 'Catawiki · enchères numismatiques';
  if (item.id === 'billet-500e-retire') {
    specialist = 'https://www.catawiki.com/en/l/106167885-european-union-6-x-500-euro-2002-duisenberg-trichet-no-reserve-price';
    specialistLabel = 'Catawiki · vente réalisée : 6 × 500 €';
  }
  if (item.id === 'serie-2002-signature-duisenberg') {
    specialist = 'https://www.catawiki.com/en/l/106266831-european-union-netherlands-5-10-20-and-50-euro-2002-duisenberg-pick-1p-2p-3p-4p';
    specialistLabel = 'Catawiki · vente réalisée Duisenberg';
  }
  if (item.id === 'erreurs-impression-billets') {
    specialist = 'https://www.delcampe.net/fr/collections/monnaies-billets/billets/euro/autres-non-classes/france-20-euro-2002-error-without-serial-number-ttb-2572702340.html';
    specialistLabel = 'Delcampe · erreur sans numéro documentée';
  }

  return banknote ? {
    numista: directNumista,
    ebaySold: 'https://www.ebay.fr/sch/i.html?_nkw=' + q + '&LH_Sold=1&LH_Complete=1',
    specialist: specialist,
    specialistLabel: specialistLabel
  } : {
    numista: directNumista,
    ebaySold: 'https://www.ebay.fr/sch/i.html?_nkw=' + q + '&LH_Sold=1&LH_Complete=1',
    specialist: 'https://www.ma-shops.com/shops/search.php?searchstr=' + q + '&catid=0&submitBtn=Search',
    specialistLabel: 'MA-Shops · vendeurs numismatiques pros'
  };
}
function renderItemSource(item) {
  const label = item.source || 'Source de référence';
  const url = item.source_url;
  return url
    ? `<a target="_blank" rel="noopener" href="${url}">${label}</a>`
    : label;
}

function renderMarketPanel(item) {
  const e = getResaleEstimate(item);
  const links = buildMarketLinks(item);
  const m = item.valeur_marche;
  const banknote = isBanknoteItem(item);
  const specificallyChecked = !!MARKET_ESTIMATE_OVERRIDES[item.id] || !!BANKNOTE_MARKET_ESTIMATE_OVERRIDES[item.id] || !!m;
  const verificationLabel = specificallyChecked ? 'Vérifié : 8 oct. 2026' : 'Barème indicatif · comparer les ventes';

  return `
    <div class="card market-panel">
      <div class="market-estimate-head">
        <div>
          <span class="market-kicker">Estimation de revente prudente</span>
          <strong class="market-price">${e.headline}</strong>
        </div>
        <span class="market-date">${verificationLabel}</span>
      </div>

      <div class="market-grid">
        <div class="market-row"><span class="k">${banknote ? "Billet circulé" : "Pièce circulée"}</span><span class="v">${e.circulated}</span></div>
        <div class="market-row"><span class="k">${banknote ? "UNC / SUP / FDC" : "UNC / BU / FDC"}</span><span class="v">${e.unc}</span></div>
        <div class="market-row"><span class="k">${banknote ? "Critère collection" : "Conditionnement collection"}</span><span class="v">${e.collector}</span></div>
      </div>

      ${m ? `
        <div class="market-detail">
          <div class="market-row"><span class="k">Repère historique / prix d’émission</span><span class="v">${m.prix_lancement}</span></div>
          <div class="market-row"><span class="k">Marché secondaire documenté</span><span class="v">${m.observation}</span></div>
          <div class="market-row"><span class="k">Point de vigilance</span><span class="v">${m.avertissement}</span></div>
        </div>
      ` : ''}

      <p class="market-basis">${e.basis}</p>

      <div class="market-proof">
        <h4>Comparer avec des prix crédibles</h4>
        <p>Le site privilégie les <strong>transactions réellement conclues</strong> quand elles sont disponibles. Une annonce encore en ligne, même à 10 000 €, ne prouve pas qu’un exemplaire vaut ce prix.</p>
        <div class="identify-links market-links">
          <a class="chip" target="_blank" rel="noopener" href="${links.numista}">Numista · cote & ventes réalisées</a>
          <a class="chip" target="_blank" rel="noopener" href="${links.ebaySold}">eBay · objets réellement vendus</a>
          <a class="chip" target="_blank" rel="noopener" href="${links.specialist}">${links.specialistLabel}</a>
        </div>
      </div>

      <p class="source-line">Les frais de port, commissions, état exact, variante, coffret et certificat peuvent modifier le prix net réellement récupéré par le vendeur.</p>
    </div>`;
}
function renderSpecimenFrame(item, type) {
  const initial = (item.pays || '?').charAt(0);
  if (item.photo) {
    if (item.photo.combined) {
      return `
        <div class="specimen-frame ${type === 'billet' ? 'square' : ''}">
          <span class="specimen-badge real">✓ ${detailPhotoBadgeLabel(item)}</span>
          <div class="specimen-face front"><img referrerpolicy="no-referrer" src="${item.photo.recto}" alt="${item.nom || item.pays} — avers et revers" loading="eager" fetchpriority="high" decoding="async"></div>
        </div>
        <p class="specimen-hint">Avers et revers sur le même visuel</p>
        <p class="inspector-credit" style="text-align:center;">${renderPhotoCredit(item)}</p>`;
    }
    return `
      <button type="button" class="specimen-frame ${type === 'billet' ? 'square' : ''}" id="specimen-frame" aria-label="Afficher le revers">
        <span class="specimen-badge real">✓ ${detailPhotoBadgeLabel(item)}</span>
        <div class="specimen-flip" id="specimen-flip">
          <div class="specimen-face front"><img referrerpolicy="no-referrer" src="${item.photo.recto}" alt="${item.nom || item.pays} — avers" loading="eager" fetchpriority="high" decoding="async"></div>
          <div class="specimen-face back"><img referrerpolicy="no-referrer" src="${item.photo.verso}" alt="${item.nom || item.pays} — revers" loading="lazy" decoding="async"></div>
        </div>
      </button>
      <p class="specimen-hint">Cliquez ou appuyez sur Entrée pour voir le revers</p>
      <p class="inspector-credit" style="text-align:center;">${renderPhotoCredit(item)}</p>`;
  }
  return `
    <div class="specimen-frame ${type === 'billet' ? 'square' : ''}">
      <span class="specimen-badge stylised-badge">${type === 'billet' ? 'Visuel de référence à venir' : 'Photo à venir'}</span>
      <div class="specimen-face placeholder">
        <span class="monogram">${initial}</span>
        <span class="placeholder-label">Référence en cours de constitution</span>
      </div>
    </div>
    <p class="specimen-hint">Aucune photo vérifiée pour cette fiche</p>`;
}

function renderRelatedItems(type, item, items) {
  const related = items.filter(x => x.id !== item.id && x.pays === item.pays).slice(0, 4);
  const countryLink = type === 'piece'
    ? `<a class="chip" href="${countryHref(item.pays)}">Toutes les pièces de ${item.pays}</a>`
    : '';
  const cards = related.map(x => `
    <a class="related-card card" href="${detailHref(type, x)}">
      <strong>${x.nom || (x.pays + ' — ' + x.valeur)}</strong>
      <span>${x.annees} · ${raretyLabel(x.rarete)}</span>
    </a>`).join('');
  return `
    <div class="related-actions">${countryLink}<a class="chip" href="${siteBase()}${type === 'piece' ? 'pieces.html' : 'billets.html'}">Retour au catalogue</a></div>
    ${cards ? `<div class="related-grid">${cards}</div>` : ''}`;
}

function readEmbeddedPageData() {
  const el = document.getElementById('page-data');
  if (!el) return null;
  try { return JSON.parse(el.textContent); } catch (_) { return null; }
}

async function boot() {
  const staticType = document.body?.dataset?.type;
  const type = staticType ? (staticType === 'billet' ? 'billet' : 'piece') : (qs('type') === 'billet' ? 'billet' : 'piece');
  const id = document.body?.dataset?.id || qs('id');
  const base = siteBase();
  const dataPath = base + (type === 'piece' ? 'data/pieces.json' : 'data/billets.json');
  const listPage = base + (type === 'piece' ? 'pieces.html' : 'billets.html');
  const listLabel = type === 'piece' ? 'Pièces' : 'Billets';

  renderHUD(type === 'piece' ? 'pieces' : 'billets', { label: listLabel, href: listPage });
  renderFooter();

  let items = [];
  let item = null;
  const embedded = readEmbeddedPageData();
  if (embedded && embedded.item && embedded.item.id === id) {
    item = embedded.item;
    items = [embedded.item, ...(embedded.related || [])];
  } else {
    try {
      items = await loadJSON(dataPath);
      item = items.find(i => i.id === id) || items[0];
    } catch (e) {
      document.getElementById('detail-root').innerHTML = `<div class="empty-state">Impossible de charger cette fiche pour le moment.</div>`;
      return;
    }
  }

  if (!item) {
    document.getElementById('detail-root').innerHTML = `<div class="empty-state">Fiche introuvable.</div>`;
    return;
  }

  if (!staticType) {
    document.title = `${item.pays} — ${item.valeur} (${item.annees}) · EuroRare`;
  }

  const root = document.getElementById('detail-root');
  const hasPhoto = !!item.photo;
  root.innerHTML = `
    <nav class="breadcrumbs" aria-label="Fil d'Ariane">
      <a href="${base}index.html">EuroRare</a>
      <span aria-hidden="true">›</span>
      <a href="${listPage}">${listLabel}</a>
      <span aria-hidden="true">›</span>
      <span aria-current="page">${item.nom || (item.pays + ' — ' + item.valeur)}</span>
    </nav>
    <div class="detail-grid">
      <div class="stage">
        ${renderSpecimenFrame(item, type)}
        <div class="stage-rarete-row">${raretyMeter(item.rarete)}</div>
      </div>
      <div class="detail-info">
        <div class="detail-title-row">
          <h1>${item.pays} — ${item.valeur}</h1>
        </div>
        ${item.nom ? `<p style="font-size:16px;color:var(--ink);margin-bottom:6px;font-style:italic;">${item.nom}</p>` : ''}
        <div class="detail-meta-line">${item.annees} &middot; ${CATEGORIE_LABELS[item.categorie] || item.categorie}${item.date_emission ? ` &middot; Émission : ${item.date_emission}` : ""}</div>

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
            <p class="source-line">Source / repères : ${renderItemSource(item)}</p>
          </div>
        </div>

        <div class="section-block">
          <h2>03 — ${type === 'billet' ? 'Comparer avec un billet authentique' : 'Voir une vraie photo'}</h2>
          ${hasPhoto ? `
            <p style="font-size:14px;">${item.photo.representative ? "Le visuel affiché ci-contre est un exemplaire réel représentatif de cette fiche. La fiche couvre plusieurs millésimes ou variantes : vérifiez aussi les critères et l’année de votre exemplaire." : "Les visuels affichés ci-contre correspondent aux faces de cet exemplaire. Vous pouvez le comparer directement au vôtre."}</p><p class="source-line">${renderPhotoCredit(item)}</p>
          ` : (type === 'billet' ? `
            <p style="font-size:14px;margin-bottom:10px;">Cette fiche regroupe plusieurs variantes de billets. Comparez votre exemplaire avec les références officielles de la Banque centrale européenne plutôt qu'avec une image générique unique.</p>
            <div class="identify-links">
              <a class="chip" target="_blank" rel="noopener" href="https://www.ecb.europa.eu/euro/banknotes/current/html/index.fr.html">Billets officiels BCE</a>
              <a class="chip" target="_blank" rel="noopener" href="https://www.ecb.europa.eu/euro/banknotes/current/security/html/index.fr.html">Signes de sécurité BCE</a>
            </div>
          ` : `
            <p style="font-size:14px;margin-bottom:10px;">Aucune photo vérifiée n'est encore disponible pour cette fiche. Pour comparer avec un exemplaire authentique :</p>
            <div class="identify-links">
              <a class="chip" target="_blank" rel="noopener" href="https://www.google.com/search?tbm=isch&q=${encodeURIComponent((item.nom || item.pays) + ' ' + item.pays + ' ' + item.annees + ' euro coin')}">Rechercher des photos</a>
              <a class="chip" target="_blank" rel="noopener" href="https://en.numista.com/catalogue/themes/euro-coins.php">Catalogue Numista</a>
            </div>
          `)}
        </div>

        <div class="section-block">
          <h2>04 — Valeur de revente & références de marché</h2>
          ${renderMarketPanel(item)}
        </div>

        <div class="section-block">
          <h2>05 — À voir aussi</h2>
          ${renderRelatedItems(type, item, items)}
        </div>

        <div class="section-block">
          <h2>06 — Estimation &amp; vérification</h2>
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
    frame.addEventListener('click', () => {
      const flipped = flipEl.classList.toggle('flipped');
      frame.setAttribute('aria-label', flipped ? 'Afficher l’avers' : 'Afficher le revers');
    });
  }
}

boot();
