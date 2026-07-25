# Copilot Entry Spec

這份文件收斂 `站內 Copilot / 對話式導覽入口` 的第一版小規格。

它只回答三件事：

- `Copilot` 應該放在哪裡
- 第一版應該怎麼說話
- 當沒有模型 / API 可用時，應該怎麼 fallback

這份 spec 故意不擴成完整技術方案。

它不是：

- LLM integration spec
- RAG / indexing pipeline spec
- 完整聊天產品 PRD

## 1. 功能定位

第一版 Copilot 的定位是：

- `conversational entry`
- `site guide`
- `information navigator`

它的責任不是取代整個網站導覽，而是幫使用者在「不知道從哪裡開始」時，多一個自然語言入口。

### 1.1 它要回答的問題

- `contact 在哪裡？`
- `我想看文章，先看哪幾篇？`
- `有沒有在講某個主題？`
- `About Me / Projects / Notes / Writing 分別在哪裡？`
- `如果我想快速了解這個網站，應該先去哪裡？`

### 1.2 它不該做的事

- 不應假裝自己是萬能聊天機器人
- 不應取代原本 search / 導覽系統
- 不應為了回答問題而捏造站內不存在的內容
- 不應要求另外手維護一份 FAQ 當唯一知識來源

## 2. 入口位置

### 2.1 第一版建議

第一版入口放在：

- `misc / More` 裡的一個選項

而不是：

- top navbar 主列
- 額外新增一顆獨立 FAB
- 內容頁各自長一套平行入口

### 2.2 為什麼放在 misc / More

- 它目前比較像 `additional utility`，不是主導航分類
- 使用者通常會先瀏覽網站，再決定是否需要對話式幫助
- 放進 `misc / More` 能避免入口層級過早膨脹
- 也符合目前 Ludwigia 對「單一角落、單一附加入口」的心智模型

### 2.3 未來升格條件

只有在以下條件成立時，才考慮把 Copilot 升成更主要入口：

- 實際使用證明它是高頻入口
- 問答品質足夠穩定
- 它能清楚補足 search，而不是只是另一個失焦入口

## 3. 入口文案

第一版入口文案要明確、自然，不要太像平台級 AI 產品。

### 3.1 推薦文案

優先推薦：

- `Ask Ludwig`

備選：

- `Site Copilot`
- `Ask This Website`

### 3.2 為什麼優先 `Ask Ludwig`

- 它比較符合 personal website 的語氣
- 比 `Site Copilot` 少一點產品後台感
- 比 `Ask This Website` 更像對這個站的主人 / persona 提問

### 3.3 不建議文案

- `AI Chat`
- `Assistant`
- `Help Bot`

原因：

- 太 generic
- 太像平台預設元件
- 會削弱 personal website 的個人語氣

## 4. 可回答的問題範圍

第一版應刻意收斂範圍。

### 4.1 P0 問題類型

- `site navigation`
  - 首頁、About、Projects、Notes、Writing、Canvas、Search、Settings 在哪裡
- `contact lookup`
  - 聯絡方式在哪裡
- `content discovery`
  - 想看文章 / writing / notes，應該去哪裡
- `topic routing`
  - 如果使用者提某個關鍵字，應該導去哪個 section 或 search 頁面

### 4.2 P1 問題類型

- `basic recommendation`
  - 想快速了解 Ludwigia，先看什麼
  - 想看某類主題，先從哪裡進

### 4.3 先不要做

- 深度摘要整站內容
- 即時生成超長回答
- 幫使用者做多輪研究式對話
- 自動回答站內沒有明確 source of truth 的個人資訊

## 5. 回答策略

第一版回答應偏：

- 短
- 清楚
- 可導航

而不是：

- 華麗
- 冗長
- 過度 conversational

### 5.1 理想回答形狀

一個好的回答應該包含：

- 一句直接回答
- 一到兩個明確入口
- 若有需要，再補一句引導

例如：

