from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.startup import Startup
from app.schemas.startup import StartupCreate, StartupUpdate, StartupResponse, StartupListResponse
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter()


def _trigger_embedding(startup_id: int):
    from app.database import SessionLocal
    from app.services.vector_service import update_startup_embedding
    db = SessionLocal()
    try:
        update_startup_embedding(startup_id, db)
    finally:
        db.close()


@router.get("", response_model=StartupListResponse)
def list_startups(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    industry: str | None = None,
    stage: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Startup)
    if industry:
        query = query.filter(Startup.industry == industry)
    if stage:
        query = query.filter(Startup.stage == stage)
    total = query.count()
    items = query.order_by(Startup.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return StartupListResponse(items=items, total=total, page=page, per_page=per_page)


@router.post("", response_model=StartupResponse, status_code=201)
def create_startup(
    body: StartupCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    startup = Startup(**body.model_dump())
    db.add(startup)
    db.commit()
    db.refresh(startup)
    if startup.description:
        background_tasks.add_task(_trigger_embedding, startup.id)
    return startup


@router.get("/search", response_model=StartupListResponse)
def search_startups(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Startup).filter(
        Startup.name.ilike(f"%{q}%") | Startup.description.ilike(f"%{q}%")
    )
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    return StartupListResponse(items=items, total=total, page=page, per_page=per_page)


@router.get("/{startup_id}", response_model=StartupResponse)
def get_startup(startup_id: int, db: Session = Depends(get_db)):
    startup = db.query(Startup).filter(Startup.id == startup_id).first()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found")
    return startup


@router.put("/{startup_id}", response_model=StartupResponse)
def update_startup(
    startup_id: int,
    body: StartupUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    startup = db.query(Startup).filter(Startup.id == startup_id).first()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found")
    data = body.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(startup, key, value)
    db.commit()
    db.refresh(startup)
    if "description" in data and startup.description:
        background_tasks.add_task(_trigger_embedding, startup.id)
    return startup


@router.delete("/{startup_id}", status_code=204)
def delete_startup(
    startup_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    startup = db.query(Startup).filter(Startup.id == startup_id).first()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup not found")
    db.delete(startup)
    db.commit()
