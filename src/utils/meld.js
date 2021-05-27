/* eslint-disable no-process-env */
const childProcess = require('child_process');

const endProcess = require('./end-process');

if (!process.env.PATH.split(':').includes('C:\\Program Files (x86)\\Meld\\lib'))
  process.env.PATH += ';C:\\Program Files (x86)\\Meld\\lib';

function meld(fileA, fileB) {
  const subprocess = childProcess.spawn('C:\\Program Files (x86)\\Meld\\Meld.exe', [fileA, fileB]);
  return endProcess(subprocess);
}

module.exports = meld;
