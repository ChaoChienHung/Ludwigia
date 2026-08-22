<meta>
Title: 馬爾科夫不等式：基於期望值的非負隨機變數機率上限
Summary: 詳細介紹馬爾科夫不等式的數學定義、非負前提條件、幾何證明直覺，以及在隨機演算法執行時間上限與一階矩 Tail Bound 中的基礎應用。
Slug: markovs-inequality-zh-tw
Output: notes/markovs-inequality/markovs-inequality-zh-tw.html
CanonicalId: markovs-inequality
Style: default
Lang: zh-tw
Tags: algorithm, probability, concentration inequalities, markov inequality
Status: drafting
Published: 2026-08-20
LastModified: 2026-08-22
</meta>

<draft>
- 破題與動機：承接集中不等式概論，引入最基礎的放縮工具
- Markov 不等式數學定理與參數化形式（包含「幾乎必然非負」之嚴謹定義）
- 直觀生活範例：國民平均所得的分佈極限
- 數學證明與幾何直覺：離散隨機變數推導
- 演算法分析實例：Las Vegas 演算法的最壞 Tail Bound 保障
- 進階應用與侷限性（通往 Chebyshev 不等式的橋樑）
</draft>

# 馬爾科夫不等式：基於期望值的非負隨機變數機率上限

在上一篇<content-link canonical="introduction-to-concentration-inequalities">集中不等式：從極限定理到集中不等式工具箱</content-link>的導論中，我們提到在分析隨機演算法的效度時，我們時常需要評估**「演算法在最壞情況下，執行時間或資源消耗超出容忍上限的機率」**。為了繞過複雜的機率密度函數積分，我們引入了「代數放縮」的概念。

而在這龐大的集中不等式工具箱中，最基礎、前置條件最簡約的開路先鋒，就是 **馬爾科夫不等式（Markov's Inequality）**。

馬爾科夫不等式是量化<information concept="concept.concentration_of_measure">集中現象</information>最基礎的機率不等式。它只需要知道隨機變數的**一階動差（即<information concept="concept.expectation">期望值</information>）**，且前提為變數必須為**非負（Non-negative）**，就能為我們給出一個安全且保守的<information concept="concept.tail_bound">尾端機率上界</information>。

## 數學定理與形式

**Markov 不等式定理**：
設 $X$ 為一個定義在樣本空間上的可積隨機變數，且 $X$ 為**幾乎必然非負**（即 $X < 0$ 的機率為 0，$\operatorname{Pr}[X \ge 0] = 1$）。則對任意嚴格大於零的實數常數 $a > 0$，恆滿足以下不等式：

$$\operatorname{Pr}[X \ge a] \le \frac{\mathbb{E}[X]}{a}$$

### 倍數參數化形式 (Parameterized Form)

如果我們將門檻 $a$ 表示為期望值的 $\alpha$ 倍（即令 $a = \alpha \cdot \mathbb{E}[X]$，其中 $\alpha > 1$），這個不等式可以改寫成一個在工程上極為直觀的「倍數形式」：

$$\operatorname{Pr}[X \ge \alpha \mathbb{E}[X]] \le \frac{1}{\alpha}$$

這段數學式的白話文非常震撼：**一個非負隨機變數的數值，超過其平均值 $\alpha$ 倍的機率，絕對不可能大於 $1/\alpha$。** 例如，數值超過平均值 10 倍的機率，絕對不可能超過 $\frac{1}{10} = 10\%$。

<callout variant="info">
**直觀生活範例：國民平均所得**

這個不等式背後的直覺是什麼？想像一下，假設我們從某個國家中隨機抽取一名國民，已知該國的**平均年所得為 4 萬美元**。

請問：這名被抽中者的年所得「**大於 20 萬美元**」的機率有多高？

在完全不知道該國貧富差距或所得分佈曲線（PDF）的情況下，我們能回答這個問題嗎？可以的。因為所得必定是「非負」的（不會有負收入），我們直接套用 Markov 不等式：
*   期望值 $\mathbb{E}[X] = 40,000$
*   門檻 $a = 200,000$

$$\operatorname{Pr}[X \ge 200,000] \le \frac{40,000}{200,000} = \frac{1}{5} = 20\%$$

因此，在缺乏更多分佈資訊的情況下，我們能得出一個強而有力的數學保證：該國年收入超過 20 萬美元的極端高薪人口，**最多不會超過總人口的 20%**。因為如果超過 20%，那這些人的收入總和就會把整體的平均值拉抬到超過 4 萬美元，與已知前提矛盾。
</callout>

## 數學證明與幾何直覺

強烈建議理解 Markov 不等式的證明，因為這是機率論中「期望值基本性質」最優雅的應用之一。我們以離散隨機變數為例來推導。

根據期望值的定義，我們將總和拆分為「小於門檻 $a$」與「大於等於門檻 $a$」兩個部分：

$$\begin{aligned}
\mathbb{E}[X] &= \sum_{x} x \cdot \operatorname{Pr}[X = x] \\
&= \underbrace{\sum_{x < a} x \cdot \operatorname{Pr}[X = x]}_{\text{第一項}} + \underbrace{\sum_{x \ge a} x \cdot \operatorname{Pr}[X = x]}_{\text{第二項}}
\end{aligned}$$

