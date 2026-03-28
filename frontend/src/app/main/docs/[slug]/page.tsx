import Link from "next/link"

const pageTitles: Record<string, string> = {
  // Define the Problem
  "supervised-learning":       "Supervised Learning",
  "unsupervised-learning":     "Unsupervised Learning",
  "reinforcement-learning":    "Reinforcement Learning",
  "classification":            "Classification",
  "regression":                "Regression",
  "clustering":                "Clustering",
  "problem-framing":           "Problem Framing",
  "success-metrics":           "Success Metrics",
  "business-understanding":    "Business Understanding",
  // Data Collection
  "data-sources":              "Data Sources",
  "databases":                 "Databases",
  "apis":                      "APIs",
  "web-scraping":              "Web Scraping",
  "public-datasets":           "Public Datasets (Kaggle, UCI)",
  "data-labeling":             "Data Labeling",
  "sampling-strategies":       "Sampling Strategies",
  "data-privacy-ethics":       "Data Privacy & Ethics",
  "survey-design":             "Survey Design",
  // Data Preprocessing & Exploration
  "eda":                       "Exploratory Data Analysis (EDA)",
  "data-cleaning":             "Data Cleaning",
  "missing-value-imputation":  "Missing Value Imputation",
  "outlier-detection":         "Outlier Detection",
  "feature-engineering":       "Feature Engineering",
  "feature-scaling":           "Feature Scaling & Normalization",
  "encoding-categorical-variables": "Encoding Categorical Variables",
  "dimensionality-reduction":  "Dimensionality Reduction (PCA, t-SNE)",
  "train-test-split":          "Train/Test/Validation Splitting",
  "data-augmentation":         "Data Augmentation",
  "class-imbalance":           "Handling Class Imbalance (SMOTE)",
  // Model Selection
  "linear-logistic-regression": "Linear & Logistic Regression",
  "decision-trees":            "Decision Trees",
  "random-forests":            "Random Forests",
  "svms":                      "SVMs",
  "k-nearest-neighbors":       "k-Nearest Neighbors",
  "naive-bayes":               "Naive Bayes",
  "gradient-boosting":         "Gradient Boosting (XGBoost, LightGBM)",
  "neural-networks":           "Neural Networks",
  "ensemble-methods":          "Ensemble Methods",
  "baseline-models":           "Baseline Models",
  "bias-variance-tradeoff":    "Bias-Variance Tradeoff",
  "no-free-lunch-theorem":     "No Free Lunch Theorem",
  // Training the Model
  "loss-functions":            "Loss & Cost Functions",
  "gradient-descent":          "Gradient Descent",
  "backpropagation":           "Backpropagation",
  "learning-rate":             "Learning Rate",
  "batch-size":                "Batch Size",
  "epochs":                    "Epochs",
  "optimizers":                "Optimizers (SGD, Adam)",
  "regularization":            "Regularization (L1/L2, Dropout)",
  "convergence":               "Convergence",
  "mini-batch-training":       "Mini-Batch Training",
  // Evaluation
  "accuracy":                  "Accuracy",
  "precision":                 "Precision",
  "recall":                    "Recall",
  "f1-score":                  "F1 Score",
  "confusion-matrix":          "Confusion Matrix",
  "roc-auc":                   "ROC/AUC",
  "mean-squared-error":        "Mean Squared Error",
  "r-squared":                 "R-Squared",
  "cross-validation":          "Cross-Validation (k-Fold)",
  "overfitting-underfitting":  "Overfitting & Underfitting",
  "model-interpretability":    "Model Interpretability (SHAP, LIME)",
  "stratified-sampling":       "Stratified Sampling",
  // Hyperparameter Tuning
  "grid-search":               "Grid Search",
  "random-search":             "Random Search",
  "bayesian-optimization":     "Bayesian Optimization",
  "early-stopping":            "Early Stopping",
  "learning-rate-scheduling":  "Learning Rate Scheduling (ReduceLROnPlateau)",
  "model-comparison":          "Model Comparison",
  "validation-curves":         "Validation Curves",
  "hyperparameter-sensitivity": "Hyperparameter Sensitivity",
  // Deployment & Monitoring
  "model-serving":             "Model Serving (REST APIs, FastAPI, Flask)",
  "containerization":          "Containerization (Docker)",
  "cicd-pipelines":            "CI/CD Pipelines",
  "data-drift":                "Data Drift",
  "model-drift":               "Model Drift",
  "ab-testing":                "A/B Testing",
  "model-versioning":          "Model Versioning",
  "mlops":                     "MLOps",
  "retraining-strategies":     "Retraining Strategies",
  "edge-deployment":           "Edge Deployment",
  "latency-throughput":        "Latency & Throughput Optimization",
}

export default function DocPage({ params }: { params: { slug: string } }) {
  const title = pageTitles[params.slug] ?? params.slug

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      <div>
        <Link
          href="/main/docs"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Docs
        </Link>
      </div>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">Content coming soon.</p>
    </div>
  )
}
