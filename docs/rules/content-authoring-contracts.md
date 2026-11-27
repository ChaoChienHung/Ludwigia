# Content Authoring & Generation Contracts

本文件承接根目錄 `AGENTS.md`，集中 `notes/`、`writing/`、`canvas/`、內容生成器（`tools/create_content.py`）、翻譯工具（`tools/translate_content.py`）與索引器（`search/indexer.py`）的不可退化契約。修改內容、parser、metadata 或寫作規範前請先查閱本文件。

## 1. Metadata 與再現性生成

- **可索引 metadata 單一來源**：`<title>`、`meta name="site:tags"`、`meta name="site:summary"`、`meta name="site:status"`（若啟用）必須維持再現性生成，不得要求手動維護第二份。
- **Pinned / Priority**：若啟用，`meta name="site:pinned"` / `meta name="site:priority"` 必須由 source metadata 再現性生成，不得靠手改 HTML 或另維護推薦清單。在搜尋與 section landing 中，只有符合 query/tag filter 的 writing 才能被置頂；pinned 只是排序 boost，不是繞過 filter 的白名單。
- **頁內 H1 fallback**：若啟用 H1 fallback，優先讀正文最前面的第一個 `# Title`；`<meta Title>` 只當頁內顯示 fallback，不得反過來強迫正文標題與 metadata 耦合。
- **日期 metadata**：
  - `meta name="site:published_at"` / `meta name="site:last_modified_at"` 由 source metadata 或可重現 fallback 再現性生成，不手動維護第二份 HTML 顯示值。
  - source metadata 欄位名優先為 `Published` / `LastModified`，支援 `YYYY-MM-DD`（或 ISO8601 正規化成 `YYYY-MM-DD`）。
  - `Published` 缺席時不強制顯示；`LastModified` 可退回 source 檔案的 last modified date，不得依賴不穩定的 created/birthtime 作為唯一真相來源。
- **Status 可見性**：
  - source metadata 欄位名為 `Status`，允許值收斂為 `published` / `drafting`，預設 `published`（維持向後相容）。
  - `drafting` 不得被公開 index / listing 視為已發布內容，也不得出現在公開搜尋／瀏覽入口；但保留本機預覽與直連工作流。
- **Tag 語意**：
  - `site:tags` 以逗號分隔；tag 內允許空白（例如 `system design`），URL 端以 encode 後的值為準。
  - 若 tag 已收斂到 ontology concept，對外顯示文案優先依目前語系選對應 label，不強制統一英文。
  - `site:tag_concepts`（若存在）需與 `site:tags` 保持相同順序，作為穩定對齊欄位。
  - tag 比對優先走 ontology concept id；未命中 ontology 才退回 trim + case-insensitive 字串精準比對。
  - 可點擊的 tag detail 入口預設收斂到 `tag/index.html`，可帶 `?concept=...&tag=...`，並向後相容既有 `?tag=...`。
  - Search / section landing 的 tag filter UI 若保留 local filter，應另外提供明確的 tag detail 入口，不讓規則分裂。

## 2. Core Markdown、生成器與翻譯邊界

- **Core Markdown 與 Extras 分層**：若未來 Reading Mode / Garden 卡片改從 Markdown source 再現性生成，應只依賴「必要 metadata + core markdown 正文」；markdown extractor 只負責 core markdown，`<meta>` 由 metadata parser 處理，其餘 `<...>` 自訂語法皆視為可忽略的附加層。
- **Markdown 匯出為基本能力**：只要內容頁由 source `.md` 再現性生成，Meta sidebar 就固定提供 `Copy Markdown` / `Download Markdown`；這不是單篇 opt-in feature，而是 source-driven content 的基本能力。
- **標準生成器邊界（`tools/create_content.py`）**：
  - 預設輸出必須使用 `tools/content_styles/default`，維持「一鍵生成」的穩定體驗。
  - 維持標準內容頁生成器定位：允許少量 style 差異，但不得為 presentation 無限制擴張 parser，避免變成萬用 page builder。
