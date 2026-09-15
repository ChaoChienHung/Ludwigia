<meta>
Title: NUS CS5446 Reinforcement Learning and Sequential Decision Making
Summary: Comprehensive lecture and study notes for NUS CS5446 Reinforcement Learning and Sequential Decision Making (AI Planning and Decision Systems), covering sensing-acting loops, classical planning (STRIPS, PDDL, SATPlan), scalable planning heuristics (HTN), rational decision theory, utility theory, game theory, and LLM-assisted agent planning.
Slug: nus-cs5446-reinforcement-learning-and-sequential-decision-making
Output: notes/NUS CS5446 Reinforcement Learning and Sequential Decision Making/NUS CS5446 Reinforcement Learning and Sequential Decision Making.html
CanonicalId: nus-cs5446-reinforcement-learning-and-sequential-decision-making
Style: default
EstimatedReadingTime: true
Lang: en
Tags: AI Planning, Classical Planning, STRIPS, PDDL, SATPlan, Automated Reasoning, Decision Theory, Game Theory, Reinforcement Learning
Status: drafting
Published: 2026-08-20
LastModified: 2026-09-05
</meta>

# NUS CS5446 Reinforcement Learning and Sequential Decision Making

# Week 1 - AI Planning Fundamentals: From Sensing-Acting Loops and State-Space Search to Responsible AI Governance

<draft>
- 1. Planning and Acting, Decision Making
    - Sensing: Agent senses state information, observations, and environmental feedback from the Environment.
    - Acting: Agent acts in the Environment based on internal decision logic or policies.
    - Communication: Continuous Bidirectional Communication Loop between Environment and Agent (Environment dynamically updates state; Agent actions alter the environment).
- 2. AI Planning Problem Formulation & Complexity Matrix
    - Task Environment Assumption: Agent operates within a concrete Task Environment.
    - Four Core Formal Elements: States ($S$, initial state $s_0$), Actions ($A(s)$, preconditions), Effects ($\delta(s, a)$, state transitions), Goal Test ($G$).
    - Problem Complexity Matrix: States (fully vs partially observable), Actions (discrete vs continuous), Effects (deterministic vs uncertain), Goals (deterministic vs graded), Environment (static vs dynamic), Agent count (single vs multiple).
    - Classical Planning Baseline: Discrete, Deterministic, Static, Fully Observable.
    - Physical Reasoning Challenges & DeepMind PushWorld: Dynamic spatial puzzles, friction, and obstacle manipulation illustrating why explicit state transitions and physics models are essential.
- 3. A Brief History of Agents (1980s - 2030s)
    - 1980s Symbolic AI Agent: Logic rules & symbolic planning (e.g., STRIPS block manipulation).
    - 2000s RL Agent: Learning by trial & error and reward signals (policy and value optimization, MDPs).
    - 2020s LLM Agent: Language-based reasoning using pretrained models and Chain-of-Thought ("Let's reason step by step").
    - 2030s Tool-using Multi-Agent: Planning + coordination, external tool/API calls (Search -> extract -> summarize -> email), step delegation across multiple agents.
- 4. Core Solver Mechanism: State-Space Search Algorithms
    - Mapping planning to graph search: Nodes = states, Edges = actions, Solution = path from $s_0$ to $G$.
    - Uninformed search (BFS, DFS, UCS) vs. Informed heuristic search (A*, Greedy Best-First Search).
- 5. AI Planning and Rational Decision Making
    - Rational Decisions: Defining expected utility, decision objectives, and guiding values.
    - Sequential Action Planning: Learning optimal action selection under uncertainty and dynamic change.
    - Multi-Agent Dynamics: Reasoning when competing/collaborative agents optimize independently.
    - The Actor's View of Planning: "Plan to Act" vs. "Act to Plan".
- 6. LLM Probabilistic Instability & Deterministic Tool Fusion
    - LLM Probabilistic Limitations: Autoregressive probabilistic sampling causes output instability, hallucinations, and quality fluctuations.
    - Deterministic Tool Fusion Architecture: Foundation Models + Memory Systems + Cognitive Processes (Reasoning, Planning) + External Deterministic Tools (Python, SQL, symbolic solvers).
- 7. Real-World Application Domains & Industrial Case Studies
    - 7 Key Domains: Logistics/Manufacturing (SciTePress 2022, ScienceDirect 2025), Enterprise Workflow (IJCAI 2019), Robotics Navigation & Manipulation (Nature 2025), Healthcare OR Scheduling (arXiv 2021, RCRA 2023), Video Game AI & NPC GOAP (IEEE TOG 2019, AIIDE 2021), Space Mission Autonomy (Mars 2020 Rover, ICRA 2007, i-SAIRAS 2020), Real-Time Constraints Decision Support.
- 8. Modern Planning Ecosystem: AIPlanning4EU & IPC Benchmarks
    - AIPlanning4EU Project: Unified Planning Library (`unified-planning`), architecture of technology-specific bridges connecting diverse planning engines.
    - International Planning Competition (IPC 2023): Classical, Learning, Probabilistic, Numeric, and HTN tracks. Solvers (Ragnarok, DecStar-2023, Scorpion), Apptainer reproducible container images, CPLEX licensing.
- 9. From Classical Planning to Decision Making Under Uncertainty
    - Real-world limitations of classical assumptions: noisy sensors, incomplete observability, stochastic transitions, preference trade-offs.
    - The evolutionary roadmap: Classical Planning -> Utility Theory -> Markov Decision Processes (MDPs / POMDPs) -> Reinforcement Learning (RL).
- 10. Responsible AI Planning and Decision Making
    - Human-aware AI Systems: Works for humans, Works with humans, Works alongside humans.
    - Trustworthy AI Systems: Natural interaction, effective collaboration, fairness, accountability, transparency, robustness, resilience, privacy, security.
    - 12 Common Principles of Responsible AI.
    - Trade-off Balancing: Balancing accuracy value against responsible feature integration costs across 10 application domains.
