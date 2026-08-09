<meta>
Title: 從級聯漏斗到自迴歸生成：推薦系統範式轉移的必然與挑戰
Summary: 本文深入探討推薦系統為何正在經歷從「傳統漏斗級聯架構」向「自迴歸生成式範式」的重大轉型。結合快手 OneRec 最新研究成果，分析傳統碎片化模組如何陷入低 ROI 的 Scaling 陷阱，揭示生成式推薦如何透過一體化架構與聯合機率分佈建模對齊大模型紅利，並剖析 Semantic ID、RQ-VAE 與 RQ-Kmeans 如何解決海量商品 Token 化的核心工程挑戰。
Slug: from-cascade-to-generative-recommendation-paradigm-shift-zh-tw
Output: writing/from-cascade-to-generative-recommendation-paradigm-shift/from-cascade-to-generative-recommendation-paradigm-shift-zh-tw.html
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: recommendation systems, generative retrieval, scaling law, deep learning, semantic id, rq-kmeans, rq-vae, onerec
Status: published
Published: 2026-08-02
LastModified: 2026-08-02
</meta>

# 從級聯漏斗到自迴歸生成：推薦系統範式轉移的必然與挑戰

在 NLP 與大模型（LLM）領域，Transformer 架構所代表的**自迴歸生成式建模（Generative Modeling）**已成為機器學習的底層基本原理。然而反觀推薦系統，在過去數十年間，工業界的技術架構幾乎都停留在同一個經典框架上——<content-link canonical="funnel-cascade-architecture-in-recommendation-systems">漏斗式級聯架構（Funnel Cascade Architecture）</content-link>。

從「召回（Retrieval）$\to$ 粗排（Pre-Ranking）$\to$ 精排（Ranking）$\to$ 重排（Re-Ranking）」，這種將大問題拆解為多個階段逐層篩選的工程策略，曾經成功支撐了電商、短影音與資訊流平台在毫秒級延遲限制下處理數億候選池的需求。

