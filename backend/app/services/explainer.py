"""
VERITAS AI - Explainability Service
Computes feature contributions for Logistic Regression using TF-IDF term weights
multiplied by learned linear coefficients.
"""

from typing import List, Dict, Any, Tuple
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression


def explain_text_prediction(
    pipeline: Pipeline,
    raw_text: str,
    top_k: int = 8
) -> List[Dict[str, Any]]:
    """
    Computes local feature importance for a single text input.
    Returns the top influential words and bigrams that pushed the decision
    toward 'Model classified as Fake' or 'Model classified as Real'.
    """
    vectorizer: TfidfVectorizer = pipeline.named_steps["tfidf"]
    classifier: LogisticRegression = pipeline.named_steps["classifier"]

    # Transform input text
    X_vec = vectorizer.transform([raw_text])
    feature_indices = X_vec.indices
    tfidf_values = X_vec.data

    if len(feature_indices) == 0:
        return []

    # Logistic regression coefficients for class 1 ('FAKE')
    # Positive coefficient -> pushes towards FAKE
    # Negative coefficient -> pushes towards REAL
    coefs = classifier.coef_[0]

    feature_names = vectorizer.get_feature_names_out()

    contributions: List[Tuple[str, float, str, str]] = []
    for idx, tfidf_val in zip(feature_indices, tfidf_values):
        feat_name = feature_names[idx]
        w = coefs[idx]
        contrib = float(w * tfidf_val)
        
        if abs(contrib) < 0.005:
            continue

        if contrib > 0:
            direction = "supports_fake"
            desc = "Statistically correlated with fabricated or sensationalist patterns in training data"
        else:
            direction = "supports_real"
            desc = "Statistically correlated with institutional or mainstream journalistic patterns in training data"

        contributions.append((feat_name, contrib, direction, desc))

    # Sort by absolute contribution magnitude
    contributions.sort(key=lambda x: abs(x[1]), reverse=True)

    results = []
    for feat_name, contrib, direction, desc in contributions[:top_k]:
        results.append({
            "feature": feat_name,
            "contribution": round(contrib, 4),
            "direction": direction,
            "weight_desc": desc
        })

    return results
