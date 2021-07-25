#!/bin/bash
node --trace-warnings --async-stack-traces --unhandled-rejections=strict "$(dirname "$0")/../src/diff/anki-pug-diff.js" "$*"
