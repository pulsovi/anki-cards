#!/bin/bash
# set -x

node `dirname $0`/../src/diff/anki-pug-diff.js
exit $?

