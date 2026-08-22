<meta>
Title: 馬爾科夫不等式：基於期望值的非負隨機變數機率上限
Summary: 詳細介紹馬爾科夫不等式的數學定義、非負前提條件、幾何證明直覺，以及在隨機演算法執行時間上限與一階矩 Tail Bound 中的基礎應用。
Slug: markovs-inequality-probabilistic-bounds-for-non-negative-variables-zh-tw
Output: notes/markovs-inequality-probabilistic-bounds-for-non-negative-variables/markovs-inequality-probabilistic-bounds-for-non-negative-variables-zh-tw.html
CanonicalId: markovs-inequality-probabilistic-bounds-for-non-negative-variables
Style: default
Cover: ./markovs-inequality.png
Lang: zh-tw
Tags: algorithm, probability, concentration inequalities, markov inequality
Status: published
Published: 2026-08-20
LastModified: 2026-08-22
</meta>

<draft>
- 破題與動機：承接集中不等式概論，引入最基礎的放縮工具
- Markov 不等式數學定理與參數化形式（包含「幾乎必然非負」之嚴謹定義）
- 數學證明與幾何直覺：指示函數推導與期望值的反證直覺
- 倍數參數化形式與直觀生活範例（國民平均所得）
- 演算法分析實例：Las Vegas 演算法的最壞 Tail Bound 保障
- 進階應用與侷限性（通往 Chebyshev 不等式的橋樑）
</draft>

# 馬爾科夫不等式：基於期望值的非負隨機變數機率上限

<image>
src: ./markovs-inequality.png
alt: Markov's Inequality: Visualizing a Tail Probability Bound
caption: 馬爾科夫不等式（Markov's Inequality）視覺化全景圖：尾端機率上界與直覺範例
</image>

在上一篇<content-link canonical="concentration-inequalities-from-limit-theorems-to-toolbox">集中不等式：從極限定理到集中不等式工具箱</content-link>的導論中，我們提到在分析<information concept="concept.randomized_algorithms">隨機演算法</information>的效度時，我們時常需要評估**「演算法在最壞情況下，執行時間或資源消耗超出容忍上限的機率」**。為了繞過複雜的<information concept="concept.pdf">機率密度函數</information>積分，我們引入了「<information concept="concept.algebraic_bounding">代數放縮</information>」的概念。

而在這龐大的集中不等式工具箱中，最基礎、前置條件最簡約的開路先鋒，就是**馬爾科夫不等式（Markov's Inequality）**。

馬爾科夫不等式是量化<information concept="concept.concentration_of_measure">集中現象</information>最基礎的機率不等式。它只需要知道隨機變數的**<information concept="concept.moments">一階動差</information>（即<information concept="concept.expectation">期望值</information>）**，且前提為變數必須為**非負（Non-negative）**，就能為我們給出一個安全且保守的<information concept="concept.tail_bound">尾端機率上界</information>。這意味著我們甚至不需要知道隨機變數的真實機率分佈為何，這也是為什麼它是一項極為實用且廣泛普及的工具。

## 數學定理與形式

**馬爾科夫不等式定理**：
設 $X$ 為一個定義在樣本空間上的可積隨機變數，且 $X$ 為**非負隨機變數**（$X \ge 0$）。則對任意嚴格大於零的實數常數 $a > 0$，恆滿足以下不等式：

$$\operatorname{Pr}[X \ge a] \le \frac{\mathbb{E}[X]}{a}$$

這個不等式是一個非常優雅且直觀的結論，其**白話文**意即：一個非負隨機變數的值，超過任意正數 $a$ 的機率，永遠不可能大於「期望值除以 $a$」。

<block>
title: 邊界放寬：幾乎必然非負
content:
這個屬性在數學上可以進一步放寬到 $X$ 為**幾乎必然非負**（Almost surely positive）。換句話說，只要 $X < 0$ 是一個「零機率事件」（即 $\operatorname{Pr}[X < 0] = 0$），馬爾科夫不等式就依然完全成立。
</block>

### 數學證明：指示函數的巧妙應用

強烈建議親自閱讀並理解馬爾科夫不等式的證明，因為這是機率論中「<information concept="concept.expectation">期望值</information>基本性質」非常有趣且經典的應用。為了給出一個不論連續或離散皆適用的通用證明，我們引入**指示函數（Indicator Function）** $I$。

首先，隨機變數 $X$ 可以根據門檻 $a$ 被拆分為兩部分：
$$X = X \cdot I_{\{X < a\}} + X \cdot I_{\{X \ge a\}}$$

