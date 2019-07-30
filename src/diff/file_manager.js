// jshint esversion:8
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');


class FileManager {
  async waitOnce(...files) {
    return new Promise(resolve => {
      var watchers = files.map(f => {
        if (typeof f !== 'string') {
          console.log(`${f} is not a string`);
          throw new TypeError('files MUST be of type string');
        }
        var file = path.basename(f);
        var directory = path.dirname(f);
        var watcher = fs.watch(directory, (event, filename) => {
          if (filename !== file) return;
          console.log(event, filename);
          watchers.forEach(w => w.close());
          resolve(f);
        });
        console.log('watch file:', f);
        viewFile(f);
        return watcher;
      });
    });
  }

  async open(...files) {
    files.forEach(viewFile);
  }

  normalizeEnding(string) {
    return string.replace(/\r\n|\r|\n/g, '\n').replace(/\n*$/, '\n');
  }

  fileNormalized(filename) {
    return this.normalizeEnding(fs.readFileSync(filename, 'utf8'));
  }
}

function run(command) {
  child_process.spawn(command, { detached: true, stdio: 'ignore', shell: true }).unref();
}

function viewFile(filename) {
  run(`"C:\\Program Files\\Sublime Text 3\\sublime_text.exe" "${filename}"`);
}

module.exports = new FileManager();
