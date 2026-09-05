<meta>
Title: Classical AI Planning: STRIPS, PDDL, State-Space Search, SATPlan, and Complexity Bounds
Summary: An exhaustive master technical note on Classical AI Planning theory, representation, search, and logic-based reduction based on NUS CS4246/CS5446. Covers symbolic agent architectures, PDDL and STRIPS semantics, Closed-World Assumption (CWA), Unique Names Assumption (UNA), model-theoretic goal entailment (s |= g, M(s) <= M(g)), action schemas, preconditions, ADD and DEL fluents, successor state mechanics, and the Frame Problem. Details complete executable PDDL code for both flight_domain and air-cargo domains. Compares forward progression search with backward regression search (2^n ground state space vs 3^n partial state description space) and Most General Unifiers (MGU). Formulates Boolean Satisfiability (SAT) reduction via SATPlan, featuring the complete 'Eat a Cake!' worked example, proving how Successor-State Axioms resolve the frame problem in O(n) clauses instead of O(mn), alongside Action Exclusion Axioms. Concludes with formal proofs and analysis of algorithmic properties (soundness, completeness, optimality), computational complexity bounds (PlanSAT PSPACE-complete vs Bounded PlanSAT NP-complete), real-world industrial systems, AIPlanning4EU, and IPC 2023 competitions.
Slug: classical-planning-models-search-and-inference
Output: notes/classical-planning-models-search-and-inference/classical-planning-models-search-and-inference.html
CanonicalId: classical-planning-models-search-and-inference
Style: default
EstimatedReadingTime: true
Lang: en
Tags: classical planning, strips, pddl, satplan, automated reasoning
Status: drafting
Published: 2026-08-19
LastModified: 2026-09-05
</meta>
<draft>
- 1. Foundations of Classical Planning & Symbolic Agent Architecture
    - Importance: Establishes agent definition, representation, and reasoning capabilities on solid logical reasoning ground.
    - World Modeling & Verification: Gives meaningful representations of what the agent is modeling in the world, providing methods to establish truth values and validate inference algorithm soundness.
    - 4 Core Environment Assumptions: Discrete, Deterministic, Static, Fully Observable.
    - Physical Reasoning Challenges & DeepMind PushWorld: Dynamic spatial puzzles, friction, and obstacle manipulation.
- 2. State Representation and Database Semantics
    - Factored State Representation: The world is modeled via state variables known as fluents (properties that change over time).
    - State Definition: A state is a conjunction of ground function-free atomic fluents (predicates with constant arguments only, no function symbols), or equivalently a set of true fluents.
    - Closed-World Assumption (CWA): Any fluent not explicitly listed in the state set is assumed to be false (e.g., Fierce(CS3263_Lecturer) is false).
    - Unique Names Assumption (UNA): Distinct constant symbols refer to distinct real-world entities (e.g., Plane1 != Plane2).
- 3. Goal Representation and Model-Theoretic Entailment
    - Goal Definition: A goal is a partially specified state written as a conjunction of literals; unmentioned fluents can take any truth value.
    - State Satisfaction (s |= g): A state s satisfies a goal g if s entails g (s |= g, or M(s) <= M(g)—meaning in every model where s is true, g is automatically true).
    - Variable Treatment: Variables appearing in goal specifications are treated as existentially quantified.
    - STRIPS Restriction: Standard STRIPS restricts goals strictly to positive, ground literals without variables.
- 4. Action Schemas, Grounding, and State Transitions
    - Action Schemas: Parameterized lifted representations defining families of actions using universally quantified variables.
    - Grounded Actions: Concrete action instances where variables are substituted with specific domain objects.
    - Action Structure: Preconditions (conditions that must hold prior to action execution) and Effects (ADD fluents and DEL fluents).
    - Applicability Condition: Action a is applicable in state s if and only if s entails the preconditions of a (s |= Precond(a)).
    - Successor State Formula: s' = (s \ DEL(a)) U ADD(a).
    - The Frame Problem: Specifying what changes after an action without restating everything that remains unchanged. PDDL/STRIPS resolves this via inertia assumption (unmentioned fluents persist).
- 5. Executable PDDL Domain and Problem Specifications
    - Case Study 1: Complete PDDL Flight Domain and Problem (flight_domain & flight_problem).
    - Case Study 2: Complete PDDL Air-Cargo Domain and Problem.
    - Action Grounding & Spurious Action Prevention: Handling parameter substitutions and avoiding self-referential actions like Fly(P1, SFO, SFO) via inequality constraints.
- 6. Planning as State-Space Search (Progression vs. Regression)
    - Graph Mapping: Graph search over state space. Nodes = ground world states, Edges = grounded actions, Root = initial state, Goal test = s |= g.
    - Forward Progression Search: Step-by-step progression from initial state s0 to goal. State space size is 2^n.
    - Backward Regression Search: Regressing goal descriptions backwards through action effects.
    - Relevance Conditions: ADD(a) intersects goal != empty; DEL(a) intersects goal = empty.
    - Most General Unifiers (MGU): Unifying lifted action effects with goal literals to avoid over-branching.
    - State Space Cardinality Comparison: 2^n concrete states vs 3^n partial state descriptions.
