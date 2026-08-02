<meta>
Title: K-Means: Clustering Around Centers
CanonicalId: k-means-clustering-around-centers
Tags: Data Mining, Clustering, Centroid-Based Clustering
Summary: An intuition-first note on K-Means, from center-based compactness and centroids to Lloyd's algorithm, limitations, and practical use.
Slug: k-means-clustering-around-centers-en
Output: notes/k-means-clustering-around-centers/k-means-clustering-around-centers-en.html
Cover: ./K-Means-Clustering.jpeg
Style: default
EstimatedReadingTime: true
Lang: en
TitleSuffix: false
Status: published
Published: 2026-08-01
LastModified: 2026-08-02
</meta>

# K-Means: Clustering Around Centers

<image>
src: ./K-Means-Clustering.jpeg
alt: An illustration of K-Means clustering, where data points are grouped around their nearest centroid.
caption: An illustration of K-Means clustering, where data points are grouped around their nearest centroid.
</image>

As we explored in <content-link canonical="discovering-hidden-structures-what-clustering-really-does">Discovering Hidden Structures: What Clustering Really Does</content-link>, clustering is fundamentally about grouping objects together based on a chosen perspective of **similarity**. Depending on their core mechanisms, clustering algorithms generally fall into three main categories: centroid-based, density-based, and hierarchical clustering. 

In this note, we will explore K-Means, one of the most classic centroid-based algorithms. As its category suggests, K-Means uses a central point, known as a **centroid**, to represent an entire cluster, and assigns data points to these clusters based on their distance to these representatives. A good clustering is one that minimizes the total distance between data points and their assigned representatives, resulting in compact clusters whose members lie closely around their centers.

However, this leads to a series of deeper questions: First, why do we specifically use the arithmetic mean as the cluster's representative centroid? Furthermore, even if we agree that the centroid is the ideal choice, how do we actually compute it? After all, calculating a cluster's centroid requires knowing which data points belong to that cluster. Yet, in unlabeled data, cluster memberships are precisely the unknowns we are trying to discover! How do we resolve this fundamental chicken-and-egg problem where optimal centroids depend on assignments we don't yet have? Beyond this core algorithmic challenge, what practical details must we pay attention to during implementation? When is K-Means the right tool for the job, and when is it destined to fail? Finally, are there related variants we can turn to for different outcomes?

In the following sections, we will delve into these questions one by one.

## 1. The Pairwise Problem and the Algebraic Miracle

In the previous section, we mentioned that a good cluster is one where its members lie closely around their center. But wait—if the true goal of clustering is to ensure that data points are close to *each other*, shouldn't we directly measure the distance between the points themselves?

Intuitively, yes. To evaluate how compact a cluster is, the most rigorous approach is to compute the **Sum of Squared Pairwise Distances**. The reason why we use squared distance instead of regular distance here is because it heavily penalizes larger deviations (forcing points to gather tightly rather than spreading out) and makes algebraic manipulation—like the trick we are about to see—mathematically possible without dealing with ugly square roots. Therefore, we measure the distance between every point $x$ and every other point $y$ inside the cluster as follows:

$$
\text{Pairwise Compactness} = \sum_{x \in C} \sum_{y \in C} \lVert x - y \rVert^2
$$

However, this point-to-point comparison hits a massive wall in reality. If a cluster has $N$ points, calculating the distances between all of them requires $O(N^2)$ operations. As datasets grow to millions of records, this becomes practically impossible to compute.

Therefore, we need a shortcut, but at the same time, we don't want to compromise our core objective of "keeping points close to each other." But how?

### The Mathematical Revelation: The Centroid Identity
Luckily, it turns out we don't have to invent a new metric or settle for an approximation. If we look closely at the math behind the pairwise distances in Euclidean space, an elegant shortcut naturally falls out of the equation.

Through a pure algebraic trick, much like completing the square, mathematicians proved a profound equivalence known as the **Centroid Identity**, also called Huygens' Theorem. It states that the total pairwise squared distance within a cluster is mathematically tied to a single reference point: the **centroid** $\mu$, defined as the arithmetic mean of all points in the cluster.

The equivalence looks like this:

$$
\sum_{x \in C} \sum_{y \in C} \lVert x - y \rVert^2 = 2|C| \sum_{x \in C} \lVert x - \mu \rVert^2
$$

