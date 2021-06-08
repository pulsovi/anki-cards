class AnkiNote {
  constructor(dbManager, raw) {
    this.dbManager = dbManager;
    []
      .forEach(key => { this[key] = raw[key]; });
    console.log(Reflect.ownKeys(raw));
    throw new Error('to be Written');
  }
}
AnkiNote.table = 'notes';

module.exports = AnkiNote;
