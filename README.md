# Ludwigia

Ludwigia 是結合個人作品集、知識花園與互動探索空間的靜態網站。知識筆記、長文和視覺內容從 Markdown source 生成，讀者可以透過搜尋、標籤與 Garden 發現內容；Portals、World 和 Labs 則提供不同的探索方式。網站不需要後端或資料庫，日常內容維護以 Python 和靜態檔案完成。

英文一句話版：A static personal site, digital garden, and interactive space built from source-driven content.

## 功能與特色

- **個人作品與經歷**：首頁展示作品、Timeline、Skills 與 Credentials；Projects 頁提供作品入口。Timeline、Skills 與 Credentials 的資料由各自的 source JSON 維護。
- **可持續整理的內容**：Notes（知識筆記）、Writing（文章）與 Canvas（視界）以 Markdown 為主要 source，生成可閱讀、可搜尋的靜態頁面；單篇內容支援閱讀模式與 Markdown 複製／下載。
- **多條內容探索路徑**：全站搜尋支援多標籤篩選；section landing 依內容類型瀏覽；tag detail 提供穩定的標籤頁；Garden 則用花園與 Patch 視角探索同一份索引。
- **互動境域**：Portals 是通往各個 Realm 的入口，可前往 Digital Garden 與 2.5D 的 Ludwigia World。World 的人物與對話從 source data 生成。
- **實驗與可重用資源**：Labs 收錄 Shooting Mode、Question Bank 等實驗，以及 Toolkit 工具庫；Toolkit 可依 Template、Guide、Prompt、Skill 的種類和用途篩選。資源展開後的 `Reference` 標明本站原創或外部來源；Ludwig 密語模式會顯示 Grimoire 文案。
- **個人化介面**：Theme、Palette、語言與 Effects 可在設定中調整；手機使用獨立的底部導覽，內容頁的閱讀操作也有觸控入口。偏好保存在瀏覽器端。

想查各功能的實作位置與規格，從 [docs/README.md](./docs/README.md) 的「功能導覽」開始；想直接體驗網站，見下方「快速開始」。

## 專案術語（Terminology）

這裡統一日常討論與 Agent 任務中的用詞；詳細 schema、語法與不可退化契約仍以對應的 `docs/specs/` 和 `AGENTS.md` 為準。

- **Source / 單一真相來源（SSOT）**：作者實際維護的內容或資料，例如 `notes/`、`writing/`、`canvas/` 的 `.md`，或 `data/` 的 JSON。HTML、搜尋索引與 bundle 若由它們生成，不是第二份手動資料。
- **Source-driven / 再現性生成**：修改 source 後，由工具重建對應輸出；相同 source 與規則應得到相同內容。內容頁用 `cli.py build`，索引用 `cli.py index`，其他子系統用各自的 build 命令。
- **內容類型（Notes / Writing / Canvas）**：三種單篇內容：`notes/` 是知識筆記，`writing/` 是長文／文章，`canvas/` 是視覺內容（介面稱「視界」）；三者都可被全站索引。這裡的 Canvas 是內容分類，不是 World 的繪圖引擎。
- **Metadata / Core Markdown / Extras**：source `.md` 的 `<meta>` 提供公開欄位；core markdown 是可攜的標準正文；`<reviewkit>`、`<information>` 等自訂語法是附加層。不同視圖可退化或忽略 extras，但不能把它們當成 metadata。
- **搜尋索引 / SearchCore**：`search/indexer.py` 生成 `search/search-index.{json,js}`，供搜尋與瀏覽入口使用；`core/search-core.js` 是共用的查詢、篩選與連結邏輯，不是另一份索引資料。
- **Section landing / Tag detail**：`notes/index.html` 等是某一內容類型的列表入口；`tag/index.html` 是可分享的單一 tag 詳情入口。它們不是 Garden 的 Patch 視圖。
- **Garden / Patch**：`portals/realms/garden/` 是以花園方式探索索引內容的 Realm；Patch 是 Garden 同頁的探索／閱讀視角。Garden 不負責全站 tag detail 的穩定網址。
- **Portals / Realm / World**：Portals 是通往各個 Realm 的導覽樞紐；Realm 是可獨立運作的境域；Garden 與 2.5D 的 Ludwigia World 是不同的 Realm。
- **Labs / Toolkit / Grimoire**：Labs 放實驗原型與可重用資源；Toolkit 是其中的資源庫，Ludwig 密語模式才把它顯示為 Grimoire。兩種名稱讀同一份 `data/Toolkit/toolkit.json`。
- **Site shell / Runtime**：`pages/_shared/` 是共用 navbar、footer 等頁面外框的來源；`core/site/` 是主站共用 JavaScript。手寫頁面透過 `cli.py build-pages` 組裝 shell。
- **Theme / Palette / Effects**：Theme 管整體表面、氛圍與可讀性；Palette 管 accent 與互動狀態顏色；Effects 控制可關閉的動效。偏好儲存在瀏覽器端。
- **生成物白名單**：部署直接需要的少數輸出必須進版控，例如搜尋索引、Portals／Garden 資產與 World 角色快取；完整清單以 `AGENTS.md` 為準，其餘生成物應忽略。
- **AGENTS / HANDOFF / TODO / REVIEW**：`AGENTS.md` 是 Agent 的長期指引與硬約束；`HANDOFF.md` 記最近停點；`TODO.md` 管未完成與長期待辦；`REVIEW.md` 管已完成、待作者驗收的工作。