- 11. Beyond Technical Challenges and Lifecycle Governance
    - Four Challenge Dimensions: Domain, User, Economic, and System challenges.
    - Stakeholder Questions: Developers, Users, Managers, Regulators.
    - Full Lifecycle Governance: Design & modeling, software engineering, continuous deployment monitoring.
</draft>

In Artificial Intelligence (AI) and autonomous agent research, **Planning and Decision Making** serve as the vital bridge connecting cognitive reasoning to physical or virtual action. An intelligent agent must not only perceive dynamic environment changes, but also autonomously reason about a valid sequence of actions to achieve complex objectives.

This note systematically decomposes the core mechanisms of AI Planning. We begin with the agent-environment **Perception-Action Loop** and the **Problem Complexity Matrix**, tracing the historical evolution from 1980s Symbolic AI to 2030s Tool-using Multi-Agents. We examine state-space **Search Algorithms**, the actor's dual perspective (*Plan to Act* vs. *Act to Plan*), and the challenge of physical reasoning illustrated by the **DeepMind PushWorld** benchmark. Furthermore, we analyze the probabilistic limitations of Large Language Models (LLMs) and how **Deterministic Tool Fusion** forms modern agent architectures. Finally, we explore real-world application domains, open-source ecosystems (**AIPlanning4EU** and **IPC 2023**), the bridge to **Decision Making Under Uncertainty**, and **Responsible AI Planning** governance frameworks.

---

## 1. The Perception-Action-Communication Loop

In sequential decision-making contexts, an agent and its **Task Environment** interact in a continuous, closed-loop bidirectional communication process (*Perception-Action-Communication Loop*).

```
+-------------------------------------------------------------------+
|                        Task Environment                           |
|                                                                   |
|   +-------------------+                   +-------------------+   |
|   |  Current State    |                   | Dynamic Changes & |   |
|   |       (s_t)       |                   |  State Transition |   |
|   +---------+---------+                   +---------^---------+   |
+-------------|---------------------------------------|-------------+
              | (Sensing / Perception)                | (Acting / Execution)
              v                                       |
+-----------------------------------------------------|-------------+
|                         Agent                       |             |
|                                                     |             |
|   +-------------------+                   +---------+---------+   |
|   |  Internal State & | ----[ Plan ]----> | Action Execution  |   |
|   | Planning System   |                   |       (a_t)       |   |
|   +-------------------+                   +-------------------+   |
+-------------------------------------------------------------------+
```

This interaction framework comprises three essential dimensions:

1. **Agent Sensing from Environment**: The agent extracts state information, raw observations, and environmental feedback via physical sensors or software API endpoints to maintain its internal world model.
2. **Agent Acting in Environment**: The agent executes actions or issues commands derived from its internal policy or planning module into the environment.
3. **Bidirectional Communication & State Evolution**: The environment receives the agent's actions, undergoes state transitions, and emits updated state representations back to the agent, closing the decision loop.

---

## 2. AI Planning Problem Formulation and Complexity Matrix

To enable automated computational reasoning over decision problems, real-world domains are abstracted into an explicit **AI Planning Problem Model**.

<block>
<strong>Core Definition of AI Planning:</strong><br/>
Given a Task Environment, a planning problem is formalized as a tuple of states, actions, effects, and goal tests. Its ultimate objective is to find a legal sequence of actions leading from an initial state to a goal state.
</block>

### 2.1 Formalization: Four Core Elements

A standard AI Planning Problem is defined by four core elements:

- **State Space ($S$)**: The set of all possible environmental feature configurations. It explicitly specifies the starting point: the **Initial State ($s_0 \in S$)**.
- **Action Space ($A$)**: The set of legal transition operators $A(s) \subseteq A$ available at a given state $s$. Actions specify preconditions required for execution.
- **Effects / Transition Model ($\delta$)**: The state transition mapping $s' = \delta(s, a)$ resulting from executing action $a \in A(s)$. Effects represent directed edges in the state graph.
- **Goal Test ($G$)**: The predicate verifying whether a given state $s$ satisfies the target objective or belongs to a set of goal states $G \subseteq S$.

### 2.2 Problem Complexity Matrix: Simple vs. Complex Models

Planning problems vary across multiple dimensions, differentiating simple classical models from complex real-world environments:

| Problem Feature | Simple Model (Classical Planning) | Complex Model (Real-World Acting) |
| :--- | :--- | :--- |
| **States** | **Fully observable** (complete state known) | **Partially observable** (noisy sensors, hidden states) |
| **Actions** | **Discrete** (atomic step transitions) | **Continuous** (continuous control, velocities) |
| **Effects** | **Deterministic** (exact predictable outcome) | **Non-deterministic or Uncertain** (probabilities) |
| **Goals** | **Deterministic** (binary goal test satisfaction) | **Ordered or graded** (utility functions, preferences) |
| **Environment** | **Static** (changes only through agent actions) | **Dynamic** (exogenous events, time-varying processes) |
| **Agent Count** | **Single agent** (solitary actor) | **Multiple agents** (cooperative or adversarial games) |

### 2.3 Physical Reasoning and Current Challenges: DeepMind PushWorld

While classical planning successfully solves combinatorial problems where state transitions are purely symbolic (e.g., discrete block stacks or flight hops), modern AI planning faces severe hurdles when bridging symbolic models to physical reality.

A prominent contemporary challenge is highlighted by the **DeepMind PushWorld** benchmark (`https://deepmind-pushworld.github.io/play/`). PushWorld evaluates whether AI agents can solve physical grid-world puzzles requiring:
- Spatial reasoning over obstacles, walls, and multi-object collisions.
- Indirect manipulation (e.g., pushing an intermediate block to unblock a switch, which in turn deactivates a barrier).
- Managing non-linear physical dynamics where an unintended move permanently traps the agent in a dead-end state.

