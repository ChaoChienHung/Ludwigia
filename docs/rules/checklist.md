# Checklist

這份 checklist 用來在完成一個 feature / refactor 後做 reassurance：有些項目可以自動化成測試，有些不適合（UI/互動/可讀性/`file://` 行為）。能寫進 test 的，優先寫進 test；寫不進 test 的，留在這裡。

- `docs/rules/guardrails.md` 管的是長期守門原則與底線
- 這裡管的是本次改動要跑什麼、看哪裡、怎麼驗
- 若某條 checklist 涉及 parser / theme / source contract / agent-assisted workflow 等原則，預設先對照 `docs/rules/guardrails.md` 的對應段落

## Feature 完成後（每次都過）

- [ ] 功能行為符合需求（包含：入口頁、互動流程、空狀態/缺席欄位的 fallback）

- [ ] 不破壞不可退化契約（對照 `AGENTS.md` 與 `docs/rules/guardrails.md` 的對應段落）
  - [ ] 沒有引入第二份手動維護資料（例如 tags / summary / related 仍維持衍生）
  - [ ] 若本次改動涉及 parser / generator / source contract：`tools/create_content.py` 的標準生成器邊界仍成立
  - [ ] 若本次改動涉及語法擴充（例如 `<information>`、markdown table、`<takeaways>`）：已對照 `docs/rules/guardrails.md` 的 `Generators / Parser` 與相關條目，並在下方內容頁檢查做對應 smoke check

- [ ] 變更影響到索引內容或 schema 時：
  - [ ] `search/search-index.json` / `search/search-index.js` 已重新生成
  - [ ] 生成物已納入版本控制

- [ ] 變更影響到 Garden build 產物時：
  - [ ] `garden/floral-assets/` 已同步更新並納入版本控制（Garden 入口可直接使用）
  - [ ] `garden/_floral_dist/` 等 build output 已被忽略且不納入版本控制

- [ ] 若本次改動涉及 page-scoped source data（例如首頁上的獨立 `Timeline`、`Skills` 或 `Credentials` section）：
  - [ ] source of truth 仍維持在獨立 data file（`data/Timeline/timeline.json`、`data/Skills/skills.json`、`data/Credentials/credentials.json`），而不是把資料重新寫回前端 JS 常數
  - [ ] `Skills` 類別切換、左右按鈕與動態進度條在桌機與手機上表現正常
  - [ ] `Credentials` 的 `Type` / `Domain` 雙維度篩選、縮圖 Option Bar 切換與全螢幕放大燈箱 Modal 正常運作
  - [ ] 視覺元件完整繼承全站 Theme & Palette CSS Design Tokens
  - [ ] `python3 cli.py test` 中的 `test_skills_credentials_data.py` 測試通過
  - [ ] 若同時存在多個 ongoing `period`，尾端的 `Present / 至今` 會被收斂成單一 cluster，點進 detail 後仍能看到各個 ongoing phase
  - [ ] 若 timeline 使用 `category`，event card / detail card 的 badge 正常顯示，且沒有另外長出與 palette 打架的固定 category 配色
- [ ] 若本次改動涉及全站 navbar / page shell shared source：
  - [ ] `pages/_shared/navbar.html` 仍是 navbar SSOT；沒有在 `tools/content_styles/_shared/` 或單頁 HTML 平行長出第二份真相來源
  - [ ] 內容頁若需要 navbar，生成流程會讀 `pages/_shared/navbar.html`，而不是改成 runtime fetch 導致 `file://` 壞掉
  - [ ] nested paths、首頁 deep links（`#about` / `#timeline` / `#contact`）與 mobile note navbar 按鈕沒有被這次收斂破壞
- [ ] 若本次改動涉及 settings / Copilot：
  - [ ] `pages/settings.html` 與 modal 共用同一套 data attrs / JS runtime，不是各自維護平行偏好狀態
  - [ ] Copilot 可見性只由單一偏好值控制（`off / home / all`），而不是頁面內散落 hardcode 判斷

