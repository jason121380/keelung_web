#!/bin/sh
set -eu

REPO_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
DEPLOY_SCRIPT="$REPO_ROOT/tools/deploy-plesk.sh"
TEST_ROOT=$(mktemp -d "${TMPDIR:-/tmp}/at13-deploy-test.XXXXXX")
trap 'rm -rf "$TEST_ROOT"' EXIT HUP INT TERM

pass_count=0

fail() {
  printf 'FAIL: %s\n' "$1" >&2
  exit 1
}

pass() {
  pass_count=$((pass_count + 1))
  printf 'PASS: %s\n' "$1"
}

wait_for_path() {
  path_to_wait_for=$1
  attempts=0

  while [ ! -e "$path_to_wait_for" ]; do
    attempts=$((attempts + 1))
    [ "$attempts" -lt 100 ] || fail "timed out waiting for: $path_to_wait_for"
    sleep 0.05
  done
}

assert_file_contains() {
  file=$1
  expected=$2
  [ -f "$file" ] || fail "missing file: $file"
  [ "$(cat "$file")" = "$expected" ] || fail "unexpected content: $file"
}

make_site() {
  dir=$1
  marker=$2
  mkdir -p "$dir/assets"
  printf '%s\n' "$marker" > "$dir/index.html"
  printf 'User-agent: *\nAllow: /\n' > "$dir/robots.txt"
  printf '%s\n' "$marker" > "$dir/assets/app.js"
}

deploy() {
  AT13_SOURCE_DIR="$1" \
  AT13_LIVE_DIR="$2" \
  AT13_NEXT_DIR="$3" \
  AT13_PREVIOUS_DIR="$4" \
    sh "$DEPLOY_SCRIPT"
}

expect_deploy_failure() (
  name=$1
  source_dir=$2
  live_dir=$3
  next_dir=$4
  previous_dir=$5

  if deploy "$source_dir" "$live_dir" "$next_dir" "$previous_dir" \
    >"$TEST_ROOT/$name.log" 2>&1; then
    fail "$name: deployment unexpectedly succeeded"
  fi
)

test_first_and_second_deploy() {
  case_root="$TEST_ROOT/happy-path"
  source_dir="$case_root/repository/public"
  live_dir="$case_root/httpdocs/at13"
  next_dir="$case_root/httpdocs/at13-next"
  previous_dir="$case_root/httpdocs/at13-previous"

  make_site "$source_dir" v1
  mkdir -p "$case_root/repository/.git" "$case_root/repository/tools"
  printf 'private repo metadata\n' > "$case_root/repository/README.md"

  deploy "$source_dir" "$live_dir" "$next_dir" "$previous_dir"
  assert_file_contains "$live_dir/index.html" v1
  live_inode=$(ls -di "$live_dir" | awk '{print $1}')
  [ ! -e "$previous_dir" ] || fail 'previous must not exist after first deploy'
  [ ! -e "$live_dir/.git" ] || fail '.git leaked into docroot'
  [ ! -e "$live_dir/README.md" ] || fail 'README.md leaked into docroot'
  [ ! -e "$live_dir/tools" ] || fail 'tools leaked into docroot'

  make_site "$source_dir" v2
  deploy "$source_dir" "$live_dir" "$next_dir" "$previous_dir"
  assert_file_contains "$live_dir/index.html" v2
  assert_file_contains "$previous_dir/index.html" v1
  [ "$(ls -di "$live_dir" | awk '{print $1}')" = "$live_inode" ] \
    || fail 'live directory was replaced instead of updated in place'
  [ ! -e "$next_dir" ] || fail 'staging directory remains after deployment'
  pass 'first and second deploy rotate live and previous'
}

test_invalid_sources_keep_live() {
  for missing in index.html robots.txt assets; do
    case_root="$TEST_ROOT/missing-$missing"
    source_dir="$case_root/repository/public"
    live_dir="$case_root/httpdocs/at13"
    next_dir="$case_root/httpdocs/at13-next"
    previous_dir="$case_root/httpdocs/at13-previous"

    make_site "$source_dir" candidate
    make_site "$live_dir" stable
    rm -rf "$source_dir/$missing"

    expect_deploy_failure "missing-$missing" \
      "$source_dir" "$live_dir" "$next_dir" "$previous_dir"
    assert_file_contains "$live_dir/index.html" stable
  done
  pass 'invalid sources leave live unchanged'
}

