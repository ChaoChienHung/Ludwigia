# Refactor Roadmap

這份文件記錄 Ludwigia 的整體重構計畫：目前哪裡有技術債、要怎麼分階段處理、每一階段怎麼確認沒有退化。技術棧本身見 `docs/tech/tech-stack.md`；不可退化的契約見 `AGENTS.md`。

最後更新：2026-11-15。

## 原則

1. **不退化優先於好看。** 每一階段都要先有守門測試（或先補上），再動手改；改完要能說出「哪些行為已驗證、哪些還沒」。
2. **一階段一個 commit。** 出問題時可以單獨 revert，不會牽連其他階段。
3. **先等價改寫，再改行為。** 重構階段只換結構、不換行為；要改行為（例如重新設計 UI）另開一個階段，並由作者在瀏覽器驗收。
4. **避開正在進行的工作。** `portals/` 目前有獨立 session 在做效能優化，主站重構不碰 `portals/`，等那邊合併後再處理。
5. **畫面驗收由作者負責。** 這個專案目前沒有 headless 瀏覽器測試；會影響畫面的階段，完成後需要作者用桌面和手機實際看過。

## 盤點結果

| 項目 | 現況 | 問題 |
| --- | --- | --- |
| Theme / Palette preload | 原本 123 個 HTML 各內嵌一份相同的 inline script | 新增 theme 或 palette 要改 123 個檔案，手寫頁面很容易漏改 → **已在 Phase 0 解決** |
| `core/script.js` | 4,140 行，約 20 個 `init*` 功能（navbar、settings、FAB、Copilot、Companion、ambient 特效、內容頁 overlay、quiz…） | 單一檔案承擔太多責任（god object），任何頁面都得載入全部程式碼，改一處很難確認不會影響別處 |
| `assets/css/site/shared.css` | 8,349 行 | 元件、Theme、頁面樣式混在一起；Theme ambient 用一長串 `body > :not(#a):not(#b)…` 排除清單把所有 body 子元素設成 `position: relative; z-index: 1`，新增任何浮層（例如 modal）都得回來加一條排除 |
| 手寫頁面的 navbar | 首頁、`pages/`、`tag/`、`labs/` 等手寫頁面各自複製一份 navbar | `AGENTS.md` 規定 navbar 以 `pages/_shared/` 為唯一來源，但目前只有生成的內容頁遵守，手寫頁面已經出現不一致（例如 Labs 子頁的 navbar 沒有品牌 logo 和下拉選單） |
| `tools/create_content.py` | 2,790 行 | parser、metadata、渲染、模板替換都在同一個檔案 |
| Git hooks | `cli.py install-hooks` 會指向 `.githooks/` | `.githooks/` 不在 repo 裡，指令會直接失敗 → **已在 Phase 1 補回** |
| 生成物白名單 | World 的 `data/characters.json` 有提交且執行期必需 | `AGENTS.md` 的白名單沒列它，規則與現況不一致 |
| 部署 | 同時有 Cloudflare（`wrangler.jsonc`）和 GitHub Pages（Jekyll workflow） | 兩條部署路徑的排除規則不同（`.assetsignore` vs Jekyll 預設），上線內容可能不一致 → **已在 Phase 1 收斂為 Cloudflare** |
| Portals 依賴 | `portals/package.json` 宣告 `@google/genai`、`express`、`dotenv` | `portals/src` 沒有使用這些套件；前端專案帶著 API SDK 也有誤把金鑰打包進前端的風險 |
| `docs/tech/README.md` | 技術棧摘要 | 仍寫著已搬走的 `garden/` 路徑 → **已在 Phase 0 改為指向 `tech-stack.md`** |

## 分階段計畫

### Phase 0：共用 preload 與文件（已完成）

- 新增 `core/theme-preload.js`，取代 123 份 inline script；生成器模板 `head_links.html` 同步改用它。
- 驗證：
  - 用 Node 把新舊腳本在 192 種 theme × palette 組合下逐一比對（含大小寫、空白、`__proto__` / `constructor` 這類鍵、localStorage 拋錯），結果完全一致。
  - 重新生成一篇內容頁，輸出與直接替換後的檔案逐位元組相同。
  - 新增 `tests/test_page_shell.py`：禁止 inline 複本回流、檢查路徑可解析且在第一個 stylesheet 之前載入、palette 清單與 `palette-tokens.css` 一致、保留 `galaxy-night` 舊值 alias。
