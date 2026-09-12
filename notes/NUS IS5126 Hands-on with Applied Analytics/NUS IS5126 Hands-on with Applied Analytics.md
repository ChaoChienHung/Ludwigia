NUS IS5126 Hands-on with Applied Analytics
Structured Notes on BatchNorm, GAN Training, Skip Connections, Bottlenecks, and FastAPI in Data Science Workflows

Batch Normalization (BatchNorm)
- Applied during both training and inference.
- Training mode:
  - Uses batch statistics (mean and variance of the current mini-batch).
  - Normalizes activations using batch statistics.
  - Updates running averages of mean and variance to estimate population statistics.
- Inference mode:
  - Uses running mean and variance accumulated during training.
  - Does not rely on batch statistics.
- Helps stabilize training, accelerate convergence, and reduce internal covariate shift.

GAN Training Dynamics
- If the discriminator becomes too powerful too early:
  - It easily distinguishes real vs fake samples.
  - Output saturates near 0 or 1.
  - Generator receives vanishing gradients and cannot learn effectively.
- This can lead to non-convergence or mode collapse.
- Balanced training between generator and discriminator is crucial for stable GAN training.

Skip Connections
- Technique used in deep networks (e.g., ResNet) to allow direct information flow between layers.
- Advantages:
  - Facilitate gradient flow to earlier layers, reducing vanishing gradient problems.
  - Enable deeper networks to learn refinements rather than re-learning all features.
  - Promote parameter reuse, as layers can choose to skip or refine previous transformations.

Bottlenecks in Deep Networks
- Purpose: control width and enable scalable capacity.
- Typical implementation:
  - Reduce feature map dimensionality before expensive operations, then expand again.
  - Example: ResNet Bottleneck block (1x1 reduction → 3x3 operation → 1x1 expansion).
- Benefits:
  - Reduces computational cost.
  - Encourages compact, information-dense representations.
  - Supports deeper networks without exploding parameter count.

FastAPI for Reusable Feature Engineering
- Typed endpoints via Pydantic models:
  - Enforces input/output schemas and type validation.
  - Automatically parses and converts data.
  - Provides auto-generated API documentation (OpenAPI/Swagger).
  - Makes feature engineering logic reusable, stable, and versioned across systems.

- Facilitating Batch Scoring:
  - FastAPI endpoints can trigger batch jobs (e.g., Spark, Airflow, Databricks).
  - Example workflow:
"""
POST /batch_score  # Trigger batch scoring job
Returns: job_id

GET /batch_score/{job_id}/status  # Check job status
Returns: running, completed, or failed

GET /batch_score/{job_id}/results  # Fetch scored results
"""
  - Provides remote triggering, monitoring, and result retrieval.
  - Integrates batch inference into structured, reusable microservices.

- Week 1: Introduction to Data Analytics & AI in Analytics

- What is Data Analytics?
  - Definition: Collecting, cleaning, and analyzing raw data to uncover insights and support decision-making.
  - Goal: Transform large, complex datasets into actionable information.
  - Purpose: Guides strategy, operations, and real-world solutions.
  - Importance:
    - Identifies patterns and trends
    - Enables evidence-based decisions
    - Supports prediction, optimization, and innovation

- Data Pipeline Overview
  - Flow: Real World → Collection → Raw Data → Import → Database → Analyze → Report
  - Data Funnel: Raw → Cleaned → Transformed → Prepared → Analyzed
  - Key Point: Analysts should understand the entire pipeline to tell a coherent, data-driven story.

- Traditional Organizational Roles in Analytics
  - Sequence: Ops → Developers & Engineers → DBAs → Analysts → Managers
  - Business analysts operate across all stages to influence strategic decisions.
  - Analysts should be familiar with the pipeline from data collection to reporting.

- Applied Analytics: Multidisciplinary & Practical
  - Definition: Systematic use of data analysis, statistical methods, mathematical models, and computational tools to extract meaningful insights.
  - Focus: Real-world applications, solving practical problems, supporting informed decision-making.
  - Examples by Domain:
    - Retail: Decision trees for store inventory performance
    - Healthcare: Predict disease spread patterns, patient admissions, improve care
    - Transportation: Traffic data analysis to optimize infrastructure
    - Social Media: Sentiment analysis to gauge public opinion
    - Finance: Investment portfolio optimization, fraud detection, anti-money laundering
    - E-commerce: Personalized recommendations
    - Agriculture: Increase crop yields using data
    - Marketing: Forecast demand, optimize strategies
    - Risk Mitigation: Demographic analysis for store placement

- Tools and Technologies
  - Machine Learning (ML)
    - Scikit-learn: Python library for ML, model building, training, evaluation
  - Generative AI in Analytics
    - Generates new content (text, images, code, video) from dataset patterns
    - Benefits: Speeds workflows, generates synthetic data, provides natural-language explanations
  - Traditional ML vs Generative AI:
    - ML: Predict/classify, uses labeled data, outputs numbers/categories
    - Generative AI: Generates new content, uses unlabeled data, outputs text/images/code/video
    - Integration:
      - ML forecasts patterns → Generative AI explains results
      - Generative AI generates synthetic data → improves ML training
      - ML identifies trends → AI summarizes in plain language

- Generative AI Enhancements in Analytics
  - Speeds up prep: Automates cleaning, handles missing values, detects anomalies
  - Synthetic data: Produces realistic, privacy-safe samples
  - Feature engineering: Suggests important/unimportant features
  - Natural language insights: Summarizes trends and results
  - Strategy support: Simulates scenarios, identifies patterns

- Principles for Responsible AI Use
  - Use AI for early ideas, not final answers
  - Critically evaluate outputs and verify accuracy
  - Acknowledge AI usage in assignments
  - Avoid verbatim copying; rewrite and add context
  - Maintain original thought; AI should complement, not replace

- AI-Powered Tools Landscape
  - Asynchronous Coding Agents:
    - Paid: GitHub Copilot, Cursor, Google Jules
    - Free: AutoGPT, OpenHands, Sweep
    - Use: Auto code/test generation, fix pipelines, autonomous operation
  - Chat-based Data Analysis Tools:
    - Paid: Power BI Copilot, Tableau Pulse, Snowflake Cortex Analyst, Databricks Genie
    - Free: Metabase, Vanna
    - Use: Ask natural language questions, get charts/explanations
  - Table Data Modeling Tools:
    - Paid: H2O AutoML
    - Free: AutoGluon, TabPFN, MLJar, Auto-sklearn, LightAutoML
    - Use: Fast model building, predictive analytics
  - Smart Data Collection Tools:
    - Crawl4AI, Firecrawl, Singer.io, OpenMetadata
    - Use: Web scraping, scheduled API pulls, automate data collection
  - AI-Powered Data Storage & Search:
    - Paid: Pinecone, Weaviate
    - Free: Chroma, Milvus, Vespa
    - Use: Vector storage for semantic search, efficient AI retrieval
  - Note: Crawl4AI is not AI, just a data extraction tool for analytics pipelines.

- Case Study: Retail Price Monitoring
  - Scenario: Retail shop monitors competitors’ prices & detects unusual sales patterns.
  - Workflow:
    - Collect Data: Crawl4AI scrapes competitor pricing
    - Store Data: Save in Chroma (semantic vector DB)
    - Ask Questions: Vanna converts natural language queries to DB queries
    - Make Predictions: TabPFN or AutoGluon detects price anomalies
    - Fix Issues: OpenHands automates pipeline corrections
    - Visualize: Build dashboards with Metabase
    - Sentiment Analysis: Gauge customer opinions; inform product decisions

- Sentiment Analysis
  - Definition: NLP technique to identify/extract emotional tone or opinion from text
  - Use: Frequently applied in marketing and product design to understand public perception

Week 1: Introduction to Data Analytics & AI in Analytics

What is Data Analytics?  
Definition  
The practice of collecting, cleaning, and analyzing raw data to uncover meaningful insights and support decision-making.  
Goal: Transform large, complex datasets into actionable information.  

Purpose  
Guides strategy, operations, and real-world solutions.  

Why It Matters  
- Identifies patterns and trends  
- Enables evidence-based decisions  
- Supports prediction, optimization, and innovation  

Data Pipeline Overview  
Flow  
Real World → Collection → Raw Data → Import → Database → Analyze → Report  

Data Funnel  
Raw → Cleaned → Transformed → Prepared → Analyzed  

Key Point  
Analysts should understand the entire pipeline to tell a coherent, data-driven story.  

Traditional Organizational Roles in Analytics  
Ops → Developers & Engineers → DBAs → Analysts → Managers  
Business analysts operate across all stages, using data to influence strategic decisions.  
Analysts should be familiar with the pipeline from data collection to reporting.  

Applied Analytics: Multidisciplinary & Practical  
Definition  
Systematic use of data analysis, statistical methods, mathematical models, and computational tools to extract meaningful insights from complex datasets.  

Focus  
- Real-world applications  
- Solving practical problems  
- Supporting informed decision-making  

Examples  
- Retail: Decision trees to analyze store inventory performance  
- Healthcare: Predict disease spread patterns, patient admissions, improve care  
- Transportation: Traffic data analysis to optimize infrastructure  
- Social Media: Sentiment analysis to gauge public opinion  
- Finance: Optimizing investment portfolios, fraud detection, anti-money laundering  
- E-commerce: Personalized recommendations  
- Agriculture: Increasing crop yields with data  
- Marketing: Forecasting demand, optimizing strategies  
- Risk Mitigation: Demographic analysis for store placement  