## Repository Map（程式庫導覽）

這是給讀者與 Agent 共用的結構樹地圖：先用它掌握整體架構與各目錄責任，再到 `docs/README.md` 的「功能導覽」查閱各功能的精確規格、維護指南與實作範圍。

```text
Ludwigia/
├── notes/                     # 知識筆記（Markdown source 與生成的 HTML 內容頁）
├── writing/                   # 深度長文／文章專題（Markdown source 與生成的 HTML）
├── canvas/                    # 視覺化作品與視界內容
├── pages/                     # 主站手寫頁面與頁面骨架
│   └── _shared/               # 全站 Chrome 唯一真相來源（navbar/footer/runtime partials）

├── tag/                       # Tag 標籤詳情頁（跨文章 Concept 聚合檢索）
├── data/                      # 站內結構化資料來源（SSOT JSON）
│   ├── Timeline/              # 經歷與時間軸資料（timeline.json）
│   ├── Skills/                # 技能清單資料（skills.json）
│   ├── Credentials/           # 證照與修課證明（credentials.json）
│   ├── Toolkit/               # 通用工具庫與 Grimoire 魔導書（toolkit.json）
│   └── Ontology/              # 標籤本體知識庫（tags-ontology.json）

├── skills/                    # 可重用的 Agent Skills（依 SKILL.md 標準封裝）
│   ├── verify-and-complete/   # 任務驗收與交付證明（Finish Work）
│   ├── adversarial-review/    # 紅隊對抗式獨立審查
│   └── ...                    # 其他通用 Agentic 工作流

├── labs/                      # 原型實驗室與 Toolkit（Grimoire）展示入口
├── portals/                   # 境域導覽樞紐（Portals）與 Realms 空間
│   ├── realms/garden/         # 數位花園（Digital Garden）境域
│   └── realms/world/          # 2.5D 等軸測虛擬世界（Ludwigia World）

├── core/                      # 全站核心 Runtime、主題預載（theme-preload.js）與搜尋核心
├── assets/                    # 全站靜態資源（CSS Design Tokens、共用 JS、字型與圖片）
├── search/                    # 搜尋索引生成器（indexer.py）與快照（search-index.json/js）
├── tools/                     # Python 建置工具鏈
│   ├── create_content.py      # 標準內容頁生成器（支援 default/canvas 樣式）
│   └── build_pages.py         # 頁面 shell 組裝工具（build-pages）

├── docs/                      # 專案文件庫
│   ├── specs/                 # 系統契約與不可退化規格（system-spec.md 等）
│   ├── design/                # 架構決策與設計理由（design.md 等）
│   └── README.md              # 依功能查閱文件的起點（功能導覽）

├── tests/                     # 單元測試與自動化品質守門腳本
├── cli.py                     # 全站統一命令列入口（build, index, test, build-pages 等）
├── AGENTS.md                  # Agent 執行指引與不可退化契約
├── HANDOFF.md                 # Agent 當前工作停點交接快照
├── TODO.md                    # 未完成與長期待辦任務清單
├── REVIEW.md                  # 已完成、待作者審驗成果清單
└── README.md                  # 專案首要入口與導覽
```

日常建置與檢查命令由根目錄的 `cli.py` 提供；具體指令看下方 CLI 章節。`AGENTS.md` 放 Agent 必須遵守的約束，兩者都引用這份地圖，不另維護平行路徑清單。

## Description（核心理念）

- Single Source of Truth：metadata 與正文各有清楚責任；可索引 metadata 再現性生成，正文則以 `.md` 內可攜的核心內容為主
- Tag-first：用 tags 當作主要 cluster（小花園），搜尋與 tags 互補（找 vs 逛）
- Progressive Enhancement：先做「能用又一致」的檢索/聚合，再逐步加上 garden metaphor 的互動與視覺
- No duplication：不維護兩份內容；卡片、預覽、列表都是同一份 note 的不同呈現
- Layered Scaffolding & Frictionless Progression：知識傳遞堅持「底層成群鋪墊、逐層向上堆疊、零跳步、零割裂」，降低讀者心智負荷，維持極致閱讀流暢度

