# Startup Ecosystem Platform — Implementation Plan

> Based on: `architecture.md`  
> Stack: FastAPI · PostgreSQL + pgvector · LangChain · Gemini 2.5 Flash Lite · React 19 · Tailwind CSS

---

## Phases Overview

| Phase | Scope | Key Output |
|---|---|---|
| **1** | Project setup & tooling | Runnable empty shell (backend + frontend) |
| **2** | Database layer | All models, migrations, pgvector ready |
| **3** | Auth | JWT register/login, protected routes |
| **4** | Core CRUD APIs | Startups, Investors, Deals, Events, Documents |
| **5** | Vector service | Embeddings via gemini-embedding-001 + pgvector search |
| **6** | AI service | LangChain chains: pitch analysis, investor match, chat |
| **7** | Frontend layout | Sidebar + content area + right panel |
| **8** | Frontend pages | All 10 pages wired to the API |
| **9** | Integration & polish | End-to-end flows, seed data, error handling |
| **10** | Deploy | Render + Vercel + Neon.tech |

---

## Phase 1 — Project Setup & Tooling

### 1.1 Repository structure
- [ ] Create root folder `startup-platform/`
- [ ] Create `backend/` and `frontend/` subfolders
- [ ] Add root `.gitignore` (Python + Node)
- [ ] Initialize git repository

### 1.2 Backend bootstrap
- [ ] Create Python virtual environment (`venv`)
- [ ] Create `backend/requirements.txt` with all dependencies:
  ```
  fastapi
  uvicorn[standard]
  sqlalchemy
  alembic
  psycopg2-binary
  pgvector
  pydantic[email]
  pydantic-settings
  python-jose[cryptography]
  passlib[bcrypt]
  python-multipart
  langchain
  langchain-google-genai
  langchain-community
  pypdf
  httpx
  python-dotenv
  cloudinary
  ```
- [ ] Create `backend/app/__init__.py`
- [ ] Create `backend/app/main.py` — FastAPI app with CORS, router includes, lifespan
- [ ] Create `backend/app/config.py` — `Settings` class via `pydantic-settings`, reads `.env`
- [ ] Create `backend/.env.example` with all required keys
- [ ] Verify: `uvicorn app.main:app --reload` starts on port 8000
- [ ] Verify: `GET /` returns `{"status": "ok"}`

### 1.3 Frontend bootstrap
- [ ] Scaffold with Vite: `npm create vite@latest frontend -- --template react-ts`
- [ ] Install dependencies:
  ```
  tailwindcss postcss autoprefixer
  react-router-dom
  @tanstack/react-query
  axios
  lucide-react
  recharts
  clsx
  ```
- [ ] Configure Tailwind CSS (`tailwind.config.js`, `postcss.config.js`)
- [ ] Configure `vite.config.ts` — proxy `/api` → `http://localhost:8000`
- [ ] Verify: `npm run dev` starts on port 5173

---

## Phase 2 — Database Layer

### 2.1 Database connection
- [ ] Create `backend/app/database.py`:
  - SQLAlchemy engine with `DATABASE_URL` from config
  - `SessionLocal` factory
  - `Base` declarative base
  - `get_db()` dependency (yields session)
  - On startup: `CREATE EXTENSION IF NOT EXISTS vector`

### 2.2 SQLAlchemy models

**`backend/app/models/user.py`**
- [ ] Fields: `id`, `email` (unique), `hashed_password`, `full_name`, `role`, `is_active`, `created_at`

**`backend/app/models/startup.py`**
- [ ] Fields: `id`, `name`, `description`, `industry`, `stage`, `funding_goal`, `current_funding`, `team_size`, `location`, `website`, `logo_url`, `pitch_deck_url`, `ai_score`, `ai_evaluation` (JSONB), `embedding` (`Vector(768)`), `created_at`, `updated_at`
- [ ] HNSW index: `USING hnsw (embedding vector_cosine_ops)`

