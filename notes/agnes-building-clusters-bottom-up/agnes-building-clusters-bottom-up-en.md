<meta>
Title: AGNES: Building Clusters Bottom-Up
Tags: Data Mining, Clustering, Hierarchical Clustering, Agnes, Dendrogram, Linkage
Summary: A draft on AGNES as a bottom-up hierarchical clustering method, focusing on merge decisions, linkage criteria, dendrograms, and practical trade-offs.
Slug: agnes-building-clusters-bottom-up-en
Output: notes/agnes-building-clusters-bottom-up/agnes-building-clusters-bottom-up-en.html
Style: default
EstimatedReadingTime: true
Lang: en
TitleSuffix: false
Status: drafting
</meta>

<draft>
TLDR: This note explains AGNES as a bottom-up hierarchical clustering method that builds larger groups by repeatedly merging the most similar smaller ones.
MainFlow: Start from the idea that some grouping tasks are better understood as a nested hierarchy, then show how AGNES merges clusters step by step, why linkage matters, what the dendrogram tells us, and where the method becomes expensive or unstable.
Scope: Hierarchical intuition; agglomerative clustering; linkage criteria; dendrogram reading; strengths; weaknesses; when to use AGNES.
OutOfScope: Full top-down divisive clustering mechanics, DIANA details beyond contrast, density-based methods, and advanced scalability variants.
FollowUps: DIANA as the top-down counterpart; possible later note comparing single, complete, average, and Ward linkage more deeply.
</draft>

# AGNES: Building Clusters Bottom-Up

## Draft Intent

- Core question: what if clustering is not about producing one flat partition, but about revealing structure at multiple levels?
- Target outcome: the reader should understand AGNES as a bottom-up way of building a hierarchy of clusters.
- Role in the content chain: this is a standalone technique note for hierarchical clustering.

## Suggested Opening

Open from a different mental model than K-Means or DBSCAN:

- sometimes we do not want just one answer to "how many clusters are there?"
- sometimes we want to see nested structure: small groups inside larger groups
- hierarchical clustering is useful because it preserves that gradual organization

Then position AGNES:

- AGNES stands for agglomerative nesting
- it starts from individual points and repeatedly merges them upward

## The Core Idea: Merge the Closest Things First

Main beats:

- begin with every point as its own cluster
- at each step, merge the two most similar clusters
- repeat until everything is merged into a single hierarchy

Key conceptual shift:

- AGNES does not commit early to one final number of clusters
- instead, it produces a merge history that we can inspect later

## Why Linkage Criteria Matter

This section is the real heart of the article.

Explain that cluster-to-cluster distance is not unique:

- single linkage
- complete linkage
- average linkage
- Ward-style variance-based merging

Main point:

- AGNES is not one fixed behavior; the linkage criterion changes what kind of structure it prefers

Interpretive angles:

- single linkage can preserve chain-like connectivity
- complete linkage prefers tighter groups
- average linkage balances the two
- Ward-style merging tends to favor compact variance-minimizing clusters

## The Dendrogram as the Output

This section should explain why hierarchical clustering feels different from flat methods.

Key ideas:

- the dendrogram records the order and level of merges
- cutting the tree at different heights produces different clusterings
- the same run can support multiple resolutions of analysis

This is the main payoff:

- AGNES gives us a structured map of grouping, not just one fixed partition

## Why AGNES Feels Useful

Advantages:

- captures nested structure
- avoids forcing a single `K` too early
- can be insightful for exploratory analysis
- the dendrogram can be more informative than a one-shot assignment

Good fit:

- cases where we care about hierarchy or gradual grouping
- analysis workflows where the cluster count is not known ahead of time

## Where AGNES Breaks

Main weaknesses:

- computational cost can grow quickly
- merge decisions are greedy and usually irreversible
- bad early merges can distort later structure
- the result depends heavily on the choice of linkage and distance measure

Important interpretive point:

- AGNES feels flexible because it gives a whole tree, but that tree still reflects strong modeling choices

## AGNES vs. Flat Clustering

This comparison section can stay short.

Contrast with K-Means:

- K-Means gives one flat partition organized around centers
- AGNES gives a nested hierarchy built by repeated merges

Contrast with DBSCAN:

- DBSCAN thinks in dense connected regions and noise
- AGNES thinks in merge history and similarity structure

## Conclusion

Target takeaway:

- AGNES is useful when the structure of the data may exist at multiple levels
- its power comes from preserving merge history through the dendrogram
- its main cost is that linkage choice and early greedy merges strongly shape the final hierarchy

<reviewkit>
<qprompt/>
</reviewkit>