更完整的設計理由與決策脈絡：請看 [design.md](./docs/design/design.md)；系統設計與可驗證 spec 看 [system-spec.md](./docs/specs/system-spec.md)；第一視角的心得雜談看 [dev-notes.md](./docs/author/dev-notes.md)。

## Docs（文件分工）

- `README.md`：所有人共用的專案入口，提供術語、工作流與 Repository Map。
- `docs/README.md`：按功能查規格與實作資料夾，並說明 `docs/` 各層的責任。
- `AGENTS.md`：給 Agent 的執行指引與不可退化約束；直接引用上述兩個入口，不複製導覽內容。
- `HANDOFF.md`：給新 Agent 的短期交接快照，記錄剛停在哪裡；未完成與長期待辦看 `TODO.md`，已完成待作者驗收的工作看 `REVIEW.md`。交接檔與待審清單不作為網站資產部署。
- `docs/specs/`、`docs/design/`、`docs/rules/`、`docs/guide/`、`docs/tech/`：分別承接精確規格、設計理由、守門清單、維護步驟與實作紀錄。

要找某個功能的入口，先看 `docs/README.md` 的「功能導覽」；要確認精確欄位或行為，再讀其連結的 spec。文件只同步受本次改動影響的部分，不因一般檔案新增而改動資料夾地圖。

## Site Map（連接機制）

- Source of truth：每篇內容頁（notes/writing/canvas）在 `<head>` 提供 `site:tags` / `site:summary`；若有 `.md` source，正文的核心內容以其中的 core markdown 為主，其餘 view 從這兩層衍生
- 若 tag 已映射到 ontology，內容頁可額外輸出 `site:tag_concepts`；它與 `site:tags` 逐項對齊，作為 runtime filter / tag detail 的穩定 concept 識別
- Optional ranking metadata：若要讓某篇 writing 在符合 query/tag filter 時優先出現在 `pages/search.html` 與 `writing/index.html`，可額外輸出 `site:pinned` / `site:priority`
- Indexer：`search/indexer.py` 掃描 `notes/`、`writing/`、`canvas/` → 產出 `search/search-index.{json,js}`（JS 會掛 `window.SITE_SEARCH_INDEX`）
- Section landing：
  - `notes/index.html` / `writing/index.html` / `canvas/index.html` 透過 `core/search-core.js`（SearchCore）+ `assets/js/section-landing.js` 讀索引，只顯示該 section 的內容（含 scoped search + tag filter）
  - freshness guard：section landing / search / tag page 與 note recommendation 會優先抓 `search/search-index.json`（`cache: "no-store"`），抓不到才退回 `window.SITE_SEARCH_INDEX` / `search-index.js`；目的不是放棄 JS 版本，而是降低 CDN / 瀏覽器快取把舊索引一直當成真相的機率
  - Cover 圖片策略：若未提供內容專屬 cover，section landing 與搜尋卡片會使用「預設 cover」當作列表縮圖（`notes` 預設使用 `assets/images/Notes.png`，`writing` 預設使用 `assets/images/Writing.png`），確保未指定 cover 時版面視覺一致

- Search：
  - `pages/search.html` 透過 `core/search-core.js`（SearchCore）+ `assets/js/search-page.js` 讀 `window.SITE_SEARCH_INDEX`，提供 query ranking + multi-tag filter
  - tag filter 仍留在 search 內；若已選單一 tag，可用明確的 `Open tag page` 入口切到 `tag/index.html`

- Garden：
  - `portals/realms/garden/index.html` 是獨立 UI，資料仍只讀 `window.SITE_SEARCH_INDEX`

- Tag detail：
  - `tag/index.html` 是穩定的 tag detail 入口；runtime 可帶 `?concept=...&tag=...`，並向後相容既有 `?tag=...`
  - tag detail / related tags / search filter 優先以 ontology `concept_id` 判斷是否為同一概念，再依目前語系決定顯示 label
  - 單篇頁的 tag pill / related tag 連結預設都應導到 `tag/index.html`

## 現有優點（請保持不退化）

- 單一真相來源：note 的 `<head>` metadata（`<title>` / `site:tags` / `site:summary`），其餘一律衍生（以 `AGENTS.md` 為準）
- Indexer：由 `notes/`、`writing/`、`canvas/` 生成 `search/search-index.{json,js}`（並同時生成 `window.SITE_SEARCH_INDEX` 的 JS 版本）
- Search：client-side 搜尋 + multi-tag filter
- Clusters：popular / recent tags 的花叢視圖
- Patch：卡片視圖 + 展開閱讀面板（同頁閱讀）
- Tag detail：`tag/index.html` 提供穩定 detail route，不再讓 tag 入口綁在 `portals/realms/garden/` 底下

