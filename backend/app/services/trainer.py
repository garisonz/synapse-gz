"""
app/services/trainer.py — ML model training and comparison logic.

Provides two public functions used by the /api/train and /api/compare routes.

Supported models:
  Classification: logistic_regression, random_forest, xgboost, svm, knn,
                  neural_network
  Regression:     random_forest, xgboost, svm, knn, neural_network

Internal helper:
  _prepare(df, target) → (X, y)
      Separates features from the target column. Label-encodes any object
      columns in X (so all inputs are numeric), then fills remaining NaNs
      with column medians. Returns X (DataFrame) and y (Series).

train_model(df, target, task_type, model_name, test_split) → TrainResponse
  1. Calls _prepare() to get X and y.
  2. For classification, label-encodes y.
  3. Looks up the model class and its default hyperparameters from the
     CLASSIFICATION_MODELS / REGRESSION_MODELS registries.
  4. Splits data into train/test with the given test_split ratio.
  5. Fits the model and generates predictions.
  6. Computes and returns metrics:
       Classification — Accuracy, F1 (weighted), AUC (binary tasks only),
                        test sample count.
       Regression     — RMSE, R², MAE, test sample count.

compare_models(df, target, task_type, model_names, primary_metric)
              → CompareResponse
  1. Calls _prepare() and optionally label-encodes y.
  2. Creates a single train/test split (20% test, random_state=42) shared
     across all models so comparisons are fair.
  3. Trains each model in model_names, scoring with accuracy (classification)
     or R² (regression). Failed models score 0.0.
  4. Identifies the best model by score and returns a CompareResponse with
     the best model name, its score, total model count, and a per-model
     breakdown.
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.svm import SVC, SVR
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    roc_auc_score,
    mean_squared_error,
    r2_score,
    mean_absolute_error,
)
from xgboost import XGBClassifier, XGBRegressor
from app.schemas.upload import Metric
from app.schemas.train import TrainResponse, CompareResponse

CLASSIFICATION_MODELS: dict[str, type] = {
    "logistic_regression": LogisticRegression,
    "random_forest": RandomForestClassifier,
    "xgboost": XGBClassifier,
    "svm": SVC,
    "knn": KNeighborsClassifier,
    "neural_network": MLPClassifier,
}

REGRESSION_MODELS: dict[str, type] = {
    "random_forest": RandomForestRegressor,
    "xgboost": XGBRegressor,
    "svm": SVR,
    "knn": KNeighborsRegressor,
    "neural_network": MLPRegressor,
}

CLASSIFICATION_DEFAULTS: dict[str, dict] = {
    "logistic_regression": {"max_iter": 1000, "random_state": 42},
    "random_forest": {"n_estimators": 100, "random_state": 42},
    "xgboost": {"n_estimators": 100, "random_state": 42, "eval_metric": "logloss", "verbosity": 0},
    "svm": {"probability": True, "random_state": 42},
    "knn": {"n_neighbors": 5},
    "neural_network": {"max_iter": 300, "random_state": 42},
}

REGRESSION_DEFAULTS: dict[str, dict] = {
    "random_forest": {"n_estimators": 100, "random_state": 42},
    "xgboost": {"n_estimators": 100, "random_state": 42, "verbosity": 0},
    "svm": {},
    "knn": {"n_neighbors": 5},
    "neural_network": {"max_iter": 300, "random_state": 42},
}


def _prepare(df: pd.DataFrame, target: str) -> tuple[pd.DataFrame, pd.Series]:
    X = df.drop(columns=[target])
    y = df[target]
    # Encode categoricals in X
    for col in X.select_dtypes(include="object").columns:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
    X = X.fillna(X.median(numeric_only=True))
    return X, y


def train_model(
    df: pd.DataFrame,
    target: str,
    task_type: str,
    model_name: str,
    test_split: float,
) -> TrainResponse:
    X, y = _prepare(df, target)

    if task_type == "classification":
        le = LabelEncoder()
        y = le.fit_transform(y.astype(str))
        model_cls = CLASSIFICATION_MODELS.get(model_name, RandomForestClassifier)
        kwargs = CLASSIFICATION_DEFAULTS.get(model_name, {})
    else:
        model_cls = REGRESSION_MODELS.get(model_name, RandomForestRegressor)
        kwargs = REGRESSION_DEFAULTS.get(model_name, {})

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_split, random_state=42
    )

    model = model_cls(**kwargs)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    metrics: list[Metric] = []

    if task_type == "classification":
        acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)
        metrics.append(Metric(label="Accuracy", value=f"{acc:.1%}"))
        metrics.append(Metric(label="F1 Score", value=f"{f1:.3f}"))
        # AUC only for binary
        if len(np.unique(y_test)) == 2 and hasattr(model, "predict_proba"):
            proba = model.predict_proba(X_test)[:, 1]
            auc = roc_auc_score(y_test, proba)
            metrics.append(Metric(label="AUC", value=f"{auc:.3f}"))
        metrics.append(Metric(label="Test samples", value=len(y_test)))
    else:
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        r2 = float(r2_score(y_test, y_pred))
        mae = float(mean_absolute_error(y_test, y_pred))
        metrics.append(Metric(label="RMSE", value=f"{rmse:.4f}"))
        metrics.append(Metric(label="R²", value=f"{r2:.4f}"))
        metrics.append(Metric(label="MAE", value=f"{mae:.4f}"))
        metrics.append(Metric(label="Test samples", value=len(y_test)))

    return TrainResponse(metrics=metrics)


def compare_models(
    df: pd.DataFrame,
    target: str,
    task_type: str,
    model_names: list[str],
    primary_metric: str,
) -> CompareResponse:
    X, y = _prepare(df, target)

    if task_type == "classification":
        le = LabelEncoder()
        y = le.fit_transform(y.astype(str))

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scores: dict[str, float] = {}

    for name in model_names:
        try:
            if task_type == "classification":
                model_cls = CLASSIFICATION_MODELS.get(name, RandomForestClassifier)
                kwargs = CLASSIFICATION_DEFAULTS.get(name, {})
                model = model_cls(**kwargs)
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)
                score = accuracy_score(y_test, y_pred)
            else:
                model_cls = REGRESSION_MODELS.get(name, RandomForestRegressor)
                kwargs = REGRESSION_DEFAULTS.get(name, {})
                model = model_cls(**kwargs)
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)
                score = float(r2_score(y_test, y_pred))
            scores[name] = round(score, 4)
        except Exception:
            scores[name] = 0.0

    best_name = max(scores, key=lambda k: scores[k])
    metric_label = "Accuracy" if task_type == "classification" else "R²"

    metrics: list[Metric] = [
        Metric(label="Best Model", value=best_name.replace("_", " ").title()),
        Metric(label=metric_label, value=f"{scores[best_name]:.1%}" if task_type == "classification" else f"{scores[best_name]:.4f}"),
        Metric(label="Models", value=len(scores)),
    ]
    for name, score in scores.items():
        display = f"{score:.1%}" if task_type == "classification" else f"{score:.4f}"
        metrics.append(Metric(label=name.replace("_", " ").title(), value=display))

    return CompareResponse(metrics=metrics)
