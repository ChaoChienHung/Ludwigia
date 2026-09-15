<meta>
Title: NUS CS5562: Trustworthy Machine Learning
Summary: Structured notes for NUS CS5562 Trustworthy Machine Learning, exploring CLWE-based digital signature attacks, PRG embedding, membership inference auditing enhancements, and privacy safeguards.
Slug: nus-cs5562-trustworthy-machine-learning
Output: notes/NUS CS5562 Trustworthy Machine Learning/NUS CS5562 Trustworthy Machine Learning.html
CanonicalId: nus-cs5562-trustworthy-machine-learning
Style: default
EstimatedReadingTime: true
Lang: en
Tags: Machine Learning, Responsible AI, Trustworthy ML
Status: drafting
Published: 2026-09-12
LastModified: 2026-09-12
</meta>

CS5562 Trustworthy Machine Learning
Structured Notes on CLWE-Based Digital Signature Attacks, PRG Embedding, Quasilinear Time, MI-Based Auditing Enhancements, and Quasi-Identifiers

Digital Signatures (CLWE-Based) Attack
- Based on embedding Learning-With-Errors (LWE)-derived digital signature structures into training data or model parameters.
- The model behaves like a digital-signature verification oracle.
- If a membership inference (MI) auditor can determine whether a sample was in training, this can be converted into an attack that forges a digital signature.
- The construction gives a hardness reduction: successful MI implies the ability to forge signatures, contradicting LWE-based security assumptions.
- Used to show theoretical limits of auditing; not meant as a practical attack on real systems.
- Involves encoding cryptographic secrets directly into model features or training examples.

Limitations of CLWE-Based Attacks
- Highly theoretical and not practically realizable in normal machine learning workflows.
- Dataset must be crafted with cryptographic structure, which does not arise naturally.
- Hardness guarantees rely on LWE assumptions.
- Not intended for real-world deployment; mainly for proving lower bounds and impossibility results.

PRG Embedding Attack
- Uses a pseudorandom generator (PRG) instead of a signature scheme.
- A PRG takes a short random seed and outputs a long pseudorandom string.
- This pseudorandom output is embedded in training data or model parameters.
- If an MI auditor can detect whether a particular record was in training, it amounts to distinguishing PRG output from uniform random.
- This gives a reduction: MI success implies breaking PRG indistinguishability.
- Conceptually simpler than CLWE-based attacks but provides weaker hardness guarantees.

Limitations of PRG Embedding Attacks
- Also theoretical and not implemented in real training pipelines.
- Hardness result depends on the pseudorandomness assumption of the PRG.
- Provides weaker reductions compared to signature-based constructions.

Comparison: CLWE-Based Signature Attacks vs PRG Embedding
- CLWE-based attacks reduce MI success to signature forgery, giving a stronger hardness result.
- PRG embedding reduces MI success to distinguishing PRG output from random, a weaker requirement.
- Both embed cryptographic hardness assumptions into machine learning training data.
- Both are theoretical constructions designed to establish limits of auditing.

Quasilinear
- A function f(n) is quasilinear if f(n) = O(n log n).
- It grows almost linearly but includes a logarithmic factor.
- Many algorithms such as sorting or FFT run in quasilinear time.
- Used to describe near-linear complexity in cryptographic reductions or model-auditing algorithms.

Enhancements that Improve MI-Based Auditing Frameworks
- Use adversarial, adaptive auditors instead of simple static tests.
- Replace threshold-based inference with likelihood-ratio or hypothesis-based inference.
- Include multiple signals such as losses, logits, gradients, and hidden activations.
- Use calibration techniques to correct miscalibrated model confidence.
- Train shadow models to approximate target model behavior and leakage patterns.
- Employ deep neural network–based auditors instead of simple classifiers.
- Use combined multi-signal auditing pipelines for higher detection power.
- Align auditing procedures with worst-case attackers.

Quasi-Identifier
- A quasi-identifier is a set of attributes that cannot uniquely identify an individual alone but can do so when combined with external information.
- Examples include zip code, age, gender; city plus occupation; browser metadata; purchase timing.
- These attributes create re-identification risk when cross-referenced with auxiliary datasets.
- Important in privacy frameworks like k-anonymity, l-diversity, and t-closeness.

Vector space
- A vector space is a set of objects (vectors) that can be added together and multiplied by scalars.
- It satisfies certain axioms such as associativity, commutativity, and distributivity.
- Fundamental operations:
  - Vector addition: u + v
  - Scalar multiplication: c * v