## 快速開始（建議用本機伺服器）

用 `file://` 直接開 HTML 可能會遇到瀏覽器限制（尤其是 `fetch`）。建議用最簡單的靜態伺服器：

```bash
python3 -m http.server 8000
```

然後開：
- `http://localhost:8000/pages/search.html`
- `http://localhost:8000/portals/realms/garden/index.html`
- `http://localhost:8000/portals/realms/world/index.html`
- `http://localhost:8000/portals/index.html`
- `http://localhost:8000/labs/index.html`
- `http://localhost:8000/index.html`（可直接用 navbar 的 gear icon 打開 settings modal）

若你是在 Cloudflare 正式站驗證剛部署的變更，特別是：

- `notes/index.html` / `writing/index.html` 文章列表
- 單篇頁的 `Recommended Posts`
- `pages/search.html` / `tag/index.html`

請先做一次 hard refresh（macOS: `Cmd + Shift + R`）。靜態部署下最常見的誤判不是「功能沒修好」，而是 HTML / JS / `search-index` 還吃著舊快取。

## Theme / Palette（偏好狀態）

- Theme：整體氛圍（背景/文字/對比），目前包含 Dark / Light / Deep Sea / Galaxy / Sky / Garden；主題特效屬於表層效果，可開關、可限制，不能影響可讀性
- Palette：accent（連結、tag active、重點色），例如 default / galaxy / garden / red / yellow / ash
- 偏好狀態保存在瀏覽器 localStorage（每個使用者/裝置互不影響）
- Settings 以 modal 為主：從 navbar gear icon 直接打開、即時套用、不需離開當前頁；`pages/settings.html` 仍可作 fallback / direct-link 使用
- Theme 動效有獨立 `Effects` 開關（localStorage: `site_theme_motion_v1`）；若使用者偏好 `prefers-reduced-motion`，預設會限制動效
- Settings 視覺責任要分清：所有 selected / hover 特效都跟著目前 `palette/accent` 走；`Theme` / `Palette` 自身的顏色只負責 preview dot，不直接控制被選中的外框/背景
- Settings controls 可分成三種語意：sidebar tabs（panel navigation）、status pills（`Language` / `Effects`）、preview pills（`Theme` / `Palette`）；三者用途不同，但 selected / hover 特效都應收斂到同一套 palette-driven 規則
- Copilot 可見性由 settings runtime 控制，偏好值為 `off / home / all`；`pages/settings.html` 與設定 modal 共用同一套 data attrs / localStorage，不應各自維護平行狀態
- `Sky` 的雲朵背景屬 theme ambience，不應被 settings pills / active state 的局部樣式誤傷；若調整 sky 視覺，優先分開處理 `sky-clouds` 與 settings controls
- note 頁的 `block / callout / takeaways` 需各自有明確的 theme color variables；目前可先填同值，但未來擴 theme 時必須三者一起檢查
- 若修 theme 視覺時發現需要一直疊 override，優先回頭整理底層 token / selector / variable pipeline，而不是繼續堆例外規則
- 跨境域色盤聯動：World 等軸測空間（`portals/realms/world/`）的 HUD 玻璃擬態面板與焦點光暈共用 `assets/css/site/palette-tokens.css`，新增色盤只改此 token 檔，不在 `world.css` 另抄一份
- 未來若要新增 / 調整 theme、palette 或 settings controls，優先先看 `docs/guide/theme-palette-guide.md`

## Portals 與 Realms（獨立探索境域）

Portals 是通往各具備獨立互動體驗之境域（Realms）的導覽樞紐：

- **Portals 樞紐**（`portals/index.html`）：全景導覽門戶，提供跨境域躍遷入口與 Realm 概覽。
- **Digital Garden**（`portals/realms/garden/index.html`）：以花園視覺隱喻探索全站知識內容；採獨立 UI 設計，資料來源只讀全站索引 `window.SITE_SEARCH_INDEX`。
- **Ludwigia World**（`portals/realms/world/index.html`）：2.5D 等軸測互動虛擬空間。角色設定與社交對話以 `portals/realms/world/data/` 為創作來源，由 `cli.py build-world` 再現性編譯；視覺介面即時連動全站 Palette Tokens。

## 新增/修改筆記（唯一工作流）

### 建議順序（從內容到發布）

