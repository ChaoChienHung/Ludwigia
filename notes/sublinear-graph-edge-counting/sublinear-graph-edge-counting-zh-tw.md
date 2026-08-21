<meta>
Title: 圖邊數亞線性估計：加性/乘性誤差與 Heavy/Light 頂點分割
Summary: 深入探討無向圖邊數 m 的亞線性估算難題，對比加性與乘性誤差模型的差異，詳解基於頂點全序與 Heavy/Light (H/L) 分割的無偏估計器設計與方差放界證明，並剖析未知 m 時的適應性倍減猜測演算法。
Slug: sublinear-graph-edge-counting-zh-tw
Output: notes/sublinear-graph-edge-counting/sublinear-graph-edge-counting-zh-tw.html
CanonicalId: sublinear-graph-edge-counting
Style: default
Lang: zh-tw
Tags: algorithm, query algorithm, graph algorithm, sublinear algorithm, edge counting, heavy light decomposition, chebyshev inequality, median trick
Status: drafting
Published: 2026-08-20
LastModified: 2026-08-20
</meta>

<draft>
- 加性誤差在稀疏圖的失效與乘性誤差目標
- 頂點全序建立與轉向邊估計器 X 設計 (無偏性證明)
- Heavy/Light (H/L) 頂點分割 Lemma 與 Var(X) <= 6m^2/n 證明
- 未知 m 時的 Adaptive Guessing 與 Median Trick 總複雜度
</draft>

# 圖邊數亞線性估計：加性/乘性誤差與 Heavy/Light 頂點分割

<callout type="info">
TL;DR: 在稀疏圖（Sparse Graphs）中估算邊數 $m$ 時，加性誤差 $\varepsilon n^2$ 會失效。透過 Adjacency-list 模型建立頂點全序，並巧用 Heavy/Light ($H/L$) 頂點分割壓低估計器方差，配合適應性倍減猜測（Adaptive Guessing）與 Median Trick，可在 **$\Theta\left(\frac{n \log \log n}{\varepsilon^2 m}\right)$** 亞線性查詢複雜度內獲得乘性誤差 $(1+\varepsilon)$-逼近。
</callout>

## 1. 問題背景與誤差模型的選擇

給定一個包含 $n$ 個頂點的無向簡單圖 $G = (V, E)$，目標是估計總邊數 $m = |E|$。

### 1.1 加性誤差模型 (Additive Error)

在 Adjacency-matrix 模型中，若隨機抽樣 $k$ 對頂點對 $(u, v)$，計算其中屬於邊的比例：
- 若允許 $\varepsilon n^2$ 的加性誤差，只需抽樣 $k = \mathcal{O}(1/\varepsilon^2)$ 次。
- **缺點**：在稀疏圖（如 $m = \mathcal{O}(n)$）中，$\varepsilon n^2 \gg m$，估算結果毫無參考價值！

### 1.2 乘性誤差模型 (Multiplicative Error)

我們希望獲得 $(1+\varepsilon)$-逼近，即輸出 $\hat{m}$ 滿足：

$$(1 - \varepsilon) m \le \hat{m} \le (1 + \varepsilon) m$$

估計邊數 $m$ 等價於估計圖的平均度數 $\bar{d} = \frac{2m}{n}$。
如果直接隨機抽樣頂點 $v$ 查詢其度數 $d_v$：
- 期望值 $\mathbb{E}[d_v] = \bar{d}$。
- 方差 $\operatorname{Var}(d_v)$ 最高可達 $\mathcal{O}(n \bar{d})$（如星狀圖 Star Graph）。
- Chebyshev 不等式需要採樣 $k = \Theta(n / \bar{d}) = \Theta(n^2 / m)$ 次，在稀疏圖上一點也不亞線性！

---

## 2. 亞線性乘性估計器設計 (Adjacency-List Model)

為了解決直接抽樣度數方差過高的問題，我們引入**頂點全序（Total Order）與轉向邊計數**。

### 2.1 頂點全序定義

對所有頂點 $v_1, \dots, v_n$ 建立嚴格的全序關係 $<$：
1. 若 $d_{v_i} < d_{v_j}$，則 $v_i < v_j$。
2. 若 $d_{v_i} = d_{v_j}$，則當 $i < j$ 時 $v_i < v_j$。

定義 $d'_{v_i}$ 為頂點 $v_i$ 所有鄰居中，**序號大於 $v_i$ 的鄰居數量**。
注意到：每條邊 $(v_i, v_j)$ 在全序下恰好被唯一方向計數一次，因此：

$$\sum_{i=1}^n d'_{v_i} = m$$

### 2.2 估計器隨機變數 $X$ 設計

每次試驗執行以下步驟：
1. 均勻隨機抽樣一個頂點 $v_i \in V$。
2. 查詢其度數 $d_{v_i}$。
3. 均勻隨機挑選索引 $k \in \{1, 2, \dots, d_{v_i}\}$。
4. 查詢 $v_i$ 的第 $k$ 個鄰居，獲得頂點 $v_j$；並查詢 $d_{v_j}$。
5. **判定條件**：若 $v_i < v_j$，則回傳 $X = d_{v_i}$；否則回傳 $X = 0$。

### 2.3 無偏性證明 (Unbiased Estimator)

