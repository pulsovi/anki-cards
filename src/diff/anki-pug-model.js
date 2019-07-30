//jshint esversion:8
const util = require('util');

const path = require('path');
const pug = require('pug');

const promiseNoCallback = require('./_promise').noCallBack;
const Template = require('./anki-pug-template');
const FileManager = require('./file_manager');

class Model {
  constructor(makefile, name) {
    this.pugMakefile = makefile;
    this.name = name;
  }

  async parse() {
    try {
      this.pug = require(this.pugMakefile);
    } catch (e) {
      if (e.code === 'ENOENT') {
        return this.waitForReload(e.message, e.path);
      }
      console.log('Model.parse error: ', e);
      return this.waitForReload('');
    }
    return this;
  }

  async waitForReload(message, ...files) {
    if (message)
      console.log(chalk.bgRed.yellow(message));
    FileManager.open(this.pugMakefile);
    delete require.cache[require.resolve(this.pugMakefile)];
    await FileManager.waitOnce.apply(FileManager, [this.pugMakefile].concat(files));
    return this.parse();
  }

  getTemplate(templateName) {
    return (new Template(this.pugMakefile, templateName, this));
  }

  async templatesList() {
    await this.parse();
    return this.pug.map(f => f.name).sort();
  }
}

Model.prototype.reload = util.deprecate(
  Model.prototype.parse,
  'Model.reload() is deprecated, use Model.parse() instead.'
);

module.exports = Model;
