/* eslint-disable no-sync */
const fs = require('fs');
const path = require('path');

const pug = require('pug');

// eslint-disable-next-line no-process-env
const ROOT = process.env.ANKI_PUG_ROOT;
const pugFileDir = path.resolve(ROOT, 'var', path.relative(path.join(ROOT, 'model'), __dirname));

// eslint-disable-next-line import/no-dynamic-require
const FileManager = require(path.resolve(ROOT, 'src/diff/file_manager'));

// eslint-disable-next-line no-extend-native
String.prototype.toCapitalisationCase = function toCapitalisationCase() {
  return this.charAt(0).toUpperCase() + this.substring(1);
};

const max = 8;

const th = [
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'seventh',
  'eighth',
];

const list = [
  'def',
  'desc',
  'nom',
  'pos',
  'typ',
];

const single = {
  'main_nom': 'nom',
  'main_retContent': 'retContent',
  'main_retTyp': 'retTyp',
  'main_usage': 'usage',
  'paramsNb': 'paramsNb',
};

const fields = [
  '_recto',
  '_verso',
];

const outputList = [];

list.forEach(exportParamCard);

function exportParamCard(name) {
  fields.forEach(field => {
    exportParamField(name, field);
  });
}

function exportParamField(cardName, field) {
  const pugFile = path.resolve(__dirname, `${cardName + field}.pug`);
  const model = pug.compileFile(pugFile);

  for (let paramNb = 1; paramNb <= max; ++paramNb) {
    outputList.push({
      anki: {
        get content() { return FileManager.normalizeEnding(fs.readFileSync(this.path, 'utf8')); },
        file: path.resolve(__dirname, `out/${paramNb}${cardName}${field}.html`),
        path: path.resolve(__dirname, `out/${paramNb}${cardName}${field}.html`),
      },
      name: paramNb + cardName + field,
      pug: {
        // eslint-disable-next-line id-length
        content: FileManager.normalizeEnding(model({ i: paramNb, max, th: th[paramNb - 1] })),
        file: path.join(pugFileDir, path.basename(pugFile)),
        path: pugFile,
      },
    });
  }
}

Object.keys(single).forEach(pugName => {
  const htmlName = single[pugName];

  fields.forEach(field => {
    const pugFile = path.resolve(__dirname, `${pugName + field}.pug`);

    outputList.push({
      anki: {
        get content() { return FileManager.normalizeEnding(fs.readFileSync(this.path, 'utf8')); },
        file: path.resolve(__dirname, `out/${htmlName}${field}.html`),
        path: path.resolve(__dirname, `out/${htmlName}${field}.html`),
      },
      name: htmlName + field,
      pug: {
        content: FileManager.normalizeEnding(pug.renderFile(pugFile, { max })),
        file: path.join(pugFileDir, path.basename(pugFile)),
        path: pugFile,
      },
    });
  });
});

outputList.push({
  anki: {
    get content() { return FileManager.normalizeEnding(fs.readFileSync(this.path, 'utf8')); },
    file: path.resolve(__dirname, 'out/style.css'),
    path: path.resolve(__dirname, 'out/style.css'),
  },
  name: 'style',
  pug: {
    get content() { return FileManager.normalizeEnding(fs.readFileSync(this.path, 'utf8')); },
    file: path.resolve(__dirname, '../../commons.css'),
    path: path.resolve(__dirname, '../../commons.css'),
  },
});

module.exports = outputList;
