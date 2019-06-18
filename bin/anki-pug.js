//jshint esversion:6
const Tree = require('./anki-pug-tree');

function tree(path) {
  return new Tree(path);
}

module.exports = { tree };
