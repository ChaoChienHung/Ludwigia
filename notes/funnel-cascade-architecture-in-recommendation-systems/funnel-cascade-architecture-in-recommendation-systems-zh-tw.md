<meta>
Title: 現代推薦系統的基石：深入解析「漏斗式級聯架構」
Tags: Recommender Systems, Machine Learning, Deep Learning, Architecture, Information Retrieval
Summary: 深入剖析工業界推薦系統的核心設計哲學——「漏斗式級聯架構」（Cascade Architecture）。從召回（Retrieval）、粗排（Pre-ranking）、精排（Ranking）到重排與混排（Re-ranking / Mixing），詳細拆解各階段的延遲約束、模型複雜度、特徵維度與核心優化目標，並分析級聯架構的資訊遺失與目標不一致隱憂，為通往生成式檢索（Generative Retrieval）奠定理論基礎。
Slug: funnel-cascade-architecture-in-recommendation-systems-zh-tw
Output: notes/funnel-cascade-architecture-in-recommendation-systems/funnel-cascade-architecture-in-recommendation-systems-zh-tw.html
Style: default
EstimatedReadingTime: true
Lang: zh-Hant
TitleSuffix: true
Status: published
Published: 2026-07-26
LastModified: 2026-07-26
</meta>

<anchors>
toc1: overview -> 核心矛盾：海量候選池 vs. 嚴苛延遲限制
h2: 核心矛盾：海量候選池 vs. 嚴苛延遲限制 -> overview
toc1: cascade-philosophy -> 漏斗哲學：分治法與資源梯次配置
h2: 漏斗哲學：分治法與資源梯次配置 -> cascade-philosophy
toc1: four-stages -> 四大關鍵階段（The Four Pipeline Stages）
h2: 四大關鍵階段（The Four Pipeline Stages） -> four-stages
toc2: retrieval -> 階段一：召回 (Retrieval / Candidate Generation)
h3: 階段一：召回 (Retrieval / Candidate Generation) -> retrieval
toc2: pre-ranking -> 階段二：粗排 (Pre-ranking / Rough Ranking)
h3: 階段二：粗排 (Pre-ranking / Rough Ranking) -> pre-ranking
toc2: ranking -> 階段三：精排 (Ranking / Fine Ranking)
h3: 階段三：精排 (Ranking / Fine Ranking) -> ranking
toc2: re-ranking -> 階段四：重排與混排 (Re-ranking / Mixing)
h3: 階段四：重排與混排 (Re-ranking / Mixing) -> re-ranking
toc1: stage-comparison -> 漏斗階段的資源與特徵對比表
h2: 漏斗階段的資源與特徵對比表 -> stage-comparison
toc1: tradeoffs-limitations -> 級聯架構的隱憂與未來挑戰
h2: 級聯架構的隱憂與未來挑戰 -> tradeoffs-limitations
toc1: transition-to-gr -> 邁向下一代範式：生成式檢索（Generative Retrieval）
h2: 邁向下一代範式：生成式檢索（Generative Retrieval） -> transition-to-gr
toc1: takeaways -> 總結與核心要點
h2: 總結與核心要點 -> takeaways
</anchors>

# 現代推薦系統的基石：深入解析「漏斗式級聯架構」

## 如何在極短的時間內，從千萬級商品庫精準挑出最適合使用者的 10 個結果？

你是否曾想過，YouTube、Netflix 或淘寶的首頁，究竟是如何在不到一秒的時間內，精準推播你當下最想看的內容？

要知道，這些平台上的內容庫龐大到難以想像——影片數以千萬計，商品更是動輒數億件。要在轉瞬之間從這片海量數據中，精準挑出最適合你的 10 個結果，無疑是一項極具挑戰的工程奇蹟。

很顯然地，這背後肯定需要非常advanced的工程與演算法設計，才能在時間延遲與預測準確度之間取得平衡。而工業界為了解決這個挑戰，主要採用的架構就是著名的**漏斗式級聯架構（Cascade Architecture）**。

---

## 漏斗哲學：分治法與資源梯次配置

漏斗式級聯架構的核心哲學是：**用最快的速度刷掉大部分不相關的物品，把寶貴的算力留給最有可能的少數候選者。**

