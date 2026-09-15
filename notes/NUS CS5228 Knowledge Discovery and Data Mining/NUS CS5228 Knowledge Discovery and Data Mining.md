<meta>
Title: NUS CS5228 Knowledge Discovery and Data Mining
Summary: Comprehensive lecture and study notes for NUS CS5228 Knowledge Discovery and Data Mining, covering data preprocessing, exploratory data analysis, clustering, classification, and association rule mining.
Slug: nus-cs5228-knowledge-discovery-and-data-mining
Output: notes/NUS CS5228 Knowledge Discovery and Data Mining/NUS CS5228 Knowledge Discovery and Data Mining.html
CanonicalId: nus-cs5228-knowledge-discovery-and-data-mining
Style: default
EstimatedReadingTime: true
Lang: en
Tags: Data Mining, Clustering, Classification, Association Rules
Status: drafting
Published: 2026-09-12
LastModified: 2026-09-12
</meta>

# NUS CS5228 Knowledge Discovery and Data Mining

## Week 1

<draft>
- 1. Types of Attributes
    - Categorical (Qualitative): Nominal (unordered labels, equals/unequals) vs. Ordinal (ordered labels, ranking relations).
    - Numerical (Quantitative): Interval (meaningful differences, arbitrary zero) vs. Ratio (meaningful ratios, absolute zero).
- 2. Types of Data & Representations
    - Structural Formats: Well-structured, semi-structured, and unstructured data representations.
    - Data Models: Record data (matrices, transaction sets), graph data, and ordered/temporal sequences.
- 3. Data Quality Dimensions
    - Anomalies & Distortions: Noise, outliers, missing values, and duplicate records.
    - Handling Strategies: Detection, removal, imputation, and deduplication trade-offs.
</draft>

# Types of Attributes

## Categorical (Qualitative)
- Nominal: unordered labels; operations = equals/unequal; e.g., Sex, Eye color, Zip code
- Ordinal: ordered; operations = equals/unequal, >, <; e.g., Street number, Education level

## Numerical (Quantitative)
- Interval: meaningful distances, no true zero; operations = +, −; e.g., Body temperature, dates
- Ratio: meaningful ratio and true zero; operations = +, −, *, /; e.g., Age, Weight, Income

# Types of Data

- Well-Structured: fixed schema, easy analysis (relational DBs, spreadsheets)
- Semi-Structured: no rigid schema, tags, mixed data (XML, JSON, CSV)
- Unstructured: no fixed model; requires advanced analysis (images, video, text, audio)

# Data Representations
- Record Data: data matrix or transaction sets
- Graph Data: nodes (vertices) & edges (relationships)
- Ordered Data: intrinsic sequence (stock prices, time series)

# Data Quality

## Noise
- Data = true signal + noise
- Sources: faulty sensors, entry errors, transmission errors, format inconsistencies, unit inconsistencies

## Outliers
- Points significantly different from others
- Case 1: noise → remove or use robust methods
- Case 2: target → detect rare events (fraud, intrusion)

## Missing Values
- Causes: not collected, not applicable
- Handling: remove data points/attributes, fill missing values

## Duplicates
- Exact: identical attribute values
- Near duplicates: slightly different values
- Task: eliminate duplicates, especially across heterogeneous sources

# Exploratory Data Analysis (EDA)
- Assess quality, sanity check, first insights, formulate questions
- Identify noise: histograms, boxplots, scatter plots
- Missing values: handle to prevent bias
- Class label distribution: aim for balanced datasets
- High-dimensional: use dimensionality reduction (t-SNE)
- Unstructured: analyze text, images, audio for basic stats

# Data Preprocessing
- Purpose: improve quality, valid algorithm input, reduce complexity
- Tasks: cleaning, reduction, transformation, discretization

## Data Cleaning
- Handle missing values, outliers
- Merge duplicates
- Correct errors & inconsistencies

## Data Reduction
- Reduce points: sampling (random/stratified)
- Reduce attributes: remove irrelevant, PCA/LDA/t-SNE
- Reduce values: aggregation, binning

## Data Transformation
- Attribute construction (e.g., density = weight/volume)
- Normalization:
  - Min-max scaling → [0,1]
  - Standardization → z-score

## Data Discretization
- Convert continuous → ordinal
- Enables categorical-only algorithms

## One-Hot Encoding
- Categorical → numerical binary attributes (0/1)
- Allows numerical methods on categorical features

# Quick Quiz Insights
- Generally irrelevant attributes: ID, Email, Religion, Zodiac
- Relevant: Age, Education, Income, Credit Approval

# Summary
- Know and clean your data
- Core concepts:
  - What is data mining
  - Knowledge discovery process
  - Data preparation: quality, EDA, preprocessing
- Preprocessing is crucial for meaningful, efficient, valid analysis
## Week 2

<draft>
- 1. Nature of Data & Quality Dimensions
    - Attribute Classification: Review of nominal, ordinal, interval, and ratio characteristics.
    - Data Representations: Transaction sets, document-term matrices, and graph structures.
    - Data Quality Challenges: Measurement error, noise filtering, outlier identification, and missing value imputation.
- 2. Data Preparation Pipeline
    - Data Selection: Targeted attribute filtering, stratified sampling, and feature subset selection.
    - Data Preprocessing & Cleaning: Normalization (min-max, z-score), discretization, and binarization.
    - Exploratory Data Analysis (EDA): Summary statistics, box plots, scatter plots, and correlation matrices.
</draft>

# Data Mining — From Data to Knowledge

## Nature of Data

### Types of Attributes
- Categorical
  - Nominal: unordered categories (e.g., gender, color)
  - Ordinal: ordered categories (e.g., rating: low, medium, high)
- Numerical
  - Interval: numeric values without a true zero (e.g., temperature in Celsius)
  - Ratio: numeric values with a true zero (e.g., income, age)

### Types of Data and Representations
- Data matrix: rows = objects, columns = attributes
- Transactions: sets of items per object
- Graphs: nodes & edges (relationships)
- Ordered/sequential data: e.g., time series

### Data Quality
- Missing values (e.g., "N/A")
- Noise or errors
- Inconsistent or suspicious data
- Data manipulation/fudging

## Data Preparation

### Data Selection
- Identify relevant attributes for analysis
- Remove irrelevant or questionable attributes to improve results

### Data Preprocessing
- Improve data quality
- Generate valid input for data mining algorithms
- Reduce complexity of data to ease analysis

### Data Transformation
- Normalize, standardize, or encode data for algorithms

### Exploratory Data Analysis (EDA)
- Assess data quality
- Understand distributions, outliers, missing values
- Identify errors or unexpected patterns
- Example: infant care dataset may produce unusual but correct data

### Clarifications
- Removing questionable attributes can improve accuracy (e.g., remove zodiac sign for credit prediction)
- Does not ensure no bias (e.g., ethnicity may correlate with other attributes)

# Clustering

## Definition
- Separate unlabeled data into groups of similar objects
- Maximize intra-cluster similarity, minimize inter-cluster similarity

## Applications
- Market segmentation
- Recommender systems
- Web search diversification
- Social networks, fraud detection, image segmentation

## Ingredients
- Object representation: coordinates, sets, or vectors
- Similarity measure:
  - Euclidean distance
  - Jaccard similarity
  - Cosine similarity
- Clustering algorithm: assigns objects to clusters

## Characteristics of Good Clustering
- High intra-cluster similarity
- Low inter-cluster similarity
- Number of clusters should be meaningful and interpretable

## Types of Clusters
- Well-separated: points closer to cluster points than outside
- Center-based: points closer to cluster centroid
- Contiguity-based: points grouped by similarity threshold
- Density-based: dense regions separated by sparse regions

## Types of Clusterings
- By structure:
  - Partitional: non-overlapping
  - Hierarchical: nested clusters
- By exclusivity:
  - Exclusive: one cluster per object
  - Non-exclusive/fuzzy: objects may belong to multiple clusters
- By completeness:
  - Complete: every object assigned
  - Partial: some objects not assigned (noise/outliers)

## Quick Quiz Insight
- Cannot apply clustering if no similarity or distance is defined between data points

# K-Means Clustering

## Characteristics
- Centroid-based, partitional, exclusive, complete
- Each point belongs to exactly one cluster
- Inputs: number of clusters `K`, data in `d`-dimensional space, optional initial centroids
- Optimization objective: minimize Sum of Squared Errors (SSE)

"""
SSE = Σ_{i=1}^{K} Σ_{x ∈ C_i} ||x - μ_i||²
μ_i = (1 / |C_i|) Σ_{x ∈ C_i} x
"""

## Algorithm (Lloyd's Algorithm)
1. Initialize `K` centroids
2. Repeat until convergence:
   - Assignment step: assign each point to nearest centroid
   - Update step: compute new centroid as mean of assigned points
3. Termination: assignments no longer change

## Convergence
- SSE decreases or remains constant
- Always converges but may reach local minimum
- Sensitive to initial centroids
- Early iterations usually give largest SSE reduction

## Limitations
- Poor with clusters of different densities, sizes, or non-spherical shapes
- Different initial centroids may lead to different SSE and empty clusters
- Maximum empty clusters = K − 1

## Handling Empty Clusters
- Replace empty cluster with:
  - Point contributing most to SSE
  - Point from cluster with highest SSE
- Post-processing: split loose clusters with high SSE

## Variants
- K-Means++: improved initialization using distance² probability
- X-Means: automatically selects K using BIC, AIC, or MDL
- K-Medoids: centroid restricted to actual data points; robust to noise

# DBSCAN (Density-Based Spatial Clustering of Applications with Noise)

## Characteristics
- Density-based, partitional, exclusive, partial
- Inputs:
  - `ε` (radius): neighborhood distance
  - `MinPts`: minimum points to form dense region
- Detects noise points

## Types of Points
- Core Points: ≥ MinPts neighbors (including self) within ε
- Border Points: neighbor to at least one core point but not core
- Noise/Outliers: neither core nor border

## Algorithm (2 Phases)
1. Phase 1 — Find Core Points
   - Pick random unexplored point
   - If neighbors < MinPts → temporarily noise
   - Repeat until core point found → start new cluster
2. Phase 2 — Cluster Exploration
   - Explore all neighbors recursively
   - Add noise points if reachable
   - Stop at border points

## Characteristics
- Detects arbitrary shaped clusters
- Assigns noise points automatically
- Core/noise points deterministic; border points may vary
- Always converges

## Limitations
- Sensitive to `ε` and `MinPts`
- Cannot handle clusters with different densities
- Parameter selection requires EDA/domain knowledge

## Choosing Parameters
- Use EDA
- `ε`: meaningful neighborhood radius
- `MinPts`: minimum points for dense region
- Distribution of pairwise distances can guide `ε`

## Quick Notes / Quiz Insights
- K-Means: maximum empty clusters = K − 1; early iterations reduce SSE most
- DBSCAN: smallest cluster size = MinPts; maximum number of clusters = N (each point separate)

# Summary
- Clustering: fundamental unsupervised learning technique
- K-Means: centroid-based, relative similarity, sensitive to shape/density/noise
- DBSCAN: density-based, absolute similarity, detects noise, sensitive to parameters
- Algorithm choice depends on data distribution, cluster shape/size/density, and noise handling
## Week 3

<draft>
- 1. Feature Encoding & Interpretation
    - Replacement Strategies: Categorical-to-numerical mappings, one-hot encoding, and ordinal ranking.
    - Spatial & Coordinate Features: Latitude/longitude distance projections and spherical metrics.
- 2. Clustering Foundations & Hierarchical Methods
    - Core Clustering Concepts: Unsupervised grouping, similarity/distance metrics, and partition criteria.
    - AGNES (Agglomerative Nesting): Bottom-up greedy cluster merging, proximity matrix updates, and dendrogram representations.
    - DIANA (Divisive Analysis): Top-down hierarchical splitting and macroscopic cluster isolation.
- 3. Cluster Evaluation Metrics
    - External Measures: Purity, Rand Index, and Normalized Mutual Information (ground truth required).
    - Internal Measures: Silhouette coefficient, Davies-Bouldin index, and compactness vs. separation trade-offs.
</draft>

Encoding & Interpretation

- Encoding through replacement
  - Transform categorical/nominal attributes into numeric values.
  - Examples:
    - Average Political Leaning → % of Democrats/Republicans
    - State Education Budget → Dollar-per-student
    - School System → Rate of homeschooling
    - Urbanization → #Universities per capita
- Proxy encoding
  - Replace nominal values with 1 or more numerical values
  - Numerical values should reflect assumptions about the impact of the attribute
  - Example: "State" can be encoded to reflect geographic, economic, or political differences
- Ordinal values
  - Example: PA < OK < FL < CT < WV
- Latitude/Longitude
  - Geographic location can affect clustering/analysis
- Other considerations
  - #KFC per capita → proxy for proliferation of fast food
  - Careless encoding can imply questionable or meaningless interpretations
  - Important question: "What is the interpretation of my encoding, and is it meaningful?"

Clustering Overview

- Definition
  - Grouping data points based on similarity
  - No single definition; relies on distance/similarity measures
- General-purpose data mining method
- Algorithms discussed
  - K-Means: centroid-based, partitional, exclusive, complete
  - DBSCAN: density-based, partitional, exclusive, partial
  - Hierarchical Clustering

Hierarchical Clustering

- Characteristics
  - Clusters: hierarchical, exclusive at each level
  - No parameterization required in principle
  - Often number of clusters is specified (similar to K-Means)
  - Different measures to calculate distances between clusters

Dendrograms

- Visualization of hierarchical relationships
- Binary tree:
  - Each node: a cluster
  - Each leaf: singleton cluster
  - Height: distance between clusters
- Cutting the dendrogram at a level gives the desired number of clusters

Types

- Agglomerative (AGNES)
  - Bottom-up
  - Start: each point is its own cluster
  - Merge closest clusters step-by-step
  - Stop: single cluster remains
- Divisive (DIANA)
  - Top-down
  - Start: all points in one cluster
  - Split clusters step-by-step
  - Stop: each cluster is a singleton

AGNES Algorithm

1. Initialization: Each point forms its own cluster
2. Repeat:
   - Merge the two closest clusters
3. Stop when only one cluster remains

Distance Calculation

- Single Linkage
  - Distance between clusters = minimum distance between points of clusters
  - Strength: Can handle non-globular shapes
  - Weakness: Susceptible to noise → "chaining"
- Complete Linkage
  - Distance between clusters = maximum distance between points of clusters
  - Strength: Less susceptible to noise/outliers
  - Weakness: Bias toward globular clusters, can break large clusters
- Average Linkage
  - Distance between clusters = average distance between points of clusters
  - Compromise between single and complete linkage
- Centroid Linkage
  - Distance between clusters = distance between cluster centroids
- Ward Linkage
  - Distance between clusters = increase in variance when merging clusters
  - Formula:  
    ```
    dWard(Ci, Cj) = Variance(Cij) - Variance(Ci) - Variance(Cj)
    ```
  - Intuition: Merges clusters that minimally increase variance

Dendrogram Depth

- Minimum depth: 1 (all points merge immediately)
- Maximum depth: N-1 (each merge is sequential, forming a chain)
- Single linkage often produces deeper dendrograms (closer to N-1)

Implementation Notes