Tools and Technologies  
- Machine Learning: Scikit-learn for model building, training, evaluation  
- Generative AI: Creates new content (text, images, code, video) from patterns in large datasets  
  Benefits: Speeds workflows, generates synthetic data, provides natural-language explanations  

Traditional ML vs Generative AI  
- Goal: ML predicts/classifies, AI generates new content  
- Data: ML uses labeled data, AI uses unlabeled data  
- Output: ML outputs numbers or categories, AI outputs text, images, code, video  
- Integration: ML forecasts patterns → Generative AI explains results; AI-generated data improves ML training  

Generative AI Enhancements in Analytics  
- Speeds up prep: Automates cleaning, missing values, anomaly detection  
- Synthetic data: Generates realistic, privacy-safe samples  
- Feature engineering: Suggests important/unimportant features  
- Natural language insights: Summarizes trends and results  
- Strategy support: Simulates scenarios, finds patterns  

Principles for Responsible AI Use  
- Use AI for early ideas, not final answers  
- Critically evaluate AI outputs; verify accuracy  
- Acknowledge AI usage in assignments  
- Avoid copying verbatim; rewrite and add context  
- Keep original thought as core; AI should complement  

AI-Powered Tools Landscape  
- Asynchronous Coding Agents: GitHub Copilot, Cursor, AutoGPT, OpenHands; auto code/test generation  
- Chat-based Data Analysis Tools: Power BI Copilot, Tableau Pulse, Metabase; natural language queries → charts/explanations  
- Table Data Modeling Tools: H2O AutoML, AutoGluon; fast model building, predictive analytics  
- Smart Data Collection Tools: Crawl4AI, Firecrawl; web scraping, automated data collection  
- AI-Powered Data Storage & Search: Pinecone, Chroma; vector storage for semantic search  

Case Study: Retail Price Monitoring  
- Collect Data: Crawl4AI to scrape competitor pricing  
- Store Data: Save in Chroma (semantic vector DB)  
- Ask Questions: Vanna converts natural language queries to DB queries  
- Make Predictions: TabPFN or AutoGluon detects price anomalies  
- Fix Issues: OpenHands automates pipeline corrections  
- Visualize: Build dashboards with Metabase  
- Sentiment Analysis: Gauge customer opinions; inform product decisions  

Sentiment Analysis  
Natural language processing technique to extract emotional tone from text.  
Used in marketing and product design to understand public perception.

Week 2: Data Extraction, Preprocessing & EDA
Data Extraction Methods

Web Scraping
Definition: Programmatically extract data from publicly accessible websites
Legal considerations: Verify website terms; some sites prohibit scraping
Tools & Libraries Workflow:
- requests: Download HTML content
- BeautifulSoup: Parse HTML, extract elements via tags, IDs, classes, CSS selectors
- Store data: Pandas DataFrame, CSV, or database
HTML Basics:
- Markup language using tags (head, body, p, title, etc.)
- IDs: unique, Classes: non-unique, Tags can be nested
Common Extraction Techniques:
- find_all(tag): retrieves all occurrences of a tag
- Select by ID: soup.find_all("p", id="id_name")
- Select by Class: soup.find_all("div", class_="class_name")
- CSS selectors: soup.select(".class"), soup.select("#id"), soup.select("div h2")
Example:
```
import requests
from bs4 import BeautifulSoup

response = requests.get("https://en.wikipedia.org/wiki/National_University_of_Singapore
")
soup = BeautifulSoup(response.content, 'html.parser')
print(soup.head.title.text)
```
Extract Table into Pandas:
```
import pandas as pd

table = soup.find("table", class_="wikitable sortable")
df = pd.read_html(str(table))[0]
```
Advanced Techniques:
- Crawl4AI: Converts HTML to LLM-friendly Markdown/JSON, supports CSS/XPath, asynchronous crawling, headless, multi-URL concurrency
- Asynchronous crawling: Multiple pages requested/processed concurrently
- Headless browser: Runs browser actions without GUI

APIs for Data Extraction
Definition: Rules for software to communicate and share data
Advantages: Structured, reliable, legal, consistent
Workflow:
- Obtain API key
- Send HTTP GET/POST request to endpoint
- Receive JSON response
- Convert JSON to Python dict or Pandas DataFrame
Advanced LLM Integration:
- Structured Outputs: Enforce schema with Pydantic → validated JSON → direct Pandas/database integration
- Function Calling: LLMs call external tools (APIs, SQL queries, business logic) → automated pipelines

Data Pre-processing and Cleaning
Tasks: Handle missing data, remove duplicates, correct inconsistencies, filter irrelevant data, encode categorical features, normalization/standardization, binning/discretization
Handling Missing Data: Fill (mean, median, mode), drop rows, replace categorical with placeholder
Handling Duplicates: df.duplicated(), df.drop_duplicates(inplace=True)
Handling Inconsistencies: Standardize date formats, data types
Filtering Rows/Columns: Select subset based on criteria
Categorical Features: One-hot encoding, dummy variables
Normalization: Rescale to [0,1] using MinMaxScaler
Standardization: Center at 0, std=1 using StandardScaler
Binning/Discretization: Convert continuous to discrete intervals (e.g., grade assignment)

Exploratory Data Analysis (EDA)
Purpose: Examine, summarize, visualize datasets, identify patterns, formulate hypotheses
Data Types:
- Categorical: nominal, ordinal
- Numerical: discrete, continuous
Descriptive Statistics: Mean, median, mode, range, variance, std, IQR
Exploring Categorical Data: Frequency tables, cross-tabulations
Outlier Detection: Boxplots, scatterplots, mean ± 3*std, IQR method
Multivariate Analysis: Correlation (Pearson, Spearman), heatmaps, pairplots

Week 3: Introduction to Machine Learning: Concepts, Processes, and Applications

What is Machine Learning?
- Science of enabling computers to learn patterns and trends autonomously and iteratively.
- Uses data from observations and real-world interactions.
- Automates model building; finds hidden insights without explicit step-by-step programming.

Applications of Machine Learning
- Fraud Detection
- Product Recommendations
- Natural Language Processing (NLP): Understand, process, and generate human language.
- Predicting Customer or Employee Churn
- Customer Segmentation: Identify subgroups for targeted marketing and personalization.
- Image Recognition & Object Detection (Computer Vision)
- Dynamic Pricing Models: Adjust prices based on market conditions, demand, competitor pricing, and customer behavior.
- Financial Modeling
- Predictive Maintenance (e.g., manufacturing, aviation)
- Healthcare Analysis and Diagnostics
- Marketing Optimization
- Risk Management
- Supply Chain Forecasting

Machine Learning Process
- Workflow: Raw Data → Preprocessing (Data Cleaning) → Prepared Data → Learning Algorithm → Candidate Model → Model Validation → Chosen Model → Deployment
- Data Preprocessing: Cleaning, normalization, standardization, scaling
- Learning Algorithms: Iterative model training, candidate model evaluation, hyperparameter tuning
- Model Deployment: Deliver model for end-user or business use

Types of Machine Learning
- Supervised Learning: Trained on labeled data; predicts outcomes for unseen data
  - Classification: Predict categorical outcomes
  - Regression: Predict numerical outcomes
- Semi-Supervised Learning: Small labeled dataset + large unlabeled dataset; reduces labeling cost, improves accuracy
- Unsupervised Learning: Trained on unlabeled data; discovers hidden patterns
  - Examples: Customer segmentation, anomaly detection, healthcare analysis

Clustering Techniques (Unsupervised Learning)
- K-Means: Partition data into K clusters; minimizes intra-cluster distance, maximizes inter-cluster distance; centroid = cluster center
- Hierarchical Clustering: Builds dendrogram to represent hierarchy; no need to predefine cluster count; merges clusters iteratively

Supervised Learning Workflow
- Split data into training (labeled) and test sets
- Feature extraction: Convert raw data into feature matrix; target column = label
- Train model on training data
- Evaluate performance; adjust features or hyperparameters
- Select final model for predictions on new data

Model Validation or Evaluation
- Purpose: Assess generalization performance
- Train-Test Split: ~70% training, 30% test; random row split
- Train-Validation-Test Split: Training, validation, and test sets (e.g., 70-15-15); validation tunes hyperparameters
- K-Fold Cross-Validation: Divide dataset into K folds; train K times using K-1 folds for training, 1 for validation

Confusion Matrix
- Actual vs Predicted
  - True Positive (TP): Correctly predicts positive
  - True Negative (TN): Correctly predicts negative
  - False Positive (FP, Type I Error): Incorrectly predicts positive
  - False Negative (FN, Type II Error): Incorrectly predicts negative

Metrics for Classification
- Accuracy: (TP + TN) / Total; good for balanced datasets
- Precision: TP / (TP + FP); fewer false positives
- Recall / Sensitivity: TP / (TP + FN); fewer false negatives
- F1 Score: 2 * (Precision * Recall) / (Precision + Recall); useful for imbalanced datasets

Metrics for Regression
- Mean Squared Error (MSE)
- Root Mean Squared Error (RMSE)
- Mean Absolute Error (MAE)
- R-squared

Supervised vs Unsupervised Learning
- Supervised: Labeled data, predicts outcomes, guided by examples
- Unsupervised: No labels, discovers patterns, exploratory analysis