**`backend/app/models/investor.py`**
- [ ] Fields: `id`, `name`, `firm`, `bio`, `investment_focus`, `industries` (ARRAY), `stages` (ARRAY), `min_investment`, `max_investment`, `portfolio_count`, `location`, `linkedin_url`, `avatar_url`, `embedding` (`Vector(768)`), `created_at`, `updated_at`
- [ ] HNSW index: `USING hnsw (embedding vector_cosine_ops)`

**`backend/app/models/deal.py`**
- [ ] Fields: `id`, `startup_id` (FK), `investor_id` (FK nullable), `title`, `amount`, `stage`, `probability`, `expected_close`, `notes`, `created_at`, `updated_at`
- [ ] Stage enum: `lead → qualified → proposal → negotiation → closed_won → closed_lost`

**`backend/app/models/event.py`**
- [ ] Fields: `id`, `title`, `description`, `event_type`, `location`, `is_online`, `meeting_url`, `start_time`, `end_time`, `max_attendees`, `created_at`

**`backend/app/models/document.py`**
- [ ] Fields: `id`, `startup_id` (FK), `filename`, `file_url`, `doc_type`, `ai_analysis` (JSONB), `status` (`pending / analyzing / done / failed`), `created_at`

- [ ] Create `backend/app/models/__init__.py` — import all models

### 2.3 Alembic migrations
- [ ] Run `alembic init alembic` in `backend/`
- [ ] Configure `alembic/env.py` — import `Base`, set `target_metadata`
- [ ] Generate initial migration: `alembic revision --autogenerate -m "initial"`
- [ ] Apply: `alembic upgrade head`
- [ ] Verify all tables exist in Neon.tech dashboard
- [ ] Verify `vector` extension is enabled

---

## Phase 3 — Authentication

### 3.1 Auth service
- [ ] Create `backend/app/services/auth_service.py`:
  - `hash_password(plain: str) → str`
  - `verify_password(plain: str, hashed: str) → bool`
  - `create_access_token(data: dict) → str` (JWT, HS256)
  - `decode_token(token: str) → dict`
  - `get_current_user(token, db) → User` (FastAPI dependency)

### 3.2 Auth schemas
- [ ] Create `backend/app/schemas/auth.py`:
  - `RegisterRequest`: `email`, `password`, `full_name`, `role`
  - `LoginRequest`: `email`, `password`
  - `TokenResponse`: `access_token`, `token_type`
  - `UserResponse`: `id`, `email`, `full_name`, `role`

### 3.3 Auth router
- [ ] Create `backend/app/routers/auth.py`:
  - `POST /api/auth/register` — create user, hash password, return token
  - `POST /api/auth/login` — verify credentials, return JWT
  - `GET /api/auth/me` — return current user (protected)
- [ ] Register router in `main.py`
- [ ] Test with Swagger UI at `/docs`

---

## Phase 4 — Core CRUD APIs

> Each domain follows the same pattern:  
> **Schema → Router → Register in main.py → Test in /docs**

### 4.1 Startups CRUD

**Schemas** (`backend/app/schemas/startup.py`)
- [ ] `StartupCreate`: all fields except `id`, `ai_score`, `ai_evaluation`, `embedding`, timestamps
- [ ] `StartupUpdate`: all fields optional
- [ ] `StartupResponse`: full model (exclude `embedding` — not serializable to JSON)
- [ ] `StartupListResponse`: `items[]`, `total`, `page`, `per_page`

**Router** (`backend/app/routers/startups.py`)
- [ ] `GET /api/startups` — list with pagination (`skip`, `limit`) and filters (`industry`, `stage`)
- [ ] `POST /api/startups` — create, trigger embedding generation as BackgroundTask
- [ ] `GET /api/startups/{id}` — detail view
- [ ] `PUT /api/startups/{id}` — update, re-trigger embedding if description changed
- [ ] `DELETE /api/startups/{id}` — delete
- [ ] `GET /api/startups/search?q=` — filter by name/description

### 4.2 Investors CRUD

**Schemas** (`backend/app/schemas/investor.py`)
- [ ] `InvestorCreate`, `InvestorUpdate`, `InvestorResponse`, `InvestorListResponse`

