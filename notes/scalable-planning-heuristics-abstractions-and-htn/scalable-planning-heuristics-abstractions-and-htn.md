<meta>
Title: Scalable AI Planning: Heuristic Search, Abstractions, HTN, and Reachable Sets
Summary: A comprehensive technical analysis of scaling AI Planning to complex real-world domains. Covers explicit search heuristics vs. implicit solver heuristics, admissible vs. underestimating heuristics, domain-independent heuristics (h_max, h_add, h_FF, 8-puzzle case study), pruning techniques (symmetry reduction, forward pruning, serializable subgoals, Sussman Anomaly), state abstraction math (Air Cargo 10^405 -> 10^11), goal decomposition (4-blocks example), Hierarchical Task Networks (HTN) with high-level actions (HLAs), Changi Airport execution trace (s0-s3), exponential complexity savings (O(10^30) -> O(34)), downward refinement proof theory with reachable sets (REACH- <= REACH <= REACH+), tilde operators (~, +~A, -~A, +-~A) with 2-action proof example, SOTA LLM-assisted planning paradigms (NeurIPS 2024, ICRA 2025, arXiv 2025, AAAI 2024, DELTA, HVR, HTP, SayCan, HiTAMP), industrial frameworks (PANDA, HDDL, AIPlanning4EU), real-world systems (Mars Rovers, Game AI), and the transition to decision making under uncertainty (MDPs, RL).
Slug: scalable-planning-heuristics-abstractions-and-htn
Output: notes/scalable-planning-heuristics-abstractions-and-htn/scalable-planning-heuristics-abstractions-and-htn.html
CanonicalId: scalable-planning-heuristics-abstractions-and-htn
Style: default
EstimatedReadingTime: true
Lang: en
Tags: ai planning, htn, heuristics, fast forward, state abstraction, automated planning
Status: drafting
Published: 2026-08-29
LastModified: 2026-08-30
</meta>
<draft>
- 1. Heuristics for Search-Based Planning vs. Inference Solvers
    - Why use heuristics: Rule of thumb / intuitive estimation to enhance efficiency, reduce search space, prune irrelevant branches, find solutions faster.
    - Search-based planning (A*, GBFS): Explicit heuristic function $h(s)$ estimating cost from state to goal, guiding node expansion.
    - Search vs. Inference contrast: Heuristics are explicit in search-based methods ($h(s)$), but implicit in inference-based methods (SAT-based, CSP).
    - Inference-based methods (SAT, CSP): No explicit $h(s)$ function; rely on solver-internal heuristics (variable/clause selection, branching strategies like VSIDS, unit propagation) to guide proof/search order indirectly.
- 2. Planning as Search & Heuristic Evaluation (8-Puzzle Case Study)
    - Definitions: States (nodes = world configurations), Actions (edges = state change), Goal (find path from initial to goal state).
    - Heuristic $h(s)$: Estimates cost from state $s$ to goal $g$. Defined on states, actions, or state transitions.
    - Admissible heuristics: $h(s) \le h^*(s)$ (never overestimates). Guarantees finding optimal plans with A* search.
    - Serious Underestimation Limitation: If $h(s)$ severely underestimates (e.g., $h(s)=0$ everywhere, reducing A* to Dijkstra), it loses informativeness, leading to unpruned search tree explosion and zero guidance efficiency.
    - 8-Puzzle Formulation: $3 \times 3$ grid, 8 numbered tiles + 1 blank. Action `Slide(t, s1, s2)` with PDDL Precond $On(t, s1) \land Tile(t) \land Blank(s2) \land Adjacent(s1, s2)$ and Effect $On(t, s2) \land Blank(s1) \land \neg On(t, s1) \land \neg Blank(s2)$.
    - Ignore Selected Preconditions: Remove $Blank(s2) \land Adjacent(s1, s2) \implies$ Misplaced Tiles Heuristic (counts tiles out of position). Challenge: Unclear which preconditions can be selectively ignored in general.
    - Ignore Delete Effects: Remove $\neg On(t, s1) \land \neg Blank(s2) \implies$ Manhattan Distance Heuristic.
    - Heuristic Function Comparison:
        - $h_{\max} = \max\{1, 1, 1\} = 1$ (admissible, weak).
        - $h_{\text{add}} = 1 + 1 + 1 = 3$ (more informative, not always admissible).
        - $h_{\text{FF}}$ (Fast Forward heuristic, Hoffmann & Nebel 2001): Ignores delete effects, greedily extracts a relaxed plan, $h_{\text{FF}}(s) = \text{number of actions in relaxed plan}$. Highly informed, inadmissible (greedy extraction can give longer-than-optimal relaxed plans), widely used in satisficing planning.
- 3. Domain-Independent Pruning & Subgoal Serialization
    - Domain-independent pruning: Reduces redundant or less promising branches without domain-specific engineering.
    - Symmetry reduction: Identifies and skips equivalent search branches (e.g., Towers of Hanoi), cutting away huge search space by symmetry.
    - Forward pruning: Selects preferred promising actions to expand, cutting off others (e.g., Fast Downward). Trade-off: Identifying preferred actions is non-trivial, and may sacrifice optimality.
    - Serializable subgoals: Order goals sequentially such that achieving one subgoal never requires undoing previously completed subgoals.
    - Sussman Anomaly: Blocks C on A (`On(C, A)`), both A and B on Table $\rightarrow$ Goal `On(A, B)` and `On(B, C)`. Interdependency conflict resolved via serializable subgoals.
