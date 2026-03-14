from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.investor import Investor
from app.schemas.investor import InvestorCreate, InvestorUpdate, InvestorResponse, InvestorListResponse
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter()


def _trigger_embedding(investor_id: int):
    from app.database import SessionLocal
    from app.services.vector_service import update_investor_embedding
    db = SessionLocal()
    try:
        update_investor_embedding(investor_id, db)
    finally:
        db.close()


@router.get("", response_model=InvestorListResponse)
def list_investors(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    industry: str | None = None,
    stage: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Investor)
    if industry:
        query = query.filter(Investor.industries.any(industry))
    if stage:
        query = query.filter(Investor.stages.any(stage))
    total = query.count()
    items = query.order_by(Investor.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return InvestorListResponse(items=items, total=total, page=page, per_page=per_page)


@router.post("", response_model=InvestorResponse, status_code=201)
def create_investor(
    body: InvestorCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    investor = Investor(**body.model_dump())
    db.add(investor)
    db.commit()
    db.refresh(investor)
    if investor.investment_focus:
        background_tasks.add_task(_trigger_embedding, investor.id)
    return investor


@router.get("/search", response_model=InvestorListResponse)
def search_investors(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Investor).filter(
        Investor.name.ilike(f"%{q}%")
        | Investor.firm.ilike(f"%{q}%")
        | Investor.investment_focus.ilike(f"%{q}%")
    )
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    return InvestorListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/{investor_id}", response_model=InvestorResponse)
def get_investor(investor_id: int, db: Session = Depends(get_db)):
    investor = db.query(Investor).filter(Investor.id == investor_id).first()
    if not investor:
        raise HTTPException(status_code=404, detail="Investor not found")
    return investor


@router.put("/{investor_id}", response_model=InvestorResponse)
def update_investor(
    investor_id: int,
    body: InvestorUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    investor = db.query(Investor).filter(Investor.id == investor_id).first()
    if not investor:
        raise HTTPException(status_code=404, detail="Investor not found")
    data = body.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(investor, key, value)
    db.commit()
    db.refresh(investor)
    if "investment_focus" in data and investor.investment_focus:
        background_tasks.add_task(_trigger_embedding, investor.id)
    return investor


@router.delete("/{investor_id}", status_code=204)
def delete_investor(
    investor_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    investor = db.query(Investor).filter(Investor.id == investor_id).first()
    if not investor:
        raise HTTPException(status_code=404, detail="Investor not found")
    db.delete(investor)
    db.commit()
