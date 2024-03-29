// Node packages
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

// npm packages
const { isFunction } = require('lodash');

// Local files
const delayed = require('./src/utils/delayed');
// Globals
const action = {};

// Start watching files
fs.watch(__dirname, { recursive: true }, (event, filename) => {
  if (isFunction(action[filename])) action[filename](event, filename);
  else console.log({ event, filename });
});

// add file watcher for update anki ext
action['packages\\anki-addon-import-export\\__init__.py'] = delayed((event, filename) => {
  const from = path.resolve(__dirname, filename);
  const to = path.resolve(process.env.APPDATA, 'Anki2\\addons21\\import-export\\__init__.py');

  if (event !== 'change') return;
  fs.copyFile(from, to, err => console.info('anki extension updated', { err }));
  childProcess.exec('TASKKILL /T /F /IM anki.exe');
});
