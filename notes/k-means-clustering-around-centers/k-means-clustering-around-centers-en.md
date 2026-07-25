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
</meta>

<draft>
TLDR: This note explains K-Means as a center-based way of turning the idea of a compact cluster into an optimization problem.
MainFlow: Start from the intuition of tight groups, derive why centroids and SSE appear naturally, walk through Lloyd's algorithm, then show where K-Means works, where it breaks, and how practitioners patch its weaknesses.
Scope: K-Means intuition; SSE and centroids; Lloyd's algorithm; initialization; limitations; variants; when to use it.
OutOfScope: DBSCAN, hierarchical clustering, AGNES, DIANA, and broad clustering-family comparison beyond what is needed for local context.
FollowUps: Comparison note with DBSCAN; possible later note on K-Means++ and model selection for choosing K.
</draft>

# K-Means: Clustering Around Centers

In the overview note on clustering, the main point was that clustering only becomes meaningful after we decide how objects are represented, what similarity means, and what kind of structure we think the data contains. K-Means is the natural next step because it is one of the clearest examples of a center-based view of clustering. It assumes that a good cluster is a compact group organized around a representative center.

That makes K-Means a useful method to study even beyond its practical popularity. It shows how a geometric intuition can be turned into a concrete optimization problem. If a cluster is supposed to be a tight group of points around a center, then we can ask a sharper question: how should we place those centers, and how should we assign points to them, so that each group stays as compact as possible?

This framing matters because K-Means is often described too casually as "grouping points by closeness." That description is not exactly wrong, but it is incomplete. K-Means is not just following local closeness in an ad hoc way. It is optimizing a specific notion of within-cluster compactness, and that objective explains both why the algorithm is so simple and why it breaks in predictable ways.

## Article Compass

- Focus: understand K-Means as a center-based clustering method rather than as a vague nearest-neighbor heuristic.
- Main flow: connect K-Means back to the center-based clustering view introduced in the overview, derive the objective function, see why the centroid is the mean, walk through Lloyd's algorithm, then examine where the method works and where it does not.
- Out of scope: this note does not try to survey all clustering families or fully compare K-Means with DBSCAN and hierarchical clustering.

## Why K-Means Is Worth Learning

K-Means matters for two reasons. First, it gives a clean example of how an intuitive geometric idea can be turned into an optimization objective. Second, even when it is not the final method you deploy, it often serves as a useful baseline because it is fast, easy to implement, and easy to interpret.

It also teaches an important modeling lesson: every algorithm quietly carries a worldview about what data should look like. In K-Means, that worldview is simple. A good cluster is one that can be summarized by a representative center, and the points in that cluster should remain close to that center.

Once you see that assumption clearly, the rest of the method becomes much easier to understand.

## The Core Assumption: Clusters Are Organized Around Centers

Imagine looking at a scatter plot and saying that one region "looks like a cluster." Usually what you mean is not just that the points are near each other. You also mean that the group feels internally coherent, almost as if it has a middle that the points gather around.

K-Means formalizes exactly that intuition.

- Each cluster is represented by a center.
- Each point belongs to the cluster whose center is closest.
- A clustering is better when points stay closer to their own centers.

This is why K-Means is a center-based method. It does not try to discover arbitrary shapes. It does not care about connectivity chains or density plateaus. It asks a narrower question: if the world really consists of `K` compact groups with meaningful centers, how do we recover them?

That question naturally leads to an objective function.

## From Intuition to Objective: Why SSE Appears

If compactness is the goal, we need a way to measure how spread out each cluster is. The standard K-Means objective is the sum of squared errors, usually abbreviated as `SSE`:

$$
\mathrm{SSE} = \sum_{i=1}^{K} \sum_{x \in C_i} \lVert x - \mu_i \rVert^2
$$

Here:

- `K` is the number of clusters.
- `C_i` is the set of points assigned to cluster `i`.
- `\mu_i` is the center of cluster `i`.
- `\lVert x - \mu_i \rVert^2` is the squared Euclidean distance between point `x` and the cluster center.

This objective says: for each cluster, measure how far every point is from that cluster's center, square those distances, and add everything up. Lower `SSE` means the points sit more tightly around their centers, so lower is better.

Why squared distance instead of plain distance?

- It penalizes far-away points more strongly, which makes scattered clusters look worse than compact ones.
- It leads to a mathematically convenient objective whose best center is the mean.
- It matches the geometry K-Means is built around: compact, roughly spherical groups under Euclidean distance.

So the algorithm is not simply saying "put nearby things together." It is saying "find a partition and a set of centers that minimize within-cluster squared deviation."

## Why the Mean Appears Naturally

At this point a natural objection appears: why does the cluster center have to be the mean? Why not choose any point near the middle, or even require the center to be an actual observed data point?

The answer comes directly from the squared-distance objective. If the cluster assignments are fixed, then the best center for a cluster is the point that minimizes the total squared distance to all points in that cluster. That minimizer is the arithmetic mean:

$$
\mu_i = \frac{1}{|C_i|} \sum_{x \in C_i} x
$$

This is the reason the centroid keeps being recomputed as an average during the algorithm. It is not an arbitrary design choice. It is the direct consequence of optimizing squared error.

That also explains an important detail: the centroid does not need to be one of the original data points. It is a derived representative point, not necessarily an observed example. If you want the representative to be an actual member of the dataset, you are already moving toward a different method such as K-Medoids.

This is the payoff sentence for the whole method:

K-Means is really mean-based partitioning under squared distance.

Once that sentence is clear, the algorithm becomes much less mysterious.

## How Lloyd's Algorithm Optimizes K-Means

The most common procedure for K-Means is Lloyd's algorithm. It alternates between two simple operations: assign points to centers, then update centers from assigned points.

1. Choose the number of clusters `K`.
2. Initialize `K` centroids.
3. Assign each point to its nearest centroid.
4. Recompute each centroid as the mean of the points currently assigned to it.
5. Repeat the assignment and update steps until the assignments stop changing, or until `SSE` no longer meaningfully improves.

This alternating structure is the core reason K-Means feels so simple in practice. Each step is easy to explain:

- In the assignment step, if the centers are fixed, the best thing you can do is assign each point to the nearest one.
- In the update step, if the assignments are fixed, the best thing you can do is replace each center with the mean of its assigned points.

Each step improves the objective or leaves it unchanged, so `SSE` never increases across iterations. That monotonic improvement gives the method a stable feel: every iteration makes the clustering at least as good as before under its own objective.

But there is an important caveat. Convergence does not mean global optimality. Lloyd's algorithm can get stuck in a local minimum, which is why two runs on the same dataset can produce different answers.

## A More Concrete Intuition for the Alternation

It helps to think of Lloyd's algorithm as repeatedly fixing one half of the problem while solving the other half.

- If the centers are already chosen, the partition problem becomes easy: every point simply joins the closest center.
- If the memberships are already chosen, the center problem becomes easy: every cluster center simply becomes the mean of its members.

The hard part is that these two decisions depend on each other. Membership depends on centers, and centers depend on membership. Lloyd's algorithm handles that circular dependence by alternating between them until the solution stabilizes.

This is also why the method is efficient but not omniscient. It solves each subproblem greedily and cleanly, but it does not search the entire space of all possible partitions.

## Initialization Matters More Than People First Expect

Because Lloyd's algorithm only guarantees convergence to a local minimum, initialization is not a minor implementation detail. It is part of the method's practical behavior.

Bad initial centroids can cause several problems:

- the algorithm may converge to a poor local minimum
- different runs may yield noticeably different clusterings
- one centroid may end up with very few points while another absorbs too many
- some implementations may even face empty clusters during updates

These outcomes are not just accidental bugs. They reflect the fact that the optimization surface is sensitive to where the search begins.

This is why practitioners often run K-Means multiple times with different random seeds and keep the solution with the lowest final `SSE`. It is also why K-Means++ became so popular. K-Means++ uses a smarter initialization strategy that spreads initial centers apart, making it less likely that the algorithm starts from a clearly bad configuration.

K-Means++ improves a practical weakness, but it does not change the deeper modeling assumption. The method still expects center-based, compact structure.

## What K-Means Is Really Assuming About Data Geometry

A useful way to judge K-Means is to ask what sort of geometry its objective rewards.

It works best when clusters are:

- compact rather than elongated
- roughly spherical rather than highly irregular
- of somewhat similar scale rather than wildly different sizes
- separated enough that nearest-center assignments are meaningful

This is not a formal theorem you need to memorize. It is simply the geometric consequence of minimizing squared distance to centroids.

If a cluster is long and curved, one center is a poor summary. If one cluster is dense and tiny while another is broad and diffuse, the same squared-error objective may favor a partition that does not match the structure a human would expect. If extreme outliers are present, squared distance can let those few points pull the centroids around more than they should.

So the question is not "Is K-Means good or bad?" The better question is "Does my data actually look like something that centers can summarize well?"

## Where K-Means Works Well

K-Means is a strong fit when you want a fast, interpretable partition of data that is plausibly organized around representative centers.

Typical good-fit scenarios include:

- customer segmentation after careful feature scaling and selection
- vector quantization or compression-like tasks where prototypes matter
- image or signal processing contexts where a small number of representative patterns is useful
- quick baseline exploration when you suspect compact groups and need something simple before moving to more specialized methods

In these settings, K-Means is attractive because it offers a clean summary. Each cluster comes with a centroid, and that centroid often gives a readable "prototype" for the cluster.

This interpretability is one of the method's real strengths. The centroid is not just a computational artifact. In many applications, it becomes a compact description of the group.

## Where K-Means Breaks

K-Means does not fail randomly. It fails when the geometry of the data violates the worldview baked into the objective.

Common failure modes include:

- irregular or non-convex shapes
- clusters with very different densities
- clusters with very different sizes
- heavy noise or strong outliers
- features measured on incompatible scales
- a poor choice of `K`

