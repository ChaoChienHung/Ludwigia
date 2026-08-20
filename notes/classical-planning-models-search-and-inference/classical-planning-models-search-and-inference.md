<meta>
Title: 經典規劃與狀態空間搜尋：從 STRIPS、PDDL 到 SATPlan
Summary: 本文系統性梳理古典 AI 規劃（Classical Planning）的核心理論框架與運算機制。從 STRIPS 與 PDDL 的因果狀態表徵（Factored Representation），到狀態空間的正向前推進（Progression）與逆向迴歸（Regression）搜尋演算法，再到利用命題邏輯與 SATPlan 將規劃問題化歸為 Boolean Satisfiability (SAT) 的邏輯推論機制。同時深入剖析 Frame Problem 的解決方案（如 Successor-State Axioms）以及 PlanSAT / Bounded PlanSAT 的複雜度界線。
Slug: classical-planning-models-search-and-inference
Output: notes/classical-planning-models-search-and-inference/classical-planning-models-search-and-inference.html
CanonicalId: classical-planning-models-search-and-inference
Style: default
EstimatedReadingTime: true
Lang: zh-tw
Tags: ai planning, classical planning, strips, pddl, satplan, automated reasoning
Status: drafting
Published: 2026-08-19
LastModified: 2026-08-19
</meta>
<draft>
- 1. 古典規劃的問題範疇與四大基礎假設
    - 離散、確定性、靜態與完全可觀察環境
    - 為什麼現實問題複雜但古典規劃仍不可或缺？
- 2. 規劃問題表徵：從 STRIPS 到 PDDL
    - 因果狀態表徵（Factored Representation）與 Ground Atomic Fluents
    - 資料庫語意：閉世界假設（CWA）與唯一名稱假設（UNA）
    - Action Schemas 與 Grounded Actions（Preconditions, ADD, DEL）
    - Frame Problem 及其在 PDDL 中的處理機制
- 3. 狀態空間搜尋演算法：正向推進 vs 逆向迴歸
    - 正向搜尋（Progression Search）與狀態轉移
    - 逆向搜尋（Regression Search）與目標倒推
    - 相關動作（Relevant Action）判定與最通用統一子（MGU）
    - 迴歸狀態計算公式與狀態描述基數（3^n vs 2^n）
- 4. 規劃即邏輯推論：SATPlan 與 Boolean Satisfiability
    - 將規劃問題化歸為 CNF 命題邏輯公式
    - SATPlan 演算法流程與時間步迭代
    - Successor-State Axioms 與 Action Exclusion Axioms（將公理數量從 O(mn) 降低至 O(n)）
- 5. 規劃演算法特性與計算複雜度分析
    - 正確性（Soundness）、完備性（Completeness）與最佳性（Optimality）
    - PlanSAT 與 Bounded PlanSAT 複雜度分析（P vs NP-complete / PSPACE-complete）
</draft>

# 經典規劃與狀態空間搜尋：從 STRIPS、PDDL 到 SATPlan

在人工智能（AI）與自主 Agent 的發展歷程中，**順序決策（Sequential Decision Making）**與**自動規劃（Automated Planning）**始終處於核心地位。無論是讓機器人在未知環境中搬運包裹、調度航天器的發射任務，還是在複雜遊戲中控制非玩家角色（NPC），Agent 都必須具備「給定當前狀態與目標，自動推理出一系列可執行動作」的能力。

本篇文章將深入探討**古典規劃（Classical Planning）**的完整理論基石，包含符號表徵語言 <information context="Stanford Research Institute Problem Solver">STRIPS</information> 與 <information context="Planning Domain Definition Language">PDDL</information>、狀態空間的正向推進（Progression）與逆向迴歸（Regression）搜尋演算法，以及將規劃化歸為命題邏輯求解的 **SATPlan** 機制，並分析其計算複雜度界線。

---

## 1. 古典規劃的問題範疇與四大基礎假設

在自動規劃的理論模型中，最基礎且最被充分研究的範式稱為**古典規劃（Classical Planning）**。古典規劃對 Agent 所處的環境做出了四個極為強烈的簡化假設：