- Use a distance matrix for AGNES
- Update matrix after each merge
- Merge next pair based on chosen linkage criterion

Summary of Linkages

- Single Linkage: min distance → non-globular clusters, sensitive to noise
- Complete Linkage: max distance → globular clusters, robust to noise
- Average Linkage: mean distance → compromise
- Centroid Linkage: distance between centroids
- Ward Linkage: increase in variance → compact clusters

Practical Considerations

- Encoding choices affect clustering results
- Linkage method selection affects dendrogram shape and cluster formation
- Hierarchical clustering useful for visualization and understanding relationships

## AGNES — Implementation (Hierarchical Clustering)

- Distance matrices are updated after each merge using the chosen linkage method (e.g., Average Linkage)
- Example steps (Average Linkage):
  1. Merge CA and CB → new cluster CAB
     ```
     Distance matrix:
     CAB  CC  CD  CEF
     ∞   5.70 8.45 9.59
     CC  ∞    6.73 4.92
     CD  ∞    4.76
     CEF ∞
     ```
  2. Merge CD and CEF → new cluster CDEF
     ```
     CAB  CC  CDEF
     ∞   5.70 9.21
     CC  ∞    5.51
     CDEF ∞
     ```
  3. Merge CC and CDEF → new cluster CCDEF
     ```
     CAB  CCDEF
     ∞   8.33
     CCDEF ∞
     ```
  4. Merge CAB and CCDEF → final cluster CABCDEF

- AGNES Complexity
  - Space: O(N²) (distance matrix storage)
  - Time:
    - Baseline: O(N³) → N-1 steps, each scanning O(N²) matrix
    - With priority queues/heaps: O(N² log N)
    - Single Linkage special case: O(N²)

## DIANA — Divisive Hierarchical Clustering

- Top-down approach
- Start: all points in one cluster
- Recursively split clusters until all clusters have size 1
- Challenges:
  - 2ⁿ ways to split a cluster with n points → need heuristics
  - Generally slower and less common than AGNES
- Advantages:
  - Early stopping possible if complete hierarchy not needed
  - Splitting can use global knowledge

## Cluster Evaluation

### Challenges

1. Visualization limitations
   - High-dimensional data (≥3 dimensions) hard or impossible to visualize
   - Cluster shapes, sizes, densities, and noise affect assessment
2. Clustering algorithms always find clusters
   - Random data will still produce clusters with K-Means, DBSCAN, AGNES

### Purpose of Evaluation

- Compare different clustering algorithms
- Compare results under different parameters
- Minimize effects of noise
- Two approaches:
  - External quality measures: compare to ground truth
  - Internal quality measures: evaluate using data alone

### External Quality Measures

- Ground truth available → labels indicate points that belong together
- Cluster Purity (P)
```
P = (1/N) * Σ_c max_l |c ∩ l|
```
- N = total points, c = clusters, l = labels
- Limitation: does not penalize many small clusters
- Information Retrieval Metrics
- True Positives (TP): same cluster, same label
- True Negatives (TN): different clusters, different labels
- False Positives (FP): same cluster, different labels
- False Negatives (FN): different clusters, same label
- Derived metrics
- Rand Index (RI)
- Precision, Recall, F1-Score

### Internal Quality Measures

- Sum of Squared Errors (SSE)
- Used to select number of clusters (elbow method)
- Limitation: favors globular clusters, decreases with increasing K
- Silhouette Coefficient (SC)
- Measures how similar a point is to its own cluster vs. other clusters
```
For point i:a(i) = average intra-cluster distance (cohesion)b(i) = minimum average distance to other clusters (separation)SC(i) = (b(i) - a(i)) / max(a(i), b(i))
```
- SC ∈ [-1, 1]; higher = better clustering

### Practical Considerations

- Choice of “best” clustering is often pragmatic
- Parameters can be task-specific (e.g., max/min cluster size, density thresholds)
- K may be set too high and clusters merged later
- Focus can be on specific clusters rather than entire clustering

## Summary — Clustering

- Goal: find patterns/groups in unlabeled data
- Clustering algorithms vary widely in strengths and weaknesses
- Discussed algorithms: K-Means, DBSCAN, AGNES
- Emphasis:
- Understanding conceptual inner workings
- Linkage methods and distance measures
- Cluster evaluation remains a challenge, especially without ground truth
- Practical tip: evaluation often requires combination of internal measures, domain knowledge, and parameter tuning
## Week 4

<draft>
- 1. Hierarchical Linkage Criteria
    - Single Linkage: Nearest-neighbor distance, sensitive to chaining effects and noise bridges.
    - Complete Linkage: Farthest-neighbor distance, generates compact, spherical clusters.
    - Average & Centroid Linkage: Balances outlier sensitivity and cluster cohesion.
- 2. Density-Based Clustering (DBSCAN)
    - Density Concepts: Epsilon (ε) neighborhood, MinPts threshold, core points, border points, and noise.
    - Cluster Expansion: Density-reachability and density-connectivity without assuming predefined cluster counts.
- 3. Association Rule Mining Foundations
    - Transactional Patterns: Market basket formulation, itemsets, and support/confidence metrics.
    - Monotonicity & Pruning: Downward closure property of frequent itemsets.
</draft>

Recap — Hierarchical Clustering  
AGNES (AGglomerative NESting)  
- Start with N clusters, one for each data point  
- Iteratively merge nearest clusters into one  
- Stop when all data points are in a single cluster  
- Core question: How to calculate distances between clusters?  

Recap — Linkage Methods  
- Single Linkage: Distance between the closest pair of points in clusters  
- Complete Linkage: Distance between the farthest pair of points in clusters  
- Average Linkage: Average distance between all pairs of points across clusters  

Recap — Cluster Evaluation  
- External quality measures (if ground truth available):  
  - Cluster purity  
  - TP/TN/FP/FN-based metrics (e.g., Rand index)  
- Internal quality measures (unlabeled data):  
  - Elbow method using Sum of Squared Errors (SSE)  
  - Silhouette Coefficient (SC)  
- Practical notes:  
  - No fool-proof method to find the "best" clustering  
  - Decision on clustering often pragmatic  

Recap — Clustering as a Means to an End  
- Clustering as part of Exploratory Data Analysis (EDA):  
  - SSE plot, SC plot, dendrogram provide insights  
  - Requires only similarity/distance between data points  
  - Gray area between simple EDA and proper data analysis  
- Clustering for data preprocessing:  
  - Example: Cluster persons by height into K=10 groups  
  - Assign each person new height = cluster centroid  
  - Forms aggregation, binning, or smoothing  

Association Rules — Basic Setup  
- Input database: set of transactions  
  - Transaction = set of items  
- Output: Association Rules  
  - Rules predicting occurrence of some items based on others  
- Example transaction table:  

  TID | Items  
  --- | ---  
  1 | item1, item2, item3, item4, item5  
  2 | item2, item3, item5  
  3 | item1, item4, item5  
  4 | item2, item3, item5, item6, item7  
  5 | item1, item3, item5, item7  

- Example rules:  
  - {item2, item3} → {item5}  
  - {item1} → {item3}  
  - antecedent → consequent  

Applications
1. Market Basket Analysis  
- Purpose: Understand customer shopping behavior  
  - Items: products in store  
  - Transaction: baskets at check-out  
- Interesting rules:  
  - Customers who buy {a, b} tend to buy {x, y}  
  - Example: {cereal} → {milk}  

2. Medical Data Analysis  
- Diagnosis Support Systems:  
  - Items: symptoms, diseases  
  - Transaction: patient history  
- ADR discovery (adverse drug reaction):  
  - Items: drugs, reactions/symptoms  
  - Transaction: patient history  

3. Census Data Analysis  
- Purpose: Insights into population  
  - Items: demographic data  
  - Transaction: census record  

4. Behavior Data Analysis  
- Items: movies, songs, books  
- Transaction: viewing/listening/reading history  
- Purpose: Recommendation systems  

Association Rules — Problem Statement  
- Association rules are not "hard" rules  
  - {cereal} → {milk} does not mean it always occurs  
- Each possible combination of items is a potential rule  
- Association Rule Mining goal:  
  - Find interesting/significant association rules efficiently  

Definitions — Itemset, K-itemset  
- Itemset: A subset of items from the set of all items  
- K-itemset: An itemset containing exactly k items  

Definitions — Support Count, Support (for itemsets)  
- Support Count (SC): Number of transactions containing an itemset  
  - Example: SC({bread, yogurt, milk}) = 2  
- Support (S): Fraction of transactions containing an itemset  
  - Example: S({bread, yogurt, milk}) = 2/5  

Definitions — Frequent Itemset  
- Frequent itemset: An itemset whose support is greater than or equal to a minimum threshold  
  - Example: All itemsets with support ≥ min_support  

Definitions — Association Rule  
- Association rule: Implication of the form X → Y, where X and Y are itemsets  
  - Example: {yogurt, milk} → {bread}  

Definitions — Support (for association rules)  
- Support of an association rule X → Y: Fraction of transactions containing all items in X ∪ Y  

Definitions — Confidence  
- Confidence of an association rule X → Y: Probability that Y occurs given X occurs  
  - Formula:  
    """  
    Confidence(X → Y) = Support(X ∪ Y) / Support(X)  
    """  

“””
support(X→Y) = P(X ∪ Y)
Confidence(X → Y) = Support(X ∪ Y) / Support(X)
“””

- High Support, High Confidence → Interesting Rules  
- Low support & low confidence: Uninteresting  
- Low support & high confidence: Rare X, but when X occurs, Y almost always occurs  
- High support & low confidence: X occurs frequently without Y, rule is weak  
- High support & high confidence: X occurs frequently and almost always with Y → interesting

Quick Quiz  
- Given an association rule R, the inequality always holding:
  - Confidence C(R) ≤ Support S(R_X) where X is the antecedent of R
  - Or equivalently:
    """
    0 ≤ Confidence(X → Y) ≤ 1
    0 ≤ Support(X → Y) ≤ 1
    """
- Note: Confidence can never exceed 1; support of X ∪ Y ≤ support of X

Brute Force Approach — Algorithm  
- Goal: Find all association rules X → Y with:  
  - Support S(X → Y) ≥ minsup  
  - Confidence C(X → Y) ≥ minconf  
- Steps:  
  1. List all possible association rules X → Y  
  2. Calculate support S(X → Y) and confidence C(X → Y) for each rule  
  3. Drop rules with S(X → Y) < minsup or C(X → Y) < minconf  

Brute Force Approach — Computation Complexity  
- Theoretical number of rules grows exponentially with number of unique items
  - O(3^d) ≈ 3^d - 2^(d+1) + 1 (d = number of items)
  - Example: 6 items → 602 possible rules
- Practical number of "available" rules limited by max transaction size
  - Let’s say the maximum number of items 
  - Example: max 250 rules for small transactions, actual distinct rules = 154  

Decoupling Support and Confidence  
- Observation: A rule X → Y can only have sufficient support if X ∪ Y is a frequent itemset  
- No need to calculate confidence for rules whose itemsets are not frequent  

Two-Part Algorithm for Mining Association Rules  
- Part 1 — Frequent Itemset Generation:  
  - Generate itemsets with support ≥ minsup  
  - Number of possible itemsets: 2^d - 1
- Part 2 — Association Rule Generation:  
  - Generate rules from frequent itemsets  
  - Return rules with confidence ≥ minconf  

Frequent Itemset Generation — Brute Force Algorithm  
- For each transaction, generate k-itemsets (k=1,2,…,max #items)  
- Increment global counter for each itemset found  
- Complexity: Exponential, reduces via sampling or Apriori  

Apriori Principle (Anti-Monotonicity Principle)  
- If X ⊆ Y then:  
  - S(X) ≥ S(Y)  
  - If Y is frequent → X is frequent  
  - If X is not frequent → Y is not frequent  

Apriori Algorithm  
- Notations:  
  - Lk: candidate k-itemsets  
  - Fk: frequent k-itemsets (Fk ⊆ Lk)  
- Steps for k = 1..w:  
  1. Generate Lk from Fk-1  
  2. Prune k-itemsets from Lk using Fk-1  
  3. Calculate support count (SC) for remaining Lk itemsets  
  4. Filter Lk itemsets with insufficient SC → Fk  
  5. Stop if |Fk| = 0  

Generating/Pruning Candidate Itemsets  
- Fk-1 × F1 method: merge frequent (k-1)-itemsets with frequent 1-itemsets  
- Fk-1 × Fk-1 method: merge frequent (k-1)-itemsets that overlap in (k-2) items  
- Prune: remove any k-itemset if any of its (k-1)-subsets is not in Fk-1  

Calculating Support Counts  
- Requires full database scan  
- For each transaction T, check each candidate s ∈ Lk:  
  - If s ⊆ T → increment counter  
  - The step we want to minimize

Two-Part Algorithm — Rule Generation  
- For each frequent itemset S:  
  - Generate candidate rules X → Y where Y = S - X  
  - Calculate confidence C(X → Y)  
  - If C(X → Y) ≥ minconf → add to result set  
- Number of candidate rules for each itemset: 2^|S| - 2  
- Observation using Apriori:  
  - If a rule X → Y has low confidence, all rules with the same union S and containing Y in the consequent also have low confidence  

Rule Lattice  
- Node: association rule  
- Edge: containment relationship w.r.t. antecedent/consequent  
- Example: |S| = 4 → 14 possible rules  
- Pruning based on confidence reduces number of candidate rules significantly  

Two-Part Algorithm for Mining Association Rules  
- Part 1 — Frequent Itemset Generation  
  - Generate all itemsets with support ≥ minsup  
  - Uses the Apriori algorithm and anti-monotonicity principle  
- Part 2 — Association Rule Generation  
  - Generate association rules from frequent itemsets  
  - Rules obtained by binary partitioning of itemsets  
  - Keep rules with confidence ≥ minconf  

Definitions — Lift  
- Lift of an association rule X → Y:  
  - Measures probability of Y given X while controlling for the overall support of Y  
  - Captures how much more (or less) likely Y is when X occurs, compared to Y occurring independently  
- Formula:  
  """  
  Lift(X → Y) = Support(X ∪ Y) / (Support(X) × Support(Y))  
  """  

Lift — Interpretation  
- Lift > 1: Positive association (X increases likelihood of Y)  
- Lift = 1: X and Y are independent  
- Lift < 1: Negative association (X decreases likelihood of Y)  
- Example interpretation:  
  - Probability of {bread} vs. probability of {bread} given {cereal}  
  - If lift < 1, presence of cereal reduces probability of bread  

Usage of Lift and Other Metrics  
- Further filtering and ranking of association rules  
- Identifying substitute or complementary items  
- Note: Lift is not part of the Apriori algorithm  
  - Anti-monotonicity principle does not hold for lift  

Discussion  
- Alternative metrics for rule interestingness (beyond support, confidence, lift):  
  - Conviction  
  - All-confidence  
  - Collective strength  
  - Leverage  
- Additional information that can improve analysis:  
  - Item attributes (e.g., quantity, price)  
  - Sequence information (order of item selection)  
  - Item categories (e.g., dairy products)  
  - User-level information (linking multiple transactions to the same user)  
- Important reminder:  
  - Association rules capture correlations or co-occurrences  
  - They do not imply causality  

Summary  
- Pattern of interest: Association rule X → Y  
  - Predicts occurrence of items Y based on items X  
  - Applicable to many types of transactional data  
- Rule quality measured by multiple metrics:  
  - Support, confidence, lift, and others  
- Practical handling of computational complexity:  
  - Decoupling support and confidence calculations  
  - Apriori algorithm for frequent itemset generation  
  - Efficient association rule generation from frequent itemsets 
## Week 5

<draft>
- 1. Association Rules & Pattern Discovery
    - Metric Formulations: Support, Confidence, Lift, Leverage, and Conviction.
    - Apriori Principle: Anti-monotone property of support for candidate pruning.
    - Frequent Pattern Mining: Candidate generation and rule derivation dynamics.
- 2. Supervised Learning & Classification Foundations
    - Task Framing: Input feature mapping, discrete target labels, and predictive generalization.
    - Evaluation Paradigms: Confusion matrix, accuracy, precision, recall, and F1-score.
</draft>

CS5228: Knowledge Discovery and Data Mining — Lecture 5
Classification & Regression I

Recap — Association Rules
- Association Rule Mining:
  - Input: database of transactions (sets of items)
  - Output: rules predicting occurrence of items based on other items
- Example: Market Basket Analysis
  - Item = product in supermarket
  - Transaction = products in basket at checkout
  - Goal: find rules like “customers who buy X also tend to buy Y”

- Key metrics to quantify rule usefulness: support, confidence, lift, conviction, leverage
- Observations: relationship between support and confidence
- Anti-monotone property of support and confidence

- Frequent Itemset and Rule Generation:
  1) Frequent Itemset Generation
  2) Association Rule Generation