Common Issues in Machine Learning
- Imbalanced Datasets: Unequal class distribution can bias model
- Dirty Data: Missing, duplicated, irrelevant, or misformatted
- Feature Irrelevance: Features may not support problem statement
- Data preprocessing is critical for accuracy

Supervised Learning – Regression
- Ordinary Least Squares Linear Regression
- Lasso: Linear model with L1 regularization
- Ridge: Linear least squares with L2 regularization
- ElasticNet: Linear regression with combined L1 & L2 regularization
- Decision Tree Regressor
- Random Forest Regressor
- Linear Support Vector Regression (SVR)

Week 4: Introduction to Machine Learning: Unsupervised Learning, Clustering, Dimensionality Reduction & Ensemble Methods

📘 Unsupervised Learning & Clustering

1. Unsupervised Learning
- Learns patterns from unlabeled data.
- No target labels to predict.
- Useful for large datasets or where labeling is costly.
- Goals: Discover hidden patterns, group similar points, reduce dimensionality.

2. Applications
- Clustering: Group similar data points (customer segmentation, document clustering, image segmentation).
- Dimensionality Reduction: Reduce features while preserving information (PCA, t-SNE).

3. k-Means Clustering
- Partitions data into k clusters based on similarity.
- Minimizes distance to cluster centroid.
- Steps:
  1. Choose k.
  2. Initialize centroids.
  3. Assign points to nearest centroid.
  4. Update centroids.
  5. Repeat until convergence.

4. Choosing k
- Elbow Method: Plot SSE vs k; choose elbow point.
- Silhouette Score: -1 to 1; higher = better clustering.
- Davies-Bouldin Index: Lower = better (compact, well-separated clusters).

5. Hierarchical Clustering
- Builds hierarchy instead of predefined k.
- Agglomerative: Bottom-up → merge closest clusters.
- Divisive: Top-down → split clusters.
- Dendrogram: Tree diagram showing cluster hierarchy.
- Cut dendrogram at threshold to get cluster count.

6. Python Libraries
- NumPy, Pandas: Data handling
- Matplotlib: Visualization
- scikit-learn: KMeans, StandardScaler, Silhouette/Davies-Bouldin
- scipy.cluster.hierarchy: dendrogram, linkage, fcluster

✅ Recap
- Unsupervised learning = no labels, discover patterns.
- Clustering = group based on similarity.
- k-Means = centroid-based, requires k.
- Hierarchical = tree-based; visualized via dendrogram.

---

📘 Dimensionality Reduction

1. Dimensionality
- Number of independent features.
- High dimensions → sparse data, harder pattern detection.

2. Curse of Dimensionality
- Distances lose meaning; requires exponentially more data.
- Risk of overfitting.

3. Why Reduce Dimensions?
- Efficiency, noise reduction, visualization, storage.

4. Feature Selection vs Feature Extraction
- Selection: Keep important original features (correlation, mutual info, chi-square).
- Extraction: Create new features (e.g., PCA components).

5. Techniques Overview

| Technique | Type | Use Case | Strengths |
|-----------|------|----------|-----------|
| PCA | Linear | Preprocessing | Fast, interpretable |
| t-SNE | Non-linear | Visualization | Preserves local structure |
| Autoencoders | Non-linear | Complex datasets | Deep learning compatible |

6. PCA (Principal Component Analysis)
- Simplifies high-dimensional data, preserves variance.
- Steps:
  1. Represent data as matrix.
  2. Compute covariance matrix.
  3. Eigen decomposition → eigenvalues/variance, eigenvectors/directions.
  4. Select top k eigenvectors → project data.
- Applications: Image compression, gene expression.

7. t-SNE
- Non-linear visualization technique.
- Preserves local relationships.
- Converts high-dimensional distances → probabilities, maps to 2D/3D.
- Computationally expensive; mainly for visualization.
- Applications: MNIST digit visualization, customer segmentation.

✅ Key Takeaways
- Dimensionality reduction improves computation, noise reduction, visualization.
- PCA: linear, fast, for preprocessing.
- t-SNE: non-linear, for visualization.

---

📘 Ensemble Methods

1. Ensemble Learning
- Combines multiple models to improve performance.
- Categories: Bagging, Boosting, Stacking.

2. Why Use Ensembles?
- Reduce bias/variance, improve generalization, more robust.

3. Bias-Variance Trade-off
- Bias = underfitting; Variance = overfitting
- Ensemble aims to balance bias & variance.

4. Voting Ensembles
- Hard Voting: majority class wins.
- Soft Voting: average probabilities; higher confidence dominates.

5. Bagging (Bootstrap Aggregating)
- Create multiple datasets via bootstrap sampling.
- Train independent models → reduce variance.
- Final prediction: regression → average; classification → majority vote.

6. Random Forest
- Bagging + decision trees; random subset of features at each split.
- Reduces overfitting, assesses feature importance.
- Prediction: classification → majority vote; regression → average.

7. Out-of-Bag (OOB) Error
- ~1/3 of data unused in each bootstrap → used to estimate error.

8. Boosting
- Sequential ensemble; each model focuses on previous errors.
- Reduces both bias & variance.

9. Boosting vs Bagging

| Aspect | Boosting | Bagging |
|--------|---------|--------|
| Model Building | Sequential | Independent |
| Error Focus | Misclassified points | All points equally |
| Purpose | Reduce bias & variance | Reduce variance |
| Training | Weighted points | Bootstrap subsets |
| Overfitting Risk | Higher | Lower |
| Common Algorithms | AdaBoost, Gradient Boosting, XGBoost | Random Forest |

10. AdaBoost
- Sequentially corrects errors of weak learners.
- Sensitive to noise.

11. XGBoost
- Efficient gradient boosting.
- Regularization (L1/L2), parallel computing.
- Iteratively fits residuals to trees.

12. Stacking
- Combines base models using meta-learner.
- Steps:
  1. Train base models.
  2. Base predictions → features for meta-learner.
  3. Meta-learner combines predictions for final output.
- Meta-learner often logistic regression.

✅ Key Python Libraries
- scikit-learn: Bagging, Boosting, Stacking implementations.
- XGBoost: Efficient gradient boosting.

Week 4: Introduction to Machine Learning

Unsupervised Learning
- Learning patterns from unlabeled data
- No target labels or outputs
- Useful for large datasets or expensive labeling
- Goals: discover hidden patterns, group similar data points, reduce dimensionality

Applications
- Clustering: group data points by similarity (customer segmentation, document clustering, image segmentation)
- Dimensionality Reduction: reduce features while preserving information (PCA, t-SNE)

k-Means Clustering
- Partitions data into k clusters by minimizing distance to cluster centroids
- Steps: choose k, initialize centroids, assign points, update centroids, repeat until convergence
- Standardize features before clustering
- Python: scikit-learn KMeans.fit_predict()

Choosing Number of Clusters (k)
- Important for clustering quality
- Methods: Elbow method (plot SSE), Silhouette score (max value), Davies-Bouldin Index (lower is better)

Hierarchical Clustering
- Builds hierarchy instead of pre-defined k
- Types: Agglomerative (bottom-up), Divisive (top-down)
- Visualized with dendrograms (height = distance, merge order shows similarity)
- Cutting dendrogram at threshold height determines cluster count

Key Python Libraries
- NumPy, Pandas: data handling
- Matplotlib: visualization
- scikit-learn: KMeans, StandardScaler, clustering metrics
- scipy.cluster.hierarchy: dendrogram, linkage, fcluster

Dimensionality Reduction
- Dimensionality: number of independent features
- Curse of dimensionality: high dimensions → sparse data, harder patterns, risk of overfitting
- Benefits: efficiency, noise reduction, visualization, storage reduction
- Feature Selection: keep important features (correlation, mutual information, chi-square)
- Feature Extraction: create new features (e.g., PCA)
- Techniques: PCA (linear, fast, interpretable), t-SNE (non-linear, preserves local structure, visualization), Autoencoders (non-linear, deep learning)
- PCA: compute covariance matrix, eigen decomposition, select top eigenvectors, project data
- t-SNE: convert distances to probabilities, map to 2D/3D, optimize with KL divergence, mainly for visualization

Week 4: Ensemble Methods

Ensemble Learning
- Combine multiple models to improve performance
- Categories: Bagging, Boosting, Stacking
- Goal: improve generalization, reduce bias/variance

Bias-Variance Trade-off
- Bias: error from simple models (underfitting)
- Variance: error from sensitivity to data (overfitting)
- Total error = Bias² + Variance + Irreducible error
- Bagging reduces variance, Boosting reduces bias & variance

Voting Ensembles
- Hard voting: majority class wins
- Soft voting: average predicted probabilities

Bagging
- Bootstrap sampling → multiple datasets
- Train separate models → reduce variance
- Random Forest: bagging with decision trees, random feature selection, reduces overfitting, can assess feature importance
- Out-of-Bag error: ~1/3 data not used, evaluate performance without validation set

Boosting
- Sequential model training, focus on previous errors
- Reduce bias & variance
- AdaBoost: weak learners, sensitive to noise
- XGBoost: gradient boosting with regularization, handles large datasets, iterative residual fitting

Stacking
- Meta-learner combines predictions from multiple base models
- Steps: train base models → predictions become features → train meta-learner
- Common meta-learner: logistic regression

Week 5: Neural Networks

Neural Networks
- Computational models inspired by biological neurons
- Layers: input, hidden, output
- Neurons: compute weighted sum + bias, apply activation function

