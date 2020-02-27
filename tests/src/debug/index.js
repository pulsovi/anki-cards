//jshint esversion:8
const FixtureManager = require('./fixture-manager');

// main
main()
  .catch(e => {
    console.log('Main error:', e);
  });

async function main() {
  if (process.argv.length < 3 || ["", "--help", "-h"].includes(process.argv[2])) return helpMessage();
  var cid = process.argv[2];
  var manager = new FixtureManager(cid);
  await manager.show();
}

function helpMessage() {
  console.log(`usage: debug <cid>

    cid: card id in Anki`);
  FixtureManager.close();
}
