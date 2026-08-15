<meta>
Title: State Machine Replication and Paxos Structured Notes
CanonicalId: state-machine-replication-and-paxos-structured-notes
Tags: State Machine Replication, Paxos, Consensus, Distributed Systems
Summary: Structured study notes covering the fundamentals of State Machine Replication (SMR), FLP impossibility, Paxos algorithm details, correctness invariants, and practical execution issues.
Slug: state-machine-replication-and-paxos-structured-notes-en
Output: notes/state-machine-replication-and-paxos-structured-notes/state-machine-replication-and-paxos-structured-notes-en.html
Style: default
EstimatedReadingTime: true
Lang: en
TitleSuffix: false
Status: published
Published: 2026-06-25
LastModified: 2026-06-25
</meta>

<draft>
TLDR: Structured study notes on State Machine Replication and the Paxos consensus protocol, covering safety invariants, proposal numbering, the prepare/accept phases, and practical engineering challenges.
MainFlow: Start with the need for SMR and the FLP result, introduce the Paxos roles and terminology, walk through the algorithm mechanics (Prepare & Accept phases) with their safety invariants, discuss learning chosen values and liveness/leaders, and conclude with SMR integration and practical considerations.
Scope: State Machine Replication concept, FLP theorem, Paxos system model and properties, Proposers/Acceptors/Learners roles, Paxos two-phase algorithm details, proposal numbering disjoint sequences, P2a/b/c invariants, learning strategies, dueling proposers, leader optimization (PMMC intro), and SMR mapping.
OutOfScope: Deep mathematical proof of FLP, actual code implementation details of Paxos, or performance comparison with other consensus protocols (Raft/VSR).
FollowUps: Paxos Made Moderately Complex Structured Notes; Raft vs Paxos comparison.
</draft>

# State Machine Replication and Paxos Structured Notes

## State Machine Replication (SMR)

### The Goal of SMR
The goal of State Machine Replication (SMR) is to replicate a deterministic state machine across multiple nodes, ensuring that all replicas execute the same sequence of operations in the same order. 

We model these operations as a sequential log:
`Op1` $\rightarrow$ `Op2` $\rightarrow$ `Op3` $\rightarrow$ `Op4` $\rightarrow$ `Op5` $\rightarrow$ `Op6` $\rightarrow$ ...

### Limitations of Primary-Backup Models
In simpler setups (like basic primary-backup models):
- **Detecting Failures vs. Slowness:** It is extremely difficult to reliably distinguish a failed primary from a slow primary in an asynchronous network.
- **Split-Brain Risk:** If a backup incorrectly assumes the primary has failed and takes over, the system can end up with two primaries active at the same time, leading to state divergence.
- **View Server Bottleneck:** Using a central "view server" to declare who the primary is simply shifts the failure domain. What if the view server fails? Replicating the view server itself leads to an infinite regress.

**Conclusion:** To resolve this safely, we need a robust distributed consensus protocol.

<block>
title: The FLP Impossibility Result
content:
The **FLP Theorem** (Fischer, Lynch, and Paterson) states that in a fully asynchronous distributed system, with even a single faulty (crashed) process, no deterministic consensus protocol can guarantee progress (liveness) in bounded time.

Consequently, practical consensus protocols must make trade-offs: they choose to **guarantee safety under all asynchronous conditions** (never returning an incorrect result), and target **liveness under reasonable timing assumptions** (eventually resolving when network conditions stabilize).
</block>

---

## Paxos Overview

Paxos is a consensus protocol designed to reach agreement on a single value in an asynchronous network. It was originally proposed in Leslie Lamport's paper *"The Part-Time Parliament"*, using the metaphor of legislators passing numbered decrees.

### System Model Assumptions
- **Processes:** Processes can propose values, may crash, and may recover later.
- **Asynchronous Network:** Message delivery times are unbounded. Messages can be delayed, lost, or duplicated, but they are not corrupted (non-Byzantine environment).

### Logical Roles in Paxos
Nodes in a Paxos cluster can play one or more of three logical roles:
1. **Proposers:** Initiate proposals to choose a value.
2. **Acceptors:** Accept or reject proposals. A value is chosen when accepted by a majority of acceptors. They act as the fault-tolerant memory of the system.
3. **Learners:** Detect when a value has been chosen and learn what it is.

```
                  +-------------+
                  |  Proposers  |
                  +------+------+
                         | (Propose)
                         v
                  +------+------+
                  |  Acceptors  +<---> [Majority Quorum Intersection]
                  +------+------+
                         | (Learn)
                         v
                  +------+------+
                  |  Learners   |
                  +-------------+
```

