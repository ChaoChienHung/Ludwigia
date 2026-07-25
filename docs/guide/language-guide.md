# Language Expansion Guide

這份文件是 Ludwigia 的多語擴充 playbook / impact map：當你要新增語言包、擴充多語內容、或把更多 UI / tag surface 接到 locale-aware 顯示時，用它來盤點會牽動哪些檔案、哪些 runtime surface、哪些最低驗收要補。

它不負責重寫完整語言規格；語意與長期原則請回 canonical 文件：

- 不可退化底線：`AGENTS.md`
- 系統 contract / index schema / query 語意：`docs/specs/system-spec.md`
- UI/UX 語言體驗與入口分層：`docs/design/design.md`
- 驗收與手動檢查：`docs/rules/checklist.md`
- 守門原則：`docs/rules/guardrails.md`
- ontology 維護流程：`docs/guide/ontology-guide.md`

目標不是把所有語言方案一次講死，而是先把責任拆清楚，避免之後每多一個語系就出現：

- settings 能切語言，但某些 page 仍停在舊字串
- tag detail / search filter / note tags 各自用不同的 tag 判斷規則
- 同一概念在不同語言下被當成不同 tag
- 文章語言、UI 語言、runtime i18n 彼此耦在一起
- 新增語系時漏改索引 schema、preload 或多語路由

## 先對照的原則

- `UI language` 與 `content language` 分層：基礎 page 可走 runtime i18n，文章正文仍以多份 HTML / source 變體為主
- `CanonicalId` 解決同一篇內容的多語版本；`concept_id` 解決同一個 tag 概念的多語 label
- `garden:tags` 是對外顯示 label；`garden:tag_concepts` 是與它逐項對齊的穩定 concept 識別
- Search / tag detail / related tags / section filters 應優先看 `concept_id`
- runtime i18n 只負責 UI 文案，不負責把整篇正文塞進同一份 HTML 內切換

更完整的原則與契約，請回看 `AGENTS.md`、`docs/specs/system-spec.md`、`docs/rules/guardrails.md`。

## 什麼時候需要打開這份

- 新增一個 UI 語言
- 新增一篇文章的多語版本
- 擴充 tag ontology 的新語系 label
- 把新的頁面、filter、tag surface 接到 locale-aware 顯示
- 調整語言 preload / runtime i18n / lang normalization / canonical grouping

## Impact Map

### 1. 語言正規化與偏好持久化

- 檔案：
  - `core/script.js`
  - `core/i18n-preload.js`
  - `core/i18n.js`
- 檢查：
  - `normalizeLang()` 是否認得新語言 alias
  - localStorage 的語言值是否仍向後相容
  - `<head>` preload 是否會在首屏前先恢復 `html[lang]`

### 2. 基礎 page 的 runtime i18n

- 檔案：
  - `core/i18n.js`
  - `pages/*.html`
  - `tag/index.html`（若該頁保留單一 HTML + runtime i18n）
- 檢查：
  - 共用字串是否補齊
  - 非英文偏好下是否不會先明顯閃英文
  - 新語系是否不會漏翻重要導航 / CTA / empty state

### 3. 文章多語版本分組

- 檔案：
  - `notes/**/<slug>-<lang>.md`
  - `writing/**/<slug>-<lang>.md`
  - `tools/create_content.py`
  - `search/indexer.py`
- 檢查：
  - 同一篇內容的多語版本是否共用 `CanonicalId`
  - `Lang` 是否正確進 `<meta name="garden:lang">`
  - 搜尋 / section landing 是否仍只顯示每個 `canonical_id` 的首選語言版本

### 4. Tag ontology 與 locale-aware labels

- 檔案：
  - `data/Ontology/tags-ontology.json`
  - `docs/guide/ontology-guide.md`
  - `tools/create_content.py`
  - `search/indexer.py`
  - `core/search-core.js`
- 檢查：
  - 新語系是否補上 `labels.{lang}`
  - alias 是否仍能 map 到同一個 `concept_id`
  - `garden:tags` 是否依內容 `Lang` 輸出對應 label
  - `garden:tag_concepts` 是否與 `garden:tags` 逐項對齊
  - search index 是否帶出 `tag_concepts` / `tag_labels`
  - 若要新增 concept / alias / 三語 labels，具體操作流程是否已同步到 `docs/guide/ontology-guide.md`

### 5. Tag surfaces 是否仍共用同一套規則

- 檔案：
  - `assets/js/search-page.js`
  - `assets/js/section-landing.js`
  - `assets/js/tag-page.js`
  - `assets/js/note-tags.js`
  - `core/search-core.js`
- 檢查：
  - search filter 是否用 `concept_id` 比對
  - tag detail 是否可由 `?concept=...&tag=...` 穩定進入
  - related tags 是否按 concept 聚合，而不是按字串聚合
  - note tags / search cards / section cards 是否能依目前 UI 語系顯示 label

### 6. 文件與守門清單

- 檔案：
  - `AGENTS.md`
  - `README.md`
  - `docs/specs/system-spec.md`
  - `docs/design/design.md`
  - `docs/author/dev-notes.md`
  - `docs/rules/checklist.md`
  - `docs/rules/guardrails.md`
  - `docs/README.md`
- 檢查：
  - contract、工作流、擴充清單是否仍一致
  - 若新增 / 更名文件，`docs/README.md` 是否同步

## 新增語言時最低驗收

- `settings`：可切新語言，刷新後偏好仍保留
- `首頁 / section landing / search / tag detail`：主要文案都正確
- `tag detail`：同一 concept 在不同 UI 語系下顯示對應 label
- `search filter`：用新語系 label 點選時，仍能命中同 concept 的內容
- `note tags`：單篇頁的 tag pills 能依目前 UI 語系重算顯示
- `multi-language article group`：同 `CanonicalId` 的語言版本仍能正常收斂
- `search index`：重生後 schema 完整，`search-index.{json,js}` 已更新

## 常見漏點

- 只補 `core/i18n.js`，忘了 `i18n-preload.js`，結果首屏先閃舊語言
- 只補 UI label，忘了 `normalizeLang()` alias，導致新語言存了卻讀不回來
- 把 tag 顯示文字當唯一真相，結果 `Machine Learning` / `機器學習` 被當成兩個 tag
- 只改 search page，忘了 section landing / note tags / tag detail 也在吃 tag schema
- 文章有新語言版本，但沒共用 `CanonicalId`，最後列表重複出現
- 補了 ontology label，卻忘了更新 `search/search-index.{json,js}`，runtime 仍讀到舊 schema
