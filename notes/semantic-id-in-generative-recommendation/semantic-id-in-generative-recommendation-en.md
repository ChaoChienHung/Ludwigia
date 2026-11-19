<meta>
Title: Semantic IDs in Generative Recommendation: Design and Trade-offs in Item Tokenization
Summary: How Semantic IDs make generative recommendation and generative retrieval work: why atomic item IDs do not fit autoregressive generation, how residual quantization encodes an item vector as a coarse-to-fine sequence of discrete tokens, what shared prefixes give you, how end-to-end and two-stage tokenizers compare, and the practical issues of invalid IDs, decoding latency and ID collisions.
Slug: semantic-id-in-generative-recommendation-en
Output: notes/semantic-id-in-generative-recommendation/semantic-id-in-generative-recommendation-en.html
CanonicalId: semantic-id-in-generative-recommendation
Style: default
Cover: ./semantic-id-in-generative-recommendation.png
EstimatedReadingTime: true
Lang: en
Tags: recommendation systems, generative retrieval, semantic id, deep learning, tokenization
Status: drafting
Published: 2026-08-11
LastModified: 2026-11-20
</meta>

# Semantic IDs in Generative Recommendation: Design and Trade-offs in Item Tokenization

<image>
src: ./semantic-id-in-generative-recommendation.png
alt: Comparison of a traditional ID, an opaque random identifier, with a Semantic ID whose tokens carry structure derived from the item.
caption: Traditional IDs versus Semantic IDs.
</image>

In <content-link canonical="from-cascade-to-generative-recommendation-paradigm-shift">From Cascade Architectures to Generative Recommendation</content-link>, we looked at why recommender systems are moving toward a generative paradigm. Autoregressive generation does bring stronger sequence modeling and more expressive power, but an elegant formulation does not make deployment easy.

The first obstacle is basic: **how do you apply a generative model to an enormous item catalog?** A natural-language vocabulary is finite and fairly stable, while an item catalog keeps growing and changes every day. Because of this difference, a model cannot simply treat items the way it treats words. Unless the model can represent and generate items, the strength of the autoregressive architecture never comes into play.

This note looks at the abstraction that sits at the center of generative recommendation: the **Semantic ID**. We cover why the traditional item-ID scheme breaks down for large generative models, how Semantic IDs address the problem through quantization, and which issues, such as decoding latency and ranking items that share an ID, remain once the system goes into production.

## The Problem: Turning a Huge Item Catalog into Tokens

In natural language processing, a language model defines its vocabulary before training. It usually holds somewhere between 30,000 and 100,000 tokens; GPT-4's vocabulary, for example, has roughly 100,000. At each step, the final layer only needs to produce a probability distribution over this limited set.

A real e-commerce or content platform, however, has tens of millions or even hundreds of millions of candidate items. So what happens if we follow the old habit and **treat each item as its own token, the traditional atomic ID, and train the model on that?**

Two engineering limits show up right away:

1. **Softmax cost and memory blow up.**
     To predict the next token, an autoregressive model computes a softmax over every possible item ID in its final layer. With a vocabulary on the order of $10^7$, this <information concept="concept.gemm">matrix multiplication</information> consumes a huge amount of <information concept="concept.gpu">GPU</information> memory and bandwidth. It also makes the computation numerically fragile, and the model cannot finish inference within the tight latency budget of an online service, often around 50 ms.

2. **Catalog churn and the cold-start cliff.**
     A language model's vocabulary is fairly static: once training converges, the model keeps generalizing with it. An item catalog changes every day, and retraining the model or rebuilding the output layer for each batch of new items is slow and impractical. The deeper issue is that **an atomic ID is only a lookup key into an <information concept="concept.embedding">embedding</information> table; it carries no meaning of its own.** Item `10023` and item `10024` are two unrelated serial numbers, even if they are the same phone in two colors. When a new item arrives, it has no interaction history, and its new key shares nothing with existing IDs, so the model has no signal to work with. That is the cold-start failure.

So we cannot fit a large generative model into the traditional ID scheme; we need a different way to represent and encode items. The approach the industry has largely converged on is the **Semantic ID**.

