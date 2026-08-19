<meta>
Title: 乘積量化 Product Quantization (PQ)：十億級向量檢索與記憶體壓縮的底層幾何
Summary: 本文深入拆解乘積量化 (Product Quantization, PQ) 的幾何原理與數學本質，剖析子空間分割與組合碼本如何實現十億級高維向量的極致記憶體壓縮，並詳細介紹對稱 (SDC) 與非對稱距離計算 (ADC) 在 ANNS 向量搜尋中的實作細節。
Slug: product-quantization-high-dimensional-vector-compression-zh-tw
Output: notes/product-quantization-high-dimensional-vector-compression/product-quantization-high-dimensional-vector-compression-zh-tw.html
CanonicalId: product-quantization-high-dimensional-vector-compression
Cover: ./product-quantization.png
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: vector quantization, product quantization, vector search, machine learning, information retrieval
Status: drafting
Published: 2026-08-16
LastModified: 2026-08-16
</meta>

<draft>
- 1. 前言與破題：高維向量海量儲存與檢索高牆
    - 在搜尋、推薦與大模型 RAG 系統中，高維 Dense Embeddings (如 256 或 1024 維) 的全精確度 (FP32) 儲存開銷極其龐大。
    - 十億級向量全量載入記憶體需要數百 GB 甚至 TB 級 RAM，全量線性掃描 (Linear Scan) 的 L2 歐氏距離計算在線上響應延遲中無法採納。
    - 點出主角：介紹 2010 年由 Jégou 等人提出、成為現代向量資料庫與 Faiss 檢索引擎心臟的經典演算法——乘積量化 (Product Quantization, PQ)。
- 2. 底層幾何與數學原理：分而治之與笛卡兒積
    - 向量量化 (VQ) 瓶頸：單一 K-means 碼本在巨量類別時（如 K=10^8）面臨聚類與記憶體爆炸。
    - PQ 的核心直覺：正交子空間切割 (Subspace Segmentation)。將 D 維向量切分為 M 個 D/M 維獨立子空間。
    - 笛卡兒積組合 (Cartesian Product)：每段子空間獨立訓練大小為 K 的碼本 (Codebook)，透過子碼本組合表達 K^M 種離散狀態，僅需 M * K 個中心點的極小記憶體開銷。
- 3. PQ 演算法運作機制、編碼與距離計算
    - 步驟一：子空間分割與獨立 K-means 訓練。
    - 步驟二：向量編碼 (Encoding) 產出 M 個 8-bit 量化索引 (Quantized IDs)。
    - 步驟三：查表法快速歐幾里得距離計算（對稱距離 SDC vs. 非對稱距離 ADC）。
- 4. 實作細節與進階議題：幾何失真與旋轉 PQ (OPQ)
    - 幾何失真與子空間獨立性假定 (Subspace Independence Assumption)：當原始維度間存在強相關性時，隨機切分會導致嚴重的量化誤差。
    - 進階優化 (Optimized Product Quantization, OPQ)：在切分前進行正交矩陣旋轉 (Orthogonal Rotation)，最大化解耦子空間變異數。
- 5. 業界真實運用：Faiss、向量資料庫與倒排乘積量化 (IVF-PQ)
    - 獨立 PQ 仍需掃描全庫：雖然記憶體縮小 16~32 倍，但仍然是全庫查表掃描。
    - 倒排索引 + PQ (IVF-PQ)：先用粗粒度 IVF (Inverted File) 鎖定候選聚類，再用 PQ 對殘差進行高速查表量化計算，達成 10 毫秒級十億向量 ANNS 搜尋。
- 6. 優缺點與工程權衡
    - 優點：極致壓縮比 (32x ~ 64x)、極高速查表距離計算 (Lookup Table ADC)、易於 GPU 並行化。
    - 缺點：子空間平行無階層語意（不適用自迴歸 LLM 生成）、存在量化重構失真。
- 7. 總結與 ReviewKit
</draft>

# 乘積量化 Product Quantization (PQ)：十億級向量檢索與記憶體壓縮的底層幾何

<image>
src: ./product-quantization.png
alt: 乘積量化 (Product Quantization, PQ) 流程示意圖，展示高維向量切分子空間、獨立量化與組合表示
caption: 乘積量化 (Product Quantization, PQ) 運算機制與組合表示流程示意圖
</image>

在現代搜尋引擎、推薦系統與大語言模型（LLM）的 RAG 檢索架構中，多模態模型與雙塔模型會將文字、圖片或商品映射為高維度密集的浮點數向量（Dense Embeddings，通常為 256、512 乃至 1024 維）。