- **翻譯工作流（`tools/translate_content.py` / `cli.py translate`）**：
  - 維持 source-driven contract：只翻必要自然語言；`Tags`、metadata key、slug、路徑與 block 骨架不得被任意改寫。
  - 翻譯 backend 憑證必須支援 environment variables 與 `secret.txt`；`secret.txt` 必須排除在版本控制外。
- **索引同步**：`search/indexer.py` 必須能從 `notes/`、`writing/`、`canvas/` 再現性生成 `search/search-index.json` 與 `search/search-index.js`（定義 `window.SITE_SEARCH_INDEX`）；若變更影響索引內容或 schema，必須同步更新生成物並納入版控。

## 3. 語意化自訂標籤與 Question Bank

- **`<reviewkit>`**：
  - 維持 semantic container：`qquiz` / `qprompt` 可獨立存在；只有同時出現在同一個 `reviewkit` 內時才組成 tabs UI。
  - 所有 `notes/` 底下的單篇筆記（Note）一律必須在頁面結尾包含 `<reviewkit>` 容器；內部至少包含 `<qprompt/>`，若存在 `<takeaways>` 或 `<qquiz>`，一律包在該 `<reviewkit>` 內，不得讓 `<takeaways>` 散落在外。
- **External Question Bank（`questions.<lang>.json`）**：
  - 若啟用 `question_focus`，維持 per-question source-driven facet（例如 `concept_understanding` / `algorithm_recognition`）。
  - 同一個 bank 可混放不同方向題目，不得要求拆成多份 bank；Labs / filter UI 只讀 bank metadata，不得另維護題目方向設定。
- **`<qprompt>`**：
  - prompt 本體由 `<qprompt>...</qprompt>` 或 `<qprompt/>` 再現性生成。
  - 出現在 `reviewkit` 內時渲染為 prompt pane；出現在外時獨立渲染為可見 QA prompt section。
- **`<information>`**：
  - source 語法為 `<information context="...">term or phrase</information>`，或 ontology-backed 的 `<information concept="concept.xxx">term or phrase</information>` / `<information concept="concept.xxx"/>`。
  - 被包住的詞彙／片語維持 inline，不破壞 paragraph flow；`context` 或 ontology context 只作補充說明 tooltip，不擴張成任意 rich HTML 容器。
  - 使用 `concept=` 時，tooltip 內容以 `data/Ontology/information-ontology.json` 為單一來源；HTML 只輸出 placeholder reference，不將同段 definition 重複硬貼進每篇 HTML。
  - `cli.py scan-information <source.md>` 僅為盤點候選詞的 authoring helper，不代表命中 ontology 的詞應被自動插入 tooltip。
  - tooltip 在 pointer / focus 停留於補充說明本體期間維持可見，離開整個 explanation 區域後才收起。
- **`<content-link>`**：
  - source 語法為 `<content-link canonical="some-shared-article-id">Visible Label</content-link>` 或 `<content-link canonical="some-shared-article-id" label="Visible Label"/>`。
  - target resolution 以 `CanonicalId` 為穩定 lookup key，不要求作者手寫 output path / html href。
  - 一般內容頁可 resolve 成站內連結；在 copy/download markdown、Garden/Search surfaces 與 Reading Mode 退化成純文字 label，不將 link 語意視為 core markdown。
  - target 無法 resolve 時至少退化成純文字 label，不得讓整篇內容 build 因單一 cross-reference 失敗而不可用。
- **`<takeaways>`**：
  - source 語法為 `<takeaways>...</takeaways>`，內部以標準 markdown list 承載條列式重點。
  - 屬於正文 flow 外的重點回收區，不取代正文段落總結。
  - 在 `Copy Markdown` / `Download Markdown` 導出時降級為 `## Key Takeaways` 標題加清單，確保重點整理在純文字導出中保留。
