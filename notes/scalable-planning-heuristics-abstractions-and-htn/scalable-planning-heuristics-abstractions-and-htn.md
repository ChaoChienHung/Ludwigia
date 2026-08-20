<meta>
Title: 大規模規劃與分層抽象：啟發式搜尋、HTN 與可達集合理論
Summary: 本文深入探討古典規劃如何突破狀態空間爆炸的效能瓶頸。詳細剖析鬆弛模型與啟發式函數（包含 $h_{\max}$、$h_{\text{add}}$ 與著名的 Fast Forward 啟發式 $h_{\text{FF}}$）、剪枝技術（對稱性剪枝與子目標序列化）；接著探討狀態抽象（State Abstraction）與目標分解（Goal Decomposition）的數學原理與相互作用；最後完整介紹分層任務網路（Hierarchical Task Networks, HTN）與高階動作（HLAs），並深入 Reachable Sets（可達集合）與近似可達集（$REACH^+$ 與 $REACH^-$）在抽象平面驗證解之正確性與剪枝的理論證明。
Slug: scalable-planning-heuristics-abstractions-and-htn
Output: notes/scalable-planning-heuristics-abstractions-and-htn/scalable-planning-heuristics-abstractions-and-htn.html
CanonicalId: scalable-planning-heuristics-abstractions-and-htn
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: ai planning, htn, heuristics, fast forward, state abstraction, automated planning
Status: drafting
Published: 2026-08-19
LastModified: 2026-08-19
</meta>
<draft>
- 1. 搜尋導向規劃的啟發式函數設計
    - 可採納啟發式（Admissible Heuristics）與 Optimality 保證
    - 問題鬆弛（Problem Relaxation）與域獨立啟發式
    - 忽略前置條件與忽略刪除效果（h_max, h_add）
    - Fast Forward 啟發式（h_FF, Hoffmann & Nebel 2001）運作機制與特性
- 2. 域獨立剪枝技術與結構簡化
    - 對稱性剪枝（Symmetry Reduction）
    - 前向剪枝（Forward Pruning）
    - 子目標序列化（Serializable Subgoals）與 Sussman Anomaly
- 3. 狀態抽象與目標分解
    - 狀態抽象（State Abstraction）與空間縮減（以 Air Cargo 為例：10^405 -> 10^11）
    - 目標分解（Goal Decomposition）與估算規則（Max vs Sum）
    - 正向干擾與負向干擾的數學影響
- 4. 分層任務網路（HTN）與高階動作（HLAs）
    - 過程性知識（Procedural Knowledge）的編碼與遞迴分解
    - 高階動作（HLAs）與向精煉特性（Downward Refinement Property）
    - HTN 複雜度分析（O(b^d) vs r^((d-1)/(k-1))）
- 5. 抽象解的屬性證明與可達集合理論
    - 可達集合（Reachable Sets, REACH(s, h)）定義與序列組合
    - 近似可達集合：樂觀近似（REACH+）與悲觀近似（REACH-）
    - 剪枝失敗與驗證成功的安全條件（夾擠原理）
</draft>

# 大規模規劃與分層抽象：啟發式搜尋、HTN 與可達集合理論

在古典規劃中，隨著問題規模（Fluent 數量與動作數量）的擴大，狀態空間會呈指數級膨脹（Combinatorial Explosion）。若僅採用盲目搜尋（如 BFS 或 DFS），規劃器將迅速耗盡記憶體與計算資源。

為了解決這一效能瓶頸，自動規劃領域發展出三大核心防線：
1. **啟發式導引（Heuristic Guidance）**：透過鬆弛模型估算從當前狀態到目標的殘餘代價。
2. **狀態抽象與目標分解（State Abstraction & Goal Decomposition）**：縮減狀態空間基數，分而治之。
3. **分層任務網路（Hierarchical Task Networks, HTN）**：利用專家過程性知識進行高階動作（HLA）分解。

本文將系統化解析這三大方向的數學原理與理論保證。

---

## 1. 搜尋導向規劃的啟發式函數設計

啟發式函數 $h(s)$ 的任務是估計從狀態 $s$ 到達目標狀態 $g$ 的最小代價（Cost）。

### 1.1 可採納性（Admissibility）與域獨立性