**Router** (`backend/app/routers/investors.py`)
- [ ] `GET /api/investors` — list with filters (`industry`, `stage`, `min_investment`)
- [ ] `POST /api/investors` — create, trigger embedding as BackgroundTask
- [ ] `GET /api/investors/{id}` — detail
- [ ] `PUT /api/investors/{id}` — update
- [ ] `DELETE /api/investors/{id}` — delete
- [ ] `GET /api/investors/search?q=` — search by name/firm/focus

### 4.3 Deals CRUD

**Schemas** (`backend/app/schemas/deal.py`)
- [ ] `DealCreate`, `DealUpdate`, `DealResponse` (includes nested startup/investor names)

**Router** (`backend/app/routers/deals.py`)
- [ ] `GET /api/deals` — list with optional filter by `startup_id`, `stage`
- [ ] `POST /api/deals` — create
- [ ] `GET /api/deals/{id}` — detail
- [ ] `PUT /api/deals/{id}` — update stage/probability
- [ ] `DELETE /api/deals/{id}` — delete
- [ ] `GET /api/deals/stats` — count by stage (for Dashboard)

### 4.4 Events CRUD

**Schemas** (`backend/app/schemas/event.py`)
- [ ] `EventCreate`, `EventUpdate`, `EventResponse`

**Router** (`backend/app/routers/events.py`)
- [ ] `GET /api/events` — list, ordered by `start_time`
- [ ] `POST /api/events` — create
- [ ] `GET /api/events/{id}` — detail
- [ ] `PUT /api/events/{id}` — update
- [ ] `DELETE /api/events/{id}` — delete
- [ ] `GET /api/events/upcoming` — next 5 events from now (for right panel)

### 4.5 Documents upload

**Router** (`backend/app/routers/documents.py`)
- [ ] `POST /api/documents/upload` — accept `multipart/form-data` (PDF + `startup_id`)
  - Upload file to Cloudinary
  - Save `Document` record with `status=pending`
  - Trigger `analyze_document` as `BackgroundTask`
  - Return `202 Accepted` with document `id`
- [ ] `GET /api/documents` — list, filter by `startup_id`
- [ ] `GET /api/documents/{id}` — return record including `ai_analysis` and `status`
- [ ] `DELETE /api/documents/{id}` — delete from DB + Cloudinary

---

## Phase 5 — Vector Service

### 5.1 Embedding generation
- [ ] Create `backend/app/services/vector_service.py`:
  ```python
  from langchain_google_genai import GoogleGenerativeAIEmbeddings

  embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
  ```
- [ ] `generate_embedding(text: str) → list[float]` — returns 768-dim vector
- [ ] `update_startup_embedding(startup_id, db)` — fetch startup, generate, save to DB
- [ ] `update_investor_embedding(investor_id, db)` — same for investor

### 5.2 Similarity search
- [ ] `find_matching_investors(startup_description: str, db, limit=10) → list[Investor]`
  - Generate query embedding
  - Run pgvector cosine distance query:
    ```sql
    SELECT *, 1 - (embedding <=> :vec) AS similarity
    FROM investors
    ORDER BY embedding <=> :vec
    LIMIT :limit
    ```
  - Return list of `(Investor, similarity_score)` tuples
- [ ] `find_similar_startups(description: str, db, limit=5) → list[Startup]` — same pattern

### 5.3 AI embedding endpoints
- [ ] Add to `backend/app/routers/ai.py`:
  - `POST /api/ai/embed-startup/{id}` — manually trigger embedding regeneration
  - `POST /api/ai/embed-investor/{id}` — manually trigger embedding regeneration

---

## Phase 6 — AI Service (LangChain)

### 6.1 Setup LangChain + Gemini
- [ ] Create `backend/app/services/ai_service.py`:
  ```python
  from langchain_google_genai import ChatGoogleGenerativeAI

  llm = ChatGoogleGenerativeAI(
      model="gemini-2.5-flash-lite",
      temperature=0.3
  )
  ```

### 6.2 Pitch Deck Analyzer chain
- [ ] Define `PitchEvaluationResult` Pydantic model:
  ```python
  class PitchEvaluationResult(BaseModel):
      score: int           # 0-100
      strengths: list[str]
      weaknesses: list[str]
      suggestions: list[str]
      market_size: str
      business_model: str
      team_assessment: str
      risks: list[str]
  ```