- Apriori Algorithm: used for frequent itemset and association rule generation  

- Lattice properties:
  - If an itemset is not frequent, all supersets are also not frequent
  - If a rule has insufficient confidence, all rules containing that consequent also fail

Classification & Regression — Overview
- Core tasks of supervised machine learning
- Training: find patterns between features (independent variables) and labels (dependent variables)
- Prediction: assign values to labels for new/unseen data

- Classification: dependent variable is categorical
- Regression: dependent variable is continuous

Application Examples
- Predict flat prices (regression)
- Health analytics: predict heart disease (classification)
- Sentiment analysis / opinion mining (classification)
- Self-driving vehicles:
  - Regression tasks: acceleration, steering angle, event probability
  - Classification tasks: obstacle detection, street sign recognition

Supervised Training/Learning — Basic Setup
- Dataset D: pairs {(x, y)}
  - x: features
  - y: label
- Split dataset into:
  - Dtrain: training data
  - Dtest: testing data
  - Dtrain ∩ Dtest = ∅

- Model: parameterized function h(x, Θ) = y
  - Θ = learnable parameters (not all models are parameterized)
- Model selection: choose family of functions (KNN, Decision Trees, Linear Models, Neural Networks)
- Training: find Θ_best → best mapping between features and labels

Classification & Regression — Evaluation

- Regression evaluation: compare predicted vs actual numeric values
  - Common metric: Root Mean Squared Error (RMSE)

- Classification evaluation (binary classification example):
  - Confusion Matrix
  - Metrics:
    - Accuracy = (TP + TN) / (TP + TN + FP + FN)
    - Sensitivity (Recall) = TP / (TP + FN)
    - Specificity = TN / (TN + FP)
    - Precision = TP / (TP + FP)
    - F1 Score = 2 * (Precision * Recall) / (Precision + Recall)

- Importance of multiple metrics:
  - Highly imbalanced datasets may give misleading accuracy
  - Example: COVID-19 test where most people are negative → always negative test gives high accuracy but is useless

- FP and FN may have different consequences depending on application:
  - Heart disease: FN (misclassifying high-risk) worse than FP
  - News classification: FP worse than missing relevant article

Classification with numerical class scores:
- Models may output class probabilities → need thresholding to convert to binary 0/1
- Different thresholds yield different results
- ROC (Receiver Operating Characteristic) curve:
  - Plot True Positive Rate (Sensitivity) vs False Positive Rate (1 - Specificity)
  - Evaluate all meaningful thresholds

- AUROC (Area Under ROC Curve) quantifies classifier quality:
  - Random classifier: AUROC = 0.5
  - Perfect classifier: AUROC = 1.0

- Example: IRIS dataset (3 classes, 50 samples each, 4 features) → ROC smoother with more samples

Quick Quiz Highlights:
- Accuracy is a good measure when:
  - Dataset is reasonably balanced
  - Sufficient test data samples
- For binary classification, choice of classifier depends on the context and evaluation metric (accuracy, AUROC, precision/recall, etc.)

Classification: Evaluation — Beyond 2 Classes

- Multiclass classification example: 3 classes, 50 samples per class
- Confusion matrix generalization
- One-vs-Rest (OvR) approach: create binary confusion matrix for each class vs all others

- Micro Averaging:
  - Aggregate TP, FP, FN, TN over all classes
  - Favors bigger classes (since counts dominate)

- Macro Averaging:
  - Average metrics calculated separately for each class
  - Treats all classes equally (normalized metrics)

- ROC/AUROC can also be applied to multiclass using One-vs-Rest
  - AUROC = 0.5 for random classifier
  - AUROC = 1 for perfect classifier

Quick Quiz:
- F1-score of 0.6 comparison for 2-class vs 10-class classifier. Which one is performing better: 10-class classifier

K-Nearest Neighbor Algorithm (KNN)

- Intuition: label of unseen data point x derived from k nearest neighbors
- "Training": store all training data
- Prediction:
  1. Calculate distance from xi to all training points xj
  2. Select k-nearest neighbors
  3. Classification: majority label among neighbors
  4. Regression: mean of neighbors’ labels

- Distance metrics:
  - Euclidean, Manhattan, Chebyshev
  - Cosine similarity, Jaccard similarity, user-defined metrics

- Choosing k:
  - Small k: sensitive to noise, overfitting, uneven decision boundaries
  - Large k: underfitting, overly smooth decision boundaries
  - Very large k: predictions converge to global mean (regression) or majority class (classification)
  - k typically odd to reduce ties; prime not strictly necessary

KNN Examples:
- IRIS dataset: 3 classes, 50 samples each, 4 features
  - 1-NN decision boundaries derived from Voronoi tessellation
  - Overlap between some classes affects prediction accuracy

KNN Caveats:
- Pros:
  - Simple, intuitive, can produce arbitrarily shaped decision boundaries
  - No training time (lazy learning)
  - Generic, works with any meaningful distance metric

- Cons:
  - Prediction can be slow for large datasets
  - Need to store all training data

- Feature scaling/normalization essential:
  - Z-score normalization or Min-Max scaling
  - Prevents dominance of features with larger ranges

- Curse of Dimensionality:
  - High-dimensional data → points tend to be equally distant (average distance between points converge)
  - k-NN loses effectiveness as distance differences shrink

- Non-numerical data handling:
  - Ordinal features → map to numerical preserving order (the distance is often not intuitive)
  - Nominal features → one-hot encoding (increases dimensionality)
  - Binary features → 0/1 indicator
  - Custom distance metrics may be needed for categorical data

- Semantic vs low-level similarity:
  - For unstructured data (text, image, video), pixel-wise similarity may not reflect semantic similarity

Supervised Learning Extended Setup:
- Model building process:
  1. Preprocessing & normalization
  2. Model selection
  3. Hyperparameter tuning
- Test data must remain unseen until final evaluation
- Validation data used for hyperparameter tuning/model selection

- K-Fold Cross Validation:
  - Split training data into k folds
  - Train on k-1 folds, validate on remaining fold
  - Repeat for k rounds
  - Advantages: more reliable average results, variance indicates stability

- Avoid information leakage:
  - Normalize only using training data before applying to test/validation
  - Prevents skewed mean/std statistics

Summary:
- Evaluation metrics vary by data and task
- KNN: intuitive, but sensitive to choice of k, scaling, dimensionality, and distance metric
- Proper preprocessing, validation, and careful metric selection are essential for reliable model performance
## Week 6

<draft>
- 1. Supervised Learning Formal Setup
    - Mathematical Definition: Feature vectors in ℝ^d, discrete labels vs. continuous regression targets.
    - Hypothesis Class & Loss Functions: Empirical risk minimization, 0-1 loss, and cross-entropy.
- 2. Generalization, Overfitting & Model Validation
    - Bias-Variance Trade-off: Underfitting vs. overfitting mechanics in complex models.
    - Validation Protocols: Train/test split, k-fold cross-validation, and stratification.
- 3. Regularization & Model Optimization
    - Structural Risk Minimization: L1 (Lasso) vs. L2 (Ridge) penalty formulation and weight shrinkage.
</draft>

SUPERVISED LEARNING FOUNDATIONS

1. Supervised Learning Setup

We are given:
- Training dataset D = {(xi, yi)} for i = 1…N
- xi ∈ ℝ^d (feature vector)
- yi = label (classification) OR numeric value (regression)

Goal:
Learn a function f(x) that generalizes well to unseen data.

Key Objective:
Minimize generalization error, not just training error.

2. Classification vs Regression

2.1 Classification
- Output space is discrete (finite categories).
- Examples:
  - Spam vs Not Spam
  - Disease vs No Disease
  - Multi-class image classification

Model outputs:
- Hard label (e.g., 0/1)
- Probability distribution over classes

Decision boundary:
- Separates feature space into class regions.

2.2 Regression
- Output space is continuous.
- Examples:
  - House price prediction
  - Temperature forecasting
  - Sales prediction

Model outputs:
- Real number prediction.

3. Evaluation Metrics

3.1 Regression Metrics

Let yi = true value  
Let ŷi = predicted value  

Mean Squared Error (MSE):
MSE = (1/N) Σ (yi − ŷi)^2
- Penalizes large errors heavily.
- Differentiable → convenient for optimization.

Root Mean Squared Error (RMSE):
RMSE = √MSE
- Same unit as target variable.

Mean Absolute Error (MAE):
MAE = (1/N) Σ |yi − ŷi|
- More robust to outliers than MSE.

Bias–Variance Insight:
- High bias → consistently wrong predictions.
- High variance → unstable predictions.

3.2 Classification Metrics

Confusion Matrix:

                 Predicted
               |  Pos  |  Neg
--------------------------------
Actual  Pos    |  TP   |  FN
Actual  Neg    |  FP   |  TN

Accuracy:
(TP + TN) / Total
- Not reliable for imbalanced data.

Precision:
TP / (TP + FP)
- “How many predicted positives are correct?”

Recall (Sensitivity):
TP / (TP + FN)
- “How many actual positives are detected?”

F1 Score:
2 * (Precision * Recall) / (Precision + Recall)
- Harmonic mean of precision and recall.

ROC Curve:
- Plots TPR vs FPR.
- AUC measures ranking quality.

When to use:
- Imbalanced dataset → Prefer F1 or AUC.
- Balanced dataset → Accuracy often sufficient.

PART II — K-NEAREST NEIGHBORS (KNN)

1. Core Idea

Prediction based on similarity:
- Find k closest training points.
- Aggregate their labels.

Classification:
- Majority vote.

Regression:
- Average of neighbors.

2. Distance Metrics

Common choices:
- Euclidean distance
- Manhattan distance
- Cosine similarity (high-dimensional)

Important:
Feature scaling is critical.
Unscaled features distort distance.

3. Bias–Variance Tradeoff in K

Small k:
- Complex decision boundary.
- Low bias.
- High variance.
- Sensitive to noise.

Large k:
- Smooth decision boundary.
- High bias.
- Low variance.

Model selection:
- Choose k via cross-validation.

4. Computational Aspects

Training:
- Cheap (store data).

Prediction:
- Expensive (compute distances to all points).

Optimizations:
- KD-Trees
- Approximate nearest neighbors

PART III — DECISION TREES

Idea:
- Represent mapping between features and label/value as flowchart-like structure

1. Model Representation

Tree structure:
- Root
- Internal nodes (feature tests): test on a single feature
- Branches: outcome of a test; corresponds to a feature values or range of values
- Leaves (predictions): label (classification) or real value (regression)

The probability of overfitting rises as the depth of the tree

Interpretation:
Each root-to-leaf path = decision rule.

Example:
IF Age < 50 AND Income > 70K → Class A

What to do in case of unknown (unseen) values for a feature?
- During Training
  - Treat “unknown” as a separate category
  - Impute missing values
- During Prediction
 - Assign to the Most Common Branch
 - Probabilistic Split / Weighted Voting
 - Use Surrogate Splits
 - Map to a Known Category

Diversity
- Different branch
- Different depth
  - Leaves can have more than one label or real value
  - Required based on dataset or based on choice
  - Final output: Majority label (classification) or mean of values (regression)

Notations
- D_t - set of records that reach node t
- D_0 - set of all records at root node

General Procedure
- If |D_t| = 1 or all records in D_t have the same class or value -> t is leaf node
- Otherwise, choose test (feature + conditions) to split D_t into smaller subsets (i.e., subtrees)
- Recursively apply procedure to each subtree

2. Recursive Partitioning Algorithm

At node t with dataset Dt:

Stopping criteria:
- All labels identical
- |Dt| < minimum samples
- Depth limit reached

Otherwise:
- Choose best split
- Partition data
- Recursively grow subtrees

Global optimum:
- Best splits: splits that result in a Decision Tree with the highest accuracy
- Problem: Finding the optimal tree is NP-complete -> not practical for large datasets

Greedy nature:
- Faster heuristics
- Locally optimal at each step
- Not globally optimal
- Pick the split that minimizes the impurity of subtrees (w.r.t class labels)
(Better separation of labels leads to lower impurity)

Binary Split:
- Partition all d values into two subsets
- (2^d - 2) / 2 possible splits for nominal value
- For ordinal value, partitions must preserve natural order of values
- d - 1 possible splits for ordinal value

Multiway Split:
- Each value yields on subtree
- In principle, arbitrary splits into 2 <= s <= d subtrees possible, but number of possible splits explodes

General Procedure
- Calculating impurity I(t) of node t before splitting
- For each possible / considered split, calculate impurity of split (weighted average of impurities of resulting child nodes)
- Select split with lowest impurity, and perform split if it is lower than original impurity

3. Splitting Criteria — Classification

Let P(c|t) be class probability in node t.

Gini:
1 − Σ P(c)^2
- Measures probability of misclassification.

Entropy:
− Σ P(c) log2 P(c)
- Measures information content.

Properties:
- Both are 0 for pure node.
- Both maximal when uniform distribution.

Information Gain:
IG = Impurity(parent) − Weighted impurity(children)

Choose split maximizing IG.
Required condition: IG > 0

Weighted impurity (children)
- The sum of (number of records at the child / number of records at parent node) * impurity of node

4. Splitting Criteria — Regression

Use variance reduction.

RSS(t):
Σ (yi − μt)^2

Choose split minimizing:
Σ RSS(child)

Equivalent:
Minimize within-node variance.

5. Numerical Feature Splitting

Procedure:
1. Sort feature values.
2. Consider midpoints between adjacent values.
3. Evaluate impurity for each candidate threshold.
4. Choose the best.

Time complexity:
O(N log N) per feature (due to sorting).

6. Overfitting in Trees

Trees can always split the training data perfectly (assuming not duplicate data points with different target labels/values):
- Grow until each leaf has one sample.
- One data sample -> 100%.
- Achieve zero training error.