- 新增 `docs/tech/tech-stack.md` 與本文件。

### Phase 1：小型修正（已完成）

- [x] 補回 `.githooks/`，行為依 README 原本的規格：`pre-commit` 重生 staged 的內容頁 `.html` 並一起 stage；`pre-push` 跑 `cli.py test`，另外擋下過期的 `search/search-index.{json,js}` 與 World `characters.json`。已在暫時的 worktree 實測兩個 hook。
- [x] 把 `portals/realms/world/data/characters.json` 寫進 `AGENTS.md` 生成物白名單。
- [x] 部署路徑收斂為 Cloudflare：移除 GitHub Pages 的 Jekyll workflow；`.assetsignore` 補上 `.githooks/` 與 `.claude/`。GitHub 端的 Pages 設定需要作者在 repo Settings 手動關閉。
- [x] 移除 `portals/package.json` 中未使用的 `@google/genai`、`express`、`dotenv`、`@types/express`，以及與 Vite 8 版本衝突、也沒有直接使用的 `esbuild`。重新 build 後 JS 與提交的版本逐位元組相同；順便用 `cli.py build-portals` 對齊先前多出未用 Tailwind 變數的 CSS。

### Phase 2：手寫頁面 shell 收斂（已完成，待作者驗收畫面）

- 目標：手寫頁面的 `<head>`、navbar、footer 也從 `pages/_shared/` 生成，和內容頁共用同一套 partial。
- 做法（實作時調整）：不另外維護 `*.src.html`，改在頁面本身用 `<!-- shell:navbar -->` / `<!-- shell:footer -->` 標記區塊，由 stdlib 的 `tools/build_pages.py`（`cli.py build-pages`）重寫標記內容。這樣每頁仍只有一個檔案，產物照樣提交，`file://` 可用。
- 結果：16 個手寫頁面原本有 9 種 navbar（部分缺 logo、缺 Skills / Credentials、少下拉選單；`notes/index.html` 還多一個 `</div>`），現在全部由 `pages/_shared/navbar.html` 生成；footer 由新的 `pages/_shared/footer.html` 生成。另發現 73 篇內容頁是舊版生成的（navbar 缺 logo、tag concept 未對齊），已用目前的生成器重生並重建索引。
- 守門：`tests/test_page_shell.py` 確認手寫頁面的 shell 與 partial 一致、每頁恰好一個 navbar、標籤成對且連結可解析，並確認所有內容頁的 navbar 與 partial 一致；`pre-push` 也會檢查。
- 驗收：作者在桌面與手機看過首頁、Portfolio、More、Projects、Search、Settings、Tag、Labs。

### Phase 3：拆分 `core/script.js`（已完成，待作者驗收畫面）

- 目標：依功能拆成 `core/site/*.js`（例如 `theme.js`、`settings.js`、`navigation.js`、`fab.js`、`copilot.js`、`ambient.js`、`note-overlays.js`），保留同樣的全域 API（`window.LudwigLanguage`、`LudwigSettingsRuntime` 等）與事件名稱（`ludwig-language-changed`、`ludwig-theme-changed`、`ludwig-palette-changed`）。
- 不引入 bundler：維持多個 `<script src>` 依序載入，內容頁只載入需要的模組。
- 守門：先補一組 Node `vm` 的 smoke test（以最小 DOM stub 載入各模組，確認不會在載入時拋錯、全域 API 仍存在），再開始拆。
- 驗收：作者逐一切換 Theme / Palette / Effects / 語言，並檢查內容頁的 Outline、Metadata、Reading Mode、quiz。

### Phase 4：CSS 分層（已完成，待作者驗收畫面）

