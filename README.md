# AT13 Hair Design — 基隆仁三店

AT13 Hair Design 的形象網站靜態檔案。

- **正式站（GitHub Pages）**：<https://jason121380.github.io/keelung_web/>
- 另一份部署（Cloudflare Worker，原始上游）：<https://at13-hair-design.wahmey.workers.dev/>

## ⚠️ 這是「建置成品」的快照，不是原始碼

`public/` 裡的檔案是 2026-08-11 從線上部署鏡像下來的 Vite 建置輸出：
JavaScript 已壓縮並打包成帶內容雜湊的 chunk，且沒有發佈 source map，
所以**無法從這份快照還原出原始的 `src/` 目錄**。

Bundle 內仍留有原始模組名稱（`src/ui/preloader`、`src/ui/cursor`、
`src/ui/nav`、`ui/sections/render/footer.js`），證明原始專案存在於某處——
只是從未出現在這台機器上。若日後找到原始碼，請一併 commit 進來，
把這份快照當作備援。

這份快照**適合**：直接部署、與正式站畫面一致、把成品納入版本控制。
**不適合**：改版面或改文案——那意味著手動編輯壓縮過的 bundle。

## 目錄結構

| 路徑 | 內容 |
| --- | --- |
| `public/index.html` | 頁面外殼、metadata、`HairSalon` JSON-LD |
| `public/assets/*.js` | 18 個打包 chunk——入口、three.js、GSAP、內容資料、i18n 字典 |
| `public/assets/*.css` | 5 份樣式表 |
| `public/assets/*.webp` | 95 張圖（full／texture／thumbnail 三種變體） |
| `public/assets/gen/**/*.webp` | 10 位真實設計師人像——見下文 |
| `source/designer-cards/` | 店家提供的設計師卡片母檔，以及重裁流程 |
| `tools/crop-designer-cards.py` | 卡片 → 人像，一次產出三種尺寸 |
| `public/assets/*.woff2` | 子集化的 Noto Serif TC |
| `public/robots.txt` | 全面 `Disallow: /`——見下文 |
| `wrangler.jsonc` | Worker 設定（僅靜態資源） |
| `CLAUDE.md` | 給 AI 助理的專案導覽 |
| `STYLE.md` | 視覺與內容風格紀錄 |

網站為中英雙語（zh-Hant-TW / en），使用 three.js 驅動 WebGL 畫布、
GSAP 處理轉場。

## 設計師照片

團隊區塊使用店家自己的攝影。店家提供十張完成排版的設計師卡片
（人像＋姓名、編號、擅長項目），流程是從卡片裁出 3:4 人像，
文字則收進網站的雙語內容資料，保持可選取、可翻譯、可響應。

- 卡片母檔放在 `source/designer-cards/`——它們是母版，沒有它們就無法
  以完整品質重產人像。
- `tools/crop-designer-cards.py` 一次重建所有人像；名冊對照見該資料夾
  的 README。
- 目前使用 **2026-09-22 版卡片**（前一版 2026-08-12 留在 git 歷史中）。

圖片 id 由 `index-BMUe7iZr.js` 內的 glob map 解析，不在 map 裡的
id 會走 `./assets/gen/{,thumb/,tex/}<id>.webp` 的 fallback——設計師
人像正是靠這條路載入，所以它們以未雜湊的檔名放在
`public/assets/gen/`。每張人像有三種尺寸：full 1200×1600、
`tex/` 768×1024、`thumb/` 400×533。

名冊文字在 `content-DRgEOFBw.js`。擅長項目以 `｜` 分隔存成一字串，
i18n 層在英文時把分隔符改寫為 ` / `。

名冊：1–4 號從缺，序列為 0、5、6、7、8、10、11、12、13 號，
加上櫃台的瑪莉。

## 在快照上打過的補丁

這是建置成品，所以這裡修的任何東西都藏在壓縮 bundle 裡，
**下次真正重新建置時會被無聲還原**。每項都記下了應在 `src/` 改什麼。

### 圖片 fallback 路徑是「相對於文件」的

