#!/bin/bash

node --trace-warnings --async-stack-traces --unhandled-rejections=strict "$(dirname "$0")/../src/test/index.js" $*