```
 全局物品庫 (10,000,000+)
           │
           ▼  [階段一：召回 Retrieval]  < 20 ms
     候選集合 (1,000 ~ 3,000)
           │
           ▼  [階段二：粗排 Pre-ranking] < 20 ms
     過濾集合 (500)
           │
           ▼  [階段三：精排 Ranking]    < 40 ms
     精準排序 (50)
           │
           ▼  [階段四：重排/混排 Re-ranking] < 10 ms
     最終展示 (10)
```

隨著資料流經漏斗：
- **物品數量呈指數級遞減**：從千萬級降至數千、數百，最後僅剩最終展示的十數個結果。
- **評估模型的複雜度與特徵維度呈指數級上升**：從輕量級向量點積，過濾到深層神經網路（DNN），再到結合即時行為序列與上下文的複雜模型。

整個推薦管線（Pipeline）嚴格遵循四大階段，缺一不可，且順序不可逆轉。

---

## 四大關鍵階段（The Four Pipeline Stages）

### 階段一：召回 (Retrieval / Candidate Generation)
**核心口號：寧可錯殺一百，不可放過一個。**

召回是漏斗的最頂層。系統必須在 **10~20 毫秒** 內，從百萬甚至千萬級別的全局物品庫中，快速篩選出 **1,000 到 3,000 個** 使用者「可能」會感興趣的候選集合。

- **模型複雜度與特徵**：因為要在極短時間內處理海量數據，這裡的模型通常非常輕量，無法考慮複雜的即時交叉特徵。
- **主流技術實現**：
    - **雙塔模型 (Two-Tower Model / DSSM)**：將使用者與物品分別壓縮成向量 $\mathbf{u}$ 與 $\mathbf{v}$，利用近似近鄰搜尋（ANN，如 Faiss、HNSW、ScaNN）在多維空間中快速找出距離最近的物品。
    - **多路召回策略 (Multi-channel Retrieval)**：並行使用協同過濾（ItemCF/UserCF）、熱門規則、基於圖（Graph-based / EGES）召回、以及基於搜尋關鍵字/標籤的召回。

---

### 階段二：粗排 (Pre-ranking / Rough Ranking)
**核心口號：承上啟下的算力緩衝區。**

召回階段送來了數千個候選物，對於後續複雜的精排神經網路來說，這個數量依然太龐大。粗排的任務是扮演「過濾器」，將候選集合從 **3,000 個進一步縮減到 500 個左右**。

- **模型複雜度與特徵**：粗排是算力與準確度的折衷。模型比召回層稍微複雜一些，開始引入少量的特徵交叉（Cross Features）。
- **主流技術實現**：
    - 使用輕量級的三層全連接神經網路（DNN）或稍微複雜的雙塔結構。
    - 採用向量內積與輕量級交叉特徵相結合的方式，預先篩除召回階段因為「看走眼」而選出的明顯低質或無關物品。

---

### 階段三：精排 (Ranking / Fine Ranking)
**核心口號：算力全開，精雕細琢。**

精排是整個推薦系統的「大腦」，也是各家科技巨頭演算法競爭最激烈的主戰場。精排只需要處理精挑細選出來的 **500 個物品**，因此終於可以算力全開。

- **模型複雜度與特徵**：精排模型會榨乾所有可用的數據。它不僅看使用者的長期歷史點擊，還會分析當下所處的環境（時間、地點、設備網路），甚至使用者在上一秒滑過的實態行為序列。
- **主流技術實現**：
    - **複雜神經網絡**：DeepFM、DIN (Deep Interest Network)、DCN (Deep & Cross Network)、MMoE (Multi-gate Mixture-of-Experts) 等。
    - **多目標預估 (Multi-Task Learning)**：對每一個物品進行極度精密的打分，同時預估點擊率（CTR）、觀看時長（Dwell Time）、按讚率與轉換率（CVR），最後依據綜合多目標得分進行絕對排序。

---

### 階段四：重排與混排 (Re-ranking / Mixing)
**核心口號：全局最優與商業邏輯的平衡。**

如果只依照精排的分數由高到低顯示，使用者體驗可能會很糟糕——因為分數最高的 10 個影片可能全是同一個創作者的相似內容，導致「資訊繭房」與視覺疲勞。

重排階段不再只看單一物品的孤立分數，而是考慮整個列表（Listwise）的綜合體驗：
- **打散邏輯與多樣性 (Diversity)**：確保相鄰的推薦結果不會過於同質化（例如使用 MMR 演算法或 DPPs 門限行列式點過程）。
- **商業與生態邏輯 (Business Rules & Fairness)**：
    - 強制插入廣告與商業化推廣位。
    - 保證長尾內容與創作者流量分發公平性。
    - 強制曝光冷啟動的新商品或新創作者，確保平台生態的長遠健康。

