<meta>
Title: Cloud Architectures: Workload Distribution, Resource Pooling, Dynamic Scalability, and Cloud Bursting
Summary: An architectural exploration of cloud elasticity and resource allocation patterns. Covers rapid elasticity objectives, workload distribution architectures, AWS load balancer mechanics (ALB Layer 7 with listeners, rules, priority, and geolocation target groups; NLB Layer 4; GWLB Layer 3 virtual appliances; Classic LB), independent vs. built-in service load balancing workflows, resource pooling architectures (dedicated pools vs. hierarchical sibling and nested pool structures), dynamic scalability mechanisms (dynamic horizontal, dynamic vertical, dynamic relocation with pre-provisioned near-zero downtime), scaling vs. elastic scaling semantics, elastic resource capacity automation (Automated Scaling Listener + Intelligent Automation Engine + Hypervisor scripting), and Cloud Bursting architectures (Burst Out / Burst In, redundant pre-deployed inactive cloud implementations, and real-time database state replication).
Slug: cloud-architectures-workload-distribution-resource-pooling-and-bursting
Output: notes/cloud-architectures-workload-distribution-resource-pooling-and-bursting/cloud-architectures-workload-distribution-resource-pooling-and-bursting.html
CanonicalId: cloud-architectures-workload-distribution-resource-pooling-and-bursting
Style: default
EstimatedReadingTime: true
Lang: en
Tags: cloud architecture, load balancing, resource pooling, elasticity, cloud bursting
Status: drafting
Published: 2026-08-30
LastModified: 2026-08-30
</meta>
<draft>
- 1. Rapid Elasticity & Resource Organisation Objectives
    - Rapid Elasticity Recall (NIST 2011): Crucial for responding to demand fluctuations over time (changes in number of jobs and resource demand within a job) and managing resource availability fluctuations across multiple customers simultaneously.
    - Objectives of Resource Organisation: Achieve elasticity/scaling and balanced resource utilization across infrastructure.
    - 5 Architectural Methods: Workload Distribution, Service Load Balancing, Resource Pooling, Dynamic Scalability, Elastic Resource Capacity.
- 2. Workload Distribution Architecture & AWS ELB Mechanics
    - Aim: Distribute consumer workload over available cloud resources using horizontal scaling.
    - Key Component: Load Balancer (reduces over-utilization and under-utilization of compute resources).
    - AWS Elastic Load Balancing (ELB): Automatically distributes incoming traffic, achieves fault tolerance, seamlessly provides required load balancing capacity.
    - Client Seamlessness vs. Provider Configuration: "Seamless" means client feels zero disruption, but provider requires extensive underlying routing logic and target health configuration.
    - AWS Load Balancer Types:
        - Application Load Balancer (ALB): Layer 7 (Application level). Single point of contact, contains listeners. Listener checks requests via protocol/port. Rules route requests to registered targets in target groups based on priority, actions, and conditions. Default rule is mandatory. Targets can be grouped by geolocation (distance matters!).
        - Network Load Balancer (NLB): Layer 4 (Network level). Extreme performance, ultra-low latency, handles millions of requests/sec.
        - Gateway Load Balancer (GWLB): Layer 3 (IP/Gateway level). Routes traffic to third-party virtual appliances (firewalls, intrusion detection, deep packet inspection) before reaching application targets.
        - Classic Load Balancer (CLB): Legacy previous-generation load balancer kept for backward compatibility.
- 3. Service Load Balancing Architecture
    - Specialized variation of workload distribution architecture using redundant cloud service deployments and load balancers. Resource pool acts as duplicate cloud service.
    - Independent Load Balancer Workflow: Load balancer operates separately from cloud services and host servers. Intercepts requests, evaluates server health, forwards requests to available virtual servers. Horizontally scales processing.
    - Built-In Load Balancer Workflow: Load balancing logic is integrated inside cloud service/server environment. Requests land on Virtual Server A; built-in logic internally forwards requests to Virtual Servers B and C.
