const { has } = require('dot-prop');
const { matcher } = require('underscore');

class AnkiNote {
  constructor(dbManager, raw) {
    this.dbManager = dbManager;
    ['id', 'guid', 'mid', 'mod', 'usn', 'tags', 'flds', 'sfld', 'csum', 'flags', 'data']
      .forEach(field => { this[field] = raw[field]; });
  }

  async getFields() {
    if (has(this, 'fields')) return this.fields;
    const notetype = await this.getNotetype();
    const fields = await notetype.getFields();
    const flds = this.flds.split('\u001f');

    this.fields = [];
    await Promise.all(fields.map(async field => {
      const [name, ord] = await Promise.all([field.getName(), field.getOrd()]);
      const value = flds[ord];

      this.fields[ord] = { field, name, value };
    }));
    return this.fields;
  }

  async getFieldsJSON() {
    if (has(this, 'fieldsJSON')) return this.fieldsJSON;
    const fields = await this.getFields();

    this.fieldsJSON = {};
    fields.forEach(({ name, value }) => { this.fieldsJSON[name] = value; });
    return this.fieldsJSON;
  }

  getId() {
    return Promise.resolve(this.id);
  }

  async getNotetype() {
    return await this.dbManager.getNotetype(this.mid);
  }

  getNtid() {
    return Promise.resolve(this.mid);
  }

  getTags() {
    return Promise.resolve(this.tags);
  }

  async getTemplate(options) {
    const templates = await this.getTemplates();
    return templates.find(matcher(options));
  }

  async getTemplates() {
    if (has(this, 'templates')) return this.templates;
    const ntid = await this.getNtid();

    this.templates = this.dbManager.getTemplates({ ntid });
    return this.templates;
  }
}
AnkiNote.table = 'notes';
module.exports = AnkiNote;
