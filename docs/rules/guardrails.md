# Guardrails

這份文件把 Ludwigia 的「不可退化精神」整理成更容易勾選的守門清單（偏設計/系統層 reassurance）。

- 硬契約（必須永遠成立）以 `AGENTS.md` 為準
- 這裡管的是長期守門原則、責任邊界與不可退化底線
- 本次改動要跑什麼命令、打開哪些頁面、觀察哪些可見結果，請看 `docs/rules/checklist.md`

## Data / Index（Single Source of Truth）

- [ ] 每篇內容頁的單一真相來源仍在 `<head>` metadata
  - [ ] `<title>`
  - [ ] `<meta name="garden:tags" ...>`（逗號分隔）
  - [ ] 若 tag 命中 ontology，`<meta name="garden:tag_concepts" ...>` 與 `garden:tags` 逐項對齊
  - [ ] `<meta name="garden:summary" ...>`
  - [ ] 若啟用 status，`<meta name="garden:status" ...>` 的語意固定為內容可見性，而不是其它用途

- [ ] 搜尋/瀏覽入口只讀索引資料（`window.SITE_SEARCH_INDEX`），不要求維護第二份 tags/summary/related

- [ ] `search/indexer.py` 仍可從 `notes/` / `writing/` / `canvas/` 再現性生成：
  - [ ] `search/search-index.json`
  - [ ] `search/search-index.js`（必須定義 `window.SITE_SEARCH_INDEX`）

- [ ] 若改動會影響 index schema 或內容：
  - [ ] 生成物已更新並納入版本控制
  - [ ] 入口頁沒有隱性依賴舊 schema（至少跑一次基本搜尋/列表）

- [ ] 若支援內容 `status`
  - [ ] `drafting` 不會意外出現在公開搜尋/列表
  - [ ] `published` 仍維持既有公開入口可見性

- [ ] 若支援 pinned writing
  - [ ] `garden:pinned` / `garden:priority` 由 source metadata 再現性生成，不靠手改 HTML 或另一份推薦清單
  - [ ] 若首頁 Skills 或 Credentials & Honors 採用獨立 data file（`data/Skills/skills.json` 或 `data/Credentials/credentials.json`）：
  - [ ] source JSON 維持為單一真相來源，不要求在 HTML 硬寫第二份靜態 DOM 資料
  - [ ] `Skills` 切換不引發全頁跳躍或垂直高度大幅膨脹
  - [ ] `Credentials` 的 `Type` 與 `Domain` 雙維度篩選、縮圖 Option Bar 與全螢幕 Modal 燈箱運作正常，且完全符合全站 Palette/Theme token 規範

## UI / UX（可讀性優先）

- [ ] Core vs Additional 的入口分層不退化（navbar 不因實驗功能膨脹；實驗入口優先放到 Additional surface）
  - [ ] `Labs` 維持為 concept page / prototype 的 landing，而不是把實驗入口回塞到主導航

- [ ] Theme vs Palette 分工不退化（Theme 管氛圍、Palette 管 accent；偏好狀態仍以 localStorage 保存）
  - [ ] Theme 清單可擴充（含 Sky/Garden）時仍維持同一套設定入口與相容鍵值，不長出平行設定系統
  - [ ] Theme 動效仍收斂到單一可關閉控制（`site_theme_motion_v1`），不以效果壓過正文可讀性
  - [ ] Reading Mode 對主站共用 theme effect 擁有更高優先級；一旦進入 Reading Mode，ambience / motion layer 必須 hard-off，不受 `Effects` 開關影響
  - [ ] note 頁的 `callout / block / takeaways` 各自擁有明確的 theme surface variables；即使目前先填同值，也不靠隱性 override 耦合
  - [ ] note 的 Reading Mode navbar / 背景優先走 token（例如 navbar reading tokens、`--note-reading-page-bg`），不要靠單頁或單 theme 的 scattered exception
  - [ ] 若 theme 修正開始連續疊 override，優先回頭整理底層 token / selector / variable pipeline，而不是放任例外規則累積

