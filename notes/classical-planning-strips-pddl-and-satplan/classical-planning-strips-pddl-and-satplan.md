<meta>
Title: Classical AI Planning and SATPlan: From STRIPS, PDDL, and State-Space Search to Propositional Satisfiability Reduction
Summary: An exhaustive master technical note on Classical AI Planning theory, representation, search, and logic-based reduction based on NUS CS4246/CS5446 lecture materials. Covers symbolic agent foundations, PDDL and STRIPS semantics, Closed-World Assumption (CWA), Unique Names Assumption (UNA), model-theoretic goal entailment (s |= g, M(s) <= M(g)), action schemas, preconditions, ADD and DEL fluents, successor state mechanics, and the Frame Problem. Details complete executable PDDL code for both flight_domain and air-cargo domains. Compares forward progression search with backward regression search (2^n ground states vs. 3^n partial state descriptions), Most General Unifiers (MGU), and step-by-step goal regression traces. Formulates Boolean Satisfiability (SAT) reduction via SATPlan, featuring the complete 'Eat a Cake!' worked example, proving how Successor-State Axioms resolve the frame problem in O(n) axioms instead of O(mn), alongside Action Exclusion Axioms. Explores real-world industrial applications across 7 domains, the AIPlanning4EU unified library, IPC 2023 competitions, algorithmic properties (soundness, completeness, optimality), and computational complexity bounds (PlanSAT PSPACE-complete vs. Bounded PlanSAT NP-complete).
Slug: classical-planning-strips-pddl-and-satplan
Output: notes/classical-planning-strips-pddl-and-satplan/classical-planning-strips-pddl-and-satplan.html
CanonicalId: classical-planning-strips-pddl-and-satplan
Style: default
EstimatedReadingTime: true
Lang: en
Tags: classical planning, strips, pddl, satplan, automated reasoning, ai planning
Status: drafting
Published: 2026-08-29
LastModified: 2026-09-05
</meta>
<draft>
- 1. Symbolic Agent & Logical Foundations
    - Importance: Establishes agent definition, representation, and reasoning capabilities on solid logical reasoning ground.
    - World Modeling & Verification: Gives meaningful representations of what the agent is modeling in the world, providing methods to establish truth values and validate inference algorithm soundness.
    - 4 Core Environment Assumptions: Discrete, Deterministic, Static, Fully Observable.
    - Baseline Role: Classical planning assumptions serve as foundational abstractions for complex real-world robotics, logistics, space exploration, and autonomous AI agents.
    - Physical Reasoning Challenges & DeepMind PushWorld: Dynamic spatial puzzles, friction, and obstacle manipulation illustrating why explicit state transitions and physics models are essential.
- 2. Classical Planning Origins & PDDL Characteristics
    - Origins: STanford Research Institute Problem Solver (STRIPS) introduced by Fikes and Nilsson (1971), laying foundations for the Planning Domain Definition Language (PDDL).
    - PDDL Representation: Standard modeling language derived from STRIPS; compact, lifted form using restricted First-Order Logic (FOL).
    - Factored State Representation: The world is modeled via state variables known as fluents (properties that change over time).
    - Implicit Transitions: State transitions are defined dynamically via action schemas, computing successor states on demand without generating full state graphs upfront.
    - Domain-Independent Heuristics: General methods designed to guide state-space search across arbitrary domains without specialized domain engineering.
- 3. State Representation and Database Semantics
    - State Definition: A state is a conjunction of ground function-free atomic fluents (predicates with constant arguments only, no function symbols), or equivalently a set of true fluents.
    - Fluent Examples: Hungry ^ Sleepy -> S = {Hungry, Sleepy}; New(Plane1) ^ Safe(Plane1) -> S = {New(Plane1), Safe(Plane1)}; At(Plane1, SIN) ^ At(Plane2, SFO).
    - Closed-World Assumption (CWA): Any fluent not explicitly listed in the state set is assumed to be false (e.g., Fierce(CS3263_Lecturer) is false).
    - Unique Names Assumption (UNA): Distinct constant symbols refer to distinct real-world entities (e.g., Plane1 != Plane2).
- 4. Goal Representation and Model-Theoretic Entailment
    - Goal Definition: A goal is a partially specified state written as a conjunction of literals; unmentioned fluents can take any truth value.
    - State Satisfaction (s |= g): A state s satisfies a goal g if s entails g (s |= g, or M(s) <= M(g)—meaning in every model where s is true, g is automatically true).
    - Variable Treatment: Variables appearing in goal specifications are treated as existentially quantified (e.g., At(P1, SIN) ^ At(p, SFO) ^ Plane(p)).
    - Substitution Examples: Hungry ^ Sleepy ^ Bored |= Hungry ^ Bored; At(Cargo1, SFO) |= At(c, SFO) with {c/Cargo1}.
    - STRIPS Restriction: Standard STRIPS restricts goals strictly to positive, ground literals without variables.
