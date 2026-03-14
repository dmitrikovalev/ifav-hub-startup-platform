from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    startup_id = Column(Integer, ForeignKey("startups.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    doc_type = Column(String(50), default="pitch_deck")  # pitch_deck | financial_model | term_sheet
    ai_analysis = Column(JSON)
    status = Column(String(20), default="pending")  # pending | analyzing | done | failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    startup = relationship("Startup", foreign_keys=[startup_id])
