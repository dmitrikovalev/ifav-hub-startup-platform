-- =============================================================
-- 02_tables.sql  (Docker entrypoint auto-run script)
-- Creates all tables in startupdb
-- =============================================================

-- In Docker all objects are owned by postgres (no separate app user needed)

-- ─────────────────────────────────────────────────────────────
-- TABLE: users
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255),
    role            VARCHAR(50)  NOT NULL DEFAULT 'founder',  -- founder | investor | admin
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);

-- ─────────────────────────────────────────────────────────────
-- TABLE: startups
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS startups (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    industry        VARCHAR(100),           -- fintech | healthtech | edtech | saas | ...
    stage           VARCHAR(50),            -- idea | mvp | seed | series_a | series_b
    funding_goal    NUMERIC(15, 2),
    current_funding NUMERIC(15, 2)  NOT NULL DEFAULT 0,
    team_size       INTEGER,
    location        VARCHAR(255),
    website         VARCHAR(500),
    logo_url        VARCHAR(500),
    pitch_deck_url  VARCHAR(500),
    ai_score        NUMERIC(5, 2),          -- 0.00 – 100.00
    ai_evaluation   JSONB,                  -- {score, strengths[], weaknesses[], suggestions[], ...}
    embedding       VECTOR(768),            -- models/gemini-embedding-001 output (768-dim)
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ix_startups_name     ON startups (name);
CREATE INDEX IF NOT EXISTS ix_startups_industry ON startups (industry);
CREATE INDEX IF NOT EXISTS ix_startups_stage    ON startups (stage);

-- HNSW index for fast approximate cosine similarity search
CREATE INDEX IF NOT EXISTS ix_startups_embedding_hnsw
    ON startups
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- ─────────────────────────────────────────────────────────────
-- TABLE: investors
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investors (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    firm            VARCHAR(255),
    bio             TEXT,
    investment_focus TEXT,
    industries      TEXT[],                 -- array: {'fintech','healthtech'}
    stages          TEXT[],                 -- array: {'seed','series_a'}
    min_investment  NUMERIC(15, 2),
    max_investment  NUMERIC(15, 2),
    portfolio_count INTEGER      NOT NULL DEFAULT 0,
    location        VARCHAR(255),
    linkedin_url    VARCHAR(500),
    avatar_url      VARCHAR(500),
    embedding       VECTOR(768),            -- models/gemini-embedding-001 output (768-dim)
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ix_investors_name ON investors (name);

-- HNSW index for fast approximate cosine similarity search
CREATE INDEX IF NOT EXISTS ix_investors_embedding_hnsw
    ON investors
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- ─────────────────────────────────────────────────────────────
-- TABLE: deals
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deals (
    id             SERIAL PRIMARY KEY,
    startup_id     INTEGER      NOT NULL REFERENCES startups(id)  ON DELETE CASCADE,
    investor_id    INTEGER               REFERENCES investors(id) ON DELETE SET NULL,
    title          VARCHAR(255) NOT NULL,
    amount         NUMERIC(15, 2),
    stage          VARCHAR(50)  NOT NULL DEFAULT 'lead',
    -- lead | qualified | proposal | negotiation | closed_won | closed_lost
    probability    INTEGER      NOT NULL DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
    expected_close DATE,
    notes          TEXT,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ix_deals_startup_id  ON deals (startup_id);
CREATE INDEX IF NOT EXISTS ix_deals_investor_id ON deals (investor_id);
CREATE INDEX IF NOT EXISTS ix_deals_stage       ON deals (stage);

-- ─────────────────────────────────────────────────────────────
-- TABLE: events
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
    id            SERIAL PRIMARY KEY,
    title         VARCHAR(255) NOT NULL,
    description   TEXT,
    event_type    VARCHAR(50),              -- meetup | demo_day | webinar | conference | workshop
    location      VARCHAR(500),
    is_online     BOOLEAN      NOT NULL DEFAULT FALSE,
    meeting_url   VARCHAR(500),
    start_time    TIMESTAMPTZ  NOT NULL,
    end_time      TIMESTAMPTZ,
    max_attendees INTEGER,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_events_start_time ON events (start_time);

-- ─────────────────────────────────────────────────────────────
-- TABLE: documents
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
    id          SERIAL PRIMARY KEY,
    startup_id  INTEGER      NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    filename    VARCHAR(255) NOT NULL,
    file_url    VARCHAR(500) NOT NULL,
    doc_type    VARCHAR(50)  NOT NULL DEFAULT 'pitch_deck',
    -- pitch_deck | financial_model | term_sheet
    ai_analysis JSONB,                      -- LangChain analysis result
    status      VARCHAR(20)  NOT NULL DEFAULT 'pending',
    -- pending | analyzing | done | failed
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_documents_startup_id ON documents (startup_id);
CREATE INDEX IF NOT EXISTS ix_documents_status     ON documents (status);

-- In Docker all tables are owned by postgres

\echo ''
\echo '>>> All tables created successfully:'
\echo '    users, startups, investors, deals, events, documents'
\echo '>>> HNSW vector indexes created on startups.embedding and investors.embedding'
