"""
Pydantic schemas for VERITAS AI request validation and response models.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator


class NewsAnalysisRequest(BaseModel):
    headline: Optional[str] = Field(
        default="",
        max_length=500,
        description="Optional headline of the news article (up to 500 characters)."
    )
    article_text: str = Field(
        ...,
        min_length=20,
        max_length=50000,
        description="Body text of the news article (20 to 50,000 characters)."
    )

    @field_validator("article_text")
    @classmethod
    def validate_non_whitespace(cls, v: str) -> str:
        clean = v.strip()
        if len(clean) < 20:
            raise ValueError("Article text must contain at least 20 non-whitespace characters.")
        return clean

    @field_validator("headline")
    @classmethod
    def clean_headline(cls, v: Optional[str]) -> str:
        return v.strip() if v else ""


class FeatureInfluence(BaseModel):
    feature: str = Field(..., description="The word or bigram token.")
    contribution: float = Field(..., description="TF-IDF weight multiplied by model coefficient.")
    direction: str = Field(..., description="'supports_fake' or 'supports_real'.")
    weight_desc: str = Field(..., description="Human-readable magnitude description.")


class PredictionResponse(BaseModel):
    id: str = Field(..., description="Unique analysis record identifier.")
    headline: str = Field(..., description="Submitted headline.")
    article_excerpt: str = Field(..., description="Short preview of the submitted text.")
    predicted_label: str = Field(
        ...,
        description="Scientific label: 'Model classified as Fake', 'Model classified as Real', or 'Model could not produce a reliable classification'."
    )
    raw_class: str = Field(..., description="'FAKE', 'REAL', or 'UNCERTAIN'.")
    confidence_score: float = Field(
        ...,
        description="Model probability estimate for the predicted class (0.0 to 1.0). Not a factual truth probability."
    )
    probability_real: float = Field(..., description="Estimated model probability that text reflects REAL news training patterns.")
    probability_fake: float = Field(..., description="Estimated model probability that text reflects FAKE news training patterns.")
    model_name: str = Field(..., description="Name of the underlying classifier.")
    model_version: str = Field(..., description="Version of the trained pipeline.")
    word_count: int = Field(..., description="Word count of the input article.")
    character_count: int = Field(..., description="Character count of the input article.")
    top_features: List[FeatureInfluence] = Field(default_factory=list, description="Influential n-gram features for this specific prediction.")
    limitations_disclaimer: str = Field(..., description="Scientific limitation and verification disclaimer.")
    scientific_notes: str = Field(..., description="Context explaining probability estimates.")
    created_at: str = Field(..., description="ISO timestamp of analysis.")


class ModelInfoResponse(BaseModel):
    is_trained: bool
    model_identity: Optional[Dict[str, Any]] = None
    dataset_provenance: Optional[Dict[str, Any]] = None
    evaluation_metrics: Optional[Dict[str, Any]] = None
    top_predictive_features: Optional[Dict[str, Any]] = None
    scientific_limitations: Optional[List[str]] = None
    message: Optional[str] = None


class HistoryItem(BaseModel):
    id: str
    headline: str
    article_excerpt: str
    predicted_label: str
    raw_class: str
    confidence_score: float
    model_name: str
    word_count: int
    character_count: int
    created_at: str


class HistoryListResponse(BaseModel):
    total: int
    items: List[HistoryItem]


class StatusResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str
    timestamp: str
