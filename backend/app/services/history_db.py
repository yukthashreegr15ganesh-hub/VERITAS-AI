"""
VERITAS AI - Local SQLite History Service
Maintains user analysis history locally without transmitting sensitive texts to 3rd parties.
"""

import os
import sqlite3
import json
from typing import List, Optional, Dict, Any
from datetime import datetime

DB_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "artifacts", "veritas_history.db")
)


def get_connection(db_path: str = DB_PATH) -> sqlite3.Connection:
    """Creates directory if needed and returns SQLite connection with row factory."""
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(db_path: str = DB_PATH):
    """Initializes the database schema if it doesn't already exist."""
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analysis_history (
                id TEXT PRIMARY KEY,
                headline TEXT,
                article_excerpt TEXT,
                predicted_label TEXT,
                raw_class TEXT,
                confidence_score REAL,
                model_name TEXT,
                word_count INTEGER,
                character_count INTEGER,
                full_result_json TEXT,
                created_at TEXT
            )
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_history_created 
            ON analysis_history(created_at DESC)
        """)
        conn.commit()


def add_history_entry(
    entry_id: str,
    headline: str,
    article_text: str,
    prediction_result: Dict[str, Any],
    db_path: str = DB_PATH
) -> None:
    """Inserts a new analysis record."""
    init_db(db_path)
    
    # Excerpt: up to first 250 characters
    clean_text = article_text.strip().replace("\n", " ")
    excerpt = clean_text[:250] + ("..." if len(clean_text) > 250 else "")
    
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO analysis_history (
                id, headline, article_excerpt, predicted_label, raw_class,
                confidence_score, model_name, word_count, character_count,
                full_result_json, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            entry_id,
            headline or "Untitled Article",
            excerpt,
            prediction_result.get("predicted_label", ""),
            prediction_result.get("raw_class", ""),
            float(prediction_result.get("confidence_score", 0.0)),
            prediction_result.get("model_name", "VERITAS Model"),
            int(prediction_result.get("word_count", 0)),
            int(prediction_result.get("character_count", 0)),
            json.dumps(prediction_result),
            prediction_result.get("created_at", datetime.utcnow().isoformat() + "Z")
        ))
        conn.commit()


def get_history_entries(limit: int = 50, db_path: str = DB_PATH) -> List[Dict[str, Any]]:
    """Retrieves recent history records ordered newest first."""
    init_db(db_path)
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, headline, article_excerpt, predicted_label, raw_class,
                   confidence_score, model_name, word_count, character_count,
                   created_at
            FROM analysis_history
            ORDER BY created_at DESC
            LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def get_history_entry_by_id(entry_id: str, db_path: str = DB_PATH) -> Optional[Dict[str, Any]]:
    """Retrieves the complete result JSON for a specific history record."""
    init_db(db_path)
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT full_result_json
            FROM analysis_history
            WHERE id = ?
        """, (entry_id,))
        row = cursor.fetchone()
        if row and row["full_result_json"]:
            return json.loads(row["full_result_json"])
        return None


def delete_history_entry(entry_id: str, db_path: str = DB_PATH) -> bool:
    """Deletes a specific history record by ID."""
    init_db(db_path)
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM analysis_history WHERE id = ?", (entry_id,))
        conn.commit()
        return cursor.rowcount > 0


def clear_all_history(db_path: str = DB_PATH) -> int:
    """Deletes all history records."""
    init_db(db_path)
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM analysis_history")
        deleted_count = cursor.rowcount
        conn.commit()
        return deleted_count
