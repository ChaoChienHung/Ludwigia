# Writing Notes

本文件用來記錄「可重用的文章骨架」、「值得保留的寫作技巧」與「值得逆向拆解的優秀文章」。目標不是把寫作模板鎖死，而是留下作者自己之後會回頭看的 writing notes，讓起稿時不必每次都從零發明章節順序，也能逐步沉澱哪些寫法真的能幫讀者建立判斷力。

## 使用方式

- 先選「這篇文章要幫讀者完成什麼」：理解一個觀點、學會一個流程、比較兩個選項、吸收一批研究、或整理自己的思考。
- 起稿前先訂一條 `main flow`：也就是這篇文章準備用什麼理解路徑把讀者帶到結論。之後每一段、每個 `block`、每個 `callout` 都可以回頭檢查自己有沒有 off the flow。
- 再選最接近的骨架：不要求逐段照抄，但至少先有一個 baseline。
- 若之後看到很喜歡的文章，可隨時把它補進本文件的「參考文章」或新增一種模板；這份文件預設就是可擴充的，不是一次性定稿。
- 不把這份文件視為 parser/template spec；它先是寫作設計文件。未來若某些骨架穩定到值得產品化，再考慮變成 `tools/create_content.py` 模板。

## 起稿前的 5-Line Scaffold

如果一篇文章還在很早期，先不用急著把段落寫滿。先把下面 5 行補出來，通常就能看出這篇有沒有 overloaded：

1. `TL;DR`：如果只能用 1-3 句話講完，這篇真正要說什麼？
2. `MainFlow`：我要用哪一條理解路徑把讀者帶到結論？
3. `Scope`：這篇明確要回答哪些問題？
4. `OutOfScope`：這篇刻意不回答哪些問題，準備留到後續文章？
5. `FollowUps`：如果這篇其實在導向一個主題家族，後續應拆出哪些子文章？

這 5 行不是給讀者看的 UI，而是作者自己的 planning scaffold。真正公開時可以不顯示它們，但起稿時先把它們寫出來，通常能更早發現：

- 這篇到底是在做 overview，還是在做單一方法 deep dive
- 文章是不是同時想講太多件事
- limitation / comparison / related work 是否已經偏離主 flow

## 前段導讀 Block

如果文章前段想放一個可見的導讀 block，我現在更偏好把它收斂成：

- 這篇最重要的主題是什麼
- 這篇會怎麼走（main flow）
- 這篇刻意不講什麼

而不是再另外做一個專門的 `Guiding Questions` 特殊區塊。原因是：

- 你本來就常把 guiding questions 分散在各段的 opening 與轉場裡
- 若前面再開一個 `Guiding Questions` block，容易變成重複
- 真正更需要被 upfront 固定下來的，反而是這篇的焦點、範圍與理解路徑

命名上可先把它理解成 `TL;DR`，但語意更接近：

- `Focus`
- `Article Compass`
- `This article focuses on...`

重點不是名字，而是它的責任：幫讀者在一開始就抓住主線。

## Overview vs Deep Dive

知識型文章最容易 overloaded 的情況，是把「介紹一個主題家族」和「完整講完其中幾個方法」硬塞在同一篇。

- 若主問題是「Clustering 是什麼、為什麼重要、有哪些主要路線、它們差在哪」，那這篇應該是 overview
- 若主問題是「K-Means 到底怎麼運作、它的假設與 limitation 是什麼」，那這篇應該是 single-method deep dive
- 若主問題是「DBSCAN 何時比 K-Means 更自然」，那這篇更接近 comparison / decision guide

實務上可優先拆成兩層：

- overview 頁：建立方法地圖、主要差異軸、適用情境與後續閱讀路線
- follow-up 頁：各自處理 `K-Means`、`DBSCAN`、`Hierarchical Clustering`、`AGNES`、`DIANA`、`HDBSCAN` 等單一方法

對 overview 頁來說，更重要的是：

- 先把讀者帶到「這個方法家族在解什麼問題」
- 再把主要分支與差異軸講清楚
- 最後把各方法留待後續頁面深挖
- 若必須提到某個代表方法，也應以「用它定位這一類方法的角色」為主，而不是讓整篇重心被它的直覺、推導或 step-by-step 機制綁走

這樣做的好處不只是 flow 比較乾淨，也比較好 scale：

- 之後可以更自然地把更多相關方法放進 overview（例如 `Hierarchical Clustering`、`AGNES`、`DIANA`、`HDBSCAN`）
- overview 不需要每新增一個方法就再長出一大段 deep dive，結構比較穩
- 單一方法頁可以各自擴充 intuition、limitation、tuning 與 comparison，而不會把總覽頁撐爆

而不是在同一篇裡同時塞滿：

- 方法家族背景
- 單一演算法機制
- 每個演算法各自的 limitation
- tuning 細節
- 全量 comparison

## Reverse Engineering 流程

當遇到一篇想學的文章時，優先記以下欄位：

1. 開頭怎麼 hook 讀者？
2. 它先給結論，還是先鋪背景？
3. 主體是按什麼邏輯展開：時間、問題、步驟、比較維度、還是抽象層級？
4. 哪些段落是「必要骨架」，哪些只是作者自己的材料？
5. 結尾做的是總結、升維、CTA，還是留一個更大的問題？

