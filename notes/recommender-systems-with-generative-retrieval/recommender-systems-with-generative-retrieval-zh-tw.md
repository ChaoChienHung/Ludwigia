<meta>
Title: Recommender Systems with Generative Retrieval
Tags: Recommender System, Generative Retrieval, Machine Learning, Deep Learning, Information Retrieval, Transformer
Summary: 本篇筆記深入探討生成式檢索（Generative Retrieval, GR）在推薦系統中的架構演進、核心機制與實作細節。涵蓋雙塔 MIPS 檢索範式的瓶頸、Semantic ID 與 RQ-VAE 殘差量化編碼、Seq2Seq 自回歸生成模型（如 TIGER）、前綴樹受限解碼（Constrained Trie Search）、冷啟動泛化能力與未來挑戰。
Slug: recommender-systems-with-generative-retrieval-zh-tw
Output: notes/recommender-systems-with-generative-retrieval/recommender-systems-with-generative-retrieval-zh-tw.html
Style: default
EstimatedReadingTime: true
Lang: zh-Hant
TitleSuffix: true
Status: published
Published: 2026-07-26
LastModified: 2026-07-26
</meta>
<draft>
- 核心摘要與問題意識
    - 本篇筆記深入探討生成式檢索（Generative Retrieval, GR）在推薦系統中的架構演進、核心機制與實作細節。涵蓋雙塔 MIPS 檢索範式的瓶頸、Semantic ID 與 RQ-VAE 殘差量化編碼、Seq2Seq 自回歸生成模型（如 TIGER）、前綴樹受限解碼（Constrained Trie Search）、冷啟動泛化能力與未來挑戰。
- 演進背景：從雙塔 MIPS 到生成式檢索
    - 在大規模推薦系統中，召回（Retrieval / Candidate Generation）的目標是在毫秒級時間內，從數百萬甚至數千萬的物品候選池（Item Catalog）中篩選出數百個使用者可能感興趣的候選集合
    - 傳統的召回範式主要基於 **雙塔向量模型（Dual-Tower Embedding Models）** 與 **最大內積搜尋（Maximum Inner Product Search, MIPS）**
- 範式對比：雙塔 MIPS vs. 生成式檢索
    - | 比較維度 | 傳統雙塔 MIPS 範式 (Dual-Tower MIPS) | 生成式檢索範式 (Generative Retrieval, GR) |
    - | :--- | :--- | :--- |
- Item 符號化與 Semantic ID 建立
    - 為何傳統 ID 策略不可行？
    - Semantic ID (語義代碼元組)
    - 殘差向量量化自動編碼器（RQ-VAE）數學原理
- Seq2Seq 模型架構與自回歸訓練
    - 輸入與目標序列建構
    - 自回歸交叉熵損失 (Autoregressive Cross-Entropy Loss)
- 推理階段與受限前綴解碼（Constrained Trie Search）
    - Trie (前綴樹) 樹狀約束搜尋機制
- 冷啟動泛化與模型 Scaling 特性
    - 1. 卓越的零樣本 / 冷啟動泛化 (Cold-Start Generalization)
    - 2. 模型容量 Scaling Law (Scaling Properties)
- 系統挑戰、權衡與未來發展
    - 1. 推理延遲與計算吞吐 (Inference Latency & Throughput)
    - 2. 代碼碰撞與唯一性 (Semantic ID Collision)
    - 3. 動態商品庫更新 (Dynamic Catalog & Codebook Drift)
- 前置與延伸閱讀
    - 若需深入理解推薦系統全貌，建議搭配以下內容閱讀：
    - - 詳細拆解工業界「召回-粗排-精排-重排」級聯管線的延遲限制、模型複雜度與特徵維度，以及傳統雙塔向量空間的固有痛點