- You can form linear combinations but cannot yet talk about length, angle, or orthogonality.
- Examples:
  - R^1 (line)
  - R^2 (plane)
  - R^3 (3D space)
  - R^n (n-dimensional)
  - Spaces of polynomials, matrices, or functions
- The concept applies to any dimension, including infinite-dimensional spaces.
- 2D is often used for visualization but is not the definition of a vector space.

Inner product space
- An inner product space is a vector space equipped with an inner product <u, v>.
- The inner product satisfies:
  - Symmetry: <u, v> = <v, u>
  - Linearity in each argument
  - Positivity: <v, v> ≥ 0 and equals 0 only if v = 0
- From the inner product, we can define:
  - Length (norm): ||v|| = sqrt(<v, v>)
  - Angle: cos(θ) = <u, v> / (||u|| ||v||)
  - Orthogonality: u ⟂ v if <u, v> = 0
- Standard inner product in R^n is the dot product:
  <u, v> = u1v1 + u2v2 + ... + unvn
- Inner product spaces provide geometric meaning to vector spaces.

3D real space (R^3)
- R^3 is the set of all ordered triples of real numbers (x, y, z).
- It is a 3-dimensional real vector space with standard operations:
  - Addition: (x1, y1, z1) + (x2, y2, z2) = (x1+x2, y1+y2, z1+z2)
  - Scalar multiplication: c(x, y, z) = (cx, cy, cz)
- With the dot product, R^3 is an inner product space.
- In R^3, the cross product is defined:
  u × v = (u2v3 - u3v2, u3v1 - u1v3, u1v2 - u2v1)
- The cross product yields a vector perpendicular to both u and v.
- The cross product only exists naturally in 3D (and a special case in 7D).

Comparison summary
Vector space:
  Structure: Addition + scalar multiplication
  You can: Form linear combinations
  Example: R^n, polynomial spaces

Inner product space:
  Structure: Vector space + inner product
  You can: Measure lengths and angles, define orthogonality
  Example: R^n with dot product

3D real space (R^3):
  Structure: Specific 3D real inner product space
  You can: Compute dot and cross products
  Example: Physical 3D space

Key takeaways
- A vector space is the most general concept and can have any dimension.
- The inner product adds geometric meaning such as length and angle.
- R^3 is a specific 3D real inner product space used in physics and geometry.
- The cross product is not part of the definition of a vector space; it is an additional operation specific to 3D.

---

ML Poisoning Attacks and Defenses

Overview
- Topic: Machine Learning (ML) poisoning attacks and defenses.
- Focus: Defending models trained on scraped or untrusted web data.
- Two types of poisoning attacks:
  - Targeted: mislead model on specific inputs (e.g., backdoor attacks)
  - Untargeted: degrade overall model performance

Scenario
- Defender trains model honestly on web data.
- Defender has full access to model and inputs.
- Poisoned data can reduce accuracy or introduce malicious behaviors.

Example: Artistic Dataset Poisoning
- Artists may poison datasets to protect work (e.g., watermarking outputs, lowering quality).
- Misleads model during training.

Defense Strategy: Training Process & Gradient Analysis
- Models trained via stochastic gradient descent (SGD)
  - Gradients averaged across data points for updates
- Poisoned data produces outlier gradients (larger magnitude)
- Idea: detect/filter poisoned data by analyzing gradient distributions

Robust Aggregation / Robust Mean Estimator
- Dataset contains clean + poisoned gradients
- Goal: aggregate gradients robustly to reduce poisoned influence
- Use robust aggregator to approximate clean gradient mean
- Bias = difference between robust aggregation output and average of clean gradients

Challenges
- Naive averaging is vulnerable to extreme gradients
- Median more robust than mean
  - Bias proportional to number of poisoned points
  - Adversary can slightly shift median
  - Bias bound: Bias = O(1) × ε × σ (ε = fraction poisoned, σ = clean gradient variance)

Statistical Lower Bound and Bias in 1-D Robust Estimation

Variance of Bernoulli Distribution
- Var(X) = p(1-p)
- Maximum variance at p=0.5: Var = 0.25
- Approaches 0 as p → 0 or 1

Distinguishing Two Bernoulli Distributions
- Coins: X ~ Bern(p), Y ~ Bern(p + 2ε)
- Difference in means = 2ε
- Sample mean standard deviation: std(𝑝̂) = sqrt(p(1-p)/n)
- Required sample size: n ≥ p(1-p) / (4 ε²)
- With small n, distinguishing small mean differences is statistically impossible

