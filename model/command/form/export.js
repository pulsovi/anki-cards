//jshint esversion:6
const fs = require('fs');
const path = require('path');
const pug = require('pug');

const cards = [
  'Form',
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
    var pugFile = path.resolve(__dirname, name + field + '.pug');
    outfile.pugFile = pugFile;
    outfile.name = 'out/' + name + field + '.html';
    outfile.content = pug.renderFile(pugFile);
    outputList.push(outfile);
  });
});

outputList.push({
  name: 'out/style.css',
  pugFile: path.resolve(__dirname, '../../commons.css'),
  content: fs.readFileSync(path.resolve(__dirname, '../../commons.css'), { encoding: 'utf8' })
});

module.exports = outputList;
