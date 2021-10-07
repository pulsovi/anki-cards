Error.stackTraceLimit = 100;
if (process.argv.includes('-v')) {
  if (process.env.DEBUG) process.env.DEBUG += ',diff*';
  else process.env.DEBUG = 'diff*,anki*';
}

const path = require('path');

const { 'anki-pug-root': ROOT } = require('../../config/global');

const DiffManager = require('./anki-pug-diff-manager');

const diffManager = new DiffManager(path.resolve(ROOT, 'model'));

process.env.ANKI_PUG_ROOT = ROOT;

diffManager.processAll().catch(error => console.error('main error: ', error));
