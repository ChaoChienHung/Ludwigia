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
| Git hooks | `cli.py install-hooks` 會指向 `.githooks/` | `.githooks/` 不在 repo 裡，指令會直接失敗 |
| 生成物白名單 | World 的 `data/characters.json` 有提交且執行期必需 | `AGENTS.md` 的白名單沒列它，規則與現況不一致 |
| 部署 | 同時有 Cloudflare（`wrangler.jsonc`）和 GitHub Pages（Jekyll workflow） | 兩條部署路徑的排除規則不同（`.assetsignore` vs Jekyll 預設），上線內容可能不一致 |
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

### Phase 1：小型修正（低風險，不影響畫面）

- [ ] 補回 `.githooks/`（pre-commit 跑 `cli.py test`、pre-push 檢查索引是否最新），或移除 `install-hooks` 指令；二擇一由作者決定。
- [ ] 把 `portals/realms/world/data/characters.json` 寫進 `AGENTS.md` 生成物白名單。
- [ ] 決定唯一的部署路徑（Cloudflare 或 GitHub Pages），另一條移除或明確標成備援，並讓兩邊的排除規則一致。
- [ ] 等 Portals session 合併後，移除 `portals/package.json` 中未使用的 `@google/genai`、`express`、`dotenv`，重新 build 確認產物不變。

### Phase 2：手寫頁面 shell 收斂（中風險，影響畫面）

- 目標：手寫頁面的 `<head>`、navbar、footer 也從 `pages/_shared/` 生成，和內容頁共用同一套 partial。
- 做法：手寫頁面改成 `*.src.html` + 一個 stdlib 的 Python 組裝步驟（`cli.py build-pages`），產物照樣提交，維持 `file://` 可用。
- 守門：測試確認每個手寫頁面的 navbar 都和 partial 一致；組裝結果可重現。
- 驗收：作者在桌面與手機看過首頁、Portfolio、More、Projects、Search、Settings、Tag、Labs。

### Phase 3：拆分 `core/script.js`（中高風險）

- 目標：依功能拆成 `core/site/*.js`（例如 `theme.js`、`settings.js`、`navigation.js`、`fab.js`、`copilot.js`、`ambient.js`、`note-overlays.js`），保留同樣的全域 API（`window.LudwigLanguage`、`LudwigSettingsRuntime` 等）與事件名稱（`ludwig-language-changed`、`ludwig-theme-changed`、`ludwig-palette-changed`）。
- 不引入 bundler：維持多個 `<script src>` 依序載入，內容頁只載入需要的模組。
- 守門：先補一組 Node `vm` 的 smoke test（以最小 DOM stub 載入各模組，確認不會在載入時拋錯、全域 API 仍存在），再開始拆。
- 驗收：作者逐一切換 Theme / Palette / Effects / 語言，並檢查內容頁的 Outline、Metadata、Reading Mode、quiz。

### Phase 4：CSS 分層（中高風險，影響畫面）

- 目標：把 `shared.css` 依 token / layout / component / theme / page 拆檔，並把 ambient 特效的 `:not()` 排除清單改成 opt-in：只有內容容器加上一個 class 才提升層級，浮層預設不受影響。
- 守門：測試確認拆檔後選擇器總數與宣告不變（只搬位置）；排除清單改寫則另開 commit。
- 驗收：作者在 11 套 Palette × 6 種 Theme 下抽查首頁、內容頁與 settings。

### Phase 5：拆分 `tools/create_content.py`（低到中風險，不影響畫面）

- 目標：拆成 parser、metadata、renderer、template 四個模組，`create_content.py` 只保留 CLI。
- 守門：重構前後對所有 source `.md` 重新生成，輸出必須逐位元組相同（這是最強的不退化保證，因為生成物本來就提交在版控裡）。

## 驗收與狀態追蹤

- 每完成一個階段，在 `TODO.md` 的 Constellation Queue 記下完成內容與 review 重點，並更新本文件的勾選狀態。
- 影響畫面的階段（2、3、4）在作者驗收前不視為完成。