- **可採納性（Admissibility）**：若對於任意狀態 $s$，$h(s) \le h^*(s)$（其中 $h^*(s)$ 為真實的最優代價），則稱 $h(s)$ 為可採納的（悲觀/估低不估高）。搭配 $A^*$ 搜尋時，**可採納啟發式能保證找到全局最佳計畫**。
- **域獨立啟發式（Domain-Independent Heuristics）**：不依賴人工針對特定領域編寫的規則，而是自動從 PDDL 描述中衍生出通用估算函數。最常用的衍生手段是**問題鬆弛（Problem Relaxation）**。

### 1.2 忽略刪除效果（Ignore Delete Effects）

最經典且高效的鬆弛方法是**忽略所有動作的刪除效果（Ignore Delete Effects）**。在此鬆弛世界中，一旦某個 Fluent 被設為真，它就永遠保持為真（Fact 永遠不會失效）。

```
Original Action:
  Precond: At(P1, SFO)
  Effect:  At(P1, SIN) AND NOT At(P1, SFO)   <-- Delete Effect!

Relaxed Action (Ignore Delete Effects):
  Precond: At(P1, SFO)
  Effect:  At(P1, SIN)                      <-- Facts only accumulate!
```

在忽略刪除效果的鬆弛模型下，主要衍生出三種啟發式：

1. **$h_{\max}$（Max Heuristic）**：
   $$h_{\max}(s) = \max_{g_i \in g} \text{cost}(g_i)$$
   $h_{\max}$ 是可採納的（Admissible），但資訊量較弱（Weak），容易嚴重低估真實代價。
2. **$h_{\text{add}}$（Additive Heuristic）**：
   $$h_{\text{add}}(s) = \sum_{g_i \in g} \text{cost}(g_i)$$
   $h_{\text{add}}$ 假設各個子目標彼此獨立，累加其花費。其資訊量較豐富（Informative），但因為忽略了動作間的協同效應，**不保證可採納性**（可能高估代價）。
3. **Fast Forward 啟發式（$h_{\text{FF}}$）**：
   由 Hoffmann & Nebel (2001) 提出，是滿意規劃（Satisficing Planning）的工業級標準。$h_{\text{FF}}$ 的計算步驟如下：
   - 建立鬆弛規劃圖（Relaxed Planning Graph）。
   - 從目標開始，**貪婪提取一個鬆弛計畫（Relaxed Plan）**。
   - 將該鬆弛計畫中的**動作總數量**作為啟發式估算值 $h_{\text{FF}}(s)$。

$h_{\text{FF}}$ 資訊量極高，雖然因為貪婪提取鬆弛計畫而不保證可採納性，但在貪婪最佳優先搜尋（GBFS）中表現極其優異。

---

## 2. 域獨立剪枝技術與結構簡化

除了啟發式導引，剪枝技術（Pruning Techniques）能直接切除搜尋樹中冗餘或重複的枝葉：

- **對稱性剪枝（Symmetry Reduction）**：在河內塔（Towers of Hanoi）或多機調度中，若多個狀態在結構上互為鏡像或置換同構，僅探索其中一個代表狀態。
- **前向剪枝（Forward Pruning）**：偏好當前最感興趣的動作（Preferred Actions），直接拋棄低優先級動作分支（如 Fast Downward 規劃器）。
- **子目標序列化（Serializable Subgoals）**：確定子目標的執行順序 $G_1 \to G_2 \to \dots \to G_n$，確保達成 $G_{i+1}$ 時不會破壞先前已完成的 $G_i$。此技術能有效化解經典的 **Sussman Anomaly（蘇斯曼異常）**。

---

## 3. 狀態抽象與目標分解

為了解決複雜規劃問題，將問題的維度進行降維與分解是另一項重要手段。

### 3.1 狀態抽象（State Abstraction）

狀態抽象的核心思想是將多個細粒度狀態歸類（Group）為一個抽象狀態（Abstract State）。在抽象空間中求解後，再將抽象計畫精煉（Refine）回原始空間。

```
Concrete Space (10^405 states):
  [10 Airports, 50 Planes, 200 Cargos] ---- (Search is intractable)

                      | Abstract State Mapping
                      v

Abstract Space (10^11 states):
  [5 Airports, Grouped Cargos, Irrelevant Fluents Dropped]
                      |
                      v
            [ Search Abstract Plan ]
                      |
                      v
            [ Refine to Concrete Plan ]
```

以航空貨運（Air Cargo）問題為例：
- **原始問題**：10 個機場、50 架飛機、200 件貨物，狀態空間高達 $10^{50} \times (50+10)^{200} \approx 10^{405}$。
- **抽象簡化**：假設貨物集中於 5 個主機場，並移除無關的位置 Fluent，狀態空間立刻銳減至 $10^5 \times (5+10)^5 \approx 10^{11}$。

