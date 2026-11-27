# Ludwigia

Ludwigia 是結合個人作品集、知識花園與互動探索空間的靜態網站。知識筆記、長文和視覺內容從 Markdown source 生成，讀者可以透過搜尋、標籤與 Garden 發現內容；Portals、Pensieve 和 Labs 則提供不同的探索方式。網站不需要後端或資料庫，日常內容維護以 Python 和靜態檔案完成。

英文一句話版：A static personal site, digital garden, and interactive space built from source-driven content.

## 功能與特色

- **個人作品與經歷**：首頁展示作品、Timeline、Skills 與 Credentials；Projects 頁提供作品入口。Timeline、Skills 與 Credentials 皆由各自 source JSON 維護。
- **可持續整理的內容**：Notes（知識筆記）、Writing（文章）與 Canvas（視界）以 Markdown 為主要 source，生成可閱讀、可搜尋的靜態頁面；單篇內容支援閱讀模式與 Markdown 複製／下載。
- **多條內容探索路徑**：全站搜尋支援多標籤篩選；section landing 依內容類型瀏覽；tag detail 提供穩定標籤頁；Garden 以花園與 Patch 視角探索同一份索引。
- **互動境域**：Portals 是通往各 Realm 的入口，可前往 Digital Garden 與 2.5D 的 Pensieve（儲思盆）。Pensieve 的人物與對話從 source data 生成。
- **實驗與可重用資源**：Labs 收錄 Shooting Mode、Question Bank 等實驗，以及 Toolkit 工具庫；Toolkit 可依 Template、Guide、Prompt、Skill 的種類與用途篩選，`Reference` 標明原創或外部來源；Ludwig 密語模式會顯示 Grimoire 文案。
- **個人化介面**：Theme、Palette、語言與 Effects 可在設定中調整；手機使用獨立底部導覽與觸控入口；偏好保存在瀏覽器端。

## 快速開始

用 `file://` 直接開 HTML 可能受限於瀏覽器安全策略（特別是 `fetch`），建議啟動本機靜態伺服器：

```bash
python3 -m http.server 8000
# 或 python3 cli.py serve --port 8000
```

常用本地入口：
- `http://localhost:8000/index.html`（可用 navbar 的 gear icon 打開 settings modal）
- `http://localhost:8000/pages/search.html`
- `http://localhost:8000/portals/index.html`
- `http://localhost:8000/portals/realms/garden/index.html`
- `http://localhost:8000/portals/realms/pensieve/index.html`
- `http://localhost:8000/labs/index.html`

> 驗證 Cloudflare 正式站剛部署的變更（文章列表、`Recommended Posts`、`pages/search.html`、`tag/index.html`）時，請先做 hard refresh（macOS: `Cmd + Shift + R`），避免舊快取造成誤判。

## 專案術語（Terminology）

這裡統一日常討論與 Agent 任務中的用詞；詳細 schema、語法與不可退化契約以對應的 `docs/specs/` 與 `AGENTS.md`（及其分流契約）為準。

- **Source / 單一真相來源（SSOT）**：作者實際維護的內容或資料，例如 `notes/`、`writing/`、`canvas/` 的 `.md`，或 `data/` 的 JSON。由它們生成的 HTML、搜尋索引與 bundle 不是第二份手動資料。
- **Source-driven / 再現性生成**：修改 source 後由工具重建對應輸出；相同 source 與規則應得到相同內容。內容頁用 `cli.py build`，索引用 `cli.py index`，其他子系統用各自 build 命令。
- **內容類型（Notes / Writing / Canvas）**：三種單篇內容：`notes/` 是知識筆記，`writing/` 是長文／文章，`canvas/` 是視覺內容（介面稱「視界」），皆可被全站索引。這裡的 Canvas 是內容分類，非繪圖引擎。
- **Metadata / Core Markdown / Extras**：source `.md` 的 `<meta>` 提供公開欄位；core markdown 是可攜標準正文；`<reviewkit>`、`<information>` 等自訂語法是附加層。不同視圖可退化或忽略 extras，不能把它們當 metadata。
- **搜尋索引 / SearchCore**：`search/indexer.py` 生成 `search/search-index.{json,js}` 供搜尋與瀏覽入口使用；`core/search-core.js` 是共用查詢、篩選與連結邏輯，不是另一份索引資料。
- **Section landing / Tag detail**：`notes/index.html` 等是單一內容類型的列表入口；`tag/index.html` 是可分享的單一 tag 詳情入口，非 Garden 的 Patch 視圖。
- **Garden / Patch**：`portals/realms/garden/` 是以花園方式探索索引內容的 Realm；Patch 是 Garden 同頁的探索／閱讀視角，不負責全站 tag detail 穩定網址。
- **Portals / Realm / Pensieve**：Portals 是通往各 Realm 的導覽樞紐；Realm 是獨立運作的境域；Garden 與 2.5D 的 Pensieve（儲思盆）是不同的 Realm。
- **Labs / Toolkit / Grimoire**：Labs 放實驗原型與可重用資源；Toolkit 是其中資源庫，Ludwig 密語模式才顯示為 Grimoire，兩者讀同一份 `data/Toolkit/toolkit.json`。
- **Site shell / Runtime**：`pages/_shared/` 是共用 navbar、footer 等頁面外框來源；`core/site/` 是主站共用 JS。手寫頁面透過 `cli.py build-pages` 組裝 shell。
- **Theme / Palette / Effects**：Theme 管整體表面、氛圍與可讀性；Palette 管 accent 與互動狀態色；Effects 控制可關閉動效；偏好存在瀏覽器端。
- **生成物白名單**：部署直接需要的少數輸出必須進版控（搜尋索引、Portals／Garden 資產、Pensieve 角色快取），完整清單見 `AGENTS.md`，其餘生成物一律忽略。
- **AGENTS / HANDOFF / TODO / REVIEW**：`AGENTS.md` 是 Agent 長期指引與硬約束；`HANDOFF.md` 記最近停點；`TODO.md` 管未完成與長期待辦；`REVIEW.md` 管已完成待作者驗收的工作。

