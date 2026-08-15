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
LastModified: 2026-08-15
</meta>

<draft>
- 前言：從 Semantic ID 到多步解碼的幾何破局
    - 承接上文：回顧《生成式推薦的基石：Semantic ID 如何破解海量商品 Token 化難題》，點出將海量商品轉化為大語言模型（LLM）能讀懂的「階層式語意序列」是生成式推薦的成敗關鍵。
    - 引出痛點：商品在推薦系統中通常是以連續、高維度的浮點數向量（Embeddings）存在。LLM 只能處理離散的 Token，如何將連續空間轉換為離散字典？
    - 點出主角：介紹工業界 CP 值最高、最穩健的離散化方案——基於幾何聚類思維的 RQ-Kmeans (Residual Quantization K-means)，精準把商品向量壓縮成 3~4 個具備由粗到細語意的 SID Token。
- 核心思維：從連續空間到離散 Token 的幾何橋樑
    - 離散化的直覺陷阱（分桶與網格）：直覺想法是「空間分桶（Bucketing / Grid）」切豆腐劃分，但高維空間下資料分布極度不均勻（維度詛咒），會產生大量空桶且無法捕捉真實邊界。
    - 聚類即量化（Clustering as Quantization）：呼應《Discovering Hidden Structures》，聚類本質是尋找資料的自然群集並用核心特徵（Centroid）代表整個群體。不預先切分空間，而是透過 K-means 找出中心點 ID 作為 Token。
- 演算法進化：從基礎量化到 RQ-Kmeans 的階層破局
    - 基礎 K-means 作為最簡單的向量量化器：訓練階段在大量物品向量上聚類得出 K 個中心 (Centroids) 構成 Codebook；量化階段將新向量映射至最近中心點並以索引 ID 表示。痛點在於若 K 小則量化誤差過大，若 K 大（如 100 萬物品需要 100 萬中心）則碼本空間與訓練算力立刻爆炸。
    - 乘積量化 Product Quantization (PQ)——分而治之：為解決碼本爆炸，PQ 將高維向量（如 256 維）獨立切分為多段子空間（如 4 段 64 維），為每段獨立訓練小碼本（K=256），物品表示為 [id_seg1, id_seg2, id_seg3, id_seg4]。極小儲存即可涵蓋 256^4 種組合；但子空間獨立切分破壞了向量全局幾何特徵，且子空間平級無由粗到細的階層結構。
    - 殘差量化 Residual Quantization (RQ-Kmeans)——逐層細化：RQ 是 PQ 的關鍵變體，不切分空間，而是對全局向量採用「逐層細化、遞減殘差、逐步求精」策略。第 1 碼在大類空間鎖定方向，第 2~M 碼針對前層殘差繼續量化微調幾何細節。天然形成由粗到細的樹狀階層語意，完美契合 Semantic ID 需求。
- RQ-Kmeans 演算法運作機制與幾何重構
    - 第一層粗粒度量化 (Coarse Quantization)：在全量商品向量訓練第一層 K-means 碼本 C1，尋找與向量 v 最近中心 c1，第 1 個 Token 為 c1 索引 idx1，計算殘差 r1 = v - c1。
    - 第二層與多層殘差量化 (Refinement Stage)：收集第一層殘差 {r1} 訓練碼本 C2，針對 r1 找最近中心 c2，第 2 個 Token 為 idx2，更新殘差 r2 = r1 - c2。重複 M 次得到索引序列 [idx1, idx2, ..., idxM]。
    - 最終表示與近似重構：原始向量 v 被量化為長度 M 的 Token 序列 [idx1...idxM]，其近似重構向量為各層中心點向量和 v_approx = sum(cm)。
- 進階技術視角：率失真理論、正則化與解碼優化
    - 死碼危機與碼本坍塌 (Dead Codes)：基礎 RQ-Kmeans 容易產生未被使用的死碼導致利用率低落，引入 RRQ 反向水閥原則 (Reverse Water-Filling) 與變異數懲罰項強迫碼本分布均勻，極大化資訊熵。
    - 解碼策略（貪婪解碼 vs. Beam Search）：貪婪解碼容易陷入第一層選錯導致一步錯步步錯的局部陷阱；Beam Search 在量化解碼時維持 Top-B 候選路徑，能顯著降低全局幾何重構失真。
