"""
VERITAS AI - FastAPI Application Entrypoint
Exposes educational NLP classification services, real-time explainability,
and empirical model evaluation endpoints.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.api.routes import router as api_router
from backend.app.services.classifier import classifier_instance

app = FastAPI(
    title="VERITAS AI API",
    description=(
        "Educational Natural Language Processing engine for news text classification. "
        "Built with TF-IDF and supervised Logistic Regression. "
        "Strictly provides statistical pattern predictions, not factual truth verification."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration for local React Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api")


@app.get("/", tags=["Root"])
def root_info():
    return {
        "product": "VERITAS AI",
        "tagline": "Look Beyond the Headline.",
        "status": "online",
        "model_loaded": classifier_instance.is_loaded,
        "docs_url": "/docs",
        "api_prefix": "/api"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Clean error handler to prevent exposing raw stack traces in production."""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Processing Error",
            "message": "An unexpected error occurred while processing the news text.",
            "detail": str(exc) if app.debug else "Please review input text and try again."
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
