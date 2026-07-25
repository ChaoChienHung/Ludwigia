# Release Checklist（提交前固定流程）

目的：確保改動不會破壞 Ludwigia 的不可退化契約，並確保生成物一致性（特別是 `search/search-index.*`）。

## 0) 清理測試產物（可選）

```bash
python3 cli.py clean
```

## 1) 跑測試

```bash
python3 cli.py test
```

## 2) 重生索引（必要時）

若本次變更包含 `notes/*.html`、`search/indexer.py` 或 schema 相關邏輯，必須重生並 commit：

```bash
python3 cli.py index
git diff -- search/search-index.json search/search-index.js
```

## 3) 本機 Smoke（建議）

```bash
python3 cli.py serve --port 8000
```

檢查：

- `http://localhost:8000/index.html`
- `http://localhost:8000/garden/index.html`
- 任選一篇 `notes/**.html` / `writing/**.html` / `canvas/**.html`（確認 meta、tags、quiz、math）

## 4) Git 檢查（必要）

```bash
git status
git diff
```

## 5) Commit & Push

```bash
git add -A
git commit -m "..."
git push
```
