# System Spec

這份文件整理 Ludwigia 的系統設計與可驗證 spec（system architecture / data flow / schema / runtime spec）。

- 不可退化的「硬契約」只寫在 `AGENTS.md`（repo root）
- 日常怎麼用請看 `README.md`（repo root）
- 這裡放的是：當我們要擴功能或重構時，可用來對齊的系統分層、資料流、schema、runtime 與生成物策略
- 偏守門 / authoring / UI 行為固定規則，請看 `docs/rules/guardrails.md`

## 系統分層（抽象）

- Content layer：`notes/` / `writing/` / `canvas/` 內的靜態 HTML（內容本體）
- Index layer：`search/` 內的 indexer + index 生成物（全站唯一的索引資料）
- Search layer：SearchCore（共用的 index/query/filter/href/related 能力），不依賴任何 UI
- UI layer：Search page / Section landing / Garden 是不同入口，但依賴同一份 index 與同一套搜尋語意

## Data Flow（Single Source of Truth）

目前可索引 metadata 的穩定來源在內容頁 `<head>`：

- `<title>`
- `<meta name="garden:tags" content="...">`
- `<meta name="garden:tag_concepts" content="...">`（若 tag 命中 ontology；需與 `garden:tags` 逐項對齊）
- `<meta name="garden:summary" content="...">`
- `<meta name="garden:lang" content="zh-Hant|en|...">`
- `<meta name="garden:status" content="published|drafting">`（若啟用）
- `<meta name="garden:pinned" content="1|true">`（若作者希望某篇 writing 在命中時優先置頂）
- `<meta name="garden:priority" content="number">`（若作者希望 pinned writing 之間再細分順序）
- `<meta name="garden:canonical_id" content="...">`（若該篇內容屬於一組多語言版本）
- `<meta name="garden:published_at" content="YYYY-MM-DD">`（若作者提供）
- `<meta name="garden:last_modified_at" content="YYYY-MM-DD">`（若作者提供或系統有穩定 fallback）
- `<meta name="garden:cover" content="...">`（若作者提供；僅代表單一 card / preview cover image，不代表正文所有插圖）

然後由 indexer 再現性生成全站索引：

- `search/indexer.py` 掃描 `notes/`、`writing/`、`canvas/`
- 產出 `search/search-index.json`（可讀/可檢查）
- 同時產出 `search/search-index.js`（可用 `<script>` 載入）
- `search/search-index.js` 必須定義 `window.SITE_SEARCH_INDEX`

所有入口頁面只能讀索引，不要求維護第二份資料（tags/summary/related 等）。

除了內容頁與 search index，repo 也允許少數「page-scoped source data」存在於獨立資料檔。

- 典型例子：首頁上的獨立 `Timeline` section、`Skills` section 與 `Credentials` section
- 這類資料不屬於 `search/search-index.{json,js}`，也不應硬寫死在前端 JS 常數裡
- source of truth 應是獨立 data file（例如 `data/Timeline/timeline.json`、`data/Skills/skills.json` 與 `data/Credentials/credentials.json`）
- runtime 的責任是 load / validate / normalize / project / render，而不是要求作者同時維護 data 與 projection 後的 JS 陣列
- 若靜態站需要兼容 `file://`，可提供 JS preload / inline preload fallback；但 fallback 不是新的真相來源

目前某些 view 直接從 `.md` source 再現性生成，採三層模型：

- metadata layer：由獨立 parser 讀 `<meta>`，取得 title / tags / summary / output 等必要欄位
- core markdown layer：由 markdown extractor 只讀純 markdown 正文
- extras layer：其餘自訂 block（`<qquiz>` / `<reviewkit>` / `<qprompt>` / `<callout>` / `<block>` / `<takeaways>` / `<image>` / `<rawhtml>`）與 inline enhancement 語法（`<information context="...">...</information>` / `<information concept="concept.xxx">...</information>` / `<content-link canonical="...">...</content-link>`）都視為附加層；markdown table 則屬於 core markdown

