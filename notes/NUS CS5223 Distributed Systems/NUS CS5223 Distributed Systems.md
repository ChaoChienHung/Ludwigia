<meta>
Title: NUS CS5223: Distributed Systems
Summary: Comprehensive lecture and study notes for NUS CS5223 Distributed Systems, covering distributed system models, fault tolerance, replication, consistency, and consensus protocols.
Slug: nus-cs5223-distributed-systems
Output: notes/NUS CS5223 Distributed Systems/NUS CS5223 Distributed Systems.html
CanonicalId: nus-cs5223-distributed-systems
Style: default
EstimatedReadingTime: true
Lang: en
Tags: Distributed Systems, Consensus, Fault Tolerance, System Architecture
Status: drafting
Published: 2026-09-12
LastModified: 2026-09-12
</meta>

NUS CS5223 Distributed Systems
Slide 1
- What is a distributed system
  - Multiple interconnected computers
  - Cooperate to provide a single service
  - Appear to users as one coherent system

- Why build distributed systems
  - Higher capacity and performance
    - Modern workloads exceed a single machine’s limits
    - Aggregate CPU, GPU, memory, storage, and network bandwidth
  - Geographic distribution
    - Connect systems across different locations
  - Reliability and availability
    - Build always-on systems
    - Continue operating despite unreliable individual components

- Key challenges in distributed systems design
  - System design and architecture
  - Fault tolerance
    - Different failure models
    - Different types of failures
  - Consistency and correctness
    - Maintain correct distributed state
  - Performance
    - Latency, throughput, scalability
  - Security
  - Testing and debugging
  - Risk of making systems less scalable and less reliable than centralized ones

- Goal of distributed systems
  - Improve scalability
  - Improve reliability
  - Despite inherent complexity and failures

- Challenge 1: Failures
  - Partial failures are the norm
  - Systems must continue doing useful work despite failures
  - Data center reality
    - Hundreds of thousands of servers, disks, switches, and cables
    - Some component is always failing
  - Observation
    - Large distributed systems still work most of the time
    - Available globally and concurrently for many users

- Challenge 2: Managing distributed state
  - Availability
    - Replicate data to tolerate failures
  - Performance
    - Replicate popular data closer to users
  - Scale
    - Partition data across multiple machines
  - Consistency
    - Ensure replicas agree on data values

- Subtleties of distributed state
  - Replication seems simple but is difficult to do correctly
  - Failure scenarios
    - One replica fails
    - One replica believes another has failed
    - Both replicas believe the other has failed
  - Leads to ambiguity and inconsistency

- Thought experiment: Two-Generals Problem
  - Two generals must coordinate an attack
  - Communication via unreliable messenger
  - Messages can be lost
  - Result
    - No protocol can guarantee agreement
    - Any last confirmation message could be lost
  - Key insight
    - Certain coordination problems are provably impossible

- Implications for distributed systems
  - Distributed systems are fundamentally hard
  - Some problems are provably impossible
    - Consensus
    - Perfect failure detection
    - Always-consistent and always-available storage (CAP theorem)
  - Practical systems work by
    - Making assumptions about the environment
    - Accepting trade-offs

- Communication in distributed systems
  - Nodes must exchange information
  - Options
    - Explicit message passing
    - Higher-level abstractions

- Common abstraction: client/server model
  - Clients request services
  - Servers process requests and return results

- Local (single-host) procedure calls
  - Function calls execute in the same address space
  - Example
    """
    float balance(int accountID) {
        return balance[accountID];
    }

    void deposit(int accountID, float amount) {
        balance[accountID] += amount;
        return OK;
    }

    client() {
        deposit(42, 50.00);
        print balance(42);
    }
    """

- Distributed version with explicit messaging
  - Define message formats and protocols
  - Manual marshalling and unmarshalling
  - Client and server code tightly coupled to protocol
  - High boilerplate and error-prone

- Problems with hand-coded messaging
  - Hard-coded message formats
  - Repetitive boilerplate code
  - Increased complexity and maintenance burden

- Remote Procedure Call (RPC)
  - Abstraction to simplify communication
  - Makes remote calls look like local function calls
  - Automatically handles
    - Marshalling and unmarshalling
    - Message sending and receiving

- RPC approach
  - Protocol compiled into stubs
  - Client stub
    - Packages arguments
    - Sends request
    - Waits for reply
    - Unpacks response
  - Server stub
    - Receives request
    - Unpacks arguments
    - Calls local procedure
    - Sends response

- RPC usage example
    """
    client() {
        RPC_deposit(server, 42, 50.00);
        print RPC_balance(server, 42);
    }
    """

- Benefits of RPC
  - Hides remote messaging complexity
  - Simplifies distributed programming
  - Familiar programming model

- RPC does not eliminate all complexity
  - Remote calls can fail
  - Failure scenarios
    - Message loss
    - Client crash
    - Server crash
    - Server crashes after executing but before replying
    - Server is slow but appears crashed
    - Network partitions

- RPC semantics
  - Semantics define the meaning of an RPC call
  - Specifies what guarantees the system provides

- RPC semantics: at-least-once
  - Server executes procedure one or more times
  - Client retries until it gets a response
  - Useful when
    - Operations are idempotent
  - Not suitable when
    - Duplicate executions cause incorrect behavior

- RPC semantics: at-most-once
  - Procedure executed at most one time
  - May be executed zero times if failures occur
  - Implementation
    - Client includes unique request ID
    - Server tracks processed requests and their results
    - Duplicate requests return cached results

- Managing RPC history
  - Server must eventually discard old request records
  - Options
    - Never discard (impractical)
    - Use client IDs and sequence numbers
      - Client acknowledges received replies
    - Allow only one outstanding RPC per client
      - Arrival of next sequence allows cleanup
  - Lab 1 approach
    - One outstanding RPC per client

- RPC semantics: exactly-once
  - Desired semantics
    - Operation executed exactly one time
  - Conceptual approach
    - At-most-once + retries until success
  - Reality
    - Impossible in general
    - Cannot distinguish between
      - Server crashing before execution
      - Server crashing after execution but before reply

- Key takeaway
  - Distributed systems rely on abstractions like RPC
  - Failures and uncertainty cannot be fully hidden
  - System design requires careful semantic choices and trade-offs
Implementing Remote Procedure Calls
Remote Procedure Calls (RPC) - Structured Notes

General Concept:
- RPC allows programs to communicate across a network using a high-level language paradigm.
- It extends the concept of a local procedure call to a distributed environment.
- When a remote procedure is called:
  - The caller is suspended.
  - Parameters are sent to the callee.
  - The procedure executes on the callee machine.
  - Results are sent back, resuming execution on the caller machine.
- Other processes on the caller machine may continue to execute during the suspension.

Advantages of RPC:
- Clean and simple semantics for building distributed systems.
- Potentially efficient communication.
- General mechanism: procedures are the primary communication method in single-machine computations.

Historical Context:
- RPC concept discussed publicly since at least 1976.
- Notable systems: Courier (Xerox NS), MIT research.
- Full-scale implementations were rare prior to this work.

Major Design Issues:
- Call semantics in the presence of machine and network failures.
- Handling address-containing arguments without a shared address space.
- Integration with programming systems.
- Binding: locating the callee.
- Protocols for data and control transfer.
- Data integrity and security in open networks.

Environment:
- RPC package built for Cedar programming environment.
- Used on Xerox research internetwork (many 3 Mb/s and 10 Mb/s Ethernets connected via leased lines/satellite links).
- Dominant language: Mesa (other languages: Smalltalk, InterLisp).
- Most computers are Dorados:
  - Single-user, powerful workstations.
  - 24-bit virtual address space.
  - 80 MB disk.
  - Simple Algol-style call < 10 μs.
- Communication via PUP protocols:
  - Unreliable datagram service.
  - Reliable flow-controlled byte streams.
  - Direct Ethernet access available.

Aims:
- Primary aim: simplify distributed computation by making communication as easy as local procedure calls.
- Secondary aims:
  - High efficiency: communication cost within ~5x network transmission time.
  - Powerful semantics without sacrificing simplicity or efficiency.
- Security aim: support secure communication (data protection, password security).

Fundamental Design Decisions:
- Procedure call paradigm chosen due to alignment with the Mesa language.
- Message passing or remote fork paradigms considered but not chosen.
- Shared address space discarded due to complexity and potential inefficiency.
- Principle: RPC semantics should closely mirror local procedure calls.
  - No timeout for remote calls (local calls have none).
  - Aborting activities handled by parallel processing mechanisms of the language.
- Binding semantics follow Cedar mechanisms, not Nelson's thesis.

Key Observations:
- RPC is intended to hide network complexities from programmers.
- Emphasis on minimal load on server machines and high performance.
- Average Ethernet packet round trip: 120 μs (10 Mb/s Ethernet).
- Design decisions prioritize programmer ease-of-use over experimental distributed computing optimizations.

References to Performance & Implementation Details:
- System includes facilities for:
  - Client binding.
  - Transport-level communication protocol.
  - Optimizations to reduce server load and improve speed.
- Subsequent papers planned for:
  - Encryption-based security.
  - Stub module generation.
  - Practical usage experiences.

Remote Procedure Calls (RPC) - Structured Notes (Sections 1.5 & 2)

Program Structure:
- RPC uses the concept of stubs to mediate remote procedure calls.
- Five components involved in a remote call:
  1. User (caller code)
  2. User-stub (proxy on caller machine)
  3. RPCRuntime (communication package)
  4. Server-stub (proxy on callee machine)
  5. Server (callee code)
- Call Flow:
  - User makes a normal local call to user-stub.
  - User-stub packages procedure specification and arguments into packets.
  - RPCRuntime transmits packets reliably to callee machine.
  - RPCRuntime on callee passes packets to server-stub.
  - Server-stub unpacks arguments and calls the server procedure locally.
  - Results return through server-stub → RPCRuntime → user-stub → user.
- RPCRuntime Responsibilities:
  - Packet transmission and routing.
  - Retransmissions and acknowledgments.
  - Encryption (optional).
- User and server code are written by programmers; stubs are automatically generated by Lupine.
- Interface Modules:
  - Define procedure names and argument/result types.
  - Exporters implement procedures; importers call procedures.
  - Interface modules allow compile-time type checking and automatic stub generation.
