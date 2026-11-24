/**
 * TOMOBILE OPF GROUPE - Application principale
 */

let currentPage = 'dashboard';
let isLoggedIn = false;

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  // Login form
  $('#login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = formValue('login-id');
    const pass = formValue('login-pass');
    const d = getData();
    if (id === d.admin.id && pass === d.admin.password) {
      isLoggedIn = true;
      sessionStorage.setItem('tomobile_auth', '1');
      showApp();
      navigate('dashboard');
      toast('Bienvenue administrateur', 'success');
    } else {
      $('#login-error').textContent = 'Identifiant ou mot de passe incorrect';
      $('#login-error').classList.remove('hidden');
    }
  });

  // Session
  if (sessionStorage.getItem('tomobile_auth') === '1') {
    isLoggedIn = true;
    showApp();
    navigate('dashboard');
  }

  // Menu
  $('#btn-menu').addEventListener('click', toggleMenu);
  $('#menu-overlay').addEventListener('click', closeMenu);
  $$('.menu-list li').forEach(li => {
    li.addEventListener('click', () => {
      navigate(li.dataset.page);
      closeMenu();
    });
  });

  $('#btn-logout').addEventListener('click', () => {
    if (confirmAction('Se déconnecter ?')) {
      sessionStorage.removeItem('tomobile_auth');
      isLoggedIn = false;
      $('#app-screen').classList.remove('active');
      $('#login-screen').classList.add('active');
      $('#login-id').value = '';
      $('#login-pass').value = '';
    }
  });

  $('#modal-close').addEventListener('click', closeModal);
  $('#modal').addEventListener('click', (e) => {
    if (e.target === $('#modal')) closeModal();
  });
});

function showApp() {
  $('#login-screen').classList.remove('active');
  $('#app-screen').classList.add('active');
}

function toggleMenu() {
  $('#side-menu').classList.toggle('open');
  $('#menu-overlay').classList.toggle('open');
}
function closeMenu() {
  $('#side-menu').classList.remove('open');
  $('#menu-overlay').classList.remove('open');
}

function navigate(page) {
  currentPage = page;
  $$('.menu-list li').forEach(li => {
    li.classList.toggle('active', li.dataset.page === page);
  });
  const main = $('#main-content');
  main.innerHTML = '';
  const renderers = {
    dashboard: renderDashboard,
    chefs: renderChefs,
    participants: renderParticipants,
    cotisations: renderCotisations,
    manques: renderManques,
    prets: renderPrets,
    caisses: renderCaisses,
    tours: renderTours,
    historique: renderHistorique,
    export: renderExport
  };
  if (renderers[page]) renderers[page](main);
}

// ========== DASHBOARD ==========
function renderDashboard(container) {
  const d = getData();
  const totalChefs = d.chefs.length;
  const totalParts = d.participants.length;
  const totalPartsParts = d.participants.reduce((s, p) => s + p.nombreParts, 0) +
    d.chefs.reduce((s, c) => s + c.nombreParts, 0);
  const soldePrets = d.prets.reduce((s, p) => s + p.soldeRestant, 0);

  container.innerHTML = `
    <h2 class="page-title">Tableau de bord</h2>
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-value">${totalChefs}</div>
        <div class="stat-label">Chefs d'équipes</div>
      </div>
      <div class="stat-card orange">
        <div class="stat-value">${totalParts}</div>
        <div class="stat-label">Participants</div>
      </div>
      <div class="stat-card green">
        <div class="stat-value">${totalPartsParts}</div>
        <div class="stat-label">Parts totales</div>
      </div>
      <div class="stat-card red">
        <div class="stat-value">${formatMoney(soldePrets)}</div>
        <div class="stat-label">Solde prêts</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Caisses</span>
      </div>
      <div class="detail-row">
        <span class="label">CAISSE TR/NR (Non ramassée)</span>
        <span class="value">${formatMoney(d.caisses.TRNR)}</span>
      </div>
      <div class="detail-row">
        <span class="label">CAISSE TMANQP (Manqués payés)</span>
        <span class="value">${formatMoney(d.caisses.TMANQP)}</span>
      </div>
      <div class="detail-row">
        <span class="label">CAISSE D (Dettes)</span>
        <span class="value" style="color:var(--danger)">${formatMoney(d.caisses.D)}</span>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Paramètres actuels</span>
      </div>
      <div class="detail-row">
        <span class="label">Parts par tour</span>
        <span class="value">${d.params.partsParTour}</span>
      </div>
      <div class="detail-row">
        <span class="label">Montant / part</span>
        <span class="value">${formatMoney(d.params.montantPart)}</span>
      </div>
      <div class="detail-row">
        <span class="label">Périodicité</span>
        <span class="value">${d.params.periodiciteJours} jour(s)</span>
      </div>
      <div class="detail-row">
        <span class="label">Parts enchères (1er tour)</span>
        <span class="value">${d.params.partsEncheres}</span>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-title">Dernières transactions</span>
      </div>
      ${d.transactions.slice(0, 5).map(tx => `
        <div class="list-item">
          <div class="info">
            <div class="name">${escapeHtml(tx.description)}</div>
            <div class="meta">${formatDateTime(tx.date)}</div>
          </div>
          <span class="badge badge-primary">${tx.type}</span>
        </div>
      `).join('') || '<p class="empty-state">Aucune transaction</p>'}
    </div>
  `;
}

