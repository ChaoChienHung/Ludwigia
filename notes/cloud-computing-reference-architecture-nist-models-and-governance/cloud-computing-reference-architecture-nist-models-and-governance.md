<meta>
Title: Cloud Computing Reference Architecture: NIST SP 500-292 Models, Service Layering, and Cloud Governance
Summary: A detailed technical exploration of cloud computing reference architectures and governance frameworks. Covers NIST SP 800-145 five essential characteristics (on-demand self-service, broad network access, resource pooling, rapid elasticity, measured service), single tenant vs. multi-tenancy dynamics, primary service models (IaaS, PaaS, SaaS), strict PaaS disqualification rules, the 10-layer responsibility stack matrix, cross-provider PaaS/IaaS wrapping for data localization compliance, Function-as-a-Service (FaaS / serverless) mechanics, NIST SP 500-292 reference architecture and five major cloud actors (Consumer, Provider, Auditor, Broker with 3 services, Carrier with SLAs), provider functions (3-layer Service Orchestration, Cloud Service Management, Security, Privacy), deployment models (Public, Private On-Site vs. Out-Sourced, VPC, Community Cloud with IAM, Hybrid, Sovereign Cloud), and code vs. data decoupling patterns.
Slug: cloud-computing-reference-architecture-nist-models-and-governance
Output: notes/cloud-computing-reference-architecture-nist-models-and-governance/cloud-computing-reference-architecture-nist-models-and-governance.html
CanonicalId: cloud-computing-reference-architecture-nist-models-and-governance
Style: default
EstimatedReadingTime: true
Lang: en
Tags: cloud computing, NIST reference architecture, iaas, paas, saas, cloud governance
Status: drafting
Published: 2026-08-30
LastModified: 2026-08-30
</meta>
<draft>
- 1. NIST SP 800-145 Five Essential Characteristics
    - On-demand Self-service: Consumers unilaterally provision computing capabilities (server time, network storage) automatically without requiring human interaction with each service provider. Access via service portals.
    - Broad Network Access: Ubiquitous accessibility over network connections promoting use by heterogeneous client platforms (mobile phones, tablets, laptops, workstations).
    - Resource Pooling: Provider's computing resources pooled to serve multiple consumers using a multi-tenant model, with physical/virtual resources dynamically assigned. Location independence.
    - Rapid Elasticity: Capabilities elastically provisioned and released (automatically) to scale rapidly outward and inward commensurate with demand.
    - Measured Service: Cloud systems automatically control and optimize resource use by leveraging a metering capability at some level of abstraction (storage, processing, bandwidth, active user accounts). Pay-per-use billing structure.
- 2. Resource Pooling & Multi-Tenancy Dynamics
    - Single Tenant: Model where each cloud consumer receives a completely separate, dedicated IT resource instance (maximum control, zero co-location risk, higher cost).
    - Multi-Tenancy: Model where the cloud provider pools IT resources to serve multiple consumers simultaneously, meaning a single instance of a program/virtual server serves multiple tenants. Drastically improves resource utilization, usability, and operational efficiency.
