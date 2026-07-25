# Translation Spec

這份 spec 定義 Ludwigia 的 source-driven 翻譯 workflow contract：翻譯入口、可翻與不可翻的欄位、輸出命名規則、credential 來源，以及翻譯後仍需維持的結構不變量。

它不負責：

- 教你平常怎麼 build / build-all：看 root `README.md`
- 詳列 parser 支援的 block 語法：看 `docs/specs/parser-spec.md`
- 詳列 metadata 欄位 schema：看 `docs/specs/content-metadata-spec.md`

## Scope

本 spec 適用於：

- `tools/translate_content.py`
- `cli.py translate`

目標是讓多語言內容仍維持 source-driven contract，而不是把翻譯 workflow 變成另一套平行 authoring system。

## Entry Points

日常入口：

- `python3 cli.py translate ...`

底層入口：

- `python3 tools/translate_content.py ...`

規則：

- `cli.py translate` 是上層包裝；日常使用優先走這層
- 需要 debug 或較低層控制時，才直接呼叫 `tools/translate_content.py`

## Translation Contract

翻譯 workflow 的核心原則：

- 只翻必要自然語言
- 不改寫 source-driven 結構
- 不把 metadata、路徑與 block skeleton 變成不穩定輸入

### 可翻欄位

- `<meta>` 裡的 `Title`
- `<meta>` 裡的 `Summary`
- 正文自然語言段落
- 題目內容等自然語言內容，若該工作流明確支援

### 不可翻欄位

- metadata keys 本身
- `Tags`
- `Slug`
- `Output`
- `Status`
- `CanonicalId`
- block tag 與 block skeleton
- 路徑與檔名骨架

換句話說，翻譯應該改的是內容語言，不是 source 的結構與識別。

## Credentials

若使用 API backend，憑證來源必須支援：

- environment variables
- `secret.txt`

環境變數優先順序：

- `GEMINI_API_KEY`
- `LUDWIGIA_GEMINI_API_KEY`

規則：

- `secret.txt` 僅作 fallback
- `secret.txt` 必須排除在版本控制外
- workflow 不得要求把 API key 寫死進 repo tracked files

## Backend Strategy

目前翻譯 backend 應共享同一套高層 contract：

- `gemini-api`
- `local-model`
- `pretrained-model`

規則：

- 不同 backend 可以有不同執行路徑
- 但它們應共享同一套 source contract、輸出命名與參數語意
- 不應因 backend 不同而讓「哪些欄位可翻 / 不可翻」發生分裂

## Model Store

本地模型資料夾規則：

- 預設為 `data/models`
- 可由 `--model-store <path>` 覆寫
- `local-model` 與 `pretrained-model` 使用同一個根目錄，再由內部子資料夾區分

## Output Naming

輸出命名規則：

- 預設輸出到來源檔同資料夾
- 預設檔名為 `<stem>-<target-lang>.md`
- 若來源檔名已帶語系尾碼，會先去掉原尾碼，再產生目標檔名

例子：

- `foo.md` 翻到 `en` -> `foo-en.md`
- `foo-zh-Hant.md` 翻到 `en` -> `foo-en.md`

額外規則：

- 可用 `--output-root` 指向另一棵輸出目錄
- 使用 `--output-root` 時，應保留來源相對路徑

## Overwrite And Dry Run

workflow 應支援：

- `--overwrite`：允許覆寫既有目標檔
- `--dry-run`：只預覽輸出計畫，不落盤

這兩者屬於工作流控制，不得改變翻譯內容契約本身。

## Post-Translation Responsibility

翻譯 workflow 產生的是新的 source `.md`，不是最終 HTML。

因此翻譯完成後仍需：

- 跑 `python3 cli.py build <source.md>` 重生對應 HTML
- 或跑 `python3 cli.py build-all --content-dir ...` 統一重生並更新索引

規則：

- 翻譯 workflow 不應默默跳過後續 build / index 更新責任
- 但也不要求翻譯步驟本身直接承擔所有 build 流程

## Language Identity

多語言內容應維持：

- 每一份翻譯 source 有自己的 `Lang`
- 同一篇文章的不同語言版本共享同一個 `CanonicalId`

這樣搜尋、列表與單篇頁 runtime 才能把它們視為同一組內容資產，而不是完全不相關的不同文章。

## Invariants

不論使用哪個 backend，以下不變量都應成立：

- 翻譯後的 source 仍能被標準 parser 正常讀取
- metadata 與 block skeleton 不被任意改壞
- `Tags` 不被任意翻譯成另一套 label
- slug / output / canonical identity 不被任意改寫
- 作者原本的 source hierarchy 仍可辨識

## Non-Goals

以下不屬於 translation spec：

- 逐步教學式 CLI 使用手冊
- 搜尋 index schema 的完整定義
- parser 每一種 block 的完整語法細節

## Cross References

- 日常使用與指令範例：root `README.md`
- metadata 欄位契約：`docs/specs/content-metadata-spec.md`
- parser 語法：`docs/specs/parser-spec.md`
- 系統分層與 source-driven contract：`docs/specs/system-spec.md`
