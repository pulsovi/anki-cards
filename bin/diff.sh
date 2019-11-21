#!/bin/bash

export MELD_PATH="C:\Program Files (x86)\Meld\Meld.exe"
export ANKI_PUG_ROOT=`realpath "$(dirname "$0")/.."`
node `dirname $0`/../src/diff/anki-pug-diff.js
