from datetime import datetime
from pydantic import BaseModel


class EventCreate(BaseModel):
    title: str
    description: str | None = None
    event_type: str | None = None
    location: str | None = None
    is_online: bool = False
    meeting_url: str | None = None
    start_time: datetime
    end_time: datetime | None = None
    max_attendees: int | None = None


class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    event_type: str | None = None
    location: str | None = None
    is_online: bool | None = None
    meeting_url: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    max_attendees: int | None = None


class EventResponse(BaseModel):
    id: int
    title: str
    description: str | None
    event_type: str | None
    location: str | None
    is_online: bool
    meeting_url: str | None
    start_time: datetime
    end_time: datetime | None
    max_attendees: int | None
    created_at: datetime

    model_config = {"from_attributes": True}
