const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { promisify } = require('util');

const log = require('debug')('anki:new-fixture');
const mkdirp = require('mkdirp');
const sharp = require('sharp');
const uniqid = require('uniqid');

const AnkiDbManager = require('../classes/AnkiDbManager');

const ROOT = path.join(__dirname, '../../..');
const fixturesPath = path.resolve(ROOT, 'tests/fixture/fixtures.json');

main()
  .catch(error => { log(error); });

async function main() {
  const JSONfixtures = await promisify(fs.readFile)(fixturesPath, 'utf8');
  const fixtures = JSON.parse(JSONfixtures);
  const fixture = await createFixture();

  fixtures.push(fixture);
  fs.writeFile(fixturesPath, `${JSON.stringify(fixtures, null, '\t')}\n`, () => {});
  log('tests/bin/test.sh', fixture.id);
}

async function createFixture() {
  let fixture = {};
  let cid = '';

  // eslint-disable-next-line prefer-destructuring
  if (process.argv.length > 2) cid = process.argv[2];
  else cid = await prompt('create from card id ? cid/n (no): ');
  fixture = await createFixtureFromCid(cid);
  const file = (await prompt('base image file : ')).replace(/"/gu, '');

  fixture.ok = false;
  if (file) {
    await setFixtureBase(fixture, file);
    if (await prompt('is the base image fit well ? y/n (no): ') === 'y')
      fixture.ok = true;
  }
  return fixture;
}

async function createFixtureFromCid(cid) {
  const fixture = {};
  const card = await AnkiDbManager.getCard(cid);
  const note = await card.getNote();
  const notetype = await note.getNotetype();

  fixture.card = await card.getName();
  fixture.cid = cid;
  fixture.id = uniqid();
  fixture.locals = cleanLocals(await note.getFieldsJSON());
  fixture.locals.Tags = await note.getTags();
  fixture.model = await notetype.getName();
  fixture.ord = await card.getOrd();
  fixture.type = await notetype.getType();

  fixture.title = await prompt('title (Title): ', 'Title');
  fixture.description = await prompt('description (Description): ', 'Description');
  fixture.face = await prompt('face ? recto/verso (verso): ', 'verso');
  fixture.platform = await prompt('platform ? mobile/win (mobile): ', 'mobile');
  return fixture;
}

async function setFixtureBase(fixture, image) {
  const dest = path.resolve(ROOT, 'tests/out', fixture.id, 'base.png');

  mkdirp.sync(path.dirname(dest));
  await sharp(image)
    .extract({
      height: 1690,
      left: 0,
      top: 72,
      width: 1080,
    })
    // eslint-disable-next-line no-magic-numbers
    .resize(360, 560)
    .toFile(dest);
}

function prompt(message, defaultValue) {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(message, answer => {
      rl.close();
      resolve(answer || defaultValue || '');
    });
  });
}

function cleanLocals(locals) {
  Object.keys(locals).forEach(key => {
    if (locals[key] === '') Reflect.deleteProperty(locals, key);
  });
  return locals;
}