1. **離散性（Discrete）**：時間、狀態與動作皆為離散單位，不考慮連續的時間流逝或連續的物理控制量。
2. **確定性（Deterministic）**：在特定狀態 $s$ 下執行動作 $a$，其產生的新狀態 $s'$ 是百分之百確定的，不存在機率轉移或不確定 outcomes。
3. **靜態性（Static）**：環境的變更僅能由 Agent 自身執行的動作引發。當 Agent 正在思考或未採取動作時，環境狀態保持絕對靜止。
4. **完全可觀察性（Fully Observable）**：Agent 在任意時間點都能完整且精準地感知環境的所有細節，不存在隱藏狀態或噪聲干擾。

```
+-----------------------------------------------------------------+
|                    Classical Planning Domain                    |
|                                                                 |
|   [ Fully Observable ]   [ Deterministic ]   [ Discrete State ] |
|            ^                     ^                    ^         |
|            |                     |                    |         |
|      Agent Sensing -------> Environment -------> Action Execution|
|                                  ^                              |
|                                  | (Static: No outside events)  |
+-----------------------------------------------------------------+
```

雖然真實世界往往充斥著動態噪聲、連續變量與非確定性，但古典規劃之所以至今仍被廣泛應用與研究，原因在於：**它是解決複雜現實規劃問題的底層基石**。現代高級規劃器往往先在抽象的古典規劃模型中求解骨幹路徑，再透過分層分解或馬可夫決策過程（MDP）處理不確定性與連續控制。

---

## 2. 規劃問題表徵：從 STRIPS 到 PDDL

要讓計算機對世界進行規劃，首要挑戰是「**如何用精簡且具備因果推理能力的符號來表徵狀態與動作**」。

### 2.1 因果狀態表徵與資料庫語意

傳統搜尋演算法（如 $A^*$ 或 BFS）將狀態視為黑盒（Black-box Nodes），僅透過鄰接函數進行狀態轉移。這種方式無法利用狀態內部的結構資訊。古典規劃採用了**因果狀態表徵（Factored State Representation）**，將世界狀態表示為一組**基底原子變量（Ground Atomic Fluents）**的集合。

所謂 **Fluent**，是指隨時間變化而改變真偽值的命題或謂詞。例如在航空貨運問題中，$\text{At}(P_1, \text{SFO})$ 表示「飛機 $P_1$ 在舊金山機場」。

在古典規劃中，狀態的語意遵循兩項核心原則：
- **閉世界假設（Closed-World Assumption, CWA）**：任何未在狀態集合中明確列出的 Fluent，一律被判定為假（False）。例如若當前狀態為 $\{\text{At}(P_1, \text{SFO})\text{, } \text{Plane}(P_1)\}$，則 $\text{At}(P_1, \text{SIN})$ 自動為假。
- **唯一名稱假設（Unique Names Assumption, UNA）**：不同的常數符號必須代表不同的實體物件。例如 $P_1 \neq P_2$。

### 2.2 動作模式（Action Schemas）與具體動作（Grounded Actions）

動作是改變世界狀態的唯一手段。為了避免為每個物件組合手寫動作，古典規劃引入了帶有變量的**動作模式（Action Schema）**。

一個動作模式 $a$ 由三部分組成：
1. **動作名稱與參數（Action Name & Parameters）**：如 $\text{Fly}(p, \text{from}, \text{to})$。
2. **前置條件（Preconditions）**：動作可被執行前，狀態必須滿足的 Fluent 集合 $\text{Precond}(a)$。
3. **效果（Effects）**：執行該動作後狀態的變化。包含將 Fluent 設為真的 **ADD List**（正向效果 $\text{ADD}(a)$）與設為假的 **DEL List**（負向效果 $\text{DEL}(a)$）。

例如，飛航動作模式在 PDDL 中可定義如下：

```lisp
(:action Fly
 :parameters (?p - plane ?from - airport ?to - airport)
 :precondition (and (At ?p ?from) (Plane ?p) (Airport ?from) (Airport ?to))
 :effect (and (not (At ?p ?from)) (At ?p ?to)))
```