記完後，再把它歸到下列模板之一；若放不進去，就新增一種模板。

## 寫作技巧

### 1. 理論去神聖化

- 適合：文章需要引用理論、框架、最佳實踐或經典說法，但你不想把它們寫成不可違背的標準答案。
- 核心寫法：先交代理論上的典型說法，再補一句真實情境中通常會怎麼調整、折衷或偏離。
- 目的：幫讀者建立的是判斷力，而不是僵化照抄的 reflex。
- 常見句型：
  1. `理論上...；但實際上...`
  2. `標準教科書會這樣切；不過在真實工作裡，常常會因為...而改成...`
  3. `這個框架很有用，但更重要的是知道它在哪些情況下會失真`
- 使用提醒：
  - 不要把「實務上會調整」寫成反智地否定理論；重點是讓理論回到可用框架，而不是把理論整個拆掉。
  - 最好補出 adjustment 的條件，說清楚是什麼 constraint、目標或現場訊號，讓作者做出偏離。
  - 若文章在教方法，這種寫法通常比直接背最佳實踐更能幫讀者形成 decision logic。
- 例子：
  - `理論上應先完整定義問題再選方法；但實際上很多時候你只能先用粗略假設開局，再邊做邊收斂問題。`

## 寫作模板

### 1. 觀點論述型

- 適合：有一個明確主張，想說服讀者接受一個看法或 framing。
- 讀者狀態：對議題有基本概念，但不知道作者為什麼這樣判斷。
- 典型順序：
  1. 用一個反直覺觀察或 tension 開頭
  2. 先亮主張
  3. 拆 3-5 個 supporting arguments
  4. 插入反例 / 限制條件
  5. 收束成一個更 general 的原則
- 常見失敗：太早講抽象大道理，沒有足夠例子把讀者帶進來。

### 2. 教學拆解型

- 適合：教讀者完成一個流程、理解一個方法、重做一個結果。
- 讀者狀態：有任務壓力，想快速知道怎麼做。
- 典型順序：
  1. 先講要解的問題與讀完可得到什麼
  2. 前置條件 / prerequisites
  3. 先給最小可行版本
  4. 按步驟遞增複雜度
  5. 補 pitfalls / debugging / edge cases
  6. 結尾給 recap 與延伸方向
- 常見失敗：一上來就貼完整大成品，沒有階段性停靠點。

### 3. 知識型文章 / 方法筆記型

- 適合：整理一個技術主題、演算法、方法論或一組相關概念，讓讀者從「知道名字」走到「理解用途、原理、限制與比較」。
- 讀者狀態：對主題可能有初步印象，但需要一篇結構清楚、能快速建立整體心智模型的文章。
- 偏好節奏：先直覺、再抽象、再正式定義。也就是先用生活例子或具體場景把讀者帶進來，再抽象成「這裡真正要定義的是什麼」，最後才落到正式術語、數學目標或演算法假設。
- 典型順序：
  1. Introduction: Why?（背景 / 為什麼值得關心）
  2. Introduction: What?（它是什麼）
  3. Landscape / Branches（如果主題是一個方法家族：有哪些主要路線 / 變體 / 實作分支）
  4. Approach: How?（若本篇主角是單一方法，才在這裡深挖怎麼運作）
  5. Limitation / Trade-offs（單一方法頁優先保留；overview 頁只收斂到家族層級的邊界）
  6. Comparison（例如 `K-Means vs. DBSCAN`；若主題沒有明確對照組，可視情況省略）
  7. Conclusion: Key Takeaways
- 使用建議：
  - 若文章重點是「幫讀者建立一個方法的完整輪廓」，這套結構很穩。
  - 起稿前最好先把 `TL;DR / MainFlow / Scope / OutOfScope / FollowUps` 補出來，再決定這篇是 overview、single-method deep dive，還是 comparison。
  - 若這篇其實在講「方法家族 overview」，正文應優先回答：這類方法在解什麼問題、主要分支有哪些、差異軸是什麼；不要同時把每個方法的 limitation 都展開講完。
  - overview 頁若需要提到代表方法，應該「一筆帶過到足以建立地圖」；不要讓 `K-Means` 或任何單一方法的直覺段落長到吃掉整篇主 flow。
  - 若某個方法的 limitation、tuning、failure mode 已經需要 2-3 個小節，通常代表它值得獨立成一篇。
  - 若文章包含兩個以上方法，`Comparison` 不只是附錄，甚至可以是整篇的核心價值。
  - 若文章只有單一方法、沒有直接對照組，可把 `Comparison` 改寫成 `When to Use / When Not to Use`。
  - 結尾若想雙軌收束：正文可用 `## Summary` 寫一小段段落式總結；條列式重點則另外放進 `<takeaways>`
  - 若想在文章前段放導讀 block，優先寫成「TL;DR / Focus / Article Compass」，用來固定主題、scope 與 main flow；不要預設再開一個專門的 `Guiding Questions` block。
  - 若需要插入輔助理解的小元件：`block` 偏摘要卡，適合 quick insight / quick notes；`callout` 偏導讀式補充，適合放直覺、比喻與重要理解方式。
  - 若想先用一個快速 heuristic 判斷：疑問句導向的補充通常更適合 `callout`；重點整理、摘要、結論式的補充通常更適合 `block`。
  - 但要記得：`block` / `callout` 都是正文 flow 之外的 branch，不應喧賓奪主。文章主線本身必須能獨立成立，重要內容應盡量留在主 flow 裡，而不是把關鍵論證都塞進補充元件。
  - 上面這個 heuristic 只是快捷規則，不是硬性分類；真正的最高判準仍然是它是否與主文章 flow 相容。
  - 判斷某一段要留在正文還是抽成 `block` / `callout` 時，優先看它是否與主文章 flow 相容：能推進主線的內容留在正文；有價值但會打斷節奏的內容，再考慮抽成補充元件。
