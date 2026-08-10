<meta>
Title: 端到端離散化與生成式檢索：RQ-VAE 如何打造 Semantic ID Tokenizer
Summary: 本文深入解析 RQ-VAE（Residual Quantized VAE）在生成式推薦與檢索中的核心機制，包含從 VQ-VAE 到 RQ-VAE 的階層式離散化演進、Straight-Through Estimator (STE) 梯度補正、碼本崩塌 (Codebook Collapse) 的解決之道，以及 TIGER 模型如何利用 RQ-VAE 生成 Semantic ID。
Slug: rq-vae-semantic-id-tokenizer-in-generative-recommendation-zh-tw
Output: notes/rq-vae-semantic-id-tokenizer-in-generative-recommendation/rq-vae-semantic-id-tokenizer-in-generative-recommendation-zh-tw.html
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: recommendation systems, generative retrieval, rq-vae, vq-vae, deep learning, semantic id
Status: published
Published: 2026-08-02
LastModified: 2026-08-02
</meta>

# 端到端離散化與生成式檢索：RQ-VAE 如何打造 Semantic ID Tokenizer

在 <content-link canonical="from-cascade-to-generative-recommendation-paradigm-shift">從級聯漏斗到自迴歸生成：推薦系統的範式重塑</content-link> 中，我們探討了推薦系統為何全面邁向生成式範式。而在將推薦對齊為自迴歸生成的過程中，最關鍵的核心落地瓶頸在於：**如何將高維商品特徵端到端地量化為階層式的離散 Token（Semantic ID）？**

作為生成式檢索（Generative Retrieval, GR）領域的開山技術，**RQ-VAE（Residual Quantized VAE）** 提供了端到端學習離散碼本與商品編碼的解答。本文將直奔這個落地瓶頸，深入解析 RQ-VAE 的階層量化機制、Straight-Through Estimator (STE) 梯度傳播、碼本崩塌處置與 TIGER 落地實踐。

## 1. 為什麼需要端到端的 RQ-VAE？

在離散 Token 化（Item Tokenization）的過程中，主要存在兩種技術路線：

1. **兩階段解耦方案（如 <content-link canonical="rq-kmeans-semantic-id-tokenizer-in-generative-recommendation-zh-tw">RQ-Kmeans</content-link>）：** 先利用獨立的模型生成靜態商品 Embedding，再經由幾何殘差聚類切分成 Token。
2. **端到端深度學習方案（RQ-VAE）：** 建立一個由變分編碼器（Encoder）、離散碼本（Codebooks）與解碼器（Decoder）組成的神經網路，聯合優化向量表示與 Token 化過程。

兩階段解耦方案雖然輕量且穩定，但其 Token 化過程與下游的推薦生成目標是完全分離的。相比之下，**RQ-VAE 能夠讓神經網路主動學習符合下游推薦目標的潛在語意空間（Latent Semantic Space）**。這種端到端訓練能力，使其成為許多最前沿生成式推薦模型（如 Google TIGER）的核心基礎設施。

---

## 2. 從 VQ-VAE 到 RQ-VAE：階層式殘差向量量化

要理解 RQ-VAE，必須先回顧 2017 年 DeepMind 提出的 **VQ-VAE (Vector Quantized VAE)**。

### VQ-VAE 的基礎機制與單碼本瓶頸

VQ-VAE 引入了一個包含 $K$ 個向量的離散碼本 $\mathcal{C} = \{e_1, e_2, \dots, e_K\}$：

1. **編碼：** 輸入商品特徵 $x$，經由 Encoder 得到連續潛在向量 $z_e = E(x)$。
2. **量化：** 在碼本 $\mathcal{C}$ 中找到離其最近的向量 $e_k$：
   $$z_q = Q(z_e) = \arg\min_{e_k \in \mathcal{C}} \|z_e - e_k\|_2$$
3. **解碼：** 將量化向量 $z_q$ 輸入 Decoder，重構原始特徵 $\hat{x} = D(z_q)$。

然而，單一碼本的 VQ-VAE 面臨著表達力上限問題：若要精確區分平台上的數百萬商品，碼本大小 $K$ 必須極大，這會導致神經網路的記憶體開銷崩潰與訓練極度不穩定。

