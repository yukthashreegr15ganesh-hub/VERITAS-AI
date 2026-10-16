"""
Unit tests for dataset loading, validation, cleaning, and deduplication.
Uses isolated synthetic unit-test records clearly distinguished from the real benchmark dataset.
"""

import pytest
import pandas as pd
from backend.scripts.prepare_data import validate_and_clean_dataset


def get_synthetic_test_dataframe() -> pd.DataFrame:
    """Returns a small synthetic DataFrame designed exclusively for unit testing."""
    return pd.DataFrame([
        {
            "title": "Synthetic Article A",
            "text": "This is a sufficiently long synthetic news text for unit testing purposes exceeding fifty characters.",
            "label": "REAL"
        },
        {
            "title": "Synthetic Article B",
            "text": "Another completely fabricated synthetic hoax article with conspiracy themes exceeding fifty characters.",
            "label": "FAKE"
        },
        {
            "title": "Synthetic Duplicate",
            "text": "This is an exact duplicate synthetic article that should be removed by the deduplicator.",
            "label": "REAL"
        },
        {
            "title": "Synthetic Duplicate",
            "text": "This is an exact duplicate synthetic article that should be removed by the deduplicator.",
            "label": "REAL"
        },
        {
            "title": "Short Article",
            "text": "Too short.",
            "label": "REAL"
        },
        {
            "title": "Missing Text Article",
            "text": None,
            "label": "FAKE"
        },
        {
            "title": "Lowercase Label Article",
            "text": "Valid length body text for checking lower case label mapping accurately.",
            "label": "fake"
        }
    ])


def test_validation_drops_missing_and_short_text():
    """Ensure rows with null text or length under 50 characters are filtered out."""
    df_raw = get_synthetic_test_dataframe()
    clean_df = validate_and_clean_dataset(df_raw)
    
    # Missing text and short article ("Too short.") must be removed
    assert len(clean_df[clean_df["text"].str.len() < 50]) == 0
    assert clean_df["text"].isna().sum() == 0


def test_validation_deduplicates_exact_records():
    """Ensure duplicate title + text combinations are removed."""
    df_raw = get_synthetic_test_dataframe()
    clean_df = validate_and_clean_dataset(df_raw)
    
    dupe_rows = clean_df[clean_df["title"] == "Synthetic Duplicate"]
    assert len(dupe_rows) == 1


def test_label_normalization():
    """Ensure labels are normalized to uppercase 'REAL' and 'FAKE'."""
    df_raw = get_synthetic_test_dataframe()
    clean_df = validate_and_clean_dataset(df_raw)
    
    unique_labels = set(clean_df["label"].unique())
    assert unique_labels.issubset({"REAL", "FAKE"})


def test_missing_required_columns_raises_error():
    """Ensure ValueError is raised if mandatory schema columns are absent."""
    invalid_df = pd.DataFrame([{"wrong_col": "data", "label": "REAL"}])
    with pytest.raises(ValueError) as exc:
        validate_and_clean_dataset(invalid_df)
    assert "missing required columns" in str(exc.value).lower()