- (Callout) 關鍵對決：工業界為何偏愛 RQ-Kmeans 而非 RQ-VAE？
    - RQ-VAE (端到端神經量化) 的痛點：結合 AutoEncoder 能達成特徵與量化聯合優化，但依賴不可微的 Straight-Through Estimator (STE) 傳遞梯度，訓練極度不穩定且調參成本高昂。
    - RQ-Kmeans (兩階段幾何量化) 的絕對優勢：極致穩定（無梯度傳播、純 EM 演算法驅動，幾何收斂有數學保證）與資產複用（Plug-and-Play，可無縫接入現有 DSSM/Graph 高品質 Item Embedding）。
- 落地實踐：生成式推薦的四階段工作流
    - 階段一（離線訓練量化器）：獲取預訓練模型產出的商品 Embedding，訓練 M 層 RQ-Kmeans 碼本 C1...CM。
    - 階段二（離線商品 Token 化與總詞彙表）：編碼全站商品為長度 M 的 SID 序列（如 Item_A -> [12, 255, 7, 98]），建立大小為 M * K 的總詞彙表。
    - 階段三（生成式模型訓練）：將用戶歷史交互序列 Token 化並展平（如 [[12,255,7,98],[56,101,23,42]] 展平為 [12,255,7,98,56,101,23,42...]），訓練 Transformer 進行 Next-Token Prediction。
    - 階段四（線上推論、重構與 ANNS 召回）：輸入用戶最新歷史，模型自迴歸生成 M 個 Tokens [idx1...idxM]；從碼本取出中心向量求和重構預測向量 v_pred，利用 Faiss/Milvus 等 ANNS 引擎完成 Top-N 召回。
- 核心優勢總結與潛在探索性
    - 極強表達力與階層語意：M * K 儲存表達 K^M 組合，兼具精度、效率與由粗到細的階層結構。
    - 適應生成模型與潛在新穎性：將連續向量轉為離散序列生成；生成的 Token 組合若不對應現有商品，其重構向量可代表潛在用戶興趣點，開啟新穎探索空間。
</draft>

# 從幾何量化到生成式推薦：RQ-Kmeans 如何打造 Semantic ID Tokenizer

在<content-link canonical="semantic-id-in-generative-recommendation">生成式推薦的基石：Semantic ID 如何破解海量商品 Token 化難題</content-link>中，我們探討了 Semantic ID 的強大潛力。它徹底拋棄了傳統的無意義流水號，將海量商品轉化為大模型能讀懂的「階層式語意序列」。

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

## 2. 演算法進化：從基礎量化到 RQ-Kmeans 的階層破局

要理解 RQ-Kmeans（Residual Quantization K-means）的優勢，我們需要梳理向量量化（Vector Quantization, VQ）在技術上的演變脈絡：

### 1. 基礎 K-means 量化：最簡單的向量量化器

在向量量化中，<content-link canonical="k-means-clustering-around-centers">K-Means 聚類</content-link>可以被看作最直觀的基礎量化器：
- **訓練（Training）：** 對大量物品向量進行 K-means 聚類，得出 $K$ 個聚類中心（Centroids），這 $K$ 個中心點就構成了一個碼本（Codebook）。
- **量化（Quantization）：** 對於任何一個新的物品向量，找到碼本中距離最近的聚類中心，並用該中心的索引 ID（從 $0$ 到 $K-1$）來代表這個物品向量。

**痛點與兩難：**
- 若 $K$ 值太小，量化誤差（Distortion）會非常大，無法精確代表物品的細節。
- 若 $K$ 值極大（例如 100 萬個物品需要 100 萬個聚類中心），碼本會變得異常龐大，儲存與訓練算力會直接爆炸。

### 2. 乘積量化 (Product Quantization, PQ)：分而治之的折衷與局限

為了解決 K-means 的碼本爆炸問題，乘積量化（PQ）提出了一個巧妙的「分而治之」思路：
- **切分子空間：** 將一個高維向量（如 256 維）切分成多段獨立的子空間（如 4 段，每段 64 維）。
- **獨立量化：** 為每一段子空間獨立訓練一個小的 K-means 碼本（如 $K=256$）。
- **組合表示：** 一個物品向量被表示為多個子空間碼本索引的組合，例如 `[id_seg1, id_seg2, id_seg3, id_seg4]`。

