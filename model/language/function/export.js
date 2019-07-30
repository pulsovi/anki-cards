//jshint esversion:6
const fs = require('fs');
const path = require('path');
const pug = require('pug');

const ROOT = process.env.ANKI_PUG_ROOT;
var pugFileDir = path.resolve(ROOT, 'var', path.relative(path.join(ROOT, 'model'), __dirname));

const FileManager = require(path.resolve(ROOT, 'src/diff/file_manager'));

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
  '_verso'
];

outputList = [];

list.forEach(export_param_card);

function export_param_card(name) {
  fields.forEach(function(field) {
    export_param_field(name, field);
  });
}

function export_param_field(card_name, field) {
  var pugFile = path.resolve(__dirname, card_name + field + '.pug');
  var model = pug.compileFile(pugFile);
  for (let i = 1; i <= max; ++i) {
    outputList.push({
      pug: {
        path: pugFile,
        file: path.join(pugFileDir, path.basename(pugFile)),
        content: FileManager.normalizeEnding(model({ th: th[i - 1], i: i, max: max }))
      },
      anki: {
        path: path.resolve(__dirname, 'out/' + i + card_name + field + '.html'),
        file: path.resolve(__dirname, 'out/' + i + card_name + field + '.html'),
        get content() { return FileManager.fileNormalized(this.path); }
      },
      name: i + card_name + field
    });
  }
}

Object.keys(single).forEach(function(pugName) {
  var htmlName = single[pugName];
  fields.forEach(function(field) {
    var pugFile = path.resolve(__dirname, pugName + field + '.pug');
    outputList.push({
      pug: {
        path: pugFile,
        file: path.join(pugFileDir, path.basename(pugFile)),
        content: FileManager.normalizeEnding(pug.renderFile(pugFile, { max: max }))
      },
      anki: {
        path: path.resolve(__dirname, 'out/' + htmlName + field + '.html'),
        file: path.resolve(__dirname, 'out/' + htmlName + field + '.html'),
        get content() { return FileManager.fileNormalized(this.path); }
      },
      name: htmlName + field
    });
  });
});

outputList.push({
  pug: {
    file: path.resolve(__dirname, '../../commons.css'),
    path: path.resolve(__dirname, '../../commons.css'),
    get content() { return FileManager.fileNormalized(this.path); }
  },
  anki: {
    file: path.resolve(__dirname, 'out/style.css'),
    path: path.resolve(__dirname, 'out/style.css'),
    get content() { return FileManager.fileNormalized(this.path); }
  },
  name: 'style'
});

module.exports = outputList;