## From Atomic IDs to Semantic Sequences

A good way into how Semantic IDs work is through an intuition that is often used to explain them but does not quite fit: the classification tree.

### Not a Classification Tree: Coarse-to-Fine Residual Approximation

People manage large collections with hierarchies. Biology classifies organisms as kingdom $\to$ phylum $\to$ class $\to$ order $\to$ family $\to$ genus $\to$ species, and postal codes narrow an address down from region to district to street. These examples share a useful idea: **instead of giving every entity its own code, you locate it with a combination of a few levels.** Many introductions to Semantic IDs borrow this analogy directly and say the first token is the category, the second a subcategory, and the third a finer subcategory.

On one key point, though, the analogy does not match the mainstream way of building Semantic IDs, residual quantization as used in RQ-VAE and RQ-Kmeans. In a classification tree, a child node is a semantic subset of its parent: the genus *Homo* exists only inside the family Hominidae, and a subcategory number means nothing once you move it under a different parent. Residual quantization works like this instead:

1. The first level searches the whole vector space for the code vector $e_1[c_1]$ closest to the item embedding $x$, and records its index $c_1$.
2. The remaining error $r_1 = x - e_1[c_1]$ goes to the second level, which picks the code vector $e_2[c_2]$ closest to $r_1$ from **a single codebook shared by all items**.
3. The third level repeats the same step on $r_2 = r_1 - e_2[c_2]$.

In the end, the item is approximated as a sum of code vectors:

$$ x \approx e_1[c_1] + e_2[c_2] + e_3[c_3] $$

The tokens after the first one therefore behave like offsets, or directional corrections, rather than subcategories of a category. A given $c_2$ stands for the same correction vector no matter which $c_1$ precedes it. Directions are a closer analogy: first you name the nearest landmark, then you add "two hundred meters northeast," then "ten more meters north." Each phrase corrects the error left by the one before, and "two hundred meters northeast" means the same thing whichever landmark it follows. You can also picture a painter who blocks in the outline with a few strokes and then adds layer after layer of corrections, each finer than the last.

Half of the classification-tree intuition does hold: the encoding is **coarse to fine**. Early tokens decide which broad region of the vector space an item falls into, later tokens make progressively smaller corrections, and more levels give a more precise approximation. The difference is that "coarse to fine" here describes approximation accuracy, not semantic containment. If you instead ran a separate K-means inside every parent cluster, hierarchical K-means, you would get a genuine classification tree. That is a different design choice; RQ-VAE and RQ-Kmeans, discussed later in this note, both use residual quantization with one shared codebook per level.

The shared codebooks are also why this representation compresses so well. The underlying principle is the **<information context="The rule of product is a basic principle of counting: if a choice can be split into M independent stages with K options each, the number of combinations is K^M. A small set of building blocks can therefore cover a very large space of combinations.">rule of product</information>**. To distinguish 1,000,000 items with 3 levels of 100 code vectors each, you only need to learn $100 + 100 + 100 = 300$ code vectors, yet they combine into $100^3 = 1,000,000$ distinct codes. A true classification tree would need a separate set of subcategories under every category, which brings the count to $100 + 100 \times 100 + 100^3$, far more than 300.

<callout>
title: Related Ideas: Hierarchical Softmax and First Principles
icon: diagram-project
content:
Hierarchical softmax tackles the same softmax cost problem with a similar idea: replace one decision over all classes with a few smaller decisions. It arranges the classes, or the vocabulary, into a tree, so a single expensive normalization over every class becomes a sequence of binary (or multi-way) choices along a path, and the cost drops from $O(N)$ to $O(\log N)$.

There are two differences. First, hierarchical softmax usually builds its tree from hand-crafted priors or statistics, such as a Huffman tree or a lexical hierarchy, whereas a Semantic ID tokenizer such as RQ-VAE learns its codebooks from data. Second, hierarchical softmax is a real tree, while a residual-quantized Semantic ID shares one codebook per level, so it approximates step by step rather than classifying step by step.

