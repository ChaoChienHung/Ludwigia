# Skills

這個資料夾放的是「給人或 AI 助手使用的操作手冊（Skill）」，每一份 Skill 都描述一個可重複的工作流，讓輸入與輸出保持一致與高可靠性。

## 目錄結構標準

每個 Skill 為獨立資料夾，遵守 Agentic Skill 標準約定：
- 主入口：固定命名為大寫 `SKILL.md`，包含觸發時機、輸入條件、執行步驟與輸出格式。
- 複合攜帶物（可選）：可視需求攜帶 `scripts/`（輔助驗證或自動化工具）、`examples/`（示範案例與 Few-shot 示範）、`references/`（規準、查表或細部規格）。

## 現有 Skills

- 專案總覽與連接機制：請先看根目錄的 `README.md`（含 Notes/Writing/Canvas → indexer → Search/Garden 的資料流）
- 搜尋/過濾語意：優先以 `core/search-core.js`（SearchCore）為準，避免跨頁規則漂移
- [markdown-to-note](./markdown-to-note/SKILL.md)：把一篇一般 Markdown/文章，整理成符合 Ludwigia rulebook 的 pseudo-markdown，並用 tools/create_content.py 生成可被 Garden 索引的 note.html
- [markdown-to-writing](./markdown-to-writing/SKILL.md)：把一篇一般 Markdown/文章，整理成符合 Ludwigia rulebook 的 pseudo-markdown，並用 `tools/create_content.py` 生成可被 Garden 索引的 `writing/**.html`
- [article-structure-extractor](./article-structure-extractor/SKILL.md)：給一篇好文章，逆向拆出骨架、每節功能、細項與可重用模板
- [article-structure-writer](./article-structure-writer/SKILL.md)：給一個既定結構、每節細項與素材，轉寫成一篇完整文章
- [release-checklist](./release-checklist/SKILL.md)：準備提交前的固定檢查清單（測試、索引一致性、生成物檢查）
- [sync-md-from-html](./sync-md-from-html/SKILL.md)：當現有 HTML 是 ground truth 時，如何回寫 `.md` 並重生 `.html` 的流程
- [verify-and-complete](./verify-and-complete/SKILL.md)：任務驗收與交付證明（Finish Work，含 `references/` 與 `scripts/log_receipt.py`）
- [adversarial-review](./adversarial-review/SKILL.md)：紅隊對抗式獨立審查（Adversarial Review，含 `references/reviewer-contract.md`）
- [strategy-evaluator](./strategy-evaluator/SKILL.md)：方案比較與盲點挑戰（Strategy Prompt）
- [high-stakes-task](./high-stakes-task/SKILL.md)：高投入任務推進（Ambitious，含 `references/` 與 `scripts/`）
- [benchmark-climb](./benchmark-climb/SKILL.md)：測試驅動題庫跑分（Hill Climb，含 `references/` 與 `scripts/`）
- [multithread-conductor](./multithread-conductor/SKILL.md)：多執行緒實證協調（T3 Conductor，含 `references/` 與 `scripts/desk.py`）
- [session-orchestrator](./session-orchestrator/SKILL.md)：Claude 會話協同管理（Claude Conductor，含 `references/`）
- [draft-refiner](./draft-refiner/SKILL.md)：草稿規準迭代優化（Loop，含 `references/rubric-adapters.md`）
- [cost-audit](./cost-audit/SKILL.md)：訂閱與雲端用量盤點（Save 10%，含 `references/` 與 `scripts/`）
- [bounded-goal-planner](./bounded-goal-planner/SKILL.md)：自主任務邊界規劃（Goal，含 `assets/` 與 `scripts/`）
- [email-triage](./email-triage/SKILL.md)：郵件安全分類與回覆（Email Triage，含 `references/`）
