<meta>
Title: 從幾何量化到生成式推薦：RQ-Kmeans 如何打造 Semantic ID Tokenizer
Summary: 本文承接 Semantic ID 概念，深挖生成式推薦中最穩健的 Tokenizer 方案——RQ-Kmeans 的幾何殘差量化原理、解碼策略 (Beam Search)、進階正則化 (RRQ)、業界四階段工作流與優缺點權衡。
Slug: from-geometric-quantization-to-generative-recommendation-rq-kmeans-zh-tw
Output: notes/from-geometric-quantization-to-generative-recommendation-rq-kmeans/from-geometric-quantization-to-generative-recommendation-rq-kmeans-zh-tw.html
CanonicalId: from-geometric-quantization-to-generative-recommendation-rq-kmeans
Cover: ./from-geometric-quantization-to-generative-recommendation-rq-kmeans.png
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: recommendation systems, generative retrieval, vector quantization, rq-kmeans, machine learning
Status: published
Published: 2026-08-02
LastModified: 2026-08-16
</meta>

<draft>
- 1. 前言與破題：離散化與 Token 化的核心挑戰
    - 承接上文《Semantic ID 如何破解海量商品 Token 化難題》，點出將連續向量轉換為離散階層 Token 序列的核心任務，引出 RQ-Kmeans 作為工業界最穩健的落地方案。
- 2. 底層幾何與數學原理
    - 向量量化 (VQ) 哲學：碼本 (Codebook) 與碼字 (Codeword) 的數學定義與失真目標。
    - 技術選型比較 (PQ vs RQ)：乘積量化 (PQ) 平行切分與自迴歸 Next-Token 衝突；殘差量化 (RQ) 遞減殘差天然成長出 Coarse-to-fine 樹狀階層。
    - 殘差量化 (RQ) 數學推導：殘差序列 r_m 與求和近似重構 v_approx。
- 3. RQ-Kmeans 演算法運作機制、解碼策略與幾何重構
    - 三步驟：第一步粗量化 (c1)、第二步殘差細化 (cm)、第三步向量近似重構。
    - 解碼策略 (Greedy vs. Beam Search)：降低幾何重構失真。
- 4. 實作細節與進階議題
    - 死碼危機與碼本坍塌 (Dead Codes)：高維稀疏空間的無效碼字。
    - 正則化殘差量化 (RRQ)：動態維度選擇與變異數匹配懲罰。
    - RQ-Kmeans vs RQ-VAE 對決與混合熱啟動 (Warm-up) 策略。
- 5. 業界真實運用：四階段端到端工作流
    - 離線量化器訓練 -> 離線 Token 化與 Trie 建構 -> 自迴歸模型 Next-Token 訓練 -> 線上推論與兩路召回 (ANNS / 精準 SID)。
- 6. 優缺點與工程權衡
    - 優點：指數容量 K^M、階層語意、EM 完全收斂、潛在興趣探索 (Novel Item)。
    - 缺點與痛點：資訊遺失 (ID 碰撞)、解碼延遲 (M 步)、Trie Tree 記憶體開銷。
- 7. 總結與 ReviewKit
</draft>

# 從幾何量化到生成式推薦：RQ-Kmeans 如何打造 Semantic ID Tokenizer

在<content-link canonical="semantic-id-in-generative-recommendation">生成式推薦的基石：Semantic ID 如何破解海量商品 Token 化難題</content-link>一文中，我們探討了 Semantic ID (SID) 的核心概念與目標——透過將高維連續向量轉化為長度為 $M$ 的離散 Token 序列，避開傳統 Atomic ID 導致的 Softmax 算力爆炸，並賦予大模型 Zero-shot 冷啟動與前綴包容能力。

然而，知道「需要 Semantic ID」只是第一步。在實際工程推進時，我們該如何將連續的高維商品嵌入向量（Embeddings），穩定且精準地轉化為離散的 SID 序列？

本文將聚焦於目前工業界 CP 值最高、落地最穩健的離散化方案——**RQ-Kmeans (Residual Quantization K-means)**，從底層幾何原理、演算法機制、工程實作細節到業界真實工作流進行全面拆解。

## 1. 前言與破題：離散化與 Token 化的核心挑戰