Problem:
Memorization ≠ generalization.

High variance model.

Solution (Limit size/height of Decision Tree -> Pruning):
- Pre-pruning: Stop splitting nodes ahead of time
- Post-pruning: Build full tree, but then removes leaves/splits if beneficial

The maximum possible depth of a Decision Tree given a dataset with N data points: 

7. Pros & Cons

Pros:
- Inexpensive to train and test
- Easy to interpret (if tree is not too large)
- Can handle categorical and numerical data

Cons:
- Sensitive to small changes in the training data
- Greedy approach does not guarantee optimal tree
- Each decision involves only a single feature
- Does not take interactions between features into account

7. Pruning

Pre-Pruning:
- Max depth
- Min samples per leaf
- Min impurity decrease

Pros:
- Faster
Cons:
- May stop too early.

Post-Pruning:
1. Grow full tree.
2. Evaluate subtrees on validation set.
3. Remove branches if performance improves.

More robust than pre-pruning.

PART IV — ENSEMBLE METHODS

Motivation:
Aim to address limitations of (single) Decision Trees
- Single tree → high variance (sensitive to small changes in training data)
- Typically not the same accuracy as other approaches

Idea:
Combine multiple models to improve stability.

Ensemble prediction:
Classification → vote  
Regression → average  

PART V — BAGGING

1. Bootstrap Sampling

Generate dataset Di by:
- Sampling N points uniformly from original dataset D
- With replacement

Expected:
~63% unique samples per bootstrap set.

2. Bagging Algorithm

Basic Idea:
- Train many models of different training data
- Combine predictions of each models for final prediction
- Increases accuracy and lowers variance

For b = 1…B:
- Sample Di
- Train tree Tb

Prediction:
- Majority vote (classification)
- Average (regression)

Why it works:
Variance reduction via averaging.

If errors are uncorrelated:
Var(average) ↓ significantly.

Limitation:
- Assume original dataset D has one or more strong predictors
  - Features that yield splits with a (very) high information gain
- Bootstrap samples D_i are also very likely to have those strong predictors

Consequences:
- Most bagged trees will use strong predictors on top
- Most bagged trees will look very similar
- Predictions of bagged trees will be highly correlated

- If trees are highly correlated → limited improvement
- Only limited reduction in variance

PART VI — RANDOM FOREST

Improvement over Bagging:
Add feature randomness.

At each split:
- Randomly choose m features (m < d, typically m ≈ √d).
- Split only among them.

Effect:
- Strong predictors in D are often absent in bootstrapped dataset
- Resulting trees often look very different
- Reduces correlation between trees
- Strong variance reduction + typically higher accuracy

Typical m:
- Classification → sqrt(d)
- Regression → d/3

Additional benefit:
Out-of-Bag (OOB) Error
- Use samples not in bootstrap for validation.
- No separate validation set needed.

Pros:
- High accuracy (fairly close to state of the art)
- Parallelizable (sampling and training independent across bootstrapped dataset)
- Robust (Not much tuning required)

Cons:
- Less interpretable.
- Larger memory footprint.
- Slower training and prediction.

PART VII — BOOSTING

Key idea:
Sequentially improve the model by correcting mistakes.

Contrast with Bagging:
- Bagging → variance reduction.
- Boosting → bias + variance reduction.
- Bagging trains trees independently, while Boosting trains trees in sequence
- All trees have the same amount of say in Bagging, whereas in Boosting, trees have different amount of says

Bagging: All models are strong learners (the goal is to perform as best as possible on a given classification or regression task)

Weak Learners
- Goal: to perform slightly better than guessing
- Very common weak learner: Decision stump (decision tree of height 1, only 1 split)
- Very simple model -> very fast training

Boosting: Combine many weak learners into a single strong learner
- Basic idea: subsequent models try to improve the errors of previous models

PART VIII — ADABOOST

- Applicable to many classification/regression algorithms to improve performance,  typically classification problem
- Very commonly combined with Decision Trees

Basic Training Algorithm:
- Train a weak learner (decision stump)
- Identify all misclassified samples
- Calculate error rate of learner to quantify its amount to say
- Sample data such that misclassified samples are more likely to be picked than correctly classified samples
- Repeat

1. Initialization

Assign equal weight:
wi = 1/N

2. For m = 1…M:

Train weak learner hm.

Weighted error:
εm = Σ wi I(hm(xi) ≠ yi)

Model weight:
αm = ½ ln((1 − εm)/εm)

Update weights:
Correct → decrease weight (w = w × e^(-αm))
Incorrect → increase weight (w = w × e^(αm))

Normalize weights (w = w / total weight)

Generate new dataset D based on sample weights, and with new dataset D, continue from step 1 to train a new tree

3. Final Prediction:

H(x) = sign( Σ αm hm(x) )

Interpretation:
Models with lower error get higher influence.

Sensitivity:
Sensitive to noise & outliers.

PART IX — GRADIENT BOOSTING

- Mainly applied to regression algorithms to improve performance
- Very commonly combined with Decision Trees (for regression)

Basic Training Algorithm
- Start with an initial prediction (e.g., mean over all values)
- Calculate residuals = error between true value and current prediction
- Train Decision Stump to predict residuals
- Update predictions based on predicted residuals
- Repeat

General Principle:
Fit model to negative gradient of loss function.

For regression (MSE loss):

Initialize:
f0(x) = mean(y)

For m = 1…M:

Residual:
rm = yi − fm−1(xi)

Train weak learners to predict rm.

Update:
fm(x) = fm−1(x) + η hm(x)

η = learning rate.

Small η:
- Slower learning.
- Better generalization.
- Requires more trees.

Gradient Boosting generalizes to:
- Classification
- Arbitrary differentiable loss functions.

PART X — BIAS–VARIANCE SUMMARY

KNN:
- Small k → low bias, high variance
- Large k → high bias, low variance

Decision Tree:
- Deep → low bias, high variance
- Shallow → high bias, low variance

Bagging:
- Reduces variance

Random Forest:
- Stronger variance reduction

Boosting:
- Reduces bias + variance

FINAL BIG PICTURE

Single Models:
- Interpretable
- Fast
- May overfit or underfit

Ensembles:
- Higher accuracy
- More robust
- Less interpretable
- More computationally expensive

Key Exam Themes:
- Bias–variance tradeoff
- Impurity measures
- Greedy vs global optimization
- Bootstrap sampling
- Difference between Bagging, Random Forest, and Boosting
- How residual fitting works in Gradient Boosting

- In AdaBoost, a “slightly better than random” model—like a decision stump—works because the algorithm re-weights the samples to focus on mistakes, gradually building a strong classifier.
- In Gradient Boosting, each tree fits the residuals of the previous model. So, even a small improvement (a shallow tree) helps reduce the overall error iteratively.
Additionals
1. Proxy Encoding
- Concept: Indirect representation of data using a stand-in (proxy) instead of the raw object.
- Purpose: Capture essential information while reducing complexity or size.
- Common contexts: Machine learning, data compression, representation learning.
- Examples:
  - Encoding image features (edges, histograms) instead of raw pixels
  - Latent vectors from autoencoders
- Key idea: Approximate what matters most, discard unnecessary detail.

2. Globular Cluster
- Concept: Dense, roughly spherical collection of stars bound by gravity.
- Size: Thousands to millions of stars.
- Location: Orbit in the halo of galaxies.
- Stellar properties:
  - Very old stars
  - Metal-poor composition
- Importance: Among the oldest objects in the universe; useful for studying galaxy formation and cosmic age.

3. Rand Index (RI)
- Concept: Measure of similarity between two clusterings of the same dataset.
- Interpretation: Accuracy of pairwise clustering decisions.
- Core idea: Convert clustering into a binary classification problem over pairs of data points.
- Pairwise questions:
  - Are two points in the same cluster in the ground truth?
  - Are they in the same cluster in the predicted clustering?
- Pairwise confusion matrix:
  - TP: Pair together in both clusterings
  - TN: Pair separate in both clusterings
  - FP: Together in prediction, separate in truth
  - FN: Together in truth, separate in prediction
- Formula:
  RI = (TP + TN) / (TP + FP + FN + TN)
- Range:
  - 0: No agreement
  - 1: Perfect agreement
- Key limitation:
  - TN dominates because most pairs are in different clusters
  - Random clusterings can achieve high RI

4. Adjusted Rand Index (ARI)
- Motivation: Correct Rand Index for chance agreement.
- Interpretation:
  - ARI = 1: Perfect match
  - ARI = 0: Random clustering
  - ARI < 0: Worse than random
- Benefit: More reliable clustering evaluation when class imbalance exists.

5. Pairwise Nature of Rand Index
- All unordered pairs of points are evaluated.
- Number of pairs for n points:
  - n(n − 1) / 2
- Example:
  - 5 points → 10 pairs
- Each pair contributes exactly one count to TP, FP, FN, or TN.
- Rand Index equals standard classification accuracy, but over all point pairs instead of individual samples.

6. BIC (Bayesian Information Criterion)
- Purpose: Model selection balancing fit and complexity.
- Formula:
  BIC = −2 log(L) + k log(n)
- Variables:
  - L: Likelihood of the model
  - k: Number of parameters
  - n: Number of data points
- Characteristics:
  - Strong penalty for model complexity
  - Tends to favor simpler models
  - Bayesian interpretation
- Rule: Lower BIC is better.

7. AIC (Akaike Information Criterion)
- Purpose: Model selection focused on predictive performance.
- Formula:
  AIC = −2 log(L) + 2k
- Characteristics:
  - Weaker penalty for complexity than BIC
  - More tolerant of complex models
  - Aims to minimize information loss
- Rule: Lower AIC is better.

8. Minimum Description Length (MDL)
- Principle: The best model is the one that compresses the data the most.
- Total description length:
  - Length of the model description
  - Plus length of data encoded using the model
- Key idea:
  - Learning equals compression
  - Overfitting corresponds to overly complex model descriptions
- Relationship:
  - Rooted in information theory
  - AIC and BIC can be viewed as special cases or approximations of MDL.

9. Comparison of AIC, BIC, and MDL
- AIC:
  - Light complexity penalty
  - Emphasizes predictive accuracy
- BIC:
  - Strong complexity penalty
  - Emphasizes true model identification
- MDL:
  - Adaptive penalty
  - Emphasizes optimal compression

Dirty data refers to data that is incorrect, inconsistent, incomplete, or not usable in its raw form. Almost all real-world datasets contain some form of dirty data or noise, which can negatively affect data analysis and modeling results.

Common types of dirty data:
- Data format mismatches, such as incorrect data types or inconsistent representations
- Data out of specification, where values do not follow predefined rules or acceptable bounds
  - Example: month values that should appear as three-letter abbreviations but do not
  - Before starting data cleaning, it is important to know the acceptable bounds and formats for each column
- Missing or null values
- Duplicated values
- Impossible or invalid values (e.g., negative ages, impossible dates)

Noise in data:
- Noise refers to random errors or meaningless data that obscure underlying patterns
- Almost all real-world datasets contain some level of noise
- One of the easiest ways to identify noise is to check whether the data conforms to its description or schema
- Comparing the dataset against its documented description helps identify dirty or noisy records

Identifying dirty data:
- Inspect the raw data file manually
- Use tools such as Pandas to check data types, ranges, missing values, and inconsistencies
- Records that do not match the expected format are considered dirty records
- Dirty records can negatively affect any subsequent analysis or model performance

Data cleaning:
- Data cleaning involves correcting, removing, or handling dirty and noisy data
- It often requires making decisions, and different people may choose different cleaning strategies
- Data cleaning improves data quality, preprocessing effectiveness, and the validity of algorithm results

Exploratory Data Analysis (EDA):
- EDA is often performed before or alongside data cleaning
- Helps gain an overall understanding of the dataset
- Common goals of EDA include:
  - Understanding data distributions
  - Detecting anomalies and outliers
  - Identifying missing values
  - Spotting potential data quality issues
- EDA provides important insights and helps guide future analysis or modeling decisions

K-means clustering and centroids:
- In K-means, centroids are typically initialized by choosing data points (e.g., using K-means++)
- During iterative updates, centroids are recalculated as the mean of all points in a cluster
- Updated centroids are not necessarily actual data points
- An algorithm that always chooses actual data points as cluster centers is called K-medoids

Rand Index:
- The Rand Index is an external clustering evaluation metric
- It measures the accuracy of clustering by considering all pairs of points
- It evaluates how many point pairs are correctly grouped together or correctly separated
- Based on counts of true positives, true negatives, false positives, and false negatives

Cluster purity:
- Cluster purity is not a single metric but a family of external clustering evaluation measures
- Used when ground-truth class labels are available
- Measures how well clusters align with known labels
- Higher purity indicates that clusters contain mostly points from a single class

General idea of cluster purity:
- Each cluster is evaluated based on how homogeneous it is with respect to ground-truth classes
- Higher purity means most points in a cluster come from the same class
- Most purity-based measures range from 0 to 1
- Many methods address weaknesses of basic purity, especially its bias toward many small clusters

Basic Purity (Cluster Purity score):
- Most common and simplest purity metric
- For each cluster, find the most frequent ground-truth class
- Sum the counts of the dominant class in each cluster and divide by total number of points
- Formula:
  Purity = (1 / N) * Σ_k max_j |C_k ∩ L_j|
  where:
  - C_k is cluster k
  - L_j is ground-truth class j
  - N is total number of samples
- Properties:
  - Range: 0 to 1
  - Higher is better
  - Strong bias toward over-segmentation (many small or singleton clusters achieve high purity)
- Typically used as a quick, intuitive sanity check

Inverse Purity (Class Purity):
- Same concept as purity, but roles of clusters and classes are swapped
- For each ground-truth class, find the cluster where it is most concentrated
- Measures how well each class is captured by a single cluster
- Penalizes fragmentation of a class across many clusters
- Suffers from similar limitations as basic purity

F-measure (Purity–Inverse Purity trade-off):
- Combines purity and inverse purity into a single score
- Treats purity as precision and inverse purity as recall
- Formula:
  F = (2 * Purity * Inverse Purity) / (Purity + Inverse Purity)
- Provides a better balance between clean clusters and class completeness
- Still not corrected for chance

Conditional Entropy (Cluster Entropy):
- Measures how mixed the class labels are within each cluster
- Computes entropy of class labels conditioned on clusters
- Formula:
  H(L | C) = Σ_k (|C_k| / N) * H(L | C_k)
- Lower values indicate purer clusters
- Often normalized or converted into information gain
- Penalizes over-clustering more effectively than raw purity

Mutual Information (MI):
- Measures the amount of shared information between cluster assignments and ground-truth labels
- Higher values indicate stronger agreement
- Sensitive to the number of clusters

Normalized Mutual Information (NMI):
- Normalizes MI to account for cluster and class entropies
- Formula:
  NMI = MI(C, L) / sqrt(H(C) * H(L))
- Range: 0 to 1
- Corrects some bias of MI
- Widely used in research and practice

Adjusted Mutual Information (AMI):
- Chance-corrected version of mutual information
- Penalizes agreement that could occur randomly
- More robust to different numbers of clusters
- Often preferred for rigorous evaluation

