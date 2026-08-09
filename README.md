# Ludwigia

Ludwigia 是一個「個人網站 + 個人知識花園」的靜態專案：內容放在 `notes/`，探索入口放在 `garden/`。它刻意不引入後端與資料庫，用最小工具鏈換來長期可維護、可攜帶、可擴展的筆記體驗。

英文一句話版：A static personal site + digital garden. Notes live in `notes/`, discovery lives in `garden/`.

## TL;DR

如果你只想先快速知道這個 repo 在幹嘛、能做什麼、怎麼用，可以先看這裡：

- 這個 repo 是什麼：一個靜態的 personal site + digital garden，內容主要放在 `notes/`、`writing/`、`canvas/`
- 這個 repo 能做什麼：產生內容頁、建立 search index、提供 Garden / tag / search / section landing 等探索入口
- 內容怎麼維護：source-driven；用 `.md` + `<meta>` + 少量語意化 tag 寫內容，再生成 HTML
- 平常怎麼用：單篇重生用 `python3 cli.py build <source.md>`，整批重生用 `python3 cli.py build-all --content-dir notes|writing|canvas|all`
- 想先跑站看結果：用 `python3 -m http.server 8000`，再打開 `index.html` / `pages/search.html` / `garden/index.html`

若你是第一次進這個 repo，建議閱讀順序：

1. 看 `Features`：先知道站上有哪些能力
2. 看 `快速開始`：先把站跑起來
3. 看 `新增/修改筆記（唯一工作流）`：理解日常怎麼寫內容、怎麼重生
4. 需要規格時再看 `AGENTS.md` / `docs/specs/system-spec.md` / `docs/specs/parser-spec.md` / `docs/specs/inline-enhancement-spec.md` / `docs/specs/content-metadata-spec.md` / `docs/specs/translation-spec.md`

## Description（核心理念）

- Single Source of Truth：metadata 與正文各有清楚責任；可索引 metadata 再現性生成，正文則以 `.md` 內可攜的核心內容為主
- Tag-first：用 tags 當作主要 cluster（小花園），搜尋與 tags 互補（找 vs 逛）
- Progressive Enhancement：先做「能用又一致」的檢索/聚合，再逐步加上 garden metaphor 的互動與視覺
- No duplication：不維護兩份內容；卡片、預覽、列表都是同一份 note 的不同呈現

更完整的設計理由與決策脈絡：請看 [design.md](./docs/design/design.md)；系統設計與可驗證 spec 看 [system-spec.md](./docs/specs/system-spec.md)；第一視角的心得雜談看 [dev-notes.md](./docs/author/dev-notes.md)。

## Docs（文件分工）

- 完整文檔索引與分工：看 `docs/README.md`
- 文檔資料夾分工：看 `docs/README.md`
- 不可退化契約：看 `AGENTS.md`
- 日常使用入口：看 `README.md`
- `docs/rules/`：交付規則與守門文件
- `docs/guide/`：擴充與維護 guide
- `docs/design/`：設計理由與重大決策脈絡
- `docs/author/`：給作者自己沉澱與回看的筆記
- 系統 contract / data flow / schema：看 `docs/specs/system-spec.md`
- `Companion` 的位置 / 大小 / placeholder baseline：看 `docs/specs/companion-spec.md`
- source `.md` parser contract：看 `docs/specs/parser-spec.md`
- source `.md` parser contract：看 `docs/specs/parser-spec.md`
- timeline 資料與投影 contract：看 `docs/specs/timeline-design-spec.md`
- inline enhancement contract：看 `docs/specs/inline-enhancement-spec.md`
- 內容 metadata contract：看 `docs/specs/content-metadata-spec.md`
- 翻譯 workflow contract：看 `docs/specs/translation-spec.md`
- 設計理由 / UI/UX 取捨 / 重大決策：看 `docs/design/design.md`
- 技術實作與排查：看 `docs/tech/README.md`
- 寫作 / 測試 / 演進筆記：看 `docs/author/`