test_each_empty_target_is_rejected() {
  for target in live next previous; do
    case_root="$TEST_ROOT/empty-$target"
    source_dir="$case_root/repository/public"
    live_dir="$case_root/httpdocs/at13"
    next_dir="$case_root/httpdocs/at13-next"
    previous_dir="$case_root/httpdocs/at13-previous"
    make_site "$source_dir" candidate
    make_site "$live_dir" stable

    case "$target" in
      live) bad_live='' ; bad_next=$next_dir ; bad_previous=$previous_dir ;;
      next) bad_live=$live_dir ; bad_next='' ; bad_previous=$previous_dir ;;
      previous) bad_live=$live_dir ; bad_next=$next_dir ; bad_previous='' ;;
    esac

    expect_deploy_failure "empty-$target" \
      "$source_dir" "$bad_live" "$bad_next" "$bad_previous"
    assert_file_contains "$live_dir/index.html" stable
  done
  pass 'empty deployment targets are rejected'
}

test_each_relative_target_is_rejected() {
  for target in live next previous; do
    case_root="$TEST_ROOT/relative-$target"
    source_dir="$case_root/repository/public"
    live_dir="$case_root/httpdocs/at13"
    next_dir="$case_root/httpdocs/at13-next"
    previous_dir="$case_root/httpdocs/at13-previous"
    make_site "$source_dir" candidate
    make_site "$live_dir" stable

    case "$target" in
      live) bad_live='relative-live' ; bad_next=$next_dir ; bad_previous=$previous_dir ;;
      next) bad_live=$live_dir ; bad_next='relative-next' ; bad_previous=$previous_dir ;;
      previous) bad_live=$live_dir ; bad_next=$next_dir ; bad_previous='relative-previous' ;;
    esac

    expect_deploy_failure "relative-$target" \
      "$source_dir" "$bad_live" "$bad_next" "$bad_previous"
    assert_file_contains "$live_dir/index.html" stable
  done
  pass 'relative deployment targets are rejected'
}

test_each_root_target_is_rejected_before_mutation() {
  wrapper_dir="$TEST_ROOT/root-guard-bin"
  mutation_log="$TEST_ROOT/root-mutation.log"
  mkdir -p "$wrapper_dir"

  for command_name in rm mv; do
    command_path="$wrapper_dir/$command_name"
    printf '#!/bin/sh\nprintf "%%s\\n" "%s invoked" >> "$AT13_MUTATION_LOG"\nexit 97\n' \
      "$command_name" > "$command_path"
    chmod +x "$command_path"
  done

  for target in live next previous; do
    case_root="$TEST_ROOT/root-$target"
    source_dir="$case_root/repository/public"
    live_dir="$case_root/httpdocs/at13"
    next_dir="$case_root/httpdocs/at13-next"
    previous_dir="$case_root/httpdocs/at13-previous"
    make_site "$source_dir" candidate
    make_site "$live_dir" stable

    case "$target" in
      live) bad_live='/' ; bad_next=$next_dir ; bad_previous=$previous_dir ;;
      next) bad_live=$live_dir ; bad_next='/' ; bad_previous=$previous_dir ;;
      previous) bad_live=$live_dir ; bad_next=$next_dir ; bad_previous='/' ;;
    esac

    if PATH="$wrapper_dir:$PATH" AT13_MUTATION_LOG="$mutation_log" \
      AT13_SOURCE_DIR="$source_dir" \
      AT13_LIVE_DIR="$bad_live" \
      AT13_NEXT_DIR="$bad_next" \
      AT13_PREVIOUS_DIR="$bad_previous" \
      sh "$DEPLOY_SCRIPT" >"$TEST_ROOT/root-$target.log" 2>&1; then
      fail "root-$target: deployment unexpectedly succeeded"
    fi

    [ ! -s "$mutation_log" ] || fail "root-$target: mutation attempted before rejection"
    assert_file_contains "$live_dir/index.html" stable
  done
  pass 'root deployment targets are rejected before mutation'
}

