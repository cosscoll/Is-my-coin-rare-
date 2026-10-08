/* =========================================================
   EuroRare — logique des pages de liste (pièces / billets)
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
};

function categorieLabel(c) { return CATEGORIE_LABELS[c] || c; }

/* ---------------------------------------------------------
   Inspector — real-photo side panel (list pages)
   --------------------------------------------------------- */

function renderListPhotoCredit(item) {
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

function renderInspector(type, item) {
  const panel = document.getElementById('inspector');
  if (!panel) return;
  if (!item) {
    panel.innerHTML = `<div class="inspector-empty">Survolez ou touchez une fiche pour la voir apparaître ici.</div>`;
    return;
  }

  const initial = (item.pays || '?').charAt(0);

  const frameHtml = item.photo ? (item.photo.combined ? `
    <div class="specimen-frame">
      <span class="specimen-badge real">✓ ${item.photo.representative ? "Visuel réel représentatif" : "Photo réelle"}</span>
      <div class="specimen-face front"><img src="${item.photo.recto}" alt="${item.nom || item.pays} — avers et revers" loading="lazy"></div>
    </div>
    <p class="specimen-hint">Avers et revers sur le même visuel</p>
  ` : `
    <button type="button" class="specimen-frame" id="insp-frame" aria-label="Afficher le revers">
      <span class="specimen-badge real">✓ ${item.photo.representative ? "Visuel réel représentatif" : "Photo réelle"}</span>
      <div class="specimen-flip" id="insp-flip">
        <div class="specimen-face front"><img src="${item.photo.recto}" alt="${item.nom || item.pays} — avers" loading="lazy"></div>
        <div class="specimen-face back"><img src="${item.photo.verso}" alt="${item.nom || item.pays} — revers" loading="lazy"></div>
      </div>
    </button>
    <p class="specimen-hint">Cliquez ou appuyez sur Entrée pour voir le revers</p>
  `) : `
    <div class="specimen-frame ${type === 'billet' ? 'square' : ''}">
      <span class="specimen-badge stylised-badge">${type === 'billet' ? 'Visuel de référence à venir' : 'Photo à venir'}</span>
      <div class="specimen-face placeholder">
        <span class="monogram">${initial}</span>
      </div>
    </div>
  `;

  panel.innerHTML = `
    ${frameHtml}
    <h4>${item.pays} — ${item.valeur}</h4>
    <div class="meta-line">${item.annees} &middot; ${categorieLabel(item.categorie)}</div>
    ${item.nom ? `<p style="font-size:13px;margin-bottom:10px;font-style:italic;">${item.nom}</p>` : ''}
    ${raretyBadge(item.rarete, 'sm')}
    ${item.photo ? `<p class="inspector-credit">${renderListPhotoCredit(item)}</p>` : ''}
    <a class="go-btn" href="${detailHref(type, item)}">Voir la fiche complète &rarr;</a>
  `;

  if (item.photo && !item.photo.combined) {
    const frame = document.getElementById('insp-frame');
    const flip = document.getElementById('insp-flip');
    frame.addEventListener('click', () => {
      const flipped = flip.classList.toggle('flipped');
      frame.setAttribute('aria-label', flipped ? 'Afficher l’avers' : 'Afficher le revers');
    });
  }
}

async function initListPage(type, dataPath) {
  renderHUD(type === 'piece' ? 'pieces' : 'billets', null);
  renderFooter();

  const grid = document.getElementById('grid');
  const countEl = document.getElementById('results-count');
  let items = [];

  try {
    items = await loadJSON(dataPath);
  } catch (e) {
    grid.innerHTML = `<div class="empty-state">Impossible de charger les données pour le moment.</div>`;
    return;
  }

  const paysSel = document.getElementById('f-pays');
  const valeurSel = document.getElementById('f-valeur');
  const catSel = document.getElementById('f-categorie');
  const raretSel = document.getElementById('f-rarete');
  const searchInput = document.getElementById('f-search');
  const resetBtn = document.getElementById('f-reset');

  const paysList = [...new Set(items.map(i => i.pays))].sort((a, b) => a.localeCompare(b, 'fr'));
  const valeurList = [...new Set(items.map(i => i.valeur))];
  const catList = [...new Set(items.map(i => i.categorie))];

  paysList.forEach(p => paysSel.insertAdjacentHTML('beforeend', `<option value="${p}">${p}</option>`));
  valeurList.forEach(v => valeurSel.insertAdjacentHTML('beforeend', `<option value="${v}">${v}</option>`));
  catList.forEach(c => catSel.insertAdjacentHTML('beforeend', `<option value="${c}">${categorieLabel(c)}</option>`));

  function applyFilters() {
    const p = paysSel.value, v = valeurSel.value, c = catSel.value, r = raretSel.value;
    const q = (searchInput.value || '').trim().toLowerCase();
    const filtered = items.filter(i => {
      if (p && i.pays !== p) return false;
      if (v && i.valeur !== v) return false;
      if (c && i.categorie !== c) return false;
      if (r && i.rarete !== r) return false;
      if (q) {
        const haystack = [i.pays, i.annees, i.valeur, i.nom, i.explication, categorieLabel(i.categorie),
          ...(i.criteres || []).map(cr => cr.titre + ' ' + cr.detail)].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    render(filtered);
  }

  function render(list) {
    countEl.textContent = `${list.length} résultat${list.length > 1 ? 's' : ''}`;
    if (list.length === 0) {
      grid.innerHTML = `<div class="empty-state">Aucune fiche ne correspond à ces filtres pour le moment. Essayez d'en retirer un.</div>`;
      renderInspector(type, null);
      return;
    }
    grid.innerHTML = list.map((i, idx) => `
      <a class="card item-card" data-idx="${idx}" href="${detailHref(type, i)}">
        <div class="item-card-top">
          <div>
            <div class="pays">${i.pays}</div>
            <div class="meta">${i.annees} &middot; ${categorieLabel(i.categorie)}</div>
          </div>
          <span class="valeur-badge">${i.valeur}</span>
        </div>
        ${i.nom ? `<p style="font-size:13.5px;color:var(--ink);font-style:italic;">${i.nom}</p>` : ''}
        <p class="desc">${i.explication.slice(0, 100)}${i.explication.length > 100 ? '…' : ''}</p>
        <div class="bottom-row">
          ${raretyBadge(i.rarete, 'sm')}
          ${i.photo ? '<span class="photo-flag">📷 photo réelle</span>' : ''}
        </div>
      </a>
    `).join('');
    staggerIn('.item-card', grid);

    grid.querySelectorAll('.item-card').forEach(card => {
      card.addEventListener('mouseenter', () => renderInspector(type, list[+card.dataset.idx]));
      card.addEventListener('focus', () => renderInspector(type, list[+card.dataset.idx]));
    });
    const defaultItem = list.find(i => i.photo) || list[0];
    renderInspector(type, defaultItem);
  }

  [paysSel, valeurSel, catSel, raretSel].forEach(el => el.addEventListener('change', applyFilters));
  let searchDebounce;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(applyFilters, 180);
  });
  resetBtn.addEventListener('click', () => {
    paysSel.value = ''; valeurSel.value = ''; catSel.value = ''; raretSel.value = ''; searchInput.value = '';
    applyFilters();
  });

  render(items);
  initIdentifyWizard(type, items, { paysSel, valeurSel, catSel, raretSel, applyFilters });
}

/* ---------------------------------------------------------
   Assistant "Identifie ma pièce / mon billet"
   --------------------------------------------------------- */

function initIdentifyWizard(type, items, filterRefs) {
  const panel = document.getElementById('identify-panel');
  if (!panel) return;

  const paysList = [...new Set(items.map(i => i.pays))].sort((a, b) => a.localeCompare(b, 'fr'));
  const catList = [...new Set(items.map(i => i.categorie))];
  const questions = type === 'billet'
    ? [{
        key: 'categorie',
        label: 'Quel détail voulez-vous vérifier sur votre billet ?',
        options: catList,
        display: (c) => CATEGORIE_LABELS[c] || c
      }]
    : [
        {
          key: 'pays',
          label: 'De quel pays vient votre pièce ?',
          options: paysList
        },
        {
          key: 'categorie',
          label: 'Qu\'avez-vous remarqué de particulier ?',
          options: catList,
          display: (c) => CATEGORIE_LABELS[c] || c
        }
      ];

  let step = 0;
  const answers = {};

  function renderStep() {
    if (step >= questions.length) return renderResults();
    const q = questions[step];
    panel.innerHTML = `
      <div class="identify-q active">
        <h4>${q.label}</h4>
        <div class="identify-options">
          ${q.options.map(o => `<button class="identify-opt" data-value="${o}">${q.display ? q.display(o) : o}</button>`).join('')}
          <button class="identify-opt" data-value="">Je ne sais pas / passer</button>
        </div>
        <div class="identify-nav">
          <span class="chip">Étape ${step + 1} / ${questions.length}</span>
          ${step > 0 ? '<button class="btn btn-ghost" id="wizard-back">&larr; Précédent</button>' : '<span></span>'}
        </div>
      </div>
    `;
    panel.querySelectorAll('.identify-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        answers[q.key] = btn.dataset.value;
        step++;
        renderStep();
      });
    });
    const back = document.getElementById('wizard-back');
    if (back) back.addEventListener('click', () => { step--; renderStep(); });
  }

  function renderResults() {
    filterRefs.paysSel.value = answers.pays || '';
    filterRefs.catSel.value = answers.categorie || '';
    filterRefs.applyFilters();

    const matches = items.filter(i =>
      (!answers.pays || i.pays === answers.pays) &&
      (!answers.categorie || i.categorie === answers.categorie)
    );

    panel.innerHTML = `
      <div class="identify-results active">
        <h4>${matches.length ? `${matches.length} fiche${matches.length > 1 ? 's' : ''} correspondante${matches.length > 1 ? 's' : ''}` : 'Aucune correspondance directe'}</h4>
        <div class="identify-results-list">
        ${matches.length ? matches.map(i => `
          <a class="identify-result-item" href="${detailHref(type, i)}">
            <span>${i.nom ? i.nom : (i.pays + ' — ' + i.valeur)} <span style="color:var(--text-faint)">(${i.annees})</span></span>
            ${raretyBadge(i.rarete, 'sm')}
          </a>
        `).join('') : `<p style="font-size:14px;margin-bottom:16px;">Vos réponses ne correspondent à aucun cas documenté dans cette sélection — cela ne signifie pas que votre exemplaire est sans intérêt, seulement qu'il ne fait pas partie de nos fiches pédagogiques. Parcourez la liste complète ci-dessous ou affinez les filtres.</p>`}
        </div>
        <div class="identify-nav">
          <button class="btn btn-ghost" id="wizard-restart">&larr; Recommencer</button>
        </div>
      </div>
    `;
    document.getElementById('wizard-restart').addEventListener('click', () => {
      step = 0; answers.pays = undefined; answers.categorie = undefined; renderStep();
    });
  }

  renderStep();
}