Let's break down this beautiful revelation:
- **The left side** is our original, computationally expensive goal: how close the points are to *each other*.
- **The right side** introduces a completely new calculation: how close every point is to the centroid $\mu$, multiplied by the scaling factor $2|C|$. 

This is not an approximation; it is an exact mathematical equals sign. It proves that **bringing every point closer to the centroid is mathematically the exact same thing as bringing every point closer to every other point.** This simplifies everything! We no longer need to compute the pairwise distances between all pairs of points to measure a cluster's compactness; we just need the distances between the points and their centroid. Furthermore, this tells us that if we can find a way to minimize the distance between all points and their centroid, it is strictly equivalent to bringing all pairs of points closer together, making the cluster as tight and compact as possible.

<block>
title: Mathematical Proof: Derivation of the Centroid Identity
collapsible: true
content:
To see why this identity holds, let the cluster contain $n = |C|$ points, denoted by $x_1, x_2, \dots, x_n$, and let the centroid be defined as $\mu = \frac{1}{n}\sum_{i=1}^{n}x_i$ (meaning $n\mu = \sum_{i=1}^{n}x_i$).

First, let's expand the right-hand side (the squared distance to the centroid):
$$
\begin{aligned}
\sum_{i=1}^{n}\lVert x_i-\mu\rVert^2 
&= \sum_{i=1}^{n} \left( \lVert x_i\rVert^2 - 2x_i^\top\mu + \lVert\mu\rVert^2 \right) \\
&= \sum_{i=1}^{n}\lVert x_i\rVert^2 - 2\mu^\top \left(\sum_{i=1}^{n}x_i\right) + n\lVert\mu\rVert^2
\end{aligned}
$$
Since $\sum_{i=1}^{n}x_i = n\mu$, we can substitute it in:
$$
\begin{aligned}
&= \sum_{i=1}^{n}\lVert x_i\rVert^2 - 2\mu^\top(n\mu) + n\lVert\mu\rVert^2 \\
&= \sum_{i=1}^{n}\lVert x_i\rVert^2 - 2n\lVert\mu\rVert^2 + n\lVert\mu\rVert^2 \\
&= \sum_{i=1}^{n}\lVert x_i\rVert^2 - n\lVert\mu\rVert^2
\end{aligned}
$$

Now, let's expand the left-hand side (the Sum of Squared Pairwise Distances):
$$
\begin{aligned}
\sum_{i=1}^{n}\sum_{j=1}^{n} \lVert x_i-x_j\rVert^2 
&= \sum_{i=1}^{n}\sum_{j=1}^{n} \left( \lVert x_i\rVert^2 + \lVert x_j\rVert^2 - 2x_i^\top x_j \right) \\
&= n\sum_{i=1}^{n}\lVert x_i\rVert^2 + n\sum_{j=1}^{n}\lVert x_j\rVert^2 - 2 \left(\sum_{i=1}^{n}x_i\right)^\top \left(\sum_{j=1}^{n}x_j\right) \\
&= 2n\sum_{i=1}^{n}\lVert x_i\rVert^2 - 2(n\mu)^\top(n\mu) \\
&= 2n\sum_{i=1}^{n}\lVert x_i\rVert^2 - 2n^2\lVert\mu\rVert^2
\end{aligned}
$$

Finally, if we divide both sides of this pairwise sum by $2n$, we get:
$$
\frac{1}{2n} \sum_{i=1}^{n}\sum_{j=1}^{n} \lVert x_i-x_j\rVert^2 = \sum_{i=1}^{n}\lVert x_i\rVert^2 - n\lVert\mu\rVert^2 = \sum_{i=1}^{n}\lVert x_i-\mu\rVert^2
$$
This completes the proof. The pairwise sum is identically equal to $2n$ times the sum of squared errors from the centroid.
</block>

### Discovering the SSE
Now that we know we can easily use the distance between the data points and their centroids to measure compactness, we can define a new core metric: the **Sum of Squared Errors (SSE)**, calculated as $\sum \lVert x - \mu \rVert^2$. 

By optimizing this single metric, we achieve the exact same clustering objective (compactness) while drastically reducing the computational complexity from $O(N^2)$ down to just $O(N)$.