// ========== CHEFS ==========
function renderChefs(container) {
  const chefs = getChefs();
  container.innerHTML = `
    <h2 class="page-title">
      Chefs d'équipes
      <button class="btn btn-orange btn-sm" onclick="showChefForm()">+ Ajouter</button>
    </h2>
    <div class="search-bar">
      <input type="search" id="search-chefs" placeholder="Rechercher un chef..." oninput="filterChefs(this.value)">
    </div>
    <div id="chefs-list">
      ${renderChefsList(chefs)}
    </div>
  `;
}

function renderChefsList(chefs) {
  if (!chefs.length) {
    return `<div class="empty-state"><div class="icon">👥</div>Aucun chef d'équipe enregistré</div>`;
  }
  return chefs.map(c => {
    const parts = getParticipants(c.id);
    return `
      <div class="card" data-id="${c.id}">
        <div class="card-header">
          <div>
            <div class="card-title">${escapeHtml(c.prenom)} ${escapeHtml(c.nom)}</div>
            <div class="meta">${c.matricule} · ${c.telephone || '—'}</div>
          </div>
          <span class="badge badge-orange">${c.nombreParts} part(s)</span>
        </div>
        <div class="detail-row">
          <span class="label">Domicile</span>
          <span class="value">${escapeHtml([c.quartier, c.ville, c.commune].filter(Boolean).join(', ') || '—')}</span>
        </div>
        <div class="detail-row">
          <span class="label">Participants</span>
          <span class="value">${parts.length}</span>
        </div>
        <div class="actions" style="margin-top:10px">
          <button class="btn btn-primary btn-sm" onclick="showChefDetail(${c.id})">Voir / Participants</button>
          <button class="btn btn-outline btn-sm" onclick="showChefForm(${c.id})">Modifier</button>
          <button class="btn btn-danger btn-sm" onclick="doDeleteChef(${c.id})">Suppr.</button>
        </div>
      </div>
    `;
  }).join('');
}

function filterChefs(q) {
  const chefs = getChefs().filter(c =>
    (c.nom + ' ' + c.prenom + ' ' + c.matricule + ' ' + (c.telephone || '')).toLowerCase().includes(q.toLowerCase())
  );
  $('#chefs-list').innerHTML = renderChefsList(chefs);
}

function showChefForm(id = null) {
  const c = id ? getChef(id) : null;
  openModal(c ? 'Modifier chef d\'équipe' : 'Nouveau chef d\'équipe', `
    <div class="form-row">
      <div class="form-group">
        <label>Nom *</label>
        <input type="text" id="f-nom" value="${escapeHtml(c?.nom || '')}" required>
      </div>
      <div class="form-group">
        <label>Prénom *</label>
        <input type="text" id="f-prenom" value="${escapeHtml(c?.prenom || '')}" required>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Date de naissance</label>
        <input type="date" id="f-dnaiss" value="${c?.dateNaissance || ''}">
      </div>
      <div class="form-group">
        <label>Lieu de naissance</label>
        <input type="text" id="f-lnaiss" value="${escapeHtml(c?.lieuNaissance || '')}">
      </div>
    </div>
    <div class="form-group">
      <label>Quartier</label>
      <input type="text" id="f-quartier" value="${escapeHtml(c?.quartier || '')}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Ville</label>
        <input type="text" id="f-ville" value="${escapeHtml(c?.ville || '')}">
      </div>
      <div class="form-group">
        <label>Commune</label>
        <input type="text" id="f-commune" value="${escapeHtml(c?.commune || '')}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Téléphone</label>
        <input type="tel" id="f-tel" value="${escapeHtml(c?.telephone || '')}">
      </div>
      <div class="form-group">
        <label>Nombre de parts *</label>
        <input type="number" id="f-parts" min="1" value="${c?.nombreParts || 1}">
      </div>
    </div>
  `, `
    <button class="btn btn-outline" onclick="closeModal()">Annuler</button>
    <button class="btn btn-primary" onclick="saveChef(${id || 'null'})">Enregistrer</button>
  `);
}

function saveChef(id) {
  const fields = {
    nom: formValue('f-nom'),
    prenom: formValue('f-prenom'),
    dateNaissance: formValue('f-dnaiss'),
    lieuNaissance: formValue('f-lnaiss'),
    quartier: formValue('f-quartier'),
    ville: formValue('f-ville'),
    commune: formValue('f-commune'),
    telephone: formValue('f-tel'),
    nombreParts: formInt('f-parts')
  };
  if (!fields.nom || !fields.prenom) {
    toast('Nom et prénom obligatoires', 'error');
    return;
  }
  if (id && id !== 'null') {
    updateChef(id, fields);
    toast('Chef modifié', 'success');
  } else {
    addChef(fields);
    toast('Chef enregistré', 'success');
  }
  closeModal();
  navigate('chefs');
}

function doDeleteChef(id) {
  if (confirmAction('Supprimer ce chef d\'équipe ?')) {
    if (deleteChef(id)) {
      toast('Chef supprimé', 'success');
      navigate('chefs');
    }
  }
}

