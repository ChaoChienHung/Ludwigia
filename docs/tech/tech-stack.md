# Tech Stack

這份文件列出 Ludwigia 目前**真的在用**的技術，依子系統分組，並說明每一項負責什麼、版本在哪裡宣告。契約與不可退化的規則看 `AGENTS.md` 和 `docs/specs/system-spec.md`；這裡只回答「用了什麼、放在哪、怎麼跑」。

最後盤點：2026-11-15。版本號以各自的 `package.json` 或 HTML 引用為準，這裡記的是盤點當下的值。

## 全貌

Ludwigia 分成四層，越往下越獨立：

| 層 | 位置 | 技術 | 需要 build 嗎 |
| --- | --- | --- | --- |
| 主站 | `index.html`、`pages/`、`tag/`、`notes/`、`writing/`、`canvas/` | 靜態 HTML + 原生 JS + CSS，Bootstrap 5 | 不用（內容頁由 Python 生成並提交） |
| 內容工具鏈 | `cli.py`、`tools/`、`search/indexer.py` | Python 3（只用 stdlib） | 產出 HTML 與搜尋索引 |
| Portals 與 Realms | `portals/`、`portals/realms/garden/`、`portals/realms/world/` | React 19 + Vite + Tailwind（Portals、Garden）；原生 Canvas（World） | Portals、Garden 要 build，產物提交進版控 |
| Labs 原型 | `labs/` | 靜態頁；部分原型用 React Three Fiber | 只有原型本身需要 |

## 主站（純靜態）

### 語言與執行環境

- **HTML / CSS / JavaScript（ES2020+，不經打包）**：每頁直接用 `<script src>` 載入，必須能在 `file://` 或簡易靜態伺服器下運作。
- 沒有後端、沒有資料庫。使用者偏好（語言、Theme、Palette、Effects、Copilot 可見性）全部存在 `localStorage`。

### 第三方函式庫（CDN）

| 函式庫 | 版本 | 用途 | 來源 |
| --- | --- | --- | --- |
| Bootstrap | 5.3.3 | 版面格線、navbar、dropdown、modal | cdn.jsdelivr.net |
| Font Awesome | 6.5.0 | 圖示 | cdnjs |
| AOS | 2.3.4 | 捲動進場動畫（`data-aos`） | cdnjs |
| KaTeX | 0.16.11 | 內容頁與搜尋預覽的數學公式 | cdn.jsdelivr.net / cdnjs |
| flag-icons | 7.3.2 | 語言選單國旗 | cdn.jsdelivr.net |

### 共用 runtime（`core/`）

| 檔案 | 責任 |
| --- | --- |
| `core/theme-preload.js` | 首屏前在 `<html>` 掛上 theme / palette class，避免閃爍；全站唯一來源（`tests/test_page_shell.py` 守門） |
| `core/i18n-preload.js` | 首屏前決定語言，必要時暫時隱藏尚未翻譯的頁面 |
| `core/i18n.js` | 依 `i18n/*.json` 字典替換頁面文字 |
| `core/site/NN-*.js` | 全站共用 runtime，依編號順序以多個 classic `<script>` 載入（清單在 `pages/_shared/runtime.html`）：`01-bootstrap`、`02-language`、`03-cipher-mode`、`04-assistants`（Copilot / Companion）、`05-cipher-shortcut`、`06-theme`、`07-settings`、`08-page-context`、`09-navigation`（行動導覽、FAB）、`10-ambient`、`11-content-page`、`12-note-overlays`。原本是單一的 `core/script.js` |
| `core/search-core.js` | 搜尋索引的正規化、排序、tag ontology 比對、輕量 Markdown 預覽渲染（`window.SearchCore`） |

### 頁面專用腳本（`assets/js/`）

每個檔案只服務一個頁面或區塊，並從自己的 source JSON 讀資料：

- 首頁：`about-skills.js`（`data/Skills/`）、`about-credentials.js`（`data/Credentials/`）、`about-timeline.js`（`data/Timeline/`）
- 搜尋與瀏覽：`search-page.js`、`search-ui.js`、`section-landing.js`、`tag-page.js`
- 內容頁：`note-information.js`（`data/Ontology/information-ontology.json`）、`note-tags.js`
- 站內助手：`copilot-base.js`、`copilot.js`、`companion.js`
- Labs：`question-bank-labs.js`、`grimoire-labs.js`（`data/Grimoire/`）
- 設定：`settings-page.js`

### 樣式

- `assets/css/style.css`：主站入口樣式表。
- `assets/css/site/palette-tokens.css`：11 套 Palette 的色彩 token，Portals / World 也從這裡取 accent。
- `assets/css/site/shared.css`：主站樣式的索引檔，依序 `@import` 11 個分檔 `shared-NN-*.css`（tokens、base、theme-ambient、site-chrome、mobile-navigation、hubs、settings、home-sections、garden-search、footer-contact-fab、skills-credentials）。層疊順序等於原本的單一檔案；改樣式時直接改對應的分檔，分檔與 `shared.css` 放在同一目錄，`url()` 相對路徑不變。
- `assets/css/content-page/`：`notes / writing / canvas` 內容頁專用樣式。

### 多語系

