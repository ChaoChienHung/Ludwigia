# AGENTS

本文件列出 Ludwigia 的不可變更約束（non-negotiables）。後續新增功能或重構時，請以「不讓這些特性退化」為第一優先。

本文件只放「必須永遠成立」的規則；使用教學請看 `README.md`；系統規格請看 `docs/specs/system-spec.md`；parser / metadata / translation 的內容契約請看 `docs/specs/parser-spec.md`、`docs/specs/inline-enhancement-spec.md`、`docs/specs/content-metadata-spec.md`、`docs/specs/translation-spec.md`；設計理由與重大決策脈絡請看 `docs/design/design.md`；第一視角的心得雜談請看 `docs/author/dev-notes.md`。

## 不退化原則（Non-regression）

- 內容的可索引 metadata 必須維持為再現性生成：`<title>` / `meta name="garden:tags"` / `meta name="garden:summary"` / `meta name="garden:status"`（若啟用）不能要求手動維護第二份
- 若內容支援 pinned/priority metadata，`meta name="garden:pinned"` / `meta name="garden:priority"` 也必須由 source metadata 再現性生成；不能靠手改 HTML 或另外維護一份推薦清單
- 頁內大標題若啟用 H1 fallback，必須維持：優先讀正文最前面的第一個 `# Title`；`<meta Title>` 只當頁內顯示 fallback，不得反過來強迫正文標題跟 metadata 耦合
- 若內容支援日期 metadata，`meta name="garden:published_at"` / `meta name="garden:last_modified_at"` 也必須由 source metadata / 可重現 fallback 再現性生成，不應要求手動維護第二份 HTML 顯示值
- Garden 的所有搜尋/瀏覽頁面只讀索引資料（`window.SITE_SEARCH_INDEX`），不得要求手動維護第二份 tags/summary/related
- 若內容支援 `status` metadata，`drafting` 狀態不得出現在公開搜尋/瀏覽入口；但仍可保留本機預覽與直連工作流
- 若未來 Reading Mode / Garden 卡片改成從 Markdown source 再現性生成，應依賴「必要 metadata + core markdown 正文」；其中 markdown extractor 只負責 core markdown，`<meta>` 由另一層 metadata parser 處理，其餘 `<...>` 型自訂語法都視為可忽略的附加層
- 只要內容頁是由 source `.md` 再現性生成，Meta sidebar 就應固定提供 `Copy Markdown` / `Download Markdown`；這不是單篇 opt-in feature，而是 source-driven content 的基本能力
- `tools/create_content.py` 的預設輸出必須使用 `tools/content_styles/default`（確保「懶得手刻時也能一鍵生成」的體驗穩定）
- `tools/create_content.py` 必須維持為標準內容頁生成器：允許少量 style 差異，但不得為 presentation 無限制擴張 parser，避免把標準生成器變成萬用 page builder
- page-level shared chrome（例如 navbar）若收斂為單一來源，應以 `pages/_shared/` 作為 site shell SSOT；`tools/content_styles/_shared/` 只保留內容生成流程需要的 shared partial，不應再平行維護第二份 navbar 真相來源
- 若啟用翻譯 workflow（`tools/translate_content.py` / `cli.py translate`），必須維持 source-driven contract：只翻必要自然語言；`Tags`、metadata key、slug、路徑與 block 骨架不得被任意改寫
- 若翻譯 backend 需要憑證，必須支援 environment variables 與 `secret.txt`；`secret.txt` 必須排除在版本控制外
- `reviewkit` 若存在，必須維持為 semantic container：`qquiz` / `qprompt` 可獨立存在；只有當它們都出現在同一個 `reviewkit` 內時，才組成 tabs UI
- 所有 `notes/` 底下的單篇筆記（Note）一律必須在頁面結尾包含 `<reviewkit>` 容器；`<reviewkit>` 內部至少包含 `<qprompt/>`，若存在 `<takeaways>` 或 `<qquiz>`，一律必須包在該 `<reviewkit>` 容器內，不得讓 `<takeaways>` 散落在 `reviewkit` 外
- 若內容支援 external question bank（`questions.<lang>.json`），題目 metadata 若啟用 `question_focus`，必須維持為 per-question source-driven facet：
  - 可用來表達如 `concept_understanding` / `algorithm_recognition` 這類題目方向
  - 同一個 bank 可混放不同方向題目，不應要求拆成多份 bank
  - Labs / filter UI 只能讀 bank metadata，不應再額外維護另一份題目方向設定