function showChefDetail(id) {
  const c = getChef(id);
  if (!c) return;
  const parts = getParticipants(id);
  openModal(`${c.prenom} ${c.nom}`, `
    <div class="detail-row"><span class="label">Matricule</span><span class="value">${c.matricule}</span></div>
    <div class="detail-row"><span class="label">Téléphone</span><span class="value">${escapeHtml(c.telephone || '—')}</span></div>
    <div class="detail-row"><span class="label">Naissance</span><span class="value">${formatDate(c.dateNaissance)} · ${escapeHtml(c.lieuNaissance || '—')}</span></div>
    <div class="detail-row"><span class="label">Domicile</span><span class="value">${escapeHtml([c.quartier, c.ville, c.commune].filter(Boolean).join(', ') || '—')}</span></div>
    <div class="detail-row"><span class="label">Parts</span><span class="value">${c.nombreParts}</span></div>
    <div class="section-title">Participants de l'équipe (${parts.length})</div>
    ${parts.length ? parts.map(p => `
      <div class="list-item">
        <div class="info">
          <div class="name">${escapeHtml(p.prenom)} ${escapeHtml(p.nom)}</div>
          <div class="meta">${p.matricule} · ${p.nombreParts} part(s) · ${p.telephone || ''}</div>
        </div>
        <button class="btn btn-sm btn-outline" onclick="closeModal(); showParticipantDetail(${p.id})">Voir</button>
      </div>
    `).join('') : '<p class="empty-state">Aucun participant</p>'}
  `, `<button class="btn btn-primary" onclick="closeModal()">Fermer</button>`, true);
}

// ========== PARTICIPANTS ==========
function renderParticipants(container) {
  const parts = getParticipants();
  const chefs = getChefs();
  container.innerHTML = `
    <h2 class="page-title">
      Participants
      <button class="btn btn-orange btn-sm" onclick="showParticipantForm()">+ Ajouter</button>
    </h2>
    <div class="search-bar">
      <input type="search" id="search-parts" placeholder="Rechercher un participant..." oninput="filterParticipants(this.value)">
    </div>
    <div id="parts-list">
      ${renderPartsList(parts, chefs)}
    </div>
  `;
}

function renderPartsList(parts, chefs) {
  if (!parts.length) {
    return `<div class="empty-state"><div class="icon">👤</div>Aucun participant enregistré</div>`;
  }
  const chefMap = Object.fromEntries(chefs.map(c => [c.id, c]));
  return parts.map(p => {
    const chef = chefMap[p.chefId];
    const solde = soldePretsParticipant(p.id);
    return `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">${escapeHtml(p.prenom)} ${escapeHtml(p.nom)}</div>
            <div class="meta">${p.matricule} · Chef: ${chef ? escapeHtml(chef.prenom + ' ' + chef.nom) : '—'}</div>
          </div>
          <div>
            <span class="badge badge-primary">${p.nombreParts} part(s)</span>
            ${p.aRamasse ? '<span class="badge badge-success">Ramassé</span>' : ''}
          </div>
        </div>
        <div class="detail-row">
          <span class="label">Téléphone</span>
          <span class="value">${escapeHtml(p.telephone || '—')}</span>
        </div>
        ${solde > 0 ? `<div class="detail-row"><span class="label">Solde prêts</span><span class="value" style="color:var(--danger)">${formatMoney(solde)}</span></div>` : ''}
        <div class="actions" style="margin-top:10px">
          <button class="btn btn-primary btn-sm" onclick="showParticipantDetail(${p.id})">Profil</button>
          <button class="btn btn-outline btn-sm" onclick="showParticipantForm(${p.id})">Modifier</button>
          ${!p.aRamasse ? `<button class="btn btn-success btn-sm" onclick="doMarquerRamassage(${p.id})">Ramasser</button>` : ''}
          <button class="btn btn-danger btn-sm" onclick="doDeleteParticipant(${p.id})">Suppr.</button>
        </div>
      </div>
    `;
  }).join('');
}

function filterParticipants(q) {
  const parts = getParticipants().filter(p =>
    (p.nom + ' ' + p.prenom + ' ' + p.matricule + ' ' + (p.telephone || '')).toLowerCase().includes(q.toLowerCase())
  );
  $('#parts-list').innerHTML = renderPartsList(parts, getChefs());
}

