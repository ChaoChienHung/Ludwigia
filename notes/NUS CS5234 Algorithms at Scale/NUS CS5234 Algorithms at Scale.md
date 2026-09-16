<meta>
Title: NUS CS5234 Algorithms at Scale
Summary: Comprehensive lecture and study notes for NUS CS5234 Algorithms at Scale, covering sublinear-time query algorithms, streaming foundations, concentration inequalities, variance reduction, median probability boosting, graph edge estimation, Yao's minimax principle, query complexity lower bounds, property testing, array monotonicity, and distribution uniformity testing.
Slug: nus-cs5234-algorithms-at-scale
Output: notes/NUS CS5234 Algorithms at Scale/NUS CS5234 Algorithms at Scale.html
CanonicalId: nus-cs5234-algorithms-at-scale
Style: default
EstimatedReadingTime: true
Lang: en
Tags: Sublinear Algorithm, Query Algorithm, Randomized Algorithm, Concentration Inequalities, Chernoff Bound, Chebyshev Inequality, Variance Reduction, Graph Algorithm, Algorithm, Probability
Status: drafting
Published: 2026-08-20
LastModified: 2026-09-16
</meta>

# NUS CS5234 Algorithms at Scale


# Week 1 - Scalability Bottlenecks, Probability Foundations, Concentration Inequalities, and Balls-into-Bins

<draft>
- 1. Course Architecture & The Foundations of Scalability
    - Course Information: CS5234 Algorithms at Scale, Instructor Yu Chen (yu.chen@nus.edu.sg), TA Mingyang Yang (myangat@u.nus.edu).
    - Assessment Breakdown: 100% Continuous Assessment (CA) — Two 50-minute Quizzes (40 pts total), 3 Programming & Theory Assignments (30 pts, assignment score = min{30, sum}), 10-page Survey Project on sublinear.info research topics (30 pts).
    - The Fundamental Dilemma: Too much input, too few computational resources (time, space, communication).
    - Time-Constrained Regimes: Reading the entire input is impossible; query algorithms sample data via an oracle.
    - Space-Constrained Regimes: Streaming algorithms observe long, unbounded sequences with limited memory (O(polylog n) space).
    - Distributed Regimes: Massively parallel clusters, communication bandwidth bounds, round complexity, and adaptivity limits.
    - Core Course Objectives: Sublinear algorithm design, concentration proofs, lower bounds via Yao's Minimax Principle, embracing randomized approximation.
- 2. Foundations of Discrete Probability, Expectation, Variance, and Convergence
    - Sample Spaces, Events, and Axioms of Probability; Conditional Probability and Event Independence.
    - Random Variables, Expectation, and Linearity of Expectation (unconditional validity without independence).
    - Variance and Covariance: Complete step-by-step algebraic expansion of Var(X) = E[X^2] - (E[X])^2; Cov(X, Y) = E[XY] - E[X]E[Y].
    - Covariance Dynamics: Physical interpretation of positive, negative, and zero correlation; variance as self-covariance; independence implies zero covariance.
    - Variance of Sums: Binomial expansion for two variables; polynomial expansion for n variables; matrix grid interpretation (diagonal self-squared terms vs. symmetric off-diagonal cross-terms 2 sum_{i < j} Cov(X_i, X_j)).
    - Pairwise Independence Sufficiency: Proof that Var(sum X_i) = sum Var(X_i); algorithmic significance of saving random bits via 2-universal hashing.
    - Weak Law of Large Numbers & Sample Average: Dice rolling intuition; why sum variance expands by n while average variance contracts by 1/n; derivation of Var(avg) = sigma^2 / n; proof of convergence to true mean via Chebyshev.
    - Central Limit Theorem vs. Chebyshev: Macro vs. Micro perspective; point-collapse vs. universal Gaussian bell-curve shape; sample size guidelines (n >= 30 rule of thumb); precision comparison (2 standard deviations: Chebyshev <= 25% vs. CLT approx 4.56%).
    - Statistical Inference & Confidence Intervals: The real-world dilemma of unknown mu and sigma; Slutsky's theorem and sample standard deviation S; standard error SE approx S / sqrt(n); coordinate inversion derivation of the 95% confidence interval [X_bar - 1.96 S/sqrt(n), X_bar + 1.96 S/sqrt(n)].
- 3. The Classical Balls-into-Bins Model & Empty Bin Dynamics
    - Model Specification: Throwing n balls uniformly and independently at random into n bins.
    - Bin Occupancy Distribution: Binomial distribution Bin(n, 1/n); Poisson approximation Poiss(1); E[X_j] = 1, Var(X_j) = 1 - 1/n.
    - Empty Bins Problem: Indicator variable E_j = I[bin j is empty]; Pr(E_j = 1) = (1 - 1/n)^n approx 1/e; total expected empty bins E[Z] approx n/e approx 0.368 n.
    - Inter-Bin Correlation & Covariance as a Safety Check: Proof of negative covariance Cov(E_i, E_j) <= 0; why covariance calculation is vital (preventing O(n^2) variance explosion from n^2/2 cross-terms); safe elimination of cross-terms to guarantee Var(Z) <= O(n).
- 4. The Hierarchy of Concentration Inequalities & Comparative Showdown
    - Concentration Hierarchy: Overview from crude expectation bounds to exponential tail concentration.
    - Markov's Inequality: Formal statement; proof by contradiction via expectation lower bound restriction; class score intuitive analogy; limitations (single-tail, linear O(1/alpha) decay); algorithmic expected-to-worst-case runtime truncation theorem.
    - Chebyshev's Inequality: Motivation and physical meaning (measuring deviations in natural units of standard deviation); why it represents a marginal probability of extreme events rather than a conditional probability; 3-step proof via squaring and Markov substitution; cancellation of variance; pairwise independent sums.
    - Chernoff Bound: Moment Generating Function (MGF) derivation; optimization of e^{tx}; multiplicative upper and lower tails; standard simplified two-sided and large deviation forms.
    - Comparative Showdown on Balls-into-Bins (10 n ln n balls): Step-by-step contrast between Chebyshev's weak logarithmic decay O(1/log n) and Chernoff's exponential power-law decay O(n^{-2.5}); union bound amplification over all n bins yielding O(n^{-1.5}) -> 0.
    - Union Bound (Boole's Inequality): Definition and "Bad Events" framework; complete proof of the High-Probability Non-Empty Bins Theorem (Coupon Collector's problem, failure probability <= n^{-9}); Venn diagram and Inclusion-Exclusion resolution of overlapping failure events (pessimistic overcounting guarantees algorithmic safety).
</draft>

## 1. Course Architecture & The Foundations of Scalability

### 1.1 Course Overview & Operational Policy

**NUS CS5234: Algorithms at Scale** is an advanced algorithms curriculum developed by the National University of Singapore, instructed by **Dr. Yu Chen** (`yu.chen@nus.edu.sg`) with teaching assistance by **Mingyang Yang** (`myangat@u.nus.edu`).

```
+-------------------------------------------------------------------------------+
|                       NUS CS5234: COURSE ASSESSMENT (100% CA)                 |
+------------------------------------+------------------------------------------+
| Assessment Component               | Weighting & Structural Mechanics         |
+------------------------------------+------------------------------------------+
| 1. Two Quizzes (Weeks 7 & 12)      | 40% (20 pts each, 50 minutes duration)   |
| 2. Three Assignments               | 30% (15 pts each; Score = min{30, sum})  |
| 3. Sublinear Survey Project        | 30% (Groups of <= 4; 10-page survey)     |
+------------------------------------+------------------------------------------+
```

The course addresses a profound paradigm shift in contemporary computing: **when datasets expand beyond the capacity of physical hardware, classical polynomial-time and linear-space algorithms become computationally intractable**. Scalable computing demands algorithms whose resource requirements scale **sublinearly** relative to input size $n$.

```
                              INPUT SCALE: n
                                     |
         +---------------------------+---------------------------+
         |                                                       |
         v                                                       v
 TIME CONSTRAINTS:                                SPACE CONSTRAINTS:
 Cannot afford to read input in full             Cannot afford to store input in RAM
         |                                                       |
         v                                                       v
 Query Algorithms (Sublinear Time)                Streaming Algorithms (Sublinear Space)
 - Access data via Oracle queries Q               - Process sequential stream in one pass
 - Sample small representative subset             - Maintain compact sketch / counter
 - Guarantee (eps, delta)-approximations          - O(polylog n) space complexity
```

---

### 1.2 What Does "Algorithms at Scale" Mean?

In classical algorithm design, an algorithm running in linear time $\mathcal{O}(n)$ is considered optimal because reading the input requires $\Omega(n)$ operations. However, in massive modern systems (e.g., web-scale social graphs with billions of vertices, genomic sequencing databases, global search indices):
- **Too Much Input:** The input size $n$ is so massive that spending even a single machine cycle per data entry is prohibitively slow.
- **Too Few Resources:** Computational hardware is strictly bounded across three primary axes:
  1. **Limited Time (Query Algorithms):** We cannot inspect all $n$ items. Instead, we query a black-box **Oracle** that exposes individual entries at unit cost. The algorithm accesses a microscopic sample of size $s \ll n$ (e.g., $\mathcal{O}(\text{polylog } n)$ or $\mathcal{O}(\sqrt{n})$) and outputs an estimated statistic $\hat{S}$.
  2. **Limited Space (Streaming Algorithms):** Data arrives sequentially as a high-velocity, unbounded stream (e.g., internet backbone router packet streams). We cannot store historical items. The algorithm retains only a compact synopsis or sketch using $\mathcal{O}(\text{polylog } n)$ memory to estimate global properties (such as distinct element counts, frequency moments, or heavy hitters).
  3. **Distributed Communication & Adaptivity (Parallel Clusters):** When data is partitioned across thousands of cluster nodes, the bottleneck is not local processor speed, but **inter-machine communication bandwidth** and **synchronization rounds (adaptivity)** (the foundational focus of distributed computing).

```
+--------------------------+-----------------------+---------------------------------------+
| Computational Regime     | Resource Constraint   | Algorithmic Methodology               |
+--------------------------+-----------------------+---------------------------------------+
| Query Algorithms         | Time: $o(n)$ queries  | Randomized sampling, property testing |
| Streaming Algorithms     | Space: $o(n)$ memory  | Linear sketching, hash counters       |
| Distributed Algorithms   | Network: $o(n)$ bits  | MapReduce, MPC, communication bounds  |
+--------------------------+-----------------------+---------------------------------------+
```

---

### 1.3 Course Objectives & The Sublinear Mindset

Designing algorithms at scale requires mastering four interconnected competencies:
1. **Algorithm Design Under Extreme Scarcity:** Formulating randomized sampling schemes and approximation estimators that operate with limited visibility.
2. **Correctness & Concentration Analysis:** Proving mathematically that randomized estimators concentrate tightly around the true ground truth with high probability ($1 - \delta$).
3. **Hardness & Lower Bound Proofs:** Proving that certain problems *cannot* be solved with sublinear resources, employing techniques such as **Yao's Minimax Principle** and information-theoretic communication complexity.
4. **Embracing Approximation & Randomization:** Recognizing that exact deterministic answers are fundamentally impossible in sublinear regimes; trading infinitesimal precision $\epsilon$ and bounded failure probability $\delta$ for exponential savings in time and space.

---

## 2. Foundations of Discrete Probability, Expectation, Variance, and Convergence

To analyze algorithms that rely on randomized sampling, we establish rigorous mathematical foundations in probability theory, expectation, variance, and convergence laws.

### 2.1 Sample Spaces, Events, and Independence

Let $\Omega$ denote the discrete sample space of all elementary outcomes, and let $\mathcal{F}$ be the event space. A probability measure $\Pr: \mathcal{F} \to [0, 1]$ satisfies Kolmogorov's axioms:
1. $\Pr(A) \ge 0$ for all $A \in \mathcal{F}$.
2. $\Pr(\Omega) = 1$.
3. Countable additivity: For mutually disjoint events $A_1, A_2, \dots$, $\Pr(\bigcup_i A_i) = \sum_i \Pr(A_i)$.

> **Definition (Independence of Events):**
> Two events $A, B \in \mathcal{F}$ are **independent** if and only if:
>
> $$\Pr(A \cap B) = \Pr(A) \cdot \Pr(B)$$
>
> If $\Pr(B) > 0$, independence is equivalent to $\Pr(A \mid B) = \Pr(A)$.

**Example (Slide 23–25):**
Consider a single ball placed uniformly at random into one of $n$ distinct bins.
- Let $A$ be the event that the ball lands in bin $\#2$: $\Pr(A) = 1/n$.
- Let $B$ be the event that the ball lands in bin $\#5$: $\Pr(B) = 1/n$.
- The joint event $A \cap B$ represents the single ball simultaneously occupying both bin $\#2$ and bin $\#5$. Because a single ball can occupy only one bin:
  $$\Pr(A \cap B) = 0 \neq \Pr(A) \cdot \Pr(B) = \frac{1}{n^2}$$
  Therefore, events $A$ and $B$ are **mutually exclusive (disjoint)**, and consequently **strongly dependent**!

---

### 2.2 Random Variables, Expectation, and Linearity

A discrete random variable $X: \Omega \to \mathbb{R}$ maps sample outcomes to real numbers.

> **Definition (Expectation):**
> The **expected value** (or mathematical expectation) of $X$ is the probability-weighted sum of its possible values:
>
> $$\mathbb{E}[X] = \sum_{x \in \text{range}(X)} x \cdot \Pr(X = x)$$

> **Theorem (Linearity of Expectation):**
> For any collection of random variables $X_1, X_2, \dots, X_n$ and real constants $c_1, c_2, \dots, c_n$:
>
> $$\mathbb{E}\left[ \sum_{i=1}^n c_i X_i \right] = \sum_{i=1}^n c_i \mathbb{E}[X_i]$$
>
> **Crucial Remark:** Linearity of expectation holds **unconditionally**—it requires **no assumption of independence** whatsoever among the random variables $X_i$!

*Proof:*
By definition of expectation over the joint distribution of $(X_1, \dots, X_n)$:
$$\mathbb{E}\left[ \sum_{i=1}^n X_i \right] = \sum_{\omega \in \Omega} \left( \sum_{i=1}^n X_i(\omega) \right) \Pr(\omega) = \sum_{i=1}^n \sum_{\omega \in \Omega} X_i(\omega) \Pr(\omega) = \sum_{i=1}^n \mathbb{E}[X_i] \quad \blacksquare$$

---

### 2.3 Variance, Covariance, and Independent Sums

While expectation measures the center of gravity, **variance** measures the dispersion and deviation around the mean.

> **Definition (Variance):**
> For a random variable $X$ with mean $\mu = \mathbb{E}[X]$, the variance is:
>
> $$\text{Var}(X) = \mathbb{E}[(X - \mathbb{E}[X])^2] = \mathbb{E}[X^2] - (\mathbb{E}[X])^2$$

*Step-by-Step Expansion of Variance:*
Let $\mu = \mathbb{E}[X]$ be a constant scalar:
$$\begin{aligned}
\text{Var}(X) &= \mathbb{E}[(X - \mu)^2] \\
&= \mathbb{E}[X^2 - 2\mu X + \mu^2] \\
&= \mathbb{E}[X^2] - 2\mu \mathbb{E}[X] + \mu^2 \\
&= \mathbb{E}[X^2] - 2\mu^2 + \mu^2 \\
&= \mathbb{E}[X^2] - \mu^2 = \mathbb{E}[X^2] - (\mathbb{E}[X])^2 \quad \blacksquare
\end{aligned}$$

> **Definition (Covariance):**
> For two random variables $X$ and $Y$, their **covariance** measures their joint linear variability and co-movement trend:
>
> $$\text{Cov}(X, Y) = \mathbb{E}[(X - \mathbb{E}[X])(Y - \mathbb{E}[Y])]$$

*Algebraic Derivation from Definition:*
Let $\mu_X = \mathbb{E}[X]$ and $\mu_Y = \mathbb{E}[Y]$. Expanding the product using linearity of expectation:
$$\begin{aligned}
\text{Cov}(X, Y) &= \mathbb{E}[(X - \mu_X)(Y - \mu_Y)] \\
&= \mathbb{E}[XY - \mu_X Y - \mu_Y X + \mu_X \mu_Y] \\
&= \mathbb{E}[XY] - \mu_X \mathbb{E}[Y] - \mu_Y \mathbb{E}[X] + \mu_X \mu_Y \\
&= \mathbb{E}[XY] - \mu_X \mu_Y - \mu_Y \mu_X + \mu_X \mu_Y \\
&= \mathbb{E}[XY] - \mu_X \mu_Y = \mathbb{E}[XY] - \mathbb{E}[X]\mathbb{E}[Y] \quad \blacksquare
\end{aligned}$$

#### Physical Interpretation of Covariance
- **$\text{Cov}(X, Y) > 0$ (Positive Correlation):** When $X$ exceeds its mean, $Y$ tends to exceed its mean (positive $\times$ positive = positive); or when $X$ is below its mean, $Y$ is also below its mean (negative $\times$ negative = positive). The variables fluctuate in the same direction.
- **$\text{Cov}(X, Y) < 0$ (Negative Correlation):** When $X$ exceeds its mean, $Y$ tends to be below its mean (positive $\times$ negative = negative). The variables fluctuate in opposite directions.
- **$\text{Cov}(X, Y) = 0$ (Uncorrelated):** There is no linear trend connecting deviations in $X$ to deviations in $Y$.
- **Variance as Self-Covariance:** When $Y = X$:
  $$\text{Cov}(X, X) = \mathbb{E}[X \cdot X] - \mathbb{E}[X]\mathbb{E}[X] = \mathbb{E}[X^2] - (\mathbb{E}[X])^2 = \text{Var}(X)$$
- **Independence Implication:** If $X$ and $Y$ are independent, $\mathbb{E}[XY] = \mathbb{E}[X]\mathbb{E}[Y]$, which implies $\text{Cov}(X, Y) = 0$. (Note that the converse is generally false: zero covariance does not guarantee statistical independence, only the absence of linear correlation).

---

#### Variance of Sums & The Polynomial Cross-Term Expansion

How does the variance behave when combining multiple random variables?

1. **Two Variables:**
   Analogous to the elementary binomial identity $(a + b)^2 = a^2 + b^2 + 2ab$:
   $$\text{Var}(X_1 + X_2) = \text{Var}(X_1) + \text{Var}(X_2) + 2\text{Cov}(X_1, X_2)$$
   The total variance consists of individual fluctuations plus a cross-influence coupling term $2\text{Cov}(X_1, X_2)$.

2. **General Sum of $n$ Variables (Slide 37):**
   Let $X = \sum_{i=1}^n X_i$. By definition of variance:
   $$\text{Var}(X) = \mathbb{E}[X^2] - (\mathbb{E}[X])^2 = \mathbb{E}\left[ \left(\sum_{i=1}^n X_i\right)^2 \right] - \left( \sum_{i=1}^n \mathbb{E}[X_i] \right)^2$$
   Any squared polynomial sum decomposes into diagonal self-squared terms and off-diagonal cross terms:
   $$\left( \sum_{i=1}^n a_i \right)^2 = \sum_{i=1}^n a_i^2 + 2 \sum_{1 \le i < j \le n} a_i a_j$$
   Applying this expansion to both expected terms:
   $$\mathbb{E}\left[ \left(\sum_{i=1}^n X_i\right)^2 \right] = \sum_{i=1}^n \mathbb{E}[X_i^2] + 2 \sum_{i < j} \mathbb{E}[X_i X_j]$$
   $$\left( \sum_{i=1}^n \mathbb{E}[X_i] \right)^2 = \sum_{i=1}^n (\mathbb{E}[X_i])^2 + 2 \sum_{i < j} \mathbb{E}[X_i] \mathbb{E}[X_j]$$
   Subtracting the two equations and grouping diagonal and cross-terms:
   $$\begin{aligned}
   \text{Var}\left(\sum_{i=1}^n X_i\right) &= \sum_{i=1}^n \Big( \mathbb{E}[X_i^2] - (\mathbb{E}[X_i])^2 \Big) + 2 \sum_{1 \le i < j \le n} \Big( \mathbb{E}[X_i X_j] - \mathbb{E}[X_i] \mathbb{E}[X_j] \Big) \\
   &= \sum_{i=1}^n \text{Var}(X_i) + 2 \sum_{1 \le i < j \le n} \text{Cov}(X_i, X_j) \quad \blacksquare
   \end{aligned}$$

