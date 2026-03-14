"""Tests for AI service: prompt generation, JSON parsing, chat."""
import json
import pytest
from unittest.mock import patch, MagicMock

from app.services.ai_service import (
    _pitch_prompt, _match_prompt,
    analyze_pitch_text, chat,
    _chat_histories,
)
from app.schemas.ai import PitchEvaluationResult


class TestPitchPrompt:
    def test_contains_pitch_text(self):
        prompt = _pitch_prompt("My startup builds rockets")
        assert "My startup builds rockets" in prompt

    def test_truncates_long_text(self):
        long_text = "A" * 10000
        prompt = _pitch_prompt(long_text)
        assert "A" * 8000 in prompt
        assert "A" * 8001 not in prompt

    def test_contains_json_structure(self):
        prompt = _pitch_prompt("test")
        assert '"score"' in prompt
        assert '"strengths"' in prompt
        assert '"risks"' in prompt

    def test_instructs_json_only(self):
        prompt = _pitch_prompt("test")
        assert "Return ONLY the JSON" in prompt


class TestMatchPrompt:
    def test_contains_startup_and_investors(self):
        prompt = _match_prompt("Startup X does Y", "- Investor A\n- Investor B")
        assert "Startup X does Y" in prompt
        assert "Investor A" in prompt
        assert "Investor B" in prompt

    def test_requests_json_array(self):
        prompt = _match_prompt("s", "i")
        assert "JSON array" in prompt
        assert '"investor_id"' in prompt


class TestAnalyzePitchText:
    VALID_RESPONSE = json.dumps({
        "score": 80,
        "strengths": ["good team"],
        "weaknesses": ["small market"],
        "suggestions": ["expand"],
        "market_size": "$5B",
        "business_model": "SaaS B2B",
        "team_assessment": "strong",
        "risks": ["competition"],
    })

    @patch("app.services.ai_service._generate")
    def test_returns_evaluation_result(self, mock_gen):
        mock_gen.return_value = self.VALID_RESPONSE
        result = analyze_pitch_text("My startup does X")
        assert isinstance(result, PitchEvaluationResult)
        assert result.score == 80
        assert "good team" in result.strengths

    @patch("app.services.ai_service._generate")
    def test_strips_markdown_code_fence(self, mock_gen):
        mock_gen.return_value = f"```json\n{self.VALID_RESPONSE}\n```"
        result = analyze_pitch_text("test")
        assert result.score == 80

    @patch("app.services.ai_service._generate")
    def test_strips_code_fence_without_json_tag(self, mock_gen):
        mock_gen.return_value = f"```\n{self.VALID_RESPONSE}\n```"
        result = analyze_pitch_text("test")
        assert result.score == 80

    @patch("app.services.ai_service._generate")
    def test_invalid_json_raises_value_error(self, mock_gen):
        mock_gen.return_value = "This is not JSON at all"
        with pytest.raises(ValueError, match="LLM returned invalid JSON"):
            analyze_pitch_text("test")

    @patch("app.services.ai_service._generate")
    def test_missing_fields_raises(self, mock_gen):
        mock_gen.return_value = json.dumps({"score": 50})
        with pytest.raises(Exception):
            analyze_pitch_text("test")


class TestChat:
    @patch("app.services.ai_service._client")
    def test_returns_string_response(self, mock_client):
        mock_response = MagicMock()
        mock_response.text = "Here is my advice"
        mock_client.models.generate_content.return_value = mock_response

        _chat_histories.clear()
        result = chat("How do I raise a seed round?", "test-session")
        assert result == "Here is my advice"

    @patch("app.services.ai_service._client")
    def test_stores_history(self, mock_client):
        mock_response = MagicMock()
        mock_response.text = "Response 1"
        mock_client.models.generate_content.return_value = mock_response

        _chat_histories.clear()
        chat("Question 1", "hist-session")
        assert len(_chat_histories["hist-session"]) == 1
        assert _chat_histories["hist-session"][0] == ("Question 1", "Response 1")

    @patch("app.services.ai_service._client")
    def test_new_session_starts_empty(self, mock_client):
        mock_response = MagicMock()
        mock_response.text = "Hi"
        mock_client.models.generate_content.return_value = mock_response

        _chat_histories.clear()
        chat("Hello", "fresh-session")
        assert "fresh-session" in _chat_histories
