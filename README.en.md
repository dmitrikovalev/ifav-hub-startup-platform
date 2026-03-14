# Startup Ecosystem Platform

MVP platform for founders, investors, startups, and developers. Demonstrates AI integration, vector search, and full-stack product thinking.

---

## What It Does

| Section | Features |
|---|---|
| **Dashboard** | KPIs: active startups, investors, deals in pipeline; deal stage chart |
| **Startups** | Full CRUD — create, edit, delete startup profiles; search by name/industry |
| **Investors** | Full CRUD for investor profiles; filter by stage and focus area |
| **Deal Flow** | Kanban board — drag deals across stages (Intro → Term Sheet → Closed) |
| **Fundraising** | Charts: funding rounds history, capital raised by stage |
| **Accelerator** | Acceleration programs catalog with application status |
| **Events** | Event management: create, view upcoming, RSVP |
| **Documents** | Upload pitch decks (PDF) → AI auto-analysis: score, strengths, improvements |
| **Messages** | In-app messaging between participants |
| **AI Assistant** | Chat with conversation memory (last 10 exchanges), powered by Gemini 2.5 Flash Lite |

---

## Tech Stack

### Backend
- **FastAPI** — async REST API with automatic Swagger docs
- **SQLAlchemy 2.0** — ORM with type-safe models
- **Alembic** — database migrations
- **PostgreSQL 16 + pgvector** — relational storage + 768-dim vector embeddings
- **JWT (python-jose + bcrypt)** — authentication

### AI / Vector Search
- **Google Gemini 2.5 Flash Lite** — LLM for pitch deck analysis and investor matching
- **models/gemini-embedding-001** — cloud embeddings, 768 dimensions
- **google-genai SDK** — direct Gemini API calls for LLM and embeddings
- **LangChain** — PDF loading/splitting only (`PyPDFLoader`, `RecursiveCharacterTextSplitter`)
- **pgvector cosine similarity** — semantic investor/startup matching

> All AI runs in the cloud via a single `GOOGLE_API_KEY` — no local models, works on any machine.

### Frontend
- **React 19 + Vite** — fast HMR, React Compiler
- **TypeScript** — full type safety
- **Tailwind CSS** — utility-first styling
- **TanStack Query v5** — server state, caching, mutations
- **Recharts** — dashboard charts
- **React Router v6** — SPA navigation

### Infrastructure (all free)
| Service | Purpose |
|---|---|
| Docker | Local PostgreSQL 16 with pgvector |
| Neon.tech | Cloud PostgreSQL (production) |
| Cloudinary | PDF / file storage |
| Render.com | Backend hosting |
| Vercel | Frontend hosting |

---

## Quick Start