- 4. Resource Pooling Architecture (Dedicated vs. Hierarchical)
    - Aim: Aggregate diverse cloud resources to serve consumer needs, automatically maintaining identical IT resources perfectly in sync.
    - Resource Pools: Server pool (physical/virtual), CPU pool, Memory pool, Storage pool, Network pool.
    - Dedicated Pools vs. Hierarchical Structures: Dedicated sub-pools become overly complex when managing multiple pools for specific consumers. Solution: Hierarchical structure consisting of parent, sibling, and nested pools.
    - Sibling Resource Pools: Drawn from physically grouped IT resources in the same datacenter/facility (not spread across distant datacenters). Isolated from one another so each consumer gets exclusive access.
    - Nested Resource Pools: Larger pools divided into smaller pools containing exact same resource type, used to assign resource pools to different departments/groups within the same organization.
- 5. Dynamic Scalability Architecture & Dynamic Relocation
    - Aim: Enable variable resource utilization to meet demand fluctuations strictly based on predefined scaling conditions.
    - Dynamic Horizontal Scaling: Replicating resource instances dynamically.
    - Dynamic Vertical Scaling: Increasing processing capacity of single resource (adding RAM/CPU under heavy load).
    - Dynamic Relocation Mechanics: Relocating resource to host with larger capacity (e.g. moving to faster storage device with higher I/O). Near-zero downtime is achieved by pre-provisioning and configuring the target host before triggering relocation.
    - Scaling vs. Elastic Scaling Semantics: Default "scaling" implies scale UP; "elastic scaling" explicitly implies scaling BOTH UP and DOWN.
- 6. Elastic Resource Capacity Architecture
    - Aim: Dynamic provisioning of virtual servers to handle fluctuating processing requirements, dynamically allocating and reclaiming CPU/RAM before official capacity thresholds are reached.
    - Step-by-step Workflow:
        - 1. Consumers send requests to cloud service.
        - 2. Requests monitored continuously by Automated Scaling Listener.
        - 3. Intelligent Automation Engine deployed with workflow logic.
        - 4. Workflow logic capable of notifying resource pool via direct allocation requests.
        - 5. Requests increase dramatically.
        - 6. Automated scaling listener signals Intelligent Automation Engine to execute script.
        - 7. Script signals hypervisor to allocate more resources from resource pools.
        - 8. Hypervisor automatically allocates additional resources smoothly.
- 7. Cloud Bursting Architecture (Hybrid On-Premise Provisioning)
    - Aim: Scale on-premise IT resources directly into public cloud whenever local capacity thresholds are reached.
    - Burst Out: Dynamic scaling from on-premise up to cloud resources on high demand.
    - Burst In: Reverting back to on-premise operations and releasing cloud leases on lower demand.
    - Pre-deployed Inactive Instances: Cloud redundant implementations remain completely inactive until cloud bursting is triggered.
    - Crucial Components: Automated Scaling Listener (monitors on-premise usage threshold and redirects traffic to cloud) + Resource Replication System (synchronizes state management databases in real-time).
</draft>

# Cloud Architectures: Workload Distribution, Resource Pooling, Dynamic Scalability, and Cloud Bursting

Cloud computing architectures provide structural patterns to deliver rapid elasticity, high availability, and balanced resource utilization across distributed infrastructure. Presented by Anandha Gopalan (with thanks to Teo Yong Meng), these architectural mechanisms translate raw compute, memory, storage, and networking assets into resilient, self-healing, and dynamically scalable systems.

This technical note provides an exhaustive analysis of workload distribution architectures, AWS Elastic Load Balancer (ELB) internal mechanics, service load balancing workflows (independent vs. built-in), resource pooling models (sibling vs. nested pools), dynamic scalability mechanisms (including dynamic relocation with near-zero downtime), elastic resource capacity automation, and hybrid cloud bursting patterns.

---

## 1. Rapid Elasticity and Resource Organisation Objectives

NIST SP 800-145 defines **Rapid Elasticity** as a core essential characteristic. In practice, rapid elasticity is crucial for managing two primary dimensions of demand volatility:
1. **Workload Volatility**: Fluctuations in consumer demand over time, including variations in the number of concurrent jobs and changing resource demands within a single job.
2. **Resource Volatility**: Fluctuations in available cloud infrastructure capacity as providers serve thousands of distinct tenant workloads simultaneously.

