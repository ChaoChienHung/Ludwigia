<meta>
Title: Unsupervised Learning and Dimensionality Reduction
Tags: Data Mining, Unsupervised Learning, Clustering, Dimensionality Reduction, Hierarchical Clustering, K-Means, PCA, TSNE, NMF
Summary: How data mining works without labels: discovering hidden groups, compressing high-dimensional structure, and making latent patterns visible.
Slug: unsupervised-learning-and-dimensionality-reduction-en
Output: notes/unsupervised-learning-and-dimensionality-reduction/unsupervised-learning-and-dimensionality-reduction-en.html
Style: default
EstimatedReadingTime: true
Lang: en
TitleSuffix: true
Status: drafting
Published: 2026-06-12
LastModified: 2026-06-12
</meta>

<anchors>
toc1: unsupervised -> Unsupervised Learning and Dimensionality Reduction
h2: Unsupervised Learning and Dimensionality Reduction -> unsupervised
toc2: unsupervised-guiding -> Guiding Questions
callout: Guiding Questions: What If No Labels Exist? -> unsupervised-guiding
toc2: unlabeled-setting -> The Unlabeled Discovery Setting
h3: The Unlabeled Discovery Setting -> unlabeled-setting
toc2: clustering -> Clustering as Structure Discovery
h3: Clustering as Structure Discovery -> clustering
toc2: dim-reduction -> Why Dimensionality Reduction Matters
h3: Why Dimensionality Reduction Matters -> dim-reduction
toc2: common-methods -> Common Methods: PCA, t-SNE, and NMF
h3: Common Methods: PCA, t-SNE, and NMF -> common-methods
toc2: strengths-limits -> Strengths and Limits of Unsupervised Learning
h3: Strengths and Limits of Unsupervised Learning -> strengths-limits
toc1: summary -> Summary & Key Takeaways
h2: Summary & Key Takeaways -> summary
toc1: references -> References
h2: References -> references
</anchors>

# Unsupervised Learning and Dimensionality Reduction

## Unsupervised Learning and Dimensionality Reduction

<callout>
id: unsupervised-guiding
toc: Guiding Questions
variant: question
icon: circle-question
style: regular
title: Guiding Questions: What If No Labels Exist?
content:
Many of the most interesting data mining problems begin without an answer key. We may suspect that a dataset contains hidden groups, latent structure, or compressed patterns, but we do not yet know what those structures are called or how many of them exist.

This forces a different style of learning. Instead of predicting a known target, we ask the data to reveal its own organization. Which points belong together? Which directions in the data capture the strongest variation? Which structure is signal, and which is merely geometric noise?

That is the domain of unsupervised learning: extracting order, grouping, and low-dimensional structure when labels are absent.
</callout>

Unsupervised learning covers the part of data mining where no predefined labels tell us what the right answer should be. This makes it both powerful and dangerous. Powerful, because it can uncover genuinely new structure that nobody annotated in advance. Dangerous, because without labels it becomes easier to mistake visual patterns, unstable clusters, or mathematical convenience for real domain knowledge. That is why unsupervised learning must be framed carefully. Its job is not just to "run clustering" or "reduce dimensions," but to reveal structure in a way that remains interpretable, stable, and meaningful enough to guide further analysis.

## The Unlabeled Discovery Setting

Conversely, when a dataset lacks predefined labels or target outcomes, we must rely on unsupervised learning to independently uncover the data's raw, underlying topology. Without an answer key, these algorithms look purely at the intrinsic geometric distribution of the data to find patterns.

## Clustering as Structure Discovery

Hierarchical Clustering is widely favored when the analytical goal is to build an evolutionary or structural taxonomy. It groups data points into nested, tree-like structures (dendrograms), which allows researchers to visually trace how distinct protein families branch out from common ancestors. For flatter, hard partitions, K-Means Clustering is deployed to systematically divide a dataset into $K$ distinct groups, a technique frequently used to map co-expressed genes across specific chromosomal regions.

## Why Dimensionality Reduction Matters

Another monumental task within unsupervised learning is Dimensionality Reduction. Real-world datasets—especially in biology—are heavily burdened by the "curse of dimensionality," containing thousands of variables per sample. Because human perception is strictly limited to 2D or 3D spaces, visualizing these complex spaces is impossible without mathematical compression. Furthermore, excessive dimensions introduce massive background noise that obscures true patterns.

## Common Methods: PCA, t-SNE, and NMF

To solve this, practitioners utilize advanced mathematical transformations:

- Principal Component Analysis (PCA): A linear method that rotates the data space to capture the axes of maximum statistical variance. Because it highlights major structural shifts, PCA is frequently used to identify statistical anomalies and perform outlier classification.
- t-Distributed Stochastic Neighbor Embedding (t-SNE): A non-linear technique that preserves local distances, mapping high-dimensional data into a 2D plane so that highly similar points remain tightly packed together. This has become the gold standard for single-cell RNA-sequencing (scRNA-seq) visualization, allowing researchers to visually isolate entirely new cell types.
- Non-Negative Matrix Factorization (NMF): An unsupervised matrix decomposition approach that forces all factored components to be non-negative. This constraint makes NMF exceptionally useful for gene expression profile clustering, as it yields a parts-based representation that maps cleanly onto real, additive biological pathways.

## Strengths and Limits of Unsupervised Learning

The strength of unsupervised learning is that it can reveal structure that no one labeled in advance. But that same freedom also makes it easier to overinterpret unstable clusters, visually compelling embeddings, or mathematically convenient decompositions as if they automatically reflected real mechanisms. In other words, discovering structure is only the first step; deciding whether that structure is meaningful still requires judgment, domain knowledge, and careful validation.

## Summary & Key Takeaways

- Unsupervised learning studies structure without relying on labeled targets.
- Clustering and dimensionality reduction are two major ways of revealing hidden organization.
- Different methods preserve different notions of similarity, variance, or parts-based structure.
- The real challenge is not just discovering patterns, but deciding whether those patterns are meaningful.

## References

1. NUS CS5228 Knowledge Discovery and Data Mining Course Materials