- 3. Three Primary Service Models & Layering Concept
    - Layering System: Without Infrastructure -> no Platform; without Platform -> no Software! Use depending on management/abstraction need.
    - SaaS (Software-as-a-Service): Consumers use provider applications over a network (Salesforce, Google Workspace, Microsoft 365). Provider installs and maintains software; consumer runs remotely without local installation (mobile native apps don't strictly count as pure SaaS if installed locally).
    - PaaS (Platform-as-a-Service): Consumers deploy customer-created or acquired applications onto the cloud infrastructure using programming languages, libraries, tools supported by provider (GAE, Heroku, Azure App Service). Provider develops platform software (app server + DBMS platforms) & hosts compute; consumer incorporates platform into app development.
    - IaaS (Infrastructure-as-a-Service): Consumers rent basic computing capabilities like processing, storage, networking (Amazon EC2, DigitalOcean, Linode, Alibaba ECS). Lowest abstraction level; virtual resources abstract physical hardware.
- 4. PaaS Disqualification Rules & Structural Components
    - Two Parts of PaaS: Platform Software (app server + DBMS platforms) + Computing Resources needed to run platform software.
    - What Disqualifies a Service from Being PaaS:
        - 1. If you can only use an end-user UI without bringing code -> SaaS (Salesforce, Google Workspace, Jira).
        - 2. If you must configure the operating system, kernel patches, and VM networking yourself -> IaaS (raw AWS EC2, Azure VMs, Google Compute Engine).
        - 3. If it only stores data or executes predefined query APIs -> Managed DB / DBaaS.
        - Core Rule: If a service does not provide the environment and runtime to deploy, configure, and execute custom or acquired application code, it ceases to be PaaS.
- 5. The 10-Layer Management Responsibility Stack
    - 10 Layers: Network, Storage, Server, Virtualization, OS, Database, Integration, Runtime, Application, Data.
    - Management Split: On-Premise (Consumer 10/10), IaaS (Provider 5/10, Consumer 5/10), PaaS (Provider 8/10, Consumer 2/10), SaaS (Provider 10/10, Consumer 0/10).
- 6. Combining Service Models & Service Variants
    - Combining Models & Wrappers: Consumer subscribes to PaaS from Provider X (Cloud A), physically hosted on IaaS from Provider Y (Cloud B) located in consumer's region to satisfy data localization laws. Wrappers enable easy deployment across platforms.
    - Function-as-a-Service (FaaS / Serverless): Lightweight reactive programs executing on-demand without maintaining server infrastructure costs. "Serverless" does not mean no servers exist—servers still run the code under the hood!
    - Service Variants: Storage-as-a-Service, DBaaS, Security-as-a-Service, CaaS, Integration-as-a-Service, Testing-as-a-Service, XaaS.
- 7. NIST SP 500-292 Conceptual Reference Architecture
    - Purpose: Focuses on "what" cloud services provide, not "how" designed/implemented. Vendor- and implementation-independent reference framework.
- 8. Five Major Cloud Actors
    - Cloud Consumer: Person or organization maintaining business relationship with and using cloud services.
    - Cloud Provider: Entity offering SaaS, PaaS, or IaaS. Core functions:
        - Service Orchestration: 3-layer system (Service Layer [SaaS/PaaS/IaaS], Resource Abstraction & Control Layer, Physical Resource Layer [Hardware & Facility]) composing components to manage computing resources.
        - Cloud Service Management: Business Support (accounting, billing, pricing, rating), Provisioning & Configuration (rapid deployment, resource changes for upgrades/repairs), Portability & Interoperability.
        - Security & Privacy: Cross-cutting concerns safeguarding Personal Information (PI) and Personally Identifiable Information (PII).
    - Cloud Auditor: Independent party evaluating cloud service controls, security, privacy impacts, performance, and regulation/policy compliance (most common auditor: government).
    - Cloud Broker: Manages use, performance, delivery. 3 Broker services: Service Intermediation (value-added services), Service Aggregation (combining services, data integration, secure cross-provider movement), Service Arbitrage (flexibility to switch providers).
    - Cloud Carrier: Provides network connectivity & transport between provider and consumer backed by SLAs (may provide dedicated, secure lines).
- 9. Cloud Deployment Models
    - Public Cloud: Shared public infrastructure, pay-as-you-go, provider-managed, low upfront costs.
    - Private Cloud: Exclusive use by a single organization (On-Site Private Cloud vs Out-Sourced Private Cloud). Virtual Private Cloud (VPC): Secure, isolated, customizable environment hosted within a public cloud.
    - Community Cloud: Shared by multiple organizations with common operational/regulatory requirements (healthcare, government, education). Managed by Cloud Manager, using IAM (Identity Access Manager) to control multi-organization access across shared policies and protocols.
    - Hybrid Cloud: Combination of 2+ distinct clouds (on-site private, off-site private, public, community) connected for data and application interoperability.
    - Sovereign Cloud: Specialized deployment model designed to meet strict regulatory and compliance needs of a country or jurisdiction. Ensures all data and metadata are stored exclusively within national borders to prevent foreign access under all circumstances (Microsoft Sovereign Cloud, Oracle Sovereign Cloud, SAP Sovereign Cloud).
- 10. Security, Trust Boundaries, and Code vs. Data Decoupling
    - Trust Boundary & Shared Responsibility Model: Logical perimeter defining trusted assets; public cloud expands trust boundary.
    - Multi-Tenancy Overlapping Trust Boundaries: Shared hardware creates co-location risks (Option for Dedicated Instances / Bare Metal for higher control at higher cost).
    - Code vs. Data Decoupling Architecture: Repatriation does not require moving code and data together. Application code (less sensitive, needs compute elasticity) remains deployed on public cloud; highly sensitive data and proprietary databases are retained on-premise behind corporate firewalls to satisfy compliance and minimize security exposure.
</draft>

# Cloud Computing Reference Architecture: NIST SP 500-292 Models, Service Layering, and Cloud Governance

Cloud computing reference architectures establish standardized, vendor-neutral frameworks for evaluating service delivery, actor responsibilities, resource management, and regulatory compliance. Formulated by the National Institute of Standards and Technology (NIST), these reference models define **what** cloud services provide rather than **how** individual vendor systems are implemented.

This technical note provides an exhaustive analysis of the NIST SP 800-145 essential characteristics, multi-tenancy dynamics, the 10-layer responsibility management stack, PaaS disqualification rules, cross-provider service wrappers, Function-as-a-Service (FaaS), the NIST SP 500-292 conceptual reference model (covering five major cloud actors), deployment paradigms (including Community Cloud IAM and Sovereign Cloud), and code vs. data decoupling governance.

---

## 1. NIST SP 800-145: Five Essential Characteristics

NIST SP 800-145 defines five essential characteristics that establish the baseline technical definition of cloud computing:

```
+-------------------------------------------------------------------+
|               NIST 5 Essential Cloud Characteristics               |
+-------------------------------------------------------------------+
| 1. On-Demand Self-Service  | Automated resource provisioning via UI|
| 2. Broad Network Access    | Access via heterogeneous devices/WAN |
| 3. Resource Pooling        | Multi-tenant location-independent pool|
| 4. Rapid Elasticity        | Rapid scale-out and scale-in on demand|
| 5. Measured Service        | Pay-per-use metered billing structure  |
+-------------------------------------------------------------------+
```

1. **On-Demand Self-Service**: A consumer can unilaterally provision computing capabilities (such as server time and network storage) automatically without requiring human interaction with each service provider. Access is typically managed via self-service web portals or automated APIs.
2. **Broad Network Access**: Capabilities are available over network connections and accessed through standard mechanisms that promote use by heterogeneous client platforms (e.g., mobile phones, tablets, laptops, and workstations).
3. **Resource Pooling**: The provider's computing resources are pooled to serve multiple consumers using a **multi-tenant model**, with different physical and virtual resources dynamically assigned and reassigned according to consumer demand. There is a degree of location independence in that the customer generally has no control or knowledge over the exact physical location of provided resources.
4. **Rapid Elasticity**: Capabilities can be elastically provisioned and released (often automatically) to scale rapidly outward and inward commensurate with demand. To the consumer, the capabilities available for provisioning often appear to be unlimited and can be appropriated in any quantity at any time.
5. **Measured Service**: Cloud systems automatically control and optimize resource use by leveraging a metering capability at some level of abstraction appropriate to the type of service (e.g., storage, processing, bandwidth, and active user accounts). Resource usage can be monitored, controlled, and reported, providing transparency for both provider and consumer through pay-per-use billing structures.

---

## 2. Resource Pooling and Multi-Tenancy Dynamics

Resource allocation models determine how hardware and virtual server instances serve enterprise consumers:

```
Single Tenant Model                              Multi-Tenancy Model
+-------------------------------+              +-------------------------------+
| Tenant A -> Dedicated Server  |              | Tenant A  Tenant B  Tenant C  |
+-------------------------------+              +-------------------------------+
| Tenant B -> Dedicated Server  |   ======>    | Shared Software & VM Instance |
+-------------------------------+              +-------------------------------+
| High Cost, Zero Co-location   |              | Pooled Hardware, High Usage   |
+-------------------------------+              +-------------------------------+
```

- **Single Tenant**: A model where each cloud consumer receives a completely separate, dedicated IT resource instance. Offers maximum control, custom isolation, and zero co-location security risks, but incurs high operational and procurement costs.
- **Multi-Tenancy**: A model where the cloud provider pools IT resources to serve multiple consumers simultaneously. A single software application instance or virtual server cluster serves multiple tenants. 
  - *Core Benefit*: Significantly improves resource utilization, operational efficiency, and usability, ensuring physical hardware cycles are not wasted on idle single-tenant servers.

---

## 3. Dissection of Cloud Service Models and Service Layering

Cloud service models represent a **layering system**. Without Infrastructure, a Platform cannot exist; without a Platform, Software cannot execute. Different models offer varying levels of abstraction and management control based on organizational needs.

```
+-------------------------------------------------------------------+
|               Cloud Service Abstraction Hierarchy                 |
+-------------------------------------------------------------------+
|  SaaS (Software-as-a-Service)     | Fully managed application UI  |
|  (Salesforce, Google Workspace)   | (End-User Remote Access)      |
+-----------------------------------+-------------------------------+
|  PaaS (Platform-as-a-Service)     | Ready-made execution runtime  |
|  (Google App Engine, Heroku)      | (Developer Code Deployment)   |
+-----------------------------------+-------------------------------+
|  IaaS (Infrastructure-as-a-Service)| Virtual compute, Net, Storage|
|  (AWS EC2, DigitalOcean, Linode)  | (SysAdmin VM Control)         |
+-------------------------------------------------------------------+
```

### 3.1 Infrastructure-as-a-Service (IaaS)

Consumers rent basic computing capabilities like processing power, storage arrays, and networking infrastructure (e.g., Amazon EC2, DigitalOcean, Linode, Alibaba ECS). This is the lowest level of abstraction, where physical servers, storage, networks, and middleware are abstracted as virtual resources. The machine obtained from the provider is a virtualized notion rather than direct physical hardware.

### 3.2 Platform-as-a-Service (PaaS) and Disqualification Criteria

- **NIST PaaS Definition**: The capability provided to the consumer is to deploy onto the cloud infrastructure consumer-created or acquired applications created using programming languages, libraries, services, and tools supported by the provider (e.g., Google App Engine, Heroku, Azure App Service).
- **Two Structural Components**:
  1. *Platform Software*: Product offering consisting of application servers, DBMS platforms, development libraries, and execution middleware.
  2. *Compute Resources*: Infrastructure needed to run the platform software.
- **PaaS Provider vs. Consumer Roles**:
  - *PaaS Provider*: Develops the platform software and decides where to host/run compute resources.
  - *PaaS Consumer*: Incorporates the ready-made PaaS platform into their application development and deploys application code onto the cloud.

```
+-------------------------------------------------------------------+
|               PaaS Disqualification Rules                         |
+-------------------------------------------------------------------+
| Disqualification Condition                 | Classified As         |
+--------------------------------------------+----------------------+
| 1. Only end-user UI; no custom code import | SaaS (Salesforce)    |
| 2. Must configure OS, patches, networking  | IaaS (Raw AWS EC2)   |
| 3. Only stores data / executes query APIs  | DBaaS / Managed Tier |
+--------------------------------------------+----------------------+
| Rule: If a service lacks runtime to deploy and execute custom     |
| application code, it ceases to be PaaS!                            |
+-------------------------------------------------------------------+
```

### 3.3 Software-as-a-Service (SaaS)

Consumers use the provider's applications over a network (e.g., Salesforce.com, Google Workspace, Microsoft 365). The provider installs, updates, and maintains the software, while the consumer runs it remotely. 
- *Installation Rule*: SaaS requires zero local software installation. Therefore, native mobile applications installed locally on a device do not strictly count as pure SaaS if execution logic runs locally on client hardware.

---

## 4. The 10-Layer Management Responsibility Stack

The management split between cloud consumer and provider across the four computing environments is defined across ten architectural layers:

| Layer # | Technical Component | On-Premise | IaaS (Infrastructure) | PaaS (Platform) | SaaS (Software) |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **10** | **Data** | Consumer | **Consumer** | **Consumer** | **Consumer** |
| **9** | **Application** | Consumer | **Consumer** | **Consumer** | Provider |
| **8** | **Runtime** | Consumer | **Consumer** | Provider | Provider |
| **7** | **Integration** | Consumer | **Consumer** | Provider | Provider |
| **6** | **Database** | Consumer | **Consumer** | Provider | Provider |
| **5** | **Operating System** | Consumer | Provider | Provider | Provider |
| **4** | **Virtualization** | Consumer | Provider | Provider | Provider |
| **3** | **Server** | Consumer | Provider | Provider | Provider |
| **2** | **Storage** | Consumer | Provider | Provider | Provider |
| **1** | **Network** | Consumer | Provider | Provider | Provider |
| **Sum** | **Management Split** | **Consumer 10/10** | **5 Provider / 5 Consumer** | **8 Provider / 2 Consumer** | **10 Provider / 0 Consumer** |

---

## 5. Combining Service Models, Wrappers, and FaaS

### 5.1 Combining IaaS and PaaS (Cross-Provider Wrapping)

Cloud service models can be combined across different providers to fulfill legal data localization or regional hosting requirements:

```
+-------------------------------------------------------------------+
|                 Combining PaaS and IaaS (Cross-Cloud)             |
+-------------------------------------------------------------------+
|                                                                   |
|   Cloud Consumer (Subscribes to PaaS from Provider X)             |
|                          |                                        |
|                          v                                        |
|   +-----------------------------------------------------------+   |
|   | PaaS Cloud Provider X (Cloud A)                           |   |
|   | Provides Ready-Made App Server & Runtime Environment      |   |
|   +-----------------------------+-----------------------------+   |
|                                 | Wrapper / Host Connection   |
|                                 v                             |
|   +-----------------------------------------------------------+   |
|   | IaaS Cloud Provider Y (Cloud B - In Consumer's Region)    |   |
|   | Physically Hosts Compute & Storage to satisfy Data        |   |
|   | Localization Compliance Regulations                       |   |
|   +-----------------------------------------------------------+   |
+-------------------------------------------------------------------+
```

- **Use Case**: A consumer subscribes to a PaaS offered by Provider X (Cloud A). To comply with regional data storage laws, the services offered by Provider X are physically hosted on an IaaS from Provider Y (Cloud B) located in the consumer's required geographic region. Providers supply software wrappers to enable seamless deployment across platforms.

### 5.2 Function-as-a-Service (FaaS) and Serverless Mechanics

- **FaaS Mechanics**: FaaS (serverless computing) consists of lightweight, event-driven programs that execute reactively in response to events (HTTP requests, database triggers).
- **Cost & Server Reality**:
  - *Cost Advantage*: Users execute code on-demand without incurring the cost of maintaining dedicated servers or running idle infrastructure.
  - *Server Reality Check*: "Serverless" does not mean no servers exist. Servers are still fully required to execute the code; server management, provisioning, and operating system maintenance are completely handled by the cloud provider.

---

## 6. NIST SP 500-292 Conceptual Reference Architecture

NIST SP 500-292 establishes a common, vendor-independent reference framework to describe, discuss, and develop system-specific cloud architectures. It focuses strictly on **what** cloud services provide rather than **how** individual vendor systems are implemented.

```
+-----------------------------------------------------------------------------------+
|                       NIST SP 500-292 Reference Model Architecture                |
+-----------------+-------------------------------------------------+---------------+
|  Cloud Consumer |                 Cloud Provider                  | Cloud Broker  |
|                 |  +-------------------------------------------+  |               |
|                 |  | Service Orchestration                     |  | • Service     |
|                 |  |  - Service Layer (SaaS, PaaS, IaaS)       |  |   Intermedi-  |
|  Cloud Auditor  |  |  - Resource Abstraction & Control Layer   |  |   ation       |
|                 |  |  - Physical Resource Layer (HW, Facility) |  | • Service     |
|  • Security     |  +-------------------------------------------+  |   Aggregation |
|    Audit        |  | Cloud Service Management                  |  | • Service     |
|  • Privacy      |  |  - Business Support (Billing, Pricing)    |  |   Arbitrage   |
|    Impact Audit |  |  - Provisioning / Configuration           |  |               |
|  • Performance  |  |  - Portability / Interoperability         |  |               |
|    Audit        |  +-------------------------------------------+  |               |
|                 |  | Security | Privacy                        |  |               |
+-----------------+-------------------------------------------------+---------------+
|                                   Cloud Carrier                                   |
+-----------------------------------------------------------------------------------+
```

### 6.1 The Five Major Cloud Actors

1. **Cloud Consumer**: A person or organization that maintains a business relationship with and uses services from cloud providers.
2. **Cloud Provider**: An entity (offering SaaS, PaaS, or IaaS) responsible for making cloud services available to consumers.
3. **Cloud Auditor**: An independent party that conducts objective examinations of cloud service controls, system operations, performance, privacy impacts, and security controls to verify regulation and policy compliance.
   - *Government Role*: The most common cloud auditor is a government regulatory body enforcing data privacy and security laws.
4. **Cloud Broker**: An entity that manages the use, performance, and delivery of cloud services, negotiating relationships between providers and consumers.
5. **Cloud Carrier**: An intermediary providing connectivity and transport of cloud services between providers and consumers, backed by Service Level Agreements (SLAs).

---

## 7. Cloud Provider Core Subsystems

The Cloud Provider architecture integrates three primary operational subsystems:

```
+-------------------------------------------------------------------+
|               Cloud Provider Functional Subsystems                |
+-------------------------------------------------------------------+
| 1. Service Orchestration Layer                                    |
|    • Service Layer: Exposes SaaS, PaaS, and IaaS service APIs     |
|    • Resource Abstraction & Control Layer: Hypervisors, SDN, SAN  |
|    • Physical Resource Layer: Physical Hardware and Datacenter    |
+-------------------------------------------------------------------+
| 2. Cloud Service Management Subsystem                             |
|    • Business Support: Billing, accounting, pricing, rating       |
|    • Provisioning/Configuration: Automated deployment, repairs    |
|    • Portability/Interoperability: Cross-cloud migration tools    |
+-------------------------------------------------------------------+
| 3. Cross-Cutting Concerns: Security & Privacy (PI / PII Protection)|
+-------------------------------------------------------------------+
```

1. **Service Orchestration (3 Layers)**: Composes system components to arrange, coordinate, and manage computing resources for cloud services:
   - *Service Layer*: SaaS, PaaS, and IaaS interfaces.
   - *Resource Abstraction and Control Layer*: Virtualization hypervisors, software-defined networking, and virtual storage management.
   - *Physical Resource Layer*: Physical hardware assets (compute, storage, network) and facility infrastructure (datacenter buildings, power, cooling).
2. **Cloud Service Management**:
   - *Business Support*: Set of business-related services to deal with consumers, including billing, accounting, pricing models, and rating engines.
   - *Provisioning/Configuration*: Rapid automated deployment based on requested resources, plus resource assignment adjustments for upgrades, repairs, and node scaling.
   - *Portability and Interoperability*: Mechanisms enabling data portability, service interoperability, and system portability across cloud boundaries.
3. **Security and Privacy**: Cross-cutting concerns spanning all layers and actors to safeguard Personal Information (PI) and Personally Identifiable Information (PII).

---

## 8. Cloud Broker Services and Carrier SLAs

### 8.1 Cloud Broker Services

Cloud brokers assist consumers in managing the integration and delivery of cloud services through three primary mechanisms:

1. **Service Intermediation**: Delivering value-added services on top of existing cloud services (e.g., identity management wrappers, custom security controls).
2. **Service Aggregation**: Combining and integrating multiple distinct cloud services into one or more new services, providing data integration and ensuring secure data movement between consumers and multiple providers.
3. **Service Arbitrage**: Providing consumers with the flexibility to dynamically choose, compare, and switch between services from multiple different cloud agencies based on cost or performance.

### 8.2 Cloud Carrier SLAs

Cloud carriers provide network connectivity and transport between providers and consumers. Cloud providers establish Service Level Agreements (SLAs) with carriers to guarantee consistent service delivery. In high-security environments, carriers supply **dedicated, secured physical connections** (e.g., AWS Direct Connect, Azure ExpressRoute).

---

## 9. Cloud Deployment Models and Sovereign Cloud

Cloud deployment models define access privileges, administrative boundaries, and governance constraints.

```
+-------------------------------------------------------------------+
|                     Cloud Deployment Models                       |
+-------------------------------------------------------------------+
|  Public Cloud     | Open to general public; pay-as-you-go         |
|  Private Cloud    | Exclusive single org use (On-Site / Out-sourced)|
|  Community Cloud  | Shared by orgs with common goals (IAM Managed)|
|  Hybrid Cloud     | Interoperable multi-cloud combination         |
|  Sovereign Cloud  | Data & metadata locked inside national borders|
+-------------------------------------------------------------------+
```

### 9.1 Public Cloud

Made available to the general public over shared infrastructure. Organizations act as consumers accessing IT resources provided by third-party providers (Amazon, Microsoft, Google, IBM). Offers low upfront pay-as-you-go costs, high availability, and provider-managed maintenance.

### 9.2 Private Cloud (On-Site vs. Out-Sourced) and VPC

- **Private Cloud**: Dedicated to the exclusive use of a single organization, offering high control over sensitive data, restricted access, and in-house or outsourced maintenance.
  - *On-Site Private Cloud*: Infrastructure hosted within the organization's physical datacenter.
  - *Out-Sourced Private Cloud*: Hosted by a third-party cloud provider on dedicated hardware exclusively allocated to the organization.
- **Virtual Private Cloud (VPC)**: A secure, isolated, customizable virtual environment hosted within a public cloud infrastructure.

### 9.3 Community Cloud and IAM Governance

- **Community Cloud Architecture**: Shared by multiple organizations that have common operational, regulatory, or security requirements (common in healthcare, government, and education).
- **IAM Governance**: Community clouds utilize a **Cloud Manager** backed by an **Identity Access Manager (IAM)** system to govern and monitor access across shared policies, protocols, storage buckets, security controls, data governance tools, reporting engines, and logging infrastructure.

```
+-------------------------------------------------------------------+
|                    Community Cloud Architecture                   |
+-------------------------------------------------------------------+
|   ORG 1  ----+                                                    |
|              |---> [ Shared Policies ]                            |
|   ORG 2  ----+           |                                        |
|              |---> [    IAM    ] ===> [    CLOUD MANAGER    ]     |
|   ORG 3  ----+           |            | Storage | Apps | Security |
|                    [ Shared Protocols]| Data Governance | Logging  |
+-------------------------------------------------------------------+
```

### 9.4 Hybrid Cloud

Consists of two or more distinct clouds (on-site private, off-site private, community, or public) that remain separate entities but are connected together to allow data and application interoperability. Enables organizations to balance control and cost—e.g., storing sensitive data on a private cloud while executing application workloads on a public cloud.

### 9.5 Sovereign Cloud

- **Why Sovereign Cloud**: Designed to meet the strict regulatory and compliance requirements of a specific country or jurisdiction.
- **Data Sovereignty Mandate**: Guarantees that **all data and metadata are stored exclusively within national geographic borders** to adhere to local data protection laws and prevent foreign access or foreign subpoena disclosure under all circumstances (e.g., Microsoft Sovereign Cloud, Oracle Sovereign Cloud, SAP Sovereign Cloud).

---

## 10. Security Boundaries and Code vs. Data Decoupling

### 10.1 Shared Responsibility Model and Trust Boundaries

A **Trust Boundary** is a logical perimeter defining which IT resources are trusted by an organization. Shifting to public clouds expands trust boundaries across external networks, introducing overlapping trust boundaries in multi-tenant environments. Malicious co-located tenants may exploit hypervisor side-channel flaws (e.g., Spectre/Meltdown). To eliminate co-location risks, organizations opt for **Dedicated Instances** or **Bare Metal Servers** at higher cost.

### 10.2 Code vs. Data Decoupling Architecture

When implementing hybrid governance or cloud repatriation, organizations do not need to assume code and data must always be co-located.

```
+-------------------------------------------------------------------+
|               Code vs. Data Decoupling Architecture               |
+-------------------------------------------------------------------+
|                                                                   |
|   +-----------------------------------------------------------+   |
|   |                  PUBLIC CLOUD ENVIRONMENT                 |   |
|   |  • Application Code, Microservices, & Public API Endpoints|   |
|   |  • Less Sensitive, High Elasticity & Global Scalability   |   |
|   +-----------------------------+-----------------------------+   |
|                                 |                                 |
|                         Secure Encrypted                          |
|                       Tunnel (VPN / Direct)                       |
|                                 |                                 |
|   +-----------------------------v-----------------------------+   |
|   |             ON-PREMISE PRIVATE DATACENTER                 |   |
|   |  • Sensitive Databases, Proprietary Assets, Citizen Data  |   |
|   |  • High Security, Strict Compliance, Local Firewalls      |   |
|   +-----------------------------------------------------------+   |
+-------------------------------------------------------------------+
```

<callout style="info">
<strong>Hybrid Separation Pattern:</strong><br/>
• <strong>Code on Cloud</strong>: Application logic, stateless microservices, web servers, and public-facing APIs reside on public cloud infrastructure. This layer carries lower security sensitivity and benefits directly from cloud auto-scaling, global CDN distribution, and high availability.<br/>
• <strong>Data On-Premise</strong>: Highly sensitive customer records, proprietary databases, and regulated data assets remain stored in private on-premise datacenters behind local enterprise firewalls. This satisfies strict data localization laws (e.g., Singapore citizen data residency), avoids network data egress charges, and prevents co-location risks without sacrificing compute scalability.
</callout>

---

## 11. Summary

NIST SP 800-145 and SP 500-292 establish standard reference architectures for evaluating cloud capability delivery. NIST defines five essential characteristics: on-demand self-service, broad network access, resource pooling, rapid elasticity, and measured service. Management responsibilities are split across a 10-layer stack spanning On-Premise (Consumer 10/10), IaaS (5/5 split), PaaS (8 Provider / 2 Consumer), and SaaS (Provider 10/0). A service must provide the runtime to deploy custom code to qualify as PaaS; otherwise, it degrades to SaaS, IaaS, or DBaaS.

NIST SP 500-292 identifies five major cloud actors: Consumer, Provider (featuring 3-layer Service Orchestration and Cloud Service Management), Auditor (conducting independent security, privacy, and performance audits), Broker (delivering Intermediation, Aggregation, and Arbitrage), and Carrier (supplying SLA-backed network transport). Deployment models include Public, Private (On-Site/Out-Sourced & VPC), Community (IAM-governed multi-organization sharing), Hybrid, and Sovereign Cloud (locking all data and metadata within national borders). Finally, code vs. data decoupling architectures balance cloud elasticity with strict enterprise data security.

<reviewkit>
<takeaways>
- **NIST 5 Essential Characteristics:** On-demand self-service, broad network access, resource pooling (multi-tenancy), rapid elasticity, and measured service (pay-per-use).
- **Multi-Tenancy vs. Single Tenant:** Multi-tenancy pools resources so a single software/VM instance serves multiple tenants, maximizing hardware utilization. Single tenant offers dedicated hardware at higher cost.
- **10-Layer Responsibility Stack:** On-premise (Consumer 10/10), IaaS (5/5 split), PaaS (8 Provider / 2 Consumer), SaaS (Provider 10/0).
- **PaaS Disqualification Rules:** A service must provide the runtime to deploy and execute custom code. UI-only services are SaaS; OS/kernel configuration services are IaaS; API-only query stores are DBaaS.
- **Cross-Provider Wrapping & FaaS:** Subscribing to PaaS from Provider X physically hosted on IaaS from Provider Y satisfies regional data laws. FaaS provides reactive event-driven execution, though underlying servers still exist under the hood.
- **NIST SP 500-292 Reference Model (5 Actors):** Cloud Consumer, Cloud Provider (3-layer Service Orchestration, Cloud Service Management, Security, Privacy), Cloud Auditor (independent compliance evaluation), Cloud Broker (Intermediation, Aggregation, Arbitrage), and Cloud Carrier (SLA-backed connectivity).
- **Deployment Models & Sovereign Cloud:** Public, Private (On-Site/Out-Sourced & VPC), Community (IAM access control across orgs), Hybrid, and Sovereign Cloud (all data and metadata locked within national borders to prevent foreign access).
- **Code vs. Data Decoupling:** Application code stays on the public cloud for compute elasticity, while sensitive data remains on-premise behind corporate firewalls to satisfy compliance and eliminate egress costs.
</takeaways>
<qprompt/>
</reviewkit>

## References

1. Mell, P., & Grance, T. (2011). *The NIST Definition of Cloud Computing*. National Institute of Standards and Technology (NIST), Special Publication 800-145.
2. Fang, Liu, et al. (2011). *NIST Cloud Computing Reference Architecture*. National Institute of Standards and Technology (NIST), Special Publication 500-292.
3. Armbrust, M., Fox, A., Griffith, R., Joseph, A. D., Katz, R., Konwinski, A., Lee, G., Patterson, D., Rabkin, A., Stoica, I., & Zaharia, M. (2010). A view of cloud computing. *Communications of the ACM*, 53(4), 50-58.
4. Buyya, R., Yeo, C. S., Venugopal, S., Broberg, J., & Brandic, I. (2009). Cloud computing and emerging IT platforms: Vision, hype, and reality for delivering computing as the 5th utility. *Future Generation Computer Systems*, 25(6), 599-616.
5. Erl, T., Puttini, R., & Mahmood, Z. (2013). *Cloud Computing: Concepts, Technology & Architecture*. Prentice Hall.