- [ ] Build chain:
  - `PyPDFLoader` → extract text
  - `RecursiveCharacterTextSplitter` (chunk_size=1000, overlap=200)
  - Join first N chunks (stay within token limit)
  - `PromptTemplate` → structured JSON output prompt
  - `llm.with_structured_output(PitchEvaluationResult)`
- [ ] `analyze_pitch_deck(file_path: str) → PitchEvaluationResult`
- [ ] `analyze_pitch_text(text: str) → PitchEvaluationResult` (for direct text input)

### 6.3 Investor Matcher chain
- [ ] `match_investors_for_startup(startup_id, db) → list[MatchResult]`:
  1. Get startup from DB
  2. Call `find_matching_investors(startup.description, db)`
  3. Build prompt: startup summary + investor list
  4. Call Gemini: "Rank these investors for this startup and explain why"
  5. Return `[{investor, similarity_score, explanation}]`

### 6.4 AI Assistant chat
- [ ] `create_chat_chain() → RunnableWithMessageHistory`:
  - System prompt: "You are an expert startup ecosystem assistant..."
  - `ConversationBufferWindowMemory(k=10)`
  - Gemini 2.5 Flash Lite
- [ ] `chat(message: str, session_id: str) → str`
- [ ] Streaming version: `chat_stream(message, session_id) → AsyncGenerator`

### 6.5 AI router endpoints
- [ ] `POST /api/ai/evaluate` — body: `{text: str}` or analyze by `startup_id`
- [ ] `POST /api/ai/match` — body: `{startup_id: int}` → investor matches
- [ ] `POST /api/ai/chat` — body: `{message: str, session_id: str}` → response
- [ ] `GET /api/ai/chat/stream` — SSE streaming chat response

---

## Phase 7 — Frontend Layout

### 7.1 Types
- [ ] Create `frontend/src/types/index.ts`:
  - `Startup`, `Investor`, `Deal`, `Event`, `Document`, `User`
  - `AIEvaluationResult`, `InvestorMatch`, `ChatMessage`
  - `PaginatedResponse<T>`, `ApiError`

### 7.2 API client
- [ ] Create `frontend/src/api/client.ts`:
  - Axios instance with `baseURL: /api`
  - Request interceptor: attach `Authorization: Bearer <token>` from localStorage
  - Response interceptor: redirect to `/login` on 401
- [ ] Create `frontend/src/api/startups.ts`, `investors.ts`, `deals.ts`, `events.ts`, `ai.ts`

### 7.3 Layout components

**`frontend/src/components/layout/Sidebar.tsx`**
- [ ] Fixed left panel, 240px wide
- [ ] Logo at top
- [ ] Navigation items with Lucide icons:
  | Route | Icon | Label |
  |---|---|---|
  | `/` | `LayoutDashboard` | Dashboard |
  | `/startups` | `Rocket` | Startups |
  | `/investors` | `Users` | Investors |
  | `/deal-flow` | `GitPullRequest` | Deal Flow |
  | `/fundraising` | `DollarSign` | Fundraising |
  | `/accelerator` | `Zap` | Accelerator |
  | `/events` | `Calendar` | Events |
  | `/documents` | `FileText` | Documents |
  | `/messages` | `MessageSquare` | Messages |
  | `/ai-assistant` | `Bot` | AI Assistant |
- [ ] Active route highlight (accent color)
- [ ] Collapse button for mobile (optional)

**`frontend/src/components/layout/RightPanel.tsx`**
- [ ] Fixed right panel, 280px wide
- [ ] Top section: **Upcoming Events** — fetches `GET /api/events/upcoming`
  - Each event: date badge + title + type icon
- [ ] Bottom section: **Tasks** — static list with checkboxes (local state)
  - Mark complete, add task, delete task

**`frontend/src/components/layout/Layout.tsx`**
- [ ] Three-column flex/grid layout:
  ```
  [Sidebar 240px] [main flex-1 overflow-y-auto] [RightPanel 280px]
  ```