> 聯絡方式在首頁 `About Me` 下方的 `Contact` 區塊。  
> 你也可以直接打開 `index.html#contact`，或先去 `Search` 頁再找 `contact`。

## 6. Fallback 規則

### 6.1 核心原則

如果目前模型 / API 無法幫忙：

- 不要輸出模糊答案
- 不要硬猜
- 不要裝懂

而是直接說明：

- 目前無法協助這個問題
- 並提供 `Search` 頁作為替代入口

### 6.2 推薦 fallback 文案

推薦版本：

> 我目前沒辦法直接幫你回答這個問題。  
> 你可以先到 `Search` 頁看看，我會建議從那裡搜尋相關關鍵字。

較完整版本：

> 我目前沒辦法可靠地幫你回答這個問題，所以先不亂猜。  
> 你可以改用站內的 `Search` 頁面搜尋相關關鍵字，通常會比我現在直接回答更準。

### 6.3 Fallback 行為

fallback 時應至少提供：

- `pages/search.html`
- 可選的建議關鍵字

例如：

- `contact`
- `writing`
- `projects`
- `about`

## 7. Source of Truth

第一版 Copilot 回答應只依賴已存在的 source of truth。

優先資料來源：

- `search/search-index.{json,js}`
- 首頁 `About / Contact`
- `pages/projects.html`
- `notes/`
- `writing/`
- `canvas/`

原則：

- 不另外手維護第二份 FAQ
- 不把 Copilot 自己變成知識真相來源

## 8. 與 Search 的關係

Copilot 與 Search 應是互補，不是互相取代。

### 8.1 Search

適合：

- keyword lookup
- list browsing
- 快速掃描結果

### 8.2 Copilot

適合：

- 不知道該去哪裡時的引導
- 問「我現在應該先看哪個入口」
- 問「這類資訊通常在哪裡」

### 8.3 決策原則

當 Copilot 沒把握時：

- 優先導回 Search

而不是：

- 繼續用低信心答案硬撐

## 9. Base Copilot / Companion 邊界

目前實作收斂成兩層：

- `Base Copilot`
  - 固定位置
  - 不可拖曳
  - 永遠只有一個 avatar 入口
  - 點擊後只打開極簡 chat sheet
  - 若功能尚未開放，直接導回 `pages/search.html`
- `Companion`
  - 繼承 `Base Copilot` 的 avatar、sheet、fallback copy 與 anchor 位置
  - 額外增加拖曳 reposition 與 reset position
  - 開啟時取代原本固定版 Copilot，而不是另外再長第二套入口

責任切分原則：

- `Base Copilot` 負責「站內固定對話入口」
- `Companion` 負責「在同一入口之上增加可移動 / 陪伴感互動」
- 兩者共用同一套 avatar asset、sheet 結構、fallback 文案與 Search 導流

## 10. 很短的 Implementation Plan

第一輪 implementation plan 只做四步：

1. 建立 `copilot-base`：
   - 共用 avatar renderer
   - 共用 chat sheet
   - 共用 fixed anchor / reset anchor
2. 建立 `copilot`：
   - 固定位置 mount
   - 點 avatar 打開極簡 sheet
   - 沒有真實聊天能力時導回 Search
3. 讓 `companion` 繼承 `copilot-base`：
   - 保留同一個 avatar / sheet / anchor
   - 只額外加拖曳與位置持久化
4. 補最小互動：
   - avatar 眼睛跟隨滑鼠
   - companion on/off 與 settings 狀態同步

## 11. MVP 驗收

第一版若真的實作，至少要滿足：

- Copilot 入口放在 `misc / More`
- 入口文案固定且自然
- 能回答最基本的導覽 / contact / content routing 問題
- 模型不可用時，會清楚 fallback 到 `pages/search.html`
- 不新增第二套 FAQ / metadata 維護流程

## 12. 一句話總結

第一版 Copilot 不應該像獨立 AI 產品，而應該像：

- 放在 `misc / More` 裡的 `Ask Ludwig`
- 負責站內導覽與資訊路由
- 不確定時老實 fallback 到 `Search`
