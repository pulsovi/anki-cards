class AnkiTemplate {
  constructor(dbManager, raw) {
    this.dbManager = dbManager;
    ['ntid', 'ord', 'name', 'mtime_secs', 'usn', 'config']
      .forEach(key => { this[key] = raw[key]; });
  }

  getName() {
    return Promise.resolve(this.name);
  }
}
AnkiTemplate.table = 'templates';

module.exports = AnkiTemplate;
