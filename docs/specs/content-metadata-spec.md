# Content Metadata Spec

這份 spec 定義 source-driven 內容頁的 metadata contract：哪些欄位可以出現在 source `.md` 的 `<meta>...</meta>`，它們如何影響 HTML 輸出、搜尋索引與公開可見性，以及哪些欄位屬於穩定契約。

它不負責：

- 詳列 parser 支援的 markdown 子集與 block syntax：看 `docs/specs/parser-spec.md`
- 說明整個系統如何消費 metadata / markdown / extras：看 `docs/specs/system-spec.md`
- 教你平常怎麼 build / build-all：看 root `README.md`

## Scope

本 spec 適用於由 `tools/create_content.py` / `cli.py build` 再現性生成的 source-driven 內容頁，包含：

- `notes/**`
- `writing/**`
- `canvas/**`

目標是讓以下 surface 都共享同一份 metadata 真相來源：

- 內容頁 `<head>`
- Meta sidebar
- `search/search-index.{json,js}`
- Search / Garden / section landing / tag detail

## Source Block

source 檔案可在最上方放：

```text
<meta>
Title: My Note
Tags: ML, System Design
Summary: 一段話概述這篇在講什麼
</meta>
```

規則：

- `<meta>` 是 source metadata 的 single source of truth
- CLI 若同時提供對應參數，CLI 參數優先覆蓋 `<meta>`
- parser 應將 `<meta>` 視為獨立 metadata layer，而不是 core markdown 正文的一部分

## Required Fields

以下欄位是生成標準內容頁的最小必要集合：

- `Title`
- `Tags`
- `Summary`

語意：

- `Title`：內容標題；同時用於 `<title>`、頁面標題 fallback、索引項目標題
- `Tags`：以逗號分隔的 tag list
- `Summary`：一句話摘要；供卡片、preview、索引與相關入口使用

## Recommended Fields

以下欄位不是硬性必填，但強烈建議提供，以維持輸出可控與再現性：

- `Slug`
- `Output`
- `ContentDir`
- `Style`

語意：

- `Slug`：建議 kebab-case；用於穩定命名與輸出路徑推導
- `Output`：輸出 HTML 的相對路徑；建議寫成顯式路徑而不是依賴隱式猜測
- `ContentDir`：可選；用來指定 section 類型，例如 `notes` / `writing` / `canvas`
- `Style`：標準內容頁使用的模板風格；目前建議 `default`

## Optional Fields

### Visibility And Ranking

- `Status: published|drafting`
- `Pinned: true|false`
- `Priority: number`

規則：

- `Status` 預設為 `published`
- `drafting` 可保留在 repo 並本機預覽，但不得出現在公開搜尋 / 列表 / tag detail
- `Pinned` 預設為 `false`
- `Pinned` 目前只對 writing 的 `pages/search.html` 與 `writing/index.html` 做排序 boost
- `Pinned` 不得繞過 query / tag filter
- `Priority` 僅作 pinned items 之間的次排序鍵；數字越大越前

### Dates

- `Published: YYYY-MM-DD|ISO8601`
- `LastModified: YYYY-MM-DD|ISO8601`

規則：

- 輸出時應正規化成 `YYYY-MM-DD`
- `Published` 缺席時不強制顯示
- `LastModified` 缺席時，可退回 source 檔案的 last modified date
- Meta sidebar 預設只顯示一個主日期 `Updated`
- `Updated` 對應 `LastModified`；若作者沒寫 `LastModified`，再退回 source file mtime
- 若同時有 `Published` 與 `LastModified`，details 中可顯示兩者

### Language And Cross-Language Identity

- `Lang: zh-Hant|en|...`
- `CanonicalId: some-shared-article-id`

規則：

- `Lang` 表示這份內容本身的語言
- 若同一篇內容有多語言版本，不同語言版本應共享同一個 `CanonicalId`
- 若 source 使用 `<content-link canonical="...">...</content-link>`，target resolution 應以 `CanonicalId` 作為穩定 lookup key，而不是依賴 output path / slug
- `Tags` 若命中 ontology，生成層應依 `Lang` 選對應 label
- 搜尋與 tag detail 的跨語言收斂應優先依 concept id / canonical grouping，而不是只靠顯示字串

### Rendering Flags

- `EstimatedReadingTime: true|false`
- `AllowRawHtml: true|false`
- `TitleSuffix: true|false`

規則：

- `EstimatedReadingTime` 控制是否輸出估讀時間資料
- `AllowRawHtml` 預設為 `false`；只有顯式開啟時才允許 `<rawhtml>`
- `TitleSuffix` 預設為 `true`；開啟時 `<title>` 會附帶站名 suffix