由於前提 $X$ 是一個非負隨機變數，且指示函數的結果非 0 即 1，因此第一項 $X \cdot I_{\{X < a\}}$ 必然大於等於零。如果我們直接將其捨棄，會得到一個必然成立的不等式：
$$X \ge X \cdot I_{\{X \ge a\}}$$

接著，觀察右邊的項 $X \cdot I_{\{X \ge a\}}$。當指示函數 $I_{\{X \ge a\}}$ 不為零（亦即等於 1）時，代表事件 $X \ge a$ 發生了。既然 $X \ge a$，我們可以將變數 $X$ 放縮為底限常數 $a$，這會讓數值進一步變小：
$$X \cdot I_{\{X \ge a\}} \ge a \cdot I_{\{X \ge a\}}$$

將上述兩個放縮步驟結合，我們得出：
$$X \ge a \cdot I_{\{X \ge a\}}$$

現在，我們對不等式兩邊同時取<information concept="concept.expectation">期望值</information>。根據期望值的單調性（Monotonicity）與線性性質（Linearity），我們得到：
$$\mathbb{E}[X] \ge \mathbb{E}[a \cdot I_{\{X \ge a\}}] = a \cdot \mathbb{E}[I_{\{X \ge a\}}]$$

在機率論中有一個極為基本且好用的性質：**一個事件指示函數的<information concept="concept.expectation">期望值</information>，就等於該事件發生的機率。** 因此 $\mathbb{E}[I_{\{X \ge a\}}] = \operatorname{Pr}[X \ge a]$。代入後得到：
$$\mathbb{E}[X] \ge a \cdot \operatorname{Pr}[X \ge a]$$

最後，由於 $a$ 是嚴格大於零的常數，我們將兩邊同除以 $a$，即得證馬爾科夫不等式：
$$\operatorname{Pr}[X \ge a] \le \frac{\mathbb{E}[X]}{a}$$

### 直觀理解：隱藏在期望值背後的引力

從本質上來看，這個結論非常符合我們的直覺。

一個分佈的「<information concept="concept.expectation">期望值</information>」，本就是由整個樣本空間的機率與其數值綜合推演而出的重心。因此，雖然我們不知道整體分佈的真實形貌，但可以肯定的是，絕大部分的數值都不可能無限制地偏離期望值太遠。

馬爾科夫不等式正是提供了這樣一個嚴格的推導，宣告極端大值出現的機率最多不會超過多少。道理很簡單：**如果那些極端數值出現的機率真的超過了這個界限，那麼這些極大值所貢獻的權重，打從一開始就會把期望值往上拉高，使得這組資料的期望值根本不可能是我們目前所看到的數字。**

### 倍數參數化形式 (Parameterized Form)

如果我們將門檻 $a$ 表示為<information concept="concept.expectation">期望值</information>的 $\alpha$ 倍（即令 $a = \alpha \cdot \mathbb{E}[X]$，其中 $\alpha > 1$），這個不等式可以改寫成一個在工程上極為直觀的「倍數形式」：

$$\operatorname{Pr}[X \ge \alpha \mathbb{E}[X]] \le \frac{1}{\alpha}$$

這段數學式的白話文強而有力：**一個非負隨機變數的數值，超過其平均值 $\alpha$ 倍的機率，絕對不可能大於 $1/\alpha$**。例如，數值超過平均值 10 倍的機率，絕對不可能超過 $\frac{1}{10} = 10\%$。

<callout>
title: 直觀生活範例：國民平均所得
variant: info
icon: lightbulb
content:
這個不等式背後的直覺是什麼？想像一下，假設我們從某個國家中隨機抽取一名國民，已知該國的**平均年所得為 4 萬美元**。請問：這名被抽中者的年所得「**大於 20 萬美元**」的機率有多高？

在完全不知道該國貧富差距或所得<information concept="concept.pdf">分佈曲線</information>的情況下，我們能回答這個問題嗎？可以的。因為所得必定是「非負」的，我們可以運用倍數形式——20 萬是平均 4 萬的 5 倍，因此直接套用馬爾科夫不等式：
*   <information concept="concept.expectation">期望值</information> $\mathbb{E}[X] = 40,000$
*   門檻 $a = 200,000$

$$\operatorname{Pr}[X \ge 200,000] \le \frac{40,000}{200,000} = \frac{1}{5} = 20\%$$

即使缺乏任何其他分佈資訊，我們依然能得出一個強而有力的數學保證：該國年收入超過 20 萬美元的極端高薪人口，**最多不會超過總人口的 20%**。這再次呼應了我們前面的直覺——如果超過 20%，這些人的收入總和就會把整體的平均值拉抬到超過 4 萬美元，與已知前提產生矛盾。
</callout>