- Programmer tasks:
  - Write user and server code.
  - Avoid incompatible arguments/results (checked by Lupine).
  - Invoke intermachine binding.
  - Handle machine or communication failures.

Binding:
- Two aspects:
  1. Naming: specifying which interface to bind to.
  2. Location: determining the callee machine and procedure.

Naming:
- RPC binds an importer to an exporter.
- Interface Name:
  - Type: abstract interface expected by caller (e.g., "MailServer").
  - Instance: specific implementation desired (e.g., "Ebbets.Alpine").
- Default type name: derived from Mesa interface module name.
- Interface naming is an agreement between exporter and importer; RPC does not enforce semantics.

Locating an Exporter:
- Uses Grapevine distributed database.
  - Grapevine:
    - Multiple replicated servers for reliability.
    - Database entries: individuals (connect-site = network address) and groups (member list of RNames).
- RPC stores two Grapevine entries per interface:
  1. Type: Grapevine group (all instances of that type).
  2. Instance: Grapevine individual (network address of machine exporting the interface).
- Example:
  - Type: FileAccess.Alpine
  - Instances: Ebbets.Alpine → 3#22#, Luther.Alpine → 3#276#
  - Grapevine group FileAccess.Alpine members: Ebbets.Alpine, Luther.Alpine

Exporting an Interface:
- Server-stub calls RPCRuntime's ExportInterface with:
  - Interface name (type, instance)
  - Dispatcher procedure (handles incoming calls)
- RPCRuntime updates Grapevine database:
  - Ensures instance is a member of type group.
  - Sets instance connect-site to exporting machine's address.
- Maintains local table of exports:
  - Interface name, dispatcher, 32-bit unique identifier.
  - Unique identifier generated using 32-bit counter based on real-time clock.
- Guarantees uniqueness, provides implicit unbinding on exporter crash.

Importing an Interface:
- User-stub calls RPCRuntime's ImportInterface with type and instance.
- RPCRuntime queries Grapevine for network address of instance.
- Makes RPC to callee's RPCRuntime to retrieve binding information.
- If exporter available:
  - Returns table index and unique identifier to importer.
- User-stub stores exporter address, table index, unique identifier for future calls.
- Call packets include:
  - Unique identifier, table index, entry point number.
- Callee RPCRuntime verifies identifier and dispatches to correct procedure.

Binding Variants:
- Dynamic binding by type only:
  - RPCRuntime selects closest available instance from Grapevine group.
- Binding by type and instance (RName):
  - Delays machine choice; dynamic selection possible.
- Binding by network address:
  - Fixed at compile-time; bypasses Grapevine.
- Multi-instance dynamic binding:
  - Importer can bind to multiple exporters when number of machines is unknown.
- Binding is at interface granularity (no finer-grain binding allowed).

Binding Benefits:
- Importing does not modify exporter machine data structures → scalable to many clients.
- Unique identifier scheme ensures bindings break on exporter crash.
- Calls allowed only on explicitly exported procedures → security and access control enforced.
- Grapevine access control:
  - Restricts who can export interfaces.
  - Supports secure identification of service instances.

3. PACKET-LEVEL TRANSPORT PROTOCOL

3.1 Requirements

- RPC semantics could be implemented using existing protocols (e.g., PUP byte streams, NS sequenced packet protocols), but experiments showed poor performance.
- Specialized transport protocol for RPC can improve performance by up to 10×.
- RPC communication is request-response oriented and typically involves short calls, unlike bulk data transfers.
- Protocol design goals:
  - Minimize elapsed real-time from initiating a call to receiving results.
  - Minimize server load under high client concurrency.
  - Maintain RPC semantics similar to local procedure calls:
    - If a call returns successfully, server executed it exactly once.
    - If communication fails, procedure may have executed 0 or 1 times; caller is notified via exception.
    - Deadlocks or infinite loops in server code are not bounded; only communication failures abort the call.

3.2 Simple Calls

- Typical case: all arguments and results fit in a single packet each.
- Call flow:
  - Caller sends call packet containing:
    - Call identifier
    - Procedure identifier (from binding)
    - Arguments
  - Callee invokes procedure.
  - Callee sends result packet containing same call identifier and results.
- Retransmission and acknowledgment:
  - Sender retransmits until acknowledgment is received.
  - Short calls: typically only 2 packets per call (1 call, 1 result).
- Call identifier structure:
  - Machine identifier (globally unique)
  - Process identifier (machine-relative)
  - Sequence number (monotonic per activity)
- Duplicate suppression:
  - Server maintains table of last sequence number per calling activity.
  - Older call packets are discarded as duplicates.
- Connection handling:
  - No explicit connection setup or teardown.
  - Connection exists as shared state between caller activity and server RPCRuntime.
  - Idle connections consume minimal state and require no maintenance.

3.3 Complicated Calls

- Arguments/results larger than one packet:
  - Multiple packets sent.
  - Each packet (except last) requests explicit acknowledgment.
  - Caller sends argument packets; callee sends acknowledgment packets.
  - Call-relative sequence numbers used to eliminate duplicates.
- Handling long-duration calls or large gaps:
  - Caller sends periodic probe packets to detect callee crashes or network failures.
  - Probe interval grows gradually (e.g., up to one every 5 minutes after 10 minutes).
  - Caller waits indefinitely if probes acknowledged.
- Trade-offs:
  - Extra acknowledgments increase packet count (up to 2× more than bulk protocols).
  - Protocol optimized for RPC semantics rather than bulk data transfer.

3.4 Exception Handling

- Mesa language exceptions (signals):
  - Dynamically scan call stack for catch phrase.
  - Catch phrase can return results or terminate by jumping out.
- RPC implementation:
  - Server sends exception packet instead of result packet.
  - Caller RPCRuntime raises exception locally and executes catch phrase.
  - Results can be returned to callee or callee unwinds procedure activations if catch phrase terminates abruptly.
- Constraints:
  - Only exceptions defined in Mesa interface module are transmitted.
  - Maintains single-machine convention, simplifies implementation, aids debugging.
- Communication exceptions:
  - RPCRuntime raises call-failed exception for communication failures.
  - Clients can distinguish remote calls from local calls.

Key Concepts

- Efficiency prioritized for short, frequent RPCs rather than bulk transfers.
- Minimal state maintained for idle connections.
- Duplicate detection based on sequence numbers and unique machine/process identifiers.
- Exception semantics mirror local procedure calls.
- Acknowledgment strategy balances efficiency and correctness, especially for multi-packet calls.

Packet Flow (Summary)

- Simple calls: 2 packets per call (call → result).
- Complicated calls: multiple packets for arguments/results, acknowledgments requested for all but last packet.
- Long calls: periodic probe packets to detect failures.
- Sequence numbers and conversation identifiers ensure uniqueness and duplicate suppression.

3.5 Use of Processes

- Mesa and Cedar provide built-in parallel processes; process creation and swaps are inexpensive locally.
  - Forking a process ≈ 10 local procedure calls.
  - Process swap involves swapping evaluation stack, one register, invalidating some cached info.
- For RPC, process creation and swaps can become significant costs.
- Optimization strategy:
  - Maintain a stock of idle server processes on each machine to handle incoming calls.
  - Server processes revert to idle after finishing a call.
  - Excess idle processes terminate themselves.
- Packet process identifiers:
  - Each packet contains source and destination process identifiers.
  - Caller sets source to calling process; callee sets source to handling server process.
  - Incoming packets are dispatched to waiting process if possible; otherwise, assigned to idle server process.
- Caller activity tries to reuse the same destination server process for subsequent calls.
- Typical simple calls require only four process swaps:
  - Minimum is two (unless busy-waiting).
  - Extra two swaps due to interrupt handler dispatch instead of device microcode.

3.6 Other Optimizations

- Optimizations already implemented:
  - Implicit acknowledgment of previous packets using subsequent packets.
  - Minimized costs for connection maintenance, establishment, and termination.
  - Reduced number of process swaps per call.
- Additional performance gains:
  - Bypassing standard protocol layers for RPC packets on the same network.
  - Gains from treating RPC as a special case in the network driver.
- Optimizations not used due to inconvenience or diminishing returns:
  - Avoiding internet packet format for local networks.
  - Specialized packet formats for simple calls.
  - Special-purpose network microcode.
  - Restricting non-RPC communication.
  - Busy-waiting to save process swaps.

3.7 Security

- RPC package supports encryption-based security.
- Uses Grapevine for authentication/key distribution.
- Federal Data Encryption Standard (DES) applied.
- Guarantees:
  - Caller and callee identity verification.
  - End-to-end encryption of calls and results.
  - Protection against eavesdropping, modification, replay, and creation of calls.
- Details deferred to a later paper.

4. Performance

- Tests conducted on two Dorado machines connected via Ethernet (2.94 Mbps), lightly loaded (5-10%).
- Measurement methodology:
  - Measured elapsed times from user-stub invocation to return.
  - Includes user-stub, RPCRuntime, server-stub, server procedure, and network transmission.
- Performance results (microseconds):

  Procedure                   | Min   | Median | Transmission | Local-only
  ----------------------------|-------|--------|--------------|------------
  no args/results             | 1059  | 1097   | 131          | 9
  1 arg/result                | 1070  | 1105   | 142          | 10
  2 args/results              | 1077  | 1127   | 152          | 11
  4 args/results              | 1115  | 1171   | 174          | 12
  10 args/results             | 1222  | 1278   | 239          | 17
  1 word array                | 1069  | 1111   | 131          | 10
  4 word array                | 1106  | 1153   | 174          | 13
  10 word array               | 1214  | 1250   | 239          | 16
  40 word array               | 1643  | 1695   | 566          | 51
  100 word array              | 2915  | 2926   | 1219         | 98
  resume exception            | 2555  | 2637   | 284          | 134
  unwind exception            | 3374  | 3467   | 284          | 196

- Observations:
  - RPC handles small and frequent calls efficiently.
  - For large data transfers, other protocols may transmit fewer packets, but RPC can interleave parallel calls to achieve high throughput (~2 Mbps on 3 Mbps Ethernet).
  - Encryption not enabled during measurements.

5. Status and Discussions

