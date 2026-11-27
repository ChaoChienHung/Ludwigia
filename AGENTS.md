# AGENTS

本文件是 Ludwigia 的根級 Agent 執行指引與**全站不可退化核心契約**（UTF-8 上限 12 KiB，`tests/test_handoff.py` 守門；設計理由見 `docs/design/design.md` §17）。子系統專屬契約已依領域無損分流至對應檔案（見下方「按需查詢」）；專案術語、日常工作流與 Repository Map 由 `README.md` 維護，功能導覽見 `docs/README.md`。

## 常用指令（Commands）

依影響範圍跑最小必要檢查；跨模組或交付前跑完整守門（不要把範例專案的 `tsc` / `vitest` 當成本 repo 命令）：

```bash
python3 -m unittest tests.test_toolkit_data   # 相鄰 Python 單元測試（依改動換模組）
python3 tools/create_content.py --self-test   # 內容生成器自檢
python3 cli.py build-pages --check            # 手寫頁面 shell 同步檢查
python3 -m unittest tests.test_page_shell     # 頁面 shell 與 preload 守門
python3 cli.py build-pensieve --check         # Pensieve 角色快取同步檢查
python3 cli.py test                           # 全站完整守門
```

視覺與互動變更另按 `docs/rules/checklist.md` 做相關頁面的桌機與手機檢查。

## 三檔邊界（Boundaries）

### ✅ Always（總是做）

- **開工先對齊**：讀 `README.md` 的「專案術語（Terminology）」與「Repository Map」，依 `docs/README.md` 的「功能導覽」定位起始文件與實作範圍。接續工作時先讀 `HANDOFF.md`，再以使用者最新指令、`git status --short` 與 source 核對（快照過期以現況為準）。
- **先查契約再改 source**：先讀對應子系統契約（見下表）與相鄰實作，改動保持聚焦，沿用現有元件、資料流與設計 token。
- **寫作先對齊全站風格**：撰寫或大幅改寫 `notes/`、`writing/`、`canvas/` 內容前，先讀 `docs/author/writing-notes.md` 的統一 `<draft>` 骨架與寫作原則，再依 `docs/README.md` 功能導覽查對應的 `docs/guide/`、`docs/specs/` 與內容契約，並對照相鄰已發布文章的理解路徑與篇幅；避免只把大綱擴成條列式摘要。
- **文檔全域連貫**：更新任何文檔（`README.md`、`AGENTS.md`、`HANDOFF.md`、spec 等）時，嚴禁局部外掛拼貼（local attach）；修改後須通讀上下文，檢查邏輯自洽、無重複矛盾、過渡自然。
- **交付前核對**：確認 diff 只含預期 source、必要生成物與受影響文檔；報告改了什麼、跑了哪些檢查、哪些未驗證。建立 PR 時標題與說明指出變更範圍與驗證結果。
- **更新交接快照**：工作中斷、移交或進行中狀態有實質變化時更新 `HANDOFF.md`（完成且無續作時明寫「無」）。每項用短標題與「背景／現況／待解問題／下一步」（有外部阻礙才加「阻礙」），只留最新可核對事實，上限約 2,000 tokens 且 UTF-8 不超過 6 KiB（`tests/test_handoff.py` 守門）。

### ⚠️ Ask first（先問再做）

- 安裝新依賴、刪除資料、推送（push）或發布（deploy）前，先確認任務授權與影響範圍。
- 不確定契約、或修正將跨越既有子系統邊界形成大範圍重構時，先整理已查到的事實、具體案例與最小可行方案，再請使用者決定。

### 🚫 Never（絕不做）

- 不在 repo 內提交任何 token、API key、憑證或包含敏感參數的連結（`secret.txt` 必須維持在 `.gitignore`）。
- 不提交授權不清或無法長期維護的第三方整頁 dump / embed（特別是帶大量外部依賴的匯出 HTML / iframe）。
- 不手改由生成器負責的 HTML、搜尋索引、`<!-- shell:navbar -->` / `<!-- shell:footer -->` 內容、靜態 i18n `<title>` 或編譯 bundle。
- 不把 `TODO.md` 或 `REVIEW.md` 的未指派事項當作正在續做的工作。
- 不在 `core/` 存放生成物（如 search index）或任何子系統 build output，也不因局部任務引入平行狀態或硬編碼色盤。

## 按需查詢：子系統契約分流

修改以下領域時，**必須先讀對應契約檔**（完整細則已分流至這些檔案，根目錄不重複抄寫）：