- 參考文獻（References）
- 總結與核心要點
    - - **受限解碼 (Constrained Trie Search)**：推理階段透過商品庫建立的前綴樹（Trie）對解碼 logits 進行 Mask 限制，結合 Beam Search 確保生成的代碼 100% 精準對應真實商品
    - - **核心優勢與未來**：具備優異的冷啟動泛化能力與模型 Scaling 潛力；未來突破方向集中於推理延遲優化、非自回歸解碼與多模態 LLM 原生推薦架構
</draft>

<anchors>
toc1: overview -> 演進背景：從雙塔 MIPS 到生成式檢索
h2: 演進背景：從雙塔 MIPS 到生成式檢索 -> overview
toc1: paradigm-comparison -> 範式對比：雙塔 MIPS vs. 生成式檢索
h2: 範式對比：雙塔 MIPS vs. 生成式檢索 -> paradigm-comparison
toc1: item-tokenization -> Item 符號化與 Semantic ID 建立
h2: Item 符號化與 Semantic ID 建立 -> item-tokenization
toc2: rq-vae-details -> 殘差向量量化自動編碼器（RQ-VAE）數學原理
h3: 殘差向量量化自動編碼器（RQ-VAE）數學原理 -> rq-vae-details
toc1: seq2seq-training -> Seq2Seq 模型架構與自回歸訓練
h2: Seq2Seq 模型架構與自回歸訓練 -> seq2seq-training
toc1: trie-decoding -> 推理階段與受限前綴解碼（Constrained Trie Search）
h2: 推理階段與受限前綴解碼（Constrained Trie Search） -> trie-decoding
toc1: cold-start-scaling -> 冷啟動泛化與模型 Scaling 特性
h2: 冷啟動泛化與模型 Scaling 特性 -> cold-start-scaling
toc1: challenges-future -> 系統挑戰、權衡與未來發展
h2: 系統挑戰、權衡與未來發展 -> challenges-future
toc1: prerequisites -> 前置與延伸閱讀
h2: 前置與延伸閱讀 -> prerequisites
toc1: references -> 參考文獻（References）
h2: 參考文獻（References） -> references
toc1: takeaways -> 總結與核心要點
h2: 總結與核心要點 -> takeaways
</anchors>

# Recommender Systems with Generative Retrieval

## 演進背景：從雙塔 MIPS 到生成式檢索

在深入生成式檢索（Generative Retrieval, GR）之前，若需先瞭解工業界傳統的「召回-粗排-精排-重排」級聯流程，可參考前導文章：<content-link canonical="funnel-cascade-architecture-in-recommendation-systems-zh-tw">現代推薦系統的基石：深入解析「漏斗式級聯架構」</content-link>。

在大規模推薦系統中，召回（Retrieval / Candidate Generation）的目標是在毫秒級時間內，從數百萬甚至數千萬的物品候選池（Item Catalog）中篩選出數百個使用者可能感興趣的候選集合。

傳統的召回範式主要基於 **雙塔向量模型（Dual-Tower Embedding Models）** 與 **最大內積搜尋（Maximum Inner Product Search, MIPS）**。使用者塔將互動歷史編碼為 User Vector $\mathbf{u} \in \mathbb{R}^D$，物品塔將物品特徵編碼為 Item Vector $\mathbf{v} \in \mathbb{R}^D$，兩者在統一的向量空間中透過點積或餘弦相似度衡量匹配程度，並藉由 Faiss、HNSW 或 ScaNN 等近似近鄰搜尋（ANN）演算法進行召回。

然而，近年來隨著 Transformer 與大型語言模型（LLM）的突破，**生成式檢索（Generative Retrieval, GR）** 提出了一種全新的解答：**直接將推薦檢索視為自回歸序列生成任務（Autoregressive Sequence-to-Sequence Generation）**。代表性研究如 Google 提出的 **TIGER (Generative Retrieval for Recommender Systems)**，成功證明了生成模型在推薦檢索上的優越性。

---

## 範式對比：雙塔 MIPS vs. 生成式檢索

