<meta>
Title: K-Means: Clustering Around Centers
CanonicalId: k-means-clustering-around-centers
Tags: Data Mining, Clustering, Centroid-Based Clustering
Summary: An intuition-first note on K-Means, from center-based compactness and centroids to Lloyd's algorithm, limitations, and practical use.
Slug: k-means-clustering-around-centers-en
Output: notes/k-means-clustering-around-centers/k-means-clustering-around-centers-en.html
Style: default
EstimatedReadingTime: true
Lang: en
TitleSuffix: false
Status: drafting
Published: 2026-07-31
LastModified: 2026-07-31
</meta>

As we explored in <content-link canonical="discovering-hidden-structures-what-clustering-really-does">Discovering Hidden Structures: What Clustering Really Does</content-link>, clustering is fundamentally about grouping objects together based on a chosen perspective of **similarity**. Depending on their core mechanisms, clustering algorithms generally fall into three main categories: centroid-based, density-based, and hierarchical clustering. 

In this note, we will explore K-Means, one of the most classic centroid-based algorithms. As its category suggests, K-Means uses a central point (a **centroid**) to represent an entire cluster, and assigns data points to these clusters based on their distance to these representatives. A good clustering is one that minimizes the total distance between data points and their assigned representatives, resulting in compact clusters whose members lie closely around their centers.

However, this leads to a series of deeper questions: First, why do we specifically use the *centroid* (the arithmetic mean) as the representative point? Furthermore, even if we agree that the centroid is the ideal choice, how do we actually compute it? After all, calculating a cluster's centroid requires knowing which data points belong to that cluster. Yet, in unlabeled data, cluster memberships are precisely the unknowns we are trying to discover! How do we resolve this fundamental chicken-and-egg problem where optimal centroids depend on assignments we don't yet have? Beyond this core algorithmic challenge, what practical details must we pay attention to during implementation? When is K-Means the right tool for the job, and when is it destined to fail? Finally, are there related variants we can turn to for different outcomes?

In the following sections, we will delve into these questions one by one.

## 1. The Pairwise Problem and the Algebraic Miracle

In the previous section, we mentioned that a good cluster is one where its members lie closely around their center. But wait—if the true goal of clustering is to ensure that data points are close to *each other*, shouldn't we directly measure the distance between the points themselves?

Intuitively, yes. To evaluate how compact a cluster is, the most rigorous approach is to compute the **Sum of Squared Pairwise Distances**. The reason why we use squared distance instead of regular distance here is because it heavily penalizes larger deviations (forcing points to gather tightly rather than spreading out) and makes algebraic manipulation—like the trick we are about to see—mathematically possible without dealing with ugly square roots. Therefore, we measure the distance between every point $x$ and every other point $y$ inside the cluster as follows:

$$
\text{Pairwise Compactness} = \sum_{x \in C} \sum_{y \in C} \lVert x - y \rVert^2
$$

However, this point-to-point comparison hits a massive wall in reality. If a cluster has $N$ points, calculating the distances between all of them requires $O(N^2)$ operations. As datasets grow to millions of records, this becomes practically impossible to compute.

Therefore, we need a shortcut, but at the same time, we don't want to compromise our core objective of "keeping points close to each other." But how?

### The Mathematical Revelation (Centroid Identity)
Luckily, it turns out we don't have to invent a new metric or "settle" for an approximation. If we look closely at the math behind the pairwise distances in Euclidean space, an elegant shortcut naturally falls out of the equation.