文件原則：

- 底層規則少而硬，表層說明短而有用
- 只有會影響工作流、決策一致性或不可退化約束的內容值得長期保留
- 為避免索引漂移，完整文件清單只維護在 `docs/README.md`

## Features

- Portfolio：首頁與 projects 頁（展示作品）
- Search：全站搜尋（multi-tag filter）
- Garden：tags 視角的探索入口（popular / recent tags）、patch（卡片 + 展開閱讀）、tag detail page
- Notes：知識筆記 / 學習筆記（可被引用、可長期整理的內容）
- Writing：長文與文字內容入口（UI 中文名稱目前為「文章」；技術路徑仍為 `writing/`）
- Canvas：視覺內容入口（UI 中文名稱目前為「視界」；技術路徑仍為 `canvas/`）
- Labs：實驗功能入口（Future：`future/massive-multiplayer-laser-tag` / `future/cosmic-flow`）
- Timeline：首頁上的獨立 section；採 source-driven data contract（由獨立 data file authoring，再交給 runtime projection），ongoing phase 可用 `end: "present"` 表達
- Settings：全站可喚起的 settings modal；`pages/settings.html` 保留作 direct-link / fallback 入口
- Mobile Additional Entry：手機 / 窄視窗下，misc 與單篇頁 metadata/outline 共享同一個右下角主入口
- Mobile Navigation：手機上採獨立 IA；頂部只保留 `Ludwig` 品牌返回首頁，底部導覽收斂成 `Portfolio / Search / More`，其中 `Portfolio` / `More` 會進入各自的 hub page

## Site Map（連接機制）

- Source of truth：每篇內容頁（notes/writing/canvas）在 `<head>` 提供 `garden:tags` / `garden:summary`；若有 `.md` source，正文的核心內容以其中的 core markdown 為主，其餘 view 從這兩層衍生
- 若 tag 已映射到 ontology，內容頁可額外輸出 `garden:tag_concepts`；它與 `garden:tags` 逐項對齊，作為 runtime filter / tag detail 的穩定 concept 識別
- Optional ranking metadata：若要讓某篇 writing 在符合 query/tag filter 時優先出現在 `pages/search.html` 與 `writing/index.html`，可額外輸出 `garden:pinned` / `garden:priority`
- Indexer：`search/indexer.py` 掃描 `notes/`、`writing/`、`canvas/` → 產出 `search/search-index.{json,js}`（JS 會掛 `window.SITE_SEARCH_INDEX`）
- Section landing：
  - `notes/index.html` / `writing/index.html` / `canvas/index.html` 透過 `core/search-core.js`（SearchCore）+ `assets/js/section-landing.js` 讀索引，只顯示該 section 的內容（含 scoped search + tag filter）
  - freshness guard：section landing / search / tag page 與 note recommendation 會優先抓 `search/search-index.json`（`cache: "no-store"`），抓不到才退回 `window.SITE_SEARCH_INDEX` / `search-index.js`；目的不是放棄 JS 版本，而是降低 GitHub Pages / 瀏覽器快取把舊索引一直當成真相的機率
  - Cover 圖片策略：若未提供內容專屬 cover，section landing 與搜尋卡片會使用「預設 cover」當作列表縮圖（`notes` 預設使用 `assets/images/Notes.png`，`writing` 預設使用 `assets/images/Writing.png`），確保未指定 cover 時版面視覺一致
- Search：
  - `pages/search.html` 透過 `core/search-core.js`（SearchCore）+ `assets/js/search-page.js` 讀 `window.SITE_SEARCH_INDEX`，提供 query ranking + multi-tag filter
  - tag filter 仍留在 search 內；若已選單一 tag，可用明確的 `Open tag page` 入口切到 `tag/index.html`