```
+-------------------------------------------------------------------+
|               Resource Organisation Core Objectives               |
+-------------------------------------------------------------------+
| 1. Achieve Elasticity / Scaling   | Dynamic expansion & contraction|
| 2. Achieve Balanced Utilisation   | Prevent node hot-spotting      |
+-------------------------------------------------------------------+
| Architectural Implementation Methods:                              |
|  • Workload Distribution Architecture                             |
|  • Service Load Balancing Architecture                            |
|  • Resource Pooling Architecture                                  |
|  • Dynamic Scalability Architecture                               |
|  • Elastic Resource Capacity Architecture                         |
+-------------------------------------------------------------------+
```

---

## 2. Workload Distribution Architecture and AWS Load Balancer Mechanics

### 2.1 Workload Distribution Principles

The **Workload Distribution Architecture** distributes incoming consumer workloads across available cloud resources using horizontal scaling.

```
                          +-----------------------+
                          |   Service Consumer    |
                          +-----------+-----------+
                                      |
                                      v
                          +-----------------------+
                          |     Load Balancer     |
                          +---+---------------+---+
                              |               |
              +---------------+               +---------------+
              v                                               v
    +-------------------+                           +-------------------+
    | Virtual Server A  |                           | Virtual Server B  |
    | (Target Group 1)  |                           | (Target Group 2)  |
    +-------------------+                           +-------------------+
```

- **Core Component**: The **Load Balancer**, an infrastructure appliance or software service that intercepts traffic and distributes requests to prevent over-utilization or under-utilization of individual compute nodes.
- **Client Seamlessness vs. Provider Overhead**:
  - *Client Perspective*: Load balancing is completely **seamless**. Clients interact with a single endpoint without detecting backend instance additions, removals, or failovers.
  - *Provider Perspective*: Achieving seamlessness requires extensive underlying routing rules, health checks, target group registrations, and network address translation (NAT).

### 2.2 AWS Elastic Load Balancing (ELB) Architecture and Types

Amazon Web Services (AWS) utilizes Elastic Load Balancing to route traffic exclusively to **healthy targets**. AWS provides four specialized load balancer types across OSI network layers:

```
+-------------------------------------------------------------------+
|                  AWS Load Balancer Classification                 |
+-------------------------------------------------------------------+
| Application Load Balancer (ALB) | Layer 7 (HTTP/HTTPS, Web Apps)  |
| Network Load Balancer (NLB)     | Layer 4 (TCP/UDP, Low Latency)  |
| Gateway Load Balancer (GWLB)    | Layer 3 (IP Gateway, Appliances)|
| Classic Load Balancer (CLB)     | Legacy Generation (Backward Comp)|
+-------------------------------------------------------------------+
```

1. **Application Load Balancer (ALB)**: Operates at **Layer 7 (Application Level)**. Inspects HTTP/HTTPS headers, URL paths, and host headers to route web traffic.
2. **Network Load Balancer (NLB)**: Operates at **Layer 4 (Transport Level)**. Optimized for ultra-high throughput and ultra-low latency, handling millions of requests per second using static IP addresses.
3. **Gateway Load Balancer (GWLB)**: Operates at **Layer 3 (Network/Gateway Level)**. Acts as a transparent network gateway and load balancer that routes all inbound/outbound traffic through third-party virtual security appliances (e.g., deep packet inspection firewalls, intrusion detection systems) before forwarding packets to target application groups.
4. **Classic Load Balancer (CLB)**: Legacy load balancer operating across Layer 4/7, retained for backward compatibility with legacy AWS EC2-Classic networks.

### 2.3 Application Load Balancer Internal Routing Mechanics

An ALB acts as a single point of contact for clients and manages routing through **Listeners**, **Rules**, and **Target Groups**:

```
+-------------------------------------------------------------------+
|              AWS Application Load Balancer Routing                |
+-------------------------------------------------------------------+
|                                                                   |
|                      +---------------------+                      |
|                      |    Load Balancer    |                      |
|                      +----------+----------+                      |
|                                 |                                 |
|               +-----------------+-----------------+               |
|               v                                   v               |
|       +---------------+                   +---------------+       |
|       | Listener 80   |                   | Listener 443  |       |
|       |  - Rule 1     |                   |  - Rule 1     |       |
|       |  - Default    |                   |  - Rule 2     |       |
|       +-------+-------+                   +-------+-------+       |
|               |                                   |               |
|       +-------v-------+                   +-------v-------+       |
|       | Target Group A|                   | Target Group B|       |
|       | (Geo: US-East)|                   | (Geo: EU-West)|       |
|       |  [Target 1]   |                   |  [Target 1]   |       |
|       |  [Target 2]   |                   |  [Target 2]   |       |
|       | (Health Check)|                   | (Health Check)|       |
|       +---------------+                   +---------------+       |
+-------------------------------------------------------------------+
```

