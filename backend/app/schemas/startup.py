from datetime import datetime
from pydantic import BaseModel


class StartupCreate(BaseModel):
    name: str
    description: str | None = None
    industry: str | None = None
    stage: str | None = None
    funding_goal: float | None = None
    current_funding: float | None = None
    team_size: int | None = None
    location: str | None = None
    website: str | None = None
    logo_url: str | None = None


class StartupUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    industry: str | None = None
    stage: str | None = None
    funding_goal: float | None = None
    current_funding: float | None = None
    team_size: int | None = None
    location: str | None = None
    website: str | None = None
    logo_url: str | None = None
    pitch_deck_url: str | None = None


class StartupResponse(BaseModel):
    id: int
    name: str
    description: str | None
    industry: str | None
    stage: str | None
    funding_goal: float | None
    current_funding: float | None
    team_size: int | None
    location: str | None
    website: str | None
    logo_url: str | None
    pitch_deck_url: str | None
    ai_score: float | None
    ai_evaluation: dict | None
    created_at: datetime
    updated_at: datetime | None

    model_config = {"from_attributes": True}


class StartupListResponse(BaseModel):
    items: list[StartupResponse]
    total: int
    page: int
    per_page: int
