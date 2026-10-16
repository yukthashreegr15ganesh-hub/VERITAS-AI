"""
Integration and API tests for VERITAS AI FastAPI application.
Tests validation, responses, error handling, and history persistence.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.classifier import VeritasClassifier

client = TestClient(app)


def test_health_endpoint():
    """Verify health endpoint returns operational status and model condition."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert "model_loaded" in data
    assert "version" in data


def test_model_info_endpoint():
    """Verify model info returns loaded training metrics and dataset metadata."""
    response = client.get("/api/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "is_trained" in data
    if data["is_trained"]:
        assert "evaluation_metrics" in data
        assert "dataset_provenance" in data
        assert "scientific_limitations" in data


def test_samples_endpoint():
    """Verify sample articles can be fetched for educational testing."""
    response = client.get("/api/samples")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2


def test_analyze_valid_news_article():
    """Verify that submitting valid news text yields a full prediction with disclaimers."""
    payload = {
        "headline": "Federal Reserve Holds Benchmark Interest Rate Steady",
        "article_text": (
            "The Federal Reserve on Wednesday held its benchmark federal funds rate steady in the "
            "5.25% to 5.50% range, citing continued solid economic expansion and steady employment gains. "
            "Federal Reserve officials noted that while headline inflation metrics have cooled considerably, "
            "monetary policymakers require additional empirical evidence before rate reductions."
        )
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    # Verify core fields
    assert "id" in data
    assert data["predicted_label"] in [
        "Model classified as Real",
        "Model classified as Fake",
        "Model could not produce a reliable classification"
    ]
    assert data["raw_class"] in ["REAL", "FAKE", "UNCERTAIN"]
    assert 0.0 <= data["confidence_score"] <= 1.0
    assert 0.0 <= data["probability_real"] <= 1.0
    assert 0.0 <= data["probability_fake"] <= 1.0
    assert "limitations_disclaimer" in data
    assert "CRITICAL SCIENTIFIC DISCLAIMER" in data["limitations_disclaimer"]
    assert "scientific_notes" in data
    assert isinstance(data["top_features"], list)
    assert data["word_count"] > 20
    assert data["character_count"] > 100


def test_analyze_empty_text_rejected():
    """Verify that empty text or whitespace-only text is rejected with 422 Unprocessable Entity."""
    response = client.post("/api/analyze", json={"headline": "Test", "article_text": "   "})
    assert response.status_code == 422


def test_analyze_short_text_rejected():
    """Verify that text shorter than 20 characters is rejected."""
    response = client.post("/api/analyze", json={"headline": "Test", "article_text": "Too brief"})
    assert response.status_code == 422


def test_analyze_oversized_text_rejected():
    """Verify that text exceeding 50,000 characters is rejected."""
    oversized = "a" * 50001
    response = client.post("/api/analyze", json={"headline": "Test", "article_text": oversized})
    assert response.status_code == 422


def test_missing_model_handling():
    """Verify that an uninitialized classifier raises a clear error without fabricated results."""
    dummy_classifier = VeritasClassifier(
        pipeline_path="non_existent_file.joblib",
        metadata_path="non_existent_meta.json"
    )
    assert not dummy_classifier.is_loaded
    with pytest.raises(RuntimeError) as exc:
        dummy_classifier.predict("Test Headline", "This is an article that should fail because model is missing.")
    assert "Model artifacts are missing" in str(exc.value)


def test_history_lifecycle():
    """Verify analysis history lifecycle: creation, retrieval, item lookup, and deletion."""
    # 1. Submit an analysis
    payload = {
        "headline": "History Lifecycle Test Headline",
        "article_text": "This is a valid news article text specifically created to verify the local SQLite history lifecycle functions."
    }
    analyze_resp = client.post("/api/analyze", json=payload)
    assert analyze_resp.status_code == 200
    entry_id = analyze_resp.json()["id"]

    # 2. Retrieve history list
    list_resp = client.get("/api/history")
    assert list_resp.status_code == 200
    history = list_resp.json()
    assert history["total"] >= 1
    found = any(item["id"] == entry_id for item in history["items"])
    assert found

    # 3. Retrieve single history item
    item_resp = client.get(f"/api/history/{entry_id}")
    assert item_resp.status_code == 200
    assert item_resp.json()["id"] == entry_id

    # 4. Delete single history item
    del_resp = client.delete(f"/api/history/{entry_id}")
    assert del_resp.status_code == 200

    # 5. Verify item no longer found
    missing_resp = client.get(f"/api/history/{entry_id}")
    assert missing_resp.status_code == 404