商品在傳統推薦系統中，通常是以連續、高維度的浮點數向量（Embeddings）形式存在，而自迴歸大模型則擅長處理離散的 Token 序列。這帶來一個關鍵問題：**我們該如何將連續的高維向量空間，精準且高效地轉換為離散且具備由粗到細語意階層的 SID 序列？**

要達成這個目標，本質上需要解決兩個循序漸進的難題：
1. **如何將連續向量映射到離散的「碼本（Codebook）」中？**（連續空間 $\to$ 離散字典的映射問題）
2. **如何讓這些碼本的 ID 構成「由粗到細（Coarse-to-fine）」的階層式結構？**（單一特徵 $\to$ 階層序列的結構問題）

## 2. 底層幾何與數學原理

要解決第一個難題，最直覺的幾何工具就是<content-link canonical="k-means-clustering-around-centers">K-Means 聚類</content-link>。正如在<content-link canonical="discovering-hidden-structures-what-clustering-really-does">Discovering Hidden Structures</content-link>中提到的，聚類的本質是尋找資料的自然群落，並用核心特徵代表群體。

### 向量量化 (Vector Quantization, VQ) 的數學本質

在向量量化（Vector Quantization, VQ）的術語中：
* **碼字（Codeword）：** 聚類算法找出的聚類中心點向量（Centroid）$c_k \in \mathbb{R}^D$。
* **碼本（Codebook）：** 所有 $K$ 個碼字集結而成的參考向量集合 $\mathcal{C} = \{c_0, c_1, \dots, c_{K-1}\}$。
* **離散 ID：** 代表特定碼字的索引編號 $\text{idx} \in \{0, 1, \dots, K-1\}$。

向量量化的底層哲學，就是**不切割空間，而是讓資料自己決定聚落，並用聚落的中心點（碼字）來建構碼本**。量化的優化目標是最小化幾何失真（Distortion）：
$$\min_{\mathcal{C}} \sum_{v} \min_{c_k \in \mathcal{C}} \|v - c_k\|^2$$

任何新的商品向量 $v$，只要找到碼本中距離最近的碼字 $c_k$，就能以該碼字的索引 ID 來代表這個商品。

<block>
title: 技術選型對決：為什麼選擇 RQ 而非 PQ？
content:
在向量量化與資料壓縮領域，最著名的兩種組合量化手法分別是 **乘積量化 (Product Quantization, PQ)** 與 **殘差量化 (Residual Quantization, RQ)**。

在傳統的雙塔推薦模型時代，PQ 與 RQ 曾被廣泛用於向量檢索引擎（如 Faiss）中，作為離線檢索與記憶體壓縮的底層工具。然而，當推薦系統轉向自迴歸生成（Generative Retrieval）時，工程師發現這兩種量化手法在對齊大模型時產生了本質上的分歧：

* **乘積量化 (Product Quantization, PQ) 的局限：**
  PQ 的做法是將一個高維向量切割成 $M$ 段獨立的子空間（例如 256 維切分成 4 段 64 維），每段各自進行量化。雖然這能以極小儲存表達 $K^M$ 種組合，但 **PQ 的 $M$ 個 Token 在邏輯上是完全平行、地位對等的**。大模型本質上是自迴歸（Autoregressive）的 Next-Token Prediction 網路，要求模型去依次「預測」4 個毫不相干、缺乏因果與階層依賴的平行子空間 Token，在邏輯與語意學習上非常違和。

* **殘差量化 (Residual Quantization, RQ) 的契合：**
  與 PQ 的平行切分不同，RQ 選擇保留完整的全局向量，改採「逐層逼近、遞減殘差」的策略。第一個 Token 鎖定宏觀大類，後續 Token 則沿著殘差方向逐層修正細部幾何。這讓 Token 序列天然成長為一棵「由粗到細 (Coarse-to-fine)」的階層語意樹，**完美契合了自迴歸模型的序列生成特性**。
</block>

## 3. RQ-Kmeans 演算法運作機制、解碼策略與幾何重構

<image>
src: ./from-geometric-quantization-to-generative-recommendation-rq-kmeans.png
alt: RQ-Kmeans 殘差量化編碼流程與索引重構架構圖，展示多層殘差量化、索引序列生成與中心點求和重構
caption: RQ-Kmeans 殘差量化編碼流程與索引重構架構示意圖
</image>

