<meta>
Title: Chebyshev 不等式與變異數分析：從方差壓制偏差
Summary: 深入 Chebyshev 不等式的數學推導、Pairwise Independence 條件、共變異數（Covariance）矩陣，並以 Balls & Bins 模型中負共變異數（Negative Covariance）的精確界限證明為實戰範例。
Slug: chebyshevs-inequality-and-variance-zh-tw
Output: notes/chebyshevs-inequality-and-variance/chebyshevs-inequality-and-variance-zh-tw.html
CanonicalId: chebyshevs-inequality-and-variance
Style: default
Lang: zh-tw
Tags: algorithm, probability, concentration inequalities, chebyshev inequality, variance, covariance, balls and bins
Status: drafting
Published: 2026-08-20
LastModified: 2026-08-20
</meta>

<draft>
- Chebyshev 不等式定義與由 Markov 推導之過程
- 方差與 Covariance 矩陣展開
- 實戰：Balls & Bins 負共變異數證明與空桶數量集中度
</draft>

# Chebyshev 不等式與變異數分析：從方差壓制偏差

<callout type="info">
TL;DR: Chebyshev 不等式利用隨機變數的**二階矩（變異數 Variance）**，將偏離雙邊距離的機率上界壓制到二次方反比衰減 $\mathcal{O}(1/k^2)$。只要變數滿足成對獨立（Pairwise Independence）或負相關（Negative Covariance），就能發揮強大效果。
</callout>

## 1. 數學定理與形式

> **Chebyshev 不等式定理**：
> 設 $X$ 為期望值為 $\mu = \mathbb{E}[X]$、變異數為 $\sigma^2 = \operatorname{Var}(X) < \infty$ 的隨機變數，則對任意 $k > 0$，恆有：
> 
> $$\operatorname{Pr}[|X - \mu| \ge k \sigma] \le \frac{1}{k^2}$$

若我們關注絕對偏離值 $\varepsilon > 0$（令 $k\sigma = \varepsilon \implies k = \frac{\varepsilon}{\sigma}$），不等式可等價改寫為：

$$\operatorname{Pr}[|X - \mu| \ge \varepsilon] \le \frac{\operatorname{Var}(X)}{\varepsilon^2}$$

---

## 2. 數學證明：巧用 Markov 不等式

Chebyshev 不等式的證明非常精妙，其本質就是將非負隨機變數 $Y = (X - \mu)^2$ 套用 Markov 不等式。

### 證明過程

1. 定義隨機變數 $Y = (X - \mu)^2$。因為任何實數的平方皆非負，故 $Y \ge 0$。
2. 計算 $Y$ 的期望值：根據變異數的定義，$\mathbb{E}[Y] = \mathbb{E}[(X - \mu)^2] = \operatorname{Var}(X) = \sigma^2$。
3. 對非負變數 $Y$ 套用 Markov 不等式，門檻設為 $k^2 \sigma^2$：

$$\operatorname{Pr}[Y \ge k^2 \sigma^2] \le \frac{\mathbb{E}[Y]}{k^2 \sigma^2} = \frac{\sigma^2}{k^2 \sigma^2} = \frac{1}{k^2}$$

4. 注意到事件 $Y \ge k^2 \sigma^2$ 等價於 $(X - \mu)^2 \ge k^2 \sigma^2$，兩邊開平方根即得 $|X - \mu| \ge k \sigma$。因此：

$$\operatorname{Pr}[|X - \mu| \ge k \sigma] \le \frac{1}{k^2}$$

---

## 3. 隨機變數和的變異數與 Covariance 展開

當 $X = \sum_{i=1}^n X_i$ 為多個隨機變數之和時，計算 $\operatorname{Var}(X)$ 是套用 Chebyshev 不等式的關鍵：

$$\operatorname{Var}(X) = \sum_{i=1}^n \operatorname{Var}(X_i) + 2 \sum_{1 \le i < j \le n} \operatorname{Cov}(X_i, X_j)$$

