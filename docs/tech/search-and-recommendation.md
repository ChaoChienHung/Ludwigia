# Search And Recommendation

這份文件把 Ludwigia 目前站內的「搜推」實際運作方式收斂成一個地方，專講 What / How：資料從哪裡來、不同入口怎麼查、怎麼排、單篇頁推薦怎麼做，以及目前已知的語意落差。

## 範圍

- 本文覆蓋 `pages/search.html`、`notes/index.html`、`writing/index.html`、`canvas/index.html`、`tag/index.html` 與單篇頁 `Recommended Posts`
- 本文描述的是「目前實作」，不是理想規格；若與 `docs/specs/system-spec.md` 有落差，應以 code path 為準並回頭修文件

## 一句話版

- 單一資料來源是內容頁 `<head>` metadata 與可選 source `.md`
- `search/indexer.py` 先把內容整理成 `search/search-index.{json,js}`
- runtime 再由 `core/search-core.js` 統一做 normalization、tag concept 對齊、canonical 去重、查詢與排序
- Search page 用輕量 TF-IDF
- Section landing 與 tag page 主要是 filter + 共用排序，不做全文 relevance ranking
- 單篇頁推薦先吃 indexer 預算好的 `related`，再用 localStorage 裡的 recent / click signal 做輕量 rerank

## Data Flow

1. 作者在 source `.md` 或內容頁 HTML `<head>` 提供 metadata，例如：
   - `garden:tags`
   - `garden:summary`
   - `garden:tag_concepts`
   - `garden:canonical_id`
   - `garden:pinned`
   - `garden:priority`
   - `garden:status`
2. `tools/create_content.py` 會把 source metadata 再現性輸出到 HTML `<head>`
3. `search/indexer.py` 掃描 `notes/`、`writing/`、`canvas/` 的 HTML，必要時回讀 source `.md` 補：
   - `content_markdown`
   - `preview_markdown`
   - `reading_time_minutes`
   - metadata fallback
4. indexer 產出 `search/search-index.json` 與 `search/search-index.js`
5. 頁面端優先抓 `search/search-index.json`，抓不到才退回 `window.SITE_SEARCH_INDEX`
6. `SearchCore.adaptIndex()` 把 raw item 轉成 runtime doc，補齊：
   - `section`
   - `path`
   - `canonicalId`
   - `tagKeys`
   - `availableLangs`
   - `priority`

## Index Item 結構

目前搜推實際依賴的欄位主要有：

- `title`
- `url`
- `path`
- `section`
- `tags`
- `tag_concepts`
- `tag_labels`
- `summary`
- `content`
- `content_markdown`
- `preview_markdown`
- `reading_time_minutes`
- `cover`
- `lang`
- `canonical_id`
- `status`
- `pinned`
- `priority`
- `related`
- `kind`

其中幾個關鍵欄位的責任是：

- `canonical_id`：多語版本去重與 variant pick 的穩定 key
- `tag_concepts`：tag filter / tag detail / tag pills 的 concept-based matching 依據
- `pinned` + `priority`：排序 boost，只對 `writing` 的 pinned 真正生效
- `related`：indexer 預先算好的 base recommendation 候選
- `status`：`drafting` 在 indexer 階段直接排除，不進公開索引

## Runtime Core

`core/search-core.js` 是搜尋層的共用核心，負責：

- `normalizeText()` / `tokenize()`：查詢與索引 tokenization
- `resolveTagConcept()` / `resolveTagKey()`：把 label 與 ontology concept 對齊
- `getTagLabel()`：依 UI 語言拿正確 tag 顯示文案
- `collapseByCanonical()`：同一篇多語內容只保留一個變體
- `filterDocs()`：section landing / tag page 的 filter 主入口
- `buildTagStats()` / `buildRelatedTagStats()`：tag 統計與 related tag 聚合
- `buildTfidf()` / `searchTfidf()`：全站搜尋頁的 query ranking