假設我們使用 $M$ 層碼本來量化一個連續向量 $v$，具體的運作機制可拆解為三個核心階段：

### 第一步：粗粒度量化 (Coarse Quantization)

在全量商品向量上訓練第一層 K-means 碼本 $\mathcal{C}^{(1)}$。針對目標向量 $v$，尋找距離最近的碼字（中心點）$c_1$，第 1 個 Token 即為 $c_1$ 的索引 $\text{idx}_1$。

接著計算殘差，這代表第一次粗量化後尚未捕捉到的幾何細節：
$$r_1 = v - c_1$$

### 第二步：多層殘差量化 (Refinement Stage)

收集所有第一層的殘差 $\{r_1\}$，以此為訓練集擬合第二層碼本 $\mathcal{C}^{(2)}$。針對殘差 $r_1$ 尋找距離最近的碼字 $c_2$，第 2 個 Token 即為 $\text{idx}_2$。

接著繼續更新殘差，計算第二層量化後依然遺留的誤差：
$$r_2 = r_1 - c_2 = (v - c_1) - c_2$$

重複此過程 $M$ 次，在第 $m$ 層針對上一層留下的殘差 $r_{m-1}$ 持續尋找最佳碼字 $c_m$ 並記錄索引 $\text{idx}_m$。最終，原始向量 $v$ 就被轉換為一組長度為 $M$ 的離散索引序列：
$$\text{SID}(v) = [\text{idx}_1, \text{idx}_2, \dots, \text{idx}_M]$$

### 第三步：向量近似重構 (Geometric Reconstruction)

有了這組 Token 序列，在幾何空間中該如何還原該商品？我們只需從各層碼本取出對應的中心點向量並直接求和，即可得到原始向量的近似重構向量 $v_{\text{approx}}$：
$$v_{\text{approx}} = \sum_{m=1}^M c_m = c_1 + c_2 + \dots + c_M$$

從幾何視角來看，$c_1$ 先在大尺度空間定位宏觀類別（如「電子產品 $\to$ 手機」），後續的 $c_2, \dots, c_M$ 則在殘差空間中扮演微調向量，沿著殘差方向不斷修正細部幾何位置（如「品牌 $\to$ 尺寸 $\to$ 顏色」）。

<block>
title: 解碼策略：貪婪解碼 vs. 束搜尋 (Beam Search)
content:
在將原始連續向量轉換為離散 Token 序列的過程中（也就是決定上述每層最近中心點的「量化解碼」階段），我們究竟該如何選擇每一層的中心點？實務上有兩種截然不同的策略：

* **貪婪解碼 (Greedy Encoding)：** 每層獨立選擇距離最近的中心。缺點是前幾層的選擇會直接決定下一層殘差的空間走向，貪婪選擇往往會落入「一步錯，步步錯」的局部陷阱。
* **束搜尋 (Beam Search)：** 在量化解碼時維護 Top-$B$ 個候選 Token 序列路徑。這種方式考量了全局最佳解，能顯著降低整體的幾何重構失真 $\sum \|v - v_{\text{approx}}\|^2$。
</block>

## 4. 實作細節與進階議題

在真實的工程落地場景中，RQ-Kmeans 並非完美無缺。當面對極端高維且稀疏的真實數據時，純粹的幾何量化會遭遇一些棘手的退化問題與技術挑戰。

### 死碼危機與碼本坍塌 (Dead Codes)

在理想狀況下，我們會希望碼本中每個 Codeword 的利用率（Codebook Utilization Rate, CUR）達到最大化。畢竟，碼本容量是我們預先設定好的寶貴資源（如 $K=8192$），如果只有少數幾個中心點被頻繁使用，其餘中心點全部閒置，就等於白白浪費了模型的表達能力。

如同在<content-link canonical="k-means-clustering-around-centers">K-Means: Clustering Around Centers</content-link>中所探討的，在大規模高維數據上運行 K-means 常常會出現空群集（Empty Clusters），或是某些聚類中心幾乎沒有數據點落入。這會導致碼本有效容量被嚴重稀釋，發生碼本坍塌，在量化領域中被稱為「死碼（Dead Codes）」現象。