- [ ] nested paths 仍可工作（`notes/**/<slug>.html`、`writing/**/<slug>.html`、`canvas/**/<slug>.html`）

- [ ] `file://` 與本機靜態伺服器（`python3 -m http.server`）至少一種情境可用（依該變更影響範圍挑一種確認）

- [ ] 若本次改動涉及 Theme / Palette / Settings / note surface：已對照 `docs/rules/guardrails.md` 的 `UI / UX` 段落，且下方相關人工檢查已覆蓋本次影響範圍
  - [ ] Theme / Palette 偏好狀態相容（舊 localStorage 值不會讓 UI 壞掉）
  - [ ] 若本次改動涉及 theme surface：`callout / block / takeaways` 的 theme variables 仍完整且可分別調整，不靠 scattered overrides 撐畫面

- [ ] 文件同步（只更新有被這次變更影響到的部分，避免規格漂移）：
  - [ ] `README.md`
  - [ ] `docs/specs/system-spec.md`
  - [ ] `docs/specs/timeline-design-spec.md`（若本次改動涉及 timeline data / projection / scale contract）
  - [ ] `docs/design/design.md`
  - [ ] `docs/author/dev-notes.md`
  - [ ] `AGENTS.md`
  - [ ] `docs/rules/guardrails.md`（若影響到守門項目）
  - [ ] `docs/guide/language-guide.md`（若本次改動涉及多語 / locale expansion）
  - [ ] `docs/guide/ontology-guide.md`（若本次改動涉及 tag ontology 維護流程）

- [ ] 若本次是一批已完成但尚待作者確認的 agent batch task：
  - [ ] `TODO.md` 已把它們移到 `Constellation Queue（待 Review）`
  - [ ] 每個 review item 都保留「已完成什麼 / review 重點」

## 建議跑的自動化（能跑就跑）

- [ ] In-file self test（parser contract）
  - [ ] `python3 tools/create_content.py --self-test`

- [ ] Unittest
  - [ ] `python3 -m unittest`
  - [ ] 若本次改動新增功能、擴充 contract 或修正回歸 bug：優先補相鄰單測，而不是只做手動驗證

- [ ] 常用工作流 smoke test
  - [ ] `python3 cli.py test`
  - [ ] 若本次改動涉及 tags / ontology / 多語 label：`python3 cli.py check-tags`

## 需要人工確認（挑與本次變更相關者）

- [ ] `pages/search.html`
  - [ ] 搜尋結果排序合理（基本 query）
  - [ ] 若本次改動涉及 pinned writing：符合 query/tag filter 的 pinned writing 會排在結果前面，且不會把未命中的內容塞進結果
  - [ ] multi-tag filter 行為正確（新增/移除 tag、清空、結果集更新）
  - [ ] 結果列表視覺仍與 Notes/Writing 的 medium-style 節奏一致（不是意外退化成膠囊 chip 清單）

- [ ] `index.html` / Timeline（若本次改動涉及 timeline）
  - [ ] timeline 作為首頁上的獨立 section 可被清楚辨識，且不會和 `About Me` 的責任混在一起
  - [ ] `Macro / Meso / Micro` 切換後，事件可見性符合 source data 的 scale contract
  - [ ] `period-start / period-end` 的 detail 顯示符合 source data；若 `start_*` / `end_*` 缺席，會正確 fallback 到共用 `title / summary / detail`

