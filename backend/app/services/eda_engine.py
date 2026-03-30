"""
app/services/eda_engine.py — Exploratory Data Analysis (EDA) business logic.

Contains a single public function run_eda() that performs one or more analysis
passes over a pandas DataFrame and returns an EDAResponse with a flat list of
Metric objects and optional base64-encoded plot images.

Analysis types (controlled by the `analyses` list passed in from the router):

  "summary"      — Counts numeric vs. categorical columns and appends the mean
                   for the first three numeric columns.

  "missing"      — Finds columns with missing values and reports the top 3 by
                   missing count. Reports "None" if the dataset is complete.

  "distribution" — Plots histograms for up to the first 4 numeric columns using
                   matplotlib (dark-themed). The figure is serialised to a
                   base64 PNG via plot_utils.fig_to_base64() and added to the
                   plots list.

  "correlation"  — Computes a Pearson correlation matrix for all numeric columns
                   and renders it as a seaborn heatmap (annotated when ≤10
                   columns). Also reports the most strongly correlated pair as a
                   Metric.

  "outliers"     — Uses the IQR method (Q1 − 1.5×IQR, Q3 + 1.5×IQR) to count
                   outliers per numeric column, then reports the total count and
                   the column with the most outliers.

  target_column  — If provided and valid, appends class count and most-common
                   class metrics (useful for classification targets).

matplotlib is set to the "Agg" non-interactive backend so plots can be rendered
in a headless server environment without a display.
"""
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

    if "box_plot" in analyses and numeric_cols:
        cols_to_plot = numeric_cols[:6]
        n = len(cols_to_plot)
        fig, axes = plt.subplots(1, n, figsize=(max(4 * n, 6), 4))
        if n == 1:
            axes = [axes]
        for ax, col in zip(axes, cols_to_plot):
            data = df[col].dropna()
            bp = ax.boxplot(data, patch_artist=True, widths=0.5,
                            medianprops=dict(color="#34d399", linewidth=2),
                            boxprops=dict(facecolor="#1f2937", edgecolor="#4b5563"),
                            whiskerprops=dict(color="#6b7280"),
                            capprops=dict(color="#6b7280"),
                            flierprops=dict(marker="o", color="#f87171", markersize=3, alpha=0.6))
            ax.set_title(col, fontsize=9)
            ax.set_xticks([])
            ax.tick_params(labelsize=7)
        fig.patch.set_facecolor("#0d1117")
        for ax in axes:
            ax.set_facecolor("#161b22")
            ax.tick_params(colors="#8b949e")
            ax.title.set_color("#e6edf3")
            for spine in ax.spines.values():
                spine.set_edgecolor("#30363d")
        plt.tight_layout()
        plots.append(fig_to_base64(fig))

    if "scatter" in analyses and len(numeric_cols) >= 2:
        cols_to_plot = numeric_cols[:4]
        n = len(cols_to_plot)
        sample = df[cols_to_plot].dropna().sample(min(500, len(df)), random_state=42)
        fig, axes = plt.subplots(n, n, figsize=(2.5 * n, 2.5 * n))
        for i in range(n):
            for j in range(n):
                ax = axes[i][j] if n > 1 else axes
                if i == j:
                    sample[cols_to_plot[i]].hist(ax=ax, bins=20, color="#818cf8", edgecolor="none")
                else:
                    ax.scatter(sample[cols_to_plot[j]], sample[cols_to_plot[i]],
                               s=6, alpha=0.5, color="#34d399", linewidths=0)
                ax.set_facecolor("#161b22")
                ax.tick_params(colors="#8b949e", labelsize=6)
                for spine in ax.spines.values():
                    spine.set_edgecolor("#30363d")
                if i == n - 1:
                    ax.set_xlabel(cols_to_plot[j], fontsize=7, color="#8b949e")
                if j == 0:
                    ax.set_ylabel(cols_to_plot[i], fontsize=7, color="#8b949e")
        fig.patch.set_facecolor("#0d1117")
        plt.tight_layout()
        plots.append(fig_to_base64(fig))

    if "bar_chart" in analyses:
        cat_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
        cat_cols = [c for c in cat_cols if df[c].nunique() <= 30][:4]
        if cat_cols:
            n = len(cat_cols)
            fig, axes = plt.subplots(1, n, figsize=(4 * n, 3))
            if n == 1:
                axes = [axes]
            for ax, col in zip(axes, cat_cols):
                counts = df[col].value_counts().head(10)
                bars = ax.barh(range(len(counts)), counts.values, color="#818cf8", edgecolor="none")
                ax.set_yticks(range(len(counts)))
                ax.set_yticklabels(counts.index.astype(str), fontsize=7)
                ax.set_title(col, fontsize=9)
                ax.tick_params(labelsize=7)
                ax.invert_yaxis()
            fig.patch.set_facecolor("#0d1117")
            for ax in axes:
                ax.set_facecolor("#161b22")
                ax.tick_params(colors="#8b949e")
                ax.title.set_color("#e6edf3")
                for spine in ax.spines.values():
                    spine.set_edgecolor("#30363d")
            plt.tight_layout()
            plots.append(fig_to_base64(fig))

    if target_column and target_column in df.columns:
        if df[target_column].dtype == object or df[target_column].nunique() < 20:
            class_counts = df[target_column].value_counts()
            metrics.append(Metric(label="Classes", value=int(df[target_column].nunique())))
            metrics.append(Metric(label="Most common", value=str(class_counts.index[0])))

    return EDAResponse(metrics=metrics, plots=plots)