- Garden：
  - `garden/index.html` 是獨立 UI，資料仍只讀 `window.SITE_SEARCH_INDEX`
- Tag detail：
  - `tag/index.html` 是穩定的 tag detail 入口；runtime 可帶 `?concept=...&tag=...`，並向後相容既有 `?tag=...`
  - tag detail / related tags / search filter 優先以 ontology `concept_id` 判斷是否為同一概念，再依目前語系決定顯示 label
  - 單篇頁的 tag pill / related tag 連結預設都應導到 `tag/index.html`
  - 單篇頁的 tag pill / related tag 連結預設都應導到 `tag/index.html`

## 現有優點（請保持不退化）

- 單一真相來源：note 的 `<head>` metadata（`<title>` / `garden:tags` / `garden:summary`），其餘一律衍生（以 `AGENTS.md` 為準）
- Indexer：由 `notes/`、`writing/`、`canvas/` 生成 `search/search-index.{json,js}`（並同時生成 `window.SITE_SEARCH_INDEX` 的 JS 版本）
- Search：client-side 搜尋 + multi-tag filter
- Clusters：popular / recent tags 的花叢視圖
- Patch：卡片視圖 + 展開閱讀面板（同頁閱讀）
- Tag detail：`tag/index.html` 提供穩定 detail route，不再讓 tag 入口綁在 `garden/` 底下

## 快速開始（建議用本機伺服器）

用 `file://` 直接開 HTML 可能會遇到瀏覽器限制（尤其是 `fetch`）。建議用最簡單的靜態伺服器：

```bash
python3 -m http.server 8000
```

然後開：
- `http://localhost:8000/pages/search.html`
- `http://localhost:8000/garden/index.html`
- `http://localhost:8000/labs/index.html`
- `http://localhost:8000/index.html`（可直接用 navbar 的 gear icon 打開 settings modal）

若你是在 GitHub Pages / 正式站驗證剛部署的變更，特別是：

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
- `Sky` 的雲朵背景屬 theme ambience，不應被 settings pills / active state 的局部樣式誤傷；若調整 sky 視覺，優先分開處理 `sky-clouds` 與 settings controls
- note 頁的 `block / callout / takeaways` 需各自有明確的 theme color variables；目前可先填同值，但未來擴 theme 時必須三者一起檢查
- 若修 theme 視覺時發現需要一直疊 override，優先回頭整理底層 token / selector / variable pipeline，而不是繼續堆例外規則
- 未來若要新增 / 調整 theme、palette 或 settings controls，優先先看 `docs/guide/theme-palette-guide.md`

## Garden UI（獨立設計）

- Garden 入口頁為 `garden/index.html`，使用獨立 UI，不依賴主站 Theme/Palette
- Garden 的資料來源仍然只讀 `window.SITE_SEARCH_INDEX`（由 `search/search-index.js` 提供）

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
     - `<meta name="garden:tags" content="...">`（逗號分隔）
     - `<meta name="garden:summary" content="...">`（一句話 summary）
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
     - `search/search-index.{json,js}` 與 `garden/floral-assets/` 需要納入版本控制（供靜態頁面讀取）
     - 其餘 build output 一律視為生成物並加入 `.gitignore`（例如 `garden/_floral_dist/`）
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
- 若要調整全站 navbar 這類 page-level shared chrome，請優先改 `pages/_shared/navbar.html`；`tools/content_styles/_shared/` 留給內容生成流程自己的 partial，不再作為 navbar 的單一真相來源
- 若首頁 Timeline 使用 `end: "present"` 表達 ongoing phase，尾端可由 runtime 收斂成單一 `Present / 至今` cluster；作者仍只維護逐筆 timeline data，不需要手做 cluster
- Timeline 若使用 `category`（例如 `education` / `internship` / `work`），目前只用於顯示輕量 badge；顏色仍維持由 theme / palette runtime 決定，不另外為 category 建第二套固定配色
- Copilot 可見性現在由 settings runtime 控制，偏好值為 `off / home / all`；`pages/settings.html` 與設定 modal 共用同一套 data attrs / localStorage，不應各自維護平行狀態

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
- `<meta name="garden:tags" ...>`
- `<meta name="garden:summary" ...>`