function showParticipantForm(id = null) {
  const p = id ? getParticipant(id) : null;
  const chefs = getChefs();
  if (!chefs.length && !p) {
    toast('Créez d\'abord un chef d\'équipe', 'error');
    return;
  }
  openModal(p ? 'Modifier participant' : 'Nouveau participant', `
    <div class="form-group">
      <label>Chef d'équipe *</label>
      <select id="f-chef">
        ${chefs.map(c => `<option value="${c.id}" ${p && p.chefId === c.id ? 'selected' : ''}>${escapeHtml(c.prenom + ' ' + c.nom)}</option>`).join('')}
      </select>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Nom *</label>
        <input type="text" id="f-nom" value="${escapeHtml(p?.nom || '')}">
      </div>
      <div class="form-group">
        <label>Prénom *</label>
        <input type="text" id="f-prenom" value="${escapeHtml(p?.prenom || '')}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Date de naissance</label>
        <input type="date" id="f-dnaiss" value="${p?.dateNaissance || ''}">
      </div>
      <div class="form-group">
        <label>Lieu de naissance</label>
        <input type="text" id="f-lnaiss" value="${escapeHtml(p?.lieuNaissance || '')}">
      </div>
    </div>
    <div class="form-group">
      <label>Quartier</label>
      <input type="text" id="f-quartier" value="${escapeHtml(p?.quartier || '')}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Ville</label>
        <input type="text" id="f-ville" value="${escapeHtml(p?.ville || '')}">
      </div>
      <div class="form-group">
        <label>Commune</label>
        <input type="text" id="f-commune" value="${escapeHtml(p?.commune || '')}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Téléphone</label>
        <input type="tel" id="f-tel" value="${escapeHtml(p?.telephone || '')}">
      </div>
      <div class="form-group">
        <label>Nombre de parts *</label>
        <input type="number" id="f-parts" min="1" value="${p?.nombreParts || 1}">
      </div>
    </div>
    <p style="font-size:0.8rem;color:var(--text-secondary);margin-top:8px">
      Note : une part peut être cotisée par au plus 3 personnes (co-titulaires à ajouter dans le profil).
    </p>
  `, `
    <button class="btn btn-outline" onclick="closeModal()">Annuler</button>
    <button class="btn btn-primary" onclick="saveParticipant(${id || 'null'})">Enregistrer</button>
  `);
}

function saveParticipant(id) {
  const fields = {
    chefId: formInt('f-chef'),
    nom: formValue('f-nom'),
    prenom: formValue('f-prenom'),
    dateNaissance: formValue('f-dnaiss'),
    lieuNaissance: formValue('f-lnaiss'),
    quartier: formValue('f-quartier'),
    ville: formValue('f-ville'),
    commune: formValue('f-commune'),
    telephone: formValue('f-tel'),
    nombreParts: formInt('f-parts')
  };
  if (!fields.nom || !fields.prenom) {
    toast('Nom et prénom obligatoires', 'error');
    return;
  }
  if (id && id !== 'null') {
    updateParticipant(id, fields);
    toast('Participant modifié', 'success');
  } else {
    addParticipant(fields);
    toast('Participant enregistré', 'success');
  }
  closeModal();
  navigate('participants');
}

function doDeleteParticipant(id) {
  if (confirmAction('Supprimer ce participant ?')) {
    if (deleteParticipant(id)) {
      toast('Participant supprimé', 'success');
      navigate('participants');
    }
  }
}

function doMarquerRamassage(id) {
  if (confirmAction('Marquer ce participant comme ayant ramassé la tontine à son tour ?')) {
    marquerRamassage(id);
    toast('Ramassage enregistré', 'success');
    navigate('participants');
  }
}

function showParticipantDetail(id) {
  const p = getParticipant(id);
  if (!p) return;
  const chef = getChef(p.chefId);
  const prets = getPretsParticipant(id);
  const solde = soldePretsParticipant(id);
  openModal(`Profil : ${p.prenom} ${p.nom}`, `
    <div class="detail-row"><span class="label">Matricule</span><span class="value">${p.matricule}</span></div>
    <div class="detail-row"><span class="label">Chef d'équipe</span><span class="value">${chef ? escapeHtml(chef.prenom + ' ' + chef.nom) : '—'}</span></div>
    <div class="detail-row"><span class="label">Téléphone</span><span class="value">${escapeHtml(p.telephone || '—')}</span></div>
    <div class="detail-row"><span class="label">Naissance</span><span class="value">${formatDate(p.dateNaissance)} · ${escapeHtml(p.lieuNaissance || '—')}</span></div>
    <div class="detail-row"><span class="label">Domicile</span><span class="value">${escapeHtml([p.quartier, p.ville, p.commune].filter(Boolean).join(', ') || '—')}</span></div>
    <div class="detail-row"><span class="label">Parts</span><span class="value">${p.nombreParts}</span></div>
    <div class="detail-row"><span class="label">Ramassage</span><span class="value">${p.aRamasse ? 'Oui le ' + formatDate(p.dateRamassage) : 'Non'}</span></div>

    <div class="section-title">Prêts <span class="badge badge-danger">Solde : ${formatMoney(solde)}</span></div>
    ${prets.length ? prets.map(pr => `
      <div class="list-item">
        <div class="info">
          <div class="name">${formatMoney(pr.montant)} · Restant ${formatMoney(pr.soldeRestant)}</div>
          <div class="meta">${formatDate(pr.date)} · ${escapeHtml(pr.motif || '')}</div>
        </div>
        ${pr.soldeRestant > 0 ? `<button class="btn btn-sm btn-success" onclick="showRemboursement(${pr.id})">Rembourser</button>` : '<span class="badge badge-success">Soldé</span>'}
      </div>
    `).join('') : '<p style="font-size:0.9rem;color:var(--text-secondary)">Aucun prêt</p>'}
    <button class="btn btn-orange btn-sm" style="margin-top:10px" onclick="showPretForm(${p.id})">+ Nouveau prêt</button>
  `, `
    <button class="btn btn-outline" onclick="closeModal()">Fermer</button>
    ${!p.aRamasse ? `<button class="btn btn-success" onclick="doMarquerRamassage(${p.id}); closeModal();">Marquer ramassage</button>` : ''}
  `, true);
}