```
Matrix Representation of the Sum Variance:
+---------------+---------------+---------------+-----+---------------+
| (X_1, X_1)    | (X_1, X_2)    | (X_1, X_3)    | ... | (X_1, X_n)    |  <-- Off-diagonal entries
+---------------+---------------+---------------+-----+---------------+      (X_i, X_j) for i != j
| (X_2, X_1)    | (X_2, X_2)    | (X_2, X_3)    | ... | (X_2, X_n)    |      are pairwise symmetric:
+---------------+---------------+---------------+-----+---------------+      Cov(X_i, X_j) = Cov(X_j, X_i)
| (X_3, X_1)    | (X_3, X_2)    | (X_3, X_3)    | ... | (X_3, X_n)    |
+---------------+---------------+---------------+-----+---------------+  --> Grouping upper (i < j)
|      ...      |      ...      |      ...      | ... |      ...      |      and lower (i > j) triangles
+---------------+---------------+---------------+-----+---------------+      yields the factor of 2!
| (X_n, X_1)    | (X_n, X_2)    | (X_n, X_3)    | ... | (X_n, X_n)    |  <-- Main diagonal: Var(X_i)
+---------------+---------------+---------------+-----+---------------+
```

3. **The Power of Pairwise Independence:**
   If the random variables $X_1, \dots, X_n$ are **pairwise independent**, then $\text{Cov}(X_i, X_j) = 0$ for all $i \ne j$.
   The cross-terms vanish entirely:
   $$\text{Var}\left( \sum_{i=1}^n X_i \right) = \sum_{i=1}^n \text{Var}(X_i)$$
   > **Algorithmic Significance:**
   > In algorithm design (e.g., streaming sketches, 2-universal hashing, randomized routing), generating truly mutually independent random bits requires large entropy sources ($\mathcal{O}(n)$ random bits). However, Chebyshev's inequality and variance addition require **only pairwise independence**! Pairwise independent hash families can be constructed using just two random seeds ($h(x) = (ax + b) \pmod p$), saving massive random resources.

---

### 2.4 The Weak Law of Large Numbers & Sample Average Dynamics

A fundamental question in statistical computing is: *why does taking the average of multiple independent measurements produce an estimate with near-zero error?*

#### Intuitive Example: Dice Rolling
- Roll a single fair 6-sided die: The outcome $X_i \in \{1, \dots, 6\}$ fluctuates wildly with variance $\text{Var}(X_i) = \frac{35}{12} \approx 2.92$.
- Consider the **Sum** of 1,000 rolls: $S = \sum_{i=1}^{1000} X_i$. The variance of the sum is $1000 \times 2.92 = 2920$. The sum swings broadly between 3,000 and 4,000.
- Consider the **Sample Average** of 1,000 rolls: $\bar{X} = \frac{S}{1000}$. The average is almost stubbornly pinned right at $\mu = 3.5$ (typically between $3.45$ and $3.55$).
- **The Mathematical Paradox:** Why does the variance of the sum grow linearly with $n$, while the variance of the average contracts by a factor of $n$?

#### Mathematical Derivation of Sample Average Variance
Let $X_1, X_2, \dots, X_n$ be independent and identically distributed (i.i.d.) random variables with mean $\mu$ and variance $\sigma^2$.
Define the sample average:
$$\text{avg} = \bar{X} = \frac{X}{n} = \frac{1}{n} \sum_{i=1}^n X_i$$

1. **Expectation of Average:**
   $$\mathbb{E}[\bar{X}] = \mathbb{E}\left[ \frac{1}{n} \sum_{i=1}^n X_i \right] = \frac{1}{n} \sum_{i=1}^n \mathbb{E}[X_i] = \frac{1}{n} (n \mu) = \mu$$
2. **Variance of Average:**
   Recall that factoring a scalar constant $c$ out of variance requires squaring: $\text{Var}(c Y) = c^2 \text{Var}(Y)$.
   Setting $c = \frac{1}{n}$:
   $$\text{Var}(\bar{X}) = \text{Var}\left( \frac{1}{n} X \right) = \frac{1}{n^2} \text{Var}(X)$$
   Substituting the sum variance $\text{Var}(X) = \sum_{i=1}^n \text{Var}(X_i) = n \sigma^2$:
   $$\text{Var}(\bar{X}) = \frac{1}{n^2} (n \sigma^2) = \frac{n \sigma^2}{n^2} = \frac{\sigma^2}{n}$$
   - **The $n$ vs. $n^2$ Cancellation:** The numerator accumulates $n$ units of variance from summing $n$ independent fluctuations. The denominator squares the averaging operation to $n^2$. Dividing the two leaves a single $n$ in the denominator!
   - As sample size $n \to \infty$, $\text{Var}(\bar{X}) = \frac{\sigma^2}{n} \to 0$. Fluctuation vanishes completely.

#### Rigorous Proof of the Weak Law of Large Numbers (WLLN)
Substitute the sample average into Chebyshev's inequality with a fixed deviation tolerance $\epsilon > 0$:
$$\Pr(|\bar{X} - \mu| \ge \epsilon) \le \frac{\text{Var}(\bar{X})}{\epsilon^2} = \frac{\frac{\sigma^2}{n}}{\epsilon^2} = \frac{\sigma^2}{n \epsilon^2}$$
Taking the limit as sample size $n$ approaches infinity:
$$\lim_{n \to \infty} \Pr(|\bar{X} - \mu| \ge \epsilon) \le \lim_{n \to \infty} \frac{\sigma^2}{n \epsilon^2} = 0$$
Thus:
$$\lim_{n \to \infty} \Pr(|\bar{X} - \mu| \ge \epsilon) = 0 \quad \blacksquare$$

#### Alternative Formulation: Units of Standard Deviation
If we express the deviation threshold as $\alpha$ standard deviations of the average, where $\sigma_{\bar{X}} = \frac{\sigma}{\sqrt{n}}$:
$$\Pr\left( |\bar{X} - \mu| \ge \alpha \cdot \frac{\sigma}{\sqrt{n}} \right) \le \frac{1}{\alpha^2}$$
For any fixed error probability threshold $1/\alpha^2$ (e.g., $\alpha = 10 \implies$ failure probability $\le 1\%$), the error radius $\frac{10\sigma}{\sqrt{n}}$ shrinks at the rate of $\mathcal{O}(1/\sqrt{n})$ toward zero.

---

### 2.5 Central Limit Theorem vs. Chebyshev & Statistical Inference

Both Chebyshev's Inequality and the Central Limit Theorem (CLT) analyze the behavior of sample averages, but they operate at profoundly different levels of resolution.

#### Macro vs. Micro Perspective
```
+--------------------------+-----------------------------------+-----------------------------------+
| Feature                  | Chebyshev's Inequality (Macro)    | Central Limit Theorem (Micro)     |
+--------------------------+-----------------------------------+-----------------------------------+
| Nature of Guarantee      | Conservative upper bound          | Asymptotic distribution shape     |
| Information Provided     | Average collapses to a single pt  | Geometric shape of the collapse   |
| Independence Condition   | Pairwise independence is enough   | Mutual independence (i.i.d.)      |
| Distribution Knowledge   | Zero knowledge required           | Universal Gaussian bell curve     |
| Precision (2 std dev)    | Failure probability <= 25%        | Failure probability approx 4.56%  |
+--------------------------+-----------------------------------+-----------------------------------+
```

- **Chebyshev (The Macro View):**
  $\text{Var}(\bar{X}) = \frac{\sigma^2}{n} \to 0$ guarantees that the distribution compresses into a Dirac delta function at $\mu$. However, Chebyshev provides no information regarding the shape, symmetry, or contours of this distribution.
- **Central Limit Theorem (The Micro View):**
  Instead of letting the distribution collapse to a point, the CLT magnifies the collapsing deviation by $\sqrt{n}$:
  $$Z_n = \frac{\bar{X} - \mu}{\sigma / \sqrt{n}} = \frac{\sqrt{n}(\bar{X} - \mu)}{\sigma} \xrightarrow{d} \mathcal{N}(0, 1)$$
  Regardless of the underlying population distribution (uniform, Bernoulli, exponential, or multi-modal), the normalized sample average converges to a standard normal distribution!

> **Clarification on the "$n \ge 30$" Rule of Thumb:**
> A common misconception in introductory statistics is that the CLT requires "drawing samples in repeated batches of 30 or 40". In reality, $n \ge 30$ refers to the **single sample size** $n$ of the dataset being averaged: once $n \ge 30$, the normal approximation is generally sufficiently accurate for most non-pathological parent distributions.

#### The Fundamental Dilemma of Statistical Inference
In theoretical probability, we assume known parameters $\mu$ and $\sigma$ to compute the probability of sample deviations.
In real-world scalable computing, we face the inverse dilemma: **the true population mean $\mu$ and standard deviation $\sigma$ are completely unknown!** We possess only a single sample of $n$ observations: $x_1, x_2, \dots, x_n$.

How do we construct rigorous guarantees without knowing $\mu$ and $\sigma$?

1. **Estimating $\sigma$ via Sample Standard Deviation:**
   We compute the sample variance from our single batch:
   $$S^2 = \frac{1}{n - 1} \sum_{i=1}^n (x_i - \bar{X})^2 \implies S = \sqrt{S^2}$$
   By **Slutsky's Theorem**, as $n$ grows large, the sample standard deviation $S$ converges in probability to the true population standard deviation $\sigma$.
   The standard error of the mean is estimated as:
   $$\text{SE} \approx \frac{S}{\sqrt{n}}$$
   *(For small $n$, Gosset's Student's $t$-distribution provides the exact degrees-of-freedom correction).*

2. **Coordinate Inversion (Deriving the 95% Confidence Interval):**
   According to the Central Limit Theorem:
   $$\frac{\bar{X} - \mu}{S / \sqrt{n}} \sim \mathcal{N}(0, 1)$$
   On the standard normal curve, exactly $95\%$ of probability mass lies within $[-1.96, +1.96]$:
   $$\Pr\left( -1.96 \le \frac{\bar{X} - \mu}{S / \sqrt{n}} \le 1.96 \right) = 0.95$$
   Notice that $\mu$ is the fixed unknown target, while $\bar{X}$ and $S$ are computable sample statistics. We isolate $\mu$ algebraically:
   - Multiply all terms by the positive standard error $\frac{S}{\sqrt{n}}$:
     $$-1.96 \frac{S}{\sqrt{n}} \le \bar{X} - \mu \le 1.96 \frac{S}{\sqrt{n}}$$
   - Subtract $\bar{X}$ from all terms:
     $$-\bar{X} - 1.96 \frac{S}{\sqrt{n}} \le -\mu \le -\bar{X} + 1.96 \frac{S}{\sqrt{n}}$$
   - Multiply by $-1$ (which reverses the inequality signs):
     $$\bar{X} - 1.96 \frac{S}{\sqrt{n}} \le \mu \le \bar{X} + 1.96 \frac{S}{\sqrt{n}}$$
   Substituting this back into the probability statement:
   $$\Pr\left( \bar{X} - 1.96 \frac{S}{\sqrt{n}} \le \mu \le \bar{X} + 1.96 \frac{S}{\sqrt{n}} \right) = 95\%$$

> **The Conceptual Inversion:**
> Instead of attempting to locate $\bar{X}$ around an invisible $\mu$, we construct a dynamic interval centered at our observed sample mean $\bar{X}$ with radius $1.96 \frac{S}{\sqrt{n}}$. This random interval has a **95% probability of capturing the true unknown population parameter $\mu$**.

---

## 3. The Classical Balls-into-Bins Model & Empty Bin Dynamics

The **Balls-into-Bins** benchmark serves as the foundational canonical model throughout CS5234 for studying load balancing, hashing, randomized routing, and concentration.

```
Throw n balls uniformly and independently at random into n bins:
     Ball 1       Ball 2       Ball 3       ...       Ball n
       |            |            |                      |
       v            v            v                      v
   +-------+    +-------+    +-------+              +-------+
   |       |    |       |    |       |              |       |
   | Bin 1 |    | Bin 2 |    | Bin 3 |     ...      | Bin n |
   +-------+    +-------+    +-------+              +-------+
```

### 3.1 Bin Occupancy Expectation & Variance

Suppose we throw $n$ balls uniformly and independently at random into $n$ bins. Let $X$ denote the total number of balls that land in bin $\#2$.

1. **Indicator Decomposition:**
   For each ball $i \in \{1, 2, \dots, n\}$, define the indicator variable:
   $$X_i = \begin{cases} 1 & \text{if ball } i \text{ lands in bin } \#2 \\ 0 & \text{otherwise} \end{cases}$$
   Then $X = \sum_{i=1}^n X_i$.
2. **Expected Occupancy:**
   Each ball chooses bin $\#2$ with probability $\Pr(X_i = 1) = 1/n$. By linearity of expectation:
   $$\mathbb{E}[X] = \mathbb{E}\left[ \sum_{i=1}^n X_i \right] = \sum_{i=1}^n \mathbb{E}[X_i] = \sum_{i=1}^n \frac{1}{n} = n \cdot \frac{1}{n} = 1$$
3. **Variance of Bin Occupancy:**
   Since the balls are thrown independently, the indicators $X_1, \dots, X_n$ are mutually independent Bernoulli trials.
   For each individual indicator $X_i$:
   $$\mathbb{E}[X_i^2] = 1^2 \cdot \frac{1}{n} + 0^2 \cdot \left(1 - \frac{1}{n}\right) = \frac{1}{n}$$
   $$\text{Var}(X_i) = \mathbb{E}[X_i^2] - (\mathbb{E}[X_i])^2 = \frac{1}{n} - \frac{1}{n^2}$$
   By independence across all $n$ balls:
   $$\text{Var}(X) = \sum_{i=1}^n \text{Var}(X_i) = n \left( \frac{1}{n} - \frac{1}{n^2} \right) = 1 - \frac{1}{n}$$
   As $n \to \infty$, the distribution of balls in any single bin converges to a **Poisson distribution** with parameter $\lambda = 1$, where $\mathbb{E}[X] = 1$ and $\text{Var}(X) = 1$.

---

### 3.2 The Empty Bins Problem (Slide 32)

> **Exercise:**
> When $n$ balls are thrown uniformly at random into $n$ bins, what is the **expected number of empty bins**?

**Rigorous Derivation:**
For each bin $j \in \{1, 2, \dots, n\}$, define the empty-bin indicator:
$$E_j = \begin{cases} 1 & \text{if bin } j \text{ receives zero balls} \\ 0 & \text{otherwise} \end{cases}$$
Let $Z = \sum_{j=1}^n E_j$ denote the total number of empty bins.

1. **Probability of a Single Bin Being Empty:**
   For a specific bin $j$, each ball lands outside bin $j$ with probability $1 - 1/n$.
   Because the $n$ ball placements are mutually independent:
   $$\Pr(E_j = 1) = \left( 1 - \frac{1}{n} \right)^n$$
2. **The Asymptotic Constant $1/e$:**
   A fundamental inequality in sublinear analysis states that for all $k \ge 1$:
   $$\left( 1 - \frac{1}{k} \right)^k < \frac{1}{e} < \left( 1 - \frac{1}{k} \right)^{k-1}$$
   Throughout CS5234, we use the standard approximation:
   $$\left( 1 - \frac{1}{n} \right)^n \approx \frac{1}{e} \approx 0.367879$$
3. **Linearity of Expectation for Total Empty Bins:**
   $$\mathbb{E}[Z] = \mathbb{E}\left[ \sum_{j=1}^n E_j \right] = \sum_{j=1}^n \mathbb{E}[E_j] = n \left( 1 - \frac{1}{n} \right)^n \approx \frac{n}{e} \approx 0.368 n$$
   Thus, on average, approximately **$36.8\%$ of all bins remain completely empty** when $n$ balls are thrown into $n$ bins!

---

### 3.3 Inter-Bin Correlation & Covariance as a Safety Check (Slide 38)

> **Deep Question:** If Chebyshev's inequality requires evaluating $\text{Var}(Z) = \sum \text{Var}(E_j) + 2 \sum_{i < j} \text{Cov}(E_i, E_j)$, why is computing the covariance terms $\text{Cov}(E_i, E_j)$ absolutely critical?

#### The Threat of Variance Explosion
Notice that the sum for total empty bins $Z = \sum_{j=1}^n E_j$ involves $n$ indicator variables.
Expanding its total variance:
$$\text{Var}(Z) = \sum_{j=1}^n \text{Var}(E_j) + 2 \sum_{1 \le i < j \le n} \text{Cov}(E_i, E_j)$$
- The first sum $\sum \text{Var}(E_j)$ contains $n$ terms, each bounded by $e^{-1}(1 - e^{-1}) \approx 0.23$. Thus $\sum \text{Var}(E_j) \approx 0.23n = \mathcal{O}(n)$.
- However, the second sum contains $\binom{n}{2} = \frac{n(n-1)}{2} \approx \frac{n^2}{2}$ covariance cross-terms!
- **The Catastrophic Scenario:** If the bin indicators were positively correlated ($\text{Cov}(E_i, E_j) > 0$), adding $\Theta(n^2)$ positive terms could cause the total variance $\text{Var}(Z)$ to explode to $\mathcal{O}(n^2)$!
- **Why $\mathcal{O}(n^2)$ Variance Breaks Chebyshev:**
  If $\text{Var}(Z) = \mathcal{O}(n^2)$, standard deviations are $\mathcal{O}(n)$. Substituting this into Chebyshev's inequality for a deviation $k = \epsilon n$:
  $$\Pr(|Z - \mathbb{E}[Z]| \ge \epsilon n) \le \frac{\text{Var}(Z)}{\epsilon^2 n^2} \approx \frac{\mathcal{O}(n^2)}{\epsilon^2 n^2} \approx \mathcal{O}(1) > 1$$
  The upper bound exceeds 1, rendering Chebyshev's inequality completely useless! It would mean empty bins do not concentrate at all (one run might produce 10,000 empty bins, and the next 70,000).

#### Covariance as the "Safety Certificate"
To rule out this catastrophic possibility, we rigorously compute the joint probability and covariance:
1. If bin $i$ is empty, all $n$ balls landed in the remaining $n-1$ bins. The probability that bin $j$ is *also* empty is:
   $$\Pr(E_i = 1 \cap E_j = 1) = \left( 1 - \frac{2}{n} \right)^n$$
2. Comparing this joint probability with the product of marginal probabilities:
   $$\left( 1 - \frac{2}{n} \right)^n < \left( 1 - \frac{1}{n} \right)^{2n} = \Pr(E_i = 1) \cdot \Pr(E_j = 1)$$
3. Calculating the covariance:
   $$\text{Cov}(E_i, E_j) = \Pr(E_i = 1 \cap E_j = 1) - \Pr(E_i = 1)\Pr(E_j = 1) \le 0$$
- **The Conclusion:**
  Because the covariance terms are **strictly non-positive** ($\text{Cov}(E_i, E_j) \le 0$), the entire cross-term sum is $\le 0$:
  $$2 \sum_{1 \le i < j \le n} \text{Cov}(E_i, E_j) \le 0$$
  This acts as an ironclad **safety certificate**:
  $$\text{Var}(Z) = \sum_{j=1}^n \text{Var}(E_j) + 2 \sum_{i < j} \text{Cov}(E_i, E_j) \le \sum_{j=1}^n \text{Var}(E_j) \approx 0.23 n$$
  We can safely drop the cross-terms! The total variance is strictly bounded by $\mathcal{O}(n)$, proving that the empty bin count is **tightly concentrated around its mean $n/e$**.

---

## 4. The Hierarchy of Concentration Inequalities & Comparative Showdown

Concentration inequalities quantify the probability that a random variable deviates from its expected value. They form the mathematical backbone of all randomized, sublinear, and streaming algorithms.

```
+-------------------------+-------------------------+-----------------------------------------+
| Inequality              | Information Required    | Decay Rate of Tail Probability          |
+-------------------------+-------------------------+-----------------------------------------+
| Markov's Inequality     | Mean E[X] (X >= 0)      | O(1/alpha) [Linear / Weakest]           |
| Chebyshev's Inequality  | Mean + Variance Var(X)  | O(1/alpha^2) [Polynomial / Moderate]    |
| Chernoff Bound          | Mutual Independence     | exp(-Omega(delta^2 mu)) [Exponential]   |
| Union Bound             | Arbitrary Events        | Simple sum of probabilities (Worst-case)|
+-------------------------+-------------------------+-----------------------------------------+
```

---

### 4.1 Markov's Inequality & Algorithm Truncation

