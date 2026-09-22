# AT13 Plesk 自動部署 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 讓 `jason121380/keelung_web` 的 `main` 每次 push 後，由 Plesk 立即拉取並安全地把 `public/` 發布到 `https://www.mlgroup.io/at13/`。

**Architecture:** Plesk Git Manager 將公開 repository 的 `main` checkout 到非公開的 `/at13-repository`。Additional deploy action 執行 repository 內的 POSIX shell 腳本；腳本先驗證並複製到 `/httpdocs/at13-next`，再以同檔案系統 rename 切換 live，並保留 `/httpdocs/at13-previous`。GitHub 的 push-only webhook 只通知 Plesk，不保存主機密碼或 SSH key。

**Tech Stack:** POSIX `sh`、Plesk Git Manager、GitHub Webhooks、GitHub Pages、`curl`、`sha256sum`／`shasum`

**Spec:** `docs/superpowers/specs/2026-09-22-plesk-auto-deploy-design.md`

## Global Constraints

- 不改網站內容、視覺、文案、`public/` bundle 或 `.github/workflows/pages.yml`。
- 不啟用 `.github/workflows/deploy.yml`，也不新增 Cloudflare secret。
- 不把 Plesk 登入、webhook URL、密碼、token 或 SSH key 寫進 repository、測試輸出或文件。
- 不刪除 WordPress 內既有的 AT13 頁面，也不刪除目前可用的 `/httpdocs/at13`。
- 所有會刪除或改名的路徑都必須先通過腳本的絕對路徑、非根目錄、互異與同父目錄檢查。
- Plesk 已顯示有一個 remote automatic repository；先檢查它是否就是本 repo，若相同則更新，絕不建立第二份重複設定。
- 第一次正式發布先採手動 deploy；HTTP、檔案雜湊、console 與 rollback copy 都通過後，才開啟 webhook／Automatic deployment。
- GitHub Pages 保持獨立運作，作為備援預覽。

## Review Focus

- **破壞性路徑防護：** 測試空字串、相對路徑、`/`、重複 target、不同 target 父目錄皆須在任何 `rm`／`mv` 前失敗，原 live 不變。
- **切換與回復：** 首次部署、第二次部署、無效來源與模擬 activation 失敗都要測；失敗後 live 必須仍是上一個可用版本。
- **部署範圍：** 線上 docroot 只能收到 `public/` 內容；不得出現 `.git`、`README.md`、`tools/` 或 webhook 資訊。
- **既有設定去重：** Plesk repository 與 GitHub webhook 都先列出、比對 URL／branch／path，再決定 update 或 create。
- **端到端一致性：** Plesk 顯示的 deployed commit 必須等於 GitHub `main`，且 live 的 `index.html`、入口 JS、入口 CSS 雜湊等於該 commit 的 `public/`。

---

## Task 1: 先建立部署腳本的失敗測試

**Files:**

- Create: `tests/test-deploy-plesk.sh`
- Test: `tests/test-deploy-plesk.sh`

- [ ] **Step 1: 建立 shell integration test harness**

新增 `tests/test-deploy-plesk.sh`，以 `mktemp -d` 建立隔離環境，以 `trap` 清除，並透過四個環境變數呼叫尚不存在的 `tools/deploy-plesk.sh`：

```sh
#!/bin/sh
set -eu

REPO_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
DEPLOY_SCRIPT="$REPO_ROOT/tools/deploy-plesk.sh"
TEST_ROOT=$(mktemp -d "${TMPDIR:-/tmp}/at13-deploy-test.XXXXXX")
trap 'rm -rf "$TEST_ROOT"' EXIT HUP INT TERM

fail() {
  printf 'FAIL: %s\n' "$1" >&2
  exit 1
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
```

- [ ] **Step 2: 寫首次與第二次部署測試**

每個 case 使用自己的子目錄。第一次部署後斷言 `live/index.html` 是 `v1`，且 `previous` 不存在；第二次部署後斷言 live 是 `v2`、previous 是 `v1`，並確認 `.git`、`README.md`、`tools/` 不會因 source repo 外層存在而進入 live。

```sh
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
[ ! -e "$previous_dir" ] || fail 'previous must not exist after first deploy'
[ ! -e "$live_dir/README.md" ] || fail 'repo files leaked into docroot'

make_site "$source_dir" v2
deploy "$source_dir" "$live_dir" "$next_dir" "$previous_dir"
assert_file_contains "$live_dir/index.html" v2
assert_file_contains "$previous_dir/index.html" v1
```