PushWorld proves that pure autoregressive language models struggle with spatial and physical planning unless augmented by explicit state transition models, physics-informed search, and verification engines.

---

## 3. A Brief History of Agents: 1980s to 2030s

The evolution of AI Agents reflects a fundamental paradigm shift across four distinct decades:

```
+---------------------------------------------------------------------------------------------------+
|                                      A Brief History of Agents                                    |
+-------------------+-----------------------+-----------------------+-------------------------------+
|       1980s       |         2000s         |         2020s         |             2030s             |
| Symbolic AI Agent | Reinforcement Learning |       LLM Agent       |  Tool-using Multi-Agent       |
+-------------------+-----------------------+-----------------------+-------------------------------+
| • Logic rules     | • Trial & error       | • Pretrained model    | • High-level planning &       |
| • Symbolic plan   | • Reward signals      |   language reasoning  |   multi-agent coordination    |
|   (e.g., STRIPS)  | • Value / Policy      | • Chain-of-Thought    | • External tools & APIs       |
|                   |   learning (MDP)      |   ("Step by step")    | • Task step delegation        |
+-------------------+-----------------------+-----------------------+-------------------------------+
```

1. **1980s Symbolic AI Agent**: Relied on formal First-Order Logic and symbolic planning algorithms (e.g., <information context="Stanford Research Institute Problem Solver">STRIPS</information>). World states and actions were modeled as logical predicates. Highly verifiable, but fragile when confronted with noisy sensor inputs.
2. **2000s Reinforcement Learning (RL) Agent**: Optimized policy $\pi(a \mid s)$ and value functions $V(s)$ through Markov Decision Processes (MDPs). Agents learned optimal behaviors through continuous trial-and-error interactions and scalar reward feedback, dominating games and robotic locomotion.
3. **2020s LLM Agent**: Leveraged billions of parameters in pretrained Large Language Models for language-based commonsense reasoning. Employs prompting techniques like Chain-of-Thought ("*Let's reason step by step*") to generate sequential plans in natural language.
4. **2030s Tool-Using Multi-Agent**: The emerging paradigm integrates high-level neural planning with multi-agent coordination. Specialized autonomous agents decompose tasks and dynamically invoke deterministic external tools, APIs, and symbolic engines (e.g., Web Search $\rightarrow$ Data Extraction $\rightarrow$ Formal PDDL Verification $\rightarrow$ Email Delivery).

---

## 4. Core Solver Mechanism: State-Space Search Algorithms

Given a formalized planning problem, the central algorithmic challenge is: **How do we search for an action sequence that connects initial state $s_0$ to goal state $G$?**

<callout style="info">
<strong>Planning as State-Space Search:</strong><br/>
By mapping the planning problem into a state-space graph where nodes represent ground world states and directed edges represent valid action transitions, finding a plan is equivalent to finding a path from $s_0$ to $G$.
</callout>

Classic planning search paradigms include:

- **Uninformed Search (Blind Search)**: Explores state transitions without domain-specific distance estimates:
  - **Breadth-First Search (BFS)**: Explores level by level; guarantees shortest path in unweighted graphs, but suffers from exponential memory consumption ($O(b^d)$).
  - **Depth-First Search (DFS)**: Explores deep paths first; memory efficient ($O(bd)$), but neither complete in infinite spaces nor optimal.
  - **Uniform Cost Search (Dijkstra's Algorithm)**: Expands nodes in order of cumulative path cost $g(n)$, guaranteeing cost-optimality.
- **Informed Search (Heuristic Search)**: Employs a heuristic evaluation function $h(s)$ estimating the remaining distance from state $s$ to goal $G$:
  - **$A^*$ Search**: Evaluates nodes via $f(n) = g(n) + h(n)$. If $h(n)$ is **admissible** (never overestimates true remaining cost), $A^*$ is mathematically guaranteed to find the optimal plan.
  - **Greedy Best-First Search (GBFS)**: Evaluates nodes strictly by $f(n) = h(n)$. Runs orders of magnitude faster in practice, finding satisficing (suboptimal) plans.

---

## 5. AI Planning and Rational Decision Making

In complex domains, planning extends beyond graph traversal into **Rational Decision Making** and the actor's dual perspective.

### 5.1 Rationality and Sequential Action Challenges

An intelligent agent must address three fundamental decision challenges:

1. **Make Rational Decisions**:
   - *What does rational mean?* Choosing actions that maximize expected utility given available observations.
   - *Objectives and Values*: Formulating explicit cost functions and guiding objective values.
2. **Plan Sequential Actions Under Uncertainty**:
   - Learning optimal actions in non-deterministic, dynamic environments.
   - Scaling planning algorithms up to high-dimensional state spaces.
3. **Act Appropriately in Multi-Agent Environments**:
   - *Game-theoretic dynamics*: Reasoning when other agents are simultaneously optimizing their own objectives.
   - *Social alignment*: Operating responsibly within human social and ethical norms.

### 5.2 The Actor's View of Planning

From the actor's standpoint, planning exhibits a dual dialectic:

- **Plan to Act**: *How to plan in advance to act effectively in the real world?* Developing predictive plans that minimize execution risks.
- **Act to Plan**: *How to act and explore in the real world to effectively update and refine plans?* Gathering sensory observations through exploratory actions to eliminate epistemic state uncertainty.

---

## 6. LLM Probabilistic Instability and Deterministic Tool Fusion

While LLMs offer unprecedented reasoning flexibility, they possess intrinsic structural limitations for rigid planning.

<callout style="warning">
<strong>LLM Probabilistic Limitations:</strong><br/>
LLMs rely on autoregressive token sampling. Their probabilistic nature is the root cause of output instability, hallucinations, and quality fluctuations. Rigid planning requires deterministic mathematical correctness.
</callout>

### 6.1 Deterministic Tool Fusion Architecture

To resolve LLM instability, modern SOTA Agent AI integrates probabilistic models with **Deterministic Tools**:

```
+-------------------------------------------------------------------+
|                   SOTA Agent AI Architecture                      |
+-------------------------------------------------------------------+
|                                                                   |
|   +-----------------------------------------------------------+   |
|   |                 Foundation Model (LLM)                    |   |
|   |         (Probabilistic Reasoning & Intuition)             |   |
|   +-----------------------------+-----------------------------+   |
|                                 |                                 |
|         +-----------------------+-----------------------+         |
|         |                       |                       |         |
|   +-----v-----+           +-----v-----+           +-----v-----+   |
|   |  Memory   |           | Cognitive |           |External   |   |
|   |  Systems  |           | Processes |           |  Tools    |   |
|   | (Long/    |           |(Reasoning,|           |(Determini-|   |
|   |  Short)   |           | Planning) |           | stic APIs)|   |
|   +-----------+           +-----------+           +-----------+   |
+-------------------------------------------------------------------+
```

- **Foundation Models (LLM)**: Handle natural language understanding, intent extraction, and intuitive task decomposition.
- **Memory Systems**: Store short-term conversational context and long-term vector embeddings.
- **Computational Cognitive Processes**: Perform structured reasoning, sub-goal generation, and search (e.g., Tree of Thoughts, MCTS).
- **Deterministic Tools**: Execute exact code (Python interpreters, SQL engines, SAT/SMT solvers, symbolic PDDL planners) to guarantee 100% sound execution.

---

## 7. Real-World Application Domains and Industrial Systems

Automated planning is actively deployed across industrial, aerospace, and mission-critical domains:

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

### Case Spotlight: Autonomous Mars Rover Scheduling
NASA's **Mars 2020 Perseverance Rover** utilizes onboard automated scheduling (Rabideau et al., 2020) to dynamically plan scientific observations and rover traverses. In interplanetary environments where communication latency to Earth exceeds $10\text{ to } 20\text{ minutes}$, autonomous planning algorithms allow the rover to repair schedules on the fly when tasks complete ahead of or behind schedule, without awaiting commands from mission control.

---

## 8. Modern Planning Ecosystem: AIPlanning4EU and IPC Competitions

Modern planning research has converged into standardized, open-source software libraries and international benchmarks.

### 8.1 The AIPlanning4EU Project & Unified Planning Library

The European Commission's **AIPlanning4EU Project** developed the **Unified Planning Library** (`unified-planning`, `https://github.com/aiplan4eu/unified-planning`), designed to make automated planning accessible to software engineers without requiring deep expertise in esoteric PDDL dialects:

```
+---------------------------------------------------------------------------------------------------+
|                             AIPlanning4EU Unified Planning Architecture                           |
+---------------------------------------------------------------------------------------------------+
| [ Use Cases ]: Logistics Automation | Flexible Manufacturing | Fleet Operations | Lab Planning    |
|                                                |                                                  |
|                                                v                                                  |
|   +-------------------------------------------------------------------------------------------+   |
|   |                           Unified Planning Framework (Python API)                         |   |
|   |   • Intuitive Pythonic problem and action definition (Fluents, Preconditions, Effects)    |   |
|   |   • Automatic problem reformulation, grounding, and conditional effect simplification    |   |
|   |   • Bidirectional translation bridges (PDDL, ANML, ground formats)                        |   |
|   +--------------------------------------------+----------------------------------------------+   |
|                                                |                                                  |
|                                                v                                                  |
| [ Planning Engines ]:  Fast Downward  |  Pyperplan  |  Tamer  |  OptaPlanner  |  ENHSP           |
+---------------------------------------------------------------------------------------------------+
```

### 8.2 International Planning Competition (IPC 2023)

The **International Planning Competition (IPC)**, organized by ICAPS, represents the gold standard for benchmarking automated planning engines:
- **Diverse Tracks**: Spans Classical (Sequential & Satisficing), Learning, Probabilistic, Numeric, and Hierarchical Task Network (HTN) tracks.
- **Top Competitors**: State-of-the-art classical winners include **Ragnarok** (Optimal track), **DecStar-2023** (Agile track), and **Scorpion Maidu and Levitron** (Satisficing track).
- **Reproducible Containerization**: Planners are packaged into standardized **Apptainer (Singularity)** containers (`ipc2023-classical.github.io`), guaranteeing reproducible execution across high-performance compute clusters and integrating with industrial linear programming engines such as IBM CPLEX.

---

## 9. From Classical Planning to Decision Making Under Uncertainty

Classical planning relies on a deterministic world model: actions succeed with $100\%$ certainty, and world states are fully known. However, real-world deployment must overcome:
1. **Noisy and Incomplete Perception**: Sensor noise means the agent observes partial features, requiring reasoning over **Belief States** (probability distributions over possible world states).
2. **Stochastic Action Transitions**: Physical actions can fail, slip, or yield varied outcomes, governed by transition probabilities $P(s' \mid s, a)$.
3. **Preference & Risk Trade-offs**: Real-world goals are rarely binary. Achieving a goal faster might carry higher financial cost or safety risk.

```
+---------------------------------------------------------------------------------------------------+
|                        From Deterministic Planning to Uncertainty Modeling                        |
+-----------------------------------+---------------------------------------------------------------+
| Paradigm                          | Core Formalisms & Solution Methods                            |
+-----------------------------------+---------------------------------------------------------------+
| Classical Deterministic Planning  | STRIPS, PDDL, State-Space Graph Search (A*, BFS), SATPlan    |
| Decision Theory & Preferences     | Axioms of Rational Preferences, Utility Functions, MEU        |
| Sequential Stochastic Decisions   | Markov Decision Processes (MDPs), Bellman Optimality, Value It|
| Partial Observability Decisions   | Partially Observable MDPs (POMDPs), Belief State Tracking     |
| Model-Free Autonomous Learning    | Reinforcement Learning (Q-Learning, Policy Gradient, PPO)    |
+-----------------------------------+---------------------------------------------------------------+
```

This evolutionary progression leads directly into **Utility Theory, Markov Decision Processes, and Reinforcement Learning**, equipping agents to navigate real-world stochastic environments.

---

## 10. Responsible AI Planning and Decision Making

As AI agents integrate into societal infrastructure, **Responsible AI Planning** becomes paramount.

### 10.1 Human-AI Collaboration Paradigms

Human-aware AI systems structure human-AI interaction into three paradigms:

1. **Works for Humans**: AI acts as a passive tool executing explicit human commands.
2. **Works with Humans**: AI acts as an interactive partner, engaging in real-time dialogue and co-decision.
3. **Works alongside Humans**: AI acts as an autonomous peer, operating in shared environments while adhering to social norms.

### 10.2 12 Common Principles of Responsible AI

Trustworthy AI agent deployment relies on 12 common principles:

```
+-------------------------------------------------------------------+
|                 12 Common Principles of Responsible AI            |
+-------------------------------------------------------------------+
| 1. Ensure Safety                 | 7. Attribute Responsibility    |
| 2. Respect Privacy               | 8. Reflect Diversity & Inclusion|
| 3. Ensure Fairness               | 9. Support Equality            |
| 4. Promote Trust                 | 10. Facilitate Collaboration   |
| 5. Establish Accountability      | 11. Uphold Human Rights        |
| 6. Provide Transparency          | 12. Limit Harmful Uses         |
+-------------------------------------------------------------------+
```

### 10.3 Balancing Accuracy vs. Responsible Feature Costs

Integrating responsible features (transparency, privacy, fairness, safety, robustness) introduces a core trade-off: **balancing the value gained from accurate outputs against the additional cost and effort required for responsible governance**.

This trade-off spans 10 major application domains:
*Diagnosis recommendations, risk predictions, optimal policy formulation, assistive guidance, recruitment interviews, social assistance schemes, university admissions, population censuses, consumer behavior analysis, and scientific research.*

---

## 11. Beyond Technical Challenges and Lifecycle Governance

Deploying responsible agents requires navigating non-technical challenge dimensions and establishing full-lifecycle governance.

### 11.1 Four Dimensions of Non-Technical Challenges

```
                       +-----------------------------------+
                       |    Beyond Technical Challenges    |
                       +-----------------+-----------------+
                                         |
         +------------------+------------+------------+------------------+
         |                  |                         |                  |
+--------v-------+ +--------v-------+        +--------v-------+ +--------v-------+
| Domain         | | User           |        | Economic       | | System         |
| Challenges     | | Challenges     |        | Challenges     | | Challenges     |
+----------------+ +----------------+        +----------------+ +----------------+
| • Deep domain  | | • Skill gaps   |        | • High setup   | | • Uncertain    |
|   knowledge    | | • User bias    |        |   costs        | |   information  |
| • Operational  | | • Usage        |        | • Unclear ROI  | | • Dynamic IT   |
|   complexity   | |   preferences  |        | • Scalability  | |   systems      |
+----------------+ +----------------+        +----------------+ +----------------+
```

1. **Domain Challenges**: Requiring domain expertise, managing operational complexity, and handling conflicting constraints.
2. **User Challenges**: Accommodating varied skill levels, user preferences, and human cognitive biases.
3. **Economic Challenges**: Managing implementation costs, establishing market viability, and ensuring financial scalability.
4. **System Challenges**: Handling uncertain/dynamic data and adapting to evolving IT infrastructure.

### 11.2 Stakeholder Questions & Lifecycle Governance

Governance requires addressing key questions across Developers, Users, Managers, and Regulators regarding feature definitions, trust safeguards, quantitative trade-offs, downstream legal impacts, and accountability timelines.

```
+-------------------------------------------------------------------+
|                  Lifecycle Timing and Governance                  |
+-------------------------------------------------------------------+
|  [ Design & Modeling ]  -->  [ SE Lifecycle ]  --> [ Continuous   |
|   (Core Architecture)        (Development)           Monitoring ] |
+-------------------------------------------------------------------+
```

Governance must be embedded across the entire lifecycle: from **Core Design & Modeling**, through **Software Engineering**, to **Deployment & Continuous Monitoring**, with clearly defined role distribution.

---

## 12. Summary

AI Planning has evolved from classical symbolic search to SOTA architectures combining probabilistic foundation models with deterministic tools and multi-agent coordination. Achieving effective deployment requires coupling algorithmic planning with Responsible AI governance—balancing accuracy against safety, privacy, and fairness across the full software lifecycle.

<reviewkit>
<takeaways>
- **Perception-Action Loop & Problem Complexity:** Agents operate in closed Sensing-Acting loops. Problems are categorized by state observability, action continuity, effect determinism, goal granularity, environment dynamics, and agent count.
- **Physical Reasoning & PushWorld:** Symbolic planners operate over clean state abstractions, whereas physical environments (PushWorld) require reasoning over spatial dynamics, friction, and multi-body interactions.
- **Agent Evolution (1980s–2030s):** Shifted from 1980s Symbolic AI (STRIPS) and 2000s Reinforcement Learning (MDP) to 2020s LLM Agents (CoT) and 2030s Tool-using Multi-Agents.
- **Deterministic Tool Fusion:** Overcomes LLM probabilistic sampling limitations by coupling foundation models with memory, cognitive search, and deterministic code/API tools.
- **Industrial Applications & Ecosystem:** Actively deployed in space exploration (Mars 2020 Rover), manufacturing, robotics, and healthcare. Unified by modern libraries (AIPlanning4EU) and tested in international competitions (IPC 2023).
- **Roadmap to Uncertainty:** Real-world stochasticity and preference trade-offs necessitate transitioning from classical deterministic planning to Utility Theory, Markov Decision Processes (MDPs), and Reinforcement Learning (RL).
- **Responsible AI & Governance:** Enforces 12 core principles across Works for, Works with, and Works alongside human-AI paradigms, supported by lifecycle governance from design to monitoring.
</takeaways>
<qprompt/>
</reviewkit>

## References

1. Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4th ed.). Pearson.
2. Ghallab, M., Nau, D., & Traverso, P. (2004). *Automated Planning: Theory and Practice*. Morgan Kaufmann.
3. Fikes, R. E., & Nilsson, N. J. (1971). STRIPS: A new approach to the application of theorem proving to problem solving. *Artificial Intelligence*, 2(3-4), 189-208. [ScienceDirect](https://doi.org/10.1016/0004-3702(71)90010-5)
4. Rabideau, G., Wong, V., Gaines, D., Agrawal, J., Chien, S., Kuhn, S., Fosse, E., & Biehl, J. (2020). Onboard automated scheduling for the Mars 2020 Rover. In *Proceedings of i-SAIRAS 2020*. ESA.
5. Sohrabi, S. (2019). AI planning for enterprise: Putting theory into practice. In *Proceedings of IJCAI-19* (pp. 6408-6410).
6. Neufeld, X., Mostaghim, S., & Perez-Liebana, D. (2019). Building a planner: A survey of planning systems used in commercial video games. *IEEE Transactions on Games*, 11(2), 91-108.
7. AIPlanning4EU Project. (2023). *The Unified Planning Library*. European Commission Horizon 2020. [GitHub](https://github.com/aiplan4eu/unified-planning)
8. International Planning Competition. (2023). *IPC 2023 Classical and HTN Tracks*. ICAPS. [Website](https://ipc2023-classical.github.io)

# Week 2 - Classical AI Planning: STRIPS, PDDL, State-Space Search, SATPlan, and Complexity Bounds

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

# Week 3 - Classical AI Planning and SATPlan: From STRIPS, PDDL, and State-Space Search to Propositional Satisfiability Reduction

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

# Week 4 - Scalable AI Planning: Heuristic Search, Abstractions, HTN, and Reachable Sets

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

# Week 5 - Rational Decision Making: Decision Theory, Utility Theory, and Game Theory

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

# Week 6 - LLM-Assisted Planning: Agent Evolution, Hybrid Solvers, and Responsible AI Governance

<draft>
- 1. AI Agent 的四代演進歷史與理性 Agent 環節
    - 從 1980s Symbolic 到 2000s RL, 2020s LLM (ReACT) 到 2030s Multi-Agent
    - Rational Agent 的感知、建模、推理與決策閉環
    - 規劃問題的維度矩陣（簡單 vs 複雜：可觀察度、確定性、動態性、單/多 Agent）
- 2. 大模型與符號規劃器結合的四大前沿範式
    - 範式一：LLM 導引 PDDL 生成與閉環修正（Mahdavi et al., NeurIPS 2024）
    - 範式二：任務分解與 LLM-MCTS 混合子目標規劃（Kwon et al., ICRA 2025）
    - 範式三：LLM 啟發式代碼合成（Corrêa et al., ArXiv 2025）
    - 範式四：全自動泛化規劃與 CoT 程式碼生成（Silver et al., AAAI 2024）
- 3. 工業級規劃框架與開源生態
    - AIPlanning4EU (Unified Planning library)
    - PANDA Framework（HTN、HDDL、PANDADealer）
- 4. 可信與負責任 AI 規劃與決策（Responsible AI）
    - Human-Aware AI 與 Trustworthy AI 核心原則
    - 準確度（Accuracy）與負責任特性（Responsible Features）的 Trade-off
    - 系統開發生命週期（SDLC）內的決策融入與全球法規趨勢（EU AI Act 等）
</draft>

隨著大語言模型（LLM）與基礎模型（Foundational Models）的爆發式成長，人工智能正在經歷從「單純的文本生成與常識答疑」向「具備主動目標規劃、工具使用與自我糾錯能力」的 **Agentic AI（Agent 化人工智能）** 跨越。

然而，單靠 LLM 的常識推理往往容易產生幻覺（Hallucination），缺乏嚴密的符號邏輯保證；而傳統古典規劃器雖然具備百分之百的正確性，卻受限於手工構建 PDDL 模型的高昂成本。**將大模型的常識與語言理解能力，與古典規劃器的嚴密符號推理深度結合**，成為當前 AI 規劃領域最受矚目的突破點。

本文將梳理 AI Agent 的四代演進歷程，深入剖析 LLM 輔助規劃（LLM-Assisted Planning）的四大前沿技術範式，並進一步論述可信與負責任 AI（Responsible AI）在實際系統部署與治理中的關鍵框架。

---

## 1. AI Agent 的四代演進歷史與理性 Agent 環節

### 1.1 四代 Agent 技術範式演進

回顧人工智能的發展歷史，Agent 的心智模型與核心驅動引擎經歷了四個階段的重大演進：

```
+------------------+     +------------------+     +------------------+     +------------------+
|    1980s Agent   |     |    2000s Agent   |     |    2020s Agent   |     |    2030s Agent   |
|   Symbolic AI    | --> | Reinforcement L. | --> |    LLM Agent     | --> | Tool-Using Multi |
| Logic & PDDL     |     | Trial & Error RL |     | ReACT & CoT LLM  |     | Agent Ecosystem  |
+------------------+     +------------------+     +------------------+     +------------------+
```

1. **1980s 符號 AI Agent（Symbolic Agent）**：依賴人工定義的邏輯規則與符號規劃器（如 STRIPS）。具備嚴密的邏輯推理能力，但缺乏對不確定性環境的適應力與常識理解。
2. **2000s 強化學習 Agent（Reinforcement Learning Agent）**：透過試錯（Trial & Error）與獎勵訊號（Reward Signals）學習最佳策略函數（Policy $\pi(a \mid s)$）。在特定封閉領域（如圍棋、電玩）表現優異，但採樣效率低且難以泛化至未見任務。
3. **2020s LLM Agent（Large Foundation Model Agent）**：以預訓練大語言模型為腦髓，利用 <information context="Reasoning and Acting Paradigm">ReACT</information>（Reasoning + Acting）與 Chain-of-Thought（CoT）實現自然語言推理與步驟規劃。
4. **2030s 多 Agent 協作生態（Tool-Using Multi-Agent）**：結合外部工具 API、長期記憶體系統（Memory Systems）與分工明確的多 Agent 團隊，具備複雜任務委派與動態協調能力。

### 1.2 理性 Agent（Rational Agent）架構與問題複雜度維度

一個完整的**理性 Agent（Rational Agent）**，必須在環境中形成「感知-建模-推理-規劃-行動」的閉環：

- **感知（Perception & Sensing）**：接收環境的多模態觀察。
- **建模與推理（Modeling & Reasoning）**：維護內部世界模型（World Model）與常識推導。
- **規劃與決策（Planning & Decision Making）**：評估目標與價值，產生動作序列。
- **行動與溝通（Acting & Communicating）**：執行動作並與環境或人類協作。

環境複雜度矩陣決定了規劃器所需的技術組態：

| 環境維度 | 簡單場景（Toy Problems） | 複雜現實場景（Real-Life Problems） |
| :--- | :--- | :--- |
| **可觀察性** | 完全可觀察（Fully Observable） | 部分可觀察（Partially Observable, POMDP） |
| **動作空間** | 離散動作（Discrete） | 連續控制（Continuous Control） |
| **動態轉移** | 確定性轉移（Deterministic） | 非確定性 / 隨機性（Stochastic / Dynamic） |
| **主體數量** | 單一 Agent（Single Agent） | 多 Agent 競爭與協作（Multi-Agent / Game Theory） |

---

## 2. 大模型輔助規劃的四大前沿範式

近年來，學界與業界探索出將 LLM 與符號規劃（Symbolic Planning）結合的四大核心範式：

```
                             [ Natural Language Goal & Domain ]
                                             |
                                             v
                           +-----------------------------------+
                           | Large Language Model (LLM Engine) |
                           +-----------------------------------+
                                             |
       +-----------------------+-------------+-------------+-----------------------+
       | Paradigm 1            | Paradigm 2                | Paradigm 3            | Paradigm 4
       v                       v                           v                       v
[ LLM-Guided PDDL ]   [ Subgoal Decomposition ]   [ Heuristic Code Synthesis ] [ Generalized Planning ]
(Model Generation &   (Symbolic Planner +         (Python Code Heuristics    (Program Generation &
 Env Feedback VAL)     LLM-Policy MCTS)            for Pyperplan/GBFS)        Automated Debugging)
```

### 範式一：LLM 導引 PDDL 自動生成與閉環修正（LLM-Guided PDDL Creation）

- **代表研究**：Mahdavi et al., NeurIPS 2024 (*LLM-Guided PDDL Creation and Refinement*)。
- **運作機制**：
  1. LLM 根據自然語言描述自動草擬 PDDL 領域模型（Domain）與問題定義（Problem）。
  2. 將生成的 PDDL 送入符號驗證工具（如 <information context="Validator for PDDL Plans">VAL</information>）與求解器（Fast Downward）進行環境模擬測試。
  3. 若發現語法錯誤或無法求解，將環境反饋資訊（Feedback）回傳給 LLM 進行疊代修正。
- **實證效果**：引入環境反饋閉環後，任務解決率大幅提升至 **66%**（遠高於僅靠 GPT-4 內部 Chain-of-Thought 推理的 29%）。

### 範式二：任務分解與 LLM-MCTS 混合子目標規劃（Task Decomposition & Subgoal Planning）

- **代表研究**：Kwon et al., ICRA 2025 (*Hybrid Symbolic + MCTS Planning*)。
- **運作機制**：
  1. LLM 發揮常識優勢，將複雜的高階目標分解為多個子目標（Subgoals）。
  2. 對於中等複雜度的子目標，交由傳統符號規劃器（Fast Downward）迅速精確求解。
  3. 當遇到符號代價過高或複雜度超出預期的子問題時，系統自動切換至基於 **蒙地卡羅樹搜尋（MCTS）** 的 LLM 規劃器，利用 LLM 作為 Rollout Policy（L-Policy）引導搜尋。
- **優勢**：結合了符號規劃的速度與 MCTS/LLM 在高維空間的突破能力，顯著降低規劃時間並提升擴展性。

### 範式三：LLM 領域專屬啟發式程式碼合成（Heuristic Generation via LLMs）

- **代表研究**：Corrêa et al., 2025 (ArXiv)。
- **運作機制**：
  1. 不直接讓 LLM 輸出動作序列，而是讓 LLM 閱讀 PDDL 領域規格後，**自動編寫 Python 語言實現的域專屬啟發式函數代碼**。
  2. 將合成的啟發式代碼動態載入至傳統古典規劃器（如 Pyperplan）中，搭配貪婪最佳優先搜尋（GBFS）引導搜尋方向。
- **優勢**：生成的啟發式大幅減少了搜尋過程中探索的狀態節點數，效能顯著超越標準的域獨立啟發式（Domain-Independent Heuristics）。

### 範式四：基於 LLM 的全自動泛化規劃（Generalized Planning in PDDL Domains）

- **代表研究**：Silver et al., AAAI 2024 (*Generalized Planning in PDDL Domains with Pretrained LLMs*)。
- **運作機制**：
  1. 給定 PDDL 領域描述與僅僅 2 個訓練任務範例。
  2. LLM 透過 CoT 提取領域內部的廣義解題策略，直接合成能解決該領域**任意新任務**的通用 Python 規劃程序（Solver-like Code）。
  3. 透過 Automated Debugging 閉環，根據驗證結果不斷 Prompt LLM 修正程式碼。
- **實證效果**：在 7 個標準 PDDL 領域中，僅需 2 個訓練任務，LLM 生成的通用程序效能即可媲美甚至超越傳統求解器基線。

---

## 3. 工業級規劃框架與開源生態

在理論研發之外，開源社群也推出了多項將現代規劃技術工程化的統一框架：

- **AIPlanning4EU (Unified Planning Library)**：歐洲 AI 規劃專案，提供統一的 Python 介面，讓開發者能以簡潔程式碼定義 Fluent 與 Action，並一鍵切換後端異構求解器（如 Fast Downward、Tamer 等）。
- **PANDA Framework**：德國烏爾姆大學開發的分層規劃框架（PANDA Network Decomposition Architecture），完整支援 HDDL（Hierarchical Domain Definition Language），其下的 **PANDADealer** 奪得 IPC 2023 分層規劃競賽冠軍。

---

## 4. 可信與負責任 AI 規劃與決策（Responsible AI）

隨著 AI Agent 開始接管醫療診斷推薦、自動駕駛、金融貸款審核與公共福利發放等高風險決策，**負責任 AI（Responsible AI）** 成為不可迴避的核心課題。

```
                    +------------------------------------+
                    |     Rational Decision Making       |
                    |  (Optimizing Objective & Utility)  |
                    +------------------------------------+
                                      |
         +----------------------------+----------------------------+
         | Trade-off & Balance                                     |
         v                                                         v
+---------------------------------+               +---------------------------------+
|      Performance Metrics        |               |      Responsible Features       |
|  - Accuracy & CTR / CVR         |               |  - Safety & Privacy             |
|  - Speed & Throughput           |               |  - Fairness & Transparency      |
|  - Resource Efficiency          |               |  - Accountability & Governance  |
+---------------------------------+               +---------------------------------+
```

### 4.1 可信 AI 的核心治理原則

一個具備理性與負責任特性的 Agent 系統，必須在設計中貫徹以下原則（參考 Russell & Norvig Ch. 27）：

1. **安全性（Safety）**：保證 Agent 執行的動作序列絕不會侵犯物理或邏輯安全邊界（ Fail-safe Mechanisms）。
2. **隱私保護（Privacy）**：在狀態感知與數據學習中嚴格保護用戶敏感資訊。
3. **公平性（Fairness）**：避免決策策略產生對特定群體的偏見或歧視。
4. **透明度與可解釋性（Transparency & Explainability）**：Agent 需能對其產生的規劃方案給出人類可理解的理由（Why this action sequence?）。
5. **問責制與歸因性（Accountability & Attribution）**：明確 Agent 決策鏈路中的責任歸屬。

### 4.2 準確度與負責任特性的權衡（Trade-offs）

在工程實踐中，系統設計者永遠面臨著**效能/準確度與負責任特性之間的權衡（Trade-off）**：
- 加入嚴格的隱私保護（如差分隱私）或可解釋性約束，可能會限制模型的表徵能力，帶來少許準確度下降。
- 引入安全審查與合規檢查機制，會增加推斷延遲與算力成本。

因此，負責任 AI 的決策不應是事後的補救措施，而必須**貫穿於軟體工程的完整生命週期（SDLC）**：從需求分析、架構設計、代碼實作、測試驗證，到上線後的運營監控與政策審查（Policy and Governance）。同時，全球立法趨勢（如歐盟 **EU AI Act**、美國 **AI Bill of Rights**）正逐步將這些原則轉化為具備法律約束力的強制規範。

<reviewkit>
<takeaways>
- **AI Agent 四代演進：** 從 1980s 符號 AI（規則/PDDL）、2000s 增強學習（試錯/獎勵）、2020s LLM Agent（ReACT/語言推理）走向 2030s 多 Agent 工具協作生態。理性 Agent 需完成感知、建模、推理、規劃與行動閉環。
- **LLM-Assisted Planning 四大範式：** （1）LLM+VAL 環境反饋閉環生成 PDDL（NeurIPS 2024，成功率 66%）；（2）LLM 任務分解 + MCTS/Fast Downward 混合規劃（ICRA 2025）；（3）LLM 合成 Python 啟發式代碼導引 GBFS（ArXiv 2025）；（4）LLM 基於 2 個範例生成通用 PDDL 解題程序（AAAI 2024）。
- **工業級開源生態：** AIPlanning4EU 提供 Unified Planning 統一介面；PANDA Framework（PANDADealer）主導了 HDDL 分層規劃競賽。
- **負責任 AI 治理（Responsible AI）：** 規劃與決策系統必須平衡效能（Accuracy/Speed）與可信特性（Safety, Privacy, Fairness, Transparency, Accountability）。負責任 AI 必須融入 SDLC 全生命週期，並對齊 EU AI Act 等全球監管法規。
</takeaways>
<qprompt/>
</reviewkit>

## 參考資料（References）

1. Mahdavi, S., et al. (2024). LLM-guided PDDL creation and refinement. In *Advances in Neural Information Processing Systems (NeurIPS 2024)*. [arXiv:2410.03570](https://arxiv.org/abs/2410.03570)
2. Kwon, M., et al. (2025). Hybrid symbolic and MCTS planning with large language models. In *IEEE International Conference on Robotics and Automation (ICRA 2025)*.
3. Silver, T., Dan, S., Srinivas, K., Tenenbaum, J. B., Kaelbling, L., & Katz, M. (2024). Generalized planning in PDDL domains with pretrained large language models. In *Proceedings of the AAAI Conference on Artificial Intelligence*, 38(18), 20006-20014. [arXiv:2305.11014](https://arxiv.org/abs/2305.11014)
4. Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., & Cao, Y. (2023). ReAct: Synergizing reasoning and acting in language models. In *International Conference on Learning Representations (ICLR)*. [arXiv:2210.03629](https://arxiv.org/abs/2210.03629)