其中 Reading Mode / Garden 這類「正文視圖」，應優先依賴「必要 metadata + core markdown」，而不是要求 markdown extractor 完整理解 extras layer。

更細的分工：

- metadata 欄位與 head/index mapping：看 `docs/specs/content-metadata-spec.md`
- parser / markdown subset / extras syntax：看 `docs/specs/parser-spec.md`
- inline enhancement shared contract：看 `docs/specs/inline-enhancement-spec.md`
- translation source contract：看 `docs/specs/translation-spec.md`

extras layer 的穩定降級規則：

- `<information>`：在一般內容頁可作為 inline enhancement / tooltip；但在 copy/download markdown、Garden/Search surfaces 與 Reading Mode 一律退化成純文字
- `<content-link>`：在一般內容頁可依 target `CanonicalId` resolve 成站內連結；但在 copy/download markdown、Garden/Search surfaces 與 Reading Mode 一律退化成純文字
- `<image>`：只屬於一般內容頁的補充 block，不屬於 core content；在 copy/download markdown、Garden/Search surfaces 與 Reading Mode 一律排除
- Card imagery 必須來自 `<meta>.Cover` / `garden:cover`，而不是從正文 `<image>` 推導；原因是 `Cover` 只承擔單一 card / preview image，而正文可以合法包含多張不同用途的 `<image>`
- Search result、section landing 與 `content-link` preview card 應共用同一個 default cover fallback contract：target 有 `Cover` 用自己的，沒有則依內容類型退回 shared default cover（`notes` 預設退回 `assets/images/Notes.png`，`writing` 預設退回 `assets/images/Writing.png`）

## Index Schema（穩定視圖）

索引 item 的核心欄位（語意層）：

- `title`：文章標題
- `tags`：目前內容語言下的 tag label list（字串陣列）
- `tag_concepts`：與 `tags` 同順序的 concept id list；未命中 ontology 時可為空字串
- `tag_labels`：concept id -> localized labels map；供 runtime 依目前 UI 語系重建顯示 label
- `summary`：一句話摘要
- `reading_time_minutes`：供 preview / 卡片顯示的估讀時間（分鐘；若內容未啟用則為 `0`）
- `lang`：內容語言
- `canonical_id`：同一篇內容跨語言版本共享的分組 ID
- `status`：內容可見性（目前規劃 `published` / `drafting`）
- `pinned`：是否屬於 pinned writing（目前排序 boost 只在 writing 的 search / section landing 生效）
- `priority`：pinned writing 之間的次排序鍵（數字越大越前）
- `published_at`：內容公開日期（若有）
- `last_modified_at`：內容最近更新日期（若有）
- `content`：用於搜尋與摘要/preview 的文字內容

- `content_markdown`：給 Garden 全文閱讀視圖用的 core markdown 正文
- `preview_markdown`：給 Garden / search preview 用的 core markdown 摘要；若入口卡片已有 `summary`，應優先使用 `summary`，`preview_markdown` 僅作 fallback
- `url`：以 Garden 入口為 context 的相對連結（維持可用）
- `path`：以 repo root 為基準的相對路徑（跨入口連結解析的共用基準）
- `section`：`notes` / `writing` / `canvas` / `page`
- `related`：related candidate list（由 indexer 生成的 base 相似度）

## Query / Filter 語意（搜尋層）

目前的共用搜尋語意（由 SearchCore 實作）：

