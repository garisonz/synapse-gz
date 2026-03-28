const steps = [
  {
    number: 1,
    title: "Define the Problem",
    intro:
      "Before writing any code, you need to know exactly what you are trying to solve. Ask yourself: Is this a classification problem (e.g., \"Is this email spam or not?\"), a regression problem (e.g., \"What will the temperature be tomorrow?\"), or a clustering problem (e.g., \"How can we group our customers?\").",
    points: [
      { label: "The Goal", text: "Clearly define what success looks like and what metrics you will use to measure it." },
    ],
    links: [
      { title: "Supervised Learning",    slug: "supervised-learning" },
      { title: "Unsupervised Learning",  slug: "unsupervised-learning" },
      { title: "Reinforcement Learning", slug: "reinforcement-learning" },
      { title: "Classification",         slug: "classification" },
      { title: "Regression",             slug: "regression" },
      { title: "Clustering",             slug: "clustering" },
      { title: "Problem Framing",        slug: "problem-framing" },
      { title: "Success Metrics",        slug: "success-metrics" },
      { title: "Business Understanding", slug: "business-understanding" },
    ],
  },
  {
    number: 2,
    title: "Data Collection",
    intro:
      "An ML model is only as good as the data it learns from.",
    points: [
      { label: "The Task", text: "Gather the raw data needed to answer your question. This could come from internal databases, public datasets (like Kaggle), web scraping, or APIs." },
    ],
    links: [
      { title: "Data Sources",          slug: "data-sources" },
      { title: "Databases",             slug: "databases" },
      { title: "APIs",                  slug: "apis" },
      { title: "Web Scraping",          slug: "web-scraping" },
      { title: "Public Datasets (Kaggle, UCI)", slug: "public-datasets" },
      { title: "Data Labeling",         slug: "data-labeling" },
      { title: "Sampling Strategies",   slug: "sampling-strategies" },
      { title: "Data Privacy & Ethics", slug: "data-privacy-ethics" },
      { title: "Survey Design",         slug: "survey-design" },
    ],
  },
  {
    number: 3,
    title: "Data Preprocessing & Exploration",
    intro:
      "This is often where machine learning practitioners spend 70–80% of their time. Raw data is messy.",
    points: [
      { label: "Exploratory Data Analysis (EDA)", text: "Look at your data to understand its patterns and distributions." },
      { label: "Cleaning", text: "Handle missing values, remove duplicates, and deal with outliers." },
      { label: "Feature Engineering", text: "Transform raw data into meaningful features the algorithm can understand (e.g., extracting the day of the week from a raw timestamp)." },
      { label: "Splitting", text: "Divide your dataset into a Training Set (to teach the model) and a Testing Set (to evaluate it later)." },
    ],
    links: [
      { title: "Exploratory Data Analysis (EDA)",       slug: "eda" },
      { title: "Data Cleaning",                          slug: "data-cleaning" },
      { title: "Missing Value Imputation",               slug: "missing-value-imputation" },
      { title: "Outlier Detection",                      slug: "outlier-detection" },
      { title: "Feature Engineering",                    slug: "feature-engineering" },
      { title: "Feature Scaling & Normalization",        slug: "feature-scaling" },
      { title: "Encoding Categorical Variables",         slug: "encoding-categorical-variables" },
      { title: "Dimensionality Reduction (PCA, t-SNE)",  slug: "dimensionality-reduction" },
      { title: "Train/Test/Validation Splitting",        slug: "train-test-split" },
      { title: "Data Augmentation",                      slug: "data-augmentation" },
      { title: "Handling Class Imbalance (SMOTE)",       slug: "class-imbalance" },
    ],
  },
  {
    number: 4,
    title: "Model Selection",
    intro:
      "Once your data is ready, you pick an algorithm that fits your problem type.",
    points: [
      { label: "Examples", text: "Linear Regression for predicting continuous numbers, Decision Trees for classification, or Neural Networks for complex image recognition." },
      { label: "Tip", text: "It is usually best to start with a simple model as a baseline before jumping into highly complex deep learning." },
    ],
    links: [
      { title: "Linear & Logistic Regression",         slug: "linear-logistic-regression" },
      { title: "Decision Trees",                        slug: "decision-trees" },
      { title: "Random Forests",                        slug: "random-forests" },
      { title: "SVMs",                                  slug: "svms" },
      { title: "k-Nearest Neighbors",                   slug: "k-nearest-neighbors" },
      { title: "Naive Bayes",                           slug: "naive-bayes" },
      { title: "Gradient Boosting (XGBoost, LightGBM)", slug: "gradient-boosting" },
      { title: "Neural Networks",                       slug: "neural-networks" },
      { title: "Ensemble Methods",                      slug: "ensemble-methods" },
      { title: "Baseline Models",                       slug: "baseline-models" },
      { title: "Bias-Variance Tradeoff",                slug: "bias-variance-tradeoff" },
      { title: "No Free Lunch Theorem",                 slug: "no-free-lunch-theorem" },
    ],
  },
  {
    number: 5,
    title: "Training the Model",
    intro:
      "This is where the actual \"learning\" happens.",
    points: [
      { label: "The Task", text: "You feed your Training Set into the chosen algorithm. The model looks for patterns and mathematical relationships between your features (inputs) and your target (output)." },
    ],
    links: [
      { title: "Loss & Cost Functions",         slug: "loss-functions" },
      { title: "Gradient Descent",              slug: "gradient-descent" },
      { title: "Backpropagation",               slug: "backpropagation" },
      { title: "Learning Rate",                 slug: "learning-rate" },
      { title: "Batch Size",                    slug: "batch-size" },
      { title: "Epochs",                        slug: "epochs" },
      { title: "Optimizers (SGD, Adam)",        slug: "optimizers" },
      { title: "Regularization (L1/L2, Dropout)", slug: "regularization" },
      { title: "Convergence",                   slug: "convergence" },
      { title: "Mini-Batch Training",           slug: "mini-batch-training" },
    ],
  },
  {
    number: 6,
    title: "Evaluation",
    intro:
      "Now you test the model using the Testing Set you set aside in Step 3. Since the model has never seen this data before, it gives you an honest assessment of real-world performance.",
    points: [
      { label: "Metrics", text: "You might look at Accuracy, Precision, Recall, or Mean Squared Error, depending on your problem definition." },
      { label: "Watch out for", text: "Overfitting — when a model performs well on training data but poorly on unseen data." },
    ],
    links: [
      { title: "Accuracy",                            slug: "accuracy" },
      { title: "Precision",                           slug: "precision" },
      { title: "Recall",                              slug: "recall" },
      { title: "F1 Score",                            slug: "f1-score" },
      { title: "Confusion Matrix",                    slug: "confusion-matrix" },
      { title: "ROC/AUC",                             slug: "roc-auc" },
      { title: "Mean Squared Error",                  slug: "mean-squared-error" },
      { title: "R-Squared",                           slug: "r-squared" },
      { title: "Cross-Validation (k-Fold)",           slug: "cross-validation" },
      { title: "Overfitting & Underfitting",          slug: "overfitting-underfitting" },
      { title: "Model Interpretability (SHAP, LIME)", slug: "model-interpretability" },
      { title: "Stratified Sampling",                 slug: "stratified-sampling" },
    ],
  },
  {
    number: 7,
    title: "Hyperparameter Tuning",
    intro:
      "If your model's performance isn't where you want it to be, you can tweak its internal settings (hyperparameters).",
    points: [
      { label: "The Task", text: "Adjust the \"knobs and dials\" of the algorithm to optimize performance without overfitting — memorizing the training data instead of learning general patterns." },
    ],
    links: [
      { title: "Grid Search",                               slug: "grid-search" },
      { title: "Random Search",                             slug: "random-search" },
      { title: "Bayesian Optimization",                     slug: "bayesian-optimization" },
      { title: "Early Stopping",                            slug: "early-stopping" },
      { title: "Learning Rate Scheduling (ReduceLROnPlateau)", slug: "learning-rate-scheduling" },
      { title: "Model Comparison",                          slug: "model-comparison" },
      { title: "Validation Curves",                         slug: "validation-curves" },
      { title: "Hyperparameter Sensitivity",                slug: "hyperparameter-sensitivity" },
    ],
  },
  {
    number: 8,
    title: "Deployment & Monitoring",
    intro:
      "Once you have a model that meets your success criteria, it's time to put it to work.",
    points: [
      { label: "Deployment", text: "Integrate the model into a web app, mobile app, or internal system so users can interact with it." },
      { label: "Monitoring", text: "Data changes over time (a concept called \"data drift\"). Continuously monitor the model's performance and retrain it with fresh data as needed." },
    ],
    links: [
      { title: "Model Serving (REST APIs, FastAPI, Flask)", slug: "model-serving" },
      { title: "Containerization (Docker)",                 slug: "containerization" },
      { title: "CI/CD Pipelines",                          slug: "cicd-pipelines" },
      { title: "Data Drift",                               slug: "data-drift" },
      { title: "Model Drift",                              slug: "model-drift" },
      { title: "A/B Testing",                              slug: "ab-testing" },
      { title: "Model Versioning",                         slug: "model-versioning" },
      { title: "MLOps",                                    slug: "mlops" },
      { title: "Retraining Strategies",                    slug: "retraining-strategies" },
      { title: "Edge Deployment",                          slug: "edge-deployment" },
      { title: "Latency & Throughput Optimization",        slug: "latency-throughput" },
    ],
  },
]

export default function Docs() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Research Documentation</h1>
        <p className="text-muted-foreground text-lg">
          A comprehensive study on the technical concepts in Machine Learning
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-10">
        {steps.map((step) => (
          <div key={step.number} className="space-y-3">
            <h2 className="text-lg font-semibold">
              {step.number}. {step.title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.intro}</p>
            {step.points.length > 0 && (
              <ul className="space-y-1.5">
                {step.points.map((point) => (
                  <li key={point.label} className="text-sm text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">{point.label}:</span> {point.text}
                  </li>
                ))}
              </ul>
            )}
            {step.links.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {step.links.map((link) => (
                  <a
                    key={link.slug}
                    href={`/main/docs/${link.slug}`}
                    className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
                  >
                    {link.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}
