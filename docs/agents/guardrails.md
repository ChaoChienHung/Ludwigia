# Agent 護欄規範（Guardrails）

本文件補充根目錄 [AGENTS.md](../../AGENTS.md)（維持 12 KiB 上限與契約分流），說明跨工具通用（Antigravity、Claude Code、Codex、Cursor 皆適用）的軟硬護欄分層。它與 [docs/rules/guardrails.md](../rules/guardrails.md) 的分工：`rules/guardrails.md` 聚焦**產品、UI 與資料的不可退化清單**；本文件聚焦 **Agent 協作與自動化的軟硬護欄邊界**。

## 軟規則 vs. 硬護欄

| 層級 | 適用內容 | 在 Ludwigia 的落點 |
| --- | --- | --- |
| **軟規則（文字規範）** | 寫作視角與篇幅對齊、探索節奏、取捨與溝通風格 | `AGENTS.md`、`docs/author/writing-notes.md`、`docs/rules/checklist.md` |
| **硬護欄（確定性檢查）** | 頁面 shell 同步、Toolkit JSON 契約、`AGENTS.md`/`HANDOFF.md` 大小上限、Git hooks 與全站回歸測試 | `python3 cli.py test`、`tests/test_page_shell.py`、`tests/test_toolkit_data.py`、`tests/test_handoff.py`、`python3 cli.py build-pages --check`、`python3 cli.py install-hooks` |

## 不可退化邊界

- **SSOT 與生成物分離**：不手改生成器產出的 HTML、搜尋索引或 shell 區塊，改動 source 後統一透過 `cli.py` 重建。
- **把重複錯誤變成可執行檢查**：遇同類回歸時，優先補強資料流或單元測試，不把每條細碎意見無止境堆進根目錄 `AGENTS.md`。
