<meta>
Title: Rational Decision Making: Decision Theory, Utility Theory, and Game Theory
Summary: A rigorous technical analysis of rational decision making under uncertainty, based on NUS CS4246/5446. Covers foundations of decision making under uncertainty, substantive vs. procedural vs. meta-level rationality, the BDI (Belief-Desire-Intention) framework in modern agentic AI (LLMs), mathematical decision models vs. logical planning, normative vs. descriptive vs. prescriptive theory, Daniel Bernoulli's 1738 Utility Theory vs. von Neumann-Morgenstern 1944 Game Theory, the Maximum Expected Utility (MEU) principle (fully vs. partially observable formulations), single-agent (Panda Lulu) vs. multi-agent (Pandas Dilemma Nash Equilibrium) case studies, an 8-domain application comparison matrix, the 6 VNM axioms of rational preferences, the Money Pump Paradox exploiting non-transitive preferences, Expected Utility Theorem, positive affine transformation invariance, invalidation of inter-agent utility comparisons, 8 real-world utility metrics (QALY, DALY, Micromort, VSL, VHT, CARA exponential, logarithmic, carbon cost), Expected Monetary Value (EMV), Certainty Equivalent (CE), Risk Premium (EV - CE), risk-averse vs. risk-neutral vs. risk-seeking characterizations, step-by-step risk premium calculation, and AI implementation challenges.
Slug: rational-decision-making-utility-theory-and-game-theory
Output: notes/rational-decision-making-utility-theory-and-game-theory/rational-decision-making-utility-theory-and-game-theory.html
CanonicalId: rational-decision-making-utility-theory-and-game-theory
Style: default
EstimatedReadingTime: true
Lang: en
Tags: reinforcement learning, decision theory, utility theory, game theory, rational agents
Status: drafting
Published: 2026-09-01
LastModified: 2026-09-01
</meta>
<draft>
- 1. Foundations of Decision Making under Uncertainty
    - Environment Context: Episodic and partially observable environments with uncertain states and uncertain action effects.
    - Core Rational Agent Triad:
        - Beliefs: Internal representation and probabilistic world model.
        - Preferences: Utility function U mapping outcomes to scalar values representing desirability.
        - Decision Process: Action selection mechanism maximizing expected utility or minimizing cost under resource limits.
    - Three Types of Rationality:
        - 1. Substantive Rationality (Ends-focused): Achieving desirable, optimal outcomes.
        - 2. Procedural Rationality (Means-focused): Utilizing a coherent, structured, justifiable decision method.
        - 3. Meta-level Rationality: Deciding how to decide (meta-reasoning under bounded computational resources).
- 2. The Belief-Desire-Intention (BDI) Model in Modern Agentic AI
    - Framework Components: Beliefs (world model), Desires (goals/objectives), Intentions (committed plans/chosen actions).
    - Role in LLM Agents:
        - Beliefs -> Reasoning, contextual memory, and world state updates.
        - Desires -> Goal setting, task decomposition, and prioritization.
        - Intentions -> Planning, tool selection, and step-by-step execution.
