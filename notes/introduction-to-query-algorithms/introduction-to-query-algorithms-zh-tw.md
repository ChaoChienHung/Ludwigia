<meta>
Title: 亞線性查詢演算法導論：Oracle 介面與查詢複雜度
Summary: 探討資料量無法完整讀取時的亞線性計算範式（Sublinear Computing），包含 Oracle 查詢模型（Array, Matrix, List）、查詢複雜度、加性誤差（Additive）與乘性誤差（Multiplicative）的界定。
Slug: introduction-to-query-algorithms-zh-tw
Output: notes/introduction-to-query-algorithms/introduction-to-query-algorithms-zh-tw.html
CanonicalId: introduction-to-query-algorithms
Style: default
Lang: zh-tw
Tags: algorithm, query algorithm, sublinear algorithm, oracle, complexity theory, graph algorithm
Status: drafting
Published: 2026-08-20
LastModified: 2026-08-20
</meta>

<draft>
- 亞線性計算範式與 Oracle 查詢介面
- 圖論查詢模型：Adjacency-matrix vs Adjacency-list
- 加性誤差 (Additive) 與乘性誤差 (Multiplicative) 區分
- 亞線性演算法與 Concentration 的聯結
</draft>

# 亞線性查詢演算法導論：Oracle 介面與查詢複雜度

<callout>
variant: info
content:
TL;DR: 在大數據時代，當資料規模 $N$ 極大時，傳統連線性時間 $\mathcal{O}(N)$ 的演算法都過於昂貴。亞線性查詢演算法（Sublinear Query Algorithms）放棄完整讀取輸入，改透過 **Oracle 查詢介面** 對資料進行局部隨機抽樣，在亞線性時間 $\mathcal{O}(o(N))$ 內以高機率估算出資料的總體統計量。
</callout>

## 1. 核心概念與 Oracle 模型

在傳統演算法中，我們假設演算法可以無代價地存取整個輸入資料陣列。但在亞線性計算範式（Sublinear Paradigm）中：

> **我們沒有時間閱讀完整資料。我們只能存取資料的一小部分，並根據有限的資訊做出估算。**

```
┌─────────────────────────────────────────────────────────┐
│                     Input Data (Size N)                 │
└───────────────────────────┬─────────────────────────────┘
                            │ (Access Restricted)
                            ▼
                    ┌───────────────┐
                    │  Oracle Query │ ◄── Query Complexity = # of queries
                    └───────┬───────┘
                            │ (Limited Information)
                            ▼
                    ┌───────────────┐
                    │ Sublinear Algo│
                    └───────┬───────┘
                            │
                            ▼
                  Estimated Statistic (Â)
```

### 什麼是 Oracle（查詢黑盒子）？

演算法無法直接讀取記憶體，必須透過向 **Oracle** 發射 Query 來取得資訊：
- **陣列 Oracle**：「清單中第 $i$ 個位置的數值是什麼？」
- **黑盒函數 Oracle**：「輸入 $x$，函數 $f(x)$ 的輸出為何？」
- **圖結構 Oracle**：見下文說明。

---

## 2. 圖論查詢模型 (Graph Query Models)

在圖論（Graph Theory）中，根據圖是稠密（Dense）還是稀疏（Sparse），我們主要使用兩類 Oracle 模型：

### 2.1 Adjacency-Matrix Model (鄰接矩陣模型)

- **適用場景**：稠密圖（Dense Graphs，$m = \Theta(n^2)$）。
- **Pair Query（邊對查詢）**：給定頂點 $u$ 與 $v$，Oracle 返回 $u$ 與 $v$ 之間是否有邊相連。
- **查詢代價**：每次查詢回傳 $O(1)$ 資訊。

### 2.2 Adjacency-List Model (鄰接表模型)

- **適用場景**：稀疏圖（Sparse Graphs，$m = \mathcal{O}(n)$）。
- **Degree Query（度數查詢）**：給定頂點 $v$，Oracle 返回 $v$ 的度數 $d_v$。
- **Neighbor Query（鄰居查詢）**：給定頂點 $v$ 與索引 $i$（$1 \le i \le d_v$），Oracle 返回 $v$ 的第 $i$ 個鄰居頂點 ID。

---

## 3. 估算誤差的兩種型態

亞線性查詢演算法的輸出不可能 $100\%$ 精確（否則必可歸約至全資料讀取 $\Omega(N)$ 的下界）。我們主要區分兩種誤差衡量標準：

### 3.1 加性誤差 (Additive Error)

給定真實答案 $A$ 與容許誤差參數 $\varepsilon > 0$，演算法輸出估計值 $\hat{A}$ 滿足：

$$|A - \hat{A}| \le \varepsilon N$$

- **特點**：容許誤差與總體規模 $N$ 成正比。
- **侷限**：當真實答案 $A$ 本身非常小（例如稀疏圖的邊數 $m = \mathcal{O}(n)$）時，$\varepsilon n^2$ 的加性誤差會完全吞噬真實訊號。

### 3.2 乘性誤差 (Multiplicative Error / $(1+\varepsilon)$-Approximation)

演算法輸出估計值 $\hat{A}$ 滿足：

$$(1 - \varepsilon) A \le \hat{A} \le (1 + \varepsilon) A$$

- **特點**：誤差與真實答案 $A$ 本身的大小成正比（相對誤差）。
- **挑戰**：當 $A = 0$ 與 $A = 1$ 時，區分兩者往往需要 $\Omega(N)$ 的查詢次數，因此乘性誤差算法通常需要額外的結構假設（例如圖保證連通）。

---

## 4. 亞線性演算法與 Concentration 的紐帶

亞線性查詢演算法的設計標準流程：

1. **定義估計器（Estimator）**：設計一個透過 Oracle 隨機抽樣的無偏估計量 $X$（$\mathbb{E}[X] = A$）。
2. **分析變異數（Variance Analysis）**：評估 $\operatorname{Var}(X)$ 的大小。
3. **套用 Concentration Inequalities**：利用 Chernoff 或 Chebyshev 不等式計算所需的抽樣次數 $k$，確保失敗機率小於常數（如 $1/10$）。
4. **成功率放大（Boosting）**：利用 Median Trick 將成功率提升至任意高的 $1 - \delta$。

<reviewkit>
<qprompt/>
  <takeaways>
    - 亞線性演算法透過 Oracle 隨機抽樣，將查詢複雜度降低至 $\mathcal{O}(o(N))$。
    - 圖論查詢模型分為稠密圖專用的 Adjacency-matrix 與稀疏圖專用的 Adjacency-list。
    - 加性誤差適合大規模總量；乘性誤差則適合對精確相對比例有高要求的場合。
  </takeaways>
</reviewkit>

## 參考資料（References）

1. NUS CS5234: Algorithms at Scale