// ========== COTISATIONS ==========
function renderCotisations(container) {
  const d = getData();
  const parts = getParticipants();
  const chefs = getChefs();
  container.innerHTML = `
    <h2 class="page-title">
      Cotisations du jour
      <button class="btn btn-orange btn-sm" onclick="showCotisationForm()">+ Enregistrer</button>
    </h2>
    <div class="card">
      <p style="font-size:0.9rem;color:var(--text-secondary)">
        Enregistrez la somme totale versée, les participants présents et ceux qui ont manqué (avec le montant dû).
        Le chef d'équipe collecte les parts de ses participants + les siennes.
      </p>
    </div>
    <div id="cotis-list">
      ${d.cotisations.slice(0, 20).map(c => `
        <div class="card">
          <div class="card-header">
            <div class="card-title">${formatDate(c.date)}</div>
            <span class="badge badge-primary">${formatMoney(c.montantTotalVerse)}</span>
          </div>
          <div class="detail-row">
            <span class="label">Présents</span>
            <span class="value">${c.participantsPresents.length}</span>
          </div>
          <div class="detail-row">
            <span class="label">Manqués</span>
            <span class="value">${c.participantsManques.length} · Dû ${formatMoney(c.montantDu)}</span>
          </div>
          ${c.notes ? `<div class="meta" style="margin-top:6px">${escapeHtml(c.notes)}</div>` : ''}
        </div>
      `).join('') || '<div class="empty-state">Aucune cotisation enregistrée</div>'}
    </div>
  `;
}

function showCotisationForm() {
  const parts = getParticipants();
  const chefs = getChefs();
  // Inclure aussi les chefs comme cotisants
  const allCotisants = [
    ...chefs.map(c => ({ id: 'C' + c.id, label: `[Chef] ${c.prenom} ${c.nom}`, parts: c.nombreParts, type: 'chef' })),
    ...parts.map(p => ({ id: 'P' + p.id, label: `${p.prenom} ${p.nom}`, parts: p.nombreParts, type: 'part' }))
  ];
  openModal('Enregistrer cotisation', `
    <div class="form-group">
      <label>Date</label>
      <input type="date" id="f-date" value="${new Date().toISOString().slice(0,10)}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Montant total versé (FCFA)</label>
        <input type="number" id="f-montant" min="0" step="100">
      </div>
      <div class="form-group">
        <label>Montant total dû manqués</label>
        <input type="number" id="f-montant-du" min="0" step="100" value="0">
      </div>
    </div>
    <div class="form-group">
      <label>Participants / Chefs présents (cochez)</label>
      <div class="checkbox-group" style="max-height:180px;overflow-y:auto">
        ${allCotisants.map(a => `
          <label class="checkbox-item">
            <input type="checkbox" name="present" value="${a.id}"> ${escapeHtml(a.label)} (${a.parts}p)
          </label>
        `).join('') || '<em>Aucun inscrit</em>'}
      </div>
    </div>
    <div class="form-group">
      <label>Participants manqués (cochez + montant dû si besoin)</label>
      <div class="checkbox-group" style="max-height:150px;overflow-y:auto">
        ${parts.map(p => `
          <label class="checkbox-item">
            <input type="checkbox" name="manque" value="${p.id}"> ${escapeHtml(p.prenom + ' ' + p.nom)}
          </label>
        `).join('') || '<em>Aucun</em>'}
      </div>
    </div>
    <div class="form-group">
      <label>Notes</label>
      <textarea id="f-notes" rows="2"></textarea>
    </div>
  `, `
    <button class="btn btn-outline" onclick="closeModal()">Annuler</button>
    <button class="btn btn-primary" onclick="saveCotisation()">Enregistrer</button>
  `);
}

function saveCotisation() {
  const presents = $$('input[name="present"]:checked').map(el => el.value);
  const manquesIds = $$('input[name="manque"]:checked').map(el => el.value);
  const montantDu = formNum('f-montant-du');
  const manques = manquesIds.map(id => ({
    id: parseInt(id),
    montantDu: manquesIds.length ? montantDu / manquesIds.length : 0
  }));
  enregistrerCotisation({
    date: formValue('f-date'),
    montantTotalVerse: formNum('f-montant'),
    montantDu,
    participantsPresents: presents,
    participantsManques: manques,
    notes: formValue('f-notes')
  });
  toast('Cotisation enregistrée', 'success');
  closeModal();
  navigate('cotisations');
}

// ========== PAIEMENTS MANQUÉS ==========
function renderManques(container) {
  const d = getData();
  container.innerHTML = `
    <h2 class="page-title">
      Paiements de parts manqués
      <button class="btn btn-orange btn-sm" onclick="showPaiementManqueForm()">+ Enregistrer</button>
    </h2>
    <div class="card">
      <p style="font-size:0.9rem;color:var(--text-secondary)">
        Notez le paiement d'un participant qui avait manqué, la date, le montant et l'identité de celui qui a versé.
      </p>
    </div>
    ${d.paiementsManques.slice(0, 30).map(pm => {
      const p = getParticipant(pm.participantId);
      return `
        <div class="card">
          <div class="card-header">
            <div class="card-title">${p ? escapeHtml(p.prenom + ' ' + p.nom) : 'ID ' + pm.participantId}</div>
            <span class="badge badge-success">${formatMoney(pm.montant)}</span>
          </div>
          <div class="detail-row"><span class="label">Date</span><span class="value">${formatDate(pm.date)}</span></div>
          <div class="detail-row"><span class="label">Versé par</span><span class="value">${escapeHtml(pm.payePar || '—')}</span></div>
        </div>
      `;
    }).join('') || '<div class="empty-state">Aucun paiement manqué enregistré</div>'}
  `;
}