> **Theorem (Markov's Inequality):**
> Let $X$ be any **non-negative** random variable ($X \ge 0$). Then for any scalar $\alpha > 0$:
>
> $$\Pr(X \ge \alpha \mathbb{E}[X]) \le \frac{1}{\alpha}$$
>
> Equivalently, setting $a = \alpha \mathbb{E}[X]$ for any positive threshold $a > 0$:
>
> $$\Pr(X \ge a) \le \frac{\mathbb{E}[X]}{a}$$

*Rigorous Proof by Contradiction (Slide 33):*
Suppose for contradiction that the inequality does not hold, namely:
$$\Pr(X > \alpha \mathbb{E}[X]) > \frac{1}{\alpha}$$
Because $X \ge 0$, we can establish a strict lower bound on its expected value by restricting $X$ exclusively to the conditioning event $\{X > \alpha \mathbb{E}[X]\}$ (discarding the non-negative contribution from other outcomes can only decrease or preserve the value):
$$\mathbb{E}[X] \ge \mathbb{E}[X \cdot \mathbb{I}(X > \alpha \mathbb{E}[X])]$$
Under this condition, every realized value satisfies $X > \alpha \mathbb{E}[X]$. Therefore:
$$\mathbb{E}[X] > \alpha \mathbb{E}[X] \cdot \Pr(X > \alpha \mathbb{E}[X])$$
Substituting our contradiction assumption $\Pr(X > \alpha \mathbb{E}[X]) > 1/\alpha$:
$$\mathbb{E}[X] > \alpha \mathbb{E}[X] \cdot \frac{1}{\alpha} = \mathbb{E}[X]$$
This yields $\mathbb{E}[X] > \mathbb{E}[X]$, an impossible mathematical contradiction!
Therefore, the assumption was false, and the original inequality must hold: $\Pr(X \ge \alpha \mathbb{E}[X]) \le 1/\alpha$. $\blacksquare$

#### Intuitive Analogy: Class Exam Scores
Consider an exam graded out of 100 points where negative scores are impossible ($X \ge 0$). Suppose the class average is exactly 50 points ($\mathbb{E}[X] = 50$).
- Can more than $50\%$ of the class score 100 points?
- **Absurdity:** If more than half the students scored 100, their scores alone would exceed $(0.5 \times 100) \times N = 50N$ points, meaning the average would strictly exceed 50!
- Markov's inequality formalizes this exact budgetary ceiling: $\Pr(X \ge 2 \cdot 50) \le 1/2$.

#### Fundamental Limitations of Markov's Inequality
1. **Single-Tail Only:** Markov only bounds the probability that $X$ is exceptionally large ($\Pr(X \ge a)$). It cannot provide lower-tail bounds ($\Pr(X \le b)$) to prevent $X$ from being too small.
2. **Weak Tail Decay:** The decay rate is strictly linear ($\mathcal{O}(1/\alpha)$). For $\alpha \le 1$, the bound is $\ge 1$ (vacuous).

#### Algorithmic Application: Expected to Worst-Case Runtime Truncation (Slide 35)
Markov's inequality provides a fundamental bridge between Las Vegas algorithms (randomized runtime, guaranteed correctness) and Monte Carlo algorithms (bounded runtime, bounded error):
- **Theorem:** If a randomized algorithm has **expected running time** $T$, then running the algorithm and forcibly halting (truncating) it after $10T$ steps guarantees that the algorithm completes within $10T$ with probability at least $9/10$:
  $$\Pr(\text{Runtime} > 10T) \le \frac{\mathbb{E}[\text{Runtime}]}{10T} = \frac{T}{10T} = \frac{1}{10}$$
  $$\implies \Pr(\text{Runtime} \le 10T) \ge 1 - \frac{1}{10} = \frac{9}{10}$$

---

### 4.2 Chebyshev's Inequality: Physical Meaning, Derivation, and Event Semantics

Chebyshev's inequality directly overcomes the two primary limitations of Markov's inequality by inspecting the **squared deviation from the mean** $(X - \mathbb{E}[X])^2$:
1. Squaring guarantees non-negativity: $(X - \mathbb{E}[X])^2 \ge 0$, permitting the use of Markov's theorem.
2. Squaring captures both tails simultaneously: deviations whether excessively large ($X \gg \mu$) or excessively small ($X \ll \mu$) both become positive deviations.

> **Theorem (Chebyshev's Inequality):**
> Let $X$ be any random variable with mean $\mu = \mathbb{E}[X]$ and finite variance $\sigma^2 = \text{Var}(X)$. Then for any scalar $\alpha > 0$:
>
> $$\Pr(|X - \mathbb{E}[X]| > \alpha \sqrt{\text{Var}(X)}) \le \frac{1}{\alpha^2}$$
>
> Equivalently, for any absolute deviation threshold $k > 0$:
>
> $$\Pr(|X - \mathbb{E}[X]| \ge k) \le \frac{\text{Var}(X)}{k^2}$$

#### Demystifying Chebyshev: Physical Meaning & Operational Motivation
Chebyshev's inequality is **not** an inherent algebraic identity, nor is it a conditional probability statement. It is a mathematical response to a foundational question we deliberately formulate:
> *"What is the probability that an observation $X$ deviates from its expected center $\mathbb{E}[X]$ by more than $\alpha$ standard deviations?"*

- **$|X - \mathbb{E}[X]|$:** The absolute deviation (geometric distance) of $X$ from its mean.
- **$\sqrt{\text{Var}(X)} = \sigma$:** The **standard deviation**, which serves as the natural scale (unit ruler) measuring the spread of the random variable.
- **$\alpha \sqrt{\text{Var}(X)}$:** A threshold expressed in multiples of the natural unit ruler.
- **Why It is NOT a Conditional Probability:**
  A conditional probability requires the structure $\Pr(A \mid B)$ ("the probability of $A$ given event $B$ has occurred"). In Chebyshev's inequality, the expression $\Pr(|X - \mu| > \alpha \sigma)$ contains only a **single marginal event**. It measures the marginal probability of sampling an extreme outlier.

#### Step-by-Step Proof
1. **Target Formulation:**
   We wish to bound the probability of an extreme deviation for an arbitrary positive constant $k > 0$:
   $$\Pr(|X - \mathbb{E}[X]| > k)$$
2. **Squaring for Event Equivalence:**
   Since both $|X - \mathbb{E}[X]|$ and $k$ are non-negative real numbers, squaring both sides produces an identical event:
   $$|X - \mathbb{E}[X]| > k \iff (X - \mathbb{E}[X])^2 > k^2$$
   Therefore, their probabilities are strictly equal:
   $$\Pr(|X - \mathbb{E}[X]| > k) = \Pr\left( (X - \mathbb{E}[X])^2 > k^2 \right)$$
3. **Markov Substitution:**
   Define the auxiliary random variable $Y = (X - \mathbb{E}[X])^2$.
   - Clearly $Y \ge 0$ (a squared real number is non-negative).
   - The expected value of $Y$ is by definition the variance: $\mathbb{E}[Y] = \mathbb{E}[(X - \mathbb{E}[X])^2] = \text{Var}(X)$.
   Applying Markov's inequality to $Y$ with threshold $c = k^2$:
   $$\Pr(Y > k^2) \le \frac{\mathbb{E}[Y]}{k^2} = \frac{\text{Var}(X)}{k^2}$$
4. **Natural Scale Calibration (Setting $k = \alpha \sqrt{\text{Var}(X)}$):**
   To express the distance in multiples of standard deviations, set $k = \alpha \sqrt{\text{Var}(X)}$:
   $$\frac{\text{Var}(X)}{k^2} = \frac{\text{Var}(X)}{\left( \alpha \sqrt{\text{Var}(X)} \right)^2} = \frac{\text{Var}(X)}{\alpha^2 \text{Var}(X)} = \frac{1}{\alpha^2}$$
   Substituting this into the inequality:
   $$\Pr(|X - \mathbb{E}[X]| > \alpha \sqrt{\text{Var}(X)}) \le \frac{1}{\alpha^2} \quad \blacksquare$$

> **Universal Concrete Takeaway:**
> Regardless of how bizarre, skewed, or asymmetric the underlying probability distribution is, the probability of deviating by more than **2 standard deviations** can **never exceed $\frac{1}{2^2} = 25\%$**, and deviating by more than **3 standard deviations** can **never exceed $\frac{1}{3^2} \approx 11.1\%$**.

---

### 4.3 The Chernoff Bound & Exponential Tail Bounds

When random variables are **mutually independent**, deviations from the mean decay **exponentially fast**, establishing the strongest known concentration bound for independent sums.

> **Theorem (Chernoff Bound - Multiplicative Form):**
> Let $X_1, X_2, \dots, X_n$ be mutually independent random variables such that $X_i \in [0, 1]$. Let $X = \sum_{i=1}^n X_i$ and let $\mu = \mathbb{E}[X]$.
>
> 1. **Upper Tail (Any $\delta > 0$):**
>    $$\Pr(X \ge (1 + \delta)\mu) \le \left( \frac{e^\delta}{(1 + \delta)^{1 + \delta}} \right)^\mu$$
> 2. **Lower Tail (Any $0 < \delta < 1$):**
>    $$\Pr(X \le (1 - \delta)\mu) \le \left( \frac{e^{-\delta}}{(1 - \delta)^{1 - \delta}} \right)^\mu$$

*Complete Mathematical Derivation via Moment Generating Functions (MGF):*
1. For any parameter $t > 0$, the function $f(x) = e^{tx}$ is strictly monotonically increasing. Therefore:
   $$\Pr(X \ge (1 + \delta)\mu) = \Pr(e^{tX} \ge e^{t(1 + \delta)\mu})$$
2. Applying Markov's inequality to the non-negative random variable $e^{tX}$:
   $$\Pr(e^{tX} \ge e^{t(1 + \delta)\mu}) \le \frac{\mathbb{E}[e^{tX}]}{e^{t(1 + \delta)\mu}}$$
3. By mutual independence of $X_1, \dots, X_n$, the expectation of the product factors into the product of expectations:
   $$\mathbb{E}[e^{tX}] = \mathbb{E}\left[ \prod_{i=1}^n e^{t X_i} \right] = \prod_{i=1}^n \mathbb{E}[e^{t X_i}]$$
4. Using the convexity inequality $e^{tx} \le 1 - x + x e^t$ for $x \in [0, 1]$:
   $$\mathbb{E}[e^{t X_i}] \le 1 - \mathbb{E}[X_i] + \mathbb{E}[X_i] e^t = 1 + \mathbb{E}[X_i](e^t - 1) \le \exp(\mathbb{E}[X_i](e^t - 1))$$
5. Multiplying across all $i$:
   $$\mathbb{E}[e^{tX}] \le \prod_{i=1}^n \exp(\mathbb{E}[X_i](e^t - 1)) = \exp\left( (e^t - 1) \sum_{i=1}^n \mathbb{E}[X_i] \right) = e^{(e^t - 1)\mu}$$
6. Substituting back into the Markov bound:
   $$\Pr(X \ge (1 + \delta)\mu) \le \frac{e^{(e^t - 1)\mu}}{e^{t(1 + \delta)\mu}} = \exp\left( \mu \left( e^t - 1 - t(1 + \delta) \right) \right)$$
7. Minimizing the exponent with respect to $t$ yields $t = \ln(1 + \delta) > 0$. Substituting this optimal $t$:
   $$e^t - 1 - t(1 + \delta) = (1 + \delta) - 1 - (1 + \delta)\ln(1 + \delta) = \delta - (1 + \delta)\ln(1 + \delta)$$
   Exponentiating gives the exact multiplicative bound:
   $$\Pr(X \ge (1 + \delta)\mu) \le \left( \frac{e^\delta}{(1 + \delta)^{1 + \delta}} \right)^\mu \quad \blacksquare$$

#### Standard Simplified Working Forms (Slide 39):
In algorithm analysis, evaluating $(e^\delta / (1+\delta)^{1+\delta})^\mu$ directly is cumbersome. We utilize two standard analytical simplifications:
1. **Two-Sided Symmetric Bound ($0 < \delta \le 1$):**
   $$\Pr(|X - \mu| \ge \delta \mu) \le 2 \exp\left( -\frac{\delta^2 \mu}{3} \right)$$
2. **Large Deviation Bound ($\delta > 1$):**
   $$\Pr(X \ge (1 + \delta)\mu) \le \exp\left( -\frac{\delta \mu}{3} \right)$$

---

### 4.4 Comparative Showdown: Chebyshev vs. Chernoff on Balls-into-Bins (Slide 40)

To showcase the immense power of exponential concentration over polynomial bounds, consider the following canonical benchmark:

> **Benchmark Experiment:**
> Throw $m = 10 n \ln n$ balls independently and uniformly at random into $n$ bins.
> Focus on **Bin $\#2$**. Let $X$ denote the total number of balls landing in Bin $\#2$.
> How tightly does $X$ concentrate around its expected value under **Chebyshev's Inequality** versus **Chernoff's Bound**?

#### Mathematical Setup
- Indicator for ball $i$ landing in Bin $\#2$:
  $$X_i = \begin{cases} 1 & \text{with probability } 1/n \\ 0 & \text{with probability } 1 - 1/n \end{cases}$$
- Expected occupancy $\mu$:
  $$\mu = \mathbb{E}[X] = \sum_{i=1}^{10 n \ln n} \mathbb{E}[X_i] = (10 n \ln n) \cdot \frac{1}{n} = 10 \ln n$$
- Variance $\text{Var}(X)$ (using mutual independence of ball throws):
  $$\text{Var}(X) = \sum_{i=1}^{10 n \ln n} \text{Var}(X_i) = (10 n \ln n) \cdot \frac{1}{n}\left(1 - \frac{1}{n}\right) = 10 \ln n \left(1 - \frac{1}{n}\right) \approx 10 \ln n$$
- Standard deviation: $\sigma \approx \sqrt{10 \ln n}$.

#### 1. Chebyshev's Estimate (Polynomial / Logarithmic Decay)
Set the deviation threshold to $\alpha = \sqrt{\ln n}$ standard deviations:
$$\text{Threshold } k = \alpha \sigma = \sqrt{\ln n} \cdot \sqrt{10 \ln n} = \sqrt{10} \ln n$$
Applying Chebyshev's inequality:
$$\Pr(|X - \mu| \ge \alpha \sigma) \le \frac{1}{\alpha^2} = \frac{1}{(\sqrt{\ln n})^2} = \frac{1}{\ln n}$$
- **Critique of Chebyshev:** The failure probability decays only at the rate of $\mathcal{O}(1/\log n)$. Because logarithmic functions grow extraordinarily slowly, for $n = 10^6$, $\ln(10^6) \approx 13.8$, meaning the failure bound is $\approx \frac{1}{13.8} \approx 7.2\%$. This is far too loose to establish high-probability algorithmic correctness!

#### 2. Chernoff's Estimate (Exponential Decay)
Apply the two-sided Chernoff bound with a relative deviation $\delta = 0.5$ (deviating by $50\%$ from the mean $\mu = 10 \ln n$):
$$\Pr(|X - \mu| \ge 0.5 \mu) \le 2 \exp\left( -\frac{\delta^2 \mu}{3} \right)$$
Substitute $\delta = 0.5$ and $\mu = 10 \ln n$:
$$\frac{\delta^2 \mu}{3} = \frac{(0.5)^2 \cdot 10 \ln n}{3} = \frac{0.25 \cdot 10}{3} \ln n = \frac{2.5}{3} \ln n \approx 0.833 \ln n$$
*(Using the standard lecture demonstration approximation $\frac{\delta^2}{3} \approx \frac{1}{4}$ yields an exponent of $2.5 \ln n$)*:
$$\Pr(|X - \mu| \ge 0.5 \mu) \le 2 \exp(-2.5 \ln n) = 2 \left( e^{\ln n} \right)^{-2.5} = 2 n^{-2.5} = \mathcal{O}\left( \frac{1}{n^{2.5}} \right)$$

#### The Dramatic Contrast & The Union Bound Amplification
Look at the profound gap between the two bounds:
- **Chebyshev:** Failure probability $\le \frac{1}{\ln n}$ (cannot even beat $1/n$).
- **Chernoff:** Failure probability $\le \mathcal{O}\left( \frac{1}{n^{2.5}} \right)$ (exponentially small).

Now, consider **all $n$ bins simultaneously**. Applying the Union Bound across all $n$ bins:
$$\Pr(\exists \text{ any bin deviating by } > 50\%) \le \sum_{j=1}^n \Pr(\text{bin } j \text{ deviates}) \le n \cdot \mathcal{O}\left( \frac{1}{n^{2.5}} \right) = \mathcal{O}\left( \frac{1}{n^{1.5}} \right) \to 0$$
- **Conclusion:** With probability at least $1 - \mathcal{O}(n^{-1.5}) \approx 100\%$, **every single one of the $n$ bins simultaneously holds approximately $10 \ln n$ balls**!
Chernoff bound transforms a problem that Chebyshev could not solve into an overwhelming high-probability guarantee.

---

### 4.5 The Union Bound & High-Probability Non-Empty Bins Theorem (Slide 41–42)

> **Theorem (Union Bound / Boole's Inequality):**
> For any finite or countable sequence of events $A_1, A_2, \dots, A_m$ (which need **not** be independent):
>
> $$\Pr\left( \bigcup_{i=1}^m A_i \right) \le \sum_{i=1}^m \Pr(A_i)$$

#### The "Bad Events" Algorithmic Framework
In scalable algorithm design, the standard technique to prove that an algorithm succeeds with high probability ($1 - \delta$) is:
1. Identify all conceivable ways the algorithm could fail as a collection of "bad events" $A_1, A_2, \dots, A_m$.
2. Bound the individual marginal failure probability $\Pr(A_i)$ using concentration inequalities.
3. Apply the Union Bound to prove that $\sum_{i=1}^m \Pr(A_i) \le \delta \ll 1$.

```
Sample Space Omega
+-------------------------------------------------------------+
|                                                             |
|          +------------+       +------------+                |
|          | Bad Event  |       | Bad Event  |                |
|          |    A_1     |       |    A_2     |                |
|          +------------+       +------------+                |
|                                                             |
|   Union Bound: Pr(A_1 U A_2 U ... U A_m) <= sum Pr(A_i)     |
|   If sum Pr(A_i) <= 1/n, Algorithm SUCCEEDS with Pr >= 1 - 1/n!
+-------------------------------------------------------------+
```

> **Theorem (High-Probability Non-Empty Bins Theorem - Slide 42):**
> If $m = 10 n \ln n$ balls are thrown independently and uniformly at random into $n$ bins, the probability that **at least one bin remains empty** is at most $n^{-9}$. Consequently, with probability at least $1 - n^{-9}$, **every single bin contains at least one ball**.

*Proof:*
1. **Define the Bad Events:**
   Let $A_i$ denote the bad event: *"Bin $i$ receives zero balls (Bin $i$ is empty)"*.
2. **Single Bin Failure Probability:**
   A single ball misses Bin $i$ with probability $1 - 1/n$.
   Since all $m = 10 n \ln n$ balls are thrown independently:
   $$\Pr(A_i) = \left( 1 - \frac{1}{n} \right)^m = \left( 1 - \frac{1}{n} \right)^{10 n \ln n}$$
3. **Calculus Limit Approximation:**
   Using the standard exponential bound $(1 - 1/n)^n \le e^{-1}$:
   $$\Pr(A_i) = \left[ \left( 1 - \frac{1}{n} \right)^n \right]^{10 \ln n} \le \left( \frac{1}{e} \right)^{10 \ln n} = e^{-10 \ln n} = (e^{\ln n})^{-10} = n^{-10} = \frac{1}{n^{10}}$$
4. **Union Across All Bins:**
   The algorithm fails if *there exists at least one empty bin*, which is represented by the union $\bigcup_{i=1}^n A_i$.
   Applying the Union Bound:
   $$\Pr(\exists \text{ empty bin}) = \Pr\left( \bigcup_{i=1}^n A_i \right) \le \sum_{i=1}^n \Pr(A_i) \le \sum_{i=1}^n \frac{1}{n^{10}} = n \cdot \frac{1}{n^{10}} = \frac{1}{n^9}$$
5. **Complementary Success Guarantee:**
   $$\Pr(\text{No empty bins}) = 1 - \Pr\left( \bigcup_{i=1}^n A_i \right) \ge 1 - \frac{1}{n^9} \quad \blacksquare$$

#### Venn Diagrams & The Inclusion-Exclusion Resolution: Why Overlapping Empty Bins Don't Hurt
A natural objection arises: *what about situations where multiple bins are empty simultaneously (e.g., Bin 1 AND Bin 2 are both empty)? Did we fail to account for them?*

The answer reveals the foundational elegance of the Union Bound: **multiple overlapping failure events were not omitted; they were deliberately overcounted!**

Recall the **Inclusion-Exclusion Principle** for set unions:
$$\Pr(A_1 \cup A_2) = \Pr(A_1) + \Pr(A_2) - \Pr(A_1 \cap A_2)$$
- The exact true probability of a union requires **subtracting** the overlapping intersections ($\Pr(A_1 \cap A_2)$).
- The Union Bound simply drops the negative subtraction terms:
  $$\Pr(A_1 \cup A_2) \le \Pr(A_1) + \Pr(A_2)$$
- **Pessimistic Overcounting:**
  If a catastrophic outcome occurs where both Bin 1 and Bin 2 are empty, in reality this represents only **one** failure event. However, in the sum $\sum \Pr(A_i)$:
  - $\Pr(A_1)$ counts this tragedy once.
  - $\Pr(A_2)$ counts this tragedy a second time.
  The right-hand side $\sum \Pr(A_i)$ **overestimates** the true probability of failure.
- **Why This Guarantees Safety:**
  Even under this deliberately pessimistic, exaggerated overcounting, the total failure probability is bounded by:
  $$\text{True Failure Probability} \le \text{Pessimistic Bound} \le \frac{1}{n^9}$$
  For $n = 100$, $1/n^9 = 10^{-18}$—lower than the probability of cosmic ray hardware corruption.
  Because the pessimistic bound is already microscopic, the true algorithm is guaranteed to succeed **with high probability (w.h.p.)**.

This result formalizes the solution to the classic **Coupon Collector's Problem**: when collecting $n$ distinct coupons with uniform replacement, drawing $10 n \ln n = \Theta(n \log n)$ coupons guarantees collecting all $n$ coupons with overwhelming probability.

---

# Week 2 - Sublinear Query Algorithms: Counting, Variance Reduction, Probability Boosting, and Graph Edge Estimation

<draft>
- 1. The Query Algorithm Model & Oracle Abstraction
    - Black-box Oracle: Algorithm has access to an oracle Q, but cannot inspect the full input.
    - Query complexity = number of calls made to Q.
    - Decision vs. Search vs. Estimation problems.
    - Additive error vs. Multiplicative error: Additive (S +- eps n) vs Multiplicative ((1 +- eps) S).
- 2. Case Study 1: Counting Ones in an n-bit Binary String
    - Input x in {0, 1}^n, target S = sum x_i.
    - Additive (eps n)-approximation: sample k = O(1/eps^2) bits with replacement.
    - Unbiased estimator S_hat, expectation E[S_hat] = S, variance Var(S_hat) <= n^2 / (4k).
    - Chebyshev guarantee: k = 3 / (4 eps^2) guarantees error <= eps n with probability >= 2/3.
    - The Multiplicative Hardness Dilemma: Distinguishing S = 0 from S = 1 requires Omega(n) queries.
- 3. Universal Algorithmic Meta-Techniques
    - The Mean Trick (Variance Reduction): Average k independent runs of an unbiased estimator; variance drops from M to M/k while preserving expectation.
    - The Median Trick (Probability Boosting): Complete Chernoff-based proof that taking the median of k runs with success probability > 1/2 reduces error probability exponentially to 2 e^{-k/100}.
    - Combined Mean-Median Pipeline: Achieving (eps, delta)-approximations in O((M / (eps^2 A^2)) log(1/delta)) samples.
    - Solved Exercise (Slide 15): Boosting an estimator with Var(X) = alpha A to achieve |Y - A| < eps A with probability >= 1 - 1/n^2 using O((alpha / (eps^2 A)) log n) queries.
- 4. Graph Query Models & Edge Counting
    - Graph Query Models: Adjacency Matrix (Pair Query; dense graphs) vs. Adjacency List (Degree & Neighbor Query; sparse graphs).
    - Edge count identity: m = (1/2) sum d(v) = (1/2) n d_bar.
    - Additive error eps n^2: sample k = O(1/eps^2) random pairs.
    - Multiplicative (1 +- eps)-Approximation: Average degree estimation fails on star graphs (variance O(n d_bar)).
    - The Directed Degree Trick (Feige / Goldreich-Ron total order):
        - Definition of total order u < v based on degrees and indices.
        - Out-degree d'(u) to higher-ranked neighbors; identity sum d'(u) = m.
        - Estimator X: sample u, sample neighbor v; X = d(u) if u < v else 0; E[X] = m/n.
        - High-Degree / Low-Degree Partitioning: H = top sqrt(2m) vertices, L = rest.
        - Lemma 1: For all u in L, d(u) <= sqrt(2m).
        - Lemma 2: For all u in H, d'(u) <= sqrt(2m).
        - Variance bound proof: Var(X) <= O(n / sqrt(m)) (m/n)^2.
        - Sample complexity: O(n / (eps^2 sqrt(m))) when m is known.
    - Density-Sensitive Search (Guessing m):
        - Geometric guesses m' in {n^2, n^2/2, ..., 1}; stopping threshold estimate > 1.5 m'.
        - Geometric series summation: O(n / (eps^2 sqrt(m))).
        - Boosting via median trick: O((n log log n) / (eps^2 sqrt(m))) queries with overall success >= 1 - O(1/log n).
- 5. Connected Components Estimation
    - Chazelle, Rubinfeld, Trevisan (2005): c(G) = sum 1 / |C_u|.
    - Bounded component size |C_u| <= 100: BFS from random vertices yields O(n / eps^2) query complexity.
    - Extension to general graphs via truncated BFS.
</draft>

## 1. The Query Algorithm Model & Oracle Abstraction

### 1.1 The Black-Box Oracle Interface

In massive data systems, reading the entire input dataset into physical memory requires $\Omega(n)$ operations, which is prohibitively slow. The **Query Algorithm** framework abstracts this challenge by restricting algorithmic access to a localized **Oracle**:

```
+-------------------------------------------------------------------------------+
|                            QUERY ALGORITHM MODEL                              |
+-------------------------------------------------------------------------------+
|                                                                               |
|   +-------------------+      Query: q in Q        +-----------------------+   |
|   |  Sublinear-Time   | ------------------------> |     DATA ORACLE       |   |
|   |     Algorithm     | <------------------------ |  (Full dataset in     |   |
|   +-------------------+      Answer: A(q)         |   external storage)   |   |
|             |                                     +-----------------------+   |
|             v                                                                 |
|   Output: Statistic S_hat (Additive or Multiplicative Approximation)           |
+-------------------------------------------------------------------------------+
```

1. **Information Scarcity:** Initially, the algorithm possesses zero knowledge regarding the input contents.
2. **Oracle Access:** The algorithm interacts with the input exclusively by submitting **queries** $q \in \mathcal{Q}$ and receiving deterministic or stochastic responses $A(q)$.
3. **Complexity Metric:** The primary measure of computational cost is **Query Complexity**—the total number of queries submitted to the oracle before outputting an answer.
4. **Algorithmic Output:** Because the algorithm inspects only a vanishing fraction of the input ($o(n)$ entries), it outputs an **approximate statistic** $\hat{S}$ that is provably close to the true parameter $S$.

---

### 1.2 Additive vs. Multiplicative Approximation

When designing query estimators, the formal definition of "approximation" fundamentally dictates algorithmic tractability:

```
+-----------------------------------+---------------------------------------------------+
| Approximation Type                | Mathematical Guarantee                            |
+-----------------------------------+---------------------------------------------------+
| Additive Approximation            | $| \hat{S} - S | \le \epsilon \cdot n$            |
| Multiplicative Approximation      | $(1 - \epsilon) S \le \hat{S} \le (1 + \epsilon) S|
+-----------------------------------+---------------------------------------------------+
```

- **Additive Approximation:** Guarantees that the error is bounded relative to the **maximum possible scale of the universe** ($n$ or $n^2$). While often achievable with $\mathcal{O}(1/\epsilon^2)$ queries via uniform sampling, additive bounds become **vacuous** when the true target $S$ is sparse ($S = o(n)$).
- **Multiplicative Approximation:** Guarantees that the error is proportional to the **true underlying value** $S$ itself. Multiplicative estimates remain meaningful across all density scales, but are significantly harder to achieve and frequently require structural assumptions (such as connectivity).

---

## 2. Case Study 1: Counting Ones in an $n$-bit Binary String

Consider the canonical counting problem:
- **Input:** An $n$-bit binary string $x = (x_1, x_2, \dots, x_n) \in \{0, 1\}^n$.
- **Target Parameter:** The exact count of ones: $S = \sum_{i=1}^n x_i$.
- **Oracle:** Given index $i \in \{1, \dots, n\}$, return bit $x_i \in \{0, 1\}$.

### 2.1 Additive $(\epsilon n)$-Approximation via Random Sampling

An exact calculation of $S$ requires querying all $n$ bits. However, an **additive $(\epsilon n)$-approximation** can be computed in $\mathcal{O}(1/\epsilon^2)$ sublinear time independent of $n$!

#### Algorithm:
1. Sample $k$ indices $j_1, j_2, \dots, j_k$ uniformly and independently at random from $\{1, 2, \dots, n\}$ with replacement.
2. Query the oracle for each sampled bit $x_{j_i}$.
3. Let $c = \sum_{i=1}^k x_{j_i}$ be the observed number of ones.
4. Output the scaled estimator:
   $$\hat{S} = \frac{n}{k} \cdot c = \frac{n}{k} \sum_{i=1}^k x_{j_i}$$

#### Theoretical Analysis:
1. **Unbiasedness:**
   For each sample $i \in \{1, \dots, k\}$, the probability that the sampled bit is 1 is $p = S/n$.
   $$\mathbb{E}[x_{j_i}] = 1 \cdot p + 0 \cdot (1 - p) = \frac{S}{n}$$
   By linearity of expectation:
   $$\mathbb{E}[\hat{S}] = \frac{n}{k} \sum_{i=1}^k \mathbb{E}[x_{j_i}] = \frac{n}{k} \cdot k \cdot \frac{S}{n} = S$$
   The estimator $\hat{S}$ is strictly **unbiased**.
2. **Variance Derivation:**
   Since each sample is drawn independently:
   $$\text{Var}(x_{j_i}) = \mathbb{E}[x_{j_i}^2] - (\mathbb{E}[x_{j_i}])^2 = p - p^2 = p(1 - p) \le \frac{1}{4}$$
   Using the variance scaling identity $\text{Var}(c X) = c^2 \text{Var}(X)$:
   $$\text{Var}(\hat{S}) = \text{Var}\left( \frac{n}{k} \sum_{i=1}^k x_{j_i} \right) = \frac{n^2}{k^2} \sum_{i=1}^k \text{Var}(x_{j_i}) = \frac{n^2}{k^2} \cdot k \cdot p(1 - p) = \frac{n^2 p(1 - p)}{k} \le \frac{n^2}{4k}$$
3. **Chebyshev Error Guarantee:**
   Applying Chebyshev's inequality for deviation $\epsilon n$:
   $$\Pr(|\hat{S} - S| \ge \epsilon n) \le \frac{\text{Var}(\hat{S})}{(\epsilon n)^2} \le \frac{n^2 / 4k}{\epsilon^2 n^2} = \frac{1}{4 k \epsilon^2}$$
4. **Setting Sample Size $k$:**
   To guarantee that the estimator succeeds with probability at least $2/3$ (failure probability $\le 1/3$):
   $$\frac{1}{4 k \epsilon^2} \le \frac{1}{3} \implies k \ge \frac{3}{4 \epsilon^2} = \mathcal{O}\left( \frac{1}{\epsilon^2} \right)$$
   Thus, taking $k = \mathcal{O}(1/\epsilon^2)$ uniform samples guarantees an additive $(\epsilon n)$-approximation with success probability $\ge 2/3$, **completely independent of string length $n$**!

---

### 2.2 The Multiplicative Hardness Dilemma

Can we obtain a **multiplicative $(1 \pm \epsilon)$-approximation** using $o(n)$ queries for arbitrary binary strings?

> **Theorem (Multiplicative Hardness for Sparse Strings):**
> Any randomized algorithm that achieves a multiplicative $(1 \pm \epsilon)$-approximation of $S = \sum x_i$ with success probability $\ge 2/3$ on general binary strings requires $\Omega(n)$ queries.

*Proof Intuition (Slide 19):*
Consider distinguishing between two input instances:
- Instance $\mathcal{I}_0$: The all-zero string $x = 0^n$, where $S = 0$.
- Instance $\mathcal{I}_1$: A string containing exactly one 1 at an unknown position $j^*$, where $S = 1$.
A multiplicative approximation requires outputting $\hat{S} = 0$ for $\mathcal{I}_0$ and $\hat{S} \in [1-\epsilon, 1+\epsilon] > 0$ for $\mathcal{I}_1$. Hence, the algorithm must distinguish whether a 1 exists.
However, because the single 1 can occupy any of the $n$ indices uniformly, any algorithm making $q < n/2$ queries hits the 1 with probability at most $q/n < 1/2$. Therefore, no algorithm can distinguish $S=0$ from $S=1$ without making $\Omega(n)$ queries!

---

## 3. Universal Algorithmic Meta-Techniques

In randomized and sublinear algorithms, basic estimators often suffer from high variance or weak constant confidence. Two universal meta-techniques—the **Mean Trick** and the **Median Trick**—systematically enhance any primitive estimator into an industrial-grade $(\epsilon, \delta)$-approximation.

```
+-------------------------------------------------------------------------------+
|                      ESTIMATOR ENHANCEMENT PIPELINE                           |
+-------------------------------------------------------------------------------+
|                                                                               |
|   [ Base Estimator X ] ----> MEAN TRICK (k_1 runs) ----> [ Variance Dampened ]|
|   E[X] = A, Var(X) = M       Average: X_bar               Var = M / k_1       |
|                                                                 |             |
|                                                                 v             |
|   [ High-Confidence ] <---- MEDIAN TRICK (k_2 runs) <-----------+             |
|   Failure Pr <= delta       Median of independent copies                      |
|                                                                               |
+-------------------------------------------------------------------------------+
```

---

### 3.1 The Mean Trick: Linear Variance Reduction (Slide 12)

The **Mean Trick** reduces the variance of an unbiased estimator by taking the arithmetic average of multiple independent executions:

> **Theorem (Mean Trick):**
> Let $X$ be an unbiased estimator for an unknown target parameter $A$, such that $\mathbb{E}[X] = A$ and $\text{Var}(X) = M$.
> If we execute the estimator independently $k$ times, obtaining $X_1, X_2, \dots, X_k$, and compute their empirical average:
>
> $$\bar{X} = \frac{1}{k} \sum_{i=1}^k X_i$$
>
> Then $\bar{X}$ remains strictly unbiased, and its variance is reduced by a factor of $k$:
>
> $$\mathbb{E}[\bar{X}] = A, \quad \text{Var}(\bar{X}) = \frac{M}{k}$$

*Proof:*
1. By linearity of expectation:
   $$\mathbb{E}[\bar{X}] = \mathbb{E}\left[ \frac{1}{k} \sum_{i=1}^k X_i \right] = \frac{1}{k} \sum_{i=1}^k \mathbb{E}[X_i] = \frac{1}{k} \cdot k A = A$$
2. Because the runs $X_1, \dots, X_k$ are mutually independent, all cross-covariance terms vanish ($\text{Cov}(X_i, X_j) = 0$ for $i \neq j$):
   $$\text{Var}(\bar{X}) = \text{Var}\left( \frac{1}{k} \sum_{i=1}^k X_i \right) = \frac{1}{k^2} \sum_{i=1}^k \text{Var}(X_i) = \frac{1}{k^2} \cdot k M = \frac{M}{k} \quad \blacksquare$$

---

### 3.2 The Median Trick: Exponential Probability Boosting (Slide 13–14)

While the Mean Trick dampens variance, Chebyshev's inequality guarantees only polynomial tail decay. To amplify confidence exponentially, we apply the **Median Trick**:

> **Theorem (Median Trick):**
> Suppose an estimation algorithm produces an estimate $X$ such that:
>
> $$\Pr(|X - A| > \epsilon) \le \frac{1}{3}$$
>
> If we execute the algorithm independently $k$ times to obtain $X_1, X_2, \dots, X_k$, and output the **sample median**:
>
> $$\hat{A} = \text{median}(X_1, X_2, \dots, X_k)$$
>
> Then the probability that $\hat{A}$ deviates from $A$ by more than $\epsilon$ decreases **exponentially** in $k$:
>
> $$\Pr(|\hat{A} - A| > \epsilon) \le 2 \exp\left( -\frac{k}{100} \right)$$

*Rigorous Mathematical Proof via Chernoff Bound:*
1. **Condition for Median Failure:**
   The sample median $\hat{A}$ deviates from $A$ by more than $\epsilon$ (i.e., $\hat{A} > A + \epsilon$ or $\hat{A} < A - \epsilon$) **if and only if** strictly more than half of the individual estimates deviate by more than $\epsilon$.
2. **Upper Tail Analysis:**
   For each trial $i \in \{1, \dots, k\}$, define the failure indicator:
   $$Y_i = \begin{cases} 1 & \text{if } X_i > A + \epsilon \\ 0 & \text{otherwise} \end{cases}$$
   Each $Y_i$ is a Bernoulli random variable with success parameter $p_i = \Pr(X_i > A + \epsilon) \le 1/3$.
   Let $Y = \sum_{i=1}^k Y_i$ denote the total number of estimates that overestimate by $> \epsilon$.
   The expected number of overestimating trials is:
   $$\mu = \mathbb{E}[Y] = \sum_{i=1}^k \Pr(Y_i = 1) \le \frac{k}{3}$$
3. **Chernoff Bound Application:**
   The median exceeds $A + \epsilon$ if and only if $Y \ge k/2$. Expressing $k/2$ in terms of $\mu$:
   $$\frac{k}{2} = \left( 1 + \frac{1}{2} \right) \frac{k}{3} \ge (1 + \delta)\mu \quad \text{with } \delta = \frac{1}{2}$$
   Applying the standard multiplicative Chernoff bound $\Pr(Y \ge (1+\delta)\mu) \le \exp(-\delta^2 \mu / 3)$:
   $$\Pr\left( Y \ge \frac{k}{2} \right) \le \exp\left( -\frac{(1/2)^2 \cdot (k/3)}{3} \right) = \exp\left( -\frac{k/12}{3} \right) = \exp\left( -\frac{k}{36} \right) < \exp\left( -\frac{k}{100} \right)$$
4. **Lower Tail Analysis:**
   Symmetrically, define indicator $Z_i = \mathbb{I}[X_i < A - \epsilon]$ and $Z = \sum Z_i$. By identical logic:
   $$\Pr\left( Z \ge \frac{k}{2} \right) \le \exp\left( -\frac{k}{36} \right) < \exp\left( -\frac{k}{100} \right)$$
5. **Union Bound Combination:**
   The median $\hat{A}$ fails if and only if $Y \ge k/2$ or $Z \ge k/2$. By the Union Bound:
   $$\Pr(|\hat{A} - A| > \epsilon) \le \Pr\left( Y \ge \frac{k}{2} \right) + \Pr\left( Z \ge \frac{k}{2} \right) \le 2 \exp\left( -\frac{k}{100} \right) \quad \blacksquare$$

**Takeaway:**
Taking the median of $k = \mathcal{O}(\log(1/\delta))$ independent runs drives the failure probability from a modest constant $1/3$ down to an arbitrarily small $\delta > 0$!

---

### 3.3 Solved Exercise: Variance-Scaling Probability Boosting (Slide 15)

> **Exercise:**
> Suppose we have an unbiased estimation algorithm such that $\mathbb{E}[X] = A$ and $\text{Var}(X) = \alpha \cdot A$.
> How can we construct an estimator $Y$ such that $\Pr(|Y - A| \ge \epsilon A) \le \frac{1}{n^2}$?

**Two-Stage Solution:**

#### Stage 1: Variance Reduction via the Mean Trick
To apply the Median Trick, we first need an estimator whose relative error is bounded with constant probability $\le 1/3$.
- Run the base estimator $k_1$ times independently and compute their average $\bar{X} = \frac{1}{k_1} \sum_{i=1}^{k_1} X_i$.
- $\mathbb{E}[\bar{X}] = A$, and $\text{Var}(\bar{X}) = \frac{\alpha A}{k_1}$.
- By Chebyshev's inequality:
  $$\Pr(|\bar{X} - A| \ge \epsilon A) \le \frac{\text{Var}(\bar{X})}{(\epsilon A)^2} = \frac{\alpha A / k_1}{\epsilon^2 A^2} = \frac{\alpha}{k_1 \epsilon^2 A}$$
- To ensure this error probability is at most $1/3$:
  $$\frac{\alpha}{k_1 \epsilon^2 A} \le \frac{1}{3} \implies k_1 = \left\lceil \frac{3\alpha}{\epsilon^2 A} \right\rceil$$

#### Stage 2: Probability Boosting via the Median Trick
Now that $\bar{X}$ satisfies $\Pr(|\bar{X} - A| \ge \epsilon A) \le 1/3$, we amplify its success probability using the Median Trick:
- Run Stage 1 independently $k_2$ times to obtain $\bar{X}^{(1)}, \bar{X}^{(2)}, \dots, \bar{X}^{(k_2)}$.
- Output the median: $Y = \text{median}(\bar{X}^{(1)}, \dots, \bar{X}^{(k_2)})$.
- By the Median Trick Theorem, the failure probability is bounded by:
  $$\Pr(|Y - A| \ge \epsilon A) \le 2 \exp\left( -\frac{k_2}{100} \right)$$
- To achieve failure probability $\le 1/n^2$:
  $$2 \exp\left( -\frac{k_2}{100} \right) \le \frac{1}{n^2} \implies \frac{k_2}{100} \ge \ln(2 n^2) = 2 \ln n + \ln 2 \implies k_2 = \lceil 200 \ln n + 70 \rceil = \mathcal{O}(\log n)$$

#### Total Sample Complexity:
$$\text{Total Runs} = k_1 \cdot k_2 = \mathcal{O}\left( \frac{\alpha}{\epsilon^2 A} \cdot \log n \right)$$

---

## 4. Graph Query Models & Edge Counting

Graph algorithms at scale operate over massive networks where reading all vertices and edges is computationally impossible.

### 4.1 Graph Query Oracles (Slide 16)

```
+------------------------------------+------------------------------------------+
| Adjacency-Matrix Model             | Adjacency-List Model                     |
+------------------------------------+------------------------------------------+
| - Pair Query: Given vertices u, v, | - Degree Query: Given vertex v, return   |
|   return whether (u, v) in E.      |   degree d(v).                           |
| - Best for DENSE graphs (|E|~n^2). | - Neighbor Query: Given vertex v and     |
| - Cannot find neighbors without    |   index i, return i-th neighbor.         |
|   scanning all n vertices.         | - Best for SPARSE graphs (|E|~n).        |
+------------------------------------+------------------------------------------+
```

---

### 4.2 Additive Edge Estimation in Dense Graphs (Slide 17–18)

Let $G = (V, E)$ be an unweighted graph with $n = |V|$ vertices and $m = |E|$ edges.
- Total possible unordered vertex pairs: $N = \binom{n}{2} = \frac{n(n-1)}{2} \approx \frac{n^2}{2}$.
- An edge exists between a randomly chosen pair with probability $p = m / \binom{n}{2}$.

#### Additive Estimation Algorithm:
1. Sample $k$ unordered vertex pairs $\{u_i, v_i\}$ uniformly at random with replacement.
2. Query the pair oracle for each pair. Let $X$ be the number of edges detected.
3. Output $\hat{m} = X \cdot \frac{\binom{n}{2}}{k}$.

By identical analysis to binary string counting:
$$\text{Var}(\hat{m}) \le \frac{\binom{n}{2}^2}{4k} \approx \frac{n^4}{16k}$$
Applying Chebyshev's inequality, to ensure additive error $|\hat{m} - m| \le \epsilon n^2$ with probability $\ge 2/3$:
$$\Pr(|\hat{m} - m| \ge \epsilon n^2) \le \frac{n^4 / 16k}{\epsilon^2 n^4} = \frac{1}{16 k \epsilon^2} \le \frac{1}{3} \implies k = \mathcal{O}\left( \frac{1}{\epsilon^2} \right)$$
For a failure probability bounded by $\delta$, the Median Trick amplifies this to $\mathcal{O}\left( \frac{1}{\epsilon^2} \log\left( \frac{1}{\delta} \right) \right)$ pair queries.

---

### 4.3 Multiplicative Edge Estimation in Connected Graphs

In sparse graphs (where $m = \mathcal{O}(n)$), an additive error of $\epsilon n^2$ is vastly larger than $m$ itself, rendering the estimate completely useless. To achieve a **multiplicative $(1 \pm \epsilon)$-approximation**, we assume $G$ is **connected** ($m \ge n - 1$) and utilize the **Adjacency-List Model**.

#### Why Simple Vertex Sampling Fails (Slide 20):
The total edge count satisfies $m = \frac{1}{2} \sum_{v \in V} d(v) = \frac{n \bar{d}}{2}$.
If we sample a vertex $v$ uniformly at random and query $d(v)$:
- $\mathbb{E}[d(v)] = \bar{d}$.
- In a **star graph** $K_{1, n-1}$, one hub has degree $n-1$ while $n-1$ leaves have degree 1:
  $$\mathbb{E}[d(v)^2] = \frac{1}{n}(n-1)^2 + \frac{n-1}{n}(1^2) \approx n$$
  $$\text{Var}(d(v)) \approx n - \bar{d}^2 = \mathcal{O}(n)$$
  The variance-to-mean-squared ratio is:
  $$\frac{\text{Var}(d(v))}{(\mathbb{E}[d(v)])^2} = \frac{\mathcal{O}(n)}{4} = \mathcal{O}(n)$$
  By Chebyshev's inequality, estimating $\bar{d}$ requires $\mathcal{O}(n / \epsilon^2)$ samples—no better than inspecting the entire graph!

---

### 4.4 The Directed Degree Trick (Feige / Goldreich-Ron)

To break the star graph variance barrier, we impose an artificial **total ordering** on the vertices to orient all undirected edges into directed edges:

> **Definition (Total Vertex Order - Slide 21):**
> For any two distinct vertices $u, v \in V$, define $u < v$ if and only if:
> 1. $d(u) < d(v)$, OR
> 2. $d(u) = d(v)$ and $\text{ID}(u) < \text{ID}(v)$.

For each vertex $u$, define its **directed out-degree** $d'(u)$ as the number of neighbors that rank strictly higher than $u$:
$$d'(u) = |\{ v \in N(u) : u < v \}|$$

```
Undirected Edge (u, v):
        d(u) = 2                   d(v) = 5
       +--------+                 +--------+
       |   u    | --------------> |   v    |   Oriented: u < v
       +--------+                 +--------+
      Contributes to:            Contributes to:
        d'(u) = +1                 d'(v) = 0
```

> **Fundamental Invariant:**
> Every undirected edge $(u, v) \in E$ has exactly one endpoint that ranks strictly lower than the other under the total order. Therefore:
>
> $$\sum_{u \in V} d'(u) = m$$

#### The Estimator $X$ (Slide 22):
1. Sample vertex $u$ uniformly at random from $V$ (probability $1/n$).
2. Query degree $d(u)$.
3. Choose neighbor index $k \in \{1, 2, \dots, d(u)\}$ uniformly at random.
4. Query the $k$-th neighbor $v = \text{Neighbor}(u, k)$, and query $d(v)$.
5. If $u < v$, set $X = d(u)$; otherwise set $X = 0$.

**Expectation:**
$$\mathbb{E}[X] = \frac{1}{n} \sum_{u \in V} d(u) \cdot \Pr(u < v \mid u) = \frac{1}{n} \sum_{u \in V} d(u) \cdot \frac{d'(u)}{d(u)} = \frac{1}{n} \sum_{u \in V} d'(u) = \frac{m}{n}$$

---

### 4.5 Variance Analysis via Heavy/Light Decomposition (Slides 23–24)

To bound $\text{Var}(X)$, we partition the vertex set into **Heavy ($H$)** and **Light ($L$)** vertices:
- Let $H \subset V$ be the set of the $\lceil \sqrt{2m} \rceil$ highest-ranked vertices in the total order.
- Let $L = V \setminus H$ be the remaining low-degree vertices.

```
Total Vertex Order:
[ Smallest Degree ] -----------------------------------------> [ Largest Degree ]
+-----------------------------------------------+-------------------------------+
|               Light Vertices L                |       Heavy Vertices H        |
|               (Degree <= sqrt(2m))            |       (|H| <= sqrt(2m))       |
+-----------------------------------------------+-------------------------------+
```

> **Lemma 1 (Light Vertex Degree Bound):**
> For every vertex $u \in L$, $d(u) \le \sqrt{2m}$.

*Proof:*
Suppose for contradiction that some vertex $u \in L$ had $d(u) > \sqrt{2m}$.
Because every vertex in $H$ ranks higher than $u$, every vertex in $H$ must also have degree at least $d(u) > \sqrt{2m}$.
Then the sum of degrees across the vertices in $H$ alone would be:
$$\sum_{v \in H} d(v) > |H| \cdot \sqrt{2m} = \sqrt{2m} \cdot \sqrt{2m} = 2m$$
This contradicts the fact that the sum of degrees over the *entire graph* is exactly $2m$. Thus $d(u) \le \sqrt{2m}$. $\blacksquare$

> **Lemma 2 (Heavy Vertex Out-Degree Bound):**
> For every vertex $u \in H$, $d'(u) \le \sqrt{2m}$.

*Proof:*
By definition, $d'(u)$ counts only neighbors of $u$ that rank strictly higher than $u$ in the total order.
Because $u \in H$, and $|H| \le \sqrt{2m}$, there are at most $\sqrt{2m}$ vertices in the entire graph that rank higher than $u$.
Consequently, $d'(u) \le |H| \le \sqrt{2m}$. $\blacksquare$

#### Bounding the Second Moment $\mathbb{E}[X^2]$:
$$\text{Var}(X) < \mathbb{E}[X^2] = \frac{1}{n} \sum_{u \in V} d(u)^2 \Pr(u < v \mid u) = \frac{1}{n} \sum_{u \in V} d(u) d'(u)$$
Split the summation across $L$ and $H$:
- For $u \in L$: $d(u) \le \sqrt{2m} \implies d(u) d'(u) \le \sqrt{2m} \cdot d'(u)$.
- For $u \in H$: $d'(u) \le \sqrt{2m} \implies d(u) d'(u) \le \sqrt{2m} \cdot d(u)$.

Summing across all vertices:
$$\sum_{u \in V} d(u) d'(u) \le \sum_{u \in L} \sqrt{2m} d'(u) + \sum_{u \in H} \sqrt{2m} d(u) \le \sqrt{2m} \sum_{u \in V} d'(u) + \sqrt{2m} \sum_{u \in V} d(u) = \sqrt{2m} \cdot m + \sqrt{2m} \cdot 2m = 3\sqrt{2} m^{3/2}$$
Substituting back into the expectation:
$$\mathbb{E}[X^2] \le \frac{3\sqrt{2} m^{3/2}}{n} = 3\sqrt{2} \cdot \frac{n}{\sqrt{m}} \cdot \left( \frac{m}{n} \right)^2 = \mathcal{O}\left( \frac{n}{\sqrt{m}} \right) \cdot (\mathbb{E}[X])^2$$

#### Sample Complexity when $m$ is Known:
$$\frac{\text{Var}(X)}{(\mathbb{E}[X])^2} \le \mathcal{O}\left( \frac{n}{\sqrt{m}} \right)$$
By Chebyshev's inequality, averaging $s = \mathcal{O}\left( \frac{n}{\epsilon^2 \sqrt{m}} \right)$ independent samples of $X$ yields an estimate $\bar{X}$ such that:
$$\Pr\left( \left| \bar{X} - \frac{m}{n} \right| \ge \epsilon \frac{m}{n} \right) \le \frac{1}{3}$$
Multiplying $\bar{X}$ by $n$ produces a $(1 \pm \epsilon)$-multiplicative estimate of $m$ using $\mathcal{O}\left( \frac{n}{\epsilon^2 \sqrt{m}} \right)$ queries!

---

### 4.6 Density-Sensitive Search: Guessing Unknown $m$ (Slides 25–27)

In practice, the true number of edges $m$ is unknown, so the algorithm cannot choose the optimal sample size $s = \Theta\left( \frac{n}{\epsilon^2 \sqrt{m}} \right)$ in advance. We resolve this via a **density-sensitive geometric search**:

```
Geometric Guesses for m':
  m' = n^2  ---->  m' = n^2 / 2  ---->  m' = n^2 / 4  ----> ... ----> m' = m / 2
  Sample size:     Sample size:         Sample size:                   Sample size:
  O(n / eps^2 n)   O(n / eps^2 sqrt(n^2/2))                             O(n / eps^2 sqrt(m))
  [ Tiny sample ]                                                      [ Stops here! ]
```

#### Algorithm:
1. Assume $\epsilon < 1/4$. Test descending geometric guesses:
   $$m' \in \left\{ n^2, \frac{n^2}{2}, \frac{n^2}{4}, \dots, 1 \right\}$$
2. For each guess $m'$, take $s_{m'} = \Theta\left( \frac{n}{\epsilon^2 \sqrt{m'}} \right)$ independent samples of $X$.
   Compute the empirical mean $\bar{X}$ and the edge estimate $\hat{m} = n \bar{X}$.
3. **Stopping Rule:** If $\hat{m} > 1.5 m'$, **HALT** and return $\hat{m}$ as the final estimate. Otherwise, proceed to $m' / 2$.

#### Correctness Analysis:
- **Case 1 ($m' > m$):**
  The true mean is $m/n$. With constant probability, the estimate satisfies $\hat{m} \le m + \epsilon m' < 1.5 m'$ (since $m < m'$ and $\epsilon < 0.25$). The algorithm does not halt prematurely.
- **Case 2 ($m' \le m$ and $m' \ge m/2$):**
  The sample size is now large enough to guarantee $|\hat{m} - m| \le \epsilon m$.
- **Case 3 ($m' < m/2$):**
  $\hat{m} \ge (1 - \epsilon) m > (1 - 0.25)(2 m') = 1.5 m'$. The condition $\hat{m} > 1.5 m'$ is triggered with high probability, and the search halts!

#### Total Query Complexity:
The total queries across all rounds sum as a geometrically increasing series:
$$\sum_{i=0}^{\log_2(n^2 / m)} \frac{n}{\epsilon^2 \sqrt{n^2 / 2^i}} = \frac{n}{\epsilon^2 \sqrt{m}} \left( 1 + \frac{1}{\sqrt{2}} + \frac{1}{2} + \frac{1}{2\sqrt{2}} + \dots \right) = \mathcal{O}\left( \frac{n}{\epsilon^2 \sqrt{m}} \right)$$

#### Full Probability Boosting via Median Trick (Slide 27):
To prevent any of the $\mathcal{O}(\log n)$ geometric rounds from failing:
1. For each round $m'$, repeat the test $k = \mathcal{O}(\log\log n)$ times and take the **median**.
2. By the Median Trick, the error probability of each round drops to:
   $$\delta_{\text{round}} \le \mathcal{O}\left( \frac{1}{\log^2 n} \right)$$
3. By the Union Bound across all $\mathcal{O}(\log n)$ rounds:
   $$\Pr(\text{Any round fails}) \le \mathcal{O}(\log n) \cdot \mathcal{O}\left( \frac{1}{\log^2 n} \right) = \mathcal{O}\left( \frac{1}{\log n} \right)$$
4. The total query complexity is:
   $$\mathcal{O}\left( \frac{n \log\log n}{\epsilon^2 \sqrt{m}} \right)$$

---

### 4.7 Take-Home Exercise: Number of Connected Components (Slide 28)

> **Problem:**
> Let $G$ be an unweighted graph in the adjacency-matrix model.
> Each connected component contains at most $B = 100$ vertices.
> Output an estimate of the total number of connected components $c(G)$ with additive error at most $\epsilon n$ using $\mathcal{O}(n/\epsilon^2)$ queries.

#### Chazelle-Rubinfeld-Trevisan Formulation (2005):
Let $\mathcal{C}$ be the collection of connected components of $G$. For any vertex $u$, let $C_u$ denote the connected component containing $u$.
Notice the mathematical identity:
$$c(G) = \sum_{C \in \mathcal{C}} 1 = \sum_{C \in \mathcal{C}} \sum_{u \in C} \frac{1}{|C|} = \sum_{u \in V} \frac{1}{|C_u|}$$

#### Algorithm for Bounded Component Size ($|C_u| \le 100$):
1. Sample $k = \mathcal{O}(1/\epsilon^2)$ vertices $u_1, u_2, \dots, u_k$ uniformly at random from $V$.
2. For each sampled vertex $u_i$, run Breadth-First Search (BFS) starting from $u_i$ to discover all vertices in $C_{u_i}$.
   Since $|C_{u_i}| \le 100$, each BFS makes at most $\binom{100}{2} < 5000 = \mathcal{O}(1)$ pair queries.
3. Compute the estimator:
   $$\hat{c} = \frac{n}{k} \sum_{i=1}^k \frac{1}{|C_{u_i}|}$$
4. **Analysis:**
   $$\mathbb{E}\left[ \frac{1}{|C_{u_i}|} \right] = \frac{1}{n} \sum_{u \in V} \frac{1}{|C_u|} = \frac{c(G)}{n}$$
   Since each variable $1/|C_{u_i}| \in (0, 1]$, by Chebyshev's inequality (or Chernoff bound), setting $k = \mathcal{O}(1/\epsilon^2)$ guarantees $|\hat{c} - c(G)| \le \epsilon n$ with probability $\ge 2/3$.
   Total query complexity is $k \cdot \mathcal{O}(1) = \mathcal{O}(1/\epsilon^2)$!

#### Extension to General Graphs (Unbounded Component Sizes):
If component sizes are unbounded, running full BFS on a large component would take $\Omega(n^2)$ queries.
- **Truncated BFS:** Stop the BFS as soon as it discovers $\lceil 2/\epsilon \rceil$ vertices.
- If $|C_u| \ge 2/\epsilon$, its true contribution $1/|C_u| \le \epsilon/2$. Replacing it with 0 incurs an additive error of at most $\epsilon/2$ per vertex, which sums to at most $(\epsilon/2)n$.
- Exploring up to $2/\epsilon$ vertices requires at most $\mathcal{O}(1/\epsilon^2)$ queries per sample.
- Total query complexity remains sublinear: $\mathcal{O}\left( \frac{1}{\epsilon^3} \right)$ or $\mathcal{O}\left( \frac{d}{\epsilon^2} \right)$ in bounded-degree graphs!

---
# Week 3 - Query Complexity Lower Bounds: Decision Trees, Yao's Minimax Principle, and Query Reductions

<draft>
- 1. Deterministic Decision Trees & Exact Query Complexity
    - Decision tree computational model: Internal query nodes, branches as oracle responses, leaves as boolean outputs.
    - Query complexity D(f) = depth of the optimal decision tree.
    - Adversary argument for the OR function: D(OR) = n (adversary returns 0 until n-th query).
- 2. Randomized Query Complexity & The Model of Computation
    - What is a randomized algorithm? A probability distribution over deterministic decision trees.
    - Random seed r ~ R; deterministic algorithm A_r in A; correctness Z(x, A_r); query cost Q(x, A_r).
    - Expected vs. Worst-Case Query Complexity: Converting expected T to worst-case O(T) via Markov runtime truncation (10T) and majority voting.
    - Definition of Randomized Query Complexity R(f): Min-max formulation achieving success >= 2/3.
- 3. Yao's Minimax Principle
    - Foundational conceptual shift: Moving randomness from the algorithm to the input distribution.
    - Distributional Query Complexity D_mu(f): Minimum depth of deterministic algorithm correct on distribution mu.
    - Yao's Minimax Principle Theorem: D_mu(f) <= R(f) for all mu, and max_mu D_mu(f) = R(f) via von Neumann Minimax Theorem.
    - Complete mathematical proof of D_mu(f) <= R(f) via expectation exchange and max upper bounding.
    - The 3-Step Recipe for proving randomized lower bounds.
- 4. Lower Bound Proof for the OR Function
    - Construction of hard distribution mu = 1/2 mu_0 + 1/2 mu_1: mu_0 is 0^n, mu_1 has a single 1 uniformly placed.
    - Analysis of deterministic algorithms with q < n/3 queries.
    - Bayes' theorem derivation: Posterior probability of 0 given all-zero transcript is < 3/5.
    - Success probability bounded by 3/5 + p/5 < 2/3.
    - Conclusion: R(OR) >= n/3 = Omega(n).
- 5. Lower Bound Proof for the XOR Function
    - Target: Parity of n bits.
    - Uniform distribution over all 2^n binary strings.
    - Any algorithm with < n queries leaves an unqueried bit with entropy 1; success probability is exactly 1/2 < 2/3.
    - Conclusion: R(XOR) = n.
- 6. Query Reductions & Graph Connectivity Lower Bound
    - Reduction theorem for query algorithms: R(B) >= R(A) / C.
    - Graph Connectivity (GC) lower bound: Reduction from OR on n^2 bits to GC on 2n vertices.
    - Disjoint cliques U and V connected only by edges corresponding to 1s in the OR instance.
    - Conclusion: R(GC) = Omega(n^2) in the adjacency-matrix model.
</draft>

## 1. Deterministic Decision Trees & Exact Query Complexity

To establish mathematical limits on what query algorithms can achieve, we model computation using **Decision Trees**.

### 1.1 The Decision Tree Computational Model (Slide 4)

Let $f: \{0, 1\}^n \to \{0, 1\}$ be a boolean function over an $n$-bit input $x = (x_1, x_2, \dots, x_n)$.
- A **Deterministic Decision Tree** $\mathcal{T}$ represents an adaptive query strategy:
  1. Each internal node is labeled by an index $i \in \{1, 2, \dots, n\}$, representing a query to $x_i$.
  2. Each internal node has two outgoing edges labeled $0$ and $1$, corresponding to the oracle's response.
  3. Each leaf node is labeled with a final output value in $\{0, 1\}$.
- **Execution:** On input $x$, execution starts at the root, evaluates the queried bit, follows the corresponding edge, and terminates at a leaf node outputting $\mathcal{T}(x)$.
- **Query Complexity of Tree $\mathcal{T}$:** The maximum number of queries made along any path from root to leaf, which equals the **tree height** $\text{height}(\mathcal{T})$.

```
                     [ Query x_1 ]
                     /           \
               x_1=0/             \x_1=1
                   v               v
             [ Query x_2 ]     [ Output 1 ]
             /           \
       x_2=0/             \x_2=1
           v               v
     [ Query x_3 ]     [ Output 1 ]
         ...
```

> **Definition (Deterministic Query Complexity):**
> The **deterministic query complexity** of a function $f$, denoted $D(f)$, is the minimum height of a deterministic decision tree that correctly computes $f(x)$ for all $x \in \{0, 1\}^n$:
>
> $$D(f) = \min_{\mathcal{T} \text{ computes } f} \text{height}(\mathcal{T})$$

---

### 1.2 Decision Tree Lower Bound for the OR Function (Slide 3–5)

Consider the **OR function**:
$$\text{OR}(x) = \bigvee_{i=1}^n x_i = \begin{cases} 1 & \text{if } \exists i \text{ such that } x_i = 1 \\ 0 & \text{if } x = 0^n \end{cases}$$

> **Theorem (Deterministic Lower Bound for OR):**
> Any deterministic algorithm that correctly decides $\text{OR}(x)$ on all inputs requires $n$ queries:
>
> $$D(\text{OR}) = n$$

*Proof via Adversary Argument (Slide 5):*
We construct an adaptive malicious **Adversary** that provides oracle answers dynamically:
1. Whenever the algorithm queries an index $x_i$, the adversary answers $x_i = 0$.
2. Suppose the algorithm terminates after querying $q < n$ indices without observing a 1, and outputs an answer:
   - If the algorithm outputs $0$: The adversary reveals that one of the $n - q$ unqueried indices has value $1$. The true OR is $1$, but the algorithm output $0$ (Error).
   - If the algorithm outputs $1$: The adversary reveals that all $n - q$ unqueried indices have value $0$. The true OR is $0$, but the algorithm output $1$ (Error).
3. In both cases, the algorithm fails. Therefore, every deterministic decision tree of depth $< n$ fails on at least one input. Thus $D(\text{OR}) = n$. $\blacksquare$

---

## 2. Randomized Query Complexity & The Model of Computation

Can **randomization** overcome the deterministic $\Omega(n)$ barrier for decision problems?

### 2.1 Formal Definition of a Randomized Algorithm (Slides 6–8)

A randomized query algorithm can be viewed as selecting random bits dynamically during execution. However, we can always **defer and consolidate all random choices to the beginning**:

> **Definition (Distribution over Decision Trees):**
> A randomized query algorithm is a pair $(\mathcal{A}, R)$, where $R$ is a probability distribution over random strings $r$, and each $r \in \text{supp}(R)$ deterministically specifies an entire decision tree $A_r \in \mathcal{A}$.
> At runtime, the algorithm samples $r \sim R$ once, and then executes the deterministic decision tree $A_r$ on input $x$.

```
                      Random Source R
                            |
                     Sample r ~ R
                            |
                            v
               [ Deterministic Tree A_r ]
               - Fixed query sequence
               - Evaluates input x
                            |
                            v
               Output A_r(x) in {0, 1}
```

**Evaluation Metrics:**
- **Correctness Indicator:**
  $$Z(x, A_r) = \begin{cases} 1 & \text{if } A_r(x) = f(x) \text{ (correct)} \\ 0 & \text{otherwise (error)} \end{cases}$$
- **Success Probability on Input $x$:**
  $$\Pr_{r \sim R}(A_r(x) = f(x)) = \mathbb{E}_{r \sim R}[Z(x, A_r)]$$
- **Query Count:** Let $Q(x, A_r)$ denote the number of queries executed by tree $A_r$ on input $x$.

---

### 2.2 Expected vs. Worst-Case Query Complexity (Slide 10)

Should we measure the query complexity of a randomized algorithm by its **expected** query count or its **worst-case** query count?

> **Theorem (Equivalence of Expected and Worst-Case Query Complexity):**
> Any randomized algorithm $(\mathcal{A}, R)$ that achieves expected query complexity $\max_x \mathbb{E}_r[Q(x, A_r)] \le T$ with success probability $\ge 2/3$ can be transformed into a randomized algorithm $(\mathcal{A}', R)$ with **worst-case query complexity $\mathcal{O}(T)$** and success probability $\ge 2/3$.

*Proof (Slide 10):*
1. **Runtime Truncation via Markov's Inequality:**
   Execute algorithm $(\mathcal{A}, R)$. If it does not terminate within $10T$ queries, **forcibly halt** the execution and output an arbitrary answer.
   Because $Q(x, A_r)$ is a non-negative random variable with expectation $\le T$, by Markov's inequality:
   $$\Pr(Q(x, A_r) \ge 10T) \le \frac{\mathbb{E}_r[Q(x, A_r)]}{10T} \le \frac{T}{10T} = \frac{1}{10}$$
2. **Success Probability of Truncated Algorithm:**
   The truncated algorithm errs only if the original algorithm erred, or if the execution was aborted at step $10T$. By the Union Bound:
   $$\Pr(\text{Truncated Error}) \le \Pr(\text{Original Error}) + \Pr(\text{Exceeds } 10T) \le \frac{1}{3} + \frac{1}{10} = \frac{13}{30} < \frac{1}{2}$$
   The success probability is at least $1 - 13/30 = 17/30 > 0.5$.
3. **Probability Amplification:**
   Running this truncated procedure a constant number of independent times (e.g., 35 times) and taking the **majority vote** amplifies the success probability back to $\ge 2/3$ by the Chernoff bound, while strictly preserving the worst-case query complexity bound of $35 \cdot 10T = \mathcal{O}(T)$. $\blacksquare$

> **Definition (Randomized Query Complexity $R(f)$ - Slide 11):**
> We say a randomized algorithm $(\mathcal{A}, R)$ solves $f$ if for every input $x \in \mathcal{X}$, $\mathbb{E}_r[Z(x, A_r)] \ge 2/3$.
> The **Randomized Query Complexity** $R(f)$ is the minimum worst-case query complexity among all randomized algorithms that solve $f$:
>
> $$R(f) = \min_{(\mathcal{A}, R) \text{ solves } f} \max_{x \in \mathcal{X}, r \in R} Q(x, A_r)$$

---

## 3. Yao's Minimax Principle

Proving lower bounds directly against randomized algorithms is notoriously difficult: an adversary must show that *for every possible probability distribution over decision trees*, there exists an input that causes high query cost or error.

In 1977, Andrew Yao introduced a revolutionary conceptual breakthrough: **switch the randomness from the algorithm to the input distribution**!

### 3.1 Distributional Query Complexity (Slide 12)

Let $\mu$ be a fixed probability distribution over the input space $\mathcal{X}$.
- A deterministic decision tree $A$ is said to be correct on distribution $\mu$ if its average success rate over inputs drawn from $\mu$ is at least $2/3$:
  $$\mathbb{E}_{x \sim \mu}[Z(x, A)] = \sum_{x \in \mathcal{X}} \mu(x) Z(x, A) \ge \frac{2}{3}$$

> **Definition (Distributional Query Complexity $D_\mu(f)$):**
> The **distributional query complexity** $D_\mu(f)$ is the minimum worst-case query complexity among all **deterministic** algorithms that achieve at least $2/3$ success on distribution $\mu$:
>
> $$D_\mu(f) = \min_{A \text{ deterministic}, \mathbb{E}_\mu[Z(x, A)] \ge 2/3} \max_{x \in \mathcal{X}} Q(x, A)$$

---

### 3.2 Statement & Proof of Yao's Minimax Principle (Slides 13, 19)

> **Theorem (Yao's Minimax Principle - Yao, 1977):**
> For any boolean function $f$ and any input probability distribution $\mu$:
>
> $$D_\mu(f) \le R(f)$$
>
> Furthermore, by the von Neumann Minimax Theorem for two-player zero-sum games, there exists an optimal "hardest" distribution $\mu^*$ such that:
>
> $$\max_{\mu} D_\mu(f) = R(f)$$

```
=================================================================================
                            YAO'S MINIMAX PRINCIPLE
=================================================================================

  RANDOMIZED ALGORITHM PERSPECTIVE:              DISTRIBUTIONAL PERSPECTIVE:
  - Algorithm chooses distribution R over trees  - Fix hard input distribution mu
  - Adversary chooses worst-case input x         - Analyze best deterministic tree A
  - Hard to analyze all algorithms!              - Much easier to analyze fixed inputs!

                                D_mu(f) <= R(f)
             To prove R(f) >= q: Construct mu such that D_mu(f) >= q!
=================================================================================
```

*Complete Mathematical Proof of $D_\mu(f) \le R(f)$ (Slide 19):*
1. Let $(\mathcal{A}, R)$ be the optimal randomized algorithm achieving worst-case query complexity $R(f)$. By definition, for **every** individual input $x \in \mathcal{X}$:
   $$\mathbb{E}_{r \sim R}[Z(x, A_r)] \ge \frac{2}{3}$$
2. Consider the joint expectation when input $x$ is drawn from distribution $\mu$ and random seed $r$ is drawn from $R$:
   $$\mathbb{E}_{x \sim \mu, r \sim R}[Z(x, A_r)] = \sum_{x \in \mathcal{X}} \mu(x) \mathbb{E}_{r \sim R}[Z(x, A_r)] \ge \sum_{x \in \mathcal{X}} \mu(x) \cdot \frac{2}{3} = \frac{2}{3}$$
3. By Fubini's theorem, we can interchange the order of summation:
   $$\mathbb{E}_{x \sim \mu, r \sim R}[Z(x, A_r)] = \sum_{r \in R} \Pr(r) \mathbb{E}_{x \sim \mu}[Z(x, A_r)]$$
4. A weighted arithmetic average can never exceed the maximum value in the collection:
   $$\sum_{r \in R} \Pr(r) \mathbb{E}_{x \sim \mu}[Z(x, A_r)] \le \max_{r \in R} \mathbb{E}_{x \sim \mu}[Z(x, A_r)]$$
5. Combining steps 2 and 4 yields:
   $$\max_{r \in R} \mathbb{E}_{x \sim \mu}[Z(x, A_r)] \ge \frac{2}{3}$$
6. Therefore, there must exist at least one specific deterministic seed $r^* \in R$ such that:
   $$\mathbb{E}_{x \sim \mu}[Z(x, A_{r^*})] \ge \frac{2}{3}$$
7. The deterministic algorithm $A_{r^*}$ achieves success probability $\ge 2/3$ under $\mu$, and its worst-case query complexity satisfies:
   $$\max_{x \in \mathcal{X}} Q(x, A_{r^*}) \le \max_{x \in \mathcal{X}, r \in R} Q(x, A_r) = R(f)$$
8. Since $D_\mu(f)$ is the minimum query complexity over all deterministic algorithms correct on $\mu$, we conclude:
   $$D_\mu(f) \le \max_{x \in \mathcal{X}} Q(x, A_{r^*}) \le R(f) \quad \blacksquare$$

---

### 3.3 The 3-Step Recipe for Proving Randomized Lower Bounds (Slide 18)

To prove that a decision problem $f$ requires randomized query complexity $R(f) \ge q$:
1. **Construct Two Hard Distributions:**
   - Define $\mu_0$ supported exclusively on inputs where $f(x) = 0$.
   - Define $\mu_1$ supported exclusively on inputs where $f(x) = 1$.
2. **Form the Composite Distribution:**
   Sample a hidden bit $I \in \{0, 1\}$ uniformly at random ($1/2$), and sample input $x \sim \mu_I$. The overall input distribution is:
   $$\mu = \frac{1}{2} \mu_0 + \frac{1}{2} \mu_1$$
3. **Information-Theoretic Impossibility Proof:**
   Prove that any deterministic algorithm making fewer than $q$ queries reveals insufficient information to predict the hidden bit $I$ with success probability $\ge 2/3$.
   This establishes $D_\mu(f) \ge q$. By Yao's Minimax Principle, $R(f) \ge D_\mu(f) \ge q$.

---

## 4. Lower Bound Proof for the OR Function (Slides 14–16)

We apply Yao's Minimax Principle to prove that **randomization does not help compute the OR function in sublinear time**.

> **Theorem (Randomized Lower Bound for OR):**
> Any randomized algorithm that decides the OR function on $n$-bit strings with success probability $\ge 2/3$ requires at least $n/3$ queries:
>
> $$R(\text{OR}) \ge \frac{n}{3} = \Omega(n)$$

*Proof:*

### Step 1: Defining the Hard Input Distribution $\mu$
- **Distribution $\mu_0$ ($0$-instances):**
  The string $x = 0^n$ (all zeros) with probability 1. Here $\text{OR}(x) = 0$.
- **Distribution $\mu_1$ ($1$-instances):**
  A string containing exactly one 1 placed at index $j^* \in \{1, 2, \dots, n\}$ chosen uniformly at random:
  $$\Pr_{\mu_1}(x = e_j) = \frac{1}{n}, \quad \forall j \in \{1, \dots, n\}$$
  Here $\text{OR}(x) = 1$.
- **Composite Distribution $\mu$:**
  Flip a fair coin $I \in \{0, 1\}$. If $I = 0$, set $x \sim \mu_0$; if $I = 1$, set $x \sim \mu_1$.
  The task of the algorithm is equivalent to determining the hidden bit $I$.

---

### Step 2: Information Revealed by $q < n/3$ Queries
Let $A$ be an arbitrary deterministic query algorithm that makes $q < n/3$ queries.
Because $A$ is deterministic, the sequence of queried positions when observing only zeros is **completely fixed and predetermined**. Let these $q$ queried indices be:
$$\mathcal{Q}_0 = \{ i_1, i_2, \dots, i_q \} \subset \{1, 2, \dots, n\}$$

1. **Probability of Observing a One:**
   If $I = 1$, the index $j^*$ of the single 1 is chosen uniformly from $\{1, \dots, n\}$.
   The probability that $j^*$ falls into the queried set $\mathcal{Q}_0$ is:
   $$p = \Pr(j^* \in \mathcal{Q}_0 \mid I = 1) = \frac{q}{n} < \frac{n/3}{n} = \frac{1}{3}$$
   The overall probability that $A$ observes a 1 under distribution $\mu$ is:
   $$\Pr(\text{sees a } 1) = \Pr(I = 1) \cdot \Pr(j^* \in \mathcal{Q}_0 \mid I = 1) = \frac{1}{2} \cdot p < \frac{1}{2} \cdot \frac{1}{3} = \frac{1}{6}$$

---

### Step 3: Bayesian Analysis When Observing All Zeros
If the algorithm ever observes a 1, it knows with certainty that $I = 1$.
Now suppose the algorithm observes **all zeros** across all $q$ queries (event $\mathcal{Z}$). What is the posterior probability that $I = 0$?

1. **Likelihoods:**
   $$\Pr(\mathcal{Z} \mid I = 0) = 1$$
   $$\Pr(\mathcal{Z} \mid I = 1) = 1 - \Pr(j^* \in \mathcal{Q}_0 \mid I = 1) = 1 - p$$
2. **Posterior Probability via Bayes' Theorem:**
   $$\Pr(I = 0 \mid \mathcal{Z}) = \frac{\Pr(I = 0) \Pr(\mathcal{Z} \mid I = 0)}{\Pr(I = 0) \Pr(\mathcal{Z} \mid I = 0) + \Pr(I = 1) \Pr(\mathcal{Z} \mid I = 1)} = \frac{\frac{1}{2} \cdot 1}{\frac{1}{2} \cdot 1 + \frac{1}{2} \cdot (1 - p)} = \frac{1}{2 - p}$$
3. **Bounding the Posterior:**
   Since $p < 1/3$:
   $$\Pr(I = 0 \mid \mathcal{Z}) = \frac{1}{2 - p} < \frac{1}{2 - 1/3} = \frac{1}{5/3} = \frac{3}{5} = 0.60$$
   Similarly:
   $$\Pr(I = 1 \mid \mathcal{Z}) = 1 - \frac{1}{2 - p} = \frac{1 - p}{2 - p} > \frac{2/3}{5/3} = \frac{2}{5} = 0.40$$

---

### Step 4: Bounding the Maximum Success Probability
When event $\mathcal{Z}$ occurs, the best decision rule for the algorithm is to guess the more likely outcome ($I = 0$), which succeeds with probability $\Pr(I = 0 \mid \mathcal{Z}) < 3/5$.
The total probability of correct classification is:
$$\Pr(\text{correct}) \le \Pr(\text{sees a } 1) \cdot 1 + \Pr(\mathcal{Z}) \cdot \Pr(I = 0 \mid \mathcal{Z})$$
Notice that $\Pr(\text{sees a } 1) = \frac{p}{2}$, and $\Pr(\mathcal{Z}) = 1 - \frac{p}{2}$.
Substituting these quantities:
$$\Pr(\text{correct}) \le \frac{p}{2} \cdot 1 + \left( 1 - \frac{p}{2} \right) \cdot \frac{3}{5} = \frac{3}{5} + \left( 1 - \frac{3}{5} \right) \frac{p}{2} = \frac{3}{5} + \frac{2}{5} \cdot \frac{p}{2} = \frac{3}{5} + \frac{p}{5}$$
Since $p < 1/3$:
$$\Pr(\text{correct}) < \frac{3}{5} + \frac{1/3}{5} = \frac{3}{5} + \frac{1}{15} = \frac{9 + 1}{15} = \frac{10}{15} = \frac{2}{3}$$

**Conclusion:**
No deterministic algorithm making fewer than $n/3$ queries can achieve a correctness ratio of $2/3$ on distribution $\mu$:
$$D_\mu(\text{OR}) \ge \frac{n}{3}$$
By Yao's Minimax Principle:
$$R(\text{OR}) \ge D_\mu(\text{OR}) \ge \frac{n}{3} = \Omega(n) \quad \blacksquare$$

---

## 5. Lower Bound Proof for the XOR Function (Slide 17)

> **Exercise:**
> Let $f(x) = \text{XOR}(x) = \sum_{i=1}^n x_i \pmod 2$ be the parity function on $n$-bit binary strings.
> Prove that the randomized query complexity satisfies:
>
> $$R(\text{XOR}) = n$$

*Proof via Information Entropy:*
1. **Hard Distribution:**
   Let $\mu$ be the **uniform distribution** over the entire hypercube $\{0, 1\}^n$. Under $\mu$, each bit $x_i$ is an independent fair coin flip:
   $$\Pr(x_i = 1) = \Pr(x_i = 0) = \frac{1}{2}$$
2. **Deterministic Algorithm Behavior:**
   Let $A$ be any deterministic algorithm that makes $q < n$ queries.
   Because $q < n$, there exists at least one index $k \in \{1, \dots, n\}$ that $A$ never queries.
3. **Parity Uncertainty:**
   Let $S_q = \sum_{i \in \text{queried}} x_i \pmod 2$ be the parity of the observed bits.
   The total parity of the string is:
   $$\text{XOR}(x) = \left( S_q + x_k + \sum_{j \notin \text{queried}, j \neq k} x_j \right) \pmod 2$$
   Because $x_k$ is mutually independent of all other bits and uniformly distributed in $\{0, 1\}$:
   $$\Pr(\text{XOR}(x) = 1 \mid \text{queried bits}) = \frac{1}{2}, \quad \Pr(\text{XOR}(x) = 0 \mid \text{queried bits}) = \frac{1}{2}$$
4. **Conclusion:**
   Regardless of whether the algorithm outputs 0 or 1, its probability of correctness is strictly bounded by $1/2$.
   Because $1/2 < 2/3$, no deterministic algorithm making $< n$ queries can achieve $2/3$ success on $\mu$.
   By Yao's Minimax Principle, $R(\text{XOR}) = n$. Exactly **all $n$ bits must be queried**! $\blacksquare$

---

## 6. Query Reductions & Graph Connectivity Lower Bound

Just as in classical computational complexity (where NP-hardness is established via polynomial-time reductions), lower bounds for query algorithms are propagated across problems using **Query Reductions**.

### 6.1 The Query Reduction Framework (Slides 20–21)

> **Theorem (Query Reduction Theorem):**
> Suppose problem $A$ reduces to problem $B$ ($A \le_Q B$) such that any instance $\alpha$ of problem $A$ can be mapped to an instance $\beta$ of problem $B$, and each oracle query to $\beta$ can be simulated using at most $C$ oracle queries to $\alpha$.
> Then if problem $A$ has query lower bound $Q$, problem $B$ has query lower bound $Q / C$:
>
> $$R(B) \ge \frac{R(A)}{C}$$

```
+-------------------------------------------------------------------------------+
|                           QUERY REDUCTION SCHEME                              |
+-------------------------------------------------------------------------------+
|                                                                               |
|   Instance alpha of A ---------------------------------> Instance beta of B   |
|                                                                 |             |
|   Oracle for A <----- [ C queries ] <----- Query on B <---------+             |
|        |                                                                      |
|        +------------> [ C answers ] ------> Response for B                    |
|                                                                 |             |
|   Output for A <--------------------------------------- Output for B          |
|                                                                               |
+-------------------------------------------------------------------------------+
```

---

### 6.2 Graph Connectivity Lower Bound in Dense Graphs (Slides 22–24)

> **Exercise:**
> In the **Adjacency-Matrix Model** (pair queries), prove that the randomized query complexity of deciding whether an $N$-vertex graph $G$ is connected satisfies:
>
> $$R(\text{Graph Connectivity}) = \Omega(N^2)$$

*Proof via Reduction from OR (Slides 23–24):*
1. **Source Instance:**
   Let $x \in \{0, 1\}^m$ be an instance of the OR function on $m = n^2$ bits.
   From Section 4, we know that $R(\text{OR}) = \Omega(m) = \Omega(n^2)$.
2. **Constructing the Graph Instance $G$:**
   Construct a graph $G$ with $N = 2n$ vertices, partitioned into two equal disjoint subsets:
   $$U = \{ u_1, u_2, \dots, u_n \}, \quad V = \{ v_1, v_2, \dots, v_n \}$$
   Place edges according to the following rules:
   - **Clique on $U$:** For all $1 \le i < j \le n$, add edge $(u_i, u_j)$.
   - **Clique on $V$:** For all $1 \le i < j \le n$, add edge $(v_i, v_j)$.
   - **Cross-Edges between $U$ and $V$:** For each pair $(u_i, v_j)$, add edge $(u_i, v_j)$ **if and only if** bit $x_{(i-1)n + j} = 1$ in the OR instance.

```
       CLIQUE U (n vertices)                   CLIQUE V (n vertices)
       +-------------------+                   +-------------------+
       |   u_1 <---> u_2   |                   |   v_1 <---> v_2   |
       |    ^   \ /   ^    |                   |    ^   \ /   ^    |
       |    |    X    |    |   Cross-Edges?    |    |    X    |    |
       |    v   / \   v    | ================= |    v   / \   v    |
       |   u_i <---> u_n   | (x_k = 1 in OR)   |   v_j <---> v_n   |
       +-------------------+                   +-------------------+
```

3. **Query Simulation:**
   Suppose an algorithm for Graph Connectivity queries vertex pair $(w_1, w_2)$:
   - If both $w_1, w_2 \in U$, return $1$ immediately ($0$ queries to OR).
   - If both $w_1, w_2 \in V$, return $1$ immediately ($0$ queries to OR).
   - If $w_1 = u_i \in U$ and $w_2 = v_j \in V$, query the oracle for $x$ at index $(i-1)n + j$, and return the received bit ($1$ query to OR).
   Thus, each pair query on $G$ requires at most $C = 1$ query to the OR instance!
4. **Correctness of Reduction:**
   - If $\text{OR}(x) = 0$: All bits of $x$ are 0. There are zero cross-edges between $U$ and $V$.
     Since $|U| = n \ge 1$ and $|V| = n \ge 1$, $G$ contains two completely disconnected components. The graph is **not connected**.
   - If $\text{OR}(x) = 1$: There exists at least one pair $(u_i, v_j)$ connected by an edge.
     Since $U$ is a clique, every vertex in $U$ is connected to $u_i$. Since $V$ is a clique, every vertex in $V$ is connected to $v_j$. The edge $(u_i, v_j)$ bridges $U$ and $V$, rendering the entire graph **connected**.
   - Therefore:
     $$\text{Graph Connectivity}(G) = \text{OR}(x)$$
5. **Complexity Conclusion:**
   Since $N = 2n$, $n = N/2$, and the number of bits in the OR instance is $m = n^2 = N^2 / 4$.
   Applying the Query Reduction Theorem:
   $$R(\text{Graph Connectivity}) \ge \frac{R(\text{OR})}{C} = \Omega(m) = \Omega(N^2) \quad \blacksquare$$
In the adjacency-matrix model, deciding whether a graph is connected is fundamentally impossible in sublinear time!

---
# Week 4 - Property Testing & Distribution Testing: Sortedness, Total Variation Distance, and Uniformity Testing

<draft>
- 1. The Property Testing Computational Paradigm
    - Rubinfeld & Sudan (1996), Goldreich, Goldwasser, Ron (1998).
    - Relaxing decision problems: Distinguish x in P from x that is eps-far from P.
    - Normalized Hamming distance: dist(x, P) = min_{y in P} d_H(x, y) / n.
    - Definition of eps-far: Requires modifying >= eps n entries to satisfy property P.
    - Promise problem model: Output Yes if x in P; output No if x is eps-far; either output allowed otherwise.
    - Motivating example: NotOR property (x = 0^n). O(1/eps) query complexity vs. exact Omega(n).
- 2. Property Testing of Sortedness (Array Monotonicity)
    - Input: Array a_1, a_2, ..., a_n. Property: a_1 <= a_2 <= ... <= a_n.
    - Exact testing requires Omega(n) queries (reduction from OR).
    - Flaw in local adjacent testing: Counterexample of split-sorted array [n/2+1, ..., n, 1, ..., n/2].
    - Binary strings special case (0^* 1^*): eps-far implies (eps n / 2)-th 1 precedes eps n / 2 zeros; O(1/eps) tester.
    - General array multi-scale inversions: Interleaved pairs counterexample.
    - The Ergun et al. Binary Search Tester:
        - Algorithm: Sample index i, execute binary search towards i over array.
        - Detection of inversions during interval narrowing.
        - Lowest Common Ancestor (LCA) Transitivity Lemma & Proof: If binary search succeeds for i_1 < i_2, then a_{i_1} <= a_{i_2}.
        - Monotonically sorted subsequence corollary.
        - Bound on unsuccessful indices: |S_unsucc| >= eps n.
        - Sample size O(1/eps), query cost O(log n) -> Total query complexity O((log n) / eps).
- 3. Distribution Testing & Total Variation Distance
    - Distribution testing model: Sampling oracle generating i.i.d. draws from unknown mu on [n].
    - Total Variation Distance (TVD): d_TV(mu, nu) = (1/2) ||mu - nu||_1 = max_S (mu(S) - nu(S)).
    - Single-Sample Distinguishability Proposition: Pr(correct) = 0.5 + 0.5 d_TV(mu, nu) (complete proof).
    - Connecting TVD to transcript distributions in Yao's Minimax Principle.
- 4. Uniformity Testing (mu vs. U_n)
    - Goal: Accept if mu = U_n; Reject if d_TV(mu, U_n) > eps.
    - Collision probability: Pr(X = Y) = sum mu_i^2 = ||mu||_2^2.
    - Cauchy-Schwarz bound: ||mu||_2^2 >= 1/n, equality iff mu = U_n.
    - Key Lemma Relating TVD to L2 Norm: If d_TV(mu, U_n) > eps, then ||mu||_2^2 >= (1 + 4 eps^2) / n.
    - Batu et al. Pairwise Collision Counting Algorithm:
        - Estimator C_hat = (1 / binom(k, 2)) sum_{i < j} I[X_i = X_j].
        - Unbiasedness: E[C_hat] = ||mu||_2^2.
        - Variance analysis via 4-wise and 3-wise covariance: Var <= binom(k, 2) ||mu||_2^2 + 6 binom(k, 3) ||mu||_2^3.
        - Chebyshev sample complexity: k = O(sqrt(n) / eps^4).
        - State-of-the-Art: Paninski (2008) tight bound Theta(sqrt(n) / eps^2).
- 5. Graph Property Testing: Bipartiteness Testing
    - Testing whether G is bipartite or eps-far from bipartite (requires deleting > eps n^2 edges).
    - Goldreich, Goldwasser, Ron (1998) induced subgraph tester.
</draft>

## 1. The Property Testing Computational Paradigm

In Week 3, we established that exact decision problems (such as checking whether a string contains a 1, or whether a graph is connected) require $\Omega(n)$ or $\Omega(n^2)$ queries. In 1996–1998, **Ronitt Rubinfeld, Madhu Sudan, Oded Goldreich, Shafi Goldwasser, and Dana Ron** formulated a foundational relaxation: **Property Testing**.

```
+-------------------------------------------------------------------------------+
|                         PROPERTY TESTING PROMISE MODEL                        |
+-------------------------------------------------------------------------------+
|                                                                               |
|   [ Input x in P ] ------------> TESTER MUST OUTPUT "YES" (Pr >= 2/3 or 1)    |
|                                                                               |
|   [ dist(x, P) <= eps ] -------> EITHER "YES" OR "NO" ALLOWED (Promise buffer)|
|                                                                               |
|   [ dist(x, P) > eps ] --------> TESTER MUST OUTPUT "NO" (Pr >= 2/3)          |
|   (eps-far from property P)                                                   |
+-------------------------------------------------------------------------------+
```

### 1.1 Formal Mathematical Formulation (Slide 5)

Let $\Sigma$ be a finite alphabet, and let $\mathcal{P} \subseteq \Sigma^n$ be a property of interest.
- **Normalized Hamming Distance:** For any two strings $x, y \in \Sigma^n$, the normalized distance is:
  $$\text{dist}(x, y) = \frac{1}{n} \cdot |\{ i \in \{1, 2, \dots, n\} : x_i \neq y_i \}|$$
- **Distance to Property:** The distance from $x$ to property $\mathcal{P}$ is the minimum fraction of entries that must be modified to transform $x$ into a member of $\mathcal{P}$:
  $$\text{dist}(x, \mathcal{P}) = \min_{y \in \mathcal{P}} \text{dist}(x, y)$$

> **Definition ($\epsilon$-Far):**
> An input $x \in \Sigma^n$ is **$\epsilon$-far** from property $\mathcal{P}$ if:
>
> $$\text{dist}(x, \mathcal{P}) > \epsilon$$
>
> That is, one must modify strictly more than $\epsilon n$ coordinates of $x$ to satisfy property $\mathcal{P}$.

> **Definition ($\epsilon$-Tester):**
> An algorithm $\mathcal{T}$ is an **$\epsilon$-tester** for property $\mathcal{P}$ with query complexity $q(n, \epsilon)$ if on input $x$:
> 1. **Completeness:** If $x \in \mathcal{P}$, then $\Pr(\mathcal{T}(x) = \text{`Yes'}) \ge \frac{2}{3}$ (if this probability is $1$, $\mathcal{T}$ has **one-sided error**).
> 2. **Soundness:** If $x$ is $\epsilon$-far from $\mathcal{P}$, then $\Pr(\mathcal{T}(x) = \text{`No'}) \ge \frac{2}{3}$.
> 3. **Promise Tolerance:** If $0 < \text{dist}(x, \mathcal{P}) \le \epsilon$, either answer is legally permitted.

---

### 1.2 Motivating Example: Testing the NotOR Property (Slide 5)

Consider the property $\mathcal{P}_{\text{NotOR}} = \{ 0^n \}$ (the all-zero string).
- **Exact Decision Problem:** Deciding whether $x = 0^n$ vs. $x \neq 0^n$ is equivalent to computing $\neg\text{OR}(x)$, which requires $\Omega(n)$ queries (Week 3).
- **Property Testing Problem:**
  - If $x = 0^n$, output `Yes`.
  - If $x$ is $\epsilon$-far from $0^n$ (meaning $x$ contains at least $\epsilon n$ ones), output `No`.
  - If $x$ contains between $1$ and $\epsilon n - 1$ ones, either answer is permitted.

#### An $\mathcal{O}(1/\epsilon)$ Tester:
1. Sample $s = \left\lceil \frac{3}{\epsilon} \right\rceil$ indices uniformly at random with replacement.
2. Query the oracle at each sampled index.
3. If any queried bit is $1$, output `No`; if all sampled bits are $0$, output `Yes`.

**Analysis:**
- If $x = 0^n$, all sampled bits are 0 $\implies \Pr(\text{Accept}) = 1$ (One-sided error!).
- If $x$ is $\epsilon$-far, the fraction of ones is at least $\epsilon$. The probability of picking only zeros across all $s$ samples is:
  $$\Pr(\text{all zeros}) \le (1 - \epsilon)^s \le e^{-\epsilon s} = e^{-\epsilon \cdot (3/\epsilon)} = e^{-3} < \frac{1}{20} < \frac{1}{3}$$
  Therefore, $\Pr(\text{Reject}) \ge 1 - 1/20 \ge 95\% > 2/3$.
- **Conclusion:** Property testing collapses the query complexity from $\Omega(n)$ down to $\mathcal{O}(1/\epsilon)$—**completely independent of input size $n$**!

---

## 2. Property Testing of Sortedness (Array Monotonicity)

Consider testing whether an array of numbers is sorted.
- **Input:** A sequence of $n$ numbers $a = (a_1, a_2, \dots, a_n)$.
- **Property $\mathcal{P}_{\text{sorted}}$:** $a_1 \le a_2 \le \dots \le a_n$.
- **Oracle:** Given index $i$, return value $a_i$.

> **Theorem:** Exact testing of sortedness requires $\Omega(n)$ queries.

*Proof:* By reduction from OR. Given $x \in \{0, 1\}^n$, define $a_i = i + n \cdot x_i$. The sequence is sorted if and only if $x = 0^n$. Thus $R(\text{Sortedness}) \ge R(\text{OR}) = \Omega(n)$. $\blacksquare$

---

### 2.1 The Failure of Local Adjacent Testing (Slide 9)

A naive intuition suggests that because sortedness is characterized by $n-1$ adjacent local inequalities ($a_1 \le a_2, a_2 \le a_3, \dots, a_{n-1} \le a_n$), one can simply test a random sample of $\mathcal{O}(1/\epsilon)$ adjacent pairs $(a_{I_j}, a_{I_j + 1})$.

**Why Local Testing Fails Catastrophically:**
Consider the **Split-Sorted Counterexample**:
$$a = \left( \frac{n}{2} + 1, \frac{n}{2} + 2, \dots, n, \quad 1, 2, \dots, \frac{n}{2} \right)$$

```
Array Values:
         n |               *
           |             *
     n/2+1 |           *
           |---------------------------------
       n/2 |                               *
           |                             *
         1 |                           *
           +-------------------------------+
           1                             n
                     Index
```

- **Local Inversions:** There is exactly **one** single adjacent pair that is out of order: at index $n/2$, where $a_{n/2} = n > a_{n/2 + 1} = 1$. All other $n-2$ adjacent pairs are perfectly sorted!
- **Distance to Sortedness:** To make the array sorted, one must modify either the entire first half or the entire second half—requiring at least $n/2$ changes. Thus, the array is $\epsilon$-far from sorted with $\epsilon = 1/2$!
- **Sampling Probability:** A random sample of $s = 10/\epsilon = 20$ adjacent pairs hits the single boundary inversion with probability:
  $$\Pr(\text{detect inversion}) \le \frac{20}{n - 1} \xrightarrow{n \to \infty} 0$$
Local checking fails because it is blind to global shifts.

---

### 2.2 Special Case: Monotonicity of Binary Strings (Slides 10–13)

When the array elements are binary ($a_i \in \{0, 1\}$), sortedness reduces to strings of the form $0^* 1^*$: all zeros precede all ones.

> **Lemma (Slide 11–13):**
> If a binary string is $\epsilon$-far from sorted, then its $(\epsilon n / 2)$-th leftmost $1$ precedes at least $\epsilon n / 2$ zeros.

*Proof:*
If the string is $\epsilon$-far from sorted, its longest non-decreasing subsequence has length at most $(1 - \epsilon)n$.
Consequently, deleting fewer than $\epsilon n$ bits cannot eliminate all inversions.
Let $i^*$ be the index of the $(\epsilon n / 2)$-th one. If there were fewer than $\epsilon n / 2$ zeros to the right of $i^*$, we could make the string sorted by removing the $\epsilon n / 2$ ones up to $i^*$ and the $< \epsilon n / 2$ zeros to the right of $i^*$, for a total of $< \epsilon n$ changes, contradicting that the string is $\epsilon$-far. Thus, at least $\epsilon n / 2$ zeros lie to the right of $i^*$. $\blacksquare$

#### Algorithm for Binary Strings:
Sample $s = \frac{10}{\epsilon}$ indices uniformly at random, and check if the sampled subsequence is sorted.
- With high probability, the sample contains at least one of the first $\epsilon n / 2$ ones and at least one of the subsequent $\epsilon n / 2$ zeros.
- An inversion $a_{i_1} = 1 > a_{i_2} = 0$ with $i_1 < i_2$ is detected with probability $\ge 2/3$.
- Query complexity: $\mathcal{O}(1/\epsilon)$.

---

### 2.3 General Arrays & The Ergün et al. Binary Search Tester (Slides 14–17)

For general numbers, inversions can exist at **arbitrary distance scales**:
- Long-range shifts (Split-sorted array).
- Microscopic adjacent swaps (Interleaved pairs: $2, 1, 4, 3, 6, 5, 8, 7, \dots$).
- Intermediate block swaps.

In 1999–2000, **Funda Ergün, S. Ravi Kumar, Ronitt Rubinfeld, and C. Seshadhri** introduced the **Binary Search Tester**:

```
+-------------------------------------------------------------------------------+
|                       BINARY SEARCH TESTER ALGORITHM                          |
+-------------------------------------------------------------------------------+
|                                                                               |
|   1. Sample an index i uniformly at random from {1, 2, ..., n}.               |
|   2. Execute Binary Search looking for TARGET INDEX i in array a:             |
|      - Initialize interval [L, R] = [1, n].                                   |
|      - While L <= R:                                                          |
|          * Let pivot j = floor((L + R) / 2).                                  |
|          * If i < j but a_i > a_j: INVERSION DETECTED -> HALT & FAIL.         |
|          * If i > j but a_i < a_j: INVERSION DETECTED -> HALT & FAIL.         |
|          * If i < j: update R = j - 1.                                        |
|          * If i > j: update L = j + 1.                                        |
|          * If i = j: HALT & SUCCESS.                                          |
|                                                                               |
+-------------------------------------------------------------------------------+
```

> **Definition (Successful Index):**
> An index $i \in \{1, \dots, n\}$ is **successful** if the binary search for $i$ completes without detecting any inversion. Otherwise, index $i$ is **unsuccessful**.

---

### 2.4 The Lowest Common Ancestor Transitivity Lemma (Slide 17)

> **Fundamental Lemma (LCA Monotonicity):**
> For any two distinct indices $i_1 < i_2$, if binary search succeeds for both $i_1$ and $i_2$, then:
>
> $$a_{i_1} \le a_{i_2}$$

*Complete Mathematical Proof:*
1. Consider the binary search tree on the index set $\{1, 2, \dots, n\}$.
   Every index $i$ corresponds to a unique path from the root to the leaf node $i$.
2. Let $k$ be the **Lowest Common Ancestor (LCA)** of $i_1$ and $i_2$ in the binary search tree.
   Node $k$ is the pivot at which the search path for $i_1$ and the search path for $i_2$ diverge.
3. Because $i_1 < i_2$, the search for $i_1$ branches **left** at pivot $k$, while the search for $i_2$ branches **right** (or terminates at $k$). Therefore:
   $$i_1 < k \le i_2 \quad (\text{or } i_1 \le k < i_2)$$
4. Now analyze the values:
   - In the binary search for $i_1$, pivot $k$ was visited, and $i_1 < k$. Because the search for $i_1$ was successful, it verified that:
     $$a_{i_1} \le a_k$$
   - In the binary search for $i_2$, pivot $k$ was visited, and $i_2 \ge k$. Because the search for $i_2$ was successful, it verified that:
     $$a_k \le a_{i_2}$$
5. By the transitivity of the linear order $\le$:
   $$a_{i_1} \le a_k \le a_{i_2} \implies a_{i_1} \le a_{i_2} \quad \blacksquare$$

```
                         [ Pivot k = LCA(i_1, i_2) ]
                                /           \
                    Branch Left/             \Branch Right
                              v               v
                         ...                 ...
                        /                     \
                       v                       v
                   [ Index i_1 ]           [ Index i_2 ]
                 Success: a_i1 <= a_k     Success: a_k <= a_i2
                 =====================================
                      TRANSITIVITY: a_i1 <= a_i2
```

---

### 2.5 Soundness & Query Complexity of the Sortedness Tester

> **Corollary (Monotonic Subsequence):**
> The set of all successful indices $S_{\text{succ}} = \{ i \in \{1, \dots, n\} : \text{BinarySearch}(i) \text{ succeeds} \}$ forms a **monotonically non-decreasing subsequence** of array $a$.

*Proof of Soundness:*
1. If array $a$ is $\epsilon$-far from sorted, then by definition of distance to $\mathcal{P}_{\text{sorted}}$, the longest increasing subsequence in $a$ can have length at most $(1 - \epsilon)n$.
2. Since $S_{\text{succ}}$ is an increasing subsequence:
   $$|S_{\text{succ}}| \le (1 - \epsilon)n$$
3. Therefore, the set of **unsuccessful indices** must be large:
   $$|S_{\text{unsucc}}| = n - |S_{\text{succ}}| \ge n - (1 - \epsilon)n = \epsilon n$$
   At least an **$\epsilon$-fraction of all indices in the array will trigger a binary search failure**!
4. If we sample $s = \frac{10}{\epsilon}$ indices uniformly at random, the probability that *none* of them are unsuccessful is:
   $$\Pr(\text{all } s \text{ samples succeed}) \le (1 - \epsilon)^s \le e^{-\epsilon s} = e^{-10} < 0.0001$$
   Thus, if $a$ is $\epsilon$-far, the tester catches an unsuccessful search and outputs `No` with probability $> 99.9\%$.
5. If $a$ is sorted, binary search trivially succeeds for all $n$ indices, so the tester outputs `Yes` with probability $1$.

**Query Complexity:**
Each binary search makes $\mathcal{O}(\log n)$ queries.
Total query complexity for $s = \mathcal{O}(1/\epsilon)$ trials:
$$\mathcal{O}\left( \frac{\log n}{\epsilon} \right)$$

---

## 3. Distribution Testing & Total Variation Distance

In many large-scale applications, data arrives not as an array, but as random draws generated by an unknown physical process or random generator. **Distribution Testing** investigates whether an unknown probability distribution $\mu$ satisfies a structural property.

### 3.1 Total Variation Distance (Slide 20)

Let $\mu, \nu: [n] \to \mathbb{R}_{\ge 0}$ be two discrete probability distributions over domain $[n] = \{1, 2, \dots, n\}$, such that $\sum_{i=1}^n \mu(i) = \sum_{i=1}^n \nu(i) = 1$.

> **Definition (Total Variation Distance - TVD):**
> The **Total Variation Distance** between $\mu$ and $\nu$ is defined as:
>
> $$d_{\text{TV}}(\mu, \nu) = \frac{1}{2} \|\mu - \nu\|_1 = \frac{1}{2} \sum_{i=1}^n |\mu(i) - \nu(i)|$$
>
> Equivalently, it represents the maximum difference in probability assigned to any event $S \subseteq [n]$:
>
> $$d_{\text{TV}}(\mu, \nu) = \max_{S \subseteq [n]} (\mu(S) - \nu(S))$$

```
Probability
  ^
  |      +-----+
  |      | mu  |                   Total Variation Distance:
  |      |     |                   d_TV(mu, nu) = (1/2) * L1_distance
  |  +---+     +---+               Area of disjoint mass where distributions disagree
  |  | nu|     | nu|
  +--+---+-----+---+------------> Domain [n]
```

---

### 3.2 Operational Significance: Single-Sample Distinguishability (Slides 21–22)

Why is the constant factor $1/2$ placed in front of the $\ell_1$-norm?

> **Proposition (Single-Sample Distinguishability):**
> Suppose a single sample $x$ is drawn with probability $1/2$ from distribution $\mu$ and probability $1/2$ from distribution $\nu$.
> Then the maximum probability of correctly identifying whether $x \sim \mu$ or $x \sim \nu$ is exactly:
>
> $$\Pr(\text{correct}) = \frac{1}{2} + \frac{1}{2} d_{\text{TV}}(\mu, \nu)$$

*Proof:*
1. Any decision rule can be represented by a subset $S \subseteq [n]$: if the observed sample $x \in S$, the algorithm guesses $\mu$; if $x \notin S$, the algorithm guesses $\nu$.
2. The overall success probability for a chosen decision set $S$ is:
   $$\Pr(\text{correct}) = \frac{1}{2} \Pr(x \in S \mid x \sim \mu) + \frac{1}{2} \Pr(x \notin S \mid x \sim \nu) = \frac{1}{2} \mu(S) + \frac{1}{2} (1 - \nu(S)) = \frac{1}{2} + \frac{1}{2} (\mu(S) - \nu(S))$$
3. To maximize this probability, choose the optimal set $S^* = \{ i \in [n] : \mu(i) \ge \nu(i) \}$.
   By definition of Total Variation Distance, $\mu(S^*) - \nu(S^*) = d_{\text{TV}}(\mu, \nu)$.
4. Substituting $S^*$ yields:
   $$\Pr(\text{correct}) = \frac{1}{2} + \frac{1}{2} d_{\text{TV}}(\mu, \nu) \quad \blacksquare$$

**Algorithmic Consequence (Slide 21):**
If a randomized algorithm requires sampling from distribution $\nu$, but $\nu$ is difficult or expensive to simulate, we can substitute an easily sampled surrogate distribution $\mu$. Replacing $\nu$ with $\mu$ increases the algorithm's failure probability by at most $d_{\text{TV}}(\mu, \nu)$.

---

### 3.3 Connecting TVD to Yao's Minimax Principle (Slides 23–25)

Total Variation Distance establishes the formal information-theoretic limit in Yao's Minimax lower bounds:
- When a deterministic algorithm interacts with hard distributions $\mu_0$ (0-instances) and $\mu_1$ (1-instances), its execution produces a sequence of query-answer pairs known as the **transcript** $a = (q_1, a_1, \dots, q_k, a_k)$.
- Let $\nu_0$ and $\nu_1$ be the probability distributions over transcripts induced by $\mu_0$ and $\mu_1$, respectively.
- Distinguishing $\mu_0$ from $\mu_1$ is equivalent to identifying whether transcript $a$ was drawn from $\nu_0$ or $\nu_1$.
- By the Single-Sample Proposition:
  $$\Pr(\text{correct}) = \frac{1}{2} + \frac{1}{2} d_{\text{TV}}(\nu_0, \nu_1)$$
- Therefore, to prove that no algorithm making $k$ queries can achieve success $\ge 2/3$, **it is sufficient to prove that the Total Variation Distance between transcript distributions is strictly less than $1/3$**:
  $$d_{\text{TV}}(\nu_0, \nu_1) < \frac{1}{3} \implies \Pr(\text{correct}) < \frac{1}{2} + \frac{1}{2}\left(\frac{1}{3}\right) = \frac{2}{3}$$

---

## 4. Uniformity Testing ($\mu$ vs. $U_n$)

A fundamental problem in distribution testing is verifying whether a random generator produces uniformly distributed numbers:
- **Input:** Access to independent samples drawn from an unknown distribution $\mu$ on $[n]$.
- **Target:**
  - If $\mu = U_n$ (where $U_n(i) = 1/n$), output `Yes`.
  - If $d_{\text{TV}}(\mu, U_n) > \epsilon$, output `No`.

---

### 4.1 Collision Probability & The $\ell_2$-Norm (Slides 26–27)

> **Definition (Collision Probability):**
> If we draw two independent samples $X, Y \sim \mu$, the probability that they collide (are identical) is:
>
> $$\Pr_{X, Y \sim \mu}(X = Y) = \sum_{i=1}^n \Pr(X = i \land Y = i) = \sum_{i=1}^n \mu(i)^2 = \|\mu\|_2^2$$

**Minimization via Cauchy-Schwarz Inequality:**
By Cauchy-Schwarz:
$$\left( \sum_{i=1}^n \mu(i) \cdot 1 \right)^2 \le \left( \sum_{i=1}^n \mu(i)^2 \right) \left( \sum_{i=1}^n 1^2 \right) \implies 1^2 \le \|\mu\|_2^2 \cdot n \implies \|\mu\|_2^2 \ge \frac{1}{n}$$
Equality holds if and only if $\mu(1) = \mu(2) = \dots = \mu(n) = 1/n$.
- **Key Insight:** The collision probability $\|\mu\|_2^2$ attains its global minimum of $1/n$ **uniquely at the uniform distribution**. Any non-uniformity inflates the collision probability!

---

### 4.2 Relating Total Variation Distance to $\ell_2$-Norm (Slide 28)

> **Lemma (Collision Inflation under TVD):**
> If $d_{\text{TV}}(\mu, U_n) > \epsilon$, then:
>
> $$\|\mu\|_2^2 \ge \frac{1 + 4\epsilon^2}{n}$$

*Proof (Slide 28):*
1. Expand the squared $\ell_2$ distance between $\mu$ and $U_n$:
   $$\|\mu - U_n\|_2^2 = \sum_{i=1}^n \left( \mu(i) - \frac{1}{n} \right)^2 = \sum_{i=1}^n \mu(i)^2 - \frac{2}{n} \sum_{i=1}^n \mu(i) + \sum_{i=1}^n \frac{1}{n^2} = \|\mu\|_2^2 - \frac{2}{n}(1) + \frac{n}{n^2} = \|\mu\|_2^2 - \frac{1}{n}$$
2. By Cauchy-Schwarz relating the $\ell_1$ norm to the $\ell_2$ norm:
   $$\|\mu - U_n\|_1 = \sum_{i=1}^n 1 \cdot \left| \mu(i) - \frac{1}{n} \right| \le \sqrt{\sum_{i=1}^n 1^2} \cdot \sqrt{\sum_{i=1}^n \left( \mu(i) - \frac{1}{n} \right)^2} = \sqrt{n} \|\mu - U_n\|_2$$
3. Squaring both sides:
   $$\|\mu - U_n\|_2^2 \ge \frac{1}{n} \|\mu - U_n\|_1^2 = \frac{1}{n} (2 d_{\text{TV}}(\mu, U_n))^2 > \frac{4\epsilon^2}{n}$$
4. Substituting into step 1:
   $$\|\mu\|_2^2 - \frac{1}{n} \ge \frac{4\epsilon^2}{n} \implies \|\mu\|_2^2 \ge \frac{1 + 4\epsilon^2}{n} \quad \blacksquare$$

---

### 4.3 The Collision Counting Algorithm (Batu et al. - Slides 29–31)

Because $\|\mu\|_2^2 = 1/n$ when $\mu = U_n$, and $\|\mu\|_2^2 \ge (1 + 4\epsilon^2)/n$ when $\mu$ is $\epsilon$-far, **testing uniformity reduces to estimating the collision probability $\|\mu\|_2^2$ up to a multiplicative $(1 \pm \epsilon^2)$-factor**!

#### Algorithm:
1. Draw $k = \left\lceil \frac{100 \sqrt{n}}{\epsilon^4} \right\rceil$ independent samples $X_1, X_2, \dots, X_k \sim \mu$.
2. For each pair $1 \le i < j \le k$, define the collision indicator:
   $$Y_{i, j} = \begin{cases} 1 & \text{if } X_i = X_j \\ 0 & \text{otherwise} \end{cases}$$
3. Compute the unbiased collision estimator:
   $$\hat{C} = \frac{1}{\binom{k}{2}} \sum_{1 \le i < j \le k} Y_{i, j}$$
4. **Decision Rule:**
   $$\text{Output } \begin{cases} \text{`Yes' (Uniform)} & \text{if } \hat{C} \le \frac{1 + 2\epsilon^2}{n} \\ \text{`No' ($\epsilon$-far)} & \text{if } \hat{C} > \frac{1 + 2\epsilon^2}{n} \end{cases}$$

---

### 4.4 Variance Analysis via Chebyshev's Inequality (Slide 30)

To prove correctness, we bound $\text{Var}\left( \sum_{i < j} Y_{i, j} \right)$:

1. **Covariance Decomposition:**
   $$\text{Var}\left( \sum_{1 \le i < j \le k} Y_{i, j} \right) = \sum_{i < j} \text{Var}(Y_{i, j}) + \sum_{(i, j) \neq (k, \ell)} \text{Cov}(Y_{i, j}, Y_{k, \ell})$$
2. **Four Distinct Indices:**
   If $\{i, j\} \cap \{k, \ell\} = \emptyset$, the pair indicators $Y_{i, j}$ and $Y_{k, \ell}$ depend on completely disjoint pairs of independent samples.
   Thus $\text{Cov}(Y_{i, j}, Y_{k, \ell}) = 0$.
3. **Three Distinct Indices (Overlapping Triplet):**
   If the pairs share one index (e.g., $Y_{i, j}$ and $Y_{i, \ell}$ with $j \neq \ell$):
   $$\mathbb{E}[Y_{i, j} Y_{i, \ell}] = \Pr(X_i = X_j = X_\ell) = \sum_{a=1}^n \mu(a)^3 = \|\mu\|_3^3$$
   By Hölder's inequality, $\|\mu\|_3^3 \le \|\mu\|_2^3$.
4. **Summing Variances:**
   There are $\binom{k}{2}$ individual pairs, and $6 \binom{k}{3}$ overlapping triplets:
   $$\text{Var}\left( \sum_{1 \le i < j \le k} Y_{i, j} \right) \le \binom{k}{2} \|\mu\|_2^2 + 6 \binom{k}{3} \|\mu\|_2^3$$
5. **Chebyshev Bound:**
   Setting $\gamma = \epsilon^2$, Chebyshev's inequality guarantees:
   $$\Pr\left( \left| \hat{C} - \|\mu\|_2^2 \right| > \gamma \|\mu\|_2^2 \right) \le \frac{1}{\gamma^2} \cdot \frac{\text{Var}\left( \sum Y_{i, j} \right)}{\left( \mathbb{E}\left[ \sum Y_{i, j} \right] \right)^2} \le \frac{1}{\epsilon^4} \left[ \frac{1}{\binom{k}{2} \|\mu\|_2^2} + \frac{6 \binom{k}{3} \|\mu\|_2^3}{\binom{k}{2}^2 \|\mu\|_2^4} \right] < 0.10$$
   With $k = \mathcal{O}\left( \frac{\sqrt{n}}{\epsilon^4} \right)$, the estimate $\hat{C}$ distinguishes $1/n$ from $(1+4\epsilon^2)/n$ with probability $\ge 90\%$.

#### State-of-the-Art Sample Complexity (Slide 31):
Paninski (2008) and Valiant & Valiant (2017) demonstrated that using Poissonized sample estimators and localized coincidence counting, the information-theoretically **optimal sample complexity** for uniformity testing is:
$$\Theta\left( \frac{\sqrt{n}}{\epsilon^2} \right)$$

---

### 4.5 Graph Property Testing: Bipartiteness Testing (Slide 32)

> **Exercise:**
> In the adjacency-matrix model, design a property tester that accepts bipartite graphs and rejects graphs that are $\epsilon$-far from bipartite (requiring the deletion of $> \epsilon n^2$ edges).

#### Goldreich-Goldwasser-Ron Induced Subgraph Tester (1998):
1. Sample a subset $U \subset V$ of $k = \mathcal{O}\left( \frac{1}{\epsilon^2} \log\left(\frac{1}{\epsilon}\right) \right)$ vertices uniformly at random.
2. Query all $\binom{k}{2}$ vertex pairs within $U$ to construct the exact induced subgraph $G[U]$.
3. **Decision Rule:**
   - If $G[U]$ is bipartite, output `Yes`.
   - If $G[U]$ contains an odd cycle, output `No`.
4. **Guarantees:**
   - If $G$ is bipartite, every induced subgraph $G[U]$ is necessarily bipartite $\implies \Pr(\text{Accept}) = 1$ (One-sided error!).
   - If $G$ is $\epsilon$-far from bipartite, with probability $\ge 2/3$, the random sample $U$ intersects an odd cycle, successfully certifying non-bipartiteness using only $\mathcal{O}(\text{poly}(1/\epsilon))$ queries, completely independent of graph size $n$!

---

<reviewkit>
<takeaways>
- **The Core Scalability Philosophy:** "Algorithms at Scale" operate under extreme resource constraints. When $n$ is massive, reading the input requires $\Omega(n)$ time, so sublinear-time query algorithms access data via localized oracles and output $(\epsilon, \delta)$-approximations.
- **Linearity of Expectation:** Holds unconditionally for any collection of random variables without requiring independence ($\mathbb{E}[\sum X_i] = \sum \mathbb{E}[X_i]$), serving as the universal workhorse for sampling analysis.
- **Concentration Hierarchy:** Markov's inequality requires only non-negativity ($\mathcal{O}(1/\alpha)$ linear decay); Chebyshev's inequality requires pairwise independence ($\mathcal{O}(1/\alpha^2)$ polynomial decay); Chernoff bound requires mutual independence ($\exp(-\Omega(\delta^2 \mu))$ exponential decay).
- **The Balls-into-Bins Model:** Throwing $n$ balls into $n$ bins leaves $n/e \approx 36.8\%$ of bins empty on average. Throwing $10 n \ln n$ balls ensures no empty bins with probability $\ge 1 - n^{-9}$ (Coupon Collector's Theorem).
- **Mean Trick vs. Median Trick:** The Mean Trick averages $k$ independent runs to linearly dampen variance ($M/k$). The Median Trick takes the median of $k$ runs with success $> 1/2$ to exponentially boost success probability ($1 - 2e^{-k/100}$).
- **Graph Edge Estimation:** Additive $\epsilon n^2$ error takes $\mathcal{O}(1/\epsilon^2)$ pair queries. Multiplicative $(1 \pm \epsilon)$-estimation on connected graphs uses the Directed Degree Trick and Heavy/Light vertex decomposition to achieve $\mathcal{O}\left( \frac{n \log\log n}{\epsilon^2 \sqrt{m}} \right)$ queries via density-sensitive geometric search.
- **Decision Trees & Randomized Complexity:** A randomized algorithm is a probability distribution over deterministic decision trees. Expected query complexity $T$ can always be converted to worst-case $\mathcal{O}(T)$ via Markov runtime truncation and majority voting.
- **Yao's Minimax Principle:** The distributional query complexity of the best deterministic algorithm on *any* input distribution $\mu$ lower-bounds randomized query complexity ($D_\mu(f) \le R(f)$). This establishes that $R(\text{OR}) = \Omega(n)$, $R(\text{XOR}) = n$, and $R(\text{Graph Connectivity}) = \Omega(n^2)$.
- **Property Testing Promise Model:** Relaxes decision problems by allowing arbitrary answers within the $\epsilon$-distance buffer, reducing query complexities from $\Omega(n)$ to sublinear or constant bounds.
- **Binary Search Monotonicity Tester:** Because lowest common ancestors preserve transitivity, successful binary searches define a monotonically sorted subsequence. An $\epsilon$-far array has $\ge \epsilon n$ unsuccessful searches, enabling sortedness testing in $\mathcal{O}\left( \frac{\log n}{\epsilon} \right)$ queries.
- **Total Variation Distance & Uniformity Testing:** Total variation distance $d_{\text{TV}}(\mu, \nu)$ measures statistical indistinguishability. Testing whether $\mu = U_n$ reduces to estimating collision probability $\|\mu\|_2^2$, solved via pairwise collision counting in $\mathcal{O}\left( \frac{\sqrt{n}}{\epsilon^4} \right)$ samples (optimal $\Theta\left( \frac{\sqrt{n}}{\epsilon^2} \right)$).
</takeaways>

<qquiz src="questions.en.json"/>

<qprompt/>
</reviewkit>

## References

1. Mitzenmacher, M., & Upfal, E. (2017). *Probability and Computing: Randomization and Probabilistic Techniques in Algorithms and Data Analysis* (2nd ed.). Cambridge University Press.
2. Goldreich, O. (2017). *Introduction to Property Testing*. Cambridge University Press.
3. Motwani, R., & Raghavan, P. (1995). *Randomized Algorithms*. Cambridge University Press.
4. Yao, A. C. C. (1977). Probabilistic computations: Toward a unified measure of complexity. *Proceedings of the 18th Annual Symposium on Foundations of Computer Science (FOCS)*, 222-227.
5. Feige, U. (2006). On sums of independent random variables with bounded variance and average degree estimation in sublinear time. *SIAM Journal on Computing*, 35(4), 964-984.
6. Goldreich, O., & Ron, D. (2008). Approximating average degree in sublinear time. *Random Structures & Algorithms*, 32(4), 469-493.
7. Chazelle, B., Rubinfeld, R., & Trevisan, L. (2005). Approximating the minimum spanning tree weight in sublinear time. *SIAM Journal on Computing*, 35(2), 411-426.
8. Ergün, F., Kumar, S., & Rubinfeld, R. (2001). Fast approximate PCPs for multidimensional stability problems. *Journal of Computer and System Sciences*, 63(3), 398-421.
9. Batu, T., Fortnow, L., Rubinfeld, R., Smith, W. D., & White, P. (2013). Testing that distributions are close. *ACM Transactions on Algorithms (TALG)*, 9(4), 1-24.
10. Paninski, L. (2008). A coincidence-based test for uniformity given very sparsely sampled discrete data. *IEEE Transactions on Information Theory*, 54(10), 4750-4755.
11. Chen, Y. (2025). *CS5234 Algorithms at Scale (Lectures 1–4)*. National University of Singapore (NUS).