- 7. Planning as Logical Inference: SATPlan and Satisfiability Reduction
    - Propositional Encoding: Mapping planning problem to Conjunctive Normal Form (CNF) over time steps t = 0, 1, ..., k.
    - SATPlan Algorithm Execution Flow: Iterative horizon search checking CNF satisfiability via SAT solver.
    - Frame Problem Resolution in SAT:
        - Naive Frame Axioms: Require O(m * n) clauses for m actions and n fluents.
        - Successor-State Axioms (Reiter): F^{t+1} <=> PosAction^t v (F^t ^ ~NegAction^t), reducing clause complexity to O(n).
        - Action Exclusion Axioms: Mutual exclusion clauses (~a1^t v ~a2^t) preventing conflicting parallel execution.
    - Complete Worked Proof: "Eat a Cake!" (Have cake and eat it too) at horizon T=2.
- 8. Real-World Applications, Industrial Ecosystem & Competitions
    - 7 Key Domains: Logistics, Enterprise, Robotics, Healthcare, Gaming, Space Missions (Mars 2020 Rover), Real-Time Decision Support.
    - AIPlanning4EU Project: Unified Planning Library (unified-planning).
    - International Planning Competition (IPC 2023): Apptainer containers, solvers (Ragnarok, DecStar-2023, Scorpion).
- 9. Algorithmic Properties & Computational Complexity Bounds
    - Soundness, Completeness, Optimality definitions.
    - PlanSAT Problem: Deciding whether a valid plan of any length exists -> PSPACE-Complete. Proof intuition via polynomial-space simulation of deterministic Turing Machines.
    - Bounded PlanSAT Problem: Deciding whether a valid plan of length <= k exists -> NP-Complete. Polynomial reduction to Boolean Satisfiability (SAT).
- 10. Roadmap to Modern Planning & Uncertainty
    - Transition from classical planning to decision-making under uncertainty: Utility Theory, Markov Decision Processes (MDPs), and Reinforcement Learning (RL).
</draft>

# Classical AI Planning: STRIPS, PDDL, State-Space Search, SATPlan, and Complexity Bounds

In Artificial Intelligence (AI) and autonomous systems, **Classical Planning** establishes the foundational mathematical formulation for deliberative agent action. By representing the state of the world, action preconditions, and environmental transitions through formal logic, planning systems synthesize guaranteed action trajectories to achieve designated goal states from an initial configuration.

This technical note provides an exhaustive analysis of classical automated planning. We systematically explore symbolic agent foundations, Planning Domain Definition Language (<information context="Planning Domain Definition Language">PDDL</information>) syntax and semantics, Closed-World (CWA) and Unique Names (UNA) database semantics, and model-theoretic goal entailment ($s \models g$). We then analyze state-space graph search, contrasting forward progression with backward regression across their respective combinatorial spaces ($2^n$ vs. $3^n$). Next, we examine logic-based satisfiability reduction via **SATPlan**, demonstrating how **Successor-State Axioms** resolve the Frame Problem in $\mathcal{O}(n)$ clauses instead of $\mathcal{O}(mn)$, illustrated by the complete **"Eat a Cake!"** worked proof. Finally, we evaluate real-world industrial deployments, the **AIPlanning4EU** and **IPC 2023** benchmarks, formal algorithmic guarantees (soundness, completeness, optimality), and computational complexity proofs ($\text{PlanSAT} \in \text{PSPACE-Complete}$ vs. $\text{Bounded PlanSAT} \in \text{NP-Complete}$).

---

## 1. Foundations of Classical Planning & Symbolic Agent Architecture

### 1.1 Why are Symbolic Agents Important?

Before deep learning and probabilistic models, **Symbolic Agents** defined the rigorous baseline for artificial intelligence:
- **Solid Ground of Logical Reasoning**: Establishes agent definitions, state representations, and reasoning capabilities on mathematical logic (Propositional and First-Order Logic).
- **Meaningful World Modeling**: Gives clear semantics to what the agent is modeling in real-world environments.
- **Truth-Value & Inference Validation**: Provides explicit methods to evaluate truth values ($s \models g$) and prove whether inference algorithms are valid.

### 1.2 The Four Core Classical Planning Assumptions

Classical automated planning abstracts the real world into an idealized mathematical formulation defined by four core environmental assumptions:

```
+-------------------------------------------------------------------+
|               Classical Planning Environmental Taxonomy           |
+-------------------------------------------------------------------+
|  1. Discrete          • Time steps, states, and actions are       |
|                       |  quantized into distinct, countable units.|
|  2. Deterministic     • Applying action a in state s produces an  |
|                       |  exact, 100% predictable successor state. |
|  3. Static            • The environment changes exclusively via   |
|                       |  agent actions (no exogenous dynamics).   |
|  4. Fully Observable  • The agent has complete, noise-free access |
|                       |  to all world state features at all times.|
+-------------------------------------------------------------------+
```

These assumptions eliminate stochastic uncertainty and perceptual noise, allowing planning systems to focus entirely on **combinatorial synthesis**—discovering an optimal or satisficing path through astronomically large state spaces.

### 1.3 Physical Reasoning and Current Challenges: DeepMind PushWorld

While classical planning assumptions provide a tractable foundation for discrete symbolic problems, real-world physical environments present complex physical constraints.

A prominent benchmark illustrating this boundary is the **DeepMind PushWorld** challenge (`https://deepmind-pushworld.github.io/play/`). In PushWorld, an agent must navigate grid mazes to push puzzle blocks into target configurations:
- Physical obstacles and friction dynamics mean that actions have non-local, irreversible consequences.
- Pushing a block into a corner creates a permanent dead-end state from which no valid plan exists.
- The challenge demonstrates why automated planning requires rigorous state-transition models: purely intuitive, pattern-matching models fail to anticipate multi-step physical collisions without explicit lookahead search.

