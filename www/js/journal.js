const JournalView = {
  collection: 'journal',

  render(root) {
    const entries = Storage.getAll(this.collection).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    root.innerHTML = `
      <div class="view-header">
        <h2 class="view-title">Jurnal de campanie</h2>
      </div>
      <div id="j-list"></div>
      <button class="fab" id="j-add" aria-label="Notiță nouă">+</button>
    `;
    const list = root.querySelector('#j-list');

    if (entries.length === 0) {
      list.innerHTML = `
        <div class="view-empty">
          <div class="view-empty-glyph">✒</div>
          <p>Niciun jurnal de sesiune încă.</p>
          <p>Notează ce s-a întâmplat la ultima ta sesiune.</p>
        </div>`;
    } else {
      list.innerHTML = entries.map(e => `
        <div class="journal-entry" data-id="${e.id}">
          <div class="journal-date">${esc(e.date || '')}${e.session ? ' · Sesiunea ' + esc(e.session) : ''}</div>
          <div class="journal-title">${esc(e.title || 'Fără titlu')}</div>
          <div class="journal-text">${esc(e.text || '')}</div>
        </div>
      `).join('');
      list.querySelectorAll('.journal-entry').forEach(el => {
        el.addEventListener('click', () => this.openEditor(root, el.dataset.id));
      });
    }

    root.querySelector('#j-add').addEventListener('click', () => this.openEditor(root, null));
  },

  openEditor(root, id) {
    const existing = id ? Storage.get(this.collection, id) : null;
    const today = new Date().toISOString().slice(0, 10);
    const e = existing || { date: today, session: '', title: '', text: '' };

    openSheet(`
      <h3 class="sheet-title">${existing ? 'Editează notița' : 'Notiță nouă'}</h3>
      <div class="field-row">
        <div class="field"><label>Data</label><input id="f-date" type="date" value="${e.date}"></div>
        <div class="field"><label>Sesiunea nr.</label><input id="f-session" type="number" value="${esc(e.session)}"></div>
      </div>
      <div class="field"><label>Titlu</label><input id="f-title" value="${esc(e.title)}" placeholder="Ex: Căderea Turnului Cenușiu"></div>
      <div class="field"><label>Ce s-a întâmplat</label><textarea id="f-text" placeholder="Rezumatul sesiunii...">${esc(e.text)}</textarea></div>
      <div class="sheet-actions">
        ${existing ? '<button class="btn btn-danger" id="f-delete">Șterge</button>' : ''}
        <button class="btn btn-brass" id="f-save-btn">Salvează</button>
      </div>
    `, (sheetEl) => {
      sheetEl.querySelector('#f-save-btn').addEventListener('click', () => {
        const updated = {
          id: e.id,
          date: sheetEl.querySelector('#f-date').value,
          session: sheetEl.querySelector('#f-session').value.trim(),
          title: sheetEl.querySelector('#f-title').value.trim(),
          text: sheetEl.querySelector('#f-text').value.trim(),
        };
        Storage.upsert(this.collection, updated);
        closeSheet();
        this.render(root);
      });
      if (existing) {
        sheetEl.querySelector('#f-delete').addEventListener('click', () => {
          Storage.remove(this.collection, e.id);
          closeSheet();
          this.render(root);
        });
      }
    });
  }
};
