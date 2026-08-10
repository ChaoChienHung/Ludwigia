<meta>
Title: 從幾何量化到生成式推薦：RQ-Kmeans 如何打造 Semantic ID Tokenizer
Summary: 本文從傳統級聯架構的痛點出發，探討生成式推薦如何藉由多步解碼與 Semantic ID 解決海量物品詞彙庫爆炸問題，並深入解析 RQ-Kmeans 殘差量化的底層幾何原理、進階正則化與落地工作流。
Slug: rq-kmeans-semantic-id-tokenizer-in-generative-recommendation-zh-tw
Output: notes/rq-kmeans-semantic-id-tokenizer-in-generative-recommendation/rq-kmeans-semantic-id-tokenizer-in-generative-recommendation-zh-tw.html
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: recommendation systems, generative retrieval, vector quantization, rq-kmeans, machine learning
Status: published
Published: 2026-08-02
LastModified: 2026-08-02
</meta>

# 從幾何量化到生成式推薦：RQ-Kmeans 如何打造 Semantic ID Tokenizer

在延伸專文 <content-link canonical="from-cascade-to-generative-recommendation-paradigm-shift">從級聯漏斗到自迴歸生成：推薦系統範式轉移的必然</content-link> 中，我們探討了推薦系統為何全面轉向生成式範式以解鎖 Scaling Law 紅利。然而，當推薦系統轉向自迴歸生成時，首要面臨的核心落地瓶頸便是：**如何將平台上海量的商品，轉換為生成模型能夠理解與預測的離散 Token（Semantic ID）？**

在深度學習領域，解答這個問題的最早代表性工作是端到端的 <content-link canonical="rq-vae-semantic-id-tokenizer-in-generative-recommendation-zh-tw">RQ-VAE</content-link>（如 Google 的 TIGER 模型）。然而在工業界落地時，考慮到訓練穩定性、算力開銷以及對既有 Embedding 資產的複用，許多團隊（如快手的 OneRec / OneSearch）選擇了一條更為輕量且解耦的幾何路線。

本文將聚焦於這項落地瓶頸的解答，詳細拆解這條業界廣為採用的 Token 化關鍵技術——**RQ-Kmeans（殘差 K-means 量化）** 的演算法原理、進階優化與落地流程。

## 1. 核心落地瓶頸：海量商品與詞彙庫爆炸

在標準的大語言模型中，模型輸入與輸出的單位是離散的文本 Token（如 Subword 或 BPE Token）。LLM 的總 Token 數（Vocabulary Size）通常落在萬到十萬級別（例如 32,000 到 128,000 個 Token）。在這個量級下，模型最後一層的 Softmax 預估與交叉熵損失計算在計算資源上是完全可行的。

然而，工業級推薦系統（如電商平台、短影音平台）的商品或內容總量（Item Catalog）往往高達數千萬甚至數十億（$10^7 \sim 10^9$）。若採取最直觀的作法：**將每一個商品直接映射為一個獨立的 Token ID**，就會產生完全無法調和的矛盾：

- **計算複雜度崩塌：** Softmax 層的分子需要對數億個類別求和，反向傳播與採樣開銷將使模型根本無法訓練。
- **冷啟動與語意孤立：** 隨機分配的原子型 ID（Atomic ID）缺乏任何內部結構與語意關聯，無法實現跨商品的泛化與遷移學習。

### 拆解難題：多步解碼與 Semantic ID (SID)

既然將商品直接轉換為「單一 Token」會因為單步預測的 Vocabulary 過大而崩潰，那麼**「如果我們改用多步解碼呢？」**

這正是當前生成式推薦（如快手的 OneRec、OneSearch 等）的核心破局思路：**將單一商品表示為由 $M$ 個 Token 組成的固定長度序列，稱為 Semantic ID (SID)**。

假定我們設定商品由 $M = 3$ 個 Token 表示，而每個 Token 的碼本大小（Codebook Size）為 $K = 8192$：

- **單步預測開銷：** 模型在每一步解碼時，只需要在大小為 $8192$ 的小詞彙庫中進行 Softmax 預估，計算複雜度降低了數個數量級。
- **可表達空間：** 3 個 Token 組合所能覆蓋的商品總量達到：
  $$8192^3 = 549,755,813,888 \approx 5.5 \times 10^{11}$$
  高達 5,500 億種獨特組合，這足以無壓地覆蓋全世界任何超大型平台的商品庫。

剩下的核心問題在於：**我們該如何將一個連續的商品特徵向量（Item Embedding），轉換為 3~4 個具備合理階層語意的 SID Token？** 這正是 RQ-Kmeans 展現價值的所在。

---

## 2. RQ-Kmeans 演算法機制：從幾何聚類到殘差量化

要理解 RQ-Kmeans（Residual Quantization K-means），我們需要回顧幾何空間中的向量量化（Vector Quantization, VQ）思維。

### 基礎量化的局限：K-means 與 PQ