- [ ] Header bar: logo, page title, user avatar + logout
- [ ] Wrap `<Outlet />` in scrollable center column

### 7.4 Shared UI components

- [ ] `StatCard.tsx` — icon + label + value + optional trend badge
- [ ] `DataTable.tsx` — generic table: columns config + rows + loading skeleton
- [ ] `Modal.tsx` — centered dialog with overlay, `title`, `children`, `onClose`
- [ ] `Badge.tsx` — colored pill: `stage`, `status`, `type` variants
- [ ] `ScoreRing.tsx` — SVG circular progress showing AI score (0–100)
- [ ] `LoadingSpinner.tsx` — centered spinner for async states
- [ ] `EmptyState.tsx` — icon + message when list is empty

---

## Phase 8 — Frontend Pages

### 8.1 Dashboard (`/`)
- [ ] Top row — 3 `StatCard` components (fetched from API):
  - Active Startups: `GET /api/startups` count
  - Investors: `GET /api/investors` count
  - Deals in Pipeline: `GET /api/deals/stats`
- [ ] Deal Pipeline table — `GET /api/deals?limit=5`:
  - Columns: Startup, Investor, Stage, Amount, Probability
  - "View all" link → `/deal-flow`
- [ ] Use TanStack Query for all fetches, show skeleton loaders

### 8.2 Startups (`/startups`)
- [ ] Table/card list of startups with filters (industry, stage)
- [ ] "Add Startup" button → Modal with `StartupCreate` form
- [ ] Each row: name, industry, stage, funding goal, AI score `ScoreRing`
- [ ] "Edit" button → Modal with pre-filled form
- [ ] "Delete" button → confirm dialog
- [ ] "Evaluate with AI" button → `POST /api/ai/evaluate` → show result modal
- [ ] "Find Investors" button → `POST /api/ai/match` → show matched investors

### 8.3 Investors (`/investors`)
- [ ] Card grid of investors (avatar, name, firm, focus, stage range)
- [ ] Filters: industry, stage, investment range
- [ ] "Add Investor" button → Modal form
- [ ] Edit / Delete actions per card
- [ ] "Match Startups" button on each card → vector search

### 8.4 Deal Flow (`/deal-flow`)
- [ ] Kanban board — columns by stage:
  `Lead → Qualified → Proposal → Negotiation → Closed Won / Closed Lost`
- [ ] Drag-and-drop cards between columns (update `PUT /api/deals/{id}`)
- [ ] "Add Deal" button → modal form (select startup + investor)
- [ ] Each card: startup name, amount, probability bar, expected close date

### 8.5 Fundraising (`/fundraising`)
- [ ] Summary stats: total raised, pipeline value, close rate
- [ ] Recharts bar chart: funding by stage
- [ ] Timeline view of deals ordered by `expected_close`
- [ ] Quick add deal form

### 8.6 Accelerator (`/accelerator`)
- [ ] List of accelerator programs (static data + CRUD via deals/events)
- [ ] Program cards: name, cohort, application deadline, status
- [ ] Link to related events and startups

### 8.7 Events (`/events`)
- [ ] List view with date grouping (Today, This Week, Upcoming)
- [ ] Each event: title, type badge, location/online, date range
- [ ] "Add Event" → modal form
- [ ] Edit / Delete per event
- [ ] Recharts or simple calendar for month view

### 8.8 Documents (`/documents`)
- [ ] Upload zone: drag-and-drop PDF, select `startup_id` and `doc_type`
- [ ] Upload progress indicator
- [ ] Document list table: filename, startup, type, status badge, date
- [ ] Status polling: `GET /api/documents/{id}` every 3s while `status=analyzing`
- [ ] Expanded row / modal: show full `ai_analysis` result
  - Score ring + strengths + weaknesses + suggestions

### 8.9 Messages (`/messages`)
- [ ] Two-pane layout: conversation list (left) + chat window (right)
- [ ] Conversations: founder ↔ investor pairs from deals
- [ ] Message bubbles with timestamps
- [ ] Input box with send button
- [ ] (MVP: store messages as static data or simple DB table)

