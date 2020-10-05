// native dependencies
const readline = require("readline");
const path = require("path");
const { promisify } = require("util");
const childProcess = require("child_process");
const fs = require("fs");
// npm dependencies
const chalk = require("chalk");
const diff = require("diff");
const mkdirp = require("mkdirp");
const findProcess = require("find-process");
// local dependencies
const Tree = require("./anki-pug-tree");
const meld = require("../utils/meld");
const FileManager = require("./file_manager");
// config
const { "anki-pug-root": ROOT } = require("../../config/global");

class DiffManager {
  constructor(root) {
    this.root = root;
    this.tree = new Tree(root);
    this.manageAll = false;
  }

  async processAll() {
    const modelNames = await this.tree.modelsList();

    for (let index = 0; index < modelNames.length; ++index) {
      await this.processModel(this.tree.getModel(modelNames[index]));
      if (this.quit === true) return;
    }
  }

  async processModel(model) {
    this.currentModel = model;
    this.manageModel = null;
    this.listOnly = null;
    const templateNames = await model.templatesList();
    let previous = null;

    for (let index = 0; index < templateNames.length; ++index) {
      const name = templateNames[index];
      const template = await model.getTemplate(name);

      template.watch();
      const response = await this.processTemplate(template, previous);

      template.close();
      if (response && response.command && response.command === "previous") {
        if (index > 0) {
          index -= 2;
          previous = true;
        } else
          console.info(chalk.bgRed("It's the first template in the current model."));
      }
      if (this.quit === true) return;
    }
    if (this.manageModel === null)
      console.info(chalk.green(model.name));
  }

  async processTemplate(template, toPrevious) {
    if (template.pug.content === template.anki.content)
      return toPrevious ? { command: "previous" } : null;
    if (this.manageModel === null) await this.promptModel();
    if (this.manageModel === false || this.quit === true) return;

    if (this.listOnly === true) {
      console.log(chalk.blueBright(`  ${template.name}`));
      return;
    }

    const fixtureList = await fixtures(template);
    const options = fixtureList ? "[ynsSoplqd]" : "[ynsSoplq]";
    const response = await rlQuestion(chalk.blueBright(`  compare ${template.name} ${options}? `));

    switch (response) {
    case "y":
      await this.compare(template);
      break;
    case "n":
      return;
    case "s":
      this.diff_words(template);
      break;
    case "S":
      this.diff_lines(template);
      break;
    case "o":
      fs.writeFile(template.anki.path, template.pug.content, _ => _);
      return;
    case "p":
      return { command: "previous" };
    case "l":
      this.listOnly = true;
      return;
    case "q":
      this.quit = true;
      return;
    case "d":
      if (fixtureList) {
        debug(fixtureList.map(fixture => fixture.id));
        break;
      }
      // else falls through
    default:
      console.log(chalk.red(
        `${"\ty - [yes]       compare versions\n" +
          "\tn - [no]        skip this template\n" +
          "\ts - [simple-w]  print simple words diff\n" +
          "\tS - [simple-l]  print simple lines diff\n" +
          "\to - [overwrite] replace the anki template by the pug template\n" +
          "\tp - [previous]  let this template undecided, jump to previous template\n" +
          "\tl - [list]      list all template conflicts and quit this model\n" +
          "\tq - [quit]      skip all unmanaged models and templates and quit the diff"}${
          d ? "\n\td - [debug]     run debugging GUI tool" : ""}`
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
    meld(template.pug.file, template.anki.path);
  }

  async promptModel() {
    if (this.manageAllModels === true) {
      console.log(chalk.cyanBright(this.currentModel.name));
      this.manageModel = true;
      return;
    }
    const response = await rlQuestion(chalk.cyanBright(`manage ${this.currentModel.name} [ynaq]? `));

    switch (response) {
    case "n":
      this.manageModel = false;
      return;
    case "a":
      this.manageAllModels = true;
      this.manageModel = true;
      return;
    case "y":
      this.manageModel = true;
      return;
    case "q":
      this.quit = true;
      return;
    default:
      console.log(chalk.red(
        "\ty - [yes]  manage\n" +
          "\tn - [no]   skip this model\n" +
          "\ta - [all]  manage all models\n" +
          "\tq - [quit] skip all unmanaged models and quit the diff"
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
  const iface = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    iface.question(question, answer => {
      iface.close();
      resolve(answer);
    });
  });
}

function write_diff(chunk) {
  let { value } = chunk;

  if (chunk.added)
    process.stdout.write(chalk.green(value));
  else if (chunk.removed)
    process.stdout.write(chalk.red(value));
  else {
    value = value
      .split("\n\n")
      .filter((el, index, array) => index === 0 || index === array.length - 1)
      .join("\n\n");
    process.stdout.write(value);
  }
}

async function fixtures(template) {
  const fixturesFile = path.join(ROOT, "tests/fixture/fixtures.json");
  const allFixtures = JSON.parse(await promisify(fs.readFile)(fixturesFile, "utf8"));
  const matchArray = allFixtures.filter(fixture => fixture.model === template.model.name &&
    (
      fixture.card === template.name.split("_").slice(0, -1).join("_") ||
      template.name === "style"
    ));
  return matchArray.length ? matchArray : null;
}

async function debug(idArray) {
  const shell = await getShell();

  idArray.forEach(id => {
    childProcess.spawn(shell, [path.join(ROOT, "tests/bin/test.sh"), id]);
  });
}

async function getShell() {
  const shellPid = (await findProcess("pid", process.pid))[0].ppid;
  const shellProcess = (await findProcess("pid", shellPid))[0];
  return shellProcess.bin;
}