當常數代入變量後（如 $p \to P_1, \text{from} \to \text{SFO}, \text{to} \to \text{SIN}$），即生成一個**具體動作（Grounded Action）**：
- $\text{Precond}(\text{Fly}(P_1, \text{SFO}, \text{SIN})) = \{\text{At}(P_1, \text{SFO}), \text{Plane}(P_1), \text{Airport}(\text{SFO}), \text{Airport}(\text{SIN})\}$
- $\text{DEL}(\text{Fly}(P_1, \text{SFO}, \text{SIN})) = \{\text{At}(P_1, \text{SFO})\}$
- $\text{ADD}(\text{Fly}(P_1, \text{SFO}, \text{SIN})) = \{\text{At}(P_1, \text{SIN})\}$

### 2.3 框架問題（The Frame Problem）

在古典邏輯推理中，一個歷史悠久的難題稱為**框架問題（Frame Problem）**：*如何精確指定在執行某一動作後，世界上有哪些事實「沒有發生改變」，而不需要在公理中冗長地列出所有未受影響的事項？*

在 PDDL 與 STRIPS 語意中，框架問題透過**預設保持原則**被隱式解決：**未在 $\text{ADD}(a)$ 或 $\text{DEL}(a)$ 中提及的 Fluent，其真偽值在動作執行前後保持絕對不變**。執行動作後的新狀態 $s'$ 計算公式為：

$$s' = (s \setminus \text{DEL}(a)) \cup \text{ADD}(a)$$

---

## 3. 狀態空間搜尋演算法：正向推進 vs 逆向迴歸

有了狀態與動作的數學表徵後，求解規劃問題便可轉化為在狀態空間（State Space）中尋找一條從初始狀態 $s_0$ 到滿足目標 $g$ 的路徑。

```
Forward (Progression) Search:
Initial State s0 ----a1----> s1 ----a2----> s2 ... ----an----> State satisfying Goal g

Backward (Regression) Search:
Initial Goal g <----a_n---- Subgoal g1 <----a_{n-1}---- Subgoal g2 ... <----a1---- Initial State s0
```

### 3.1 正向搜尋（Progression Search）

正向搜尋（Progression / Forward State-Space Search）從初始狀態 $s_0$ 出發，顯式模擬動作的執行：

1. **可適用性檢查（Applicability）**：當且僅當當前狀態 $s$ 蘊含動作 $a$ 的前置條件（即 $\text{Precond}(a) \subseteq s$）時，動作 $a$ 在狀態 $s$ 下可適用。
2. **狀態更新（State Transition）**：套用公式生成後繼狀態 $s' = (s \setminus \text{DEL}(a)) \cup \text{ADD}(a)$。
3. **目標檢測（Goal Test）**：若 $g \subseteq s'$，則尋找成功，返回動作序列。

**優點**：永遠維護完整的具體狀態（Ground States），推理邏輯直觀。  
**缺點**：分支因子（Branching Factor）通常極大。許多與目標無關的動作也會被盲目展開，導致搜尋空間爆炸。

### 3.2 逆向搜尋（Regression Search）

與正向搜尋相反，逆向搜尋（Regression / Backward Search）從目標描述 $g$ 開始，逆向推導「為了達成當前目標，上一階段必須滿足什麼樣的子目標（Subgoals）」。

#### 動作相關性（Relevant Action）
在逆向搜尋中，並非所有動作都適合逆向套用。一個動作 $a$ 被稱為對目標描述 $g$ **相關（Relevant）**，當且僅當：
1. 動作 $a$ 的效果至少實現了 $g$ 中的一個目標字面量（即 $\text{ADD}(a) \cap g \neq \emptyset$）。
2. 動作 $a$ 的效果**不與 $g$ 中的任何目標字面量發生矛盾**（即 $\text{DEL}(a) \cap g = \emptyset$）。

#### 迴歸方程（Regression Formula）
給定目標描述 $g$ 與相關動作 $a$，逆向推導出的前置子目標 $g'$（稱為 $g$ 關於 $a$ 的 Regressed State）計算公式如下：

