<meta>
Title: GPR：用 MTP 建模多重興趣的生成式廣告推薦
Tags: Multi-Token Prediction, Generative Recommendation, Machine Learning
Summary: 整理 GPR 的平行興趣預測、分階段訓練與微信 Channels 部署證據，保留 MTP 成效的歸因界線。
Slug: gpr-generative-recommendation-zh-tw
Output: notes/gpr-generative-recommendation/gpr-generative-recommendation-zh-tw.html
CanonicalId: gpr-generative-recommendation
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Status: drafting
LastModified: 2026-11-12
</meta>

# GPR：用 MTP 建模多重興趣的生成式廣告推薦

騰訊微信團隊發布的 GPR（《GPR: Towards a Generative Pre-trained One-Model Paradigm for Large-Scale Advertising Recommendation》，2025 年底預印本，2026 年 v3 更新），展示了在超大規模工業級廣告推薦場景中，利用 MTP 構建「生成式預訓練單一模型架構（One-Model Paradigm）」的重磅實踐，並報告了在微信視頻號廣告中的全面部署。

## 研究問題與架構設計（Architecture & Objective）

依據論文架構說明（v1 §3.1 & v3 摘要）：
- **Token 的實體語義**：廣告商品的層級化語義編碼（Hierarchical Semantic Codes）。在 GPR 中，用戶在當下時刻往往同時存在多個潛在興趣維度（如美妝、數碼、運動）。
- **多興趣並行 MTP 預測頭**：共享強大的推薦主幹模型，向外分叉出預設 4 個並行的 MTP 預測頭（Multi-Interest Heads），每個 Head 負責並行解碼出對應於一個獨立興趣方向的完整商品層級編碼路徑。
- **訓練與業務目標對齊**：預訓練階段利用多興趣 MTP 學習全局潛在表示；在微調階段採用價值感知 MTP（Value-Aware MTP）以及 HEPO 策略優化算法，將點擊率（CTR）與廣告商業轉化（GMV）深度綁定。

## 關鍵實驗證據與量化數據（Quantitative Evidence & Findings）

- **全面工業部署**：最新 v3 論文摘要明確確認保留了 MTP 架構，並由作者報告已在**騰訊微信視頻號廣告系統中全面上線部署（Full Production Deployment）**。
- **線上業務增量**：作者報告的在線迭代數據顯示取得了包括 GMV 增長在內的顯著業務效益。

## 證據邊界與方法辨析（Evidence Boundaries & Method Analysis）

- **版本細節的謹慎追溯**：v3 摘要確認了 MTP 與全面部署，但 4 個並行 Heads 的具體架構圖是自 v1 §3.1 讀取，不可在未重新核對 v3 全文公式前斷言所有參數配置在跨版本演進中未做微調。
- **複合迭代與因果消融界限**：在 v1 報告的線上迭代實驗中，線上系統是**同時引入了 MTP 與 Thinking 機制**，其最終獲得的 +0.63% GMV 增長屬於多模塊協同的系統性收益，嚴禁在技術分析中歸因於「單純 MTP 帶來的淨收益」。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Zhang, J., Li, Y., Liu, Y., Wang, C., Wang, Y., Xiong, Y., et al. (2025; revised 2026). [GPR: Towards a Generative Pre-trained One-Model Paradigm for Large-Scale Advertising Recommendation](https://arxiv.org/abs/2511.10138). arXiv 預印本。

    閱讀重點：首版 2025-11-13，最新查核版本 v3 為 2026-02-12；摘要明確保留 MTP，並報告微信 Channels 廣告系統完整部署。

2. Zhang, J., et al. (2025). [GPR: Towards a Generative Pre-trained One-Model Paradigm for Large-Scale Advertising Recommendation](https://arxiv.org/abs/2511.10138v1), v1。

    閱讀重點：本筆記的四個 parallel heads 與每頭完整 code path 描述來自此版 §3.1；後續精讀需核對最新版本的細節是否變更。

3. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). [Better & Faster Large Language Models via Multi-token Prediction](https://arxiv.org/abs/2404.19737). ICML 2024。

    閱讀重點：用來對照共享 backbone 加未來位置預測頭的原始設計；推薦模型的 token 單位與順序假設仍須另外界定。

本次查核未找到已公開的官方實作；後續若釋出程式碼或 model card，再補入原始來源。

<reviewkit>
<takeaways>
- GPR 創新性地將 MTP Heads 用於並行表徵用戶的多個並發興趣維度（預設 4 個 heads）。
- 透過價值感知 MTP 與 HEPO 策略對齊，將多興趣預測直接轉化為商業目標導向。
- 作者報告該模型已在騰訊微信視頻號廣告場景達成全量生產部署。
- 線上業務增量為 MTP 與 Thinking 等機制複合疊加成果，不可作為單一組件消融結論。
</takeaways>
<qprompt/>
</reviewkit>