- [ ] Settings 入口不退化
  - [ ] 共用 gear icon 預設開啟 settings modal，而不是強制切頁
  - [ ] `pages/settings.html` 若保留，定位清楚為 fallback / direct-link，而不是和 modal 各自長出不同設定邏輯
  - [ ] settings active state 的顏色責任清楚：所有 selected / hover 特效跟著目前 accent；theme / palette 的 preview 色只存在於 preview dot，不反過來接管 selected 樣式
  - [ ] settings pills 的 selected style 優先透過共用 variables（如 `--ui-control-active-*`）收斂；若發現需要反覆在 theme selector 下補 override，先回頭檢查 variable 分層是否失真
  - [ ] modal settings 與 `pages/settings.html` fallback 必須共用同一套 data attrs / JS API；若調整 `Theme` / `Palette` / `Effects` / `Language` 的 selector，不可只改其中一邊
  - [ ] `Sky` 背景雲層（`sky-clouds`）與 settings pills / active state 解耦；修其中一邊時不會意外把另一邊的視覺改壞

- [ ] 小螢幕 Additional 入口不退化
  - [ ] 首頁 / section landing 的 misc 入口，與 note / writing 單篇頁的 metadata 入口，優先收斂成同一個右下角主入口
  - [ ] 不會再長成兩顆互相遮擋、只靠微調位置硬避開的漂浮按鈕
  - [ ] note / writing 的 `Outline` / `Metadata` 若不走右下角主入口，應優先收斂到頂部 navbar 左右兩側，而不是額外再長一顆 mobile FAB

- [ ] 手機導覽與互動不退化
  - [ ] 真正手機螢幕才啟用 mobile IA；desktop 與一般 tablet / laptop 不會被強制改成 bottom nav
  - [ ] 手機上不再依賴 desktop-style navbar dropdown 當主要導航
  - [ ] 所有依賴 hover 的 sidebar / reveal interaction，在手機上都有明確 tap-first 入口
  - [ ] 手機上不會同時保留多套平行導航系統（例如頂部 dropdown navbar + 底部 tab bar + 多顆浮動入口）
  - [ ] 若是內容單篇頁：頂部 navbar 的左右按鈕只承接 page-level action，不取代 bottom nav 的 site-level IA

- [ ] Tag detail 入口不退化
  - [ ] 可點擊的 tag detail 預設收斂到 `tag/index.html`，並向後相容既有 `?tag=...`
  - [ ] 若 Search / section landing 保留 tag filter 互動，仍有明確的 detail entry，不靠隱性 route 規則猜測
  - [ ] 同一個 tag concept 在不同語言下仍被視為同一概念；未命中 ontology 的 tag 才退回字串比對

- [ ] Runtime i18n 的首屏體驗不退化
  - [ ] 語言偏好可在 `<head>` 儘早恢復
  - [ ] 非預設語言不會明顯先閃英文再切回偏好語言

- [ ] 內容 metadata 的日期語意不退化
  - [ ] `Published` / `LastModified` 若啟用，輸出格式維持 `YYYY-MM-DD`
  - [ ] `LastModified` 的 fallback 只依賴相對穩定的 source last modified date，不把 created/birthtime 當成唯一真相

## Content / Authoring Semantics

- [ ] 頁內標題語意不退化
  - [ ] 頁內大標題優先取自正文最前面的第一個 `# Title`
  - [ ] 若正文最前面沒有 H1，才 fallback 到 source metadata 的 `Title`
  - [ ] 這條規則只影響頁內大標題，不強制改動 `<head><title>` 與 search index title 來源

- [ ] 內容可見性語意不退化
  - [ ] `Status` 仍只承擔內容可見性（`published` / `drafting`）
  - [ ] `drafting` 不出現在公開入口，但保留作者本機預覽 / 直連工作流

- [ ] pinned writing 語意不退化
  - [ ] `Pinned` / `Priority` 仍由 source metadata 再現性生成
  - [ ] pinned 只影響已符合 query / tag filter 的 writing 排序，不繞過 filter

- [ ] 作者規劃欄位不退化
  - [ ] author-only planning metadata 仍放在 `<draft>`，不是 `<meta>`
  - [ ] generator / metadata parser / indexer 預設忽略 `TLDR` / `MainFlow` / `Scope` / `OutOfScope` / `FollowUps`
  - [ ] 這些欄位不會變成第二份公開摘要或 search schema

- [ ] 前段導讀 block 的語意不退化
  - [ ] 若作者在前段放可見 block，預設偏 `TL;DR / Focus / Article Compass`
  - [ ] 它負責固定 main flow / scope，不負責重複列出各段 guiding questions

- [ ] block / callout / takeaways 的責任不混掉
  - [ ] `<block>` 仍偏「接著 main flow 的濃縮重點」
  - [ ] `<callout>` 仍偏「在 main flow 之外補一個重要理解方式」
  - [ ] `<takeaways>` 仍屬 extras layer，用來回收重點，不承擔主線推理
  - [ ] 真正需要在不同 view 穩定存活的內容，仍寫在 core markdown 正文

