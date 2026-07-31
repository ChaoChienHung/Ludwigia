# Parser Spec

這份 spec 定義 Ludwigia source-driven 內容的 parser contract：source `.md` 的整體分層、支援的 markdown 子集、自訂 block 語法、extras 的穩定降級規則，以及哪些東西刻意不支援。

它不負責：

- 詳列 metadata 欄位 schema 與 head output mapping：看 `docs/specs/content-metadata-spec.md`
- 說明搜尋、Garden、Reading Mode 如何消費 parser 輸出：看 `docs/specs/system-spec.md`
- 平常 build / build-all / translate 的操作教學：看 root `README.md`

## Goals

Parser contract 的目標是：

- 讓作者用可維護的 source `.md` 表達內容結構
- 讓 metadata、core markdown 與 extras 有清楚責任邊界
- 讓 Reading Mode / Garden / Search 等不同 surface 能穩定共用內容來源
- 避免標準生成器被擴張成任意 page builder

## Processing Model

source `.md` 採三層模型：

- metadata layer：由獨立 parser 讀 `<meta>...</meta>`
- core markdown layer：由 markdown extractor 只讀純 markdown 正文
- extras layer：其餘自訂 block 與 inline explanation；屬內容頁 enhancement，不屬 core markdown

規則：

- `<meta>` 不屬於正文
- `<draft>` 不屬於正文，也不屬公開 metadata
- Reading Mode / Garden 這類正文視圖應優先依賴「必要 metadata + core markdown」

## Reserved Top-Level Blocks

### `<meta>...</meta>`

- 作為 source metadata 容器
- 詳細欄位 schema 看 `docs/specs/content-metadata-spec.md`
- CLI 參數若有提供，應可覆蓋 `<meta>`

### `<draft>...</draft>`

- 作為作者自己的 planning scaffold
- 預設不進公開輸出、不進 search index、不進 core markdown

## Core Markdown Subset

目前穩定支援的 markdown 子集：

- headings
- paragraphs
- unordered list
- ordered list
- blockquote
- horizontal rule
- fenced code block
- inline code
- bold
- markdown link
- markdown table
- inline math / block math

### Headings

- `#`：頁內大標題的優先來源
- `##`：section heading
- `###`：section 內的小標

### Lists

支援：

- `- / * / +`：unordered list
- `1. / 2. ...`：ordered list

authoring 規則：

- ordered / unordered item 若帶 continuation paragraph，該段落必須縮排 `4 spaces`
- nested bullet / nested ordered list 也必須相對 parent item 縮排 `4 spaces`
- 不允許依賴「未縮排下一行也算同一個 list item」這種寬鬆猜測

### Markdown Table

支援標準 pipe table：

```text
| Aspect | K-Means | DBSCAN |
| --- | --- | --- |
| Cluster model | Centroid-based | Density-based |
```

規則：

- 採 header row + divider row + body rows
- 至少要求欄數一致
- table 屬於 core markdown，不是 extras gadget

### Math

- 支援 `$...$` 與 `$$...$$`
- 使用 KaTeX 類型的 render pipeline；作者不需要手刻 HTML

## Structured Blocks

以下語法屬 extras layer，由 `tools/create_content.py` 解析成內容頁 UI enhancement。

### `<anchors>...</anchors>`

用途：

- 覆寫 heading / block / TOC 的 `id` 與 label

支援：

- `h2: Title -> id`
- `h3: Title -> id`
- `callout: Title -> id`
- `block: Title -> id`
- `section: Title -> id`
- `toc1: id -> label`
- `toc2: id -> label`

### `<callout>...</callout>`

用途：

- 有 icon 的補充區塊

欄位：

- `id:` 可選
- `toc:` 可選；若提供，會插入 TOC
- `icon:`
- `style:`
- `variant:` 保留欄位
- `size:` 保留欄位
- `title:`
- `content:` 後面接多行 markdown 子集

### `<block>...</block>`

用途：