- **Listener**: A process that checks for connection requests using a configured protocol (e.g., HTTP, HTTPS) and port (e.g., 80, 443).
- **Rules**: Evaluated in priority order. Each rule consists of a **Priority**, one or more **Conditions** (e.g., path `/api/*`, host `app.example.com`), and one or more **Actions** (e.g., forward to Target Group). A **Default Rule** is mandatory to catch unmatched requests.
- **Target Groups & Geolocation Routing**: Target groups register compute instances, containers, or IP addresses. Target groups perform continuous **Health Checks** to confirm node readiness. Targets can be grouped based on **geolocation**—because network physical distance introduces latency, grouping targets by geographical position optimizes packet round-trip time (RTT).

---

## 3. Service Load Balancing Architecture

The **Service Load Balancing Architecture** is a specialized variant of workload distribution designed specifically for redundant cloud service instances. In this architecture, a resource pool acts as a duplicate cloud service tier.

```
Independent Load Balancer                      Built-In Load Balancer
+-----------------------+                    +-----------------------+
|   Service Consumer    |                    |   Service Consumer    |
+-----------+-----------+                    +-----------+-----------+
            |                                            |
            v                                            v
+-----------------------+                    +-----------------------+
| Independent Balancer  |                    | Virtual Server A      |
+---+---------------+---+                    | (Built-in LB Logic)   |
    |               |                        +---+---------------+---+
    v               v                            |               |
+-------+       +-------+                        v               v
| VM A  |       | VM B  |                    +-------+       +-------+
+-------+       +-------+                    | VM B  |       | VM C  |
                                             +-------+       +-------+
```

### 3.1 Independent Load Balancer Workflow

1. Cloud Service A is replicated and deployed across multiple distinct virtual servers.
2. An **Independent Load Balancer** (operating separately from the cloud services and host servers) intercepts inbound requests from service consumers.
3. The load balancer evaluates instance health and forwards requests across available virtual servers, successfully scaling processing horizontally.

### 3.2 Built-In Load Balancer Workflow

1. Cloud Service A is replicated across virtual servers A, B, and C.
2. Service consumer requests land directly on Virtual Server A.
3. **Built-in load balancing logic** integrated within Virtual Server A intercepts the request and internally distributes processing to Virtual Servers B and C.

---

## 4. Resource Pooling Architecture: Dedicated vs. Hierarchical Structures

The **Resource Pooling Architecture** aggregates physical and virtual IT resources of different types into managed pools to serve diverse tenant workloads, automatically maintaining identical IT resources in sync.

```
Resource Pool Types:
• Server Pool (Physical / Virtual)    • Memory Pool
• CPU Pool                            • Storage Pool    • Network Pool
```

```
Dedicated Sub-Pools (High Complexity)          Hierarchical Pool Structure (Scalable)
+------------------------------------+        +------------------------------------+
| Tenant A: Dedicated CPU/Mem/SAN    |        | Parent Resource Pool               |
+------------------------------------+        |   |-- Sibling Pool 1 (Facility A)  |
| Tenant B: Dedicated CPU/Mem/SAN    | ====>  |   |-- Sibling Pool 2 (Facility B)  |
+------------------------------------+        |        |-- Nested Pool (Dept A)    |
| Complex Management & Fragmented    |        |        |-- Nested Pool (Dept B)    |
+------------------------------------+        +------------------------------------+
```

### 4.1 Dedicated Pools vs. Hierarchical Pools

- **Dedicated Pools Issue**: Provisioning dedicated sub-pools (e.g., custom CPU, RAM, and storage sub-pools) for every individual consumer or application creates severe administrative complexity and resource fragmentation.
- **Hierarchical Structure Solution**: Cloud providers structure pools hierarchically into **Parent**, **Sibling**, and **Nested** pools to balance multi-tenant isolation with operational efficiency.

### 4.2 Sibling Resource Pools

