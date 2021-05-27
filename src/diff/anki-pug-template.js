// jshint esversion: 8
const fs = require('fs');
const path = require('path');

const chalk = require('chalk');

const FileManager = require('./file_manager');

class Template {
  constructor(pugMakefile, name, model) {
    this.parent = this.model = model;
    this.name = name;
    this.makefile = pugMakefile;
    this.ready = this.parse();
  }

  async parse() {
    let templates;

    delete require.cache[require.resolve(this.makefile)];
    try {
      templates = require(this.makefile);
    } catch (e) {
      if (e.filename)
        return this.waitForReload(e.message, e.filename);
      return this.waitForReload(e.message);
    }
    const template = templates.find(t => t.name === this.name);

    if (!template)
      return this.waitForReload(`Impossible de trouver le template ${this.name}.`);
    Object.assign(this, template);
    await this.check();
    return this;
  }

  async waitForReload(message, ...files) {
    if (!files.length) files.push(this.makefile);
    console.log(chalk.bgRed.yellow(message, `\n${this.model.name} _ ${this.name}`));
    delete require.cache[require.resolve(this.makefile)];
    FileManager.open(files);
    await FileManager.waitOnce(...files);
    return this.parse();
  }

  async check() {
    if (!this.pug || !this.pug.content || !this.pug.file || !this.pug.path) {
      return await this.waitForReload(
        'Le template doit contenir une propriété pug avec les éléments path, file et content'
      );
    }
  }

  async assign(object, child) {
    await this.ready;
    object[child] = {
      name: this.name,
      pug: { ...this.pug },
      anki: { ...this.anki },
    };
  }

  watch() {
    this.close();
    const dirname = path.dirname(this.makefile);

    this.watcher = fs.watch(dirname, (event, file) => {
      console.log(chalk.yellow(`\nfile ${event}: ${path.resolve(dirname, file)}`));
      this.ready = this.parse();
    });
  }

  close() {
    if (this.watcher) this.watcher.close();
  }
}

module.exports = Template;