- RPCRuntime fully implemented, about 2,200 lines across 4 Cedar modules (packet exchange, sequencing, binding, security).
- Lupine stub generator is larger.
- RPC in use for:
  - Alpine file server (multimachine transactions)
  - Ethernet-based telephone/audio project
  - Network games
- Implemented for BCPL, InterLisp, SmallTalk, C.
- RPC convenience and efficiency confirmed by users.
- RPC may not be suitable for multicast/broadcast scenarios.
- High-performance RPC may encourage new distributed applications.
- Uncertainty remains whether a general-purpose transport protocol could match the RPC-specific performance without sacrificing bulk transfer efficiency.
- Achieved efficient connection management, low state maintenance, and simple but powerful binding semantics.
Time, Clocks, and the Ordering of Events in a Distributed System

Concept of Time
- Time is fundamental to human thinking and is derived from the order of events.
- We say an event happened at a specific time if it occurred after the clock read that time and before it read the next unit.
- Temporal ordering is crucial for system operations (e.g., airline reservations depend on request time relative to flight availability).

Distributed Systems
- A distributed system consists of multiple spatially separated processes that communicate via message exchange.
- Examples: ARPANET, networks of interconnected computers.
- Single computers can also be treated as distributed systems with separate processes (CPU, memory, I/O channels).
- A system is considered distributed if message transmission delay is significant compared to time between events in a process.
- Multiprocessing systems face similar issues due to unpredictable event ordering.

Event Ordering in Distributed Systems
- In distributed systems, it may be impossible to definitively say which of two events occurred first.
- "Happened before" is a partial ordering of events in the system.
- Problems arise if this partial ordering is not properly considered.

Partial Ordering ("Happened Before" Relation)
- Defined without physical clocks.
- Each process consists of a sequence of events.
- Events in a single process are totally ordered (a occurs before b if a precedes b in the sequence).
- Sending or receiving a message is considered an event.
- "Happened before" relation (denoted a ---> b) is defined as the smallest relation satisfying:
  1. If a and b are events in the same process and a occurs before b, then a ---> b.
  2. If a is the sending of a message by one process and b is the receipt of that message by another process, then a ---> b.
  3. If a ---> b and b ---> c, then a ---> c.
- Two events a and b are concurrent if a -/-> b and b -/-> a.
- a ---> a is not allowed (irreflexive), making ---> an irreflexive partial ordering.
- Diagrammatic representation: 
  - Horizontal axis: space (processes)
  - Vertical axis: time (later events higher)
  - Dots: events, vertical lines: processes, wavy lines: messages
- Causal interpretation: a ---> b means event a can causally affect event b. Concurrent events cannot causally affect each other.

Logical Clocks
- A clock Ci assigns a number Ci(a) to any event a in process Pi.
- The system-wide clock function C assigns C(b) = Cj(b) if b is in process Pj.
- Clocks are logical (abstract counters), not tied to physical time.

Clock Correctness
- Definition based on event ordering rather than physical time.
- Clock Condition: For events a, b:
  - If a ---> b, then C(a) < C(b)
- Conditions ensuring Clock Condition:
  C1. For events a and b in process Pi: if a occurs before b, then Ci(a) < Ci(b)
  C2. If a is the sending of a message by Pi and b is the receipt of that message by Pj, then Ci(a) < Cj(b)
- The converse of the Clock Condition does not hold due to concurrent events potentially having different logical times.

Applications
- Partial ordering can be extended to a consistent total ordering using distributed algorithms.
- Useful for solving synchronization problems in distributed systems.
- Real physical clocks can be synchronized to avoid discrepancies between perceived and algorithmic event ordering.

Notes on Representation
- Choice of what constitutes an event affects ordering (e.g., message receipt may involve interrupts or subprograms).
- Messages may be received out of order.
- Diagrams help visualize causal relationships and concurrency.

Logical Clocks and Event Ordering in Distributed Systems

1. Space-Time Diagram Representation
   - Process clocks "tick" between events.
     - Example: If events a and b in process Pi have Ci(a)=4 and Ci(b)=7, ticks 5, 6, 7 occur between them.
   - Tick lines: dashed lines connecting like-numbered ticks across processes.
   - Conditions for clocks:
     - C1: A tick line must exist between any two events on a process line.
     - C2: Every message line must cross a tick line.
   - Tick lines can be treated as time coordinate lines in a Cartesian system.
   - Space-time diagrams can be redrawn with straightened coordinate lines without changing event relationships.

2. Logical Clock Implementation
   - Each process Pi has a clock Ci (register) that changes between events.
   - Implementation rules to satisfy Clock Condition:
     - IR1: Increment Ci between consecutive events on Pi.
     - IR2:
       - (a) Message sending: message m contains timestamp Tm = Ci(a).
       - (b) Message receiving: process Pi sets Ci ≥ max(Ci, Tm).
   - IR1 and IR2 guarantee the Clock Condition.

3. Total Ordering of Events
   - Events are ordered using clock values Ci(a) and Ci(b) and an arbitrary total process order <.
   - Relation "~" defined as:
     - a ~ b if Ci(a) < Cj(b), or if Ci(a) = Cj(b) and Pi < Pj.
   - This yields a total ordering extending the "happened-before" relation (-->).
   - Different clocks satisfying the Clock Condition can produce different total orderings.

4. Mutual Exclusion Problem
   - System: multiple processes sharing a single resource.
   - Requirements:
     - I: Resource must be released before another process is granted access.
     - II: Requests are granted in order of issuance.
     - III: Every request is eventually granted if all granted processes eventually release the resource.
   - Distributed algorithm using logical clocks:
     - Assumptions:
       - Messages sent from Pi to Pj are received in order.
       - Every message is eventually received.
       - Processes can send messages to all others.
     - Each process maintains a private request queue.
     - Algorithm rules:
       1. Request: Pi sends Tm:Pi requests resource to all processes and queues it.
       2. Receive request: Pj queues it and sends acknowledgment to Pi.
       3. Release: Pi removes request from queue and sends Pi releases resource message.
       4. Receive release: Pj removes Pi's request from queue.
       5. Granting resource:
          - (i) Pi's request is first in its queue by "~" order.
          - (ii) Pi has received messages from all processes with timestamps > Tm.

5. State Machine Representation
   - State Machine components:
     - C: set of commands (Pi requests/release resource)
     - S: possible states (queue of requests)
     - e(C, S) → S': executing command changes state.
   - Each process simulates execution using timestamped commands, ensuring consistent state.

6. Anomalous Behavior
   - Occurs when external events (outside the system) affect perceived order.
     - Example: Request B may be ordered before A due to communication outside the system.
   - Solutions:
     - Introduce external ordering information explicitly.
     - Use physical clocks satisfying the Strong Clock Condition:
       - If a → b (in real space-time), then C(a) < C(b).