- **Definition**: Sibling pools are drawn from physically grouped IT resources within the same data center or facility (rather than being distributed across distant geographic facilities).
- **Isolation Guarantee**: Sibling pools are isolated from one another, ensuring that each cloud consumer is granted access exclusively to its assigned pool without cross-tenant interference.

### 4.3 Nested Resource Pools

- **Definition**: Nested pools are created by subdividing larger resource pools into smaller sub-pools containing the exact same resource type.
- **Use Case**: Nested pools assign specific resource quotas to different departments, teams, or environments (e.g., Staging vs. Production) within the exact same organization.

---

## 5. Dynamic Scalability Architecture and Dynamic Relocation

The **Dynamic Scalability Architecture** adjusts resource allocations in real-time based strictly on predefined scaling conditions.

```
Dynamic Scalability Methods:

1. Dynamic Horizontal Scaling  | Replicate/terminate VM instances automatically
2. Dynamic Vertical Scaling    | Expand/contract CPU/RAM on a running VM instance
3. Dynamic Relocation          | Live-migrate VM to higher-capacity physical host
```

### 5.1 Dynamic Relocation Mechanics and Near-Zero Downtime

- **Relocation Trigger**: When an existing host server reaches physical hardware limits or I/O bottlenecks, a virtual server is physically relocated to a host with larger capacity (e.g., migrating to a faster host with higher SAN I/O bandwidth).
- **Near-Zero Downtime Strategy**: To prevent service disruption, the system pre-provisions and configures the target host machine *before* initiating hot relocation (live migration), reducing cutover downtime to near zero.

### 5.2 Scaling vs. Elastic Scaling Semantics

<block>
<strong>Semantic Distinction:</strong><br/>
• <strong>Scaling (Default)</strong>: By default, "scaling" refers to scaling <strong>UP</strong> (expanding capacity to handle higher load).<br/>
• <strong>Elastic Scaling</strong>: Refers explicitly to scaling <strong>UP and DOWN</strong> (dynamically expanding during traffic spikes and automatically reclaiming/shrinking resources when demand subsides).
</block>

---

## 6. Elastic Resource Capacity Architecture

The **Elastic Resource Capacity Architecture** automates the dynamic allocation and reclamation of CPU and RAM for virtual servers. An **Automated Scaling Listener** continuously monitors runtime virtual servers, allowing additional resources to be provisioned *before* official system capacity thresholds are breached.

```
+-------------------------------------------------------------------+
|            Elastic Resource Capacity Automation Flow              |
+-------------------------------------------------------------------+
| 1. Consumer Requests ===> [ Automated Scaling Listener ]           |
|                                    |                              |
|                            Monitors Traffic                       |
|                                    v                              |
|                      [ Intelligent Automation Engine ]             |
|                      (Executes Scripted Workflow Logic)           |
|                                    |                              |
|                            Direct Allocation Request              |
|                                    v                              |
|                      [ Hypervisor Allocation ]                    |
|                      (Allocates CPU/RAM from Pools)               |
+-------------------------------------------------------------------+
```

### Step-by-Step Execution Workflow

1. Cloud consumers send requests to a cloud service.
2. Inbound request traffic is continuously monitored by an **Automated Scaling Listener**.
3. An **Intelligent Automation Engine** is deployed, programmed with specific threshold workflow logic.
4. The workflow logic is configured to issue direct allocation requests to underlying resource pools.
5. Inbound consumer requests spike dramatically beyond baseline utilization.
6. The Automated Scaling Listener detects the spike and signals the Intelligent Automation Engine to execute its scaling script.
7. The script executes workflow logic that signals the hypervisor to allocate additional CPU/RAM from resource pools.
8. The hypervisor automatically allocates additional resources to the running virtual server, maintaining smooth performance.

---

## 7. Cloud Bursting Architecture (Scaling On-Premise Provisioning)

The **Cloud Bursting Architecture** is a hybrid cloud pattern that scales on-premise IT resources directly into public cloud infrastructure whenever local datacenter capacity thresholds are reached.