| 比較維度 | 傳統雙塔 MIPS 範式 (Dual-Tower MIPS) | 生成式檢索範式 (Generative Retrieval, GR) |
| :--- | :--- | :--- |
| **核心機制** | 向量空間嵌入 + 近似近鄰搜尋 (ANN / MIPS) | 自回歸 Seq2Seq 生成 + 受限前綴解碼 (Constrained Beam Search) |
| **表達力瓶頸** | **Representation Bottleneck**：使用者所有複雜多變的興趣強制壓縮為單一固定向量 $\mathbf{u}$ | 使用者興趣表現為 Transformer 記憶與動態上下文解碼，無單一向量壓縮限制 |
| **索引與模型關係** | **模型與索引解耦**：模型訓練向量與 ANN 索引（如 HNSW 樹/圖）各自獨立建立與更新 | **模型即索引 (Model-as-Index)**：物品索引參數化儲存於 Transformer 網路權重中 |
| **Item 表示方式** | 獨立點向量 $\mathbf{v}_i$ 或原子 ID (Atomic ID) | 語義層級代碼序列 **Semantic ID** $(c_1, c_2, \dots, c_K)$ |
| **冷啟動能力** | 新 Item 無互動歷史時向量品質差，需頻繁重新建置 ANN 索引 | 新 Item 可透過內容 Encoder 與 RQ-VAE 快速生成 Semantic ID，無需重建索引 |
| **參數與模型 Scaling** | 向量索引記憶體隨 Item 數量線性成長 | 模型容量隨 Transformer 參數規模 Scaling，高效率運用參數記憶 |

---

## Item 符號化與 Semantic ID 建立

在生成式檢索中，如何將抽象的 Item 轉化為 Seq2Seq 模型可以生成的 Token 序列，是整個系統設計的核心 key。

### 為何傳統 ID 策略不可行？

1. **原子 ID (Atomic Item ID)**：若為每個 Item 賦予一個獨立 Token (如 `Item_123456`)，詞表大小將高達數百萬，導致 Embedding 層參數爆炸，且 Token 之間缺乏任何語意關聯（無法進行跨 Item 泛化）。
2. **純文字標題 (Title Subwords)**：使用物品名稱的自然語言 Subword 序列作為 Target，序列長度過長、名稱可能重複，且耗費大量自回歸解碼步數。
3. **無結構哈希 (Random Hash Codes)**：缺乏層級語意結構，無法反映 Item 之間的類別與相似度關係。

### Semantic ID (語義代碼元組)

生成式檢索引入了 **Semantic ID** 的概念：將每個 Item $i$ 映射為一個短且固定長度的層級代碼元組 $c = (c_1, c_2, \dots, c_K)$，其中 $c_k \in \{1, 2, \dots, V\}$。

- **粗到細的層級結構**：前段代碼 $c_1, c_2$ 代表高層級的語意類別（如「電子產品 $\rightarrow$ 手機」），後段代碼 $c_K$ 區分細粒度的具體商品個體。
- **共享碼標 (Shared Codewords)**：相似的 Item 會共享前綴代碼，使模型能夠學習到類別之間的語意轉移與關聯。

```
 [ Item 多模態特徵 / 文字描述 ]
              │
              ▼ (Pre-trained Encoder: e.g. Sentence-BERT)
     [ 稠密特徵向量 x ∈ R^D ]
              │
              ▼ (RQ-VAE 殘差向量量化)
 [ Semantic ID: (c_1, c_2, c_3, c_4) ]
   (c_1: 大類, c_2: 中類, c_3: 小類, c_4: 個體細節)
```

---

### 殘差向量量化自動編碼器（RQ-VAE）數學原理

為了從 Item 的稠密特徵向量 $\mathbf{x} \in \mathbb{R}^D$（如由 Sentence-BERT 或多模態模型產生的 Embedding）提取層級離散代碼，TIGER 採用了 **Residual Quantized Variational Autoencoder (RQ-VAE)**。

#### 殘差量化過程 (Residual Quantization)

設系統包含 $K$ 個碼本（Codebooks）$\mathcal{C}_1, \mathcal{C}_2, \dots, \mathcal{C}_K$，每個碼本包含 $V$ 個大小為 $D$ 的離散向量：

