//jshint esversion:6
const fs = require('fs');
const path = require('path');
const pug = require('pug');

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
        content: model[face]({
          dirFrom: dir[from],
          dirTo: dir[to],
          from,
          fullFrom: __[from],
          fullTo: __[to],
          to,
        }),
        name: 'out/' + [from, to, face].join('_') + '.html',
        pugFile: path.resolve(__dirname, 'langue_' + face + '.pug'),
      });
    });
  });
});

const css = path.resolve(__dirname, '../commons.css');
outputList.push({
  actualPath: css,
  content: fs.readFileSync(css, { encoding: 'utf8' }),
  name: 'out/style.css',
  pugFile: css,
});

module.exports = outputList;
