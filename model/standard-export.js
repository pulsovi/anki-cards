const fs = require('fs');
const path = require('path');
const pug = require('pug');
const FileManager = require('../src/diff/file_manager');

function make(
  dirname,
  cards = ['Card1'],
  css = path.resolve(__dirname, 'commons.css'),
  fields = [
    '_recto',
    '_verso'
  ]
) {
  var outputList = [];

  cards.forEach(function(name) {
    fields.forEach(function(field) {
      var pugFile = path.resolve(dirname, name + field + '.pug');
      var relative = path.relative(__dirname, dirname);
      outputList.push({
        anki: {
          path: path.resolve(dirname, 'out', name + field + '.html'),
          content: FileManager.fileNormalized(path.resolve(dirname, 'out', name + field + '.html'))
        },
        pug: {
          path: pugFile,
          file: path.resolve(__dirname, '../var', relative, name + field + '.html'),
          content: FileManager.normalizeEnding(pug.renderFile(pugFile))
        },
        name: name + field
      });
    });
  });

  outputList.push({
    anki: {
      path: path.resolve(dirname, 'out', 'style.css'),
      content: FileManager.fileNormalized(path.resolve(dirname, 'out', 'style.css'))
    },
    pug: {
      path: css,
      file: css,
      content: FileManager.fileNormalized(css)
    },
    name: 'style'
  });

  return outputList;
}

module.exports = make;
