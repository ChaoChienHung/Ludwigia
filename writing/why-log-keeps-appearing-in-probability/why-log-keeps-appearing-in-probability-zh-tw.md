<meta>
Title: 為什麼機率世界到處都是 log？從資訊量到策略梯度的共同結構
Tags: probability, information theory, machine learning, cross entropy, reinforcement learning
Summary: 從獨立事件的機率相乘出發，理解對數如何連起資訊量、熵、最大概似、交叉熵、sigmoid 梯度與 Log Derivative Trick，以及這些應用各自不同的目的。
Slug: why-log-keeps-appearing-in-probability-zh-tw
Output: writing/why-log-keeps-appearing-in-probability/why-log-keeps-appearing-in-probability-zh-tw.html
Style: default
EstimatedReadingTime: true
Lang: zh-Hant
CanonicalId: why-log-keeps-appearing-in-probability
TitleSuffix: false
Status: drafting
LastModified: 2026-10-10
</meta>

<draft>
TLDR: log 反覆出現，源自機率連乘與我們希望證據、資訊量和資料損失可以相加的需求；但各公式用 log 的目的不同，不能把 cross entropy、KL 和 score-function estimator 混為一談。
MainFlow: 獨立事件機率相乘 → log 把乘法轉加法 → 稀有事件資訊量與熵 → 最大概似與交叉熵 → KL 的等價視角 → sigmoid 梯度 → log derivative 的抽樣估計 → 邊界與總結。
Scope: 有限離散例子、基本推導、機率模型可微時的梯度直覺。
OutOfScope: 熵的公理化唯一性證明、測度論細節、REINFORCE 的完整方差縮減與實作。
</draft>

# 為什麼機率世界到處都是 log？從資訊量到策略梯度的共同結構

學交叉熵時會看到 $\log p$，學資訊理論時會看到 $-\log p$，到了策略梯度又遇上 $\nabla\log p$。這很容易讓人產生一個直覺：當初把 log 放進機率公式的人，似乎一口氣替後面所有問題找到了捷徑。

這個直覺抓到了重要的共通點，但還可以再往下一層看：**機率經常透過乘法組合，而我們經常需要一個能逐項累加的量。** 對數剛好把這兩種結構接起來。接下來幾個應用會沿著這個地基長出來；它們共享同一個工具，卻各自回答不同問題。

## 第一層：事件一起發生時，機率如何組合？

先想像連續擲兩次公平硬幣。兩次都出現正面的機率是 $\frac12\times\frac12=\frac14$。如果連擲十次、每次都記錄結果，某一條指定序列的機率就要把十個條件機率乘起來。更一般地，序列的聯合機率可由鏈式法則寫成：

$$p(x_1,\ldots,x_T)=\prod_{t=1}^{T}p(x_t\mid x_1,\ldots,x_{t-1}).$$

這裡不需要假設每一步獨立；只有在獨立時，條件機率才進一步簡化為各自的 $p(x_t)$。但無論如何，**整體機率是逐步相乘**。當序列很長，乘積不利於閱讀、比較與求導。我們想把每一步的貢獻攤開來看，而不是始終抱著一個連乘式。

對數提供了精確的轉換：

$$\log(ab)=\log a+\log b,\qquad
\log p(x_1,\ldots,x_T)=\sum_{t=1}^{T}\log p(x_t\mid x_{<t}).$$

這是後面整篇文章的地基：**機率可以乘起來，對數機率可以加起來。**

## 第二層：從可相加的「意外程度」到熵

如果一件事的機率越低，我們越覺得意外，那麼它的資訊量應該越高。若兩件獨立事件一起發生，我們也希望總資訊量是兩件事資訊量的和。用 $I(x)=-\log p(x)$ 表示，就同時滿足這兩個方向：

$$I(x,y)=-\log[p(x)p(y)]=I(x)+I(y)\quad\text{（$x,y$ 獨立時）}.$$

負號讓小於或等於 $1$ 的機率對應非負資訊量。機率 $1$ 的必然事件給出 $0$；機率越接近 $0$，資訊量越大。對數底數決定單位：底數 $2$ 對應 bit，自然對數則常用於微積分與機器學習。

但資訊量描述的是**一次具體結果**。如果想知道整個分佈平均會帶來多少資訊，就依各結果的發生機率取平均：

$$H(p)=\mathbb E_{x\sim p}[-\log p(x)]
=-\sum_x p(x)\log p(x).$$

這就是熵。先有「事件機率相乘、資訊量相加」這個底層需求，才自然走到單次結果的 $-\log p$，再上升到整個分佈的平均資訊量。

## 第三層：從資料機率到交叉熵

換一個問題：手上已經有輸入與標籤 $(x_i,y_i)$，我們希望模型 $p_\theta$ 對各筆輸入的正確答案給較高機率。最大概似估計要最大化這些觀察的聯合機率。在給定模型下，若各筆標籤在其輸入條件下相互獨立，就有：