然而，當資料庫規模達到千萬、數億乃至十億級別時，高維向量檢索將立刻撞上**記憶體開銷與運算延遲的物理極限**：
1. **記憶體爆炸：** 一筆 512 維的單精度浮點數（FP32）向量佔用 2 KB；十億筆向量光是靜態儲存就需要高達 **2 TB** 的超大記憶體，硬體維運成本極度昂貴。
2. **計算延遲高牆：** 在線上推論時，若要計算查詢向量（Query）與全庫十億向量的 <information concept="concept.euclidean_distance">歐式距離</information>，哪怕使用 <information concept="concept.gpu">GPU</information> 進行廣義矩陣乘法（<information concept="concept.gemm">GEMM</information>），也無法滿足毫秒級（< 10ms）的即時響應需求。

為了突破這座高牆，工業界在近似最近鄰搜尋（Approximate Nearest Neighbor Search, ANNS）領域發展出了無數演算法。而其中最經典、最具革命性、至今仍作為 Faiss 與各大向量資料庫（Vector Databases）心臟的底層演算法，正是由 Hervé Jégou 等人於 2010 年提出的 **乘積量化 (Product Quantization, PQ)**。

本文將深度拆解乘積量化（PQ）的幾何原理、分而治之的數學本質、查表法非對稱距離計算（ADC），以及其在工業級向量檢索中的端到端實務應用。

## 1. 前言與破題：高維向量海量儲存與檢索高牆

在深入 PQ 之前，我們必須明白：**為什麼傳統的向量量化（如單一 K-means 聚類）無法勝任十億級向量的壓縮任務？**

正如在 <content-link canonical="k-means-clustering-around-centers">K-Means 聚類</content-link> 中所介紹的，向量量化 (Vector Quantization, VQ) 的核心思想是用一個核心中心點（Centroid，即碼字 Codeword）來代表一群相似的向量，並以該中心點的索引 ID（例如 0 到 $K-1$）來進行儲存。

若我們試圖用單一 <content-link canonical="k-means-clustering-around-centers">K-means</content-link> 碼本來量化高維商品向量：
* 若 $K=256$（1 位元組），量化誤差（Distortion）極大，無數截然不同的向量被強行併入同一個中心點，搜尋精確度慘不忍睹。
* 若要維持足夠的表達精度，我們可能需要 $K = 2^{64} \approx 1.8 \times 10^{19}$ 個中心點。然而，訓練與維護如此龐大的碼本在數學與工程上都是絕對不可能實現的。

**單一碼本的表達容量與儲存成本呈線性關係（$O(K)$），這限制了其在海量資料中的應用。** 要突破這個兩難困境，我們必須打破單一碼本的枷鎖，尋求一種能讓表達容量呈「指數級爆發」的全新幾何架構。

## 2. 底層幾何與數學原理：分而治之與笛卡兒積

乘積量化（Product Quantization, PQ）的核心突破，在於引進了**「正交子空間分割（Subspace Segmentation）」與「笛卡兒積組合（Cartesian Product）」**的幾何思想。

### 分而治之：子空間分割

假設我們有一個 $D$ 維的連續向量 $v \in \mathbb{R}^D$（例如 $D=256$）。PQ 不在完整的 $D$ 維空間中硬碰撞，而是將這個高維向量均勻切分為 $M$ 段獨立的低維子向量：

$$v = [v^{(1)}, v^{(2)}, \dots, v^{(M)}]$$

其中，每個子向量 $v^{(m)}$ 的維度縮減為 $D' = D / M$（若 $D=256, M=4$，則每個子空間維度僅為 $D'=64$）。

### 笛卡兒積組合：以小博大的指數容量

切分子空間後，PQ 為這 $M$ 個子空間**各自獨立訓練一個規模較小的 K-means 碼本** $\mathcal{C}^{(m)}$：

$$\mathcal{C}^{(m)} = \{c_0^{(m)}, c_1^{(m)}, \dots, c_{K-1}^{(m)}\}$$

其中每個碼本僅包含 $K$ 個子中心點（實務上常設 $K=256$，剛好佔用 1 個 Byte 的儲存空間）。

此時，整套 PQ 系統總共維護的中心點向量數量僅為：
$$\text{Memory Overhead} = M \times K \times D' \text{ 浮點數}$$

