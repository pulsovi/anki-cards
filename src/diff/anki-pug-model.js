const util = require("util");

const chalk = require("chalk");

const Template = require("./anki-pug-template");
const FileManager = require("./file_manager");

class Model {
  constructor(makefile, name) {
    this.pugMakefile = makefile;
    this.name = name;
  }

  parse() {
    try {
      this.pug = require(this.pugMakefile);
    } catch (error) {
      if (error.code === "ENOENT")
        return this.waitForReload(error.message, error.path);

      console.log("Model.parse error: ", error);
      return this.waitForReload("");
    }
    return Promise.resolve(this);
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
    return new Template(this.pugMakefile, templateName, this);
  }

  async templatesList() {
    await this.parse();
    return this.pug.map(f => f.name).sort();
  }
}

Model.prototype.reload = util.deprecate(
  Model.prototype.parse,
  "Model.reload() is deprecated, use Model.parse() instead."
);

module.exports = Model;
