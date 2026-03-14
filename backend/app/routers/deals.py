from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.deal import Deal
from app.schemas.deal import DealCreate, DealUpdate, DealResponse, DealStatsResponse
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter()

STAGES = ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"]


@router.get("", response_model=list[DealResponse])
def list_deals(
    startup_id: int | None = None,
    stage: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Deal)
    if startup_id is not None:
        query = query.filter(Deal.startup_id == startup_id)
    if stage:
        query = query.filter(Deal.stage == stage)
    return query.order_by(Deal.created_at.desc()).all()


@router.get("/stats", response_model=DealStatsResponse)
def deal_stats(db: Session = Depends(get_db)):
    total = db.query(Deal).count()
    rows = db.query(Deal.stage, func.count(Deal.id)).group_by(Deal.stage).all()
    by_stage = {stage: 0 for stage in STAGES}
    for stage, count in rows:
        by_stage[stage] = count
    total_value = db.query(func.sum(Deal.amount)).filter(
        Deal.stage.notin_(["closed_lost"])
    ).scalar() or 0
    return DealStatsResponse(total=total, by_stage=by_stage, total_value=total_value)


@router.post("", response_model=DealResponse, status_code=201)
def create_deal(
    body: DealCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    deal = Deal(**body.model_dump())
    db.add(deal)
    db.commit()
    db.refresh(deal)
    return db.query(Deal).filter(Deal.id == deal.id).first()


@router.get("/{deal_id}", response_model=DealResponse)
def get_deal(deal_id: int, db: Session = Depends(get_db)):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return deal


@router.put("/{deal_id}", response_model=DealResponse)
def update_deal(
    deal_id: int,
    body: DealUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(deal, key, value)
    db.commit()
    db.refresh(deal)
    return db.query(Deal).filter(Deal.id == deal_id).first()


@router.delete("/{deal_id}", status_code=204)
def delete_deal(
    deal_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    db.delete(deal)
    db.commit()