Components
- Input layer: receives features
- Hidden layers: intermediate processing
- Output layer: produces predictions

Mathematical Representation
- z = Σ(wi * xi) + b
- Activation: a = f(z)

Activation Functions
- ReLU: [0, ∞), hidden layers
- Sigmoid: (0,1), binary classification
- Tanh: (-1,1), hidden layers
- Softmax: probabilities, multi-class classification

Forward Propagation
- Pass input through network to compute output

Loss Functions
- Measure prediction error
- MSE: regression
- Binary cross-entropy: binary classification

Backpropagation
- Compute gradients with chain rule
- Adjust weights to minimize loss

Gradient Descent
- Update weights using gradients
- Learning rate controls step size

Neural Network Class
- Initialize weights & biases
- Forward: compute activations
- Compute cost: cross-entropy for classification
- Backward: compute gradients
- Train: iterate forward, cost, backward, update weights

Saving & Loading Models
- Use pickle to save/load trained neural network objects

Clusters in K-Means vs t-SNE
1. Different Goals and Methods
- K-means:  
  - A clustering algorithm.  
  - Partitions data into k clusters by minimizing sum of squared distances to cluster centroids.  
  - Assumes roughly convex, spherical clusters in original high-dimensional space.  
  - Produces hard cluster assignments (each point belongs to exactly one cluster).

- t-SNE:  
  - A dimensionality reduction and visualization technique.  
  - Preserves local neighborhoods by mapping data to 2D or 3D space.  
  - Uses non-linear transformations that distort global distances to emphasize local structure.  
  - Does not produce cluster labels, only visual groupings.

2. Different Input Spaces
- K-means runs on the original (or preprocessed) high-dimensional features.  
- t-SNE creates a low-dimensional embedding where distances are distorted for visualization.  
- This distortion means clusters separated in high-dim space may appear closer or merged in t-SNE, or vice versa.

3. Clusters in t-SNE Are Not Traditional Clusters
- t-SNE’s goal is to create a visual representation, not to define clusters.  
- Visual “clusters” in t-SNE plots may not correspond to true clusters in the data.  
- Over-interpreting these visual clusters can be misleading.

4. Cluster Boundaries vs Visualization
- K-means defines explicit cluster boundaries via centroids and labels.  
- t-SNE produces a continuous embedding with no explicit cluster boundaries.  
- You can overlay k-means labels on a t-SNE plot, but spatial arrangement may not match perfectly.

5. Randomness and Parameter Sensitivity
- Both algorithms involve randomness (k-means centroid initialization, t-SNE parameters like perplexity).  
- Different seeds or parameters can lead to different results.  
- t-SNE is especially sensitive to parameters and may change visualization significantly.

Summary

| Aspect               | K-means                            | t-SNE                             |
|----------------------|----------------------------------|----------------------------------|
| Purpose              | Clustering (hard assignment)     | Dimensionality reduction (visualization) |
| Input Space          | Original high-dimensional space  | Reduced 2D/3D embedding          |
| Distance distortion  | Minimal (Euclidean distance)      | High (non-linear, preserves local structure) |
| Cluster boundaries   | Explicit (centroids and labels)  | None (visual grouping only)      |
| Output               | Cluster labels                   | 2D/3D coordinates                |

Standardizing Binary Features for PCA/t-SNE

1. Context: Binary Features in Feature Space
- Binary features typically have values 0 and 1 (sometimes -1 and 1).  
- You want to apply dimensionality reduction (PCA or t-SNE) on your features, including these binary ones.

2. What Happens When You Standardize Binary Features?
- Standardization formula:  
  \[
  z = \frac{x - \mu}{\sigma}
  \]
  where:  
  - \(x\) = original binary value (0 or 1)  
  - \(\mu\) = mean of the binary feature (proportion of 1s)  
  - \(\sigma = \sqrt{\mu (1-\mu)}\) = standard deviation

- Example:  
  For feature vector `[0, 1, 0, 1, 1, 0]`,  
  - Mean \( \mu = 0.5 \)  
  - Std dev \( \sigma = 0.5 \)  
  - Standardized values become:  
    \[
    (0 - 0.5)/0.5 = -1, \quad (1 - 0.5)/0.5 = +1
    \]

3. Should You Standardize Binary Features Before PCA/t-SNE?
- Yes, generally you should standardize all features, including binary ones.  
- PCA and t-SNE work better when features have similar scales and variances.  
- Standardization prevents features with large scales from dominating the results.  
- Standardizing binary features rescales them to have mean 0 and variance 1, putting them on equal footing with continuous features.  
- For t-SNE, normalization is less critical but still recommended to improve performance.

4. Things to Keep in Mind
- If a binary feature is very imbalanced (mostly 0s or mostly 1s), standardization will amplify its variance and impact.  
- This isn’t usually a problem, but be aware it might affect the dimensionality reduction outcome.

5. Important Note on Labels vs Features
- Do NOT standardize labels (binary target variables).  
- Labels should remain as discrete classes (0/1).  
- PCA and t-SNE apply only to features, never labels.  
- Use labels only for coloring or annotating plots after dimensionality reduction.

Summary Table

| Step                  | Recommendation                                  |
|-----------------------|------------------------------------------------|
| Standardize features   | Yes, including binary features                  |
| Standardize labels     | No, keep binary labels as-is                     |
| PCA input             | Features only                                   |
| t-SNE input           | Features only                                   |
| Label usage           | For visualization/coloring after reduction     |

Regression Models for Bike Rental Dataset

- Linear Regression  
  Simple model relating bike rentals to variables like day, weather, season.

- Ridge Regression  
  Adds L2 regularization to reduce overfitting.

- Lasso Regression  
  Adds L1 regularization for feature selection and overfitting control.

- Elastic Net  
  Combines L1 and L2 regularization with two hyperparameters:  
  - Alpha (α): overall regularization strength  
  - L1_ratio (ρ): balance between L1 and L2

- Random Forest  
  Ensemble method that handles complex relationships, good for regression and classification.

Model Evaluation Metrics and Concepts

- Adjusted R-squared:  
  \[
  1 - \frac{\text{total squared residuals}}{\text{total variance}} \times \frac{n-1}{n-p-1}
  \]
  where \(n\) = number of samples, \(p\) = number of features.

- Clustering metrics:  
  - Elbow Method: Look for “bend” in within-cluster sum of squares vs. k.  
  - Silhouette Score: From -1 to 1, higher means well-separated clusters.  
  - Davies–Bouldin Index: Lower is better (compact and well-separated clusters).

PCA Explained Variance and Scree Plot

- `explained_variance_ratio_` shows fraction of variance each principal component explains.  
- Scree plot shows variance explained per component and cumulative variance.  
- Look for “elbow” point where adding more components yields diminishing returns.  
- Standardizing before PCA ensures fair comparison across features with different units.

t-SNE Overview
- t-SNE maps high-dimensional data to 2D or 3D for visualization.  
- Preserves local similarities rather than global structure.  
- Steps:  
  1. Compute pairwise similarities in high-dimensional space, focusing on local neighbors.  
  2. Initialize low-dimensional map with random points.  
  3. Iteratively adjust low-dimensional points to preserve neighborhood similarities.  
- Useful for visualizing clusters or natural groupings.  
- Not typically used as a preprocessing step for machine learning models.  
- Computationally intensive and slower on large datasets.

---

The perplexity value directly influences the resulting t-SNE visualization:
- Perplexity controls the balance between local and global aspects. Typical values are 5 to 50. Results can vary slightly run to run due to random initial placement.  
- Low Perplexity (e.g., 5-15): The algorithm focuses on preserving very close-range relationships. This can result in a visualization that highlights many small, distinct clusters, often referred to as "crowded" or "ball-of-string" plots. While this can reveal fine-grained local structure, it can also create spurious clusters or make the global structure appear fragmented.
- High Perplexity (e.g., 30-50+): The algorithm considers a wider neighbourhood of points. This forces it to pay more attention to the global structure of the data. The resulting plot will be more coherent and less fragmented, with smaller clusters potentially merging into larger, more meaningful groups.

Best practices
Choosing the right perplexity value is crucial for getting a useful visualization. There is no single "correct" value, and the ideal setting often depends on the specific dataset. It is recommended to experiment with several perplexity values to find the one that best reveals the underlying structure of your data. The t-SNE documentation suggests values typically between 5 and 50.

The `init` parameter in t-SNE specifies the initial arrangement of data points in the lower-dimensional space before the optimization process begins. This initial placement serves as the starting point for the algorithm's iterative work to create the final visualization.  
  - There are two main options for this parameter:  
    - `'random'`: This is the default setting. The data points are initially placed at random coordinates in the 2D or 3D space. Because the starting point is arbitrary, running the algorithm multiple times with the same data might result in slightly different visualizations.  
    - `'pca'`: This is a very common and often recommended option. Instead of random placement, the t-SNE algorithm first performs a quick Principal Component Analysis (PCA) on the data. It then uses the first two (for 2D) or three (for 3D) principal components to set the initial positions of the points. This provides a much better starting guess because PCA already captures a significant portion of the data's overall variance and global structure, which helps t-SNE converge faster and more reliably.

XGBoost
- `eta`:
 - learning rate parameter in XGBoost, controls the step size shrinkage when updating weights.
 - Smaller values of eta mean the model learns more slowly but can improve performance and prevent overfitting.
 - Typical values are between 0.01 and 0.3.
 - Lower eta usually means you need more boosting rounds.
