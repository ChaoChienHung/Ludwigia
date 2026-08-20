<meta>
Title: 亞線性計數與中位數估算：Counting 1s 與 Sample Median
Summary: 剖析 1s 數量估算（Counting 1s）與陣列中位數（Sample Median）的經典亞線性查詢演算法，詳細分析抽樣複雜度並利用 Chernoff bound 與 Union bound 提供嚴謹的正確性證明。
Slug: sublinear-counting-and-median-approximation-zh-tw
Output: notes/sublinear-counting-and-median-approximation/sublinear-counting-and-median-approximation-zh-tw.html
CanonicalId: sublinear-counting-and-median-approximation
Style: default
Lang: zh-tw
Tags: algorithm, query algorithm, sublinear algorithm, counting, median approximation, chernoff bound, union bound
Status: drafting
Published: 2026-08-20
LastModified: 2026-08-20
</meta>

<draft>
- Counting 1s 加性誤差估計與 Chernoff Bound 分析
- Sample Median 陣列中位數估算
- 雙邊壞事件與 Union Bound 正確性保證
</draft>

# 亞線性計數與中位數估算：Counting 1s 與 Sample Median

<callout type="info">
TL;DR: 透過隨機抽樣 $k = \mathcal{O}(1/\varepsilon^2)$ 個元素，我們可以在完全不遍歷整體資料的情況下，以加性誤差 $\varepsilon n$ 估算 $n$-bit 位元串中 1 的數量，或以極高機率找到接近陣列中位數（Rank 在 $(1/2 \pm \varepsilon)n$ 之間）的元素。
</callout>

## 1. 案例一：Counting 1s (位元串 1 的數量估計)

### 1.1 問題定義

- **輸入**：長度為 $n$ 的二元字串（$n$-bit binary string）。
- **目標**：估計字串中 1 的總個數 $A = \sum_{i=1}^n b_i$。
- **誤差要求**：給定 $\varepsilon > 0$，允許 **加性誤差（Additive Error）** $\varepsilon n$，即輸出估計值 $\hat{A}$ 滿足 $|A - \hat{A}| \le \varepsilon n$。

若要求 $100\%$ 精確解，必須查詢全部 $n$ 個 bit（下界 $\Omega(n)$）。但若允許 $\varepsilon n$ 的誤差，我們可以達到**常數時間複雜度 $\mathcal{O}(1/\varepsilon^2)$**！

### 1.2 演算法設計

1. 獨立且均勻地隨機挑選 $k$ 個位置 $i_1, i_2, \dots, i_k \in \{1, \dots, n\}$。
2. 向 Oracle 查詢這 $k$ 個位置的 bit 值，記為 $x_1, x_2, \dots, x_k$。
3. 計算採樣中 1 的數量 $X = \sum_{j=1}^k x_j$。
4. 輸出估計值：

$$\hat{A} = X \cdot \frac{n}{k}$$

### 1.3 期望值與正確性分析

對於每次採樣 $x_j$，其為 1 的機率等於總體中 1 的比例：

$$\mathbb{E}[x_j] = \operatorname{Pr}[x_j = 1] = \frac{A}{n}$$

根據期望值的線性：

$$\mathbb{E}[X] = \mathbb{E}\left[\sum_{j=1}^k x_j\right] = k \cdot \frac{A}{n}$$

因此估計值 $\hat{A}$ 是**無偏估計量（Unbiased Estimator）**：

$$\mathbb{E}[\hat{A}] = \mathbb{E}\left[X \cdot \frac{n}{k}\right] = \frac{n}{k} \cdot \frac{k A}{n} = A$$

### 1.4 抽樣複雜度放界 (Chernoff Bound)

我們希望偏差超過 $\varepsilon n$ 的失敗機率小於 $0.1$：

$$\operatorname{Pr}[|\hat{A} - A| \ge \varepsilon n] = \operatorname{Pr}[|X - \mu| \ge \varepsilon k] \le 0.1 \quad \left(\text{記 } \mu = \mathbb{E}[X] = \frac{k A}{n}\right)$$