然而，透過這 $M$ 個小碼本的**笛卡兒積組合（Cartesian Product）**，全空間所能表達的有效碼字總數量 $\mathcal{C}_{\text{total}}$ 達到了驚人的指數級：

$$\mathcal{C}_{\text{total}} = \mathcal{C}^{(1)} \times \mathcal{C}^{(2)} \times \dots \times \mathcal{C}^{(M)} \Longrightarrow |\mathcal{C}_{\text{total}}| = K^M$$

以 $M=8, K=256$ 為例：
* **儲存需求：** 僅需維護 $8 \times 256 = 2,048$ 個低維子中心點。
* **表達容量：** 卻能組合表達出 $256^8 = 2^{64} \approx 1.84 \times 10^{19}$ 種獨一無二的向量狀態！

這正是乘積量化名稱中 **「乘積 (Product)」** 的由來——透過子空間的笛卡兒乘積，以極小且線性增長的儲存代價（$M \times K$），獲得了指數級爆發的空間表達能力（$K^M$）。

## 3. PQ 演算法運作機制、編碼與距離計算

乘積量化的端到端運作流程，可拆解為**離線擬合（Training）、向量編碼（Encoding）與線上檢索（Distance Computation）**三大階段。

### 步驟一：離線擬合與子碼本訓練
1. 收集全庫 $N$ 筆 $D$ 維向量訓練集。
2. 將所有向量切分為 $M$ 段 $D'$ 維子向量。
3. 對第 $m$ 段子向量集，運行標準 K-means 聚類，收斂得到大小為 $K$ 的子碼本 $\mathcal{C}^{(m)}$。

### 步驟二：向量編碼 (Encoding & Quantization)
對於資料庫中的任意向量 $v$：
1. 切分為 $M$ 段子向量 $[v^{(1)}, v^{(2)}, \dots, v^{(M)}]$。
2. 針對第 $m$ 段子向量 $v^{(m)}$，在對應的子碼本 $\mathcal{C}^{(m)}$ 中尋找歐氏距離最近的子中心點：
   $$i_m = \arg\min_{k \in \{0, \dots, K-1\}} \|v^{(m)} - c_k^{(m)}\|^2$$
3. 將原始 $D \times 32$ bits（如 256 個 FP32 = 1024 Bytes）的高維向量，壓縮為長度為 $M$ 的整數索引陣列：
   $$\text{PQ\_Code}(v) = [i_1, i_2, \dots, i_M]$$

若 $K=256$，每個 $i_m$ 僅需 1 個 Byte 表示。原本 1024 Bytes 的向量被極致壓縮至僅剩 **$M$ Bytes**（若 $M=8$，壓縮比高達 **128 倍**！）。

### 步驟三：查表法非對稱距離計算 (Asymmetric Distance Computation, ADC)

在 ANNS 向量搜尋中，當使用者發起一個查詢向量 $q \in \mathbb{R}^D$ 時，我們該如何計算 $q$ 與庫中經 PQ 壓縮後的向量 $v$ 之間的歐式距離？

業界存在兩種計算模式：
1. **對稱距離計算 (Symmetric Distance Computation, SDC)：** 先將查詢向量 $q$ 也量化為 PQ 碼，再計算兩組中心點之間的距離。由於 $q$ 與 $v$ 都經歷了量化失真，誤差疊加較大。
2. **非對稱距離計算 (Asymmetric Distance Computation, ADC)：** **保持查詢向量 $q$ 為精確的 FP32 不進行量化**，直接計算精確向量 $q$ 與全庫量化碼 $\text{PQ\_Code}(v)$ 之間的距離。此方法的量化失真小得多，也是工業界預設採用的模式。

#### 查表法（Lookup Table）極速加速機制

如果對庫中數億筆 PQ 碼逐一計算歐式距離，運算量依然巨大。ADC 巧妙地利用了**「空間可拆分性」與「預計算查表」**：

歐式距離的平方可拆解為各子空間距離之和：
$$\|q - v_{\text{approx}}\|^2 = \sum_{m=1}^M \|q^{(m)} - c_{i_m}^{(m)}\|^2$$

在搜尋開始前，系統先做一次性預計算（Precomputation）：
1. 將查詢向量 $q$ 切分為 $M$ 段 $[q^{(1)}, \dots, q^{(M)}]$。
2. 計算第 $m$ 段查詢子向量 $q^{(m)}$ 與該子碼本中**所有 $K$ 個子中心點**的距離，構建一張大小為 $M \times K$ 的 **距離查找表 (Distance Lookup Table, LUT)**：
   $$\text{LUT}[m][k] = \|q^{(m)} - c_k^{(m)}\|^2$$

