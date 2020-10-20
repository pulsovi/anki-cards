/* eslint-disable no-sync */
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
    '_verso',
  ]
) {
  const outputList = [];

  cards.forEach(name => {
    fields.forEach(field => {
      const pugFile = path.resolve(dirname, `${name + field}.pug`);
      const relative = path.relative(__dirname, dirname);

      outputList.push({
        anki: {
          content: FileManager.normalizeEnding(
            fs.readFileSync(path.resolve(dirname, 'out', `${name + field}.html`), 'utf8')
          ),
          path: path.resolve(dirname, 'out', `${name + field}.html`),
        },
        name: name + field,
        pug: {
          content: FileManager.normalizeEnding(pug.renderFile(pugFile)),
          file: path.resolve(__dirname, '../var', relative, `${name + field}.html`),
          path: pugFile,
        },
      });
    });
  });

  outputList.push({
    anki: {
      content: fs.readFileSync(path.resolve(dirname, 'out', 'style.css'), 'utf8'),
      path: path.resolve(dirname, 'out', 'style.css'),
    },
    name: 'style',
    pug: {
      content: fs.readFileSync(css, 'utf8'),
      file: css,
      path: css,
    },
  });

  return outputList;
}

module.exports = make;
