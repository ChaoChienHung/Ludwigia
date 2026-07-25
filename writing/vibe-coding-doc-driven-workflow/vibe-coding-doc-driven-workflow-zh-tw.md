<meta>
Title: Doc-driven vibe-coding：如何用文檔整理 repo，讓 vibe-coding 可持續
Tags: Vibe Coding, Agentic AI, Documentation, Workflow, Productivity
Summary: 把想法變成可驗收規格，並用文檔分層把協作成本壓低：一套能長期維護的 doc-driven vibe-coding 工作流。
Slug: vibe-coding-doc-driven-workflow-zh-tw
Output: writing/vibe-coding-doc-driven-workflow/vibe-coding-doc-driven-workflow-zh-tw.html
Style: default
EstimatedReadingTime: true
Lang: zh-Hant
TitleSuffix: false
Status: drafting
Published: 2026-06-09
</meta>

# Doc-driven vibe-coding：如何用文檔整理 repo，讓 vibe-coding 可持續

目標：10–15 分鐘可讀完；如果超過，拆成下一篇或拆成兩個章節。

## Setup：先把文檔職責分層

- Contract：什麼永遠不能退化（例如 Single Source of Truth）
- System：資料流 / schema / guardrails（可驗證）
- Design：UI/UX 的取捨與原則（Why）
- DevNotes：決策記錄（Decision Records）
- How-to：日常操作流程（跑站、生成索引、更新文件）

## Setup：把決策理由寫下來（給協作者與未來的我）

- 讓協作者知道「我們在做什麼」與「為什麼這樣做」，避免重複討論同一個問題
- 讓未來的我能快速回到當時的脈絡，避免只看到結論卻不知道取捨
- 把理由與規則放到對應的文檔分層，避免 README/AGENTS 變成大雜燴

## Workflow：想法 → TODO → 實作 → 驗收 → 文件同步（走一輪）

- 想法：先用一段話說清楚「行為」與「影響範圍」
- TODO：把任務寫成可驗收的 checklist（含交付條件）
- 實作：只動必要的檔案，維持 Single Source of Truth
- 驗收：最少用例 + 反例（不破壞既有行為）
- 文件同步：把新的規則放到對的位置（避免漂移）

## Agent-friendly：把任務改寫成可委派任務

- 把「主觀偏好」改成「可選項」並提前列出 trade-offs
- 把「規則」寫成「可勾選的守門清單」
- 把「完成定義」寫成「可跑、可重現、可回歸」的驗收條件
- 把「討論」收斂成 1–2 個明確決策點，避免來回

## Tooling：最小工具鏈

- Python indexer（生成 `search/search-index.{json,js}`）
- 靜態伺服器（避免 `file://` 限制）
- 生成物策略：白名單 commit，其餘全部 ignore

## Pitfalls：常見踩坑

- 忘記更新 search index（導致 UI/搜尋跟內容不同步）
- 把 build output commit 進 repo（造成噪音與衝突）
- 規則散落各處（大家都以為在「文件」但其實不一致）
