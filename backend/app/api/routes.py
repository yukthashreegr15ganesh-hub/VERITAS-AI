"""
VERITAS AI - API Routes
Defines endpoints for news text analysis, model evaluation info, sample articles,
and privacy-respecting local analysis history.
"""

import os
import json
from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status, Query

from backend.app.schemas.news import (
    NewsAnalysisRequest,
    PredictionResponse,
    ModelInfoResponse,
    HistoryListResponse,
    HistoryItem,
    StatusResponse
)
from backend.app.services.classifier import classifier_instance
from backend.app.services.history_db import (
    add_history_entry,
    get_history_entries,
    get_history_entry_by_id,
    delete_history_entry,
    clear_all_history
)

router = APIRouter()

SAMPLES_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "sample_articles.json")
)


@router.get("/health", response_model=StatusResponse, tags=["System"])
def get_health():
    """Returns the operational status and model load condition."""
    return StatusResponse(
        status="operational",
        model_loaded=classifier_instance.is_loaded,
        version="1.0.0",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )


@router.get("/model-info", response_model=ModelInfoResponse, tags=["Model"])
def get_model_info():
    """
    Returns empirical evaluation metrics, confusion matrix, dataset provenance,
    and scientific limitations of the trained classifier.
    """
    if not classifier_instance.is_loaded or not classifier_instance.metadata:
        return ModelInfoResponse(
            is_trained=False,
            message="No trained model artifact found. Please execute the training script."
        )

    meta = classifier_instance.metadata
    return ModelInfoResponse(
        is_trained=True,
        model_identity=meta.get("model_identity"),
        dataset_provenance=meta.get("dataset_provenance"),
        evaluation_metrics=meta.get("evaluation_metrics"),
        top_predictive_features=meta.get("top_predictive_features"),
        scientific_limitations=meta.get("scientific_limitations")
    )


@router.get("/samples", tags=["Educational Resources"])
def get_sample_articles():
    """Returns vetted illustrative articles across multiple journalistic topics for testing."""
    if os.path.exists(SAMPLES_PATH):
        try:
            with open(SAMPLES_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return []


@router.post("/analyze", response_model=PredictionResponse, tags=["News Analysis"])
def analyze_news(payload: NewsAnalysisRequest):
    """
    Performs supervised NLP classification on the submitted news headline & article.
    Computes TF-IDF vectors, logistic regression probability estimate, and influential features.
    Saves the record to local history.
    """
    if not classifier_instance.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not loaded or artifacts are missing. Run `python backend/scripts/train.py`."
        )

    try:
        prediction = classifier_instance.predict(
            headline=payload.headline or "",
            article_text=payload.article_text
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference processing error: {str(e)}"
        )

    # Persist to local SQLite history (transparent, local, deletable)
    try:
        add_history_entry(
            entry_id=prediction["id"],
            headline=payload.headline or "",
            article_text=payload.article_text,
            prediction_result=prediction
        )
    except Exception as e:
        # History failure should not break prediction response
        print(f"Warning: History record could not be written: {e}")

    return prediction


@router.get("/history", response_model=HistoryListResponse, tags=["History"])
def get_history(limit: int = Query(50, ge=1, le=100)):
    """Fetches recent local analysis history records."""
    entries = get_history_entries(limit=limit)
    items = [
        HistoryItem(
            id=e["id"],
            headline=e["headline"] or "Untitled Article",
            article_excerpt=e["article_excerpt"],
            predicted_label=e["predicted_label"],
            raw_class=e["raw_class"],
            confidence_score=e["confidence_score"],
            model_name=e["model_name"],
            word_count=e["word_count"],
            character_count=e["character_count"],
            created_at=e["created_at"]
        )
        for e in entries
    ]
    return HistoryListResponse(total=len(items), items=items)


@router.get("/history/{entry_id}", tags=["History"])
def get_history_item(entry_id: str):
    """Retrieves full prediction details for a previously analyzed article."""
    item = get_history_entry_by_id(entry_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"History entry with id '{entry_id}' not found."
        )
    return item


@router.delete("/history/{entry_id}", tags=["History"])
def delete_single_history(entry_id: str):
    """Deletes an individual history entry from local SQLite storage."""
    deleted = delete_history_entry(entry_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"History entry with id '{entry_id}' not found."
        )
    return {"message": "History entry deleted successfully.", "id": entry_id}


@router.delete("/history", tags=["History"])
def clear_history():
    """Purges all analysis history records from local storage."""
    count = clear_all_history()
    return {"message": "All history records purged.", "deleted_count": count}