建表耗時極短（只需計算 $M \times K$ 次低維歐氏距離）。完成 LUT 建構後，掃描全庫任何一個商品 $v$ 時，**完全不需要進行任何浮點數幾何運算**，只需根據商品儲存的 $M$ 個 Byte 索引，執行 $M$ 次記憶體查表並累加：

$$\text{Distance}(q, v) \approx \sum_{m=1}^M \text{LUT}[m][\text{PQ\_Code}(v)[m]]$$

這將複雜的浮點數向量乘法，降維打擊為極速的** CPU L1 Cache 查表與整數累加**，推論速度獲得了數十倍的飛躍！

## 4. 實作細節與進階議題：幾何失真與旋轉 PQ (OPQ)

儘管 PQ 擁有驚人的壓縮比與查表速度，但在實務落地時，工程師必須直面其背後的幾何假設限制與退化問題。

### 子空間獨立性假定 (Subspace Independence Assumption)

PQ 的數學基礎建立在一個強烈假設上：**被切分開的 $M$ 個子空間之間必須彼此獨立、互不相關。**

然而，真實世界的高維 Embeddings（如 Transformer 輸出的特徵向量）維度之間往往存在強烈的非對角協變性（Covariance）。如果生硬地按照維度順序隨機切分（例如前 64 維一組，次 64 維一組），很容易把強相關的特徵硬生生切在不同的子空間中，導致極大的幾何量化失真（Quantization Noise）。

### 優化乘積量化 Optimized Product Quantization (OPQ)

為了解決這個問題，Ge 等人提出了 **OPQ (Optimized Product Quantization)**。

OPQ 在 PQ 切分之前，引入了一個可學習的正則正交矩陣（Orthogonal Rotation Matrix）$R \in \mathbb{R}^{D \times D}$，對原始空間進行全局旋轉：

$$v' = R^T v$$

OPQ 透過交替優化（Alternating Optimization）演算法，聯合訓練旋轉矩陣 $R$ 與子碼本 $\mathcal{C}^{(m)}$：
* **旋轉矩陣 $R$ 的作用：** 解耦維度間的相關性，並平衡各子空間的變異數分佈（Variance Balance），確保切分後的每個子空間都承載均勻且獨立的資訊量。
* 實驗證明，經過正交旋轉後的 OPQ 能在相同的碼本大小下，顯著降低 ANNS 檢索的召回率損失。

## 5. 業界真實運用：Faiss、向量資料庫與倒排乘積量化 (IVF-PQ)

在實際大規模工業系統（如 Meta 開源的 Faiss 庫、Milvus、Qdrant 等向量資料庫）中，**單純的 PQ 很少單獨使用**。因為即便查表極快，對十億級資料進行單純的全庫掃描（Flat Scan），依然會面臨 CPU 記憶體頻寬瓶頸。

實務上最標準的工業級組合拳，是將 PQ 與倒排索引相結合的 **IVF-PQ (Inverted File with Product Quantization)** 索引架構：

```
[Query Vector q]
       │
       ▼
1. 粗粒度 IVF 搜尋 ──► 鎖定 Top-N 最近的桶 (Centroids)
       │
       ▼
2. 僅對桶內殘差進行 PQ 查表 (ADC) ──► 快速累加 LUT 距離
       │
       ▼
3. 排序輸出 Top-K 近鄰
```

### IVF-PQ 的雙層幾何分工：
1. **粗粒度倒排索引 (IVF Component)：** 先用一個大 K-means（如 $K_{\text{ivf}} = 65536$）將全庫向量劃分為數萬個區域（Buckets）。查詢時只需鎖定距離查詢向量最近的 $N_{\text{probe}}$ 個桶，瞬間過濾掉 99% 以上不相干的向量。
2. **細粒度殘差 PQ (PQ Component)：** 在每個桶內部，不直接儲存原始向量，而是儲存向量相對於桶中心的「殘差向量（Residuals）」，並對殘差向量進行 PQ 量化壓縮。

透過 **「IVF 剪枝 + 殘差 PQ 高速查表」**，系統能在數 GB 的普通伺服器記憶體中，實現十億級資料庫 **10 毫秒以內、Recall@100 > 90%** 的極致檢索效能！

## 6. 優缺點與工程權衡

乘積量化作為向量檢索領域的里程碑，其工程優缺點與適用邊界非常明確：