1. **第一階量化 ($k=1$)**：
   找尋碼本 $\mathcal{C}_1$ 中與原始向量 $\mathbf{x}$ 距離最近的向量代碼 $c_1$：
   $$c_1 = \arg\min_{j \in \{1,\dots,V\}} \|\mathbf{x} - \mathbf{e}_1^{(j)}\|_2^2$$
   計算第一階殘差：$\mathbf{r}_1 = \mathbf{x} - \mathbf{e}_1^{(c_1)}$。

2. **第 $k$ 階量化 ($k > 1$)**：
   對前一階的殘差向量 $\mathbf{r}_{k-1}$ 在碼本 $\mathcal{C}_k$ 中進行近鄰尋找：
   $$c_k = \arg\min_{j \in \{1,\dots,V\}} \|\mathbf{r}_{k-1} - \mathbf{e}_k^{(j)}\|_2^2$$
   更新第 $k$ 階殘差：$\mathbf{r}_k = \mathbf{r}_{k-1} - \mathbf{e}_k^{(c_k)}$。

經過 $K$ 階量化後，原始向量 $\mathbf{x}$ 可被重建為各階量化向量之和：
$$\hat{\mathbf{x}} = \sum_{k=1}^K \mathbf{e}_k^{(c_k)}$$

#### RQ-VAE 損失函數 (Loss Function)

RQ-VAE 的訓練目標包含重建損失（Reconstruction Loss）與直通估計器（Straight-Through Estimator, STE）代碼本損失：

$$\mathcal{L}_{\text{RQ-VAE}} = \|\mathbf{x} - \hat{\mathbf{x}}\|_2^2 + \sum_{k=1}^K \|\text{sg}[\mathbf{r}_{k-1}] - \mathbf{e}_k^{(c_k)}\|_2^2 + \beta \sum_{k=1}^K \|\mathbf{r}_{k-1} - \text{sg}[\mathbf{e}_k^{(c_k)}]\|_2^2$$

其中 $\text{sg}[\cdot]$ 為停止梯度算子（Stop-Gradient），$\beta$ 為 Commitment 損失權重。

---

## Seq2Seq 模型架構與自回歸訓練

在建構好所有 Item 的 Semantic ID 後，整個推薦檢索問題被轉化為標準的 **序列到序列 (Seq2Seq)** 自回歸生成問題。

### 輸入與目標序列建構

- **輸入 (Input / Context)**：使用者過去互動過的 Item 歷史 Semantic ID 序列：
  $$\text{Input} = [c^{(1)}, c^{(2)}, \dots, c^{(T)}]$$
  其中每個 $c^{(t)} = (c_1^{(t)}, c_2^{(t)}, \dots, c_K^{(t)})$ 為第 $t$ 個互動 Item 的 Semantic ID。
- **目標 (Target / Ground Truth)**：使用者下一次互動 Item 的 Semantic ID：
  $$\text{Target} = c^{(T+1)} = (c_1^{(T+1)}, c_2^{(T+1)}, \dots, c_K^{(T+1)})$$

### 自回歸交叉熵損失 (Autoregressive Cross-Entropy Loss)

模型採用 Encoder-Decoder（如 T5）或 Decoder-only（如 LLaMA）架構。對目標 Semantic ID 的生成過程進行自回歸條件概率建模：

$$P(c^{(T+1)} | \text{History}) = \prod_{k=1}^K P(c_k^{(T+1)} | c_1^{(T+1)}, \dots, c_{k-1}^{(T+1)}, \text{History})$$

訓練目標為最大化對數概似，即最小化標準交叉熵損失：

$$\mathcal{L}_{\text{Gen}} = - \sum_{k=1}^K \log P_{\theta}(c_k^{(T+1)} | c_1^{(T+1)}, \dots, c_{k-1}^{(T+1)}, \text{History})$$