1. **基礎 K-means 量化：** 
   若直接對商品向量進行 <content-link canonical="k-means-clustering-around-centers">K-Means 聚類</content-link>，若要降低量化誤差（Distortion），就必須設定極大的 $K$ 值，這會立刻導致碼本空間爆炸與儲存災難。
2. **乘積量化 (Product Quantization, PQ)：** 
   PQ 將高維向量切分為 $M$ 個子空間（如將 256 維切為 4 個 64 维），並在每個子空間獨立進行 K-means。雖然 PQ 解決了儲存問題，但其子空間切分是並行且獨立的，無法表達「由粗到細（Coarse-to-fine）」的階層語意關係。

### 殘差量化 (RQ-Kmeans) 的逐層求精

RQ-Kmeans 採取了一種**「逐層細化、逐步求精」**的幾何逼近策略，天然具備良好的階層結構：

給定一個商品的原始高維特徵向量 $v \in \mathbb{R}^d$，預計使用 $M$ 層碼本（每層大小為 $K$）進行量化：

1. **第一層量化（Coarse Stage - 粗粒度）：**
   - 在原始向量空間訓練第一層 K-means 碼本 $\mathcal{C}^{(1)}$。
   - 尋找與 $v$ 距離最近的聚類中心 $c_{k_1}^{(1)}$，記錄其索引 $k_1$ 作為第 1 個 Token。
   - 計算第一層殘差：
     $$r^{(1)} = v - c_{k_1}^{(1)}$$
     殘差 $r^{(1)}$ 代表了第一層量化後遺失的幾何細節。

2. **第二層量化（Refinement Stage - 中粒度）：**
   - 收集所有數據點的第一層殘差 $\{r^{(1)}\}$，訓練第二層 K-means 碼本 $\mathcal{C}^{(2)}$。
   - 針對殘差 $r^{(1)}$ 尋找最近中心 $c_{k_2}^{(2)}$，記錄其索引 $k_2$ 作為第 2 個 Token。
   - 計算更新後的殘差：
     $$r^{(2)} = r^{(1)} - c_{k_2}^{(2)} = v - c_{k_1}^{(1)} - c_{k_2}^{(2)}$$

3. **第 $m$ 層量化（Fine Stage - 細粒度）：**
   - 重複上述步驟至第 $M$ 層。對於上一層殘差 $r^{(m-1)}$，在碼本 $\mathcal{C}^{(m)}$ 中尋找中心 $c_{k_m}^{(m)}$，輸出 Token $k_m$，並更新殘差：
     $$r^{(m)} = r^{(m-1)} - c_{k_m}^{(m)}$$

<block>
**最終表示與幾何重構：**
商品向量 $v$ 被成功「翻譯」為長度為 $M$ 的離散 Token 序列：$[k_1, k_2, \dots, k_M]$。
其近似重構向量為各層碼本中心點的向量和：
$$v_{\text{approx}} = \sum_{m=1}^M c_{k_m}^{(m)}$$
第一層 Token 決定商品在大尺度幾何空間中的大類（如「電子產品 $\to$ 手機」），後續 Token 則在殘差空間中持續修正細節（如「品牌 $\to$ 螢幕尺寸 $\to$ 顏色」）。
</block>

---

## 3. 進階技術視角：率失真理論、正則化與編碼優化

雖然 RQ-Kmeans 的基礎流程非常直觀，但在處理高維、高度相關的真實數據時，純粹的幾何量化會面臨諸多退化問題。

### 率失真理論與變異數正則化 (RRQ)

在理想狀況下，我們希望碼本中每個 Codeword 的利用率（Codebook Utilization Rate, CUR）達到最大化。然而，直接在大規模高維數據上運行 K-means 常常會出現「死碼（Dead Codes）」——即某些聚類中心幾乎沒有數據點落入，導致碼本容量被嚴重浪費。

**正則化殘差量化（Regularized Residual Quantization, RRQ）** 引入了資訊理論中的率失真理論（Rate-Distortion Theory）與反向水閥（Reverse Water-Filling）原則：

- **動態維度選擇（Active Dimension Selection）：** 在深層殘差空間中，數據在某些維度的變異數已大幅衰減。RRQ 僅對變異數高於臨界值的維度進行量化，避免模型在低變異數的雜訊維度過度擬合。
- **變異數懲罰項：** 在 K-means 的平方誤差目標中加入變異數匹配懲罰，確保各層碼本分佈均勻，使碼本利用率逼近 100%。

### 貪婪解碼 vs. 束搜尋 (Beam Search)

在離線將向量轉為 Token 時，最簡單的方法是**貪婪編碼（Greedy Encoding）**：每層獨立選擇最近的中心。然而，由於前幾層的選擇會直接決定下一層殘差的方向，貪婪選擇往往會落入局部最優。

為了達到更低的全局重構失真，先進的量化框架會採用 **Beam Search**：在逐層選擇時維護 Top-$B$ 個候選 Token 序列路徑，最終選出總幾何失真 $\sum \|v - v_{\text{approx}}\|^2$ 最小的序列。

---