Through a pure algebraic trick (similar to completing the square), mathematicians proved a profound equivalence known as the **Centroid Identity** (or Huygens' Theorem). It states that the total pairwise squared distance within a cluster is mathematically tied to a single reference point: the **centroid** ($\mu$), which is the arithmetic mean of all points in the cluster.

The equivalence looks like this:

$$
\sum_{x \in C} \sum_{y \in C} \lVert x - y \rVert^2 = 2|C| \sum_{x \in C} \lVert x - \mu \rVert^2
$$

Let's break down this beautiful revelation:
- **The left side** is our original, computationally expensive goal: how close the points are to *each other*.
- **The right side** introduces a completely new calculation: how close every point is to the *centroid* $\mu$ (multiplied by a constant $2|C|$). 

This is not an approximation; it is an exact mathematical equals sign. It proves that **bringing every point closer to the centroid is mathematically the exact same thing as bringing every point closer to every other point.** This simplifies everything! We no longer need to compute the pairwise distances between all pairs of points to measure a cluster's compactness; we just need the distances between the points and their centroid. Furthermore, this tells us that if we can find a way to minimize the distance between all points and their centroid, it is strictly equivalent to bringing all pairs of points closer together, making the cluster as tight and compact as possible.

<details>
<summary><b>[Mathematical Proof] The Algebraic Derivation of the Centroid Identity</b></summary>
<p>
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
</p>
</details>

### Discovering the SSE
Now that we know we can easily use the distance between the data points and their centroids to measure compactness, we can define a new core metric: the **Sum of Squared Errors (`SSE`)**, calculated as $\sum \lVert x - \mu \rVert^2$. 

By optimizing this single metric, we achieve the exact same clustering objective (compactness) while drastically reducing the computational complexity from $O(N^2)$ down to just $O(N)$.

<callout>
icon: lightbulb
style: regular
title: The Calculus Perspective: Centroids as a State of Equilibrium
content:
Beyond the algebraic proof, we can also look at this through the lens of calculus and physics. If we define our objective cost function for a single cluster as finding a general representative point $c$ that minimizes the SSE:
$$
J(c) = \sum_{x \in C} \lVert x - c \rVert^2
$$
To find the optimal point $c$ that minimizes this energy, we take the derivative with respect to $c$ and set it to zero:
$$
\frac{\partial J}{\partial c} = -2\sum_{x \in C}(x - c) = 0 \implies \sum_{x \in C} x = |C|c \implies c = \frac{1}{|C|} \sum_{x \in C} x
$$
Physically, this means the centroid is the "center of mass" where all pulling forces from the data points balance out to zero. Taking the derivative of the SSE is simply the calculus way of finding this lowest-energy equilibrium point!
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

In Section 1, we established that evaluating the `SSE` to the centroid is the mathematically perfect way to measure the compactness of a single cluster. 

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

This alternating structure is the core reason K-Means is so effective. Because every single step (both assigning points and updating centers) mathematically reduces—or at worst, maintains—the Global `SSE`, the algorithm is strictly monotonic and is guaranteed to converge. It elegantly breaks an infinitely complex optimization problem into two simple, actionable steps.

However, it is important to note that this is a *greedy* approach. Because it optimizes step-by-step based on the immediate best choice, **K-Means is only guaranteed to find a local optimum, not the global optimum**. Depending on where the initial centroids are placed, K-Means may converge to a state where the total SSE is significantly higher than the true mathematical minimum.

## 3. Implementation Details: Initialization and Choosing $K$

Because Lloyd's algorithm only guarantees convergence to a *local* minimum, not necessarily the *global* optimum, practical implementation details become extremely crucial to the actual success of K-Means.

### The Centroid Initialization Problem
As we established, K-Means uses a greedy approach to optimize the Global `SSE`. This means the algorithm only makes the best immediate choice at any given moment (assign to the nearest center, move center to the exact mean) without considering the long-term impact of that choice. More importantly, it never backtracks. 

Because of this greedy nature, the initial placement of your centroids dictates the entire trajectory of the algorithm. If you start with bad initial centroids—for instance, placing two starting centroids perfectly inside the same natural cluster—the algorithm will simply optimize locally based on that bad start. It will permanently split that natural group in half and will never realize its mistake.

Unfortunately, it is almost impossible to know where the "good" centroids are before running the algorithm (otherwise, you wouldn't need to cluster in the first place!). The most common workaround is simply to **run the algorithm multiple times with different random starting points**. Because different initial seeds change the trajectory, they will yield different final clusterings. Practitioners run it 10 or 20 times and simply keep the result that achieved the lowest final `SSE`.

### The $K$ Problem
The optimization math of K-Means is beautifully clean, but it only works *after* $K$ (the number of clusters) is fixed. In reality, $K$ is rarely known in advance, and this rigidity is one of the algorithm's biggest challenges.

To understand why choosing $K$ is so critical, we have to look at two fundamental behaviors of K-Means:
1. **It is rigid:** The algorithm cannot dynamically adjust the number of clusters. It will strictly create exactly $K$ clusters, no more, no less.
2. **It is complete (exhaustive):** Every single data point *must* be assigned to one of these $K$ clusters. The algorithm will forcibly match a point to a cluster even if the point is an extreme outlier that doesn't truly belong anywhere.

Because of these behaviors, if your $K$ is wrong, the entire clustering structure falls apart:
- **If $K$ is too small:** The algorithm is forced to merge distinct, fundamentally different natural groups into a single massive cluster just to keep the total count down.
- **If $K$ is too large:** The algorithm is forced to artificially fracture natural, cohesive groups into multiple smaller pieces to meet the quota.

You can think of it this way: **The value of $K$ determines the absolute ceiling (upper bound) of your clustering quality, while the initial centroid placement determines whether your specific run actually reaches that ceiling.**

Furthermore, you cannot simply test different $K$ values and pick the one with the lowest `SSE`. Mathematically, as $K$ increases, `SSE` will *always* decrease. If you have $N$ points and set $K=N$, every point becomes its own cluster, and the `SSE` drops perfectly to zero—but that is completely useless for finding patterns!

So, how do we actually choose $K$? It remains a mix of statistical heuristics and human judgment:
- **Prior Knowledge:** Sometimes the business logic dictates $K$ (e.g., "We need exactly 3 subscription tiers: Basic, Pro, Enterprise").
- **Evaluation Metrics:** We can use methods that balance compactness with separation. The **Elbow Method** looks for the point where adding another cluster yields diminishing returns in dropping the SSE. The **Silhouette Score** measures how similar an object is to its own cluster compared to other clusters. The **Davies-Bouldin Index** evaluates the ratio of within-cluster scatter to between-cluster separation.
- **Over-clustering and Manual Merging:** A practical trick is to intentionally set a slightly larger $K$ to ensure no natural groups are accidentally merged. After the algorithm finishes, a human domain expert can manually combine clusters that conceptually belong together.

## 4. Pros, Cons, and Geometric Assumptions

To truly understand when K-Means works and when it fails, we just need to look at what its objective function actually rewards. Because it is mathematically obsessed with minimizing the squared Euclidean distance to a single central point, K-Means is inherently biased toward a very specific geometric worldview.

**Where K-Means Shines:**
K-Means is incredibly fast ($O(N)$ complexity per iteration), conceptually simple, and highly interpretable. It works exceptionally well when your data natively matches its geometric assumptions:
- **Compact, roughly spherical groups:** Because it measures distance radially from a center, it loves neat, round blobs of data.
- **Similar scale and density:** It expects clusters to cover roughly the same amount of spatial volume.
- **Interpretability matters:** In applications like customer segmentation or image color quantization, the resulting centroids literally serve as readable "prototypes" or "average personas" for the group they represent.

**Where K-Means Breaks:**
K-Means does not fail randomly; it fails predictably the moment your data violates its strict geometric worldview. 

- **Irregular or non-convex shapes:** Imagine your data is shaped like a crescent moon, or a donut with a smaller circle inside it. A single centroid cannot accurately summarize a curved shape. Because K-Means draws rigid, straight-line boundaries (Voronoi cells) halfway between centroids, it will awkwardly slice these continuous shapes in half.
- **Different scales and densities:** Imagine a tight, dense cluster of 1,000 points right next to a wide, sparse cluster of 1,000 points. Because K-Means minimizes *squared* distance, points far away from a center incur a massive SSE penalty. To reduce this penalty, the algorithm will often steal data points from the wide cluster and assign them to the dense one, shifting the boundary in a way that feels highly unnatural to the human eye.
- **Outliers:** This is the Achilles' heel of using the arithmetic mean. Because distances are squared, an extreme outlier acts like a massive gravitational pull. Just a few outliers can drag the centroid far away from the actual dense mass of data, ruining the representative power of that center.

Ultimately, if the underlying structure of your data relies on *connectivity* (like a chain of points linking together) rather than *central tendency* (gathering around a hub), K-Means will stubbornly ignore that structure and force the data into rigid, spherical boxes anyway.

## 5. The K-Means Family: Beyond the Vanilla Algorithm

Once we deeply understand the core logic of K-Means—and exactly why it sometimes fails—it becomes very easy to understand the family of advanced algorithms built on top of it. They all share the same center-based philosophy, but they introduce clever tweaks to patch the specific weaknesses we just discussed:

- **K-Means++ (Fixing Initialization):** As mentioned in Section 3, vanilla K-Means is blind when picking initial centers. K-Means++ introduces a smarter, probabilistic initialization step. It picks the first center randomly, but then intentionally chooses subsequent centers that are as far away as possible from the already chosen ones. This practically guarantees the centers are well spread out across different natural groups, drastically reducing the chance of poor convergence.
- **K-Medoids (Fixing Outlier Sensitivity):** Instead of computing an artificial arithmetic mean (which gets dragged by outliers), K-Medoids forces the representative center to be an *actual, existing data point* (the medoid). This makes the algorithm vastly more robust to noise and extreme outliers. It also allows the algorithm to work with categorical data or custom distance metrics where calculating a mathematical "mean" is impossible.
- **X-Means (Fixing the $K$ Problem):** This variant attempts to automate the painful process of guessing $K$. It starts with a small number of clusters and uses statistical tests (like the Bayesian Information Criterion) to dynamically decide whether a cluster should be split into two. 
- **Mini-Batch K-Means (Fixing Scale):** For massive, web-scale datasets, running Lloyd's algorithm on every single point is too slow. This tweak processes small, random subsets (batches) of data at a time to update the centroids. It sacrifices a tiny bit of precision for a massive speed boost in convergence.
- **RK-Means (Robust K-Means):** This variant specifically modifies the objective function and adds weighting schemes to ensure that noisy data points and extreme outliers are heavily discounted, preventing them from ruining the centroid updates.
- **RQ-KMeans (Residual Quantization):** Pushes the center-based idea toward data compression and deep learning. Instead of just clustering once, it clusters the data, measures the error (the residual distance from the point to the centroid), and then runs K-Means *again* on those residuals. It is heavily used in vector databases for fast similarity search.

## Summary

K-Means is a foundational algorithm because it takes our intuitive visual desire to find "tight, compact groups" and translates it into a rigorous, solvable mathematical optimization problem: minimizing the within-cluster squared distance to representative centers. 

That single objective function (`SSE`) explains the entire behavior of the algorithm. It explains why we use the arithmetic mean (because calculus proves it is the ultimate SSE minimizer). It explains why Lloyd's algorithm ping-pongs between fixing assignments and fixing centers. It explains why the algorithm is a greedy prisoner to its initial starting points. Most importantly, it explains why K-Means stubbornly assumes every cluster in the world is a neat, similarly-sized, compact sphere. 

If your data fits that geometric assumption, K-Means is a lightning-fast, highly interpretable powerhouse. If it doesn't, K-Means will still give you an answer—but it will be the wrong one. However, by understanding *why* the math forced K-Means to fail, you gain the exact insight needed to choose the right advanced variant or switch to a density-based algorithm instead.

<takeaways>
- **The Pairwise Shortcut:** K-Means avoids the computational nightmare of $O(N^2)$ point-to-point distance calculations by summarizing clusters with a centroid, reducing the cost to $O(N)$.
- **The Centroid Identity:** We don't lose the true essence of clustering by doing this. The math proves that minimizing the distance to the centroid is strictly mathematically equivalent to minimizing the pairwise distances between all points in the cluster.
- **The Optimization Goal:** The algorithm's ultimate purpose is to minimize the Global Sum of Squared Errors (`SSE`).
- **Why the Mean:** The arithmetic mean is not an arbitrary choice; it is the exact mathematical minimizer for squared Euclidean distance.
- **Lloyd's Algorithm:** It resolves the chicken-and-egg problem by alternating between assigning points to the nearest center and updating the centers to the mean of those points. It is greedy and only guarantees convergence to a local minimum.
- **The $K$ Ceiling:** The number of clusters ($K$) dictates the maximum possible quality of the grouping, while the initialization dictates if we reach it. Both require human guidance (e.g., Elbow Method, K-Means++).
- **Geometric Bias:** Because it optimizes squared distance to a center, K-Means strongly assumes clusters are spherical, similarly sized, and free of massive outliers.
</takeaways>