- [ ] markdown list authoring 規則不退化
  - [ ] continuation paragraph 必須相對 item 縮排 `4 spaces`
  - [ ] nested list 必須相對 parent item 縮排 `4 spaces`
  - [ ] 不依賴「下一行沒縮排也算同一個 item」的寬鬆猜測

- [ ] notes extras 的基本語意不退化
  - [ ] `Copy Markdown` / `Download Markdown` 仍跳過 quiz / prompt 等互動區塊
  - [ ] `reviewkit` 仍是 semantic container，不硬編碼等於 quiz+prompt tabs
  - [ ] `qquiz` / `qprompt` 可獨立存在；只有同時出現在同一個 `reviewkit` 內時才組成 tabs UI

## Runtime / Entry Behavior

- [ ] 語言偏好與頁內切換的分工不退化
  - [ ] settings 控制的是全站偏好，主要影響基礎 page
  - [ ] 頁內語言切換只在該篇真的有對應翻譯版本時出現
  - [ ] settings 不會把使用者導向不存在的翻譯頁

- [ ] 小螢幕 Additional surface 心智模型不退化
  - [ ] 右下角主入口仍優先維持單一主入口
  - [ ] note / writing 的 page-level action 若不走右下角主入口，優先收斂到頂部 navbar 左右兩側

- [ ] 手機導覽 contract 不退化
  - [ ] 底部一級入口仍收斂為 `Portfolio / Search / More`
  - [ ] `Portfolio` / `More` 各自承接次級入口，不把實驗入口回塞主導航
  - [ ] 這套 IA 只作用在真正手機 breakpoint

- [ ] Runtime i18n 載入時機不退化
  - [ ] `<head>` preload 仍負責優先恢復語言偏好
  - [ ] 非預設語言不會明顯先閃英文再切回偏好語言
  - [ ] 單篇頁 sidebar 預設只顯示 `Updated`；若有額外日期細節，也應由 `Updated` 展開，而不是首屏直接堆多個同層級日期

- [ ] 語言 suffix migration 不退化
  - [ ] 檔名 suffix 只是可讀性與維護慣例，真相來源仍是 `Lang` + `CanonicalId`
  - [ ] 若採完整 refactor，不保留舊無 suffix URL；需同步更新站內引用與索引，避免隱性壞鏈
- [ ] Source-driven markdown actions 不退化
  - [ ] 只要頁面由 source `.md` 再現性生成，Meta sidebar 就提供 `Copy Markdown` / `Download Markdown`
  - [ ] 不再依賴單篇 metadata 開關決定要不要顯示

- [ ] Page-scoped source data 不退化
  - [ ] 若某個 page surface（例如首頁上的獨立 `Timeline` section）採 source-driven data file，作者只維護資料，不需要同步手改前端 JS event 陣列
  - [ ] source of truth 應維持在獨立 data file（例如 `data/Timeline/timeline.json`）；runtime 只負責 load / validate / normalize / projection / render
  - [ ] 若 timeline 啟用 scale facet，`macro -> Macro + Meso + Micro`、`meso -> Meso + Micro`、`micro -> Micro only` 的 visibility contract 不應漂移
  - [ ] 若 timeline 的 `period` 支援 `start_*` / `end_*` 欄位，缺席時應 fallback 到共用 `title / summary / detail`，而不是要求作者維護兩份必填敘述
  - [ ] 若 timeline 的 `period` 支援 ongoing phase，`end: "present"` 必須是穩定 authoring contract；runtime 要能顯示 `Present / 至今` 並維持正確排序
  - [ ] 若同時有多個 ongoing phase，timeline UI 可把多個 `period-end` 收斂成尾端單一 `Present / 至今` cluster；但 cluster 只屬於 render 層，不應反過來變成新的資料真相來源
  - [ ] 若 timeline 支援 `category` facet，應把它收斂成 badge / filter 等輕量訊號，不應疊出第二套固定 category 配色破壞既有 palette runtime
  - [ ] 若全站 navbar / page shell shared source 需要收斂，`pages/_shared/` 應作為 site-level chrome 的 SSOT；`tools/content_styles/_shared/` 只保留內容生成流程自己的 partial，不應平行維護另一份 navbar 真相來源
  - [ ] 若 Copilot 可見性支援 settings 偏好，應與 modal / `pages/settings.html` 共用同一套 localStorage + runtime 狀態，不應各自長出平行設定
  - [ ] 內容頁若要共用 navbar，優先在生成階段讀 `pages/_shared/navbar.html`；不要改成 runtime fetch 導致 `file://` 與靜態站情境退化