---

## 漏斗階段的資源與特徵對比表

為了更直觀地理解這種架構的妥協與精妙，下表整理了資料在各個階段的變化與技術差異：

| 處理階段 | 處理數量 (Item 數) | 延遲限制 (大約) | 模型複雜度與特徵維度 | 核心優化目標 |
| :--- | :--- | :--- | :--- | :--- |
| **召回 (Retrieval)** | $10,000,000 \rightarrow 3,000$ | $< 20\text{ ms}$ | **極低**。主要使用 Embedding 向量、單塔/雙塔與全局熱門特徵。 | **召回率 (Recall)**。找回所有潛在可能的候選。 |
| **粗排 (Pre-ranking)** | $3,000 \rightarrow 500$ | $< 20\text{ ms}$ | **中低**。開始引入簡單的使用者與物品交叉特徵。 | **過濾效率**。精準剔除低品質與不相關候選。 |
| **精排 (Ranking)** | $500 \rightarrow 50$ | $< 40\text{ ms}$ | **極高**。深度神經網路、即時行為序列、超大規模稀疏特徵。 | **準確率 (AUC, LogLoss)**。精準預估點擊與互動機率。 |
| **重排 (Re-ranking)** | $50 \rightarrow 10\text{ (展示)}$ | $< 10\text{ ms}$ | **策略/ Listwise**。規則引擎、MMR、強化學習或 Listwise 模型。 | **體驗與生態指標**。兼顧多樣性、廣告收益與曝光公平性。 |

---

## 級聯架構的隱憂與未來挑戰

漏斗式級聯架構雖然完美解決了工程上的算力瓶頸，但它本質上是一個**「妥協的產物」**。它帶來了兩個難以根除的結構性痛點：

1. **資訊遺失 (Information Loss / Early Truncation)**：
   召回階段因為模型太簡單（如雙塔向量點積），常常會漏掉一些對使用者其實很有價值，但在向量空間中距離不夠近的冷門優質商品。一旦在召回階段被漏掉，後面再強大的精排模型也無力回天（因為精排根本看不到它）。

2. **目標不一致 (Objective Misalignment)**：
   召回看重點積相似度或幾何距離，粗排看重快速篩選，精排看重 CTR / CVR 預估，重排又看重多樣性與商業規則。各階段目標彼此獨立且相互解耦，容易導致系統收斂於**局部最佳解**，而非全局最優解。

---

## 邁向下一代範式：生成式檢索（Generative Retrieval）

正是因為級聯架構存在「資訊遺失」與「目標不一致」的固有痛點，業界開始尋求能打破傳統「雙塔向量空間與級聯漏斗」限制的新方法。

近年來，隨著生成式 AI 與大型語言模型（LLM）的崛起，將推薦系統視為一種**自回歸序列生成問題（Generative Retrieval, GR）** 正在成為最前沿的研究熱點：
- 透過 **Semantic ID**（如 RQ-VAE 量化碼）將百萬級商品編碼為層級 Token 序列。
- 讓 Transformer 模型直接從全局記憶中「生成」出最終的推薦結果，實現模型與索引的深度整合（Model-as-Index）。

這種全新範式試圖一舉消除傳統召回與精排的分界，成為下一代推薦系統最具潛力的變革方向。

---

## 總結與核心要點

<takeaways>
- **核心矛盾與解答**：現代推薦系統利用「漏斗式級聯架構（Cascade Architecture）」解決了海量候選池與毫秒級延遲限制之間的衝突。
- **四大階梯管線**：
    - **召回 (Retrieval)**：高召回率、雙塔向量 (ANN)、多路並行。
    - **粗排 (Pre-ranking)**：算力緩衝區、輕量神經網路與簡單交叉特徵。
    - **精排 (Ranking)**：算力全開、DeepFM/DIN/DCN 實態序列多目標預估。
    - **重排 (Re-ranking)**：Listwise 列表優化、MMR 多樣性打散與商業/曝光規則。
- **固有局限**：級聯架構面臨「資訊遺失 (Information Loss)」與「目標不一致 (Objective Misalignment)」兩大結構性痛點。
- **承上啟下**：為了解決級聯架構的局限，生成式檢索（Generative Retrieval, GR）應運而生，直接透過自回歸生成實現「模型即索引」，成為下一代推薦系統的新解答。
</takeaways>
