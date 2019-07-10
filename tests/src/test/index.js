//jshint esversion:8
// native dependancies
const fs = require('fs');
const path = require('path');
// local dependancies
const Fixture = require('./Fixture');

const ROOT = process.env.ANKI_PUG_ROOT;

const fixturesPath = path.resolve(ROOT, 'tests/fixture/fixtures.json');
const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

// main
fixtures.forEach(manage_fixture);

async function manage_fixture(options) {
  const fixture = new Fixture(options);
  await Promise.all([
    fixture.setPug(),
    fixture.setAnki(),
    fixture.setBase(),
  ]);
  await Promise.all([
    fixture.setResemble('base', 'anki'),
    fixture.setResemble('anki', 'pug'),
  ]);
  fixture.setHtmlDiff();
  if(fixture.diff) console.log(fixture.htmlDiffFile, fixture.diffString);
}