- [ ] ReviewKit / Quiz / Prompt 的關係與標配契約不退化
  - [ ] `reviewkit` 是 container，不是硬綁的固定 tabs 組合
  - [ ] `qquiz` / `qprompt` 可獨立存在；若同時在同一個 `reviewkit` 內，才組成 tabs
  - [ ] 所有 `notes/` 筆記頁面底端均標配 `<reviewkit>` 容器，至少包裹 `<qprompt/>`；若存在 `<takeaways>` 或 `<qquiz>`，一律包在同一個 `<reviewkit>` 內，不讓 `<takeaways>` 散落在 `reviewkit` 外
  - [ ] 不再依賴全域固定 id 讓 prompt copy 或 summary tabs 勉強工作

- [ ] Agent-assisted 寫作 workflow 不退化
  - [ ] 前面可簡化或委派，但最後的人類 full proofread 不得省略
  - [ ] 若 source `<draft>` 使用 `TLDR / MainFlow / Scope / OutOfScope / FollowUps` 或「`重點：內容`」/層級化大綱骨架，它們仍只屬於 author-only scaffolding，不外洩到公開 `<head>` metadata 或 search index，也不進入 core markdown
  - [ ] 長文仍維持單一主問題；若文章同時在講主題家族 overview 與單一方法 deep dive，優先拆篇而不是硬塞成一篇
  - [ ] 若本篇定位是方法家族 overview，不會把單一子方法的直覺或細部流程寫成主要篇幅，避免主 flow 被代表方法綁走
  - [ ] 若文章前段有可見導讀 block，預設語意是 `TL;DR / Focus`；不要求另開 `Guiding Questions` 特殊區塊

  - [ ] 效果可關閉/可限制（尊重使用者偏好）
  - [ ] 必要時有遮罩/底色避免動畫干擾內容

- [ ] Notes Extras 仍是 optional enhancement
  - [ ] 缺席時 UI 不留空洞、不讓人覺得「少了什麼才算完整」
  - [ ] Reading Mode 仍以正文為主（extras 不應變成主要干擾）
  - [ ] Copy/Download Markdown 匯出仍乾淨（不包含互動 UI）
  - [ ] 若 Reading Mode / Garden 直接讀 `.md` source，仍只依賴 `<meta>` + core markdown；extras 不成為必要輸入
  - [ ] 若使用 external question bank：`question_focus` 仍是每題 source-driven metadata；同一 bank 可混放不同方向題目，不靠另一份 UI config 分類
  - [ ] 若使用 ontology-backed `<information concept="...">`：tooltip definition 仍由 `data/Ontology/information-ontology.json` 單一來源提供，HTML 可只留 concept placeholder

- [ ] Image Viewer 互動不分裂
  - [ ] `canvas / notes / writing` 走同一套圖片放大互動
  - [ ] link 包圖時有一致優先規則（預設放大；modifier key 或 `link-only` 才跳轉）

## Generators / Parser（邊界不膨脹）

- [ ] `tools/create_content.py` 仍定位為標準內容頁生成器
- [ ] `tools/translate_content.py` 維持 source-driven 翻譯邊界（翻自然語言，不重寫 tags/meta key/slug/path/骨架）

- [ ] style 差異仍主要由 style layer 解決，不把 presentation 差異塞回 parser

- [ ] 新增 parser component 時，能回答它的語意價值是什麼，而不只是為了手刻某種外觀

- [ ] 插圖等常見需求優先走語意化 block（例如 `<image>`），不鼓勵以 raw HTML 當主路徑

