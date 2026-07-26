<meta>
Title: Entity Resolution, Named Entity Linking, and Relation Extraction
Tags: NLP, Entity Resolution, Named Entity Linking, Relation Extraction, Knowledge Graphs, Machine Learning, Information Extraction
Summary: A detailed, comprehensive guide covering Entity Resolution (Anaphora/Coreference, Hobbs' algorithm, mention-pair ML, deep learning), Named Entity Linking (NEL pipeline, ranking, NIL prediction, ML/DL models), and Relation Extraction (Hearst patterns, bootstrapping, dependency RE, ML pipelines, ontologies ACE/UMLS/Schema.org).
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

<anchors>
toc1: repetition-and-resolution -> Repetition in Language & Intro to Entity Resolution
h2: Repetition in Language & Intro to Entity Resolution -> repetition-and-resolution
toc1: entity-resolution -> Entity Resolution & Coreference Resolution
h2: Entity Resolution & Coreference Resolution -> entity-resolution
toc2: anaphora-vs-coref -> Anaphora vs. Coreference Resolution
h3: Anaphora vs. Coreference Resolution -> anaphora-vs-coref
toc2: resolution-phenomena -> Reference Phenomena & Resolution Challenges
h3: Reference Phenomena & Resolution Challenges -> resolution-phenomena
toc2: resolution-constraints -> Constraints Used in Resolution
h3: Constraints Used in Resolution -> resolution-constraints
toc2: hobbs-algorithm -> Rule-Based Approach: Hobbs' Algorithm (1978)
h3: Rule-Based Approach: Hobbs' Algorithm (1978) -> hobbs-algorithm
toc2: ml-entity-resolution -> Traditional Machine Learning: Mention-Pair Model
h3: Traditional Machine Learning: Mention-Pair Model -> ml-entity-resolution
toc2: dl-entity-resolution -> Datasets & Deep Learning Approaches
h3: Datasets & Deep Learning Approaches -> dl-entity-resolution
toc2: er-summary -> Entity Resolution Summary
h3: Entity Resolution Summary -> er-summary
toc1: named-entity-linking -> Named Entity Linking (NEL)
h2: Named Entity Linking (NEL) -> named-entity-linking
toc2: nel-task -> Task Definition, Surface Forms & Example Intuition
h3: Task Definition, Surface Forms & Example Intuition -> nel-task
toc2: nel-applications -> Applications of Named Entity Linking
h3: Applications of Named Entity Linking -> nel-applications
toc2: nel-challenges -> Key Challenges in Named Entity Linking
h3: Key Challenges in Named Entity Linking -> nel-challenges
toc2: nel-pipeline -> Named Entity Linking Pipeline Architecture
h3: Named Entity Linking Pipeline Architecture -> nel-pipeline
toc2: nel-ranking-features -> Candidate Ranking Features (Independent vs. Dependent)
h3: Candidate Ranking Features (Independent vs. Dependent) -> nel-ranking-features
toc2: nel-nil-prediction -> NIL Prediction (Unlinkable Entities)
h3: NIL Prediction (Unlinkable Entities) -> nel-nil-prediction
toc2: nel-ml-dl-models -> Supervised Learning & Deep Learning Formulations for NEL
h3: Supervised Learning & Deep Learning Formulations for NEL -> nel-ml-dl-models
toc2: nel-model-dimensions -> Deep Learning Model Dimensions in NEL
h3: Deep Learning Model Dimensions in NEL -> nel-model-dimensions
toc2: nel-summary -> Named Entity Linking Summary
h3: Named Entity Linking Summary -> nel-summary
toc1: relation-extraction -> Relation Extraction & Ontologies
h2: Relation Extraction & Ontologies -> relation-extraction
toc2: re-kg-foundations -> Knowledge Graphs, Triples & Benefits
h3: Knowledge Graphs, Triples & Benefits -> re-kg-foundations
toc2: re-tacit-and-meaningful -> Tacit Knowledge & Meaningful Relations
h3: Tacit Knowledge & Meaningful Relations -> re-tacit-and-meaningful
toc2: re-complexity -> Linguistic Complexity: Negation, Uncertainty & Paraphrasing
h3: Linguistic Complexity: Negation, Uncertainty & Paraphrasing -> re-complexity
toc2: ontologies-vocabularies -> Relation Vocabularies & Ontologies (ACE, UMLS, Schema.org)
h3: Relation Vocabularies & Ontologies (ACE, UMLS, Schema.org) -> ontologies-vocabularies
toc2: closed-open-world -> Closed-World vs. Open-World Assumption
h3: Closed-World vs. Open-World Assumption -> closed-open-world
toc2: rule-based-re -> Rule-Based Relation Extraction & Hearst Patterns
h3: Rule-Based Relation Extraction & Hearst Patterns -> rule-based-re
toc2: rule-re-tradeoffs -> Rule-Based RE: Strengths and Weaknesses
h3: Rule-Based RE: Strengths and Weaknesses -> rule-re-tradeoffs
toc2: bootstrapping-dependency -> Bootstrapping & Dependency-Based Extraction
h3: Bootstrapping & Dependency-Based Extraction -> bootstrapping-dependency
toc2: ml-relation-extraction -> Traditional Machine Learning Approaches for RE
h3: Traditional Machine Learning Approaches for RE -> ml-relation-extraction
toc2: re-summary -> Relation Extraction Summary
h3: Relation Extraction Summary -> re-summary
toc1: takeaways -> Summary & Key Takeaways
h2: Summary & Key Takeaways -> takeaways
</anchors>

# Entity Resolution, Named Entity Linking, and Relation Extraction

## Repetition in Language & Intro to Entity Resolution

<callout>
id: ie-guiding
toc: Guiding Questions
variant: question
icon: circle-question
style: regular
title: Guiding Questions: How Do Machines Transform Unstructured Text into Structured Knowledge?
content:
Natural language text is rich with indirect references, ambiguous surface names, and complex entity relations. How do computational systems resolve pronouns to antecedents, link surface names to unique Knowledge Base entries, and extract queryable relational triples?

This note covers the three foundational components of Information Extraction (IE): Entity Resolution (Coreference), Named Entity Linking (NEL), and Relation Extraction (RE).
</callout>

### Repetition in Language
Referring to the same entity or concept multiple times is extremely common in natural language. However, humans avoid naive repetition by using pronouns and alternative expressions instead of repeating full names:

- **Repeated Form (Unnatural):** *"Neil Armstrong said Neil Armstrong jumped..."*
- **Natural Form:** *"Neil Armstrong said ... He jumped..."*

**When naive repetition may be preferred:** Naive repetition is typically reserved for contexts requiring extreme clarity, low ambiguity, or machine readability (such as legal contracts, technical specifications, or raw database records where pronouns could introduce confusion).

---

## Entity Resolution & Coreference Resolution

**Entity Resolution** is the task of resolving multiple mentions in text that refer to the same real-world entity. It serves as an essential preprocessing step across numerous NLP applications, including:
- Keyword extraction
- Entity linking
- Relation extraction
- Text summarization
- Machine translation
- Question answering

---

### Anaphora vs. Coreference Resolution

While used interchangeably in many practical NLP contexts, **anaphora resolution** and **coreference resolution** are theoretically distinct concepts:

- **Anaphora Resolution:** Identifies what an *anaphor* (e.g., a pronoun) refers to. It is a directional relationship where an anaphor points back to a previous mention (the *antecedent*).
    - *Example:* *"He"* referring to *"Neil Armstrong"* is anaphora.
- **Coreference Resolution:** Identifies all mentions that refer to the exact same real-world entity. It forms equivalence sets across mentions.
    - *Example:* *"The CEO of Tesla, Elon Musk"* and *"Elon Musk"* are coreferential, but not anaphoric (neither is a pronoun pointing to the other).

#### Important Theoretical Distinctions:
- Not all coreference is anaphoric (e.g., non-directional reference between noun phrases or appositions).
- Not all anaphora are strictly coreferential depending on interpretation (e.g., bridging anaphora like *mall $\rightarrow$ food court*).

| Aspect | Anaphora Resolution | Coreference Resolution |
| :--- | :--- | :--- |
| **Core Definition** | Identifying what an anaphor (e.g., pronoun) refers to | Identifying all mentions referring to the same real-world entity |
| **Directionality** | Directional (anaphor $\rightarrow$ antecedent) | Equivalence partition / non-directional cluster |
| **Pronominal Links** | Covers pronouns pointing to antecedents | Covers all noun phrase mentions (pronouns, proper names, titles) |
| **Non-Coreferential Cases** | Includes bridging anaphora | Excluded (must refer to the identical entity) |

---

### Reference Phenomena & Resolution Challenges

Resolving references in natural text involves navigating complex linguistic phenomena:
- **Bridging Anaphora:** Indirect relation where the reference is inferred via semantic association (e.g., *the mall $\rightarrow$ the food court*).
- **Zero Anaphora:** The pronoun is omitted entirely and must be inferred from surrounding context.
- **Cataphora:** The reference appears *before* its antecedent (e.g., *"Before **he** stepped on the moon, Neil Armstrong trained..."*).
- **Split Anaphora:** One reference refers to multiple antecedents combined (e.g., *"Alice met Bob. **They** left."*).
- **Indefinite Pronominal Anaphora:** Ambiguous or generic pronoun usage (e.g., generic *"one"*).
- **"one" Anaphora:** Substitution using the pronoun *"one"* (e.g., *"I lost my pen, so I bought a new **one**"*).
- **Non-Anaphoric Pronouns:** Pronouns that do not refer to any entity, such as expletive *"it"* in *"It was raining"* or *"It is obvious that..."*.

#### Core Challenges in Entity Resolution:
- High linguistic variability in reference forms.
- Long-distance dependencies across multiple sentences or paragraphs.
- Ambiguity in pronoun resolution.
- Requirement of world knowledge and deep semantic understanding.
- Syntax and agreement constraints are helpful, but not always sufficient on their own.

---

### Constraints Used in Resolution

Resolution systems apply a variety of linguistic and domain constraints to filter candidate antecedents:
1. **Gender Agreement:** Gender consistency between mention and pronoun (male/female/neuter).
2. **Number Agreement:** Singular vs. plural consistency (e.g., *he/she* vs. *they*).
3. **Recency Preference:** Mentions appearing closer to the pronoun are statistically more likely antecedents.
4. **Syntactic Constraints:** Grammatical roles such as subject, object, or appositive positioning (e.g., binding theory constraints).
5. **Semantic Constraints:** Animacy (animate vs. inanimate) and semantic plausibility.
6. **Verb and Structural Agreement Constraints:** Selectional preferences of verbs on their subject/object arguments.
7. **World Knowledge Constraints:** Real-world plausibility and domain facts.

> **Note:** While constraints are invaluable for rule-based systems and as features for machine learning models, they are not always 100% reliable due to linguistic exceptions and non-standard usage.

---

### Rule-Based Approach: Hobbs' Algorithm (1978)

**Hobbs' algorithm (1978)** is a classic rule-based algorithm for pronoun resolution operating directly on syntactic parse trees.

- **Input:** Syntactic parse trees of the current and preceding sentences.
- **Goal:** Find the correct antecedent NP for a target pronoun.
- **Key Idea:** Structured tree traversal + constraint filtering + first valid match selection.

```
[ Locate NP dominating pronoun ]
               │
               ▼
[ Ascend to nearest NP or S node (X) ]
               │
               ▼
[ Left-to-Right BFS under X for candidate NPs ]
               │
               ▼
[ Test agreement constraints for candidate ] ──► (Match Found?) ──► [ Select Antecedent ]
               │ (No match)
               ▼
[ Move up to higher NP or S node (previous sentences) ]
               │
               ▼
[ Repeat search until antecedent is found ]
```

#### Step-by-Step Procedure:
1. **Locate Pronoun Node:** Locate the `NP` node dominating the pronoun in the syntactic parse tree.
2. **Ascend to $X$:** Move up the tree to the nearest `NP` or `S` node (call it node $X$), noting the path taken.
3. **Left-to-Right BFS:** Perform a left-to-right, breadth-first search under $X$ for candidate noun phrases (NPs) that appear to the left of the path.
4. **Test Agreement Constraints:** Test gender, number, animacy, and syntactic constraints for each candidate `NP`.
5. **Ascend Higher:** If none match, move up to the next higher `NP` or `S` node (including structural search in preceding sentences in order of recency).
6. **Repeat Until Match:** Repeat the search procedure until a valid antecedent is found. Select the first matching candidate.

---

### Traditional Machine Learning: Mention-Pair Model

Traditional machine learning frames coreference resolution as a classification problem over candidate pairs.

#### 1. Mention-Pair Model Workflow
- **Candidate Generation:** Generate all pairs of mentions (all noun phrases, including pronouns) within a document $(m_i, m_j)$.
- **Binary Classifier:** Train a binary classifier (e.g., Logistic Regression, SVM, or Decision Trees) to predict whether two mentions are coreferent (`1`) or not (`0`).
- **Learning Objective:** Framed using cross-entropy loss over candidate pair predictions.

#### 2. Feature Engineering
Feature engineering is crucial for the performance of traditional mention-pair models:
- **Distance Features:** Token distance, sentence distance, intervening mention count.
- **String Match Features:** Exact string match, partial overlap, head noun match, substring matching, acronym match.
- **Grammatical Features:** NP type (proper noun, definite NP, indefinite NP, pronoun), gender, number.
- **Syntactic Features:** Subject role, object role, apposition, modifier structures.
- **Semantic Features:** Animacy, semantic category, plausibility.
- **Distributional Features:** Pre-trained word embeddings and vector similarities.

---

### Datasets & Deep Learning Approaches

#### Datasets for Entity Resolution:
- **Definite Pronoun Resolution (DPR) Dataset:** Benchmark for evaluating pronoun resolution on definite pronouns.
- **GAP Coreference Dataset:** Gender-balanced coreference dataset sourced from Wikipedia.
- Used extensively for training and benchmarking pronominal and coreference resolution models.

#### Deep Learning Approaches:
- **Learned Distributed Representations:** Learn continuous vector representations for mentions and entity clusters rather than relying on manual feature engineering.
- **Global Context Modeling:** Model document-level global context rather than making isolated pairwise decisions.
- **End-to-End Neural Coreference Models:** Jointly learn mention detection and mention linking in an end-to-end differentiable neural architecture.
- **Performance:** Deep learning models typically outperform traditional feature-based methods by capturing richer semantic and contextual cues.

---

### Entity Resolution Summary

<block title="Entity Resolution Summary">
- Entity resolution is an essential preprocessing step across many NLP tasks (IR, QA, RE, MT, Summarization).
- Core difficulty stems from ambiguity, high linguistic variability, and the need for contextual and world knowledge.
- Methods have evolved progressively from **rule-based tree traversals** (Hobbs' algorithm) $\rightarrow$ **feature-engineered machine learning** (Mention-pair classifiers with cross-entropy loss) $\rightarrow$ **deep learning models** with learned end-to-end representations and global context.
</block>

---

## Named Entity Linking (NEL)

### Task Definition, Surface Forms & Example Intuition

**Named Entity Linking (NEL)**—also known as **Entity Disambiguation**—is the task of linking named entities mentioned in text to canonical entries in a Knowledge Base (KB) or Knowledge Graph (such as Wikipedia, DBpedia, or Wikidata).

- **Surface Form (Mention):** The raw word or phrase appearing in unstructured text (e.g., *"Armstrong"*).
- **Canonical Entity (KB Entry / URI):** Unique entity identifier in a KB (e.g., `http://dbpedia.org/resource/Neil_Armstrong`).
- **Goal:** Map ambiguous surface forms to correct canonical entities using contextual similarity between mention context and candidate entity descriptions.

#### Example Intuition:
> *Text:* *"**Neil Armstrong** stepped on the moon … **Armstrong** jumped down from the ladder …"*
>
> *Challenge:* Determine whether the surface form *"Armstrong"* refers to `dbpedia:Neil_Armstrong`, `dbpedia:Lance_Armstrong`, or `dbpedia:Louis_Armstrong`.
>
> *Core Issue:* Linking ambiguous surface forms to the correct canonical KB entity based on surrounding evidence.

---

### Applications of Named Entity Linking

1. **Information Retrieval (IR):** Improves search relevance via entity-level indexing rather than superficial keyword matching.
2. **Question Answering (QA):** Maps entity mentions in user questions directly to correct KB entities for factual retrieval.
3. **Machine Translation (MT):** Preserves entity identity and gender consistency across languages.
4. **Relation Extraction (RE):** Connects extracted entities via structured relations to populate Knowledge Graphs.
5. **Conversational Agents:** Grounds references in external Knowledge Bases for task-oriented dialogues.

---

### Key Challenges in Named Entity Linking

- **Ambiguity:** The same surface name can refer to multiple distinct entities.
    - *Example:* *"Washington"* $\rightarrow$ George Washington (Person), Washington D.C. (Capital City), Washington State (Location), or Washington Huskies (Sports Team).
- **Variability:** A single entity can be represented by many surface forms (abbreviations, nicknames, spelling variants).
    - *Example:* *"SG"*, *"S'pore"*, *"Singapore"*, *"The Lion City"*.
- **Missing Entities (NIL Problem):** Mentions in text may not exist in the Knowledge Base. Systems must explicitly detect missing entities and abstain (`NIL`).
- **Knowledge Base Incompleteness & Evolution:** Knowledge Bases are incomplete and continuously evolve as entities are added or updated over time.
- **Context Sensitivity:** Meaning depends heavily on surrounding local and document-level text context.

---

### Named Entity Linking Pipeline Architecture

The standard NEL architecture consists of three core components:

```
[ Input Text with Surface Mention ]
                 │
                 ▼
┌─────────────────────────────────┐
│ 1. Candidate Generation         │ ──► Retrieves candidate set (High Recall, Low Precision)
└─────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ 2. Candidate Ranking            │ ──► Scores candidates using Independent & Dependent features
└─────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│ 3. NIL Prediction               │ ──► Abstains if top score < threshold (Missing Entity)
└─────────────────────────────────┘
                 │
                 ▼
[ Canonical KB Entity URI / NIL ]
```

#### 1. Candidate Generation
- **Task:** Retrieve all plausible candidate entities for a given surface mention.
- **Characteristics:** Typically produces a large set of candidates (high recall, low precision).
- **Common Methods:** String matching / lexical similarity, Wikipedia disambiguation pages, Search APIs (e.g., Wikidata search).
- **Goal:** Ensure the correct KB entity is included in the candidate set.

---

### Candidate Ranking Features (Independent vs. Dependent)

Candidate ranking scores and ranks candidate entities to select the best match. Features are divided into two main categories:

#### 1. Context-Independent Features
- **String Similarity:** Exact match, prefix/suffix overlap, partial match, edit distance.
- **Entity Popularity:** Wikipedia page views, inbound link counts, prior mention-entity frequency $P(e|m)$.
- **Entity Type Consistency:** Matching NER labels (`PER`, `ORG`, `LOC`) with KB entity categories.

#### 2. Context-Dependent Features
- **Local Text Context:** Bag-of-words similarity, keyphrase overlap, or embedding similarity around the mention.
- **Wikipedia Anchor Text Statistics:** Hyperlink anchor text distribution across Wikipedia.
- **Entity Coherence (Global Consistency):** Coherence between entities mentioned within the same document (e.g., linking *"Apollo"* to spaceflight when *"Armstrong"* is linked to Neil Armstrong).
- **Context Overlap:** Overlap between linked entity descriptions and document context.

---

### NIL Prediction (Unlinkable Entities)

- **Task:** Decide when no candidate entity in the KB is correct (`NIL`).
- **Importance:** Essential because real-world Knowledge Bases are inherently incomplete.
- **Implementation:** Thresholding probability scores, or explicitly modeling a `NIL` sink class.
- **Challenge:** Borderline cases where candidate context similarity is moderate make NIL prediction difficult in practice.

---

### Supervised Learning & Deep Learning Formulations for NEL

#### Supervised Ranking Formulation
- **Input:** Pairwise inputs $(m, e)$ where $m$ is the mention (with context) and $e$ is a candidate entity.
- **Output:** Probability score $P(e|m, \text{Context})$ predicting whether candidate $e$ is the correct link.
- **Training Objective:** Classification optimized using cross-entropy loss or ranking loss.
- **Final Decision:** Rank candidate entities by probability score and select top candidate (or `NIL` if below threshold).

#### Common Machine Learning Approaches:
- **Traditional ML:** Logistic Regression, Naive Bayes, and other probabilistic classifiers operating on heavily feature-engineered pipelines.
- **Deep Learning:** Encoder-based architectures (CNN, RNN, Transformers) that learn continuous representations for mention and entity contexts. Often incorporate attention mechanisms for alignment between text context and entity descriptions to capture richer semantic similarity than manual features.

---

### Deep Learning Model Dimensions in NEL

When designing deep learning architectures for NEL, systems vary across five main dimensions:
1. **Choice of Encoder Architecture:** CNNs, RNNs (LSTMs/GRUs), or Transformer models (BERT, RoBERTa).
2. **Local vs. Global Disambiguation Strategies:** Scoring mentions independently vs. joint disambiguation maximizing document-wide entity coherence.
3. **Handling NIL Cases Explicitly or Implicitly:** Using confidence thresholds vs. explicit `NIL` representation vectors.
4. **Candidate Generation Strategy Integration:** Multi-stage retrieval-and-rank vs. joint candidate retrieval networks.
5. **Entity Coherence Modeling Across Documents:** Graph Neural Networks or inter-entity attention layers modeling global topical consistency.

---

### Named Entity Linking Summary

<block title="Named Entity Linking Summary">
- Named Entity Linking connects unstructured text mentions to canonical Knowledge Base entities.
- Core pipeline: **Candidate Generation** $\rightarrow$ **Candidate Ranking** $\rightarrow$ **NIL Detection**.
- Major difficulty stems from ambiguity, variability, missing entities (NIL), KB incompleteness, and context dependence.
- Methodological evolution: **Rule-based & lexical matching** $\rightarrow$ **Feature-engineered ML** $\rightarrow$ **Neural representation learning & attention models**.
</block>

---

## Relation Extraction & Ontologies

### Knowledge Graphs, Triples & Benefits

**Relation Extraction (RE)** converts unstructured text into structured knowledge representations, outputting Knowledge Graphs composed of `(Subject, Predicate, Object)` triples.

- **Example Triples:**
    - `(Euler, born-in, Basel)`
    - `(Euler, works-as, mathematician)`
    - `(Basel, located-in, Switzerland)`

```
 (Euler) ───[ born-in ]───► (Basel) ───[ located-in ]───► (Switzerland)
    │
    └───[ works-as ]───► (Mathematician)
```

#### Knowledge Graphs:
- Represent entities and relations as structured triples.
- Enable machine-readable semantic structure over unstructured text.
- **Example Structure:**
    - *Entity Types:* `Person`, `City`, `Mathematician`
    - *Relations:* `born-in`, `located-in`, `is-a`, `works-as`, `advisor-of`, `education`
- Support reasoning and query execution over connected facts.

#### Benefits of Relation Extraction:
- Improves search and information retrieval via entity-level indexing.
- Enables Question Answering over structured facts.
- Supports Natural Language Understanding (NLU).
- Helps data integration across heterogeneous sources (especially when paired with Entity Linking).
- Improves semantic interoperability (machine understanding of text).
- Enhances recommendation systems.
- **Overall Goal:** Transforms raw text into structured, queryable knowledge graphs.

---

### Tacit Knowledge & Meaningful Relations

- **Tacit Knowledge:** Information that is implied rather than explicitly stated in text (e.g., background commonsense facts). It is difficult to extract automatically because it is not directly expressed in surface syntax.
- **What Counts as a Meaningful Relation:**
    - Not all extracted triples are equally useful.
    - *Example Sentence:* *"Euler was born in Basel where he enjoyed his childhood."*
        - Triple 1 (Useful): `(Euler, born-in, Basel)`
        - Triple 2 (Less Useful): `(Euler, enjoyed, childhood)`
    - Most practical RE systems focus on relations between validated named entities.
    - The utility of extracted relations depends heavily on the downstream application.

---

### Linguistic Complexity: Negation, Uncertainty & Paraphrasing

1. **Negation:**
    - *Sentence:* *"Euler was not born in St. Petersburg."*
    - *Requirement:* Representation like `(Euler, not-born-in, St. Petersburg)`.
    - *Challenge:* Often difficult to represent in standard triple stores without specialized negation predicate schemas.
2. **Uncertainty & Attribution:**
    - *Sentence:* *"They say Euler was born in Basel."*
    - *Requirement:* Represents belief or attribution rather than established fact.
    - *Challenge:* Requires meta-level representations (statements about statements / provenance graphs).
3. **Relation Equivalence & Paraphrasing:**
    - The same underlying fact can be expressed in multiple ways:
        - *"Euler was born in Basel."*
        - *"Basel was the birthplace of Euler."*
    - Semantically equivalent triples: `(Euler, born-in, Basel)` vs. `(Basel, birthplace-of, Euler)`.
    - Requires normalization or controlled vocabularies for consistency across datasets.

---

### Relation Vocabularies & Ontologies (ACE, UMLS, Schema.org)

Ontologies define allowed entities, classes, properties, and relationships to standardize queries (e.g., `(?person, born_in, Basel)`). Without standardization, cross-dataset integration becomes unmanageable.

#### 1. ACE (Automatic Content Extraction)
Defines structured relation categories:
- **Physical:** `located`, `near`
- **Part-Whole:** `geographical`, `subsidiary`, `artifact`
- **Personal-Social:** `family`, `business`, etc.
- **Org-Affiliation:** `employment`, `membership`, `ownership`
- **Agent-Artifact:** `manufacturer`, `inventor`, `user`

#### 2. UMLS (Unified Medical Language System)
- Medical domain ontology containing **~127 semantic types** and **~54 semantic relationships**.
- Includes non-factual or probabilistic relations (e.g., `may-cause`).

#### 3. Formal Ontologies
Formal representation of entities, classes, properties, and relationships.
- **Components:**
    - *Individuals:* Specific entities (e.g., `Euler`, `Basel`).
    - *Classes:* Categories (e.g., `Person`, `City`).
    - *Properties:* Attributes or values (e.g., `birth date`).
    - *Relationships:* Links between individuals (e.g., `born-in`).
    - *Axioms:* Logical constraints.

#### 4. Schema.org
- Industry ontology created by major tech companies.
- Used extensively in the Google Knowledge Graph and web microdata.

---

### Closed-World vs. Open-World Assumption

- **Closed-World Assumption (CWA):** What is not known to be true is assumed to be *false*. Useful in traditional relational databases and closed rule-based systems.
- **Open-World Assumption (OWA):** Absence of information does *not* imply falsehood; unstated facts are simply *unknown*. Essential for Knowledge Graphs and web-scale information extraction.
- **Key Implication:** Directs how missing facts are interpreted during query evaluation and reasoning.

---

### Rule-Based Relation Extraction & Hearst Patterns

#### 1. Hearst Patterns (IS-A / Hyponym Relations)
First proposed by Marti Hearst (1992) for extracting hyponym relationships:

| Pattern Template | Surface Pattern Syntax | Example Match | Extracted Triple |
| :--- | :--- | :--- | :--- |
| `Y such as X` | `"Y such as X"` | *"Mathematicians such as Euler"* | `(Euler, is-a, mathematician)` |
| `such Y as X` | `"such Y as X"` | *"such cities as Basel"* | `(Basel, is-a, city)` |
| `X or other Y` | `"X or other Y"` | *"Euler or other mathematicians"* | `(Euler, is-a, mathematician)` |
| `Y including X` | `"Y including X"` | *"Scholars including Euler"* | `(Euler, is-a, scholar)` |
| `Y especially X` | `"Y especially X"` | *"Mathematicians especially Euler"* | `(Euler, is-a, mathematician)` |

#### 2. Extension Beyond IS-A (Domain-Specific Templates)
Pattern-based extraction for domain-specific relations:
- *Template 1:* `PERSON joined ORG as OCCUPATION`
- *Template 2:* `PERSON works as OCCUPATION at ORG`
- *Example Sentence:* *"Chris works as a lecturer at NUS."*
- *Extracted Triples:*
    - `(Chris, works-as, lecturer)`
    - `(Chris, works-at, NUS)`

---

### Rule-Based RE: Strengths and Weaknesses

| Strengths (Pros) | Weaknesses (Cons) |
| :--- | :--- |
| **No Labeled Dataset Required:** Works immediately without annotated training corpora. | **Low Recall:** Cannot cover the wide range of natural language variability. |
| **High Precision:** Explicit rules produce highly trustworthy extractions. | **Hard to Scale:** Difficult to manually author rules for hundreds of relation types. |
| **Domain Customization:** Easy to tailor rules for specialized domain jargon. | **Labor Intensive:** Rule creation is time-consuming and requires domain experts. |
| | **Limited Generalization:** Fails to generalize to unseen syntax or paraphrases. |

---

### Bootstrapping & Dependency-Based Extraction

#### 1. Bootstrapping Approach
Semi-automatic pattern learning starting from seed entity pairs:
1. **Seed Set:** Start with seed entity pairs with known relations (e.g., `(Euler, Basel)` for `born-in`).
2. **Sentence Retrieval:** Extract sentences from a large corpus containing both entities.
3. **Pattern Learning:** Learn surface context patterns connecting the entity pairs.
4. **New Pair Discovery:** Use learned patterns to discover new entity pairs across the corpus.
5. **Iterative Expansion:** Iterate to expand dataset and pattern set continuously.
6. **Risk (Error Propagation):** If early patterns are imprecise, invalid pairs are extracted, leading to semantic drift and dataset corruption.

#### 2. Dependency-Based Relation Extraction
Uses syntactic dependency trees instead of raw surface text:
- **Grammatical Structure:** Extracts relations based on shortest dependency paths connecting entities (e.g., `nsubj` $\rightarrow$ `verb` $\rightarrow$ `dobj`).
- **Advantage:** More structured and robust than surface patterns, bypassing intervening adjectives and prepositional modifiers.

---

### Traditional Machine Learning Approaches for RE

#### Task Formulations:
- **Binary Classification:** Predict relation vs. no-relation between an entity pair.
- **Multiclass Classification:** Classify relation type directly from a fixed set (e.g., `born-in`, `works-for`, `located-in`).

#### Pipeline Design:
```
[ Text Input ]
      │
      ▼
[ Step 1: Detect Entities ] ──► (NER / Noun Phrase Chunking / Lookup Lists)
      │
      ▼
[ Step 2: Generate Candidate Entity Pairs ] ──► Pair (e1, e2)
      │
      ▼
[ Step 3: Extract Features ] ──► (Lexical, Syntactic, Dependency, Type features)
      │
      ▼
[ Step 4: Classification ] ──► Predict relation existence & classify relation type
```

---

### Relation Extraction Summary

<block title="Relation Extraction Summary">
- Relation extraction builds structured Knowledge Graphs from unstructured text.
- Key difficulties include linguistic variation, ambiguity, negation, uncertainty, and paraphrasing.
- Major methodological approaches:
    - **Rule-based:** High precision, low recall (Hearst patterns & templates).
    - **Bootstrapping:** Semi-automatic iterative pattern learning from seed pairs.
    - **Dependency-based:** Syntactic dependency path extractions (`nsubj`, `verb`, `dobj`).
    - **Feature-based ML & Deep Learning:** Supervised binary/multiclass pipelines and neural representation learning models.
</block>

---

## Summary & Key Takeaways

<takeaways>
- **Entity Resolution (Coreference):**
    - Resolves multiple mentions referring to the same real-world entity.
    - Differentiates directional **anaphora** (anaphor $\rightarrow$ antecedent) from non-directional **coreference**.
    - Evolved from syntactic tree traversals (**Hobbs' algorithm 1978**) $\rightarrow$ feature-engineered **mention-pair ML** (with cross-entropy loss and DPR/GAP benchmarks) $\rightarrow$ **end-to-end neural coreference models**.

- **Named Entity Linking (NEL):**
    - Links surface text mentions to canonical Knowledge Base URIs (e.g., DBpedia / Wikidata).
    - Key challenges: ambiguity, variability, missing entities (**NIL problem**), KB evolution, and context sensitivity.
    - Pipeline: **Candidate Generation** $\rightarrow$ **Candidate Ranking** (context-independent & dependent features) $\rightarrow$ **NIL Prediction**.
    - Models range from traditional ML (Logistic Regression, Naive Bayes) to encoder-based deep neural networks (CNN/RNN/Transformers).

- **Relation Extraction (RE) & Ontologies:**
    - Transforms raw text into `(Subject, Predicate, Object)` Knowledge Graph triples under Open-World Assumptions (OWA).
    - Vocabularies like **ACE** (Physical, Part-whole, Personal-social, Org-affiliation, Agent-artifact), **UMLS** (~127 types, ~54 relations), and **Schema.org** define standard schemas.
    - Methods progress from **Hearst IS-A patterns** $\rightarrow$ **Bootstrapping** $\rightarrow$ **Dependency path extraction** $\rightarrow$ **Supervised ML/DL pipelines**.
</takeaways>
