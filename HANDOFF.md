# Handoff

這是給接手 Agent 的短期工作快照：只記上一個 Agent 剛停在哪裡，以及如何接續。`TODO.md` 管未完成與長期待辦，`REVIEW.md` 管已完成待作者驗收的工作；不把兩者的未指派事項搬進這裡。更新時覆寫過期資訊，不累積逐日紀錄。目標不超過 2,000 tokens；UTF-8 硬上限 6 KiB。

## 概況

- 截至：2026-11-20。為履歷連結整理門面：首頁標題改為「Ludwig Chao — Machine Learning Engineer · Research Engineer」，hero 加專業方向一行，補 `meta description` / `og:title`；手寫頁面標題收斂到 `i18n/*.json` 的 `title`，由 `cli.py build-pages` 生成 `<title>` 與 `og:title`。推薦系統系列五篇去宣傳腔、Semantic ID 篇改寫分類樹類比並新增英文版（drafting）；`ARTICLES.md` 新增 DCGR GMV 決策鏈與 SID-level MTP 兩篇 backlog。
- 最近驗證：`python3 cli.py test` 通過 75 項；`build-pages --check` 通過；本機預覽確認首頁標題、hero 與 meta。
- 本輪停點：以上已 commit 並推上 main；待作者驗收項目見 `REVIEW.md`。

## 進行中工作

無。待作者決定的事項（Semantic ID 中文版 TIGER／OneRec 年份、封面圖是否與新說法相衝、英文版何時改 `published`）已記在 `REVIEW.md`。根目錄的 `ludwigia-article-plan.md` 與 `interview-prep-*.md` 含內部資訊，刻意不納入版控。
