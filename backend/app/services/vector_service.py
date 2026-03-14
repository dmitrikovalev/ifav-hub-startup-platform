from sqlalchemy.orm import Session
from sqlalchemy import text
from google import genai

from app.config import settings

_client = genai.Client(api_key=settings.GOOGLE_API_KEY)
_EMBED_MODEL = "gemini-embedding-001"


def generate_embedding(text_input: str) -> list[float]:
    response = _client.models.embed_content(
        model=_EMBED_MODEL,
        contents=text_input,
    )
    return response.embeddings[0].values


def update_startup_embedding(startup_id: int, db: Session) -> None:
    from app.models.startup import Startup
    startup = db.query(Startup).filter(Startup.id == startup_id).first()
    if not startup or not startup.description:
        return
    text_to_embed = f"{startup.name}. {startup.description}"
    if startup.industry:
        text_to_embed += f" Industry: {startup.industry}."
    if startup.stage:
        text_to_embed += f" Stage: {startup.stage}."
    embedding = generate_embedding(text_to_embed)
    startup.embedding = embedding
    db.commit()


def update_investor_embedding(investor_id: int, db: Session) -> None:
    from app.models.investor import Investor
    investor = db.query(Investor).filter(Investor.id == investor_id).first()
    if not investor or not investor.investment_focus:
        return
    text_to_embed = f"{investor.name}. {investor.investment_focus}"
    if investor.industries:
        text_to_embed += f" Focus industries: {', '.join(investor.industries)}."
    if investor.stages:
        text_to_embed += f" Preferred stages: {', '.join(investor.stages)}."
    embedding = generate_embedding(text_to_embed)
    investor.embedding = embedding
    db.commit()


def find_matching_investors(description: str, db: Session, limit: int = 10):
    """Return list of (Investor, similarity_score) sorted by cosine similarity."""
    from app.models.investor import Investor
    query_vector = generate_embedding(description)
    vector_str = f"[{','.join(str(v) for v in query_vector)}]"
    rows = db.execute(
        text(
            "SELECT id, 1 - (embedding <=> :qvec::vector) AS similarity "
            "FROM investors "
            "WHERE embedding IS NOT NULL "
            "ORDER BY embedding <=> :qvec::vector "
            "LIMIT :lim"
        ),
        {"qvec": vector_str, "lim": limit},
    ).fetchall()
    if not rows:
        return []
    ids = [row.id for row in rows]
    sim_by_id = {row.id: float(row.similarity) for row in rows}
    investors = {inv.id: inv for inv in db.query(Investor).filter(Investor.id.in_(ids)).all()}
    return [(investors[rid], sim_by_id[rid]) for rid in ids if rid in investors]


def find_similar_startups(description: str, db: Session, limit: int = 5):
    """Return list of (Startup, similarity_score) sorted by cosine similarity."""
    from app.models.startup import Startup
    query_vector = generate_embedding(description)
    vector_str = f"[{','.join(str(v) for v in query_vector)}]"
    rows = db.execute(
        text(
            "SELECT id, 1 - (embedding <=> :qvec::vector) AS similarity "
            "FROM startups "
            "WHERE embedding IS NOT NULL "
            "ORDER BY embedding <=> :qvec::vector "
            "LIMIT :lim"
        ),
        {"qvec": vector_str, "lim": limit},
    ).fetchall()
    if not rows:
        return []
    ids = [row.id for row in rows]
    sim_by_id = {row.id: float(row.similarity) for row in rows}
    startups = {s.id: s for s in db.query(Startup).filter(Startup.id.in_(ids)).all()}
    return [(startups[rid], sim_by_id[rid]) for rid in ids if rid in startups]