為了解決這個問題，業界常透過**正則化殘差量化（Regularized Residual Quantization, RRQ）**，引入資訊理論中的率失真理論（Rate-Distortion Theory）與反向水閥（Reverse Water-Filling）原則：
* **動態維度選擇（Active Dimension Selection）：** 在深層殘差空間中，數據在某些維度的變異數已大幅衰減。RRQ 僅對變異數高於臨界值的維度進行量化，避免模型在低變異數的雜訊維度上過度擬合。
* **變異數懲罰項：** 在 K-means 的平方誤差優化目標中加入變異數匹配懲罰，強迫各層碼本的使用分佈更加均勻，極大化資訊熵，讓碼本利用率逼近 100%。

<block>
title: 架構選型與權衡：RQ-Kmeans 與 RQ-VAE 的技術路徑之爭
content:
在生成式推薦領域，除了幾何導向的 RQ-Kmeans，另一個備受關注的量化方案是 **RQ-VAE (端到端神經量化)**。兩者雖然都能產出階層式 Token 序列，但在架構設計理念與工程取捨上截然不同：

| 特性維度 | RQ-Kmeans (幾何量化) | RQ-VAE (深度生成模型) |
| :--- | :--- | :--- |
| **核心驅動** | **演算法驅動：** 基於 K-means 幾何空間劃分。 | **模型驅動：** 基於 VAE 機率分佈擬合與神經網路。 |
| **訓練機制** | **解耦 / 兩階段式：** 由預訓練模型產出向量後，獨立訓練量化器。 | **端到端 (E2E)：** 編碼器、離散碼本與解碼器聯合進行梯度更新。 |
| **運算成本與穩定性** | **極低、極穩定：** 無梯度傳播，純 EM 演算法驅動，收斂具備數學保證。 | **高成本、調參敏感：** 依賴不可微的 STE 傳遞梯度，訓練容易不穩定。 |
| **適用場景** | 系統已有高品質 Embedding，追求高效率與穩健落地。 | 算力充足，追求端到端 SOTA 效能，希望碼本能根據推薦目標共同演化。 |

儘管 RQ-VAE 透過 AutoEncoder 架構實現特徵學習與量化碼本的聯合優化，理論上限更高；但在工業落地時，它高度依賴不可微的 Straight-Through Estimator (STE) 來近似梯度，容易面臨碼本坍塌與訓練發散的風險，調參與算力成本顯著偏高。

相較之下，**RQ-Kmeans 展現了極高的工程實用性**：除了純幾何優化帶來的極致穩定外，它具備極佳的**資產複用性 (Plug-and-Play)**，能夠直接無縫接入現有 DSSM、雙塔或 Graph 模型產出的高品質 Item Embedding，無需重構上游特徵管線。

**💡 實務混用策略 (Hybrid Strategy)：**
在實際落地中，兩者並非二選一的對立關係。業界常見的 Best Practice 是採用「熱啟動（Warm-up）」策略：先利用 RQ-Kmeans 在離線快速聚類出穩健的初始碼本，作為 RQ-VAE 的初始化權重（Initialization），隨後再進行端到的微調。如此既能避開從零隨機初始化導致的訓練動盪，又能保留神經網路微調的上限空間。
</block>

## 5. 業界真實運用：四階段端到端工作流

在推薦系統邁向生成式架構的過程中，RQ-Kmeans 扮演了連接「連續特徵工程」與「離散自迴歸建模」的橋樑。整個落地流程可劃分為四個核心階段：

### 階段一：離線訓練量化器 (Offline Quantizer Training)
1. **獲取物品向量：** 複用既有特徵工程資產，由預訓練模型（如 DSSM、雙塔、GraphSAGE 或多模態模型）為全站物品產出高品質的連續嵌入向量 $v$。
2. **訓練 RQ-Kmeans：** 將全量物品向量作為輸入進行幾何分群，逐層最小化殘差，產出 $M$ 層穩健的中心點碼本 $\mathcal{C}^{(1)}, \mathcal{C}^{(2)}, \dots, \mathcal{C}^{(M)}$。

