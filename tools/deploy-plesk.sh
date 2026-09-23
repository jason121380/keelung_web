#!/bin/sh
set -eu

SOURCE_DIR=${AT13_SOURCE_DIR-/at13-repository/public}
LIVE_DIR=${AT13_LIVE_DIR-/httpdocs/at13}
NEXT_DIR=${AT13_NEXT_DIR-/httpdocs/at13-next}
PREVIOUS_DIR=${AT13_PREVIOUS_DIR-/httpdocs/at13-previous}
LOCK_HELD=0

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
  [ ! -L "$dir/index.html" ] || die "index.html symlink is not allowed in $dir"
  [ -f "$dir/robots.txt" ] || die "missing robots.txt in $dir"
  [ ! -L "$dir/robots.txt" ] || die "robots.txt symlink is not allowed in $dir"
  [ -d "$dir/assets" ] || die "missing assets directory in $dir"
  [ ! -L "$dir/assets" ] || die "assets symlink is not allowed in $dir"
}

canonical_existing_dir() (
  [ -d "$1" ] || return 1
  CDPATH= cd -P "$1" 2>/dev/null
  pwd -P
)

preflight_tree() (
  preflight_source=$1
  preflight_target=$2

  [ -d "$preflight_source" ] || die "missing source tree: $preflight_source"
  [ ! -L "$preflight_source" ] || die "source symlink is not allowed: $preflight_source"
  [ ! -L "$preflight_target" ] || die "target symlink is not allowed: $preflight_target"
  [ ! -e "$preflight_target" ] || [ -d "$preflight_target" ] \
    || die "tree target is not a directory: $preflight_target"

  for preflight_entry in \
    "$preflight_source"/* \
    "$preflight_source"/.[!.]* \
    "$preflight_source"/..?*; do
    [ -e "$preflight_entry" ] || [ -L "$preflight_entry" ] || continue
    preflight_name=${preflight_entry##*/}
    preflight_destination="$preflight_target/$preflight_name"

    [ ! -L "$preflight_entry" ] || die "source symlink is not allowed: $preflight_entry"
    [ ! -L "$preflight_destination" ] \
      || die "target symlink is not allowed: $preflight_destination"
    if [ -d "$preflight_entry" ]; then
      [ ! -e "$preflight_destination" ] || [ -d "$preflight_destination" ] \
        || die "tree target is not a directory: $preflight_destination"
      preflight_tree "$preflight_entry" "$preflight_destination"
    elif [ -f "$preflight_entry" ]; then
      [ ! -e "$preflight_destination" ] || [ -f "$preflight_destination" ] \
        || die "file target is not a regular file: $preflight_destination"
      [ ! -d "$preflight_destination" ] \
        || die "file target is a directory: $preflight_destination"
    else
      die "unsupported source entry: $preflight_entry"
    fi
  done
)

canonical_future_dir() (
  canonical_path=$1
  canonical_suffix=

  while [ ! -d "$canonical_path" ]; do
    canonical_name=${canonical_path##*/}
    [ -n "$canonical_name" ] || return 1
    canonical_suffix="/$canonical_name$canonical_suffix"
    canonical_path=$(parent_dir "$canonical_path")
  done

  canonical_base=$(canonical_existing_dir "$canonical_path") || return 1
  printf '%s%s\n' "$canonical_base" "$canonical_suffix"
)

paths_overlap() (
  overlap_left=${1%/}
  overlap_right=${2%/}

  case "$overlap_left/" in
    "$overlap_right/"*) return 0 ;;
  esac
  case "$overlap_right/" in
    "$overlap_left/"*) return 0 ;;
  esac
  return 1
)