<callout>
icon: lightbulb
style: regular
title: The Calculus Perspective: Centroids as a State of Equilibrium
content:
Beyond the algebraic proof, we can also look at this through the lens of calculus and physics, which reveals *why* the arithmetic mean naturally emerges as the optimal center. 

Suppose we don't yet know that the centroid is the average. Instead, we define a general objective cost function for a single cluster: we want to find *some* representative point $c$ in the space that minimizes the Sum of Squared Errors (SSE):
$$
J(c) = \sum_{x \in C} \lVert x - c \rVert^2
$$
To find the optimal point $c$ that minimizes this total energy, we can take the partial derivative of our cost function with respect to $c$ and set it to zero to find the stationary point (the minimum):
$$
\frac{\partial J}{\partial c} = -2\sum_{x \in C}(x - c) = 0
$$
Dividing by $-2$ and expanding the sum, we get:
$$
\sum_{x \in C} x - \sum_{x \in C} c = 0 \implies \sum_{x \in C} x = |C|c
$$
Solving for $c$, we arrive at:
$$
c = \frac{1}{|C|} \sum_{x \in C} x
$$
**The Physics Translation:**
Physically, this calculus result has a wonderful interpretation. If you think of each data point as pulling on the representative point $c$ with a force proportional to their distance (like a collection of rubber bands), the derivative $\frac{\partial J}{\partial c}$ represents the net force acting on $c$. 

When the derivative is set to zero, it means the net force is zero—the exact coordinate where all the pulling forces from the data points perfectly balance out. In optimization, this balanced state is the minimum energy state. Therefore, taking the derivative of the SSE is simply the calculus way of finding this lowest-energy equilibrium point, proving that the centroid is physically and mathematically the ultimate center of mass for the group!
</callout>

It is crucial to note that the beautiful equivalence in the Centroid Identity comes with a strict condition: it only holds true in **Euclidean space** because the proof relies specifically on the algebraic properties of squared Euclidean distance. Therefore, you cannot simply swap in other distance metrics (like Manhattan or raw Cosine distance) and expect this mathematical magic to work.

<callout>
icon: idea
style: regular
title: A Clever Workaround for Embedding Clustering
content:
Although we mentioned that we should not expect K-Means to work with raw Cosine distance, there is fortunately a very practical workaround for modern machine learning embeddings. If you apply L2 normalization to your data (turning them into unit vectors), the squared Euclidean distance becomes inversely proportional to Cosine similarity. This means you can perfectly cluster text or image embeddings based on their angles using K-Means, simply by normalizing the vectors first!
</callout>

## 2. The Optimization Process: Global SSE and Lloyd's Algorithm

In Section 1, we established that evaluating the $SSE$ to the centroid is the mathematically perfect way to measure the compactness of a single cluster. 

But a clustering algorithm doesn't just evaluate one isolated group—it evaluates the entire dataset partitioned into $K$ clusters. Therefore, we simply generalize this goal into the global objective of K-Means, which is to minimize the total Sum of Squared Errors across all $K$ clusters simultaneously:

$$
\mathrm{Global\ SSE} = \sum_{i=1}^{K} \sum_{x \in C_i} \lVert x - \mu_i \rVert^2
$$

### Solving the Chicken-and-Egg Problem
To minimize this Global SSE, we immediately run into a logical roadblock—a circular dependency:
- To find the centroids ($\mu_i$) of a cluster ($C_i$), we need to know which points belong to it.
- But to assign points to the correct clusters ($C_i$), we need to know where the centroids ($\mu_i$) are!

To solve this issue, K-Means uses **Lloyd's algorithm**, which breaks the problem down by repeatedly fixing one half of the equation while solving the other:

1. **Initialize:** Randomly place $K$ centroids in the space.
2. **Assign (Fix Centers):** Assuming the centers are perfectly placed, assign each point to its nearest centroid. Because points greedily join the cluster that offers the smallest squared distance, this step mathematically minimizes the overall SSE based on the current centers.
3. **Update (Fix Assignments):** Assuming the cluster assignments are locked in, recompute each centroid as the arithmetic mean of its newly assigned points. As we explored earlier, moving the reference point to the true mean restores the "equilibrium," guaranteeing the lowest possible SSE for those specific points.
4. **Repeat:** Alternate between Step 2 and Step 3 until the assignments stop changing.