1. 寫內容（先不要管 UI）
   - 起稿前先寫一個簡短的 planning scaffold：`TL;DR`、`MainFlow`、`Scope`、`OutOfScope`；先確認這篇只在回答少數幾個主題，而不是把整個主題家族全塞進來。
   - 先把「你想記的知識」寫完整：定義、重點、例子、結論。
   - 優先讓文章可讀、可掃讀（標題/小節/清單），再進入版型與互動。
   - 建議先用更保守的目標抓篇幅：overview / survey 類內容盡量控制在 **8–12 分鐘**；單一方法或單一觀點 deep dive 盡量控制在 **10–15 分鐘**。若超過就拆成兩篇「獨立文章」（可各自放在自己的 folder），且每一篇都要有合理開頭（例如 Guiding Questions）
   - 若一篇稿同時在做「技術家族 overview」和「單一方法 deep dive」，優先拆成 overview + follow-up pages，而不是在同一篇裡又講背景、又講某方法、又講另一方法、再把各自 limitation 一次講完
   - 若本篇定位是 overview，就不要把篇幅重心長時間停在 `K-Means` 這類單一子方法的直覺或細部流程；overview 的責任是建立地圖，讓更多相關技術能被自然納入，而不是先把一個子方法講成半篇教學
   - 若文章前段想放一個可見導讀 block，優先把它當成 `TL;DR / Focus` block，用來固定「這篇最重要的主題是什麼」；不需要再另外做一個專門的 `Guiding Questions` block，因為 guiding questions 本來就可以分散在各段裡

2. 套用版型 / 準備 source `.md`
   - 若這篇是 source-driven 內容，建議直接從一個既有 `.md` 起稿，沿用 `<meta>` + 正文 + 自訂 block 的格式。
   - 若不是從 source `.md` 起稿，也至少先想清楚這篇會不會需要被 `tools/create_content.py` 再現性生成；若會，metadata 與正文結構要先收斂。
   - `<meta>` 欄位與輸出契約請看 `docs/specs/content-metadata-spec.md`；parser / block 語法請看 `docs/specs/parser-spec.md`

3. 填寫 metadata（Single Source of Truth）
   - 在 `<head>` 確保有：
     - `<title>`
     - `<meta name="site:tags" content="...">`（逗號分隔）
     - `<meta name="site:summary" content="...">`（一句話 summary）
   - 若是 source-driven `.md`，請以 `<meta>...</meta>` 作為 single source of truth；完整欄位定義看 `docs/specs/content-metadata-spec.md`

4. 生成 HTML（單篇或整個 repo）
   - 單篇重生：
     - `python3 cli.py build notes/my-topic/my-topic.md`
   - 整個 section 重生：
     - `python3 cli.py build-all --content-dir notes`
   - 整個 repo 重生：
     - `python3 cli.py build-all --content-dir all`
   - 這些命令都會重跑 HTML 生成；`build` 預設也會更新 search index，`build-all` 則會在整批完成後再更新一次 index。

5. 確認 search index 與 summary 正確
   - 生成後應更新：
     - `search/search-index.json`
     - `search/search-index.js`
   - 版本控制原則：
     - `search/search-index.{json,js}`、`portals/realms/garden/floral-assets/` 與 `portals/assets/` 需要納入版本控制（供靜態頁面讀取）
     - 其餘 build output 一律視為生成物並加入 `.gitignore`（例如 `portals/realms/garden/_floral_dist/`）
   - 確認這篇 note 在 index 裡：
     - `title / url / tags / summary` 正確
     - 若有 `readingTimeMin`（可選）也要合理

6. 檢查匯出的 Markdown 是否乾淨（Copy/Download）
   - 用 Meta sidebar 的 Copy/Download Markdown 測一次。
   - 匯出內容應該只包含 core markdown 正文：
     - 不要包含互動元件（例如 quiz）
     - 不要包含 QA Generator Prompt
   - 若要排除某段內容，對該區塊加 `data-md-exclude="1"`。

7. 檢查 Reading Mode 的純粹性
   - 打開 Reading mode，確認呈現仍以文章為主。
   - 原則：Reading mode 只應強化閱讀，不應讓 quiz/prompt 變成主要干擾。

8. 檢查圖片互動（Image Viewer）
  - `notes / writing / canvas` 單篇頁的圖片可點擊放大檢視（Esc 關閉）
  - 若圖片包在 `<a>` 裡，預設優先放大；按住 `Cmd/Ctrl/Shift/Alt` 點擊，或在 `<a data-image-viewer="link-only">` 時才走連結跳轉

### 寫作 Workflow（架構先行 + Agent 補內容 + 最後全盤 proofread）

如果是長文 / writing，我目前更推薦這個順序：