- `num_boost_round`:
 - number of boosting iterations (trees) to build.
 - More rounds can improve model performance but may also cause overfitting.

---

Here are a couple of common loss functions:

- Cross-Entropy Loss:  
  - What it does: This loss function is often used for tasks where you want to classify input data into one of several categories (like identifying if an image is a cat or a dog). It measures how different the predicted probabilities for each category are from the actual category. A lower Cross-Entropy Loss means the network's predicted probabilities are closer to the true label.  
  - Use Case: Commonly used for classification problems, especially when the output layer uses a Softmax activation function to give probabilities for each class.

- Mean Squared Error (MSE):  
  - What it does: This loss function is used for tasks where you want to predict a continuous value (like predicting the price of a house or the temperature). It calculates the average of the squared differences between the predicted values and the actual true values. Squaring the difference makes sure that larger errors have a greater impact on the loss.  
  - Use Case: Commonly used for regression problems, where the goal is to predict a numerical value.

Optimiser
- Once the network makes a prediction and the loss function tells us how far off that prediction was from the true value, we need a way to adjust the network's internal settings (its parameters, which are the weights and biases) so that it makes better predictions next time.
- This is where the optimiser comes in. The optimiser uses the information from the loss (specifically, the gradients of the loss with respect to the weights) to figure out how to change each weight.  
  - The goal is to change the weights in a direction that will reduce the loss.
- Optimisers update the weights of the network using the gradients computed via `autograd` in PyTorch.

- Stochastic Gradient Descent (SGD):  
  - What it does: SGD is a fundamental optimiser. For each training example (or a small batch of examples), it calculates how much the weights should change to reduce the loss for that specific example (or batch). It then updates the weights based on this calculation. The "stochastic" part means it uses a random subset of the data (a mini-batch) at each step, which makes the updates faster but also a bit noisy compared to using the whole dataset.  
  - Use Case: A foundational optimiser. While simple, variations of SGD are still widely used and can be effective, especially with careful tuning of the learning rate.

- Adam:  
  - What it does: Adam is a more advanced optimiser that adapts the learning rate for each weight individually. It considers both the average of the past gradients (like momentum) and the average of the squared past gradients (like RMSprop). This helps it to converge faster and often perform better than basic SGD, especially on complex problems. It's generally considered a good default choice.  
  - Use Case: A very popular and often effective optimiser for a wide range of deep learning tasks. It's known for its efficiency and ability to handle different types of network architectures and data.

PyTorch is an open-source machine learning framework that accelerates the path from research prototyping to production deployment. It provides two high-level features:

1. Tensor computation (like NumPy) with strong GPU acceleration  
2. Deep neural networks built on a tape-based automatic differentiation system

Let's briefly introduce some of the key components of PyTorch:
- `torch.Tensor`: This is the fundamental data structure in PyTorch. Tensors are multi-dimensional arrays, similar to NumPy arrays, but they have the added capability of being able to run on GPUs for accelerated computation.  
- `torch.nn`: This module provides the building blocks for creating neural networks. It contains definitions for various layers (like linear layers, convolutional layers), activation functions, loss functions, and other utilities needed to construct and train neural network models.  
- `torch.optim`: This module implements various optimization algorithms, such as Stochastic Gradient Descent (SGD), Adam, and RMSprop. These optimizers are used to update the weights of your neural network during the training process based on the calculated gradients.  
- `torch.autograd`: This is PyTorch's automatic differentiation engine. It records operations performed on tensors and automatically computes the gradients of the output with respect to the input tensors. This is crucial for backpropagation, the algorithm used to train neural networks.

4. Autograd: Automatic gradient calculation, backpropagation, and the chain rule

When training a neural network, we use gradient descent to minimize a loss function $L$. This process involves calculating the derivative (gradient) of the loss with respect to each weight $w$ in the network. 

Automatic Differentiation (Autograd)
PyTorch’s `autograd` module automates the calculation of these gradients. When you create a tensor with `requires_grad=True`, PyTorch builds a computational graph that records all the operations. When you call the `.backward()` method on the final output (typically the loss), it computes the gradients for each tensor in the graph using the chain rule. This process is the backbone of backpropagation in neural networks, allowing the optimiser to update weights via gradient descent.

Mini Batch Gradient Descent

In practice, training is often performed on a small subset of the training data called a mini batch rather than the entire dataset. A mini batch is a collection of examples (e.g. 64 images) that is used to estimate the gradient in each update step. This approach provides a balance between the noisy updates of stochastic gradient descent (using one example) and the high computational cost of using the full dataset for every update.

---

To address various neural network issues, different techniques and components are used:

- Normalisation Techniques:  
  Batch normalisation helps stabilise the gradient flow.

- Gradient Clipping:  
  Limits the maximum value of gradients during backpropagation to prevent exploding gradients.

- PyTorch essentials:  
  - `torch`: For tensor operations.  
  - `torch.nn`: Provides pre-defined layers and utilities for building neural networks.  
  - `torch.nn.functional`: Contains functions such as activation functions.

Defining a custom neural network involves creating a class that inherits from `nn.Module`:  
- Use `super()` to properly initialise the parent class (`nn.Module`).  
- Define network layers in the constructor (`__init__()`), typically using pre-defined layers like `nn.Linear` or `nn.Conv2d`.

Deeper layers in a network learn to combine and refine lower-level features into more abstract, task-specific representations. Reducing neurons in deeper layers encourages focusing on the most salient features needed for the task.

In PyTorch:  
- Set the model to training mode (`model.train()`) before training loops. This:  
  - Activates dropout layers (randomly disables some neurons).  
  - Ensures batch normalisation uses current mini-batch statistics.  
  - Enables layers to update internal parameters via gradients.

- Set the model to evaluation mode (`model.eval()`) when testing or predicting. This:  
  - Disables dropout (all neurons active).  
  - Batch normalisation uses running averages computed during training.  
  - Ensures consistent behavior during inference.

Evaluating a batch within a `torch.no_grad()` block:  
- Process the batch to obtain raw output scores (logits).  
- Predict classes by selecting the highest score per sample.  
- Compare predictions with true labels to count correct matches.  
- Calculate accuracy to measure model performance on unseen data.

Traditional (shallow) neural networks:  
- Typically have only one hidden layer.  
- Can learn some patterns but struggle with complex, hierarchical features.  
- Less effective on high-dimensional or intricate tasks.

Deep learning:  
- Uses layered neural networks to automatically learn important patterns from raw data.  
- Eliminates the need for manual feature engineering.  
- Achieves superior performance on complex tasks by learning rich, abstract representations.

Common deep learning network types and their use cases:

1. Multilayer Perceptron (MLP) / Feedforward Neural Networks  
   - Information flows one way, through multiple fully connected layers.  
   - Use cases: Tabular data classification/regression, simple image classification, basic text tasks.

2. Convolutional Neural Networks (CNNs)  
   - Use convolutional layers to detect spatial patterns in grid-like data (e.g., images).  
   - Use cases: Image recognition, object detection, segmentation, video analysis, some text tasks.

3. Recurrent Neural Networks (RNNs)  
   - Handle sequential data with loops to maintain memory of previous inputs.  
   - Use cases: Language modeling, text generation, translation, speech recognition, time series analysis.

4. Long Short-Term Memory networks (LSTMs) and Gated Recurrent Units (GRUs)  
   - Advanced RNNs that better remember long-range dependencies.  
   - Solve the vanishing gradient problem in standard RNNs.  
   - Use cases: Complex language tasks, translation, video analysis, long sequence modeling.

5. Transformers  
   - Use attention mechanisms to focus on different input parts during prediction.  
   - Highly popular for text tasks and increasingly used for images.  
   - Use cases: Translation, summarization, question answering, text generation.

6. Autoencoders  
   - Learn compressed data representations via an encoder-decoder architecture.  
   - Use cases: Feature reduction, anomaly detection, data generation.

7. Generative Adversarial Networks (GANs)  
   - Consist of a generator creating data and a discriminator distinguishing real from fake data.  
   - Trained adversarially to produce realistic outputs.  
   - Use cases: Realistic image/video/text generation, image editing, synthetic data creation.

---

- Input Layer: Input is flattened if necessary before passing to the first linear layer.

- Output Layer:  
  - A linear layer reducing the 64-dimensional output from the last hidden layer to a single continuous output (`output_dim = 1`).  
  - Suitable for regression tasks predicting continuous values.

- Sequential Container:  
  - Uses PyTorch’s `nn.Sequential` to chain layers and activations, simplifying the forward pass.

Training vs. Validation Loss in the First Epoch
- Training Loss (Epoch 0):  
  - Average loss over all batches in the first epoch.  
  - Model weights update after each batch.  
  - Initial loss is usually higher (due to random initialization).  
  - Final reported loss is averaged over the entire epoch.

- Validation Loss (Epoch 0):  
  - Computed after completing the full training epoch.  
  - Reflects model performance after initial updates.  
  - Can be lower than the average training loss, since no weight updates occur during validation.

When to Stop Training
Focus on the validation loss curve:
1. Initial Improvement
2. Minimum Validation Loss
3. Divergence & Overfitting

Optimal stopping point:  
Stop training near the epoch with the minimum validation loss (50 to 100 epochs), to get best generalization and avoid overfitting.

Practical approach (Early Stopping):  
- Monitor validation loss during training.  
- Set patience (number of epochs to wait for improvement).  
- Stop training if no improvement in validation loss within patience window.  
- Save model weights at the epoch with lowest validation loss.

