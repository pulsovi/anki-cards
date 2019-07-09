// jshint esversion:8
// native dependancies
const path = require('path');
// npm dependencies
const sqlite3 = require('sqlite3').verbose();

const AnkiDB = path.resolve(process.env.APPDATA, 'Anki2/David/collection.anki2');

function GetAnkiDb() {
  return new Promise((resolve, reject) => {
    var Db = new sqlite3.Database(AnkiDB, sqlite3.OPEN_READONLY, (err) => {
      if (err) reject(err);
      else resolve(Db);
    });
  });
}

async function GetModels(manager) {
  var row = await manager.getRow('SELECT models FROM col');
  var models = JSON.parse(row.models);
  return models;
}

class AnkiDbManager {
  constructor() {
    this.db = GetAnkiDb();
    this.models = GetModels(this);
    this.cache = {
      notes: {},
      cards: {}
    };
  }

  async getCard(cid) {
    if (this.cache.cards.hasOwnProperty(cid))
      return this.cache.cards[cid];
    var card = await this.getRow('SELECT * FROM cards WHERE id=?', cid);
    this.cache.cards[cid] = card;
    return card;

  }

  async getCardName(cid) {
    var nid = await this.getCardNote(cid);
    var mid = await this.getNoteModel(nid);
    var model = await this.getModel(mid);
    var pos = (await this.getCard(cid)).ord;
    return model.tmpls[pos].name;
  }

  async getCardNote(cid) {
    var card = await this.getCard(cid);
    return card.nid;
  }

  async getModel(mid) {
    var models = await this.models;
    var model = models[mid];
    return model;
  }

  async getModelName(mid) {
    return (await this.getModel(mid)).name;
  }

  async getNote(nid) {
    if (this.cache.notes.hasOwnProperty(nid))
      return this.cache.notes[nid];
    var note = await this.getRow('SELECT * FROM notes WHERE id=?', nid);
    this.cache.notes[nid] = note;
    return note;
  }

  async getNoteFields(nid) {
    var note = await this.getNote(nid);
    var model = await this.getModel(note.mid);
    var fieldsValues = note.flds.split('\u001f');
    var fieldsNames = model.flds.map(fp => fp.name);
    var fields = {};
    for (let i = 0; i < fieldsNames.length; ++i) {
      fields[fieldsNames[i]] = fieldsValues[i];
    }
    return fields;
  }

  async getNoteModel(nid){
    return (await this.getNote(nid)).mid;
  }

  async getNoteTags(nid){
    var note = await this.getNote(nid);
    return note.tags;
  }

  getRow(sql, params) {
    return new Promise(async (resolve, reject) => {
      var db = await this.db;
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

module.exports = new AnkiDbManager();