- [ ] 基礎 page / 共用入口（若本次改動涉及 runtime i18n 或 settings）
  - [ ] gear icon 會開 settings modal，且關閉後仍留在原頁
  - [ ] language / theme / palette 在 modal 內切換後即時生效
  - [ ] `light / sky / garden` 下，settings sidebar active、`Effects` active、theme chips、palette chips 的 selected/hover 特效都跟著目前 accent；theme/palette 本身色只透過 preview dot 呈現
  - [ ] `deep-sea / galaxy / galaxy-night` 下，`Effects` active 在深色底上仍有明確 selected 樣式，不會只剩下幾乎看不出的 generic 變化
  - [ ] `sky / garden` 下，Theme chips 的 active 款式與 Palette chips 屬同一套 selected 語法，不會同頁出現兩種不一致的 active 視覺
  - [ ] `pages/settings.html` fallback 與 modal 共用同一套 data attrs / JS API / i18n labels，不會一邊已修一邊仍留舊 selector
  - [ ] settings palette carousel 不會裁切 pills 上緣；active 陰影 / 浮起效果完整可見
  - [ ] 偏好語言為中文時，刷新或站內跳頁不再先明顯閃英文再切回中文
  - [ ] 若本次改動涉及 Additional surface / FAB：手機或窄視窗下仍維持單一右下角主入口，不會多長一顆互搶角落的漂浮按鈕
  - [ ] 若本次改動涉及手機導覽：確認只在手機 breakpoint 啟用，且底部一級入口 / top brand / page-level navbar 按鈕與 desktop navbar 不會同時打架

- [ ] `garden/index.html`
  - [ ] landing + Patch view 基本可用（卡片、展開閱讀、關閉）
  - [ ] Garden 全文視圖的 list hierarchy / table / LaTeX 呈現正確

- [ ] `tag/index.html`
  - [ ] tag detail route 可用（可在 nested paths 下跳轉）
  - [ ] 若本次改動涉及 tag 導向：tag click destination 規則一致，且 nested path / `file://` 不會壞掉
  - [ ] 若本次改動涉及多語 tag：`?concept=...&tag=...` 與舊 `?tag=...` 都能打開同一個 tag detail
  - [ ] 若本次改動涉及 related tags：related tags 區塊可見、排序合理、點擊後會切到對應 tag detail

- [ ] `labs/index.html` / `labs/**`
  - [ ] Labs landing 至少能進入已上線的 concept page / prototype bridge，不再是空白 placeholder
  - [ ] 若本次改動涉及 concept page：`labs/shooting-mode/index.html` 與 `labs/index.html` 之間可雙向返回，且不依賴後端 routing
  - [ ] 若本次改動涉及 question bank：`question_focus` schema / ontology / loader / Labs filter 已同步；同一 bank 混放不同方向題目時仍可正確過濾與顯示

- [ ] 內容頁（任選 1 篇 notes + 1 篇 writing）
  - [ ] `<head>` metadata（title/tags/summary）正確
  - [ ] 若本次改動涉及 tag ontology：`garden:tags` 與 `garden:tag_concepts` 順序對齊，且 locale label / concept filter / tag detail 都可用
  - [ ] 若本次改動涉及 `Status`：`drafting` 內容不會出現在公開入口，`published` 內容仍可正常被收錄
  - [ ] 若本次改動涉及 `Pinned` / `Priority`：對應 writing 的 `<head>` metadata 與 search index 欄位一致
  - [ ] 若本次改動涉及日期 metadata：sidebar 的 `Updated` 顯示正確；展開後的 `Published` / `LastModified` 與 fallback 格式正確且一致
  - [ ] 若本次改動涉及小螢幕入口：手機或窄視窗下 `Metadata` / `Outline` 要嘛能從頂部 navbar 左右鍵打開，要嘛能從單一主入口找到，且不與其它 FAB 搶角落
  - [ ] 若本次改動涉及 hover sidebar / dropdown migration：確認手機上已改成明確 tap-first 控制，desktop hover 行為仍正常
  - [ ] 若本次改動涉及 `<information>`：正文中的詞彙仍維持 inline flow、帶虛線底線，hover / focus 時可看到 `context` 或 ontology context 說明，且滑鼠移到 tooltip 本體時不會立刻消失
