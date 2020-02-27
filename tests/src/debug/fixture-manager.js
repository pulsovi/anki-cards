//jshint esversion:8
const AnkiDbManager = require('../new-fixture/AnkiDbManager');
const child_process = require('child_process');
const Fixture = require('../test/Fixture');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const readline = require('readline');
const { promisify } = require('util');

const ROOT = process.env.ANKI_PUG_ROOT;
const FileManager = require(path.resolve(ROOT, 'src/diff/file_manager'));


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

async function watchFor(fixture, version) {
  await fixture.ready;
  var files = [];
  if (version === 'pug') {
    files.push(fixture.recto.pug.path);
    files.push(fixture.css.pug.path);
    if (fixture.face === 'verso')
      files.push(fixture.verso.pug.path);
  } else {
    files.push(fixture.recto.anki.path);
    files.push(fixture.css.anki.path);
    if (fixture.face === 'verso')
      files.push(fixture.verso.anki.path);
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

function waitFile(filename) {
  console.log('wait file:<' + filename + '>');
  var directory = path.dirname(filename);
  var basename = path.basename(filename);
  return new Promise((resolve, reject) => {
    var watcher = fs.watch(directory, (_, name) => {
      if (name === basename) {
        watcher.close();
        resolve(filename);
      }
    });
  });
}

async function getFixture(options) {
  var fixture;
  try {
    fixture = new Fixture(options);
  } catch (e) {
    if (!e.message.indexOf('Cannot find module')) {
      fixture = await waitFile(e.message.split("'")[1]);
      return getFixture(options);
    }
    throw e;
  }
  return fixture;
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
    options.model = await AnkiDbManager.getModelName(mid);
    options.ord = await AnkiDbManager.getCardOrd(cid);
    options.type = await AnkiDbManager.getModelType(mid);

    options.face = await prompt('face ? recto/verso (verso): ', 'verso');
    options.platform = await prompt('platform ? mobile/win (mobile): ', 'mobile');
    this.options = options;
    this.version = await prompt('version ? anki/pug (pug): ', 'pug');
    this.fixture = await getFixture(options);
  }

  static close() {
    Fixture.close();
  }

  async show(watch) {
    await this.ready;
    this.browser = await puppeteer.launch({
      headless: false,
      args: ['--auto-open-devtools-for-tabs', '--start-maximized']
    });
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

  get html() {
    return (async _ => {
      var content = null;
      while (!content) {
        try {
          content = await this.fixture.html(this.version);
        } catch (e) {
          if (e.message === `Carte ${this.fixture.card} introuvable.`) {
            console.log(e.message);
            await waitFile(this.fixture.model.maker.fullname);
            this.fixture = await getFixture(this.options);
            continue;
          }
          throw e;
        }
      }
      return content;
    })();
  }

  async fill() {
    await this.page.setContent(await this.html);
  }

  async parseLayouts() {
    var layouts = [].concat.apply([], await Promise.all(this.fromFiles.map(pugLayouts)));
    this.filesToWatch = this.fromFiles.concat.apply(
      this.fromFiles,
      layouts
    ).filter(_ => _);
  }

  async watch() {
    this.fromFiles = await watchFor(this.fixture, this.version);
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
        fs.watchFile(this.filesToWatch[i], this.reload.bind(this, this.filesToWatch[i]));
        this.showFile(this.filesToWatch[i]);
      }
    } catch (e) {
      console.log('watch error:', e.message, '\n\t', this.filesToWatch[i]);
    }
  }

  showFile(filename) {
    if (!~this.openedFiles.indexOf(filename)) {
      this.openedFiles.push(filename);
      viewFile(filename);
    }
  }

  async reload(filename) {
    console.log('file modified:', filename);
    this.unwatch();
    this.fixture = await getFixture(this.options);
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