在抽象空間中找到的短路徑，能作為原始問題可採納且強力的啟發式下界。

### 3.2 目標分解（Goal Decomposition）

當總目標 $G$ 可拆解為子目標 $G_1, G_2, \dots, G_n$ 時，我們可以分別計算每個子目標的計畫代價 $\text{Cost}(P_i)$：

- **$\text{Max}(\text{Cost}(P_i))$ 規則**：保證可採納，但在多目標問題中嚴重低估。
- **$\text{Sum}(\text{Cost}(P_i))$ 規則**：當子目標彼此獨立時，$\text{Sum}$ 能完美反映真實代價。
- **目標間的相互作用（Interactions）**：
  - **正向干擾（Positive Interaction）**：一個動作同時實現了多個子目標。此時 $\text{Sum}$ 可能會高估（Overestimate）。
  - **負向干擾（Negative Interaction）**：實現 $G_2$ 的動作撤銷了 $G_1$ 的成果。此時 $\text{Sum}$ 可能會低估（Underestimate）。

---

## 4. 分層任務網路（HTN）與高階動作（HLAs）

在許多實務場景（如物流調度、遊戲 AI、軍事決策）中，人類專家早已積累了豐富的**過程性知識（Procedural Knowledge）**。**分層任務網路（Hierarchical Task Networks, HTN）**正是將這種知識形式化的自動規劃框架。

### 4.1 高階動作（High-Level Actions, HLAs）與分解

在 HTN 中，規劃不是從原子動作開始，而是從頂層的抽象任務——**高階動作（High-Level Action, HLA）**開始。例如 $\text{Go}(\text{Home}, \text{Airport})$。

每個 HLA 可以有多種不同的**精煉（Refinement）方式**，將其遞迴分解為更細粒度的 sub-HLAs 或最終的基底動作（Primitive Actions）：

```
                       [ Go(Home, SIN) ]  <-- Top-level HLA
                              |
       +----------------------+----------------------+
       | Refinement 1                                | Refinement 2
[ Drive(Home, SIN) ]                      [ Taxi(Home, SIN) ]
       |                                             |
 [ Primitive Steps ]                 +---------------+---------------+
                                     |               |               |
                           Call-Taxi(Home)   Ride(Home, SIN)   Pay-Taxi(SIN)
```

### 4.2 向下精煉特性（Downward Refinement Property）

HTN 規劃的核心理論基礎是**向下精煉特性（Downward Refinement Property）**：
*若一個高階計畫（HLA 序列）在抽象層面能夠成功達成目標，則該計畫保證存在至少一個精煉方案（Refinement）能順利替換為合法的基底動作序列。*

只要領域定義滿足向下精煉特性，Agent 就可以在不安裝微觀細節（如具體走哪條高速公路）的情況下，先在宏觀層面確認高階計畫的可行性。

### 4.3 複雜度對比

設非分層搜尋的分支因子為 $b$，計畫長度為 $d$，則傳統規劃代價為 $O(b^d)$。  
而在 HTN 中，設每個 HLA 有 $r$ 種精煉方式，每次精煉分解為 $k$ 個動作，則整體分解複雜度約為：

$$O\left(r^{\frac{d-1}{k-1}}\right)$$

當 $k$ 較大（即每個高階動作能一次展開為較長的步驟鏈）時，搜尋樹的深度大幅降低，帶來**指數級的計算效能提升**。

---

## 5. 抽象解的屬性證明與可達集合理論

為了在不展開所有細節的前提下證明高階計畫的可行性，Russell & Norvig 提出了**可達集合（Reachable Sets）**理論。

### 5.1 可達集合（Reachable Set）定義

給定初始狀態 $s$ 與高階動作 $h$，**可達集合 $\text{REACH}(s, h)$** 定義為由 $h$ 的任意合法精煉實現所能到達的所有具體狀態的集合：

$$\text{REACH}(s, h) = \{ s' \mid \text{存在 } h \text{ 的合法基底精煉路徑將 } s \text{ 轉移至 } s' \}$$

對於 HLA 序列 $[h_1, h_2]$，其可達集合為遞迴聯集：

$$\text{REACH}(s, [h_1, h_2]) = \bigcup_{s' \in \text{REACH}(s, h_1)} \text{REACH}(s', h_2)$$