A Multilayer Perceptron (MLP), or feedforward neural network, consists of an input layer, one or more hidden layers, and an output layer. Information flows in one direction—from input through hidden layers to output.

- Each neuron in one layer is connected to every neuron in the next (fully connected).  
- Commonly used for tabular data, simple image or text classification, and regression.

---

Vanishing and Exploding Gradients in RNNs

Recurrent Neural Networks (RNNs) handle sequential data by passing information step by step, giving the network a form of memory. However, training RNNs on long sequences is challenging due to how gradients behave during backpropagation.

- Gradient Calculation in RNNs:  
  Training uses the chain rule to compute gradients for updating weights. Since each step depends on the previous one, gradients involve multiplying many derivatives across the sequence length.

- Vanishing Gradients:  
  When these derivatives are small (less than 1), multiplying many of them results in very small gradients. This causes the network to learn very slowly or not at all from information far back in the sequence, making it hard to remember distant inputs.

- Exploding Gradients:  
  When derivatives are large (greater than 1), repeated multiplication leads to very large gradients. This causes huge, unstable weight updates, making training erratic and often causing failure to converge.

Impact on Learning

These gradient problems limit the ability of standard RNNs to learn long-range dependencies effectively. To address this, architectures like LSTMs (Long Short-Term Memory) and GRUs (Gated Recurrent Units) use gating mechanisms to better control information flow and gradients over time.

Why Not Many Layers in RNNs/LSTMs?

- Training Challenges: deeper RNNs worsen vanishing/exploding gradients.  
- Computational Cost: more layers mean more parameters and longer training.  
- Diminishing Returns: adding layers does not always improve performance.

However, stacked RNNs/LSTMs with 3 or more layers do exist in research and complex tasks. These are often combined with bidirectional layers or other architectures like CNNs to boost performance.

Training vs. Validation Loss in the First Epoch
- Training Loss (Epoch 0):  
  Averaged over all batches in the first epoch with weights updated each batch. Initial loss is usually high due to random initialization. Final training loss is averaged over the entire epoch.
- Validation Loss (Epoch 0):  
  Calculated after the full training epoch without weight updates. Reflects performance after initial training. Can be lower than training loss since no parameter updates occur during validation.

Decision to Stop Training

Focus on validation loss when deciding when to stop training:
1. Initial Improvement: both training and validation losses decrease early, showing the model is learning.
2. Minimum Validation Loss: validation loss reaches its lowest point around epoch 50 to 100.
3. Divergence and Overfitting: after this point, training loss keeps decreasing but validation loss rises and fluctuates, indicating overfitting—the model memorizes training data and generalizes poorly.

The optimal stopping point is near the epoch where validation loss is minimum (50–100 epochs) to maximize generalization.

Practical Early Stopping Strategy

- Monitor validation loss continuously.  
- Set a patience value — number of epochs to wait without improvement before stopping.  
- Stop training if validation loss does not improve within the patience period.  
- Save model weights from the epoch with lowest validation loss.

This approach prevents overfitting and preserves the model’s best generalization ability.

---

Set the model to training mode
`model.train()`

Gradient Update
```
optimizer.zero_grad()  
loss = criterion(outputs, labels)  
loss.backward()  
optimizer.step()
```

Evaluate the Model  
After training, we evaluate the model's performance on the unseen test dataset. We set the model to evaluation mode (model.eval()) and use torch.no_grad() to disable gradient calculations during inference, which saves memory and speeds up computation.

Set the model to evaluation mode  
model.eval()

Gates in GRUs  
GRUs are similar to LSTMs but have a simpler structure with two main gates:

Update Gate: This gate acts like both the forget and input gates of an LSTM. It decides how much of the previous hidden state to keep and how much of the new candidate hidden state to add.

Reset Gate: This gate decides how much of the previous hidden state to ignore. It is used to decide how to combine the new input with the previous hidden state.

GRUs are generally simpler and faster to compute than LSTMs, while still being effective at handling sequential data and mitigating gradient problems. Both LSTMs and GRUs improve upon standard RNNs by using these gating mechanisms to better manage information flow over time.

The example code below shows how to define a simple model that can be used for either an LSTM or a GRU, depending on which layer (nn.LSTM or nn.GRU) you choose to enable in the __init__ method.

Autoencoders are a type of neural network trained to learn a compressed representation of the input data. They consist of two main parts: an encoder that takes the input and compresses it into a smaller representation (often called the "bottleneck" or "latent space"), and a decoder that takes this compressed representation and tries to reconstruct the original input data.

The goal of training an autoencoder is for the network to learn how to reconstruct the input as accurately as possible from the compressed version. This forces the encoder to learn important features and patterns in the data to be able to reconstruct it well.

How GANs Differ from Autoencoders  
Both Generative Adversarial Networks (GANs) and Autoencoders are neural network architectures that can be used to generate data or learn representations. However, they are fundamentally different in their structure, purpose, and how they are trained.

Here are the key differences:  
Purpose:  
Autoencoders: Primarily designed to learn a compressed representation of the input data (encoding) and then reconstruct the original input from that representation (decoding). Their main goal is often dimensionality reduction, feature learning, or denoising.  
GANs: Primarily designed to generate new data samples that are similar to the training data. They are focused on creating realistic data that did not exist before.

Structure:  
Autoencoders: Consist of two main parts: an Encoder and a Decoder. The data flows through the encoder to a bottleneck layer and then through the decoder.  
GANs: Consist of two competing networks: a Generator and a Discriminator. The Generator creates data, and the Discriminator tries to distinguish between real and generated data.

Training Process:  
Autoencoders: Trained by minimising a reconstruction loss, which measures how accurately the decoder can reconstruct the original input from the encoded representation.  
GANs: Trained in an adversarial manner. The Generator tries to minimise the loss based on the Discriminator's output (trying to fool it), while the Discriminator tries to maximise its loss (correctly identifying real and fake data). They are trained in a game-like setting.

In summary, while an Autoencoder learns to compress and reconstruct existing data, a GAN learns to create entirely new data through a competitive process between two networks.

Long Short-Term Memory (LSTM) and Gated Recurrent Units (GRUs) are special types of Recurrent Neural Networks (RNNs). They were developed to address some of the limitations of basic RNNs, particularly in handling long sequences of data. They are better at remembering information over extended periods, which helps prevent issues like vanishing gradients during training on long sequences.

Think of them as having a more sophisticated "memory" mechanism compared to simple RNNs. They use "gates" to control the flow of information, deciding what to remember, what to forget, and what to pass on to the next step.

How LSTM and GRU Networks Use Gates  
Long Short-Term Memory (LSTM) and Gated Recurrent Unit (GRU) networks are designed to handle long sequences by using special structures called gates. These gates act like switches that control which information is allowed to pass through the network and which is discarded. This helps them to remember important information over long periods and forget irrelevant details, which is crucial for dealing with issues like vanishing gradients in standard RNNs.

Gates in LSTMs  
LSTMs use three main types of gates to control the flow of information within their internal memory, called the cell state:

1. Forget Gate: This gate decides what information to throw away from the cell state. It looks at the current input and the previous hidden state and outputs values between 0 and 1 for each number in the cell state. A value of 0 means completely forget this information, while a value of 1 means completely keep this information.

2. Input Gate: This gate decides what new information to store in the cell state. It has two parts:  
   - One part decides which values from the input to update.  
   - The other part creates a vector of new candidate values that could be added to the cell state.

3. Output Gate: This gate decides what to output based on the cell state. It looks at the current input and the previous hidden state and filters the cell state to produce the hidden state for the current step. The hidden state is the output of the LSTM unit at this time step and is passed to the next step and potentially to a subsequent layer.

These gates work together to update the cell state and hidden state at each step of the sequence, allowing LSTMs to selectively remember or forget information.

Gates in GRUs  
GRUs are similar to LSTMs but have a simpler structure with two main gates:

1. Update Gate: This gate acts like both the forget and input gates of an LSTM. It decides how much of the previous hidden state to keep and how much of the new candidate hidden state to add.

2. Reset Gate: This gate decides how much of the previous hidden state to ignore. It is used to decide how to combine the new input with the previous hidden state.

GRUs are generally simpler and faster to compute than LSTMs, while still being effective at handling sequential data and mitigating gradient problems. Both LSTMs and GRUs improve upon standard RNNs by using these gating mechanisms to better manage information flow over time.

Generative Adversarial Networks (GANs)  
Generative Adversarial Networks (GANs) are a type of neural network architecture used for generating new data that is similar to the training data. A GAN consists of two parts that are trained together in a kind of game:

- Generator: This network's job is to create new data (like images). It takes random noise as input and tries to transform it into data that looks real.

- Discriminator: This network's job is to look at data and decide if it's real (from the training dataset) or fake (created by the Generator). It outputs a probability, where a high value means it thinks the data is real, and a low value means it thinks it's fake.

The Generator and Discriminator are trained in competition. The Generator tries to create data that can fool the Discriminator into thinking it's real, while the Discriminator tries to get better at distinguishing between real and fake data. This adversarial process helps the Generator learn to create very realistic data.

---

# Does Boosting Increase Model's Variance?

Short answer:  
Boosting can increase model variance, but it depends on the base learners and how boosting is applied.

## Explanation:

- Boosting is an ensemble method that builds models sequentially, where each new model tries to correct the errors of the previous ones.

