const { has } = require('dot-prop');
const debug = require('debug');

const log = debug('anki-notetype');

class AnkiNotetype {
  constructor(dbManager, raw) {
    this.dbManager = dbManager;
    ['id', 'name', 'mtime_secs', 'usn', 'config']
      .forEach(field => { this[field] = raw[field]; });
  }

  async getFields() {
    if (has(this, 'fields')) return this.fields;
    this.fields = await this.dbManager.getFields({ ntid: this.id });
    return this.fields;
  }

  async getFieldsJSON() {
    const fields = await this.getFields();
    const fieldsJSON = {};

    fields.forEach(field => { fieldsJSON[field.name] = field; });
    return fieldsJSON;
  }

  getName() {
    return Promise.resolve(this.name);
  }

  getType() {
    this.parseConfig();
    return Promise.resolve(this.type);
  }

  parseConfig() {
    this.type = AnkiNotetype.TYPE_STD;
    let leftBuffer = this.config;

    while (leftBuffer.length) leftBuffer = this.parseConfigField(leftBuffer);
  }

  parseConfigField(buf) {
    const [configField, ...workingBuffer] = buf;

    /* eslint-disable no-magic-numbers */
    switch (configField) {
    case 0x08:
      this.type = AnkiNotetype.TYPE_CLOZE;
      return workingBuffer;
    default:
      return buf.slice(0, 0);
    }
    /* eslint-enable no-magic-numbers */
  }
}
AnkiNotetype.table = 'notetypes';

AnkiNotetype.TYPE_STD = 0;
AnkiNotetype.TYPE_CLOZE = 1;

module.exports = AnkiNotetype;