## Repository Map（程式庫導覽）

讀者與 Agent 共用的目錄責任地圖；要找特定功能的規格與實作入口，從 [docs/README.md](./docs/README.md) 的「功能導覽」開始。

```text
Ludwigia/
├── notes/                     # 知識筆記（Markdown source 與生成的 HTML 內容頁）
├── writing/                   # 深度長文／文章專題（Markdown source 與生成的 HTML）
├── canvas/                    # 視覺化作品與視界內容
├── pages/                     # 主站手寫頁面與頁面骨架
│   └── _shared/               # 全站 Chrome 唯一真相來源（navbar/footer/runtime partials）
│
├── tag/                       # Tag 標籤詳情頁（跨文章 Concept 聚合檢索）
├── data/                      # 站內結構化資料來源（SSOT JSON）
│   ├── Timeline/              # 經歷與時間軸資料（timeline.json）
│   ├── Skills/                # 技能清單資料（skills.json）
│   ├── Credentials/           # 證照與修課證明（credentials.json）
│   ├── Toolkit/               # 通用工具庫與 Grimoire 魔導書（toolkit.json、resources/、prompts/）
│   └── Ontology/              # 標籤與詞彙本體知識庫（tags-ontology.json、information-ontology.json）
│
├── skills/                    # 可重用的 Agent Skills（依 SKILL.md 標準封裝）
├── labs/                      # 原型實驗室與 Toolkit（Grimoire）展示入口
├── portals/                   # 境域導覽樞紐（Portals）、Realms 與子系統 AGENTS.md
│   ├── realms/garden/         # 數位花園（Digital Garden）境域
│   └── realms/pensieve/       # 2.5D 等軸測記憶空間（Pensieve · 儲思盆）
│
├── core/                      # 全站核心 Runtime、主題預載（theme-preload.js）與搜尋核心
├── assets/                    # 全站靜態資源（CSS Design Tokens、共用 JS、字型與圖片）
├── search/                    # 搜尋索引生成器（indexer.py）與快照（search-index.json/js）
├── tools/                     # Python 建置工具鏈（create_content.py、build_pages.py 等）
├── docs/                      # 專案文件庫（specs/、design/、rules/、guide/、tech/、author/）
│   └── README.md              # 依功能查閱文件的起點（功能導覽）
│
├── tests/                     # 單元測試與自動化品質守門腳本
├── cli.py                     # 全站統一命令列入口（build、index、test、build-pages 等）
├── AGENTS.md                  # Agent 根級指引與全站不可退化核心契約
├── HANDOFF.md                 # Agent 當前工作停點交接快照
├── TODO.md                    # 未完成與長期待辦任務清單
├── REVIEW.md                  # 已完成、待作者審驗成果清單
└── README.md                  # 專案首要入口與導覽
```

## 核心理念與文件分工

### 核心理念

- **Single Source of Truth**：metadata 與正文各司其職；可索引 metadata 再現性生成，正文以 `.md` 內可攜核心內容為主，不維護第二份重複內容。
- **Tag-first & Progressive Enhancement**：用 tags 形成知識群聚（找 vs 逛互補）；先確保檢索與聚合一致可用，再疊加 Garden / Portals 等互動層。
- **Layered Scaffolding & Frictionless Progression**：知識傳遞採「底層成群鋪墊、逐層向上堆疊、零跳步、零割裂」，降低讀者心智負荷。

設計脈絡見 [docs/design/design.md](./docs/design/design.md)，系統規格見 [docs/specs/system-spec.md](./docs/specs/system-spec.md)，作者雜談見 [docs/author/dev-notes.md](./docs/author/dev-notes.md)。

### 文件分工

