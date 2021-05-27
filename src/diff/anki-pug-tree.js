// jshint esversion:8
// native dependancies
const path = require('path');

// npm dependancies
const rra = require('recursive-readdir-async');

// local dependancies
const promiseNoCallback = require('./_promise').noCallBack;
const Model = require('./anki-pug-model');

class Tree {
  constructor(root) {
    this.root = path.resolve(root);
  }

  async parseModels() {
  }

  async modelsList() {
    const files = await rra.list(this.root);
    const makers = files.filter(file => file.name === 'export.js');
    const modelNames = makers.map(file => path.relative(this.root, file.path).replace(/\\|\//g, '::'));
    return modelNames.sort();
  }

  getModel(name) {
    const makefile = path.resolve(this.root, name.replace(/::/g, path.sep), 'export.js');
    return new Model(makefile, name);
  }

  async getModels() {
    return list
      .sort((fileA, fileB) => (fileA.path > fileB.path ? 1 :
        fileB.path > fileA.path ? -1 : 0))
      .map(file => {
        const name = path.relative(this.root, file.path).replace(/\\|\//g, '::');
        return new Model(file.fullname, name);
      });
  }
}

module.exports = Tree;