- 若首頁 `Timeline` section 啟用 source-driven data file（例如 `data/Timeline/timeline.json`），必須維持：
  - 作者只維護 timeline data，不應要求同步手改前端 JS event 陣列
  - runtime 只負責 load / validate / normalize / projection / render；projection 不應反過來成為新的手動真相來源
  - `scale` 若啟用，語意固定為 `macro -> Macro + Meso + Micro`、`meso -> Meso + Micro`、`micro -> Micro only`
  - `period` 若支援 `start_*` / `end_*` 欄位，缺席時必須 fallback 到共用 `title / summary / detail`；不應強迫作者永遠維護兩份 description
  - ongoing `period` 若啟用，`end: "present"` 必須作為穩定 authoring 寫法；runtime 可把它投影成「至今 / Present」顯示與可排序的當下時間點，但作者不應被迫反覆手改今天日期
  - 若同一時間存在多個 ongoing `period`，timeline UI 可把多個 `period-end` 收斂為單一尾端 `Present / 至今` cluster；但 source data 仍維持逐筆 event，不能把 cluster 本身當成新的手動資料層
  - 若 timeline 支援 `category` metadata（例如 `education` / `internship` / `work`），它只作為輕量 facet 與 badge 顯示來源；不得反過來長成第二套固定配色系統，破壞既有 palette-driven 視覺契約
- 若首頁 `Skills` 與 `Credentials` 區塊啟用 source-driven data file（`data/Skills/skills.json` 與 `data/Credentials/credentials.json`），必須維持：
  - 作者只維護 source JSON，前端 runtime (`about-skills.js` / `about-credentials.js`) 負責載入、正規化、多語切換與 DOM 渲染；不應要求手動維護第二份 HTML 靜態資料
  - `Skills` 必須維持類別分組與頁籤/箭頭控制，確保多個技能面板共用顯示空間，隨技能成長仍能維持空間精簡
  - `Credentials` 必須維持 `Type` 與 `Domain/Category` 雙維度篩選、主視覺展示區、縮圖導覽列與 Modal 燈箱放大檢視能力；視覺元件必須完全繼承全站 Theme 與 Palette Design Tokens
- `qprompt` 的基本語意若啟用，必須維持：
  - prompt 本體由 `<qprompt>...</qprompt>` 或 `<qprompt/>` 再現性生成
  - 若 placeholder 出現在 `reviewkit` 內，就渲染成該 `reviewkit` 的 prompt pane
  - 若 placeholder 出現在 `reviewkit` 外，就獨立渲染成可見的 QA prompt section
- `information` 的基本語意若啟用，必須維持：
  - source 語法可為 `<information context="...">term or phrase</information>`，或 ontology-backed 的 `<information concept="concept.xxx">term or phrase</information>` / `<information concept="concept.xxx"/>`
  - 被包住的詞彙/片語維持 inline，不應破壞 paragraph flow
  - `context` 或 ontology context 只作為該詞彙/片語的補充說明 tooltip，不應被擴張成任意 rich HTML 容器
  - 若使用 `concept=`，tooltip 內容必須由 `data/Ontology/information-ontology.json` 作為單一來源；HTML 可只輸出 placeholder reference，不應把同一段 definition 重複硬貼進每篇 HTML
  - 若需要盤點文章裡哪些 ontology term 值得補 `<information>`，可用 `cli.py scan-information <source.md>` 做候選詞掃描；但這只是一個 authoring helper，不代表命中 ontology 的詞應被自動插入 tooltip
  - tooltip 在 pointer / focus 停留於補充說明本體期間應維持可見；離開整個 explanation 區域後才收起
- `content-link` 的基本語意若啟用，必須維持：
  - source 語法可為 `<content-link canonical="some-shared-article-id">Visible Label</content-link>`，或 `<content-link canonical="some-shared-article-id" label="Visible Label"/>`
  - target resolution 應以 `CanonicalId` 作為穩定 lookup key，而不是要求作者手寫 output path / html href
  - 在一般內容頁可 resolve 成站內連結；但在 copy/download markdown、Garden/Search surfaces 與 Reading Mode 應退化成純文字 label，不把 link 語意視為 core markdown
  - 若 target 無法 resolve，至少退化成純文字 label；不應讓整篇內容 build 因單一 cross-reference 失敗而整體不可用
