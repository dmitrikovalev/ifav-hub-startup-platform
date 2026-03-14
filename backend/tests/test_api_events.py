"""Tests for events API endpoints."""
import pytest
from datetime import datetime, timezone, timedelta


class TestCreateEvent:
    def test_create_success(self, client, auth_headers):
        resp = client.post("/api/events", json={
            "title": "Demo Day",
            "start_time": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "event_type": "demo_day",
        }, headers=auth_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert data["title"] == "Demo Day"
        assert data["event_type"] == "demo_day"

    def test_create_online_event(self, client, auth_headers):
        resp = client.post("/api/events", json={
            "title": "Webinar",
            "start_time": datetime.now(timezone.utc).isoformat(),
            "is_online": True,
            "meeting_url": "https://zoom.us/123",
        }, headers=auth_headers)
        assert resp.status_code == 201
        assert resp.json()["is_online"] is True


class TestListEvents:
    def test_list(self, client):
        resp = client.get("/api/events")
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)


class TestGetEvent:
    def test_get_existing(self, client, auth_headers):
        create = client.post("/api/events", json={
            "title": "FindMe",
            "start_time": datetime.now(timezone.utc).isoformat(),
        }, headers=auth_headers)
        eid = create.json()["id"]
        resp = client.get(f"/api/events/{eid}")
        assert resp.status_code == 200
        assert resp.json()["title"] == "FindMe"

    def test_get_nonexistent(self, client):
        resp = client.get("/api/events/999999")
        assert resp.status_code == 404


class TestUpdateEvent:
    def test_update_success(self, client, auth_headers):
        create = client.post("/api/events", json={
            "title": "Old Title",
            "start_time": datetime.now(timezone.utc).isoformat(),
        }, headers=auth_headers)
        eid = create.json()["id"]
        resp = client.put(f"/api/events/{eid}", json={
            "title": "New Title",
        }, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["title"] == "New Title"


class TestDeleteEvent:
    def test_delete_success(self, client, auth_headers):
        create = client.post("/api/events", json={
            "title": "Temp",
            "start_time": datetime.now(timezone.utc).isoformat(),
        }, headers=auth_headers)
        eid = create.json()["id"]
        resp = client.delete(f"/api/events/{eid}", headers=auth_headers)
        assert resp.status_code == 204

    def test_delete_nonexistent(self, client, auth_headers):
        resp = client.delete("/api/events/999999", headers=auth_headers)
        assert resp.status_code == 404
