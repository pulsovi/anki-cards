//jshint esversion: 6

const path = require('path');
const fs = require('fs');

const promiseNoCallback = require('./underscore/promise').noCallBack;

function normalizeLineEnding(text) {
  return text.replace(/\r\n/g, '\r').replace(/\r/g, '\n').replace(/\s*$/, '\n');
}

class Template {
  constructor(maker, rawTemplate, noteName) {
    this.fullname = path.resolve(maker.path, rawTemplate.name);
    this.name = path.basename(this.fullname, '.html');
    this.pugFile = rawTemplate.pugFile;
    this.actualPath = rawTemplate.actualPath || path
      .resolve(__dirname, '../var/', noteName.replace(/:/g, '/'), path.basename(this.fullname));
    this.expected = normalizeLineEnding(rawTemplate.content);
  }

  get actual() {
    return normalizeLineEnding(fs.readFileSync(this.fullname, { encoding: 'utf8' }));
  }
}

module.exports = Template;
