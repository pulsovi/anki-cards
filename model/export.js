// jshint esversion:6
const fs = require('fs');
const path = require('path');

module.exports = [
  {
    name: '_css.js',
    pug: {
      path: path.join(__dirname, '_css.js'),
      file: path.join(__dirname, '_css.js'),
      get content() { return fs.readFileSync(this.path, 'utf8'); },
    },
    anki: {
      path: path.join(process.env.APPDATA, 'Anki2/David/collection.media/_css.js'),
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
      path: path.join(process.env.APPDATA, 'Anki2/David/collection.media/_logos.js'),
      get content() { return fs.readFileSync(this.path, 'utf8'); },
    },
  },
];
