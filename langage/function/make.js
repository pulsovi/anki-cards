const pug = require('pug');
const fs = require('fs');

const max = 5;

const th = [
  'first',
  'second',
  'third',
  'fourth',
  'fifth'
];

const list = [
  'nom'
];

list.forEach(function(name) {
  let recto = pug.compileFile(name + '_recto.pug');
  let verso = pug.compileFile(name + '_verso.pug');
  for (let i = 1; i <= max; ++i) {
    fs.writeFileSync('out/' + i + name + '_recto.html', recto({th:th[i-1], i:i, max: max}));
    fs.writeFileSync('out/' + i + name + '_verso.html', verso({th:th[i-1], i:i, max: max}));
  }
});
