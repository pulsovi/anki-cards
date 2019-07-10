//jshint esversion: 6
// native dependancies
const fs = require('fs');
const path = require('path');

// local dependancies
const promiseNoCallback = require('./_promise').noCallBack;

const ROOT = process.env.ANKI_PUG_ROOT;

function normalizeLineEnding(text) {
  return text.replace(/\r\n/g, '\r').replace(/\r/g, '\n').replace(/\s*$/, '\n');
}

function touch(path) {
  fs.closeSync(fs.openSync(path, 'a'));
}

class Template {
  constructor(maker, rawTemplate, parent) {
    this.fullname = path.resolve(maker.path, rawTemplate.name);
    this.name = path.basename(this.fullname, '.html');
    this.pugFile = rawTemplate.pugFile;
    this.renderedPugPath = rawTemplate.actualPath || path.resolve(
      ROOT, 'var/', parent.name.replace(/::/g, '/'), path.basename(this.fullname)
    );
    this.pug = normalizeLineEnding(rawTemplate.content);
    this.parent = parent;
  }

  get anki() {
    touch(this.fullname);
    return normalizeLineEnding(fs.readFileSync(this.fullname, { encoding: 'utf8' }));
  }
}

module.exports = Template;
