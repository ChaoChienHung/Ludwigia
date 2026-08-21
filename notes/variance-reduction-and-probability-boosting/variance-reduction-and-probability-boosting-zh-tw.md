<meta>
Title: 估計器增強技巧：Mean Trick 方差降低與 Median Trick 成功率放大
Summary: 詳解二大通用估計器增強技巧：Mean Trick 透過重複取樣降低方差，與 Median Trick 透過中位數以僅對數級開銷 O(log(1/δ)) 將成功率提升至任意高的 1-δ。
Slug: variance-reduction-and-probability-boosting-zh-tw
Output: notes/variance-reduction-and-probability-boosting/variance-reduction-and-probability-boosting-zh-tw.html
CanonicalId: variance-reduction-and-probability-boosting
Style: default
Lang: zh-tw
Tags: algorithm, randomized algorithm, variance reduction, median trick, mean trick, probability boosting, chernoff bound
Status: drafting
Published: 2026-08-20
LastModified: 2026-08-20
</meta>

<draft>
- 基礎估計器的限制與 Boosting 需求
- Mean Trick：透過平均降低方差到 M/k
- Median Trick：透過中位數以 O(log(1/δ)) 放大成功率至 1-δ
- 兩大技巧比較與實戰組合
</draft>

# 估計器增強技巧：Mean Trick 方差降低與 Median Trick 成功率放大

<callout type="info">
TL;DR: 在設計隨機演算法時，我們常先設計一個「僅有常數成功率（如 66%）」或「高方差」的基礎估計器。透過 **Mean Trick（平均值招式）** 可線性壓低方差；再透過 **Median Trick（中位數招式）**，只需付出 $\mathcal{O}(\log(1/\delta))$ 的重複代價，就能將成功率放大至任意高的 $1 - \delta$。
</callout>

## 1. 估計器面臨的挑戰

在許多隨機演算法中，直接設計一個「高精度、高成功率」的演算法非常困難。通常我們的設計策略是：

1. **第一步**：設計一個極其簡單、單次運行極快，但成功率僅高於 $1/2$（例如 $2/3$）的基礎估計器。
2. **第二步**：套用通用增強框架（Boosting Framework），將其提升為高精度的工業級演算法。

本篇介紹的 **Mean Trick** 與 **Median Trick** 正是這套框架的核心。

---

## 2. Mean Trick：透過平均降低方差 (Variance Reduction)

### 2.1 數學機制

假設我們有一個無偏估計器 $X$，滿足：

$$\mathbb{E}[X] = A, \quad \operatorname{Var}(X) = M$$

**Mean Trick 演算法**：
1. 獨立運行該演算法 $k$ 次，獲得 $k$ 個獨立估計值 $X_1, X_2, \dots, X_k$。
2. 計算並輸出**樣本平均值**：

$$\bar{X} = \frac{1}{k} \sum_{i=1}^k X_i$$

### 2.2 性質分析

- **期望值不變**：

$$\mathbb{E}[\bar{X}] = \mathbb{E}\left[\frac{1}{k} \sum_{i=1}^k X_i\right] = \frac{1}{k} \sum_{i=1}^k \mathbb{E}[X_i] = A$$

- **方差縮減 $k$ 倍**（因 $X_i$ 互相獨立）：

$$\operatorname{Var}(\bar{X}) = \operatorname{Var}\left(\frac{1}{k} \sum_{i=1}^k X_i\right) = \frac{1}{k^2} \sum_{i=1}^k \operatorname{Var}(X_i) = \frac{1}{k^2} \cdot k M = \frac{M}{k}$$

> **核心結論**：平均 $k$ 次獨立無偏估計，能將方差精確壓低至原先的 $\frac{1}{k}$。

---

## 3. Median Trick：透過中位數放大成功率 (Probability Boosting)

Mean Trick 雖然能降低方差，但若原估計器存在極端的 Outliers（離群值），平均值容易被拉偏。**Median Trick** 則是處理失敗率的最強通用工具。

### 3.1 數學機制

假設我們有一個基礎演算法，其輸出 $X$ 偏離真實值 $A$ 超過 $\varepsilon$ 的失敗機率小於 $1/3$：

$$\operatorname{Pr}[|X - A| > \varepsilon] < \frac{1}{3}$$