1. 先定文章架構
   - 先列 `# / ## / ###` 結構，不急著把每段一次寫滿。
   - 每一節先寫清楚它要回答的問題。
   - 建議先補一組作者用的 planning 欄位：`TL;DR`（這篇 1-3 句到底要說什麼）、`MainFlow`（理解路徑）、`Scope`（本篇回答哪些問題）、`OutOfScope`（哪些留到下一篇）、`FollowUps`（若這篇是 overview，後續要拆出哪些單篇）；這些欄位建議放在 source 的 `<draft>...</draft>`

2. 再整理 raw info
   - 先把觀察、例子、碎念、反例、問題全部丟進對應段落。
   - 這時候追求的是「不要漏」，不是「句子要漂亮」。

3. 交給 Agent / LLM 補第一版內容
   - 讓 Agent 依既有架構去填段落、整理措辭、補例子。
   - 這一步重點是先長出一版「可 refine 的草稿」。

4. 反過來用結構再 refine
   - 看哪些段落太空、太長、重複、或沒有真的回答問題。
   - 必要時重排章節、拆小節、補反例。

5. 最後做一次全盤 proofread
   - 這一步不能省。
   - 前面的整理、填充、重組都可以被簡化或 agent 化，但最後仍要由人把整篇從頭到尾完整讀過一次。

### 作者規劃欄位（可選，不對外）

若你想把文章主 flow 直接寫進 source `.md`，建議放在 `<draft>...</draft>`，而不是 `<meta>`：

- `TLDR`
- `MainFlow`
- `Scope`
- `OutOfScope`
- `FollowUps`

這些欄位目前的定位是：

- 幫助作者起稿、拆篇與維持主 flow
- 對方法家族 overview 特別有用：可以先逼自己寫清楚「這篇只是地圖，還是其實已經開始 deep dive 某個子方法」
- `tools/create_content.py`、core markdown extractor、search/indexer 預設都忽略 `<draft>` 內容
- 不要求輸出到公開 `<head>` metadata
- 不進 search index
- 未來若要顯示在 UI，必須明確 opt-in，而不是預設暴露給讀者

### 用 CLI 產生 / 重生 HTML（推薦）

若你已經有 source `.md`，平常最推薦走 `cli.py` 這層包裝，而不是直接手敲 `tools/create_content.py`。原因是：

- `python3 cli.py build <source.md>` 會幫你重生對應 HTML，並更新 search index
- `python3 cli.py build-all --content-dir notes|writing|canvas|all` 可以批次重生整個 section，甚至整個 repo
- `tools/create_content.py` 仍是底層標準生成器；但日常工作流優先用 `cli.py` 比較不容易漏掉 index 更新

單篇重生：

```bash
python3 cli.py build notes/my-topic/my-topic.md
```

整個 repo 的 source-driven 內容一起重生：

```bash
python3 cli.py build-all --content-dir all
```

這裡的批次重生請優先記 `cli.py` 這個入口，不要另外去背 `tools/create_content.py` 的組合。因為：

- `cli.py build-all` 已經幫你把整批 source-driven content 的重生流程收好
- 它會在整批完成後統一更新 search index，比逐篇手跑更不容易漏
- `tools/create_content.py` 繼續維持單篇標準內容頁生成器的角色，責任比較單純

用內建模板快速建立一篇新的 note（檔名 kebab-case，會自動跑 indexer）：

```bash
python3 tools/create_content.py \
  --content-dir notes \
  --title "Knowledge Discovery & Data Mining" \
  --tags "data mining, preprocessing, clustering" \
  --summary "Knowledge Discovery and Data Mining 定義、流程、資料品質、EDA 與前處理重點整理"
```

也可以把「類 Markdown」內容檔直接轉成 note.html（會把解析後的 HTML 填入預設的 note style 骨架）：

```bash
python3 tools/create_content.py \
  --content-dir notes \
  --title "My Note" \
  --tags "ml, system design" \
  --summary "一段話概述這篇在講什麼" \
  --source path/to/note.md
```

若你希望「title/tags/summary/輸出路徑/模板風格」直接跟內容檔綁在一起，來源檔案最上方可放 `<meta>...</meta>`；作者自己的 planning scaffold 則另外放在 `<draft>...</draft>`：

```text
<meta>
Title: My Note
Tags: ML, System Design
Summary: 一段話概述這篇在講什麼
Status: published
Slug: my-note
Output: notes/{titleslug}/{titleslug}.html
Style: default
EstimatedReadingTime: true
</meta>

<draft>
TLDR: 用 1-3 句寫這篇真正要講的事
MainFlow: 這篇要用哪條理解路徑把讀者帶到結論
Scope: 這篇會回答哪些問題
OutOfScope: 哪些內容刻意留給下一篇
FollowUps: 若這篇是 overview，後續要拆出哪些子文章
</draft>
```

