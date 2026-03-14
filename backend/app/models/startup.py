from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON, Index
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.database import Base


class Startup(Base):
    __tablename__ = "startups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    industry = Column(String(100), index=True)
    stage = Column(String(50), index=True)  # idea | mvp | seed | series_a | series_b
    funding_goal = Column(Float)
    current_funding = Column(Float, default=0)
    team_size = Column(Integer)
    location = Column(String(255))
    website = Column(String(500))
    logo_url = Column(String(500))
    pitch_deck_url = Column(String(500))
    ai_score = Column(Float)
    ai_evaluation = Column(JSON)  # {strengths, weaknesses, suggestions, market_size, ...}
    embedding = Column(Vector(768))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        Index("ix_startups_embedding_hnsw", "embedding", postgresql_using="hnsw",
              postgresql_with={"m": 16, "ef_construction": 64},
              postgresql_ops={"embedding": "vector_cosine_ops"}),
    )
