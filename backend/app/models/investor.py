from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ARRAY, Index
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.database import Base


class Investor(Base):
    __tablename__ = "investors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    firm = Column(String(255))
    bio = Column(Text)
    investment_focus = Column(Text)
    industries = Column(ARRAY(String))
    stages = Column(ARRAY(String))
    min_investment = Column(Float)
    max_investment = Column(Float)
    portfolio_count = Column(Integer, default=0)
    location = Column(String(255))
    linkedin_url = Column(String(500))
    avatar_url = Column(String(500))
    embedding = Column(Vector(768))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        Index("ix_investors_embedding_hnsw", "embedding", postgresql_using="hnsw",
              postgresql_with={"m": 16, "ef_construction": 64},
              postgresql_ops={"embedding": "vector_cosine_ops"}),
    )
