// Scapă text pentru inserare sigură în HTML.
function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// Deschide o "foaie" (bottom sheet) cu conținut HTML custom.
function openSheet(innerHTML, onMount) {
  const modalRoot = document.getElementById('modal-root');
  modalRoot.innerHTML = `
    <div class="sheet-backdrop" id="sheet-backdrop">
      <div class="sheet" id="sheet">${innerHTML}</div>
    </div>`;
  const backdrop = document.getElementById('sheet-backdrop');
  const sheet = document.getElementById('sheet');
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeSheet();
  });
  sheet.addEventListener('click', (e) => e.stopPropagation());
  if (onMount) onMount(sheet);
}

function closeSheet() {
  document.getElementById('modal-root').innerHTML = '';
}

// --- Router ---
const Views = {
  characters: CharactersView,
  combat: CombatView,
  journal: JournalView,
  world: WorldView,
};

let currentView = 'characters';

function renderView(name) {
  currentView = name;
  const root = document.getElementById('view-root');
  Views[name].render(root);

  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === name);
  });
}

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => renderView(tab.dataset.view));
});

// Pornire
renderView('characters');
