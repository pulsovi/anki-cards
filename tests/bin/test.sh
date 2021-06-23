#!/bin/bash
export DEBUG=anki:test
#export DEBUG=*,-puppeteer:*
node --trace-warnings --async-stack-traces --unhandled-rejections=strict "$(dirname "$0")/../src/test/index.js" $*
