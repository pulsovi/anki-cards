// jshint esversion:8
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");
const { deprecate } = require("util");

const FileManager = {
  fileNormalized(filename) {
    return this.normalizeEnding(fs.readFileSync(filename, "utf8"));
  },
  normalizeEnding(string) {
    let result = string;

    while (result.includes("\r\r\n")) result = result.replace(/\r\r\n/gu, "\r\n");
    return result.replace(/\r\n/gu, "\n").replace(/\r/gu, "\n").replace(/\n*$/u, "\n");
  },
  open(...files) {
    files.forEach(viewFile);
  },
  waitOnce(...files) {
    return new Promise(resolve => {
      const watchers = files.map(file => {
        if (typeof file !== "string") {
          console.error(`${file} is not a string`);
          throw new TypeError("files MUST be of type string");
        }
        const basename = path.basename(file);
        const directory = path.dirname(file);
        const watcher = fs.watch(directory, (event, filename) => {
          if (filename !== basename) return;
          console.info(event, filename);
          watchers.forEach(wtchr => wtchr.close());
          resolve(file);
        });

        console.info("watch file:", file);
        viewFile(file);
        return watcher;
      });
    });
  },
};

function run(command) {
  childProcess.spawn(command, { detached: true, shell: true, stdio: "ignore" }).unref();
}

function viewFile(filename) {
  run(`"C:\\Program Files\\Sublime Text 3\\sublime_text.exe" "${filename}"`);
}

FileManager.fileNormalized = deprecate(
  FileManager.fileNormalized,
  "fileNormalized() is deprecated, please normalize the original file instead"
);
module.exports = FileManager;
