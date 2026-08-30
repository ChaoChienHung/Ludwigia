<meta>
Title: Classical AI Planning and SATPlan: From STRIPS, PDDL, and State-Space Search to Propositional Satisfiability Reduction
Summary: A comprehensive exploration of Classical AI Planning theory, representation, search, and logic-based reduction. Covers symbolic agents, PDDL and STRIPS semantics, Closed-World Assumption (CWA), Unique Names Assumption (UNA), model-theoretic goal entailment (s |= g, M(s) <= M(g)), action schemas, and successor state mechanics. Compares forward progression search with backward regression search (2^n ground states vs. 3^n partial state descriptions). Details Boolean Satisfiability (SAT) and SATPlan, showing how Successor-State Axioms resolve the frame problem in O(n) axioms instead of O(mn). Concludes with algorithm properties (soundness, completeness, optimality) and complexity bounds (PlanSAT PSPACE-complete vs. Bounded PlanSAT NP-complete).
Slug: classical-planning-strips-pddl-and-satplan
Output: notes/classical-planning-strips-pddl-and-satplan/classical-planning-strips-pddl-and-satplan.html
CanonicalId: classical-planning-strips-pddl-and-satplan
Style: default
EstimatedReadingTime: true
Lang: en
Tags: classical planning, strips, pddl, satplan, automated reasoning, ai planning
Status: drafting
Published: 2026-08-29
LastModified: 2026-08-29
</meta>
<draft>
- 1. Symbolic Agent & Logical Foundations
    - Importance: Establishes agent definition, representation, and reasoning capabilities on solid logical reasoning ground.
    - World Modeling & Verification: Gives meaningful representations of what the agent is modeling in the world, providing methods to establish truth values and validate inference algorithm soundness.
- 2. Classical Planning Overview & Environment Characteristics
    - Definition: Finding a sequence of actions to achieve a goal state from an initial state.
    - Environment Characteristics: Discrete, deterministic, static, and fully observable (closely related to finding global optimal solutions).
    - Four Core Challenges: Problem representation (PDDL, STRIPS), Search methods (Search, Satisfiability, SAT-based solving), Domain-independent heuristics, Hierarchical abstraction.
- 3. Classical Planning Origins & PDDL Characteristics
    - Origins: STanford Research Institute Problem Solver (STRIPS) introduced by Fikes and Nilsson (1971), laying foundations for the Planning Domain Definition Language (PDDL).
    - PDDL Representation: Standard modeling language derived from STRIPS; compact, lifted form using restricted First-Order Logic (FOL).
    - Factored State Representation: The world is modeled via state variables known as fluents (properties that change over time).
    - Implicit Transitions: State transitions are defined dynamically via action schemas, computing successor states on demand without generating full state graphs upfront.
    - Domain-Independent Heuristics: General methods designed to guide state-space search across arbitrary domains without specialized domain engineering.
- 4. State Representation and Database Semantics
    - State Definition: A state is a conjunction of ground function-free atomic fluents (predicates with constant arguments only, no function symbols), or equivalently a set of true fluents.
    - Closed-World Assumption (CWA): Any fluent not explicitly listed in the state set is assumed to be false.
    - Unique Names Assumption (UNA): Distinct constant symbols refer to distinct real-world entities.
- 5. Goal Representation and Model Entailment
    - Goal Definition: A goal is a partially specified state written as a conjunction of literals; unmentioned fluents can take any truth value.
    - State Satisfaction ($s \models g$): A state $s$ satisfies a goal $g$ if $s$ entails $g$ ($s \models g$, or $M(s) \subseteq M(g)$—meaning in every model where $s$ is true, $g$ is automatically true).
    - Variable Treatment: Variables appearing in goal specifications are treated as existentially quantified.
    - STRIPS Restriction: Standard STRIPS restricts goals strictly to positive, ground literals without variables.
- 6. Action Schemas, Grounding, and Applicability
    - Action Schemas: Parameterized lifted representations defining families of actions using universally quantified variables.
    - Grounded Actions: Concrete action instances where variables are substituted with specific domain objects.
    - Action Structure: Preconditions (conditions that must hold prior to action execution) and Effects (ADD fluents and DEL fluents).
    - Applicability Condition: Action $a$ is applicable in state $s$ if and only if $s$ entails the preconditions of $a$ ($s \models \text{Precond}(a)$).
