//jshint esversion:8
const AnkiDbManager = require('../new-fixture/AnkiDbManager');
const child_process = require('child_process');
const Fixture = require('../test/Fixture');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const readline = require('readline');
const { promisify } = require('util');


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

function watchFor(fixture, version) {
  var files = [];
  if (version === 'pug') {
    files.push(fixture.note.template[fixture.card + '_recto'].pugFile);
    files.push(fixture.note.template['style.css'].pugFile);
    if (fixture.face === 'verso')
      files.push(fixture.note.template[fixture.card + '_verso'].pugFile);
  } else {
    files.push(fixture.note.template[fixture.card + '_recto'].fullname);
    files.push(fixture.note.template['style.css'].fullname);
    if (fixture.face === 'verso')
      files.push(fixture.note.template[fixture.card + '_verso'].fullname);
  }
  return files;
}


async function pugLayouts(filename) {
  var content = await promisify(fs.readFile)(filename, 'utf8');
  var firstLine = content.replace(/\r\n?/g, '\n').split('\n')[0];
  if (!firstLine.indexOf('extends ')) {
    var file = path.join(path.dirname(filename), firstLine.split(' ')[1]);
    file += path.extname(file) ? '' : '.pug';
    var children = null;
    try {
      children = await pugLayouts(file);
    } catch (e) {
      e.message += '\n\ton ' + filename;
      throw e;
    }
    return [file].concat(children);
  }
}

function run(command) {
  child_process.spawn(command, { detached: true, stdio: 'ignore', shell: true }).unref();
}

function viewFile(filename) {
  run(`"C:\\Program Files\\Sublime Text 3\\sublime_text.exe" "${filename}"`);
}

class FixtureManager {
  constructor(cid) {
    this.ready = this.construct(cid);
    this.openedFiles = [];
  }

  async construct(cid) {
    var options = {};
    var nid = await AnkiDbManager.getCardNote(cid);
    var mid = await AnkiDbManager.getNoteModel(nid);
    options.card = await AnkiDbManager.getCardName(cid);
    options.locals = await AnkiDbManager.getNoteFields(nid);
    options.locals.Tags = await AnkiDbManager.getNoteTags(nid);
    options.note = await AnkiDbManager.getModelName(mid);
    options.ord = await AnkiDbManager.getCardOrd(cid);
    options.type = await AnkiDbManager.getModelType(mid);

    options.face = await prompt('face ? recto/verso (verso): ', 'verso');
    options.platform = await prompt('platform ? mobile/win (mobile): ', 'mobile');
    this.version = await prompt('version ? anki/pug (pug): ', 'pug');
    this.fixture = new Fixture(options);
  }

  async show(watch) {
    await this.ready;
    this.html = await this.fixture.html(this.version);
    this.browser = await puppeteer.launch({ headless: false });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ height: 560, width: 360 });
    await this.fill();
    this.watch();
    this.page.on('close', _ => {
      this.unwatch();
      this.browser.close();
      Fixture.close();
    });
  }

  async fill() {
    await this.page.setContent(this.html);
  }

  async parseLayouts() {
    var layouts = [].concat.apply([], await Promise.all(this.fromFiles.map(pugLayouts)));
    this.filesToWatch = this.fromFiles.concat.apply(
      this.fromFiles,
      layouts
    ).filter(_ => _);
  }

  async watch() {
    this.fromFiles = watchFor(this.fixture, this.version);
    var i;
    try {
      await this.parseLayouts();
    } catch (e) {
      console.log('watch error:', e.message);
      this.browser.close();
      this.fromFiles.forEach(f => fs.watchFile(f, _ => {
        this.fromFiles.forEach(f => fs.unwatchFile(f));
        this.show();
      }));
    }
    try {
      for (i = 0; i < this.filesToWatch.length; ++i) {
        fs.watchFile(this.filesToWatch[i], _ => this.reload());
        this.showFile(this.filesToWatch[i]);
      }
    } catch (e) {
      console.log('watch error:', e.message, '\n\t', this.filesToWatch[i]);
    }
  }

  showFile(filename){
    if(!~this.openedFiles.indexOf(filename)) {
      this.openedFiles.push(filename);
      viewFile(filename);
    }
  }

  async reload() {
    console.log('file modified');
    this.unwatch();
    this.fixture.note.reload();
    this.html = await this.fixture.html(this.version);
    this.fill();
    this.watch();
  }

  unwatch() {
    this.filesToWatch.forEach(_ => {
      fs.unwatchFile(_);
    });
  }
}

module.exports = FixtureManager;