套用 Chernoff Bound 雙邊形式：

$$\operatorname{Pr}[|X - \mu| \ge \delta \mu] \le 2 e^{-\frac{\delta^2 \mu}{3}}$$

其中令 $\delta \mu = \varepsilon k \implies \delta = \frac{\varepsilon k}{\mu} = \frac{\varepsilon n}{A}$。
經推導可得：只要選取採樣數 **$k \ge \frac{100}{\varepsilon^2}$**，失敗機率保證小於 $0.1$（即成功率至少 $90\%$）。

---

## 2. 案例二：Median Approximation (近似中位數估算)

### 2.1 問題定義

- **輸入**：未排序的陣列 $a_1, a_2, \dots, a_n$。
- **目標**：找到一個元素，其在排序後的 Rank 介於 $\left(\frac{1}{2} - \varepsilon\right)n$ 與 $\left(\frac{1}{2} + \varepsilon\right)n$ 之間。

### 2.2 演算法設計

1. 均勻隨機抽樣 $k$ 個陣列位置。
2. 輸出這 $k$ 個樣本的**中位數（Sample Median）**。

### 2.3 分析與 Union Bound 證明

什麼時候演算法會**失敗**？當樣本中位數的 Rank 偏離目標範圍時。
這等價於以下兩個壞事件（Bad Events）之一發生：

- **壞事件 $E_1$**：採樣中超過 $k/2$ 個元素的 Rank 小於 $\left(\frac{1}{2} - \varepsilon\right)n$。
- **壞事件 $E_2$**：採樣中超過 $k/2$ 個元素的 Rank 大於 $\left(\frac{1}{2} + \varepsilon\right)n$。

#### 對 $E_1$ 進行 Chernoff 放界

定義指示變數 $Y_j = 1$ 表示第 $j$ 個採樣元素的 Rank $< \left(\frac{1}{2} - \varepsilon\right)n$。

$$\mathbb{E}[Y_j] = \frac{1}{2} - \varepsilon$$

令 $Y = \sum_{j=1}^k Y_j$，則期望值 $\mu_Y = \mathbb{E}[Y] = \left(\frac{1}{2} - \varepsilon\right)k$。
條件 $Y \ge k/2$ 等價於 $Y \ge (1 + \delta)\mu_Y$（其中 $\delta \approx 2\varepsilon$）。
套用 Chernoff Bound：

$$\operatorname{Pr}[E_1] = \operatorname{Pr}\left[Y \ge \frac{k}{2}\right] < e^{-\frac{\varepsilon^2 k}{10}}$$

當取 $k \ge \frac{100}{\varepsilon^2}$ 時：

$$\operatorname{Pr}[E_1] < 0.1, \quad \operatorname{Pr}[E_2] < 0.1$$

#### 結合 Union Bound

根據 Union Bound，整體失敗機率：

$$\operatorname{Pr}[\text{失敗}] = \operatorname{Pr}[E_1 \cup E_2] \le \operatorname{Pr}[E_1] + \operatorname{Pr}[E_2] < 0.1 + 0.1 = 0.2$$

故**整體成功找到近中位數的機率至少為 $80\%$**！

<reviewkit>
  <qprompt>
    在 Counting 1s 與 Median Approximation 中，所需的抽樣數 $k = \mathcal{O}(1/\varepsilon^2)$ 都與資料總量 $n$ **完全無關**。這背後的直覺原因是什麼？
  </qprompt>
  <takeaways>
    - Counting 1s 透過均勻抽樣 $k = \mathcal{O}(1/\varepsilon^2)$ 個位置，能在常數時間內獲得加性誤差 $\varepsilon n$ 的無偏估算。
    - Sample Median 利用樣本中位數估算總體中位數，利用 Chernoff Bound 與 Union Bound 證明其成功率高於 $80\%$。
    - 抽樣數僅取決於精度參數 $\varepsilon$，達成真正的亞線性（甚至常數時間 $\mathcal{O}(1)$）查詢複雜度。
  </takeaways>
</reviewkit>

## 參考資料（References）

1. NUS CS5234: Algorithms at Scale
