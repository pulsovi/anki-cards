// jshint esversion: 8
const fs = require('fs');
const path = require('path');

const chalk = require('chalk');
const debug = require('debug');
const { has } = require('underscore');

const FileManager = require('./file_manager');

const log = debug('diff:anki-pug-template');
const clog = debug('diff:anki-pug-template*');

class Template {
  constructor(pugMakefile, name, model) {
    log('new Template', { model, name, pugMakefile });
    this.model = model;
    this.parent = model;
    this.name = name;
    this.makefile = pugMakefile;
    this.ready = this.parse();
  }

  async parse() {
    const { makefile } = this;
    let templates;

    delete require.cache[require.resolve(makefile)];
    try {
      templates = require(makefile);
    } catch (error) {
      console.log(`Error on parse template "${makefile}"`, error.stack);
      if (error.filename)
        return this.waitForReload(error.message, error.filename);
      return this.waitForReload(error.message);
    }
    const template = templates.find(templateItem => templateItem.name === this.name);

    if (!template)
      return this.waitForReload(`Impossible de trouver le template ${this.name}.`);
    Object.assign(this, template);
    await this.check();
    return this;
  }

  async waitForReload(message, ...files) {
    if (!files.length) files.push(this.makefile);
    clog(chalk.bgRed.yellow(`Template: ${this.model.name}_${this.name}\n${message}`));
    FileManager.open(files);
    await FileManager.waitOnce(...files);
    return this.parse();
  }

  async check() {
    const errors = 'path,file,content'
      .split(',')
      .map(prop => (has(this.pug, `${prop}`) ?
        null :
        `Le template doit contenir la propriété pug.${prop}`))
      .filter(error => error !== null);

    if (errors.length) {
      clog('\n\n', errors.join('\n'));
      clog(this.pug);
      return await this.waitForReload();
    }
    return true;
  }

  async assign(object, child) {
    await this.ready;
    object[child] = {
      anki: { ...this.anki },
      name: this.name,
      pug: { ...this.pug },
    };
  }

  watch() {
    this.close();
    const dirname = path.dirname(this.makefile);

    this.watcher = fs.watch(dirname, (event, file) => {
      clog(chalk.yellow(`\nfile ${event}: ${path.resolve(dirname, file)}`));
      this.ready = this.parse();
    });
  }

  close() {
    if (this.watcher) this.watcher.close();
  }
}

module.exports = Template;