function showPaiementManqueForm() {
  const parts = getParticipants();
  openModal('Paiement d\'une part manquée', `
    <div class="form-group">
      <label>Participant *</label>
      <select id="f-part">
        ${parts.map(p => `<option value="${p.id}">${escapeHtml(p.prenom + ' ' + p.nom)} (${p.matricule})</option>`).join('')}
      </select>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Montant (FCFA) *</label>
        <input type="number" id="f-montant" min="0" step="100">
      </div>
      <div class="form-group">
        <label>Date</label>
        <input type="date" id="f-date" value="${new Date().toISOString().slice(0,10)}">
      </div>
    </div>
    <div class="form-group">
      <label>Identité de celui qui a versé *</label>
      <input type="text" id="f-payepar" placeholder="Nom Prénom / relation">
    </div>
    <div class="form-group">
      <label>Notes</label>
      <textarea id="f-notes" rows="2"></textarea>
    </div>
  `, `
    <button class="btn btn-outline" onclick="closeModal()">Annuler</button>
    <button class="btn btn-primary" onclick="savePaiementManque()">Enregistrer</button>
  `);
}

function savePaiementManque() {
  if (!formValue('f-payepar') || !formNum('f-montant')) {
    toast('Montant et identité du payeur obligatoires', 'error');
    return;
  }
  enregistrerPaiementManque({
    participantId: formInt('f-part'),
    montant: formNum('f-montant'),
    date: formValue('f-date'),
    payePar: formValue('f-payepar'),
    notes: formValue('f-notes')
  });
  toast('Paiement manqué enregistré', 'success');
  closeModal();
  navigate('manques');
}

// ========== PRÊTS ==========
function renderPrets(container) {
  const d = getData();
  const prets = d.prets.slice().reverse();
  container.innerHTML = `
    <h2 class="page-title">
      Prêts
      <button class="btn btn-orange btn-sm" onclick="showPretForm()">+ Nouveau prêt</button>
    </h2>
    ${prets.map(pr => {
      const p = getParticipant(pr.participantId);
      return `
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">${p ? escapeHtml(p.prenom + ' ' + p.nom) : '—'}</div>
              <div class="meta">${formatDate(pr.date)} · ${escapeHtml(pr.motif || '')}</div>
            </div>
            <div style="text-align:right">
              <div class="badge badge-primary">${formatMoney(pr.montant)}</div>
              <div style="font-size:0.8rem;margin-top:4px;color:${pr.soldeRestant > 0 ? 'var(--danger)' : 'var(--success)'}">
                Restant: ${formatMoney(pr.soldeRestant)}
              </div>
            </div>
          </div>
          <div class="detail-row"><span class="label">Avaliseur</span><span class="value">${escapeHtml((pr.avaliseur.prenom || '') + ' ' + (pr.avaliseur.nom || '') || '—')}</span></div>
          <div class="actions" style="margin-top:8px">
            ${pr.soldeRestant > 0 ? `<button class="btn btn-success btn-sm" onclick="showRemboursement(${pr.id})">Rembourser</button>` : '<span class="badge badge-success">Soldé</span>'}
          </div>
        </div>
      `;
    }).join('') || '<div class="empty-state">Aucun prêt enregistré</div>'}
  `;
}

function showPretForm(participantId = null) {
  const parts = getParticipants();
  openModal('Nouveau prêt', `
    <div class="form-group">
      <label>Participant *</label>
      <select id="f-part">
        ${parts.map(p => `<option value="${p.id}" ${participantId == p.id ? 'selected' : ''}>${escapeHtml(p.prenom + ' ' + p.nom)}</option>`).join('')}
      </select>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Date</label>
        <input type="date" id="f-date" value="${new Date().toISOString().slice(0,10)}">
      </div>
      <div class="form-group">
        <label>Montant (FCFA) *</label>
        <input type="number" id="f-montant" min="0" step="100">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>N° Matricule</label>
        <input type="text" id="f-matricule">
      </div>
      <div class="form-group">
        <label>Téléphone</label>
        <input type="tel" id="f-tel">
      </div>
    </div>
    <div class="section-title">Avaliseur (garant)</div>
    <div class="form-row">
      <div class="form-group">
        <label>Nom</label>
        <input type="text" id="f-av-nom">
      </div>
      <div class="form-group">
        <label>Prénom</label>
        <input type="text" id="f-av-prenom">
      </div>
    </div>
    <div class="form-group">
      <label>Adresse</label>
      <input type="text" id="f-av-adresse">
    </div>
    <div class="form-group">
      <label>Téléphone avaliseur</label>
      <input type="tel" id="f-av-tel">
    </div>
    <div class="form-group">
      <label>Motif du prêt</label>
      <textarea id="f-motif" rows="2"></textarea>
    </div>
  `, `
    <button class="btn btn-outline" onclick="closeModal()">Annuler</button>
    <button class="btn btn-primary" onclick="savePret()">Enregistrer</button>
  `);
}

