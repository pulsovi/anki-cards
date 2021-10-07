const util = require('util');

const chalk = require('chalk');
const log = require('debug')('diff:anki-pug-model');

const Template = require('./anki-pug-template');
const FileManager = require('./file_manager');

class Model {
  constructor(makefile, name) {
    log('new Model', { makefile, name });
    this.pugMakefile = makefile;
    this.name = name;
  }

  parse() {
    try {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      this.pug = require(this.pugMakefile);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.info('file not found', error.path);
        return this.waitForReload(error.message, error.path);
      }

      console.info('Model.parse error: ', error.message);
      log(error.stack);
      // log(Reflect.ownKeys(error).map(key => ({[key]: error[key]})));
      return this.waitForReload('Please edit and save file to retry.', error.filename);
    }
    return Promise.resolve(this);
  }

  async waitForReload(message, ...files) {
    if (message)
      console.info(chalk.yellow(message));
    FileManager.open(this.pugMakefile);
    delete require.cache[require.resolve(this.pugMakefile)];
    await FileManager.waitOnce.apply(FileManager, [this.pugMakefile].concat(files));
    return this.parse();
  }

  getTemplate(templateName) {
    return new Template(this.pugMakefile, templateName, this);
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
