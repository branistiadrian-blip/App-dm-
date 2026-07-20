const CharactersView = {
  collection: 'characters',

  render(root) {
    const chars = Storage.getAll(this.collection);
    root.innerHTML = `
      <div class="view-header">
        <h2 class="view-title">Fișe de personaj</h2>
      </div>
      <div id="char-list"></div>
      <button class="fab" id="char-add" aria-label="Adaugă personaj">+</button>
    `;
    const list = root.querySelector('#char-list');

    if (chars.length === 0) {
      list.innerHTML = `
        <div class="view-empty">
          <div class="view-empty-glyph">✦</div>
          <p>Niciun personaj încă.</p>
          <p>Apasă + ca să adaugi primul aventurier.</p>
        </div>`;
    } else {
      list.innerHTML = chars.map(c => this.cardHTML(c)).join('');
      list.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.hp-btn')) return;
          this.openEditor(root, card.dataset.id);
        });
      });
      list.querySelectorAll('.hp-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.closest('.card').dataset.id;
          const delta = parseInt(btn.dataset.delta, 10);
          this.adjustHp(id, delta);
          this.render(root);
        });
      });
    }

    root.querySelector('#char-add').addEventListener('click', () => this.openEditor(root, null));
  },

  cardHTML(c) {
    const pct = c.hpMax > 0 ? Math.max(0, Math.min(1, c.hp / c.hpMax)) : 0;
    const ringClass = pct <= 0.25 ? 'crit' : pct <= 0.5 ? 'low' : '';
    const circumference = 2 * Math.PI * 22;
    const offset = circumference * (1 - pct);
    return `
      <div class="card" data-id="${c.id}">
        <div class="card-title-row">
          <div style="display:flex; align-items:center; gap:12px; flex:1; min-width:0;">
            <div class="hp-ring ${ringClass}">
              <svg viewBox="0 0 54 54">
                <circle class="track" cx="27" cy="27" r="22"></circle>
                <circle class="fill" cx="27" cy="27" r="22"
                  stroke-dasharray="${circumference}"
                  stroke-dashoffset="${offset}"></circle>
              </svg>
              <div class="hp-ring-label">${c.hp}</div>
            </div>
            <div style="min-width:0;">
              <div class="card-name">${esc(c.name || 'Fără nume')}</div>
              <div class="card-sub">${esc(c.className || '')} ${c.level ? '· Nv ' + c.level : ''}</div>
            </div>
          </div>
          <div class="combatant-hp-row">
            <button class="hp-btn" data-delta="-1">−</button>
            <span class="hp-text">${c.hp}/${c.hpMax}</span>
            <button class="hp-btn" data-delta="1">+</button>
          </div>
        </div>
        <div class="stat-grid">
          <div class="stat-badge"><div class="label">AC</div><div class="value">${c.ac ?? '–'}</div></div>
          <div class="stat-badge"><div class="label">Viteză</div><div class="value">${c.speed ?? '–'}</div></div>
          <div class="stat-badge"><div class="label">Salv.</div><div class="value">${c.savingThrow ?? '–'}</div></div>
        </div>
      </div>`;
  },

  adjustHp(id, delta) {
    const c = Storage.get(this.collection, id);
    if (!c) return;
    c.hp = Math.max(0, Math.min(c.hpMax, (c.hp || 0) + delta));
    Storage.upsert(this.collection, c);
  },

  openEditor(root, id) {
    const existing = id ? Storage.get(this.collection, id) : null;
    const c = existing || { name: '', className: '', level: 1, hp: 10, hpMax: 10, ac: 10, speed: 30, savingThrow: '', inventory: '' };

    openSheet(`
      <h3 class="sheet-title">${existing ? 'Editează personaj' : 'Personaj nou'}</h3>
      <div class="field"><label>Nume</label><input id="f-name" value="${esc(c.name)}" placeholder="Ex: Kaelen Vânt-de-Fier"></div>
      <div class="field-row">
        <div class="field"><label>Clasă / rasă</label><input id="f-class" value="${esc(c.className)}" placeholder="Ex: Ranger elf"></div>
        <div class="field"><label>Nivel</label><input id="f-level" type="number" value="${c.level}"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>HP curent</label><input id="f-hp" type="number" value="${c.hp}"></div>
        <div class="field"><label>HP maxim</label><input id="f-hpmax" type="number" value="${c.hpMax}"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>AC</label><input id="f-ac" type="number" value="${c.ac}"></div>
        <div class="field"><label>Viteză</label><input id="f-speed" type="number" value="${c.speed}"></div>
        <div class="field"><label>Salvare</label><input id="f-save" value="${esc(c.savingThrow)}" placeholder="+5 Înțel."></div>
      </div>
      <div class="field"><label>Inventar / note</label><textarea id="f-inv" placeholder="Arme, obiecte magice, monede...">${esc(c.inventory)}</textarea></div>
      <div class="sheet-actions">
        ${existing ? '<button class="btn btn-danger" id="f-delete">Șterge</button>' : ''}
        <button class="btn btn-brass" id="f-save-btn">Salvează</button>
      </div>
    `, (sheetEl) => {
      sheetEl.querySelector('#f-save-btn').addEventListener('click', () => {
        const updated = {
          id: c.id,
          name: sheetEl.querySelector('#f-name').value.trim(),
          className: sheetEl.querySelector('#f-class').value.trim(),
          level: parseInt(sheetEl.querySelector('#f-level').value, 10) || 1,
          hp: parseInt(sheetEl.querySelector('#f-hp').value, 10) || 0,
          hpMax: parseInt(sheetEl.querySelector('#f-hpmax').value, 10) || 1,
          ac: parseInt(sheetEl.querySelector('#f-ac').value, 10) || 10,
          speed: parseInt(sheetEl.querySelector('#f-speed').value, 10) || 30,
          savingThrow: sheetEl.querySelector('#f-save').value.trim(),
          inventory: sheetEl.querySelector('#f-inv').value.trim(),
        };
        Storage.upsert(this.collection, updated);
        closeSheet();
        this.render(root);
      });
      if (existing) {
        sheetEl.querySelector('#f-delete').addEventListener('click', () => {
          Storage.remove(this.collection, c.id);
          closeSheet();
          this.render(root);
        });
      }
    });
  }
};
