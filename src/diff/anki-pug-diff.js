// jshint esversion:8
// native dependancies
const path = require("path");
// local dependancies
const DiffManager = require("./anki-pug-diff-manager");

const { "anki-pug-root": ROOT } = require("../../config/global");

const diffManager = new DiffManager(path.resolve(ROOT, "model"));

process.env.ANKI_PUG_ROOT = ROOT;

diffManager.processAll().catch(error => console.error("main error: ", error));