Implications for Robust Estimation
- Bias measures deviation from true parameter
- When mean differences < noise, no estimator can reliably distinguish
- For poisoning fraction ε, minimum achievable bias ~ order of σ
- Minimum bias = Ω(σ), fundamental statistical limit

Summary Table

| Concept                       | Explanation                                                        |
|-------------------------------|--------------------------------------------------------------------|
| Bernoulli variance            | p(1-p), intrinsic data noise                                        |
| Distinguishing means difficulty| Mean difference << noise → statistically impossible                |
| Sample complexity             | n ≥ variance / mean difference²                                     |
| Minimum bias robust estimator | At least order of σ due to noise limitations                        |

LLM Backdoor / Embedding-Trigger Defensive Checklist

Quick / Cheap Wins
- Input normalization: NFC/NFKC, remove control/zero-width chars, collapse whitespace
- Reject/sanitize suspicious codepoints
- Disable raw embedding injection for untrusted clients

Simple Token / Text Checks
- Blacklist known malicious strings/patterns
- Low-frequency token filtering
- Heuristic filters for deterministic, outsized token influence

Behavioral / Black-box Tests
- Token influence test: measure output change with/without token
- Ablation/perturbation testing: small input changes should not deterministically flip outputs
- Randomized tokenization: check output stability across tokenization variants
- Canary triggers & red-teaming to validate detection

Embedding / Representation Auditing
- Outlier detection in embeddings (Mahalanobis distance)
- Token-to-output influence matrix
- Activation clustering
- Projection probing (compute-intensive)

Training / Model Hardening
- Fine-tune on vetted clean data
- Neuron/subnetwork pruning
- Robust training (dropout variants, weight decay, adversarial fine-tuning)
- Differential checkpoint testing
- Targeted unlearning for known poisoned samples

Operational Controls & Monitoring
- Logging & auditing rare token occurrences
- Rate limiting and query monitoring
- Alerting for extreme, repeatable output changes
- Model provenance and supply-chain security

Policy / Access Controls
- Restrict data sources
- Limit privileged interfaces
- Adversary-aware deployment assumptions

Practical Thresholds & Metrics
- Token rarity < 1e-6 flagged
- Influence threshold: token addition changing top-1 class > 0.2
- Ablation flip rate > 50% escalated

Quick Implementation Checklist
1. Normalize inputs (NFC/NFKC)
2. Strip zero-width/control chars, collapse whitespace
3. Tokenize and flag rare tokens
4. Run token-influence test on flagged tokens
5. Block input + log + manual review if deterministic trigger suspected
6. Periodic fine-tune on vetted data + representation audits
7. Enforce supply-chain checks, restrict embedding endpoints

Adversarial Training and Randomized Smoothing

Adversarial Training
- Train on adversarially crafted inputs
- Goal: robustness against worst-case attacks
- Perturbation: worst-case, attacker-chosen
- Timing: training
- Model learns robust decision boundaries
- Guarantees: empirical
- Pros: improves robustness to known attacks
- Cons: computationally expensive, may reduce clean accuracy

Randomized Smoothing
- Add random Gaussian noise at inference
- Aggregate predictions (majority vote or probability average)
- Goal: stability under small perturbations
- Perturbation: random Gaussian
- Timing: inference
- Model unchanged; smoothing applied on top
- Guarantees: certified robustness within radius
- Pros: provable robustness
- Cons: may reduce clean accuracy; certification depends on noise level

Comparison Table

| Feature              | Adversarial Training          | Randomized Smoothing          |
|---------------------|-------------------------------|-------------------------------|
| Perturbation type    | Worst-case, adversarial       | Random Gaussian noise         |
| Timing               | Training                     | Inference                     |
| Model modification   | Changes decision boundary     | No change; smooths predictions|
| Guarantee            | Empirical                     | Certified                      |
| Defense approach     | Active                        | Passive                        |

Intuition
- Adversarial training: practicing against strong opponent
- Randomized smoothing: shock absorbers for small hits

Combination
- Can combine for empirical + certified robustness

---

Lecture 2
📐 Mathematical Abstractions for ML Security (Lecture 2)

🧭 The Role of Abstractions

Good abstractions in ML Security eliminate irrelevant details and focus analysis on quantifiable properties such as direction, distance, and chance.

Direction (Vectors)  
Distance (Metrics/Norms)  
Chance (Probability)

Abstractions help reason mathematically about ML model behavior, robustness, and vulnerability.

➡️ Vectors and Vector Functions