- [ ] **Step 3: 寫無效來源、危險路徑與 activation failure 測試**

加入下列 case：

1. source 缺 `index.html`、`robots.txt` 或 `assets/` 時，命令非 0，既有 live marker 不變。
2. live／next／previous 任一路徑為空、相對路徑、`/`，或三者重複時，命令非 0，live 不變。
3. live／next／previous 不在同一父目錄時，命令非 0，live 不變。
4. 設定 `AT13_TEST_FAIL_AFTER_LIVE_MOVE=1` 模擬 live 已移到 previous、next 尚未啟用的失敗；命令非 0，trap 必須把 previous 還原成 live。

測試 helper 使用 `if deploy ...; then fail 'expected failure'; fi`，不要把錯誤文字或路徑檢查寫得依賴特定作業系統訊息。

- [ ] **Step 4: 執行測試，確認因腳本尚不存在而失敗**

Run:

```bash
sh tests/test-deploy-plesk.sh
```

Expected: 非 0，錯誤指出 `tools/deploy-plesk.sh` 不存在或無法開啟。

- [ ] **Step 5: Commit failing test**

```bash
git add tests/test-deploy-plesk.sh
git commit -m "test: specify safe Plesk deployment"
```

---

## Task 2: 實作安全的 staged deployment script

**Files:**

- Create: `tools/deploy-plesk.sh`
- Modify: `tests/test-deploy-plesk.sh`
- Test: `tests/test-deploy-plesk.sh`

- [ ] **Step 1: 建立 POSIX shell 腳本與路徑驗證**

新增可由 `sh` 執行的 `tools/deploy-plesk.sh`。預設路徑與 spec 相同，測試可用環境變數覆寫：

```sh
#!/bin/sh
set -eu

SOURCE_DIR=${AT13_SOURCE_DIR:-/at13-repository/public}
LIVE_DIR=${AT13_LIVE_DIR:-/httpdocs/at13}
NEXT_DIR=${AT13_NEXT_DIR:-/httpdocs/at13-next}
PREVIOUS_DIR=${AT13_PREVIOUS_DIR:-/httpdocs/at13-previous}
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
  printf '%s\n' "${1%/*}"
}
```

接著驗證四個路徑；live／next／previous 必須互異且父目錄完全相同，source 不得等於任一 target。所有檢查必須出現在第一個 `rm`／`mv` 前。

- [ ] **Step 2: 加入來源驗證、暫存複製與內容校驗**

```sh
validate_site() {
  dir=$1
  [ -f "$dir/index.html" ] || die "missing index.html in $dir"
  [ -f "$dir/robots.txt" ] || die "missing robots.txt in $dir"
  [ -d "$dir/assets" ] || die "missing assets directory in $dir"
}

validate_site "$SOURCE_DIR"
mkdir -p "$(parent_dir "$LIVE_DIR")"
rm -rf "$NEXT_DIR"
mkdir "$NEXT_DIR"
cp -a "$SOURCE_DIR"/. "$NEXT_DIR"/
validate_site "$NEXT_DIR"
cmp -s "$SOURCE_DIR/index.html" "$NEXT_DIR/index.html" \
  || die 'staged index.html does not match source'
```

只從 `SOURCE_DIR`（即 repository 的 `public/`）複製，不能從 `/at13-repository` 根目錄複製。

- [ ] **Step 3: 加入可回復的切換流程與測試 fault injection**

```sh
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
```

Fault injection 只供本機測試；Plesk additional action 不設定該變數。

- [ ] **Step 4: 執行語法與整合測試**

Run:

```bash
sh -n tools/deploy-plesk.sh
sh -n tests/test-deploy-plesk.sh
sh tests/test-deploy-plesk.sh
```

Expected: 三個命令皆 exit 0，最後一行顯示所有 deployment integration cases 通過。

- [ ] **Step 5: 以 repo 的真實 `public/` 做一次隔離部署**

Run:

```bash
tmp_root=$(mktemp -d "${TMPDIR:-/tmp}/at13-real.XXXXXX")
AT13_SOURCE_DIR="$PWD/public" \
AT13_LIVE_DIR="$tmp_root/at13" \
AT13_NEXT_DIR="$tmp_root/at13-next" \
AT13_PREVIOUS_DIR="$tmp_root/at13-previous" \
  sh tools/deploy-plesk.sh
cmp public/index.html "$tmp_root/at13/index.html"
test -f "$tmp_root/at13/robots.txt"
test -d "$tmp_root/at13/assets"
test ! -e "$tmp_root/at13/README.md"
rm -rf "$tmp_root"
```

