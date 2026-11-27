# Agent 工作流與排程規範（Workflows）

以平台無關的 `Scope → Build → Eval → Schedule` 四階段設計、驗證並迭代 Ludwigia 的批次與自動化工作流。

## Scope → Build → Eval → Schedule

1. **Scope（收斂 v0 邊界）**：明定允許讀寫的 source（如 `notes/`、`writing/`、`data/`）與生成白名單，禁止直接手改生成器產物。
2. **Build（沿用統一 CLI）**：透過 `python3 cli.py` 子命令（`build`、`index`、`check-tags`、`build-pages`）實作，維持 Python stdlib 核心與再現性生成。
3. **Eval（先通過守門檢查）**：人工執行並通過 [evals.md](evals.md) 的測試、`--check` 與 `check-tags` 指標。
4. **Schedule（穩定後才排程）**：確認人工與 Eval 穩定通過後，再接上定期巡檢或批次任務。

## 適用場景與迭代方向（Next Directions）

- **批次內容建置與翻譯**：執行 `cli.py build-all` 或 `cli.py translate` 前後，必須搭配 `cli.py check-tags` 與 `cli.py test` 驗證 metadata 與語系對齊。
- **標籤本體巡檢**：定期跑 `cli.py check-tags` 檢查 `notes/`、`writing/`、`canvas/` 與 `data/Ontology/` 覆蓋率。
- **Toolkit 新鮮度稽核**：定期掃描 `data/Toolkit/toolkit.json` 內超過 `stale_after_days` 的資源並更新 `verified_at` 或 `status`。
- **Next Directions**：為多語翻譯與 `<information>` 掃描建立固定抽檢清單。
