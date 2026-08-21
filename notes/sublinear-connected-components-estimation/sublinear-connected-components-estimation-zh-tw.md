<meta>
Title: 圖連通分量亞線性估算：有界與一般結構下的查詢複雜度
Summary: 分析無向圖中連通分量（Connected Components）數量的亞線性估估演算法，從頂點貢獻和 C = ∑ 1/|C(v)| 的代數轉換切入，探討組件大小有界與一般圖結構下的 BFS 截斷搜尋與 O(n/ε²) 查詢複雜度。
Slug: sublinear-connected-components-estimation-zh-tw
Output: notes/sublinear-connected-components-estimation/sublinear-connected-components-estimation-zh-tw.html
CanonicalId: sublinear-connected-components-estimation
Style: default
Lang: zh-tw
Tags: algorithm, query algorithm, graph algorithm, sublinear algorithm, connected components, bfs, additivity
Status: drafting
Published: 2026-08-20
LastModified: 2026-08-20
</meta>

<draft>
- 關鍵代數恆等式 C = sum 1/|C(v)|
- 組件大小有界 (|C(v)| <= B) 的 BFS 估算與 O(B^2/ε^2) 複雜度
- 一般圖結構下的 Truncated BFS (截斷門檻 K = 1/ε) 與 O(1/ε^3) 複雜度
</draft>

# 圖連通分量亞線性估算：有界與一般結構下的查詢複雜度

<callout>
variant: info
content:
TL;DR: 利用經典恆等式 $C = \sum_{v \in V} \frac{1}{|C(v)|}$，估計連通分量數量 $C$ 可轉化為估計隨機頂點倒數組件大小 $\frac{1}{|C(v)|}$ 的期望值。透過 BFS 廣度優先搜尋，在加性誤差 $\varepsilon n$ 下，查詢複雜度可壓低至與 $n$ 無關的 **$\mathcal{O}(1/\varepsilon^3)$**！
</callout>

## 1. 核心恆等式：從連通分量到頂點倒數和

設無向圖 $G = (V, E)$ 包含 $n$ 個頂點與 $C$ 個連通分量（Connected Components）。
記 $C(v)$ 為包含頂點 $v$ 的連通分量，且 $|C(v)|$ 為該分量包含的頂點個數。

關鍵數學恆等式：

$$C = \sum_{v \in V} \frac{1}{|C(v)|}$$

### 恆等式證明

設圖中的 $C$ 個連通分量分別為 $K_1, K_2, \dots, K_C$。我們將總和依分量拆解：

$$\sum_{v \in V} \frac{1}{|C(v)|} = \sum_{i=1}^C \sum_{v \in K_i} \frac{1}{|K_i|} = \sum_{i=1}^C \left( |K_i| \cdot \frac{1}{|K_i|} \right) = \sum_{i=1}^C 1 = C$$

> **觀念轉化**：原先需要全圖探索才能知道的連通分量總數 $C$，現在被成功拆解為每個頂點 $v$ 對全域的**局部貢獻值 $f(v) = \frac{1}{|C(v)|}$**！

---

## 2. 情境一：組件大小有界 (Bounded Component Size, $|C(v)| \le B$)

假設圖中每個連通分量的大小都有明確上界 $B$（例如 $B = 100$）。

### 2.1 估計器 $X$ 與演算法設計

1. 均勻隨機抽樣一個頂點 $v \in V$。
2. 從 $v$ 開始執行 **BFS（廣度優先搜尋）**：
   - 由於 $|C(v)| \le B$，BFS 最多只需探測 $B$ 個頂點即可完整遍歷 $v$ 所在的整個連通分量，並精確求出 $|C(v)|$。
3. 回傳估計變數 $X = \frac{1}{|C(v)|}$。

### 2.2 期望值與查詢複雜度

隨機變數 $X$ 的期望值：

$$\mathbb{E}[X] = \sum_{v \in V} \operatorname{Pr}[v] \cdot \frac{1}{|C(v)|} = \frac{1}{n} \sum_{v \in V} \frac{1}{|C(v)|} = \frac{C}{n}$$

因此 $n X$ 是 $C$ 的無偏估計量。