```
 [ 使用者歷史: Item_1, Item_2, ... Item_T ]
                     │
                     ▼ (Transformer Encoder)
           [ User Context Vector ]
                     │
                     ▼ (Transformer Decoder 自回歸生成)
    Step 1 ──► 生成 c_1 (大類 Token)
    Step 2 ──► 生成 c_2 (中類 Token)
    Step 3 ──► 生成 c_3 (細節 Token)
    Step 4 ──► 生成 c_4 (個體識別 Token) ──► 映射回真實 Item
```

---

## 推理階段與受限前綴解碼（Constrained Trie Search）

在推理（Inference）階段，若直接使用未加限制的束搜尋（Beam Search），解碼器可能會生成出**歷史上不存在於商品庫中的無效 Semantic ID 組合**。

為了保證生成的 Semantic ID 必定能精準對應到商品庫中的真實 Item，生成式檢索採用了 **受限前綴解碼 (Constrained Trie Search)**。

```
                    Root (始)
                   /        \
              c_1=12       c_1=45
              /    \          \
         c_2=03   c_2=88     c_2=19
          /          \          \
     c_3=01         c_3=05     c_3=77
        │              │          │
   [Item A]       [Item B]   [Item C]
```

### Trie (前綴樹) 樹狀約束搜尋機制

1. **建置商品庫前綴樹 (Trie Construction)**：在線上服務前，將商品庫中所有現存 Item 的 Semantic ID 組合 $(c_1, c_2, \dots, c_K)$ 建立為一棵深度為 $K$ 的 Trie 樹。
2. **遮罩 Softmax 採樣 (Masked Softmax Decoding)**：
   - 在解碼第 $k$ 個 Token 時，僅允許解碼器在目前 Trie 樹節點下的合法子節點 Token 集合中挑選。
   - 將非法 Token 的 Logits 設定為 $-\infty$，確保採樣概率為 0。
3. **束搜尋 (Beam Search)**：保留 Top-$N$ 個最可能的高分前綴路徑，最終生成 Top-$N$ 個對應真實商品庫的 Item，並以生成的累計對數概率 $\sum_{k=1}^K \log P(c_k)$ 作為檢索召回的分數排序依據。

---

## 冷啟動泛化與模型 Scaling 特性

生成式檢索相較於傳統雙塔模型展現出兩個極具突破性的優勢：

### 1. 卓越的零樣本 / 冷啟動泛化 (Cold-Start Generalization)

在傳統雙塔模型中，完全沒有互動歷史的新 Item（Cold-start Item）無法獲得高品質的 User-Item 共現表示，甚至無法在 ANN 索引中被有效檢索。

而在生成式檢索中：
- 新 Item 只要通過 Pre-trained 特徵提取器與 RQ-VAE，就能立即獲得其語義 Semantic ID $(c_1, c_2, \dots, c_K)$。
- 由於 Transformer 已經在大量歷史資料中學習過前綴類別 $(c_1, c_2)$ 的轉移規律，即使 $c_K$ 是新出現的個體，模型也能憑藉共享的前綴語義成功預測並召回該新 Item。
- 實驗證明，TIGER 在冷啟動 Item 召回指標（如 Recall@K, NDCG@K）上顯著超越了 SOTA 雙塔與序列推薦模型。

### 2. 模型容量 Scaling Law (Scaling Properties)

- **雙塔模型瓶頸**：雙塔模型的參數主要集中在 Embedding Table。當 Item 數量大幅增加時，記憶體呈線性膨脹，但模型計算深度（MLP / Dot-Product）並未提升，邊際效益快速遞減。
- **生成式檢索 Scaling**：生成式檢索將 Item 知識參數化存儲在 Transformer 的全連接層與 Attention 權重中。隨着模型參數規模（如從小模型擴展至數十億參數）與訓練數據量的增加，模型的檢索精準度呈現顯著的 Scaling 成長曲線。

---

## 系統挑戰、權衡與未來發展