- Tokenization：英文/數字用字串 token；CJK 用單字元 token
- Query：TF‑IDF + inverted index 做 ranking，並保留 substring fallback（容錯）
- Tag filter：AND 語意（多 tag = 交集）；若 tag 命中 ontology，應優先以 `concept_id` 比對；未命中 ontology 時才退回 trim + case-insensitive 的字串精準比對
- Tag naming：對外顯示優先讀 `data/Ontology/tags-ontology.json` 的 `labels.{lang}`；未命中的 tag 保留 source authoring，不強制統一英文
- Tag detail route：可點擊的 tag detail 預設收斂到 `tag/index.html`；runtime 可帶 `?concept=...&tag=...`，並向後相容既有 `?tag=...`
- Pinned writing：只在結果已命中 query/tag filter 後做排序 boost；不繞過 filter，也不把未命中的內容硬塞進結果
- Related：indexer 先算 base 相似度；UI 可以再用行為信號做輕量 rerank
- Search page 的預設排序語意應明確為 `relevance`，而不是模糊的 `default`：代表 search engine ranking（TF‑IDF + pinned / priority + canonical collapse；空 query 時可再加 recent signal）；UI 可以把這個模式顯示成 `Default`，但底層語意不可漂移
- Search page 的手動 sort（`published` / `modified` / `reading time`）屬於使用者對目前結果集合的顯式重排；UI 必須保留切回 `relevance` 的可見入口，避免把預設智能排序與手動排序混成同一個概念

## Tag Ontology（MVP）

目前先提供一版最小 ontology 映射檔：`data/Ontology/tags-ontology.json`。

- 單一節點用 `concept_id` 當穩定識別（不是拿顯示字串當唯一真相）
- `labels` 放各語言顯示字串（例如 `en` / `zh-Hant`）
- `aliases` 放可接受的舊寫法與同義詞（含大小寫差異）
- `concept_id` 與對外顯示 label 必須分離；`concept_id` 只承擔穩定識別，`labels.{lang}` 才是對外文字
- 生成層應依內容 `Lang` 輸出對應語系的 `garden:tags` label；索引層則同步輸出 `tag_concepts` / `tag_labels`，讓 runtime 可依 UI 語系重建顯示
- 生成層與索引層都應優先用 ontology 做 alias 正規化；避免 source / HTML / search index 各自長出不同 concept 判斷規則

### i18n-aware Search（規劃中的搜尋契約）

若站點引入多語言內容，搜尋層不能再把所有語言版本視為完全等價的文件集合；否則關鍵字相關度容易被跨語言重複訊號扭曲。

- index item 應預留語言相關欄位（至少包含 `lang`；若未來需要再加 `canonical_id` / `available_langs`）
- Search 與 related/recommendation 應優先同語言；同語言結果不足時，才考慮跨語言補充
- 不應直接把不同語言版本做無差別單一 ranking，特別是當中文內容常混用英文術語時（例如 `TF-IDF`、`GPU`、`SQL`）
- 若同一篇內容存在多語言版本，搜尋結果需避免因共享 token 而在 ranking 中互相放大、造成重複取重

這裡的重點不是「永遠不能跨語言搜尋」，而是：

- 預設同語言優先
- 跨語言是補充，而不是一開始就與同語言結果完全混排

## 多語言內容策略（規劃中的內容契約）

多語言策略採分層處理，而不是要求所有頁面、所有文章都預設雙語：

- 基礎 page（例如 `Home` / `About` / `Projects` / section landing）可以支援多語言
- `notes/` / `writing/` 預設單語；只有少數文章可 opt-in 提供多語言版本
- 單篇文章是否支援多語言，應由該篇內容自己的 metadata/index 欄位表達，而不是假設全站所有文章都共享同一組語言
- 目前第一輪實作採混合策略：
  - 基礎 page 用 runtime i18n（依全站語言偏好切換文案）
  - 文章多語言用「每種語言各自一份 HTML」；再由 `canonical_id` 把它們連回同一組內容

這個分工的契約是：

- runtime i18n 只負責基礎 page 的 UI 文案，不負責整篇文章正文的翻譯
- 文章若支援多語言，不在同一份 HTML 內切整篇內容；而是直接跳到另一份對應語言的 HTML
- linking 不應靠手拼 URL 規則，而應透過 `canonical_id` / index 內的多語言分組資訊尋找對應版本
- 同一篇文章的不同語言版本，建議放在同一個資料夾內，並在檔名直接帶語言 suffix（例如 `foo-zh-tw.md` / `foo-en.md`）
- 即使目前只有單語內容，也建議提早採用 suffix 命名，避免未來再做一輪全面遷移
- metadata 的真相來源仍是 `Lang` + `canonical_id`；檔名 suffix 是可讀性與維護慣例，不是唯一識別來源
- 若決定做 repo-wide 命名重整，可直接採完整 refactor，不保留舊無 suffix URL；但必須同步更新站內引用、索引與相關文件