## 多語去重與 Variant Pick

所有主要入口都依賴 `collapseByCanonical()` 做 canonical 去重。它的排序優先順序是：

1. pinned / priority
2. 使用者偏好語言是否精準命中
3. 若是 scored search，才比較 `score`
4. `title`
5. `path` / `url` identity

這代表：

- 同一 `canonical_id` 的多語版本，最後只會保留一個顯示
- 偏好語言是 client-side 狀態，存在 localStorage
- pinned / priority 的優先級高於語言偏好

## Search Page

`pages/search.html` 是唯一真正做 query ranking 的入口。

### 查詢模型

- 先把 index 丟進 `buildTfidf()`
- 權重配置是：
  - `title`: `3`
  - `tags`: `2`
  - `summary`: `1.2`
  - `content`: `1`
- IDF 公式是 `log((N + 1) / (df + 1)) + 1`
- tokenization 同時支援：
  - Latin token：`[a-z0-9]+`
  - CJK 單字切 token

### 排序規則

有 query 時：

1. 先按 section 與 selected tags 過濾
2. 用 TF-IDF 分數排序
3. 但 pinned / priority 仍然先於 score
4. 再做 canonical collapse

如果使用者在 Search page 顯式切到手動排序：

- `relevance` 仍然保留為可切回的預設模式，不是被 UI 隱藏掉的內部狀態
- 目前 UI 可以把這個模式顯示成 `Default`，但它對應的底層語意仍然是 relevance / search engine ranking
- 一旦切到 `published / modified / reading time`，就視為使用者主動覆寫 relevance ranking
- sort trigger 本身不需長時間顯示目前模式；只要在非 `relevance` 時做 active highlight，打開 menu 時再看目前 selected 即可

無 query 時：

1. 先取已 collapse 的 docs
2. 排序依序為：
   - pinned writing
   - priority
   - 最近開啟時間（localStorage）
   - title

### Search 的 personalization

Search page 不會改變召回池，但在「空 query」狀態會讀 localStorage 的 recent map，讓最近打開過的內容往前浮。

### Search 與手動 Sort 的並存心智

Search page 目前有兩層排序來源：

- `relevance`：由 search engine（TF-IDF + pinned / priority + canonical collapse）決定，是預設秩序
- manual sort：`published` / `modified` / `reading time`，是使用者對目前結果集合的顯式重排

這代表：

- Search 不是只有一個抽象的 `default` sort
- `relevance` 必須是 UI 可見且可切回的模式
- 文件與實作都要避免把 `default`、`relevance`、`manual sort` 混成同一件事

## Section Landing

`notes/index.html`、`writing/index.html`、`canvas/index.html` 共用 `assets/js/section-landing.js`。

它們不是全文搜尋，而是 scoped listing：

- 先限縮到該 `section`
- 再套 tag filter
- 再用 `matchesQuerySimple()` 做 substring 查詢
- 最後走 `collapseByCanonical()`

換句話說：

- landing page 的 query 不是 TF-IDF
- 它比較像「section 內快速篩選器」
- `writing` 的 pinned / priority 也會在這層生效

## Tag Detail

`tag/index.html` 是穩定 tag detail route。

它會做三件事：

1. 找出含該 tag / concept 的內容
2. 算 notes / writing / canvas 分布
3. 算 related tags

tag matching 的優先順序是：

1. 若命中 `concept_id`，以 concept 為準
2. 若沒有 ontology concept，才退回 trim + case-insensitive label match

這讓不同語系顯示文案仍可以收斂到同一個 tag 概念。

## Tag Filter 語意

目前實作上，multi-tag filter 是 OR，不是 AND。

也就是說：

- 只要文件命中任一個 selected tag，就會通過 `matchesAllTags()`
- 這與部分文件裡寫的「intersection / AND」不一致

這是目前最需要明確記住的一個語意落差，因為它直接影響 Search、section landing 與 tag page 的使用者心智模型。

