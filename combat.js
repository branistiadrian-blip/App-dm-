const CombatView = {
  collection: 'combat_encounter', // single ongoing encounter, stored as one object

  load() {
    const items = Storage.getAll(this.collection);
    return items[0] || { id: 'active', round: 1, turn: 0, combatants: [] };
  },

  save(state) {
    Storage.saveAll(this.collection, [state]);
  },

  render(root) {
    const state = this.load();
    root.innerHTML = `
      <div class="view-header">
        <h2 class="view-title">Tracker de luptă</h2>
      </div>
      <div class="round-badge">Runda ${state.round}</div>
      <div class="combat-controls">
        <button class="btn btn-brass" id="cb-next" style="flex:1; justify-content:center;">Tura următoare ⟶</button>
        <button class="btn btn-ghost btn-icon" id="cb-add" aria-label="Adaugă">+</button>
        <button class="btn btn-danger btn-icon" id="cb-reset" aria-label="Resetează">↺</button>
      </div>
      <div id="cb-list"></div>
    `;

    const list = root.querySelector('#cb-list');
    if (state.combatants.length === 0) {
      list.innerHTML = `
        <div class="view-empty">
          <div class="view-empty-glyph">⚔</div>
          <p>Nicio luptă activă.</p>
          <p>Adaugă jucători și monștri cu inițiativa lor.</p>
        </div>`;
    } else {
      const sorted = [...state.combatants].sort((a, b) => b.init - a.init);
      list.innerHTML = sorted.map((c, i) => this.rowHTML(c, i === state.turn)).join('');

      list.querySelectorAll('.hp-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.closest('.combatant').dataset.id;
          const delta = parseInt(btn.dataset.delta, 10);
          const target = state.combatants.find(c => c.id === id);
          if (target) target.hp = Math.max(0, Math.min(target.hpMax, target.hp + delta));
          this.save(state);
          this.render(root);
        });
      });
      list.querySelectorAll('.combatant').forEach(row => {
        row.addEventListener('click', (e) => {
          if (e.target.closest('.hp-btn')) return;
          const id = row.dataset.id;
          state.combatants = state.combatants.filter(c => c.id !== id);
          this.save(state);
          this.render(root);
        });
      });
    }

    root.querySelector('#cb-next').addEventListener('click', () => {
      if (state.combatants.length === 0) return;
      state.turn++;
      if (state.turn >= state.combatants.length) {
        state.turn = 0;
        state.round++;
      }
      this.save(state);
      this.render(root);
    });

    root.querySelector('#cb-add').addEventListener('click', () => this.openAdd(root, state));
    root.querySelector('#cb-reset').addEventListener('click', () => {
      if (!confirm('Ștergi toată lupta curentă?')) return;
      this.save({ id: 'active', round: 1, turn: 0, combatants: [] });
      this.render(root);
    });
  },

  rowHTML(c, isActive) {
    return `
      <div class="combatant ${isActive ? 'active' : ''}" data-id="${c.id}">
        <div class="combatant-init">${c.init}</div>
        <div class="combatant-body">
          <div class="combatant-name ${c.isFoe ? 'foe' : ''}">${esc(c.name)}</div>
          <div class="combatant-hp-row">
            <button class="hp-btn" data-delta="-1">−</button>
            <span class="hp-text">${c.hp}/${c.hpMax} HP</span>
            <button class="hp-btn" data-delta="1">+</button>
          </div>
        </div>
      </div>`;
  },

  openAdd(root, state) {
    openSheet(`
      <h3 class="sheet-title">Adaugă în luptă</h3>
      <div class="field"><label>Nume</label><input id="f-name" placeholder="Ex: Lup umbră"></div>
      <div class="field-row">
        <div class="field"><label>Inițiativă</label><input id="f-init" type="number" value="10"></div>
        <div class="field"><label>HP</label><input id="f-hp" type="number" value="10"></div>
      </div>
      <div class="field">
        <label>Tip</label>
        <select id="f-side">
          <option value="ally">Aliat / jucător</option>
          <option value="foe">Inamic</option>
        </select>
      </div>
      <div class="sheet-actions">
        <button class="btn btn-brass" id="f-save-btn">Adaugă</button>
      </div>
    `, (sheetEl) => {
      sheetEl.querySelector('#f-save-btn').addEventListener('click', () => {
        const name = sheetEl.querySelector('#f-name').value.trim();
        if (!name) return;
        const hp = parseInt(sheetEl.querySelector('#f-hp').value, 10) || 1;
        state.combatants.push({
          id: crypto.randomUUID(),
          name,
          init: parseInt(sheetEl.querySelector('#f-init').value, 10) || 0,
          hp, hpMax: hp,
          isFoe: sheetEl.querySelector('#f-side').value === 'foe',
        });
        this.save(state);
        closeSheet();
        this.render(root);
      });
    });
  }
};