若文章提供多語言版本，系統層至少需要支援這幾件事：

- 在列表與單篇頁辨識該篇是否支援多語言
- 能查出實際可用語言列表
- 語言切換只在有對應內容時出現
- 搜尋與 section landing 預設只顯示每個 `canonical_id` 的首選語言版本，避免同一篇內容重複出現多次

## `file://` 與載入策略

在 `file://` 受限場景，`fetch()` 容易被瀏覽器擋掉，所以索引需要提供 JS 版本：

- 優先用 `<script src="search/search-index.js">` 載入 `window.SITE_SEARCH_INDEX`
- 如果環境允許，才用 `fetch("search/search-index.json")` 作為 fallback

開發時仍建議用 `python3 -m http.server` 起本機靜態站，避免 file 協議差異導致的誤判。

## Standard Generators（內容頁生成邊界）

`tools/create_content.py` 是全站唯一的標準內容頁生成器；不同 section 透過 `--content-dir` 與 source/output 路徑區分。

- 生成器的責任是輸出穩定、theme-aware、可被索引的標準內容頁
- 允許少量不同排版 style，但 style 屬於排版層，不應反向逼 parser 為了 presentation 擴充過多 gadget
- compile-time template / renderer 應放在 `tools/content_styles/`；瀏覽器實際載入的內容頁 CSS 應放在 `assets/css/content-page/`，避免把全站內容頁殼層誤收進 `garden/`
- site-level shared chrome 與 content generator shared partial 應分層：`pages/_shared/` 負責 page shell SSOT（例如 navbar），`tools/content_styles/_shared/` 只負責內容頁生成流程的 shared partial；內容頁若需要 navbar，應在生成階段讀 `pages/_shared/navbar.html`
- 若需求主要是特殊視覺、特殊互動或高度客製 layout，應走 custom page / custom style，而不是污染標準生成器契約
- parser 應優先支援有語意價值的 component；例如插圖應優先走 `<image>`，而不是鼓勵 raw `<img>`
- Timeline runtime 若同時存在多個 ongoing `period`，可在視覺層把尾端 `period-end` 收斂成單一 `Present / 至今` cluster；但 cluster 只屬於 projection / render，source data 仍維持逐筆 event
- Timeline 若支援 `category` facet，應只作為 badge / filter 等輕量語意來源；theme / palette 仍負責主色彩系統，不讓 category 再長出第二套固定色碼契約
- Copilot 可見性若支援 settings 偏好，應由共用 settings runtime 管理單一 localStorage 值（`off / home / all`），並由 `copilot.js` 依頁面類型解讀；`pages/settings.html` 仍是 settings page surface，不屬於 `_shared` partial

日常工作流可透過 `cli.py` 包裝批次重生 source-driven 內容：

- `python3 cli.py build <source.md>`：重生單篇 HTML，並更新 search index
- `python3 cli.py build-all --content-dir notes|writing|canvas`：重生單一 section
- `python3 cli.py build-all --content-dir all`：重生整個 repo 下的 source-driven content，完成後統一更新 search index
- `python3 cli.py translate --source ... --target-lang ...`：產生另一語言版本 source（`.md`）

## Translation Workflow Contract（source-driven）

- 明確入口：`tools/translate_content.py`（`cli.py translate` 為上層包裝）
- 典型指令（單篇）：
  - `python3 cli.py translate --source notes/<topic>/<topic>.md --target-lang en --backend gemini-api`
- 典型指令（批次）：
  - `python3 cli.py translate --batch-dir notes --recursive --target-lang en --backend gemini-api`
- 可覆寫既有目標檔：
  - 加上 `--overwrite`