### 階段二：離線商品 Token 化與字典樹建構 (Offline Tokenization & Trie Construction)
量化器訓練完成後，便可作為離線 Tokenizer 使用（此階段為純推論編碼，不更新碼本）：
1. **編碼全站物品：** 遍歷商品庫，將每個物品的連續向量輸入 RQ-Kmeans（搭配 Beam Search 降低重構失真），轉換為長度為 $M$ 的 SID 序列（例如 `[12, 255, 7, 98]`）。
2. **建構總詞表與 Trie Tree：** 若每層碼本大小為 $K$（如 $K=256$），則整套系統的總詞表容量僅需 $M \times K = 1024$；同時構建合法 SID 字典樹，用於線上約束解碼。

### 階段三：自迴歸推薦模型訓練 (Generative Model Training)
1. **序列展平：** 根據物品與 SID 的映射關係，將用戶的歷史行為序列逐一轉為 Token 並展平（如 `[ItemA, ItemB] -> [12, 255, 7, 98, 56, 101, 23, 42]`）。
2. **Next-Token Prediction 訓練：** 送入 Transformer 骨幹網路（如 SASRec 或自迴歸大模型），以標準交叉熵損失進行 Next-Token 預測訓練。

### 階段四：線上推論與雙路召回 (Online Inference & Dual-Branch Retrieval)
線上推論階段，模型根據用戶最新歷史自迴歸預測出 $M$ 個 SID Tokens。實務上有兩種召回分支：
1. **精準 SID 直比對：** 透過 Trie Tree 約束解碼，直接將生成出的完整 SID 映射回實體商品 ID。
2. **重構向量 ANNS 召回：** 將生成出的 $M$ 個 Token 取出碼字向量求和重構出興趣向量 $v_{\text{pred}} = \sum c_m$，並在 ANNS 引擎中進行連續向量近鄰搜尋。

## 6. 優缺點與工程權衡

了解了 RQ-Kmeans 的幾何原理與端到端工作流後，我們總結其在工業落地中的優缺點與工程權衡：

### 核心優勢
1. **指數級的表達容量（以小博大）：** 僅需維護 $M \times K$ 個中心點向量，就能組合表達出 $K^M$ 種狀態。
2. **天然由粗到細的階層語意（Coarse-to-fine）：** 第 1 層 Token 鎖定宏觀大類，後續 Token 逐步微調幾何細節，降低大模型學習難度。
3. **極致的穩定性與資產複用：** 無梯度傳播，純 EM 幾何優化，收斂具備數學保證，且能隨插即用現有 Embedding 資產。
4. **潛在興趣探索與新穎性 (Novel Item Exploration)：** 自迴歸生成出的 Token 序列求和重構向量 $v_{\text{pred}}$ 依然落在合理幾何空間，可代表使用者的潛在興趣點。

### 痛點與工程限制
1. **資訊遺失與 ID 碰撞 (Collision)：** 強制將連續向量離散化至 3~4 層 Token 必然帶來誤差，極相似商品會被映射到相同 SID，需仰賴下游輕量 Ranker 進行集內排序。
2. **自迴歸解碼延遲：** 生成一個商品需等待 $M$ 步自迴歸解碼，限制了 $M$ 不能設定過大（實務上常取 $M=3 \sim 4$）。
3. **Trie Tree 記憶體開銷：** 當商品庫達到億級時，線上維護高深度字典樹會帶來不小的記憶體維運壓力。

## 7. 總結與核心要點

要讓推薦系統真正走向生成式架構，最難的一步往往是如何將連續的高維向量，轉換成自迴歸模型能理解的離散 Token。

RQ-Kmeans 透過遞減殘差的幾何機制，不只解決了海量商品的詞表爆炸問題，還順勢建構出具備 Coarse-to-fine 階層關係的 Semantic ID。比起追求極致的端到端神經網路，RQ-Kmeans 勝在務實與穩定。它能直接複用系統現有的 Embedding 資產，其重構向量的特性也為系統的探索性留下了空間，是目前串聯連續特徵與離散 LLM 語意最可靠的選擇之一。

