<meta>
Title: Doc-driven vibe-coding：效率提升後，為什麼反而更累？
Tags: Vibe Coding, Agentic AI, Documentation, Productivity, Reflection
Summary: 當大量實作被自動化，工作日會變成「高密度決策 + 高頻切換」；文檔能放大效率，但也會放大疲憊與失控風險。
Slug: vibe-coding-doc-driven-reflection-zh-tw
Output: writing/vibe-coding-doc-driven-reflection/vibe-coding-doc-driven-reflection-zh-tw.html
Style: default
EstimatedReadingTime: true
Lang: zh-Hant
TitleSuffix: false
Status: drafting
Published: 2026-06-09
</meta>
<draft>
- 核心摘要與問題意識
    - 當大量實作被自動化，工作日會變成「高密度決策 + 高頻切換」；文檔能放大效率，但也會放大疲憊與失控風險。
- Observation：為什麼有 Agent 後文檔必然變多
    - - 協作需要明確對齊：沒有文字，規則會變成默契與記憶
    - - 任務拆更細：每個小任務都需要「完成定義」與「影響範圍」
- Behavior shift：我的自學 / 寫作 / 整理習慣怎麼變
    - - 從「只記內容」→ 也記「工作流」與「決策」
    - - 從「想到再做」→ 先把 TODO 寫成可驗收規格
- Trade-offs：文檔帶來的成本與回收
    - - 文檔與注意力的競爭：寫文檔本身也會消耗能量
- Heuristics：避免文檔失控的分層與裁剪
    - - Contract（AGENTS）：只放不可退化規則
    - - System：只放可驗證的約定（schema / data flow / guardrails）
</draft>


# Doc-driven vibe-coding：效率提升後，為什麼反而更累？

目標：10–15 分鐘可讀完；如果超過，拆成下一篇或拆成兩個章節。

## Observation：為什麼有 Agent 後文檔必然變多

- 協作需要明確對齊：沒有文字，規則會變成默契與記憶
- 任務拆更細：每個小任務都需要「完成定義」與「影響範圍」
- 速度變快：錯一次的代價更高，所以更需要 guardrails

## Behavior shift：我的自學 / 寫作 / 整理習慣怎麼變

- 從「只記內容」→ 也記「工作流」與「決策」
- 從「想到再做」→ 先把 TODO 寫成可驗收規格
- 從「做完才整理」→ 把整理當成過程的一部分

## Trade-offs：文檔帶來的成本與回收

- 什麼時候值得寫
- 什麼時候不值得寫
- 文檔與注意力的競爭：寫文檔本身也會消耗能量

## Heuristics：避免文檔失控的分層與裁剪

- Contract（AGENTS）：只放不可退化規則
- System：只放可驗證的約定（schema / data flow / guardrails）
- Design：只放 Why（取捨、原則、反例）
- DevNotes：只放決策記錄（每次重大變更的前因後果）
- Content（writing）：把「方法論/觀點」寫成可讀文章，避免把 README 變成大雜燴
