//jshint esversion:8
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
//npm
const uniqid = require('uniqid');

const ROOT = process.env.ANKI_PUG_ROOT;

main().catch(e => { console.log('main error:', e); });

async function main() {
  const fixtureToDup = process.argv[2];
  const fixturesPath = path.resolve(ROOT, 'tests/fixture/fixtures.json');
  var fixtures = JSON.parse(await promisify(fs.readFile)(fixturesPath, 'utf8'));
  var from = fixtures.find(f => f.id === fixtureToDup);
  if (!from) {
    throw new ReferenceError(`Unable to find ${fixtureToDup} fixture.`);
  }
  var to = Object.assign({}, from);
  to.id = uniqid();
  fixtures.push(to);
  fs.writeFile(fixturesPath, JSON.stringify(fixtures, null, '\t'), err => { if (err) throw err; });
  await promisify(fs.mkdir)(path.resolve(ROOT, `tests/out/${to.id}`));
  fs.copyFile(
    path.resolve(ROOT, `tests/out/${fixtureToDup}/base.png`),
    path.resolve(ROOT, `tests/out/${to.id}/base.png`),
    err => {
      if (!err) return;
      if (err.code === 'ENOENT')
        console.log('Le fichier base.png, introuvable, n\'a pas pu être copié.');
      else throw err;
    }
  );
  console.log(to.id);
}