<callout>
title: 演算法分析中的應用實例
variant: info
icon: code
content:
在<information concept="concept.randomized_algorithms">隨機演算法</information>分析中，馬爾科夫不等式是為執行時間建立保底界限的利器。

假設我們設計了一個 <information context="Las Vegas 演算法是一種隨機演算法，其特點是『只要給出答案就保證絕對正確』，但其『執行時間是隨機的』。與之相對的是 Monte Carlo 演算法。">Las Vegas 演算法</information>，經過初步的理論分析，我們得知其**期望運行時間（Expected Running Time）**為 $T$ 秒。

由於時間必定是非負的實數 ($T \ge 0$)，我們可以直接應用馬爾科夫不等式的倍數形式。如果我們將系統容忍的超時上限設定為平均時間的 10 倍：

$$\operatorname{Pr}[\text{運行時間} \ge 10T] \le \frac{1}{10} = 10\%$$

透過互補事件，這也意味著：

$$\operatorname{Pr}[\text{運行時間} < 10T] \ge 1 - 0.1 = 90\%$$

**工程意義**：即便我們完全不知道該演算法在面對極端測資時，其運行時間的具體機率分佈究竟長什麼樣子，我們也能在數學上做擔保——**該演算法在 $10T$ 秒內順利結束運行的機率，至少高達 $90\%$**。
</callout>

## 進階應用與侷限性

馬爾科夫不等式在機率與統計學中有著舉足輕重的地位，它不僅能直接用來推導<information concept="concept.tail_bound">尾端機率上界</information>，更是諸多進階定理的核心基石。例如：
1. **推導<content-link canonical="chebyshevs-inequality-and-variance">柴比雪夫不等式 (Chebyshev's Inequality)</content-link>**：將隨機變數 $X$ 替換為 $(X - \mu)^2$。
2. **推導<content-link canonical="chernoff-bound-and-exponential-concentration">切爾諾夫界限 (Chernoff Bound)</content-link>**：將隨機變數替換為指數形式 $e^{tX}$，即可利用<information concept="concept.mgf">動差生成函數</information>（MGF）推導出具備指數級衰減的機率邊界。
3. **收斂性證明**：在高等機率論中，它常被用來證明「均方收斂（Mean Square Convergence）」必然推導出「依機率收斂（Convergence in Probability）」。

**侷限性：**
雖然馬爾科夫不等式極為通用，但它給出的界限通常**不夠緊緻（Loose Bound）**。其衰減速率僅為多項式級別的 $\mathcal{O}(1/a)$。如果我們知道該隨機變數是由多個獨立事件重複組合而成，經驗告訴我們極端值出現的機率應該呈「指數級」衰減。馬爾科夫不等式之所以無法給出這麼好的界限，是因為它**完全沒有利用到<information concept="concept.variance">變異數</information>（Variance）或更高階<information concept="concept.moments">動差</information>（Higher Moments）的資訊**。而後續將介紹的<content-link canonical="chebyshevs-inequality-and-variance">柴比雪夫不等式</content-link>，正是在此基礎之上，引入了<information concept="concept.variance">變異數</information>資訊來大幅改進馬爾科夫不等式的不足。

<reviewkit>
  <takeaways>
    - **核心前提**：Markov 不等式是要求最低的集中不等式，只需要「幾乎必然非負變數」與「一階動差（期望值）」。
    - **直觀倍數形式**：$\operatorname{Pr}[X \ge \alpha \mathbb{E}[X]] \le 1/\alpha$。數值超過平均值 $\alpha$ 倍的機率，必不大於 $1/\alpha$。
    - **反證直覺**：如果極端大值的機率過高，其貢獻的權重就會打破現有期望值的平衡。
    - **演算法應用**：在未知具體機率分佈的情況下，它是評估隨機演算法「最壞時間上限（Worst-case Tail Bound）」的終極保底工具。
    - **承先啟後**：由於其衰減速率僅為 $\mathcal{O}(1/a)$，當我們需要更緊緻的界限時，必須將其結合函數變換（如平方、指數）來引入更高階的動差資訊，這也是後續 Chebyshev 與 Chernoff 不等式的發展脈絡。
  </takeaways>
  <qprompt/>
</reviewkit>

## 參考資料（References）

1. NUS CS5234 Algorithms at Scale Course Materials
2. Taboga, Marco (2021). "Markov's inequality", *Lectures on probability theory and mathematical statistics*. Kindle Direct Publishing. Online appendix. https://www.statlect.com/fundamentals-of-probability/Markov-inequality