- It primarily reduces bias by fitting the data more closely over multiple iterations.

- Because boosting focuses on harder-to-predict examples, it may increase variance, especially if:
  - The base learners are too complex (e.g., deep trees),
  - Too many boosting rounds are used (overfitting).

- When using simple base learners (e.g., shallow trees), boosting typically:
  - Significantly reduces bias,
  - Does not increase variance dramatically.

- Regularization techniques like:
  - Early stopping,
  - Learning rate (shrinkage),
  - Limiting base learner complexity (e.g., max depth),
  
  can help control variance and prevent overfitting.

## Summary:

| Effect       | Outcome                          |
|--------------|---------------------------------|
| Bias         | Decreases (boosting reduces bias) |
| Variance     | Can increase (risk of overfitting) |
| Control      | Use simple base learners and regularization |

---

## 📊 Key Assumptions of Linear Regression

Linear regression relies on several statistical assumptions to ensure that its estimates and predictions are reliable, unbiased, and interpretable.  
Violating these assumptions can lead to misleading results even if the model appears to fit well.

Below are the main assumptions you should check when building a linear regression model:

### 1. 📈 Linearity

- What it means:  
  The relationship between the independent variables (\( X \)) and the dependent variable (\( Y \)) is linear.  
  \[
  Y = \beta_0 + \beta_1 X_1 + \beta_2 X_2 + \dots + \varepsilon
  \]
- Why it matters:  
  If the true relationship is not linear, the model will produce biased predictions.
- How to check:  
  - Residual plots (should show no pattern)
  - Scatter plots of \( X \) vs. \( Y \)
  - Partial regression plots

### 2. 🔁 Independence of Errors

- What it means:  
  Residuals (errors) should be independent of each other.  
  One observation should not influence another.
- Why it matters:  
  Correlated errors can lead to underestimated standard errors and unreliable hypothesis tests.
- How to check:  
  - Durbin–Watson test (especially for time series)
  - Plot of residuals vs. time or order of data

### 3. 📉 Homoscedasticity

- What it means:  
  The variance of the residuals is constant across all levels of the independent variables.  
  (No funnel shape in residual plots.)
- Why it matters:  
  Heteroscedasticity can cause inefficient estimates and invalid significance tests.
- How to check:  
  - Plot residuals vs. fitted values
  - Breusch–Pagan test
  - White test

### 4. 📊 Normality of Errors

- What it means:  
  The residuals should be normally distributed.
- Why it matters:  
  Normality of errors ensures that confidence intervals and hypothesis tests are valid.
- How to check:  
  - Q-Q plot of residuals
  - Histogram of residuals
  - Shapiro–Wilk or Kolmogorov–Smirnov test

> 📝 Note: Normality is less critical for large sample sizes (by the Central Limit Theorem).

### 5. 🔀 No Multicollinearity

- What it means:  
  Independent variables should not be highly correlated with each other.
- Why it matters:  
  High multicollinearity inflates standard errors, making it difficult to determine the effect of individual predictors.
- How to check:  
  - Variance Inflation Factor (VIF) — typically VIF > 10 is problematic
  - Correlation matrix / heatmap

### 6. ⚠️ No Endogeneity *(Optional but Important)*

- What it means:  
  Independent variables should be uncorrelated with the error term.
- Why it matters:  
  Endogeneity leads to biased and inconsistent coefficient estimates.
- Common causes:  
  - Omitted variable bias
  - Simultaneous causality
  - Measurement errors
- How to check or handle:  
  - Use instrumental variables
  - Include relevant variables
  - Use advanced models (e.g., 2SLS)

### ✅ Summary Table

| Assumption                  | Description                                        | Check With                                     |
|------------------------------|----------------------------------------------------|------------------------------------------------|
| Linearity                   | Linear relationship between X and Y                | Residual plots, scatter plots                  |
| Independence                | Errors are independent                             | Durbin–Watson, residual vs. time plot          |
| Homoscedasticity            | Constant variance of residuals                      | Residual plot, Breusch–Pagan                   |
| Normality of Errors         | Errors follow normal distribution                   | Q-Q plot, Shapiro–Wilk                         |
| No Multicollinearity        | Predictors not strongly correlated                  | VIF, correlation matrix                        |
| No Endogeneity              | Predictors not correlated with error term           | Instrumental variables, model checks           |

### 🧠 Key Takeaway

> Satisfying these assumptions makes linear regression statistically sound,  
> ensuring your coefficients, confidence intervals, and p-values are trustworthy.

---

Example Neural Network for MNIST Classification
Here’s a complete example of defining a simple feedforward neural network for classifying MNIST digits.

This network consists of an input layer, two hidden layers, and an output layer:

* Input Layer: The 28x28 image is flattened into a 784-dimensional vector.
* First Hidden Layer: A fully connected layer (fc1) with 256 neurons, followed by a ReLU activation.
* Second Hidden Layer: Another fully connected layer (fc2) with 128 neurons, followed by a ReLU activation.
* Output Layer: A fully connected layer (fc3) with 10 neurons, corresponding to the 10 classes for classification.

The reduction in the number of features from 256 in the first hidden layer (`fc1`) to 128 in the second hidden layer (`fc2`) is a common architectural choice in neural networks. Neural networks learn features in a hierarchical manner. The first hidden layer (`fc1`) might learn a broader set of more basic features directly from the input (the flattened image).

As you go deeper into the network, subsequent layers learn to combine and refine these lower-level features into more abstract and task-specific representations. Reducing the number of neurons in deeper layers can encourage the network to focus on the most salient and important features needed for the classification task.

Full Code:
```python
criterion = nn.CrossEntropyLoss()
# Adam optimiser is used here with a learning rate of 0.001.
optimizer = optim.Adam(model.parameters(), lr=0.001)
```

Step B: Training Loop Example
After defining your model and setting up the loss function and optimiser, you enter the training phase. During training, the model's parameters are updated based on the computed gradients. In PyTorch, it is important to set the model to training mode using `model.train()` before the training loop. This informs the network that it is in training mode so that certain layers (such as dropout and batch normalisation) behave appropriately.

Training Mode vs Evaluation Mode
- Training Mode (`model.train()`):  
  - Activates dropout layers, meaning that during training, some neurons are randomly disabled.  
  - Ensures that batch normalisation layers use the statistics of the current mini batch.  
  - All layers are set to update their internal parameters based on the gradient computations.

- Evaluation Mode (`model.eval()`):  
  - Disables dropout, so that all neurons are used during inference.  
  - Batch normalisation layers use the running averages computed during training instead of the statistics of the current batch.  
  - This mode should be used when the model is being tested or used for predictions, as it ensures consistent behaviour.

Below is an example of a training loop where the model is set to training mode before training and evaluation mode after training. It is followed by code that demonstrates how to save and then load the model.

Example Training Loop and Mode Switching
```python
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# Define a series of transformations:
transform = transforms.Compose([
    transforms.ToTensor(),               # Convert images to PyTorch tensors
    transforms.Normalize((0.5,), (0.5,))   # Normalise pixel values to the range [-1, 1]
])

# Download and prepare the MNIST training dataset:
train_dataset = datasets.MNIST(root='./data', train=True, download=True, transform=transform)

# Create a DataLoader to iterate over the dataset in batches:
train_loader = DataLoader(dataset=train_dataset, batch_size=64, shuffle=True)

# Example: Iterate through one batch of data:
for images, labels in train_loader:
    print("Batch image shape:", images.shape)   # Expected: [64, 1, 28, 28]
    print("Batch label shape:", labels.shape)   # Expected: [64]
    Break
`torchvision` is a PyTorch library providing popular datasets, model architectures, and common image transformations for computer vision tasks.
num_epochs = 10

# Move the model to the appropriate device (CPU or GPU) before training
model.to(device)

# Set the model to training mode before starting the training loop
model.train()

for epoch in range(num_epochs):
    for images, labels in train_loader:  # train_loader is defined
        images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()              # Clear gradients from the previous step
        outputs = model(images)            # Forward pass: compute predictions
        loss = criterion(outputs, labels)  # Compute the loss between predictions and true labels
        loss.backward()                    # Backpropagation: compute gradients
        optimizer.step()                   # Update model parameters using the optimiser

    print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {loss.item():.4f}")
```

The following code demonstrates how to evaluate a deep learning model in PyTorch. The model is set to evaluation mode with `model.eval()`.
* Within a `torch.no_grad()` block, a batch of data is processed to obtain raw output scores (logits).
* The predicted classes are determined by selecting the highest score for each sample, and these predictions are compared with the true labels to count correct matches.
* Finally, the accuracy is calculated for the batch, offering a clear measure of the model's performance on new, unseen data.

```python
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# Define transformations for the MNIST test set
transform = transforms.Compose([
    transforms.ToTensor(),               # Convert images to PyTorch tensors
    transforms.Normalize((0.5,), (0.5,))   # Normalise pixel values to the range [-1, 1]
])

# Load the MNIST test dataset (train=False indicates the test set)
test_dataset = datasets.MNIST(root='./data', train=False, download=True, transform=transform)

# Define the test_loader to iterate through the test dataset in batches
test_loader = DataLoader(dataset=test_dataset, batch_size=64, shuffle=False)
# After training, set the model to evaluation mode for inference
model.eval()

# Variables to accumulate correct predictions and total samples in the batch
correct = 0
total = 0

with torch.no_grad():  # Disables gradient computation for inference
    for images, labels in test_loader:
        images, labels = images.to(device), labels.to(device)
        outputs = model(images)
        # Convert the raw outputs (logits) to predicted class indices
        _, predicted = torch.max(outputs, dim=1)

        # Count total samples and correct predictions
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

# Compute accuracy for the batch
accuracy = correct / total * 100
print(f'Accuracy on this batch: {accuracy:.2f}%')
```