### 核心優勢
1. **極致的記憶體壓縮比：** 可將高維向量壓縮 16 倍到 128 倍，使 TB 級資料庫能輕鬆部署於單台伺服器記憶體中。
2. **查表法 (ADC) 極速推論：** 歐氏距離計算降維打擊為 L1 Cache 距離查找表與整數累加，極適合 CPU SIMD 指令集與 GPU 並行加速。
3. **高維表達容量：** 笛卡兒積組合 $K^M$ 賦予了其以小博大的幾何表達力。

### 局限與工程妥協
1. **存在不可逆的幾何失真：** 量化過程拋棄了部分幾何細節，高精確度要求的檢索場景需搭配原始向量進行 Re-ranking（重新排序）。
2. **子空間平行對等，缺乏階層語意（不適用自迴歸生成）：** 
   正如在 <content-link canonical="rq-kmeans-semantic-id-tokenizer-in-generative-recommendation">解構 Semantic ID：為什麼 RQ-Kmeans 是生成式推薦最穩健的 Tokenizer</content-link> 中所探討的，PQ 的 $M$ 個 Token 是平行的子空間索引，缺乏因果序與 Coarse-to-fine 的階層關係。這使其非常適合傳統向量檢索（ANNS），但**無法直接作為大模型 Next-Token Prediction 的自迴歸生成目標**（此場景需改用殘差量化 RQ）。

## 7. 總結

乘積量化（PQ）展現了數學幾何與工程優化的完美結合。它告訴我們：面對高維度的資料洪水，硬碰撞往往不可行；但透過巧妙的「子空間切分」與「笛卡兒積組合」，我們能以極小的記憶體代價，撬動龐大空間的表達能力。

從 Faiss 的底層架構到各大向量資料庫的效能引擎，乘積量化深刻影響了近十年巨量資料向量檢索的技術走向。理解 PQ 的幾何原理與 ADC 查表機制，不僅是掌握現代向量搜尋引擎的必經之路，也為我們在面對高維特徵壓縮與系統架構設計時，提供了極具啟發性的解題視角。

<reviewkit>
<takeaways>
- **高維向量檢索的兩大高牆：** 千萬至十億級高維 FP32 向量面臨 TB 級記憶體爆炸與線性掃描 (Linear Scan) 的 GEMM 計算延遲瓶頸。
- **PQ 的核心幾何哲學 (Cartesian Product)：** 切分 $M$ 段 $D/M$ 維子空間，各訓練大小為 $K$ 的子碼本。透過笛卡兒積組合表達 $K^M$ 種狀態，僅需 $M \times K$ 個中心點的極小記憶體開銷。
- **極致壓縮比：** 將 1024 Bytes 的高維向量壓縮為 $M$ 個 Byte 索引（若 $M=8, K=256$），實現高達 128 倍的記憶體壓縮。
- **非對稱距離計算 (ADC) 查表加速：** 查詢向量 $q$ 保持 FP32 不量化，一次性預計算 $M \times K$ 距離查找表 (LUT)。掃描全庫時將歐式距離計算降維為 L1 Cache 查表與整數累加。
- **工業級 IVF-PQ 組合拳：** 結合倒排索引 (IVF) 進行大範圍桶剪枝，再在桶內對殘差進行 PQ 查表量化，實現 10ms 級十億向量 ANNS 檢索。
- **與 RQ 的本質差異：** PQ 的 Token 是平行的子空間索引，非常適合向量檢索 (ANNS) 記憶體壓縮；但因缺乏因果與由粗到細 (Coarse-to-fine) 的階層語意，無法直接對齊自迴歸 LLM 生成（生成式推薦需改用殘差量化 RQ）。
</takeaways>
<qprompt/>
</reviewkit>

## 參考資料（References）

### 學術論文（Academic Literature）

1. Jégou, H., Douze, M., & Schmid, C. (2010). Product quantization for nearest neighbor search. *IEEE Transactions on Pattern Analysis and Machine Intelligence*, 33(1), 117-128. [IEEE Xplore](https://doi.org/10.1109/TPAMI.2010.57)
2. Ge, T., He, K., Ke, Q., & Sun, J. (2013). Optimized product quantization for approximate nearest neighbor search. In *Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)* (pp. 2946-2953). [IEEE Xplore](https://ieeexplore.ieee.org/document/6619223)

### 技術文章（Technical Articles）

1. [Faiss Documentation: Vector Quantization & Product Quantization](https://github.com/facebookresearch/faiss/wiki/Vector-quantization)
