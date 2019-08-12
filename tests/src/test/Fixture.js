//jshint esversion:8
// native dependancies
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
// npm dependancies
const mkdirp = require('mkdirp');
const mustache = require('mustache');
const puppeteer = require('puppeteer').launch();
const resemble = require('node-resemble-js');
var sharp = null;
if (!process.send) sharp = require('sharp');
const sizeOf = promisify(require('image-size'));
// local dependancies

const AnkiManager = new(require(path.resolve(__dirname, 'AnkiManager')))();

const ROOT = process.env.ANKI_PUG_ROOT;
const Model = require(path.resolve(ROOT, 'src/diff/anki-pug-model'));

// model types
const MODEL_STD = 0;
const MODEL_CLOZE = 1;

function mkdirpPromise(path) {
  return new Promise(function(resolve, reject) {
    mkdirp(path, undefined, resolve);
  });
}

async function shot(html, viewport, screenshot) {
  const browser = await puppeteer;
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.setContent(html);
  await mkdirpPromise(path.dirname(screenshot.path));
  await page.screenshot(screenshot);
  setImmediate(_ => page.close());
}

function getModel(modelName) {
  var fullname = path.resolve(ROOT, 'model', modelName.replace(/:/g, path.sep), 'export.js');
  return new Model(fullname, modelName);
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
  return template.replace(/{{([^/#\^][^}]*)}}/g, '{{{$1}}}');
}

function getConfig(keyName) {
  var config = JSON.parse(
    fs.readFileSync(
      path.resolve(ROOT, 'config/default.json'), 'utf8'
    )
  );
  var keyValue = config;
  keyName.split('.').forEach(_ => keyValue = keyValue[_]);
  return keyValue;
}

class Fixture {
  constructor(options) {
    this.card = options.card;
    this.description = options.description;
    this.face = options.face;
    this.id = options.id;
    this.locals = options.locals;
    this.model = getModel(options.model);
    this.ok = options.ok;
    this.ord = options.ord;
    this.platform = options.platform;
    this.title = options.title;
    this.type = options.type;

    if (this.id) this.directory = path.resolve(ROOT, 'tests/out', this.id);
    this.locals.Card = this.card;
    this.locals.Type = this.model.name;
    this.viewport = Object.assign(getConfig(this.platform + '.viewport'), options.viewport);
    this.screenshot = options.screenshot || {};
    this.diffTemplate = promisify(fs.readFile)(path.join(__dirname, 'diff.html'), 'utf8');

    if (this.directory) mkdirp.sync(this.directory);
    this.ready = this.getRaw();
  }

  async getRaw() {
    await Promise.all([
      this.model.getTemplate(this.card + '_recto').assign(this, 'recto'),
      this.model.getTemplate(this.card + '_verso').assign(this, 'verso'),
      this.model.getTemplate('style').assign(this, 'css')
    ]);
    ['recto', 'verso'].forEach(
      f => ['pug', 'anki'].forEach(
        v => this[f][v].content = this.parse(this[f][v].content, f)
      )
    );
    return this;
  }

  async getRecto(version) {
    await this.ready;
    var template = this.recto[version].content;
    return mustache.render(
      template,
      this.locals
    );
  }

  async getVerso(version) {
    var locals = Object.assign({}, this.locals);
    locals.FrontSide = await this.getRecto(version);
    var template = this.verso[version].content;
    return mustache.render(
      template,
      locals
    );
  }

  parse(template, face) {
    if (this.type === MODEL_STD) return parseCondition(template);
    else return parseCondition(this.parseCloze(template, face));
  }

  parseCloze(template, face) {
    return template.replace(/{{cloze:([^}]*)}}/g, (match, field) => {
      var source = this.locals[field];
      return source
        .replace(
          RegExp(`{{c${this.ord + 1}::([^:}]*)(?:::([^}]*))?}}`, 'g'),
          (_, text, clue) => `<span class="cloze">${face === 'recto' ? '[' + (clue || '…') + ']' : text}</span>`
        )
        .replace(/{{c\d+::([^}:]*)(::[^}]*)?}}/g, '$1');
    });
  }

  async setVersion(version) {
    var html = await this.html(version);
    var dest = path.resolve(this.directory, version + '.png');
    var screenshot = Object.assign({ path: dest }, this.screenshot);
    await Promise.all([
      shot(html, this.viewport, screenshot),
      promisify(fs.writeFile)(path.resolve(this.directory, version + '.html'), html),
    ]);
    fs.writeFile(this.directory + '/' + version + '_recto_template.html', this.recto[version].content, () => {});
    fs.writeFile(this.directory + '/' + version + '_verso_template.html', this.verso[version].content, () => {});
    fs.writeFile(this.directory + '/' + version + '_css_template.html', this.css[version].content, () => {});
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
    if (
      size.width !== this.viewport.width ||
      size.height !== this.viewport.height &&
      !this.screenshot.fullPage
    ) {
      await promisify(fs.copyFile)(filename, filename + '.old');
      var height = this.screenshot.fullPage ? size.height : this.viewport.height;
      await sharp(filename + '.old').resize(this.viewport.width, height).toFile(filename);
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
    await new Promise(resolve => {
      data
        .getDiffImage()
        .pack()
        .pipe(fs.createWriteStream(resemblePath))
        .on('close', resolve);
    });
  }

  async setHtmlDiff() {
    this.htmlDiffFile = path.join(this.directory, 'index.html');
    var locals = this.asRaw({
      __dirname,
      pugRectoFile: this.recto.pug.path.replace(/\\/g, '\\\\'),
      pugVersoFile: this.verso.pug.path.replace(/\\/g, '\\\\'),
      cssFile: this.css.pug.path.replace(/\\/g, '\\\\'),
    });
    locals.directory = locals.directory.replace(/\\/g, '\\\\');
    var html = mustache.render(await this.diffTemplate, locals);
    await Promise.all([
      promisify(fs.writeFile)(this.htmlDiffFile, html),
      promisify(fs.writeFile)(this.directory + '/package.json', JSON.stringify({
        main: "index.html",
        name: this.title,
        fixture: this.asRaw()
      }, null, '\t')),
    ]);
  }

  async html(version) {
    var template = await promisify(fs.readFile)(
      path.resolve(__dirname, this.platform + '.mustache.html'), { encoding: 'utf8' }
    );
    var body = await (this.face === 'recto' ? this.getRecto(version) : this.getVerso(version));
    var locals = {
      css: this.css[version].content,
      body,
      port: await AnkiManager.getPort()
    };
    return mustache.render(template, locals);
  }

  asRaw(from) {
    var raw = from || {};
    ["card", "description", "diffTemplate", "directory", "face", "id", "locals",
      "ok", "platform", "title", "viewport"
    ].forEach(_ => {
      raw[_] = this[_];
    });
    raw.model = this.model.name;
    return raw;
  }

  static async close() {
    (await puppeteer).close();
  }
}

module.exports = Fixture;