Core Idea: Inputs and outputs of most ML models are represented as finite-dimensional vectors (R^n).  
Concepts as Vectors: Embedding vectors abstract high-level concepts (words, images, entities) into a geometric space.

ML Model Abstractions: ML models are abstracted as vector functions f:V→W mapping an input vector space V to an output space W.

Model Type: Classifiers  
Function Abstraction: R^n → [1,n]  
Output Space: Discrete class labels  

Model Type: Generative Models  
Function Abstraction: R^n → R^m  
Output Space: Continuous output vectors (images, sequences)  

Model Type: Regression  
Function Abstraction: R^n → R  
Output Space: Single continuous real value  

➕ Vector Spaces

Definition:  
A vector space (V, F, +, ⋅) over a field F (such as the real numbers R) is a set V equipped with two operations:  
1. Vector addition (+): V × V → V  
2. Scalar multiplication (⋅): F × V → V  

These operations must satisfy the following axioms (rules):

1. Commutativity: u + v = v + u for all u, v ∈ V  
2. Associativity: (u + v) + w = u + (v + w)  
3. Existence of Additive Identity: There exists 0 ∈ V such that u + 0 = u  
4. Existence of Additive Inverse: For each u ∈ V, there exists −u such that u + (−u) = 0  
5. Distributivity (Scalar over Vector): a(u + v) = au + av for all a ∈ F  
6. Distributivity (Scalar Addition): (a + b)u = au + bu  
7. Associativity of Scalar Multiplication: a(bu) = (ab)u  
8. Identity Element of Scalar Multiplication: 1u = u  

These properties define linearity and ensure algebraic manipulation is consistent.

Example: Additive Compositionality of Word Embeddings  
Semantic relationships can be represented by vector operations.

Vector Analogy: v_man − v_woman ≈ v_king − v_queen  
This property allows models to perform algebraic manipulation of abstract concepts, such as finding a vector representing ‘royal woman’ by combining the vectors for ‘royal’ and ‘woman’.

Moments of a Random Variable

Expected Value (Mean μ): μ = E[X]  
Linearity: E[X + Y] = E[X] + E[Y]  
Variance (Var[X] or σ²): Var[X] = E[(X − μ)²]

Proof of Variance Identity:  
Var[X] = E[(X − μ)²]  
= E[X² − 2Xμ + μ²]  
= E[X²] − 2μE[X] + μ²  
= E[X²] − μ²  
= E[X²] − (E[X])²  

Gaussian/Normal Distributions

Univariate Gaussian N(μ, σ²):  
f(x) = (1 / (σ√(2π))) * e^{−(1/2)((x−μ)/σ)²}  

Tail Behavior: Gaussian tails decay exponentially, meaning deviations far from μ are increasingly unlikely.

Multivariate Gaussian N(μ, Σ): Defined for d-dimensional vectors with covariance matrix Σ.

Covariance Details (ρ=0):  
In the standard multivariate normal (μ=0, Σ=I), Cov(X_i, X_j) = 0 for i ≠ j.  
This implies components are uncorrelated, and for Gaussian distributions, uncorrelated implies independence.

🌐 Dimension and Concept Capacity

Goal: Prove existence of an exponentially large set of n vectors u₁,…,uₙ in R^d that are nearly orthogonal (|u_i ⋅ u_j| ≤ ε).

Expected Orthogonality: For independent random unit vectors u, v in R^d, E[u⋅v] = 0.  
Variance: Var[u⋅v] = 1/d, so as d → ∞, dot products concentrate near zero.


Probabilistic Method Logic

Definition: The probabilistic method is a non-constructive proof technique used to show existence of objects with desired properties.

Logic:
1. Define a probability space of possible objects.  
2. Show that P(Property Holds) > 0.  
3. Conclude that at least one object with the property must exist.

Application: By showing P(All pairs near-orthogonal) > 0 for n = exp(√d/4), existence of large sets of near-orthogonal vectors is proven.

Norms

A norm is a function ||⋅|| : V → [0, ∞) that satisfies the following properties:

1. Positivity: ||x|| ≥ 0, and ||x|| = 0 if and only if x = 0  
2. Homogeneity: ||a x|| = |a| · ||x|| for all scalars a  
3. Triangle Inequality: ||x + y|| ≤ ||x|| + ||y||  

Common ℓ_p Norms:  
ℓ_0 (Count of nonzero entries)  
ℓ_1 (Manhattan distance): ||x||_1 = Σ |x_i|  
ℓ_2 (Euclidean distance): ||x||_2 = √(Σ x_i²)  
ℓ_infinity (Max-norm): ||x||_∞ = max |x_i|

