"""
VERITAS AI - Model Classifier Service
Loads the persisted scikit-learn pipeline, validates inputs, performs inference,
computes probability estimates, formats educational scientific labels,
and invokes local explainability.
"""

import os
import json
import uuid
from typing import Dict, Any, Optional
from datetime import datetime
import joblib
from sklearn.pipeline import Pipeline

from backend.app.services.explainer import explain_text_prediction

ARTIFACTS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "artifacts")
)
PIPELINE_PATH = os.path.join(ARTIFACTS_DIR, "veritas_pipeline.joblib")
METADATA_PATH = os.path.join(ARTIFACTS_DIR, "model_metadata.json")


class VeritasClassifier:
    """Singleton-style manager for loading and serving the Veritas ML pipeline."""

    def __init__(self, pipeline_path: str = PIPELINE_PATH, metadata_path: str = METADATA_PATH):
        self.pipeline_path = pipeline_path
        self.metadata_path = metadata_path
        self._pipeline: Optional[Pipeline] = None
        self._metadata: Optional[Dict[str, Any]] = None
        self._load_pipeline()

    def _load_pipeline(self) -> None:
        """Loads model pipeline and metadata if available on disk."""
        if os.path.exists(self.pipeline_path):
            try:
                self._pipeline = joblib.load(self.pipeline_path)
            except Exception as e:
                print(f"Error loading model pipeline from {self.pipeline_path}: {e}")
                self._pipeline = None

        if os.path.exists(self.metadata_path):
            try:
                with open(self.metadata_path, "r", encoding="utf-8") as f:
                    self._metadata = json.load(f)
            except Exception as e:
                print(f"Error loading model metadata from {self.metadata_path}: {e}")
                self._metadata = None

    @property
    def is_loaded(self) -> bool:
        return self._pipeline is not None

    @property
    def metadata(self) -> Optional[Dict[str, Any]]:
        return self._metadata

    def predict(self, headline: str, article_text: str) -> Dict[str, Any]:
        """
        Runs text classification inference.
        Returns a rich response dictionary adhering to strict scientific disclaimers.
        """
        if not self.is_loaded:
            raise RuntimeError(
                "Model artifacts are missing or uninitialized. "
                "Please run `python backend/scripts/train.py` to train and save the pipeline."
            )

        # Prepare composite text
        clean_headline = headline.strip() if headline else ""
        clean_body = article_text.strip()
        full_text = f"{clean_headline}\n\n{clean_body}" if clean_headline else clean_body

        words = clean_body.split()
        word_count = len(words)
        char_count = len(clean_body)

        # Predict probability
        # classes_ in pipeline: ['FAKE', 'REAL'] (ordered alphabetically by sklearn)
        classes = list(self._pipeline.classes_)
        probabilities = self._pipeline.predict_proba([full_text])[0]

        prob_dict = {cls_name: float(prob) for cls_name, prob in zip(classes, probabilities)}
        prob_fake = prob_dict.get("FAKE", 0.5)
        prob_real = prob_dict.get("REAL", 0.5)

        # Margin of uncertainty check:
        # If the model probability is between 0.44 and 0.56, report as uncertain
        # to prevent false confidence on ambiguous articles
        if 0.44 <= prob_fake <= 0.56:
            predicted_label = "Model could not produce a reliable classification"
            raw_class = "UNCERTAIN"
            confidence = round(max(prob_fake, prob_real), 4)
        elif prob_fake > prob_real:
            predicted_label = "Model classified as Fake"
            raw_class = "FAKE"
            confidence = round(prob_fake, 4)
        else:
            predicted_label = "Model classified as Real"
            raw_class = "REAL"
            confidence = round(prob_real, 4)

        # Input length domain check limitation message
        length_warning = ""
        if word_count < 40:
            length_warning = (
                " Note: The submitted text is relatively short (under 40 words). "
                "TF-IDF n-gram classifiers perform with significantly higher variance on abbreviated inputs."
            )

        # Explainability: Extract top influential terms
        top_features = explain_text_prediction(self._pipeline, full_text, top_k=8)

        # Model details
        model_name = (
            self._metadata.get("model_identity", {}).get("model_architecture", "TF-IDF + Logistic Regression")
            if self._metadata else "TF-IDF + Logistic Regression"
        )
        model_version = (
            self._metadata.get("model_identity", {}).get("version", "1.0.0")
            if self._metadata else "1.0.0"
        )

        return {
            "id": str(uuid.uuid4()),
            "headline": clean_headline,
            "article_excerpt": clean_body[:250] + ("..." if len(clean_body) > 250 else ""),
            "predicted_label": predicted_label,
            "raw_class": raw_class,
            "confidence_score": confidence,
            "probability_real": round(prob_real, 4),
            "probability_fake": round(prob_fake, 4),
            "model_name": model_name,
            "model_version": model_version,
            "word_count": word_count,
            "character_count": char_count,
            "top_features": top_features,
            "limitations_disclaimer": (
                "CRITICAL SCIENTIFIC DISCLAIMER: This prediction reflects statistical n-gram patterns learned from "
                "a historical training corpus. It does NOT verify factual accuracy, perform real-world fact-checking, "
                "or confirm whether events took place. Always verify news claims through primary investigative sources."
                + length_warning
            ),
            "scientific_notes": (
                "The confidence score indicates the model's posterior probability estimate under its learned "
                "logistic sigmoid function. It does not represent factual truth probability."
            ),
            "created_at": datetime.utcnow().isoformat() + "Z"
        }


# Global classifier instance
classifier_instance = VeritasClassifier()
