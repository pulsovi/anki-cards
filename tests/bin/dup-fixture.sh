export ANKI_PUG_ROOT=`realpath "$(dirname "$0")/../.."`
node "$(dirname "$0")/../src/dup-fixture/index.js" "$*"