**優點與致命局限：**
- **優點：** 只需要極小的儲存空間（$4 \times 256$ 個向量），就能表達 $256^4 \approx 43$ 億種組合，極大地提升了表達能力。
- **局限：** 子空間切割是並行且獨立的，破壞了向量的全局幾何特徵；更重要的是，各個子空間地位平等，**無法提供「由粗到細（Coarse-to-fine）」的階層語意結構**。

### 3. 殘差量化 (RQ-Kmeans)：逐層細化與階層結構

RQ-Kmeans 是 PQ 的一種重要變體。它不再將向量切分成獨立子空間，而是對全局向量採用了**「逐層細化、逐步求精」**的幾何逼近策略，天然具備樹狀階層結構。

---

## 3. RQ-Kmeans 演算法運作機制與幾何重構

假設我們要用 $M$ 個碼本（每個碼本大小為 $K$）來量化一個物品向量 $v \in \mathbb{R}^d$，RQ-Kmeans 的具體演算法步驟如下：

1. **第一層量化（Coarse Quantization - 粗粒度）：**
   - 在所有物品向量上訓練第一個 K-means 模型，得到碼本 $\mathcal{C}^{(1)}$。
   - 對於向量 $v$，在 $\mathcal{C}^{(1)}$ 中找到距離最近的中心 $c_1$。向量 $v$ 的第一個 Token 就是 $c_1$ 的索引 $\text{idx}_1$。
   - 計算殘差（Residual）：
     $$r_1 = v - c_1$$
     這個殘差 $r_1$ 代表了第一次量化後丟失的幾何資訊。

2. **第二層量化（Refinement - 中粒度）：**
   - 用所有物品向量的第一層殘差 $\{r_1\}$ 集合來訓練第二個 K-means 模型，得到碼本 $\mathcal{C}^{(2)}$。
   - 對於殘差 $r_1$，在 $\mathcal{C}^{(2)}$ 中找到最近的中心 $c_2$。向量 $v$ 的第二個 Token 就是 $c_2$ 的索引 $\text{idx}_2$。
   - 計算更新後的殘差：
     $$r_2 = r_1 - c_2 = (v - c_1) - c_2$$
     這個新殘差 $r_2$ 代表了第二層量化後仍然遺失的幾何細節。

3. **多層迭代至第 $M$ 層（Fine Quantization - 細粒度）：**
   - 重複這個過程 $M$ 次。在第 $m$ 層，我們量化上一層的殘差 $r_{m-1}$，得到碼本 $\mathcal{C}^{(m)}$、最近中心 $c_m$，輸出 Token $\text{idx}_m$，並更新殘差 $r_m = r_{m-1} - c_m$。

<block>
**最終表示與幾何重構：**
原始向量 $v$ 被成功量化為一個由 $M$ 個索引組成的序列：$[\text{idx}_1, \text{idx}_2, \dots, \text{idx}_M]$。這個序列就是物品最終的「Token 序列（Semantic ID）」。
向量 $v$ 的近似重構值為各層碼本中心點的向量和：
$$v_{\text{approx}} = \sum_{m=1}^M c_m = c_1 + c_2 + \dots + c_M$$
第一層 Token 決定商品在大尺度幾何空間中的大類（如「電子產品 $\to$ 手機」），後續 Token 則在殘差空間中持續修正細節（如「品牌 $\to$ 螢幕尺寸 $\to$ 顏色」）。
</block>

---

## 4. 進階技術視角：率失真理論、正則化與解碼優化

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

## 5. 關鍵對決：RQ-Kmeans vs. RQ-VAE

在生成式推薦領域，另一個備受關注的量化方案是 **RQ-VAE**。兩者雖然都產出階層式 Token 序列，但設計理念與工程取捨截然不同：