V-measure:
- Entropy-based metric combining homogeneity and completeness
- Homogeneity corresponds to purity
- Completeness corresponds to inverse purity
- Formula:
  V = 2 * (homogeneity * completeness) / (homogeneity + completeness)
- Provides a balanced evaluation of clustering quality
- Not corrected for chance

Summary of strengths and weaknesses:
- Basic purity is simple but misleading when used alone
- Inverse purity addresses class fragmentation
- F-measure and V-measure balance purity and completeness
- Entropy-based measures penalize mixed clusters
- NMI and AMI are considered best practices for external clustering evaluation
- AMI is the most robust due to chance correction

—

Association Rule Mining

Lift, Confidence, Conviction
- Support(X): fraction of transactions containing itemset X.
  Support(X) = count(X) / N
- Confidence(X → Y): conditional probability that Y appears given X appears.
  Confidence(X → Y) = Support(X ∪ Y) / Support(X)
- Lift(X → Y): measures how much more often X and Y occur together than expected if independent.
  Lift(X → Y) = Confidence(X → Y) / Support(Y)
  Lift > 1: positive association
  Lift = 1: independent
  Lift < 1: negative association
- Conviction(X → Y): measures implication strength, considering direction and rule failure.
  Conviction(X → Y) = (1 − Support(Y)) / (1 − Confidence(X → Y))
  Higher conviction means stronger implication; infinite when confidence = 1.

Support and confidence dependence
- High or low support/confidence is always relative to user-defined minimum thresholds.
- A rule can have high confidence but low support (rare but reliable).
- A rule can have high support but low confidence (frequent but weak implication).
- We only generate rules from frequent itemsets (Apriori principle).
  If an itemset is not frequent, its rules are ignored regardless of confidence.

Rule complexity
- With d distinct items, the maximum number of possible association rules is:
  3^d − 2^d + 1
- In practice, complexity is reduced by:
  - Limiting itemsets to frequent ones
  - Bounding itemsets by maximum transaction length w
  - Generating rules per transaction rather than across all distinct items
  This reduces unrealistic associations between unrelated items.

Balanced class labels

Why balanced classes do not guarantee good results
- Balance only addresses quantity, not quality or separability.
- Poor feature representation can still make classes indistinguishable.
- Overlapping class distributions reduce achievable accuracy.
- Noise and mislabeled data degrade performance.
- Model bias or underfitting can still occur.
- Evaluation metrics matter; accuracy alone may still mislead.

Outliers and visualization

Why box plots are often insufficient for detecting all outliers
- Box plots rely on IQR and assume roughly symmetric distributions.
- They are univariate and ignore multivariate outliers.
- Skewed or heavy-tailed distributions hide meaningful outliers.
- Local outliers in dense regions may not be flagged.
- High-dimensional outliers require distance- or density-based methods.

Sampling

Sampling for data reduction
- Simple random sampling reduces dataset size but may distort class distribution.
- Stratified sampling preserves original class proportions and is usually preferred.

Convenience sampling
- Sampling based on ease of access rather than randomness.
- Examples: first N records, readily available users, nearby sensors.
- Pros: fast, cheap, simple.
- Cons: highly biased, poor generalization, not statistically representative.
- Use only for exploratory analysis or when constraints dominate rigor.

Feature reduction and correlation

Correlation-based feature reduction
- Highly correlated features contain redundant information.
- Removing one of a highly correlated pair:
  - Reduces dimensionality
  - Improves generalization
  - Speeds up training
- Common methods: correlation matrix, variance inflation factor.

Multicollinearity and models

Why tree-based models are not strongly affected by multicollinearity
- Trees split on one feature at a time.
- Correlated features compete; only one is selected for a split.
- Predictions remain stable even if coefficients are not interpretable.
- Performance is usually unaffected, but feature importance may be diluted.

Dummy encoding vs one-hot encoding
- One-hot encoding creates k binary columns for k categories.
  This introduces perfect multicollinearity (dummy variable trap).
- Dummy encoding drops one reference category (k − 1 columns).
  This removes linear dependence and avoids multicollinearity in linear models.
- Tree-based models are generally unaffected by either choice.

Attribute value reduction

Aggregation and generalization
- Numerical aggregation: move up concept hierarchy (e.g., daily → monthly averages).
- Categorical generalization: replace specific categories with higher-level concepts.
- Benefits:
  - Reduces noise
  - Improves interpretability
  - Decreases model complexity

Duplicate and near-duplicate data

Handling near duplicates
- Near duplicates arise from repeated measurements or precision differences.
- A simple approach is averaging or merging similar points.
- Reduces data size and noise.
- Must ensure duplicates represent the same underlying entity.

Imbalanced datasets

Data-level approaches
- Oversampling: duplicate or synthesize minority samples.
- Undersampling: remove majority samples.
- SMOTE: generate synthetic minority samples using nearest neighbors.
- Risk: oversampling can cause overfitting; undersampling can lose information.

Algorithm-level approaches
- Use models robust to imbalance:
  - Autoencoders (anomaly-focused)
  - Self-organizing maps
- Modify objective function:
  - Class weights
  - Cost-sensitive learning
- Preferred when resampling distorts data structure.

Noise

Sources of noise
- Faulty sensors or human errors.
- Different machine precision or calibration.
- Environmental variation.
- Noise is normal and expected in real-world data.

Clustering and evaluation

Adjusted Rand Index (ARI)
- Measures similarity between clustering and ground truth.
- Adjusted for chance.
- Suitable for:
  - Noisy data
  - High-dimensional data
  - Non-integer features
  - Time series (after appropriate representation)
- Robust because it evaluates pairwise agreements, not distances.

High-dimensional visualization
- Dimensionality reduction:
  - PCA: linear, preserves variance, interpretable.
  - t-SNE: nonlinear, preserves local structure, good for visualization only.
- Feature selection:
  - Choose meaningful subsets for direct visualization.

Outliers and robustness
- Some algorithms are robust to outliers (trees, median-based methods).
- Some are sensitive (k-means, linear regression).
- Algorithm choice should consider outlier presence.

Missing values
- If dataset is very large and missing values are few (≈ ≤10%), removal may be acceptable.
- Otherwise, imputation is preferred to avoid bias and information loss.

Clustering behavior

Clustering always produces output
- Clustering algorithms will always assign points to clusters.
- This does not imply meaningful or real structure exists.
- Validation is essential.

Sum of Squared Errors (SSE)
- SSE = sum of squared distances from points to cluster centroids.
- Does not penalize large clusters explicitly.
- Always decreases as number of clusters k increases.
- SSE can be zero if:
  - All points in each cluster are identical
  - Even when k << N, duplicates can produce SSE = 0

SSE beyond k-means
- SSE-like objectives exist for other methods.
- Interpretation is less intuitive for non-globular or density-based clusters.

Silhouette Coefficient (SC)
- Measures cluster separation and cohesion.
- Range: −1 to 1
- Higher is better.

SC vs number of clusters
- Typically concave or plateau-shaped.
- Peaks near optimal k.
- Flattens or slowly decreases when k is too large.

Noisy SC curves indicate
- Small datasets
- Irregular or overlapping clusters
- High dimensionality (distance concentration)
- Random initialization effects

Takeaway
- Smooth SC curve suggests stable structure.
- Highly noisy curve suggests unclear or unstable clustering.

Class labels vs clustering
- Even with two target classes, feature space may form more than two clusters.
- Clustering is unsupervised and reflects feature structure, not labels.

Hierarchical clustering linkage methods

Single linkage
- Distance: minimum inter-cluster distance.
- Produces arbitrary, chain-like clusters.
- Very sensitive to noise and outliers.
- Fast and scalable.
- Best when connectivity matters.

Complete linkage
- Distance: maximum inter-cluster distance.
- Produces compact clusters.
- Less chaining than single linkage.
- Can split large clusters.
- Moderate noise sensitivity.

Average linkage
- Distance: average pairwise distance.
- Balanced behavior between single and complete.
- Moderate noise sensitivity.
- Good general-purpose choice.

Ward linkage
- Minimizes increase in within-cluster variance.
- Produces spherical, homogeneous clusters.
- Sensitive to unequal cluster sizes.
- Computationally expensive.
- Best for small to medium datasets where quality matters.

Linkage summary table

Linkage | Shape | Noise Sensitivity | Dataset Size | Typical Use
Single | Arbitrary | High | Large | Connectivity
Complete | Compact | Medium | Medium | Well-separated clusters
Average | Balanced | Medium | Medium | General-purpose
Ward | Spherical | Low | Small/Medium | High-quality clustering

## Week 7

<draft>
- 1. Decision Trees Architecture
    - Structural Mechanics: Recursive binary and multi-way partitioning, internal test nodes, and leaf label assignments.
    - Split Quality Measures: Information Gain (Entropy), Gini Impurity, and Gain Ratio.
    - Tree Pruning: Pre-pruning constraints (max depth, min split) vs. post-pruning simplification.
- 2. Ensemble Methods & Tree Ensembles
    - Bagging: Bootstrap aggregating, variance reduction, and Random Forest randomized feature subspace selection.
    - Boosting: Sequential error-focused reweighting, AdaBoost mechanics, and Gradient Boosted Decision Trees (GBDT).
</draft>

# Decision Trees

## Overview
- Flowchart-like structure mapping input features to output labels/values
- Applicable to classification and regression
- Supports categorical & numerical features
- Typically interpretable

## Building Decision Trees
- Greedy algorithm iteratively selects the best splits
- Best split minimizes impurity

## Challenges
- Sensitive to small changes → high variance
- Overfitting in full trees → pruning recommended
- In practice, not state-of-the-art → ensemble methods improve accuracy

## Tree Ensembles
- Construct many decision trees and combine predictions
- Pros: higher accuracy, lower variance
- Cons: lower interpretability, longer training

### Independent Models
- Bagging: Trees on bootstrap samples
- Random Forests: Bagging + feature sampling
- Prediction via majority vote

### Dependent Models (Boosting)
- Sequential tree training: each tree improves errors of previous
- Trees weighted differently in prediction
- AdaBoost: favors previously misclassified samples
- Gradient Boosted Trees: iteratively corrects errors of previous trees

# Linear Models

## Basic Setup
- Dataset of n samples, d features
- Assumes linear relationship between x_i and dependent variable y_i: y_i ≈ θ · x_i
- The number of parameters used will be 1 + the number of features due to the introducing of constant feature x_i0 for intercept
- Vector representation simplifies computations

# Linear Regression

## Problem Formulation
- Predict continuous real-valued output
- Identity function: f(x) = x

## Loss Function
- Quantify how good or bad a given set of values for θ is
- Measure the difference between predictions and true values
- Loss function for Linear Regression: Mean Squared Error (MSE)
  L(θ) = (1/n) Σ_i (y_i - θ · x_i)^2

## Finding θ
### Method 1: Random Search
- Randomly sample θ, compute loss, pick best
- Impractical for large problems

### Method 2: Analytical Minimization (Normal Equation)
- Solve ∂L/∂θ = 0
- Vectorized: θ = (X^T X)^(-1) X^T y
-  (X^T X)^(-1) X^T is pseudo-inverse of X
- Most expensive operation: calculating the inverse of (X^T X)^(-1)
- Calculation of inverse depends on number of features d, not on number of data samples n
- Complexity of calculating inverse of a dxd matrix: O(d^3)
- Conditions for invertibility: square, full rank, non-zero determinant
- The conditions required for a matrix to be invertible:
  1. The determinant is non-zero
  2. The matrix is a square matrix
  3. The matrix has full rank
Q: When will X^T X not be invertible?
A: There are more features d than data samples n

Algorithm:
1. Construct matrix X and vector y from data
2. Calculate pseudo inverse X^† = (X^T X)^(-1) X^T
3. Return θ =  X^† y

### Method 3: Gradient Descent
Core idea:
- Start with a random setting of θ
- Adjust θ iteratively to minimize L

Gradient
- Vector of partial derivatives of a multivariable function
- Partial derivative: slope w.r.t. a single variable given a current set of values for all θ_0, θ_1, … θ_d
- Points in the direction of the steepest descent

Algorithm
- Iteratively update θ: θ := θ - η ∇L(θ)
- η = learning rate (typical 0.01–0.0001)
  - scaling factor for gradient (typical range: 0.01 - 0.0001)
- In practice: stop loop when θ converges

- Variants:
  - Batch: gradient over all data → smooth, small updates
  - Stochastic (SGD): per sample → choppy, large updates
  - Mini-batch: over small batches → intermediate
    - In practice often referred to as SGD

## Normal Equation vs Gradient Descent
| Feature | Normal Equation | Gradient Descent |
|---------|----------------|----------------|
| Iterative? | No | Yes |
| Optimal θ | Exact | Approximate |
| Learning rate | Not needed | Required |
| Large d | Expensive | Works |
| Invertibility | Required | Not required |

Q: Gradient Descent is not reaching optimal solution after 10k iterations. Why?
A: The issue may be due to an inappropriate learning rate. If the learning rate is too small, the model may not reach the optimal solution within 10,000 iterations. Conversely, if the learning rate is too high, the model may oscillate and fail to converge due to overshooting the minimum. Additionally, the problem may arise because the underlying relationship is non-linear, meaning that linear regression is not suitable for modeling it and therefore cannot achieve an optimal solution.

# Polynomial Linear Regression

Linear Regression -> line / plane / hyperplane

## Concept
- Extend linear regression with polynomial features
- Still linear in θ
- Polynomial terms treated as additional features

## Example
- 1 input feature, 3 samples:  
  - p=1 → underfitting  
  - p=2 → good fit  
  - p=3 → potential overfitting

## Overfitting & Regularization
- Higher polynomial degree p →
  - More capacity to capture nonlinear relationships
  - Much higher sensitive to noise and outliers
- Regularization penalizes large θ (exclude θ_0)
  - Extend loss function to “punish” large values of θ

## Multiple Features
- Interaction/cross terms included
- Number of terms grows rapidly with degree p and features d
- Practical:
  - Limited to small number of features d, and small polynomial degree p
  - In principle, some terms can be dropped (all interaction terms) to reduce overfitting
- Risk: overfitting + lower interpretability (justification typically not obvious)

## Finding θ
- Normal Equation or Gradient Descent (same as standard linear regression)

## Interpretation of Coefficients
- θ_i = change in output per unit change in feature i, holding others constant
- Normalization:
  - Not required for basic linear regression
    - It does not affect model’s performance (assuming basic Linear Regression without regularization)
    - Recommended when using polynomial linear regression or regularization
    - Better for comparing θ within a model

Q: How to deal with data that is a non-linear function?
A: Radial basis regression

It is possible to overfit the Linear Regression given a dataset with only 1 feature
Scaling the data will change the Linear Regression coefficients
Gradient Descent doesn’t get stuck in the local minimum when using Linear Regression

# Logistic Regression

## Concept
- Predict binary outcome y ∈ {0,1}
- Real-valued prediction interpreted as probability: σ(z) = 1 / (1 + e^(-z))
- P(y=1|x) = σ(θ · x)
- y hat is interpreted as a probability, and is the estimated probability that y is 1 given x and θ
- Given only discrete 2 outcomes: The probability of each outcome sum up to 1

## Loss Function
- Goal: Maximize probability of true y label given training sample x
- Cross-Entropy Loss:  
  L(θ) = - Σ_i [y_i log(σ(θ · x_i)) + (1 - y_i) log(1 - σ(θ · x_i))]  