7. Physical Clocks
   - Ci(t): reading of clock Ci at physical time t.
   - Clocks assumed continuous with possible isolated jumps.
   - Conditions for physical clocks:
     - PC1: Clock runs at approximately correct rate.
       - |dCi(t)/dt - 1| < x, where x << 1 (for crystal-controlled clocks, x ≈ 10^-6)
     - PC2: Clocks synchronized within a small bound e.
       - |Ci(t) - Cj(t)| < e for all i, j, t.
   - To avoid anomalous behavior:
     - Let # = minimum physical time difference for causally related events.
     - Condition: Ci(t + #) - Ci(t) > 0
     - Combined with PC1 and PC2: e / (1 - x) ≤ #

8. Summary
   - Logical clocks allow partial ordering of events, extended to total ordering using relation "~".
   - Total ordering enables distributed mutual exclusion without a central coordinator.
   - Anomalous ordering arises from external events; can be addressed with physical clocks satisfying the Strong Clock Condition.
   - Physical clocks must be accurate and synchronized to prevent violations of causal ordering.

Distributed System Clock Synchronization Notes

Concepts

- Partial Ordering of Events: 
  - Events in a distributed system have an inherent partial ordering.
  - "Happening before" defines an invariant partial ordering.
- Total Ordering Extension:
  - Algorithm extends the partial ordering to an arbitrary total ordering.
  - Helps in synchronization and ordering of distributed events.
- Physical Clock Synchronization:
  - Properly synchronized clocks prevent anomalous behavior in total ordering.
  - Ensures total ordering agrees with the perception of system users.

Message Delays

- Message m sent at physical time t, received at t'.
- Total delay of message: l_m = t' - t.
- Unpredictable delay: u_m = l_m - #_m.
- Receiving process knows a minimum delay t_zm ≥ 0 such that #_m ≤ l_m.
- Clock adjustment only requires local clock reading and message timestamps.

Clock Rules (Specialized for Physical Clocks)

- IR1':
  - If process P_i does not receive a message at time t, its clock C_i(t) is differentiable and dC_i/dt > 0.
- IR2':
  - (a) When P_i sends message m at time t, it timestamps m: T_m = C_i(t).
  - (b) When P_j receives message m at time t', it sets C_j(t') = max(C_j(t'-0), T_m + u_m).

Graph Model for Process Communication

- Processes represented as nodes in a directed graph.
- Arc from P_i to P_j represents a direct communication line.
- Message frequency: at least one message sent over each arc every T seconds.
- Diameter d of graph: smallest number such that any pair of processes is connected by ≤ d arcs.

Clock Synchronization Theorem

Assumptions:

- Strongly connected graph of processes with diameter d.
- All processes follow IR1' and IR2'.
- Unpredictable delay for any message ≤ δ.
- After t_0:
  - PC1 holds.
  - There exist constants r and v such that every T seconds, a message with unpredictable delay ≤ v is sent over every arc.

Result:

- PC2 is satisfied with ε = d(2x*r + δ) for all t > t_0 + Td.
- Proof involves bounding differences between clocks using message delays and communication paths.

Proof Concepts

- Define C_i^t as a clock of P_i set at time t and running at the same rate as C_i but never reset.
- For message sent at t_l and received at t_2 with unpredictable delay ≤ δ:

  C_j(t) ≥ C_i(t_l) + (1-x)(t - t_l) - nδ  (for chain of n messages along path)
  
- Choose largest clock C_x at time t_x:

  C_i(t) ≤ C_x(t_x) + (1+x)(t - t_x)
  
- Combining bounds for all clocks, we get:

  |C_i(t) - C_j(t)| ≤ d(2xr + δ) for t > t_0 + dT

Initialization/Resynchronization:

- Each process sends a message relayed to all other processes.
- Requires ≤ 2d(r + v) + δ seconds to synchronize, assuming each message has unpredictable delay ≤ δ.

Implementation Notes:

- Assumes discrete clock ticks frequent enough to satisfy C1.
- Real events have finite duration; doesn't affect correctness.
- Algorithm only requires local clock reading and received message timestamps.
- Clocks are never set backwards.

Additional Notes on Lisp Shallow Binding (Appendix)

- Shallow Binding:
  - Provides bounded access to variable values.
  - Modeled as rerooting environment trees in Lisp 1.5.
  - Reversible and optional for context-switching.
  - Leaves assoc[v, a] invariant.
- Supports multiple active processes in the same environment.
- Generalizes Dijkstra's Algol display.
- Primitive shallow[] gives dynamic control of shallow/deep access.
- Affects execution speed, not program semantics.
Distributed Snapshots: Determining Global States of Distributed Systems
Distributed Snapshots: Determining Global States of Distributed Systems  
Authors: K. Mani Chandy (University of Texas at Austin), Leslie Lamport (Stanford Research Institute)  
Source: ACM Transactions on Computer Systems, Vol. 3, No. 1, February 1985, Pages 63-75  

Overview:  
- The paper presents an algorithm for determining the global state of a distributed system during computation.  
- Determining global states is fundamental for solving several distributed system problems, especially stable property detection and checkpointing.  

Key Concepts:  
- Distributed System: A system where multiple processes communicate via message passing, without shared memory or clocks.  
- Global State: The collective state of all processes and communication channels in the system at a given logical point in time.  
- Local State: The state recorded by an individual process, including its internal variables and messages sent/received.  
- Stable Property: A property that, once true, remains true forever.  
  - Examples:  
    - Computation has terminated  
    - System is deadlocked  
    - All tokens in a token ring have disappeared  
- Stable Property Detection: The process of determining whether a given stable property holds in the system.  

Problem Statement:  
- Processes cannot record a truly simultaneous global state due to the absence of a shared clock.  
- Goal: Devise algorithms that allow processes to record:  
  - Their local states  
  - The state of communication channels  
- The recorded set of states must together represent a consistent global system state.  
- Algorithm constraints:  
  - Must run concurrently with the underlying computation  
  - Must not alter the ongoing computation  

Algorithmic Approach:  
- A process `p` initiates global state recording.  
- `p` requests cooperation from other processes to:  
  - Record their local states  
  - Send recorded states to `p`  
- Processes cannot rely on exact simultaneous recording; instead, the algorithm ensures a consistent snapshot of the global state.  

Applications:  
- Stable property detection  
- Distributed deadlock detection  
- Checkpointing for fault tolerance and recovery  

Assumptions:  
- Processes do not share clocks or memory.  
- Communication is through message passing.  

Categories and Subject Descriptors:  
- C.2.4: Distributed Systems (applications, databases, network operating systems)  
- D.4.1: Operating Systems (concurrency, deadlocks, multiprocessing, mutual exclusion, scheduling, synchronization)  
- D.4.5: Operating Systems (reliability, backup procedures, checkpoint/restart, fault-tolerance, verification)  

General Terms:  
- Algorithms  

Additional Key Words:  
- Global states, distributed deadlock detection, distributed systems, message communication systems  

Funding:  
- Supported by Air Force Office of Scientific Research (Grant AFOSR 81-0205)  
- Supported by National Science Foundation (Grant MCS 81-04459)  

Remarks:  
- The algorithm is intended to be superimposed on normal computation.  
- Ensures consistent snapshot without halting or altering the underlying processes.  

Distributed Snapshots and Global-State Detection

Concepts:

- Distributed System:
  - Comprised of a finite set of processes and channels.
  - Processes communicate by sending/receiving messages.
  - Processes do not share clocks or memory.
  - Modeled as a directed, labeled graph: vertices = processes, edges = channels.
  - Channels assumed to have infinite buffers, be error-free, and deliver messages FIFO.

- Global State:
  - Combination of the states of all processes and all channels.
  - Initial global state: all processes in initial states, all channels empty.
  - Events change process and possibly channel states: e = (process, pre-state, post-state, message, channel).

- Computation:
  - Sequence of events e0, e1, ..., en.
  - Event ei can occur if process and channel states satisfy preconditions.
  - next(S, e) gives the global state after event e occurs in state S.

- Stable Property:
  - Predicate y(S) on global states.
  - Stable if y(S) ⇒ y(S') for all S' reachable from S.
  - Examples: termination of computation, deadlock, all tokens removed from a token ring.
  - Goal: detect whether a stable property holds.

- Phases:
  - Computation may have phases: transient (useful work) + stable (endless/no-change behavior).
  - Detecting stability signals the end of a phase.

Examples:

- Single-token conservation system:
  - Processes p and q, channels c and c'.
  - Each process has two states: has-token (s1) and no-token (s0).
  - Events: sending/receiving the token.
  - Global states: in-p, in-c, in-q, in-c'.

- Nondeterministic computations:
  - Multiple allowable transitions from a global state.
  - Example illustrates that recorded global states may differ from actual global states.

Global-State Recording Algorithm:

- Purpose: record a "meaningful" global state without halting computation.
- Intuition: snapshot system like multiple photographers of a dynamic scene.
- Consistency conditions for channel states:
  - Let n = messages sent before process state recorded, n' = messages sent before channel state recorded.
  - Let m = messages received before receiver state recorded, m' = messages received before channel state recorded.
  - Consistency requires: n = n', m = m', n ≥ m, n' ≥ m'.
- Mechanism: marker messages
  - Marker-Sending Rule (process p): send marker on outgoing channel after recording p’s state and before sending further messages.
  - Marker-Receiving Rule (process q): 
    - If q has not recorded its state: record it, record channel as empty.
    - Otherwise: record channel state as messages received after recording state but before receiving marker.

Termination of Algorithm:

- Guarantees that all processes record their state and incoming channels.
- Requirements:
  - (L1) No marker remains forever in any channel.
  - (L2) Each process records its state within finite time of initiation.
- Algorithm can be initiated spontaneously by one or more processes.
- If the system graph is strongly connected, all processes eventually record their state.

Properties of Recorded Global State:

- Recorded state S* may not match any actual global state during computation.
- Theorem 1:
  - There exists a computation seq’ (permutation of original computation) where:
    - All prerecording events occur before postrecording events.
    - S* occurs in seq’ as a global state.
    - S* is reachable from initial state S0, and S0 is reachable from S*.
- Recorded global states are consistent and useful for detecting stable properties.

Stability Detection Algorithm:

- Input: Stable property y(S)
- Output: Boolean definite
  - definite = true → property holds at termination.
  - definite = false → property did not hold at initiation.
- Procedure:
  - Record global state S* using snapshot algorithm.
  - Set definite := y(S*).
- Correctness:
  - Follows from S* being reachable from initial state and stable property definition.

Notes on Examples:

- Permutation of events is allowed if events occur in different processes.
- Recorded global state is a “meaningful snapshot” that preserves causal consistency.
- Useful for problems like deadlock detection, termination detection, and checkpointing.

Summary:

- Distributed snapshot algorithm allows global-state detection without halting system.
- Stable-property detection reduces to evaluating y(S*) on a recorded global state.
- Markers coordinate state recording across processes and channels.
- Algorithm terminates if system is connected and marker propagation is finite.
- Recorded global state is consistent and supports distributed system monitoring and debugging.
Week 7
CS5223 Distributed Systems - Week 7: Transactions

Transactions
• Goal: group individual operations (reads/writes) into an atomic unit
• Example: transferring $100 from checking to savings
    checking_balance -= 100
    savings_balance += 100
• Need atomicity/durability and isolation
• Ensures consistency even with crashes or concurrent transactions

Traditional Transactions (Single-node database)
• ACID guarantees:
    Atomicity: all or nothing
    Consistency: transaction maintains application invariants
    Isolation: transactions do not interfere with each other
    Durability: committed transactions persist

Atomicity and Durability
• Atomicity: transaction fully applied or not at all
• Durability: effects survive crashes
• Technique: write-ahead logging (WAL)
    - Log each operation to disk
    - Log commit record
    - Only confirm to client after commit record written
    - After crash: redo committed transactions, undo uncommitted

Consistency (within transaction)
• Must respect application constraints
• Example: fail if checking_balance < 100 when transferring $100

Isolation
• Transactions execute as if alone
• Isolation levels:
    - Strict serializability
    - Serializability
    - Snapshot isolation
• Techniques:
    - One transaction at a time
    - Two-phase locking (2PL)
        - Growing phase: acquire locks as needed, cannot release yet
        - Shrinking phase: release locks, cannot acquire new ones
        - Read locks (shared) allow multiple readers; write locks (exclusive) block others
        - Write locks wait until all conflicting locks are released (queue mechanism)
    - Snapshot isolation
        - Transactions read from a consistent snapshot (versioned data)
        - Write-write conflicts are detected at commit
        - Conflicting transactions are automatically aborted and can be retried

Serializability
• Each transaction’s reads and writes are consistent with running them in a serial order, one transaction at a time
• To provide isolation: concurrency control protocols

Distributed Transactions
• Hard because data may be on different nodes, replicated, or cached
• Requires coordinating operations across nodes

Atomic Commitment
• Atomicity: all nodes execute transaction (commit) or none (abort)
• Agreement required
• In Paxos, agreement from a majority of nodes is required to ensure consistency, even if some nodes experience failures or hold outdated information. By relying on majority consensus, the protocol effectively ignores inconsistent or faulty nodes, allowing the system to reach a correct and reliable decision
• Example: scheduling a meeting across multiple calendars (Alice, Bob, Charlie)
• Without proper coordination, can get inconsistent schedules

Atomic Commit Protocol (ACP)
• Every node arrives at the same decision
• Once a node decides, it never changes
• Transaction committed only if all nodes vote YES
• In normal operation, if all processes vote Yes, the transaction is committed
• If all failures are eventually repaired, the transaction is eventually either committed or aborted

The first four properties ensure safety, while the last property ensures liveness

Two-Phase Commit (2PC)
• Instance of atomic commit protocol
• Roles:
    - Participants: nodes updating data (Alice, Bob, Charlie)
    - Coordinator: manages and executes the protocol (may also be participant)
• RPCs:
    PREPARE: can you commit?
    COMMIT: commit transaction
    ABORT: abort transaction

2PC Without Failures Case 1:
1. The coordinator sends a Prepare message to all participants.
2. Each participant decides whether it can commit; if so, it records its decision and replies “Yes” to the coordinator.
3. Once the coordinator receives “Yes” from all participants, it sends a Commit message to them.
4. Upon receiving the Commit message, each participant writes the commit record to disk, marking the transaction as committed.

2PC Without Failures Case 2:
1. The coordinator sends a Prepare message to all participants.
2. Each participant decides whether it can commit; if so, it records its decision and replies “Yes.” Otherwise, it replies “No.”
3. If any participant votes “No,” the coordinator decides to abort the transaction.
4. The coordinator then sends an Abort message to all participants.

2PC with Failures – Case 1 (Participant fails before sending a response):
1. The coordinator sends a Prepare message to all participants.
2. One of the participants failed before sending its decision.
3. The coordinator may also abort the transaction if it times out while waiting for responses from participants, since it cannot determine a safe outcome without their votes.
4. After recovering from a failure, a participant checks its log. If no final decision is recorded, it can safely abort the transaction, because it knows it has not voted “Yes,” and the coordinator cannot commit without its vote. 

2PC with Failures – Case 2 (Participant fails after sending a response):
1. The coordinator sends a Prepare message to all participants.
2. A participant may fail after recording “Yes” in the log and sending “Yes” to the coordinator.
3. Upon recovery, it checks its log; if it finds that it has already voted ‘Yes’ but has not received the final decision (Commit or Abort), it must wait for the coordinator (or other participants) to learn the outcome, as it cannot safely decide on its own.

2PC with Failures – Case 3 (Participant fails after sending a response, and the response is lost during transmission):
1. The coordinator sends a Prepare message to all participants.
2. A participant may fail after recording “Yes” in the log and sending “Yes” to the coordinator.
3. The “Yes” vote is lost during transmission and never reaches the coordinator.
4. The coordinator may abort the transaction if it times out while waiting for responses, since it cannot determine a safe outcome without all votes.
5. Upon recovery, the participant checks its log. If it finds it has already voted “Yes” but has not received the final decision (Commit or Abort), it must wait for the coordinator (or another participant) to provide the outcome, as it cannot safely decide on its own.
6. Since the coordinator never received the participant’s reply, it does not know to send an abort decision to that participant. Eventually, the participant will time out waiting for a decision and will then query the coordinator directly for the transaction outcome.

2PC with Failures – Case 4 (Coordinator fails before sending decision):
1. The coordinator sends a Prepare message to all participants.
2. Each participant decides whether it can commit; if so, it records its decision and replies “Yes” to the coordinator.
3. The coordinator fails before logging any information about the decision.
4. In this situation, the safest approach is to abort the transaction, or restart the entire 2PC process, sending Prepare messages again to all participants.

2PC with Failures – Case 5 (Coordinator fails after sending decision to parts of the Participants):
1. The coordinator sends a Prepare message to all participants.
2. Each participant decides whether it can commit; if so, it records its decision and replies “Yes” to the coordinator.
3. The coordinator logs the Commit decision and begins sending it to the participants..
4. The coordinator fails before all participants receive the Commit decision.
5. Any participant that has not yet received the final decision will time out and then query the coordinator or other participants to determine the transaction outcome.

Q: In Case 4 and Case 5, if none of the participants has received the coordinator’s decision, can they communicate among themselves to determine the outcome by comparing their votes?
A: No. Even if all participants voted Yes, they cannot decide on their own because the coordinator may still choose to Abort the transaction. For example, if a participant’s Yes vote was lost in transmission, the coordinator might decide to abort. All participants must follow the coordinator’s final decision, regardless of their own votes.

• Participant failures:
    - Before sending vote: abort
    - After sending vote: follow coordinator decision
    - Lost vote: coordinator may abort
• Coordinator failures:
    - Before sending decision: participants cannot decide (blocking)
    - After sending decision: participants follow decision
• Participants cannot decide independently safely in general

Two-Phase Locking (2PL)
• Lock types: read-lock (shared), write-lock (exclusive)
• Two phases:
    - Expanding phase: acquire locks, do not release
    - Shrinking phase: release locks, do not acquire
• Usually release locks after commit/abort (Strong Strict 2PL)
• Ensures serializability and strict serializability (serializable + real-time order)
  • Locks prevent conflicting operations (read/write or write/write) from happening concurrently.
  • Because a transaction holds all the locks it needs before releasing any, no other transaction can see partial changes.
  • This means the conflict graph (transactions as nodes, edges for conflicts) is acyclic, which is the definition of a serializable schedule.
• Example sequence:
    Lock(R, A)
    Lock(W, B)
    Lock(W, C)
    Commit
    Unlock(A, B, C)

Weaker Isolation Levels
• Less strict than serializability: allow anomalies
• Examples: snapshot isolation, repeatable read, read committed
• Analogy to weaker consistency models: causal consistency, eventual consistency

Other Concurrency Control Protocols
• Optimistic concurrency control (OCC)
• Timestamp ordering (TO)
• Multiversion concurrency control (MVCC)

Two-Phase Locking in Distributed Transactions
• Send lock requests to shards
• Can merge lock acquisition with 2PC PREPARE phase
• Release locks after commit/abort
• Must handle lock conflicts, deadlocks, and livelocks

Q: What happens if a transaction cannot acquire a lock?
A: The transaction must either wait until the lock is released or abort.
Q: How can we handle livelock?
A: We can handle livelock by enforcing a fixed order for acquiring locks, which prevents circular waiting and thus avoids livelock.

Durability
• Persist transaction effects even after failures
• Single node: write-ahead logging + persistent storage
• Disk failure: replicate database using Paxos
• Distributed: replicate each shard
Week 8
CS5223 Distributed Systems - Week 8: Distributed Transactions

Transaction Recap
A transaction is a group of multiple operations (reads and writes) executed as a single atomic unit. Transactions aim to maintain database correctness, even under failures or concurrent access. Transactions guarantee ACID properties:

- Atomicity: A transaction either fully executes or has no effect. If any part fails, the system rolls back all changes.
- Consistency: Transactions transition the database from one valid state to another, preserving invariants and constraints.
- Isolation: Concurrent transactions appear to execute serially. Each transaction should not see intermediate states of others.
- Durability: Once a transaction commits, its effects persist even in the case of system crashes.

Distributed Transactions
In distributed systems, data is partitioned into shards, each stored on a separate server. Reasons for sharding include:

- Storage capacity: Large datasets exceed a single machine's storage.
- Throughput: Parallel processing across shards increases performance.
- Scalability: Easy addition of servers without overloading existing nodes.

Distributed transactions maintain ACID properties across multiple shards. Examples of systems using distributed transactions are MySQL Cluster, Google's Megastore, and Spanner.

Atomicity in Distributed Systems
Atomicity ensures that all shards involved in a transaction either commit or abort together. This is typically achieved using the Two-Phase Commit (2PC) protocol.

Two-Phase Commit (2PC)
Phase 1: Prepare

- Coordinator sends PREPARE messages to all participants.
- Participants respond:
  - YES: Ready to commit; wait for final decision.
  - NO: Abort immediately.

Phase 2: Decision

- If all participants reply YES → Coordinator sends COMMIT.
- If any participant replies NO → Coordinator sends ABORT.

Isolation
Isolation ensures that concurrent transactions behave as if executed one at a time, preventing anomalies from interleaved operations. The strongest standard is serializability.

Example:
Transferring money between accounts concurrently without proper isolation can lead to incorrect total balances if reads and writes interleave.

Concurrency Control Protocols

- Two-Phase Locking (2PL): Transactions acquire locks in an expanding phase and release in a shrinking phase. Read locks are shared; write locks are exclusive. Locks are held until commit/abort.
- Optimistic Concurrency Control: Transactions execute without locks, checking for conflicts before commit.
- Timestamp Ordering: Operations are ordered using timestamps to ensure serializability.
- Multiversion Concurrency Control (MVCC): Multiple versions of data are maintained to allow non-blocking reads.
- Strict Serializability: Serializability plus real-time constraints. If transaction T1 starts after T2 commits, T1 appears after T2.

Weaker Isolation Levels
Weaker isolation allows more concurrency but may produce anomalies: behaviors not consistent with executing transactions serially.

Common levels:
- Snapshot Isolation: Transactions read a consistent snapshot; write-write conflicts may occur.
- Repeatable Read: Ensures repeated reads return the same value but may allow phantom reads.
- Read Committed: Prevents dirty reads but allows non-repeatable reads and phantoms.

Example

Original state:
A = 0
B = 0

Transaction 1:
- Read `A` → gets `0`
- Write `B = 1`

Transaction 2:
- Read `B` → gets `0`
- Write `A = 1`

Explanation: 
Snapshot isolation allows this scenario because each transaction reads from a consistent snapshot of the database (in this case, the original state).  
Even though both transactions appear to run concurrently, snapshot isolation does not guarantee serializability, so this outcome—sometimes called a write skew—is possible.

Two-Phase Locking in Distributed Databases
- Locks are requested from each shard participating in the transaction.
- Can merge lock acquisition with 2PC PREPARE phase.
- Abort if locks cannot be acquired.
- Acquire locks in a fixed order to prevent deadlocks.

Durability
- Ensures transaction effects persist after commit.
- Single-node: use write-ahead logging and persistent storage.
- Distributed systems: replicate data using consensus protocols like Paxos. Each shard is typically replicated across multiple nodes.

Distributed Transactions in Spanner
Spanner stores each shard in a Paxos group replicated across data centers. Each Paxos group has a (relatively long-lived) leader responsible for tracking read/write locks for 2PL.
Transactions span Paxos groups using 2PC
- One group leader becomes the 2PC coordinator, others participants

Transaction execution flow:

Client:
- Acquires read locks from shard leaders and reads data.
- Buffers writes locally.
- Decides to commit and acquire write locks.
- Sends PREPARE to participant leaders.

Participant:
- Logs PREPARE in Paxos.
- Votes OK or Abort.

Coordinator:
- If all votes are OK, log COMMIT in Paxos.
- Send COMMIT to participants.
- Send OK to Client

Participants:
- Logs Commit in Paxos
- Apply writes.
- Release locks.

Spanner Transaction Example
"""
Transaction Flow with Paxos Replication

1. Read Phase
  - Action: The client sends read requests to the Shard Leaders (Participant Leaders) of the required data.
  - Locking: The leaders acquire Read Locks on the requested rows and record them in their local Lock Tables.
  - Data Retrieval: The leaders return the current values to the client.

2. Execution Phase (Local Buffering)
  - Action: The client performs all business logic and computations locally.
  - Buffering: All intended writes and intermediate results are buffered locally on the client side. No changes are sent to the server yet, minimizing network round-trips and lock holding time.

3. Prepare Request (2PC Phase 1)
  - Action: Once the client decides to commit, it selects one participant as the Coordinator and sends a PREPARE message to all Participant Leaders.
  - Payload: This message includes the transaction’s Write Set (the buffered data to be updated).

4. Prepare Replication & Lock Upgrade (Paxos)
  - Lock Upgrade: Each Participant Leader upgrades the existing Read Locks to Write Locks (Exclusive Locks) to prevent other transactions from accessing the data.
  - Paxos Logging: Each leader replicates the "PREPARE" state and the write set via Paxos to its followers.
    - If Paxos replication succeeds: The leader votes OK to the Coordinator.
    - If Paxos replication fails (or conflict occurs): The leader votes ABORT.

5. Commit Decision (Coordinator Role)
  - Outcome - COMMIT: If the Coordinator receives OK votes from all participants:
    1. The Coordinator logs the COMMIT decision via its own Paxos Group (the "point of no return").
    2. After the commit decision is durably logged, participants apply the buffered writes to the actual database storage.
    3. Once the writes are applied, all Write Locks held by the transaction are released in the Lock Table, allowing other waiting transactions to proceed
    4. The Coordinator sends the COMMIT command to all participants.
    5. The Coordinator notifies the Client that the transaction was successful.
  - Outcome - ABORT: If any participant votes ABORT, the Coordinator logs and sends an ABORT command.

6. Commit Replication (Participants)
   - Action: Each Participant Leader receives the COMMIT command and logs the final decision via Paxos to ensure the commit is durable even if the leader fails.

7. Apply Writes
   - Action: After the commit decision is durably logged, participants apply the buffered writes to the actual database storage.

8. Lock Release
   - Action: Once the writes are applied, all Write Locks held by the transaction are released in the Lock Table, allowing other waiting transactions to proceed.
"""

Note:

Replication and Coordination in Transaction Commit
- The write operations should also be replicated via Paxos together with the COMMIT message to ensure consistency across replicas.
- The PREPARE phase, initiated by the client, includes the transaction’s write set and is sent to the participant leaders.
- The method for selecting a coordinator can vary. As long as the selection is deterministic, correctness is preserved
 (e.g., choosing based on Shard ID).

Why Can the Coordinator Reply "OK" Before Other Participants Finish?

- Locks are still held by other participants 
 → No other transactions can read or modify the locked data, so isolation is preserved.

- Commit decision is final 
 → Once the coordinator sends "OK" to the client, the system guarantees that the decision will not change, even if some participants are still completing execution.

Lab 4 Style Distributed Transactions
- Simplified Spanner-like transactions.
- Coordinator drives 2PC.
- Reads can be done during the PREPARE phase.
- Transaction flow across shards:
"""
1. Execution Phase (Client → Coordinator)
  - Action: The client sends the transaction to the Coordinator.

2. Execution Phase (Coordinator Role)
  - Action:
    1. Acquires all required read and write locks.
    2. Logs the PREPARE record and write set via Paxos to its replicas.
    3. Send PREPARE to all other participating shards

3. Prepare Phase (Participants)
  - Upon receiving PREPARE, each participant leader:
    1. Acquires the required locks
    2. Logs the PREPARE record and write set via Paxos to its replicas.
  - Then:
    - If Paxos replication succeeds → vote OK to the Coordinator.
    - If replication fails or a conflict is detected → vote ABORT.

4. Commit Decision (Coordinator Role)
  - Outcome - COMMIT: If the Coordinator receives OK votes from all participants:
    1. The Coordinator logs the COMMIT decision via its own Paxos Group (the "point of no return").
    2. After the commit decision is durably logged, participants apply the buffered writes to the actual database storage.
    3. Once the writes are applied, all Write Locks held by the transaction are released in the Lock Table, allowing other waiting transactions to proceed
    4. The Coordinator sends the COMMIT command to all participants.
    5. The Coordinator notifies the Client that the transaction was successful.
  - Outcome - ABORT: If any participant votes ABORT, the Coordinator logs and sends an ABORT command.

5. Commit Replication (Participants)
   - Action: Each Participant Leader receives the COMMIT command and logs the final decision via Paxos to ensure the commit is durable even if the leader fails.

6. Apply Writes
   - Action: After the commit decision is durably logged, participants apply the buffered writes to the actual database storage.

7. Lock Release
   - Action: Once the writes are applied, all Write Locks held by the transaction are released in the Lock Table, allowing other waiting transactions to proceed.

"""

Note: Lock Management Difference
- Google Spanner
 - Only the leader is responsible for maintaining and managing locks.
 - Followers do not track lock state; they rely on the leader for coordination.

- Lab 4 (Paxos-based System)
 - All replicas in the Paxos group maintain the same state, including locks.
 - Lock state is replicated via Paxos, ensuring consistency across all servers.

Key Insight:
Spanner centralizes lock management at the leader for efficiency, while the Lab 4 design replicates lock state to all replicas for stronger consistency and simpler recovery.

Distributed Transaction Costs
- High latency due to multiple rounds of communication and consensus.
- Coordination overhead and lock contention.
- Mitigation strategies:
  - Weaker isolation or consistency.
    - Need to deal with inconsistencies and anomalies.
  - Read-only transactions without locks.
    - Spanner: Use physical lock
    - Expose the uncertainty in the clock value
    - Read at particular time (including the “current time”)
  - Time-based reads using physical clocks (as in Spanner).

Sharding System Overview (Lab Context)
Terminology:
- Shard: subset of keys; deterministic key to shard mapping.
- ShardStoreServer: handles key-value store for the assigned shard, replicated via Paxos.
- Configuration: versioned mapping of shards to Paxos groups.
- ShardMaster:
  - “Application” replicated by Paxos.
  - service that responds to changes in configuration.
  - Keep track of which groups serve which shards.
  - Remember all old configurations.
  - Commands: Join, Leave, Move, Query.
  - Join, Leave, and Move create new configuration.
    - Join and Leave:
      1. Divide the shards as evenly as possible
      2. Move as few shards as possible
  - Goal: evenly distribute shards, minimize movement.

Reconfiguration Process
- Perform one configuration change at a time.
- Suspend client requests during reconfiguration.
- Paxos replicas process client operations and reconfiguration operations in order.
- Steps:
  1. Receive new configuration from ShardMaster.
  2. Replicate configuration via Paxos.
  3. Send shards to new groups; receive shards from old owners.
  4. Exchange acknowledgments.
  5. Wait until all transfers and acks complete.

ShardStoreServer + Paxos
- Client operations wrapped in PaxosRequest.
- Proposed to Paxos for ordering.
- Server executes operations in decided order.
- Ensures strong consistency and fault tolerance.

System Composition
- Each shard is replicated via Paxos.
- Transactions use:
  - Two-Phase Locking (isolation).
  - Two-Phase Commit (atomicity).
- Provides strong consistency, fault tolerance, and durability.
- Trade-off: high latency and increased complexity.
Week 9
Chubby — Distributed Coordination Service

Overview
- Distributed coordination system developed by Google
- Provides synchronization and configuration management for distributed applications
- Open-source equivalent: Apache ZooKeeper

Goals
- Allow client applications to synchronize and manage dynamic configuration state
- Provide:
  - Lock service
  - Leader election (primary selection)
  - Coordination primitives
- Ensure:
  - Fault tolerance
  - High availability
  - Strong consistency
- Intuition: only some parts of an app need consensus
- Implementation: multi-Paxos state machine replication

Key Insight
- Not all parts of an application need consensus
- Centralize consensus logic into a service (Chubby)

Implementation
- Based on Multi-Paxos
- Uses state machine replication (SMR)

Why Chubby (Service vs Library)
- Easier integration than embedding Paxos in every application
- Developers struggle with Paxos complexity
- Enables external visibility (e.g., clients know current leader)
- Reduces complexity in application servers

Chubby Interface

File-System-Like Abstraction
- Small files + directories

Core Features
- File storage
- Locking
- Sequencers (versioning / ordering mechanism)

API Operations
- File operations:
  - Open, Close
  - GetContents, SetContents, Delete
- Locking:
  - Acquire, TryAcquire, Release
- Sequencers:
  - GetSequencer, SetSequencer, CheckSequencer

Example: Primary Election
- Client tries to acquire lock on a file
- If successful:
  - Becomes primary leader
  - Writes its address to a file to signal that it is now the leader, allowing others to read the file later and determine the current leader
- Else (if someone has already acquired the lock):
  - Reads file to find current primary leader
  - Watches for updates

Example: Primary–Backup using Chubby (instead of a view server)
1. A server attempts to acquire a lock from the Chubby service.
2. Since it is the first to request the lock, Chubby grants it, making this server the primary.
3. The primary then writes its address into Chubby so others can discover it.
4. When another server tries to acquire the lock, it finds that the lock is already held.
5. By reading the state stored in Chubby, it learns the identity of the current primary.
6. As the next available server, it assumes the role of backup.
7. Clients query Chubby to determine the current primary, and Chubby returns the primary server’s address.

Notes
1. Chubby ensures that the system state (e.g., who the primary is) remains consistent.
2. It is designed to be fault-tolerant, highly available, and strongly consistent.

Why use a lock service?
- Alternative: implement a consensus protocol like Paxos directly.
- Why a service is preferred:
  - Easier to integrate into existing systems
  - Avoids requiring developers to implement or fully understand Paxos
  - Allows state (like the primary’s identity) to be exposed to external clients, not just internal replicas
  - Can reduce the complexity and number of application servers

Performance in Chubby

Baseline
- Paxos throughput ~1000 ops/sec
- Required ~5000 ops/sec

Bottlenecks
- Leader handles all requests
- Multiple message delays (~4)
- Sequential consensus operations

Note:
Adding more replicas does improve fault tolerance capability, but it does not necessarily improve latency or throughput; in some cases, it can even degrade performance due to increased coordination and communication overhead.

Optimizations
Need to engineer it so we don’t have to run Paxos on every RPC

Batching
- Combine multiple requests into one Paxos round
- Improves throughput
- Increases latency

Partitioning
- Multiple Paxos groups handling different keys
- Horizontal scalability with number of groups
  - Uniform request distribution
- Challenge: cross-group operations

Note: Even read-only requests may need coordination (or replication) because network partitions can occur. Without proper synchronization, multiple replicas might each believe they are the leader (split-brain) and independently serve requests, which can violate linearizability.
So can we optimize read operation?

Leases (for Reads)
- Most requests are reads
- Want to avoid communication on reads
  - Communication not needed for durability
  - Just need to ensure master hasn’t changed
- Master obtains lease and renews while up (e.g., 10 seconds)
- Master can process reads alone if holding lease
- If master fails, need to wait 10s before new master can respond to requests
- Allows serving reads locally without consensus
- Tradeoff:
  - Faster reads
  - Delay after failure (must wait for lease expiry)

Caching
- Clients cache:
  - File data
  - Metadata
- Strongly consistent, write-through, write-invalidate cache model
  - Master tracks which clients might have file cached
  - Sends invalidation on updates

Note:
Before a client sends a SetContents operation to Chubby, Chubby first issues cache invalidation messages to all clients.
Each client acknowledges the invalidation, and only after receiving these acknowledgments does Chubby allow the write to proceed.

Question: Is it safe for clients to read from their local cache before it has received invalidation request?
Answer: Yes, it is safe, and it does not violate linearizability—but only because of how Chubby enforces ordering. 

When Chubby sends a cache invalidation message, it ensures that:
- All clients are notified that their cached data is no longer valid.
- Clients acknowledge this invalidation before any write (e.g., SetContents) is allowed to proceed.

Because of this:
- Any read that happens after invalidation is processed will not rely on stale cached data.
- If a read happens during the invalidation window, the system ensures that the write has not yet been committed, so the read still reflects a valid, pre-write state.

This preserves Linearizability, because:
- Reads either see the old value before the write, or the new value after the write
- They never observe a mix or an out-of-order state

Question: Can other clients install a copy in their cache during invalidation?
Answer: In principle, it depends on the implementation, but in Chubby, the answer is effectively no.
- If clients were allowed to install a new cached copy during invalidation:
- It could be safe only if the new cache is tracked by Chubby and properly invalidated before any write completes.
Otherwise, the client might end up with stale data, which could violate Linearizability.

In theory, Chubby could:
- Allow the cache copy
- Then immediately invalidate it again to maintain correctness

But this opens the door to a deeper problem:
- If clients keep copying caches during invalidation, Chubby would need to continuously send invalidations
- This can lead to a livelock, where the system spends all its time invalidating caches and makes no real progress

Because of this, Chubby’s design avoids the issue entirely:
- Clients are not allowed to install new cached copies while an invalidation is in progress

Clients hold file handles, locks, and cached data.
What happens if a client holding a lock/file cache fails?

KeepAlive Mechanism
- Clients maintain leases via periodically sending messages (KeepAlive)
- Clients rely on responses from Chubby’s KeepAlive mechanism to confirm that their session is still active; if these responses stop, the client assumes its lease has expired.
- On failure:
  - Locks released
  - Cache invalidated

Proxies
- KeepAlives and invalidations are a huge percentage of load
- Use proxies to track state for groups of clients
- To master, proxies act exactly like clients
- To clients, proxies act exactly like master
- Reduce load from:
  - Keep-alives
  - Cache invalidations
- Act as intermediaries:
  - Proxy ↔ Master
  - Proxy ↔ Clients

Real System Stats
- ~50k clients per cell
- ~22k files
  - most less than 1k; all less than 256k
- ~2k RPCs/sec
  - 93% = keep-alives, so caching, leases help
  - most of the rest are reads, so master leases help
  - <0.07% = writes

“Readers will be unsurprised to learn that the failover code, which is exercised far less often than other parts of the system, has been a rich source of interesting bugs.”

Google File System (GFS)

Motivation
- Google needed a distributed file system for storing search index (late 90s, paper 2003)
- Designed for Google workloads (not traditional FS like NFS/AFS)
  - Very different workload characteristics
  - Able to design GFS for Google apps and design Google apps around GFS
- Assumptions:
  - Frequent failures
    - So strong fault tolerance is required
  - Large-scale data
  - High throughput > low latency

Workload Characteristics
- Few million large files (100MB to multi-GB)
  - not optimized for small files
- Small files are rare
- Reads:
  - Large streaming reads
  - Small random reads
- Writes:
  - Many files written once
  - Mostly append-only
  - Rare random writes

GFS Interface

Not POSIX-compliant
- Application-level library

Operations
- create, delete, open, close, read, write
  - concurrent writes not guaranteed to be consistent
- record append (important feature): guaranteed to be atomic
- snapshot

Consistency Model
- Concurrent writes not strictly consistent
- Record append is atomic

GFS Architecture

File Structure
- Files split into fixed-size chunks (64MB)
- Each chunk replicated (3+ chunkservers)

Components

Master
- Stores metadata:
  - File → chunk list
  - Chunk ID → list of chunkserver holding it
- Stores metadata in memory
- Does NOT store file data
- Actually a replicated system using shadow masters

Chunkservers
- Store actual data

Shadow Masters
- Replicated metadata for fault tolerance

Key Property
- Single logical master (simplifies design)

Read Operation

Steps
1. The client sends a request to the master with the (filename, chunk index).
2. The master responds with the (chunk handle, chunk locations).
3. The client then reads directly from a chunkserver by sending (chunk handle, byte range) and receives the requested data.

Key Idea
- Master not in data path → scalability

Write Operation

Steps
1. The client asks the master for chunk metadata for the file (e.g., where to write the next chunk).
2. The master identifies the relevant chunk and designates one replica as the primary, returning the chunk handle and locations of all replicas.
3. The client pushes the data to the nearest replica, and it will forwarded to the others.
4. Once all replicas have the data, the client sends a write request to the primary.
5. The primary determines a global order for concurrent write requests from different clients.
6. The primary instructs the secondary replicas to apply the writes in that order.
7. All replicas apply the write in the same sequence and acknowledge back to the primary.
8. The primary acknowledgement back to the client.

Properties
- Consistency depends on success/failure
- Primary controls ordering

Note: Comparison with Paxos

The design of the Google File System (GFS) shares some similarities with Paxos, such as using a primary to coordinate replicas, but there are key differences:
1. Client interaction: In GFS, the client pushes data directly to the nearest replica. In Paxos, the client must send the request to the Proposer or Leader.
2. Consensus mechanism: GFS does not run a full consensus protocol like Paxos. The primary orders writes and instructs replicas, but it does not wait for a majority to agree before responding. As a result, GFS can acknowledge the client before achieving majority consensus. In contrast, Paxos requires the primary to wait for acknowledgments from a majority of replicas before confirming success. Note that in GFS, if all replicas fail to apply a write, the operation may still be reported as failed.

Important clarification

GFS does not guarantee full strong consistency like Paxos, but it is also not “purely best effort”:
- Replicas that successfully acknowledge a write will be consistent with each other.
- However, in failure cases, some replicas may have applied the write while others have not, leading to temporary inconsistencies.
- The system relies on retries and background repair to converge back to a consistent state.

File Region States

Defined
- Consistent
- Entire write visible

Consistent (but undefined)
- Same data seen by all clients
- May not reflect a complete write

Inconsistent
- Different clients see different data

Failures in Writes
- Errors encountered at replicas reported to client
- Client request considered failed

If write fails:
- Client notified
- Some replicas may have partial writes

Result
- Region becomes inconsistent

State after Successful Writes (in Google File System)
- All replicas have applied the writes in the same global order determined by the primary.
  - The region of the file is consistent across replicas.
- For concurrent writes from different clients:
  - The final state reflects one valid ordering of those writes (as chosen by the primary).
  - The result is consistent, but not necessarily predictable from the clients’ perspective.

Concurrent Writes
- Writes overlap
- Final state:
  - Consistent but undefined
  - Depends on ordering

Atomic Record Append

Purpose
- Safe concurrent appends

Behavior
- Append to end of file
- If chunk full:
  - Pad chunk to the max size (all replicas)
  - Ask the client to retry on next chunk

Guarantees
- Append is atomic
- Written region is defined
- Interleaving regions are inconsistent

Issues
- Duplicate records possible
- Padding may exist

Handling Inconsistency

Most applications mutate files by appending

Techniques

Checksums
- Detect corrupted or partial writes

Unique Identifiers
- Identify duplicates

Application-Level Handling
- Design around append-only model

GFS Design Tradeoffs

Strengths
- High throughput
- Fault tolerant
- Scales to massive data

Weaknesses
- Poor for small files
- High latency for some operations
- Single master bottleneck

System Evolution

Scale Achieved
- ~50 million files
- ~10 PB data

Limitations
- Single master bottleneck
- Not suitable for latency-sensitive apps

Outcome
- Replaced by Colossus (next-generation system)

Key Takeaways

Chubby
- Provides coordination as a service
- Built on Paxos
- Uses leases, caching, batching for performance

GFS
- Designed for large-scale, append-heavy workloads
- Separates metadata (master) and data (chunkservers)
- Relaxes consistency for performance

Shared Insight
- Real-world distributed systems:
  - Trade strict guarantees for scalability
  - Optimize for common-case workloads
  - Push complexity to system design instead of application logic
Week 10
CS5223 Distributed Systems – Weak Consistency (Week 10)

Weak Consistency Overview
- Strong consistency models:
  - Serializability
  - Sequential consistency
  - Linearizability
- Examples: Primary-backup, Multi-Paxos, Chubby, Spanner
- Advantage: clear correctness guarantees
- Disadvantage: reduced availability and performance under failures

CAP Theorem
- Impossible to simultaneously guarantee:
  1. Consistency (linearizability)
  2. Availability (every request gets a response)
  3. Partition tolerance (network failures tolerated)
- Trade-off required in distributed systems

Amazon’s Design Choice
- Prioritizes availability and latency
- Example: shopping cart must always work
- Even under failures or partitions
- Observations:
  - +100ms latency → ~5% revenue loss
- Target:
  - ~99.99% availability

Dynamo System
- Distributed key-value store by Amazon
- Designed for:
  - High availability
  - Low latency (99.9% of time)
- Trade-off:
  - Sacrifices strong consistency

Eventual Consistency
- Guarantees:
  - Data will become consistent over time
- Characteristics:
  - Stale reads possible
  - Multiple “latest” versions may exist
  - Reads may return multiple values
- Not sequentially consistent

Dynamo API
- get(key) → ([values], context)
  - May return multiple versions
  - Context contains vector clocks
- put(key, value, context)
  - Context passed from previous get

Example workflow (shopping cart)
"""
(carts, context) = get("cart-" + uid)
cart = merge(carts)
cart = add(cart, item)
put("cart-" + uid, cart, context)
"""

Conflict Resolution
- Done at application level
- The way to resolve conflict relies on the target state
- Examples:
  - Shopping cart → union of items
  - High score → maximum value
  - Default → latest timestamp wins
- Once resolved, should remain resolved

Vector Clocks
- Track causal relationships
- Structure:
  - [(node1, count1), (node2, count2), ...]
- Rules:
  - Increment own counter on write
  - Compare clocks:
    - v1 < v2 → v1 is older (delete v1)
    - concurrent → keep both versions

Dynamo Vector Clock Behavior
- Nodes in vector clock are coordinators
- Each write/put has a coordinator, and is replicated to multiple other nodes
  - In an eventually consistent manner
- Each object associated with a vector clock
- On put:
  - Client sends context
  - Coordinator increments its entry
  - Replicates to other nodes
- On get:
  - Read from multiple nodes
  - Merge clocks
  - Return all concurrent versions

Replication Parameters
- N: number of replicas
- R: number of nodes required for read
- W: number of nodes required for write

Condition for better consistency:
- R + W > N

Common configuration:
- (N=3, R=2, W=2)

Sloppy Quorum
- Do not wait for specific nodes
- Use first available nodes
- Ensures availability even if some nodes fail
- Writes/reads still proceed

Handling Failures
- Writes may go to alternative nodes
- Use hinted handoff:
  - Temporary storage with “hint”
  - Forward to correct node later
- Periodic synchronization between nodes

Key Placement Problem
Goals:
- Load balancing
- Minimal data movement on changes
- Decentralization

Naive Hashing
- key → hash(key) mod n
- Problem:
  - Adding/removing nodes reshuffles most keys

Consistent Hashing
- Hash nodes and keys onto a ring
- Each key assigned to next node clockwise
- Advantages:
  - Minimal data movement
  - Only ~K/n keys move when adding a node

Key Insight
- Weak consistency improves:
  - Availability
  - Performance
- Cost:
  - More complexity in application logic
  - Need for conflict resolution
  - Possible temporary inconsistencies
Week 11 (Rest Week)
Week 12
Failure Models
- Fail-stop/crash failures: node either executes correctly or stops
- Byzantine faults: faulty nodes can take arbitrary actions, send incorrect messages, collude, or try to subvert the protocol

Why Byzantine Model?
- Hardware failures can cause crashes or abnormal behavior
- Software bugs are common
- Security vulnerabilities can allow attackers into the system
- Cosmic rays can cause bit flips
- Economic incentives (e.g., Bitcoin) motivate attacks

Malicious Behavior Examples
- Unreplicated key-value store:
    - Return unrelated data
    - Reorder operations
    - Process only some operations
    - Show inconsistent results to clients
- Paxos tolerates a minority of processing failing by crashing
- What could a malicious replica do to a Paxos deployment:
    - Stop processing
    - Leaders report incorrect results
    - Followers discard or ignore proposals
    - Continually trigger new leader elections

Byzantine Fault Tolerant (BFT) State Machine Replication
- Uses same model as Multi-Paxos, Raft, Viewstamped Replication
- Assume f replicas are faulty
- To tolerate f Byzantine failures, need at least n > 3f replicas
- Reason: to ensure n – 2f > f (non-faulty replicas outnumber faulty replicas)

Byzantine Quorums
- Paxos: quorum size f+1 out of 2f+1 nodes
- BFT: quorum intersection must include at least one non-faulty node
  - 2f + 1

PBFT (Practical Byzantine Fault Tolerance)
- Protocol progresses through views with a single primary (leader) per view
- Clients send commands to primary, which assigns a sequence number and forwards to backups
- Public-key cryptography ensures authenticity and prevents forgery
  - To prevent faulty node from impersonating other nodes
- Backups send replies directly to clients; clients wait for f+1 matching replies
  - To prevent faulty primary from sending the wrong result to the client
- Replicas exchange information about ops received from primary
  - To prevent primary from assigning different commands to the same sequence number (aka. equivocation)
- Backups monitor primary and trigger view change if primary is faulty or unresponsive when timing out committing client operations
  - To prevent primary from ignoring the clients altogether, or other ways to prevent progress
- Three sub-protocols:
    1. Normal operations: Pre-Prepare, Prepare, Commit
    2. View change
    3. Garbage collection

What about faulty clients?
- We assume that there is some existing way for clients to authenticate themselves with the system
- Access controls can be used to restrict what each client is allowed to do
- System administrators (or the system itself) can revoke access for faulty clients

PBFT Phases
- Pre-Prepare:
    - Primary assigns order
    - Message: ⟨⟨PRE-PREPARE, v, n, D(m)⟩p, m⟩
      - 𝑣 is the view number
      - 𝑛 is the sequence number assigned by the primary
      - 𝐷(𝑚) is a digest of the message (to reduce amount of public key crypto)
    - Backup accepts if:
      - The client request is valid
      - The backup is in view 𝑣
      - The backup hasn't accepted a different PRE-PREPARE for the same sequence
number in the same view

- Prepare:
    - Backups broadcast PREPARE: ⟨PREPARE, v, n, D(m)⟩i
    - Prepare Certificate: 2f+1 matching PRE-PREPARE and PREPARE messages
    - Guarantees no conflicting Prepare Certificates due to quorum intersection
      - Quorum intersection!
    - Two 2f+1 quorums intersect at at least one honest server
    - Honest servers don’t prepare different commands in the same slot
    - Can’t have two prepare certificates with different commands

- Commit:
    - Broadcast COMMIT: ⟨COMMIT, v, n, D(m)⟩i
    - Commit Certificate: 2f+1 matching COMMITs
    - Server executes command and replies to client after Commit Certificate
- Reply:
    - Client waits for f+1 matching replies

Can a server execute the command after getting a Prepare Certificate?
- No
- Other servers may not have the same Prepare Certificate
- (Remaining) honest servers may not outnumber faulty servers
- Therefore, may not have enough information to pick the correct command (i.e., executed command)
- We need another round of communication!

Once a server has a Prepare Certificate, it broadcasts a COMMIT message
- Once a server has 2𝑓+1 matching COMMITs (and the associated client message), it has a Commit Certificate
- The server can then execute the command (provided it executed all previous commands) and reply to the client

Commit Certificate
- A commit certificate proves that every quorum of 2𝑓+1 servers has at least one non-faulty node with a Prepare Certificate
- Remember: for a particular view number and slot number, there can be only one command in any Prepare Certificate
- This command is now stable and will be fixed in the same slot (even in future view changes)

PBFT View Change
- Backups monitor the primary. If the primary stops responding to pings or the backups timeout executing requests, they start a view change
- View change: move to view v+1 and a new primary
- Goal: all committed commands are carried over to the new view
- Trick: gather information from 2f+1 servers. If a command is committed, a Prepare Certificate is present at at least one of the 2f+1 servers.
- VIEW-CHANGE messages sent to new primary with Prepare Certificates
- New primary gathers 2f+1 VIEW-CHANGE messages and broadcasts NEW-VIEW
- Broadcasts a NEW-VIEW message, which includes
  - PRE-PREPARE messages in view v+1 for each prepared command in the 2f+1 VIEW-CHANGE messages
  - All 2f+1 VIEW-CHANGE messages
- Backups verify NEW-VIEW and send PREPARE for included PRE-PREPAREs

PBFT Summary
- Tolerates < 1/3 replicas faulty (benign or malicious)
- Powerful but complex and expensive (O(n^2) messages, cryptography overhead)
- Used in blockchain systems where performance is acceptable

Complexity
- Building a bug-free Paxos is hard!
- BFT is much more complicated
- Which is more likely?
  - bugs caused by the BFT implementation
  - the bugs that BFT is meant to avoid

Recently…
- BFT protocols have been used in blockchain systems
- Performance not a big issue
  - PBFT still faster than proof-of-work consensus (more on that later)

Bitcoin and Decentralized Systems
- PBFT requires permissioned setup; vulnerable to Sybil attacks if permissionless
- Bitcoin: proof-of-work cryptocurrency, decentralized, no trusted third party
- Transaction chain:
    - Each bitcoin has a chain of transactions
    - Transactions include new owner public key, previous transaction hash, signed by old owner
- Double spending prevention:
    - All nodes see consistent transaction chain
    - Consensus ensures only one valid spend per coin

Blockchain Structure
- Paxos-like log of transactions
- Each block:
    - hash(previous_block), set of transactions, nonce
    - hash chain implies block order
- Proof-of-work:
    - Computationally expensive block generation
    - Longest chain considered correct
    - Honest miners control >50% hashing power to prevent attacks

Bitcoin Mining
- Miner extends longest chain by creating a new block
- Nonce found via brute-force hashing to meet threshold
- Mining reward and transaction fees incentivize miners
- Average block: 2MB, ~2,500 transactions, mined every 10 minutes (~4 transactions/s)
- Confirmation: wait for 6 blocks (~1 hour latency)
- Mining consumes energy comparable to Switzerland

Key Formulas
- Byzantine quorum requirement: n > 3f
- Prepare Certificate: 2f+1 matching PREPAREs
- Commit Certificate: 2f+1 matching COMMITs