- 無 icon 的一般補充區塊

欄位：

- `id:` 可選
- `title:` 可選
- `collapsible:` 可選 (`true` / `false`)；若設為 `true`，渲染為折疊手風琴卡片
- `collapsed:` 可選 (`true` / `false`；預設為 `true`，即預設收起)
- `content:` 後面接多行 markdown 子集

### `<takeaways>...</takeaways>`

用途：

- 條列式重點回收區

規則：

- 內部以標準 markdown list 承載內容
- 屬正文 flow 外的補充元件，不取代正文段落總結
- 可獨立存在，也可放在 `<reviewkit>` 內

### `<qquiz>...</qquiz>`

用途：

- Quick Quiz 題組

inline 寫法欄位：

- `title:`
- 多個 `<question>...</question>`

`<question>` 欄位：

- `Question:`
- `A:` / `B:` / `C:` / `D:`
- `ResponseA:` / `ResponseB:` / `ResponseC:` / `ResponseD:`
- `Answer: A|B|C|D`
- `Explanation:` 可多行

external bank 寫法：

```text
<qquiz src="questions.en.json" ids="supervised-vs-unsupervised" title="Quick Quiz"/>
```

external bank contract：

- bank 檔案與 source note 放在同一 folder
- note 應提供 `CanonicalId`
- JSON 每題需提供 `question_id`
- 聚合時 `global question id = ${canonical_id}::${question_id}`
- `ids=` 可選；若提供則只載入指定題目

### `<reviewkit>...</reviewkit>`

用途：

- `takeaways` / `qquiz` / `qprompt` 的共同 semantic container

欄位：

- `title:` 預設 `Summary Quiz`
- `id:` 可選
- `toc: true|false`

規則：

- `reviewkit` 不再等同於固定 quiz + prompt 的 UI
- 內部可放 `<takeaways>`、`<qquiz>`、`<qprompt>`，且都可缺席
- 若內含多個子元件，才以 tabs / pane 呈現
- 若只有一個子元件，只顯示該子區塊，不硬產生空 tab
- `qquiz` / `qprompt` 可獨立存在於 `reviewkit` 外

### `<qprompt>...</qprompt>` / `<qprompt/>`

用途：

- QA / quiz generator prompt 的 SSOT

完整 block 範例：

```text
<qprompt>
title: QA Generator Prompt
prompt:
You are given a set of notes or an article.
Read and understand the content, then generate approximately 20 questions.
</qprompt>
```

shorthand 範例：

```text
<qprompt count=20 type=["mcq"]>
</qprompt>
```

規則：

- 若 placeholder 位於 `reviewkit` 內，渲染成該 reviewkit 的 prompt pane
- 若位於 `reviewkit` 外，獨立渲染成可見 QA prompt section
- copy 到剪貼簿時，實際內容應是 `prompt + Input: + pure markdown 正文`

### `<information ...>...</information>` / `<information .../>`

共同的 inline enhancement 視覺 / 互動 contract，見 `docs/specs/inline-enhancement-spec.md`。

用途：

- 對特定詞彙或片語補充 inline explanation / tooltip

支援：

- `context="..."`
- `concept="concept.xxx"`

例子：

```text
我們會用 <information context="Density-Based Spatial Clustering of Applications with Noise">DBSCAN</information> 來處理這類資料。
```

```text
我們會先做 <information concept="concept.eda">Exploratory Data Analysis (EDA)</information>。
```

規則：

- 被包住的詞彙/片語維持 inline，不應打斷 paragraph flow
- `context` 或 ontology context 只接受字串，不作 rich HTML 容器
- `context` 或 ontology context 的寫法優先先回答術語本體是什麼，再補它的用途、角色或作用；避免一上來只講它能拿來做什麼
- 若使用 `concept=`，tooltip 內容來自 `data/Ontology/information-ontology.json`
- build 出來的 HTML 可只保留 placeholder reference，不必把長 definition 重複展開到每篇 HTML