- No closed-form solution → Gradient Descent

## Gradient Descent
- Iteratively update θ
- Learning rate critical
- Cross-Entropy loss of Logistic Regression is convex → global minimum guaranteed
- Near-plateau → very slow convergence

## Polynomial Logistic Regression
- Analogous to Polynomial Linear Regression
- Add polynomial features to capture nonlinear boundaries
- Same considerations: small d, low p, optional regularization
- Solve via Gradient Descent

## Practical Implementation
- `sklearn.linear_model.LogisticRegression`  
- Solvers: L-BFGS-B (default), SAG
- Techniques to boost performance:
  - Smart initialization of θ
  - Adaptive learning rates
  - Regularization
  - Extensions to Gradient Descent

# Key Takeaways
- Linear Models assume linear relationship between inputs and output
- Polynomial features allow modeling nonlinearities
- Linear & Logistic Regression are fundamental and interpretable
- Gradient Descent applies to both; Normal Equation applies only to Linear Regression
- Data normalization affects interpretability and regularization behavior
- Logistic Regression can be extended to multi-class problems
## Week 8

<draft>
- 1. Linear Regression & Optimization
    - Model Formulation: Linear feature combinations, residual errors, and Ordinary Least Squares (OLS).
    - Loss Surface & Optimization: Gradient descent convergence and analytical normal equation solution.
- 2. Logistic Regression & Classification
    - Probabilistic Mapping: Sigmoid / logistic activation, log-odds transformation, and maximum likelihood estimation.
    - Decision Boundary: Linear hyperplanes and polynomial basis expansion for nonlinear separations.
- 3. Recommender Systems Introduction
    - Problem Setup: Information overload, utility matrix formulation, and recommendation paradigms.
</draft>

# Linear Models

## Basic Assumption
- Assume linear relationship between input features x_i and dependent variable y_i
- Predicted value: ŷ_i ≈ y_i
- Input: features x_1, x_2, …, x_d
- Parameters to learn: θ_0, θ_1, …, θ_d

## Linear Regression
- Goal: Find θ that minimizes Mean Squared Error (MSE)
  L(θ) = (1/n) Σ_i (y_i - θ · x_i)^2
- Solution methods:
  - Normal Equation: θ = (X^T X)^(-1) X^T y
  - Gradient Descent: iterate θ := θ - η ∇L(θ) until convergence

## Logistic Regression
- Used for classification; output interpreted as probability P(y=1|x)
- Sigmoid function: σ(z) = 1 / (1 + e^(-z))
- Loss: Cross-Entropy Loss  
  L(θ) = - Σ_i [y_i log(σ(θ · x_i)) + (1 - y_i) log(1 - σ(θ · x_i))]
- Solution: Gradient Descent

## Polynomial Linear/Logistic Regression
- Add polynomial terms of features to model nonlinear relationships
- Algorithms unchanged (Normal Equation or Gradient Descent)
- Regularization to prevent overfitting:
  - Penalize large θ in loss function
  - Minor adjustments needed in θ updates

# Recommender Systems

## Motivation
- Users: face information overload (movies, products, articles), more choices require better filters (recommendation system)
  - Goal: find relevant items efficiently, minimize effort, maximize satisfaction, optimizing spending of money and attention
- Providers: maximizes sales/transactions, engagement, competitive advantage

## Recommendation Approaches

### Editorial Recommendations
- Expert-written (critics, journalists, person with expertise about item(s))
- More deductive
- Pros: objective, elaborate, trustworthy, credible
- Cons: paid, not scalable, not personalized

### Peer Recommendations
- User-generated (reviews, ratings)
- Online word-of-mouth recommendations
- Common feature on shopping/booking sites
- More inductive
- Pros: many opinions → averages reliable  
- Cons: subjective, biased, short, possible information overload  
- Having many user reviews for an item allows the system to compute a reliable average opinion, but presenting all those reviews to users may again cause information to overload
- Fraud: 60% of reviews may be fake (study-dependent)

### Manual Recommendations
- Pros: semantically rich, explainability, interpretability
- Cons: manual effort, lack of personalization

### Simple Aggregations
- Rank items by aggregated (average or weighted) scores
- Pros: relatively easy to compute, safe for new users  
- Cons: high risk of popularity bias, low diversity, low personalization, needs sufficient ratings

# Personalized Recommendations

- User have different preference that define the relevance of items
- Preferences = interests, likings, needs, etc.
- Relevant items = items that match users’ preferences best
- Core tasks:
1. Collect ratings
2. Infer missing values
- In practice, mainly interested in high values
- Algorithmic component of recommendation system
- Wide range of existing approaches
3. Evaluation: How good are the recommendations?
- Compare rating predicted with the true rating from test set

## Core Setup
- Users U = {u1, …, un}  
- Items V = {v1, …, vm}  
- Rating matrix R (|U| × |V|): R_uv = rating of item v by user u  
- We use 0 to indicate the item is not rated by user
 - Therefore, it is better we use algorithm that works on rating 1~5 to prevent interruption of 0
- Goal: predict missing R_uv, focus on high predicted ratings

## Collecting Ratings
- Explicit: ask or pay users to rate items  
- Implicit: infer from behavior (purchases, clicks, views)  
- Challenge: Rating matrix R is usually very sparse

## Evaluation Metrics
- Split R into training set and testing set
- RMSE for numerical ratings  
- Precision, Recall, F1 for binary ratings  
- Precision@k, Recall@k for top-k recommendations  
- Consider ranking order of predicted ratings

# Recommendation Methods

## Association Rules
- Identify items frequently consumed together: {a, b} → {x, y}  
- Pros: simple, interpretable  
- Cons: ignores rating magnitude, popularity bias (user with very unique tastes likely to get subpar recommendations)

## Clustering
- Cluster items by features (genre, director, length)  
- Recommend items from clusters containing user’s highly-rated items  
- Limitation: meaningful feature selection is nontrivial, unsystematic (no well-defined process to pick recommendations)

## Regression/Classification
- Predict user ratings from item features  
- Build model (linear regression) per user  
- Limitations: needs good item features, cold-start problem

# Content-Based Recommendation Systems

## Intuition
- Recommend items similar to those user rated highly  
- Item profiles: feature vectors (genre, director, brand, tf-idf words, etc.)

## Pairwise Item Similarity
- Compute similarity between items (e.g., cosine similarity)  
- Limitation: needs reference items rated by user

## User-Item Similarity
- User profile = feature vector for each user
- Requirement: same shape as item profiles to calculate similarities
- Approach: user profile = some aggregation of item profiles rated by the user
- Utility types:
  - Binary: R_uv ∈ {0,1} (watched/bought)
  - Real-valued: R_uv ∈ {1.0, 1.5, …, 5.0} (star rating)  
    - Important: semantic representation - ratings expresses both likes and dislikes (despite all ratings positive)
    - Use rating as weights for features for a weighted aggregation
- Normalize ratings to account for user generosity/grumpiness
- Calculate weighted features for user profile
  - The weights are the normalized weights
- Recommend items with max similarity to user profile
- What should we ensure to get good profiles:
  - A user has rated enough movies of the same genre

## Practical Considerations
- Top k most similar items always the same -> add some randomization for diversity
- Top k most similar items might include items the user has already rated -> remove those items
- More sophisticated way to aggregate item profiles to user profiles conceivable

## Pros and Cons
- Pros: independent of other users, can recommend new/unpopular items, interpretable  
- Cons: cold-start problem, good feature selection difficult, overspecialization

# Collaborative Filtering (CF)

## Intuition
- Leverage opinions of other users to predict unknown ratings
- Does not require item or user-specific features
- Two perspectives:
  - user-based: Two users are similar if they rated the same item similarly
  - item-based: Two items are similar if they are equally rated by users

### User-Based CF
- Represent all users by their rating vectors
  - Missing values are considered as negative
  - All ratings are positive values
  - No explicit notion of dissimilarity
- Users are similar if their rating vectors are similar  
- Normalize rating vectors by subtracting user mean (mean-centering)
- Missing values now represent the average rating
- Similarity metric: cosine similarity or Pearson correlation  
- Predict R_uv as weighted average of k most similar users’ ratings

### Item-Based CF
- Items are similar if rated similarly by users  
- Predict R_uv as weighted average of k most similar items already rated by the user  
- Item-based usually outperforms user-based

In practice: item-based typically outperforms user-based
- Items are simpler than users
- Items can be more easily described
- Users can have varied tastes
- Item-item similarity typically more meaningful

### Model-Based CF
- Latent factor models: represent users/items as k-dimensional vectors  
- Learn latent representation from the data
- Matrix factorization: learn W (users) and H (items) such that R ≈ W * H  
- Hyperparameter k: size of latent representations
- Minimize regularized loss using Gradient Descent  
- Regularization λ controls smoothness vs. fit
  - Increase λ: worse fit of known ratings, "smoother" values for all ratings
  - Decrease λ: better fit of known ratings, more "extreme" values of unknown ratings

## Pros and Cons
- Pros: no explicit features required, intuitive  
- Cons: needs sufficient ratings, cold-start problem, popularity bias, high computational cost for naive implementation

Q: What does not affect the recommendations made by Collaborative Filtering?
A: A movie's details get updated
Q: What does generally affect the recommendations made by Collaborative Filtering the least?
A: A new user has rated a new movie

# User-Item Similarity Example
- Normalize ratings to capture likes/dislikes  
- User profile = weighted aggregation of normalized ratings  
- Recommend items with max similarity to profile  
- Add randomization for diversity, exclude already rated items

# Risks of Over-Personalization
- Filter bubbles: users only see content similar to previous interactions  
- Echo chambers: reinforcement of existing preferences  
- Providers have little incentive for diversity  
- Users unaware of recommendation mechanisms

# Summary
- Hybrid approaches often most effective  
- User: find relevant items + providers: present relevant items
- Content-based: relies on item features  
- Collaborative filtering: relies on rating patterns  
- Memory-based: user/item similarity  
- Model-based: latent factor models, matrix factorization  
- Evaluation: RMSE, Precision/Recall, top-k rankings
## Week 9

<draft>
- 1. Recommender Systems Paradigms
    - Problem Formulation: Sparse user-item rating matrix, cold-start challenges, and evaluation metrics (RMSE, NDCG).
- 2. Content-Based Filtering
    - Item Representation: Feature profile extraction, TF-IDF representations, and user profile matching via cosine similarity.
- 3. Collaborative Filtering (CF)
    - Memory-Based: User-based vs. item-based collaborative filtering and similarity measures (Pearson correlation, cosine).
    - Model-Based: Matrix factorization, Latent Factor Models, and Singular Value Decomposition (SVD) approximations.
</draft>

Recommender Systems

Problem
- Information overload due to a large number of items (products, movies, songs, news, etc.)
- Users cannot manually explore all options

Goal
- Identify items that match a user’s preferences

Basic Setup
- U: set of users
- V: set of items
- R: rating matrix of size |U| × |V|
- R_uv: rating given by user u to item v
  - Can be explicit (e.g., 1–5 stars)
  - Can be implicit (e.g., clicks, purchases, binary 0/1)
- Optional: item features (metadata such as genre, category, price)

Approaches

Content-Based Filtering
- Uses item features
- Computes similarity between items
- Recommends items similar to those a user liked
- Requirement: meaningful attributes/features for items
- Pairwise item similarity
- User-item similarity
- (+ model-based using content)

Collaborative Filtering (CF)
- Uses only rating matrix R
- Memory-based:
  - User-based CF: find similar users, recommend what they liked
  - Item-based CF: find similar items
- Model-based:
  - Learn predictive model from data
  - Examples: matrix factorization, clustering, neural networks

Hybrid Methods
- Combine content-based and collaborative approaches

Prediction Process
1. Train model using known ratings
2. Predict missing ratings
3. Recommend top-ranked items

Key Requirement
- Meaningful features (for content-based)
- Sufficient rating data (for collaborative filtering)

Graph Mining

Graph Definition
Graph: Formalism for representing relationships between items
- Graph G = (V, E)
  - V: set of vertices (nodes)
  - E: set of edges (connections between nodes)

Applications of Graphs
- Transportation networks
  - Nodes: stations
  - Edges: connections
- Protein interaction networks
  - Nodes: proteins
  - Edges: interactions
- Web graph
  - Nodes: web pages
  - Edges: hyperlinks
- Social networks
  - Nodes: users
  - Edges: relationships

Graph Types
- Directed vs undirected
- Weighted vs unweighted
- Cyclic vs acyclic
- Simple graph vs multigraph
- Sparse vs dense
  - Sparse: typically number of edges is close to linear in vertices
  - Dense: typically number of edges is close to quadratic in vertices
- Connected vs disconnected
  - Strongly connected: There exists a path from each node to every other node
  - Weakly connected: A directed graph where the underlying undirected graph is (strongly) connected

Graph Representation
- Adjacency matrix A
  - A[i,j] = weight of edge from i to j
  - For unweighted graphs: A[i,j] = 1 if edge exists

Community Detection

Definition
- Identify groups of nodes with:
  - Many edges within groups
  - Few edges between groups
- Similar to clustering but on graph structure

Applications
- Social communities
- Market segmentation
- Recommendation systems
- Anomaly detection

Modularity
- Measures quality of a partition
- Range: [-1/2, 1]
- High modularity means strong community structure
- Measures the relative density of edges inside communities with respect to edges outside communities

Formula:
Q = (1 / 2m) ∑_​(i,j)​(A_ij ​− (k_i​ k_j) / 2m​​) δ(c_i​, c_j​)

Key components
- A[v,w]: edge weight
- k_i: sum of the weights of edges attached to node i
- c_i: community of node i
- m: sum of weights of all edges

Optimization
- Finding optimal modularity is NP-hard
- Use heuristic algorithms

Louvain Algorithm

Goal
- Maximize modularity

Steps

Phase 1: Modularity Optimization
- Initialize each node as its own community
- For each node:
  - Try moving it to neighboring communities
  - Choose move that increases modularity the most
- Repeat until no improvement
- Note: Moving a node may not be permanent but can change again in later iteration before convergence

Phase 2: Graph Aggregation
- Merge nodes in same community into a new node
- Recompute edge weights between communities

Repeat both phases until convergence

Properties
- Heuristic (no global optimum guarantee)
- Efficient for large graphs
- Uses local modularity changes (ΔQ)
- Calculating ΔQ can be done based on local changes in community assignments

Girvan-Newman Algorithm

Approach
- Divisive (top-down)
- Removes edges to split communities

Key Idea
- Remove edges with highest edge betweenness centrality

Edge Betweenness Centrality
- Measures how many shortest paths pass through an edge

Algorithm
1. Compute edge betweenness for all edges
2. Remove edge with highest value
3. Repeat until graph splits into 2 disconnected components
4. Apply recursively on subgraphs

Recursive step
- Apply algorithm to each new component
- Stops if a component contains only single node (or early stop based on user specifications)

Complexity
- Core concept of algorithm: Edge Betweenness Centrality
- Requires to solve the All-Pairs Shortest Path (APSP) problem
- Expensive due to all-pairs shortest paths computation

Karger’s Algorithm (Min-Cut)

Goal
- Partition graph into 2 sets with minimum number of crossing edges