- 可先預覽不落盤：
  - 加上 `--dry-run`
- Source contract：
  - 可翻欄位：`<meta>` 的 `Title` / `Summary`、正文自然語言段落
  - 不可翻欄位：`Tags`、`Slug`、`Output`、`Status`、`CanonicalId` 與自訂 block tag/骨架
- Backend strategy：`gemini-api` / `local-model` / `pretrained-model` 都走同一策略介面
- Model store（統一模型資料夾）：
  - 預設為 `data/models`
  - 可用 `--model-store <path>` 覆寫
  - `local-model` 與 `pretrained-model` 會在此目錄下使用各自子資料夾（`local/`、`pretrain/`）
  - `gemini-api` backend 不依賴本地模型，但仍共用同一參數面，避免 workflow 分裂
- Credential source（API backend）：
  - 優先讀 environment variables（`GEMINI_API_KEY` / `LUDWIGIA_GEMINI_API_KEY`）
  - 缺值時讀 `secret.txt`
  - `secret.txt` 必須排除在版本控制外
- 輸出命名：
  - 預設輸出到來源檔同資料夾，檔名為 `<stem>-<target-lang>.md`
  - 若來源檔名已帶語系尾碼（例如 `foo-zh-Hant.md`），會先去尾碼再產生目標檔名（例如 `foo-en.md`）
  - 可用 `--output-root` 指向另一棵輸出目錄，並保留來源相對路徑

更完整的翻譯契約請看 `docs/specs/translation-spec.md`；這裡只保留系統層 invariants。

只要 source `.md` 的 `<meta>` 已提供必要欄位（至少 `Title` / `Tags` / `Summary`，以及可選的 `Output` / `Style` / `Status` / 日期欄位），標準內容頁就應能被再現性重生，不需要手動維護第二份 HTML metadata。

目前可視為穩定的 parser 邊界：

- Markdown 子集：heading / list / table / quote / code / hr / inline link / inline code / bold
- 結構化 block：`<callout>`、`<block>`、`<takeaways>`、`<qquiz>`、`<reviewkit>`、`<qprompt>`、`<image>`
- inline explanation：`<information context="...">term or phrase</information>`，或 `<information concept="concept.xxx">term or phrase</information>` / `<information concept="concept.xxx"/>`
- 逃生門：`<rawhtml>`（預設禁用，需顯式開啟）

## Page-scoped Source Data（非內容型 source contract）

某些不是內容頁本體、但又不適合硬寫在 JS 裡的 surface，可以有獨立的 source-driven data contract。

目前先收斂成：

- 資料檔放在 `assets/data/`
- authoring 應維持明確 schema，而不是自由 JSON
- runtime 可以 parse 並投影成 UI 需要的 shape，但 projection 不應回寫成新的手動維護資料
- 若同一份資料存在多個資訊尺度，應由 source metadata 表達 visibility contract，而不是靠 view 層硬編碼過濾規則

Timeline 是第一個明確採這條路的 page-scoped source data：

- source of truth：`data/Timeline/timeline.json`
- source event type：`point` / `period`
- visibility facet：`scale = macro | meso | micro`
- `macro -> Macro + Meso + Micro`
- `meso -> Meso + Micro`
- `micro -> Micro only`
- `period` 先由 runtime 投影成 `period-start / period-end`
- `start_*` / `end_*` 欄位若缺席，應 fallback 到共用 `title / summary / detail`
- ongoing `period` 可用 `end = "present"`；runtime 應負責把它顯示成 `Present / 至今`，並投影成可排序的當下時間點
- `references` 延伸連結：支援 `{ title, url }` 或 `{ title, canonical }`（亦支援 `canonical_id` / `canonicalId`）；前端 runtime 於渲染時依 `SITE_SEARCH_INDEX` 自動對接 `writing` / `notes` 文章路徑與標題，缺省標題時會自動從搜尋索引取文章 Title，無法 resolve 時則優雅退化為純文字標題
- 延伸連結呈現：採用 `<ol class="timeline-detail-links-list">` 有序清單，樣式與 `notes/writings` 內的 linked text 保持一致（預設收斂、hover 時呈現 accent 亮彩與箭頭微動）

