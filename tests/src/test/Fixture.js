// native dependancies
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// npm dependancies
const mkdirp = require('mkdirp');
const mustache = require('mustache');
const puppeteer = require('puppeteer').launch();
const resemble = require('node-resemble-js');
const sharp = require('sharp');
const sizeOf = promisify(require('image-size'));

// local dependancies
const AnkiManager = require('./AnkiManager');

const ankiManager = new AnkiManager();

const ROOT = process.env.ANKI_PUG_ROOT;
// eslint-disable-next-line import/no-dynamic-require
const Model = require(path.resolve(ROOT, 'src/diff/anki-pug-model'));

function mkdirpPromise(pathname) {
  return new Promise(resolve => {
    mkdirp(pathname, null, resolve);
  });
}

async function shot(html, viewport, screenshot) {
  const browser = await puppeteer;
  const page = await browser.newPage();

  await page.setViewport(viewport);
  await page.setContent(html);
  await mkdirpPromise(path.dirname(screenshot.path));
  await page.screenshot(screenshot);
  setImmediate(() => page.close());
}

function getModel(modelName) {
  const fullname = path.resolve(ROOT, 'model', modelName.replace(/:/gu, path.sep), 'export.js');

  return new Model(fullname, modelName);
}

function fileExist(filename) {
  return new Promise(resolve => {
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
  return template.replace(/\{\{(?<field>[^/#^][^}]*)\}\}/gu, '{{{$1}}}');
}

function getConfig(keyName) {
  const config = JSON.parse(fs.readFileSync(path.resolve(ROOT, 'config/default.json'), 'utf8'));
  let keyValue = config;

  keyName.split('.').forEach(part => {
    keyValue = keyValue[part];
  });
  return keyValue;
}

class Fixture {
  constructor(options) {
    [
      'card',
      'description',
      'diff',
      'face',
      'id',
      'locals',
      'ok',
      'ord',
      'platform',
      'title',
      'type',
    ].forEach(field => {
      this[field] = options[field];
    });
    this.model = getModel(options.model);

    if (this.id) this.directory = path.resolve(ROOT, 'tests/out', this.id);
    this.locals.Card = this.card;
    this.locals.Type = this.model.name;
    this.viewport = Object.assign(getConfig(`${this.platform}.viewport`), options.viewport);
    this.screenshot = options.screenshot || {};
    this.diffTemplate = promisify(fs.readFile)(path.join(__dirname, 'diff.html'), 'utf8');

    if (this.directory) mkdirp.sync(this.directory);
    this.ready = this.getRaw();
  }

  async getRaw() {
    await Promise.all([
      this.model.getTemplate(`${this.card}_recto`).assign(this, 'recto'),
      this.model.getTemplate(`${this.card}_verso`).assign(this, 'verso'),
      this.model.getTemplate('style').assign(this, 'css'),
    ]);
    ['recto', 'verso'].forEach(face => {
      ['pug', 'anki'].forEach(version => {
        this[face][version].content = this.parse(this[face][version].content, face);
      });
    });
    return this;
  }

  async getRecto(version) {
    await this.ready;
    const template = this.recto[version].content;

    return mustache.render(template, this.locals);
  }

  async getVerso(version) {
    const locals = { ...this.locals };

    locals.FrontSide = await this.getRecto(version);
    const template = this.verso[version].content;

    return mustache.render(template, locals);
  }

  parse(template, face) {
    if (this.type === Fixture.MODEL_STD) return parseCondition(template);
    return parseCondition(this.parseCloze(template, face));
  }

  parseCloze(template, face) {
    return template.replace(/\{\{cloze:(?<fld>[^}]*)\}\}/gu, (match, field) => {
      const source = this.locals[field];

      return source
        .replace(
          RegExp(`{{c${this.ord + 1}::(?<clozeText>[^:}]*)(?:::(?<hint>[^}]*))?}}`, 'gu'),
          (_, text, clue) => `<span class="cloze">${face === 'recto' ? `[${clue || '…'}]` : text}</span>`
        )
        .replace(/\{\{c\d+::(?<clozeText>[^}:]*)(?:::(?<hint>[^}]*))?\}\}/gu, '$1');
    });
  }

  async setVersion(version) {
    const html = await this.html(version);
    const dest = path.resolve(this.directory, `${version}.png`);
    const screenshot = { path: dest, ...this.screenshot };

    await Promise.all([
      shot(html, this.viewport, screenshot),
      promisify(fs.writeFile)(path.resolve(this.directory, `${version}.html`), html),
    ]);
    fs.writeFile(`${this.directory}/${version}_recto_template.html`, this.recto[version].content, () => {});
    fs.writeFile(`${this.directory}/${version}_verso_template.html`, this.verso[version].content, () => {});
    fs.writeFile(`${this.directory}/${version}_css_template.html`, this.css[version].content, () => {});
  }

  async setPug() {
    await this.setVersion('pug');
  }

  async setAnki() {
    await this.setVersion('anki');
  }

  async setBase() {
    const filename = path.join(this.directory, 'base.png');

    if (!await fileExist(filename)) return;
    const size = await sizeOf(filename);

    if (
      size.width !== this.viewport.width ||
      (size.height !== this.viewport.height && !this.screenshot.fullPage)
    ) {
      await promisify(fs.copyFile)(filename, `${filename}.old`);
      const height = this.screenshot.fullPage ? size.height : this.viewport.height;

      await sharp(`${filename}.old`).resize(this.viewport.width, height).toFile(filename);
    }
  }

  async setResemble(version1, version2) {
    const file1 = `${this.directory}/${version1}.png`;
    const file2 = `${this.directory}/${version2}.png`;

    if (!await fileExist(file1) || !await fileExist(file2)) return;
    const data = await resembleData(file1, file2);
    const diffVal = parseFloat(data.misMatchPercentage);

    this.diffString = `${(this.diffString || '') + version1}-${version2}:${diffVal}; `;
    this.diff = this.diff || {};
    this.diff[`${version1}-${version2}`] = data.misMatchPercentage;
    const resemblePath = `${this.directory}/${version1}-${version2}.png`;

    await new Promise(resolve => {
      data
        .getDiffImage()
        .pack()
        .pipe(fs.createWriteStream(resemblePath))
        .on('close', resolve);
    });
  }

  async setHtmlDiff() {
    this.diff = this.diff || {};
    this.diff.ok =
      parseFloat(this.diff['base-pug']) === 0 &&
      parseFloat(this.diff['pug-anki']) === 0;
    this.htmlDiffFile = path.join(this.directory, 'index.html');
    const locals = this.asRaw({
      __dirname,
      cssFile: this.css.pug.path.replace(/\\/gu, '\\\\'),
      pugRectoFile: this.recto.pug.path.replace(/\\/gu, '\\\\'),
      pugVersoFile: this.verso.pug.path.replace(/\\/gu, '\\\\'),
    });

    locals.directory = locals.directory.replace(/\\/gu, '\\\\');
    const html = mustache.render(await this.diffTemplate, locals);

    await Promise.all([
      promisify(fs.writeFile)(this.htmlDiffFile, html),
      promisify(fs.writeFile)(`${this.directory}/package.json`, JSON.stringify({
        fixture: this.asRaw(),
        main: 'index.html',
        name: this.title,
      }, null, '\t')),
    ]);
  }

  async html(version) {
    const template = await promisify(fs.readFile)(
      path.resolve(__dirname, `${this.platform}.mustache.html`), { encoding: 'utf8' }
    );
    const body = await (this.face === 'recto' ? this.getRecto(version) : this.getVerso(version));
    const locals = {
      body,
      css: this.css[version].content,
      port: await ankiManager.getPort(),
    };

    return mustache.render(template, locals);
  }

  asRaw(from) {
    const raw = from || {};

    [
      'card',
      'description',
      'diff',
      'diffTemplate',
      'directory',
      'face',
      'id',
      'locals',
      'ok',
      'platform',
      'title',
      'viewport',
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

// model types
Fixture.MODEL_STD = 0;
Fixture.MODEL_CLOZE = 1;

module.exports = Fixture;
