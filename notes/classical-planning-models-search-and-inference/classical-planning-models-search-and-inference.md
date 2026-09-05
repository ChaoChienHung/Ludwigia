<meta>
Title: Classical AI Planning: STRIPS, PDDL, State-Space Search, SATPlan, and Complexity Bounds
Summary: An exhaustive master technical note on Classical AI Planning theory, representation, search, and logic-based reduction. Covers symbolic agent architectures, PDDL and STRIPS semantics, Closed-World Assumption (CWA), Unique Names Assumption (UNA), model-theoretic goal entailment (s |= g, M(s) <= M(g)), action schemas, preconditions, ADD and DEL fluents, successor state mechanics, and the Frame Problem. Details complete executable PDDL air-cargo domain and problem code blocks. Compares forward progression search with backward regression search (2^n ground state space vs 3^n partial state description space) and Most General Unifiers (MGU). Formulates Boolean Satisfiability (SAT) reduction via SATPlan, proving how Successor-State Axioms resolve the frame problem in O(n) clauses instead of O(mn), alongside Action Exclusion Axioms. Concludes with formal proofs and analysis of algorithmic properties (soundness, completeness, optimality) and complexity bounds (PlanSAT PSPACE-complete vs Bounded PlanSAT NP-complete).
Slug: classical-planning-models-search-and-inference
Output: notes/classical-planning-models-search-and-inference/classical-planning-models-search-and-inference.html
CanonicalId: classical-planning-models-search-and-inference
Style: default
EstimatedReadingTime: true
Lang: en
Tags: classical planning, strips, pddl, satplan, automated reasoning
Status: drafting
Published: 2026-08-19
LastModified: 2026-09-01
</meta>
<draft>
- 1. Foundations of Classical Planning & Symbolic Agent Architecture
    - Importance: Establishes agent definition, representation, and reasoning capabilities on solid logical reasoning ground.
    - World Modeling & Verification: Gives meaningful representations of what the agent is modeling in the world, providing methods to establish truth values and validate inference algorithm soundness.
    - 4 Core Environment Assumptions: Discrete, Deterministic, Static, Fully Observable.
    - Baseline Role: Classical planning assumptions serve as foundational abstractions for complex real-world robotics, logistics, space exploration, and autonomous AI agents.
- 2. State Representation and Database Semantics
    - Factored State Representation: The world is modeled via state variables known as fluents (properties that change over time).
    - State Definition: A state is a conjunction of ground function-free atomic fluents (predicates with constant arguments only, no function symbols), or equivalently a set of true fluents.
    - Closed-World Assumption (CWA): Any fluent not explicitly listed in the state set is assumed to be false.
    - Unique Names Assumption (UNA): Distinct constant symbols refer to distinct real-world entities.
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
- 5. Complete PDDL Air-Cargo Domain and Problem Specifications
    - PDDL Origins: Introduced by McDermott et al. (1998) extending STRIPS (Fikes & Nilsson, 1971).
    - Complete PDDL Air-Cargo Domain code block ((define (domain air-cargo) ...)).
    - Complete PDDL Air-Cargo Problem code block ((define (problem air-cargo-problem) ...)).
    - Action Grounding & Spurious Action Prevention: Handling parameter substitutions and avoiding self-referential actions like Fly(P1, SFO, SFO).
- 6. Planning as State-Space Search (Progression vs. Regression)
    - Graph Mapping: Graph search over state space. Nodes = ground world states, Edges = grounded actions, Root = initial state, Goal test = s |= g.
    - Forward Progression Search: Step-by-step progression from initial state s0 to goal. State space size is 2^n.
    - Backward Regression Search: Regressing goal descriptions backwards through action effects.
    - Relevance Conditions: ADD(a) intersects goal != empty; DEL(a) intersects goal = empty.
    - Most General Unifiers (MGU): Unifying lifted action effects with goal literals to avoid over-branching.
    - State Space Cardinality Comparison: 2^n concrete states vs 3^n partial state descriptions (each fluent true, false, or unspecified).
- 7. Planning as Logical Inference: SATPlan and Satisfiability Reduction
    - Propositional Encoding: Mapping planning problem to Conjunctive Normal Form (CNF) over time steps t = 0, 1, ..., k.
    - SATPlan Algorithm Execution Flow: Iterative horizon search checking CNF satisfiability via SAT solver.
    - Frame Problem Resolution in SAT:
        - Naive Frame Axioms: Require O(m * n) clauses for m actions and n fluents.
        - Successor-State Axioms (Reiter): F^{t+1} <=> PosAction^t v (F^t ^ ~NegAction^t), reducing clause complexity to O(n).
        - Action Exclusion Axioms: Mutual exclusion clauses (~a1^t v ~a2^t) preventing conflicting parallel execution.
