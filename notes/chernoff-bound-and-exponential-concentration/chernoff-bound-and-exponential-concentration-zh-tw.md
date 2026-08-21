<meta>
Title: Chernoff Bound 與指數級集中：獨立隨機變數和的強界限
Summary: 剖析矩生成函數（MGF）與 Chernoff Bound 的指數級衰減特性，對比 Chebyshev 界的優勢，並深入證明多項式球桶分配下的強集中度與無空桶極高機率定理。
Slug: chernoff-bound-and-exponential-concentration-zh-tw
Output: notes/chernoff-bound-and-exponential-concentration/chernoff-bound-and-exponential-concentration-zh-tw.html
CanonicalId: chernoff-bound-and-exponential-concentration
Style: default
Lang: zh-tw
Tags: algorithm, probability, concentration inequalities, chernoff bound, moment generating function, union bound, balls and bins
Status: drafting
Published: 2026-08-20
LastModified: 2026-08-20
</meta>

<draft>
- 矩生成函數 (MGF) 與 Chernoff 導出
- 雙邊與單邊常用 Chernoff Bounds
- Chebyshev vs Chernoff 實戰對比
- 高機率無空桶證明 (10 n log n 球)
</draft>

# Chernoff Bound 與指數級集中：獨立隨機變數和的強界限

<callout type="info">
TL;DR: Chernoff Bound 是獨立隨機變數和（Sum of Independent Random Variables）最強大的集中不等式。透過矩生成函數（MGF），它將 Tail Bound 的衰減速率從多項式級一口氣提升至**指數級衰減（Exponential Decay）**。
</callout>

## 1. 矩生成函數 (MGF) 與 Chernoff 的導出

設 $X_1, X_2, \dots, X_n$ 為獨立的伯努利隨機變數（$X_i \in \{0, 1\}$），令 $X = \sum_{i=1}^n X_i$，期望值為 $\mu = \mathbb{E}[X]$。

Chernoff Bound 的關鍵核心在於：**對 $e^{tX}$（$t > 0$）套用 Markov 不等式**。

$$\operatorname{Pr}[X \ge a] = \operatorname{Pr}[e^{tX} \ge e^{ta}] \le \frac{\mathbb{E}[e^{tX}]}{e^{ta}}$$

由於 $X_i$ 互相獨立，指數函數將「和」轉化為「積」，使得矩生成函數（Moment Generating Function, MGF）可以拆解：

$$\mathbb{E}[e^{tX}] = \mathbb{E}\left[e^{t \sum X_i}\right] = \mathbb{E}\left[\prod e^{t X_i}\right] = \prod_{i=1}^n \mathbb{E}[e^{t X_i}]$$

針對參數 $t > 0$ 進行最優化（Optimization over $t$），即可導出極為緊緻的指數級界限。

---

## 2. Chernoff Bound 的常用形式

在演算法分析中，我們最常使用以下幾種標準形式（記 $\mu = \mathbb{E}[X]$）：

### 2.1 雙邊相對偏差形式 ($0 < \delta \le 1$)

$$\operatorname{Pr}[|X - \mu| \ge \delta \mu] \le 2 e^{-\frac{\delta^2 \mu}{3}}$$

### 2.2 大偏差單邊形式 ($\delta > 1$)

$$\operatorname{Pr}[X \ge (1 + \delta)\mu] \le e^{-\frac{\delta \mu}{3}}$$

---

## 3. Chebyshev vs. Chernoff 實戰對比

> **問題 (Note 1 Exercise 3)**：將 $10 n \ln n$ 個球隨機且獨立地投進 $n$ 個桶子中。求第二個桶子內的球數 $Y$ 集中在期望值附近的機率。

### 步驟解析

1. **期望值與方差**：
   - 投一次進第二桶的機率為 $p = 1/n$。
   - 總球數 $N = 10 n \ln n$。
   - $\mathbb{E}[Y] = N p = 10 \ln n$。
   - $\operatorname{Var}(Y) = N p (1 - p) = 10 \ln n \left(1 - \frac{1}{n}\right)$。

2. **方法一：Chebyshev 不等式（多項式界限）**：
   求偏離值 $\varepsilon \ln n$ 的機率：

$$\operatorname{Pr}[|Y - \mu| \ge \varepsilon \ln n] \le \frac{\operatorname{Var}(Y)}{(\varepsilon \ln n)^2} = \frac{10 (1 - 1/n) \ln n}{\varepsilon^2 \ln^2 n} = \mathcal{O}\left(\frac{1}{\varepsilon^2 \ln n}\right)$$

   衰減速率為 $\frac{1}{\ln n}$，當 $n$ 很大時收斂相當緩慢。

3. **方法二：Chernoff Bound（指數級界限）**：
   套用 Chernoff Bound 雙邊形式（取 $\delta$ 使 $\delta \mu = \delta (10 \ln n)$）：

$$\operatorname{Pr}[|Y - \mu| \ge \delta \mu] \le 2 e^{-\frac{\delta^2 (10 \ln n)}{3}} = 2 e^{\ln (n^{-\frac{10 \delta^2}{3}})} = 2 n^{-\frac{10 \delta^2}{3}}$$

   **結果對比**：Chernoff Bound 給出了多項式級小於 $n$ 的機率（例如取 $\delta = 1$ 時機率小於 $2 n^{-3.33}$），衰減速度遠快於 Chebyshev 的 $\mathcal{O}(1/\ln n)$！

---

## 4. 經典應用：高機率無空桶證明 (Note 1 Exercise 4)

> **定理**：若將 $10 n \ln n$ 個球隨機投進 $n$ 個桶子中，則**完全沒有空桶**的機率極高（High Probability, 即 $1 - \frac{1}{\operatorname{poly}(n)}$）。

### 完整證明

1. 令 $E_i$ 為「第 $i$ 個桶子為空」的壞事件。
2. 計算單一桶子為空的機率：

$$\operatorname{Pr}[E_i] = \left(1 - \frac{1}{n}\right)^{10 n \ln n} \le \left(e^{-\frac{1}{n}}\right)^{10 n \ln n} = e^{-10 \ln n} = n^{-10}$$

3. **結合 Union Bound**：求存在至少一個空桶（即任意壞事件發生）的總機率：

$$\operatorname{Pr}[\text{存在空桶}] = \operatorname{Pr}\left[\bigcup_{i=1}^n E_i\right] \le \sum_{i=1}^n \operatorname{Pr}[E_i] = n \cdot n^{-10} = n^{-9}$$

4. 故無空桶的成功率為：

$$\operatorname{Pr}[\text{無空桶}] = 1 - \operatorname{Pr}[\text{存在空桶}] \ge 1 - \frac{1}{n^9}$$

這是一個典型的 High Probability（$1 - \mathcal{O}(n^{-k})$）保證！

<reviewkit>
<qprompt/>
  <takeaways>
    - Chernoff Bound 適用於獨立試驗和，利用矩生成函數 (MGF) 獲得指數級衰減。
    - 相比 Chebyshev 的多項式衰減，Chernoff 能提供 $n^{-\Omega(1)}$ 等極強的概率界限。
    - 結合 Chernoff Bound 與 Union Bound，可以證明在 $10 n \ln n$ 球分配下，系統以 $1 - n^{-9}$ 的極高機率完全無空桶。
  </takeaways>
</reviewkit>

## 參考資料（References）

1. NUS CS5234: Algorithms at Scale
