const WorldView = {
  collection: 'world_entries',

  render(root) {
    const entries = Storage.getAll(this.collection).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    root.innerHTML = `
      <div class="view-header">
        <h2 class="view-title">Lumea · Emarbiland</h2>
      </div>
      <div id="w-list"></div>
      <button class="fab" id="w-add" aria-label="Adaugă">+</button>
    `;
    const list = root.querySelector('#w-list');

    if (entries.length === 0) {
      list.innerHTML = `
        <div class="view-empty">
          <div class="view-empty-glyph">⛰</div>
          <p>Niciun NPC sau loc încă.</p>
          <p>Adaugă locuitori și locuri din Emarbiland.</p>
        </div>`;
    } else {
      list.innerHTML = entries.map(w => `
        <div class="card npc-card" data-id="${w.id}">
          <div style="flex:1; min-width:0;">
            <div class="card-name">${esc(w.name || 'Fără nume')}</div>
            <div class="card-sub">${esc(w.location || '')}</div>
            ${w.notes ? `<div class="journal-text" style="margin-top:6px;">${esc(w.notes)}</div>` : ''}
            <span class="npc-tag">${w.type === 'location' ? 'Locație' : 'NPC'}</span>
          </div>
        </div>
      `).join('');
      list.querySelectorAll('.card').forEach(el => {
        el.addEventListener('click', () => this.openEditor(root, el.dataset.id));
      });
    }

    root.querySelector('#w-add').addEventListener('click', () => this.openEditor(root, null));
  },

  openEditor(root, id) {
    const existing = id ? Storage.get(this.collection, id) : null;
    const w = existing || { type: 'npc', name: '', location: '', notes: '' };

    openSheet(`
      <h3 class="sheet-title">${existing ? 'Editează' : 'Adaugă în lume'}</h3>
      <div class="field">
        <label>Tip</label>
        <select id="f-type">
          <option value="npc" ${w.type === 'npc' ? 'selected' : ''}>NPC</option>
          <option value="location" ${w.type === 'location' ? 'selected' : ''}>Locație</option>
        </select>
      </div>
      <div class="field"><label>Nume</label><input id="f-name" value="${esc(w.name)}" placeholder="Ex: Vrăjitoarea din Mlaștina Neagră"></div>
      <div class="field"><label>Unde se află</label><input id="f-location" value="${esc(w.location)}" placeholder="Ex: Portul Ashvale"></div>
      <div class="field"><label>Note</label><textarea id="f-notes" placeholder="Aspect, motivații, secrete...">${esc(w.notes)}</textarea></div>
      <div class="sheet-actions">
        ${existing ? '<button class="btn btn-danger" id="f-delete">Șterge</button>' : ''}
        <button class="btn btn-brass" id="f-save-btn">Salvează</button>
      </div>
    `, (sheetEl) => {
      sheetEl.querySelector('#f-save-btn').addEventListener('click', () => {
        const updated = {
          id: w.id,
          type: sheetEl.querySelector('#f-type').value,
          name: sheetEl.querySelector('#f-name').value.trim(),
          location: sheetEl.querySelector('#f-location').value.trim(),
          notes: sheetEl.querySelector('#f-notes').value.trim(),
        };
        Storage.upsert(this.collection, updated);
        closeSheet();
        this.render(root);
      });
      if (existing) {
        sheetEl.querySelector('#f-delete').addEventListener('click', () => {
          Storage.remove(this.collection, w.id);
          closeSheet();
          this.render(root);
        });
      }
    });
  }
};