| 特性維度 | RQ-Kmeans (幾何量化) | RQ-VAE (深度生成模型) |
| :--- | :--- | :--- |
| **核心驅動** | **演算法驅動：** 基於 K-means 幾何空間劃分。 | **模型驅動：** 基於 VAE 概率分佈擬合與神經網路。 |
| **訓練機制** | **解耦 / 兩階段式 (Two-stage)：** 先由預訓練模型產生向量，再獨立訓練量化器。 | **端到端 (End-to-end)：** 變分編碼器、離散碼本與解碼器聯合梯度更新。 |
| **優化目標** | 最小化幾何向量重構失真 $\|v - v_{\text{approx}}\|^2$。 | 最小化重構損失（如 CF 目標）與 KL 散度 (ELBO)。 |
| **運算成本與穩定性** | **極低、極穩定：** 無需反向傳播，不需處理 STE 梯度估算，訓練迅速且為強大 Baseline。 | **高成本、需調參：** 訓練複雜度高，需處理碼本崩塌與直通估算器（STE）技巧。 |
| **適用場景** | 系統已有高品質靜態 Embedding，追求高效率與穩健落地。 | 算力充足，追求端到端 SOTA 效能，希望碼本主動適應推薦目標。 |

---

## 6. 生成式推薦的四階段落地工作流

將 RQ-Kmeans 放入生成式推薦的完整系統架構中，整體流程分為以下四個階段：

```
[ 階段一：訓練量化器 ] -> [ 階段二：物品 Token 化 ] -> [ 階段三：自迴歸模型訓練 ] -> [ 階段四：線上推論與 ANNS 召回 ]
```

1. **階段一：訓練量化器 (Offline)**
   - **獲取物品向量：** 首先，透過預訓練模型（如 Word2Vec、BERT、DSSM 或圖神經網絡 GNN）為系統中的所有物品生成高品質的連續嵌入向量 $v$。
   - **訓練 RQ-Kmeans：** 將所有物品的嵌入向量作為輸入，訓練一個 $M$ 層的 RQ-Kmeans 量化器。訓練完成後得到 $M$ 個碼本 $\mathcal{C}^{(1)}, \mathcal{C}^{(2)}, \dots, \mathcal{C}^{(M)}$。

2. **階段二：物品 Token 化與建立總詞彙表 (Offline)**
   - **編碼所有物品：** 對於系統中的每一個物品，將其嵌入向量輸入訓練好的 RQ-Kmeans 量化器中，生成長度為 $M$ 的 Token 序列，例如：
     $$\text{Item}_A \longrightarrow [12, 255, 7, 98]$$
   - **建構總詞彙表：** 所有 Token 的取值範圍是 $0$ 到 $K-1$。由於有 $M$ 個碼本，總詞彙表的大小通常是 $M \times K$。每個 Token $(m, k)$ 代表「第 $m$ 個碼本中的第 $k$ 個索引」。

3. **階段三：訓練生成式推薦模型 (Online / Offline)**
   - **轉換與展平用戶序列：** 將用戶的歷史交互序列（如 $[\text{Item}_A, \text{Item}_B, \text{Item}_C]$）轉換成 Token 序列並展平：
     $$\text{原始序列: } [\text{Item}_A, \text{Item}_B, \text{Item}_C]$$
     $$\text{Token 化後: } [[12, 255, 7, 98], [56, 101, 23, 42], [88, 12, 199, 6]]$$
     $$\text{展平輸入模型: } [12, 255, 7, 98, 56, 101, 23, 42, 88, 12, 199, 6, \dots]$$
   - **自迴歸訓練：** 將展平後的 Token 序列輸入 Transformer 模型中，訓練其自迴歸預測下一個 Token 的能力。例如輸入 $[12, 255, 7]$，模型預測 $98$；輸入 $[12, 255, 7, 98]$，模型預測 $56$，以此類推。

4. **階段四：線上推論、重構與召回 (Inference)**
   - **輸入用戶歷史：** 將用戶最新的交互序列 Token 化並展平輸入模型。
   - **生成下一個物品的 Tokens：** 模型自迴歸地生成下一個目標物品的 $M$ 個 Tokens，如 $[\text{idx}_1, \text{idx}_2, \dots, \text{idx}_M]$。
   - **解碼為物品向量：** 根據生成的 Token 序列，從對應碼本中取出中心向量並相加，重構出預估的物品向量：
     $$v_{\text{pred}} = \sum_{m=1}^M \mathcal{C}^{(m)}[\text{idx}_m]$$
   - **向量召回：** 在所有物品的向量庫中，利用高效的向量檢索技術（如 Faiss / Milvus），找到與 $v_{\text{pred}}$ 最相似的 Top-$N$ 個物品，作為最終的推薦結果。