In the above example:
- The model is switched to training mode with `model.train()` before the training loop begins.
- After the training loop, `model.eval()` is called. This ensures that when you use the model for inference (i.e. making predictions), dropout is disabled and batch normalisation uses the running averages.
- The `torch.no_grad()` context is used during inference to prevent gradient calculations, which reduces memory consumption and speeds up computation.

5.4.1 Saving and Loading Your Model
Once your model has been trained, it is common to save its parameters (weights) so that you can reload them later without retraining the model.

Saving the Model
You can save the model's state dictionary, which contains all the model parameters, using the `torch.save()` function:
`torch.save(model.state_dict(), 'model.pth')`

Loading the Model
To load the saved model, create a new instance of the model class and load the saved parameters using the `load_state_dict()` method. Finally, set the model to evaluation mode if you intend to use it for inference:
```python
loaded_model.load_state_dict(torch.load('model.pth'))
# Set the model to evaluation mode
loaded_model.eval()
# Move the model to the appropriate device (CPU or GPU) before training
loaded_model.to(device)

# Using the loaded model to make predictions on a batch of test images:
with torch.no_grad():  # Disable gradient computation for inference
    for images, labels in test_loader:  # test_loader is defined above and contains the test data
        # Move images and labels to the appropriate device (CPU or GPU)
        images, labels = images.to(device), labels.to(device)

        # Get the raw outputs (logits) from the model
        outputs = loaded_model(images)

        # Convert the logits to predicted class indices
        _, predicted = torch.max(outputs, dim=1)

        # Print the predicted classes and the actual labels for this batch
        print("Predicted classes:", predicted)
        print("Actual classes:", labels)

        # Process only one batch for demonstration purposes
        break
```

Starting the Server in Jupyter Notebook

If you are running the FastAPI server inside a Jupyter Notebook, you can start it directly from a code cell.

This Python script is designed to safely and automatically restart a FastAPI web server. It is especially useful for developers who need to stop a running server and start it again from a single command without doing it manually.

1. Define the Restart Function
* The code defines a function called `restart_server()` that takes a `port` number as an argument, which defaults to `8000`. This function contains all the steps needed to perform the restart.

2. Stop the Existing Server
* The script first attempts to find and stop any program that might already be using the specified port.
* It uses the `subprocess.run()` command to execute a shell command: `kill -9 $(lsof -t -i:{port})`.
    * `lsof -t -i:{port}` is a command that looks for a process using that specific port and returns its process ID (PID).
    * `kill -9` then forcefully stops that process using the PID.
* A `try-except` block is used to prevent the script from crashing if no server is found on that port, which is a common scenario.
* A short delay (`time.sleep(1)`) is added to give the operating system enough time to completely shut down the old process before trying to start a new one.

3. Start the New Server
* Next, the script starts a new server instance.
* It uses `subprocess.Popen()` to run the command `uvicorn main:app --reload --port {port}`.
    * `uvicorn` is the web server that runs the FastAPI application.
    * `main:app` tells `uvicorn` to look for a FastAPI application named `app` inside a file called `main.py`.
    * The `--reload` flag is a key feature for development. It tells the server to automatically restart itself whenever a change is saved in the source code files, so the user doesn't have to manually restart it.
* The `Popen()` function is used instead of `run()` because it starts the server in the background, allowing the Python script to continue running and complete its task.
* A second delay (`time.sleep(2)`) is included to give the new server time to fully start up and become ready to accept requests.

4. Execute the Script
* The final line, `restart_server()`, calls the function to begin the entire process. This line is what actually triggers the server to stop (if necessary) and then start again.

```python
import subprocess   # Lets us run system commands directly from Python
import time         # Provides time-related functions like delays

# Define a function to restart the FastAPI server safely
def restart_server(port=8000):
    """Safely restart the FastAPI server"""

    # First, try to stop any server already running on the given port
    try:
        # 'lsof -t -i:{port}' finds the process ID using the port
        # 'kill -9' forcefully stops that process
        # subprocess.run executes this command in the system shell
        subprocess.run(f"kill -9 $(lsof -t -i:{port})", shell=True)
        print(f"✅ Stopped existing server on port {port}")

        # Wait for 1 second to make sure the process stops completely
        time.sleep(1)
    except:
        # If there was no server running, print this message
        print(f"ℹ️ No existing server on port {port}")

    # Now, start a new FastAPI server on the same port
    print(f"🚀 Starting server on port {port}...")

    # Use subprocess.Popen to start the server in the background
    # 'uvicorn main:app --reload --port {port}' runs the FastAPI app
    # --reload makes the server restart automatically when files change
    subprocess.Popen(f"uvicorn main:app --reload --port {port}", shell=True)

    # Wait for 2 seconds to give the server time to start up
    time.sleep(2)

    # Print the URL so the user knows where to access the server
    print(f"✅ Server running at http://127.0.0.1:{port}")

# Call the function to restart the server on port 8000
restart_server()
```

3. Running the Server
In this section, we will learn what the command  
```bash
!uvicorn main:app --reload
````
does and how to stop properly when you're done.

What the command does
1. `uvicorn`
   * This is the web server that runs your FastAPI application.

2. `main:app`
   * `main` refers to the name of your Python file without the `.py` extension
      * If your file is called `main.py`, then you use `main`.
      * If your file is called `server.py`, then you must use `server` instead.

   * `app` refers to the name of the FastAPI application instance inside that Python file.
      * If you wrote `app = FastAPI()`, then you use `app`.
      * If you named it `my_app = FastAPI()`, then you must run `uvicorn main:my_app --reload` instead.

3. `--reload`
   * This flag enables auto-reload mode:
     * If you make changes to your code, the server restarts automatically.
     * Saves you from restarting the server manually every time you edit the code.
   * Useful in development, but not recommended in production.

How to Stop the Server
* When you're done, you must stop the running server.

How to Stop the Server in Jupyter Notebook
* When you run the `uvicorn` command inside a Jupyter Notebook code cell, the server keeps running until you stop it manually.

Here is the recommended way:
Option 1: Use the Stop Button in Jupyter (Most Common)
- Look at the toolbar at the top of Jupyter Notebook.
- Click the Stop (■) button — it looks like a square.
- This will interrupt the running cell and stop the server safely.

Option 2: Use the Kernel Menu
- Go to Kernel → Interrupt in the Jupyter Notebook menu.
- This sends an interrupt signal to the server, similar to `CTRL+C` in the terminal.

Note:
When running `uvicorn` in Jupyter, you don't use `CTRL+C` or `CMD+C` like in a terminal. Instead, rely on the Stop button or the Kernel menu to interrupt or restart the server process.

Streamlit App Runner Script
The previous script creates a FastAPI web API for churn prediction. This current script is a test suite that verifies the API's functionality. It is designed to automate the process of starting a Streamlit web application. It ensures a clean launch by first stopping any previous instances of the app.

1. Define the Launch Function
* The script defines a function `run_streamlit_app()` that takes an optional `port` number. This function contains all the logic for launching the app.

2. Pre-Launch Checks
* It first checks if the main application file, `streamlit_app.py`, actually exists. If not, it prints an error message and stops, preventing a crash.
* Next, it attempts to kill any existing process running on the specified port. This prevents port conflicts, which are a common issue when restarting web applications.

3. Launch the Application
* The script uses `subprocess.Popen()` to execute the command that runs the Streamlit app.
* It passes arguments to the command to specify the app file, the port to use, and a headless mode which makes it easier to run in the background.
* The use of `Popen` allows the script to continue running after launching the app, so it can display a confirmation message to the user.

4. Feedback
* After launching the app, the script pauses briefly to give the server time to start up.
* It then prints a confirmation message, including the URL where the user can access the running application and a list of its features. It also provides instructions on how to stop the app.

```python
import subprocess
import time
import threading
import os

def run_streamlit_app(port=8501):
    """Run the Streamlit app"""

    # Check if streamlit_app.py exists
    if not os.path.exists("streamlit_app.py"):
        print("❌ streamlit_app.py not found. Create it first using the code above.")
        return

    # Kill any existing Streamlit processes
    try:
        subprocess.run(f"kill -9 $(lsof -t -i:{port})", shell=True)
        print(f"✅ Stopped existing Streamlit app on port {port}")
        time.sleep(1)
    except:
        print(f"ℹ️ No existing Streamlit app on port {port}")

    # Start Streamlit
    print(f"🚀 Starting Streamlit app on port {port}...")

    # Run Streamlit in the background
    process = subprocess.Popen([
        "streamlit", "run", "streamlit_app.py",
        "--server.port", str(port),
        "--server.headless", "true"
    ])

    time.sleep(3)  # Give it time to start

    print(f"✅ Streamlit app running at http://localhost:{port}")
    print("📱 The app includes:")
    print("   • Single customer prediction interface")
    print("   • Batch analysis capabilities")
    print("   • Model insights and feature importance")
    print("   • API testing tools")
    print("\n🛑 To stop: Use Ctrl+C in terminal or restart your kernel")

    return process

# Run the Streamlit app
streamlit_process = run_streamlit_app()
```