其中共變異數（Covariance）定義為：

$$\operatorname{Cov}(X_i, X_j) = \mathbb{E}[X_i X_j] - \mathbb{E}[X_i]\mathbb{E}[X_j]$$

- **獨立或 Pairwise Independent**：若 $X_i$ 與 $X_j$ 獨立，則 $\operatorname{Cov}(X_i, X_j) = 0$，此時 $\operatorname{Var}(X) = \sum \operatorname{Var}(X_i)$。
- **負相關（Negative Covariance）**：若 $\operatorname{Cov}(X_i, X_j) \le 0$，則 $\operatorname{Var}(X) \le \sum \operatorname{Var}(X_i)$，這使得變異數甚至比完全獨立時還要小！

---

## 4. 實戰證明：Balls & Bins 空桶數量的強集中度

> **問題**：將 $n$ 個球隨機投進 $n$ 個桶子中，令 $X$ 為空桶總數。試證明空桶數量集中在期望值附近。

### 證明步驟

1. 令 $X_i$ 為第 $i$ 個桶子是否為空的指示變數。記 $p = \left(1 - \frac{1}{n}\right)^n$。
2. **單一變數方差**：

$$\operatorname{Var}(X_i) = \mathbb{E}[X_i^2] - (\mathbb{E}[X_i])^2 = p - p^2 = p(1 - p)$$

3. **計算 Covariance**：對於 $i \neq j$，同時空桶的機率為兩顆球皆沒進 $i, j$：

$$\operatorname{Pr}[X_i = 1 \land X_j = 1] = \left(1 - \frac{2}{n}\right)^n$$

因此：

$$\operatorname{Cov}(X_i, X_j) = \left(1 - \frac{2}{n}\right)^n - p^2 = \left(1 - \frac{2}{n}\right)^n - \left(1 - \frac{1}{n}\right)^{2n}$$

經代數展開可證得 $\left(1 - \frac{2}{n}\right)^n < \left(1 - \frac{1}{n}\right)^{2n}$，故 **$\operatorname{Cov}(X_i, X_j) < 0$**（即負共變異數，直觀上：一個桶子為空會增加其他桶子不為空的機率）。

4. **總變異數放界**：

$$\operatorname{Var}(X) = \sum_{i=1}^n \operatorname{Var}(X_i) + \sum_{i \neq j} \operatorname{Cov}(X_i, X_j) \le n p(1 - p) \le n \left(\frac{1}{e} - \frac{1}{e^2}\right)$$

5. **套用 Chebyshev 不等式**：求偏差超過 $\varepsilon n$ 的機率：

$$\operatorname{Pr}[|X - \mathbb{E}[X]| \ge \varepsilon n] \le \frac{\operatorname{Var}(X)}{\varepsilon^2 n^2} \le \frac{n(1/e - 1/e^2)}{\varepsilon^2 n^2} = \mathcal{O}\left(\frac{1}{\varepsilon^2 n}\right)$$

當 $n \to \infty$ 時，該機率趨近於 0，證明了空桶數量極度集中在期望值 $\frac{n}{e}$ 附近！

<reviewkit>
  <qprompt>
    在計算隨機變數和的方差時，為什麼 Pairwise Independence（成對獨立）就足以讓 Covariance 項歸零？這與 Fully Independent（全獨立）在要求上有何本質區別？
  </qprompt>
  <takeaways>
    - Chebyshev 不等式將偏差機率界限提升至二次方反比衰減 $\mathcal{O}(1/k^2)$。
    - 證明的核心是將 $(X - \mu)^2$ 視為非負隨機變數並套用 Markov 不等式。
    - 在 Balls & Bins 模型中，桶子間的 Negative Covariance（負共變異數）使得總方差小於獨立和，從而順利給出緊緻的 Tail Bound。
  </takeaways>
</reviewkit>

## 參考資料（References）

1. NUS CS5234: Algorithms at Scale
