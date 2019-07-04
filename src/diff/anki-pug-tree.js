//jshint esversion:6
const path = require('path');

const rra = require('recursive-readdir-async');

const promiseNoCallback = require('./_promise').noCallBack;
const Note = require('./anki-pug-note');

class Tree {
  constructor(root) {
    this.root = path.resolve(root);
  }

  getNotes() {
    var { promise, resolve, reject } = promiseNoCallback();

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
              return new Note(file);
            })
        );
      })
      .catch(reject);

    return promise;
  }
}

module.exports = Tree;