- 8. Algorithmic Properties & Computational Complexity Bounds
    - Soundness, Completeness, Optimality definitions.
    - PlanSAT Problem: Deciding whether a valid plan of any length exists -> PSPACE-Complete. Proof intuition via polynomial-space simulation of deterministic Turing Machines.
    - Bounded PlanSAT Problem: Deciding whether a valid plan of length <= k exists -> NP-Complete. Polynomial reduction to Boolean Satisfiability (SAT).
</draft>

# Classical AI Planning: STRIPS, PDDL, State-Space Search, SATPlan, and Complexity Bounds

Automated planning is a core branch of Artificial Intelligence (AI) focused on sequential decision making for autonomous agents. Whether controlling a space rover on Mars, orchestrating global logistics for air cargo, or driving an autonomous vehicle through dynamic traffic, an intelligent agent must be capable of reasoning over actions, state transitions, and future horizons to synthesize a valid sequence of actions—a **plan**—that reaches a designated goal.

This technical note provides an exhaustive analysis of **Classical AI Planning**, covering symbolic agent architectures, STRIPS and PDDL domain representations, Closed-World Assumption (CWA) and Unique Names Assumption (UNA) semantics, forward progression vs. backward regression state-space search, Most General Unifiers (MGU), SATPlan logical satisfiability reduction, Successor-State Axioms, and formal computational complexity bounds ($\text{PlanSAT}$ PSPACE-Completeness vs. $\text{Bounded PlanSAT}$ NP-Completeness).

---

## 1. Foundations of Classical Planning and Symbolic Agent Architecture

In artificial intelligence, a **Symbolic Agent** maintains an explicit, formal representation of its world using mathematical logic. This world model enables the agent to establish truth values for facts, reason about action consequences, and verify the mathematical soundness of plan synthesis.

```
+-------------------------------------------------------------------+
|               Classical AI Planning Domain Model                  |
+-------------------------------------------------------------------+
|  [ Fully Observable ]   [ Deterministic ]   [ Discrete State ]    |
|           ^                    ^                    ^             |
|           |                    |                    |             |
|  +--------+--------------------+--------------------+--------+    |
|  |             Classical Planning Environment                |    |
|  |             (Static, No External Interferences)           |    |
|  +-----------------------------+-----------------------------+    |
|                                |                                  |
|                                v                                  |
|  Initial State s0 ===> [ Grounded Action Sequence ] ===> Goal g  |
+-------------------------------------------------------------------+
```

### 1.1 The Four Core Environment Assumptions

Classical planning operates under four strict, foundational environmental assumptions:

1. **Discrete State and Time**: The environment consists of discrete states $s \in S$, and time progresses in discrete steps $t \in \{0, 1, 2, \dots\}$. Continuous physics and time flows are abstracted into atomic state transitions.
2. **Deterministic Transitions**: Executing an applicable action $a$ in state $s$ produces a single, uniquely determined successor state $s'$. There are no probabilistic outcomes or stochastic variations.
3. **Static Environment**: State changes occur *only* as a direct result of actions executed by the planning agent. The environment remains completely frozen when the agent is deliberating or inactive.
4. **Fully Observable**: The agent possesses complete, error-free knowledge of the exact world state $s$ at any point in time. There are no hidden variables, noisy sensors, or unobserved fluents.

### 1.2 Baseline Role in Autonomous AI Systems

While real-world environments (such as robotics, autonomous driving, or high-frequency trading) violate these idealized assumptions, classical planning serves as the indispensable baseline abstraction. Advanced planning paradigms—such as Markov Decision Processes (MDPs), Partial Observability (POMDPs), and Neuro-Symbolic LLM Planners—build directly upon classical state-space search, heuristic abstractions, and PDDL representations.

---

## 2. State Representation and Database Semantics

### 2.1 Factored State Representation and Atomic Fluents

In classical planning, world states are modeled using a **factored representation**. Instead of treating states as monolithic black-box tokens (as in un-factored graph search like $A^*$), a state is decomposed into a set of state variables called **fluents** (properties whose truth values fluctuate over time).

- **Ground Function-Free Atomic Fluent**: A predicate symbol applied to constant terms (objects) without function symbols. For example, $\text{At}(\text{Plane1}, \text{SFO})$ or $\text{In}(\text{Cargo2}, \text{Plane1})$.
- **State Definition**: A state $s$ is formally defined as a **conjunction of ground, positive, function-free atomic fluents**. Equivalently, $s$ is treated as the *set of all fluents currently true in that state*.

