"""Tests for startups API endpoints."""
import pytest
from unittest.mock import patch


class TestListStartups:
    def test_list_empty(self, client):
        resp = client.get("/api/startups")
        assert resp.status_code == 200
        data = resp.json()
        assert data["items"] == [] or isinstance(data["items"], list)
        assert "total" in data


class TestCreateStartup:
    @patch("app.routers.startups._trigger_embedding")
    def test_create_success(self, mock_embed, client, auth_headers):
        resp = client.post("/api/startups", json={
            "name": "TestStartup",
            "description": "A test startup",
            "industry": "fintech",
            "stage": "seed",
        }, headers=auth_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "TestStartup"
        assert data["industry"] == "fintech"
        assert data["id"] is not None

    def test_create_requires_auth(self, client):
        resp = client.post("/api/startups", json={"name": "NoAuth"})
        assert resp.status_code in (401, 403)

    @patch("app.routers.startups._trigger_embedding")
    def test_create_minimal(self, mock_embed, client, auth_headers):
        resp = client.post("/api/startups", json={"name": "Minimal"}, headers=auth_headers)
        assert resp.status_code == 201
        assert resp.json()["description"] is None


class TestGetStartup:
    @patch("app.routers.startups._trigger_embedding")
    def test_get_existing(self, mock_embed, client, auth_headers):
        create = client.post("/api/startups", json={"name": "GetMe"}, headers=auth_headers)
        sid = create.json()["id"]
        resp = client.get(f"/api/startups/{sid}")
        assert resp.status_code == 200
        assert resp.json()["name"] == "GetMe"

    def test_get_nonexistent(self, client):
        resp = client.get("/api/startups/999999")
        assert resp.status_code == 404


class TestUpdateStartup:
    @patch("app.routers.startups._trigger_embedding")
    def test_update_success(self, mock_embed, client, auth_headers):
        create = client.post("/api/startups", json={"name": "Old"}, headers=auth_headers)
        sid = create.json()["id"]
        resp = client.put(f"/api/startups/{sid}", json={"name": "New"}, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["name"] == "New"

    @patch("app.routers.startups._trigger_embedding")
    def test_update_nonexistent(self, mock_embed, client, auth_headers):
        resp = client.put("/api/startups/999999", json={"name": "X"}, headers=auth_headers)
        assert resp.status_code == 404


class TestDeleteStartup:
    @patch("app.routers.startups._trigger_embedding")
    def test_delete_success(self, mock_embed, client, auth_headers):
        create = client.post("/api/startups", json={"name": "Del"}, headers=auth_headers)
        sid = create.json()["id"]
        resp = client.delete(f"/api/startups/{sid}", headers=auth_headers)
        assert resp.status_code == 204
        assert client.get(f"/api/startups/{sid}").status_code == 404

    def test_delete_nonexistent(self, client, auth_headers):
        resp = client.delete("/api/startups/999999", headers=auth_headers)
        assert resp.status_code == 404


class TestSearchStartups:
    @patch("app.routers.startups._trigger_embedding")
    def test_search(self, mock_embed, client, auth_headers):
        client.post("/api/startups", json={"name": "AlphaSearch"}, headers=auth_headers)
        resp = client.get("/api/startups/search", params={"q": "Alpha"})
        assert resp.status_code == 200
        items = resp.json()["items"]
        assert any(s["name"] == "AlphaSearch" for s in items)
