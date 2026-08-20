<meta>
Title: Markov 不等式：基於期望值的非負隨機變數機率上限
Summary: 詳細介紹 Markov 不等式的數學定義、非負前提條件、幾何證明直覺，以及在隨機演算法執行時間上限與一階矩 Tail Bound 中的基礎應用。
Slug: markovs-inequality-zh-tw
Output: notes/markovs-inequality/markovs-inequality-zh-tw.html
CanonicalId: markovs-inequality
Style: default
Lang: zh-tw
Tags: algorithm, probability, concentration inequalities, markov inequality, tail bound
Status: drafting
Published: 2026-08-20
LastModified: 2026-08-20
</meta>

<draft>
- Markov 不等式定義與參數化形式
- 離散與連續隨機變數推導
- 演算法執行時間的最壞 Tail Bound 應用
</draft>

# Markov 不等式：基於期望值的非負隨機變數機率上限

<callout type="info">
TL;DR: Markov 不等式（Markov's Inequality）是集中現象中最基礎的定量工具。它只需要知道隨機變數的**一階矩（期望值）**，且前提為變數必須為**非負（Non-negative）**，就能給出尾端機率的上界。
</callout>

## 1. 數學定理與形式

> **Markov 不等式定理**：
> 設 $X$ 為一個非負隨機變數（即 $\operatorname{Pr}[X \ge 0] = 1$），則對任意實數 $a > 0$，恆有：
> 
> $$\operatorname{Pr}[X \ge a] \le \frac{\mathbb{E}[X]}{a}$$

### 倍數參數化形式 (Parameterized Form)

若將門檻 $a$ 表示為期望值的 $\alpha$ 倍（即 $a = \alpha \cdot \mathbb{E}[X]$，其中 $\alpha > 1$），可寫成非常直觀的形式：

$$\operatorname{Pr}[X \ge \alpha \mathbb{E}[X]] \le \frac{1}{\alpha}$$

例如：一個非負隨機變數超過其平均值 10 倍的機率，絕對不可能超過 $\frac{1}{10} = 10\%$。

---

## 2. 數學證明與幾何直覺

Markov 不等式的證明非常簡潔，可以直接從離散/連續隨機變數期望值的定義出發。

### 離散隨機變數證明

$$\begin{aligned}
\mathbb{E}[X] &= \sum_{x} x \cdot \operatorname{Pr}[X = x] \\
&= \sum_{x < a} x \cdot \operatorname{Pr}[X = x] + \sum_{x \ge a} x \cdot \operatorname{Pr}[X = x]
\end{aligned}$$

由於 $X$ 為非負隨機變數 ($x \ge 0$)，第一項 $\sum_{x < a} x \cdot \operatorname{Pr}[X = x] \ge 0$。因此：

$$\mathbb{E}[X] \ge \sum_{x \ge a} x \cdot \operatorname{Pr}[X = x]$$

在第二項中，由於每個項目的 $x \ge a$，我們可以將 $x$ 替換為下限 $a$：

$$\mathbb{E}[X] \ge \sum_{x \ge a} a \cdot \operatorname{Pr}[X = x] = a \sum_{x \ge a} \operatorname{Pr}[X = x] = a \cdot \operatorname{Pr}[X \ge a]$$

兩邊同除以 $a$ ($a > 0$)，即得證：

$$\operatorname{Pr}[X \ge a] \le \frac{\mathbb{E}[X]}{a}$$

---

## 3. 演算法分析中的應用實例

### 演算法執行時間的 Tail Bound 保障

在隨機化演算法分析中，假設我們設計了一個 Las Vegas 演算法，經分析得知其**期望運行時間（Expected Running Time）**為 $T$ 秒。由於運行時間必定非負 ($T \ge 0$)，我們可以直接應用 Markov 不等式：

$$\operatorname{Pr}[\text{運行時間} \ge 10T] \le \frac{T}{10T} = \frac{1}{10} = 0.1$$

這意味著：

$$\operatorname{Pr}[\text{運行時間} < 10T] \ge 1 - 0.1 = 0.9$$

即便我們完全不知道運行時間的具體機率分佈，也能 $100\%$ 保證**該演算法在 $10T$ 秒內結束運行的機率至少有 $90\%$**。

---

## 4. Markov 不等式的侷限性

雖然 Markov 不等式極為通用（只需要非負性與期望值），但它的界限通常**不夠緊緻（Loose Bound）**。

例如，若我們將隨機變數重複獨立運行 $n$ 次，經驗告訴我們偏差應該會以指數級衰減；但 Markov 不等式只給出了多項式級 $\mathcal{O}(1/a)$ 的衰減速度。這是因為它完全沒有利用到方差（Variance）或高階矩（Higher Moments）的資訊。

<reviewkit>
  <qprompt>
    為什麼 Markov 不等式必須嚴格要求隨機變數為「非負（$X \ge 0$）」？如果隨機變數可能取負值，該不等式會在哪一個證明步驟失效？
  </qprompt>
  <takeaways>
    - Markov 不等式只需要非負前提與一階矩 $\mathbb{E}[X]$。
    - 形式 $\operatorname{Pr}[X \ge \alpha \mathbb{E}[X]] \le 1/\alpha$ 是評估隨機演算法 Worst-case 時間上限的保底工具。
    - 衰減速率僅為 $\mathcal{O}(1/a)$，若需要更緊緻的 Tail Bounds，需進一步引入方差或 MGF。
  </takeaways>
</reviewkit>

## 參考資料（References）

1. NUS CS5234: Algorithms at Scale
