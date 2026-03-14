import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from fastapi.testclient import TestClient

from app.config import settings
from app.database import Base, get_db
from app.main import app
from app.models.user import User
from app.services.auth_service import hash_password, create_access_token


_engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
_TestingSessionLocal = sessionmaker(bind=_engine, autocommit=False, autoflush=False)


@pytest.fixture(scope="session", autouse=True)
def _ensure_tables():
    Base.metadata.create_all(bind=_engine)


@pytest.fixture()
def db():
    """Provide a transactional DB session that rolls back after each test."""
    connection = _engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)
    session.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def _restart_savepoint(sess, trans):
        if trans.nested and not trans._parent.nested:
            sess.begin_nested()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db):
    """FastAPI TestClient with DB dependency overridden to use the test session."""
    def _override():
        yield db

    app.dependency_overrides[get_db] = _override
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def test_user(db) -> User:
    """Insert a test user and return the ORM instance."""
    user = User(
        email="testuser@example.com",
        hashed_password=hash_password("Secret123"),
        full_name="Test User",
        role="founder",
        is_active=True,
    )
    db.add(user)
    db.flush()
    return user


@pytest.fixture()
def auth_headers(test_user) -> dict[str, str]:
    """Return Authorization headers for the test user."""
    token = create_access_token({"sub": str(test_user.id)})
    return {"Authorization": f"Bearer {token}"}
