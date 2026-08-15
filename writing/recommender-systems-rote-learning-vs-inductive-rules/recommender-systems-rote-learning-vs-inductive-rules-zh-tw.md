<meta>
Title: 推薦系統的本質痛點：從「死記硬背」到「符號與規則」的演進
Tags: Recommendation Systems, Machine Learning, Decision Making, Reflection
Summary: 本文借用「符號與規則」框架解析推薦系統的演進本質。剖析為何傳統 ID 矩陣分解傾向於「死記硬背」改寫 Embedding 座標，揭示歸納偏置（Inductive Bias）與人工先驗在過渡至生成式推薦時的核心角色。
Slug: recommender-systems-rote-learning-vs-inductive-rules-zh-tw
Output: writing/recommender-systems-rote-learning-vs-inductive-rules/recommender-systems-rote-learning-vs-inductive-rules-zh-tw.html
Style: default
EstimatedReadingTime: true
Lang: zh-tw
CanonicalId: recommender-systems-rote-learning-vs-inductive-rules
TitleSuffix: false
Status: drafting
Published: 2026-08-15
LastModified: 2026-08-15
</meta>

<draft>
- 引子與對接：
    - 接續 <content-link canonical="first-principles-symbols-and-rules">第一性原理的終極型態：將現實抽絲剝繭成帶有數學屬性的符號與規則</content-link> 中建立的「符號與規則」心智模型。
    - 探討機器學習與推薦系統核心問題：模型在訓練時，究竟是在「理解歸納規律」，還是在「死記硬背」？
- 理想學習 vs 死記硬背：兩種應試與優化策略
    - 理想模式（Inductive Rules）：將輸入萃取為具備共享屬性的符號，並建立跨樣本通用的規則。泛化能力強，但學習成本極高。
    - 捷徑模式（Rote Learning / Transductive）：無視共通規則，為每個輸入創建獨立無關的符號，並用最簡單的查表規則（Identity-like Lookup）直接記憶輸出。
- 為什麼傳統推薦系統傾向死記硬背？
    - 參數配置失衡：99%+ 參數集中在 Embedding Layer（符號庫）。
    - 阻力最小原則：梯度下降更新單一 ID Embedding 座標時，不會干擾其他樣本的 Loss；而學習跨樣本 shared 規則則極度艱難。
    - 規則層極簡化：Matrix Factorization 的規則層本質上只是向量內積 $\text{Score}(u, i) = \mathbf{e}_u^T \mathbf{e}_i$。
- 人工先驗與歸納偏置（Inductive Bias）
    - 傳統 CF / MF 並非「端到端自由探索」，而是人類預先寫死了 80% 的規則（低秩假設 + 內積/余弦相似度），模型只負責解 20% 的座標填空。
- 推薦系統演進史：規則掌控權的轉移
    - User/Item CF (人類寫死啟發式規則) -> MF (人類鎖定幾何內積、模型填座標) -> FM/DeepFM (模型學習特徵交叉規則) -> Generative Rec (大模型語意符號 + 常識推理規則)。
</draft>

# 推薦系統的本質痛點：從「死記硬背」到「符號與規則」的演進

在 <content-link canonical="first-principles-symbols-and-rules">第一性原理的終極型態：將現實抽絲剝繭成帶有數學屬性的符號與規則</content-link> 一文中，我們探討了如何將現實問題拆解為「符號（Representation）」與「規則（Rules）」。

如果我們將這套心智模型帶入機器學習與推薦系統（Recommender Systems）領域，便能一舉點破傳統推薦演算法在泛化能力上的本質痛點：**模型在訓練時，究竟是在「理解歸納規律」，還是在「死記硬背」？**

## 兩種學習策略：理解歸納 vs 死記硬背

在面對考試或優化目標時，不論是人類大腦還是機器學習模型，本質上都在尋找將「輸入」映射至「正確答案」的路徑。這通常存在兩種截然不同的策略：

```
[理想模式]  輸入 ──► [萃取具備共享屬性的符號] ──► [建立跨樣本通用規則] ──► 答案 (高泛化)
[死記模式]  輸入 ──► [分配獨立無關的專屬符號] ──► [查表映射 Identity-like] ──► 答案 (零泛化)
```

1. **理解歸納模式（Inductive Rules）：**
   將輸入拆解並萃取出具備共享屬性的特徵組合（符號），並建立一套能解釋跨樣本規律的通用公式（規則）。這種方式具備強大的泛化能力，能輕鬆應對未見過的輸入，但學習過程極度吃力。
2. **死記硬背模式（Rote Learning / Lookup）：**
   不辛辛苦苦去摸索通用規則，而是為每一個輸入直接分配一個獨立、無關的專屬標籤，並用最簡單的「查表」對應到答案。這種方式不需要高階的歸納能力，只要記憶體與參數夠大就能迅速把當下題目的答案寫對。

## 為什麼傳統推薦系統選擇了「死記硬背」？