---

## 2. State Representation and Database Semantics

### 2.1 Factored State Representation & Atomic Fluents

Unlike uninformed graph search algorithms (e.g., Dijkstra) that treat states as arbitrary, opaque integers, classical planners employ a **Factored State Representation**. The world is modeled via an explicit set of state variables known as **Fluents** (propositions whose truth values vary across time).

Formally, a concrete state $s$ is represented as a conjunction of **Ground Function-Free Atomic Fluents**:
- **Atomic**: A predicate symbol applied to object terms (e.g., $\text{At}(\text{Plane1}, \text{SFO})$).
- **Ground**: All argument positions are occupied by concrete object constants; no unbound variables exist.
- **Function-Free**: Fluents contain no recursive function symbols (e.g., $\text{FatherOf}(x)$ is disallowed), guaranteeing a strictly finite state universe.

```
Logical Statement Conjunction                     Factored Set of True Fluents (S)
---------------------------------------------     -----------------------------------------------
Hungry ∧ Sleepy                                   S = { Hungry, Sleepy }
New(Plane1) ∧ Safe(Plane1)                        S = { New(Plane1), Safe(Plane1) }
At(Plane1, SIN) ∧ At(Plane2, SFO)                 S = { At(Plane1, SIN), At(Plane2, SFO) }
```

### 2.2 Database Semantics: CWA and UNA

To prevent combinatorial explosion when specifying world states, classical planners adopt two fundamental database semantics:

<block>
<strong>1. Closed-World Assumption (CWA):</strong><br/>
Any ground fluent not explicitly enumerated in the state set $s$ is mathematically assumed to be <strong>False</strong>. If <code>Fierce(CS3263_Lecturer)</code> is omitted from state set $s$, it is automatically evaluated as false. This eliminates the catastrophic overhead of storing millions of negative literals.<br/><br/>
<strong>2. Unique Names Assumption (UNA):</strong><br/>
Every distinct constant symbol refers to a distinct physical entity in the domain (i.e., <code>Plane1 ≠ Plane2</code>). Constants cannot be aliases for the same object.
</block>

---

## 3. Goal Representation and Model-Theoretic Entailment

### 3.1 Partial State Goal Specifications

In classical planning, a **Goal ($g$)** is not required to be a complete world state. Instead, $g$ is a **partially specified state** represented as a conjunction of positive (and optionally negative) literals. Unmentioned fluents are unconstrained and can assume any truth value.

### 3.2 Model-Theoretic Entailment ($s \models g$)

A world state $s$ satisfies a goal condition $g$ if and only if state $s$ **logically entails** goal $g$:

$$s \models g \iff M(s) \subseteq M(g)$$

Where $M(\alpha)$ denotes the set of all satisfying models of sentence $\alpha$:
- **Model Inversion Intuition**: A concrete state $s$ specifies the truth value of every fluent, making $M(s)$ a tiny singleton set (or small subset). A goal $g$ leaves many fluents unspecified, making $M(g)$ a large set containing all possible worlds that satisfy $g$.
- Therefore, $s \models g$ holds if every model that satisfies state $s$ also satisfies goal $g$ ($M(s) \subseteq M(g)$).

```
Model Entailment Examples:
1. Hungry ∧ Sleepy ∧ Bored  ⊨  Hungry ∧ Bored
2. At(Cargo1, SFO)          ⊨  At(c, SFO)  under substitution θ = { c / Cargo1 }
```

- **Variables in Goals**: Variables in goals are treated as **existentially quantified** ($\exists p. \text{At}(P_1, \text{SIN}) \land \text{At}(p, \text{SFO}) \land \text{Plane}(p)$).
- **STRIPS Restriction**: Standard STRIPS restricts goals strictly to positive, ground literals without variables.

---

## 4. Action Schemas, Grounding, and State Transitions

### 4.1 Lifted Action Schemas

An action schema defines a broad family of state transitions using universally quantified variables. A standard schema consists of:
1. **Action Name and Parameter List**: Lifted variable declarations.
2. **Preconditions ($\text{Precond}(a)$)**: A conjunction of literals that must hold in state $s$ prior to action execution.
3. **Effects ($\text{Effect}(a)$)**: The deterministic updates applied to state $s$, partitioned into:
   - **ADD Fluents ($\text{ADD}(a)$)**: Fluents made **True** by the action (positive effects).
   - **DEL Fluents ($\text{DEL}(a)$)**: Fluents made **False** by the action (negative effects).

```
Action Schema:
Action(Fly(p, from, to))
  PRECOND: At(p, from) ∧ Plane(p) ∧ Airport(from) ∧ Airport(to)
  EFFECT : ¬At(p, from) ∧ At(p, to)
```

### 4.2 Action Applicability and Successor State Computation

A grounded action $a$ is **applicable** in concrete state $s$ if and only if state $s$ entails its preconditions:

$$a \text{ is applicable in } s \iff s \models \text{Precond}(a)$$

Applying applicable action $a$ to state $s$ yields the successor state $s'$ via set-theoretic updates:

$$s' = \delta(s, a) = (s \setminus \text{DEL}(a)) \cup \text{ADD}(a)$$

```
  Current State (s)
+---------------------------------------------------+
| At(P1, SFO) ∧ Plane(P1) ∧ Airport(SFO) ∧ Airport(SIN)|
+---------------------------------------------------+
                          |
                          |  Action: Fly(P1, SFO, SIN)
                          |  DEL: { At(P1, SFO) }
                          |  ADD: { At(P1, SIN) }
                          v
  Successor State (s')
+---------------------------------------------------+
| At(P1, SIN) ∧ Plane(P1) ∧ Airport(SFO) ∧ Airport(SIN)|
+---------------------------------------------------+
```

