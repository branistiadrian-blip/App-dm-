// Strat simplu de stocare locală. Fiecare modul citește/scrie o "colecție"
// (un array de obiecte) sub o cheie proprie. Mai târziu, aceste funcții
// pot fi înlocuite cu apeluri Firebase Firestore fără să schimbi codul UI.

const Storage = {
  _key(collection) {
    return `dmtoolkit:${collection}`;
  },

  getAll(collection) {
    try {
      const raw = localStorage.getItem(this._key(collection));
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Storage.getAll error', collection, e);
      return [];
    }
  },

  saveAll(collection, items) {
    try {
      localStorage.setItem(this._key(collection), JSON.stringify(items));
      return true;
    } catch (e) {
      console.error('Storage.saveAll error', collection, e);
      return false;
    }
  },

  upsert(collection, item) {
    const items = this.getAll(collection);
    if (!item.id) item.id = crypto.randomUUID();
    const idx = items.findIndex(i => i.id === item.id);
    if (idx >= 0) items[idx] = item;
    else items.push(item);
    this.saveAll(collection, items);
    return item;
  },

  remove(collection, id) {
    const items = this.getAll(collection).filter(i => i.id !== id);
    this.saveAll(collection, items);
  },

  get(collection, id) {
    return this.getAll(collection).find(i => i.id === id) || null;
  }
};