- 3. Formal Mathematical Decision Model & Relation to Logical Planning
    - Action Space: a in A.
    - State & Beliefs: s in S, belief distribution P(s).
    - Transition Dynamics: P(s' | s, a), conditional probability of state transition.
    - Outcome Random Variable: Result(a) with state realizations s'.
    - Expected Outcome Distribution: P(Result(a) = s') = sum_s P(s) * P(s' | s, a).
    - Utility Function: U(s) in R.
    - Classical Planning vs. Decision Models: Classical planning uses deterministic state transitions and binary utilities (U=1 for goal, 0 otherwise). Decision models generalize planning by incorporating probability theory and continuous utility functions.
- 4. Branches & Historical Origins of Decision Theory
    - Normative Decision Theory: How ideal, fully rational agents SHOULD decide.
    - Descriptive Decision Theory: How empirical agents (humans) ACTUALLY decide.
    - Prescriptive Decision Theory: Practical frameworks to HELP agents make rational choices.
    - Historical Origins:
        - Utility Theory: Daniel Bernoulli (1738) - Single-agent decision making under risk/uncertainty using subjective utility.
        - Game Theory: von Neumann & Morgenstern (1944) - Multi-agent strategic interactions where payoffs depend on joint action profiles.
- 5. Maximum Expected Utility (MEU) Principle
    - Principle: A rational agent chooses the action that maximizes its expected utility.
    - Fully Observable Formulation: action = argmax_a sum_s' P(s' | s, a) * U(s').
    - Partially Observable Formulation: action = argmax_a sum_s' sum_s P(s) * P(s' | s, a) * U(s').
- 6. Case Studies: Single-Agent Utility vs. Multi-Agent Game Theory
    - Single-Agent Case Study (Panda Lulu Lunch Choice):
        - Action 1 (Bamboo Grove): 50% chance of 10 shoots, 50% chance of 0 shoots -> E[U] = 0.5(10) + 0.5(0) = 5.0.
        - Action 2 (Berry Bush): 100% chance of 4 berries -> E[U] = 1.0(4) = 4.0.
        - Decision: Choose Bamboo Grove (5.0 > 4.0).
    - Multi-Agent Case Study (Pandas Dilemma / Prisoner's Dilemma):
        - Players: Bobo (B) and Almo (A). Choices: Keep vs. Share.
        - Matrix: Keep/Keep -> (1, 1); Keep/Share -> (5, 0); Share/Keep -> (0, 5); Share/Share -> (3, 3).
        - Dominant Strategy & Nash Equilibrium: Keep is dominant for both -> Nash Equilibrium at (1, 1).
        - Collective Optimality: Share/Share (3, 3) is Pareto superior to (1, 1).
        - Insight: Individual self-interested rationality does not necessarily yield collectively optimal outcomes.
- 7. Domain Applications Matrix (Utility Theory vs. Game Theory)
    - Economics: Consumer choice / risk assessment vs. Pricing / Auctions.
    - Networks: Resource allocation vs. Cooperative routing / cost-sharing.
    - Political Science: Policy evaluation vs. Voting mechanisms / coalitions.
    - Biology: Optimal foraging vs. Evolutionary stable strategies (ESS).
    - Business: Capital investment vs. Competitive pricing negotiations.
    - Social Impact: Resource distribution vs. Trust & fairness mechanisms.
    - Health Care: Clinical treatment vs. Hospital market / vaccine games.
    - Education: Personalized learning vs. Institutional competition / incentives.
- 8. Six von Neumann-Morgenstern (VNM) Rationality Axioms
    - Preference Relations: A >- B (Strict), A ~ B (Indifference), A >-= B (Weak).
    - Lottery: L = [p1, S1; p2, S2; ...; pn, Sn] where sum_i pi = 1.
    - VNM Axioms:
        - 1. Orderability (Completeness): (A >- B) or (B >- A) or (A ~ B).
        - 2. Transitivity: (A >- B) and (B >- C) => (A >- C).
            - Exploiting Irrationality (Money Pump Paradox): Non-transitive preference Coke >- Sprite >- Pepsi >- Coke allows an arbitrageur to trade 3 times charging 50 cents each time, taking $1.50 while giving the agent back their original Coke.
        - 3. Continuity: A >- B >- C => exists p in [0, 1] such that [p, A; 1-p, C] ~ B.
        - 4. Substitutability (Independence): A ~ B => [p, A; 1-p, C] ~ [p, B; 1-p, C].
        - 5. Monotonicity: A >- B => (p > q <=> [p, A; 1-p, B] >- [q, A; 1-q, B]).
        - 6. Decomposability: [p, A; 1-p, [q, B; 1-q, C]] ~ [p, A; (1-p)q, B; (1-p)(1-q), C].
- 9. Expected Utility Theorem & Positive Affine Transformation Invariance
    - Theorem: If preferences satisfy VNM axioms, there exists U: S -> R such that U(A) > U(B) <=> A >- B and U(L) = sum_i pi * U(Si).
    - Affine Invariance: U'(s) = a * U(s) + b (a > 0) preserves identical preference ordering and risk decisions.
    - Invalidation of Inter-Agent Utility Comparisons: If Agent 1 has U1(Win) = 100 and Agent 2 has U2(Win) = 10, it is incorrect to infer Agent 1 desires winning 10 times more than Agent 2. Raw utility values convey internal ranking and risk posture within an individual agent, but do not permit absolute inter-agent comparisons.
    - Flaw of Non-Linear Monotonic Transformations: Applying non-linear transformations such as U'(s) = log(U(s)) to normalize utilities preserves ordinal state rankings but alters second derivative curvature U''(x), artificially injecting risk aversion into lottery expected utility calculations.
- 10. 8 Real-World Utility Metrics Across Domains
    - 1. QALY (Health): U = Years * Quality (0-1). 10 yrs at 0.6 = 6.0 QALYs.
    - 2. DALY (Global Health): Years lost to disability/mortality (lower is better).
    - 3. Micromort: 10^-6 mortality probability.
    - 4. VSL (Public Policy): Value of Statistical Life (~$14M USD US, ~$5.9M AUD Australia).
    - 5. VHT (Transport): U = -(Time * Hourly Rate).
    - 6. Exponential Utility (Finance): U(x) = 1 - e^(-x/R) (CARA).
    - 7. Logarithmic Utility (Economics): U(x) = log(x) (diminishing marginal utility).
    - 8. Carbon Cost Utility (Energy): U = -(Tons CO2 * Price/Ton).
- 11. Utility of Money, EMV, Certainty Equivalent, and Risk Premium
    - Expected Monetary Value (EMV): EMV(L) = sum_i pi * xi.
    - Wealth vs. Utility Dilemma: Wealth $1M, 50-50 gamble lose all ($0) or win $1.5M ($2.5M). EMV(Accept) = $1.25M > $1M. But concave U(0)=5, U(1M)=8, U(2.5M)=9 => EU(Accept) = 0.5(5) + 0.5(9) = 7.0 < EU(Decline) = 8.0. Rational agent declines bet!
    - Certainty Equivalent (CE): U(CE) = EU(Lottery) => CE = U^-1(EU(Lottery)).
    - Risk Premium (RP): RP = EV - CE. Amount of expected return sacrificed to eliminate risk.
    - Risk Attitudes:
        - Risk-Averse: CE < EV (RP > 0), Concave U(x).
        - Risk-Neutral: CE = EV (RP = 0), Linear U(x).
        - Risk-Seeking: CE > EV (RP < 0), Convex U(x).
    - Worked Procedure & Example: 50% win $2000 / 50% lose $20 => EMV = 0.5(2000) + 0.5(-20) = $990. Given CE = $300 => Risk Premium = 990 - 300 = $690. Willing to forgo $690 to eliminate $20 downside!
- 12. Implementation Challenges & Non-Linearity Caveats in AI
    - Approximating Intractable U(s'): High-dimensional, long-horizon U(s') evaluations are intractable due to exponential state trees. Modern AI combines learned RL heuristic value functions with MCTS truncated lookahead search to approximate expected utility.
    - Challenges: Large action spaces, inference complexity P(s'|s,a), preference elicitation, ethical alignment.
    - Caveats: Non-additivity U(a+b) != U(a) + U(b); net asset state evaluation; ordinal vs. cardinal limits; dimensional separation (EU internal vs. CE external).
</draft>

# Rational Decision Making: Decision Theory, Utility Theory, and Game Theory

Rational decision making forms the core theoretical framework for artificial intelligence agents operating in uncertain, dynamic environments. Based on National University of Singapore (NUS) course **CS4246/5446: Reinforcement Learning and Sequential Decision Making (Version 3.0)**, this technical note explores formal decision models, the Belief-Desire-Intention (BDI) architecture in modern agentic AI, von Neumann-Morgenstern (VNM) utility axioms, the Maximum Expected Utility (MEU) principle, game-theoretic equilibria, risk premium calculations, and multi-domain utility metrics.

---

## 1. Foundations of Decision Making under Uncertainty

Sequential decision making targets **episodic and partially observable environments** characterized by two fundamental sources of uncertainty:
1. **State Uncertainty**: The true state of the environment $s \in S$ is not directly observable with complete certainty.
2. **Outcome Uncertainty**: Executing an action $a \in A$ yields non-deterministic, probabilistic state transitions.

```
+-------------------------------------------------------------------+
|               The Rational Agent Triad Architecture               |
+-------------------------------------------------------------------+
| 1. Beliefs     | Internal probabilistic world model P(s)          |
| 2. Preferences | Utility function U(s) mapping outcomes to scalars |
| 3. Decision    | Action selection mechanism maximizing expected   |
|    Process     | benefit or minimizing cost under resource bounds |
+-------------------------------------------------------------------+
```

### 1.1 Three Taxonomies of Rationality

Rationality in decision-theoretic agents is classified into three distinct perspectives:

1. **Substantive Rationality (Ends-Focused)**: Focuses exclusively on the quality of final outcomes. An agent is substantively rational if its choices yield optimal, maximal expected utility.
2. **Procedural Rationality (Means-Focused)**: Focuses on the internal decision mechanism. An agent is procedurally rational if it utilizes a mathematically sound, coherent, and logically justifiable decision-making procedure.
3. **Meta-Level Rationality**: Incorporates **bounded rationality** and meta-reasoning under strict computational constraints. A meta-rational agent deliberates on *how to decide*, evaluating the trade-off between the computational cost of thinking longer versus the marginal gain in expected utility.

---

## 2. The Belief-Desire-Intention (BDI) Model in Modern Agentic AI

The Belief-Desire-Intention (BDI) architecture models rational behavior in advanced AI systems, providing a natural mapping for Large Language Model (LLM) agent frameworks:

```
+-------------------------------------------------------------------+
|                    BDI Framework in LLM Agents                    |
+-------------------------------------------------------------------+
|  Beliefs (World Model)    ===>  Contextual Memory & Reasoning    |
|  Desires (Goals/Values)   ===>  Goal Setting & Prioritization     |
|  Intentions (Plans)       ===>  Tool Selection & Execution        |
+-------------------------------------------------------------------+
```

- **Beliefs**: Represent the agent's internal model of the world, contextual memory, and state estimation $P(s)$. In LLM agents, beliefs map to prompt context, system instructions, and RAG retrieval memory.
- **Desires**: Define the ideal goals, objectives, or target states. In LLM agents, desires guide objective decomposition, reward criteria, and task prioritization.
- **Intentions**: Represent committed action sequences, plans, and active tool calls. Intentions anchor step-by-step chain-of-thought planning and real-world tool execution.

---

## 3. Formal Mathematical Decision Model under Uncertainty

To formalize decision making under uncertainty, we define the following mathematical components:

- **Action Space**: $a \in A$, representing available actions.
- **Uncertain Current State**: $s \in S$, characterized by the belief distribution $P(s)$.
- **Transition Model**: $P(s' \mid s, a)$, the conditional probability that executing action $a$ in state $s$ transitions to state $s'$.
- **Outcome Variable**: $\text{Result}(a)$, a random variable representing the realization of outcome state $s'$.
- **Expected Outcome Distribution**:
  $$P(\text{Result}(a) = s') = \sum_{s \in S} P(s) P(s' \mid s, a)$$
- **Utility Function**: $U(s) \in \mathbb{R}$, mapping a state $s$ to a real scalar representing its subjective desirability.

### 3.1 Logical Planning vs. Decision-Theoretic Planning

```
Logical Planning (Deterministic)             Decision-Theoretic Planning (Probabilistic)
+--------------------------------+          +------------------------------------------+
| States: Logical Propositions   |          | States: Probabilistic Beliefs P(s)       |
| Actions: Inference Rules       |  ======> | Transitions: Conditional P(s'|s,a)       |
| Goals: Formulas (True / False) |          | Utilities: Continuous U(s) in Real Numbers|
+--------------------------------+          +------------------------------------------+
```

<block>
<strong>Theoretical Relationship:</strong><br/>
Classical logical planning is a <strong>special constrained case</strong> of decision-theoretic planning where state transitions are purely deterministic ($P(s' \mid s, a) = 1$) and utilities are binary ($U(s) = 1$ if goal formula is satisfied, $U(s) = 0$ otherwise). Decision models generalize planning to handle continuous risk and environmental noise.
</block>

---

## 4. Branches and Historical Origins of Decision Theory

Decision theory is categorized into three analytical branches:

1. **Normative Decision Theory**: Establishes how ideal, fully rational agents *should* make choices based on rigorous mathematical principles.
2. **Descriptive Decision Theory**: Empirical branch observing and modeling how real agents (such as humans) *actually* make decisions in practice (e.g., Prospect Theory).
3. **Prescriptive Decision Theory**: Operational framework providing practical tools and guidelines to help real-world agents make more rational decisions.

```
+-------------------------------------------------------------------+
|               Historical Foundations of Decision Science           |
+-----------------------------------++------------------------------+
|      Utility Theory (1738)        ||       Game Theory (1944)     |
+-----------------------------------++------------------------------+
| Pioneer: Daniel Bernoulli         || Pioneers: von Neumann &      |
| Scope: Single-Agent Decisions     ||           Oskar Morgenstern  |
| Focus: Measuring risk and preference| Scope: Multi-Agent Interaction|
|        via subjective utility.    || Focus: Strategic joint-action|
|                                   ||        payoff matrices.      |
+-----------------------------------++------------------------------+
```

---

## 5. The Maximum Expected Utility (MEU) Principle

The **Maximum Expected Utility (MEU) Principle** asserts that a rational agent must choose the action that maximizes its mathematical expected utility.

### 5.1 Fully Observable Environment

When the current state $s$ is known with absolute certainty ($P(s) = 1$):
$$a^* = \arg\max_{a \in A} \mathbb{E}[U(a)] = \arg\max_{a \in A} \sum_{s' \in S} P(s' \mid s, a) U(s')$$

### 5.2 Partially Observable Environment

When the current state $s$ is uncertain and governed by belief distribution $P(s)$:
$$a^* = \arg\max_{a \in A} \mathbb{E}[U(a)] = \arg\max_{a \in A} \sum_{s' \in S} P(\text{Result}(a) = s') U(s')$$
$$\mathbb{E}[U(a)] = \sum_{s' \in S} \sum_{s \in S} P(s) P(s' \mid s, a) U(s')$$

---

## 6. Single-Agent vs. Multi-Agent Case Studies

### 6.1 Single-Agent Case Study: Panda Lulu Lunch Choice (Utility Theory)

Panda Lulu must choose between two foraging actions:
- **Action 1 (Bamboo Grove)**: 50% chance of obtaining 10 bamboo shoots, 50% chance of 0 shoots.
- **Action 2 (Berry Bush)**: 100% chance of obtaining 4 berries.
- **Preferences**: Equal preference between bamboo shoots and berries ($U(x) = x$).

```
Expected Utility Computations:
• E[U(Bamboo Grove)] = 0.5 * U(10) + 0.5 * U(0) = 0.5(10) + 0.5(0) = 5.0
• E[U(Berry Bush)]   = 1.0 * U(4)                 = 1.0(4)       = 4.0
Decision: Lulu chooses Bamboo Grove because 5.0 > 4.0.
```

### 6.2 Multi-Agent Case Study: Pandas Dilemma (Game Theory)

Two pandas, Bobo (B) and Almo (A), compete for limited bamboo locations. Each can choose to **Keep** (Secret) or **Share**.

```
+-------------------------------------------------------------------+
|               Pandas Dilemma Payoff Matrix (B, A)                 |
+-----------------------------------++------------------------------+
|                                   || Almo: Keep   | Almo: Share   |
+-----------------------------------++--------------+---------------+
| Bobo: Keep                        || (+1, +1)     | (+5, 0)       |
| Bobo: Share                       || (0, +5)      | (+3, +3)      |
+-------------------------------------------------------------------+
```

- **Individual Rationality Analysis**:
  - If Almo chooses *Keep*, Bobo gets $+1$ by *Keep* vs. $0$ by *Share* $\rightarrow$ Bobo prefers **Keep**.
  - If Almo chooses *Share*, Bobo gets $+5$ by *Keep* vs. $+3$ by *Share* $\rightarrow$ Bobo prefers **Keep**.
  - **Dominant Strategy & Nash Equilibrium**: *Keep* is a strictly dominant strategy for both players. The unique Nash Equilibrium yields payoffs $(+1, +1)$.
- **Collective Optimality**: Cooperative action $(\text{Share}, \text{Share})$ yields $(+3, +3)$, which is **Pareto superior** to the Nash Equilibrium.
- **Core Insight**: Individual rational self-interest does not necessarily lead to collectively optimal outcomes.

---

## 7. Domain Applications Matrix: Utility Theory vs. Game Theory

| Domain | Single-Agent Utility Theory | Multi-Agent Game Theory |
| :--- | :--- | :--- |
| **Economics** | Consumer choice, individual risk assessment, cost-benefit analysis | Competitive pricing, auction design, market oligopolies |
| **Networks** | Single-node packet routing, local resource allocation | Cooperative routing protocols, network cost-sharing, congestion games |
| **Political Science**| Policy evaluation, voter preference modeling | Voting mechanisms, coalition formation, legislative bargaining |
| **Biology** | Optimal foraging theory, individual habitat selection | Evolutionary Stable Strategies (ESS), predator-prey dynamics |
| **Business** | Product design trade-offs, corporate capital budgeting | Competitive pricing battles, strategic M&A negotiations |
| **Social Impact** | Resource distribution algorithms, social welfare metrics | Trust mechanisms, public goods contribution games |
| **Health Care** | Clinical treatment selection, individual cost-effectiveness | Hospital market competition, global vaccine allocation games |
| **Education** | Personalized adaptive learning paths, curriculum optimization | Institutional ranking competition, multi-stakeholder incentive design |

---

## 8. Axioms of Rational Preferences (von Neumann-Morgenstern)

Preferences over uncertain outcomes are formalized using **Lotteries**. A lottery $L$ over mutually exclusive outcome states $S_1, \dots, S_n$ with probabilities $p_1, \dots, p_n$ ($\sum p_i = 1$) is represented as:
$$L = [p_1, S_1; p_2, S_2; \dots; p_n, S_n]$$

Preference relations are defined as:
- $A \succ B$: Strict preference (Agent strictly prefers $A$ over $B$).
- $A \sim B$: Indifference (Agent is indifferent between $A$ and $B$).
- $A \succeq B$: Weak preference ($A$ is at least as desirable as $B$).

### 8.1 The Six VNM Rationality Axioms

For an agent's choices to be representable by a scalar utility function, its preferences must satisfy the **Six von Neumann-Morgenstern (VNM) Axioms**:

1. **Orderability (Completeness)**: For any lotteries $A$ and $B$, exactly one relation holds:
   $$(A \succ B) \lor (B \succ A) \lor (A \sim B)$$
2. **Transitivity**: If $A \succ B$ and $B \succ C$, then $A \succ C$.

<callout style="warning">
<strong>Exploiting Irrationality — The Money Pump Paradox:</strong><br/>
Suppose an agent possesses non-transitive preferences: $\text{Coke} \succ \text{Sprite} \succ \text{Pepsi} \succ \text{Coke}$.<br/>
1. The agent currently holds a Coke. An arbitrageur offers to trade a Pepsi for the Coke plus $\$0.50$. Since $\text{Pepsi} \succ \text{Coke}$, the agent agrees.<br/>
2. Next, the arbitrageur offers a Sprite for the Pepsi plus $\$0.50$. Since $\text{Sprite} \succ \text{Pepsi}$, the agent agrees.<br/>
3. Finally, the arbitrageur offers the original Coke for the Sprite plus $\$0.50$. Since $\text{Coke} \succ \text{Sprite}$, the agent agrees.<br/>
<i>Result</i>: The agent ends up back with its original Coke, but has lost $\$1.50$ for nothing. Violating transitivity makes an agent vulnerable to continuous financial extraction.
</callout>

3. **Continuity**: If $A \succ B \succ C$, there exists a probability $p \in [0, 1]$ such that:
   $$[p, A; 1 - p, C] \sim B$$
4. **Substitutability (Independence)**: If $A \sim B$, then for any lottery $C$ and probability $p$:
   $$[p, A; 1 - p, C] \sim [p, B; 1 - p, C]$$
   Similarly, if $A \succ B$, then $[p, A; 1 - p, C] \succ [p, B; 1 - p, C]$.
5. **Monotonicity**: If $A \succ B$, then:
   $$p > q \iff [p, A; 1 - p, B] \succ [q, A; 1 - q, B]$$
6. **Decomposability (Reduction of Compound Lotteries)**: Compound lotteries can be reduced by applying probability laws to resolve intermediate stages:
   $$[p, A; 1 - p, [q, B; 1 - q, C]] \sim [p, A; (1 - p)q, B; (1 - p)(1 - q), C]$$

---

## 9. Expected Utility Theorem and Affine Invariance

### 9.1 Expected Utility Theorem (von Neumann & Morgenstern, 1944)

If an agent's preferences satisfy the six VNM axioms, there exists a real-valued utility function $U: S \to \mathbb{R}$ such that:
1. $U(A) > U(B) \iff A \succ B$, and $U(A) = U(B) \iff A \sim B$.
2. The utility of a lottery equals the expected utility of its outcomes:
   $$U([p_1, S_1; \dots; p_n, S_n]) = \sum_{i=1}^n p_i U(S_i)$$

### 9.2 Invariance to Positive Affine Transformations

Utility scales are **invariant to positive affine transformations**:
$$U'(s) = a \cdot U(s) + b, \quad \text{where } a > 0 \text{ and } b \in \mathbb{R}$$
Multiplying by positive scalar $a$ and adding constant $b$ preserves identical ranking orders and risk attitudes. Utility values convey relative ranking and risk posture, not absolute inter-agent comparisons.

### 9.3 Invalidation of Inter-Agent Utility Comparisons

A common misconception in decision theory is attempting to perform direct numerical comparisons between the utility values of different agents. For instance, if Agent 1 assigns $U_1(\text{Win}) = 100$ while Agent 2 assigns $U_2(\text{Win}) = 10$, it is fundamentally incorrect to conclude that Agent 1 desires winning ten times more than Agent 2. 

Because utility scales are invariant under positive affine transformations ($U'(s) = a \cdot U(s) + b$ with $a > 0$), raw utility numbers carry purely subjective value within an individual agent's decision model. They convey internal preference rankings and risk properties (such as risk aversion or risk seeking), but they do not permit absolute, cardinal inter-agent comparisons. Normalizing utility functions or adjusting action space sizes does not change this core property: utility values are internally relative, making direct cross-agent numerical comparisons theoretically invalid.

### 9.4 Non-Linear Transformations and Risk Posture Distortion

Another frequent error in utility engineering occurs when attempting to normalize utility values by applying non-linear monotonic transformations, such as $U'(s) = \log(U(s))$ for $U(s) > 0$. While a monotonic non-linear transformation preserves ordinal rankings over deterministic states (i.e., if state $A$ is preferred to state $B$, then $\log(U(A)) > \log(U(B))$), it introduces a severe theoretical flaw into the Maximum Expected Utility (MEU) decision process over stochastic lotteries.

Because expected utility relies on calculating mathematical expectations across probabilistic outcomes, choices depend critically on the **curvature** ($U''(x)$) of the utility function. A logarithmic transformation is non-affine and strictly concave. Applying $\log(U(s))$ alters the utility curve's second derivative, artificially injecting risk aversion into the agent's preference structure. As a result, expected utility rankings across risky choices are distorted, potentially leading the agent to select sub-optimal or unintended actions under uncertainty.

---

## 10. Real-World Utility Metrics Across Domains

1. **Quality-Adjusted Life Year (QALY)**:
   - *Domain*: Health / Medicine.
   - *Formula*: $U = \text{Years} \times \text{Quality Score}$ ($0 \le \text{Score} \le 1$). 10 years at $0.6$ quality $= 6.0$ QALYs.
2. **Disability-Adjusted Life Year (DALY)**:
   - *Domain*: Global Public Health.
   - *Definition*: Sum of years lost due to premature mortality and disability (lower values represent better health outcomes).
3. **Micromort**:
   - *Domain*: Risk Management / Actuarial Science.
   - *Definition*: A one-in-a-million ($10^{-6}$) probability of death, used to price hazardous activities or safety interventions.
4. **Value of Statistical Life (VSL)**:
   - *Domain*: Public Policy, Environmental & Transportation Regulation (EPA, FDA, DOT).
   - *Definition*: Monetary value assigned to reducing statistical fatalities to guide cost-benefit regulatory analysis ($\sim \text{USD } \$14 \text{ Million}$ in the US; $\sim \text{AUD } \$5.9 \text{ Million}$ in Australia).
5. **Value of Hour Traveled (VHT)**:
   - *Domain*: Transportation Economics.
   - *Formula*: $U = -(\text{Time Cost} \times \text{Value per Hour})$.
6. **Exponential Utility**:
   - *Domain*: Finance / Risk Theory.
   - *Formula*: $U(x) = 1 - e^{-x / R}$ ($R > 0$ represents risk tolerance; exhibits Constant Absolute Risk Aversion, CARA).
7. **Logarithmic Utility**:
   - *Domain*: Economics / Wealth Modeling.
   - *Formula*: $U(x) = \log(x)$. Models diminishing marginal utility of wealth and risk aversion.
8. **Carbon Cost Utility**:
   - *Domain*: Environmental Policy.
   - *Formula*: $U = -(\text{Tons of CO}_2 \times \text{Price per Ton})$.

---

## 11. Utility of Money, EMV, Certainty Equivalent, and Risk Premium

### 11.1 Expected Monetary Value (EMV) vs. Expected Utility

For a monetary lottery $L$ with cash outcomes $x_i$ and probabilities $p_i$, the Expected Monetary Value is:
$$\text{EMV}(L) = \sum_{i} p_i x_i$$

<block>
<strong>Wealth vs. Utility Dilemma:</strong><br/>
Consider an agent with current wealth $k = \$1,000,000$ offered a 50-50 gamble:<br/>
• Heads: Lose all money (Wealth becomes $\$0$).<br/>
• Tails: Gain $\$1,500,000$ (Wealth becomes $\$2,500,000$).<br/><br/>
• <strong>EMV Calculation</strong>: $\text{EMV}(\text{Accept}) = 0.5(\$0) + 0.5(\$2,500,000) = \$1,250,000$. Since $\$1,250,000 > \$1,000,000$, an EMV-maximizing agent accepts.<br/>
• <strong>Expected Utility Calculation (Concave U)</strong>: Assume $U(\$0) = 5$, $U(\$1,000,000) = 8$, $U(\$2,500,000) = 9$.<br/>
$\text{EU}(\text{Accept}) = 0.5(5) + 0.5(9) = 7.0$.<br/>
$\text{EU}(\text{Decline}) = U(\$1,000,000) = 8.0$.<br/>
<i>Decision</i>: A risk-averse rational agent <strong>declines</strong> the bet because $8.0 > 7.0$.
</block>

### 11.2 Certainty Equivalent (CE) and Risk Premium (RP)

```
Risk-Averse Preference Curves:

Utility U(x)
  ^
  |                  /------------ U(x) Concave Curve
  |                 /  . 
  |                /   .
  |               /    .
  |  EU(L) ------+-----+------------ Expected Utility Level
  |             /|     |
  |            / |     |
  +-----------+--+-----+-----------> Cash x
              0  CE    EV
              |<-RP->|
```

- **Certainty Equivalent (CE)**: The guaranteed, risk-free cash payout that yields the exact same expected utility as the risky lottery:
  $$U(\text{CE}) = \mathbb{E}[U(\text{Lottery})] \implies \text{CE} = U^{-1}(\mathbb{E}[U(\text{Lottery})]))$$
- **Risk Premium (RP)**: The difference between the Expected Monetary Value ($\text{EV}$) of the lottery and its Certainty Equivalent ($\text{CE}$):
  $$\text{Risk Premium} = \text{EV} - \text{CE}$$
  The Risk Premium measures the amount of expected return an agent is willing to sacrifice to eliminate exposure to risk.

### 11.3 Characterization of Risk Attitudes

1. **Risk-Averse**:
   - *Condition*: $\text{CE} < \text{EV} \implies \text{Risk Premium} > 0$.
   - *Utility Function*: **Concave** ($U''(x) < 0$, e.g., $\log(x)$, $\sqrt{x}$, $1 - e^{-x/R}$). Diminishing marginal utility of money.
2. **Risk-Neutral**:
   - *Condition*: $\text{CE} = \text{EV} \implies \text{Risk Premium} = 0$.
   - *Utility Function*: **Linear** ($U(x) = a x + b$). Evaluates options purely on expected monetary return.
3. **Risk-Seeking**:
   - *Condition*: $\text{CE} > \text{EV} \implies \text{Risk Premium} < 0$.
   - *Utility Function*: **Convex** ($U''(x) > 0$). Prefers the gamble over a sure payoff equal to the expected value.

### 11.4 Worked Procedure: Calculating Risk Premium

Consider a lottery:
- $50\%$ probability of winning $\$2000$
- $50\%$ probability of losing $\$20$

1. **Compute EMV**:
   $$\text{EMV} = 0.5(\$2000) + 0.5(-\$20) = \$1000 - \$10 = \$990$$
2. **Determine Certainty Equivalent (Given Subjective Preference)**:
   Assume the individual's personal risk-averse utility function yields $\text{CE} = \$300$.
3. **Calculate Risk Premium**:
   $$\text{Risk Premium} = \text{EMV} - \text{CE} = \$990 - \$300 = \$690$$
4. **Interpretation**:
   The agent is willing to forgo $\$690$ in expected monetary return to avoid exposure to the $\$20$ downside loss.

---

## 12. Implementation Challenges and Non-Linearity Caveats in AI

### 12.1 Approximating Intractable Future State Utilities $U(s')$

In high-dimensional, long-horizon decision problems (such as Go, chess, complex robotics, and long-chain multi-step reasoning), evaluating the exact downstream utility term $U(s')$ for future states is computationally intractable. As the decision horizon grows, the tree of possible future state transitions expands exponentially, making exact lookahead planning impossible. 

To resolve this computational bottleneck, state-of-the-art AI systems combine two complementary paradigms: **heuristic value functions learned via reinforcement learning (RL)** and **Monte Carlo Tree Search (MCTS)** lookahead planning. Deep neural networks trained through RL act as value estimators, approximating the expected utility of downstream state histories $U(s')$. Concurrently, MCTS performs selective, truncated lookahead search guided by those learned value functions. By substituting exact terminal utility evaluations with deep heuristic value estimations at truncated search depths, modern AI agents successfully scale Maximum Expected Utility (MEU) decision making to massive, continuous, and long-horizon state spaces.

1. **Non-Linearity and Non-Additivity**:
   Utility is non-linear over physical goods or currency. In general:
   $$U(a + b) \neq U(a) + U(b)$$
2. **Evaluation at Total Terminal States**:
   Utility must be evaluated on total resulting net asset positions, rather than isolated incremental transactions.
3. **Dimensional Separation**:
   Expected Utility ($\text{EU}$) is measured in an internal subjective utility scale. Certainty Equivalent ($\text{CE}$) is measured in an external physical/monetary unit scale.
4. **Real-World AI Engineering Challenges**:
   - *Preference Elicitation*: Learning and updating dynamic human preference functions in changing contexts.
   - *Inference Complexity*: Estimating $P(s' \mid s, a)$ over massive or continuous state spaces.
   - *Responsible & Ethical Alignment*: Operationalizing safety constraints, fairness metrics, and legal governance within the mathematical objective of utility maximization.

---

## 13. Summary

Rational decision making relies on mathematical formalisms to select actions that maximize expected utility under uncertainty. The Belief-Desire-Intention (BDI) architecture models LLM agent reasoning, goal setting, and tool execution. While classical logical planning uses deterministic transitions and binary goals, decision-theoretic planning leverages conditional probabilities and continuous utility functions. 

Von Neumann-Morgenstern (VNM) utility theory establishes six axioms (Orderability, Transitivity, Continuity, Substitutability, Monotonicity, Decomposability) that guarantee the existence of a real-valued utility function invariant to positive affine transformations. Furthermore, utility numbers convey ranking and risk properties strictly within an individual agent's decision model and do not permit absolute inter-agent comparisons. Risk attitudes are characterized by Certainty Equivalent ($\text{CE}$) and Risk Premium ($\text{RP} = \text{EV} - \text{CE}$), distinguishing risk-averse (concave $U$), risk-neutral (linear $U$), and risk-seeking (convex $U$) behavior. Game theory expands decision theory to multi-agent settings, demonstrating that individual self-interested rationality (such as dominant strategy Nash Equilibria) does not necessarily guarantee collectively optimal outcomes.

<reviewkit>
<takeaways>
- **Rational Agent Triad & BDI Model:** Rational agents integrate Beliefs (world model), Preferences (utility function), and Decision Processes (MEU action selection). BDI maps directly to LLM context, goal setting, and tool planning.
- **Logical Planning vs. Decision Models:** Classical logical planning is a special case of decision-theoretic planning where transitions are deterministic and utilities are binary (0/1).
- **VNM Rationality Axioms:** Orderability, Transitivity, Continuity, Substitutability, Monotonicity, and Decomposability. Violating transitivity exposes an agent to the Money Pump Paradox arbitrage.
- **Expected Utility Theorem & Affine Invariance:** Satisfying VNM axioms guarantees a scalar utility function unique up to positive affine transformations $U'(s) = a U(s) + b$ ($a > 0$). Utility numbers carry subjective ranking and risk properties internally and do not permit absolute inter-agent comparisons.
- **Risk Premium & Risk Attitudes:** Risk Premium $\text{RP} = \text{EV} - \text{CE}$. Risk-averse ($\text{CE} < \text{EV}$, concave $U$), risk-neutral ($\text{CE} = \text{EV}$, linear $U$), risk-seeking ($\text{CE} > \text{EV}$, convex $U$).
- **Single-Agent vs. Multi-Agent Game Theory:** Single-agent MEU maximizes expected subjective utility. Multi-agent game theory proves individual self-interested Nash Equilibrium strategy choices can be Pareto inferior to cooperative outcomes.
</takeaways>
<qquiz src="questions.en.json" title="Rational Decision Making Quiz"/>
<qprompt/>
</reviewkit>

## References

1. Von Neumann, J., & Morgenstern, O. (1944). *Theory of Games and Economic Behavior*. Princeton University Press.
2. Bernoulli, D. (1738). Specimen theoriae novae de mensura sortis (Exposition of a new theory on the measurement of risk). *Commentarii Academiae Scientiarum Imperialis Petropolitanae*, 5, 175-192.
3. Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4th ed.). Pearson.
4. Gopalan, A., & Teo, Y. M. (2025). *CS4246/5446 Reinforcement Learning and Sequential Decision Making (Version 3.0)*. National University of Singapore (NUS).