- 7. State Transition Mechanics and the Frame Problem
    - Successor State Formula: $s' = (s \setminus \text{DEL}(a)) \cup \text{ADD}(a)$, where $\text{DEL}(a)$ represents deleted fluents and $\text{ADD}(a)$ represents added fluents.
    - Frame Problem Challenge: Specifying what changes after an action without restating everything that remains unchanged.
    - PDDL/STRIPS Resolution: Explicitly list only ADD and DEL sets; all unspecified fluents are assumed to remain unchanged between time step $t$ and $t+1$.
- 8. PDDL Domain and Problem Specifications
    - Complete PDDL `air-cargo` Domain code block (`(define (domain air-cargo) ...)`).
    - Complete PDDL `air-cargo-problem` Problem code block (`(define (problem air-cargo-problem) ...)`).
    - Caveats: Handling and preventing spurious/redundant actions like `Fly(P1, SIN, SIN)`.
- 9. Planning as State-Space Search
    - Mapping: Planning problem $\rightarrow$ Graph search problem over states. Nodes = ground world states (root = initial state), Edges = grounded action state transitions, Goal test = verifying state satisfies all goal fluents, Plan = valid path of actions from initial state node to goal node.
    - Search Directions: Forward search (progression from initial state to goal) and backward search (regression from goal to initial state).
- 10. Forward Progression Search Algorithm
    - Steps: Step 1 start at initial state $s_0$; Step 2 test if $s \models \text{Goal}$; Step 3 identify applicable grounded actions where $s \models \text{Precond}(a)$; Step 4 compute $s' = (s \setminus \text{DEL}(a)) \cup \text{ADD}(a)$; Step 5 advance search frontier until a goal state is reached.
    - Air-Cargo Execution Example: Initial state $s_0$ (`In(C2, P1)`, `At(P1, SFO)`, `Cargo(C2)`, `Plane(P1)`, `Airport(SFO)`), goal `At(C2, SFO)`, action schema `Unload`, substitution $\theta=\{c/\text{C2}, p/\text{P1}, a/\text{SFO}\}$, resulting successor state $s_1$.