- 4. Abstraction and Goal Decomposition (Math & Worked Examples)
    - State Abstraction: Groups fine-grained states into abstract states to search a smaller space first, then refine back to original space. Pattern Databases (PDBs), Maze room abstraction.
    - Air Cargo Transportation State Abstraction Math:
        - Full state space: 10 airports, 50 planes, 200 cargo pieces $\implies 10^{50} \times (50+10)^{200} = 10^{50} \times 60^{200} \approx 10^{405}$ total states!
        - Abstraction assumption: Cargo originates from 5 airports, cargo at same airport shares destination.
        - Reformulation: Drop irrelevant $At$ fluents $\implies 10^5 \times (5+10)^5 = 10^5 \times 15^5 \approx 10^{11}$ states!
        - Cardinality savings: $10^{405} \rightarrow 10^{11}$ states. The abstract solution serves as an admissible heuristic for the original problem.
    - Goal Decomposition Worked Example:
        - Initial state: Blocks A, B, C, D on Table. Goal $G$: A on B and C on D.
        - Subgoal $G_1$: A on B $\implies \text{Cost}(P_1) = 2$ steps (pickup and put).
        - Subgoal $G_2$: C on D $\implies \text{Cost}(P_2) = 2$ steps. Subgoals are independent (plans do not interfere).
        - Heuristic estimates: $\text{Max}(\text{Cost}) = \max(2, 2) = 2$ (underestimates true cost 4 badly).
        - $\text{Sum}(\text{Cost}) = 2 + 2 = 4$ (matches exact true cost 4, admissible under independence).
        - Subgoal Interactions: Positive interaction (Synergy $\implies$ Sum Cost overestimates) vs. Negative interaction (Interference $\implies$ Sum Cost underestimates).
- 5. Hierarchical Task Networks (HTN) & Execution Trace
    - Motivation: Humans reason hierarchically using High-Level Actions (HLAs) and procedural knowledge.
    - HTN Concepts: HLAs refinable recursively into sub-HLAs or primitive actions. HLA achieves goal if at least one refinement succeeds (deliberate agent choice).
    - Changi Airport Execution Trace:
        - Initial task `Go(Home, SIN)`.
        - Refinement (1) `Drive(Home, SIN)` $\implies$ Precond `Have(Car)` fails!
        - Refinement (2) `Taxi(Home, SIN)` $\implies$ Precond `Cash(30)` succeeds!
        - Subtasks: `Call-Taxi(Home) \rightarrow Ride(Home, SIN) \rightarrow Pay-Taxi(Home, SIN)`.
        - Intermediate states:
            - $s_0 = \{\text{At}(\text{Me}, \text{Home}), \text{Cash}(30)\}$.
            - $s_1 = \{\text{At}(\text{Me}, \text{Home}), \text{At}(\text{Taxi}, \text{Home}), \text{Cash}(30)\}$.
            - $s_2 = \{\text{At}(\text{Me}, \text{SIN}), \text{At}(\text{Taxi}, \text{SIN}), \text{Cash}(30)\}$.
            - $s_3 = \{\text{At}(\text{Me}, \text{SIN}), \text{At}(\text{Taxi}, \text{SIN}), \text{Cash}(0)\}$.
    - HTN Exponential Savings Math: Flat planner $O(b^d) = O(10^{30})$ vs. HTN planner $O\left(r^{\frac{d-1}{k-1}}\right) = O(3^{3.22}) \approx 34$ operations!
- 6. Proving Plan Properties & Reachable Sets Theory
    - Reachable Set $\text{REACH}(s, h)$: Set of all states reachable from state $s$ by any valid implementation of HLA $h$.
    - Downward Refinement Property: If high-level plan reaches goal ($\text{REACH}(s, \text{plan}) \cap G \ne \emptyset$), at least one primitive refinement achieves the goal.
    - Tilde Notations ($\sim$): $\widetilde{+}A$ ("possibly add $A$"), $\widetilde{-}A$ ("possibly delete $A$"), $\widetilde{\pm}A$ ("full control / possibly add or delete $A$").
    - 2-Action Worked Schema Proof Example:
        - Action $h_1$: Precond $\neg A$, Effect $A \land \widetilde{-}B$ (adds $A$, possibly deletes $B$).
        - Action $h_2$: Precond $\neg B$, Effect $\widetilde{+}A \land \widetilde{\pm}C$ (possibly adds $A$, full control over $C$).
        - Initial state $B$, Goal $A \land C$. Proof showing sequence $[h_1, h_2]$ achieves goal (choose $h_1$ implementation that deletes $B$, then $h_2$ implementation that leaves $A$ true and makes $C$ true).
    - Approximate Reachable Sets Inclusion Chain: $\text{REACH}^-(s, h) \subseteq \text{REACH}(s, h) \subseteq \text{REACH}^+(s, h)$.
        - Optimistic $\text{REACH}^+ \cap G = \emptyset \implies$ Plan fails (safe failure pruning).
        - Pessimistic $\text{REACH}^- \cap G \ne \emptyset \implies$ Plan succeeds (safe success certification).