- 三種語言：`en`、`zh-Hant`、`zh-Hans`。
- 頁面字典在 `i18n/*.json`；資料型區塊（Skills、Credentials、Timeline、Grimoire）的多語文字直接寫在各自的 source JSON 裡。

## 內容工具鏈（Python stdlib）

- **Python 3**（開發環境為 3.12），核心工作流**只用標準函式庫**，不需要 `pip install`。
- 統一入口是 `cli.py`：

| 指令 | 作用 |
| --- | --- |
| `build` / `build-all` | 由 source `.md` 生成內容頁 HTML，並重建搜尋索引 |
| `index` | 只重建 `search/search-index.{json,js}` |
| `serve` | 本機靜態伺服器 |
| `test` | 跑 `tests/` 底下的 unittest |
| `translate` / `translate-data` | 內容與資料檔翻譯（Gemini API） |
| `check-tags` / `scan-information` | 檢查 tag ontology、掃描可加 `<information>` 的詞 |
| `build-pages` | 把 `pages/_shared/` 的 navbar / footer 組裝進手寫頁面（`--check` 只檢查） |
| `build-world` | 由 `characters/` 與 `interactions/` 編譯 World 的 `characters.json` |
| `build-portals` | 建置 Portals |
| `install-hooks` / `clean` | 安裝 git hooks、清除生成物 |

- 主要模組：
  - `tools/create_content.py`：source `.md` → HTML 生成器的 CLI 與自我測試；實作拆在 `tools/content/`（`common`、`metadata`、`source_blocks`、`paths`、`inline`、`review_widgets`、`templates`、`markdown`，以及每頁渲染狀態 `render_state`）。樣式模板在 `tools/content_styles/`。
  - `tools/content_contract.py`：metadata 解析與 tag ontology 對齊。
  - `tools/information_ontology.py`、`tools/question_bank.py`：ontology tooltip 與題庫。
  - `tools/translate_content.py`：翻譯 workflow；API key 依序讀環境變數 `GEMINI_API_KEY` / `LUDWIGIA_GEMINI_API_KEY`，再讀不進版控的 `secret.txt`。
  - `tools/build_world_data.py`：World 角色資料編譯。
  - `search/indexer.py`：掃描 `notes/`、`writing/`、`canvas/`，輸出搜尋索引。
- 測試：`unittest`（`tests/`），檢查 source 契約、生成器、ontology、資料檔 schema 與共用頁面 shell。

## Portals 與 Realms

### Aetheria Portals（`portals/`）

- **React 19 + TypeScript + Vite 8 + Tailwind CSS 4**，動畫用 `motion`，圖示用 `lucide-react`。
- `npm run build`（或 `cli.py build-portals`）產出 `portals/assets/`，產物**必須提交**，靜態站才能直接載入。
- 字型：Google Fonts（Cinzel、Plus Jakarta Sans）。
- 音效：瀏覽器 Web Audio API 程序化生成。

### Garden of Ludwigia（`portals/realms/garden/`）

- **React 19 + Vite 6 + Tailwind CSS 4**；Markdown 用 `react-markdown`、`remark-gfm`、`remark-math`、`rehype-katex`。
- 原始碼在 `floral-patch-garden/`，產物在 `floral-assets/`（必須提交）。
- 資料只讀 `window.SITE_SEARCH_INDEX`。

### Ludwigia World（`portals/realms/world/`）

- **原生 JavaScript + Canvas 2D**，沒有框架。模組：`engine.js`（等軸測投影、深度排序、鏡頭）、`world.js`、`models.js`、`prefabs.js`、`characters.js`。
- 角色資料由 `tools/build_world_data.py` 編譯成 `data/characters.json`。
- 有自己的測試：`portals/realms/world/tests/`。

## Labs 原型（`labs/`）

- `labs/index.html`、`labs/grimoire/`、`labs/question-bank/`、`labs/shooting-mode/`：主站同一套靜態技術。
- `labs/massive-multiplayer-laser-tag/`、`labs/cosmic-flow/`：獨立原型，使用 React 19、Vite 6、three.js / React Three Fiber（含 drei、postprocessing、rapier 物理）、zustand；多人連線用 socket.io / ws，原型伺服器用 Express + better-sqlite3。這些依賴**只屬於原型**，主站不依賴它們。

## 部署與自動化

- **Cloudflare Workers 靜態資產（唯一的部署路徑）**：`wrangler.jsonc` 以 repo 根目錄為資產目錄；`.assetsignore` 排除 `tests/`、`tools/`、`docs/`、`temp/`、`*.py` 等不該上線的檔案。
- **Git hooks**：`cli.py install-hooks`（或 `scripts/install-git-hooks.sh`）把 `core.hooksPath` 指向 `.githooks/`。`pre-commit` 會重生 staged 的內容頁 `.html` 並一起 stage；`pre-push` 跑 `cli.py test`，並擋下過期的搜尋索引與 World `characters.json`。

## 生成物政策（摘要）

必須提交：`search/search-index.json`、`search/search-index.js`、`portals/realms/garden/floral-assets/`、`portals/assets/`、`portals/realms/world/data/characters.json`。其他生成物一律進 `.gitignore`。完整規則見 `AGENTS.md`「最小工具鏈」。