A related idea appears in <content-link canonical="first-principles-information-compression">First Principles: The Brain's Ultimate Information Compression</content-link>, which argues that finding the shared underlying logic behind different pieces of knowledge lets the brain compress far more information. Semantic IDs rest on a similar intuition.
</callout>

The core idea of Semantic IDs is to bring this kind of compositional representation into recommendation: **if we want a large model to recommend items, why not express every item as a short sequence built from a small set of shared tokens?**

The item code then follows a coarse-to-fine approximation. We no longer assign every item its own code, so the softmax cost stays bounded, and each item is assembled from a few shared code vectors. Each code in a Semantic ID is not an arbitrary serial number but a coarse-to-fine description of where the item sits in the vector space.

<callout>
title: Why Do Large Collections Always Have Something in Common?
content:
The rule of product only helps if a large set of entities actually shares common structure. Why can we count on that when the number of entities is huge?

Two reasons, one geometric and one behavioral:
1. **High-dimensional geometry and the <information concept="concept.law_of_large_numbers">law of large numbers</information>.** When items are described by many features, two of them are very unlikely to be completely unrelated. Across a large sample, the chance that entities share nothing at all approaches zero.
2. **Real-world regularities.** More importantly, real items and content are not generated at random. They come from similar human motivations and needs, so a large catalog naturally forms clusters with shared features.

The larger the catalog and the higher the dimension, the easier it is to find common structure, and that is what lets Semantic IDs compress so much information through the rule of product.
</callout>

### From Continuous Vectors to Discrete Token Sequences

To build a coarse-to-fine representation, the system first needs a good grasp of each item's features. Quantization only makes sense once the item's meaning has been captured. In practice, the conversion has two closely linked steps:

1. **Multimodal feature extraction (from item to meaning).** A pretrained model projects the item's title, description, images or video into a high-dimensional space, producing a dense embedding that captures what the item is.
2. **Residual quantization (from continuous to discrete).** A tokenizer then converts that embedding into a sequence of discrete tokens that a large model can work with, each token refining the approximation of the original vector:

$$ \text{Item } x \longrightarrow [c_1, c_2, \dots, c_M] $$

This length-$M$ sequence keeps most of the information in the original embedding, and each extra level makes the approximation a little more precise. Taking the common choice $M=3$:

* **Level 1, $c_1$ (coarse location).** Decides which broad region of the vector space the item falls into. Since embeddings of similar items already cluster together, this level often lines up reasonably well with product categories; consumer electronics, for example, tend to concentrate in a handful of $c_1$ values.
* **Level 2, $c_2$ (first correction).** Compensates for the error left by $c_1$ and moves the estimate closer to where the item actually lies. It is a correction direction shared by all items and does not necessarily map to a human-readable subcategory such as "laptops."
* **Level 3, $c_3$ (finer correction).** Shrinks the remaining error further and separates similar items that the first two levels could not tell apart.

At later levels the residual is smaller and closer to noise, and it usually maps less and less to anything human-readable. A given $c_2$ or $c_3$ should not be read as a specific attribute.

### Shared Prefixes

Because the early tokens fix an item's approximate location in the vector space, items with similar embeddings tend to share their leading tokens, a **shared prefix**.

Suppose an iPhone 15 Pro is quantized to the Semantic ID `[30, 14, 93]`. Its close relative, the iPhone 15 Pro Max, would likely share the first codes and end up as `[30, 14, 94]`: both fall in the same region and receive the same first correction, and they differ only in the final refinement. This lets us read off how similar two items are: **more similar items usually share a longer prefix.** The relationship is not guaranteed, though. Two very similar items that happen to sit near the boundary between two code vectors can be split at the very first level.

With the mapping and shared prefixes in view, the contrast with atomic IDs is clear: **an atomic ID is a random, independent key for a table lookup, while a Semantic ID is structure derived from a continuous vector.**

Because a Semantic ID is quantized from the item's semantic vector, each token corresponds to a code vector, and adding those code vectors back together approximately reconstructs the item's embedding. Items, like sentences, are composed from a shared set of basic units, which is why Semantic IDs are often described as a "language of items."

### Advantages of Semantic IDs