Norm Inequalities

Norm Ordering: ℓ_p norms are nested, meaning higher-order norms are always less than or equal to lower-order norms (for a > 0):  
||x||_(p+a) ≤ ||x||_p  

Cauchy-Schwarz Related Inequality (ℓ_1 vs. ℓ_2):  
The ℓ_1 norm (Manhattan distance) is always bounded by the ℓ_2 norm (Euclidean distance) scaled by √d:  
||x||_1 ≤ √d * ||x||_2  

📏 Metric Spaces and Distance

Core Idea: Distance abstraction quantifies similarity or closeness of vectors/concepts.

Metric Space Definition:  
A set of points X with a distance function d(⋅,⋅) satisfying four axioms:

1. Positivity: d(x, y) ≥ 0  
2. Identity of Indiscernibles: d(x, y) = 0 if and only if x = y  
3. Symmetry: d(x, y) = d(y, x)  
4. Triangle Inequality: d(x, z) ≤ d(x, y) + d(y, z)  

A norm induces a metric:  
d(x, y) = ||x − y||  

Common ℓ_p Norms used in ML: ℓ_0, ℓ_1, ℓ_2, ℓ_infinity  

Cosine Similarity and ℓ_2 Distance

Formula: cosθ = (u ⋅ v) / (||u||_2 ||v||_2)

Length Independence: Cosine similarity ignores vector length, focusing only on the angle between them.

Proof for Unit Vectors (||u||_2 = ||v||_2 = 1):

||u − v||_2² = ||u||_2² − 2(u ⋅ v) + ||v||_2²  
= 1 − 2(u ⋅ v) + 1  
= 2 − 2(u ⋅ v)

Since cosθ = u ⋅ v, substituting yields:  
||u − v||_2² = 2(1 − cosθ)

Thus, minimizing ℓ_2 distance is equivalent to maximizing cosine similarity for unit vectors.

🎲 Probability & Random Variables

Sample Space (Ω): The set of all possible outcomes of a random experiment.  
Event (A): A specific subset of Ω representing outcomes.  
Probability Measure (P): Assigns a value in [0,1] to events.

Random Variable (r.v.): A measurable function X : Ω → S mapping outcomes to a new space S, inducing a probability distribution.
Lecture 3
💡 Core Concepts and Attacker Assumptions

Context: Adversarial Examples are a core issue in Robustness for machine learning models.  
Attack Type: They are classified as inference time evasion attacks.  
Root Cause: The model is underspecified—its behavior is unknown and unpredictable outside of the immediate training data distribution.  

White-Box Attacker Assumption: The attacker has full knowledge of the model f, including its architecture, parameters (θ), and gradients.  
Score Function: f_t(z) is the score (e.g., logit, probability) assigned by the model f to input z for being of class t.  
Classification Rule: An input z is classified as class t (f(z) = t) if the score for t is the highest among all classes:  
f_t(z) ≥ f_i(z) for all i ∈ Y  

Perturbation Measurement (Norms): The magnitude of the perturbation (δ) is constrained by a distance measure ℓ_p norm (||δ||_p ≤ ε).  
ℓ_infinity norm: Measures the maximum change in any single dimension (e.g., maximum pixel change).  
ℓ_2 norm: Measures the Euclidean distance (total magnitude of the vector change).  

🛠️ Finding Adversarial Examples: Unconstrained Optimization (FGSM)

Fast Gradient Sign Method (FGSM) is a single-step method that uses the gradient of the loss function J to quickly maximize or minimize the loss.

Attack Type: Untargeted  
Goal: Maximize loss for true class y (results in any class ≠ y)  
Perturbation δ formula: δ = ε * sign(∇_x J(θ, x, y))  
Adversarial example x_adv: x_adv = x + δ  

Attack Type: Targeted  
Goal: Minimize loss for specific target class y_target  
Perturbation δ formula: δ = -ε * sign(∇_x J(θ, x, y_target))  
Adversarial example x_adv: x_adv = x + δ  

FGSM ε vs. Learning Rate α:  
ε in FGSM is a single, large scalar defining the total ℓ_infinity perturbation budget for one step.  
α is a smaller step size used in iterative methods (like PGD) over multiple steps T.  

🔬 Finding Adversarial Examples: Constrained Optimization

Goal: Find the smallest perturbation δ (min ||δ||_p) that causes desired misclassification (f(x+δ) = t_target).  

