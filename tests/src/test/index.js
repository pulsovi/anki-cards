// native dependancies
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
// local dependancies
const Fixture = require('./Fixture');

const ROOT = process.env.ANKI_PUG_ROOT;

const fixturesPath = path.resolve(ROOT, 'tests/fixture/fixtures.json');
const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

async function extendFixture(options) {
  const jsonFile = path.resolve(ROOT, 'tests/out', options.id, 'package.json');
  let moreOptions = null;

  try {
    const json = await util.promisify(fs.readFile)(jsonFile, 'utf8');

    moreOptions = JSON.parse(json).fixture;
  } catch (e) {
    if (e.code === 'ENOENT') return options;
    console.error(`Erreur non attrapée : ${e.message}`);
    throw e;
  }
  return Object.assign(moreOptions, options);
}

async function reloadBase(options) {
  const fixture = new Fixture(options);

  await fixture.setResemble('base', 'pug');
  await fixture.setHtmlDiff();
}

async function manageOneVersion(options, version) {
  switch (version) {
  case 'anki':
    await reload_anki(options);
    break;
  case 'pug':
    await reload_pug(options);
    break;
  case 'base':
    await reloadBase(options);
    break;
  default:
    throw new ReferenceError(`Version ${version} unknown.`);
  }
}

async function manageOneFixture(options) {
  if (process.argv.length > 3) {
    const version = process.argv[3];

    await manageOneVersion(options, version);
  } else await manage_fixture(options);
}

async function main() {
  if (process.argv.length > 2) {
    let fixture = fixtures.find(f => f.id === process.argv[2]);

    if (!fixture) throw new ReferenceError(`Unable to found ${process.argv[2]} fixture.`);
    fixture = await extendFixture(fixture);
    await manageOneFixture(fixture);
  } else {
    for (let i = 0; i < fixtures.length; ++i) {
      await manage_fixture(fixtures[i]);
    }
  }
}

async function manage_fixture(options) {
  const fixture = new Fixture(options);

  await Promise.all([
    fixture.setPug(),
    fixture.setAnki(),
    fixture.setBase(),
  ]);
  await Promise.all([
    fixture.setResemble('base', 'pug'),
    fixture.setResemble('pug', 'anki'),
  ]);
  await fixture.setHtmlDiff();
  if (!fixture.diff.ok || !fixture.ok) {
    console.log(fixture.htmlDiffFile, fixture.diffString);
    child_process.spawn(
      `D:\\ProgrammesPortables\\NW\\nw.exe "${path.dirname(fixture.htmlDiffFile)}"`, {
        detached: true,
        stdio: 'ignore',
        shell: true,
      }
    ).unref();
  } else
    console.log('Pass:', fixture.id, fixture.model.name, fixture.card, fixture.title);
}

async function reload_anki(options) {
  const fixture = new Fixture(options);

  await fixture.setAnki();
  await fixture.setResemble('pug', 'anki');
  await fixture.setHtmlDiff();
}

async function reload_pug(options) {
  const fixture = new Fixture(options);

  await fixture.setPug();
  await Promise.all([
    fixture.setResemble('base', 'pug'),
    fixture.setResemble('pug', 'anki'),
  ]);
  await fixture.setHtmlDiff();
}

// main
main()
  .then(_ => {
    Fixture.close();
  })
  .catch(e => {
    console.log('Main error:', e);
    Fixture.close();
  });
