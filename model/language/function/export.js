//jshint esversion:6
const fs = require('fs');
const path = require('path');
const pug = require('pug');

String.prototype.toCapitalisationCase = function toCapitalisationCase() {
  return this.charAt(0).toUpperCase() + this.substring(1);
};

const max = 6;

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
      content: model({ th: th[i - 1], i: i, max: max }),
      name: 'out/' + i + card_name + field + '.html',
      pugFile,
    });
  }
}

Object.keys(single).forEach(function(pugName) {
  var htmlName = single[pugName];
  fields.forEach(function(field) {
    var pugFile = path.resolve(__dirname, pugName + field + '.pug');
    outputList.push({
      content: pug.renderFile(pugFile, { max: max }),
      name: 'out/' + htmlName + field + '.html',
      pugFile,
    });
  });
});

outputList.push({
  actualPath: path.resolve(__dirname, '../../commons.css'),
  content: fs.readFileSync(path.resolve(__dirname, '../../commons.css'), { encoding: 'utf8' }),
  name: 'out/style.css',
  pugFile: path.resolve(__dirname, '../../commons.css'),
});

module.exports = outputList;
