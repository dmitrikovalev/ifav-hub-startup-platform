from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.sql import func
from app.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    event_type = Column(String(50))  # meetup | demo_day | webinar | conference
    location = Column(String(500))
    is_online = Column(Boolean, default=False)
    meeting_url = Column(String(500))
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True))
    max_attendees = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
