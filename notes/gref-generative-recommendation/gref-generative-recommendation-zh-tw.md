<meta>
Title: GReF：以 Ordered MTP 加速生成式重排序
Tags: Multi-Token Prediction, Generative Recommendation, Machine Learning
Summary: 整理 GReF 的 ordered multi-item prediction、Rerank-DPO 與快手部署資訊，定位在 slate reranking。
Slug: gref-generative-recommendation-zh-tw
Output: notes/gref-generative-recommendation/gref-generative-recommendation-zh-tw.html
CanonicalId: gref-generative-recommendation
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
    - 問題：候選序列的組合空間與自回歸延遲
    - 模型：bidirectional encoder 與 dynamic autoregressive decoder
    - 目標：Rerank-DPO 與 Ordered MTP
    - 驗證：latency、list quality、線上收益與解碼保證
- 查核日期：2026-10-06。
</draft>

# GReF：以 Ordered MTP 加速生成式重排序

## 研究問題與方法定位

重排序要從候選集合決定一串 item 排列，逐 item 自回歸產生會造成延遲。GReF 的 Gen-Reranker 先以曝光順序預訓練，再以 Rerank-DPO 納入序列層級評估；Ordered MTP 讓模型同時預測多個未來位置的 items 並保留順序。

token 是排序序列裡的 item／候選位置，不是同一 item 的 SID 成分。論文發表於 CIKM 2025，作者報告快手部署與接近非自回歸模型的 offline latency。這些是作者結果，不代表本筆記獨立重現，也不自動保證 LLM speculative decoding 的取樣分布不變。

## 後續補寫方向

- 問題：候選序列的組合空間與自回歸延遲。
- 模型：bidirectional encoder 與 dynamic autoregressive decoder。
- 目標：Rerank-DPO 與 Ordered MTP。
- 驗證：latency、list quality、線上收益與解碼保證。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Lin, Z., Li, Z., Dai, C., Bao, W., Lin, S., Yu, E., Zhang, H., & Zhao, L. (2025). [GReF: A Unified Generative Framework for Efficient Reranking via Ordered Multi-token Prediction](https://arxiv.org/abs/2510.25220). CIKM 2025, pp. 5879–5887。

    閱讀重點：arXiv 首版 2025-10-29；用來讀 OMTP、Gen-Reranker、Rerank-DPO 與快手部署結果。

2. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). [Better & Faster Large Language Models via Multi-token Prediction](https://arxiv.org/abs/2404.19737). ICML 2024。

    閱讀重點：用來對照共享 backbone 加未來位置預測頭的原始設計；推薦模型的 token 單位與順序假設仍須另外界定。

### 技術文章（Technical Articles）

1. Li, Z. [Zhuofeng Li](https://zhuofeng-li.github.io/)。

    閱讀重點：Publication 區列出 GReF 的原始標題、作者及 CIKM 2025 資訊，提供正式會議身分的第一方查核；此連結不是官方程式庫。

本次查核未找到已公開的官方實作；後續若釋出程式碼或 model card，再補入原始來源。

<reviewkit>
<takeaways>
- GReF 的 MTP 單位是 reranking 序列的多個未來 items。
- Ordered MTP 負責生成效率，Rerank-DPO 負責序列偏好對齊。
- 作者報告快手部署；取樣分布保證需要另外查核。
</takeaways>
<qprompt/>
</reviewkit>

