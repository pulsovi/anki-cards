const { has } = require('dot-prop');

class AnkiCard {
  constructor(dbManager, raw) {
    this.dbManager = dbManager;
    [
      'id',
      'nid',
      'did',
      'ord',
      'mod',
      'usn',
      'type',
      'queue',
      'due',
      'ivl',
      'factor',
      'reps',
      'lapses',
      'left',
      'odue',
      'odid',
      'flags',
      'data',
    ].forEach(field => { this[field] = raw[field]; });
  }

  async getName() {
    const template = await this.getTemplate();
    return await template.getName();
  }

  async getNote() {
    if (has(this, 'note')) return this.note;
    this.note = await this.dbManager.getNote(this.nid);
    return this.note;
  }

  getOrd() {
    return Promise.resolve(this.ord);
  }

  async getTemplate() {
    if (has(this, 'template')) return this.template;
    const [note, ord] = await Promise.all([this.getNote(), this.getOrd()]);

    this.template = await note.getTemplate({ ord });
    return this.template;
  }
}

AnkiCard.table = 'cards';

module.exports = AnkiCard;