| 工作領域／路徑 | 對應契約檔 |
| --- | --- |
| `notes/`、`writing/`、`canvas/`、`tools/create_content.py`、`tools/translate_content.py`、`search/indexer.py`（metadata、標籤、自訂語法、寫作鷹架、Markdown 格式） | `docs/rules/content-authoring-contracts.md` |
| 首頁 `data/`（Timeline / Skills / Credentials）、`assets/css/`、`i18n/`、Theme / Palette / Reading Mode / Settings / Mobile IA / 響應式標籤 | `docs/rules/ui-and-data-contracts.md` |
| `portals/`（Portals 樞紐、Digital Garden、Pensieve 2.5D 幾何／效能／角色資料） | `portals/AGENTS.md` |
| Agent 工程規範（軟硬護欄、踩坑紀錄、Eval 與工作流，工具無關） | `docs/agents/`（`guardrails.md`、`provenance.md`、`evals.md`、`workflows.md`） |
| 其他功能規格、設計理由與實作範圍 | `docs/README.md`（「功能導覽」） |

## 全站不可退化核心契約（Site-Wide Invariants）

- **單一真相來源與搜尋索引**：`search/indexer.py` 從 `notes/`、`writing/`、`canvas/` 再現性生成 `search/search-index.json` 與 `search/search-index.js`（定義 `window.SITE_SEARCH_INDEX`）。所有搜尋與瀏覽入口只讀索引，不維護第二份 tags/summary/related；允許內容放在巢狀子目錄（`notes/**/<slug>.html` 等），且 `search/search-index.js` 須能在 `file://` 場景載入。
- **頁面 Shell 與載入順序守門**：
  - `pages/_shared/` 是全站 shared chrome 的唯一來源（`tools/content_styles/_shared/` 只留內容生成流程專用 partial）。手寫頁面由 `cli.py build-pages` 組裝，帶 `data-i18n-page` 的靜態 `<title>` 從 `i18n/` bundle 的 `title.en` 生成（`tests/test_page_shell.py` 守門）。
  - 首屏 Theme/Palette class 只由 `core/theme-preload.js` 掛上，於 `<head>` 第一個 stylesheet 前以 `<script src>` 載入，不得內嵌 inline 複本（`tests/test_page_shell.py` 守門）。
  - 主站共用 runtime 由 `core/site/NN-*.js` 依編號以 classic `<script>` 載入，清單只維護於 `pages/_shared/runtime.html`；新增頂層宣告必須「先定義後執行」，不得依賴跨檔 hoisting（`tests/js/runtime_smoke.cjs` 與 `tests/test_page_shell.py` 守門）。
- **探索入口與偏好狀態**：Labs 展示原型與可重用資源；Portals 負責 Garden / Pensieve 境域導覽；FAB 可直達 Portals / Labs。Toolkit 種類與用途只由 `data/Toolkit/toolkit.json` 維護，Ludwig 密語只切換 Grimoire 文案。語系／Theme／Palette 維持 client-side（`localStorage`）並向後相容舊值 alias。
- **最小工具鏈與資產分層**：核心工作流（新增／修改內容、更新索引）可用 Python stdlib 完成，不引入後端或資料庫依賴。跨頁共用資源放 `assets/`；子系統自帶 build 產物不反向耦合 `core/`。
- **生成物白名單策略**：僅部署必需品進版控，其餘一律 `.gitignore`（例：`portals/realms/garden/_floral_dist/`）。目前白名單（必須 commit）：
  - `search/search-index.json`、`search/search-index.js`
  - `portals/realms/garden/floral-assets/`、`portals/assets/`
  - `portals/realms/pensieve/data/characters.json`
- **參照既有範例**：首頁 source JSON 與渲染分工看 `data/Skills/skills.json` 與 `assets/js/about-skills.js`；頁面 shell 看 `pages/_shared/` 與 `tests/test_page_shell.py`；新增 API 或外部服務優先復用既有客戶端，不在 UI 複製請求邏輯。

## 工程紀律與任務追蹤

- **把重複錯誤變成可執行約束**：遇同類回歸或反覆 review 意見時，先找根因與可重現案例；優先改資料流、API 或模組邊界並補自動化測試，只有無法可靠自動判定的原則才寫進 `AGENTS.md` 或對應契約檔。
- **探索節奏與技術債**：除非必要，不先通讀整個 repo；從功能導覽與相鄰實作縮小範圍，探索後回補受影響文件。若發現架構過度耦合（big ball of mud / god object），主動提出可重現問題與切分方案。
- **文件分工維護**：`README.md`（術語／地圖／工作流）、`docs/README.md`（功能導覽）、`AGENTS.md` 與分流契約檔（硬約束）、`HANDOFF.md`（停點）、`TODO.md`（待辦）、`REVIEW.md`（待驗收）。不把逐檔 Doc Map 或 backlog 複製到多處；功能歸屬改變才改功能導覽，目錄責任改變才改 Repository Map。
- **任務追蹤流程**：討論確認的新任務以可驗收描述（影響範圍、預期行為、驗收方式）用 checkbox 記到 `TODO.md`；實作完成待作者驗收時移至 `REVIEW.md`（頂層 `[ ]` 待審、內部已完成步驟可保留 `[x]`，附精簡成果、驗證證據與 Review 重點）；作者確認後移除，後續工作另立 `TODO.md` task。
