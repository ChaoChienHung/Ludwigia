<meta>
Title: NUS CS5446 Reinforcement Learning and Sequential Decision Making
Summary: Comprehensive lecture and study notes for NUS CS5446 Reinforcement Learning and Sequential Decision Making (AI Planning and Decision Systems), covering AI planning foundations, classical planning (STRIPS, PDDL, SATPlan), LFM-assisted modern planning, scalable heuristics (HTN), rational decision theory, utility theory, game theory, Markov decision processes, model-free reinforcement learning, value function approximation, Deep Q-Networks (DQN), policy gradients, REINFORCE, Actor-Critic methods, advanced trust-region policy search (TRPO, PPO), and reward shaping (potential-based policy invariance, exploration bonuses with pseudo-counts and RND, exploitation bottleneck discovery, process reward models, RLHF preference alignment, and advanced multi-agent reward architectures ReLara, CenRA, SASR).
Slug: nus-cs5446-reinforcement-learning-and-sequential-decision-making
Output: notes/NUS CS5446 Reinforcement Learning and Sequential Decision Making/NUS CS5446 Reinforcement Learning and Sequential Decision Making.html
CanonicalId: nus-cs5446-reinforcement-learning-and-sequential-decision-making
Style: default
EstimatedReadingTime: true
Lang: en
Tags: AI Planning, Classical Planning, STRIPS, PDDL, SATPlan, Automated Reasoning, Decision Theory, Game Theory, Reinforcement Learning
Status: drafting
Published: 2026-08-20
LastModified: 2026-09-16
</meta>

# NUS CS5446 Reinforcement Learning and Sequential Decision Making


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

#### 2. Ignore Delete Effects: Manhattan Distance, $h_{\max}$, $h_{\text{add}}$, and $h_{\text{FF}}$
If we relax the action schema by dropping all negative effects ($\neg\text{On}(t, s_1) \land \neg\text{Blank}(s_2)$):
- A tile can slide to an adjacent square *without vacating its current location* and *without requiring the destination cell to be blank*. Tiles can duplicate and freely overlap on the same grid cell.
- The minimal cost to move tile $t$ from $(x_1, y_1)$ to target $(x_2, y_2)$ reduces to its individual **Manhattan Distance** (minimum over independent copies):

$$d_{\text{Manhattan}}(t) = |x_1 - x_2| + |y_1 - y_2|$$

**Concrete Tile Calculations for Initial State (Slide 17):**
- Tile 1: at $(1, 2)$, goal at $(1, 3) \implies |1 - 1| + |2 - 3| = 1$
- Tile 2: at $(1, 3)$, goal at $(2, 3) \implies |1 - 2| + |3 - 3| = 1$
- Tile 8: at $(2, 2)$, goal at $(1, 2) \implies |2 - 1| + |2 - 2| = 1$
- Tiles 3, 4, 5, 6, 7: already at target positions $\implies \text{distance} = 0$.

From this delete-relaxation, we obtain three standard domain-independent heuristic estimates:
- **Max Heuristic ($h_{\max}$):**
  $$h_{\max}(s) = \max_{i} d_{\text{Manhattan}}(t_i) = \max \{ 1, 1, 1, 0, 0, 0, 0, 0 \} = 1$$
  *(Strictly admissible, but weak because it assumes all remaining tiles move for free).*
- **Additive Heuristic ($h_{\text{add}}$):**
  $$h_{\text{add}}(s) = \sum_{i} d_{\text{Manhattan}}(t_i) = 1 + 1 + 1 = 3$$
  *(Highly informative and discriminative, but not guaranteed to be admissible in general PDDL domains where positive action interactions allow one action to achieve multiple subgoals).*
- **Fast-Forward Heuristic ($h_{\text{FF}}$):**
  $$h_{\text{FF}}(s) = 3$$
  *(Computes the number of actions in a greedy relaxed plan; highly informative and widely successful in satisficing planners).*

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
# Week 4 - Markov Decision Processes: Sequential Decisions, Bellman Optimality, Value Iteration, and Policy Iteration

<draft>
- 1. Foundations of Sequential Decision Making & Environment Taxonomy
    - Paradigm Comparison: Classical Planning vs. Decision Analysis vs. Sequential Decision Making under Uncertainty vs. Markov Decision Processes (MDPs) vs. Reinforcement Learning (RL).
    - Dimension Analysis: Sequential vs. Episodic, Deterministic vs. Stochastic, Full vs. Partial Observability, Known vs. Unknown Environment Models.
    - Sequential Decision Problems: Decisions unfolding over time where utility depends on the entire action sequence and trajectory history. Search and classical planning as deterministic special cases.
- 2. Motivating Real-World Scenarios & The 4x3 Grid World Benchmark
    - Scenario 1: Percy the Mars Rover:
        - Operational Dilemma: Moving across rocky terrain, drilling/sampling, data transmission, and recharging via solar panels.
        - Stochastic Factors: Harsh terrain hazards, unexpected dust storms, variable sunlight.
        - Objective: Maximize cumulative returned scientific data before complete energy depletion.
    - Scenario 2: Ride-Hailing Fleet Management (e.g., Grab / Uber / Lyft):
        - Spatial clusters, stochastic passenger request distributions, traffic congestion.
        - Driver Actions: Wait in current zone, Relocate to high-demand surge areas, or Refuel/Recharge.
        - Objective: Maximize long-term driver efficiency and fleet profitability over a multi-hour operating horizon.
    - Scenario 3: The 4x3 Grid World Benchmark (Russell & Norvig):
        - Environment Geometry: 4 columns x 3 rows grid; start cell (1,1); obstacle at (2,2); terminal absorbing states at (4,3) [+1 reward] and (4,2) [-1 reward].
        - Stochastic Transition Dynamics: Intended direction (0.8 probability), perpendicular left (0.1 probability), perpendicular right (0.1 probability); boundary collisions cause agent to remain in place.
        - Reward Sensitivity & Behavioral Regimes: Step reward R(s) for non-terminal transitions controls risk vs. reward trade-offs:
            - R(s) < -1.6284: Severe living penalty -> Suicidal shortcut into nearest terminal state (-1).
            - -0.4278 < R(s) < -0.0886: High living penalty -> Aggressive risk-taking directly heading towards +1 adjacent to -1 hazard.
            - -0.0221 < R(s) < 0 (default R(s) = -0.04): Moderate penalty -> Conservative risk-averse detour around the wall.
            - R(s) > 0: Positive living reward -> Infinite loitering, avoiding all terminal states.
- 3. Formal Markov Decision Process (MDP) Specification & Dynamic Decision Networks
    - Formal Tuple Definition: M = <S, A, T, R, gamma>.
    - State Space S and Action Space A(s).
    - Transition Model: T(s, a, s') = P(s' | s, a) with probability conservation sum_s' P(s' | s, a) = 1.
    - The First-Order Markov Property: Memoryless assumption P(S_{t+1} | S_t, A_t, ..., S_0, A_0) = P(S_{t+1} | S_t, A_t). Computational simplification vs. state augmentation for non-Markovian environments.
    - Reward Formulations: R(s), R(s, a), and R(s, a, s') bounded within [-R_max, +R_max].
    - MDP as a Dynamic Decision Network (DDN):
        - Graphical translation (Slide 16): Decision nodes (actions A_t), Chance nodes (states S_t), Transition dependencies P(S_{t+1} | S_t, A_t), Utility/Reward nodes (rewards R_t), and Terminal Utility (U_{t+3}).
- 4. Utility, Horizons, and Preferences over Trajectories
    - Trajectory Return G_t: Additive cumulative reward along an environment history.
    - Finite Horizon Problems: Fixed deadline N; utility U([s_0, ..., s_N]) = sum_{t=0}^{N-1} R(s_t, a_t, s_{t+1}); optimal policies are non-stationary (pi*_t).
    - Infinite Horizon Problems: No fixed deadline; discounted utility U([s_0, s_1, ...]) = sum_{t=0}^infty gamma^t R(s_t, a_t, s_{t+1}); optimal policies are stationary (pi*).
    - The Discount Factor gamma in [0, 1): Economic rationale, present value of future rewards, and strict geometric utility bound U_max <= R_max / (1 - gamma).
    - Guarantees of Finite Utility in Infinite Horizons: Discounting (gamma < 1), absorbing terminal states with proper policies, and long-run average reward per time step.
    - Preference Independence Assumption: Stationarity and additivity of temporal preferences across trajectory histories.
- 5. Policies & Policy Evaluation: The Bellman Expectation Equation
    - Policy Mapping: pi: S -> A.
    - Value Function of a Policy: U^pi(s) = E^pi [sum_{t=0}^infty gamma^t R(S_t, A_t, S_{t+1}) | S_0 = s].
    - Derivation of the Bellman Expectation Equation: Recursive decomposition into immediate reward plus discounted successor value.
    - Exact Matrix Inversion: U^pi = (I - gamma T^pi)^(-1) R^pi; computational complexity O(|S|^3).
    - Iterative Policy Evaluation: U_{i+1}(s) <- sum_s' P(s' | s, pi(s)) [R(s, pi(s), s') + gamma U_i(s')] for large state spaces.
