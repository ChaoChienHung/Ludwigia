# Content Authoring & CLI Workflow Guide

本指南整理 Ludwigia 新增、修改、建置、翻譯與檢查內容（`notes/`、`writing/`、`canvas/`）的完整操作步驟與命令範例。精確欄位與不可退化契約見 `docs/rules/content-authoring-contracts.md`、`docs/specs/content-metadata-spec.md` 與 `docs/specs/parser-spec.md`。

## 1. 新增／修改內容（從起稿到發布）

1. **寫內容（先不管 UI）**
   - 起稿前先寫簡短 planning scaffold：`TLDR`、`MainFlow`、`Scope`、`OutOfScope`，確認本篇只回答少數核心主題，不把整個技術家族一次塞進來。
   - 先把想記的知識寫完整（定義、重點、例子、結論），優先追求可讀、可掃讀（標題／小節／清單），再進入版型與互動。
   - 篇幅建議：overview / survey 類控制在 **8–12 分鐘**；單一方法或觀點 deep dive 控制在 **10–15 分鐘**。超過時拆成獨立文章（各自放資料夾），每篇有合理開頭（如 Guiding Questions）。
   - 若一篇同時在做「技術家族 overview」與「單一方法 deep dive」，優先拆成 overview + follow-up pages；定位為 overview 時，不應把篇幅重心長時間停在 `K-Means` 這類單一子方法的細部流程，而應建立地圖讓更多技術自然納入。
   - 前段若想放可見導讀 block，優先寫成 `TL;DR / Focus`（固定主線），不另開專門的 `Guiding Questions` 特殊 block。

2. **準備 source `.md`（套用版型）**
   - 若為 source-driven 內容，直接從既有 `.md` 起稿，沿用 `<meta>` + 正文 + 自訂 block 格式。
   - 若非從 `.md` 起稿，也先確認未來是否需要由 `tools/create_content.py` 再現性生成；若會，先收斂 metadata 與正文結構。

3. **填寫 metadata（Single Source of Truth）**
   - 公開 `<head>` 最低要有 `<title>`、`<meta name="site:tags" content="...">`（逗號分隔）、`<meta name="site:summary" content="...">`。
   - source-driven `.md` 以頂部 `<meta>...</meta>` 為單一來源；完整欄位見 `docs/specs/content-metadata-spec.md`。

4. **生成 HTML（單篇或整批）**
   - 單篇重生（會自動更新 search index）：
     ```bash
     python3 cli.py build notes/my-topic/my-topic.md
     ```
   - 整個 section 重生：
     ```bash
     python3 cli.py build-all --content-dir notes
     ```
   - 整個 repo 重生（整批完成後統一更新一次 index）：
     ```bash
     python3 cli.py build-all --content-dir all
     ```

5. **確認 search index 與版本控制**
   - 確認 `search/search-index.json` 與 `search/search-index.js` 已更新，且該篇的 `title / url / tags / summary` 與 `readingTimeMin`（可選）正確。
   - `search/search-index.{json,js}`、`portals/realms/garden/floral-assets/`、`portals/assets/`、`portals/realms/pensieve/data/characters.json` 必須進版控；其餘本機生成物（如 `portals/realms/garden/_floral_dist/`）須進 `.gitignore`。

6. **檢查匯出 Markdown（Copy / Download）**
   - 用 Meta sidebar 的 Copy / Download Markdown 測一次，確認只含 core markdown 正文（不含 quiz、QA Generator Prompt 等互動元件）。
   - 若要排除特定區塊，加 `data-md-exclude="1"`。

7. **檢查 Reading Mode 與圖片互動（Image Viewer）**
   - 打開 Reading Mode，確認呈現仍以文章為主，quiz / prompt 不成主要干擾。
   - 單篇頁圖片可點擊放大檢視（`Esc` 關閉）；若圖片包在 `<a>` 裡，預設優先放大，按住 `Cmd/Ctrl/Shift/Alt` 點擊或在 `<a data-image-viewer="link-only">` 時才跳轉連結。

