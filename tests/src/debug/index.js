//jshint esversion:8
// native dependancies
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
//npm dependencies
const puppeteer = require('puppeteer');
const uniqid = require('uniqid');
// local dependancies
const AnkiDbManager = require('../new-fixture/AnkiDbManager');
const Fixture = require(path.resolve(__dirname, '../test/Fixture'));
const ROOT = process.env.ANKI_PUG_ROOT;

// main
main()
  .then(_ => {
    Fixture.close();
  })
  .catch(e => {
    console.log('Main error:', e);
    Fixture.close();
  });

var page = null;
var fixture = null;
var version = null;

async function main() {
  var cid = process.argv[2];
  var options = await createFixtureFromCid(cid);
  fixture = new Fixture(options);
  version = await prompt('version ? anki/pug (pug): ', 'pug');
  var html = await fixture.html(version);
  var browser = await puppeteer.launch({ headless: false });
  page = await browser.newPage();
  await page.setViewport({ height: 560, width: 360 });
  await page.setContent(html);
  watch(fixture, version);
}

async function createFixtureFromCid(cid) {
  var fixture = {};
  var nid = await AnkiDbManager.getCardNote(cid);
  var mid = await AnkiDbManager.getNoteModel(nid);
  fixture.card = await AnkiDbManager.getCardName(cid);
  fixture.cid = cid;
  fixture.id = uniqid();
  fixture.locals = await AnkiDbManager.getNoteFields(nid);
  fixture.locals.Tags = await AnkiDbManager.getNoteTags(nid);
  fixture.note = await AnkiDbManager.getModelName(mid);
  fixture.ord = await AnkiDbManager.getCardOrd(cid);
  fixture.type = await AnkiDbManager.getModelType(mid);

  fixture.face = await prompt('face ? recto/verso (verso): ', 'verso');
  fixture.platform = await prompt('platform ? mobile/win (mobile): ', 'mobile');
  return fixture;
}

function prompt(message, defaultValue) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(message, (answer) => {
      rl.close();
      resolve(answer || defaultValue || '');
    });
  });
}

async function reload(){
  fixture.note.reload();
  page.setContent(await fixture.html(version));
}

function watch(fixture, version){
  var filesToWatch = [];
  if(version === 'pug'){
    filesToWatch.push(fixture.note.template[fixture.card + '_recto'].pugFile);
    filesToWatch.push(fixture.note.template['style.css'].pugFile);
    if(fixture.face === 'verso')
      filesToWatch.push(fixture.note.template[fixture.card + '_verso'].pugFile);
  } else {
    filesToWatch.push(fixture.note.template[fixture.card + '_recto'].fullname);
    filesToWatch.push(fixture.note.template['style.css'].fullname);
    if(fixture.face === 'verso')
      filesToWatch.push(fixture.note.template[fixture.card + '_verso'].fullname);
  }
  filesToWatch.forEach(filename=>fs.watchFile(filename, reload));
  page.on('close', _=>filesToWatch.forEach(filename=>fs.unwatchFile(filename)));
}
