<div align="center">

# synapse-gz

_A full-stack ML platform for end-to-end data exploration, feature engineering, and model comparison._

<p align="center">
  <a href="https://docs.python.org/3/">
    <img src="https://img.shields.io/badge/Python-3.10%2B-blue">
  </a>
  <a href="https://www.postgresql.org/docs/">
    <img src="https://img.shields.io/badge/PostgreSQL-TimeSeries-blue" alt="Database">
  </a>
</p>

</div>




## Table of Contents
 
- [About](#about)
- [Features](#features)
- [Usage](#usage)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Getting Started](#getting-started)
- [Acknowledgments](#acknowledgments)
- [Contact](#contact)



## About
 
Most data science workflows follow the same pattern: load data, clean it, explore distributions, engineer features, train models, and compare results. Yet every time, practitioners rewrite the same boilerplate in Jupyter notebooks.
 
**Synapse.GZ** eliminates that friction. Upload a CSV or Excel file, and Synapse.GZ automatically profiles your data, visualizes distributions and correlations, flags missing values, and lets you apply feature engineering transforms through a visual interface. Pick from a library of scikit-learn models, train them with one click, and compare performance side-by-side on an interactive dashboard.
 
It's built for data science students, analysts exploring datasets, and engineers who want fast baseline models without writing pipeline code from scratch.

 
## Features
 
### 📂 Data Upload & Preview
Upload CSV or Excel files and instantly preview the first rows, dtypes, shape, and memory usage in a clean data table with sorting and filtering.
 
### 📊 Automated EDA
One click generates a full exploratory data analysis report: histograms and density plots for every numeric column, a correlation heatmap, missing value matrix, class balance charts (for classification), and summary statistics — all rendered as interactive charts.
 
### 🔧 Feature Engineering
Apply transforms through a visual pipeline builder — no code required:
- **Encoding:** One-hot, label, and ordinal encoding for categoricals
- **Scaling:** Standard, MinMax, and Robust scalers
- **Transforms:** Log, square root, polynomial features, binning
- **Missing data:** Imputation strategies (mean, median, mode, KNN)
 
### 🧠 Model Comparison, Selection, & Training
Choose from a curated library of scikit-learn models (Logistic Regression, Random Forest, XGBoost, SVM, KNN, and more), configure hyperparameters through the UI, and launch training runs with automatic train/test splitting and cross-validation.
 
### 📈 Model Performance & Metrics
Compare trained models side-by-side on key metrics (accuracy, precision, recall, F1, ROC-AUC) with interactive charts, confusion matrices, and ROC curves. Identify the best performer at a glance and export results.
 
 
## Usage
 
### 1. Upload Your Dataset
 
Drag and drop a `.csv` or `.xlsx` file (up to 50 MB) onto the upload zone. Synapse parses it immediately and shows a preview table.
 
### 2. Explore with Auto EDA
 
Click **"Run EDA"** to generate distribution plots, correlation heatmaps, missing value analysis, and summary statistics for your dataset.
 
### 3. Engineer Features
 
Open the **Feature Engineering** panel to apply transforms. Select columns, choose a transform, preview the result, and add it to your pipeline. Transforms are applied in order and are fully reversible.
 
### 4. Train Models
 
Navigate to the **Train** tab, select one or more models, adjust hyperparameters if needed, and click **"Train All"**. Synapse handles splitting, fitting, and scoring automatically.
 
### 5. Compare Results
 
The **Comparison Dashboard** shows all trained models ranked by your chosen metric, with expandable detail views for confusion matrices, ROC curves, and per-class metrics.
 
### API Example
 
You can also interact with the backend directly:
 
```bash
# Upload a dataset
curl -X POST http://localhost:8000/api/upload \
  -F "file=@your_data.csv"
 
# Trigger automated EDA
curl http://localhost:8000/api/eda/{dataset_id}
 
# Train a model
curl -X POST http://localhost:8000/api/train \
  -H "Content-Type: application/json" \
  -d '{"dataset_id": "abc123", "model": "random_forest", "params": {"n_estimators": 100}}'
```
 
## Tech Stack
 
| Layer            | Technology                                                                |
|------------------|---------------------------------------------------------------------------|
| **Frontend**     | Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui                   |
| **Backend**      | FastAPI (Python 3.10+)                                                    |
| **ML / Data**    | scikit-learn, Pandas, NumPy, Matplotlib, Seaborn                         |
| **Infra**        | Vercel (frontend), Uvicorn                 |
 
 
## Architecture
 
```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Frontend                       │
│         (React + TypeScript + Tailwind + shadcn/ui)         │
│                                                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │
│  │  Upload &  │  │  EDA       │  │  Training & Comparison │ │
│  │  Preview   │  │  Dashboard │  │  Dashboard             │ │
│  └────────────┘  └────────────┘  └────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │  REST API (JSON)
                           ▼
┌────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                         │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  /api/upload │  │  /api/eda    │  │  /api/train  │      │
│  │  File parsing│  │  Pandas      │  │  scikit-learn│      │
│  │  & validation│  │  profiling   │  │  pipelines   │      │
│  └──────────────┘  └──────────────┘  └──────┬───────┘      │
│                                             │              │
│                                     ┌───────▼──────── ┐    │
│                                     │ Model Registry  │    │
│                                     │ (results, params│    │
│                                     │  metrics, plots)│    │
│                                     └─────────────────┘    │
└────────────────────────────────────────────────────────────┘
```
 


## Project Structure

+ synapse-gz
  + backend
    + api
      + __init__.py
      + main.py (FastAPI)
    + requirements.txt (Required Python Packages)
  + frontend

## Roadmap
 
- [ ] Project scaffolding (Next.js + FastAPI)
- [ ] CSV/Excel upload and preview
- [ ] Auto EDA report generation
- [ ] Feature engineering pipeline UI
- [ ] Model training with scikit-learn
- [ ] Model comparison dashboard
- [ ] Export trained models (pickle / ONNX)
- [ ] SHAP explainability integration
- [ ] User authentication & saved projects
- [ ] Deployment on cloud (AWS/GCP)
 
## Getting Started
 
### Installation
 
**Option 1 — Run locally**
 
```bash
# Clone the repo
git clone https://github.com/garisonz/synapse-gz.git
cd synapse-gz
 
# ----- Backend -----
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
 
# ----- Frontend (new terminal) -----
cd frontend
npm install
npm run dev
```
 
The frontend will be available at `http://localhost:3000` and the API at `http://localhost:8000`.
 
**Option 2 — Docker Compose**
 
```bash
docker compose up --build
```
 
## Acknowledgments
 
- [scikit-learn](https://scikit-learn.org/) — The ML engine powering model training
- [FastAPI](https://fastapi.tiangolo.com/) — High-performance Python API framework
- [shadcn/ui](https://ui.shadcn.com/) — Beautiful, accessible React components
- [Pandas](https://pandas.pydata.org/) — Data manipulation and analysis
- [Aurélien Géron — Hands-On Machine Learning](https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/) — Reference text
 

 
## Contact
 
**Garison Zagorski** — [LinkedIn](https://www.linkedin.com/in/garisonz) · [GitHub](https://github.com/garisonz)
 