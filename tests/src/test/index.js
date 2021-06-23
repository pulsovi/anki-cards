Error.stackTraceLimit = 100;

// native dependancies
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

// local dependancies
const nw = require('nw').findpath();

const { 'anki-pug-root': ROOT } = require('../../../config/global');
const fixtures = require('../../fixture/fixtures');

const Fixture = require('./Fixture');

const args = getArgs();

process.env.ANKI_PUG_ROOT = ROOT;

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

function getArgs() {
  const [, id, version] = process.argv.slice(1);
  return { id, version };
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
  if (args.version) await manageOneVersion(options, args.version);
  else await manage_fixture(options);
}

async function main() {
  if (args.id) {
    let fixture = fixtures.find(fixtureItem => fixtureItem.id === args.id);

    if (!fixture) throw new ReferenceError(`Unable to found <${args.id}> fixture.`);
    fixture = await extendFixture(fixture);
    await manageOneFixture(fixture);
  } else {
    for (let i = 0; i < fixtures.length; ++i)
      await manage_fixture(fixtures[i]);
  }
}

async function manage_fixture(options) {
  const fixture = new Fixture(options);
  let subprocess = null;

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
    subprocess = childProcess.execFile(nw, ['.'], {
      cwd: path.dirname(fixture.htmlDiffFile),
      shell: false,
      stdio: 'inherit',
    });
  } else
    console.log('Pass:', fixture.id, fixture.model.name, fixture.card, fixture.title);
  return await endProcess(subprocess);
}

function endProcess(proc) {
  if (!(proc instanceof childProcess.ChildProcess)) return Promise.resolve();
  return new Promise(rs => proc.on('close', rs));
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