files_equal() {
  source_file=$1
  staged_file=$2
  exec 3< "$source_file"
  exec 4< "$staged_file"

  while :; do
    source_line=
    staged_line=
    source_status=0
    staged_status=0
    IFS= read -r source_line <&3 || source_status=$?
    IFS= read -r staged_line <&4 || staged_status=$?

    if [ "$source_status" -ne "$staged_status" ] \
      || [ "$source_line" != "$staged_line" ]; then
      exec 3<&-
      exec 4<&-
      return 1
    fi

    [ "$source_status" -eq 0 ] || break
  done

  exec 3<&-
  exec 4<&-
}

install_file_atomic() (
  install_source=$1
  install_target=$2
  install_temp="${install_target}.at13-next"

  [ -f "$install_source" ] || die "cannot atomically install non-file: $install_source"
  [ ! -L "$install_source" ] || die "source symlink is not allowed: $install_source"
  [ ! -L "$install_target" ] || die "target symlink is not allowed: $install_target"
  [ ! -d "$install_target" ] || die "file target is a directory: $install_target"

  rm -rf "$install_temp"
  cp -p "$install_source" "$install_temp"
  mv "$install_temp" "$install_target"
)

install_tree_atomic() (
  install_tree_source=$1
  install_tree_target=$2

  [ -d "$install_tree_source" ] || die "missing source tree: $install_tree_source"
  [ ! -L "$install_tree_source" ] || die "source symlink is not allowed: $install_tree_source"
  [ ! -L "$install_tree_target" ] || die "target symlink is not allowed: $install_tree_target"
  [ ! -e "$install_tree_target" ] || [ -d "$install_tree_target" ] \
    || die "tree target is not a directory: $install_tree_target"
  mkdir -p "$install_tree_target"

  for install_entry in \
    "$install_tree_source"/* \
    "$install_tree_source"/.[!.]* \
    "$install_tree_source"/..?*; do
    [ -e "$install_entry" ] || [ -L "$install_entry" ] || continue
    install_name=${install_entry##*/}
    install_destination="$install_tree_target/$install_name"

    [ ! -L "$install_entry" ] || die "source symlink is not allowed: $install_entry"
    if [ -d "$install_entry" ]; then
      install_tree_atomic "$install_entry" "$install_destination"
    elif [ -f "$install_entry" ]; then
      install_file_atomic "$install_entry" "$install_destination"
    else
      die "unsupported source entry: $install_entry"
    fi
  done
)

install_site_before_index() (
  install_site_source=$1
  install_site_target=$2

  for install_site_entry in \
    "$install_site_source"/* \
    "$install_site_source"/.[!.]* \
    "$install_site_source"/..?*; do
    [ -e "$install_site_entry" ] || [ -L "$install_site_entry" ] || continue
    install_site_name=${install_site_entry##*/}
    [ "$install_site_name" != index.html ] || continue
    install_site_destination="$install_site_target/$install_site_name"

    if [ -d "$install_site_entry" ] && [ ! -L "$install_site_entry" ]; then
      install_tree_atomic "$install_site_entry" "$install_site_destination"
    else
      install_file_atomic "$install_site_entry" "$install_site_destination"
    fi
  done
)

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

PREVIOUS_NEXT_DIR="${PREVIOUS_DIR}-next"
LOCK_DIR="$TARGET_PARENT/.at13-deploy.lock"

[ "$PREVIOUS_NEXT_DIR" != "$LIVE_DIR" ] || die 'previous staging and live must be different paths'
[ "$PREVIOUS_NEXT_DIR" != "$NEXT_DIR" ] || die 'previous staging and next must be different paths'
[ "$PREVIOUS_NEXT_DIR" != "$PREVIOUS_DIR" ] || die 'previous staging and previous must be different paths'
[ "$LOCK_DIR" != "$LIVE_DIR" ] || die 'deployment lock and live must be different paths'
[ "$LOCK_DIR" != "$NEXT_DIR" ] || die 'deployment lock and next must be different paths'
[ "$LOCK_DIR" != "$PREVIOUS_DIR" ] || die 'deployment lock and previous must be different paths'

