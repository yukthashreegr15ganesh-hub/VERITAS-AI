"""
VERITAS AI - Model Training & Evaluation Pipeline
Trains a supervised text classification pipeline (TF-IDF + Logistic Regression)
with a Multinomial Naive Bayes baseline on held-out test data.
Saves the fitted pipeline and detailed evaluation metadata.
"""

import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, Tuple

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_PATH = os.path.join(BACKEND_DIR, "data", "news_dataset.csv")
ARTIFACTS_DIR = os.path.join(BACKEND_DIR, "artifacts")
PIPELINE_PATH = os.path.join(ARTIFACTS_DIR, "veritas_pipeline.joblib")
METADATA_PATH = os.path.join(ARTIFACTS_DIR, "model_metadata.json")
EVAL_RESULTS_PATH = os.path.join(ARTIFACTS_DIR, "evaluation_results.json")


def load_dataset(csv_path: str = DATA_PATH) -> pd.DataFrame:
    """Loads and validates the prepared dataset."""
    if not os.path.exists(csv_path):
        raise FileNotFoundError(
            f"Dataset not found at {csv_path}. Run `python backend/scripts/prepare_data.py` first."
        )
    df = pd.read_csv(csv_path)
    if "full_text" not in df.columns or "label" not in df.columns:
        raise ValueError("Dataset missing required 'full_text' or 'label' columns.")
    
    # Filter any unexpected nulls
    df = df.dropna(subset=["full_text", "label"]).copy()
    return df


def build_pipeline(
    max_features: int = 25000,
    ngram_range: Tuple[int, int] = (1, 2),
    c_param: float = 1.0,
    random_state: int = 42,
    min_df: int = 3,
    max_df: float = 0.85
) -> Pipeline:
    """
    Constructs an end-to-end scikit-learn pipeline:
    TF-IDF Vectorizer -> Logistic Regression Classifier.
    """
    tfidf = TfidfVectorizer(
        max_features=max_features,
        ngram_range=ngram_range,
        sublinear_tf=True,
        min_df=min_df,
        max_df=max_df,
        stop_words="english",
        strip_accents="unicode",
        norm="l2"
    )
    
    classifier = LogisticRegression(
        C=c_param,
        max_iter=1000,
        random_state=random_state,
        solver="lbfgs",
        class_weight="balanced"
    )
    
    return Pipeline([
        ("tfidf", tfidf),
        ("classifier", classifier)
    ])


def evaluate_model(
    model,
    X_test: pd.Series,
    y_test: pd.Series,
    label_names: list
) -> Dict[str, Any]:
    """Evaluates a fitted model on held-out test data and computes full metrics."""
    y_pred = model.predict(X_test)
    
    # Ensure zero_division=0 to handle edge cases
    acc = float(accuracy_score(y_test, y_pred))
    prec_macro = float(precision_score(y_test, y_pred, average="macro", zero_division=0))
    rec_macro = float(recall_score(y_test, y_pred, average="macro", zero_division=0))
    f1_macro = float(f1_score(y_test, y_pred, average="macro", zero_division=0))
    
    prec_weighted = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    rec_weighted = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1_weighted = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))
    
    cm = confusion_matrix(y_test, y_pred, labels=label_names).tolist()
    
    # Per-class breakdown
    report = classification_report(
        y_test,
        y_pred,
        labels=label_names,
        output_dict=True,
        zero_division=0
    )
    
    per_class = {}
    for lbl in label_names:
        if lbl in report:
            per_class[lbl] = {
                "precision": float(report[lbl]["precision"]),
                "recall": float(report[lbl]["recall"]),
                "f1_score": float(report[lbl]["f1-score"]),
                "support": int(report[lbl]["support"])
            }
            
    return {
        "accuracy": round(acc, 4),
        "precision_macro": round(prec_macro, 4),
        "recall_macro": round(rec_macro, 4),
        "f1_macro": round(f1_macro, 4),
        "precision_weighted": round(prec_weighted, 4),
        "recall_weighted": round(rec_weighted, 4),
        "f1_weighted": round(f1_weighted, 4),
        "confusion_matrix": cm,
        "labels": label_names,
        "per_class": per_class
    }


