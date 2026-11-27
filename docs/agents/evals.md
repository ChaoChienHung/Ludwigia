# Agent 驗收與評測標準（Evals）

在把內容建置、翻譯或巡檢交給批次／排程工作流之前，先定義可驗證的驗收標準（Eval）與回歸門檻。

## 全站基礎守門

- **完整守門**：`python3 cli.py test`
- **Shell 與 Preload 同步**：`python3 cli.py build-pages --check`、`python3 -m unittest tests.test_page_shell`
- **文件與交接體積**：`python3 -m unittest tests.test_handoff`
- **Toolkit 契約**：`python3 -m unittest tests.test_toolkit_data`

## 內容與資料工作流 Eval 指標

1. **標籤與本體覆蓋率**：`python3 cli.py check-tags` 確認新增／翻譯文章皆對齊 `data/Ontology/`，無遺漏或孤立標籤。
2. **生成物再現性**：重跑 `cli.py build` / `cli.py index` 後僅影響預期頁面與部署白名單，不污染 `core/` 或未授權檔案。
3. **Toolkit 新鮮度**：依 `data/Toolkit/toolkit.json` 的 `stale_after_days`（目前 90 天）盤點超過期限或未標記來源的資源。
