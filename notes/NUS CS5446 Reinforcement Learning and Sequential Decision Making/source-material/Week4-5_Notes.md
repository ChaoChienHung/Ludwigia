# CS4246 / CS5446 — Week 4 & Week 5 Notes

> Week 4 = **MDP（模型已知，规划）**；Week 5 = **RL（模型未知，学习）→ 函数逼近与策略搜索**。

---

## Lecture 4A — Markov Decision Process (`Lecture-mdp.pdf`, RN 17.1, 17.2.1–17.2.2)

### 1. 模型

$$M \triangleq \langle S, A, T, R, \gamma \rangle$$

- 转移函数 $T: S \times A \times S \to [0,1]$ 满足 Markov 性：
  $$\forall s \in S,\ \forall a \in A:\quad \sum_{s' \in S} T(s,a,s') = \sum_{s' \in S} P(s' \mid s, a) = 1$$
- 奖励函数 $R: S \to \mathbb{R}$ 或 $R: S \times A \to \mathbb{R}$ 或 $R: S \times A \times S \to \mathbb{R}$，有界 $|R| \le R_{\max}$
- 折扣因子 $0 \le \gamma \le 1$
- 解 = 策略 $\pi: S \to A$

**例子**：4×3 Grid World（动作 0.8 正确 / 0.1 左偏 / 0.1 右偏，$r = -0.04$）、Percy 火星车、网约车调度。

### 2. 状态序列的效用与视界

$$U([s_0,\dots,s_N]) = \sum_{t=0}^{N-1} R(s_t,a_t,s_{t+1}) \qquad \text{(有限视界)}$$

$$U([s_0,s_1,\dots]) = \sum_{t=0}^{\infty} \gamma^t R(s_t,a_t,s_{t+1}),\quad 0 \le \gamma < 1 \qquad \text{(无限视界)}$$

| | 有限视界 $N$ 步 | 无限视界（折扣） |
|---|---|---|
| 效用 | 奖励直接加和 | 折扣加和 |
| 最优策略 | **非平稳** $\pi_t^*$（依赖剩余步数） | **平稳** $\pi^*$ |

**让无限视界回报有限的三种办法**：

1. 折扣：$\gamma < 1$ 且 $|R| \le R_{\max}$ $\Rightarrow$ $U([s_0,s_1,\dots]) \le \dfrac{R_{\max}}{1-\gamma}$
2. 终止状态 + **proper policy**（必定到达终止态）$\Rightarrow$ $\gamma = 1$ 也合法
3. 平均奖励（long-run average reward）—— 难算难分析

### 3. 两个 Bellman 方程

**期望方程**（给定 $\pi$，策略评估）：
$$U^\pi(s) = \sum_{s'} P(s' \mid s, \pi(s)) \Big[ R(s,\pi(s),s') + \gamma\, U^\pi(s') \Big]$$

**最优方程**（MEU 原则）：
$$U(s) = U^{\pi^*}(s) = \max_{a \in A(s)} \sum_{s'} P(s' \mid s, a) \Big[ R(s,a,s') + \gamma\, U(s') \Big]$$

$$\pi^*(s) = \arg\max_{a \in A(s)} \sum_{s'} P(s' \mid s, a) \Big[ R(s,a,s') + \gamma\, U(s') \Big]$$

> $|S|$ 个方程、$|S|$ 个未知数，唯一解。

**Q 函数（action-utility function）**：
$$Q(s,a) = \sum_{s'} P(s' \mid s,a)\Big[R(s,a,s') + \gamma\, U(s')\Big] = \sum_{s'} P(s' \mid s,a)\Big[R(s,a,s') + \gamma \max_{a'} Q(s',a')\Big]$$

$$U(s) = \max_a Q(s,a), \qquad \pi^*(s) = \arg\max_a Q(s,a)$$

### 4. 值迭代 (VI)

1. 初始化 $U_0(s) = 0$
2. **Bellman update**：
   $$U_{i+1}(s) \leftarrow \max_{a \in A(s)} \sum_{s'} P(s'\mid s,a)\Big[R(s,a,s') + \gamma\, U_i(s')\Big]$$
