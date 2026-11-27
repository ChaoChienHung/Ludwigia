# Handoff

這是給接手 Agent 的短期工作快照：只記上一個 Agent 剛停在哪裡，以及如何接續。`TODO.md` 管未完成與長期待辦，`REVIEW.md` 管已完成待作者驗收的工作；不把兩者的未指派事項搬進這裡。更新時覆寫過期資訊，不累積逐日紀錄。目標不超過 2,000 tokens；UTF-8 硬上限 6 KiB（`tests/test_handoff.py` 守門；設計理由見 `docs/design/design.md` §17）。

## 2026-11-27 文章寫作與 `<draft>` 骨架

- 背景：作者先前要求逐篇修訂推薦與排序文章、擴寫 DCGR GMV 篇、將 AWS Machine Learning Course 改為 `drafting`；最新要求把所有明確 `Status: published` 的 `<draft>` 統一成三個必填欄位、選填 FollowUps 與可讀的章節骨架。
- 現況：19 篇已發布 source 的 `<draft>` 全部採 `TLDR / NarrativeArc / Scope`，移除 `OutOfScope`，短稿補逐節骨架，長稿保留原有素材並補同級項目空行；`docs/author/writing-notes.md`、相關契約／指南及 `AGENTS.md` 已同步，新增結構測試。DCGR 正文依作者最新定位再改成五段：前情提要、介紹、白話原理、自行分析的局限、範式理解與未來展望；引用九老師文章承接詳細推導，移除未公開配置與內部動機推測；AWS 維持 `drafting`，搜尋索引不收錄。本次已用 `cli.py build` 重生 DCGR HTML 與搜尋索引，`cli.py test` 77 項、`check-tags` 與 `git diff --check` 通過。
- 待解問題：作者尚須全盤 proofread DCGR 的語氣、技術分寸與公開邊界，並抽讀這輪 19 篇草稿骨架；其餘三篇新作仍待逐篇修訂。對外部署或履歷引用 DCGR 前依既定流程給主管確認。
- 下一步：依作者對骨架與文章的回饋逐篇調整；本次改稿待作者閱讀；已提交並 push，未另行 deploy。

## 工作區既有未提交檔案

- 背景：開工時已有 `docs/author/writing-notes.md` 修改、根目錄 `ludwigia-article-plan.md` 和 `notes/business-recsys-and-generative-retrieval-practice/` 未追蹤內容。
- 現況：本輪在既有 `writing-notes.md` 修改上追加 `<draft>` 指引，未覆蓋原有變更；規劃稿與新筆記含內部素材，維持既有未提交狀態。
- 待解問題：無。
- 下一步：無。
