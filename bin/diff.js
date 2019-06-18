//jshint esversion: 6
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const pug = require('pug');

const ROOT_DIR = path.resolve(path.dirname(process.argv[1]), '..');
const MODEL_DIR = path.resolve(ROOT_DIR, 'model');
const DIFF_LIST = path.resolve(ROOT_DIR, 'var', 'difflist');

function main() {
  mkdirp(path.dirname(DIFF_LIST), function() {
    fs.unlink(DIFF_LIST, function() {
      parseDir('.');
    });
  });
}

function parseDir(dirname) {
  var directory_path = path.resolve(MODEL_DIR, dirname);
  fs.readdir(directory_path, { withFileTypes: true }, function(err, list) {
    if (err) {
      throw err;
    }
    list.forEach(function(dirent) {
      if (dirent.isDirectory()) {
        parseDir(path.join(dirname, dirent.name));
      } else if (dirent.isFile() && dirent.name === "export.js") {
        parseFile(path.join(dirname, dirent.name));
      }
    });
  });
}

function parseFile(makefile) {
  var files = require(path.resolve(MODEL_DIR, makefile));
  var dir = path.dirname(makefile);
  files.forEach(function(file) {
    fs.readFile(
      path.resolve(MODEL_DIR, dir, file.name), { encoding: 'utf8' },
      function(err, data) {
        if(err) throw err;
        diffFile(path.join(dir, file.name), file.content.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n'), data);
      }
    );
  });
}

function diffFile(filename, expected, actual) {
  if (expected !== actual) {
    createTempFile(filename, expected);
    addToDiffList(filename);
  }
}

function createTempFile(filename, data) {
  var filepath = path.resolve(ROOT_DIR, 'tmp', filename);
  mkdirp(path.dirname(filepath), function() {
    fs.writeFile(
      filepath,
      data,
      function(err) { if (err) throw err; }
    );
  });
}

function addToDiffList(filename) {
  fs.writeFile(
    DIFF_LIST, filename.replace(/\\/g, '/') + '\n', { flag: 'a' },
    function() { /*console.log(filename);*/ }
  );
}

main();
