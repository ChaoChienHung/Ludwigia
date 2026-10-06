# CS5446 Cheatsheet

## Foundations and notation

### One course, several decision problems

| Problem | Information supplied | Objective | Typical method |
|---|---|---|---|
| Classical planning | Symbolic initial state, deterministic actions, goal | Find a valid or low-cost action sequence | Progression, regression, SATPlan |
| Hierarchical planning | Primitive actions and task decomposition methods | Find an executable refinement of a task network | HTN search |
| One-shot uncertain choice | Outcome probabilities and preferences | Maximize expected utility | MEU |
| Known-model sequential choice | MDP transition and reward model | Maximize expected cumulative return | Value/policy iteration |
| Unknown-model prediction | Experience under a fixed policy | Estimate that policy's value | Passive ADP, MC, TD |
| Unknown-model control | Experience and freedom to choose actions | Learn a good policy while exploring | Active ADP, MC control, SARSA, Q-learning |
| Large/continuous state space | Features or neural representation | Generalize values/policies | Function approximation, DQN, policy gradients |
| Large model with simulator | Current state and simulation budget | Choose an action now | Rollout, MCTS |
| Expert demonstrations | Expert state-action pairs | Learn expert-like behavior | BC, DAgger; IRL recovers rewards |

**Three distinctions to state precisely:** prediction estimates a fixed policy; control improves a policy. Model-based methods know or learn transitions/rewards; model-free methods can learn without an explicit transition model. Planning spends computation using a model; learning changes estimates or parameters using experience.

### Symbols and reward timing

