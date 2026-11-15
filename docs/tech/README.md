# docs/tech/

這個資料夾用來放「技術面」的內容，也就是 What / How：實際用了什麼、資料怎麼流、實作怎麼運作、排查時該先看哪裡。

它的責任邊界是：

- `docs/specs/system-spec.md`：可驗證契約、資料流、schema、守門規則
- `docs/design/design.md`：設計理由、UI/UX 取捨與重大決策脈絡
- `docs/tech/`：技術棧、實作細節、排查筆記，偏 What / How

## 讀法

- 想先知道整個專案用什麼技術：看 `docs/tech/tech-stack.md`
- 想知道重構計畫與目前的技術債：看 `docs/tech/refactor-roadmap.md`
- 想查站內搜推怎麼運作：看 `docs/tech/search-and-recommendation.md`
- 想看站內 Copilot 的入口、fallback 與問題範圍規格：看 `docs/specs/copilot-entry-spec.md`
- 想看 `About Me` 下 timeline 的正式設計規格：看 `docs/specs/timeline-design-spec.md`
- 想回顧反覆踩過的工程結論：看 `docs/author/takeaways.md`
- 想確認「哪些東西不能退化」：回到 `AGENTS.md` 與 `docs/specs/system-spec.md`

## 文件清單

- `docs/tech/README.md`：`docs/tech/` 的入口頁
- `docs/tech/tech-stack.md`：完整技術棧（主站、內容工具鏈、Portals / Realms、Labs、部署）
- `docs/tech/refactor-roadmap.md`：技術債盤點與分階段重構計畫
- `docs/tech/portals-world-performance.md`：Portals 與 World 的效能優化紀錄、量測數據與守則
- `docs/specs/copilot-entry-spec.md`：站內 Copilot 的入口位置、入口文案、fallback 與問題範圍小規格
- `docs/tech/search-and-recommendation.md`：站內搜推的資料流、排序、推薦與已知落差
- `docs/specs/timeline-design-spec.md`：`About Me` 下 timeline 的正式設計規格（desktop/mobile、point/period、MVP interaction）
- `docs/author/takeaways.md`：重要工程 takeaways（偏結論，不是正式 contract）

## Tech Stack

完整的技術棧（各子系統、函式庫版本、CLI 指令、部署方式）已移到 `docs/tech/tech-stack.md`，以那份為準，這裡不再維護第二份摘要。