- `takeaways` 的基本語意若啟用，必須維持：
  - source 語法為 `<takeaways>...</takeaways>`
  - 內部以標準 markdown list 承載條列式重點
  - `takeaways` 屬於正文 flow 外的重點回收區，不應取代正文段落總結
  - 在 `Copy Markdown` / `Download Markdown` 導出時，會降級轉換成 `## Key Takeaways` 標題加清單，確保重點整理在純文字 Markdown 導出中完好保留
- 若 source `.md` 支援作者規劃欄位與起稿骨架（例如 `TLDR` / `MainFlow` / `Scope` / `OutOfScope` / `FollowUps` 或大綱骨架）：
  - 它們屬於 author-only planning scaffolding，應統一放在 source `<draft>...</draft>`，而不是混進公開 metadata 的 `<meta>`
  - 建議採用「`重點：內容`」（例如 `何謂結果偏誤：結果偏誤是...`）或層級化縮排清單表達章節與重點骨架
  - `tools/create_content.py`、markdown extractor、search/indexer 預設都應忽略 `<draft>` 內容
  - 不得被當成公開 `<head>` metadata 或 search index 欄位
  - 不應要求作者另外手動維護第二份對外摘要
- 若文章前段需要一個可見的導讀 block，應優先收斂成「這篇最重要的主題 / main flow / scope」：
  - 不預設要求另開一個專門的 `Guiding Questions` 特殊 block
  - 若要顯示在正文前段，優先把它寫成一般 `block` / `callout`，語意上偏 `TL;DR` / `Focus` / `Article Compass`
  - 這個前段 block 的責任是幫讀者抓住主線，不是把分散在各段裡的 guiding questions 再重複列一次
- 知識型文章若主題其實是「方法家族 overview」，必須優先維持 overview 與單一方法 deep dive 的解耦：
  - overview 頁聚焦主問題、方法地圖、差異軸與導覽
  - overview 頁不應把篇幅重心長時間停留在某一個子方法的直覺、推導或細部機制；子方法只需講到足以定位其角色與差異
  - 單一方法的 limitation / tuning / detailed trade-offs 應回到各自頁面
  - 不應把「介紹一個技術家族」與「完整講完其中數個演算法」硬塞進同一篇主文
- 若採用 Agent-assisted 寫作 workflow，前面的整理/填充/重組可以被簡化或委派，但最後的人類全盤 proofread 不得被省略
- Markdown list authoring 規則必須穩定：
  - ordered / unordered item 若帶 continuation paragraph，該段落必須縮排 `4 spaces`
  - nested bullet / nested ordered list 也必須相對 parent item 縮排 `4 spaces`
  - 不允許依賴「未縮排下一行也算同一個 list item」這種寬鬆猜測；source 應寫成標準 markdown 可解析形式
- 若支援 markdown table，基本語意必須維持：
  - 採標準 pipe table 寫法（header row + divider row + body rows）
  - 至少要求欄數一致；不依賴鬆散猜測去補齊破損表格
  - table 屬於 core markdown，而不是額外自訂 block
- `search/indexer.py` 必須能從 `notes/`、`writing/`、`canvas/` 再現性生成：
  - `search/search-index.json`
  - `search/search-index.js`（必須定義 `window.SITE_SEARCH_INDEX`）
- 若變更會影響索引內容或 schema，必須同步更新生成物並納入版本控制（避免「改 notes 忘記更新 index」）

## 介面穩定性

- 允許內容放在子資料夾（`notes/**/<slug>.html`、`writing/**/<slug>.html`、`canvas/**/<slug>.html`），且索引/標籤頁連結必須在 nested paths 下仍可工作
- 語系/Theme/Palette 等偏好狀態必須維持為 client-side（localStorage）狀態，不引入後端 state 依賴
- Theme/Palette 的 localStorage 值需保持向後相容（允許舊值 alias），避免既有使用者偏好失效
- Theme 專屬視覺效果必須可被關閉/限定（例如 Galaxy 內的流星/星空），避免遮擋可讀性與互動
- 若新增 theme（例如 `Sky` / `Garden`），其動效控制需收斂到同一個可關閉機制，避免每個 theme 各自長出平行設定開關
- `notes / writing / canvas` 單篇內容頁底部的 footer 必須維持為語意完整的 footer 區塊：
  - `© 2025 Ludwig ...` 必須明確落在 footer 內，而不是像漂浮文字剛好疊在背景上
  - footer 視覺上應是單一、完整、theme-consistent 的底部 surface；不應在 footer 上方額外切出一條來自 theme ambient / body gradient 的帶狀過渡
  - 這屬於內容頁的共通版型約束，不應只針對某一個 theme 例外修補
