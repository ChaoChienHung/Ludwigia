# Handoff

這是給接手 Agent 的短期工作快照：只記上一個 Agent 剛停在哪裡，以及如何接續。`TODO.md` 管未完成與長期待辦，`REVIEW.md` 管已完成待作者驗收的工作；不把兩者的未指派事項搬進這裡。更新時覆寫過期資訊，不累積逐日紀錄。目標不超過 2,000 tokens；UTF-8 硬上限 6 KiB。

## 概況

- 截至：2026-11-19。已完成 Skills 命名標準化（`SKILL.md`）、Toolkit 測試解耦、File Tabs 介面實作，並引進 11 個通用 Agent Skills 與功能直觀重構。文檔方面已移除 `README.md` 冗餘的 `TL;DR` 章節，將 `專案術語` 改為更俐落易讀的條列式定義清單（`- **Term**：Definition`），並重構 Repository Map 為結構清晰的 Tree View 與清理段落污染；在 `AGENTS.md` 加入文檔全局連貫與清單留白硬約束。
- 最近驗證：`python3 cli.py test` 通過 70 項測試；`node tests/js/runtime_smoke.cjs` 通過；`python3 cli.py build-pages --check` 通過；`test_toolkit_data` 與 `test_handoff` 通過。
- 本輪停點：Skills 目錄、Toolkit 資料、README.md 結構整頓已全部就緒，沒有尚待續做的 Agent 任務。

## 進行中工作

無。下一位 Agent 依新的使用者請求開始；不要把 `TODO.md` 或 `REVIEW.md` 的未指派條目自動視為本輪續作。
