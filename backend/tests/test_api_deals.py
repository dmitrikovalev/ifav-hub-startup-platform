"""Tests for deals API endpoints."""
import pytest
from unittest.mock import patch


@pytest.fixture()
def startup_id(client, auth_headers):
    """Create a startup and return its ID for deal tests."""
    with patch("app.routers.startups._trigger_embedding"):
        resp = client.post("/api/startups", json={
            "name": "DealTestStartup", "industry": "saas",
        }, headers=auth_headers)
    return resp.json()["id"]


class TestCreateDeal:
    def test_create_success(self, client, auth_headers, startup_id):
        resp = client.post("/api/deals", json={
            "startup_id": startup_id,
            "title": "Seed Round",
            "amount": 500_000,
            "stage": "lead",
            "probability": 30,
        }, headers=auth_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Seed Round"
        assert data["probability"] == 30

    def test_create_requires_auth(self, client, startup_id):
        resp = client.post("/api/deals", json={
            "startup_id": startup_id, "title": "No Auth",
        })
        assert resp.status_code in (401, 403)

    def test_create_minimal(self, client, auth_headers, startup_id):
        resp = client.post("/api/deals", json={
            "startup_id": startup_id, "title": "Minimal Deal",
        }, headers=auth_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert data["stage"] == "lead"
        assert data["probability"] == 0


class TestListDeals:
    def test_list_all(self, client):
        resp = client.get("/api/deals")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_filter_by_stage(self, client, auth_headers, startup_id):
        client.post("/api/deals", json={
            "startup_id": startup_id, "title": "Lead Deal", "stage": "lead",
        }, headers=auth_headers)
        resp = client.get("/api/deals", params={"stage": "lead"})
        assert resp.status_code == 200
        for deal in resp.json():
            assert deal["stage"] == "lead"


class TestGetDeal:
    def test_get_existing(self, client, auth_headers, startup_id):
        create = client.post("/api/deals", json={
            "startup_id": startup_id, "title": "GetDeal",
        }, headers=auth_headers)
        did = create.json()["id"]
        resp = client.get(f"/api/deals/{did}")
        assert resp.status_code == 200
        assert resp.json()["title"] == "GetDeal"

    def test_get_nonexistent(self, client):
        resp = client.get("/api/deals/999999")
        assert resp.status_code == 404


class TestUpdateDeal:
    def test_update_stage(self, client, auth_headers, startup_id):
        create = client.post("/api/deals", json={
            "startup_id": startup_id, "title": "Move",
        }, headers=auth_headers)
        did = create.json()["id"]
        resp = client.put(f"/api/deals/{did}", json={"stage": "qualified"}, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["stage"] == "qualified"


class TestDeleteDeal:
    def test_delete_success(self, client, auth_headers, startup_id):
        create = client.post("/api/deals", json={
            "startup_id": startup_id, "title": "Delete Me",
        }, headers=auth_headers)
        did = create.json()["id"]
        resp = client.delete(f"/api/deals/{did}", headers=auth_headers)
        assert resp.status_code == 204

    def test_delete_nonexistent(self, client, auth_headers):
        resp = client.delete("/api/deals/999999", headers=auth_headers)
        assert resp.status_code == 404


class TestDealStats:
    def test_stats_returns_structure(self, client):
        resp = client.get("/api/deals/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert "total" in data
        assert "by_stage" in data
        assert "total_value" in data