- `README.md`：所有人共用的專案入口（術語、地圖、快速開始與常用指令）。
- `docs/README.md`：按功能查規格、指南與實作資料夾的導覽入口。
- `AGENTS.md`（及分流契約 `docs/rules/content-authoring-contracts.md`、`docs/rules/ui-and-data-contracts.md`、`portals/AGENTS.md`）：給 Agent 的執行指引與不可退化契約。
- `docs/specs/`、`docs/design/`、`docs/rules/`、`docs/guide/`、`docs/tech/`、`docs/author/`：分別承接精確規格、設計理由、守門清單、操作步驟、技術現況與寫作筆記。
- `HANDOFF.md` / `TODO.md` / `REVIEW.md`：短期停點、待辦與待審清單（不作為網站資產部署）。

## 系統連接概覽（Site Map）

- **內容來源與索引**：`notes/`、`writing/`、`canvas/` 的單篇頁於 `<head>` 提供 `site:tags`、`site:summary`（以及可選的 `site:tag_concepts`、`site:pinned`、`site:priority`、`site:status` 與日期欄位）；`search/indexer.py` 掃描生成 `search/search-index.{json,js}`（掛載 `window.SITE_SEARCH_INDEX`）。
- **列表、搜尋與新鮮度**：`notes/index.html`、`writing/index.html`、`canvas/index.html`、`pages/search.html`、`tag/index.html` 與單篇推薦皆透過 `core/search-core.js` 消費索引，並採 freshness guard 優先抓 `search/search-index.json`（`cache: "no-store"`），失敗再退回 `search-index.js`。未指定 cover 時使用預設縮圖（`assets/images/Notes.png`、`assets/images/Writing.png`）。
- **Tag Detail 與 Ontology**：`tag/index.html` 為穩定 tag 詳情頁（支援 `?concept=...&tag=...` 並相容 `?tag=...`）；篩選與顯示優先依 ontology `concept_id` 對應目前語系 label。
- **Theme / Palette / Settings**：Dark / Light / Deep Sea / Galaxy / Sky / Garden 六主題搭配多組 Palette，設定以 navbar gear modal 為主（`pages/settings.html` 為 fallback），偏好存於 `localStorage`；詳見 [docs/guide/theme-palette-guide.md](./docs/guide/theme-palette-guide.md) 與 [docs/rules/ui-and-data-contracts.md](./docs/rules/ui-and-data-contracts.md)。
- **Portals 與 Realms**：`portals/index.html` 串接獨立探索境域——**Digital Garden**（`portals/realms/garden/`，只讀全站索引）與 **Pensieve（儲思盆）**（`portals/realms/pensieve/`，2.5D 等軸測記憶空間，詳見 [portals/realms/pensieve/README.md](./portals/realms/pensieve/README.md) 與 [portals/AGENTS.md](./portals/AGENTS.md)）。

## 日常工作流與 CLI

日常內容與建置請優先走 `cli.py`（自動串聯索引與檢查）：

1. 編輯 source（`notes/`、`writing/`、`canvas/` 的 `.md`，或 `data/` 的 JSON）。
2. 重建輸出：`python3 cli.py build <source.md>`（或整批 `python3 cli.py build-all --content-dir all`）。
3. 驗證品質：`python3 cli.py test`（或針對性跑 `check-tags` / `build-pages --check` / `build-pensieve --check`）。
4. 本機預覽並確認 Copy/Download Markdown、Reading Mode 與桌機／手機版面。

### 常用 CLI 子命令

```bash
python3 cli.py test                                          # 完整測試與守門
python3 cli.py index                                         # 重建 search-index.{json,js}
python3 cli.py check-tags                                    # 檢查 tags 與三語 ontology 覆蓋率
python3 cli.py scan-information writing/<topic>/<topic>.md   # 掃描可補 <information> 候選詞（可加 --json）
python3 cli.py build notes/<topic>/<topic>.md                # 生成單篇 HTML 並更新索引
python3 cli.py build-all                                     # 批次重生所有內容與索引
python3 cli.py build-pages                                   # 組裝手寫頁面 shell 與靜態 <title>
python3 cli.py build-portals                                 # 重建 Portals 資產
python3 cli.py build-pensieve                                # 編譯 Pensieve characters.json 快取
python3 cli.py translate --source notes/<t>/<t>.md --target-lang en --backend gemini-api
python3 cli.py install-hooks                                 # 安裝 pre-commit / pre-push Git hooks
python3 cli.py serve --port 8000                             # 啟動本機預覽伺服器
python3 cli.py clean                                         # 清理本機暫存產物
```

完整的起稿流程、寫作 Workflow、`<meta>` / `<draft>` 範例、`tools/create_content.py` 低階用法、手動 HTML、翻譯憑證與 Git Hooks 細則，請見 **[docs/guide/content-workflow-guide.md](./docs/guide/content-workflow-guide.md)**。
