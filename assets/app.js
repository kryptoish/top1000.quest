document.addEventListener('DOMContentLoaded', () => {

  // ── Theme toggle ──────────────────────────────────────────────
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // ── Populate stats ────────────────────────────────────────────
  const achieved = QUESTS.filter(q => q.status === 'achieved');
  const ongoing  = QUESTS.filter(q => q.status === 'ongoing');

  document.getElementById('stat-achieved').textContent  = achieved.length;
  document.getElementById('stat-ongoing').textContent   = ongoing.length;
  document.getElementById('achieved-count').textContent = achieved.length;
  document.getElementById('ongoing-count').textContent  = ongoing.length;

  // ── Render rows with stagger ──────────────────────────────────
  let rowIndex = 0;
  const achievedList = document.getElementById('achieved-list');
  const ongoingList  = document.getElementById('ongoing-list');

  achieved.forEach(q => {
    const row = createQuestRow(q);
    row.style.setProperty('--ri', rowIndex++);
    achievedList.appendChild(row);
  });

  ongoing.forEach(q => {
    const row = createQuestRow(q);
    row.style.setProperty('--ri', rowIndex++);
    ongoingList.appendChild(row);
  });

  // ── Modal event wiring ────────────────────────────────────────
  const modal = document.getElementById('quest-modal');

  document.getElementById('modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const lb = document.getElementById('lightbox');
    if (lb.classList.contains('is-open')) { closeLightbox(); return; }
    if (modal.classList.contains('is-open')) closeModal();
  });

  // ── Lightbox event wiring ─────────────────────────────────────
  document.getElementById('lightbox').addEventListener('click', closeLightbox);
});

// ─────────────────────────────────────────────────────────────────
// Quest Row
// ─────────────────────────────────────────────────────────────────
function createQuestRow(quest) {
  const row = document.createElement('div');
  row.className = `quest-row quest-row--${quest.status}`;
  if (quest.images?.length) row.classList.add('has-images');
  row.setAttribute('role', 'button');
  row.setAttribute('tabindex', '0');
  row.setAttribute('aria-label', `View details for ${quest.name}`);

  const scopeText = quest.platform ? `${quest.scope} — ${quest.platform}` : quest.scope;

  const proofDot = quest.images?.length
    ? `<span class="proof-dot" title="${quest.images.length} proof image${quest.images.length !== 1 ? 's' : ''}"></span>`
    : '';

  row.innerHTML = `
    <div class="quest-indicator">
      <span class="status-dot status-dot--${quest.status}"></span>
    </div>
    <div class="quest-category">${quest.category}</div>
    <div class="quest-body">
      <span class="quest-name">${quest.name}</span>
      <span class="quest-scope">${scopeText}</span>
      ${quest.note ? `<span class="quest-note">${quest.note}</span>` : ''}
    </div>
    <div class="quest-rank-col">
      <span class="rank-label rank-label--${quest.status}">${quest.rank}</span>
      ${quest.link ? `<a class="quest-link" href="${quest.link}" target="_blank" rel="noopener">link ↗</a>` : ''}
      ${proofDot}
      <span class="quest-expand-icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square">
          <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M16 21h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
        </svg>
      </span>
    </div>
  `;

  row.addEventListener('click', e => {
    if (e.target.closest('a')) return;
    openModal(quest);
  });

  row.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(quest); }
  });

  return row;
}

// ─────────────────────────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────────────────────────
function openModal(quest) {
  renderModalContent(quest);
  const modal = document.getElementById('quest-modal');
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('modal-close')?.focus(), 80);
}

function closeModal() {
  const modal = document.getElementById('quest-modal');
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function renderModalContent(quest) {
  const scope = quest.platform ? `${quest.scope} — ${quest.platform}` : quest.scope;
  const statusLabel = quest.status === 'achieved' ? 'Achieved' : 'In Progress';
  const hasImages = quest.images?.length > 0;

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-header">
      <div class="modal-meta">
        <span class="modal-category-tag">${quest.category}</span>
        <span class="modal-status-tag modal-status-tag--${quest.status}">${statusLabel}</span>
      </div>
      <h2 class="modal-title">${quest.name}</h2>
      <p class="modal-scope">${scope}</p>
    </div>
    <div class="modal-body">
      <span class="rank-label rank-label--${quest.status} modal-rank">${quest.rank}</span>
      ${quest.details ? `<p class="modal-details">${quest.details}</p>` : ''}
      ${quest.note    ? `<p class="modal-note">${quest.note}</p>` : ''}
      ${quest.link    ? `<a class="modal-link" href="${quest.link}" target="_blank" rel="noopener">View leaderboard ↗</a>` : ''}
      ${hasImages ? `
        <div class="modal-proof">
          <div class="modal-proof-label">Proof</div>
          <div class="modal-image-grid">
            ${quest.images.map((src, i) => `
              <img class="modal-img" src="${src}"
                   alt="Proof ${i + 1} — ${quest.name}"
                   loading="lazy" data-src="${src}">
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  document.querySelectorAll('.modal-img').forEach(img => {
    img.addEventListener('click', () => openLightbox(img.dataset.src, img.alt));
  });
}

// ─────────────────────────────────────────────────────────────────
// Lightbox
// ─────────────────────────────────────────────────────────────────
function openLightbox(src, alt) {
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  img.src = src;
  img.alt = alt || '';
  lb.classList.add('is-open');
  lb.setAttribute('aria-hidden', 'false');
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.classList.remove('is-open');
  lb.setAttribute('aria-hidden', 'true');
}
