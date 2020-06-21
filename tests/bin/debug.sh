#!/bin/bash

# Usage: debug <cid>
# <cid>: card id in anki

export ANKI_PUG_ROOT=`realpath "$(dirname "$0")/../.."`
node "$(dirname "$0")/../src/debug/index.js" "$*"