### 8.10 AI Assistant (`/ai-assistant`)
- [ ] Full-page chat interface
- [ ] Message history with user / assistant bubbles
- [ ] Typing indicator while streaming
- [ ] Input box with submit on Enter
- [ ] Quick action buttons: "Evaluate a startup", "Find investors for...", "Explain deal stages"
- [ ] Session ID stored in `sessionStorage`

---

## Phase 9 — Integration & Polish

### 9.1 Seed data
- [ ] Create `backend/seed.py`:
  - 10 sample startups (various industries + stages)
  - 8 sample investors (different focus areas)
  - 5 sample deals
  - 4 upcoming events
  - Generate embeddings for all startups and investors via API
- [ ] Run: `python seed.py`

### 9.2 Error handling
- [ ] Backend: global exception handler → consistent `{detail, code}` JSON
- [ ] Frontend: Axios interceptor → toast notifications on API errors
- [ ] Form validation: display field-level Pydantic errors from API
- [ ] Empty states: show placeholder UI when lists are empty

### 9.3 Loading states
- [ ] TanStack Query `isLoading` → skeleton components in tables/cards
- [ ] Mutations: disable submit button + spinner while pending
- [ ] AI operations: progress indicator with "Analyzing..." message

### 9.4 End-to-end test flows
- [ ] Flow 1: Register → create startup → upload pitch deck → view AI score
- [ ] Flow 2: Create investor → create startup → run AI match → view matched investors
- [ ] Flow 3: Create deal → move through Kanban stages → mark as closed
- [ ] Flow 4: Open AI Assistant → ask about platform data → get streaming response

---

## Phase 10 — Deploy

