<meta>
Title: Core Tasks in Data Mining
Tags: Data Mining, Classification, Regression, Clustering, Association Rules, Graph Mining, Recommender Systems, Predictive Tasks, Descriptive Tasks
Summary: A map of the main task families in data mining, from prediction and grouping to co-occurrence discovery, graph analysis, and recommendation.
Slug: core-tasks-in-data-mining-en
Output: notes/core-tasks-in-data-mining/core-tasks-in-data-mining-en.html
Style: default
EstimatedReadingTime: true
Lang: en
TitleSuffix: true
Status: drafting
Published: 2026-06-12
LastModified: 2026-06-12
</meta>
<draft>
- Core Summary & Problem Statement
    - A map of the main task families in data mining, from prediction and grouping to co-occurrence discovery, graph analysis, and recommendation.
- Prediction: Classification and Regression
    - - Classification & Regression (Predictive Tasks):
    - - The Goal: To build a model that can forecast future outcomes based on historical data
- Grouping: Clustering
    - - Clustering (Descriptive Grouping):
    - - The Goal: To discover natural, hidden populations within a dataset without any prior instructions
- Co-occurrence: Association Rules and Correlation
    - - Association Rules & Correlation (Pattern Co-occurrence):
    - - The Goal: To find items or events that mathematically imply the presence of one another
- Networks and Sparse Preference Structure
    - - Graph Mining & Recommender Systems (Network & Matrix Analysis):
    - - The Goal: To analyze highly interconnected or missing structural relational data
- Choosing the Right Task
- Summary & Key Takeaways
    - - Data mining contains multiple task families, each aligned with a different kind of question
    - - Predictive tasks estimate known targets; descriptive tasks reveal hidden structure
- References
</draft>


<anchors>
toc1: core-tasks -> Core Tasks in Data Mining
h2: Core Tasks in Data Mining -> core-tasks
toc2: tasks-guiding -> Guiding Questions
callout: Guiding Questions: What Kind of Pattern Are We Looking For? -> tasks-guiding
toc2: prediction -> Prediction: Classification and Regression
h3: Prediction: Classification and Regression -> prediction
toc2: grouping -> Grouping: Clustering
h3: Grouping: Clustering -> grouping
toc2: cooccurrence -> Co-occurrence: Association Rules and Correlation
h3: Co-occurrence: Association Rules and Correlation -> cooccurrence
toc2: networks -> Networks and Sparse Preference Structure
h3: Networks and Sparse Preference Structure -> networks
toc2: choosing-task -> Choosing the Right Task
h3: Choosing the Right Task -> choosing-task
toc1: summary -> Summary & Key Takeaways
h2: Summary & Key Takeaways -> summary
toc1: references -> References
h2: References -> references
</anchors>

# Core Tasks in Data Mining

## Core Tasks in Data Mining

<callout>
id: tasks-guiding
toc: Guiding Questions
variant: question
icon: circle-question
style: regular
title: Guiding Questions: What Kind of Pattern Are We Looking For?
content:
Once data has been prepared, the next question is not "Which algorithm is best?" but "What kind of pattern are we trying to extract?" Are we predicting a known target, discovering natural groups, surfacing items that co-occur, or reasoning over relational structure?

Different data mining tasks ask fundamentally different questions of the same dataset. Some aim to forecast outcomes, while others aim to discover hidden organization without labels. Some care about pairwise co-occurrence, while others focus on networks or missing preferences.

So before choosing a method, we first need to identify the task family that matches the kind of knowledge we hope to uncover.
</callout>

Data mining is not a single computational act. It is a family of different tasks, each aimed at extracting a different kind of structure from data. That is why the same dataset may support multiple kinds of analysis, depending on what question we ask. If we want to predict a category or a number, we enter the world of predictive tasks. If we want to discover hidden groups without labels, we move into clustering. If we want to know which events tend to appear together, we care about associations and correlations. And if relationships between entities are themselves the main object of interest, graph-based or recommendation-oriented tasks become more natural. Before discussing specific algorithms, we therefore need a clean map of the major task families.

## Prediction: Classification and Regression

- Classification & Regression (Predictive Tasks):
  - The Goal: To build a model that can forecast future outcomes based on historical data.
  - The Mechanics: Classification maps data points into discrete, categorical buckets (e.g., predicting whether a patient has a disease: "Yes" or "No"). Regression, on the other hand, models continuous numerical trends (e.g., forecasting a patient's exact blood pressure level).

## Grouping: Clustering

- Clustering (Descriptive Grouping):
  - The Goal: To discover natural, hidden populations within a dataset without any prior instructions.
  - The Mechanics: The algorithm mathematically scans the data to maximize intra-group similarity (making items inside a cluster as alike as possible) while minimizing inter-group overlap (pushing different clusters as far apart as possible). A common example is identifying distinct, unknown subtypes of a disease among thousands of patient profiles.

## Co-occurrence: Association Rules and Correlation

- Association Rules & Correlation (Pattern Co-occurrence):
  - The Goal: To find items or events that mathematically imply the presence of one another.
  - The Mechanics: Most famously used in market-basket analysis, this task surfaces predictive rules (e.g., "Customers who buy diapers are 80% likely to also purchase beer"). It scans massive transactional logs to move past basic statistical frequency and uncover genuine dependencies.

## Networks and Sparse Preference Structure

- Graph Mining & Recommender Systems (Network & Matrix Analysis):
  - The Goal: To analyze highly interconnected or missing structural relational data.
  - The Mechanics: Graph Mining treats data as networks of nodes and edges to isolate central hubs or tight-knit communities (such as mapping protein-protein interaction networks). Recommender Systems utilize large sparse matrices of past user behaviors to predict missing preferences and suggest new content (such as Netflix movie recommendations or predicting drug-target interactions).

## Choosing the Right Task

The choice of which task to pursue—and which mathematical framework to deploy—fundamentally depends on the nature of our data's blueprint. Specifically, it hinges on whether our dataset possesses a ground truth guide to learn from, split into two primary paradigms: `Supervised Learning in Data Mining` and `Unsupervised Learning and Dimensionality Reduction`.

## Summary & Key Takeaways

- Data mining contains multiple task families, each aligned with a different kind of question.
- Predictive tasks estimate known targets; descriptive tasks reveal hidden structure.
- Relational and recommendation settings require thinking beyond flat records.
- Choosing the right task comes before choosing the right algorithm.

## References

1. NUS CS5228 Knowledge Discovery and Data Mining Course Materials
