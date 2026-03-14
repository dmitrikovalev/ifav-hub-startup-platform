from pydantic import BaseModel


class PitchEvaluationResult(BaseModel):
    score: int
    strengths: list[str]
    weaknesses: list[str]
    suggestions: list[str]
    market_size: str
    business_model: str
    team_assessment: str
    risks: list[str]


class EvaluateRequest(BaseModel):
    text: str | None = None
    startup_id: int | None = None


class InvestorMatchResult(BaseModel):
    investor_id: int
    investor_name: str
    firm: str | None
    similarity_score: float
    explanation: str


class MatchRequest(BaseModel):
    startup_id: int
    limit: int = 5


class MatchResponse(BaseModel):
    startup_id: int
    matches: list[InvestorMatchResult]


class ChatRequest(BaseModel):
    message: str
    session_id: str


class ChatResponse(BaseModel):
    response: str
    session_id: str


class DocumentResponse(BaseModel):
    id: int
    startup_id: int
    filename: str
    file_url: str
    doc_type: str
    ai_analysis: dict | None
    status: str

    model_config = {"from_attributes": True}
