//jshint esversion:6
const fs = require('fs');
const path = require('path');
const pug = require('pug');

function make(
  dirname,
  cards = ['Card1'],
  css = path.resolve(__dirname, 'kodech.css'),
  fields = [
    '_recto',
    '_verso'
  ]
) {
  return require('./standard-export')(dirname, cards, css, fields);
}

module.exports = make;