### 4.3 Resolving the Frame Problem

<callout style="warning">
<strong>The Classical Frame Problem:</strong><br/>
In first-order logic, an axiom specifying that an action changes fluent $P$ does not imply that unrelated fluent $Q$ remains unchanged. Stating all non-changes explicitly requires an unmanageable $\mathcal{O}(m \cdot n)$ frame axioms (for $m$ actions and $n$ fluents).<br/>
<strong>The STRIPS / PDDL Resolution:</strong><br/>
Classical planning circumvents the frame problem via the <strong>Inertia Assumption</strong>: any fluent not explicitly mentioned in $\text{ADD}(a)$ or $\text{DEL}(a)$ persists into successor state $s'$ with its truth value unchanged.
</callout>

---

## 5. Executable PDDL Domain and Problem Specifications

### 5.1 Case Study 1: The Flight Domain (`flight_domain`)

A clean, minimalist PDDL domain modeling aircraft flight between airports:

```lisp
;; =================================================================
;; Flight Domain Specification
;; =================================================================
(define (domain flight_domain)
  (:requirements :strips :typing)
  
  (:types 
    plane 
    airport)
  
  (:predicates 
    (At ?p - plane ?a - airport)
    (Plane ?p - plane)
    (Airport ?a - airport))
  
  (:action Fly
    :parameters (?p - plane ?from - airport ?to - airport)
    :precondition (and (At ?p ?from) 
                       (Plane ?p) 
                       (Airport ?from) 
                       (Airport ?to))
    :effect (and (not (At ?p ?from)) 
                 (At ?p ?to))))
```

```lisp
;; =================================================================
;; Flight Problem Specification
;; =================================================================
(define (problem flight_problem)
  (:domain flight_domain)
  
  (:objects 
    P1 P2 - plane
    SFO SIN - airport)
  
  (:init
    (At P1 SFO)
    (At P2 SIN)
    (Plane P1)
    (Plane P2)
    (Airport SFO)
    (Airport SIN))
  
  (:goal 
    (and (At P1 SIN) 
         (not (At P1 SFO))
         (At ?p SFO) 
         (Plane ?p))))
```

### 5.2 Case Study 2: The Air-Cargo Domain (`air-cargo`)

The complete, standard PDDL formulation for the Air-Cargo logistics domain:

```lisp
(define (domain air-cargo)
  (:requirements :strips :typing)
  
  (:types 
    plane 
    airport 
    cargo)
  
  (:predicates
    (At ?x - (either plane cargo) ?a - airport)
    (In ?c - cargo ?p - plane)
    (Cargo ?c - cargo)
    (Plane ?p - plane)
    (Airport ?a - airport)
  )

  (:action Load
    :parameters (?c - cargo ?p - plane ?a - airport)
    :precondition (and (At ?c ?a) (At ?p ?a) (Cargo ?c) (Plane ?p) (Airport ?a))
    :effect (and (not (At ?c ?a)) (In ?c ?p))
  )

  (:action Unload
    :parameters (?c - cargo ?p - plane ?a - airport)
    :precondition (and (In ?c ?p) (At ?p ?a) (Cargo ?c) (Plane ?p) (Airport ?a))
    :effect (and (At ?c ?a) (not (In ?c ?p)))
  )

  (:action Fly
    :parameters (?p - plane ?from - airport ?to - airport)
    :precondition (and (At ?p ?from) (Plane ?p) (Airport ?from) (Airport ?to))
    :effect (and (not (At ?p ?from)) (At ?p ?to))
  )
)
```

```lisp
(define (problem air-cargo-problem)
  (:domain air-cargo)
  (:objects
    C1 C2 - cargo
    P1 P2 - plane
    SFO JFK - airport
  )
  
  (:init
    (At C1 JFK)
    (At C2 JFK)
    (At P1 JFK)
    (At P2 SFO)
  )
  
  (:goal (and
    (At C1 SFO)
    (At C2 SFO)
  ))
)
```

### 5.3 Grounding Analysis and Preventing Spurious Actions

When compiling a lifted PDDL domain into grounded actions:
- For objects $|\text{Cargo}|=2, |\text{Plane}|=2, |\text{Airport}|=2$:
  - $\text{Load}$: $2 \times 2 \times 2 = 8$ grounded actions.
  - $\text{Unload}$: $2 \times 2 \times 2 = 8$ grounded actions.
  - $\text{Fly}$: $2 \times 2 \times 2 = 8$ grounded actions (including self-flights like $\text{Fly}(\text{P1}, \text{JFK}, \text{JFK})$).
- **Spurious Action Elimination**: To prevent redundant self-flights, domain designers add inequality constraints `(not (= ?from ?to))` to action preconditions, pruning the action branch space upfront.

---

## 6. Planning as State-Space Search: Forward Progression vs. Backward Regression

Planning problems map directly to directed graph search over world states:
- **Nodes**: Complete ground states $s \in S$.
- **Root Node**: The initial state $s_0$.
- **Edges**: Applicable grounded actions $a$.
- **Goal Test**: Verifying whether node state $s$ entails goal $g$ ($s \models g$).
- **Path Solution**: A valid sequence of actions $[a_1, a_2, \dots, a_k]$ transforming $s_0$ into a goal-satisfying state $s_k$.

