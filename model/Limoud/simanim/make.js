// jshint esversion:6
const fs = require('fs');

const mkdirp = require('mkdirp');
const pug = require('pug');

const list = [
  'Dinim',
  'Siman',
];

mkdirp.sync('out');
list.forEach(name => {
  fs.writeFileSync(`out/${name}_recto.html`, pug.renderFile(`${name}_recto.pug`));
  fs.writeFileSync(`out/${name}_verso.html`, pug.renderFile(`${name}_verso.pug`));
});
