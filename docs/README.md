# Docs

這份文件是 `docs/` 的單一入口：用來說明目前的資料夾分工、快速導覽各份文檔，以及判斷某份文件應該收去哪一層。

它不取代：

- `AGENTS.md`：不可退化契約
- `README.md`：repo root 的日常使用入口
- `docs/specs/system-spec.md`：系統 spec
- `docs/specs/parser-spec.md`：source `.md` parser spec
- `docs/specs/inline-enhancement-spec.md`：正文內 inline enhancement（目前含 `information` / `content-link`）的 shared contract
- `docs/specs/content-metadata-spec.md`：內容 metadata spec
- `docs/specs/translation-spec.md`：翻譯 workflow spec
- `docs/design/design.md`：設計理由與重大決策

## 目前分層

- `docs/specs/`
  - 放可驗證 spec
  - 例如系統資料流、layout spec、明確命名為 `*-spec.md` 的文件
- `docs/design/`
  - 放設計理由、UI/UX 取捨與重大決策脈絡
- `docs/rules/`
  - 放交付規則與守門文件
  - `checklist` 管這次要跑什麼、看哪裡、怎麼驗
  - `guardrails` 管哪些底線不能退、哪些語意不能漂
- `docs/guide/`
  - 放擴充與維護 guide
- `docs/tech/`
  - 放 as-built 技術說明與實作現況
- `docs/author/`
  - 放偏作者自己回頭會看的沉澱與筆記
- `docs/miscellaneous/`
  - 放暫時不值得再細分、但也不屬於以上類別的參考資料

## 快速導覽

### Root

- `AGENTS.md`：不可退化契約（新增/重構時的第一優先校驗點）
- `README.md`：repo root 使用入口
- `TODO.md`：任務追蹤
- `docs/README.md`：`docs/` 入口與索引（本文件）

### Specs

- `docs/specs/system-spec.md`：系統分層、資料流、index schema、query/filter 語意、runtime spec、生成物策略
- `docs/specs/parser-spec.md`：extended markdown / extras / downgrade 的 parser contract
- `docs/specs/inline-enhancement-spec.md`：`information` / `content-link` 的 shared visual / interaction / downgrade contract
- `docs/specs/content-metadata-spec.md`：`<meta>` 欄位、head output、visibility / date / language / ranking metadata contract
- `docs/specs/translation-spec.md`：source-driven 翻譯 workflow 的可翻 / 不可翻欄位、命名與 credential contract
- `docs/specs/layout-spec.md`：共用 responsive layout baseline
- `docs/specs/copilot-entry-spec.md`：站內 Copilot 的入口 / fallback / 問題範圍小規格
- `docs/specs/companion-spec.md`：`Companion` 的位置、尺寸、placeholder 與 fallback baseline
- `docs/specs/timeline-design-spec.md`：`About Me` 下 timeline 的正式設計規格
- `docs/specs/skills-credentials-spec.md`：`Skills` 與 `Credentials & Honors` 資料結構、雙維度篩選與展示視窗 spec
- `docs/specs/citation-spec.md`：參考文獻（References）結構、APA/IEEE 引用格式、真實驗核與原語言留存 spec

### Design

- `docs/design/design.md`：設計理由、UI/UX 取捨與重大決策脈絡

### Rules

- `docs/rules/checklist.md`：feature 完成後的交付 / 驗收 / 手動檢查清單
- `docs/rules/guardrails.md`：不可退化底線、authoring semantics、runtime / UI 守門原則

### Guide

- `docs/guide/data-authoring-guide.md`：Timeline, Skills, Credentials 資料新增與自動化多語維護指南
- `docs/guide/language-guide.md`：多語擴充 guide / impact map
- `docs/guide/theme-palette-guide.md`：theme / palette 擴充 guide / impact map
- `docs/guide/ontology-guide.md`：tag ontology 維護手冊
- `docs/guide/companion-guide.md`：`Companion` 的擴充 impact map 與維護流程

### Tech

- `docs/tech/README.md`：技術文件入口
- `docs/tech/search-and-recommendation.md`：搜推 as-built 解釋

### Author

- `docs/author/writing-notes.md`：寫作骨架、寫作技巧與參考文章沉澱
- `docs/author/testing-notes.md`：測試分層與測試術語筆記
- `docs/author/dev-notes.md`：第一視角演進筆記
- `docs/author/takeaways.md`：偏維護者自己的工程結論與 takeaways

### Miscellaneous

- `docs/miscellaneous/visual-sources.md`：視覺參考來源與 attribution

## 一句話判斷法

- 想看「什麼不能退化」：先看 `AGENTS.md`
- 想看「系統底層怎麼定」：看 `docs/specs/system-spec.md`
- 想看「source `.md` 到底支援哪些語法」：看 `docs/specs/parser-spec.md`
- 想看「正文裡的 `information` / `content-link` 共同行為」：看 `docs/specs/inline-enhancement-spec.md`
- 想看「`<meta>` 欄位與 head/index mapping」：看 `docs/specs/content-metadata-spec.md`
- 想看「翻譯 workflow 的 source contract」：看 `docs/specs/translation-spec.md`
- 想看「參考文獻引用格式、標題與原語言留存」：看 `docs/specs/citation-spec.md`
- 想看「為什麼這樣設計 / 最後怎麼定」：看 `docs/design/design.md`
- 想看「這次改動要跑什麼 / 哪些底線不能退」：看 `docs/rules/`
- 想看「擴充某一類能力時要盤哪些檔」：看 `docs/guide/`
- 想看「目前實作實際怎麼運作」：看 `docs/tech/`
- 想看「作者自己的沉澱與筆記」：看 `docs/author/`

## 命名與存放規範

- repo root 只保留：`AGENTS.md`、`README.md`、`TODO.md`
- `docs/` 內所有文檔一律使用 kebab-case
- spec 類文檔統一以 `-spec.md` 結尾
- 若某份文件同時混了 spec 與 rules，優先把：
  - 架構 / schema / data flow / runtime 放回 `specs/`
  - 守門原則 / authoring semantics / 不可漂移語意放進 `rules/`

## 之後整理方向

- 若 `guide/` 長出更多明顯子類，可再往下拆，但優先保持 folder 名看到就知道在管什麼
- 若 `miscellaneous/` 開始變亂，再回頭做更精細分類
- 若新增、搬移、刪除或重命名文檔，優先更新本文件，再同步 `AGENTS.md` 與 root `README.md`