- 5. Action Schemas, Grounding, and State Transitions
    - Action Schemas: Parameterized lifted representations defining families of actions using universally quantified variables.
    - Grounded Actions: Concrete action instances where variables are substituted with specific domain objects.
    - Action Structure: Preconditions (conditions that must hold prior to action execution) and Effects (ADD fluents and DEL fluents).
    - Applicability Condition: Action a is applicable in state s if and only if s entails the preconditions of a (s |= Precond(a)).
    - Successor State Formula: s' = (s \ DEL(a)) U ADD(a).
    - The Frame Problem: Specifying what changes after an action without restating everything that remains unchanged. PDDL/STRIPS resolves this via inertia assumption (unmentioned fluents persist).
- 6. PDDL Specifications: Flight Domain & Air-Cargo Case Studies
    - Dedicated PDDL Flight Domain and Problem code blocks (flight_domain & flight_problem).
    - Complete PDDL Air-Cargo Domain and Problem code blocks.
    - Spurious Action Elimination: Handling self-referential actions like Fly(P1, SIN, SIN) via inequality preconditions (not (= ?from ?to)).
- 7. Planning as State-Space Search: Progression vs. Regression
    - Graph Mapping: Graph search over state space. Nodes = ground world states, Edges = grounded actions, Root = initial state, Goal test = s |= g.
    - Forward Progression Search Algorithm: Step-by-step progression from initial state s0 to goal.
    - Backward Regression Search Algorithm: Regressing goal descriptions backwards through action effects.
    - Relevance Conditions: At least one effect unifies with a goal literal; no effect contradicts any goal literal.
    - Goal Regression Formulas:
        - POS(g') = (POS(g) \ ADD(a)) U POS(Precond(a))
        - NEG(g') = (NEG(g) \ DEL(a)) U NEG(Precond(a))
    - Most General Unifiers (MGU): Unifying lifted action effects with goal literals to avoid over-branching.
    - Step-by-Step Regression Worked Examples:
        - Example 1: At(C2, SFO) regressing through Unload(c, p, a).
        - Example 2: At(C1, SFO) regressing to {In(C1, P1), At(P1, SFO)}.
    - State Space Cardinality Comparison: 2^n concrete ground states vs. 3^n partial state descriptions.
- 8. Boolean Satisfiability (SAT) & The SATPlan Algorithm
    - SAT Problem Definition: Propositional CNF satisfiability (m |= alpha, M(alpha)).
    - SATPlan Algorithm: Bounded horizon T incremental search; translating planning into CNF and solving via CDCL SAT solvers.
    - Frame Problem Resolution in SAT:
        - Naive Frame Axioms: Require O(mn) clauses for m actions and n fluents.
        - Successor-State Axioms (Reiter): F^{t+1} <=> (AddActions^t v (F^t ^ ~DelActions^t)), reducing clauses to O(n).
        - Action Exclusion Axioms: Mutual exclusion clauses preventing conflicting parallel actions (~a1^t v ~a2^t).
    - Complete Worked Example: "Eat a Cake!" (Have cake and eat it too):
        - Init: ~Have(Cake, 0); Goal: ~Have(Cake, 2) ^ Eaten(Cake, 2).
        - Actions: Eat(Cake, t) and Bake(Cake, t).
        - Successor-state axioms and action exclusion axioms for t=0, 1.
        - Step-by-step SAT proof showing why T=1 is unsatisfiable and T=2 yields plan [Bake(Cake, 0), Eat(Cake, 1)].
- 9. Real-World Applications, Industrial Ecosystem & Competitions
    - 7 Application Domains: Logistics, Enterprise, Robotics, Healthcare, Gaming, Space Missions (Mars 2020 Rover), Real-Time Decision Making.
    - AIPlanning4EU Project: Unified Planning Library (unified-planning) open-source framework.
    - International Planning Competition (IPC 2023): Tracks, reproducible Apptainer containers, top solvers (Ragnarok, DecStar-2023, Scorpion).
- 10. Algorithmic Properties & Computational Complexity Bounds
    - Soundness, Completeness, Optimality.
    - PlanSAT Problem: Deciding if any valid plan exists -> PSPACE-complete (in P for propositional STRIPS without delete effects).
    - Bounded PlanSAT Problem: Deciding if a plan of length <= k exists -> NP-complete.
    - Optimal planning is hard; suboptimal planning is often easier.
- 11. Roadmap to Modern Planning & Uncertainty
    - Transitioning from classical deterministic assumptions to decision-making under uncertainty: Utility Theory, Markov Decision Processes (MDPs), and Reinforcement Learning (RL).
</draft>

# Classical AI Planning and SATPlan: From STRIPS, PDDL, and State-Space Search to Propositional Satisfiability Reduction

In Artificial Intelligence (AI), **Symbolic Agents** establish the core mathematical foundation for reasoning and decision making. By representing world states, action preconditions, and state transitions using formal logic, symbolic agents provide a solid ground for world modeling, allowing computer systems to prove the correctness (Soundness) and completeness of inference algorithms.

This note systematically decomposes **Classical AI Planning**, based on the pedagogical foundations established in NUS CS4246/CS5446. We begin with the formal representation languages <information context="Stanford Research Institute Problem Solver">STRIPS</information> and <information context="Planning Domain Definition Language">PDDL</information>, database semantics (Closed-World Assumption and Unique Names Assumption), and model-theoretic goal entailment ($s \models g$). We then analyze forward progression search and backward regression search over state spaces. Next, we introduce Boolean Satisfiability (SAT) fundamentals and detail how **SATPlan** leverages **Successor-State Axioms** to solve the Frame Problem in $O(n)$ axioms instead of $O(mn)$, illustrated by the complete **"Eat a Cake!"** worked proof. Finally, we survey seven classical planning paradigms, real-world industrial deployments, the **AIPlanning4EU** and **IPC 2023** benchmarks, and theoretical computational complexity bounds (PlanSAT vs. Bounded PlanSAT).

---

## 1. Symbolic Agents & Fundamentals of Classical Planning

### 1.1 Why are Symbolic Agents Important?

Before deep learning and large language models, **Symbolic Agents** defined the rigorous baseline for artificial intelligence:

- **Solid Ground of Logical Reasoning**: Establishes agent definitions, state representations, and reasoning capabilities on mathematical logic (Propositional and First-Order Logic).
- **Meaningful World Modeling**: Gives clear semantics to what the agent is modeling in real-world environments.
- **Truth-Value & Inference Validation**: Provides explicit methods to evaluate truth values ($s \models g$) and prove whether inference algorithms are valid.

### 1.2 Classical Planning Environment Assumptions

**Classical Planning** imposes four strong simplifying assumptions on the task environment:

1. **Discrete**: Time, states, and actions consist of discrete units.
2. **Deterministic**: Action execution yields exact, predictable successor states without probability distributions.
3. **Static**: Environment changes occur exclusively via agent actions, unaffected by external dynamic processes.
4. **Fully Observable**: The agent possesses complete, noise-free state observation at every step.

```
+-----------------------------------------------------------------+
|                    Classical Planning Domain                    |
|                                                                 |
|   [ Fully Observable ]   [ Deterministic ]   [ Discrete State ] |
|            ^                     ^                    ^         |
|            |                     |                    |         |
|            +----------+----------+----------+---------+         |
|                       |                     |                   |
|                 [ Static Env ]     [ Global Optimality ]        |
+-----------------------------------------------------------------+
```

Under these assumptions, the core objective is to search through a state space to construct an action sequence leading from an initial state to a goal state.

### 1.3 Physical Reasoning and Current Challenges: DeepMind PushWorld

While classical planning assumptions provide a tractable foundation for discrete problems, real-world physical environments present complex physical constraints.

A prominent benchmark illustrating this boundary is the **DeepMind PushWorld** challenge (`https://deepmind-pushworld.github.io/play/`). In PushWorld, an agent must navigate grid mazes to push puzzle blocks into target configurations:
- Physical obstacles and friction dynamics mean that actions have non-local, irreversible consequences.
- Pushing a block into a corner creates a permanent dead-end state from which no valid plan exists.
- The challenge demonstrates why automated planning requires rigorous state-transition models: purely intuitive, pattern-matching models fail to anticipate multi-step physical collisions without explicit lookahead search.

---

## 2. PDDL State Representation, Goal Entailment, and Database Semantics

### 2.1 PDDL Representation Characteristics

Classical planning originated with **STRIPS** (Fikes & Nilsson, 1971) and evolved into the standard domain description language, **PDDL** (Planning Domain Definition Language):

- **Lifted Logic-Based Representation**: Uses compact, lifted representations derived from restricted First-Order Logic (FOL) with parameterized predicates.
- **Factored State Representation**: The world is modeled via state variables known as **Fluents** (properties that change over time).
- **Implicit Transitions**: State transitions are defined dynamically via action schemas. Planners compute successor states on demand rather than generating full state graphs upfront.
- **Domain-Independent Heuristics**: Allows general heuristics (e.g., Planning Graph heuristics, delete-relaxation heuristics) to guide search across arbitrary domains without specialized domain engineering.

### 2.2 State Representation & Database Semantics (CWA & UNA)

In PDDL, a state $s$ is defined as a conjunction of **Ground Function-Free Atomic Fluents** (predicates containing only constant arguments and no function symbols), or equivalently as a set of true fluents.

```
+---------------------------------------------------+-----------------------------------------------+
| Logical Statement Conjunction                     | Factored Set of True Fluents (S)              |
+---------------------------------------------------+-----------------------------------------------+
| Hungry ∧ Sleepy                                   | S = { Hungry, Sleepy }                        |
| New(Plane1) ∧ Safe(Plane1)                        | S = { New(Plane1), Safe(Plane1) }             |
| At(Plane1, SIN) ∧ At(Plane2, SFO)                 | S = { At(Plane1, SIN), At(Plane2, SFO) }      |
+---------------------------------------------------+-----------------------------------------------+
```

To keep state representations compact, classical planning relies on two database semantics:

<block>
<strong>1. Closed-World Assumption (CWA):</strong><br/>
Any fluent not explicitly listed in the state set $s$ is assumed to be false. For example, if <code>Fierce(CS3263_Lecturer)</code> is not present in state $s$, it is automatically evaluated as false. This eliminates the need to explicitly store millions of negative literals.<br/><br/>
<strong>2. Unique Names Assumption (UNA):</strong><br/>
Distinct constant symbols refer to distinct real-world entities (e.g., <code>Plane1 ≠ Plane2</code>; they strictly refer to different physical aircraft).
</block>

### 2.3 Goal Representation & Model Entailment

A goal ($g$) is a partially specified state written as a conjunction of literals. Unmentioned fluents can take any truth value.

Semantically, a state $s$ satisfies a goal $g$ if and only if $s$ **entails** $g$:

$$s \models g \iff M(s) \subseteq M(g)$$

Model-theoretically, $M(s) \subseteq M(g)$ means that **in every model $m$ where state $s$ is true, goal $g$ is automatically true**. Because $s$ is a fully specified state (stronger constraint) and $g$ is a partial goal (weaker constraint), $s$ being true implies $g$ is true, but $g$ being true does not require $s$ to be identical.

```
Model Entailment Examples:
1. Hungry ∧ Sleepy ∧ Bored  ⊨  Hungry ∧ Bored
2. At(Cargo1, SFO)          ⊨  At(c, SFO)  under substitution θ = { c / Cargo1 }
```

- **Variables in Goals**: Variables appearing in goal specifications are treated as **existentially quantified** ($\exists p. \text{At}(P_1, \text{SIN}) \land \text{At}(p, \text{SFO}) \land \text{Plane}(p)$).
- **STRIPS Restriction**: Standard STRIPS restricts goals strictly to positive, ground literals without variables.

---

## 3. Action Schemas, State Transitions, and the Frame Problem

### 3.1 Action Schemas and Grounding

An **Action Schema** is a lifted template parameterized with variables (universally quantified). Substituting variables with domain constant objects yields a **Grounded Action**.

```
Action Schema:
Action(Fly(p, from, to))
  PRECOND: At(p, from) ∧ Plane(p) ∧ Airport(from) ∧ Airport(to)
  EFFECT : ¬At(p, from) ∧ At(p, to)

Grounded Actions:
Action(Fly(P1, SFO, SIN))
  PRECOND: At(P1, SFO) ∧ Plane(P1) ∧ Airport(SFO) ∧ Airport(SIN)
  EFFECT : ¬At(P1, SFO) ∧ At(P1, SIN)

Action(Fly(P2, SIN, SFO))
  PRECOND: At(P2, SIN) ∧ Plane(P2) ∧ Airport(SIN) ∧ Airport(SFO)
  EFFECT : ¬At(P2, SIN) ∧ At(P2, SFO)
```

Each action $a$ consists of:
1. **Preconditions ($\text{Precond}(a)$)**: Conditions that must hold in state $s$ prior to execution.
2. **Effects**: Fluents added ($\text{ADD}(a)$) or deleted ($\text{DEL}(a)$) after execution.

Action applicability is defined as:

$$a \text{ is applicable in } s \iff s \models \text{Precond}(a)$$

### 3.2 Successor State Formula & The Frame Problem

Applying action $a$ to state $s$ produces successor state $s'$ according to:

$$s' = (s \setminus \text{DEL}(a)) \cup \text{ADD}(a)$$

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

<callout style="warning">
<strong>The Frame Problem:</strong><br/>
How can an automated planner specify what changes after an action without explicitly restating every unchanged fluent?<br/>
<strong>PDDL / STRIPS Resolution:</strong><br/>
By leveraging CWA and implicit persistence. Actions state only their ADD and DEL lists; all unspecified fluents are assumed to remain unchanged between time step $t$ and $t+1$.
</callout>

---

## 4. PDDL Syntax Examples: Flight Domain and Air-Cargo Case Studies

### 4.1 Case Study 1: The Flight Domain (`flight_domain`)

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

### 4.2 Case Study 2: The Air-Cargo Domain (`air-cargo`)

The classic benchmark problem modeling freight loading, inter-airport flights, and unloading:

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

```lisp
(define (problem air-cargo-problem)
  (:domain air-cargo)
  (:objects
    C1 C2 - cargo
    P1 P2 - plane
    SFO SIN - airport)
  (:init
    (At C1 SFO)
    (At C2 SIN)
    (At P1 SFO)
    (At P2 SIN)
    (Cargo C1)
    (Cargo C2)
    (Plane P1)
    (Plane P2)
    (Airport SFO)
    (Airport SIN))
  (:goal
    (and (At C1 SIN) (At C2 SFO))))
```

#### A Possible Solution Plan
A valid sequential plan achieving the goal is:
1. $\text{Load}(C_1, P_1, \text{SFO})$
2. $\text{Fly}(P_1, \text{SFO}, \text{SIN})$
3. $\text{Unload}(C_1, P_1, \text{SIN})$
4. $\text{Load}(C_2, P_2, \text{SIN})$
5. $\text{Fly}(P_2, \text{SIN}, \text{SFO})$
6. $\text{Unload}(C_2, P_2, \text{SFO})$

#### Preventing Spurious Actions
Notice that without explicit inequality constraints, the action schema permits spurious self-transitions such as:
$$\text{Fly}(P_1, \text{SIN}, \text{SIN})$$
Executing this action satisfies preconditions, deletes $\text{At}(P_1, \text{SIN})$, and immediately re-adds $\text{At}(P_1, \text{SIN})$, wasting search effort. Domain designers eliminate spurious actions by adding inequality preconditions:
$$\text{:precondition (and } \dots \text{ (not (= ?from ?to)))}$$

---

## 5. State-Space Search: Forward Progression vs. Backward Regression

Planning problems map directly to directed graph search over world states:
- **Nodes**: Complete ground states $s \in S$.
- **Root Node**: The initial state $s_0$.
- **Edges**: Applicable grounded actions $a$.
- **Goal Test**: Verifying whether node state $s$ entails goal $g$ ($s \models g$).
- **Path Solution**: A valid sequence of actions $[a_1, a_2, \dots, a_k]$ transforming $s_0$ into a goal-satisfying state $s_k$.

```
Progression (Forward Search):
[ Initial State s0 ] ----a1----> [ s1 ] ----a2----> ... ----> [ Goal s_k ]

Regression (Backward Search):
[ Initial State s0 ] <---- (s0 |= g_k) .... [ g2 ] <----a_k---- [ Goal g ]
```

### 5.1 Forward Progression Search Algorithm

Forward search moves from initial state $s_0$ toward the goal:
1. **Step 1**: Initialize root node with $s_0$.
2. **Step 2**: Test if $s \models \text{Goal}$; terminate if true.
3. **Step 3**: Identify applicable grounded actions $A(s) = \{ a \mid s \models \text{Precond}(a) \}$.
4. **Step 4**: Compute successor states $s' = (s \setminus \text{DEL}(a)) \cup \text{ADD}(a)$.
5. **Step 5**: Advance search frontier until a goal node is expanded.

#### Forward Search Worked Trace
- Start at $s_0 = \text{In}(C_2, P_1) \land \text{At}(P_1, \text{SFO}) \land \text{Cargo}(C_2) \land \text{Plane}(P_1) \land \text{Airport}(\text{SFO})$.
- Goal: $\text{At}(C_2, \text{SFO})$.
- Applicable action: $\text{Action}(\text{Unload}(c, p, a))$ grounded via substitution $\theta = \{ c/C_2, p/P_1, a/\text{SFO} \}$.
- Successor state $s_1 = (s_0 \setminus \{ \text{In}(C_2, P_1) \}) \cup \{ \text{At}(C_2, \text{SFO}) \}$.
- Since $s_1 \models \text{Goal}$, the search terminates successfully in 1 step.

### 5.2 Backward Search by Regression

Backward search regresses from Goal $g$ toward initial state $s_0$:

#### When is an Action Relevant?
An action $a$ is **relevant** to current goal description $g$ if:
1. At least one effect of $a$ matches (unifies with) a goal literal: $\text{ADD}(a) \cap g \neq \emptyset$.
2. No effect of $a$ contradicts any goal literal: $\text{DEL}(a) \cap g = \emptyset$.

#### Goal Regression Formulas
The regressed subgoal description $g'$ prior to executing action $a$ is computed by:

$$\text{POS}(g') = (\text{POS}(g) \setminus \text{ADD}(a)) \cup \text{POS}(\text{Precond}(a))$$

$$\text{NEG}(g') = (\text{NEG}(g) \setminus \text{DEL}(a)) \cup \text{NEG}(\text{Precond}(a))$$

#### Regression Worked Example 1 (Air Cargo)
- **Current Goal**: $g = \{ \text{At}(C_2, \text{SFO}) \}$.
- **Relevant Action Schema**: $\text{Action}(\text{Unload}(c, p, a))$ with preconditions $\text{In}(c, p) \land \text{At}(p, a) \land \dots$ and effect $\text{At}(c, a) \land \neg \text{In}(c, p)$.
- **Substitution**: $\theta = \{ c / C_2, a / \text{SFO} \}$. Note that plane $p$ remains an unbound variable $p'$.
- **Regressed Goal ($g'$)**:
  $$g' = \text{In}(C_2, p') \land \text{At}(p', \text{SFO}) \land \text{Cargo}(C_2) \land \text{Plane}(p') \land \text{Airport}(\text{SFO})$$

#### Regression Worked Example 2 (Air Cargo Specific Binding)
- **Current Goal**: $g = \{ \text{At}(C_1, \text{SFO}) \}$.
- **Action**: $\text{Unload}(c, p, a)$ with precondition $\text{In}(c, p) \land \text{At}(p, a)$ and effect $\text{At}(c, a)$.
- **Unification**: $\text{At}(C_1, \text{SFO})$ with $\text{At}(c, a) \implies \theta = \{ c / C_1, a / \text{SFO} \}$.
- **Substituted Action**: $\text{Unload}(C_1, P_1, \text{SFO})$.
- **Regression Execution**:
  1. Remove achieved literal: $\text{At}(C_1, \text{SFO})$.
  2. Add preconditions: $\{ \text{In}(C_1, P_1), \text{At}(P_1, \text{SFO}) \}$.
  3. **New Regressed Goal**: $g' = \{ \text{In}(C_1, P_1), \text{At}(P_1, \text{SFO}) \}$.

### 5.3 Combinatorics: $2^n$ Ground States vs. $3^n$ Partial State Descriptions

Progression and Regression operate over different state representation spaces:

| Dimension | Forward Progression | Backward Regression |
| :--- | :--- | :--- |
| **Operates On** | Concrete, fully specified states | Partial state descriptions |
| **Fluent Values** | Each fluent is strictly True or False | Each fluent is Positive, Negative, or Unmentioned |
| **State Space Size** | **$2^n$** Ground States | **$3^n$** Partial State Descriptions |

For example, with $n$ fluents, a state sets every fluent explicitly. A partial description like $\neg \text{Hungry} \land \text{Sleepy}$ specifies only 2 fluents, leaving all other $n-2$ fluents unmentioned (free to take any value). While regression searches a larger syntactic space ($3^n$), it dramatically prunes the branching factor by expanding only actions strictly relevant to goal literals.

---

## 6. Boolean Satisfiability (SAT) Fundamentals and CNF Semantics

### 6.1 SAT Definition & CNF Form

**Boolean Satisfiability (SAT)** asks whether there exists a truth assignment (model $m$) that makes a Boolean formula evaluate to true.

Formulas are structured into **Conjunctive Normal Form (CNF)**:
- A conjunction ($\land$) of clauses.
- Each clause is a disjunction ($\lor$) of literals (variables or their negations).

$$\alpha = (A \lor \neg B \lor C) \land (\neg A \lor D) \land (B \lor \neg C)$$

If model $m$ satisfies $\alpha$, written $m \models \alpha$, $M(\alpha)$ denotes the set of all satisfying models.

### 6.2 Complexity & Modern Solvers

- **NP-Completeness**: SAT was proven to be NP-complete by the Cook-Levin theorem.
- **Modern CDCL Solvers**: Using Conflict-Driven Clause Learning (CDCL) and VSIDS heuristics, modern SAT solvers solve instances with millions of variables in seconds.
- **Applications**: Circuit verification, software testing, automated theorem proving, cryptanalysis, operations research, and SATPlan.

---

## 7. Planning as SAT Reduction: SATPlan Algorithm and Axiom Encodings

**SATPlan** (Kautz & Selman) reduces planning into propositional satisfiability.

### 7.1 SATPlan Algorithm Pseudocode

SATPlan uses a **Bounded Horizon ($T$)** strategy, incrementally increasing plan length step $t$ until a satisfying model is found:

```
function SATPLAN(init, transition, goal, T_max) returns solution or failure
  inputs: init, transition, goal, constitute a description of the problem
          T_max, an upper limit for plan length

  for t = 0 to T_max do
    cnf <- TRANSLATE-TO-SAT(init, transition, goal, t)
    model <- SAT-SOLVER(cnf)    <-- Assignment of values to variables
    if model is not null then
      return EXTRACT-SOLUTION(model)
  return failure
```

When `SAT-SOLVER` returns a satisfying model, SATPlan extracts actions where action variables evaluate to true, outputting a valid plan trajectory.

### 7.2 The Four Formulated Axioms in SATPlan

Translating a planning problem into CNF requires four axiom types:

1. **Initial & Goal Axioms**:
   - At $t=0$: Assert $P_0$ or $\neg P_0$ according to CWA.
   - At $t=T$: Assert goal literals $G_T$.
2. **Action Implication Axioms**:
   - Action $A_t$ implies preconditions at $t$ and effects at $t+1$:
     $$A_t \implies \text{Precond}(A)_t \land \text{ADD}(A)_{t+1} \land \neg \text{DEL}(A)_{t+1}$$
3. **Successor-State Axioms**:
   - Based on Reiter's logic: *Fluent $P$ is true at $t+1$ iff an action at $t$ added $P$, OR $P$ was already true at $t$ and no action at $t$ deleted $P$*:
     $$P_{t+1} \iff \left( \bigvee_{A \in \text{Add}(P)} A_t \right) \lor \left( P_t \land \neg \bigvee_{B \in \text{Del}(P)} B_t \right)$$
   - **Efficiency**: Naive frame axioms require $O(mn)$ clauses for $m$ actions and $n$ fluents. Successor-State Axioms encode only actions affecting each fluent, reducing total axioms to **$O(n)$**.
4. **Action Exclusion Axioms**:
   - Prevents conflicting simultaneous action execution: $\neg A_t \lor \neg B_t$.

### 7.3 Complete Worked Example: "Eat a Cake!" (Have Cake and Eat it Too)

Consider the classic planning problem where an agent wants to eat a cake and still have a cake:

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
Prevent executing contradictory actions simultaneously:
$$\neg \text{Eat}(\text{Cake}, 0) \lor \neg \text{Bake}(\text{Cake}, 0)$$
$$\neg \text{Eat}(\text{Cake}, 1) \lor \neg \text{Bake}(\text{Cake}, 1)$$

#### Step 4: Solving the SAT Problem
- At horizon $T = 1$: The goal requires $\text{Eaten}(\text{Cake}, 1)$, which requires $\text{Eat}(\text{Cake}, 0)$, which requires $\text{Have}(\text{Cake}, 0)$. But $\text{Have}(\text{Cake}, 0)$ is false in the initial state! Formula is **UNSAT**.
- At horizon $T = 2$:
  - Initial: $\neg \text{Have}(\text{Cake}, 0)$.
  - Set $\text{Bake}(\text{Cake}, 0) = \text{True} \implies \text{Have}(\text{Cake}, 1) = \text{True}$.
  - Set $\text{Eat}(\text{Cake}, 1) = \text{True} \implies \neg \text{Have}(\text{Cake}, 2) = \text{True}$ and $\text{Eaten}(\text{Cake}, 2) = \text{True}$.
  - The solver returns a satisfying model yielding the optimal 2-step plan:
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

## 9. Seven Classical Planning Paradigms, Algorithm Properties, and Complexity Bounds

### 9.1 Seven Classical Planning Paradigms

1. **Goal-Directed Planning**: Symbolic deduction using STRIPS / PDDL.
2. **Search-Based Planning**: State-space Progression and Regression.
3. **SAT-Based Planning**: Propositional CNF reduction (SATPlan).
4. **Planning Graph Approaches**: Reachability graphs (Graphplan) deriving informative heuristics.
5. **Situation Calculus**: First-order logic reasoning over actions and situations.
6. **Constraint Satisfaction Problem (CSP)**: Constraint network formulations for bounded planning.
7. **Partial-Order Planning (POP)**: Directed acyclic graph plans supporting parallel execution.

### 9.2 Three Key Algorithm Properties

- **Soundness**: Every returned plan is mathematically guaranteed to be valid and executable.
- **Completeness**: Guarantees finding a solution if one exists in the search space.
- **Optimality**: Guarantees finding the minimal-cost or shortest plan length.

### 9.3 Theoretical Complexity (PlanSAT vs. Bounded PlanSAT)

| Decision Problem | Mathematical Definition | Complexity Class |
| :--- | :--- | :--- |
| **PlanSAT** | Does **any valid plan** of arbitrary length exist? | **PSPACE-complete** (Subclasses without negative effects in **P**) |
| **Bounded PlanSAT** | Does a valid plan of length **$\le k$** exist? | **NP-complete** |

- **PlanSAT**: Testing plan existence is PSPACE-complete because the shortest plan can have length exponential in the number of state fluents ($2^n - 1$), requiring exponential steps to execute even though verification fits within polynomial space.
- **Bounded PlanSAT**: Because plan length is bounded by $k$, a candidate plan can be guessed and verified in polynomial time, placing it in **NP** (and NP-complete via reduction from 3-SAT).
- **Core Practical Insight**: Finding **Optimal Plans** is computationally harder than finding **Satisficing (Suboptimal) Plans**.

---

## 10. Summary

Classical AI Planning establishes logical decision-making via STRIPS and PDDL representations. By utilizing CWA and UNA semantics, resolving the Frame Problem with $O(n)$ Successor-State Axioms, and reducing problems into state-space search or SATPlan CNF formulas, classical planning provides enduring theoretical principles for autonomous intelligent agents.

<reviewkit>
<takeaways>
- **Symbolic Agents & PDDL:** Ground decision making in mathematical logic. PDDL uses lifted First-Order Logic and Fluents for Factored State representations, simplified via Closed-World (CWA) and Unique Names (UNA) assumptions.
- **Goal Entailment & State Transitions:** Goals are partial state descriptions ($s \models g \iff M(s) \subseteq M(g)$). Successor states are computed via $s' = (s \setminus \text{DEL}(a)) \cup \text{ADD}(a)$. Spurious actions like `Fly(P1, SIN, SIN)` are pruned via inequality preconditions.
- **Progression vs. Regression:** Forward progression searches across $2^n$ ground states; backward regression searches across $3^n$ partial state descriptions using MGUs to eliminate irrelevant branches.
- **SATPlan & Successor-State Axioms:** SATPlan translates horizon $T$ planning into CNF. Successor-State Axioms ($P_{t+1} \iff \text{AddActions}_t \lor (P_t \land \neg \text{DelActions}_t)$) slash frame axiom overhead from $O(mn)$ to $O(n)$, proven via the 2-step 'Eat a Cake!' puzzle.
- **Industrial Systems & Ecosystem:** Deployed in Mars rover autonomy (Mars 2020), manufacturing, and gaming. Supported by AIPlanning4EU's `unified-planning` library and IPC 2023 containerized solvers.
- **Complexity Bounds:** Arbitrary length PlanSAT is PSPACE-complete; step-bounded Bounded PlanSAT is NP-complete.
</takeaways>
<qprompt/>
</reviewkit>

## References

1. Fikes, R. E., & Nilsson, N. J. (1971). STRIPS: A new approach to the application of theorem proving to problem solving. *Artificial Intelligence*, 2(3-4), 189-208. [ScienceDirect](https://doi.org/10.1016/0004-3702(71)90010-5)
2. Kautz, H., & Selman, B. (1992). Planning as satisfiability. In *Proceedings of the 10th European Conference on Artificial Intelligence (ECAI)* (pp. 359-363).
3. Ghallab, M., Nau, D., & Traverso, P. (2004). *Automated Planning: Theory and Practice*. Morgan Kaufmann.
4. Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4th ed.). Pearson.
5. Rabideau, G., Wong, V., Gaines, D., Agrawal, J., Chien, S., Kuhn, S., Fosse, E., & Biehl, J. (2020). Onboard automated scheduling for the Mars 2020 Rover. In *Proceedings of i-SAIRAS 2020*. ESA.
6. Sohrabi, S. (2019). AI planning for enterprise: Putting theory into practice. In *Proceedings of IJCAI-19* (pp. 6408-6410).
7. Neufeld, X., Mostaghim, S., & Perez-Liebana, D. (2019). Building a planner: A survey of planning systems used in commercial video games. *IEEE Transactions on Games*, 11(2), 91-108.
8. AIPlanning4EU Project. (2023). *The Unified Planning Library*. European Commission Horizon 2020. [GitHub](https://github.com/aiplan4eu/unified-planning)
9. International Planning Competition. (2023). *IPC 2023 Classical Tracks*. ICAPS. [Website](https://ipc2023-classical.github.io)