- 11. Backward Search by Regression
    - Progression Direction: From Goal back to Initial State.
    - Termination Condition: Terminate when Goal is entailed by Initial State ($s_0 \models \text{Goal}$).
    - Relevance Conditions: At least one effect of action matches or unifies with a literal in current goal; no effect contradicts any literal in current goal; Most General Unifiers (MGU) used to prevent over-branching.
    - Goal Regression Formulas:
        - $\text{POS}(g') = (\text{POS}(g) \setminus \text{ADD}(a)) \cup \text{POS}(\text{Precond}(a))$
        - $\text{NEG}(g') = (\text{NEG}(g) \setminus \text{DEL}(a)) \cup \text{NEG}(\text{Precond}(a))$
    - Core Concept: Step backward by stripping away subgoals satisfied by chosen action and inserting required action preconditions.
- 12. State Sets and Combinatorics in Regression
    - Regression operates over sets of states defined by partial state descriptions rather than individual fully specified states.
    - Combinatorial Scale: For $n$ fluents, there exist $2^n$ ground states, but $3^n$ possible partial state descriptions (each fluent being positive, negative, or unmentioned).
- 13. Boolean Satisfiability (SAT)
    - SAT Problem Definition: Determining if there exists a variable truth assignment that makes a given Boolean formula evaluate to true.
    - CNF (Conjunctive Normal Form) Semantics: Conjunction ($\land$) of clauses, where each clause is a disjunction ($\lor$) of literals (e.g., $(A \lor \neg B) \land (\neg A \lor C)$). Model $m \models \alpha$ means $m$ satisfies $\alpha$; $M(\alpha)$ denotes the set of all satisfying models of $\alpha$.
    - Complexity & Modern Solvers: Cook-Levin theorem proved SAT as the first NP-complete problem. Modern CDCL (Conflict-Driven Clause Learning) solvers handle formulas with millions of variables and clauses in seconds.
    - Real-World Applications: Circuit design, software/hardware formal verification, automated theorem proving, cryptanalysis, operations research, automated planning.
- 14. Planning as Boolean Satisfiability (SATPlan)
    - Core Principle: Reduce classical planning problems into a CNF propositional formula at bounded horizon $T$; a satisfying truth assignment (model) maps directly to a valid plan execution trajectory.
    - SATPlan Algorithm Pseudocode & Steps (matching the provided algorithm image):
        - Inputs: `init`, `transition`, `goal`, `T_max`
        - Loop $t = 0$ to $T_{\max}$: `cnf` $\leftarrow$ `TRANSLATE-TO-SAT(init, transition, goal, t)`
        - `model` $\leftarrow$ `SAT-SOLVER(cnf)`
        - If `model` is not null $\implies$ return `EXTRACT-SOLUTION(model)`; else return failure.
- 15. SATPlan Axiom Encodings
    - Initial State Assertion: Ground literals at time step 0 asserting true and false fluents (via CWA).
    - Goal State Assertion: Ground literals required at target horizon step $T$.
    - Action Implication Axioms: Action at time step $t \implies \text{Precond}_t \land \text{ADD}_{t+1} \land \neg \text{DEL}_{t+1}$ (e.g., $\text{Eat}(\text{Cake}, t) \implies \text{Have}(\text{Cake}, t) \land \neg \text{Have}(\text{Cake}, t+1) \land \text{Eaten}(\text{Cake}, t+1)$).
    - Successor-State Axioms: Define necessary and sufficient conditions for fluent $P$ at $t+1$: $P_{t+1} \iff (\text{AddActions}_t \lor (P_t \land \neg \text{DelActions}_t))$. Encodes actions affecting a specific fluent, reducing frame axioms from naive $O(mn)$ to $O(n)$.
    - Action Exclusion Axioms: Mutual exclusion preventing conflicting simultaneous actions at the same step (e.g., $\neg \text{Eat}(\text{Cake}, t) \lor \neg \text{Bake}(\text{Cake}, t)$).
- 16. SATPlan Characteristics & Limitations
    - Properties: Guarantees finding shortest plan if one exists; works in fully observable or sensorless configurations (related to global optimality).
    - Limitations: Prone to high memory consumption on large horizons; intermediate expansions may generate spurious action combinations if constraints are incomplete.
- 17. Real-World Application Domains
    - Logistics and Manufacturing, Enterprise Systems, Robotics, Healthcare, Video Games (NPC decision trees), Space Missions, Real-Time Decision Making.
- 18. Classical Planning Paradigms & Algorithm Properties
    - Seven Paradigms: Goal-directed (STRIPS/PDDL), Search-based (Progression/Regression), SAT-based (SATPlan), Planning Graphs (Graphplan heuristics), Situation Calculus, CSP formulation, Partial-Order Planning (POP).
    - Algorithm Properties: Soundness, Completeness, Optimality.
- 19. Theoretical Characteristics & Computational Complexity
    - PlanSAT: Decision problem asking if any valid plan exists (PSPACE-complete in general; subclasses without negative effects in P).
    - Bounded PlanSAT: Decision problem asking if plan of length $\le k$ exists (NP-complete). Finding optimal plans is computationally harder than finding satisficing suboptimal plans.
</draft>

# Classical AI Planning and SATPlan: From STRIPS, PDDL, and State-Space Search to Propositional Satisfiability Reduction

In Artificial Intelligence (AI), **Symbolic Agents** establish the core mathematical foundation for reasoning and decision making. By representing world states, action preconditions, and state transitions using formal logic, symbolic agents provide a solid ground for world modeling, allowing computer systems to prove the correctness (Soundness) and completeness of inference algorithms.

This note systematically decomposes **Classical AI Planning**. We begin with the formal representation languages <information context="Stanford Research Institute Problem Solver">STRIPS</information> and <information context="Planning Domain Definition Language">PDDL</information>, database semantics (Closed-World Assumption and Unique Names Assumption), and model-theoretic goal entailment ($s \models g$). We then analyze forward progression search and backward regression search over state spaces. Next, we introduce Boolean Satisfiability (SAT) fundamentals and detail how **SATPlan** leverages **Successor-State Axioms** to solve the Frame Problem in $O(n)$ axioms instead of $O(mn)$. Finally, we outline seven classical planning paradigms and analyze theoretical computational complexity bounds (PlanSAT vs. Bounded PlanSAT).

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

---

## 2. PDDL State Representation, Goal Entailment, and Database Semantics

### 2.1 PDDL Representation Characteristics

Classical planning originated with STRIPS (Fikes & Nilsson, 1971) and evolved into the standard domain description language, PDDL.

- **Lifted Logic-Based Representation**: Uses compact, lifted representations derived from restricted First-Order Logic (FOL) with parameterized predicates.
- **Factored State Representation**: The world is modeled via state variables known as **Fluents** (properties that change over time).
- **Implicit Transitions**: State transitions are defined dynamically via action schemas. Planners compute successor states on demand rather than generating full state graphs upfront.
- **Domain-Independent Heuristics**: Allows general heuristics (e.g., Planning Graph heuristics) to guide search across arbitrary domains without specialized domain engineering.

### 2.2 State Representation & Database Semantics (CWA & UNA)

In PDDL, a state $s$ is defined as a conjunction of **Ground Function-Free Atomic Fluents** (predicates containing only constant arguments and no function symbols), or equivalently as a set of true fluents.

To keep state representations compact, classical planning relies on two database semantics:

<block>
<strong>1. Closed-World Assumption (CWA):</strong><br/>
Any fluent not explicitly listed in the state set $s$ is assumed to be false. This eliminates the need to explicitly store millions of negative literals.<br/><br/>
<strong>2. Unique Names Assumption (UNA):</strong><br/>
Distinct constant symbols refer to distinct real-world entities (e.g., <code>Plane1</code> and <code>Plane2</code> strictly refer to different aircraft).
</block>

### 2.3 Goal Representation & Model Entailment

A goal ($g$) is a partially specified state written as a conjunction of literals. Unmentioned fluents can take any truth value.

Semantically, a state $s$ satisfies a goal $g$ if and only if $s$ **entails** $g$:

$$s \models g \iff M(s) \subseteq M(g)$$

Model-theoretically, $M(s) \subseteq M(g)$ means that **in every model $m$ where state $s$ is true, goal $g$ is automatically true**. Because $s$ is a fully specified state (stronger constraint) and $g$ is a partial goal (weaker constraint), $s$ being true implies $g$ is true, but $g$ being true does not require $s$ to be identical.

Variables in goals are existentially quantified. Standard STRIPS restricts goals strictly to positive, ground literals without variables.

---

## 3. Action Schemas, State Transitions, and the Frame Problem

### 3.1 Action Schemas and Grounding

An Action Schema is a lifted template parameterized with variables. Substituting variables with domain constant objects yields a **Grounded Action**.

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
+-------------------+
| At(Plane1, SFO)   |        Action: Fly(Plane1, SFO, JFK)
| At(Cargo1, SFO)   |      --------------------------------->
| Cargo(Cargo1)     |      DEL: { At(Plane1, SFO) }
+-------------------+      ADD: { At(Plane1, JFK) }
          |
          v
  Successor State (s')
+-------------------+
| At(Plane1, JFK)   |  <-- Updated by ADD
| At(Cargo1, SFO)   |  <-- Preserved automatically (Frame Axioms)
| Cargo(Cargo1)     |  <-- Preserved automatically
+-------------------+
```

<callout style="warning">
<strong>The Frame Problem:</strong><br/>
How can an automated planner specify what changes after an action without explicitly restating every unchanged fluent?<br/>
<strong>PDDL / STRIPS Resolution:</strong><br/>
By leveraging CWA and implicit persistence. Actions state only their ADD and DEL lists; all unspecified fluents are assumed to remain unchanged between time step $t$ and $t+1$.
</callout>

---

## 4. PDDL Syntax Example: Air-Cargo Domain and Problem Specifications

Below is the standard PDDL code for the Air-Cargo domain:

### 4.1 Domain Specification (`air-cargo`)

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

### 4.2 Problem Specification (`air-cargo-problem`)

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

Planners must handle caveats like preventing **spurious actions** (e.g., `Fly(P1, SFO, SFO)`), avoiding redundant graph expansions.

---

## 5. State-Space Search: Forward Progression vs. Backward Regression

Searching for plans maps the problem into a state graph, explored either via **Forward Progression** or **Backward Regression**.

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

### 5.2 Backward Search by Regression

Backward search regresses from Goal $g$ to $s_0$:

- **Action Relevance**: Action $a$ is relevant to $g$ iff (1) at least one ADD effect unifies with a goal literal, and (2) no effect contradicts any goal literal.
- **Goal Regression Formulas**:
  $$\text{POS}(g') = (\text{POS}(g) \setminus \text{ADD}(a)) \cup \text{POS}(\text{Precond}(a))$$
  $$\text{NEG}(g') = (\text{NEG}(g) \setminus \text{DEL}(a)) \cup \text{NEG}(\text{Precond}(a))$$
- **Most General Unifier (MGU)**: Applied in lifted regression to prevent arbitrary variable substitution branching.

### 5.3 Combinatorics: $2^n$ Ground States vs. $3^n$ Partial State Descriptions

Progression and Regression operate over different state representation spaces:

| Dimension | Forward Progression | Backward Regression |
| :--- | :--- | :--- |
| **Operates On** | Concrete, fully specified states | Partial state descriptions |
| **Fluent Values** | Each fluent is strictly True or False | Each fluent is Positive, Negative, or Unmentioned |
| **State Space Size** | **$2^n$** Ground States | **$3^n$** Partial State Descriptions |

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
     *Example*: $\text{Eat}(\text{Cake}, t) \implies \text{Have}(\text{Cake}, t) \land \neg \text{Have}(\text{Cake}, t+1) \land \text{Eaten}(\text{Cake}, t+1)$
3. **Successor-State Axioms**:
   - Based on Reiter's logic: *Fluent $P$ is true at $t+1$ iff an action at $t$ added $P$, OR $P$ was already true at $t$ and no action at $t$ deleted $P$*:
     $$P_{t+1} \iff \left( \bigvee_{A \in \text{Add}(P)} A_t \right) \lor \left( P_t \land \neg \bigvee_{B \in \text{Del}(P)} B_t \right)$$
   - **Efficiency**: Naive frame axioms require $O(mn)$ clauses for $m$ actions and $n$ fluents. Successor-State Axioms encode only actions affecting each fluent, reducing total axioms to **$O(n)$**.
4. **Action Exclusion Axioms**:
   - Prevents conflicting simultaneous action execution: $\neg A_t \lor \neg B_t$.

---

## 8. Seven Classical Planning Paradigms, Algorithm Properties, and Computational Complexity

### 8.1 Seven Classical Planning Paradigms

1. **Goal-Directed Planning**: Symbolic deduction using STRIPS / PDDL.
2. **Search-Based Planning**: State-space Progression and Regression.
3. **SAT-Based Planning**: Propositional CNF reduction (SATPlan).
4. **Planning Graph Approaches**: Reachability graphs (Graphplan) deriving informative heuristics.
5. **Situation Calculus**: First-order logic reasoning over actions and situations.
6. **Constraint Satisfaction Problem (CSP)**: Constraint network formulations.
7. **Partial-Order Planning (POP)**: Directed graph plan networks supporting parallel execution.

### 8.2 Three Key Algorithm Properties

- **Soundness**: Every returned plan is mathematically guaranteed to be valid.
- **Completeness**: Guarantees finding a solution if one exists in the search space.
- **Optimality**: Guarantees finding the minimal-cost or shortest plan length.

### 8.3 Theoretical Complexity (PlanSAT vs. Bounded PlanSAT)

| Decision Problem | Mathematical Definition | Complexity Class |
| :--- | :--- | :--- |
| **PlanSAT** | Does **any valid plan** of arbitrary length exist? | **PSPACE-complete** (Subclasses without negative effects in **P**) |
| **Bounded PlanSAT** | Does a valid plan of length **$\le k$** exist? | **NP-complete** |

Finding **Optimal Plans** is computationally harder than finding **Satisficing Plans**.

---

## 9. Summary

Classical AI Planning establishes logical decision-making via STRIPS and PDDL representations. By utilizing CWA and UNA semantics, resolving the Frame Problem with $O(n)$ Successor-State Axioms, and reducing problems into state-space search or SATPlan CNF formulas, classical planning provides enduring theoretical principles for autonomous intelligent agents.

<reviewkit>
<takeaways>
- **Symbolic Agents & PDDL:** Symbolic agents ground decision making in mathematical logic. PDDL uses lifted First-Order Logic and Fluents for Factored State representations, simplified via Closed-World (CWA) and Unique Names (UNA) assumptions.
- **Goal Entailment & State Transitions:** Goals are partial state descriptions ($s \models g \iff M(s) \subseteq M(g)$). Successor states are dynamically computed via $s' = (s \setminus \text{DEL}(a)) \cup \text{ADD}(a)$.
- **Progression vs. Regression:** Forward progression searches across $2^n$ ground states; backward regression searches across $3^n$ partial state descriptions using MGUs to minimize branching.
- **SATPlan & Successor-State Axioms:** SATPlan translates horizon $T$ planning into CNF. Successor-State Axioms ($P_{t+1} \iff \text{AddActions}_t \lor (P_t \land \neg \text{DelActions}_t)$) slash frame axiom overhead from $O(mn)$ to $O(n)$.
- **Complexity Bounds:** Arbitrary length PlanSAT is PSPACE-complete; step-bounded Bounded PlanSAT is NP-complete.
</takeaways>
<qprompt/>
</reviewkit>

## References

1. Fikes, R. E., & Nilsson, N. J. (1971). STRIPS: A new approach to the application of theorem proving to problem solving. *Artificial Intelligence*, 2(3-4), 189-208. [ScienceDirect](https://doi.org/10.1016/0004-3702(71)90010-5)
2. Kautz, H., & Selman, B. (1992). Planning as satisfiability. In *Proceedings of the 10th European Conference on Artificial Intelligence (ECAI)* (pp. 359-363).
3. Ghallab, M., Nau, D., & Traverso, P. (2004). *Automated Planning: Theory and Practice*. Morgan Kaufmann.
4. Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4th ed.). Pearson.