然而，相較於大模型領域的飛速革新，傳統推薦系統近年來卻面臨邊際效益遞減的困境。隨著快手在 2025 年發表 [**OneRec** (*OneRec: Unifying Retrieve and Rank with Generative Recommender and Preference Alignment*)](https://arxiv.org/abs/2502.18965) 等前沿工作的推出，業界開始掀起一場深遠的範式轉移：**從傳統級聯漏斗走向端到端自迴歸生成（Generative Recommendation）**。

曾經主流的級聯架構遇到了怎樣的效能瓶頸？生成式推薦又帶來了什麼樣的範式轉移？在邁向落地的過程中，它又將面臨哪些技術挑戰與應對策略？

本文將帶你層層拆解，一探生成式推薦背後的技術全貌與破局之道。

## 1. 傳統級聯架構的深層痛點與低 ROI 陷阱

級聯架構的核心哲學是**「用空間與階段換取時間」**。在面對數百萬甚至數十億級別的候選商品庫時，系統不可能在 50 毫秒內的嚴苛延遲約束（SLA）下，對所有商品進行高精度的複雜神經網路計算。因此，級聯架構採取了務實的工程折衷：將龐大的候選空間劃分為多個階段，隨著候選集數量被逐層大幅過濾（如 $10^6 \to 10^3 \to 10^2 \to 10^1$），模型的特徵維度與計算複雜度才得以遞增。

在推薦技術演進的早期，這種「分而治之」的工程策略帶來了巨大的效益，各模組獨立升級都能產出顯著的業務增益。然而，**隨著各階段模組被越做越精細、技術優化逐漸趨於飽和與極限時，整個推薦系統的效果開始明顯受制於這種框架設計本身的結構性天花板**。級聯架構暴露出四個難以調和的深層矛盾：

### (1) 各階段優化目標不一致，局部最優 $\neq$ 全局最優
在級聯鏈路上，各模組的優化目標天然存在錯位。例如，召回階段專注於擴大候選池的覆蓋度與多樣性，避免漏掉潛在興趣；而精排階段則極致追求預測的精準度（如 CTR/CVR），致力於挑出用戶最可能點擊的商品。這兩個目標看似互補，實則常產生背離：召回為了多樣性強行塞入的候選，往往會在精排階段被低分打回，造成算力浪費；反之，精排偏好的高分數商品，也可能因召回過度過濾而根本無法進入候選池。加上系統長期迭代累積的各種工程 Trick 與模組間的隱性耦合，導致各階段單獨達成的「局部最優」，最終無法收斂為整個推薦系統的「全局最優」。

### (2) 系統算力利用率低下，通信吞噬計算
在多階段鏈路中，資料必須頻繁跨越多個獨立模組。每次跨階段調用，都伴隨著大量的 RPC 網路通信、特徵檢索與記憶體搬運。在極致的 50 毫秒延遲限制下，很大一部分算力預算被浪費在「系統傳輸與資料搬運」上，而非有效的模型計算，導致硬體效率遠低於大模型領域。

### (3) 技術壁壘造成代差，阻礙 AI 前沿技術吸納
分模組的特化架構形成了高度割裂的技術壁壘。這導致大模型、強化學習（RL）以及對齊技術（Preference Alignment）等 AI 領域的突破性進展，極難被傳統推薦系統有效吸納，產生了明顯的技術代差。

### (4) 傳統 Scaling Law 陷入低 ROI 的困境
為了持續提升推薦效果，業界過去嘗試推動模型 Scaling 的方向主要有二：
1. **持續拉長用戶行為序列：** 從最早的十量級，擴展到百、千量級，甚至萬量級以上。
2. **增大打分候選集：** 讓精排/粗排對盡可能多的物品進行打分。

然而，在傳統級聯架構已被優化至接近極限、技術趨於飽和的前提下，透過上述手段強行推動 Scaling 所產出的邊際收益，與投入的龐大算力資源相比，**投資報酬率 (ROI) 極低**。

## 2. 生成式推薦（Generative Recommendation）的破局之道：以 OneRec 為例

為了解決多階段級聯的固有一致性與算力浪費問題，以 **OneRec** 為代表的生成式推薦系統提出了全新的架構設計：

```
[ 用戶歷史與 Context 信息 ] ───> ( 統一端到端 Transformer 生成器 ) ───> [ 自迴歸生成推薦列表 ]
```

這項範式轉移包含兩個核心維度的升級：

### (1) 架構上：用單一端到端模組替換多階段級聯
- **集中算力與極致效率：** 將原本分散於召回、粗排、精排的算力預算集中於單一模型上，大幅減少模組間的通信與 IO 開銷，顯著提升硬體利用率。
- **恢復系統一致性：** 規避了不同階段獨立迭代、互相掣肘的複雜問題，讓模型效果完全取決於整體能力，徹底解決一致性難題。
- **釋放 Scaling Law 與強化學習空間：** 簡約的端到端架構，為強化學習（對齊用戶偏好）與擴大模型規模（Scaling）提供了天然的基石。

### (2) 建模上：從「判別式 (Discriminative)」轉向「生成式 (Generative)」
- **傳統判別式：** 給定特定用戶與特定 Item，預估點擊/轉化概率 $P(\text{action} \mid \text{user}, \text{item})$。
- **生成式建模：** 給定用戶與 Context 資訊，直接對潛在的 Item 進行預估，學習複雜的**聯合機率分佈 $P(\text{items} \mid \text{user}, \text{context})$**。

這種更高維度的建模方式，為模型參數規模的擴展（Scaling Law）打開了龐大的表現力空間。值得強調的是，生成式範式的收益並不局限於「端到端架構」；**即便僅將傳統級聯中的單一模組（例如將向量召回升級為生成式檢索 Generative Retrieval）替換為生成式範式，同樣機能帶來顯著的 Scaling 收益。**

這背後的核心邏輯在於，Scaling Law 的本質之一是「能否將規模化算力高效轉化為模型能力」。而生成式範式所依賴的 Transformer 架構，正是目前現代硬體（如 GPU/TPU）優化最為成熟、最能極致釋放算力潛能的架構，因此能最大程度享受到硬體迭代帶來的紅利。

## 3. 核心工程挑戰：海量商品與詞彙庫爆炸難題

儘管生成式推薦的藍圖非常吸引人，但在實務落地時，團隊會立刻撞上一道天險：**詞彙庫爆炸（Vocabulary Explosion）**。

- 大語言模型（LLM）處理的是文字，其詞彙庫（Vocabulary Size）通常只有 32,000 到 128,000 個 Token。
- 然而，工業級電商或短影音平台的商品庫（Item Catalog）高達數千萬到數十億（$10^7 \sim 10^9$）。

如果直接將每一個商品指定為一個獨立 Token，模型最後一層的 Softmax 計算複雜度將直接崩潰。

### 破局關鍵：Semantic ID (SID) 與多步解碼

為了解決這個問題，業界提出了 **Semantic ID (SID)** 的概念：**不將商品視為單一原子 ID，而是將商品編碼為長度為 $M$（如 3~4）的階層式 Token 序列**。

如果每一步的碼本大小為 $K = 8192$，則：
- **單步預測開銷：** 模型在每一步解碼時只需處理 8192 規模的小詞彙庫。
- **可表達商品空間：** $8192^3 \approx 5.5 \times 10^{11}$，輕鬆覆蓋全站商品。

## 4. 商品 Token 化的兩大實踐路徑

當我們確定將海量商品編碼為由 $M$ 個 Token 組成的 Semantic ID (SID) 序列後，下一個核心的工程實踐問題在於：**該如何將高維商品特徵轉換為具備由粗到細（Coarse-to-fine）階層語意的離散 Token？**

在實際落地時，業界主要衍生出兩大 Tokenizer 實現路徑：

- **端到端深度學習路線（RQ-VAE）：** 透過變分編碼器與離散碼本，讓神經網路端到端地學習任務導向的商品表徵與 Token 化。詳細架構、直通估算器（STE）與訓練技巧可參考專屬筆記：<content-link canonical="rq-vae-semantic-id-tokenizer-in-generative-recommendation-zh-tw">端到端離散化與生成式檢索：RQ-VAE 如何打造 Semantic ID Tokenizer</content-link>。
- **兩階段解耦幾何路線（RQ-Kmeans）：** 複用既有模型的 Embedding 資產，透過幾何殘差 K-means 迅速進行向量切分。詳細演算法、幾何證明與工程落地流程可參考專屬筆記：<content-link canonical="rq-kmeans-semantic-id-tokenizer-in-generative-recommendation-zh-tw">從幾何量化到生成式推薦：RQ-Kmeans 如何打造 Semantic ID Tokenizer</content-link>。

這兩種 Token 化路徑各具優勢，前者追求極致的端到端表達力，後者則追求工程落地的高度穩定與計算效率，共同支撐起生成式推薦在不同算力與業務約束下的實踐。


## 5. 結語：推薦系統的未來展望

從級聯漏斗走向自迴歸生成，絕非僅僅是演算法模型的微調，而是一場涉及系統架構、資料編碼與工程設施的全面革命。

正如快手 OneRec 所展示的，將多階段級聯收斂為單一端到端生成模型，不僅消除了階段間的通信浪費與目標解耦，更為強化學習偏好對齊與 Scaling Law 提供了可持續發力的舞台。雖然生成式推薦在即時性延遲與長尾商品泛化上仍有諸多工程難題待解，但對齊大模型生態所帶來的高算力利用率與模型規模效應，無疑代表著推薦系統下一代的必然趨勢。

<takeaways>
- **級聯架構的局限：** 各階段優化目標不一致（局部最優 $\neq$ 全局最優）、通信與 IO 搬運開銷巨大，導致傳統推薦系統在序列拉長與候選打分放大時陷入低 ROI 的 Scaling 陷阱。
- **生成式推薦的突破 (以 OneRec 為例)：** 透過單一端到端模型取代多級漏斗，集中算力並恢復系統一致性；建模上從判別式 $P(\text{action} \mid u, i)$ 升級為生成式聯合機率分佈 $P(\text{items} \mid u, c)$，徹底打開 Scaling 空間。
- **核心工程天險與 SID：** 工業級商品庫（$10^7 \sim 10^9$）與 LLM 詞彙庫規模衝突。透過 Semantic ID (SID) 將商品拆解為多步 Token 序列，在保有巨量表達空間的同時將 Softmax 複雜度控制在毫秒級。
- **Token 化兩大關鍵路徑：** <content-link canonical="rq-vae-semantic-id-tokenizer-in-generative-recommendation-zh-tw">RQ-VAE</content-link> 提供端到端深度學習優化；而 <content-link canonical="rq-kmeans-semantic-id-tokenizer-in-generative-recommendation-zh-tw">RQ-Kmeans</content-link> 則提供輕量、極度穩健的兩階段幾何替代方案。
</takeaways>

## 參考文獻（References）

1. [Paper: *OneRec: Unifying Retrieve and Rank with Generative Recommender and Preference Alignment* (Feb 2025).](https://arxiv.org/abs/2502.18965)
2. [知乎：从原理到落地详细解读生成式推荐OneRec](https://zhuanlan.zhihu.com/p/2011387251351908741)
3. Paper: *Recommender Systems with Generative Retrieval* (Google TIGER, NeurIPS 2022).
4. Paper: *Autoregressive Image Generation using Residual Quantization* (RQ-VAE, 2022).
