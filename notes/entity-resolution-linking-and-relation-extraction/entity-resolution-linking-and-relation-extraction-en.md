<meta>
Title: Entity Resolution, Named Entity Linking, and Relation Extraction
Tags: NLP, Entity Resolution, Named Entity Linking, Relation Extraction, Knowledge Graphs, Machine Learning, Information Extraction
Summary: Comprehensive structured notes covering entity resolution, anaphora vs. coreference, Hobbs' algorithm, Named Entity Linking (NEL) pipelines, relation extraction paradigms, ontologies (ACE, UMLS, Schema.org), and neural representations.
Slug: entity-resolution-linking-and-relation-extraction-en
Output: notes/entity-resolution-linking-and-relation-extraction/entity-resolution-linking-and-relation-extraction-en.html
Style: default
EstimatedReadingTime: true
Lang: en
TitleSuffix: true
Status: drafting
Published: 2026-07-25
LastModified: 2026-07-25
</meta>
<draft>
- Core Summary & Problem Statement
    - Comprehensive structured notes covering entity resolution, anaphora vs. coreference, Hobbs' algorithm, Named Entity Linking (NEL) pipelines, relation extraction paradigms, ontologies (ACE, UMLS, Schema.org), and neural representations.
- Overview: Structuring Knowledge from Text
    - toc: Guiding Questions
    - icon: circle-question
- Entity Resolution & Coreference Resolution
    - Anaphora vs. Coreference Resolution
    - Linguistic Phenomena & Resolution Constraints
    - Rule-Based Resolution: Hobbs' Algorithm (1978)
    - Traditional ML & Deep Learning for Coreference
- Named Entity Linking (NEL)
    - Task Definition, Examples & Applications
    - Key Challenges in Entity Linking
    - The NEL Pipeline Architecture
    - Supervised Learning & Deep Learning Formulations
- Relation Extraction & Ontologies
    - Knowledge Graphs, Triples & Relation Complexity
    - Vocabularies, Ontologies & Assumptions
    - Rule-Based RE: Hearst Patterns & Templates
    - Bootstrapping & Dependency-Based Extraction
    - Machine Learning Pipelines for Relation Extraction
- Summary & Key Takeaways
    - - **Entity Resolution & Coreference:**
    - - Coreference resolution groups all mentions in a text that refer to the same real-world entity
</draft>

<anchors>
toc1: overview -> Overview: Structuring Knowledge from Text
h2: Overview: Structuring Knowledge from Text -> overview
toc1: entity-resolution -> Entity Resolution & Coreference Resolution
h2: Entity Resolution & Coreference Resolution -> entity-resolution
toc2: anaphora-vs-coref -> Anaphora vs. Coreference Resolution
h3: Anaphora vs. Coreference Resolution -> anaphora-vs-coref
toc2: resolution-phenomena -> Linguistic Phenomena & Resolution Constraints
h3: Linguistic Phenomena & Resolution Constraints -> resolution-phenomena
toc2: hobbs-algorithm -> Rule-Based Resolution: Hobbs' Algorithm (1978)
h3: Rule-Based Resolution: Hobbs' Algorithm (1978) -> hobbs-algorithm
toc2: ml-dl-entity-resolution -> Traditional ML & Deep Learning for Coreference
h3: Traditional ML & Deep Learning for Coreference -> ml-dl-entity-resolution
toc1: named-entity-linking -> Named Entity Linking (NEL)
h2: Named Entity Linking (NEL) -> named-entity-linking
toc2: nel-definition -> Task Definition, Examples & Applications
h3: Task Definition, Examples & Applications -> nel-definition
toc2: nel-challenges -> Key Challenges in Entity Linking
h3: Key Challenges in Entity Linking -> nel-challenges
toc2: nel-pipeline -> The NEL Pipeline Architecture
h3: The NEL Pipeline Architecture -> nel-pipeline
toc2: nel-models -> Supervised Learning & Deep Learning Formulations
h3: Supervised Learning & Deep Learning Formulations -> nel-models
toc1: relation-extraction -> Relation Extraction & Ontologies
h2: Relation Extraction & Ontologies -> relation-extraction
toc2: re-kg-foundations -> Knowledge Graphs, Triples & Relation Complexity
h3: Knowledge Graphs, Triples & Relation Complexity -> re-kg-foundations
toc2: ontologies-vocabularies -> Vocabularies, Ontologies & Assumptions
h3: Vocabularies, Ontologies & Assumptions -> ontologies-vocabularies
toc2: rule-based-re -> Rule-Based RE: Hearst Patterns & Templates
h3: Rule-Based RE: Hearst Patterns & Templates -> rule-based-re
toc2: bootstrapping-dependency -> Bootstrapping & Dependency-Based Extraction
h3: Bootstrapping & Dependency-Based Extraction -> bootstrapping-dependency
toc2: ml-relation-extraction -> Machine Learning Pipelines for Relation Extraction
h3: Machine Learning Pipelines for Relation Extraction -> ml-relation-extraction
toc1: takeaways -> Summary & Key Takeaways
h2: Summary & Key Takeaways -> takeaways
</anchors>