test_duplicate_targets_are_rejected() {
  for pair in live-next live-previous next-previous; do
    case_root="$TEST_ROOT/duplicate-$pair"
    source_dir="$case_root/repository/public"
    live_dir="$case_root/httpdocs/at13"
    next_dir="$case_root/httpdocs/at13-next"
    previous_dir="$case_root/httpdocs/at13-previous"
    make_site "$source_dir" candidate
    make_site "$live_dir" stable

    case "$pair" in
      live-next) bad_live=$live_dir ; bad_next=$live_dir ; bad_previous=$previous_dir ;;
      live-previous) bad_live=$live_dir ; bad_next=$next_dir ; bad_previous=$live_dir ;;
      next-previous) bad_live=$live_dir ; bad_next=$next_dir ; bad_previous=$next_dir ;;
    esac

    expect_deploy_failure "duplicate-$pair" \
      "$source_dir" "$bad_live" "$bad_next" "$bad_previous"
    assert_file_contains "$live_dir/index.html" stable
  done
  pass 'duplicate deployment targets are rejected'
}

test_different_target_parents_are_rejected() {
  case_root="$TEST_ROOT/different-parents"
  source_dir="$case_root/repository/public"
  live_dir="$case_root/httpdocs/at13"
  next_dir="$case_root/other/at13-next"
  previous_dir="$case_root/httpdocs/at13-previous"
  make_site "$source_dir" candidate
  make_site "$live_dir" stable

  expect_deploy_failure different-parents \
    "$source_dir" "$live_dir" "$next_dir" "$previous_dir"
  assert_file_contains "$live_dir/index.html" stable
  pass 'deployment targets with different parents are rejected'
}

test_source_target_overlap_is_rejected() {
  case_root="$TEST_ROOT/source-overlap"
  live_dir="$case_root/httpdocs/at13"
  next_dir="$case_root/httpdocs/at13-next"
  previous_dir="$case_root/httpdocs/at13-previous"
  make_site "$live_dir" stable

  expect_deploy_failure source-overlap \
    "$live_dir" "$live_dir" "$next_dir" "$previous_dir"
  assert_file_contains "$live_dir/index.html" stable
  pass 'source equal to a deployment target is rejected'
}

test_physical_path_overlaps_are_rejected() {
  case_root="$TEST_ROOT/source-contains-targets"
  source_dir="$case_root/repository/public"
  live_dir="$source_dir/httpdocs/at13"
  next_dir="$source_dir/httpdocs/at13-next"
  previous_dir="$source_dir/httpdocs/at13-previous"
  make_site "$source_dir" candidate
  mkdir -p "$next_dir"
  printf 'keep\n' > "$next_dir/sentinel"

  expect_deploy_failure source-contains-targets \
    "$source_dir" "$live_dir" "$next_dir" "$previous_dir"
  [ -f "$next_dir/sentinel" ] || fail 'source-contained target mutated before rejection'

  case_root="$TEST_ROOT/target-parent-contains-source"
  source_dir="$case_root/httpdocs/repository/public"
  live_dir="$case_root/httpdocs/at13"
  next_dir="$case_root/httpdocs/at13-next"
  previous_dir="$case_root/httpdocs/at13-previous"
  make_site "$source_dir" candidate
  make_site "$live_dir" stable

  expect_deploy_failure target-parent-contains-source \
    "$source_dir" "$live_dir" "$next_dir" "$previous_dir"
  assert_file_contains "$live_dir/index.html" stable

  case_root="$TEST_ROOT/symlink-parent-overlap"
  source_dir="$case_root/repository/public"
  real_parent="$source_dir/hosted"
  target_alias="$case_root/httpdocs-alias"
  make_site "$source_dir" candidate
  mkdir -p "$real_parent"
  ln -s "$real_parent" "$target_alias"
  live_dir="$target_alias/at13"
  next_dir="$target_alias/at13-next"
  previous_dir="$target_alias/at13-previous"
  make_site "$real_parent/at13" stable

  expect_deploy_failure symlink-parent-overlap \
    "$source_dir" "$live_dir" "$next_dir" "$previous_dir"
  assert_file_contains "$real_parent/at13/index.html" stable

  case_root="$TEST_ROOT/symlink-target"
  source_dir="$case_root/repository/public"
  live_dir="$case_root/httpdocs/at13"
  next_dir="$case_root/httpdocs/at13-next"
  previous_dir="$case_root/httpdocs/at13-previous"
  make_site "$source_dir" candidate
  make_site "$live_dir" stable
  ln -s "$source_dir" "$next_dir"

  expect_deploy_failure symlink-target \
    "$source_dir" "$live_dir" "$next_dir" "$previous_dir"
  [ -L "$next_dir" ] || fail 'symlink target mutated before rejection'
  assert_file_contains "$live_dir/index.html" stable
  pass 'physical and symlink path overlaps are rejected before mutation'
}

