# Startup Ecosystem Platform — Architecture

## Overview

MVP platform for founders, investors, startups, and developers.  
Core principles: **free stack**, **AI-first**, **vector search**, **production-ready structure**.

---

## Tech Stack

### Backend
| Component | Technology | Version | Purpose |
|---|---|---|---|
| Web Framework | FastAPI | 0.115+ | Async, auto-docs, Pydantic integration |
| ORM | SQLAlchemy | 2.0 | Synchronous queries, type-safe models |
| Migrations | Alembic | 1.13 | Database schema versioning |
| Validation | Pydantic v2 | 2.9 | Request/response schemas |
| Auth | python-jose + bcrypt | — | JWT tokens, bcrypt password hashing |
| Task Queue | FastAPI BackgroundTasks | built-in | Async PDF analysis |
| PDF Parser | PyPDFLoader (LangChain) | — | Text extraction from pitch decks |

### Database
| Component | Technology | Purpose |
|---|---|---|
| Primary DB | PostgreSQL 16 | Relational data storage |
| Vector Extension | pgvector | Storing and querying embeddings |
| Free Hosting | Neon.tech | Serverless Postgres, pgvector built-in |
| Local Dev | Docker / local Postgres | Offline development |

### AI / Google GenAI
| Component | Technology | Free? | Note |
|---|---|---|---|
| LLM | Google Gemini 2.5 Flash Lite | Yes (free tier, AI Studio) | Cloud API — no local compute |
| Embeddings | models/gemini-embedding-001 | Yes (same API key) | Cloud API — 768-dim vectors, no local model |
| LLM SDK | google-genai (direct SDK) | Yes (open source) | Direct calls to Gemini API; LangChain used only for PDF loading/splitting |
| Vector Similarity | pgvector cosine distance | Yes (pgvector) | Runs in Neon.tech DB, not local |

