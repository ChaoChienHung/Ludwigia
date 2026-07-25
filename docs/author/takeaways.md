# Takeaways

這份文件收斂「做 Ludwigia 過程中反覆出現、值得保留」的工程 takeaways。

## Single Source of Truth

- 內容只寫一次（在 `<head>` metadata），其餘全靠衍生（index / UI）

## Generated Artifacts Whitelist

- 生成物不是都不能 commit：關鍵是「是否為部署必需品」
- 白名單要清楚列出，並把流程寫成 checklist（避免踩坑）

## Docs as Workflow

- 文檔不是事後補作業，而是把協作成本變低的工具
- 把決策寫成可驗收規格，Agent 才能真的落地

## Simple Core, Rich Surface

- 底層規則少而硬，表層說明短而有用
- 底層要簡單：content type、metadata、index schema 先保持最小，避免把入口層的複雜度過早灌進資料結構
- 表層可以豐富：同一份簡單底層可以衍生出不同入口、genre、collections、series 與 UI 呈現
- 複雜度若只是為了讓網站「看起來更豐富」，通常應該優先長在 view / entry layer，而不是新增底層分類

## Docs Need Compression

- 底層規則要少而硬；表層說明要短而有用
- 不是所有想法都值得寫進文檔；只有會影響日常工作流、決策一致性或不可退化約束的內容才值得留下
- 文檔一旦開始充滿重述、背景鋪陳或一次性討論，成本會比價值長得更快
- 好文檔應該幫人減少判斷，不是增加閱讀負擔

## Standard Generator

- `tools/create_content.py` 應維持為標準內容頁生成器；不同 section 只透過 `--content-dir` 與輸出路徑區分
- style 可以擴，但 parser 不應為了 presentation 膨脹成萬用 page builder
- 常見需求優先做成語意化 block（例如 `<image>`），不要把 raw HTML 當成主工作流

## Task Ownership

- 如果 task 的核心是「把東西做出來」，偏 `Agent-friendly`
- 如果 task 的核心是「決定要做成什麼樣子 / 想表達什麼」，偏 `Author-driven`

## UI Terminology

- `FAB` = `Floating Action Button`
- 在 Ludwigia 的語境裡，通常指右下角那種單一漂浮主入口；若某個新功能只是附加工具，不應輕易再長一顆新的 FAB，避免入口心智模型變亂

## Core Markdown

- Ludwigia 的 `.md` 是 extended markdown，但不是每個 view 都需要理解整份 extended markdown
- Reading Mode / Garden 這種正文視圖，只需要 `<meta>` + core markdown
- 其餘自訂 block 是 extras；可以增強完整頁，但不該成為正文視圖的必要依賴