在傳統以 ID（User ID / Item ID）為主的推薦模型（如 Matrix Factorization 矩陣分解）中，模型的運作本質上全面傾向了「死記硬背」。

這並非模型「犯錯」，而是梯度下降優化器在運作機制下的必然選擇：

### 1. 參數配置的失衡：自由度全給了「符號」
在矩陣分解模型中，**99% 以上的可訓練參數都集中在 Embedding Layer（符號庫）**。每增加一個新的 User 或 Item，模型就為它分配一個完全獨立、不受任何幾何約束的高維向量。

### 2. 阻力最小原則（Path of Least Resistance）
模型訓練是一個極度功利的 Loss 最小化過程。梯度下降在更新參數時，遵循的是「阻力最小原則」：
* 如果要建立通用的「規則」（例如學習到 *「喜歡科幻片且年齡 < 25 歲的使用者容易對這部電影給高分」*），模型需要多次跨樣本更新共享權重，學習成本與阻力極高。
* 反之，直接去**微調（Move）特定 User ID 與 Item ID 的 Embedding 向量座標**，讓兩點在向量空間裡的距離拉近，只會影響這一個樣本，完全不會干擾其他樣本的 Loss。

> **換句話說：** 修改「符號本身的座標」比建立「通用的規則」簡單太多了。優化器為了快速把 Loss 降下去，自然會選擇直接死記座標。

### 3. 規則層的極簡化（Identity-like Lookup）
傳統矩陣分解的規則層，本質上只是一個簡單的向量內積：

$$\text{Score}(u, i) = \mathbf{e}_u^T \mathbf{e}_i$$

這幾乎沒有任何動態規則學習的能力，它本質上就是一種連續空間下的「查表映射（Lookup Table）」。模型並沒有真正學會「為什麼這個使用者喜歡這個商品」，它只是在地圖上把這兩點擺在了隔壁。

## 人工先驗（Human Priors）與歸納偏置

如果傳統模型只是在死記硬背，那為什麼矩陣分解在過去十幾年裡能取得巨大的商業成功？

答案在於：**人類工程師預先替模型寫好了 80% 的規則結構，模型只負責去解那剩下的 20% 數值填空。**

心理學與機器學習中將這種現象稱為**歸納偏置（Inductive Bias）**：
* **記憶型協同過濾（UserCF / ItemCF）：** 100% 人工寫死的啟發式規則（如 Cosine 相似度加權平均），模型訓練度為零。
* **矩陣分解（MF）：** 人類強加了兩個強烈先驗：
  1. *低秩假設（Low-Rank Assumption）：* 人類規定偏好必須被壓縮在 $k$ 個隱含維度裡。
  2. *雙線性內積規則：* 人類規定交互邏輯必須是向量內積。

在算力與資料稀疏的年代，強加人工先驗是防止模型過擬合（Overfitting）最強大的武器。工程師用領域知識（Domain Knowledge）替模型鎖定了幾何形狀，換取了訓練的穩定性與近鄰檢索（ANN）的極致工程效率。

## 推薦系統演進：規則掌控權的轉移

看待推薦系統這十幾年的演進史，本質上就是**「符號與規則的掌控權，如何從人類轉移回模型」**的過程：

| 演進階段 | 符號（Representation）來源 | 規則（Interaction Logic）來源 | 模型的自由度與特性 |
| :--- | :--- | :--- | :--- |
| **傳統 CF** (User/Item CF) | **人類**（直接拿原始評分向量） | **人類寫死**（Pearson / Cosine 公式） | 純啟發式統計，無參數學習 |
| **矩陣分解** (MF) | **模型學習**（填入 Latent Vector 數值） | **人類鎖死**（低秩先驗與雙線性內積 $\mathbf{u}^T \mathbf{v}$） | 只學符號座標，規則層被固定 |
| **深度學習推薦** (DeepFM / NCF) | **模型學習**（從 ID 與 Side Info 生成） | **模型學習一部分**（引入 MLP、Attention 學習非線性交叉） | 符號與規則共同微調 |
| **生成式推薦** (LLM RecSys) | **預訓練自帶**（Semantic ID 離散語意空間） | **預訓練自帶**（大模型常識與推理邏輯） | 端到端語意理解與歸納推理 |

<callout>
title: 心智模型總結
icon: brain
content:
* **傳統 ID 推薦：** 符號自由度極高（獨立可變），規則極度簡化（內積查表），本質是「記憶座標」。
* **現代生成式推薦：** 符號帶有強語意約束（Semantic ID），規則依賴預訓練大模型的廣義推導，實現從「死記硬背」到「通用歸納」的跨越。
</callout>

<takeaways>
* **優化器本能：** 在高維稀疏空間中，梯度下降傾向走「微調單一符號座標」的阻力最小路徑，而非學習跨樣本通用規則。
* **歸納偏置：** 傳統 MF 的成功建立在人類寫死內積規則與低秩先驗上，用人工知識換取計算效率與穩定性。
* **演進本質：** 推薦系統演進史是規則掌控權從「人類寫死」走向「模型自適應歸納」的過程。
</takeaways>