def extract_top_features(pipeline: Pipeline, top_k: int = 20) -> Dict[str, list]:
    """
    Extracts global top predictive features for both classes from the fitted model.
    Class 0 = REAL, Class 1 = FAKE
    """
    vectorizer: TfidfVectorizer = pipeline.named_steps["tfidf"]
    clf: LogisticRegression = pipeline.named_steps["classifier"]
    
    feature_names = np.array(vectorizer.get_feature_names_out())
    coefs = clf.coef_[0]  # shape (n_features,)
    
    # Positive coefficients indicate association with class 1 ('FAKE')
    top_fake_idx = np.argsort(coefs)[-top_k:][::-1]
    # Negative coefficients indicate association with class 0 ('REAL')
    top_real_idx = np.argsort(coefs)[:top_k]
    
    top_fake_features = [
        {"feature": str(feature_names[i]), "weight": round(float(coefs[i]), 4)}
        for i in top_fake_idx
    ]
    top_real_features = [
        {"feature": str(feature_names[i]), "weight": round(float(coefs[i]), 4)}
        for i in top_real_idx
    ]
    
    return {
        "top_fake_indicators": top_fake_features,
        "top_real_indicators": top_real_features
    }


def train_and_evaluate(
    test_size: float = 0.20,
    random_state: int = 42,
    save_artifacts: bool = True
) -> Dict[str, Any]:
    """
    End-to-end training and evaluation:
    1. Loads dataset
    2. Performs stratified train/test split
    3. Fits TF-IDF and Logistic Regression strictly on X_train
    4. Evaluates primary model and Naive Bayes baseline on held-out X_test
    5. Saves pipeline and metadata
    """
    print("=" * 60)
    print("VERITAS AI - Model Training & Evaluation")
    print("=" * 60)
    
    df = load_dataset()
    total_records = len(df)
    
    # Labels
    label_names = ["REAL", "FAKE"]
    y = df["label"].values
    X = df["full_text"].values
    
    # Class counts
    unique, counts = np.unique(y, return_counts=True)
    class_dist_full = dict(zip(unique.tolist(), counts.tolist()))
    
    print(f"\nDataset loaded: {total_records} total samples")
    print(f"Class distribution: {class_dist_full}")
    
    # Stratified Train/Test split
    print(f"\nPerforming stratified split ({int((1-test_size)*100)}% train / {int(test_size*100)}% test, seed={random_state})...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=test_size,
        random_state=random_state,
        stratify=y
    )
    
    train_dist = dict(zip(*np.unique(y_train, return_counts=True)))
    test_dist = dict(zip(*np.unique(y_test, return_counts=True)))
    
    print(f"Training set: {len(X_train)} samples ({train_dist})")
    print(f"Test set:     {len(X_test)} samples ({test_dist})")
    
    # 1. Primary Model: Logistic Regression
    print("\nTraining Primary Classifier: TF-IDF + Logistic Regression...")
    pipeline = build_pipeline(random_state=random_state)
    pipeline.fit(X_train, y_train)
    print("Primary pipeline fit complete.")
    
    # Evaluate primary model on held-out test data
    print("\nEvaluating primary model on held-out test data...")
    primary_metrics = evaluate_model(pipeline, X_test, y_test, label_names)
    print(f"-> Primary Accuracy:  {primary_metrics['accuracy']:.4f}")
    print(f"-> Primary Macro F1:  {primary_metrics['f1_macro']:.4f}")
    print(f"-> Primary Precision: {primary_metrics['precision_macro']:.4f}")
    print(f"-> Primary Recall:    {primary_metrics['recall_macro']:.4f}")
    print(f"-> Confusion Matrix:  {primary_metrics['confusion_matrix']}")
    
    # 2. Baseline Model: Multinomial Naive Bayes
    print("\nTraining Baseline Classifier: TF-IDF + Multinomial Naive Bayes...")
    tfidf_baseline = TfidfVectorizer(
        max_features=25000,
        ngram_range=(1, 2),
        sublinear_tf=True,
        stop_words="english",
        min_df=3,
        max_df=0.85
    )
    nb_classifier = MultinomialNB(alpha=0.1)
    baseline_pipeline = Pipeline([
        ("tfidf", tfidf_baseline),
        ("classifier", nb_classifier)
    ])
    baseline_pipeline.fit(X_train, y_train)
    baseline_metrics = evaluate_model(baseline_pipeline, X_test, y_test, label_names)
    print(f"-> Baseline Accuracy: {baseline_metrics['accuracy']:.4f}")
    print(f"-> Baseline Macro F1: {baseline_metrics['f1_macro']:.4f}")
    
    # Extract top influential features
    top_features = extract_top_features(pipeline, top_k=20)
    
    # Assemble comprehensive metadata
    metadata = {
        "model_identity": {
            "name": "VERITAS AI Supervised News Classifier",
            "version": "1.0.0",
            "model_architecture": "TF-IDF N-gram Vectorization + Regularized Logistic Regression (L2)",
            "baseline_architecture": "TF-IDF + Multinomial Naive Bayes",
            "trained_at": datetime.utcnow().isoformat() + "Z",
            "vocabulary_size": int(len(pipeline.named_steps["tfidf"].vocabulary_)),
            "hyperparameters": {
                "max_features": 25000,
                "ngram_range": [1, 2],
                "sublinear_tf": True,
                "stop_words": "english",
                "min_df": 3,
                "max_df": 0.85,
                "classifier_c": 1.0,
                "classifier_penalty": "l2",
                "classifier_solver": "lbfgs",
                "class_weight": "balanced"
            }
        },
        "dataset_provenance": {
            "source_name": "George McIntire News Classification Benchmark Dataset",
            "description": "Composite dataset assembled from verified news sources (Reuters, NYT, Politico, The Hill) and verified fabricated/hoax articles.",
            "total_records": total_records,
            "train_records": int(len(X_train)),
            "test_records": int(len(X_test)),
            "test_split_ratio": test_size,
            "stratified": True,
            "random_seed": random_state,
            "class_distribution_overall": {k: int(v) for k, v in class_dist_full.items()},
            "class_distribution_train": {k: int(v) for k, v in train_dist.items()},
            "class_distribution_test": {k: int(v) for k, v in test_dist.items()},
            "label_definitions": {
                "REAL": "Factual news coverage sourced from reputable journalistic and institutional outlets.",
                "FAKE": "Fabricated, conspiratorial, or heavily distorted text sourced from known misinformation domains."
            }
        },
        "evaluation_metrics": {
            "primary_model": primary_metrics,
            "baseline_model": baseline_metrics,
            "metric_discussion": (
                "In balanced news evaluation, Accuracy measures overall correct rate, but Precision and Recall "
                "reveal asymmetric real-world costs. A False Positive (classifying verified journalism as Fake) "
                "undermines institutional trust, while a False Negative (classifying misinformation as Real) "
                "permits viral deception. F1 Macro provides the harmonic mean across both classes."
            )
        },
        "top_predictive_features": top_features,
        "scientific_limitations": [
            "The model identifies statistical lexical and stylistic patterns present in its training corpus.",
            "It does not perform real-time factual cross-referencing, live web search, or semantic knowledge graph lookups.",
            "Sophisticated or newly emerging misinformation adopting standard journalistic prose may fool n-gram distributions.",
            "Predictions must NEVER be treated as an absolute factual verdict and require independent verification using trustworthy sources."
        ]
    }
    
    if save_artifacts:
        os.makedirs(ARTIFACTS_DIR, exist_ok=True)
        joblib.dump(pipeline, PIPELINE_PATH)
        print(f"\nSaved fitted pipeline to: {PIPELINE_PATH}")
        
        with open(METADATA_PATH, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)
        print(f"Saved model metadata to: {METADATA_PATH}")
        
        with open(EVAL_RESULTS_PATH, "w", encoding="utf-8") as f:
            json.dump({
                "primary": primary_metrics,
                "baseline": baseline_metrics,
                "dataset_summary": metadata["dataset_provenance"]
            }, f, indent=2)
        print(f"Saved evaluation results to: {EVAL_RESULTS_PATH}")
        
    print("\n" + "=" * 60)
    print("Training and evaluation successfully completed!")
    print("=" * 60)
    
    return metadata


if __name__ == "__main__":
    train_and_evaluate()
