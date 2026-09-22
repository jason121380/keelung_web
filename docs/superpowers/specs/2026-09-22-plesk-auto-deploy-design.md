# AT13 Plesk 自動部署設計

日期：2026-09-22

## 目標

將 `jason121380/keelung_web` 的 `main` 分支設為正式站唯一的部署來源。每次 GitHub 收到 push 後，Plesk 立即拉取最新版，並只把 repository 的 `public/` 發布到 `https://www.mlgroup.io/at13/`。

部署失敗不得破壞目前可用的正式站；每次成功部署後保留上一版，以便快速回復。

## 現況

- Repository 是公開的，正式靜態檔位於 `public/`。
- GitHub Pages 已由 `.github/workflows/pages.yml` 自動發布。
- 正式網址由 WordPress／Plesk 主機提供，實體目錄為 `/httpdocs/at13`。
- Plesk 已安裝 Git Manager，並支援 remote repository、自動部署與 webhook。
- 目前正式站由人工上傳，尚未和 GitHub 連動。

## 非目標

- 不變更網站內容、視覺、文案或現有 GitHub Pages 部署。
- 不恢復缺少的 Vite 原始碼，也不新增建置步驟。
- 不把 Plesk 密碼、SSH 私鑰或其他主機憑證存入 GitHub。
- 不刪除 WordPress 資料庫中的舊 AT13 頁面；它仍是回復來源之一。

## 選定架構

採用 Plesk Git Manager 的 remote repository 模式：

1. Plesk 以 HTTPS 讀取公開 repository `https://github.com/jason121380/keelung_web.git`。
2. Plesk 追蹤 `main` 分支，並把 repository 部署到非公開目錄 `/at13-repository`。
3. Repository 內新增 `tools/deploy-plesk.sh`。Plesk 的 additional deploy action 執行：

   ```sh
   sh /at13-repository/tools/deploy-plesk.sh
   ```

4. 腳本只讀取 `/at13-repository/public`，不會把 README、工作流程或母檔放進公開目錄。
5. GitHub repository 設定一個由 Plesk 產生的 webhook，只接收 push 事件。
6. Push 到 GitHub 後，webhook 通知 Plesk；Plesk pull `main`、部署 repository，再執行發布腳本。

GitHub 不保存任何 Plesk 登入資訊。Webhook URL 視同部署憑證，不寫入 repository、文件或日誌。

## 發布腳本

預設路徑：

- 來源：`/at13-repository/public`
- 正式：`/httpdocs/at13`
- 暫存：`/httpdocs/at13-next`
- 上一版：`/httpdocs/at13-previous`

腳本流程：

1. 使用嚴格模式；任一步驟失敗即停止。
2. 確認來源含有 `index.html`、`robots.txt` 與 `assets/`。
3. 清理固定且經檢查的 `at13-next`，重新建立暫存目錄。
4. 複製 `public/` 的全部內容到 `at13-next`。
5. 再次確認暫存目錄的必要檔案，並確認複製後的 `index.html` 與來源一致。
6. 清理固定且經檢查的 `at13-previous`。
7. 將目前 `at13` 改名為 `at13-previous`。
8. 將 `at13-next` 改名為 `at13`。
9. 若第 7 步後發生錯誤且正式目錄不存在，退出陷阱會把 `at13-previous` 還原成 `at13`。

腳本接受環境變數覆寫四個路徑，方便在本機暫存目錄做整合測試；Plesk 不提供覆寫時使用上述正式預設值。

## 失敗與回復

- 拉取失敗：Plesk 不執行新的發布，正式站保持不變。
- 來源驗證失敗：腳本在切換前退出，正式站保持不變。
- 複製失敗：腳本在切換前退出，正式站保持不變。
- 切換期間失敗：退出陷阱還原 `at13-previous`。
- 發布後才發現問題：在 Plesk 將 `/httpdocs/at13` 暫存改名，再把 `/httpdocs/at13-previous` 改回 `/httpdocs/at13`。
- Plesk Git 設定移除時，只移除 repository 連線；正式目錄仍保留。

每次成功部署只保留一個上一版，不建立無上限的歷史副本；完整歷史由 GitHub 保存。

## Repository 變更

- 新增 `tools/deploy-plesk.sh`。
- 新增腳本整合測試，使用暫存目錄驗證首次部署、第二次部署、上一版保留與無效來源拒絕。
- 更新 `README.md` 與 `CLAUDE.md` 的部署說明，記錄正式站已由 Plesk Git 自動發布。
- 保留 `.github/workflows/pages.yml`；GitHub Pages 仍是獨立備援預覽。
- 不啟用既有 Cloudflare Worker workflow。

## Plesk 設定

- 類型：Remote Git repository
- URL：`https://github.com/jason121380/keelung_web.git`
- Active branch：`main`
- Deployment mode：Automatic
- Deployment path：`/at13-repository`
- Additional deploy action：`sh /at13-repository/tools/deploy-plesk.sh`

第一次設定時，先完成 repository 變更並推送，再在 Plesk 建立連線。第一次部署由 Plesk 手動觸發並驗證；確認成功後才在 GitHub 啟用 webhook。

## GitHub 設定

- Webhook URL：從 Plesk Repository Settings 複製。
- Content type：`application/json`。
- Events：Push events only。
- Active：開啟。
- 不新增 Plesk 密碼、SSH key 或 deployment secret。

## 驗證

### 本機

- `sh -n tools/deploy-plesk.sh` 通過語法檢查。
- 在暫存目錄執行整合測試，確認部署內容等於 fixture 的 `public/`。
- 第二次部署後，新的內容位於 live，舊內容位於 previous。
- 缺少 `index.html` 的來源必須失敗，原 live 目錄必須保持不變。

### 第一次正式部署

- Plesk 顯示 pull 與 deploy 成功，commit SHA 與 GitHub `main` 一致。
- `https://www.mlgroup.io/at13/` 回傳 HTTP 200。
- 線上 `index.html` 與主要 JS、CSS 的 SHA-256 與 repository `public/` 相同。
- 瀏覽器載入完成，沒有 console error。
- `/httpdocs/at13-previous` 存在且可作為回復版本。

### Webhook 端到端

- 在 webhook 啟用後推送一個安全的 repository 文件更新。
- GitHub 顯示 webhook delivery 成功。
- Plesk 顯示已拉到該 commit 並完成部署。
- 正式站再次通過 HTTP、雜湊與瀏覽器檢查。

## 驗收條件

- `main` 的 push 會立即觸發 Plesk pull 與正式部署。
- 正式網站只包含 `public/` 的內容。
- GitHub 不保存主機登入憑證。
- 部署失敗時保留原本可用網站。
- 成功部署後保留一個可快速回復的上一版。
- GitHub Pages 繼續正常運作。