### Consensus Properties
A correct consensus protocol must satisfy the following properties:
- **Safety:**
  - Only proposed values can be chosen.
  - Only a single value is chosen.
  - A process only learns a value if it has actually been chosen.
- **Liveness:**
  - Some proposed value is eventually chosen.
  - If a value is chosen, processes eventually learn it.

### Terminology
- **Value ($v$):** A candidate value proposed for consensus.
- **Proposal Sequence Number (psn / $n$):** A unique, monotonically increasing number.
- **Proposal ($n, v$):** A pair combining a proposal sequence number and a value.
- **Accept:** An acceptor agrees to a proposal.
- **Chosen:** A proposal $(n, v)$ is accepted by a majority of acceptors.
- **Learned:** A learner discovers that a proposal has been chosen.

### Why Majorities (Quorums)?
A majority is defined as more than half of the acceptors ($> N/2$).
- **Intersection Property:** Any two majorities of the same set must intersect by at least one acceptor.
- **Information Propagation:** Since any two majorities share at least one acceptor, this intersection ensures that information about a chosen value is preserved and propagated to any subsequent majority quorum.

---

## Designing Paxos: Invariants & Requirements

### The Path to Consensus Invariants

#### Naive Approach
- **Single Acceptor:** If there is only one acceptor, fault tolerance is lost. If that acceptor crashes, the system stops.

#### Improved Approach
- **Majority Acceptance:** A value is chosen only when it is accepted by a majority of acceptors.

<callout>
icon: alert-circle
style: warning
title: Requirement P1 (The Initial Acceptor Requirement)
content:
An acceptor must accept the first proposal it receives.
</callout>

- **The Problem:** If multiple proposers send conflicting proposals at the same time, acceptors might split their votes such that no single value receives a majority. The system could get stuck.

### Proposal Numbers
To handle multiple proposers without deadlock, we must allow multiple proposals to be made. However, we must guarantee that only a single value is ultimately chosen.
- Each proposal is assigned a unique, increasing **proposal sequence number (psn)**.
- A proposal is represented as the pair $(n, v)$.
- A proposal is chosen when it is accepted by a majority of acceptors.

To prevent collisions, proposal numbers must be unique and unbounded. We can achieve this by assigning disjoint sequences to different proposers.
For example, Proposer $i$ out of $N$ total proposers uses the sequence:
$$i,\; i+N,\; i+2N,\; i+3N,\; \dots$$

### Ensuring a Single Chosen Value (P2)

To ensure safety, we must guarantee that even if multiple proposals are accepted, they all carry the same value once a value has been chosen.

<callout>
icon: shield
style: regular
title: Invariant P2
content:
If a proposal $(n, v)$ is chosen, then any higher-numbered chosen proposal must also have the value $v$.
</callout>

To implement P2, we strengthen it into conditions that are easier to enforce programmatically:

<callout>
icon: check-square
style: regular
title: Invariant P2a
content:
If a proposal $(n, v)$ is chosen, then any higher-numbered accepted proposal must have the value $v$.
</callout>

Since proposers issue proposals, we can restrict the proposers directly by strengthening the invariant further:

<callout>
icon: check-square
style: regular
title: Invariant P2b
content:
If a proposal $(n, v)$ is chosen, then any higher-numbered proposal issued by any proposer must have the value $v$.
</callout>

To make P2b checkable without knowing the future, we define a structural invariant **P2c**:

<callout>
icon: key
style: regular
title: Invariant P2c (The Implementation Invariant)
content:
For any proposal $(n, v)$, there exists a majority quorum of acceptors $S$ such that:
- Either no acceptor in $S$ has accepted a proposal numbered less than $n$.
- Or $v$ equals the value of the highest-numbered accepted proposal numbered less than $n$ among all acceptors in $S$.
</callout>

This invariant guarantees P2b, which in turn guarantees P2a, ensuring safety.

### Core Idea to Implement P2c
To satisfy P2c without predicting which values will be accepted in the future, the protocol uses a **promise mechanism**:
- A proposer requests a **promise** from a majority of acceptors.
- The promise states that the acceptors will **not accept** any proposals numbered less than $n$.
- Acceptors also return the highest-numbered proposal they have accepted so far.

---

## The Paxos Algorithm

The Paxos protocol operates in two phases:

### Phase 1 (Prepare Phase)

1. **Proposer Selection:** The proposer selects a new, unique proposal number $n$.
2. **Prepare Request:** The proposer sends a `<prepare, n>` request to a majority of acceptors.
3. **Acceptor Response:** An acceptor responds to the `<prepare, n>` request if and only if $n$ is strictly greater than any prepare number it has previously responded to. The response contains:
   - A **promise** not to accept any future proposals numbered less than $n$.
   - The **highest-numbered proposal** (if any) that the acceptor has accepted so far, along with its value.

