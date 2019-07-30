//jshint esversion:8
// native dependancies
const path = require('path');
// local dependancies
const DiffManager = require('./anki-pug-diff-manager');
const ROOT = process.env.ANKI_PUG_ROOT;

var diffManager = new DiffManager(path.resolve(ROOT, 'model'));
diffManager.processAll().catch(e=>console.log('main error: ', e));
