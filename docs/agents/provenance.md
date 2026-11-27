# 實驗與踩坑紀錄（Provenance & Failure Log）

持續追加的紀錄檔：每次把重複錯誤轉成自動化測試或調整 Agent 工作流邊界時，記錄「原本怎麼做、哪裡踩坑、最後確立什麼護欄」，讓不同模型或新對話接手時都能快速理解規範由來。

| 日期 | 工作流／改動 | 發生過的問題或漂移 | 解法／確立的護欄 |
| --- | --- | --- | --- |
| 2026-11-27 | `AGENTS.md` 規模控制與分流 | 根目錄 `AGENTS.md` 若持續累積細則，容易超過工具讀取上限而遭截斷。 | 透過 `tests/test_handoff.py` 強制限制根目錄 `AGENTS.md <= 12 KiB`、`HANDOFF.md <= 6 KiB`，詳細契約分流至 `docs/rules/`、`portals/AGENTS.md` 與 `docs/agents/`。 |
| 2026-11-27 | `Toolkit` 多語與欄位契約 | `data/Toolkit/toolkit.json` 若漏掉三語欄位、對應檔案或 `verified_at`/`verified_with` 成對設定，前台篩選與下載會靜默壞掉。 | 由 `tests/test_toolkit_data.py` 在測試階段直接檢查 schema、檔案存在與 `{{...}}` slot 格式。 |

<!-- 後續有新的踩坑與護欄調整，請依格式往上追加。 -->
