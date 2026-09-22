# CLAUDE.md — AT13 Hair Design 專案導覽

AT13 Hair Design（基隆仁三店）形象網站。**所有紀錄與回覆一律使用
繁體中文（台灣）。**

## 最重要的一件事

`public/` 是 **Vite 建置成品的快照**，不是原始碼。JS 已壓縮、
無 source map，原始 `src/` 不在這個 repo。因此：

- 改內容 = 手動編輯壓縮 bundle。動手前先讀根目錄 README 的
  「在快照上打過的補丁」一節，改完也要在那裡記錄。
- 不要嘗試 `npm run build`——沒有東西可以 build。

## 部署

- **正式網址（canonical）**：<https://www.mlgroup.io/at13/>——名留
  國際的 WordPress／Plesk 主機（66.42.32.244）。Plesk Git Manager
  追蹤 `jason121380/keelung_web` 的 `main`，checkout 到非公開的
  `/at13-repository`；`tools/deploy-plesk.sh` 只把 `public/` 發布到
  `/httpdocs/at13`，並在 `/httpdocs/at13-previous` 保留上一版。
- **GitHub Pages**：<https://jason121380.github.io/keelung_web/>
  （repo：`jason121380/keelung_web`，push main 動到 `public/**` 即自動
  部署，workflow 為 `.github/workflows/pages.yml`）；它是獨立備援預覽。
- `public/` 是正式站唯一可公開的內容；不可直接把 repository 根目錄部署
  到 `httpdocs`，也不可把 webhook URL 或任何主機憑證寫入 repo。
- 網站掛在 **`/keelung_web/` 子路徑**下——所有資源引用必須是相對
  路徑，絕對路徑（`/assets/...`）在 Pages 上會 404。
- `.github/workflows/deploy.yml`（Cloudflare Worker）在 keelung_web
  repo 已停用（缺 `CLOUDFLARE_API_TOKEN`）。
- 本地預覽：`npx wrangler dev`（讀 `public/`，改檔即生效）。

## 常見任務地圖

| 要改什麼 | 動哪裡 |
| --- | --- |
| 設計師照片 | 新卡片放 `source/designer-cards/`（覆蓋同名 png）→ 調整 `tools/crop-designer-cards.py` 頂端表格的 top/bottom/face_x → 跑腳本（需 Pillow）產出 `public/assets/gen/` 三種尺寸 |
| 設計師名字／擅長項目／簡介 | `public/assets/content-DRgEOFBw.js` 的名冊（zh + en 都要改；擅長項目用 `｜` 分隔） |
| 中英文介面文字 | 同上檔案的 i18n 區段 |
| 圖片載入邏輯 | `public/assets/index-BMUe7iZr.js`（glob map + `./assets/gen/` fallback） |
| 團隊版面 CSS | `index-B7RSM3hh.css` 檔尾兩個註解標記之間 |
| 視覺風格 | 見 `STYLE.md` |

## 紅線

- `source/designer-cards/` 是母檔，只能新增或整組替換，不可刪除。
- 改壓縮 bundle 時用最小 diff（單點字串替換），改完在 README
  補丁一節記錄「原因＋若有 src 該改哪」。

## 事實速查

- 名冊：0（Eric・副理）、5（Sunny）、6（Wenny）、7（嘎嘎）、
  8（Jerry）、10（AMY）、11（七七）、12（Wendy）、13（垣垣）＋
  櫃台瑪莉；1–4 號從缺。
- 人像尺寸：full 1200×1600 / tex 768×1024 / thumb 400×533（皆 3:4）。
- 卡片現版：2026-09-22 收，寬度 962–1028px 不一。
- git remote：`origin` = `https://github.com/jason121380/keelung_web.git`
  （正式部署來源）。
