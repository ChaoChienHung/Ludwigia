<meta>
Title: 解構 Semantic ID：為什麼 RQ-Kmeans 是生成式推薦最穩健的 Tokenizer
Summary: 本文從連續空間的離散化出發，探討推薦系統如何從 K-means 聚類、向量量化 (VQ) 一路演進至 RQ-Kmeans，藉此解決海量物品詞彙庫爆炸問題，並深入解析殘差量化的底層幾何原理、進階正則化與業界落地工作流。
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
    - 承接上文，點出將連續向量轉換為離散階層 Token 序列的核心任務，並說明 Tokenizer 必須同時具備的兩項特質（映射離散 ID、由粗到細階層）。
- 2. 尋找 Tokenizer 的基石：從聚類到向量量化 (VQ)
    - 離散化的直覺陷阱：為何不能用生硬的網格分桶？（維度詛咒、破壞語意）。
    - 聚類即量化：利用 K-means 找出資料自然群集，引出向量量化 (VQ) 哲學。
    - 定義 VQ：正式引入碼本 (Codebook) 與碼字 (Codeword) 的概念，解決第一個難題。
- 3. 突破單層極限：殘差量化 (RQ) 的誕生
    - VQ 的局限：單層碼本缺乏階層結構，且高解析度會導致碼本指數爆炸。
    - 殘差量化 (RQ)：不切分空間，而是「逐層細化、遞減殘差」，天然成長出 Coarse-to-fine 樹狀階層，完美契合自迴歸模型。
- 4. RQ-Kmeans 演算法運作機制與幾何重構
    - 拆解三步驟：第一步粗量化 (c1)、第二步殘差細化 (cm)、第三步向量近似重構。
- 5. 實作細節與挑戰
    - 解碼策略：貪婪解碼 (Greedy) vs. 束搜尋 (Beam Search) 的取捨。
    - 死碼危機與碼本坍塌 (Dead Codes)：高維稀疏空間的退化問題。
    - 正則化殘差量化 (RRQ)：動態維度選擇與變異數匹配懲罰。
- 6. 業界真實運用與架構選型
    - 四階段端到端工作流：離線量化器訓練 -> 離線 Token 化與 Trie 建構 -> 自迴歸模型 Next-Token 訓練 -> 線上推論與兩路召回。
    - 架構選型：RQ-Kmeans vs RQ-VAE 的技術路徑之爭與混合熱啟動 (Warm-up) 策略。
- 7. 總結與 ReviewKit
</draft>

# 解構 Semantic ID：為什麼 RQ-Kmeans 是生成式推薦最穩健的 Tokenizer

在<content-link canonical="semantic-id-in-generative-recommendation">生成式推薦的基石：Semantic ID 如何破解海量商品 Token 化難題</content-link>一文中，我們探討了 Semantic ID (SID) 的核心概念——為了避開傳統 Atomic ID 導致的 Softmax 算力爆炸，我們必須將海量商品轉換為大模型能理解的「長度為 $M$ 的階層式語意 Token 序列」。

然而，知道「需要 Semantic ID」只指出了終點，工程實踐上的考驗才剛開始。在傳統的推薦系統中，商品通常是以連續、高維度的浮點數向量（Embeddings）形式存在；而自迴歸大模型則擅長處理一段又一段離散的 Token 序列。

這帶來了一個最為關鍵的工程問題：**我們該如何將連續的高維向量空間，精準、高效且充滿語意地轉換為離散的 SID 序列？**

要達成這個目標，本質上，我們需要一種強大的 Tokenizer。這個 Tokenizer 必須同時具備解決以下兩個核心問題的能力：
1. **將連續空間映射到離散 ID：** 如何將無限可能的連續向量，精準地對應到一組有限、具體的「離散 ID 字典」中？
2. **構築由粗到細的階層結構：** 如何讓這串離散 ID 序列在邏輯上不只是隨機的編號，而是能構成「由粗到細（Coarse-to-fine）」的階層式樹狀語意？

本文將與讀者一同走過這段從連續空間走向離散化的演進之路，從最基礎的 K-means 聚類與向量量化出發，最終深入探討目前工業界 CP 值最高、落地最穩健的終極方案——**RQ-Kmeans (Residual Quantization K-means)**。

## 1. 尋找 Tokenizer 的基石：從聚類到向量量化 (VQ)

我們的首要任務，是解決第一個難題：如何有意義地將連續向量轉換為離散 ID。