- **單次試驗查詢數**：在 Adjacency-matrix 模型中，BFS 最多探索 $B$ 個頂點，邊查詢次數不超過 $\mathcal{O}(B^2)$。
- **總查詢複雜度**：抽樣 $k = \mathcal{O}(1/\varepsilon^2)$ 個頂點，總查詢數為：

$$\text{總查詢數} = \mathcal{O}\left(\frac{B^2}{\varepsilon^2}\right)$$

當 $B$ 為常數時，查詢複雜度為 **$\mathcal{O}(1/\varepsilon^2)$**，完全與圖的大小的 $n$ 無關！

---

## 3. 情境二：一般圖結構 (Unbounded Component Size)

當圖中存在巨大連通分量（如包含 $\mathcal{O}(n)$ 個頂點的 Giant Component）時，對單一頂點執行完整 BFS 可能需要 $\Omega(n)$ 次查詢。

### 3.1 截斷式 BFS (Truncated BFS) 演算法

為了維持亞線性，我們定義 **截斷門檻 $K = \frac{1}{\varepsilon}$**：

1. 均勻隨機抽樣一個頂點 $v \in V$。
2. 從 $v$ 開始執行 BFS，但**最多只探索 $K = 1/\varepsilon$ 個頂點**：
   - 若 BFS 在到達 $K$ 個頂點前結束，輸出真實大小 $|C(v)|$。
   - 若探索達到 $K$ 個頂點仍未結束，強制中斷 BFS，並回報截斷大小 $n_K(v) = K$。
3. 回傳估計變數 $X = \frac{1}{n_K(v)}$。

### 3.2 誤差分析

定義近似函數 $\hat{f}(v) = \frac{1}{n_K(v)}$。
分析真實貢獻 $f(v) = \frac{1}{|C(v)|}$ 與截斷估計 $\hat{f}(v)$ 的最大偏差：

- 若 $|C(v)| \le K$：$n_K(v) = |C(v)|$，偏差為 0。
- 若 $|C(v)| > K$：真實貢獻 $\frac{1}{|C(v)|} < \frac{1}{K} = \varepsilon$，而截斷估值 $\frac{1}{n_K(v)} = \frac{1}{K} = \varepsilon$。偏差大於 0 但恆不超過 $\varepsilon$：

$$0 \le \hat{f}(v) - f(v) < \frac{1}{K} = \varepsilon$$

將所有頂點的偏差求和：

$$0 \le \sum_{v \in V} \hat{f}(v) - \sum_{v \in V} f(v) \le n \cdot \varepsilon$$

這意味著：**截斷式估算帶來的系統誤差天生受到加性誤差 $\varepsilon n$ 的保護**！

### 3.3 總查詢複雜度

- **單次截斷 BFS 查詢數**：最多探索 $K = 1/\varepsilon$ 個頂點，查詢次數上限為 $\mathcal{O}(1/\varepsilon^2)$。
- **總抽樣次數**：由 Chernoff Bound，抽樣 $k = \mathcal{O}(1/\varepsilon^2)$ 個頂點即可滿足採樣波動小於 $\varepsilon n$。
- **總查詢複雜度**：

$$\text{總查詢數} = \mathcal{O}\left(\frac{1}{\varepsilon^2}\right) \times \mathcal{O}\left(\frac{1}{\varepsilon}\right) = \mathcal{O}\left(\frac{1}{\varepsilon^3}\right)$$

在完全不對圖結構做任何假設的前提下，我們依然達成了**與頂點總數 $n$ 無關的常數亞線性查詢複雜度 $\mathcal{O}(1/\varepsilon^3)$**！

<reviewkit>
<qprompt/>
  <takeaways>
    - 透過倒數和恆等式 $C = \sum \frac{1}{|C(v)|}$，連通分量估算轉化為頂點局部貢獻的平均值估計。
    - 組件大小有界時，BFS 最多探索 $B$ 個頂點，查詢複雜度為 $\mathcal{O}(B^2 / \varepsilon^2)$。
    - 一般圖結構下，透過設定截斷門檻 $K = 1/\varepsilon$，Truncated BFS 成功將誤差控制在 $\varepsilon n$ 內，達成 $\mathcal{O}(1/\varepsilon^3)$ 亞線性界限。
  </takeaways>
</reviewkit>

## 參考資料（References）

1. NUS CS5234: Algorithms at Scale
