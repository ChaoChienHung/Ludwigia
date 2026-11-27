# Docs（功能與文件導覽）

這裡按功能指出「先讀什麼」與「實作大致在哪裡」。所有人共用的術語、日常工作流與資料夾責任，先看根目錄 `README.md` 的「專案術語（Terminology）」與「Repository Map（程式庫導覽）」；Agent 的長期約束看 `AGENTS.md`，最近停點看 `HANDOFF.md`，未完成任務看 `TODO.md`，已完成待驗收的工作看 `REVIEW.md`。本頁不是逐檔清單。

## 功能導覽

先依功能找到相關資料夾與起始文件，再沿文件中的引用讀精確契約。表內列主要入口，不代表該功能只會修改這些位置。
「主要資料夾」沿用根目錄 README 的 Repository Map 名稱；只有功能邊界確實落在子系統時才補到下一層目錄。

| 功能／工作範圍 | 主要資料夾 | 從這裡開始讀 |
| --- | --- | --- |
| 內容撰寫、生成、翻譯與引用 | `notes/`、`writing/`、`canvas/`、`tools/`、`search/` | [guide/content-workflow-guide.md](guide/content-workflow-guide.md)、[rules/content-authoring-contracts.md](rules/content-authoring-contracts.md)、[specs/parser-spec.md](specs/parser-spec.md)、[specs/content-metadata-spec.md](specs/content-metadata-spec.md)；寫作心法見 [author/writing-notes.md](author/writing-notes.md)。 |
| 搜尋、tag 與 Garden 探索 | `search/`、`core/`、`pages/`、`tag/`、`portals/realms/garden/` | [tech/search-and-recommendation.md](tech/search-and-recommendation.md)、[specs/system-spec.md](specs/system-spec.md)。 |
| 首頁 Timeline、Skills、Credentials | `data/`、`assets/` | [guide/data-authoring-guide.md](guide/data-authoring-guide.md)、[rules/ui-and-data-contracts.md](rules/ui-and-data-contracts.md)；契約見 [specs/timeline-design-spec.md](specs/timeline-design-spec.md)、[specs/skills-credentials-spec.md](specs/skills-credentials-spec.md)。 |
| 主站外觀、設定、導覽與助手 | `core/`、`assets/`、`i18n/`、`pages/` | [rules/ui-and-data-contracts.md](rules/ui-and-data-contracts.md)、[guide/theme-palette-guide.md](guide/theme-palette-guide.md)、[specs/layout-spec.md](specs/layout-spec.md)；助手入口見 [specs/copilot-entry-spec.md](specs/copilot-entry-spec.md)。 |
| Portals、Realms 與 Pensieve | `portals/` | `portals/AGENTS.md`、[specs/realm-spec.md](specs/realm-spec.md)、[specs/isometric-world-spec.md](specs/isometric-world-spec.md)；Pensieve 簡介見 `portals/realms/pensieve/README.md`；效能現況見 [tech/portals-world-performance.md](tech/portals-world-performance.md)。 |
| Labs、Toolkit 與可重用 Skills | `labs/`、`data/Toolkit/`、`skills/` | [specs/system-spec.md](specs/system-spec.md) 的 Toolkit 契約與 [design/design.md](design/design.md) 的入口分工。 |
| 建置、測試與交付 | `tools/`、`tests/`、各子系統 source | [tech/tech-stack.md](tech/tech-stack.md)、[rules/checklist.md](rules/checklist.md)、[rules/guardrails.md](rules/guardrails.md)。 |
| Agent 工作交接、任務追蹤與自動化規範 | repo root、`docs/agents/`、`data/Toolkit/` | `AGENTS.md` 管根級規則與契約分流；`docs/agents/`（[guardrails.md](agents/guardrails.md)、[provenance.md](agents/provenance.md)、[evals.md](agents/evals.md)、[workflows.md](agents/workflows.md)）管工具無關的護欄、踩坑紀錄、Eval 與工作流；`HANDOFF.md` 管最近停點；`TODO.md` 管未完成與長期待辦；`REVIEW.md` 管已完成待作者驗收。Toolkit 範本在 `data/Toolkit/resources/`。 |

## 文件層的責任

| 資料夾 | 放什麼 |
| --- | --- |
| `docs/specs/` | 可驗證的架構、schema、資料流與行為契約。 |
| `docs/design/` | 設計理由、取捨與重大決策。 |
| `docs/rules/` | 長期守門原則與本次交付檢查。 |
| `docs/guide/` | 作者與維護者可重複執行的操作流程。 |
| `docs/tech/` | 已實作的技術棧、排查資訊與效能紀錄。 |
| `docs/author/` | 作者的寫作、測試與演進筆記。 |
| `docs/agents/` | 工具無關的 Agent 工作流、軟硬護欄邊界、踩坑紀錄與 Eval-first 自動化規範。 |
| `docs/miscellaneous/` | 暫時不屬於以上類別的參考資料。 |

跨層文件各守職責：`README.md` 回答「這是什麼、去哪裡找」；spec 回答「精確規則是什麼」；guide 回答「怎麼維護」；tech 回答「目前怎麼實作」；`AGENTS.md` 回答「Agent 不能破壞什麼、執行時怎麼做」；`HANDOFF.md` 回答「上一個 Agent 剛停在哪裡」；`TODO.md` 與 `REVIEW.md` 分別追蹤待做與待驗收。

## 維護方式

- 新增或修改一般檔案時，只更新實際受影響的文件；不維護完整逐檔索引。
- 功能的主要歸屬或起始文件改變時，更新上方「功能導覽」；資料夾責任改變時，同步更新根目錄 `README.md` 的 Repository Map。
- `docs/` 內文件使用 kebab-case；spec 以 `-spec.md` 結尾。架構、schema、資料流與 runtime 放 `specs/`；守門原則與不可漂移語意放 `rules/`。
