from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Date, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    startup_id = Column(Integer, ForeignKey("startups.id", ondelete="CASCADE"), nullable=False)
    investor_id = Column(Integer, ForeignKey("investors.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    amount = Column(Float)
    stage = Column(String(50), index=True, nullable=False, default="lead")
    probability = Column(Integer, nullable=False, default=0)
    expected_close = Column(Date)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    startup = relationship("Startup", foreign_keys=[startup_id])
    investor = relationship("Investor", foreign_keys=[investor_id])

    __table_args__ = (
        CheckConstraint("probability >= 0 AND probability <= 100", name="ck_deals_probability_range"),
    )