- **`<draft>`（作者規劃欄位與起稿骨架）**：
  - `TLDR` / `NarrativeArc` / `Scope`（必填）、`FollowUps`（選填）與文章專屬的章節骨架屬 author-only planning scaffolding，統一放 `<draft>...</draft>`，不混進公開 `<meta>`。
  - 三個必填欄位後空一行，接文章專屬的「段落角色｜核心主張：內容」章節骨架。骨架每個節點用標準 Markdown `-` 或 `1.`、`2.` 等有序清單，同一組並列項目寫法一致；需要時用四格縮排清單子項記例子、證據與交棒。子項區塊結束後，與下一個同級章節之間空一行。完整風格見 `docs/author/writing-notes.md`。
  - `tools/create_content.py`、markdown extractor、search/indexer 預設皆忽略 `<draft>`；不得當成公開 `<head>` metadata 或 search index 欄位，也不要求作者另外維護第二份對外摘要。
- **前段可見導讀 block**：
  - 若文章前段需要可見導讀 block，優先收斂成「這篇最重要的主題 / main flow / scope」，寫成一般 `block` / `callout`（語意偏 `TL;DR` / `Focus` / `Article Compass`），不預設另開專門的 `Guiding Questions` 特殊 block。
  - 責任是幫讀者抓住主線，不重複列出分散在各段的 guiding questions。

## 4. 寫作結構與 Markdown 格式契約

- **方法家族 Overview 與單一方法 Deep Dive 解耦**：
  - overview 頁聚焦主問題、方法地圖、差異軸與導覽，不把篇幅重心長時間停在某單一子方法的直覺、推導或細部機制（只需講到足以定位其角色與差異）。
  - 單一方法的 limitation / tuning / detailed trade-offs 回到各自頁面；不把「介紹技術家族」與「完整講完數個演算法」硬塞在同一篇主文。
- **知識邏輯與閱讀流暢度契約（Layered Knowledge Scaffolding & Frictionless Progression）**：
  - 無論 `notes/` 或 `writing/`，皆須遵守「底層成群鋪墊、逐層向上堆疊、零跳躍、零割裂」，降低閱讀難度與工作記憶負荷：
    - **底層先鋪齊成群（Clustered Foundation Layer）**：引入進階機制、高階抽象或複雜架構前，先在底層完整鋪墊同層級的先備地基（生活直覺、問題意識／痛點、物理或業務約束、核心線索群），嚴禁突兀空降孤立的高階術語或解法。
    - **逐層穩步向上堆疊（Hierarchical Upward Stacking）**：以底層線索向上衍生中階機制與引理（Intermediate Lemma），再組合出頂層架構、高階抽象與極限邊界；每一層新概念必有前一層承托（Causal Scaffolding）。
    - **消除認知斷崖與割裂感（Eliminate Cognitive Whiplash）**：嚴禁「空中樓閣」（未鋪陳直接跳結論）、「概念倒置」（用更晦澀的高階概念解釋低階直覺）與「板塊孤島拼貼」（段落缺乏因果銜接）。底層多維度／子分支應成批交代清晰後再上升到下一階。
- **Agent-assisted 寫作底線**：前面的整理／填充／重組可簡化或委派，但最後的人類全盤 proofread 不得省略。
- **Markdown List Authoring**：
  - ordered / unordered item 若帶 continuation paragraph，該段落必須縮排 `4 spaces`。
  - nested bullet / nested ordered list 必須相對 parent item 縮排 `4 spaces`。
  - 不允許依賴「未縮排下一行也算同一個 list item」的寬鬆猜測；source 須為標準 markdown 可解析形式。
  - **階層化清單與樹狀圖間距（Nested List & Tree View Spacing）**：清單項目或目錄樹狀圖若包含子層級（縮排子項目、子資料夾 `└── ...` 或多行次級說明），在該子層級區塊結尾與下一個同級母項目之間必須**空一行（blank line）**分隔，嚴禁緊貼下一母項目。
- **Markdown Table**：
  - 採標準 pipe table（header row + divider row + body rows），至少要求欄數一致，不依賴鬆散猜測補齊破損表格；table 屬 core markdown，非額外自訂 block。

## 延伸閱讀

- 完整工作流與指令範例：`docs/guide/content-workflow-guide.md`
- 精確規格：`docs/specs/parser-spec.md`、`docs/specs/content-metadata-spec.md`、`docs/specs/inline-enhancement-spec.md`、`docs/specs/translation-spec.md`、`docs/specs/citation-spec.md`
- 寫作心法與模板：`docs/author/writing-notes.md`