<reviewkit>
<takeaways>
- **生成式推薦的詞表爆炸難題：** 傳統推薦系統的商品多以連續高維向量存在，而大模型依賴離散 Token。若直接將商品 ID 映射為 Token，會面臨難以訓練與算力吃緊的「詞彙庫爆炸」困境。
- **演進之路的關鍵取捨 (PQ vs. RQ)：** 乘積量化 (PQ) 雖能以小詞表表達海量組合，但切分子空間會破壞全局特徵且缺乏階層性；RQ-Kmeans 則透過保留全局向量進行殘差逼近，成功克服了這個致命傷。
- **RQ-Kmeans 的幾何本質 (Coarse-to-fine)：** 採用「逐層求精、遞減殘差」的機制，第一層鎖定大類幾何區域，後續層持續量化殘差。這不僅只需 $M \times K$ 的空間就能表達 $K^M$ 種組合，更天然建構了 Semantic ID 所需的樹狀階層語意。
- **實務陷阱與解碼優化：** 在高維稀疏數據中，純幾何量化易遭遇「死碼 (Dead Codes)」導致碼本坍塌。實務上必須搭配 RRQ 正則化（極大化資訊熵）與 Beam Search 搜尋策略，才能有效提高碼本利用率並降低全局重構失真。
- **重構向量與探索性 (Exploration)：** RQ-Kmeans 不只是壓縮工具，大模型生成的 Token 組合即使不存在對應實體商品，也能反向重構為連續空間中的「潛在興趣向量」，搭配 ANNS 引擎大幅提升了推薦系統的探索性。
- **工程選型與混合策略 (Hybrid Strategy)：** 相較於難以收斂的端到端 RQ-VAE，RQ-Kmeans 具備極高的穩定度，且能隨插即用（Plug-and-Play）現有的 Embedding 資產。業界 Best Practice 常以 RQ-Kmeans 產出初始碼本進行「熱啟動（Warm-up）」，再交由 RQ-VAE 微調，兼顧工程穩定與效能上限。
</takeaways>
<qprompt/>
</reviewkit>

## 參考文獻（References）

