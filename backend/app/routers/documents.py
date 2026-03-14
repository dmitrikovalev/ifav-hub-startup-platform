import os
import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
import cloudinary
import cloudinary.uploader

from app.config import settings
from app.database import get_db
from app.models.document import Document
from app.schemas.ai import DocumentResponse
from app.services.auth_service import get_current_user
from app.models.user import User

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)

router = APIRouter()


def _analyze_document(document_id: int, file_path: str):
    from app.database import SessionLocal
    from app.services.ai_service import analyze_pitch_deck
    db = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            return
        doc.status = "analyzing"
        db.commit()
        result = analyze_pitch_deck(file_path)
        doc.ai_analysis = result.model_dump()
        doc.status = "done"
        db.commit()
    except Exception:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if doc:
            doc.status = "failed"
            db.commit()
    finally:
        db.close()
        if os.path.exists(file_path):
            os.remove(file_path)


@router.post("/upload", response_model=DocumentResponse, status_code=202)
async def upload_document(
    background_tasks: BackgroundTasks,
    startup_id: int = Form(...),
    doc_type: str = Form("pitch_deck"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    if not file.filename or not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    content = await file.read()

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    if settings.CLOUDINARY_CLOUD_NAME:
        upload_result = cloudinary.uploader.upload(
            tmp_path,
            resource_type="raw",
            folder="pitch-decks",
            public_id=f"startup_{startup_id}_{file.filename}",
        )
        file_url = upload_result["secure_url"]
    else:
        file_url = f"/local/{file.filename}"

    doc = Document(
        startup_id=startup_id,
        filename=file.filename,
        file_url=file_url,
        doc_type=doc_type,
        status="pending",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    background_tasks.add_task(_analyze_document, doc.id, tmp_path)
    return doc


@router.get("", response_model=list[DocumentResponse])
def list_documents(
    startup_id: int | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Document)
    if startup_id is not None:
        query = query.filter(Document.startup_id == startup_id)
    return query.order_by(Document.created_at.desc()).all()


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.delete("/{doc_id}", status_code=204)
def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(doc)
    db.commit()
