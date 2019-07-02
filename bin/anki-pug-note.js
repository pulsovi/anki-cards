//jshint esversion:6

const path = require('path');
const pug = require('pug');

const promiseNoCallback = require('./underscore/promise').noCallBack;
const Template = require('./anki-pug-template');

const ROOT = path.resolve(__dirname, '../model');

class Note {
  constructor(file) {
    this.maker = file;
    this.template = {};
    this.name = file.path.slice(ROOT.length + 1).replace(/\\|\//g, ':');
  }

  parse() {
    var content = require(this.maker.fullname);
    var _this = this;
    content.forEach(function(rawTemplate) {
      var template = new Template(_this.maker, rawTemplate, _this);
      _this.template[template.name] = template;
    });
  }

  reload() {
    delete require.cache[require.resolve(this.maker.fullname)];
    this.parse();
  }

  get templateNames() {
    this.parse();
    return Object.keys(this.template).sort();
  }
}

module.exports = Note;