Expected: exit 0；只有 `public/` 的站台檔案出現在暫存 live。

- [ ] **Step 6: Commit implementation**

```bash
git add tools/deploy-plesk.sh tests/test-deploy-plesk.sh
git commit -m "feat: add safe Plesk deployment script"
```

---

## Task 3: 更新 repository 的部署文件

**Files:**

- Modify: `README.md`
- Modify: `CLAUDE.md`
- Test: `README.md`, `CLAUDE.md`

- [ ] **Step 1: 更新 README 的正式站與部署區塊**

在開頭網址列表把 `https://www.mlgroup.io/at13/` 標成正式站、GitHub Pages 標成備援預覽。把「GitHub Pages（主要）」改為 Plesk 正式自動部署，清楚記錄：

```text
Push 到 main 後，GitHub webhook 通知 Plesk Git Manager 拉取最新版。
Plesk checkout 位於非公開的 /at13-repository，additional deploy action 執行
sh /at13-repository/tools/deploy-plesk.sh，只發布 public/ 到 /httpdocs/at13。
成功後 /httpdocs/at13-previous 保留上一版；webhook URL 與主機憑證不得提交。
```

保留 GitHub Pages 與 Cloudflare Worker 的說明，但 GitHub Pages 明確標為獨立備援預覽，Cloudflare workflow 仍停用。

- [ ] **Step 2: 更新 CLAUDE.md 的部署事實**

移除「更新需另行上傳」，改成 Plesk Git Manager 追蹤 `jason121380/keelung_web` 的 `main`。同步修正底部過時的 git remote 速查，以 `git remote -v` 的實際結果為準，並加入：

- `public/` 是唯一公開內容。
- `tools/deploy-plesk.sh` 是正式發布腳本。
- 不可把 webhook URL 或主機憑證寫入 repo。
- GitHub Pages 的子路徑限制仍有效。

- [ ] **Step 3: 驗證文件沒有舊敘述或 secret**

Run:

```bash
rg -n "另行上傳|GitHub Pages（主要）|CLOUDFLARE_API_TOKEN=.*|hooks/.+/" README.md CLAUDE.md
git diff --check
```

Expected: `rg` 對過時部署說法與具體 webhook URL 無輸出；`git diff --check` exit 0。

- [ ] **Step 4: 重跑部署測試**

Run:

```bash
sh tests/test-deploy-plesk.sh
```

Expected: exit 0。

- [ ] **Step 5: Commit documentation**

```bash
git add README.md CLAUDE.md
git commit -m "docs: document Plesk auto-deployment"
```

---

## Task 4: Push 程式變更並建立遠端基準

**Files:** none

- [ ] **Step 1: 本機完整 pre-push verification**

Run:

```bash
sh -n tools/deploy-plesk.sh
sh -n tests/test-deploy-plesk.sh
sh tests/test-deploy-plesk.sh
git diff --check origin/main...HEAD
git status --short --branch
```

Expected: 測試全通過、diff 無 whitespace error、工作樹乾淨，branch 只顯示 ahead。

- [ ] **Step 2: 記錄正式站目前的基準**

下載正式站的 HTML，從其中解析同頁引用的入口 JS 與 CSS 相對 URL，對三個檔案各自計算 SHA-256。只記雜湊與 URL，不記 cookie 或 Plesk session。

Run:

```bash
curl -fsS https://www.mlgroup.io/at13/ -o /tmp/at13-before.html
shasum -a 256 /tmp/at13-before.html
curl -fsSI https://www.mlgroup.io/at13/
```

Expected: HTTP 200；HTML hash 可供第一次 Plesk deploy 前後比較。

- [ ] **Step 3: Push 已審核的 commits 到 GitHub**

Run:

```bash
git push origin main
git fetch origin main
test "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)"
```

Expected: push 成功，local HEAD 等於 GitHub `origin/main`。若 GitHub authentication 失敗，停止，不要建立 alternate credential 或把 token 寫入 remote URL。

- [ ] **Step 4: 記錄將部署的 commit**

Run:

```bash
git rev-parse HEAD
git log -1 --oneline
```

Expected: 保存此 SHA 供 Plesk deployed commit 與 webhook 後驗證。

---

## Task 5: 在 Plesk 安全接上 repository 並首次手動發布

**Files:** none（Plesk 外部設定）

- [ ] **Step 1: 先檢查既有 Plesk Git repository**

在 `mlgroup.io` 的 Plesk Git 頁面打開現有 repository 的詳細設定，逐項比對：

- Remote URL 是否為 `https://github.com/jason121380/keelung_web.git`
- Active branch 是否為 `main`
- Repository path／deployment path 是否為 `/at13-repository`
- Additional deploy action 是否已存在
- Automatic deployment／webhook 狀態

若 remote URL 相同，沿用並修正這筆設定；只有確定現有設定屬於另一個 repository 時，才新增一筆。不得刪除未知 repository。

- [ ] **Step 2: 先以 Manual deployment 模式設定**

設定或更新為：

```text
Repository type: Remote Git hosting
Repository URL: https://github.com/jason121380/keelung_web.git
Branch: main
Repository/deployment path: /at13-repository
Deployment mode: Manual（首次驗證期間）
Additional deploy action: sh /at13-repository/tools/deploy-plesk.sh
```

若 Plesk 將 repository path 與 deployment path 分成兩個欄位，確認 checkout 在非 `httpdocs` 的 `/at13-repository`；腳本才是唯一可寫入 `/httpdocs/at13` 的步驟。

- [ ] **Step 3: Pull updates，但先不要觸發 deploy action**

使用 Plesk 的 Pull Updates，確認 `main` 最新 commit SHA 等於 Task 4 記錄值，並確認 `/at13-repository/public/index.html`、`robots.txt`、`assets/` 與 `/at13-repository/tools/deploy-plesk.sh` 都存在。

Expected: checkout 完整、SHA 一致；`/httpdocs/at13` 尚未改變。

- [ ] **Step 4: 手動執行第一次 deployment**

在 Plesk 按 Deploy now，讓 additional action 執行。完成後確認 Plesk log 中沒有 secret，且顯示 deploy 成功。

Expected:

- `/httpdocs/at13` 為新 live。
- `/httpdocs/at13-previous` 存在，保留 deploy 前版本。
- `/httpdocs/at13-next` 不存在。
- `/httpdocs/at13/.git`、`README.md`、`tools/` 不存在。

- [ ] **Step 5: 驗證第一次正式發布**

執行以下 read-only checks：

```bash
curl -fsS https://www.mlgroup.io/at13/ -o /tmp/at13-live.html
curl -fsSI https://www.mlgroup.io/at13/
cmp public/index.html /tmp/at13-live.html
shasum -a 256 public/index.html /tmp/at13-live.html
```

從 `public/index.html` 解析目前引用的入口 JS 與 CSS，再分別下載並與 repo 檔案做 SHA-256 比對。用瀏覽器開正式站，確認完整載入且 console 沒有 error。

Expected: HTTP 200；HTML、入口 JS、入口 CSS 全部完全相同；瀏覽器無 console error。

- [ ] **Step 6: 若任何檢查失敗，先 rollback 並停止**

不要開 webhook。將失敗的 `/httpdocs/at13` 改名為一個明確的診斷名稱，再把 `/httpdocs/at13-previous` 改回 `/httpdocs/at13`；重新驗證 HTTP 200 後才分析失敗。不得直接刪除唯一可用版本。

---

## Task 6: 建立或更新 GitHub webhook，切換自動部署

**Files:** none（GitHub 與 Plesk 外部設定）

- [ ] **Step 1: 從 Plesk 取得 webhook URL，保持在 UI 內使用**

從該 repository 的 Plesk settings 複製 webhook URL。不要貼進 terminal、repo 文件、Codex 訊息或測試輸出。

- [ ] **Step 2: 檢查 GitHub 既有 webhooks，避免重複**

在 `jason121380/keelung_web` → Settings → Webhooks 列出現有 webhook。比對 host 與 endpoint：若已有這個 Plesk endpoint 就更新；確定沒有才 Add webhook。不要修改其他用途的 webhook。

- [ ] **Step 3: 在送出 webhook 設定前取得使用者確認**

這會建立持續性的外部觸發設定。於 GitHub 最後的 Add／Update webhook 動作前，顯示將設定的 repository、事件與目的地 host，取得 action-time confirmation；不要顯示完整 secret URL。