這裡來到證明的關鍵：因為 $X$ 是**非負隨機變數**（$x \ge 0$），所以第一項必定大於等於零（$\sum_{x < a} x \cdot \operatorname{Pr}[X = x] \ge 0$）。如果我們直接把第一項丟掉，整個等式就會變成「大於等於」的不等式：

$$\mathbb{E}[X] \ge \sum_{x \ge a} x \cdot \operatorname{Pr}[X = x]$$

接著觀察保留下來的第二項。在這個加總範圍內，每一個 $x$ 都保證大於等於 $a$（因為 $x \ge a$）。如果我們把所有的 $x$ 都無情地縮小並替換成底限 $a$，這個數值會進一步變小（放縮法）：

$$\mathbb{E}[X] \ge \sum_{x \ge a} a \cdot \operatorname{Pr}[X = x] = a \sum_{x \ge a} \operatorname{Pr}[X = x]$$

而後面這個加總 $\sum_{x \ge a} \operatorname{Pr}[X = x]$，剛好就是機率 $\operatorname{Pr}[X \ge a]$ 的定義！因此：

$$\mathbb{E}[X] \ge a \cdot \operatorname{Pr}[X \ge a]$$

最後，兩邊同除以常數 $a$ ($a > 0$)，即得證：

$$\operatorname{Pr}[X \ge a] \le \frac{\mathbb{E}[X]}{a}$$

## 演算法分析中的應用實例

在隨機演算法分析中，Markov 不等式是為執行時間建立保底界限的利器。

假設我們設計了一個 <information context="Las Vegas 演算法是一種隨機演算法，其特點是『只要給出答案就保證絕對正確』，但其『執行時間是隨機的』。與之相對的是 Monte Carlo 演算法。">Las Vegas 演算法</information>，經過初步的理論分析，我們得知其**期望運行時間（Expected Running Time）**為 $T$ 秒。

由於時間必定是非負的實數 ($T \ge 0$)，我們可以直接應用 Markov 不等式的倍數形式。如果我們將系統容忍的超時上限設定為平均時間的 10 倍：

$$\operatorname{Pr}[\text{運行時間} \ge 10T] \le \frac{1}{10} = 10\%$$

透過互補事件，這也意味著：

$$\operatorname{Pr}[\text{運行時間} < 10T] \ge 1 - 0.1 = 90\%$$

**工程意義**：即便我們完全不知道該演算法在面對極端測資時，其運行時間的具體機率分佈究竟長什麼樣子，我們也能 $100\%$ 在數學上保證——**該演算法在 $10T$ 秒內順利結束運行的機率，至少高達 $90\%$**。

## 進階應用與侷限性

Markov 不等式在機率與統計學中有著舉足輕重的地位，它不僅能直接用來推導尾端機率上界，更是諸多進階定理的核心基石：
1. **推導 Chebyshev 不等式**：將隨機變數 $X$ 替換為 $(X - \mu)^2$，即可推導出大名鼎鼎的 Chebyshev 不等式。
2. **推導 Chernoff Bound**：將隨機變數替換為指數形式 $e^{tX}$，即可利用動差生成函數（MGF）推導出具備指數級衰減的 Chernoff Bound。
3. **收斂性證明**：在高等機率論中，它常被用來證明「均方收斂（Mean Square Convergence）」必然推導出「依機率收斂（Convergence in Probability）」。

**侷限性：**
雖然 Markov 不等式極為通用，但它給出的界限通常**不夠緊緻（Loose Bound）**。其衰減速率僅為多項式級別的 $\mathcal{O}(1/a)$。如果我們知道該隨機變數是由多個獨立事件重複組合而成，經驗告訴我們極端值出現的機率應該呈「指數級」衰減。Markov 不等式之所以無法給出這麼好的界限，是因為它**完全沒有利用到變異數（Variance）或更高階動差（Higher Moments）的資訊**。這也正是我們在下一篇文章中，需要進一步探討 Chebyshev 不等式的原因。

<reviewkit>
  <takeaways>
    - **核心前提**：Markov 不等式是要求最低的集中不等式，只需要「非負變數」與「一階動差（期望值）」。
    - **直觀倍數形式**：$\operatorname{Pr}[X \ge \alpha \mathbb{E}[X]] \le 1/\alpha$。數值超過平均值 $\alpha$ 倍的機率，必不大於 $1/\alpha$。
    - **演算法應用**：在未知具體分佈的情況下，它是評估隨機演算法「最壞時間上限（Worst-case Tail Bound）」的終極保底工具。
    - **承先啟後**：由於其衰減速率僅為 $\mathcal{O}(1/a)$，當我們需要更緊緻的界限時，必須將其結合函數變換（如平方、指數）來引入更高階的動差資訊，這也是後續 Chebyshev 與 Chernoff 不等式的發展脈絡。
  </takeaways>
  <qprompt/>
</reviewkit>

## 參考資料（References）

1. NUS CS5234 Algorithms at Scale Course Materials
2. Taboga, Marco (2021). "Markov's inequality", *Lectures on probability theory and mathematical statistics*. Kindle Direct Publishing. Online appendix. https://www.statlect.com/fundamentals-of-probability/Markov-inequality