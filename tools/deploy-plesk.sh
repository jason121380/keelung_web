#!/bin/sh
set -eu

SOURCE_DIR=${AT13_SOURCE_DIR-/at13-repository/public}
LIVE_DIR=${AT13_LIVE_DIR-/httpdocs/at13}
NEXT_DIR=${AT13_NEXT_DIR-/httpdocs/at13-next}
PREVIOUS_DIR=${AT13_PREVIOUS_DIR-/httpdocs/at13-previous}
LIVE_MOVED=0

die() {
  printf 'deploy-plesk: %s\n' "$1" >&2
  exit 1
}

validate_absolute_path() {
  label=$1
  path=$2

  case "$path" in
    /*) ;;
    *) die "$label must be an absolute path" ;;
  esac

  case "$path" in
    /|*/.|*/..|*/./*|*/../*|*/) die "$label is unsafe: $path" ;;
  esac
}

parent_dir() {
  parent=${1%/*}
  [ -n "$parent" ] || parent=/
  printf '%s\n' "$parent"
}

validate_site() {
  dir=$1
  [ -f "$dir/index.html" ] || die "missing index.html in $dir"
  [ -f "$dir/robots.txt" ] || die "missing robots.txt in $dir"
  [ -d "$dir/assets" ] || die "missing assets directory in $dir"
}

validate_absolute_path source "$SOURCE_DIR"
validate_absolute_path live "$LIVE_DIR"
validate_absolute_path next "$NEXT_DIR"
validate_absolute_path previous "$PREVIOUS_DIR"

[ "$SOURCE_DIR" != "$LIVE_DIR" ] || die 'source and live must be different paths'
[ "$SOURCE_DIR" != "$NEXT_DIR" ] || die 'source and next must be different paths'
[ "$SOURCE_DIR" != "$PREVIOUS_DIR" ] || die 'source and previous must be different paths'
[ "$LIVE_DIR" != "$NEXT_DIR" ] || die 'live and next must be different paths'
[ "$LIVE_DIR" != "$PREVIOUS_DIR" ] || die 'live and previous must be different paths'
[ "$NEXT_DIR" != "$PREVIOUS_DIR" ] || die 'next and previous must be different paths'

TARGET_PARENT=$(parent_dir "$LIVE_DIR")
[ "$(parent_dir "$NEXT_DIR")" = "$TARGET_PARENT" ] \
  || die 'live, next, and previous must share one parent directory'
[ "$(parent_dir "$PREVIOUS_DIR")" = "$TARGET_PARENT" ] \
  || die 'live, next, and previous must share one parent directory'

validate_site "$SOURCE_DIR"

rollback() {
  status=$?
  trap - EXIT HUP INT TERM

  if [ "$LIVE_MOVED" -eq 1 ] && [ ! -e "$LIVE_DIR" ] && [ -d "$PREVIOUS_DIR" ]; then
    mv "$PREVIOUS_DIR" "$LIVE_DIR" || true
  fi

  [ ! -e "$NEXT_DIR" ] || rm -rf "$NEXT_DIR"
  exit "$status"
}

trap rollback EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

mkdir -p "$TARGET_PARENT"
rm -rf "$NEXT_DIR"
mkdir "$NEXT_DIR"
cp -a "$SOURCE_DIR"/. "$NEXT_DIR"/
validate_site "$NEXT_DIR"
SOURCE_INDEX_CKSUM=$(cksum < "$SOURCE_DIR/index.html")
STAGED_INDEX_CKSUM=$(cksum < "$NEXT_DIR/index.html")
[ "$SOURCE_INDEX_CKSUM" = "$STAGED_INDEX_CKSUM" ] \
  || die 'staged index.html does not match source'

if [ "${AT13_TEST_FAIL_AFTER_STAGE_COPY:-0}" = 1 ]; then
  die 'simulated failure after staging copy'
fi

rm -rf "$PREVIOUS_DIR"
if [ -e "$LIVE_DIR" ]; then
  mv "$LIVE_DIR" "$PREVIOUS_DIR"
  LIVE_MOVED=1
fi

if [ "${AT13_TEST_FAIL_AFTER_LIVE_MOVE:-0}" = 1 ]; then
  die 'simulated failure after moving live'
fi

mv "$NEXT_DIR" "$LIVE_DIR"
LIVE_MOVED=0
printf 'AT13 deployment complete: %s\n' "$LIVE_DIR"
