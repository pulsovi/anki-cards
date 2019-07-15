//jshint esversion:8
// native dependancies
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
// local dependancies
const Fixture = require(path.resolve(__dirname, 'Fixture'));
const ROOT = process.env.ANKI_PUG_ROOT;

const fixturesPath = path.resolve(ROOT, 'tests/fixture/fixtures.json');
const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

// main
main()
  .then(_ => {
    Fixture.close();
  })
  .catch(e => {
    console.log('Main error:', e);
    Fixture.close();
  });


async function main() {
  if (process.argv.length > 2) {
    var fixture = fixtures.find(f => f.id === process.argv[2]);
    if (!fixture) throw new ReferenceError(`Unable to found ${process.argv[2]} fixture.`);
    await manage_one_fixture(fixture);
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
  if (fixture.diff || !fixture.ok) {
    console.log(fixture.htmlDiffFile, fixture.diffString);
    childProcess.spawn(
      'D:\\ProgrammesPortables\\NW\\nw.exe "' + path.dirname(fixture.htmlDiffFile) + '"', {
        detached: true,
        stdio: 'ignore',
        shell: true
      }
    ).unref();
  } else {
    console.log('Pass:', fixture.id, fixture.note.name, fixture.card, fixture.title);
  }
}

async function manage_one_fixture(options) {
  if (process.argv.length > 3) {
    var version = process.argv[3];
    await manage_one_version(options, version);
  } else await manage_fixture(options);
}

async function manage_one_version(options, version) {
  switch (version) {
    case 'anki':
      await reload_anki(options);
      break;
    case 'pug':
      await reload_pug(options);
      break;
    case 'base':
      await reload_base(options);
      break;
    default:
      throw new ReferenceError(`Version ${version} unknown.`);
  }
}

async function reload_base(options) {
  var fixture = new Fixture(options);
  await fixture.setResemble('base', 'pug');
  await fixture.setHtmlDiff();
}

async function reload_anki(options) {
  var fixture = new Fixture(options);
  await fixture.setAnki();
  await fixture.setResemble('pug', 'anki');
  await fixture.setHtmlDiff();
}

async function reload_pug(options) {
  var fixture = new Fixture(options);
  await fixture.setPug();
  await Promise.all([
    fixture.setResemble('base', 'pug'),
    fixture.setResemble('pug', 'anki'),
  ]);
  await fixture.setHtmlDiff();
}