> **No local models are used.** All AI inference runs via Google AI Studio (cloud).  
> One `GOOGLE_API_KEY` from [aistudio.google.com](https://aistudio.google.com) covers both LLM and embeddings — free tier.

### Frontend
| Component | Technology | Purpose |
|---|---|---|
| Framework | React 19 + Vite | Fast builds, HMR, React Compiler |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Utility-first, dark theme |
| UI Components | Custom Tailwind components | Badge, Modal, ScoreRing, StatCard, EmptyState |
| Routing | React Router v6 | SPA navigation |
| Data Fetching | TanStack Query v5 | Cache, loading states, mutations |
| HTTP Client | Axios | REST calls to FastAPI |
| Charts | Recharts | Dashboard charts |
| Icons | Lucide React | SVG icon library |

### Deploy (all free)
| Service | Purpose | Free Limit |
|---|---|---|
| Render.com | Backend (FastAPI) | 750 hrs/month |
| Vercel | Frontend (React) | Unlimited (hobby plan) |
| Neon.tech | PostgreSQL + pgvector | 512 MB |
| Cloudinary | File Storage (PDF uploads) | 25 GB |

---

## Project Structure

```
startup-platform/
│
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app entry point
│   │   ├── config.py                # Settings (Pydantic BaseSettings)
│   │   ├── database.py              # SQLAlchemy engine, session, Base
│   │   │
│   │   ├── models/                  # SQLAlchemy ORM models
│   │   │   ├── __init__.py
│   │   │   ├── user.py              # User (auth)
│   │   │   ├── startup.py           # Startup + Vector embedding
│   │   │   ├── investor.py          # Investor + Vector embedding
│   │   │   ├── deal.py              # Deal / Pipeline
│   │   │   ├── event.py             # Events
│   │   │   └── document.py          # Uploaded documents (pitch decks)
│   │   │
│   │   ├── schemas/                 # Pydantic v2 schemas
│   │   │   ├── auth.py
│   │   │   ├── startup.py
│   │   │   ├── investor.py
│   │   │   ├── deal.py
│   │   │   ├── event.py
│   │   │   └── ai.py
│   │   │
│   │   ├── routers/                 # FastAPI routers
│   │   │   ├── auth.py              # POST /auth/register, /auth/login
│   │   │   ├── startups.py          # CRUD /startups
│   │   │   ├── investors.py         # CRUD /investors
│   │   │   ├── deals.py             # CRUD /deals
│   │   │   ├── events.py            # CRUD /events
│   │   │   ├── documents.py         # POST /documents/upload
│   │   │   └── ai.py                # POST /ai/evaluate, /ai/match, /ai/chat
│   │   │
│   │   └── services/
│   │       ├── ai_service.py        # google.genai SDK: pitch eval, investor match, chat
│   │       ├── vector_service.py    # Embeddings + pgvector similarity search
│   │       └── auth_service.py      # JWT + bcrypt
│   │
│   ├── tests/                       # pytest test suite
│   │   ├── conftest.py              # DB fixtures, TestClient, auth helpers
│   │   ├── test_schemas.py          # Pydantic validation tests
│   │   ├── test_auth_service.py     # bcrypt + JWT tests
│   │   ├── test_ai_service.py       # Prompt generation, JSON parsing (mock LLM)
│   │   ├── test_api_auth.py         # Auth endpoint tests
│   │   ├── test_api_startups.py     # Startups CRUD tests
│   │   ├── test_api_deals.py        # Deals CRUD + stats tests
│   │   └── test_api_events.py       # Events CRUD tests
│   │
│   ├── alembic/                     # DB migrations
│   │   ├── versions/
│   │   └── env.py
│   │
│   ├── requirements.txt
│   ├── pytest.ini
│   ├── .env.example
│   └── alembic.ini
│
└── frontend/
    ├── src/
    │   ├── main.tsx                 # React entry point
    │   ├── App.tsx                  # Router setup
    │   ├── index.css                # Global styles + Tailwind
    │   │
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Layout.tsx       # Root layout (sidebar + content + right panel)
    │   │   │   ├── Sidebar.tsx      # Left vertical menu
    │   │   │   └── RightPanel.tsx   # Right panel (Events + Tasks)
    │   │   └── ui/                  # Shared UI components
    │   │       ├── StatCard.tsx
    │   │       ├── Modal.tsx
    │   │       ├── Badge.tsx
    │   │       ├── ScoreRing.tsx    # AI score circular display
    │   │       ├── LoadingSpinner.tsx
    │   │       └── EmptyState.tsx
    │   │
    │   ├── pages/
    │   │   ├── Login.tsx            # Auth: login + registration
    │   │   ├── Dashboard.tsx        # Stats + Deal Pipeline
    │   │   ├── Startups.tsx         # Startup list + CRUD + AI score
    │   │   ├── Investors.tsx        # Investor list + CRUD + vector match
    │   │   ├── DealFlow.tsx         # Kanban pipeline
    │   │   ├── Fundraising.tsx      # Funding rounds tracking
    │   │   ├── Accelerator.tsx      # Accelerator programs
    │   │   ├── Events.tsx           # Events CRUD
    │   │   ├── Documents.tsx        # PDF upload + AI analysis
    │   │   ├── Messages.tsx         # Networking messages (UI mock)
    │   │   └── AIAssistant.tsx      # Chat interface (google.genai)
    │   │
    │   ├── api/
    │   │   ├── client.ts            # Axios instance + interceptors
    │   │   ├── startups.ts          # Startup API calls
    │   │   ├── investors.ts         # Investor API calls
    │   │   ├── deals.ts             # Deals API calls
    │   │   ├── events.ts            # Events API calls
    │   │   └── ai.ts                # AI + Documents API calls
    │   │
    │   ├── utils/
    │   │   ├── format.ts            # Shared currency formatting
    │   │   └── format.test.ts       # vitest tests
    │   │
    │   └── types/
    │       └── index.ts             # TypeScript interfaces
    │
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── vitest.config.ts
    ├── tailwind.config.js
    └── tsconfig.json
│
├── docker-compose.yml           # PostgreSQL 16 + pgvector (Docker)
├── docker-init/                 # Auto-init SQL for Docker entrypoint
├── .gitignore
├── README.en.md
└── README.ru.md
```

---

## Database Schema

### Table: `startups`
```sql
CREATE TABLE startups (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    industry        VARCHAR(100),          -- fintech, healthtech, edtech...
    stage           VARCHAR(50),           -- idea, mvp, seed, series_a, series_b
    funding_goal    DECIMAL(15,2),
    current_funding DECIMAL(15,2) DEFAULT 0,
    team_size       INTEGER,
    location        VARCHAR(255),
    website         VARCHAR(500),
    logo_url        VARCHAR(500),
    pitch_deck_url  VARCHAR(500),
    ai_score        DECIMAL(5,2),          -- 0.00 - 100.00
    ai_evaluation   JSONB,                 -- {strengths, weaknesses, suggestions, market_size}
    embedding       VECTOR(768),           -- models/gemini-embedding-001 (cloud API, 768-dim output)
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);

CREATE INDEX ON startups USING hnsw (embedding vector_cosine_ops);
```

### Table: `investors`
```sql
CREATE TABLE investors (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    firm            VARCHAR(255),
    bio             TEXT,
    investment_focus TEXT,                 -- description of investment interests
    industries      VARCHAR[],             -- ['fintech', 'healthtech']
    stages          VARCHAR[],             -- ['seed', 'series_a']
    min_investment  DECIMAL(15,2),
    max_investment  DECIMAL(15,2),
    portfolio_count INTEGER DEFAULT 0,
    location        VARCHAR(255),
    linkedin_url    VARCHAR(500),
    avatar_url      VARCHAR(500),
    embedding       VECTOR(768),           -- models/gemini-embedding-001 (cloud API, 768-dim output)
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);

CREATE INDEX ON investors USING hnsw (embedding vector_cosine_ops);
```

### Table: `deals`
```sql
CREATE TABLE deals (
    id              SERIAL PRIMARY KEY,
    startup_id      INTEGER REFERENCES startups(id) ON DELETE CASCADE,
    investor_id     INTEGER REFERENCES investors(id) ON DELETE SET NULL,
    title           VARCHAR(255) NOT NULL,
    amount          DECIMAL(15,2),
    stage           VARCHAR(50) NOT NULL,  -- lead, qualified, proposal, negotiation, closed_won, closed_lost
    probability     INTEGER NOT NULL,      -- 0-100%  CHECK (probability >= 0 AND probability <= 100)
    expected_close  DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);
```

### Table: `events`
```sql
CREATE TABLE events (
    id            SERIAL PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    event_type    VARCHAR(50),             -- meetup, demo_day, webinar, conference
    location      VARCHAR(500),
    is_online     BOOLEAN DEFAULT FALSE,
    meeting_url   VARCHAR(500),
    start_time    TIMESTAMPTZ NOT NULL,
    end_time      TIMESTAMPTZ,
    max_attendees INTEGER,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `documents`
```sql
CREATE TABLE documents (
    id          SERIAL PRIMARY KEY,
    startup_id  INTEGER REFERENCES startups(id) ON DELETE CASCADE,
    filename    VARCHAR(255) NOT NULL,
    file_url    VARCHAR(500) NOT NULL,
    doc_type    VARCHAR(50) DEFAULT 'pitch_deck',  -- pitch_deck, financial_model, term_sheet
    ai_analysis JSONB,                             -- AI analysis result (score, strengths, etc.)
    status      VARCHAR(20) DEFAULT 'pending',     -- pending, analyzing, done, failed
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `users`
```sql
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255),
    role            VARCHAR(50) NOT NULL DEFAULT 'founder',  -- founder, investor, admin
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);
```

---

## AI Architecture

### 1. Pitch Deck Analyzer

```
PDF Upload
    │
    ▼
PyPDFLoader (LangChain)
    │ extracted text
    ▼
RecursiveCharacterTextSplitter (LangChain)
    │ chunks (1000 chars, overlap 200)
    ▼
google.genai generate_content()
    │ f-string prompt:
    │   "Analyze this startup pitch deck.
    │    Return JSON: score(0-100), strengths[],
    │    weaknesses[], suggestions[], market_size,
    │    business_model, team_assessment, risks[]"
    ▼
Gemini 2.5 Flash Lite (Google AI Studio — cloud)
    │
    ▼
json.loads() → PitchEvaluationResult (Pydantic)
    │
    ▼
Save to DB: startup.ai_score, startup.ai_evaluation
```

### 2. Investor Matcher (Vector RAG)

```
Startup Description (text)
    │
    ▼
gemini-embedding-001 via google.genai embed_content() (cloud API)
    │ embedding: VECTOR(768)
    ▼
pgvector Cosine Similarity Search (parameterized query)
    SELECT id, 1 - (embedding <=> :qvec::vector) AS similarity
    FROM investors WHERE embedding IS NOT NULL
    ORDER BY embedding <=> :qvec::vector
    LIMIT :lim;
    │ top-N matching investors (single IN query)
    ▼
google.genai generate_content()
    │ "Explain why these investors match this startup."
    ▼
Gemini 2.5 Flash Lite (cloud)
    │
    ▼
json.loads() → [{investor_id, explanation}]
```

### 3. AI Assistant (Chat)

```
User Message
    │
    ▼
Manual conversation history (in-memory dict, last 10 exchanges)
    │ + System instruction: startup advisor persona
    ▼
google.genai generate_content() with contents=[history + message]
    ▼
Gemini 2.5 Flash Lite (cloud)
    │
    ▼
Synchronous JSON response
```

---

## API Endpoints

### Auth
```
POST   /api/auth/register     — register a new user
POST   /api/auth/login        — obtain JWT token
GET    /api/auth/me           — current authenticated user
```

### Startups
```
GET    /api/startups          — list (pagination + filters)
POST   /api/startups          — create startup
GET    /api/startups/{id}     — startup details
PUT    /api/startups/{id}     — update startup
DELETE /api/startups/{id}     — delete startup
GET    /api/startups/search   — full-text search
```

### Investors
```
GET    /api/investors         — list
POST   /api/investors         — create investor profile
GET    /api/investors/{id}    — investor details
PUT    /api/investors/{id}    — update
DELETE /api/investors/{id}    — delete
GET    /api/investors/search  — search
```

### Deals
```
GET    /api/deals             — all deals (pipeline), filter by ?stage=
POST   /api/deals             — create deal
GET    /api/deals/stats       — pipeline statistics
GET    /api/deals/{id}        — deal details
PUT    /api/deals/{id}        — update stage/status
DELETE /api/deals/{id}        — delete
```

### Events
```
GET    /api/events            — list events
POST   /api/events            — create event
GET    /api/events/{id}       — event details
PUT    /api/events/{id}       — update
DELETE /api/events/{id}       — delete
GET    /api/events/upcoming   — upcoming events (for right panel)
```

### Documents
```
POST   /api/documents/upload  — upload PDF (multipart/form-data)
GET    /api/documents         — list documents
GET    /api/documents/{id}    — details + AI analysis result
DELETE /api/documents/{id}    — delete
```

### AI
```
POST   /api/ai/evaluate       — analyze pitch deck text → score + suggestions
POST   /api/ai/match          — find investors for a startup (vector search)
POST   /api/ai/chat           — chat with AI assistant
POST   /api/ai/embed-startup  — generate and store startup embedding
POST   /api/ai/embed-investor — generate and store investor embedding
```

---

## UI Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER — Logo + User Menu                                          │
├────────────┬────────────────────────────────────┬───────────────────┤
│            │                                    │                   │
│  SIDEBAR   │          CONTENT AREA              │   RIGHT PANEL     │
│  240px     │          (flexible)                │   280px           │
│            │                                    │                   │
│ ● Dashboard│  [Dashboard Example]               │ ┌───────────────┐ │
│   Startups │  ┌──────────┐┌─────────┐┌───────┐ │ │ Upcoming      │ │
│   Investors│  │ Active   ││Investors││Deals  │ │ │ Events        │ │
│   Deal Flow│  │ Startups ││  48     ││in Pipe│ │ │               │ │
│   Fundrais.│  │   124    ││        ││  32   │ │ │ Mar 15 ──────│ │
│   Accelera.│  └──────────┘└─────────┘└───────┘ │ │ Demo Day     │ │
│   Events   │                                    │ │               │ │
│   Documents│  Deal Pipeline          [View all] │ │ Mar 18 ──────│ │
│   Messages │  ┌────────────────────────────┐    │ │ Pitch Comp.  │ │
│ ● AI Assist│  │ Startup  Stage  Amount  %  │    │ └───────────────┘ │
│            │  │ TechFlow  Seed  $500K  80% │    │ ┌───────────────┐ │
│            │  │ HealthAI  A     $2M    60% │    │ │ Tasks         │ │
│            │  │ EduStart  Idea  $100K  40% │    │ │               │ │
│            │  └────────────────────────────┘    │ │ ☐ Review deck │ │
│            │                                    │ │ ☐ Call John   │ │
│            │                                    │ │ ☑ Send docs   │ │
└────────────┴────────────────────────────────────┴───────────────────┘
```

---

## Data Flow: Pitch Deck AI Evaluation

```
User                Frontend              FastAPI              AI Service
 │                     │                    │                      │
 │ Upload PDF           │                   │                      │
 │─────────────────────►│                   │                      │
 │                      │ POST /documents/upload                   │
 │                      │──────────────────►│                      │
 │                      │                   │ BackgroundTask:      │
 │                      │ 202 Accepted       │─────────────────────►│
 │◄─────────────────────│                   │                      │
 │ "Analyzing..."        │                   │ PyPDFLoader          │
│                      │                   │ google.genai SDK     │
│                      │                   │ Gemini 2.5 Flash Lite│
 │                      │                   │◄─────────────────────│
 │                      │                   │ Save to DB           │
 │ GET /documents/{id}   │                   │                      │
 │─────────────────────►│                   │                      │
 │                      │──────────────────►│                      │
 │                      │◄──────────────────│                      │
 │ Score: 78/100         │                   │                      │
 │ Strengths/Weaknesses  │                   │                      │
 │ Suggestions           │                   │                      │
```

---

## Vector Search Flow: Investor Matching

```
Step 1 — Indexing (on create/update):
  Investor.investment_focus → models/gemini-embedding-001 (API call) → VECTOR(768) → saved in investors.embedding

Step 2 — Query (find investors for a startup):
  Startup.description → models/gemini-embedding-001 (API call) → query_vector

  SELECT id, name, firm,
         1 - (embedding <=> query_vector) AS similarity
  FROM investors
  ORDER BY embedding <=> query_vector
  LIMIT 10;

  Result → google.genai → Gemini 2.5 Flash Lite → match explanation with ranking
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host/dbname

# AI — single key for both Gemini 2.5 Flash Lite (LLM) and gemini-embedding-001 (embeddings)
# Get free key at: https://aistudio.google.com/apikey
GOOGLE_API_KEY=AIza...

# Auth
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# File Storage
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# App
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

---

## Setup & Run

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt

copy .env.example .env         # fill in your values

uvicorn app.main:app --reload --reload-exclude venv --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                    # http://localhost:5173
```

### API Docs
```
http://localhost:8000/docs     # Swagger UI (auto-generated)
http://localhost:8000/redoc    # ReDoc
```

---

## Testing

### Backend (pytest)
| Suite | File | Tests | What it covers |
|---|---|---|---|
| Schema validation | `test_schemas.py` | 30 | Pydantic v2 schemas: required fields, types, constraints |
| Auth service | `test_auth_service.py` | 11 | bcrypt hashing, JWT create/decode/expiry |
| AI service | `test_ai_service.py` | 14 | Prompt generation, JSON parsing, chat history (mocked LLM) |
| Auth API | `test_api_auth.py` | 11 | Register, login, /me endpoint integration |
| Startups API | `test_api_startups.py` | 11 | CRUD + search endpoints (mocked embedding) |
| Deals API | `test_api_deals.py` | 11 | CRUD + stats endpoints |
| Events API | `test_api_events.py` | 9 | CRUD endpoints |

All API tests use transactional rollback: each test runs inside a DB transaction that is rolled back afterwards, keeping the database clean.

### Frontend (vitest)
| Suite | File | Tests | What it covers |
|---|---|---|---|
| Format utility | `format.test.ts` | 8 | Currency formatting ($, K, M, null) |

**Total: 105 tests (97 backend + 8 frontend)**

```bash
# Run backend tests
cd backend && python -m pytest tests/ -v

# Run frontend tests
cd frontend && npm test
```

---

## Key Design Decisions

| Decision | Chosen | Alternative | Reason |
|---|---|---|---|
| Vector DB | pgvector (PostgreSQL) | Pinecone, Weaviate | Single DB, no extra service, Neon.tech supports it free |
| Embeddings | models/gemini-embedding-001 (cloud) | sentence-transformers (local) | No local model download, no RAM/CPU cost on laptop, free API |
| LLM | Gemini 2.5 Flash Lite (cloud) | Groq / OpenAI | Free tier via AI Studio, fast, no local inference |
| Single API key | GOOGLE_API_KEY for LLM + embeddings | Two separate keys | One key covers both services — simpler setup |
| Vector dimensions | 768 (gemini-embedding-001) | 384 (MiniLM local) | Better semantic quality, supports 768 or 3072 output |
| Vector Index | HNSW | IVFFlat | Better recall, no need to pre-specify list count |
| AI analysis async | BackgroundTasks | Celery + Redis | No extra infrastructure, sufficient for MVP scale |
| AI result storage | JSONB | Separate table | Flexible schema, LLM output structure can evolve |
| React version | React 19 | React 18 | React Compiler, improved concurrent features, Actions API |

---

## Local vs Cloud: Resource Audit

| Component | Runs Where | RAM Usage | Works on Slow Laptop? |
|---|---|---|---|
| FastAPI server | Local | ~80 MB | Yes |
| PostgreSQL (Neon.tech) | Cloud | 0 MB local | Yes |
| Gemini 2.5 Flash Lite | Cloud (Google) | 0 MB local | Yes |
| models/gemini-embedding-001 | Cloud (Google) | 0 MB local | Yes |
| React dev server (Vite) | Local | ~150 MB | Yes |
| **Total local RAM** | — | **~230 MB** | **Yes** |

> No local AI models. No Ollama. No sentence-transformers. No FAISS index in memory.  
> The laptop only runs FastAPI + Vite. All heavy compute happens in the cloud.