### RQ-VAE 的多階層殘差架構

為了在保持小碼本（如每層 $K = 256$ 或 $8192$）的同時獲得巨大的表達空間，**RQ-VAE (Lee et al., 2022)** 引入了 $M$ 層階層式殘差碼本 $\mathcal{C}^{(1)}, \mathcal{C}^{(2)}, \dots, \mathcal{C}^{(M)}$：

1. **第一層量化：**
   將連續潛在向量 $z_e$ 映射到第一層碼本 $\mathcal{C}^{(1)}$ 的最近向量 $e_{k_1}^{(1)}$，並計算第一層殘差：
   $$r^{(1)} = z_e - e_{k_1}^{(1)}$$
2. **第 $m$ 層量化（$m = 2 \dots M$）：**
   將上一層殘差 $r^{(m-1)}$ 映射到第 $m$ 層碼本 $\mathcal{C}^{(m)}$ 的最近向量 $e_{k_m}^{(m)}$，並更新殘差：
   $$r^{(m)} = r^{(m-1)} - e_{k_m}^{(m)}$$
3. **累積幾何重構：**
   最終量化向量 $z_q$ 為各層選擇向量的加總：
   $$z_q = \sum_{m=1}^M e_{k_m}^{(m)}$$

<block>
**產出 Semantic ID：**
商品 $x$ 最終被轉化為長度為 $M$ 的階層式離散 Token 序列 $[k_1, k_2, \dots, k_M]$。
第 1 個 Token $k_1$ 代表粗粒度語意類別，後續 Token $k_2 \dots k_M$ 則在殘差空間中持續修正細節語意。
</block>

---

## 3. 不可微離散化與梯度傳播：Straight-Through Estimator (STE)

在神經網路中，$\arg\min$ 的最近鄰搜尋是一個不可微的離散階梯函數，梯度無法直接從 Decoder 穿透量化層傳回 Encoder。

為了打破這個限制，RQ-VAE 採用了 **Straight-Through Estimator (STE)** 技巧：在前向傳播（Forward Pass）時使用離散量化向量 $z_q$；在反向傳播（Backward Pass）時，直接將 Decoder 的梯度複製傳回 Encoder（即視 $\nabla_{z_e} \approx \nabla_{z_q}$）。

### RQ-VAE 的完整損失函數 (Loss Function)

為了使 Encoder 的輸出 $z_e$ 與碼本向量 $z_q$ 互相靠近，RQ-VAE 的訓練損失由三部分組成：

$$\mathcal{L}_{\text{RQ-VAE}} = \mathcal{L}_{\text{recon}}(x, \hat{x}) + \|\text{sg}[z_e] - z_q\|_2^2 + \beta \|z_e - \text{sg}[z_q]\|_2^2$$

- **$\mathcal{L}_{\text{recon}}(x, \hat{x})$（重構損失）：** 確保重構後的特徵 $\hat{x}$ 逼近原始輸入 $x$。
- **碼本損失 $\|\text{sg}[z_e] - z_q\|_2^2$：** 運用 stop-gradient 運算子 $\text{sg}[\cdot]$，推動碼本向量向 Encoder 輸出靠攏。
- **承諾損失 (Commitment Loss) $\beta \|z_e - \text{sg}[z_q]\|_2^2$：** 防止 Encoder 輸出過度劇烈跳變，確保其「承諾」於當前的碼本分佈。

---

## 4. 實務難題：碼本崩塌 (Codebook Collapse) 與解決方案

在端到端訓練 RQ-VAE 時，最常見的工程病徵是**碼本崩塌（Codebook Collapse / Dead Codes）**：模型在訓練早期迅速收斂到少數幾個熱門 Codeword，導致大部分碼本向量再也沒有梯度更新，最終失真度大增，Semantic ID 失去區分度。

為了確保碼本利用率（Codebook Utilization Rate, CUR）達到最大化，現代 RQ-VAE 採用了以下關鍵優化手段：

