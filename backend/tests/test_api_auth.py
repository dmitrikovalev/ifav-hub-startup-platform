"""Tests for auth API endpoints."""
import pytest


class TestRegister:
    def test_register_success(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "new@example.com",
            "password": "secret123",
            "full_name": "New User",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_register_duplicate_email(self, client, test_user):
        resp = client.post("/api/auth/register", json={
            "email": test_user.email,
            "password": "secret123",
            "full_name": "Dup User",
        })
        assert resp.status_code == 400
        assert "already registered" in resp.json()["detail"]

    def test_register_admin_role_rejected(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "admin@example.com",
            "password": "secret123",
            "full_name": "Admin",
            "role": "admin",
        })
        assert resp.status_code == 422

    def test_register_short_password_rejected(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "short@example.com",
            "password": "abc",
            "full_name": "Short",
        })
        assert resp.status_code == 422

    def test_register_investor_role(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "investor@example.com",
            "password": "secret123",
            "full_name": "Inv User",
            "role": "investor",
        })
        assert resp.status_code == 201


class TestLogin:
    def test_login_success(self, client, test_user):
        resp = client.post("/api/auth/login", json={
            "email": test_user.email,
            "password": "Secret123",
        })
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    def test_login_wrong_password(self, client, test_user):
        resp = client.post("/api/auth/login", json={
            "email": test_user.email,
            "password": "wrongpass",
        })
        assert resp.status_code == 401
        assert "Invalid" in resp.json()["detail"]

    def test_login_nonexistent_email(self, client):
        resp = client.post("/api/auth/login", json={
            "email": "nobody@example.com",
            "password": "anything",
        })
        assert resp.status_code == 401


class TestMe:
    def test_me_authenticated(self, client, auth_headers, test_user):
        resp = client.get("/api/auth/me", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == test_user.email
        assert data["full_name"] == "Test User"
        assert data["role"] == "founder"

    def test_me_no_token(self, client):
        resp = client.get("/api/auth/me")
        assert resp.status_code in (401, 403)

    def test_me_invalid_token(self, client):
        resp = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid"})
        assert resp.status_code == 401
