class AnkiField {
  constructor(dbManager, raw) {
    this.dbManager = dbManager;
    ['ntid', 'ord', 'name', 'config']
      .forEach(key => { this[key] = raw[key]; });
  }

  getName() {
    return Promise.resolve(this.name);
  }

  getOrd() {
    return Promise.resolve(this.ord);
  }
}
AnkiField.table = 'FIELDS';

module.exports = AnkiField;