test_activation_failure_preserves_live() {
  case_root="$TEST_ROOT/activation-failure"
  source_dir="$case_root/repository/public"
  live_dir="$case_root/httpdocs/at13"
  next_dir="$case_root/httpdocs/at13-next"
  previous_dir="$case_root/httpdocs/at13-previous"
  make_site "$source_dir" candidate
  make_site "$live_dir" stable

  if AT13_TEST_FAIL_BEFORE_INDEX_SWAP=1 \
    AT13_SOURCE_DIR="$source_dir" \
    AT13_LIVE_DIR="$live_dir" \
    AT13_NEXT_DIR="$next_dir" \
    AT13_PREVIOUS_DIR="$previous_dir" \
    sh "$DEPLOY_SCRIPT" >"$TEST_ROOT/activation-failure.log" 2>&1; then
    fail 'pre-activation failure: deployment unexpectedly succeeded'
  fi

  assert_file_contains "$live_dir/index.html" stable
  [ ! -e "$next_dir" ] || fail 'staging directory remains after rollback'
  assert_file_contains "$previous_dir/index.html" stable
  [ ! -e "$case_root/httpdocs/.at13-deploy.lock" ] || fail 'lock remains after handled failure'
  pass 'pre-activation failure preserves live without moving it'
}

test_concurrent_deploy_is_rejected() {
  case_root="$TEST_ROOT/concurrent-deploy"
  first_source="$case_root/repository-first/public"
  second_source="$case_root/repository-second/public"
  live_dir="$case_root/httpdocs/at13"
  next_dir="$case_root/httpdocs/at13-next"
  previous_dir="$case_root/httpdocs/at13-previous"
  lock_dir="$case_root/httpdocs/.at13-deploy.lock"
  release_fifo="$case_root/release-lock"
  make_site "$first_source" first
  make_site "$second_source" second
  make_site "$live_dir" stable
  mkfifo "$release_fifo"

  AT13_TEST_WAIT_AFTER_LOCK_FILE="$release_fifo" \
    AT13_SOURCE_DIR="$first_source" \
    AT13_LIVE_DIR="$live_dir" \
    AT13_NEXT_DIR="$next_dir" \
    AT13_PREVIOUS_DIR="$previous_dir" \
    sh "$DEPLOY_SCRIPT" >"$TEST_ROOT/concurrent-first.log" 2>&1 &
  first_pid=$!

  wait_for_path "$lock_dir"
  if deploy "$second_source" "$live_dir" "$next_dir" "$previous_dir" \
    >"$TEST_ROOT/concurrent-second.log" 2>&1; then
    fail 'concurrent deployment unexpectedly succeeded'
  fi
  assert_file_contains "$live_dir/index.html" stable

  printf 'continue\n' > "$release_fifo"
  wait "$first_pid" || fail 'first deployment failed after releasing lock'
  assert_file_contains "$live_dir/index.html" first
  [ ! -e "$lock_dir" ] || fail 'lock remains after successful deployment'
  pass 'concurrent deployment is rejected by an atomic lock'
}

