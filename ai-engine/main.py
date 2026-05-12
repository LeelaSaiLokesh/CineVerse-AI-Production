"""
CineVerse AI - FastAPI Main Application
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import List, Optional

import httpx
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from recommender import engine
from sentiment import analyze_review, analyze_reviews_batch

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")
TMDB_BASE = os.getenv("TMDB_BASE_URL", "https://api.themoviedb.org/3")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting CineVerse AI Engine...")
    engine.train()
    logger.info("✅ Recommendation engine ready")
    yield
    logger.info("Shutting down AI Engine...")


app = FastAPI(
    title="CineVerse AI Engine",
    description="AI-powered movie recommendation and sentiment analysis API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Pydantic Models ──────────────────────────────────────────────────────────

class RecommendByTitleRequest(BaseModel):
    title: str
    limit: int = 12


class SentimentRequest(BaseModel):
    text: str


class BatchSentimentRequest(BaseModel):
    reviews: List[dict]


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "service": "CineVerse AI Engine",
        "version": "1.0.0",
        "status": "running",
        "engine_ready": engine.is_ready,
        "corpus_size": len(engine.df) if engine.df is not None else 0,
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "engine_ready": engine.is_ready,
        "corpus_size": len(engine.df) if engine.df is not None else 0,
    }


@app.get("/recommend/{movie_id}")
def recommend_by_id(movie_id: int, limit: int = 12):
    if not engine.is_ready:
        raise HTTPException(503, "Recommendation engine not ready")
    results = engine.recommend_by_id(movie_id, limit=limit)
    return {
        "movie_id": movie_id,
        "recommendations": results,
        "count": len(results),
    }


@app.post("/recommend/by-title")
def recommend_by_title(req: RecommendByTitleRequest):
    if not engine.is_ready:
        raise HTTPException(503, "Recommendation engine not ready")
    results = engine.recommend_by_title(req.title, limit=req.limit)
    return {
        "query": req.title,
        "recommendations": results,
        "count": len(results),
    }


@app.post("/sentiment/analyze")
def analyze_single(req: SentimentRequest):
    if not req.text.strip():
        raise HTTPException(400, "Text cannot be empty")
    return analyze_review(req.text)


@app.post("/sentiment/batch")
def analyze_batch(req: BatchSentimentRequest):
    return analyze_reviews_batch(req.reviews)


@app.get("/sentiment/movie/{movie_id}")
async def sentiment_for_movie(movie_id: int):
    """Fetch TMDB reviews and analyze sentiment."""
    if not TMDB_API_KEY:
        raise HTTPException(503, "TMDB API key not configured")

    async with httpx.AsyncClient() as client:
        try:
            r = await client.get(
                f"{TMDB_BASE}/movie/{movie_id}/reviews",
                params={"api_key": TMDB_API_KEY, "page": 1},
                timeout=8,
            )
            reviews = r.json().get("results", [])
        except Exception as e:
            raise HTTPException(503, f"Could not fetch reviews: {e}")

    result = analyze_reviews_batch(reviews)
    result["movie_id"] = movie_id
    return result


@app.get("/movie/{movie_id}/info")
def movie_info(movie_id: int):
    info = engine.get_movie_info(movie_id)
    if not info:
        raise HTTPException(404, "Movie not in local corpus")
    return info


@app.post("/engine/retrain")
def retrain(background_tasks: BackgroundTasks):
    background_tasks.add_task(engine.train, force_dataset=True)
    return {"message": "Retraining started in background"}


@app.get("/engine/stats")
def engine_stats():
    if not engine.is_ready or engine.df is None:
        return {"ready": False}
    lang_dist = engine.df["original_language"].value_counts().head(10).to_dict()
    return {
        "ready": True,
        "total_movies": len(engine.df),
        "language_distribution": lang_dist,
        "features": int(engine.tfidf_matrix.shape[1]) if engine.tfidf_matrix is not None else 0,
    }