- [ ] **Step 4: 建立／更新 push-only webhook**

設定：

```text
Payload URL: Plesk 產生的 URL（不記錄）
Content type: application/json
Events: Just the push event
Active: enabled
```

完成後只記錄 webhook 已啟用與 delivery 狀態，不保存完整 URL。

- [ ] **Step 5: Plesk 切換 Automatic deployment**

確認 additional deploy action 仍是 `sh /at13-repository/tools/deploy-plesk.sh`，然後把 deployment mode 改為 Automatic。不要改 active branch 或 deployment path。

- [ ] **Step 6: 用安全的文件 commit 觸發端到端測試**

在本 implementation plan 的完成紀錄區加入測試日期與「webhook end-to-end verified」一句，不變更 `public/`，然後：

```bash
git add docs/superpowers/plans/2026-09-22-plesk-auto-deploy.md
git commit -m "chore: verify Plesk deployment webhook"
git push origin main
```

Expected: GitHub webhook delivery 2xx；Plesk 自動 pull 到新 SHA，並成功執行 deploy action。因 `public/` 未變，正式站內容雜湊應維持相同，但 `/httpdocs/at13-previous` 會是前一次相同版本。

---

## Task 7: 最終驗收與操作交接

**Files:**

- Modify: `docs/superpowers/plans/2026-09-22-plesk-auto-deploy.md`（完成紀錄）
- Test: live site、GitHub Pages、Plesk deployment state、GitHub webhook delivery

- [ ] **Step 1: 比對 deployed commit**

Run:

```bash
git fetch origin main
git rev-parse origin/main
```

Expected: SHA 等於 Plesk repository 顯示的目前 commit。

- [ ] **Step 2: 驗證正式站內容與瀏覽器行為**

重新執行 Task 5 的 HTTP、HTML／入口 JS／入口 CSS hash 檢查；瀏覽器 hard reload 後確認 Network 沒有失敗請求、console 沒有 error。

- [ ] **Step 3: 驗證部署隔離與 rollback copy**

在 Plesk File Manager 確認：

- `/at13-repository` 不在 `httpdocs`。
- `/httpdocs/at13` 只有 `public/` 內容。
- `/httpdocs/at13-previous` 存在。
- `/httpdocs/at13-next` 不存在。
- 先前的 deployment ZIP 仍不可由公開 URL 存取（應為 404）。

- [ ] **Step 4: 驗證 GitHub Pages 未受影響**

Run:

```bash
curl -fsSI https://jason121380.github.io/keelung_web/
```

Expected: HTTP 200；`.github/workflows/pages.yml` 未被修改，Pages 仍可載入。

- [ ] **Step 5: 檢查本機與遠端乾淨一致**

Run:

```bash
sh tests/test-deploy-plesk.sh
git diff --check origin/main...HEAD
git status --short --branch
test "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)"
```

Expected: 測試通過、無 diff error、工作樹乾淨、local 與 origin/main 相同。

- [ ] **Step 6: 記錄完成證據**

在本檔底部補上日期、最終 SHA，以及不含 secret 的驗證摘要：Plesk pull/deploy 成功、webhook delivery 2xx、live HTTP 200、三個 hash 相符、console 無 error、previous 存在、Pages HTTP 200。再 commit 並 push；該 push 本身應再次成功觸發部署。

- [ ] **Step 7: 最終回報**

向使用者回報：現在 `main` 每次 push 都會自動更新正式站、正式 URL、保留上一版的位置、失敗時不會替換 live，以及 GitHub Pages 仍保留。不要回傳 webhook URL、session cookie 或 Plesk credential。

## Completion record

- 2026-09-23: webhook end-to-end verified with trigger commit `4a514a53f6e552d407bd3a3e2cdd71251a0db60f`; GitHub push delivery succeeded and Plesk automatically pulled and deployed it.
- Live `https://www.mlgroup.io/at13/` returned HTTP 200. The deployed HTML, entry JavaScript, module preload, and entry CSS hashes matched `public/`; browser console had no errors.
- `/httpdocs/at13-previous` existed, `/httpdocs/at13-next` did not exist, and the live directory contained only `assets/`, `index.html`, and `robots.txt`.
- GitHub Pages returned HTTP 200, the Pages workflow was unchanged, and checked deployment ZIP candidates returned HTTP 404.
