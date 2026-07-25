# Sync MD from HTML（以 HTML 為準回寫 MD）

目的：當現有 `notes/**.html` 是 ground truth（已經手刻/調過 DOM），希望 `notes/**.md` 也能生成出一致的 HTML，則依照此流程把差異回寫到 `.md`，再用 `tools/create_content.py` 重生 `.html`。

## 0) 先鎖定驗收口徑

- DOM/文字/視覺一致即可（不追求 byte-for-byte）
- `.md` 盡量不寫 CSS class；用結構化 tags 表達語意

## 1) 抽取「不可漂移」資訊

從 HTML 的 `<head>` 抽出：

- `<title>`
- `meta name="garden:tags"`
- `meta name="garden:summary"`
- `<html lang="...">`

把這些回寫到 `.md` 的 `<meta>`：

- `Title:` / `Tags:` / `Summary:`
- `Lang:`
- `TitleSuffix:`（看 `<title>` 是否含 ` — Ludwig`）

## 2) 抽取與對齊段落結構

從 HTML 觀察：

- 每個 section 的 `id` 與顯示的 heading 是否一致
- 是否存在「有 section id 但不想顯示 heading」的情況

對應策略：

- 用 `##` / `###` 作為主要結構
- 若需要「只設定 section id，不顯示 heading」：在 md 放 `<section> id: ... </section>`
- 若需要覆寫 id/TOC label/順序：用 `<anchors>`

## 3) 回填互動/元件（若 HTML 有）

- Callout：回寫成 `<callout>`（含 `id/toc/icon/style/title/content`）
- Block：回寫成 `<block>`
- Summary Quiz：回寫成 `<reviewkit>`（固定兩 tab）
- Prompt：回寫成 `<qprompt>`（SSOT，解析後插 `<qprompt/>`）
- Images：回寫成 `<image>`（或 placeholder）

## 4) 重新生成（避免覆蓋原檔的比對模式）

```bash
python3 cli.py build notes/<slug>/<slug>.md --no-index --output-root notes/_generated
```

用 `notes/_generated/...html` 與原 `notes/...html` 做比對（視覺/DOM）。

## 5) 覆蓋正式輸出

確認 OK 後：

```bash
python3 cli.py build notes/<slug>/<slug>.md
```

## 6) 最後驗證

```bash
python3 cli.py test
python3 cli.py index
git diff -- search/search-index.json search/search-index.js
```