其中：

- `EstimatedReadingTime: true` 會開啟 sidebar 的估讀時間，但它目前仍只是 heuristic，不是精確量測
- 對技術密度較高、含比較表 / 數學 / 多個方法比較的文章，估讀時間通常應被視為偏樂觀的 rough estimate，而不是硬指標

如果你的 source `.md` 已經把 `<meta>` 填完整，理論上生成 HTML 所需的資訊就都在裡面了。之後就可以只給 `--source`（CLI 參數會在有提供時覆蓋 `<meta>`）：

```bash
python3 tools/create_content.py --source path/to/note.md
```

同一套格式也支援 `writing/` 內容（同樣會進 Garden 索引與搜尋）：

```bash
python3 tools/create_content.py \
  --content-dir writing \
  --title "My Writing" \
  --tags "ml, epistemology" \
  --summary "一段話概述這篇 writing 在講什麼"
```

或用 `--source`：

```bash
python3 tools/create_content.py --source writing/my-writing/my-writing.md --force
```

`Canvas` 也保留對等入口：

```bash
python3 tools/create_content.py --content-dir canvas --source canvas/my-item/my-item.md --force
```

目前 `Canvas` 的生成仍先共用 `tools/create_content.py` 這條標準工作流；它還不是完整的 Canvas 專用生成模式。

目前 `Canvas` 的內容契約仍偏輕量，建議先以「一張圖 + 可選 caption + tags + date」作為最小單位，等真實素材累積後再決定要不要長出 gallery set 與更完整的 landing view。

若要從 stdin 讀取（方便 pipe）：

```bash
cat path/to/note.md | python3 tools/create_content.py \
  --content-dir notes \
  --title "My Note" \
  --tags "ml, system design" \
  --summary "一段話概述這篇在講什麼" \
  --source -
```

### 可選：保留「偽 Markdown」作為正文來源

如果你希望之後改內容/版型更快，可以把原本的「類 Markdown」來源檔（偽 Markdown）保留在 `notes/` 或 `writing/`（例如 `notes/<topic>/<topic>.md`、`writing/<topic>/<topic>.md`）。之後只要改這個檔案，再重跑一次 `python3 cli.py build <source.md>` 就能重新生成 HTML（並更新 index）；若要整批重生，則用 `python3 cli.py build-all --content-dir all`。

Ludwigia 目前的 `.md` 比較像 extended markdown：它除了純 markdown 正文，還可以有 `<meta>` 與少量語意化 block；但 `README` 不再承擔完整 parser contract。

快速記憶即可：

- metadata 與正文分層：`<meta>` 屬 metadata layer，純正文屬 core markdown
- `Copy Markdown` / `Download Markdown` / Garden preview / Reading Mode 主要依賴「必要 metadata + core markdown」
- 像 `<callout>`、`<block>`、`<reviewkit>`、`<qquiz>`、`<qprompt>`、`<takeaways>`、`<image>`、`<information>`、`<content-link>` 屬 extras / enhancement
- `<draft>` 只給作者自己規劃，不進公開輸出與 search index

完整規格請直接看：

- parser / markdown subset / block syntax：`docs/specs/parser-spec.md`
- `<meta>` 欄位與 head / index mapping：`docs/specs/content-metadata-spec.md`
- 系統如何消費 metadata / core markdown / extras：`docs/specs/system-spec.md`

最低驗證方式：

```bash
python3 tools/create_content.py --self-test
python3 -m unittest
```

### Discussion：i18n 與 Theme（會影響 parse/meta 約定）

- i18n：是否要支援同一篇 note 的中英雙語版本（路徑/slug、meta 欄位、搜尋與 related posts 的行為）
- theme：note style 的 light/dark 策略（沿用全站 token vs style 自帶兩套 CSS）與優先順序

### 手動寫 HTML（保留彈性）

如果你不是走 source `.md`，仍可以直接手寫 / 客製化 HTML；但要維持可被 indexer、Search、Garden、tag detail 正常消費，請保留 `<head>` metadata contract。

最低要有：

- `<title>`
- `<meta name="site:tags" ...>`
- `<meta name="site:summary" ...>`

若有多語 / tag ontology / 日期 / 狀態需求，再補對應的 `site:*` metadata。完整最小契約請看 `docs/specs/content-metadata-spec.md`。

修改後請重新生成索引：

```bash
python3 search/indexer.py
```

需要自動更新：

```bash
python3 search/indexer.py --watch
```

