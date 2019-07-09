//jshint esversion:6

const path = require('path');
const pug = require('pug');

const promiseNoCallback = require('./_promise').noCallBack;
const Template = require('./anki-pug-template');

class Note {
  constructor(file, name) {
    this.maker = file;
    this.template = {};
    this.name = name;
  }

  parse() {
    var content = require(this.maker.fullname);
    var _this = this;
    content.forEach(function(rawTemplate) {
      var template = new Template(_this.maker, rawTemplate, _this);
      _this.template[template.name] = template;
    });
    return this;
  }

  reload() {
    delete require.cache[require.resolve(this.maker.fullname)];
    this.parse();
    return this;
  }

  get templateNames() {
    this.parse();
    return Object.keys(this.template).sort();
  }
}

module.exports = Note;