function savePret() {
  if (!formNum('f-montant')) {
    toast('Montant obligatoire', 'error');
    return;
  }
  ajouterPret({
    participantId: formInt('f-part'),
    date: formValue('f-date'),
    montant: formNum('f-montant'),
    matricule: formValue('f-matricule'),
    telephone: formValue('f-tel'),
    avaliseurNom: formValue('f-av-nom'),
    avaliseurPrenom: formValue('f-av-prenom'),
    avaliseurAdresse: formValue('f-av-adresse'),
    avaliseurTelephone: formValue('f-av-tel'),
    motif: formValue('f-motif')
  });
  toast('Prêt enregistré', 'success');
  closeModal();
  navigate('prets');
}

function showRemboursement(pretId) {
  const pret = getData().prets.find(p => p.id === pretId);
  if (!pret) return;
  openModal('Remboursement de prêt', `
    <p>Solde restant : <strong>${formatMoney(pret.soldeRestant)}</strong></p>
    <div class="form-group">
      <label>Montant remboursé *</label>
      <input type="number" id="f-montant" min="1" max="${pret.soldeRestant}" step="100" value="${pret.soldeRestant}">
    </div>
    <div class="form-group">
      <label>Date</label>
      <input type="date" id="f-date" value="${new Date().toISOString().slice(0,10)}">
    </div>
  `, `
    <button class="btn btn-outline" onclick="closeModal()">Annuler</button>
    <button class="btn btn-success" onclick="doRemboursement(${pretId})">Valider</button>
  `);
}

function doRemboursement(pretId) {
  const m = formNum('f-montant');
  if (!m) {
    toast('Montant invalide', 'error');
    return;
  }
  rembourserPret(pretId, m, formValue('f-date'));
  toast('Remboursement enregistré', 'success');
  closeModal();
  navigate('prets');
}

// ========== CAISSES ==========
function renderCaisses(container) {
  const d = getData();
  container.innerHTML = `
    <h2 class="page-title">Caisses</h2>
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-value">${formatMoney(d.caisses.TRNR)}</div>
        <div class="stat-label">CAISSE TR/NR<br><small>Reporter / Non ramassée</small></div>
      </div>
      <div class="stat-card green">
        <div class="stat-value">${formatMoney(d.caisses.TMANQP)}</div>
        <div class="stat-label">CAISSE TMANQP<br><small>Manqués payés</small></div>
      </div>
      <div class="stat-card red">
        <div class="stat-value">${formatMoney(d.caisses.D)}</div>
        <div class="stat-label">CAISSE D<br><small>Dettes</small></div>
      </div>
    </div>
    <div class="card">
      <div class="card-title" style="margin-bottom:12px">Ajustement manuel</div>
      <div class="form-group">
        <label>Type de caisse</label>
        <select id="f-caisse-type">
          <option value="TRNR">TR/NR – Non ramassée</option>
          <option value="TMANQP">TMANQP – Manqués payés</option>
          <option value="D">D – Dettes</option>
        </select>
      </div>
      <div class="form-group">
        <label>Montant (+ ou -)</label>
        <input type="number" id="f-caisse-montant" step="100">
      </div>
      <div class="form-group">
        <label>Motif</label>
        <input type="text" id="f-caisse-motif">
      </div>
      <button class="btn btn-primary" onclick="doAjusterCaisse()">Ajuster</button>
    </div>
  `;
}

function doAjusterCaisse() {
  const type = formValue('f-caisse-type');
  const montant = formNum('f-caisse-montant');
  const motif = formValue('f-caisse-motif');
  if (!montant) {
    toast('Montant requis', 'error');
    return;
  }
  ajusterCaisse(type, montant, motif);
  toast('Caisse mise à jour', 'success');
  navigate('caisses');
}

// ========== TOURS & PARAMÈTRES ==========
function renderTours(container) {
  const d = getData();
  const p = d.params;
  container.innerHTML = `
    <h2 class="page-title">Tours & Paramètres</h2>
    <div class="card">
      <div class="card-title" style="margin-bottom:14px">Paramètres généraux de la tontine</div>
      <div class="form-row">
        <div class="form-group">
          <label>Nombre de parts par tour</label>
          <input type="number" id="f-parts-tour" min="1" value="${p.partsParTour}">
        </div>
        <div class="form-group">
          <label>Montant par part (FCFA)</label>
          <input type="number" id="f-montant-part" min="0" step="100" value="${p.montantPart}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Parts 1ères vendues aux enchères</label>
          <input type="number" id="f-parts-enchere" min="0" value="${p.partsEncheres}">
        </div>
        <div class="form-group">
          <label>Coût / prime de vente enchère</label>
          <input type="number" id="f-cout-enchere" min="0" step="100" value="${p.coutVenteEnchere}">
        </div>
      </div>
      <div class="form-group">
        <label>Périodicité des tours (jours)</label>
        <input type="number" id="f-periodicite" min="1" value="${p.periodiciteJours}">
      </div>
      <button class="btn btn-primary" onclick="saveParams()">Enregistrer les paramètres</button>
    </div>

    <div class="card">
      <div class="card-title">Identifiants administrateur</div>
      <div class="detail-row">
        <span class="label">Identifiant mère</span>
        <span class="value">${d.admin.id}</span>
      </div>
      <div class="detail-row">
        <span class="label">Mot de passe</span>
        <span class="value">••••••••</span>
      </div>
      <p style="font-size:0.8rem;color:var(--text-secondary);margin-top:8px">
        Les matricules des chefs et participants sont générés automatiquement à partir de l'identifiant mère.
      </p>
    </div>

    <div class="card">
      <div class="card-title">Logique métier rappel</div>
      <ul style="font-size:0.9rem;padding-left:18px;line-height:1.6;color:var(--text-secondary)">
        <li>Tontine de tour de ramassage par rotation</li>
        <li>Celui qui ramasse cotise aussi le jour de son tour</li>
        <li>Chef d'équipe collecte les parts de ses participants + les siennes</li>
        <li>Les premières tontines sont ramassées par vente aux enchères</li>
        <li>Une part peut être cotisée par au plus 3 personnes</li>
      </ul>
    </div>
  `;
}

