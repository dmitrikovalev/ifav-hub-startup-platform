from datetime import datetime
from pydantic import BaseModel


class InvestorCreate(BaseModel):
    name: str
    firm: str | None = None
    bio: str | None = None
    investment_focus: str | None = None
    industries: list[str] | None = None
    stages: list[str] | None = None
    min_investment: float | None = None
    max_investment: float | None = None
    portfolio_count: int | None = None
    location: str | None = None
    linkedin_url: str | None = None
    avatar_url: str | None = None


class InvestorUpdate(BaseModel):
    name: str | None = None
    firm: str | None = None
    bio: str | None = None
    investment_focus: str | None = None
    industries: list[str] | None = None
    stages: list[str] | None = None
    min_investment: float | None = None
    max_investment: float | None = None
    portfolio_count: int | None = None
    location: str | None = None
    linkedin_url: str | None = None
    avatar_url: str | None = None


class InvestorResponse(BaseModel):
    id: int
    name: str
    firm: str | None
    bio: str | None
    investment_focus: str | None
    industries: list[str] | None
    stages: list[str] | None
    min_investment: float | None
    max_investment: float | None
    portfolio_count: int | None
    location: str | None
    linkedin_url: str | None
    avatar_url: str | None
    created_at: datetime
    updated_at: datetime | None

    model_config = {"from_attributes": True}


class InvestorListResponse(BaseModel):
    items: list[InvestorResponse]
    total: int
    page: int
    per_page: int
