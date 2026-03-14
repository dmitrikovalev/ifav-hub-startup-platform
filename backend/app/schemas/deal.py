from datetime import datetime, date
from pydantic import BaseModel


class DealCreate(BaseModel):
    startup_id: int
    investor_id: int | None = None
    title: str
    amount: float | None = None
    stage: str = "lead"
    probability: int = 0
    expected_close: date | None = None
    notes: str | None = None


class DealUpdate(BaseModel):
    investor_id: int | None = None
    title: str | None = None
    amount: float | None = None
    stage: str | None = None
    probability: int | None = None
    expected_close: date | None = None
    notes: str | None = None


class DealStartupInfo(BaseModel):
    id: int
    name: str
    industry: str | None

    model_config = {"from_attributes": True}


class DealInvestorInfo(BaseModel):
    id: int
    name: str
    firm: str | None

    model_config = {"from_attributes": True}


class DealResponse(BaseModel):
    id: int
    startup_id: int
    investor_id: int | None
    title: str
    amount: float | None
    stage: str
    probability: int
    expected_close: date | None
    notes: str | None
    startup: DealStartupInfo | None
    investor: DealInvestorInfo | None
    created_at: datetime
    updated_at: datetime | None

    model_config = {"from_attributes": True}


class DealStatsResponse(BaseModel):
    total: int
    by_stage: dict[str, int]
    total_value: float