$$\begin{aligned}
\mathbb{E}[X] &= \sum_{i=1}^n \operatorname{Pr}[v_i] \cdot d_{v_i} \cdot \operatorname{Pr}[v_j > v_i \mid v_i] \\
&= \frac{1}{n} \sum_{i=1}^n d_{v_i} \cdot \frac{d'_{v_i}}{d_{v_i}} = \frac{1}{n} \sum_{i=1}^n d'_{v_i} = \frac{m}{n}
\end{aligned}$$

因此 $X$ 是 $m/n$ 的**無偏估計量**（只需將輸出乘以 $n$ 即得 $m$）。

---

## 3. 方差放界：Heavy / Light (H/L) 頂點分割法

為證明方差受控，我們將頂點集 $V$ 依據全序切分為兩大集合：

- **Heavy 頂點集 $H$**：全序最大的前 $2m$ 個頂點。
- **Light 頂點集 $L$**：其餘 $n - 2m$ 個較小的頂點。

### 3.1 關鍵 Lemma 證明

> **Lemma 1**：對任意 $v_i \in L$，其度數 $d_{v_i} \le 2m$。
> 
> *證明*：若存在 $v_i \in L$ 使 $d_{v_i} > 2m$，因 $H$ 中所有頂點皆大於 $v_i$，則 $H$ 中 $2m$ 個頂點的度數皆 $> 2m$。總度數和將超過 $2m \times 2m > 2m$，矛盾！

> **Lemma 2**：對任意 $v_i \in H$，其大於本身的鄰居數 $d'_{v_i} \le 2m$。
> 
> *證明*：因為全序中大於 $v_i$ 的頂點總數最多不超過 $|H| = 2m$ 個。

### 3.2 方差 $\operatorname{Var}(X)$ 界的計算

$$\operatorname{Var}(X) \le \mathbb{E}[X^2] = \frac{1}{n} \sum_{i=1}^n d_{v_i}^2 \cdot \frac{d'_{v_i}}{d_{v_i}} = \frac{1}{n} \sum_{i=1}^n d_{v_i} d'_{v_i}$$

將求和拆分為 $L$ 與 $H$ 兩部分：

$$\begin{aligned}
\sum_{i=1}^n d_{v_i} d'_{v_i} &= \sum_{v_i \in L} d_{v_i} d'_{v_i} + \sum_{v_i \in H} d_{v_i} d'_{v_i} \\
&\le \sum_{v_i \in L} (2m) d'_{v_i} + \sum_{v_i \in H} d_{v_i} (2m) \quad (\text{套用 Lemma 1 \& 2}) \\
&\le 2m \sum_{v_i \in L} d'_{v_i} + 2m \sum_{v_i \in H} d_{v_i} \\
&\le 2m \cdot m + 2m \cdot 2m = 6m^2
\end{aligned}$$

因此：

$$\operatorname{Var}(X) \le \frac{6m^2}{n}$$

相對變異數（Relative Variance）：

$$\frac{\operatorname{Var}(X)}{(\mathbb{E}[X])^2} \le \frac{6m^2 / n}{(m/n)^2} = 6n$$

根據 Chebyshev 不等式，當已知 $m$ 的數量級時，所需的抽樣次數為：

$$k = \Theta\left(\frac{n}{\varepsilon^2 m}\right)$$

---

## 4. 未知 $m$ 時的適應性倍減猜測 (Adaptive Guessing)

在實際應用中，$m$ 是我們要估計的目標，事先無法得知。我們採用**等比倍減猜測策略**：

1. 猜測值 $m'$ 從上界 $n^2$ 開始，每次除以 2：$m' = n^2, \frac{n^2}{2}, \frac{n^2}{4}, \dots, 1$。
2. 對每個猜測值 $m'$，執行估計器並取 $\Theta\left(\frac{n \log \log n}{\varepsilon^2 m'}\right)$ 次抽樣，並配合 **Median Trick** 提升當次成功率至 $1 - \mathcal{O}(1/\log n)$。
3. **終止條件**：當估算出的結果首次超過 $1.5 m'$ 時，停止迭代並輸出當前估計值。

### 總查詢複雜度分析

假設真實邊數為 $m$，在達到 $m' \approx m$ 前的等比級數求和：

$$\text{總查詢數} = \sum_{m' = m}^{n^2} \Theta\left(\frac{n \log \log n}{\varepsilon^2 m'}\right) = \Theta\left(\frac{n \log \log n}{\varepsilon^2 m}\right)$$

利用 Union Bound 結合所有猜測步驟的失敗率，整體算法以高機率返回 $(1+\varepsilon)$-近似值！

<reviewkit>
<qprompt/>
  <takeaways>
    - 加性誤差在稀疏圖中失效，必須採用乘性誤差與 Adjacency-list 模型。
    - 頂點全序與轉向邊計數將估計量轉化為無偏估計 $\mathbb{E}[X] = m/n$。
    - Heavy/Light ($H/L$) 分割巧妙限制了 $L$ 的度數與 $H$ 的上向邊數，證明 $\operatorname{Var}(X) \le 6m^2/n$。
    - 倍減猜測 (Adaptive Guessing) 配合 Median Trick 解決了 $m$ 未知難題，達成 $\Theta\left(\frac{n \log \log n}{\varepsilon^2 m}\right)$ 最佳複雜度。
  </takeaways>
</reviewkit>

## 參考資料（References）

1. NUS CS5234: Algorithms at Scale
