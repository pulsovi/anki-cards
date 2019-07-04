//jshint esversion:6
// native dependancies
const path = require('path');

// npm dependancies
const rra = require('recursive-readdir-async');

// local dependancies
const promiseNoCallback = require('./_promise').noCallBack;
const Note = require('./anki-pug-note');

class Tree {
  constructor(root) {
    this.root = path.resolve(root);
  }

  getNotes() {
    var { promise, resolve, reject } = promiseNoCallback();
    var _this = this;

    rra
      .list(this.root)
      .then(function(list) {
        resolve(
          list
          .filter(function(file) {
            return file.name === 'export.js';
          })
          .sort(function(fileA, fileB) {
            return fileA.path > fileB.path ? 1 :
              fileB.path > fileA.path ? -1 : 0;
          })
          .map(function(file) {
            var name = file.path.slice(_this.root.length + 1).replace(/\\|\//g, ':');
            return new Note(file, name);
          })
        );
      })
      .catch(reject);

    return promise;
  }
}

module.exports = Tree;
