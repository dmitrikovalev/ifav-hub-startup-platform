from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.event import Event
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.services.auth_service import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("", response_model=list[EventResponse])
def list_events(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.start_time.asc()).all()


@router.get("/upcoming", response_model=list[EventResponse])
def upcoming_events(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    return (
        db.query(Event)
        .filter(Event.start_time >= now)
        .order_by(Event.start_time.asc())
        .limit(limit)
        .all()
    )


@router.post("", response_model=EventResponse, status_code=201)
def create_event(
    body: EventCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    event = Event(**body.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    body: EventUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(event, key, value)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=204)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