## Pinned / Priority

`pinned` 與 `priority` 來自 source metadata 或 HTML `<head>` metadata。

實作語意是：

- `pinned` 只對 `section === "writing"` 生效
- `priority` 是數字，越大越前
- 比較順序永遠是先看 `pinned`，再看 `priority`

注意：

- 雖然文件常用「search page 與 writing landing」來描述 pinned boost
- 但因為 `tag/index.html` 也共用同一層排序邏輯，實際上 tag detail 裡的 writing 也可能吃到 pinned / priority boost

## Recommendation

單篇頁 `Recommended Posts` 分成兩階段：

### 第一階段：indexer 預算 base related

`search/indexer.py` 的 `_attach_related()` 會對所有 content item 算 cosine similarity。

它用到的欄位與權重是：

- `title`: `1.0`
- `summary`: `1.0`
- `tags`: `0.9`

特性：

- 不看全文 `content`
- 預先離線計算
- 每篇最多留下 `top_k = 6`

### 第二階段：單篇頁 runtime rerank

單篇頁載入索引後，會先取當前文章的 `related` 候選，再加上 localStorage signal 做 rerank：

- `base * 1.0`
- `tag overlap * 0.22`
- `recency * 0.85`
- `log1p(clicks) * 0.22`

其中：

- `recency` 來自最近開啟時間，越近分數越高
- `clicks` 來自歷史點擊次數
- rerank 只影響既有候選池內的順序，不會憑空召回完全無關的內容

### fallback 鏈路

如果 `related` 為空，單篇頁會依序退回：

1. 與當前文章第一個 tag 相同的內容池
2. 整個 content docs 池

之後仍會經過：

- canonical 去重
- 同語言 variant 偏好
- rerank

## Freshness 策略

目前實作的載入策略是：

1. 先抓 `search/search-index.json`，並使用 `cache: "no-store"`
2. 如果抓不到，再退回 `search/search-index.js` 或 `window.SITE_SEARCH_INDEX`

這個策略的目的不是放棄 JS 版本，而是減少靜態部署與瀏覽器快取把舊 index 當成真相的機率。

## 已知落差與風險

### 文件與實作的落差

- multi-tag filter 文件常寫成 AND，但 code path 目前是 OR
- 部分舊文件仍把載入策略描述成「先 script 再 fetch json」，但目前實作已改成「先 json 再 JS fallback」

### 計數偏差

- `buildTagStats()` 與 `buildRelatedTagStats()` 直接掃 raw docs
- 它們在統計前沒有先做 canonical collapse
- 因此同一篇內容若有多語版本，tag count 與 related tag count 可能被放大

### 推薦訊號偏輕

- indexer 的 base related 不看全文 `content`
- 推薦更偏向 title / summary / tags 的語意相似，而不是全文主題相似

### personalization 是本機態

- `recent` 與 `clicks` 都存在 localStorage
- 同一位使用者跨裝置不共享
- 這是刻意保持純靜態架構的結果，不是 bug

## Debug Checklist

當你覺得「搜推怪怪的」時，先按這個順序排：

1. 檢查內容頁 `<head>` metadata 是否正確
2. 檢查 `search/search-index.json` 是否已更新
3. 檢查該內容是否被 `status = drafting` 排除
4. 檢查 `canonical_id` 是否把多語版本錯誤合併
5. 檢查 `tag_concepts` 與 `tag_labels` 是否對齊
6. 檢查你所在入口是 Search page 還是 landing page，因為兩者查詢模型不同
7. 檢查 localStorage 的 recent / click 是否影響排序體感

## 相關檔案

- `search/indexer.py`
- `tools/create_content.py`
- `core/search-core.js`
- `assets/js/search-ui.js`
- `assets/js/search-page.js`
- `assets/js/section-landing.js`
- `assets/js/tag-page.js`
- `assets/js/note-tags.js`
- `core/script.js`