8. **部署後快取驗證（Cloudflare）**
   - 驗證剛部署的 `notes/index.html`、`writing/index.html`、單篇頁 `Recommended Posts`、`pages/search.html`、`tag/index.html` 時，先做 hard refresh（macOS: `Cmd + Shift + R`），避免把舊快取誤判為功能未更新。

## 2. 長文寫作 Workflow（架構先行 + Agent 補稿 + 人工全盤 Proofread）

1. **先定架構**：先列 `# / ## / ###` 並寫清每節要回答的問題；在 `<draft>...</draft>` 補作者 planning 欄位（`TLDR`、`MainFlow`、`Scope`、`OutOfScope`、`FollowUps`）。
2. **整理 raw info**：把觀察、例子、碎念、反例、問題丟進對應段落，追求不漏而非文句漂亮。
3. **交給 Agent / LLM 補第一版**：依既有架構填段落、理順措辭與補例子，產出可 refine 的草稿。
4. **用結構反向 refine**：檢視過空、過長、重複或偏離問題的段落，必要時重排、拆小節、補反例。
5. **全盤人工 proofread（不可省）**：最後必須由人從頭到尾完整通讀一次。

### 作者規劃欄位（`<draft>...</draft>`，不對外）

放在 `<draft>` 而非 `<meta>` 的欄位：`TLDR`、`MainFlow`、`Scope`、`OutOfScope`、`FollowUps`。它們幫助作者起稿、拆篇與避免 overview 走偏成單一方法 deep dive；`tools/create_content.py`、core markdown extractor、search/indexer 預設忽略 `<draft>`，不輸出至 `<head>` 也不進 search index；未來若需顯示於 UI 必須顯式 opt-in。

## 3. CLI 與 `tools/create_content.py` 命令範例

日常優先用 `cli.py build` / `cli.py build-all`（會自動處理 index 更新）；`tools/create_content.py` 維持單篇標準生成器角色，需要建立新模板或特殊參數時可直接呼叫。

### 快速建立新 note（kebab-case 檔名，自動跑 indexer）

```bash
python3 tools/create_content.py \
  --content-dir notes \
  --title "Knowledge Discovery & Data Mining" \
  --tags "data mining, preprocessing, clustering" \
  --summary "Knowledge Discovery and Data Mining 定義、流程、資料品質、EDA 與前處理重點整理"
```

### 從 source `.md` 生成（帶 CLI 參數覆蓋或純靠 `<meta>`）

```bash
python3 tools/create_content.py \
  --content-dir notes \
  --title "My Note" \
  --tags "ml, system design" \
  --summary "一段話概述這篇在講什麼" \
  --source path/to/note.md
```

若 source `.md` 頂部已填完整 `<meta>`（搭配可選 `<draft>`）：

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

> 註：`EstimatedReadingTime: true` 開啟 sidebar 估讀時間，但屬 heuristic；對高密度技術／數學／比較表文章應視為偏樂觀的 rough estimate。

之後只需傳 `--source`（CLI 參數若有提供會覆蓋 `<meta>`）：

```bash
python3 tools/create_content.py --source path/to/note.md
```

### Writing、Canvas 與 stdin pipe 範例

```bash
# 建立 writing
python3 tools/create_content.py \
  --content-dir writing \
  --title "My Writing" \
  --tags "ml, epistemology" \
  --summary "一段話概述這篇 writing 在講什麼"

# 從 source 強制重生 writing
python3 tools/create_content.py --source writing/my-writing/my-writing.md --force

# Canvas 對等入口（目前共用標準生成器，採「一張圖 + 可選 caption + tags + date」最小單位）
python3 tools/create_content.py --content-dir canvas --source canvas/my-item/my-item.md --force

# 從 stdin 讀取
cat path/to/note.md | python3 tools/create_content.py \
  --content-dir notes \
  --title "My Note" \
  --tags "ml, system design" \
  --summary "一段話概述這篇在講什麼" \
  --source -
```

### Extended Markdown（偽 Markdown）分層速記

