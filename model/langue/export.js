/* eslint-disable no-sync */
const fs = require('fs');
const path = require('path');

const pug = require('pug');

// eslint-disable-next-line no-process-env
const ROOT = process.env.ANKI_PUG_ROOT;

const pugFileDir = path.join(ROOT, 'var', path.relative(path.join(ROOT, 'model'), __dirname));

// eslint-disable-next-line import/no-dynamic-require
const FileManager = require(path.resolve(ROOT, 'src/diff/file_manager'));

const langTo = {
  'am': ['fr', 'he'],
  'en': ['fr'],
  'fr': ['am', 'en', 'he'],
  'he': ['am', 'fr'],
};

const langNames = {
  'am': 'Arameen',
  'en': 'Anglais',
  'fr': 'Francais',
  'he': 'Hebreu',
};

const dir = {
  'am': 'rtl',
  'en': 'ltr',
  'fr': 'ltr',
  'he': 'rtl',
};

const outputList = [];
const model = {
  'recto': pug.compileFile(path.resolve(__dirname, 'langue_recto.pug')),
  'verso': pug.compileFile(path.resolve(__dirname, 'langue_verso.pug')),
};

// eslint-disable-next-line no-extend-native
String.prototype.toCapitalisationCase = function toCapitalisationCase() {
  return this.charAt(0).toUpperCase() + this.substring(1);
};

Object.keys(langTo).forEach(from => {
  langTo[from].forEach(to => {
    Object.keys(model).forEach(face => {
      outputList.push({
        anki: {
          get content() { return FileManager.normalizeEnding(fs.readFileSync(this.path, 'utf8')); },
          file: path.resolve(__dirname, `out/${[from, to, face].join('_')}.html`),
          path: path.resolve(__dirname, `out/${[from, to, face].join('_')}.html`),
        },
        name: [from, to, face].join('_'),
        pug: {
          content: FileManager.normalizeEnding(model[face]({
            dirFrom: dir[from],
            dirTo: dir[to],
            from,
            fullFrom: langNames[from],
            fullTo: langNames[to],
            to,
          })),
          file: path.join(pugFileDir, `${[from, to, face].join('_')}.pug`),
          path: path.resolve(__dirname, `langue_${face}.pug`),
        },
      });
    });
  });
});

const css = path.resolve(__dirname, '../commons.css');

outputList.push({
  anki: {
    get content() { return FileManager.normalizeEnding(fs.readFileSync(this.path, 'utf8')); },
    file: path.resolve(__dirname, 'out/style.css'),
    path: path.resolve(__dirname, 'out/style.css'),
  },
  name: 'style',
  pug: {
    get content() { return FileManager.normalizeEnding(fs.readFileSync(this.path, 'utf8')); },
    file: css,
    path: css,
  },
});

module.exports = outputList;