更完整的 parser 語法與各 block 欄位，請看 `docs/specs/parser-spec.md`；這裡只保留系統層依賴的穩定邊界。

註：

- 舊的 `<section>...</section>` source block 已移除，不再視為作者可用語法
- section 的語意仍存在於輸出的 HTML 結構中，但由標準 heading / template 負責，不再要求作者在 source 內手動寫 `<section>`

## Core Markdown Extraction（給 Reading Mode / Garden）

目前 Reading Mode / Garden 相關工作流直接讀 `.md` source 時，它們不需要理解整份 extended markdown。

- metadata parser：必要時另行讀 `<meta>`
- markdown extractor：只讀純 markdown 正文（heading / paragraph / list / table / quote / code / hr / inline link / inline code / bold）

### Markdown Table

- 目標：讓作者能直接用標準 pipe table 表達方法比較、欄位對照與 decision matrix
- source 語法：header row + divider row + body rows
- 例子：

  ```text
  | Aspect | K-Means | DBSCAN |
  | --- | --- | --- |
  | Cluster model | Centroid-based | Density-based |
  ```

- 邊界：
  - 目前只支援欄數一致的標準 table
  - table 屬於 core markdown，應可被內容頁正常渲染
  - 若未來 Reading Mode / Garden 只抽 core markdown，table 也應屬於可保留內容，而不是 extras gadget
- 可忽略：除正文外的所有自訂 block

## Image Viewer Contract（Canvas / Notes / Writing）

- 圖片放大互動採全站共用 runtime，避免各入口各自維護 lightbox
- 基本互動：點擊圖片開啟放大檢視、`Esc` 關閉、手機可直接點擊背景關閉
- 連結優先規則：
  - 若圖片包在 `<a>` 裡，預設優先放大（不直接跳轉）
  - 使用者按住 modifier key（`Cmd/Ctrl/Shift/Alt`）點擊時，保留原本連結行為
  - 若 `<a data-image-viewer="link-only">`，強制以連結跳轉為優先
- 互動需維持 `file://` 可用，不依賴後端

### Information Tooltip（inline explanation）

- 目標：讓作者能對特定詞彙或片語補一段短說明，而不必把正文打斷成額外 block
- source 語法：`<information context="...">term or phrase</information>`，或 `<information concept="concept.xxx">term or phrase</information>` / `<information concept="concept.xxx"/>`
- ontology source：`data/Ontology/information-ontology.json`
- `file://` 相容載入：`data/Ontology/information-ontology.js`
- authoring helper：`python3 cli.py scan-information <source.md>` 可掃描單篇 source 裡命中 ontology 的詞，列出已標註 `<information>` 的項目與第一次出現但尚未標註的候選詞；它只提供提示，不會自動改寫 source
- ontology context / glossary 類說明的文案順序，預設採「先回答它是什麼，再回答它拿來做什麼」：先給讀者概念本體的 category anchor，再補用途、角色或作用
- UI 行為：
  - 該詞彙或片語維持 inline
  - 視覺上以虛線底線提示
  - hover / focus-visible 時顯示 `context` 或 ontology context 內容
  - pointer 移入 tooltip 本體時仍維持顯示；離開整個 explanation 區域後才收起
- 邊界：
  - `context` 或 ontology context 僅接受字串，不作 rich HTML 容器
  - `context` 或 ontology context 不應一開頭只講用途卻不交代本體；應優先先說明它是狀態、機制、流程、路徑、節奏、指標、協議、任務、方法或其他哪一類概念
  - 若使用 `concept=`，build 輸出的 HTML 可只保留 placeholder reference，不必把長 definition 重複展開進每篇 HTML
  - tooltip 行為屬內容頁表現層；Garden / Reading Mode 不要求完整保留這種互動

### Garden Markdown Rendering

