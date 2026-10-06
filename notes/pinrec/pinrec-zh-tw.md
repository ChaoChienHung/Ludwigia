<meta>
Title: PinRec：從 Windowed MTP 到跨入口生成式檢索
Tags: Multi-Token Prediction, Generative Recommendation, Machine Learning
Summary: 收集 PinRec 的歷史 MTP 版本、最新改名版本與官方背景文章，釐清連續 item 表示和版本差異。
Slug: pinrec-zh-tw
Output: notes/pinrec/pinrec-zh-tw.html
CanonicalId: pinrec
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
    - 問題：session 內互動順序與候選多樣性
    - 歷史方法：windowed supervision 與連續 item embedding
    - Serving：自回歸生成、outcome conditioning 與 ANN
    - 版本比較：v1 MTP 與 v7 統一模型的共同點及差異
- 查核日期：2026-10-06。
</draft>

# PinRec：從 Windowed MTP 到跨入口生成式檢索

## 研究問題與方法定位

Pinterest 的短時間互動順序未必代表嚴格的興趣轉移。PinRec v1 用 windowed multi-token objective，讓多個生成位置對應一段未來互動，而非只拘泥下一 item。模型產生連續 item representations，再以 Faiss 找實際候選；token 不是離散 SID 的一個 code。

必須分版閱讀：v1 明確以 Multi-Token 命名並介紹此目標；v7 已改名為跨 Pinterest 入口的統一檢索研究，正文不再出現 multi-token 一詞。不能把 v1 的機制直接當成最新版已保留的契約。最新摘要報告 Pinterest 級部署，但不替 v1 MTP 的沿用提供證明。

## 後續補寫方向

- 問題：session 內互動順序與候選多樣性。
- 歷史方法：windowed supervision 與連續 item embedding。
- Serving：自回歸生成、outcome conditioning 與 ANN。
- 版本比較：v1 MTP 與 v7 統一模型的共同點及差異。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Badrinath, A., Agarwal, P., Bhasin, L., Yang, J., Xu, J., & Rosenberg, C. (2025). [PinRec: Outcome-Conditioned, Multi-Token Generative Retrieval for Industry-Scale Recommendation Systems](https://arxiv.org/abs/2504.10507v1), v1. arXiv 預印本。

    閱讀重點：2025-04-09；本筆記 MTP 描述的直接來源。閱讀 §4.3.2 的 Windowed Multi-Token Generation，並搭配 autoregressive item generation 與 Faiss retrieval。

2. Botta, E., Yang, J., Hsu, Y.-P., Bhasin, L., Chen, Y., Agarwal, P., Badrinath, A., Xu, J., & Rosenberg, C. (2026). [PinRec: Unified Generative Retrieval for Pinterest Recommender Systems](https://arxiv.org/abs/2504.10507), v7。

    閱讀重點：v7 為 2026-06-18；此筆以版本紀錄確認改名及作者變更，收錄為版本對照，不把舊版 MTP 套進新版。

### 技術文章（Technical Articles）

1. Pinterest Engineering; Kislyuk, D., Galgon, R., Rosenberg, C., & Madrigal, M. (2025). [On the (re)-prioritization of open-source AI](https://medium.com/pinterest-engineering/on-the-re-prioritization-of-open-source-ai-86f7279481e3)。

    閱讀重點：2025-12-04；提供 Pinterest 對領域推薦模型及 PinRec 的產品背景，不是 windowed MTP loss 的實作規格。

本次查核未找到已公開的官方實作；後續若釋出程式碼或 model card，再補入原始來源。

<reviewkit>
<takeaways>
- 歷史 v1 明確提出 windowed multi-token generation。
- PinRec 用連續 item 表示與 ANN 檢索，不是多個 SID code components。
- 最新 v7 改名且不再使用 MTP 一詞，需要保留版本界線。
</takeaways>
<qprompt/>
</reviewkit>