## Notes UI Extras（可選）

以下功能都屬可選增強，不是 indexer / Search / Garden 的基本前提：

- Related posts
- Meta sidebar：Copy/Download Markdown
- Quick quiz
- QA generator prompt

具體定位與 contract 請看 `docs/specs/system-spec.md` 的 `Notes Extras`；README 只保留入口，不再重複列規格。

## CLI（建議用）

本 repo 提供一個簡單入口 `cli.py`，把常用工作流包成子命令：

```bash
python3 cli.py test
python3 cli.py index
python3 cli.py check-tags
python3 cli.py scan-information writing/<topic>/<topic>.md
python3 cli.py scan-information writing/<topic>/<topic>.md --json
python3 cli.py build notes/<topic>/<topic>.md
python3 cli.py build-all
python3 cli.py build-portals
python3 cli.py build-world
python3 cli.py build-pages
python3 cli.py translate --source notes/<topic>/<topic>.md --target-lang en --backend gemini-api
python3 cli.py install-hooks
python3 cli.py serve --port 8000
python3 cli.py clean
```

- `cli.py build-pages` 會把 `pages/_shared/navbar.html` 與 `footer.html` 組裝進手寫頁面（首頁、`pages/`、`tag/`、section landing、`labs/`）中 `<!-- shell:navbar -->` / `<!-- shell:footer -->` 標記之間的區塊；改 navbar 時只改 partial，再跑一次 `build-pages`，並重新生成內容頁（`build-all`）。帶 `data-i18n-page` 的頁面，其靜態 `<title>` 也由 `build-pages` 從 `i18n/` bundle 的 `title.en` 生成；改頁面標題時只改 `i18n/*.json`

- `cli.py scan-information` 會掃描單篇 source `.md` 裡命中 `information` ontology 的詞，列出：
  - 哪些詞已經有 `<information>`
  - 哪些詞第一次出現但還沒標註，適合作為候選詞
  - 目前候選詞判定以正文 flow 為主；markdown heading 內的命中不算「第一次出現」
  - 若加 `--json`，會輸出機器可讀的 JSON，方便 agent 或 script 接後續流程
  - 這個指令是 authoring helper，不會自動把命中的詞插入 `<information>`；是否標註仍由作者控制

### Translation Workflow（`tools/translate_content.py`）

`cli.py translate` 是 `tools/translate_content.py` 的包裝。建議平常用 `cli.py`，要 debug 或做低層控制再直接呼叫 `tools/translate_content.py`。

翻譯前請先準備 Gemini key（二選一）：

```bash
export GEMINI_API_KEY="<your-key>"
# 或
export LUDWIGIA_GEMINI_API_KEY="<your-key>"
```

最常用範例：

```bash
python3 cli.py translate \
  --source notes/foo/foo.md \
  --target-lang en \
  --backend gemini-api
```

補充：

- 若不用 environment variable，也可放在 `secret.txt`（已在 `.gitignore`）
- 翻譯後產生的是新的 source `.md`，記得再跑 `python3 cli.py build ...` 或 `python3 cli.py build-all`
- `--dry-run` / `--overwrite` / `--output-root`、命名規則、可翻 / 不可翻欄位、`secret.txt` / env var contract，請直接看 `docs/specs/translation-spec.md`

### Git Hooks

建議在本機啟用 repo 內建 hooks：

```bash
python3 cli.py install-hooks
```

- `pre-commit`：若 staged 了 `notes/` / `writing/` / `canvas/` 的 `.md`，會自動重生對應 `.html`，並把重生的 `.html` 與 `search/search-index.{json,js}` 一起 stage
- `pre-push`：執行 `python3 cli.py test`（包含 `create_content` self-test、`unittest`、`py_compile`、`check-tags`），並確認提交的 `search/search-index.{json,js}`、World 的 `characters.json` 與手寫頁面的 shell 沒有過期
- 只想跳過一次時，可用 `git commit --no-verify` / `git push --no-verify`
- 若偏好 shell script，也可直接跑 `./scripts/install-git-hooks.sh`

### Tag Ontology Coverage

如果你剛新增 / 改動了 source tags，想快速確認 ontology 有沒有漏收，可以直接跑：

```bash
python3 cli.py check-tags
```

它會檢查兩件事：

- source `.md` 內出現的 tags 是否都能 map 到 ontology concept
- `data/Ontology/tags-ontology.json` 裡每個 concept 是否都有 `en / zh-Hant / zh-Hans` 三組 label

若只想檢查部分內容，也可用：

```bash
python3 cli.py check-tags --content-dir notes
python3 cli.py check-tags --content-dir writing
python3 cli.py check-tags --content-dir all
```
