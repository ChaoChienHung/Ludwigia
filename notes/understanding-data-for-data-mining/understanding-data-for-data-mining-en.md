<meta>
Title: Understanding Data for Data Mining
CanonicalId: understanding-data-for-data-mining
Tags: Data Mining, Data Understanding, Attributes, Categorical Data, Numerical Data, Structured Data, Graph Data, Time Series, Data Representation
Summary: How to read a dataset before mining it: attribute types, measurement scales, structural formats, and the representations algorithms actually consume.
Slug: understanding-data-for-data-mining-en
Output: notes/understanding-data-for-data-mining/understanding-data-for-data-mining-en.html
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
    - How to read a dataset before mining it: attribute types, measurement scales, structural formats, and the representations algorithms actually consume.
- Attribute Types and Measurement
    - These attributes generally fall into two broad categories:
    - - Nominal values consist of completely unordered, mutually exclusive labels, such as eye color, zip codes, or gender
- Data Structures in the Wild
    - * Well-Structured Data: Follows a strict, rigid schema (such as tabular relational databases or SQL tables)
- From Raw Format to Mining Representation
    - * Graph Data (Networks): Used when the relationships between objects are just as important as the objects themselves
- Why Data Understanding Matters
    - The later stages of preprocessing, feature engineering, and model choice all depend on these earlier distinctions
    - In that sense, this article naturally bridges into `Data Quality, EDA, and Preprocessing`
- Summary & Key Takeaways
    - This conclusion should gather the key ideas without expanding scope
    - - Data understanding is not optional context; it determines what operations and interpretations are valid
- References
</draft>

<anchors>
toc1: understanding-data -> Understanding Data for Data Mining
h2: Understanding Data for Data Mining -> understanding-data
toc2: understanding-guiding -> Guiding Questions
callout: Guiding Questions: What Kind of Data Are We Looking At? -> understanding-guiding
toc2: attributes -> Attribute Types and Measurement
h3: Attribute Types and Measurement -> attributes
toc2: structures -> Data Structures in the Wild
h3: Data Structures in the Wild -> structures
toc2: representations -> From Raw Format to Mining Representation
h3: From Raw Format to Mining Representation -> representations
toc2: why-understanding-matters -> Why Data Understanding Matters
h3: Why Data Understanding Matters -> why-understanding-matters
toc1: summary -> Summary & Key Takeaways
h2: Summary & Key Takeaways -> summary
toc1: references -> References
h2: References -> references
</anchors>

# Understanding Data for Data Mining

## Understanding Data for Data Mining

<callout>
id: understanding-guiding
toc: Guiding Questions
variant: question
icon: circle-question
style: regular
title: Guiding Questions: What Kind of Data Are We Looking At?
content:
Before we can mine data, we have to understand what kind of thing our dataset actually is. Are we looking at categories or quantities? Ordered values or unordered labels? Flat records, networks, or sequences where order itself carries meaning?

These questions matter because different kinds of data permit different operations, distort in different ways, and support different modeling choices. A method that makes sense for tabular ratios may be meaningless for nominal labels or graph edges.

So before we ask what pattern to extract, we first need to ask a more basic question: what structure is already present in the data itself?
</callout>

In data mining, poor results do not come only from weak algorithms. They also come from misunderstanding what kind of data we have in front of us. A dataset is never just a pile of values. Each column, record, edge, timestamp, or token carries assumptions about measurement, structure, and meaning. Some attributes merely label categories; others measure quantities with real arithmetic meaning. Some datasets are already organized into clean tables, while others arrive as text, networks, event streams, or documents that must be interpreted differently before mining even begins. This is why data understanding is the first intellectual step after defining the mining task. Before we clean, model, or interpret anything, we must understand what the data can legitimately say.

## Attribute Types and Measurement

Before initiating the data mining process, practitioners must deeply understand the fundamental building blocks of their datasets: the attributes. The reason is simple—different data structures demand different handling techniques to maximize their analytical utility. Much like social interactions, where we adapt our communication style to match different personalities, data requires tailored analytical approaches based on its inherent characteristics. To understand data deeply, we must inspect its attributes, which essentially act as the "personality traits" of the dataset.

These attributes generally fall into two broad categories:

1. Categorical (Qualitative) Attributes
   Categorical attributes describe traits, qualities, or characteristics that cannot be measured with a meaningful numerical scale.
   - Nominal values consist of completely unordered, mutually exclusive labels, such as eye color, zip codes, or gender. For nominal data, the only mathematically valid operation is testing for equality ($=$ or $\neq$). Because these labels possess no intrinsic ranking, it is impossible to define which value is "larger" or "smaller"; we can only determine whether two data points are identical or distinct.
   - Ordinal values, by contrast, possess a meaningful and sequential order, such as education level (High School, Bachelor's, PhD) or customer satisfaction ratings (Poor, Fair, Excellent). While we still cannot calculate the exact mathematical distance between "Fair" and "Excellent," their inherent sequence allows for greater-than ($>$) or less-than ($<$) comparisons.
2. Numerical (Quantitative) Attributes
   Numerical attributes represent measurable magnitudes and quantities that are inherently numeric, making them ripe for mathematical calculation.
   - Interval data features meaningful, measurable distances between values, but lacks a "true zero" point. A classic example is temperature measured in Celsius or Fahrenheit. In these systems, $0^\circ\text{C}$ does not mean a total "absence of heat"—it is simply an arbitrary point selected as the freezing point of water. Because there is no absolute zero, you can perform addition and subtraction (e.g., $30^\circ\text{C}$ is $10^\circ$ hotter than $20^\circ\text{C}$), but you cannot perform multiplication or division. It is scientifically incorrect to claim that $20^\circ\text{C}$ is "twice as hot" as $10^\circ\text{C}$.
   - Ratio data, however, possesses an absolute, true zero, where a value of zero signifies the complete, total absence of the measured attribute. Examples include weight, income, or age. If a bank account holds $$0$, it means there is completely no money present. Because a true zero anchor exists, ratio data permits all arithmetic operations, including multiplication and division. Therefore, we can accurately say that an individual earning $$100,000$ makes exactly twice the income of someone earning $$50,000$.

## Data Structures in the Wild

Beyond individual attributes, the overarching structure of a dataset dictates how it must be mathematically handled and mined. Broadly speaking, data presents itself in three foundational structural frameworks:

* Well-Structured Data: Follows a strict, rigid schema (such as tabular relational databases or SQL tables). Because every data point sits uniformly in designated rows and columns, it is immediately ready for algorithmic analysis.
* Semi-Structured Data: Lacks a rigid tabular format but retains internal organization through markers, tags, or hierarchies. Common examples include JSON, XML, or HTML files, where structural tags allow for flexible yet readable data separation.
* Unstructured Data: Encompasses raw formats with no predefined data model, such as images, videos, audio recordings, and natural language text documents. This data cannot be parsed directly by standard algorithms and requires heavy feature extraction to convert raw sensory information into numbers.

## From Raw Format to Mining Representation

Regardless of its real-world origin, raw structure must eventually be molded into specific mathematical representations to feed into data mining algorithms. These models typically transform data into one of three primary formats:

* Record Data (Matrices): The most common representation, where data is organized into a flat matrix of rows and columns. Each row represents a distinct entity (a record), and each column represents a specific attribute.
* Graph Data (Networks): Used when the relationships between objects are just as important as the objects themselves. Data is mapped as nodes (entities) and edges (connections), which is essential for mining social networks, web links, or molecular structures.
* Ordered Data (Sequences & Time Series): Applied when the chronological or structural order of the data carries critical meaning. Examples include financial stock tickers over time (time series) or genetic codes like DNA strands (sequential data), where misordering the sequence completely destroys the underlying pattern.

## Why Data Understanding Matters

The later stages of preprocessing, feature engineering, and model choice all depend on these earlier distinctions. If we misunderstand what an attribute means, or treat structure as if it were just formatting, we risk making invalid transformations before mining even begins. That is why data understanding matters: it tells us what operations are mathematically legitimate, what representations preserve meaning, and what kinds of downstream analysis make sense.

In that sense, this article naturally bridges into `Data Quality, EDA, and Preprocessing`. Before we can clean data well, we need to know what kind of thing it is, what its values actually mean, and how its raw form differs from the representation a mining algorithm will eventually consume.

## Summary & Key Takeaways

This conclusion should gather the key ideas without expanding scope.

- Data understanding is not optional context; it determines what operations and interpretations are valid.
- Attribute types and measurement scales constrain the mathematics we can legitimately apply.
- Raw storage format and mining representation are related but not identical.
- A clear understanding of data structure is what makes later cleaning and modeling decisions defensible.

<reviewkit>
<takeaways>
- Data understanding is not optional context; it determines what operations and interpretations are valid.
- Attribute types and measurement scales constrain the mathematics we can legitimately apply.
- Raw storage format and mining representation are related but not identical.
- A clear understanding of data structure is what makes later cleaning and modeling decisions defensible.
</takeaways>
<qquiz src="questions.en.json" ids="ratio-vs-interval" title="Quick Quiz"/>
<qprompt/>
</reviewkit>

## References

1. NUS CS5228 Knowledge Discovery and Data Mining Course Materials