### Prerequisites
- Docker Desktop
- Python 3.11+ (tested on 3.14)
- Node.js 18+
- Google AI Studio API key → [aistudio.google.com](https://aistudio.google.com/apikey)

### 1. Start the database

```bash
cd startup-platform
docker compose up -d
```

Initializes PostgreSQL 16, enables `pgvector`, creates all tables, seeds sample data (10 startups, 8 investors, 5 events).

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
# Fill in .env: GOOGLE_API_KEY, CLOUDINARY_*, SECRET_KEY
```

### 3. Run the backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --reload-exclude venv --port 8000
```

API docs: **http://localhost:8000/docs**

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

App: **http://localhost:5173**

---

## Project Structure

```
startup-platform/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI entry point
│   │   ├── config.py         # Settings via Pydantic BaseSettings
│   │   ├── database.py       # SQLAlchemy engine + pgvector init
│   │   ├── models/           # ORM models (User, Startup, Investor, Deal, Event, Document)
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── routers/          # API endpoints (auth, startups, investors, deals, events, documents, ai)
│   │   └── services/
│   │       ├── ai_service.py     # google.genai: pitch eval, investor match, chat
│   │       ├── vector_service.py # Embeddings + pgvector similarity search
│   │       └── auth_service.py   # JWT + bcrypt
│   ├── tests/                # pytest suite (97 tests)
│   ├── alembic/              # DB migrations
│   ├── dbscripts/            # SQL scripts for manual setup
│   ├── docker-init/          # Auto-init SQL for Docker
│   ├── requirements.txt
│   └── pytest.ini
├── frontend/
│   └── src/
│       ├── api/              # Axios API clients
│       ├── components/       # Layout (Sidebar, RightPanel) + UI (Badge, Modal, ScoreRing...)
│       ├── pages/            # 11 pages: Login, Dashboard, Startups, Investors, DealFlow...
│       ├── utils/            # Shared utilities (format.ts + tests)
│       └── types/            # TypeScript interfaces
├── docker-compose.yml
├── .gitignore
├── README.en.md
└── README.ru.md
```

---

## Environment Variables

```env
# PostgreSQL (Docker local or Neon.tech cloud)
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/startupdb

# Google AI (LLM + Embeddings) — free at aistudio.google.com
GOOGLE_API_KEY=AIza...

# Auth
SECRET_KEY=your-random-32-char-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# File Storage — free at cloudinary.com
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# App
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

---

## How AI Works

1. **Pitch Deck Analysis** — user uploads PDF → backend extracts text via `PyPDFLoader` → Gemini scores the deck (0–100) across 6 dimensions (problem, solution, market, team, traction, financials) and suggests improvements.

2. **Investor Matching** — startup description is embedded via `gemini-embedding-001` → pgvector cosine similarity finds the top-N most compatible investors → Gemini explains why each investor is a good fit.

3. **AI Chat Assistant** — manual conversation history (in-memory, last 10 exchanges) → `google.genai` sends full context to Gemini → context-aware answers about the startup ecosystem.

---

## Testing

- **Backend**: 97 pytest tests — schemas, auth, AI service (mocked), API endpoints (transactional rollback)
- **Frontend**: 8 vitest tests — utility functions

```bash
cd backend && python -m pytest tests/ -v
cd frontend && npm test
```

---

## Clone & Run (5 minutes)

Everything needed to get the platform running from a fresh clone:

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/startup-platform.git
cd startup-platform

# 2. Start PostgreSQL + pgvector (Docker)
docker compose up -d

# 3. Backend
cd backend
cp .env.example .env          # then fill in GOOGLE_API_KEY, SECRET_KEY, CLOUDINARY_*
python -m venv venv
venv\Scripts\activate          # Windows  (Linux/Mac: source venv/bin/activate)
pip install -r requirements.txt
uvicorn app.main:app --reload --reload-exclude venv --port 8000

# 4. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**, register a new account, and start exploring.

### Where to Get Free API Keys

| Service | Sign up | What you get |
|---|---|---|
| **Google AI Studio** | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | `GOOGLE_API_KEY` — free Gemini LLM + embeddings |
| **Cloudinary** | [cloudinary.com](https://cloudinary.com/users/register_free) | `CLOUD_NAME`, `API_KEY`, `API_SECRET` — 25 GB free file storage |

`SECRET_KEY` can be any random string (32+ characters). Generate one:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Deploy to Cloud (Free Tier)

All services below have a free tier sufficient for this project.

### Database — Neon.tech

1. Create a project at [neon.tech](https://neon.tech).
2. Copy the connection string (`postgresql://...`).
3. Set it as `DATABASE_URL` in backend `.env`.
4. Run the SQL scripts from `dbscripts/` in Neon's SQL Editor (or use `docker-init/` scripts as reference).

### Backend — Render.com

1. Create a **Web Service** at [render.com](https://render.com).
2. Connect your GitHub repo, set **Root Directory** to `backend`.
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables from `.env.example`.

### Frontend — Vercel

1. Import the repo at [vercel.com](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add env variable: `VITE_API_URL=https://your-backend.onrender.com`
4. Deploy — Vercel auto-detects Vite and builds.

> After deploying, update `FRONTEND_URL` in backend env to your Vercel URL for CORS to work.

---

## Documentation

| File | Description |
|---|---|
| `README.en.md` | This file — overview and quick start |
| `README.ru.md` | Russian version |
| `USER_GUIDE.md` | Detailed user guide for all features |
| `architecture.md` | Technical architecture, DB schema, AI flows |
| `plan.md` | Original implementation plan |