```
+-------------------------------------------------------------------+
|                    Cloud Bursting Architecture                    |
+-------------------------------------------------------------------+
|                                                                   |
|   ON-PREMISE DATACENTER                   PUBLIC CLOUD            |
|  +-----------------------+           +-----------------------+    |
|  | Service Consumer A    |           | Redundant Cloud       |    |
|  +-----------+-----------+           | Service A (Inactive)  |    |
|              |                       +-----------^-----------+    |
|  +-----------v-----------+                       |                |
|  | Automated Scaling     |                       |                |
|  | Listener (Monitors)   |======= Redirect ======|                |
|  +-----------+-----------+  (Threshold Exceeded)                  |
|              |                                                    |
|  +-----------v-----------+           +-----------------------+    |
|  | On-Prem Database      | <======== | Cloud State Database  |    |
|  +-----------------------+  State    +-----------------------+    |
|                             Replication                           |
+-------------------------------------------------------------------+
```

### 7.1 Burst Out vs. Burst In

- **Burst Out**: Dynamic expansion from on-premise resources to public cloud instances when local usage thresholds are exceeded during demand spikes.
- **Burst In**: Reverting operations back to on-premise infrastructure and releasing leased cloud instances when traffic subsides to baseline levels.

### 7.2 Core Architectural Requirements

1. **Pre-Deployed Inactive Cloud Services**: Cloud service implementations are pre-deployed on the cloud and remain completely **inactive** (incurring minimal cost) until cloud bursting is triggered.
2. **Automated Scaling Listener**: Monitors on-premise service utilization. When local thresholds are breached, the listener instantly redirects new service consumer requests to the redundant cloud implementation.
3. **Real-Time Resource Replication System**: Operates continuously in the background to ensure on-premise state management databases and cloud state databases remain perfectly synchronized.

---

## 8. Summary

Cloud architectures transform static IT resources into dynamic, self-scaling systems. Workload distribution leverages load balancers (such as AWS ALB Layer 7 with listeners and geolocation target groups, NLB Layer 4, and GWLB Layer 3 virtual appliances) to achieve horizontal scalability seamlessly. Service load balancing deploys independent or built-in load balancing logic. Resource pooling manages capacity through hierarchical Parent, Sibling, and Nested pools. Dynamic scalability enables dynamic horizontal/vertical scaling and live relocation with near-zero downtime. Elastic resource capacity automates CPU/RAM provisioning using Automated Scaling Listeners and Intelligent Automation Engines, while Cloud Bursting enables hybrid on-premise infrastructure to burst into public cloud resources during demand surges with real-time state database synchronization.

<reviewkit>
<takeaways>
- **Rapid Elasticity & Objectives:** Resource organization aims to achieve elasticity/scaling and balanced resource utilization across workload and resource volatility.
- **Workload Distribution & AWS ELB:** Load balancers enable horizontal scaling seamlessly for consumers. AWS provides ALB (Layer 7 HTTP with rules and geolocation target groups), NLB (Layer 4 TCP/UDP), GWLB (Layer 3 virtual appliances), and CLB (Legacy).
- **Independent vs. Built-In Load Balancing:** Independent load balancers operate separately to intercept traffic. Built-in load balancers integrate routing logic inside the primary application server instance.
- **Hierarchical Resource Pooling:** Hierarchical structures use Parent, Sibling (physically grouped in facility, isolated per tenant), and Nested pools (sub-divided for internal departments) to eliminate dedicated pool complexity.
- **Dynamic Scalability & Relocation:** Dynamic relocation live-migrates VMs to higher-capacity hosts with near-zero downtime by pre-provisioning target hosts. "Scaling" defaults to scale UP; "Elastic Scaling" implies scaling UP and DOWN.
- **Elastic Resource Capacity:** Automated Scaling Listeners monitor capacity and trigger Intelligent Automation Engines to script hypervisors to dynamically allocate/reclaim CPU and RAM.
- **Cloud Bursting Architecture:** Scales on-premise workloads into public cloud resources during traffic surges (Burst Out) and releases cloud leases when traffic normalizes (Burst In). Relies on pre-deployed inactive cloud instances, automated listeners, and real-time database state replication.
</takeaways>
<qprompt/>
</reviewkit>

## References

1. Erl, T., Puttini, R., & Mahmood, Z. (2013). *Cloud Computing: Concepts, Technology & Architecture*. Prentice Hall.
2. Mell, P., & Grance, T. (2011). *The NIST Definition of Cloud Computing*. National Institute of Standards and Technology (NIST), Special Publication 800-145.
3. Amazon Web Services. (2024). *What is Elastic Load Balancing?*. AWS Documentation.