| Symbol | Meaning |
|---|---|
| $s,a,s'$ | Current state, chosen action, next state |
| $P(s'\mid s,a)$ or $T(s'\mid s,a)$ | Transition probability |
| $R(s,a,s')$ | Reward for the transition |
| $\gamma$ | Discount factor; normally $0\le\gamma<1$ for continuing discounted problems |
| $\alpha$ | Learning rate; distinct from discounting |
| $\pi(a\mid s)$ | Stochastic policy; deterministic policy written $\pi(s)$ |
| $G_t$ | Return from one realized trajectory |
| $V^\pi(s)$ or $U^\pi(s)$ | Expected return under fixed policy $\pi$ |
| $Q^\pi(s,a)$ | Expected return for first taking $a$, then following $\pi$ |
| $V^*,Q^*,\pi^*$ | Optimal value, action value, and policy |
| $\delta$ | TD error: target minus current estimate |
| $\theta,w,\beta$ | Trainable parameters; different symbols do not imply different principles |
| $\hat V,\hat Q,\hat P$ | Estimates rather than exact quantities |

**Use transition rewards consistently.** The course defaults to reward-on-entry unless specified otherwise: $R(s,a,s')=f(s')$. Reward-of-current-state is another valid convention: $R(s,a,s')=f(s)$. Rewards may also depend on $(s,a)$ alone, independent of the resulting state. Never mix conventions inside a solution.

If the immediate reward received after $a_t$ is denoted $r_t$, then

$$G_t=r_t+\gamma r_{t+1}+\gamma^2r_{t+2}+\cdots.$$

With Sutton–Barto indexing, exactly the same reward is called $R_{t+1}$, giving $G_t=R_{t+1}+\gamma R_{t+2}+\cdots$. Use the indexing convention specified in the problem.

**Episodic terminal state:** assign $V(T)=0$ after termination and pay terminal reward on the transition into $T$. Do not pay it once on entry and again by using a nonzero terminal value. A genuine terminal transition has no bootstrap term; a time-limit truncation is not automatically a terminal state.

### Pick the right target

All incremental value updates have the form **estimate ← estimate + learning rate × (target − estimate)**.

| Method | Target for the current sample |
|---|---|
| MC | Completed return $G_t$ |
| TD(0) prediction | $r+\gamma V(s')$ |
| SARSA | $r+\gamma Q(s',a')$, using the actually selected next action |
| Q-learning | $r+\gamma\max_bQ(s',b)$ |
| DQN | $r+\gamma\max_bQ_{\theta^-}(s',b)$, with a target network |
| Policy evaluation | $\sum_{s'}P(s'\mid s,\pi(s))[R+\gamma V(s')]$ |
| Value iteration | Maximum over actions of the expected Bellman backup |
| REINFORCE actor weight | $G_t$, or $G_t-b(s_t)$ with an action-independent baseline |
| TD Actor-Critic actor weight | $r+\gamma V_w(s')-V_w(s)$ |

## Week 1 — Classical planning

### 1.1 Problem representation and assumptions

A planning problem specifies an initial state, legal actions with effects, a goal test, and optionally action costs. A plan is an action sequence whose execution reaches a goal-satisfying state.

Classical planning normally assumes **fully observable, deterministic, static, discrete, single-agent** dynamics and a known model. A partially observable problem may require a belief state; stochastic effects require contingent behavior; continuous actions and changing environments need richer models.

A rational agent senses, models/reasons, decides, acts, and may communicate. The chosen action is justified by the information and objective available at decision time; a bad realized outcome alone does not establish irrationality.

### 1.2 STRIPS and PDDL

- **State:** set of true ground atoms, e.g. $\{At(x,l),Object(x),Location(l)\}$. Under the closed-world assumption, an absent atom is false.
- **Ground atom/action:** all variables replaced by objects. An action schema represents a family of ground actions.
- **Goal:** conjunction of literals, usually a partial state description. Extra facts are allowed unless excluded by negative goals.
- **Action:** preconditions, add effects, delete effects; costs if specified.
- **Static predicates:** facts such as `Plane`, `Airport`, or adjacency that no action changes.

For positive STRIPS preconditions:

$$Pre(a)\subseteq s\quad\Rightarrow\quad a\text{ applicable},$$

$$Result(s,a)=(s\setminus Del(a))\cup Add(a).$$

For negative preconditions, also check that each forbidden atom is absent. For goals $G^+,G^-$, check $G^+\subseteq s$ and $G^-\cap s=\varnothing$.

**Frame problem:** specifying changes without re-listing every unchanged fact. STRIPS/PDDL uses inertia: facts outside the effects persist. Preserve type facts and unrelated locations when applying an action.

**PDDL separates reusable domain knowledge from a particular problem instance.**

| Component | Role |
|---|---|
| Domain `:requirements` | Declare language features actually used, such as typing or negative preconditions |
| Domain `:types` / `:predicates` | Specify object categories and the symbolic vocabulary |
| Action `:parameters` | Variables and their allowed types |
| Action `:precondition` | Conditions that must hold before execution |
| Action `:effect` | Facts added/deleted by execution; `(not ...)` expresses a delete effect |
| Problem `:objects` | Concrete objects that ground the schemas |
| Problem `:init` | Facts true initially under closed-world semantics |
| Problem `:goal` | Desired conditions, not a complete description of every final fact |

A problem file supplies `:domain`, `:objects`, `:init`, and `:goal`. Add requirements such as negative preconditions only when the model uses them.

**Grounding procedure:** enumerate type-correct substitutions, constrain variables with current facts, then check every precondition. Do not add an unstated constraint such as `from != to`.

#### Modeling invariants and validating transitions

An invariant is a property that must hold in every reachable state: one location per object, mutually exclusive status predicates, conserved resources, or occupancy within capacity. Establish it in the initial state and check that every applicable action preserves it. An intended rule written only in prose has no effect on planner behavior; encode it in preconditions, effects, or supported constraints.

- A change of location should remove the old location as well as add the new one.
- Acquisition/release of a resource must update both ownership and availability consistently.
- Safety conditions belong in action applicability, not merely in the final goal.
- Goals must specify actual desired completion, rather than incidental intermediate conditions.

Validate a plan by replaying each action: check applicability, apply effects, check invariants, and test the final goal. This distinguishes a plausible action list from an executable plan. A valid plan is not necessarily optimal for the chosen objective.

### 1.3 Progression and regression

| Dimension | Progression (forward) | Regression (backward) |
|---|---|---|
| Start | Initial concrete state $s_0$ | Goal description $G$ |
| Node | Complete state under closed-world semantics | Conditions describing many possible states |
| Actions considered | Applicable actions | Relevant actions that can achieve a goal literal without destroying another |
| Update | Apply delete/add effects | Remove achieved requirements, add action preconditions |
| Stop | Current state satisfies goal | Initial state satisfies the regressed conditions |
| Benefit | Easy execution semantics | Focus on actions related to the goal |
| Risk | Many applicable irrelevant actions | Complex goal interactions and variable bindings |

For a positive goal set and a relevant, non-threatening STRIPS action:

$$Regress(G,a)=(G\setminus Add(a))\cup Pre(a),$$

with $Add(a)\cap G\ne\varnothing$ and $Del(a)\cap G=\varnothing$. With negative literals, handle both desired truth values and reject inconsistent regressions.

**Trap:** stopping regression requires $s_0\models G_{regressed}$, not that a partial goal description contains every fact in the initial state.

### 1.4 Search, heuristics, and complexity

- BFS is complete for finite branching and finds a minimum-length plan with equal action costs; UCS handles nonnegative varying costs.
- DFS may get trapped on an infinite/cyclic branch; use cycle checking or depth bounds.
- A* uses $f(n)=g(n)+h(n)$. An admissible $h$ never overestimates remaining optimal cost. For graph search without reopening, consistency is the usual sufficient condition: $h(s)\le c(s,a)+h(s')$.
- **Soundness:** every reported plan is valid. **Completeness:** a solution is found if one exists. **Optimality:** the chosen plan minimizes the stated cost.
- With $n$ Boolean fluents, there may be $2^n$ states. A schema with $k$ variables over $m$ objects can generate $O(m^k)$ substitutions before type/precondition pruning.
- General finite propositional STRIPS plan existence is PSPACE-complete. Polynomially bounded plan existence is generally NP-complete; do not equate a SAT encoding at a fixed horizon with unbounded planning complexity.

### 1.5 SATPlan

**Idea:** ask whether a valid action sequence exists within a candidate horizon by encoding it as propositional satisfiability.

1. Create fluent variables $F_t$ for states $t=0,\ldots,H$ and action variables $A_t$ for transitions $t=0,\ldots,H-1$.
2. Assert all initial truths and falsities; assert the goal at $H$.
3. Encode action preconditions and effects at adjacent times.
4. Add frame/successor-state constraints to prevent unexplained changes.
5. Add action exclusivity or interference constraints according to the serial/parallel encoding.
6. Solve. If UNSAT, increase $H$. If SAT, extract and independently replay the selected actions.

Typical implications: $A_t\Rightarrow Pre_t$, $A_t\Rightarrow Add_{t+1}$, $A_t\Rightarrow\neg Del_{t+1}$.

A successor-state axiom can express persistence and causes of change:

$$F_{t+1}\leftrightarrow\left[\bigvee_{a:F\in Add(a)}a_t\right]\lor\left[F_t\land\neg\bigvee_{a:F\in Del(a)}a_t\right].$$

Increasing a serial horizon finds minimum plan length under that encoding, not automatically minimum weighted cost. Concurrent actions require correct mutex constraints.

#### Encoding checks: clauses, frames, and horizon

An implication $A_t\Rightarrow F_t$ becomes the CNF clause $\neg A_t\lor F_t$. A negative effect becomes $\neg A_t\lor\neg F_{t+1}$. Serial at-most-one constraints add $\neg A_t\lor\neg B_t$ for distinct actions. At-most-one allows idle steps; exactly-one requires an action or explicit no-op at each step. State which convention is used when interpreting “within H steps.”

Without frame constraints, a SAT solver may change a fluent without any action causing the change. Satisfying such an incomplete encoding does not establish a valid plan. Preconditions/effects constrain selected actions; frame axioms also constrain what happens when those actions are not selected. Replay an extracted plan in the original transition model to validate the encoding.

### 1.6 LFM-assisted and responsible planning

The lecture's four LFM roles are **model creation/refinement**, **task/subgoal decomposition**, **heuristic generation**, and **generalized reusable planning strategies**. Symbolic solvers/validators can check preconditions, effects, and plan execution; an LFM's plausible text is not proof that a plan works. A generated heuristic does not become admissible merely because a model generated it.

Responsible planning connects the objective and constraints to human impact: fairness, accountability, transparency, robustness, resilience, privacy, security, meaningful human oversight, and social/ethical/governance requirements. Domain, user, economic, and system limitations affect deployment. Give a concrete example: a faster allocation policy may discriminate; an efficient robot policy may expose unsafe actions; a reward maximizing clicks may diverge from user welfare.

The introductory lecture lists twelve recurring responsibilities: **safety, privacy, fairness, trust, accountability, transparency, responsibility, diversity/inclusion, equality, collaboration, human rights/values, and limiting harmful uses**. Incorporate them through requirements, design, implementation, testing, deployment, and evolution. A useful answer names the stakeholder, the risk, the mitigation, and the trade-off with accuracy/cost; an ethical constraint need not be traded away simply because its utility is hard to quantify.

## Week 2 — Real-world planning

### 2.1 Relaxation and admissibility

A relaxation makes the problem easier by removing constraints while retaining every original solution. With unchanged nonnegative action costs:

$$h_{relaxed}^*(s)\le h_{original}^*(s).$$

Removing preconditions permits more actions. Removing delete effects lets achieved positive facts persist. **Delete relaxation is valid for positive goals and preconditions**, but needs care when negative requirements exist.

Counterexample: initial $A$, action DeleteA deletes $A$, goal $\neg A$. Removing the delete effect makes the goal impossible. Likewise, deleting $A$ may be needed to enable an action with precondition $\neg A$. The relaxed model can then exclude an original solution, so the usual lower-bound proof fails.

| Heuristic | Idea | Admissible? |
|---|---|---|
| Misplaced tiles | Each misplaced tile needs at least one move in the appropriate puzzle relaxation | Yes under standard unit-cost assumptions |
| Manhattan distance | Sum tile grid distances, ignoring obstructions in the standard puzzle | Yes in the standard sliding puzzle |
| $h_{max}$ | Maximum individual goal-achievement estimate | Yes when component estimates are lower bounds |
| $h_{add}$ | Sum estimates and ignore sharing | Not generally; one action may achieve multiple goals |
| $h^+$ | Optimal delete-relaxed plan cost | A lower bound in positive STRIPS; exact computation can be hard |
| $h_{FF}$ | Length/cost of a greedily extracted relaxed plan | Not generally; extracted plan need not be optimal even in the relaxation |
| Abstract-state distance | Solve a smaller state abstraction | A lower bound if transitions/costs are relaxed correctly |

**Positive goal interaction:** one action helps multiple goals; summing can double-count and overestimate. **Negative interaction:** solving one goal destroys another; independent estimates may underestimate. Sum is valid when subproblems are independent or a sound cost-partitioning scheme prevents double-counting. Taking the maximum of admissible heuristics remains admissible.

For relaxed fact costs, conceptually use minimum over achieving actions, with either max or sum over their preconditions. Add action cost once. Do not confuse these recursive estimates with a globally optimal relaxed plan.

#### Computing relaxed fact costs

For a positive STRIPS state s, initialize $c(p)=0$ for facts already true and infinity for other facts. Repeatedly lower costs using all achievers of p:

$$c_{max}(p)=\min_{a:p\in Add(a)}\left[c(a)+\max_{q\in Pre(a)}c_{max}(q)\right],$$

$$c_{add}(p)=\min_{a:p\in Add(a)}\left[c(a)+\sum_{q\in Pre(a)}c_{add}(q)\right].$$

Initial facts retain cost zero. For an action with no preconditions, the empty maximum/sum is zero. Iterate to a fixed point because achievers can depend on other facts; facts that cannot be established retain infinity. Aggregate goal costs by max for $h_{max}$ and sum for $h_{add}$.

**Sharing counterexample:** one unit-cost action has no preconditions and adds both p and q. Goal $p\land q$ has $h^*=h^+=1$, $h_{max}=1$, but $h_{add}=2$. The additive estimate counts the same action twice. A relaxed plan extracting that shared action once has length 1. In general $h_{FF}\ge h^+$, but its greedy extraction can exceed the original optimum, so relaxed-plan extraction alone gives no admissibility guarantee.

**Proof pattern for delete relaxation:** replay an original plan in the relaxed model. Inductively its relaxed state contains every fact in the original state. Positive preconditions remain satisfied, and positive goals still hold at the end. The unchanged-cost original plan is feasible in the relaxed model, so the relaxed optimum cannot be more expensive. The proof breaks for negative requirements because a larger fact set can violate them.

#### From action preconditions to an 8-puzzle heuristic

The lecture's tile-move schema requires $On(t,s_1)$, $Tile(t)$, $Blank(s_2)$, and $Adjacent(s_1,s_2)$. Its effects move t to $s_2$, make $s_1$ blank, and remove the old tile location and destination-blank facts.

| Constraints ignored | New freedom | Lower-bound heuristic |
|---|---|---|
| Blank destination and adjacency | Move a tile directly to its target square | Number of misplaced numbered tiles |
| Blank destination, retaining adjacency | Move a tile along grid edges without waiting for the blank | Sum of numbered tiles' Manhattan distances |

Exclude the blank from the sums. Each real move relocates one numbered tile by one grid edge. Therefore every misplaced tile needs at least one move, and each tile needs at least its grid distance in moves. Manhattan distance dominates misplaced tiles: $h_{Manhattan}\ge h_{misplaced}$, while both remain lower bounds in the standard unit-cost puzzle. A stronger admissible heuristic gives more information, but computing it also has a cost. These claims concern the stated puzzle model, not arbitrary action costs or movement rules.

### 2.2 State abstraction and subgoal serialization

State abstraction maps concrete states into a smaller space, e.g. grouping airports or ignoring some facts. Refinement must restore details. Abstraction can create spurious abstract paths; validate that a concrete implementation exists.

Subgoal decomposition solves $G_1,\ldots,G_k$. **Serializable subgoals** admit an order in which later work preserves earlier achieved goals. Independent goals can be solved separately. Interacting goals may require interleaving actions rather than concatenating completed subplans; Blocks World supplies standard counterexamples.

**Goal interaction:** committing to a complete solution for one subgoal can block actions needed for another. A coordinated plan may need preparatory actions or interleaving before either subgoal is finalized. The Sussman anomaly in Blocks World illustrates why independently solving and concatenating subplans can fail even when a valid joint plan exists.

**State-space reduction:** if n independently located objects each have m possible locations, their joint locations already give $m^n$ combinations. Grouping or dropping distinctions can reduce this exponentially large representation. The abstract problem may admit paths that have no concrete refinement: smaller state space alone does not establish soundness or heuristic admissibility.

### 2.3 HTNs and high-level actions

- A **primitive action** changes the world and has executable preconditions/effects.
- A **compound task/HLA** has alternative decomposition methods into smaller tasks.
- A **method** specifies applicability conditions and an ordered or partially ordered task network.
- Refine an applicable compound task until all remaining tasks are primitive; simulate their execution and check constraints/goals.

An HLA may have several implementations. The planner chooses one deliberately. This is different from stochastic action outcomes, which the environment chooses according to probabilities.

**Algorithm:** start with the initial task network, choose a compound task, choose an applicable method, replace it with subtasks, and repeat. Backtrack when a method or primitive execution fails. A method library imposes procedural knowledge and can restrict which plans are expressible; a physically valid plan need not be derivable from that library.

**Scalability intuition:** flat branching $b$ over $d$ primitive steps gives roughly $O(b^d)$. If each HLA has $r$ refinements into $k$ subtasks across a balanced hierarchy with $d$ leaves, the number of internal refinement choices is about $(d-1)/(k-1)$, giving $r^{(d-1)/(k-1)}$. This is an illustrative structured-search comparison, not a universal complexity guarantee.

#### Tracing HTN execution and refinement choices

For a totally ordered task list, keep **both** the current world state and remaining tasks:

```text
solve(state, tasks):
    if tasks is empty: return empty plan
    first, rest = tasks[0], tasks[1:]
    if first is primitive:
        reject if its preconditions do not hold
        solve(result(state, first), rest); prepend first on success
    otherwise:
        for each applicable method for first:
            solve(state, method.subtasks + rest)
            return the first successful refinement
    return failure
```

Method selection itself does not apply primitive effects. Earlier primitive execution can change whether later methods/actions are applicable. Backtracking must restore the state and task list for the alternative branch. This is a search procedure; choosing the first successful refinement guarantees neither shortest length nor highest utility. A summary containing a **possible** effect does not certify that an arbitrary chosen implementation realizes it.

### 2.4 Reachable sets and safe deductions

For fixed start $s$ and HLA $h$, $REACH(s,h)$ contains endpoints of executable primitive implementations. For a sequence:

$$REACH(s,[h_1,h_2])=\bigcup_{s'\in REACH(s,h_1)}REACH(s',h_2).$$

Approximate with pessimistic lower bound $R^-$ and optimistic upper bound $R^+$:

$$R^-\subseteq R\subseteq R^+.$$

| Relationship to goal set $G$ | Safe conclusion |
|---|---|
| $R^+\cap G=\varnothing$ | No successful refinement; prune |
| $R^-\cap G\ne\varnothing$ | At least one successful refinement exists |
| $R^+\cap G\ne\varnothing$ | Success may be possible; not proved |
| $R^-\cap G=\varnothing$ | Lower bound gives no success certificate; failure not proved |
| $G\subseteq R^+$ | Still does not prove a goal is actually reachable |

Existence of a successful refinement is not a claim that every refinement succeeds. A valid downward-refinement property depends on correct HLA descriptions and executable implementations.

| Possible effect | Meaning across available implementations |
|---|---|
| $\sim^+A$ | Can add A or leave it unchanged |
| $\sim^-A$ | Can delete A or leave it unchanged |
| $\sim^{\pm}A$ | Can make A true or false |
| Definite A / $\neg A$ | Every applicable implementation produces that truth value |

Uncertainty in a summary describes **choice among refinements**, not necessarily random dynamics.

## Week 3 — Rational decision making

### 3.1 Beliefs, preferences, and MEU

Beliefs describe outcome probabilities. Preferences describe which outcomes matter. Intentions are commitments to chosen plans (BDI: Belief–Desire–Intention).

- **Normative:** how an ideal rational agent should choose.
- **Descriptive:** how people actually choose, including biases.
- **Prescriptive:** how to improve real decisions.
- **Substantive rationality:** achieving desirable ends; **procedural rationality:** a coherent decision process; **meta-level rationality:** deciding how much computation to spend on deciding.

For known state $s$:

$$EU(a\mid s)=\sum_{s'}P(s'\mid s,a)U(s'),\qquad a^*=\arg\max_a EU(a).$$

For uncertain current state with belief $b(s)$:

$$EU(a)=\sum_s b(s)\sum_{s'}P(s'\mid s,a)U(s').$$

Utility is an internal representation of preference; an external performance measure evaluates actual behavior/histories. Rationality does not mean omniscience or guaranteed success.

### 3.2 Six preference axioms

| Axiom | Statement / meaning |
|---|---|
| Completeness (orderability) | Any pair is comparable: $A\succ B$, $B\succ A$, or $A\sim B$ |
| Transitivity | $A\succ B$ and $B\succ C$ imply $A\succ C$; avoid preference cycles |
| Continuity | If $A\succ B\succ C$, some $p$ makes $B\sim[p,A;1-p,C]$ |
| Independence (substitutability) | Replace equally preferred outcomes in a common lottery without changing preference; a strict preference is preserved under mixing with the same alternative for $p>0$ |
| Monotonicity | Between lotteries over the same better/worse pair, prefer a higher probability of the better outcome |
| Decomposability | Compound lotteries reduce to final outcome probabilities; multiply branch probabilities and sum duplicate outcomes |

The expected-utility representation gives

$$U([p_1,x_1;\ldots;p_n,x_n])=\sum_i p_iU(x_i).$$

A positive affine transformation $U'(x)=kU(x)+b$, $k>0$, preserves lottery preferences because $EU'=kEU+b$. An arbitrary increasing nonlinear transformation preserves rankings of certain outcomes but **can change lottery preferences**. Utility scales are not inherently comparable across people.

**Nested lottery example:** $[0.6,A;0.4,[0.7,B;0.3,C]]$ reduces to $[0.6,A;0.28,B;0.12,C]$.

### 3.3 Money, risk, and certainty equivalents

Compute utility of **final wealth**, not the gain alone: for initial wealth $W$ and payoff $X$, $EU=\mathbb E[U(W+X)]$.

| Attitude for increasing utility | Shape | Relation |
|---|---|---|
| Risk-averse | Concave, $U''<0$ | $U(E[X])\ge E[U(X)]$, CE ≤ expected wealth |
| Risk-neutral | Linear | CE = expected wealth |
| Risk-seeking | Convex, $U''>0$ | CE ≥ expected wealth |

$$CE=U^{-1}(EU),\qquad RiskPremium=E[W+X]-CE.$$

If expressing CE as a gain, subtract $W$ from wealth CE and compare with $E[X]$. Use one convention throughout. Examples: log utility has $CE=e^{EU}$; $U(x)=\sqrt{x}$ has $CE=EU^2$; $U(x)=\log(1+x)$ has $CE=e^{EU}-1$.

**Insurance:** compare $EU_{uninsured}$ with utility of the correctly calculated insured final wealth. Maximum premium for full indemnity $L$ on a loss from wealth $W$ satisfies $U(W-p_{max})=EU_{uninsured}$, hence $p_{max}=W-CE_{uninsured}$. Partial coverage produces a lottery and needs its own expected utility. The insurer's expected profit uses expected money when the question asks monetary value; its preferences need not match the customer's.

**Probability equivalent:** normalize the worst/best outcomes to utilities 0/1. If $x\sim[p,x_{best};1-p,x_{worst}]$, then $U(x)=p$ on that scale.

#### Expected utility and risk: calculation procedure

1. List final outcomes and probabilities; account for initial wealth, gains/losses, fees, and coverage before applying utility.
2. Compute $EU=\sum_i p_iU(x_i)$ and check that every outcome lies in the utility function's domain.
3. Compute the certainty equivalent $CE=U^{-1}(EU)$ when U is invertible on the relevant range.
4. Compute expected outcome in the same units, then $RiskPremium=E[X]-CE$.
5. Compare alternatives by EU or CE consistently; a larger expected monetary value need not imply greater expected utility.

A stated CE expresses preferences; probabilities alone cannot determine it. Observing risk aversion for one lottery does not prove global concavity for every possible outcome range. Positive affine transformations preserve EU rankings, whereas changing to an arbitrary nonlinear utility can change risk preferences.

### 3.4 Allais paradox and independence

The paradox concerns a **preference reversal under a common lottery mixture**. Let A be a risky lottery and B a sure outcome. Mix each with the same outcome C at the same probability $0<q<1$:

$$A'=[q,A;1-q,C],\qquad B'=[q,B;1-q,C].$$

Independence requires $B\succ A\Rightarrow B'\succ A'$. Expected utility proves this directly:

$$EU(B')-EU(A')=q[EU(B)-EU(A)].$$

The common component cancels, and positive q preserves the sign. Preferring B to A but A' to B' therefore violates independence under the expected-utility axioms. Decomposability reduces the compound lotteries before comparison. A certainty effect can explain the observed reversal descriptively, but does not reconcile it with these normative axioms. The argument concerns preference consistency, not an arithmetic contradiction in probability.

### 3.5 Game theory

A game gives players, available strategies, and payoff functions depending on everyone's choices. A **best response** maximizes a player's payoff given other strategies. A **Nash equilibrium** is a profile where no player benefits from changing only their own strategy. A **dominant strategy** is best regardless of others' actions. Pareto improvement benefits at least one player without hurting another; equilibrium need not be Pareto-efficient.

A two-player dilemma illustrates the distinction between individual incentives and collective welfare (row player first):

| | Other keeps | Other shares |
|---|---|---|
| Keep | (1,1) | (5,0) |
| Share | (0,5) | (3,3) |

Keep strictly dominates Share: $1>0$ against Keep and $5>3$ against Share. Both Keep is a Nash equilibrium, but both Share is better for both. Explain the incentive conflict rather than calling the equilibrium collectively optimal.

For a mixed-strategy equilibrium, if asked, choose probabilities that make the other player's supported actions have equal expected payoff. For example, in a two-action game solve $EU(A_1\mid q)=EU(A_2\mid q)$, then verify legal probabilities and best responses. A zero-sum game has opposing payoffs; a cooperative gain is not generally available.

### 3.6 Decision networks, information, and utility objectives

A decision network combines chance nodes, decision nodes, and utility nodes. For each decision, condition on available evidence, infer outcome probabilities, compute EU, and maximize. An information arc means the observation is available when deciding, not a causal effect by itself.

Lecture utility applications: QALY = years × quality; lower DALY is better; a micromort is $10^{-6}$ death risk; value of statistical life values small population risk reductions rather than literally pricing a particular person's life. These are modeling choices requiring stated units and ethical context.

#### Choosing the optimization objective

Validity asks whether the constraints and goals are satisfied. Quality asks which valid solution is preferred. Minimum action count, minimum cost, minimum completion time, and maximum total utility are different objectives and can rank the same plans differently. Deadlines, penalties, and shared resource constraints can make a locally attractive ordering globally poor.

A branch-and-bound search maximizing utility may prune only when a valid **upper bound** on attainable utility cannot beat the incumbent. For cost minimization, use a valid **lower bound** on attainable cost. Reversing the bound direction can discard the optimum. State representations and memoization keys must preserve every quantity affecting future feasibility and objective value.

## Week 4 — Markov decision processes and reinforcement learning

### 4.1 Specify the model completely

An MDP is $(S,A,P,R,\gamma)$, with legal actions $A(s)$, plus an initial distribution and horizon/termination when required.

$$P(S_{t+1}\mid S_0,A_0,\ldots,S_t,A_t)=P(S_{t+1}\mid S_t,A_t).$$

The state must contain enough information to predict the next state and reward: position alone may omit battery, inventory, door state, pending action, or remaining time. Choose the smallest sufficient representation. A history-dependent problem can often be made Markov by augmenting the state.

**Modeling checklist:** state meaning → legal actions → every possible successor and probability → reward timing → initial/terminal state → objective/horizon. For every $(s,a)$, probabilities sum to 1. Aggregate probabilities when several outcomes lead to the same successor, such as bumping into a wall.

### 4.2 Policy, return, and horizons

A policy maps observations/states to actions; unlike a fixed plan, it can react to stochastic outcomes. A deterministic stationary policy is $\pi:S\to A$; a stochastic one is $\pi(a\mid s)$. For $n$ states and $m$ legal actions at each, there are $m^n$ deterministic stationary policies.

$$V^\pi(s)=E_\pi[G_t\mid s_t=s],\qquad Q^\pi(s,a)=E_\pi[G_t\mid s_t=s,a_t=a].$$

**Finite horizon:** optimal action can depend on remaining time. With $h$ steps remaining:

$$V_0(s)=0,\quad V_h(s)=\max_a\sum_{s'}P(s'\mid s,a)[R(s,a,s')+\gamma V_{h-1}(s')].$$

An explicit terminal utility replaces the zero boundary if specified. Finite-horizon policies are generally nonstationary; adding remaining time to the state gives a stationary rule over augmented states.

**Infinite discounted horizon:** bounded rewards and $\gamma<1$ imply

$$|G_t|\le\frac{R_{max}}{1-\gamma}.$$

Smaller $\gamma$ emphasizes near-term rewards; larger $\gamma$ values delayed consequences and can slow convergence. Effective reward horizon is roughly $1/(1-\gamma)$. $\gamma=0$ selects by immediate expected reward. $\gamma=1$ can give divergent sums in a continuing task. Episodic undiscounted values may be finite with suitable termination and finite expected cumulative reward; eventual termination alone does not establish a finite expected duration. A **proper policy** reaches termination with probability 1; assumptions about expected cost/time still matter. Average reward is an alternative objective, not the same discounted calculation.

### 4.3 Bellman equations

For a deterministic fixed policy:

$$V^\pi(s)=\sum_{s'}P(s'\mid s,\pi(s))[R(s,\pi(s),s')+\gamma V^\pi(s')].$$

For a stochastic policy, additionally sum over $a$ with weight $\pi(a\mid s)$. **Evaluation contains no maximum.**

Optimality:

$$V^*(s)=\max_a\sum_{s'}P(s'\mid s,a)[R(s,a,s')+\gamma V^*(s')],$$

$$Q^*(s,a)=\sum_{s'}P(s'\mid s,a)[R(s,a,s')+\gamma\max_bQ^*(s',b)],$$

$$V^*(s)=\max_aQ^*(s,a),\quad\pi^*(s)\in\arg\max_aQ^*(s,a).$$

**Order matters:** maximize over the action chosen before the random next state; take an expectation over uncontrollable outcomes. $\max_a E_{s'}$ is not generally $E_{s'}\max_a$.

### 4.4 Value iteration (VI)

Initialize $V_0$, then repeatedly use the entire previous vector:

$$Q_{k+1}(s,a)=\sum_{s'}P(s'\mid s,a)[R(s,a,s')+\gamma V_k(s')],\quad V_{k+1}(s)=\max_aQ_{k+1}(s,a).$$

Extract a greedy policy using the final value estimate. Synchronous sweeps read old values for every state; in-place asynchronous updates can differ numerically during a sweep. Follow the question's convention.

The Bellman optimality operator is a $\gamma$-contraction in max norm for a finite bounded discounted MDP:

$$\|BV-BW\|_\infty\le\gamma\|V-W\|_\infty.$$

Thus it has a unique fixed point and $\|V_k-V^*\|_\infty\le\gamma^k\|V_0-V^*\|_\infty$. Near convergence, a greedy policy may stabilize before values do. Approximate convergence does not automatically prove an exactly optimal policy when action gaps are tiny.

For an estimate $V$ with Bellman residual $\rho=\|BV-V\|_\infty$:

$$\|V-V^*\|_\infty\le\rho/(1-\gamma).$$

For synchronous successive iterates, $\Delta_k=\|V_k-V_{k-1}\|_\infty$ bounds $\|V_k-V^*\|_\infty\le\gamma\Delta_k/(1-\gamma)$. To target value error $\epsilon$, use $\Delta_k\le\epsilon(1-\gamma)/\gamma$ for $\gamma>0$. A value-error bound and a policy-loss bound are different claims.

Dense sweep cost is $O(|S|^2|A|)$, or less with sparse transitions; higher discount/precision may need more sweeps.

**Appendix-level iteration bound:** if initial error is bounded by $E_0$, then $\gamma^NE_0\le\epsilon$ after

$$N\ge\left\lceil\frac{\ln(E_0/\epsilon)}{\ln(1/\gamma)}\right\rceil,$$

for $0<\gamma<1$ and $E_0>\epsilon$. Initial $V_0=0$ gives $E_0\le R_{max}/(1-\gamma)$; arbitrary initialization within the same reward bounds gives $E_0\le2R_{max}/(1-\gamma)$. For a greedy policy $\pi_V$ and $\|V-V^*\|_\infty\le\epsilon$, a general discounted bound is

$$\|V^{\pi_V}-V^*\|_\infty\le\frac{2\gamma\epsilon}{1-\gamma}.$$

The one-step action-choice error can be bounded by $2\gamma\epsilon$, but cumulative policy loss can compound over future steps. Do not identify the two without additional assumptions.

### 4.5 Policy iteration (PI)

1. Start with a policy $\pi$.
2. **Evaluate:** solve $V^\pi=r_\pi+\gamma P_\pi V^\pi$, so $(I-\gamma P_\pi)V^\pi=r_\pi$, where $r_\pi(s)=\sum_{s'}P(s'\mid s,\pi(s))R(s,\pi(s),s')$.
3. **Improve:** choose $\pi_{new}(s)\in\arg\max_a\sum_{s'}P(s'\mid s,a)[R+\gamma V^\pi(s')]$.
4. Repeat until no improvement. Preserve an existing action on exact ties to avoid arbitrary cycling.

Policy improvement gives $V^{\pi_{new}}\ge V^\pi$ under exact evaluation and the discounted assumptions. Exact dense evaluation is roughly $O(|S|^3)$; improvement is $O(|S|^2|A|)$. Modified PI uses partial evaluation sweeps.

| | VI | PI |
|---|---|---|
| Object initialized | Value vector | Policy |
| Main operation | One-step optimality backup | Policy evaluation then improvement |
| Evaluation max? | Max in each optimality backup | No max while evaluating the fixed policy |
| Stopping | Value changes/residual small | Policy stable |
| Practical trade-off | Cheap sweeps, often many | Fewer outer iterations, heavier evaluation |

### 4.6 Grid-world and delayed-action templates

For a standard stochastic move, enumerate intended direction and slips; wall/obstacle outcomes stay put unless stated otherwise. A negative living reward favors reaching termination sooner, but risk and terminal payoff may change the optimal path. A positive living reward can encourage avoiding termination.

If an action takes one or two clock steps and no new movement can be selected while it is pending, use states $(x,ready)$ and $(x,pending,a)$, not position alone. The pending action must be remembered. Give pending states only WAIT; charge every elapsed step. A decision-epoch model could instead be semi-Markov, requiring duration-aware rewards/discounting; an ordinary clock-step MDP instead requires the augmented state.

### 4.7 Prediction/control and model information

| | Passive RL | Active RL |
|---|---|---|
| Policy | Fixed | Changes during learning |
| Goal | Estimate $V^\pi$ or $Q^\pi$ | Learn a high-return policy |
| Main issue | Learning accurate predictions | Prediction plus exploration/exploitation |
| Examples | Passive ADP, MC, TD | Active ADP, MC control, SARSA, Q-learning |

Model-based ADP learns transitions/rewards and performs planning. Model-free MC/TD learns values from samples without an explicit transition model. Generalized policy iteration interleaves evaluation and improvement; exact convergence claims require suitable assumptions and data coverage.

### 4.8 Adaptive dynamic programming (ADP)

Count outcomes to estimate

$$\hat P(s'\mid s,a)=\frac{N(s,a,s')}{\sum_xN(s,a,x)}.$$

Estimate rewards by the appropriate sample averages. Do not fabricate zero-probability certainty for an unobserved action; the denominator is zero and exploration or a prior is needed.

- Passive ADP: solve/evaluate Bellman expectation equations for the fixed policy with $\hat P,\hat R$.
- Active ADP: solve/improve the learned MDP using Bellman optimality, with exploration.
- Replanning propagates information globally and can reuse a sample through many model backups; computation and model-estimation error are costs.

### 4.9 Monte Carlo (MC)

After an episode, compute $G_t$ backward and average observed returns:

$$V(s)\leftarrow V(s)+\alpha[G_t-V(s)],\quad \alpha=1/N(s)\text{ for a sample mean}.$$

First-visit MC uses only the first visit to each state per episode; every-visit MC uses each visit. Specify which when a state repeats. MC needs completed returns (or an explicit truncation treatment), does not bootstrap, and has high variance. On-policy sampled returns are unbiased targets for the fixed policy value, but early estimated values remain noisy. MC control estimates $Q$, improves the policy, and still needs exploration.

#### Handling repeated visits and incremental averages

For first-visit MC, retain only the earliest visit to a state in each episode. For every-visit MC, retain each visit and its own return. Returns from repeated visits can differ because the remaining rewards and discount exponents differ; they can also be correlated within an episode.

For n previously retained samples with mean m and a new return G:

$$m_{new}=\frac{nm+G}{n+1}=m+\frac{G-m}{n+1}.$$

Increment the count for each retained return, not automatically once per episode. A constant learning rate instead gives recency weighting rather than the arithmetic mean of all samples. For MC control, count state-action visits rather than only state visits.

### 4.10 Temporal difference prediction: TD(0)

For observed $(s,r,s')$:

$$\delta=r+\gamma V(s')-V(s),\qquad V(s)\leftarrow V(s)+\alpha\delta.$$

TD updates immediately after one transition and **bootstraps** from an estimated successor value. It learns without knowing all possible successors. It often has lower target variance than MC but can be biased by inaccurate estimates. TD(0) means no eligibility-trace extension, not $\gamma=0$ or $\alpha=0$. Terminal successor has value zero.

Example: $V(s)=.84$, $V(s')=.92$, $r=-.04$, $\gamma=1$, $\alpha=.5$: target $.88$, error $.04$, new value $.86$.

| Feature | ADP | TD(0) | MC |
|---|---|---|---|
| Model | Learned/given | Not required | Not required |
| Target | Expected model backup | Sample reward + next estimate | Completed sample return |
| Update timing | Model evaluation/planning | Every transition | Episode completion |
| Bootstrapping | Yes for iterative Bellman backups | Yes | No |
| Cost | Model storage and planning | Small local update | Return calculation and averaging |
| Principal risk | Model error and incomplete coverage | Bootstrap bias/instability | High variance and long episodes |

### 4.11 SARSA and Q-learning

**SARSA** uses $(s,a,r,s',a')$:

$$Q(s,a)\leftarrow Q(s,a)+\alpha[r+\gamma Q(s',a')-Q(s,a)].$$

The next action $a'$ is sampled from the behavior policy. SARSA is **on-policy**: it learns the value of the policy including its exploratory choices.

**Q-learning** uses $(s,a,r,s')$:

$$Q(s,a)\leftarrow Q(s,a)+\alpha[r+\gamma\max_bQ(s',b)-Q(s,a)].$$

Q-learning is **off-policy**: the greedy target can differ from the exploring behavior. Both update only the sampled pair in the tabular case. If the next sampled action is greedy, their sample targets coincide; otherwise they can differ. On a terminal transition, both targets are $r$.

In cliff-like tasks, SARSA can account for the danger created by continuing exploratory behavior; Q-learning's greedy target evaluates greedy continuation. Do not claim Q-learning is always safer or better during training.

### 4.12 Exploration, convergence, and optimism

A purely greedy learner can miss better actions because its own choices determine its data. Exploration temporarily sacrifices estimated reward to obtain information; exploitation uses current estimates.

**$\epsilon$-greedy with $m$ actions:** choose a greedy action with probability $1-\epsilon$, otherwise sample uniformly from all actions. With a unique greedy action, its total probability is $1-\epsilon+\epsilon/m$; each other action has probability $\epsilon/m$. A variant sampling only nongreedy actions has different probabilities.

**GLIE:** all relevant state-action pairs are visited infinitely often and the behavior becomes greedy in the limit. Decaying $\epsilon$ must still provide sufficient exploration; an arbitrary fast decay need not satisfy GLIE.

Typical tabular stochastic approximation conditions for each pair are

$$\sum_n\alpha_n=\infty,\qquad\sum_n\alpha_n^2<\infty,$$

with sufficient visits, bounded rewards, and appropriate MDP assumptions. Constant learning rates can track changes but do not give the same exact asymptotic guarantee. These guarantees do not transfer automatically to nonlinear function approximation.

**Optimism:** initialize unknown action values high or use

$$f(u,n)=\begin{cases}R^+,&n<N_e,\\u,&n\ge N_e.\end{cases}$$

Inflated values favor insufficiently tried actions. A fixed exploration threshold encourages some trials but by itself is not infinite exploration. Counts are per relevant state-action pair, not merely a global episode count.

## Week 5 — Function approximation and policy search

### 5.1 Regression, gradients, and generalization

A table uses independent entries. An approximator shares parameters across states/actions, supporting large or continuous spaces but allowing one update to affect many predictions.

Linear value model:

$$\hat V_\theta(s)=\theta^\top\phi(s)=\sum_i\theta_i\phi_i(s).$$

For a fixed target $y$, squared loss $L=\frac12(y-\hat V_\theta(s))^2$ gives

$$\theta\leftarrow\theta-\alpha\nabla_\theta L
=\theta+\alpha(y-\hat V_\theta(s))\phi(s).$$

Gradient **descent** minimizes a loss; gradient **ascent** maximizes expected return. Neural networks provide nonlinear representations and compute gradients by backpropagation. Features and architecture constrain what can be represented; more data cannot remove a structural impossibility such as $\hat Q(0,a)=0$ for all parameters in a model without an intercept.

### 5.2 Semi-gradient TD and approximate Q-learning

TD target $y=r+\gamma\hat V_\theta(s')$ depends on current parameters. The usual **semi-gradient** treats it as fixed when differentiating the current prediction:

$$\delta=r+\gamma\hat V_\theta(s')-\hat V_\theta(s),\quad
\theta\leftarrow\theta+\alpha\delta\nabla_\theta\hat V_\theta(s).$$

For a linear model, the gradient is $\phi(s)$. Do not differentiate the successor estimate when asked for the standard semi-gradient update.

Approximate Q-learning:

$$\delta=r+\gamma\max_b\hat Q_\theta(s',b)-\hat Q_\theta(s,a),\quad
\theta\leftarrow\theta+\alpha\delta\nabla_\theta\hat Q_\theta(s,a).$$

For coordinate-based features, $\phi(x,y)=(1,x,y,d)$, $d=\sqrt{(x-x_g)^2+(y-y_g)^2}$. Updates are $\theta_0+=\alpha\delta$, $\theta_1+=\alpha\delta x$, $\theta_2+=\alpha\delta y$, $\theta_3+=\alpha\delta d$.

**Approximate MC:** replace the TD target with the completed return:

$$\theta\leftarrow\theta+\alpha(G_t-\hat V_\theta(s_t))\nabla_\theta\hat V_\theta(s_t).$$

**Approximate SARSA:** replace the greedy max in approximate Q-learning with the selected next action:

$$\delta=r+\gamma\hat Q_\theta(s',a')-\hat Q_\theta(s,a).$$

On-policy linear TD prediction converges under standard sampling/stepsize assumptions to its projected solution; this is not a claim that its feature class can represent the true value exactly. Nonlinear/off-policy cases do not inherit this guarantee.

#### Feature adequacy and parameter updates

For a linear estimate $\hat V_\theta(s)=\sum_i\theta_i\phi_i(s)$, the component update is

$$\theta_i\leftarrow\theta_i+\alpha\delta\phi_i(s).$$

Compute current and successor predictions from the specified old parameters, then apply the common TD error to each current-state feature. A zero feature gives no direct update to its coefficient. Differentiation is with respect to parameters, not the input coordinates or their feature-construction formula.

Feature design constrains expressiveness. A model $\hat Q(x,a)=\beta_ax$ forces every action value at x=0 to zero, regardless of training data. Adding an action-specific intercept or using one-hot state-action features can remove that restriction. Shared features support generalization, but can also couple predictions that should differ. Separate insufficient data from a representation that cannot express the desired function.

### 5.3 Why function approximation can be unstable

The **deadly triad** is function approximation + bootstrapping + off-policy learning. Baird's counterexample shows that even linear off-policy semi-gradient TD can diverge. Shared parameters, moving targets, correlated data, distribution shifts, and catastrophic forgetting can worsen behavior. Tabular convergence theorems are not general deep-RL guarantees.

### 5.4 Deep Q-networks (DQN)

DQN approximates $Q(s,a)$ with a neural network; the original approach maps image observations to values for discrete actions.

1. Act using an exploratory policy, such as $\epsilon$-greedy.
2. Store $(s,a,r,s',done)$ in replay buffer.
3. Sample a minibatch, reducing temporal correlation and reusing experience.
4. Compute target with a slowly updated target network:

$$y=r+\gamma(1-done)\max_bQ_{\theta^-}(s',b).$$

5. Minimize $(y-Q_\theta(s,a))^2$ or a specified robust loss, holding $y$ fixed.
6. Periodically copy or slowly mix online parameters into the target network.

**Replay** addresses correlated samples/reuse; **target network** stabilizes moving targets. Neither guarantees convergence. Vanilla DQN's max over actions is straightforward for a small discrete set but difficult for continuous actions.

**Recognition-level variants:** Double DQN selects with the online network and evaluates with the target network to reduce max overestimation; Dueling separates value and action advantage; prioritized replay favors informative transitions but changes sampling; recurrent variants address observation histories. The core Week 5 mechanism is replay plus a separate target network.

### 5.5 Policy search and softmax

Directly parameterize a stochastic policy and maximize

$$J(\theta)=E_{\tau\sim\pi_\theta}\left[\sum_t\gamma^tr_t\right].$$

For action preference $z_\theta(s,a)$:

$$\pi_\theta(a\mid s)=\frac{e^{z_\theta(s,a)}}{\sum_b e^{z_\theta(s,b)}}.$$

A deterministic argmax rule is generally not smoothly differentiable in its parameters. For linear logits $z_\theta(s,a)=\theta^\top\phi(s,a)$:

$$\nabla_\theta\log\pi_\theta(a\mid s)=\phi(s,a)-\sum_b\pi_\theta(b\mid s)\phi(s,b).$$

Policy-gradient theorem, under the corresponding discounted occupancy convention:

$$\nabla_\theta J\propto E[Q^\pi(s,a)\nabla_\theta\log\pi_\theta(a\mid s)].$$

### 5.6 REINFORCE and baselines

REINFORCE uses completed episodes and sampled return as the action-value target:

$$\theta\leftarrow\theta+\alpha G_t\nabla_\theta\log\pi_\theta(a_t\mid s_t).$$

The return tells how good the sampled continuation was; the score gradient says how to change the probability of the sampled action. Positive relative performance increases its likelihood; negative relative performance decreases it.

**Discount convention:** the expression above uses local return weighting. For an unbiased trajectory gradient of the explicitly discounted start-state objective $E[\sum_t\gamma^tr_t]$, the full sum is $\sum_t\gamma^tG_t\nabla\log\pi(a_t\mid s_t)$. An equivalent policy-gradient form can absorb this weighting in discounted state visitation. Keep the objective, estimator, and discount weighting consistent.

Use an action-independent baseline:

$$\theta\leftarrow\theta+\alpha[G_t-b(s_t)]\nabla_\theta\log\pi_\theta(a_t\mid s_t).$$

It preserves the expected score gradient since

$$E_{a\sim\pi}[b(s)\nabla_\theta\log\pi(a\mid s)]
=b(s)\nabla_\theta\sum_a\pi(a\mid s)=0.$$

$V^\pi(s)$ is a useful reference: the update measures performance relative to typical return from that state. It reduces variance in many settings; the mathematically variance-minimizing baseline need not equal $V^\pi$ exactly. Detach the baseline/advantage when applying the usual actor update. A sample $G_t$ is not itself the expected value $V^\pi(s_t)$.

#### Advantage: what counts as better than the policy's baseline?

The Week 5 lecture defines advantage as action value minus state value:

$$A^\pi(s,a)=Q^\pi(s,a)-V^\pi(s),\qquad
V^\pi(s)=\sum_a\pi(a\mid s)Q^\pi(s,a).$$

Positive advantage means the action is better than the policy's average continuation from that state; negative advantage means worse. For example, if $Q^\pi(s,a)=10$ but $V^\pi(s)=12$, the advantage is −2 despite a positive action value. Under the same policy, $\sum_a\pi(a\mid s)A^\pi(s,a)=0$.

REINFORCE uses the sampled estimate $G_t-b(s_t)$. Actor-Critic can use the TD error instead. With an exact value function and a nonterminal transition:

$$E[r+\gamma V^\pi(s')-V^\pi(s)\mid s,a]=A^\pi(s,a).$$

One observed TD error is noisy; an inaccurate critic also introduces estimation error. This connects the REINFORCE baseline, Actor-Critic's feedback, and PPO's advantage sign without requiring a softmax parameter calculation.

### 5.7 Actor-Critic

Actor learns $\pi_\theta$; critic learns $V_w$ or $Q_w$. In one-step TD Actor-Critic:

$$\delta_t=r_t+\gamma V_w(s_{t+1})-V_w(s_t),$$

$$w\leftarrow w+\alpha_w\delta_t\nabla_wV_w(s_t),$$

$$\theta\leftarrow\theta+\alpha_\theta\delta_t\nabla_\theta\log\pi_\theta(a_t\mid s_t).$$

The critic's TD error estimates advantage. Bootstrapping allows earlier/lower-variance updates than complete-return REINFORCE but introduces critic-estimation bias. Actor and critic can have different learning rates. A2C is synchronous; A3C uses asynchronous workers. These are implementation families, not changes to the definition of advantage.

### 5.8 TRPO and PPO

Unrestricted policy updates can destroy a good policy. TRPO maximizes a surrogate objective subject to a KL constraint limiting policy change:

$$\max_\theta E[r_t(\theta)\hat A_t]
\quad\text{subject to }E[D_{KL}(\pi_{old}\|\pi_\theta)]\le\delta_{KL}.$$

PPO replaces this costly constrained update with a clipped surrogate:

$$r_t(\theta)=\frac{\pi_\theta(a_t\mid s_t)}{\pi_{old}(a_t\mid s_t)},$$

$$L^{CLIP}=E\left[\min\left(r_t\hat A_t,\operatorname{clip}(r_t,1-\epsilon,1+\epsilon)\hat A_t\right)\right].$$

This is a maximization objective; implementations minimizing a loss use its negative. $r_t>1$ increases the probability of the sampled action; $r_t<1$ decreases it. This ratio is not the environment reward $r_t$ despite the reused letter.

| Advantage sign | Desirable change | Where the sample's beneficial change is clipped |
|---|---|---|
| $\hat A>0$ | Increase action probability | Above $1+\epsilon$ |
| $\hat A<0$ | Decrease action probability | Below $1-\epsilon$ |
| $\hat A=0$ | No actor contribution | Terms are zero |

**Always multiply by advantage before taking min.** For $\hat A<0$, ordering reverses. PPO clips the objective incentive; it does not force every ratio to remain in the interval, impose a hard KL constraint, or guarantee monotonic policy improvement. Data generated by the old policy is normally reused for a limited number of minibatch epochs.

| Method | What changes? | Feedback | Main trade-off |
|---|---|---|---|
| DQN | Action-value network | Bootstrapped greedy TD target | Off-policy sample reuse; discrete-action maximization and instability |
| REINFORCE | Stochastic policy | Complete sample return | Direct optimization; high variance |
| Actor-Critic | Policy and critic | Estimated advantage | Earlier/lower-variance updates; critic bias |
| TRPO | Policy with critic/advantages | KL-constrained surrogate | More explicit step control; expensive optimization |
| PPO | Policy and critic | Clipped surrogate | Simpler optimization; approximate step control |

#### PPO clipping as a piecewise objective

Let r be the policy probability ratio, A the estimated advantage, and $\epsilon>0$. The per-sample objective can be written

$$L(r,A)=\begin{cases}
A\min(r,1+\epsilon),&A\ge0,\\
A\max(r,1-\epsilon),&A<0.
\end{cases}$$

For positive advantage, increasing r beyond the upper threshold gives no additional surrogate reward. For negative advantage, decreasing r below the lower threshold gives no additional surrogate reward. Harmful changes remain penalized: reducing probability for a good action or increasing it for a bad action is not protected by clipping. This is why multiplying by advantage before taking the minimum matters.

## Week 7 — Guided sequential decisions

### 7.1 Decision-time versus demonstration-based methods

| | Decision-time planning | Demonstration-based learning |
|---|---|---|
| When computation happens | At each decision | Mostly before deployment |
| Information | Simulator/model and current state | Expert demonstrations or corrections |
| Output | An action for the current state | A learned policy |
| Examples | Rollout, MCTS, UCT | BC, DAgger, GAIL |
| Trade-off | Runtime search cost | Data coverage and expert quality |

Both avoid solving the entire enormous state space by exhaustive offline DP. A simulator is still needed for ordinary rollouts/MCTS; “no model-free RL training” does not mean “no model.”

### 7.2 Rollout

For each candidate first action $a$, hold it fixed, then follow a base rollout policy $\pi$ in simulated continuations:

$$\hat Q^\pi(s,a)=\frac1N\sum_{i=1}^NG^{(i)}(s,a),\quad a^*=\arg\max_a\hat Q^\pi(s,a).$$

For a depth cutoff, include $\gamma^H\hat V(s_H)$ or explicitly accept truncation bias. Comparing candidate actions with different reward horizons is misleading unless intentionally modeled. Exact one-step greedy improvement using $Q^\pi$ satisfies policy improvement under the usual assumptions; finite noisy rollout estimates do not guarantee every chosen action improves the base policy.

Lecture example: Left returns $4,6,5$, mean $5$; Right returns $3,8,2$, mean $13/3\approx4.333$. Choose Left. $G$ is one realized sum, while $Q^\pi$ is an expectation over possible continuations.

Chance nodes average according to transition probabilities (or Monte Carlo samples); decision nodes choose among actions. Random environment outcomes are not controllable choices.

### 7.3 MCTS and UCT

Four stages in each repeated trial:

1. **Selection:** follow existing tree edges using a tree policy.
2. **Expansion:** add an untried action/node.
3. **Simulation:** use a rollout or leaf evaluator.
4. **Backup:** update visits, total return, and average value along the selected path.

Keep the tree statistics between trials for the current decision. An edge is expanded once but may be visited repeatedly. If $N$ samples have mean $\bar Q$, a new return $g$ gives

$$\bar Q_{new}=\bar Q+\frac{g-\bar Q}{N+1}.$$

Return backed up at an ancestor includes its intervening rewards and discount; do not blindly use an undiscounted leaf reward for all levels. MCTS is **anytime**: more trials can improve the decision estimate and it can return a current answer when interrupted.

UCT selection:

$$a=\arg\max_a\left[\bar Q(s,a)+c\sqrt{\frac{\ln N(s)}{N(s,a)}}\right].$$

First term exploits average return; second explores less-sampled actions. Larger $c$ favors exploration. Unvisited actions need a separate convention (e.g. prioritize them); the formula is undefined at $N(s,a)=0$. The simulation-selection rule is different from the final root recommendation, which may use visit count or estimated value according to the specified algorithm. Finite compute is not an optimality guarantee.

### 7.4 AlphaGo Zero and PUCT

A neural network provides a policy prior $P(s,a)$ and a state value $v(s)$. PUCT uses the prior to guide search:

$$\bar Q(s,a)+cP(s,a)\frac{\sqrt{\sum_bN(s,b)}}{1+N(s,a)}.$$

AlphaGo Zero evaluates leaves with its value network rather than random rollouts and trains from self-play rather than expert games. MCTS visit distributions become policy targets; game outcomes become value targets. This resembles approximate policy iteration: search improves behavior and network learning approximates that improvement. In alternating zero-sum games, backup must respect player perspective, often reversing value signs between turns.

### 7.5 BC, DAgger, IRL, and GAIL

**Behavioral cloning (BC):** supervised learning on expert state-action pairs:

$$L_{BC}=-E_{(s,a_E)\sim D}[\log\pi_\theta(a_E\mid s)].$$

It is simple and requires no explicit reward model. But the learner's mistakes change which states it visits, so deployment distribution differs from expert data. Early errors can compound and lead to unseen recovery states.

**DAgger:** train initial policy → run current learner (possibly mixed with the expert) → query expert actions on the visited states → add those labels to the dataset → retrain. Decaying expert-execution probability $\beta$ changes the states visited; expert labels are still queried on learner-visited states. It reduces distribution mismatch at the cost of interactive expert access. Dataset aggregation retains earlier data.

**IRL:** infer a reward explaining expert behavior, then solve/learn under that reward. Reward inference may be ambiguous: many rewards can justify the same behavior.

**GAIL:** learn a policy through adversarial discrimination of expert versus learner state-action behavior, matching occupancy distributions without explicitly identifying a unique reward. It generally requires learner rollouts during training; expert demonstrations alone are not the entire computation.

**Comparison:** BC predicts actions from a fixed dataset; DAgger obtains corrections on the learner's states; IRL recovers a reward model; GAIL adversarially matches behavior. None establishes that an imperfect expert is globally optimal. Human demonstrations may reflect biases and bounded rationality.

## Common mistakes and calculation techniques

### Common wrong answers and their repairs

| Mistake | Repair |
|---|---|
| “A goal describes the entire desired state” | It normally constrains only selected literals |
| Changing facts not mentioned in the effects | Apply inertia; only delete/add specified facts |
| Adding an unstated distinctness condition when grounding | Enumerate substitutions using the actual schema |
| “Any delete-relaxed heuristic is admissible” | Exact relaxed optimum is a lower bound; greedy extraction or additive sharing can overestimate |
| “Optimistic includes a goal, so success is certain” | It may include unreachable states |
| “Pessimistic misses a goal, so the plan fails” | It may omit reachable successes |
| $U(E[X])$ instead of $E[U(X)]$ | Evaluate utility at outcomes before averaging |
| Taking log of a negative payoff | Apply log to positive final wealth |
| Equating CE with EU | CE has outcome units; EU has utility units |
| Assuming arbitrary monotone transformations preserve lotteries | Positive affine transformations preserve expected-utility preferences |
| Treating Nash equilibrium as socially best | Check incentives and welfare separately |
| $E[\max_a]$ when action precedes uncertainty | Choose one action then average its possible outcomes |
| Putting max into fixed-policy evaluation | Max is for improvement/optimality, not evaluation |
| Paying terminal reward twice | Reward on entry, terminal future value zero |
| Reusing newly updated values in a synchronous VI sweep | Read the entire previous vector |
| Learning rate and discount mixed up | $\alpha$ controls update size; $\gamma$ weights future reward |
| SARSA uses a greedy next action automatically | Use the behavior's actual next action |
| “Q-learning never uses negative outcomes” | Every observed reward enters its update; only continuation is greedy |
| MC updates before its full return is available | Wait for completion unless another estimator is specified |
| Differentiating a TD target in a semi-gradient update | Treat the target as fixed |
| Approximator failure blamed only on too little data | Check whether its features can represent the desired values |
| PPO takes min of ratios before considering sign | Multiply both terms by advantage first |
| “PPO guarantees every ratio stays clipped” | Clipping affects the objective, not a hard parameter constraint |
| Position-only state for delayed actions | Include pending status and the action still being executed |
| MCTS forgets old samples each trial | Maintain visit/return statistics across trials |
| DAgger merely adds more expert trajectories | Query labels on states visited by the learner |
| Shortest valid plan equals highest utility | Evaluate the stated objective, including timing and resource constraints |

### Reusable answer structure

**Definition question:** state the problem solved → define the key quantity → give the mechanism → distinguish its closest alternative.

**Modeling question:** enumerate state variables → legal actions → successor probabilities → reward timing → terminal/horizon → verify Markov sufficiency and probability normalization.

**Update question:** write old value → calculate target using the specified pre-update quantities → subtract to get error → multiply by learning rate → update only the intended entry/parameters → show final answer.

**Proof/counterexample:** state assumptions → write the relevant inequality/set inclusion → derive the requested implication; when an implication fails, give one small concrete counterexample.

**Comparison question:** compare model information, training data, target, update timing, prediction/control, and main trade-off. Avoid declaring one algorithm universally best.
