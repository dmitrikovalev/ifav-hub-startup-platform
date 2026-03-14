"""Tests for auth service: password hashing, JWT tokens."""
import pytest
from datetime import timedelta, datetime, timezone
from jose import jwt

from app.services.auth_service import (
    hash_password, verify_password,
    create_access_token, decode_token,
)
from app.config import settings


class TestPasswordHashing:
    def test_hash_returns_bcrypt_string(self):
        h = hash_password("mypassword")
        assert h.startswith("$2b$") or h.startswith("$2a$")

    def test_hash_is_different_each_time(self):
        h1 = hash_password("same")
        h2 = hash_password("same")
        assert h1 != h2

    def test_verify_correct_password(self):
        h = hash_password("correct")
        assert verify_password("correct", h) is True

    def test_verify_wrong_password(self):
        h = hash_password("correct")
        assert verify_password("wrong", h) is False

    def test_verify_empty_password(self):
        h = hash_password("notempty")
        assert verify_password("", h) is False


class TestJWT:
    def test_create_token_returns_string(self):
        token = create_access_token({"sub": "42"})
        assert isinstance(token, str)
        assert len(token) > 20

    def test_decode_valid_token(self):
        token = create_access_token({"sub": "42"})
        payload = decode_token(token)
        assert payload["sub"] == "42"
        assert "exp" in payload

    def test_decode_invalid_token_raises(self):
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            decode_token("invalid.token.here")
        assert exc_info.value.status_code == 401

    def test_decode_expired_token_raises(self):
        from fastapi import HTTPException
        payload = {"sub": "42", "exp": datetime.now(timezone.utc) - timedelta(hours=1)}
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        with pytest.raises(HTTPException) as exc_info:
            decode_token(token)
        assert exc_info.value.status_code == 401

    def test_token_contains_correct_sub(self):
        token = create_access_token({"sub": "99", "extra": "data"})
        payload = decode_token(token)
        assert payload["sub"] == "99"
        assert payload["extra"] == "data"

    def test_token_has_future_expiry(self):
        token = create_access_token({"sub": "1"})
        payload = decode_token(token)
        exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
        assert exp > datetime.now(timezone.utc)