### 離散化的直覺陷阱：生硬的網格分桶

說到連續轉離散，許多人腦海中浮現的第一個直覺是「空間分桶（Bucketing / Grid）」。這就像是拿著一把刀，把多維空間劃分成等分的網格，只要資料落入同一個網格，我們就賦予它們同一個離散 ID。

但當我們來到幾百維的商品向量空間時，這種做法會立刻撞上「維度詛咒（Curse of Dimensionality）」。真實世界的高維資料分佈往往極度不均，生硬的網格化不僅會產生海量根本沒有資料的「空桶」，白白浪費儲存資源；更致命的是，它完全無法捕捉資料真實的語意邊界。死板的網格線常常會把語意極為相近的商品硬生生切開，分到不同的桶子裡。

網格化最大的盲點在於：網格只是一個人為劃定的幾何方塊，它的幾何中心通常無法反映內部資料的真實樣貌，這讓我們無法賦予這個離散 ID 任何具體的「代表性語意」。

### 聚類即量化：讓資料自己說話

既然人為的網格行不通，我們能不能順應資料本身的分佈，做出更聰明的劃分？在<content-link canonical="discovering-hidden-structures-what-clustering-really-does">Discovering Hidden Structures</content-link>一文中，我們曾提及聚類的本質就是尋找資料的自然群集，並用該群落的「核心特徵」來代表整個群體。這恰好完美契合了離散化的目標。

與其盲目地切割空間，不如直接透過 K-means 演算法，在所有商品向量中找出 $K$ 個最能代表資料分佈的聚類中心點（Centroids）。這種「不強制切分空間，而是讓資料自己決定聚落，並用聚落中心點來代表個體」的底層哲學，在數學上被精煉為一個專有名詞——**向量量化（Vector Quantization, VQ）**。

在 VQ 的世界裡，有幾個核心術語：
* **碼字（Codeword）：** K-means 找出來的那 $K$ 個聚類中心點向量，例如 $c_k \in \mathbb{R}^D$。它們是具備真實語意的代表性向量。
* **碼本（Codebook）：** 所有 $K$ 個碼字集結而成的參考字典 $\mathcal{C} = \{c_0, c_1, \dots, c_{K-1}\}$。
* **離散 ID：** 特定碼字在碼本中的索引編號 $\text{idx} \in \{0, 1, \dots, K-1\}$。

量化的過程非常直觀：給定一個連續的商品向量 $x$，我們直接在 Codebook 裡找一個距離它最近的中心點 $c_1$ 來代表它：
$$\text{近似向量 } \hat{x} = c_1$$

只要找到最近的碼字 $c_1$，我們就能把這個商品的連續向量，轉換為該碼字的索引 ID。至此，我們優雅地解決了第一個難題——成功建構了有語意的離散映射。

## 2. 突破單層極限：殘差量化 (RQ) 的誕生

雖然 VQ 成功把商品變成了離散 ID，但如果我們直接把它餵給自迴歸大模型，會立刻遭遇第二個難題的嚴峻考驗。標準的單層 VQ 存在兩個致命局限：

1. **無法建構階層：** 單層 VQ 只會輸出「一個」平面的離散 ID。這就像是給商品貼上一個無意義的流水號，完全沒有大模型所需的那種「由粗到細（Coarse-to-fine）」的階層式樹狀語意。缺乏上下文因果，Next-Token Prediction 就無從發揮。
2. **碼本指數爆炸：** 如果我們想用一個 ID 就精準區分淘寶或亞馬遜上數以億計的微小商品差異，這個 Codebook 的大小必須呈指數級爆炸（例如需要 $2^{32}$ 個碼字）。這在記憶體儲存與近鄰搜尋的算力上，是完全不可行的。

<block>
title: 迷思破解：為何不直接用單一 K-means 當作詞表就好？
content:
這個想法很直覺：既然幾億個商品太多，那就把它們聚類成 8192 個群，詞彙表不就縮小了嗎？但如果我們只依賴這種單一碼本的範式，會立刻陷入兩難的困境：

* **若 $K$ 值太小（例如 8192）：** 雖然解決了詞表過大的問題，但量化誤差（Distortion）會非常驚人。這意味著可能會有成千上萬個截然不同的商品被強行映射到同一個 Codebook ID 上，模型根本無法區分這些商品的細微差異，推薦將變得極度粗糙。
* **若 $K$ 值極大（例如 100 萬）：** 為了精確代表物品的細節，我們賦予每個商品獨特的聚類中心。但這時碼本的儲存空間與大模型的訓練算力又會直接爆炸，本質上又退回了傳統 ID 詞表爆炸的老路。

