"""Tests for Pydantic schema validation."""
import pytest
from pydantic import ValidationError
from datetime import datetime

from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.schemas.startup import StartupCreate, StartupUpdate, StartupResponse
from app.schemas.investor import InvestorCreate
from app.schemas.deal import DealCreate
from app.schemas.event import EventCreate
from app.schemas.ai import (
    PitchEvaluationResult, EvaluateRequest, ChatRequest,
    MatchRequest, DocumentResponse,
)


# ── Auth schemas ──────────────────────────────────────────────

class TestRegisterRequest:
    def test_valid_founder(self):
        req = RegisterRequest(email="a@b.com", password="abcdef", full_name="Alice")
        assert req.role == "founder"

    def test_valid_investor(self):
        req = RegisterRequest(email="a@b.com", password="abcdef", full_name="Bob", role="investor")
        assert req.role == "investor"

    def test_admin_role_rejected(self):
        with pytest.raises(ValidationError, match="Input should be 'founder' or 'investor'"):
            RegisterRequest(email="a@b.com", password="abcdef", full_name="Eve", role="admin")

    def test_unknown_role_rejected(self):
        with pytest.raises(ValidationError):
            RegisterRequest(email="a@b.com", password="abcdef", full_name="Eve", role="superuser")

    def test_short_password_rejected(self):
        with pytest.raises(ValidationError, match="at least 6 characters"):
            RegisterRequest(email="a@b.com", password="abc", full_name="Alice")

    def test_empty_password_rejected(self):
        with pytest.raises(ValidationError):
            RegisterRequest(email="a@b.com", password="", full_name="Alice")

    def test_invalid_email_rejected(self):
        with pytest.raises(ValidationError):
            RegisterRequest(email="not-an-email", password="abcdef", full_name="Alice")

    def test_missing_full_name_rejected(self):
        with pytest.raises(ValidationError):
            RegisterRequest(email="a@b.com", password="abcdef")


class TestLoginRequest:
    def test_valid(self):
        req = LoginRequest(email="a@b.com", password="secret")
        assert req.email == "a@b.com"

    def test_invalid_email(self):
        with pytest.raises(ValidationError):
            LoginRequest(email="bad", password="secret")


# ── Startup schemas ──────────────────────────────────────────

class TestStartupCreate:
    def test_minimal(self):
        s = StartupCreate(name="Acme")
        assert s.name == "Acme"
        assert s.description is None

    def test_full(self):
        s = StartupCreate(
            name="Acme", description="A startup", industry="fintech",
            stage="seed", funding_goal=1_000_000, team_size=5,
            location="NYC", website="https://acme.io",
        )
        assert s.funding_goal == 1_000_000

    def test_missing_name_rejected(self):
        with pytest.raises(ValidationError):
            StartupCreate()


class TestStartupUpdate:
    def test_partial_update(self):
        s = StartupUpdate(name="New Name")
        dumped = s.model_dump(exclude_unset=True)
        assert dumped == {"name": "New Name"}

    def test_empty_update_is_valid(self):
        s = StartupUpdate()
        assert s.model_dump(exclude_unset=True) == {}


# ── Deal schemas ─────────────────────────────────────────────

class TestDealCreate:
    def test_minimal(self):
        d = DealCreate(startup_id=1, title="Seed Round")
        assert d.stage == "lead"
        assert d.probability == 0

    def test_full(self):
        d = DealCreate(
            startup_id=1, investor_id=2, title="Deal",
            amount=500_000, stage="proposal", probability=60,
        )
        assert d.amount == 500_000

    def test_missing_title_rejected(self):
        with pytest.raises(ValidationError):
            DealCreate(startup_id=1)


# ── Event schemas ────────────────────────────────────────────

class TestEventCreate:
    def test_minimal(self):
        ev = EventCreate(title="Demo Day", start_time=datetime.now())
        assert ev.is_online is False

    def test_online_event(self):
        ev = EventCreate(
            title="Webinar", start_time=datetime.now(),
            is_online=True, meeting_url="https://zoom.us/123",
        )
        assert ev.is_online is True


# ── AI schemas ───────────────────────────────────────────────

class TestPitchEvaluationResult:
    def test_valid(self):
        r = PitchEvaluationResult(
            score=75,
            strengths=["strong team"],
            weaknesses=["no traction"],
            suggestions=["get customers"],
            market_size="$10B",
            business_model="SaaS",
            team_assessment="experienced",
            risks=["competition"],
        )
        assert r.score == 75

    def test_missing_field_rejected(self):
        with pytest.raises(ValidationError):
            PitchEvaluationResult(score=75)


class TestEvaluateRequest:
    def test_text_only(self):
        r = EvaluateRequest(text="My startup does X")
        assert r.startup_id is None

    def test_startup_id_only(self):
        r = EvaluateRequest(startup_id=1)
        assert r.text is None

    def test_empty_is_valid(self):
        r = EvaluateRequest()
        assert r.text is None and r.startup_id is None


class TestChatRequest:
    def test_valid(self):
        r = ChatRequest(message="Hello", session_id="s1")
        assert r.message == "Hello"

    def test_missing_session_id_rejected(self):
        with pytest.raises(ValidationError):
            ChatRequest(message="Hello")


class TestMatchRequest:
    def test_defaults(self):
        r = MatchRequest(startup_id=1)
        assert r.limit == 5


class TestDocumentResponse:
    def test_valid(self):
        d = DocumentResponse(
            id=1, startup_id=1, filename="deck.pdf",
            file_url="/x.pdf", doc_type="pitch_deck",
            ai_analysis=None, status="pending",
        )
        assert d.status == "pending"


# ── Investor schemas ─────────────────────────────────────────

class TestInvestorCreate:
    def test_minimal(self):
        i = InvestorCreate(name="Alice VC")
        assert i.firm is None

    def test_with_arrays(self):
        i = InvestorCreate(
            name="Alice VC", industries=["fintech", "saas"],
            stages=["seed", "series_a"],
        )
        assert len(i.industries) == 2
