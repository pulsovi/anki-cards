//jshint esversion: 8
// native dependencies
const readline = require('readline');
const path = require('path');
const { promisify } = require('util');
const child_process = require('child_process');
const fs = require('fs');
// npm dependencies
const chalk = require('chalk');
const diff = require('diff');
const mkdirp = require('mkdirp');
// local dependencies
const Tree = require('./anki-pug-tree');
const Model = require('./anki-pug-model');
const FileManager = require('./file_manager');

class DiffManager {
  constructor(root) {
    this.root = root;
    this.tree = new Tree(root);
    this.manageAll = false;
  }

  async processAll() {
    var modelNames = await this.tree.modelsList();
    for (let i = 0; i < modelNames.length; ++i) {
      await this.processModel(this.tree.getModel(modelNames[i]));
      if (this.quit === true) return;
    }
  }

  async processModel(model) {
    this.currentModel = model;
    this.manageModel = null;
    this.listOnly = null;
    var templateNames = await model.templatesList();
    for (let i = 0; i < templateNames.length; ++i) {
      var name = templateNames[i];
      var template = await model.getTemplate(name);
      var response = await this.processTemplate(template);
      if (response && response.command && response.command === 'previous') {
        if (i > 0) {
          i -= 2;
        } else {
          console.log(chalk.bgRed("It's the first template in the current model."));
        }
      }
      if (this.quit === true) return;
    }
    if(this.manageModel === null){
      console.log(chalk.green(model.name));
    }
  }

  async processTemplate(template) {
    if (template.pug.content === template.anki.content) return;
    if (this.manageModel === null) await this.promptModel();
    if (this.manageModel === false || this.quit === true) return;

    if (this.listOnly === true) {
      console.log(chalk.blueBright('  ' + template.name));
      return;
    }

    var response = await rlQuestion(chalk.blueBright(`  compare ${template.name} [ynsSoplq]? `));
    switch (response) {
      case 'y':
        await this.compare(template);
        break;
      case 'n':
        return;
      case 's':
        this.diff_words(template);
        break;
      case 'S':
        this.diff_lines(template);
        break;
      case 'o':
        fs.writeFile(template.anki.path, template.pug.content, 'utf8', _ => _);
        return;
      case 'p':
        return { command: 'previous' };
      case 'l':
        this.listOnly = true;
        return;
      case 'q':
        this.quit = true;
        return;
      default:
        console.log(chalk.red(
          '\ty - [yes]       compare versions\n' +
          '\tn - [no]        skip this template\n' +
          '\ts - [simple-w]  print simple words diff\n' +
          '\tS - [simple-l]  print simple lines diff\n' +
          '\to - [overwrite] replace the anki template by the pug template\n' +
          '\tp - [previous]  let this template undecided, jump to previous template\n' +
          '\tl - [list]      list all template conflicts and quit this model\n' +
          '\tq - [quit]      skip all unmanaged models and templates and quit the diff'
        ));
        break;
    }
    return this.processTemplate(template);
  }

  async compare(template) {
    FileManager.open(template.pug.path);
    if (template.pug.file !== template.pug.path) {
      await promisify(mkdirp)(path.dirname(template.pug.file));
      await promisify(fs.writeFile)(template.pug.file, template.pug.content);
    }
    child_process.execSync(`meld "${template.pug.file}" "${template.anki.path}"`);
  }

  async promptModel() {
    if (this.manageAllModels === true) {
      console.log(chalk.cyanBright(this.currentModel.name));
      this.manageModel = true;
      return;
    }
    var response = await rlQuestion(chalk.cyanBright(`manage ${this.currentModel.name} [ynaq]? `));
    switch (response) {
      case 'n':
        this.manageModel = false;
        return;
      case 'a':
        this.manageAllModels = true;
        this.manageModel = true;
        return;
      case 'y':
        this.manageModel = true;
        return;
      case 'q':
        this.quit = true;
        return;
      default:
        console.log(chalk.red(
          '\ty - [yes]  manage\n' +
          '\tn - [no]   skip this model\n' +
          '\ta - [all]  manage all models\n' +
          '\tq - [quit] skip all unmanaged models and quit the diff'
        ));
        return this.promptModel();
    }
  }

  diff_lines(template) {
    diff.diffLines(template.anki.content, template.pug.content).forEach(write_diff);
  }

  diff_words(template) {
    diff.diffWords(template.anki.content, template.pug.content).forEach(write_diff);
  }
}

module.exports = DiffManager;

function rlQuestion(question) {
  var interface = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    interface.question(question, answer => {
      interface.close();
      resolve(answer);
    });
  });
}


function write_diff(chunk) {
  var value = chunk.value;
  if (chunk.added) {
    process.stdout.write(chalk.green(value));
  } else if (chunk.removed) {
    process.stdout.write(chalk.red(value));
  } else {
    value = value
      .split('\n\n')
      .filter((el, index, array) => index === 0 || index === array.length - 1)
      .join('\n\n');
    process.stdout.write(value);
  }
}
