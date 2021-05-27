// jshint esversion:8
// native dependancies
const path = require('path');

// npm dependencies
const sqlite3 = require('sqlite3').verbose();

const AnkiDB = path.resolve(process.env.APPDATA, 'Anki2/David/collection.anki2');

// model types
const MODEL_STD = 0;
const MODEL_CLOZE = 1;

function GetAnkiDb() {
  return new Promise((resolve, reject) => {
    var Db = new sqlite3.Database(AnkiDB, sqlite3.OPEN_READONLY, err => {
      if (err) reject(err);
      else resolve(Db);
    });
  });
}

async function GetModels(manager) {
  const row = await manager.getRow('SELECT models FROM col');
  const models = JSON.parse(row.models);

  return models;
}

class AnkiDbManager {
  constructor() {
    this.db = GetAnkiDb();
    this.models = GetModels(this);
    this.cache = {
      notes: {},
      cards: {},
    };
  }

  async getCard(cid) {
    if (this.cache.cards.hasOwnProperty(cid))
      return this.cache.cards[cid];
    const card = await this.getRow('SELECT * FROM cards WHERE id=?', cid);

    this.cache.cards[cid] = card;
    return card;
  }

  async getCardName(cid) {
    const nid = await this.getCardNote(cid);
    const mid = await this.getNoteModel(nid);
    const model = await this.getModel(mid);
    const pos = (await this.getCard(cid)).ord;
    const typ = await this.getModelType(mid);

    return (typ === MODEL_STD && model.tmpls[pos].name) || model.tmpls[0].name;
  }

  async getCardNote(cid) {
    const card = await this.getCard(cid);

    return card.nid;
  }

  async getCardOrd(cid) {
    const card = await this.getCard(cid);

    return card.ord;
  }

  async getModel(mid) {
    const models = await this.models;
    const model = models[mid];

    return model;
  }

  async getModelName(mid) {
    return (await this.getModel(mid)).name;
  }

  async getModelType(mid) {
    const model = await this.getModel(mid);

    return model.type;
  }

  async getNote(nid) {
    if (this.cache.notes.hasOwnProperty(nid))
      return this.cache.notes[nid];
    const note = await this.getRow('SELECT * FROM notes WHERE id=?', nid);

    this.cache.notes[nid] = note;
    return note;
  }

  async getNoteFields(nid) {
    const note = await this.getNote(nid);
    const model = await this.getModel(note.mid);
    const fieldsValues = note.flds.split('\u001f');
    const fieldsNames = model.flds.map(fp => fp.name);
    const fields = {};

    for (let i = 0; i < fieldsNames.length; ++i)
      fields[fieldsNames[i]] = fieldsValues[i];

    return fields;
  }

  async getNoteModel(nid) {
    return (await this.getNote(nid)).mid;
  }

  async getNoteTags(nid) {
    const note = await this.getNote(nid);

    return note.tags;
  }

  getRow(sql, params) {
    return new Promise(async(resolve, reject) => {
      const db = await this.db;

      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

module.exports = new AnkiDbManager();
