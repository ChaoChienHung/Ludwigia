<meta>
Title: 從決定性到機率性：隨機化演算法與分析的思維轉變
Summary: 探討隨機化演算法（Randomized Algorithms）的核心優勢、期望值與最壞情況的差異、期望值的線性（Linearity of Expectation），並說明為何在巨量資料分析中，我們需要從單純的期望值走向集中現象（Concentration of Measure）。
Slug: introduction-to-randomized-algorithms-and-probabilistic-analysis-zh-tw
Output: notes/introduction-to-randomized-algorithms-and-probabilistic-analysis/introduction-to-randomized-algorithms-and-probabilistic-analysis-zh-tw.html
CanonicalId: introduction-to-randomized-algorithms-and-probabilistic-analysis
Style: default
Lang: zh-tw
Tags: algorithm, randomized algorithm, probability, expectation, complexity theory
Status: drafting
Published: 2026-08-20
LastModified: 2026-08-20
</meta>

<draft>
- 核心摘要與問題意識：隨機化演算法相較於決定性演算法的優勢
- 隨機化演算法分類：Las Vegas vs Monte Carlo
- 機率分析基礎：期望值、指示變數與 Linearity of Expectation
- 從期望值走向 Concentration of Measure
</draft>

# 從決定性到機率性：隨機化演算法與分析的思維轉變

<callout>
variant: info
content:
TL;DR: 在傳統決定性演算法（Deterministic Algorithms）中，最壞情況複雜度（Worst-case complexity）往往受到極端輸入資料的限制。隨機化演算法透過在演算法執行過程中引入硬幣擲甩（Random Flips），能打破決定性結構的硬性限制，在期望時間或極高機率下獲得超越決定性演算法的極佳效能。
</callout>

## 1. 為什麼需要隨機化演算法？

在傳統計算複雜度理論中，我們習慣評估一個演算法在最壞情況下的時間與空間開銷。然而，面對海量資料或 NP-Hard 難題時，追求「100% 絕對正確且在最壞情況下依然最快」的決定性演算法往往帶來過高的開銷。

隨機化演算法的核心思想是：**將控制權交給隨機性（Random Choice）**。

- **打破對手的最壞情況配置**：決定性演算法的極端輸入往往可以被對手（Adversary）預先設計；但若演算法本身包含隨機選擇，對手便無法針對特定的確定行為構造最壞輸入。
- **簡化演算法結構**：許多複雜的決定性資料結構與演算法（如平衡樹、複雜圖切割），改用隨機化策略（如 QuickSort 的隨機選取 pivot、Treap、Randomized QuickSelect）後，程式碼結構變得極其簡潔且常數係數更小。
- **交易精準度換取極致效率**：在巨量資料（Big Data）或資料流（Data Streams）場景中，我們往往不需要 $100\%$ 的精確解答。透過放棄微小的精確度，能在時間或空間上獲得數量級的提升。

---

## 2. 隨機化演算法的二大類別

隨機化演算法通常分為兩大類：

```
                ┌───────────────────────────────┐
                │     Randomized Algorithms     │
                └───────────────┬───────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌───────────────┐                               ┌───────────────┐
│  Las Vegas    │                               │  Monte Carlo  │
└───────┬───────┘                               └───────┬───────┘
        │                                               │
        ├─ 答案永遠 100% 正確                              ├─ 執行時間固定或有明確 Upper Bound
        └─ 執行時間為隨機變數 (Expected Time)                └─ 答案有微小失敗機率 (Error Probability)
```

1. **Las Vegas 演算法**：
    - **正確性**：保證輸出答案永遠是 $100\%$ 正確的。
    - **執行時間**：執行時間是一個隨機變數，我們分析的是其「期望執行時間（Expected Running Time）」。
    - **經典範例**：Randomized QuickSort（隨機選取 Pivot 的快速排序）。

2. **Monte Carlo 演算法**：
    - **執行時間**：執行時間是確定性的（Deterministic bound），或保證在給定限制內結束。
    - **正確性**：輸出結果有一定機率出錯（失敗），但我們可以透過重複運行來將錯誤率壓低至任意小。
    - **經典範例**：Miller-Rabin 素數測試、Karger 隨機圖切割演算法、Sublinear Query Algorithms。

---

## 3. 機率分析的基石：期望值與期望值的線性

在分析隨機化演算法時，隨機變數（Random Variable）與期望值（Expectation）是最基礎的數學工具。

### 3.1 離散隨機變數與期望值

給定一個離散隨機變數 $X$，其期望值 $\mathbb{E}[X]$ 定義為：

$$\mathbb{E}[X] = \sum_{x} x \cdot \operatorname{Pr}[X = x]$$

### 3.2 期望值的線性（Linearity of Expectation）

**期望值的線性**是隨機化分析中最強大且最常用的工具之一：

> 對於任意兩個隨機變數 $X$ 與 $Y$（**無論它們是否獨立**），以下恆成立：
> 
> $$\mathbb{E}[X + Y] = \mathbb{E}[X] + \mathbb{E}[Y]$$

推廣至多個隨機變數：

$$\mathbb{E}\left[\sum_{i=1}^n X_i\right] = \sum_{i=1}^n \mathbb{E}[X_i]$$

#### 指示隨機變數 (Indicator Random Variables)

我們常結合「指示隨機變數」與期望值的線性來簡化複雜計數。設 $E_i$ 為某事件，定義指示變數：

$$X_i = \begin{cases} 1 & \text{若 } E_i \text{ 發生} \\ 0 & \text{若 } E_i \text{ 未發生} \end{cases}$$

則其期望值等於該事件發生的機率：

$$\mathbb{E}[X_i] = 1 \cdot \operatorname{Pr}[E_i] + 0 \cdot \operatorname{Pr}[\neg E_i] = \operatorname{Pr}[E_i]$$

---

## 4. 從「期望值」走向「集中現象 (Concentration of Measure)」

僅僅知道期望值 $\mathbb{E}[X]$ 通常是不夠的。

假設某個隨機化演算法的期望運行時間為 $\mathbb{E}[T] = 10 \text{ ms}$。這是否意味著我們能在 $100 \text{ ms}$ 內完成運行？
- 若 $T$ 的分佈高度集中在 $10 \text{ ms}$ 附近，答案是肯定且令人安心的。
- 若 $T$ 有 $1\%$ 的機率高達 $1000 \text{ ms}$，雖然平均值依然是 $10 \text{ ms}$，但在系統服務（SLA）中卻會造成不可接受的尾端遲延（Tail Latency）。

因此，我們必須回答核心問題：

> **隨機變數 $X$ 偏離其期望值 $\mathbb{E}[X]$ 的機率有多大？**

這正是**集中現象（Concentration of Measure）**與**集中不等式（Concentration Inequalities）**要解決的核心課題。

<reviewkit>
<qprompt/>
  <takeaways>
    - 隨機化演算法分為 Las Vegas（答案保證正確，時間為隨機變數）與 Monte Carlo（時間有界，結果存在小機率失敗）。
    - 期望值的線性（Linearity of Expectation）對任意隨機變數皆成立，**完全不需要獨立性條件**。
    - 單純了解期望值無法評估演算法的最壞尾端行為，必須透過 Concentration 分析評估偏離期望值的機率上限。
  </takeaways>
</reviewkit>

## 參考資料（References）

1. NUS CS5234: Algorithms at Scale