Each of these is easy to connect back to the method's assumptions.

If clusters are crescent-shaped or connected by thin bridges, a single centroid is the wrong summary. If one feature is measured in dollars and another in percentages, Euclidean distance may mostly reflect the larger-scale feature unless you scale first. If outliers are far away, squared distance can let them dominate the objective more than their importance deserves.

This is why K-Means should be read as a modeling statement, not just an algorithmic trick. It encodes a very particular notion of what structure counts as a cluster.

## Choosing `K`: Necessary, Useful, and Awkward

One reason K-Means remains popular is that the optimization problem is clean once `K` is fixed. One reason it remains awkward is that `K` usually is not known in advance.

That creates a practical burden:

- if `K` is too small, distinct groups get merged
- if `K` is too large, natural groups get split into artificial fragments
- the resulting `SSE` always decreases as `K` grows, so lower error alone cannot tell you the right answer

In practice, choosing `K` often combines domain judgment with heuristics such as elbow-style inspection, validation metrics, or downstream usefulness. There is no universal rule that rescues you from understanding the problem context.

This is another reminder that K-Means is not a fully automatic cluster detector. It is a method for fitting a center-based partition under a user-chosen number of groups.

## Practical Patches and Variants

Several common variants try to improve the usability of K-Means without changing its underlying intuition.

- `K-Means++`: improves initialization so the algorithm starts from more sensible seeds.
- `X-Means`: extends the basic setup by trying to relax the burden of fixing `K` completely by hand.
- `K-Medoids`: replaces means with representative data points, which can improve robustness and interpretability in some settings.

These methods matter in practice, but they do not erase the central idea. They still live in the world where clusters are expected to organize around representative centers.

## Beyond Vanilla K-Means

It is also worth ending with a broader perspective: once the core K-Means idea is clear, many later methods can be read as attempts to adapt that center-based intuition to different practical constraints.

- `K-Medoids` keeps the center-based view but uses actual data points as representatives, which is often easier to interpret and usually less sensitive to extreme outliers.
- `X-Means` keeps the K-Means spirit while making the choice of `K` less rigid by allowing the model to expand the number of clusters more adaptively.
- `RK-means` is best understood as a family of more specialized extensions that modify the basic objective or weighting scheme so the method behaves better under more demanding settings.
- `RQ-Kmeans` pushes the center-based idea toward residual or quantization-oriented use cases, where the goal is not only clustering for interpretation but also efficient representation, coding, or large-scale retrieval.

These variants are useful reminders that K-Means is not just one fixed algorithm. It is a base idea that keeps reappearing in different forms. Some variants focus on robustness, some on model selection, and some on large-scale representation learning or compression. The common thread is still the same: data is being approximated through representative centers or codewords.

So for this note, the right stopping point is not "K-Means is the whole story." The better conclusion is that basic K-Means gives you the conceptual foundation, and those more advanced variants become easier to understand once that foundation is stable.

## When to Use It, and When Not To

Use K-Means when:

- you need a fast, simple baseline
- Euclidean geometry is meaningful after preprocessing
- cluster centers would be useful summaries in their own right
- you believe the data has compact center-based structure

Be cautious or look elsewhere when:

- the main signal is density or connectivity rather than central tendency
- clusters may be irregular, nested, or heavily noise-contaminated
- outliers are common and influential
- the correct number of clusters is deeply unclear and hard to justify

This framing is often more useful than memorizing a long list of pros and cons. It turns K-Means into a decision aid: use it when center-based compactness is a reasonable approximation of the world.

## Summary

K-Means is powerful because it converts a visual intuition about tight groups into a concrete objective: minimize within-cluster squared distance to representative centers. That objective explains why centroids are means, why Lloyd's algorithm alternates between assignment and update, why initialization matters, and why the method prefers compact, roughly spherical structure.

Its strength and weakness come from the same place. If the data is well described by centers, K-Means is hard to beat for simplicity, speed, and interpretability. If the data violates that assumption, the method will still produce clusters, but they may reflect the objective more than the structure you actually care about. And once the basic picture is clear, it is easier to see why later variants such as `K-Medoids`, `X-Means`, `RK-means`, and `RQ-Kmeans` keep emerging: they are all different ways of extending the same center-based logic toward robustness, flexibility, or scale.

<takeaways>
- K-Means is best understood as optimizing compactness around cluster centers, not merely grouping by vague closeness.
- The mean appears because it minimizes squared error within a fixed cluster.
- Lloyd's algorithm works by alternating between the best assignments for fixed centers and the best centers for fixed assignments.
- Initialization matters because the algorithm converges to a local minimum, not necessarily the global optimum.
- K-Means works well when clusters are compact and center-based, and breaks when the data geometry does not match that assumption.
- Many later variants can be understood as extensions of the same center-based idea, including `K-Medoids`, `X-Means`, `RK-means`, and `RQ-Kmeans`.
</takeaways>
