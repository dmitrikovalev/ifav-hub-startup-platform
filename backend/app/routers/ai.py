from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.ai import (
    EvaluateRequest, PitchEvaluationResult,
    MatchRequest, MatchResponse, InvestorMatchResult,
    ChatRequest, ChatResponse,
)
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/evaluate", response_model=PitchEvaluationResult)
def evaluate_pitch(
    body: EvaluateRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    from app.services.ai_service import analyze_pitch_text
    from app.models.startup import Startup

    if body.startup_id:
        startup = db.query(Startup).filter(Startup.id == body.startup_id).first()
        if not startup:
            raise HTTPException(status_code=404, detail="Startup not found")
        text = f"{startup.name}\n{startup.description or ''}"
    elif body.text:
        text = body.text
    else:
        raise HTTPException(status_code=400, detail="Provide either text or startup_id")

    result = analyze_pitch_text(text)

    if body.startup_id:
        startup.ai_score = result.score
        startup.ai_evaluation = result.model_dump()
        db.commit()

    return result


@router.post("/match", response_model=MatchResponse)
def match_investors(
    body: MatchRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    from app.services.ai_service import match_investors_for_startup
    matches = match_investors_for_startup(body.startup_id, db, body.limit)
    if not matches:
        raise HTTPException(status_code=404, detail="No matching investors found — ensure investors have embeddings")
    return MatchResponse(
        startup_id=body.startup_id,
        matches=[InvestorMatchResult(**m) for m in matches],
    )


@router.post("/chat", response_model=ChatResponse)
def chat_with_ai(
    body: ChatRequest,
    _: User = Depends(get_current_user),
):
    from app.services.ai_service import chat
    response = chat(body.message, body.session_id)
    return ChatResponse(response=response, session_id=body.session_id)


def _bg_embed_startup(startup_id: int):
    from app.database import SessionLocal
    from app.services.vector_service import update_startup_embedding
    db = SessionLocal()
    try:
        update_startup_embedding(startup_id, db)
    finally:
        db.close()


def _bg_embed_investor(investor_id: int):
    from app.database import SessionLocal
    from app.services.vector_service import update_investor_embedding
    db = SessionLocal()
    try:
        update_investor_embedding(investor_id, db)
    finally:
        db.close()


@router.post("/embed-startup/{startup_id}", status_code=202)
def embed_startup(
    startup_id: int,
    background_tasks: BackgroundTasks,
    _: User = Depends(get_current_user),
):
    background_tasks.add_task(_bg_embed_startup, startup_id)
    return {"message": f"Embedding generation started for startup {startup_id}"}


@router.post("/embed-investor/{investor_id}", status_code=202)
def embed_investor(
    investor_id: int,
    background_tasks: BackgroundTasks,
    _: User = Depends(get_current_user),
):
    background_tasks.add_task(_bg_embed_investor, investor_id)
    return {"message": f"Embedding generation started for investor {investor_id}"}