- `<meta>`：metadata layer；純正文：core markdown（`Copy/Download Markdown`、Garden preview、Reading Mode 的依賴基礎）。
- `<callout>`、`<block>`、`<reviewkit>`、`<qquiz>`、`<qprompt>`、`<takeaways>`、`<image>`、`<information>`、`<content-link>`：extras / enhancement。
- `<draft>`：作者規劃用，不進公開輸出與索引。
- 最低驗證：`python3 tools/create_content.py --self-test` 與 `python3 -m unittest`。
- 待持續演進議題（Discussion）：雙語 note 的路徑／slug／related posts 策略，以及 note style 的 light/dark token 繼承策略。

### 手動寫 HTML（保留彈性）

不走 source `.md` 時仍可手寫 HTML，只需在 `<head>` 保留 `<title>`、`site:tags`、`site:summary`（以及視需求補其他 `site:*` 欄位，見 `docs/specs/content-metadata-spec.md`），改完後重跑索引：

```bash
python3 search/indexer.py
# 或自動監看：
python3 search/indexer.py --watch
```

## 4. 進階 CLI 工具

### 頁面 Shell 組裝（`cli.py build-pages`）

將 `pages/_shared/navbar.html` 與 `footer.html` 組裝進手寫頁面（首頁、`pages/`、`tag/`、section landing、`labs/`）的 `<!-- shell:navbar -->` / `<!-- shell:footer -->` 區塊；帶 `data-i18n-page` 的靜態 `<title>` 由 `i18n/` bundle 的 `title.en` 生成。改完 partial 後跑 `python3 cli.py build-pages`，並視需要跑 `python3 cli.py build-all` 同步內容頁。

### 候選詞掃描（`cli.py scan-information`）

```bash
python3 cli.py scan-information writing/<topic>/<topic>.md
python3 cli.py scan-information writing/<topic>/<topic>.md --json
```

列出文章中命中 `information` ontology 的詞（已標註 vs 首次出現尚未標註；heading 內命中不算首次出現）。加 `--json` 可輸出給 agent / script 串接；屬 authoring helper，不會自動插入 `<information>`。

### 翻譯工作流（`cli.py translate`）

`cli.py translate` 包裝 `tools/translate_content.py`。先設定憑證（擇一，或放於已 ignore 的 `secret.txt`）：

```bash
export GEMINI_API_KEY="<your-key>"
# 或
export LUDWIGIA_GEMINI_API_KEY="<your-key>"
```

執行翻譯：

```bash
python3 cli.py translate \
  --source notes/foo/foo.md \
  --target-lang en \
  --backend gemini-api
```

翻譯產生新的 source `.md`，記得再跑 `python3 cli.py build ...` 或 `python3 cli.py build-all`。完整參數（`--dry-run`、`--overwrite`、`--output-root`）與欄位契約見 `docs/specs/translation-spec.md`。

### Tag Ontology 覆蓋率檢查（`cli.py check-tags`）

檢查 source `.md` 的 tags 是否都映射到 ontology concept，以及 `data/Ontology/tags-ontology.json` 每個 concept 是否齊備 `en / zh-Hant / zh-Hans` 三語 label：

```bash
python3 cli.py check-tags
python3 cli.py check-tags --content-dir notes
python3 cli.py check-tags --content-dir writing
python3 cli.py check-tags --content-dir all
```

### Git Hooks（`cli.py install-hooks`）

```bash
python3 cli.py install-hooks
# 或 ./scripts/install-git-hooks.sh
```

- `pre-commit`：staged 了 `notes/` / `writing/` / `canvas/` 的 `.md` 時，自動重生對應 `.html` 並將 `.html` 與 `search/search-index.{json,js}` 一併 stage。
- `pre-push`：執行 `python3 cli.py test`（含 `create_content` self-test、`unittest`、`py_compile`、`check-tags`），並檢查 `search-index`、Pensieve `characters.json` 與手寫頁面 shell 是否最新。
- 單次跳過：`git commit --no-verify` / `git push --no-verify`。
