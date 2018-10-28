//jshint esversion:6
const pug = require('pug');
const fs = require('fs');
const mkdirp = require('mkdirp');

const list = [
  'Texte a trous',
];

mkdirp.sync('out');
list.forEach(function(name) {
  fs.writeFileSync('out/' + name + '_recto.html', pug.renderFile(name + '_recto.pug'));
  fs.writeFileSync('out/' + name + '_verso.html', pug.renderFile(name + '_verso.pug'));
});