## 4. 關鍵對決：RQ-Kmeans vs. RQ-VAE

在生成式推薦領域，另一個備受關注的量化方案是 **RQ-VAE**。兩者雖然都產出階層式 Token 序列，但設計理念與工程取捨截然不同：

| 特性維度 | RQ-Kmeans (幾何量化) | RQ-VAE (深度生成模型) |
| :--- | :--- | :--- |
| **核心驅動** | **演算法驅動：** 基於 K-means 幾何空間劃分。 | **模型驅動：** 基於 VAE 概率分佈擬合與神經網絡。 |
| **訓練機制** | **解耦 / 兩階段式 (Two-stage)：** 先由預訓練模型產生向量，再獨立訓練量化器。 | **端到端 (End-to-end)：** 變分編碼器、離散碼本與解碼器聯合梯度更新。 |
| **優化目標** | 最小化幾何向量重構失真 $\|v - v_{\text{approx}}\|^2$。 | 最小化重構損失（如 CF 目標）與 KL 散度 (ELBO)。 |
| **運算成本與穩定性** | **極低、極穩定：** 無需反向傳播，不需處理 STE 梯度估算，訓練迅速且為強大 Baseline。 | **高成本、需調參：** 訓練複雜度高，需處理碼本崩塌與直通估算器（STE）技巧。 |
| **適用場景** | 系統已有高品質靜態 Embedding，追求高效率與穩健落地。 | 算力充足，追求端到端 SOTA 效能，希望碼本主動適應推薦目標。 |

---

## 5. 生成式推薦的四階段落地工作流

將 RQ-Kmeans 整合至工業級生成式推薦系統中，整體架構分為以下四個階段：

```
[ 階段一：向量生成 ] -> [ 階段二：RQ-Kmeans Token 化 ] -> [ 階段三：Transformer 自迴歸訓練 ] -> [ 階段四：線上推論與向量召回 ]
```

1. **階段一：物品向量生成 (Offline)**
   利用前置的深度雙塔模型（如 Item2Vec、DSSM 或圖神經網路）為全站商品生成高維度、語意豐富的連續嵌入向量 $v$。

2. **階段二：物品 Token 化 (Offline)**
   將所有商品向量輸入訓練好的 $M$ 層 RQ-Kmeans 量化器，為每個商品產出長度為 $M$ 的 Semantic ID：
   $$\text{Item}_A \longrightarrow [k_1, k_2, \dots, k_M]$$

3. **階段三：自迴歸推薦模型訓練 (Online / Offline)**
   將用戶的歷史行為序列轉換為展平的 Token 陣列：
   $$\text{User History: } [\text{Item}_A, \text{Item}_B] \longrightarrow [k_1^A, k_2^A, \dots, k_M^A, k_1^B, k_2^B, \dots, k_M^B]$$
   輸入 Transformer 模型中，以標準的 Next-Token Prediction 交叉熵損失訓練自迴歸生成能力。

4. **階段四：線上推論與檢索 (Inference)**
   模型根據用戶最新 Token 序列，自迴歸生成下一個商品對應的 $M$ 個 Token。系統取出碼本對應中心並求和重構出預估向量：
   $$v_{\text{pred}} = \sum_{m=1}^M c_{k_m}^{(m)}$$
   最後利用 Faiss / Milvus 等向量檢索庫進行 ANNS 近似最近鄰搜尋，完成 Top-$N$ 召回。

---

<takeaways>
- **解決的核心痛點：** 傳統漏斗級聯架構面臨跨模組通信與 IO 開銷大、阻礙 Scaling Law 等難題；生成式推薦對齊 LLM 範式，但面臨商品數量極大導致的「詞彙庫爆炸」困境。
- **Semantic ID (SID) 的解法：** 透過多步解碼將單一商品表示為 3~4 個 Token。在每步僅需小詞彙庫（如 $K=8192$）的前提下，可輕鬆覆蓋數千億級別的商品組合。
- **RQ-Kmeans 的幾何本質：** 採用「逐層求精」的殘差量化機制，第一層決定大類幾何區域，後續各層持續量化上一層的殘差，具備天然的 Coarse-to-fine 階層語意。
- **工程落地優勢：** 相較於複雜且難以收斂的端到端 RQ-VAE，RQ-Kmeans 具備極高的計算效率與穩定度，是工業界部署生成式推薦系統最為穩健的 Semantic ID Tokenizer。
</takeaways>

## 參考文獻（References）

1. Ferdowsi, S., et al. (2017). *Regularized Residual Quantization: a multi-layer sparse dictionary learning approach*.
2. Nguyen, T., et al. (2025). *BRIDLE: Generalized Self-supervised Learning with Quantization*.
3. Liu, X., et al. (2015). *Improved Residual Vector Quantization for High-dimensional Approximate Nearest Neighbor Search*.
4. Yuan, J., et al. (2015). *Transformed Residual Quantization for Approximate Nearest Neighbor Search*.
5. 知乎專欄（二師兄統領）：*生成式推薦入門2——RQ-Kmeans分詞器*.