- 目標：把 `shared.css` 依 token / layout / component / theme / page 拆檔，並把 ambient 特效的 `:not()` 排除清單改成 opt-in：只有內容容器加上一個 class 才提升層級，浮層預設不受影響。
- 守門：測試確認拆檔後選擇器總數與宣告不變（只搬位置）；排除清單改寫則另開 commit。
- 驗收：作者在 11 套 Palette × 6 種 Theme 下抽查首頁、內容頁與 settings。

### Phase 5：拆分 `tools/create_content.py`（已完成）

- 目標：拆成 parser、metadata、renderer、template 四個模組，`create_content.py` 只保留 CLI。
- 守門：重構前後對所有 source `.md` 重新生成，輸出必須逐位元組相同（這是最強的不退化保證，因為生成物本來就提交在版控裡）。

## 驗收與狀態追蹤

- 每完成一個階段，將待作者驗收的成果與 Review 重點記到 `REVIEW.md`，並更新本文件的勾選狀態。
- 影響畫面的階段（2、3、4）在作者驗收前不視為完成。

## Phase 3–5 實作紀錄（2026-11-17 ～ 2026-11-18）

### Phase 5：`tools/create_content.py` → `tools/content/`

- 以 AST 原樣搬移函式，不改任何邏輯；`create_content.py` 從 2,790 行降到約 550 行，只留 CLI 與自我測試，並 re-export 原本的函式名稱給既有呼叫端與測試。
- 原本的模組全域變數（`_ACTIVE_*`）集中到 `tools/content/render_state.py`。
- 驗證：重構前先用舊生成器把 110 篇 source 全部重生兩次，確認輸出可重現並存成基準；重構後再重生一次，110 篇 HTML 與搜尋索引都與基準逐位元組相同。

### Phase 3：`core/script.js` → `core/site/NN-*.js`

- `script.js` 的 167 個頂層宣告全是 `const` / `let`（沒有會 hoist 的 `function` 宣告），原本就必須「先定義後執行」；依序載入的 classic script 共用同一個全域詞法作用域，所以照原順序切開語意不變。
- 切成 12 個檔案，接起來與原檔逐位元組相同，每檔都能單獨編譯。頁面改由 `pages/_shared/runtime.html` 依序載入（手寫頁面經 `build-pages`，內容頁經生成器模板），`core/script.js` 已移除。
- 與原計畫的差異：這一階段只做「原始碼分檔」，所有頁面仍載入全部 12 個檔案；依頁面只載入需要的模組留作後續。
- 守門：`tests/js/runtime_smoke.cjs` 用最小 DOM 替身在 Node 依序執行全部模組，確認多種頁面路徑下載入不拋錯、`window.Ludwig*` API 完整（打亂順序時會報錯，證明測試有效）；`tests/test_page_shell.py` 確認 runtime 清單與 `core/site/` 一致、每頁依序載入。

### Phase 4：`shared.css` 分層與 ambient 規則改為 opt-in

- `shared.css` 改成索引檔，依序 `@import` 11 個分檔；分檔接起來與原檔逐位元組相同，每檔大括號與註解成對。
- ambient 的 5 條 `body.<主題> > :not(#a):not(#b)…` 排除清單，改為 opt-in：只把 `section`、`main`、`header`、`article`、`footer` 抬到 ambient 圖層之上，浮層不再需要登記；以 `:not(#ambient-content-lift)` 維持原本的 ID 等級特異性。
- 順帶修正兩個既有問題：搜尋頁的 `#gardenHelpModal` / `#gardenTagsModal` 原本不在排除清單，ambient 主題下會被改成 `position: relative`；排序抽屜原本是 `<section>`，改成 `<div role="dialog">`，避免被當成內容抬升。
- 驗證（無頭 Chrome，不開視窗、不截圖）：比對舊版（單一 `shared.css` + `script.js`）與新版在 10 個頁面 × 6 種 Theme / Palette 下每個元素的 computed style，差異與「舊版自己重跑」的雜訊相同；另對 34 個頁面 × 6 種組合比對 `<body>` 直接子元素的 `position` / `z-index`，扣除雜訊後只剩上述兩個 modal 修正與兩個空錨點 div 不再被抬升。