Algorithm
- While number of nodes > 2:
  - Randomly pick an edge (Edges that are in the Min-Cut have a lower probability to get picked!)
  - Contract (merge) its endpoints
  - Remove self-loops
- Remaining edges between two nodes form the cut

Properties
- Randomized algorithm
- May not always find optimal solution
- Repeat multiple times to increase success probability
- For an undirected graph G = (V, E), with n = |V| and m = |E|, the average degree of a node is 2m/n, the size of the Min-Cut is limited to |Min-Cut| <= 2m/n, the probability that the algorithm finds the "correct" edge that is in Min-Cut is less than 2/n
- In general, a graph has multiple possible Min-Cuts
- Choice of Min-Cut often application-specific
  - Favor Min-Cuts where the 2 components are of similar size (e.g., similar number of nodes)
  - Ignore Min-Cuts where the size of a component is below a threshold

Runtime
- Basic: O(n^2)
- With repetitions: O(n^4 log n)

Insights
- Edges in min-cut have lower probability of being chosen early

Centrality Measures

Purpose
- Quantify the importance of a node given its topological position in a graph (centrality is commonly assigned to nodes but can be extended to edges, cf. Edge Betweenness Centrality)
- Different measures favor different "flavours" of importance

Applications
- Identify influencers in social networks
- Find key infrastructure nodes
- Detect important web pages

Different measures capture different notions of importance

Degree Centrality

Definition
- Centrality of a node only depends on direct neighborhood edges

Directed graphs
- In-degree: incoming edges
- Out-degree: outgoing edges

Weighted graphs
- Sum of edge weights

Pros
- Simple and fast
- For many applications "good enough"

Cons
- Only local information, does not take any extended topological information of a node into account
- Treats all connected edges of a node equally
- Easy to manipulate (fake links, followers)

Eigenvector Centrality

Idea
- Centrality of a node depends on the centrality of its neighbors
- A node is important if it is connected to important nodes

Mathematical Form
- c = λ⁻¹ A c
- c: centrality vector
- A: adjacency matrix
- λ: largest eigenvalue

Solution
- Compute principal eigenvector of A

Power Iteration Method: numerical method to find largest eigenvector of a matrix
Solving eigenvector equation analytically not tractable for large matrices

- Initialize vector
- Iteratively multiply by A
- Calculate difference
- Normalize until convergence

Properties
- Captures global structure
- More meaningful than degree in many cases
- Size of nodes reflect centrality scores
- Low-degree nodes benefit from connections to high-degree nodes

PageRank: Measuring the centrality of web pages

Variant of eigenvector centrality for directed graphs

Random Surfer Model
- With probability α: follow a link
- With probability (1−α): jump randomly

Transition Matrix M
- Transition matrix with probabilities of which link on a page to follow next
- Normalize adjacency matrix columns
- Column-stochastic matrix
- Due to this format, the largest eigenvalue λ = 1.

Equation
- c = α M c + ((1−α) / N) e

Properties
- Handles nodes with no incoming edges
- Produces non-zero scores for all nodes

Minimum PageRank
- (1−α)/N
- Example: N=10, α=0.85 → 0.015

Eigenvector-Based Measures — Remarks
- Measuring centrality by solving an Eigenvector problem
  - Recursive definition of centrality very intuitive
  - Many other similar measures (e.g., HITS, SALSA, Katz)
  - Many application-specific extensions to basic measures (e.g., personalization of PageRank where random jumps are no longer uniform)
  - More complex calculation than for local measures but calculation of largest Eigenvectors very scalable through parallelization

Closeness Centrality

Idea
- A node t is central if the distance to all other nodes is small
  - Small distance from node t to all other nodes (out-closeness) or Small distance to node t from all other nodes (in-closeness)
  - For directed paths, the closeness of node t can differ greatly when considering incoming or outcoming edges for calculating distances
  - Basic definition applicable to unweighted graph
- For directed graphs, this definition calculates closeness using the nodes' incoming edges — more common case. To consider outgoing edges, d(v,w) becomes d(w,v), and N becomes the number of nodes from which v can be reached.

Definition
- Inverse of sum of shortest path distances

Formula
- C(v) = N / Σ d(v,w)
- N: number of nodes reachable from v
- d(v,w): length of shortest path from v to w

Properties
- Captures how fast information spreads from a node
- Depends on shortest paths

Betweenness Centrality

Idea
- A node t is central if many shortest paths between all other nodes pass through node t
- Removing such nodes would cause the most "disruption" in a graph
- Directly applicable to directed/undirected and weighted/unweighted graphs (since the the notion of shortest path is well-defined for all graph types)

Definition
- Sum over all node pairs:
  - fraction of shortest paths passing through node

Formula
- C(v) = Σ (number of shortest paths through v / total shortest paths)

Properties
- Identifies “bridge” nodes
- Removing such nodes disrupts network most

Closeness & Betweenness — Remarks
- Distance-based measures
  - Both measures rely on the notion of shortest paths between nodes
  - Requires to solve the All-Pairs Shortest Path (APSP) problem
  - Various algorithms and complexities depending on the type of graph (directed vs. undirected, cyclic vs. acyclic, with or without negative weights, etc.)

Centrality = importance of nodes on a graph
- Important concept of graph mining with many applications
- Wide range of proposed measures that differ in their definition of a node's importance
- Not all measures are applicable (or suitable) to all types of graphs

Overview to a selected set of popular measures
- Local measures — Degree, InDegree, OutDegree
- Eigenvector-based measures — Eigenvector Centrality, PageRank
- Distance-based measures — Closeness, Betweenness

Comparison of Centrality Measures

Degree
- Local importance

Eigenvector / PageRank
- Global importance (influenced by neighbors)

Closeness
- Distance-based importance

Betweenness
- Control over information flow

Summary

Recommender Systems
- Use user-item interactions to predict preferences
- Methods: content-based, collaborative, hybrid

Graph Mining
- Models relationships between entities
- Key tasks:
  - Community detection
  - Centrality analysis
  - Graph partitioning

Community Detection
- Louvain: modularity optimization
- Girvan-Newman: edge removal

Min-Cut
- Karger’s randomized contraction algorithm

Centrality
- Degree: simple local measure
- Eigenvector/PageRank: influence-based
- Closeness: distance-based
- Betweenness: path-based

Overall Insight
- Graph structure provides powerful information beyond simple pairwise relationships
- Choice of method depends on application and interpretation of “importance” or “similarity”

Graph Mining
- Data often comes in the form of graphs — incl. very large dataset (traffic network, social networks, relationship networks, interaction networks, etc.)
- Goal: find interesting patterns based on graph structure (number of nodes, number of edges, distribution of edges/connections, substructures, etc.)
- 2 types of patterns
  - Community: subgraph with nodes more connected among each other than the rest
  - Centrality: importance of a node depending its embedding in the graph

Both allow for different definitions ➜ wide range of algorithms
## Week 10

<draft>
- 1. Curse of Dimensionality
    - Geometric Realities: Volume expansion, distance concentration, and data sparsity in high-dimensional spaces.
    - Computational & Statistical Consequences: Overfitting vulnerability and vanishing statistical significance.
- 2. Dimensionality Reduction Techniques
    - Principal Component Analysis (PCA): Covariance matrix eigendecomposition, maximum variance projection, and reconstruction error minimization.
    - Singular Value Decomposition (SVD): Matrix factorization into orthogonal singular vectors and singular values.
    - Nonlinear Embeddings: t-SNE and manifold learning intuitions for low-dimensional visualization.
</draft>

Dimensionality Reduction — Motivation
- High dimensional data → many features (large d)
- m = number of data points, V = volume of feature space
- density = m (number of data points) / V (volume of feature space)
- As dimensions increase → data becomes sparse

Effects of high dimensionality
- Higher computational cost
- Statistical methods become unreliable (hard to find significance)
- Increased risk of overfitting (noise indistinguishable from signal)
- Distances become less meaningful → similarity obscured

Curse of Dimensionality
- Data points rarely close to each other in high dimensions
- Distances between points become similar (distance concentration)

Intuition
- N points uniformly distributed in d-dimensional unit cube
- For k-NN, smallest cube length L grows with dimension
- L^d ≈ k / N => L ≈ (k/N) ^ (1/d)
- High d → L approaches 1 → neighborhood spans almost entire space

Consequences
- Nearest neighbors become less meaningful
- Local structure harder to detect

Feature Selection (Dimensionality Reduction)
- Remove irrelevant or redundant features

Common techniques
- Remove unimportant features (expert knowledge)
- Remove ethically sensitive features (e.g., ethnicity)
- Remove low-variance features
- Remove highly correlated features
- Remove low-discriminative features (e.g., via decision trees)

Pros
- Easy to implement
- Does not change features themselves => Original feature meaning preserved

Cons
- Requires domain knowledge
- Thresholds (minimum variance or correlation) are hard to define

Feature Extraction
- Create new features as form of summary from original ones
- Feature extraction algorithms utilize discriminatory power and correlations among features
- Combine information into fewer dimensions
- Goal: retain most information with fewer features

Principal Component Analysis (PCA)
- Dimensionality reduction through linear transformation
- New output features are a linear combination of original input features
- Unsupervised (no labels used)
- Transforms data into new coordinate system

Setup
- Dataset X: n samples, d features
- Find transformation matrix W (d × p), p < d
- Result: XW (n × p)

Goal
- Find directions maximizing variance

Equivalent objectives
- Maximize variance of projected data
- Minimize reconstruction error

Data normalization
- Mean-centering (important for math simplicity)
- Standardization (optional, affects results)

Covariance matrix
- Cx = X^T X (or normalized version: divided by n or n - 1)
- Cx is the covariance matrix of X
- Captures feature relationships
- Normalized or not only affects the magnitude of the eigenvalues but not the eigenvectors for W

First principal component
- Direction maximizing variance
- Found as eigenvector with largest eigenvalue of covariance matrix

Finding the k-th Principal Component
- Subtract (k-1) principal components from X
  - X_k = X - ∑Xw_s w_x^T
- k-th Principal Component of data X_k
 - Unit vector w_k that maximizes the variance of transformed data — after transforming X_k
 - w_k is the largest eigenvector of the covariance matrix C_x^k

Key result
- Principal components of X = eigenvectors of covariance matrix C_x
- Eigenvalues = amount of variance explained

Interpretation
- PC1: direction of maximum variance
- PC2: next orthogonal direction with maximum remaining variance
  - 2nd PC points into the direction of maximum variance after 1st PC removed from dataset X
- etc.

Cx is a (d×d) matrix => d eigenvectors and eigenvalues
- How to choose 1 ≤ p ≤ d to get the transformation matrix W of shape (d×p)?

Explained variance ratio
- Percentage of variance that is attributed by each principal component
- Normalized eigenvalues
- Used to select number of components p that explains a minimum amount of variance

Transformation
- Project data: X_new = XW

Pros
- Intuitive — exploit knowledge about correlated and low-variance features
- Reduces dimensionality effectively
- Removes redundancy
- Helps visualization
- Reduces overfitting

Cons
- Information loss
- Assumes linear relationships
- Ignores class labels
- Large variance ≠ always important

Limitation for classification
- PCA applied to labelled datasets for classification
- PCA maximizes global variance, not class separation
- PCA ignores any information from the class labels

Linear Discriminant Analysis (LDA)
- Similarity to PCA
  - Linear transformation technique
  - Output: Matrix W to transform dataset X into a lower-dimensional space
- Supervised dimensionality reduction
- Uses class labels
- Main difference with PCA: 2 optimization objectives
 - Minimize variance of transformed points with each class
 - Maximize separation between classes

Goals
- Maximize between-class variance
- Minimize within-class variance

Between-class scatter (SB)
- Variance of distances between class means and (overall) mean
 - Measures separation of class means

Within-class scatter (SW)
- Variance of data points of the same class
 - Measures spread within each class

Optimization objective
- Maximize ratio of between-class to within-class variance
- Optimal projection vectors = eigenvectors of largest the eigenvalues of matrix

Solution
- Generalized eigenvalue problem
- Eigenvectors of S_W^{-1} S_B

Key constraint
- Maximum number of components = C - 1 (C = number of classes)

Note on the Number of Eigenvectors
- Definition of S_B includes two constraints
 - S_B is the sum of C matrices of rank 1 or less
  - The mean 𝜇 is constraint by 𝜇 = (1 / C) ∑ 𝜇_i
- S_B has rank of (C-1) or less 
- only (C-1) eigenvectors are non-zero

Algorithm
- Compute class means and overall mean
- Compute S_W and S_B
- Calculate eigenvectors and eigenvalues of S_W S_B
- Select top p eigenvectors (p ≤ C - 1)
- Project data

Pros
- Intuitive extension to PCA yielding similar benefits
- Consideration of class labels
  - Better for classification tasks
- Uses label information
- Improves class separability

Cons
- Similar cons as PCA
  - Loss of information
  - Assumes linear correlations
- Assumes unimodal Gaussian distributions
- Assumes that means are the most discriminant features
- Limited number of components
- Sensitive to non-unimodal distributions

Problematic cases
- Classes with same mean
- Non-Gaussian distributions

t-Distributed Stochastic Neighbor Embedding (t-SNE)
- Non-linear dimensionality reduction
- Unsupervised
- Primarily used for visualization
- Iterative algorithm:
  1) Start with random lower-dimensional representation Y
  2) Change Y until a loss function converges to a minimum

Intuition behind t-SNE
- Convert Euclidean distances in X and Y to conditional probabilities
  - (e.g., if data points xi and xj are close ➜ conditional probability pi|j should be high)
- Iteratively change Y such that both probability distributions become more similar

Optimization objective: Points that are close in X are also close in Y

Key idea
- Preserve local structure (neighbor relationships)

Steps
- Convert distances into probabilities (similarities)
- High similarity → high probability
- Match probability distributions in low-dimensional space

Conditional probability
- p(j|i): probability that xi picks xj as neighbor

Joint probabilities
- P (high-dimensional)
- Q (low-dimensional)

Optimization objective
- Minimize difference between P and Q using KL divergence

Technique
- Uses Student t-distribution (heavy tails)
  - 1 degree of freedom
- Optimized via gradient descent
- Loss function: Kullback-Leibler divergence between P and Q
 - The KL divergence is a measure of how one probability distribution is different from another probability distribution

Hyperparameters
- Perplexity (controls neighborhood size)
- Learning rate
- Number of iterations
- Initialization

Properties
- Non-deterministic (different runs → different results)
  - Y_0 is randomly sampled
  - In practice, perform multiple runs to get an understanding of the data

Q: How to pick the values for σ?
A: Intuition: Set σ_i based on density around x_i
- High density ➜ smaller σ_i  /  Low density ➜ larger σ_i
- Controls how many x_j with effective p_j|i

- Calculate best based σ_i on hyperparameter perplexity
  - Larger perplexity: more neighbors have effective p_j|i
  - Common perplexity values in practice: 5..50

Pros
- Captures non-linear relationships
- Excellent for visualization

Cons
- Computationally expensive
- Sensitive to hyperparameters
- Non-deterministic behavior; might need multiple runs
- Not ideal for large datasets without preprocessing

Practical Insights
- PCA often used before t-SNE to reduce dimensions
- Combination improves speed significantly
- LDA + t-SNE limited by LDA dimensionality (≤ C-1)

