#!/bin/bash

# Usage: debug <cid>
# <cid>: card id in anki

# export DEBUG=anki*,test*,*fixture*
node --async-stack-traces --unhandled-rejections=strict "$(dirname "$0")/../src/debug/index.js" "$*"