- Theme ambience 若存在，必須區分 landing page 與 content page 的成本等級：
  - 首頁 / landing 可保留較強的 atmosphere
  - `notes / writing / canvas` 內容頁應優先使用較省效能、較不搶閱讀注意力的版本
  - 若某個 ambient effect 在內容頁造成明顯卡頓，優先降級、靜態化或移除高成本子效果，而不是只微調 opacity 硬撐
- Reading Mode 的 theme effect contract 必須維持：
  - 一旦進入 Reading Mode，theme ambience / motion layer 必須一律關閉，優先級高於 settings 內的 `Effects` 開關
  - 這條規則適用於主站共用 theme runtime；Reading Mode 的責任是保證閱讀時不被 ambient effect 干擾，而不是尊重使用者先前是否開啟動效
- 主站共用 `Theme / Palette / Effects` runtime 的責任邊界必須維持清楚：
  - 預設只保證主站頁面與標準內容頁生效（例如首頁、Portfolio/More、Projects/Search/Settings、section landing、tag detail、`notes / writing / canvas` 的 landing 與內容頁）
  - `garden/index.html`（Garden of Ludwigia）或其他明確獨立的 extension / prototype surface，可保留自己的 theme/runtime；不應因主站 theme contract 而被視為必須同步套用同一套 ambient effect
  - 若未來要讓某個 extension 接上主站 theme，必須是顯式整合的契約，不應僅因共用 repo、入口或某些 UI 元件就被動繼承
- note 頁的 theme-aware 補充元件（至少 `block` / `callout` / `takeaways`）必須維持：
  - 各自擁有明確的 theme surface variables（例如 background / border / shadow / radius / icon）
  - 目前可以暫時使用相同值，但變數命名與責任不可混在一起，避免未來一拆就得回去找散落 override
  - 未來新增 / 調整 theme 時，必須同步檢查這三類元件，而不是只修其中一個
- 若某個視覺問題需要連續疊多層 override 才壓得住，優先視為底層 variable pipeline / selector 分層失真：
  - 應優先回頭修 token、共用元件層或主 selector，避免持續在更上層補例外
  - 即使代表需要較大範圍 refactor，也優先於累積 override 技術債
- Settings 的互動語意必須維持：
  - `Theme` 管大方向的 surface / atmosphere / readability / ambient effect
  - `Palette` 管 accent 與互動特效（selected / hover / focus / ring）
  - `Copilot` 若啟用可見性設定，應收斂為單一偏好來源（例如 `off / home / all`），由共用 settings runtime 與 localStorage 管理；不得讓 modal、`pages/settings.html` 與 `copilot.js` 各自長出平行判斷
  - settings 內所有 selected / hover 特效（含 sidebar tabs、`Language`、`Effects`、`Theme`、`Palette`）都應跟著目前 `Palette` 走
  - `Theme` / `Palette` 本身的 preview 色只作為 preview dot 或身份提示，不應反過來接管 selected 外框/背景
  - `pages/settings.html` 若保留，必須與 modal 共用同一套 data attrs / JS API / i18n labels，不可各自長出平行邏輯
- 小螢幕 Additional 入口若啟用，必須維持「單一角落、單一主入口」心智模型：
  - 首頁 / section landing 的 misc/FAB，與 note / writing 單篇頁的 metadata 入口，優先收斂到同一個右下角主入口
  - note / writing 的 page-level action（例如 `Outline` / `Metadata`）若不走右下角主入口，則應優先收斂到內容頁頂部 navbar 的左右兩側；不得另外再長成互搶角落的 mobile FAB
  - 不應把它們拆成多顆各自漂浮、只靠位置微調硬避開的入口
- 手機導覽若啟用獨立 IA，必須維持：
  - 僅作用在真正手機螢幕；desktop 與一般 laptop / tablet 不應被連帶改成 mobile 導覽
  - 手機上不應同時保留 desktop-style navbar dropdown、底部 tab bar、以及多顆漂浮入口三套平行系統
  - note / writing / canvas 單篇頁可在頂部 navbar 保留品牌 `Ludwig`，並以左右兩側按鈕承接 page-level sidebar action；這些按鈕屬於單篇頁閱讀控制，不取代 bottom nav 的 site-level 導覽
  - 所有依賴 hover 的 sidebar / reveal interaction，在手機上都必須有明確的 tap-first 入口
