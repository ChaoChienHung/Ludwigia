# docs/tech/

這個資料夾用來放「技術面」的內容，也就是 What / How：實際用了什麼、資料怎麼流、實作怎麼運作、排查時該先看哪裡。

它的責任邊界是：

- `docs/specs/system-spec.md`：可驗證契約、資料流、schema、守門規則
- `docs/design/design.md`：設計理由、UI/UX 取捨與重大決策脈絡
- `docs/tech/`：技術棧、實作細節、排查筆記，偏 What / How

## 讀法

- 想先知道整個專案用什麼技術：先看本文
- 想查站內搜推怎麼運作：看 `docs/tech/search-and-recommendation.md`
- 想看站內 Copilot 的入口、fallback 與問題範圍規格：看 `docs/specs/copilot-entry-spec.md`
- 想看 `About Me` 下 timeline 的正式設計規格：看 `docs/specs/timeline-design-spec.md`
- 想回顧反覆踩過的工程結論：看 `docs/author/takeaways.md`
- 想確認「哪些東西不能退化」：回到 `AGENTS.md` 與 `docs/specs/system-spec.md`

## 文件清單

- `docs/tech/README.md`：`docs/tech/` 的入口頁，也是技術棧的集中摘要
- `docs/specs/copilot-entry-spec.md`：站內 Copilot 的入口位置、入口文案、fallback 與問題範圍小規格
- `docs/tech/search-and-recommendation.md`：站內搜推的資料流、排序、推薦與已知落差
- `docs/specs/timeline-design-spec.md`：`About Me` 下 timeline 的正式設計規格（desktop/mobile、point/period、MVP interaction）
- `docs/author/takeaways.md`：重要工程 takeaways（偏結論，不是正式 contract）

## Tech Stack

這份摘要只放「目前真的在用、而且會影響理解專案」的最小技術棧。

### Runtime / Languages

- Python（以 stdlib 為主）：內容生成、indexer、最小工具鏈
- HTML / CSS / JavaScript：主站是純靜態站，沒有後端
- React + Vite：只用在 `garden/` 子系統；資料仍只讀 `window.SITE_SEARCH_INDEX`

### Data / Index

- `search/indexer.py`：掃描 `notes/`、`writing/`、`canvas/`，生成 `search/search-index.{json,js}`
- `search/search-index.json`：runtime 優先抓取的索引版本
- `search/search-index.js`：提供 `window.SITE_SEARCH_INDEX`，支援 `file://` 或 JSON fetch 失敗時 fallback

### Build / Deploy Artifacts

- 白名單生成物：`search/search-index.{json,js}`、`garden/floral-assets/`
- 其它生成物一律視為本機 / CI 產物，應進 `.gitignore`

### Source Of Truth

- 內容層：source `.md` 與生成後 HTML `<head>` metadata
- 搜尋 / 瀏覽層：`search/search-index.{json,js}`
- 偏好狀態：client-side localStorage