- Garden React renderer 使用標準 markdown pipeline：`react-markdown` + `remark-gfm` + `remark-math` + `rehype-katex`
- 目標是讓 list / table / inline math / block math 走同一套正式語意，而不是在 UI 層維護另一份手寫 markdown parser
- Search page 與 section landing 的 preview 仍可用較輕量的 preview renderer，但 Garden 的全文閱讀視圖應以標準 markdown renderer 為準

## Notes Extras（可選增強）

原則：Extras 不改動 index schema，也不影響基本搜尋/導覽；它們是單篇內容的 UI enhancement。

- 互動 / authoring semantics 的長期規則已收進 `docs/rules/guardrails.md`
- 這裡只保留與 parser / runtime / 跨 view 降級策略有關的 spec

目前可視為 notes / writing / canvas 單篇頁的可選增強：

- Related posts
- Meta sidebar 的 `Copy Markdown` / `Download Markdown`
- Quick quiz
- QA generator prompt

規則：

- 這些 extras 不應成為 indexer / Search / Garden 可用性的前提
- 即使單篇頁完全不掛這些 enhancement，只要 `<head>` metadata contract 成立，索引與基本導覽仍應可運作
- 若內容頁是由 source `.md` 再現性生成，Meta sidebar 應固定提供 `Copy Markdown` / `Download Markdown`

## Repo Topology（Core / Subsystems）

我們用「core contract vs subsystems」來降低耦合、降低理解成本：

- Core（共用區）：放所有入口都可能依賴的能力與 token（例如 Theme/Palette、SearchCore、共用 UI/工具）
- Subsystem（額外子系統）：像 Garden 這種入口可以自帶資產與 build 產物，但不應反向定義 core contract

`core/`（規劃中的目標邊界）：

- 可以放：SearchCore、共用 schema/type 定義、共用 UI utilities、Theme/Palette token（若之後想抽出）
- 不放：生成物（search-index.*）、任何 subsystem 的 build output、以及只服務單一入口頁的 UI

`search/`（資料與生成層）：

- 放 indexer 與生成物（`search-index.{json,js}`）
- 不放 UI 與 theme/palette（避免把資料層變成大雜燴）

`garden/`（子系統）：

- 放 Garden 專用 UI、資產、以及 build output（例如 `garden/floral-assets/`）
- 但仍只讀 `window.SITE_SEARCH_INDEX`，不自己產生第二份索引
- `garden/index.html` 的 floral runtime 與主站 `core/script.js` 的 theme runtime 屬不同責任邊界；預設允許各自演進，不強制共享 ambient effect 實作

## 生成物策略（Deploy Artifacts Whitelist）

目標：靜態站要能被「直接打開」與「被部署」；因此少數生成物屬於部署必需品，必須納入版本控制；其餘一律視為本機或 CI 生成物，必須進 `.gitignore`。

### 為什麼 `search/search-index.{json,js}` 必須進版控

- 它是全站搜尋/瀏覽的資料來源（`window.SITE_SEARCH_INDEX` 的唯一來源）
- 靜態站沒有後端，入口頁必須能直接讀到索引（含 `file://` 場景）
- 若 schema/內容影響索引，必須同步更新並納入版本控制，避免「改內容忘記更新 index」

### 為什麼 `garden/floral-assets/` 必須進版控

- `garden/index.html` 直接引用這個資料夾的 build 產物
- 不提交會導致 Garden 入口在別人的機器上不可用（除非他自己 build）

### 目前白名單（必須 commit）

- `search/search-index.json`
- `search/search-index.js`
- `garden/floral-assets/`

### 其它生成物（必須 ignore）

- 例：`garden/_floral_dist/`

## CI / Guardrails（合併前自動擋壞）

核心方向：

- 只要改了內容或 indexer/schema，就必須重生並提交 `search/search-index.{json,js}`
- 用自動化檢查去擋「改了 notes 忘記更新 index」與「入口頁壞掉」

若要改動這些守門規則，先確認 `AGENTS.md` 的不可退化原則仍成立。
