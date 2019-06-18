//jshint esversion:6
const fs = require('fs');
const path = require('path');
const pug = require('pug');

const cards = [
  'Command',
  'Usage',
];

const fields = [
  '_recto',
  '_verso'
];

var outputList = [];
cards.forEach(function(name) {
  fields.forEach(function(field) {
    var outfile = {};
    outfile.name = 'out/' + name + field + '.html';
    outfile.content = pug.renderFile(path.resolve(__dirname, name + field + '.pug'));
    outputList.push(outfile);
  });
});

outputList.push({
  name: 'out/style.css',
  content: fs.readFileSync(path.resolve(__dirname, '../commons.css'), { encoding: 'utf8' })
});

module.exports = outputList;
