//jshint esversion:8
// native dependancies
const fs = require('fs');
const path = require('path');
const readline = require('readline');
// npm dependancies
const config = require('config');
const mkdirp = require('mkdirp');
const puppeteer = require('puppeteer');
const resemble = require('node-resemble-js');
const sharp = require('sharp');
const uniqid = require('uniqid');
// local dependancies
const AnkiDbManager = require('./AnkiDbManager');

const ROOT = process.env.ANKI_PUG_ROOT;
const fixturesPath = path.resolve(ROOT, 'tests/fixture/fixtures.json');

main()
  .catch(e => {
    console.log(e);
  });

async function main() {
  var JSONfixtures = await fs.promises.readFile(fixturesPath, 'utf8');
  var fixtures = JSON.parse(JSONfixtures);
  var fixture = await createFixture();
  fixtures.push(fixture);
  fs.writeFile(fixturesPath, JSON.stringify(fixtures, null, '\t') + '\n', () => {});
  console.log('tests/bin/test.sh', fixture.id);
}

async function createFixture() {
  var fixture = {};
  var cid = '';
  if (process.argv.length > 2) cid = process.argv[2];
  else cid = await prompt('create from card id ? cid/n (no): ');
  fixture = await createFixtureFromCid(cid);
  var file = (await prompt('base image file : ')).replace(/"/g, "");
  fixture.ok = false;
  if (file) {
    await setFixtureBase(fixture, file);
    if (await prompt('is the base image fit well ? y/n (no): ') === 'y')
      fixture.ok = true;
  }
  return fixture;
}

async function createFixtureFromCid(cid) {
  var fixture = {};
  var nid = await AnkiDbManager.getCardNote(cid);
  var mid = await AnkiDbManager.getNoteModel(nid);
  fixture.card = await AnkiDbManager.getCardName(cid);
  fixture.cid = cid;
  fixture.id = uniqid();
  fixture.locals = cleanLocals(await AnkiDbManager.getNoteFields(nid));
  fixture.locals.Tags = await AnkiDbManager.getNoteTags(nid);
  fixture.note = await AnkiDbManager.getModelName(mid);
  fixture.ord = await AnkiDbManager.getCardOrd(cid);
  fixture.type = await AnkiDbManager.getModelType(mid);

  fixture.title = await prompt('title : ');
  fixture.description = await prompt('description : ');
  fixture.face = await prompt('face ? recto/verso : ');
  fixture.platform = await prompt('platform ? mobile/win : ');
  return fixture;
}

async function setFixtureBase(fixture, image) {
  var dest = path.resolve(ROOT, 'tests/out', fixture.id, 'base.png');
  mkdirp.sync(path.dirname(dest));
  await sharp(image)
    .extract({
      width: 1080,
      height: 1690,
      top: 72,
      left: 0
    })
    .resize(360, 560)
    .toFile(dest);
}

function prompt(message) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(message, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function cleanLocals(locals) {
  Object.keys(locals).forEach(k => {
    if (locals[k] === '') delete locals[k];
  });
  return locals;
}
