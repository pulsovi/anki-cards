// jshint esversion:8
const childProcess = require('child_process');

const log = require('debug')('anki-manager');
const findProcess = require('find-process');
const netstat = require('node-netstat');

const { 'anki-exe': ankiExe } = require('../../../config/global');

const cache = {
  port: null,
};

function sleep(ms) {
  return new Promise(rs => setTimeout(rs, ms));
}

function getPidPort(pid) {
  log('get-pid-port from pid', pid);
  return new Promise(resolve => {
    netstat({
      done() {
        log('get-pid-port done, not found');
        resolve(null);
      },
      filter: {
        pid,
        state: 'LISTENING',
      },
    }, stat => {
      resolve(stat.local.port);
    });
  });
}

function toCache(keyName, keyValue) {
  cache[keyName] = keyValue;
  return keyValue;
}

class AnkiManager {
  static async getPid() {
    log('get-pid');
    if (!await AnkiManager.isRunning())
      await AnkiManager.start();

    return (await findProcess('name', 'anki'))
      .find(ps => ps.name === 'anki.exe')
      .pid;
  }

  static async getPort() {
    log('get-port');
    if (cache.port !== null) return cache.port;
    const port = await getPidPort(await AnkiManager.getPid());

    if (port === null)
      return sleep(1000).then(AnkiManager.getPort);
    return toCache('port', port);
  }

  static async isRunning(psName = 'anki.exe') {
    log('is-running', psName);
    const processList = await findProcess('name', psName);

    return processList.some(ps => ps.name === psName);
  }

  static start() {
    log('starting anki ...');
    childProcess
      .spawn(`"${ankiExe}"`, { shell: true, stdio: 'ignore' })
      .unref();
  }
}

module.exports = AnkiManager;