$$\max_\theta\prod_{i=1}^{N}p_\theta(y_i\mid x_i)
\quad\Longleftrightarrow\quad
\min_\theta-\sum_{i=1}^{N}\log p_\theta(y_i\mid x_i).$$

log 是嚴格遞增的，所以取 log 不會改變最大值的位置；加上負號後，最大化變成最小化。原本的連乘也變成了逐筆可加的損失。在分類任務中，若標籤是 one-hot，單筆負對數概似 $-\log p_\theta(y\mid x)$ 正好是該筆的交叉熵。

如果把真實標籤分佈記為 $q$、模型預測記為 $p_\theta$，平均交叉熵寫成：

$$H(q,p_\theta)=-\sum_y q(y)\log p_\theta(y).$$

這也解釋了它和 KL 散度的關係：

$$D_{\mathrm{KL}}(q\|p_\theta)=H(q,p_\theta)-H(q).$$

當 $q$ 固定時，$H(q)$ 不隨 $\theta$ 改變。因此，**最小化交叉熵和最小化 $D_{\mathrm{KL}}(q\|p_\theta)$ 有相同的最優解**。從資料訓練的路徑看，負對數概似是直接入口；從分佈比較的路徑看，同一個目標又能讀成「讓模型靠近 $q$」。這兩種說法相容，但 KL 並非每次寫下 log 損失的唯一動機。

## 第四層：sigmoid 與交叉熵為什麼算起來特別整齊？

二元分類時，讓模型先輸出 logit $z$，再用 $p=\sigma(z)=1/(1+e^{-z})$ 轉成正類機率。標籤 $y\in\{0,1\}$ 的損失為：

$$L=-y\log p-(1-y)\log(1-p).$$

此時 $\frac{dp}{dz}=p(1-p)$。依連鎖律：

$$\frac{dL}{dz}
=\left(-\frac{y}{p}+\frac{1-y}{1-p}\right)p(1-p)
=p-y.$$

這個 $p-y$ 很有意思：預測機率和正確標籤的差，直接成為對 logit 的修正訊號。log 損失求導產生的分母，與 sigmoid 求導產生的因子在此抵消。

這份整齊不是「任意函數搭配 log 都會自動變簡單」；它來自 **Bernoulli 機率模型、sigmoid 參數化與負對數概似** 彼此相配。

## 第五層：Log Derivative Trick 回答的是另一個梯度問題

前面的交叉熵，是在固定資料上評估模型預測。現在換成另一種情況：資料本身要從隨參數 $\theta$ 改變的分佈 $p_\theta$ 抽出來，例如策略與環境互動產生的軌跡。我們要最大化：

$$J(\theta)=\mathbb E_{x\sim p_\theta}[f(x)].$$

若 $f$ 不直接依賴 $\theta$，而且可以把求導移入求和或積分，就能使用恆等式 $\nabla_\theta p_\theta(x)=p_\theta(x)\nabla_\theta\log p_\theta(x)$：

$$\nabla_\theta J
=\int f(x)\nabla_\theta p_\theta(x)\,dx
=\mathbb E_{x\sim p_\theta}
\left[f(x)\nabla_\theta\log p_\theta(x)\right].$$

關鍵不在於把原本的積分「算完」，而在於把梯度改寫成**可從 $p_\theta$ 抽樣、逐筆計算後再平均**的形式。對數機率的梯度在這裡常叫 score function。若 $f$ 本身也直接依賴 $\theta$，則還要加上 $\mathbb E_{p_\theta}[\nabla_\theta f_\theta(x)]$，不能只留下 score-function 那一項。

放進策略梯度時，$x$ 是一整條軌跡 $\tau$，$f(x)$ 是其回報 $R(\tau)$。軌跡機率由策略與環境轉移機率逐步相乘；若環境轉移及初始狀態分佈都不依賴 $\theta$，對數微分後便留下每一步策略的對數機率梯度之和。於是可以用抽到的軌跡與回報來估計策略梯度，而不必知道環境轉移機率的數值。

這裡的 log 和交叉熵裡的 log **不是在做同一件事**：交叉熵用它定義對預測的損失；Log Derivative Trick 用它改寫分佈的梯度。兩者之所以能相遇，是因為它們都在處理機率模型，並都從對數的代數與微分性質受益。

## 回頭看：log 的優雅有邊界

從事件機率的連乘出發，我們依序得到了可相加的資訊量、熵、逐筆可加的負對數概似、交叉熵，以及可供抽樣估計的 score function。它們不是「一個公式套遍所有地方」，而是同一種底層結構在不同問題上的延伸：**乘起來的機率，可以透過 log 拆成可理解、可累加、可微分的部分。**

同時，每一步都帶著自己的前提。$\log p$ 需要在所討論結果上有正機率；交叉熵與 KL 的等價說法要求目標分佈固定；Log Derivative Trick 的簡式要求 $f$ 不直接依賴參數，並能合法交換求導與期望。看清這些邊界後，log 的優雅才不會被誤讀成一把無條件通用的鑰匙。