$$\text{State } s = \{\text{At}(\text{Cargo1}, \text{JFK}), \text{At}(\text{Plane1}, \text{JFK}), \text{Airport}(\text{JFK}), \text{Airport}(\text{SFO})\}$$

### 2.2 Closed-World Assumption (CWA) and Unique Names Assumption (UNA)

Classical planning adopts specialized database semantics to maintain compact state representations:

1. **Closed-World Assumption (CWA)**: Any atomic fluent that is not explicitly listed in the state set $s$ is **assumed to be false**. If $\text{In}(\text{Cargo1}, \text{Plane1}) \notin s$, then $\text{In}(\text{Cargo1}, \text{Plane1}) = \text{False}$. This eliminates the need to explicitly store negative literals.
2. **Unique Names Assumption (UNA)**: Distinct constant symbols refer to distinct, unique real-world entities. For example, $\text{JFK} \neq \text{SFO}$ and $\text{Plane1} \neq \text{Plane2}$.

---

## 3. Goal Representation and Model-Theoretic Entailment

### 3.1 Goal Definition as Partial State

Unlike a complete world state (which specifies the truth value of every fluent in the domain via CWA), a **Goal** $g$ is a **partially specified state** expressed as a conjunction of literals. Any fluent omitted from $g$ is unconstrained and can take any truth value in a satisfying goal state.

$$g = \text{At}(\text{Cargo1}, \text{SFO}) \land \text{At}(\text{Cargo2}, \text{JFK})$$

### 3.2 Model-Theoretic Goal Entailment ($s \models g$)

A state $s$ satisfies a goal $g$ if and only if $s$ logically entails $g$, written as $s \models g$. Model-theoretically:

$$s \models g \iff \mathcal{M}(s) \subseteq \mathcal{M}(g)$$

where $\mathcal{M}(\cdot)$ represents the set of satisfying interpretations (models). In set-theoretic terms under CWA, state $s$ satisfies goal $g$ if every positive literal in $g$ is contained within $s$, and no negative literal in $g$ is contained within $s$:

$$s \models g \iff (\forall p \in g^+, p \in s) \land (\forall q \in g^-, q \notin s)$$

### 3.3 Quantifier Treatment in STRIPS vs. PDDL

- **STRIPS Restriction**: Standard STRIPS restricts goal specifications strictly to **conjunctions of positive ground literals** without variables.
- **PDDL Extension**: Modern PDDL permits negative literals, disjunctions, and explicitly quantified variables in goals (where unassigned variables are implicitly existentially quantified: $\exists x \, \text{At}(x, \text{SFO})$).

---

## 4. Action Schemas, Grounding, and State Transitions

### 4.1 Action Schemas vs. Grounded Actions

To avoid hand-crafting transitions for every object, planning domains use parameterized **Action Schemas** (lifted representations):

```
Action Schema: Fly(?p, ?from, ?to)
  Parameters:   ?p (Plane), ?from (Airport), ?to (Airport)
  Preconditions: At(?p, ?from) ^ Plane(?p) ^ Airport(?from) ^ Airport(?to)
  Effects:      NOT At(?p, ?from) ^ At(?p, ?to)
```

- **Lifted Action Schema**: Uses universally quantified variables ($\text{?p}, \text{?from}, \text{?to}$).
- **Grounded Action**: A concrete instance obtained by substituting variables with constant domain objects using substitution $\theta = \{?p/\text{Plane1}, ?from/\text{JFK}, ?to/\text{SFO}\}$:

$$\text{Fly}(\text{Plane1}, \text{JFK}, \text{SFO})$$

### 4.2 Action Structure and Applicability Condition

A grounded action $a$ consists of three components:
1. **Preconditions ($\text{Precond}(a)$)**: Literals that must hold in state $s$ for $a$ to be executed.
2. **ADD Set ($\text{ADD}(a)$)**: Positive fluents made true by executing $a$.
3. **DEL Set ($\text{DEL}(a)$)**: Positive fluents made false by executing $a$.

<block>
<strong>Applicability Condition:</strong><br/>
Action $a$ is applicable in state $s$ if and only if state $s$ satisfies the preconditions of $a$:<br/>
$$\text{Applicable}(a, s) \iff s \models \text{Precond}(a)$$
</block>

### 4.3 Successor State Formula and the Frame Problem

