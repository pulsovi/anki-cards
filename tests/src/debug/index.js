const FixtureManager = require('./fixture-manager');

function helpMessage() {
  console.log('usage: debug <cid>\n\ncid: card id in Anki');
  FixtureManager.close();
}

async function main() {
  if (process.argv.length < 3 || ['', '--help', '-h'].includes(process.argv[2])) return helpMessage();
  const cid = process.argv[2];
  const manager = new FixtureManager(cid);
  await manager.show();
  return 0;
}

// main
main()
  .catch((error) => {
    console.log('Error in main function:', error);
  });
