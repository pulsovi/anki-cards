Error.stackTraceLimit = 100;

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const log = require('debug')('anki:test');
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
  } catch (error) {
    if (error.code === 'ENOENT') return options;
    console.error(`Erreur non attrapée : ${error.message}`);
    throw error;
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
  log('manage-one-version', version);
  switch (version) {
  case 'anki':
    await reloadAnki(options);
    break;
  case 'pug':
    await reloadPug(options);
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
  else await manageFixture(options);
}

async function main() {
  if (args.id) {
    let fixture = fixtures.find(fixtureItem => fixtureItem.id === args.id);

    if (!fixture) throw new ReferenceError(`Unable to found <${args.id}> fixture.`);
    fixture = await extendFixture(fixture);
    await manageOneFixture(fixture);
    return;
  }
  for (let i = 0; i < fixtures.length; ++i)
    // eslint-disable-next-line no-await-in-loop
    await manageFixture(fixtures[i]);
}

async function manageFixture(options) {
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
    log(fixture.htmlDiffFile, fixture.diffString);
    log(path.dirname(fixture.htmlDiffFile));
    subprocess = childProcess.execFile(nw, ['.'], {
      cwd: path.dirname(fixture.htmlDiffFile),
      shell: false,
      stdio: 'inherit',
    });
  } else
    log('Pass:', fixture.id, fixture.model.name, fixture.card, fixture.title);
  return await endProcess(subprocess);
}

function endProcess(proc) {
  if (!(proc instanceof childProcess.ChildProcess)) return Promise.resolve();
  return new Promise(rs => proc.on('close', rs));
}

async function reloadAnki(options) {
  const fixture = new Fixture(options);

  await fixture.setAnki();
  await fixture.setResemble('pug', 'anki');
  await fixture.setHtmlDiff();
}

async function reloadPug(options) {
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
  .catch(error => { log('Main error:', error); })
  .finally(() => { Fixture.close(); });
