#!/bin/bash

# Usage: new-fixture <cid>
# <cid>: card id in anki

export DEBUG=anki*,test*,*fixture*
node --trace-warnings --async-stack-traces --unhandled-rejections=strict "$(dirname "$0")/../src/new-fixture/index.js" $*