1. Projected Gradient Descent (PGD) Attack

PGD is an iterative, multi-step attack ensuring the perturbation constraint ||δ||_infinity ≤ ε is strictly adhered to at every step.  

Initialization: x_0 is often initialized with a random perturbation δ_0 such that ||δ_0||_p ≤ ε.  

Iterative Update Rule (Untargeted, ℓ_infinity):  
x_{t+1} = Clip_{x, ε}^{ℓ_infinity}(x_t + α * sign(∇_x J(θ, x_t, y)))  

Projection Step (Clip): After the gradient update, the function projects the candidate input x' back onto the ℓ_infinity hypercube of radius ε centered at the original input x:  
Clip_{x, ε}^{ℓ_infinity}(x') = min(x + ε, max(x - ε, x'))  
This guarantees the ℓ_infinity constraint is never violated.

2. Carlini-Wagner (C&W) Method

Prior Formulation: min ||δ||_p subject to f(x+δ) = t_target  

Problem: Hard misclassification constraint is non-differentiable; gradient descent fails as optimal δ lies on the constraint boundary.  

New Formulation: Unconstrained Optimization with penalty term:  
min ||δ||_p + c * f(x + δ, y_target)  

c balances minimization of ||δ||_p with penalty for misclassification failure. Outer line search over c finds the smallest value achieving successful attack.  

Handling Non-Differentiable Norms and Input Range:  
Change of variables: x + δ = 0.5 * (tanh(w) + 1)  
Optimization is performed w.r.t unconstrained variable w, guaranteeing x+δ ∈ (0, 1).  

Handling ℓ_infinity norm:  
Reframe: Find smallest ε for which attack succeeds, subject to ||δ||_infinity ≤ ε.  
Inner Optimization: For fixed ε, minimize attack objective using PGD.  
Outer Optimization: Line search over ε to find minimum ℓ_infinity distance that yields successful attack.  

🔑 Key Takeaways

Adversarial Examples are inference time evasion attacks.  
Model is underspecified, leading to non-robustness outside the training distribution.  
Attacks fundamentally rely on Optimization with Gradient Descent.  
Generating strong attacks requires handling constrained optimization, non-differentiable functions, and norms using PGD or C&W methods.

Primary To-read Articles:
https://arxiv.org/pdf/1412.6572
https://arxiv.org/pdf/1707.08945
https://arxiv.org/pdf/2307.15043
https://arxiv.org/abs/1706.06083
https://arxiv.org/abs/1608.04644
https://arxiv.org/abs/1607.02533
https://nicholas.carlini.com/papers/2019_howtoeval.pdf
https://towardsdatascience.com/training-provably-robust-neural-networks-1e15f2d80be2/

Secondary To-read Articles:
https://arxiv.org/abs/1412.1897
https://arxiv.org/pdf/1707.07328
https://openaccess.thecvf.com/content_cvpr_2017/papers/Moosavi-Dezfooli_Universal_Adversarial_Perturbations_CVPR_2017_paper.pdf

---

Lecture 4

Primary To-read Articles:
https://www.comp.nus.edu.sg/~prateeks/papers/Provero-icse21.pdf
https://arxiv.org/pdf/2302.10149
https://www.microsoft.com/en-us/research/wp-content/uploads/2019/03/auror.pdf
https://machine-learning-and-security.github.io/papers/mlsec17_paper_51.pdf
https://arxiv.org/pdf/2102.08452
https://dl.acm.org/doi/pdf/10.5555/3648699.3649058
https://arxiv.org/abs/1611.02770



Secondary To-read Articles:
https://arxiv.org/abs/1809.02104



---

Lecture 5

Primary To-read Articles:
https://aclanthology.org/2020.acl-main.249.pdf



Secondary To-read Articles:



---

Lecture 6

Primary To-read Articles:
https://arxiv.org/abs/2204.06974

Primary To-read Articles:
https://arxiv.org/pdf/2301.13188
https://arxiv.org/pdf/2311.17035
https://arxiv.org/pdf/1802.08232
https://messlab.moyix.net/papers/badnets_ieeeaccess19.pdf
https://arxiv.org/pdf/2112.03570
https://arxiv.org/pdf/1610.05820
https://arxiv.org/pdf/2305.18462
https://www.statslab.cam.ac.uk/Dept/People/djsteaching/S1B-17-07-simple-hypotheses-4.pdf
https://arxiv.org/pdf/2312.03262
https://arxiv.org/pdf/2402.07841
https://arxiv.org/pdf/2407.15100
