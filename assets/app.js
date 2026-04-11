// ── Theme toggle ─────────────────────────────────────────────
(function () {
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored ?? (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('theme-toggle');

  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  const achieved = QUESTS.filter(q => q.status === 'achieved');
  const ongoing  = QUESTS.filter(q => q.status === 'ongoing');

  document.getElementById('stat-achieved').textContent = achieved.length;
  document.getElementById('stat-ongoing').textContent  = ongoing.length;
  document.getElementById('achieved-count').textContent = achieved.length;
  document.getElementById('ongoing-count').textContent  = ongoing.length;

  const achievedList = document.getElementById('achieved-list');
  const ongoingList  = document.getElementById('ongoing-list');

  achieved.forEach(quest => achievedList.appendChild(createQuestRow(quest)));
  ongoing.forEach(quest  => ongoingList.appendChild(createQuestRow(quest)));
});

function createQuestRow(quest) {
  const row = document.createElement('div');
  row.className = `quest-row quest-row--${quest.status}`;

  const scopePlatform = quest.platform
    ? `${quest.scope} — ${quest.platform}`
    : quest.scope;

  const noteHtml = quest.note
    ? `<span class="quest-note">${quest.note}</span>`
    : '';

  const linkHtml = quest.link
    ? `<a class="quest-link" href="${quest.link}" target="_blank" rel="noopener">link</a>`
    : '';

  row.innerHTML = `
    <div class="quest-indicator">
      <span class="status-dot status-dot--${quest.status}"></span>
    </div>
    <div class="quest-category">${quest.category}</div>
    <div class="quest-body">
      <span class="quest-name">${quest.name}</span>
      <span class="quest-scope">${scopePlatform}</span>
      ${noteHtml}
    </div>
    <div class="quest-rank-col">
      <span class="rank-label rank-label--${quest.status}">${quest.rank}</span>
      ${linkHtml}
    </div>
  `;

  return row;
}