## Output Mapping

source metadata 應可再現性生成以下 HTML / index 欄位：

| Source field | HTML / index output | Notes |
| --- | --- | --- |
| `Title` | `<title>` | 若 `TitleSuffix=true`，可加站名 suffix |
| `Title` | 頁內 H1 fallback | 若正文最前面已有 `# Heading`，正文 H1 優先 |
| `Tags` | `meta name="garden:tags"` | 以目前內容語言輸出顯示 label |
| `Tags` | index `tags` / `tag_concepts` / `tag_labels` | 概念比對優先走 ontology |
| `Summary` | `meta name="garden:summary"` | 供 preview / cards / search 使用 |
| `Status` | `meta name="garden:status"` | 若啟用 status metadata |
| `Pinned` | `meta name="garden:pinned"` | 若啟用 pinned metadata |
| `Priority` | `meta name="garden:priority"` | 若啟用 priority metadata |
| `Published` | `meta name="garden:published_at"` | 正規化後輸出 |
| `LastModified` | `meta name="garden:last_modified_at"` | 正規化或 fallback 後輸出 |
| `Lang` | `<html lang="...">` 或等價語言資訊 | 供 i18n / search / runtime 使用 |
| `CanonicalId` | index `canonical_id` | 供跨語言聚合與切換 |

## Title And Heading Contract

頁內大標題若啟用 H1 fallback，必須維持：

- 優先讀正文最前面的第一個 `# Title`
- `<meta>` 的 `Title` 只作頁內顯示 fallback
- 不得反過來強迫正文第一個 heading 與 metadata title 永遠完全耦合

## Tags Contract

`Tags` 的基本語意：

- source 欄位名為 `Tags`
- 值以逗號分隔
- tag 允許空白，例如 `system design`
- 若 tag 命中 ontology，對外顯示文案應依目前語言選對應 label
- 若同步輸出 `garden:tag_concepts`，其順序必須與 `garden:tags` 對齊
- tag 比對應優先走 ontology concept id；未命中時才退回 trim + case-insensitive 的字串精準比對

## Hand-Written HTML Contract

不是所有內容都必須從 source `.md` 生成；手寫 / 客製化 HTML 仍可存在。

但若該頁面要被 indexer、Search、Garden、tag detail 與 section landing 正常消費，至少必須在 `<head>` 維持可索引 metadata contract。

最低集合：

- `<title>...</title>`
- `<meta name="garden:tags" content="...">`
- `<meta name="garden:summary" content="...">`

視需求可補：

- `<meta name="garden:tag_concepts" content="...">`
- `<meta name="garden:lang" content="...">`
- `<meta name="garden:status" content="...">`
- `<meta name="garden:canonical_id" content="...">`
- `<meta name="garden:published_at" content="...">`
- `<meta name="garden:last_modified_at" content="...">`

規則：

- 即使頁面本體完全客製化，索引層仍只依賴這些 `<head>` metadata
- `garden:tags` 仍以逗號分隔；tag 可含空白
- 若 tag 命中 ontology，建議同步輸出 `garden:tag_concepts`，且順序需與 `garden:tags` 對齊
- 若需要跨語言聚合，應提供穩定的 `garden:canonical_id`
- 修改手寫 HTML 後，仍需重新生成 `search/search-index.{json,js}`

## Author-Only Planning Metadata & Draft Outline

作者規劃欄位與文章大綱骨架不屬於公開 metadata contract，應放在 `<draft>...</draft>` 而不是 `<meta>`。

例如：

- `TLDR` / `MainFlow` / `Scope` / `OutOfScope` / `FollowUps`
- 格式化章節骨架：採用「`重點：內容`」（如 `何謂結果偏誤：結果偏誤是...`）或層級化縮排大綱清單

規則：

- `tools/create_content.py`、markdown extractor、search/indexer 預設都忽略 `<draft>`
- 不得把這些欄位/骨架輸出成公開 `<head>` metadata
- 不得要求作者再維護第二份對外摘要

## Non-Goals

以下不屬於 metadata spec：

- block syntax 細節，例如 `<callout>` / `<reviewkit>` / `<image>`
- core markdown extractor 如何降級 extras
- SearchCore 的 ranking 與 filter 演算法細節
- build / build-all / translation 的操作教學

## Cross References

- parser 語法：`docs/specs/parser-spec.md`
- 系統分層與跨 view contract：`docs/specs/system-spec.md`
- 翻譯 source contract：`docs/specs/translation-spec.md`
