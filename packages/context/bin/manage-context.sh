#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\,/,g')")

cd "${basedir}/../src/manage-context"
npm start