1. **指數移動平均更新 (EMA Codebook Update)：**
   放棄直接透過梯度更新碼本，轉而使用 Encoder 輸出的指數移動平均（EMA）來動態更新聚類中心，能極大地穩定碼本訓練。
2. **死碼重置機制 (Dead Code Revival / Resetting)：**
   當檢測到某些 Codeword 的使用率低於設定閾值時，主動將該 Codeword 的位置隨機重置為當前 Batch 中某個失真最大的 Encoder 向量。
3. **K-means 聚類初始化：**
   在訓練初期，先對 Encoder 輸出運行幾次 K-means 聚類來初始化碼本中心，避免隨機初始化帶來的局部最優陷阱。

---

## 5. 經典案例：Google TIGER 如何實現生成式推薦

Google 於 NeurIPS 2022 提出的 **TIGER (Transformer with Implicit Generative Retrieval)** 展現了 RQ-VAE 在生成式檢索上的極致威力：

```
[ 商品文本/特徵 ] 
       │
       ▼
( Sentence-T5 Encoder ) ──> 向量 v
       │
       ▼
( 預訓練好的 RQ-VAE ) ───> 產出 Semantic ID: [31, 88, 102, 5]
       │
       ▼
( 自迴歸 Transformer ) ───> 預測下一個商品的 Semantic ID 序列
```

- **第一階段：** 透過文本模型（如 Sentence-T5）提取商品語意特徵，並訓練 RQ-VAE 將商品編碼為 4 個 Token 的 Semantic ID。
- **第二階段：** 將用戶歷史互動商品的 Semantic ID 展平為輸入序列，訓練 Sequence-to-Sequence Transformer 自迴歸生成下一個推薦商品的 Semantic ID 序列。

---

## 6. RQ-VAE vs. RQ-Kmeans 比較

在選擇離散 Token 化方案時，團隊通常需要在「端到端極致表現」與「工程穩定性」之間做取捨：

| 特性維度 | RQ-VAE (端到端神經網路) | <content-link canonical="rq-kmeans-semantic-id-tokenizer-in-generative-recommendation-zh-tw">RQ-Kmeans</content-link> (兩階段幾何量化) |
| :--- | :--- | :--- |
| **訓練範式** | 端到端聯合訓練（Encoder + Codebook + Decoder） | 兩階段解耦（先產生 Embedding，再做幾何量化） |
| **優化目標** | 重構損失 + 碼本損失，學習任務導向的潛在空間 | 純粹最小化幾何向量平方距離 $\|v - v_{\text{approx}}\|^2$ |
| **工程複雜度** | 需處理 STE 梯度傳播、EMA 更新與碼本重置 | 純粹 Python/C++ 聚類演算法，無梯度問題，極其穩定 |
| **適用場景** | 追求 SOTA 表現、需要端到端學習新領域特徵 | 已有高品質靜態 Embedding（如 Graph Embedding/DSSM），追求快速穩健落地 |

---

<takeaways>
- **端到端 Token 化的核心：** RQ-VAE 透過變分編碼器與階層式碼本，實現了從高維特徵到離散 Semantic ID 的端到端神經網路量化。
- **關鍵梯度技巧：** 採用 Straight-Through Estimator (STE) 克服離散 $\arg\min$ 選擇的不可微問題，並透過 Commitment Loss 穩定編碼器與碼本的對齊。
- **解決碼本崩塌：** 結合 EMA 碼本更新與死碼重置機制（Dead Code Revival），確保所有階層的 Codeword 都能被充分利用。
- **與 RQ-Kmeans 的分工：** RQ-VAE 代表了端到端深度學習的 SOTA 方向；而 RQ-Kmeans 則是兩階段解耦場景下最具高 CP 值與穩定度的工程選擇。
</takeaways>

## 參考文獻（References）

1. Lee, D., et al. (2022). *Autoregressive Image Generation using Residual Quantization*. (RQ-VAE 原創論文)
2. Rajput, S., et al. (2022). *Recommender Systems with Generative Retrieval*. (Google TIGER 論文, NeurIPS 2022)
3. van den Oord, A., et al. (2017). *Neural Discrete Representation Learning*. (VQ-VAE 原創論文, NIPS 2017)