儘管生成式檢索展現出巨大潛力，但在工業級落地應用中仍面臨若干關鍵挑戰：

### 1. 推理延遲與計算吞吐 (Inference Latency & Throughput)

- **瓶頸**：傳統 MIPS 可以在 1~2 毫秒內完成數百萬向量的檢索；而自回歸 Seq2Seq 解碼需要進行 $K$ 次 Transformer 前向傳播與 Beam Search。
- **解法**：模型剪枝、蒸餾（Distillation）、KV Cache 優化、非自回歸（Non-Autoregressive Generation）或推測解碼（Speculative Decoding）。

### 2. 代碼碰撞與唯一性 (Semantic ID Collision)

- **瓶頸**：若 RQ-VAE 的碼本容量或層數 $K$ 設計不足，不同的 Item 可能被量化為完全相同的 Semantic ID。
- **解法**：增加適度長度的流水號 Code，或在 RQ-VAE 損失函數中引入衝突懲罰項（Collision Penalty）。

### 3. 動態商品庫更新 (Dynamic Catalog & Codebook Drift)

- **瓶頸**：當商品庫大規模新增或下架時，若重新訓練 RQ-VAE 導致 Semantic ID 發生漂移，整個 Seq2Seq 模型都需要重新微調。
- **解法**：增量碼本學習（Incremental Codebook Learning）與穩定語義碼表映射機制。

---

## 前置與延伸閱讀

若需深入理解推薦系統全貌，建議搭配以下內容閱讀：

- **基石篇（前置）**：<content-link canonical="funnel-cascade-architecture-in-recommendation-systems-zh-tw">現代推薦系統的基石：深入解析「漏斗式級聯架構」</content-link>
  - 詳細拆解工業界「召回-粗排-精排-重排」級聯管線的延遲限制、模型複雜度與特徵維度，以及傳統雙塔向量空間的固有痛點。

---

<reviewkit>
<takeaways>
- **範式轉變**：生成式檢索（Generative Retrieval, GR）將推薦召回從「雙塔向量空間內積搜尋 (MIPS)」轉化為「自回歸序列生成 (Seq2Seq Generation)」，打破了單一向量表達瓶頸，實現了模型與索引的深度融合（Model-as-Index）。
- **Semantic ID 與 RQ-VAE**：透過殘差向量量化自動編碼器（RQ-VAE），將 Item 稠密向量轉化為層級離散代碼元組 $(c_1, c_2, \dots, c_K)$，實現了粗到細的語義結構共享與無語意 Atomic ID 的解耦。
- **受限解碼 (Constrained Trie Search)**：推理階段透過商品庫建立的前綴樹（Trie）對解碼 logits 進行 Mask 限制，結合 Beam Search 確保生成的代碼 100% 精準對應真實商品。
- **核心優勢與未來**：具備優異的冷啟動泛化能力與模型 Scaling 潛力；未來突破方向集中於推理延遲優化、非自回歸解碼與多模態 LLM 原生推薦架構。
</takeaways>
<qprompt/>
</reviewkit>

## 參考文獻（References）

1. Rajput, S., Mehta, N., Singh, A., Ramakrishnan, R., Bhojanapalli, S., Sathiamoorthy, M., Kumar, J., Ravi, S., Mazumder, R., & Beutel, A. (2023). *Generative Retrieval for Recommender Systems*. arXiv preprint [arXiv:2305.05065](https://arxiv.org/abs/2305.05065).
2. 知乎專欄：[推薦系統中生成式檢索（Generative Retrieval）技術演進與 TIGER 解讀](https://zhuanlan.zhihu.com/p/676663980).
3. 知乎專欄：[生成式推薦系統 (Generative Recommendation / GR) 深度解析：Semantic ID, RQ-VAE 與自回歸檢索](https://zhuanlan.zhihu.com/p/1970625397411520943).
4. 知乎文章：[大模型時代的生成式檢索與推薦系統架構實踐](https://www.zhihu.com/tardis/zm/art/2023374127587697445).

---

## 總結與核心要點