Turning items into token sequences removes the two limits above, and the coarse-to-fine structure and shared prefixes bring further benefits:

1. **Compact vocabulary through codebook reuse.**
     With a codebook size of $K=256$ per level, a 3-level Semantic ID needs an output vocabulary of only $3 \times 256 = 768$ tokens. This removes the <information concept="concept.oom">out-of-memory</information> pressure of a softmax over tens of millions of items. Yet those 768 tokens combine into $256^3 \approx 16.8$ million codes, enough to cover a large catalog.

2. **Transfer of collaborative signals and zero-shot cold start.**
     Under a traditional setup, a new item without interaction history is an island. With Semantic IDs, a new item only needs to go through quantization to land under an existing prefix $[c_1, c_2]$. The model has already learned which users prefer that prefix, so the collaborative signal accumulated there transfers to the new item, and the model can recommend it reasonably well even before it receives a single click.

3. **Prefix pruning with a trie and efficient retrieval.**
     Generative recommendation produces candidates through <information concept="concept.autoregressive">autoregressive</information> decoding. Coarse-to-fine prefixes turn the search space into a prefix <information concept="concept.trie">trie</information>. Decoding the first token already rules out most unrelated regions, and each further step narrows the space, which keeps generation over a catalog of millions of items tractable.

4. **Graceful degradation.**
     The model is often unsure about the finest details. With atomic IDs, a single wrong digit can turn a laptop into a dress. Semantic IDs are more forgiving: even if the last token $c_3$ is wrong, a correct prefix $[c_1, c_2]$ still places the generated code near the intended item, so the recommendation stays among closely related items instead of failing badly.

<callout>
title: What Makes Zero-Shot Cold Start Possible: Whether the Representation Carries Meaning
icon: lightbulb
content:
Whether zero-shot <information concept="concept.cold_start">cold start</information> can be mitigated depends on **whether the item representation carries meaning**:

- **Without meaning.** A new item is just an arbitrary number with no relationship to known items. The ID tells the model nothing, so the system has to wait for real interaction data to accumulate.
- **With meaning.** As long as the representation reflects real content, such as text, image features or semantic codes, similar items share structure. Even for an item it has never seen, the model can connect it to what it knows about related items.

In short, the ability to handle cold start does not come from a particular model architecture. It comes from **the presence of meaning, which lets the model transfer and generalize across items**. Semantic IDs inherit this property because they are built on a continuous semantic space.
</callout>

## Two Families of Semantic ID Tokenizers

The next question is how to actually turn a continuous item embedding into this coarse-to-fine sequence of discrete tokens.

In NLP, the component that turns text into model tokens is called a tokenizer. By analogy, the component in a generative recommender that turns an item embedding into a discrete token sequence is called an **item tokenizer**.

Item tokenizers in industry fall into two main families:

1. **End-to-end neural quantization (RQ-VAE).**
     Represented by Google's TIGER (NeurIPS 2023). An encoder, a stack of codebooks and a decoder are trained together, with the straight-through estimator (STE) passing gradients through the quantization step, so the network learns a latent space suited to the downstream recommendation task. This family tends to deliver the strongest results but is more expensive to train and harder to tune. For details, see <content-link canonical="rq-vae-semantic-id-tokenizer-in-generative-recommendation">Building a Semantic ID Tokenizer with RQ-VAE</content-link>.

2. **Two-stage geometric quantization (RQ-Kmeans).**
     Represented by Kuaishou's OneRec (2025) and similar systems. An existing model, such as a two-tower DSSM, first produces high-quality static item embeddings, which are then split into token sequences by purely geometric residual <information context="K-means is a centroid-based clustering algorithm. It represents each cluster by a center and repeatedly assigns every point to its nearest center, so it works best when each cluster can be summarized well by a single central point.">K-means</information>. This avoids the difficult gradient optimization, and it is stable and cost-effective in production. For details, see <content-link canonical="rq-kmeans-semantic-id-tokenizer-in-generative-recommendation">Building a Semantic ID Tokenizer with RQ-Kmeans</content-link>.

## Practical Issues and Engineering Trade-offs

