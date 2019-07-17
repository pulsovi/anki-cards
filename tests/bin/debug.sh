export ANKI_PUG_ROOT=`realpath "$(dirname "$0")/../.."`
node "$(dirname "$0")/../src/debug/index.js" "$*"