function saveParams() {
  updateParams({
    partsParTour: formInt('f-parts-tour'),
    montantPart: formNum('f-montant-part'),
    partsEncheres: formInt('f-parts-enchere'),
    coutVenteEnchere: formNum('f-cout-enchere'),
    periodiciteJours: formInt('f-periodicite')
  });
  toast('Paramètres enregistrés', 'success');
  navigate('tours');
}

// ========== HISTORIQUE ==========
function renderHistorique(container) {
  const txs = getTransactions(150);
  container.innerHTML = `
    <h2 class="page-title">Historique / Traçabilité</h2>
    <div class="card">
      <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px">
        Toutes les opérations sont journalisées automatiquement.
      </p>
      ${txs.map(tx => `
        <div class="list-item">
          <div class="info">
            <div class="name">${escapeHtml(tx.description)}</div>
            <div class="meta">${formatDateTime(tx.date)} · ID #${tx.id}</div>
          </div>
          <span class="badge badge-primary">${tx.type}</span>
        </div>
      `).join('') || '<div class="empty-state">Aucune transaction</div>'}
    </div>
  `;
}

// ========== EXPORT / ARCHIVES ==========
function renderExport(container) {
  container.innerHTML = `
    <h2 class="page-title">Export / Archives</h2>
    <div class="card">
      <div class="card-title" style="margin-bottom:12px">Sauvegarde locale</div>
      <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:14px">
        Exportez une copie complète des données (JSON) pour archivage.
        Vous pouvez ensuite déposer ce fichier sur Google Drive, OneDrive, etc.
      </p>
      <button class="btn btn-primary" onclick="doExport()">📥 Télécharger archive JSON</button>
      <button class="btn btn-outline" style="margin-left:8px" onclick="doExportCSV()">📥 Export CSV (transactions)</button>
    </div>
    <div class="card">
      <div class="card-title" style="margin-bottom:12px">Restauration</div>
      <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:10px">
        Importez un fichier JSON précédemment exporté pour restaurer les données.
      </p>
      <input type="file" id="import-file" accept=".json" style="margin-bottom:10px">
      <button class="btn btn-orange" onclick="doImport()">Restaurer</button>
    </div>
    <div class="card">
      <div class="card-title" style="margin-bottom:12px">Google Drive</div>
      <p style="font-size:0.9rem;color:var(--text-secondary)">
        Pour une synchronisation automatique avec Google Drive, hébergez cette application
        sur un serveur avec authentification Google (OAuth2) et l'API Drive.
        En attendant, utilisez l'export JSON + dépôt manuel sur Drive.
      </p>
    </div>
    <div class="card" style="border:1px solid var(--danger)">
      <div class="card-title" style="color:var(--danger)">Zone dangereuse</div>
      <p style="font-size:0.9rem;margin:10px 0">Réinitialiser toutes les données de l'application.</p>
      <button class="btn btn-danger" onclick="doReset()">Réinitialiser</button>
    </div>
  `;
}

function doExport() {
  const json = exportData();
  const name = `tomobile_opf_archive_${new Date().toISOString().slice(0,10)}.json`;
  downloadFile(name, json);
  toast('Archive téléchargée', 'success');
  logTransaction('EXPORT', 'Export archive JSON');
}

function doExportCSV() {
  const txs = getTransactions(500);
  let csv = 'ID;Date;Type;Description\n';
  txs.forEach(tx => {
    csv += `${tx.id};${tx.date};${tx.type};"${(tx.description || '').replace(/"/g, '""')}"\n`;
  });
  downloadFile(`tomobile_transactions_${new Date().toISOString().slice(0,10)}.csv`, csv, 'text/csv');
  toast('CSV téléchargé', 'success');
}

function doImport() {
  const file = $('#import-file').files[0];
  if (!file) {
    toast('Choisissez un fichier', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    if (importData(e.target.result)) {
      toast('Données restaurées', 'success');
      navigate('dashboard');
    } else {
      toast('Fichier invalide', 'error');
    }
  };
  reader.readAsText(file);
}

function doReset() {
  if (confirmAction('VRAIMENT tout effacer ? Cette action est irréversible.')) {
    if (confirmAction('Dernière confirmation : toutes les données seront perdues.')) {
      resetAll();
      toast('Données réinitialisées', 'success');
      navigate('dashboard');
    }
  }
}

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