$$\text{POS}(g') = (\text{POS}(g) \setminus \text{ADD}(a)) \cup \text{POS}(\text{Precond}(a))$$

$$\text{NEG}(g') = (\text{NEG}(g) \setminus \text{DEL}(a)) \cup \text{NEG}(\text{Precond}(a))$$

其中 $\text{POS}(\cdot)$ 與 $\text{NEG}(\cdot)$ 分別代表正向與負向字面量集合。在逆向過程中，我們利用**最通用統一子（Most General Unifier, MGU）**對動作參數進行替換與綁定。

<callout title="基數比較：狀態（Ground State）與狀態描述（Description）" icon="info">
若環境中共有 $n$ 個 Ground Fluents：
- **具體狀態（Ground States）** 的數量為 $2^n$（每個 Fluent 非 True 即 False）。正向搜尋的節點即為具體狀態。
- **狀態描述（Descriptions / Subgoals）** 的數量為 $3^n$（每個 Fluent 可為 Positive、Negative 或 Unmentioned/Don't Care）。逆向搜尋維護的是狀態描述，代表符合該描述的一組狀態集合。
</callout>

---

## 4. 規劃即邏輯推論：SATPlan 與 Boolean Satisfiability

除了將規劃視為圖搜尋外，另一個極具影響力的範式是將規劃問題完全轉譯為**命題邏輯（Propositional Logic）**公式，並利用高效的 SAT Solver（如 MiniSAT、Glucose）求解。這一方法稱為 **SATPlan**（Kautz & Selman）。

```
+-------------------+      Translate to CNF      +-------------------+
|  Planning Domain  | -------------------------> | Propositional CNF |
|   & Problem PDDL  |   (at time t = 0..T)       |      Formula      |
+-------------------+                            +-------------------+
                                                           |
                                                           v
+-------------------+   Extract Action Sequence   +-------------------+
| Valid Plan Output | <-------------------------- |    SAT Solver     |
+-------------------+      (if Satisfiable)       |  (Finds Model M)  |
+-------------------+
```

### 4.1 SATPlan 基本運作流程

SATPlan 將時間離散化為時間步 $t = 0, 1, \dots, T_{\max}$。每個 Fluent 與 Action 都附加上時間索引 $t$：
- $P_t$：代表 Fluent $P$ 在時間步 $t$ 是否為真。
- $A_t$：代表 Action $A$ 是否在時間步 $t$ 被執行。

SATPlan 的演算法輪廓如下：
1. 設定邊界步數 $T = 0$。
2. 將初始狀態 $s_0$、目標 $g$、動作轉移公理編碼為合取範式（CNF）公式 $\Phi_T$。
3. 呼叫 SAT Solver 檢驗 $\Phi_T$ 的可滿足性：
   - 若可滿足（SAT），解出的模型（Truth Assignment）中所有為 True 的 $A_t$ 即構成有效計畫，演算法終止。
   - 若不可滿足（UNSAT），增加步數 $T \leftarrow T + 1$，重複步驟 2。

### 4.2 邏輯公理編碼與 Successor-State Axioms

在將規劃編碼為 SAT 時，必須精確表達狀態隨時間演變的邏輯關係：

1. **初始與目標公理**：
   - 初始狀態：若 $P \in s_0$，加入 $P_0$；若 $P \notin s_0$，加入 $\neg P_0$。
   - 目標狀態：加入 $G_T$。
2. **動作前置條件公理**：
   - 若動作 $A$ 的前置條件包含 $P$，則 $A_t \implies P_t$（即 $\neg A_t \lor P_t$）。
3. **動作效果公理**：
   - 若動作 $A$ 的 ADD 包含 $P$，DEL 包含 $Q$，則 $A_t \implies (P_{t+1} \land \neg Q_{t+1})$。

#### 繼承狀態公理（Successor-State Axioms）
若僅有上述公理，SAT Solver 可能會解出「未執行任何動作，但 Fluent 憑空改變」的不合理模型。若為每個未受影響的 Fluent 寫框條公理（Frame Axioms），對於 $m$ 個動作與 $n$ 個 Fluent，公理數量高達 $O(mn)$。

SATPlan 採用了 **Successor-State Axioms**（Reiter 邏輯之延伸）：* Fluent $P$ 在 $t+1$ 為真，當且僅當（1）在 $t$ 時執行了能 ADD $P$ 的動作，或（2）在 $t$ 時 $P$ 已為真，且沒有執行任何會 DEL $P$ 的動作。*

$$P_{t+1} \iff \left( \bigvee_{A \in \text{Add}(P)} A_t \right) \lor \left( P_t \land \neg \bigvee_{B \in \text{Del}(P)} B_t \right)$$

透過此編碼，公理總數大幅降至 $O(n)$，完美解決了邏輯編碼中的框架問題。此外，為了避免同一時間步執行互斥動作，還需加入**動作互斥公理（Action Exclusion Axioms）**：若動作 $A$ 與 $B$ 互相干擾，加入 $\neg A_t \lor \neg B_t$。

---

## 5. 規劃演算法特性與計算複雜度分析

衡量一個規劃演算法的優劣，需從理論特性與計算複雜度進行評估。

### 5.1 演算法三大屬性

- **正確性（Soundness）**：演算法所輸出的任意動作序列，保證能從初始狀態合法執行並成功達成目標。
- **完備性（Completeness）**：若該規劃問題存在合法解，演算法保證能在有限時間內找到解；若無解，能正確報告失敗。
- **最佳性（Optimality）**：演算法找到的解在特定度量（如動作步數或路徑總成本）下保證為全局最優。

### 5.2 計算複雜度界線

自動規劃在理論計算複雜度上屬於硬問題（Hard Problems）：

| 判定問題名稱 | 數學定義與問題描述 | 複雜度類別 |
| :--- | :--- | :--- |
| **PlanSAT** | 給定規劃領域與問題描述，是否存在**任意長度**的有效解？ | **PSPACE-complete**（在有限狀態空間下可判定，但空間複雜度高） |
| **Bounded PlanSAT** | 給定規劃問題與步數限制 $k$，是否存在**長度 $\le k$** 的有效解？ | **NP-complete** |

在實務中，找到**全局最佳解（Optimal Planning）**極具挑戰性；而尋找**滿意解（Satisficing Planning，即任意可行解）**則通常藉助高資訊量的啟發式函數（Heuristics）與強大的剪枝策略來實現，這也是下一篇文章將要深入探討的核心主題。

<reviewkit>
<takeaways>
- **古典規劃四大假設：** 離散（Discrete）、確定性（Deterministic）、靜態（Static）與完全可觀察（Fully Observable）。雖然設定嚴格，但它是複雜真實世界規劃問題的理論基礎與抽象層。
- **狀態表徵與框架問題：** STRIPS 與 PDDL 採用因果狀態表徵（Factored Representation），透過閉世界假設（CWA）與唯一名稱假設（UNA）簡化狀態。框架問題（Frame Problem）透過僅在動作中顯式定義 ADD/DEL 效果，隱式預設未提及事實保持不變。
- **正向推進 vs 逆向迴歸：** 正向搜尋從具體初始狀態（Ground State, $2^n$）出發；逆向搜尋從目標描述（State Description, $3^n$）利用相關動作（Relevant Action）與最通用統一子（MGU）倒推。迴歸方程精確更新正向與負向字面量集合。
- **SATPlan 與 Successor-State Axioms：** SATPlan 將時間步 $t$ 的狀態與動作轉譯為 CNF 命題邏輯。Successor-State Axioms 以 $P_{t+1} \iff \text{AddActions}_t \lor (P_t \land \neg \text{DelActions}_t)$ 的邏輯等價式將框條公理數量從 $O(mn)$ 降至 $O(n)$。
- **計算複雜度界線：** 任意長度的 PlanSAT 問題屬於 PSPACE-complete，而帶步數限制的 Bounded PlanSAT 則為 NP-complete。
</takeaways>
<qprompt/>
</reviewkit>

## 參考資料（References）

1. Fikes, R. E., & Nilsson, N. J. (1971). STRIPS: A new approach to the application of theorem proving to problem solving. *Artificial Intelligence*, 2(3-4), 189-208. [ScienceDirect](https://doi.org/10.1016/0004-3702(71)90010-5)
2. Kautz, H., & Selman, B. (1992). Planning as satisfiability. In *Proceedings of the 10th European Conference on Artificial Intelligence (ECAI)* (pp. 359-363).
3. Ghallab, M., Nau, D., & Traverso, P. (2004). *Automated Planning: Theory and Practice*. Morgan Kaufmann.