這就是為什麼單一 K-means 無法直接作為 Semantic ID 的原因。我們必須突破單一碼本的限制，往**多碼本組合**的方向發展。
</block>

單純的 VQ 不完全符合大模型的需求，我們必須在此基礎上繼續演化。

### 殘差量化 (Residual Quantization) 的階層魔法

為了解決缺乏階層與碼本爆炸的問題，工程界將量化過程從「單次」改為「多層迭代」，發展出了**殘差量化（Residual Quantization, RQ）**。

RQ 的核心精神是：**不試圖用一個龐大的碼本一次到位，而是用幾個小碼本（例如 4 層，每層僅 256 個中心點），一層一層地逼近目標。**

在 RQ 的架構下，第一層碼本找完最近的中心點 $c_1$ 後，商品向量 $x$ 肯定還會有一些沒被完美捕捉的幾何誤差，我們稱之為「殘差」：
$$\text{殘差 } r_1 = x - c_1$$

接著，RQ 會把這個剩下的誤差 $r_1$ 送到第二層 Codebook 繼續量化，找到代表殘差的中心點 $c_2$。以此類推，最終原向量可以被多個層級的碼字相加組合來逼近：
$$\hat{x} = c_1 + c_2 + c_3 + \dots + c_M$$

**為什麼 RQ 能完美解決我們的第二個挑戰？**
這背後的幾何意義非常優美。在遞減殘差的機制下，第一層的 Token ($c_1$) 必須負擔最大的幾何定位責任，因此它天然鎖定了商品的「宏觀大類」（如 3C 產品）。而後續層級的 Token ($c_2, c_3$) 則專注於修補前一層留下的微小誤差，也就是沿著殘差方向逐層修正細部的幾何特徵（如品牌 $\to$ 尺寸 $\to$ 顏色）。

這種「先大尺度定位，後微小修正」的數學過程，讓輸出的 Token 序列天然成長為一棵「由粗到細」的階層語意樹，完美契合了自迴歸模型需要因果推論與序列生成的特性！

## 3. RQ-Kmeans 演算法運作機制與幾何重構

<image>
src: ./from-geometric-quantization-to-generative-recommendation-rq-kmeans.png
alt: RQ-Kmeans 殘差量化編碼流程與索引重構架構圖，展示多層殘差量化、索引序列生成與中心點求和重構
caption: RQ-Kmeans 殘差量化編碼流程與索引重構架構示意圖
</image>

將 VQ、RQ 與 K-means 結合在一起，我們就得到了今天的主角：**RQ-Kmeans**。假設我們設定使用 $M$ 層碼本來量化連續向量 $x$，其具體運作機制可拆解為三個核心階段：

### 第一步：粗粒度量化 (Coarse Quantization)

首先，我們在全量商品向量上訓練第一層的 K-means 碼本 $\mathcal{C}^{(1)}$。針對目標向量 $x$，我們尋找距離它最近的碼字（中心點）$c_1$，第 1 個 Token 便是 $c_1$ 的索引 $\text{idx}_1$。

接著，計算第一次粗量化後遺留的殘差：
$$r_1 = x - c_1$$

### 第二步：多層殘差細化 (Refinement Stage)

我們收集所有商品在第一層產生的殘差 $\{r_1\}$，將這些殘差作為新的訓練集，擬合出第二層碼本 $\mathcal{C}^{(2)}$。針對殘差 $r_1$，我們尋找距離最近的碼字 $c_2$，第 2 個 Token 即為 $\text{idx}_2$。

接著繼續更新殘差，計算第二層量化後依然遺留的誤差：
$$r_2 = r_1 - c_2 = (x - c_1) - c_2$$

這個過程會重複 $M$ 次。在第 $m$ 層，我們針對上一層留下的殘差 $r_{m-1}$ 持續尋找最佳碼字 $c_m$ 並記錄索引 $\text{idx}_m$。最終，原始高維向量 $x$ 就被完美轉換為一組長度為 $M$ 的離散索引序列：
$$\text{SID}(x) = [\text{idx}_1, \text{idx}_2, \dots, \text{idx}_M]$$

### 第三步：向量近似重構 (Geometric Reconstruction)