test_abrupt_termination_keeps_live_available() {
  case_root="$TEST_ROOT/abrupt-termination"
  source_dir="$case_root/repository/public"
  live_dir="$case_root/httpdocs/at13"
  next_dir="$case_root/httpdocs/at13-next"
  previous_dir="$case_root/httpdocs/at13-previous"
  lock_dir="$case_root/httpdocs/.at13-deploy.lock"
  wait_fifo="$case_root/wait-before-index"
  make_site "$source_dir" candidate
  make_site "$live_dir" stable
  mkfifo "$wait_fifo"

  AT13_TEST_WAIT_BEFORE_INDEX_SWAP_FILE="$wait_fifo" \
    AT13_SOURCE_DIR="$source_dir" \
    AT13_LIVE_DIR="$live_dir" \
    AT13_NEXT_DIR="$next_dir" \
    AT13_PREVIOUS_DIR="$previous_dir" \
    sh "$DEPLOY_SCRIPT" >"$TEST_ROOT/abrupt-termination.log" 2>&1 &
  deploy_pid=$!

  wait_for_path "$lock_dir"
  kill -KILL "$deploy_pid"
  wait "$deploy_pid" 2>/dev/null || true

  assert_file_contains "$live_dir/index.html" stable
  [ -d "$live_dir" ] || fail 'live directory disappeared after abrupt termination'
  pass 'abrupt termination before index swap keeps live available'
}

test_staging_failure_cleans_next_and_preserves_live() {
  case_root="$TEST_ROOT/staging-failure"
  source_dir="$case_root/repository/public"
  live_dir="$case_root/httpdocs/at13"
  next_dir="$case_root/httpdocs/at13-next"
  previous_dir="$case_root/httpdocs/at13-previous"
  make_site "$source_dir" candidate
  make_site "$live_dir" stable

  if AT13_TEST_FAIL_AFTER_STAGE_COPY=1 \
    AT13_SOURCE_DIR="$source_dir" \
    AT13_LIVE_DIR="$live_dir" \
    AT13_NEXT_DIR="$next_dir" \
    AT13_PREVIOUS_DIR="$previous_dir" \
    sh "$DEPLOY_SCRIPT" >"$TEST_ROOT/staging-failure.log" 2>&1; then
    fail 'staging failure: deployment unexpectedly succeeded'
  fi

  assert_file_contains "$live_dir/index.html" stable
  [ ! -e "$next_dir" ] || fail 'staging directory remains after staging failure'
  [ ! -e "$previous_dir" ] || fail 'previous must not exist after staging failure'
  pass 'staging failure cleans next and preserves live'
}

test_deploy_succeeds_without_external_comparator() {
  case_root="$TEST_ROOT/no-external-comparator"
  source_dir="$case_root/repository/public"
  live_dir="$case_root/httpdocs/at13"
  next_dir="$case_root/httpdocs/at13-next"
  previous_dir="$case_root/httpdocs/at13-previous"
  restricted_path="$case_root/bin"
  make_site "$source_dir" candidate
  make_site "$live_dir" stable
  mkdir -p "$restricted_path"

  for command_name in mkdir rm cp mv; do
    ln -s "$(command -v "$command_name")" "$restricted_path/$command_name"
  done

  if ! PATH="$restricted_path" \
    AT13_SOURCE_DIR="$source_dir" \
    AT13_LIVE_DIR="$live_dir" \
    AT13_NEXT_DIR="$next_dir" \
    AT13_PREVIOUS_DIR="$previous_dir" \
    /bin/sh "$DEPLOY_SCRIPT" >"$TEST_ROOT/no-external-comparator.log" 2>&1; then
    fail 'deployment failed without an external comparison utility'
  fi

  assert_file_contains "$live_dir/index.html" candidate
  assert_file_contains "$previous_dir/index.html" stable
  [ ! -e "$next_dir" ] || fail 'staging directory remains after comparator-free deployment'
  pass 'deployment succeeds without an external comparison utility'
}

test_first_and_second_deploy
test_invalid_sources_keep_live
test_each_empty_target_is_rejected
test_each_relative_target_is_rejected
test_each_root_target_is_rejected_before_mutation
test_duplicate_targets_are_rejected
test_different_target_parents_are_rejected
test_source_target_overlap_is_rejected
test_physical_path_overlaps_are_rejected
test_activation_failure_preserves_live
test_concurrent_deploy_is_rejected
test_abrupt_termination_keeps_live_available
test_staging_failure_cleans_next_and_preserves_live
test_deploy_succeeds_without_external_comparator

printf 'PASS: all %s deployment integration cases passed\n' "$pass_count"