- [ ] 作者可用的 source 語法仍乾淨且可被說清楚
  - [ ] 舊殘留語法（例如已廢止的 `<section>...</section>` source block）不再被默默保留
  - [ ] list authoring 規則固定：continuation paragraph 與 nested list 一律採 `4 spaces` 縮排
  - [ ] 若新增 `<information>` 這類 inline explanation 語法，其責任範圍仍清楚：只用來補詞彙/片語說明，不膨脹成萬用 tooltip 系統
  - [ ] `cli.py scan-information <source.md>` 若存在，定位仍是作者盤點候選詞的 helper；不把它當成自動插入 `<information>` 的依據
  - [ ] `<information>` tooltip 若允許 pointer 移入，也仍只承擔短說明，不長成可塞互動內容的浮動面板
  - [ ] 若新增 `<content-link>` 這類跨內容 reference 語法，target resolution 應優先依 `CanonicalId`，不要求作者手寫 HTML path，也不把 parser 擴成 wiki-link 猜測系統
  - [ ] `<content-link>` 在正文視圖可 resolve 成站內連結，但在 core markdown / Reading Mode / Garden 應仍可穩定退化成純文字 label
  - [ ] 若 `information` / `content-link` 同屬 inline enhancement，應優先共用同一組 token / interaction pipeline；若要新增 default cover fallback，也應先收斂成 shared contract，而不是在 search / landing / content page 各自長平行邏輯
  - [ ] 若新增 markdown table 支援，仍以標準 pipe table 為主，不為了個別 presentation 需求把 parser 變成表格 DSL
  - [ ] 若新增 `<takeaways>`，其責任範圍仍清楚：只用來承載條列式重點，不拿來取代正文段落總結

- [ ] Garden 全文 renderer 優先走標準 markdown 語意
  - [ ] list / table / LaTeX 不依賴脆弱的手寫 UI parser
  - [ ] 若 preview renderer 與全文 renderer 不同，必須能清楚說明邊界與取捨

## Compatibility（路徑 / `file://`）

- [ ] nested paths 仍可用（`notes/**/<slug>.html` 等）

- [ ] `file://` 受限場景仍有可行載入策略（至少 `search/search-index.js` 可用 `<script>` 載入）

- [ ] Asset 分層不退化：共用資產在 `assets/`；子系統（Garden）可自帶 build 產物但不反向耦合 core

## Security（靜態站的防線）

- [ ] 不把秘密放進 repo（token、API key、憑證、帶敏感參數的連結都不得提交）

- [ ] 外部連結策略一致
  - [ ] 對外開新頁的連結帶上 `rel="noopener noreferrer"`（至少不讓 opener 洩漏）
  - [ ] 若有 referrer 顧慮，優先採最小揭露策略

- [ ] Raw HTML 仍是明確 opt-in
  - [ ] `<rawhtml>` 預設禁用
  - [ ] 只有在真的需要時才開 `AllowRawHtml: true`

- [ ] 外部資源策略可被說清楚
  - [ ] 能優先用本地資產就不要依賴第三方
  - [ ] 若必須使用外部腳本 / 圖片 / 字體 / CDN，需確認失效 fallback 與可讀性不退化

- [ ] 至少知道目前的 XSS 面在哪
  - [ ] 內容主體預設仍走受限 parser，不以 raw HTML 當主路徑
  - [ ] 新增 parser component 時，需檢查 href/src 白名單與字串 escaping 是否仍成立
  - [ ] `<information context="...">...</information>` 的 `context`、`<information concept="...">...</information>` 的 inner text 與 ontology context 仍經過 escaping，不接受作者直接注入 HTML

## Build / Deploy Artifacts（白名單策略）

- [ ] 只提交「部署必需品」生成物（白名單），其餘生成物一律進 `.gitignore`

- [ ] 白名單（必須 commit）
  - [ ] `search/search-index.json`
  - [ ] `search/search-index.js`
  - [ ] `garden/floral-assets/`

- [ ] 改動內容或 indexer 後
  - [ ] 已重新生成 `search/search-index.{json,js}` 並納入版本控制
  - [ ] 入口頁（`pages/search.html` / `garden/index.html`）至少做一次基本 smoke check

- [ ] 改動 Garden（React）後
  - [ ] 已完成 build 並同步更新 `garden/floral-assets/`（避免別人的機器無法直接打開）
  - [ ] 不把 `garden/_floral_dist/` 等 build output 納入版本控制

- [ ] git 乾淨檢查
  - [ ] `git status --porcelain` 不包含大型生成物資料夾（避免誤加）

## Docs（規格不漂移）

- [ ] 若改到作者寫作語法 / 系統工作流 / guardrails，相關文件已同步更新：
  - [ ] `AGENTS.md`
  - [ ] `docs/specs/system-spec.md`
  - [ ] `docs/specs/timeline-design-spec.md`（若本次改動涉及 timeline data / projection / scale contract）
  - [ ] `docs/design/design.md`
  - [ ] `docs/author/dev-notes.md`
  - [ ] `docs/rules/checklist.md`
  - [ ] `README.md`
