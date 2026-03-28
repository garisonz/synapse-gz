import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from app.schemas.upload import Metric
from app.schemas.eda import EDAResponse
from app.utils.plot_utils import fig_to_base64


def run_eda(
    df: pd.DataFrame,
    analyses: list[str],
    target_column: str | None = None,
) -> EDAResponse:
    metrics: list[Metric] = []
    plots: list[str] = []

    numeric_cols = df.select_dtypes(include="number").columns.tolist()
    total_missing = int(df.isna().sum().sum())
    missing_pct = round(total_missing / df.size * 100, 1) if df.size > 0 else 0.0

    # Always include shape metrics
    metrics.append(Metric(label="Rows", value=len(df)))
    metrics.append(Metric(label="Columns", value=len(df.columns)))
    metrics.append(Metric(label="Missing", value=f"{missing_pct}%"))

    if "summary" in analyses:
        metrics.append(Metric(label="Numeric cols", value=len(numeric_cols)))
        metrics.append(Metric(label="Categorical", value=len(df.columns) - len(numeric_cols)))
        if numeric_cols:
            desc = df[numeric_cols].describe()
            for col in numeric_cols[:3]:
                metrics.append(Metric(label=f"{col} mean", value=round(float(desc.loc["mean", col]), 3)))

    if "missing" in analyses:
        col_missing = df.isna().sum()
        top_missing = col_missing[col_missing > 0].sort_values(ascending=False).head(3)
        for col, count in top_missing.items():
            metrics.append(Metric(label=f"Missing: {col}", value=int(count)))
        if top_missing.empty:
            metrics.append(Metric(label="Missing values", value="None"))

    if "distribution" in analyses and numeric_cols:
        cols_to_plot = numeric_cols[:4]
        n = len(cols_to_plot)
        fig, axes = plt.subplots(1, n, figsize=(4 * n, 3))
        if n == 1:
            axes = [axes]
        for ax, col in zip(axes, cols_to_plot):
            df[col].dropna().hist(ax=ax, bins=20, color="#34d399", edgecolor="none")
            ax.set_title(col, fontsize=9)
            ax.set_xlabel("")
            ax.tick_params(labelsize=7)
        fig.patch.set_facecolor("#0d1117")
        for ax in axes:
            ax.set_facecolor("#161b22")
            ax.tick_params(colors="#8b949e")
            ax.title.set_color("#e6edf3")
        plt.tight_layout()
        plots.append(fig_to_base64(fig))

    if "correlation" in analyses and len(numeric_cols) >= 2:
        corr = df[numeric_cols].corr()
        fig, ax = plt.subplots(figsize=(min(10, len(numeric_cols) + 1), min(8, len(numeric_cols))))
        sns.heatmap(
            corr,
            ax=ax,
            annot=len(numeric_cols) <= 10,
            fmt=".2f",
            cmap="RdYlGn",
            center=0,
            linewidths=0.5,
            annot_kws={"size": 7},
        )
        fig.patch.set_facecolor("#0d1117")
        ax.set_facecolor("#161b22")
        ax.tick_params(colors="#8b949e", labelsize=7)
        plt.tight_layout()
        plots.append(fig_to_base64(fig))
        # Top correlated pair
        corr_vals = corr.abs().unstack().sort_values(ascending=False)
        corr_vals = corr_vals[corr_vals < 1.0]
        if not corr_vals.empty:
            top_pair = corr_vals.index[0]
            metrics.append(Metric(label="Top correlation", value=f"{top_pair[0]} / {top_pair[1]}"))

    if "outliers" in analyses and numeric_cols:
        outlier_counts: dict[str, int] = {}
        for col in numeric_cols:
            q1 = df[col].quantile(0.25)
            q3 = df[col].quantile(0.75)
            iqr = q3 - q1
            outliers = ((df[col] < q1 - 1.5 * iqr) | (df[col] > q3 + 1.5 * iqr)).sum()
            outlier_counts[col] = int(outliers)
        total_outliers = sum(outlier_counts.values())
        metrics.append(Metric(label="Outlier rows", value=total_outliers))
        top_col = max(outlier_counts, key=lambda c: outlier_counts[c])
        metrics.append(Metric(label=f"Outliers: {top_col}", value=outlier_counts[top_col]))

    if target_column and target_column in df.columns:
        if df[target_column].dtype == object or df[target_column].nunique() < 20:
            class_counts = df[target_column].value_counts()
            metrics.append(Metric(label="Classes", value=int(df[target_column].nunique())))
            metrics.append(Metric(label="Most common", value=str(class_counts.index[0])))

    return EDAResponse(metrics=metrics, plots=plots)