### Phase 2 (Accept Phase)

1. **Value Selection:** If the proposer receives responses from a majority of acceptors, it selects a value $v$:
   - Let $v$ be the value of the highest-numbered accepted proposal returned by the acceptors.
   - If no acceptor in the majority has accepted a proposal yet, the proposer is free to choose any value $v$.
2. **Accept Request:** The proposer sends an `<accept, n, v>` request to those acceptors.
3. **Acceptor Decision:** An acceptor accepts the `<accept, n, v>` proposal unless it has already responded to a higher-numbered prepare request (which would violate its promise).

**A value is chosen when a majority of acceptors accept the proposal $(n, v)$.**

---

## Learning & Liveness

### Learning Chosen Values
Once a value is chosen, how do learners find out?
1. **Direct Notification:** Each acceptor informs all learners whenever it accepts a proposal. This requires $O(A \times L)$ messages, where $A$ is the number of acceptors and $L$ is the number of learners.
2. **Distinguished Learner:** Acceptors send acceptance notifications to a distinguished learner (or a small set of them). The distinguished learner then broadcasts the decision to the rest of the learners. This reduces message complexity to $O(A + L)$, but introduces a single point of failure.

If a learner misses a decision due to message loss or node crashes, it can propose a dummy value (e.g., a no-op) to force the Paxos instance to complete, thereby discovering what value was chosen.

### Liveness and the FLP Result
Under dueling proposers, liveness is not guaranteed. Two competing proposers can continuously preempt each other's prepare phases before either can complete Phase 2:
$$\text{Proposer 1 prepare } (n_1) \rightarrow \text{Proposer 2 prepare } (n_2 > n_1) \rightarrow \text{Proposer 1 accept fails} \rightarrow \dots$$

**Solution:** Elect a single **distinguished proposer (leader)**.
- If only one proposer is active, it can complete both phases without interference.
- This reduces contention and ensures liveness in practice.

---

## Integrating Paxos with State Machine Replication (SMR)

To build a replicated log, we run an independent instance of the Paxos algorithm for each log slot.

```
Slot 1: Paxos Instance 1  ---> Decided: Put k1 v1
Slot 2: Paxos Instance 2  ---> Decided: Put k2 v2
Slot 3: Paxos Instance 3  ---> Decided: Get k1
```

- Each state machine operation is assigned to a specific log index (Paxos instance).
- Once consensus is reached on a slot, it is appended to the replicated log.
- Replicas execute the operations in strict log order.

### Practical Engineering Challenges
- **Two Communication Rounds:** Running both Phase 1 and Phase 2 for every single operation is slow.
- **Log Gaps:** If slot 3 is chosen but slot 2 is still empty (due to message loss or leader crashes), the state machine cannot execute slot 3 until the gap at slot 2 is resolved.
- **Choosing Slot Positions:** Which instance index should a proposer use when a new command arrives?
- **Leader Election:** How do we establish a stable leader?

### Paxos Made Moderately Complex (PMMC) Approach
To optimize performance and handle practical issues:
- **Phase 1 Amortization:** The leader runs Phase 1 for *all* future instances at once to establish its leadership.
- **Phase 2 Fast Path:** For subsequent client requests, the active leader runs only Phase 2, reducing the message rounds per command.
- **Leader Failure Recovery:** If the leader crashes, another node runs Phase 1 to elect itself and learn the state of all unresolved instances.

---

## Summary

- **Primary-backup is insufficient** on its own without a consensus mechanism due to the risk of split-brain in asynchronous networks.
- **FLP Impossibility** shows that deterministic consensus cannot guarantee both safety and liveness in a fully asynchronous system with crash failures.
- **Paxos ensures safety** under all conditions through:
  - **Majority Intersection:** Ensuring any two quorums share at least one node.
  - **Proposal Numbering:** Maintaining order and disjoint proposer sequences.
  - **Two-Phase Protocol:** Collecting state and promising not to look back before choosing a value.
- **Liveness** is achieved in practice by electing a single leader.
- **State Machine Replication** is achieved by running an instance of Paxos per log slot, building a replicated log that all nodes execute in the same order.

<reviewkit>
<takeaways>
- **Primary-backup is insufficient** on its own without a consensus mechanism due to the risk of split-brain in asynchronous networks.
- **FLP Impossibility** shows that deterministic consensus cannot guarantee both safety and liveness in a fully asynchronous system with crash failures.
- **Paxos ensures safety** under all conditions through:
</takeaways>
<qprompt/>
</reviewkit>