有了這組階層式的 Token 序列，如果我們想在幾何空間中還原該商品該怎麼做？我們只需從各層碼本取出對應的中心點向量，並將它們直接相加求和，即可得到原始向量的近似重構向量 $\hat{x}$：
$$\hat{x} = \sum_{m=1}^M c_m = c_1 + c_2 + \dots + c_M$$

## 4. 實作細節與挑戰

儘管 RQ-Kmeans 的數學直覺非常漂亮，但在真實的工程落地場景中，當我們面對極端高維且稀疏的真實業務數據時，純粹的幾何量化會遭遇一些棘手的退化問題與解碼挑戰。

### 解碼策略：貪婪解碼 (Greedy) vs. 束搜尋 (Beam Search)

在決定每一層該挑選哪個中心點時（推論解碼階段），實務上有兩種截然不同的取捨策略：

* **貪婪解碼 (Greedy Encoding)：** 每層獨立且短視地選擇當下距離最近的中心。缺點是前幾層的選擇會直接決定下一層殘差的空間走向，貪婪選擇往往會落入「一步錯，步步錯」的局部陷阱，導致最終加總的重構誤差較大。
* **束搜尋 (Beam Search)：** 為了克服局部陷阱，我們在解碼時維護 Top-$B$ 個候選 Token 序列路徑。在每一層探索多個可能的中心點組合，直到最後一層再挑選整體幾何重構失真 $\sum \lVert x - \hat{x} \rVert^2$ 最小的那條路徑。這能顯著提升 Token 序列的表徵品質。

### 死碼危機與正則化殘差量化 (RRQ)

在理想狀況下，我們會希望碼本中每個碼字都能被均勻使用。然而，在大規模高維數據上運行 K-means 常常會出現空群集（Empty Clusters）。如果碼本中只有少數幾個中心點被頻繁使用，其餘中心點全部閒置，就會發生碼本坍塌，在量化領域中被稱為「死碼（Dead Codes）」現象。

為了解決死碼問題，業界會採用**正則化殘差量化（Regularized Residual Quantization, RRQ）**，引入反向水閥（Reverse Water-Filling）原則來強制作為：
* **動態維度選擇：** 在深層的殘差空間中，數據在某些維度的變異數其實已經大幅衰減，只剩下雜訊。RRQ 僅對變異數高於臨界值的維度進行量化，避免模型過度擬合雜訊。
* **變異數懲罰項：** 在 K-means 原本的平方誤差優化目標中，強行加入變異數匹配懲罰，約束各層碼本的使用分佈必須更加均勻。透過極大化資訊熵，讓碼本的利用率逼近 100%。

## 5. 業界真實運用與架構選型

了解了 RQ-Kmeans 的原理與優化後，我們來看看工程團隊如何將它無縫接入生成式推薦的端到端管線。

### 四階段端到端工作流

1. **離線訓練量化器 (Offline Quantizer Training)：**
   首先，系統會複用既有特徵工程的資產，由預訓練模型（如 DSSM、雙塔）為全站物品產出高品質的連續嵌入向量 $x$。接著，對這些向量進行幾何分群，逐層最小化殘差，訓練出 $M$ 層穩健的中心點碼本 $\mathcal{C}^{(1)}, \dots, \mathcal{C}^{(M)}$。
2. **離線商品 Token 化與字典樹建構 (Offline Tokenization & Trie Construction)：**
   量化器訓練完成後，遍歷百萬至億級別的商品庫，將每個物品的連續向量輸入 RQ-Kmeans（搭配 Beam Search），轉換為長度為 $M$ 的 SID 序列。同時，系統會將所有合法的 SID 構建成一棵字典樹 (Trie Tree)，用於後續的線上約束解碼。
3. **自迴歸推薦模型訓練 (Generative Model Training)：**
   將用戶的歷史行為序列逐一轉為 Token 並展平。例如將瀏覽過的 `[ItemA, ItemB]` 轉換為連續的 SID 序列，送入 Transformer 骨幹網路以交叉熵損失進行 Next-Token 預測訓練。
4. **線上推論與雙路召回 (Online Inference & Dual-Branch Retrieval)：**
   線上推論階段，模型自迴歸預測出接下來的 $M$ 個 SID Tokens。實務上設有兩種召回分支：
   * **精準 SID 直比對：** 透過 Trie Tree 進行約束解碼，直接將完整的 SID 映射回實體商品 ID。
   * **重構向量 ANNS 召回：** 將生成的 $M$ 個 Token 取出對應碼字求和，重構出使用者的「興趣向量」 $\hat{x}_{\text{pred}}$，並放進 ANNS 引擎中進行連續向量相似度召回。