- [ ] 若本次改動涉及 `cli.py scan-information`：至少用 1 篇 source `.md` 驗證它能列出命中 ontology 的詞、已標註 `<information>` 的項目，以及第一次出現但尚未標註的候選詞，且不會直接改寫 source
  - [ ] 若本次改動涉及 `<content-link>`：內容頁可正確 resolve 到 target `CanonicalId` 對應的 HTML，nested path / `file://` 不會壞掉，且正文中的樣式仍接近原本文字、hover / focus 會顯示 compact preview card（target 有 cover 用自己的，沒有則退回 shared default cover），游標移到 card 本體時不會立刻消失；Copy Markdown / Reading Mode / Garden 仍只保留純文字 label
  - [ ] 若本次改動涉及 markdown table：內容頁可正常顯示比較表，窄螢幕下仍可水平捲動閱讀
  - [ ] 若本次改動涉及 `<takeaways>`：內容頁可正常顯示條列重點，且 Reading Mode / Copy Markdown 仍不把它當成 core markdown 正文
  - [ ] 若本次改動涉及 theme / note surface：`callout / block / takeaways` 在同一 theme 下色系一致，且三者各自仍保留可獨立微調的 variables
  - [ ] 若本次改動涉及 Image Viewer：`canvas` + `notes/writing` 至少各 1 篇可點擊放大；`Esc` 可關閉；link 包圖時的放大/跳轉規則符合預期
  - [ ] 若本次改動涉及新 theme（Sky/Garden）：在桌機與手機都保持可讀性，且 `Effects` 開關能限制動效
  - [ ] 若本次改動涉及 Reading Mode 或 theme effect：進入 Reading Mode 後主站共用 ambience / motion layer 一律關閉，不受 `Effects` 開關影響
  - [ ] 若本次改動涉及 Reading Mode navbar / 背景：優先調整 token / variable pipeline（例如 navbar reading tokens、`--note-reading-page-bg`），不要只補單頁 exception
  - [ ] 若本次改動涉及 `Sky` 背景雲層：至少同時看到左→右與右→左兩種漂移方向，且雲團材質仍維持柔和、較寫實的輪廓
  - [ ] 若本次改動涉及 `Garden` ambient：至少在首頁與 1 篇 note / writing 都能看到低對比 ambient layer，且 bloom / pollen / stem silhouette 主要停留在邊緣，不影響正文閱讀
  - [ ] 若本次改動涉及翻譯 workflow：`cli.py translate` 可跑單篇/批次；輸出的 `.md` 保持 source contract（tags/slug/path/骨架不亂）
  - [ ] 若本次改動涉及檔名 suffix migration：新 suffix URL 可正常打開，且 repo 內不再殘留依賴舊無 suffix URL 的引用
  - [ ] 若本次改動涉及 `reviewkit / qprompt / qquiz`：確認 `reviewkit` 內同時有 quiz + prompt 時會組成 tabs；只有其中一個時不會產生空 tab；`qprompt` 獨立存在時也能正常顯示與 copy
  - [ ] Reading Mode / Copy Markdown 不包含互動附加區塊（若有）

- [ ] 若本次改動涉及 Agent-assisted 寫作 workflow：已對照 `docs/rules/guardrails.md` 的 `Agent-assisted 寫作 workflow 不退化` 與相關 source contract 條目
  - [ ] README / AGENTS / docs 已同步說明「架構先行 + Agent 補內容 + 最後全盤 proofread」
  - [ ] 發布前至少做過一次從頭到尾的人類 full proofread
  - [ ] 依本次改動範圍抽驗相關內容條目：
    - [ ] `<draft>` 仍是 author-only planning 區塊（採 `重點：內容` 或層級化清單大綱），不會污染公開 `<head>` metadata / search index / core markdown
    - [ ] 若本次重構的是知識型長文：文章仍專心回答單一主問題；overview 與單一方法 deep dive 沒有被硬塞回同一篇
    - [ ] 若本次重構的是方法家族 overview：單一子方法的直覺或詳細流程沒有吃掉主要篇幅，overview 仍以方法地圖與差異軸為主
    - [ ] 若文章前段有導讀 block：它在做 `TL;DR / Focus`，而不是把分散在各段裡的 guiding questions 再重複列一次
    - [ ] 若本次改動涉及 `.md` source：Reading Mode / Garden 的正文抽取仍只依賴 `<meta>` + core markdown，而不依賴 extras block
    - [ ] 若本次改動涉及 list source：ordered / unordered continuation paragraph 與 nested list 縮排仍符合 4-space 規則
