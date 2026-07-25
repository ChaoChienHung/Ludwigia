# Skills

這個資料夾放的是「給人或 AI 助手使用的操作手冊（skill）」，每一份文件都描述一個可重複的工作流，讓輸入與輸出在 Ludwigia 的 rulebook 下保持一致。

- 專案總覽與連接機制：請先看根目錄的 `README.md`（含 Notes/Writing/Canvas → indexer → Search/Garden 的資料流）
- 搜尋/過濾語意：優先以 `core/search-core.js`（SearchCore）為準，避免跨頁規則漂移
- [markdown-to-note](./markdown-to-note/skill.md)：把一篇一般 Markdown/文章，整理成符合 Ludwigia rulebook 的 pseudo-markdown，並用 tools/create_content.py 生成可被 Garden 索引的 note.html
- [markdown-to-writing](./markdown-to-writing/skill.md)：把一篇一般 Markdown/文章，整理成符合 Ludwigia rulebook 的 pseudo-markdown，並用 `tools/create_content.py` 生成可被 Garden 索引的 `writing/**.html`
- [article-structure-extractor](./article-structure-extractor/skill.md)：給一篇好文章，逆向拆出骨架、每節功能、細項與可重用模板
- [article-structure-writer](./article-structure-writer/skill.md)：給一個既定結構、每節細項與素材，轉寫成一篇完整文章
- [release-checklist](./release-checklist/skill.md)：準備提交前的固定檢查清單（測試、索引一致性、生成物檢查）
- [sync-md-from-html](./sync-md-from-html/skill.md)：當現有 HTML 是 ground truth 時，如何回寫 `.md` 並重生 `.html` 的流程