- 7. SOTA LLM-Assisted Planning Paradigms & Industrial Solvers
    - 7.1 Task Decomposition & Subgoal Planning (Kwon et al., ICRA 2025): Fast Downward baseline $\rightarrow$ Minimum Description Length (MDL) or planning time threshold switch $\rightarrow$ GPT-4 L-Policy rollout samples $n_s$ candidate plans to form state tree $T_i \rightarrow$ MCTS explores via selection/simulation/backpropagation to reach $S_{i+1}^*$. System: DELTA.
    - 7.2 LLM-Guided PDDL Creation (Mahdavi et al., NeurIPS 2024): Exploration Walk + VAL feedback loop $\implies$ 66% task success vs 29% GPT-4 intrinsic CoT.
    - 7.3 Python Heuristic Generation (Corrêa et al., 2025 arXiv): Synthesizing Python heuristic code for Pyperplan GBFS.
    - 7.4 Generalized Planning in PDDL (Silver et al., AAAI 2024): GPT-4 prompted with PDDL domain specs + 2 training tasks $\rightarrow$ CoT strategy extraction $\rightarrow$ domain Python program solver $\rightarrow$ VAL re-prompting automated debugging loop.
    - 7.5 Real-World Robotic Systems: DELTA, HVR (LLM+RAG+Symbolic VAL), HyperTree Planning (HTP), SayCan / HiTAMP, Roadmap & Benchmarks.
    - 7.6 Taxonomy Comparison Table: Model Creation, Task Decomposition, Heuristic Generation, General Planning.
    - 7.7 Industrial Frameworks & HTN Solvers:
        - **The PANDA Framework**: `PANDApss` (HTN+POCL), `PANDApro` (progression search), `PANDAtotSAT` (SAT encoding), `PANDADealer` (IPC 2023 HTN winner).
        - **HDDL Specification**: Hierarchical Domain Definition Language (AAAI 2020, KI 2021).
        - **AIPlanning4EU Project**: Open-source `unified-planning` Python library unifying planning engines.
- 8. Summary: From Classical to Modern Planning & Uncertainty Transition
    - Relevance: Robotics, logistics, space mission autonomy (Mars 2020 Rover, ICRA 2007, i-SAIRAS 2020), commercial video game AI (IEEE TOG 2019), Enterprise AI (IJCAI 2019), multi-agent coordination.
    - Evolutionary trajectory: Model Relaxations ($h_{\text{FF}}$) $\rightarrow$ State Abstraction ($10^{405} \rightarrow 10^{11}$) $\rightarrow$ HTNs ($O(b^d) \rightarrow O(r^k)$) $\rightarrow$ Neuro-Symbolic LLM integration.
    - Next Frontier: Real-world environments feature noisy sensors, incomplete info, stochastic dynamics, and trade-offs among preferences, risk, and utility $\implies$ Transition to Utility Theory, Markov Decision Processes (MDPs), and Reinforcement Learning (RL).
</draft>

# Scalable AI Planning: Heuristic Search, Abstractions, HTN, and Reachable Sets

When scaling automated planning from toy domains to complex real-world applications, state-space search faces the formidable obstacle of **combinatorial explosion**. As the number of state variables (fluents) and available actions increases, the number of distinct ground states grows exponentially.

To bypass this scalability bottleneck, automated planning relies on four foundational lines of defense:
1. **Heuristic Guidance and Pruning**: Formulating explicit domain-independent cost estimators and pruning unpromising branches.
2. **State Abstraction and Goal Decomposition**: Reducing the state space cardinality and partitioning complex goals into manageable subgoals.
3. **Hierarchical Task Networks (HTN)**: Leveraging human procedural knowledge via High-Level Actions (HLAs) and Reachable Sets theory to achieve exponential search savings.
4. **LLM-Assisted Planning Paradigms & Industrial Solvers**: Fusing neuro-symbolic commonsense reasoning, automated PDDL synthesis, and Python heuristic generation with symbolic verification engines, industrial HTN frameworks (PANDA, HDDL), and real-world robotic systems (DELTA, HVR, HTP, SayCan, HiTAMP).

This note systematically examines the mathematical foundations, algorithm mechanics, proof theories, industrial frameworks, and state-of-the-art neuro-symbolic integrations underlying scalable AI planning.

---

## 1. Search-Based Heuristics vs. Solver-Internal Inference Heuristics

Search algorithms and logical inference solvers optimize problem-solving through fundamentally different heuristic mechanisms.

```
+-------------------------------------------------------------------+
|                     Heuristic Mechanisms                          |
+-----------------------------------++------------------------------+
|       Search-Based Planning       ||   Inference-Based Solvers    |
|       (A*, GBFS, Fast Downward)   ||        (SAT, CSP, CDCL)      |
+-----------------------------------++------------------------------+
| • Explicit heuristic $h(s)$       || • No explicit $h(s)$ function |
| • Estimates cost from state $s$   || • Internal variable/clause   |
|   to goal $g$                     ||   selection (VSIDS)          |
| • Direct node expansion guidance  || • Indirect proof & resolution|
|                                   ||   tree pruning               |
+-----------------------------------++------------------------------+
```

- **Search-Based Planning (A*, GBFS)**: Uses an **explicit heuristic function $h(s)$** to estimate the minimal cost from state $s$ to goal $g$. Nodes are selected for expansion based directly on $h(s)$ or $f(s) = g(s) + h(s)$.
- **Logical Inference Solvers (SAT, CSP)**: Contain **no explicit heuristic function $h(s)$**. Instead, they rely on **solver-internal heuristics**—such as variable decision heuristics (e.g., VSIDS), clause learning, and unit propagation strategies—to order resolution choices and prune proof search spaces indirectly.

---

## 2. Planning as Search & Heuristic Evaluation (8-Puzzle Case Study)

### 2.1 Definitions and Admissibility vs. Severe Underestimation

