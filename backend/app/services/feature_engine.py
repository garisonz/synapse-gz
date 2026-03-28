"""
app/services/feature_engine.py — Feature engineering / transformation logic.

Contains a single public function apply_transform() that takes a DataFrame, a
list of target columns, a transformation method, and an optional imputation
strategy, then returns a FeatureResponse with column count metrics.

How it works:
  1. Imputation (optional, applied first):
       "knn"    — sklearn KNNImputer (k=5) on numeric columns.
       "mean"   — SimpleImputer with mean strategy.
       "median" — SimpleImputer with median strategy.
       "mode"   — SimpleImputer with most_frequent strategy.
     Only numeric columns within the selected `columns` list are imputed.

  2. Transformation (applied to the selected columns):
       "onehot"     — pd.get_dummies() on categorical columns (nunique < 20 or
                      dtype == object). Replaces original columns with dummies;
                      tracks net new columns as `generated`.
       "label"      — LabelEncoder per object column; in-place, no new columns.
       "standard"   — StandardScaler: zero mean, unit variance on numeric cols.
       "minmax"     — MinMaxScaler: scales values to [0, 1].
       "robust"     — RobustScaler: uses median/IQR, outlier-resistant.
       "log"        — Adds a {col}_log column (log1p of clipped-to-0 values).
       "sqrt"       — Adds a {col}_sqrt column (sqrt of clipped-to-0 values).
       "polynomial" — PolynomialFeatures(degree=2): adds interaction and squared
                      terms for numeric columns; new columns appended in-place.

  3. Returns FeatureResponse with three Metrics:
       Original  — column count before transformation
       Generated — net new columns added (relevant for onehot/log/sqrt/poly)
       Total     — final column count after transformation
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import (
    LabelEncoder,
    StandardScaler,
    MinMaxScaler,
    RobustScaler,
)
from sklearn.impute import SimpleImputer, KNNImputer
from app.schemas.upload import Metric
from app.schemas.features import FeatureResponse


def apply_transform(
    df: pd.DataFrame,
    columns: list[str],
    method: str,
    impute_strategy: str | None = None,
) -> FeatureResponse:
    original_count = len(df.columns)
    result = df.copy()

    # Imputation first if requested
    if impute_strategy and columns:
        valid_cols = [c for c in columns if c in result.columns]
        if impute_strategy == "knn":
            imputer = KNNImputer(n_neighbors=5)
            numeric = result[valid_cols].select_dtypes(include="number")
            if not numeric.empty:
                result[numeric.columns] = imputer.fit_transform(numeric)
        else:
            strategy = "most_frequent" if impute_strategy == "mode" else impute_strategy
            imputer = SimpleImputer(strategy=strategy)
            numeric = result[valid_cols].select_dtypes(include="number")
            if not numeric.empty:
                result[numeric.columns] = imputer.fit_transform(numeric)

    # Feature transform
    valid_cols = [c for c in columns if c in result.columns]
    generated = 0

    if method == "onehot" and valid_cols:
        cat_cols = [c for c in valid_cols if result[c].dtype == object or result[c].nunique() < 20]
        if cat_cols:
            dummies = pd.get_dummies(result[cat_cols], prefix=cat_cols, drop_first=False)
            result = pd.concat([result.drop(columns=cat_cols), dummies], axis=1)
            generated = len(dummies.columns) - len(cat_cols)

    elif method == "label" and valid_cols:
        for col in valid_cols:
            if result[col].dtype == object:
                le = LabelEncoder()
                result[col] = le.fit_transform(result[col].astype(str))
        generated = 0

    elif method == "standard" and valid_cols:
        num_cols = [c for c in valid_cols if result[c].dtype in [np.float64, np.int64, "float32", "int32"]]
        if num_cols:
            scaler = StandardScaler()
            result[num_cols] = scaler.fit_transform(result[num_cols])

    elif method == "minmax" and valid_cols:
        num_cols = result[valid_cols].select_dtypes(include="number").columns.tolist()
        if num_cols:
            scaler = MinMaxScaler()
            result[num_cols] = scaler.fit_transform(result[num_cols])

    elif method == "robust" and valid_cols:
        num_cols = result[valid_cols].select_dtypes(include="number").columns.tolist()
        if num_cols:
            scaler = RobustScaler()
            result[num_cols] = scaler.fit_transform(result[num_cols])

    elif method == "log" and valid_cols:
        num_cols = result[valid_cols].select_dtypes(include="number").columns.tolist()
        for col in num_cols:
            new_col = f"{col}_log"
            result[new_col] = np.log1p(result[col].clip(lower=0))
            generated += 1

    elif method == "sqrt" and valid_cols:
        num_cols = result[valid_cols].select_dtypes(include="number").columns.tolist()
        for col in num_cols:
            new_col = f"{col}_sqrt"
            result[new_col] = np.sqrt(result[col].clip(lower=0))
            generated += 1

    elif method == "polynomial" and valid_cols:
        from sklearn.preprocessing import PolynomialFeatures
        num_cols = result[valid_cols].select_dtypes(include="number").columns.tolist()
        if num_cols:
            poly = PolynomialFeatures(degree=2, include_bias=False)
            poly_data = poly.fit_transform(result[num_cols])
            poly_names = poly.get_feature_names_out(num_cols)
            new_features = [n for n in poly_names if n not in num_cols]
            poly_df = pd.DataFrame(poly_data, columns=poly_names, index=result.index)
            for feat in new_features:
                result[feat] = poly_df[feat]
                generated += 1

    total = len(result.columns)

    return FeatureResponse(
        metrics=[
            Metric(label="Original", value=original_count),
            Metric(label="Generated", value=generated),
            Metric(label="Total", value=total),
        ]
    )