When an applicable action $a$ is executed in state $s$, the successor state $s'$ is generated by deleting fluents in $\text{DEL}(a)$ and adding fluents in $\text{ADD}(a)$:

$$s' = \text{Result}(s, a) = (s \setminus \text{DEL}(a)) \cup \text{ADD}(a)$$

```
State Transition Formula:
+-------------------------------------------------------------------+
| Current State s  : { At(P1, JFK), At(C1, JFK), Airport(JFK) }     |
| Action Executed  : Fly(P1, JFK, SFO)                              |
|   DEL Set        : { At(P1, JFK) }                                |
|   ADD Set        : { At(P1, SFO) }                                |
+-------------------------------------------------------------------+
| Successor State s': (s \ DEL) U ADD                               |
|                  = { At(C1, JFK), Airport(JFK), At(P1, SFO) }      |
+-------------------------------------------------------------------+
```

#### The Frame Problem Resolution
The **Frame Problem** is the fundamental challenge of formally specifying which aspects of the world *remain unchanged* when an action occurs. Naive logic requires explicit "frame axioms" asserting that unmentioned fluents persist (e.g., "Flying a plane does not change the color of the building"). PDDL and STRIPS resolve the frame problem by adopting an **Inertia Assumption**: *All fluents not explicitly listed in $\text{ADD}(a)$ or $\text{DEL}(a)$ automatically retain their previous truth values.*

---

## 5. Complete PDDL Air-Cargo Domain and Problem Specifications

The **Planning Domain Definition Language (PDDL)** was introduced by McDermott et al. (1998) as a standardized syntax extending STRIPS (Fikes & Nilsson, 1971). A complete PDDL specification separates the **Domain** (predicates and action schemas) from the **Problem** (objects, initial state, and goal state).

### 5.1 Executable PDDL Domain Code (`air-cargo-domain.pddl`)

```lisp
(define (domain air-cargo)
  (:requirements :strips :typing)
  (:types cargo plane airport - object)
  
  (:predicates
    (At ?obj - object ?loc - airport)
    (In ?c - cargo ?p - plane)
  )

  (:action Load
    :parameters (?c - cargo ?p - plane ?a - airport)
    :precondition (and (At ?c ?a) (At ?p ?a))
    :effect (and (not (At ?c ?a))
                 (In ?c ?p))
  )

  (:action Unload
    :parameters (?c - cargo ?p - plane ?a - airport)
    :precondition (and (In ?c ?p) (At ?p ?a))
    :effect (and (not (In ?c ?p))
                 (At ?c ?a))
  )

  (:action Fly
    :parameters (?p - plane ?from - airport ?to - airport)
    :precondition (and (At ?p ?from))
    :effect (and (not (At ?p ?from))
                 (At ?p ?to))
  )
)
```

### 5.2 Executable PDDL Problem Code (`air-cargo-problem.pddl`)

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
- **Spurious Action Elimination**: To prevent redundant self-flights, domain designers add inequality constraints $\text{(not (= ?from ?to))}$ to action preconditions, pruning the action branch space upfront.

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

**Progression Search** starts at the initial state $s_0$ and explores forward toward the goal.

#### Algorithm Steps
1. Initialize search queue with root state node $s_0$.
2. Pop current state node $s$. If $s \models g$, return the action path (Plan Found).
3. Find all applicable grounded actions $a$ where $s \models \text{Precond}(a)$.
4. For each applicable action $a$, compute successor state $s' = (s \setminus \text{DEL}(a)) \cup \text{ADD}(a)$.
5. Add child nodes $s'$ to search queue (guided by BFS, DFS, $A^*$, or Greedy Best-First Search).

#### State-Space Explosion
If a domain contains $n$ ground atomic fluents, the total number of distinct concrete ground states is **$2^n$**. Forward search must evaluate concrete states, making unguided progression intractable for large $n$.

### 6.2 Backward Regression Search Algorithm

**Regression Search** starts at goal set $g$ and works backward toward initial state $s_0$.

#### Relevance Condition
An action $a$ is **relevant** to a current goal description $g$ if and only if:
1. Action $a$ achieves at least one literal in $g$: $\text{ADD}(a) \cap g \neq \emptyset$.
2. Action $a$ does not destroy any literal required by $g$: $\text{DEL}(a) \cap g = \emptyset$.

#### Goal Regression Formula
The regressed description $g'$ prior to executing relevant action $a$ is:

$$g' = \text{Regress}(g, a) = (g \setminus \text{ADD}(a)) \cup \text{Precond}(a)$$

