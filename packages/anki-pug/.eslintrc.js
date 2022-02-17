/* eslint-disable sort-keys */
const path = require('path');

module.exports = {
  root: true,
  'extends': 'pulsovi-node',
  overrides: [{
    files: ['bin/*.ts', 'lib/*.ts'],
    'extends': 'pulsovi-typescript',
    parserOptions: {
      project: path.resolve(__dirname, 'tsconfig.json'),
    },
  }],
};
