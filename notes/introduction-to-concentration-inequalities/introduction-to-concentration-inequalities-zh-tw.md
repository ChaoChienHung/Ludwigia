<meta>
Title: Concentration Inequalities 導論：從極限定理到集中不等式工具箱
Summary: 綜覽集中現象（Concentration of Measure）的核心概念、階梯式集中不等式工具箱（Markov, Chebyshev, Chernoff）與 Union Bound，並以經典的 Balls & Bins 模型做為引導案例。
Slug: introduction-to-concentration-inequalities-zh-tw
Output: notes/introduction-to-concentration-inequalities/introduction-to-concentration-inequalities-zh-tw.html
CanonicalId: introduction-to-concentration-inequalities
Style: default
Lang: zh-tw
Tags: algorithm, probability, concentration inequalities, markov inequality, chebyshev inequality, chernoff bound, union bound
Status: drafting
Published: 2026-08-20
LastModified: 2026-08-20
</meta>

<draft>
- 集中現象 (Concentration of Measure) 概念介紹
- 集中不等式工具箱光譜對比（Markov, Chebyshev, Chernoff, Union Bound）
- 實例引導：Balls & Bins 期望值與 Union Bound
</draft>

# Concentration Inequalities 導論：從極限定理到集中不等式工具箱

<callout type="info">
TL;DR: Concentration Inequalities（集中不等式）是一套用來界定隨機變數 $X$ 偏離其期望值 $\mathbb{E}[X]$ 範圍上界（Tail Bounds）的數學工具。透過了解隨機變數的矩資訊（Moments），我們可以選擇合適的不等式獲得從粗粒度到指數級衰減的緊緻界限。
</callout>

## 1. 什麼是集中現象 (Concentration of Measure)？

在機率論與隨機演算法分析中，當一個隨機變數 $X$ 是由許多微小的獨立或弱相關隨機因子共同作用組合而成時，其總體行為會展現出極強的確定性——數值會以極高的機率「緊密集中」在期望值 $\mathbb{E}[X]$ 附近。這種現象稱為**集中現象（Concentration of Measure）**。

集中不等式的主力任務，就是給出以下尾端機率（Tail Probability）的上界估計：

$$\operatorname{Pr}[|X - \mathbb{E}[X]| \ge t] \le \delta$$

---

## 2. 集中不等式工具箱光譜

根據我們對隨機變數 $X$ 認識的深度（已知資訊多寡），我們有不同階梯的工具可以使用：

| 不等式名稱 | 必要前提條件 | 所需知識階層 (Moments) | 尾端衰減速率 (Tail Decay) | 適用場景 |
| :--- | :--- | :--- | :--- | :--- |
| **Markov's Inequality** | $X \ge 0$ (非負隨機變數) | 一階矩：期望值 $\mathbb{E}[X]$ | 多項式級衰減 $\mathcal{O}(1/t)$ | 最通用，資訊最少時的保底界限 |
| **Chebyshev's Inequality** | 有限方差 $\operatorname{Var}(X) < \infty$ | 二階矩：期望值與變異數 $\operatorname{Var}(X)$ | 多項式級衰減 $\mathcal{O}(1/t^2)$ | 存在成對獨立（Pairwise independence） |
| **Chernoff Bound** | $X = \sum X_i$ 且 $X_i$ 互相獨立有界 | 無限階矩：矩生成函數 (MGF) | 指數級衰減 $e^{-\Omega(t^2)}$ | 獨立試驗和，提供極強的機率保證 |
| **Union Bound** | 任意事件集合 (無條件) | 事件發生機率和 | 線性疊加 $\sum \operatorname{Pr}[A_i]$ | 結合多個壞事件（Bad events）算總失敗率 |

---

## 3. 貫穿範例：Balls & Bins（球與桶模型）

為了直觀理解這些工具，我們以演算法中最經典的 **Balls & Bins** 為例：

> **問題描述**：將 $m$ 個球隨機且獨立地投擲進 $n$ 個桶子中。

### 3.1 空桶數量的期望值

設 $X$ 為最終空桶的總數，定義指示變數 $X_i$ 表示第 $i$ 個桶子是否為空：

$$X_i = \begin{cases} 1 & \text{若桶 } i \text{ 為空} \\ 0 & \text{否則} \end{cases}$$

一顆球**沒有**落入第 $i$ 個桶子的機率為 $1 - \frac{1}{n}$。由於 $m$ 顆球獨立投擲，第 $i$ 個桶子為空的機率為：

$$\mathbb{E}[X_i] = \operatorname{Pr}[X_i = 1] = \left(1 - \frac{1}{n}\right)^m$$

利用期望值的線性（Linearity of Expectation），空桶總數的期望值為：

$$\mathbb{E}[X] = \mathbb{E}\left[\sum_{i=1}^n X_i\right] = \sum_{i=1}^n \mathbb{E}[X_i] = n \left(1 - \frac{1}{n}\right)^m$$

當 $m = n$ 且 $n$ 足夠大時，利用經典極限 $\left(1 - \frac{1}{n}\right)^n \approx e^{-1}$：

$$\mathbb{E}[X] \approx \frac{n}{e} \approx 0.368 n$$

### 3.2 壞事件結合：Union Bound（聯集界限）

在許多演算法分析中，我們希望確保「**沒有任何一個桶子發生壞狀況**」或「**所有系統元件皆正常運作**」。

**Union Bound（Boole's Inequality）** 指出：對任意事件 $A_1, A_2, \dots, A_n$（**完全不需要獨立性**），恆有：

$$\operatorname{Pr}\left[\bigcup_{i=1}^n A_i\right] \le \sum_{i=1}^n \operatorname{Pr}[A_i]$$

若我們將 $A_i$ 定義為「第 $i$ 個元件失敗」的壞事件，只要能證明 $\sum \operatorname{Pr}[A_i] \le \delta$，就能確保整體失敗率不超過 $\delta$（即整體成功率至少 $1 - \delta$）。

<reviewkit>
  <qprompt>
    在 Balls & Bins 模型中，當我們分析空桶數量時，為什麼 $X_i$ 與 $X_j$（第 $i$ 與第 $j$ 個桶子是否為空）不是互相獨立的？這對選擇集中不等式有何影響？
  </qprompt>
  <takeaways>
    - 集中不等式根據已知矩資訊（1st moment ➔ 2nd moment ➔ MGF）給出漸進緊緻的 Tail Bounds。
    - Union Bound 不需任何獨立性前提，是結合多個壞事件（Bad events）上界的最強實用工具。
    - 在 Balls & Bins 中，桶子之間存在弱負相關（Negative Correlation），使用 Chebyshev 或 Chernoff 時需特別注意獨立性條件與替代證明。
  </takeaways>
</reviewkit>

## 參考資料（References）

1. NUS CS5234: Algorithms at Scale