- tag 的基本語意必須維持：
  - `garden:tags` 以逗號分隔
  - 若 tag 已收斂到 ontology concept，對外顯示文案應優先依目前語系選對應 label；不強制統一英文
  - `garden:tag_concepts`（若存在）需與 `garden:tags` 保持相同順序，作為 tag concept 的穩定對齊欄位
  - tag 比對應優先走 ontology concept id；未命中 ontology 的 tag 才退回 trim + case-insensitive 的字串精準比對
  - tag 內允許空白（例如 `system design`），URL 端以 encode 後的值為準
  - 可點擊的 tag detail 入口預設收斂到 `tag/index.html`；可帶 `?concept=...&tag=...`，且需向後相容既有 `?tag=...`
  - Search / section landing 的 tag filter UI 若仍保留 local filter 行為，應另外提供明確的 tag detail 入口，而不是讓規則分裂
- `status` 的基本語意若啟用，必須維持：
  - source metadata 欄位名為 `Status`
  - 允許值先收斂為 `published` / `drafting`
  - 預設值為 `published`（保持既有內容向後相容）
  - `drafting` 不得被公開 index / listing 視為已發布內容
- 日期 metadata 的基本語意若啟用，必須維持：
  - source metadata 欄位名優先為 `Published` / `LastModified`
  - 支援 `YYYY-MM-DD`（或 ISO8601 但需正規化成 `YYYY-MM-DD`）
  - `Published` 缺席時不強制顯示
  - `LastModified` 可允許退回 source 檔案的 last modified date，但不得依賴不穩定的 created/birthtime 當成唯一真相來源

## Garden 入口

- Garden 必須維持以下入口頁面可用（僅依賴 `window.SITE_SEARCH_INDEX`）：
  - `pages/search.html`：搜尋 + multi-tag filter
  - `garden/index.html`：Garden landing + Patch view（同頁）
- `tag/index.html` 必須維持為 tag detail 的穩定入口；`garden/` 保留給探索視角，不要求再承擔 tag detail page
- 若 search / section landing 支援 pinned writing，語意必須維持：只有符合 query/tag filter 的 writing 才能被置頂；pinned 只是排序 boost，不是繞過 filter 的白名單

## 最小工具鏈

- 核心工作流（新增/修改 note、更新索引）必須可用 Python（stdlib）完成，不引入後端/資料庫作為必要依賴
- `search/search-index.js` 必須能在 `file://` 受限場景用 `<script>` 載入（或至少在本機簡易靜態伺服器下可工作）
- Asset 分層：可跨頁共用的 CSS/JS/圖片放在 `assets/`；Garden 等子系統可保留自己的 build 產物與專用資源（例如 `garden/floral-assets/`），避免為了集中而引入路徑/建置耦合
- 若引入 `core/` 作為共用區，`core/` 不得存放生成物（例如 search index）或任何子系統 build output（避免把 core 變成大雜燴）
- 生成物策略：少數生成物屬於部署必需品，必須進版控；其餘一律視為本機/CI 生成物，必須進 `.gitignore`
  - `search/search-index.{json,js}` 必須進版控：它是全站搜尋/瀏覽的資料來源，靜態站必須能直接讀到
  - `garden/floral-assets/` 必須進版控：`garden/index.html` 直接引用其 build 產物，不提交會導致 Garden 入口不可用（除非自己 build）
  - 目前白名單（必須 commit）：`search/search-index.json`、`search/search-index.js`、`garden/floral-assets/`
  - 其它生成物（必須 ignore）例：`garden/_floral_dist/`

## 文件一致性

- 若新增/調整「作者寫作語法」（例如 `<callout>` / `<qquiz>` / `<block>`）或任何會影響日常工作流/不可退化約束的改動，必須同步更新 `AGENTS.md`、`README.md`、`docs/specs/system-spec.md`、`docs/design/design.md`、`docs/author/dev-notes.md`、`docs/rules/checklist.md`、`docs/rules/guardrails.md` 中對應章節，避免規格漂移
- 若使用者說「請幫我更新文檔 / 文件」（或語意等同的請求），一律視為「維護所有 `.md` 文件的一致性」：需要更新哪些文件以本節下方的「文檔索引」為準（不要求通讀全部 `.md`，但必須把受影響的文件同步更新，並維持索引本身為最新）
- Mindset：除非必要，不要先「通讀整個 repo」。先判斷任務會動到的環節，優先查 `README.md` / `docs/specs/system-spec.md` / `docs/design/design.md` / `docs/author/dev-notes.md`；若資訊不足再探索實作，探索後要回補文件
- 技術債提醒：如果我發現架構開始過度耦合（big ball of mud / god object），我會主動提醒並提出是否需要重構/切分子系統的討論

