/* eslint-disable sort-keys, no-sync */
const fs = require('fs');
const path = require('path');

const { 'anki-profile': ankiProfile } = require('../config/global');

module.exports = [
  {
    name: '_css.js',
    pug: {
      file: path.join(__dirname, '_css.js'),
      path: path.join(__dirname, '_css.js'),
      get content() { return fs.readFileSync(this.path, 'utf8'); },
    },
    anki: {
      path: path.join(process.env.APPDATA, 'Anki2', ankiProfile, 'collection.media/_css.js'),
      get content() { return fs.readFileSync(this.path, 'utf8'); },
    },
  },
  {
    name: '_logos.js',
    pug: {
      path: path.join(__dirname, '_logos.js'),
      file: path.join(__dirname, '_logos.js'),
      get content() { return fs.readFileSync(this.path, 'utf8'); },
    },
    anki: {
      path: path.join(process.env.APPDATA, 'Anki2', ankiProfile, 'collection.media/_logos.js'),
      get content() { return fs.readFileSync(this.path, 'utf8'); },
    },
  },
];