- 常見失敗：
  - `How?` 寫得太細變成 implementation dump，反而失去知識型文章的可讀性。
  - `Limitation` 與 `Comparison` 太晚出現，讓文章看起來像單方面介紹而不是 decision aid。
  - 同一篇既想做 overview，又想完整教完 `K-Means / DBSCAN / Hierarchical Clustering`，結果變成 overloaded survey。
  - 原本想寫 `clustering overview`，最後卻花大量篇幅在 `K-Means` 的直覺與流程，導致文章表面上在講家族，實際上已經偏向單一方法教學。
  - 把單一方法的 limitation 留在 overview 頁，導致節奏從「建立地圖」突然跳成「深入 debug 某個方法」。

### 4. 比較分析型

- 適合：兩種以上選項的 trade-off、策略比較、框架選型。
- 讀者狀態：已知道自己要做決策，但不確定判準。
- 典型順序：
  1. 定義比較對象與 decision context
  2. 先給總結表態或判準
  3. 按維度比較，而不是先講完 A 再講完 B
  4. 補適用情境與反例
  5. 最後給 recommendation
- 常見失敗：寫成 feature list，而不是 decision guide。

### 5. 研究 / 讀書摘要型

- 適合：把一堆資料壓成可遷移的 takeaways。
- 讀者狀態：沒空讀原文，但想快速吸收真正值得留下的觀念。
- 典型順序：
  1. 先講這份摘要的篩選口徑
  2. 用 3-6 個主題聚類
  3. 每個主題下固定分成「核心概念 / 泛化應用 / 限制」
  4. 最後總結跨主題共同原則
- 常見失敗：變成逐條抄錄，而沒有抽象出 transferable insight。

### 6. 反思札記型

- 適合：記錄思考轉變、學到什麼、為何改變做法。
- 讀者狀態：對你的脈絡有興趣，希望看見推理過程，而不只是結論。
- 典型順序：
  1. 先交代觸發事件或原始困惑
  2. 寫原本怎麼想
  3. 寫哪個觀察或經驗讓你改觀
  4. 寫現在的新 framing
  5. 補尚未解決的 open questions
- 常見失敗：只有情緒、沒有可被別人沿用的結論。

### 7. Case Study / How We Built It

- 適合：講一個系統、專案、產品功能是如何被設計與落地。
- 讀者狀態：想知道你怎麼思考與取捨，不只想看成果圖。
- 典型順序：
  1. 問題背景與約束
  2. 為什麼現有做法不夠
  3. 設計原則 / 成功標準
  4. 方案拆解
  5. Trade-offs / 邊界條件
  6. 結果、教訓、後續
- 常見失敗：只講 solution，不講 constraint，所以讀者學不到 decision logic。

## 種子參考文章

下面不是「官方標準答案」，而是一批值得逆向拆結構的 seed examples。重點不是模仿文風，而是學它們怎麼安排讀者的理解節奏。

### 觀點論述 / Essay

- Paul Graham essays：很適合學「反直覺 opening → 主張 → 例子 → 升維結論」的節奏。
- 可先看：
  - `How to Get Startup Ideas`
  - `Do Things That Don't Scale`
  - `Maker's Schedule, Manager's Schedule`

### Engineering / Case Study

- Stripe Engineering：很適合學「背景 → 約束 → 系統設計 → trade-off → result」這種產品/工程寫法。
- Cloudflare / GitHub / Figma / Notion 等工程 blog 也常有高質量的 how-we-built-it 結構，可持續補充到這裡。

### Tutorial / 教學拆解

- 優秀 tutorial 的關鍵不是「內容多」，而是有清楚的最小版本、遞增步驟與 pitfalls 區塊。
- 之後若看到一篇真的把複雜主題講得很順的 tutorial，可以直接在這裡補上 URL 與你拆出的節奏。

## 後續擴充方式

- 若某一種模板開始頻繁重複使用，可以再為它新增：
  - 建議標題公式
  - 建議 opening 類型
  - 建議 section heading 節奏
  - 建議結尾方式
- 若未來決定把其中 1-2 種模板產品化成 `tools/create_content.py` scaffold，再回頭從這份文件抽出「最穩定」的骨架，不要反過來讓實作綁死寫作本身。
