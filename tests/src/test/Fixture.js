//jshint esversion:8
// native dependancies
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
// npm dependancies
const config = require('config');
const mkdirp = require('mkdirp');
const mustache = require('mustache');
const puppeteer = require('puppeteer');
const resemble = require('node-resemble-js');
const sharp = require('sharp');
const sizeOf = promisify(require('image-size'));
// local dependancies
const AnkiManager = new(require('./AnkiManager'))();

const ROOT = process.env.ANKI_PUG_ROOT;
const Note = require(path.resolve(ROOT, 'src/diff/anki-pug-note'));

function mkdirpPromise(path) {
  return new Promise(function(resolve, reject) {
    mkdirp(path, undefined, (a) => resolve(a));
  });
}

async function shot(html, dest, viewport) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.setContent(html);
  await mkdirpPromise(path.dirname(dest));
  await page.screenshot({ path: dest });
  await browser.close();
}

function getNote(noteName) {
  var fullname = path.resolve(ROOT, 'model', noteName.replace(/:/g, path.sep), 'export.js');
  var maker = {
    fullname,
    name: path.basename(fullname),
    path: path.dirname(fullname)
  };
  return new Note(maker, noteName);
}

function fileExist(filename) {
  return new Promise((resolve, reject) => {
    fs.stat(filename, (err, stat) => {
      if (!err) return resolve(stat);
      if (err.code === 'ENOENT') return resolve(false);
      throw err;
    });
  });
}

function resembleData(file1, file2) {
  return new Promise(resolve => {
    resemble(file1).compareTo(file2).onComplete(resolve);
  });
}

function parseCondition(template) {
  return template.replace(/{{([#^/][a-zA-Z0-9]*)}}/g, '{$1}');
}

class Fixture {
  constructor(options) {
    this.card = options.card;
    this.description = options.description;
    this.face = options.face;
    this.id = options.id;
    this.locals = options.locals;
    this.note = getNote(options.note).parse();
    this.ok = options.ok;
    this.platform = options.platform;
    this.title = options.title;

    this.directory = path.resolve(ROOT, 'tests/out', this.id);
    this.locals.Card = this.card;
    this.locals.Type = this.note.name;
    this.viewport = options.viewport || config.get(this.platform + '.viewport');
    this.diffTemplate = fs.promises.readFile(path.join(__dirname, 'diff.html'), 'utf8');

    mkdirp.sync(this.directory);
  }

  getRaw(version) {
    return {
      recto: parseCondition(this.note.template[this.card + '_recto'][version]),
      verso: parseCondition(this.note.template[this.card + '_verso'][version]),
      css: this.note.template['style.css'][version]
    };
  }

  getRecto(version) {
    var template = this.getRaw(version).recto;
    return mustache.render(
      template,
      this.locals,
      null,
      ['{', '}']
    );
  }

  getVerso(version) {
    var template = this.getRaw(version).verso;
    var locals = Object.assign({}, this.locals);
    locals.FrontSide = this.getRecto(version);

    return mustache.render(
      template,
      locals,
      null,
      ['{', '}']
    );
  }

  async setVersion(version) {
    var html = await this.html(version);
    var dest = path.resolve(this.directory, version + '.png');
    await Promise.all([
      shot(html, dest, this.viewport),
      fs.promises.writeFile(path.resolve(this.directory, version + '.html'), html),
    ]);
    fs.writeFile(this.directory + '/' + version + '_recto_template.html', this.getRaw(version).recto, () => {});
    fs.writeFile(this.directory + '/' + version + '_verso_template.html', this.getRaw(version).verso, () => {});
    fs.writeFile(this.directory + '/' + version + '_css_template.html', this.getRaw(version).css, () => {});
  }

  async setPug() {
    await this.setVersion('pug');
  }

  async setAnki() {
    await this.setVersion('anki');
  }

  async setBase() {
    var filename = path.join(this.directory, 'base.png');
    if (!await fileExist(filename)) return;
    var size = await sizeOf(filename);
    if (size.width !== this.viewport.width || size.height !== this.viewport.height) {
      await fs.promises.copyFile(filename, filename + '.old');
      await sharp(filename + '.old').resize(this.viewport.width, this.viewport.height).toFile(filename);
    }
  }

  async setResemble(version1, version2) {
    var _this = this;
    var file1 = this.directory + '/' + version1 + '.png';
    var file2 = this.directory + '/' + version2 + '.png';
    if (!await fileExist(file1) || !await fileExist(file2)) return;
    var data = await resembleData(file1, file2);
    var diffVal = parseFloat(data.misMatchPercentage);
    this.diffString = (this.diffString || '') + version1 + '-' + version2 + ':' + data.misMatchPercentage + '; ';
    if (diffVal > 0) {
      this.diff = this.diff || {};
      this.diff[version1 + '-' + version2] = data.misMatchPercentage;
    }
    var resemblePath = _this.directory + '/' + version1 + '-' + version2 + '.png';
    data
      .getDiffImage()
      .pack()
      .pipe(fs.createWriteStream(resemblePath));
  }

  async setHtmlDiff() {
    this.htmlDiffFile = path.join(this.directory, 'index.html');
    var html = mustache.render(await this.diffTemplate, this);
    await Promise.all([
      fs.promises.writeFile(this.htmlDiffFile, html),
      fs.promises.writeFile(this.directory + '/package.json', JSON.stringify({
        main: "index.html",
        name: this.title
      })),
    ]);
  }

  async html(version) {
    var template = fs.readFileSync(
      path.resolve(__dirname, this.platform + '.mustache.html'), { encoding: 'utf8' }
    );
    var body = this.face === 'recto' ? this.getRecto(version) : this.getVerso(version);
    var locals = {
      css: this.note.template['style.css'][version],
      body,
      port: await AnkiManager.getPort()
    };
    return mustache.render(template, locals);
  }
}

module.exports = Fixture;
