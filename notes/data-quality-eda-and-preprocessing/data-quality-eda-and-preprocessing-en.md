<meta>
Title: Data Quality, EDA, and Preprocessing
Tags: Data Mining, Data Quality, Exploratory Data Analysis, EDA, Preprocessing, Missing Values, Outliers, Noise, Normalization, Feature Selection
Summary: How data quality problems distort learning, how EDA diagnoses them, and how preprocessing turns messy records into reliable model-ready data.
Slug: data-quality-eda-and-preprocessing-en
Output: notes/data-quality-eda-and-preprocessing/data-quality-eda-and-preprocessing-en.html
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
    - How data quality problems distort learning, how EDA diagnoses them, and how preprocessing turns messy records into reliable model-ready data.
- Why Data Quality Comes First
- Assessing Data Health: Noise, Outliers, Missing Values, and Duplicates
    - Real-world datasets are perpetually plagued by anomalies that threaten this quality:
    - - Outliers: Data points that exhibit extreme deviations from the statistical norm
- EDA as the Diagnostic Lens
    - We cannot fix these quality issues blindly
    - Question: In EDA, which visualization is commonly used to quickly spot outliers
- Preprocessing as the Treatment Plan
- From Preparation to Modeling
    - Good preparation does not guarantee a good model, but bad preparation often guarantees a bad one
    - title: 📊 Characteristics of Useful Patterns
- Summary & Key Takeaways
    - This conclusion should gather the main claims without expanding scope
    - - Data quality is not a side concern; it is part of the epistemic reliability of the whole pipeline
- References
</draft>

<anchors>
toc1: prep -> Data Quality, EDA, and Preprocessing
h2: Data Quality, EDA, and Preprocessing -> prep
toc2: prep-guiding -> Guiding Questions
callout: Guiding Questions: Before We Clean the Data -> prep-guiding
toc2: quality-first -> Why Data Quality Comes First
h3: Why Data Quality Comes First -> quality-first
toc2: data-health -> Assessing Data Health
h3: Assessing Data Health: Noise, Outliers, Missing Values, and Duplicates -> data-health
toc2: eda -> EDA as the Diagnostic Lens
h3: EDA as the Diagnostic Lens -> eda
toc2: preprocessing -> Preprocessing as the Treatment Plan
h3: Preprocessing as the Treatment Plan -> preprocessing
toc2: prep-to-modeling -> From Preparation to Modeling
h3: From Preparation to Modeling -> prep-to-modeling
toc1: summary -> Summary & Key Takeaways
h2: Summary & Key Takeaways -> summary
toc1: references -> References
h2: References -> references
</anchors>

# Data Quality, EDA, and Preprocessing

## Data Quality, EDA, and Preprocessing

<callout>
id: prep-guiding
toc: Guiding Questions
variant: question
icon: circle-question
style: regular
title: Guiding Questions: Before We Clean the Data
content:
Once we have selected the data we care about, a new problem emerges: how do we know whether that data deserves to be trusted? If our records are noisy, incomplete, duplicated, or inconsistently formatted, even the most sophisticated model can end up learning the wrong lesson.

This raises a second question. Why can’t we simply feed raw data directly into a model and hope it learns the right lesson? Before we "fix" a dataset, how do we diagnose what is actually wrong with it? We need a way to see distributions, spot anomalies, and understand whether the data's structure supports the task we care about.

That is where data quality analysis, Exploratory Data Analysis (EDA), and preprocessing come together. They form the critical middle layer between raw collection and meaningful modeling.
</callout>

After data selection, the next challenge in data mining is not immediately choosing an algorithm. It is learning how to trust the data that will feed that algorithm. Raw datasets often look complete at first glance, yet still contain the exact kinds of defects that distort later modeling: missing values, duplicated records, inconsistent scales, mislabeled categories, and extreme outliers that blur the line between error and signal. This is the practical meaning of "garbage in, garbage out": low-quality inputs do not merely make a model less accurate, they can teach it the wrong picture of reality. That is why data quality assessment, EDA, and preprocessing belong together. Data quality tells us what can go wrong, EDA helps us see where those problems are concentrated, and preprocessing gives us the concrete operations needed to repair, reshape, and stabilize the dataset before mining begins.

## Why Data Quality Comes First

Once we understand the structural persona of our data, we must assess its integrity before allowing an algorithm to touch it. In the real world, data quality is defined by three pillars: accuracy (is it correct?), completeness (is anything missing?), and consistency (is it formatted uniformly?). High-quality data is an absolute prerequisite for effective modeling; if we skip this health check, we fall straight into the "garbage in, garbage out" trap.

## Assessing Data Health: Noise, Outliers, Missing Values, and Duplicates

Real-world datasets are perpetually plagued by anomalies that threaten this quality:

- Noise: Random errors or variances, often stemming from faulty hardware sensors, human data-entry typos, or erratic formatting.
- Outliers: Data points that exhibit extreme deviations from the statistical norm. These require careful human scrutiny: are they simply severe noise to be discarded, or are they highly valuable rare events—such as a brilliant flash of fraud in banking data or a new anomaly in cybersecurity networks?
- Missing Values & Duplicates: Gaps that require mathematical imputation (filling in blanks) or outright record deletion, alongside clone entries that must be merged to prevent algorithms from applying skewed, artificial weights to identical underlying entities.

## EDA as the Diagnostic Lens

We cannot fix these quality issues blindly. To systematically diagnose a dataset's flaws before any heavy modeling occurs, practitioners employ Exploratory Data Analysis (EDA). Acting as a crucial sanity check, EDA is the "X-ray machine" of data science. It relies heavily on visual tools—such as histograms to view data distributions, boxplots to instantly spot outliers, and scatter plots to reveal hidden correlations.

Through EDA, we assess class balances to ensure our future models won't be heavily biased toward a dominant majority group. Even for unstructured data, running basic statistical summaries on text word frequencies or image pixel distributions during this diagnostic phase provides the foundational insights that dictate our ultimate cleaning strategy.

## Preprocessing as the Treatment Plan

Once EDA has illuminated the precise vulnerabilities within the dataset, Data Preprocessing steps in to physically execute the treatment plan, moving from conceptual cleanup to concrete algorithmic preparation. This phase materializes across three rigorous technical fronts:

1. Data Cleaning: Resolving the specific missing values, inconsistencies, and corrupted entries surfaced during the EDA phase.
2. Data Reduction: Shrinking the sheer volume and dimensionality of massive datasets—either through statistical sampling, feature binning, or applying advanced mathematical techniques like Principal Component Analysis (PCA)—ensuring we reduce computational strain without losing the core structural integrity of the signal.
3. Transformation & Encoding: Physically reshaping data values into machine-ready formats. This includes normalizing numerical scales (via Min-Max scaling or Z-scores) so that massive numbers do not mathematically overpower smaller, equally important ones. Furthermore, it utilizes techniques like One-Hot Encoding to seamlessly convert qualitative categorical text labels into binary numerical vectors ($0$s and $1$s), ensuring the dataset is fully compatible with mathematical machine learning models.

## From Preparation to Modeling

Good preparation does not guarantee a good model, but bad preparation often guarantees a bad one. That is why this article sits at the center of the larger pipeline. Data quality tells us what can go wrong, EDA tells us what is actually happening, and preprocessing tells us what to do next. Only after these steps can we responsibly move on to later articles such as `Core Tasks in Data Mining`, `Supervised Learning in Data Mining`, and `Unsupervised Learning and Dimensionality Reduction`.

<block>
title: 📊 Characteristics of Useful Patterns
content:
For a discovered pattern to be considered true "knowledge," it must possess two critical characteristics:

- **Generalizability:** A pattern must remain highly accurate when tested on unseen data (`Generalizability = accuracy on unseen data`). Its generalizability is fundamentally limited by the quality of the baseline data; small, narrow, or heavily biased datasets will inevitably cause a model to memorize noise.
- **Importance:** The uncovered relationship must reflect a genuine, meaningful mechanism. It is critical to remember that correlation does not imply causation—simply because two variables move together mathematically does not mean one forces the other to happen.

**Core Insight:** To maximize both generalizability and importance, practitioners rely heavily on strategic feature selection, precise normalization, and rigorous preprocessing to actively isolate true signals from background noise. </block>

## Summary & Key Takeaways

This conclusion should gather the main claims without expanding scope.

- Data quality is not a side concern; it is part of the epistemic reliability of the whole pipeline.
- EDA is the diagnostic step that turns vague suspicion into concrete evidence.
- Preprocessing is the operational layer that transforms evidence into intervention.
- Good preparation does not just make algorithms easier to run; it makes later knowledge claims more trustworthy.

<reviewkit>
<takeaways>
- Data quality is not a side concern; it is part of the epistemic reliability of the whole pipeline.
- EDA is the diagnostic step that turns vague suspicion into concrete evidence.
- Preprocessing is the operational layer that transforms evidence into intervention.
- Good preparation does not just make algorithms easier to run; it makes later knowledge claims more trustworthy.
</takeaways>
<qquiz>
title: Quick Quiz

<question>
Question: In EDA, which visualization is commonly used to quickly spot outliers?
A: Histogram
ResponseA: Incorrect. Histograms show distributions, but boxplots are the classic fast outlier spotter.
B: Boxplot
ResponseB: Correct. Boxplots are designed to highlight quartiles and reveal outliers beyond whiskers.
C: Scatter plot
ResponseC: Incorrect. Scatter plots help reveal relationships, but they are not the standard outlier-first tool described.
D: Confusion matrix
ResponseD: Incorrect. Confusion matrices are for evaluating classifiers, not EDA.
Answer: B
Explanation: Boxplots are designed to highlight quartiles and reveal outliers beyond whiskers.
</question>

</qquiz>
<qprompt/>
</reviewkit>

## References

1. NUS CS5228 Knowledge Discovery and Data Mining Course Materials