### `<content-link ...>...</content-link>` / `<content-link .../>`

共同的 inline enhancement 視覺 / 互動 contract，見 `docs/specs/inline-enhancement-spec.md`。

用途：

- 在 source `.md` 裡用穩定語意去連到另一篇 source-driven 內容頁，而不是手寫 HTML path

支援：

- `canonical="some-shared-article-id"`：目標內容的 `CanonicalId`
- `lang="en"`：可選；若提供，優先指定目標語言
- `label="Visible Label"`：可選；給 self-closing 寫法或缺席 inner text 時的 fallback

例子：

```text
可先讀 <content-link canonical="k-means-clustering-around-centers">K-Means: Clustering Around Centers</content-link>。
```

```text
延伸閱讀：<content-link canonical="k-means-clustering-around-centers" label="K-Means" />
```

規則：

- 目標內容由 build 階段依 `CanonicalId` + 語言偏好 resolve 成實際 `href`
- 優先找同語言目標；若缺席，可退回預設 fallback（目前優先 `en`）
- 在一般內容頁可保留輕量 inline link 樣式，並於 hover / focus 時顯示 compact preview card（例如 small cover image、title、tags、summary）；若 target 未提供 cover，可退回站內既有的 shared default cover
- touch / coarse-pointer 裝置不應依賴 hover preview 作為主要互動；若無穩定 tap-preview 設計，預設可只保留直接導頁
- 這個語法屬 inline enhancement，不屬 core markdown
- 在 copy/download markdown、Garden/Search surfaces 與 Reading Mode，一律退化成純文字 label / inner text，不保留 link 語意
- 若 resolve 失敗，不應讓整篇內容 build 直接失敗；內容頁至少應退化成純文字 label

### `<image>...</image>`

用途：

- 插圖或 placeholder

欄位：

- `id:` 可選
- `src:`
- `alt:`
- `caption:`
- `width:`
- `align: left|center|right`
- `link:`
- `lazy: true|false`

規則：

- 優先使用這個語意化 block，而不是直接在內容裡手刻 raw `<img>`
- 正文可以合法包含多張 `<image>`
- 卡片 / preview 圖像應另外來自 metadata `Cover`，而不是從正文 `<image>` 推導

### `<rawhtml>...</rawhtml>`

用途：

- 顯式 escape hatch

規則：

- 預設禁用
- 只有 `AllowRawHtml: true` 時才允許

## Deprecated / Removed Syntax

- 舊的 `<section>...</section>` source block 不再視為作者可用語法
- section 的語意仍可存在於輸出的 HTML 結構中，但由 heading / template 負責，而不是要求作者手動寫 source block

## Downgrade Rules

當不同 surface 不需要完整 extras layer 時，必須維持穩定降級：

- `<information>`：在內容頁可保留 tooltip；在 copy/download markdown、Garden/Search surfaces 與 Reading Mode 一律退化成純文字
- `<image>`：只屬於一般內容頁補充 block；在 copy/download markdown、Garden/Search surfaces 與 Reading Mode 一律排除
- `<reviewkit>`：Reading Mode 應視為 extras 並隱藏
- `<content-link>`：在內容頁可 resolve 成站內連結；在 copy/download markdown、Garden/Search surfaces 與 Reading Mode 一律退化成純文字
- 其它自訂 block：core markdown extractor 可忽略，不要求保留完整互動

## Non-Goals

以下刻意不屬於 parser contract：

- 任意 rich HTML page builder
- 依 presentation gadget 無限制擴張 parser
- 另一套與 markdown extractor 平行的 Garden 專用 markdown 語法

## Validation

避免 parse rule 漂移的最低驗證方式：

```bash
python3 tools/create_content.py --self-test
python3 -m unittest
```

## Cross References

- metadata 欄位契約：`docs/specs/content-metadata-spec.md`
- 系統分層與跨 view contract：`docs/specs/system-spec.md`
- 翻譯來源契約：`docs/specs/translation-spec.md`