**Median Trick 演算法**：
1. 獨立運行該演算法 $k$ 次，獲得 $k$ 個估計值 $X_1, X_2, \dots, X_k$。
2. 輸出這 $k$ 個估計值的**中位數（Median）** $\tilde{X} = \operatorname{median}(X_1, \dots, X_k)$。

### 3.2 為什麼取中位數能放大成功率？

只有當 **至少一半（$\ge k/2$）的估計值都出錯** 時，中位數 $\tilde{X}$ 才可能偏離真實值超過 $\varepsilon$。

```
              Error Zone (< A - ε)     Correct Zone (A ± ε)     Error Zone (> A + ε)
              ◄─────────────────────► ◄─────────────────────► ◄─────────────────────►
                                          [  True A  ]
Estimates:         X_2                      X_1, X_4, X_5              X_3

Median is X_1 (in Correct Zone) as long as < k/2 estimates land in any Error Zone!
```

### 3.3 嚴謹證明 (Chernoff + Union Bound)

中位數偏離超過 $\varepsilon$ 等價於以下二壞事件之一發生：
- 壞事件 $E_1$：有超過 $k/2$ 個估計值 $> A + \varepsilon$。
- 壞事件 $E_2$：有超過 $k/2$ 個估計值 $< A - \varepsilon$。

對於 $E_1$，定義指示變數 $Y_i = 1$ 表示 $X_i > A + \varepsilon$。
已知 $\operatorname{Pr}[Y_i = 1] < 1/3$，故期望值 $\mathbb{E}\left[\sum Y_i\right] < k/3$。
要讓超過 $k/2$ 個估計值出錯，屬於顯著高於期望值的 Tail Event。套用 Chernoff Bound：

$$\operatorname{Pr}\left[\sum_{i=1}^k Y_i \ge \frac{k}{2}\right] < e^{-\frac{k}{100}}$$

同理對 $E_2$，$\operatorname{Pr}[E_2] < e^{-k/100}$。
結合 Union Bound，中位數失敗的總機率：

$$\operatorname{Pr}[|\tilde{X} - A| > \varepsilon] \le \operatorname{Pr}[E_1] + \operatorname{Pr}[E_2] < 2 e^{-\frac{k}{100}}$$

### 3.4 代價分析：只需對數級開銷 $\mathcal{O}(\log(1/\delta))$

若我們希望將整體失敗率控制在目標 $\delta$ 以內（例如 $\delta = 10^{-6}$）：

$$2 e^{-\frac{k}{100}} = \delta \implies k = \Theta\left(\log \frac{1}{\delta}\right)$$

> **核心結論**：要將演算法成功率從 $66\%$ 提升至 $99.9999\%$，重複次數 $k$ 僅隨 $\log(1/\delta)$ 對數級成長！

---

## 4. 兩大技巧比較與組合實用

| 技巧名稱 | 核心操作 | 主要效益 | 重複開銷代價 | 適用場景 |
| :--- | :--- | :--- | :--- | :--- |
| **Mean Trick** | 取 $k$ 次運行的平均值 | 將方差降至 $M/k$ | 線性代價 $\mathcal{O}(k)$ | 無偏估計器，需精確降低方差 |
| **Median Trick** | 取 $k$ 次運行的中位數 | 將失敗率降至 $2e^{-ck}$ | 對數代價 $\mathcal{O}(\log(1/\delta))$ | 基礎成功率 $> 1/2$，需極高成功率保證 |

在許多高級演算法中，我們常**組合使用**：先用 Mean Trick 降低方差獲得一個成功率稍微大於 $1/2$ 的估計器，再外包一層 Median Trick 將成功率推至 $1 - \delta$！

<reviewkit>
<qprompt/>
  <takeaways>
    - Mean Trick 透過求平均將無偏估計器的方差按比例 $k$ 線性壓低。
    - Median Trick 利用中位數抵抗偏離，只需 $\mathcal{O}(\log(1/\delta))$ 次重複即可將成功率拉高至 $1 - \delta$。
    - 兩者是亞線性與隨機化演算法中不可或缺的通用增強 (Boosting) 武器。
  </takeaways>
</reviewkit>

## 參考資料（References）

1. NUS CS5234: Algorithms at Scale