### 5.2 近似可達集合（Approximate Reachable Sets）

精確計算 $\text{REACH}(s, h)$ 可能非常昂貴。因此，理論上引入了兩種近似可達集：

1. **樂觀近似可達集 $\text{REACH}^+(s, h)$（Optimistic Overestimate）**：包含所有可能到達的狀態，甚至包含部分無效狀態。
2. **悲觀近似可達集 $\text{REACH}^-(s, h)$（Pessimistic Underestimate）**：僅包含保證絕對可達的真子集狀態。

兩者的包夾關係為：

$$\text{REACH}^-(s, h) \subseteq \text{REACH}(s, h) \subseteq \text{REACH}^+(s, h)$$

```
  +-------------------------------------------------------------+
  |  REACH+ (Optimistic: Dashed Line / Overestimate)            |
  |    +---------------------------------------------------+    |
  |    |  REACH (Exact Reachable Set)                      |    |
  |    |    +-----------------------------------------+    |    |
  |    |    |  REACH- (Pessimistic: Solid / Underest) |    |    |
  |    |    +-----------------------------------------+    |    |
  |    +---------------------------------------------------+    |
  +-------------------------------------------------------------+
```

### 5.3 剪枝與驗證判準（Safety Conditions）

利用樂觀與悲觀近似，規劃器可以在高階抽象層面做出精確判定：

- **失敗剪枝安全條件（Safe for Pruning Failures）**：
  $$\text{若 } \text{REACH}^+(s, \text{Plan}) \cap \text{Goal} = \emptyset \implies \text{該高階計畫必失敗，立即剪枝！}$$
- **成功驗證安全條件（Safe for Certifying Success）**：
  $$\text{若 } \text{REACH}^-(s, \text{Plan}) \cap \text{Goal} \neq \emptyset \implies \text{該高階計畫必成功，無需進一步尋找其他宏觀路徑！}$$
- **需要精煉（Refinement Required）**：
  若不滿足上述兩者，則需將 HLA 進一步展開為 sub-HLAs，進行細化搜尋。

<reviewkit>
<takeaways>
- **鬆弛與 Fast Forward 啟發式：** 忽略刪除效果（Ignore Delete Effects）是域獨立啟發式的核心。$h_{\text{FF}}$（Fast Forward）透過從鬆弛規劃圖中貪婪提取鬆弛計畫的動作數，提供高資訊量的引導，是滿意規劃的標竿。
- **剪枝與結構簡化：** 對稱性剪枝、前向剪枝與子目標序列化能有效切除冗餘搜尋分支，克服如 Sussman Anomaly 等傳統規劃瓶頸。
- **狀態抽象與目標分解：** 狀態抽象將微觀狀態分組（如 Air Cargo 案例中將狀態從 $10^{405}$ 降至 $10^{11}$）。目標分解利用 $\text{Max}$ 與 $\text{Sum}$ 估計成本，但需注意正向與負向干擾的干擾效應。
- **HTN 與向下精煉特性：** HTN 利用過程性知識將高階動作（HLA）遞迴分解。向下精煉特性保證高階可行計畫必存在微觀解，複雜度從 $O(b^d)$ 降至 $O(r^{(d-1)/(k-1)})$。
- **可達集合包夾理論：** 近似可達集滿足 $\text{REACH}^- \subseteq \text{REACH} \subseteq \text{REACH}^+$。樂觀可達集與 Goal 交集為空可用於安全剪枝失敗；悲觀可達集與 Goal 交集非空可用於安全確認成功。
</takeaways>
<qprompt/>
</reviewkit>

## 參考資料（References）

1. Hoffmann, J., & Nebel, B. (2001). The FF planning system: Fast plan generation through heuristic search. *Journal of Artificial Intelligence Research*, 14, 253-302. [JAIR](https://doi.org/10.1613/jair.855)
2. Georgievski, I., & Aiello, M. (2015). HTN planning: Overview, comparison, and beyond. *Artificial Intelligence*, 222, 124-156. [ScienceDirect](https://doi.org/10.1016/j.artint.2015.02.002)
3. Höller, D., Behnke, G., Bercher, P., Biundo, S., Fiorino, H., Pellier, D., & Alford, R. (2020). HDDL: An extension to PDDL for expressing hierarchical planning problems. In *Proceedings of the AAAI Conference on Artificial Intelligence* (Vol. 34, No. 06, pp. 9883-9891). [AAAI](https://doi.org/10.1609/aaai.v34i06.6541)