Summary
- High dimensionality causes sparsity and inefficiency
  - Higher risk of overfitting
  - Higher computational costs
- Two approaches
  - Feature selection (manually remove features)
  - Feature extraction (create new features based on original features)

Main techniques
- PCA
  - Linear, unsupervised
  - Maximizes variance
- LDA
  - Linear, supervised
  - Maximizes class separation
- t-SNE
  - Non-linear, probabilistic
  - Preserves local structure

Trade-offs
- PCA: simple, fast, but ignores labels
- LDA: better for classification, but constrained
- t-SNE: powerful visualization, but expensive and unstable
## Week 11

<draft>
- 1. Graph Mining & Community Detection
    - Network Structures: Adjacency representations, degree distributions, and graph centrality measures.
    - Community Partitioning: Modularity optimization, spectral clustering, and connected component analysis.
- 2. Data Stream Mining Foundations
    - Streaming Constraints: Infinite volume, single-pass processing, bounded memory, and concept drift.
    - Approximation Algorithms: Reservoir sampling for representative sample maintenance.
    - Streaming Queries: Sliding window models, DGIM bit counting, and Count-Min sketch frequency estimation.
</draft>

CS5228 Data Stream Mining — Structured Notes

Quick Recap — Graph Mining
- Community Detection
  - Identification of "interesting" subgraphs (≈ nodes in subgraph more tightly compared to other nodes)
  - Similar to the task of clustering (clustering algorithms can be adopted to find communities)
- No single definition of "community" ➜ Many algorithms for community detection
  - Similarity between nodes (e.g., AGNES)
  - Density-based (modularity + Louvain algorithm)
  - Split-based (Edge Betweenness, Min-Cut)
  - Shared focus: connectedness
- Centrality = importance of a node
  - Based on a node's topological position in a graph
  - Different centrality measures focusing on different topological features
  - Not all measures applicable to all types of graphs
- Popular centrality measures covered
  - Local measures (Degree, InDegree, OutDegree)
  - Eigenvector-based measures (Eigenvector Centrality, PageRank)
  - Distance-based or path-based measures (Closeness, Betweenness)

1. Motivation and Setting
- Traditional data mining assumes:
  - Full dataset available at once
  - Unlimited storage and compute
  - Complex pattern discovery prioritized over runtime
- Data streams:
  - Data arrives continuously (one-by-one)
  - Entire dataset is never available
  - High arrival speed
  - Limited memory and computation (often main memory only)
  - Real-time processing required
- Implication:
  - Focus on simple but meaningful patterns
  - Trade-off: accuracy vs efficiency

2. Applications of Data Stream Mining
- Self-driving cars:
  - Massive sensor data (e.g., lidar, cameras, GPS)
- Smart cities:
  - Sensors (temperature, air quality, gas, etc.)
- Health monitoring:
  - Wearables, smartphones, fitness devices
- Social media:
  - Billions of daily interactions (likes, posts, messages)

Quick Sidenotes:
Covered techniques and algorithms not specific to streams
- Applicable to many use cases involving large volumes of data

3. Core Techniques Overview
- Sampling
- Filtering
- Counting distinct elements

4. Sampling in Data Streams
4.1 Basic Concept
- Sampling = selecting members of a population of interest for analysis
- Consideration of whole population typically impractical (e.g., too costly to survey all HDB residents)
- Population = stream of incoming data items
- Challenge: Time and/or resource constraint generally make it impossible to consider all data items
- Relevant patterns based on statistical analysis
- Goal: statistical analysis of population (e.g., average happiness, most common complaints)

Core challenge: How to get a representative sample?

4.2 Naive Sampling Approach — Setup and Goal
- Data stream consists of tuples: (user, query, time)
- Objective: estimate fraction of queries issued more than once (e.g., twice) within last 24 hours per average user
- Constraint: only 10% of all tuples can be stored

Naive Approach
- Each incoming tuple is stored independently with probability 1/10
- Sampling is done at tuple level, not at user or query level

Definitions
- s: number of queries issued exactly once
- d: number of queries issued exactly twice

Issue with Naive Sampling
- Sampling at tuple level breaks relationships between related events (same query by same user)
- For queries issued twice:
  - Probability both occurrences are sampled: (1/10)^2 = 1/100 → d/100 retained correctly
  - Probability exactly one occurrence is sampled: 2 × (1/10 × 9/10) = 18/100 → 18d/100 partially 
Fractions of queries issued twice in the sample:
(d/100) /  (d/100 + 18d/100 + s/10) = d / (10s + 19d)

observed
- Result:
  - Many duplicated queries appear as single occurrences in the sample
  - Leads to underestimation of repeated queries

Bias Explanation
- True duplicates require both tuples to be present
- Naive sampling often captures only one of the two occurrences
- This distorts the fraction of repeated queries in the sample
- Therefore, naive sampling introduces systematic bias

4.3 General Sampling Approach (Key-Based Sampling)
- Instead of sampling tuples independently, sample based on a key
- Example key: user
- Strategy:
  - Select a subset of users (e.g., 10%)
  - Keep all tuples belonging to selected users
- Preserves relationships between tuples sharing the same key
- Choice of key depends on analysis goal

Question: How to obtain a sample consisting of any fraction a/b of keys? (in other words: How to decide whether to keep or discard a new tuple?)

Sampling Fraction a/b Using Hashing
- Goal: keep a fraction a/b of keys
- Use hash function h(key) that maps keys uniformly into buckets {1, ..., b}
- Rule:
  - Keep tuple if h(key) ≤ a
  - Otherwise discard

Properties of Hash-Based Sampling
- Ensures consistent selection: all tuples with same key are either all kept or all discarded
- Produces unbiased sample with respect to chosen key
- Efficient and scalable for streaming data

Key Insight
- Sampling unit must align with analysis goal
- Tuple-level sampling can destroy structure
- Key-based sampling preserves correlations and yields more accurate estimates

4.4 Reservoir Sampling
- Goal: maintain uniform random sample of size B
- Properties:
  - Each item has the same probability to be sampled
  - Allows us to approximate basic statistics such as mean, variance, median, etc.
- Algorithm:
  - If t ≤ B:
    - Add item to reservoir
  - If t > B:
    - With probability B/t:
      - Replace random item in reservoir
- Guarantees:
  - Uniform sampling over entire stream
- Key formula:
  - Probability(item in reservoir) = B / t

Proof Sketch — All Elements sampled with probability of B / t

- Obvious case: i = t
  - a_i was inserted into B with probability B / t (direct result from algorithm)
- Otherwise: i < t
  - Observation: in step i, an item gets replaced with probability B / i * 1 / B = 1 / i
  - Probability of an item in reservoir:
    B / i x (1 - 1 / (i + 1)) x (1 - 1 / (i + 2)) x … x (1 - 1 / t) = B / t

Filtering Data Streams — Goal
- Accept only items that satisfy a given criterion
- Reject all other items during stream processing

Simple Filtering
- Criterion depends only on properties of the item itself
- Easy to compute directly
- Examples:
  - Search queries with more than 2 keywords
  - Sensor values with valid status codes

Challenge: Membership-Based Filtering
- Criterion requires checking if item belongs to a large set S
- Examples:
  - Emails from whitelisted senders (spam filtering)
  - Page visits to predefined websites
  - Tweets from selected users
- Problem:
  - Storing full set S may exceed memory limits

Basic Solution: Hash Table for Set S
- Store all elements of S in a hash table
- Lookup:
  - Check if incoming key exists in hash table
- Drawback:
  - Requires storing entire set S
  - Not scalable for very large datasets

Hashing without Storing S (Bit Array Method)
- Use a compact representation instead of full storage

Construction Phase
- Create bit array B of size n, initialize all bits to 0
- Choose hash function h(key) that maps keys to indices [1, n]
- For each element s in S:
  - Set B[h(s)] = 1

Filtering Phase
- For incoming item with key k:
  - If B[h(k)] = 1 → accept item
  - If B[h(k)] = 0 → discard item

Advantages
- Very memory efficient
- Fast lookup (constant time)
- Suitable for high-speed data streams

Limitation: False Positives
- Different elements may hash to same position
- Case:
  - a ∈ S, b ∉  S, but h(a) = h(b)
  - Then B[h(b)] = 1 → b is incorrectly accepted
- Effect:
  - Some non-members are falsely identified as members

False Negatives
- Do not occur in this approach
- If element s ∈ S:
  - B[h(s)] is always set to 1
- Therefore:
  - No true member will be rejected

Key Insight
- Trade-off between memory efficiency and accuracy
- Accepts small probability of false positives
- Guarantees no false negatives

False Positive Rate — Single Hash (Bit Array Method)
- Let |B| = size of bit array, |S| = number of inserted elements

Probability Analysis
- Probability a specific bit is 1 after inserting one key:
  - 1/|B|
- Probability a specific bit remains 0 after inserting one key:
  - 1 - 1/|B|
- Probability a specific bit remains 0 after inserting all |S| keys:
  - (1 - 1/|B|)^|S| ≈ e^(-|S| / |B|) (Approximation for large |B|)

- Probability a bit is 1 after inserting all |S| keys:
  - 1 - e^(-|S| / |B|)

False Positive Probability
- For element s ∉ S:
  - P(false positive) = P(B[h(s)] = 1)
  - = 1 - e^(-|S| / |B|)

Key Insight
- False positive rate depends only on ratio |S| / |B|
- Example:
  - If |S| / |B| = 1/8:
    - False positive ≈ 1 - e^(-1/8) ≈ 11.75%

Reducing False Positives (without increasing |B|)
- Use multiple hash functions instead of one

Bloom Filters — Basic Idea
- Use m independent hash functions h₁, h₂, ..., hₘ
- Each key maps to m positions in bit array

Construction
- Initialize bit array B of size n with all 0s
- For each element s ∈ S:
  - For i = 1 to m:
    - Set B[hᵢ(s)] = 1

Lookup
- For key k:
  - Accept if all B[hᵢ(k)] = 1 for i = 1 to m
  - Otherwise discard

Bloom Filter — Intuition
- A key must pass multiple checks
- Reduces chance that a random key falsely matches all bits
- But increases number of bits set to 1 overall

False Positive Probability — Bloom Filter
- For element s ∉ S: (1 - e^(-m|S| / |B|))^m

False Positive Rate — Bloom Filter
- Probability a query not in S passes all m checks
- False positive occurs if all m positions are 1
- General behavior:
  - Increasing m initially reduces false positives
  - After a point, too many bits become 1 → collisions increase

Optimal Number of Hash Functions
- There exists an optimal m minimizing false positives
- m = |B|/|S| ln2
- Example:
  - For |S| / |B| = 1/8:
    - Optimal m reduces false positive rate to ≈ 2.2%

Bloom Filter — Properties
- No false negatives:
  - If s ∈ S, all corresponding bits are set
- Allows false positives:
  - Some non-members may pass all checks
- Time complexity:
  - O(m) per insert and lookup
- Space complexity:
  - O(|B|)

Trade-offs
- Increasing m:
  - Pros:
    - Stricter filtering
  - Cons:
    - More bits set → higher collision probability
- Need balance to minimize false positives

Limitation of Bloom Filters
- Cannot delete elements
- Reason:
  - Multiple elements may share the same bit positions
  - Clearing a bit may remove evidence of other elements
- Only workaround: rebuild lookup table (bit array) from scratch

Counting Bloom Filters (Extension)
- Replace each bit with a small counter (e.g., 3–4 bits)
- Increased size of lookup table (3-4 times)

Operations
- Insert s:
  - For each i: B[hᵢ(s)] += 1, with 1 ≤ i ≤ m
- Delete s:
  - For each i: B[hᵢ(s)] -= 1, with 1 ≤ i ≤ m
- Lookup k:
  - Accept if all B[hᵢ(k)] > 0, with 1 ≤ i ≤ m

Properties
- Supports deletion
- Same false positive behavior as standard Bloom filter
- Trade-off:
  - Uses more memory (≈ 3–4× larger than bit array)

Big Picture
- Bloom filters trade exactness for efficiency
- Key lever is controlling collisions via:
  - Bit array size
  - Number of hash functions
- You’re shaping probability, not eliminating error

7. Counting Distinct Elements
7.1 Problem
- Count number of unique elements in stream
- Naive solution:
  - Maintain full set S
  - Number distinct elements = |S|
- Issue:
  - Memory grows too large

7.2 Flajolet-Martin Algorithm (Approximation approach)
- Goal:
  - Estimate number of distinct elements in an unbiased way
  - Accept errors but minimize their probability

7.3 Algorithm Steps
- Choose hash function that maps each of the n the elements to at least log2(n) bits
  - Use hash function h(s) → binary string
- For each element s in the stream:
  - Compute r(s) = number of trailing zeros in h(s)
- Track:
  - R = max r(s)
- Estimate:
  - Distinct count ≈ 2^R

7.4 Intuition
- More distinct elements ➜ more different hash values ➜ "unusual" hash values more likely
- "Unusual" hash value = hash value with rare bit pattern (e.g., number of trailing 0s)
- Probability that h(a) ends in at least k trailing 0s = 1/(2^k)
- Probability that h(a) ends in less than k trailing 0s = 1 - 1/(2^k)
- Given m distinct elements, probability that all h(a) end in less than k trailing 0s = (1 - 1/(2^k))^m
- Given m distinct elements, probability that R ≥ k (i.e., at least one of the m elements has h(a) with at least k trailing 0s) = 1 - (1 - 1/(2^k))^m

- Given m distinct elements, probability that R ≥ k (i.e., at least one of the m elements has h(a) with at least k trailing 0s):
1 - (1 - 1/(2^k))^m = 1 - (1 - 1/(2^k))^((2^k) m / (2^k)) ≈ 1 - e^(-m/(2^k))

Case 1: 2^k << m ➜ 1 - e^(-m/(2^k)) ≈ 1 - 0 = 1
- The probability to get an h(a) with enough trailing 0s is rather high

Case 2: 2^k >> m ➜ 1 - e^(-m/(2^k)) ≈ 1 - (1 - m/(2^k)) ≈  m/(2^k) ≈ 0
- The probability to get an h(a) with too many trailing 0s is rather low

➜ R is typically in the right ballpark

- Larger dataset → higher chance of large R
- Rare patterns indicate large cardinality

7.5 Issues
- Estimates are powers of 2
- If R is off by just 1, estimates doubles or halves
  - Small error in R → large estimation error

7.6 Improvement
- Use multiple hash functions:
  - Generate multiple estimates
- Process:
  - p x q hash functions ➜ p x q R values ➜ p x q estimates for the distinct counts
  - Group estimates
    - Put all estimates into p groups, each of size q
  - Take median per group
    - Calculate median of each group ➜ p medians
  - Take mean of medians
    - Calculate the mean over all p medians

- Result:
  - More stable and accurate estimate

8. Key Takeaways

- Data streams — main challenges
  - Large data volumes + high arrival speeds
  - Limited resources + real-time requirements

- Data streams require:
  - Efficient, low-memory algorithms
  - Real-time processing
- Three main tasks:
  - Sampling: representative subset
  - Filtering: selective processing
  - Counting: approximate statistics
- patterns = statistical analysis
- General principle:
  - Trade-off: speed / resource-efficiency vs. accuracy / errors
