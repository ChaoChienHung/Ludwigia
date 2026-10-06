<meta>
Title: EGA-V2：以 MTP 聯合建模 POI 與廣告素材
Tags: Multi-Token Prediction, Generative Recommendation, Machine Learning
Summary: 收集 EGA-V2 的 POI 與 creative token 預測及廣告配置研究，保留 offline 證據與部署的差別。
Slug: ega-v2-zh-tw
Output: notes/ega-v2/ega-v2-zh-tw.html
CanonicalId: ega-v2
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
    - 場景：推薦、creative selection 與 auction 的關係
    - 表示：POI tokens 與 creative-image tokens
    - 機制：joint MTP 與分階段訓練
    - 邊界：offline 驗證、allocation 及 payment 的附加假設
- 查核日期：2026-10-06。
</draft>

# EGA-V2：以 MTP 聯合建模 POI 與廣告素材

## 研究問題與方法定位

廣告決策除了選 item，還涉及素材、位置、出價與付款。EGA-V2 用階層 tokenization 表示 POI 和 creative-image embeddings，以 encoder-decoder 及 MTP 聯合學習，再加入配置與付款相關的 post-training。

多 token 涵蓋 POI recommendation 與 creative-image 表示；不能直接當成預測幾個未來使用者互動，也不能把模型的 creative tokens 當成自然語言 token。本文為 Meituan 作者的 2025 年預印本，主要證據是工業資料集 offline evaluation；「industrial」不等於已確認線上部署。本筆記尚未獨立重現。

## 後續補寫方向

- 場景：推薦、creative selection 與 auction 的關係。
- 表示：POI tokens 與 creative-image tokens。
- 機制：joint MTP 與分階段訓練。
- 邊界：offline 驗證、allocation 及 payment 的附加假設。

## 參考資料（References）

### 學術論文（Academic Literature）

1. Zheng, Z., Wang, Z., Yang, F., Fan, J., Zhang, T., Wang, Y., & Wang, X. (2025). [EGA-V2: An End-to-end Generative Framework for Industrial Advertising](https://arxiv.org/abs/2505.17549). arXiv 預印本。

    閱讀重點：首版 2025-05-23，查核 v3 為 2025-06-01；摘要與架構圖明確寫出 MTP、POI 與 creative decoder。文件的會議模板 placeholder 不能用來推定正式錄用。

2. Yang, Y., Ji, Z., Li, Z., Li, Y., Mo, Z., Ding, Y., Chen, K., Zhang, Z., Li, J., Li, S., & Liu, L. (2025). [Sparse Meets Dense: Unified Generative Recommendations with Cascaded Sparse-Dense Representations](https://arxiv.org/abs/2503.02453). NeurIPS 2025。

    閱讀重點：用於比較 sparse ID 到 dense representation 的級聯設計；不是此筆記已驗證的 MTP 採用案例。

3. Gloeckle, F., Youbi Idrissi, B., Rozière, B., Lopez-Paz, D., & Synnaeve, G. (2024). [Better & Faster Large Language Models via Multi-token Prediction](https://arxiv.org/abs/2404.19737). ICML 2024。

    閱讀重點：用來對照共享 backbone 加未來位置預測頭的原始設計；推薦模型的 token 單位與順序假設仍須另外界定。

本次查核未找到已公開的官方實作；後續若釋出程式碼或 model card，再補入原始來源。

<reviewkit>
<takeaways>
- EGA-V2 將 POI 與 creative-image 表示納入 MTP 聯合訓練。
- 廣告配置和付款是額外決策層，不等同 MTP 本身。
- 已查證的是工業資料 offline 實驗，未確認生產部署。
</takeaways>
<qprompt/>
</reviewkit>
