#!/bin/sh
basedir=$(dirname "$(echo "$0" | sed -e 's,\\,/,g')")


function merge_if_is_diff () {
	one=$(echo $(cygpath -u $1) | sed -e 's, ,\ ,g')
	two=$(echo $(cygpath -u $2) | sed -e 's, ,\ ,g')
	a=`diff "$one" "$two"`
	if [ "$a" != "" ]
	then
		meld "$1" "$2"
	else
		echo -e \\e[32m`basename "$1"`\\e[0m
	fi
}

merge_if_is_diff `realpath "${basedir}/../app/_context.js"` `realpath "${APPDATA}/Anki2/David/collection.media/_context.js"`
merge_if_is_diff `realpath "${basedir}/../app/_context-bootstrap.js"` `realpath "${APPDATA}/Anki2/David/collection.media/_context-bootstrap.js"`
merge_if_is_diff `realpath "${basedir}/../app/_Promise.js"` `realpath "${APPDATA}/Anki2/David/collection.media/_Promise.js"`
merge_if_is_diff `realpath "${basedir}/../app/_main-context.js"` `realpath "${APPDATA}/Anki2/David/collection.media/_main-context.js"`