This alternating structure is the core reason K-Means is so effective. Because every single step—whether assigning points or updating centers—mathematically reduces or at worst maintains the Global $SSE$, the algorithm is strictly monotonic and is guaranteed to converge. It elegantly breaks an infinitely complex optimization problem into two simple, actionable steps.

However, it is important to note that this is a *greedy* approach. Because it optimizes step-by-step based on the immediate best choice, **K-Means is only guaranteed to find a local optimum, not the global optimum**. Depending on where the initial centroids are placed, K-Means may converge to a state where the total SSE is significantly higher than the true mathematical minimum.

## 3. Implementation Details: Initialization and Choosing $K$

Because Lloyd's algorithm only guarantees convergence to a *local* minimum, not necessarily the *global* optimum, practical implementation details become extremely crucial to the actual success of K-Means.

### The Centroid Initialization Problem
As we established, K-Means uses a greedy approach to optimize the Global $SSE$. This means the algorithm only makes the best immediate choice at any given moment (assign to the nearest center, move center to the exact mean) without considering the long-term impact of that choice. More importantly, it never backtracks. 

Because of this greedy nature, the initial placement of your centroids dictates the entire trajectory of the algorithm. If you start with bad initial centroids—for instance, placing two starting centroids perfectly inside the same natural cluster—the algorithm will simply optimize locally based on that bad start. It will permanently split that natural group in half and will never realize its mistake.