for target_path in "$LIVE_DIR" "$NEXT_DIR" "$PREVIOUS_DIR" "$PREVIOUS_NEXT_DIR"; do
  [ ! -L "$target_path" ] || die "deployment target symlink is not allowed: $target_path"
  [ ! -e "$target_path" ] || [ -d "$target_path" ] \
    || die "deployment target is not a directory: $target_path"
done

validate_site "$SOURCE_DIR"
[ ! -L "$SOURCE_DIR" ] || die "source directory symlink is not allowed: $SOURCE_DIR"

SOURCE_CANONICAL=$(canonical_existing_dir "$SOURCE_DIR") \
  || die "cannot resolve source directory: $SOURCE_DIR"
TARGET_PARENT_CANONICAL=$(canonical_future_dir "$TARGET_PARENT") \
  || die "cannot resolve target parent: $TARGET_PARENT"
if paths_overlap "$SOURCE_CANONICAL" "$TARGET_PARENT_CANONICAL"; then
  die 'source and deployment target parent must not overlap physically'
fi

cleanup() {
  status=$?
  trap - 0 HUP INT TERM

  if [ "$LOCK_HELD" -eq 1 ]; then
    [ ! -e "$NEXT_DIR" ] || rm -rf "$NEXT_DIR"
    [ ! -e "$PREVIOUS_NEXT_DIR" ] || rm -rf "$PREVIOUS_NEXT_DIR"
    [ ! -e "$LOCK_DIR" ] || rm -rf "$LOCK_DIR"
  fi
  exit "$status"
}

trap cleanup 0
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

mkdir -p "$TARGET_PARENT"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  die "deployment already in progress or stale lock exists: $LOCK_DIR"
fi
LOCK_HELD=1

if [ -n "${AT13_TEST_WAIT_AFTER_LOCK_FILE:-}" ]; then
  IFS= read -r _at13_test_release < "$AT13_TEST_WAIT_AFTER_LOCK_FILE"
fi

rm -rf "$NEXT_DIR"
mkdir "$NEXT_DIR"
cp -Rp "$SOURCE_DIR"/. "$NEXT_DIR"/
validate_site "$NEXT_DIR"
files_equal "$SOURCE_DIR/index.html" "$NEXT_DIR/index.html" \
  || die 'staged index.html does not match source'
preflight_tree "$NEXT_DIR" "$LIVE_DIR"

if [ -n "${AT13_TEST_WAIT_AFTER_STAGE_FILE:-}" ]; then
  IFS= read -r _at13_test_release < "$AT13_TEST_WAIT_AFTER_STAGE_FILE"
fi

if [ "${AT13_TEST_FAIL_AFTER_STAGE_COPY:-0}" = 1 ]; then
  die 'simulated failure after staging copy'
fi

if [ -e "$LIVE_DIR" ]; then
  validate_site "$LIVE_DIR"
  rm -rf "$PREVIOUS_NEXT_DIR"
  mkdir "$PREVIOUS_NEXT_DIR"
  cp -Rp "$LIVE_DIR"/. "$PREVIOUS_NEXT_DIR"/
  validate_site "$PREVIOUS_NEXT_DIR"
  rm -rf "$PREVIOUS_DIR"
  mv "$PREVIOUS_NEXT_DIR" "$PREVIOUS_DIR"
else
  mkdir "$LIVE_DIR"
fi

install_site_before_index "$NEXT_DIR" "$LIVE_DIR"

if [ -n "${AT13_TEST_WAIT_BEFORE_INDEX_SWAP_FILE:-}" ]; then
  IFS= read -r _at13_test_release < "$AT13_TEST_WAIT_BEFORE_INDEX_SWAP_FILE"
fi

if [ "${AT13_TEST_FAIL_BEFORE_INDEX_SWAP:-0}" = 1 ]; then
  die 'simulated failure before index swap'
fi

install_file_atomic "$NEXT_DIR/index.html" "$LIVE_DIR/index.html"
printf 'AT13 deployment complete: %s\n' "$LIVE_DIR"
