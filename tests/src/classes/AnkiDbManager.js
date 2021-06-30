const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const log = require('debug')('anki-db-manager');
const { get, has, set } = require('dot-prop');
const sqlite3 = require('sqlite3').verbose();
const tmp = require('tmp');

const Card = require('./AnkiCard');
const Field = require('./AnkiField');
const Note = require('./AnkiNote');
const Notetype = require('./AnkiNotetype');
const Template = require('./AnkiTemplate');

const AnkiDB = path.resolve(process.env.APPDATA, 'Anki2/David/collection.anki2');

log('structures are designed in AnkiSources\\rslib\\backend.proto');

class AnkiDbManager {
  constructor(db) {
    this.db = db || getAnkiDb();
    this.cache = {};
  }

  async getAll({ Model, where }) {
    const db = await this.db;
    const whereEntries = Object.entries(where);
    const whereString = whereEntries.map(([key]) => `${key}=?`).join(' AND ');
    const params = whereEntries.map(([, value]) => value);
    const sql = `SELECT * FROM ${Model.table} WHERE ${whereString};`;

    log(sql, params);
    return promisify(db.all.bind(db))(sql, ...params)
      .then(list => {
        list.forEach(item => {
          if (has(item, 'id')) set(this.cache, `${Model.table}.${item.id}`, item);
        });
        return list.map(item => new Model(this, item));
      });
  }

  async getCard(cid) {
    return await this.getRowCached({ Model: Card, id: cid });
  }

  async getFields(where) {
    return await this.getAll({ Model: Field, where });
  }

  async getNote(nid) {
    return await this.getRowCached({ Model: Note, id: nid });
  }

  async getNotetype(ntid) {
    return await this.getRowCached({ Model: Notetype, id: ntid });
  }

  async getTemplates(where) {
    return await this.getAll({ Model: Template, where });
  }

  async getRow({ id, table }) {
    const db = await this.db;
    const sql = `SELECT * FROM ${table} WHERE id=?;`;
    return promisify(db.get.bind(db))(sql, id);
  }

  async getRowCached({ Model, id }) {
    if (has(this.cache, `${Model.table}.${id}`))
      return get(this.cache, `${Model.table}.${id}`);

    const rawModel = await this.getRow({ id, table: Model.table });
    const model = new Model(this, rawModel);

    set(this.cache, `${Model.table}.${id}`, model);
    return model;
  }
}

async function getAnkiDb(tmpFile) {
  return await getDb(tmpFile || AnkiDB).then(testDb).then(db => {
    log('Anki database loaded from', tmpFile || AnkiDB);
    return db;
  }).catch(err => {
    if (err.code === 'SQLITE_BUSY' && !tmpFile) {
      log('Mirroring Anki DB ...');
      return mirrorFile(AnkiDB).then(getAnkiDb);
    }
    log('error on getting AnkiDB from', tmpFile || AnkiDB);
    throw err;
  });
}

async function mirrorFile(src) {
  const dest = await promisify(tmp.file)();

  await fs.promises.copyFile(src, dest);
  return dest;
}

function getDb(file) {
  return new Promise((resolve, reject) => {
    const DB = new sqlite3.Database(file, sqlite3.OPEN_READONLY, err => {
      if (err) reject(err);
      else resolve(DB);
    });
  });
}

function testDb(DB) {
  const req = "SELECT name FROM sqlite_master WHERE type ='table' AND name NOT LIKE 'sqlite_%';";
  return promisify(DB.all.bind(DB))(req).then(() => DB);
}

// Pattern Singleton
module.exports = new AnkiDbManager();