<block>
title: 架構選型：RQ-Kmeans 與 RQ-VAE 的技術路徑之爭
content:
在生成式推薦的演進中，除了幾何導向的 RQ-Kmeans，另一個備受關注的方案是基於深度生成模型的 **RQ-VAE (端到端神經量化)**。

RQ-VAE 的最大賣點在於**端到端 (E2E) 訓練**：編碼器、離散碼本與解碼器可以聯合進行梯度更新，這讓碼本能根據最終的推薦目標共同演化，理論上限極高。

然而，在工業落地時，RQ-VAE 高度依賴不可微的 Straight-Through Estimator (STE) 來近似梯度，導致訓練過程極度不穩定，極易面臨碼本坍塌，調參成本高昂。

相較之下，**RQ-Kmeans 展現了極高的務實度**。由於它是純粹的幾何演算法驅動，無梯度傳播，純 EM 演算法優化讓其收斂具備強大的數學保證。更重要的是，它具備極佳的**資產複用性 (Plug-and-Play)**，能夠直接無縫接入現有模型產出的高品質 Embedding，完全無需重構上游特徵管線。

**💡 實務混用策略 (Hybrid Strategy)：**
業界常見的 Best Practice 是採用「熱啟動（Warm-up）」策略：先利用 RQ-Kmeans 在離線快速聚類出穩健的初始碼本，作為 RQ-VAE 的初始化權重，隨後再進行神經網路的端到端微調。這兼顧了幾何量化的穩定性與神經網路微調的上限空間。
</block>

## 6. 優缺點與工程權衡

總結 RQ-Kmeans 在工業落地中的優缺點與工程權衡：

### 核心優勢
* **指數級的表達容量：** 僅需維護 $M \times K$ 個中心點向量，就能組合表達出 $K^M$ 種狀態，完美解決詞表爆炸問題。
* **天然的階層語意 (Coarse-to-fine)：** 遞減殘差的機制使得 Token 天然具備宏觀到微觀的階層邏輯，大幅降低大模型的學習難度。
* **穩定與資產複用：** 演算法穩健，且能隨插即用現有的特徵 Embedding。
* **潛在興趣探索 (Novel Item Exploration)：** 生成的 Token 序列重構出的向量 $\hat{x}_{\text{pred}}$ 依然落在合理幾何空間，即使該 SID 在商品庫中不存在，也能用來代表潛在興趣點進行召回，賦予系統強大的探索性。

### 痛點與工程限制
* **資訊遺失與 ID 碰撞：** 將連續向量離散化至短短幾層 Token 必然帶來幾何失真。極相似的商品容易被映射到相同的 SID，這通常需仰賴下游的輕量級 Ranker 進行集內精排。
* **解碼延遲：** 生成一個商品需要等待 $M$ 步自迴歸解碼，考量線上 Latency，實務上通常限制 $M=3 \sim 4$。
* **Trie Tree 記憶體開銷：** 億級商品庫的線上高深度合法字典樹，會帶來不小的記憶體維運壓力。

## 7. 總結

要讓推薦系統真正走向生成式架構，最難的一步，往往是如何將連續的高維向量，轉換成自迴歸模型能理解的離散 Token，同時不喪失原本的空間語意。

回顧從 K-means 聚類、基礎 VQ 到 RQ-Kmeans 的演化邏輯，其實就是一個不斷在「壓縮效率」與「語意保留」間尋找最佳平衡的過程。RQ-Kmeans 透過遞減殘差的優美機制，不僅解決了海量商品的詞表爆炸難題，更順勢建構出完美契合 Next-Token Prediction 的 Coarse-to-fine 階層語意。

比起追求極致但難以馴服的端到端神經網路，RQ-Kmeans 勝在務實與穩健。它承先啟後，是目前串聯連續特徵與離散大模型語意最可靠的基石之一。

<reviewkit>
<takeaways>
- **生成式推薦的詞表爆炸難題：** 傳統推薦系統的商品多以連續高維向量存在，而大模型依賴離散 Token。若直接將商品 ID 映射為 Token，會面臨難以訓練與算力吃緊的「詞彙庫爆炸」困境。
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