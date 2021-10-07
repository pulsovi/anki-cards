const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const log = require('debug')('anki:file-manager');

const FileManager = {
  normalizeEnding(string) {
    let result = string;

    while (result.includes('\r\r\n')) result = result.replace(/\r\r\n/gu, '\r\n');
    return result.replace(/\r\n/gu, '\n').replace(/\r/gu, '\n').replace(/\n*$/u, '\n');
  },
  open(...files) {
    files.forEach(openFile);
  },
  waitOnce(...files) {
    return new Promise(resolve => {
      const watchers = files.map(file => {
        const basename = path.basename(file);
        const directory = path.dirname(file);
        const watcher = fs.watch(directory, (event, filename) => {
          if (filename !== basename) return;
          log(event, filename);
          watchers.forEach(watcherItem => watcherItem.close());
          resolve(file);
        });

        console.info('watch file:', file);
        openFile(file);
        return watcher;
      });
    });
  },
};

function run(command) {
  childProcess.spawn(command, { detached: true, shell: true, stdio: 'ignore' }).unref();
}

function openFile(filename) {
  run(`"C:\\Program Files\\Sublime Text 3\\sublime_text.exe" "${filename}"`);
}

module.exports = FileManager;