## 指令處理：更新項目文檔

當使用者提出「請協助更新項目的相關文檔」（或語意等同）時，採以下流程處理：

- 先盤點：掃描本文件的 Doc Map 區塊內所有 `.md` 文件（優先關注 `README.md` / `AGENTS.md` / `TODO.md` / `docs/`）
- 再篩選：比對本次改動影響範圍，列出「必須同步更新」的文檔清單
- 優先級：先查 `docs/README.md` 的文檔屬性與關係，優先更新高優先級與強約束文件（例如契約/工作流/系統規格）
- 逐步完成：不要求一次性完成所有文檔調整；先完成高優先級文件的同步，再逐步補齊其餘文檔
- 維持索引最新：任何新增/搬移/更名文檔，都必須同步更新 `docs/README.md` 與本文件的 Doc Map 區塊

## 文檔索引（Doc Map）

- 完整文檔索引與路徑，以 `docs/README.md` 為單一真相來源
- `docs/README.md`：文檔角色總覽，以及目前 `rules/` / `guide/` / `tech/` / `author/` 的資料夾分工
- `AGENTS.md`：不可退化契約（non-negotiables）；新增/重構時的第一優先校驗點
- `README.md`：日常使用入口（跑站、build、內容工作流）
- `TODO.md`：任務追蹤與待 review queue
- `docs/specs/system-spec.md`：系統 contract、data flow、schema、生成物策略
- `docs/specs/companion-spec.md`：`Companion` 的位置、尺寸、placeholder 與 fallback contract
- `docs/specs/parser-spec.md`：source `.md` parser contract、extended markdown 與 extras downgrade 規則
- `docs/specs/inline-enhancement-spec.md`：`information` / `content-link` 的 shared inline 視覺、互動與 downgrade contract
- `docs/specs/content-metadata-spec.md`：`<meta>` 欄位、head metadata、visibility/date/language/ranking contract
- `docs/specs/translation-spec.md`：source-driven translation workflow contract
- `docs/specs/skills-credentials-spec.md`：`Skills` 與 `Credentials & Honors` 資料結構、雙維度篩選與展示視窗 spec
- `docs/design/design.md`：設計理由、UI/UX 取捨與重大決策脈絡
- `docs/rules/checklist.md` / `docs/rules/guardrails.md`：交付收尾與守門清單
- `docs/guide/data-authoring-guide.md` / `docs/guide/language-guide.md` / `docs/guide/theme-palette-guide.md` / `docs/guide/ontology-guide.md` / `docs/guide/companion-guide.md`：共享維護 guide
- `docs/tech/README.md`：技術文件入口；實作細節再往下分到 `docs/tech/*.md`
- `docs/author/writing-notes.md` / `docs/author/testing-notes.md` / `docs/author/dev-notes.md`：作者自己的寫作、測試與演進筆記
- `notes/**/<slug>.md`、`writing/**/<slug>.md`、`canvas/**/<slug>.md`：內容來源；若調整語法/解析器，需同步檢查相容性
- `skills/**/skill.md`、`future/**/README.md`：分別是 skill 規格與實驗性原型記錄

為避免索引漂移，這裡只保留短版路由；若新增、搬移、刪除或重命名文檔，必須先更新 `docs/README.md`，再回頭同步本檔與 `README.md` 的短版說明。

## 任務追蹤

- 討論確認的新任務必須記到 `TODO.md`（用 checkbox），並定期更新狀態；避免未落地的 brainstorming 被遺忘
- workflow 更新：若一批 task 是由 Agent 代做、且已完成但尚待作者驗收，先移到 `TODO.md` 的 `Constellation Queue（待 Review）`
  - 先勾選 `[x]`
  - 保留精簡的「已完成什麼 / review 重點」
  - 等作者確認後，再決定移除或拆回新的 follow-up task
- `TODO.md` 的 task 盡量寫成可驗收的描述（包含影響範圍/入口頁、預期行為、驗收方式），避免留下「做了但不確定有沒有完成」的模糊項

## 安全與授權

- 不在 repo 內提交任何 token、API key、憑證、或包含敏感參數的連結
- 不提交授權不清或無法長期維護的第三方整頁 dump / embed（特別是帶大量外部依賴的匯出 HTML/iframe）