Unfortunately, it is almost impossible to know where the "good" centroids are before running the algorithm (otherwise, you wouldn't need to cluster in the first place!). The most common workaround is simply to **run the algorithm multiple times with different random starting points**. Because different initial seeds change the trajectory, they will yield different final clusterings. Therefore, practitioners often run it 10 or 20 times and simply keep the result that achieved the lowest final $SSE$.

### The $K$ Problem
The optimization math of K-Means is beautifully clean, but it only works *after* $K$, the number of clusters, is fixed. In reality, $K$ is rarely known in advance, and this rigidity is one of the algorithm's biggest challenges.

To understand why choosing $K$ is so critical, we have to look at two fundamental behaviors of K-Means:
1. **It is rigid:** The algorithm cannot dynamically adjust the number of clusters. It will strictly create exactly $K$ clusters, no more, no less.
2. **It is complete and exhaustive:** Every single data point *must* be assigned to one of these $K$ clusters. The algorithm will forcibly match a point to a cluster even if the point is an extreme outlier that doesn't truly belong anywhere.

Because of these behaviors, if your $K$ is wrong, the entire clustering structure falls apart:
- **If $K$ is too small:** The algorithm is forced to merge distinct, fundamentally different natural groups into a single massive cluster just to keep the total count down.
- **If $K$ is too large:** The algorithm is forced to artificially fracture natural, cohesive groups into multiple smaller pieces to meet the quota.

Therefore, the value of $K$ ultimately dictates the quality of your clustering results. To put it simply: **The value of $K$ sets the absolute ceiling and upper bound of your clustering performance, while the initial centroid placement determines whether your specific run actually has the chance to reach that ceiling.**

Furthermore, you cannot simply test different $K$ values and pick the one with the lowest $SSE$. Mathematically, as $K$ increases, $SSE$ will *always* decrease. To make it clearer, let's look at an extreme case, where you have $N$ points and set $K=N$. In this case, every point becomes its own cluster, and the $SSE$ drops perfectly to zero—but that is completely useless for finding patterns!

So, how do we actually choose $K$? Because K-Means cannot answer this on its own, determining $K$ remains a practical blend of statistical heuristics, mathematical evaluation, and human judgment:
- **Prior Knowledge & Business Logic:** In many real-world scenarios, the problem context itself dictates the number of clusters. For example, if a business wants to segment its customer base into Basic, Pro, and Enterprise tiers for marketing, $K$ is fixed at 3 by design. Domain constraints or physical limitations, such as deciding where to place exactly 5 regional warehouses, often provide the most reliable $K$ right out of the gate.
- **Quantitative Evaluation Metrics & Heuristics:** Instead of relying purely on guesswork, we can mathematically or visually score the clustering quality across different $K$ values using internal validation methods:
    - **The Elbow Method:** As a visual heuristic, we run K-Means across a range of $K$ values, such as from $K=1$ to $10$, and plot the total $Global\ SSE$ against each $K$. As $K$ increases, SSE will always drop. However, the graph typically forms an "elbow" shape—a sharp bend where adding more clusters yields rapidly diminishing returns in reducing error. The point right at this bend suggests the optimal $K$, representing the sweet spot before we start splitting natural groups into artificial fragments.
    - **Silhouette Score:** Measures how similar a data point is to its own cluster compared to other clusters, outputting a score between $-1$ and $+1$. A higher average score indicates that clusters are well-separated and dense.
    - **Davies-Bouldin Index:** Evaluates the similarity between each cluster and its most similar counterpart, factoring in both within-cluster scatter and between-cluster separation. A lower score means the clusters are compact and far apart from each other.
    If your Elbow graph is a smooth curve with no sharp bend, or if these metrics oscillate wildly without a clear peak, it usually signals a crucial reality: your data lacks distinct, discrete groups, meaning K-Means' spherical assumptions may be a poor fit for the dataset.
- **Over-Clustering and Manual Merging:** As an expert-in-the-loop strategy, a clever and highly pragmatic approach used by data scientists is to intentionally set $K$ slightly larger than expected. By over-clustering, you ensure that dense, natural groups are never awkwardly merged together. Once the algorithm finishes, a human domain expert reviews the resulting micro-clusters and manually combines adjacent groups that conceptually belong to the same category. This combines the speed of automated partitioning with the nuanced intelligence of human intuition.

## 4. Pros, Cons, and Geometric Assumptions

To truly understand when K-Means works and when it fails, we just need to look at what its objective function actually rewards. Because it is mathematically obsessed with minimizing the squared Euclidean distance to a single central point, K-Means is inherently biased toward a very specific geometric worldview.

**Where K-Means Shines:**
K-Means is incredibly fast, running in $O(N)$ complexity per iteration, conceptually simple, and highly interpretable. It works exceptionally well when your data natively matches its geometric assumptions:
- **Compact, roughly spherical groups:** Because it measures distance radially from a center, it loves neat, round blobs of data.
- **Similar scale and density:** It expects clusters to cover roughly the same amount of spatial volume.
- **Interpretability matters:** In applications like customer segmentation or image color quantization, the resulting centroids literally serve as readable "prototypes" or "average personas" for the group they represent.

**Where K-Means Breaks:**
K-Means does not fail randomly; it fails predictably the moment your data violates its strict geometric worldview. 

- **Irregular or non-convex shapes:** Imagine your data is shaped like a crescent moon, or a donut with a smaller circle inside it. A single centroid cannot accurately summarize a curved shape. Because K-Means draws rigid, straight-line Voronoi cell boundaries halfway between centroids, it will awkwardly slice these continuous shapes in half.
- **Different scales and densities:** Imagine a tight, dense cluster of 1,000 points right next to a wide, sparse cluster of 1,000 points. Because K-Means minimizes *squared* distance, points far away from a center incur a massive SSE penalty. To reduce this penalty, the algorithm will often steal data points from the wide cluster and assign them to the dense one, shifting the boundary in a way that feels highly unnatural to the human eye.
- **Outliers:** This is the Achilles' heel of using the arithmetic mean. Because distances are squared, an extreme outlier acts like a massive gravitational pull. Just a few outliers can drag the centroid far away from the actual dense mass of data, ruining the representative power of that center.

Ultimately, if the underlying structure of your data relies on *connectivity* (like a chain of points linking together) rather than *central tendency* (gathering around a hub), K-Means will stubbornly ignore that structure and force the data into rigid, spherical boxes anyway.

## 5. The K-Means Family: Beyond the Vanilla Algorithm

Once we deeply understand the core logic of K-Means—and the specific scenarios where it struggles—it becomes straightforward to appreciate the family of advanced algorithms built on top of it. While they all share the same underlying center-based philosophy, each variant introduces clear modifications to tackle distinct challenges, address specific limitations, or target different operational goals:

- **K-Means++:** As demonstrated in the previous section, standard K-Means is prone to getting trapped in poor local minima due to arbitrary initialization. K-Means++ directly addresses this vulnerability with a smarter, probabilistic initialization mechanism. After selecting the first cluster center at random, it intentionally chooses subsequent centers that are as far away as possible from those already established. This ensures that the initial centers are evenly distributed across natural data clusters, significantly reducing the risk of poor convergence.
- **K-Medoids:** Another primary drawback of K-Means is its sensitivity to outliers. To mitigate this, K-Medoids forces each representative center to be an actual, existing data point within the dataset—known as a medoid—rather than a computed mean. This approach drastically enhances robustness against noise and extreme values, while enabling the algorithm to handle categorical data and custom distance metrics where calculating a mathematical mean is impossible.
- **X-Means:** As previously mentioned, standard K-Means is highly sensitive to the initial choice of $K$. To automatically determine the optimal number of clusters, X-Means begins with a small value of $K$ (often $K=1$) and recursively evaluates each cluster. It uses statistical metrics—such as the Bayesian Information Criterion (BIC) or Akaike Information Criterion (AIC)—to dynamically test whether splitting a cluster into two improves the overall model fit without over-fitting. This process continues iteratively until splitting no longer yields a statistically significant improvement or a predefined maximum $K$ is reached.
- **Mini-Batch K-Means:** To address the scalability limits of standard K-Means (Lloyd's algorithm)—which becomes computationally prohibitive on web-scale datasets—Mini-Batch K-Means updates centroids using small, random subsets (batches) of data instead of the entire dataset per iteration. It uses a stochastic gradient descent-like mechanism with a step-size (learning rate) to incrementally adjust centroids. While it sacrifices a slight amount of clustering precision (often producing slightly higher inertia), it achieves a massive speedup, reduces memory usage to $O(B)$ where $B$ is the batch size, and often converges orders of magnitude faster.
- **RQ-KMeans:** RQ-KMeans is an advanced quantization technique designed for high-dimensional vector search and extreme memory compression. It hierarchically decomposes data points by recursively applying K-Means to the residual vectors of each stage. This hierarchical approach accurately captures fine-grained data distributions while keeping memory footprint to a minimum. As a core algorithm in modern vector databases like FAISS and Milvus, RQ-KMeans facilitates sub-linear ANN retrieval across billion-scale deep learning embeddings.

## Summary

K-Means is a foundational algorithm because it takes our intuitive visual desire to find "tight, compact groups" and translates it into a rigorous, solvable mathematical optimization problem: minimizing the within-cluster squared distance to representative centers. 

That single objective function ($SSE$) explains the entire behavior of the algorithm. It explains why we use the arithmetic mean (because calculus proves it is the ultimate SSE minimizer). It explains why Lloyd's algorithm ping-pongs between fixing assignments and fixing centers. It explains why the algorithm is a greedy prisoner to its initial starting points. Most importantly, it explains why K-Means stubbornly assumes every cluster in the world is a neat, similarly-sized, compact sphere. 

If your data fits that geometric assumption, K-Means is a lightning-fast, highly interpretable powerhouse. If it doesn't, K-Means will still give you an answer—but it will be the wrong one. However, by understanding *why* the math forced K-Means to fail, you gain the exact insight needed to choose the right advanced variant or switch to a density-based algorithm instead.

<takeaways>
- **The Pairwise Shortcut:** K-Means avoids the computational nightmare of $O(N^2)$ point-to-point distance calculations by summarizing clusters with a centroid, reducing the cost to $O(N)$.
- **The Centroid Identity:** We don't lose the true essence of clustering by doing this. The math proves that minimizing the distance to the centroid is strictly mathematically equivalent to minimizing the pairwise distances between all points in the cluster.
- **The Optimization Goal:** The algorithm's ultimate purpose is to minimize the Global Sum of Squared Errors ($SSE$).
- **Why the Mean:** The arithmetic mean is not an arbitrary choice; it is the exact mathematical minimizer for squared Euclidean distance.
- **Lloyd's Algorithm:** It resolves the chicken-and-egg problem by alternating between assigning points to the nearest center and updating the centers to the mean of those points. It is greedy and only guarantees convergence to a local minimum.
- **The $K$ Ceiling:** The number of clusters ($K$) dictates the maximum possible quality of the grouping, while the initialization dictates if we reach it. Both require human guidance (e.g., Elbow Method, K-Means++).
- **Geometric Bias:** Because it optimizes squared distance to a center, K-Means strongly assumes clusters are spherical, similarly sized, and free of massive outliers.
</takeaways>

## References
1. NUS CS5228 Knowledge Discovery and Data Mining Course Materials
2. NUS CS5246 Text Mining Course Materials