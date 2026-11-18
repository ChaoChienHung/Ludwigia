# Markdown → Ludwigia Writing（Rulebook 編撰 + 生成）

目標：把使用者給的「一般 Markdown 文章」整理成符合 Ludwigia rulebook 的 pseudo-markdown（可用 `tools/create_content.py` 產生 HTML writing），並確保：

- 文章語意與結構留在 `.md`
- 不在 `.md` 內寫 CSS class（除非用 `<rawhtml>` 逃生門且允許）
- 生成出的 `.html` 可被 Garden 索引（`<title>` / `garden:tags` / `garden:summary`）

## 輸入

- 一篇文章（Markdown / 文字 / 大綱）
- 可選：目標 tags、summary、slug、是否需要 quiz / prompt / callout / images

## 輸出

- `writing/<slug>/<slug>.md`（pseudo-markdown，含 `<meta>`）
- `writing/<slug>/<slug>.html`（由 `tools/create_content.py` 生成）

## 編撰步驟（Rulebook）

### 1) 先補齊 `<meta>`

最少要有：

```text
<meta>
Title: ...
Tags: Tag1, Tag2
Summary: ...
Slug: ...
Output: writing/{titleslug}/{titleslug}.html
Style: default
EstimatedReadingTime: true
Lang: zh-Hant
TitleSuffix: true
</meta>
```

### 2) 結構化文章（建議章節骨架）

以 `# Title` 開頭（若與 `Title:` 相同，生成時會避免重複顯示）。

建議常見骨架（可視內容刪減）：

- `## <Core Topic 1>`
- `## <Core Topic 2>`
- `## Summary & Key Takeaways`
- `## References`
- `## Summary Quiz`（用 `<reviewkit>`）
- `<qprompt>`（提供 Quiz Generator Prompt 的 SSOT）

### 3) 用 tags 表達語意元件（避免 raw HTML）

- 需要帶 icon 的資訊框：用 `<callout>`
- 需要無 icon 區塊：用 `<block>`
- 需要 quiz：用 `<qquiz>` 或 `<reviewkit>`
- 需要 QA Generator Prompt：優先用 `<qprompt count=20 type=["mcq"]>...</qprompt>` 這類 shorthand，讓系統自動接上共用 prompt + core markdown 正文
- 需要插圖或 placeholder：用 `<image>`
- 需要控制 anchor/TOC：用 `<anchors>`

### 4) LaTeX

- 直接在文字裡使用 `$...$` / `$$...$$`
- 不要把公式放進 `` `code` `` 或 ```code fence```，KaTeX auto-render 會跳過 `code/pre`

### 5) Anchors 與 TOC（可選但推薦）

當你需要讓生成結果「對齊既有 hand-written HTML」或希望 TOC 的文字/順序可控，補 `<anchors>`：

```text
<anchors>
h2: Types of Attributes -> attributes-types
toc1: attributes-types -> Types of Attributes
callout: Guiding Questions -> guiding
toc2: guiding -> Guiding Questions
</anchors>
```

## 生成與比對

### 1) 生成（會覆蓋 Output 指定的 html）

```bash
python3 tools/create_content.py --source writing/<slug>/<slug>.md --force
```

### 2) 不覆蓋原檔的比對生成（推薦在對齊 ground truth 時使用）

```bash
python3 tools/create_content.py \
  --source writing/<slug>/<slug>.md \
  --force --no-index \
  --output-root writing/_generated
```

## 驗證（必做）

- `python3 tools/create_content.py --self-test`
- `python3 -m unittest`
- 開 `pages/search.html` 搜尋/過濾 tags，確認新 writing 可被索引且 summary/tags 正確

## 安全限制

- `<rawhtml>` 預設禁用，只有 `AllowRawHtml: true` 才能使用
- links/src 會做白名單限制（避免 `javascript:` 等）