# Entity Resolution, Named Entity Linking, and Relation Extraction

## Overview: Structuring Knowledge from Text

<callout>
id: ie-guiding
toc: Guiding Questions
variant: question
icon: circle-question
style: regular
title: Guiding Questions: How Do Machines Transform Unstructured Text into Structured Knowledge?
content:
Natural language text is filled with ambiguity, indirect references, and implicit relationships. How do automated systems identify who or what is being discussed, map ambiguous surface mentions to canonical knowledge base entities, and discover structured relational triples?

This note explores the three core pillars of Information Extraction (IE): Entity Resolution (Coreference), Named Entity Linking (NEL), and Relation Extraction (RE).
</callout>

Referring to the same entity multiple times is fundamental to human communication. To avoid naive and repetitive expressions (e.g., *"Neil Armstrong said Neil Armstrong jumped..."*), natural languages rely heavily on pronouns and alternative noun phrases (*"Neil Armstrong said ... He jumped..."*). While human readers effortlessly track these entity references, computational models require specialized techniques to resolve entity mentions, link surface forms to Knowledge Base (KB) identifiers, and extract structured relational facts.

Over time, methods for information extraction have evolved through three major paradigms:
1. **Rule-Based Systems:** Explicit linguistic rules, syntactic parse tree traversals (e.g., Hobbs' algorithm), and surface patterns (e.g., Hearst patterns).
2. **Feature-Based Machine Learning:** Supervised classifiers using hand-crafted distance, grammatical, syntactic, and semantic features.
3. **Deep Learning & Representation Learning:** End-to-end neural architectures that joint-learn mention detection, contextual embeddings, and global coherence.

---

## Entity Resolution & Coreference Resolution

Entity resolution is an essential preprocessing step across information retrieval, entity linking, relation extraction, summarization, machine translation, and question answering.

### Anaphora vs. Coreference Resolution

While often used interchangeably in practice, **anaphora resolution** and **coreference resolution** have distinct theoretical definitions:

- **Anaphora:** A directional relationship where a dependent mention (the *anaphor*, e.g., a pronoun) refers back to a preceding mention (the *antecedent*) for its interpretation.
    - *Example:* In *"Neil Armstrong landed on the moon. **He** made history."*, the pronoun *"He"* is an anaphor pointing to *"Neil Armstrong"*.
- **Coreference:** A relationship where two or more noun phrases (mentions) refer to the exact same real-world entity, without necessarily requiring a directional dependency.
    - *Example:* *"The CEO of Tesla"* and *"Elon Musk"* in the same document refer to the same real-world person.

| Feature | Anaphora Resolution | Coreference Resolution |
| :--- | :--- | :--- |
| **Core Object** | Directional reference link (anaphor $\rightarrow$ antecedent) | Equivalence partition / cluster of mentions |
| **Directionality** | Inherently directional (usually backward, rarely cataphora) | Non-directional equivalence set |
| **Non-Coreferential Anaphora** | Includes bridging cases (e.g., *the mall $\rightarrow$ the food court*) | Excluded (must refer to the exact same entity) |
| **Non-Anaphoric Coreference** | Excluded (e.g., appositives or independent alias mentions) | Included |

### Linguistic Phenomena & Resolution Constraints

Real-world reference resolution must account for complex linguistic phenomena:
- **Cataphora:** The reference appears *before* its antecedent (e.g., *"Before **he** landed on the moon, Neil Armstrong trained for years."*).
- **Bridging Anaphora:** The anaphor is linked indirectly to an antecedent via conceptual association (e.g., *"We visited the **mall**. The **food court** was crowded."*).
- **Zero Anaphora:** The pronoun is omitted entirely and must be inferred from context (common in pro-drop languages).
- **Split Anaphora:** A single pronoun refers to multiple antecedents combined (e.g., *"Alice met Bob. **They** discussed the plan."*).
- **Non-Anaphoric Pronouns:** Expletive or pleonastic pronouns that carry no referential entity (e.g., *"**It** is raining"* or *"**It** is important to note..."*).

To evaluate candidate antecedents, systems apply structural and semantic constraints:
1. **Gender & Number Agreement:** Pronouns must match candidate antecedents in gender (male/female/neuter) and number (singular/plural).
2. **Recency Preference:** Mentions appearing closer to the pronoun are statistically more likely antecedents.
3. **Syntactic Constraints:** Subject vs. object positioning and reflexivity govern valid links (e.g., binding theory in linguistics).
4. **Semantic & Animacy Constraints:** Verbs impose selectional preferences on their arguments (e.g., *"The company launched its product"* vs. *"The engineer fixed the machine"*).
5. **World Knowledge Constraints:** Reasoning about real-world plausibility and domain facts.

---

### Rule-Based Resolution: Hobbs' Algorithm (1978)

**Hobbs' algorithm** (1978) is a foundational rule-based approach for pronoun resolution that operates directly on syntactic parse trees.

#### Detailed Procedure:
1. **Locate Pronoun Node:** Find the Noun Phrase (NP) node dominating the pronoun in the syntactic parse tree.
2. **Ascend to S or NP:** Move up the parse tree to the first `NP` or `S` (Sentence) node above the pronoun. Call this node $X$, and the path traversed $p$.
3. **Traverse Left-to-Right under $X$:** Traverse all branches below $X$ to the left of path $p$ in a left-to-right, breadth-first manner. Any `NP` node encountered is a candidate antecedent.
4. **Test Agreement Constraints:** Check gender, number, animacy, and syntactic constraints for each candidate `NP`.
5. **Ascend Higher:** If no valid match is found under $X$, move up to the next `NP` or `S` node above $X$. If this node is an `S` node, search branches to the right of path $p$ that do not contain $X$.
6. **Cross Sentence Boundaries:** If the root of the sentence tree is reached without a match, search the parse trees of previous sentences in order of recency using left-to-right breadth-first search.
7. **Select First Match:** The first candidate `NP` that satisfies all agreement constraints is selected as the antecedent.

> **Key Takeaway:** Hobbs' algorithm demonstrates how **structured tree traversal** combined with **constraint filtering** and **first-valid-match selection** can resolve pronominal references without machine learning models.

---

### Traditional ML & Deep Learning for Coreference

#### Traditional Machine Learning: Mention-Pair Model
The **mention-pair model** frames coreference resolution as a classification task over candidate pairs:
1. **Candidate Pair Generation:** Extract all candidate noun phrases (mentions) in a document and pair them $(m_i, m_j)$.
2. **Binary Classification:** Train a binary classifier (e.g., Logistic Regression or SVM) using cross-entropy or margin loss to predict whether $m_i$ and $m_j$ are coreferent.
3. **Feature Engineering:**
    - *Distance Features:* Sentence distance, token distance, word count separation.
    - *String Match Features:* Exact match, head word match, substring overlap, acronym match.
    - *Grammatical & Syntactic Features:* Noun phrase type (proper, definite, indefinite, pronoun), subject/object syntactic roles, appositive structures.
    - *Semantic & Distributional Features:* Animacy, WordNet hypernyms, pre-trained word embeddings.
4. **Clustering:** Apply transitive closure or graph clustering (e.g., single-linkage clustering) to merge pairwise predictions into coreference chains.

#### Evaluation Benchmarks & Datasets
- **Definite Pronoun Resolution (DPR) Dataset:** Benchmark focusing on hard pronoun disambiguation.
- **GAP Coreference Dataset:** Gender-balanced benchmark for pronoun resolution in Wikipedia contexts.

#### Deep Learning Approaches
Modern neural coreference models replace manual feature engineering with learned distributed representations:
- **Contextual Encoders:** Utilize Transformers (e.g., BERT, RoBERTa) to encode span representations that capture document-level context.
- **End-to-End Neural Coreference:** Jointly learn mention detection and mention linking, scoring all span pairs $(g_i, g_j)$ directly without pre-extracted mentions.
- **Global Context & Entity Clusters:** Model cluster-level representations rather than relying strictly on local pairwise decisions.

---

## Named Entity Linking (NEL)

### Task Definition, Examples & Applications

**Named Entity Linking (NEL)**—also referred to as **Entity Disambiguation**—is the task of mapping ambiguous surface mentions in text to canonical, uniquely identified entities in a Knowledge Base (KB) or Knowledge Graph (e.g., Wikipedia, DBpedia, or Wikidata).

- **Surface Form (Mention):** The raw string in text (e.g., *"Armstrong"*).
- **Canonical Entity (KB URI):** The unique identifier in the Knowledge Base (e.g., `http://dbpedia.org/resource/Neil_Armstrong`).

#### Intuitive Example:
> *"**Neil Armstrong** stepped on the moon ... **Armstrong** jumped down from the ladder..."*

The challenge is to recognize that the second surface mention *"Armstrong"* refers to the historical astronaut `dbpedia:Neil_Armstrong` rather than `dbpedia:Lance_Armstrong` or `dbpedia:Louis_Armstrong`.

#### Key Downstream Applications:
- **Information Retrieval (IR):** Entity-level indexing improves search relevance beyond raw keyword matching.
- **Question Answering (QA):** Maps entity references in user questions directly to KB nodes for factual retrieval.
- **Machine Translation (MT):** Preserves correct entity identity and gender across target languages.
- **Relation Extraction (RE):** Grounds extracted entity pairs into canonical nodes before adding triples to a Knowledge Graph.
- **Conversational Agents:** Grounds conversational references into external Knowledge Graph structures.

---

### Key Challenges in Entity Linking

1. **Ambiguity:** A single surface form can correspond to many distinct real-world entities.
    - *Example:* *"Washington"* may refer to George Washington (Person), Washington D.C. (Capital City), Washington State (Location), or Washington Huskies (Sports Team).
2. **Variability:** A single real-world entity can be expressed using diverse surface forms.
    - *Example:* `dbpedia:Singapore` can appear as *"Singapore"*, *"S'pore"*, *"SG"*, *"The Lion City"*, or *"Republic of Singapore"*.
3. **The NIL Problem (Unlinkable / Missing Entities):** Knowledge Bases are incomplete. Many mentions in text do not exist in the target KB. Systems must detect these cases and predict `NIL` (abstain) rather than forcing an incorrect link.
4. **Knowledge Base Incompleteness & Evolution:** Real-world entities, attributes, and relationships continuously change and expand over time.
5. **Context Sensitivity:** Disambiguation requires capturing both local sentence context and global document-level topics.

---

### The NEL Pipeline Architecture

Standard Named Entity Linking architectures consist of three consecutive stages:

```
[ Unstructured Text ]
        │
        ▼
┌───────────────────────────────┐
│ 1. Candidate Generation       │ ──► High Recall, Low Precision
└───────────────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│ 2. Candidate Ranking          │ ──► Feature Scoring / Neural Encoder
└───────────────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│ 3. NIL Prediction             │ ──► Thresholding / Explicit NIL Class
└───────────────────────────────┘
        │
        ▼
[ Linked KB Entity URI / NIL ]
```

#### 1. Candidate Generation
Retrieve a subset of candidate entities $e \in E$ for a given surface mention $m$.
- **Goal:** Achieve high recall so the true entity is not omitted, while keeping candidate set size manageable.
- **Methods:** Lexical exact/partial string matching, Wikipedia redirect/disambiguation pages, candidate dictionary lookups, and Wikidata search APIs.

#### 2. Candidate Ranking
Score and rank generated candidate entities to select the best semantic match.

- **Context-Independent Features:**
    - *String Similarity:* Levenshtein distance, Jaro-Winkler, prefix/suffix overlap.
    - *Entity Popularity / Prior Probability:* $P(e|m)$ based on Wikipedia page views, inbound link counts, and hyper-link anchor text frequencies.
    - *Entity Type Consistency:* Matching Named Entity Recognition (NER) labels (`PER`, `ORG`, `LOC`) with KB entity classes.

- **Context-Dependent Features:**
    - *Local Context Similarity:* Bag-of-Words TF-IDF, keyphrase similarity, or embedding cosine similarity between the sentence surrounding mention $m$ and the KB entity description.
    - *Global Coherence:* Document-level topic consistency; ensuring linked entities across a document are topically compatible (e.g., linking *"Apollo"* to `dbpedia:Apollo_program` when *"Armstrong"* is linked to `dbpedia:Neil_Armstrong`).

#### 3. NIL Prediction
Determine whether the top-ranked candidate entity is correct or if the mention refers to an un-cataloged entity (`NIL`).
- **Methods:** Thresholding prediction probability scores, training an explicit `NIL` classifier, or assigning a dedicated `NIL` candidate sink node.

---

### Supervised Learning & Deep Learning Formulations

#### Supervised Ranking Formulation
NEL is frequently formulated as a pairwise ranking or classification task over $(m_i, e_j)$ pairs. The model outputs a conditional probability $P(e_j | m_i, \text{Context})$, optimized using cross-entropy or margin-based ranking loss:

$$\mathcal{L} = - \sum_{i} \log P(e^*_i | m_i, \text{Context})$$

#### Deep Learning & Encoder-Based Models
Modern neural NEL architectures eliminate manual feature engineering:
- **Bi-Encoder Models:** Encode mention text context and candidate KB entity descriptions separately into dense vectors using Transformer backbones (e.g., BERT), computing dot-product or cosine similarity scores.
- **Cross-Encoder Models:** Pass the mention context concatenated directly with candidate entity descriptions into a Transformer, allowing multi-head cross-attention to capture fine-grained semantic matches.
- **Global Disambiguation Networks:** Use Graph Neural Networks (GNNs) or dense attention layers to jointly disambiguate all mentions in a document, maximizing global entity coherence.

---

## Relation Extraction & Ontologies

### Knowledge Graphs, Triples & Relation Complexity

**Relation Extraction (RE)** is the task of extracting structured semantic relationships between entity pairs from unstructured text, transforming raw prose into a queryable **Knowledge Graph (KG)**.

#### Triples Structure:
A Knowledge Graph is composed of structured `(Subject, Predicate, Object)` triples:
- `(Euler, born-in, Basel)`
- `(Euler, works-as, mathematician)`
- `(Basel, located-in, Switzerland)`

```
 (Euler) ───[ born-in ]───► (Basel) ───[ located-in ]───► (Switzerland)
    │
    └───[ works-as ]───► (Mathematician)
```

#### Meaningful Relations & Downstream Benefits:
- **Downstream Benefits:** Enhances semantic search, structured Question Answering, automated reasoning, data integration, and recommendation systems.
- **Tacit Knowledge:** Information that is implied rather than explicitly stated, requiring domain background to infer.
- **Target Selection:** Practical RE systems focus primarily on extracting relations between validated named entities.

#### Handling Linguistic Complexity:
1. **Negation:** Expressing non-existence or negative facts (e.g., *"Euler was not born in St. Petersburg"* $\rightarrow$ `(Euler, not-born-in, St. Petersburg)`). Standard triple stores often struggle to represent negative facts natively.
2. **Uncertainty & Attribution:** Non-factual, probabilistic, or attributed statements (e.g., *"Reports claim Euler was born in Basel"*). Requires meta-level statements or provenance annotation.
3. **Paraphrasing & Relation Equivalence:** Different surface expressions convey identical facts:
    - *"Euler was born in Basel."* $\leftrightarrow$ *"Basel was the birthplace of Euler."*
    - Canonical mapping resolves `(Euler, born-in, Basel)` and `(Basel, birthplace-of, Euler)`.

---

### Vocabularies, Ontologies & Assumptions

Standardized vocabularies define target entity classes and relation predicates to ensure semantic interoperability.

#### Key Relation Vocabularies & Standards:
- **ACE (Automatic Content Extraction):** Defines major relation categories:
    - *Physical:* `located`, `near`
    - *Part-Whole:* `geographical`, `subsidiary`, `artifact`
    - *Personal-Social:* `family`, `business`
    - *Org-Affiliation:* `employment`, `membership`, `ownership`
    - *Agent-Artifact:* `manufacturer`, `inventor`, `user`
- **UMLS (Unified Medical Language System):** Medical domain ontology containing ~127 semantic types and ~54 semantic relationships (including probabilistic relations like `may-cause`).
- **Formal Ontologies:** Structured specifications defining **Individuals** (Euler), **Classes** (Person), **Properties** (birth date), **Relationships** (born-in), and **Logical Axioms**.
- **Schema.org & Knowledge Graphs:** Industry-wide structured schema backed by major technology companies, powering web-scale Knowledge Graphs.

#### Closed-World vs. Open-World Assumption
- **Closed-World Assumption (CWA):** Any fact not explicitly stated in the database is assumed to be *false*. Standard in traditional relational databases.
- **Open-World Assumption (OWA):** Absence of information does *not* imply falsehood; unstated facts are simply *unknown*. Essential for web-scale Knowledge Graphs and open domain extraction.

---

### Rule-Based RE: Hearst Patterns & Templates

#### 1. Hearst Patterns (IS-A / Hyponym Extraction)
First introduced by Marti Hearst (1992), **Hearst patterns** use regular expressions over surface syntax to extract hyponym (class-instance) relations:

| Pattern Syntax | Surface Text Example | Extracted Triple |
| :--- | :--- | :--- |
| `Y such as X` | *"Mathematicians such as Euler..."* | `(Euler, is-a, mathematician)` |
| `such Y as X` | *"such cities as Basel..."* | `(Basel, is-a, city)` |
| `X or other Y` | *"Euler or other mathematicians..."* | `(Euler, is-a, mathematician)` |
| `Y including X` | *"Great minds including Euler..."* | `(Euler, is-a, great mind)` |
| `Y especially X` | *"Swiss scholars especially Euler..."* | `(Euler, is-a, Swiss scholar)` |

#### 2. Domain-Specific Surface Patterns
Extending beyond IS-A relations, hand-written text patterns target specific domain relationships:
- *Pattern Template:* `PERSON joined ORG as OCCUPATION`
- *Pattern Template:* `PERSON works as OCCUPATION at ORG`
- *Sentence:* *"Chris works as a lecturer at NUS."*
- *Extracted Triples:* `(Chris, works-as, lecturer)` and `(Chris, works-at, NUS)`.

#### Evaluation of Rule-Based Approaches:
- **Pros:** High precision, no manually labeled training dataset required, easily customizable for specialized domains.
- **Cons:** Extremely low recall due to linguistic variability, labor-intensive rule authoring, inability to scale to hundreds of relation types, and poor generalization to unseen expressions.

---

### Bootstrapping & Dependency-Based Extraction

#### Bootstrapping (Semi-Supervised Pattern Learning)
Bootstrapping iteratively expands relation patterns from a small set of seed entity pairs:

```
[ Seed Entity Pairs ] (e.g. Euler, Basel)
        │
        ▼
[ Search Corpus & Retrieve Sentences ]
        │
        ▼
[ Extract Common Context Patterns ]
        │
        ▼
[ Apply Patterns to Find New Entity Pairs ]
        │
        ▼
[ Filter & Add New Pairs to Seed Set ] (Iterate)
```

> **Warning:** A major risk in bootstrapping is **error propagation** (semantic drift); if an incorrect pattern is learned early, it extracts invalid pairs that corrupt subsequent iterations.

#### Dependency-Based Relation Extraction
Instead of relying on raw surface text, **dependency-based methods** extract relation paths over syntactic dependency trees:
- **Syntactic Path:** Extract shortest dependency paths connecting entity nodes (e.g., `nsubj` $\rightarrow$ `verb` $\rightarrow$ `dobj`).
- **Advantage:** Bypasses intervening modifier words and long-distance surface variation, providing far greater structural robustness than raw text patterns.

---

### Machine Learning Pipelines for Relation Extraction

#### Problem Formulations
Given a pair of extracted entities $(e_1, e_2)$ within a text context:
- **Binary Classification:** Predict whether a relation exists between $e_1$ and $e_2$ (`Relation` vs. `No-Relation`).
- **Multiclass Classification:** Classify the entity pair into one of $K$ predefined relation types (e.g., `born-in`, `works-at`, `located-in`, `none`).

#### Standard Pipeline Design:
1. **Entity Detection:** Run NER, noun phrase chunkers, or dictionary lookup to identify candidate entities $e_1, e_2$.
2. **Pair Generation:** Form candidate entity pairs within the same sentence or window.
3. **Feature Extraction:** Extract lexical, syntactic dependency, positional, and entity type features.
4. **Classification & Prediction:** Apply ML classifiers (e.g., SVM, Random Forest) or neural network encoders (e.g., CNN, BiLSTM, Transformer cross-encoders) to output relation probability scores.

---

## Summary & Key Takeaways

<reviewkit>
<takeaways>
- **Entity Resolution & Coreference:**
    - Coreference resolution groups all mentions in a text that refer to the same real-world entity.
    - Rule-based systems like **Hobbs' algorithm (1978)** navigate syntactic parse trees using left-to-right breadth-first search and agreement constraints.
    - Neural models replace manual feature engineering with Transformer-based span representations and joint mention-linking architectures.

- **Named Entity Linking (NEL):**
    - Maps ambiguous surface text mentions to canonical Knowledge Base URIs (e.g., DBpedia / Wikidata).
    - Standard pipeline: **Candidate Generation** (high recall) $\rightarrow$ **Candidate Ranking** (context-independent & context-dependent features) $\rightarrow$ **NIL Prediction** (handling missing entities).

- **Relation Extraction (RE) & Ontologies:**
    - Converts unstructured text into structured `(Subject, Predicate, Object)` Knowledge Graph triples.
    - Ontologies (ACE, UMLS, Schema.org) define standardized class and predicate schemas under Open-World Assumptions (OWA).
    - Extraction paradigms evolved from **Hearst surface patterns** and **bootstrapping**, to **dependency parse path extraction**, and end-to-end **neural classification models**.
</takeaways>
<qprompt/>
</reviewkit>
