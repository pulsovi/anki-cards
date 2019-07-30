//jshint esversion:6
const fs = require('fs');
const path = require('path');
const pug = require('pug');

const ROOT = process.env.ANKI_PUG_ROOT;
pugFileDir = path.join(ROOT, 'var', path.relative(path.join(ROOT, 'model'), __dirname));

const FileManager = require(path.resolve(ROOT, 'src/diff/file_manager'));

const langTo = {
  "am": ["fr", "he"],
  "en": ["fr"],
  "fr": ["am", "en", "he"],
  "he": ["am", "fr"],
};

const __ = {
  "am": "Arameen",
  "en": "Anglais",
  "fr": "Francais",
  "he": "Hebreu",
};

const dir = {
  "am": "rtl",
  "en": "ltr",
  "fr": "ltr",
  "he": "rtl",
};

const outputList = [];
const model = {
  "recto": pug.compileFile(path.resolve(__dirname, 'langue_recto.pug')),
  "verso": pug.compileFile(path.resolve(__dirname, 'langue_verso.pug')),
};

String.prototype.toCapitalisationCase = function toCapitalisationCase() {
  return this.charAt(0).toUpperCase() + this.substring(1);
};

Object.keys(langTo).forEach(function(from) {
  langTo[from].forEach(function(to) {
    Object.keys(model).forEach(function(face) {
      outputList.push({
        pug: {
          path: path.resolve(__dirname, 'langue_' + face + '.pug'),
          file: path.join(pugFileDir, [from, to, face].join('_') + '.pug'),

          content: FileManager.normalizeEnding(model[face]({
            dirFrom: dir[from],
            dirTo: dir[to],
            from,
            fullFrom: __[from],
            fullTo: __[to],
            to,
          })),
        },
        anki: {
          path: path.resolve(__dirname, 'out/' + [from, to, face].join('_') + '.html'),
          file: path.resolve(__dirname, 'out/' + [from, to, face].join('_') + '.html'),
          get content() { return FileManager.fileNormalized(this.path); }
        },
        name: [from, to, face].join('_'),
      });
    });
  });
});

const css = path.resolve(__dirname, '../commons.css');
outputList.push({
  pug: {
    path: css,
    file: css,
    get content() { return FileManager.fileNormalized(this.path); }
  },
  anki: {
    path: path.resolve(__dirname, 'out/style.css'),
    file: path.resolve(__dirname, 'out/style.css'),
    get content() { return FileManager.fileNormalized(this.path); }
  },
  name: 'style'
});

module.exports = outputList;