```
Forward Progression Search                    Backward Regression Search
+------------------------------------+        +------------------------------------+
| Initial State s0                   |        | Goal Description g                 |
|   |-- Action a1 (Forward Transition)|        |   |-- Regress Action a (Relevant)   |
|   v                                |        |   v                                |
| State s1 = (s0 \ DEL) U ADD        | =====> | Subgoal g' = (g \ ADD(a)) U Precond|
|   |-- Action a2                    |        |   |-- Regress Action a'            |
|   v                                |        |   v                                |
| State s2 |= Goal g (Goal Met!)    |        | State s0 |= g_final (Root Met!)    |
+------------------------------------+        +------------------------------------+
```

### 6.1 Forward Progression Search Algorithm

**Progression Search** starts at the initial state $s_0$ and explores forward toward the goal:
1. Initialize search queue with root state node $s_0$.
2. Pop current state node $s$. If $s \models g$, return the action path (Plan Found).
3. Find all applicable grounded actions $a$ where $s \models \text{Precond}(a)$.
4. For each applicable action $a$, compute successor state $s' = (s \setminus \text{DEL}(a)) \cup \text{ADD}(a)$.
5. Add child nodes $s'$ to search queue (guided by BFS, DFS, $A^*$, or Greedy Best-First Search).

### 6.2 Backward Regression Search Algorithm

**Regression Search** starts at goal set $g$ and works backward toward initial state $s_0$:

#### Relevance Condition
An action $a$ is **relevant** to a current goal description $g$ if and only if:
1. Action $a$ achieves at least one literal in $g$: $\text{ADD}(a) \cap g \neq \emptyset$.
2. Action $a$ does not destroy any literal required by $g$: $\text{DEL}(a) \cap g = \emptyset$.

#### Goal Regression Formulas
The regressed description $g'$ prior to executing relevant action $a$ is:

$$\text{POS}(g') = (\text{POS}(g) \setminus \text{ADD}(a)) \cup \text{POS}(\text{Precond}(a))$$

$$\text{NEG}(g') = (\text{NEG}(g) \setminus \text{DEL}(a)) \cup \text{NEG}(\text{Precond}(a))$$

#### Step-by-Step Regression Worked Examples
- **Example 1**: Goal $g = \{ \text{At}(C_2, \text{SFO}) \}$, relevant action $\text{Unload}(c, p, a)$, substitution $\theta = \{ c/C_2, a/\text{SFO} \}$. The regressed goal is:
  $$g' = \text{In}(C_2, p') \land \text{At}(p', \text{SFO}) \land \text{Cargo}(C_2) \land \text{Plane}(p') \land \text{Airport}(\text{SFO})$$
- **Example 2**: Goal $g = \{ \text{At}(C_1, \text{SFO}) \}$, action $\text{Unload}(C_1, P_1, \text{SFO})$.
  - Subtract ADD set: $\{ \text{At}(C_1, \text{SFO}) \} \setminus \{ \text{At}(C_1, \text{SFO}) \} = \emptyset$.
  - Add Preconditions: $\{ \text{In}(C_1, P_1), \text{At}(P_1, \text{SFO}) \}$.
  - Regressed Subgoal: $g' = \{ \text{In}(C_1, P_1), \text{At}(P_1, \text{SFO}) \}$.

### 6.3 Most General Unifiers (MGU) in Lifted Regression

In lifted regression search, goals contain variables. When unifying a goal literal $L_g$ with an action effect literal $L_e$, regression computes the **Most General Unifier (MGU)** $\theta$:

$$\text{MGU}(L_g, L_e) = \theta \implies L_g \theta = L_e \theta$$

Using MGUs postpones concrete variable bindings, avoiding arbitrary ground action expansion until required by domain constraints.

### 6.4 State-Space Cardinality Comparison: $2^n$ vs. $3^n$

| Search Direction | State Representation | Search Space Cardinality | Advantages & Trade-offs |
| :--- | :--- | :--- | :--- |
| **Forward Progression** | Full concrete states (every fluent is True or False) | **$2^n$** concrete states | • Fully specified states allow easy heuristic evaluation ($h(s)$).<br/>• High branching factor due to irrelevant actions. |
| **Backward Regression** | Partial state descriptions (fluents are True, False, or Unspecified) | **$3^n$** partial descriptions | • Focuses strictly on actions relevant to goal fluents.<br/>• Harder to design powerful domain-independent heuristics for partial states. |

---

## 7. Planning as Logical Inference: SATPlan and Satisfiability Reduction

Rather than searching state space graphs, **SATPlan** (Kautz & Selman, 1992) translates classical planning problems into **Conjunctive Normal Form (CNF)** propositional logic formulas, solving them via state-of-the-art Boolean Satisfiability (SAT) solvers.

```
+-------------------------------------------------------------------+
|                   SATPlan Reduction Pipeline                      |
+-------------------------------------------------------------------+
|  PDDL Domain & Problem  ===>  Bound Horizon Step T = 0, 1, 2...   |
|                                         |                         |
|                                         v                         |
|  [ SAT Decoder / Plan ] <===  [ Propositional CNF Formula Phi_T ] |
|  (Extract Action Execution)   (Initial + Transitions + Frame + Goal)|
+-------------------------------------------------------------------+
```

### 7.1 Propositional Variable Mapping Across Time Steps

For a bounded plan horizon $T = k$, SATPlan creates timed propositional variables for every ground fluent and action:
- $F^t$: Ground fluent $F$ is True at time step $t \in \{0, 1, \dots, k\}$.
- $A^t$: Ground action $A$ is executed at time step $t \in \{0, 1, \dots, k-1\}$.

### 7.2 The SATPlan CNF Formula Structure

The complete propositional logic formula $\Phi_k$ for horizon $k$ is a conjunction of five clause groups:

$$\Phi_k = \text{Init}^0 \land \text{PrecondClauses} \land \text{EffectClauses} \land \text{FrameClauses} \land \text{Goal}^k$$

1. **Initial State ($\text{Init}^0$)**: Asserts true fluents as positive unit clauses and unmentioned fluents as negative unit clauses at $t=0$:
   $$F_1^0 \land F_2^0 \land \neg F_3^0 \land \dots$$
2. **Action Preconditions**: Executing action $A^t$ implies its preconditions hold at time $t$:
   $$A^t \implies P^t \iff (\neg A^t \lor P^t)$$
3. **Action Effects**: Executing action $A^t$ implies its ADD fluents are true and DEL fluents are false at time $t+1$:
   $$A^t \implies (ADD^{t+1} \land \neg DEL^{t+1}) \iff (\neg A^t \lor ADD^{t+1}) \land (\neg A^t \lor \neg DEL^{t+1})$$

### 7.3 Resolving the Frame Problem: Successor-State Axioms

A naive approach to frame axioms requires specifying that if fluent $F$ is true at $t$ and action $A$ (which doesn't delete $F$) occurs, $F$ remains true at $t+1$. For $m$ actions and $n$ fluents, this requires $\mathcal{O}(m \cdot n)$ clauses.

#### Successor-State Axioms (Reiter, 1991)
SATPlan uses **Successor-State Axioms** to combine all cause actions for fluent $F$ into a single bi-conditional clause, reducing frame clause complexity to **$\mathcal{O}(n)$**:

$$F^{t+1} \iff \text{PosActions}^t(F) \lor (F^t \land \neg \text{NegActions}^t(F))$$

where:
- $\text{PosActions}^t(F)$ is a disjunction of all actions that ADD fluent $F$ at step $t$.
- $\text{NegActions}^t(F)$ is a disjunction of all actions that DEL fluent $F$ at step $t$.

### 7.4 Action Mutual Exclusion Axioms

To prevent invalid parallel executions (e.g., flying a plane to SFO while simultaneously loading cargo into it at JFK), SATPlan asserts **Action Exclusion Axioms** for conflicting action pairs $A_1$ and $A_2$:

$$\neg A_1^t \lor \neg A_2^t$$

### 7.5 Complete Worked Proof: "Eat a Cake!" (Have Cake and Eat it Too)

Consider the classic puzzle where an agent desires to eat a cake and still have the cake:

```
Initial State: {}  (By CWA, ¬Have(Cake, 0) and ¬Eaten(Cake, 0))
Goal State   : ¬Have(Cake, 2) ∧ Eaten(Cake, 2)

Action Schemas:
Action(Eat(Cake))
  PRECOND: Have(Cake)
  EFFECT : ¬Have(Cake) ∧ Eaten(Cake)

Action(Bake(Cake))
  PRECOND: ¬Have(Cake)
  EFFECT : Have(Cake)
```

#### Step 1: Action Propositional Implications ($n = 2$)
- At $t = 0$:
  - $\text{Eat}(\text{Cake}, 0) \implies \text{Have}(\text{Cake}, 0) \land \neg \text{Have}(\text{Cake}, 1) \land \text{Eaten}(\text{Cake}, 1)$
  - $\text{Bake}(\text{Cake}, 0) \implies \neg \text{Have}(\text{Cake}, 0) \land \text{Have}(\text{Cake}, 1)$
- At $t = 1$:
  - $\text{Eat}(\text{Cake}, 1) \implies \text{Have}(\text{Cake}, 1) \land \neg \text{Have}(\text{Cake}, 2) \land \text{Eaten}(\text{Cake}, 2)$
  - $\text{Bake}(\text{Cake}, 1) \implies \neg \text{Have}(\text{Cake}, 1) \land \text{Have}(\text{Cake}, 2)$

#### Step 2: Successor-State Axioms
How fluents change over time:
$$\text{Have}(\text{Cake}, 1) \iff (\text{Have}(\text{Cake}, 0) \land \neg \text{Eat}(\text{Cake}, 0)) \lor \text{Bake}(\text{Cake}, 0)$$
$$\text{Have}(\text{Cake}, 2) \iff (\text{Have}(\text{Cake}, 1) \land \neg \text{Eat}(\text{Cake}, 1)) \lor \text{Bake}(\text{Cake}, 1)$$
$$\text{Eaten}(\text{Cake}, 1) \iff \text{Eaten}(\text{Cake}, 0) \lor \text{Eat}(\text{Cake}, 0)$$
$$\text{Eaten}(\text{Cake}, 2) \iff \text{Eaten}(\text{Cake}, 1) \lor \text{Eat}(\text{Cake}, 1)$$

#### Step 3: Action Exclusion Axioms
$$\neg \text{Eat}(\text{Cake}, 0) \lor \neg \text{Bake}(\text{Cake}, 0)$$
$$\neg \text{Eat}(\text{Cake}, 1) \lor \neg \text{Bake}(\text{Cake}, 1)$$

#### Step 4: Solving the SAT Problem
- At horizon $T = 1$: $\text{Eaten}(\text{Cake}, 1)$ requires $\text{Eat}(\text{Cake}, 0)$, which requires $\text{Have}(\text{Cake}, 0) = \text{True}$. But $\neg \text{Have}(\text{Cake}, 0)$ holds initially. Formula is **UNSAT**.
- At horizon $T = 2$:
  - Set $\text{Bake}(\text{Cake}, 0) = \text{True} \implies \text{Have}(\text{Cake}, 1) = \text{True}$.
  - Set $\text{Eat}(\text{Cake}, 1) = \text{True} \implies \neg \text{Have}(\text{Cake}, 2) = \text{True}$ and $\text{Eaten}(\text{Cake}, 2) = \text{True}$.
  - The SAT solver returns a satisfying model yielding the optimal 2-step plan:
    $$\mathbf{[\text{Bake}(\text{Cake}, 0), \text{Eat}(\text{Cake}, 1)]}$$

---

## 8. Real-World Applications, Industrial Ecosystem & Competitions

Automated planning algorithms are deployed across industry and space exploration:

```
+---------------------------------------------------------------------------------------------------+
|                                Real-World Applications of AI Planning                             |
+---------------------------+-----------------------------------------------+-----------------------+
| Domain                    | Key Operational Use Case                      | Landmark References   |
+---------------------------+-----------------------------------------------+-----------------------+
| Logistics & Manufacturing | High-throughput scheduling, resource allocation| SciTePress (2022)     |
|                           | and dynamic assembly line balancing           | ScienceDirect (2025)  |
| Enterprise Operations     | Business process modeling, automated workflow | Sohrabi et al.,       |
|                           | synthesis, and robotic process automation     | IJCAI (2019)          |
| Robotics & Manipulation   | Autonomous path planning, collision-free      | Nature Scientific     |
|                           | mobile manipulation, and task-motion planning | Reports (2025)        |
| Healthcare Management     | Hospital operating room scheduling, resource  | arXiv (2021)          |
|                           | optimization, and clinical guidelines execution| RCRA (2023)           |
| Video Games & Virtual NPCs| Real-time NPC goal-oriented action planning   | Neufeld et al.,       |
|                           | (GOAP) and dynamic tactical behaviors        | IEEE TOG (2019)       |
| Space Exploration         | Onboard autonomous spacecraft commanding and  | Mars 2020 Rover       |
|                           | Mars rover automated activity scheduling      | i-SAIRAS (2020), ICRA |
| Real-Time Decision Making | Constraints-aware automated decision guidance | Mission Control &     |
|                           | under dynamic, safety-critical deadlines      | Emergency Response    |
+---------------------------+-----------------------------------------------+-----------------------+
```

### 8.1 The AIPlanning4EU Unified Planning Library
The European Commission's **AIPlanning4EU** initiative (`https://github.com/aiplan4eu/unified-planning`) unifies disparate planning engines (Fast Downward, Pyperplan, Tamer, ENHSP, OptaPlanner) under an open-source Python API. It provides automated domain translation, problem grounding, and compilation of conditional effects.

### 8.2 International Planning Competition (IPC 2023)
The biennial IPC benchmarks planning efficiency across classical, probabilistic, and hierarchical tracks:
- **Reproducible Apptainer Images**: Planners are packaged into containerized Apptainer recipes (`ipc2023-classical.github.io`) for deterministic benchmarking.
- **Top Solvers**:
  - *Optimal Track*: **Ragnarok** (combining symbolic pattern databases with merge-and-shrink heuristics).
  - *Agile Track*: **DecStar-2023** (decoupled state-space search).
  - *Satisficing Track*: **Scorpion Maidu and Levitron** (best-first search with cost-partitioned heuristics).

---

## 9. Algorithmic Properties and Computational Complexity Bounds

### 9.1 Soundness, Completeness, and Optimality

- **Soundness**: A planning algorithm is *sound* if every generated plan sequence $[a_1, \dots, a_k]$ is mathematically valid—meaning executing actions sequentially from $s_0$ strictly terminates in a state $s_k \models g$.
- **Completeness**: A planning algorithm is *complete* if it is guaranteed to find a valid plan whenever one exists in the domain.
- **Optimality**: A planning algorithm is *optimal* if it returns a plan that minimizes total step cost (e.g., shortest plan length or lowest cumulative action cost).

### 9.2 Computational Complexity of PlanSAT vs. Bounded PlanSAT

The computational complexity of classical planning is categorized into two formal decision problems:

```
+-------------------------------------------------------------------+
|               Classical Planning Complexity Bounds                |
+-------------------------------------------------------------------+
| PlanSAT         | Does ANY valid plan exist?    | PSPACE-Complete |
| Bounded PlanSAT | Does a plan of length <= k    | NP-Complete     |
|                 | exist?                        |                 |
+-------------------------------------------------------------------+
```

#### 1. PlanSAT Problem ($\text{PlanSAT} \in \text{PSPACE-Complete}$)
- **Definition**: Given a classical planning domain and problem instance, determine whether there *exists any valid plan of unrestricted length* reaching the goal.
- **Complexity**: **PSPACE-Complete** (Bylander, 1994).
- **Proof Intuition**:
  - *In PSPACE*: A non-deterministic algorithm can simulate plan execution step by step, storing only the current state $s$ (which takes polynomial memory $\mathcal{O}(n)$ fluents). By Savitch's Theorem ($\text{NPSPACE} = \text{PSPACE}$), $\text{PlanSAT} \in \text{PSPACE}$.
  - *PSPACE-Hardness*: Any deterministic Turing Machine operating in polynomial space $S(n)$ can be encoded as a classical planning problem. Turing Machine tape cells, head position, and internal control states map directly to ground fluents. Synthesizing a plan is equivalent to deciding whether the Turing Machine accepts the input.

#### 2. Bounded PlanSAT Problem ($\text{Bounded PlanSAT} \in \text{NP-Complete}$)
- **Definition**: Given a classical planning domain, problem instance, and integer bound $k$ (written in unary), determine whether there exists a valid plan of length *at most $k$*.
- **Complexity**: **NP-Complete**.
- **Proof Intuition**:
  - *In NP*: A non-deterministic algorithm can non-deterministically guess an action sequence of length $k' \le k$ and verify in polynomial time $\mathcal{O}(k' \cdot n)$ that preconditions and goal conditions hold.
  - *NP-Hardness*: SATPlan provides a direct polynomial-time reduction from 3-SAT to Bounded PlanSAT.

---

## 10. Summary

Classical AI Planning forms the core symbolic backbone of automated reasoning and sequential decision making. By enforcing discrete, deterministic, static, and fully observable assumptions, domains are represented compactly using factored atomic fluents under Closed-World (CWA) and Unique Names (UNA) semantics. PDDL domain and problem specifications define parameterized action schemas, applicability conditions ($s \models \text{Precond}(a)$), and successor state transitions ($s' = (s \setminus \text{DEL}) \cup \text{ADD}$).

Plan synthesis can be executed either via state-space search—contrasting forward progression ($2^n$ ground state space) with backward regression ($3^n$ partial state description space using MGUs)—or via logical satisfiability reduction (SATPlan). SATPlan resolves the frame problem efficiently using Reiter's Successor-State Axioms, reducing clause complexity from $\mathcal{O}(m \cdot n)$ to $\mathcal{O}(n)$, proven via the 2-step 'Eat a Cake!' puzzle. Formally, deciding plan existence ($\text{PlanSAT}$) is PSPACE-Complete due to state space size, while bounded plan search ($\text{Bounded PlanSAT}$) is NP-Complete.

<reviewkit>
<takeaways>
- **Core Environment Assumptions:** Classical planning assumes discrete time/state, deterministic transitions, static environment, and full observability. Physical reasoning benchmarks like PushWorld demonstrate why spatial planning requires explicit transition models.
- **Factored State & Database Semantics:** States are sets of ground function-free fluents. Unmentioned fluents are false (Closed-World Assumption, CWA) and distinct constants refer to distinct entities (Unique Names Assumption, UNA).
- **Action Transitions & Frame Problem:** $s' = (s \setminus \text{DEL}(a)) \cup \text{ADD}(a)$. Frame problem is resolved in STRIPS/PDDL by assuming unmentioned fluents automatically persist (inertia assumption).
- **Progression vs. Regression:** Forward progression expands $2^n$ concrete ground states. Backward regression expands $3^n$ partial state descriptions using Most General Unifiers (MGUs) to maintain goal relevance.
- **SATPlan & Successor-State Axioms:** SATPlan converts planning into CNF propositional logic over horizon step $k$. Successor-State Axioms ($F^{t+1} \iff \text{PosAction}^t \lor (F^t \land \neg \text{NegAction}^t)$) reduce frame clause complexity to $\mathcal{O}(n)$, proven via the 'Eat a Cake!' puzzle.
- **Complexity Bounds:** $\text{PlanSAT}$ (any plan length) is **PSPACE-Complete** (simulates polynomial-space Turing machines). $\text{Bounded PlanSAT}$ (length $\le k$) is **NP-Complete** (polynomial reduction to SAT).
</takeaways>
<qprompt/>
</reviewkit>

## References

1. Fikes, R. E., & Nilsson, N. J. (1971). STRIPS: A new approach to the application of theorem proving to problem solving. *Artificial Intelligence*, 2(3-4), 189-208.
2. Kautz, H., & Selman, B. (1992). Planning as satisfiability. In *Proceedings of the 10th European Conference on Artificial Intelligence (ECAI)* (pp. 359-363).
3. McDermott, D., et al. (1998). PDDL—The Planning Domain Definition Language. *Technical Report CVC TR-98-003/DCS TR-1165*, Yale University.
4. Reiter, R. (1991). The frame problem in the situation calculus: A solution (sometimes) suitable for explanation. *Knowledge Representation and Reasoning*, 359-370.
5. Bylander, T. (1994). The computational complexity of propositional STRIPS planning. *Artificial Intelligence*, 69(1-2), 165-204.
6. Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4th ed.). Pearson.
7. Rabideau, G., Wong, V., Gaines, D., Agrawal, J., Chien, S., Kuhn, S., Fosse, E., & Biehl, J. (2020). Onboard automated scheduling for the Mars 2020 Rover. In *Proceedings of i-SAIRAS 2020*. ESA.
8. Sohrabi, S. (2019). AI planning for enterprise: Putting theory into practice. In *Proceedings of IJCAI-19* (pp. 6408-6410).
9. Neufeld, X., Mostaghim, S., & Perez-Liebana, D. (2019). Building a planner: A survey of planning systems used in commercial video games. *IEEE Transactions on Games*, 11(2), 91-108.
10. AIPlanning4EU Project. (2023). *The Unified Planning Library*. European Commission Horizon 2020. [GitHub](https://github.com/aiplan4eu/unified-planning)
11. International Planning Competition. (2023). *IPC 2023 Classical Tracks*. ICAPS. [Website](https://ipc2023-classical.github.io)
