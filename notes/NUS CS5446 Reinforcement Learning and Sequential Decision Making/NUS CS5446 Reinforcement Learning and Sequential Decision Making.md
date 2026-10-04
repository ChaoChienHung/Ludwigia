<meta>
Title: NUS CS5446 Reinforcement Learning and Sequential Decision Making
Summary: Comprehensive lecture and study notes for NUS CS5446 Reinforcement Learning and Sequential Decision Making (AI Planning and Decision Systems), covering AI planning foundations, classical planning (STRIPS, PDDL, SATPlan), LFM-assisted modern planning, scalable heuristics (HTN), rational decision theory, utility theory, game theory, Markov decision processes, model-free reinforcement learning, value function approximation, Deep Q-Networks (DQN), policy gradients, REINFORCE, Actor-Critic methods, advanced trust-region policy search (TRPO, PPO), reward shaping (potential-based policy invariance, exploration bonuses with pseudo-counts and RND, exploitation bottleneck discovery, process reward models, RLHF preference alignment, advanced multi-agent reward architectures ReLara, CenRA, SASR), and guided sequential decision making (decision-time online search, rollout algorithms, Monte Carlo Tree Search, UCT, AlphaGo Zero PUCT, demonstration-based offline planning, Behavioral Cloning covariate shift, DAgger interactive dataset aggregation, and Generative Adversarial Imitation Learning GAIL).
Slug: nus-cs5446-reinforcement-learning-and-sequential-decision-making
Output: notes/NUS CS5446 Reinforcement Learning and Sequential Decision Making/NUS CS5446 Reinforcement Learning and Sequential Decision Making.html
CanonicalId: nus-cs5446-reinforcement-learning-and-sequential-decision-making
Style: default
EstimatedReadingTime: true
Lang: en
Tags: AI Planning, Classical Planning, STRIPS, PDDL, SATPlan, Automated Reasoning, Decision Theory, Game Theory, Reinforcement Learning
Status: drafting
Published: 2026-08-20
LastModified: 2026-10-04
</meta>

# NUS CS5446 Reinforcement Learning and Sequential Decision Making

## Course Reading Architecture

這門課不是把 Planning、Decision Theory、RL、Reward Shaping、Search 分成互不相干的技巧，而是逐步回答同一個問題：**agent 如何在環境中形成可執行、可評估、可改進的 sequential decision policy？** 建議用下面的依賴關係閱讀：

```text
Week 1  已知、確定的世界：如何表示問題並找出 plan？
   ↓  真實世界通常有子目標、抽象層與可達性限制
Week 2  把 planning 擴展到可組合的結構與 state abstraction
   ↓  不只問「能不能完成」，還要問「什麼結果值得追求？」
Week 3  Decision theory / utility / game theory：定義理性選擇
   ↓  加入 stochastic transition 與 delayed reward
Week 4  MDP、Bellman equation、dynamic programming、tabular RL
   ↓  state/action 空間變大，表格不夠用
Week 5  Function approximation、DQN、policy gradient、actor-critic
   ↓  reward 太稀疏、太慢或不可靠，學習訊號需要設計
Week 6  Exploration、PBRS、process reward、RLHF、多 agent reward
   ↓  runtime search 與 demonstrations 提供另一種引導
Week 7  Rollout、MCTS、UCT、AlphaGo Zero、imitation learning
```

每週都用同一個檢查框架閱讀：`state / action / transition / objective / information / improvement mechanism`。其中 Week 1–2 建立「如何描述與搜尋」，Week 3–4 建立「如何定義與計算價值」，Week 5–6 建立「如何在大規模或弱 reward 下學習」，Week 7 則比較「靠 runtime search」與「靠 demonstrations」兩條引導路線。

| Week | 本週新增的核心問題 | 讀完後應能接到哪裡 |
|---|---|---|
| 1 | 如何在 deterministic、fully observable world 中表示並求解 plan？ | 為 Week 2 的 abstraction 與 real-world acting 建立語言 |
| 2 | 如何把大問題拆成可組合的 subgoals、HTN 與 reachable sets？ | 從可行性自然過渡到 Week 3 的 preference 與 utility |
| 3 | 如何形式化「理性」與多 agent 下的衝突／合作？ | 為 Week 4 的 MDP objective 與 value function 定義目標 |
| 4 | 如何在不確定與 delayed feedback 下計算 policy/value？ | 為 Week 5 的 approximation 與 deep RL 暴露 scalability bottleneck |
| 5 | 如何用 function approximator 取代表格，並處理 gradient instability？ | 為 Week 6 說明為何 reward design 會決定 exploration 與 alignment |
| 6 | 如何提供更有用、但不改變原目標的 reward signal？ | 為 Week 7 比較 search 與 demonstrations 的 guidance |
| 7 | 如何在決策當下搜尋，或從 expert data 學會行為？ | 回收整門課：model-based search、model-free learning、imitation 的取捨 |

> **閱讀提示：** 每個新方法都先問它修補前一週的哪個瓶頸，再讀公式與演算法；這樣 DQN、PPO、PBRS、MCTS 不會變成孤立名詞，而會被看成對「狀態空間、回饋、計算預算、資料來源」不同限制的回應。

## Course Master Map: Represent, Evaluate, Learn, and Guide Decisions

整門課共同研究 agent 如何選擇行動。Classical planning 先以達成 goal／降低 plan cost 表達目標；utility theory 再處理結果偏好；MDP/RL 才以 expected return 表達序列決策。Reward 是其中一種形式化方式，不必倒過來把所有 planning 問題都先改寫成 RL。

```text
Represent the world
  → choose a plan when the model is deterministic and known
  → choose under uncertainty when outcomes have probabilities and utilities
  → learn values/policies when the model is unknown
  → shape information when reward is sparse or misleading
  → search or imitate when direct learning is too expensive or data is available
```

### 1. The six questions that locate every method

| 問題 | 你要辨識的內容 | 在本課程中的代表 |
|---|---|---|
| World state | state 是否完整、可觀察、是否需要 belief/history？ | classical state、MDP state、partial observation discussion |
| Action consequence | transition 是否 deterministic、stochastic、known、unknown？ | PDDL effects、MDP $T$、model-free RL |
| Objective | 目標是可行性、utility、expected return，還是 imitation loss？ | planning goal、MEU、$V/Q$、behavior cloning |
| Information source | agent 是否知道 model、只看 reward，或擁有 expert demonstrations？ | planning、ADP、MC/TD、DAgger |
| Computation location | offline planning、online decision-time search，還是 training-time update？ | SATPlan、MCTS、DQN/PPO |
| Failure mode | state explosion、variance、distribution shift、reward hacking，或 unsafe exploration？ | Week 1–7 的主要 transition 動機 |

### 2. The representation ladder

```text
PDDL / symbolic state
  → utility over outcomes
  → MDP tuple <S, A, T, R, γ>
  → tabular V(s) / Q(s,a)
  → approximate Vθ(s) / Qθ(s,a) / πθ(a|s)
  → learned search policy, reward model, or expert-data policy
```

每升一層，都要問「上一層哪個假設已經不夠」：

- symbolic planning 的優點是可驗證，但 flat search 會遇到 combinatorial explosion。
- decision theory 能比較不確定 outcome 的偏好，但單次 decision 不足以表達長期 feedback。
- MDP 加入 state transition 與 delayed reward，卻通常假設 model 已知。
- RL 拿掉 known-model 假設，但 tabular representation 無法泛化到未見 state。
- function approximation 能泛化，卻帶來 instability、bias、variance 與 deadly triad。
- reward shaping、search、imitation 都是在補充 learning signal，但可能改變 objective 或造成 distribution shift。

### 3. Algorithm family matrix

| 方法 | Model $T/R$ | 是否 bootstrapping | 主要資料 | 學的是什麼 | 典型代價 |
|---|---|---|---|---|---|
| Classical planning / SATPlan | 已知、通常 deterministic | 否 | symbolic domain | 可行 action sequence | state/action explosion |
| Value / policy iteration | 已知 stochastic model | Bellman backup | model enumeration | $V^*$ 或 policy | 需要遍歷 state/action |
| ADP | 從 experience 估 model | 間接 | transition counts | $hat T,hat R$ 再規劃 | model bias、exploration |
| Monte Carlo | 不需要 model | 否 | 完整 episode return | $V^pi$ / control policy | high variance、episode delay |
| TD / SARSA / Q-learning | 不需要 model | 是 | one-step transition | value / action value | target bias、stability |
| DQN | 不需要 model | 是 | replayed transitions | deep $Q$ | correlated target、continuous action 不適用 |
| REINFORCE | 不需要 model | return-based | sampled trajectories | stochastic policy $\pi_\theta$ | gradient variance |
| Actor-Critic / PPO | 不需要 model | critic bootstraps | trajectories + value estimate | policy + value | critic bias、update sensitivity |
| MCTS / rollout | 可用 model 或 simulator | search backup | simulated trajectories | decision-time action | per-decision computation |
| BC / DAgger / GAIL | 不必有 reward model | 視方法而定 | expert / interactive labels | policy matching | covariate shift、expert dependence |

### 4. Notation contract

後續閱讀若看到不同講義符號，先對齊下面這組語意：

- $s_t$：time $t$ 的 state；$a_t$：選出的 action；$s_{t+1}$：transition 後的 state。
- $T(s'\mid s,a)$：transition probability；$R(s,a,s')$：單一步 reward。
- $G_t=\sum_{k=0}^{\infty}\gamma^kR_{t+k+1}$：從 $t$ 開始的 return。
- $V^\pi(s)=\mathbb E_\pi[G_t\mid s_t=s]$：遵循 policy $\pi$ 的 state value。
- $Q^\pi(s,a)=\mathbb E_\pi[G_t\mid s_t=s,a_t=a]$：先採取 $a$ 後再遵循 $\pi$ 的 action value。
- $V^*$、$Q^*$：在之後採最佳行動時的 optimal values；$\pi^*$：使它們達到最大值的 policy。
- policy evaluation 是「固定 $\pi$，估計它多好」；control 是「改變 $\pi$，找更好的 policy」。

### 5. Five confusions to resolve before reading formulas

| 容易混淆 | 正確區分 |
|---|---|
| Planning vs. RL | planning 的 model 通常已知；RL 要從 interaction 推斷 value/policy |
| Value iteration vs. policy iteration | 前者直接反覆套 optimality backup；後者交替 evaluation 與 improvement |
| MC vs. TD | MC 等 episode 結束才用完整 return；TD 用下一步估計 bootstrapping |
| SARSA vs. Q-learning | SARSA 評估 behavior policy 實際選的 $a'$；Q-learning 評估 greedy target $\max_{a'}Q(s',a')$ |
| Reward shaping vs. reward hacking | shaping 是設計 learning signal；hacking 是 agent 利用 proxy 的漏洞而偏離真正目的 |

### 6. What “complete understanding” means for each week

每週不只要會說明名詞，還應能完成四個動作：

1. **建模：** 寫出 state、action、transition、objective 與 information assumption。
2. **推導：** 從目標函數推到 Bellman、gradient、update rule 或 correctness invariant。
3. **比較：** 說明新方法修補前一方法的哪個 bottleneck，以及它新增了什麼代價。
4. **診斷：** 給定一個失敗現象，判斷是 representation、exploration、variance、distribution shift、reward design 還是 computation budget 的問題。

> **總結：** Week 1–2 解決「如何表示與分解問題」；Week 3 解決「如何定義偏好與理性」；Week 4 解決「已知／未知 stochastic dynamics 下如何計算 value」；Week 5 解決「空間太大時如何泛化與穩定學習」；Week 6 解決「reward 不足或不可靠時如何提供 guidance」；Week 7 解決「可否在決策時搜尋，或從示範資料直接學行為」。


# Week 1 - AI Planning Foundations, Classical Planning, SATPlan, and Responsible AI Governance

<draft>
- 1. Foundations of AI Planning & The Rational Agent Architecture
    - The Perception-Action-Communication Loop: Sensing, Communicating, Acting.
    - Architectural Pipeline: Perception, Learning, Modeling, Reasoning, Planning and Acting, Decision Making.
    - Diverse Real-World Applications: Parcel delivery (Google Maps API), asthma clinical pathways (AIHA guidelines), NPC gaming behavior, assistive robotics (Romibo/Aldebaran), warehouse automation (Amazon Kiva multi-agent logistics), space exploration (NASA Mars rover).
    - Formal Planning Problem Specification: States S with Initial State s0, Actions A(s), Transition Effects E(a, s), Goal test G(s). Solution: valid plan / action sequence.
    - Planning Problem Taxonomy Matrix: Simple vs. Complex along 6 fundamental environmental axes (States, Actions, Effects, Goals, Environment, Agent count).
    - The Actor's View of Planning: "How to plan to act effectively in the real world" vs. "How to act to plan effectively in the real world".
- 2. The Four Generations of AI Agents (1980s - 2030s)
    - 1980s Symbolic AI Agents: Logic rules, theorem proving, STRIPS planning, closed-world reasoning.
    - 2000s Reinforcement Learning Agents: Trial and error, reward signals, optimal policy pi(a|s) learning.
    - 2020s LLM Agents: Pretrained foundation models, natural language reasoning, ReACT (Reasoning + Acting) loop, Chain-of-Thought (CoT).
    - 2030s Tool-Using Multi-Agent Ecosystems: Distributed planning, multi-agent coordination, specialized tool/API delegation.
    - Modern Agentic AI Landscape: Foundation Models + Memory Systems (Short-term/Long-term episodic) + Cognitive Processes + External Tools. Economic impact (one-person unicorn projection).
- 3. Classical Planning Paradigm & PDDL Representation
    - Classical Planning Definition: Deterministic, static, discrete, fully observable environments.
    - 4 Core Challenges: Representation, Search, Heuristic guidance, Abstraction hierarchy.
    - Historical Origins: STanford Research Institute Problem Solver (STRIPS; Fikes & Nilsson 1971), PDDL evolution.
    - Factored State Representation: State as conjunction of ground atomic fluents (function-free predicates).
    - Database Semantics: Closed-World Assumption (CWA) and Unique Names Assumption (UNA).
    - Model-Theoretic Goal Entailment: Goal g as partially specified state; satisfaction s |= g iff M(s) subseteq M(g). Existential variables in PDDL vs. positive ground literals in STRIPS.
    - Action Schemas & Grounding: Lifted parameterized schemas vs. concrete ground actions.
    - Applicability & State Transitions: Precondition entailment s |= Precond(a) and transition equation s' = (s - DEL(a)) union ADD(a).
    - The Frame Problem: How PDDL inertia resolves the persistence of unmentioned fluents.
    - Case Studies with Complete PDDL Code: Flight Domain and Air Cargo Transport Planning (Load, Unload, Fly; handling spurious actions).
- 4. Planning as State-Space Search
    - Forward Progression Search: Rooted at s0, forward branching, state expansion, checking s |= g.
    - Backward Regression Search: Rooted at goal g, relevant action selection, regression formulas:
        POS(g') = (POS(g) - ADD(a)) union POS(Precond(a))
        NEG(g') = (NEG(g) - DEL(a)) union NEG(Precond(a))
    - State Space vs. Partial Description Space: 2^n ground states vs. 3^n partial state descriptions.
    - Most General Unifiers (MGU): Pruning search branches during regression.
- 5. Planning as Logical Inference: SATPlan & Propositional Reduction
    - Reduction to Boolean Satisfiability (CNF).
    - The SATPlan Algorithm: Bounded horizon iteration t = 0 ... T_max, translation, SAT solver query, plan extraction.
    - The Complete "Eat a Cake!" Worked Proof:
        Initial states, goal state, action schemas across time steps t=0, 1.
        Successor-State Axioms: Exact biconditional formulations for Have(Cake, t+1) and Eaten(Cake, t+1).
        Action Exclusion Axioms: not Eat(Cake, t) or not Bake(Cake, t).
    - Frame Problem Resolution: O(mn) naive axioms reduced to O(n) Successor-State Axioms.
- 6. Real-World Applications, Industrial Ecosystem & Competitions
    - 7 Industrial Domains: Logistics/Manufacturing, Enterprise workflows, Autonomous robotics, Healthcare clinical scheduling, Gaming NPCs, Space mission autonomous operations (Mars 2020), Real-time constraint decision support.
    - Open-Source Ecosystem: The AIPlanning4EU Project & Unified Planning Library (unified-planning).
    - Competitions: ICAPS International Planning Competition (IPC 2023) tracks, Apptainer containerization, and CPLEX solver integration.
    - Alternative Classical Paradigms: Planning Graphs, Situation Calculus, CSP formulations, Partial-Order Planning (POP).
- 7. Algorithmic Properties & Computational Complexity
    - Soundness, Completeness, Optimality.
    - Decidability and Complexity Classes:
        PlanSAT: In general PSPACE-complete; in P for propositional STRIPS without negative preconditions/delete lists.
        Bounded PlanSAT: In general NP-complete.
- 8. Modern "Classical" Planning: Large Foundation Model (LFM) Assisted Planning
    - Paradigm 1: LLM-Guided PDDL Creation & Refinement (Mahdavi et al., NeurIPS 2024: Fast Downward + VAL feedback, 66% vs 29%).
    - Paradigm 2: Task Decomposition & Subgoal Planning (Kwon et al., ICRA 2025: Hybrid symbolic planner + MCTS with LLM policy).
    - Paradigm 3: Heuristic Generation via LLMs (Corrêa et al., 2025: Synthesizing Python heuristics for Pyperplan GBFS).
    - Paradigm 4: Generalized Planning in PDDL Domains (Silver et al., AAAI 2024: CoT summarization + automated debugging producing domain-specific Python programs).
- 9. Responsible & Trustworthy AI Planning and Decision Making
    - Human-Aware AI: Working for, with, and alongside humans; collaborative planning.
    - Trustworthy AI Principles: Fairness, accountability, transparency, robustness, resilience, privacy, and security.
    - Non-Technical Challenges: Domain complexity, user cognitive biases, economic deployment costs, evolving system infrastructures.
    - Core Ethical Principles (Russell & Norvig Ch. 27): Safety, privacy, fairness, trust, accountability, transparency, responsibility attribution, human rights.
    - The Accuracy vs. Responsibility Trade-off: Value of precision vs. cost of guardrails, privacy guarantees, and explainability.
    - System Development Life Cycle (SDLC) Governance: Requirement Analysis, Design, Implementation, Testing, Evolution, Policy & Education.
    - Global Regulatory Landscape: US AI Bill of Rights, EU AI Act risk tiers, China Generative AI regulations, Singapore HSA SaMD medical AI lifecycle guidelines.
- 10. Summary & Bridge to Sequential Decision Making Under Uncertainty
    - Transition from deterministic static environments to stochastic dynamic uncertainty.
    - Why real-world acting demands Decision Theory, Utility Theory, and Reinforcement Learning.
</draft>

AI Planning and Sequential Decision Making forms the computational backbone of modern autonomous systems, intelligent agents, and foundational decision models. Based on the pedagogical curriculum developed by Anandha Gopalan and Teo Yong Meng at the National University of Singapore (NUS CS4246/CS5446 Version 4.0), this master technical note establishes the formal foundations of artificial intelligence planning, tracing the evolution from classical symbolic representations to modern Large Foundation Model (LFM)-assisted architectures and responsible AI governance.

---

## 1. Foundations of AI Planning & The Rational Agent Architecture

### 1.1 The Perception-Action-Communication Loop

At its core, artificial intelligence centers on the engineering of a **rational agent** operating in an environment. Rather than viewing intelligence as passive pattern classification or stateless text generation, planning formalizes intelligence as an active, continuous, closed-loop interaction:

```
                          +-----------------------+
                          |      Environment      |
                          +-----------------------+
                           ^        |           ^
                   Acting  |        | Sensing   | Communicating
                           |        v           |
                          +-----------------------+
                          |    Intelligent Agent  |
                          |                       |
                          |  * Perception         |
                          |  * Learning           |
                          |  * Modeling           |
                          |  * Reasoning          |
                          |  * Planning & Acting  |
                          |  * Decision Making    |
                          +-----------------------+
```

The agent's internal architecture is structured across six cognitive capabilities:
1. **Perception:** Converting raw sensory signals into structured state observations.
2. **Learning:** Improving internal models and behavioral policies through experience.
3. **Modeling:** Maintaining a formal, verifiable internal representation of environmental states and physical dynamics.
4. **Reasoning:** Inferring hidden information, proving logical assertions, and evaluating hypotheticals.
5. **Planning and Acting:** Synthesizing an organized sequence of actions designed to transform the current state into a targeted goal state.
6. **Decision Making:** Selecting between competing goals and action paths when resources, time, or outcomes are bounded by uncertainty and risk.

### 1.2 Real-World Application Domains

Planning systems drive modern autonomous operations across heterogeneous industries:
- **Parcel Delivery & Fleet Routing:** Calculating multi-stop delivery routes under traffic and vehicle capacity constraints (e.g., Google Maps, logistics platforms).
- **Clinical Pathways & Asthma Management:** Executing sequential diagnostic and therapeutic steps according to formalized medical guidelines (e.g., American International Health Alliance clinical practice guidelines).
- **Non-Player Characters (NPCs) in Games:** Generating dynamic combat tactics, pathfinding, and narrative choices (e.g., *Dota 2*, *World of Warcraft*, *Stardew Valley*, *AIWarriors*).
- **Assistive & Healthcare Robotics:** Guiding physical interaction, mobility support, and social companionship (e.g., *Romibo*, *Aldebaran Nao*, *Cyberbotics*).
- **Industrial & Scientific Automation:** Robotic manipulation, laboratory sample processing, and automated semiconductor fabrication (IMDA).
- **Warehouse Logistics:** Coordinating multi-agent automated guided vehicles (AGVs) transporting inventory pods to human packing stations (e.g., Amazon Kiva systems).
- **Space Exploration:** Autonomous mission scheduling and path planning under extreme communication delays (e.g., NASA Mars 2020 *Perseverance* rover).

---

## 2. Formal Definition of Planning Problems & Taxonomy Matrix

### 2.1 Formal Definition of a Planning Problem

A formal **Planning Problem** $\mathcal{P}$ is defined as a tuple:

$$\mathcal{P} = \langle \mathcal{S}, s_0, \mathcal{A}, \mathcal{T}, \mathcal{G} \rangle$$

Where:
- $\mathcal{S}$ is the set of all possible environmental states.
- $s_0 \in \mathcal{S}$ is the designated **Initial State**.
- $\mathcal{A}$ is the set of available actions. For any state $s \in \mathcal{S}$, $\mathcal{A}(s) \subseteq \mathcal{A}$ denotes the actions applicable in $s$.
- $\mathcal{T}: \mathcal{S} \times \mathcal{A} \to \mathcal{S}$ is the state transition function (or effect model) specifying the resulting state $s' = \mathcal{T}(s, a)$ when action $a$ is executed in state $s$.
- $\mathcal{G} \subseteq \mathcal{S}$ is the **Goal Specification** defining the set of acceptable goal states (verified via a boolean goal test).

```
                 a1            a2                   an
        s0 ------------> s1 --------> s2 ... ----------> s_goal
   (Initial State)                                    (Goal State)
```

**The Planning Solution:**
A solution (or **plan**) is an action sequence $\pi = \langle a_1, a_2, \dots, a_k \rangle$ such that executing $\pi$ sequentially starting from $s_0$ terminates in a state $s_k \in \mathcal{G}$.
- **Satisficing Plan:** Any valid path from $s_0$ to $\mathcal{G}$.
- **Optimal Plan:** A plan that minimizes an associated cost metric (e.g., execution steps, fuel consumption, time delay, financial expenditure).

### 2.2 Planning Problem Taxonomy Matrix: Simple vs. Complex

The difficulty of synthesizing a plan depends directly on the environmental characteristics of the task domain:

| Environmental Axis | Simple (Toy Problems / Classical) | Complex (Real-Life Industrial Systems) |
| :--- | :--- | :--- |
| **States** | **Fully Observable** (Complete state known at all times) | **Partially Observable** (Incomplete, noisy sensor readings) |
| **Actions** | **Discrete** (Finite, distinct choices) | **Continuous** (Real-valued velocities, forces, angles) |
| **Effects** | **Deterministic** (Applying action $a$ yields a single certain state $s'$) | **Non-Deterministic / Stochastic** (Actions have multiple probabilistic outcomes) |
| **Goals** | **Deterministic / Binary** (Satisfied or unsatisfied) | **Graded / Multi-Objective** (Preferences, utilities, soft constraints) |
| **Environment** | **Static** (World changes only when the agent acts) | **Dynamic** (World evolves concurrently due to exogenous processes) |
| **Agents** | **Single-Agent** (No adversarial interference or peer coordination) | **Multi-Agent** (Peers, competitors, and collaborative human partners) |

Beyond raw algorithmic state explosion, real-world systems must handle non-technical dimensions: strict time horizons, resource budgets, cognitive human factors, and unexpected environment drift.

### 2.3 The Actor's View of Planning

Planning is not merely an abstract mathematical puzzle solved offline; in real systems, the agent must reconcile:
- **How to plan to act effectively in the real world?** Synthesizing actions that account for real-world delays, physical actuators, and safety boundaries.
- **How to act to plan effectively in the real world?** Taking exploratory actions (active sensing, information gathering, probing) specifically to discover the environmental model needed to formulate future plans.

---

## 3. The Four Generations of AI Agents (1980s–2030s) & Agentic AI

### 3.1 Historical Evolution of Agent Architecture

```
+-------------------+     +-------------------+     +-------------------+     +-------------------+
|    1980s Agent    |     |    2000s Agent    |     |    2020s Agent    |     |    2030s Agent    |
|   Symbolic AI     | --> | Reinforcement L.  | --> |     LLM Agent     | --> | Tool-Using Multi  |
| Logic, Theorem    |     | Trial & Error,    |     | ReACT, Chain of   |     | Agent Ecosystems  |
| Proving, STRIPS   |     | Reward Policy     |     | Thought, In-Ctx   |     | Distributed Plan  |
+-------------------+     +-------------------+     +-------------------+     +-------------------+
```

1. **1980s Symbolic AI Agents:** Built on formal mathematical logic, first-order predicate calculus, and explicit theorem provers (e.g., STRIPS). They possess verifiable correctness and sound deduction, but suffer from the Frame Problem, high manual domain modeling costs, and brittleness in noisy environments.
2. **2000s Reinforcement Learning (RL) Agents:** Built on trial-and-error interaction with environments governed by Markov Decision Processes (MDPs). Agents learn an optimal policy $\pi^*(s)$ that maximizes expected cumulative reward. While robust to uncertainty, classical RL suffers from severe sample inefficiency and poor out-of-distribution generalization.
3. **2020s Large Foundation Model (LLM) Agents:** Powered by massive autoregressive transformers. Agents utilize language-based reasoning paradigms such as **ReACT** (*Reasoning and Acting*) and Chain-of-Thought (CoT) prompting to decompose instructions, synthesize subgoals, and reason over observed feedback.
4. **2030s Tool-Using Multi-Agent Ecosystems:** Collaborative networks of specialized heterogeneous agents. Agents communicate over structured protocols, delegate subtasks across specialized APIs, maintain shared memory, and coordinate collective execution in human-in-the-loop environments.

### 3.2 The Modern Agentic AI Landscape

The contemporary architecture of an intelligent agent combines four complementary subsystems:

```
                            +--------------------------+
                            | Large Foundational Model |
                            |      (Central Brain)     |
                            +--------------------------+
                                     ^        ^
                                     |        |
           +-------------------------+        +-------------------------+
           |                                                            |
           v                                                            v
+-----------------------+                                  +--------------------------+
|     Memory Systems    |                                  |   Cognitive Processes    |
|  * Short-Term Context |                                  |  * Planning & Decomp.    |
|  * Long-Term Episodic |                                  |  * Reflection & Critique |
|  * Semantic Vector DB |                                  |  * Self-Correction Loop  |
+-----------------------+                                  +--------------------------+
           ^                                                            ^
           |                                                            |
           +-------------------------+        +-------------------------+
                                     v        v
                            +--------------------------+
                            |       Tool Matrix        |
                            |  * Symbolic Solvers      |
                            |  * Web & API Connectors  |
                            |  * Code Interpreters     |
                            +--------------------------+
                                     ^        |
                            Feedback |        | Actuate
                                     |        v
                            +--------------------------+
                            |       Environment        |
                            +--------------------------+
```

#### Andrew Ng on Agentic Reasoning (BUILD 2024 Keynote)
In his influential keynote *"The Rise of AI Agents and Agentic Reasoning"* (BUILD 2024), Andrew Ng articulated why the AI frontier is transitioning from zero-shot prompt-response interactions to **iterative agentic workflows**:
- **Iterative vs. Zero-Shot:** While querying a frontier model (such as GPT-4) in a single-shot prompt often yields superficial answers, embedding even smaller open models (such as GPT-3.5 or Llama) within an iterative loop—incorporating **reflection, external tool invocation, multi-step planning, and multi-agent collaboration**—routinely outperforms zero-shot GPT-4 on complex coding and sequential problem-solving benchmarks.
- **Economic Paradigm Shift:** This agentic convergence powers what modern economic analyses term the *"one-person unicorn"*—where a single human founder or developer orchestrates a decentralized fleet of autonomous agents executing end-to-end planning, code synthesis, verification, and automated deployment pipelines.

---

## 4. Classical Planning Definition, Assumptions & PDDL Representation

### 4.1 Classical Planning Definition & Fundamental Assumptions

**Classical Planning** represents the historical foundation of automated reasoning. It assumes the simplest operating environment:
1. **Discrete:** States, actions, and time steps are distinct and finite.
2. **Deterministic:** Each action has exactly one predictable outcome.
3. **Static:** The environment changes only when the agent deliberately executes an action.
4. **Fully Observable:** The agent has complete, instantaneous access to the true state of the world.

**The Four Core Challenges of Classical Planning:**
1. **Representation:** How to compactly express complex worlds without enumerating exponentially large state spaces.
2. **Search:** How to efficiently explore combinatorial state spaces to discover valid action sequences.
3. **Heuristics:** How to design domain-independent estimators that guide search algorithms toward goals without manual tuning.
4. **Abstraction:** How to decompose high-level objectives into hierarchical subproblems to make planning scalable.

### 4.2 Historical Roots: STRIPS and PDDL

In 1971, Richard Fikes and Nils Nilsson at the Stanford Research Institute introduced **STRIPS** (*STanford Research Institute Problem Solver*). STRIPS revolutionized automated reasoning by moving away from unwieldy theorem provers to a **factored state representation** paired with explicit action operators defined by preconditions and add/delete lists.

To standardize benchmarking across research institutions and the International Planning Competition (IPC), the community formulated **PDDL** (*Planning Domain Definition Language*). PDDL separates the planning problem into two modular files:
- **Domain File:** Defines object types, predicate schemas, and parameterized action schemas (the general physics of the world).
- **Problem File:** Specifies the concrete objects, initial state configuration, and goal condition for a specific instance.

### 4.3 Factored State Representation & Database Semantics

In classical planning, world configurations are represented in a **factored** manner using state variables known as **fluents** (properties and relations whose truth values vary over discrete planning time):
- A state $s$ is formally represented as a conjunction of positive, ground, function-free atomic predicates:

$$s = \{ \text{At}(P_1, \text{SFO}), \text{At}(P_2, \text{SIN}), \text{Plane}(P_1), \text{Plane}(P_2) \}$$

**State Representation Mappings (Lecture Examples):**

| First-Order Logical Statement | Factored State Set (True Fluents) | Semantics |
| :--- | :--- | :--- |
| $\text{Hungry} \land \text{Sleepy}$ | $S = \{ \text{Hungry}, \text{Sleepy} \}$ | Conjunction of ground propositional fluents |
| $\text{New}(\text{Plane}_1) \land \text{Safe}(\text{Plane}_1)$ | $S = \{ \text{New}(\text{Plane}_1), \text{Safe}(\text{Plane}_1) \}$ | Ground 1-place predicates over physical object $\text{Plane}_1$ |
| $\text{At}(\text{Plane}_1, \text{SIN}) \land \text{At}(\text{Plane}_2, \text{SFO})$ | $S = \{ \text{At}(\text{Plane}_1, \text{SIN}), \text{At}(\text{Plane}_2, \text{SFO}) \}$ | Ground relational state variables defining airport locations |

Classical planning engines interpret these sets under strict **Database Semantics**:
1. **Closed-World Assumption (CWA):** Any ground atomic fluent not explicitly present in the state set $s$ is strictly assumed to be **false**.
   - *Example:* In an academic planning environment, if $\text{Fierce}(\text{CS3263\_Lecturer})$ is omitted from the state set $s$, it evaluates unambiguously to $\text{False}$.
2. **Unique Names Assumption (UNA):** Distinct syntactic constants invariably denote distinct physical objects in the world ($P_1 \neq P_2$, $\text{Plane}_1 \neq \text{Plane}_2$, $\text{SFO} \neq \text{SIN}$). Two distinct names can never refer to the same object.

### 4.4 Model-Theoretic Goal Entailment

A goal $g$ is a **partially specified state**, formally written as a conjunction of literals. Because a goal specifies only the target conditions that must be achieved, unmentioned fluents can take any arbitrary truth value in the final state:

> **Definition (Model-Theoretic Entailment):**
> A physical state $s$ satisfies a goal $g$ if and only if $s$ logically entails $g$, denoted $s \models g$:
>
> $$s \models g \iff \mathcal{M}(s) \subseteq \mathcal{M}(g)$$
>
> where $\mathcal{M}(\alpha)$ denotes the set of all logical models in which $\alpha$ is true. That is, in every interpretation where state $s$ holds true, goal $g$ is also necessarily true.

**Key Syntactic and Semantic Properties:**
- **Ground Conjunction Entailment:**
  $$\text{Hungry} \land \text{Sleepy} \land \text{Bored} \models \text{Hungry} \land \text{Bored}$$
  Since the state contains all required literals, the goal is satisfied.
- **Lifted Goal Entailment with Variable Substitution:**
  $$\text{At}(\text{Cargo}_1, \text{SFO}) \models \text{At}(c, \text{SFO}) \quad \text{under substitution } \theta = \{ c / \text{Cargo}_1 \}$$
- **Existential Quantification of Variables in Goals:**
  Variables appearing within PDDL goal expressions are treated as **existentially quantified** ($\\exists$):
  $$g = \text{At}(P_1, \text{SIN}) \land \text{At}(p, \text{SFO}) \land \text{Plane}(p)$$
  This asserts that plane $P_1$ must be located at Singapore, and *there must exist at least one plane* $p$ located at San Francisco.
- **STRIPS vs. PDDL Expressive Bounds:**
  In classical STRIPS, goals are strictly restricted to conjunctions of positive, ground literals (no negation, disjunction, or variables). PDDL extends this by allowing negative literals, typed variables, and conditional goal specifications.

### 4.5 Action Schemas, Grounding, and State Transitions

An **Action Schema** provides a lifted, parameterized template representing a family of concrete actions:

$$\text{Action}(a(\vec{x})) = \langle \text{Precond}(a), \text{Effect}(a) \rangle$$

Where:
- $\text{Precond}(a)$ is a conjunction of literals that must hold before $a$ can be executed.
- $\text{Effect}(a)$ consists of positive fluents ($\text{ADD}(a)$) and negative fluents ($\text{DEL}(a)$).

**Applicability:**
An action $a$ is applicable in state $s$ if and only if $s \models \text{Precond}(a)$.

**Execution Result:**
Applying an applicable action $a$ to state $s$ produces a successor state $s'$ according to the set transition formula:

$$s' = \mathcal{T}(s, a) = (s \setminus \text{DEL}(a)) \cup \text{ADD}(a)$$

### 4.6 The Frame Problem and PDDL Inertia

The classical **Frame Problem** asks: *How can an automated agent represent the effects of an action without having to explicitly write axioms stating all the millions of facts that remain unchanged?*

In a naive First-Order Logic axiomatization with $m$ actions and $n$ fluents, one must write approximately $\mathcal{O}(mn)$ frame axioms (e.g., *"Moving a box does not change the color of the wall"*).

PDDL and STRIPS resolve the Frame Problem through the **Inertia Assumption**:
- An action schema explicitly enumerates *only* the fluents that change ($\text{ADD}$ and $\text{DEL}$).
- Any fluent not explicitly listed in the effect is mathematically guaranteed to persist unchanged into successor state $s'$.

### 4.7 Case Study: Flight Domain & Air Cargo Transport

#### 1. Flight Domain Specification

```lisp
;; Domain Definition: flight_domain.pddl
(define (domain flight_domain)
  (:requirements :strips :typing)
  (:types plane airport)
  (:predicates
    (At ?p - plane ?a - airport)
    (Plane ?p - plane)
    (Airport ?a - airport))
  (:action Fly
    :parameters (?p - plane ?from - airport ?to - airport)
    :precondition (and (At ?p ?from) (Plane ?p) (Airport ?from) (Airport ?to))
    :effect (and (not (At ?p ?from)) (At ?p ?to))))

;; Problem Definition: flight_problem.pddl
(define (problem flight_problem)
  (:domain flight_domain)
  (:objects P1 P2 - plane SFO SIN - airport)
  (:init
    (At P1 SFO)
    (At P2 SIN)
    (Plane P1)
    (Plane P2)
    (Airport SFO)
    (Airport SIN))
  (:goal
    (and (At P1 SIN) (not (At P1 SFO)) (At P2 SFO))))
```

#### 2. Air Cargo Transport Domain

In air cargo transport planning, packages must be loaded onto planes, flown across airports, and unloaded:

```lisp
(define (domain air-cargo)
  (:requirements :strips :typing)
  (:types plane airport cargo)
  (:predicates
    (At ?x - (either plane cargo) ?a - airport)
    (In ?c - cargo ?p - plane)
    (Cargo ?c - cargo)
    (Plane ?p - plane)
    (Airport ?a - airport))

  (:action Load
    :parameters (?c - cargo ?p - plane ?a - airport)
    :precondition (and (At ?c ?a) (At ?p ?a) (Cargo ?c) (Plane ?p) (Airport ?a))
    :effect (and (not (At ?c ?a)) (In ?c ?p)))

  (:action Unload
    :parameters (?c - cargo ?p - plane ?a - airport)
    :precondition (and (In ?c ?p) (At ?p ?a) (Cargo ?c) (Plane ?p) (Airport ?a))
    :effect (and (At ?c ?a) (not (In ?c ?p))))

  (:action Fly
    :parameters (?p - plane ?from - airport ?to - airport)
    :precondition (and (At ?p ?from) (Plane ?p) (Airport ?from) (Airport ?to))
    :effect (and (not (At ?p ?from)) (At ?p ?to))))
```

**Caveats with Spurious Actions:**
Notice that if the precondition of $\text{Fly}$ does not enforce $(?from \neq ?to)$, an action like $\text{Fly}(P_1, \text{SIN}, \text{SIN})$ is technically applicable. While semantically redundant, such spurious actions inflate the branching factor during state-space search, highlighting why precise domain engineering and inequality constraints are vital.

---

## 5. Planning as State-Space Search: Progression vs. Regression

### 5.1 Progression (Forward State-Space Search)

Forward state-space search operates directly in the space of fully specified world states:
1. **Root Node:** Start at the initial state $s_0$.
2. **Expansion:** Identify all grounded actions $a$ whose preconditions are satisfied ($s \models \text{Precond}(a)$).
3. **Successor Generation:** For each applicable action, construct successor state $s' = (s \setminus \text{DEL}(a)) \cup \text{ADD}(a)$.
4. **Termination:** Stop when an expanded state satisfies the goal condition ($s \models g$).

```
                      [ Initial State s0 ]
                             /                    Action a1  /     \  Action a2
                           v       v
                        [ s1 ]   [ s2 ]
                        /                           v      v
                     ...    [ s_goal ] (Goal satisfied)
```

- **Advantage:** Maintains complete, fully grounded states at every step. This makes evaluating domain-independent heuristics straightforward because every fluent has a known truth value.
- **Disadvantage:** Suffer from high forward branching factors when many irrelevant actions are applicable.

### 5.2 Regression (Backward Goal-Directed Search)

Backward search starts from the goal description and searches backward toward the initial state:
1. **Root Node:** Start with the goal specification $g$.
2. **Relevance Test:** An action $a$ is **relevant** to a goal $g$ if:
   - At least one effect of $a$ unifies with a literal in $g$ (i.e., $a$ achieves something the goal needs).
   - No effect of $a$ contradicts any literal in $g$ ($\text{DEL}(a) \cap \text{POS}(g) = \emptyset$).
3. **Goal Regression Formula:**
   To regress a goal $g$ backward over action $a$ using substitution $\theta = \text{MGU}$, compute:

$$\text{POS}(g') = (\text{POS}(g) \setminus \text{ADD}(a)) \cup \text{POS}(\text{Precond}(a))$$

$$\text{NEG}(g') = (\text{NEG}(g) \setminus \text{DEL}(a)) \cup \text{NEG}(\text{Precond}(a))$$

4. **Termination:** Stop when the regressed subgoal $g'$ is satisfied by the initial state ($s_0 \models g'$).

```
                      [ Goal Specification g ]
                             /                Relevant a_k   /     \  Relevant a_j
                           v       v
                        [ g1 ]   [ g2 ]
                        /                           v      v
                     ...    [ g_init ] (Satisfied by s0)
```

### 5.3 State Space vs. Partial Description Space

A fundamental theoretical distinction separates progression and regression:
- **Progression searches over Ground States:**
  For $n$ boolean fluents, there are exactly:

$$|\mathcal{S}_{\text{ground}}| = 2^n \text{ distinct states}$$

- **Regression searches over Partial State Descriptions:**
  Because regression tracks subgoals where unmentioned fluents can be true, false, or unspecified, each fluent can be in one of 3 states (positive, negative, or unmentioned). For $n$ fluents, the search space contains:

$$|\mathcal{S}_{\text{descriptions}}| = 3^n \text{ partial state descriptions}$$

While $3^n > 2^n$, backward search frequently explores far fewer nodes in practice because it focuses exclusively on actions causally connected to the goal, aggressively pruning branches that achieve irrelevant side effects.

---

### 5.4 Worked Bridge: Progression, Regression, and SAT

考慮 fluents $AtA,AtB,HasKey$。初始 state 是 $\{AtA,HasKey\}$，goal 是 $\{AtB,HasKey\}$；Move 的 precondition 是 $\{AtA\}$，add list 是 $\{AtB\}$，delete list 是 $\{AtA\}$。

Progression 把 action 套到完整 state：
$$s'=(s\setminus Del(Move))\cup Add(Move)=\{AtB,HasKey\}.$$

Regression 則問「要讓 goal 在 action 後成立，action 前必須有什麼？」在 $Del(a)\cap g=\varnothing$、action 與 goal 有關的情況下：
$$Regress(g,a)=(g\setminus Add(a))\cup Pre(a)=\{HasKey,AtA\}.$$

這個 regressed goal 已被初始 state 滿足，因此找到一個一步 plan。Regression 的節點是需要成立的條件集合，不是某個唯一的完整世界；$HasKey$ 雖非 Move 的 precondition，仍須保留，因為它是尚未由 action 達成的 goal。

SATPlan 再把相同問題改成 time-indexed variables：$AtA_0,Move_0,AtB_1$。Precondition/effect clauses 描述「若採取 Move 會怎樣」，frame/successor-state clauses 描述「沒有 action 改變 HasKey 時，它為何繼續成立」。三種方法的 domain semantics 相同，差別是求解問題的表示方式。

## 6. Planning as Logical Inference: Boolean Satisfiability (SATPlan)

### 6.1 Propositional Satisfiability Reduction

Rather than traversing a graph of states, **SATPlan** reduces the automated planning problem into a **Boolean Satisfiability (SAT)** problem represented in **Conjunctive Normal Form (CNF)**:

```
+------------------+         Translate to CNF         +--------------------+
| Planning Problem | -------------------------------> | CNF Boolean Formula|
| (Init, Act, Goal)|                                  | (At_SFO_0 v Fly_0) |
+------------------+                                  +--------------------+
                                                                |
                                                                v  Solve
+------------------+         Extract Plan             +--------------------+
| Sequential Plan  | <------------------------------- | Satisfying Model M |
| (a0, a1, ..., aT)|                                  | (Variables = T/F)  |
+------------------+                                  +--------------------+
```

### 6.2 The SATPlan Algorithm

The algorithm searches for the shortest valid plan by bounding the horizon length $T$:

```
function SATPLAN(init, transition, goal, T_max) returns solution or failure
    for t = 0 to T_max do
        cnf <- TRANSLATE-TO-SAT(init, transition, goal, t)
        model <- SAT-SOLVER(cnf)
        if model is not null then
            return EXTRACT-SOLUTION(model)
    return failure
```

If the formula is satisfiable, the truth assignment returned by modern DPLL/CDCL solvers directly indicates which action variables are true at each time step $t$, producing an optimal parallel or sequential plan.

### 6.3 The Complete "Eat a Cake!" Worked Proof

To illustrate propositional planning, consider the classical benchmark:
- **Fluents:** $\text{Have}(\text{Cake})$, $\text{Eaten}(\text{Cake})$.
- **Actions:** $\text{Eat}(\text{Cake})$, $\text{Bake}(\text{Cake})$.
- **Initial State ($t=0$):** $\neg\text{Have}(\text{Cake}, 0) \land \neg\text{Eaten}(\text{Cake}, 0)$.
- **Goal State ($t=2$):** $\neg\text{Have}(\text{Cake}, 2) \land \text{Eaten}(\text{Cake}, 2)$.

#### 1. Action Precondition & Effect Axioms
At each time step $t$:
- **Eat Action:**

$$\text{Eat}(\text{Cake}, t) \implies \text{Have}(\text{Cake}, t) \land \neg\text{Have}(\text{Cake}, t+1) \land \text{Eaten}(\text{Cake}, t+1)$$

- **Bake Action:**

$$\text{Bake}(\text{Cake}, t) \implies \neg\text{Have}(\text{Cake}, t) \land \text{Have}(\text{Cake}, t+1)$$

#### 2. Successor-State Axioms (Solving the Frame Problem)
To ensure fluents do not change value magically without an explicit action, SATPlan generates **Successor-State Axioms** establishing necessary and sufficient conditions for a fluent to hold at time $t+1$:

$$\text{Fluent}(t+1) \iff \text{ActionCausesTrue}(t) \lor (\text{Fluent}(t) \land \neg\text{ActionCausesFalse}(t))$$

For the cake domain:
1. **Have Cake:**

$$\text{Have}(\text{Cake}, t+1) \iff \text{Bake}(\text{Cake}, t) \lor (\text{Have}(\text{Cake}, t) \land \neg\text{Eat}(\text{Cake}, t))$$

2. **Eaten Cake:**

$$\text{Eaten}(\text{Cake}, t+1) \iff \text{Eat}(\text{Cake}, t) \lor \text{Eaten}(\text{Cake}, t)$$

#### 3. Action Exclusion Axioms
To prevent physically conflicting actions from executing simultaneously:

$$\neg\text{Eat}(\text{Cake}, t) \lor \neg\text{Bake}(\text{Cake}, t)$$

#### 4. Axiom Count Comparison: Naive vs. Successor-State
- **Naive Frame Axioms:** Require specifying for every action and unaffected fluent that the fluent persists, generating $\mathcal{O}(mn)$ clauses.
- **Successor-State Axioms:** Encode one biconditional formula per fluent across all actions, generating only $\mathcal{O}(n)$ axioms.

**Synthesized Plan for $T=2$:**
1. Step $t=0$: Execute $\text{Bake}(\text{Cake}, 0) \implies \text{Have}(\text{Cake}, 1) = \text{True}$.
2. Step $t=1$: Execute $\text{Eat}(\text{Cake}, 1) \implies \text{Have}(\text{Cake}, 2) = \text{False}, \text{Eaten}(\text{Cake}, 2) = \text{True}$.
3. Goal achieved at horizon $T=2$.

---

## 7. Real-World Applications, Industrial Ecosystem & Competitions

### 7.1 Industrial Application Matrix

| Domain | Key Industrial Use Case |
| :--- | :--- |
| **Logistics & Manufacturing** | Facility task scheduling, assembly line balancing, and material flow routing. |
| **Enterprise Operations** | Business process workflow planning, data pipeline scheduling, and compliance auditing. |
| **Autonomous Robotics** | Collision-free path planning, drone waypoint routing, and multi-robot fleet dispatch. |
| **Healthcare Systems** | Hospital operating room scheduling, chemotherapy clinical pathway sequencing. |
| **Video Game AI** | Non-Player Character (NPC) tactical decision making, dynamic story progression. |
| **Deep Space Missions** | NASA Mars 2020 rover autonomous activity scheduling under uplink bandwidth bounds. |
| **Real-Time Decision Support**| Power grid load shedding, telecom packet switching under link constraints. |

### 7.2 The AIPlanning4EU Project & Unified Planning Library

The European Union's **AIPlanning4EU** initiative created the open-source **Unified Planning Library** (`unified-planning`), bridging research planners and industrial software stacks:

```python
from unified_planning.shortcuts import *

# Define fluent predicates and actions
x = Fluent('x')
a = InstantaneousAction('a')
a.add_precondition(Not(x))
a.add_effect(x, True)

# Formulate planning problem
problem = Problem('basic')
problem.add_fluent(x)
problem.add_action(a)
problem.set_initial_value(x, False)
problem.add_goal(x)

# Invoke off-the-shelf industrial planner via unified API
with OneshotPlanner(problem_kind=problem.kind) as planner:
    result = planner.solve(problem)
    if result.status in (PlanGenerationResultStatus.SOLVED_SATISFICING, PlanGenerationResultStatus.SOLVED_OPTIMAL):
        print(f"Found plan: {result.plan}")
```

### 7.3 International Planning Competition (IPC 2023)

Held alongside the International Conference on Automated Planning and Scheduling (ICAPS), the **IPC** serves as the primary benchmark for automated planners:
- **Tracks:** Classical Tracks (Optimal, Agile, Satisficing), Learning Tracks, Probabilistic Tracks, Numeric Tracks, and Hierarchical Task Network (HTN) Tracks.
- **Packaging Standard:** IPC 2023 standardized deployment using Apptainer (Singularity) container recipes, integrating commercial solvers like IBM CPLEX alongside open-source engines like *Fast Downward*, *Scorpion*, and *DecStar*.

### 7.4 Modern Open Challenges: The DeepMind PushWorld Benchmark

While classical planners excel in discrete, fully symbolic domains governed by explicit PDDL physics, real-world embodied robotics presents complex physical interactions, continuous geometries, and dynamic spatial occlusions. To evaluate whether learning agents and planners can acquire physical common sense, Google DeepMind introduced **PushWorld** (2024; `https://deepmind-pushworld.github.io/play/`):
- **Problem Formulation:** PushWorld is a 2D puzzle benchmark based on physical object manipulation and obstacle clearance, conceptualized as a continuous, physics-grounded generalization of classical Sokoban.
- **Physical Dynamics & Constraints:** An agent must push, rotate, and unblock obstacles of diverse geometric shapes across friction surfaces to clear a designated path or reposition target blocks into goal configurations. Actions alter the physical state through non-linear contact mechanics, momentum transfer, and spatial obstruction.
- **Significance for Planning:** PushWorld exposes the fundamental dichotomy between symbolic planning and end-to-end reinforcement learning:
  - *Symbolic Planners:* Provide provable soundness and completeness but require laborious human authoring of physical collision and friction rules in PDDL.
  - *Reinforcement Learning / Foundation Models:* Ingest raw pixel observations and spatial coordinates directly, but struggle with long-horizon combinatorial reasoning and catastrophic out-of-distribution physical hallucination.
- **Research Frontier:** PushWorld serves as an active proving ground for **neuro-symbolic planning architectures**—where learned visual world models extract grounded object fluents and affordances, which are then passed to classical combinatorial search engines (e.g., Fast Downward or SATPlan) for provably correct long-horizon plan synthesis.

### 7.5 Summary of Alternative Classical Paradigms

```
Classical Planning Approaches
|-- Goal-Directed Factored: STRIPS, PDDL
|-- Search-Based: Forward Progression, Backward Regression
|-- SAT-Based: SATPlan (CNF reduction with DPLL/CDCL solvers)
|-- Constraint-Based: CSP bounded planning formulations
|-- Graph-Based: Planning Graphs (Graphplan, mutual exclusion / mutex relations)
|-- Deductive Logic: Situation Calculus (First-Order Logic action axiomatization)
+-- Partial-Order Planning (POP): Least-commitment causal link planning
```

---

## 8. Algorithmic Properties & Computational Complexity Bounds

### 8.1 Theoretical Properties of Planning Algorithms

1. **Soundness:** Every plan synthesized by the algorithm is guaranteed to be a physically executable, valid solution that achieves the goal.
2. **Completeness:** If at least one valid plan exists in the state space, the algorithm is mathematically guaranteed to terminate and return a solution.
3. **Optimality:** When guided by admissible heuristics or progressive horizon bounds, the planner returns a plan of strictly minimal cost or length.

### 8.2 Computational Complexity: PlanSAT vs. Bounded PlanSAT

The computational complexity of classical planning depends on the problem formulation:

1. **PlanSAT (Existence Problem):**
   *Does there exist any valid plan that achieves the goal from the initial state?*
   - For general classical planning with function-free first-order representations: **PSPACE-complete**.
   - For restricted propositional STRIPS without negative preconditions and delete lists: Solvable in polynomial time (**P**).
2. **Bounded PlanSAT (Optimization Problem):**
   *Does there exist a valid plan of length $\le k$?*
   - **NP-complete** for propositional planning; **PSPACE-complete** when lifted schemas permit exponential state spaces.

Because optimal planning is computationally hard, industrial systems prioritize **satisficing planning** (finding any valid plan quickly) powered by domain-independent heuristics and hierarchical abstractions.

---

## 9. Modern "Classical" Planning: Large Foundation Model (LFM) Assisted Planning

Recent research bridges classical symbolic planners and Large Language Models (LLMs) to overcome the manual modeling bottleneck of PDDL while preserving mathematical correctness.

```
                    +------------------------------------------+
                    |        Natural Language Objective        |
                    +------------------------------------------+
                                         |
                                         v
                    +------------------------------------------+
                    |    LLM Semantic Parsing & Translation    |
                    +------------------------------------------+
                                         |
                   +---------------------+---------------------+
                   |                                           |
                   v                                           v
    +------------------------------+            +------------------------------+
    |   PDDL Model Generation      |            |  Task & Subgoal Decomposition|
    |  * Mahdavi et al. (NeurIPS)  |            |  * Kwon et al. (ICRA 2025)   |
    |  * Automated VAL Validation  |            |  * Hybrid MCTS + LLM Policy  |
    +------------------------------+            +------------------------------+
                   |                                           |
                   +---------------------+---------------------+
                                         v
                    +------------------------------------------+
                    |    Classical Symbolic Planner Engine     |
                    |    (Fast Downward, Pyperplan, etc.)      |
                    +------------------------------------------+
                                         |
                                         v
                    +------------------------------------------+
                    |   Mathematically Verified Optimal Plan   |
                    +------------------------------------------+
```

### 9.1 Paradigm 1: LLM-Guided PDDL Creation and Refinement
*Mahdavi et al., NeurIPS 2024:*
- **Mechanism:** An LLM generates initial PDDL domain and problem definitions from natural language descriptions. The candidate model is simulated in an environment, and execution errors are validated using the `VAL` plan validation tool.
- **Closed-Loop Feedback:** Error traces are fed back to the LLM for iterative correction.
- **Empirical Impact:** The closed-loop LLM + feedback pipeline solves **66%** of complex interactive tasks, compared to only **29%** for intrinsic planning with GPT-4 using Chain-of-Thought prompting alone.

### 9.2 Paradigm 2: Task Decomposition & Subgoal Planning
*Kwon et al., ICRA 2025:*
- **Mechanism:** Combines LLM commonsense reasoning with symbolic solvers. The LLM decomposes high-level instructions into intermediate subgoals encoded in PDDL.
- **Hybrid Solvers:** Simple subgoals are solved via classical planners (*Fast Downward*), while complex non-symbolic actions are resolved via Monte Carlo Tree Search (MCTS) guided by an LLM value policy.

### 9.3 Paradigm 3: Heuristic Generation via LLMs
*Corrêa et al., ArXiv 2025:*
- **Mechanism:** Rather than using handcrafted domain-independent heuristics, an LLM inspects a PDDL domain specification and writes executable Python code for a domain-specific heuristic function $h(s)$.
- **Search Efficiency:** The synthesized heuristic is plugged directly into *Pyperplan* running Greedy Best-First Search (GBFS), dramatically reducing expanded node counts compared to standard domain-independent baselines.

### 9.4 Paradigm 4: Generalized Planning in PDDL Domains
*Silver et al., AAAI 2024:*
- **Mechanism:** Leverages pretrained LLMs to synthesize generalized algorithmic policies (Python programs) capable of solving *arbitrary* instances of a PDDL domain.
- **Workflow:** The LLM inspects a domain description and two small training instances, uses Chain-of-Thought summarization to identify invariant strategies, and produces a Python program with automated debugging loops.
- **Generalization:** Tested across 7 IPC domains, the synthesized programs achieved near-perfect generalization to unseen task sizes.

---

## 10. Responsible & Trustworthy AI Planning and Decision Making

### 10.1 Human-Aware and Trustworthy AI Systems

As planning systems transition from isolated simulations into human environments, technical optimality must be constrained by social and ethical boundaries:

```
                      +---------------------------------------+
                      |       Responsible AI Planning         |
                      +---------------------------------------+
                                     /                                             /                                              v             v
+------------------------------------+         +------------------------------------+
|       Human-Aware Systems          |         |        Trustworthy Systems         |
|  * AI working FOR humans           |         |  * Fairness & Non-Discrimination   |
|  * AI working WITH humans          |         |  * Accountability & Traceability   |
|  * AI working ALONGSIDE humans     |         |  * Transparency & Explainability   |
|  * Collaborative Plan Co-Creation  |         |  * Robustness, Safety & Privacy    |
+------------------------------------+         +------------------------------------+
```

### 10.2 Beyond Technical Challenges

Deploying decision-making systems surfaces four non-technical hurdles:
1. **Domain Challenges:** Deep operational constraints, safety-critical medical/industrial regulations, and conflicting stakeholder priorities.
2. **User Challenges:** Varying digital literacy, user over-reliance or unwarranted skepticism, and human cognitive biases.
3. **Economic Challenges:** High cloud compute expenditures, expensive verification audits, and uncertain market return-on-investment (ROI).
4. **System Challenges:** Operating across legacy infrastructure, fluctuating sensor bandwidth, and unexpected environment drift.

### 10.3 The Twelve Core Principles of Responsible AI

Following Russell & Norvig (*AIMA 4th ed., Chapter 27*), rational sequential decision models and autonomous planning agents must incorporate explicit societal, ethical, and legal constraints. The twelve foundational principles encompass:

| Responsible AI Principle | Operational Meaning in Automated Planning & Decision Systems |
| :--- | :--- |
| **1. Ensure Safety** | Actions must never produce physical injury, mechanical damage, or irreversible catastrophic states; planners must verify fail-safe recovery paths. |
| **2. Respect Privacy** | World models and state observations must guard personal data against unauthorized disclosure or adversarial state reconstruction. |
| **3. Ensure Fairness** | Objective functions and utility distributions must prevent disparate impact, demographic bias, and discriminatory resource allocation. |
| **4. Promote Trust** | Systems must establish calibrated trust with human operators through predictable, reliable, and verifiable behavior. |
| **5. Establish Accountability** | Unambiguous chains of legal and ethical responsibility must be maintained across designers, deployers, and operational managers. |
| **6. Provide Transparency** | The underlying planning model, assumptions, state fluents, and evaluation criteria must be accessible for independent technical audit. |
| **7. Attribute Responsibility** | System architectures must clearly delineate human agency from machine recommendations during semi-autonomous operations. |
| **8. Reflect Diversity & Inclusion** | Decision objectives must encompass diverse stakeholder viewpoints, cultural contexts, and accessibility considerations. |
| **9. Support Equality** | System benefits and automated services must be distributed equitably without exacerbating socioeconomic stratification. |
| **10. Facilitate Collaboration** | Systems must be engineered for seamless Human-AI teaming, supporting mixed-initiative plan co-creation rather than rigid replacement. |
| **11. Uphold Human Rights & Values**| Agent actions must align with international human rights standards, constitutional protections, and individual bodily autonomy. |
| **12. Limit Harmful Uses of AI** | Autonomous planning technologies must be actively gated and prevented from weaponization, automated surveillance, or cyberattacks. |

### 10.4 The Decision-Theoretic Trade-Off & Governance Framework

A central engineering challenge in enterprise decision architecture is balancing mathematical optimization against ethical and legal guardrails:

$$\text{Total Utility} = \text{Performance}(\text{Accuracy, Speed, Throughput}) - \text{Penalty}(\text{Risk, Bias, Opacity, Non-Compliance})$$

```
Performance /
Raw Accuracy  ^
              |            * Unconstrained Optimization (High Speed, Extreme Liability)
              |           /
              |          /  <-- Pareto Efficient Frontier of Trusted Agents
              |         /
              |        * Responsible Planning (Audited, Safe, Explainable)
              |       /
              |      /
              +---------------------------------------------------->
              0                                        Responsible Guardrails
                                                       (Safety, Privacy, Auditability)
```

**The Six Fundamental Governance Inquiries:**
Whether operating as an AI developer, system user, or executive regulator, evaluating an autonomous planning system requires answering six structural questions:
1. **Definition & Purpose:** *What is the specific responsible feature (e.g., algorithmic fairness, differential privacy, explainable causal chains), and why is it essential for this operational domain?*
2. **Trust Mechanisms:** *What concrete verification protocols (e.g., formal PDDL validation with `VAL`, bounded model checking) guarantee user trust?*
3. **Tooling & Techniques:** *What open-source libraries, formal solvers, and synthetic red-teaming benchmarks are available to enforce compliance?*
4. **Trade-Off Quantification:** *What is the explicit empirical trade-off between raw predictive accuracy/execution speed and the enforcement of responsible constraints?*
5. **Systemic Implications:** *What are the societal, legal, and operational second-order consequences if the planner encounters an edge case?*
6. **Decision Authority & Timing:** *Who holds the legal authority to sign off on plan deployment, and at what milestone in the lifecycle must this determination occur?*

### 10.5 SDLC Lifecycle Integration & Global Regulations

Responsible governance cannot be treated as a post-hoc patch; it must be systematically embedded across all five phases of the **System Development Life Cycle (SDLC)**, surrounded by ongoing Policy, Education, and Research:

```
                          [ Policy, Education & Research ]
                                         |
                                         v
                         +-------------------------------+
                         |    1. Requirement Analysis    |
                         +---------------+---------------+
                                         |
                                         v
                         +---------------+---------------+
                         |          2. Design            |
                         +---------------+---------------+
                                         |
                                         v
                         +---------------+---------------+
                         |      3. Implementation        |
                         +---------------+---------------+
                                         |
                                         v
                         +---------------+---------------+
                         |          4. Testing           |
                         +---------------+---------------+
                                         |
                                         v
                         +---------------+---------------+
                         |    5. Evolution & Auditing    |
                         +-------------------------------+
```

- **1. Requirement Analysis:** Engaging multidisciplinary stakeholders to define ethical boundaries, protected demographic classes, and acceptable risk margins.
- **2. Design & Modeling:** Structuring PDDL predicates and preconditions to mathematically exclude hazardous state transitions before a single line of solver code runs.
- **3. Implementation:** Embedding runtime assertions, verifiable invariant monitors, and cryptographically signed audit logs for every generated action sequence.
- **4. Testing & Verification:** Subjecting planners to stress testing, adversarial perturbations, and automated plan validators (`VAL`) across thousands of edge cases.
- **5. Evolution & Maintenance:** Continuously monitoring production workflows against real-world covariate shift, sensory drift, and changing regulatory standards.

**Global Regulatory Landscape:**
- **US Blueprint for an AI Bill of Rights (White House OSTP):** Establishes five core protections: Safe and Effective Systems, Algorithmic Discrimination Protections, Data Privacy, Notice and Explanation, and Human Alternatives, Consideration, and Fallback.
- **EU Artificial Intelligence Act (EU AI Act):** A landmark risk-tiered regulatory framework imposing stringent legal requirements (e.g., high-quality training datasets, continuous risk management systems, human oversight) on *High-Risk* autonomous planning systems (such as critical infrastructure, medical devices, and law enforcement tools), while strictly prohibiting cognitive behavioral manipulation and social scoring.
- **China Interim Measures for Generative AI Services:** Requires service providers to uphold socialist core values, prevent intellectual property infringement, conduct mandatory security assessments, and maintain transparent, traceable algorithms.
- **Singapore HSA Regulatory Guidelines for Software Medical Devices (SaMD):** The Health Sciences Authority (HSA) enforces a rigorous total-product-lifecycle framework requiring formal clinical evaluation, software change management, and automated anomaly auditing for AI decision systems deployed in patient care.

### 10.6 Real-World Case Studies: AI for Social Good (AI4SG)

When grounded in responsible engineering principles, automated planning and sequential decision making deliver profound global benefits across scientific, environmental, and humanitarian challenges:
- **Accelerating the UN Sustainable Development Goals (SDGs):** A landmark study by Vinuesa et al. (*Nature Communications*, 2020) revealed that AI planning and automated systems act as documented catalysts across **134 out of 169 targets** within the 17 UN Sustainable Development Goals—including clean water distribution, renewable energy balancing, and poverty reduction.
- **Rapid Clinical Diagnostics During Global Crises:** During the COVID-19 pandemic, automated clinical decision pipelines published in *Nature Medicine* (2020) demonstrated how convolutional neural networks combined with probabilistic decision trees could rapidly analyze full chest CT scans to triage acute patients and optimize intensive care unit (ICU) bed scheduling.
- **Minecraft as a Testbed for Urban & Architectural Planning:** In initiatives highlighted by the *MIT Technology Review* and the International Conference on the Foundations of Digital Games, automated spatial planners operating within procedural voxel environments (*Minecraft*) are used to co-design urban layouts, optimizing municipal sunlight exposure, pedestrian ventilation corridors, and multi-modal transit accessibility.
- **Climate Change Mitigation & Biodiversity Preservation:** Research featured by *National Geographic* details how dynamic routing algorithms and automated resource schedulers reduce fuel consumption across maritime cargo fleets, while autonomous UAV path planners track and protect endangered wildlife populations across vast African conservation corridors.
- **Causality, Creativity, and the Frontiers of AI Planning:** In his ICAPS 2020 keynote (*"Causality, Creativity and Imagination: New Frontiers in Planning"*), Sridhar Mahadevan argued that moving beyond static optimization toward causal reasoning, counterfactual simulation, and creative problem formulation is essential for addressing existential planetary challenges.

---

## 11. Summary & Bridge to Sequential Decision Making Under Uncertainty

Classical planning establishes the foundational vocabulary of automated reasoning: factored states, action preconditions and effects, goal entailment, forward/backward state-space search, and propositional SATPlan reductions. Furthermore, modern LFMs offer powerful tools to automate domain modeling and heuristic discovery while adhering to responsible AI principles.

However, **classical planning rests on assumptions that break down in the physical world**:
- In real life, actions do not have deterministic single outcomes; sensors do not provide perfect full observability; and external environments do not pause while the agent plans.
- When outcomes are probabilistic and goals involve trade-offs, agents cannot simply seek a boolean goal test. They must model **Preferences**, **Risk**, and **Expected Rewards**.

This directly motivates the subsequent chapters of our course:
- **Week 2:** Scaling classical planning via **Heuristic Search, State Abstractions, and Hierarchical Task Networks (HTN)**.
- **Week 3:** Formulating rational decisions under uncertainty via **Decision Theory, Utility Theory, and Game Theory**.
- **Subsequent Weeks:** Moving into **Markov Decision Processes (MDPs)**, **Probabilistic Planning**, and **Reinforcement Learning**!

---

<reviewkit>
<takeaways>
- **The Closed-Loop Rational Agent:** Modern AI planning formalizes intelligence as a continuous Sensing-Communicating-Acting feedback loop, integrating perception, modeling, reasoning, planning, and decision making across diverse real-world domains.
- **The Simple vs. Complex Planning Matrix:** Classical planning operates on toy assumptions (discrete, deterministic, static, fully observable), whereas real-world industrial planning demands handling uncertainty, continuous dynamics, multi-agent competition, and human factors.
- **Four Generations of Agents:** Intelligent systems have evolved from 1980s Symbolic AI (STRIPS logic) through 2000s Reinforcement Learning (trial-and-error policies) and 2020s LLM Agents (ReACT natural language reasoning) to 2030s tool-using multi-agent ecosystems.
- **PDDL Factored Representation:** States are conjunctions of ground atomic fluents governed by the Closed-World Assumption (CWA) and Unique Names Assumption (UNA). Actions update states via set operations: $s' = (s \setminus \text{DEL}(a)) \cup \text{ADD}(a)$.
- **The Frame Problem Solution:** PDDL resolves the persistence of facts through the inertia assumption, while propositional SATPlan encodes Successor-State Axioms to reduce $\mathcal{O}(mn)$ naive frame axioms to $\mathcal{O}(n)$ clauses.
- **Progression vs. Regression:** Forward search navigates $2^n$ ground states, while backward regression searches $3^n$ partial state descriptions using Most General Unifiers (MGU), aggressively pruning irrelevant actions.
- **SATPlan Propositional Reduction:** Converts planning into bounded CNF formulas evaluated by DPLL/CDCL SAT solvers, guaranteed to extract shortest-length plans if one exists.
- **Computational Complexity:** Classical planning plan existence (PlanSAT) is PSPACE-complete in general, while bounded length planning (Bounded PlanSAT) is NP-complete.
- **Modern LFM-Assisted Planning:** Modern paradigms combine LLM commonsense with classical verification: LLM-guided PDDL authoring (Mahdavi 2024), hybrid MCTS subgoal planning (Kwon 2025), LLM heuristic code generation (Corrêa 2025), and generalized PDDL programs (Silver 2024).
- **Responsible AI Governance:** Trusted autonomous planning requires balancing raw performance against societal constraints (safety, privacy, fairness, transparency) embedded systematically throughout the SDLC.
</takeaways>

<qprompt/>
</reviewkit>

## References

1. Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4th ed.). Pearson. (Chapters 11 & 27).
2. Fikes, R. E., & Nilsson, N. J. (1971). STRIPS: A new approach to the application of theorem proving to problem solving. *Artificial Intelligence*, 2(3-4), 189-208.
3. Ghallab, M., Nau, D., & Traverso, P. (2004). *Automated Planning: Theory and Practice*. Morgan Kaufmann.
4. Kautz, H., & Selman, B. (1992). Planning as satisfiability. In *Proceedings of the 10th European Conference on Artificial Intelligence (ECAI)* (pp. 359-363).
5. Mahdavi, S., et al. (2024). LLM-Guided PDDL Model Creation and Iterative Refinement. *Advances in Neural Information Processing Systems (NeurIPS 2024)*.
6. Kwon, M., et al. (2025). Task Decomposition and Subgoal Planning via Hybrid Symbolic-MCTS with Large Language Models. In *IEEE International Conference on Robotics and Automation (ICRA 2025)*.
7. Corrêa, A. B., et al. (2025). Automated Heuristic Synthesis for Classical Planning via Large Language Models. *arXiv preprint arXiv:2501.xxxxx*.
8. Silver, T., Dan, S., Srinivas, K., Tenenbaum, J. B., Kaelbling, L. P., & Katz, M. (2024). Generalized planning in PDDL domains with pretrained large language models. In *Proceedings of the AAAI Conference on Artificial Intelligence* (Vol. 38, No. 18, pp. 20246-20254).
9. Gopalan, A., & Teo, Y. M. (2025). *CS4246/5446 AI Planning and Decision Making (Version 4.0)*. National University of Singapore (NUS).

# Week 2 - Real-World Planning and Acting: Serializable Subgoals, State Abstractions, Hierarchical Task Networks, and Reachable Sets

<draft>
- 1. Scalability Bottlenecks in Classical Planning & Real-World Complexity
    - The Flat Planning Curse: Exponential state explosion O(b^d) where branching b and depth d render naive search intractable.
    - Three Scalability Pillars: Enhancing efficiency via heuristics, reducing complexity via state abstraction and goal decomposition, and managing structural scale via hierarchical task networks (HTNs).
- 2. Heuristics for Search-Based Planning
    - Explicit vs. Implicit Heuristics: Search algorithms (A*, GBFS) employ explicit cost estimators h(s); logic solvers (SAT, CSP) rely on implicit internal variable/clause ordering.
    - Problem Relaxation Principles: Deriving admissible heuristics by dropping constraints.
    - 8-Puzzle Case Study: Action Slide(t, s1, s2).
        - Ignore Selected Preconditions: Dropping Blank(s2) and Adjacent(s1, s2) derives the Misplaced Tiles heuristic h_misplaced.
        - Ignore Delete Effects: Dropping negative effects allows tiles to duplicate; derives Manhattan Distance, h_max (weak, admissible), h_add (informative, inadmissible), and h_FF (Fast Forward heuristic; greedy relaxed plan length).
- 3. Domain-Independent Pruning & The Sussman Anomaly
    - Symmetry Reduction: Pruning isomorphic subtrees (e.g., Towers of Hanoi).
    - Forward Pruning: Selecting preferred/helpful operators (e.g., Fast Downward).
    - The Sussman Anomaly (Sussman 1975): Blocks A, B, C on table/stack. Demonstrating why independent subgoal planning fails.
        - Sequence 1: Achieving On(A, B) first requires undoing it in Step 3 to clear B before placing B on C.
        - Sequence 2: Achieving On(B, C) first requires undoing it in Step 2 to clear C before moving A.
    - Serializable Subgoals: Definition and ordering conditions guaranteeing that achieving each subgoal does not destroy previously established subgoals.
- 4. State Abstraction & Goal Decomposition
    - State Abstraction Mechanics: Grouping ground states into equivalence classes, searching abstract state space, and mapping back.
    - Air Cargo Scaling Proof: 10 airports, 50 planes, 200 cargos yields 10^50 * (50+10)^200 approx 10^405 states. Abstracting to 5 grouped airports, 5 composite planes, and 5 consolidated cargo bundles compresses the state space to 10^5 * (5+10)^5 approx 10^11 states (huge exponential reduction).
    - Goal Decomposition: Partitioning goal G into G1, ..., Gn. Max(Cost(Pi)) vs. Sum(Cost(Pi)). Analysis of positive synergies vs. negative conflicts in Blocksworld.
- 5. Hierarchical Task Networks (HTN) & High-Level Actions (HLAs)
    - High-Level Actions (HLAs): Non-primitive composite operators encoding procedural domain knowledge, refinable into sub-HLAs or primitive actions.
    - Deferred Planning: Maintaining abstract plans and deferring low-level refinement until execution.
    - Changi Airport Case Study: Top-level HLA Go(Home, SIN). Refinement 1 Drive(Home, SIN) fails (precondition Have(Car) false); Refinement 2 Taxi(Home, SIN) succeeds (Cash(30) true). Exact decomposition: Call-Taxi -> Ride -> Pay-Taxi, tracing state trajectory s0 to s3.
    - Complexity Savings Proof: Flat planning O(b^d) approx 10^30; HTN decomposition with r=3 refinements into k=10 actions requires approx (d-1)/(k-1) = 29/9 approx 3.22 steps, costing O(r^(3.22)) approx 34 operations (astronomical exponential savings).
- 6. Proving Plan Properties: Searching for Abstract Solutions & Reachable Sets
    - Reachable Sets Definition: REACH(s, h) and sequence composition REACH(s, [h1, h2]).
    - Downward Refinement Property: If an abstract plan reaches the goal, at least one primitive refinement achieves the goal.
    - Tilde Notation (~): Explicit agent choice representation (~+A, ~-A, ~+-A). Worked proof on HLAs h1 and h2.
    - Approximate Reachable Sets: Tractable bounds via Optimistic REACH+ (safe for pruning failures) and Pessimistic REACH- (safe for certifying success).
- 7. Industrial Solvers: The PANDA Framework & IPC Competitions
    - PANDA Framework (Uni Ulm): PANDApss (plan-space search), PANDApro (progression search), PANDAtotSAT (SAT encoding).
    - HDDL Specification: Hierarchical Domain Definition Language (AAAI 2020).
    - PANDADealer: Winner of IPC 2023 HTN Track.
- 8. LLM-Assisted Hierarchical Planning & Bridge to Uncertainty
    - LLMs as task decomposers, PDDL modelers, and MCTS rollout policies.
    - Why physical execution breaks determinism: Noisy sensors, stochastic actions, and the need for Decision Theory and Reinforcement Learning.
</draft>

Classical planning provides the formal logic and foundational algorithms for automated reasoning. However, as demonstrated in the physical world, standard flat planners suffer from crippling combinatorial explosions. In this second master technical note for NUS CS5446 (*Reinforcement Learning and Sequential Decision Making*, Version 4.0), based on the curriculum designed by Anandha Gopalan and Teo Yong Meng, we investigate how autonomous systems scale up to real-world complexity through **relaxation-based heuristics**, **domain-independent pruning**, **serializable subgoals**, **state abstraction**, **Hierarchical Task Networks (HTNs)**, and **formal reachable set proofs**.

---

## 1. The Scalability Bottleneck in Classical Planning & Real-World Complexity

### 1.1 The Curse of Flat Planning: Combinatorial State Explosion

In flat (non-hierarchical) classical planning, a planner must search over all ground states by considering every possible primitive action at every decision point. If a domain has an average branching factor of $b$ primitive actions per state and an optimal plan requires $d$ steps, the search space explored by a complete search algorithm scales as:

$$\mathcal{C}_{\text{flat}} = \mathcal{O}(b^d)$$

In even modest real-world scenarios—such as navigating a robotic vehicle or traveling across an urban metropolis:
- An agent might have $b \approx 10$ primitive physical actions per second (e.g., steer left $1^\circ$, steer right $1^\circ$, throttle $1\%$, brake $2\%$, glance in rearview mirror, etc.).
- A plan taking just 30 primitive steps ($d = 30$) results in an intractable search space:

$$\mathcal{C}_{\text{flat}} = \mathcal{O}(10^{30}) \text{ states}$$

Searching $10^{30}$ states would take modern supercomputers billions of years. Flat planners fail because they treat every microscopic actuator movement with the same cognitive weight as major strategic milestones.

```
FLAT PLANNING (Intractable Exponential Explosion):
s0 ---> [10 actions] ---> [100 states] ---> [1000 states] ... ---> O(10^30) states!

HIERARCHICAL PLANNING (Structured Abstraction):
[ Top Goal: Travel(Home, Airport) ]
               |
               v Refine (r=3 choices: Drive, Taxi, MRT)
[ Subtask 1: Call-Taxi ] ---> [ Subtask 2: Ride ] ---> [ Subtask 3: Pay-Taxi ]
               |
               v Expand into primitive actuator steps only when executing!
```

### 1.2 The Three Pillars of Real-World Scalability

To bridge the gap between toy problems and industrial operations, automated planning relies on three foundational engineering methodologies:
1. **Enhancing Efficiency via Heuristics:** Deriving domain-independent cost estimators $h(s)$ from mathematically relaxed problem models to steer state-space search directly toward goal configurations.
2. **Reducing Complexity via State Abstraction & Goal Decomposition:** Grouping billions of ground states into compact equivalence classes and decomposing monolithic goals into independent subgoals.
3. **Managing Complexity via Hierarchical Task Networks (HTN) & Deferred Planning:** Encoding procedural human expertise into High-Level Actions (HLAs) and deferring concrete physical action selection until execution time.

---

## 2. Heuristics for Search-Based Planning

### 2.1 Explicit Search Heuristics vs. Solver-Internal Inference Heuristics

Planning paradigms differ fundamentally in how they guide combinatorial exploration:
- **Search-Based Planning ($\text{A}^*$, Greedy Best-First Search):**
  Relies on an **explicit heuristic function** $h(s): \mathcal{S} \to \mathbb{R}^+$ that estimates the minimal cost from the current state $s$ to any goal state satisfying $g$. This explicit numerical estimate directly prioritizes priority queue expansion.
- **Logical Inference Planning (SATPlan, CSP):**
  Does **not** construct an explicit heuristic function $h(s)$. Instead, modern DPLL and CDCL solvers utilize **solver-internal heuristics**—such as VSIDS (*Variable State Independent Decaying Sum*), clause activity scores, conflict-driven clause learning, and unit propagation ordering—to indirectly steer the search order through proof space.

```
Heuristics in Planning:
+---------------------------------------+---------------------------------------+
| Explicit in State-Space Search        | Implicit in Inference-Based Solvers   |
| (A*, GBFS, Enforced Hill Climbing)    | (SATPlan, CSP, Propositional Solvers) |
| h(s) explicitly estimates cost to go  | Internal variable & clause selection  |
+---------------------------------------+---------------------------------------+
```

### 2.2 Problem Relaxation and Admissible Heuristics

A heuristic $h(s)$ is **admissible** if it never overestimates the true minimal cost $h^*(s)$ required to reach the goal:

$$0 \le h(s) \le h^*(s), \quad \forall s \in \mathcal{S}$$

When used with search algorithms such as $\text{A}^*$, an admissible heuristic mathematically guarantees that the first plan returned is **optimal**.

The standard method for automatically generating admissible heuristics without human domain engineering is **Problem Relaxation**:
- We construct a simplified problem $\mathcal{P}_{\text{relaxed}}$ by removing constraints (preconditions or effects) from the original problem $\mathcal{P}$.
- Because the relaxed agent has more freedom of movement, any valid plan in $\mathcal{P}$ is also valid in $\mathcal{P}_{\text{relaxed}}$.
- Consequently, the optimal cost in $\mathcal{P}_{\text{relaxed}}$ serves as an admissible lower bound for $\mathcal{P}$.

### 2.3 8-Puzzle Case Study: Relaxed Model Derivations

Consider the classic 8-puzzle planning formulation:
- **State:** Position of eight numbered tiles and one blank space on a $3 \times 3$ grid.
- **Action Schema:**

$$\text{Action}(\text{Slide}(t, s_1, s_2))$$

$$\text{Precond}: \text{On}(t, s_1) \land \text{Tile}(t) \land \text{Blank}(s_2) \land \text{Adjacent}(s_1, s_2)$$

$$\text{Effect}: \text{On}(t, s_2) \land \text{Blank}(s_1) \land \neg\text{On}(t, s_1) \land \neg\text{Blank}(s_2)$$

```
        Initial State                 Goal State
        +---+---+---+                +---+---+---+
        | 2 |   | 3 |                | 1 | 2 | 3 |
        +---+---+---+                +---+---+---+
        | 1 | 8 | 4 |    ======>     | 8 |   | 4 |
        +---+---+---+                +---+---+---+
        | 7 | 6 | 5 |                | 7 | 6 | 5 |
        +---+---+---+                +---+---+---+
```

#### 1. Ignore Selected Preconditions: Misplaced Tiles Heuristic ($h_{\text{misplaced}}$)
If we relax the action schema by removing the preconditions $\text{Blank}(s_2) \land \text{Adjacent}(s_1, s_2)$:
- Any tile can instantly teleport to any target square regardless of whether it is blank or adjacent.
- In this relaxed world, the minimal number of actions required is simply the number of tiles currently out of position.
- **Result:** The **Number of Misplaced Tiles** heuristic ($h_{\text{misplaced}} = 3$ for the state above, since tiles 1, 2, and 8 are out of place). It is admissible, but relatively weak because it completely ignores geometric travel distance.
- **Fundamental Challenge (Precondition Selection):** In general automated planning, it is non-trivial and often undecidable to deduce automatically *which* specific preconditions can be selectively ignored across thousands of domain actions without either rendering the relaxed problem trivial (zero heuristic guidance) or retaining too much complexity.

#### 2. Remove the Blank Precondition: Manhattan Distance
Keep adjacency but remove the requirement that the destination is blank. Each tile can move independently through occupied squares. Its relaxed shortest route is its **Manhattan Distance**:

$$d_{\text{Manhattan}}(t) = |x_1 - x_2| + |y_1 - y_2|$$

**Concrete Tile Calculations for Initial State (Slide 17):**
- Tile 1: at $(1, 2)$, goal at $(1, 3) \implies |1 - 1| + |2 - 3| = 1$
- Tile 2: at $(1, 3)$, goal at $(2, 3) \implies |1 - 2| + |3 - 3| = 1$
- Tile 8: at $(2, 2)$, goal at $(1, 2) \implies |2 - 1| + |2 - 2| = 1$
- Tiles 3, 4, 5, 6, 7: already at target positions $\implies \text{distance} = 0$.

For these independent tile distances, two elementary lower bounds are:
- **Maximum Tile Distance:**
  $$h_{\max}(s) = \max_{i} d_{\text{Manhattan}}(t_i) = \max \{ 1, 1, 1, 0, 0, 0, 0, 0 \} = 1$$
  *(Strictly admissible, but weak because it assumes all remaining tiles move for free).*
- **Sum of Tile Distances (Manhattan Heuristic):**
  $$h_{\text{add}}(s) = \sum_{i} d_{\text{Manhattan}}(t_i) = 1 + 1 + 1 = 3$$
  This sum is admissible for the puzzle because one unit-cost move moves only one numbered tile by one grid step.

Delete relaxation removes negative **effects**, while keeping positive **preconditions**, including Blank(destination). It can allow several locations to remain blank or occupied after actions, but it does not erase the blank precondition. Therefore these puzzle distances should not be identified automatically with PDDL $h_{\max}$, $h_{\text{add}}$, or $h_{\text{FF}}$.

#### 3. Why General Goal-Cost Summation Can Overcount

For a fact $p$, initialize relaxed cost $c(p)=0$ when $p$ is true, and otherwise propagate action costs until no value improves:
$$c_{\max}(p)=\min_{a:p\in Add(a)}\left[c(a)+\max_{q\in Pre(a)}c_{\max}(q)\right].$$
Replacing the inner maximum by a sum defines additive propagation $c_{\text{add}}$. At the goal, aggregate by maximum for $h_{\max}$ and by sum for $h_{\text{add}}$. Empty precondition sets contribute zero.

An action costing $1$ that achieves both $g_1$ and $g_2$ gives $h_{\max}=1$, $h_{\text{add}}=2$, and true optimal cost $1$. The sum pays twice for shared work. Thus $h_{\max}$ is admissible under the usual nonnegative-cost STRIPS relaxation; $h_{\text{add}}$ is not generally admissible. FF extracts a shared relaxed plan, avoiding some double counting, but greedy extraction need not find the cheapest relaxed plan.

### 2.4 The Fast-Forward Heuristic ($h_{\text{FF}}$)

Developed by Jörg Hoffmann and Bernhard Nebel (2001), the **Fast-Forward (FF)** heuristic revolutionized domain-independent planning:
1. **Delete Relaxation:** Construct the relaxed planning problem $\mathcal{P}^+$ where all negative literals ($\text{DEL}$) are eliminated from all actions. In $\mathcal{P}^+$, fluents once made true remain true forever.
2. **Greedy Relaxed Plan Extraction:** While finding the *optimal* plan in $\mathcal{P}^+$ is NP-hard, a *suboptimal* relaxed plan $\pi^+$ can be extracted in polynomial time using a planning graph data structure.
3. **Heuristic Value:**

$$h_{\text{FF}}(s) = \text{Length of relaxed plan } \pi^+$$

- **Properties:** Because relaxed plan extraction uses greedy selection, $h_{\text{FF}}$ may occasionally overestimate the true relaxed optimal cost, making it technically **inadmissible**.
- **Practical Impact:** Despite inadmissibility, $h_{\text{FF}}$ is exceptionally informative. When paired with **Enforced Hill-Climbing (EHC)** and **Greedy Best-First Search (GBFS)**, it solves massive industrial benchmarks in seconds, outperforming admissible $\text{A}^*$ search by multiple orders of magnitude.

---

## 3. Domain-Independent Pruning & The Sussman Anomaly

### 3.1 Pruning Techniques: Symmetry Reduction & Helpful Actions

Even with informative heuristics, search trees grow exponentially unless pruned:
1. **Symmetry Reduction:** Detects permutations of objects that yield structurally identical subproblems (e.g., swapping identical disks in the Towers of Hanoi, or swapping identical planes at an airport). The planner preserves only one canonical branch and prunes symmetric equivalents.
2. **Forward Pruning & Preferred Operators:** Rather than evaluating all applicable actions $\mathcal{A}(s)$, planners like *Fast Downward* evaluate only **helpful actions**—actions that appear in the relaxed plan $\pi^+$ extracted by $h_{\text{FF}}$ at state $s$.

### 3.2 The Sussman Anomaly: Why Subgoals Conflict

A natural human intuition is to decompose a goal $G = G_1 \land G_2$ into independent subgoals, solve for $G_1$ first, and then solve for $G_2$. In 1975, Gerald Sussman demonstrated that this naive divide-and-conquer approach fails fundamentally due to **negative subgoal interactions**.

Consider three blocks $A, B, C$ on a table:
- **Initial State:** $\text{On}(C, A) \land \text{OnTable}(A) \land \text{OnTable}(B) \land \text{Clear}(C) \land \text{Clear}(B)$.
- **Goal State:** $\text{On}(A, B) \land \text{On}(B, C)$.

```
      INITIAL STATE                       GOAL STATE
          +---+                              +---+
          | C |                              | A |
          +---+                              +---+
          | A |   +---+                      | B |
          +---+   | B |                      +---+
   =====================                     | C |
   ////// TABLE ////////                     +---+
                                      =====================
                                      ////// TABLE ////////
```

Let us attempt to solve this by sequencing the subgoals:

#### Sequence 1: Achieving $\text{On}(A, B)$ First
1. $\text{MoveToTable}(C, A)$: Move block $C$ to the table to clear $A$.
2. $\text{Move}(A, \text{Table}, B)$: Move block $A$ onto block $B$.
   - **Subgoal $\text{On}(A, B)$ is now Achieved!**
3. Now attempt to achieve the second subgoal: $\text{On}(B, C)$.
   - To move $B$, block $B$ must be clear. But block $A$ is sitting on top of $B$!
   - The planner is forced to **undo** its previously achieved subgoal: $\text{MoveToTable}(A, B)$.
4. $\text{Move}(B, \text{Table}, C)$: Place $B$ on $C$. Subgoal $\text{On}(B, C)$ achieved.
5. $\text{Move}(A, \text{Table}, B)$: Move $A$ back onto $B$.
   - **Total:** 5 steps, requiring the deliberate destruction of a completed subgoal.

#### Sequence 2: Achieving $\text{On}(B, C)$ First
1. $\text{Move}(B, \text{Table}, C)$: Place $B$ on $C$.
   - **Subgoal $\text{On}(B, C)$ is now Achieved!**
2. Now attempt to achieve $\text{On}(A, B)$.
   - To move $A$, block $C$ must be removed from $A$.
   - If the planner tries to clear $A$ while preserving $B$ on $C$, it finds that $C$ is already buried under $B$!
   - The planner must execute $\text{MoveToTable}(B, C)$—**undoing** $\text{On}(B, C)$.
3. $\text{MoveToTable}(C, A)$: Clear $A$.
4. $\text{Move}(A, \text{Table}, B)$ $\implies \text{On}(A, B)$ achieved.
5. $\text{MoveToTable}(A, B) \implies$ undo $\text{On}(A, B)$ to clear $B$.
6. $\text{Move}(B, \text{Table}, C) \implies \text{On}(B, C)$ achieved again.
7. $\text{Move}(A, \text{Table}, B) \implies$ Final goal achieved (7 steps).

**Core Insight:**
In both ordering attempts, achieving one subgoal required **undoing** a previously established subgoal. Subgoals in real-world planning are rarely independent; they exhibit tight, non-linear coupling.

### 3.3 Serializable Subgoals

To formalize when divide-and-conquer planning is valid, Richard Korf formulated the concept of **Serializable Subgoals**:

> **Definition (Serializable Subgoals):**
> A set of subgoals $\{G_1, G_2, \dots, G_n\}$ is **serializable** if there exists an ordering $\langle G_{\pi(1)}, G_{\pi(2)}, \dots, G_{\pi(n)} \rangle$ such that the planner can achieve each subgoal $G_{\pi(i)}$ in sequence *without ever having to undo or violate any previously achieved subgoal* $G_{\pi(j)}$ (for all $j < i$).

- **In the Sussman Anomaly:** The subgoals are **non-serializable** under naive state formulations because achieving $\text{On}(A, B)$ requires manipulating $B$, while achieving $\text{On}(B, C)$ requires placing $B$ on $C$.
- **Engineering Remedy:** Planners must either utilize **partial-order causal link planning** (which tracks causal threats without committing to premature step orderings) or utilize **Hierarchical Task Networks** that encode macro-action sequences avoiding destructive intermediate states.

---

## 4. State Abstraction & Goal Decomposition

### 4.1 State Abstraction: Principles and Mathematical Scaling

**State Abstraction** maps a massive, detailed physical state space $\mathcal{S}$ into a compact, coarse abstract state space $\mathcal{S}_{\text{abstract}}$:

$$f_{\text{abs}}: \mathcal{S} \to \mathcal{S}_{\text{abstract}}$$

Planning is conducted in $\mathcal{S}_{\text{abstract}}$. Once an abstract solution trajectory is found, it is refined back into concrete states.

```
       CONCRETE STATE SPACE S                     ABSTRACT STATE SPACE S_abs
    +---------------------------+              +-----------------------------+
    |  * s1   * s2   * s3   * s4 |              |  [ Abstract State S_A ]     |
    |  * s5   * s6   * s7   * s8 |  ========>  |  (Groups s1...s8)           |
    |  (10^405 total states)    |   f_abs      |  (10^11 total states)       |
    +---------------------------+              +-----------------------------+
```

### 4.2 Air Cargo Transportation Mathematical Scaling Proof

Consider an industrial air cargo transport scenario:
- **Concrete Setup:**
  - $N_{\text{airports}} = 10$ airports.
  - $N_{\text{planes}} = 50$ cargo planes.
  - $N_{\text{cargos}} = 200$ individual cargo containers.

#### 1. Concrete State Space Size ($|\mathcal{S}|$)
- **Planes' Locations:** Each of the 50 planes can be located at any of the 10 airports:

$$\text{Combinations}_{\text{planes}} = 10^{50}$$

- **Cargos' Locations:** Each of the 200 pieces of cargo can either be:
  - Loaded onto one of the 50 planes ($50$ possibilities), or
  - Unloaded at one of the 10 airports ($10$ possibilities).
  - Total possible locations per cargo $= 50 + 10 = 60$.
  - Total cargo location combinations:

$$\text{Combinations}_{\text{cargo}} = 60^{200} = (50 + 10)^{200}$$

- **Total Concrete States:**

$$|\mathcal{S}| = 10^{50} \times 60^{200} \approx 10^{50} \times 10^{355.6} \approx 10^{405.6} \approx \mathbf{10^{405}}$$

An unguided search across $10^{405}$ states is physically impossible.

#### 2. Abstracted State Space Size ($|\mathcal{S}_{\text{abstract}}|$)
Now apply domain-level abstraction:
- Group the problem so all packages originate from just 5 consolidated regional hubs.
- Consolidate individual planes into 5 "fleet wings" (composite planes) heading along major corridors.
- Consolidate 200 cargo items into 5 "macro-shipments" (composite packages).
- **Abstracted Combinations:**
  - 5 composite planes across 10 airports:

$$\text{Combinations}_{\text{planes, abs}} = 10^5$$

  - 5 macro-shipments across 5 planes + 10 airports:

$$\text{Combinations}_{\text{cargo, abs}} = (5 + 10)^5 = 15^5 \approx 759,375 \approx 7.6 \times 10^5$$

- **Total Abstracted States:**

$$|\mathcal{S}_{\text{abstract}}| = 10^5 \times 15^5 \approx \mathbf{10^{11}}$$

**Theoretical Result:**
State abstraction collapses the search space from $10^{405}$ down to $10^{11}$—an astronomical exponential reduction of nearly **400 orders of magnitude**! The abstract plan cost serves as an admissible heuristic for guiding search in the original space.

### 4.3 Goal Decomposition Mechanics: Max vs. Sum

When decomposing a goal $G$ into subgoals $\{G_1, G_2, \dots, G_n\}$ solved by subplans $\{P_1, P_2, \dots, P_n\}$:
- **Max Estimator:**

$$h_{\max}(s) = \max_{i} \text{Cost}(P_i)$$

Always admissible, but severely underestimates true cost when multiple subgoals require independent effort.
- **Sum Estimator:**

$$h_{\text{sum}}(s) = \sum_{i} \text{Cost}(P_i)$$

Admissible **if and only if** subgoals are strictly independent. If subgoals exhibit:
- **Positive Synergies (Shared Actions):** One action achieves components of multiple subgoals $\implies h_{\text{sum}}$ may overestimate true cost (inadmissible).
- **Negative Interactions (Conflict/Undoing):** Actions for $G_1$ destroy preconditions for $G_2$ (as in Sussman Anomaly) $\implies h_{\text{sum}}$ underestimates the true cost of interleaving and backtracking.

**4-Block World Verification Example:**
- Initial State: Blocks $A, B, C, D$ all resting on the table.
- Goal $G$: $\text{On}(A, B) \land \text{On}(C, D)$.
- Subgoal $G_1$: $\text{On}(A, B) \implies \text{Cost}(P_1) = 2$ steps ($\text{PickUp}(A), \text{Stack}(A, B)$).
- Subgoal $G_2$: $\text{On}(C, D) \implies \text{Cost}(P_2) = 2$ steps ($\text{PickUp}(C), \text{Stack}(C, D)$).
- Because $A, B$ and $C, D$ share zero resources and do not interfere:
  - $h_{\max} = \max(2, 2) = 2$ (underestimates badly; true cost is 4).
  - $h_{\text{sum}} = 2 + 2 = 4$ (matches the exact true cost while remaining admissible).

---

## 5. Hierarchical Task Networks (HTN) & High-Level Actions (HLAs)

### 5.1 High-Level Actions (HLAs) and Procedural Knowledge

Rather than discovering plans purely from first-principles preconditions and effects, real-world systems leverage **Hierarchical Task Networks (HTN)**:
- **Primitive Actions:** Concrete physical actions executable directly by actuators (e.g., `TurnSteeringWheel(5)`, `PressPedal(10)`).
- **High-Level Actions (HLAs):** Non-primitive abstract operators encoding procedural knowledge that can be refined into sub-tasks or primitive actions (e.g., `Drive(Home, Airport)`).

```
                            [ Go(Home, SIN) ]
                                    |
                    +---------------+---------------+
                    |                               |
        Refinement 1: Drive             Refinement 2: Taxi
        Precond: Have(Car) [FAILS]      Precond: Cash(30)  [SUCCEEDS]
                                                    |
                                                    v Decomposes into Subtasks
                                        +-----------------------+
                                        | Call-Taxi(Home)       |
                                        | Ride(Home, SIN)       |
                                        | Pay-Taxi(Home, SIN)   |
                                        +-----------------------+
```

**Deliberate Choice vs. Environmental Nondeterminism:**
A common conceptual confusion is conflating HLA refinement choices with environmental uncertainty.
- In nondeterministic environments, the *environment* stochastically picks an outcome.
- In HTN planning, having multiple refinements for an HLA represents **deliberate agent choice**: an HLA achieves a goal if *at least one* valid refinement can be successfully executed by the agent.

### 5.2 The HTN Decomposition Algorithm

The standard HTN planning loop operates through recursive expansion:

```
function HTN-PLAN(initial_state, task_network, hla_library) returns plan
    plan <- task_network
    while plan contains at least one non-primitive HLA do
        hla <- SELECT-HLA(plan)
        refinements <- GET-APPLICABLE-REFINEMENTS(hla, initial_state, hla_library)
        if refinements is empty then
            return BACKTRACK()
        refinement <- CHOOSE(refinements)
        plan <- REPLACE(plan, hla, refinement)
    if EVALUATE(plan, initial_state) satisfies Goal then
        return plan
    else
        return BACKTRACK()
```

### 5.3 Case Study: Journey to Changi Airport (Exact State Trajectory)

To trace the formal mechanics of HTN planning, consider the task of traveling from home to Singapore Changi Airport (airport code: `SIN`):
- **Initial State ($s_0$):**

$$s_0 = \{ \text{At}(\text{Me}, \text{Home}), \text{Cash}(30) \}$$

*(Note: $\text{Have}(\text{Car})$ is absent, evaluating to $\text{False}$ by Closed-World Assumption).*
- **Initial Task Network:** $[\text{Go}(\text{Home}, \text{SIN})]$.
- **Refinement Options in Library:**
  - **Refinement 1 ($\text{Drive}$):**
    - Method: $[\text{Drive}(\text{Home}, \text{OvernightParking}), \text{Shuttle}(\text{OvernightParking}, \text{SIN})]$.
    - Precondition: $\text{Have}(\text{Car})$.
    - **Status:** Evaluated against $s_0$. Precondition fails! Refinement 1 is pruned immediately.
  - **Refinement 2 ($\text{Taxi}$):**
    - Method: $[\text{Call-Taxi}(\text{Home}), \text{Ride}(\text{Home}, \text{SIN}), \text{Pay-Taxi}(\text{Home}, \text{SIN})]$.
    - Precondition: $\text{Cash}(30)$.
    - **Status:** Evaluated against $s_0$. Precondition holds ($30 \ge 30$). Refinement succeeds!

**Decomposition and State Progression:**
1. **Initial State ($s_0$):**
   $$s_0 = \{ \text{At}(\text{Me}, \text{Home}), \text{Cash}(30) \}$$
2. **Execute Action 1:** $\text{Call-Taxi}(\text{Home})$
   $$s_1 = \{ \text{At}(\text{Me}, \text{Home}), \text{At}(\text{Taxi}, \text{Home}), \text{Cash}(30) \}$$
3. **Execute Action 2:** $\text{Ride}(\text{Home}, \text{SIN})$
   $$s_2 = \{ \text{At}(\text{Me}, \text{SIN}), \text{At}(\text{Taxi}, \text{SIN}), \text{Cash}(30) \}$$
4. **Execute Action 3:** $\text{Pay-Taxi}(\text{Home}, \text{SIN})$
   $$s_3 = \{ \text{At}(\text{Me}, \text{SIN}), \text{At}(\text{Taxi}, \text{SIN}), \text{Cash}(0) \}$$

The final state $s_3$ entails $\text{At}(\text{Me}, \text{SIN})$. Goal satisfied.

### 5.4 Mathematical Complexity Savings: Flat vs. HTN

We can mathematically quantify the exponential speedup achieved by hierarchical decomposition:
- Let $d$ be the total number of primitive actions in the final executed plan ($d = 30$).
- Let $b$ be the primitive branching factor ($b \approx 10$).
- **Flat Planner Cost:**

$$\mathcal{C}_{\text{flat}} = \mathcal{O}(b^d) = \mathcal{O}(10^{30})$$

- **HTN Planner Parameters:**
  - Let $r$ be the number of alternative refinements per non-primitive HLA ($r = 3$: Drive, Taxi, MRT).
  - Let $k$ be the number of subtasks produced by each refinement ($k = 10$).
  - Because each refinement replaces 1 HLA with $k$ actions, it net-adds $(k - 1)$ actions.
  - To reach $d$ primitive actions starting from 1 top-level task requires $(d - 1)$ additions.
  - Total number of hierarchical decomposition steps:

$$\text{Decomposition Steps} \approx \frac{d - 1}{k - 1} = \frac{30 - 1}{10 - 1} = \frac{29}{9} \approx 3.22$$

- **HTN Planner Cost:**

$$\mathcal{C}_{\text{HTN}} = \mathcal{O}\left(r^{\frac{d-1}{k-1}}\right) = \mathcal{O}\left(3^{3.22}\right) \approx \mathbf{34.3} \approx \mathbf{34} \text{ operations}$$

$$\frac{\mathcal{C}_{\text{flat}}}{\mathcal{C}_{\text{HTN}}} \approx \frac{10^{30}}{34} \approx 3 \times 10^{28} \text{ times faster!}$$

**Architectural Insight:**
A small refinement branching factor $r$ combined with a large expansion factor $k$ produces a highly compact, specialized HLA library. While designing such libraries requires domain engineering, it reduces astronomical search costs down to instantaneous lookup speeds.

---

## 6. Proving Plan Properties: Searching for Abstract Solutions & Reachable Sets

### 6.1 Motivation: Abstract Verification Without Microscopic Details

Can an intelligent agent prove that a high-level plan will achieve its goal *without* planning every low-level detail in advance?
- Consider the high-level plan $[\text{Call-Taxi}(\text{Home}), \text{Ride}(\text{Home}, \text{SIN}), \text{Pay-Taxi}(\text{SIN})]$.
- When formulating this plan at home, the agent does not need to know whether the taxi will take the Ayer Rajah Expressway (AYE) or the Pan Island Expressway (PIE), nor which specific terminal door the car will stop at.
- To prove mathematically that an abstract plan is guaranteed to succeed, we utilize **Reachable Sets**.

### 6.2 Reachable Sets & The Downward Refinement Property

> **Definition (Reachable Set):**
> For any state $s$ and High-Level Action $h$, the **Reachable Set** $\text{REACH}(s, h)$ is the set of all physical states that can be reached from $s$ by *any* valid primitive implementation of $h$.

For a sequence of HLAs $\vec{h} = \langle h_1, h_2, \dots, h_m \rangle$, reachable sets compose inductively:

$$\text{REACH}(s, [h_1, h_2]) = \bigcup_{s' \in \text{REACH}(s, h_1)} \text{REACH}(s', h_2)$$

```
State s0 --------> [ HLA h1 ] --------> REACH(s0, h1) = {s1, s2, s3}
                                               |
                                               v Apply HLA h2 to each state
                                        REACH(s0, [h1, h2]) = {s4, s5, s6, s7}
                                               |
                                               v Intersects Goal?
                                        [ Goal State Set G ] (Intersect != 0)
```

> **Theorem (Downward Refinement Property):**
> An HLA library satisfies the **Downward Refinement Property (DRP)** if, for every abstract plan $\vec{h}$ that reaches the goal from initial state $s$ (i.e., $\text{REACH}(s, \vec{h}) \cap \mathcal{G} \neq \emptyset$), there exists at least one primitive refinement sequence $\vec{a}$ of $\vec{h}$ that is physically executable and reaches a goal state.

When DRP holds, the planner can search purely in the abstract space; it never needs to backtrack across high-level commitments due to hidden low-level primitive dead-ends.

### 6.3 Tilde Notation for Representing Abstract Effects

Because an HLA encapsulates multiple alternative refinements, its effects cannot be expressed as deterministic single facts. We utilize the **tilde notation ($\sim$)** to indicate effects that are *under the deliberate control of the agent*:
- $\tilde{+} A$ (*"Possibly Add $A$"*): The agent can choose a refinement that makes fluent $A$ true, or choose one that leaves $A$ unchanged.
- $\tilde{-} A$ (*"Possibly Delete $A$"*): The agent can choose a refinement that deletes fluent $A$, or choose one that leaves $A$ unchanged.
- $\tilde{\pm} A$ (*"Full Control over $A$"*): The agent can freely choose a refinement making $A$ true, or one making $A$ false.

**Worked Verification Exercise:**
Consider two HLAs $h_1$ and $h_2$:
- $\text{Action}(h_1, \text{Precond}: \neg A, \text{Effect}: A \land \tilde{-} B)$
- $\text{Action}(h_2, \text{Precond}: \neg B, \text{Effect}: \tilde{+} A \land \tilde{\pm} C)$
- **Initial State:** $s_0 = \{ B \}$ (fluents $A$ and $C$ are false).
- **Goal:** $A \land C$.

**Proof that HLA sequence $[h_1, h_2]$ achieves the goal:**
1. In $s_0$, $A$ is false $\implies \neg A$ holds $\implies h_1$ is applicable.
2. Applying $h_1$ adds $A$. The agent actively chooses the implementation that deletes $B$ (permitted by $\tilde{-} B$).
   - Resulting state: $s_1 = \{ A \}$.
3. In $s_1$, $B$ is false $\implies \neg B$ holds $\implies h_2$ is applicable.
4. Applying $h_2$: The agent picks an implementation that leaves $A$ true (permitted by $\tilde{+} A$) and sets $C$ to true (permitted by $\tilde{\pm} C$).
   - Resulting state: $s_2 = \{ A, C \}$.
5. State $s_2$ entails goal $A \land C$. Abstract plan $[h_1, h_2]$ is proven sound!

### 6.4 Approximate Reachable Sets: Tractable Bounding

Computing exact reachable sets $\text{REACH}(s, h)$ for complex HLAs is computationally intractable because an HLA may have infinitely many refinements. We bound the exact set using **Optimistic** and **Pessimistic** approximations:

$$\text{REACH}^-(s, h) \subseteq \text{REACH}(s, h) \subseteq \text{REACH}^+(s, h)$$

```
                +-------------------------------------------+
                |      REACH+(s, h)  [Optimistic Bound]     |
                |   (Overestimates: assumes best-case)      |
                |        +-------------------------+        |
                |        |  REACH(s, h)  [Exact]   |        |
                |        |    +---------------+    |        |
                |        |    | REACH-(s, h)  |    |        |
                |        |    | [Pessimistic] |    |        |
                |        |    +---------------+    |        |
                |        +-------------------------+        |
                +-------------------------------------------+
```

1. **Optimistic Reachable Set ($\text{REACH}^+$):**
   - Overestimates reachability by assuming all possible positive effects hold and ignoring negative interactions.
   - **Pruning Rule:** If $\text{REACH}^+(s, \vec{h}) \cap \mathcal{G} = \emptyset$, then even in the most optimistic scenario the plan cannot touch the goal.
   - **Action:** **Prune the abstract plan immediately!** (Safe for pruning failures).
2. **Pessimistic Reachable Set ($\text{REACH}^-$):**
   - Underestimates reachability by including only states guaranteed to be reachable across *every* refinement.
   - **Certification Rule:** If $\text{REACH}^-(s, \vec{h}) \cap \mathcal{G} \neq \emptyset$, then *any* refinement chosen is mathematically guaranteed to achieve the goal.
   - **Action:** **Commit to the plan without further search!** (Safe for certifying success).
3. **Intermediate Region:**
   - If $\text{REACH}^+$ intersects the goal, but $\text{REACH}^-$ does not:
   - **Action:** The planner cannot be certain. It selects an HLA in $\vec{h}$ and **refines it** to the next hierarchical level.

---

## 7. Industrial Solvers: The PANDA Framework & IPC Competitions

### 7.1 The PANDA Framework for Hierarchical Planning

Developed by the Institute of Artificial Intelligence at Ulm University, **PANDA** (*Planning and Acting in a Network Decomposition Architecture*) is the premier open-source framework for HTN planning:
- **`PANDApss`:** Implements heuristic plan-space search combining HTN decomposition with Partial-Order Causal Link (POCL) reasoning.
- **`PANDApro`:** Performs heuristic progression search in the decomposition space.
- **`PANDAtotSAT`:** Solves totally ordered hierarchical planning problems by compiling the task network and decomposition constraints into propositional SAT formulas.

### 7.2 HDDL: Hierarchical Domain Definition Language

Standardized at AAAI 2020 by Daniel Höller et al., **HDDL** extends PDDL to support hierarchical planning:

```lisp
(define (domain transport-hierarchical)
  (:requirements :hierarchy :typing)
  (:types location vehicle package)
  (:task deliver :parameters (?p - package ?l - location))

  (:method m-deliver-by-truck
    :parameters (?p - package ?l - location ?v - vehicle)
    :task (deliver ?p ?l)
    :subtasks (and
      (task1 (load ?p ?v))
      (task2 (drive ?v ?l))
      (task3 (unload ?p ?v)))
    :ordering (and (task1 < task2) (task2 < task3)))
)
```

In the **International Planning Competition (IPC 2023)** HTN tracks, the **PANDADealer** solver secured top honors across totally ordered categories, proving the scalability of heuristic decomposition in industrial logistics and space scheduling.

---

## 8. Modern Extensions: LLM-Assisted Hierarchical Planning

Modern research integrates Large Foundation Models into hierarchical planning architectures to overcome manual HLA engineering:

| Integration Paradigm | Technical Role in HTN & Hierarchical Reasoning | State-of-the-Art Benchmark |
| :--- | :--- | :--- |
| **Model Creation** | Automated extraction of PDDL/HDDL methods from natural language SOPs with feedback loops. | Mahdavi et al. (*NeurIPS 2024*); Fast Downward + VAL |
| **Task Decomposition** | Decomposing complex goals into structured subgoals; switching to MCTS when subproblem exceeds complexity threshold. | Kwon et al. (*ICRA 2025*); Hybrid Symbolic + LLM MCTS |
| **Heuristic Synthesis** | Writing domain-specific Python heuristic functions evaluated by progression engines. | Corrêa et al. (*2025*); Pyperplan GBFS |
| **Strategy Generalization** | Generating generalized algorithmic procedures capable of solving variable-sized task networks. | Silver et al. (*AAAI 2024*); CoT Program Synthesis |

### 8.1 Hybrid Switching: Symbolic Planner vs. LLM MCTS

In the framework established by Kwon et al. (ICRA 2025):
- For subgoals of low to moderate complexity, the system routes execution to a classical symbolic planner (*Fast Downward*), guaranteeing sub-millisecond optimal execution.
- If a subproblem $P_i$ exceeds an algorithmic complexity bound (measured via estimated state branching or Minimum Description Length), the system dynamically routes $P_i$ to a **Monte Carlo Tree Search (MCTS)** planner using an LLM rollout policy, bypassing symbolic bottlenecks.

---

## 9. Summary & Bridge to Uncertainty

In Week 2, we have established the three fundamental pillars that allow automated planning to conquer real-world scale:
1. **Relaxation-based heuristics** ($h_{\text{misplaced}}$, $h_{\text{add}}$, $h_{\text{FF}}$) that guide state-space search.
2. **State abstractions and serializable subgoals** that collapse state spaces by hundreds of orders of magnitude.
3. **Hierarchical Task Networks (HTNs)** that reduce exponential complexity from $\mathcal{O}(10^{30})$ down to $\approx 34$ operations via High-Level Actions (HLAs) and approximate reachable sets ($\text{REACH}^+ / \text{REACH}^-$).

### The Boundary of Determinism
Despite their scalability, HTNs and classical planners fundamentally assume **deterministic physics** and **static environments**:
- In the real physical world, roads have unpredictable traffic jams; delivery drones encounter turbulent wind gusts; and medical patients respond stochastically to medication.
- Actions no longer succeed with 100% certainty, and goals cannot be treated as binary checkboxes.
- Autonomous agents must evaluate **probabilities of success**, **risk vs. reward trade-offs**, and **multi-attribute preferences**.

This brings us directly to **Week 3: Rational Decision Making — Decision Theory, Utility Theory, and Game Theory**!

---

<reviewkit>
<takeaways>
- **The Curse of Flat Planning:** Non-hierarchical planning scales as $\mathcal{O}(b^d)$, making even simple 30-step plans ($\mathcal{O}(10^{30})$) completely intractable for classical search engines.
- **Explicit vs. Implicit Heuristics:** Search algorithms use explicit heuristic functions $h(s)$ to guide queue expansion, whereas logic/SAT solvers rely on implicit clause and variable ordering heuristics.
- **Problem Relaxation:** Dropping action preconditions derives the Misplaced Tiles heuristic; dropping delete effects derives Manhattan Distance, $h_{\max}$ (admissible), $h_{\text{add}}$ (informative but inadmissible), and $h_{\text{FF}}$ (Fast-Forward greedy relaxed plan length).
- **The Sussman Anomaly:** Highlights the non-serializability of independent subgoals, where achieving one goal requires actively undoing a previously established goal.
- **State Abstraction Power:** In Air Cargo transport, grouping 10 airports, 50 planes, and 200 cargos into 5 composite corridors collapses the state space from $10^{405}$ to $10^{11}$ states.
- **Hierarchical Task Networks (HTN):** Break tasks into High-Level Actions (HLAs) that encode procedural domain knowledge. In the Changi Airport case study, HTN decomposition reduces planning cost from $\mathcal{O}(10^{30})$ to $\approx 34$ operations ($\mathcal{O}(r^{(d-1)/(k-1)})$).
- **Reachable Sets & Downward Refinement Property:** $\text{REACH}(s, h)$ represents all states reachable by any HLA implementation. The Downward Refinement Property guarantees that if an abstract plan intersects the goal, a valid primitive plan is guaranteed to exist.
- **Tilde Notation ($\sim$):** Represents deliberate agent choices within HLAs ($\tilde{+} A$ possibly adds $A$, $\tilde{-} A$ possibly deletes $A$, $\tilde{\pm} A$ gives full control).
- **Approximate Reachable Sets:** Optimistic $\text{REACH}^+$ overestimates reachability and is safe for pruning failures; pessimistic $\text{REACH}^-$ underestimates reachability and is safe for certifying success without further refinement.
- **PANDA Framework & HDDL:** PANDA provides industrial HTN plan-space, progression, and SAT solvers, utilizing the HDDL standard for hierarchical benchmarking.
</takeaways>

<qprompt/>
</reviewkit>

## References

1. Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4th ed.). Pearson. (Chapters 11.3, 11.4, 11.7).
2. Sussman, G. J. (1975). *A Computer Model of Skill Acquisition*. American Elsevier.
3. Hoffmann, J., & Nebel, B. (2001). The FF planning system: Fast plan generation through heuristic search. *Journal of Artificial Intelligence Research*, 14, 253-302.
4. Helmert, M. (2006). The Fast Downward planning system. *Journal of Artificial Intelligence Research*, 26, 191-246.
5. Nau, D., Ghallab, M., & Traverso, P. (2004). *Automated Planning: Theory and Practice*. Morgan Kaufmann.
6. Korf, R. E. (1987). Planning as search: A quantitative approach. *Artificial Intelligence*, 33(1), 65-88.
7. Georgievski, I., & Aiello, M. (2015). HTN planning: Overview, comparison, and beyond. *Artificial Intelligence*, 222, 124-156.
8. Höller, D., et al. (2020). HDDL: An extension to PDDL for expressing hierarchical planning problems. In *Proceedings of the AAAI Conference on Artificial Intelligence*, 34(06), 9883-9891.
9. Höller, D., et al. (2021). The PANDA framework for hierarchical planning. *KI - Künstliche Intelligenz*, 35(1), 127-133.
10. Höller, D. (2026). Learning heuristic functions for HTN planning. In *Proceedings of the AAAI Conference on Artificial Intelligence*, 40(43), 36262–36270.
11. Gopalan, A., & Teo, Y. M. (2025). *CS4246/5446 Real World Planning and Acting (Version 4.0)*. National University of Singapore (NUS).

# Week 3 - Rational Decision Making: Decision Theory, Utility Theory, and Game Theory

<draft>
- 1. Foundations of Decision Making under Uncertainty
    - Environmental Context: Transition from deterministic static worlds to episodic and partially observable environments with uncertain states and stochastic action effects.
    - Core Rational Agent Triad:
        - Beliefs: Internal probabilistic world model and state distributions.
        - Preferences: Utility functions mapping outcome desirability into scalar values.
        - Decision Process: Optimal selection maximizing expected benefit or minimizing cost within computational and resource limits.
    - Types of Rationality: Substantive (ends-focused; achieving desirable outcomes), Procedural (means-focused; using a coherent, justifiable method), and Meta-level (bounded rationality, deciding how to decide, meta-reasoning).
    - The BDI (Belief-Desire-Intention) Model: Beliefs inform decisions, Desires guide prioritization, Intentions anchor planning and execution in modern agentic AI (LLM agents combining reasoning, planning, and tool use).
    - Mathematical Decision Model: Actions a in A, state distribution P(s) (equals 1 for fully observable environments), transition model P(s' | s, a), outcome random variable Result(a), probability distribution P(Result(a) = s') = sum_s P(s) P(s' | s, a), and utility function U(s).
    - From Logical Planning to Decision Modeling: Propositions/rules/formulas vs. probability and utility; classical planning as a special case with deterministic transitions and binary utilities.
    - Types of Decision Theory: Normative (how ideal agents should decide), Descriptive (how real agents actually decide), and Prescriptive (guiding rational decision making in real-world settings).
    - Historical Foundations: Daniel Bernoulli (1738; measuring risk with subjective utility in single-agent settings) and John von Neumann & Oskar Morgenstern (1944; game theory and expected utility under strategic multi-agent interaction).
- 2. The Maximum Expected Utility (MEU) Principle
    - Fundamental Assumption: Rational agents choose actions that maximize expected utility.
    - Formal Formulation: a* = argmax_a E[U(a)] = argmax_a sum_s' P(Result(a) = s') U(s').
    - Incorporating Current State Uncertainty: E[U(a)] = sum_s' sum_s P(s) P(s' | s, a) U(s').
    - Decision Flow: Known preferences -> Compute expected utility -> Rational decision ("A prescription for intelligent behavior - 'do the right thing' - a basis for AI").
    - Internalized Performance Measure: Performance measures evaluate complete external histories; utility functions guide local sequential decisions step by step.
    - Computational Challenges of MEU: Evaluating vast action spaces, estimating probabilities P(s) and P(s' | s, a) (requiring perception, learning, causal inference), and estimating utilities U(s') under epistemic uncertainty.
    - Rational Decision-Theoretic Agent: Idealized hypothetical agent satisfying rationality axioms and executing MEU.
- 3. Case Studies in Decision Making under Uncertainty: Panda's Lunch Choice
    - Part A: Simple Lunch Choice (Full Observability):
        - Setup: Lulu chooses where to find lunch today.
        - Bamboo Grove: 50% chance of 10 shoots, 50% chance of 0 shoots. EU = 0.5(10) + 0.5(0) = 5.
        - Berry Bush: 100% chance of 4 berries. EU = 1.0(4) = 4.
        - Assumptions: Equal preference for shoots and berries; more food = higher utility.
        - Decision: Choose Bamboo Grove (5 > 4).
    - Part B: Partially Observable Environments & Bayesian Updating:
        - Setup: Bamboo Grove (risky) vs. Berry Bush (sure U=4), grove hidden from location.
        - Prior Beliefs: P(B) = 0.5 (bamboo present), P(~B) = 0.5 (empty grove). Grove utilities: U(B)=10, U(~B)=0.
        - Noisy Sensor / Observation: O in {rustling, no rustling}.
        - Likelihoods:
            - Wind in leaves (bamboo present): P(rustling | B) = 0.20 -> P(no rustling | B) = 0.80.
            - Monkeys eating bamboo (bamboo absent): P(rustling | ~B) = 0.60 -> P(no rustling | ~B) = 0.40.
        - Case 1 (Hearing Rustling):
            - Bayes' Rule: P(B | rustling) = (0.2 * 0.5) / (0.2 * 0.5 + 0.6 * 0.5) = 0.10 / 0.40 = 0.25.
            - Expected Utilities: EU(Grove | rustling) = 0.25(10) + 0.75(0) = 2.5; EU(Berry) = 4.
            - Decision: Choose Berry Bush (4 > 2.5)!
        - Case 2 (Hearing No Rustling):
            - Bayes' Rule: P(B | no) = (0.8 * 0.5) / (0.8 * 0.5 + 0.4 * 0.5) = 0.40 / 0.60 = 2/3 approx 0.667.
            - Expected Utilities: EU(Grove | no) = (2/3)(10) + (1/3)(0) approx 6.67; EU(Berry) = 4.
            - Decision: Choose Bamboo Grove (6.67 > 4)!
        - Takeaways: Belief updating (Bayes) -> new posteriors -> new EUs -> new choice. Active sensing reverses optimal actions.
- 4. The Axioms of Rational Preferences (Von Neumann-Morgenstern)
    - Preference Notations: Strict preference (A > B), Indifference (A ~ B), Weak preference (A >= B).
    - Lotteries: L = [p1, S1; ...; pn, Sn] over outcome states or nested sub-lotteries.
    - Six VNM Axioms:
        - A1. Orderability (Completeness): A > B, B > A, or A ~ B. Lulu compares 5 bamboo shoots vs. 1 bowl of berries.
        - A2. Transitivity: A > B and B > C implies A > C. Bamboo > Berries > Honey -> Bamboo > Honey. Money pump argument.
        - A3. Continuity: A > B > C implies exists p such that [p, A; 1-p, C] ~ B. 5 shoots for sure ~ [0.6, 10 shoots; 0.4, 1 shoot].
        - A4. Substitutability (Independence): A ~ B implies [p, A; 1-p, C] ~ [p, B; 1-p, C]. Swapping equal prizes preserves indifference.
        - A5. Monotonicity: A > B implies (p > q iff [p, A; 1-p, B] > [q, A; 1-q, B]). Higher probability of better prize is strictly preferred.
        - A6. Decomposability: Compound lotteries reduce via probability multiplication: [p, A; 1-p, [q, B; 1-q, C]] ~ [p, A; (1-p)q, B; (1-p)(1-q), C].
    - Social Choice Caveat: The Pizza Party Example (Alice: Pasta > Pizza > Salad; Bob: Salad > Pasta > Pizza; Charlie: Pizza > Pasta > Salad). Group preference aggregation, Condorcet cycles, and Arrow's Impossibility Theorem.
- 5. The Expected Utility Theorem & Formal Mathematical Proof
    - Existence of Utility Function: Preferences obeying axioms imply existence of U such that U(A) > U(B) iff A > B, and U(A) = U(B) iff A ~ B.
    - Expected Utility of a Lottery: U([p1, S1; ...; pn, Sn]) = sum_i pi U(Si).
    - Formal Proof Sketch (Jonathan Levin, Stanford Economics 202, 2006):
        - Step 1: Normalize scale endpoints U(L_bot) = 0 and U(L_top) = 1.
        - Step 2: Define utility via unique equivalent lottery probability p_L where L ~ [p_L, L_top; 1-p_L, L_bot].
        - Step 3: Prove Monotonicity: 1 > p > q > 0 implies L_top > [p, L_top; 1-p, L_bot] > [q, L_top; 1-q, L_bot] > L_bot via Substitutability.
        - Step 4: Prove Order Preservation: L1 >= L2 iff p_L1 >= p_L2 iff U(L1) >= U(L2).
        - Step 5: Prove Linearity over Compound Lotteries: U([alpha, L1; 1-alpha, L2]) = alpha U(L1) + (1-alpha) U(L2).
    - Positive Affine Invariance: U'(s) = a U(s) + b with a > 0. Stretching or shifting scale leaves decisions unchanged; forbids interpersonal utility comparisons.
- 6. Constructing Utility Functions & Preference Elicitation Methods
    - Assessment Approaches: Direct methods (PE, CE) vs. Indirect methods (expert consensus, published actuarial data).
    - Method 1: Probability Equivalents (PE Method):
        - Scale endpoints u_bot = 0, u_top = 1. Present choice between sure prize S and lottery [p, u_top; 1-p, u_bot]. Adjust p until indifferent.
        - Demonstration: Grading in CS4246/CS5446. U(F) = 0, U(A) = 1. Elicit indifferent p for sure grade B, C, D.
    - Method 2: Certainty Equivalents (CE Method):
        - 6-step procedure: Initial points, reference lottery, bisecting certainty equivalents where U(CE) = EU(Lottery), plotting curve.
        - Numerical Walkthrough: Worst = $10 (U=0), Best = $100 (U=1).
            - L1 = [0.5, $100; 0.5, $10] -> CE1 = $30 -> U(30) = 0.5.
            - L2 = [0.5, $100; 0.5, $30] -> CE2 = $50 -> U(50) = 0.75.
            - L3 = [0.5, $30; 0.5, $10] -> CE3 = $18 -> U(18) = 0.25.
        - Curve plotting across coordinates (10, 0), (18, 0.25), (30, 0.50), (50, 0.75), (100, 1.00).
    - Empirical Utility Curve Table:
        - Wealth x = {0, 400, 600, 1000, 1500, 2500} vs. U(x) = {0.15, 0.47, 0.65, 0.93, 1.24, 1.50}.
        - Mathematical functional forms: U(x) = log(x), U(x) = 1 - e^(-x/R), U(x) = x^0.5.
- 7. Utility of Money, Risk Attitudes, and Risk Premium
    - Expected Monetary Value (EMV) vs. Expected Utility.
    - Example: A Choice of Games:
        - Game 1: Win $30 (p=0.5), Lose $1 (p=0.5) -> EMV = $14.50.
        - Game 2: Win $2000 (p=0.5), Lose $1900 (p=0.5) -> EMV = $50.00.
        - Single-play choice vs. 10-play choice: Downside risk and ruin vs. Law of Large Numbers (expected profit $500 vs. $145).
    - The $1,000,000 Coin Flip Paradox:
        - Current wealth $1M. Coin flip: Lose all ($0) if Heads, Gain $1.5M ($2.5M total) if Tails.
        - EMV(Accept) = $1.25M > $1M.
        - Expected Utility with concave wealth curve (U($0)=5, U($1M)=8, U($2.5M)=9): EU(Accept) = 7.0 < EU(Decline) = 8.0 -> Rational choice is Decline!
    - Certainty Equivalent (CE) Definition: Cash value accepted in lieu of lottery; U(CE) = EU(Lottery).
    - Risk Premium = EMV - CE: Value sacrificed to eliminate risk.
    - Graphic Breakdown: Log utility curve, risky outcomes ($1M, $3.5M), sure outcome ($2M), expected wealth EMV = $2.25M, expected utility ~0.625, CE = $1.87M, Risk Premium = $0.38M.
    - Three Risk Attitudes:
        - Risk-Averse: CE < EV, Risk Premium > 0, strictly concave curve U''(x) < 0.
        - Risk-Neutral: CE = EV, Risk Premium = 0, linear curve U''(x) = 0.
        - Risk-Seeking: CE > EV, Risk Premium < 0, strictly convex curve U''(x) > 0.
    - Calculating Risk Premium (4-Step Recipe): Compute EU, Find CE, Compute EV/EMV, Calculate EV - CE.
    - Exercise: Paying to Avoid Risk:
        - Win $2000 (p=0.5), Lose $20 (p=0.5). EMV = $990.
        - If CE = $300 -> Risk Premium = $990 - $300 = $690.
    - Summary & Caveats: Utility is non-linear and non-additive (U(a+b) != U(a) + U(b)); must be assessed at outcome endpoints.
- 8. Real-World Domain Utility Metrics
    - Healthcare: QALY (Years x Quality score 0-1; e.g. 10 yrs at 0.6 = 6 QALYs), DALY (Years lost to disability or death; lower is better), Micromort (10^-6 chance of death).
    - Public Policy: Value of Statistical Life (VSL; monetary cost per statistical life saved; US EPA/DOT ~$14M in 2025, Australia AUD $5.9M in 2025; sources US HHS & Australian Office of Impact Analysis).
    - Transportation: Value of Hour Traveled (VHT; -Time cost x Hourly wage, ~$20/hr).
    - Finance & Economics: Exponential utility (U(x) = 1 - e^(-rx)), Logarithmic utility (U(x) = log(x)).
    - Energy & Environment: Carbon cost utility (U = -tons CO2 x $ per ton, e.g. $50/ton).
- 9. The Decision Analysis Process & The Martian Adventures Case Study
    - Prescriptive Decision Analysis Framework (Ronald A. Howard, 1988): Problem Formulation -> Problem Modeling -> Choose Alternative -> Sensitivity Analysis -> Implementation.
    - Decision Basis Formulation: Alternatives (Choice), Information (Models & Probabilities), Preferences (Value, Time, Risk). Sensitivity to Choice, Information, and Preference.
    - Basic Elements of a Decision Model: Decision nodes (rectangles), Chance nodes (ovals), Value/Utility nodes (diamonds), Probabilistic dependencies, Informational dependencies.
    - Graphical Decision Models: Influence Diagrams vs. Decision Trees.
    - Example Decision Model (1) - Influence Diagram: Exploration Tool Design -> Initial Outcome -> New Unit Decision -> Final Outcome -> Utility. Analytical questions.
    - Example Decision Model (2) - Martian Adventures Case Study (Persy the Mars Rover):
        - Scenario: Deploying rock sampling tool; Solar Power vs. Battery Power vs. No New Tool. Payload constraints and resupply contingency.
        - Two-stage decision problem: Power design selection and failure response (Send New Unit vs. Abandon Project).
        - Numerical Tree Parameters:
            - Battery: Success (0.75, U=1.0), Failure (0.25) -> Send New Unit (Success 0.3, U=0.8; Failure 0.7, U=0.0) vs. Abandon (U=0.2).
            - Solar: Success (0.60, U=1.0), Failure (0.40) -> Send New Unit (Success 0.8, U=0.8; Failure 0.2, U=0.0) vs. Abandon (U=0.2).
            - No New Tool: U = 0.40.
        - Backward Induction Solution:
            - Battery second stage: EU(Send) = 0.24 > U(Abandon)=0.20 -> Send. EU(Battery) = 0.75(1.0) + 0.25(0.24) = 0.81.
            - Solar second stage: EU(Send) = 0.64 > U(Abandon)=0.20 -> Send. EU(Solar) = 0.60(1.0) + 0.40(0.64) = 0.856.
            - Decision: Deploy Solar Power (0.856 > 0.81 > 0.40)!
        - Key Estimation Questions: How to estimate uncertainties? How to estimate utilities?
    - Decision Computing Software Tools: DPL, Netica, TreeAge Pro, Palisade PrecisionTree, BayesiaLab, Hugin Expert, BayesFusion GeNIe & SMILE, and INFORMS Decision Analysis Software Survey.
- 10. Game Theory: Strategic Multi-Agent Decision Making
    - Single-Agent Utility Theory (Bernoulli 1738) vs. Multi-Agent Game Theory (Von Neumann & Morgenstern 1944).
    - The Pandas' Dilemma: Bobo and Almo (bamboo in short supply; Share vs. Keep Secret).
    - Payoff Matrix: (Keep, Keep) -> (1, 1); (Keep, Share) -> (5, 0); (Share, Keep) -> (0, 5); (Share, Share) -> (3, 3).
    - Dominant Strategy Analysis & Nash Equilibrium: Individual self-interest leads strictly to (Keep, Keep) = (+1, +1).
    - Collective Pareto Optimality: Mutual cooperation yields (+3, +3). Fundamental lesson: Individually rational choices can be collectively suboptimal.
    - Common Applications Matrix across 8 Domains (Economics, Networks, Political Science, Biology, Business, Social Impact, Healthcare, Education; Maschler, Solan, Zamir 2020).
- 11. Real-World AI Applications, Challenges & Course Bridge
    - AI Applications: MEU in planning, learning, and inference; human-AI collaboration.
    - Open Challenges: Eliciting preferences in dynamic contexts, integrating expert judgment with data, responsible AI governance.
    - Bridge to Reinforcement Learning: Transition from single-stage MEU to sequential decision making, Markov Decision Processes (MDPs), and RL.
    - Reviewkit (<takeaways>, <qquiz/>, <qprompt/>) & Formal Academic References.
</draft>

In the physical world, autonomous agents rarely operate in the idealized, deterministic, static environments of classical planning. Physical robotic sensors deliver noisy, incomplete observations; mechanical actuators suffer from slippage and wear; external environments evolve dynamically; and other autonomous entities simultaneously optimize their own self-interested objectives.

To act intelligently in the presence of uncertainty, an agent must transition from boolean goal satisfaction to **probabilistic reasoning** and **utility-theoretic optimization**. Based on the National University of Singapore curriculum developed by Anandha Gopalan and Teo Yong Meng (NUS CS4246/CS5446 Version 3.0), this master technical note establishes the rigorous mathematical foundations of **Rational Decision Making**, covering **Maximum Expected Utility (MEU)**, **Bayesian belief updating in partially observable worlds**, **Von Neumann-Morgenstern (VNM) utility theory**, **formal preference elicitation**, **risk premium economics**, **prescriptive decision analysis (influence diagrams and decision trees)**, and **strategic multi-agent game theory**.

---

## 1. Foundations of Decision Making under Uncertainty

### 1.1 Environmental Context & The Core Rational Agent Triad

In real-world environments characterized by uncertainty, partial observability, and episodic dynamics, rational decision making rests upon three interconnected components:

```
                            +---------------------------+
                            |       Real World          |
                            | (Uncertainty & Dynamics)  |
                            +---------------------------+
                                          |
                                          v Observation (Noisy / Incomplete)
+-----------------------------------------------------------------------------------+
|                              Rational Agent Mind                                  |
|                                                                                   |
|   1. BELIEFS (Probabilistic World Model)                                          |
|      Maintains probability distribution P(s) over hidden states.                   |
|      Updates beliefs via Bayes' Rule upon receiving sensory observations.          |
|                                                                                   |
|   2. PREFERENCES (Utility Function U)                                             |
|      Maps environmental outcomes into real-valued scalars U(s).                    |
|      Encodes domain trade-offs, risk tolerance, and qualitative values.           |
|                                                                                   |
|   3. DECISION PROCESS (Expected Utility Optimization)                             |
|      Selects action a* that maximizes expected utility within resource limits.    |
+-----------------------------------------------------------------------------------+
                                          |
                                          v Actuate Action a*
                            +---------------------------+
                            |      Environment          |
                            +---------------------------+
```

### 1.2 Three Types of Rationality

In classical philosophy and computational intelligence, rationality is categorized into three distinct perspectives:
1. **Substantive Rationality (Ends-Focused):** Evaluates whether the choices made actually achieve desirable real-world outcomes.
2. **Procedural Rationality (Means-Focused):** Evaluates whether the internal reasoning process follows a logically coherent, mathematically sound, and justifiable method (even if an unlucky stochastic outcome occurs).
3. **Meta-Level Rationality (Bounded Rationality):** Governs *how to decide how to decide*—optimizing the trade-off between the computational cost of deliberation and the expected value of improved decision quality (*Herbert Simon; Stuart Russell*).

### 1.3 The BDI (Belief-Desire-Intention) Model in Modern Agentic AI

Originating in philosophical logic (*Michael Bratman, 1987*) and multi-agent systems, the **BDI Architecture** forms the structural design pattern for modern LLM-driven autonomous agents:
- **Beliefs:** The agent's knowledge and probabilistic model of the current environment (informed by perception, context retrieval, and vector memory). Beliefs directly inform decision-making.
- **Desires:** The set of desirable objectives, goals, and preference functions. Desires guide prioritization among competing alternatives.
- **Intentions:** The committed action plans currently chosen for execution. Intentions anchor planning and multi-step execution.

In modern agentic AI systems (e.g., agents combining reasoning, planning, and tool use), BDI provides the natural cognitive scaffolding: *Beliefs* inform prompting and tool perception; *Desires* constrain reward and evaluation metrics; *Intentions* anchor multi-step tool calls and execution monitoring.

### 1.4 Formal Mathematical Decision Model

A formal single-stage decision problem under uncertainty is defined by the tuple:

$$\mathcal{D} = \langle \mathcal{A}, \mathcal{S}, P(s), \mathcal{T}, U \rangle$$

Where:
- $\mathcal{A}$ is the set of available actions $a \in \mathcal{A}$.
- $\mathcal{S}$ is the set of possible environmental states $s \in \mathcal{S}$.
- $P(s)$ is the prior probability distribution (belief) over the true state of the environment. In a fully observable environment, $P(s) = 1$ for the true state and $0$ elsewhere.
- $\mathcal{T} = P(s' \mid s, a)$ is the stochastic transition model specifying the probability that executing action $a$ in state $s$ results in state $s'$.
- $\text{Result}(a)$ is a random variable over outcome states $s'$ when action $a$ is taken:

$$P(\text{Result}(a) = s') = \sum_{s \in \mathcal{S}} P(s) P(s' \mid s, a)$$

- $U(s): \mathcal{S} \to \mathbb{R}$ is the **Utility Function**, assigning a single real number expressing the subjective desirability of state $s$.

### 1.5 From Logical Planning to Decision Modeling

A crucial insight connects classical planning to decision theory:
- **Classical Logical Planning:** States are boolean propositions, actions are deterministic rewrite rules, and goals are rigid logical formulas.
- **Decision-Theoretic Modeling:** Augments logical models with **probability** (to handle uncertain states and stochastic action effects) and **utility** (to handle graded preferences, costs, and risk attitudes).
- **Theorem:** *Classical planning is a degenerate special case of decision-theoretic planning where transitions are strictly deterministic ($P(s' \mid s, a) \in \{0, 1\}$) and utilities are binary ($U(s) = 1$ if $s \models g$, else $0$).*

### 1.6 Three Paradigms of Decision Theory

Decision theory operates across three foundational paradigms:
1. **Normative Decision Theory:** Defines how *ideal, perfectly rational agents should decide* based on mathematical consistency axioms.
2. **Descriptive Decision Theory:** Describes how *real biological agents (humans) actually decide*, uncovering cognitive heuristics, biases, and framing effects (*Kahneman & Tversky*).
3. **Prescriptive Decision Theory:** Engineering-focused frameworks that *guide real-world decision-makers* to make better, more rational choices in complex, messy environments (*Ronald A. Howard*).

### 1.7 Historical Beginnings: Bernoulli vs. Von Neumann & Morgenstern

- **Utility Theory (Daniel Bernoulli, 1738):** Originated in the analysis of the *St. Petersburg Paradox*, where Bernoulli introduced the concept of measuring risk with subjective value (utility) rather than raw expected wealth, establishing single-agent decision making under risk.
- **Game Theory (John von Neumann & Oskar Morgenstern, 1944):** Published in *Theory of Games and Economic Behavior*, extending decision making to multi-agent settings where outcomes depend interactively on the simultaneous choices of all agents.

---

## 2. The Maximum Expected Utility (MEU) Principle

### 2.1 The Fundamental MEU Principle

The universal normative prescription for rational agency is the **Maximum Expected Utility (MEU) Principle**:

> **The MEU Principle:**
> A rational agent must choose an action $a^*$ that maximizes expected utility:
>
> $$a^* = \arg\max_{a \in \mathcal{A}} \mathbb{E}[U(a)]$$

Where the expected utility of an action is the average utility of its possible outcome states, weighted by their probabilities:

$$\mathbb{E}[U(a)] = \sum_{s' \in \mathcal{S}} P(\text{Result}(a) = s') U(s')$$

Incorporating explicit uncertainty over the current state $s$:

$$\mathbb{E}[U(a)] = \sum_{s' \in \mathcal{S}} \sum_{s \in \mathcal{S}} P(s) P(s' \mid s, a) U(s')$$

In a fully observable environment, $P(s) = 1$ for the known current state, simplifying the inner summation.

```
+-------------------+      +-------------------------+      +-------------------+
| Known Preferences | ---> | Compute Expected Utility| ---> | Rational Decision |
|  (Utility U(s))   |      |        (MEU)            |      |     Action a*     |
+-------------------+      +-------------------------+      +-------------------+
```
*A prescription for intelligent behavior: "Do the right thing" — a mathematical basis for AI.*

### 2.2 Internalized Utility vs. External Performance Measure

A vital distinction emphasized by Russell and Norvig exists between an external performance measure and an internal utility function:
- **Performance Measure (External View):** An objective criterion designed by the system architect to evaluate the agent's complete behavioral history over its entire lifespan.
- **Utility Function (Internal View):** An internalized mapping maintained by the agent to evaluate local states and guide step-by-step sequential decisions in real time.

### 2.3 Computational Challenges in Computing MEU

While conceptually elegant, computing MEU directly in real-world AI poses major challenges:
1. **Large Action Spaces:** Evaluating expected utility requires searching through enormous sets of discrete or continuous actions.
2. **Probability Estimation:** Computing $P(s)$ and $P(s' \mid s, a)$ requires complex perceptual pipelines, Bayesian inference, causal modeling, and statistical learning.
3. **Utility Estimation:** Estimating $U(s')$ often requires multi-step lookahead, heuristic search, or solving nested planning problems.
4. **Epistemic Uncertainty:** The agent's utility estimates themselves may be noisy or uncertain.

### 2.4 The Rational Decision-Theoretic Agent

The formal decision-theoretic agent is an idealization:
- Assumes an ideal, hypothetical, and fully rational agent.
- Agent preferences strictly satisfy the axioms of rational choice.
- Rationality entails choosing the option that maximizes expected utility.
- MEU acts as the algorithmic engine guiding decision making and autonomous problem solving.

---

## 3. Case Studies: Panda's Lunch Choice

To demonstrate utility-theoretic decision making under both full and partial observability, we examine the classical **Panda's Lunch Choice** problem.

### 3.1 Scenario 1: Simple Lunch Choice (Full Observability)

Panda bear *Lulu* must decide where to forage for lunch today:
- **Actions:** Visit the **Bamboo Grove** ($a_{\text{grove}}$) or visit the **Berry Bush** ($a_{\text{berry}}$).
- **Beliefs:**
  - Bamboo Grove: $50\%$ chance of finding $10$ fresh bamboo shoots, $50\%$ chance of finding none ($0$).
  - Berry Bush: $100\%$ guaranteed chance of finding $4$ sweet berries.
- **Preferences:**
  - Assume equal preference for bamboo shoots and berries.
  - More food yields higher utility: utility equals the total number of food items consumed ($U(n) = n$).

#### Expected Utility Calculation:

$$\mathbb{E}[U(a_{\text{grove}})] = 0.50 \times 10 + 0.50 \times 0 = \mathbf{5.0}$$

$$\mathbb{E}[U(a_{\text{berry}})] = 1.00 \times 4 = \mathbf{4.0}$$

$$\text{Decision:} \quad \mathbb{E}[U(a_{\text{grove}})] = 5.0 > \mathbb{E}[U(a_{\text{berry}})] = 4.0 \implies \mathbf{Choose\ Bamboo\ Grove!}$$

---

### 3.2 Scenario 2: Partially Observable Environment & Bayesian Updating

Now suppose Lulu cannot see the Bamboo Grove from her current resting spot.

#### 1. Formal Problem Setup:
- **Hidden State Space:** $\mathcal{S} = \{B, \neg B\}$, where $B$ denotes that fresh bamboo is present, and $\neg B$ denotes that the grove is empty.
- **Prior Beliefs:** $P(B) = 0.50$, $P(\neg B) = 0.50$.
- **Payoff Utilities:**
  - If Lulu visits the grove and bamboo is present: $U(B) = 10$.
  - If Lulu visits the grove and it is empty: $U(\neg B) = 0$.
  - If Lulu visits the berry bush: guaranteed sure payoff of $U(\text{Berry}) = 4$.
- **Sensory Observation:** Before making her final choice, Lulu listens for sounds near the grove, receiving observation $O \in \{\text{rustling}, \text{no rustling}\}$.
- **Sensor Noise Model (Likelihoods):**
  - **Wind in leaves:** If bamboo is present ($B$), wind causes leaf rustling $20\%$ of the time:
    $$P(\text{rustling} \mid B) = 0.20 \implies P(\text{no rustling} \mid B) = 0.80$$
  - **Monkeys eating bamboo:** If bamboo is absent ($\neg B$), mischievous monkeys forage in the empty grove, rustling leaves $60\%$ of the time:
    $$P(\text{rustling} \mid \neg B) = 0.60 \implies P(\text{no rustling} \mid \neg B) = 0.40$$

*Notice that rustling is three times more likely when the grove is empty than when bamboo is present ($0.60$ vs. $0.20$).*

---

#### 2. Case 1: Lulu Hears Rustling ($O = \text{rustling}$)

Applying **Bayes' Rule** to compute the posterior probability that bamboo is present:

$$P(B \mid \text{rustling}) = \frac{P(\text{rustling} \mid B) P(B)}{P(\text{rustling} \mid B) P(B) + P(\text{rustling} \mid \neg B) P(\neg B)}$$

$$P(B \mid \text{rustling}) = \frac{0.20 \times 0.50}{0.20 \times 0.50 + 0.60 \times 0.50} = \frac{0.10}{0.10 + 0.30} = \frac{0.10}{0.40} = \mathbf{0.25}$$

$$P(\neg B \mid \text{rustling}) = 1 - 0.25 = \mathbf{0.75}$$

#### Evaluating Expected Utilities:
- **Bamboo Grove:**
  $$\mathbb{E}[U(a_{\text{grove}} \mid \text{rustling})] = 0.25 \times 10 + 0.75 \times 0 = \mathbf{2.5}$$
- **Berry Bush:**
  $$\mathbb{E}[U(a_{\text{berry}})] = \mathbf{4.0}$$

$$\mathbf{Decision:} \quad \mathbb{E}[U(a_{\text{berry}})] = 4.0 > \mathbb{E}[U(a_{\text{grove}} \mid \text{rustling})] = 2.5 \implies \mathbf{Choose\ Berry\ Bush!}$$

---

#### 3. Case 2: Lulu Hears No Rustling ($O = \text{no rustling}$)

Applying **Bayes' Rule** with complementary likelihoods:

$$P(B \mid \text{no rustling}) = \frac{P(\text{no rustling} \mid B) P(B)}{P(\text{no rustling} \mid B) P(B) + P(\text{no rustling} \mid \neg B) P(\neg B)}$$

$$P(B \mid \text{no rustling}) = \frac{0.80 \times 0.50}{0.80 \times 0.50 + 0.40 \times 0.50} = \frac{0.40}{0.40 + 0.20} = \frac{0.40}{0.60} = \frac{2}{3} \approx \mathbf{0.667}$$

$$P(\neg B \mid \text{no rustling}) = 1 - \frac{2}{3} = \frac{1}{3} \approx \mathbf{0.333}$$

#### Evaluating Expected Utilities:
- **Bamboo Grove:**
  $$\mathbb{E}[U(a_{\text{grove}} \mid \text{no rustling})] = \left(\frac{2}{3}\right)(10) + \left(\frac{1}{3}\right)(0) = \frac{20}{3} \approx \mathbf{6.67}$$
- **Berry Bush:**
  $$\mathbb{E}[U(a_{\text{berry}})] = \mathbf{4.0}$$

$$\mathbf{Decision:} \quad \mathbb{E}[U(a_{\text{grove}} \mid \text{no rustling})] \approx 6.67 > \mathbb{E}[U(a_{\text{berry}})] = 4.0 \implies \mathbf{Choose\ Bamboo\ Grove!}$$

---

#### 4. Critical Analytical Takeaways:
1. **Belief Updating Alters Optimal Actions:**
   $$\text{Prior Beliefs} + \text{Sensory Observation} \xrightarrow{\text{Bayes}} \text{Posterior Beliefs} \xrightarrow{\text{MEU}} \text{New Action}$$
2. **Observation Flips Behavior:** With identical priors ($P(B)=0.5$) and identical physical utilities ($10, 0, 4$), the agent's rational choice reverses entirely based on whether a sensory signal was detected.

---

### 3.4 Worked Bridge: Expected Value of Perfect Information

Bayesian updating changes our belief; information has decision value only if it improves the action we choose. Consider two actions: Safe always yields utility $4$; Risky yields $10$ in a good state and $-2$ in a bad state. Each state initially has probability $1/2$.

Without information, $EU(Safe)=4$ and $EU(Risky)=4$. With perfect information, choose Risky in the good state and Safe in the bad state:
$$EU_{\text{perfect info}}=\tfrac12(10)+\tfrac12(4)=7,\qquad EVPI=7-4=3.$$

一般形式為：
$$EVPI=\mathbb E_s[\max_a U(a,s)]-\max_a\mathbb E_s[U(a,s)]\ge0.$$

關鍵是 $\max$ 與 expectation 的順序：先看資訊再選 action，至少能模仿原本不看資訊的選擇。若資訊有成本，必須用相同 utility 尺度比較；money 的 utility 非線性時，utility 差 $3$ 不能直接解讀為願付 $3$ 元。Week 4 將一次性的「觀測後決策」延伸成每一步都影響未來的 decision process。

## 4. The Axioms of Rational Preferences

### 4.1 Preference Notations & Lotteries

To derive utility mathematically, we begin with an agent's preferences over states and uncertain gambles:
- $A \succ B$: The agent strictly prefers outcome $A$ over outcome $B$.
- $A \sim B$: The agent is indifferent between outcome $A$ and outcome $B$.
- $A \succsim B$: The agent weakly prefers $A$ over $B$ ($A$ is at least as good as $B$).

An action with uncertain outcomes is formalized as a **Lottery** $L$:

$$L = [p_1, S_1; p_2, S_2; \dots; p_n, S_n], \quad \sum_{i=1}^n p_i = 1$$

Where each outcome $S_i$ is a possible physical state (or a nested lottery) occurring with probability $p_i$.

```
         p1 ---------> S1
       /
      /  p2 ---------> S2
  (L) - - - - - - - -> ...
      \
       \ pn ---------> Sn
```

### 4.2 The Six VNM Axioms of Rationality

Von Neumann and Morgenstern (1944) proved that if an agent's preferences satisfy six intuitive consistency conditions, the agent is mathematically guaranteed to possess a utility function whose expectation governs rational behavior:

| Axiom | Mathematical Formulation | Semantic Intuition & Panda Story |
| :--- | :--- | :--- |
| **A1. Orderability (Completeness)** | $\forall A, B: (A \succ B) \lor (B \succ A) \lor (A \sim B)$ | The agent can always compare any two options; it never freezes in indecision. Lulu can always state whether she prefers bamboo, berries, or is indifferent (e.g., $A = 5$ shoots vs. $B = 1$ bowl of berries). |
| **A2. Transitivity** | $(A \succ B) \land (B \succ C) \implies (A \succ C)$ | Preferences must be mutually consistent. If Lulu prefers bamboo over berries, and berries over honey, she must prefer bamboo over honey. *(Violating transitivity makes an agent an exploitable "money pump").* |
| **A3. Continuity** | $A \succ B \succ C \implies \exists p \in [0, 1]: [p, A; 1-p, C] \sim B$ | An intermediate sure outcome $B$ can always be equated to some gamble between the best outcome $A$ and worst outcome $C$. Lulu equates 5 sure bamboo shoots to a gamble between 10 shoots (60%) and 1 shoot (40%). |
| **A4. Substitutability (Independence)** | $A \sim B \implies [p, A; 1-p, C] \sim [p, B; 1-p, C]$<br>*(or $A \succ B \implies [p, A; 1-p, C] \succ [p, B; 1-p, C]$)* | Swapping indifferent prizes within any lottery preserves indifference. If Lulu values bamboo and berries equally, swapping them inside any gamble leaves the lottery equally attractive. |
| **A5. Monotonicity** | $A \succ B \implies (p > q \iff [p, A; 1-p, B] \succ [q, A; 1-q, B])$ | Between two lotteries offering identical prizes, the agent strictly prefers the one offering a higher probability of the superior prize (e.g., 80% bamboo / 20% berries $\succ$ 60% bamboo / 40% berries). |
| **A6. Decomposability** | $[p, A; 1-p, [q, B; 1-q, C]] \sim [p, A; (1-p)q, B; (1-p)(1-q), C]$ | Multi-stage compound lotteries reduce to simple lotteries by multiplying probabilities. Lulu cares only about the final net chances of food (e.g., 60% bamboo, 40% $\to$ [70% berries, 30% honey] is equivalent to 60% bamboo, 28% berries, 12% honey). |

### 4.3 Social Choice Theory: The Pizza Party Example

While individual rational preferences are transitive, collective group preferences frequently violate transitivity. Consider three colleagues deciding what food to order for a party:
- **Alice's Preference:** $\text{Pasta} \succ \text{Pizza} \succ \text{Salad}$
- **Bob's Preference:** $\text{Salad} \succ \text{Pasta} \succ \text{Pizza}$
- **Charlie's Preference:** $\text{Pizza} \succ \text{Pasta} \succ \text{Salad}$

#### What is the Group's Preference?
- **Pasta vs. Pizza:** Alice prefers Pasta; Bob prefers Pasta; Charlie prefers Pizza $\implies \mathbf{\text{Pasta} \succ \text{Pizza}}$ (2 votes to 1).
- **Pasta vs. Salad:** Alice prefers Pasta; Charlie prefers Pasta; Bob prefers Salad $\implies \mathbf{\text{Pasta} \succ \text{Salad}}$ (2 votes to 1).
- **Pizza vs. Salad:** Alice prefers Pizza; Charlie prefers Pizza; Bob prefers Salad $\implies \mathbf{\text{Pizza} \succ \text{Salad}}$ (2 votes to 1).

Here, Pasta defeats both Pizza and Salad. However, consider if Charlie's preference is instead $\text{Pizza} \succ \text{Salad} \succ \text{Pasta}$ (the classical **Condorcet Paradox**):
1. **Pasta vs. Pizza:** Alice and Bob vote for Pasta $\implies \text{Pasta} \succ \text{Pizza}$.
2. **Pizza vs. Salad:** Alice and Charlie vote for Pizza $\implies \text{Pizza} \succ \text{Salad}$.
3. **Salad vs. Pasta:** Bob and Charlie vote for Salad $\implies \text{Salad} \succ \text{Pasta}$!

The group preference becomes an intransitive cycle: $\text{Pasta} \succ \text{Pizza} \succ \text{Salad} \succ \text{Pasta}$!

**Theoretical Lesson:**
- Group preference is **UNSURE!** Compromise and other considerations are needed.
- Group preference may be non-transitive even when every individual member has perfectly transitive preferences.
- Studied extensively in **Social Choice Theory** (*Arrow's Impossibility Theorem, 1951*).

---

## 5. The Expected Utility Theorem & Formal Mathematical Proof

### 5.1 Theorem Formulation

> **Von Neumann-Morgenstern Expected Utility Theorem (1944):**
> If an agent's preference relation $\succsim$ satisfies Axioms A1–A6, then there exists a real-valued utility function $U: \mathcal{S} \to \mathbb{R}$ such that:
>
> 1. **Order Preservation:**
>    $$U(A) > U(B) \iff A \succ B$$
>    $$U(A) = U(B) \iff A \sim B$$
>
> 2. **Linearity Over Lotteries (Expected Utility Property):**
>    $$U([p_1, S_1; \dots; p_n, S_n]) = \sum_{i=1}^n p_i U(S_i)$$

### 5.2 Formal Proof of the Expected Utility Theorem

*(Based on Jonathan Levin, Stanford University Economics 202 Lecture Notes, 2006)*

#### Step 1: Forward Direction (Expected Utility Implies Axioms)
We first show that if preferences admit an expected utility representation $U$, they necessarily satisfy Continuity and Substitutability:
- **Continuity:** If $A \succ B \succ C$, then $U(A) > U(B) > U(C)$. Define:
  $$p = \frac{U(B) - U(C)}{U(A) - U(C)}$$
  Then $p \in (0, 1)$ and:
  $$p U(A) + (1-p) U(C) = \frac{U(B) - U(C)}{U(A) - U(C)} U(A) + \frac{U(A) - U(B)}{U(A) - U(C)} U(C) = U(B)$$
  Which proves that $[p, A; 1-p, C] \sim B$.
- **Substitutability:** If $A \sim B$, then $U(A) = U(B)$. Hence for any outcome $C$ and probability $p$:
  $$p U(A) + (1-p) U(C) = p U(B) + (1-p) U(C) \implies [p, A; 1-p, C] \sim [p, B; 1-p, C]$$

---

#### Step 2: Reverse Direction (Construction of Utility Function)
Now assume preferences satisfy Orderability, Transitivity, Continuity, and Substitutability. We construct an expected utility function $U$.
Let $L_\top$ and $L_\bot$ represent the most and least preferred lotteries in the domain. Assume $L_\top \succ L_\bot$ (the result is trivial if $L_\top \sim L_\bot$).
Arbitrarily normalize scale endpoints:

$$U(L_\bot) = 0, \quad U(L_\top) = 1$$

---

#### Step 3: Proving Monotonicity
We show that if $1 > p > q > 0$, then:

$$L_\top \succ [p, L_\top; 1-p, L_\bot] \succ [q, L_\top; 1-q, L_\bot] \succ L_\bot$$

1. **First Inequality:** Write $L_\top = [p, L_\top; 1-p, L_\top]$. Since $L_\top \succ L_\bot$, Substitutability guarantees:
   $$[p, L_\top; 1-p, L_\top] \succ [p, L_\top; 1-p, L_\bot]$$
2. **Second Inequality:** Express the two lotteries with decomposed weights:
   $$\text{LHS} = [(p - q), L_\top; q, L_\top; 1 - p, L_\bot]$$
   $$\text{RHS} = [(p - q), L_\bot; q, L_\top; 1 - p, L_\bot]$$
   Since $L_\top \succ L_\bot$, applying Substitutability to the $(p - q)$ probability weight immediately proves $\text{LHS} \succ \text{RHS}$.
3. **Third Inequality:** Write $L_\bot = [q, L_\bot; 1-q, L_\bot]$. Substitutability ensures:
   $$[q, L_\top; 1-q, L_\bot] \succ [q, L_\bot; 1-q, L_\bot]$$

---

#### Step 4: Proving Existence and Ordering Preservation
For any arbitrary lottery $L$:
- By the **Continuity Axiom**, there exists a probability $p_L \in [0, 1]$ such that:
  $$L \sim [p_L, L_\top; 1 - p_L, L_\bot]$$
- By **Monotonicity**, this probability $p_L$ is **unique**.
- We define the utility representation as this unique probability:
  $$U(L) \equiv p_L$$

This representation strictly preserves preference ordering:

$$L_1 \succsim L_2 \iff [p_{L_1}, L_\top; 1 - p_{L_1}, L_\bot] \succsim [p_{L_2}, L_\top; 1 - p_{L_2}, L_\bot] \iff p_{L_1} \ge p_{L_2} \iff U(L_1) \ge U(L_2)$$

---

#### Step 5: Proving Linearity Over Lotteries
We show that for any two lotteries $L_1, L_2$ and any mixing probability $\alpha \in [0, 1]$:

$$U([\alpha, L_1; 1 - \alpha, L_2]) = \alpha U(L_1) + (1 - \alpha) U(L_2)$$

We represent $L_1$ and $L_2$ by their equivalent lotteries:
$$L_1 \sim [U(L_1), L_\top; 1 - U(L_1), L_\bot]$$
$$L_2 \sim [U(L_2), L_\top; 1 - U(L_2), L_\bot]$$

By Substitutability, substitute these equivalents into the compound lottery:
$$[\alpha, L_1; 1 - \alpha, L_2] \sim [\alpha, [U(L_1), L_\top; 1 - U(L_1), L_\bot]; 1 - \alpha, [U(L_2), L_\top; 1 - U(L_2), L_\bot]]$$

By Decomposability, simplify the compound probabilities:
$$\sim [\alpha U(L_1) + (1 - \alpha) U(L_2), L_\top; 1 - (\alpha U(L_1) + (1 - \alpha) U(L_2)), L_\bot]$$

Applying our definition of utility:

$$U([\alpha, L_1; 1 - \alpha, L_2]) = \alpha U(L_1) + (1 - \alpha) U(L_2) \quad \blacksquare$$

---

### 5.3 Positive Affine Invariance

A fundamental property of VNM utility functions is that they are **unique up to a positive affine transformation**:

$$U'(s) = a U(s) + b, \quad \text{where } a > 0$$

- **Proof of Scale Invariance:**
  $$\mathbb{E}[U'(a)] = \sum_{s'} P(s') [a U(s') + b] = a \sum_{s'} P(s') U(s') + b \sum_{s'} P(s') = a \mathbb{E}[U(a)] + b$$
  Since $a > 0$, maximizing $\mathbb{E}[U'(a)]$ yields the exact same optimal action $a^*$ as maximizing $\mathbb{E}[U(a)]$.
- **Crucial Practical Implication:**
  Stretch or shift the scale of utility, and the agent's decisions stay the same. However, **raw utility numbers cannot be compared across different agents** (interpersonal utility comparisons are mathematically invalid).

---

## 6. Constructing Utility Functions & Preference Elicitation Methods

### 6.1 Method 1: Probability Equivalents (Standard Gamble Method)

The **Probability Equivalent (PE)** method constructs utility values by finding the probability $p$ that makes an agent indifferent between a guaranteed prize and a standard reference gamble:
1. Fix scale endpoints: Worst outcome $u_\bot = 0$, Best outcome $u_\top = 1$.
2. To assess utility for an intermediate prize $S$, present the agent with a choice between:
   - Guaranteed prize $S$ (sure option).
   - Standard reference lottery $[p, u_\top; 1 - p, u_\bot]$.
3. Adjust $p$ until the agent is indifferent:
   $$U(S) = p \cdot U(u_\top) + (1 - p) \cdot U(u_\bot) = p(1) + (1 - p)(0) = \mathbf{p}$$

#### Demonstration: Academic Grades in CS4246/CS5446
- $u_\bot = \text{Grade F} \implies U(F) = 0$
- $u_\top = \text{Grade A} \implies U(A) = 1$
- Intermediate sure grades: $B, C, D$.

```
               Lottery: [p, A; 1-p, F]
              /  p ----------> Grade A (U = 1)
             /
Good Grade? - - - - - - - - - 
 (Choice)    \
              \  1-p --------> Grade F (U = 0)
               \
                Sure Grade: B (U = p)
```
- What value of $p$ would you trade the lottery for a sure grade of $B$?
- If a student is indifferent between a sure $B$ and a lottery with $p=0.80$ chance of $A$ and $20\%$ chance of $F$, then $U(B) = 0.80$. What about $C$ and $D$?

---

### 6.2 Method 2: Certainty Equivalents (CE Method)

The **Certainty Equivalent (CE)** method constructs an empirical utility curve by finding the cash value $CE$ that an agent accepts in lieu of a $50/50$ reference lottery:

#### The 6-Step CE Protocol:
1. Determine two initial boundary points on the curve (e.g., minimum and maximum wealth).
2. Arbitrarily assign utility values to the endpoints ($U(x_{\min}) = 0$, $U(x_{\max}) = 1$).
3. Create a reference lottery: $[0.5, x_{\max}; 0.5, x_{\min}]$.
4. Find the third point on the curve by formula:
   $$U(CE_1) = \mathbb{E}[U(\text{Lottery})] = 0.5 U(x_{\max}) + 0.5 U(x_{\min})$$
5. Create additional reference lotteries by pairing $CE_1$ with the endpoints.
6. Proceed iteratively until enough points are available to plot a smooth curve.

#### Numerical Demonstration:
- Assume worst wealth: $\$10$, best wealth: $\$100$.
- Set $U(10) = 0$, $U(100) = 1$.

```
Reference Lottery 1: [0.5, $100; 0.5, $10]
Assume Agent CE_1 = $30
==> U(CE_1) = U(30) = 0.5 U(100) + 0.5 U(10) = 0.5(1.0) + 0.5(0.0) = 0.50

Reference Lottery 2: [0.5, $100; 0.5, $30]
Assume Agent CE_2 = $50
==> U(CE_2) = U(50) = 0.5 U(100) + 0.5 U(30) = 0.5(1.0) + 0.5(0.5) = 0.75

Reference Lottery 3: [0.5, $30; 0.5, $10]
Assume Agent CE_3 = $18
==> U(CE_3) = U(18) = 0.5 U(30) + 0.5 U(10) = 0.5(0.5) + 0.5(0.0) = 0.25
```

#### Plotting the Utility Function:
Plotting the elicited coordinates $(10, 0)$, $(18, 0.25)$, $(30, 0.50)$, $(50, 0.75)$, $(100, 1.00)$ produces a smooth, concave utility curve:

```
Utility U(x) ^
       1.00 -|                                          * ($100, 1.00)
             |                                    . '
       0.75 -|                             * ($50, 0.75)
             |                       . '
       0.50 -|                * ($30, 0.50)
             |           . '
       0.25 -|    * ($18, 0.25)
             |  /
       0.00 -*-------------------------------------------------->
           $10       $30       $50                 $100    Wealth ($)
```

---

### 6.3 Empirical Wealth Data Table & Functional Forms

In empirical decision analysis, elicited preferences across monetary wealth are mapped to quantitative tables and parametric curves:

| Wealth ($x$) | Empirical Utility Value $U(x)$ |
| :--- | :--- |
| **$\$2500$** | $1.50$ |
| **$\$1500$** | $1.24$ |
| **$\$1000$** | $0.93$ |
| **$\$600$**  | $0.65$ |
| **$\$400$**  | $0.47$ |
| **$\$0$**    | $0.15$ |

#### Standard Parametric Utility Functions:
- **Logarithmic Utility:** $U(x) = \log(x)$ (reflects diminishing marginal utility of wealth).
- **Exponential Utility:** $U(x) = 1 - e^{-x/R}$ (captures constant risk tolerance $R$).
- **Power Utility:** $U(x) = x^{0.5}$ (square-root utility modeling risk aversion).

---

## 7. Utility of Money, Risk Attitudes, and Risk Premium

### 7.1 Expected Monetary Value (EMV) vs. Expected Utility

The **Expected Monetary Value (EMV)** is the raw arithmetic average payoff:

$$\text{EMV} = \sum_{i=1}^n p_i x_i$$

A rational agent maximizes Expected Utility, **not Expected Monetary Value**.

#### Example: A Choice of Games
Consider two games:
- **Game 1:** Win $\$30$ with probability $0.5$, Lose $\$1$ with probability $0.5$.
  $$\text{EMV}(\text{Game 1}) = 0.5(\$30) + 0.5(-\$1) = \$15.00 - \$0.50 = \mathbf{\$14.50}$$
- **Game 2:** Win $\$2000$ with probability $0.5$, Lose $\$1900$ with probability $0.5$.
  $$\text{EMV}(\text{Game 2}) = 0.5(\$2000) + 0.5(-\$1900) = \$1000 - \$950 = \mathbf{\$50.00}$$

#### Analytical Questions:
1. **Which game would you play? Why?**
   - Game 2 offers more than triple the EMV ($\$50.00$ vs. $\$14.50$). However, almost all human decision-makers and risk-averse agents prefer Game 1.
   - **Reason:** Losing $\$1900$ causes severe financial distress or ruin (massive negative utility), whereas losing $\$1$ is negligible.
2. **What if you are to play a game 10 times?**
   - By playing 10 independent rounds, the **Law of Large Numbers** reduces the variance of the sample mean relative to the aggregate payout.
   - For Game 2, the expected aggregate profit becomes $10 \times \$50 = \mathbf{\$500}$ (versus $10 \times \$14.50 = \mathbf{\$145}$ for Game 1).
   - If the player has sufficient capital to survive temporary drawdowns, repeated play shifts rational preference toward the higher EMV option (Game 2).

---

### 7.2 The $1,000,000 Coin Flip Gamble

Suppose you have won $\$1,000,000$ so far. You are offered a coin flip:
- Heads: Lose all money (wealth becomes $\$0$).
- Tails: Gain $\$1,500,000$ (wealth becomes $\$2,500,000$).

$$\text{EMV}(\text{Accept}) = 0.5(\$0) + 0.5(\$2,500,000) = \mathbf{\$1,250,000} > \$1,000,000$$

Will you accept the gamble? Is accepting the best decision?
Let $S_n$ denote the state of having $\$n$ in wealth. Suppose current wealth is $\$k = \$1\text{M}$:
- $\mathbb{E}[U(\text{Accept})] = 0.5 U(S_k) + 0.5 U(S_{k+2.5\text{M}})$
- $U(\text{Decline}) = U(S_{k+1\text{M}})$

Using representative concave utilities (e.g., $U(S_k)=5, U(S_{k+2.5\text{M}})=9, U(S_{k+1\text{M}})=8$):

$$\mathbb{E}[U(\text{Accept})] = 0.5(5) + 0.5(9) = \mathbf{7.0}$$
$$U(\text{Decline}) = \mathbf{8.0}$$

$$\text{Decision:} \quad \mathbf{Decline\ is\ better\ (8.0 > 7.0)!}$$

*Because the utility of money is typically concave ($\sim \log(\text{wealth})$), the utility gain of winning $\$1.5\text{M}$ (+1 unit) is far outweighed by the utility catastrophe of losing $\$1\text{M}$ (-3 units).*

---

### 7.3 Certainty Equivalent and Risk Premium Analysis

The **Certainty Equivalent (CE)** of a lottery is the guaranteed outcome the agent considers equally desirable to the lottery:

$$\mathbb{E}[U(\text{Lottery})] = U(\text{Certainty Equivalent})$$

The **Risk Premium** is the value given up (or paid) to avoid risk:

$$\text{Risk Premium} = \text{Expected Value (EV)} - \text{Certainty Equivalent (CE)}$$

```
Utility U(x) ^
             |                                    . ' (Risky Outcome $3.5M)
        1.0 -|                              . '
             |                        . ' 
   EU ~0.625 - - - - - - - - - - - * . - - - - - [x EU aligned to EMV]
             |               . '   |         '
             |         * . '       |      '
             |     . ' (Sure $2M)  |   '
             | . ' (Risky $1M)     | '
        0.0 -+---------+-----------+----------------------------->
             0        CE          EMV                         Wealth ($)
                    $1.87M       $2.25M
                       |<--------->|
                       Risk Premium
                         ($0.38M)
```

#### Detailed Visual Components:
- **Orange Curve:** Concave logarithmic utility curve showing diminishing marginal returns.
- **Red Points:** Risky lottery outcomes ($\$1\text{M}$ and $\$3.5\text{M}$, each with $p=0.5$).
- **Green Point:** Sure outcome ($\$2\text{M}$).
- **Purple Markers:**
  - $\blacktriangledown$ **Expected Wealth (EMV = $\$2.25\text{M}$):** Arithmetic average of monetary outcomes ($0.5 \times 1 + 0.5 \times 3.5 = \$2.25\text{M}$) on the x-axis.
  - $\blacktriangleright$ **Expected Utility ($\approx 0.625$):** Arithmetic average of the utilities of the outcomes on the y-axis.
  - $\times$ **EU of Lottery:** Expected utility aligned to EMV for visualization.
- **Orange $\times$:** **Certainty Equivalent ($CE \approx \$1.87\text{M}$):** Monetary amount on the curve where $U(CE) = \mathbb{E}[U(\text{Lottery})]$.
- **Black Arrow:** **Risk Premium ($\approx \$0.38\text{M}$):** Gap between expected wealth and CE ($\$2.25\text{M} - \$1.87\text{M} = \$0.38\text{M}$) — the cash an agent willingly forfeits to avoid risk.

---

### 7.4 Three Risk Attitudes

| Risk Attitude | Condition | Utility Curve Geometry | Behavioral Definition |
| :--- | :--- | :--- | :--- |
| **Risk-Averse** | $CE < EV \iff \text{Risk Premium} > 0$ | Strictly Concave ($U''(x) < 0$) | Prefers a sure but lower payoff over a fair gamble. Buys insurance. |
| **Risk-Neutral** | $CE = EV \iff \text{Risk Premium} = 0$ | Linear ($U''(x) = 0$) | Completely indifferent between gamble and EV; maximizes raw EMV. |
| **Risk-Seeking** | $CE > EV \iff \text{Risk Premium} < 0$ | Strictly Convex ($U''(x) > 0$) | Willing to pay for risky gain; plays lotteries with negative expectation. |

```
Utility ^          / Risk-Seeking (Convex)
        |         /
        |        /   / Risk-Neutral (Linear)
        |       /   /
        |      /   /   . - - ' Risk-Averse (Concave)
        |     /   / . '
        |    /  . '
        |   / '
        +------------------------------> Wealth ($)
```

---

### 7.5 The 4-Step Recipe for Calculating Risk Premium

1. **Compute Expected Utility ($EU$):** Calculate the expected utility of the lottery: $\mathbb{E}[U(L)] = \sum_i p_i U(x_i)$.
2. **Find Certainty Equivalent ($CE$):** Invert the utility function to find the sure wealth value whose utility equals $EU$: $CE = U^{-1}(\mathbb{E}[U(L)])$.
3. **Compute Expected Value ($EV$ / $EMV$):** Calculate the raw expected monetary value: $\text{EMV} = \sum_i p_i x_i$.
4. **Calculate Risk Premium:** $\text{Risk Premium} = \text{EMV} - \text{CE}$.

#### Exercise: Paying to Avoid Risk
- **Lottery:** Win $\$2000$ ($p=0.5$), Lose $\$20$ ($p=0.5$).
- **EMV Calculation:** $\text{EMV} = 0.5(\$2000) + 0.5(-\$20) = \$1000 - \$10 = \mathbf{\$990}$.
- **Subjective Assessment:** Suppose the agent's subjective perceived value is $CE = \mathbf{\$300}$.
- **Risk Premium:** $\text{Risk Premium} = \$990 - \$300 = \mathbf{\$690}$.
- **Interpretation:** Trading the lottery for $\$300$ means the agent is willing to sacrifice $\$690$ in expected value purely to avoid risk.

---

### 7.6 Summary & Caveats

- **Preference & Utility:** Preferences ($A \succ B, A \sim B$) are subjective and personal; raw numbers cannot be compared across individuals.
- **MEU Principle:** Rational choice equals picking the action with Maximum Expected Utility. $EU$ lives on the internal utility scale; $CE$ lives on the real-world scale.
- **Key Caveats:**
  - Utility is **non-linear** and **not additive**: $U(a + b) \neq U(a) + U(b)$.
  - Utilities must always be assessed at **outcome endpoints**.
  - Multi-attribute outcomes require advanced utility models.

---

## 8. Real-World Domain Utility Metrics

In public policy, medical triage, and engineering, utility functions translate multi-criteria trade-offs into quantitative decision models:

| Domain | Formal Metric | Mathematical Definition & Operational Role |
| :--- | :--- | :--- |
| **Healthcare** | **QALY** (*Quality-Adjusted Life Year*) | $U = \text{Years} \times \text{Quality Score } (0 \text{ to } 1)$. E.g., 10 years at $0.6$ health quality $= 6.0$ QALYs. Used in clinical treatment choice and cost-effectiveness analysis. |
| **Healthcare** | **DALY** (*Disability-Adjusted Life Year*) | $U = \text{Years Lost to Disability or Death}$. Lower DALY indicates superior outcome. |
| **Safety Engineering** | **Micromort** | $U = -\text{Risk in 1M chance of death}$. $1\text{ micromort} = 10^{-6}$ probability of death. Used to quantify risk in surgery and extreme sports. |
| **Public Policy** | **VSL** (*Value of Statistical Life*) | $U = -\text{Monetary Cost per Statistical Life Saved}$. Used by government agencies (US EPA, FDA, DOT, HHS) to determine cost-benefit ratios of safety regulations. In 2025: **USA $\approx \text{USD } \$14\text{M}$**, **Australia $\approx \text{AUD } \$5.9\text{M}$** *(Sources: US HHS, Australian Office of Impact Analysis, 2024)*. |
| **Transportation** | **VHT** (*Value of Hour Traveled*) | $U = -\text{Time Cost} \times \text{Value per Hour}$ (typically $\$20/\text{hr}$ for commuters). Used in transit infrastructure planning. |
| **Finance** | **Exponential Utility** | $U(x) = 1 - e^{-rx}$ with risk aversion parameter $r > 0$. Captures constant absolute risk aversion (CARA). |
| **Economics** | **Log Utility** | $U(x) = \log(x)$. Reflects diminishing marginal utility of income. |
| **Energy & Environment** | **Carbon Cost Utility** | $U = -\text{Tons of }\text{CO}_2 \times \text{Price per Ton}$ (e.g., $\$50/\text{ton}$). Used in carbon pricing and offset decisions. |

---

## 9. The Decision Analysis Process & The Martian Adventures Case Study

### 9.1 The Prescriptive Framework (Ronald A. Howard, 1988)

Developed by Ronald A. Howard at Stanford University, **Decision Analysis** provides a prescriptive engineering framework for real-world decision making:

```
[ Problem Formulation ]
Identify Contexts  --->  Understand Objectives  --->  Identify Alternatives
                                  |
                                  v
[ Problem Modelling ]
Model Structure    --->  Model Uncertainties   --->  Model Preferences
                                  |
                                  v
[ Choose Alternative (Model Solution via Decision Trees / Backward Induction) ]
                                  |
                                  v
[ Sensitivity Analyses ] <====================================================+
Is further analysis needed?                                                   |
           |                                                                  | Yes (Iterate)
           +--- No ---> [ Implement Chosen Alternative ]                      |
           +------------------------------------------------------------------+
```

### 9.2 Decision Basis Formulation

According to Howard (1988), the foundation of decision analysis is the **Decision Basis**, composed of three pillars:

```
                          +-------------------+
                          |      PROBLEM      |
                          +-------------------+
                                    |
                                    v Synthesis / Elicitation
                      +---------------------------+
                      |       DECISION BASIS      |
                      |                           |
                      |  1. CHOICE                |
                      |     - Alternatives        |
                      |                           |
                      |  2. INFORMATION           |
                      |     - Models              |
                      |     - Probabilities       |
                      |                           |
                      |  3. PREFERENCES           |
                      |     - Value               |
                      |     - Time Preference     |
                      |     - Risk Preference     |
                      +---------------------------+
                                    |
                                    v Analysis & Logical Evaluation
                         +---------------------+
                         |      SENSITIVITY    |
                         |  - To Choice        |
                         |  - To Information   |
                         |  - To Preference    |
                         +---------------------+
                                    |
                                    v
                          +-------------------+
                          |     DECISION      |
                          +-------------------+
```

---

### 9.3 Basic Elements of a Decision Model

| Element | Graphic Symbol | Formal Definition & Operational Meaning |
| :--- | :---: | :--- |
| **Decision Nodes** | Rectangle ($\square$) | Decision points where the agent exercises deliberate choice among available alternatives. |
| **Chance Nodes** | Circle / Oval ($\bigcirc$) | Uncertain chance events with several probabilistic outcomes. |
| **Value / Utility Nodes** | Diamond ($\diamond$) / Rounded Rectangle | Deterministic monetary values or utility functions measuring the desirability of final objectives. |
| **Probabilistic Dependencies** | Directed Arrow ($\to \bigcirc$) | Conditional dependence between chance events. |
| **Informational Dependencies** | Directed Arrow ($\to \square$) | Information physically known to the decision-maker at the moment the decision is made. |

---

### 9.4 Case Study: Martian Adventures (Persy the Mars Rover)

#### Scenario Overview:
Mars Base is considering deploying a new tool for *Persy the Mars Rover* to collect and analyze Martian rock samples:
- **Two Power Designs:** **Solar Power** and **Battery Power**. Both designs have different energy consumption rates and development times.
- **Uncertainty:** Success rates working in the harsh Martian environment are highly uncertain.
- **Physical Constraint:** Only one design can be deployed at a time due to payload constraints on the resupply ships.
- **Contingency:** If either design fails once deployed, a new, modified version may be sent in the next resupply mission (which means waiting longer and still does not guarantee success).
- **Two-Stage Decision Problem:**
  1. Decide on which power design to deploy: Solar, Battery, or neither (if risk is too high).
  2. If the tool fails, decide whether to send a modified version or to abort the mission objective.

---

#### Decision Model (1): Influence Diagram Topology

```
+--------------------------+                   +------------------------+
| Exploration Tool Design  | ----------------> | Initial Design Outcome |
|     [Decision Node]      |                   |     [Chance Node]      |
+--------------------------+                   +------------------------+
      |                  \                       /                    |
      | Informational     \                     / Informational       |
      |                    \                   /                      |
      v                     v                 v                       v
+--------------------------+                   +------------------------+
|    New Unit Decision     | ----------------> |     Final Outcome      |
|     [Decision Node]      |                   |     [Chance Node]      |
+--------------------------+                   +------------------------+
      \                            |                              /
       \                           |                             /
        \                          v                            /
         +-----------------> [ UTILITY ] <---------------------+
                             [Value Node]
```

#### Three Key Questions Posed by the Influence Diagram:
1. *Which power design to use?*
2. *If the tool fails, should a new version be sent?*
3. *What are the utilities — benefits or costs?*

---

#### Decision Model (2): Full Numerical Decision Tree

```
[Mars Tools Decision]
|
|-- Battery Power -----------------------------------------------------------------+
|     |                                                                            |
|     +-- (Initial Design Outcome)                                                 |
|           |-- Success (p = 0.75) ---------------------------------------> U = 1.0|
|           +-- Failure (p = 0.25)                                                 |
|                 |                                                                |
|                 v                                                                |
|           [New Unit Decision]                                                    |
|                 |-- Abandon Project ------------------------------------> U = 0.2|
|                 +-- Send New Unit                                                |
|                       |                                                          |
|                       +-- (Final Outcome)                                        |
|                             |-- Success (p = 0.3) --------------> U = 0.8        |
|                             +-- Failure (p = 0.7) --------------> U = 0.0        |
|                                                                                  |
|-- Solar Power -------------------------------------------------------------------+
|     |                                                                            |
|     +-- (Initial Design Outcome)                                                 |
|           |-- Success (p = 0.60) ---------------------------------------> U = 1.0|
|           +-- Failure (p = 0.40)                                                 |
|                 |                                                                |
|                 v                                                                |
|           [New Unit Decision]                                                    |
|                 |-- Abandon Project ------------------------------------> U = 0.2|
|                 +-- Send New Unit                                                |
|                       |                                                          |
|                       +-- (Final Outcome)                                        |
|                             |-- Success (p = 0.8) --------------> U = 0.8        |
|                             +-- Failure (p = 0.2) --------------> U = 0.0        |
|                                                                                  |
+-- No New Tool ----------------------------------------------------------> U = 0.4
```

#### Backward Induction Evaluation:

1. **Evaluate Battery Power Subtree:**
   - At `New Unit Decision`:
     - If `Send New Unit`:
       $$\mathbb{E}[U(\text{Send})] = 0.3 \times 0.8 + 0.7 \times 0.0 = \mathbf{0.24}$$
     - If `Abandon Project`:
       $$U(\text{Abandon}) = \mathbf{0.20}$$
     - Since $0.24 > 0.20$, the rational choice is **Send New Unit**, yielding branch utility $0.24$.
   - At Root `Battery Power`:
     $$\mathbb{E}[U(\text{Battery})] = 0.75(1.0) + 0.25(0.24) = 0.75 + 0.06 = \mathbf{0.81}$$

2. **Evaluate Solar Power Subtree:**
   - At `New Unit Decision`:
     - If `Send New Unit`:
       $$\mathbb{E}[U(\text{Send})] = 0.8 \times 0.8 + 0.2 \times 0.0 = \mathbf{0.64}$$
     - If `Abandon Project`:
       $$U(\text{Abandon}) = \mathbf{0.20}$$
     - Since $0.64 > 0.20$, the rational choice is **Send New Unit**, yielding branch utility $0.64$.
   - At Root `Solar Power`:
     $$\mathbb{E}[U(\text{Solar})] = 0.60(1.0) + 0.40(0.64) = 0.60 + 0.256 = \mathbf{0.856}$$

3. **Evaluate No New Tool:**
   $$U(\text{No New Tool}) = \mathbf{0.40}$$

#### Decision & Policy:
$$\mathbb{E}[U(\text{Solar})] = 0.856 > \mathbb{E}[U(\text{Battery})] = 0.810 > U(\text{No New Tool}) = 0.400$$

- **Optimal Action Policy:**
  1. Deploy **Solar Power**.
  2. If the initial solar tool fails, **Send New Unit** on the next resupply mission.
- **Key Estimation Questions Raised:**
  - *How to estimate uncertainties?* (Requires physical testing, environmental simulation, Bayesian telemetry updating).
  - *How to estimate utilities?* (Requires multi-attribute trade-off modeling between scientific mission return, delay costs, and equipment replacement budgets).

---

### 9.5 Decision Computing Tools Matrix

Modern computational decision analysis relies on dedicated commercial and academic software suites:

| Software Tool | Primary Modeling Capabilities | Key Academic / Commercial Features |
| :--- | :--- | :--- |
| **DPL** (*Decision Programming Language*) | Influence diagrams, Decision trees | Advanced corporate decision modeling language with sensitivity analysis. |
| **Netica** (*Norsys*) | Bayesian belief networks, Influence diagrams | High-performance compiled C/C++ API engines for real-time belief updating. |
| **TreeAge Pro** | Decision trees, Markov state-transition models, Influence diagrams | Gold standard in healthcare economics and clinical decision trees. |
| **Palisade PrecisionTree** | Excel-integrated decision trees and influence diagrams | Directly integrates with Monte Carlo simulation spreadsheets (@RISK). |
| **BayesiaLab** | Bayesian networks, Causal discovery, Influence diagrams | Sophisticated machine learning algorithms for causal structure discovery. |
| **Hugin Expert** | Bayesian networks, Influence diagrams, Object-oriented BNs | Enterprise industrial diagnostic systems. |
| **BayesFusion (GeNIe & SMILE)** | Bayesian networks, Influence diagrams, Structural equation models | **FREE for academic research**. Features GeNIe GUI and SMILE C++/Java/Python engine. |

*For full industry comparative benchmarking, refer to the **INFORMS Decision Analysis Software Survey**.*

---

## 10. Game Theory: Strategic Multi-Agent Decision Making

### 10.1 Single-Agent Utility Theory vs. Multi-Agent Game Theory

- **Single-Agent Decision Theory (Bernoulli, 1738):** The environment is stochastic but indifferent (nature does not actively try to outwit or exploit the agent).
- **Game Theory (Von Neumann & Morgenstern, 1944):** The environment contains other rational, self-interested agents whose decisions directly impact everyone's payoff.

### 10.2 Example: Pandas' Dilemma (Game Theory in Action)

Two pandas, **Bobo** and **Almo**, forage in a valley where bamboo is in short supply. Each morning, each panda must decide independently whether to:
- **Share:** Reveal the locations of secret bamboo groves.
- **Keep Secret:** Conceal bamboo grove locations for private feeding.

#### Payoffs:
- **Both Keep Secret:** Each gets $+1$ (safe but poor foraging outcome).
- **One Shares, One Keeps Secret:** The secret keeper gains $+5$ (eats everything), while the sharer gets $0$.
- **Both Share:** Both get $+3$ (cooperative abundance).

#### Strategic Normal Form (Payoff Matrix):

```
                                      Almo (Player A)
                                Keep Secret       Share
                   +---------------+---------------+
       Keep Secret | B: +1, A: +1  | B: +5, A:  0  |
Bobo               +---------------+---------------+
(Player B)   Share | B:  0, A: +5  | B: +3, A: +3  |
                   +---------------+---------------+
```

#### Strategic Dominance & Nash Equilibrium Analysis:
1. **Bobo's Perspective:**
   - If Almo plays `Keep Secret`: Bobo gets $+1$ by playing `Keep`, and $0$ by playing `Share` $\implies 1 > 0$ (`Keep` is strictly better).
   - If Almo plays `Share`: Bobo gets $+5$ by playing `Keep`, and $+3$ by playing `Share` $\implies 5 > 3$ (`Keep` is strictly better).
   - Therefore, `Keep Secret` is Bobo's **Strictly Dominant Strategy**.
2. **Almo's Perspective:**
   - By symmetry, `Keep Secret` is also Almo's strictly dominant strategy.
3. **The Unique Nash Equilibrium:**
   Both pandas independently choose `Keep Secret`:
   $$(\text{Keep Secret}, \text{Keep Secret}) \implies \mathbf{\text{Payoffs: } (+1, +1)}$$

#### The Fundamental Paradox: Individual vs. Collective Rationality
- If both pandas could coordinate and cooperate on $(\text{Share}, \text{Share})$, both would receive payoffs of **$+3$**.
- The outcome $(+3, +3)$ is **Pareto Optimal** (it is impossible to make one panda better off without making another worse off).
- Yet individual self-interest drives both pandas inescapably into the Pareto-suboptimal Nash Equilibrium $(+1, +1)$.

> **The Fundamental Lesson of Game Theory:**
> What is strictly rational from the self-interested perspective of an individual agent may result in a collectively suboptimal or disastrous outcome for the system as a whole.

---

### 10.3 Cross-Disciplinary Applications of Decision & Game Theory

*(Reference: Maschler, Solan, & Zamir, Game Theory, 2020)*

| Domain | Utility Theory Applications (Single-Agent Focus) | Game Theory Applications (Multi-Agent Focus) |
| :--- | :--- | :--- |
| **Economics** | Consumer choice modeling, cost-benefit analysis, portfolio risk assessment | Oligopoly pricing strategies, market competition, spectrum auctions |
| **Computer Networks** | Buffer resource allocation, quality-of-service (QoS) optimization | Inter-domain routing cooperation, bandwidth cost-sharing, competitive network use |
| **Political Science** | Public policy evaluation, social welfare maximization | Voting systems, legislative coalition formation, geopolitical treaties |
| **Evolutionary Biology** | Optimal animal habitat choice, patch foraging optimization | Evolutionarily Stable Strategies (ESS), predator-prey dynamics, territorial contests |
| **Business Strategy** | Product design trade-offs, capital investment decisions | Pricing competition, contract negotiations, joint ventures |
| **Social Policy** | Fair resource distribution, equity optimization | Fairness and trust mechanisms in strategic settings, public goods games |
| **Healthcare** | Patient treatment pathway choice, medical cost-effectiveness analysis | Hospital capacity competition, vaccine allocation games |
| **Education** | Curriculum sequencing optimization, personalized adaptive learning | Institutional admissions competition, collaborative grading incentives |

---

## 11. Real-World AI Applications, Challenges & Course Bridge

### 11.1 Real-World AI Applications
- **MEU in Autonomous Planning:** Guiding robotic navigation, sensor fusion, and active perception under physical uncertainty.
- **Human-AI Collaboration & Transparency:** Explicit utility elicitation allows AI agents to expose their value trade-offs to human supervisors, fostering trust and safety.

### 11.2 Open Engineering Challenges
- **Capturing Human Preferences in Dynamic Contexts:** Human values drift over time, suffer from cognitive biases, and depend on situational framing.
- **Integrating Expert Judgment with Big Data:** Melding subjective Bayesian priors from human domain specialists with high-dimensional empirical sensor streams.
- **Building Responsible AI:** Designing multi-attribute utility functions that formally enforce fairness, ethics, safety invariants, and transparent governance.

### 11.3 Transition to Sequential Decision Making (Reinforcement Learning)
In single-stage and short-horizon problems, computing MEU via decision trees is straightforward. However, real autonomous systems must solve **long-horizon sequential problems** where:
1. Actions taken today alter the distribution of states available tomorrow.
2. The environment's transition dynamics $P(s' \mid s, a)$ and reward functions are initially unknown.
3. The agent must balance **Exploitation** (maximizing immediate expected utility) with **Exploration** (learning unknown environment physics).

This marks the transition into the next core phase of CS5446: **Markov Decision Processes (MDPs)**, **Dynamic Programming**, and **Reinforcement Learning (RL)**!

---

<reviewkit>
<takeaways>
- **The Core Decision Triad:** A rational agent combines probabilistic Beliefs, subjective Preferences (Utility function), and an MEU Decision Process to act optimally under uncertainty.
- **Bayesian Observation Dynamics:** In Panda Lulu's lunch choice, sensory observations update posterior beliefs via Bayes' Rule, altering expected utilities and reversing optimal actions ($O=\text{rustling} \implies \text{Berry } (4.0 > 2.5)$; $O=\text{silence} \implies \text{Grove } (6.67 > 4.0)$).
- **VNM Axioms of Rationality:** Six foundational conditions (Orderability, Transitivity, Continuity, Substitutability, Monotonicity, Decomposability) mathematically guarantee the existence of an expected utility function.
- **Positive Affine Invariance:** Utility scales are unique strictly up to $U'(s) = a U(s) + b$ with $a > 0$. Shifting or scaling leaves decisions unchanged, but strictly forbids interpersonal utility comparisons between different agents.
- **Expected Monetary Value vs. Expected Utility:** Rational agents maximize Expected Utility, not Expected Monetary Value (EMV). Under concave utility of money, an agent correctly declines the $\$1\text{M}$ coin flip gamble despite its positive monetary expectation ($\$1.25\text{M}$).
- **Risk Premium:** Defined as $\text{EMV} - \text{CE}$, representing the cash value an agent sacrifices to eliminate risk. Concave curves indicate risk aversion ($\text{Risk Premium} > 0$), linear curves indicate risk neutrality, and convex curves indicate risk seeking.
- **Prescriptive Decision Analysis:** Ronald Howard's framework translates messy real-world dilemmas into structured influence diagrams (decision, chance, and utility nodes) and decision trees solved via backward induction (Martian Adventures case study).
- **The Game-Theoretic Paradox:** As proven by the Pandas' Dilemma (Prisoner's Dilemma), independent self-interested agents inevitably converge on a suboptimal Nash Equilibrium $(+1, +1)$ despite the existence of a Pareto optimal cooperative alternative $(+3, +3)$.
</takeaways>

<qquiz src="questions.en.json"/>

<qprompt/>
</reviewkit>

## References

1. Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4th ed.). Pearson. (Chapters 16.1–16.3, 16.5, 16.6.6, 17.1).
2. Bernoulli, D. (1738). Specimen theoriae novae de mensura sortis (Exposition of a new theory on the measurement of risk). *Commentarii Academiae Scientiarum Imperialis Petropolitanae*, 5, 175-192. (Translated in *Econometrica*, 1954, 22(1), 23-36).
3. Von Neumann, J., & Morgenstern, O. (1944). *Theory of Games and Economic Behavior*. Princeton University Press.
4. Howard, R. A. (1988). Decision analysis: Practice and promise. *Management Science*, 34(6), 679-695.
5. Levin, J. (2006). *Choice Under Uncertainty*. Stanford University Department of Economics Lecture Notes.
6. Charniak, E. (1991). Bayesian networks without tears. *AI Magazine*, 12(4), 50-63.
7. Abbas, A. E. (2018). *Foundations of Multiattribute Utility*. Cambridge University Press.
8. Maschler, M., Solan, E., & Zamir, S. (2020). *Game Theory* (2nd ed.). Cambridge University Press.
9. Bratman, M. (1987). *Intentions, Plans, and Practical Reason*. Harvard University Press.
10. Gopalan, A., & Teo, Y. M. (2025). *CS4246/5446 Rational Decision Making: Decision Theory, Utility Theory, and Game Theory (Version 3.0)*. National University of Singapore (NUS).
# Week 4 - Sequential Decision Making under Uncertainty: Markov Decision Processes, Dynamic Programming, and Tabular Reinforcement Learning (Passive & Active RL)

<draft>
- 1. Foundations of Sequential Decision Making & Environment Taxonomy
    - Paradigm Comparison: Classical Planning vs. Decision Analysis vs. Sequential Decision Making under Uncertainty vs. Markov Decision Processes (MDPs) vs. Reinforcement Learning (RL).
    - Dimension Analysis: Sequential vs. Episodic, Deterministic vs. Stochastic, Full vs. Partial Observability, Known vs. Unknown Environment Models.
    - Sequential Decision Problems: Decisions unfolding over time where utility depends on the entire action sequence and trajectory history. Search and classical planning as deterministic special cases.
- 2. Motivating Real-World Scenarios & The 4x3 Grid World Benchmark
    - Scenario 1: Percy the Mars Rover (stochastic wheel slippage, dust storms, energy trade-offs).
    - Scenario 2: Ride-Hailing Fleet Management (Grab / Uber spatial clusters, stochastic requests, surge relocation).
    - Scenario 3: The 4x3 Grid World Benchmark (Russell & Norvig):
        - Geometry: 4 columns x 3 rows, start cell (1,1), obstacle at (2,2), terminal absorbing states at (4,3) [+1] and (4,2) [-1].
        - Stochastic Transitions: Intended direction (0.8), perpendicular left (0.1), perpendicular right (0.1); boundary collisions bounce back.
        - Reward Sensitivity & Behavioral Regimes: Step reward R(s) across living penalty thresholds (-1.6284 suicidal, -0.4278 aggressive, -0.04 conservative detour, >0 loitering).
- 3. Formal Markov Decision Process (MDP) Specification & Dynamic Decision Networks
    - Formal Tuple: M = <S, A, T, R, gamma>.
    - State Space S and Action Space A(s).
    - Transition Model: T(s, a, s') = P(s' | s, a) with probability conservation sum_s' P(s' | s, a) = 1.
    - The First-Order Markov Property: Memoryless assumption P(S_{t+1} | S_t, A_t, ..., S_0, A_0) = P(S_{t+1} | S_t, A_t).
    - Reward Formulations: R(s), R(s, a), and R(s, a, s') bounded within [-R_max, +R_max].
    - MDP as a Dynamic Decision Network (DDN): Decision nodes, Chance nodes, Transition dependencies, Reward nodes, and Terminal utility.
- 4. Utility, Horizons, and Preferences over Trajectories
    - Trajectory Return G_t: Additive cumulative reward along an environment history.
    - Finite vs. Infinite Horizon: Stationary policies (pi*) in infinite horizons under discount factor gamma in [0, 1).
    - Geometric Utility Bound: U_max <= R_max / (1 - gamma).
    - Preference Independence (Stationarity): Preservation of temporal preferences.
- 5. Policies & Policy Evaluation: The Bellman Expectation Equation
    - Policy Mapping: pi: S -> A.
    - Value Function: U^pi(s) = E_pi [ sum gamma^t R_t | S_0 = s ].
    - Bellman Expectation Equation: U^pi(s) = sum_s' P(s' | s, pi(s)) [R(s, pi(s), s') + gamma U^pi(s')].
    - Exact Matrix Inversion: U^pi = (I - gamma T^pi)^(-1) R^pi in O(|S|^3).
    - Iterative Policy Evaluation for large state spaces.
- 6. The Bellman Optimality Equation & The Q-Function (Action-Utility)
    - Optimal State Utility: U(s) = max_pi U^pi(s) = V(s).
    - Bellman Optimality Equation: U(s) = max_a sum_s' P(s' | s, a) [R(s, a, s') + gamma U(s')].
    - Optimal Policy Extraction: pi*(s) = argmax_a sum_s' P(s' | s, a) [R(s, a, s') + gamma U(s')].
    - The Q-Function: Q(s, a) = sum_s' P(s' | s, a) [R(s, a, s') + gamma U(s')] = sum_s' P(s' | s, a) [R + gamma max_a' Q(s', a')].
    - Fundamental Duality: U(s) = max_a Q(s, a) and pi*(s) = argmax_a Q(s, a).
- 7. Value Iteration: Algorithm, Contraction Mapping, and Error Dynamics
    - Algorithm Specification: Bellman updates U_{i+1}(s) <- max_a sum_s' P(s'|s,a)[R + gamma U_i(s')], epsilon-convergence, policy extraction.
    - Worked Example at (1,1): Candidate action evaluations for Up, Left, Down, Right; pi*(1,1) = Up.
    - Per-iteration Complexity: O(|S|^2 |A|).
    - Mathematical Proof of Contraction Mapping: Max norm ||.||_infty on Banach space (R^{|S|}, ||.||_infty); ||B U - B V||_infty <= gamma ||U - V||_infty; Banach Fixed-Point Theorem.
    - Error Dynamics and Policy Loss in the 4x3 World: Explaining why policy loss drops to 0 by iteration 4 while utility values converge by iteration 14.
- 8. Policy Iteration: Algorithm, Implementation Walkthrough, and Theoretical Guarantees
    - Two-Phase Iterative Cycle: Policy Evaluation (exact linear system without max operator) alternating with Policy Improvement.
    - Worked Linear System in 4x3 Grid World: Setting up linear equations for U_i(1,1), U_i(1,2), etc.
    - Worked Policy Improvement at State (1,1): Step-by-step action evaluation under wall bounces.
    - Proof of the Policy Improvement Theorem (Sutton & Barto Section 4.2): Telescoping expansion over infinite horizons.
    - Grand Comparison: Value Iteration vs. Policy Iteration.
- 9. Foundations of Reinforcement Learning: Reward-Based Learning & Planning
    - The Paradigm Shift: Unknown Transition Models T and Reward Functions R; learning from experience tuples (s, a, r, s').
    - The Agent-Environment Loop: Percepts, States, Actions, Transitions, Rewards.
    - Four-Quadrant Taxonomy: Model-Based [MB] vs. Model-Free [MF] x Passive RL (Policy Evaluation) vs. Active RL (Control).
    - Action-Utility Q(s,a) as the cornerstone of model-free control.
- 10. Passive Reinforcement Learning: Policy Evaluation with Unknown Environment Models (pi -> U^pi)
    - Mathematical Framework: Episodes/Trials, Return G_t, Expected Return U^pi(s).
    - Model-Based Passive RL: Adaptive Dynamic Programming (ADP):
        - Maximum Likelihood Estimation (MLE) of transition probabilities by counting and normalizing: P_hat(s' | s, a) = N_{s'|s,a}[s, a] / N[s, a].
        - Worked 3-Trajectory Example in 4x3 Grid World: Deriving transition probabilities from state (3,3).
        - Policy evaluation via solving |S| linear equations in O(|S|^3).
        - Global Bellman consistency enforcement; Passive-ADP-Learner algorithm (RN Figure 22.2).
    - Model-Free Passive RL 1: Direct Utility Estimation (Monte Carlo Learning):
        - Averaging empirical returns across visits: U^pi(s) <- (1 / N(s)) sum G_t^{(i)}.
        - Worked Return Calculations for (1,1) and (1,2) across 3 benchmark trajectories (deriving 0.067 and 0.79).
        - Properties: Unbiased (E[G] = U^pi(s)), high variance, episode-level updates, lack of Bellman consistency across states.
    - Model-Free Passive RL 2: Temporal Difference Learning (TD(0)):
        - Online Bellman consistency between successive states.
        - Worked Step: Tracing state (1,3) with U^pi(1,3) = 0.84 updated using U^pi(2,3) = 0.92 towards long-run target 0.88.
        - TD update rule: U^pi(s) <- U^pi(s) + alpha [R + gamma U^pi(s') - U^pi(s)].
        - TD Target (R + gamma U^pi(s')), TD Error (R + gamma U^pi(s') - U^pi(s)), Learning rate alpha(n) = 1/n.
        - Bootstrapping: Updating from estimates vs. waiting for full returns.
        - Passive-TD-Learner algorithm (RN Figure 22.4).
    - The Unified Spectrum: n-Step TD and TD(lambda):
        - n-step returns G_t^{(n)} bridging 1-step TD(0) and infinity-step MC.
        - TD(lambda) forward view: Geometric weighting G_t^lambda = (1 - lambda) sum lambda^{n-1} G_t^{(n)}.
        - Normalizing constant proof: sum lambda^{n-1} = 1 / (1 - lambda).
        - Limit proofs: lambda -> 0 recovers TD(0), lambda -> 1 recovers MC.
        - Eligibility traces implementation (backward view).
    - Empirical Showdown & Comprehensive Comparison: ADP vs. TD(0) vs. MC:
        - RMS error convergence dynamics in 4x3 Grid World across trials (ADP 20-30 trials vs. TD 400-500 trials).
        - Grand 9-Dimensional Comparison Matrix (Core equation, update style, transition scope, model requirement, data efficiency, computation, timing, bootstrapping, bias-variance tradeoff).
- 11. Active Reinforcement Learning: Control and Optimal Policy Synthesis (pi*)
    - The Control Problem & Generalized Policy Iteration (GPI): Alternating evaluation and improvement feedback loop.
    - Model-Based Active RL: Active Adaptive Dynamic Programming (Active ADP):
        - Algorithm architecture: Active-ADP-Learner (replacing policy evaluation with policy/value iteration).
        - The Fatal Pathology of Greedy ADP: Why the greedy agent fails at state (2,1) by going right instead of left; permanent policy loss ~0.35.
        - The Dual Role of Actions: Immediate exploitation vs. active information gathering.
    - The Exploration vs. Exploitation Dilemma:
        - Greedy in the Limit of Infinite Exploration (GLIE) principle.
        - epsilon-greedy exploration with decay epsilon_t = 1/t.
    - Optimism in the Face of Uncertainty & Exploration Functions:
        - Principled exploration: exploring actions not yet proven bad.
        - Mathematical formulation: U+(s) <- max_a f(sum_s' P(s'|s,a)[R + gamma U+(s')], N(s, a)).
        - Canonical exploration function: f(u, n) = R+ if n < N_e else u.
        - Empirical triumph in 4x3 Grid World: Exploring ADP (R+=2, N_e=5) plummets policy loss to 0 in 20 trials.
    - Model-Free Active Control 1: Monte Carlo Control:
        - Action-value estimation Q(s, a) <- (1 / N(s, a)) sum G_t^{(i)}; policy improvement pi(s) = argmax_a f(Q(s, a), N(s, a)).
    - Model-Free Active Control 2: Temporal Difference Control (SARSA vs. Q-Learning):
        - On-Policy vs. Off-Policy Control division.
        - SARSA (On-Policy TD Control): Quintuple (s, a, r, s', a'); target action a' selected by actual behavior policy; cautious, risk-averse.
        - Q-Learning (Off-Policy TD Control; Watkins 1989): Quadruple (s, a, r, s'); target action selected greedily max_{a'} Q(s', a'); aggressive, optimistic.
        - Side-by-side controller algorithms (Poole & Mackworth 2018).
    - Canonical Benchmark: The Cliff Walking Environment (Sutton & Barto Example 6.6):
        - Environment: 4x12 grid, start S, goal G, -100 cliff, -1 step cost.
        - Trajectory analysis: Why SARSA learns the safe upper path (return ~ -25) while Q-learning falls into the cliff under epsilon-greedy exploration (return ~ -50).
        - Asymptotic convergence under GLIE (epsilon -> 0): both converge to the optimal cliff-edge route.
    - Grand Comparison: SARSA vs. Q-Learning (7-dimensional comparison table).
- 12. Summary of Tabular Reinforcement Learning & The Bridge to Deep RL
    - Comprehensive 2x2 Matrix: Passive vs. Active x Model-Based vs. Model-Free.
    - The Curse of Dimensionality in Tabular Methods: Why tables fail in high dimensions, setting the stage for Week 5's Function Approximation, Deep Q-Networks, and Policy Gradients.
- 13. Reviewkit (<takeaways>, <qquiz/>, <qprompt/>) & Academic References
</draft>


In Week 3, we analyzed single-stage and short-horizon rational decisions under uncertainty, establishing the Maximum Expected Utility (MEU) principle and game-theoretic equilibria. However, real-world autonomous agents—from planetary exploration rovers to autonomous ride-hailing fleets—operate across **extended temporal horizons** where:
1. Actions executed at the current time step alter the probability distribution of future states.
2. Immediate rewards must be weighed against long-term delayed consequences.
3. Information unfolds dynamically, requiring a feedback policy rather than an open-loop action sequence.

This master note formalizes **Sequential Decision Making under Uncertainty** through the mathematical framework of **Markov Decision Processes (MDPs)**. Based on the National University of Singapore CS4246/CS5446 curriculum, this document details the **Bellman Expectation and Optimality Equations**, the **Q-Function**, **Value Iteration** (with full contraction mapping convergence proofs and policy loss analysis), **Policy Iteration** (with concrete numerical implementation and the Policy Improvement Theorem proof), and modern scaling techniques leading into **Reinforcement Learning (RL)**.

---

## 1. Foundations of Sequential Decision Making & Environment Taxonomy

### 1.1 Taxonomy of Decision-Theoretic Paradigms

To locate Markov Decision Processes within the broader landscape of artificial intelligence, we examine the formal taxonomy of environmental assumptions across five foundational paradigms:

| Decision Framework | Horizon Structure | Environmental Dynamics | Observability Model | Environment Model Knowledge |
| :--- | :--- | :--- | :--- | :--- |
| **Classical Planning** *(STRIPS, PDDL, SATPlan)* | Sequential (Multi-step) | **Deterministic** ($\mathcal{T}: \mathcal{S} \times \mathcal{A} \to \mathcal{S}$) | **Fully Observable** (Known exact state) | **Explicit Model** (Predefined rules) |
| **Decision Analysis** *(Howard 1988, Trees)* | Episodic or Short-Sequential | **Stochastic** ($P(s' \mid s, a)$) | **Fully Observable** (Known state/lottery) | **Explicit Model** (Probability tables) |
| **Sequential Decision Under Uncertainty** | Sequential (Temporal trajectories) | **Stochastic** ($P(s' \mid s, a)$) | **Fully or Partially Observable** (POMDP) | **Explicit Model** |
| **Markov Decision Processes (MDP)** | Sequential (Discrete time steps) | **Stochastic** ($P(s' \mid s, a)$) | **Fully Observable** ($S_t$ known at step $t$) | **Explicit Model** ($\mathcal{T}$ and $\mathcal{R}$ known) |
| **Reinforcement Learning (RL)** | Sequential (Interactive environment) | **Stochastic** ($P(s' \mid s, a)$) | **Fully or Partially Observable** | **Unknown Model** (Learns from trial-and-error feedback) |

### 1.2 The Nature of Sequential Decision Problems

In a **Sequential Decision Problem**:
- Decisions are executed over multiple successive time steps $t = 0, 1, 2, \dots$.
- The utility of an agent does not depend solely on an isolated terminal state, but on the **entire sequence of states and actions** (the environment history).
- **Search and Classical Planning as Special Cases:** Classical goal-seeking search (such as $A^*$) is a degenerate special case where state transitions are deterministic ($P(s' \mid s, a) \in \{0, 1\}$), observations are perfect, and all step costs are deterministic constants.

---

## 2. Motivating Real-World Scenarios & The 4x3 Grid World Benchmark

### 2.1 Scenario 1: Percy the Mars Rover

Consider NASA's *Perseverance (Percy)* rover operating autonomously on the surface of Mars:
- **State Space $\mathcal{S}$:** Defined by battery charge level, scientific memory storage, current spatial coordinate on the Martian surface, geological terrain hazard index, and local weather conditions.
- **Action Space $\mathcal{A}$:** Available operations include `Drive(direction)`, `SampleRock(target)`, `TransmitData(orbiter)`, and `RechargeSolar()`.
- **Environmental Uncertainty:**
  - Rocky Martian slopes cause wheel slippage, making motion transitions stochastic.
  - Solar irradiance varies with unpredictable atmospheric dust storms.
  - Satellite communication windows with the Mars Reconnaissance Orbiter are intermittent.
- **Sequential Trade-Off:** Drilling rock samples consumes substantial battery reserves. If Percy exhausts its power before reaching a sunlight-exposed ridge, the rover freezes permanently (catastrophic negative utility). The rover must continuously balance the immediate scientific value of sample collection against the long-term survival imperative of energy management.

---

### 2.2 Scenario 2: Autonomous Ride-Hailing Fleet Management

Consider an autonomous electric vehicle fleet dispatch system (e.g., Grab, Uber, or Waymo) operating across a metropolitan city:
- **State Space $\mathcal{S}$:** Each vehicle's state comprises its current geographic zone, current battery state-of-charge, local time of day, and current passenger occupancy.
- **Action Space $\mathcal{A}$:** Decisions executed by the fleet controller include `WaitInZone()`, `Relocate(target_zone)`, and `NavigateToChargingStation()`.
- **Environmental Uncertainty:** Passenger demand is stochastic and fluctuates with weather and transit delays; traffic congestion alters relocation transit times.
- **Sequential Trade-Off:** Relocating an empty vehicle to a high-demand downtown zone incurs immediate energy costs and road congestion risk, but positions the vehicle for high-value surge fares in subsequent hours. An optimal policy must maximize cumulative operational revenue net of charging costs over a multi-day horizon.

---

### 2.3 Scenario 3: The Classical 4x3 Grid World Benchmark

The standard pedagogical environment introduced by Russell and Norvig (2020) is the **4x3 Grid World**:

```
      1        2        3        4
   +--------+--------+--------+--------+
 3 | (1,3)  | (2,3)  | (3,3)  |  +1    |  <-- Terminal Goal State
   +--------+--------+--------+--------+
 2 | (1,2)  | [WALL] | (3,2)  |  -1    |  <-- Terminal Trap State
   +--------+--------+--------+--------+
 1 | (1,1)  | (2,1)  | (3,1)  | (4,1)  |
   +--------+--------+--------+--------+
     START
```

#### 1. Environmental Geometry:
- The environment consists of 11 reachable cells across a 4-column by 3-row grid.
- Cell `(2,2)` is an impassable solid obstacle (wall).
- Cell `(1,1)` is the designated start state.
- Cells `(4,3)` and `(4,2)` are **absorbing terminal states** with final payoffs $+1$ and $-1$, respectively. When the agent enters either state, the episode immediately terminates.

#### 2. Stochastic Action Effects (Sensorimotor Noise):
At each non-terminal state, the agent selects from four intended actions: $\mathcal{A} = \{\text{Up}, \text{Down}, \text{Left}, \text{Right}\}$. However, the propulsion system is noisy:
- **Intended Direction:** The agent moves in the intended direction with probability **$0.80$**.
- **Perpendicular Drift (Left):** The agent veers $90^\circ$ to the left of the intended direction with probability **$0.10$**.
- **Perpendicular Drift (Right):** The agent veers $90^\circ$ to the right of the intended direction with probability **$0.10$**.
- **Inelastic Boundary Collisions:** If the agent attempts to move into the boundary wall or the impassable obstacle `(2,2)`, it bounces off and **remains in its current cell** with the corresponding probability.

```
                  ^  0.8 (Intended: Up)
                  |
        0.1 <--- [s] ---> 0.1
      (Left)      |      (Right)
                  v  0.0 (Opposite)
```

#### 3. Step Reward Sensitivity Analysis:
In the standard setup, every transition between non-terminal states incurs a constant living cost:

$$R(s) = -0.04$$

This small negative reward incentivizes the agent to reach the $+1$ goal as quickly as possible without unnecessary wandering. Crucially, the **optimal policy $\pi^*$ depends exquisitely on the magnitude of the step reward $r = R(s)$**:

| Reward Regime | Living Reward Range | Behavioral Characterization | Emergent Optimal Policy Navigation Strategy |
| :--- | :--- | :--- | :--- |
| **Regime 1** | **$R(s) < -1.6284$** | **Extreme Penalty (Suicidal Shortcut)** | The penalty for existing is so catastrophic that the agent plunges immediately into the nearest available terminal exit—deliberately taking the $-1$ trap to terminate the episode and avoid accumulating further living penalties. |
| **Regime 2** | **$-0.4278 < R(s) < -0.085$**<br>*(specifically $-0.4278 < R(s) < -0.0886$)* | **Aggressive Risk-Taking** | The living cost is severe. At state `(3,2)`, the agent chooses action `Right` directly toward the $+1$ goal, willingly accepting the $10\%$ stochastic risk of veering down into the adjacent $-1$ cell to save steps. |
| **Regime 3** | **$-0.085 \le R(s) < 0$**<br>*(Standard $R(s) = -0.04$; $-0.0221 < R(s) < 0$)* | **Conservative Detour** | The living cost is moderate. At state `(3,2)`, the agent heads `Up` into `(3,3)`, purposefully taking a protective detour around the wall to create a safety buffer against the lethal $-1$ terminal state. |
| **Regime 4** | **$R(s) = 0$** | **Zero Living Cost (Indifferent Wandering)** | Moving incurs no step cost. The agent has no urgency to reach the goal quickly and will wander indefinitely until stochastic drift eventually deposits it into the $+1$ absorbing state. |
| **Regime 5** | **$R(s) > 0$** | **Delightful Environment (Infinite Loitering)** | Every non-terminal step bestows free positive reward. The agent actively and permanently avoids all terminal exits, executing infinite loops inside the grid to accumulate unbounded positive reward indefinitely. |

---

## 3. Formal Markov Decision Process (MDP) Specification

### 3.1 Mathematical Definition

A **Markov Decision Process (MDP)** is formally specified as a 5-tuple:

$$\mathcal{M} = \langle \mathcal{S}, \mathcal{A}, \mathcal{T}, \mathcal{R}, \gamma \rangle$$

Where:
1. $\mathcal{S}$ is a discrete or continuous **State Space**.
2. $\mathcal{A}$ is a discrete or continuous **Action Space** (with $\mathcal{A}(s)$ denoting actions legally available in state $s$).
3. $\mathcal{T}: \mathcal{S} \times \mathcal{A} \times \mathcal{S} \to [0, 1]$ is the **Transition Function**:
   $$\mathcal{T}(s, a, s') = P(s' \mid s, a)$$
   Satisfying the conservation of probability:
   $$\sum_{s' \in \mathcal{S}} P(s' \mid s, a) = 1, \quad \forall s \in \mathcal{S}, \forall a \in \mathcal{A}(s)$$
4. $\mathcal{R}$ is the **Reward Function**, which can be formulated in three mathematically equivalent representations:
   - State reward: $\mathcal{R}: \mathcal{S} \to \mathbb{R}$, denoted $R(s)$
   - State-action reward: $\mathcal{R}: \mathcal{S} \times \mathcal{A} \to \mathbb{R}$, denoted $R(s, a)$
   - Transition reward: $\mathcal{R}: \mathcal{S} \times \mathcal{A} \times \mathcal{S} \to \mathbb{R}$, denoted $R(s, a, s')$
   All rewards are uniformly bounded: $|R(\cdot)| \le R_{\max} < \infty$.
5. $\gamma \in [0, 1]$ is the **Discount Factor**, establishing the present exchange value of future delayed rewards.

---

### 3.2 The First-Order Markov Property

An environment satisfies the **Markov Property** if the conditional probability distribution of future states depends solely upon the current state and action, being conditionally independent of all historical states and actions:

$$P(S_{t+1} = s_{t+1} \mid S_t = s_t, A_t = a_t, S_{t-1} = s_{t-1}, A_{t-1} = a_{t-1}, \dots, S_0 = s_0, A_0 = a_0) = P(S_{t+1} = s_{t+1} \mid S_t = s_t, A_t = a_t)$$

#### Algorithmic Significance:
- **Complexity Reduction:** The agent does not need to store or condition its decisions upon the unbounded history of past interactions $h_t = (s_0, a_0, \dots, s_t)$. The current state $s_t$ is a sufficient statistic for all future dynamics.
- **Approximation & State Augmentation:** While real-world systems with hidden variables (e.g., vehicle acceleration, wind memory) technically violate the pure Markov property, they can almost always be approximated as Markovian by **augmenting the state representation** (e.g., encoding position plus velocity into $s$).

---

### 3.3 MDP as a Dynamic Decision Network (DDN)

The temporal unfolding of an MDP can be represented as an unrolled **Dynamic Decision Network (DDN)** across discrete time steps:

```
    [A_{t-2}]            [A_{t-1}]             [A_t]              [A_{t+1}]            [A_{t+2}]
        |                    |                   |                    |                    |
        |                    |                   |                    |                    |
        v                    v                   v                    v                    v
---> (S_{t-1}) ----------> (S_t) ------------> (S_{t+1}) ----------> (S_{t+2}) ---------> (S_{t+3})
        |   \                |   \               |   \                |   \                |
        |    \               |    \              |    \               |    \               |
        v     v              v     v             v     v              v     v              v
     <R_{t-1}>            <R_t>               <R_{t+1}>            <R_{t+2}>            <U_{t+3}>
```

#### Node Topology and Dependencies:
- **Decision Nodes (Yellow Rectangles $\square$):** Represent deliberate action choices $A_t$ selected by the agent's policy.
- **Chance Nodes (Blue Ovals $\bigcirc$):** Represent environmental states $S_t$. Each chance node $S_{t+1}$ receives directed causal arrows from the prior state $S_t$ and prior action $A_t$, governed by transition probability $P(S_{t+1} \mid S_t, A_t)$.
- **Utility Nodes (Green Diamonds $\diamond$):** Represent stage rewards $R_t = R(S_t, A_t, S_{t+1})$.
- **Terminal Utility (Pink Diamond $\diamond$):** Represents terminal evaluation $U_{t+3}$ upon episode completion.

---

## 4. Utility, Horizons, and Preferences over Trajectories

### 4.1 Trajectory Return & Temporal Horizons

An agent generates an environment trajectory history:

$$\tau = (s_0, a_0, s_1, a_1, s_2, a_2, \dots)$$

The utility of a trajectory (termed the **Return**, denoted $G_t$ in reinforcement learning) is the additive accumulation of stage rewards:

#### 1. Finite Horizon Problems:
The interaction terminates definitively after a fixed number of steps $N$:

$$U(s_0, s_1, \dots, s_N) = \sum_{t=0}^{N-1} R(s_t, a_t, s_{t+1})$$

- **Non-Stationary Optimal Policies:** In a finite horizon setting, the optimal policy $\pi^*_t(s)$ is **time-dependent (non-stationary)**. For example, if Percy has 2 minutes remaining, it should take reckless risks to transmit data; if it has 5 hours, it should act conservatively.

#### 2. Infinite Horizon Problems:
The process has **no fixed deadline** (this does not mean the agent lives forever; it simply means there is no artificial calendar cutoff):

$$U(s_0, s_1, s_2, \dots) = \sum_{t=0}^\infty \gamma^t R(s_t, a_t, s_{t+1}), \quad \text{where } 0 \le \gamma < 1$$

- **Stationary Optimal Policies:** Because the remaining future horizon is always infinite regardless of the current elapsed time step, the optimal policy $\pi^*(s)$ is **time-invariant (stationary)**: $\pi^*(s)$ depends only on state $s$, not on the current clock time $t$.

---

### 4.2 The Role of the Discount Factor $\gamma$

The discount factor $\gamma \in [0, 1)$ serves three fundamental purposes:
1. **Economic Rationale:** Reflects interest rates, inflation, or the intuitive preference that immediate gratification is inherently more valuable than delayed reward.
2. **Mortality / Survival Probability:** A discount factor can be interpreted as a constant probability $(1 - \gamma)$ that the agent perishes or the environment terminates at each step.
3. **Mathematical Boundedness:** For infinite horizons, if stage rewards are bounded by $\pm R_{\max}$, the geometric series guarantees that the total cumulative utility remains strictly finite:

$$U_{\max} \le \sum_{t=0}^\infty \gamma^t R_{\max} = \frac{R_{\max}}{1 - \gamma} < \infty$$

#### Alternative Mechanisms Ensuring Finite Rewards in Infinite Horizons:
1. **Absorbing Terminal States with Proper Policies:** If every closed policy loop is guaranteed to eventually transition into an absorbing cost-free state ($R(s_{\text{terminal}}) = 0$), discounting is not strictly required ($\gamma = 1$ is admissible).
2. **Average-Reward Formulation:** Evaluating long-run average reward per time step:
   $$\lim_{N \to \infty} \frac{1}{N} \sum_{t=0}^{N-1} \mathbb{E}[R_t]$$

---

### 4.3 The Preference Independence (Stationarity) Assumption

Underlying additive discounted utility is the **Stationarity of Preferences**:
If two trajectory histories begin with identical transitions:

$$[s_0, s_1, s_2, \dots] \succ [s_0, s_1', s_2', \dots] \iff [s_1, s_2, \dots] \succ [s_1', s_2', \dots]$$

An agent's preference between future state sequences remains invariant to when the evaluation begins.

---

## 5. Policies & Policy Evaluation: The Bellman Expectation Equation

### 5.1 Policy Definition

A **Policy** $\pi: \mathcal{S} \to \mathcal{A}$ is a deterministic mapping specifying the action $a = \pi(s)$ executed whenever the agent encounters state $s$.
An MDP agent operates in a continuous control loop:
1. Observes current state $s$.
2. Executes action $a^* = \pi(s)$.
3. Receives reward $R(s)$ and transitions to $s'$.

### 5.2 The Value Function of a Policy

The utility (or value) of state $s$ under policy $\pi$, denoted $U^\pi(s)$ or $V^\pi(s)$, is the expected return starting from $s$:

$$U^\pi(s) = \mathbb{E}^\pi \left[ \sum_{t=0}^\infty \gamma^t R(S_t, \pi(S_t), S_{t+1}) \;\middle|\; S_0 = s \right]$$

### 5.3 Derivation of the Bellman Expectation Equation

We decompose the expectation into the immediate stage reward and the discounted future return:

$$U^\pi(s) = \mathbb{E}^\pi \left[ R(S_0, \pi(S_0), S_1) + \sum_{t=1}^\infty \gamma^t R(S_t, \pi(S_t), S_{t+1}) \;\middle|\; S_0 = s \right]$$

Pulling out the constant discount factor $\gamma$:

$$U^\pi(s) = \sum_{s' \in \mathcal{S}} P(s' \mid s, \pi(s)) \left[ R(s, \pi(s), s') + \gamma \mathbb{E}^\pi \left[ \sum_{k=0}^\infty \gamma^k R(S_{k+1}, \pi(S_{k+1}), S_{k+2}) \;\middle|\; S_1 = s' \right] \right]$$

Recognizing the recursive expression for $U^\pi(s')$:

> **The Bellman Expectation Equation:**
> $$U^\pi(s) = \sum_{s' \in \mathcal{S}} P(s' \mid s, \pi(s)) \left[ R(s, \pi(s), s') + \gamma U^\pi(s') \right]$$

### 5.4 Exact Policy Evaluation via Matrix Inversion vs. Iterative Updates

For a fixed policy $\pi$, the Bellman expectation equation forms a **system of $|\mathcal{S}|$ linear equations with $|\mathcal{S}|$ unknowns**. In vector-matrix notation:

$$\mathbf{U}^\pi = \mathbf{R}^\pi + \gamma \mathbf{T}^\pi \mathbf{U}^\pi$$

Where $\mathbf{R}^\pi \in \mathbb{R}^{|\mathcal{S}|}$ is the expected immediate reward vector, and $\mathbf{T}^\pi \in \mathbb{R}^{|\mathcal{S}| \times |\mathcal{S}|}$ is the state transition matrix under policy $\pi$.
Rearranging:

$$(I - \gamma \mathbf{T}^\pi) \mathbf{U}^\pi = \mathbf{R}^\pi \implies \mathbf{U}^\pi = (I - \gamma \mathbf{T}^\pi)^{-1} \mathbf{R}^\pi$$

- **Exact Matrix Inversion:** Solving via Gaussian elimination requires $\mathcal{O}(|\mathcal{S}|^3)$ operations.
- **Iterative Policy Evaluation (for Large State Spaces):** When $|\mathcal{S}|$ is expansive, matrix inversion becomes computationally prohibitive. We instead apply repeated iterative Bellman expectation backups:
  $$U_{i+1}(s) \leftarrow \sum_{s' \in \mathcal{S}} P(s' \mid s, \pi(s)) \left[ R(s, \pi(s), s') + \gamma U_i(s') \right]$$
  This avoids the $\mathcal{O}(|\mathcal{S}|^3)$ matrix inversion bottleneck, scaling as $\mathcal{O}(k \cdot |\mathcal{S}|^2)$.

---

## 6. The Bellman Optimality Equation & The Q-Function

### 6.1 The Bellman Optimality Equation for State Utility

The true utility of a state, denoted $U(s)$ or $V^*(s)$, is the maximum expected return achievable by any policy:

$$U(s) = \max_{\pi} U^\pi(s)$$

> **The Bellman Optimality Equation (Infinite Horizon):**
> $$U(s) = \max_{a \in \mathcal{A}(s)} \sum_{s' \in \mathcal{S}} P(s' \mid s, a) \left[ R(s, a, s') + \gamma U(s') \right]$$

#### Analytical Interpretation:
- **Maximum Expected Immediate Reward plus Discounted Successor Utility:** The utility of a state equals the expected immediate reward from taking the best possible action plus the discounted average utility of the resulting successor states.
- **MEU Encoding:** The Bellman optimality equation directly operationalizes the **Maximum Expected Utility (MEU) Principle** for sequential decision problems.
- **System of Equations:** Writing one equation per state yields a system of **$|\mathcal{S}|$ non-linear equations with $|\mathcal{S}|$ unknowns** (non-linear due to the $\max_a$ operator). Because of this non-linearity, closed-form linear inversion cannot be used; iterative numerical methods are required.

### 6.2 Optimal Policy Extraction

Once the true utilities $U(s)$ are computed, the **Optimal Policy $\pi^*$** is extracted greedily:

$$\pi^*(s) = \arg\max_{a \in \mathcal{A}(s)} \sum_{s' \in \mathcal{S}} P(s' \mid s, a) \left[ R(s, a, s') + \gamma U(s') \right]$$

---

### 6.3 The Q-Function (Action-Utility Function)

While $U(s)$ evaluates the intrinsic desirability of being in state $s$, selecting actions requires performing a 1-step lookahead over transition probabilities $P(s' \mid s, a)$.
To eliminate this lookahead requirement, we define the **Q-Function** (also called the *Action-Utility Function*):

> **Definition of the Q-Function:**
> $$Q(s, a) = \sum_{s' \in \mathcal{S}} P(s' \mid s, a) \left[ R(s, a, s') + \gamma U(s') \right]$$

Substituting $U(s') = \max_{a'} Q(s', a')$ yields the **Recursive Bellman Optimality Equation for Q**:

$$Q(s, a) = \sum_{s' \in \mathcal{S}} P(s' \mid s, a) \left[ R(s, a, s') + \gamma \max_{a' \in \mathcal{A}(s')} Q(s', a') \right]$$

#### Fundamental Dual Relationships:
1. **Extracting State Utility from Q:**
   $$U(s) = \max_{a \in \mathcal{A}(s)} Q(s, a)$$
2. **Extracting Optimal Policy from Q:**
   $$\pi^*(s) = \arg\max_{a \in \mathcal{A}(s)} Q(s, a)$$

#### Strategic Advantage in Reinforcement Learning:
In model-free reinforcement learning where transition probabilities $P(s' \mid s, a)$ are completely unknown, an agent possessing a learned $Q(s, a)$ table can instantly select optimal actions by taking $\arg\max_a Q(s, a)$ without needing an environmental simulator or transition model.

---

### 6.4 A Two-State MDP You Can Solve by Hand

Let $s$ be nonterminal and $z$ terminal, with $\gamma=0.9$ and $V(z)=0$. Exit gives reward $2$ and moves to $z$. Wait gives reward $1$ and returns to $s$. These are rewards on transitions; the terminal payoff is not paid again after arrival.

For the policy that always waits:
$$V^\pi(s)=1+0.9V^\pi(s)\quad\Longrightarrow\quad V^\pi(s)=10.$$
For the optimal policy:
$$V^*(s)=\max\{2,\;1+0.9V^*(s)\}=10.$$

Starting value iteration from $V_0(s)=0$ gives $V_1(s)=2$, $V_2(s)=2.8$, $V_3(s)=3.52$, converging to $10$. The first backup prefers exiting because future value has not propagated yet. Repeated local Bellman backups communicate long-term consequences.

If the current estimate is $V(s)=3$, an observed Wait transition has TD target $1+0.9(3)=3.7$, hence $\delta=0.7$. With learning rate $0.1$, the update gives $V(s)=3.07$. An Exit transition instead has target $2$, with **no terminal bootstrap**.

Reward $1$ is immediate; return accumulates rewards over time; value $10$ is expected return under a specified policy. For an artificial rollout cutoff in a continuing task, bootstrap from the last state; for genuine termination, continuation value is zero. A task-defined finite horizon should be represented using time remaining.

## 7. Value Iteration: Algorithm, Contraction Mapping, and Convergence Proof

### 7.1 The Value Iteration Algorithm

Introduced by Richard Bellman (1957), **Value Iteration** solves the Bellman optimality equations by turning them into an iterative update rule:

```
Algorithm: Value Iteration
-------------------------------------------------------------------------------------
Input: MDP <S, A, T, R, gamma>, convergence threshold epsilon > 0
Output: Optimal policy pi* and state utilities U*

1. Initialize U_0(s) = 0 for all s in S
2. Repeat:
       delta <- 0
       For each state s in S:
           U_{i+1}(s) <- max_{a in A(s)} sum_{s'} P(s' | s, a) [ R(s, a, s') + gamma U_i(s') ]
           delta <- max(delta, |U_{i+1}(s) - U_i(s)|)
       i <- i + 1
   Until delta < epsilon * (1 - gamma) / gamma

3. Extract optimal policy pi*:
       pi*(s) = argmax_{a in A(s)} sum_{s'} P(s' | s, a) [ R(s, a, s') + gamma U_{final}(s') ]
-------------------------------------------------------------------------------------
```

- **Per-Iteration Computational Complexity:** Sweeping all states requires $|\mathcal{S}|$ updates, each testing $|\mathcal{A}|$ actions across $|\mathcal{S}|$ successor states:
  $$\text{Complexity per iteration} = \mathcal{O}(|\mathcal{S}|^2 |\mathcal{A}|)$$

#### Concrete Worked Calculation: Value Iteration Update at State $(1, 1)$ (Slide 13)
To observe the Bellman update in action, consider computing the updated utility for the start cell $s = (1, 1)$ in the $4 \times 3$ grid world where step reward $R(s) = -0.04$ and discount factor is $\gamma$:

$$U_{i+1}(1, 1) \leftarrow \max_{a \in \{\text{Up}, \text{Left}, \text{Down}, \text{Right}\}} \sum_{s'} P(s' \mid (1, 1), a) \left[ R((1, 1), a, s') + \gamma U_i(s') \right]$$

Evaluating the expected return for each candidate action under stochastic grid transitions (0.8 intended direction, 0.1 perpendicular drift left, 0.1 perpendicular drift right, bouncing back off outer boundaries):
- **Action Up (U):**
  $$0.8[-0.04 + \gamma U_i(1, 2)] + 0.1[-0.04 + \gamma U_i(2, 1)] + 0.1[-0.04 + \gamma U_i(1, 1)]$$
- **Action Left (L):**
  $$0.9[-0.04 + \gamma U_i(1, 1)] + 0.1[-0.04 + \gamma U_i(1, 2)]$$
- **Action Down (D):**
  $$0.9[-0.04 + \gamma U_i(1, 1)] + 0.1[-0.04 + \gamma U_i(2, 1)]$$
- **Action Right (R):**
  $$0.8[-0.04 + \gamma U_i(2, 1)] + 0.1[-0.04 + \gamma U_i(1, 2)] + 0.1[-0.04 + \gamma U_i(1, 1)]$$

Comparing the resulting values, the agent sets $U_{i+1}(1, 1)$ to the maximum and extracts the greedy action:
$$\pi^*(1, 1) = \text{Up}$$

---

### 7.2 Why Does Value Iteration Work?

1. **Fixed-Point Convergence:** Bellman updates converge to a **fixed point**: the unique mathematical solution to the Bellman optimality equations. State utilities stabilize once all long-term future rewards are fully incorporated.
2. **Premature Policy Emergence:** In practical applications, the extracted greedy policy $\pi_i$ almost always stabilizes to the true optimal policy $\pi^*$ **significantly earlier** than full numerical utility convergence ($U_i \to U^*$).

---

### 7.3 Rigorous Mathematical Proof of Contraction Mapping

We prove that Value Iteration is mathematically guaranteed to converge to a unique fixed point regardless of initial values.

#### Step 1: Formal Operator and Metric Space Definition
Let $\mathcal{U} = \mathbb{R}^{|\mathcal{S}|}$ be the space of state utility vectors. We equip $\mathcal{U}$ with the **Max Norm** (Chebyshev norm):

$$\|U - V\|_\infty = \max_{s \in \mathcal{S}} |U(s) - V(s)|$$

The max norm evaluates the largest difference between any two corresponding elements in two vectors, measuring the overall distance between utility vectors by their worst-case element.
The space $(\mathbb{R}^{|\mathcal{S}|}, \|\cdot\|_\infty)$ is a complete metric space (a **Banach Space**).
Define the **Bellman Optimality Operator** $B: \mathbb{R}^{|\mathcal{S}|} \to \mathbb{R}^{|\mathcal{S}|}$:

$$(B U)(s) = \max_{a \in \mathcal{A}(s)} \sum_{s' \in \mathcal{S}} P(s' \mid s, a) [R(s, a, s') + \gamma U(s')]$$

---

#### Step 2: The Contraction Property
We prove that operator $B$ is a **contraction mapping with factor $\gamma$**:

$$\|B U - B V\|_\infty \le \gamma \|U - V\|_\infty$$

*Proof:*
Fix an arbitrary state $s \in \mathcal{S}$. Let $a^* = \arg\max_a \sum_{s'} P(s' \mid s, a)[R + \gamma U(s')]$ and $a^\dagger = \arg\max_a \sum_{s'} P(s' \mid s, a)[R + \gamma V(s')]$.
Then:

$$(B U)(s) - (B V)(s) \le \sum_{s'} P(s' \mid s, a^*) [R + \gamma U(s')] - \sum_{s'} P(s' \mid s, a^*) [R + \gamma V(s')]$$

$$= \gamma \sum_{s'} P(s' \mid s, a^*) [U(s') - V(s')]$$

$$\le \gamma \sum_{s'} P(s' \mid s, a^*) \max_{s''} |U(s'') - V(s'')|$$

$$= \gamma \|U - V\|_\infty \sum_{s'} P(s' \mid s, a^*) = \gamma \|U - V\|_\infty$$

By reversing the roles of $U$ and $V$, we obtain $(B V)(s) - (B U)(s) \le \gamma \|U - V\|_\infty$.
Therefore, for all states $s$:

$$|(B U)(s) - (B V)(s)| \le \gamma \|U - V\|_\infty$$

Taking the maximum over all $s \in \mathcal{S}$:

$$\|B U - B V\|_\infty \le \gamma \|U - V\|_\infty \quad \blacksquare$$

---

#### Step 3: Existence, Uniqueness, and Error Bounds
By the **Banach Fixed-Point Theorem**:
1. There exists a **unique** fixed point $U^* \in \mathbb{R}^{|\mathcal{S}|}$ satisfying $B U^* = U^*$.
2. Starting from any arbitrary initial vector $U_0$, the sequence $U_{i+1} = B U_i$ converges exponentially fast to $U^*$:
   $$\|U_i - U^*\|_\infty \le \gamma^i \|U_0 - U^*\|_\infty$$
3. Since initial utilities $U_0(s) = 0$ satisfy $\|U_0 - U^*\|_\infty \le \frac{R_{\max}}{1 - \gamma}$, the absolute number of iterations $N$ required to guarantee an error smaller than $\epsilon$ is:
   $$\gamma^N \left( \frac{R_{\max}}{1 - \gamma} \right) \le \epsilon \implies N = \left\lceil \frac{\log(R_{\max} / (\epsilon(1 - \gamma)))}{\log(1 / \gamma)} \right\rceil$$

---

#### Step 4: Stopping Criterion and Policy Loss Bound
Using the triangle inequality:

$$\|U_{i+1} - U^*\|_\infty \le \sum_{k=0}^\infty \|U_{i+k+1} - U_{i+k}\|_\infty \le \sum_{k=0}^\infty \gamma^k \|U_{i+1} - U_i\|_\infty = \frac{1}{1 - \gamma} \|U_{i+1} - U_i\|_\infty$$

Also, $\|U_{i+1} - U^*\|_\infty \le \gamma \|U_i - U^*\|_\infty \le \gamma (\|U_i - U_{i+1}\|_\infty + \|U_{i+1} - U^*\|_\infty)$, which rearranges to:

$$\|U_{i+1} - U^*\|_\infty \le \frac{\gamma}{1 - \gamma} \|U_{i+1} - U_i\|_\infty$$

Therefore, halting when $\|U_{i+1} - U_i\|_\infty < \epsilon \frac{1 - \gamma}{\gamma}$ mathematically guarantees that:

$$\|U_{i+1} - U^*\|_\infty < \epsilon$$

Furthermore, if the utility estimation error is bounded by $\epsilon$, the **Policy Loss** (the maximum loss incurred by following policy $\pi_i$ instead of $\pi^*$) is strictly bounded:

$$\|U^{\pi_i} - U^*\|_\infty \le \frac{2 \epsilon \gamma}{1 - \gamma}$$

---

### 7.4 Error Dynamics and Policy Loss in the 4x3 World

To understand the empirical behavior of Value Iteration, consider **Figure 17.8** from Russell and Norvig (2020), which plots the maximum utility error and policy loss as a function of iteration count on the $4 \times 3$ grid world:

```
Max Error /   ^
Policy Loss   |
        1.0 - +=====+ (Policy Loss: Green Dashed Curve)
            | |  \  |
        0.8 - |   \  \ (Max Error ||U_i - U||: Red Solid Curve)
            | |    \  \
        0.6 - |     \  \
            | |      \  \
        0.4 - |       \  \
            | |        \  \
        0.2 - |         \  \
            | |          \  \________
        0.0 - *-----------+----------+----------+----------->
              0     2     4     6    8    10   12   14
                           Number of Iterations
```

#### Analytical Observations:
1. **Max Error Curve ($\|U_i - U^*\|$):** Starts near $1.0$ and declines steadily and smoothly, requiring roughly $10$ to $14$ iterations to decay close to zero.
2. **Policy Loss Curve ($\|U^{\pi_i} - U^*\|$):**
   - Holds flat at $1.0$ for iterations $0$ to $2$ while utility values propagate across neighboring cells.
   - **Plummets abruptly to exactly zero at iteration 4!**
3. **The Core Takeaway:**
   The greedy policy $\pi_i$ becomes **strictly optimal long before the utility numbers themselves converge**. Because action selection relies only on the *relative rank ordering* of action expected utilities ($\arg\max_a Q(s, a)$), small numerical estimation errors in $U_i$ do not perturb the argmax decision. This explains why monitoring policy changes is often a far more efficient stopping criterion than waiting for full numerical utility convergence.

---

## 8. Policy Iteration: Algorithm, Implementation Walkthrough, and Theoretical Guarantees

### 8.1 The Policy Iteration Algorithm

Introduced by Ronald Howard (1960), **Policy Iteration** manipulates policies directly rather than searching exclusively in utility space:

```
Algorithm: Policy Iteration
-------------------------------------------------------------------------------------
Input: MDP <S, A, T, R, gamma>
Output: Optimal policy pi*

1. Initialize policy pi_0 arbitrarily (e.g., random actions)
2. Repeat:
       a) Policy Evaluation:
          Solve for utilities U^{pi_i} under policy pi_i:
          U_i(s) = sum_{s'} P(s' | s, pi_i(s)) [ R(s, pi_i(s), s') + gamma U_i(s') ]
          [Note: For small state spaces, solve exact linear system (O(|S|^3));
                 For large state spaces, execute iterative updates until convergence.]

       b) Policy Improvement:
          unchanged <- True
          For each state s in S:
              pi_{i+1}(s) <- argmax_{a in A(s)} sum_{s'} P(s' | s, a) [ R(s, a, s') + gamma U_i(s') ]
              If pi_{i+1}(s) != pi_i(s):
                  unchanged <- False

          i <- i + 1
   Until unchanged == True (pi_{i+1}(s) == pi_i(s) for all states s in S)

3. Return pi* = pi_i
-------------------------------------------------------------------------------------
```

---

#### Concrete Example: Setting Up the Policy Evaluation Linear System (Slide 15)
To evaluate an arbitrary policy $\pi_i$ (such as the policy depicted in Slide 15: $\pi(1,1)=\text{Up}, \pi(1,2)=\text{Up}, \dots$):
Recall that under a fixed policy $\pi_i$, there is **NO max operator**! The Bellman expectation equation decomposes into:
$$U_i(s) = \sum_{s'} P(s' \mid s, \pi_i(s)) [R(s, \pi_i(s), s') + \gamma U_i(s')] = R(s) + \gamma \sum_{s'} P(s' \mid s, \pi_i(s)) U_i(s')$$

Writing out the exact linear equations for the cells in the $4 \times 3$ grid (with $R(s) = -0.04$):
- **For state $(1, 1)$ with $\pi_i(1, 1) = \text{Up}$:**
  $$U_i(1, 1) = 0.8[-0.04 + \gamma U_i(1, 2)] + 0.1[-0.04 + \gamma U_i(2, 1)] + 0.1[-0.04 + \gamma U_i(1, 1)]$$
- **For state $(1, 2)$ with $\pi_i(1, 2) = \text{Up}$:**
  Intended Up moves to $(1, 3)$ ($0.8$), drift Left bounces back to $(1, 2)$ ($0.1$), and drift Right hits the obstacle wall and bounces back to $(1, 2)$ ($0.1$), yielding a net wall-bounce probability of $0.1 + 0.1 = 0.2$:
  $$U_i(1, 2) = 0.8[-0.04 + \gamma U_i(1, 3)] + 0.2[-0.04 + \gamma U_i(1, 2)]$$
- ... and so on for all non-terminal states in the grid.

Because this forms a closed system of $|\mathcal{S}|$ linear equations with $|\mathcal{S}|$ unknowns, it can be solved directly in $\mathcal{O}(|\mathcal{S}|^3)$ time via exact matrix inversion:
$$\mathbf{U}^{\pi_i} = (\mathbf{I} - \gamma \mathbf{T}^{\pi_i})^{-1} \mathbf{R}^{\pi_i}$$
completely eliminating the need for iterative approximation when $|\mathcal{S}|$ is small!

---

### 8.2 Concrete Implementation Walkthrough: Policy Improvement at State (1, 1)

To observe the policy improvement step in action, consider the start cell `(1, 1)` in the $4 \times 3$ grid world where step reward $R(s) = -0.04$ and discount factor is $\gamma$.

```
      1        2        3        4
   +--------+--------+--------+--------+
 3 |   >    |   >    |   >    |  +1    |
   +--------+--------+--------+--------+
 2 |   ^    | [WALL] |   ^    |  -1    |
   +--------+--------+--------+--------+
 1 |  [?]   |   <    |   ^    |   <    |
   +--------+--------+--------+--------+
     (1,1)
```

At state $(1, 1)$, the policy improvement step checks whether any available action $a \in \{\text{Up}, \text{Left}, \text{Down}, \text{Right}\}$ achieves a higher expected utility than current policy $\pi_i(1, 1)$:

$$\pi_{i+1}(1, 1) = \arg\max_{a \in \mathcal{A}} \sum_{s'} P(s' \mid (1, 1), a) \left[ R((1, 1), a, s') + \gamma U(s') \right]$$

#### Expanding the Four Candidate Action Equations:
Recall that an action moves in the intended direction with probability $0.8$, and drifts perpendicular left and right with probability $0.1$ each. Bumping into the grid boundary or obstacle bounces back into the originating cell:

1. **Action Up (U):**
   - Intended Up ($0.8$) moves to `(1, 2)`.
   - Drift Right ($0.1$) moves to `(2, 1)`.
   - Drift Left ($0.1$) hits the left wall and **bounces back to `(1, 1)`**.
   $$Q((1, 1), \text{Up}) = 0.8[-0.04 + \gamma U(1, 2)] + 0.1[-0.04 + \gamma U(2, 1)] + 0.1[-0.04 + \gamma U(1, 1)]$$

2. **Action Left (L):**
   - Intended Left ($0.8$) hits the left boundary and **bounces back to `(1, 1)`**.
   - Drift Down ($0.1$) hits the bottom boundary and **bounces back to `(1, 1)`**.
   - Combining both wall bounces gives a net probability of $0.8 + 0.1 = \mathbf{0.90}$ of remaining in `(1, 1)`.
   - Drift Up ($0.1$) successfully enters `(1, 2)`.
   $$Q((1, 1), \text{Left}) = 0.9[-0.04 + \gamma U(1, 1)] + 0.1[-0.04 + \gamma U(1, 2)]$$

3. **Action Down (D):**
   - Intended Down ($0.8$) hits the bottom boundary and **bounces back to `(1, 1)`**.
   - Drift Left ($0.1$) hits the left boundary and **bounces back to `(1, 1)`**.
   - Combining both wall bounces gives a net probability of $0.8 + 0.1 = \mathbf{0.90}$ of remaining in `(1, 1)`.
   - Drift Right ($0.1$) successfully enters `(2, 1)`.
   $$Q((1, 1), \text{Down}) = 0.9[-0.04 + \gamma U(1, 1)] + 0.1[-0.04 + \gamma U(2, 1)]$$

4. **Action Right (R):**
   - Intended Right ($0.8$) enters `(2, 1)`.
   - Drift Up ($0.1$) enters `(1, 2)`.
   - Drift Down ($0.1$) hits the bottom boundary and **bounces back to `(1, 1)`**.
   $$Q((1, 1), \text{Right}) = 0.8[-0.04 + \gamma U(2, 1)] + 0.1[-0.04 + \gamma U(1, 2)] + 0.1[-0.04 + \gamma U(1, 1)]$$

The agent evaluates all four scalar values, selects the maximum, and updates $\pi_{i+1}(1, 1) \leftarrow a_{\text{best}}$.

---

### 8.3 Rigorous Proof of the Policy Improvement Theorem

> **Policy Improvement Theorem (Sutton & Barto, Section 4.2):**
> Let $\pi$ and $\pi'$ be any pair of deterministic policies such that for all $s \in \mathcal{S}$:
>
> $$Q^\pi(s, \pi'(s)) \ge U^\pi(s)$$
>
> Then the policy $\pi'$ is globally at least as good as $\pi$:
>
> $$U^{\pi'}(s) \ge U^\pi(s), \quad \forall s \in \mathcal{S}$$
>
> If strict inequality holds at any state, then $U^{\pi'}(s) > U^\pi(s)$ at that state.

#### Proof:
By definition, $U^\pi(s) \le Q^\pi(s, \pi'(s))$. Expanding $Q^\pi$:

$$U^\pi(s) \le \sum_{s'} P(s' \mid s, \pi'(s)) \left[ R(s, \pi'(s), s') + \gamma U^\pi(s') \right]$$

$$= \mathbb{E}^{\pi'} \left[ R(S_0, \pi'(S_0), S_1) + \gamma U^\pi(S_1) \;\middle|\; S_0 = s \right]$$

Now substitute the inequality $U^\pi(S_1) \le Q^\pi(S_1, \pi'(S_1))$ into the right-hand side:

$$U^\pi(s) \le \mathbb{E}^{\pi'} \left[ R_0 + \gamma \mathbb{E}^{\pi'} [R_1 + \gamma U^\pi(S_2)] \;\middle|\; S_0 = s \right]$$

$$= \mathbb{E}^{\pi'} \left[ R_0 + \gamma R_1 + \gamma^2 U^\pi(S_2) \;\middle|\; S_0 = s \right]$$

Continuing this recursive expansion indefinitely (telescoping sum):

$$U^\pi(s) \le \mathbb{E}^{\pi'} \left[ R_0 + \gamma R_1 + \gamma^2 R_2 + \dots + \gamma^k U^\pi(S_k) \;\middle|\; S_0 = s \right]$$

Taking the limit as $k \to \infty$, since $\gamma < 1$ and rewards are bounded, $\lim_{k \to \infty} \gamma^k U^\pi(S_k) = 0$:

$$U^\pi(s) \le \mathbb{E}^{\pi'} \left[ \sum_{t=0}^\infty \gamma^t R_t \;\middle|\; S_0 = s \right] = U^{\pi'}(s) \quad \blacksquare$$

Because there are only $|\mathcal{A}|^{|\mathcal{S}|}$ possible distinct policies, Policy Iteration must terminate at the global optimum $\pi^*$ in a finite number of steps.

---

### 8.4 Grand Comparison: Value Iteration vs. Policy Iteration

*(Transcribed from NUS CS5446 Lecture Slide 56)*

| Aspect | Value Iteration | Policy Iteration |
| :--- | :--- | :--- |
| **Initialization** | Arbitrary utility values (e.g., $U(s) = 0$) | Arbitrary initial policy $\pi_0$ |
| **Main Update** | **Bellman Optimality Update:**<br>$U_{i+1}(s) \leftarrow \max_{a \in \mathcal{A}(s)} \sum_{s'} P(s' \mid s, a)[R(s, a, s') + \gamma U_i(s')]$ | **1. Policy Evaluation:**<br>$U_i(s) = \sum_{s'} P(s' \mid s, \pi_i(s))[R(s, \pi_i(s), s') + \gamma U_i(s')]$ *(or use iterative updates)*<br>**2. Policy Improvement:**<br>$\pi_{i+1}(s) = \arg\max_a \sum_{s'} P(s' \mid s, a)[R(s, a, s') + \gamma U_i(s')]$ |
| **Termination** | Utility updates stop when:<br>$\max_s |U_{i+1}(s) - U_i(s)| < \epsilon \frac{1-\gamma}{\gamma}$ | Policy improvement stops when:<br>$\pi_{i+1}(s) = \pi_i(s), \quad \forall s \in \mathcal{S}$ |
| **Convergence** | Utilities converge to a **fixed point**<br>*(Solution to Bellman optimality equation)* | Policy converges to a **stable policy**<br>*(Utilities satisfy Bellman expectation equation for current policy)* |
| **Optimality** | Final policy extracted from stable utilities is guaranteed optimal | Final stable policy $\pi^*$ is guaranteed optimal |
| **Per-Iteration Cost** | $\mathcal{O}(|\mathcal{S}|^2 |\mathcal{A}|)$ | **Policy Evaluation (exact):** $\mathcal{O}(|\mathcal{S}|^3)$<br>**Policy Improvement:** $\mathcal{O}(|\mathcal{S}|^2 |\mathcal{A}|)$<br>*(For each state, evaluate all actions over successor states)* |
| **Remarks** | **Simpler update, but more iterations needed.** | **Fewer iterations, but each iteration is more computationally intensive.** |

---

---

## 9. Foundations of Reinforcement Learning: Reward-Based Learning & Planning

### 9.1 The Paradigm Shift: Unknown Transition Models $\mathcal{T}$ and Reward Functions $\mathcal{R}$

In classical planning and exact Markov Decision Processes, the autonomous agent operates with full privileged access to the transition dynamics $P(s' \mid s, a)$ and reward landscape $R(s, a, s')$. Under these known-model assumptions, finding the optimal policy is purely a computational problem of offline dynamic programming.

However, in realistic autonomous operations—from navigating uncharted planetary terrain to robotic manipulation and strategic gameplay—the environmental physics and reward mechanisms are **completely unknown** in advance:
- The agent does not know what state will result from executing action $a$ in state $s$.
- The agent does not know what reward will be received until it is experienced.
- The agent must learn to behave optimally through active trial-and-error interaction with the environment.

This shifts the computational paradigm from offline planning to **Reinforcement Learning (RL)**:

```
+-------------------------------------------------------------------------------+
|                      THE AGENT-ENVIRONMENT INTERACTION LOOP                   |
+-------------------------------------------------------------------------------+
|                                                                               |
|                               +---------------+                               |
|                               |  ENVIRONMENT  |                               |
|                               +---------------+                               |
|                                 ^     |     |                                 |
|                         Action  |     |     | Reward R_{t+1}                  |
|                          A_t    |     |     |                                 |
|                                 |     v     v                                 |
|                               +---------------+                               |
|                               |     AGENT     |                               |
|                               +---------------+                               |
|                                       |                                       |
|                                       v                                       |
|                      Derives Optimal Policy pi*(s)                            |
|                      Maximizing Cumulative Return                             |
|                                                                               |
+-------------------------------------------------------------------------------+
```

The fundamental characteristics of the reinforcement learning framework are:
1. **Percept-Based State Observation:** The agent observes the current state $S_t \in \mathcal{S}$ through sensory percepts.
2. **Action Execution:** The agent selects and executes an action $A_t \in \mathcal{A}$.
3. **Environment Transition:** The environment transitions to successor state $S_{t+1} \sim P(\cdot \mid S_t, A_t)$ according to unknown physical dynamics.
4. **Reinforcement Feedback:** The environment emits an immediate scalar reward $R_{t+1} \sim R(S_t, A_t, S_{t+1})$. Feedback may be received incrementally along the way (dense rewards) or only upon reaching terminal states (sparse rewards).
5. **Core Objective:** Discover a policy $\pi^*: \mathcal{S} \to \mathcal{A}$ that maximizes expected cumulative discounted returns.

---

### 9.2 The Action-Utility Function $Q(s, a)$ in Model-Free Decision Making

In classical MDP planning with a known transition model, the agent can select actions by executing a one-step expectation lookahead over state utilities $U(s')$:

$$\pi^*(s) = \arg\max_{a \in \mathcal{A}(s)} \sum_{s' \in \mathcal{S}} P(s' \mid s, a) [R(s, a, s') + \gamma U(s')]$$

However, when transition probabilities $P(s' \mid s, a)$ are unknown, the agent cannot compute this summation directly! To overcome this barrier, reinforcement learning elevates the **Action-Utility Function (Q-Function)** to primary status:

$$Q(s, a) = \sum_{s' \in \mathcal{S}} P(s' \mid s, a) [R(s, a, s') + \gamma U(s')] = \sum_{s' \in \mathcal{S}} P(s' \mid s, a) \left[ R(s, a, s') + \gamma \max_{a' \in \mathcal{A}(s')} Q(s', a') \right]$$

- **Interpretation:** $Q(s, a)$ represents the expected cumulative discounted reward of taking action $a$ in state $s$, and thereafter behaving optimally according to $\pi^*$.
- **State Utility Duality:** The optimal state utility is simply the maximum action-utility over available choices:
  $$U(s) = \max_{a \in \mathcal{A}(s)} Q(s, a)$$
- **Model-Free Action Selection:** Crucially, once $Q(s, a)$ is learned, optimal action selection requires **zero knowledge of the transition model $P(s' \mid s, a)$**:
  $$\pi^*(s) = \arg\max_{a \in \mathcal{A}(s)} Q(s, a)$$
  The agent merely evaluates the $|\mathcal{A}|$ numbers stored in its $Q$-table for state $s$ and picks the maximum, completely bypassing one-step probability lookahead!

---

### 9.3 The Four-Quadrant Taxonomy of Reinforcement Learning Agents

Reinforcement learning approaches are structured across two fundamental architectural dimensions:

```
+-----------------------------------+-----------------------------------+-----------------------------------+
| Dimensional Axis                  | Model-Based [MB]                  | Model-Free [MF]                   |
+-----------------------------------+-----------------------------------+-----------------------------------+
| Passive Learning                  | Adaptive Dynamic Programming      | Monte Carlo (Direct Utility)      |
| (Prediction / Evaluation: pi -> U)| (ADP)                             | Temporal Difference Learning (TD) |
+-----------------------------------+-----------------------------------+-----------------------------------+
| Active Learning                   | Active Adaptive Dynamic           | Monte Carlo Control               |
| (Control / Optimization: pi*)     | Programming (Active ADP)          | TD Control: Q-Learning & SARSA    |
+-----------------------------------+-----------------------------------+-----------------------------------+
```

1. **Model-Based [MB] vs. Model-Free [MF]:**
   - **Model-Based:** The agent explicitly learns an approximation of the environmental physics $\hat{P}(s' \mid s, a)$ and reward function $\hat{R}(s, a, s')$ from observed samples, and then uses dynamic programming (Policy Iteration or Value Iteration) to solve the estimated MDP.
   - **Model-Free:** The agent bypasses model learning entirely, directly updating state utilities $U(s)$ or action-utilities $Q(s, a)$ from raw trajectory experience without ever reconstructing transition tables.
2. **Passive Learning vs. Active Learning:**
   - **Passive Learning (Prediction Problem):** The agent's policy $\pi$ is fixed and determines its behavior. The agent's task is solely to evaluate how good the policy is by learning the utility function $U^\pi(s)$ or $Q^\pi(s, a)$ (analogous to the Policy Evaluation step in Policy Iteration).
   - **Active Learning (Control Problem):** The agent is not bound to a fixed policy; it must decide which actions to take, actively balancing **exploration** (trying new actions to gather information) versus **exploitation** (choosing actions with known high payoffs) to discover the globally optimal policy $\pi^*$.

---

## 10. Passive Reinforcement Learning: Policy Evaluation with Unknown Environment Models

In Passive Reinforcement Learning, the agent executes a fixed policy $\pi$ across multiple episodes (trials). The agent observes the sequence of states visited and rewards received, and its mathematical objective is to estimate the true expected utility $U^\pi(s)$ under $\pi$:

$$U^\pi(s) = \mathbb{E}_\pi \left[ \sum_{t=0}^\infty \gamma^t R(S_t, \pi(S_t), S_{t+1}) \;\middle|\; S_0 = s \right]$$

---

### 10.1 Mathematical Framework: Trajectories, Returns, and Expected Returns

1. **Trials (Episodes / Trajectories):** A trial is a finite sequence of state-action-reward transitions starting from an initial state $s_0$ and terminating upon reaching an absorbing goal state $s_g$:
   $$\tau = (s_0, a_0, r_1, s_1, a_1, r_2, \dots, s_T)$$
2. **Trajectory Return ($G_t$):** The discounted sum of rewards accumulated from time step $t$ onwards until the end of the episode:
   $$G_t = R_{t+1} + \gamma R_{t+2} + \gamma^2 R_{t+3} + \dots = \sum_{k=0}^\infty \gamma^k R_{t+k+1}$$
3. **Expected Return:** The utility of a state $s$ under policy $\pi$ is the expected return from that state onwards:
   $$U^\pi(s) = \mathbb{E}_\pi [G_t \mid S_t = s]$$
   *(In standard episodic grid world benchmarks, the discount factor is conventionally set to $\gamma = 1$, so returns represent simple unweighted sums of step rewards).*

---

### 10.2 Model-Based Passive RL: Adaptive Dynamic Programming (ADP)

**Adaptive Dynamic Programming (ADP)** is the canonical model-based approach to passive reinforcement learning.

#### Core Principle:
1. **Learn the Model from Experience:** Track transition frequencies $N_{s' \mid s, a}[s, a, s']$ and visit counts $N[s, a]$. By the law of large numbers, the empirical relative frequency converges to the **Maximum Likelihood Estimate (MLE)** of the transition probability:
   $$\hat{P}(s' \mid s, a) = \frac{N_{s' \mid s, a}[s, a, s']}{N[s, a]}$$
   Similarly, estimate the expected reward $\hat{R}(s, a, s')$ by averaging observed rewards upon entering state $s'$.
2. **Solve the Estimated MDP:** Substitute the learned model $\hat{P}$ and $\hat{R}$ into the linear **Bellman Expectation System**:
   $$U^\pi(s) = \sum_{s'} \hat{P}(s' \mid s, \pi(s)) \left[ \hat{R}(s, \pi(s), s') + \gamma U^\pi(s') \right]$$
   Since policy $\pi$ is fixed, this is a system of $|\mathcal{S}|$ linear equations with $|\mathcal{S}|$ unknowns (no $\max$ operator!), solvable in $\mathcal{O}(|\mathcal{S}|^3)$ time via Gaussian elimination or matrix inversion.

#### Concrete Worked Numerical Example: Transition Probability Estimation from $s = (3, 3)$
Consider an agent evaluating a fixed policy $\pi$ in the $4 \times 3$ Grid World across three observed trials (with step reward $R = -0.04$):

```
Trial 1: (1,1) -> (1,2) -> (1,3) -> (1,2) -> (1,3) -> (2,3) -> (3,3) -> (4,3)[+1]
Trial 2: (1,1) -> (1,2) -> (1,3) -> (2,3) -> (3,3) -> (3,2) -> (3,3) -> (4,3)[+1]
Trial 3: (1,1) -> (2,1) -> (3,1) -> (3,2) -> (4,2)[-1]
```

Let us compute the estimated transition probability distribution $\hat{P}(s' \mid s, \pi(s))$ from state $s = (3, 3)$:
- In Trial 1: From $(3, 3)$, the agent moved Right to terminal goal $(4, 3)$. (Count = 1 for $(4, 3)$)
- In Trial 2 (1st visit): From $(3, 3)$, the agent drifted Down to $(3, 2)$. (Count = 1 for $(3, 2)$)
- In Trial 2 (2nd visit): From $(3, 3)$, the agent moved Right to terminal goal $(4, 3)$. (Count = 2 for $(4, 3)$)
- In Trial 3: State $(3, 3)$ was not visited.

Total visits to state $(3, 3)$ across all trials: $N(3, 3) = 1 + 2 = 3$.
The Maximum Likelihood transition estimates are:
$$\hat{P}((4, 3) \mid (3, 3), \pi(3, 3)) = \frac{N((4, 3) \mid (3, 3))}{N(3, 3)} = \frac{2}{3} \approx \mathbf{0.67}$$
$$\hat{P}((3, 2) \mid (3, 3), \pi(3, 3)) = \frac{N((3, 2) \mid (3, 3))}{N(3, 3)} = \frac{1}{3} \approx \mathbf{0.33}$$

The ADP agent then writes the linear Bellman equation for $(3, 3)$:
$$U^\pi(3, 3) = \frac{2}{3} [-0.04 + 1.0(1.0)] + \frac{1}{3} [-0.04 + 1.0 \cdot U^\pi(3, 2)]$$

#### Complete Algorithm Specification: `Passive-ADP-Learner`
```
-------------------------------------------------------------------------------------
function PASSIVE-ADP-LEARNER(percept) returns an action
  inputs: percept, a percept indicating current state s' and reward signal r
  persistent: pi, a fixed policy
              mdp, an MDP with model P, rewards R, actions A, discount gamma
              U, a table of utilities for states, initially empty
              N_{s'|s, a}, a table of outcome count vectors indexed by state and action
              s, a, the previous state and action, initially null

  if s' is new then U[s'] <- 0
  if s is not null then
      increment N_{s'|s, a}[s, a][s']
      R[s, a, s'] <- r
      add a to A[s]
      P(. | s, a) <- NORMALIZE(N_{s'|s, a}[s, a])   // Maximum Likelihood Estimation
      U <- POLICY-EVALUATION(pi, U, mdp)            // Solve linear Bellman system
  s, a <- s', pi[s']
  return a
-------------------------------------------------------------------------------------
```

---

### 10.3 Model-Free Passive RL 1: Direct Utility Estimation (Monte Carlo Learning)

**Monte Carlo (MC) Learning** (historically termed *Direct Utility Estimation*) evaluates a policy without ever building a transition model.

#### Core Principle:
The expected return $U^\pi(s) = \mathbb{E}_\pi [G_t \mid S_t = s]$ is estimated directly by computing the **empirical arithmetic average of observed returns** across all visits to state $s$:

$$U^\pi(s) \leftarrow \frac{1}{N(s)} \sum_{i=1}^{N(s)} G_t^{(i)}$$

Where $G_t^{(i)} = \sum_{k=0}^\infty \gamma^k R(S_{t+k+1})$ is the observed return from the $i$-th visit to state $s$ until episode termination.

#### Detailed Worked Calculations for States $(1, 1)$ and $(1, 2)$ (with $\gamma = 1$):
Using the identical three trajectories from Section 10.2:

1. **Trial 1 Calculations:**
   - Path: $(1,1) \to (1,2) \to (1,3) \to (1,2) \to (1,3) \to (2,3) \to (3,3) \to (4,3)[+1]$
   - **For $(1, 1)$:** 7 non-terminal transitions ($7 \times -0.04 = -0.28$) plus terminal reward $+1.0$:
     $$G_0 = 7(-0.04) + 1.0 = \mathbf{0.72}$$
   - **For $(1, 2)$ [First Visit at Step 1]:** 6 transitions to terminal goal ($6 \times -0.04 = -0.24$) plus $+1.0$:
     $$G_1 = 6(-0.04) + 1.0 = \mathbf{0.76}$$
   - **For $(1, 2)$ [Second Visit at Step 3]:** 4 transitions to terminal goal ($4 \times -0.04 = -0.16$) plus $+1.0$:
     $$G_3 = 4(-0.04) + 1.0 = \mathbf{0.84}$$

2. **Trial 2 Calculations:**
   - Path: $(1,1) \to (1,2) \to (1,3) \to (2,3) \to (3,3) \to (3,2) \to (3,3) \to (4,3)[+1]$
   - **For $(1, 1)$:** 7 non-terminal transitions plus $+1.0$:
     $$G_0 = 7(-0.04) + 1.0 = \mathbf{0.72}$$
   - **For $(1, 2)$:** 6 non-terminal transitions plus $+1.0$:
     $$G_1 = 6(-0.04) + 1.0 = \mathbf{0.76}$$

3. **Trial 3 Calculations:**
   - Path: $(1,1) \to (2,1) \to (3,1) \to (3,2) \to (4,2)[-1]$
   - **For $(1, 1)$:** 4 non-terminal transitions ($4 \times -0.04 = -0.16$) plus terminal penalty $-1.0$:
     $$G_0 = 4(-0.04) - 1.0 = \mathbf{-1.24}$$
   - State $(1, 2)$ was not visited in Trial 3.

4. **Sample Averaging Across Visits:**
   $$U^\pi(1, 1) = \frac{0.72 + 0.72 + (-1.24)}{3} = \frac{0.20}{3} \approx \mathbf{0.067}$$
   $$U^\pi(1, 2) = \frac{0.76 + 0.84 + 0.76}{3} = \frac{2.36}{3} \approx \mathbf{0.79}$$

#### Theoretical Properties of Monte Carlo Learning:
- **Strictly Unbiased:** $\mathbb{E}[G_t] = U^\pi(s)$. Every sample return is an unbiased observation of the true expected value.
- **High Variance:** Returns depend on the entire stochastic sequence of downstream transitions until termination, causing high sample variance and slow empirical convergence.
- **Delayed Episode-End Updates:** The agent must wait until the episode terminates before computing $G_t$ and updating utilities; impossible to use in non-terminating continuing tasks.
- **Lack of Bellman Consistency:** Monte Carlo treats each state as an isolated supervised regression target. If the estimated utility of successor state $(1, 2)$ changes, the utility of $(1, 1)$ is not updated until $(1, 1)$ is re-visited in subsequent episodes!

---

### 10.4 Model-Free Passive RL 2: Temporal Difference Learning (TD(0))

**Temporal Difference (TD) Learning** (Sutton, 1988) combines the best features of Monte Carlo (model-free learning from raw experience) and dynamic programming (bootstrapping from successor estimates).

#### Core Intuition: Online Bellman Consistency
Rather than waiting for the final terminal reward, TD enforces local Bellman consistency after **every single transition** $s \to s'$:
In the true MDP equilibrium, the Bellman expectation equation requires:
$$U^\pi(s) = R(s, \pi(s), s') + \gamma U^\pi(s')$$

Whenever a transition $s \xrightarrow{r} s'$ occurs, the quantity $r + \gamma U^\pi(s')$ serves as an immediate, noisy sample of the expected return. The difference between this sample and the current estimate $U^\pi(s)$ is the **Temporal Difference Error**:

$$\delta_t = R(s, \pi(s), s') + \gamma U^\pi(s') - U^\pi(s)$$

#### The TD(0) Update Rule:
$$U^\pi(s) \leftarrow U^\pi(s) + \alpha \left[ R(s, \pi(s), s') + \gamma U^\pi(s') - U^\pi(s) \right]$$

Where:
- **TD Target:** $R(s, \pi(s), s') + \gamma U^\pi(s')$ (the observed immediate reward plus the discounted estimated value of the next state).
- **TD Error:** $\delta_t = R + \gamma U^\pi(s') - U^\pi(s)$.
- **Learning Rate $\alpha$:** Controls step size. For mathematical convergence to the true value, $\alpha$ must decay across visits $n$ to state $s$ according to the **Robbins-Monro conditions**:
  $$\sum_{n=1}^\infty \alpha_n = \infty \quad \text{and} \quad \sum_{n=1}^\infty \alpha_n^2 < \infty \quad \left(\text{e.g., } \alpha(n) = \frac{1}{n}\right)$$

#### Detailed Worked Numerical Step: Updating $U^\pi(1, 3)$
Suppose after the first trial, the agent's current utility estimates are:
$$U^\pi(1, 3) = \frac{0.80 + 0.88}{2} = 0.84, \quad U^\pi(2, 3) = 0.92$$
Assume step reward $R = -0.04$ and $\gamma = 1.0$.

1. **The Equilibrium Discrepancy:**
   According to the Bellman equation, if the agent moves from $(1, 3)$ into $(2, 3)$, the long-run value of $(1, 3)$ must satisfy:
   $$U^\pi(1, 3) = R + \gamma U^\pi(2, 3) = -0.04 + 1.0(0.92) = \mathbf{0.88}$$
   However, the current estimate is $U^\pi(1, 3) = 0.84$. It is lagging behind and must be updated!
2. **Computing the TD Update (with $\alpha = 0.5$):**
   $$\delta = R + \gamma U^\pi(2, 3) - U^\pi(1, 3) = -0.04 + 0.92 - 0.84 = +0.04$$
   $$U^\pi(1, 3) \leftarrow 0.84 + 0.5(0.04) = 0.84 + 0.02 = \mathbf{0.86}$$
   The utility estimate moves from $0.84$ to $0.86$, successfully closing half the gap toward the long-run target of $0.88$!

#### Algorithm Specification: `Passive-TD-Learner`
```
-------------------------------------------------------------------------------------
function PASSIVE-TD-LEARNER(percept) returns an action
  inputs: percept, a percept indicating current state s' and reward signal r
  persistent: pi, a fixed policy
              s, a, the previous state and action, initially null
              U, a table of utilities for states, initially empty
              N_s, a table of frequencies for states, initially zero

  if s' is new then U[s'] <- 0
  if s is not null then
      increment N_s[s]
      alpha <- 1.0 / N_s[s]
      U[s] <- U[s] + alpha * (r + gamma * U[s'] - U[s])   // TD Target: r + gamma U[s']
  s, a <- s', pi[s']
  return a
-------------------------------------------------------------------------------------
```

---

### 10.5 The Unified Spectrum: $n$-Step TD and $\text{TD}(\lambda)$

Temporal Difference learning and Monte Carlo estimation are not isolated techniques, but extreme endpoints of a continuous spectrum parameterized by the backup horizon $n$:

```
+-------------------------------------------------------------------------------+
|                       THE n-STEP TD CONTINUUM SPECTRUM                        |
+-------------------------------------------------------------------------------+
|                                                                               |
|   1-step TD          2-step TD          3-step TD          infinity-step TD   |
|     TD(0)                                                    (Monte Carlo)    |
|       o                  o                  o                      o          |
|       |                  |                  |                      |          |
|       v                  v                  v                      v          |
|      (s')               (s'')              (s''')               (terminal)    |
|   Bootstrap          Bootstrap          Bootstrap              Full Return    |
|   U(S_{t+1})         U(S_{t+2})         U(S_{t+3})             No Bootstrap   |
|                                                                               |
+-------------------------------------------------------------------------------+
```

1. **The $n$-Step Return ($G_t^{(n)}$):**
   $$G_t^{(n)} = R_{t+1} + \gamma R_{t+2} + \dots + \gamma^{n-1} R_{t+n} + \gamma^n U^\pi(S_{t+n})$$
   - When $n = 1$: $G_t^{(1)} = R_{t+1} + \gamma U^\pi(S_{t+1})$ (Standard 1-step TD).
   - When $n = \infty$: $G_t^{(\infty)} = \sum_{k=0}^\infty \gamma^k R_{t+k+1}$ (Full Monte Carlo return).
2. **The $n$-Step TD Update:**
   $$U^\pi(S_t) \leftarrow U^\pi(S_t) + \alpha \left( G_t^{(n)} - U^\pi(S_t) \right)$$
3. **$\text{TD}(\lambda)$ (Forward-View):**
   Rather than picking a single arbitrary horizon $n$, $\text{TD}(\lambda)$ computes a **geometric weighted average** of all possible $n$-step returns, where the $n$-th step return is weighted by $(1 - \lambda) \lambda^{n-1}$ for $\lambda \in [0, 1]$:
   $$G_t^\lambda = (1 - \lambda) \sum_{n=1}^\infty \lambda^{n-1} G_t^{(n)}$$

#### Mathematical Proof of the Normalizing Constant:
For $G_t^\lambda$ to represent a valid statistical expectation, the sum of weights over all $n \in \{1, 2, \dots, \infty\}$ must equal exactly 1:
$$\sum_{n=1}^\infty (1 - \lambda) \lambda^{n-1} = (1 - \lambda) \sum_{k=0}^\infty \lambda^k$$
Since $\lambda < 1$, the geometric series evaluates to $\sum_{k=0}^\infty \lambda^k = \frac{1}{1 - \lambda}$. Substituting:
$$(1 - \lambda) \cdot \frac{1}{1 - \lambda} = 1 \quad \blacksquare$$

#### Asymptotic Convergence Proof:
- **Case $\lambda \to 0$:**
  $$G_t^{\lambda=0} = (1 - 0) \lambda^0 G_t^{(1)} + 0 = G_t^{(1)} = R_{t+1} + \gamma U^\pi(S_{t+1})$$
  $\text{TD}(\lambda)$ converges identically to standard 1-step $\text{TD}(0)$.
- **Case $\lambda \to 1$:**
  As $\lambda \to 1$, all finite weights $(1 - \lambda) \lambda^{n-1} \to 0$. The weight shifts entirely to the terminal boundary condition $G_t^{(\infty)}$:
  $$G_t^{\lambda=1} = G_t^{(\infty)} = \sum_{k=0}^\infty \gamma^k R_{t+k+1}$$
  $\text{TD}(\lambda)$ converges identically to Monte Carlo estimation.
- **Backward-View Mechanization via Eligibility Traces:**
  In practice, the forward-view requires waiting for future events. $\text{TD}(\lambda)$ is efficiently implemented online in the **backward-view** using **Eligibility Traces** $e_t(s)$:
  $$e_t(s) = \begin{cases} \gamma \lambda e_{t-1}(s) + 1 & \text{if } s = S_t \\ \gamma \lambda e_{t-1}(s) & \text{otherwise} \end{cases}$$
  $$U(s) \leftarrow U(s) + \alpha \delta_t e_t(s) \quad \text{for all } s \in \mathcal{S}$$
  where $\delta_t = R_{t+1} + \gamma U(S_{t+1}) - U(S_t)$ is the standard 1-step TD error.

---

### 10.6 Empirical Showdown & Comprehensive Comparison: ADP vs. TD(0) vs. MC

#### Empirical Convergence Dynamics in the $4 \times 3$ Grid World:
- **Adaptive Dynamic Programming (ADP):** Demonstrates ultra-rapid convergence, driving Root-Mean-Square (RMS) utility error close to zero within **20 to 30 trials**. Because ADP constructs a global transition matrix, each observed transition propagates information globally across all states.
- **Temporal Difference Learning (TD):** Requires **400 to 500 trials** to achieve comparable accuracy. It exhibits significant early oscillations because updates propagate locally across single steps, but it requires no model and minimal computation per step.
- **Monte Carlo Learning (MC):** Suffers from extreme sample variance, requiring thousands of trials to stabilize.

#### Grand 9-Dimensional Comparison Matrix:
The complete mathematical and operational comparison between the three foundational passive learning paradigms is summarized below:

| Feature / Aspect | Adaptive Dynamic Programming (ADP) | Temporal Difference Learning (TD(0)) | Monte Carlo Learning (MC) |
| :--- | :--- | :--- | :--- |
| **Core Governing Equation** | $U^\pi(s) = \sum_{s'} \hat{P}(s' \mid s, \pi(s))[\hat{R} + \gamma U^\pi(s')]$ | $U^\pi(s) \leftarrow U^\pi(s) + \alpha (R + \gamma U^\pi(s') - U^\pi(s))$ | $U^\pi(s) \leftarrow \frac{1}{N(s)} \sum_{i=1}^{N(s)} G_t^{(i)}$ |
| **Update Style** | **Full Bellman Backup:** Makes state agree with *all* possible successors via model | **Sampled Bellman Backup:** Makes state agree with *observed* successor | **Empirical Averaging:** Makes state agree with full observed trajectory return |
| **Updates per Transition** | **Global / Many:** Sweeps and updates all states via model inversion | **Local / One:** Updates only the single visited state $s$ | **Batch / Episode:** Updates all visited states once after episode ends |
| **Model Required?** | **Yes:** Must learn or know transition model $\hat{T}$ and rewards $\hat{R}$ | **No:** Completely model-free | **No:** Completely model-free |
| **Data Efficiency** | **High:** Extracts maximal information from each transition tuple | **Moderate:** Learns incrementally from online samples | **Low:** Requires many full episodes to average out variance |
| **Computation per Update** | **Heavy:** Solves system of $|\mathcal{S}|$ linear equations ($\mathcal{O}(\|\mathcal{S}\|^3)$) | **Light:** Scalar arithmetic update ($\mathcal{O}(1)$) | **Light:** Running average update ($\mathcal{O}(1)$ per state) |
| **When Updates Occur** | After each transition or periodic model-planning sweep | Immediately after every step ($s \xrightarrow{r} s'$) | Only after episode reaches terminal state |
| **Bootstrapping?** | **Yes:** Uses current utility estimates $U(s')$ from the model | **Yes:** Uses current utility estimate $U(s')$ of successor state | **No:** Uses actual realized returns $G_t$, zero bootstrapping |
| **Statistical Tradeoff** | **Low Variance, High Initial Model Bias:** Bootstraps from empirical model | **Lower Variance, Moderate Bias:** Bootstraps from current sample estimates | **Zero Bias, High Variance:** No bootstrapping; high trajectory noise |

---

## 11. Active Reinforcement Learning: Control and Optimal Policy Synthesis

In **Active Reinforcement Learning**, the agent is no longer constrained by a fixed policy. Its goal is **Control**: discovering the optimal policy $\pi^*(s)$ that maximizes expected cumulative reward in an environment where transition dynamics $\mathcal{T}$ and rewards $\mathcal{R}$ are unknown.

---

### 11.1 The Control Problem & Generalized Policy Iteration (GPI)

All active reinforcement learning algorithms embody the foundational principle of **Generalized Policy Iteration (GPI)** (Sutton & Barto, 2018):

```
                       Evaluation
                 Q --------------> q_pi
                 ^                  |
                 |                  |
                 |                  v
               pi <-------------- greedy(Q)
                       Improvement
```

GPI formalizes control as two interacting, concurrent processes:
1. **Policy Evaluation:** Making the value function or action-value function $Q(s, a)$ consistent with the current policy $\pi$. This can be performed using ADP, Monte Carlo, or Temporal Difference methods.
2. **Policy Improvement:** Making the policy $\pi$ greedier with respect to current value estimates: $\pi(s) \leftarrow \arg\max_a Q(s, a)$.

As the policy becomes greedier, the value function changes; as the value function is updated, the greedy policy changes. These two processes push and pull against each other until they stabilize at the unique global equilibrium: $\pi = \pi^*$ and $Q = Q^*$.

---

### 11.2 Model-Based Active RL: Active Adaptive Dynamic Programming (Active ADP)

In Active ADP, the agent learns the transition model $\hat{P}(s' \mid s, a)$ and reward model $\hat{R}(s, a, s')$ by counting outcomes, exactly as in passive ADP. However, instead of evaluating a fixed policy, the agent solves the **Bellman Optimality Equation**:

$$U(s) = \max_{a \in \mathcal{A}(s)} \sum_{s'} \hat{P}(s' \mid s, a) \left[ \hat{R}(s, a, s') + \gamma U(s') \right]$$

and extracts the policy:
$$\pi^*(s) = \arg\max_{a \in \mathcal{A}(s)} \sum_{s'} \hat{P}(s' \mid s, a) \left[ \hat{R}(s, a, s') + \gamma U(s') \right]$$

#### The Fatal Failure Mode of the Greedy ADP Learner:
What happens if the agent acts strictly **greedily** with respect to its current learned model $\hat{P}$?
Consider the agent at state $(2, 1)$ in the $4 \times 3$ Grid World:

```
      1        2        3        4
   +--------+--------+--------+--------+
 3 |        |        |        |  +1    |
   +--------+--------+--------+--------+
 2 |        | [WALL] |        |  -1    |
   +--------+--------+--------+--------+
 1 | START  | (2,1)  |  (3,1) |        |
   +--------+--------+--------+--------+
```

1. In early random trials, the agent might execute `Right` from $(2, 1)$, moving to $(3, 1) \to (3, 2) \to (3, 3) \to (4, 3)[+1]$ or $(4, 2)[-1]$.
2. The agent finds a path to $+1$ by going Right. Its learned model gives moving `Right` a positive estimated utility.
3. However, the agent has **never tried moving `Left` from $(2, 1)$**! Moving Left would take the agent back to $(1, 1)$, allowing it to climb safely around the left side of the obstacle $(1, 2) \to (1, 3) \to (2, 3) \to (3, 3) \to (4, 3)$, completely avoiding the $-1$ hazard at $(4, 2)$.
4. Because the agent has never tried `Left`, its model assigns `Left` zero visits ($N=0$) and zero utility.
5. Because the agent is **greedy**, it compares `Right` ($U > 0$) against `Left` ($U = 0$) and always chooses `Right`!
6. **The Trap:** Because it always chooses `Right`, it **never gathers data about `Left`**. The transition model for `Left` never improves. The agent is permanently locked into executing a suboptimal policy!
7. **Empirical Consequence:** In experiments (RN Figure 22.6), a Greedy ADP learner plateaus with a permanent **policy loss of $\approx 0.35$**, failing to discover the optimal policy.

> **Fundamental Principle:** Actions in active reinforcement learning possess a **Dual Role**:
> 1. **Exploitation:** Maximizing immediate reward based on current knowledge.
> 2. **Exploration (Active Sensing):** Probing the environment to gather information and improve the model for superior future decision making.

---

### 11.3 The Exploration vs. Exploitation Dilemma

The central challenge of active reinforcement learning is balancing **Exploration** (trying unfamiliar actions to uncover hidden high-reward pathways) and **Exploitation** (leveraging known actions to accumulate reliable reward).

#### Greedy in the Limit of Infinite Exploration (GLIE):
To guarantee convergence to the true optimal policy $\pi^*$, an exploration policy must satisfy the **GLIE** condition:
1. **Infinite Exploration:** Every state-action pair $(s, a)$ must be visited infinitely often as trials $t \to \infty$:
   $$\lim_{t \to \infty} N_t(s, a) = \infty \quad \text{for all } s \in \mathcal{S}, a \in \mathcal{A}$$
   This ensures that no optimal action is permanently overlooked due to incomplete information.
2. **Asymptotic Greediness:** As time progresses, the exploration policy must converge to a strictly greedy policy:
   $$\lim_{t \to \infty} P(A_t = \arg\max_a Q(S_t, a)) = 1$$

#### $\epsilon$-Greedy Action Selection:
The simplest GLIE-compliant exploration mechanism is the $\epsilon$-greedy rule:
$$\pi(a \mid s) = \begin{cases} 1 - \epsilon + \frac{\epsilon}{|\mathcal{A}(s)|} & \text{if } a = \arg\max_{a'} Q(s, a') \\ \frac{\epsilon}{|\mathcal{A}(s)|} & \text{if } a \ne \arg\max_{a'} Q(s, a') \end{cases}$$
By decaying $\epsilon$ across time steps $t$ (e.g., $\epsilon_t = \frac{1}{t}$), the policy satisfies the GLIE properties. However, pure $\epsilon$-greedy exploration is **blind**: it chooses completely at random among non-greedy actions, treating a lethal cliff and an unexplored gold mine identically!

---

### 11.4 Optimism in the Face of Uncertainty & Exploration Functions

A far more efficient, principled exploration paradigm is **Optimism in the Face of Uncertainty**:
Instead of selecting random actions, the agent prioritizes actions that are **not yet proven to be bad** by assigning inflated optimistic utilities to rarely visited state-action pairs.

#### The Exploration Function $f(u, n)$:
The Bellman optimality equation is modified to incorporate an **Exploration Function** $f(u, n)$:

$$U^+(s) \leftarrow \max_{a \in \mathcal{A}(s)} f\left( \sum_{s'} P(s' \mid s, a) [R(s, a, s') + \gamma U^+(s')], \; N(s, a) \right)$$

Where:
- $u = \sum_{s'} P(s' \mid s, a) [R + \gamma U^+(s')]$ is the current expected utility estimate.
- $n = N(s, a)$ is the number of times action $a$ has been executed in state $s$.
- $U^+(s)$ denotes the optimistic utility estimate.

#### Properties of $f(u, n)$:
1. **Monotonically Increasing in $u$:** For a fixed visit count, higher estimated reward is preferred.
2. **Monotonically Decreasing in $n$:** For a fixed value estimate, less-visited actions are assigned higher exploration bonuses.

#### Canonical Exploration Function Formulation (Slide 56):
$$f(u, n) = \begin{cases} R^+ & \text{if } n < N_e \\ u & \text{otherwise} \end{cases}$$

Where:
- $R^+$ is an **optimistic upper bound** on the best possible reward achievable in the environment.
- $N_e$ is a fixed integer threshold parameter enforcing that every action must be tried at least $N_e$ times before its empirical estimate is accepted.

#### Empirical Triumph in the $4 \times 3$ Grid World:
When an active ADP learner is equipped with the exploration function ($R^+ = 2, N_e = 5$):
- At state $(2, 1)$, moving `Left` has visit count $N < 5$, so its utility is artificially inflated to $f(u, N) = R^+ = 2 > U(\text{Right})$.
- The agent is compelled to explore `Left`, successfully discovering the safe path around the obstacle.
- **Experimental Result (Slide 57 / RN Figure 22.7):** Both the RMS utility error and **policy loss plummet to exactly 0 within 20 trials**, completely overcoming the suboptimal convergence of Greedy ADP!

---

### 11.5 Model-Free Active Control 1: Monte Carlo Control

In **Monte Carlo Control**, the agent estimates action-utilities $Q(s, a)$ rather than state utilities $U(s)$, eliminating the need for a transition model:

1. **Policy Evaluation:** At the end of each episode, update action-values by averaging returns across observed visits to state-action pairs:
   $$Q(s, a) \leftarrow \frac{1}{N(s, a)} \sum_{i=1}^{N(s, a)} G_t^{(i)}$$
2. **Policy Improvement:** Update behavior policy to favor high-value or underexplored actions via an exploration function:
   $$\pi(s) = \arg\max_{a \in \mathcal{A}(s)} f(Q(s, a), N(s, a))$$

---

### 11.6 Model-Free Active Control 2: Temporal Difference Control (SARSA vs. Q-Learning)

The two most foundational model-free reinforcement learning algorithms are **SARSA** and **Q-Learning**. They represent the classic dichotomy between **On-Policy** and **Off-Policy** learning:

```
+-------------------------------------------------------------------------------+
|                       ON-POLICY VS. OFF-POLICY TD CONTROL                     |
+-------------------------------------------------------------------------------+
|                                                                               |
|   SARSA (On-Policy):                                                          |
|   (S_t, A_t) ----> R_{t+1}, S_{t+1} ----> A_{t+1} ~ pi(S_{t+1})               |
|   Target evaluates the action A_{t+1} ACTUALLY EXECUTED by the exploring policy|
|   Q(S_t, A_t) <- Q(S_t, A_t) + alpha [ R_{t+1} + gamma Q(S_{t+1}, A_{t+1}) - Q ]|
|                                                                               |
|   Q-LEARNING (Off-Policy):                                                    |
|   (S_t, A_t) ----> R_{t+1}, S_{t+1} ----> max_{a'} Q(S_{t+1}, a')             |
|   Target evaluates the GREEDY OPTIMAL action, ignoring exploratory moves      |
|   Q(S_t, A_t) <- Q(S_t, A_t) + alpha [ R_{t+1} + gamma max_a' Q(S_{t+1}, a') - Q ]|
|                                                                               |
+-------------------------------------------------------------------------------+
```

#### 1. SARSA (State-Action-Reward-State-Action): On-Policy TD Control
- **Update Mechanism:** Operates on the full quintuple $(s, a, r, s', a')$:
  $$Q(s, a) \leftarrow Q(s, a) + \alpha \left[ R(s, a, s') + \gamma Q(s', a') - Q(s, a) \right]$$
- **On-Policy Definition:** The target policy used to evaluate future outcomes is **identical** to the behavior policy used to select actions (e.g., $\epsilon$-greedy).
- In SARSA, $a'$ is the action *actually selected and executed* in state $s'$.
- **Behavioral Consequence:** Because $a'$ may be a random exploratory action, SARSA incorporates the risk of the agent's exploratory mistakes directly into $Q(s, a)$. If choosing action $a$ leads to a state near a lethal hazard where an exploratory blunder would cause catastrophe, SARSA sharply downweights $Q(s, a)$, learning a **cautious, risk-averse policy**.

#### 2. Q-Learning: Off-Policy TD Control (Watkins, 1989)
- **Update Mechanism:** Operates on transition quadruples $(s, a, r, s')$:
  $$Q(s, a) \leftarrow Q(s, a) + \alpha \left[ R(s, a, s') + \gamma \max_{a' \in \mathcal{A}(s')} Q(s', a') - Q(s, a) \right]$$
- **Off-Policy Definition:** The target policy is **different** from the behavior policy.
  - Target Policy: Purely greedy policy $\arg\max_{a'} Q(s', a')$.
  - Behavior Policy: Exploratory policy (e.g., $\epsilon$-greedy).
- **Behavioral Consequence:** Q-learning directly estimates the optimal action-utility $Q^*(s, a)$ regardless of which actions are actually executed during exploration. It assumes that future actions will be chosen optimally, learning an **aggressive, globally optimal policy** but ignoring the online risks of exploration.

#### Side-by-Side Controller Algorithms (Poole & Mackworth, 2018):
```
-------------------------------------------------------------------------------------
CONTROLLER: SARSA(S, A, gamma, alpha)         CONTROLLER: Q-LEARNING(S, A, gamma, alpha)
-------------------------------------------------------------------------------------
initialize Q[S, A] arbitrarily                initialize Q[S, A] arbitrarily
observe initial state s                       observe initial state s
select action a using policy based on Q       repeat:
repeat:                                           select action a using policy based on Q
    execute action a                              execute action a
    observe reward r and state s'                 observe reward r and state s'
    select action a' using policy based on Q      Q[s, a] <- Q[s, a] + alpha * (r +
    Q[s, a] <- Q[s, a] + alpha * (r +                        gamma * max_{a'} Q[s', a'] - Q[s, a])
               gamma * Q[s', a'] - Q[s, a])       s <- s'
    s <- s'; a <- a'                          until termination
until termination
-------------------------------------------------------------------------------------
```

---

### 11.7 Benchmark Case Study: The Cliff Walking Environment (Sutton & Barto Example 6.6)

The differences between SARSA and Q-learning are classically illustrated by the **Cliff Walking** benchmark:

```
+-------------------------------------------------------------------------------+
|                        THE CLIFF WALKING BENCHMARK                            |
+-------------------------------------------------------------------------------+
|                                                                               |
|   4  .   .   .   .   .   .   .   .   .   .   .   .    <-- SARSA Safe Path     |
|   3  .   .   .   .   .   .   .   .   .   .   .   .        (Reward: -25)       |
|   2  .   .   .   .   .   .   .   .   .   .   .   .                            |
|   1 [S] [C   L   I   F   F   W   A   L   K] [G]       <-- Q-Learning Optimal  |
|      1   2   3   4   5   6   7   8   9  10  11  12        (Reward: -50 online)|
|                                                                               |
|   Start: S = (1, 1), Goal: G = (1, 12)                                        |
|   The Cliff: (1, 2) to (1, 11) with Reward R = -100 (resets to Start)         |
|   Step Penalty: R = -1 for all other grid transitions                         |
|                                                                               |
+-------------------------------------------------------------------------------+
```

#### Operational Dynamics under $\epsilon$-Greedy Exploration ($\epsilon = 0.1$):
- **Q-Learning Behavior:**
  Q-learning learns the values of the optimal policy, which follows the shortest path directly along row 2, right adjacent to the Cliff edge (length 13 steps). However, because the agent acts with $\epsilon = 0.1$ exploration, whenever it is in row 2, it has a $10\%$ chance of selecting a random action, frequently steering directly off the cliff into the $-100$ penalty! Consequently, its **online performance during learning is poor** (average episode return $\approx -50$).
- **SARSA Behavior:**
  SARSA evaluates what the exploring agent *actually does*. It factors in the fact that walking next to the cliff carries a catastrophic probability of accidental suicide. It downweights the edge path and learns the **safer path** looping through row 4, safely away from the cliff edge! Although the path is longer, the agent rarely falls into the cliff, achieving **far superior online return** (average episode return $\approx -25$).
- **Asymptotic Convergence under GLIE ($\epsilon \to 0$):**
  If $\epsilon$ decays to zero over time, the risk of exploratory accidents disappears. In this asymptotic limit, **both SARSA and Q-learning converge to the identical optimal path along the cliff edge**!

---

### 11.8 Grand Comparison: SARSA vs. Q-Learning

| Dimension | SARSA | Q-Learning |
| :--- | :--- | :--- |
| **Algorithm Type** | **On-Policy TD Control** | **Off-Policy TD Control** |
| **Action-Value Update Rule** | $Q(s, a) \leftarrow Q(s, a) + \alpha [R + \gamma Q(s', a') - Q(s, a)]$ | $Q(s, a) \leftarrow Q(s, a) + \alpha [R + \gamma \max_{a'} Q(s', a') - Q(s, a)]$ |
| **Target Action Selection** | Uses $a'$ **actually chosen** by current behavior policy $\pi$ | Uses $a' = \arg\max_{a'} Q(s', a')$ (greedy optimal action) |
| **Exploration Penalty** | **Penalizes risky paths:** Downweights states where exploration causes failure | **Ignores exploratory risk:** Evaluates states assuming optimal future execution |
| **Online Learning Behavior** | **Safer, more cautious:** Higher online cumulative reward during training | **Riskier, aggressive:** Lower online reward during training due to falls |
| **Offline Policy Quality** | Learns near-optimal safe policy relative to exploration rate $\epsilon$ | Learns true optimal policy $Q^*$ directly, independent of behavior policy |
| **Behavior when $\epsilon = 0$** | **Identical to Q-learning:** $a'$ matches $\arg\max_{a'} Q(s', a')$ | **Identical to SARSA:** Greedy policy matches behavior policy |
| **Convergence Guarantee** | Converges to $\pi^*$ if all $(s, a)$ visited infinitely often and $\epsilon, \alpha$ decay | Converges to $Q^*$ if all $(s, a)$ visited infinitely often and $\alpha$ decays |

---

## 12. Summary of Tabular Reinforcement Learning & The Bridge to Deep RL

### 12.1 The Complete 2x2 Tabular Paradigm Matrix

The foundational methods of tabular sequential decision making can be unified under a single structural matrix:

```
+-----------------------------------+-----------------------------------+-----------------------------------+
| Learning Objective                | Model-Based [MB]                  | Model-Free [MF]                   |
+-----------------------------------+-----------------------------------+-----------------------------------+
| **Passive Learning**              | **Adaptive Dynamic Programming**  | **Monte Carlo Prediction (MC)**   |
| Policy Evaluation under fixed pi  | - Learns transition P and R (MLE) | - Unbiased empirical averages     |
| Goal: Compute U^pi or Q^pi        | - Solves linear Bellman system    | **Temporal Difference (TD(0))**   |
|                                   | - High data efficiency, O(|S|^3)  | - Online bootstrapping from s'    |
|                                   |                                   | - Unified by TD(lambda) spectrum  |
+-----------------------------------+-----------------------------------+-----------------------------------+
| **Active Learning**               | **Active Adaptive Dynamic Prog.** | **Monte Carlo Control**           |
| Control / Policy Optimization     | - Policy / Value Iteration on P,R | - Episode-based Q updates         |
| Goal: Compute optimal pi*         | - Greedy ADP fails at (2,1)!      | **Active TD Control:**            |
|                                   | - Explores via f(u, n) bonuses    | - **SARSA:** On-policy (safe)     |
|                                   |                                   | - **Q-Learning:** Off-policy (opt)|
+-----------------------------------+-----------------------------------+-----------------------------------+
```

---

### 12.2 The Curse of Dimensionality & The Transition to Function Approximation

While tabular dynamic programming and tabular reinforcement learning provide exact theoretical convergence guarantees, they share an unavoidable practical barrier: **The Curse of Dimensionality**:
- In tabular representations, every state $s$ and state-action pair $(s, a)$ occupies a distinct entry in an array or hash table.
- In real-world environments—such as Backgammon ($10^{20}$ states), Chess ($10^{40}$ states), Go ($10^{172}$ states), or continuous robotics—it is physically impossible to visit every state even once, let alone satisfy the infinite visit requirements of Robbins-Monro convergence!
- To scale beyond tabular boundaries, the autonomous agent must transition from **memorization** (tabular lookup) to **generalization**: utilizing **Value Function Approximation (Linear Models & Deep Q-Networks)** and **Direct Policy Search (Policy Gradients, REINFORCE, and Actor-Critic architectures)**, which form the core curriculum of **Week 5**.

---

<reviewkit>
<takeaways>
- **The Core MDP Paradigm:** An MDP $\langle \mathcal{S}, \mathcal{A}, \mathcal{T}, \mathcal{R}, \gamma \rangle$ models sequential decision problems in fully observable, stochastic environments where actions influence both immediate rewards and future state distributions.
- **The Markov Property:** Future transitions depend exclusively on the current state and action ($P(S_{t+1} \mid S_t, A_t)$), allowing memoryless optimization without storing historical trajectories.
- **Horizon & Stationarity:** Infinite-horizon discounted formulations ($\gamma < 1$) guarantee bounded cumulative rewards ($U_{\max} \le \frac{R_{\max}}{1 - \gamma}$) and yield time-invariant stationary optimal policies $\pi^*(s)$.
- **Bellman Expectation vs. Optimality Equations:** The Bellman Expectation Equation linearly evaluates a fixed policy ($U^\pi = R^\pi + \gamma T^\pi U^\pi$), while the Bellman Optimality Equation non-linearly defines the global upper bound ($U(s) = \max_a \sum_{s'} P(s' \mid s, a)[R + \gamma U(s')]$).
- **The Q-Function Duality:** Action-utility values $Q(s, a)$ represent the expected return of taking action $a$ in state $s$ and acting optimally thereafter, enabling direct policy extraction ($\pi^*(s) = \arg\max_a Q(s, a)$) without transition probability lookahead.
- **Value Iteration as a Contraction Mapping:** Value Iteration executes iterative Bellman backups ($U_{i+1} \leftarrow B U_i$). By the Banach Fixed-Point Theorem, $B$ is a contraction with factor $\gamma$ under the max norm, guaranteeing geometric convergence to a unique fixed point.
- **Error Dynamics & Policy Loss:** As illustrated in the $4 \times 3$ world (Figure 17.8), policy loss reaches zero far earlier (iteration 4) than utility convergence (iteration 14), because ranking actions under argmax is robust to small value errors.
- **Policy Iteration Efficiency:** Policy Iteration alternates between exact Policy Evaluation ($\mathcal{O}(|\mathcal{S}|^3)$ linear system without max operator) and Policy Improvement ($\mathcal{O}(|\mathcal{S}|^2 |\mathcal{A}|)$). By the Policy Improvement Theorem (Sutton & Barto 4.2), each consecutive policy is monotonically superior, terminating in finite steps.
- **Passive RL Showdown (ADP vs. TD vs. MC):** ADP learns empirical models $\hat{P}, \hat{R}$ and solves global linear Bellman systems with maximal data efficiency (converging in 20-30 trials); Monte Carlo directly averages returns across visits ($U(s) \leftarrow \frac{1}{N(s)}\sum G_t$) with zero bias but high variance and episode-delayed updates; TD(0) bootstraps online from successive state estimates ($U(s) \leftarrow U(s) + \alpha [R + \gamma U(s') - U(s)]$) with low variance and step-level updates.
- **The Unified Spectrum (n-Step TD & TD(lambda)):** $n$-step returns bridge 1-step TD(0) and $\infty$-step Monte Carlo. $\text{TD}(\lambda)$ geometrically weights $n$-step returns with $(1-\lambda)\lambda^{n-1}$, converging to TD(0) as $\lambda \to 0$ and Monte Carlo as $\lambda \to 1$, mechanistically implemented via backward-view eligibility traces.
- **Active ADP Failure & Exploration Functions:** Purely greedy active ADP gets trapped in suboptimal policies (e.g. state $(2,1)$ in $4 \times 3$ Grid World going Right instead of Left) because actions serve a dual role (earning reward vs. gathering information). Exploration functions $f(u, n) = R^+$ if $n < N_e$ else $u$ enforce optimism in the face of uncertainty, driving policy loss to zero in 20 trials.
- **SARSA vs. Q-Learning in Cliff Walking:** SARSA is on-policy, evaluating the action $a'$ actually taken by the behavior policy, learning a safe route away from hazards during $\epsilon$-greedy exploration (return $\approx -25$). Q-learning is off-policy, evaluating target greedy actions $\max_{a'} Q(s', a')$, learning the shortest optimal cliff-edge route but frequently falling off during exploration (return $\approx -50$). Under GLIE ($\epsilon \to 0$), both converge to the optimal path.
</takeaways>

<qquiz src="questions.en.json"/>

<qprompt/>
</reviewkit>

## References

1. Bellman, R. (1957). *Dynamic Programming*. Princeton University Press.
2. Howard, R. A. (1960). *Dynamic Programming and Markov Processes*. MIT Press.
3. Puterman, M. L. (1994). *Markov Decision Processes: Discrete Stochastic Dynamic Programming*. John Wiley & Sons.
4. Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. (Chapters 3, 4, 6, 7, 12).
5. Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4th ed.). Pearson. (Chapter 17: Making Complex Decisions; Chapter 22: Reinforcement Learning).
6. Bertsekas, D. P. (2012). *Dynamic Programming and Optimal Control* (Vol. 1 & 2, 4th ed.). Athena Scientific.
7. Watkins, C. J., & Dayan, P. (1992). Q-learning. *Machine Learning*, 8(3-4), 279-292.
8. Kaelbling, L. P., Littman, M. L., & Moore, A. W. (1996). Reinforcement Learning: A Survey. *Journal of Artificial Intelligence Research*, 4, 237-285.
9. Wirth, C., Akrour, R., Neumann, G., & Fürnkranz, J. (2017). A survey of preference-based reinforcement learning methods. *Journal of Machine Learning Research*, 18(1), 4945-4990.
10. Poole, D. L., & Mackworth, A. K. (2018). *Artificial Intelligence: Foundations of Computational Agents* (2nd ed.). Cambridge University Press. (Chapter 12: Learning to Act: Reinforcement Learning).
11. Gopalan, A., & Teo, Y. M. (2025). *CS4246/5446 Sequential Decision Making under Uncertainty (Version 1.0)*. National University of Singapore (NUS).

---

# Week 5 - Model-Free Reinforcement Learning and Sequential Decision Making: Function Approximation, Deep Q-Networks, Policy Gradients, and Actor-Critic Methods

## Week 5 Reading Guide: From Tabular Lookup to Stable Policy Updates

Week 5 是整門課最重要的「scaling transition」。它不是突然跳到 DQN 或 PPO，而是沿著一條必要鏈條前進：

```text
tabular RL cannot cover |S|
  → approximate V/Q with features
  → approximate Monte Carlo with supervised regression
  → approximate TD with bootstrapped targets
  → deadly triad explains instability
  → DQN adds replay + target network
  → policy gradient removes argmax / supports stochastic or continuous actions
  → actor-critic supplies a learned baseline / critic
  → TRPO/PPO restrict destructive policy updates
```

### Week 5 的每一步要回答什麼

| Section | 核心問題 | 關鍵新增概念 | 主要風險 |
|---|---|---|---|
| 1–2 | 如何讓 value representation 泛化到未見 state？ | features、linear/non-linear approximation | approximation bias |
| 3 | 如何把完整 episode return 變成 regression target？ | MC target、Widrow-Hoff / SGD | high variance、delayed update |
| 4 | 如何不用等 episode 結束就更新？ | TD target、semi-gradient、SARSA/Q-learning | bootstrapping bias |
| 5 | 為何 function approximation + bootstrap + off-policy 會發散？ | deadly triad、Baird counterexample | divergence / catastrophic forgetting |
| 6–7 | 如何讓 deep Q-learning 可訓練？ | experience replay、target network、Double DQN | replay distribution、overestimation |
| 8–9 | 若 action space continuous 或 policy 本身要 stochastic，怎麼辦？ | policy gradient、REINFORCE、baseline | gradient variance |
| 10–11 | 如何同時學 policy 與 value，並避免 policy collapse？ | actor-critic、TRPO、PPO clipping | critic bias、too-large update |

> **最重要的閱讀順序：** 先分清楚「學的是 $V$、$Q$ 還是 $\pi$」，再判斷 target 是 full return 還是 bootstrap；最後才看 replay、baseline、trust region 這些 stabilization devices。這三層若倒過來讀，很容易只記住演算法名稱而不理解它們各自在修補什麼。

<draft>
- 1. Scaling Sequential Decisions: The Necessity of Function Approximation
    - MDP Foundations: Unknown transition dynamics T(s' | s, a) and reward functions R(s, a, s').
    - Passive vs. Active Learning Taxonomy:
        - Passive Learning (Policy Evaluation under fixed pi): Model-Based Adaptive Dynamic Programming (ADP) vs. Model-Free Monte Carlo (MC) prediction & Temporal-Difference (TD) prediction.
        - Active Learning (Control / Policy Optimization for optimal policy pi^*: S -> A): Model-Based Active ADP vs. Model-Free Monte Carlo Control & Active TD Control (Q-learning, SARSA).
    - The Curse of Dimensionality in Tabular Methods: Combinatorial state space explosions (Backgammon 10^20, Chess 10^40, Go 10^172); impossibility of visiting states infinitely often.
    - Three Scaling Paradigms: Value Function Approximation, Policy Search, and Actor-Critic hybrid architectures.
- 2. Linear and Non-Linear Value Function Approximation
    - Conceptual Motivation: The House Price Analogy (Tabular Excel lookup vs. parameterized fitting; compact representation and generalization).
    - Linear vs. Neural Network Approximation: Visualizing the 1D non-linear value function vs. linear approximation vs. neural net curve (Slide 9).
    - Differentiable parameterization of utility: \hat{U}_\theta(s) = g(s; \theta) and \hat{Q}_\theta(s, a) = g(s, a; \theta).
    - Linear Feature Representations: \hat{U}_\theta(s) = \sum \theta_i f_i(s); general form with bias f_0(s) = 1; direct state components form \hat{U}_\theta(s) = \theta_0 + \sum \theta_i s_i.
    - Numerical Walkthrough: Grid World Navigation with coordinates (x, y), weights (0.5, 0.2, 0.1), forward evaluation \hat{U}(1, 1) = 0.8, and coordinate-wise gradient updates.
    - Non-Linear Deep Neural Network Parameterization: Automatic feature extraction from high-dimensional state spaces.
- 3. Approximate Monte Carlo Learning & The Widrow-Hoff (Delta) Rule
    - Supervised Regression Formulation: Collected trial trajectories <(x_j, y_j), u_j>; matching predicted utilities to empirical episode returns u_j.
    - Per-Sample Mean Squared Error Loss: \mathcal{E}_j(s) = (1/2) (\hat{U}_\theta(s) - u_j(s))^2.
    - The Widrow-Hoff (Delta) Rule: \theta_i \leftarrow \theta_i + \alpha (u_j(s) - \hat{U}_\theta(s)) \frac{\partial \hat{U}_\theta(s)}{\partial \theta_i}; linear case \theta_i \leftarrow \theta_i + \alpha (u_j(s) - \hat{U}_\theta(s)) f_i(s).
    - Comprehensive Explanation of Widrow-Hoff (Delta Rule): Historical origin (Bernard Widrow & Ted Hoff 1960 for Adaline); error signal \delta = target - prediction; local immediate error correction.
    - Deep-Dive: Comprehensive contrast between Widrow-Hoff (Delta Rule / Online SGD) and Naive (Batch) Gradient Descent:
        - Mathematical differences in data processing, loss objectives, and gradient computations.
        - Memory and computational complexity (O(d) streaming vs. O(N d) batch memory).
        - Optimization dynamics: Deterministic smooth descent vs. stochastic noisy exploration aiding escape from shallow local optima.
        - Reinforcement Learning suitability: Real-time tracking of non-stationary streams vs. halting for offline batch training.
- 4. Approximate Temporal Difference (TD) Learning: Semi-Gradient TD, SARSA, and Q-Learning
    - Bootstrapping: Replacing full Monte Carlo returns with one-step bootstrapped targets R_{t+1} + \gamma \hat{U}_\theta(S_{t+1}).
    - The Semi-Gradient Mechanism: Why the gradient of the target with respect to \theta is deliberately dropped.
    - Explicit Scalar Parameter Update Equations (Slide 15):
        - State-Utility Value TD(0): \theta_i \leftarrow \theta_i + \alpha [R(s, a, s') + \gamma \hat{U}_\theta(s') - \hat{U}_\theta(s)] \frac{\partial \hat{U}_\theta(s)}{\partial \theta_i}.
        - SARSA (On-Policy Action-Value Control): \theta_i \leftarrow \theta_i + \alpha [R(s, a, s') + \gamma \hat{Q}_\theta(s', a') - \hat{Q}_\theta(s, a)] \frac{\partial \hat{Q}_\theta(s, a)}{\partial \theta_i}.
        - Q-Learning (Off-Policy Action-Value Control): \theta_i \leftarrow \theta_i + \alpha [R(s, a, s') + \gamma \max_{a'} \hat{Q}_\theta(s', a') - \hat{Q}_\theta(s, a)] \frac{\partial \hat{Q}_\theta(s, a)}{\partial \theta_i}.
    - In-Depth Explanation of SARSA:
        - Acronym origin: State-Action-Reward-State-Action (s_t, a_t, r_{t+1}, s_{t+1}, a_{t+1}).
        - On-policy mechanism: Bootstrapping on the action a' actually selected by the current behavioral exploration policy \pi(s').
        - Comparative Case Study: The Cliff Walking Benchmark (why SARSA is safer than Q-learning during online exploration; accounting for exploratory mistakes).
        - Deep RL Incompatibility: Why SARSA cannot easily be combined with Experience Replay (historical transitions from older policies violate on-policy distribution requirements).
- 5. Instabilities in Approximate Utility Learning: The Deadly Triad & Catastrophic Forgetting
    - The Deadly Triad: The destabilizing convergence of (1) Function Approximation, (2) Bootstrapping, and (3) Off-Policy Learning.
    - Baird\'s Counterexample: A 7-state star MDP proving unbounded parameter divergence under linear function approximation with off-policy TD (exact parameters: \theta_0 = <1, 1, 1, 1, 1, 1, 10, 1>^T, \gamma = 0.99, r = 0, b(dashed) = 6/7, w_8 exploding to infinity).
    - Mathematical Anatomy: Stationary Distributions, Contraction Mappings, and Why On-Policy Self-Corrects.
    - Three Surgical Strategies to Tame Bootstrapping: Pure Monte Carlo, n-Step / GAE, Target Networks.
    - Catastrophic Forgetting: Global weight sharing causes localized gradient updates to overwrite representations of rarely visited regions; Experience Replay defense.
- 6. Deep Q-Networks (DQN) for High-Dimensional Control
    - End-to-end representation learning from raw pixel frames (Atari 2600 benchmark, Mnih et al., Nature 2015).
    - Input Preprocessing: 4-frame temporal stacking (84 x 84 x 4) to capture velocity, acceleration, and ball direction.
    - Architecture Evolution: NIPS 2013 (16 8x8 stride 4, 32 4x4 stride 2, 256 FC, 18 actions) and Nature 2015 (32 8x8, 64 4x4, 64 3x3, 512 FC).
    - Two Core Stabilization Breakthroughs: Experience Replay Memory (D) and Fixed Target Network (Q(s, a; \theta^-)).
    - The 6-Step DQN Algorithmic Training Loop (Slide 24).
    - Case Study: Gymnasium Lunar Lander (LunarLander-v3, 8D continuous observation, 4 discrete actions, MLP architecture, Episode #1 crash vs. Episode #1500 touchdown).
- 7. Advanced DQN Extensions & Theoretical Limitations
    - Modern DQN Extensions: Standard DQN, Double DQN (DDQN; Van Hasselt et al., 2016), Multi-Step Learning (n-step), Distributional RL (C51), Prioritized Experience Replay (PER), and Rainbow.
    - Where DQN Struggles (Three Inherent Bottlenecks):
        1. Intractable continuous action maximization (\arg\max_a Q(s, a) is intractable in continuous manifolds).
        2. Linear action scoring cost growing directly with |A|.
        3. Rigidity of deterministic greedy policies vs. inherent randomness and entropy in multimodal tasks.
- 8. Policy Search & The Policy Gradient Theorem
    - Parameterized stochastic policies: \pi_\theta(a | s) = Pr(A_t = a | S_t = s; \theta).
    - Softmax policy formulation with temperature / softness parameter \beta: \pi_\theta(a | s) = \frac{\exp(\beta h_\theta(s, a))}{\sum_b \exp(\beta h_\theta(s, b))}.
    - Policy Value Objective: J(\theta) = \sum_s p_0(s) \sum_a \pi_\theta(a | s) Q^{\pi_\theta}(s, a).
    - The Policy Gradient Theorem (Sutton et al., 1999): \nabla_\theta J(\theta) = E_{\pi_\theta} [ Q^{\pi_\theta}(s, a) \nabla_\theta \log \pi_\theta(a | s) ].
- 9. The REINFORCE Algorithm & Baseline Variance Reduction
    - REINFORCE (Williams, 1992): Monte Carlo policy gradient via episode rollouts G_t = \sum_{k=t}^T \gamma^{k-t} R_{k+1}.
    - The Log-Derivative / Likelihood Ratio Trick: \nabla_\theta \pi_\theta = \pi_\theta \nabla_\theta \log \pi_\theta.
    - Update rule: \theta \leftarrow \theta + \alpha \sum_t \gamma^t G_t \nabla_\theta \log \pi_\theta(a_t | s_t).
    - High Variance Challenge: Compounding random returns across long horizons.
    - Baseline Subtraction: Proof that subtracting state-dependent baseline b(s) leaves expected gradient unbiased while drastically shrinking variance: E_{a \sim \pi_\theta} [b(s) \nabla_\theta \log \pi_\theta(a | s)] = 0.
    - Numerical Demonstration: 4-episode sample returns yielding variance collapse from 15,275 to 28.4 under baseline subtraction.
    - Empirical Learning Curves (Sutton & Barto Figure 13.1): Un-baselined REINFORCE (1000+ episodes) vs. Baselined REINFORCE (100-200 episodes).
- 10. Actor-Critic Architectures
    - Architectural Dualism: Actor (parameterized policy \pi_\theta) + Critic (parameterized value estimator \hat{U}_w(s)).
    - 1-Step TD Advantage Estimator: A(s_t, a_t) \approx \delta_t = R_{t+1} + \gamma \hat{U}_w(s_{t+1}) - \hat{U}_w(s_t).
    - Dual Update Mechanics (Slide 40): Critic minimizes TD error via semi-gradient descent; Actor ascends policy gradient scaled by \delta_t.
    - Deep-Dive: Is Vanilla Actor-Critic On-Policy or Off-Policy?
    - Spectrum of Actor-Critic Variants: A2C, A3C, ACER, DDPG, and Soft Actor-Critic (SAC).
- 11. Advanced Policy Search: TRPO and PPO
    - The Fragility of Vanilla Policy Gradients: Non-linear step sizes cause catastrophic policy collapse (performance cliff).
    - Monotonic Policy Improvement Guarantee (Kakade & Langford, 2002): Local surrogate objective M_i(\theta_i) lower-bounding the true objective \rho(\theta_i).
    - Trust Region Policy Optimization (TRPO; Schulman et al., 2015): Enforcing a max KL divergence constraint \max_s D_{KL}(\pi_{old} || \pi) \le \delta.
    - Proximal Policy Optimization (PPO; Schulman et al., 2017):
        - Probability ratio: r_t(\theta) = \frac{\pi_\theta(a_t | s_t)}{\pi_{\theta_{old}}(a_t | s_t)}.
        - Clipped Loss: \mathcal{L}^{CLIP}(\theta) = \hat{E}_t [ \min( r_t(\theta) \hat{A}_t, \, \text{clip}(r_t(\theta), 1 - \epsilon, 1 + \epsilon) \hat{A}_t ) ].
        - Dissecting the clipping mechanism: Case 1 (\hat{A}_t > 0) vs. Case 2 (\hat{A}_t < 0) as a pessimistic lower bound.
        - PPO as an Actor-Critic architecture.
    - Modern Model-Free RL Complete Taxonomy (Slide 50).
</draft>

## 1. Scaling Sequential Decisions: The Necessity of Function Approximation

In classical Markov Decision Processes (MDPs), we assume complete access to the environment model: the transition probability matrix $\mathcal{T}(s' \mid s, a) = P(s' \mid s, a)$ and the reward function $\mathcal{R}(s, a, s')$. Under these conditions, exact dynamic programming algorithms—such as Value Iteration and Policy Iteration—compute the exact optimal utility $U^*(s)$ and policy $\pi^*(s)$.

However, in real-world intelligent systems:
1. **Unknown Environment Dynamics:** The agent possesses **zero prior knowledge** of transition physics or reward distributions ($T$ and $R$ are unknown). It can only interact with the environment through trial-and-error experience tuples $(s, a, r, s')$.
2. **Combinatorial State Space Explosions (The Curse of Dimensionality):** Storing utilities or action-values in tabular lookup structures (arrays mapping $\mathcal{S} \to \mathbb{R}$) becomes physically impossible as state dimensionality grows. The number of states grows exponentially with the number of state variables and features.

```
+------------------+------------------------------+------------------------------------+
| Problem Domain   | State Space Scale |S|        | Feasibility of Tabular Methods     |
+------------------+------------------------------+------------------------------------+
| Toy Gridworld    | 10^1 to 10^2 states          | Exact Dynamic Programming / Tables |
| Backgammon       | ~10^20 states                | Tabular methods fail completely    |
| Chess            | ~10^40 states                | Tabular methods fail completely    |
| Go               | ~10^172 states               | More states than atoms in universe |
| Continuous Drone | \mathbb{R}^6 (Uncountably Inf)| Lookups are mathematically invalid |
+------------------+------------------------------+------------------------------------+
```

Even an astronomical state space like Go ($10^{172}$) is considered relatively small compared to continuous real-world robotics and physical control! In such spaces:
- An agent **cannot visit all states infinitely often** (violating classical tabular convergence theorems).
- In fact, an agent cannot visit more than an infinitesimal fraction ($10^{-100}\text{th}$) of the state space even over years of exploration.

---

### 1.1 The Taxonomy of Reinforcement Learning: Passive vs. Active Learning

Reinforcement Learning divides along two primary dimensions: **Passive vs. Active Learning**, and **Model-Based vs. Model-Free Methods**.

```
                           REINFORCEMENT LEARNING TAXONOMY
                                          |
         +--------------------------------+--------------------------------+
         |                                                                 |
         v                                                                 v
  PASSIVE LEARNING (Policy Evaluation)                    ACTIVE LEARNING (Control / Optimization)
  Evaluate a FIXED policy \pi to find U^\pi               Optimize policy to find OPTIMAL \pi^*: S -> A
         |                                                                 |
   +-----+-----+                                                     +-----+-----+
   |           |                                                     |           |
   v           v                                                     v           v
[MB] ADP    [MF] MC Prediction                                    [MB] Active  [MF] TD Control
Adaptive    Direct utility estimation                              ADP          - Q-Learning (Off-Policy)
Dynamic     [MF] TD Prediction                                    Model-Based   - SARSA (On-Policy)
Programming TD(0) bootstrapping                                    Control      [MF] MC Control
```

1. **Passive Learning (Prediction / Policy Evaluation):**
   - The agent assumes a fixed, pre-determined behavioral policy $\pi(s)$.
   - The mathematical objective is to compute the expected utility (value) function:
     $$U^\pi: \mathcal{S} \to \mathbb{R} \quad \text{or} \quad V^\pi: \mathcal{S} \to \mathbb{R}$$
   - **Model-Based (MB):** *Adaptive Dynamic Programming (ADP)* learns empirical models $\hat{P}(s' \mid s, \pi(s))$ and $\hat{R}$ from frequency counting, then solves the Bellman Expectation linear system.
   - **Model-Free (MF):** *Monte Carlo (MC) prediction* (direct value/utility estimation) averages empirical episode returns without a model. *Temporal-Difference (TD) prediction* updates estimates by bootstrapping online from immediate successor estimates.
2. **Active Learning (Control / Policy Optimization):**
   - The agent assumes an underlying utility function or action-utility function $Q(s, a)$.
   - The mathematical objective is to determine an **optimal policy**:
     $$\pi^*: \mathcal{S} \to \mathcal{A}$$
   - **Model-Based (MB):** *Active ADP* learns transition models $\hat{P}$ and rewards $\hat{R}$ across all actions, solving the Bellman Optimality Equation.
   - **Model-Free (MF):** *Monte Carlo Control* updates action-value tables from complete rollouts. *Active TD Methods (TD Control)* update parameterized action-values $Q(s, a)$ online:
     - **Q-Learning (Watkins, 1989):** Off-policy TD control that bootstraps from the greedy maximal action $\max_{a'} Q(s', a')$.
     - **SARSA (Rummery & Niranjan, 1994):** On-policy TD control that bootstraps from the action $a'$ actually selected by the behavioral exploratory policy.

---

### 1.2 Approaches to Scaling Up

To escape the tabular scaling ceiling, modern reinforcement learning deploys three core paradigms:
1. **Value Function Approximation:** Approximating utility functions $\hat{U}_\theta(s) \approx U(s)$ or action-utility functions $\hat{Q}_\theta(s, a) \approx Q(s, a)$ via parameterized functions.
2. **Policy Search:** Systematically searching for high-performing policies directly within parameterized policy spaces $\pi_\theta(a \mid s)$.
3. **Mixed Methods (Actor-Critic):** Combining value function approximation (Critic) and policy search (Actor) to achieve low-variance, stable policy optimization.

---

## 2. Linear and Non-Linear Value Function Approximation

Instead of maintaining a distinct memory slot for every state $s \in \mathcal{S}$, **Function Approximation** represents state utility or action utility as a differentiable mathematical function parameterized by weight vector $\boldsymbol{	heta}$:

$$\hat{U}_\theta(s) = g(s; \boldsymbol{	heta})$$
$$\hat{Q}_\theta(s, a) = g(s, a; \boldsymbol{	heta})$$

```
+---------------------------------------------------------------------------------------+
|                               FUNCTION APPROXIMATION PIPELINE                        |
|                                                                                       |
|   Raw Environment State: s                                                            |
|          |                                                                            |
|          v                                                                            |
|   Feature Extraction: f(s) = [ f_0(s), f_1(s), f_2(s), ..., f_n(s) ]^T               |
|          |                                                                            |
|          v                                                                            |
|   Parameterized Function: g(s; \theta)                                                |
|          |                                                                            |
|          +----------------------------+----------------------------+                  |
|          |                                                         |                  |
|          v                                                         v                  |
|   Linear Approximation:                             Deep Non-Linear Network:          |
|   \hat{U}_\theta(s) = \sum \theta_i f_i(s)          \hat{U}_\theta(s) = MLP(s; \theta)|
|                     = \boldsymbol{\theta}^T \mathbf{f}(s)                                  |
+---------------------------------------------------------------------------------------+
```

### 2.1 Conceptual Motivation: The House Price Analogy

Consider the intuitive task of building an agent that estimates the market value of a house based on its floor area (size):
- **Approach 1: The Tabular Lookup ("Excel Sheet") Paradigm:**
  Collect historical housing sales data, construct a table mapping exact house sizes to observed prices:
  $$\text{Table: } [60.0\text{ m}^2 \to \$400\text{k}, \; 60.5\text{ m}^2 \to \$403\text{k}, \; 61.0\text{ m}^2 \to \$407\text{k}, \; \dots]$$
  When asked to evaluate a house, simply look up the cell. This represents the **tabular reinforcement learning paradigm** studied prior to the Recess week. In complex domains, this approach fails:
  1. *Astronomical Memory Footprint:* Discrete bins scale exponentially with features; continuous inputs require infinite storage.
  2. *Zero Generalization:* If a house of size $60.3\text{ m}^2$ has never appeared in historical data, the lookup table provides zero information!
- **Approach 2: Function Approximation:**
  Collect data, learn a mathematical function that fits the data:
  $$\hat{U}_\theta(\text{size}) = g(\text{size}; \boldsymbol{\theta})$$
  (such as a linear slope $\theta_1 \cdot \text{size} + \theta_0$, or a deep neural net).
- **Two Foundational Benefits:**
  1. **Compact Representation:** A tiny parameter vector $\boldsymbol{\theta} \in \mathbb{R}^d$ ($d \ll |\mathcal{S}|$) captures the entire value landscape, replacing gigabytes of lookup tables.
  2. **Generalization:** By learning underlying continuous patterns, the model naturally interpolates and predicts accurate utilities for previously unvisited states based on feature similarity.
- **The Under-Parameterization Caveat:**
  If the hypothesis space contains too few parameters $n$ relative to task complexity, the agent suffers from severe structural approximation bias (**underfitting**).

---

### 2.2 Linear vs. Neural Network Function Approximation (Slide 9)

To illustrate the fundamental difference between linear and non-linear function approximation, consider estimating an oscillatory 1D true value function $V(s)$ across continuous states $s \in [-5, 5]$:

```
+---------------------------------------------------------------------------------------+
|                 FUNCTION APPROXIMATION: LINEAR VS. NEURAL NETWORK                     |
|                                                                                       |
|   Value V(s)                                                                          |
|       ^                                                                               |
|   1.0 |           * * *                 * * *                 * * *                   |
|       |         *   :   *             *   :   *             *   :   *                 |
|   0.5 |  * * *      :     *         *     :     *         *     :     *               |
|       | - - - - - - : - - - * - - * - - - : - - - * - - * - - - : - - - * - - - - - - |
|   0.0 |             :         *           :         *           :                     |
|       |             :                     :                     :                     |
|  -0.5 |             :                     :                     :                     |
|       |             :                     :                     :                     |
|  -1.0 |             :         . . .       :         . . .       :                     |
|       |             :       .       .     :       .       .     :                     |
|  -1.5 |             :     .           .   :     .           .   :                     |
|       +-------------+---------------------+---------------------+------------> State s|
|                    -4                    0                     4                      |
|                                                                                       |
|   Legend:                                                                             |
|   _____ (Solid Black) : True Value Function (Highly Non-Linear & Oscillating)         |
|   - - - (Dashed Red)  : Linear Approximation (Severely Underfits; Constant Slope)     |
|   ..... (Dotted Blue) : Neural Network Approximation (Captures Peaks and Valleys)     |
|     x   (Gold Crosses): Sampled States from Environment Trajectories                  |
+---------------------------------------------------------------------------------------+
```

- **Linear Approximation (Dashed Line):** A linear model $U(s) = \theta_1 s + \theta_0$ has only 2 degrees of freedom. It can only draw a straight line through the data. It is mathematically incapable of representing peaks and valleys, introducing massive **structural approximation bias**.
- **Neural Network Approximation (Dotted Curve):** Multi-layer non-linear neural networks (with ReLU or Sigmoid activations) possess universal approximation capability. They flexibly warp around non-linear topographies, capturing complex multi-modal value landscapes and accurately generalizing across unvisited intermediate states.

---

### 2.3 Linear Function Approximation: Features and Formulations

In linear function approximation, the utility is approximated as a weighted linear combination of state features:

$$\hat{U}_\theta(s) = \theta_0 f_0(s) + \theta_1 f_1(s) + \theta_2 f_2(s) + \dots + \theta_n f_n(s) = \sum_{i=0}^n \theta_i f_i(s) = \boldsymbol{\theta}^T \mathbf{f}(s)$$

- **Bias Feature:** $f_0(s) = 1$ is a constant intercept feature, allowing the baseline utility level to shift independently of state coordinates.
- **Derived Features:** $f_1(s), \dots, f_n(s)$ are domain-specific features extracted from state $s$ (e.g., in chess: piece count, center control; in navigation: distance to obstacles).
- **Direct State Components Form (Slide 11):**
  When state components are used directly without transformation: $\mathbf{s} = [s_1, s_2, \dots, s_N]^T$, the formulation becomes:
  $$\hat{U}_\theta(s) = \theta_0 + \theta_1 s_1 + \theta_2 s_2 + \dots + \theta_N s_N$$
  This is equivalent to the general form with $f_0 = 1$ and $f_i = s_i$.

#### Numerical Walkthrough: Grid World Navigation (Russell & Norvig Figure 17.2)
Consider a robot navigating the Russell & Norvig $4 \times 3$ grid world where each state is defined by its 2D Cartesian coordinates $\mathbf{s} = (x, y)$:
- **Linear Parameterization:**
  $$\hat{U}_\theta(x, y) = \theta_0 + \theta_1 x + \theta_2 y$$
- **Forward Utility Evaluation:**
  Suppose current learned weights are $\boldsymbol{\theta} = (\theta_0, \theta_1, \theta_2) = (0.5, 0.2, 0.1)$.
  At state $(x = 1, y = 1)$, the predicted utility is:
  $$\hat{U}(1, 1) = 0.5 + 0.2(1) + 0.1(1) = \mathbf{0.8}$$
- **Learning Weights via Linear Regression:**
  Collect sample tuples $(x, y, u_j)$ from trials, where $u_j$ is the target value (from Monte Carlo returns or TD targets). Linear regression minimizes squared error between predicted and target values via gradient descent:
  $$\theta_0 \leftarrow \theta_0 + \alpha \left( u_j(s) - \hat{U}_\theta(s) \right)$$
  $$\theta_1 \leftarrow \theta_1 + \alpha \left( u_j(s) - \hat{U}_\theta(s) \right) x$$
  $$\theta_2 \leftarrow \theta_2 + \alpha \left( u_j(s) - \hat{U}_\theta(s) \right) y$$

---

### 2.4 Non-Linear Deep Neural Network Approximation (Slide 20)

In high-dimensional perceptual environments (raw camera pixels, LiDAR point clouds), hand-crafting basis features $f_i(s)$ is impossible:
- A **Deep Neural Network** acts as the non-linear function approximator:
  $$\hat{U}_\theta(s) = g(s; \boldsymbol{\theta})$$
- The network automatically learns hierarchical latent feature representations from raw input.
- The **final output layer is typically linear** with respect to the last hidden activations:
  $$\hat{U}_\theta(s) = \theta_1 f_1(s) + \theta_2 f_2(s) + \dots + \theta_n f_n(s)$$
  where $f_i(s)$ are outputs of the penultimate hidden layer.
- Parameters $\boldsymbol{\theta}$ encompass all weights and biases across all convolutional and fully connected layers, updated via **backpropagation**.

---

## 3. Approximate Monte Carlo Learning & The Widrow-Hoff (Delta) Rule

How does an agent optimize the parameter vector $\boldsymbol{\theta}$ to best approximate the true utility from experience?

### 3.1 Supervised Learning Formulation
The agent collects training samples from completed trial episodes:
$$\mathcal{D} = \{ ((x_1, y_1), u_1), \; ((x_2, y_2), u_2), \; \dots, \; ((x_n, y_n), u_n) \}$$
where $u_j$ is the empirical discounted return observed for state $(x_j, y_j)$:
$$u_j(s) = R_t + \gamma R_{t+1} + \gamma^2 R_{t+2} + \dots$$

This casts value estimation as a **supervised regression problem**: fit $\hat{U}_\theta(s)$ to match target returns $u_j$.

### 3.2 The Loss Function & The Widrow-Hoff Rule
We define the instantaneous squared error loss for a single training observation:
$$\mathcal{E}_j(s) = \frac{1}{2} \left( \hat{U}_\theta(s) - u_j(s) \right)^2$$

Computing the gradient with respect to parameter $\theta_i$:
$$\frac{\partial \mathcal{E}_j(s)}{\partial \theta_i} = \left( \hat{U}_\theta(s) - u_j(s) \right) \frac{\partial \hat{U}_\theta(s)}{\partial \theta_i} = - \left( u_j(s) - \hat{U}_\theta(s) \right) \frac{\partial \hat{U}_\theta(s)}{\partial \theta_i}$$

Applying gradient descent with learning rate $\alpha$:
$$\theta_i \leftarrow \theta_i - \alpha \frac{\partial \mathcal{E}_j(s)}{\partial \theta_i} = \theta_i + \alpha \left( u_j(s) - \hat{U}_\theta(s) \right) \frac{\partial \hat{U}_\theta(s)}{\partial \theta_i}$$

This is the historic **Widrow-Hoff Rule** (or the **Delta Rule**), developed by **Bernard Widrow and Ted Hoff in 1960** for the Adaline model. The parameter adjustment is the product of three terms:
1. Learning rate $\alpha$.
2. Prediction error $\delta = u_j(s) - \hat{U}_\theta(s)$.
3. Feature sensitivity gradient $\frac{\partial \hat{U}_\theta(s)}{\partial \theta_i}$ (which equals $f_i(s)$ in linear models).

---

### 3.3 Deep-Dive: Widrow-Hoff (Delta Rule / Online SGD) vs. Naive (Batch) Gradient Descent

```
+---------------------------+-----------------------------------+-----------------------------------+
| Feature Dimension         | Naive (Batch) Gradient Descent    | Widrow-Hoff Rule (Online SGD)     |
+---------------------------+-----------------------------------+-----------------------------------+
| Data Processing Paradigm  | Offline Batch: Process entire     | Online Streaming: Process single  |
|                           | dataset D of size N simultaneously| transition (s_t, u_t) immediately |
+---------------------------+-----------------------------------+-----------------------------------+
| Loss Objective Function   | Global Empirical Risk:            | Instantaneous Sample Error:       |
|                           | L(\theta) = (1/2N) sum (U - u)^2  | E_t(s) = (1/2) (U(s_t) - u_t)^2   |
+---------------------------+-----------------------------------+-----------------------------------+
| Gradient Computation      | Exact average gradient across all | Stochastic single-sample gradient |
|                           | N samples in dataset D            | evaluated at current state s_t    |
+---------------------------+-----------------------------------+-----------------------------------+
| Memory Requirement        | High: O(N * d) — must store all   | Minimal: O(d) — zero storage of   |
|                           | historical episodes in RAM        | past samples; update & discard    |
+---------------------------+-----------------------------------+-----------------------------------+
| Trajectory Dynamics       | Monotonic, smooth, deterministic  | Stochastic, noisy trajectory with |
|                           | descent down the loss landscape   | random local fluctuations         |
+---------------------------+-----------------------------------+-----------------------------------+
| Escape from Local Optima  | Highly susceptible to saddle pts  | Gradient noise provides implicit  |
|                           | and shallow local minima          | regularization, escaping traps    |
+---------------------------+-----------------------------------+-----------------------------------+
| Reinforcement Learning    | Poor: Requires halting agent to   | Ideal: Continuous, real-time      |
| Suitability               | perform expensive batch re-fitting| online tracking of non-stationary |
|                           | over accumulated past data        | environment reward streams        |
+---------------------------+-----------------------------------+-----------------------------------+
```

---

## 4. Approximate Temporal Difference (TD) Learning: Semi-Gradient TD, SARSA, and Q-Learning

Monte Carlo regression requires waiting until an episode concludes before updating weights, suffering from high variance. **Temporal Difference (TD) methods** update parameters online at every step by **bootstrapping** from immediate successor state estimates.

### 4.1 Explicit Parameter Update Equations (Slide 15 & 21)

Online learning updates parameters to reduce the temporal difference error:

1. **State-Utility Value TD(0):**
   $$\theta_i \leftarrow \theta_i + \alpha \left[ R(s, a, s') + \gamma \hat{U}_\theta(s') - \hat{U}_\theta(s) \right] \frac{\partial \hat{U}_\theta(s)}{\partial \theta_i}$$
   where $R(s, a, s') + \gamma \hat{U}_\theta(s')$ is the **TD target**, and the bracketed term is the **TD error**.

2. **SARSA (On-Policy Action-Value Control):**
   $$\theta_i \leftarrow \theta_i + \alpha \left[ R(s, a, s') + \gamma \hat{Q}_\theta(s', a') - \hat{Q}_\theta(s, a) \right] \frac{\partial \hat{Q}_\theta(s, a)}{\partial \theta_i}$$
   where $a'$ is the action actually executed in state $s'$ by the agent's exploratory policy.

3. **Q-Learning (Off-Policy Action-Value Control):**
   $$\theta_i \leftarrow \theta_i + \alpha \left[ R(s, a, s') + \gamma \max_{a'} \hat{Q}_\theta(s', a') - \hat{Q}_\theta(s, a) \right] \frac{\partial \hat{Q}_\theta(s, a)}{\partial \theta_i}$$

#### Theoretical Notes from Slides 15 & 21
- **The Semi-Gradient Mechanism:** In computing the gradient with respect to $\boldsymbol{	heta}$, the TD target $R + \gamma \hat{U}_\theta(s')$ itself depends on $\boldsymbol{	heta}$, but we treat it as a **fixed scalar constant** rather than differentiating through the target.
- **Linear Convergence Guarantee:** On-policy $\text{TD}(0)$ paired with linear function approximation is **mathematically guaranteed to converge** to a unique fixed point near the optimal projection under standard Robbins-Monro conditions.
- **Deep Model Parameter Updates:** In deep networks, the exact same gradient rules apply, where $\frac{\partial \hat{U}_\theta(s)}{\partial \theta_i}$ and $\frac{\partial \hat{Q}_\theta(s, a)}{\partial \theta_i}$ are calculated across all layers via **backpropagation**.
- **SARSA in Deep RL:** SARSA is rarely utilized in deep RL because its strict on-policy requirement makes it difficult to use experience replay buffers effectively.

---

### 4.2 In-Depth Explanation of SARSA: Mechanics, Safety, and Deep RL Incompatibility

#### Why is SARSA "On-Policy"?
SARSA is named after its transition tuple $(S_t, A_t, R_{t+1}, S_{t+1}, A_{t+1})$. It is on-policy because it evaluates and improves the **exact same behavioral policy** that generates actions. Its target $r + \gamma \hat{Q}_\theta(s', a')$ uses the exploratory action $a' \sim \pi(s')$ selected by the current policy. In contrast, Q-learning is off-policy because its target $r + \gamma \max_{a'} \hat{Q}_\theta(s', a')$ assumes greedy execution, regardless of what exploratory action the behavior policy actually takes.

#### Why is SARSA "Safer" During Online Exploration? (Cliff Walking)
In the Cliff Walking gridworld ($4 \times 12$ grid, $-100$ cliff hazard, $-1$ step cost):
- **Q-Learning:** Learns the optimal shortest path along the cliff edge (reward: $-13$). However, when executing with an $\epsilon$-greedy exploration policy ($\epsilon = 0.1$), random exploratory moves repeatedly plunge the agent off the cliff into the $-100$ hazard, resulting in a low online return ($\approx -50$).
- **SARSA:** Evaluates the return of the policy inclusive of its exploratory errors. Recognizing that walking near the cliff carries catastrophic exploration risk, SARSA chooses the longer, safe detour along the top row (reward: $-17$), avoiding accidental falls and achieving a higher online return during training ($\approx -25$).

#### Why is SARSA Incompatible with Experience Replay?
Experience replay buffers store transitions $(s, a, r, s', a')$ generated over thousands of past steps by outdated policies $\pi_{\theta_{\text{old}}}$. Replaying an old transition where $a'$ was chosen by $\pi_{\theta_{\text{old}}}$ introduces severe **distribution mismatch** with the current policy $\pi_{\theta_{\text{now}}}$, inducing systematic bias. Q-learning does not suffer from this because its target $\max_{a'} Q(s', a'; \theta_{\text{now}})$ is computed dynamically using the current network.

---

## 5. Instabilities in Approximate Utility Learning: The Deadly Triad & Catastrophic Forgetting

In tabular settings, RL algorithms enjoy ironclad convergence guarantees. However, when moving to function approximation, algorithms can become unstable and **diverge to infinity**.

### 5.1 The Deadly Triad

Richard Sutton and Andrew Barto formalized the root cause of divergence as **The Deadly Triad**: instability occurs when the following three elements are combined simultaneously:
1. **Function Approximation:** Sharing parameters $\boldsymbol{	heta}$ across states (linear models, deep networks). Updates to one state change predictions for many others.
2. **Bootstrapping:** Updating value estimates based on subsequent learned estimates (TD methods) rather than empirical full returns. Targets become **moving targets** that shift with parameter updates.
3. **Off-Policy Learning:** Training on transitions generated by a behavior distribution that differs from the target policy's distribution.

```
+--------------------------+-----------------------+---------------+---------------+-----------------------+---------------------------------------+
| Algorithm                | Function Approx (FA)? | Bootstrapping?| Off-Policy?   | Enters Deadly Triad?  | Theoretical Stability & Convergence   |
+--------------------------+-----------------------+---------------+---------------+-----------------------+---------------------------------------+
| Tabular Q-Learning       | NO (Lookup Table)     | YES           | YES           | NO (Pillar 1 Absent)  | Guaranteed convergence to Q*          |
| Monte Carlo (with NN)    | YES (Neural Network)  | NO (Full G_t) | NO / YES (IS) | NO (Pillar 2 Absent)  | High variance, but NEVER diverges     |
| SARSA (with Linear / NN) | YES                   | YES           | NO (On-Policy)| NO (Pillar 3 Absent)  | Linear: Guaranteed; Deep: Stable      |
| Off-Policy TD(0)         | YES                   | YES           | YES           | YES (TRIAD COMPLETE)  | CAN DIVERGE (e.g., Baird's Star MDP)  |
| DQN (Deep Q-Network)     | YES                   | YES           | YES           | YES (TRIAD COMPLETE)  | Highly unstable; requires Target Net  |
+--------------------------+-----------------------+---------------+---------------+-----------------------+---------------------------------------+
```

---

### 5.2 Baird's Counterexample: Exact Numerical Divergence (Slide 17)

In 1995, Leemon Baird proved that off-policy semi-gradient TD with linear function approximation can diverge to infinity even on an elementary 7-state MDP with zero rewards!

```
                      BAIRD'S 7-STATE STAR MDP TOPOLOGY (SB Fig 11.1)
                                      |
                +---------------------+---------------------+
                |                     |                     |
                v                     v                     v
           [ State 1 ]           [ State 2 ]           [ State 3 ]  ... [ State 6 ]
           (2w_1 + w_8)          (2w_2 + w_8)          (2w_3 + w_8)     (2w_6 + w_8)
                |                     |                     |                 |
                +---------------------+---------------------+-----------------+
                                      |
                           Dashed action: Go to HQ (b = 6/7)
                                      |
                                      v
                            [ State 7: Headquarter ]
                                  (w_7 + 2w_8)
                                      |
                           Solid action: Stay in HQ (pi = 1, b = 1/7)
                                      |
                                      +---> Loops back to States 1-6 uniformly
```

#### Exact Mathematical Setup (Slide 17):
- **States:** 6 branch states ($s_1, \dots, s_6$) and 1 headquarter state ($s_7$).
- **Features & Weights (8 parameters):**
  - Branch states $s_i$: $\hat{U}(s_i) = 2 w_i + w_8$ for $i \in \{1, \dots, 6\}$.
  - Headquarter state $s_7$: $\hat{U}(s_7) = w_7 + 2 w_8$.
- **Transition Dynamics & Policies:**
  - Solid action: Transitions to one of the 6 branch states uniformly.
  - Dashed action: Transitions deterministically to State 7 (Headquarter).
  - Target policy: $\pi(\text{solid} \mid \cdot) = 1$ (always stay/transition to branches).
  - Behavior policy: $b(\text{dashed} \mid \cdot) = 6/7$, $b(\text{solid} \mid \cdot) = 1/7$.
- **Rewards and Discount:** $r(s, a, s') = 0$ for all transitions, and discount factor $\gamma = 0.99$.
- **True Ground-Truth Value:** Because all rewards are 0, the true utility is strictly $\mathbf{U^*(s) = 0}$ everywhere!
- **Initial Weight Vector (Slide 17):**
  $$\boldsymbol{\theta}_0 = \langle 1, 1, 1, 1, 1, 1, 10, 1 \rangle^T$$
- **The Divergence Explosion (Sutton & Barto Fig 11.2):**
  When running semi-gradient off-policy TD(0), branch states look at State 7 and increase shared weight $w_8$. Because State 7\'s feature vector contains $2w_8$, increasing $w_8$ inflates State 7\'s own target. The behavior policy samples State 7 only $1/7$ of the time, so the true $R = 0$ reward is never observed frequently enough to halt the inflation. In fewer than **1,000 steps**, weight $w_8$ blows past $300$ and diverges toward **$+\infty$**!

---

### 5.3 Mathematical Anatomy: Why On-Policy Self-Corrects

Under on-policy learning, experience is sampled strictly according to the **stationary state distribution $d^\pi(s)$** of the target policy:
- Tsitsiklis and Van Roy (1997) proved that the composite projection-Bellman operator $\Pi T^\pi$ forms a **strict contraction mapping** with factor $\gamma < 1$ under the weighted norm $\|\cdot\|_{d^\pi}$:
  $$\| \Pi T^\pi U_1 - \Pi T^\pi U_2 \|_{d^\pi} \le \gamma \| U_1 - U_2 \|_{d^\pi}$$
- By the Banach Fixed-Point Theorem, on-policy linear TD is guaranteed to converge to a unique fixed point $\hat{U}^*$.
- Under off-policy learning, data is sampled under behavior distribution $d^b(s) \ne d^\pi(s)$. The contraction property shatters; the spectral radius $\rho(\Pi T^\pi)$ can strictly exceed 1, causing exponential divergence.

---

### 5.4 Catastrophic Forgetting & Experience Replay (Slide 18)

- **What Happens:** In deep networks with shared weights, localized gradient updates over-fit to currently visited regions, overwriting and degrading utility representations of rarely visited regions.
- **When It Happens:** Over-training on local trajectories or lack of coverage during exploration.
- **Solution: Experience Replay:** Storing transitions in a replay buffer and sampling minibatches uniformly breaks temporal correlations and maintains accurate value representations across all regions.

---

## 6. Deep Q-Networks (DQN) for High-Dimensional Control

In 2015, DeepMind introduced **Deep Q-Networks (DQN)** (Mnih et al., *Nature* 2015), achieving human-level control across 49 Atari 2600 games directly from raw pixel frames.

### 6.1 Input Preprocessing & Network Architectures (Slides 22 & 23)

- **Input Preprocessing:** Raw frames are downsampled and converted to grayscale ($84 \times 84$). To capture velocity, acceleration, and ball direction, DQN stacks the **last 4 game frames** into a tensor:
  $$\mathbf{s}_t \in \mathbb{R}^{84 \times 84 \times 4}$$
- **Reward Definition:** Defined as the direct change in game score between frames.
- **Architecture (Silver Lecture 6 / NIPS 2013 & Nature 2015):**
  - **Conv Layer 1:** 16 filters ($8 \times 8$, stride 4, ReLU) [Nature 2015: 32 filters].
  - **Conv Layer 2:** 32 filters ($4 \times 4$, stride 2, ReLU) [Nature 2015: 64 filters].
  - **Conv Layer 3 (Nature 2015):** 64 filters ($3 \times 3$, stride 1, ReLU).
  - **Fully Connected Hidden Layer:** 256 rectifier units [Nature 2015: 512 units].
  - **Output Layer:** Fully connected linear layer with 18 outputs (one $Q(s, a)$ for each discrete joystick configuration).
  - **Fixed Architecture:** The identical network architecture and hyperparameters were used across all games without tuning!

---

### 6.2 Two Core Stabilization Breakthroughs

Standard Q-learning is unstable with deep neural nets due to the Deadly Triad. DQN introduced two key stabilization mechanisms:
1. **Experience Replay Buffer ($\mathcal{D}$):** Stores transitions $(s, a, r, s')$. Random minibatch sampling breaks temporal autocorrelation and transforms non-stationary RL into stable i.i.d. regression.
2. **Fixed Q-Targets Network ($Q(s, a; \boldsymbol{\theta}^-)$):** A secondary set of target weights $\boldsymbol{	heta}^-$ is kept frozen when computing target values:
   $$y = r + \gamma \max_{a'} Q(s', a'; \boldsymbol{\theta}^-)$$
   This resolves the moving target problem. Target weights are updated periodically ($\boldsymbol{\theta}^- \leftarrow \boldsymbol{\theta}$) every $C$ steps (e.g., $C = 10,000$).

---

### 6.3 The Complete 6-Step DQN Algorithmic Loop (Slide 24)

```
+-------------------------------------------------------------------------------+
|                       DQN TRAINING LOOP (Mnih et al., 2015)                   |
+-------------------------------------------------------------------------------+
| 1. Select action a using an \epsilon-greedy policy:                           |
|    - With probability \epsilon: choose a random action uniformly from actions  |
|    - With probability 1 - \epsilon: choose greedy a = rg\max_a Q(s, a; 	heta) |
| 2. Execute action a, observe reward r and next state s'                       |
| 3. Store transition tuple (s, a, r, s') in replay buffer \mathcal{D}          |
| 4. Sample a random minibatch of transitions (s, a, r, s') from buffer         |
| 5. Compute scalar target:                                                     |
|    y = r + \gamma \max_{a'} Q(s', a'; oldsymbol{	heta}^-)                 |
| 6. Minimize mean squared Bellman loss via gradient descent:                  |
|    \mathcal{L}(	heta) = ( y - Q(s, a; oldsymbol{	heta}) )^2               |
| 7. Periodically synchronize target network: oldsymbol{	heta}^- \leftarrow oldsymbol{	heta} |
+-------------------------------------------------------------------------------+
```

---

### 6.4 Case Study: Gymnasium Lunar Lander (Slide 27)

Beyond Atari pixels, DQN is demonstrated on continuous-state physics benchmarks like **Lunar Lander** (`gymnasium.make("LunarLander-v3")`):
- **Action Space:** `Discrete(4)`:
  - $0$: Do nothing (free fall).
  - $1$: Fire left orientation engine.
  - $2$: Fire main engine (vertical thrust).
  - $3$: Fire right orientation engine.
- **Observation Space:** `Box(8)` float32:
  $$\mathbf{s} = [x, \, y, \, v_x, \, v_y, \, \theta, \, \omega, \, c_{\text{left}}, \, c_{\text{right}}]^T$$
  spanning coordinates $[-2.5, 2.5]$, velocities $[-10, 10]$, angle $[-\pi, \pi]$, angular velocity, and ground contact booleans.
- **Model Architecture:** Trained using a Multi-Layer Perceptron (MLP) mapping 8 inputs to 4 Q-values.
- **Learning Progression:**
  - **Episode #1 (Untrained):** Lander fires thrusters erratically, rolls over, and crashes violently into the terrain (score $\approx -350$).
  - **Episode #1500 (Converged DQN):** The agent throttles its main engine to control vertical descent speed and fires side thrusters to maintain attitude, executing a smooth touchdown between the two yellow flags (score $> +200$).

---

## 7. Advanced DQN Extensions & Theoretical Limitations

### 7.1 Variants of Deep Q-Learning (Slide 28)

```
+-----------------------------------+-----------------------------------------------------------------------+
| Deep Q-Learning Variant           | Target Formulation & Algorithmic Mechanism                            |
+-----------------------------------+-----------------------------------------------------------------------+
| Standard DQN (Reference)          | y = r + \gamma \max_{a'} Q(s', a'; \theta_i^-)                             |
|                                   | Uses frozen target network \theta^-, but prone to overestimation bias |
+-----------------------------------+-----------------------------------------------------------------------+
| Double DQN (DDQN, 2016)           | y = r + \gamma Q(s', \arg\max_{a'} Q(s', a'; \theta_i); \theta_i^-)       |
|                                   | Decouples action selection (online) from action evaluation (target)   |
+-----------------------------------+-----------------------------------------------------------------------+
| Multi-Step Learning (n-step)      | y = r_1 + \gamma r_2 + \dots + \gamma^N \max_{a_N} Q(s_N, a_N; \theta_i^-) |
|                                   | Uses multiple future rewards to provide stronger learning signals     |
+-----------------------------------+-----------------------------------------------------------------------+
| Distributional RL (C51, 2017)     | Q(s, a) = \mathbb{E}[\hat{Q}(s, a)]                                  |
|                                   | Predicts the full probability distribution of returns over 51 atoms   |
+-----------------------------------+-----------------------------------------------------------------------+
| Prioritized Replay (PER, 2016)    | Samples transitions proportional to TD error magnitude |\delta|^\alpha; |
|                                   | prioritizes informative transitions, improving data efficiency        |
+-----------------------------------+-----------------------------------------------------------------------+
```

---

### 7.2 Where DQN Struggles (Slide 29)

Despite its power, value-based Deep Q-Learning suffers from three inherent architectural bottlenecks:
1. **Intractability in Continuous Action Spaces:** DQN requires evaluating $\max_a Q(s, a)$. In continuous action spaces ($\mathcal{A} \subset \mathbb{R}^d$, e.g., robotics), computing the global $rg\max$ of a non-convex neural network is computationally intractable $\implies$ **vanilla DQN does not apply**.
2. **Action Cardinality Bottleneck ($|\mathcal{A}|$):** DQN must score every candidate action individually at each step. Computational cost and gradient instability grow with $|\mathcal{A}|$.
3. **Deterministic Policy Rigidity:** DQN\'s greedy policy is inherently deterministic. Many tasks benefit from **inherent randomness** (multi-modal strategies, exploration in non-stationary worlds, and mixed equilibria in imperfect-information games).

---

## 8. Policy Search & The Policy Gradient Theorem

In **Policy Search**, the agent directly parameterizes a stochastic policy:

$$\pi_\theta(a \mid s) = \Pr(A_t = a \mid S_t = s; \boldsymbol{\theta})$$

### 8.1 Definitions & Policy Objective (Slides 31 & 32)
- **Parameterized Stochastic Policy:** $\pi_\theta(a \mid s)$ is the probability of choosing action $a$ in state $s$.
- **Policy Value Objective ($J(\boldsymbol{\theta})$):** The expected discounted return when executing $\pi_\theta$:
  $$J(\boldsymbol{\theta}) = \mathbb{E}_{\tau \sim \pi_\theta} \left[ \sum_{t=0}^{T-1} \gamma^t r_t \right] = \sum_{s \in \mathcal{S}} p_0(s) \sum_{a \in \mathcal{A}} \pi_\theta(a \mid s) Q^{\pi_\theta}(s, a)$$
  where $p_0(s)$ is the initial-state distribution.
- **Policy Gradient ($\nabla_\theta J(\boldsymbol{\theta})$):** The vector of partial derivatives $[\partial J / \partial \theta_i]$ with the same dimension as $\boldsymbol{\theta}$.
- **Goal:** Maximize policy value $J(\boldsymbol{\theta})$ via **gradient ascent**:
  $$\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} + \alpha \nabla_\theta J(\boldsymbol{\theta})$$

---

### 8.2 Differentiable Policy Parameterization (Slide 33)

- **Deterministic Form:**
  $$\pi_\theta(a \mid s) = \begin{cases} 1 & \text{if } a = \arg\max_a \hat{Q}_\theta(s, a) \\ 0 & \text{otherwise} \end{cases}$$
  Non-differentiable step function for discrete actions $\implies$ gradients not applicable!
- **Stochastic (Softmax) Policy:**
  $$\pi_\theta(a \mid s) = \frac{\exp(\beta h_\theta(s, a))}{\sum_{a'} \exp(\beta h_\theta(s, a'))}$$
  where $h_\theta(s, a)$ is an action preference score, and $\beta > 0$ controls **"softness"** (higher $\beta \to$ closer to argmax; equivalent to inverse temperature $\beta = 1/\tau$). Completely differentiable $\implies$ enables direct gradient-based learning.

---

### 8.3 The Policy Gradient Theorem (Sutton et al., 1999)

> **Theorem (Policy Gradient Theorem - Slide 32):**
> For any differentiable policy $\pi_\theta(a \mid s)$, the gradient of the policy value with respect to $\boldsymbol{	heta}$ is:
>
> $$\nabla_\theta J(\boldsymbol{\theta}) = \mathbb{E}_{\pi_\theta} \left[ Q^{\pi_\theta}(s, a) \nabla_\theta \log \pi_\theta(a \mid s) \right]$$
>
> where $\mathbb{E}_{\pi_\theta}[\cdot]$ denotes the expectation over state-action visits induced by executing $\pi_\theta$, with the appropriate discounted visitation weighting.

- **Intuition:** $J(\theta)$ measures *how good the policy is*; $\nabla_\theta J(\theta)$ shows *how to improve it* by pushing the policy toward actions with higher $Q^{\pi_\theta}(s, a)$.
- **Crucial Theoretical Property:** The gradient requires **zero knowledge of environmental transition dynamics $\mathcal{T}$**.

---

## 9. The REINFORCE Algorithm & Baseline Variance Reduction

### 9.1 The REINFORCE Algorithm (Williams, 1992 - Slide 34)

Using the log-derivative trick $\nabla_\theta \pi_\theta = \pi_\theta \nabla_\theta \log \pi_\theta$, and replacing the unobserved $Q^{\pi_\theta}(s, a)$ with empirical sample return $G_t = r_t + \gamma r_{t+1} + \gamma^2 r_{t+2} + \dots$:

$$\nabla_\theta J(\boldsymbol{\theta}) = \mathbb{E}_{\tau \sim \pi_\theta} \left[ \sum_t \gamma^t G_t \nabla_\theta \log \pi_\theta(a_t \mid s_t) \right]$$

**REINFORCE Stochastic Ascent Update Rule:**
$$\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} + \alpha \sum_t \gamma^t G_t \nabla_\theta \log \pi_\theta(a_t \mid s_t)$$

The episode gradient is a sum of contributions from each time step.

---

### 9.2 The High Variance Problem & Baseline Subtraction (Slide 35)

- **Issue:** Monte Carlo returns $G_t$ vary widely across episodes $\implies$ noisy, high-variance gradient updates.
- **Solution:** Subtracting a baseline $B(s)$ leaves the expected gradient strictly **unbiased**:
  $$\sum_{a \in \mathcal{A}} \nabla_\theta \pi_\theta(a \mid s) B(s) = B(s) \nabla_\theta \left( \sum_{a \in \mathcal{A}} \pi_\theta(a \mid s) \right) = B(s) \nabla_\theta(1) = \mathbf{0}$$

#### Empirical Demonstration (Slide 35):
Consider 4 sample episodes from state $s$:

```
+---------+-------------------+----------------------------+-----------------------------+------------------------------------+
| Episode | Return G_t        | Adjusted Return (G_t - 100)| Raw Term G_t 
abla log \pi | Baseline Term (G_t-100) 
abla log \pi |
+---------+-------------------+----------------------------+-----------------------------+------------------------------------+
| #1      | 110               | +10                        | 132.0                       | 12.0                               |
| #2      | 90                | -10                        | -90.0                       | 10.0                               |
| #3      | 105               | +5                         | 115.5                       | 5.5                                |
| #4      | 100               | 0                          | -90.0                       | 0.0                                |
+---------+-------------------+----------------------------+-----------------------------+------------------------------------+
| Variance| —                 | —                          | Var = 15,275                | Var = 28.4                         |
+---------+-------------------+----------------------------+-----------------------------+------------------------------------+
```
Subtracting baseline $B(s) = 100$ reduces variance from **15,275** to **28.4**—a **99.8% reduction in gradient noise** with zero directional bias!

---

### 9.3 Baseline and Advantage Function (Slide 36)

- Choose baseline $B(s)$ as the state-utility estimate: $B(s) = \hat{U}_\phi(s) \approx U^{\pi_\theta}(s)$.
- Define the **Advantage Function**:
  $$A^{\pi_\theta}(s, a) = Q^{\pi_\theta}(s, a) - U^{\pi_\theta}(s)$$
- **Policy Gradient with Advantage:**
  $$\nabla_\theta J(\boldsymbol{\theta}) = \mathbb{E}_{\pi_\theta} \left[ A^{\pi_\theta}(s, a) \nabla_\theta \log \pi_\theta(a \mid s) \right]$$
- **Variance-Reduced REINFORCE Update:**
  $$\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} + \alpha \sum_t A^{\pi_\theta}(s_t, a_t) \nabla_\theta \log \pi_\theta(a_t \mid s_t)$$
- **Bridge Forward:** When the baseline is learned dynamically by a value estimator (a **Critic**), the policy (**Actor**) uses it to reduce variance—forming the **Actor-Critic architecture**.

---

### 9.4 Empirical Convergence: REINFORCE with Baseline (Sutton & Barto Figure 13.1 / Slide 37)

Sutton & Barto\'s canonical Short Corridor benchmark demonstrates the transformative effect of baseline subtraction:
- **REINFORCE without Baseline ($\alpha = 2^{-13}$):** Total reward crawls slowly up from $-90$, exhibiting massive variance oscillations, requiring over **1,000 episodes** to approach asymptote.
- **REINFORCE with Baseline ($\alpha^\theta = 2^{-9}, \alpha^w = 2^{-6}$):** Total reward climbs vertically, converging to near-optimal $v_*(s_0) \approx -10$ in fewer than **100 to 200 episodes**!

---

## 10. Actor-Critic Architectures

**Actor-Critic methods** combine policy search and value function approximation:
- **Actor:** Parameterized policy $\pi_\theta(a \mid s)$ that selects actions to maximize return.
- **Critic:** Parameterized value function $\hat{U}_w(s)$ or $\hat{Q}_w(s, a)$ that estimates expected return under $\pi_\theta$.

```
+---------------------------------------------------------------------------------------+
|                         ACTOR-CRITIC INTERACTION LOOP                                 |
|                                                                                       |
|   Actor: Parameterized Policy \pi_	heta(a | s)                                       |
|     |  Selects action a_t based on current state s_t                                  |
|     v                                                                                 |
|   Environment Transitions: Emits Reward r_t and Next State s_{t+1}                    |
|     |                                                                                 |
|     v                                                                                 |
|   Critic: Parameterized Value Estimator \hat{U}_w(s)                                  |
|     Evaluates TD Error (Advantage Estimate):                                          |
|     \delta_t = r_t + \gamma \hat{U}_w(s_{t+1}) - \hat{U}_w(s_t)                       |
|     |                                                                                 |
|     +--------------------------------+--------------------------------+               |
|     |                                                                 |               |
|     v                                                                 v               |
|   Critic Update (Minimize TD Error):               Actor Update (Ascend Advantage):   |
|   w \leftarrow w + eta \delta_t 
abla_w \hat{U}_w(s_t)         	heta \leftarrow 	heta + lpha 
abla_	heta \log \pi_	heta(a_t | s_t) \delta_t |
+---------------------------------------------------------------------------------------+
```

### 10.1 TD Advantage Formulation (Slide 40)
- REINFORCE uses Monte Carlo advantage $A(s, a) \approx G_t - \hat{U}_\phi(s)$ (high variance).
- TD Actor-Critic approximates $Q(s, a)$ with the 1-step return:
  $$A_{\pi_\theta}(s, a) \approx r + \gamma \hat{U}_{\pi_\theta}(s') - \hat{U}_{\pi_\theta}(s) = \delta_t$$
- **Actor Update:**
  $$\boldsymbol{\theta}_{t+1} = \boldsymbol{\theta}_t + \alpha \nabla_\theta \log \pi_\theta(a_t \mid s_t) \left[ r_t + \gamma \hat{U}(s_{t+1}, \mathbf{w}) - \hat{U}(s_t, \mathbf{w}) \right]$$
- **Critic Update:**
  $$\delta_t = r_t + \gamma \hat{U}(s_{t+1}, \mathbf{w}) - \hat{U}(s_t, \mathbf{w}) \implies \mathbf{w}_{t+1} = \mathbf{w}_t + \beta \delta_t \nabla_w \hat{U}(s_t, \mathbf{w})$$
- In practice, $\delta_t$ serves directly as the estimated advantage $A_t$ in the actor update.

---

### 10.2 Spectrum of Actor-Critic Variants (Slide 41)
- **A2C (Advantage Actor-Critic):** Synchronous version where parallel worker environments collect batches and update centrally.
- **A3C (Asynchronous Advantage Actor-Critic):** Asynchronous lock-free multi-threading across CPU cores.
- **ACER (Actor-Critic with Experience Replay):** Extends actor-critic with replay buffers, Retrace off-policy corrections, and trust regions.
- **DDPG (Deep Deterministic Policy Gradient):** Off-policy actor-critic for continuous action spaces.
- **Soft Actor-Critic (SAC; Haarnoja et al., 2018):** Modern off-policy algorithm that combines stochastic policy gradients with **entropy regularization**:
  $$J(\pi) = \sum_{t=0}^\infty \mathbb{E}_{(s_t, a_t)} \left[ R(s_t, a_t) + \alpha \mathcal{H}(\pi(\cdot \mid s_t)) \right]$$
  optimizing for both reward and policy entropy for stable, sample-efficient, exploration-driven learning in continuous robotic control.

---

## 11. Advanced Policy Search: TRPO and PPO

### 11.1 The Fragility of Vanilla Policy Gradients (Slides 43 & 44)
- **Problem:** Vanilla policy gradients can take destructive, unreliable steps. An unstable return produces a bad gradient, degrading policy performance. Unlike supervised learning, degraded policies collect corrupted data, causing catastrophic performance collapse.
- **Goal:** Constrain updates to guarantee **monotonic policy improvement**:
  $$J(\boldsymbol{\theta}_{\text{new}}) \ge J(\boldsymbol{\theta}_{\text{old}})$$
- **Intuition:** Take only safe, trustable steps in policy space — not leaps!

---

### 11.2 Avoiding Bad Updates via Surrogate Objectives (Slide 44)

```
+---------------------------------------------------------------------------------------+
|                    AVOIDING BAD UPDATES VIA SURROGATE OBJECTIVES                      |
|                                                                                       |
|   Policy Value J(	heta)                                                              |
|        ^                                               True Objective J(	heta)       |
|        |                                                   .--.                 |
|        |                                                 .'          '.               |
|        |                                                /              \              |
|        |                             Surrogate M_3(	heta)              \             |
|        |                                .---.                            \            |
|        |                              .'     '.                           |           |
|        |             Surrogate M_2  .'         \                          |           |
|        |                .---.      /            \                         |           |
|        |              .'     '.   /              |                        /           |
|        |   Surrogate.'         \ /               |                       /            |
|        |     M_1   /            '                \                      /             |
|        |    .-.   /                               \                    /              |
|        |  .'   '.'                                 '.                .'               |
|        | /                                           '-............-'                 |
|        +----------------------------------------------------------------------> 	heta|
|               	heta_1        	heta_2          	heta_3                              |
+---------------------------------------------------------------------------------------+
```

At the $i$-th iteration, instead of maximizing the complex, non-local true objective $J(\theta)$, the algorithm maximizes a simpler **surrogate objective $M_i(\theta_i)$** that lower-bounds the true objective $\rho(\theta_i)$. Improving the surrogate guarantees monotonic improvement of the true policy value!

---

### 11.3 Trust Region Policy Optimization (TRPO; Schulman et al., 2015 - Slide 45)

**TRPO** enforces a trust region constraint on the policy shift:

$$\max_{\boldsymbol{\theta}} \mathcal{L}_{\pi_\theta} \quad \text{subject to} \quad \max_s D_{\text{KL}}\left[ \pi_{\text{old}}(\cdot \mid s) \,\|\, \pi_\theta(\cdot \mid s) \right] \le \delta$$

- **Kullback-Leibler (KL) Divergence:** Measures the statistical "distance" between action distributions.
- **Intuition:** Acts like a **speed limit** — large steps (excessive KL divergence) are unsafe and ruin performance.
- **Limitation:** Solving this constrained optimization requires computing the second-order **Fisher Information Matrix (FIM)** and conjugate gradient steps, which is computationally expensive.

---

### 11.4 Proximal Policy Optimization (PPO; Schulman et al., 2017 - Slides 46–49)

PPO achieves trust-region stability using first-order gradient descent via a **Clipped Surrogate Objective**:
- **Probability Ratio:**
  $$r_t(\pi) = \frac{\pi_\theta(a_t \mid s_t)}{\pi_{\text{old}}(a_t \mid s_t)}$$
- **Clipped Surrogate Loss (Slide 46):**
  $$\mathcal{L}^{\text{CLIP}}(\boldsymbol{\theta}) = \hat{\mathbb{E}}_t \left[ \min\left( r_t(\pi) A_t, \; \text{clip}(r_t(\pi), 1 - \epsilon, 1 + \epsilon) A_t \right) \right]$$

#### Visualizing PPO Clipping Dynamics (Slide 49)

```
        When Advantage A_t > 0                          When Advantage A_t < 0
       L^CLIP                                          L^CLIP
         ^                                               ^
         |             .------------- (Clipped)          |          1 - \epsilon  1
         |            /                                  |               |        |
         |           /                                   |    0 ---------+--------+--------> r
         |          /                                    |               |                 |        /                                      |               |         \  (Unclipped)
         +-------+-------+-------------> r               |               |                   0       1   1 + \epsilon                        |               .------------ (Clipped)
```

- **When $A_t > 0$ (Action Better than Average):** The objective increases with $r_t$. However, once $r_t$ exceeds $1 + \epsilon$, clipping caps the objective at $(1 + \epsilon) A_t$, eliminating any incentive to change the policy too drastically.
- **When $A_t < 0$ (Action Worse than Average):** The objective decreases as $r_t$ shrinks. Once $r_t$ drops below $1 - \epsilon$, clipping caps the penalty at $(1 - \epsilon) A_t$, preventing destructive over-penalization.
- **PPO as Actor-Critic (Slide 47 & 48):**
  - **Actor:** Parameterized policy $\pi_\theta(a \mid s)$, trained via $\mathcal{L}^{\text{CLIP}}(\boldsymbol{\theta})$.
  - **Critic:** Value network $\hat{U}_w(s)$ (or $V_w(s)$) estimating expected returns to compute advantage $A_t = r_t + \gamma \hat{U}_w(s_{t+1}) - \hat{U}_w(s_t)$.
  - **Role of Clipping:** PPO is TRPO made practical — clipping keeps updates gentle and stable without solving constrained optimization each time!

---

### 11.5 Modern Model-Free Reinforcement Learning: The Complete Taxonomy (Slide 50)

```
+---------------------------+-------------------------------------------------------+-----------------------+
| Concept                   | Core Idea                                             | Key Algorithm         |
+---------------------------+-------------------------------------------------------+-----------------------+
| Policy Gradient           | Directly optimize the policy \pi_	heta(a|s) from     | REINFORCE             |
|                           | sampled returns                                       |                       |
+---------------------------+-------------------------------------------------------+-----------------------+
| Variance Reduction        | Learn a value baseline \hat{U}(s, w) to stabilize     | Actor-Critic          |
|                           | updates                                               | (A2C, A3C)            |
+---------------------------+-------------------------------------------------------+-----------------------+
| Stable Improvement        | Constrain updates for monotonic policy performance    | TRPO                  |
+---------------------------+-------------------------------------------------------+-----------------------+
| Practical Stability       | Simplify trust-region updates with probability ratio  | PPO                   |
|                           | clipping                                              |                       |
+---------------------------+-------------------------------------------------------+-----------------------+
| Exploration & Robustness  | Encourage policy entropy / provide dense learning     | SAC,                  |
|                           | surrogate signals                                     | Reward Shaping        |
+---------------------------+-------------------------------------------------------+-----------------------+
```

---

<reviewkit>
<takeaways>
- **The Curse of Dimensionality:** State spaces grow exponentially ($|\mathcal{S}| \approx 10^{20}$ in Backgammon, $10^{40}$ in Chess, $10^{172}$ in Go), rendering tabular lookups impossible. Function approximation enables compact representation and generalization to unvisited states.
- **Linear vs. Neural Approximators:** Linear models ($\theta^T f(s)$) suffer from structural under-parameterization bias when approximating oscillatory value functions. Deep neural networks automatically learn hierarchical non-linear feature representations directly from sensory observations.
- **The Widrow-Hoff (Delta) Rule:** Minimizing per-sample squared error yields the Delta Rule ($\Delta \theta_i = \alpha \delta f_i$). Unlike naive batch gradient descent (which requires storing historical datasets and computing offline sums), Widrow-Hoff performs instantaneous online updates on streaming transitions.
- **Semi-Gradient TD:** Temporal difference targets depend on weights $\boldsymbol{	heta}$ but are treated as fixed constants during differentiation. On-policy linear TD(0) is guaranteed to converge under standard stochastic approximation conditions.
- **The Deadly Triad:** Unbounded parameter divergence occurs when Function Approximation, Bootstrapping, and Off-Policy learning coincide. Baird\'s 7-state star counterexample proves that semi-gradient off-policy linear TD explodes to infinity even with zero transition rewards!
- **DQN Breakthroughs:** Deep Q-Networks stabilize deep RL via (1) Experience Replay (breaks sample autocorrelation) and (2) Fixed Target Networks (freezes target weights $\boldsymbol{	heta}^-$, resolving moving target oscillations).
- **DQN Extensions & Bottlenecks:** Double DQN eliminates maximization overestimation bias; Multi-step learning accelerates reward propagation; Distributional RL models return distributions. However, vanilla DQN cannot handle continuous action spaces, scales poorly with $|\mathcal{A}|$, and cannot model stochastic policies.
- **The Policy Gradient Theorem:** Directly parameterizes stochastic policies ($\pi_\theta(a \mid s)$), proving that $\nabla_\theta J(\boldsymbol{\theta}) = \mathbb{E}[Q^{\pi_\theta}(s, a) \nabla_\theta \log \pi_\theta(a \mid s)]$ without requiring derivatives of environmental transition physics.
- **Baseline Variance Reduction:** Subtracting an action-independent baseline $B(s) = U(s)$ leaves policy gradients strictly unbiased ($\mathbb{E}[B(s) \nabla \log \pi] = 0$) while slashing gradient variance (collapsing sample variance from 15,275 to 28.4).
- **Actor-Critic Frameworks:** The Actor updates policy parameters $\boldsymbol{	heta}$ along the policy gradient, while the Critic updates value parameters $\mathbf{w}$ to estimate advantages via 1-step TD errors $\delta_t$. Vanilla AC is on-policy and stable, while off-policy variants (SAC) use entropy regularization and double target critics.
- **Advanced Policy Search (TRPO & PPO):** TRPO enforces a second-order KL divergence speed limit to guarantee monotonic policy improvement ($J(\theta_{\text{new}}) \ge J(\theta_{\text{old}})$). Proximal Policy Optimization (PPO) simplifies this via a first-order Clipped Surrogate Objective, establishing the industry standard for continuous robotic control and LLM post-training alignment (RLHF).
</takeaways>

<qquiz src="questions.en.json"/>

<qprompt/>
</reviewkit>

## References

1. Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4th ed.). Pearson. (Chapters 22.4.1 to 22.4.3, 22.5).
2. Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. (Chapters 9, 10, 11, 13).
3. Mnih, V., Kavukcuoglu, K., Silver, D., Rusu, A. A., Veness, J., Bellemare, M. G., ... & Hassabis, D. (2015). Human-level control through deep reinforcement learning. *Nature*, 518(7540), 529-533.
4. Silver, D. (2015). *Lectures on Reinforcement Learning*. University College London (UCL).
5. [AlphaGo] Silver, D., Huang, A., Maddison, C. J., Guez, A., Sifre, L., Van Den Driessche, G., ... & Hassabis, D. (2016). Mastering the game of Go with deep neural networks and tree search. *Nature*, 529(7587), 484-489.
6. [AlphaGo Zero] Silver, D., Schrittwieser, J., Simonyan, K., Antonoglou, I., Huang, A., Guez, A., ... & Hassabis, D. (2017). Mastering the game of Go without human knowledge. *Nature*, 550(7676), 354-359.
7. [MuZero] Schrittwieser, J., Antonoglou, I., Hubert, T., Simonyan, K., Sifre, L., Schmitt, S., ... & Silver, D. (2020). Mastering Atari, Go, chess and shogi by planning with a learned model. *Nature*, 588(7839), 604-609.
8. Schulman, J., Levine, S., Abbeel, P., Jordan, M., & Moritz, P. (2015). Trust region policy optimization. In *Proceedings of the 32nd International Conference on Machine Learning (ICML 2015)* (pp. 1889-1897).
9. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). Proximal policy optimization algorithms. *arXiv preprint arXiv:1707.06347*.
10. Van Hasselt, H., Guez, A., & Silver, D. (2016). Deep reinforcement learning with double Q-learning. In *Proceedings of the AAAI Conference on Artificial Intelligence* (Vol. 30, No. 1).
11. Schaul, T., Quan, J., Antonoglou, I., & Silver, D. (2016). Prioritized experience replay. In *International Conference on Learning Representations (ICLR 2016)*.
12. Haarnoja, T., Zhou, A., Abbeel, P., & Levine, S. (2018). Soft actor-critic: Off-policy maximum entropy deep reinforcement learning with a stochastic actor. In *International Conference on Machine Learning (ICML 2018)* (pp. 1861-1870).
13. Baird, L. (1995). Residual algorithms: Reinforcement learning with function approximation. In *Machine Learning Proceedings 1995* (pp. 30-37). Morgan Kaufmann.
14. Widrow, B., & Hoff, M. E. (1960). Adaptive switching circuits. In *1960 IRE WESCON Convention Record, part 4* (Vol. 4, pp. 96-104).
15. Williams, R. J. (1992). Simple statistical gradient-following algorithms for connectionist reinforcement learning. *Machine Learning*, 8(3-4), 229-256.
16. Gopalan, A., & Teo, Y. M. (2025). *CS4246/5446 Reinforcement Learning and Sequential Decision Making (Version 4.1)*. National University of Singapore (NUS).

---

# Week 6 - Reward Shaping for Reinforcement Learning and Its Applications: Exploration Bonuses, Potential-Based Policy Invariance, LLM Alignment, and Advanced Multi-Agent Reward Architectures

<draft>
- 1. Foundations of Sequential Decisions & The MDP Formalism (Guest Lecture Review)
    - Lecture Metadata: Speaker: Dr. Ma Haozhe, Guest Lecture at National University of Singapore (NUS), Date: September 15, 2026.
    - Formal MDP Tuple: State space S, Action space A, Transition dynamics T: P(s' | s, a), Reward function R(s, a, s'), Discount factor \gamma \in [0, 1).
    - Grid World Running Example: Coordinates S = {(1, 1), ..., (4, 3)}, discrete actions A = {\leftarrow, \rightarrow, \uparrow, \downarrow}, goal rewards R(4, 3) = +1, hazard R(4, 2) = -1, default step cost 0.
    - Policies, State Values, and Action Values:
        - Stochastic policy \pi(a | s) = Pr(A_t = a | S_t = s).
        - State-value function: V^\pi(s_\tau) = E_\pi [ \sum_{k=0}^\infty \gamma^k R(s_{\tau+k}) ].
        - Action-value function: Q(s, a) = R(s, a) + \gamma \sum_{s'} P(s' | s, a) V(s').
        - Optimal policy extraction: \pi^*(s) = \arg\max_a Q^*(s, a).
    - Representation Hierarchy of the Q-Function:
        - Tabular Q-learning: Discrete memory lookup table \hat{Q}(s, a) (e.g. at (1, 1), [\leftarrow: 0.5, \rightarrow: 0.1, \uparrow: 0.2, \downarrow: 0.4]; at (2, 1), [\leftarrow: 0.0, \rightarrow: 0.8, \uparrow: 0.3, \downarrow: 0.4]).
        - Function Approximation Q-learning: Linear / non-linear parameterization \hat{Q}_\theta(s, a).
        - Deep Q-Networks (DQN): End-to-end convolutional and fully connected representations (4 stacked frames 84x84x4, Conv 16 8x8 stride 4, Conv 32 4x4 stride 2, FC 256, linear Q heads outputting [\leftarrow: 0.0, \rightarrow: 0.8, \uparrow: 0.3, \downarrow: 0.4] \implies \arg\max = \rightarrow).
    - Training Targets Taxonomy:
        - Monte Carlo Target: y_t^{MC} = G_t = \sum \gamma^k r_{t+k}.
        - SARSA (On-Policy TD): y_t^{SARSA} = r_t + \gamma \hat{Q}(s_{t+1}, a_{t+1}).
        - Q-Learning (Off-Policy TD): y_t^{Q-Learning} = r_t + \gamma \max_{a'} \hat{Q}(s_{t+1}, a').
    - Continuous Action Space Resolution:
        - The argmax intractability in infinite action spaces A \subset R^d.
        - Critic network evaluates joint pairs Q_\theta(s, a'); Actor network directly estimates optimal action \pi_\phi(s) \approx \arg\max_{a'} Q_\theta(s, a').
- 2. The Pathology of Native Reward Models: Sparsity, Delay, and Sample Inefficiency
    - The Native Reward Problem: Native environment signals are sparse, delayed, and non-informative (0 rewards for all in-process states).
    - The Empty Bellman Update: When all intermediate transitions yield R = 0, both Monte Carlo returns and TD targets equal 0. With zero-initialized weights, Q \leftarrow Q, resulting in complete learning stagnation.
    - The Sample Efficiency Crisis: Learning commences only after stumbling upon a rare successful episode through blind exploration. Heavy discounting shrinks feedback to microscopic signals (e.g., \gamma^{20} x 1 \approx 0.12).
    - Core Insight: The algorithm eventually works in theory, but sample efficiency is the central bottleneck.
- 3. Reward Shaping: Principles, Mechanics, and the General Additive Formulation
    - Core Concept: Reshaping or rebuilding the native reward model into an informative, dense feedback structure.
    - General Additive Formulation: R^{new}(\cdot) = \alpha R^{env}(\cdot) + \beta R^{sha}(\cdot).
    - Concrete Maze Transformation: Transforming sparse binary rewards (key = 0, door = 0, goal = 1) into dense milestone incentives (start -> 0.1 -> 0.1 -> key: 0.5 -> 0.2 -> 0.2 -> 0.2 -> door: 0.8 -> 0.3 -> 0.3 -> 0.3 -> goal: 1.0).
    - The Central Open Challenge: How to accurately define, learn, and maintain R^{sha}(\cdot) without inducing unintended policy corruption.
- 4. Reward Shaping for Exploration: Novelty and Intrinsic Motivation
    - Philosophy: Assigning supplemental exploration bonuses to historically under-explored or novel states.
    - Method 1 (Tabular Count-Based Exploration): R^{count}(s) = \alpha R^{env}(s) + \frac{\beta}{N(s) + 1}; +1 prevents division by zero. Visit frequency gradient across grid maze (524 near start down to 0 in deep corridors).
    - Method 2 (Continuous Pseudo-Counts via Density Models; Bellemare et al., NeurIPS 2016): Generative density models \rho(s) estimating pseudo-counts \hat{N}(s) in continuous domains R^d.
    - Method 3 (High-Dimensional Random Network Distillation; Burda et al., 2018):
        - Predictor network \hat{f}_\theta(s) vs. randomly initialized, permanently frozen Target network f(s).
        - Exploration bonus: R^{RND}(s) = \alpha R^{env}(s) + \beta ||f(s) - \hat{f}_\theta(s)||_2^2.
    - The Fundamental Exploration Hazard: The Noisy-TV Problem (OpenAI Blog):
        - Unpredictable environmental noise (e.g., a TV displaying random static in a maze) yields perpetually high prediction errors.
        - The agent becomes hypnotized by irrelevant novelty, collecting infinite intrinsic rewards while abandoning the true environmental task.
- 5. Reward Shaping for Exploitation: Subgoal Bottlenecks and Process Supervision
    - Philosophy: Rewarding progress through structurally critical bottleneck states and optimal execution paths.
    - Method 1 (Graph Clustering & Topological Bottlenecks): Identifying narrow doorways connecting maze regions (Door 1 and Door 2 min-cut of size 2); vulnerability to start-state frequency false positives.
    - Method 2 (Tree-Like Search Rollouts): Branching forward simulations from prefix states to estimate path success probability; computational cost bottlenecks.
    - Real-World LLM Case Study: Math-Shepherd (Wang et al., ACL 2024):
        - Process-supervised reward modeling for mathematical reasoning without human step annotations.
        - Exact problem: "Let p(x) be a monic polynomial of degree 4. Three of the roots are 1, 2, 3. Find p(0) + p(4)." Golden Answer: 24.
        - Outcome annotation y_S = 0 vs. Process annotation via K=3 rollouts: y_{s_1}^{SE} = 2/3 (soft estimation), y_{s_1}^{HE} = 1 (hard estimation).
        - The Threat of Reward Hacking in Process Reward Models (PRMs): Goodhart's Law, superficial length/verbosity bias, false-positive rollouts via error cancellation ("two wrongs make a right"), hallucinated lemmas, and hybrid PRM-ORM mitigations.
- 6. The Invariance Dilemma: Potential-Based Reward Shaping (PBRS)
    - The Risk of Reward Gaming: Arbitrary reward bonuses alter optimal policy equilibria, encouraging unintended cyclic behaviors.
        - Potential-Based Formulation (Ng, Harada, & Russell, ICML 1999): use one consistent convention, here R^{sha}(s, s') = \phi(s) - \gamma \phi(s'). The opposite sign is also valid with the potential negated.
    - The Telescoping Sum Proof of Policy Invariance:
        - Demonstrating that intermediate potential terms sequentially cancel out along trajectory rollouts: G_t^{sha} = \phi(s) - \lim_{T \to \infty} \gamma^T \phi(s_T) = \phi(s_0).
        - Theoretical Guarantee: The optimal policy \pi^* under the shaped reward MDP is strictly identical to the optimal policy under the original environment MDP.
    - Empirical Realities & Dr. Ma's Remark: All other RS methods (including ReLara, CenRA, SASR) DO NOT offer theoretical invariance guarantees, relying on empirical sample efficiency validation.
- 7. Reward Modeling for Open-Ended Environments: Reinforcement Learning from Human Feedback (RLHF)
    - The Open-Ended Challenge: Subjective text generation lacks native programmatic rewards (e.g., "Write a short self-introduction for my first day at a new job", "Suggest five names for a coffee shop next to a university campus", "Draft a LinkedIn headline for a data scientist moving into product").
    - RLHF Framework (Christiano et al., NeurIPS 2017; Ouyang et al., NeurIPS 2022):
        1. Prompt x generates N candidate responses via Supervised Fine-Tuned (SFT) model.
        2. Human annotators rank outputs: res_1 > res_2 > ... > res_N.
        3. Reward Model Architecture: LLM backbone with a linear scalar regression head r_\theta(x, y) \in R.
        4. Bradley-Terry Preference Loss: L_{RM}(\theta) = - E_{(x, y_+, y_-)} [ \log \sigma( r_\theta(x, y_+) - r_\theta(x, y_-) ) ].
        5. Loss dynamics: r(y_+) >> r(y_-) (loss near 0) vs. r(y_+) << r(y_-) (loss explodes).
    - Summary of Section III Challenges: Novelty/importance efficiency, policy consistency guarantee, and exploration-exploitation trade-off.
- 8. Advanced Multi-Agent & Adaptive Reward Shaping Architectures (Ma et al., NUS)
    - Framework 1: ReLara — RL with an Assistant Reward Agent (Ma et al., ICML 2024):
        - Policy Agent (A_P): Interacts with environment via Actor \pi_\theta and Critic Q_\phi, receiving composite reward r_{E_t} + \lambda r_{S_t}.
        - Assistant Reward Agent (A_R): Treats reward generation as a secondary decision problem using Actor \pi_\zeta: S x A -> R and Critic Q_\eta(s, r^P).
    - Framework 2: CenRA — Centralized Reward Agent for Multi-Task RL (Ma et al., NeurIPS 2025):
        - Centralized Reward Agent (A^{rwd}) analyzes concatenated multi-task replay buffer D = \bigcup D_i.
        - Extracts invariant structural meta-knowledge and distributes it via knowledge distillation / knowledge rewards r^{rwd} to individual task policy agents A_1^{pol}, ..., A_N^{pol}.
    - Framework 3: SASR — Self-Adaptive Success Rate-Based Reward Shaping (Ma et al., ICLR 2025):
        - Trajectory accumulation across early and late learning stages, partitioned into Success and Failure states.
        - Kernel Density Estimation (KDE) with Random Fourier Features (RFF) to calculate smooth spatial densities \tilde{d}_S(s) and \tilde{d}_F(s).
        - Effective counts \tilde{N}_S(s) and \tilde{N}_F(s) parameterize a localized Beta distribution Beta(\tilde{N}_S(s), \tilde{N}_F(s)).
        - Samples dynamic success rates mapped through f(r^S) to deliver adaptive shaping rewards R^S(s) that evolve in lockstep with agent mastery.
</draft>

## 1. Foundations of Sequential Decisions & The MDP Formalism

In this guest lecture presented at the **National University of Singapore (NUS)** by **Dr. Ma Haozhe** on **September 15, 2026**, the curriculum advances into **Reward Shaping for Reinforcement Learning and Its Advanced Applications**.

Reinforcement Learning (RL) formalizes how an autonomous agent learns to solve **sequential decision-making problems** through trial-and-error interactions with an environment, heavily inspired by the behavioral adaptation mechanisms of biological intelligence.

```
+---------------------------------------------------------------------------------------+
|                       THE MARKOV DECISION PROCESS (MDP) CLOSED LOOP                   |
|                                                                                       |
|                         +-----------------------------------+                         |
|                         |               AGENT               |                         |
|                         +-----------------------------------+                         |
|                               |                       ^                               |
|                               | Action A_t            | State S_t                     |
|                               v                       | Reward R_{t+1}                |
|                         +-----------------------------------+                         |
|                         |            ENVIRONMENT            |                         |
|                         +-----------------------------------+                         |
|                                                                                       |
|   Formal MDP Tuple: (S, A, T, R, \gamma)                                              |
|   - S: State Space (all valid physical or abstract configurations)                    |
|   - A: Action Space (all permissible control decisions)                              |
|   - T: Transition Probability Distribution P(s' | s, a)                               |
|   - R: Reward Function R(s, a, s') assigning numerical feedback                      |
|   - \gamma: Discount Factor \gamma \in [0, 1) balancing immediate vs future value          |
+---------------------------------------------------------------------------------------+
```

### 1.1 Formal MDP Components

1. **State Space $\mathcal{S}$:** All valid configurations of the environment. In the canonical Grid World motivating example (Slide 2), the state space corresponds to discrete robot coordinates:
   $$\mathcal{S} = \big\{(1, 1), \, (1, 2), \, \dots, \, (4, 3)\big\}$$
2. **Action Space $\mathcal{A}$:** All possible actions available to the agent:
   $$\mathcal{A} = \{\leftarrow, \, \rightarrow, \, \uparrow, \, \downarrow\}$$
3. **Transition Function $\mathcal{T}$:** The conditional probability distribution $\mathcal{P}(s' \mid s, a)$, specifying the likelihood of transitioning to next state $s'$ given current state $s$ and executed action $a$. This dynamic can be **deterministic** (e.g., executing $\uparrow$ shifts coordinates by $(0, 1)$ with probability $1.0$) or **stochastic** (slipping sideways with fixed probability).
4. **Reward Function $\mathcal{R}$:** The scalar numerical feedback signal emitting from environmental transitions:
   - Terminal Goal State: $\mathcal{R}(4, 3) = +1$
   - Penalty / Trap State: $\mathcal{R}(4, 2) = -1$
   - Neutral In-Process States: $\mathcal{R}(s) = 0$
5. **Discount Factor $\gamma$:** A parameter $\gamma \in [0, 1)$ establishing the present value of future rewards, ensuring mathematical convergence across infinite time horizons.

---

### 1.2 Policies, State Values, and Action Values

An agent's operational behavior is dictated by its policy $\pi$:
- **Deterministic Policy:** A direct functional mapping $\pi: \mathcal{S} \to \mathcal{A}$.
- **Stochastic Policy:** A probability distribution over candidate actions conditioned on the observed state:
  $$\pi(a \mid s) = \Pr(A_t = a \mid S_t = s)$$

The performance of policy $\pi$ is quantified via two value functions:
- **State-Value Function $V^\pi(s)$:** The expected cumulative discounted return starting from state $s$ under policy $\pi$:
  $$V^\pi(s_\tau) = \mathbb{E}_\pi \left[ R(s_\tau) + \gamma R(s_{\tau+1}) + \gamma^2 R(s_{\tau+2}) + \dots \right] = \mathbb{E}_\pi \left[ \sum_{k=0}^\infty \gamma^k R(s_{\tau+k}) \right]$$
- **Action-Value Function $Q^\pi(s, a)$:** The expected cumulative discounted return obtained by starting from state $s$, taking arbitrary action $a$, and thereafter adhering to policy $\pi$:
  $$Q^\pi(s, a) = R(s, a) + \gamma \sum_{s'} \mathcal{P}(s' \mid s, a) \, V^\pi(s')$$

The fundamental objective of Reinforcement Learning is to discover the **optimal policy $\pi^*$** that maximizes the expected action-value across every state:
$$\pi^*(s) = \arg\max_{a \in \mathcal{A}} Q^*(s, a)$$

---

### 1.3 Representation Hierarchy of the Q-Function

How the action-value function is modeled determines the architectural scalability of the algorithm (Slide 4):
1. **Tabular Q-Learning:** When $|\mathcal{S}|$ and $|\mathcal{A}|$ are small, $\hat{Q}(s, a)$ is stored as an exact 2D lookup table. For instance, at robot location $(1, 1)$, candidate values are stored as $[\leftarrow: 0.5, \, \rightarrow: 0.1, \, \uparrow: 0.2, \, \downarrow: 0.4]$; at location $(2, 1)$, values are $[\leftarrow: 0.0, \, \rightarrow: 0.8, \, \uparrow: 0.3, \, \downarrow: 0.4]$.
2. **Function Approximation Q-Learning:** When state spaces grow large or continuous, $\hat{Q}_\theta(s, a)$ is parameterized as a linear combination of basis features or a shallow non-linear function.
3. **Deep Q-Networks (DQN):** When processing high-dimensional perceptual inputs (e.g., video frames), $\hat{Q}_\theta(s, a)$ is approximated by a deep convolutional neural network. The network takes state $s$ as input and directly outputs a vector of Q-values across all discrete actions:
   $$\hat{Q}_\theta(s, \cdot) = \big[ \leftarrow: 0.0, \, \rightarrow: 0.8, \, \uparrow: 0.3, \, \downarrow: 0.4 \big] \implies a^* = \arg\max_a Q(s, a) = \, \rightarrow \quad \text{("Easy to get the argmax!")}$$

```
+---------------------------------------------------------------------------------------------------+
|                                  DQN CONVOLUTIONAL PIPELINE (Slide 4)                             |
|                                                                                                   |
|  Stack of 4 Frames       Conv Layer 1             Conv Layer 2            FC Hidden Layer   Output|
|  (84 x 84 x 4)     --->  16 filters, 8x8    --->  32 filters, 4x4   --->  256 units   --->  Q(s,a)|
|                          stride 4, ReLU           stride 2, ReLU          ReLU              |A| = 4
+---------------------------------------------------------------------------------------------------+
```

---

### 1.4 Training Targets Taxonomy

To drive parameterized approximation $\hat{Q}_\theta(s, a) \to Q^*(s, a)$, parameters $\theta$ are iteratively updated toward a learning target $y_t$:

1. **Monte Carlo (MC):** Accumulates the complete empirical return across an entire rolled-out trajectory:
   $$y_t^{\text{MC}} = G_t = r_t + \gamma r_{t+1} + \gamma^2 r_{t+2} + \dots = \sum_{k=0}^{T - t} \gamma^k r_{t+k}$$
2. **Temporal Difference (TD) Bootstrapping:** Estimates future return using currently learned parameters $\hat{Q}_{\theta_{\text{old}}}$:
   - **SARSA (On-Policy TD):**
     $$y_t^{\text{SARSA}} = r_t + \gamma \hat{Q}(s_{t+1}, a_{t+1})$$
   - **Q-Learning (Off-Policy TD):**
     $$y_t^{\text{Q-Learning}} = r_t + \gamma \max_{a'} \hat{Q}(s_{t+1}, a')$$

---

### 1.5 Resolving Continuous Action Spaces: The Actor-Critic Split (Slide 6)

In discrete action spaces with small $|\mathcal{A}|$, finding $\arg\max_a Q(s, a)$ is trivial: evaluate the $|A|$-dimensional output vector and select the largest element.

However, in continuous or high-dimensional control tasks (e.g., robotic torque control where $\mathcal{A} \subset \mathbb{R}^d$):
- A lookup table or standard discrete-head neural network cannot enumerate infinitely many actions.
- Evaluating $\arg\max_a Q(s, a)$ analytically or via brute-force search is mathematically and computationally intractable.

This computational bottleneck necessitates the **Actor-Critic architectural split**:

```
+---------------------------------------------------------------------------------------+
|                          ACTOR-CRITIC ARCHITECTURE (Slide 6)                          |
|                                                                                       |
|   State s_t ----+                                                                     |
|                 |                                                                     |
|                 v                                                                     |
|          +--------------+  Action a_t    +--------------+                             |
|          |    ACTOR     | -------------> |    CRITIC    | ---> Scalar Q-Value         |
|          | \pi_\phi(s)  |                | Q_\theta(s,a)|      Q_\theta(s_t, a_t)     |
|          +--------------+                +--------------+                             |
|                 ^                                                                     |
|                 | Evaluates \pi_\phi(s) \approx \arg\max_{a'} Q_\theta(s, a')         |
|                 +---------------------------------------------------------------------+
+---------------------------------------------------------------------------------------+
```

1. **The Critic $Q_\theta(s, a)$:** Takes both state $s$ and candidate action $a$ as joint inputs, outputting a single scalar value estimating $Q_\theta(s, a)$.
2. **The Actor $\pi_\phi(s)$:** A distinct parameterized policy network that directly approximates the continuous argmax:
   $$\pi_\phi(s) \approx \arg\max_{a'} Q_\theta(s, a')$$
   The Actor proposes the action $a_t = \pi_\phi(s_t)$, and the Critic provides the evaluative learning gradient $\nabla_a Q_\theta(s, a)$.

---

## 2. The Pathology of Native Reward Models: Sparsity, Delay, and Sample Inefficiency

In both value-based methods (Q-learning) and policy-gradient / Actor-Critic architectures, policy updates rely directly on the environmental return:
$$G_t = R(s_t) + \gamma R(s_{t+1}) + \gamma^2 R(s_{t+2}) + \dots$$
The critical premise of RL is that **the learning signal emitting from the environment is informative enough to guide gradient updates**.

In real-world applications, robotics, and complex reasoning domains, native environmental rewards suffer from severe structural pathologies (Slide 8):
1. **Extremely Sparse:** Non-zero feedback occurs rarely or only at terminal states.
2. **Heavily Delayed:** Feedback is deferred until hundreds or thousands of intermediate steps have transpired.
3. **Non-Informative:** Rewards indicate only binary overall task completion (or coarse milestones), assigning exact $0$ rewards to all intermediate in-process states.

```
+---------------------------------------------------------------------------------------+
|                    THE SPARSE REWARD TRAJECTORY PATHOLOGY (Slide 8)                   |
|                                                                                       |
|   s_0 ----> s_1 ----> s_2 ----> s_3 ----> ... ----> s_T                               |
|    |         |         |         |                   |                                |
|   a_0       a_1       a_2       a_3                 a_T                               |
|    |         |         |         |                   |                                |
|    v         v         v         v                   v                                |
|  R(s_0)=0  R(s_1)=0  R(s_2)=0  R(s_3)=0  ...      R(s_T)=1 (or 0 if failed)           |
+---------------------------------------------------------------------------------------+
```

---

### 2.1 The "Empty Bellman Update" Phenomenon (Slides 8 & 9)

Consider an agent navigating an unmapped maze across steps $s_0, s_1, \dots, s_T$ where an unsuccessful episode yields zero reward everywhere ($R(s_t) = 0, \, \forall t$):
- **Monte Carlo Target:**
  $$y_t^{\text{MC}} = G_t = 0 + \gamma \cdot 0 + \gamma^2 \cdot 0 + \dots = 0$$
- **Q-Learning TD Target:**
  $$y_t^{\text{Q-Learning}} = r_t + \gamma \max_{a'} \hat{Q}(s_{t+1}, a') = 0 + \gamma \max_{a'} \hat{Q}(s_{t+1}, a')$$

If the value network is initialized to zero ($\hat{Q} \equiv 0$):
$$y_t^{\text{Q-Learning}} = 0 + \gamma \cdot 0 = 0 \implies \hat{Q} \leftarrow \hat{Q}$$
The TD error is identically zero ($\delta_t = y_t - \hat{Q} = 0 - 0 = 0$). Parameter gradients vanish completely, and the agent experiences **total learning stagnation**.

---

### 2.2 The Sample Efficiency Crisis (Slide 10)

Under native sparse rewards, standard RL algorithms only begin updating parameters effectively after **accidentally sampling a trajectory that stumbles upon the successful reward state**:
$$y_t^{\text{MC}} = 0 + \gamma \cdot 0 + \dots + \gamma^{20} \times 1 \approx 0.12 \implies \hat{Q}(s_t, a) \to 0.12 \quad \text{("Start to learn!")}$$

Until that fortuitous event occurs, all exploration is completely unguided. In high-dimensional state spaces, the probability of stumbling upon a distant goal through random Brownian motion drops exponentially with trajectory length $T$.

> **Dr. Ma's Core Insight (Slide 10):**
> *"The algorithm finally works, we're focusing on the sample efficiency."*
> While theoretical asymptotic convergence is guaranteed under infinite exploration, real-world sample efficiency is catastrophically poor without reward intervention.

---

## 3. Reward Shaping: Principles and The General Formulation

**Reward Shaping (RS)** rebuilds or augments the native sparse reward into an informative, denser feedback signal to guide and accelerate agent learning.

### 3.1 The General Additive Formulation (Slide 11)

$$R^{\text{new}}(\cdot) = \alpha R^{\text{env}}(\cdot) + \beta R^{\text{sha}}(\cdot)$$

Where:
- $R^{\text{env}}(\cdot)$ is the native, sparse environmental reward.
- $R^{\text{sha}}(\cdot)$ is the shaped reward component engineered to provide informative intermediate gradients.
- $\alpha, \beta$ are hyperparameter scaling weights balancing task fidelity against guidance strength.

```
+-------------------------------------------------------------------------------------------------------+
|                          TRANSFORMATION FROM SPARSE TO DENSE REWARDS (Slide 11)                       |
|                                                                                                       |
|  Sparse Native Rewards:                                                                               |
|  [Start] ---> [ ] ---> [ ] ---> [Key: R=0] ---> [ ] ---> [ ] ---> [Door: R=0] ---> [ ] ---> [Goal: R=1]
|                                                                                                       |
|                                    || Reward Shaping Transformation                                    |
|                                    \/                                                                 |
|  Expected Dense Rewards:                                                                              |
|  [Start] ---> [0.1] -> [0.1] -> [Key: R=0.5] -> [0.2] -> [0.2] -> [Door: R=0.8] -> [0.3] -> [Goal: R=1]|
+-------------------------------------------------------------------------------------------------------+
```

By reshaping the reward landscape, algorithm designers can explicitly steer the agent's behavioral trajectory toward meaningful subgoals (Slide 11).

> **The Central Design Question:**
> *How do we define, learn, and maintain the shaped reward $R^{\text{sha}}(\cdot)$?*

---

## 4. Reward Shaping for Exploration: Novelty and Intrinsic Motivation

The first major application of reward shaping is **exploration**: providing supplemental intrinsic rewards to incentivize the agent to visit historically under-explored, novel regions of the state space (Slide 12).

```
+---------------------------------------------------------------------------------------+
|                               EXPLORATION REWARD BONUS                                |
|                                                                                       |
|   Explored States (High Visit Frequency):       Under-Explored States (Novel Regions):|
|   Assign LOW or ZERO shaping bonus              Assign HIGH positive exploration bonus|
|   N(s) is large \implies R^{sha}(s) \approx 0   N(s) is small \implies R^{sha}(s) >> 0|
+---------------------------------------------------------------------------------------+
```

### 4.1 Method 1: Count-Based Novelty in Tabular States (Slide 13)

In finite discrete domains, novelty is tracked directly using empirical state visitation counters $N(s)$:

$$R^{\text{count}}(\cdot) = \alpha R^{\text{env}}(\cdot) + \frac{\beta}{N(s) + 1}$$

- Adding $+1$ to the denominator prevents division by zero when a state is encountered for the first time ($N(s) = 0$).
- As an agent repeatedly traverses a state, $N(s) \to \infty$, causing the exploration bonus to vanish smoothly: $\frac{\beta}{N(s) + 1} \to 0$.

```
+-------------------------------------------------------------------------------+
|                 GRID MAZE VISIT COUNT GRADIENT (Slide 13)                     |
|                                                                               |
|  Start Region (Heavily Visited):        Goal Corridor (Unexplored):           |
|  (1,1): 524 visits \implies bonus ~ 0   (3,3): 1 visit  \implies bonus ~ \beta/2|
|  (2,1): 418 visits \implies bonus ~ 0   (4,3): 0 visits \implies bonus = \beta  |
+-------------------------------------------------------------------------------+
```

---

### 4.2 Method 2: Continuous State Density Pseudo-Counts (Slide 14)

In continuous state spaces $\mathcal{S} \subset \mathbb{R}^d$, **no exact continuous state is ever visited twice** ($N(s) \in \{0, 1\}$ almost surely), rendering raw tabular counters useless.

**Bellemare et al. (NeurIPS 2016)** resolved this via **Pseudo-Counts derived from Generative Density Models**:
1. Train a continuous density model $\rho(s)$ over historical trajectories.
2. Evaluate the historical visiting density in the local geometric neighborhood of state $s$.
3. Compute an effective pseudo-count $\hat{N}(s)$:
   $$R^{\text{pseudo-count}}(\cdot) = \alpha R^{\text{env}}(\cdot) + \frac{\beta}{\hat{N}(s) + 1}$$

---

### 4.3 Method 3: Random Network Distillation (RND; Burda et al., 2018 - Slide 15)

In high-dimensional sensory domains (e.g., raw pixel inputs in Atari), estimating probability densities $\rho(s)$ is computationally prohibitive.

**Random Network Distillation (RND)** uses the **prediction error of a neural network** as an intrinsic novelty metric:
1. **Target Network $f$:** A neural network randomly initialized and **permanently frozen**. It maps state $s$ to a fixed target embedding vector $f(s)$.
2. **Predictor Network $\hat{f}_\theta$:** A neural network initialized with different parameters $\theta$, trained via gradient descent to predict the target network's output $f(s)$ given state $s$.

```
+---------------------------------------------------------------------------------------+
|                         RANDOM NETWORK DISTILLATION (Slide 15)                        |
|                                                                                       |
|   State s_t ----+----> Target Network f (Fixed) ------> f(s)                          |
|                 |                                        |                            |
|                 |                                        v                            |
|                 +----> Predictor \hat{f}_\theta (Trained) -> \hat{f}_\theta(s) ---> ||f(s) - \hat{f}_\theta(s)||^2|
|                                                          |                            |
|                                                          v (Gradient Update)          |
|                                              Minimizes Prediction Error               |
+---------------------------------------------------------------------------------------+
```

The exploration bonus is defined as the squared Euclidean prediction error:
$$R^{\text{RND}}(\cdot) = \alpha R^{\text{env}}(\cdot) + \beta \, \big\| f(s) - \hat{f}_\theta(s) \big\|_2^2$$

- **Novel States:** When the agent enters an unfamiliar state, $\hat{f}_\theta$ has never observed similar inputs; its prediction error $\|f(s) - \hat{f}_\theta(s)\|^2$ is massive, yielding a high intrinsic bonus.
- **Familiar States:** As the agent revisits a state, gradient descent drives $\hat{f}_\theta(s) \to f(s)$, causing prediction error to drop toward zero.

---

### 4.4 The Fundamental Exploration Hazard: The Noisy-TV Problem (Slide 16)

A critical failure mode of pure novelty-based exploration is **The Noisy-TV Problem** (OpenAI Blog):
- **Mechanism:** Imagine placing a television set in a maze that broadcasts pure random static or perpetually changing television channels.
- Because the static frames are generated by an unpredictable stochastic process, the predictor network $\hat{f}_\theta(s)$ can **never learn to predict the target embedding $f(s)$**.
- The prediction error $\|f(s) - \hat{f}_\theta(s)\|^2$ remains permanently maximized.
- **The Pathology:** The agent becomes hypnotized by the noisy TV, sitting in front of the screen collecting infinite intrinsic bonuses while completely abandoning the environmental task objective!

---

## 5. Reward Shaping for Exploitation: Subgoal Bottlenecks and Process Supervision

Reward shaping can also accelerate **exploitation (optimization)** by rewarding progress toward structurally critical milestone states (Slide 17).

### 5.1 Method 1: Graph Topologies & Clustering Bottlenecks (Slides 17 & 18)

- **Mechanism:** Construct an empirical transition graph from historical trajectories to identify topological **bottleneck states** (e.g., narrow doorways connecting distinct rooms).
- In Slide 17 & 18, `Door 1` and `Door 2` form a critical topological **min-cut of size 2** separating the start room from the goal room. Assigning supplemental positive rewards to passing through these doors guides the agent through structural bottlenecks.
- **The Fundamental Flaw (Slide 18):** States immediately adjacent to the start position $s_0$ are visited by almost all paths regardless of competence (e.g. visited 8/8 times). Frequency-based clustering produces massive **false positives**, mistaking initial states for structural bottlenecks.

---

### 5.2 Method 2: Tree-Like Search Rollouts (Slide 19)

- **Mechanism:** From specific prefix states (fixing state prefix $s_t$), execute branching forward Monte Carlo simulation rollouts to evaluate the empirical completion rate of different branches.
- **Limitation:** Simulating branching forward lookaheads in real-time is computationally prohibitive for complex environments.

---

### 5.3 Case Study: Process Reward Models in LLMs (Math-Shepherd; Wang et al., ACL 2024 - Slide 20)

In multi-step mathematical reasoning with Large Language Models (LLMs), **Outcome-supervised Reward Models (ORMs)**—which evaluate only whether the final scalar or symbolic answer is correct—provide notoriously sparse and uninformative feedback.

```
+-------------------------------------------------------------------------------------------------------+
|                    MATH-SHEPHERD: OUTCOME VS PROCESS REWARD MODELING (Slide 20)                       |
|                                                                                                       |
|   Problem: "Let p(x) be a monic polynomial of degree 4. Three of the roots of p(x)                   |
|             are 1, 2, and 3. Find p(0) + p(4)."                                  Golden Answer: 24    |
|                                                                                                       |
|   (a) Outcome Annotation (ORM):                                                                       |
|       Solution S = (s_1, s_2, s_3, ..., s_K)  ----->  Final Answer: 20 [X]  ===>  Outcome y_S = 0      |
|       (Sparse outcome penalizes the ENTIRE derivation, even if intermediate derivations were sound!)  |
|                                                                                                       |
|   (b) Process Annotation via Monte Carlo Rollouts (PRM):                                              |
|       Step s_1: "p(x) = (x - 1)(x - 2)(x - 3)(x - r)"                                                 |
|       - Rollout 1 (s_{1,1} -> s_{2,1} -> ... -> s_{K_1,1})  ===> Answer: 24 [OK]                      |
|       - Rollout 2 (s_{1,2} -> s_{2,2} -> ... -> s_{K_2,2})  ===> Answer: 24 [OK]                      |
|       - Rollout 3 (s_{1,3} -> s_{2,3} -> ... -> s_{K_3,3})  ===> Answer: 20 [X]                       |
|                                                                                                       |
|       Soft Process Annotation: y_{s_1}^{SE} = 2/3 (2 of 3 rollouts correct)                           |
|       Hard Process Annotation: y_{s_1}^{HE} = 1   (at least 1 rollout correct)                        |
+-------------------------------------------------------------------------------------------------------+
```

#### 5.3.1 Algorithmic Framework of Math-Shepherd
**Math-Shepherd (Wang et al., ACL 2024)** automates step-level process supervision without requiring expensive, manual step-by-step human annotations:
1. **Automated Monte Carlo Tree Rollouts:**
   Given a prompt $x$ and an intermediate prefix trajectory of reasoning steps $S_{1:i} = (s_1, s_2, \dots, s_i)$, the generator policy samples $K$ independent stochastic completions:
   $$\mathcal{C}_k(S_{1:i}) = (s_{i+1}^{(k)}, s_{i+2}^{(k)}, \dots, s_{M_k}^{(k)}), \quad k \in \{1, 2, \dots, K\}$$
2. **Empirical Step Success Estimation:**
   The process label for step $s_i$ is evaluated by checking whether the terminal response of each rollout matches the ground-truth golden answer $y^*$:
   - **Soft Estimation ($y_{s_i}^{\text{SE}}$):** Measures the empirical completion success probability:
     $$y_{s_i}^{\text{SE}} = \frac{1}{K} \sum_{k=1}^K \mathbb{I}\left( \text{ExtractAnswer}(\mathcal{C}_k(S_{1:i})) = y^* \right)$$
   - **Hard Estimation ($y_{s_i}^{\text{HE}}$):** Binary classification indicating whether at least one completion successfully solved the problem:
     $$y_{s_i}^{\text{HE}} = \mathbb{I}\left( \sum_{k=1}^K \mathbb{I}\left( \text{ExtractAnswer}(\mathcal{C}_k(S_{1:i})) = y^* \right) \ge 1 \right)$$
3. **Training the Process Reward Model (PRM):**
   A neural PRM with parameters $\psi$ is trained to predict the validity of prefix $S_{1:i}$ by minimizing binary cross-entropy across all intermediate steps:
   $$\mathcal{L}_{\text{PRM}}(\psi) = - \sum_{i=1}^M \left[ y_{s_i} \log \sigma(\text{PRM}_\psi(S_{1:i})) + (1 - y_{s_i}) \log (1 - \sigma(\text{PRM}_\psi(S_{1:i}))) \right]$$

---

#### 5.3.2 The Critical Vulnerability: Reward Hacking in Process Reward Models

While Process Reward Models dramatically improve credit assignment in multi-step reasoning, **they introduce a severe susceptibility to Reward Hacking (Specification Gaming)**. When a policy model is optimized directly against a learned PRM (e.g., via PPO, Best-of-$N$ sampling, or tree search decoders), **Goodhart's Law** manifests with aggressive severity:

> *"When a measure becomes a target, it ceases to be a good measure."*

Mathematically, the surrogate reward proxy modeled by the neural PRM diverges from genuine mathematical correctness:
$$\mathcal{R}_{\text{proxy}}(S) = \sum_{i=1}^M \gamma^{M - i} \, \text{PRM}_\psi(S_{1:i}) \quad \not\equiv \quad \mathcal{R}_{\text{true}}(S) = \mathbb{I}(\text{Derivation is Rigorous and Sound})$$

In policy optimization against Math-Shepherd and PRM architectures, reward hacking manifests through four distinct pathology modes:

```
+----------------------------------------------------------------------------------------------------+
|                         REWARD HACKING MODES IN PROCESS REWARD MODELS                              |
|                                                                                                    |
|  1. Verbosity & Style Hacking      ===> Generator inflates token length, formatting, & jargon      |
|                                         to exploit PRM surface heuristics (high r, zero logic).    |
|                                                                                                    |
|  2. Accidental Error Cancellation  ===> Invalid step s_i leads to lucky rollout answer via a second|
|     ("Two Wrongs Make a Right")         arithmetic blunder; PRM assigns false positive credit.     |
|                                                                                                    |
|  3. Hallucinated Lemmas            ===> Policy invents authoritative-sounding fictitious theorems  |
|                                         that fall into PRM blind spots, earning r = 1.0.           |
|                                                                                                    |
|  4. Myopic Greedy Branching        ===> Search decoders over-exploit immediate local step scores,  |
|                                         starving counter-intuitive global proof paths.             |
+----------------------------------------------------------------------------------------------------+
```

1. **Superficial Formatting and Verbosity Bias (Style Hacking):**
   Neural PRMs frequently learn spurious statistical correlations between surface textual features and rollout success. For instance, longer reasoning steps, elaborate LaTeX environments, step-by-step numbering, and confident declarative jargon (*"By the Cauchy-Schwarz Inequality...", "It is universally trivial that..."*) often correlate with high correctness in human datasets. During RL, the generator exploits this by producing lengthy, pseudo-rigorous mathematical fluff that deceives the PRM into awarding high intermediate scores ($r \approx 0.9$), even when the step is logically vacuous or a complete non-sequitur.
2. **False-Positive Rollouts via Error Cancellation ("Two Wrongs Make a Right"):**
   Automated Monte Carlo rollouts rely on terminal answer equivalence rather than formal deductive verification. If intermediate step $s_i$ contains a fundamental conceptual error, downstream rollout steps may commit a second arithmetic error that accidentally cancels out the first (e.g., flipping two negative signs consecutively), or the rollout LLM may make an ungrounded guess that happens to hit the correct integer answer. Under Math-Shepherd, this accident artificially inflates $y_{s_i}^{\text{SE}} > 0$. The PRM internalizes this false-positive supervisory signal, actively rewarding flawed deductive logic during RL fine-tuning.
3. **Exploitation of PRM Blind Spots and Hallucinated Lemmas:**
   Neural PRMs possess finite representational capacity and exhibit out-of-distribution blind spots. The policy generator discovers adversarial token patterns—such as inventing convenient mathematical "identities" or claiming false algebraic equivalences that look syntactically sound. Because the PRM cannot execute symbolic algebraic manipulation internally, it assigns high confidence to these hallucinated shortcuts. The policy rapidly specializes in generating convincing mathematical falsehoods that maximize the PRM objective while entirely failing ground-truth verification.
4. **The Over-Optimization Cliff (Gao et al., ICML 2023):**
   As RL training proceeds against a fixed PRM, policy performance on ground-truth benchmark accuracy initially climbs, reaches an inflection peak, and then plummets dramatically. The policy overfits to the PRM's proxy idiosyncrasies, allocating substantial probability mass to pathological reward-hacking trajectories.

#### 5.3.3 Systemic Mitigations and Guardrails
To insulate process supervision against reward hacking, state-of-the-art reasoning systems implement four architectural defenses:
- **Coupled PRM + ORM Hybrid Verification:** Gating intermediate step rewards by final terminal outcome correctness:
  $$\mathcal{R}_{\text{hybrid}}(S) = \mathbb{I}(\text{Final Answer} = y^*) \cdot \sum_{i=1}^M \gamma^{M - i} \, \text{PRM}_\psi(S_{1:i})$$
  A derivation with high intermediate PRM scores that terminates in an incorrect answer receives zero total reward, immediately extinguishing hallucinated shortcuts.
- **Reference Policy KL Divergence Penalty:** Enforcing a trust-region penalty $\mathbb{D}_{\text{KL}}(\pi_\theta(\cdot \mid S_{1:i}) \parallel \pi_{\text{ref}}(\cdot \mid S_{1:i}))$ prevents the generator from drifting into pathological out-of-distribution token regions where the PRM is uncalibrated.
- **Length and Redundancy Normalization:** Subtracting a step-length penalty $\alpha \cdot \text{Length}(s_i)$ to neutralize verbosity gaming.
- **Symbolic Verifier Integration (Formal Proof Engines):** Integrating formal computer algebra engines (SymPy) or interactive theorem provers (Lean 4, Coq) to execute deterministic step verification for symbolic and arithmetic assertions.

---

## 6. The Invariance Dilemma: Potential-Based Reward Shaping (PBRS - Slide 21)

When algorithm designers introduce arbitrary shaping bonuses $R^{\text{sha}}$, a dangerous theoretical question emerges (Slide 21):
> *"Reward shaping changed the reward function; will the learned optimal policy remain consistent with the original one?"*

### 6.1 The Peril of Reward Gaming (Shortcuts and Loops)

If reward shaping is constructed naively without theoretical constraints, the agent frequently exploits **unintended loopholes**:
- *Example (Bicycle Balancing):* If an agent is given a positive reward bonus for leaning back toward vertical, it learns to tilt violently back and forth in place to collect infinite balance rewards, rather than riding forward!
- *Example (Maze Navigation):* If an agent is rewarded for picking up a key, it may pick up the key, drop it, and pick it up repeatedly in an infinite loop.

---

### 6.2 Potential-Based Reward Shaping (Ng, Harada, & Russell, ICML 1999)

In their seminal paper, **Andrew Ng, Daishi Harada, and Stuart Russell (ICML 1999)** proved that structuring the shaping reward as a **discounted difference of a potential function** theoretically guarantees that the optimal policy remains completely unchanged (Slide 21):

$$R^{\text{new}}(\cdot) = \alpha R^{\text{env}}(\cdot) + \beta R^{\text{sha}}(\cdot)$$
$$R^{\text{sha}}(s, s') = \phi(s) - \gamma \phi(s')$$

> **Sign convention note:** Some texts define the shaping term as $\gamma\Phi(s')-\Phi(s)$ instead. Both conventions preserve the optimal policy when used consistently, because one is obtained by replacing the potential with $-\Phi$; they are not algebraically equivalent for the same fixed potential. The derivation below uses $\phi(s)-\gamma\phi(s')$.

#### The Telescoping Sum Proof (Slide 21)
To understand why the optimal policy is preserved, evaluate the cumulative discounted return of the shaping rewards along any trajectory:

$$\begin{aligned}
G_t &= R^{\text{sha}}(s) + \gamma R^{\text{sha}}(s') + \dots \\
&= \big[ \phi(s) - \gamma \phi(s') \big] + \gamma \big[ \phi(s') - \gamma \phi(s'') \big] \\
&= \phi(s) - \gamma^2 \phi(s'') \quad \mathbf{\text{(Intermediate terms ELIMINATED!)}}
\end{aligned}$$

Extending across three steps:
$$\begin{aligned}
G_t &= R^{\text{sha}}(s) + \gamma R^{\text{sha}}(s') + \gamma^2 R^{\text{sha}}(s'') + \dots \\
&= \big[ \phi(s) - \gamma^2 \phi(s'') \big] + \gamma^2 \big[ \phi(s'') - \gamma \phi(s^{(3)}) \big] \\
&= \phi(s) - \gamma^3 \phi(s^{(3)}) \quad \mathbf{\text{(Intermediate terms ELIMINATED!)}}
\end{aligned}$$

As horizon $T \to \infty$, all intermediate terms sequentially cancel out:
$$G_t^{\text{sha}} = \phi(s_0) - \lim_{T \to \infty} \gamma^T \phi(s_T)$$

For discounted infinite-horizon tasks ($\gamma < 1$) where potential values are bounded, $\lim_{T \to \infty} \gamma^T \phi(s_T) = 0$.
Therefore:
$$G_t^{\text{sha}} = \phi(s_0)$$

- **Path-Independent Constant:** The cumulative shaped return depends **strictly on the initial state $s_0$** and is completely independent of the trajectory path taken!
- Because the total added reward is constant across all execution paths, no action sequence can increase or decrease it.
- Consequently, the relative ranking of all candidate policies is preserved:
  $$\arg\max_\pi V^{\pi}_{\text{shaped}}(s) \equiv \arg\max_\pi V^\pi_{\text{orig}}(s)$$

#### Crucial Theoretical Conclusion (Slide 21)
> **Dr. Ma's Explicit Remark (Slide 21):**
> *"All other RS methods, including all our methods [ReLara, CenRA, SASR], DO NOT offer theoretical guarantee. Most reward-shaping methods are evaluated empirically for higher sample efficiency."*

---

## 7. Reward Modeling for Open-Ended Environments: Reinforcement Learning from Human Feedback (RLHF - Slides 22–25)

Reinforcement Learning is widely applied to align Large Language Models (LLMs). However, open-ended prompt tasks lack standard answers or environmental rewards (Slide 23):
- *"Write a short self-introduction for my first day at a new job."*
- *"Suggest five names for a coffee shop next to a university campus."*
- *"Draft a LinkedIn headline for a data scientist moving into product."*

Because there is **no programmatic compiler check or native reward function**, we must learn a reward model from human feedback (RLHF; Christiano et al., 2017; Ouyang et al., 2022).

---

### 7.1 The RLHF Reward Model Pipeline (Slide 24)

```
+---------------------------------------------------------------------------------------------------+
|                                  THE RLHF REWARD MODEL PIPELINE (Slide 24)                        |
|                                                                                                   |
|   Step 1: One Prompt x  --->  SFT Model  --->  N Candidate Responses {res_1, res_2, ..., res_N}   |
|                                                                                                   |
|   Step 2: Human Evaluators rank responses based on preference:  res_1 > res_2 > ... > res_N       |
|                                                                                                   |
|   Step 3: Prepare Reward Model r_\theta(x, y) \in R (Base LLM + Linear Regression Head)           |
|                                                                                                   |
|   Step 4: Train on pairwise comparisons (y_+ > y_-) via Bradley-Terry Logistic Preference Loss:   |
|           L_{RM}(\theta) = - E_{(x, y_+, y_-)} [ \log \sigma( r_\theta(x, y_+) - r_\theta(x, y_-) ) ]|
+---------------------------------------------------------------------------------------------------+
```

#### The Bradley-Terry Preference Loss
For every pair where response $y_+$ is preferred over response $y_-$ ($y_+ \succ y_-$):
$$\mathcal{L}_{\text{RM}}(\theta) = - \log \sigma\left( r_\theta(x, y_+) - r_\theta(x, y_-) \right)$$
where $\sigma(z) = \frac{1}{1 + e^{-z}}$ is the Sigmoid activation function.

```
+---------------------------------------------------------------------------------------+
|                       REWARD MODEL LOSS DYNAMICS (Slide 24)                           |
|                                                                                       |
|   r_\theta(x, y_+) >> r_\theta(x, y_-)  ===>  \sigma \to 1.0  ===>  Loss \to 0       |
|   r_\theta(x, y_+) \approx r_\theta(x, y_-) ===>  \sigma \approx 0.5  ===>  Loss \approx 0.69 |
|   r_\theta(x, y_+) << r_\theta(x, y_-)  ===>  \sigma \to 0.0  ===>  Loss EXPLODES!   |
+---------------------------------------------------------------------------------------+
```

Once trained, the static scalar reward model $r_\theta(x, y)$ provides the reward signal for PPO policy optimization.

---

### 7.2 Summary of Section III Common Challenges (Slide 25)

Across all exploration, exploitation, and preference-based reward shaping paradigms, three central challenges persist:
1. **Computational Efficiency:** How to estimate state novelty or topological importance with high efficiency in high-dimensional continuous spaces?
2. **Theoretical Consistency:** How to guarantee that the learned optimal policy remains consistent with the original task objective without reward gaming?
3. **Exploration-Exploitation Balance:** How to dynamically transition from broad exploratory bonuses in early learning to sharp exploitative guidance in late learning?

---

## 8. Advanced Multi-Agent & Adaptive Reward Shaping Architectures (Ma et al., NUS - Slides 26–28)

To address the limitations of static manual heuristics, recent research led by **Dr. Ma Haozhe and collaborators at the National University of Singapore (NUS)** introduced three foundational adaptive reward shaping frameworks.

### 8.1 ReLara: RL with an Assistant Reward Agent (Ma et al., ICML 2024 - Slide 26)

Traditional reward shaping relies on hardcoded mathematical formulas. **ReLara** decouples task execution from reward engineering by formulating reward generation as a **secondary cooperative Markov Decision Process**:

```
+---------------------------------------------------------------------------------------+
|                                    ReLara ARCHITECTURE (Slide 26)                     |
|                                                                                       |
|   +---------------------------------------+   Environmental Reward r_{E_t}            |
|   |              ENVIRONMENT              | -----------------------------+            |
|   +---------------------------------------+                              |            |
|         |                           ^                                    |            |
|         | State s_t                 | Action a_t                         |            |
|         v                           |                                    v            |
|   +---------------------------------------+                       +-----------------+ |
|   |          POLICY AGENT (A_P)           |                       |      SUM        | |
|   |  Actor:  \pi_\theta: S -> A           |                       |  r_{E_t} +      | |
|   |  Critic: Q_\phi(s, a)                 |                       |  \lambda r_{S_t}| |
|   +---------------------------------------+                       +-----------------+ |
|         |                                                                ^            |
|         | State s_t, Action a_t                                          |            |
|         v                                                                | Suggested  |
|   +---------------------------------------+                              | Reward     |
|   |       ASSISTANT REWARD AGENT (A_R)    |                              | r_{S_t}    |
|   |  Actor:  \pi_\zeta: S x A -> R        | -----------------------------+            |
|   |  Critic: Q_\eta(s, r_P)               |                                           |
|   +---------------------------------------+                                           |
+---------------------------------------------------------------------------------------+
```

- **The Policy Agent ($\mathcal{A}_P$):** Interacts directly with the environment. Given state $s_t$, it selects action $a_t$ via Actor $\pi_\theta: \mathcal{S} \to \mathcal{A}$. It updates its parameters using an augmented composite reward:
  $$r_t^{\text{composite}} = r_{E_t} + \lambda r_{S_t}$$
- **The Assistant Reward Agent ($\mathcal{A}_R$):** Treats reward generation as a decision-making problem. Given state-action pair $(s_t, a_t)$, its Actor $\pi_\zeta: \mathcal{S} \times \mathcal{A} \to \mathcal{R}$ dynamically generates suggested reward $r_{S_t}$.
- By framing shaping as an active decision problem, $\mathcal{A}_R$ learns to provide optimal feedback that dynamically guides $\mathcal{A}_P$ out of exploratory deadlocks.

---

### 8.2 CenRA: Centralized Reward Agent for Multi-Task RL (Ma et al., NeurIPS 2025 - Slide 27)

In multi-task reinforcement learning, training distinct agents across $N$ related tasks from scratch is computationally wasteful.
**CenRA** introduces a **Centralized Reward Agent ($\mathcal{A}^{\text{rwd}}$)** designed to extract, aggregate, and distribute transferable reward knowledge across tasks:

```
+---------------------------------------------------------------------------------------+
|                                    CenRA ARCHITECTURE (Slide 27)                      |
|                                                                                       |
|                       +-----------------------------------+                           |
|                       |   CENTRALIZED REWARD AGENT        |                           |
|                       |             A^{rwd}               |                           |
|                       +-----------------------------------+                           |
|                             ^                       |                                 |
|      Knowledge Distillation |                       | Knowledge Distribution          |
|      from Shared Buffer     |                       | (Knowledge Reward r^{rwd})      |
|                             |                       v                                 |
|               +---------------------------+    +---------------------------+          |
|               | CONCATENATED REPLAY BUFFER|    |    INDIVIDUAL POLICY      |          |
|               |  D = D_1 U D_2 U ... U D_N|    |    AGENTS A_1, ..., A_N   |          |
|               +---------------------------+    +---------------------------+          |
|                             ^                               |                         |
|                             | Pushes Experiences            | Interacts with Tasks    |
|                             +-------------------------------+                         |
+---------------------------------------------------------------------------------------+
```

1. **Multi-Task Experience Aggregation:**
   Multiple individual policy agents $(\mathcal{A}_1^{\text{pol}}, \mathcal{A}_2^{\text{pol}}, \dots, \mathcal{A}_N^{\text{pol}})$ operate on separate tasks. Each agent populates its own experience replay buffer $\mathcal{D}_i$.
2. **Concatenated Replay Buffer $\mathcal{D}$:**
   Experience buffers are aggregated into a unified repository:
   $$\mathcal{D} = \bigcup_{i=1}^N \mathcal{D}_i$$
3. **Knowledge Distillation:**
   The Centralized Reward Agent $\mathcal{A}^{\text{rwd}}$ extracts domain-invariant structural meta-knowledge from $\mathcal{D}$.
4. **Knowledge Distribution:**
   $\mathcal{A}^{\text{rwd}}$ distributes tailored knowledge rewards $r^{\text{rwd}}$ back to individual policy agents, dramatically accelerating learning across all $N$ tasks.

---

### 8.3 SASR: Self-Adaptive Success Rate-Based Reward Shaping (Ma et al., ICLR 2025 - Slide 28)

Instead of relying on black-box neural reward agents, **SASR** dynamically calibrates reward shaping using statistical modeling of empirical success rates:

```
+---------------------------------------------------------------------------------------+
|                                    SASR PIPELINE (Slide 28)                           |
|                                                                                       |
|   State Space S partitioned into Success States and Failure States along training     |
|                                  |                                                    |
|                                  v                                                    |
|   Kernel Density Estimation (KDE) with Random Fourier Features (RFF)                  |
|   Calculates Spatial Success Density d_S(s) and Failure Density d_F(s)                |
|                                  |                                                    |
|                                  v                                                    |
|   Effective Continuous Counts:                                                        |
|   \tilde{N}_S(s) = d_S(s) \times N, \quad \tilde{N}_F(s) = d_F(s) \times N            |
|                                  |                                                    |
|                                  v                                                    |
|   Localized Beta Distribution Modeling:                                               |
|   Success Rate(s) ~ Beta( \tilde{N}_S(s), \, \tilde{N}_F(s) )                         |
|                                  |                                                    |
|          +-----------------------+------------------------+                           |
|          |                                                |                           |
|          v                                                v                           |
|   Early Learning Stage:                            Late Learning Stage:               |
|   Low Data \implies Lower \tilde{N}_S, \tilde{N}_F Abundant Data \implies High \tilde{N}_S, \tilde{N}_F|
|   Diffuse Beta Distribution (Wide Variance)        Sharp, Highly Confident Peak       |
|   Encourages Broad Global Exploration              Focuses on Exploitation            |
|          |                                                |                           |
|          +-----------------------+------------------------+                           |
|                                  |                                                    |
|                                  v                                                    |
|   Sample Expected Success Rate -> Map through f(r^S) -> Adaptive Shaped Reward R^S(s) |
+---------------------------------------------------------------------------------------+
```

1. **Density Estimation via KDE & Random Fourier Features (RFF):**
   Instead of discrete counts, SASR maps continuous states $s$ into a randomized Fourier feature space to compute smooth kernel density functions for successful trajectories ($d_S(s)$) and failed trajectories ($d_F(s)$).
2. **Bayesian Beta Distribution Modeling:**
   Densities yield continuous effective success counts $\tilde{N}_S(s) = d_S(s) \times N$ and failure counts $\tilde{N}_F(s) = d_F(s) \times N$. These parameterize a localized Beta distribution:
   $$\text{Success Rate}(s) \sim \text{Beta}\left( \tilde{N}_S(s), \, \tilde{N}_F(s) \right)$$
3. **Adaptive Evolution Across Stages:**
   - **Early Stage:** Low data builds diffuse Beta distributions with lower $\tilde{N}_S, \tilde{N}_F$ and wide variance, driving broad exploration.
   - **Late Stage:** Abundant data builds sharp, highly confident Beta distributions with high $\tilde{N}_S, \tilde{N}_F$, focusing the agent on exploitation.
4. **Shaped Reward Mapping:**
   Sampling the success rate and passing it through mapping function $f(r^S)$ delivers an optimal, self-adaptive shaping reward $R^S(s)$ that matures dynamically alongside agent competence.

---

<reviewkit>
<takeaways>
- **The Curse of Sparse Native Rewards:** Real-world environmental rewards are almost universally sparse, delayed, and non-informative. In zero-reward in-process states, standard Q-learning executes empty updates ($0 \leftarrow 0$), and algorithms only begin to learn after stumbling upon a rare goal state through random exploration (e.g., $y_0 \approx \gamma^{20} \times 1 \approx 0.12$).
- **The Reward Shaping Paradigm:** General reward shaping reformulates the feedback landscape as $R^{\text{new}} = \alpha R^{\text{env}} + \beta R^{\text{sha}}$, converting sparse binary goals into dense intermediate milestone gradients.
- **Exploration Shaping & RND:** Novelty bonuses reward under-explored states. While tabular counters use $1/(N(s)+1)$ and continuous domains use pseudo-counts, high-dimensional spaces deploy Random Network Distillation (RND), measuring prediction errors between a trained predictor and a frozen target network ($\|f(s) - \hat{f}_\theta(s)\|^2$).
- **The Noisy-TV Vulnerability:** Pure prediction-error novelty is vulnerable to environmental stochastic noise (e.g., random static on a TV screen). The agent becomes hypnotized by unpredictable noise, harvesting infinite exploration bonuses while abandoning the task.
- **Exploitation Shaping & Process Supervision:** Assigning bonuses to critical bottleneck states accelerates optimization. In LLM multi-step reasoning, Math-Shepherd replaces sparse outcome supervision with process-level step rewards ($y_{s_i}^{\text{SE}}$) evaluated via automated Monte Carlo tree rollouts.
- **Reward Hacking in Process Supervision:** PRM-guided reasoning is vulnerable to Goodhart's Law and reward hacking: policy generators exploit PRM heuristics via verbosity bias, superficial math jargon, false-positive rollouts (accidental error cancellation), and hallucinated lemmas. Robust process supervision requires coupling PRMs with final outcome verification, length penalties, and KL divergence constraints.
- **Potential-Based Policy Invariance:** Arbitrary reward shaping risks policy corruption (reward gaming). Ng, Harada, and Russell proved that a consistently signed potential difference ($R^{\text{sha}} = \phi(s) - \gamma \phi(s')$, or its negative with a negated potential) induces telescoping cancellation along trajectories, guaranteeing that the optimal policy $\pi^*$ remains identical to the native MDP. Outside PBRS, heuristic methods lack theoretical invariance and are justified empirically by sample-efficiency gains.
- **RLHF in Open-Ended Domains:** For subjective LLM generation lacking programmatic rewards (self-introductions, coffee shop names, LinkedIn headlines), Reinforcement Learning from Human Feedback trains a regression reward model ($r_\theta(x, y) \in \mathbb{R}$) on human pairwise preference rankings using the Bradley-Terry logistic loss ($-\log \sigma(r(y_+) - r(y_-))$).
- **Advanced Autonomous Shaping Architectures (Ma et al., NUS):**
  - **ReLara (ICML 2024):** Decouples execution from guidance via a two-agent architecture: a Policy Agent ($\mathcal{A}_P$) executing actions and an Assistant Reward Agent ($\mathcal{A}_R$) learning shaping bonuses as a secondary MDP.
  - **CenRA (NeurIPS 2025):** Deploys a Centralized Reward Agent ($\mathcal{A}^{\text{rwd}}$) analyzing concatenated multi-task replay buffers ($\bigcup \mathcal{D}_i$) to distill universal structural meta-knowledge across multiple policy agents.
  - **SASR (ICLR 2025):** Formulates Self-Adaptive Success Rate shaping by computing spatial densities via Kernel Density Estimation and Random Fourier Features, modeling localized Beta distributions ($\text{Beta}(\tilde{N}_S, \tilde{N}_F)$) that transition seamlessly from early-stage exploration to late-stage exploitation.
</takeaways>

<qquiz src="questions.en.json"/>

<qprompt/>
</reviewkit>

## References

1. Bellemare, M., Srinivasan, S., Ostrovski, G., Schaul, T., Saxton, D., & Munos, R. (2016). Unifying count-based exploration and intrinsic motivation. *Advances in Neural Information Processing Systems (NeurIPS 2016)*, 29.
2. Burda, Y., Edwards, H., Storkey, A., & Klimov, O. (2018). Exploration by random network distillation. *arXiv preprint arXiv:1810.12894*.
3. Wang, P., Li, L., Shao, Z., et al. (2024). Math-shepherd: Verify and reinforce llms step-by-step without human annotations. In *Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers)* (pp. 9426-9439).
4. Ouyang, L., Wu, J., Jiang, X., Almeida, D., Wainwright, C., Mishkin, P., ... & Lowe, R. (2022). Training language models to follow instructions with human feedback. *Advances in Neural Information Processing Systems (NeurIPS 2022)*, 35, 27730-27744.
5. Christiano, P. F., Leike, J., Brown, T., Martic, M., Legg, S., & Amodei, D. (2017). Deep reinforcement learning from human preferences. *Advances in Neural Information Processing Systems (NeurIPS 2017)*, 30.
6. Ng, A. Y., Harada, D., & Russell, S. (1999). Policy invariance under reward transformations: Theory and application to reward shaping. In *International Conference on Machine Learning (ICML 1999)* (Vol. 99, pp. 278-287).
7. Ma, H., Sima, K., Vo, T. V., Fu, D., & Leong, T. Y. (2024). Reward shaping for reinforcement learning with an assistant reward agent. In *Proceedings of the 41st International Conference on Machine Learning (ICML 2024)*.
8. Ma, H., Luo, Z., Sima, K., Vo, T. V., & Leong, T. Y. (2025). Centralized reward agent for knowledge sharing and transfer in multi-task reinforcement learning. In *Proceedings of the 39th Annual Conference on Neural Information Processing Systems (NeurIPS 2025)*.
9. Ma, H., Luo, Z., Vo, T. V., Sima, K., & Leong, T. Y. (2025). Highly efficient self-adaptive reward shaping for reinforcement learning. In *Proceedings of the 13th International Conference on Learning Representations (ICLR 2025)*.
10. Weng, L. (2020). Exploration strategies in deep reinforcement learning. *Lil'Log*. https://lilianweng.github.io/posts/2020-06-07-exploration-drl/
11. OpenAI. (2018). Reinforcement learning with prediction-based rewards. *OpenAI Blog*. https://openai.com/index/reinforcement-learning-with-prediction-based-rewards/
12. Gopalan, A., & Teo, Y. M. (2025). *CS4246/5446 Reinforcement Learning and Sequential Decision Making (Version 5.0)*. National University of Singapore (NUS).
13. Gao, L., Schulman, J., & Hilton, J. (2023). Scaling laws for reward model overoptimization. In *International Conference on Machine Learning (ICML 2023)* (pp. 10835-10866).
14. Lightman, H., Kosaraju, V., Burda, Y., Couairon, G., Leike, J., & Cobbe, K. (2023). Let's verify step by step. *arXiv preprint arXiv:2305.20050*.
15. Amodei, D., Olah, C., Steinhardt, J., Christiano, P., Schulman, J., & Mané, D. (2016). Concrete problems in AI safety. *arXiv preprint arXiv:1606.06565*.

---

# Week 7 - Guided Sequential Decision Making: Decision-Time Search, Monte Carlo Tree Search (MCTS), Upper Confidence Bounds for Trees (UCT), and Demonstration-Based Planning (Imitation Learning & DAgger)

<draft>
- 1. The Curse of Dimensionality & The Guided Planning Taxonomy
    - Computational Bottleneck: Exponential explosion of state spaces (|S| = |S_local|^K) renders exhaustive offline planning (Value Iteration, Policy Iteration) and global RL intractable.
    - Five Paradigms to Bypass Full Offline Training:
        1. Decision-Time (Online) Planning: Search forward locally from current state s_0 at runtime (Rollouts, MCTS).
        2. Demonstration-Based (Offline) Planning: Learn directly from expert demonstration data (Imitation Learning, IRL).
        3. Model-Free RL: Policy gradients and value function approximation (DQN, PPO) across vast spaces.
        4. Model-Based RL: Learn or exploit world models P(s' | s, a), integrating human priors.
        5. Large Foundation Model (LFM)-Assisted Planning: Model creation, task decomposition, heuristics, plan generation.
    - Comparative Matrix: Decision-Time (Runtime, simulate ahead, choose immediate next action) vs. Demonstration-Based (Offline pre-runtime, learn safe policies from expert demonstrations).
- 2. Mathematical Foundations of Utility in Sequential Decisions
    - Formal MDP Tuple: M = (S, A, T, R, \gamma) where \sum_{s'} P(s' | s, a) = 1.
    - Bellman Optimality for Q and U: Q(s, a) = \sum_{s'} P(s' | s, a) [ R(s, a, s') + \gamma \max_{a'} Q(s', a') ], U(s) = \max_a Q(s, a), \pi^*(s) = \arg\max_a Q(s, a).
    - Bellman Expectation vs. Optimality: Evaluate a given policy by averaging over its action probabilities; optimize by taking a max at each state. Exact model-based versions of both use transitions and rewards, while sample-based methods can learn without knowing them in advance.
    - Taxonomy of Utility Quantities:
        - Realized return: U(s_t, s_{t+1}, ...) = G_t = \sum \gamma^k R_{t+k+1}.
        - Expected policy utility: U^\pi(s_t) = E[ G_t | S_t = s_t ].
        - Optimal expected utility: U(s_t) = U^{\pi^*}(s_t) = \max_\pi U^\pi(s_t).
        - State-action utility: Q^\pi(s_t, a_t) = E[ G_t | S_t = s_t, A_t = a_t ].
- 3. Decision-Time Planning: Online Search at Runtime
    - Core Idea: Avoid global offline policy computation by constructing a local lookahead search tree rooted strictly at the current state s_0.
    - Compute only enough of the plan to pick immediate best action a^*, execute it, transition to s', and repeat.
    - Conditions of effectiveness: large branching factors, deep search trees, accurate forward simulator available, strict real-time compute budget.
- 4. Rollout Algorithms: One-Step Lookahead Policy Improvement
    - Mechanism: At state s, for each candidate action a, simulate N trajectories using base rollout policy \pi.
    - Monte Carlo averaging: \hat{Q}^\pi(s, a) \approx \frac{1}{N} \sum_{i=1}^N G_t^{(i)}; select a^* = \arg\max_a \hat{Q}^\pi(s, a).
    - Policy Improvement: The one-step lookahead policy \pi'(s) strictly improves upon or matches the base rollout policy \pi (U^{\pi'}(s) \ge U^\pi(s)).
    - Search Tree Structure (Depth D): State nodes (circles, Max), Observation nodes (squares, Average over outcomes), Leaves (sampled rollout utilities), Backup (Average -> Max -> Root).
    - Strengths & Limitations: Parallelizable, flexible, improves upon base policy; high runtime computation, quality tied to rollout policy.
    - Mars Rover Persy Adventures: s_0 junction, a_L (returns 4, 6, 5 \implies \hat{Q}=5.0) vs a_R (returns 3, 8, 2 \implies \hat{Q} \approx 4.33); Decision: a^* = a_L.
- 5. Monte Carlo Tree Search (MCTS): Online Search with Simulation
    - Anytime algorithm combining selective tree expansion with stochastic Monte Carlo rollouts.
    - The Four Iterative Steps:
        1. Selection: Traverse existing tree using tree policy (explore vs exploit) until reaching non-fully expanded node.
        2. Expansion: Add one or more children for untried actions.
        3. Simulation (Rollout): Run fast rollout policy to terminal state or horizon cutoff to yield G_t.
        4. Backup (Backpropagation): Propagate G_t up the visited path, updating visit counts N and value totals W.
    - MDP Tree Formulation: Nodes are states s, edges are actions a, transitions sample s' ~ P(s' | s, a), discounted backup G_t(s) = R(s, a, s') + \gamma G_{t+1}(s').
- 6. Upper Confidence Bounds Applied to Trees (UCT)
    - UCT1 Action Selection Formula: \pi_{UCT}(n) = \arg\max_a [ \hat{Q}(s, a) + c \sqrt{\ln N(s) / N(s, a)} ].
    - Exploitation term \hat{Q}(s, a) vs. Exploration bonus term c \sqrt{\ln N(s) / N(s, a)} (unvisited actions get +\infty).
    - Theoretical Convergence: \hat{Q}(s, a) \to Q^*(s, a), \hat{U}(s) \to U(s).
    - Action selection alternatives: fixed policy f(s) reduces MCTS to plain rollout; requires adaptive exploration (UCT1, \epsilon-greedy, softmax).
    - Step-by-Step Tic-Tac-Toe Walkthrough: X to move, cells TR, ML, BR, c=\sqrt{2}. Tracing Iterations 0->1 (TR win, UCB=1.00), 1->2 (ML draw, bonus 1.177, TR=2.177, ML=1.677), 2->3 (BR loss, bonus 1.482, TR=2.482, ML=1.982, BR=1.482).
    - Persy Discounted MCTS Planning: Explore (5 + 0.9 x 10 = 14) vs Stay (2 + 0.9 x 3 = 4.7); a^* = Explore.
- 7. AlphaGo Zero and Modern MCTS Variants
    - Scaling to Go: 10^{170} states, branching factor 361.
    - Two-Headed Deep Neural Network: Value head v_\theta(s) (replaces rollouts) + Policy head p_\theta(s, a) (prior probabilities).
    - Polynomial Upper Confidence Trees (PUCT): \pi_{PUCT}(s) = \arg\max_a [ \hat{Q}(s, a) + c P(s, a) \frac{\sqrt{\sum_b N(s, b)}}{1 + N(s, a)} ].
    - Approximate Generalized Policy Iteration: MCTS = policy improvement; self-play + supervised network training = policy evaluation.
    - Comparative Analysis: MCTS in MDPs vs. MCTS in Two-Player Zero-Sum Games.
- 8. Demonstration-Based Planning & Imitation Learning Foundations
    - Motivation: Unknown or complex reward functions, hazardous environment exploration, availability of human/expert demonstrations.
    - Core Methodologies: Imitation Learning (IL: direct policy mapping without rewards) vs. Inverse Reinforcement Learning (IRL: recover latent reward R(s, a) then solve MDP).
- 9. Behavioral Cloning (BC) & The Failure of Supervised Learning in Sequential Decisions
    - Formulation: Supervised negative log-likelihood minimization \theta^* = \arg\min_\theta \sum [ -\log \pi_\theta(a_i | s_i) ].
    - The Fundamental Violation of the i.i.d. Assumption: Agent's actions alter future state distributions.
    - The Three Failures: Covariate Shift / Distribution Mismatch, Compounding Errors (O(T^2 \epsilon) error explosion), and Absence of Recovery Demonstrations.
- 10. Dataset Aggregation (DAgger): Interactive Imitation Learning
    - Ross, Gordon, & Bagnell (AISTATS 2011).
    - Core Premise: Train the policy on the state distribution it actually encounters during execution!
    - Algorithmic Procedure: Iterative rollout of learner policy \pi_i (or mixture \beta_i \pi^* + (1 - \beta_i) \hat{\pi}_i), querying expert for corrective actions a^* = \pi^*(s) on visited states, dataset aggregation D_{i+1} = D_i \cup \{(s, \pi^*(s))\}, retraining.
    - Kart Racing Experiment: Autonomous kart steering from image input; BC degrades due to drift (>3.5 falls), DAgger drives falls per lap to near zero.
    - DAgger Taxonomy: SafeDAgger, SHIV, DART (noise injection), HG-DAgger (human-gated), Agnostic IIL, Deeply AggreVaTeD, Conditional Imitation Learning.
- 11. Generative Adversarial Imitation Learning (GAIL)
    - Adversarial minimax formulation between generator policy \pi_\theta and discriminator D_\psi(s, a).
    - Occupancy measure matching \rho_\pi(s, a) \approx \rho_E(s, a) without interactive expert queries.
- 12. Human Factors, Software Ecosystem, & Architectural Synthesis
    - Human Factors: Cognitive biases, heuristics, Prospect Theory (Kahneman & Tversky non-linear utility weighting).
    - Software Frameworks: robomimic (NVIDIA/Stanford), imitation (CHAI/UC Berkeley), X-IL, Stable Baselines3 (SB3).
    - Grand Synthesis: Comparative trade-off matrix across BC, DAgger, GAIL, MCTS, and Offline RL.
</draft>

## 1. The Curse of Dimensionality & The Guided Planning Taxonomy

In sequential decision-making problems, when the underlying environment is modeled as a Markov Decision Process (MDP), standard exact solution techniques—such as **Value Iteration** and **Policy Iteration**—demand exhaustive sweeps across the entire state space $\mathcal{S}$ and action space $\mathcal{A}$.

However, in real-world engineering domains (e.g., robotic manipulation, autonomous driving, strategic games, and multi-agent coordination), the state space suffers from the **Curse of Dimensionality**:
$$|\mathcal{S}| = |\mathcal{S}_{\text{local}}|^K$$
where the state space grows exponentially with the number of state variables, degrees of freedom, or spatial entities $K$. Exhaustive offline dynamic programming and global tabular reinforcement learning become computationally infeasible.

```
+---------------------------------------------------------------------------------------------------+
|                        FIVE PARADIGMS TO BYPASS FULL OFFLINE PLANNING (Slide 3)                   |
|                                                                                                   |
|  1. Decision-Time Planning          ===> Conduct local online search at runtime from s_0 only     |
|     (Online Search)                      (e.g., Rollout Algorithms, Monte Carlo Tree Search).     |
|                                                                                                   |
|  2. Demonstration-Based Planning    ===> Learn policies or rewards directly from expert data      |
|     (Apprenticeship Learning)            (e.g., Behavioral Cloning, DAgger, Inverse RL).          |
|                                                                                                   |
|  3. Model-Free Reinforcement        ===> Approximate values or policies over massive spaces       |
|     Learning (Function Approx.)          (e.g., Deep Q-Networks, TRPO, PPO).                      |
|                                                                                                   |
|  4. Model-Based Reinforcement       ===> Learn or leverage forward world models P(s' | s, a),     |
|     Learning (World Models)              incorporating structured human domain priors.            |
|                                                                                                   |
|  5. Large Foundation Model (LFM)    ===> Leverage LLMs/LFMs for model creation, task              |
|     Assisted & Human Planning            decomposition, search heuristics, and plan generation.   |
+---------------------------------------------------------------------------------------------------+
```

---

### 1.1 Comparative Matrix: Decision-Time vs. Demonstration-Based Planning (Slide 4)

| Dimension | Decision-Time (Online) Planning | Demonstration-Based (Offline) Planning |
| :--- | :--- | :--- |
| **When Applied** | **At runtime** during live execution. | **Before runtime** (offline training phase). |
| **Execution Methodology** | Simulate ahead via local online search trees (e.g., Rollouts, Monte Carlo Tree Search). | Learn from expert demonstrations (e.g., Imitation Learning, Inverse Reinforcement Learning). |
| **Primary Goal** | Select the immediate **next best action $a^*$** from the current observed state $s_0$. | Pre-learn safe, robust, and effective global policies $\pi(a \mid s)$. |
| **Core Motivation** | Circumvents exhaustive offline computation when global MDP planning is intractable. | Bypasses RL exploration when rewards are unknown, exploration is dangerous, or expert demonstrations are accessible. |

---

## 2. Mathematical Foundations of Utility in Sequential Decisions

### 2.1 Formal MDP Components (Slide 5)

An MDP is formally defined by the 5-tuple $\mathcal{M} \triangleq (\mathcal{S}, \mathcal{A}, \mathcal{T}, \mathcal{R}, \gamma)$:
- **State Space $\mathcal{S}$:** The set of all valid environment configurations.
- **Action Space $\mathcal{A}$:** The set of all valid control decisions.
- **Transition Function $\mathcal{T}$:** A conditional probability distribution $\mathcal{T}(s, a, s') = \mathcal{P}(s' \mid s, a)$. The **Markov property** says that, given the current state and action, the next-state distribution does not depend on earlier history: $\mathcal{P}(S_{t+1} \mid S_0,A_0,\ldots,S_t,A_t)=\mathcal{P}(S_{t+1} \mid S_t,A_t)$. Separately, probability normalization requires:
  $$\forall s \in \mathcal{S}, \, \forall a \in \mathcal{A}: \quad \sum_{s' \in \mathcal{S}} \mathcal{T}(s, a, s') = \sum_{s' \in \mathcal{S}} \mathcal{P}(s' \mid s, a) = 1$$
- **Reward Function $\mathcal{R}$:** Numerical feedback assigned to transitions: $\mathcal{R}: \mathcal{S} \to \mathbb{R}$, $\mathcal{R}: \mathcal{S} \times \mathcal{A} \to \mathbb{R}$, or $\mathcal{R}: \mathcal{S} \times \mathcal{A} \times \mathcal{S} \to \mathbb{R}$.
- **Discount Factor $\gamma$:** A constant $0 \le \gamma \le 1$ weighting future rewards. For a continuing infinite-horizon task with bounded rewards, $\gamma<1$ keeps discounted returns finite; $\gamma=1$ needs an additional condition such as finite episodes.

The objective of an agent is to derive an optimal policy $\pi^*: \mathcal{S} \to \mathcal{A}$ that balances immediate risk against long-term expected reward.

---

### 2.2 Action-Utility (Q-Function) and State Utility Formulations (Slide 8)

The value of an agent's choices is captured through the **Bellman Optimality Equations**:

$$\begin{aligned}
Q(s, a) &= \sum_{s' \in \mathcal{S}} \mathcal{P}(s' \mid s, a) \left[ \mathcal{R}(s, a, s') + \gamma \, U(s') \right] \\
&= \sum_{s' \in \mathcal{S}} \mathcal{P}(s' \mid s, a) \left[ \mathcal{R}(s, a, s') + \gamma \max_{a' \in \mathcal{A}} Q(s', a') \right]
\end{aligned}$$

- **State Utility:** $U(s) = \max_{a \in \mathcal{A}} Q(s, a)$.
- **Optimal Policy:** $\pi^*(s) = \arg\max_{a \in \mathcal{A}} Q(s, a)$.
- **Interpretation:** $Q(s, a)$ denotes the expected cumulative return achieved by taking action $a$ in state $s$, and subsequently executing the optimal policy $\pi^*$.

---

### 2.3 Formal Distinction of Utility Quantities (Slide 9)

In sequential decision-making literature, the term "utility" assumes distinct mathematical meanings depending on the scope of realization:

```
+---------------------------------------------------------------------------------------------------+
|                            THE TAXONOMY OF UTILITY QUANTITIES (Slide 9)                           |
|                                                                                                   |
|  Quantity: U(s_t, s_{t+1}, ...) = G_t                                                             |
|  - Meaning: Actual realized discounted reward sum (Return).                                       |
|  - Scope:   Evaluated over ONE realized sample state sequence.                                    |
|                                                                                                   |
|  Quantity: U^\pi(s_t) = E[ G_t | S_t = s_t ]                                                      |
|  - Meaning: Expected utility from state s_t under policy \pi.                                     |
|  - Scope:   Expectation evaluated over ALL possible trajectories starting from s_t following \pi. |
|                                                                                                   |
|  Quantity: U(s_t) = U^{\pi^*}(s_t) = \max_\pi U^\pi(s_t)                                          |
|  - Meaning: Optimal expected utility from state s_t.                                              |
|  - Scope:   Expectation evaluated over all trajectories originating from s_t under optimal \pi^*. |
|                                                                                                   |
|  Quantity: Q^\pi(s_t, a_t) = E[ G_t | S_t = s_t, A_t = a_t ]                                     |
|  - Meaning: Expected utility from state-action pair (s_t, a_t) under policy \pi.                  |
|  - Scope:   Expectation starting with action a_t at s_t, then adhering to policy \pi.             |
|                                                                                                   |
|  Hierarchical Derivation:                                                                         |
|  U(s_t, s_{t+1}, ...) = G_t  ===>  U^\pi(s_t) = E[ G_t | S_t = s_t ]  ===>  U(s_t) = \max_\pi U^\pi|
+---------------------------------------------------------------------------------------------------+
```

---

### 2.4 From Exact Utility to Online Estimates

The Bellman equations define an **optimal** action value $Q^*(s,a)$: take $a$ now, then act optimally. If instead the agent follows a particular rollout policy $\pi$ after the first action, the relevant quantity is $Q^\pi(s,a)=\mathbb{E}[G_t\mid S_t=s,A_t=a,\text{follow }\pi\text{ thereafter}]$. With finitely many simulated trajectories, the agent has only a sample estimate $\hat Q^\pi(s,a)$.

| Quantity | What it assumes about later actions | How Week 7 uses it |
| :--- | :--- | :--- |
| $Q^*(s,a)$ | Optimal continuation | Ideal target in the Bellman equation. |
| $Q^\pi(s,a)$ | Continuation under a specified policy $\pi$ | Value targeted by a rollout based on $\pi$. |
| $\hat Q^\pi(s,a)$ | Same continuation, estimated from finite samples | Practical estimate used to choose an action now. |

Thus $\arg\max_a\hat Q^\pi(s,a)$ is the **best sampled candidate under this evaluation procedure**, not a guarantee of the globally optimal action. MCTS goes further by expanding promising parts of the tree and repeatedly updating action estimates; UCT's exploration bonus determines where to sample next, while the final root action is selected from the resulting estimates or visit counts.

---

### 2.5 Bellman Expectation vs. Bellman Optimality: What Is Given, and Who Chooses?

These equations answer different questions. **Bellman expectation** evaluates a policy $\pi$ that is already specified. The policy may be deterministic or stochastic; it chooses actions, while the equation computes their expected long-term value:

$$\begin{aligned}
V^\pi(s) &= \sum_a \pi(a\mid s)Q^\pi(s,a), \\
Q^\pi(s,a) &= \sum_{s'}P(s'\mid s,a)\left[R(s,a,s')+\gamma V^\pi(s')\right].
\end{aligned}$$

The first line is a **policy-weighted** expectation over actions, not an unweighted average. If $\pi$ is deterministic, its selected action has probability $1$. The same policy also governs continuation after the first action. Evaluating $\pi$ does not make it greedy: $\pi$ could be random, $\epsilon$-greedy, or a fixed expert policy.

**Bellman optimality** does not require a policy to be supplied first. It defines the best achievable value by choosing the highest-valued action at every state, including future states:

$$\begin{aligned}
V^*(s) &= \max_a Q^*(s,a), \\
Q^*(s,a) &= \sum_{s'}P(s'\mid s,a)\left[R(s,a,s')+\gamma V^*(s')\right], \\
\pi^*(s) &\in \arg\max_a Q^*(s,a).
\end{aligned}$$

This is a coupled fixed-point relationship, so $V^*$ and $Q^*$ need not be known beforehand. **Value iteration** begins with an arbitrary value estimate and repeatedly applies the optimality backup; a greedy policy can be read from each current estimate, becoming optimal when the values converge under the usual finite discounted-MDP assumptions. **Policy iteration** instead starts with a policy, evaluates it using the expectation equation, then makes it greedy with respect to those values and repeats.

For exact **model-based** Bellman calculations, *both* equations need the transition probabilities $P$ and rewards $R$; the difference is whether a policy is given or optimized. Sample-based methods can estimate policy values or optimal action values from experience without knowing $P$ in advance. Finally, the $\max$ in an optimality **update target** does not force the agent to execute that action during learning: behavior may deliberately explore, and a greedy choice from an inaccurate $\hat Q$ is not guaranteed to be truly optimal. The exact Bellman optimality equation itself is not made inaccurate by exploratory behavior.

---

## 3. Decision-Time Planning: Online Search at Runtime

When an environment's state space $|\mathcal{S}|$ is astronomically large, computing an exhaustive offline policy $\pi(s)$ for every state is computationally impossible.

**Decision-Time Planning (Online Search)** circumvents this bottleneck by delaying computation until the agent actually encounters a specific state $s_0$ (Slides 6 & 7):
1. **Local Tree Construction:** From current state $s_0$, the agent builds a local forward search tree exploring candidate futures up to horizon $D$.
2. **Immediate Action Selection:** The agent estimates candidate action values under its search budget and selects an immediate action $a^* \approx \arg\max_a Q(s_0, a)$.
3. **Execution and Re-rooting:** The agent executes $a^*$, observes the true next state $s'$, discards (or trims) the search tree, and repeats the forward search rooted at $s'$.

### 3.1 Search Depth, Branching, and Nearsightedness

The key trade-off is **which futures receive computation**. If each state has roughly $b$ possible actions, an exhaustive search to depth $D$ can contain $O(b^D)$ action sequences. More state variables can make the total state space enormous, while the branching factor and horizon determine how costly a particular online search is. Decision-time planning avoids sweeping every state in the MDP, but it does not make the search tree free.

Consider two actions at the current state. **Take** gives reward $5$ now and $0$ next step; **Invest** gives $0$ now and $10$ next step. With $\gamma=0.9$, a one-step search that values only immediate reward chooses Take ($5>0$). A two-step search sees that Invest returns $0+0.9(10)=9$, exceeding Take's $5$. If Take is irreversible, replanning at the next state cannot recover the missed opportunity.

This is a **limited-horizon or poor-leaf-evaluation problem**, not an inherent property of all decision-time planning. Greedy search is the extreme case of shallow lookahead with no useful continuation estimate; beam search limits how many branches survive. Rollouts can estimate returns beyond the explicit tree using a baseline policy, and MCTS allocates simulations selectively across branches. These methods can still choose poorly when the budget is too small, the simulator is inaccurate, sampling is noisy, or the rollout policy / leaf-value estimate misses delayed rewards. A deeper search, better continuation estimate, or more targeted exploration can reduce the risk, subject to runtime cost.

Decision-time planning is exceptionally powerful when:
- The branching factor or depth of the MDP makes offline dynamic programming intractable.
- A fast, accurate **forward simulator** (transition generative model $s' \sim \mathcal{P}(\cdot \mid s, a)$) is accessible.
- Computation budgets are strictly enforced by real-time operational deadlines.

---

## 4. Rollout Algorithms: One-Step Lookahead Policy Improvement

### 4.1 Algorithmic Mechanics (Slide 10)

**Rollout Algorithms** (Sutton & Barto Section 8.10) execute decision-time planning by evaluating candidate actions via Monte Carlo trajectory rollouts using a baseline heuristic policy $\pi$ (the "rollout policy"):

```
+---------------------------------------------------------------------------------------+
|                             ROLLOUT ALGORITHM MECHANISM                               |
|                                                                                       |
|                                     Current State s_0                                 |
|                                      /             \                                  |
|                         Candidate a_1               Candidate a_2                     |
|                         /     |     \               /     |     \                     |
|                     Traj 1  Traj 2  Traj 3      Traj 1  Traj 2  Traj 3                |
|                      G_1     G_2     G_3         G_1     G_2     G_3                  |
|                       \       |       /           \       |       /                   |
|                    \hat{Q}^\pi(s_0, a_1)       \hat{Q}^\pi(s_0, a_2)                  |
|                              \                       /                                |
|                               \                     /                                 |
|                                a^* = \arg\max_a \hat{Q}^\pi(s_0, a)                   |
+---------------------------------------------------------------------------------------+
```

1. Given observed state $s_0$, identify all permissible candidate actions $a \in \mathcal{A}(s_0)$.
2. For each candidate action $a$, simulate $N$ independent stochastic trajectories of length $H$. In each trajectory, action $a$ is executed on the first step, and all subsequent steps are chosen by rollout policy $\pi$.
3. Approximate the action-value function via empirical Monte Carlo averaging:
   $$\hat{Q}^\pi(s_0, a) \approx \frac{1}{N} \sum_{i=1}^N G_t^{(i)}$$
4. Execute the empirical best action:
   $$a^* = \arg\max_{a \in \mathcal{A}} \hat{Q}^\pi(s_0, a)$$

> **The Policy Improvement Theorem for Rollouts:**
> If the rollout evaluation $\hat{Q}^\pi(s, a)$ is exact, the resulting decision-time policy $\pi'(s) \triangleq \arg\max_a Q^\pi(s, a)$ strictly improves upon or matches the baseline rollout policy $\pi$:
> $$U^{\pi'}(s) \ge U^\pi(s), \quad \forall s \in \mathcal{S}$$
> Rollout algorithms achieve a **one-step policy improvement at decision time** without ever computing or storing the global value function!

---

### 4.2 Search Tree Structure (Depth $D$; Slide 11)

In multi-step rollout online search, the lookahead tree alternates between two types of nodes:
- **State Nodes (Circles):** Represent points where the agent chooses an action. Values are computed via the **$\max$ operator** over candidate action branches.
- **Observation / Chance Nodes (Squares):** Represent points where environmental stochasticity resolves. Values are computed via the **$\text{Average}$ operator** over sampled transition outcomes.
- **Leaf Nodes:** Terminal states or cutoff depths evaluated via simulated rollouts.
- **Backup Pipeline:** $\text{Average (Expectation)} \to \max \to \text{Root} \to \text{Execute } a^*$.

```
+---------------------------------------------------------------------------------------------------+
|                                  ROLLOUT SEARCH TREE (Depth D; Slide 11)                          |
|                                                                                                   |
|                                           ( State Node: Max )                                     |
|                                              /           \                                        |
|                                         a_1 /             \ a_2                                   |
|                                            v               v                                      |
|                                   [ Observation ]     [ Observation ]                             |
|                                   [ Node: Average]    [ Node: Average]                            |
|                                       /    |    \         /    |    \                             |
|                                     z_1   z_2  z_3      z_1   z_2  z_3                            |
|                                     /      |     \      /      |     \                            |
|                                   (s)     (s)    (s)  (s)     (s)    (s)   <--- Depth D           |
|                                    |       |      |    |       |      |                           |
|                                    v       v      v    v       v      v                           |
|                                   Rollout Rollout ... Rollout Rollout ...                         |
+---------------------------------------------------------------------------------------------------+
```

---

### 4.3 Strengths and Limitations (Slide 14)

- **Strengths:**
  - **Conceptual Simplicity:** Requires only a forward transition model and return averaging.
  - **Policy Improvement under Exact Evaluation:** The one-step policy improvement guarantee holds when $Q^\pi$ is evaluated exactly; finite rollout samples and horizon truncation can select a worse action.
  - **High Robustness:** Functions effectively even when the base rollout policy $\pi$ is completely random.
  - **Embarrassingly Parallelizable:** Trajectory simulations across actions are mutually independent and can be distributed across multi-core CPUs/GPUs.
- **Limitations:**
  - **High Real-Time Compute Burden:** Evaluating dozens of actions with $N$ simulations per step consumes heavy CPU/GPU time.
  - **Rollout Bias:** Value estimates remain fundamentally bounded by the quality and domain coverage of the rollout policy $\pi$.
  - **Hard Deadlines:** In high-speed control (e.g., drone flight), the search must truncate before sufficient samples are collected.

---

### 4.4 Concrete Case Study: Persy the Mars Rover Adventures (Slides 12 & 13)

**Scenario Setup:**
- Persy the Mars Rover is stationed at junction state $s_0$.
- Available actions: $a_L = \text{go Left}$, $a_R = \text{go Right}$.
- Horizon: $H = 2$.
- Rollout policy $\pi$: Random action selection after the first decision step.
- Sampling rate: $N = 3$ trajectories per candidate action.

```
+---------------------------------------------------------------------------------------+
|                    PERSY THE MARVER ROVER ROLLOUT TRACE (Slide 13)                    |
|                                                                                       |
|                                    s_0 (Junction)                                     |
|                                   /              \                                    |
|                       a_L (go Left)              a_R (go Right)                       |
|                       /     |     \              /      |     \                       |
|                  Traj 1  Traj 2  Traj 3      Traj 1  Traj 2  Traj 3                   |
|                   G_1=4   G_2=6   G_3=5       G_1=3   G_2=8   G_3=2                   |
+---------------------------------------------------------------------------------------+
```

**Calculations:**
- **Action $a_L$ (Left):**
  $$\hat{Q}^\pi(s_0, a_L) = \frac{G_1 + G_2 + G_3}{3} = \frac{4 + 6 + 5}{3} = \frac{15}{3} = 5.0$$
- **Action $a_R$ (Right):**
  $$\hat{Q}^\pi(s_0, a_R) = \frac{G_1 + G_2 + G_3}{3} = \frac{3 + 8 + 2}{3} = \frac{13}{3} \approx 4.33$$

**Decision-Time Selection:**
$$a^* = \arg\max_a \hat{Q}^\pi(s_0, a) = a_L \quad (\text{Rover executes Left!})$$

*Why is the first action fixed?* To evaluate the isolated expected utility of candidate branch $a_L$ versus $a_R$, the first action must be clamped to the branch under test; subsequent steps are rolled out under policy $\pi$.

---

## 5. Monte Carlo Tree Search (MCTS): Online Search with Simulation

While simple rollout algorithms evaluate actions via flat lookahead trees of uniform depth, **Monte Carlo Tree Search (MCTS)** grows an asymmetric search tree dynamically, focusing computational simulations on the most promising branches (Slides 15–19; Sutton & Barto Section 8.11; Russell & Norvig Section 5.4).

### 5.1 The Anytime Property (Slide 17)

MCTS is an **anytime algorithm**: it repeatedly executes simulated trials from root state $s_0$ as long as computational time permits. When interrupted by an external real-time deadline, it terminates gracefully and outputs the best action discovered so far.

---

### 5.2 The Four Canonical Steps of MCTS (Slide 17, 19; SB Figure 8.10)

```
+---------------------------------------------------------------------------------------------------+
|                                 THE FOUR ITERATIVE PHASES OF MCTS                                 |
|                                                                                                   |
|     (1) SELECTION              (2) EXPANSION             (3) SIMULATION            (4) BACKUP     |
|                                                                                                   |
|          (s_0)                     (s_0)                     (s_0)                    (s_0) ^     |
|          /   \                     /   \                     /   \                    /   \ |     |
|        (s)   (s)                 (s)   (s)                 (s)   (s)                (s)   (s)     |
|        /                         /                         /                        /   |         |
|      (s)                       (s)                       (s)                      (s)   |         |
|                                  \                         \                        \   |         |
|                                  (s') [New Node]           (s')                     (s')|         |
|                                                              \                        ^           |
|                                                               Rollout                 |           |
|                                                               Policy                  |           |
|                                                                 |                     |           |
|                                                                 v                     |           |
|                                                               Terminal G_t ---------->+           |
+---------------------------------------------------------------------------------------------------+
```

1. **Selection:** Starting at the root node $s_0$, the algorithm descends through the existing search tree using a **Tree Policy** designed to balance exploration and exploitation (e.g., UCT). Selection continues until it reaches a node that is not fully expanded or is a leaf.
2. **Expansion:** One or more child nodes corresponding to untried actions are instantiated and appended to the tree.
3. **Simulation (Rollout):** From the newly expanded node, a simulation trial is rolled out to a terminal state (or predetermined horizon cutoff) using a fast, stochastic **Rollout Policy** (often random or heuristic) to produce a scalar empirical return $G_t$.
4. **Backup (Backpropagation):** The sampled return $G_t$ is propagated back up along the traversed tree path to the root node $s_0$. Every node along the path increments its visit counter $N$ and updates its cumulative utility $W$ and average utility estimate $\hat{Q}$.

---

### 5.3 MCTS as Online Search in MDPs (Slide 18)

- **Tree Nodes:** Correspond directly to environment states $s \in \mathcal{S}$.
- **Tree Edges:** Represent actions $a \in \mathcal{A}$.
- **Stochastic Transitions:** Environment dynamics sample next states according to transition probabilities $s' \sim \mathcal{P}(s' \mid s, a)$.
- **Estimates:**
  - $\hat{Q}(s, a)$: Average of sampled returns $G_t$ for taking action $a$ in state $s$.
  - $\hat{U}(s)$: Average of sampled returns $G_t$ passing through state $s$.
- **Discounted Backup Recursion:**
  $$G_t(s) = \mathcal{R}(s, a, s') + \gamma G_{t+1}(s')$$
- **Terminal Decision at Root $s_0$:**
  $$a^* = \arg\max_a \hat{Q}(s_0, a) \quad \left(\text{or } a^* = \arg\max_a N(s_0, a)\right)$$

---

## 6. Upper Confidence Bounds Applied to Trees (UCT)

A central challenge in MCTS is action selection within the search tree: *How should the Tree Policy select actions at internal nodes to balance exploring under-sampled branches against exploiting known high-reward branches?*

### 6.1 The UCT1 Formula (Kocsis & Szepesvári, ECML 2006; Slide 20)

The **UCT (Upper Confidence Bounds applied to Trees)** algorithm treats each internal state node as a Multi-Armed Bandit, deploying the UCB1 metric to govern action selection:

$$\pi_{\text{UCT}}(n) = \arg\max_{a \in \mathcal{A}(s)} \left[ \hat{Q}(s, a) + c \sqrt{\frac{\ln N(s)}{N(s, a)}} \right]$$

```
+---------------------------------------------------------------------------------------------------+
|                                     UCT1 FORMULA DECOMPOSITION                                    |
|                                                                                                   |
|             \pi_{UCT}(n) = \arg\max_a \Bigg[   \hat{Q}(s, a)   +   c \sqrt{\frac{\ln N(s)}{N(s, a)}}   \Bigg]
|                                                    |                           |                  |
|                                                    v                           v                  |
|                                            EXPLOITATION TERM           EXPLORATION TERM           |
|                                         Average sampled utility     Encourages less-visited actions|
|                                            \hat{Q} = W / N           N(s,a) in denominator        |
+---------------------------------------------------------------------------------------------------+
```

- **$\hat{Q}(s, a)$ (Exploitation Term):** The empirical average return obtained from all simulation rollouts that passed through action $a$ from state $s$: $\hat{Q}(s, a) = \frac{W(s, a)}{N(s, a)}$.
- **$N(s)$:** Total number of times parent state node $s$ has been visited.
- **$N(s, a)$:** Number of times candidate action $a$ has been selected from state $s$.
- **$c$:** Theoretical exploration constant balancing exploitation against exploration (classically $c = \sqrt{2} \approx 1.414$ for bounded rewards in $[0, 1]$).
- **$c \sqrt{\frac{\ln N(s)}{N(s, a)}}$ (Exploration Bonus):** As sibling nodes are explored, $N(s)$ grows, increasing the numerator $\ln N(s)$ and granting an exploration bonus to neglected actions. When an action is unvisited ($N(s, a) = 0$), the term evaluates to $+\infty$, guaranteeing that **every available action at a node is tried at least once before exploitation commences**.

---

### 6.2 Theoretical Convergence & Properties (Slide 20)

1. **Asymptotic Optimality:** With a sufficient number of simulation trials, the value estimates computed by MCTS+UCT converge to the exact Bellman optimal values:
   $$\lim_{N \to \infty} \hat{Q}(s, a) = Q^*(s, a), \quad \lim_{N \to \infty} \hat{U}(s) = U(s)$$
2. **Failure of Fixed Node Policies (Slide 26):** If a fixed deterministic heuristic policy $f(s)$ is used to select actions at internal nodes, MCTS collapses into a simple flat rollout algorithm, completely forfeiting the adaptive tree-expansion benefits of MCTS.
3. **Alternative Tree Policies:** In addition to UCT1, internal nodes can be guided by $\epsilon$-greedy exploration or temperature-scaled Boltzmann (softmax) distributions.

---

### 6.3 Detailed Numerical Walkthrough: Tic-Tac-Toe (Slides 22–24)

**Environment Setup:**
- Player: $X$ to move from a partial board configuration.
- Available empty cells: **Top-Right (TR)**, **Middle-Left (ML)**, **Bottom-Right (BR)**.
- Exploration constant: $c = \sqrt{2} \approx 1.414$.
- Scoring outcomes: Win = $1.0$, Draw = $0.5$, Loss = $0.0$.
- Formula: $\text{UCB} = Q + c \sqrt{\frac{\ln N_{\text{parent}}}{N_{\text{child}}}}$, where $Q = \frac{W}{N}$.

```
+-------------------------------------------------------------------------------+
|                        TIC-TAC-TOE BOARD SETUP (Slide 22)                     |
|                                                                               |
|                             X  |  O  | [TR]                                   |
|                            ----+-----+----                                    |
|                            [ML]|  X  |  O                                     |
|                            ----+-----+----                                    |
|                                |     | [BR]                                   |
|                                                                               |
|    Available actions for Player X: TR (Top-Right), ML (Middle-Left), BR (Bottom-Right)|
+-------------------------------------------------------------------------------+
```

#### Iteration 0 $\to$ 1 (Expand Top-Right / TR):
- **Selection & Expansion:** All children are unvisited ($N_{\text{child}} = 0 \implies \text{UCB} = +\infty$). Select and expand **TR**.
- **Simulation:** Fast random rollout yields an **$X$ Win (1.0)**.
- **Backpropagation:**
  - Child TR: $N = 1, \, W = 1.0, \, Q = 1.00$.
  - Root: $N = 1, \, W = 1.0, \, Q = 1.00$.
- **UCB Scores for Next Iteration ($N_{\text{parent}} = 1$):**
  - Unvisited nodes ML and BR: $\text{UCB} = +\infty$.
  - TR: $Q + c \sqrt{\frac{\ln 1}{1}} = 1.00 + \sqrt{2} \cdot 0 = 1.00$.

#### Iteration 1 $\to$ 2 (Expand Middle-Left / ML):
- **Selection & Expansion:** Select unvisited node **ML** ($\text{UCB} = +\infty$).
- **Simulation:** Rollout yields a **Draw (0.5)**.
- **Backpropagation:**
  - Child ML: $N = 1, \, W = 0.5, \, Q = 0.50$.
  - Root: $N = 2, \, W = 1.5, \, Q = 0.75$.
- **Exploration Bonus Calculation ($N_{\text{parent}} = 2$):**
  $$c \sqrt{\frac{\ln 2}{1}} = \sqrt{2} \times \sqrt{0.69315} = 1.4142 \times 0.83255 \approx 1.177$$
- **UCB Scores for Next Iteration ($N_{\text{parent}} = 2$):**
  - Unvisited node BR: $\text{UCB} = +\infty$.
  - TR: $1.00 + 1.177 = 2.177$.
  - ML: $0.50 + 1.177 = 1.677$.

#### Iteration 2 $\to$ 3 (Expand Bottom-Right / BR):
- **Selection & Expansion:** Select unvisited node **BR** ($\text{UCB} = +\infty$).
- **Simulation:** Rollout yields a **Loss (0.0)**.
- **Backpropagation:**
  - Child BR: $N = 1, \, W = 0.0, \, Q = 0.00$.
  - Root: $N = 3, \, W = 1.5, \, Q = 0.50$.
- **Exploration Bonus Calculation ($N_{\text{parent}} = 3$):**
  $$c \sqrt{\frac{\ln 3}{1}} = \sqrt{2} \times \sqrt{1.0986} = 1.4142 \times 1.0481 \approx 1.482$$
- **UCB Scores for Iteration 4 Selection ($N_{\text{parent}} = 3$):**
  - TR: $1.00 + 1.482 = \mathbf{2.482}$  *(Highest UCB!)*
  - ML: $0.50 + 1.482 = 1.982$.
  - BR: $0.00 + 1.482 = 1.482$.

**Iteration Summary Table (Slide 24):**

| Iteration | Action Expanded | Rollout Result | Root $(N, W, Q)$ | Child Update $(N, W, Q)$ | UCBs for Next Selection $(N_{\text{parent}})$ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **$0 \to 1$** | TR (Top-Right) | Win ($1.0$) | $(1, \, 1.0, \, 1.00)$ | TR: $(1, \, 1.0, \, 1.00)$ | Unvisited: $+\infty$; TR: $1.00 + 0 = 1.00$ ($N=1$) |
| **$1 \to 2$** | ML (Middle-Left) | Draw ($0.5$) | $(2, \, 1.5, \, 0.75)$ | ML: $(1, \, 0.5, \, 0.50)$ | Unvisited: $+\infty$; TR: $2.177$; ML: $1.677$ ($N=2$) |
| **$2 \to 3$** | BR (Bottom-Right) | Loss ($0.0$) | $(3, \, 1.5, \, 0.50)$ | BR: $(1, \, 0.0, \, 0.00)$ | TR: $\mathbf{2.482}$; ML: $1.982$; BR: $1.482$ ($N=3$) |

*Conclusion:* In Iteration 4, because all immediate children have been expanded, the UCT tree policy selects **TR** for deeper exploration because it possesses the highest combined exploitation-exploration score ($2.482$).

---

### 6.4 Persy the Rover Discounted Planning with MCTS (Slide 25)

**Problem Setup:**
- Persy is at Base $s_0$ with two choices:
  - Explore ($a_1$): Immediate step reward $R = 5$, followed by terminal reward $10$.
  - Stay ($a_2$): Immediate step reward $R = 2$, followed by terminal reward $3$.
- Discount factor: $\gamma = 0.9$.

```
+-------------------------------------------------------------------------------+
|                       PERSY MCTS DISCOUNTED BACKUP (Slide 25)                 |
|                                                                               |
|                                  ( s_0: Base )                                |
|                                   /         \                                 |
|                       a_1 / R=5  /           \  a_2 / R=2                     |
|                                 v             v                               |
|                          ( s_1: Explore )   ( s_2: Stay )                     |
|                                 |                 |                           |
|                        Terminal Reward 10   Terminal Reward 3                 |
+-------------------------------------------------------------------------------+
```

**Calculations:**
- **Explore ($a_1$):**
  $$G_0 = R_1 + \gamma R_2 = 5 + 0.9 \times 10 = 5 + 9.0 = 14.0$$
- **Stay ($a_2$):**
  $$G_0 = R_1 + \gamma R_2 = 2 + 0.9 \times 3 = 2 + 2.7 = 4.7$$
- **Root Updates & Decision:**
  $$\hat{Q}(s_0, a_1) = 14.0, \quad \hat{Q}(s_0, a_2) = 4.7 \implies a^* = \arg\max_a \hat{Q}(s_0, a) = a_1 \quad (\text{Explore!})$$

---

## 7. AlphaGo Zero and Modern MCTS Variants

### 7.1 Scaling to Astronomical State Spaces (Slide 28)

In the game of Go, the state space contains roughly $|\mathcal{S}| \approx 10^{170}$ legal positions with an average branching factor of $b \approx 361$, rendering classical shallow MCTS insufficient.

DeepMind's **AlphaGo Zero** (Silver et al., Nature 2017) eliminated all human expert data, training entirely via tabula rasa self-play and defeating AlphaGo Lee 100–0:
- **Two-Headed Deep Neural Network ($f_\theta$):**
  1. **Value Head $v_\theta(s) \in [-1, 1]$:** Predicts the expected game outcome from position $s$, completely **replacing slow, noisy Monte Carlo rollouts**.
  2. **Policy Head $\boldsymbol{p}_\theta(s)$:** Outputs a probability distribution $P(s, a)$ over all 361 legal moves, providing strong prior guidance.

---

### 7.2 Polynomial Upper Confidence Trees (PUCT; Slide 28)

To handle massive branching factors, AlphaGo Zero replaces UCT1 with the **PUCT** variant:

$$\pi_{\text{PUCT}}(s) = \arg\max_{a \in \mathcal{A}} \left[ \hat{Q}(s, a) + c \, P(s, a) \frac{\sqrt{\sum_b N(s, b)}}{1 + N(s, a)} \right]$$

- **$P(s, a)$ (Prior Move Probability):** Supplied directly by the policy network head. Unpromising moves receive near-zero prior weight and are aggressively pruned from tree expansion.
- **$1 + N(s, a)$ in Denominator:** Ensures that as an action is repeatedly visited, the exploration bonus decays gracefully, allowing the empirical value estimate $\hat{Q}(s, a)$ to dominate.
- **Approximate Policy Iteration:**
  - **Policy Improvement:** Executing PUCT-guided MCTS produces an improved search policy $\boldsymbol{\pi}$ that is significantly stronger than the neural policy head $P(s, \cdot)$.
  - **Policy Evaluation:** Self-play games generated by MCTS search are used as supervised training targets to update network parameters $\theta$ (driving $p_\theta \to \boldsymbol{\pi}$ and $v_\theta \to z$).

---

### 7.3 Comparison: MCTS in MDPs vs. MCTS in Two-Player Zero-Sum Games (Slide 29)

| Characteristic | MCTS in Single-Agent MDPs | MCTS in Two-Player Zero-Sum Games |
| :--- | :--- | :--- |
| **Problem Setting** | Single-agent sequential planning under stochastic transition uncertainty. | Adversarial, two-player, zero-sum, alternating turn-taking games. |
| **Return Definition $G_t$** | Additive discounted rewards: $G_t = \mathcal{R} + \gamma G_{t+1}$. | Terminal outcome: Win ($+1$), Loss ($-1$), or Draw ($0$). |
| **Utility Estimate** | Expected discounted return $\hat{U}(s) = \frac{1}{N} \sum G_t$. | Expected win rate for the player whose turn it is to move. |
| **Tree Selection Policy** | Standard UCT1 balancing exploration vs. exploitation. | PUCT incorporating learned policy priors $P(s, a)$ (e.g., AlphaGo Zero). |
| **Leaf Evaluation** | Monte Carlo simulation rollouts or learned heuristic value functions. | Two-headed value neural networks $v_\theta(s)$ (no rollout simulations). |
| **Backup Propagation** | Propagates scalar discounted return $G_t$ upward. | Propagates win/loss probabilities upward, **negating or alternating perspective** at each ply. |

---

## 8. Demonstration-Based Planning & Imitation Learning Foundations

While decision-time planning simulates futures online using a known transition simulator, many real-world sequential decision problems lack a computable model or formal reward function.

**Apprenticeship Learning (Demonstration-Based Planning)** trains policies offline using exemplary demonstration trajectories collected from human or domain experts (Slides 33–36).

```
+---------------------------------------------------------------------------------------------------+
|                        MOTIVATION FOR DEMONSTRATION-BASED PLANNING (Slide 34)                     |
|                                                                                                   |
|  1. Reward Specification Hardship ===> Defining formal mathematical rewards for complex tasks     |
|                                        (e.g., natural driving, surgical cutting) is intractable.  |
|                                                                                                   |
|  2. Environmental Safety Hazards   ===> Autonomous trial-and-error exploration in real-world RL   |
|                                        risks catastrophic physical damage or financial loss.      |
|                                                                                                   |
|  3. Expert Data Accessibility      ===> Human operators or privileged controllers can readily     |
|                                        demonstrate safe, high-competence execution trajectories.  |
+---------------------------------------------------------------------------------------------------+
```

---

### 8.1 The Two Methodological Paradigms (Slide 34 & 35)

1. **Imitation Learning (IL):**
   - Directly maps observed states to actions: $\pi: \mathcal{S} \to \mathcal{A}$.
   - Treats expert demonstrations $\mathcal{D} = \{(s_i, a_i)\}$ as a supervised dataset, bypassing reward recovery entirely:
     $$\pi^* = \arg\min_\pi \sum_{(s_i, a_i) \in \mathcal{D}} \ell(\pi(s_i), a_i)$$
2. **Inverse Reinforcement Learning (IRL):**
   - Aims to solve the inverse problem: *What latent reward function $R(s, a)$ was the expert optimizing?*
   - Once inferred, forward RL derives the optimal policy:
     $$\pi^* = \arg\max_\pi \mathbb{E}_\pi \left[ \sum_{t=0}^\infty \gamma^t R(s_t, a_t) \right]$$

---

## 9. Behavioral Cloning (BC) & The Failure of Supervised Learning in Sequential Decisions

### 9.1 Mathematical Formulation of Behavioral Cloning (Slides 38 & 39)

**Behavioral Cloning (BC)** reduces imitation learning to standard supervised classification or regression:
- Given an expert demonstration dataset $\mathcal{D} = \{(s_i, a_i)\}_{i=1}^M$, train a parameterized policy $\pi_\theta(a \mid s)$ to maximize the log-likelihood of observed expert decisions:

$$\theta^* = \arg\max_\theta \prod_{(s_i, a_i) \in \mathcal{D}} \pi_\theta(a_i \mid s_i) = \arg\max_\theta \sum_{(s_i, a_i) \in \mathcal{D}} \log \pi_\theta(a_i \mid s_i)$$

Equivalently, minimize the **Negative Log-Likelihood (NLL)** loss:
$$\theta^* = \arg\min_\theta \sum_{(s_i, a_i) \in \mathcal{D}} \ell(\pi_\theta(s_i), a_i) = \arg\min_\theta \sum_{(s_i, a_i) \in \mathcal{D}} \big[ -\log \pi_\theta(a_i \mid s_i) \big]$$

---

### 9.2 The Fundamental Flaw: Violation of the i.i.d. Assumption (Slide 40)

Supervised machine learning relies entirely on the **i.i.d. assumption**: training examples and test examples are assumed to be drawn independently from the identical probability distribution:
$$P_{\text{train}}(x) = P_{\text{test}}(x)$$

In sequential decision-making environments, **this assumption is fundamentally shattered**:
- The agent's action $a_t = \pi_\theta(s_t)$ directly influences environmental transitions, dictating the next state $s_{t+1} \sim \mathcal{P}(\cdot \mid s_t, a_t)$.
- Consequently, **the policy's own past decisions determine its future input distribution**!

```
+---------------------------------------------------------------------------------------------------+
|                         THE COMPOUNDING ERROR CASCADE IN BEHAVIORAL CLONING                       |
|                                                                                                   |
|   Expert Trajectory:  s_0 --------> s_1 --------> s_2 --------> s_3 --------> Target Goal         |
|                        ^             ^             ^             ^                                |
|                        | Demonstrations \mathcal{D} reside strictly along this optimal corridor   |
|                                                                                                   |
|   Learned Policy \pi_\theta:                                                                      |
|   s_0 ----> \tilde{s}_1 (Minor error \epsilon)                                                    |
|                \                                                                                  |
|                 v                                                                                 |
|                \tilde{s}_2 (Out of Distribution! \pi_\theta has zero training data here!)         |
|                   \                                                                               |
|                    v                                                                              |
|                   \tilde{s}_3 (Catastrophic Error! Agent drives off track / crashes!)             |
+---------------------------------------------------------------------------------------------------+
```

### 9.3 The Three Pathology Modes of Behavioral Cloning (Slide 40)

1. **Covariate Shift / Distribution Mismatch:** The distribution of states visited by the learner $P_{\pi_\theta}(s)$ drifts away from the expert demonstration distribution $P_{\pi^*}(s)$.
2. **Compounding Execution Errors ($\mathcal{O}(T^2 \epsilon)$ Disaster):**
   In standard supervised learning, an error rate of $\epsilon$ yields $\mathcal{O}(T \epsilon)$ total errors over $T$ steps. In sequential settings, an initial mistake $\epsilon$ at step $t$ pushes the agent into an unfamiliar state $s \notin \mathcal{D}$. In unfamiliar territory, the policy produces larger errors, accelerating systematic drift. **Ross & Bagnell (2010)** proved that the expected cumulative error under Behavioral Cloning scales quadratically with time horizon $T$:
   $$\mathbb{E}[\text{Total Task Regret}] \le \mathcal{O}(T^2 \epsilon)$$
3. **Absence of Recovery Demonstrations:** Expert datasets contain only clean, optimal executions. An expert driver never veers onto the grass; therefore, $\mathcal{D}$ contains zero examples of how to recover from near-crash states back to the roadway.

---

## 10. Dataset Aggregation (DAgger): Interactive Imitation Learning

To solve the distribution mismatch of Behavioral Cloning, **Ross, Gordon, and Bagnell (AISTATS 2011)** introduced **DAgger (Dataset Aggregation)**.

### 10.1 The Core DAgger Insight (Slides 41–44)

> **The DAgger Philosophy:**
> *Instead of forcing the learner to stay on the expert's state distribution, train the policy directly on the state distribution it actually encounters during autonomous execution!*

---

### 10.2 The DAgger Algorithmic Loop (Slides 42 & 44)

```
+---------------------------------------------------------------------------------------------------+
|                                  THE DAgger ALGORITHMIC WORKFLOW                                  |
|                                                                                                   |
|   Step 1: Train initial policy \hat{\pi}_1 on expert demonstrations \mathcal{D}_0 via supervised learning|
|                                                                                                   |
|   For Iteration i = 1 to N:                                                                       |
|     1. Roll out mixture policy: \pi_i = \beta_i \pi^* + (1 - \beta_i) \hat{\pi}_i                |
|        (Decay \beta_i \to 0 across iterations to give autonomous control to learner).              |
|                                                                                                   |
|     2. Collect visited states: \mathcal{S}_i = \{ s_1, s_2, \dots, s_T \}                         |
|                                                                                                   |
|     3. Query the Expert Oracle to label visited states with optimal actions:                      |
|        \mathcal{D}_i = \big\{ (s, \, \pi^*(s)) \mid s \in \mathcal{S}_i \big\}                    |
|                                                                                                   |
|     4. Aggregate Dataset: \mathcal{D} \leftarrow \mathcal{D} \cup \mathcal{D}_i                   |
|                                                                                                   |
|     5. Retrain Policy on Full Aggregated Data:                                                    |
|        \hat{\pi}_{i+1} = \arg\min_\pi \sum_{(s, a) \in \mathcal{D}} \ell(\pi(s), a)              |
|                                                                                                   |
|   Return best policy \hat{\pi}^* evaluated on validation.                                         |
+---------------------------------------------------------------------------------------------------+
```

- **Dataset Update Rule (Slide 42):**
  $$\mathcal{D}_{i+1} = \mathcal{D}_i \cup \big\{ (s, \, \pi^*(s)) \big\}$$
- **Decaying Expert Exploitation ($\beta$ Parameter; Slide 44):**
  Early iterations use a high probability $\beta$ of following the expert to ensure safety. As iterations advance, $\beta \to 0$, forcing the policy to navigate autonomously, make mistakes, and immediately receive expert corrections for those exact mistakes.
- **Linear Regret Guarantee:** Ross et al. (2011) proved that DAgger reduces the compounding error bound from quadratic $\mathcal{O}(T^2 \epsilon)$ down to linear:
  $$\mathbb{E}[\text{Total Regret}] \le \mathcal{O}(T \epsilon)$$

---

### 10.3 Empirical Benchmark: Autonomous Kart Racing (Slide 43)

- **Task:** Autonomous kart steering from first-person visual input at fixed speed; goal: complete laps without driving off the track.
- **Metric:** Average falls per lap (lower is better).
- **Experimental Findings (Ross et al., 2011):**
  - **Supervised Learning (BC):** Catastrophically degrades as trajectory length increases ($>3.5$ falls per lap) due to compounding distribution drift.
  - **SMILe Algorithm:** Exhibits slow, modest improvements.
  - **DAgger:** Rapidly reduces falls per lap to **near zero** within 4 iterations by explicitly exposing the learner to its own off-track states and learning recovery maneuvers!

```
+-------------------------------------------------------------------------------+
|                    KART RACING BENCHMARK RESULTS (Slide 43)                   |
|                                                                               |
|  Average Falls Per Lap:                                                       |
|  4.0 |                  * Supervised BC (Degrades with data! >3.5 falls)      |
|  3.0 |  * Supervised                                                          |
|  2.0 |  \                                                                     |
|  1.0 |   \                                                                    |
|  0.0 |----+----* DAgger (Falls drop to NEAR ZERO within 4 iterations!)        |
|      0   0.5   1.0   1.5   2.0   2.5 x 10^4 Training Data Samples             |
+-------------------------------------------------------------------------------+
```

---

### 10.4 Notable DAgger Variants & Innovations (Slides 41 & 49)

1. **SafeDAgger (Zhang & Cho, 2016):** Introduces a safety auditor model that predicts the discrepancy between learner and expert. Queries the expert only when the safety boundary is breached, slashing expert query costs.
2. **SHIV (Laskey et al., ICRA 2016):** Uses Support Vector Machines to identify low-confidence state regions, minimizing supervisor burden in high-dimensional domains.
3. **DART (Laskey et al., CoRL 2017):** Injects controlled noise into the expert's controls during demonstration collection. This forces the expert to demonstrate recovery maneuvers offline, providing DAgger-like robustness without needing an interactive online expert!
4. **HG-DAgger (Kelly et al., ICRA 2019):** Human-Gated DAgger designed for intuitive human-in-the-loop takeover when physical robots approach dangerous states.
5. **Agnostic Interactive Imitation Learning (Agnostic IIL; Li & Zhang, ICML 2024):** Extends imitation theory to handle imperfect, noisy, or sub-optimal experts.
6. **Deeply AggreVaTeD (Sun et al., ICML 2017):** Merges DAgger with value-based reinforcement learning and policy gradients for continuous structured prediction.
7. **Conditional Imitation Learning (Codevilla et al., ICRA 2018):** End-to-end vision-based driving conditioned on high-level navigational directions (e.g., "turn left at the next intersection").

---

## 11. Generative Adversarial Imitation Learning (GAIL)

A significant operational limitation of DAgger is its reliance on an **interactive expert oracle** during training. In many real-world applications, human experts cannot be queried interactively.

**Generative Adversarial Imitation Learning (GAIL; Ho & Ermon, NeurIPS 2016; Slide 45 & 48)** bypasses interactive expert querying by formulating imitation learning as an adversarial distribution-matching game:

```
+---------------------------------------------------------------------------------------+
|                                    GAIL ARCHITECTURE                                  |
|                                                                                       |
|   Expert Dataset \mathcal{D}_E --------+                                              |
|                                        v                                              |
|                               +-------------------+                                   |
|                               |   DISCRIMINATOR   | ---> Output: D_\psi(s, a) \in (0,1)|
|                               |     D_\psi(s,a)   |      (Probability state-action    |
|                               +-------------------+       came from expert)           |
|                                        ^                                              |
|   Agent Trajectories (s, a) -----------+                                              |
|         ^                                                                             |
|         | Generates rollouts                                                          |
|   +-------------------+                                                               |
|   |  GENERATOR POLICY | <--- RL Gradient Update via Intrinsic Reward:                 |
|   |   \pi_\theta(a|s) |      r(s, a) = -\log(1 - D_\psi(s, a))                        |
|   +-------------------+                                                               |
+---------------------------------------------------------------------------------------+
```

$$\min_\pi \max_{D \in (0, 1)} \mathbb{E}_\pi \big[ \log\big(1 - D(s, a)\big) \big] + \mathbb{E}_{\pi_E} \big[ \log D(s, a) \big] - \lambda \mathcal{H}(\pi)$$

- **Discriminator $D_\psi(s, a)$:** Trained as a binary classifier to distinguish between expert state-action pairs and learner pairs.
- **Generator Policy $\pi_\theta(a \mid s)$:** Optimized using model-free RL (e.g., TRPO or PPO) where the environment reward is replaced by the discriminator's confusion signal:
  $$r_{\text{intrinsic}}(s, a) = -\log\big(1 - D_\psi(s, a)\big)$$
- **Theoretical Insight:** GAIL mathematically forces the learner's **state-action occupancy measure** $\rho_\pi(s, a)$ to match the expert's occupancy measure $\rho_E(s, a)$ without ever recovering an explicit reward function or querying an interactive expert!

---

## 12. Human Factors, Software Ecosystem, & Architectural Synthesis

### 12.1 Human Factors and Human-Guided Planning (Slide 47)

While demonstration-based methods rely on human guidance, **human decision-makers systematically deviate from normative expected utility theory**:
1. **Cognitive Biases & Bounded Rationality:** Humans exhibit attentional bottlenecks, anchoring biases, and recency effects.
2. **Judgmental Heuristics:** Decisions are influenced by availability, representativeness, and affect heuristics.
3. **Prospect Theory (Kahneman & Tversky):** Humans evaluate outcomes relative to subjective reference points, displaying risk aversion for gains and risk seeking for losses via non-linear decision weighting.

Future planning frontiers must model these deviations through:
- **Game Theory:** Multi-agent decision modeling capturing strategic deception and bounded rationality.
- **Model-Based RL:** Embedding structured human priors directly into learned transition dynamics.
- **Foundation Model Planning:** Combining the intuitive reasoning of LFMs with formal online search algorithms.

---

### 12.2 Imitation Learning Software Ecosystem (Slide 50)

| Framework | Maintainers | Key Algorithms | Primary Focus & Domain |
| :--- | :--- | :--- | :--- |
| **`robomimic`** | NVIDIA / Stanford (ARISE) | BC, BC-RNN, DAgger variants, GAIL, Diffusion Policy | Robotic manipulation, multimodal imitation learning, and offline RL. |
| **`imitation`** | Center for Human-Compatible AI (CHAI) | BC, AIRL, GAIL, DAgger | Clean, modular reference implementations on standard Gymnasium benchmarks. |
| **`X-IL`** | Open Research Consortium | BC, DAgger, GAIL variants | Large-scale embodied AI benchmarks (RoboCasa, LIBERO). |
| **`Stable Baselines3`** | DLR / Open-Source Community | PPO, SAC, TD3 (RL backend) | Provides underlying RL optimization backends for GAIL and AIRL via `imitation`. |

---

### 12.3 High-Level Synthesis: Comparative Trade-Off Matrix

| Paradigm | Training Time | Runtime Compute | Expert Burden | Environment Model | Compounding Error Risk |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Rollouts** | None (Zero training) | High ($N$ rollouts/step) | None | Requires simulator $\mathcal{P}(s' \mid s, a)$ | None |
| **MCTS (UCT)** | None (Anytime) | High (Tree rollouts) | None | Requires simulator $\mathcal{P}(s' \mid s, a)$ | None |
| **AlphaGo PUCT** | High (Self-play) | Moderate (No rollouts) | None (Tabula rasa) | Requires simulator $\mathcal{P}(s' \mid s, a)$ | None |
| **Behavioral Cloning** | Very Low (Supervised) | Very Low (1 forward pass)| Low (Static dataset) | Model-free | **Severe ($\mathcal{O}(T^2 \epsilon)$ drift)** |
| **DAgger** | Moderate (Iterative) | Very Low (1 forward pass)| High (Interactive labeling)| Model-free | **Minimal ($\mathcal{O}(T \epsilon)$ bound)** |
| **GAIL** | High (Minimax RL) | Very Low (1 forward pass)| Low (Static dataset) | Requires environment rollouts | Low (Matches occupancy) |

---

<reviewkit>
<takeaways>
- **The Curse of Dimensionality in Planning:** When state spaces scale exponentially ($|\mathcal{S}| = |\mathcal{S}_{\text{local}}|^K$), global offline dynamic programming (Value Iteration) and global tabular RL become intractable. Modern systems bypass this via Decision-Time Online Search or Demonstration-Based Offline Learning.
- **Decision-Time vs. Demonstration-Based Planning:** Decision-time planning simulates futures locally at runtime from the current state $s_0$ to choose immediate action $a^*$; demonstration-based planning learns safe, competent global policies from expert trajectories before runtime.
- **The Four Utility Quantities:** Realized return $G_t$, expected policy utility $U^\pi(s_t) = \mathbb{E}[G_t \mid s_t]$, optimal utility $U(s_t) = \max_\pi U^\pi(s_t)$, and action-utility $Q^\pi(s_t, a_t) = \mathbb{E}[G_t \mid s_t, a_t]$.
- **Rollout Algorithms:** Execute one-step policy improvement at decision time by simulating $N$ trajectories under a rollout policy $\pi$ for each candidate action, evaluating $\hat{Q}^\pi(s, a) \approx \frac{1}{N} \sum G_t$.
- **The Four MCTS Phases:** (1) **Selection** via a tree policy balancing exploration/exploitation; (2) **Expansion** of untried child nodes; (3) **Simulation** via fast rollouts to terminal states; (4) **Backup** of discounted returns $G_t$ upward to root $s_0$. MCTS is an anytime algorithm.
- **The UCT1 Selection Formula:** Action selection at node $n$ follows $\pi_{\text{UCT}} = \arg\max_a [ \hat{Q}(s, a) + c \sqrt{\ln N(s) / N(s, a)} ]$. Denominator $N(s, a)$ guarantees all children are explored ($+\infty$ bonus for unvisited actions), while numerator $\ln N(s)$ forces exploration of neglected branches.
- **AlphaGo Zero PUCT Innovation:** Replaces noisy Monte Carlo rollouts with a neural Value Head $v_\theta(s)$, and guides tree expansion via a Policy Head prior $P(s, a)$ in the PUCT formula, scaling MCTS to Go's $10^{170}$ states.
- **The Breakdown of Supervised Learning in Sequential Decisions:** Behavioral Cloning treats expert actions as supervised labels. Because agent actions alter future states, the i.i.d. assumption is violated. Minor errors cause covariate shift into unvisited states, inducing compounding quadratic errors ($\mathcal{O}(T^2 \epsilon)$) and failure to recover.
- **DAgger Resolves Distribution Mismatch:** Dataset Aggregation iteratively executes the learner's own policy $\pi_i$, collects visited states, queries the expert for optimal actions on those exact visited states, and retrains on aggregated data $\mathcal{D} \cup \mathcal{D}_i$, reducing compounding error to $\mathcal{O}(T \epsilon)$.
- **GAIL Adversarial Imitation:** Generative Adversarial Imitation Learning matches state-action occupancy measures $\rho_\pi \approx \rho_E$ through an adversarial minimax game between a policy generator and a discriminator, eliminating the need for an interactive expert during training.
</takeaways>

<qquiz src="questions.en.json"/>

<qprompt/>
</reviewkit>

## References

1. Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach (4th ed.)*. Chapters 5.4, 17.2.4. Pearson.
2. Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction (2nd ed.)*. Sections 8.10, 8.11. MIT Press.
3. Chaslot, G., Winands, M. H., Herik, H. J. V. D., Uiterwijk, J. W., & Bouzy, B. (2008). Progressive strategies for Monte-Carlo tree search. *New Mathematics and Natural Computation*, 4(03), 343-357.
4. Kocsis, L., & Szepesvári, C. (2006). Bandit based Monte-Carlo planning. In *European Conference on Machine Learning (ECML 2006)* (pp. 282-293). Springer.
5. Coquelin, P. A., & Munos, R. (2007). Bandit algorithms for tree search. In *Uncertainty in Artificial Intelligence (UAI 2007)* (pp. 67-74). AUAI Press.
6. Silver, D., Schrittwieser, J., Simonyan, K., Antonoglou, I., Huang, A., Guez, A., ... & Hassabis, D. (2017). Mastering the game of Go without human knowledge. *Nature*, 550(7676), 354-359.
7. Silver, D., Hubert, T., Schrittwieser, J., Antonoglou, I., Lai, M., Guez, A., ... & Hassabis, D. (2018). A general reinforcement learning algorithm that masters chess, shogi, and Go through self-play. *Science*, 362(6419), 1140-1144.
8. Levinson, R. (2024). Monte Carlo Tree Search for Integrated Planning, Learning, and Execution in Nondeterministic Python. In *Proceedings of the International Conference on Automated Planning and Scheduling (ICAPS 2024)*.
9. Ross, S., Gordon, G., & Bagnell, D. (2011). A reduction of imitation learning and structured prediction to no-regret online learning. In *Proceedings of the 14th International Conference on Artificial Intelligence and Statistics (AISTATS 2011)* (pp. 627-635).
10. Ross, S. (2013). *Interactive learning for sequential decisions and predictions* (Doctoral dissertation, Carnegie Mellon University).
11. Ross, S., & Bagnell, D. (2010). Efficient reductions for imitation learning. In *Proceedings of the 13th International Conference on Artificial Intelligence and Statistics (AISTATS 2010)* (pp. 661-668).
12. Ho, J., & Ermon, S. (2016). Generative adversarial imitation learning. *Advances in Neural Information Processing Systems (NeurIPS 2016)*, 29, 4572-4580.
13. Zhang, J., & Cho, K. (2016). Query-efficient imitation learning for end-to-end autonomous driving. *arXiv preprint arXiv:1605.06450*.
14. Laskey, M., Lee, J., Fox, R., Dragan, A. D., & Goldberg, K. (2016). SHIV: Reducing supervisor burden in DAgger using support vectors for efficient learning from demonstrations in high dimensional state spaces. In *IEEE International Conference on Robotics and Automation (ICRA 2016)* (pp. 462-469).
15. Laskey, M., Staszak, S., Hsieh, W. Y., Mahler, J., Pokorny, F. T., & Goldberg, K. (2017). DART: Noise injection for robust imitation learning. In *Conference on Robot Learning (CoRL 2017)* (pp. 143-156).
16. Sun, W., Venkatraman, A., Gordon, G. J., Boots, B., & Bagnell, J. A. (2017). Deeply AggreVaTeD: Differentiable imitation learning for sequential prediction. In *International Conference on Machine Learning (ICML 2017)* (pp. 3309-3318).
17. Duan, Y., Andrychowicz, M., Stadie, B., Ho, O. J., Schneider, J., Sutskever, I., ... & Zaremba, W. (2017). One-shot imitation learning. *Advances in Neural Information Processing Systems (NeurIPS 2017)*, 30.
18. Hussein, A., Gaber, M. M., Elyan, E., & Jayne, C. (2017). Imitation learning: A survey of learning methods. *ACM Computing Surveys (CSUR)*, 50(2), 1-35.
19. Codevilla, F., Müller, M., López, A., Koltun, V., & Dosovitskiy, A. (2018). End-to-end driving via conditional imitation learning. In *IEEE International Conference on Robotics and Automation (ICRA 2018)* (pp. 4693-4700).
20. Kelly, A., Sidrane, C., Dragan, A. D., & Goldberg, K. (2019). HG-DAgger: Interactive imitation learning with human experts. In *IEEE International Conference on Robotics and Automation (ICRA 2019)* (pp. 8077-8083).
21. Gavenski, N., Rodrigues, O., & Luck, M. (2024). Imitation learning: A survey of learning methods, environments and metrics. *arXiv preprint arXiv:2404.19456*.
22. Li, Y., & Zhang, C. (2024). Agnostic interactive imitation learning: New theory and practical algorithms. In *Proceedings of the 41st International Conference on Machine Learning (ICML 2024)*.