### 10.1 Neon.tech (Database)
- [ ] Create project at [neon.tech](https://neon.tech)
- [ ] Copy `DATABASE_URL` connection string
- [ ] Run `alembic upgrade head` against Neon DB
- [ ] Run `python seed.py` to populate initial data

### 10.2 Google AI Studio (AI Keys)
- [ ] Get free API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- [ ] Set `GOOGLE_API_KEY` in Render environment

### 10.3 Cloudinary (File Storage)
- [ ] Create free account at [cloudinary.com](https://cloudinary.com)
- [ ] Create upload preset for PDFs
- [ ] Copy `CLOUD_NAME`, `API_KEY`, `API_SECRET`

### 10.4 Render.com (Backend)
- [ ] Create new Web Service → connect GitHub repo
- [ ] Root directory: `backend`
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- [ ] Add all environment variables from `.env.example`
- [ ] Verify `/docs` is accessible on Render URL

### 10.5 Vercel (Frontend)
- [ ] Import repo at [vercel.com](https://vercel.com)
- [ ] Root directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Add env variable: `VITE_API_URL=https://your-app.onrender.com`
- [ ] Update `vite.config.ts` proxy to use `VITE_API_URL` in production
- [ ] Verify site loads and API calls succeed

---

## File Creation Checklist

### Backend files (28 files)
```
backend/
├── requirements.txt                          [ ]
├── .env.example                              [ ]
├── alembic.ini                               [ ]
├── seed.py                                   [ ]
├── alembic/env.py                            [ ]
├── alembic/versions/001_initial.py           [ ]
└── app/
    ├── __init__.py                           [ ]
    ├── main.py                               [ ]
    ├── config.py                             [ ]
    ├── database.py                           [ ]
    ├── models/
    │   ├── __init__.py                       [ ]
    │   ├── user.py                           [ ]
    │   ├── startup.py                        [ ]
    │   ├── investor.py                       [ ]
    │   ├── deal.py                           [ ]
    │   ├── event.py                          [ ]
    │   └── document.py                       [ ]
    ├── schemas/
    │   ├── auth.py                           [ ]
    │   ├── startup.py                        [ ]
    │   ├── investor.py                       [ ]
    │   ├── deal.py                           [ ]
    │   ├── event.py                          [ ]
    │   └── ai.py                             [ ]
    ├── routers/
    │   ├── auth.py                           [ ]
    │   ├── startups.py                       [ ]
    │   ├── investors.py                      [ ]
    │   ├── deals.py                          [ ]
    │   ├── events.py                         [ ]
    │   ├── documents.py                      [ ]
    │   └── ai.py                             [ ]
    └── services/
        ├── auth_service.py                   [ ]
        ├── vector_service.py                 [ ]
        └── ai_service.py                     [ ]
```

### Frontend files (32 files)
```
frontend/
├── index.html                                [ ]
├── package.json                              [ ]
├── vite.config.ts                            [ ]
├── tailwind.config.js                        [ ]
├── postcss.config.js                         [ ]
├── tsconfig.json                             [ ]
└── src/
    ├── main.tsx                              [ ]
    ├── App.tsx                               [ ]
    ├── index.css                             [ ]
    ├── types/index.ts                        [ ]
    ├── api/
    │   ├── client.ts                         [ ]
    │   ├── startups.ts                       [ ]
    │   ├── investors.ts                      [ ]
    │   ├── deals.ts                          [ ]
    │   ├── events.ts                         [ ]
    │   └── ai.ts                             [ ]
    ├── hooks/
    │   ├── useStartups.ts                    [ ]
    │   ├── useInvestors.ts                   [ ]
    │   ├── useDeals.ts                       [ ]
    │   └── useEvents.ts                      [ ]
    ├── components/
    │   ├── layout/
    │   │   ├── Layout.tsx                    [ ]
    │   │   ├── Sidebar.tsx                   [ ]
    │   │   └── RightPanel.tsx                [ ]
    │   └── ui/
    │       ├── StatCard.tsx                  [ ]
    │       ├── DataTable.tsx                 [ ]
    │       ├── Modal.tsx                     [ ]
    │       ├── Badge.tsx                     [ ]
    │       ├── ScoreRing.tsx                 [ ]
    │       ├── LoadingSpinner.tsx            [ ]
    │       └── EmptyState.tsx               [ ]
    └── pages/
        ├── Dashboard.tsx                     [ ]
        ├── Startups.tsx                      [ ]
        ├── Investors.tsx                     [ ]
        ├── DealFlow.tsx                      [ ]
        ├── Fundraising.tsx                   [ ]
        ├── Accelerator.tsx                   [ ]
        ├── Events.tsx                        [ ]
        ├── Documents.tsx                     [ ]
        ├── Messages.tsx                      [ ]
        └── AIAssistant.tsx                   [ ]
```

---

## Dependencies Between Phases

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Database) ──────────────────────────────┐
    │                                            │
    ▼                                            │
Phase 3 (Auth)                                   │
    │                                            │
    ▼                                            ▼
Phase 4 (CRUD APIs) ──────────► Phase 5 (Vector Service)
    │                                            │
    │                                            ▼
    │                              Phase 6 (AI Service)
    │                                            │
    └────────────────────────────────────────────┘
                                                 │
                                                 ▼
                                    Phase 7 (Frontend Layout)
                                                 │
                                                 ▼
                                    Phase 8 (Frontend Pages)
                                                 │
                                                 ▼
                                    Phase 9 (Integration)
                                                 │
                                                 ▼
                                    Phase 10 (Deploy)
```

---

## Estimated Timeline

| Phase | Estimated Time | Notes |
|---|---|---|
| 1 — Setup | 1–2 hrs | One-time, mostly config |
| 2 — Database | 2–3 hrs | Models + migrations |
| 3 — Auth | 1–2 hrs | JWT, straightforward |
| 4 — CRUD APIs | 4–6 hrs | 5 routers × ~1 hr each |
| 5 — Vector Service | 2–3 hrs | Embedding + pgvector query |
| 6 — AI Service | 3–4 hrs | 3 LangChain chains |
| 7 — Frontend Layout | 3–4 hrs | Sidebar + panels + routing |
| 8 — Frontend Pages | 8–12 hrs | 10 pages × ~1 hr each |
| 9 — Integration | 2–3 hrs | Seed data + error handling |
| 10 — Deploy | 1–2 hrs | 3 services to configure |
| **Total** | **~27–41 hrs** | ~1 week solo development |
