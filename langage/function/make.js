//jshint esversion:6
const pug = require('pug');
const fs = require('fs');
const mkdirp= require('mkdirp');

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
];

const list = [
  'def',
  'desc',
  'nom',
  'pos',
  'typ',
];

const single = [
  'main_nom',
  'main_retContent',
  'main_retTyp',
  'main_usage',
  'paramsNb',
];

list.forEach(function(name) {
  mkdirp.sync('out/' + name);
  let recto = pug.compileFile(name + '_recto.pug');
  let verso = pug.compileFile(name + '_verso.pug');
  for (let i = 1; i <= max; ++i) {
    mkdirp.sync('out/' + i);
    fs.writeFileSync('out/' + name + '/' + i + name + '_recto.html', recto({ th: th[i - 1], i: i, max: max }));
    fs.writeFileSync('out/' + name + '/' + i + name + '_verso.html', verso({ th: th[i - 1], i: i, max: max }));
    fs.writeFileSync('out/' + i + '/' + i + name + '_recto.html', recto({ th: th[i - 1], i: i, max: max }));
    fs.writeFileSync('out/' + i + '/' + i + name + '_verso.html', verso({ th: th[i - 1], i: i, max: max }));
  }
});

mkdirp.sync('out');
single.forEach(function(name) {
  fs.writeFileSync('out/' + name + '_recto.html', pug.renderFile(name + '_recto.pug', {max: max}));
  fs.writeFileSync('out/' + name + '_verso.html', pug.renderFile(name + '_verso.pug', {max: max}));
});
