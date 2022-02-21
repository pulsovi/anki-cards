const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const DELAY = 200;

const restartWatching = (() => {
  let to = null;
  let subprocess = null;

  return () => {
    clearTimeout(to);
    to = setTimeout(restart, DELAY);
  };

  function restart () {
    console.info('restart watch');
    if (subprocess) subprocess.kill();
    subprocess = childProcess.fork(path.resolve(__dirname, 'watch.js'));
  }
})();

fs.watch(__dirname, (event, filename) => {
  if (filename === 'watch.js') restartWatching();
});

restartWatching();
