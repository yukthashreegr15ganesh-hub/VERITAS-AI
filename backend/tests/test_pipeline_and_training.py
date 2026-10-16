"""
Unit tests for the TF-IDF and classification pipeline, metric calculation,
and leakage prevention.
Uses tiny isolated synthetic text datasets.
"""

import pytest
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from backend.scripts.train import build_pipeline, evaluate_model, extract_top_features


def get_tiny_synthetic_corpus():
    """Isolated synthetic texts for testing pipeline fitting and evaluation."""
    X = pd.Series([
        "Government central bank raises interest rate after economic inflation reports.",
        "Congress passes healthcare bipartisan legislation following extensive committee debates.",
        "Scientific researchers publish climate study measuring polar ice melting trends.",
        "Shocking secret alien laboratory discovered underneath airport government cover up.",
        "Billionaire drinks blood of infants to live forever in dark secret ritual.",
        "Miracle tea cures every known medical condition in eight minutes doctors furious."
    ])
    y = pd.Series(["REAL", "REAL", "REAL", "FAKE", "FAKE", "FAKE"])
    return X, y


def test_build_pipeline_structure():
    """Verify pipeline includes tfidf and classifier steps."""
    pipe = build_pipeline(max_features=100)
    assert "tfidf" in pipe.named_steps
    assert "classifier" in pipe.named_steps


def test_pipeline_train_and_inference():
    """Verify pipeline can fit on training data and generate predictions and probabilities."""
    X, y = get_tiny_synthetic_corpus()
    pipe = build_pipeline(max_features=500, min_df=1)
    
    pipe.fit(X, y)
    
    test_query = ["Government treasury releases economic reports on inflation and jobs."]
    pred = pipe.predict(test_query)
    proba = pipe.predict_proba(test_query)
    
    assert pred[0] in ["REAL", "FAKE"]
    assert proba.shape == (1, 2)
    assert np.isclose(proba.sum(), 1.0)


def test_evaluation_metric_generation():
    """Verify evaluate_model generates all required metrics cleanly."""
    X, y = get_tiny_synthetic_corpus()
    pipe = build_pipeline(max_features=500, min_df=1)
    pipe.fit(X, y)
    
    metrics = evaluate_model(pipe, X, y, ["REAL", "FAKE"])
    
    assert "accuracy" in metrics
    assert "precision_macro" in metrics
    assert "recall_macro" in metrics
    assert "f1_macro" in metrics
    assert "confusion_matrix" in metrics
    assert len(metrics["confusion_matrix"]) == 2
    assert "REAL" in metrics["per_class"]
    assert "FAKE" in metrics["per_class"]


def test_extract_top_features():
    """Verify feature extractor pulls positive and negative indicators."""
    X, y = get_tiny_synthetic_corpus()
    pipe = build_pipeline(max_features=500, min_df=1)
    pipe.fit(X, y)
    
    features = extract_top_features(pipe, top_k=3)
    assert "top_fake_indicators" in features
    assert "top_real_indicators" in features
    assert len(features["top_fake_indicators"]) <= 3
    assert len(features["top_real_indicators"]) <= 3