若有多語 / tag ontology / 日期 / 狀態需求，再補對應的 `garden:*` metadata。完整最小契約請看 `docs/specs/content-metadata-spec.md`。

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
python3 cli.py translate --source notes/<topic>/<topic>.md --target-lang en --backend gemini-api
python3 cli.py install-hooks
python3 cli.py serve --port 8000
python3 cli.py clean
```

- `cli.py scan-information` 會掃描單篇 source `.md` 裡命中 `information` ontology 的詞，列出：
  - 哪些詞已經有 `<information>`
  - 哪些詞第一次出現但還沒標註，適合作為候選詞
- 目前候選詞判定以正文 flow 為主；markdown heading 內的命中不算「第一次出現」。
- 若加 `--json`，會輸出機器可讀的 JSON，方便 agent 或 script 接後續流程。
- 這個指令是 authoring helper，不會自動把命中的詞插入 `<information>`；是否標註仍由作者控制。

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

- `pre-commit`：若 staged 了 `notes/` / `writing/` / `canvas/` 的 `.md`，會自動重生對應 `.html`，並在必要時更新 `search/search-index.{json,js}`
- `pre-push`：執行 `python3 cli.py test`（包含 `create_content` self-test、`unittest`、`py_compile`、`check-tags`）
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

## 專案結構

```text
Ludwigia/
├── README.md
├── AGENTS.md
├── TODO.md
├── cli.py
├── docs/
│   ├── README.md
│   ├── specs/
│   │   ├── layout-spec.md
│   │   ├── system-spec.md
│   │   └── skills-credentials-spec.md
│   ├── design/
│   │   └── design.md
│   ├── rules/
│   │   ├── checklist.md
│   │   └── guardrails.md
│   ├── guide/
│   │   ├── language-guide.md
│   │   ├── ontology-guide.md
│   │   └── theme-palette-guide.md
│   ├── tech/
│   │   └── README.md
│   ├── miscellaneous/
│   │   └── visual-sources.md
│   └── author/
│       ├── dev-notes.md
│       ├── takeaways.md
│       ├── testing-notes.md
│       └── writing-notes.md
├── index.html
├── pages/
│   ├── search.html
│   ├── projects.html
│   ├── settings.html
│   ├── portfolio.html
│   └── more.html
├── tools/
│   ├── create_content.py
│   └── translate_content.py
├── writing/
│   └── index.html
├── labs/
│   └── index.html
├── future/
│   ├── massive-multiplayer-laser-tag/
│   │   ├── page.html        # static overview / WIP page
│   │   └── src/             # prototype source
│   └── cosmic-flow/
│       ├── page.html        # static overview / WIP page
│       └── src/             # prototype source
├── notes/
│   └── *.html
├── search/
│   ├── indexer.py
│   ├── search-index.json
│   └── search-index.js
├── garden/
│   ├── index.html          # Garden landing + Patch view（同頁，hash route）
│   ├── floral-assets/       # Garden build output
│   ├── floral-patch-garden/ # Garden source（React/Vite）
│   └── assets/js/           # Garden 專用 JS
│   └── note_styles/
│       ├── _shared/
│       └── default/
│           ├── partials/
├── tag/
│   └── index.html          # tag detail page
│           ├── style.css
│           └── style.py
├── assets/
│   ├── css/style.css
│   ├── js/
│   │   ├── script.js
│   │   ├── search-core.js
│   │   ├── search-page.js
│   │   ├── section-landing.js
│   │   ├── tag-page.js
│   │   ├── note-tags.js
│   │   └── settings-page.js
│   └── images/
```