---

## 7. 核心優勢總結與潛在探索性

1. **強大的表示能力：**
   透過 $M$ 層碼本組合，僅需極小的儲存空間（$M \times K$ 個向量）就能表示海量的物品（理論上高達 $K^M$ 種組合），實現了精確度與存儲效率的完美平衡。

2. **天然的階層結構：**
   RQ 的第一層 Token 決定了物品的粗粒度類別（Coarse），後續 Token 不斷進行幾何細化（Fine-grained）。這種階層性極大地有助於模型學習物品之間的複雜層級關係與語意相近度。

3. **完美適應生成模型：**
   成功將連續向量空間中的推薦問題，轉化為離散序列生成問題，使得 Transformer 等強大的 LLM 生成式架構可以無縫應用於推薦領域。

4. **生成新穎物品與潛在興趣探索 (Novel Item Generation)：**
   模型自迴歸生成的 Token 組合在資料庫中可能並不對應於任何一個已存在的真實物品，但其重構出來的向量 $v_{\text{pred}}$ 可能代表一個「新穎的」或「潛在的」用戶興趣點。這為推薦系統的探索性（Exploration）與多樣性（Diversity）提供了創新的理論與工程可能性。

<takeaways>
- **解決的核心痛點：** 傳統漏斗級聯架構面臨跨模組通信與 IO 開銷大、阻礙 Scaling Law 等難題；生成式推薦對齊 LLM 範式，但面臨商品數量極大導致的「詞彙庫爆炸」困境。
- **Semantic ID (SID) 的解法：** 透過多步解碼將單一商品表示為 3~4 個 Token。在每步僅需小詞彙庫（如 $K=8192$）的前提下，可輕鬆覆蓋數千億級別的商品組合。
- **RQ-Kmeans 的幾何本質：** 採用「逐層求精」的殘差量化機制，第一層決定大類幾何區域，後續各層持續量化上一層的殘差，具備天然的 Coarse-to-fine 階層語意。
- **工程落地優勢：** 相較於複雜且難以收斂的端到端 RQ-VAE，RQ-Kmeans 具備極高的計算效率與穩定度，是工業界部署生成式推薦系統最為穩健的 Semantic ID Tokenizer。
</takeaways>

## 參考文獻（References）

1. [知乎：生成式推荐入门2——RQ-Kmeans分词器](https://zhuanlan.zhihu.com/p/1949167463393650590)，破壞了向量的全局幾何特徵；更重要的是，各個子空間地位平等，**無法提供「由粗到細（Coarse-to-fine）」的階層語意結構**。

### 3. 殘差量化 (RQ-Kmeans)：逐層細化與階層結構

RQ-Kmeans 是 PQ 的一種重要變體。它不再將向量切分成獨立子空間，而是對全局向量採用了**「逐層細化、逐步求精」**的幾何逼近策略，天然具備樹狀階層結構：

給定一個商品的原始高維特徵向量 $v \in \mathbb{R}^d$，預計使用 $M$ 層碼本（每層大小為 $K$）進行殘差遞減量化：

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

<takeaways>
- **解決的核心痛點：** 傳統漏斗級聯架構面臨跨模組通信與 IO 開銷大、阻礙 Scaling Law 等難題；生成式推薦對齊 LLM 範式，但面臨商品數量極大導致的「詞彙庫爆炸」困境。
- **Semantic ID (SID) 的解法：** 透過多步解碼將單一商品表示為 3~4 個 Token。在每步僅需小詞彙庫（如 $K=8192$）的前提下，可輕鬆覆蓋數千億級別的商品組合。
- **RQ-Kmeans 的幾何本質：** 採用「逐層求精」的殘差量化機制，第一層決定大類幾何區域，後續各層持續量化上一層的殘差，具備天然的 Coarse-to-fine 階層語意。
- **工程落地優勢：** 相較於複雜且難以收斂的端到端 RQ-VAE，RQ-Kmeans 具備極高的計算效率與穩定度，是工業界部署生成式推薦系統最為穩健的 Semantic ID Tokenizer。
</takeaways>

## 參考文獻（References）

1. [知乎：生成式推荐入门2——RQ-Kmeans分词器](https://zhuanlan.zhihu.com/p/1949167463393650590)