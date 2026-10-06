<meta>
Title: RPG：用 MTP 並行生成長 Semantic ID 的推薦模型
Tags: Multi-Token Prediction, Generative Recommendation, Machine Learning
Summary: 整理 RPG 的長 Semantic ID、並行 token 預測與圖約束解碼，以及官方論文和程式碼。
Slug: rpg-generative-recommendation-zh-tw
Output: notes/rpg-generative-recommendation/rpg-generative-recommendation-zh-tw.html
CanonicalId: rpg-generative-recommendation
ContentDir: notes
Style: default
Lang: zh-Hant
EstimatedReadingTime: true
Status: drafting
LastModified: 2026-10-06
</meta>

<draft>
- 定位：資源索引與起稿骨架，待作者閱讀原始資料後補寫及全盤 proofread。
- 內容骨架：
    - 問題：短 ID 的表達能力與長 ID 的解碼成本
    - 表示：無序 code components 的來源與條件獨立假設
    - 機制：MTP loss 到圖約束候選解碼
    - 驗證：ID 長度、品質、效能與限制
- 查核日期：2026-10-06。
</draft>

# RPG：用 MTP 並行生成長 Semantic ID 的推薦模型

## 研究問題與方法定位

生成式推薦常把一個 item 編成數個 semantic-ID tokens，再逐步生成；ID 拉長後，逐 token 解碼成本也會增加。RPG 改用無序的長 ID，讓共享使用者表示同時預測同一個下一 item 的全部 code components，再用相似 ID 圖限制候選解碼。

這裡的「多 token」指同一 item 的多個 ID 成分，不是多個未來互動，也不是 LLM 的 draft-and-verify。論文發表於 KDD 2025，附作者實作；本筆記未確認生產部署或獨立重現。

## 後續補寫方向

- 問題：短 ID 的表達能力與長 ID 的解碼成本。
- 表示：無序 code components 的來源與條件獨立假設。
- 機制：MTP loss 到圖約束候選解碼。
- 驗證：ID 長度、品質、效能與限制。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Hou, Y., Li, J., Shin, A., Jeon, J., Santhanam, A., Shao, W., Hassani, K., Yao, N., & McAuley, J. (2025). [Generating Long Semantic IDs in Parallel for Recommendation](https://arxiv.org/abs/2506.05781). KDD 2025。

    閱讀重點：首版發布於 2025-06-06；優先閱讀 multi-token objective、semantic-ID construction 與 graph-constrained decoding，區分表示改動與解碼改動。

2. Rajput, S., et al. (2023). [Recommender Systems with Generative Retrieval](https://arxiv.org/abs/2305.05065). NeurIPS 2023。

    閱讀重點：TIGER 是逐 token 生成 item semantic ID 的對照起點，不能因一個 item 有多個 tokens 就稱為 MTP。

3. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). [Better & Faster Large Language Models via Multi-token Prediction](https://arxiv.org/abs/2404.19737). ICML 2024。

    閱讀重點：用來對照共享 backbone 加未來位置預測頭的原始設計；推薦模型的 token 單位與順序假設仍須另外界定。

### 開源專案與代碼（Open Source Code）

1. [RPG_KDD2025](https://github.com/facebookresearch/RPG_KDD2025)。

    閱讀重點：論文摘要直接提供此 repository；用來追蹤資料準備、訓練與圖解碼。公開程式碼不等同獨立重現已通過。

<reviewkit>
<takeaways>
- RPG 的 MTP 同時預測同一個 item 的 ID 成分。
- 候選使用圖約束解碼，不能直接套用 LLM speculative decoding 的保證。
- 作者公開論文與實作；本筆記未確認生產部署。
</takeaways>
<qprompt/>
</reviewkit>

