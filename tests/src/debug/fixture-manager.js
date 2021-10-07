const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { promisify } = require('util');

const debug = require('debug');
const puppeteer = require('puppeteer');

const AnkiDbManager = require('../classes/AnkiDbManager');
const Fixture = require('../test/Fixture');

const log = debug('fixture-manager');

class FixtureManager {
  constructor(cid) {
    log('new FixtureManager', { cid });
    this.ready = this.construct(cid);
    this.openedFiles = [];
  }

  async construct(cid) {
    const options = {};
    const card = await AnkiDbManager.getCard(cid);
    const note = await card.getNote();
    const notetype = await note.getNotetype();

    options.card = await card.getName();
    options.locals = await note.getFieldsJSON();
    options.locals.Tags = await note.getTags();
    options.model = await notetype.getName();
    options.ord = await card.getOrd();
    options.type = await notetype.getType();

    options.face = await prompt('face ? recto/verso (verso): ', 'verso');
    options.platform = await prompt('platform ? mobile/win (mobile): ', 'mobile');
    this.options = options;
    this.version = await prompt('version ? anki/pug (pug): ', 'pug');
    this.fixture = await getFixture(options);
  }

  static close() {
    Fixture.close();
  }

  async show() {
    log('SHOW');
    await this.ready;
    log('ready');
    this.browser = await puppeteer.launch({
      args: ['--auto-open-devtools-for-tabs', '--start-maximized'],
      headless: false,
    });
    log('puppeteer opened');
    this.page = await this.browser.newPage();
    log('new page created');
    await this.page.setViewport({ height: 560, width: 360 });
    log('new page resized');
    await this.fill();
    log('filled');
    this.watch();
    log('watching');
    this.page.on('close', () => {
      this.unwatch();
      this.browser.close();
    });
  }

  get html() {
    return (async() => {
      let content = null;

      while (!content) {
        try {
          content = await this.fixture.html(this.version);
        } catch (error) {
          if (error.message === `Carte ${this.fixture.card} introuvable.`) {
            log(error.message);
            await waitFile(this.fixture.model.maker.fullname);
            this.fixture = await getFixture(this.options);
            continue;
          }
          throw error;
        }
      }
      return content;
    })();
  }

  async fill() {
    await this.page.setContent(await this.html);
  }

  async parseLayouts() {
    const layouts = [].concat.apply([], await Promise.all(this.fromFiles.map(pugLayouts)));

    this.filesToWatch = this.fromFiles.concat.apply(
      this.fromFiles,
      layouts
    ).filter(_ => _);
  }

  async watch() {
    this.fromFiles = await watchFor(this.fixture, this.version);
    let i;

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

async function watchFor(fixture, version) {
  await fixture.ready;
  const files = [];

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
  const content = await promisify(fs.readFile)(filename, 'utf8');
  const firstLine = content.replace(/\r\n?/g, '\n').split('\n')[0];

  if (!firstLine.indexOf('extends ')) {
    let file = path.join(path.dirname(filename), firstLine.split(' ')[1]);

    file += path.extname(file) ? '' : '.pug';
    let children = null;

    try {
      children = await pugLayouts(file);
    } catch (e) {
      e.message += `\n\ton ${filename}`;
      throw e;
    }
    return [file].concat(children);
  }
}

function run(command) {
  childProcess.spawn(command, { detached: true, stdio: 'ignore', shell: true }).unref();
}

function viewFile(filename) {
  run(`"C:\\Program Files\\Sublime Text 3\\sublime_text.exe" "${filename}"`);
}

function waitFile(filename) {
  console.log(`wait file:<${filename}>`);
  const directory = path.dirname(filename);
  const basename = path.basename(filename);

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
  let fixture;

  try {
    fixture = new Fixture(options);
  } catch (error) {
    if (e.message.startsWith('Cannot find module')) {
      fixture = await waitFile(error.message.split("'")[1]);
      return getFixture(options);
    }
    throw error;
  }
  return fixture;
}

module.exports = FixtureManager;
