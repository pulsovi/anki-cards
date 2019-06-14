#!/bin/bash
# set -x

ROOT_DIR=$(realpath "$(dirname "$(echo "$0")")/..")
DIFF_LIST="$ROOT_DIR/var/difflist"

node `dirname $0`/diff.js

actual_dir="$ROOT_DIR/model"
expected_dir="$ROOT_DIR/tmp"
list_file="$ROOT_DIR/var/difflist"

console_red="\e[31m"
console_light_blue="\e[94m"
console_default="\e[0m"

help_color="$console_red"

touch $list_file
files=()
while read f; do
	files+=("$f")
done < $list_file

list_only=false
for s in "${files[@]}"; do
	actual_file="$actual_dir/$s"
	expected_file="$expected_dir/$s"

	if [ $list_only == true ]; then
		echo -e "$console_light_blue$s$console_default"
		continue
	fi

	while :; do
		echo -en "$console_light_blue compare $s [y,n,l,o,q]?$console_default "
		read p
		case $p in
			[Yy]* )
				meld "$expected_file" "$actual_file"
				break;;
			[Nn]* ) break;;
			[Qq]* ) exit 0;;
			[Ll]* )
				list_only=true
				break;;
			[Oo]* )
				cp "$expected_file" "$actual_file"
				break;;
			[Ee]* )
				explorer /select,$(cygpath -w "$actual_file")
				explorer /select,$(cygpath -w "$expected_file")
				break;;
			* )
				echo -en "$help_color"
				echo "y - [yes]       compare"
				echo "n - [no]        skip this file"
				echo "e - [explore]   view in the explorer"
				echo "l - [list]      only show names of all diff files"
				echo "o - [overwrite] update file"
				echo "q - [quit]      skip all undecided files and quit the diff"
				echo -en "$console_default";;
		esac
	done
done

exit $?