A tokenizer can turn items into clean Semantic IDs, but deploying them in a real online system still raises several hard problems and forces some compromises.

### Issue 1: Invalid IDs and Hallucination

A large model generates autoregressively from a probability distribution, so at inference time it can produce a Semantic ID that does not correspond to any real item: a sequence that plausibly describes an "Apple-brand microwave," for example, when no such product exists.

To avoid recommending nothing, inference uses **constrained decoding**. A trie holding every valid item token sequence is built in advance. At each decoding step, the model's options are checked against the trie and invalid tokens are filtered out with a <information context="A mask is a tensor that blocks out certain positions. In attention, autoregressive generation and constrained decoding, it sets the logits of invalid or disallowed options to a very small value (such as -inf) so that the model ignores invalid tokens, cannot look at future positions, or stays on valid generation paths.">mask</information>, so generation can only follow paths that lead to real items.

### Issue 2: Autoregressive Decoding Latency

A traditional ranking model scores every candidate in a single <information concept="concept.forward_pass">forward pass</information>. A generative model has to run $M$ sequential decoding steps for each item it recommends.

If the token sequence is long, latency grows with it, which is a serious problem in a latency-sensitive online system. The number of Semantic ID levels therefore cannot grow without limit; it has to balance how finely items are described against how long decoding takes online.

### Issue 3: ID Collisions and Ranking Items That Share a Code

To keep decoding latency down, Semantic IDs are usually limited to three levels or fewer. Quantizing a high-dimensional continuous vector into so few discrete tokens inevitably loses information. The direct consequence is that several very similar items, such as one garment in different colors or accessories with nearly identical specifications, map to **exactly the same Semantic ID**. This is an ID collision.

When the model predicts such a Semantic ID, it is really retrieving a set of candidate items. The hard part is that the probability of the Semantic ID alone gives the model little basis for ordering the dozens of near-identical items inside that set.

Two practical compromises are common:
1. **Option A: add a lightweight ranker.** Keep a pure three-level Semantic ID as the generation target. Once a set of items has been retrieved, leave the within-set ordering to a lightweight downstream ranker or to business rules.
2. **Option B: three semantic tokens plus one product-ID token.** The first three tokens provide semantic generalization and narrow down the region, and the last token gives up semantics and maps directly to the item's product ID (PID), so the model itself can tell colliding items apart.

> ⚠️ **Engineering caveat**: Option B solves precision at the end of the sequence, but mixing two very different kinds of representation in one decoding pass (semantic prediction and exact ID lookup) makes the constrained-decoding rules much more complicated and adds a lot of maintenance burden.

## Conclusion

Moving from meaningless serial numbers to token sequences that describe items from coarse to fine is more than an engineering optimization: Semantic IDs are what allow recommender systems to adopt generative modeling at all.

They bridge the gap between language models and huge item catalogs, letting a recommender represent and generate items much as a language model represents and generates text. Constrained decoding, decoding latency and collisions are still open engineering problems, but as tokenizers and inference infrastructure keep improving, this shift in how recommender systems are built is only beginning.

<reviewkit>
<takeaways>
- **The core abstraction:** Semantic IDs are what make generative recommendation deployable. They replace the atomic ID, a meaningless lookup key, with a short sequence of discrete tokens that approximates each item's semantic vector from coarse to fine and that a large model can read and generate.
- **Two bottlenecks removed:** Codebook reuse keeps the output vocabulary small, which avoids the softmax memory blow-up, and the semantic structure gives the model zero-shot generalization for new items, which addresses cold start under constant catalog churn.
- **Choosing a tokenizer:** RQ-VAE, a neural quantizer trained end to end, tends to give the best results. RQ-Kmeans, geometric quantization on top of existing embeddings such as a two-tower model, is the practical choice when stability, cost and reuse of existing assets matter more.
- **Deployment trade-offs:** Constrained decoding with a trie prevents invalid IDs; latency limits the number of levels; and ID collisions are handled either by a lightweight downstream ranker or by a "three semantic tokens plus one product ID" scheme.
</takeaways>
<qprompt/>
</reviewkit>
