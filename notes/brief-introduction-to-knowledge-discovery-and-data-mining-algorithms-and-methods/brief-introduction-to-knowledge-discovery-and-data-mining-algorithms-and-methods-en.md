<meta>
Title: Brief Introduction to Knowledge Discovery and Data Mining Algorithms & Methods
CanonicalId: brief-introduction-to-knowledge-discovery-and-data-mining-algorithms-and-methods
Tags: Data Mining, Machine Learning, Exploratory Data Analysis, Preprocessing, Clustering, Classification, Regression, Association Rules, Graph Mining, Recommender Systems, Dimensionality Reduction, PCA, TSNE, Normalization, Feature Selection
Summary: Brief introduction to Knowledge Discovery and Data Mining algorithms & methods: supervised vs unsupervised learning, key task families, and core dimensionality reduction ideas.
Slug: brief-introduction-to-knowledge-discovery-and-data-mining-algorithms-and-methods-en
Output: notes/brief-introduction-to-knowledge-discovery-and-data-mining-algorithms-and-methods/brief-introduction-to-knowledge-discovery-and-data-mining-algorithms-and-methods-en.html
Style: default
EstimatedReadingTime: true
Lang: en
TitleSuffix: true
Status: drafting
Published: 2026-06-01
</meta>
<draft>
- Core Summary & Problem Statement
    - Brief introduction to Knowledge Discovery and Data Mining algorithms & methods: supervised vs unsupervised learning, key task families, and core dimensionality reduction ideas.
- Algorithms & Methods
    - Supervised & Deep Learning
    - Unsupervised Learning
- Summary & Key Takeaways
    - Ultimately, knowledge discovery is an end-to-end journey
    - Question: Which statement best distinguishes supervised learning from unsupervised learning
- References
</draft>


<anchors>
toc1: algorithms -> Algorithms & Methods
h2: Algorithms & Methods -> algorithms
toc2: algorithms-guiding -> Guiding Questions
callout: Guiding Questions: Choosing the Right Tool -> algorithms-guiding
toc2: algorithms-supervised -> Supervised & Deep Learning
h3: Supervised & Deep Learning -> algorithms-supervised
toc2: algorithms-unsupervised -> Unsupervised Learning
h3: Unsupervised Learning -> algorithms-unsupervised
toc1: summary -> Summary & Key Takeaways
h2: Summary & Key Takeaways -> summary
toc1: summary-quiz -> Summary Quiz
h2: Summary Quiz -> summary-quiz
toc1: references -> References
h2: References -> references
</anchors>


# Brief Introduction to Knowledge Discovery and Data Mining Algorithms & Methods

## Algorithms & Methods

<callout>
id: algorithms-guiding
toc: Guiding Questions
variant: question
icon: circle-question
style: regular
title: Guiding Questions: Choosing the Right Tool
content:
Now that the soil is prepared, choose tools that match the plant you want to grow.

- Do I have labels (supervised), or am I discovering structure (unsupervised)?
- Am I predicting (classification/regression) or discovering (clustering/association/graph patterns)?
- How will I validate and communicate results so they stay actionable?
</callout>

Having understood the inherent traits of our data and successfully guided it through the preprocessing pipeline, we can now enter the engine room of Knowledge Discovery and Data Mining: the data mining algorithms. These algorithms are not one-size-fits-all tools; instead, they are specialized instruments designed to solve distinct computational challenges.

Before diving into specific algorithmic families, we must understand the primary tasks they are engineered to accomplish:

* Classification & Regression (Predictive Tasks):
    * The Goal: To build a model that can forecast future outcomes based on historical data.
    * The Mechanics: Classification maps data points into discrete, categorical buckets (e.g., predicting whether a patient has a disease: "Yes" or "No"). Regression, on the other hand, models continuous numerical trends (e.g., forecasting a patient's exact blood pressure level).
* Clustering (Descriptive Grouping):
    * The Goal: To discover natural, hidden populations within a dataset without any prior instructions.
    * The Mechanics: The algorithm mathematically scans the data to maximize intra-group similarity (making items inside a cluster as alike as possible) while minimizing inter-group overlap (pushing different clusters as far apart as possible). A common example is identifying distinct, unknown subtypes of a disease among thousands of patient profiles.
* Association Rules & Correlation (Pattern Co-occurrence):
    * The Goal: To find items or events that mathematically imply the presence of one another.
    * The Mechanics: Most famously used in market-basket analysis, this task surfaces predictive rules (e.g., "Customers who buy diapers are $80\%$ likely to also purchase beer"). It scans massive transactional logs to move past basic statistical frequency and uncover genuine dependencies.
* Graph Mining & Recommender Systems (Network & Matrix Analysis):
    * The Goal: To analyze highly interconnected or missing structural relational data.
    * The Mechanics: Graph Mining treats data as networks of nodes and edges to isolate central hubs or tight-knit communities (such as mapping protein-protein interaction networks). Recommender Systems utilize large sparse matrices of past user behaviors to predict missing preferences and suggest new content (such as Netflix movie recommendations or predicting drug-target interactions).

The choice of which task to pursue—and which mathematical framework to deploy—fundamentally depends on the nature of our data's blueprint. Specifically, it hinges on whether our dataset possesses a "ground truth" guide to learn from, split into two primary paradigms: Supervised Learning and Unsupervised Learning.

### Supervised & Deep Learning
When a dataset arrives with established, gold-standard labels, supervised learning algorithms are deployed. In this setup, the algorithm acts like a student with an answer key, constantly adjusting its internal parameters to minimize the gap between its predictions and the actual ground truth.

In practical classification tasks, classical algorithms like Support Vector Machines (SVM) and K-Nearest Neighbors (KNN) are frequently used to draw mathematical boundaries between distinct classes. For instance, in biomedical workflows, these models can successfully categorize cancerous versus healthy tissues by identifying specific threshold boundaries within highly complex gene expression profiles.

Similarly, Random Forests—an ensemble architecture built by aggregating numerous individual Decision Trees—provide both robust predictive power and structural interpretability. Because a single Decision Tree is essentially a flow chart of sequential feature tests and logical rules (e.g., If Gene A > 2.5 and Gene B < 1.0, then Classify as Type X), practitioners can inspect the forest to understand exactly how a clinical or pathway-based decision was formulated.

When the data scales into massive, highly intricate biological configurations, Deep Learning architectures take over. These neural networks automatically extract hierarchical features without manual engineering:
* Convolutional Neural Networks (CNNs): Excel at processing structural, spatial data. They can analyze medical images to detect tumors or predict protein secondary structures directly from raw, spatial amino acid layouts.
* Recurrent Neural Networks (RNNs): Engineered to handle sequential data where order carries meaning. They are highly effective at tracking long-range dependencies over time, making them the ideal tool for mapping nucleotide chains and calculating alignment or sequence similarities.

### Unsupervised Learning
Conversely, when a dataset lacks predefined labels or target outcomes, we must rely on unsupervised learning to independently uncover the data's raw, underlying topology. Without an answer key, these algorithms look purely at the intrinsic geometric distribution of the data to find patterns.

Hierarchical Clustering is widely favored when the analytical goal is to build an evolutionary or structural taxonomy. It groups data points into nested, tree-like structures (dendrograms), which allows researchers to visually trace how distinct protein families branch out from common ancestors. For flatter, hard partitions, K-Means Clustering is deployed to systematically divide a dataset into $K$ distinct groups, a technique frequently used to map co-expressed genes across specific chromosomal regions.

Another monumental task within unsupervised learning is Dimensionality Reduction. Real-world datasets—especially in biology—are heavily burdened by the "curse of dimensionality," containing thousands of variables per sample. Because human perception is strictly limited to 2D or 3D spaces, visualizing these complex spaces is impossible without mathematical compression. Furthermore, excessive dimensions introduce massive background noise that obscures true patterns.

To solve this, practitioners utilize advanced mathematical transformations:
* Principal Component Analysis (PCA): A linear method that rotates the data space to capture the axes of maximum statistical variance. Because it highlights major structural shifts, PCA is frequently used to identify statistical anomalies and perform outlier classification.
* t-Distributed Stochastic Neighbor Embedding (t-SNE): A non-linear technique that preserves local distances, mapping high-dimensional data into a 2D plane so that highly similar points remain tightly packed together. This has become the gold standard for single-cell RNA-sequencing (scRNA-seq) visualization, allowing researchers to visually isolate entirely new cell types.
* Non-Negative Matrix Factorization (NMF): An unsupervised matrix decomposition approach that forces all factored components to be non-negative. This constraint makes NMF exceptionally useful for gene expression profile clustering, as it yields a "parts-based" representation that maps cleanly onto real, additive biological pathways.

<qquiz src="questions.en.json" ids="supervised-vs-unsupervised" title="Quick Quiz"/>

## Summary & Key Takeaways
The overarching lesson of the Knowledge Discovery and Data Mining process is that a model is only as good as the data feeding it. A successful pipeline requires you to deeply know and thoroughly clean your data before jumping into complex predictive modeling. When refining your datasets, distinguishing between irrelevant attributes (like arbitrary user IDs or zodiac signs) and high-value predictive features (like age or income) is crucial for efficiency.

Ultimately, knowledge discovery is an end-to-end journey. By recognizing the critical differences between trivial extraction and genuine pattern mining, and by rigorously applying data quality checks, EDA, and preprocessing, you guarantee that your final algorithms produce insights that are not only statistically sound, but practically actionable.

<reviewkit>
title: Review Kit
id: summary-quiz
toc: true

<qquiz>
title: Summary Quiz

<question>
Question: Which statement best distinguishes supervised learning from unsupervised learning?
A: Supervised learning trains on labeled data, while unsupervised learning finds patterns without labels.
ResponseA: Correct. Supervised learning uses labeled ground truth; unsupervised learning discovers structure without labels.
B: Supervised learning only works on small datasets, while unsupervised learning only works on large datasets.
ResponseB: Incorrect. Both can scale; the key difference is whether labels exist.
C: Supervised learning only works on structured data, while unsupervised learning only works on unstructured data.
ResponseC: Incorrect. Supervision is about labels, not whether data is structured.
D: Supervised learning is deep learning, while unsupervised learning is classical machine learning.
ResponseD: Incorrect. Deep learning can be supervised or unsupervised; it is not the separator.
Answer: A
Explanation: Supervised learning uses labeled ground truth; unsupervised learning discovers structure without labels.
</question>

<question>
Question: Which pairing correctly matches the predictive task with its output type?
A: Classification → continuous value; Regression → category
ResponseA: Incorrect. Classification predicts categories, not continuous values.
B: Classification → category; Regression → continuous value
ResponseB: Correct. Classification predicts discrete categories; regression predicts continuous values.
C: Classification → only for unsupervised learning; Regression → only for supervised learning
ResponseC: Incorrect. Both can be used for prediction; the difference is output type.
D: Classification → time series; Regression → graphs
ResponseD: Incorrect. Time is not what distinguishes classification vs regression.
Answer: B
Explanation: Classification predicts discrete categories; regression predicts continuous values.
</question>

<question>
Question: Which task is most closely associated with market-basket analysis (e.g., “diapers → beer”)?
A: Clustering
ResponseA: Incorrect. Clustering groups items; it does not directly produce implication rules.
B: Classification
ResponseB: Incorrect. Classification predicts labels for new examples.
C: Association rules & correlation
ResponseC: Correct. Association rules discover co-occurrence patterns and implication-like rules.
D: Dimensionality reduction
ResponseD: Incorrect. Dimensionality reduction compresses features; it does not produce basket rules.
Answer: C
Explanation: Association rules discover co-occurrence patterns and implication-like rules.
</question>

<question>
Question: In this note, what is the core idea behind recommender systems?
A: Finding hubs and communities in a network of nodes and edges
ResponseA: Incorrect. That describes graph mining; recommender systems often operate on sparse user-item matrices.
B: Predicting missing user preferences in a sparse behavior matrix to suggest new items
ResponseB: Correct. Recommenders use sparse behavior matrices to predict missing preferences and suggest content.
C: Grouping users into K groups without labels
ResponseC: Incorrect. That describes clustering.
D: Removing duplicates and imputing missing values in raw data
ResponseD: Incorrect. That is data preprocessing, not recommendation.
Answer: B
Explanation: Recommenders use sparse behavior matrices to predict missing preferences and suggest content.
</question>

<question>
Question: Which method is described as a non-linear technique commonly used for scRNA-seq visualization?
A: PCA
ResponseA: Incorrect. PCA is a linear variance-maximizing method.
B: t-SNE
ResponseB: Correct. t-SNE is highlighted as a non-linear neighborhood-preserving visualization method.
C: NMF
ResponseC: Incorrect. NMF is a matrix factorization method, not the one described as non-linear neighborhood embedding here.
D: Random Forest
ResponseD: Incorrect. Random Forest is a supervised ensemble model, not dimensionality reduction.
Answer: B
Explanation: t-SNE is highlighted as a non-linear neighborhood-preserving visualization method.
</question>

<question>
Question: Which pairing best matches the deep learning architecture to the data type it is described to handle?
A: CNN → sequences; RNN → images
ResponseA: Incorrect. The note describes CNNs for spatial/structural data, and RNNs for sequential data.
B: CNN → spatial/structural data; RNN → sequential data
ResponseB: Correct. CNNs are described for spatial/structural data; RNNs for sequential data.
C: CNN → graphs; RNN → tabular data
ResponseC: Incorrect. Both can be used broadly, but the note highlights a specific pairing.
D: CNN → unsupervised learning; RNN → supervised learning
ResponseD: Incorrect. The note does not frame them this way.
Answer: B
Explanation: CNNs are described for spatial/structural data; RNNs for sequential data.
</question>

<question>
Question: Which unsupervised method is described as producing nested, tree-like groupings (a dendrogram)?
A: K-Means clustering
ResponseA: Incorrect. K-Means produces flat partitions, not a dendrogram.
B: Hierarchical clustering
ResponseB: Correct. Hierarchical clustering is described as building a nested taxonomy (dendrogram).
C: PCA
ResponseC: Incorrect. PCA is dimensionality reduction.
D: Random Forest
ResponseD: Incorrect. Random Forest is a supervised ensemble model.
Answer: B
Explanation: Hierarchical clustering is described as building a nested taxonomy (dendrogram).
</question>

<question>
Question: In this note’s framing, what triggers the need for unsupervised learning?
A: The dataset has reliable ground-truth labels
ResponseA: Incorrect. Having labels indicates supervised learning.
B: The dataset lacks predefined labels or target outcomes
ResponseB: Correct. Unsupervised learning is used when labels/targets are absent.
C: The dataset is too large to label
ResponseC: Incorrect. Scale alone does not determine supervised vs unsupervised.
D: The dataset is semi-structured instead of tabular
ResponseD: Incorrect. Data representation is not the key trigger here; labels are.
Answer: B
Explanation: Unsupervised learning is used when labels/targets are absent.
</question>

<question>
Question: Which statement best matches the purpose of dimensionality reduction described in this note?
A: Assigning new data points into predefined categories
ResponseA: Incorrect. Dimensionality reduction is about compressing features, not producing class labels.
B: Discovering market-basket rules like “diapers → beer”
ResponseB: Incorrect. Dimensionality reduction is not the same as association-rule mining.
C: Compressing high-dimensional data to visualize structure and reduce the curse of dimensionality
ResponseC: Correct. It compresses high-dimensional spaces for visualization and reduces noise/curse-of-dimensionality issues.
D: Finding central hubs in a node-edge network
ResponseD: Incorrect. That describes graph mining.
Answer: C
Explanation: It compresses high-dimensional spaces for visualization and reduces noise/curse-of-dimensionality issues.
</question>

<question>
Question: Which statement best matches PCA as described in this note?
A: A linear method that rotates the space to capture axes of maximum variance
ResponseA: Correct. PCA is described as a linear method that captures axes of maximum variance.
B: A non-linear neighborhood-preserving embedding commonly used for scRNA-seq visualization
ResponseB: Incorrect. That describes t-SNE in the note.
C: A non-negative factorization that yields parts-based representations
ResponseC: Incorrect. That describes NMF in the note.
D: A method that requires ground-truth labels to learn class boundaries
ResponseD: Incorrect. That describes supervised learning with labels.
Answer: A
Explanation: PCA is described as a linear method that captures axes of maximum variance.
</question>

</qquiz>

<qprompt count=20 type=["mcq"]>
</qprompt>
</reviewkit>

## References

1. NUS CS5228 Knowledge Discovery and Data Mining Course Materials
