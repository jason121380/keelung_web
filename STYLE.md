# STYLE.md — AT13 視覺與內容風格紀錄

從建置成品的 CSS（`index-B7RSM3hh.css`）整理出的設計 token 與
內容慣例。改任何視覺相關的東西前先讀這份，維持一致。

## 主題

單一深色主題（`data-theme="ink"`），`color-scheme: dark`，
`theme-color #08090B`。基調：墨黑底、骨白字、黃銅點綴、
一抹港灣綠——低調、襯照片、帶手工感的沙龍質感。

## 色彩 token

| Token | 值 | 用途 |
| --- | --- | --- |
| `--ink` | `#08090B` | 背景墨黑 |
| `--ink-line` | `#23262B` | 深色分隔線 |
| `--bone` | `#EDE8E1` | 主文字骨白 |
| `--bone-dim` | `#8B857D` | 次要文字 |
| `--brass` | `#C6A15B` | 黃銅金——強調、游標、編號 |
| `--brass-hi` | `#E4C88B` | 黃銅亮部 |
| `--harbour` | `#2E4F52` | 港灣綠——基隆意象的點綴色 |

線條多以 `color-mix` 從 `--bone` 調透明度：`--line-soft`（11%）、
`--line-hard`（20%）、`--brass-line`（`--brass` 62%）。
新增顏色時優先沿用這些 token 與 color-mix 手法，不要引入新色票。

## 字型

| Token | 字族 | 用途 |
| --- | --- | --- |
| `--f-display` | Fraunces（→ Noto Serif TC → ui-serif） | 拉丁展示字 |
| `--f-han` | Noto Serif TC（→ Fraunces） | 漢字標題——`:lang(zh-Hant)` 自動切換 |
| `--f-ui` | Inter Tight（→ Noto Sans TC） | 介面小字 |

- Fraunces 用了 variable 軸：`--fv-display: "opsz" 144, "wght" 260,
  "SOFT" 8, "WONK" 1`——超大光學尺寸、細字重、帶一點歪斜的襯線個性。
- Noto Serif TC 以子集化 woff2 內嵌（`public/assets/*.woff2`），
  Google Fonts 為線上來源。
- 字距：`--ch-lead .06em`、`--ch-tail .2em`（小標題的字母間距）。

## 動態

- 轉場曲線一律用現有 easing token：`--e-out`（`.16,1,.3,1`）為主，
  另有 `--e-in`、`--e-inout`、`--e-glide`、`--e-arrive`、`--e-drop`。
- 時長階層：`--d-fast .34s` / `--d-base .62s` / `--d-slow 1.1s` /
  `--d-vslow 1.8s`；`prefers-reduced-motion` 時全部降為 `1ms`——
  新動畫也必須遵守這個降級。
- 背景為 three.js WebGL 畫布（雨絲／水氣質感），內容轉場用 GSAP。
- 自訂游標：黃銅圓點＋圓環（`--cursor-*` token），混合模式 exclusion。

## 圖片慣例

- 一律 WebP，三種變體：full（長邊 1600）／`tex/`（長邊 1024，
  3:4 人像為 768 寬）／`thumb/`（400 寬）。
- 人像固定 3:4。設計師人像從卡片母檔裁出，臉部置中、
  避開頂部字標——流程見 `source/designer-cards/README.md`。
- `srcset` 描述符必須等於檔案實際寬度；`sizes` 必須反映 CSS 實際
  版面（斷點 700 / 1100px）——歷史教訓見根目錄 README 補丁一節。

## 內容與文字慣例

- 雙語 zh-Hant-TW / en，所有文案在 `content-DRgEOFBw.js` 成對出現，
  不可只改一邊。
- 擅長項目：一人一字串，項目間用全形 `｜` 分隔（英文渲染時由
  i18n 層改寫為 ` / `），同項目內的並列用頓號「、」。
- 設計師稱謂格式：「N號設計師」，主管加註「・副理」；櫃台為
  「櫃台公關」。網站上 8、11、13 號不帶括號本名，5、6 號保留暱稱
  （店家指示）；櫃台寫「瑪莉」。
- 中文標點用全形，中英夾雜時英文名保持原樣（AMY、Jerry、Wendy）。
- 語氣：精簡、專業、帶溫度——參考現有文案「以專業技術與細膩溝通，
  打造兼具質感、好整理與耐看的專屬髮型。」