- **Definitions**: States $s \in S$ (world configurations), Actions $a \in A$ (state transitions), Goal $g \subseteq S$ (target conditions).
- **Heuristic $h(s)$**: Estimates the minimal cost from state $s$ to goal $g$. Can be defined on states, actions, or transitions.
- **Admissibility ($h(s) \le h^*(s)$)**: A heuristic $h(s)$ is admissible if it never overestimates the true minimal cost $h^*(s)$ from state $s$ to the goal. When paired with $A^*$ search, admissibility guarantees finding optimal plans.
- **The Limitation of Severe Underestimation**: While overestimation destroys admissibility, **severe underestimation is equally detrimental to efficiency**. If $h(s)$ severely underestimates (e.g., trivial baseline $h(s) = 0$, which degrades $A^*$ to Dijkstra's algorithm), it provides zero search guidance, causing unpruned search tree explosion.

### 2.2 8-Puzzle Planning Formulation

Consider the classic 8-Puzzle on a $3 \times 3$ board with 8 numbered tiles and 1 blank space:

```
Initial State (s0):                  Goal State (g):
+---+---+---+                        +---+---+---+
| 2 |   | 3 |                        | 1 | 2 | 3 |
+---+---+---+                        +---+---+---+
| 1 | 8 | 4 |          ===>          | 8 |   | 4 |
+---+---+---+                        +---+---+---+
| 7 | 6 | 5 |                        | 7 | 6 | 5 |
+---+---+---+                        +---+---+---+
```

Action Schema for sliding a tile $t$ from square $s_1$ to square $s_2$:

$$\text{Action}(\text{Slide}(t, s_1, s_2))$$
$$\text{PRECOND}: On(t, s_1) \land Tile(t) \land Blank(s_2) \land Adjacent(s_1, s_2)$$
$$\text{EFFECT}: On(t, s_2) \land Blank(s_1) \land \neg On(t, s_1) \land \neg Blank(s_2)$$

### 2.3 Deriving Domain-Independent Heuristics via Relaxation

By selectively dropping preconditions or delete effects from the PDDL specification, planners automatically derive optimistic heuristic estimators:

1. **Ignore Selected Preconditions (Misplaced Tiles Heuristic)**:
   - Drop preconditions $Blank(s_2) \land Adjacent(s_1, s_2)$.
   - Tiles can move directly to any target position regardless of adjacent blanks.
   - Heuristic value $h_{\text{misplaced}}(s)$ equals the count of tiles currently out of position.
   - *Challenge*: It is non-trivial to automatically determine which preconditions can be selectively ignored across arbitrary general domains.
2. **Ignore Delete Effects (Relaxed Planning Graph & Manhattan Distance)**:
   - Drop delete effects $\neg On(t, s_1) \land \neg Blank(s_2)$. Facts once made true never become false.
   - Yields Manhattan Distance (sum of grid distance for each tile to its target location).

### 2.4 Numerical Heuristic Function Comparison ($h_{\max}, h_{\text{add}}, h_{\text{FF}}$)

For the 8-Puzzle state above with 3 misplaced tiles (Tile 1, Tile 2, Tile 8, each at Manhattan distance 1):

- **$h_{\max}$ (Max Heuristic)**: $\max\{1, 1, 1\} = 1$. It is **admissible**, but **weak** (severely underestimates true remaining steps).
- **$h_{\text{add}}$ (Additive Heuristic)**: $1 + 1 + 1 = 3$. It is **more informative**, but **inadmissible** (may overestimate when actions synergize).
- **$h_{\text{FF}}$ (Fast Forward Heuristic, Hoffmann & Nebel 2001)**: Ignores delete effects, constructs a relaxed planning graph, extracts an explicit relaxed plan, and sets $h_{\text{FF}}(s) = \text{number of actions in relaxed plan}$. It is **highly informed**, though **inadmissible** (greedy extraction can yield longer-than-optimal relaxed plans). Widely used in satisficing planning (e.g., with Greedy Best-First Search).

---

## 3. Domain-Independent Pruning, Subgoal Conflicts, and the Sussman Anomaly

### 3.1 Domain-Independent Pruning Techniques

- **Symmetry Reduction**: Identifies structural symmetries in the state graph (e.g., identical disks in Towers of Hanoi or identical cargo in Air Cargo) and skips equivalent branches, dramatically pruning the state space.
- **Forward Pruning**: Selects a subset of "preferred actions" to expand while discarding others (e.g., Fast Downward). Trade-off: Requires heuristic accuracy; aggressive pruning may miss optimal plans.
- **Serializable Subgoals**: Orders subgoals such that achieving them in sequence never requires undoing previously completed subgoals.

### 3.2 Subgoal Conflicts and the Sussman Anomaly

The **Sussman Anomaly** (Sussman, 1975) illustrates the classic failure of uncoordinated subgoal decomposition in Blocks World.

```
Initial State:                       Goal State:
   +---+                                +---+
   | C |                                | A |
   +---+                                +---+
   | A |        +---+                   | B |        +---+
+--+---+--------+---+--+             +--+---+--------+---+--+
|      Table        | |              |      Table        | |
+----------------------+             +----------------------+
```

- **Conflict Mechanics**:
  - If a planner satisfies `On(A, B)` first, it must later undo this relationship to clear B before placing B on C.
  - If a planner satisfies `On(B, C)` first, it must later undo this relationship to clear C before placing C on A.
- **Resolution**: **Serializable subgoals** compute a valid subgoal ordering (e.g., clear C $\rightarrow$ move C to table $\rightarrow$ move B to C $\rightarrow$ move A to B), preventing plan destruction and backtracking loops.

---

## 4. State Abstraction and Goal Decomposition

### 4.1 State Abstraction Math: Air Cargo Case Study

State Abstraction maps fine-grained ground states into abstract state representations, reducing search cardinality before mapping solutions back to the original space.

```
Full Air Cargo Domain:
10 Airports, 50 Planes, 200 Cargo Pieces
Plane Locations: 10^50 | Cargo Locations: (50 + 10)^200 = 60^200
Total State Space = 10^50 * 60^200 ≈ 10^405 States
                          |
                          v  State Abstraction
Abstracted Air Cargo Domain:
5 Hub Airports, 5 Big Planes, 5 Big Packages
Big Plane Locations: 10^5 | Big Package Locations: (5 + 10)^5 = 15^5
Abstracted State Space = 10^5 * 15^5 ≈ 10^11 States
```

<callout style="info">
<strong>Exponential Cardinality Savings:</strong><br/>
By abstracting 200 individual packages into 5 regional package clusters, the search space drops from $\approx 10^{405}$ states to $\approx 10^{11}$ states. The optimal plan in the abstract space yields an <strong>admissible heuristic</strong> for the original problem.
</callout>

### 4.2 Goal Decomposition & Subgoal Interactions (4-Block Worked Example)

Goal Decomposition splits a complex goal $G = \{g_1, g_2, \dots, g_k\}$ into individual subgoals and estimates costs separately.

Consider 4 blocks A, B, C, D initially all on the table, with goal $G = \{On(A, B), On(C, D)\}$:

```
Initial State:                       Goal State G:
+---+ +---+ +---+ +---+              +---+ +---+
| A | | B | | C | | D |              | A | | C |
+---+ +---+ +---+ +---+              +---+ +---+
+---------------------+              | B | | D |
|       Table         |              +---+ +---+
+---------------------+              +---------+
```

- Subgoal $G_1 = On(A, B) \implies \text{Cost}(P_1) = 2$ steps (`Pickup(A)` $\rightarrow$ `Stack(A, B)`).
- Subgoal $G_2 = On(C, D) \implies \text{Cost}(P_2) = 2$ steps (`Pickup(C)` $\rightarrow$ `Stack(C, D)`).
- Since subgoals $G_1$ and $G_2$ are independent (plans do not interfere):
  - **Max Cost ($\max_i \text{Cost}(P_i)$)**: $\max(2, 2) = 2$. Admissible, but **severely underestimates** true effort (true plan requires 4 steps).
  - **Sum Cost ($\sum_i \text{Cost}(P_i)$)**: $2 + 2 = 4$. Matches the exact true plan cost 4 and remains **admissible under independence**.

<block>
<strong>Subgoal Interactions & Admissibility:</strong><br/>
1. <strong>Positive Interaction (Synergy)</strong>: A single action satisfies multiple subgoals simultaneously $\implies$ Sum Cost overestimates true cost (loses admissibility).<br/>
2. <strong>Negative Interaction (Interference)</strong>: Achieving one subgoal undoes another $\implies$ Sum Cost underestimates true effort (requires extra repair actions).
</block>

---

## 5. Hierarchical Task Networks (HTN), Procedural Knowledge, and Complexity Savings Math

### 5.1 High-Level Actions (HLAs) and Procedural Knowledge

In real-world acting, humans do not plan primitive motor controls from scratch; we reason using **High-Level Actions (HLAs)**.

- **Procedural Knowledge**: Structured domain expertise defining how complex tasks (e.g., `Travel(SFO, JFK)`) decompose into sub-tasks (e.g., `DriveTo(SFO) \rightarrow Fly(SFO, JFK) \rightarrow TaxiTo(Hotel)`).
- **HLA Refinement vs. Non-determinism**: An HLA reaches a goal if **at least one** of its refinements succeeds. The agent deliberately chooses the refinement path (deliberate choice, distinct from stochastic environment non-determinism).

### 5.2 HTN Execution Trace: Going to Changi Airport (`Go(Home, SIN)`)

Consider an agent at Home with $30 cash (`Cash(30)`), aiming to reach Changi Airport (`SIN`):

```
Initial Task: Go(Home, SIN)
      |
      +---> Refinement (1): Drive(Home, SIN)
      |     PRECOND: Have(Car)  ===> PRECONDITION FAILS! (Agent has no car)
      |
      +---> Refinement (2): Taxi(Home, SIN)
            PRECOND: Cash(30)   ===> PRECONDITION SUCCEEDS!
                  |
                  v  Decomposition into Subtasks
            Call-Taxi(Home) ----> Ride(Home, SIN) ----> Pay-Taxi(Home, SIN)
```

Intermediate State Evolution:
- $s_0 = \{\text{At}(\text{Me}, \text{Home}), \text{Cash}(30)\}$ (Initial State)
- $s_1 = \{\text{At}(\text{Me}, \text{Home}), \text{At}(\text{Taxi}, \text{Home}), \text{Cash}(30)\}$ (After `Call-Taxi`)
- $s_2 = \{\text{At}(\text{Me}, \text{SIN}), \text{At}(\text{Taxi}, \text{SIN}), \text{Cash}(30)\}$ (After `Ride`)
- $s_3 = \{\text{At}(\text{Me}, \text{SIN}), \text{At}(\text{Taxi}, \text{SIN}), \text{Cash}(0)\}$ (Final Goal State)

### 5.3 HTN Exponential Savings Math

Consider a problem requiring $d = 30$ primitive action steps:

- **Flat (Non-Hierarchical) Planner**: With branching factor $b = 10$, search complexity is:
  $$\text{Cost}_{\text{Flat}} = O(b^d) = O(10^{30})$$
- **HTN Planner**: With $r = 3$ refinement choices per HLA, expanding into $k = 10$ primitive steps per HLA:
  $$\text{Refinement Steps} = \frac{d - 1}{k - 1} = \frac{30 - 1}{10 - 1} = \frac{29}{9} \approx 3.22$$
  $$\text{Cost}_{\text{HTN}} = O\left(r^{\frac{d - 1}{k - 1}}\right) = O\left(3^{3.22}\right) \approx 34 \text{ Operations}$$

<block>
<strong>Key Mathematical Insight:</strong><br/>
Hierarchical decomposition reduces computational operations from $10^{30}$ down to $\approx 34$. Small refinement branching $r$ with large sub-task expansion $k$ yields massive exponential savings.
</block>

---

## 6. Proving Abstract Solution Properties: Reachable Sets and Approximations

To verify whether a high-level plan guarantees a valid primitive plan without expanding every low-level detail, planners rely on **Reachable Sets Theory**.

```
                       +-----------------------------------+
                       |       Reachable Sets Theory       |
                       +-----------------+-----------------+
                                         |
         +-------------------------------+-------------------------------+
         |                                                               |
+--------v-----------------------+                      +----------------v-----------------------+
| Optimistic Approximation (REACH+) |                      | Pessimistic Approximation (REACH-) |
+--------------------------------+                      +----------------------------------------+
| • Overestimates reachable states|                      | • Underestimates reachable states      |
| • REACH+ ∩ Goal = ∅             |                      | • REACH- ∩ Goal ≠ ∅                    |
|   ⇒ Plan unconditionally FAILS |                      |   ⇒ Plan unconditionally SUCCEEDS      |
| • Safe for EARLY PRUNING       |                      | • Safe for SUCCESS CERTIFICATION       |
+--------------------------------+                      +----------------------------------------+
```

### 6.1 Reachable Sets Definition and Tilde Operators

For a state $s$ and HLA $h$, $\text{REACH}(s, h)$ defines the set of all ground states reachable by **any valid refinement** of $h$. Sequence composition obeys:

$$\text{REACH}(s, [h_1, h_2]) = \bigcup_{s' \in \text{REACH}(s, h_1)} \text{REACH}(s', h_2)$$

To specify HLA effects over sets of implementations, planners use **tilde operators ($\sim$)**:
- $\widetilde{+}A$: "Possibly add $A$" (either leave $A$ unchanged or make it True, depending on refinement choice).
- $\widetilde{-}A$: "Possibly delete $A$".
- $\widetilde{\pm}A$: "Full control over $A$" (can make $A$ True or False).

<callout style="info">
<strong>Downward Refinement Property:</strong><br/>
If a high-level plan reaches the goal state ($\text{REACH}(s, \text{plan}) \cap G \ne \emptyset$), then at least one primitive action refinement of that high-level plan is guaranteed to achieve the goal.
</callout>

### 6.2 Worked 2-Action HLA Schema Proof Example

Consider two HLA schemas $h_1$ and $h_2$:
- $\text{Action}(h_1, \text{PRECOND}: \neg A, \text{EFFECT}: A \land \widetilde{-}B)$ (Adds $A$, possibly deletes $B$)
- $\text{Action}(h_2, \text{PRECOND}: \neg B, \text{EFFECT}: \widetilde{+}A \land \widetilde{\pm}C)$ (Possibly adds $A$, full control over $C$)

Given Initial State $s_0 = \{B\}$ (so $A$ is false, $C$ is false) and Goal $G = \{A, C\}$:
- Does HLA sequence $[h_1, h_2]$ achieve Goal $G$?
- **Proof**:
  1. $h_1$ requires $\neg A$, which holds in $s_0$. The agent selects an implementation of $h_1$ that deletes $B$. The resulting state $s_1$ has $A$ true and $B$ false.
  2. $h_2$ requires $\neg B$, which holds in $s_1$. The agent selects an implementation of $h_2$ that leaves $A$ true and makes $C$ true.
  3. The final state $s_2$ has both $A$ and $C$ true $\implies$ Goal $G$ is satisfied! $[h_1, h_2]$ is a certified valid abstract plan.

### 6.3 Approximate Reachable Sets ($\text{REACH}^+$ and $\text{REACH}^-$)

1. **Optimistic Approximation ($\text{REACH}^+$)**: Overestimates reachable states. If $\text{REACH}^+(s, \text{plan}) \cap G = \emptyset$, the plan **unconditionally fails** and can be safely pruned.
2. **Pessimistic Approximation ($\text{REACH}^-$)**: Underestimates reachable states. If $\text{REACH}^-(s, \text{plan}) \cap G \ne \emptyset$, the plan **unconditionally succeeds**.

Fundamental Inclusion Chain:

$$\text{REACH}^-(s, h) \subseteq \text{REACH}(s, h) \subseteq \text{REACH}^+(s, h)$$

---

## 7. SOTA LLM-Assisted Planning Paradigms & Industrial Solvers

Recent breakthroughs fuse the neuro-symbolic commonsense reasoning of Large Language Models (LLMs) with formal verification, classical search engines, and industrial HTN frameworks.

### 7.1 Hybrid Symbolic + MCTS with LLM Policy (Kwon et al., ICRA 2025)

For complex multi-step planning tasks, *Kwon et al. (ICRA 2025)* introduce a hybrid architecture combining classical planners with MCTS search guided by an LLM:

```
Subproblem P_i  ---> [ Complexity Check ]
                           |
            +--------------+--------------+
            |                             |
  (Moderate Complexity)           (High Complexity)
            |                             |
            v                             v
  +------------------+          +-------------------+
  | Symbolic Planner |          | MCTS + LLM Policy |
  | (Fast Downward)  |          | (GPT-4 Rollout)   |
  +------------------+          +-------------------+
```

- **Switching Criterion**: Subproblems are evaluated via **Minimum Description Length (MDL)** or planning time bounds. Moderately complex subgoals use Fast Downward; highly complex subgoals switch to MCTS-based LLM planning.
- **MCTS Exploration Mechanics**: GPT-4 acts as the rollout policy ($L$-Policy), sampling $n_s$ candidate plans for $P_i$. Candidates define a state tree $T_i$ (states = nodes, actions = edges). MCTS explores $T_i$ via selection, simulation, and backpropagation to reach the target subgoal $S_{i+1}^*$.

### 7.2 LLM-Guided PDDL Creation and Iterative Refinement (Mahdavi et al., NeurIPS 2024)

Generating valid PDDL domains directly from natural language is prone to syntax errors. *Mahdavi et al. (NeurIPS 2024)* introduce an **environment-feedback closed loop**:

- **Empirical Breakthrough**: An LLM equipped with an environmental testing feedback loop achieves a **66% planning success rate**, compared to **GPT-4's 29% intrinsic planning success** using Chain-of-Thought (CoT) alone.
- Pipeline components: Fast Downward planner (modified for TextWorld benchmarks) with validation via **VAL**.

### 7.3 Domain-Specific Heuristic Generation in Python (Corrêa et al., 2025 arXiv)

LLMs analyze PDDL domain specifications and generate Python-coded heuristic functions $h(s)$ plugged into Pyperplan using Greedy Best-First Search (GBFS), drastically reducing expanded nodes compared to domain-independent heuristics.

### 7.4 Generalized Planning Pipeline in PDDL Domains with LLMs (Silver et al., AAAI 2024)

*Silver et al. (AAAI 2024)* leverage GPT-4 prompted with PDDL domain specs and **two sample training tasks**. Using CoT reasoning, GPT-4 synthesizes **domain-specific Python programs** as reusable solvers. Output programs are validated via **VAL** and environment testing, with failures triggering an **automated debugging loop via re-prompting**.

### 7.5 Real-World Robotic & Integrated Complex Systems

- **DELTA**: Task Planning via LLM task decomposition into subgoals for symbolic planners.
- **HVR**: Human-robot collaboration combining LLMs, Retrieval-Augmented Generation (RAG), and formal symbolic validation.
- **HyperTree Planning (HTP)**: Hierarchical planning via structured hypertree outlines guiding LLM multi-step reasoning.
- **SayCan / HiTAMP**: Grounding LLM natural language task decomposition into physical robotic action primitives.

### 7.6 Taxonomy of LLM-Assisted Planning Architectures

```
+-------------------------------------------------------------------------------------------------------------------+
|                                 Taxonomy of LLM-Assisted Planning Architectures                                   |
+----------------------+-----------------------------+-----------------------------------+--------------------+-----+
| Category             | LLM + PDDL Integration      | Key Contribution                  | Planner(s) Used    | Ref |
+----------------------+-----------------------------+-----------------------------------+--------------------+-----+
| Model Creation       | LLM-guided PDDL creation    | Generate & refine PDDL models via | Fast Downward      | Neur|
|                      |                             | feedback (Exploration Walk + VAL) | + VAL              | IPS |
+----------------------+-----------------------------+-----------------------------------+--------------------+-----+
| Task Decomposition & | Task decomposition +        | LLM decomposes tasks; symbolic    | Symbolic PDDL      | ICRA|
| Subgoal Planning     | subgoal planning            | planners / MCTS solve subgoals    | planner + MCTS     | 2025|
+----------------------+-----------------------------+-----------------------------------+--------------------+-----+
| Heuristic Generation | Heuristic generation via LLM| Synthesize domain-specific        | Pyperplan          | ArX |
|                      |                             | heuristics to speed up search     | with GBFS          | iv  |
+----------------------+-----------------------------+-----------------------------------+--------------------+-----+
| General Planning     | Generalized planning via LLM| LLM learns reusable strategies    | Strategy synthesis /| AAAI|
|                      |                             | and generates solver-like code    | Python Solvers     | 2024|
+----------------------+-----------------------------+-----------------------------------+--------------------+-----+
```

### 7.7 Industrial Frameworks & HTN Solvers

1. **The PANDA Framework (Uni Ulm)**: Planning and Acting in a Network Decomposition Architecture.
   - `PANDApss`: Heuristic plan space search combining HTN and Partial-Order Causal Link (POCL) planning.
   - `PANDApro`: Heuristic progression search for HTN.
   - `PANDAtotSAT`: Solves totally ordered HTN planning via reduction to Propositional Satisfiability (SAT).
   - `PANDADealer`: Winner in HTN categories at the International Planning Competition (IPC 2023, ICAPS 2023 Proc.).
2. **HDDL Specification**: Hierarchical Domain Definition Language (AAAI 2020, KI 2021)—the standard language extension to PDDL for expressing hierarchical planning problems.
3. **AIPlanning4EU Project (`unified-planning`)**: An open-source Python library unifying classical and hierarchical planning engines under a standardized API, making automated planning accessible across robotics, logistics, agriculture, and subsea operations.

---

## 8. Summary: From Classical to Modern Planning & Uncertainty Transition

### 8.1 Enduring Relevance of Classical Planning

Classical symbolic planning remains essential across high-stakes industries:
- **Robotics & Autonomous Manipulation** (SayCan, HiTAMP, HVR)
- **Logistics & Automated Fleet Dispatch** (AIPlanning4EU)
- **Space Mission Planning & Satellite Autonomy** (Mars 2020 Rover, Estlin et al., ICRA 2007; Rabideau et al., i-SAIRAS 2020)
- **Commercial Video Game AI** (Neufeld et al., IEEE TOG 2019)
- **Enterprise Operations & Multi-Agent Coordination** (Sohrabi et al., IJCAI 2019; DELTA)

### 8.2 The Four-Stage Evolutionary Trajectory

```
+------------------+     +------------------------+     +------------------------+     +------------------------+
| 1. Model         |     | 2. State Abstraction   |     | 3. Hierarchical        |     | 4. Neuro-Symbolic      |
|    Relaxations   | --> |    & Goal Decomposition| --> |    Decomposition (HTN) | --> |    LLM Integration     |
| (h_FF, h_max)    |     | (Air Cargo 10^405->10^11|     | (HLAs, O(b^d)->O(r^k)) |     | (PDDL Gen, Python H(s))|
+------------------+     +------------------------+     +------------------------+     +------------------------+
```

### 8.3 The Next Frontier: Sequential Decision Making Under Uncertainty

While classical planning assumes full observability, determinism, and static environments, real-world environments involve **noisy sensors, incomplete information, and stochastic dynamics**. Goals frequently require trade-offs among user preferences, risk, and computational utility.

This sets the stage for sequential decision making under uncertainty:
- **Utility Theory** (modeling preference and risk under uncertainty)
- **Markov Decision Processes (MDPs & POMDPs)** (probabilistic state transitions and partial observability)
- **Reinforcement Learning (RL)** (learning optimal policies directly from environment interaction)

<reviewkit>
<takeaways>
- **Search vs. Inference Heuristics:** Search planners use explicit $h(s)$ functions; inference solvers (SAT/CSP) rely on internal variable choice (VSIDS) and propagation strategies.
- **8-Puzzle & Relaxation:** Ignoring preconditions yields Misplaced Tiles ($h_{\text{misplaced}}$); ignoring delete effects yields Manhattan Distance. $h_{\max} = 1$ is admissible but weak; $h_{\text{FF}}$ extracts relaxed plan length.
- **Abstraction & Subgoal Independence:** Air Cargo abstraction reduces states from $10^{405}$ to $10^{11}$. Goal decomposition with independent subgoals makes Sum Cost exact and admissible.
- **HTN Complexity & State Traces:** HTNs reduce flat search costs from $O(10^{30})$ down to $O(34)$ operations. Changi Airport trace details $s_0 \rightarrow s_1 \rightarrow s_2 \rightarrow s_3$.
- **Reachable Sets & Tilde Proofs:** Inclusion chain $\text{REACH}^- \subseteq \text{REACH} \subseteq \text{REACH}^+$. Tilde operators ($\widetilde{+}A, \widetilde{-}A, \widetilde{\pm}A$) enable formal proof of abstract plan correctness.
- **Industrial Frameworks:** PANDA (`PANDADealer` IPC 2023 winner), HDDL specification, and AIPlanning4EU (`unified-planning`).
- **Neuro-Symbolic LLM Planning:** Environment feedback boosts LLM PDDL planning success to 66% vs 29% (NeurIPS 2024); hybrid symbolic + MCTS with LLM rollout policy (ICRA 2025); Silver et al. (AAAI 2024) generate Python solvers via re-prompting debugging; systems like DELTA, HVR, HTP, SayCan, and HiTAMP bridge LLMs with real-world robotics.
- **Next Steps:** Real-world stochasticity leads from deterministic classical planning to Utility Theory, MDPs, and Reinforcement Learning.
</takeaways>
<qprompt/>
</reviewkit>

## References

1. Hoffmann, J., & Nebel, B. (2001). The FF planning system: Fast plan generation through heuristic search. *Journal of Artificial Intelligence Research*, 14, 253-302.
2. Nau, D., Au, T. C., Ilghami, O., Kuter, U., Murdock, J. W., Wu, D., & Yaman, F. (2003). SHOP2: An HTN planning system. *Journal of Artificial Intelligence Research*, 20, 379-404.
3. Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4th ed.). Pearson.
4. Helmert, M. (2006). The Fast Downward planning system. *Journal of Artificial Intelligence Research*, 26, 191-246.
5. Mahdavi, S., et al. (2024). LLM-guided PDDL creation and refinement with environment feedback. *Advances in Neural Information Processing Systems (NeurIPS 2024)*.
6. Kwon, et al. (2025). Hybrid symbolic and MCTS planning with LLMs. *IEEE International Conference on Robotics and Automation (ICRA 2025)*.
7. Corrêa, A. B., et al. (2025). Heuristic generation via large language models. *arXiv preprint*.
8. Silver, T., Dan, S., Srinivas, K., Tenenbaum, J. B., Kaelbling, L., & Katz, M. (2024). Generalized planning in PDDL domains with pretrained large language models. *Proceedings of the AAAI Conference on Artificial Intelligence*, 38(18), 20241-20249.
9. Ahn, M., et al. (2022). Do as I can, not as I say: Grounding language in robotic affordances (SayCan). *arXiv preprint arXiv:2204.01691*.
10. Höller, D., et al. (2020). HDDL: An extension to PDDL for expressing hierarchical planning problems. *Proceedings of the AAAI Conference on Artificial Intelligence*, 34(06), 9883-9891.
11. Höller, D. (2026). Learning heuristic functions for HTN planning. *Proceedings of the AAAI Conference on Artificial Intelligence*, 40(43), 36262–36270.
12. Neufeld, X., et al. (2019). Building a planner: A survey of planning systems used in commercial video games. *IEEE Transactions on Games*, 11(2), 91-108.
13. Sohrabi, S. (2019). AI planning for enterprise: Putting theory into practice. *Proceedings of the 28th International Joint Conference on Artificial Intelligence (IJCAI 2019)*, 6408-6410.
14. Estlin, T., et al. (2007). Increased Mars rover autonomy using AI planning, scheduling and execution. *IEEE International Conference on Robotics and Automation (ICRA 2007)*.
15. Rabideau, G., et al. (2020). Onboard automated scheduling for the Mars 2020 Rover. *International Symposium on Artificial Intelligence, Robotics and Automation for Space (i-SAIRAS 2020)*.
