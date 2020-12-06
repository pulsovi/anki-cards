// Node packages
const childProcess = require('child_process');
const fs = require('fs');
fs.path = require('path'); // eslint-disable-line padding-line-between-statements

// npm packages
const { isFunction } = require('underscore');

// Local files
const delayed = require('./src/utils/delayed');
// Globals
const action = {};

// Start watching files
fs.watch(__dirname, { recursive: true }, (event, filename) => {
  if (isFunction(action[filename])) action[filename](event, filename);
});

// add file watcher for update anki ext
action['src\\anki-addons\\import-export\\__init__.py'] = delayed((event, filename) => {
  const from = fs.path.resolve(__dirname, filename);
  // eslint-disable-next-line no-process-env
  const to = fs.path.resolve(process.env.APPDATA, 'Anki2\\addons21\\import-export\\__init__.py');

  if (event !== 'change') return;
  fs.copyFile(from, to, err => console.info('anki extension updated', { err }));
  childProcess.exec('TASKKILL /T /F /IM anki.exe');
});
