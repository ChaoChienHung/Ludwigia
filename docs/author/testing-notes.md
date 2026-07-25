# Testing Notes

這份文件是作者自己的測試筆記，用來整理常見測試術語、它們在 Ludwigia repo 內比較接近什麼意思，以及每次改動時怎麼決定要跑到哪一層。

它不是正式測試規格；正式的交付檢查與守門項目，仍以 `docs/rules/checklist.md`、`docs/rules/guardrails.md` 與相關 spec / guide 文件為準。

## 為什麼記這份

- 外面的測試術語很多，但不同團隊講的 `smoke`、`sanity`、`regression`、`full test` 常常不完全一樣
- 這個 repo 同時有 parser / generator / index / theme / UI / static-site workflow，不是只有一種測試
- 先把語意對齊，之後比較不會每次都重複想「這次到底該跑到哪裡」

## 先記一個原則

- `full test` 不是教科書裡特別穩定的標準術語，在這個 repo 裡可以把它理解成「這次改動需要的完整驗證組合」
- 所以不要把 `full test` 當成某一條固定命令；它更像是一個 bundling 概念

## 這個 repo 內怎麼理解

### Smoke Test

- 核心問題：站還活著嗎？最主要的流程有沒有直接壞掉？
- 適合：部署前後、改動範圍很廣時、懷疑某次改動把入口搞壞時
- 在這個 repo 通常會包含：
  - `python3 cli.py test`
  - 打開 `index.html`、`pages/search.html`、`garden/index.html`
  - 至少確認一篇 `notes` 或 `writing` 單篇頁可打開

### Sanity Test

- 核心問題：我這次剛改的那塊，看起來還合理嗎？
- 適合：小改動、局部修 bug、快速確認 patch 沒歪掉
- 和 smoke 的差別：
  - smoke 偏「整體站有沒有冒煙」
  - sanity 偏「這次改的功能是否仍符合預期」
- 例子：
  - 只改 tag ontology 時，快速跑 `python3 cli.py check-tags`
  - 只改某個 settings control 時，手動打開對應頁面看 active / hover / fallback 是否正常

### Regression Test

- 核心問題：以前修過的 bug，這次有沒有回來？
- 適合：改到高風險區、改到曾經出過問題的地方、重構共用邏輯時
- 在這個 repo 常見的 regression target：
  - `search/search-index` 更新後的入口頁表現
  - nested path / `file://` / 本機靜態伺服器之間的路徑行為
  - tag detail、search filter、section landing 的資料流
  - theme / settings / reading mode 這種容易互相影響的 runtime
- 若某個 bug 已知很容易回來，優先補自動化測試或至少把它寫進 `docs/rules/checklist.md`

### Full Test

- 在這個 repo 裡，把它理解成「這次改動需要的完整驗證套餐」
- 通常會由下面幾層組成：
  1. self-test / parser contract
  2. unit test
  3. workflow smoke test
  4. 與本次改動直接相關的人工檢查
- 常見組合：
  - `python3 tools/create_content.py --self-test`
  - `python3 -m unittest`
  - `python3 cli.py test`
  - 視情況補 `python3 cli.py check-tags`
  - 再加上 `docs/rules/checklist.md` 裡與本次改動直接相關的人工檢查

## 和現有命令的對照

- `python3 tools/create_content.py --self-test`
  - 偏 parser / generator contract
  - 比較像 full test 裡的一環，不單獨等於 smoke
- `python3 -m unittest`
  - 偏 unit / regression 基礎層
  - 改 parser、indexer、共用邏輯時特別重要
- `python3 cli.py test`
  - 比較接近 repo 常用的 workflow smoke test
  - 適合在改動後做一輪「核心工作流還活著」的確認
- `python3 cli.py check-tags`
  - 偏 tag / ontology / locale 相關的 sanity 或 regression test

## 一個簡單判斷法

- 如果你只是想知道「站有沒有整個壞掉」：先做 smoke test
- 如果你只是想知道「我剛改的這一塊有沒有明顯歪掉」：做 sanity test
- 如果你在碰曾經壞過的路徑：把 regression test 放進來
- 如果你準備交付或收尾：把這次需要的全部組合起來，當成 full test

## 對 STLC 的暫時理解

- `STLC` 比較像一個流程觀：需求分析 → 測試規劃 → 設計測試案例 → 執行 → 驗證與結案
- 這份筆記先不打算把 Ludwigia 寫成完整 STLC 手冊
- 目前更實用的是先把術語對齊，讓每次改動時知道該挑哪一層驗證
- 若之後真的常用到，再把這份筆記往「repo 內測試策略」收斂