1. [知乎：生成式推荐入门2——RQ-Kmeans分词器](https://zhuanlan.zhihu.com/p/1949167463393650590)
2. [Emergent Mind: RQ-KMeans: Hierarchical Residual Quantization](https://www.emergentmind.com/topics/residual-quantization-rq-kmeans)
t-Token Prediction 範式進行推薦。
4. **潛在興趣探索與新穎性（Novel Item Exploration）：**
     模型自迴歸生成出的 Token 序列，即使在資料庫中找不到完全對應的現有商品，其求和重構出的向量 $v_{\text{pred}}$ 依然落在合理的幾何空間中，代表著使用者的「潛在興趣點」。這為系統兼顧探索性（Exploration）與多樣性（Diversity）開啟了全新的工程空間。
5. **高度可調的工程彈性（Flexibility of $M$）：**
     碼本層數 $M$ 賦予了系統在「推論延遲」與「表徵精度」之間靈活權衡（Trade-off）的能力——調小 $M$ 可加速自迴歸解碼，調大 $M$ 則能更精準地還原商品特徵。

然而，RQ-Kmeans 雖然擁有上述諸多優勢與優美的數學幾何直覺，但在真實的工程落地場景中，它並非完美無缺。當面對極端高維且稀疏的真實數據時，純粹的幾何量化會遭遇一些棘手的退化問題與技術挑戰。

## 進階技術視角：死碼危機與碼本坍塌 (Dead Codes)

在理想狀況下，我們會希望碼本中每個 Codeword 的利用率（Codebook Utilization Rate, CUR）達到最大化。畢竟，碼本容量是我們預先設定好的寶貴資源（如 $K=8192$），如果只有少數幾個中心點被頻繁使用，其餘中心點全部閒置，就等於白白浪費了模型的表達能力。

如同在<content-link canonical="k-means-clustering-around-centers">K-Means: Clustering Around Centers</content-link>中所探討的，在大規模高維數據上運行 K-means 常常會出現空群集（Empty Clusters），或是某些聚類中心幾乎沒有數據點落入。這會導致碼本有效容量被嚴重稀釋，發生碼本坍塌，在量化領域中被稱為「死碼（Dead Codes）」現象。

為了解決這個問題，業界常透過**正則化殘差量化（Regularized Residual Quantization, RRQ）**，引入資訊理論中的率失真理論（Rate-Distortion Theory）與反向水閥（Reverse Water-Filling）原則：
* **動態維度選擇（Active Dimension Selection）：** 在深層殘差空間中，數據在某些維度的變異數已大幅衰減。RRQ 僅對變異數高於臨界值的維度進行量化，避免模型在低變異數的雜訊維度上過度擬合。
* **變異數懲罰項：** 在 K-means 的平方誤差優化目標中加入變異數匹配懲罰，強迫各層碼本的使用分佈更加均勻，極大化資訊熵，讓碼本利用率逼近 100%。

<block>
title: 架構選型與權衡：RQ-Kmeans 與 RQ-VAE 的技術路徑之爭
content:
在生成式推薦領域，除了幾何導向的 RQ-Kmeans，另一個備受關注的量化方案是 **RQ-VAE (端到端神經量化)**。兩者雖然都能產出階層式 Token 序列，但在架構設計理念與工程取捨上截然不同：

| 特性維度 | RQ-Kmeans (幾何量化) | RQ-VAE (深度生成模型) |
| :--- | :--- | :--- |
| **核心驅動** | **演算法驅動：** 基於 K-means 幾何空間劃分。 | **模型驅動：** 基於 VAE 機率分佈擬合與神經網路。 |
| **訓練機制** | **解耦 / 兩階段式：** 由預訓練模型產出向量後，獨立訓練量化器。 | **端到端 (E2E)：** 編碼器、離散碼本與解碼器聯合進行梯度更新。 |
| **運算成本與穩定性** | **極低、極穩定：** 無梯度傳播，純 EM 演算法驅動，收斂具備數學保證。 | **高成本、調參敏感：** 依賴不可微的 STE 傳遞梯度，訓練容易不穩定。 |
| **適用場景** | 系統已有高品質 Embedding，追求高效率與穩健落地。 | 算力充足，追求端到端 SOTA 效能，希望碼本能根據推薦目標共同演化。 |

儘管 RQ-VAE 透過 AutoEncoder 架構實現特徵學習與量化碼本的聯合優化，理論上限更高；但在工業落地時，它高度依賴不可微的 Straight-Through Estimator (STE) 來近似梯度，容易面臨碼本坍塌與訓練發散的風險，調參與算力成本顯著偏高。

相較之下，**RQ-Kmeans 展現了極高的工程實用性**：除了純幾何優化帶來的極致穩定外，它具備極佳的**資產複用性 (Plug-and-Play)**，能夠直接無縫接入現有 DSSM、雙塔或 Graph 模型產出的高品質 Item Embedding，無需重構上游特徵管線。

**💡 實務混用策略 (Hybrid Strategy)：**
在實際落地中，兩者並非二選一的對立關係。業界常見的 Best Practice 是採用「熱啟動（Warm-up）」策略：先利用 RQ-Kmeans 在離線快速聚類出穩健的初始碼本，作為 RQ-VAE 的初始化權重（Initialization），隨後再進行端到端的微調。如此既能避開從零隨機初始化導致的訓練動盪，又能保留神經網路微調的上限空間。
</block>

在理解了 RQ-Kmeans 的幾何原理與進階優化後，我們來看看在工業界中，工程團隊如何將它無縫接入生成式推薦的端到端管線中。

## 落地實踐：生成式推薦的三階段工作流

在推薦系統邁向生成式架構的過程中，RQ-Kmeans 扮演了連接「連續特徵工程」與「離散自迴歸建模」的橋樑。整個落地流程可劃分為三個核心階段：

### 階段一：離線訓練量化器 (Offline Quantizer Training)
1. **獲取物品向量：** 複用既有特徵工程資產，由預訓練模型（如 DSSM、雙塔、GraphSAGE 或多模態模型）為全站物品產出高品質的連續嵌入向量 $v$。
2. **訓練 RQ-Kmeans：** 將全量物品向量作為輸入進行幾何分群，逐層最小化殘差，產出 $M$ 層穩健的中心點碼本 $\mathcal{C}^{(1)}, \mathcal{C}^{(2)}, \dots, \mathcal{C}^{(M)}$。

### 階段二：離線商品 Token 化與總詞表建構 (Offline Tokenization)
量化器訓練完成後，便可作為離線 Tokenizer 使用（此階段為純推論編碼，不更新碼本）：
1. **編碼全站物品：** 遍歷商品庫，將每個物品的連續向量輸入 RQ-Kmeans（可搭配 Beam Search 降低重構失真），轉換為長度為 $M$ 的 SID 序列。例如：
     $$\text{Item}_A \longrightarrow [12, 255, 7, 98]$$

2. **建構總詞彙表：** 若每層碼本大小為 $K$（如 $K=8192$），則整套系統的總詞表容量僅需 $M \times K$，即可精準表徵全站數億級別的商品集合。

### 階段三：自迴歸推薦模型訓練 (Generative Model Training)
1. **序列轉換與展平：** 根據物品與 SID 的映射關係，將用戶的歷史行為序列逐一轉為 Token 並展平：
     * 原始行為序列：$[\text{Item}_A, \text{Item}_B]$
     * 轉為 SID 序列：$[[12, 255, 7, 98], [56, 101, 23, 42]]$
     * 展平輸入模型：$[12, 255, 7, 98, 56, 101, 23, 42, \dots]$

2. **Next-Token Prediction 訓練：** 將展平後的 Token 序列送入 Transformer 骨幹網路（如 SASRec 或自迴歸大模型），以標準的交叉熵損失進行自迴歸訓練，讓模型學會根據過去的行為軌跡，逐層預測下一個目標商品的階層式 Token。

## 總結

要讓推薦系統真正走向生成式架構，最難的一步，往往是如何將連續的高維向量，轉換成自迴歸模型能理解的離散 Token。

回顧從 K-means、PQ 到 RQ-Kmeans 的技術演進，其實就是一個不斷在「壓縮效率」與「語意保留」間尋找平衡的過程。RQ-Kmeans 透過遞減殘差的機制，不只解決了海量商品的詞表爆炸問題，還順勢建構出具備 Coarse-to-fine 階層關係的 Semantic ID。

比起追求極致的端到端神經網路，RQ-Kmeans 勝在務實。它足夠穩定、能直接複用系統現有的 Embedding 資產，其重構向量的特性也為系統的探索性留下了空間。在生成式推薦的落地實踐中，這套基於幾何量化的方案，確實是目前串聯連續特徵與離散 LLM 語意最可靠的選擇之一。

<reviewkit>
<takeaways>
- **生成式推薦的詞表爆炸難題：** 傳統推薦系統的商品多以連續高維向量存在，而大模型依賴離散 Token。若直接將商品 ID 映射為 Token，會面臨難以訓練與算力吃緊的「詞彙庫爆炸」困境。
- **演進之路的關鍵取捨 (PQ vs. RQ)：** 乘積量化 (PQ) 雖能以小詞表表達海量組合，但切分子空間會破壞全局特徵且缺乏階層性；RQ-Kmeans 則透過保留全局向量進行殘差逼近，成功克服了這個致命傷。
- **RQ-Kmeans 的幾何本質 (Coarse-to-fine)：** 採用「逐層求精、遞減殘差」的機制，第一層鎖定大類幾何區域，後續層持續量化殘差。這不僅只需 $M \times K$ 的空間就能表達 $K^M$ 種組合，更天然建構了 Semantic ID 所需的樹狀階層語意。
- **實務陷阱與解碼優化：** 在高維稀疏數據中，純幾何量化易遭遇「死碼 (Dead Codes)」導致碼本坍塌。實務上必須搭配 RRQ 正則化（極大化資訊熵）與 Beam Search 搜尋策略，才能有效提高碼本利用率並降低全局重構失真。
- **重構向量與探索性 (Exploration)：** RQ-Kmeans 不只是壓縮工具，大模型生成的 Token 組合即使不存在對應實體商品，也能反向重構為連續空間中的「潛在興趣向量」，搭配 ANNS 引擎大幅提升了推薦系統的探索性。
- **工程選型與混合策略 (Hybrid Strategy)：** 相較於難以收斂的端到端 RQ-VAE，RQ-Kmeans 具備極高的穩定度，且能隨插即用（Plug-and-Play）現有的 Embedding 資產。業界 Best Practice 常以 RQ-Kmeans 產出初始碼本進行「熱啟動（Warm-up）」，再交由 RQ-VAE 微調，兼顧工程穩定與效能上限。
</takeaways>
<qprompt/>
</reviewkit>

## 參考文獻（References）

1. [知乎：生成式推荐入门2——RQ-Kmeans分词器](https://zhuanlan.zhihu.com/p/1949167463393650590)
2. [Emergent Mind: RQ-KMeans: Hierarchical Residual Quantization](https://www.emergentmind.com/topics/residual-quantization-rq-kmeans)