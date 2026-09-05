<meta>
Title: AI Planning Fundamentals: From Sensing-Acting Loops and State-Space Search to Responsible AI Governance
Summary: A comprehensive exploration of AI Planning problem formulation, perception-action loops, state-space search algorithms, problem complexity matrices, agent evolution (1980s-2030s), DeepMind PushWorld physical reasoning benchmark, LLM probabilistic limitations and deterministic tool fusion, 7 real-world application domains, AIPlanning4EU unified library, IPC 2023 competition benchmarks, transition to decision making under uncertainty (Utility Theory, MDPs, RL), Responsible AI principles, non-technical challenge dimensions, and lifecycle governance frameworks.
Slug: ai-planning-fundamentals-sensing-acting-and-search
Output: notes/ai-planning-fundamentals-sensing-acting-and-search/ai-planning-fundamentals-sensing-acting-and-search.html
CanonicalId: ai-planning-fundamentals-sensing-acting-and-search
Style: default
EstimatedReadingTime: true
Lang: en
Tags: ai planning, ai agents, classical planning, automated planning
Status: drafting
Published: 2026-08-29
LastModified: 2026-09-05
</meta>
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

# AI Planning Fundamentals: From Sensing-Acting Loops and State-Space Search to Responsible AI Governance

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