3. 重复直到 $\max_s |U_{i+1}(s) - U_i(s)| < \epsilon$
4. 抽策略 $\pi^*(s) = \arg\max_a \sum_{s'} P[\cdot]$

每轮开销 $O(|S|^2 |A|)$。

### 5. 策略迭代 (PI)

1. 初始化任意 $\pi_0$
2. **策略评估**：解 $U^{\pi_i}(s) = \sum_{s'} P(s'\mid s,\pi_i(s))[R + \gamma U^{\pi_i}(s')]$
   （$|S|$ 元线性方程组，$O(|S|^3)$；大规模时改用迭代近似，**无 $\max$ 算子**）
3. **策略改进**：
   $$\pi_{i+1}(s) = \arg\max_a \sum_{s'} P(s'\mid s,a)\Big[R(s,a,s') + \gamma\, U_i(s')\Big]$$
4. 直到 $\pi_{i+1}(s) = \pi_i(s),\ \forall s$

### 6. VI vs PI

| | Value Iteration | Policy Iteration |
|---|---|---|
| 初始化 | $U(s)=0$ | 任意 $\pi_0$ |
| 主更新 | Bellman **最优**更新（含 $\max$） | 评估（Bellman **期望**）+ 改进 |
| 终止 | $\max_s\|U_{i+1}(s)-U_i(s)\| < \epsilon$ | $\pi_{i+1} = \pi_i$ |
| 每轮开销 | $O(|S|^2|A|)$ | 评估 $O(|S|^3)$ + 改进 $O(|S|^2|A|)$ |
| 特点 | 更新简单，轮数多 | 轮数少，每轮重 |

### 7. 收敛性理论（Appendix）

Bellman 算子是**压缩映射** $\Rightarrow$ 唯一不动点。

$$\|U_N - U\| \le \gamma^N \cdot \frac{2R_{\max}}{1-\gamma} \le \epsilon \quad\Longrightarrow\quad N = \left\lceil \frac{\log\!\big(2R_{\max} / (\epsilon(1-\gamma))\big)}{\log(1/\gamma)} \right\rceil$$

**终止条件**：
$$\text{if } \|U_{i+1} - U_i\| < \frac{\epsilon(1-\gamma)}{\gamma} \quad\text{then}\quad \|U_{i+1} - U\| < \epsilon$$

**Policy loss**：$\|U^{\pi_i} - U\|$ = 用 $\pi_i$ 而非 $\pi^*$ 的最大损失。
$$\text{if } \|U_i - U\| < \epsilon \quad\text{then}\quad \|U^{\pi_i} - U\| < 2\epsilon$$
> 实践中策略往往**远早于**效用收敛就已经最优。

**Policy Improvement Theorem** (SB 4.2)：对两个确定性策略 $\pi, \pi'$，若
$$Q^\pi(s, \pi'(s)) \ge U^\pi(s), \quad \forall s \in S$$
则 $U^{\pi'}(s) \ge U^\pi(s),\ \forall s$；若某状态严格大于，则改进也严格。

### 8. 维度灾难

Tetris：$N$ 格子 $\Rightarrow$ $2^N$ 状态，VI / PI 都不可行。出路：Modified Policy Iteration、Approximate DP、Fitted Value Iteration，以及 —— **强化学习**。

---

## Lecture 4B — Sequential Decision Making under Uncertainty (`Lecture-sdm.pdf`, RN 22.1–22.3)

$T$ 和 $R$ **未知**，靠交互学习。

### 被动 RL（预测，$\pi$ 固定，学 $U^\pi$）

$$U^\pi(s) = \mathbb{E}_\pi\left[\sum_{t=0}^{\infty} \gamma^t R(S_t, \pi(S_t), S_{t+1}) \,\Big|\, S_0 = s\right] = \mathbb{E}_\pi[G_0 \mid S_0 = s]$$

其中回报 $G_t = R_t + \gamma R_{t+1} + \gamma^2 R_{t+2} + \cdots$

**① ADP（Adaptive Dynamic Programming，model-based）**
数频次做 MLE 估 $\hat{P}(s'\mid s,a)$ 和 $\hat{R}(s,a,s')$（监督学习），再解
$$U^\pi(s) = \sum_{s'} \hat P(s'\mid s,\pi(s))\Big[\hat R(s,\pi(s),s') + \gamma U^\pi(s')\Big]$$
用 Bellman 期望方程强制**全局一致性**，$O(|S|^3)$。

**② Monte Carlo（直接效用估计，model-free）**
$$U^\pi(s) \leftarrow \frac{1}{N(s)} \sum_{i=1}^{N(s)} G_t^i, \qquad Q(s,a) \leftarrow \frac{1}{N(s,a)} \sum_{i=1}^{N(s,a)} G_t^i$$
$\mathbb{E}[G] = U^\pi(s)$ $\Rightarrow$ **无偏**，但**高方差**、必须等整集结束、不强制 Bellman 一致性。

**③ Temporal Difference TD(0)（model-free）**
$$U^\pi(s) \leftarrow U^\pi(s) + \alpha\Big[\underbrace{R(s,\pi(s),s') + \gamma U^\pi(s')}_{\text{TD target}} - U^\pi(s)\Big]$$
方括号整体 = **TD error**。学习率 $\alpha$ 需衰减，如 $\alpha(n) = 1/n$；当每个状态被访问无穷多次时收敛。

**n-step TD**：
$$G_t^{(n)} = R_t + \gamma R_{t+1} + \cdots + \gamma^{n-1} R_{t+n-1} + \gamma^n U^\pi(S_{t+n}), \qquad U^\pi(S_t) \leftarrow U^\pi(S_t) + \alpha\big(G_t^{(n)} - U^\pi(S_t)\big)$$
$n=1$ 即 TD(0)，$n=\infty$ 即 MC。

**TD(λ)**：对不同 $n$ 的回报加权平均
$$u_t^\lambda = (1-\lambda)\sum_{n=1}^{\infty} \lambda^{n-1} u_{t:t+n}, \qquad \sum_{n=1}^{\infty}\lambda^{n-1} = \frac{1}{1-\lambda}$$
$\lambda \to 0$ 退化为 TD，$\lambda \to 1$ 退化为 MC；可用 eligibility traces 高效实现。

**三者对比**

| | ADP | TD(0) | MC |
|---|---|---|---|
| 需要模型 | ✅ 需要 $T,R$ | ❌ model-free | ❌ model-free |
| 更新时机 | 规划 sweep 后 | 每一步 | 每集结束后 |
| Bootstrap | ✅（用模型） | ✅（用样本） | ❌ |
| 偏差 / 方差 | 低方差、高偏差 | 较低方差、有偏差 | **高方差、无偏差** |
| 数据效率 | 最高 | 中等 | 最低 |
| 单次更新开销 | 重 | 轻 | 轻（但延迟） |

### 主动 RL（控制，学 $\pi^*$）

$$U(s) = \max_a \sum_{s'} P(s'\mid s,a)\big[R + \gamma U(s')\big], \qquad Q^*(s,a) = \sum_{s'} P(s'\mid s,a)\Big[R + \gamma \max_{a'} Q^*(s',a')\Big]$$

**Generalized Policy Iteration (GPI)**：评估 $\leftrightarrow$ 贪婪改进交替，是所有方法的统一框架。

**① Active ADP / Greedy ADP**：学模型 + 用 Bellman 最优方程解 $U$。纯贪婪会收敛到**次优**策略（grid world 里 (2,1) 会向右而非向左）。

**② 探索 vs 利用**
- **GLIE**（Greedy in the Limit of Infinite Exploration）：每个 $(s,a)$ 试无穷多次，同时逐渐变贪婪 $\Rightarrow$ 收敛到 $\pi^*$
- $\epsilon$-greedy：以 $1-\epsilon$ 贪婪、$\epsilon$ 随机；$\epsilon = 1/t$ 衰减
- **乐观探索函数** $f(u,n)$（随 $u$ 增、随 $n$ 减）：
  $$f(u,n) = \begin{cases} R^+ & \text{if } n < N_e \\ u & \text{otherwise}\end{cases}$$
  $$U^+(s) \leftarrow \max_a f\!\left(\sum_{s'} P(s'\mid s,a)\big[R(s,a,s') + \gamma U^+(s')\big],\ N(s,a)\right)$$

**③ Monte Carlo Control**
$$Q(s,a) \leftarrow \frac{1}{N(s,a)}\sum_{i=1}^{N(s,a)} G_t^i, \qquad \pi(s) = \arg\max_a f\big(Q(s,a), N(s,a)\big)$$

**④ SARSA（on-policy）**
$$Q(s,a) \leftarrow Q(s,a) + \alpha\Big[R(s,a,s') + \gamma\, Q(s', a') - Q(s,a)\Big]$$
$a'$ 是在 $s'$ **实际按当前策略选的**动作；用完整五元组 $(s,a,r,s',a')$ 更新。

**⑤ Q-learning（off-policy）**
$$Q(s,a) \leftarrow Q(s,a) + \alpha\Big[R(s,a,s') + \gamma \max_{a'} Q(s',a') - Q(s,a)\Big]$$

两者都在「$\epsilon$ 衰减 + $\alpha$ 衰减 + 所有 $(s,a)$ 访问无穷多次」下收敛到 $\pi^*$。

| | SARSA | Q-learning |
|---|---|---|
| 类型 | on-policy | off-policy |
| Target | $Q(s',a')$，实际采取的动作 | $\max_{a'} Q(s',a')$，最优动作 |
| 探索影响 | 把坏的探索后果算进去 $\Rightarrow$ **保守、安全** | 忽略探索后果 $\Rightarrow$ **乐观、冒险** |
| 表现 | 慢但稳 | 快但险 |
| 相同点 | 当 agent 从不探索（永远贪婪）时两者等价 | |

**Cliff Walking**（每步 $-1$，掉崖 $-100$，$\epsilon = 0.1$）：SARSA 学到远离悬崖的安全路径，Q-learning 学到贴着悬崖的最优路径但在线表现更差。

---

## Lecture 5 — Model-Free RL (`Lecture-rl-modelfree.pdf`, RN 22.4.1–22.4.3, 22.5)

**动机**：表格法撑不住 —— Backgammon $\sim 10^{20}$、Chess $\sim 10^{40}$、Go $\sim 10^{172}$，无法「每个状态访问无穷多次」。两条出路：**函数逼近** + **策略搜索**。

### 1. 线性函数逼近

$$\hat U_\theta(s) = g(s;\theta) \quad\text{（$g$ 可微）}, \qquad \hat U_\theta(s) = \theta_0 f_0(s) + \theta_1 f_1(s) + \cdots + \theta_n f_n(s),\quad f_0 \equiv 1$$

Grid world 例：$\hat U_\theta(x,y) = \theta_0 + \theta_1 x + \theta_2 y$；若 $\theta = (0.5, 0.2, 0.1)$ 则 $\hat U(1,1) = 0.8$。
好处：**紧凑表示 + 泛化**；代价：参数太少则逼近能力不足。

**近似 MC（监督学习）**：样本 $\big((x_j,y_j), u_j\big)$，逐样本损失
$$\mathcal{E}_j(s) = \tfrac12\big(\hat U_\theta(s) - u_j(s)\big)^2 \quad\Longrightarrow\quad \theta_i \leftarrow \theta_i + \alpha\big(u_j(s) - \hat U_\theta(s)\big)\frac{\partial \hat U_\theta(s)}{\partial \theta_i}$$
即 **Widrow–Hoff / Delta 规则**。线性情形展开为
$$\theta_0 \leftarrow \theta_0 + \alpha\,\delta,\quad \theta_1 \leftarrow \theta_1 + \alpha\,\delta\, x,\quad \theta_2 \leftarrow \theta_2 + \alpha\,\delta\, y,\qquad \delta = u_j(s) - \hat U_\theta(s)$$

**近似 TD（semi-gradient）**：target 里含 $\theta$，求梯度时当作常数。
$$\text{TD}(0):\quad \theta_i \leftarrow \theta_i + \alpha\Big[R(s,a,s') + \gamma \hat U_\theta(s') - \hat U_\theta(s)\Big]\frac{\partial \hat U_\theta(s)}{\partial \theta_i}$$
$$\text{SARSA}:\quad \theta_i \leftarrow \theta_i + \alpha\Big[R + \gamma \hat Q_\theta(s',a') - \hat Q_\theta(s,a)\Big]\frac{\partial \hat Q_\theta(s,a)}{\partial \theta_i}$$
$$Q\text{-learning}:\quad \theta_i \leftarrow \theta_i + \alpha\Big[R + \gamma \max_{a'} \hat Q_\theta(s',a') - \hat Q_\theta(s,a)\Big]\frac{\partial \hat Q_\theta(s,a)}{\partial \theta_i}$$

### 2. 不稳定性

**The Deadly Triad** —— 三者单独都没问题，**同时出现**则可能发散：
1. 函数逼近（一次更新牵动很多状态）
2. Bootstrapping（target 在动）
3. Off-policy 学习（数据分布与目标策略不匹配）

经典反例：**Baird's counterexample**（线性逼近 + off-policy semi-gradient TD，$w_8$ 无界增长）。

**Catastrophic forgetting**：过训练 / 覆盖不足 $\Rightarrow$ 罕访问区域估值退化。解法：**Experience Replay**。

### 3. Deep RL / DQN

$\hat U_\theta(s) = g(s;\theta)$，最后一层通常线性，$f_i(s)$ 就是最后隐层输出；反向传播求梯度。

**DQN (Mnih et al., Nature 2015)**：输入最近 4 帧原始像素，输出 18 个摇杆动作的 $Q(s,a)$，reward = 分数变化，所有游戏共用同一架构与超参。

两大稳定技巧：**经验回放** + **固定 target 网络** $\theta^-$
$$y = r + \gamma \max_{a'} Q(s', a'; \theta^-), \qquad \mathcal{L}(\theta) = \big(y - Q(s,a;\theta)\big)^2, \qquad \theta^- \leftarrow \theta \ \text{（周期性同步）}$$

$$\pi_{\epsilon\text{-greedy}}(s,\theta) = \begin{cases}\text{随机动作} & \text{w.p. } \epsilon \\ \arg\max_a Q(s,a) & \text{w.p. } 1-\epsilon\end{cases}$$

**变体**
- **Double DQN**（缓解过估计，选动作与评估分开）：$y = r + \gamma\, Q\big(s', \arg\max_{a'} Q(s',a';\theta);\ \theta^-\big)$
- **Multi-step**：$y = r_1 + \gamma r_2 + \cdots + \gamma^N \max_{a_N} Q(s_N, a_N; \theta^-)$
- **Distributional RL**：学回报**分布**，$Q(s,a) = \mathbb{E}[\hat Q(s,a)]$
- **Prioritized replay**：TD error 大的转移采样更频繁

**DQN 的局限**：① 连续动作空间里 $\max_a Q(s,a)$ 不可解；② 每步要给所有动作打分，$|A|$ 大时开销与不稳定性上升；③ 贪婪策略是确定性的，无法表达多模态 / 内在随机策略。

### 4. 策略搜索 / Policy Gradient

$$\pi_\theta(a\mid s),\qquad J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}\left[\sum_{t=0}^{T-1}\gamma^t r_t\right] = \sum_s p_0(s)\sum_a \pi_\theta(a\mid s)\, Q^{\pi_\theta}(s,a)$$

目标：梯度上升 $\theta \leftarrow \theta + \alpha \nabla_\theta J(\theta)$。

**策略梯度定理**：
$$\nabla_\theta J(\theta) = \mathbb{E}_{\pi_\theta}\Big[Q^{\pi_\theta}(s,a)\,\nabla_\theta \log \pi_\theta(a \mid s)\Big]$$

**可微参数化**：确定性 $\arg\max$ 对离散动作不可微 $\Rightarrow$ 用 **softmax 策略**
$$\pi_\theta(a \mid s) = \frac{e^{\beta h_\theta(s,a)}}{\sum_{a'} e^{\beta h_\theta(s,a')}}$$
$\beta$ 越大越接近 $\arg\max$。

**REINFORCE**：用 $G_t$ 做 $Q^{\pi_\theta}$ 的 MC 估计
$$\nabla_\theta J(\theta) = \mathbb{E}_{\tau\sim\pi_\theta}\left[\sum_t \gamma^t G_t\, \nabla_\theta \log\pi_\theta(a_t\mid s_t)\right], \qquad \theta \leftarrow \theta + \alpha\sum_t \gamma^t G_t\, \nabla_\theta \log \pi_\theta(a_t\mid s_t)$$
推导用 **log-derivative trick**：$\dfrac{\nabla_\theta \pi_\theta}{\pi_\theta} = \nabla_\theta \log\pi_\theta$

**高方差 → baseline**：减去任意 $B(s)$ 不改变期望梯度
$$\sum_a \nabla_\theta \pi_\theta(a\mid s)\,B(s) = B(s)\,\nabla_\theta \sum_a \pi_\theta(a\mid s) = B(s)\,\nabla_\theta 1 = 0$$
> 课件数值例：$\mathrm{Var} = 15{,}275 \to 28.4$。

取 $B(s) = \hat U_\phi(s)$，定义**优势函数**
$$A^{\pi_\theta}(s,a) = Q^{\pi_\theta}(s,a) - U^{\pi_\theta}(s), \qquad \nabla_\theta J(\theta) = \mathbb{E}_{\pi_\theta}\big[A^{\pi_\theta}(s,a)\,\nabla_\theta\log\pi_\theta(a\mid s)\big]$$

### 5. Actor–Critic

- **Actor** = 策略 $\pi_\theta(a\mid s)$（参数 $\theta$）
- **Critic** = 值函数 $\hat U_w(s)$ 或 $\hat Q_w(s,a)$（参数 $w$）

用一步 TD 近似优势：
$$A^{\pi_\theta}(s,a) \approx \delta_t = r_t + \gamma \hat U(s_{t+1}, w) - \hat U(s_t, w)$$

$$\textbf{Actor: } \theta_{t+1} = \theta_t + \alpha\,\nabla_\theta \log\pi_\theta(a_t\mid s_t)\,\delta_t$$
$$\textbf{Critic: } w_{t+1} = w_t + \beta\,\delta_t\,\nabla_w \hat U(s_t, w)$$

变体：**A2C**（同步批量）、**A3C**（异步多 agent）、**ACER**（+replay+retrace+trust region）、**DDPG**、**SAC**（熵正则、off-policy、连续控制）。

### 6. TRPO 与 PPO

**问题**：vanilla PG 步子可能太大 $\Rightarrow$ 破坏性更新。目标：**单调改进** $J(\theta_{\text{new}}) \ge J(\theta_{\text{old}})$（每轮最大化一个下界 surrogate $M_i(\theta_i)$）。

**TRPO**（信赖域，"速度限制"）：
$$\max_\theta\ \mathcal{L}_{\pi_\theta} \quad \text{s.t.} \quad \max_s\ \mathrm{KL}\big[\pi_{\text{old}}(\cdot\mid s)\ \|\ \pi_\theta(\cdot\mid s)\big] \le \delta$$

**PPO**（把 TRPO 做成工程可用，clipped surrogate）：
$$r_t(\pi) = \frac{\pi_\theta(a_t\mid s_t)}{\pi_{\text{old}}(a_t\mid s_t)}, \qquad \mathcal{L}^{\text{CLIP}}(\theta) = \mathbb{E}_t\Big[\min\big(r_t(\pi)A_t,\ \mathrm{clip}(r_t(\pi), 1-\epsilon, 1+\epsilon)A_t\big)\Big]$$
当 $r_t(\pi)$ 跑出 $[1-\epsilon,\,1+\epsilon]$，目标不再增长 $\Rightarrow$ 阻止过大更新。

PPO 本质是 **actor–critic**：critic 给 $A_t = r_t + \gamma\hat U_w(s_{t+1}) - \hat U_w(s_t)$（或多步回报），actor 用裁剪后的目标做安全的一步。

**主线总结**

| 概念 | 核心思想 | 代表算法 |
|---|---|---|
| Policy Gradient | 直接从采样回报优化 $\pi_\theta(a\mid s)$ | REINFORCE |
| 方差缩减 | 学一个 baseline $\hat U(s,w)$ | Actor–Critic |
| 稳定改进 | 约束更新保证单调改进 | TRPO |
| 工程可用 | 用 clipping 简化信赖域 | PPO |
| 探索与鲁棒 | 熵正则 / 更好的信号 | SAC, Reward Shaping |

---

## Tutorial 2（Week 4）— Rational Decision Making

> ⚠️ Tutorial 2 考的是 **Week 3 的效用理论**，不是 MDP。

**复习要点**：理性选择 = 信念 + 偏好；MEU；彩票记号 $[p, x]$；效用曲线**曲率 ↔ 风险态度**；确定性等价 CE 与风险溢价（课件例：$50 - 25 = 25$）。

### Problem 1 — Utility Matchmaker

$$L_1 = [1,\,1], \qquad L_2 = [0.5,\,2;\ 0.5,\,0], \qquad L_3 = [1,\,2]$$

| 学生 | 偏好 | 含义 |
|---|---|---|
| Adam | $L_2 \sim L_1$ | 风险中性 |
| Bing | $L_1 \succ L_2$ | 风险厌恶 |
| Candy | $L_3 \sim L_2$ | 要求 $U(2) = 0.5U(2) + 0.5U(0)$ |
| Diana | $L_2 \succ L_1$ | 风险偏好 |

候选：(a) $U(x) = x^2$，(b) $U(x) = x$，(c) $U(x) = \sqrt{x}$，(d) 以上都不是。
建一张 $EU$ 表再匹配；**Candy 的等式任何一条曲线都无法满足** $\Rightarrow$ (d)。

**Part B**：若 $U_1 = k_1 U_2 + k_2,\ k_1 > 0,\ k_2 \in \mathbb{R}$，两个 agent 偏好是否相同？
证明**正仿射变换保序**：对任意彩票 $L, L'$，
$$EU_1(L) - EU_1(L') = k_1\big(EU_2(L) - EU_2(L')\big)$$
$k_1 > 0$ 时符号不变 $\Rightarrow$ 偏好完全一致。（扩展：为什么必须 $k_1 > 0$ —— $k_1 < 0$ 会把偏好完全反转。）

### Problem 2 — Adventures of PacBaby

$U(x) = \log(1+x)$，初始 $\$100$，被偷概率 $0.2$，$U(100) = \log 101,\ U(0) = 0$。

**(a) 不买保险**：
$$EU = 0.8 \cdot \log(101) + 0.2 \cdot \log(1) = 0.8\log 101 \approx 3.693$$

**(b) 买保险**：保费 $\$30$，被偷则赔 $\$70$ —— 两种情形最终都是 $\$70$，效用**与状态无关**：
$$EU = \log(71) \approx 4.263 \ >\ 0.8\log 101$$
$\Rightarrow$ **应该买**，尽管期望财富反而下降（$\$80 \to \$70$）。

**(c) 保险公司视角**：
$$\mathbb{E}[\text{利润}] = 30 - 0.2 \times 70 = 30 - 14 = \$16 > 0$$

**扩展**：PacBaby 的确定性等价
$$\log(1 + \text{CE}) = 0.8\log 101 \ \Longrightarrow\ \text{CE} \approx \$39.13$$
以及「她最多愿意付多少保费」、「为什么双方都能获益（钱从哪来？）」—— 答案是风险厌恶者愿为消除风险付溢价，风险本身被转移而非凭空生钱。

### Problem 3 — Allais Paradox

$$A: 0.8 \text{ chance of } \$4000 \qquad\qquad C: 0.2 \text{ chance of } \$4000$$
$$B: 1.0 \text{ chance of } \$3000 \qquad\qquad D: 0.25 \text{ chance of } \$3000$$

多数人选 $B \succ A$ 且 $C \succ D$。

**(a)** 令 $U(\$0) = 0$：
$$B \succ A:\quad U(3000) > 0.8\,U(4000) \quad\Longrightarrow\quad \frac{U(3000)}{U(4000)} > 0.8$$
$$C \succ D:\quad 0.2\,U(4000) > 0.25\,U(3000) \quad\Longrightarrow\quad \frac{U(3000)}{U(4000)} < 0.8$$
两式**互相矛盾** $\Rightarrow$ 不存在同时解释两个选择的效用函数。

**(b)** 用**可分解性公理**把 $C, D$ 改写成以 $A, B$ 为内层的复合彩票：
$$C \equiv [0.25,\ A;\ 0.75,\ \$0], \qquad D \equiv [0.25,\ B;\ 0.75,\ \$0]$$
于是 $B \succ A$ 依**可替代性公理**必须推出 $D \succ C$，与观察到的 $C \succ D$ 冲突 $\Rightarrow$ 违反可替代性。

---

## Tutorial 3（Week 5）— Sequential Decision Making under Uncertainty

> **奖励约定**（务必全程统一，混用必错）：
> - AIMA 4e 通用形式 $R(s,a,s')$
> - **reward-on-entry**（本课默认）：$R(s,a,s') = f(s')$
> - reward-of-current-state：$R(s,a,s') = f(s)$
> - Episodic RL 中终止状态值为 $0$，进入终止态的奖励算在那次转移上（Sutton & Barto 约定）

### Problem 1 — Nova the Mars Rover

$$S = \{\text{charged},\ \text{low}\}, \qquad A = \{\text{eco},\ \text{boost}\}$$

| $s$ | $a$ | $P(s' = \text{charged})$ | $R(s,a)$ |
|---|---|---|---|
| charged | eco | $0.95$ | $7$ |
| charged | boost | $0.70$ | $10$ |
| low | eco | $0.50$ | $0$ |
| low | boost | $0.10$ | $2$ |

$2 \times 2 = 4$ 个平稳策略：EE / BB / EB（charged 用 eco、low 用 boost）/ BE。无折扣时四者总回报都发散。

**Part 1：折扣**
- (a) 折扣的作用；$\gamma = 0.6$ vs $\gamma = 0.9$ 行为差异（短视 vs 远视）
- (b) $\gamma$ 从 $0 \to 1$ 变化时最优策略如何切换，为每个可得策略给一个 $\gamma$ 例子
- (c) 如何**最小改动**（概率 / 奖励 / $\gamma$）使 EB 成为最优
- (d) $\gamma$ 的现实含义（未来的不确定性 / 利率 / 存活概率）；为什么 $\gamma = 1$ 出问题（无限视界下回报发散、无 proper policy）

**Part 2：最优策略**（$\gamma = 0.8$，记 $V = [V_{\text{charged}},\, V_{\text{low}}]$）

$$V^{(0)} = [0,\,0], \quad Q^{(0)}(c,\text{eco}) = Q^{(0)}(c,\text{boost}) = Q^{(0)}(l,\text{eco}) = Q^{(0)}(l,\text{boost}) = 0$$

- (a) 由 $V^{(0)}$ 算更新后的 Q 值：$\;Q(s,a) = R(s,a) + \gamma\big[P(c\mid s,a)V_c + (1 - P(c\mid s,a))V_l\big]$
- (b) 算 $V^{(1)}(s) = \max_a Q(s,a)$
- (c) 从 $V^{(1)} = [10,\,2]$ 出发算 $V^{(2)}$，两条路线对比：
  - **VI**：直接 Bellman 最优更新 $V^{(2)}(s) = \max_a\big[R(s,a) + \gamma\sum_{s'}P(s'\mid s,a)V^{(1)}(s')\big]$
  - **PI**：先取贪婪策略 $\pi^{(1)} = \arg\max_a Q^{(1)}(s,a)$，再**精确解线性方程组**求 $V^{\pi^{(1)}}$
- (d) 最优策略是什么

> 课件还额外推导了「Nova 处于 charged 的概率 $p_t$ 的递推式」：由全概率公式得一阶线性递推，解 = **稳态项 + 指数衰减的瞬态项**。

### Problem 2 — Aster's Rescue Route（四种 Active RL 对比）

$s_0$ 可选 $a$（valley）或 $b$（ridge）；中间态 $s_1$ 可选 $c$ 或 $d$；$T$ 为终止态；$\gamma = 0.8$，模型初始未知。

历史观测（来自 $s_0$）：

| 动作 | 下一状态 | 奖励 | 观测次数 |
|---|---|---|---|
| $a$ | $s_1$ | $0$ | 4 |
| $b$ | $T$ | $6$ | 3 |
| $b$ | $s_1$ | $-2$ | 1 |

新一集：$\;s_0 \xrightarrow{\;b,\ -2\;} s_1 \xrightarrow{\;d,\ 5\;} T$

**(a) Active ADP**：更新计数式转移概率（$b$ 现在是 $3$ 次到 $T$、$2$ 次到 $s_1$，共 5 次）；给定 $U(s_1) = 4,\ U(T) = 0$，算
$$Q(s_0, a) = \sum_{s'}\hat P(s'\mid s_0,a)\big[R + \gamma U(s')\big], \qquad Q(s_0,b) = \cdots$$
比较后取贪婪动作。

**(b) Monte Carlo Control**：此前 $(s_0, b)$ 的完整回报为 $6, 6, 6, 2$；先算本集回报
$$G = -2 + \gamma \cdot 5 = -2 + 0.8 \times 5 = 2$$
再用全部五个回报更新
$$Q(s_0,b) \leftarrow \frac{6 + 6 + 6 + 2 + 2}{5} = 4.4$$

**(c) SARSA vs Q-learning**（$\alpha = 0.5$，当前 $Q(s_0,a)=3,\ Q(s_0,b)=2,\ Q(s_1,c)=4,\ Q(s_1,d)=1$；行为策略在 $s_1$ 选了 $d$）

$$\textbf{SARSA:}\quad Q(s_0,b) \leftarrow 2 + 0.5\big[-2 + 0.8 \times \underbrace{Q(s_1,d)}_{=1} - 2\big] = 2 + 0.5(-3.2) = 0.4$$

$$\textbf{Q-learning:}\quad Q(s_0,b) \leftarrow 2 + 0.5\big[-2 + 0.8 \times \underbrace{\max_{a'}Q(s_1,a')}_{=4} - 2\big] = 2 + 0.5(-0.8) = 1.6$$

**(d)** 若行为策略在 $s_1$ 选的是 $c$ 而非 $d$：**SARSA 的 target 会变**（用 $Q(s_1,c) = 4$，结果与 Q-learning 相同）；**Q-learning 完全不变**（本来就用 $\max$）—— 这正是 on-policy / off-policy 的本质区别。

**(e)** 四种方法各学什么、如何用经验改进策略：

| 方法 | 学什么 | 如何用经验 |
|---|---|---|
| Active ADP | $\hat P, \hat R$（模型）→ 解 $U$ | 计数更新模型，再全局规划 |
| MC Control | $Q(s,a)$ | 整集结束后平均真实回报 |
| SARSA | $Q(s,a)$ | 每步用**实际下一动作**做 TD 更新 |
| Q-learning | $Q^*(s,a)$ | 每步用 $\max_{a'}$ 做 TD 更新 |

**(f)** 为什么四种方法都离不开探索：Bellman 最优方程要求对所有 $(s,a)$ 有估计；纯贪婪会锁死在次优策略（greedy ADP 的反例）；收敛性证明都依赖「所有 $(s,a)$ 被访问无穷多次」（GLIE）。

### (选做) Problem 3 — RL in the Real World

RL 与行为心理学、神经科学（多巴胺 ≈ TD error）、进化与适应行为、教育的联系；内在 / 生物性奖励信号与决策的关系；这些领域的发现如何反过来塑造了机器学习中的 RL 技术。

---

## 一句话串联

**Lecture 4A** 解决「模型已知怎么算最优策略」（VI / PI）；**Lecture 4B + Tutorial 3** 解决「模型未知怎么学」（ADP / MC / TD、SARSA / Q-learning、探索-利用）；**Lecture 5** 解决「状态空间太大怎么办」（函数逼近、DQN、策略梯度、Actor–Critic、PPO）；**Tutorial 2** 补齐这一切背后的规范性基础 —— 为什么最大化期望**效用**（而非期望金额）才是理性的。
