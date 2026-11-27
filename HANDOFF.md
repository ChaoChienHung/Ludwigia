# Handoff

這是給接手 Agent 的短期工作快照：只記上一個 Agent 剛停在哪裡，以及如何接續。`TODO.md` 管未完成與長期待辦，`REVIEW.md` 管已完成待作者驗收的工作；不把兩者的未指派事項搬進這裡。更新時覆寫過期資訊，不累積逐日紀錄。目標不超過 2,000 tokens；UTF-8 硬上限 6 KiB（`tests/test_handoff.py` 守門；設計理由見 `docs/design/design.md` §17）。

## 2026-11-27 文章寫作與 `<draft>` 骨架

- 背景：作者先前要求逐篇修訂推薦與排序文章、擴寫 DCGR GMV 篇、將 AWS Machine Learning Course 改為 `drafting`；最新要求讓所有明確 `Status: published` 的 `<draft>` 章節標題與轉場標記一致。
- 現況：19 篇已發布 source 的 `<draft>` 保留 `TLDR / NarrativeArc / Scope` 與選填 `FollowUps`，章節標題統一為 `- 段落角色｜核心主張：內容`，移除 `- 1.` 等重複編號；逐篇補開頭、承先、啟後、結尾與適用證據（英文稿用英文標記）。已更新 `docs/author/writing-notes.md`、內容契約與結構測試；19 篇編譯至暫存輸出、完整測試 77 項通過，`<draft>` 外內容未改。前一輪 DCGR 正文已改成前情提要、介紹、白話原理、自行分析的局限、範式理解與未來展望；AWS 維持 `drafting`，搜尋索引不收錄。
- 待解問題：作者尚須全盤 proofread DCGR 的語氣、技術分寸與公開邊界，並抽讀這輪 19 篇骨架的轉場是否符合自己的論證判斷；其餘三篇新作仍待逐篇修訂。對外部署或履歷引用 DCGR 前依既定流程給主管確認。
- 下一步：依作者對骨架與文章的回饋逐篇調整；DCGR 改稿待作者閱讀；未另行 deploy。

## 工作區既有未提交檔案

- 背景：根目錄 `ludwigia-article-plan.md` 和 `notes/business-recsys-and-generative-retrieval-practice/` 是既有未追蹤內容。
- 現況：規劃稿與新筆記含內部素材，維持既有未提交狀態；本輪不納入提交。
- 待解問題：無。
- 下一步：無。
