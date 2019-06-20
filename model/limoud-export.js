//jshint esversion:6
const fs = require('fs');
const path = require('path');
const pug = require('pug');

function make(
  dirname,
  cards = ['Card1'],
  css = path.resolve(__dirname, 'kodech.css'),
  fields = [
    '_recto',
    '_verso'
  ]
) {
  var outputList = [];

  cards.forEach(function(name) {
    fields.forEach(function(field) {
      var pugFile = path.resolve(dirname, name + field + '.pug');
      outputList.push({
        content: pug.renderFile(pugFile),
        name: 'out/' + name + field + '.html',
        pugFile,
      });
    });
  });

  outputList.push({
    actualPath: css,
    content: fs.readFileSync(css, { encoding: 'utf8' }),
    name: 'out/style.css',
    pugFile: css,
  });

  return outputList;
}

module.exports = make;
