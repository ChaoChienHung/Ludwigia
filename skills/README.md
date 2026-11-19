# Skills

這個資料夾放的是「給人或 AI 助手使用的操作手冊（Skill）」，每一份 Skill 都描述一個可重複的工作流，讓輸入與輸出保持一致與高可靠性。Labs Toolkit 直接讀這裡的 `SKILL.md`，目錄文案與引用來源由 `data/Toolkit/toolkit.json` 維護，不在這裡複製第二份。

## 目錄結構標準

每個 Skill 為獨立資料夾，遵守 Agent Skills 標準約定：

- 主入口：固定命名為大寫 `SKILL.md`，開頭是 YAML frontmatter：
    - `name`：與資料夾名稱相同的 kebab-case 名稱。
    - `description`：一段英文，先說做什麼，再以 `Use when ...` 說明觸發時機。
- 正文：frontmatter 後接一個 `# Title`，再接一段說明目標的開場；其餘章節依工作流需要組織。
- 附帶資源（可選）：`scripts/`（輔助驗證或自動化工具）、`references/`（規準、查表或細部規格）、`assets/`（範本）、`examples/`（示範案例）、`agents/openai.yaml`（Codex 介面設定）。

## Ludwigia Skills

本站原創，正文以中文撰寫。搜尋/過濾語意以 `core/search-core.js`（SearchCore）為準；內容資料流（Notes/Writing/Canvas → indexer → Search/Garden）見根目錄 `README.md`。

- [article-structure-extractor](./article-structure-extractor/SKILL.md)：給一篇好文章，逆向拆出骨架、每節功能、細項與可重用模板。
- [article-structure-writer](./article-structure-writer/SKILL.md)：給一個既定結構、每節細項與素材，轉寫成一篇完整文章。
- [markdown-to-note](./markdown-to-note/SKILL.md)：把一般 Markdown 文章整理成符合 rulebook 的 pseudo-markdown，並用 `tools/create_content.py` 生成可被 Garden 索引的 note。
- [markdown-to-writing](./markdown-to-writing/SKILL.md)：同上，生成 `writing/**.html`。
- [nus-soc-slurm](./nus-soc-slurm/SKILL.md)：在 NUS SoC Slurm 叢集提交、監看與排解 GPU job，含節點故障判斷、透過 Git 交換 log、同時跑多個 job。
- [release-checklist](./release-checklist/SKILL.md)：提交前的固定檢查清單（測試、索引一致性、生成物檢查）。
- [sync-md-from-html](./sync-md-from-html/SKILL.md)：當現有 HTML 是 ground truth 時，回寫 `.md` 並重生 `.html` 的流程。

## 引用 Skills

引用自 [lennoxsaint/Skills](https://github.com/lennoxsaint/Skills)，正文維持原文（英文）。名稱已依用途完整改名：資料夾、`name`、標題、`agents/openai.yaml` 的呼叫名稱、Skill 之間的互相引用，以及腳本的狀態資料夾與環境變數都用新名稱；括號內保留上游名稱與原始來源連結。上游以 MIT License 授權，版權聲明見 [NOTICE-lennoxsaint-skills.md](./NOTICE-lennoxsaint-skills.md)。

- [adversarial-review](./adversarial-review/SKILL.md)：紅隊對抗式獨立審查（上游：[adversarial-review](https://github.com/lennoxsaint/Skills/tree/main/adversarial-review)）。
- [benchmark-climb](./benchmark-climb/SKILL.md)：以真實資料建立鎖定題庫並跑分爬升（上游：[hill-climb](https://github.com/lennoxsaint/Skills/tree/main/hill-climb)）。
- [bounded-goal-planner](./bounded-goal-planner/SKILL.md)：把計畫轉成有邊界的自主執行目標（上游：[goal](https://github.com/lennoxsaint/Skills/tree/main/goal)）。
- [council-review](./council-review/SKILL.md)：三家 AI 實驗室的模型評審同一版本，循環到全數過關（上游：[council](https://github.com/lennoxsaint/Skills/tree/main/council)）。
- [cost-audit](./cost-audit/SKILL.md)：訂閱與雲端用量盤點（上游：[save-10-percent](https://github.com/lennoxsaint/Skills/tree/main/save-10-percent)）。
- [draft-refiner](./draft-refiner/SKILL.md)：依 100 分規準迭代修改草稿（上游：[loop](https://github.com/lennoxsaint/Skills/tree/main/loop)）。
- [email-triage](./email-triage/SKILL.md)：郵件安全分類與回覆草稿（上游：[email-triage-pro](https://github.com/lennoxsaint/Skills/tree/main/email-triage-pro)）。
- [high-stakes-task](./high-stakes-task/SKILL.md)：高投入任務推進並由外部評審驗收（上游：[ambitious](https://github.com/lennoxsaint/Skills/tree/main/ambitious)）。
- [multithread-conductor](./multithread-conductor/SKILL.md)：協調多個 T3 Code 執行緒（上游：[t3-code-conductor](https://github.com/lennoxsaint/Skills/tree/main/t3-code-conductor)）。
- [session-orchestrator](./session-orchestrator/SKILL.md)：協調既有的 Claude Code 會話直到完成（上游：[claude-conductor](https://github.com/lennoxsaint/Skills/tree/main/claude-conductor)）。
- [ship-ready](./ship-ready/SKILL.md)：做完、驗證、通過評審團並備妥寄送或合併，停在最後一步交還（上游：[ship-ready](https://github.com/lennoxsaint/Skills/tree/main/ship-ready)）。
- [strategy-evaluator](./strategy-evaluator/SKILL.md)：方案比較與盲點挑戰（上游：[strategy-prompt](https://github.com/lennoxsaint/Skills/tree/main/strategy-prompt)）。
- [verify-and-complete](./verify-and-complete/SKILL.md)：任務驗收與交付證明（上游：[finish-work](https://github.com/lennoxsaint/Skills/tree/main/finish-work)）。
