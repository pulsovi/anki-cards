//jshint esversion:8
const FixtureManager = require('./fixture-manager');

// main
main2()
  .catch(e => {
    console.log('Main error:', e);
  });

async function main2() {
  var cid = process.argv[2];
  var manager = new FixtureManager(cid);
  await manager.show();
}