```
Regression Trace Example (Air Cargo):
Goal g            : { At(C1, SFO) }
Relevant Action a : Unload(C1, P1, SFO)
  ADD Set         : { At(C1, SFO) }
  Preconditions   : { In(C1, P1), At(P1, SFO) }
Regressed Goal g' : (g \ ADD(a)) U Precond(a)
                  = {} U { In(C1, P1), At(P1, SFO) }
                  = { In(C1, P1), At(P1, SFO) }
```

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

```
Successor-State Axiom Example for At(P1, SFO):
At(P1, SFO)^{t+1} <=> Fly(P1, JFK, SFO)^t v ( At(P1, SFO)^t ^ ~Fly(P1, SFO, JFK)^t )
```

### 7.4 Action Mutual Exclusion Axioms

To prevent invalid parallel executions (e.g., flying a plane to SFO while simultaneously loading cargo into it at JFK), SATPlan asserts **Action Exclusion Axioms** for conflicting action pairs $A_1$ and $A_2$:

$$\neg A_1^t \lor \neg A_2^t$$

### 7.5 SATPlan Algorithm Iteration

```
Algorithm 1: SATPlan
-------------------------------------------------------------------
1. Set plan horizon length k = 0.
2. Construct propositional CNF formula Phi_k.
3. Call SAT Solver (e.g., MiniSAT, Glucose) on Phi_k.
4. If SAT Solver returns SATISFIABLE:
     Extract truth assignment for action variables A^t = True.
     Return synthesized plan [A^0, A^1, ..., A^{k-1}].
5. Else (UNSATISFIABLE):
     Increment horizon k = k + 1.
     Repeat from Step 2 until k exceeds upper bound k_max.
```

---

## 8. Algorithmic Properties and Computational Complexity Bounds

### 8.1 Soundness, Completeness, and Optimality

- **Soundness**: A planning algorithm is *sound* if every generated plan sequence $[a_1, \dots, a_k]$ is mathematically valid—meaning executing actions sequentially from $s_0$ strictly terminates in a state $s_k \models g$.
- **Completeness**: A planning algorithm is *complete* if it is guaranteed to find a valid plan whenever one exists in the domain.
- **Optimality**: A planning algorithm is *optimal* if it returns a plan that minimizes total step cost (e.g., shortest plan length or lowest cumulative action cost).

### 8.2 Computational Complexity of PlanSAT vs. Bounded PlanSAT

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

## 9. Summary

Classical AI Planning forms the core symbolic backbone of automated reasoning and sequential decision making. By enforcing discrete, deterministic, static, and fully observable assumptions, domains are represented compactly using factored atomic fluents under Closed-World (CWA) and Unique Names (UNA) semantics. PDDL domain and problem specifications define parameterized action schemas, applicability conditions ($s \models \text{Precond}(a)$), and successor state transitions ($s' = (s \setminus \text{DEL}) \cup \text{ADD}$).

Plan synthesis can be executed either via state-space search—contrasting forward progression ($2^n$ ground state space) with backward regression ($3^n$ partial state description space using MGUs)—or via logical satisfiability reduction (SATPlan). SATPlan resolves the frame problem efficiently using Reiter's Successor-State Axioms, reducing clause complexity from $\mathcal{O}(m \cdot n)$ to $\mathcal{O}(n)$. Formally, deciding plan existence ($\text{PlanSAT}$) is PSPACE-Complete due to state space size, while bounded plan search ($\text{Bounded PlanSAT}$) is NP-Complete.

<reviewkit>
<takeaways>
- **Core Environment Assumptions:** Classical planning assumes discrete time/state, deterministic transitions, static environment, and full observability.
- **Factored State & Database Semantics:** States are sets of ground function-free fluents. Unmentioned fluents are false (Closed-World Assumption, CWA) and distinct constants refer to distinct entities (Unique Names Assumption, UNA).
- **Action Transitions & Frame Problem:** $s' = (s \setminus \text{DEL}(a)) \cup \text{ADD}(a)$. Frame problem is resolved in STRIPS/PDDL by assuming unmentioned fluents automatically persist (inertia assumption).
- **Progression vs. Regression:** Forward progression expands $2^n$ concrete ground states. Backward regression expands $3^n$ partial state descriptions using Most General Unifiers (MGUs) to maintain goal relevance.
- **SATPlan & Successor-State Axioms:** SATPlan converts planning into CNF propositional logic over horizon step $k$. Successor-State Axioms ($F^{t+1} \iff \text{PosAction}^t \lor (F^t \land \neg \text{NegAction}^t)$) reduce frame clause complexity to $\mathcal{O}(n)$.
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