- 6. The Bellman Optimality Equation & The Q-Function (Action-Utility)
    - Optimal State Utility: U(s) = max_pi U^pi(s).
    - Bellman Optimality Equation (Slide 34): U(s) = max_{a in A(s)} sum_s' P(s' | s, a) [R(s, a, s') + gamma U(s')]. Non-linear system of |S| equations with |S| unknowns.
    - Optimal Policy Extraction: pi*(s) = argmax_{a in A(s)} sum_s' P(s' | s, a) [R(s, a, s') + gamma U(s')].
    - The Q-Function (Slide 36): Q(s, a) = sum_s' P(s' | s, a) [R(s, a, s') + gamma U(s')] = sum_s' P(s' | s, a) [R(s, a, s') + gamma max_a' Q(s', a')].
    - Fundamental Duality: U(s) = max_a Q(s, a) and pi*(s) = argmax_a Q(s, a). Role of Q-functions in model-free decision making.
- 7. Value Iteration: Algorithm, Contraction Mapping, and Error Dynamics
    - Algorithm Specification (Slide 39): Initialization U_0(s) = 0, iterative Bellman backup updates, epsilon-convergence halting, and greedy policy extraction.
    - Computational Complexity: O(|S|^2 |A|) per iteration.
    - Why Value Iteration Works (Slide 45): Convergence to a unique fixed point; stabilization of long-term future rewards; premature emergence of optimal policy before utility convergence.
    - Rigorous Mathematical Proof of Contraction:
        - Bellman backup operator B on Banach space (R^{|S|}, ||.||_infty).
        - Max norm definition: ||U - V||_infty = max_s |U(s) - V(s)|.
        - Contraction Proof: ||B U - B V||_infty <= gamma ||U - V||_infty.
        - Banach Fixed-Point Theorem: Existence and uniqueness of U* = B U*.
        - Geometric Error Bound: ||U_i - U*||_infty <= gamma^i ||U_0 - U*||_infty.
        - Explicit Iteration Bound: N = ceil( log(2 R_max / (epsilon(1 - gamma))) / log(1 / gamma) ).
        - Stopping Condition: ||U_{i+1} - U_i||_infty < epsilon (1 - gamma) / gamma implies ||U_{i+1} - U*||_infty < epsilon.
        - Policy Loss Bound: ||U^{pi_i} - U*||_infty <= 2 epsilon gamma / (1 - gamma).
    - Error Dynamics and Policy Loss in the 4x3 World (Slide 47 / RN Figure 17.8):
        - Graphical analysis of max error ||U_i - U|| vs. policy loss ||U^{pi_i} - U|| over 14 iterations.
        - Explanation of why policy loss plummets to 0 by iteration 4 while utility values continue converging gradually until iteration 14.
- 8. Policy Iteration: Algorithm, Implementation Walkthrough, and Theoretical Guarantees
    - Two-Phase Iterative Cycle (Slide 49): Policy Evaluation (exact matrix solving or iterative approximation) alternating with Policy Improvement.
    - Termination Criterion: Stability across all states (pi_{i+1}(s) = pi_i(s)).
    - Concrete Implementation Walkthrough: Policy Improvement at State (1, 1) in the 4x3 Grid World (Slide 53):
        - Numerical evaluation of candidate actions Up, Left, Down, Right.
        - Detailed accounting of the 0.9 bounce probability against boundary walls.
    - Rigorous Proof of the Policy Improvement Theorem (Sutton & Barto Section 4.2 / Slide 55):
        - Condition: Q^pi(s, pi'(s)) >= U^pi(s).
        - Recursive telescoping expansion over infinite horizons: U^pi(s) <= E^{pi'} [R_0 + gamma U^pi(S_1)] <= ... <= U^{pi'}(s).
        - Strict improvement guarantee for non-converged states.
        - Finite termination within |A|^{|S|} policy evaluations.
    - Grand Comparison: Value Iteration vs. Policy Iteration (Slide 56):
        - 7-dimensional comparative analysis: Initialization, Main Update, Termination, Convergence, Optimality, Per-Iteration Cost, and Computational Trade-offs.
- 9. Scaling and Approximate Methods: Overcoming the Curse of Dimensionality
    - The Curse of Dimensionality: Exponential state space explosion (e.g., Tetris with 2^N board configurations).
    - Modified Policy Iteration (MPI): Truncated policy evaluation via k steps of value iteration.
    - Approximate Dynamic Programming (ADP): Linear feature approximations (theta^T phi(s)) and Deep Neural Networks.
    - Fitted Value Iteration (FVI): Monte Carlo state sampling over high-dimensional continuous domains.
    - Model-Free Reinforcement Learning: Learning optimal policies via experience tuples (s, a, r, s') without transition or reward models (Q-Learning, SARSA, Policy Gradients).
    - Advanced Decision Architectures: Online planning (MCTS, RTDP), imitation learning from human demonstrations, and Large Foundation Models (LFMs) for structured task decomposition, heuristic synthesis, and high-level plan generation.
- 10. Reviewkit (<takeaways>, <qquiz/>, <qprompt/>) & Academic References
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

## 9. Scaling and Approximate Methods: Overcoming the Curse of Dimensionality

### 9.1 The Curse of Dimensionality

Richard Bellman coined the phrase **The Curse of Dimensionality** to describe the exponential explosion of state spaces in dynamic programming:
- In a game like *Tetris* on a standard $10 \times 20$ grid, each cell can be filled or empty, yielding over $2^{200} \approx 1.6 \times 10^{60}$ distinct configurations.
- In multi-agent robotics or autonomous driving, continuous state spaces (continuous coordinates, velocities, steering angles) render exact tabular methods completely intractable.

---

### 9.2 Modified Policy Iteration (MPI)

Solving the exact linear system in Policy Evaluation requires $\mathcal{O}(|\mathcal{S}|^3)$ time per step.
**Modified Policy Iteration (MPI)** resolves this bottleneck by truncating the evaluation phase:
- Instead of solving $(I - \gamma \mathbf{T}^\pi)^{-1}$ to exact precision, perform **$k$ simplified sweeps of Value Iteration** under the fixed policy $\pi$:
  $$U_{j+1}(s) \leftarrow \sum_{s'} P(s' \mid s, \pi(s)) [R(s, \pi(s), s') + \gamma U_j(s')], \quad \text{for } j = 1, \dots, k$$
- Once $k$ steps complete, immediately execute Policy Improvement. Setting $k=1$ recovers standard Value Iteration; setting $k=\infty$ recovers exact Policy Iteration.

---

### 9.3 Approximate Dynamic Programming (ADP) & Fitted Value Iteration

When $|\mathcal{S}|$ is astronomically large or continuous, tabular representations are replaced with **Function Approximators**:
1. **Linear Feature Representation:**
   $$\hat{U}_\theta(s) = \sum_{j=1}^d \theta_j \phi_j(s) = \boldsymbol{\theta}^T \boldsymbol{\phi}(s)$$
   Where $\boldsymbol{\phi}(s)$ is a hand-crafted feature vector (e.g., distance to obstacles, battery percentage).
2. **Deep Neural Network Approximation:**
   $$\hat{U}_\theta(s) = \text{NeuralNetwork}(s; \boldsymbol{\theta})$$
3. **Fitted Value Iteration (FVI):**
   Instead of sweeping every state in $\mathcal{S}$, sample a representative subset of states $\mathcal{S}_{\text{sample}} \subset \mathcal{S}$, compute Bellman target values, and update parameters $\boldsymbol{\theta}$ via gradient descent or least-squares regression.

---

### 9.4 The Bridge to Model-Free Reinforcement Learning & Deep Q-Networks

When the transition model $\mathcal{T} = P(s' \mid s, a)$ and reward function $\mathcal{R}$ are unknown to the agent, dynamic programming cannot be computed offline. The agent must transition from planning to **Reinforcement Learning (RL)**, learning optimal behaviors purely through trial-and-error environment experience tuples $(s_t, a_t, r_{t+1}, s_{t+1})$:
- **Temporal Difference (TD) Learning (Sutton, 1988):** Updates state value estimates using bootstrapped prediction errors:
  $$U(S_t) \leftarrow U(S_t) + \alpha \left[ R_{t+1} + \gamma U(S_{t+1}) - U(S_t) \right]$$
- **Q-Learning (Watkins, 1989):** An off-policy TD control algorithm that converges to optimal action-values $Q^*(s, a)$ regardless of the exploration policy:
  $$Q(S_t, A_t) \leftarrow Q(S_t, A_t) + \alpha \left[ R_{t+1} + \gamma \max_a Q(S_{t+1}, a) - Q(S_t, A_t) \right]$$
- **Deep Q-Networks (DQN; Mnih et al., Nature 2015):** Scales Q-learning to high-dimensional state spaces by replacing lookup tables with deep convolutional neural networks $Q(s, a; \boldsymbol{	heta})$. DQN stabilizes non-linear deep reinforcement learning through two key architectural breakthroughs:
  1. **Experience Replay Memory:** Stores past transitions $(s_t, a_t, r_{t+1}, s_{t+1})$ in a circular buffer and samples uncorrelated mini-batches, breaking non-stationary temporal autocorrelation.
  2. **Target Q-Network ($Q(s, a; \boldsymbol{	heta}^-)$):** Decouples policy parameter updates from target evaluation by periodically freezing target network weights $\boldsymbol{	heta}^-$, mitigating policy oscillation.
- **Policy Gradient Methods (REINFORCE, PPO):** Directly optimize parameterized stochastic policies $\pi_\theta(a \mid s)$ via gradient ascent on expected cumulative reward $\nabla_\theta J(\theta)$, avoiding value function discretization in continuous control domains.

---

### 9.5 Advanced Decision Architectures & Large Foundation Models (LFMs)

In frontier autonomous systems, MDP foundations merge with cutting-edge AI architectures:
1. **Decision-Time Online Planning:** Real-time search algorithms like **Monte Carlo Tree Search (MCTS)** and **Real-Time Dynamic Programming (RTDP)** explore high-probability forward simulation branches rather than evaluating the entire global state space.
2. **Imitation & Demonstration Learning:** Initializing policies and value functions from human expert trajectories before fine-tuning via reinforcement learning.
3. **Large Foundation Models (LFMs) in Planning:** LLMs and Vision-Language-Action (VLA) models serve as high-level cognitive planners within hierarchical MDPs:
   - **Task Decomposition:** Translating natural language instructions into high-level sub-goals.
   - **Heuristic Generation:** Synthesizing domain-specific heuristic evaluators for MCTS tree search.
   - **Common-Sense Pruning:** Restricting the action space $\mathcal{A}(s)$ to physically sensible actions, drastically mitigating the curse of dimensionality.

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
- **Policy Iteration Efficiency:** Policy Iteration alternates between exact Policy Evaluation ($\mathcal{O}(|\mathcal{S}|^3)$) and Policy Improvement ($\mathcal{O}(|\mathcal{S}|^2 |\mathcal{A}|)$). By the Policy Improvement Theorem (Sutton & Barto 4.2), each consecutive policy is monotonically superior, terminating in finite steps.
- **Trade-Off Profile:** Value Iteration has simpler updates but requires more iterations; Policy Iteration requires fewer iterations but each iteration is more computationally intensive.
- **Overcoming Dimensionality:** Real-world scalability requires moving beyond tabular dynamic programming to Modified Policy Iteration (MPI), Approximate Dynamic Programming (ADP), and Model-Free Reinforcement Learning (Q-learning).
</takeaways>

<qquiz src="questions.en.json"/>

<qprompt/>
</reviewkit>

## References

1. Bellman, R. (1957). *Dynamic Programming*. Princeton University Press.
2. Howard, R. A. (1960). *Dynamic Programming and Markov Processes*. MIT Press.
3. Puterman, M. L. (1994). *Markov Decision Processes: Discrete Stochastic Dynamic Programming*. John Wiley & Sons.
4. Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press.
5. Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4th ed.). Pearson. (Chapter 17: Making Complex Decisions).
6. Bertsekas, D. P. (2012). *Dynamic Programming and Optimal Control* (Vol. 1 & 2, 4th ed.). Athena Scientific.
7. Watkins, C. J., & Dayan, P. (1992). Q-learning. *Machine Learning*, 8(3-4), 279-292.
8. Gopalan, A., & Teo, Y. M. (2025). *CS4246/5446 Markov Decision Processes (Version 4.0)*. National University of Singapore (NUS).

# Week 5 - Model-Free Reinforcement Learning and Sequential Decision Making: Function Approximation, Deep Q-Networks, Policy Gradients, and Actor-Critic Methods

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
    - Numerical Walkthrough: Grid World Navigation with coordinates (x, y), weights (0.5, 0.2, 0.1), and coordinate-wise gradient updates.
    - Differentiable parameterization of utility: \hat{U}_\theta(s) = g(s; \theta) and \hat{Q}_\theta(s, a) = g(s, a; \theta).
    - Linear Feature Representations: \hat{U}_\theta(s) = \theta^T f(s); constant bias feature f_0(s) = 1; risks of under-parameterization and structural bias.
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
    - Semi-Gradient TD(0) Update for State Utilities: \theta \leftarrow \theta + \alpha [R + \gamma \hat{U}_\theta(s') - \hat{U}_\theta(s)] \nabla_\theta \hat{U}_\theta(s).
    - On-Policy SARSA Update: \theta \leftarrow \theta + \alpha [R + \gamma \hat{Q}_\theta(s', a') - \hat{Q}_\theta(s, a)] \nabla_\theta \hat{Q}_\theta(s, a).
    - Off-Policy Q-Learning Update: \theta \leftarrow \theta + \alpha [R + \gamma \max_{a'} \hat{Q}_\theta(s', a') - \hat{Q}_\theta(s, a)] \nabla_\theta \hat{Q}_\theta(s, a).
    - In-Depth Explanation of SARSA:
        - Acronym origin: State-Action-Reward-State-Action (s_t, a_t, r_{t+1}, s_{t+1}, a_{t+1}).
        - On-policy mechanism: Bootstrapping on the action a' actually selected by the current behavioral exploration policy \pi(s').
        - Comparative Case Study: The Cliff Walking Benchmark (why SARSA is safer than Q-learning during online exploration; accounting for exploratory mistakes).
        - Deep RL Incompatibility: Why SARSA cannot easily be combined with Experience Replay (historical transitions from older policies violate on-policy distribution requirements).
- 5. Instabilities in Approximate Utility Learning: The Deadly Triad & Catastrophic Forgetting
    - The Deadly Triad: The destabilizing convergence of (1) Function Approximation, (2) Bootstrapping, and (3) Off-Policy Learning.
    - Baird's Counterexample: A 7-state star MDP proving unbounded parameter divergence under linear function approximation with off-policy TD.
    - Catastrophic Forgetting: Global weight sharing causes localized gradient updates to overwrite representations of rarely visited regions.
    - Architectural Defenses: Experience Replay buffer preserving broad empirical state distributions.
- 6. Deep Q-Networks (DQN) for High-Dimensional Control
    - End-to-end representation learning from raw pixel frames (Atari 2600 benchmark, Mnih et al., Nature 2015).
    - Input Preprocessing: 4-frame temporal stacking (84 x 84 x 4) to capture velocity, acceleration, and ball direction.
    - Convolutional feature extraction + fully connected action-value heads (18 discrete joystick actions).
    - Two Core Stabilization Breakthroughs:
        1. Experience Replay Memory (D): Breaks temporal autocorrelation, converts non-stationary RL into i.i.d. supervised regression minibatches.
        2. Fixed Target Network (Q(s, a; \theta^-)): Freezes target parameters for C steps, resolving moving target feedback oscillations.
    - Loss function: \mathcal{L}(\theta) = E_{(s, a, r, s') \sim D} [ (r + \gamma \max_{a'} Q(s', a'; \theta^-) - Q(s, a; \theta))^2 ].
    - \epsilon-greedy exploration schedule.
    - Case Study: Gymnasium Lunar Lander (LunarLander-v3, 8D continuous observation, 4 discrete actions, MLP architecture, Episode #1 crash vs. Episode #1500 touchdown).
- 7. Advanced DQN Extensions & Theoretical Limitations
    - Double DQN (DDQN; Van Hasselt et al., 2016): Decoupling action selection from action evaluation to eliminate maximization bias: y = r + \gamma Q(s', \arg\max_{a'} Q(s', a'; \theta); \theta^-).
    - Multi-Step Learning (n-step returns): Balancing bias-variance trade-offs along forward trajectory rollouts.
    - Distributional RL (C51): Modeling the entire return distribution Z(s, a) rather than scalar expectations.
    - Prioritized Experience Replay (PER): Sampling transitions proportional to TD error |\delta|^\alpha with importance sampling bias correction weights.
    - Where DQN Struggles (Three Inherent Bottlenecks):
        1. Intractable continuous action maximization (\arg\max_a Q(s, a) is intractable in continuous manifolds).
        2. Linear action scoring cost growing directly with |A|.
        3. Rigidity of deterministic greedy policies vs. inherent randomness and entropy in multimodal tasks.
- 8. Policy Search & The Policy Gradient Theorem
    - Parameterized stochastic policies: \pi_\theta(a | s) = Pr(A_t = a | S_t = s; \theta).
    - Softmax policy formulation with temperature parameter \tau: \pi_\theta(a | s) = \frac{\exp(h(s, a, \theta)/\tau)}{\sum_b \exp(h(s, b, \theta)/\tau)}.
    - Policy Value Objective: J(\theta) = E_{\tau \sim \pi_\theta} [R(\tau)] = \sum_s d^{\pi_\theta}(s) \sum_a \pi_\theta(a | s) Q^{\pi_\theta}(s, a).
    - The Policy Gradient Theorem (Sutton et al., 1999): Complete proof showing that \nabla_\theta J(\theta) = E_{\pi_\theta} [ Q^{\pi_\theta}(s, a) \nabla_\theta \log \pi_\theta(a | s) ] without requiring derivatives of environmental transition dynamics T(s' | s, a).
- 9. The REINFORCE Algorithm & Baseline Variance Reduction
    - REINFORCE (Williams, 1992): Monte Carlo policy gradient via episode rollouts G_t = \sum_{k=t}^T \gamma^{k-t} R_{k+1}.
    - The Log-Derivative / Likelihood Ratio Trick: \nabla_\theta \pi_\theta = \pi_\theta \nabla_\theta \log \pi_\theta.
    - Update rule: \theta \leftarrow \theta + \alpha \gamma^t G_t \nabla_\theta \log \pi_\theta(a_t | s_t).
    - High Variance Challenge: Compounding random returns across long horizons.
    - Baseline Subtraction: Proof that subtracting state-dependent baseline b(s) leaves expected gradient unbiased while drastically shrinking variance: E_{a \sim \pi_\theta} [b(s) \nabla_\theta \log \pi_\theta(a | s)] = 0.
    - The Advantage Function: A^{\pi_\theta}(s, a) = Q^{\pi_\theta}(s, a) - U^{\pi_\theta}(s).
    - Numerical Demonstration: 4-episode sample returns yielding variance collapse from 15,275 to 28.4 under baseline subtraction.
- 10. Actor-Critic Architectures
    - Architectural Dualism: Actor (parameterized policy \pi_\theta) + Critic (parameterized value estimator \hat{U}_w(s)).
    - 1-Step TD Advantage Estimator: A(s_t, a_t) \approx \delta_t = R_{t+1} + \gamma \hat{U}_w(s_{t+1}) - \hat{U}_w(s_t).
    - Dual Update Mechanics: Critic minimizes TD error via semi-gradient descent; Actor ascends policy gradient scaled by \delta_t.
    - Spectrum of Actor-Critic Variants:
        - A2C (Advantage Actor-Critic): Synchronous, deterministic batch coordination.
        - A3C (Asynchronous Advantage Actor-Critic): Asynchronous CPU multi-threading.
        - ACER: Off-policy replay buffer with trust region optimization.
        - Soft Actor-Critic (SAC): Maximum entropy reinforcement learning framework balancing reward maximization with policy entropy \mathcal{H}(\pi(\cdot | s)) for robust exploration in continuous robotics.
- 11. Advanced Policy Search: TRPO and PPO
    - The Fragility of Vanilla Policy Gradients: Non-linear step sizes cause catastrophic policy collapse (performance cliff).
    - Monotonic Policy Improvement Guarantee (Kakade & Langford, 2002).
    - Trust Region Policy Optimization (TRPO; Schulman et al., 2015): Enforcing an average Kullback-Leibler (KL) divergence constraint E_{s \sim \rho_{\theta_{old}}} [D_{KL}(\pi_{\theta_{old}}(\cdot | s) || \pi_\theta(\cdot | s))] \le \delta; optimization via natural gradients, conjugate gradient, and Fisher Information Matrix.
    - Proximal Policy Optimization (PPO; Schulman et al., 2017):
        - Replacing second-order constraints with a first-order Clipped Surrogate Objective.
        - Probability ratio: r_t(\theta) = \frac{\pi_\theta(a_t | s_t)}{\pi_{\theta_{old}}(a_t | s_t)}.
        - Clipped Loss: \mathcal{L}^{CLIP}(\theta) = \hat{E}_t [ \min( r_t(\theta) \hat{A}_t, \, \text{clip}(r_t(\theta), 1 - \epsilon, 1 + \epsilon) \hat{A}_t ) ].
        - Dissecting the clipping mechanism: Case 1 (\hat{A}_t > 0) vs. Case 2 (\hat{A}_t < 0) and how clipping acts as a pessimistic bound against overly aggressive policy changes.
        - Industry-standard adoption in LLM alignment (RLHF / PPO).
</draft>

## 1. Scaling Sequential Decisions: The Necessity of Function Approximation

In classical Markov Decision Processes (MDPs), we assume complete access to the environment model: the transition probability matrix $\mathcal{T}(s' \mid s, a) = P(s' \mid s, a)$ and the reward function $\mathcal{R}(s, a, s')$. Under these conditions, exact dynamic programming algorithms—such as Value Iteration and Policy Iteration—compute the exact optimal utility $U^*(s)$ and policy $\pi^*(s)$.

However, in real-world intelligent systems:
1. **Unknown Environment Dynamics:** The agent possesses **zero prior knowledge** of transition physics or reward distributions. It can only interact with the environment through trial-and-error experience tuples $(s, a, r, s')$.
2. **Combinatorial State Space Explosions (The Curse of Dimensionality):** Storing utilities or action-values in tabular lookup structures ($\mathcal{S} \to \mathbb{R}$) becomes physically impossible as state dimensionality grows.

```
+------------------+------------------------------+------------------------------------+
| Problem Domain   | State Space Scale |S|        | Feasibility of Tabular Methods     |
+------------------+------------------------------+------------------------------------+
| Toy Gridworld    | 10^1 to 10^2 states          | Exact Dynamic Programming          |
| Backgammon       | ~10^20 states                | Tabular methods fail completely    |
| Chess            | ~10^40 states                | Tabular methods fail completely    |
| Go               | ~10^172 states               | More states than atoms in universe |
| Continuous Drone | \mathbb{R}^6 (Uncountably Inf) | Lookups are mathematically invalid |
+------------------+------------------------------+------------------------------------+
```

An agent operating in an environment with $10^{40}$ states cannot visit every state even once in a billion years, let alone visit every state infinitely often as required by classical tabular convergence theorems. 

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

1. **Passive Learning (Policy Evaluation):**
   - The agent follows a fixed, pre-determined behavioral policy $\pi(s)$.
   - The objective is to estimate the expected cumulative return (utility) $U^\pi(s)$ of each state.
   - **Model-Based (MB):** *Adaptive Dynamic Programming (ADP)* learns the transition model $\hat{P}(s' \mid s, \pi(s))$ and reward model $\hat{R}$ from empirical frequency counts, then runs dynamic programming policy evaluation.
   - **Model-Free (MF):** *Monte Carlo (MC) prediction* estimates utilities by taking empirical averages of complete episode returns. *Temporal-Difference (TD) prediction* updates utility estimates incrementally by bootstrapping from immediate successor state estimates without learning a model.
2. **Active Learning (Control / Policy Optimization):**
   - The agent must actively select actions to maximize cumulative reward, discovering the optimal policy $\pi^*(s) = \arg\max_a Q^*(s, a)$.
   - **Model-Based (MB):** *Active ADP* learns models $\hat{P}(s' \mid s, a)$ and $\hat{R}(s, a, s')$ for all actions, then solves the Bellman Optimality Equation via Value or Policy Iteration.
   - **Model-Free (MF):** *Monte Carlo Control* explores state-action pairs and updates action-value tables. *Active TD Methods (TD Control)* update parameterized action-values $Q(s, a)$ online:
     - **Q-Learning (Watkins, 1989):** Off-policy TD control that bootstraps from the greedy maximal action $\max_{a'} Q(s', a')$.
     - **SARSA (Rummery & Niranjan, 1994):** On-policy TD control that bootstraps from the action $a'$ actually selected by the current behavioral policy.

---

### 1.2 Approaches to Scaling Up

To overcome the curse of dimensionality, modern Reinforcement Learning employs three foundational scaling paradigms:
1. **Value Function Approximation:** Compactly parameterize the utility function $\hat{U}_\theta(s) \approx U(s)$ or action-value function $\hat{Q}_\theta(s, a) \approx Q(s, a)$ using a low-dimensional weight vector $\boldsymbol{\theta} \in \mathbb{R}^d$ ($d \ll |\mathcal{S}|$). Generalize value estimates across unvisited states sharing similar feature representations.
2. **Policy Search (Policy Gradients):** Directly parameterize the policy $\pi_\theta(a \mid s) = \Pr(A = a \mid S = s; \boldsymbol{\theta})$ and optimize $\boldsymbol{\theta}$ via gradient ascent on the expected return $J(\boldsymbol{\theta})$, bypassing value function lookup entirely.
3. **Actor-Critic Architectures:** Hybrid methods combining a parameterized policy (**Actor**) with a parameterized value function (**Critic**) that provides variance-reduced baseline evaluations.

---

## 2. Linear and Non-Linear Value Function Approximation

Instead of maintaining a distinct memory slot for every state $s \in \mathcal{S}$, **Function Approximation** represents state utility or action utility as a differentiable mathematical function parameterized by weight vector $\boldsymbol{\theta}$:

$$\hat{U}_\theta(s) = g(s; \boldsymbol{\theta})$$
$$\hat{Q}_\theta(s, a) = g(s, a; \boldsymbol{\theta})$$

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
|                     = \theta^T f(s)                                                   |
+---------------------------------------------------------------------------------------+
```

### 2.1 Conceptual Motivation: The House Price Analogy

To appreciate the profound architectural transition from tabular dynamic programming to function approximation, consider the intuitive real-world challenge of building an agent that estimates the market value of a house based on its floor area (size in square meters):

- **Approach 1: The Tabular Lookup ("Excel Sheet") Paradigm:**
  The agent collects historical housing transaction records and builds an exhaustive lookup table mapping every discrete floor size to its observed selling price:
  $$\text{Lookup Table: } [60.0\text{ m}^2 \to \$400\text{k}, \; 60.5\text{ m}^2 \to \$403\text{k}, \; 61.0\text{ m}^2 \to \$407\text{k}, \; \dots]$$
  Whenever a user queries the value of a house, the agent looks up the exact answer from the table. This corresponds directly to the **tabular reinforcement learning paradigm** studied prior to the Recess week. In real-world environments, tabular lookups collapse:
  1. *Astronomical Memory Footprint:* If the state space contains continuous coordinates or billions of configurations, the table size exceeds available physical RAM.
  2. *Zero Generalization:* If a prospective buyer inquires about a house with an area of $60.3\text{ m}^2$ that has never been recorded in history, the lookup table provides exactly zero information.
- **Approach 2: Function Approximation:**
  Instead of storing isolated cells, the agent collects historical sample pairs and learns a parameterized mathematical function that fits the data:
  $$\hat{U}_\boldsymbol{\theta}(\text{size}) = g(\text{size}; \boldsymbol{\theta})$$
  (ranging from a simple linear slope $\theta_1 \cdot \text{size} + \theta_0$ to a multi-layer deep neural network).
- **Two Foundational Architectural Benefits:**
  1. **Compact Representation:** A tiny vector of parameters $\boldsymbol{\theta} \in \mathbb{R}^d$ ($d \ll |\mathcal{S}|$) captures the entire value landscape, replacing gigabytes or terabytes of tabular lookup memory.
  2. **Generalization:** By learning the underlying continuous structure, the function naturally interpolates and extrapolates accurate predictions for previously unvisited states based on feature similarity.
- **The Under-Parameterization Caveat:**
  If the hypothesis space contains too few parameters $n$ (or attempts to fit a complex oscillating value curve with a rigid linear model), the agent suffers from severe structural approximation bias (underfitting).

### 2.2 Linear Function Approximation

In linear function approximation, the utility is defined as a linear combination of hand-crafted basis features:

$$\hat{U}_\theta(s) = \theta_0 f_0(s) + \theta_1 f_1(s) + \dots + \theta_n f_n(s) = \sum_{i=0}^n \theta_i f_i(s) = \boldsymbol{\theta}^T \mathbf{f}(s)$$

- **Bias Feature:** $f_0(s) = 1$ is a constant intercept feature, allowing the baseline utility to shift independently of input features.
- **State Features:** $f_1(s), \dots, f_n(s)$ capture domain-specific abstractions (e.g., in chess: material balance, king safety, center board control; in robotics: joint angles, distance to obstacles).
- **The Risk of Under-Parameterization:**
  If too few parameters or poorly chosen features are utilized ($n \ll \text{true intrinsic degrees of freedom}$), the hypothesis space cannot represent the true value landscape, introducing severe **approximation bias** (underfitting).

#### Numerical Walkthrough: Grid World Navigation (Russell & Norvig Figure 17.2)
Consider a robot navigating a spatial grid world where each state is represented by its Cartesian coordinates $\mathbf{s} = [x, y]^T$:
- **Linear Parameterization:**
  $$\hat{U}_\boldsymbol{\theta}(x, y) = \theta_0 f_0(s) + \theta_1 f_1(s) + \theta_2 f_2(s) = \theta_0 + \theta_1 x + \theta_2 y$$
  where $f_0(s) = 1$ is the constant bias feature, $f_1(s) = x$, and $f_2(s) = y$.
- **Forward Evaluation:**
  Suppose the agent's current learned weights are $\boldsymbol{\theta} = (\theta_0, \theta_1, \theta_2) = (0.5, 0.2, 0.1)$.
  At grid coordinate $(x = 1, y = 1)$, the predicted utility is:
  $$\hat{U}(1, 1) = 0.5 + 0.2(1) + 0.1(1) = \mathbf{0.8}$$
- **Parameter Updates via Gradient Descent:**
  Given a training sample $(x, y, u_j)$ where $u_j$ is the observed target return, the Widrow-Hoff gradient descent rule updates each parameter individually:
  $$\theta_0 \leftarrow \theta_0 + \alpha \left( u_j(s) - \hat{U}_\boldsymbol{\theta}(s) \right)$$
  $$\theta_1 \leftarrow \theta_1 + \alpha \left( u_j(s) - \hat{U}_\boldsymbol{\theta}(s) \right) x$$
  $$\theta_2 \leftarrow \theta_2 + \alpha \left( u_j(s) - \hat{U}_\boldsymbol{\theta}(s) \right) y$$


### 2.3 Non-Linear Deep Neural Network Approximation

In high-dimensional sensory environments (e.g., raw camera pixels, LiDAR point clouds), manual feature engineering fails. **Deep Reinforcement Learning** uses multi-layer convolutional neural networks (CNNs) or multi-layer perceptrons (MLPs) as non-linear function approximators:
- The network automatically discovers hierarchical spatial and temporal abstractions from raw inputs.
- The penultimate layers serve as learned non-linear feature extractors $\mathbf{\phi}(s)$, while the final layer performs linear regression to output $\hat{U}_\theta(s)$ or $\hat{Q}_\theta(s, a)$.
- All parameters across all layers are optimized jointly via **backpropagation**.

---

## 3. Approximate Monte Carlo Learning & The Widrow-Hoff (Delta) Rule

How does an agent optimize the parameter vector $\boldsymbol{\theta}$ to best approximate the true utility?

### 3.1 Supervised Learning Formulation

Consider an agent collecting experience trajectories across $M$ trial episodes:
$$\mathcal{D} = \{ (s_1, u_1), (s_2, u_2), \dots, (s_N, u_N) \}$$
where $s_j$ represents an encountered state, and $u_j$ represents the observed empirical discounted return from state $s_j$ to the end of the episode:
$$u_j = R_{t+1} + \gamma R_{t+2} + \gamma^2 R_{t+3} + \dots + \gamma^{T-t-1} R_T$$

This converts value estimation into a classical **supervised regression problem**: find parameter vector $\boldsymbol{\theta}$ such that predicted utility $\hat{U}_\theta(s_j)$ accurately fits empirical target return $u_j$.

We define the instantaneous loss (squared error) for a single training observation $(s, u_j(s))$:
$$\mathcal{E}_j(s) = \frac{1}{2} \left( \hat{U}_\theta(s) - u_j(s) \right)^2$$

To minimize this error, we compute the gradient of $\mathcal{E}_j(s)$ with respect to parameter $\theta_i$:
$$\frac{\partial \mathcal{E}_j(s)}{\partial \theta_i} = \left( \hat{U}_\theta(s) - u_j(s) \right) \frac{\partial \hat{U}_\theta(s)}{\partial \theta_i} = - \left( u_j(s) - \hat{U}_\theta(s) \right) \frac{\partial \hat{U}_\theta(s)}{\partial \theta_i}$$

Applying gradient descent with learning rate $\alpha > 0$:
$$\theta_i \leftarrow \theta_i - \alpha \frac{\partial \mathcal{E}_j(s)}{\partial \theta_i} = \theta_i + \alpha \left( u_j(s) - \hat{U}_\theta(s) \right) \frac{\partial \hat{U}_\theta(s)}{\partial \theta_i}$$

In the linear function approximation case, $\hat{U}_\theta(s) = \sum_{k=0}^n \theta_k f_k(s)$, so the partial derivative is simply the feature value: $\frac{\partial \hat{U}_\theta(s)}{\partial \theta_i} = f_i(s)$.
The parameter update simplifies to:
$$\theta_i \leftarrow \theta_i + \alpha \left( u_j(s) - \hat{U}_\theta(s) \right) f_i(s)$$

Vectorized notation:
$$\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} + \alpha \left( u_j(s) - \boldsymbol{\theta}^T \mathbf{f}(s) \right) \mathbf{f}(s)$$

---

### 3.2 Explanation of the Widrow-Hoff (Delta) Rule

This foundational update equation is historically known as the **Widrow-Hoff Rule** (or the **Delta Rule**), formulated by **Bernard Widrow and Ted Hoff in 1960** for training the **Adaline (Adaptive Linear Neuron)**:
- **The Error Signal ($\delta$):**
  $$\delta = \text{Target} - \text{Prediction} = u_j(s) - \hat{U}_\theta(s)$$
- **Physical Meaning of the Delta Rule:**
  The change in weight $\Delta \theta_i$ is directly proportional to the product of the prediction error $\delta$ and the active input feature $f_i(s)$:
  $$\Delta \theta_i = \alpha \cdot \delta \cdot f_i(s)$$
  1. If prediction $\hat{U}_\theta(s)$ matches target $u_j(s)$ perfectly ($\delta = 0$), no update occurs.
  2. If prediction underestimates the target ($\delta > 0$), weights associated with positive features ($f_i(s) > 0$) are increased, boosting future utility predictions for similar states.
  3. Features with large magnitudes receive larger weight adjustments, as they contributed most heavily to the prediction.

---

### 3.3 Deep-Dive: Widrow-Hoff (Delta Rule) vs. Naive (Batch) Gradient Descent

A common point of confusion is: *what is the exact mathematical and operational difference between the Widrow-Hoff Delta Rule and Naive (Batch) Gradient Descent?*

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

#### Detailed Mathematical Breakdown

1. **Naive (Batch) Gradient Descent:**
   Computes the true empirical loss over the **entire accumulated training set** of $N$ observations:
   $$\mathcal{L}_{\text{batch}}(\boldsymbol{\theta}) = \frac{1}{2N} \sum_{j=1}^N \left( \hat{U}_\theta(s_j) - u_j \right)^2$$
   Parameters are updated only **after sweeping the entire dataset**:
   $$\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} - \alpha \nabla_\theta \mathcal{L}_{\text{batch}}(\boldsymbol{\theta}) = \boldsymbol{\theta} + \alpha \frac{1}{N} \sum_{j=1}^N \left( u_j - \hat{U}_\theta(s_j) \right) \nabla_\theta \hat{U}_\theta(s_j)$$
   - **Limitation in RL:** The agent cannot adapt its policy during an episode. It must wait until thousands of episodes conclude, store all transitions in memory, compute an expensive batch sum, and perform a single step.

2. **The Widrow-Hoff (Delta Rule / Online SGD):**
   Discards the batch summation entirely. The moment a state $s_t$ yields a target return $u_t$, it executes an **immediate parameter update**:
   $$\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} + \alpha \left( u_t - \hat{U}_\theta(s_t) \right) \nabla_\theta \hat{U}_\theta(s_t)$$
   - **Mathematical Equivalence:** The expected value of the stochastic Widrow-Hoff gradient matches the true batch gradient:
     $$\mathbb{E}_{(s, u) \sim \mathcal{D}} \left[ (u - \hat{U}_\theta(s)) \nabla_\theta \hat{U}_\theta(s) \right] = - \nabla_\theta \mathcal{L}_{\text{batch}}(\boldsymbol{\theta})$$
   - **Why Online is Superior for RL:** Reinforcement learning is an inherently **non-stationary** problem. As the agent updates its policy, the distribution of visited states and future rewards changes. The Widrow-Hoff rule enables continuous, real-time online tracking of shifting value targets without ever storing past historical data.

---

## 4. Approximate Temporal Difference (TD) Learning: Semi-Gradient TD, SARSA, and Q-Learning

Monte Carlo methods require an agent to wait until an episode terminates before updating parameters, because the return $u_t$ depends on all future rewards. In long or non-terminating tasks, Monte Carlo learning suffers from **high variance** and cannot learn online.

**Temporal Difference (TD) Learning** overcomes this by **bootstrapping**: updating value estimates based on other learned estimates after a single step.

### 4.1 The Semi-Gradient Mechanism

Recall the one-step Bellman target for state utility:
$$U(S_t) \approx R_{t+1} + \gamma \hat{U}_\theta(S_{t+1})$$

We define the squared temporal difference error for transition $(S_t, R_{t+1}, S_{t+1})$:
$$\mathcal{E}_{\text{TD}}(\boldsymbol{\theta}) = \frac{1}{2} \left( R_{t+1} + \gamma \hat{U}_\theta(S_{t+1}) - \hat{U}_\theta(S_t) \right)^2$$

Notice a critical mathematical issue: **the target $R_{t+1} + \gamma \hat{U}_\theta(S_{t+1})$ itself depends on the parameter vector $\boldsymbol{\theta}$!**
If we were to compute the true full gradient of $\mathcal{E}_{\text{TD}}$ with respect to $\boldsymbol{\theta}$:
$$\nabla_\theta \mathcal{E}_{\text{TD}}(\boldsymbol{\theta}) = \left( \hat{U}_\theta(S_t) - (R_{t+1} + \gamma \hat{U}_\theta(S_{t+1})) \right) \left( \nabla_\theta \hat{U}_\theta(S_t) - \gamma \nabla_\theta \hat{U}_\theta(S_{t+1}) \right)$$
Differentiating through the target ($\gamma \nabla_\theta \hat{U}_\theta(S_{t+1})$) is computationally complex and empirically destabilizing.

In **Semi-Gradient TD**, we treat the bootstrapped target $R_{t+1} + \gamma \hat{U}_\theta(S_{t+1})$ as a **fixed, frozen scalar target**, ignoring its derivative with respect to $\boldsymbol{\theta}$:
$$\theta_i \leftarrow \theta_i + \alpha \left( R(s, a, s') + \gamma \hat{U}_\theta(s') - \hat{U}_\theta(s) \right) \frac{\partial \hat{U}_\theta(s)}{\partial \theta_i}$$

---

### 4.2 SARSA vs. Q-Learning with Function Approximation

When transitioning from passive state evaluation to active control, we parameterize the action-value function $\hat{Q}_\theta(s, a)$.

```
+---------------------------------------------------------------------------------------------------+
|                                 ACTIVE TD CONTROL UPDATE COMPARISON                               |
+---------------------+-----------------------------------------------------------------------------+
| Algorithm           | Parameter Update Equation                                                   |
+---------------------+-----------------------------------------------------------------------------+
| SARSA (On-Policy)   | \theta \leftarrow \theta + \alpha [ R + \gamma \hat{Q}_\theta(s', a')         |
|                     |                   - \hat{Q}_\theta(s, a) ] \nabla_\theta \hat{Q}_\theta(s, a)|
+---------------------+-----------------------------------------------------------------------------+
| Q-Learning          | \theta \leftarrow \theta + \alpha [ R + \gamma \max_{a'} \hat{Q}_\theta(s',a')|
| (Off-Policy)        |                   - \hat{Q}_\theta(s, a) ] \nabla_\theta \hat{Q}_\theta(s, a)|
+---------------------+-----------------------------------------------------------------------------+
```

---

### 4.3 In-Depth Explanation of SARSA: Mechanics, Safety, and Deep RL Incompatibility

#### What Does SARSA Stand For?
SARSA is named directly after the 5-tuple sequence of events that constitute an on-policy transition:
$$(S_t, A_t, R_{t+1}, S_{t+1}, A_{t+1}) \implies \mathbf{S} - \mathbf{A} - \mathbf{R} - \mathbf{S} - \mathbf{A}$$
- The agent starts in state $S_t = s$.
- Takes action $A_t = a$ selected by its behavioral policy (e.g., $\epsilon$-greedy).
- Receives immediate environmental reward $R_{t+1} = r$.
- Transitions to next state $S_{t+1} = s'$.
- **Critically:** Samples the **next action $A_{t+1} = a'$ from its current policy $\pi(s')$** *before* updating parameters!

#### Why is SARSA "On-Policy"?
- **On-Policy Definition:** An algorithm is on-policy if it evaluates and improves the **exact same behavioral policy** that is generating the environment interactions.
- In SARSA, the bootstrapped target is $r + \gamma \hat{Q}_\theta(s', a')$, where $a'$ is the actual exploratory action executed at $t+1$.
- In contrast, **Q-Learning is Off-Policy** because its target $r + \gamma \max_{a'} \hat{Q}_\theta(s', a')$ assumes the agent will act **greedily** in the future, regardless of the random exploratory actions the behavioral policy actually takes.

#### Why is SARSA "Safer" During Online Exploration? (The Cliff Walking Experiment)

Consider the classic **Cliff Walking** benchmark (Sutton & Barto, Example 6.6):
- A gridworld with a start tile $S$ at the bottom-left, a goal tile $G$ at the bottom-right, and an open cliff spanning the bottom row between them. Stepping off the cliff incurs a catastrophic penalty of $-100$ and resets the agent to $S$.
- Standard moves incur $-1$ reward.

```
+---+---+---+---+---+---+---+---+---+---+---+---+
|   |   |   |   |   |   |   |   |   |   |   |   |  <-- SARSA learns the SAFE DETOUR
+---+---+---+---+---+---+---+---+---+---+---+---+      along the top row (avoids cliff)
|   |   |   |   |   |   |   |   |   |   |   |   |
+---+---+---+---+---+---+---+---+---+---+---+---+
| S | X | X | X | X | X | X | X | X | X | X | G |  <-- Q-Learning learns the OPTIMAL EDGE
+---+---+---+---+---+---+---+---+---+---+---+---+      path, but falls off during exploration!
  ^   =================================   ^
Start          THE CLIFF (-100)          Goal
```

- **Q-Learning Behavior:**
  Q-learning estimates $Q^*(s, a)$ assuming greedy future actions. It identifies the optimal shortest path: walking directly along the edge of the cliff (reward: $-13$). However, because the agent explores using an $\epsilon$-greedy policy ($\epsilon = 0.1$), it frequently takes random actions while walking on the edge, plunging off the cliff and racking up massive negative penalties (average online return $\approx -100$).
- **SARSA Behavior:**
  SARSA evaluates the return of the policy **inclusive of its exploratory errors**. It realizes that standing near the cliff edge carries an inherent risk of falling due to the $\epsilon$-greedy exploration mechanism. Consequently, SARSA routes the agent along the top row—a longer path (reward: $-17$), but completely immune to accidental falls.
- **Summary:** SARSA achieves a **higher online reward during training** in high-risk environments because it accounts for its own exploratory mistakes.

#### Why is SARSA Rarely Used in Deep RL with Experience Replay?
In Deep Reinforcement Learning, **Experience Replay** is essential for stability. However, SARSA is fundamentally incompatible with standard experience replay:
1. An experience replay buffer stores historical transitions $(s, a, r, s', a')$ collected over thousands of previous iterations by older parameter checkpoints $\boldsymbol{\theta}_{\text{past}}$.
2. SARSA requires transitions to reflect the **current policy $\pi_{\theta_{\text{now}}}$**.
3. Replaying an old transition where $a'$ was chosen by $\pi_{\theta_{\text{past}}}$ introduces severe **on-policy distribution mismatch**: the expectation $\mathbb{E}[Q(s', a')]$ does not match the current policy's distribution, inducing systematic bias and divergence.
4. Q-learning does not suffer from this issue because its target $\max_{a'} Q(s', a'; \boldsymbol{\theta}_{\text{now}})$ is computed dynamically using the current network, making it inherently off-policy.

---

## 5. Instabilities in Approximate Utility Learning: The Deadly Triad & Catastrophic Forgetting

While combining function approximation with reinforcement learning enables massive scalability, it introduces severe mathematical instability. In tabular settings, reinforcement learning algorithms enjoy ironclad convergence proofs. However, when moving to function approximation, algorithms can become unstable and **diverge to infinity**.

---

### 5.1 The Deadly Triad

Richard Sutton and Andrew Barto formalized the root cause of this instability as **The Deadly Triad**: reinforcement learning algorithms risk catastrophic mathematical divergence whenever all three of the following elements are present simultaneously:

```
                                  THE DEADLY TRIAD
                                         |
         +-------------------------------+-------------------------------+
         |                                                               |
         v                                                               v
1. FUNCTION APPROXIMATION                                     2. BOOTSTRAPPING
Generalizing across states via parameter vector \theta        Updating value estimates using other learned
(linear weights or deep neural networks; updates to           estimates (TD(0), TD(\lambda), Bellman backups)
one state inadvertently spill over to other states)           rather than relying on complete empirical returns
         |                                                               |
         +-------------------------------+-------------------------------+
                                         |
                                         v
                              3. OFF-POLICY LEARNING
                              Evaluating or optimizing a target policy \pi using
                              transitions generated by a different behavior policy \mu
                              (e.g., from an exploration schedule or replay buffer)
```

#### Systematic Algorithm Stability Comparison
The presence or absence of these three pillars dictates whether an algorithm converges safely or risks mathematical divergence:

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

#### Why is Q-Learning Seen as the Prime Culprit?
In practical applications, Q-learning and DQN are heavily associated with divergence because they **naturally combine all three deadly elements**:
1. It uses **Function Approximation** (convolutional or fully connected deep networks).
2. It uses **Bootstrapping** (the target is $R + \gamma \max_{a'} Q(s', a')$).
3. It is inherently **Off-Policy** (the target policy is greedy $\arg\max$, while behavior is $\epsilon$-greedy or drawn from an experience replay buffer).
4. Furthermore, Q-learning adds a **$\max$ operator**, which injects **Maximization Bias (Overestimation)** into the bootstrapped target via Jensen's inequality ($\mathbb{E}[\max(X_1, X_2)] \ge \max(\mathbb{E}[X_1], \mathbb{E}[X_2])$).

However, the foundational root cause of divergence is **not the Q-learning algorithm itself, nor the $\max$ operator**, but the fatal intersection of the Deadly Triad. Even a simple linear policy evaluation task without any $\max$ operator can explode to infinity, as demonstrated by Baird's counterexample.

---

### 5.2 Baird's Counterexample: The "7-Store Franchise Ponzi Scheme"

In 1995, Leemon Baird constructed an elegant minimal MDP demonstrating that combining linear function approximation, bootstrapping, and off-policy learning causes parameters to diverge toward infinity ($\|\boldsymbol{\theta}\| \to \infty$).

```
                      BAIRD'S 7-STATE STAR MDP TOPOLOGY
                                     |
               +---------------------+---------------------+
               |                     |                     |
               v                     v                     v
          [ Branch 1 ]          [ Branch 2 ]          [ Branch 3 ]  ... [ Branch 6 ]
               |                     |                     |                 |
               +---------------------+---------------------+-----------------+
                                     |
                          Dashed action: Go to HQ
                                     |
                                     v
                           [ Headquarter: State 7 ]
                                     |
                          Solid action: Stay in HQ
                                     |
                                     +---> Loops back to States 1-6 uniformly
```

In plain intuition: **Baird's Counterexample is a mathematical trap where the system inflates its own valuation balloon until it explodes.**

Think of it as a **"7-Store Franchise Accounting Fraud"**:

#### 1. The Absurd System Setup
- **The Stores:** There is **1 Headquarter (State 7)** and **6 Branch Stores (States 1–6)**.
- **Zero Real Revenue:** The entire franchise generates zero revenue. Every transition yields an immediate reward of **$R = 0$**. The true ground truth value of every store is strictly **$0$**.
- **Self-Delusional Accounting (Bootstrapping):** Instead of inspecting actual cash flow, branch stores calculate their valuation by looking at the estimated valuation of the Headquarter.
- **Shared Capital Pool (Function Approximation / Shared Weights):** The franchise uses linear function approximation with 8 parameter weights $(w_1, \dots, w_8)$. Every single store's valuation formula shares a single major investor capital parameter: **$w_8$**.
  - Value of Branch $i \in \{1, \dots, 6\}$: $\hat{U}(s_i) = 2 w_i + w_8$.
  - Value of Headquarter (State 7): $\hat{U}(s_7) = w_7 + 2 w_8$.
  *(Notice the dangerous multiplier: $w_8$ has a coefficient of 1 in the branches, but a coefficient of 2 in the Headquarter!)*

#### 2. The Exploding Vicious Cycle (Positive Feedback Loop)
Suppose the system begins with an arbitrary initial guess where Headquarter valuation is estimated at $\$10$:

1. **Branches Mirror the Headquarter:**
   The 6 branch stores look at the Headquarter's $\$10$ valuation. The Bellman update states: *"Our branch valuation should also equal the discounted value of the Headquarter ($\gamma \times 10$)."*
2. **Amplified Chain Reaction via Shared Weights:**
   To pull the valuations of all 6 branches up toward $\$10$, gradient descent increases the shared parameter $w_8$.
3. **Shooting Themselves in the Foot:**
   Because the Headquarter's valuation formula contains $2 w_8$, increasing $w_8$ inadvertently **inflates the Headquarter's own valuation** from $\$10$ to $\$20$!
4. **The Vicious Cycle Accelerates:**
   In the next iteration, the branches look up again: *"Wait, the Headquarter is now worth $\$20$! We must increase our valuation to match $\$20$!"*
   The system increases $w_8$ again, which shoots the Headquarter's valuation up to $\$40$, then $\$80$, then $\$160$...

#### 3. Why Doesn't the Auditor Stop the Fraud? (The Role of Off-Policy Learning)
A natural question arises: *why don't real environmental visits to the Headquarter expose the fact that revenue is actually zero ($R = 0$)?*

This is where **Off-Policy Learning** delivers the fatal blow:
- **The Behavior Policy (The Biased Auditor):** The transitions used to train the network are sampled from an exploratory behavior policy $b$ that spends $6/7$ ($\approx 86\%$) of its time visiting the 6 branch stores, and only $1/7$ visiting the Headquarter.
- **The Target Policy (The Valuation Target):** The policy being evaluated $\pi$ always transitions deterministically to the Headquarter (State 7).
- **The Fatal Disconnect:** The gradient descent optimizer spends virtually all its time processing transitions from States 1–6, frantically raising $w_8$ to chase the Headquarter's moving target. It almost never samples the Headquarter to observe the real reward $R = 0$ and force $w_8$ back to zero.

#### Core Theoretical Conclusion
Baird's counterexample is **not an obscure deep learning bug**. It proves that combining three elementary mathematical operations—**updating guesses from guesses (bootstrapping)** + **tying states together (function approximation)** + **auditing the wrong states (off-policy)**—causes even elementary linear systems to construct an uncontrolled positive feedback loop that diverges to **$\infty$**.

---

### 5.3 Mathematical Anatomy: Stationary Distributions, Contraction Mappings, and Why On-Policy Self-Corrects

Why does **On-Policy learning remain stable**, while **Off-Policy learning causes the mathematical brakes to fail completely**?

The fundamental mathematical answer lies in whether the data distribution guarantees a **Contraction Mapping under the Stationary Distribution**.

```
+---------------------------------------------------------------------------------------+
|                               CONTRACTION MAPPING DYNAMICS                            |
|                                                                                       |
|   True Value Space                                Projected Approximation Subspace    |
|   +-----------------------+                       +-------------------------------+   |
|   |                       |   Bellman Backup T    |                               |   |
|   |         U             | --------------------> |              T U              |   |
|   |                       |                       |                               |   |
|   +-----------------------+                       +-------------------------------+   |
|                                                                   |                   |
|                                                Orthogonal         |                   |
|                                                Projection \Pi     v                   |
|                                                   +-------------------------------+   |
|                                                   |             \Pi T U           |   |
|                                                   |   (Projected Value Target)    |   |
+---------------------------------------------------------------------------------------+
```

#### 1. The Curse of Function Approximation: Extrapolation Error
A parameterized function (whether a neural network or linear features) has finite capacity. When a gradient update adjusts parameters $\boldsymbol{\theta}$ to make state $A$ more accurate, the shared weights inevitably **distort the value predictions of states $B$ and $C$** (the unavoidable side-effect of generalization).
The survival of the algorithm depends on: **what weighting distribution balances these cross-state distortions?**

#### 2. Under On-Policy Learning: The Self-Correcting Closed Loop
- **Data Distribution:** Under on-policy learning, experience tuples are sampled strictly according to the **stationary state distribution $d^\pi(s)$** generated by the target policy $\pi$.
- **Automatic Brake System:** States visited frequently by policy $\pi$ naturally have high probability mass $d^\pi(s)$ in the training loss. If function approximation distorts the utility of a high-frequency state, the agent visits that state immediately in the next step, computing a massive error signal that **aggressively forces the weights back to reality**.
- **Mathematical Contraction Guarantee:**
  Tsitsiklis and Van Roy (1997) proved that the Bellman operator $T^\pi$ and the projection operator $\Pi$ form a **strict contraction mapping** under the weighted Euclidean norm $\| \cdot \|_{d^\pi}$:
  $$\| \Pi T^\pi U_1 - \Pi T^\pi U_2 \|_{d^\pi} \le \gamma \| U_1 - U_2 \|_{d^\pi}$$
  Because the composite operator $\Pi T^\pi$ is a contraction mapping with factor $\gamma < 1$, the Banach Fixed-Point Theorem guarantees that on-policy linear TD **converges to a unique, finite fixed point $\hat{U}^*$**. Errors are permanently trapped within a self-limiting boundary.

#### 3. Why Off-Policy Learning Breaks the Brakes (Shattering Contraction)
Under off-policy learning, experience is sampled according to a behavior distribution $d^b(s)$, which does not match the target policy's stationary distribution $d^\pi(s)$:

1. **Failure of the Contraction Property:**
   While the Bellman operator $T^\pi$ contracts under $d^\pi$, the projection operator $\Pi$ is an orthogonal projection under $d^b$. The composite operator $\Pi T^\pi$ is **no longer a contraction mapping**! Its maximum eigenvalue can strictly exceed 1 ($\rho(\Pi T^\pi) > 1$). In linear algebra, repeatedly multiplying by an operator with eigenvalues $> 1$ guarantees exponential divergence to infinity.
2. **Intuitive Operational Failure: "Boasting with No Auditor"**
   Returning to Baird's counterexample:
   - Target policy $\pi$ transitions toward State 7 (the Headquarter), so bootstrapping pulls valuations toward State 7.
   - Behavior policy $b$ samples almost exclusively from States 1–6 (the branches).
   - The algorithm continuously computes gradient updates that inflate shared parameter $w_8$.
   - **If it were On-Policy:** The agent would immediately visit State 7, observe real reward $R = 0$, and pull $w_8$ down.
   - **Because it is Off-Policy:** The data generator rarely visits State 7. The unverified boast is never checked against empirical reality. The closed loop breaks, and the valuation balloon explodes.

---

### 5.4 Three Surgical Strategies to Tame Bootstrapping

In real-world deep reinforcement learning:
- **Function Approximation (Neural Networks)** is indispensable for high-dimensional sensory control.
- **Off-Policy Learning (Replay Buffers)** is essential for high sample efficiency and data reuse.

Because we cannot discard Function Approximation or Off-Policy Learning, how does modern reinforcement learning tame the second pillar—**Bootstrapping**?
The AI research community developed three foundational surgical paradigms:

```
+-----------------------------------+-----------------------------------+-----------------------------------+
| Strategy                          | Representative Algorithms         | Core Trade-Off & Mechanism        |
+-----------------------------------+-----------------------------------+-----------------------------------+
| Strategy 1: Completely Abandon    | REINFORCE, Pure Monte Carlo       | Zero risk of divergence;          |
| Bootstrapping                     | Policy Gradients                  | catastrophic variance; no non-term|
+-----------------------------------+-----------------------------------+-----------------------------------+
| Strategy 2: Dilute / Tune         | n-Step Returns, TD(\lambda),      | Balances bias and variance;       |
| Bootstrapping Depth               | Generalized Advantage Est (GAE)   | discounts unverified guess by \gamma^n|
+-----------------------------------+-----------------------------------+-----------------------------------+
| Strategy 3: Freeze the Target     | Target Network in DQN, DDPG,      | Converts moving target into stable|
| (Modern Engineering Standard)     | TD3, Soft Actor-Critic (SAC)      | supervised regression; highly robust|
+-----------------------------------+-----------------------------------+-----------------------------------+
```

#### Strategy 1: Completely Abandon Bootstrapping (Pure Monte Carlo)
- **Mechanism:** Eliminate unverified value estimates entirely from the target. Replace $V(S_{t+1})$ with the true empirical episode return:
  $$\text{Target} = G_t = \sum_{k=0}^{T-t-1} \gamma^k R_{t+k+1}$$
- **Representative Methods:** REINFORCE (Monte Carlo Policy Gradient).
- **Pros:** Completely destroys the Deadly Triad (Pillar 2 is gone). Guaranteed never to diverge!
- **Cons:** Massive variance (compounding thousands of stochastic actions and transitions); completely unusable in non-terminating, continuous, or infinite-horizon environments.

#### Strategy 2: Dilute Bootstrapping Depth ($n$-Step Returns & GAE)
- **Mechanism:** Compromise between pure 1-step TD and full Monte Carlo rollouts. Accumulate $n$ steps of real environmental rewards before bootstrapping from the estimated utility of state $S_{t+n}$:
  $$G_{t:t+n} = R_{t+1} + \gamma R_{t+2} + \dots + \gamma^{n-1} R_{t+n} + \gamma^n \hat{U}(S_{t+n})$$
- **Why It Tames Instability:**
  Real environment rewards constitute the bulk of the target. The unverified estimate $\hat{U}(S_{t+n})$ is heavily discounted by $\gamma^n$ (e.g., if $\gamma = 0.9$ and $n = 5$, $\gamma^5 \approx 0.59$; if $n = 10$, $\gamma^{10} \approx 0.35$). This severely dampens the positive feedback amplification speed.
- **Representative Methods:** Rainbow DQN ($n$-step learning), Generalized Advantage Estimation (GAE) in PPO and TRPO.

#### Strategy 3: Freeze the Bootstrapped Target (Target Networks)
- **Mechanism:** Maintain two sets of parameters: an **online network $\boldsymbol{\theta}$** (updated continuously via gradient descent) and a **frozen target network $\boldsymbol{\theta}^-$** (used exclusively to compute target values):
  $$\text{Target} = R_{t+1} + \gamma \max_{a'} Q(S_{t+1}, a'; \boldsymbol{\theta}^-)$$
- **Why It Stabilizes Training:**
  It severs the feedback loop. Even if gradient descent aggressively shifts online weights $\boldsymbol{\theta}$, the target network $\boldsymbol{\theta}^-$ remains fixed. The moving target is frozen in place, reducing the reinforcement learning update to a standard, well-behaved **supervised regression problem**.
- **Target Network Update Schemes:**
  1. *Periodic Hard Reset (DQN):* Copy $\boldsymbol{\theta}^- \leftarrow \boldsymbol{\theta}$ every $C = 10,000$ steps.
  2. *Polyak Soft Averaging (DDPG, TD3, SAC):* Update target weights smoothly at every microstep with tracking rate $\tau \ll 1$ (e.g., $\tau = 0.005$):
     $$\boldsymbol{\theta}^- \leftarrow \tau \boldsymbol{\theta} + (1 - \tau) \boldsymbol{\theta}^-$$

---

### 5.5 Catastrophic Forgetting in Deep Networks

In deep neural networks, parameters $\boldsymbol{\theta}$ are shared across the entire state space:
- When an agent explores a new corridor or game level, gradient updates optimize weights to fit localized new transitions.
- These updates inadvertently overwrite and degrade the network's internal representations of previously learned, rarely visited states.
- By the time the agent returns to the initial state, its estimated Q-values have decayed, forcing it to relearn the basics repeatedly.

**Architectural Solution: Experience Replay.** By buffering transitions across long horizons and sampling minibatches uniformly, the training distribution remains stationary, preventing localized gradient updates from overwriting historical knowledge.

---

## 6. Deep Q-Networks (DQN) for High-Dimensional Control

In 2015, DeepMind achieved human-level control across 49 Atari 2600 games using **Deep Q-Networks (DQN)** (Mnih et al., *Nature* 2015). DQN demonstrated that an agent can learn optimal policies directly from high-dimensional sensory pixel inputs without manual feature engineering.

```
                               DQN END-TO-END ARCHITECTURE
                                            |
4 Game Frames        Conv Layer 1           Conv Layer 2           Conv Layer 3       FC Layer     Output Q(s, a)
84 x 84 x 4 ------> 32 filters, 8x8 ------> 64 filters, 4x4 ------> 64 filters, 3x3 ----> 512 ------> 18 discrete
(Grayscale)         stride 4, ReLU         stride 2, ReLU         stride 1, ReLU      units        joystick actions
```

### 6.1 State Preprocessing & Temporal Stacking

A single static video frame does not provide velocity, acceleration, or trajectory direction (e.g., whether a ball in *Pong* is moving toward or away from the paddle).
- **Temporal Stacking:** DQN stacks the **last 4 consecutive game frames**, downsampled and converted to grayscale ($84 \times 84 \times 4$).
- This converts the non-Markovian single-frame observation into a fully observable Markov state $s_t \in \mathbb{R}^{84 \times 84 \times 4}$.

---

### 6.2 Two Architectural Breakthroughs for Stability

Standard Q-learning diverges when paired with non-linear deep neural networks due to the Deadly Triad. DQN introduced two algorithmic mechanisms that stabilized training:

#### 1. Experience Replay Memory ($\mathcal{D}$)
Transitions $e_t = (s_t, a_t, r_{t+1}, s_{t+1})$ are stored in a massive circular replay memory buffer $\mathcal{D}$ (typically holding $10^6$ transitions).
- **Breaking Autocorrelation:** Successive frames in an episode are strongly correlated. Training on sequential streams violates the independent and identically distributed (i.i.d.) assumption of stochastic gradient descent. Sampling random minibatches from $\mathcal{D}$ completely breaks temporal correlation.
- **Sample Efficiency:** Each transition is reused in multiple gradient updates rather than discarded after a single step.

#### 2. Fixed Target Network ($Q(s, a; \boldsymbol{\theta}^-)$)
In standard Q-learning, both the predicted value $Q(s, a; \boldsymbol{\theta})$ and the target $r + \gamma \max_{a'} Q(s', a'; \boldsymbol{\theta})$ share the exact same weights $\boldsymbol{\theta}$.
- Updating $\boldsymbol{\theta}$ to increase $Q(s, a)$ also changes the target for $s'$, creating a **moving target** that causes feedback oscillations.
- **Solution:** DQN maintains two separate networks:
  1. The **Online Network** ($Q(s, a; \boldsymbol{\theta})$): Updated continuously via gradient descent at every step.
  2. The **Target Network** ($Q(s, a; \boldsymbol{\theta}^-)$): Weights $\boldsymbol{\theta}^-$ are held completely frozen. Every $C$ steps (e.g., $C = 10,000$), the online weights are copied to the target network ($\boldsymbol{\theta}^- \leftarrow \boldsymbol{\theta}$).

---

### 6.3 The DQN Training Objective & Loss Function

At each training step, a minibatch of transitions $(s, a, r, s')$ is sampled uniformly from $\mathcal{D}$.
The target value is computed using the frozen target network:
$$y_i = \begin{cases} r & \text{if } s' \text{ is terminal} \\ r + \gamma \max_{a' \in \mathcal{A}} Q(s', a'; \boldsymbol{\theta}^-) & \text{otherwise} \end{cases}$$

The network parameters $\boldsymbol{\theta}$ are updated by minimizing the mean squared Bellman error:
$$\mathcal{L}(\boldsymbol{\theta}) = \mathbb{E}_{(s, a, r, s') \sim \mathcal{D}} \left[ \left( y_i - Q(s, a; \boldsymbol{\theta}) \right)^2 \right]$$

Differentiating with respect to the online weights $\boldsymbol{\theta}$:
$$\nabla_\theta \mathcal{L}(\boldsymbol{\theta}) = \mathbb{E}_{(s, a, r, s')} \left[ \left( Q(s, a; \boldsymbol{\theta}) - y_i \right) \nabla_\theta Q(s, a; \boldsymbol{\theta}) \right]$$

### 6.4 Case Study: Deep Q-Networks on Gymnasium Lunar Lander

Beyond Atari pixel environments, the canonical modern benchmark for value-based Deep Reinforcement Learning is **Lunar Lander** (`gymnasium.make("LunarLander-v3")`):

```
+-------------------------------------------------------------------------------+
|                      GYMNASIUM LUNAR LANDER ENVIRONMENT                       |
+-------------------------------------------------------------------------------+
|                                                                               |
|              [ Lunar Lander Module ]                                          |
|                     /       \                                                 |
|            Left Eng.  Main   Right Eng.                                       |
|                         v                                                     |
|   (Continuous State Vector: x, y, vx, vy, θ, ω, left_leg, right_leg)          |
|                                                                               |
|       |                                                               |       |
|     Flag 1 (x = -0.2)             Landing Pad               Flag 2 (x = +0.2) |
|   =========================================================================   |
|   /////////////////////////////////////////////////////////////////////////   |
+-------------------------------------------------------------------------------+
```

- **Continuous Observation Space ($S \subset \mathbb{R}^8$):**
  $$\mathbf{s} = [x, \, y, \, v_x, \, v_y, \, \theta, \, \omega, \, c_{\text{left}}, \, c_{\text{right}}]^T$$
  * $x, y \in [-2.5, 2.5] \times [-1.5, 1.5]$: Horizontal and vertical coordinates.
  * $v_x, v_y \in [-10, 10]$: Horizontal and vertical linear velocities.
  * $\theta \in [-\pi, \pi]$: Lander roll orientation angle.
  * $\omega \in [-10, 10]$: Angular velocity.
  * $c_{\text{left}}, c_{\text{right}} \in \{0, 1\}$: Binary ground-contact indicators for left and right landing legs.
- **Discrete Action Space ($A = \text{Discrete}(4)$):**
  * Action $0$: Do nothing (free fall under gravity).
  * Action $1$: Fire left orientation engine (applies counter-clockwise torque).
  * Action $2$: Fire main engine (provides strong vertical upward thrust).
  * Action $3$: Fire right orientation engine (applies clockwise torque).
- **Network Architecture:**
  A Multi-Layer Perceptron (MLP) Deep Q-Network (e.g., 8 inputs $\to$ Dense 128 ReLU $\to$ Dense 128 ReLU $\to$ 4 linear Q-value outputs) maps continuous state vectors directly to action-values $Q(s, a)$.
- **Empirical Training Trajectory:**
  * **Episode #1 (Untrained Agent):** With randomly initialized weights and high $\epsilon$-greedy exploration, the lander fires thrusters erratically, loses attitude control, flips upside-down, and crashes violently into the lunar surface, incurring catastrophic penalties ($\approx -250$ to $-400$).
  * **Episode #1500 (Converged DQN Agent):** Leveraging experience replay and fixed target networks, the network learns to throttle the main engine to decelerate descent speed ($v_y \to 0$), uses orientation thrusters to hold $\theta \approx 0$, and touches down smoothly between the two yellow flags, achieving scores consistently exceeding $+200$ points.


---

## 7. Advanced DQN Extensions & Theoretical Limitations

Following the success of DQN, several foundational algorithmic extensions resolved its key theoretical weaknesses.

### 7.1 Modern DQN Extensions

```
+-----------------------------------+-----------------------------------------------------------------------+
| DQN Extension                     | Algorithmic Mechanism & Core Innovation                               |
+-----------------------------------+-----------------------------------------------------------------------+
| Double DQN (DDQN, 2016)           | Decouples action selection from action evaluation to eliminate        |
|                                   | maximization bias: y = r + \gamma Q(s', \arg\max_a Q(s', a; \theta); \theta^-)|
+-----------------------------------+-----------------------------------------------------------------------+
| Prioritized Replay (PER, 2016)    | Samples transitions proportional to TD error magnitude |\delta|^\alpha;|
|                                   | corrects non-uniform sampling bias via importance sampling weights    |
+-----------------------------------+-----------------------------------------------------------------------+
| Dueling DQN (2016)                | Splits network into separate State Value V(s) and Advantage A(s, a)   |
|                                   | streams: Q(s, a) = V(s) + (A(s, a) - (1/|A|) \sum A(s, a'))          |
+-----------------------------------+-----------------------------------------------------------------------+
| Multi-Step Learning (n-step)      | Replaces 1-step TD target with n-step forward return:                  |
|                                   | G_{t:t+n} = \sum \gamma^i R_{t+i+1} + \gamma^n \max Q(s_{t+n}, a')    |
+-----------------------------------+-----------------------------------------------------------------------+
| Distributional RL (C51, 2017)     | Predicts full probability distribution of returns Z(s, a) over 51     |
|                                   | categorical atoms rather than a single scalar expected value          |
+-----------------------------------+-----------------------------------------------------------------------+
| Rainbow DQN (2018)                | Unifies all 6 extensions (DDQN, PER, Dueling, Multi-step, C51, Noisy)  |
|                                   | into a single cohesive, state-of-the-art value-based framework        |
+-----------------------------------+-----------------------------------------------------------------------+
```

#### Maximization Bias in Q-Learning & Double DQN
In standard Q-learning, the target uses $\max_{a'} Q(s', a'; \boldsymbol{\theta}^-)$. Due to Jensen's inequality and noise in function approximation:
$$\mathbb{E}\left[ \max(X_1, X_2) \right] \ge \max\left( \mathbb{E}[X_1], \mathbb{E}[X_2] \right)$$
The $\max$ operator systematically overestimates action values, leading to hyper-inflated Q-values and sub-optimal policies.
**Double DQN** eliminates this bias by decoupling selection from evaluation:
- The **Online Network** selects the greedy action: $a^* = \arg\max_a Q(s', a; \boldsymbol{\theta})$.
- The **Target Network** evaluates that action's value: $Q(s', a^*; \boldsymbol{\theta}^-)$.

---

### 7.2 Where DQN Struggles: Three Inherent Structural Bottlenecks

Despite its empirical triumphs in arcade games and low-dimensional control, value-based Deep Q-Learning suffers from three critical architectural limitations:

1. **Intractability of Continuous Action Maximization:**
   DQN's policy and target evaluation depend strictly on computing:
   $$\pi(s) = \arg\max_{a \in \mathcal{A}} Q(s, a) \quad \text{and} \quad y = r + \gamma \max_{a' \in \mathcal{A}} Q(s', a'; \boldsymbol{\theta}^-)$$
   In continuous action spaces ($\mathcal{A} \subset \mathbb{R}^d$, such as joint torques in humanoid robotics), computing the global maximum of a non-convex neural network $Q(s, a)$ over a continuous manifold requires running an expensive numerical optimization (e.g., gradient ascent or cross-entropy method) at every single millisecond control step. Consequently, **vanilla DQN is completely inapplicable to continuous control**.
2. **Linear Scoring Cost with Action Cardinality ($|\mathcal{A}|$):**
   DQN requires scoring every candidate action individually at each timestep. As the discrete action space grows (e.g., multi-agent coordination, combinatorial games, natural language generation), the network's output layer expands and computing $\arg\max$ becomes computationally expensive, memory-intensive, and prone to gradient variance.
3. **Rigidity of Purely Deterministic Greedy Policies:**
   DQN's greedy policy is fundamentally deterministic ($\pi^*(s) = \arg\max_a Q(s, a)$). However, many complex tasks benefit from **inherent stochasticity**:
   - *Imperfect-Information Games (Poker, Rock-Paper-Scissors):* Deterministic policies are trivially exploitable; game-theoretic equilibria require mixed (stochastic) strategies.
   - *State Aliasing & Partial Observability (POMDPs):* When different underlying states appear identical, stochastic policies prevent the agent from getting trapped in infinite deterministic loops.
   - *Exploration in Non-Stationary Environments:* Maintaining entropy-driven randomized policies preserves adaptability across changing reward landscapes.

These limitations force a paradigm shift: **instead of parameterizing the value function and deriving the policy indirectly, parameterize the policy directly!**

---

## 8. Policy Search & The Policy Gradient Theorem

In **Policy Search**, an agent directly parameterizes a stochastic policy:

$$\pi_\theta(a \mid s) = \Pr(A_t = a \mid S_t = s; \boldsymbol{\theta})$$

```
+-------------------------------------------------------------------------------+
|                            VALUE-BASED VS. POLICY-BASED                       |
+------------------------------+------------------------------------------------+
| Value-Based (DQN)            | Policy-Based (Policy Gradients)                |
+------------------------------+------------------------------------------------+
| Learns Q_\theta(s, a)        | Directly learns \pi_\theta(a | s)              |
| Policy derived via argmax    | Directly outputs action probabilities          |
| Discrete action spaces only  | Seamlessly handles continuous actions          |
| Deterministic policies only  | Naturally learns optimal stochastic policies   |
| Indirect optimization        | Directly optimizes expected cumulative return  |
+------------------------------+------------------------------------------------+
```

### 8.1 The Softmax Differentiable Policy

For discrete action spaces, deterministic policies are non-differentiable step functions. To enable gradient optimization, we define a **Softmax Policy** over parameterized action preferences $h(s, a, \boldsymbol{\theta})$:

$$\pi_\theta(a \mid s) = \frac{\exp(h(s, a, \boldsymbol{\theta}) / \tau)}{\sum_{b \in \mathcal{A}} \exp(h(s, b, \boldsymbol{\theta}) / \tau)}$$

- **Temperature Parameter ($\tau > 0$):**
  - As $\tau \to \infty$, the policy approaches a uniform random distribution ($\pi(a \mid s) \to 1/|\mathcal{A}|$), encouraging exploration.
  - As $\tau \to 0$, the policy approaches a deterministic greedy policy ($\pi(a \mid s) \to \arg\max_a h(s, a)$).

---

### 8.2 The Policy Gradient Theorem (Sutton et al., 1999)

We define the objective function as the expected discounted return over complete trajectories (the **Policy Value**):

$$J(\boldsymbol{\theta}) = \mathbb{E}_{\tau \sim \pi_\theta} \left[ R(\tau) \right] = \sum_{s \in \mathcal{S}} d^{\pi_\theta}(s) \sum_{a \in \mathcal{A}} \pi_\theta(a \mid s) Q^{\pi_\theta}(s, a)$$

where $d^{\pi_\theta}(s) = \sum_{t=0}^\infty \gamma^t P(S_t = s \mid s_0, \pi_\theta)$ is the discounted stationary state distribution.

To maximize $J(\boldsymbol{\theta})$ via gradient ascent, we compute $\nabla_\theta J(\boldsymbol{\theta})$.
A major obstacle appears: **changing $\boldsymbol{\theta}$ alters the policy $\pi_\theta(a \mid s)$, which in turn alters the environmental state visitation distribution $d^{\pi_\theta}(s)$!**
Does computing the gradient require differentiating through the unknown transition dynamics $\mathcal{T}(s' \mid s, a)$?

> **Theorem (The Policy Gradient Theorem - Sutton et al., 1999):**
> For any differentiable policy $\pi_\theta(a \mid s)$, the gradient of the expected return with respect to policy parameters $\boldsymbol{\theta}$ is:
>
> $$\nabla_\theta J(\boldsymbol{\theta}) = \sum_{s \in \mathcal{S}} d^{\pi_\theta}(s) \sum_{a \in \mathcal{A}} Q^{\pi_\theta}(s, a) \nabla_\theta \pi_\theta(a \mid s) = \mathbb{E}_{\pi_\theta} \left[ Q^{\pi_\theta}(s, a) \nabla_\theta \log \pi_\theta(a \mid s) \right]$$

#### The Theoretical Significance
The derivative of the state distribution $\nabla_\theta d^{\pi_\theta}(s)$ completely cancels out!
Computing $\nabla_\theta J(\boldsymbol{\theta})$ requires **zero knowledge of environment transition physics $\mathcal{T}$**. The policy gradient can be sampled directly from model-free trajectory experience.

---

## 9. The REINFORCE Algorithm & Baseline Variance Reduction

### 9.1 The Likelihood Ratio / Log-Derivative Trick

To express $\nabla_\theta \pi_\theta(a \mid s)$ in terms of an expectation over actions sampled from $\pi_\theta$, we use the elementary calculus identity:
$$\nabla_\theta \log f(\boldsymbol{\theta}) = \frac{\nabla_\theta f(\boldsymbol{\theta})}{f(\boldsymbol{\theta})} \implies \nabla_\theta f(\boldsymbol{\theta}) = f(\boldsymbol{\theta}) \nabla_\theta \log f(\boldsymbol{\theta})$$

Applying this to $\pi_\theta(a \mid s)$:
$$\sum_{a \in \mathcal{A}} \nabla_\theta \pi_\theta(a \mid s) Q^{\pi_\theta}(s, a) = \sum_{a \in \mathcal{A}} \pi_\theta(a \mid s) \frac{\nabla_\theta \pi_\theta(a \mid s)}{\pi_\theta(a \mid s)} Q^{\pi_\theta}(s, a) = \mathbb{E}_{a \sim \pi_\theta} \left[ Q^{\pi_\theta}(s, a) \nabla_\theta \log \pi_\theta(a \mid s) \right]$$

- $\nabla_\theta \log \pi_\theta(a \mid s)$ is known as the **Score Function** (or eligibility vector).

---

### 9.2 The REINFORCE Algorithm (Williams, 1992)

**REINFORCE** is a Monte Carlo policy gradient algorithm. It replaces the true expected action-value $Q^{\pi_\theta}(s_t, a_t)$ with the actual empirical discounted return $G_t = \sum_{k=t}^T \gamma^{k-t} R_{k+1}$ observed along an episode rollout.

```
                    REINFORCE PARAMETER ASCENT STEP
                                  |
              \theta \leftarrow \theta + \alpha * \gamma^t * G_t * \nabla_\theta log \pi_\theta(a_t | s_t)
                                           |      |     |
                 Discount factor to step t +      |     +-- Direction that increases probability
                                                  |         of taking action a_t in state s_t
                                                  +-- Scalar magnitude: If G_t > 0, push strongly;
                                                      if G_t < 0, pull probability down!
```

---

### 9.3 Baseline Subtraction & The Advantage Function

#### The High-Variance Dilemma
Because Monte Carlo returns $G_t$ compound stochastic transitions and actions across an entire trajectory, sample returns vary wildly. High variance leads to noisy gradient estimates that require millions of episodes to converge.

#### Rigorous Proof of Unbiased Baseline Subtraction
To reduce variance, we subtract any arbitrary **state-dependent baseline function $b(s)$** (which must not depend on action $a$) from the return:

$$\mathbb{E}_{a \sim \pi_\theta} \left[ b(s) \nabla_\theta \log \pi_\theta(a \mid s) \right] = \sum_{a \in \mathcal{A}} \pi_\theta(a \mid s) b(s) \frac{\nabla_\theta \pi_\theta(a \mid s)}{\pi_\theta(a \mid s)} = b(s) \sum_{a \in \mathcal{A}} \nabla_\theta \pi_\theta(a \mid s) = b(s) \nabla_\theta \left( \sum_{a \in \mathcal{A}} \pi_\theta(a \mid s) \right)$$

Because probabilities over all possible actions must sum to 1 ($\sum_a \pi_\theta(a \mid s) = 1$ for any parameter $\boldsymbol{\theta}$):
$$\nabla_\theta (1) = \mathbf{0}$$
Therefore:
$$\mathbb{E}_{a \sim \pi_\theta} \left[ b(s) \nabla_\theta \log \pi_\theta(a \mid s) \right] = b(s) \cdot \mathbf{0} = 0 \quad \blacksquare$$

#### Numerical Demonstration: The Power of Baseline Variance Reduction

To understand why baseline subtraction is indispensable in practice, consider an agent evaluating 4 sample trajectories from state $s$ with noisy Monte Carlo returns $G_t \in \{110, 90, 105, 100\}$:

| Episode | Sample Return $G_t$ | Adjusted Return $(G_t - \mathbf{100})$ | Raw Gradient Term $G_t \nabla_\theta \log \pi$ | Baseline Gradient Term $(G_t - 100) \nabla_\theta \log \pi$ |
| :---: | :---: | :---: | :---: | :---: |
| **#1** | $110$ | $+10$ | $+132.0$ | $+12.0$ |
| **#2** | $90$ | $-10$ | $-90.0$ | $-10.0$ |
| **#3** | $105$ | $+5$ | $+115.5$ | $+5.5$ |
| **#4** | $100$ | $0$ | $+90.0$ | $0.0$ |
| **Sample Variance** | — | — | **$\text{Var} = \mathbf{15,275}$** | **$\text{Var} = \mathbf{28.4}$** |

- **Variance Collapse:**
  By choosing a simple constant baseline $B(s) = 100 \approx \mathbb{E}[G_t]$, the variance of the gradient estimator collapses from **$15,275$** down to **$28.4$**—a **$99.8\%$ reduction in noise**!
- **Zero Directional Bias:**
  Because $\sum_a \nabla_\theta \pi_\theta(a \mid s) B(s) = B(s) \nabla_\theta (1) = 0$, the mathematical expectation of the update vector is completely unaffected:
  $$\mathbb{E}_{\pi_\theta} \left[ (G_t - B(s)) \nabla_\theta \log \pi_\theta(a \mid s) \right] \equiv \mathbb{E}_{\pi_\theta} \left[ G_t \nabla_\theta \log \pi_\theta(a \mid s) \right]$$
  The policy climbs in the exact same true direction, but with virtually zero stochastic jitter.


> **Profound Conclusion:**
> Subtracting a baseline $b(s)$ leaves the expected gradient **strictly unbiased**, while dramatically dampening the variance of the gradient estimator!

#### The Advantage Function
The optimal baseline that minimizes variance is the **state value function**: $b(s) = U^{\pi_\theta}(s)$.
Subtracting the state value from the action value defines the **Advantage Function**:

$$A^{\pi_\theta}(s, a) = Q^{\pi_\theta}(s, a) - U^{\pi_\theta}(s)$$

- $A(s, a) > 0$: Action $a$ performs **better** than the average action in state $s$. Increase its probability.
- $A(s, a) < 0$: Action $a$ performs **worse** than the average action in state $s$. Decrease its probability.

---

## 10. Actor-Critic Architectures

While REINFORCE with a baseline reduces variance, it still requires full Monte Carlo rollouts to evaluate $G_t$.
**Actor-Critic methods** replace Monte Carlo rollouts with **one-step Temporal Difference bootstrapping**, enabling fully online, low-variance policy updates.

```
                              ACTOR-CRITIC CLOSED-LOOP ARCHITECTURE
                                                |
               +--------------------------------+--------------------------------+
               |                                                                 |
               v                                                                 v
        THE ACTOR: \pi_\theta(a | s)                                      THE CRITIC: \hat{U}_w(s)
        Parameterized Policy                                              Parameterized Value Function
        - Selects action a_t based on s_t                                 - Evaluates current state utility
        - Updates parameters \theta via policy gradient                   - Updates parameters w via TD learning
               |                                                                 |
               |                     Environment Step                            |
               +--------------------> (s_t, a_t, r_{t+1}, s_{t+1}) <-------------+
                                                |
                                                v
                                 CRITIC EVALUATES TD ERROR (ADVANTAGE):
                                 \delta_t = r_{t+1} + \gamma \hat{U}_w(s_{t+1}) - \hat{U}_w(s_t)
                                                |
                        +-----------------------+-----------------------+
                        |                                               |
                        v                                               v
        CRITIC UPDATE (Minimize TD Error):               ACTOR UPDATE (Ascend Advantage):
        w \leftarrow w + \beta * \delta_t * \nabla_w \hat{U}_w(s_t)     \theta \leftarrow \theta + \alpha * \delta_t * \nabla_\theta log \pi_\theta(a_t | s_t)
```

---

### 10.1 Deep-Dive: Is Vanilla Actor-Critic On-Policy or Off-Policy?

A critical theoretical question often asked by researchers is: *does Actor-Critic enter the Deadly Triad?*

The answer depends entirely on the specific architectural variant:

#### 1. Vanilla Actor-Critic (A2C, A3C, TRPO, PPO) is INHERENTLY ON-POLICY!
In standard Advantage Actor-Critic (A2C), A3C, or PPO:
- **Function Approximation (FA):** Present (neural networks parameterize both Actor and Critic).
- **Bootstrapping:** Present (the Critic uses 1-step TD or GAE to compute advantage $\delta_t = R + \gamma \hat{U}(s') - \hat{U}(s)$).
- **Policy Setting:** **STRICTLY ON-POLICY!**
- **Why is it On-Policy?**
  The trajectory data is collected directly by the current actor $\pi_\theta$. The agent collects a batch of transitions (e.g., 2,048 steps), updates the Actor and Critic immediately, and then **discards the data completely**! Transitions are never stored in a historical replay buffer.
- **The Theoretical Consequence:**
  Because the training data distribution strictly matches the stationary distribution of the policy being evaluated, **the third pillar (Off-Policy Learning) is absent!**
  Therefore, **Vanilla Actor-Critic does NOT enter the Deadly Triad**, and its Critic enjoys natural mathematical contraction and stability.

#### 2. Off-Policy Actor-Critic (DDPG, TD3, SAC) DOES Enter the Deadly Triad!
When researchers sought to improve sample efficiency by introducing an **Experience Replay Buffer** into Actor-Critic (such as in DDPG, TD3, and Soft Actor-Critic):
1. Deep Neural Networks $\implies$ **Function Approximation** (Present).
2. Replay Buffer containing millions of old transitions $\implies$ **Off-Policy Learning** (Present).
3. 1-Step TD Target $R + \gamma Q(s', a')$ $\implies$ **Bootstrapping** (Present).

Here, the Critic **fully enters the Deadly Triad**! Early implementations collapsed and diverged rapidly.
To make Off-Policy Actor-Critic viable, modern algorithms engineered three mandatory stabilization shields:
1. **Target Networks with Polyak Soft Averaging:**
   The Critic cannot bootstrap from its current weights. It must bootstrap from frozen target weights $\boldsymbol{\theta}^-$, updated at an ultra-slow crawl ($\tau = 0.005$): $\boldsymbol{\theta}^- \leftarrow \tau \boldsymbol{\theta} + (1 - \tau) \boldsymbol{\theta}^-$. This physically locks the moving target.
2. **Clipped Double-Q / Double Critic (TD3 & SAC):**
   To prevent positive feedback loops and overestimation, the algorithm maintains two independent Critics ($Q_1$ and $Q_2$) and forces the target to take the conservative minimum:
   $$\text{Target} = R + \gamma \min\left( Q_1(s', a'; \boldsymbol{\theta}_1^-), \, Q_2(s', a'; \boldsymbol{\theta}_2^-) \right)$$
3. **Entropy Regularization (SAC):**
   Soft Actor-Critic deducts policy entropy from the value objective, preventing Q-values from inflating uncontrollably during bootstrapping.

---

### 10.2 Spectrum of Actor-Critic Frameworks

1. **A2C (Advantage Actor-Critic):**
   A synchronous, deterministic coordinator that runs multiple parallel environment workers on a single multi-core machine, computing batched updates synchronously.
2. **A3C (Asynchronous Advantage Actor-Critic; Mnih et al., 2016):**
   Multiple CPU threads run independent environment simulations asynchronously, updating a shared central global model via asynchronous lock-free SGD.
3. **ACER (Actor-Critic with Experience Replay):**
   Combines off-policy experience replay with trust-region policy optimization and Retrace($\lambda$) multi-step return estimation.
4. **Soft Actor-Critic (SAC; Haarnoja et al., 2018):**
   An advanced off-policy Actor-Critic algorithm grounded in **Maximum Entropy Reinforcement Learning**:
   $$J(\pi) = \sum_{t=0}^\infty \mathbb{E}_{(s_t, a_t)} \left[ R(s_t, a_t) + \alpha \mathcal{H}(\pi(\cdot \mid s_t)) \right]$$
   - $\mathcal{H}(\pi) = -\sum_a \pi(a \mid s) \log \pi(a \mid s)$ is the policy entropy.
   - The agent is incentivized to maximize rewards while remaining **as random as possible**, preventing premature policy collapse, capturing multimodal solution paths, and establishing state-of-the-art sample efficiency in continuous robotic control.

---

## 11. Advanced Policy Search: TRPO and PPO

### 11.1 The Fragility of Vanilla Policy Gradients

Standard policy gradient algorithms update parameters along the steepest ascent direction: $\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} + \alpha \nabla_\theta J(\boldsymbol{\theta})$.
In deep neural networks, this approach is dangerously fragile:
- A small step in parameter space $\boldsymbol{\theta}$ can cause an **unpredictably massive shift in policy space** $\pi_\theta$.
- If an update inadvertently pushes the policy into a bad region, the agent collects terrible trajectory data.
- Unlike supervised learning (where the dataset is fixed), the RL agent's future training data is generated by its current policy. Once the policy collapses, it collects corrupt data, enters a death spiral, and **never recovers**.

---

### 11.2 Trust Region Policy Optimization (TRPO; Schulman et al., 2015)

To guarantee **monotonic policy improvement** ($J(\pi_{\text{new}}) \ge J(\pi_{\text{old}})$), Kakade and Langford (2002) proved that policy updates must be bounded in distribution space.
**TRPO** formalizes this by constraining the average **Kullback-Leibler (KL) divergence** between the old policy and the new policy:

$$\max_{\boldsymbol{\theta}} \hat{\mathbb{E}}_t \left[ \frac{\pi_\theta(a_t \mid s_t)}{\pi_{\theta_{\text{old}}}(a_t \mid s_t)} \hat{A}_t \right] \quad \text{subject to} \quad \hat{\mathbb{E}}_t \left[ D_{\text{KL}}\left(\pi_{\theta_{\text{old}}}(\cdot \mid s_t) \,\|\, \pi_\theta(\cdot \mid s_t)\right) \right] \le \delta$$

- **The Mathematical Speed Limit:** The KL constraint prevents the new policy $\pi_\theta$ from straying too far from $\pi_{\theta_{\text{old}}}$, guaranteeing stability.
- **The Computational Bottleneck:** Solving this constrained optimization requires computing the second-order **Fisher Information Matrix (FIM)** and solving linear systems via conjugate gradient methods, making TRPO computationally expensive and difficult to scale to complex neural networks.

---

### 11.3 Proximal Policy Optimization (PPO; Schulman et al., 2017)

**Proximal Policy Optimization (PPO)** achieves the theoretical stability of TRPO using a computationally simple, first-order optimization framework.

#### The Probability Ratio
Define the probability ratio of the current policy relative to the old behavioral policy:
$$r_t(\boldsymbol{\theta}) = \frac{\pi_\theta(a_t \mid s_t)}{\pi_{\theta_{\text{old}}}(a_t \mid s_t)}$$
- If $r_t(\boldsymbol{\theta}) = 1$, the policies are identical.
- If $r_t(\boldsymbol{\theta}) > 1$, action $a_t$ is more probable under the new policy.

#### The Clipped Surrogate Objective
Instead of enforcing a hard KL divergence constraint, PPO clips the probability ratio if it moves outside the trust interval $[1 - \epsilon, 1 + \epsilon]$ (typically $\epsilon = 0.2$):

$$\mathcal{L}^{CLIP}(\boldsymbol{\theta}) = \hat{\mathbb{E}}_t \left[ \min\left( r_t(\boldsymbol{\theta}) \hat{A}_t, \, \text{clip}\left( r_t(\boldsymbol{\theta}), 1 - \epsilon, 1 + \epsilon \right) \hat{A}_t \right) \right]$$

```
                       PPO CLIPPED OBJECTIVE DYNAMICS
                                      |
         +----------------------------+----------------------------+
         |                                                         |
         v                                                         v
   CASE 1: POSITIVE ADVANTAGE (\hat{A}_t > 0)               CASE 2: NEGATIVE ADVANTAGE (\hat{A}_t < 0)
   Action performed BETTER than expected                    Action performed WORSE than expected
         |                                                         |
   Objective = min(r_t * A_t, (1 + \epsilon) * A_t)         Objective = min(r_t * A_t, (1 - \epsilon) * A_t)
         |                                                         |
   - As r_t increases, objective grows                      - As r_t decreases, loss penalty shrinks
   - Once r_t > 1 + \epsilon, clipping flattens slope       - Once r_t < 1 - \epsilon, clipping flattens slope
   - Agent gets NO incentive to push policy further!        - Gradient halts, preventing destructive collapse!
```

#### Dissecting the Clipping Mechanics

1. **Positive Advantage ($\hat{A}_t > 0$):**
   - The chosen action was better than average. We want to increase its probability ($r_t > 1$).
   - The surrogate objective is $\min(r_t \hat{A}_t, (1 + \epsilon) \hat{A}_t)$.
   - Once $r_t(\boldsymbol{\theta})$ exceeds $1 + \epsilon$, the clipping function caps the value at $(1 + \epsilon) \hat{A}_t$.
   - **Result:** The gradient drops to zero! The policy is rewarded for making the good action more likely, but receives **no further incentive to push the update aggressively**, preventing policy destabilization.
2. **Negative Advantage ($\hat{A}_t < 0$):**
   - The chosen action was worse than average. We want to decrease its probability ($r_t < 1$).
   - The surrogate objective is $\min(r_t \hat{A}_t, (1 - \epsilon) \hat{A}_t)$.
   - Once $r_t(\boldsymbol{\theta})$ drops below $1 - \epsilon$, the clipping function caps the term at $(1 - \epsilon) \hat{A}_t$.
   - **Result:** The gradient stops penalizing the action, preventing catastrophic over-correction.

#### The PPO Clipping Dynamics: Visualizing the Surrogate Bounds

```
     When Advantage A_t > 0                          When Advantage A_t < 0
    L^CLIP                                          L^CLIP
      ^                                               ^
      |             .------------- (Clipped)          |          1 - \epsilon  1
      |            /                                  |               |        |
      |           /                                   |    0 ---------+--------+--------> r
      |          /                                    |               |              |         /                                     |               |         \  (Unclipped)
      |        /                                      |               |                +-------+-------+-------------> r               |               |                 0       1   1 + \epsilon                        |               .------------ (Clipped)
```

- **When $\hat{A}_t > 0$ (Action Better than Average):**
  The gradient encourages increasing the action probability ($r_t(\boldsymbol{\theta}) > 1$). However, if $r_t$ exceeds $1 + \epsilon$, the clipped term $(1 + \epsilon)\hat{A}_t$ becomes smaller than $r_t \hat{A}_t$. Taking the minimum $\min(\dots)$ clips the objective to a flat horizontal line, dropping the gradient to zero. The agent is prevented from making an excessively greedy update that destroys policy stability.
- **When $\hat{A}_t < 0$ (Action Worse than Average):**
  The gradient encourages decreasing the action probability ($r_t(\boldsymbol{\theta}) < 1$). If $r_t$ drops below $1 - \epsilon$, the clipped term $(1 - \epsilon)\hat{A}_t$ is less negative than $r_t \hat{A}_t$. The minimum operator clips the loss, halting further negative gradient pushes and preventing destructive policy collapse.

### 11.4 Modern Model-Free Reinforcement Learning: The Complete Taxonomy

To synthesize the historical and theoretical progression of model-free reinforcement learning:

| Theoretical Dimension | Core Algorithmic Idea | Foundational Key Algorithm |
| :--- | :--- | :--- |
| **Policy Gradient** | Directly optimize the stochastic policy $\pi_\theta(a \mid s)$ from sampled trajectory returns. | **REINFORCE (Williams, 1992)** |
| **Variance Reduction** | Learn a value baseline $\hat{U}(s, \mathbf{w})$ to stabilize policy gradient updates without bias. | **Actor-Critic (A2C / A3C)** |
| **Stable Improvement** | Constrain policy updates via KL divergence to guarantee monotonic improvement. | **TRPO (Schulman et al., 2015)** |
| **Practical Stability** | Simplify second-order trust-region constraints with first-order probability ratio clipping. | **PPO (Schulman et al., 2017)** |
| **Exploration & Robustness** | Regularize policy entropy and inject dense surrogate signals into sparse environments. | **Soft Actor-Critic (SAC), Reward Shaping** |


#### Modern Industrial Relevance
Taking the minimum $\min(\dots)$ forms a **pessimistic lower bound** on the surrogate objective.
Because PPO uses standard first-order gradients, it integrates seamlessly with the **Adam optimizer**. Today, PPO is the universal default workhorse across continuous robotic control, autonomous vehicle fleets, and **Reinforcement Learning from Human Feedback (RLHF)** for aligning Large Language Models (LLMs).

---

<reviewkit>
<takeaways>
- **The Curse of Dimensionality & Approximation:** Tabular RL fails in astronomical state spaces (Chess $10^{40}$, Go $10^{172}$). Function approximation compactly parameterizes utilities ($\hat{U}_\theta(s)$) and generalizes knowledge across unvisited regions.
- **The Widrow-Hoff (Delta) Rule:** Minimizing per-sample squared error via gradient descent yields the Delta Rule ($\Delta \theta_i = \alpha (u - \hat{U}_\theta) f_i$). Unlike naive batch gradient descent (which requires storing all historical data and calculating global sums), Widrow-Hoff performs instantaneous online updates on streaming transitions.
- **Semi-Gradient TD:** Differentiating temporal difference targets is destabilizing; semi-gradient methods freeze the bootstrapped target ($R + \gamma \hat{U}_\theta(s')$) during gradient calculation.
- **SARSA vs. Q-Learning:** SARSA is on-policy (bootstrapping on the behavioral action $a' \sim \pi$), making it safer during exploration (e.g., detour in Cliff Walking). Q-learning is off-policy (bootstrapping on $\max_{a'} Q$), enabling direct convergence to $Q^*$ and full compatibility with Experience Replay.
- **The Deadly Triad:** Function approximation, bootstrapping, and off-policy learning combined can cause unbounded parameter divergence (Baird's counterexample).
- **DQN Breakthroughs:** Deep Q-Networks stabilize deep reinforcement learning through (1) an Experience Replay buffer that breaks sample autocorrelation, and (2) a Fixed Target Network that eliminates moving target feedback oscillations.
- **DQN Extensions:** Double DQN eliminates maximization overestimation bias; Distributional RL (C51) models full return distributions; Prioritized Replay samples high TD-error transitions. However, DQN cannot handle continuous action spaces or learn stochastic policies.
- **The Policy Gradient Theorem:** Bypasses value discretization by directly parameterizing stochastic policies ($\pi_\theta(a \mid s)$). Proves that $\nabla_\theta J(\boldsymbol{\theta}) = \mathbb{E}[Q(s, a) \nabla_\theta \log \pi_\theta(a \mid s)]$, requiring zero knowledge of environmental transition dynamics.
- **Baseline Variance Reduction:** Subtracting an action-independent state baseline $b(s)$ leaves the policy gradient strictly unbiased ($\mathbb{E}[b(s) \nabla \log \pi] = 0$) while dramatically shrinking variance. Setting $b(s) = U(s)$ yields the Advantage Function $A(s, a) = Q(s, a) - U(s)$.
- **Actor-Critic Dualism:** Combines a parameterized policy (Actor) with a 1-step TD value estimator (Critic), enabling online updates. Modern algorithms like Soft Actor-Critic (SAC) maximize reward and policy entropy for robust exploration in continuous robotics.
- **PPO & Trust Regions:** TRPO enforces a second-order KL divergence speed limit to guarantee monotonic improvement. Proximal Policy Optimization (PPO) simplifies this via a first-order Clipped Surrogate Objective, establishing the industry standard for continuous control and LLM post-training alignment (RLHF).
</takeaways>

<qquiz src="questions.en.json"/>

<qprompt/>
</reviewkit>

## References

1. Mnih, V., Kavukcuoglu, K., Silver, D., Rusu, A. A., Veness, J., Bellemare, M. G., ... & Hassabis, D. (2015). Human-level control through deep reinforcement learning. *Nature*, 518(7540), 529-533.
2. Sutton, R. S., McAllester, D., Singh, S., & Mansour, Y. (1999). Policy gradient methods for reinforcement learning with function approximation. *Advances in Neural Information Processing Systems (NeurIPS 1999)*, 12.
3. Williams, R. J. (1992). Simple statistical gradient-following algorithms for connectionist reinforcement learning. *Machine Learning*, 8(3-4), 229-256.
4. Schulman, J., Levine, S., Abbeel, P., Jordan, M., & Moritz, P. (2015). Trust region policy optimization. In *International Conference on Machine Learning (ICML 2015)* (pp. 1889-1897).
5. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). Proximal policy optimization algorithms. *arXiv preprint arXiv:1707.06347*.
6. Van Hasselt, H., Guez, A., & Silver, D. (2016). Deep reinforcement learning with double Q-learning. In *Proceedings of the AAAI Conference on Artificial Intelligence* (Vol. 30, No. 1).
7. Schaul, T., Quan, J., Antonoglou, I., & Silver, D. (2016). Prioritized experience replay. In *International Conference on Learning Representations (ICLR 2016)*.
8. Haarnoja, T., Zhou, A., Abbeel, P., & Levine, S. (2018). Soft actor-critic: Off-policy maximum entropy deep reinforcement learning with a stochastic actor. In *International Conference on Machine Learning (ICML 2018)* (pp. 1861-1870).
9. Baird, L. (1995). Residual algorithms: Reinforcement learning with function approximation. In *Machine Learning Proceedings 1995* (pp. 30-37). Morgan Kaufmann.
10. Widrow, B., & Hoff, M. E. (1960). Adaptive switching circuits. In *1960 IRE WESCON Convention Record, part 4* (Vol. 4, pp. 96-104).
11. Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press.
12. [AlphaGo] Silver, D., Huang, A., Maddison, C. J., Guez, A., Sifre, L., Van Den Driessche, G., ... & Hassabis, D. (2016). Mastering the game of Go with deep neural networks and tree search. *Nature*, 529(7587), 484-489.
13. [AlphaGo Zero] Silver, D., Schrittwieser, J., Simonyan, K., Antonoglou, I., Huang, A., Guez, A., ... & Hassabis, D. (2017). Mastering the game of Go without human knowledge. *Nature*, 550(7676), 354-359.
14. [MuZero] Schrittwieser, J., Antonoglou, I., Hubert, T., Simonyan, K., Sifre, L., Schmitt, S., ... & Silver, D. (2020). Mastering Atari, Go, chess and shogi by planning with a learned model. *Nature*, 588(7839), 604-609.
15. Silver, D. (2015). *Lectures on Reinforcement Learning*. University College London (UCL).
16. Gopalan, A., & Teo, Y. M. (2025). *CS4246/5446 Reinforcement Learning and Sequential Decision Making (Version 5.0)*. National University of Singapore (NUS).


# Week 6 - Reward Shaping for Reinforcement Learning and Its Applications: Exploration Bonuses, Potential-Based Policy Invariance, LLM Alignment, and Advanced Multi-Agent Reward Architectures

<draft>
- 1. Foundations of Sequential Decisions & The MDP Formalism (Guest Lecture Review)
    - Lecture Context: National University of Singapore Guest Lecture by Ma Haozhe on "Reward Shaping for Reinforcement Learning and Its Applications".
    - Formal MDP Tuple: State space S, Action space A, Transition dynamics T: P(s' | s, a), Reward function R(s, a, s'), Discount factor \gamma \in [0, 1).
    - Gridworld Running Example: Coordinates S = {(1, 1), ..., (4, 3)}, discrete actions A = {\leftarrow, \rightarrow, \uparrow, \downarrow}, goal rewards R(4, 3) = +1, hazard R(4, 2) = -1, default step cost 0.
    - Policies, State Values, and Action Values:
        - Stochastic policy \pi(a | s) = Pr(A_t = a | S_t = s).
        - State-value function: V^\pi(s_\tau) = E_\pi [ \sum_{k=0}^\infty \gamma^k R(s_{\tau+k}) ].
        - Action-value function: Q(s, a) = R(s, a) + \gamma \sum_{s'} P(s' | s, a) V(s').
        - Optimal policy extraction: \pi^*(s) = \arg\max_a Q^*(s, a).
    - Representation Hierarchy of the Q-Function:
        - Tabular Q-learning: Discrete memory lookup table \hat{Q}(s, a).
        - Function Approximation Q-learning: Linear / non-linear parameterization \hat{Q}_\theta(s, a).
        - Deep Q-Networks (DQN): End-to-end convolutional and fully connected representations (4 stacked frames 84x84x4, Conv 16 8x8 stride 4, Conv 32 4x4 stride 2, FC 256, linear Q heads).
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
- 3. Reward Shaping: Principles, Mechanics, and the General Additive Formulation
    - Core Concept: Reshaping or rebuilding the native reward model into an informative, dense feedback structure.
    - General Additive Formulation: R^{new}(\cdot) = \alpha R^{env}(\cdot) + \beta R^{sha}(\cdot).
    - Conceptual Transition: Transforming sparse binary rewards (key = 0, door = 0, goal = 1) into dense milestone incentives (key = 0.5, door = 0.8, goal = 1.0).
    - The Central Open Challenge: How to accurately define, learn, and maintain R^{sha}(\cdot) without inducing unintended policy corruption.
- 4. Reward Shaping for Exploration: Novelty and Intrinsic Motivation
    - Philosophy: Assigning supplemental exploration bonuses to historically under-explored or novel states.
    - Method 1 (Tabular Count-Based Exploration): R^{count}(s) = \alpha R^{env}(s) + \frac{\beta}{N(s) + 1}; +1 prevents division by zero.
    - Method 2 (Continuous Pseudo-Counts via Density Models; Bellemare et al., NeurIPS 2016): Generative density models \rho(s) estimating pseudo-counts \hat{N}(s) in continuous domains R^d.
    - Method 3 (High-Dimensional Random Network Distillation; Burda et al., 2018):
        - Predictor network \hat{f}_\theta(s) vs. randomly initialized, permanently frozen Target network f(s).
        - Exploration bonus: R^{RND}(s) = \alpha R^{env}(s) + \beta ||f(s) - \hat{f}_\theta(s)||_2^2.
    - The Fundamental Exploration Hazard: The Noisy-TV Problem (OpenAI Blog):
        - Unpredictable environmental noise (e.g., a TV displaying random static in a maze) yields perpetually high prediction errors.
        - The agent becomes hypnotized by irrelevant novelty, collecting infinite intrinsic rewards while abandoning the true environmental task.
- 5. Reward Shaping for Exploitation: Subgoal Bottlenecks and Process Supervision
    - Philosophy: Rewarding progress through structurally critical bottleneck states and optimal execution paths.
    - Method 1 (Graph Clustering & Topological Bottlenecks): Identifying narrow doorways connecting maze regions; vulnerability to start-state frequency false positives.
    - Method 2 (Tree-Like Search Rollouts): Branching forward simulations from prefix states to estimate path success probability; computational cost bottlenecks.
    - Real-World LLM Case Study: Math-Shepherd (Wang et al., ACL 2024):
        - Process-supervised reward modeling for mathematical reasoning without human step annotations.
        - Evaluating step-by-step process outcomes y_{s_i} across sequential reasoning steps s_i via automated search rollouts.
- 6. The Invariance Dilemma: Potential-Based Reward Shaping (PBRS)
    - The Risk of Reward Gaming: Arbitrary reward bonuses alter optimal policy equilibria, encouraging unintended cyclic behaviors.
    - Potential-Based Formulation (Ng, Harada, & Russell, ICML 1999): R^{sha}(s, s') = \gamma \phi(s') - \phi(s) (or \phi(s) - \gamma \phi(s')).
    - The Telescoping Sum Proof of Policy Invariance:
        - Demonstrating that intermediate potential terms \gamma^k \phi(s_k) sequentially cancel out along trajectory rollouts: G_t^{sha} = \phi(s) - \lim_{T \to \infty} \gamma^T \phi(s_T).
        - Theoretical Guarantee: The optimal policy \pi^* under the shaped reward MDP is strictly identical to the optimal policy under the original environment MDP.
    - Empirical Realities: Heuristic shaping methods lack theoretical invariance guarantees, relying on empirical sample efficiency validation.
- 7. Reward Modeling for Open-Ended Environments: Reinforcement Learning from Human Feedback (RLHF)
    - The Open-Ended Challenge: Subjective text generation (LinkedIn headlines, creative writing) lacks native programmatic rewards.
    - RLHF Framework (Christiano et al., NeurIPS 2017; Ouyang et al., NeurIPS 2022):
        1. Prompt x generates N candidate responses via Supervised Fine-Tuned (SFT) model.
        2. Human annotators rank outputs: res_1 > res_2 > ... > res_N.
        3. Reward Model Architecture: LLM backbone with a linear scalar regression head r_\theta(x, y) \in R.
        4. Bradley-Terry Preference Loss: L_{RM}(\theta) = - E_{(x, y_+, y_-)} [ \log \sigma( r_\theta(x, y_+) - r_\theta(x, y_-) ) ].
        5. Policy Alignment via PPO with KL divergence constraints against the reference policy.
- 8. Advanced Multi-Agent & Adaptive Reward Shaping Architectures
    - Framework 1: ReLara — RL with an Assistant Reward Agent (Ma et al., ICML 2024):
        - Policy Agent (A_P): Interacts with the environment via Actor \pi_\theta and Critic Q_\phi, receiving composite reward r_{E_t} + \lambda r_{S_t}.
        - Assistant Reward Agent (A_R): Treats reward generation as a secondary decision problem using Actor \pi_\zeta: S x A -> R and Critic Q_\eta(s, r_P).
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

In this guest lecture presented at the **National University of Singapore (NUS)** by **Dr. Ma Haozhe**, the curriculum advances into **Reward Shaping for Reinforcement Learning and Its Advanced Applications**.

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
+---------------------------------------------------------------------------------------+
```

### 1.1 Formal MDP Components

The interaction loop is governed mathematically by a **Markov Decision Process (MDP)** defined by the 5-tuple $\langle \mathcal{S}, \mathcal{A}, \mathcal{T}, \mathcal{R}, \gamma \rangle$:
1. **State Space ($\mathcal{S}$):** The set of all possible physical or informational configurations of the environment.
   - *Example (Robot Grid Navigation):* The coordinate space $\mathcal{S} = \{(1, 1), (1, 2), \dots, (4, 3)\}$.
2. **Action Space ($\mathcal{A}$):** The set of all executable operations available to the agent.
   - *Example:* Directional navigation $\mathcal{A} = \{\leftarrow, \rightarrow, \uparrow, \downarrow\}$.
3. **Transition Dynamics ($\mathcal{T}$):** The probability distribution over successor states given the current state and chosen action:
   $$\mathcal{T}(s' \mid s, a) = P(S_{t+1} = s' \mid S_t = s, A_t = a)$$
   Transitions can be **deterministic** (the chosen action always succeeds) or **stochastic** (e.g., slippery grid tiles causing unintended orthogonal drifts).
4. **Reward Function ($\mathcal{R}$):** A scalar feedback mapping providing real-time evaluation:
   $$\mathcal{R}: \mathcal{S} \times \mathcal{A} \times \mathcal{S} \to \mathbb{R}$$
   - *Example:* Goal state $R(4, 3) = +1$, hazard pit $R(4, 2) = -1$, and default step cost $R(s) = 0$ across all other tiles.
5. **Discount Factor ($\gamma \in [0, 1)$):** A geometric scalar prioritizing immediate rewards over distant future returns, mathematically ensuring that infinite-horizon returns remain bounded.

---

### 1.2 Policies, State Values, and Action Values

- **The Policy ($\pi$):** A mapping from states to a probability distribution over actions:
  $$\pi: \mathcal{S} \to \mathcal{P}(\mathcal{A}), \quad \pi(a \mid s) = \Pr(A_t = a \mid S_t = s)$$
- **The State-Value Function ($V^\pi(s)$):** The expected cumulative discounted return starting from state $s$ under policy $\pi$:
  $$V^\pi(s_\tau) = \mathbb{E}_\pi \left[ R(s_\tau) + \gamma R(s_{\tau+1}) + \gamma^2 R(s_{\tau+2}) + \dots \right] = \mathbb{E}_\pi \left[ \sum_{k=0}^\infty \gamma^k R(s_{\tau+k}) \right]$$
- **The Action-Value Function ($Q(s, a)$):** The expected cumulative discounted return of starting in state $s$, being forced to execute action $a$, and following policy $\pi$ thereafter:
  $$Q(s, a) = R(s, a) + \gamma \sum_{s' \in \mathcal{S}} P(s' \mid s, a) V(s')$$
- **The Ultimate Reinforcement Learning Objective:** Discover an optimal policy $\pi^*(s)$ that maximizes the expected action-value across every state:
  $$\pi^*(s) = \arg\max_{a \in \mathcal{A}} Q^*(s, a)$$

---

### 1.3 Representation Hierarchy of the Q-Function

How the action-value function is modeled determines the architectural scalability of the algorithm:
1. **Tabular Q-Learning:** When $|\mathcal{S}|$ and $|\mathcal{A}|$ are small, $\hat{Q}(s, a)$ is stored as an exact 2D lookup table.
2. **Function Approximation Q-Learning:** When state spaces grow large, $\hat{Q}_\theta(s, a)$ is parameterized as a linear combination of basis features or a shallow non-linear function.
3. **Deep Q-Networks (DQN):** When processing high-dimensional perceptual inputs (e.g., video frames), $\hat{Q}_\theta(s, a)$ is approximated by a deep convolutional neural network.

```
+---------------------------------------------------------------------------------------------------+
|                                  DQN CONVOLUTIONAL PIPELINE                                       |
|                                                                                                   |
|  Stack of 4 Frames       Conv Layer 1             Conv Layer 2            FC Hidden Layer   Output|
|  (84 x 84 x 4)     --->  16 filters, 8x8    --->  32 filters, 4x4   --->  256 units   --->  Q(s,a)|
|                          stride 4, ReLU           stride 2, ReLU          ReLU              |A| = 4
+---------------------------------------------------------------------------------------------------+
```

---

### 1.4 Training Targets Taxonomy

To train parameterized estimators $\hat{Q}_\theta(s, a) \to Q^*(s, a)$, algorithms construct different supervisory regression targets $y_t$:
- **Monte Carlo Target ($y_t^{\text{MC}}$):** Accumulates all actual empirical rewards across a full trajectory:
  $$y_t^{\text{MC}} = G_t = r_t + \gamma r_{t+1} + \gamma^2 r_{t+2} + \dots$$
- **SARSA Target ($y_t^{\text{SARSA}}$ - On-Policy TD):** Bootstraps from the value of the action $a_{t+1}$ actually executed by the behavioral policy in the next state:
  $$y_t^{\text{SARSA}} = r_t + \gamma \hat{Q}(s_{t+1}, a_{t+1})$$
- **Q-Learning Target ($y_t^{\text{Q-Learning}}$ - Off-Policy TD):** Bootstraps from the hypothetical optimal greedy action in the next state:
  $$y_t^{\text{Q-Learning}} = r_t + \gamma \max_{a' \in \mathcal{A}} \hat{Q}(s_{t+1}, a')$$

---

### 1.5 Resolving Continuous Action Spaces: The Actor-Critic Split

In discrete action environments, extracting the greedy action is trivial: the network evaluates $|A|$ forward heads and computes an explicit $\arg\max$.
However, in **continuous or unlimited action spaces** (e.g., joint torques $\mathcal{A} \subset \mathbb{R}^d$):
- A lookup table or multi-head network cannot physically enumerate infinitely many continuous actions to compute $\arg\max_a Q(s, a)$.
- **The Critic Solution:** The network inputs **both the state $s$ and continuous candidate action $a$**, outputting a single scalar evaluation $Q_\theta(s, a)$.
- **The Actor Solution:** Because computing $\arg\max_a Q_\theta(s, a)$ via numerical optimization at every step is computationally intractable, an independent **Actor network $\pi_\phi(s)$** is trained concurrently to directly approximate the argmax:
  $$\pi_\phi(s) \approx \arg\max_{a'} Q_\theta(s, a')$$

---

## 2. The Pathology of Native Reward Models: Sparsity, Delay, and Sample Inefficiency

In textbook reinforcement learning, the environment reward $R(s, a, s')$ is treated as an immutable ground-truth signal. However, in real-world applications, **native environment reward models present an enormous operational obstacle**.

```
Native Environmental Rewards are typically:
[1] Sparse:          Non-zero rewards occur only at task completion or major milestones.
[2] Delayed:         Feedback is received hundreds or thousands of steps after critical actions.
[3] Non-Informative: Intermediate in-process transitions yield static 0 rewards.
```

```
A Typical Sparse Trajectory:
s_0 ----(a_0)----> s_1 ----(a_1)----> s_2 ----(a_2)----> s_3 ---- ... ----> s_T (Goal)
R(s_0) = 0        R(s_1) = 0         R(s_2) = 0        R(s_3) = 0           R(s_T) = +1
```

### 2.1 The "Empty Bellman Update" Phenomenon

Consider an agent attempting to navigate a complex labyrinth under native sparse rewards:
- If the agent wanders for 100 steps and fails to hit the exit, every single transition produces $r_t = 0$.
- **Monte Carlo Target:** $y_t^{\text{MC}} = 0 + \gamma(0) + \gamma^2(0) + \dots = 0$.
- **Q-Learning Target:** $y_t^{\text{Q-Learning}} = 0 + \gamma \max_{a'} \hat{Q}(s_{t+1}, a')$.
- If the network parameters are initialized to zero ($Q \equiv 0$):
  $$y_t = 0 + \gamma(0) = 0 \implies Q(s_t, a_t) \leftarrow 0$$
- **The Stagnation Result:** The neural network executes thousands of gradient steps **updating zero with zero**! Absolutely zero learning progress occurs.

---

### 2.2 The Sample Efficiency Crisis

A standard reinforcement learning algorithm **only begins to learn after randomly stumbling upon a rare successful episode yielding non-zero reward**.
Even after stumbling upon a successful terminal state after 20 steps, geometric discounting heavily dampens the signal:
$$y_0^{\text{MC}} = 0 + \gamma(0) + \dots + \gamma^{20}(1) \approx 0.12 \quad (\text{for } \gamma = 0.9)$$
Propagating this microscopic signal backward across high-dimensional state spaces requires astronomical sample complexity, rendering native RL intractable for industrial robotics, chip design, and long-horizon language reasoning.

---

## 3. Reward Shaping: Principles and The General Formulation

To overcome the paralysis of sparse feedback, **Reward Shaping (RS)** transforms or rebuilds the sparse native reward model into a dense, highly informative reward landscape.

```
+---------------------------------------------------------------------------------------+
|                               REWARD SHAPING TRANSFORMATION                           |
|                                                                                       |
|   Sparse Environment Feedback:                                                        |
|   [Start] ---> [ ] ---> [Key: R=0] ---> [ ] ---> [Door: R=0] ---> [ ] ---> [Goal: R=1]|
|                                  |                                                    |
|                                  v   Reward Shaping Transformation                    |
|   Dense Shaped Feedback:                                                              |
|   [Start] -> [0.1] -> [Key: R=0.5] -> [0.2] -> [Door: R=0.8] -> [0.3] -> [Goal: R=1] |
+---------------------------------------------------------------------------------------+
```

### 3.1 The General Additive Formulation

The standard mathematical formulation for applying a shaped reward is:

$$R^{\text{new}}(\cdot) = \alpha R^{\text{env}}(\cdot) + \beta R^{\text{sha}}(\cdot)$$

- $R^{\text{env}}(\cdot)$: The original sparse environmental reward signal.
- $R^{\text{sha}}(\cdot)$: The auxiliary shaping reward engineered to incentivize desirable intermediate behaviors.
- $\alpha, \beta > 0$: Scaling hyperparameters balancing native task fidelity against shaping guidance.

By restructuring the reward surface, algorithm designers exert **explicit control over the agent's behavioral tendencies**, drastically accelerating learning curves.
- **The Core Research Challenge:** *How can algorithm designers systematically define, learn, and maintain the shaping signal $R^{\text{sha}}(\cdot)$ across complex environments?*

---

## 4. Reward Shaping for Exploration: Novelty and Intrinsic Motivation

The first major application of reward shaping is **exploration**: providing supplemental intrinsic rewards to incentivize the agent to visit historically under-explored, novel regions of the state space.

```
+---------------------------------------------------------------------------------------+
|                               EXPLORATION REWARD BONUS                                |
|                                                                                       |
|   Explored States (High Visit Frequency):       Under-Explored States (Novel Regions):|
|   Assign LOW or ZERO shaping bonus              Assign HIGH positive exploration bonus|
|   N(s) is large \implies R^{sha}(s) \approx 0   N(s) is small \implies R^{sha}(s) >> 0|
+---------------------------------------------------------------------------------------+
```

### 4.1 Method 1: Count-Based Exploration in Tabular Environments

In finite discrete domains, novelty can be tracked directly using empirical state visitation counters $N(s)$:

$$R^{\text{count}}(\cdot) = \alpha R^{\text{env}}(\cdot) + \frac{\beta}{N(s) + 1}$$

- Adding $+1$ to the denominator prevents division by zero when a state is encountered for the first time ($N(s) = 0$).
- As an agent repeatedly traverses a state, $N(s) \to \infty$, causing the exploration bonus to vanish smoothly: $\frac{\beta}{N(s) + 1} \to 0$.

---

### 4.2 Method 2: Continuous State Spaces & Pseudo-Counts (Bellemare et al., 2016)

In continuous control domains $\mathcal{S} \subset \mathbb{R}^d$, the probability of visiting the exact same real-valued state coordinate twice is zero ($N(s) \le 1$).
To resolve this, **Bellemare et al. (NeurIPS 2016)** formulated the concept of **Pseudo-Counts** derived from statistical generative density models $\rho(s)$:

$$R^{\text{pseudo-count}}(\cdot) = \alpha R^{\text{env}}(\cdot) + \frac{\beta}{\hat{N}(s) + 1}$$

- The density model estimates the localized spatial density of past visits near state $s$.
- The pseudo-count $\hat{N}(s)$ reflects how many historical visits occurred in the local continuous neighborhood.

---

### 4.3 Method 3: Random Network Distillation (RND; Burda et al., 2018)

When state inputs consist of high-dimensional sensory observations (e.g., raw pixel video frames in Atari games like *Montezuma's Revenge*), fitting an accurate statistical density model is computationally intractable.
**Burda et al. (2018)** introduced **Random Network Distillation (RND)**:

```
                            RANDOM NETWORK DISTILLATION (RND)
                                            |
                         +------------------+------------------+
                         |                                     |
                         v                                     v
             TARGET NETWORK: f(s)                   PREDICTOR NETWORK: \hat{f}_\theta(s)
             - Randomly initialized weights         - Randomly initialized weights \theta
             - PERMANENTLY FROZEN                   - TRAINED CONTINUOUSLY via SGD
                         |                                     |
                         +------------------+------------------+
                                            |
                                            v
                                 PREDICTION ERROR (L2 NORM):
                                 || f(s) - \hat{f}_\theta(s) ||^2
                                            |
                         +------------------+------------------+
                         |                                     |
                         v                                     v
             FREQUENTLY VISITED STATE:                 NOVEL / UNSEEN STATE:
             Predictor has fitted f(s)                 Predictor has never seen state s
             Error is NEAR ZERO                        Error is EXTREMELY HIGH
             Exploration Bonus \approx 0               Exploration Bonus IS MASSIVE!
```

The mathematical formulation for the RND shaped reward is:

$$R^{\text{RND}}(\cdot) = \alpha R^{\text{env}}(\cdot) + \beta \| f(s) - \hat{f}_\theta(s) \|_2^2$$

- Because the Target Network $f(s)$ is fixed, it represents a static mathematical function.
- The Predictor Network $\hat{f}_\theta(s)$ minimizes the MSE loss $\| f(s) - \hat{f}_\theta(s) \|_2^2$ on observed transitions.
- High prediction error directly indicates that the state has rarely been processed by the optimizer, generating a powerful intrinsic exploration reward.

---

### 4.4 The Fundamental Exploration Hazard: The Noisy-TV Problem

A critical theoretical and practical limitation of prediction-error exploration is the **Noisy-TV Problem** (documented by OpenAI):

```
+---------------------------------------------------------------------------------------+
|                                 THE NOISY-TV PROBLEM                                  |
|                                                                                       |
|   Maze Environment                                                                    |
|   +---------------------------------------+                                           |
|   | Start                   Goal (+1)     |    A TV in the corner displays            |
|   |   S                        G          |    random, unpredictable static channels! |
|   |                                       |                                           |
|   |            [ NOISY TV ]               |    Because white noise is UNPREDICTABLE,  |
|   |            Channel 1 -> Channel 2     |    || f(s) - \hat{f}_\theta(s) ||^2 is    |
|   |            Channel 3 -> Channel 4     |    PERMANENTLY MASSIVE!                   |
|   |                                       |                                           |
|   |   The agent becomes HYPNOTIZED by the |    The agent never reaches the goal G,    |
|   |   TV, staring at it forever to harvest|    as novelty fails to align with the     |
|   |   infinite exploration rewards!       |    true objective.                        |
|   +---------------------------------------+                                           |
+---------------------------------------------------------------------------------------+
```

Because purely stochastic white noise cannot be learned by any neural network, the prediction error $\| f(s) - \hat{f}_\theta(s) \|^2$ remains perpetually maximal. The agent concludes that the noisy TV is the most interesting thing in the universe, completely abandoning the environmental task.

---

## 5. Reward Shaping for Exploitation: Subgoal Bottlenecks and Process Supervision

Reward shaping can also accelerate **exploitation (optimization)** by rewarding progress toward structurally critical milestone states.

### 5.1 Method 1: Graph Topologies & Historical State Clustering

- **Mechanism:** Construct an empirical transition graph from historical trajectories to identify topological **bottleneck states** (e.g., narrow doorways connecting distinct rooms).
- Assign supplemental positive rewards to passing through these critical bottleneck doorways.
- **The Fundamental Flaw:** States immediately adjacent to the start position $s_0$ are visited by almost all paths regardless of competence. Frequency-based clustering produces massive **false positives**, mistaking initial states for structural bottlenecks.

---

### 5.2 Method 2: Tree-Like Search Rollouts

- **Mechanism:** From specific prefix states, execute forward Monte Carlo simulation rollouts to evaluate the empirical completion rate of different branches.
- **Limitation:** Simulating branching forward lookaheads in real-time is computationally prohibitive for complex environments.

---

### 5.3 Case Study: Process Reward Models in LLMs (Math-Shepherd; Wang et al., ACL 2024)

In multi-step mathematical reasoning with Large Language Models (LLMs), outcome-based rewards (verifying only whether the final numerical answer is correct) provide sparse feedback. An LLM may arrive at the correct answer through flawed logic, or fail a complex 10-step derivation due to a minor arithmetic error on the final line.

```
+---------------------------------------------------------------------------------------+
|                       MATH-SHEPHERD: PROCESS REWARD MODELING                          |
|                                                                                       |
|   Problem Formulation: Let p(x) be a monic polynomial of degree 4...                  |
|                                                                                       |
|   (a) Outcome Annotation:                                                             |
|       Step s_1 -> Step s_2 -> Step s_3 -> Answer: 20 [X]  ===> Outcome Reward: y_S = 0|
|       (Sparse feedback penalizes the ENTIRE derivation, even if steps 1-3 were sound!)|
|                                                                                       |
|   (b) Math-Shepherd Process Annotation via Tree Rollouts:                             |
|       Step s_1 (Sound derivation)  ===> Rollouts succeed 2/3 times ===> Reward: 2/3   |
|       Step s_2 (Sound derivation)  ===> Rollouts succeed 2/3 times ===> Reward: 2/3   |
|       Step s_3 (Algebraic mistake) ===> Rollouts succeed 0/3 times ===> Reward: 0     |
+---------------------------------------------------------------------------------------+
```

**Math-Shepherd (Wang et al., ACL 2024)** automates process supervision without human step-by-step labels:
- From each intermediate reasoning step $s_i$, the system generates $K$ independent completion rollouts.
- The step reward $y_{s_i}$ equals the fraction of rollouts that successfully reach the correct golden answer.
- This creates dense, step-level shaping rewards that guide the policy model to reason soundly at every stage of the derivation.

---

## 6. The Invariance Dilemma: Potential-Based Reward Shaping (PBRS)

When algorithm designers introduce arbitrary shaping bonuses $R^{\text{sha}}$, a dangerous theoretical question emerges:
> *"Does the newly learned optimal policy $\pi^*_{\text{shaped}}$ remain strictly identical to the original environmental optimal policy $\pi^*_{\text{orig}}$?"*

### 6.1 The Peril of Reward Gaming (Shortcuts and Loops)

If reward shaping is constructed naively, the agent frequently exploits **unintended loopholes**:
- *Example (Bicycle Balancing):* If an agent is given a positive reward bonus for leaning back toward vertical, it learns to tilt violently back and forth in place to collect infinite balance rewards, rather than riding forward!
- *Example (Maze Navigation):* If an agent is rewarded for picking up a key, it may pick up the key, drop it, and pick it up repeatedly in an infinite loop.

---

### 6.2 Potential-Based Reward Shaping (Ng, Harada, & Russell, ICML 1999)

In their seminal paper, **Andrew Ng, Daishi Harada, and Stuart Russell (ICML 1999)** proved that structuring the shaping reward as a **discounted difference of a potential function** guarantees that the optimal policy remains completely unchanged.

> **Theorem (Policy Invariance under Potential-Based Reward Shaping):**
> Let $\phi: \mathcal{S} \to \mathbb{R}$ be any real-valued potential function defined over states. If the shaping reward is defined strictly as:
>
> $$R^{\text{sha}}(s, s') = \gamma \phi(s') - \phi(s) \quad \left(\text{or equivalently: } \phi(s) - \gamma \phi(s')\right)$$
>
> then every optimal policy $\pi^*$ in the shaped MDP is guaranteed to be an optimal policy in the original MDP, and vice versa.

#### The Telescoping Sum Proof
To understand why the optimal policy is preserved, evaluate the cumulative discounted return of the shaping rewards along any state trajectory $(s_0, s_1, s_2, \dots)$:

$$G_t^{\text{sha}} = R^{\text{sha}}(s_0, s_1) + \gamma R^{\text{sha}}(s_1, s_2) + \gamma^2 R^{\text{sha}}(s_2, s_3) + \dots$$

Substitute the potential difference formulation $R^{\text{sha}}(s, s') = \phi(s) - \gamma \phi(s')$:
$$\begin{aligned}
G_t^{\text{sha}} &= \Big( \phi(s_0) - \gamma \phi(s_1) \Big) + \gamma \Big( \phi(s_1) - \gamma \phi(s_2) \Big) + \gamma^2 \Big( \phi(s_2) - \gamma \phi(s_3) \Big) + \dots \\
&= \phi(s_0) - \gamma \phi(s_1) + \gamma \phi(s_1) - \gamma^2 \phi(s_2) + \gamma^2 \phi(s_2) - \gamma^3 \phi(s_3) + \dots
\end{aligned}$$

Notice that all intermediate terms **telescopically cancel out**:
$$G_t^{\text{sha}} = \phi(s_0) - \lim_{T \to \infty} \gamma^T \phi(s_T)$$

For discounted infinite-horizon tasks ($\gamma < 1$) where potentials are bounded, $\lim_{T \to \infty} \gamma^T \phi(s_T) = 0$.
Therefore:
$$G_t^{\text{sha}} = \phi(s_0)$$
- **The Mathematical Beauty:** The total return of the shaping rewards depends **solely on the starting state $s_0$** and is completely independent of the path taken!
- Because the total added reward is a path-independent constant, no action choice can increase or decrease it.
- Consequently, the relative ranking of all policies remains completely unaltered: $\arg\max_\pi V^{\pi}_{\text{shaped}}(s) = \arg\max_\pi V^\pi_{\text{orig}}(s)$.

> **Empirical Caveat:**
> Outside of strict potential-based formulations, modern heuristic shaping methods (e.g., RND, count bonuses, neural heuristics) **do NOT provide theoretical policy invariance guarantees**. In practice, they are justified and evaluated entirely empirically by demonstrating accelerated sample efficiency.

---

## 7. Reward Modeling for Open-Ended Environments: Reinforcement Learning from Human Feedback (RLHF)

In the era of Large Language Models (LLMs), reinforcement learning (specifically **Proximal Policy Optimization / PPO**) serves as the foundational post-training alignment mechanism.

### 7.1 The Open-Ended Challenge

When users submit open-ended generative prompts:
- *"Draft a creative LinkedIn headline for a data scientist transitioning into product management."*
- *"Suggest five catchy names for a specialty coffee shop next to a university campus."*

There is **no programmatic ground truth, no binary compiler check, and zero native environmental rewards**.
To apply reinforcement learning to subjective human communication, we must **learn a reward model from human preferences**.

---

### 7.2 The RLHF Pipeline (Christiano et al., 2017; Ouyang et al., 2022)

```
+---------------------------------------------------------------------------------------+
|                                    THE RLHF PIPELINE                                  |
|                                                                                       |
|   Step 1: Sampling Candidate Outputs                                                  |
|   Prompt x ----> SFT Language Model ----> N Distinct Responses: {res_1, ..., res_N}   |
|                                                                                       |
|   Step 2: Human Preference Ranking                                                    |
|   Human Annotators rank responses: res_1 > res_2 > ... > res_N                        |
|                                                                                       |
|   Step 3: Constructing the Reward Model Architecture                                  |
|   Base LLM (identical scale to SFT) + Linear Regression Head ----> Output r_\theta(x, y) \in R|
|                                                                                       |
|   Step 4: Training via the Bradley-Terry Logistic Preference Loss                     |
|   L_{RM}(\theta) = - E_{(x, y_+, y_-)} [ \log \sigma( r_\theta(x, y_+) - r_\theta(x, y_-) ) ]|
+---------------------------------------------------------------------------------------+
```

#### The Bradley-Terry Preference Loss
For every pair where response $y_+$ is preferred over response $y_-$ ($y_+ \succ y_-$):
$$\mathcal{L}_{\text{RM}}(\boldsymbol{\theta}) = - \log \sigma\left( r_\theta(x, y_+) - r_\theta(x, y_-) \right)$$
where $\sigma(z) = \frac{1}{1 + e^{-z}}$ is the Sigmoid activation function.
- If $r_\theta(x, y_+) \gg r_\theta(x, y_-)$, $\sigma \to 1$, and loss $\mathcal{L} \to 0$.
- If $r_\theta(x, y_+) \ll r_\theta(x, y_-)$, loss explodes, driving strong gradient updates to reward the superior response and penalize the inferior response.

Once trained, the static scalar reward model $r_\theta(x, y)$ serves as the automated reward environment for PPO policy alignment.

---

## 8. Advanced Multi-Agent & Adaptive Reward Shaping Architectures

To address the limitations of static manual heuristics, recent research led by **Dr. Ma Haozhe and collaborators at the National University of Singapore (NUS)** introduced three foundational adaptive reward shaping frameworks.

### 8.1 ReLara: RL with an Assistant Reward Agent (Ma et al., ICML 2024)

Traditional reward shaping relies on hardcoded mathematical formulas. **ReLara** decouples task execution from reward engineering by formulating reward generation as a **secondary cooperative Markov Decision Process**:

```
+---------------------------------------------------------------------------------------+
|                                    ReLara ARCHITECTURE                                |
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

- **The Policy Agent ($\mathcal{A}_P$):** Interacts directly with the environment. It updates its parameters using an augmented composite reward:
  $$r_t^{\text{composite}} = r_{E_t} + \lambda r_{S_t}$$
- **The Assistant Reward Agent ($\mathcal{A}_R$):** Observes the state-action pair $(s_t, a_t)$ and generates a suggested shaping reward $r_{S_t}$.
- By framing shaping as an active decision problem, $\mathcal{A}_R$ learns to provide optimal feedback that dynamically guides $\mathcal{A}_P$ out of exploratory deadlocks.

---

### 8.2 CenRA: Centralized Reward Agent for Multi-Task RL (Ma et al., NeurIPS 2025)

In multi-task reinforcement learning, training distinct agents across $N$ related tasks from scratch is computationally wasteful.
**CenRA** introduces a **Centralized Reward Agent ($\mathcal{A}^{\text{rwd}}$)** designed to extract and transfer universal task knowledge:

```
+---------------------------------------------------------------------------------------+
|                                    CenRA ARCHITECTURE                                 |
|                                                                                       |
|                           CENTRALIZED REWARD AGENT (A^{rwd})                          |
|                                    ^             |                                    |
|             Knowledge Extraction   |             | Knowledge Distillation             |
|             from Unified Replay    |             | Knowledge Rewards r^{rwd}          |
|                                    |             v                                    |
|               +-----------------------------------------------+                       |
|               |         CONCATENATED REPLAY BUFFER D          |                       |
|               |  [ Replay D_1 ]   [ Replay D_2 ] ... [ D_N ]  |                       |
|               +-----------------------------------------------+                       |
|                     ^                   ^               ^                             |
|                     |                   |               |                             |
|               Policy Agent 1      Policy Agent 2 ...  Policy Agent N                  |
|               Task #1             Task #2             Task #N                         |
+---------------------------------------------------------------------------------------+
```

1. Independent policy agents $\mathcal{A}_1^{\text{pol}}, \dots, \mathcal{A}_N^{\text{pol}}$ collect experience across distinct tasks into individual replay buffers $\mathcal{D}_1, \dots, \mathcal{D}_N$.
2. The Centralized Reward Agent analyzes the concatenated buffer $\mathcal{D} = \bigcup_{i=1}^N \mathcal{D}_i$, identifying shared structural invariants and bottleneck transitions.
3. CenRA distributes this distilled structural knowledge back to all individual policy agents via **knowledge rewards $r^{\text{rwd}}$**, drastically boosting sample efficiency in multi-task transfer regimes.

---

### 8.3 SASR: Self-Adaptive Success Rate-Based Reward Shaping (Ma et al., ICLR 2025)

**SASR** introduces a continuous self-adaptive reward shaping mechanism that eliminates manual hyperparameter tuning by estimating localized **Bayesian success rates**:

```
+---------------------------------------------------------------------------------------+
|                                     SASR PIPELINE                                     |
|                                                                                       |
|   Early Learning Stage:                            Late Learning Stage:               |
|   Sparse Trajectory Accumulation                   Abundant Trajectory Accumulation   |
|          |                                                |                           |
|          v                                                v                           |
|   Partition into Success States (S)                Partition into Success States (S)  |
|   and Failure States (F)                           and Failure States (F)             |
|          |                                                |                           |
|          v                                                v                           |
|   Kernel Density Estimation (KDE)                  Kernel Density Estimation (KDE)    |
|   + Random Fourier Features (RFF)                  + Random Fourier Features (RFF)    |
|   Outputs smooth densities: d_S(s), d_F(s)         Outputs smooth densities: d_S(s), d_F(s)|
|          |                                                |                           |
|          v                                                v                           |
|   Effective Counts: \tilde{N}_S(s), \tilde{N}_F(s) Effective Counts: \tilde{N}_S(s), \tilde{N}_F(s)|
|          |                                                |                           |
|          v                                                v                           |
|   Diffuse Beta Distribution:                       Sharp, Highly Confident            |
|   Beta(\tilde{N}_S, \tilde{N}_F)                   Beta Distribution                  |
|          |                                                |                           |
|          +-----------------------+------------------------+                           |
|                                  |                                                    |
|                                  v                                                    |
|   Sample Expected Success Rate -> Map through f(r^S) -> Adaptive Shaped Reward R^S(s) |
+---------------------------------------------------------------------------------------+
```

#### Mathematical Mechanics of SASR
1. **Density Estimation via Random Fourier Features (RFF):**
   Instead of discrete counts, SASR maps continuous states $s$ into a randomized Fourier feature space to compute smooth kernel density functions for successful trajectories ($\tilde{d}_S(s)$) and failed trajectories ($\tilde{d}_F(s)$).
2. **Bayesian Beta Distribution Modeling:**
   The densities yield continuous effective success counts $\tilde{N}_S(s) = \tilde{d}_S(s) \times N$ and failure counts $\tilde{N}_F(s) = \tilde{d}_F(s) \times N$.
   These define the conjugate parameters of a localized **Beta Distribution**:
   $$\text{Success Rate}(s) \sim \text{Beta}\left( \tilde{N}_S(s), \, \tilde{N}_F(s) \right)$$
3. **Adaptive Evolution Across Learning Stages:**
   - In the **Early Stage**, sample counts are low, producing wide, exploratory Beta distributions with high variance.
   - In the **Late Stage**, accumulated data produces narrow, highly peaked Beta distributions with overwhelming statistical confidence.
4. **Shaped Reward Mapping:**
   At every step, the agent samples an expected success rate from the localized Beta distribution and evaluates it through a calibrated mapping function $f(r^S)$ to deliver an optimal, self-adaptive shaping reward $R^S(s)$ that matures dynamically alongside agent competence.

---

<reviewkit>
<takeaways>
- **The Curse of Sparse Native Rewards:** Real-world environmental rewards are almost universally sparse, delayed, and non-informative. In zero-reward in-process states, standard Q-learning executes empty updates ($0 \leftarrow 0$), and algorithms only begin to learn after stumbling upon a rare goal state through random exploration.
- **The Reward Shaping Paradigm:** General reward shaping reformulates the feedback landscape as $R^{\text{new}} = \alpha R^{\text{env}} + \beta R^{\text{sha}}$, converting sparse binary goals into dense intermediate milestone gradients.
- **Exploration Shaping & RND:** Novelty bonuses reward under-explored states. While tabular counters use $1/(N(s)+1)$ and continuous domains use pseudo-counts, high-dimensional spaces deploy Random Network Distillation (RND), measuring prediction errors between a trained predictor and a frozen target network ($\|f(s) - \hat{f}_\theta(s)\|^2$).
- **The Noisy-TV Vulnerability:** Pure prediction-error novelty is vulnerable to environmental stochastic noise (e.g., random static on a TV screen). The agent becomes hypnotized by unpredictable noise, harvesting infinite exploration bonuses while abandoning the task.
- **Exploitation Shaping & Process Supervision:** Assigning bonuses to critical bottleneck states accelerates optimization. In LLM multi-step reasoning, Math-Shepherd replaces sparse outcome supervision with process-level step rewards ($y_{s_i}$) evaluated via automated Monte Carlo tree rollouts.
- **Potential-Based Policy Invariance:** Arbitrary reward shaping risks policy corruption (reward gaming). Ng, Harada, and Russell proved that potential-difference shaping ($R^{\text{sha}} = \gamma \phi(s') - \phi(s)$) induces a telescoping sum cancellation along trajectories, strictly guaranteeing that the optimal policy $\pi^*$ remains identical to the native MDP.
- **RLHF in Open-Ended Domains:** For subjective LLM generation lacking programmatic rewards, Reinforcement Learning from Human Feedback trains a regression reward model ($r_\theta(x, y) \in \mathbb{R}$) on human pairwise preference rankings using the Bradley-Terry logistic loss ($-\log \sigma(r(y_+) - r(y_-))$).
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