上述 fallback 為 `./assets/gen/…`，以頁面 URL 解析。它曾短暫改成
絕對路徑（`/assets/gen/…`），讓 Worker 的 SPA fallback（任何未知路徑
都回 index.html）在深層路徑下也能載到人像；但網站一搬到子路徑
（GitHub Pages 的專案網站掛在 `/<repo 名>/` 下）絕對路徑就全數失效，
而每張設計師人像都走這條 fallback，所以改回相對路徑：兩種主機上
頁面都只會從自己的根被存取，Worker 下的深層路徑只是渲染出一個
載不到這些圖的頁面——而且沒有任何連結指向那裡。

### `sizes` 描述的是頁面實際的版面

三條圖軌原本宣告 720px／1200px 斷點，但 CSS 實際在 700／1100 斷行，
且宣告寬度遠小於卡片實際佔位，導致瀏覽器選小一號的候選圖再放大
（team 軌最高 2.7 倍、craft 軌 2.0 倍）。現在每軌的 `sizes` 都按
現行版面重新量測：

| 軌 | `sizes` |
| --- | --- |
| team | `(max-width: 700px) 100vw, clamp(8.5rem, 15vw, 14rem)` |
| craft | `(max-width: 700px) 100vw, (max-width: 1100px) 92vw, 46vw` |
| work | `(max-width: 460px) 100vw, (max-width: 700px) 446px, (max-width: 1200px) 44vw, 36vw` |

在 360–1920 共十六個視窗寬度下量測，每軌宣告寬度都不低於實際渲染寬度。

### mid 變體的 srcset 描述符

每個變體以**長邊** 1024 為上限：正方形來源是 1024 寬，3:4 人像則是
**768** 寬。描述符原本一律寫 `Math.min(w, 1024)`，讓每張人像的 mid
變體虛報為 `1024w`（實際 768px，高報 33%），瀏覽器因此在需要 full
變體的地方停在 mid。現已改為與變體產生方式一致的推導，並逐一驗證
所有軌的所有 srcset 候選。

### 內容

Sunny、Wenny、嘎嘎、七七、垣垣 原本掛著佔位用的通用規格，現在五位
都放上各自卡片的六項擅長項目（`｜` 格式）。工作室統計原寫 11 位
設計師，實為 9 位加櫃台瑪莉，已修正。

### 團隊版面

原始 grid 一列三卡、交錯漂移、兩個放大「feature」層級，手機上還會
隱藏非 feature 卡的人像——那套處理適合生成藝術圖，不適合十張真人
照片。現在 701px 以上每位設計師佔滿版一列（小人像在左、姓名與擅長
項目在右），手機為滿幅人像＋姓名疊在下方，全部維持 3:4。改寫位於
`index-B7RSM3hh.css` 檔尾兩個註解標記之間。

## 刻意不可被索引

`public/robots.txt` 與 index.html 的
`<meta name="robots" content="noindex, nofollow">` 同時擋住搜尋引擎。
依原始碼註解：這是帶著 AT13 真實地址電話的設計提案，設計師人像已是
店家實照，但作品集、店內、港灣與氛圍圖仍是生成圖。待店家核可、
其餘圖片也換成實照後，才解除這兩道封鎖。

## 本地預覽

隨便一個靜態伺服器都行：

```bash
python3 -m http.server 8788 --directory public
```

要與正式環境行為一致（含未知路徑回 index.html 的 SPA fallback），
用 Wrangler（需 Node.js）：

```bash
npx wrangler dev
```

## 部署

### GitHub Pages（主要）

Push 到 `main`（動到 `public/**` 時）由 `.github/workflows/pages.yml`
自動發佈到 <https://jason121380.github.io/keelung_web/>，也可從
Actions 頁手動觸發。免費方案的 Pages 要求 repo 為 public。

### Cloudflare Worker（上游的部署方式）

`.github/workflows/deploy.yml` 會在 push 時部署到 Worker，但需要
`CLOUDFLARE_API_TOKEN` secret；本 repo（keelung_web）沒有這個 secret，
該 workflow 已停用。手動部署：

```bash
npx wrangler deploy   # 先用 npx wrangler whoami 確認登入的帳號
```
