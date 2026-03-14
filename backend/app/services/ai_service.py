import json
from google import genai
from google.genai import types
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import settings
from app.schemas.ai import PitchEvaluationResult

_MODEL = "gemini-2.5-flash-lite"
_client = genai.Client(api_key=settings.GOOGLE_API_KEY)

# session_id -> list of {"role": "user"/"model", "parts": [{"text": ...}]}
_chat_histories: dict[str, list] = {}


def _generate(prompt: str) -> str:
    response = _client.models.generate_content(
        model=_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(temperature=0.3),
    )
    return response.text

def _pitch_prompt(pitch_text: str) -> str:
    return f"""You are an expert startup evaluator with 20 years of experience in venture capital.

Analyze the following startup pitch deck content and return a JSON object with this exact structure:
{{
  "score": <integer 0-100>,
  "strengths": ["<strength1>", "<strength2>"],
  "weaknesses": ["<weakness1>", "<weakness2>"],
  "suggestions": ["<suggestion1>", "<suggestion2>"],
  "market_size": "<estimated market size>",
  "business_model": "<business model description>",
  "team_assessment": "<team assessment>",
  "risks": ["<risk1>", "<risk2>"]
}}

Return ONLY the JSON object, no extra text.

Pitch deck content:
{pitch_text[:8000]}
"""


def _match_prompt(startup_summary: str, investors_list: str) -> str:
    return f"""You are a startup-investor matching expert.

Startup looking for investment:
{startup_summary}

Potential investors (ranked by vector similarity):
{investors_list}

For each investor, explain in 1-2 sentences why they are or are not a good match.
Return a JSON array:
[
  {{"investor_id": <id>, "explanation": "<why this investor matches>"}}
]

Return ONLY the JSON array, no extra text.
"""


def analyze_pitch_deck(file_path: str) -> PitchEvaluationResult:
    loader = PyPDFLoader(file_path)
    pages = loader.load()
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_documents(pages)
    pitch_text = "\n\n".join(c.page_content for c in chunks[:15])
    return analyze_pitch_text(pitch_text)


def analyze_pitch_text(text: str) -> PitchEvaluationResult:
    raw = _generate(_pitch_prompt(text)).strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    try:
        data = json.loads(raw.strip())
    except json.JSONDecodeError as exc:
        raise ValueError(f"LLM returned invalid JSON: {exc}") from exc
    return PitchEvaluationResult(**data)


def match_investors_for_startup(startup_id: int, db, limit: int = 5) -> list[dict]:
    from app.models.startup import Startup
    from app.services.vector_service import find_matching_investors

    startup = db.query(Startup).filter(Startup.id == startup_id).first()
    if not startup:
        return []

    description = f"{startup.name}. {startup.description or ''}"
    matches = find_matching_investors(description, db, limit=limit * 2)
    if not matches:
        return []

    investors_list = "\n".join(
        f"- ID:{inv.id} Name:{inv.name} Firm:{inv.firm or 'N/A'} "
        f"Focus:{inv.investment_focus or 'N/A'} Score:{score:.2f}"
        for inv, score in matches[:limit]
    )
    funding_line = f"Funding goal: ${startup.funding_goal:,.0f}" if startup.funding_goal else ""
    startup_summary = (
        f"Name: {startup.name}\n"
        f"Description: {startup.description}\n"
        f"Industry: {startup.industry}\n"
        f"Stage: {startup.stage}\n"
        f"{funding_line}"
    ).strip()

    raw = _generate(_match_prompt(startup_summary, investors_list)).strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    try:
        explanations = {item["investor_id"]: item["explanation"] for item in json.loads(raw.strip())}
    except (json.JSONDecodeError, KeyError):
        explanations = {}

    results = []
    for investor, score in matches[:limit]:
        results.append({
            "investor_id": investor.id,
            "investor_name": investor.name,
            "firm": investor.firm,
            "similarity_score": round(score, 3),
            "explanation": explanations.get(investor.id, ""),
        })
    return results


def chat(message: str, session_id: str) -> str:
    if session_id not in _chat_histories:
        _chat_histories[session_id] = []

    history = _chat_histories[session_id]

    system = (
        "You are an expert AI startup advisor with deep knowledge of venture capital, "
        "fundraising, pitch decks, and startup ecosystems. "
        "Give concise, practical, actionable advice."
    )

    # Build contents list with history (last 10 exchanges)
    contents = []
    for human_msg, ai_msg in history[-10:]:
        contents.append(types.Content(role="user", parts=[types.Part(text=human_msg)]))
        contents.append(types.Content(role="model", parts=[types.Part(text=ai_msg)]))
    contents.append(types.Content(role="user", parts=[types.Part(text=message)]))

    response = _client.models.generate_content(
        model=_MODEL,
        contents=contents,
        config=types.GenerateContentConfig(
            temperature=0.7,
            system_instruction=system,
        ),
    )
    reply = response.text

    history.append((message, reply))
    _chat_histories[session_id] = history

    return reply
